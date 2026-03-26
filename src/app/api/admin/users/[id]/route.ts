import { getAdminSession } from "@/lib/admin-request";
import {
  deleteAdminUser,
  getAdminUserById,
  setAdminUserDisabled,
  updateAdminUserPassword,
} from "@/lib/admin-users";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function DELETE(_request: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "معرّف المستخدم مفقود" }, { status: 400 });
  }
  if (id === session.sub) {
    return NextResponse.json(
      { error: "لا يمكنك حذف حسابك" },
      { status: 400 },
    );
  }

  const target = await getAdminUserById(id);
  if (target?.role === "owner") {
    return NextResponse.json(
      { error: "لا يمكن حذف حساب صاحب المنصة" },
      { status: 400 },
    );
  }

  const ok = await deleteAdminUser(id);
  if (!ok) {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "معرّف المستخدم مفقود" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));

  if (typeof body.disabled === "boolean") {
    const target = await getAdminUserById(id);
    if (target?.role === "owner") {
      return NextResponse.json(
        { error: "لا يمكن تغيير حالة التعطيل لصاحب المنصة" },
        { status: 400 },
      );
    }
    if (body.disabled && id === session.sub) {
      return NextResponse.json(
        { error: "لا يمكنك تعطيل حسابك" },
        { status: 400 },
      );
    }
    const ok = await setAdminUserDisabled(id, body.disabled);
    if (!ok) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }
  }

  if (typeof body.password === "string" && body.password.length > 0) {
    const ok = await updateAdminUserPassword(id, body.password);
    if (!ok) {
      return NextResponse.json(
        {
          error:
            "المستخدم غير موجود أو كلمة المرور قصيرة (8 أحرف على الأقل)",
        },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
