import raw from "./site-defaults.json";

export type SocialIconKey =
  | "github"
  | "linkedin"
  | "x"
  | "youtube"
  | "email";

export type ProjectLinkIconKey = "globe" | "github";

export type NavLucideIcon = "Home" | "Notebook";

export type PublicControls = {
  routes: {
    blog: { enabled: boolean };
  };
  ui: {
    dockMenu: boolean;
    themeToggle: boolean;
  };
  /** Show/hide main portfolio blocks (hero, about, work, …). */
  portfolioSections: {
    hero: boolean;
    about: boolean;
    work: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    /** Centered “About Me” spotlight (formerly hardcoded under #hackathons). */
    aboutMe: boolean;
    contact: boolean;
  };
  sections: {
    work: { linksEnabled: boolean };
    education: { linksEnabled: boolean };
    projects: { linksEnabled: boolean };
    contact: { linkedinCtaEnabled: boolean };
  };
};

export type CustomPortfolioSection = {
  id: string;
  badge?: string;
  heading: string;
  bodyMarkdown: string;
  enabled?: boolean;
};

export interface SiteJson {
  name: string;
  initials: string;
  url: string;
  location: string;
  locationLink: string;
  description: string;
  summary: string;
  avatarUrl: string;
  skills: string[];
  /** Optional overrides for the public "Contact / Get in Touch" block. */
  contactSection?: {
    badge?: string;
    heading?: string;
    /** Full paragraph (Markdown). When set, replaces the default English template. */
    bodyMarkdown?: string;
  };
  /** Centered spotlight block (badge + heading + Markdown body). Visibility: `publicControls.portfolioSections.aboutMe`. */
  aboutMeSection?: {
    badge?: string;
    heading?: string;
    bodyMarkdown?: string;
  };
  /** Extra spotlight-style sections (shown before Contact). Toggle each with `enabled` or remove the row. */
  customSections?: CustomPortfolioSection[];
  navbar: {
    href: string;
    label: string;
    lucideIcon: NavLucideIcon;
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
        icon: SocialIconKey;
        navbar: boolean;
        enabled?: boolean;
      }
    >;
  };
  work: Array<{
    company: string;
    href: string;
    badges: string[];
    location: string;
    title: string;
    logoUrl: string;
    start: string;
    end: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    href: string;
    degree: string;
    logoUrl: string;
    start: string;
    end: string;
  }>;
  projects: Array<{
    title: string;
    href: string;
    dates?: string;
    active: boolean;
    description: string;
    technologies: string[];
    links: Array<{
      type: string;
      href: string;
      icon: ProjectLinkIconKey;
    }>;
    image: string;
    video: string;
  }>;
  hackathons: unknown[];
  publicControls: PublicControls;
}

export const DEFAULT_SITE_JSON = raw as SiteJson;
