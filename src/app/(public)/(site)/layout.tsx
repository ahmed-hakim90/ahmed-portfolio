import Navbar from "@/components/navbar";
import { SiteTopBar } from "@/components/site-top-bar";
import { getEffectiveSiteJson } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteJson = await getEffectiveSiteJson();
  return (
    <>
      <SiteTopBar />
      <div
        className={cn(
          "mx-auto w-full max-w-2xl pt-12 pb-24",
          "print:max-w-none print:pb-0 print:pt-0",
        )}
      >
        {children}
      </div>
      <Navbar
        navbar={siteJson.navbar}
        social={siteJson.contact.social}
        blogRouteEnabled={siteJson.publicControls.routes.blog.enabled}
        dockMenuEnabled={siteJson.publicControls.ui.dockMenu}
        themeToggleEnabled={siteJson.publicControls.ui.themeToggle}
      />
    </>
  );
}
