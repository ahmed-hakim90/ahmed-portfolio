"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect } from "react";
import type { RegisterOnboardingStepActionsFn } from "../onboarding-step-actions";

type Props = {
  onFinish: () => Promise<void>;
  finishing: boolean;
  controlsLocked?: boolean;
  registerActions: RegisterOnboardingStepActionsFn;
};

export function StepDone({
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
