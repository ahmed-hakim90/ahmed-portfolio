import { PlatformActivityChart } from "@/components/analytics/platform-activity-chart";
import { getAdminSession } from "@/lib/admin-request";
import { getPlatformAnalyticsSnapshot } from "@/lib/platform-analytics";
import {
  BarChart3,
  Globe,
  LayoutDashboard,
  MousePointerClick,
  Printer,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "تحليلات المنصة",
};

export const dynamic = "force-dynamic";

function fmt(n: number): string {
  if (n < 0) return "—";
  return n.toLocaleString("ar-EG");
}

export default async function PlatformAnalyticsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/dashboard/login");
  }
  if (session.role !== "owner") {
    redirect("/dashboard/site");
  }

  const data = await getPlatformAnalyticsSnapshot();

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          تحليلات المنصة
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          أجهزة زارت الموقع العام مقابل دخلت لوحة التحكم، أعداد الحسابات، المواقع
          التي حُفظت من المحرر، ونقرات طباعة السيرة. البيانات اليومية بالتوقيت
          UTC.
        </p>
        {!data.firestoreConfigured ? (
          <p className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
            Firestore غير مُعدّ — الأرقام ستظهر صفراً أو &quot;—&quot; حتى يتم
            ضبط المتغيرات.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                أجهزة (موقع عام)
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                {fmt(data.uniqueDevicesPublic)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                أول زيارة مسجّلة لكل متصفح (معرّف محلي).
              </p>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Globe className="size-5" aria-hidden />
            </span>
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                أجهزة (لوحة التحكم)
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                {fmt(data.uniqueDevicesDashboard)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                أول دخول مسجّل للوحة بعد تسجيل الدخول.
              </p>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <LayoutDashboard className="size-5" aria-hidden />
            </span>
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                نقرات طباعة السيرة
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                {fmt(data.totalPrintClicks)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                زر Print / Save PDF في صفحة طباعة السيرة.
              </p>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Printer className="size-5" aria-hidden />
            </span>
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                الحسابات
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                {fmt(data.totalAccounts)}
              </p>
              <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between gap-4">
                  <dt>عملاء</dt>
                  <dd className="font-medium tabular-nums text-foreground">
                    {fmt(data.clientAccounts)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>عملاء نشطون (غير معطّلين)</dt>
                  <dd className="font-medium tabular-nums text-foreground">
                    {fmt(data.activeClientAccounts)}
                  </dd>
                </div>
              </dl>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Users className="size-5" aria-hidden />
            </span>
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm sm:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                مواقع حُفظ محتواها من المحرر
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                {fmt(data.sitesSavedFromEditor)}
              </p>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
                عدد مستندات <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">sites</code>{" "}
                التي مرّ عليها حفظ واحد على الأقل من صفحة المحرر (PUT). التلقائي
                عند أول تحميل بدون حفظ لا يُحسب.
              </p>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <MousePointerClick className="size-5" aria-hidden />
            </span>
          </div>
        </article>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BarChart3 className="size-4 shrink-0 opacity-70" aria-hidden />
        <span>النشاط اليومي</span>
      </div>
      <PlatformActivityChart dailyActivity={data.dailyActivity} />
    </div>
  );
}
