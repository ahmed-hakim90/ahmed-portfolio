"use client";

import { Button } from "@/components/ui/button";

export type CvPrintPreset = "classic" | "compact" | "highContrast";

type Props = {
  preset: CvPrintPreset;
  onPresetChange: (p: CvPrintPreset) => void;
  includePhoto: boolean;
  onIncludePhotoChange: (v: boolean) => void;
};

export function PrintCvToolbar({
  preset,
  onPresetChange,
  includePhoto,
  onIncludePhotoChange,
}: Props) {
  return (
    <div
      className="mb-6 flex flex-wrap items-center justify-end gap-3 border-b border-border pb-4 print:hidden"
      data-testid="cv-print-toolbar"
    >
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="whitespace-nowrap">صورة الملف</span>
        <select
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
          value={includePhoto ? "1" : "0"}
          onChange={(e) => onIncludePhotoChange(e.target.value === "1")}
        >
          <option value="1">مع الصورة</option>
          <option value="0">بدون صورة</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="whitespace-nowrap">نمط الطباعة</span>
        <select
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
          value={preset}
          onChange={(e) => onPresetChange(e.target.value as CvPrintPreset)}
        >
          <option value="classic">كلاسيكي</option>
          <option value="compact">مدمج</option>
          <option value="highContrast">تباين عالٍ</option>
        </select>
      </label>
      <Button
        type="button"
        onClick={() => {
          void fetch("/api/admin/analytics/print", {
            method: "POST",
            credentials: "same-origin",
          }).catch(() => {});
          window.print();
        }}
      >
        Print / Save PDF
      </Button>
    </div>
  );
}
