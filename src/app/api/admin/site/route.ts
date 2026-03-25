import type { SiteJson } from "@/data/site-defaults";
import { getAdminSession } from "@/lib/admin-request";
import {
  getEffectiveSiteJsonForUser,
  saveUserSiteJson,
} from "@/lib/site-data";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function isValidSitePayload(body: unknown): body is Partial<SiteJson> {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === "string" &&
    typeof b.url === "string" &&
    Array.isArray(b.navbar) &&
    b.contact !== null &&
    typeof b.contact === "object"
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
    const saved = await saveUserSiteJson(session.sub, body);
    if (!saved.ok) {
      return NextResponse.json({ error: saved.error }, { status: 500 });
    }
    revalidatePath("/", "layout");
    revalidatePath("/portfolio", "layout");
    revalidatePath("/blog", "layout");
    revalidatePath(`/${session.username}`, "layout");
    revalidatePath(`/${session.username}/blog`, "layout");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/admin/site:", e);
    const message = e instanceof Error ? e.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
