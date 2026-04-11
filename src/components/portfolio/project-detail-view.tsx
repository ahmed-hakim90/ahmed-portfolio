"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import type { SiteJson } from "@/data/site-defaults";
import type { ProjectLinkIconKey } from "@/data/site-defaults";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { ArrowLeft, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";

const LINK_ICONS: Record<
  ProjectLinkIconKey,
  (props: React.ComponentProps<typeof Icons.github>) => React.ReactNode
> = {
  globe: Icons.globe,
  github: Icons.github,
};

type Props = {
  project: SiteJson["projects"][number];
  /** Portfolio home URL, e.g. `/portfolio` or `/slug` */
  portfolioHomeHref: string;
  externalLinksEnabled: boolean;
};

export function ProjectDetailView({
  project,
  portfolioHomeHref,
  externalLinksEnabled,
}: Props) {
  const reduceMotion = usePrefersReducedMotion();
  const hasVideo = Boolean(project.video?.trim());
  const hasImage = Boolean(project.image?.trim());
  const useVideo = hasVideo && !reduceMotion;
  const useImage = hasImage;
  const hasHeroMedia = useVideo || useImage;
  const gallery = (project.gallery ?? []).filter((u) => u.trim().length > 0);

  return (
    <article className="mx-auto w-full max-w-2xl space-y-8 pb-16 pt-4">
      <div>
        <Button variant="ghost" size="sm" className="-ms-2 gap-1 px-2" asChild>
          <Link href={`${portfolioHomeHref.replace(/\/$/, "")}#projects`}>
            <ArrowLeft className="size-4 shrink-0 rtl:rotate-180" aria-hidden />
            Back to projects
          </Link>
        </Button>
      </div>

      <header className="space-y-3">
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          {project.title}
        </h1>
        {project.dates?.trim() ? (
          <p className="text-sm text-muted-foreground">{project.dates}</p>
        ) : null}
        {project.technologies.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((t, i) => (
              <Badge key={`${t}-${i}`} variant="secondary" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        ) : null}
      </header>

      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted/40">
        {useImage ? (
          <Image
            src={project.image!.trim()}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 672px"
            className={
              useVideo
                ? "absolute inset-0 z-0 object-cover object-top"
                : "object-cover object-top"
            }
          />
        ) : null}
        {useVideo ? (
          <video
            src={project.video!.trim()}
            autoPlay
            loop
            muted
            playsInline
            controls
            className="absolute inset-0 z-10 size-full object-cover object-top"
          />
        ) : null}
        {reduceMotion && hasVideo && !hasImage ? (
          <div className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            <ImageIcon className="size-12 opacity-50" aria-hidden />
            <p className="text-sm">
              Video playback is limited when reduced motion is enabled.
            </p>
          </div>
        ) : null}
        {!hasHeroMedia && !(reduceMotion && hasVideo && !hasImage) ? (
          <div className="flex size-full flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
            <ImageIcon className="size-12 opacity-40" aria-hidden />
            <span className="text-sm">No preview media</span>
          </div>
        ) : null}
      </div>

      {project.description?.trim() ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Markdown className="prose max-w-none text-pretty text-sm text-muted-foreground dark:prose-invert">
              {project.description}
            </Markdown>
          </CardContent>
        </Card>
      ) : null}

      {project.bodyMarkdown?.trim() ? (
        <div className="prose max-w-none text-pretty dark:prose-invert">
          <Markdown>{project.bodyMarkdown}</Markdown>
        </div>
      ) : null}

      {gallery.length > 0 ? (
        <section className="space-y-3" aria-label="Gallery">
          <h2 className="text-lg font-semibold tracking-tight">Gallery</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {gallery.map((url, i) => (
              <li
                key={`${url}-${i}`}
                className="relative aspect-video overflow-hidden rounded-md border bg-muted/30"
              >
                <Image
                  src={url}
                  alt={`${project.title} gallery image ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(project.links?.length ?? 0) > 0 || project.href?.trim() ? (
        <Card>
          <CardFooter className="flex flex-col items-stretch gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center">
            {project.href?.trim() && externalLinksEnabled ? (
              <Button asChild>
                <Link href={project.href.trim()} target="_blank" rel="noopener noreferrer">
                  Visit project
                </Link>
              </Button>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {(project.links ?? []).map((l, idx) => {
                const icon = (LINK_ICONS[l.icon] ?? Icons.globe)({
                  className: "size-3.5",
                });
                return externalLinksEnabled ? (
                  <Link
                    key={`${l.href}-${idx}`}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Badge className="gap-2 px-3 py-1.5 text-xs">
                      <span aria-hidden>{icon}</span>
                      {l.type}
                      <span className="sr-only"> (opens in new tab)</span>
                    </Badge>
                  </Link>
                ) : (
                  <Badge
                    key={`${l.type}-${idx}`}
                    variant="secondary"
                    className="gap-2 px-3 py-1.5 text-xs"
                  >
                    {icon}
                    {l.type}
                  </Badge>
                );
              })}
            </div>
          </CardFooter>
        </Card>
      ) : null}
    </article>
  );
}
