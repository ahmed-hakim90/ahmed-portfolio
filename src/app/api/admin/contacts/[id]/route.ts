import { getAdminSession, isAdminAuthenticated } from "@/lib/admin-request";
import { getFirestoreDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: { id: string } };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = params.id;
  if (!id || id.length > 200) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const read = body?.read === true;

  const db = getFirestoreDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firestore is not configured" },
      { status: 500 },
    );
  }
  const ref = db
    .collection("sites")
    .doc(session.sub)
    .collection("contacts")
    .doc(id);
  try {
    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await ref.set({ read }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin contacts PATCH:", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
