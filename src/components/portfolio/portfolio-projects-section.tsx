"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { SiteJson } from "@/data/site-defaults";
import type { ProjectLinkIconKey } from "@/data/site-defaults";
import { LayoutGroup, motion } from "framer-motion";
import { useMemo, useState } from "react";

const LINK_ICONS: Record<
  ProjectLinkIconKey,
  (props: React.ComponentProps<typeof Icons.github>) => React.ReactNode
> = {
  globe: Icons.globe,
  github: Icons.github,
};

const BLUR_FADE_DELAY = 0.04;

type Props = {
  projects: SiteJson["projects"];
  externalLinksEnabled: boolean;
  blurStart: number;
};

export function PortfolioProjectsSection({
  projects,
  externalLinksEnabled,
  blurStart,
}: Props) {
  const tags = useMemo(() => {
    const s = new Set<string>();
    for (const p of projects) {
      for (const t of p.technologies) s.add(t);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!active) return projects;
    return projects.filter((p) => p.technologies.includes(active));
  }, [projects, active]);

  return (
    <div className="w-full space-y-12 py-12 print:space-y-6 print:py-4">
      <BlurFade delay={blurStart}>
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

      {tags.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-2 print:hidden">
          <Button
            type="button"
            variant={active === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActive(null)}
          >
            All
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={active === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setActive(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      ) : null}

      <LayoutGroup>
        <motion.div
          layout
          className="mx-auto grid max-w-[800px] grid-cols-1 gap-3 sm:grid-cols-2 print:grid-cols-1"
        >
          {filtered.map((project, id) => (
            <motion.div
              key={project.title}
              layout
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              <BlurFade
                delay={blurStart + 0.02 + id * 0.05}
                className="h-full"
              >
                <ProjectCard
                  href={project.href}
                  title={project.title}
                  description={project.description}
                  dates={"dates" in project ? project.dates ?? " " : " "}
                  tags={project.technologies}
                  image={project.image}
                  video={project.video}
                  links={project.links.map((l) => ({
                    type: l.type,
                    href: l.href,
                    icon: (LINK_ICONS[l.icon] ?? Icons.globe)({
                      className: "size-3",
                    }),
                  }))}
                  externalLinksEnabled={externalLinksEnabled}
                />
              </BlurFade>
            </motion.div>
          ))}
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
