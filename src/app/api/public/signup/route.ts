import {
  countAdminUsers,
  getAdminUserById,
  registerClientProfileAfterAuth,
  usernameFromEmail,
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

  const record = await auth.getUser(decoded.uid);
  const email =
    typeof decoded.email === "string" && decoded.email.length > 0
      ? decoded.email
      : record.email;
  if (!email) {
    return NextResponse.json(
      { error: "Firebase user must have an email" },
      { status: 400 },
    );
  }

  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";

  let resolvedName = displayName;
  if (resolvedName.length < 2 && typeof record.displayName === "string") {
    const fromAuth = record.displayName.trim();
    if (fromAuth.length >= 2) {
      resolvedName = fromAuth;
    }
  }
  // Fallback: derive a temporary name from email so displayName is never empty
  if (resolvedName.length < 2) {
    resolvedName = usernameFromEmail(email);
  }

  const created = await registerClientProfileAfterAuth(decoded.uid, email, {
    displayName: resolvedName,
    phone,
    slug,
  });
  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: decoded.uid });
}
