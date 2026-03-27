import { getAdminSession, isAdminAuthenticated } from "@/lib/admin-request";
import { getFirestoreDb } from "@/lib/firebase-admin";
import type { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function tsToIso(t: Timestamp | null | undefined): string | null {
  if (!t || typeof t.toDate !== "function") return null;
  try {
    return t.toDate().toISOString();
  } catch {
    return null;
  }
}

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
  const coll = db
    .collection("sites")
    .doc(session.sub)
    .collection("contacts");

  try {
    const [countSnap, latestSnap] = await Promise.all([
      coll.where("read", "==", false).count().get(),
      coll.orderBy("timestamp", "desc").limit(1).get(),
    ]);

    const unreadCount = countSnap.data().count;
    let latestId: string | null = null;
    let latestAt: string | null = null;
    if (!latestSnap.empty) {
      const doc = latestSnap.docs[0];
      latestId = doc.id;
      const ts = doc.data().timestamp as Timestamp | undefined;
      latestAt = tsToIso(ts);
    }

    return NextResponse.json({ unreadCount, latestId, latestAt });
  } catch (e) {
    console.error("admin contacts unread-summary GET:", e);
    return NextResponse.json(
      { error: "Failed to load summary" },
      { status: 500 },
    );
  }
}
