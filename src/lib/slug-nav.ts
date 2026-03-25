/** Prefix navbar hrefs for per-user public routes under `/[slug]`. */
export function withSlugPrefix(slug: string, href: string): string {
  if (href === "/") return `/${slug}`;
  if (href === "/blog" || href.startsWith("/blog/")) return `/${slug}${href}`;
  if (href.startsWith("/")) return href;
  return `/${slug}/${href.replace(/^\/+/, "")}`;
}
