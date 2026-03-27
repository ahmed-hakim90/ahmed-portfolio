import Navbar from "@/components/navbar";
import { SiteTopBar } from "@/components/site-top-bar";
import { getBlogPosts } from "@/data/blog";
import { getEffectiveSiteJson } from "@/lib/site-data";
import { getUiMessages, localeFromCookie } from "@/lib/i18n-messages";
import { cn } from "@/lib/utils";
import { cookies } from "next/headers";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = localeFromCookie(cookies().get("portfolio_locale")?.value);
  const ui = getUiMessages(locale);
  const siteJson = await getEffectiveSiteJson();
  const posts = await getBlogPosts();
  const commandSearch = {
    homeHref: "/portfolio",
    blogPosts: posts
      .filter((p) => p.href.startsWith("/blog/"))
      .map((p) => ({
        title: p.metadata.title,
        href: p.href,
        summary: p.metadata.summary,
      })),
    projects: siteJson.projects.map((p) => ({
      title: p.title,
      href: p.href,
      description: p.description,
    })),
  };
  return (
    <>
      <SiteTopBar locale={locale} topBar={ui.topBar} />
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
        commandSearch={commandSearch}
      />
    </>
  );
}
