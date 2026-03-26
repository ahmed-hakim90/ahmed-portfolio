"use client";

import { authFieldClass } from "@/components/auth/auth-shell";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  showLabel?: string;
  hideLabel?: string;
};

export function PasswordInput({
  className,
  showLabel = "إظهار كلمة المرور",
  hideLabel = "إخفاء كلمة المرور",
  id: idProp,
  ...props
}: PasswordInputProps) {
  const uid = useId();
  const id = idProp ?? uid;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        className={cn(authFieldClass, "pe-11", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute end-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-controls={id}
        aria-pressed={visible}
        aria-label={visible ? hideLabel : showLabel}
      >
        {visible ? (
          <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
        ) : (
          <Eye className="h-4 w-4 shrink-0" aria-hidden />
        )}
      </button>
    </div>
  );
}
