/**
 * Maps /api/admin/login error strings to Arabic for the dashboard login UI.
 */
export function dashboardLoginServerErrorAr(apiError: string): string {
  const t = apiError.trim();
  switch (t) {
    case "Login failed":
      return "تعذر إكمال تسجيل الدخول من الخادم. حدّث الصفحة وحاول مرة أخرى.";
    case "No dashboard access for this account":
      return "هذا الحساب غير مسجّل في لوحة التحكم. يجب أن يضيفك المالك من «المستخدمون»، أو سجّل من صفحة إنشاء حساب العملاء، أو أنشئ صاحب المنصة من الإعداد الأولي.";
    case "Invalid or expired token":
      return "انتهت صلاحية الرمز أو أنه غير صالح. أعد المحاولة.";
    case "Account disabled":
      return "هذا الحساب معطّل.";
    case "User not found":
      return "المستخدم غير موجود في خادم المصادقة.";
    case "idToken required":
      return "خطأ في الطلب. حدّث الصفحة وأعد المحاولة.";
    case "ADMIN_DASHBOARD_SECRET is not configured":
    case "Firebase Admin is not configured":
      return "إعدادات الخادم غير مكتملة على الاستضافة (تحقق من FIREBASE_SERVICE_ACCOUNT_JSON و ADMIN_DASHBOARD_SECRET في Vercel).";
    default:
      if (/[\u0600-\u06FF]/.test(t)) return t;
      return t.length > 0
        ? `تعذر تسجيل الدخول: ${t}`
        : "تعذر تسجيل الدخول من الخادم.";
  }
}
