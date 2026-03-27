"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";

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

const ONBOARDING_TOTAL_STEPS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRING_SOON_DAYS = 30;

type PublicAccessState = {
  kind: "disabled" | "expired" | "expiringSoon" | "active" | "noExpiry";
  label: string;
  detail: string;
};

function formatArabicDate(ts: number): string {
  return new Date(ts).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getPublicAccessState(
  user: UserRow,
  nowTs: number = Date.now(),
): PublicAccessState {
  const enabled = user.publicPortfolioAccessEnabled !== false;
  if (!enabled) {
    return {
      kind: "disabled",
      label: "معطّل",
      detail: "الرابط العام متوقف",
    };
  }

  const raw = user.publicPortfolioExpiresAt;
  if (typeof raw === "string" && raw.length > 0) {
    const expiresTs = Date.parse(raw);
    if (Number.isFinite(expiresTs)) {
      if (expiresTs <= nowTs) {
        return {
          kind: "expired",
          label: "انتهت الصلاحية",
          detail: `انتهى في ${formatArabicDate(expiresTs)}`,
        };
      }

      const daysLeft = Math.max(1, Math.ceil((expiresTs - nowTs) / DAY_MS));
      if (daysLeft <= EXPIRING_SOON_DAYS) {
        return {
          kind: "expiringSoon",
          label: "قرب الانتهاء",
          detail: `متبقي ${daysLeft} يوم - ينتهي ${formatArabicDate(expiresTs)}`,
        };
      }

      return {
        kind: "active",
        label: "لسه ساري",
        detail: `متبقي ${daysLeft} يوم - ينتهي ${formatArabicDate(expiresTs)}`,
      };
    }
  }

  return {
    kind: "noExpiry",
    label: "لسه ساري",
    detail: "بدون تاريخ انتهاء",
  };
}

function publicAccessBadgeClass(kind: PublicAccessState["kind"]): string {
  switch (kind) {
    case "expired":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "expiringSoon":
      return "border-amber-300/60 bg-amber-100/60 text-amber-900 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-200";
    case "active":
    case "noExpiry":
      return "border-emerald-300/60 bg-emerald-100/60 text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-200";
    case "disabled":
    default:
      return "border-border bg-muted text-muted-foreground";
  }
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

  const nowTs = Date.now();
  const clientRows = users.filter((u) => u.role === "client");
  const accessSummary = clientRows.reduce(
    (acc, u) => {
      const state = getPublicAccessState(u, nowTs);
      if (state.kind === "expiringSoon") {
        acc.expiringSoon += 1;
      } else if (state.kind === "expired") {
        acc.expired += 1;
      } else if (state.kind === "disabled") {
        acc.disabled += 1;
      } else {
        acc.active += 1;
      }
      return acc;
    },
    { active: 0, expiringSoon: 0, expired: 0, disabled: 0 },
  );

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">المستخدمون</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          صاحب المنصة فقط يدير الحسابات. يمكن تفعيل أو تعطيل الرابط العام{" "}
          <span className="font-mono text-xs">/slug</span> للعميل لمدة شهر أو 6 أو
          12 شهراً. صاحب المنصة يُنشأ مرة واحدة من{" "}
          <span className="font-medium">إعداد المنصة</span> وليس من هنا.
        </p>
      </div>

      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-amber-300/60 bg-amber-100/40 p-3 dark:border-amber-700/60 dark:bg-amber-900/20">
          <p className="text-xs text-muted-foreground">قرب الانتهاء (30 يوم)</p>
          <p className="mt-1 text-lg font-semibold">{accessSummary.expiringSoon}</p>
        </div>
        <div className="rounded-lg border border-emerald-300/60 bg-emerald-100/40 p-3 dark:border-emerald-700/60 dark:bg-emerald-900/20">
          <p className="text-xs text-muted-foreground">لسه ساري</p>
          <p className="mt-1 text-lg font-semibold">{accessSummary.active}</p>
        </div>
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          <p className="text-xs text-muted-foreground">انتهت الصلاحية</p>
          <p className="mt-1 text-lg font-semibold">{accessSummary.expired}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">معطّل</p>
          <p className="mt-1 text-lg font-semibold">{accessSummary.disabled}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[1080px] text-right text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-3 py-2 font-medium">البريد</th>
              <th className="px-3 py-2 font-medium">الاسم الظاهر</th>
              <th className="px-3 py-2 font-medium">المعرّف في الرابط</th>
              <th className="px-3 py-2 font-medium">الهاتف</th>
              <th className="px-3 py-2 font-medium">الحالة</th>
              <th className="px-3 py-2 font-medium">حالة الصلاحية</th>
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
                accessState={getPublicAccessState(u, nowTs)}
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
  accessState,
  busy,
  viewerId,
  onToggleDisabled,
  onSetPassword,
  onDelete,
  onSlugAccess,
}: {
  user: UserRow;
  accessState: PublicAccessState;
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
          <div className="flex flex-col gap-1">
            <span
              className={`inline-flex w-fit items-center rounded-md border px-1.5 py-0.5 text-[11px] ${publicAccessBadgeClass(accessState.kind)}`}
              title={accessState.detail}
            >
              {accessState.label}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {accessState.detail}
            </span>
          </div>
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
