import { PortfolioPage } from "@/components/portfolio/portfolio-page";
import { getEffectiveSiteJson, getMergedSiteData } from "@/lib/site-data";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getMergedSiteData();
  const name = data.name.trim();
  return {
    title: name,
    description: data.description,
    openGraph: {
      title: name,
      description: data.description,
      url: `${data.url.replace(/\/$/, "")}/portfolio`,
      siteName: name,
      locale: "en_US",
      type: "profile",
    },
    twitter: {
      title: name,
      card: "summary_large_image",
    },
  };
}

export default async function PortfolioRoutePage() {
  const [data, siteJson] = await Promise.all([
    getMergedSiteData(),
    getEffectiveSiteJson(),
  ]);
  return (
    <PortfolioPage
      data={data}
      projectsRaw={siteJson.projects}
      cvPdfDownloadUrl="/api/public/cv/pdf"
    />
  );
}
