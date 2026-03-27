import { Icons, type IconProps } from "@/components/icons";
import {
  DEFAULT_SITE_JSON,
  type ProjectLinkIconKey,
  type PublicControls,
  type SiteJson,
  type SocialIconKey,
} from "@/data/site-defaults";
import type { LucideIcon } from "lucide-react";
import { HomeIcon, NotebookIcon } from "lucide-react";
import type { JSX } from "react";

const LUCIDE_NAV: Record<string, LucideIcon> = {
  Home: HomeIcon,
  Notebook: NotebookIcon,
};

type IconFn = (props: IconProps) => JSX.Element;

const SOCIAL_ICONS: Record<SocialIconKey, IconFn> = {
  github: Icons.github,
  linkedin: Icons.linkedin,
  x: Icons.x,
  youtube: Icons.youtube,
  email: Icons.email,
  whatsapp: Icons.whatsapp,
};

const PROJECT_LINK_ICONS: Record<ProjectLinkIconKey, IconFn> = {
  globe: Icons.globe,
  github: Icons.github,
};

function deepMergePublicControls(
  base: PublicControls,
  patch: Partial<PublicControls> | undefined,
): PublicControls {
  if (!patch) return base;
  return {
    routes: {
      blog: {
        enabled: patch.routes?.blog?.enabled ?? base.routes.blog.enabled,
      },
    },
    ui: {
      dockMenu: patch.ui?.dockMenu ?? base.ui.dockMenu,
      themeToggle: patch.ui?.themeToggle ?? base.ui.themeToggle,
      themePreset: patch.ui?.themePreset ?? base.ui.themePreset,
      portfolioDir: patch.ui?.portfolioDir ?? base.ui.portfolioDir,
      portfolioLang: patch.ui?.portfolioLang ?? base.ui.portfolioLang,
    },
    portfolioSections: {
      hero:
        patch.portfolioSections?.hero ?? base.portfolioSections.hero,
      about:
        patch.portfolioSections?.about ?? base.portfolioSections.about,
      work:
        patch.portfolioSections?.work ?? base.portfolioSections.work,
      education:
        patch.portfolioSections?.education ??
        base.portfolioSections.education,
      skills:
        patch.portfolioSections?.skills ?? base.portfolioSections.skills,
      projects:
        patch.portfolioSections?.projects ??
        base.portfolioSections.projects,
      testimonials:
        patch.portfolioSections?.testimonials ??
        base.portfolioSections.testimonials,
      aboutMe:
        patch.portfolioSections?.aboutMe ??
        base.portfolioSections.aboutMe,
      contact:
        patch.portfolioSections?.contact ??
        base.portfolioSections.contact,
    },
    sections: {
      work: {
        linksEnabled:
          patch.sections?.work?.linksEnabled ??
          base.sections.work.linksEnabled,
      },
      education: {
        linksEnabled:
          patch.sections?.education?.linksEnabled ??
          base.sections.education.linksEnabled,
      },
      projects: {
        linksEnabled:
          patch.sections?.projects?.linksEnabled ??
          base.sections.projects.linksEnabled,
      },
      contact: {
        linkedinCtaEnabled:
          patch.sections?.contact?.linkedinCtaEnabled ??
          base.sections.contact.linkedinCtaEnabled,
      },
    },
  };
}

export function deepMergeSite(base: SiteJson, patch: Partial<SiteJson>): SiteJson {
  return {
    ...base,
    ...patch,
    contactSection: {
      ...base.contactSection,
      ...patch.contactSection,
    },
    aboutMeSection: {
      ...base.aboutMeSection,
      ...patch.aboutMeSection,
    },
    customSections:
      patch.customSections !== undefined
        ? patch.customSections
        : base.customSections,
    testimonials:
      patch.testimonials !== undefined
        ? patch.testimonials
        : base.testimonials,
    testimonialsSection: {
      ...base.testimonialsSection,
      ...patch.testimonialsSection,
    },
    contact: {
      ...base.contact,
      ...(patch.contact ?? {}),
      social: {
        ...base.contact.social,
        ...(patch.contact?.social ?? {}),
      },
    },
    publicControls: deepMergePublicControls(
      base.publicControls,
      patch.publicControls,
    ),
  };
}

export function mergeSiteJsonForSave(patch: Partial<SiteJson>): SiteJson {
  return deepMergeSite(DEFAULT_SITE_JSON, patch);
}

export type MergedSiteData = Omit<
  SiteJson,
  "navbar" | "contact" | "projects" | "publicControls"
> & {
  navbar: {
    href: string;
    label: string;
    icon: LucideIcon;
    enabled?: boolean;
  }[];
  contact: {
    email: string;
    tel: string;
    social: Record<
      string,
      {
        name: string;
        url: string;
        navbar: boolean;
        enabled?: boolean;
        icon: IconFn;
      }
    >;
  };
  projects: Array<
    Omit<SiteJson["projects"][number], "links"> & {
      links: Array<{ type: string; href: string; icon: JSX.Element }>;
    }
  >;
  publicControls: PublicControls;
};

export function hydrateSiteJson(json: SiteJson): MergedSiteData {
  const { publicControls, ...rest } = json;
  return {
    ...rest,
    publicControls,
    navbar: json.navbar.map((n) => ({
      href: n.href,
      label: n.label,
      icon: LUCIDE_NAV[n.lucideIcon] ?? HomeIcon,
      enabled: n.enabled,
    })),
    contact: {
      ...json.contact,
      social: Object.fromEntries(
        Object.entries(json.contact.social).map(([k, v]) => [
          k,
          {
            name: v.name,
            url: v.url,
            navbar: v.navbar,
            enabled: v.enabled,
            icon: SOCIAL_ICONS[v.icon] ?? Icons.github,
          },
        ]),
      ),
    },
    projects: json.projects.map((p) => ({
      ...p,
      links: p.links.map((l) => ({
        type: l.type,
        href: l.href,
        icon: (PROJECT_LINK_ICONS[l.icon] ?? Icons.globe)({
          className: "size-3",
        }),
      })),
    })),
  };
}
