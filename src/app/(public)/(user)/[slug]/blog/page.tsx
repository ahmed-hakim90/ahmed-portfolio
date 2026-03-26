import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPostsForUser } from "@/data/blog";
import { getAdminUserBySlug } from "@/lib/admin-users";
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
            <div className="flex w-full flex-col">
              <p className="tracking-tight">{post.metadata.title}</p>
              <p className="h-6 text-xs text-muted-foreground">
                {post.metadata.publishedAt}
              </p>
            </div>
          </Link>
        </BlurFade>
      ))}
    </section>
  );
}
