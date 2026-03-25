import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { userBlogPostsCollection } from "@/data/blog";
import { getAdminSession } from "@/lib/admin-request";
import { getFirestoreDb } from "@/lib/firebase-admin";
import { ExternalLink, Plus } from "lucide-react";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DashboardBlogListPage() {
  const session = await getAdminSession();
  if (!session) {
    return (
      <p className="text-sm text-muted-foreground">Sign in to manage posts.</p>
    );
  }
  const db = getFirestoreDb();
  if (!db) {
    return (
      <p className="text-sm text-muted-foreground">
        Firestore is not configured. Set Firebase Admin env vars.
      </p>
    );
  }
  let snap;
  try {
    snap = await userBlogPostsCollection(db, session.sub).get();
  } catch {
    return (
      <p className="text-sm text-destructive">
        Could not reach Firestore. Enable Firestore in your Firebase project and try again.
      </p>
    );
  }
  const posts = snap.docs
    .map((doc) => ({
      slug: doc.id,
      title: (doc.data().title as string) ?? "",
      publishedAt: (doc.data().publishedAt as string) ?? "",
    }))
    .sort((a, b) =>
      a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0,
    );

  const publicBlogUrl = `/${session.username}/blog`;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">المدونة</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            إدارة المقالات. الصفحة العامة متاحة لأي زائر بدون تسجيل عبر الرابط أدناه (إن كان مسار
            المدونة مفعّلاً في المحرر).
          </p>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link href="/dashboard/blog/new">
            <Plus className="size-4" aria-hidden />
            مقال جديد
          </Link>
        </Button>
      </div>

      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">الرابط العام للمدونة</CardTitle>
          <CardDescription>
            انسخه أو افتحه في نافذة جديدة — لا يتطلب تسجيل دخول للقراءة.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 pt-0">
          <Link
            className="break-all font-mono text-sm text-primary underline underline-offset-4 hover:text-primary/90"
            href={publicBlogUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {publicBlogUrl}
          </Link>
          <Button variant="secondary" size="sm" className="gap-2" asChild>
            <Link href={publicBlogUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" aria-hidden />
              فتح المدونة
            </Link>
          </Button>
        </CardContent>
      </Card>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            لا توجد مقالات بعد. أنشئ مقالاً أو شغّل{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">npm run seed:firestore</code>{" "}
            (المقالات القديمة على المسار العام `/blog` قد تظهر في القائمة العامة حسب الإعدادات).
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
          {posts.map((p) => {
            const publicPostUrl = `${publicBlogUrl}/${encodeURIComponent(p.slug)}`;
            return (
              <li key={p.slug}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base leading-snug">
                      <Link
                        href={`/dashboard/blog/${encodeURIComponent(p.slug)}`}
                        className="hover:underline"
                      >
                        {p.title || p.slug}
                      </Link>
                    </CardTitle>
                    {p.publishedAt ? (
                      <CardDescription className="text-xs">{p.publishedAt}</CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 pt-0">
                    <Button variant="default" size="sm" asChild>
                      <Link href={`/dashboard/blog/${encodeURIComponent(p.slug)}`}>تحرير</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <Link href={publicPostUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-3.5" aria-hidden />
                        عرض عام
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
