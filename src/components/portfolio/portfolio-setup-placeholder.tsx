import { Button } from "@/components/ui/button";
import Link from "next/link";

const LOGIN_HREF = "/dashboard/login?next=%2Fdashboard%2Fonboarding";

/**
 * Shown on public `/[slug]` routes while the owner has not finished onboarding.
 * Does not use site JSON (no leaked template data).
 */
export function PortfolioSetupPlaceholder() {
  return (
    <main
      className="mx-auto max-w-md px-4 py-16 text-center"
      dir="rtl"
      lang="ar"
    >
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        الصفحة قيد الإعداد
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        صفحة المحفظة غير منشورة للزوار حتى يُكمَل الملف (بيانات أساسية + قسم مهارات أو
        خبرة أو تعليم أو مشروع على الأقل). سجّل الدخول إلى لوحة التحكم وافتح معالج إعداد
        السيرة من المحرّر لإكمال الإعداد — التخطّي بين الخطوات لا يعني إكمال البيانات.
      </p>
      <Button type="button" className="mt-6" asChild>
        <Link href={LOGIN_HREF}>تسجيل الدخول وإكمال الإعداد</Link>
      </Button>
    </main>
  );
}
