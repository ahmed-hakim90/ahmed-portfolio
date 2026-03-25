import { countAdminUsers, createAdminUser } from "@/lib/admin-users";
import { isSignupInviteValid } from "@/lib/signup-invite";
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
      { error: "Owner account is not initialized yet" },
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

  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  const created = await createAdminUser(username, password, "client");
  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: created.id });
}
