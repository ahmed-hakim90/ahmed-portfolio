"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";

export type UserRow = {
  id: string;
  email: string;
  slug: string;
  role: "owner" | "client";
  disabled: boolean;
  createdAt: string;
  phone: string | null;
  /** From `sites/{id}.json` name when present */
  displayName?: string | null;
  /** معالج إعداد السيرة بعد تسجيل الدخول (فهرس 0–6). */
  onboardingStep?: number;
  onboardingCompleted?: boolean;
  /** زيارة `/slug` للعميل؛ الافتراضي true للمستندات القديمة. */
  publicPortfolioAccessEnabled?: boolean;
  publicPortfolioExpiresAt?: string | null;
};

type SlugAvailDetail = "invalid" | "available" | "taken" | null;

const ONBOARDING_TOTAL_STEPS = 7;

function slugAccessLabel(u: UserRow): string {
  const enabled = u.publicPortfolioAccessEnabled !== false;
  if (!enabled) return "معطّل";
  const raw = u.publicPortfolioExpiresAt;
  if (typeof raw === "string" && raw.length > 0) {
    const t = Date.parse(raw);
    if (Number.isFinite(t)) {
      if (t < Date.now()) return "انتهت المدة";
      return `حتى ${new Date(t).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}`;
    }
  }
  return "بدون انتهاء";
}

function onboardingLabel(u: UserRow): string {
  const completed = u.onboardingCompleted !== false;
  if (completed) return "مكتمل";
  const raw = u.onboardingStep;
  const stepIdx =
    typeof raw === "number" && Number.isFinite(raw)
      ? Math.min(6, Math.max(0, Math.floor(raw)))
      : 0;
  return `الخطوة ${stepIdx + 1} من ${ONBOARDING_TOTAL_STEPS}`;
}

export function UsersPageClient({ viewerId }: { viewerId: string }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugCheck, setSlugCheck] = useState<{
    checking: boolean;
    normalized: string;
    detail: SlugAvailDetail;
  }>({ checking: false, normalized: "", detail: null });
  const slugCheckSeq = useRef(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        cache: "no-store",
      });
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

  useEffect(() => {
    const raw = newSlug.trim();
    if (raw.length === 0) {
      slugCheckSeq.current += 1;
      setSlugCheck({ checking: false, normalized: "", detail: null });
      return;
    }
    const seq = ++slugCheckSeq.current;
    setSlugCheck((s) => ({ ...s, checking: true }));
    const t = window.setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(
            `/api/admin/users/slug-availability?slug=${encodeURIComponent(raw)}`,
            { cache: "no-store" },
          );
          const data = (await res.json().catch(() => ({}))) as {
            normalized?: string;
            detail?: string;
          };
          if (seq !== slugCheckSeq.current) return;
          const detail = data.detail;
          const normalized =
            typeof data.normalized === "string" ? data.normalized : "";
          if (
            detail === "invalid" ||
            detail === "available" ||
            detail === "taken"
          ) {
            setSlugCheck({
              checking: false,
              normalized,
              detail,
            });
          } else {
            setSlugCheck({ checking: false, normalized: "", detail: null });
          }
        } catch {
          if (seq !== slugCheckSeq.current) return;
          setSlugCheck({ checking: false, normalized: "", detail: null });
        }
      })();
    }, 400);
    return () => window.clearTimeout(t);
  }, [newSlug]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (newDisplayName.trim().length < 2) {
      setMessage("أدخل الاسم الظاهر (حرفان على الأقل)");
      return;
    }
    if (newPhone.trim().length < 5) {
      setMessage("أدخل رقم هاتف صالح");
      return;
    }
    if (slugCheck.detail !== "available") {
      setMessage("تأكد أن مسار الموقع (slug) متاح قبل الإنشاء");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim(),
          password: newPass,
          displayName: newDisplayName.trim(),
          phone: newPhone.trim(),
          slug: newSlug.trim(),
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
      setNewDisplayName("");
      setNewPhone("");
      setNewSlug("");
      setSlugCheck({ checking: false, normalized: "", detail: null });
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

  async function setSlugAccess(
    id: string,
    mode: "disable" | "extend",
    months?: 1 | 6 | 12,
  ) {
    setMessage(null);
    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        publicPortfolioAccess: mode,
      };
      if (mode === "extend" && months != null) {
        body.publicPortfolioMonths = months;
      }
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(
          typeof data.error === "string" ? data.error : "فشل تحديث الرابط العام",
        );
        return;
      }
      await load();
      setMessage(
        mode === "disable"
          ? "تم تعطيل الرابط العام."
          : "تم تفعيل الرابط العام للمدة المحددة.",
      );
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
          صاحب المنصة فقط يدير الحسابات. يمكن تفعيل أو تعطيل الرابط العام{" "}
          <span className="font-mono text-xs">/slug</span> للعميل لمدة شهر أو 6 أو
          12 شهراً. إنشاء حساب عميل بالاسم والهاتف ومسار الموقع العام — يدخل عبر{" "}
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="ndn" className="text-xs text-muted-foreground">
              الاسم الظاهر
            </label>
            <input
              id="ndn"
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              required
              minLength={2}
              autoComplete="name"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="nph" className="text-xs text-muted-foreground">
              الهاتف
            </label>
            <input
              id="nph"
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              required
              minLength={5}
              autoComplete="tel"
            />
          </div>
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <label htmlFor="nslug" className="text-xs text-muted-foreground">
              مسار الموقع (slug)
            </label>
            <input
              id="nslug"
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 font-mono text-sm"
              required
              placeholder="مثال: ahmed-dev"
              dir="ltr"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {slugCheck.checking ? (
                <>جاري التحقق…</>
              ) : newSlug.trim().length === 0 ? (
                <>أدخل مساراً فريداً (أحرف صغيرة وأرقام وشرطة).</>
              ) : slugCheck.detail === "invalid" ? (
                <>غير صالح — 3–48 حرفاً، بصيغة مثل{" "}
                <span className="font-mono">my-name</span></>
              ) : slugCheck.detail === "taken" ? (
                <>المسار محجوز.</>
              ) : slugCheck.detail === "available" ? (
                <>
                  متاح:{" "}
                  <span className="font-mono" dir="ltr">
                    /{slugCheck.normalized}
                  </span>
                </>
              ) : (
                <>تعذر التحقق.</>
              )}
            </p>
          </div>
          <div className="space-y-1">
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
              autoComplete="email"
            />
          </div>
          <div className="space-y-1">
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
              autoComplete="new-password"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              size="sm"
              disabled={
                busy ||
                slugCheck.checking ||
                slugCheck.detail !== "available"
              }
            >
              إضافة عميل
            </Button>
          </div>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[1080px] text-right text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-3 py-2 font-medium">البريد</th>
              <th className="px-3 py-2 font-medium">الاسم الظاهر</th>
              <th className="px-3 py-2 font-medium">المعرّف في الرابط</th>
              <th className="px-3 py-2 font-medium">الهاتف</th>
              <th className="px-3 py-2 font-medium">الحالة</th>
              <th className="px-3 py-2 font-medium">الرابط العام</th>
              <th className="px-3 py-2 font-medium">مرحلة الإعداد</th>
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
                onSlugAccess={(mode, months) =>
                  setSlugAccess(u.id, mode, months)
                }
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
  onSlugAccess,
}: {
  user: UserRow;
  busy: boolean;
  viewerId: string;
  onToggleDisabled: () => void;
  onSetPassword: (pw: string) => void;
  onDelete: () => void;
  onSlugAccess: (
    mode: "disable" | "extend",
    months?: 1 | 6 | 12,
  ) => void;
}) {
  const [pw, setPw] = useState("");
  const publicPath = `/${encodeURIComponent(user.slug)}`;
  const isOwner = user.role === "owner";
  const isSelf = user.id === viewerId;
  const canDelete = !isSelf && !isOwner;
  const canToggle = !isOwner;
  const canSetPassword = !isOwner || isSelf;
  const canManageSlugAccess = !isOwner;
  const subject = encodeURIComponent("رسالة من إدارة المنصة");
  const mailtoHref = `mailto:${encodeURIComponent(user.email)}?subject=${subject}`;
  const whatsappHref = user.phone
    ? `https://wa.me/${encodeURIComponent(user.phone.replace(/[^\d]/g, ""))}`
    : null;

  return (
    <tr className="border-b border-border last:border-0">
      <td className="max-w-[200px] truncate px-3 py-2 text-xs text-muted-foreground">
        {user.email}
      </td>
      <td className="max-w-[140px] truncate px-3 py-2 text-xs">
        {user.displayName ?? "—"}
      </td>
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
      <td className="max-w-[160px] px-3 py-2 text-xs text-muted-foreground">
        {isOwner ? (
          "—"
        ) : (
          <span title={slugAccessLabel(user)}>{slugAccessLabel(user)}</span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
        {onboardingLabel(user)}
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
          {canManageSlugAccess ? (
            <div className="flex flex-wrap items-center gap-1 border-r border-border pr-2 sm:border-r-0 sm:pr-0">
              <span className="text-[10px] text-muted-foreground sm:sr-only">
                slug
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 px-2 text-[11px]"
                disabled={busy}
                onClick={() => onSlugAccess("extend", 1)}
              >
                1 شهر
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 px-2 text-[11px]"
                disabled={busy}
                onClick={() => onSlugAccess("extend", 6)}
              >
                6 شهور
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 px-2 text-[11px]"
                disabled={busy}
                onClick={() => onSlugAccess("extend", 12)}
              >
                12 شهراً
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px] text-destructive hover:text-destructive"
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm(
                      "تعطيل الرابط العام؟ لن يظهر موقع العميل للزوار.",
                    )
                  ) {
                    onSlugAccess("disable");
                  }
                }}
              >
                تعطيل الرابط
              </Button>
            </div>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => window.open(mailtoHref, "_self")}
          >
            إرسال بريد
          </Button>
          {whatsappHref ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => window.open(whatsappHref, "_blank", "noopener,noreferrer")}
            >
              واتساب
            </Button>
          ) : null}
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
