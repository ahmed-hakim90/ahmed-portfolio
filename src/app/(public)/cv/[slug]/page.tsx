import { CvPrintDocument } from "@/components/cv/cv-print-document";
import { getAdminUserBySlug } from "@/lib/admin-users";
import {
  isPortfolioPublishedForViewer,
  isPublicPortfolioUrlAccessible,
} from "@/lib/public-portfolio-access";
import { getMergedSiteDataForUser } from "@/lib/site-data";
import { DM_Sans, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = { params: { slug: string } };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const user = await getAdminUserBySlug(params.slug);
  if (!user || user.disabled) return {};
  if (!isPublicPortfolioUrlAccessible(user)) return {};
  if (!(await isPortfolioPublishedForViewer(user))) return { title: "CV" };
  const data = await getMergedSiteDataForUser(user.id);
  const name = data.name.trim() || "CV";
  return { title: `${name} | CV` };
}

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-cv-body",
});

const headingFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cv-heading",
});

/** Public CV print (no portfolio chrome). URL: `/cv/{slug}` */
export default async function PublicCvPage({ params }: PageProps) {
  const user = await getAdminUserBySlug(params.slug);
  if (!user || user.disabled) notFound();
  if (!isPublicPortfolioUrlAccessible(user)) notFound();
  if (!(await isPortfolioPublishedForViewer(user))) notFound();
  const DATA = await getMergedSiteDataForUser(user.id);

  return (
    <div
      className={`min-h-screen bg-background ${bodyFont.variable} ${headingFont.variable}`}
    >
      <CvPrintDocument data={DATA} />
    </div>
  );
}
