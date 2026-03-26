import {
  countAdminUsers,
  isSlugAllowed,
  isSlugTaken,
  normalizeSlug,
} from "@/lib/admin-users";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Public check for `/signup` — only when the platform has at least one user (bootstrapped). */
export async function GET(request: Request) {
  const n = await countAdminUsers();
  if (n < 0) {
    return NextResponse.json(
      { error: "Firestore is not configured" },
      { status: 500 },
    );
  }
  if (n === 0) {
    return NextResponse.json(
      { error: "Platform not ready" },
      { status: 503 },
    );
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
