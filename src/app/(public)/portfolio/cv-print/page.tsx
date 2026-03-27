import { CvPrintDocument } from "@/components/cv/cv-print-document";
import { getMergedSiteData } from "@/lib/site-data";
import { DM_Sans, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getMergedSiteData();
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

/** Same data as `/portfolio` but without site chrome (navbar). URL: `/portfolio/cv-print` */
export default async function PortfolioSiteCvPrintPage() {
  const DATA = await getMergedSiteData();

  return (
    <div
      className={`min-h-screen bg-background ${bodyFont.variable} ${headingFont.variable}`}
    >
      <CvPrintDocument data={DATA} />
    </div>
  );
}
