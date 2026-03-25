import { expect, test } from "@playwright/test";

test.describe("public shell and print", () => {
  test("marketing home has no top promo bar; portfolio still shows it", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("site-top-bar")).toHaveCount(0);
    await page.goto("/portfolio");
    await expect(page.getByTestId("site-top-bar")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /إنشاء حساب/ }),
    ).toBeVisible();
  });

  test("portfolio hides dock and top bar under print media", async ({
    page,
  }) => {
    await page.goto("/portfolio");
    await expect(page.getByTestId("site-dock")).toBeVisible();
    await page.emulateMedia({ media: "print" });
    await expect(page.getByTestId("site-dock")).toBeHidden();
    await expect(page.getByTestId("site-top-bar")).toBeHidden();
  });

  test("public stats API returns expected shape", async ({ request }) => {
    const res = await request.get("/api/public/stats");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toMatchObject({
      projectCards: expect.any(Number),
      blogPosts: expect.any(Number),
    });
    expect(
      data.users === null || typeof data.users === "number",
    ).toBeTruthy();
  });
});
