"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const COOKIE = "portfolio_locale";

export function LocaleToggle({ current }: { current: "en" | "ar" }) {
  const router = useRouter();
  const next = current === "ar" ? "en" : "ar";
  const label = current === "ar" ? "EN" : "ع";

  const onClick = useCallback(() => {
    document.cookie = `${COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  }, [next, router]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="shrink-0 px-2 font-mono text-xs"
      onClick={onClick}
      aria-label={next === "en" ? "Switch to English" : "التبديل إلى العربية"}
    >
      {label}
    </Button>
  );
}
