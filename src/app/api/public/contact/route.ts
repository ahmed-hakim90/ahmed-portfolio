import { getAdminUserBySlug } from "@/lib/admin-users";
import { getFirestoreDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const ownerSlug =
    typeof body?.ownerSlug === "string" ? body.ownerSlug.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!ownerSlug) {
    return NextResponse.json(
      { error: "ownerSlug is required" },
      { status: 400 },
    );
  }
  const owner = await getAdminUserBySlug(ownerSlug);
  if (!owner || owner.disabled) {
    return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
  }

  if (name.length < 2) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (message.length < 1 || message.length > 500) {
    return NextResponse.json(
      { error: "Message must be 1–500 characters" },
      { status: 400 },
    );
  }

  const db = getFirestoreDb();
  if (!db) {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }

  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  try {
    await db
      .collection("sites")
      .doc(owner.id)
      .collection("contacts")
      .doc(id)
      .set({
        name,
        email,
        message,
        timestamp: FieldValue.serverTimestamp(),
        read: false,
      });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("contact save:", e);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
