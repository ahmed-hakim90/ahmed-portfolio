"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

/** Shared field styles for auth forms — comfortable touch targets. */
export const authFieldClass = cn(
  "flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
  "placeholder:text-muted-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

type AuthShellProps = {
  children: React.ReactNode;
  dir?: "rtl" | "ltr";
  homeHref?: string;
  homeLabel?: string;
};

export function AuthShell({
  children,
  dir = "rtl",
  homeHref = "/",
  homeLabel = "العودة للرئيسية",
}: AuthShellProps) {
  return (
    <div
      dir={dir}
      className="min-h-screen bg-white text-foreground dark:bg-background"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-6 flex shrink-0 justify-center">
          <Link
            href={homeHref}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {homeLabel}
          </Link>
        </header>
        <div className="flex flex-1 flex-col justify-center pb-6">{children}</div>
      </div>
    </div>
  );
}
