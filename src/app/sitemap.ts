import { listAdminUsers } from "@/lib/admin-users";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const now = new Date();
  const out: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/portfolio`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    const users = await listAdminUsers();
    for (const u of users) {
      if (u.disabled) continue;
      out.push({
        url: `${base}/${u.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
      out.push({
        url: `${base}/${u.slug}/blog`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  } catch {
    /* Firestore unavailable during build or locally */
  }

  return out;
}
