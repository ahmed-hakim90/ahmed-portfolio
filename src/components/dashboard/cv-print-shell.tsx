"use client";

import {
  PrintCvToolbar,
  type CvPrintPreset,
} from "@/components/dashboard/print-cv-toolbar";
import { useEffect, useState, type ReactNode } from "react";

export type { CvPrintPreset };

const STORAGE_KEY = "cv-print-preset";
const STORAGE_INCLUDE_PHOTO = "cv-print-include-photo";

export function CvPrintShell({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<CvPrintPreset>("classic");
  const [includePhoto, setIncludePhoto] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "compact" || raw === "highContrast" || raw === "classic") {
        setPreset(raw);
      }
      const photoRaw = localStorage.getItem(STORAGE_INCLUDE_PHOTO);
      if (photoRaw === "0" || photoRaw === "false") setIncludePhoto(false);
      if (photoRaw === "1" || photoRaw === "true") setIncludePhoto(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preset);
    } catch {
      /* ignore */
    }
  }, [preset]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_INCLUDE_PHOTO, includePhoto ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [includePhoto]);

  return (
    <div
      className={`cv-print-page cv-print-preset-${preset}`}
      data-cv-preset={preset}
      data-cv-include-photo={includePhoto ? "true" : "false"}
    >
      <PrintCvToolbar
        preset={preset}
        onPresetChange={setPreset}
        includePhoto={includePhoto}
        onIncludePhotoChange={setIncludePhoto}
      />
      {children}
    </div>
  );
}
