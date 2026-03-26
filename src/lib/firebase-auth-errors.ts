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
  if (err && typeof err === "object" && "code" in err) {
    return String((err as { code: string }).code);
  }
  return "";
}
