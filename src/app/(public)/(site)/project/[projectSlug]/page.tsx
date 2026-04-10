import { ProjectDetailView } from "@/components/portfolio/project-detail-view";
import { isValidProjectSlug } from "@/lib/project-keys";
import { getEffectiveSiteJson } from "@/lib/site-data";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: { projectSlug: string };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const rawSlug = decodeURIComponent(params.projectSlug);
  if (!isValidProjectSlug(rawSlug)) return {};
  const siteJson = await getEffectiveSiteJson();
  const project = siteJson.projects.find((p) => p.slug?.trim() === rawSlug);
  if (!project) return {};
  return {
    title: `${project.title} | ${siteJson.name.trim()}`,
    description: project.description?.slice(0, 160) || undefined,
  };
}

export default async function SiteProjectDetailPage({ params }: PageProps) {
  const rawSlug = decodeURIComponent(params.projectSlug);
  if (!isValidProjectSlug(rawSlug)) notFound();

  const siteJson = await getEffectiveSiteJson();
  const project = siteJson.projects.find((p) => p.slug?.trim() === rawSlug);
  if (!project) notFound();

  return (
    <ProjectDetailView
      project={project}
      portfolioHomeHref="/portfolio"
      externalLinksEnabled={siteJson.publicControls.sections.projects.linksEnabled}
    />
  );
}
