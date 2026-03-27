import { PlatformAnalyticsPing } from "@/components/analytics/platform-analytics-ping";
import {
  AdminDashboardShell,
  type DashboardSidebarPost,
} from "@/components/dashboard/admin-dashboard-shell";
import { userBlogPostsCollection } from "@/data/blog";
import { getAdminSession } from "@/lib/admin-request";
import { getAdminUserById } from "@/lib/admin-users";
import { getFirestoreDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getSidebarPosts(userId: string): Promise<DashboardSidebarPost[]> {
  const db = getFirestoreDb();
  if (!db) return [];
  try {
    const snap = await userBlogPostsCollection(db, userId).get();
    const posts = snap.docs.map((doc) => ({
      slug: doc.id,
      title: (doc.data().title as string) ?? "",
      publishedAt: (doc.data().publishedAt as string) ?? "",
    }));
    return posts.sort((a, b) =>
      a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0,
    );
  } catch {
    return [];
  }
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/dashboard/login");
  }
  const adminUser = await getAdminUserById(session.sub);
  if (adminUser && !adminUser.onboardingCompleted) {
    redirect("/dashboard/onboarding");
  }
  const isOwner = session.role === "owner";
  const publicBlogUrl = `/${session.username}/blog`;
  const blogPosts = await getSidebarPosts(session.sub);

  return (
    <AdminDashboardShell isOwner={isOwner} publicBlogUrl={publicBlogUrl} blogPosts={blogPosts}>
      <PlatformAnalyticsPing surface="dashboard" />
      {children}
    </AdminDashboardShell>
  );
}
