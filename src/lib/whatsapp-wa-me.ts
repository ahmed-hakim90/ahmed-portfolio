/** Strip to digits only (for phone / wa.me path). */
export function digitsOnly(s: string): string {
  return s.replace(/[^\d]/g, "");
}

/**
 * From a stored `https://wa.me/...` URL or raw digits, return digits for display.
 */
export function parseWaMeDigitsFromUrl(url: string): string {
  const t = url.trim();
  if (!t) return "";
  try {
    const u = new URL(t.startsWith("http") ? t : `https://${t}`);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "wa.me") {
      const first = u.pathname.replace(/^\//, "").split("/")[0] ?? "";
      return digitsOnly(first);
    }
  } catch {
    /* not a URL */
  }
  return digitsOnly(t);
}

/** `https://wa.me/{digits}` or empty string if no digits. */
export function buildWaMeUrl(digits: string): string {
  const d = digitsOnly(digits);
  return d ? `https://wa.me/${d}` : "";
}
