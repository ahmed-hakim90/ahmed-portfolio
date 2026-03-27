import { CvPrintDocument } from "@/components/cv/cv-print-document";
import { getAdminSession } from "@/lib/admin-request";
import { getMergedSiteDataForUser } from "@/lib/site-data";
import { redirect } from "next/navigation";
import { DM_Sans, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const session = await getAdminSession();
  if (!session) return { title: "CV Print" };
  const data = await getMergedSiteDataForUser(session.sub);
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

export default async function CvPrintPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/dashboard/login?next=/dashboard/cv-print");
  }
  const DATA = await getMergedSiteDataForUser(session.sub);

  return (
    <div className={`${bodyFont.variable} ${headingFont.variable}`}>
      <CvPrintDocument data={DATA} />
    </div>
  );
}
