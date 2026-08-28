"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";

const MEDIA_BOX =
  "relative aspect-video w-full overflow-hidden bg-muted/60";

interface Props {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly string[];
  link?: string;
  image?: string;
  video?: string;
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  className?: string;
  /** When false, project title/image area and footer badges are not links. */
  externalLinksEnabled?: boolean;
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  link,
  image,
  video,
  links,
  className,
  externalLinksEnabled = true,
}: Props) {
  const reduceMotion = usePrefersReducedMotion();
  const hasVideo = Boolean(video);
  const hasImage = Boolean(image);
  const useVideo = hasVideo && !reduceMotion;
  const useImage = hasImage && (!hasVideo || reduceMotion);
  const hasMedia = useVideo || useImage;
  const canLinkHeader = externalLinksEnabled && href && href.length > 0;

  const mediaBlock = (
    <div className={MEDIA_BOX}>
      {useImage ? (
        <Image
          src={image!}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 400px"
          className={cn(
            "object-cover object-top",
            useVideo && "absolute inset-0 z-0",
          )}
        />
      ) : null}
      {useVideo ? (
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className="pointer-events-none absolute inset-0 z-10 size-full object-cover object-top"
          aria-hidden
        />
      ) : null}
      {reduceMotion && hasVideo && !hasImage ? (
        <div
          className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground"
          role="img"
          aria-label={`${title} preview video (animation reduced)`}
        >
          <ImageIcon className="size-10 opacity-50" aria-hidden />
          <span className="text-xs">Preview hidden when reduced motion is on</span>
        </div>
      ) : null}
      {!hasMedia && !(reduceMotion && hasVideo && !hasImage) ? (
        <div
          className="flex size-full flex-col items-center justify-center gap-1 p-4 text-center text-muted-foreground"
          aria-hidden
        >
          <ImageIcon className="size-9 opacity-40" />
          <span className="text-[11px] opacity-80">No preview</span>
        </div>
      ) : null}
    </div>
  );

  return (
    <Card className="flex h-full flex-col overflow-hidden border transition-all duration-300 ease-out hover:shadow-lg">
      {canLinkHeader ? (
        <Link
          href={href!}
          className={cn(
            "block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
          )}
          aria-label={`${title} — view project`}
        >
          {mediaBlock}
        </Link>
      ) : (
        <div className={cn("block", className)}>{mediaBlock}</div>
      )}
      <CardHeader className="px-2">
        <div className="space-y-1">
          <CardTitle className="mt-1 text-base">{title}</CardTitle>
          <time className="font-sans text-xs">{dates}</time>
          <div className="hidden font-sans text-xs underline print:visible">
            {link?.replace("https://", "").replace("www.", "").replace("/", "")}
          </div>
          <Markdown className="prose max-w-full text-pretty font-sans text-xs text-muted-foreground dark:prose-invert">
            {description}
          </Markdown>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col px-2">
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag, ti) => (
              <Badge
                className="px-1 py-0 text-[10px]"
                variant="secondary"
                key={`${tag}-${ti}`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-2 pb-2">
        {links && links.length > 0 && (
          <div className="flex flex-row flex-wrap items-start gap-1">
            {links.map((linkItem, idx) =>
              externalLinksEnabled ? (
                <Link
                  href={linkItem.href}
                  key={`${linkItem.href}-${idx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Badge className="flex gap-2 px-2 py-1 text-[10px]">
                    <span aria-hidden>{linkItem.icon}</span>
                    <span>{linkItem.type}</span>
                    <span className="sr-only"> (opens in new tab)</span>
                  </Badge>
                </Link>
              ) : (
                <Badge
                  key={`${linkItem.type}-${idx}`}
                  className="flex gap-2 px-2 py-1 text-[10px]"
                  variant="secondary"
                >
                  {linkItem.icon}
                  {linkItem.type}
                </Badge>
              ),
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
