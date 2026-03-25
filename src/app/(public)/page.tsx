import { FolioLanding } from "@/components/landing/folio-landing";
import { getPublicStats } from "@/lib/public-stats";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HAKIMO CV — حوّل خبرتك لصفحة ويب",
  description:
    "عدّل سيرتك ومشاريعك من لوحة تحكم بسيطة، فعّل المدونة عند الحاجة، واختر الوضع الفاتح أو الداكن — دون أي تعقيد.",
  openGraph: {
    title: "HAKIMO CV — حوّل خبرتك لصفحة ويب",
    description:
      "محفظة احترافية، لوحة تحكم، ومدونة اختيارية — جاهزة للنشر بسهولة.",
    type: "website",
  },
};

export default async function LandingPage() {
  const stats = await getPublicStats();
  return <FolioLanding stats={stats} />;
}
