import { ProjectDetailView } from "@/components/portfolio/project-detail-view";
import { getAdminUserBySlug } from "@/lib/admin-users";
import { isValidProjectSlug } from "@/lib/project-keys";
import {
  isPortfolioPublishedForViewer,
  isPublicPortfolioUrlAccessible,
} from "@/lib/public-portfolio-access";
import { getEffectiveSiteJsonForUser } from "@/lib/site-data";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: { slug: string; projectSlug: string };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const user = await getAdminUserBySlug(params.slug);
  if (!user || user.disabled) return {};
  if (!isPublicPortfolioUrlAccessible(user)) return {};
  if (!(await isPortfolioPublishedForViewer(user))) return {};
  const rawSlug = decodeURIComponent(params.projectSlug);
  if (!isValidProjectSlug(rawSlug)) return {};
  const siteJson = await getEffectiveSiteJsonForUser(user.id);
  const project = siteJson.projects.find((p) => p.slug?.trim() === rawSlug);
  if (!project) return {};
  return {
    title: `${project.title} | ${siteJson.name}`,
    description: project.description?.slice(0, 160) || undefined,
    robots: { index: true, follow: true },
  };
}

export default async function UserProjectDetailPage({ params }: PageProps) {
  const user = await getAdminUserBySlug(params.slug);
  if (!user || user.disabled) notFound();
  if (!isPublicPortfolioUrlAccessible(user)) notFound();
  if (!(await isPortfolioPublishedForViewer(user))) notFound();

  const rawSlug = decodeURIComponent(params.projectSlug);
  if (!isValidProjectSlug(rawSlug)) notFound();

  const siteJson = await getEffectiveSiteJsonForUser(user.id);
  const project = siteJson.projects.find((p) => p.slug?.trim() === rawSlug);
  if (!project) notFound();

  const base = `/${user.slug}`;

  return (
    <ProjectDetailView
      project={project}
      portfolioHomeHref={base}
      externalLinksEnabled={siteJson.publicControls.sections.projects.linksEnabled}
    />
  );
}
