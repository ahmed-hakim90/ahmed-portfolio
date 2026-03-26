"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";

export type UserRow = {
  id: string;
  email: string;
  username: string;
  slug: string;
  role: "owner" | "client";
  disabled: boolean;
  createdAt: string;
  phone: string | null;
};

export function UsersPageClient({ viewerId }: { viewerId: string }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) {
        setMessage("تعذر تحميل المستخدمين");
        return;
      }
      const data = (await res.json()) as UserRow[];
      setUsers(data);
    } catch {
      setMessage("تعذر تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim(),
          password: newPass,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(
          typeof data.error === "string" ? data.error : "فشل إنشاء الحساب",
        );
        return;
      }
      setNewEmail("");
      setNewPass("");
      await load();
      setMessage("تم إنشاء المستخدم (عميل). يمكنه تسجيل الدخول من لوحة التحكم.");
    } finally {
      setBusy(false);
    }
  }

  async function setDisabled(id: string, disabled: boolean) {
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(
          typeof data.error === "string" ? data.error : "فشل التحديث",
        );
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser(id: string) {
    if (
      !window.confirm(
        "حذف هذا المستخدم وبيانات موقعه (بما فيها المقالات)؟ لا يمكن التراجع.",
      )
    ) {
      return;
    }
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(
          typeof data.error === "string" ? data.error : "فشل الحذف",
        );
        return;
      }
      await load();
      setMessage("تم حذف المستخدم.");
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(id: string, password: string) {
    if (password.length < 8) {
      setMessage("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(
          typeof data.error === "string" ? data.error : "فشل تحديث كلمة المرور",
        );
        return;
      }
      setMessage("تم تحديث كلمة المرور.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">جاري التحميل…</p>;
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">المستخدمون</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          صاحب المنصة فقط يدير الحسابات. إنشاء حسابات Firebase (بريد + كلمة مرور)
          لعملاء المنصة — يدخلون عبر{" "}
          <span className="font-mono text-xs">/dashboard/login</span> بنفس جلسة
          JWT بعد التحقق من الهوية. صاحب المنصة يُنشأ مرة واحدة من{" "}
          <span className="font-medium">إعداد المنصة</span> وليس من هنا.
        </p>
      </div>

      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}

      <form
        onSubmit={createUser}
        className="space-y-3 rounded-lg border border-border bg-muted/20 p-4"
      >
        <h2 className="text-sm font-medium">عميل جديد</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[180px] flex-1 space-y-1">
            <label htmlFor="nu" className="text-xs text-muted-foreground">
              البريد
            </label>
            <input
              id="nu"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              required
            />
          </div>
          <div className="min-w-[160px] flex-1 space-y-1">
            <label htmlFor="np" className="text-xs text-muted-foreground">
              كلمة المرور (8 أحرف على الأقل)
            </label>
            <input
              id="np"
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              required
              minLength={8}
            />
          </div>
          <Button type="submit" size="sm" disabled={busy}>
            إضافة عميل
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[880px] text-right text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-3 py-2 font-medium">البريد</th>
              <th className="px-3 py-2 font-medium">اسم المستخدم</th>
              <th className="px-3 py-2 font-medium">المسار</th>
              <th className="px-3 py-2 font-medium">الهاتف</th>
              <th className="px-3 py-2 font-medium">الحالة</th>
              <th className="px-3 py-2 font-medium">الدور</th>
              <th className="px-3 py-2 font-medium">تاريخ الإنشاء</th>
              <th className="px-3 py-2 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserActionsRow
                key={u.id}
                user={u}
                busy={busy}
                viewerId={viewerId}
                onToggleDisabled={() => setDisabled(u.id, !u.disabled)}
                onSetPassword={(pw) => changePassword(u.id, pw)}
                onDelete={() => deleteUser(u.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserActionsRow({
  user,
  busy,
  viewerId,
  onToggleDisabled,
  onSetPassword,
  onDelete,
}: {
  user: UserRow;
  busy: boolean;
  viewerId: string;
  onToggleDisabled: () => void;
  onSetPassword: (pw: string) => void;
  onDelete: () => void;
}) {
  const [pw, setPw] = useState("");
  const publicPath = `/${encodeURIComponent(user.slug)}`;
  const isOwner = user.role === "owner";
  const isSelf = user.id === viewerId;
  const canDelete = !isSelf && !isOwner;
  const canToggle = !isOwner;
  const canSetPassword = !isOwner || isSelf;

  return (
    <tr className="border-b border-border last:border-0">
      <td className="max-w-[200px] truncate px-3 py-2 text-xs text-muted-foreground">
        {user.email}
      </td>
      <td className="px-3 py-2 font-mono text-xs">{user.username}</td>
      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
        {user.slug}
      </td>
      <td className="max-w-[140px] truncate px-3 py-2 text-xs text-muted-foreground">
        {user.phone ?? "—"}
      </td>
      <td className="px-3 py-2">
        {user.disabled ? (
          <span className="text-destructive">معطّل</span>
        ) : (
          <span className="text-muted-foreground">نشط</span>
        )}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {isOwner ? "صاحب المنصة" : "عميل"}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {user.createdAt}
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() =>
              window.open(publicPath, "_blank", "noopener,noreferrer")
            }
          >
            عرض الموقع
          </Button>
          {canToggle ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={onToggleDisabled}
            >
              {user.disabled ? "تفعيل" : "تعطيل"}
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={busy}
              onClick={onDelete}
            >
              حذف
            </Button>
          ) : null}
          {canSetPassword ? (
            <div className="flex flex-wrap items-center gap-1">
              <input
                type="password"
                placeholder="كلمة مرور جديدة"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-36 rounded-md border border-input bg-background px-2 py-1 text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => {
                  onSetPassword(pw);
                  setPw("");
                }}
              >
                تعيين كلمة المرور
              </Button>
            </div>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
