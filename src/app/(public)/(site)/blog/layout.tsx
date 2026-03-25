import { getEffectiveSiteJson } from "@/lib/site-data";
import { redirect } from "next/navigation";

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getEffectiveSiteJson();
  if (!site.publicControls.routes.blog.enabled) {
    redirect("/");
  }
  return <>{children}</>;
}
