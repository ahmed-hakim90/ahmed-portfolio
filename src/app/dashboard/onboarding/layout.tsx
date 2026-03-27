import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

/**
 * Standalone layout — no admin sidebar (see `dashboard/(admin)/layout.tsx`).
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-muted/40 via-background to-background"
    >
      <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
        {children}
      </div>
    </div>
  );
}
