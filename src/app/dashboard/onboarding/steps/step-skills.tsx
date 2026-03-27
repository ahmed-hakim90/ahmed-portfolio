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
import type { SiteJson } from "@/data/site-defaults";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { RegisterOnboardingStepActionsFn } from "../onboarding-step-actions";

type Props = {
  siteData: SiteJson;
  onSave: (patch: Partial<SiteJson>) => Promise<void>;
  onSkip: () => void;
  saving: boolean;
  controlsLocked?: boolean;
  registerActions: RegisterOnboardingStepActionsFn;
};

export function StepSkills({
  siteData,
  onSave,
  onSkip,
  saving,
  controlsLocked = false,
  registerActions,
}: Props) {
  const busy = saving || controlsLocked;
  const [skills, setSkills] = useState<string[]>(siteData.skills ?? []);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setSkills([...(siteData.skills ?? [])]);
  }, [siteData]);

  useEffect(() => {
    registerActions({
      kind: "form",
      save: () => void onSave({ skills }),
      skip: onSkip,
    });
    return () => registerActions(null);
  }, [registerActions, onSave, onSkip, skills]);

  function addSkill() {
    const t = draft.trim();
    if (!t) return;
    const parts = t.split(/[,،]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    setSkills((prev) => {
      const next = [...prev];
      for (const p of parts) {
        if (!next.some((x) => x.toLowerCase() === p.toLowerCase())) {
          next.push(p);
        }
      }
      return next;
    });
    setDraft("");
  }

  function removeSkill(i: number) {
    setSkills((prev) => prev.filter((_, j) => j !== i));
  }

  return (
    <Card className="w-full border-border/80 shadow-lg">
      <CardHeader className="space-y-1 px-5 pb-2 pt-6 text-center sm:px-8 sm:pt-8">
        <CardTitle className="text-xl sm:text-2xl">المهارات</CardTitle>
        <CardDescription>
          أضف مهارة واحدة أو عدة مهارات مفصولة بفاصلة، ثم اضغط «إضافة».
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-6 pt-2 sm:px-8 sm:pb-8">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className={authFieldClass}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="React، TypeScript، Node…"
            disabled={busy}
          />
          <Button type="button" variant="secondary" onClick={addSkill} disabled={busy}>
            إضافة
          </Button>
        </div>
        {skills.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <li
                key={`${s}-${i}`}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-3 py-1 text-sm"
              >
                <span>{s}</span>
                <button
                  type="button"
                  className="rounded-full p-0.5 hover:bg-muted"
                  onClick={() => removeSkill(i)}
                  disabled={busy}
                  aria-label={`إزالة ${s}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-muted-foreground">لا توجد مهارات بعد — يمكنك التخطّي.</p>
        )}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="ghost" onClick={onSkip} disabled={busy}>
            تخطّي
          </Button>
          <Button
            type="button"
            onClick={() => void onSave({ skills })}
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
