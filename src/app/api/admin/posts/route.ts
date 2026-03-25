import { getAdminSession, isAdminAuthenticated } from "@/lib/admin-request";
import { userBlogPostsCollection } from "@/data/blog";
import { getFirestoreDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getFirestoreDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firestore is not configured" },
      { status: 500 },
    );
  }
  const snap = await userBlogPostsCollection(db, session.sub).get();
  const posts = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      slug: doc.id,
      title: d.title ?? "",
      publishedAt: d.publishedAt ?? "",
      summary: d.summary ?? "",
      image: d.image,
    };
  });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getFirestoreDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firestore is not configured" },
      { status: 500 },
    );
  }
  const body = await request.json().catch(() => null);
  const slug =
    body && typeof body.slug === "string" ? body.slug.trim() : "";
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }
  const title = typeof body.title === "string" ? body.title : "";
  const publishedAt =
    typeof body.publishedAt === "string" ? body.publishedAt : "";
  const summary = typeof body.summary === "string" ? body.summary : "";
  const image = typeof body.image === "string" ? body.image : undefined;
  const mdx = typeof body.mdx === "string" ? body.mdx : "";

  const ref = userBlogPostsCollection(db, session.sub).doc(slug);
  const existing = await ref.get();
  if (existing.exists) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  await ref.set({
    title,
    publishedAt,
    summary,
    ...(image !== undefined ? { image } : {}),
    mdx,
    updatedAt: new Date().toISOString(),
  });

  const userPath = `/${session.username}`;
  revalidatePath("/", "layout");
  revalidatePath("/blog", "layout");
  revalidatePath(`${userPath}/blog`, "layout");
  revalidatePath(`${userPath}/blog/${slug}`);
  return NextResponse.json({ ok: true, slug });
}
