"use client";

import { Icons } from "@/components/icons";
import { Dock, DockIcon, type DockIconProps } from "@/components/magicui/dock";
import {
  PortfolioCommandMenu,
  type CommandSearchIndex,
} from "@/components/portfolio/portfolio-command-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  NavLucideIcon,
  SiteJson,
  SocialIconKey,
} from "@/data/site-defaults";
import { cn } from "@/lib/utils";
import { Ellipsis, HomeIcon, NotebookIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

const MAX_NAV_ICONS = 4;
const MAX_SOCIAL_ICONS = 2;

const LUCIDE_NAV: Record<NavLucideIcon, LucideIcon> = {
  Home: HomeIcon,
  Notebook: NotebookIcon,
};

const SOCIAL_ICONS: Record<
  SocialIconKey,
  (props: React.ComponentProps<typeof Icons.github>) => React.ReactNode
> = {
  github: Icons.github,
  linkedin: Icons.linkedin,
  x: Icons.x,
  youtube: Icons.youtube,
  email: Icons.email,
  whatsapp: Icons.whatsapp,
};

type OverflowEntry = {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
};

type NavbarProps = {
  navbar: SiteJson["navbar"];
  social: SiteJson["contact"]["social"];
  blogRouteEnabled: boolean;
  dockMenuEnabled: boolean;
  themeToggleEnabled: boolean;
  commandSearch?: CommandSearchIndex;
};

function DockOverflowMenu({
  entries,
  mousex,
  magnification,
  distance,
}: {
  entries: OverflowEntry[];
  /** Injected by parent `<Dock />` via cloneElement — must reach inner `<DockIcon />`. */
  mousex?: DockIconProps["mousex"];
  magnification?: number;
  distance?: number;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (entries.length === 0) return null;

  return (
    <div className="relative" ref={rootRef}>
      <DockIcon
        mousex={mousex}
        magnification={magnification}
        distance={distance}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="menu"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "size-12",
              )}
              onClick={() => setOpen((o) => !o)}
            >
              <Ellipsis className="size-4" aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>المزيد</p>
          </TooltipContent>
        </Tooltip>
      </DockIcon>
      {open ? (
        <div
          role="menu"
          className="absolute bottom-full left-1/2 z-[60] mb-2 min-w-[11rem] -translate-x-1/2 rounded-lg border border-border bg-popover p-1.5 shadow-lg"
        >
          {entries.map((e) => {
            const className =
              "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground";
            const inner = (
              <>
                <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
                  {e.icon}
                </span>
                <span className="truncate">{e.label}</span>
              </>
            );
            return e.external ? (
              <a
                key={e.key}
                role="menuitem"
                href={e.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
                onClick={() => setOpen(false)}
              >
                {inner}
              </a>
            ) : (
              <Link
                key={e.key}
                role="menuitem"
                href={e.href}
                className={className}
                onClick={() => setOpen(false)}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function Navbar({
  navbar,
  social,
  blogRouteEnabled,
  dockMenuEnabled,
  themeToggleEnabled,
  commandSearch,
}: NavbarProps) {
  if (!dockMenuEnabled) return null;

  const navItems = navbar.filter((item) => {
    if (item.enabled === false) return false;
    if (item.href === "/blog" || item.href.startsWith("/blog")) {
      return blogRouteEnabled;
    }
    return true;
  });

  const navMain = navItems.slice(0, MAX_NAV_ICONS);
  const navOverflow = navItems.slice(MAX_NAV_ICONS);

  const socialEntries = Object.entries(social).filter(
    ([, entry]) => entry.enabled !== false && entry.navbar,
  );
  const socialMain = socialEntries.slice(0, MAX_SOCIAL_ICONS);
  const socialOverflow = socialEntries.slice(MAX_SOCIAL_ICONS);

  const overflow: OverflowEntry[] = [
    ...navOverflow.map((item) => {
      const NavI = LUCIDE_NAV[item.lucideIcon] ?? HomeIcon;
      return {
        key: `nav-${item.href}`,
        href: item.href,
        label: item.label,
        icon: <NavI className="size-4 opacity-80" aria-hidden />,
      };
    }),
    ...socialOverflow.map(([name, entry]) => {
      const IconComp = SOCIAL_ICONS[entry.icon] ?? Icons.github;
      return {
        key: `soc-${name}`,
        href: entry.url,
        label: name,
        icon: <IconComp className="size-4 opacity-80" />,
        external: true as const,
      };
    }),
  ];

  return (
    <div
      data-testid="site-dock"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-4 flex h-full max-h-14 origin-bottom print:hidden"
    >
      <div className="fixed bottom-0 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black,transparent)] dark:bg-background"></div>
      <Dock className="z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-1 bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] ">
        {navMain.map((item) => {
          const Icon = LUCIDE_NAV[item.lucideIcon] ?? HomeIcon;
          return (
            <DockIcon key={item.href}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-12",
                    )}
                  >
                    <Icon className="size-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          );
        })}
        <Separator orientation="vertical" className="h-full" />
        {socialMain.map(([name, entry]) => {
          const IconComp = SOCIAL_ICONS[entry.icon] ?? Icons.github;
          return (
            <DockIcon key={name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={entry.url}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-12",
                    )}
                  >
                    <IconComp className="size-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          );
        })}
        {commandSearch ? (
          <DockIcon key="cmdk-search">
            <PortfolioCommandMenu index={commandSearch} />
          </DockIcon>
        ) : null}
        <DockOverflowMenu entries={overflow} />
        {themeToggleEnabled ? (
          <Separator
            key="theme-separator"
            orientation="vertical"
            className="h-full py-2"
          />
        ) : null}
        {themeToggleEnabled ? (
          <DockIcon key="theme-toggle">
            <Tooltip>
              <TooltipTrigger asChild>
                <ModeToggle />
              </TooltipTrigger>
              <TooltipContent>
                <p>Theme</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        ) : null}
      </Dock>
    </div>
  );
}
