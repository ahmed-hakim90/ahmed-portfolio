import {
  bootstrapCredentialsMatch,
  countAdminUsers,
  createAdminUser,
} from "@/lib/admin-users";
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
  if (n > 0) {
    return NextResponse.json({ error: "Already bootstrapped" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const username =
    typeof body.username === "string" ? body.username : "";
  const password =
    typeof body.password === "string" ? body.password : "";

  if (!bootstrapCredentialsMatch(username, password)) {
    return NextResponse.json(
      { error: "Invalid bootstrap credentials" },
      { status: 401 },
    );
  }

  const created = await createAdminUser(
    process.env.ADMIN_BOOTSTRAP_USERNAME!,
    process.env.ADMIN_BOOTSTRAP_PASSWORD!,
    "owner",
  );
  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: created.id });
}
