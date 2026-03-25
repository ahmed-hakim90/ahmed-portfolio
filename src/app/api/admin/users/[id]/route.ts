import { getAdminSession } from "@/lib/admin-request";
import {
  deleteAdminUser,
  setAdminUserDisabled,
  updateAdminUserPassword,
} from "@/lib/admin-users";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function DELETE(_request: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  if (id === session.sub) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 },
    );
  }

  const ok = await deleteAdminUser(id);
  if (!ok) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));

  if (typeof body.disabled === "boolean") {
    if (body.disabled && id === session.sub) {
      return NextResponse.json(
        { error: "You cannot disable your own account" },
        { status: 400 },
      );
    }
    const ok = await setAdminUserDisabled(id, body.disabled);
    if (!ok) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  }

  if (typeof body.password === "string" && body.password.length > 0) {
    const ok = await updateAdminUserPassword(id, body.password);
    if (!ok) {
      return NextResponse.json(
        { error: "User not found or password too short (min 8)" },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
