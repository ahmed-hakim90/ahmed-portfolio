"use client";

import { useState } from "react";

export function MockBrowserThemeToggle({
  className,
  ptogClass,
  ptogActiveClass,
}: {
  className: string;
  ptogClass: string;
  ptogActiveClass: string;
}) {
  const [mode, setMode] = useState<"light" | "dark">("light");
  return (
    <div className={className}>
      <button
        type="button"
        className={`${ptogClass} ${mode === "light" ? ptogActiveClass : ""}`}
        aria-label="وضع فاتح"
        onClick={() => setMode("light")}
      >
        ☀
      </button>
      <button
        type="button"
        className={`${ptogClass} ${mode === "dark" ? ptogActiveClass : ""}`}
        aria-label="وضع داكن"
        onClick={() => setMode("dark")}
      >
        ☾
      </button>
    </div>
  );
}
