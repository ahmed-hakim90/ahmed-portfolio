import { getPublicStats } from "@/lib/public-stats";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const stats = await getPublicStats();
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
    },
  });
}
