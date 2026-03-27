import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPostsForUser } from "@/data/blog";
import { blogViewDocIdUser, getBlogViewCounts } from "@/lib/blog-views";
import { getAdminUserBySlug } from "@/lib/admin-users";
import { formatReadingTimeAr, formatViewCountAr } from "@/lib/utils";
import { getMergedSiteDataForUser } from "@/lib/site-data";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

function publicOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const user = await getAdminUserBySlug(params.slug);
  if (!user || user.disabled) return { title: "Blog" };
  const site = await getMergedSiteDataForUser(user.id);
  const posts = await getBlogPostsForUser(user.id);
  const base = publicOrigin();
  const pageUrl = base ? `${base}/${user.slug}/blog` : undefined;
  const latest = posts[0]?.metadata;
  const description =
    latest?.summary?.trim().slice(0, 160) ||
    `مقالات ${site.name.trim()} — ${posts.length} منشوراً`;
  return {
    title: `المدونة | ${site.name.trim()}`,
    description,
    alternates: pageUrl ? { canonical: pageUrl } : undefined,
    openGraph: pageUrl
      ? { title: `المدونة | ${site.name.trim()}`, description, url: pageUrl }
      : undefined,
    robots: { index: true, follow: true },
  };
}

const BLUR_FADE_DELAY = 0.04;

export default async function UserBlogIndexPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await getAdminUserBySlug(params.slug);
  if (!user || user.disabled) notFound();
  const posts = await getBlogPostsForUser(user.id);
  const viewKeys = posts.map((p) => blogViewDocIdUser(user.id, p.slug));
  const viewCounts = await getBlogViewCounts(viewKeys);

  return (
    <section>
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className="mb-8 text-2xl font-medium tracking-tighter">blog</h1>
      </BlurFade>
      {posts.map((post, id) => (
        <BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.05} key={post.slug}>
          <Link
            className="mb-4 flex flex-col space-y-1"
            href={post.href}
          >
            <div className="flex w-full flex-col gap-0.5">
              <p className="tracking-tight">{post.metadata.title}</p>
              <p className="text-xs text-muted-foreground">
                {post.metadata.publishedAt}
                <span className="mx-1.5 text-muted-foreground/60">·</span>
                {formatReadingTimeAr(post.metadata.readingTime)}
                <span className="mx-1.5 text-muted-foreground/60">·</span>
                {formatViewCountAr(
                  viewCounts[blogViewDocIdUser(user.id, post.slug)] ?? 0,
                )}
              </p>
            </div>
          </Link>
        </BlurFade>
      ))}
    </section>
  );
}
