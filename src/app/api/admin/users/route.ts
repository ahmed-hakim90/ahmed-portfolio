import { isOwnerAuthenticated } from "@/lib/admin-request";
import { createAdminUserWithFirebaseAuth, listAdminUsers } from "@/lib/admin-users";
import { getUserSiteJsonFromFirestore } from "@/lib/site-data";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isOwnerAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await listAdminUsers();
  const withPhone = await Promise.all(
    users.map(async (u) => {
      const json = await getUserSiteJsonFromFirestore(u.id);
      const raw = json?.contact?.tel?.trim();
      return {
        ...u,
        phone: raw && raw.length > 0 ? raw : null,
      };
    }),
  );
  return NextResponse.json(withPhone);
}

export async function POST(request: Request) {
  if (!(await isOwnerAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  const created = await createAdminUserWithFirebaseAuth(
    email,
    password,
    "client",
  );
  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: created.id });
}
