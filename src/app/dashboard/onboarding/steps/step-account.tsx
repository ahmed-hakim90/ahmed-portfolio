"use client";

import { authFieldClass } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type SiteJson } from "@/data/site-defaults";
import { buildPublicPortfolioUrl } from "@/lib/site-public-base";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RegisterOnboardingStepActionsFn } from "../onboarding-step-actions";

type SlugAvailDetail = "invalid" | "available" | "taken" | null;

type Props = {
  siteData: SiteJson;
  profileSlug: string;
  onSaveAccount: (patch: Partial<SiteJson>, slug: string) => Promise<void>;
  onSkip: () => void;
  saving: boolean;
  controlsLocked?: boolean;
  registerActions: RegisterOnboardingStepActionsFn;
};

export function StepAccount({
  siteData,
  profileSlug,
  onSaveAccount,
  onSkip,
  saving,
  controlsLocked = false,
  registerActions,
}: Props) {
  const busy = saving || controlsLocked;

  const [slug, setSlug] = useState(profileSlug);
  const [slugCheck, setSlugCheck] = useState<{
    checking: boolean;
    normalized: string;
    detail: SlugAvailDetail;
  }>({ checking: false, normalized: profileSlug, detail: null });
  const slugCheckSeq = useRef(0);

  // مزامنة الـ slug الأولي مع profileSlug عند أول تحميل
  useEffect(() => {
    setSlug(profileSlug);
    setSlugCheck({ checking: false, normalized: profileSlug, detail: null });
  }, [profileSlug]);

  // فحص توفر الـ slug (debounced 400ms)
  useEffect(() => {
    const raw = slug.trim();
    if (raw.length === 0) {
      slugCheckSeq.current += 1;
      setSlugCheck({ checking: false, normalized: "", detail: null });
      return;
    }
    if (raw === profileSlug) {
      setSlugCheck({ checking: false, normalized: raw, detail: "available" });
      return;
    }
    const seq = ++slugCheckSeq.current;
    setSlugCheck((s) => ({ ...s, checking: true }));
    const t = window.setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(
            `/api/public/slug-availability?slug=${encodeURIComponent(raw)}`,
            { cache: "no-store" },
          );
          const data = (await res.json().catch(() => ({}))) as {
            normalized?: string;
            detail?: string;
          };
          if (seq !== slugCheckSeq.current) return;
          const detail = data.detail;
          const normalized =
            typeof data.normalized === "string" ? data.normalized : "";
          if (
            detail === "invalid" ||
            detail === "available" ||
            detail === "taken"
          ) {
            setSlugCheck({ checking: false, normalized, detail });
          } else {
            setSlugCheck({ checking: false, normalized: "", detail: null });
          }
        } catch {
          if (seq !== slugCheckSeq.current) return;
          setSlugCheck({ checking: false, normalized: "", detail: null });
        }
      })();
    }, 400);
    return () => window.clearTimeout(t);
  }, [slug, profileSlug]);

  const portfolioPreviewUrl =
    (slugCheck.detail === "available" || slug.trim() === profileSlug) &&
    (slugCheck.normalized || slug.trim())
      ? buildPublicPortfolioUrl(slugCheck.normalized || slug.trim())
      : "";

  const runSave = useCallback(() => {
    const resolvedSlug =
      slug.trim() && (slugCheck.detail === "available" || slug.trim() === profileSlug)
        ? slugCheck.normalized || slug.trim()
        : profileSlug;
    void onSaveAccount({}, resolvedSlug);
  }, [onSaveAccount, slug, slugCheck, profileSlug]);

  const runSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  useEffect(() => {
    registerActions({ kind: "form", save: runSave, skip: runSkip });
    return () => registerActions(null);
  }, [registerActions, runSave, runSkip]);

  const slugIcon = slugCheck.checking ? (
    <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
  ) : slug.trim() === profileSlug || slugCheck.detail === "available" ? (
    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
  ) : slugCheck.detail === "taken" ? (
    <XCircle className="size-4 text-destructive" aria-hidden />
  ) : slugCheck.detail === "invalid" ? (
    <AlertCircle className="size-4 text-amber-600 dark:text-amber-500" aria-hidden />
  ) : null;

  return (
    <Card className="w-full border-border/80 shadow-lg">
      <CardHeader className="space-y-1 px-5 pb-2 pt-6 text-center sm:px-8 sm:pt-8">
        <CardTitle className="text-xl sm:text-2xl">مسار صفحتك العامة</CardTitle>
        <CardDescription>
          اختر مسار رابطك العام — يمكنك التعديل لاحقاً من الإعدادات.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-5 pb-6 pt-2 sm:px-8 sm:pb-8">
        {/* مسار صفحتك (slug) */}
        <div className="space-y-2">
          <label
            htmlFor="account-slug"
            className="block text-sm font-medium text-foreground"
          >
            مسار صفحتك العامة
          </label>
          <div className="relative" dir="ltr">
            <span
              className="pointer-events-none absolute start-3 top-1/2 z-[1] -translate-y-1/2 text-xs text-muted-foreground"
              aria-hidden
            >
              /
            </span>
            <input
              id="account-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={cn(
                authFieldClass,
                "font-mono ps-7 pe-10",
                (slug.trim() === profileSlug || slugCheck.detail === "available") &&
                  "border-emerald-500/50 focus-visible:ring-emerald-500/30",
                (slugCheck.detail === "taken" || slugCheck.detail === "invalid") &&
                  "border-destructive/40",
              )}
              placeholder="my-name"
              spellCheck={false}
              disabled={busy}
            />
            <span className="absolute end-2 top-1/2 -translate-y-1/2">
              {slugIcon}
            </span>
          </div>

          <div
            className="min-h-[1.25rem] text-xs text-muted-foreground"
            dir="rtl"
            aria-live="polite"
          >
            {slugCheck.checking ? (
              <span>جاري التحقق من توفر المسار…</span>
            ) : slug.trim().length === 0 ? (
              <span>أحرف إنجليزية صغيرة وأرقام وشرطة — من 3 إلى 48 حرفاً.</span>
            ) : slug.trim() === profileSlug ? (
              <span className="text-emerald-700 dark:text-emerald-400">
                المسار الحالي.
              </span>
            ) : slugCheck.detail === "invalid" ? (
              <span className="text-amber-700 dark:text-amber-400">
                الصيغة غير صالحة.
              </span>
            ) : slugCheck.detail === "taken" ? (
              <span className="text-destructive">هذا المسار محجوز.</span>
            ) : slugCheck.detail === "available" ? (
              <span className="text-emerald-700 dark:text-emerald-400">
                المسار متاح.
              </span>
            ) : (
              <span>تعذر التحقق. أعد المحاولة.</span>
            )}
          </div>

          {portfolioPreviewUrl ? (
            <div className="rounded-md border border-border/80 bg-background px-3 py-2 text-left">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                معاينة الرابط
              </p>
              <p className="truncate font-mono text-xs text-foreground sm:text-sm">
                {portfolioPreviewUrl}
              </p>
            </div>
          ) : null}
        </div>

        {/* أزرار الخطوة */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="ghost" onClick={runSkip} disabled={busy}>
            تخطّي
          </Button>
          <Button
            type="button"
            onClick={runSave}
            disabled={busy}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                جاري الحفظ…
              </>
            ) : (
              "حفظ ومتابعة"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
