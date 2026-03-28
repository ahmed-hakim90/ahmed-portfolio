import type { SiteJson } from "@/data/site-defaults";
import { getAdminSession } from "@/lib/admin-request";
import { getAdminUserById } from "@/lib/admin-users";
import { validateSiteForSave } from "@/lib/site-validation";
import {
  getEffectiveSiteJsonForUser,
  saveUserSiteJson,
} from "@/lib/site-data";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidSitePayload(body: unknown): body is SiteJson {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === "string" &&
    typeof b.url === "string" &&
    Array.isArray(b.navbar) &&
    b.contact !== null &&
    typeof b.contact === "object" &&
    Array.isArray(b.skills) &&
    Array.isArray(b.work) &&
    Array.isArray(b.education) &&
    Array.isArray(b.projects)
  );
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await getEffectiveSiteJsonForUser(session.sub);
  return NextResponse.json(json);
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    if (!isValidSitePayload(body)) {
      return NextResponse.json({ error: "Invalid site JSON" }, { status: 400 });
    }
    const validationErrors = validateSiteForSave(body);
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        { error: "بيانات الموقع غير مكتملة أو غير صحيحة.", details: validationErrors },
        { status: 400 },
      );
    }
    const saved = await saveUserSiteJson(session.sub, body);
    if (!saved.ok) {
      return NextResponse.json({ error: saved.error }, { status: 500 });
    }
    revalidatePath("/", "layout");
    revalidatePath("/portfolio", "layout");
    revalidatePath("/blog", "layout");
    const owner = await getAdminUserById(session.sub);
    const publicSlug = owner?.slug ?? session.username;
    revalidatePath(`/${publicSlug}`, "layout");
    revalidatePath(`/${publicSlug}/blog`, "layout");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/admin/site:", e);
    const message = e instanceof Error ? e.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
