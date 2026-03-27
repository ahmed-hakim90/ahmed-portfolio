import raw from "./site-defaults.json";

export type SocialIconKey =
  | "github"
  | "linkedin"
  | "x"
  | "youtube"
  | "email"
  | "whatsapp";

export type ProjectLinkIconKey = "globe" | "github";

export type NavLucideIcon = "Home" | "Notebook";

/** Visual preset for public portfolio (light/dark still from theme toggle). */
export type PortfolioThemePreset =
  | "default"
  | "neutral"
  | "blue"
  | "warm"
  | "forest";

/** Text direction for public portfolio + user blog + CV print preview. */
export type PortfolioTextDirection = "rtl" | "ltr";

export type PublicControls = {
  routes: {
    blog: { enabled: boolean };
  };
  ui: {
    dockMenu: boolean;
    themeToggle: boolean;
    /** Accent / palette preset for the public portfolio page. */
    themePreset: PortfolioThemePreset;
    /** Document direction for portfolio content (not the dashboard). */
    portfolioDir: PortfolioTextDirection;
    /**
     * BCP 47 language tag (e.g. ar, en). Used on `lang` for SEO and typography.
     */
    portfolioLang: string;
  };
  /** Show/hide main portfolio blocks (hero, about, work, …). */
  portfolioSections: {
    hero: boolean;
    about: boolean;
    work: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    /** Client testimonials grid (requires non-empty `testimonials`). */
    testimonials: boolean;
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

export type SiteTestimonial = {
  name: string;
  role: string;
  company: string;
  text: string;
  avatar: string;
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
  /**
   * Hero line before the first word of `name` (e.g. "Hi, I'm" or "مرحبا، أنا").
   * Shown as: `{heroGreetingLead} {firstName} {heroGreetingEmoji}`.
   */
  heroGreetingLead?: string;
  /** Suffix after the first name in the hero; often an emoji. Empty string hides it. */
  heroGreetingEmoji?: string;
  /** Show “available for freelance” badge in the hero when true. */
  availableForWork?: boolean;
  /** Hero badge label when `availableForWork` is true (editable in site editor). */
  availableForWorkBadgeText?: string;
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
  /** Client quotes; shown when non-empty (between projects and about-me blocks). */
  testimonials?: SiteTestimonial[];
  /** Optional heading/badge for the testimonials section (defaults below). */
  testimonialsSection?: {
    badge?: string;
    heading?: string;
  };
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
