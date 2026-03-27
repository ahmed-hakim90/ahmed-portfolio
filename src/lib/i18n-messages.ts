import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

export type Locale = "en" | "ar";

export type UiMessages = typeof en;

export function getUiMessages(locale: Locale): UiMessages {
  return locale === "en" ? en : ar;
}

export function localeFromCookie(value: string | undefined): Locale {
  return value === "en" ? "en" : "ar";
}
