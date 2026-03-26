import type { MergedSiteData } from "@/lib/site-data";

type Props = {
  data: MergedSiteData;
  pageUrl: string;
  /** e.g. NEXT_PUBLIC_SITE_URL without trailing slash — used to resolve relative avatar paths */
  siteOrigin: string;
};

export function PersonJsonLd({ data, pageUrl, siteOrigin }: Props) {
  const sameAs = Object.values(data.contact.social)
    .filter((s) => s.enabled !== false && s.url)
    .map((s) => s.url);

  let imageUrl: string | undefined;
  const assetBase = siteOrigin || (pageUrl.startsWith("http") ? new URL(pageUrl).origin : "");
  if (assetBase && data.avatarUrl) {
    try {
      imageUrl = new URL(data.avatarUrl, `${assetBase}/`).href;
    } catch {
      imageUrl = undefined;
    }
  }

  const absolutePageUrl = pageUrl.startsWith("http")
    ? pageUrl
    : siteOrigin
      ? `${siteOrigin}/${pageUrl.replace(/^\//, "")}`
      : undefined;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.name,
    jobTitle: data.description,
    description: data.summary.slice(0, 500),
    knowsAbout: data.skills.slice(0, 20),
  };
  if (absolutePageUrl) jsonLd.url = absolutePageUrl;
  if (imageUrl) jsonLd.image = imageUrl;
  if (data.contact.email) jsonLd.email = data.contact.email;
  if (data.contact.tel) jsonLd.telephone = data.contact.tel;
  if (sameAs.length) jsonLd.sameAs = sameAs;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
