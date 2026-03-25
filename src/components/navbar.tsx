"use client";

import { Icons } from "@/components/icons";
import { Dock, DockIcon } from "@/components/magicui/dock";
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
import { HomeIcon, NotebookIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";

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
};

type NavbarProps = {
  navbar: SiteJson["navbar"];
  social: SiteJson["contact"]["social"];
  blogRouteEnabled: boolean;
  dockMenuEnabled: boolean;
  themeToggleEnabled: boolean;
};

export default function Navbar({
  navbar,
  social,
  blogRouteEnabled,
  dockMenuEnabled,
  themeToggleEnabled,
}: NavbarProps) {
  if (!dockMenuEnabled) return null;

  const navItems = navbar.filter((item) => {
    if (item.enabled === false) return false;
    if (item.href === "/blog" || item.href.startsWith("/blog")) {
      return blogRouteEnabled;
    }
    return true;
  });

  return (
    <div
      data-testid="site-dock"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-4 flex h-full max-h-14 origin-bottom print:hidden"
    >
      <div className="fixed bottom-0 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black,transparent)] dark:bg-background"></div>
      <Dock className="z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-1 bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] ">
        {navItems.map((item) => {
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
        {Object.entries(social)
          .filter(
            ([, entry]) =>
              entry.enabled !== false && entry.navbar,
          )
          .map(([name, entry]) => {
            const Icon = SOCIAL_ICONS[entry.icon] ?? Icons.github;
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
                      <Icon className="size-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{name}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            );
          })}
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
