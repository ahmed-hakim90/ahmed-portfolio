import { PortfolioPage } from "@/components/portfolio/portfolio-page";
import { getAdminUserBySlug } from "@/lib/admin-users";
import { getMergedSiteDataForUser } from "@/lib/site-data";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await getAdminUserBySlug(params.slug);
  if (!user || user.disabled) return {};
  const data = await getMergedSiteDataForUser(user.id);
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const pageUrl = `${base}/${user.slug}`;
  return {
    title: `${data.name} | Portfolio`,
    description: data.description,
    openGraph: {
      title: data.name,
      description: data.description,
      url: pageUrl,
      type: "profile",
      images: [
        {
          url: `${pageUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${data.name} profile preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.name,
      description: data.description,
      images: [`${pageUrl}/opengraph-image`],
    },
  };
}

export default async function PublicUserPage({ params }: PageProps) {
  const user = await getAdminUserBySlug(params.slug);
  if (!user || user.disabled) notFound();
  const data = await getMergedSiteDataForUser(user.id);
  return <PortfolioPage data={data} />;
}
