import { getAdminSession } from "@/lib/admin-request";
import {
  isValidDeviceId,
  recordAnalyticsPing,
} from "@/lib/platform-analytics";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const deviceId = body?.deviceId;
  const surface = body?.surface;

  if (surface !== "dashboard") {
    return NextResponse.json({ error: "Invalid surface" }, { status: 400 });
  }
  if (!isValidDeviceId(deviceId)) {
    return NextResponse.json({ error: "Invalid deviceId" }, { status: 400 });
  }

  const result = await recordAnalyticsPing(deviceId, "dashboard");
  if (!result.ok) {
    const status = result.error.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ ok: true });
}
