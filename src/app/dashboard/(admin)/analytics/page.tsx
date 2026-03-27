import { AnalyticsSparkline } from "@/components/analytics/analytics-sparkline";
import { PlatformActivityChart } from "@/components/analytics/platform-activity-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminSession } from "@/lib/admin-request";
import { getPlatformAnalyticsSnapshot } from "@/lib/platform-analytics";
import {
  BarChart3,
  FileDown,
  Globe,
  Hourglass,
  LayoutDashboard,
  ListChecks,
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
          أجهزة زارت الموقع العام مقابل دخلت لوحة التحكم، أعداد الحسابات، إكمال
          معالج إعداد السيرة بعد تسجيل الدخول، المواقع التي حُفظت من المحرر،
          ونقرات طباعة السيرة. البيانات اليومية بالتوقيت UTC.
        </p>
        {!data.firestoreConfigured ? (
          <p className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
            Firestore غير مُعدّ — الأرقام ستظهر صفراً أو &quot;—&quot; حتى يتم
            ضبط المتغيرات.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardDescription>أجهزة (موقع عام)</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {fmt(data.uniqueDevicesPublic)}
              </CardTitle>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Globe className="size-5" aria-hidden />
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            <AnalyticsSparkline
              rows={data.dailyActivity}
              dataKey="publicPings"
              color="hsl(var(--muted-foreground))"
            />
            <p className="text-xs text-muted-foreground">
              أول زيارة مسجّلة لكل متصفح (معرّف محلي).
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardDescription>أجهزة (لوحة التحكم)</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {fmt(data.uniqueDevicesDashboard)}
              </CardTitle>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <LayoutDashboard className="size-5" aria-hidden />
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            <AnalyticsSparkline
              rows={data.dailyActivity}
              dataKey="dashboardPings"
              color="hsl(var(--primary))"
            />
            <p className="text-xs text-muted-foreground">
              أول دخول مسجّل للوحة بعد تسجيل الدخول.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardDescription>نقرات طباعة السيرة</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {fmt(data.totalPrintClicks)}
              </CardTitle>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Printer className="size-5" aria-hidden />
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            <AnalyticsSparkline
              rows={data.dailyActivity}
              dataKey="prints"
              color="#d97706"
            />
            <p className="text-xs text-muted-foreground">
              زر Print / Save PDF في صفحة طباعة السيرة.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardDescription>تحميلات السيرة (PDF)</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {fmt(data.totalPdfDownloads)}
              </CardTitle>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <FileDown className="size-5" aria-hidden />
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            <AnalyticsSparkline
              rows={data.dailyActivity}
              dataKey="pdfDownloads"
              color="#0284c7"
            />
            <p className="text-xs text-muted-foreground">
              زر Download CV من صفحة المحفظة العامة.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm sm:col-span-2 xl:col-span-1">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardDescription>الحسابات</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {fmt(data.totalAccounts)}
              </CardTitle>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Users className="size-5" aria-hidden />
            </span>
          </CardHeader>
          <CardContent>
            <dl className="space-y-1 text-xs text-muted-foreground">
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
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardDescription>عملاء أكملوا إعداد السيرة</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {fmt(data.clientsOnboardingCompleted)}
              </CardTitle>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <ListChecks className="size-5" aria-hidden />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              عملاء أنهوا معالج إعداد السيرة (الخطوات السبع) بعد أول تسجيل دخول،
              أو حسابات قديمة تُعامل كمكتملة تلقائياً.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardDescription>عملاء لم يكملوا المرحلة الأولى</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {fmt(data.clientsStuckOnFirstOnboardingStep)}
              </CardTitle>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Hourglass className="size-5" aria-hidden />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              عملاء دخلوا المعالج ولم ينتقلوا من الخطوة الأولى (الخطوة 1 من 7).
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm sm:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardDescription>مواقع حُفظ محتواها من المحرر</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {fmt(data.sitesSavedFromEditor)}
              </CardTitle>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <MousePointerClick className="size-5" aria-hidden />
            </span>
          </CardHeader>
          <CardContent>
            <p className="max-w-xl text-xs text-muted-foreground">
              عدد مستندات <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">sites</code>{" "}
              التي مرّ عليها حفظ واحد على الأقل من صفحة المحرر (PUT). التلقائي
              عند أول تحميل بدون حفظ لا يُحسب.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BarChart3 className="size-4 shrink-0 opacity-70" aria-hidden />
        <span>النشاط اليومي</span>
      </div>
      <PlatformActivityChart dailyActivity={data.dailyActivity} />
    </div>
  );
}
