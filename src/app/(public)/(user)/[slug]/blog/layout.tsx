import { getAdminUserBySlug } from "@/lib/admin-users";
import { isPortfolioPublishedForViewer } from "@/lib/public-portfolio-access";
import { getEffectiveSiteJsonForUser } from "@/lib/site-data";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
  params: { slug: string };
};

export default async function UserBlogLayout({ children, params }: Props) {
  const user = await getAdminUserBySlug(params.slug);
  if (!user || user.disabled) {
    redirect("/");
  }
  if (!(await isPortfolioPublishedForViewer(user))) {
    return <>{children}</>;
  }
  const site = await getEffectiveSiteJsonForUser(user.id);
  if (!site.publicControls.routes.blog.enabled) {
    redirect(`/${params.slug}`);
  }
  return <>{children}</>;
}
