import { AnalyticsSparkline } from "@/components/analytics/analytics-sparkline";
import { PlatformActivityChart } from "@/components/analytics/platform-activity-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBlogPostCount } from "@/data/blog";
import { listAdminUsers, normalizeOnboardingStep } from "@/lib/admin-users";
import { getAdminSession } from "@/lib/admin-request";
import { getFirestoreDb } from "@/lib/firebase-admin";
import { getPlatformAnalyticsSnapshot } from "@/lib/platform-analytics";
import type { Timestamp } from "firebase-admin/firestore";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BellRing,
  FileText,
  Mail,
  TrendingUp,
  UserCheck2,
  UserCog,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "الرئيسية",
};

export const dynamic = "force-dynamic";

type OwnerMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string | null;
};

function fmt(n: number): string {
  if (n < 0 || Number.isNaN(n)) return "—";
  return n.toLocaleString("ar-EG");
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function tsToIso(t: Timestamp | null | undefined): string | null {
  if (!t || typeof t.toDate !== "function") return null;
  try {
    return t.toDate().toISOString();
  } catch {
    return null;
  }
}

function toPercent(n: number, total: number): string {
  if (n < 0 || total <= 0) return "—";
  return `${Math.round((n / total) * 100).toLocaleString("ar-EG")}%`;
}

async function getOwnerInboxSummary(ownerId: string): Promise<{
  unreadCount: number;
  latestMessages: OwnerMessage[];
}> {
  const db = getFirestoreDb();
  if (!db) return { unreadCount: 0, latestMessages: [] };

  try {
    const contacts = db.collection("sites").doc(ownerId).collection("contacts");
    const [unreadSnap, latestSnap] = await Promise.all([
      contacts.where("read", "==", false).count().get(),
      contacts.orderBy("timestamp", "desc").limit(5).get(),
    ]);

    const latestMessages: OwnerMessage[] = latestSnap.docs.map((doc) => {
      const d = doc.data() as {
        name?: string;
        email?: string;
        message?: string;
        read?: boolean;
        timestamp?: Timestamp;
      };
      return {
        id: doc.id,
        name: typeof d.name === "string" ? d.name : "",
        email: typeof d.email === "string" ? d.email : "",
        message: typeof d.message === "string" ? d.message : "",
        read: d.read === true,
        createdAt: tsToIso(d.timestamp),
      };
    });

    return {
      unreadCount: unreadSnap.data().count,
      latestMessages,
    };
  } catch {
    return { unreadCount: 0, latestMessages: [] };
  }
}

export default async function DashboardIndexPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/dashboard/login");
  }
  if (session.role !== "owner") {
    redirect("/dashboard/site");
  }

  const [analytics, users, blogPostsCount, inbox] = await Promise.all([
    getPlatformAnalyticsSnapshot(),
    listAdminUsers(),
    getBlogPostCount(),
    getOwnerInboxSummary(session.sub),
  ]);

  const clients = users.filter((u) => u.role === "client");
  const activeClients = clients.filter((u) => !u.disabled);
  const onboardingDone = clients.filter((u) => u.onboardingCompleted !== false);
  const onboardingPending = clients.filter((u) => u.onboardingCompleted === false);
  const stalledClients = clients
    .filter((u) => u.onboardingCompleted === false && normalizeOnboardingStep(u.onboardingStep) === 0)
    .slice(0, 5);
  const recentClients = [...clients]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const daily = analytics.dailyActivity;
  const lastDay = daily[daily.length - 1];
  const previousDay = daily[daily.length - 2];
  const trafficDelta = lastDay && previousDay
    ? lastDay.publicPings + lastDay.dashboardPings - (previousDay.publicPings + previousDay.dashboardPings)
    : 0;

  return (
    <div className="space-y-8" dir="rtl">
      <section className="rounded-2xl border border-border bg-gradient-to-b from-muted/40 to-background p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              الرئيسية
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              ملخص سريع لأداء المنصة والتشغيل اليومي. راجع المؤشرات أولًا ثم
              تحرك عبر مركز الإجراءات.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="px-2.5 py-1 text-[11px]">
                تحديث حي
              </Badge>
              <Badge variant="outline" className="px-2.5 py-1 text-[11px]">
                آخر 14 يومًا
              </Badge>
            </div>
          </div>
          <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:w-auto">
            <Card className="border border-border/60 bg-background/80 shadow-sm">
              <CardHeader className="space-y-1 p-3">
                <CardDescription className="text-xs">العملاء النشطون</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{fmt(activeClients.length)}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border border-border/60 bg-background/80 shadow-sm">
              <CardHeader className="space-y-1 p-3">
                <CardDescription className="text-xs">رسائل غير مقروءة</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{fmt(inbox.unreadCount)}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardDescription>إجمالي العملاء</CardDescription>
                <CardTitle className="text-3xl tabular-nums">{fmt(clients.length)}</CardTitle>
              </div>
              <Users className="size-5 text-muted-foreground" aria-hidden />
            </div>
          </CardHeader>
          <CardContent className="text-xs">النشطون: {fmt(activeClients.length)}</CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardDescription>اكتمال الإعداد</CardDescription>
                <CardTitle className="text-3xl tabular-nums">
                  {toPercent(onboardingDone.length, clients.length)}
                </CardTitle>
              </div>
              <UserCheck2 className="size-5 text-muted-foreground" aria-hidden />
            </div>
          </CardHeader>
          <CardContent className="text-xs">
            غير مكتمل: {fmt(onboardingPending.length)}
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardDescription>إجمالي المقالات</CardDescription>
                <CardTitle className="text-3xl tabular-nums">{fmt(blogPostsCount)}</CardTitle>
              </div>
              <FileText className="size-5 text-muted-foreground" aria-hidden />
            </div>
          </CardHeader>
          <CardContent className="text-xs">جميع المدونات داخل المنصة</CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardDescription>اتجاه الزيارات اليومي</CardDescription>
                <CardTitle className="text-3xl tabular-nums">
                  {trafficDelta === 0 ? "0" : trafficDelta > 0 ? `+${fmt(trafficDelta)}` : fmt(trafficDelta)}
                </CardTitle>
              </div>
              <TrendingUp className="size-5 text-muted-foreground" aria-hidden />
            </div>
          </CardHeader>
          <CardContent className="text-xs">مقارنة بآخر يوم مسجل</CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border border-border/70 shadow-sm xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">اتجاهات الاستخدام</CardTitle>
            <CardDescription>
              زيارات عامة، دخول لوحة التحكم، الطباعة، وتحميل PDF.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">زيارات الموقع العام</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {fmt(analytics.uniqueDevicesPublic)}
                </p>
                <AnalyticsSparkline
                  rows={analytics.dailyActivity}
                  dataKey="publicPings"
                  color="hsl(var(--muted-foreground))"
                />
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">دخول لوحة التحكم</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {fmt(analytics.uniqueDevicesDashboard)}
                </p>
                <AnalyticsSparkline
                  rows={analytics.dailyActivity}
                  dataKey="dashboardPings"
                  color="hsl(var(--primary))"
                />
              </div>
            </div>
            <PlatformActivityChart dailyActivity={daily} />
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">مركز الإجراءات</CardTitle>
            <CardDescription>
              اختصارات للقرارات اليومية الأكثر تكرارًا.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-between" asChild>
              <Link href="/dashboard/users">
                متابعة العملاء
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button className="w-full justify-between" variant="secondary" asChild>
              <Link href="/dashboard/messages">
                مراجعة الرسائل
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button className="w-full justify-between" variant="outline" asChild>
              <Link href="/dashboard/analytics">
                تحليلات تفصيلية
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button className="w-full justify-between" variant="outline" asChild>
              <Link href="/dashboard/blog/new">
                نشر مقال جديد
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">عملاء يحتاجون متابعة</CardTitle>
              <AlertTriangle className="size-4 text-amber-600" aria-hidden />
            </div>
            <CardDescription>
              العملاء المتوقفون في أول خطوة من الإعداد.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stalledClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا يوجد تعثر حاليًا.</p>
            ) : (
              <ul className="space-y-2">
                {stalledClients.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{u.email}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        /{u.slug}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[11px]">
                      الخطوة 1
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">النشاط الحديث</CardTitle>
              <BellRing className="size-4 text-muted-foreground" aria-hidden />
            </div>
            <CardDescription>أحدث الرسائل وأحدث العملاء المسجلين.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inbox.latestMessages[0] ? (
              <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="size-3.5" aria-hidden />
                  آخر رسالة: {fmtDate(inbox.latestMessages[0].createdAt)}
                </div>
                <p className="truncate text-sm font-medium">
                  {inbox.latestMessages[0].name || "بدون اسم"} -{" "}
                  {inbox.latestMessages[0].email || "بدون بريد"}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {inbox.latestMessages[0].message || "بدون محتوى"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">لا توجد رسائل حديثة.</p>
            )}

            <div className="space-y-2">
              {recentClients.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا يوجد عملاء بعد.</p>
              ) : (
                recentClients.slice(0, 4).map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{u.email}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {fmtDate(u.createdAt)}
                      </p>
                    </div>
                    <UserCog className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-1">
            <CardDescription>حفظ المواقع من المحرر</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {fmt(analytics.sitesSavedFromEditor)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-1">
            <CardDescription>نقرات طباعة السيرة</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {fmt(analytics.totalPrintClicks)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-1">
            <CardDescription>تحميلات PDF</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {fmt(analytics.totalPdfDownloads)}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      {!analytics.firestoreConfigured ? (
        <Card className="border border-amber-500/40 bg-amber-500/10 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-amber-700 dark:text-amber-300" aria-hidden />
              <CardTitle className="text-base text-amber-900 dark:text-amber-100">
                Firestore غير مُعدّ
              </CardTitle>
            </div>
            <CardDescription className="text-amber-900/90 dark:text-amber-100/90">
              بعض المؤشرات ستظهر صفرًا حتى يتم ضبط متغيرات البيئة الخاصة
              بخدمة Firebase Admin.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}
    </div>
  );
}
