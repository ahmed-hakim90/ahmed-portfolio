"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";

type Props = {
  delay?: number;
  badge: string;
  heading: string;
  bodyMarkdown: string;
  /** Extra classes on outer wrapper (e.g. print spacing). */
  wrapperClassName?: string;
  headingClassName?: string;
};

export function PortfolioSpotlightBlock({
  delay,
  badge,
  heading,
  bodyMarkdown,
  wrapperClassName,
  headingClassName,
}: Props) {
  return (
    <div
      className={cn(
        "w-full space-y-12 py-12",
        "print:space-y-4 print:py-4",
        wrapperClassName,
      )}
    >
      <BlurFade delay={delay}>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-foreground px-3 py-1 text-sm text-background">
              {badge}
            </div>
            <h2
              className={cn(
                "text-3xl font-bold tracking-tighter sm:text-5xl",
                "print:text-2xl",
                headingClassName,
              )}
            >
              {heading}
            </h2>
            <Markdown className="prose mx-auto max-w-[800px] text-pretty font-sans text-muted-foreground dark:prose-invert md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed print:prose-invert">
              {bodyMarkdown}
            </Markdown>
          </div>
        </div>
      </BlurFade>
    </div>
  );
}
