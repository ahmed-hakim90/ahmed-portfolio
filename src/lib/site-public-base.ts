/**
 * Canonical origin for visitor-facing portfolio URLs (`/{slug}`).
 * Prefer NEXT_PUBLIC_SITE_URL (production / custom domain on Vercel) so sharing from
 * local dev or a preview host still uses the real public URL.
 */
export function getEnvPublicSiteBase(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "").trim();
}

/** Use in client useEffect / event handlers where `window` is defined. */
export function resolvePublicSiteBase(): string {
  return getEnvPublicSiteBase() || (typeof window !== "undefined" ? window.location.origin : "");
}

export function buildPublicPortfolioUrl(slug: string): string {
  const clean = slug.trim().replace(/^\/+/, "");
  if (!clean) return "";
  const base = resolvePublicSiteBase();
  return `${base}/${clean}`;
}
