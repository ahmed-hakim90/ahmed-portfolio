"use client";

import { Button } from "@/components/ui/button";
import { googleDriveShareUrlToViewUrl } from "@/lib/google-drive-url";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
};

export function DriveUrlField({ id, label, value, onChange, className }: Props) {
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
          className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs"
          placeholder="https://drive.google.com/file/d/…"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 text-xs"
          onClick={() => {
            const next = googleDriveShareUrlToViewUrl(value);
            if (next) onChange(next);
          }}
        >
          Convert Drive link
        </Button>
      </div>
    </div>
  );
}
