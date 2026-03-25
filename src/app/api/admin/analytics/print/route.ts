import { getAdminSession } from "@/lib/admin-request";
import { recordPrintClick } from "@/lib/platform-analytics";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await recordPrintClick();
  if (!result.ok) {
    const status = result.error.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ ok: true });
}
