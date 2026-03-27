import type { SiteJson } from "@/data/site-defaults";

/** Same keys/icons as the template, but no demo URLs (used for onboarding + signup seed). */
export function emptySocialLinksFromBase(
  baseSocial: SiteJson["contact"]["social"],
): SiteJson["contact"]["social"] {
  const social: SiteJson["contact"]["social"] = {};
  for (const [key, entry] of Object.entries(baseSocial)) {
    social[key] = {
      ...entry,
      url: "",
      enabled: false,
      navbar: entry.navbar,
    };
  }
  return social;
}

/**
 * Strips user-editable portfolio fields so first-time onboarding shows empty
 * values and placeholder hints only (no template/seed text inside inputs).
 * Keeps structural fields like `url`, `navbar`, and `publicControls` from `base`.
 */
export function applyOnboardingEmptyDisplay(base: SiteJson): SiteJson {
  const social = emptySocialLinksFromBase(base.contact.social);
  return {
    ...base,
    name: "",
    initials: "",
    location: "",
    locationLink: "",
    description: "",
    summary: "",
    avatarUrl: "",
    skills: [],
    work: [],
    education: [],
    projects: [],
    testimonials: [],
    customSections: [],
    contact: {
      ...base.contact,
      email: "",
      tel: "",
      social,
    },
  };
}
