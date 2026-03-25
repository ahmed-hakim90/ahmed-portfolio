import { PlatformAnalyticsPing } from "@/components/analytics/platform-analytics-ping";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PlatformAnalyticsPing surface="public" />
      {children}
    </>
  );
}
