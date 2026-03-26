import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "الدخول إلى لوحة التحكم",
};

export default function DashboardLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
