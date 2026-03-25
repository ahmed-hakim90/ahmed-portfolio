import {
  ADMIN_SESSION_COOKIE,
  signAdminSessionToken,
} from "@/lib/admin-auth";
import {
  countAdminUsers,
  getAdminUserByUsername,
  verifyAdminPassword,
} from "@/lib/admin-users";
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

  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password required" },
      { status: 400 },
    );
  }

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
          "No admin users yet. Call POST /api/admin/bootstrap with bootstrap credentials from your environment.",
      },
      { status: 403 },
    );
  }

  const user = await getAdminUserByUsername(username);
  if (!user || user.disabled) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const valid = await verifyAdminPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
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
