import { PortfolioPage } from "@/components/portfolio/portfolio-page";
import { getMergedSiteData } from "@/lib/site-data";
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
  const data = await getMergedSiteData();
  return <PortfolioPage data={data} />;
}
