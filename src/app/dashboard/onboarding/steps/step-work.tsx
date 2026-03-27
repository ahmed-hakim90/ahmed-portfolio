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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { RegisterOnboardingStepActionsFn } from "../onboarding-step-actions";

type WorkRow = SiteJson["work"][number];

const emptyRow = (): WorkRow => ({
  company: "",
  href: "",
  badges: [],
  location: "",
  title: "",
  logoUrl: "",
  start: "",
  end: "",
  description: "",
});

type Props = {
  siteData: SiteJson;
  onSave: (patch: Partial<SiteJson>) => Promise<void>;
  onSkip: () => void;
  saving: boolean;
  controlsLocked?: boolean;
  registerActions: RegisterOnboardingStepActionsFn;
};

export function StepWork({
  siteData,
  onSave,
  onSkip,
  saving,
  controlsLocked = false,
  registerActions,
}: Props) {
  const busy = saving || controlsLocked;
  const [rows, setRows] = useState<WorkRow[]>(() =>
    siteData.work?.length ? siteData.work.map((w) => ({ ...w })) : [emptyRow()],
  );

  useEffect(() => {
    setRows(
      siteData.work?.length ? siteData.work.map((w) => ({ ...w })) : [emptyRow()],
    );
  }, [siteData]);

  useEffect(() => {
    registerActions({
      kind: "form",
      save: () => void onSave({ work: rows }),
      skip: onSkip,
    });
    return () => registerActions(null);
  }, [registerActions, onSave, onSkip, rows]);

  function updateRow(i: number, field: keyof WorkRow, value: string) {
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
        <CardTitle className="text-xl sm:text-2xl">الخبرة العملية</CardTitle>
        <CardDescription>أضف وظيفة أو أكثر — يمكنك تعديلها لاحقاً من المحرر.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-5 pb-6 pt-2 sm:px-8 sm:pb-8">
        {rows.map((row, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                خبرة {i + 1}
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
                <label className="text-xs font-medium">المسمى الوظيفي</label>
                <input
                  className={authFieldClass}
                  value={row.title}
                  onChange={(e) => updateRow(i, "title", e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">الشركة</label>
                <input
                  className={authFieldClass}
                  value={row.company}
                  onChange={(e) => updateRow(i, "company", e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">الموقع</label>
                <input
                  className={authFieldClass}
                  value={row.location}
                  onChange={(e) => updateRow(i, "location", e.target.value)}
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
                  placeholder="2022"
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
                  placeholder="الآن"
                  disabled={busy}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-medium">رابط الشركة (اختياري)</label>
                <input
                  className={authFieldClass}
                  dir="ltr"
                  value={row.href}
                  onChange={(e) => updateRow(i, "href", e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-medium">وصف مختصر</label>
                <textarea
                  className={`${authFieldClass} min-h-[80px] resize-y py-3`}
                  value={row.description}
                  onChange={(e) => updateRow(i, "description", e.target.value)}
                  disabled={busy}
                />
              </div>
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
          إضافة خبرة
        </Button>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="ghost" onClick={onSkip} disabled={busy}>
            تخطّي
          </Button>
          <Button
            type="button"
            onClick={() => void onSave({ work: rows })}
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
