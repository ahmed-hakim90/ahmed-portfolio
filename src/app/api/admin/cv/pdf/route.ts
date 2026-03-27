import { getAdminSession } from "@/lib/admin-request";
import { sanitizeCvPdfFilename } from "@/lib/cv-pdf-asset-url";
import { getRequestOrigin } from "@/lib/request-origin";
import { renderCvPdfBuffer } from "@/lib/render-cv-pdf";
import { getMergedSiteDataForUser } from "@/lib/site-data";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function pdfDisposition(name: string): string {
  const full = `${sanitizeCvPdfFilename(name)}-CV.pdf`;
  const ascii = full.replace(/[^\x20-\x7E]/g, "_") || "CV.pdf";
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(full)}`;
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getMergedSiteDataForUser(session.sub);
  const origin = getRequestOrigin(request);

  let buffer: Buffer;
  try {
    buffer = await renderCvPdfBuffer(data, origin);
  } catch (e) {
    console.error("renderCvPdfBuffer (admin)", e);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 },
    );
  }

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": pdfDisposition(data.name),
      "Cache-Control": "private, no-store",
    },
  });
}
