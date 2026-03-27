import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreDb } from "@/lib/firebase-admin";

const COLLECTION = "blog_views";

export function blogViewDocIdRoot(slug: string): string {
  return `root:${slug}`;
}

export function blogViewDocIdUser(userId: string, slug: string): string {
  return `user:${userId}:${slug}`;
}

export async function recordBlogPostView(docId: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  try {
    await db
      .collection(COLLECTION)
      .doc(docId)
      .set(
        {
          count: FieldValue.increment(1),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
  } catch (e) {
    console.error("recordBlogPostView:", e);
  }
}

export async function getBlogViewCount(docId: string): Promise<number> {
  const db = getFirestoreDb();
  if (!db) return 0;
  try {
    const snap = await db.collection(COLLECTION).doc(docId).get();
    if (!snap.exists) return 0;
    const c = snap.data()?.count;
    return typeof c === "number" && !Number.isNaN(c) ? c : 0;
  } catch {
    return 0;
  }
}

export async function getBlogViewCounts(
  docIds: string[],
): Promise<Record<string, number>> {
  const db = getFirestoreDb();
  if (!db || docIds.length === 0) return {};
  try {
    const refs = docIds.map((id) => db.collection(COLLECTION).doc(id));
    const snaps = await db.getAll(...refs);
    const out: Record<string, number> = {};
    for (let i = 0; i < docIds.length; i++) {
      const c = snaps[i].data()?.count;
      out[docIds[i]] =
        typeof c === "number" && !Number.isNaN(c) ? c : 0;
    }
    return out;
  } catch {
    return {};
  }
}
