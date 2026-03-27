"use client";

import { Button } from "@/components/ui/button";
import { sanitizeCvPdfFilename } from "@/lib/cv-pdf-asset-url";
import { useCallback, useState } from "react";
import { toast } from "sonner";

function parseFilenameFromContentDisposition(
  header: string | null,
): string | null {
  if (!header) return null;
  const star = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1].trim());
    } catch {
      return star[1].trim();
    }
  }
  const plain = /filename="([^"]+)"/i.exec(header);
  if (plain?.[1]) return plain[1];
  const plain2 = /filename=([^;\s]+)/i.exec(header);
  if (plain2?.[1]) return plain2[1].replace(/^["']|["']$/g, "");
  return null;
}

type Props = {
  /** GET endpoint that returns application/pdf (e.g. /api/public/cv/pdf?slug=… or /api/admin/cv/pdf). */
  pdfDownloadUrl: string;
  label?: string;
  /** Tooltip */
  title?: string;
  /** Fallback download name if Content-Disposition is missing */
  suggestedFileName?: string;
};

export function PortfolioCvDownload({
  pdfDownloadUrl,
  label = "Download CV",
  title,
  suggestedFileName,
}: Props) {
  const [busy, setBusy] = useState(false);

  const onClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setBusy(true);
      try {
        const res = await fetch(pdfDownloadUrl, {
          method: "GET",
          credentials: "same-origin",
        });
        if (!res.ok) {
          if (res.status === 401) {
            toast.error("يجب تسجيل الدخول لتحميل السيرة.");
          } else if (res.status === 404) {
            toast.error("تعذّر العثور على السيرة.");
          } else {
            const err = await res
              .json()
              .catch(() => null) as { error?: string } | null;
            toast.error(
              err && typeof err.error === "string"
                ? err.error
                : "تعذّر إنشاء ملف PDF.",
            );
          }
          return;
        }

        const blob = await res.blob();
        if (blob.type && !blob.type.includes("pdf")) {
          toast.error("الاستجابة ليست ملف PDF.");
          return;
        }

        void fetch("/api/public/analytics/pdf-download", {
          method: "POST",
        }).catch(() => {});

        const fromHeader = parseFilenameFromContentDisposition(
          res.headers.get("content-disposition"),
        );
        const base =
          fromHeader ??
          `${sanitizeCvPdfFilename(suggestedFileName ?? "CV")}-CV.pdf`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = base;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch {
        toast.error("فشل التحميل. حاول مرة أخرى.");
      } finally {
        setBusy(false);
      }
    },
    [pdfDownloadUrl, suggestedFileName],
  );

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="shrink-0"
      title={title}
      disabled={busy}
      onClick={onClick}
    >
      {busy ? "Loading…" : label}
    </Button>
  );
}
