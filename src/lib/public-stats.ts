import { getBlogPostCount } from "@/data/blog";
import { countAdminUsers } from "@/lib/admin-users";
import { getMergedSiteData } from "@/lib/site-data";

export type PublicStats = {
  /** Dashboard admin accounts; null if Firestore unavailable */
  users: number | null;
  projectCards: number;
  blogPosts: number;
};

export async function getPublicStats(): Promise<PublicStats> {
  const [userCount, data, blogPosts] = await Promise.all([
    countAdminUsers(),
    getMergedSiteData(),
    getBlogPostCount(),
  ]);
  return {
    users: userCount < 0 ? null : userCount,
    projectCards: data.projects.length,
    blogPosts,
  };
}
