import {
  bootstrapRequestAuthorized,
  countAdminUsers,
  createAdminUserDocument,
} from "@/lib/admin-users";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const n = await countAdminUsers();
  if (n < 0) {
    return NextResponse.json(
      { error: "Firestore is not configured" },
      { status: 500 },
    );
  }
  return NextResponse.json({ needsBootstrap: n === 0 });
}

export async function POST(request: Request) {
  const n = await countAdminUsers();
  if (n < 0) {
    return NextResponse.json(
      { error: "Firestore is not configured" },
      { status: 500 },
    );
  }
  if (n > 0) {
    return NextResponse.json({ error: "Already bootstrapped" }, { status: 403 });
  }

  const auth = getFirebaseAdminAuth();
  if (!auth) {
    return NextResponse.json(
      { error: "Firebase Admin is not configured" },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const idToken = typeof body.idToken === "string" ? body.idToken : "";
  if (!idToken) {
    return NextResponse.json({ error: "idToken required" }, { status: 400 });
  }

  if (!bootstrapRequestAuthorized(body)) {
    return NextResponse.json(
      { error: "Invalid bootstrap authorization" },
      { status: 401 },
    );
  }

  let decoded: { uid: string; email?: string };
  try {
    decoded = await auth.verifyIdToken(idToken, true);
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const email =
    typeof decoded.email === "string" && decoded.email.length > 0
      ? decoded.email
      : (await auth.getUser(decoded.uid)).email;
  if (!email) {
    return NextResponse.json(
      { error: "Firebase user must have an email" },
      { status: 400 },
    );
  }

  const created = await createAdminUserDocument(decoded.uid, email, "owner");
  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: decoded.uid });
}
