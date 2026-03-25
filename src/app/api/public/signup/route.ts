import {
  countAdminUsers,
  createAdminUserDocument,
  getAdminUserById,
} from "@/lib/admin-users";
import { isSignupInviteValid } from "@/lib/signup-invite";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const n = await countAdminUsers();
  if (n < 0) {
    return NextResponse.json(
      { error: "Firestore is not configured" },
      { status: 500 },
    );
  }
  if (n === 0) {
    return NextResponse.json(
      {
        error:
          "Owner is not initialized yet. Complete setup at /dashboard/bootstrap.",
      },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}));
  if (!isSignupInviteValid(body.inviteCode)) {
    return NextResponse.json(
      { error: "Invalid or missing invite code" },
      { status: 403 },
    );
  }

  const auth = getFirebaseAdminAuth();
  if (!auth) {
    return NextResponse.json(
      { error: "Firebase Admin is not configured" },
      { status: 500 },
    );
  }

  const idToken = typeof body.idToken === "string" ? body.idToken : "";
  if (!idToken) {
    return NextResponse.json({ error: "idToken required" }, { status: 400 });
  }

  let decoded: { uid: string; email?: string };
  try {
    decoded = await auth.verifyIdToken(idToken, true);
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const existing = await getAdminUserById(decoded.uid);
  if (existing) {
    return NextResponse.json(
      { error: "This account is already registered" },
      { status: 400 },
    );
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

  const created = await createAdminUserDocument(decoded.uid, email, "client");
  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: decoded.uid });
}
