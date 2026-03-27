import { recordPdfDownloadClick } from "@/lib/platform-analytics";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const result = await recordPdfDownloadClick();
  if (!result.ok) {
    const status = result.error.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ ok: true });
}
