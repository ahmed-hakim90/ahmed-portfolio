"use client";

import { Button } from "@/components/ui/button";
import {
  uploadAdminImage,
  type AdminUploadKind,
} from "@/lib/admin-upload-client";
import { googleDriveShareUrlToViewUrl } from "@/lib/google-drive-url";
import { cn } from "@/lib/utils";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  uploadKind?: AdminUploadKind;
  disabled?: boolean;
};

export function DriveUrlField({
  id,
  label,
  value,
  onChange,
  className,
  uploadKind,
  disabled = false,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusError, setStatusError] = useState(false);

  async function handleUpload(file: File | null) {
    if (!file || !uploadKind) return;
    setUploading(true);
    setStatus(null);
    setStatusError(false);
    const result = await uploadAdminImage(file, uploadKind);
    if (!result.ok) {
      setStatus(result.error);
      setStatusError(true);
      setUploading(false);
      return;
    }
    onChange(result.url);
    setStatus("تم ضغط الصورة ورفعها وتحديث الرابط.");
    setStatusError(false);
    setUploading(false);
  }

  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}{" "}
        <span className="font-normal text-muted-foreground/80">
          (Google Drive: paste share link, then convert — file must be shared)
        </span>
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={id}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="https://drive.google.com/file/d/…"
          disabled={disabled || uploading}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 text-xs"
          disabled={disabled || uploading}
          onClick={() => {
            const next = googleDriveShareUrlToViewUrl(value);
            if (next) onChange(next);
          }}
        >
          Convert Drive link
        </Button>
        {uploadKind ? (
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted/50">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              disabled={disabled || uploading}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                void handleUpload(file);
                e.currentTarget.value = "";
              }}
            />
            {uploading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="size-3.5" aria-hidden />
                Upload image
              </>
            )}
          </label>
        ) : null}
      </div>
      {uploadKind ? (
        status ? (
          <p
            className={cn(
              "text-[11px]",
              statusError
                ? "text-destructive"
                : "text-emerald-600 dark:text-emerald-400",
            )}
          >
            {status}
          </p>
        ) : (
          <p className="text-[10px] text-muted-foreground">
            Supported: JPG/PNG/WebP/GIF/AVIF, max 5MB.
          </p>
        )
      ) : null}
    </div>
  );
}
