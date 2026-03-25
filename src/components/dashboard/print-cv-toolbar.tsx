"use client";

import { Button } from "@/components/ui/button";

export function PrintCvToolbar() {
  return (
    <div
      className="mb-6 flex items-center justify-end border-b border-border pb-4 print:hidden"
      data-testid="cv-print-toolbar"
    >
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
