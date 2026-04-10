"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { commandMenuProjectHref } from "@/lib/project-keys";
import type { SiteJson } from "@/data/site-defaults";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export type CommandSearchIndex = {
  homeHref: string;
  /** Base path for in-site project pages, e.g. `/portfolio` or `/username` */
  portfolioBasePath: string;
  blogPosts: { title: string; href: string; summary: string }[];
  projects: SiteJson["projects"];
};

type Props = {
  index: CommandSearchIndex;
};

export function PortfolioCommandMenu({ index }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      if (href.startsWith("#")) {
        const base = index.homeHref.replace(/\/$/, "");
        router.push(`${base}${href}`);
        return;
      }
      router.push(href);
    },
    [index.homeHref, router],
  );

  const sections = [
    { id: "#about", label: "About" },
    { id: "#work", label: "Work" },
    { id: "#skills", label: "Skills" },
    { id: "#projects", label: "Projects" },
    { id: "#contact", label: "Contact" },
  ] as const;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-12"
            aria-label="Search"
            onClick={() => setOpen(true)}
          >
            <Search className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>بحث (⌘K / Ctrl+K)</p>
        </TooltipContent>
      </Tooltip>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Sections">
            {sections.map((s) => (
              <CommandItem
                key={s.id}
                value={`${s.label} section`}
                onSelect={() => go(s.id)}
              >
                {s.label}
              </CommandItem>
            ))}
          </CommandGroup>
          {index.blogPosts.length > 0 ? (
            <CommandGroup heading="Blog">
              {index.blogPosts.map((p) => (
                <CommandItem
                  key={p.href}
                  value={`${p.title} ${p.summary}`}
                  onSelect={() => go(p.href)}
                >
                  {p.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          {index.projects.length > 0 ? (
            <CommandGroup heading="Projects">
              {index.projects.map((p, i) => (
                <CommandItem
                  key={p.slug?.trim() ? `slug:${p.slug}` : `p-${i}-${p.title}`}
                  value={`${p.title} ${p.description}`}
                  onSelect={() =>
                    go(commandMenuProjectHref(index.portfolioBasePath, p))
                  }
                >
                  {p.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}
