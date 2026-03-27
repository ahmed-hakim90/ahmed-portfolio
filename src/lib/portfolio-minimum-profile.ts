import type { SiteJson } from "@/data/site-defaults";

/** At least one of: skills, work, education, projects — not only step 1 (personal). */
export function hasSubstantivePortfolioSections(remote: SiteJson): boolean {
  if (remote.skills?.some((s) => typeof s === "string" && s.trim() !== "")) {
    return true;
  }
  if (
    remote.work?.some(
      (w) =>
        (typeof w.title === "string" && w.title.trim() !== "") ||
        (typeof w.company === "string" && w.company.trim() !== ""),
    )
  ) {
    return true;
  }
  if (
    remote.education?.some(
      (e) =>
        (typeof e.school === "string" && e.school.trim() !== "") ||
        (typeof e.degree === "string" && e.degree.trim() !== ""),
    )
  ) {
    return true;
  }
  if (
    remote.projects?.some(
      (p) => typeof p.title === "string" && p.title.trim() !== "",
    )
  ) {
    return true;
  }
  return false;
}

/** Email, phone, or any social link with a non-empty URL. */
export function hasContactMethod(remote: SiteJson): boolean {
  const email = remote.contact?.email?.trim() ?? "";
  const tel = remote.contact?.tel?.trim() ?? "";
  if (email || tel) return true;
  const social = remote.contact?.social ?? {};
  for (const entry of Object.values(social)) {
    if (
      entry &&
      typeof entry === "object" &&
      typeof entry.url === "string" &&
      entry.url.trim() !== ""
    ) {
      return true;
    }
  }
  return false;
}

export type MinimumPortfolioGaps = {
  missingName: boolean;
  missingDescription: boolean;
  missingContact: boolean;
  missingSubstantive: boolean;
};

export function getMinimumPortfolioGaps(
  remote: SiteJson | null,
): MinimumPortfolioGaps {
  if (!remote) {
    return {
      missingName: true,
      missingDescription: true,
      missingContact: true,
      missingSubstantive: true,
    };
  }
  const name = typeof remote.name === "string" ? remote.name.trim() : "";
  const description =
    typeof remote.description === "string" ? remote.description.trim() : "";
  return {
    missingName: !name,
    missingDescription: !description,
    missingContact: !hasContactMethod(remote),
    missingSubstantive: !hasSubstantivePortfolioSections(remote),
  };
}

/**
 * Minimum saved site data required before marking onboarding complete or showing
 * a public portfolio (for users who completed the wizard at least once).
 */
export function meetsMinimumPortfolioRemote(remote: SiteJson | null): boolean {
  if (!remote) return false;
  const g = getMinimumPortfolioGaps(remote);
  return (
    !g.missingName &&
    !g.missingDescription &&
    !g.missingContact &&
    !g.missingSubstantive
  );
}
