/**
 * Resolve portfolio asset paths (e.g. `/me.jpg`) to absolute URLs for @react-pdf Image.
 */
export function resolveCvAssetUrl(
  pathOrUrl: string,
  origin: string,
): string | undefined {
  const t = pathOrUrl.trim();
  if (!t) return undefined;
  if (/^https?:\/\//i.test(t)) return t;
  const base = origin.replace(/\/$/, "");
  return t.startsWith("/") ? `${base}${t}` : `${base}/${t}`;
}

/** Safe base name for PDF (strip path chars); allows Unicode letters. */
export function sanitizeCvPdfFilename(name: string): string {
  const base = name
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  return base || "CV";
}
