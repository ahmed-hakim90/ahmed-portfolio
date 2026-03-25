import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPostsForUser } from "@/data/blog";
import { getAdminUserBySlug } from "@/lib/admin-users";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Blog",
  description: "Posts",
};

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
