import {
  ADMIN_SESSION_COOKIE,
  signAdminSessionToken,
} from "@/lib/admin-auth";
import { getAdminUserById } from "@/lib/admin-users";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const keyOk =
    process.env.ADMIN_DASHBOARD_SECRET &&
    process.env.ADMIN_DASHBOARD_SECRET.length >= 16;
  if (!keyOk) {
    return NextResponse.json(
      { error: "ADMIN_DASHBOARD_SECRET is not configured" },
      { status: 500 },
    );
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

  let decoded: { uid: string };
  try {
    decoded = await auth.verifyIdToken(idToken, true);
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  try {
    const record = await auth.getUser(decoded.uid);
    if (record.disabled) {
      return NextResponse.json({ error: "Account disabled" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const user = await getAdminUserById(decoded.uid);
  if (!user || user.disabled) {
    return NextResponse.json(
      { error: "No dashboard access for this account" },
      { status: 403 },
    );
  }

  const jwt = await signAdminSessionToken({
    sub: user.id,
    username: user.username,
    role: user.role,
  });
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
