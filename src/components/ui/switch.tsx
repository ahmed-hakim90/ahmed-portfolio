"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type SwitchProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type" | "onChange"
> & {
  onCheckedChange?: (checked: boolean) => void;
};

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, id, checked, disabled, onCheckedChange, ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 align-middle",
          className,
        )}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full border border-border bg-muted/90 transition-[background-color,border-color] duration-200 ease-out",
            "peer-checked:border-primary peer-checked:bg-primary",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0.5 top-0.5 block h-5 w-5 rounded-full bg-background shadow-sm ring-1 ring-border/40",
            "transition-[transform] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform",
            "peer-checked:translate-x-[1.25rem]",
          )}
        />
      </div>
    );
  },
);
Switch.displayName = "Switch";

export { Switch };
