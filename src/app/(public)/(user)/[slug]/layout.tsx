import Navbar from "@/components/navbar";
import { SiteTopBar } from "@/components/site-top-bar";
import { getAdminUserBySlug } from "@/lib/admin-users";
import { getEffectiveSiteJsonForUser } from "@/lib/site-data";
import { withSlugPrefix } from "@/lib/slug-nav";
import { cn } from "@/lib/utils";
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
  const json = await getEffectiveSiteJsonForUser(user.id);
  const nav = json.navbar.map((item) => ({
    ...item,
    href: withSlugPrefix(user.slug, item.href),
  }));
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
        navbar={nav}
        social={json.contact.social}
        blogRouteEnabled={json.publicControls.routes.blog.enabled}
        dockMenuEnabled={json.publicControls.ui.dockMenu}
        themeToggleEnabled={json.publicControls.ui.themeToggle}
      />
    </>
  );
}
