import { getBlogPosts, getPost } from "@/data/blog";
import {
  blogViewDocIdRoot,
  getBlogViewCount,
  recordBlogPostView,
} from "@/lib/blog-views";
import { getMergedSiteData } from "@/lib/site-data";
import { formatDate, formatReadingTimeAr, formatViewCountAr } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts
    .filter((post) => post.href.startsWith("/blog/"))
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: {
    slug: string;
  };
}): Promise<Metadata | undefined> {
  const site = await getMergedSiteData();
  const post = await getPost(params.slug);
  if (!post) {
    return undefined;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  let ogImage = image
    ? `${site.url}${image}`
    : `${site.url}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${site.url}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Blog({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const site = await getMergedSiteData();
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const viewKey = blogViewDocIdRoot(params.slug);
  await recordBlogPostView(viewKey);
  const viewCount = await getBlogViewCount(viewKey);

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
              ? `${site.url}${post.metadata.image}`
              : `${site.url}/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${site.url}/blog/${post.slug}`,
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
      ></article>
    </section>
  );
}
