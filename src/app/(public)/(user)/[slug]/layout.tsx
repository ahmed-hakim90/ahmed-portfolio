import Navbar from "@/components/navbar";
import { SiteTopBar } from "@/components/site-top-bar";
import { getBlogPostsForUser } from "@/data/blog";
import { DEFAULT_SITE_JSON } from "@/data/site-defaults";
import { getAdminUserBySlug } from "@/lib/admin-users";
import { getPortfolioHtmlAttrs } from "@/lib/portfolio-display";
import {
  isPortfolioPublishedForViewer,
  isPublicPortfolioUrlAccessible,
} from "@/lib/public-portfolio-access";
import { getEffectiveSiteJsonForUser } from "@/lib/site-data";
import { withSlugPrefix } from "@/lib/slug-nav";
import { getUiMessages, localeFromCookie } from "@/lib/i18n-messages";
import { cn } from "@/lib/utils";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function UserSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const user = await getAdminUserBySlug(params.slug);
  if (!user || user.disabled) notFound();
  if (!isPublicPortfolioUrlAccessible(user)) notFound();
  const locale = localeFromCookie(cookies().get("portfolio_locale")?.value);
  const ui = getUiMessages(locale);

  if (!(await isPortfolioPublishedForViewer(user))) {
    const { dir, lang } = getPortfolioHtmlAttrs(
      DEFAULT_SITE_JSON.publicControls.ui,
    );
    return (
      <>
        <SiteTopBar locale={locale} topBar={ui.topBar} />
        <div
          dir={dir}
          lang={lang}
          className={cn(
            "mx-auto w-full max-w-2xl pt-12 pb-24 [unicode-bidi:isolate]",
            "print:max-w-none print:pb-0 print:pt-0",
          )}
          data-portfolio-theme={
            DEFAULT_SITE_JSON.publicControls.ui.themePreset ?? "default"
          }
        >
          {children}
        </div>
      </>
    );
  }

  const json = await getEffectiveSiteJsonForUser(user.id);
  const posts = await getBlogPostsForUser(user.id);
  const commandSearch = {
    homeHref: `/${user.slug}`,
    blogPosts: posts.map((p) => ({
      title: p.metadata.title,
      href: p.href,
      summary: p.metadata.summary,
    })),
    projects: json.projects.map((p) => ({
      title: p.title,
      href: p.href,
      description: p.description,
    })),
  };
  const nav = json.navbar.map((item) => ({
    ...item,
    href: withSlugPrefix(user.slug, item.href),
  }));
  const { dir, lang } = getPortfolioHtmlAttrs(json.publicControls.ui);
  return (
    <>
      <SiteTopBar locale={locale} topBar={ui.topBar} />
      <div
        dir={dir}
        lang={lang}
        className={cn(
          "mx-auto w-full max-w-2xl pt-12 pb-24 [unicode-bidi:isolate]",
          "print:max-w-none print:pb-0 print:pt-0",
        )}
        data-portfolio-theme={json.publicControls.ui.themePreset ?? "default"}
      >
        {children}
      </div>
      <Navbar
        navbar={nav}
        social={json.contact.social}
        blogRouteEnabled={json.publicControls.routes.blog.enabled}
        dockMenuEnabled={json.publicControls.ui.dockMenu}
        themeToggleEnabled={json.publicControls.ui.themeToggle}
        commandSearch={commandSearch}
      />
    </>
  );
}
