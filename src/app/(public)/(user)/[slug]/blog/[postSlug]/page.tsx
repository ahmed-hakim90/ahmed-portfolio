import { getPostForUser } from "@/data/blog";
import {
  blogViewDocIdUser,
  getBlogViewCount,
  recordBlogPostView,
} from "@/lib/blog-views";
import { getAdminUserBySlug } from "@/lib/admin-users";
import { getMergedSiteDataForUser } from "@/lib/site-data";
import {
  formatDate,
  formatReadingTimeAr,
  formatViewCountAr,
} from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; postSlug: string };
}): Promise<Metadata | undefined> {
  const user = await getAdminUserBySlug(params.slug);
  if (!user || user.disabled) return undefined;
  const site = await getMergedSiteDataForUser(user.id);
  const post = await getPostForUser(user.id, params.postSlug);
  if (!post) return undefined;

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  const baseUrl = site.url.replace(/\/$/, "");
  const envBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const canonicalBase = envBase || baseUrl;
  const postPath = `/${user.slug}/blog/${post.slug}`;
  const canonicalUrl = `${canonicalBase}${postPath}`;
  const ogImage = image
    ? `${baseUrl}${image}`
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}/${user.slug}/blog/${post.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function UserBlogPostPage({
  params,
}: {
  params: { slug: string; postSlug: string };
}) {
  const user = await getAdminUserBySlug(params.slug);
  if (!user || user.disabled) notFound();
  const site = await getMergedSiteDataForUser(user.id);
  const post = await getPostForUser(user.id, params.postSlug);
  if (!post) notFound();

  const viewKey = blogViewDocIdUser(user.id, params.postSlug);
  await recordBlogPostView(viewKey);
  const viewCount = await getBlogViewCount(viewKey);

  const baseUrl = site.url.replace(/\/$/, "");

  return (
    <section id="blog">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/${user.slug}/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: site.name.trim(),
            },
          }),
        }}
      />
      <h1 className="title max-w-[650px] text-2xl font-medium tracking-tighter">
        {post.metadata.title}
      </h1>
      <div className="mb-8 mt-2 flex max-w-[650px] flex-wrap items-center justify-between gap-2 text-sm">
        <Suspense fallback={<p className="h-5" />}>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {formatDate(post.metadata.publishedAt)}
          </p>
        </Suspense>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatReadingTimeAr(post.metadata.readingTime)}
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatViewCountAr(viewCount)}
        </p>
      </div>
      <article
        className="prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.source }}
      />
    </section>
  );
}
