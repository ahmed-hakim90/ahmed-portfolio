import { isValidDeviceId } from "@/lib/platform-analytics";
import { recordPortfolioViewDeduped } from "@/lib/user-analytics";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { userId, deviceId } = (body ?? {}) as Record<string, unknown>;
  if (typeof userId !== "string" || !userId.trim()) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!isValidDeviceId(deviceId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  void recordPortfolioViewDeduped(userId.trim(), deviceId);
  return NextResponse.json({ ok: true });
}
