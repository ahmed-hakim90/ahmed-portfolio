"use client";

import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PortfolioSpotlightBlock } from "@/components/portfolio/portfolio-spotlight-block";
import { DEFAULT_ABOUT_ME_SPOTLIGHT } from "@/lib/portfolio-default-copy";
import type { MergedSiteData } from "@/lib/site-hydrate";
import Link from "next/link";
import Markdown from "react-markdown";

const BLUR_FADE_DELAY = 0.04;

type Props = {
  data: MergedSiteData;
};

export function PortfolioHomeView({ data: DATA }: Props) {
  const firstName = DATA.name.trim().split(" ")[0];
  const pc = DATA.publicControls;
  const linkedinEntry = DATA.contact.social.LinkedIn;
  const cs = DATA.contactSection;
  const contactBadge = cs?.badge ?? "Contact";
  const contactHeading = cs?.heading ?? "Get in Touch";
  const pv = DATA.publicControls.portfolioSections;

  return (
    <main className="flex min-h-0 flex-col space-y-10">
      {pv.hero ? (
      <section id="hero">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="flex justify-between gap-2">
            <div className="flex flex-1 flex-col space-y-1.5">
              <BlurFadeText
                delay={BLUR_FADE_DELAY}
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                yOffset={8}
                text={`Hi, I'm ${firstName} 👋`}
              />
              <BlurFadeText
                className="max-w-[600px] md:text-xl"
                delay={BLUR_FADE_DELAY}
                text={DATA.description}
              />
            </div>
            <BlurFade delay={BLUR_FADE_DELAY}>
              <Avatar className="size-28 border">
                <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
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
          <Markdown className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
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
              key={`work-${id}-${work.company}`}
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
              key={`edu-${id}-${education.school}`}
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
        <div className="w-full space-y-12 py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 11}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground px-3 py-1 text-sm text-background">
                  My Projects
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Check out my latest work
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  I&apos;ve worked on a variety of projects, from simple
                  websites to complex web applications. Here are a few of my
                  favorites.
                </p>
              </div>
            </div>
          </BlurFade>
          <div className="mx-auto grid max-w-[800px] grid-cols-1 gap-3 sm:grid-cols-2">
            {DATA.projects.map((project, id) => (
              <BlurFade
                key={`proj-${id}-${project.title}`}
                delay={BLUR_FADE_DELAY * 12 + id * 0.05}
              >
                <ProjectCard
                  href={project.href}
                  title={project.title}
                  description={project.description}
                  dates={"dates" in project ? (project.dates ?? " ") : " "}
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
        <div className="grid w-full items-center justify-center gap-4 px-4 py-12 text-center md:px-6">
          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-foreground px-3 py-1 text-sm text-background">
                {contactBadge}
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                {contactHeading}
              </h2>
              {cs?.bodyMarkdown ? (
                <Markdown className="prose mx-auto max-w-[600px] text-pretty font-sans text-muted-foreground dark:prose-invert md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {cs.bodyMarkdown}
                </Markdown>
              ) : (
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Want to chat? Just shoot me a dm{" "}
                  {pc.sections.contact.linkedinCtaEnabled &&
                  linkedinEntry?.url ? (
                    <Link
                      href={linkedinEntry.url}
                      className="text-blue-500 hover:underline"
                    >
                      with a direct question on LinkedIn
                    </Link>
                  ) : (
                    <span>with a direct question on LinkedIn</span>
                  )}{" "}
                  and I&apos;ll respond whenever I can. I will ignore all
                  soliciting.
                </p>
              )}
            </div>
          </BlurFade>
        </div>
      </section>
      ) : null}
    </main>
  );
}
