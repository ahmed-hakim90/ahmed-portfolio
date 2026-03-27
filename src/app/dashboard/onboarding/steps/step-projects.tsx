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

type ProjRow = SiteJson["projects"][number];

const emptyRow = (): ProjRow => ({
  title: "",
  href: "",
  dates: "",
  active: true,
  description: "",
  technologies: [],
  links: [],
  image: "",
  video: "",
});

type Props = {
  siteData: SiteJson;
  onSave: (patch: Partial<SiteJson>) => Promise<void>;
  onSkip: () => void;
  saving: boolean;
  controlsLocked?: boolean;
  registerActions: RegisterOnboardingStepActionsFn;
};

export function StepProjects({
  siteData,
  onSave,
  onSkip,
  saving,
  controlsLocked = false,
  registerActions,
}: Props) {
  const busy = saving || controlsLocked;
  const [rows, setRows] = useState<ProjRow[]>(() =>
    siteData.projects?.length
      ? siteData.projects.map((p) => ({ ...p, technologies: [...p.technologies] }))
      : [emptyRow()],
  );

  useEffect(() => {
    setRows(
      siteData.projects?.length
        ? siteData.projects.map((p) => ({
            ...p,
            technologies: [...p.technologies],
          }))
        : [emptyRow()],
    );
  }, [siteData]);

  useEffect(() => {
    registerActions({
      kind: "form",
      save: () => void onSave({ projects: rows }),
      skip: onSkip,
    });
    return () => registerActions(null);
  }, [registerActions, onSave, onSkip, rows]);

  function updateRow(i: number, field: keyof ProjRow, value: string | boolean) {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[i]! };
      (row as Record<string, unknown>)[field] = value;
      next[i] = row;
      return next;
    });
  }

  function updateTech(i: number, raw: string) {
    const technologies = raw
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[i]! };
      row.technologies = technologies;
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
        <CardTitle className="text-xl sm:text-2xl">المشاريع</CardTitle>
        <CardDescription>
          أضف مشروعاً مع وصف وتقنيات — رابط الموقع أو المستودع اختياري.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-5 pb-6 pt-2 sm:px-8 sm:pb-8">
        {rows.map((row, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                مشروع {i + 1}
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
                <label className="text-xs font-medium">عنوان المشروع</label>
                <input
                  className={authFieldClass}
                  value={row.title}
                  onChange={(e) => updateRow(i, "title", e.target.value)}
                  placeholder="اسم المشروع"
                  disabled={busy}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-medium">رابط (موقع أو GitHub)</label>
                <input
                  className={authFieldClass}
                  dir="ltr"
                  value={row.href}
                  onChange={(e) => updateRow(i, "href", e.target.value)}
                  placeholder="https://github.com/… أو رابط الموقع"
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">الفترة</label>
                <input
                  className={authFieldClass}
                  dir="ltr"
                  value={row.dates ?? ""}
                  onChange={(e) => updateRow(i, "dates", e.target.value)}
                  placeholder="2024"
                  disabled={busy}
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={row.active}
                    onChange={(e) => updateRow(i, "active", e.target.checked)}
                    disabled={busy}
                  />
                  نشط
                </label>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-medium">التقنيات (مفصولة بفاصلة)</label>
                <input
                  className={authFieldClass}
                  dir="ltr"
                  value={row.technologies.join(", ")}
                  onChange={(e) => updateTech(i, e.target.value)}
                  placeholder="React, Next.js"
                  disabled={busy}
                />
              </div>
              <DriveUrlField
                id={`onboarding-project-image-${i}`}
                label="صورة المشروع"
                value={row.image}
                onChange={(v) => updateRow(i, "image", v)}
                uploadKind="project"
                className="sm:col-span-2"
                disabled={busy}
              />
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-medium">وصف</label>
                <textarea
                  className={`${authFieldClass} min-h-[80px] resize-y py-3`}
                  value={row.description}
                  onChange={(e) => updateRow(i, "description", e.target.value)}
                  placeholder="وصف مختصر للمشروع ودورك فيه"
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
          إضافة مشروع
        </Button>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="ghost" onClick={onSkip} disabled={busy}>
            تخطّي
          </Button>
          <Button
            type="button"
            onClick={() => void onSave({ projects: rows })}
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
