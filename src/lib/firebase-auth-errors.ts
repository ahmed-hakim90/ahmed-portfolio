/**
 * Arabic UI copy for Firebase Auth error codes (web SDK).
 * Helps distinguish "wrong password" from Vercel/domain/API-key issues.
 */
export function firebaseAuthErrorMessageAr(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-login-credentials":
      return "البريد أو كلمة المرور غير صحيحة.";
    case "auth/unauthorized-domain":
      return "هذا النطاق غير مضاف في Firebase: Authentication ← الإعدادات ← Authorized domains (أضف نطاق Vercel أو الدومين الخاص بك).";
    case "auth/network-request-failed":
      return "تعذر الاتصال بخوادم Google. تحقق من الشبكة أو من قيود مفتاح API (HTTP referrers) في Google Cloud.";
    case "auth/too-many-requests":
      return "محاولات كثيرة. انتظر قليلاً ثم أعد المحاولة.";
    case "auth/operation-not-allowed":
      return "تسجيل الدخول بالبريد وكلمة المرور غير مفعّل في Firebase (Authentication ← طرق تسجيل الدخول).";
    case "auth/invalid-email":
      return "صيغة البريد الإلكتروني غير صالحة.";
    case "auth/weak-password":
      return "كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل.";
    case "auth/email-already-in-use":
      return "البريد مستخدم مسبقاً.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "تم إلغاء نافذة Google.";
    case "auth/popup-blocked":
      return "المتصفح منع النافذة المنبثقة. اسمح بالنوافذ المنبثقة لهذا الموقع.";
    default:
      return "تعذر إتمام المصادقة. على Vercel: طابق قيم NEXT_PUBLIC_FIREBASE_* مع .env المحلي، وأضف النطاق في Firebase، وراجع قيود مفتاح الـ API.";
  }
}

export function getFirebaseAuthErrorCode(err: unknown): string {
  if (!err || typeof err !== "object") return "";
  const o = err as Record<string, unknown>;
  if (typeof o.code === "string" && o.code.length > 0) {
    return o.code;
  }
  if (err instanceof AggregateError && Array.isArray(err.errors)) {
    for (const inner of err.errors) {
      const c = getFirebaseAuthErrorCode(inner);
      if (c) return c;
    }
  }
  if (o.cause) {
    return getFirebaseAuthErrorCode(o.cause);
  }
  return "";
}

/**
 * Message for failures during Firebase client sign-in (before calling /api/admin/login).
 */
export function resolveFirebaseClientAuthError(err: unknown): string {
  const code = getFirebaseAuthErrorCode(err);
  if (code) {
    return firebaseAuthErrorMessageAr(code);
  }
  if (err instanceof Error) {
    const m = err.message;
    if (m.includes("Missing NEXT_PUBLIC_FIREBASE")) {
      return "إعدادات Firebase في المتصفح ناقصة. انسخ قيم NEXT_PUBLIC_FIREBASE_* من المحلي إلى Vercel (Production و Preview) ثم أعد نشر المشروع.";
    }
    if (
      m.includes("Failed to fetch") ||
      m.includes("NetworkError") ||
      m.includes("Load failed")
    ) {
      return "تعذر الاتصال بالشبكة. تحقق من الاتصال أو من حظر الطلبات (CORS / حظر الإعلانات).";
    }
  }
  return "تعذر تسجيل الدخول. إن استمرت المشكلة، افتح أدوات المطوّر (F12) → Console وابحث عن رسالة الخطأ.";
}
