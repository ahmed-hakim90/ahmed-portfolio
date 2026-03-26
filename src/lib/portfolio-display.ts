import type { PublicControls } from "@/data/site-defaults";

/**
 * `dir` + `lang` for portfolio root wrappers (public page, preview, print).
 */
export function getPortfolioHtmlAttrs(ui: PublicControls["ui"]): {
  dir: "rtl" | "ltr";
  lang: string;
} {
  const dir = ui.portfolioDir === "rtl" ? "rtl" : "ltr";
  const raw = (ui.portfolioLang ?? "en").trim().slice(0, 12);
  const lang = /^[a-zA-Z]{2}(-[a-zA-Z0-9]+)?$/.test(raw) ? raw : "en";
  return { dir, lang };
}
