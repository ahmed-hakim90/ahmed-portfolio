import type { SiteJson } from "@/data/site-defaults";

export type ProjectRecord = SiteJson["projects"][number];

/** URL segment safe slug: lowercase letters, digits, hyphens only. */
export const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeProjectSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidProjectSlug(s: string): boolean {
  return s.length > 0 && PROJECT_SLUG_PATTERN.test(s);
}

/** Stable key for lists (avoids duplicate titles breaking React reconciliation). */
export function stableProjectListKey(
  project: Pick<ProjectRecord, "slug" | "title">,
  index: number,
): string {
  const slug = project.slug?.trim();
  if (slug) return `slug:${slug}`;
  return `i:${index}:${project.title}`;
}

/** Base path: `/${userSlug}` or `/portfolio` (no trailing slash). */
export function projectDetailPath(
  portfolioBasePath: string,
  projectSlug: string,
): string {
  const base = portfolioBasePath.replace(/\/$/, "") || "/";
  return `${base}/project/${encodeURIComponent(projectSlug)}`;
}

export function projectDetailHref(
  portfolioBasePath: string,
  project: Pick<ProjectRecord, "slug">,
): string | undefined {
  const slug = project.slug?.trim();
  if (!slug || !isValidProjectSlug(slug)) return undefined;
  return projectDetailPath(portfolioBasePath, slug);
}

/** Prefer in-site detail URL when slug is valid; otherwise main project URL. */
export function commandMenuProjectHref(
  portfolioBasePath: string,
  project: ProjectRecord,
): string {
  const internal = projectDetailHref(portfolioBasePath, project);
  if (internal) return internal;
  const external = project.href?.trim();
  if (external) return external;
  return portfolioBasePath.replace(/\/$/, "") || "/";
}

export function collectProjectSlugConflicts(
  projects: readonly ProjectRecord[],
): Set<string> {
  const seen = new Map<string, number>();
  const dup = new Set<string>();
  for (const p of projects) {
    const s = p.slug?.trim();
    if (!s || !isValidProjectSlug(s)) continue;
    seen.set(s, (seen.get(s) ?? 0) + 1);
  }
  for (const [s, n] of Array.from(seen.entries())) {
    if (n > 1) dup.add(s);
  }
  return dup;
}
