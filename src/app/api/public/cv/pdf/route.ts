import { getAdminUserBySlug } from "@/lib/admin-users";
import {
  isPortfolioPublishedForViewer,
  isPublicPortfolioUrlAccessible,
} from "@/lib/public-portfolio-access";
import { sanitizeCvPdfFilename } from "@/lib/cv-pdf-asset-url";
import { getRequestOrigin } from "@/lib/request-origin";
import { renderCvPdfBuffer } from "@/lib/render-cv-pdf";
import { getMergedSiteData, getMergedSiteDataForUser } from "@/lib/site-data";
import { recordCvDownload } from "@/lib/user-analytics";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function pdfDisposition(name: string): string {
  const full = `${sanitizeCvPdfFilename(name)}-CV.pdf`;
  const ascii = full.replace(/[^\x20-\x7E]/g, "_") || "CV.pdf";
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(full)}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();

  let data;
  let trackedUserId: string | null = null;
  if (slug) {
    const user = await getAdminUserBySlug(slug);
    if (!user || user.disabled) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!isPublicPortfolioUrlAccessible(user)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!(await isPortfolioPublishedForViewer(user))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    trackedUserId = user.id;
    data = await getMergedSiteDataForUser(user.id);
  } else {
    data = await getMergedSiteData();
  }

  const origin = getRequestOrigin(request);
  let buffer: Buffer;
  try {
    buffer = await renderCvPdfBuffer(data, origin);
  } catch (e) {
    console.error("renderCvPdfBuffer (public)", e);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 },
    );
  }

  if (trackedUserId) void recordCvDownload(trackedUserId);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": pdfDisposition(data.name),
      "Cache-Control": "private, no-store",
    },
  });
}
