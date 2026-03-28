import { getAdminSession } from "@/lib/admin-request";
import { getUserAnalytics } from "@/lib/user-analytics";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await getUserAnalytics(session.sub);
  return NextResponse.json(data);
}
