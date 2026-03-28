"use client";

import { LogoutButton } from "@/components/dashboard/logout-button";
import { Button } from "@/components/ui/button";
import type { SiteJson } from "@/data/site-defaults";
import { applyOnboardingEmptyDisplay } from "@/lib/onboarding-empty-display";
import {
  getMinimumPortfolioGaps,
  meetsMinimumPortfolioRemote,
  type MinimumPortfolioGaps,
} from "@/lib/portfolio-minimum-profile";
import { deepMergeSite, mergeSiteJsonForSave } from "@/lib/site-hydrate";
import { ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { RegisteredOnboardingStepActions } from "./onboarding-step-actions";
import { StepDone } from "./steps/step-done";
import { StepEducation } from "./steps/step-education";
import { StepPersonal } from "./steps/step-personal";
import { StepProjects } from "./steps/step-projects";
import { StepSkills } from "./steps/step-skills";
import { StepWork } from "./steps/step-work";

const TOTAL_STEPS = 6;
const MAX_STEP_INDEX = TOTAL_STEPS - 1;

function clampOnboardingStep(n: number): number {
  const x = Number.isFinite(n) ? Math.floor(n) : 0;
  return Math.min(MAX_STEP_INDEX, Math.max(0, x));
}

type CompletionHints =
  | null
  | { type: "personal"; name: boolean; description: boolean; contact: boolean }
  | { type: "substantive" };

function navigationFromGaps(gaps: MinimumPortfolioGaps): {
  step: number;
  hints: CompletionHints;
} {
  if (gaps.missingName || gaps.missingDescription) {
    return {
      step: 0,
      hints: {
        type: "personal",
        name: gaps.missingName,
        description: gaps.missingDescription,
        contact: gaps.missingContact,
      },
    };
  }
  if (gaps.missingSubstantive) {
    return { step: 1, hints: { type: "substantive" } };
  }
  return { step: 0, hints: null };
}

const STEP_TITLES = [
  "بيانات الموقع الأساسية",
  "المهارات",
  "الخبرة العملية",
  "التعليم",
  "المشاريع",
  "تم الانتهاء",
];

export function OnboardingWizard({
  initialStep,
  prefillOnboardingInputs,
}: {
  initialStep: number;
  /** When true (e.g. reopened wizard after completing once), show saved site data in inputs. */
  prefillOnboardingInputs: boolean;
}) {
  const router = useRouter();
  const [siteData, setSiteData] = useState<SiteJson | null>(null);
  const [usedRealSiteData, setUsedRealSiteData] =
    useState(prefillOnboardingInputs);
  const [step, setStep] = useState(() => clampOnboardingStep(initialStep));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [backPending, setBackPending] = useState(false);
  const [skipPending, setSkipPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completionHints, setCompletionHints] =
    useState<CompletionHints>(null);
  const [registeredActions, setRegisteredActions] =
    useState<RegisteredOnboardingStepActions | null>(null);

  const clearPersonalFieldHint = useCallback(
    (field: "name" | "description" | "contact") => {
      setCompletionHints((h) => {
        if (!h || h.type !== "personal") return h;
        const next = {
          ...h,
          [field]: false,
        };
        if (!next.name && !next.description && !next.contact) return null;
        return next;
      });
    },
    [],
  );

  const clearCompletionHints = useCallback(() => {
    setCompletionHints(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/site", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setError("تعذّر تحميل بيانات الموقع");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setSiteData(mergeSiteJsonForSave(data as SiteJson));
        }
      } catch {
        if (!cancelled) setError("تعذّر تحميل بيانات الموقع");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const wizardSiteData = useMemo(() => {
    if (!siteData) return null;
    if (prefillOnboardingInputs || usedRealSiteData) return siteData;
    return applyOnboardingEmptyDisplay(siteData);
  }, [siteData, prefillOnboardingInputs, usedRealSiteData]);

  const persistOnboardingStep = useCallback(async (nextStep: number) => {
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingStep: nextStep }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "تعذّر حفظ خطوة التقدّم. حاول مرة أخرى.",
        );
        return false;
      }
      return true;
    } catch {
      setError("تعذّر حفظ خطوة التقدّم. حاول مرة أخرى.");
      return false;
    }
  }, []);

  const handleSave = useCallback(
    async (patch: Partial<SiteJson>) => {
      if (!siteData) return;
      setError(null);
      const merged = deepMergeSite(siteData, patch);
      setSaving(true);
      try {
        const res = await fetch("/api/admin/site", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(merged),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(
            typeof data.error === "string" ? data.error : "فشل الحفظ. حاول مرة أخرى.",
          );
          return;
        }
        setSiteData(merged);
        setUsedRealSiteData(true);
        setCompletionHints(null);
        const nextStep = Math.min(step + 1, MAX_STEP_INDEX);
        const persisted = await persistOnboardingStep(nextStep);
        if (!persisted) return;
        setStep(nextStep);
      } catch {
        setError("فشل الحفظ.");
      } finally {
        setSaving(false);
      }
    },
    [siteData, step, persistOnboardingStep],
  );

  const handleSkip = useCallback(() => {
    setError(null);
    setSkipPending(true);
    void (async () => {
      try {
        const nextStep = Math.min(step + 1, MAX_STEP_INDEX);
        const persisted = await persistOnboardingStep(nextStep);
        if (!persisted) return;
        setStep(nextStep);
      } finally {
        setSkipPending(false);
      }
    })();
  }, [step, persistOnboardingStep]);

  const handleBack = useCallback(() => {
    if (step <= 0) return;
    setError(null);
    setBackPending(true);
    void (async () => {
      try {
        const prevStep = step - 1;
        const persisted = await persistOnboardingStep(prevStep);
        if (!persisted) return;
        setStep(prevStep);
      } finally {
        setBackPending(false);
      }
    })();
  }, [step, persistOnboardingStep]);

  const handleFinish = useCallback(async () => {
    if (!siteData) return;
    setError(null);
    if (!meetsMinimumPortfolioRemote(siteData)) {
      const gaps = getMinimumPortfolioGaps(siteData);
      const { step: targetStep, hints } = navigationFromGaps(gaps);
      setCompletionHints(hints);
      setStep(targetStep);
      return;
    }
    setFinishing(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingCompleted: true }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
      };
      if (!res.ok) {
        if (data.code === "incomplete_profile") {
          const gaps = getMinimumPortfolioGaps(siteData);
          const { step: targetStep, hints } = navigationFromGaps(gaps);
          setCompletionHints(hints);
          setStep(targetStep);
          return;
        }
        setError(
          typeof data.error === "string" ? data.error : "تعذّر إتمام الإعداد",
        );
        return;
      }
      router.push("/dashboard/site?fromOnboarding=1");
      router.refresh();
    } catch {
      setError("تعذّر إتمام الإعداد");
    } finally {
      setFinishing(false);
    }
  }, [router, siteData]);

  const controlsLocked = backPending || skipPending;

  const toolbarBusy =
    saving || finishing || backPending || skipPending || !registeredActions;

  if (loading || !siteData || !wizardSiteData) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">جاري تحميل بياناتك…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div
        className="sticky top-0 z-50 -mx-4 border-b border-border/80 bg-background/95 px-4 pb-3 pt-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6"
        role="region"
        aria-label="شريط إعداد السيرة"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1 text-center sm:text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
              إعداد السيرة الذاتية
            </p>
            <h1 className="mt-1 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              {STEP_TITLES[step]}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              الخطوة {step + 1} من {TOTAL_STEPS}
            </p>
          </div>
          <div className="flex shrink-0 justify-center sm:justify-end">
            <LogoutButton className="!w-auto shrink-0 justify-center gap-2 px-3" />
          </div>
        </div>

        <div className="mt-3 flex justify-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted-foreground/25"
              }`}
              aria-hidden
            />
          ))}
        </div>
        <div
          className="mt-2 h-1.5 max-w-md overflow-hidden rounded-full bg-muted mx-auto"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleBack}
              disabled={saving || finishing || backPending || skipPending}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
              الخطوة السابقة
            </Button>
          ) : null}

          {step < 5 && registeredActions?.kind === "form" ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => registeredActions.skip()}
                disabled={toolbarBusy}
              >
                تخطّي
              </Button>
              <Button
                type="button"
                size="sm"
                className="gap-2"
                onClick={() => registeredActions.save()}
                disabled={toolbarBusy}
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
            </>
          ) : null}

          {step === 5 && registeredActions?.kind === "done" ? (
            <Button
              type="button"
              size="sm"
              className="gap-2"
              onClick={() => void registeredActions.finish()}
              disabled={finishing || controlsLocked}
            >
              {finishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  جاري التوجيه…
                </>
              ) : (
                "الانتقال إلى لوحة التحكم"
              )}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="-mx-4 space-y-6 px-4 sm:-mx-6 sm:px-6">
      {error ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="space-y-6">
        {step === 0 ? (
          <StepPersonal
            siteData={wizardSiteData}
            onSave={handleSave}
            onSkip={handleSkip}
            saving={saving}
            controlsLocked={controlsLocked}
            registerActions={setRegisteredActions}
            invalidName={
              completionHints?.type === "personal" && completionHints.name
            }
            invalidDescription={
              completionHints?.type === "personal" &&
              completionHints.description
            }
            invalidContact={
              completionHints?.type === "personal" && completionHints.contact
            }
            onClearPersonalFieldHint={clearPersonalFieldHint}
          />
        ) : null}
        {step === 1 ? (
          <StepSkills
            siteData={wizardSiteData}
            onSave={handleSave}
            onSkip={handleSkip}
            saving={saving}
            controlsLocked={controlsLocked}
            registerActions={setRegisteredActions}
            highlightSubstantiveInvalid={
              completionHints?.type === "substantive"
            }
            onClearCompletionHints={clearCompletionHints}
          />
        ) : null}
        {step === 2 ? (
          <StepWork
            siteData={wizardSiteData}
            onSave={handleSave}
            onSkip={handleSkip}
            saving={saving}
            controlsLocked={controlsLocked}
            registerActions={setRegisteredActions}
          />
        ) : null}
        {step === 3 ? (
          <StepEducation
            siteData={wizardSiteData}
            onSave={handleSave}
            onSkip={handleSkip}
            saving={saving}
            controlsLocked={controlsLocked}
            registerActions={setRegisteredActions}
          />
        ) : null}
        {step === 4 ? (
          <StepProjects
            siteData={wizardSiteData}
            onSave={handleSave}
            onSkip={handleSkip}
            saving={saving}
            controlsLocked={controlsLocked}
            registerActions={setRegisteredActions}
          />
        ) : null}
        {step === 5 ? (
          <StepDone
            onFinish={handleFinish}
            finishing={finishing}
            controlsLocked={controlsLocked}
            registerActions={setRegisteredActions}
          />
        ) : null}
      </div>

      <p className="text-center">
        <Button
          type="button"
          variant="link"
          className="h-auto text-xs text-muted-foreground"
          disabled={finishing || saving || backPending || skipPending}
          onClick={() => void handleFinish()}
        >
          تخطّي كل الخطوات والذهاب للمحرر
        </Button>
      </p>
      </div>
    </div>
  );
}
