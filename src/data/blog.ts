import fs from "fs";
import matter from "gray-matter";
import path from "path";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { getAdminUserById } from "@/lib/admin-users";
import { getFirestoreDb, isFirestoreBlogActive } from "@/lib/firebase-admin";
import type { DocumentData, Firestore } from "firebase-admin/firestore";

type PostMetadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
};

/** One rendered post plus its public path (root legacy vs per-user blog). */
export type BlogPostEntry = {
  slug: string;
  metadata: PostMetadata;
  source: string;
  /** Path only, e.g. `/blog/hello` or `/ahmed/hello-world` */
  href: string;
};

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

export async function markdownToHTML(markdown: string) {
  const p = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      theme: {
        light: "min-light",
        dark: "min-dark",
      },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(markdown);

  return p.toString();
}

async function getPostFromFile(slug: string): Promise<BlogPostEntry | null> {
  try {
    const filePath = path.join(process.cwd(), "content", `${slug}.mdx`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const sourceFile = fs.readFileSync(filePath, "utf-8");
    const { content: rawContent, data: metadata } = matter(sourceFile);
    const content = await markdownToHTML(rawContent);
    return {
      source: content,
      metadata: metadata as PostMetadata,
      slug,
      href: `/blog/${slug}`,
    };
  } catch {
    return null;
  }
}

function mdxBodyForPipeline(raw: string) {
  const t = raw.trimStart();
  if (t.startsWith("---")) {
    return matter(raw).content;
  }
  return raw;
}

async function postFromFirestoreDoc(slug: string, data: DocumentData) {
  const metadata: PostMetadata = {
    title: data.title ?? "",
    publishedAt: data.publishedAt ?? "",
    summary: data.summary ?? "",
    ...(typeof data.image === "string" && data.image
      ? { image: data.image }
      : {}),
  };
  const source = await markdownToHTML(mdxBodyForPipeline(data.mdx ?? ""));
  return { source, metadata, slug };
}

export function userBlogPostsCollection(db: Firestore, userId: string) {
  return db.collection("sites").doc(userId).collection("posts");
}

/**
 * Root `/blog/[slug]` — legacy top-level `posts` only (or MDX files).
 * Per-user posts live under `/[userSlug]/blog/[postSlug]`.
 */
export async function getPost(slug: string) {
  if (await isFirestoreBlogActive()) {
    const db = getFirestoreDb();
    if (!db) {
      return getPostFromFile(slug);
    }
    try {
      const doc = await db.collection("posts").doc(slug).get();
      if (!doc.exists) {
        return null;
      }
      const p = await postFromFirestoreDoc(slug, doc.data()!);
      return { ...p, href: `/blog/${slug}` } satisfies BlogPostEntry;
    } catch {
      return getPostFromFile(slug);
    }
  }
  return getPostFromFile(slug);
}

export async function getPostForUser(
  userId: string,
  slug: string,
): Promise<BlogPostEntry | null> {
  const db = getFirestoreDb();
  if (!db) return null;
  try {
    const doc = await userBlogPostsCollection(db, userId).doc(slug).get();
    if (!doc.exists) return null;
    const user = await getAdminUserById(userId);
    if (!user || user.disabled) return null;
    const p = await postFromFirestoreDoc(slug, doc.data()!);
    return { ...p, href: `/${user.slug}/blog/${slug}` };
  } catch {
    return null;
  }
}

export async function getBlogPostsForUser(userId: string): Promise<BlogPostEntry[]> {
  const db = getFirestoreDb();
  if (!db) return [];
  try {
    const snap = await userBlogPostsCollection(db, userId).get();
    const user = await getAdminUserById(userId);
    if (!user || user.disabled) return [];
    const posts = await Promise.all(
      snap.docs.map(async (doc) => {
        const p = await postFromFirestoreDoc(doc.id, doc.data());
        return { ...p, href: `/${user.slug}/blog/${doc.id}` };
      }),
    );
    return posts.sort((a, b) => {
      const da = new Date(a.metadata.publishedAt).getTime();
      const db = new Date(b.metadata.publishedAt).getTime();
      return db - da;
    });
  } catch {
    return [];
  }
}

async function getAllPostsFromFiles(dir: string): Promise<BlogPostEntry[]> {
  const mdxFiles = getMDXFiles(dir);
  const results = await Promise.all(
    mdxFiles.map(async (file) => {
      const slug = path.basename(file, path.extname(file));
      return getPostFromFile(slug);
    }),
  );
  return results.filter((p): p is BlogPostEntry => p !== null);
}

async function getAllPostsFromFirestoreMerged(): Promise<BlogPostEntry[]> {
  const db = getFirestoreDb()!;
  const groupSnap = await db.collectionGroup("posts").get();
  const merged: BlogPostEntry[] = [];
  for (const doc of groupSnap.docs) {
    const data = doc.data();
    const siteDocRef = doc.ref.parent.parent;
    if (!siteDocRef) {
      const p = await postFromFirestoreDoc(doc.id, data);
      merged.push({ ...p, href: `/blog/${doc.id}` });
      continue;
    }
    const pathParts = siteDocRef.path.split("/");
    if (pathParts[0] !== "sites" || pathParts.length !== 2) continue;
    const userId = pathParts[1];
    const user = await getAdminUserById(userId);
    if (!user || user.disabled) continue;
    const p = await postFromFirestoreDoc(doc.id, data);
    merged.push({ ...p, href: `/${user.slug}/blog/${doc.id}` });
  }
  merged.sort((a, b) => {
    const da = new Date(a.metadata.publishedAt).getTime();
    const db = new Date(b.metadata.publishedAt).getTime();
    return db - da;
  });
  return merged;
}

export async function getBlogPosts(): Promise<BlogPostEntry[]> {
  if (await isFirestoreBlogActive()) {
    const db = getFirestoreDb();
    if (!db) {
      return getAllPostsFromFiles(path.join(process.cwd(), "content"));
    }
    try {
      return await getAllPostsFromFirestoreMerged();
    } catch {
      return getAllPostsFromFiles(path.join(process.cwd(), "content"));
    }
  }
  return getAllPostsFromFiles(path.join(process.cwd(), "content"));
}

/** Total posts (legacy root + per-user subcollections), for landing stats. */
export async function getBlogPostCount(): Promise<number> {
  if (!(await isFirestoreBlogActive())) {
    try {
      const files = await getAllPostsFromFiles(
        path.join(process.cwd(), "content"),
      );
      return files.length;
    } catch {
      return 0;
    }
  }
  const db = getFirestoreDb();
  if (!db) {
    try {
      const files = await getAllPostsFromFiles(
        path.join(process.cwd(), "content"),
      );
      return files.length;
    } catch {
      return 0;
    }
  }
  try {
    const group = await db.collectionGroup("posts").get();
    return group.size;
  } catch {
    return 0;
  }
}
