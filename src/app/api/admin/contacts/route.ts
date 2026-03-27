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
  try {
    const snap = await db
      .collection("sites")
      .doc(session.sub)
      .collection("contacts")
      .orderBy("timestamp", "desc")
      .limit(200)
      .get();
    const items = snap.docs.map((doc) => {
      const d = doc.data();
      const timestamp = d.timestamp as Timestamp | undefined;
      return {
        id: doc.id,
        name: typeof d.name === "string" ? d.name : "",
        email: typeof d.email === "string" ? d.email : "",
        message: typeof d.message === "string" ? d.message : "",
        read: d.read === true,
        createdAt: tsToIso(timestamp),
      };
    });
    return NextResponse.json({ items });
  } catch (e) {
    console.error("admin contacts GET:", e);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}
