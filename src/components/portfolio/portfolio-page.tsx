import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { PortfolioContactForm } from "@/components/portfolio/portfolio-contact-form";
import { PortfolioCvDownload } from "@/components/portfolio/portfolio-cv-download";
import { PortfolioProjectsSection } from "@/components/portfolio/portfolio-projects-section";
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PortfolioSpotlightBlock } from "@/components/portfolio/portfolio-spotlight-block";
import type { SiteJson } from "@/data/site-defaults";
import { DEFAULT_ABOUT_ME_SPOTLIGHT } from "@/lib/portfolio-default-copy";
import { buildHeroGreetingLine } from "@/lib/portfolio-hero-text";
import type { MergedSiteData } from "@/lib/site-data";
import Markdown from "react-markdown";

const BLUR_FADE_DELAY = 0.04;

type PortfolioPageProps = {
  data: MergedSiteData;
  /** Raw projects (with string link icons) for the filterable grid; defaults to merged card data when omitted. */
  projectsRaw?: SiteJson["projects"];
  /**
   * GET URL that returns `application/pdf` (e.g. `/api/public/cv/pdf?slug=…`,
   * `/api/public/cv/pdf` for global site, `/api/admin/cv/pdf` when logged in).
   */
  cvPdfDownloadUrl: string;
  /** Override CV button label (e.g. Arabic in dashboard preview). */
  cvDownloadLabel?: string;
  /** Tooltip on CV button (e.g. explain saved vs unsaved). */
  cvDownloadTitle?: string;
  /** For contact form API routing in dashboard preview. */
  contactOwnerSlug?: string | null;
};

export function PortfolioPage({
  data: DATA,
  projectsRaw,
  cvPdfDownloadUrl,
  cvDownloadLabel,
  cvDownloadTitle,
  contactOwnerSlug,
}: PortfolioPageProps) {
  const heroLine = buildHeroGreetingLine(
    DATA.name,
    DATA.heroGreetingLead,
    DATA.heroGreetingEmoji,
  );
  const pc = DATA.publicControls;
  const cs = DATA.contactSection;
  const contactBadge = cs?.badge ?? "Contact";
  const contactHeading = cs?.heading ?? "Get in Touch";
  const pv = DATA.publicControls.portfolioSections;
  const availableBadgeText =
    DATA.availableForWorkBadgeText?.trim() || "متاح لمشاريع فريلانس";
  const testimonialsBadge =
    DATA.testimonialsSection?.badge?.trim() || "Testimonials";
  const testimonialsHeading =
    DATA.testimonialsSection?.heading?.trim() || "What clients say";

  return (
    <main className="flex min-h-[100dvh] flex-col space-y-10 print:space-y-6 print:py-0">
      {pv.hero ? (
      <section id="hero">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          {DATA.availableForWork ? (
            <BlurFade delay={BLUR_FADE_DELAY * 0.5}>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <span
                  className="size-2 shrink-0 rounded-full bg-emerald-500 animate-pulse"
                  aria-hidden
                />
                {availableBadgeText}
              </div>
            </BlurFade>
          ) : null}
          <div className="flex justify-between gap-4">
            <div className="flex flex-1 flex-col space-y-1.5">
              <BlurFadeText
                delay={BLUR_FADE_DELAY}
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none print:text-3xl"
                yOffset={8}
                text={heroLine}
              />
              <BlurFadeText
                className="max-w-[600px] md:text-xl"
                delay={BLUR_FADE_DELAY}
                text={DATA.description}
              />
            </div>
            <BlurFade
              delay={BLUR_FADE_DELAY}
              className="flex shrink-0 flex-col items-end gap-3"
            >
              <Avatar className="size-28 border print:size-20">
                <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
              <PortfolioCvDownload
                pdfDownloadUrl={cvPdfDownloadUrl}
                label={cvDownloadLabel}
                title={cvDownloadTitle}
                suggestedFileName={DATA.name}
              />
            </BlurFade>
          </div>
        </div>
      </section>
      ) : null}
      {pv.about ? (
      <section id="about">
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <h2 className="text-xl font-bold">About</h2>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <Markdown className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert print:text-foreground">
            {DATA.summary}
          </Markdown>
        </BlurFade>
      </section>
      ) : null}
      {pv.work ? (
      <section id="work">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 5}>
            <h2 className="text-xl font-bold">Work Experience</h2>
          </BlurFade>
          {DATA.work.map((work, id) => (
            <BlurFade
              key={work.company}
              delay={BLUR_FADE_DELAY * 6 + id * 0.05}
            >
              <ResumeCard
                logoUrl={work.logoUrl}
                altText={work.company}
                title={work.company}
                subtitle={work.title}
                href={work.href}
                badges={work.badges}
                period={`${work.start} - ${work.end ?? "Present"}`}
                description={work.description}
                linksActive={pc.sections.work.linksEnabled}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      ) : null}
      {pv.education ? (
      <section id="education">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 7}>
            <h2 className="text-xl font-bold">Education</h2>
          </BlurFade>
          {DATA.education.map((education, id) => (
            <BlurFade
              key={education.school}
              delay={BLUR_FADE_DELAY * 8 + id * 0.05}
            >
              <ResumeCard
                href={education.href}
                logoUrl={education.logoUrl}
                altText={education.school}
                title={education.school}
                subtitle={education.degree}
                period={`${education.start} - ${education.end}`}
                linksActive={pc.sections.education.linksEnabled}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      ) : null}
      {pv.skills ? (
      <section id="skills">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 9}>
            <h2 className="text-xl font-bold">Skills</h2>
          </BlurFade>
          <div className="flex flex-wrap gap-1">
            {DATA.skills.map((skill, id) => (
              <BlurFade key={skill} delay={BLUR_FADE_DELAY * 10 + id * 0.05}>
                <Badge>{skill}</Badge>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
      ) : null}
      {pv.projects ? (
      <section id="projects">
        {projectsRaw ? (
          <PortfolioProjectsSection
            projects={projectsRaw}
            externalLinksEnabled={pc.sections.projects.linksEnabled}
            blurStart={BLUR_FADE_DELAY * 11}
          />
        ) : (
          <div className="w-full space-y-12 py-12 print:space-y-6 print:py-4">
            <BlurFade delay={BLUR_FADE_DELAY * 11}>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-foreground px-3 py-1 text-sm text-background">
                    My Projects
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl print:text-2xl">
                    Check out my latest work
                  </h2>
                  <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    I&apos;ve worked on a variety of projects, from simple websites
                    to complex web applications. Here are a few of my favorites.
                  </p>
                </div>
              </div>
            </BlurFade>
            <div className="mx-auto grid max-w-[800px] grid-cols-1 gap-3 sm:grid-cols-2 print:grid-cols-1">
              {DATA.projects.map((project, id) => (
                <BlurFade
                  key={project.title}
                  delay={BLUR_FADE_DELAY * 12 + id * 0.05}
                >
                  <ProjectCard
                    href={project.href}
                    title={project.title}
                    description={project.description}
                    dates={"dates" in project ? project.dates ?? " " : " "}
                    tags={project.technologies}
                    image={project.image}
                    video={project.video}
                    links={project.links}
                    externalLinksEnabled={pc.sections.projects.linksEnabled}
                  />
                </BlurFade>
              ))}
            </div>
          </div>
        )}
      </section>
      ) : null}
      {pv.testimonials && DATA.testimonials && DATA.testimonials.length > 0 ? (
      <section id="testimonials">
        <div className="w-full space-y-8 py-12 print:space-y-4 print:py-6">
          <BlurFade delay={BLUR_FADE_DELAY * 12}>
            <div className="text-center">
              <div className="inline-block rounded-lg bg-foreground px-3 py-1 text-sm text-background">
                {testimonialsBadge}
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tighter sm:text-5xl print:text-2xl">
                {testimonialsHeading}
              </h2>
            </div>
          </BlurFade>
          <div className="mx-auto grid max-w-[800px] grid-cols-1 gap-4 sm:grid-cols-2">
            {DATA.testimonials.map((t, id) => (
              <BlurFade
                key={`${t.name}-${id}`}
                delay={BLUR_FADE_DELAY * 13 + id * 0.05}
              >
                <Card className="h-full border p-4 sm:p-5 transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-0">
                    <Avatar className="size-12 shrink-0 border">
                      <AvatarImage src={t.avatar} alt={t.name} />
                      <AvatarFallback>{t.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="text-base">{t.name}</CardTitle>
                      <CardDescription>
                        {t.role}
                        {t.company ? ` · ${t.company}` : ""}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 pt-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t.text}
                    </p>
                  </CardContent>
                </Card>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
      ) : null}
      {pv.aboutMe ? (
      <section id="about-me">
        <PortfolioSpotlightBlock
          delay={BLUR_FADE_DELAY * 13}
          badge={
            DATA.aboutMeSection?.badge ?? DEFAULT_ABOUT_ME_SPOTLIGHT.badge
          }
          heading={
            DATA.aboutMeSection?.heading ?? DEFAULT_ABOUT_ME_SPOTLIGHT.heading
          }
          bodyMarkdown={
            DATA.aboutMeSection?.bodyMarkdown ??
            DEFAULT_ABOUT_ME_SPOTLIGHT.bodyMarkdown
          }
        />
      </section>
      ) : null}
      {(DATA.customSections ?? [])
        .filter((s) => s.enabled !== false)
        .map((s, i) => (
          <section key={s.id} id={`section-${s.id}`}>
            <PortfolioSpotlightBlock
              delay={BLUR_FADE_DELAY * 14 + i * 0.03}
              badge={s.badge?.trim() || "Section"}
              heading={s.heading}
              bodyMarkdown={s.bodyMarkdown}
            />
          </section>
        ))}
      {pv.contact ? (
      <section id="contact">
        <div className="grid w-full items-center justify-center gap-4 px-4 py-12 text-center md:px-6 print:py-6">
          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-foreground px-3 py-1 text-sm text-background">
                {contactBadge}
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl print:text-2xl">
                {contactHeading}
              </h2>
              {cs?.bodyMarkdown ? (
                <Markdown className="prose mx-auto w-full max-w-[600px] text-pretty font-sans text-muted-foreground dark:prose-invert md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed print:prose-invert">
                  {cs.bodyMarkdown}
                </Markdown>
              ) : null}
              <PortfolioContactForm
                ownerWhatsAppDigits={DATA.contact.tel}
                ownerSlug={contactOwnerSlug}
              />
            </div>
          </BlurFade>
        </div>
      </section>
      ) : null}
    </main>
  );
}
