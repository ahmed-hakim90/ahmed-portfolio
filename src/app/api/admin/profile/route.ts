import { getAdminSession } from "@/lib/admin-request";
import { getAdminUserById, updateAdminUserSlug } from "@/lib/admin-users";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getAdminUserById(session.sub);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: user.id,
    username: user.username,
    role: user.role,
    slug: user.slug,
  });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const slug = typeof body.slug === "string" ? body.slug : "";
  const updated = await updateAdminUserSlug(session.sub, slug);
  if (!updated.ok) {
    return NextResponse.json({ error: updated.error }, { status: 400 });
  }
  revalidatePath(`/${updated.slug}`, "layout");
  return NextResponse.json({ ok: true, slug: updated.slug });
}
