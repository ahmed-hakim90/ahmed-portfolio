import { getAdminSession } from "@/lib/admin-request";
import {
  getAdminUserById,
  isSlugAllowed,
  isSlugTaken,
  normalizeSlug,
} from "@/lib/admin-users";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getAdminUserById(session.sub);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const raw = typeof searchParams.get("slug") === "string" ? searchParams.get("slug")! : "";
  const normalized = normalizeSlug(raw);

  if (normalized === user.slug) {
    return NextResponse.json({
      normalized,
      detail: "yours" as const,
    });
  }

  if (!isSlugAllowed(normalized)) {
    return NextResponse.json({
      normalized,
      detail: "invalid" as const,
    });
  }

  const taken = await isSlugTaken(normalized, session.sub);
  if (taken) {
    return NextResponse.json({
      normalized,
      detail: "taken" as const,
    });
  }

  return NextResponse.json({
    normalized,
    detail: "available" as const,
  });
}
