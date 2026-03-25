import {
  isValidDeviceId,
  recordAnalyticsPing,
} from "@/lib/platform-analytics";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const deviceId = body?.deviceId;
  const surface = body?.surface;

  if (surface !== "public") {
    return NextResponse.json({ error: "Invalid surface" }, { status: 400 });
  }
  if (!isValidDeviceId(deviceId)) {
    return NextResponse.json({ error: "Invalid deviceId" }, { status: 400 });
  }

  const result = await recordAnalyticsPing(deviceId, "public");
  if (!result.ok) {
    const status = result.error.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ ok: true });
}
