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

/**
 * Minimum saved site data required before marking onboarding complete or showing
 * a public portfolio (for users who completed the wizard at least once).
 */
export function meetsMinimumPortfolioRemote(remote: SiteJson | null): boolean {
  if (!remote) return false;
  const name = typeof remote.name === "string" ? remote.name.trim() : "";
  const description =
    typeof remote.description === "string" ? remote.description.trim() : "";
  if (!name || !description) return false;

  const email = remote.contact?.email?.trim() ?? "";
  const tel = remote.contact?.tel?.trim() ?? "";
  let hasContact = !!(email || tel);
  if (!hasContact) {
    const social = remote.contact?.social ?? {};
    for (const entry of Object.values(social)) {
      if (
        entry &&
        typeof entry === "object" &&
        typeof entry.url === "string" &&
        entry.url.trim() !== ""
      ) {
        hasContact = true;
        break;
      }
    }
  }
  if (!hasContact) return false;

  if (!hasSubstantivePortfolioSections(remote)) return false;

  return true;
}
