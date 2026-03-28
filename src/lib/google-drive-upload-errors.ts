/**
 * Maps raw Google Drive / upload API errors to readable Arabic messages for the UI.
 */
export function formatUploadErrorForDisplay(raw: string): {
  title: string;
  detail?: string;
} {
  const t = raw.trim();
  if (!t) {
    return { title: "فشل الرفع. حاول مرة أخرى." };
  }

  if (
    t.includes("storageQuotaExceeded") ||
    t.includes("Service Accounts do not have storage quota")
  ) {
    return {
      title: "لا يمكن الرفع: حساب الخدمة لا يملك مساحة في Google Drive الشخصي.",
      detail:
        "الحل: أنشئ Shared Drive (مشترك) وضع المجلد الجذر هناك، أو شارِك المجلد مع بريد حساب الخدمة بصلاحية محرّر، وحدّث GOOGLE_DRIVE_ROOT_FOLDER_ID ليكون داخل ذلك المجلد. بديل آخر: استخدام OAuth بدل حساب الخدمة لرفع الملفات.",
    };
  }

  if (t.includes("403") && t.includes("permission")) {
    return {
      title: "تم رفض الصلاحية (403).",
      detail: "تأكد أن المجلد الجذر مشارَك مع بريد حساب الخدمة بصلاحية محرّر.",
    };
  }

  if (t.includes("401") || t.includes("Unauthorized")) {
    return {
      title: "انتهت الجلسة أو غير مصرّح.",
      detail: "سجّل الخروج ثم الدخول مرة أخرى وحاول الرفع من جديد.",
    };
  }

  if (
    t.includes("GOOGLE_DRIVE_ROOT_FOLDER_ID is invalid") ||
    t.includes("File not found: .")
  ) {
    return {
      title: "معرّف المجلد الجذر في Google Drive غير صحيح.",
      detail:
        "قيمة GOOGLE_DRIVE_ROOT_FOLDER_ID الحالية غير صالحة. انسخ Folder ID الصحيح من رابط المجلد: https://drive.google.com/drive/folders/<FOLDER_ID>",
    };
  }

  if (t.includes("fetch failed") || t.includes("ETIMEDOUT")) {
    return {
      title: "تعذّر الاتصال بخوادم Google Drive حالياً.",
      detail:
        "جرّب مرة أخرى بعد ثوانٍ. إذا استمرت المشكلة، راجع اتصال الإنترنت/Firewall أو DNS على السيرفر.",
    };
  }

  // Strip noisy prefix from our own throws
  const withoutPrefix = t.replace(/^Drive upload failed \(\d+\):\s*/i, "").trim();

  // Try to pull JSON "message" from Drive error blob
  const jsonMsg = extractJsonMessage(withoutPrefix);
  if (jsonMsg && jsonMsg.length < 500) {
    return { title: jsonMsg };
  }

  if (withoutPrefix.length > 280) {
    return {
      title: "فشل الاتصال بـ Google Drive.",
      detail: withoutPrefix.slice(0, 400) + (withoutPrefix.length > 400 ? "…" : ""),
    };
  }

  return { title: withoutPrefix };
}

function extractJsonMessage(s: string): string | null {
  const m = s.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (!m?.[1]) return null;
  return m[1].replace(/\\n/g, " ").trim();
}
