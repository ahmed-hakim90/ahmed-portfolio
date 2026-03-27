"use client";

import { authFieldClass } from "@/components/auth/auth-shell";
import { DriveUrlField } from "@/components/dashboard/drive-url-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SiteJson } from "@/data/site-defaults";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { RegisterOnboardingStepActionsFn } from "../onboarding-step-actions";

type EduRow = SiteJson["education"][number];

const emptyRow = (): EduRow => ({
  school: "",
  href: "",
  degree: "",
  logoUrl: "",
  start: "",
  end: "",
});

type Props = {
  siteData: SiteJson;
  onSave: (patch: Partial<SiteJson>) => Promise<void>;
  onSkip: () => void;
  saving: boolean;
  controlsLocked?: boolean;
  registerActions: RegisterOnboardingStepActionsFn;
};

export function StepEducation({
  siteData,
  onSave,
  onSkip,
  saving,
  controlsLocked = false,
  registerActions,
}: Props) {
  const busy = saving || controlsLocked;
  const [rows, setRows] = useState<EduRow[]>(() =>
    siteData.education?.length
      ? siteData.education.map((e) => ({ ...e }))
      : [emptyRow()],
  );

  useEffect(() => {
    setRows(
      siteData.education?.length
        ? siteData.education.map((e) => ({ ...e }))
        : [emptyRow()],
    );
  }, [siteData]);

  useEffect(() => {
    registerActions({
      kind: "form",
      save: () => void onSave({ education: rows }),
      skip: onSkip,
    });
    return () => registerActions(null);
  }, [registerActions, onSave, onSkip, rows]);

  function updateRow(i: number, field: keyof EduRow, value: string) {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[i]! };
      (row as Record<string, unknown>)[field] = value;
      next[i] = row;
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(i: number) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, j) => j !== i)));
  }

  return (
    <Card className="w-full border-border/80 shadow-lg">
      <CardHeader className="space-y-1 px-5 pb-2 pt-6 text-center sm:px-8 sm:pt-8">
        <CardTitle className="text-xl sm:text-2xl">التعليم</CardTitle>
        <CardDescription>الجامعات، الدورات، أو الشهادات.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-5 pb-6 pt-2 sm:px-8 sm:pb-8">
        {rows.map((row, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                تعليم {i + 1}
              </span>
              {rows.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => removeRow(i)}
                  disabled={busy}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-medium">المؤسسة / الجامعة</label>
                <input
                  className={authFieldClass}
                  value={row.school}
                  onChange={(e) => updateRow(i, "school", e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-medium">الدرجة / التخصص</label>
                <input
                  className={authFieldClass}
                  value={row.degree}
                  onChange={(e) => updateRow(i, "degree", e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">من</label>
                <input
                  className={authFieldClass}
                  dir="ltr"
                  value={row.start}
                  onChange={(e) => updateRow(i, "start", e.target.value)}
                  placeholder="2018"
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">إلى</label>
                <input
                  className={authFieldClass}
                  dir="ltr"
                  value={row.end}
                  onChange={(e) => updateRow(i, "end", e.target.value)}
                  placeholder="2022"
                  disabled={busy}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-medium">رابط (اختياري)</label>
                <input
                  className={authFieldClass}
                  dir="ltr"
                  value={row.href}
                  onChange={(e) => updateRow(i, "href", e.target.value)}
                  disabled={busy}
                />
              </div>
              <DriveUrlField
                id={`onb-education-logo-${i}`}
                label="شعار الجهة / المؤسسة (Logo URL)"
                value={row.logoUrl}
                onChange={(v) => updateRow(i, "logoUrl", v)}
                uploadKind="education-logo"
                className="space-y-2 sm:col-span-2"
                disabled={busy}
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={addRow}
          disabled={busy}
        >
          <Plus className="h-4 w-4" />
          إضافة تعليم
        </Button>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="ghost" onClick={onSkip} disabled={busy}>
            تخطّي
          </Button>
          <Button
            type="button"
            onClick={() => void onSave({ education: rows })}
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
