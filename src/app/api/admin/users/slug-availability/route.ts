import { isOwnerAuthenticated } from "@/lib/admin-request";
import {
  isSlugAllowed,
  isSlugTaken,
  normalizeSlug,
} from "@/lib/admin-users";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isOwnerAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const raw =
    typeof searchParams.get("slug") === "string"
      ? searchParams.get("slug")!
      : "";
  const normalized = normalizeSlug(raw);

  if (!isSlugAllowed(normalized)) {
    return NextResponse.json({
      normalized,
      detail: "invalid" as const,
    });
  }

  const taken = await isSlugTaken(normalized);
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
