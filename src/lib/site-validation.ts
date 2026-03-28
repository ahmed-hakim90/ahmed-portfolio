import type { SiteJson } from "@/data/site-defaults";

export type SiteValidationErrors = {
  name?: string;
  description?: string;
  locationLink?: string;
  email?: string;
  tel?: string;
  social?: string;
  contact?: string;
};

function hasValue(v: string | undefined | null): boolean {
  return typeof v === "string" && v.trim() !== "";
}

export function isValidHttpUrl(value: string): boolean {
  const t = value.trim();
  if (!t) return true;
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  const t = email.trim();
  if (!t) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

export function isValidPhone(phone: string): boolean {
  const t = phone.trim();
  if (!t) return true;
  return /^\+?[0-9()\-\s]{6,20}$/.test(t);
}

function hasContactMethod(remote: SiteJson): boolean {
  if (hasValue(remote.contact?.email) || hasValue(remote.contact?.tel)) return true;
  const social = remote.contact?.social ?? {};
  return Object.values(social).some(
    (entry) =>
      entry &&
      typeof entry === "object" &&
      typeof entry.url === "string" &&
      entry.url.trim() !== "",
  );
}

export function validateSiteForSave(remote: SiteJson): SiteValidationErrors {
  const errors: SiteValidationErrors = {};

  if (!remote.name.trim()) {
    errors.name = "الاسم الظاهر مطلوب.";
  }
  if (!remote.description.trim()) {
    errors.description = "العنوان الوظيفي مطلوب.";
  }
  if (!isValidHttpUrl(remote.locationLink ?? "")) {
    errors.locationLink = "رابط الموقع الجغرافي يجب أن يبدأ بـ http:// أو https://";
  }
  if (!isValidEmail(remote.contact?.email ?? "")) {
    errors.email = "صيغة البريد الإلكتروني غير صحيحة.";
  }
  if (!isValidPhone(remote.contact?.tel ?? "")) {
    errors.tel = "رقم الهاتف غير صالح.";
  }

  const social = remote.contact?.social ?? {};
  const invalidSocialKey = Object.entries(social).find(([_, entry]) => {
    const value = entry?.url ?? "";
    return typeof value === "string" && value.trim() !== "" && !isValidHttpUrl(value);
  })?.[0];

  if (invalidSocialKey) {
    errors.social = `رابط ${invalidSocialKey} غير صالح.`;
  }

  if (!hasContactMethod(remote)) {
    errors.contact = "أضف وسيلة تواصل واحدة على الأقل (بريد أو هاتف أو رابط شبكة).";
  }

  return errors;
}
