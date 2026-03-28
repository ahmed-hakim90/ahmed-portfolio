"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SiteJson } from "@/data/site-defaults";
import { getCvScore } from "@/lib/cv-score";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import type { RegisterOnboardingStepActionsFn } from "../onboarding-step-actions";

type Props = {
  siteData: SiteJson;
  onFinish: () => Promise<void>;
  finishing: boolean;
  controlsLocked?: boolean;
  registerActions: RegisterOnboardingStepActionsFn;
};

export function StepDone({
  siteData,
  onFinish,
  finishing,
  controlsLocked = false,
  registerActions,
}: Props) {
  useEffect(() => {
    registerActions({
      kind: "done",
      finish: () => void onFinish(),
    });
    return () => registerActions(null);
  }, [registerActions, onFinish]);

  const score = useMemo(() => getCvScore(siteData), [siteData]);

  const ringColor =
    score.total >= 75
      ? "text-emerald-600 dark:text-emerald-400"
      : score.total >= 50
        ? "text-amber-500 dark:text-amber-400"
        : "text-destructive";

  const ringBg =
    score.total >= 75
      ? "bg-emerald-50 dark:bg-emerald-950/40"
      : score.total >= 50
        ? "bg-amber-50 dark:bg-amber-950/40"
        : "bg-destructive/10";

  return (
    <Card className="w-full border-border/80 shadow-lg">
      <CardHeader className="space-y-1 px-5 pb-2 pt-6 text-center sm:px-8 sm:pt-8">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </div>
        <CardTitle className="text-xl sm:text-2xl">اكتمل الإعداد</CardTitle>
        <CardDescription>
          تُنشر الموقع للزوار فقط إذا اكتمل الملف: الاسم والسطر الرئيسي، وتواصل، وإضافة
          مهارة أو خبرة أو تعليم أو مشروع — التخطّي بين الخطوات لا يكفي بدون هذه الأقسام.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-6 pt-2 sm:px-8 sm:pb-8">

        {/* CV Strength Score */}
        <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-2 border-current",
                ringColor,
                ringBg,
              )}
            >
              <span className="text-xl font-bold leading-none tabular-nums">
                {score.total}
              </span>
              <span className="text-[10px] leading-none">%</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">قوة سيرتك الذاتية</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {score.total >= 75
                  ? "ممتاز — سيرتك قوية وجاهزة للنشر"
                  : score.total >= 50
                    ? "جيد — أضف المزيد لتحسين ظهورك"
                    : "يحتاج تحسين — أكمل البيانات الناقصة"}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
            {score.breakdown.map((item) => (
              <div
                key={item.key}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs",
                  item.points === item.maxPoints
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : item.points > 0
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      : "bg-muted/50 text-muted-foreground",
                )}
              >
                {item.points === item.maxPoints ? (
                  <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
                ) : (
                  <Circle className="size-3.5 shrink-0" aria-hidden />
                )}
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>

          {score.breakdown.some((i) => i.hint) ? (
            <ul className="mt-3 space-y-1 border-t border-border/50 pt-3">
              {score.breakdown
                .filter((i) => i.hint)
                .map((i) => (
                  <li key={i.key} className="flex gap-1.5 text-xs text-muted-foreground">
                    <span className="shrink-0 text-amber-500">•</span>
                    {i.hint}
                  </li>
                ))}
            </ul>
          ) : null}
        </div>

        <ul className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <li>• تم حفظ بياناتك على الخادم عند الضغط على «حفظ ومتابعة» في كل خطوة.</li>
          <li>• إن ظهرت رسالة خطأ عند الإنهاء، راجع الخطوة الأولى والثانية وتأكد من الحقول المطلوبة.</li>
          <li>• من لوحة التحكم يمكنك تغيير المظهر، الأقسام، والمدونة.</li>
        </ul>
        <Button
          type="button"
          className="h-12 w-full gap-2 text-base"
          size="lg"
          onClick={() => void onFinish()}
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
      </CardContent>
    </Card>
  );
}
