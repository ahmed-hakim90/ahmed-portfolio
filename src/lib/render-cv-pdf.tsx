import { CvPdfDocument } from "@/components/cv/cv-pdf-document";
import type { MergedSiteData } from "@/lib/site-data";
import { resolveCvAssetUrl } from "@/lib/cv-pdf-asset-url";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";

export async function renderCvPdfBuffer(
  data: MergedSiteData,
  origin: string,
): Promise<Buffer> {
  const avatarAbsoluteUrl = resolveCvAssetUrl(data.avatarUrl, origin);
  const element = (
    <CvPdfDocument
      data={data}
      assetOrigin={origin}
      avatarAbsoluteUrl={avatarAbsoluteUrl}
    />
  );
  return renderToBuffer(element);
}
