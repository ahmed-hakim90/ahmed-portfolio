import { isOwnerAuthenticated } from "@/lib/admin-request";
import { getPlatformAnalyticsSnapshot } from "@/lib/platform-analytics";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isOwnerAuthenticated())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const snapshot = await getPlatformAnalyticsSnapshot();
  return NextResponse.json(snapshot);
}
