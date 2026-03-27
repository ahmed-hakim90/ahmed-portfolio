import { getAdminSession, isAdminAuthenticated } from "@/lib/admin-request";
import { getAdminUserById } from "@/lib/admin-users";
import { userBlogPostsCollection } from "@/data/blog";
import { getFirestoreDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Ctx = { params: { slug: string } };

export async function GET(_request: Request, { params }: Ctx) {
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
  const doc = await userBlogPostsCollection(db, session.sub)
    .doc(params.slug)
    .get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const d = doc.data()!;
  return NextResponse.json({
    slug: doc.id,
    title: d.title ?? "",
    publishedAt: d.publishedAt ?? "",
    summary: d.summary ?? "",
    image: d.image,
    mdx: d.mdx ?? "",
  });
}

export async function PUT(request: Request, { params }: Ctx) {
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
  const ref = userBlogPostsCollection(db, session.sub).doc(params.slug);
  const existing = await ref.get();
  if (!existing.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const prev = existing.data()!;
  const body = await request.json().catch(() => null);

  const title =
    body && typeof body.title === "string" ? body.title : (prev.title ?? "");
  const publishedAt =
    body && typeof body.publishedAt === "string"
      ? body.publishedAt
      : (prev.publishedAt ?? "");
  const summary =
    body && typeof body.summary === "string"
      ? body.summary
      : (prev.summary ?? "");
  const mdx =
    body && typeof body.mdx === "string" ? body.mdx : (prev.mdx ?? "");

  let image: string | undefined;
  if (body && "image" in body) {
    image =
      typeof body.image === "string" && body.image.length > 0
        ? body.image
        : undefined;
  } else {
    image =
      typeof prev.image === "string" && prev.image.length > 0
        ? prev.image
        : undefined;
  }

  const payload: Record<string, string | undefined> = {
    title,
    publishedAt,
    summary,
    mdx,
    updatedAt: new Date().toISOString(),
  };
  if (image !== undefined) {
    payload.image = image;
  }

  await ref.set(payload);

  const owner = await getAdminUserById(session.sub);
  const userPath = `/${owner?.slug ?? session.username}`;
  revalidatePath("/", "layout");
  revalidatePath("/blog", "layout");
  revalidatePath(`${userPath}/blog`, "layout");
  revalidatePath(`${userPath}/blog/${params.slug}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
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
  await userBlogPostsCollection(db, session.sub).doc(params.slug).delete();
  const owner = await getAdminUserById(session.sub);
  const userPath = `/${owner?.slug ?? session.username}`;
  revalidatePath("/", "layout");
  revalidatePath("/blog", "layout");
  revalidatePath(`${userPath}/blog`, "layout");
  revalidatePath(`${userPath}/blog/${params.slug}`);
  return NextResponse.json({ ok: true });
}
