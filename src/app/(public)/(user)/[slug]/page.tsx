import { PersonJsonLd } from "@/components/portfolio/person-json-ld";
import { PortfolioPage } from "@/components/portfolio/portfolio-page";
import { getAdminUserBySlug } from "@/lib/admin-users";
import {
  getEffectiveSiteJsonForUser,
  getMergedSiteDataForUser,
} from "@/lib/site-data";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: { slug: string };
};

function publicOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await getAdminUserBySlug(params.slug);
  if (!user || user.disabled) return {};
  const data = await getMergedSiteDataForUser(user.id);
  const base = publicOrigin();
  const pageUrl = base ? `${base}/${user.slug}` : undefined;
  const keywords = data.skills.slice(0, 20).join(", ");
  return {
    title: `${data.name} | Portfolio`,
    description: data.description,
    keywords: keywords || undefined,
    alternates: pageUrl ? { canonical: pageUrl } : undefined,
    openGraph: {
      title: data.name,
      description: data.description,
      url: pageUrl,
      type: "profile",
      images: pageUrl
        ? [
            {
              url: `${pageUrl}/opengraph-image`,
              width: 1200,
              height: 630,
              alt: `${data.name} profile preview`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: data.name,
      description: data.description,
      images: pageUrl ? [`${pageUrl}/opengraph-image`] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function PublicUserPage({ params }: PageProps) {
  const user = await getAdminUserBySlug(params.slug);
  if (!user || user.disabled) notFound();
  const [data, siteJson] = await Promise.all([
    getMergedSiteDataForUser(user.id),
    getEffectiveSiteJsonForUser(user.id),
  ]);
  const base = publicOrigin();
  let pageUrl = base ? `${base}/${user.slug}` : "";
  let assetOrigin = base;
  if (!pageUrl) {
    try {
      const u = new URL(data.url);
      assetOrigin = u.origin;
      pageUrl = `${u.origin}/${user.slug}`;
    } catch {
      pageUrl = `/${user.slug}`;
    }
  }
  return (
    <>
      <PersonJsonLd data={data} pageUrl={pageUrl} siteOrigin={assetOrigin} />
      <PortfolioPage
        data={data}
        projectsRaw={siteJson.projects}
        cvPdfDownloadUrl={`/api/public/cv/pdf?slug=${encodeURIComponent(user.slug)}`}
      />
    </>
  );
}
