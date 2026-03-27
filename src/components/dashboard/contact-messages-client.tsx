"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string | null;
};

type ReadFilter = "all" | "unread" | "read";

function matchReadFilter(m: ContactMessageRow, f: ReadFilter): boolean {
  if (f === "all") return true;
  if (f === "unread") return !m.read;
  return m.read;
}

function matchDateRange(
  m: ContactMessageRow,
  dateFrom: string,
  dateTo: string,
): boolean {
  if (!dateFrom && !dateTo) return true;
  if (!m.createdAt) return false;
  const t = new Date(m.createdAt).getTime();
  if (dateFrom) {
    const start = new Date(`${dateFrom}T00:00:00`).getTime();
    if (t < start) return false;
  }
  if (dateTo) {
    const end = new Date(`${dateTo}T23:59:59.999`).getTime();
    if (t > end) return false;
  }
  return true;
}

export function ContactMessagesClient() {
  const [items, setItems] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [notifySupported, setNotifySupported] = useState(false);
  const [notifyPermission, setNotifyPermission] = useState<
    "default" | "granted" | "denied"
  >("default");

  const filteredItems = useMemo(() => {
    return items.filter(
      (m) =>
        matchReadFilter(m, readFilter) &&
        matchDateRange(m, dateFrom, dateTo),
    );
  }, [items, readFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setNotifySupported(true);
    setNotifyPermission(Notification.permission);
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/contacts", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        items?: ContactMessageRow[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "تعذّر تحميل الرسائل");
        setItems([]);
        return;
      }
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setError("تعذّر تحميل الرسائل");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markRead(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/contacts/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      if (!res.ok) return;
      setItems((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: true } : m)),
      );
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground" dir="rtl">
        جاري التحميل…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" dir="rtl">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" dir="rtl">
        لا توجد رسائل بعد. عندما يرسل زائر رسالة من نموذج التواصل في موقعك
        العام، ستظهر هنا.
      </p>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-col gap-4 rounded-lg border border-border/60 bg-muted/20 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="msg-read-filter">
              الحالة
            </label>
            <select
              id="msg-read-filter"
              className="flex h-9 min-w-[10rem] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={readFilter}
              onChange={(e) =>
                setReadFilter(e.target.value as ReadFilter)
              }
            >
              <option value="all">الكل</option>
              <option value="unread">غير مقروءة</option>
              <option value="read">مقروءة</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="msg-date-from">
              من تاريخ
            </label>
            <input
              id="msg-date-from"
              type="date"
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="msg-date-to">
              إلى تاريخ
            </label>
            <input
              id="msg-date-to"
              type="date"
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          {(dateFrom || dateTo) ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
            >
              مسح التاريخ
            </Button>
          ) : null}
        </div>
        {notifySupported ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
            {notifyPermission === "default" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const p = await Notification.requestPermission();
                    setNotifyPermission(p);
                    if (p === "granted") {
                      toast.success("تم تفعيل إشعارات المتصفح");
                    } else if (p === "denied") {
                      toast.message("لم يُمنح الإذن للإشعارات");
                    }
                  } catch {
                    toast.error("تعذّر طلب الإذن");
                  }
                }}
              >
                تفعيل إشعارات المتصفح
              </Button>
            ) : notifyPermission === "granted" ? (
              <p className="text-xs text-muted-foreground">
                إشعارات المتصفح مفعّلة — سيصلك تنبيه عند وصول رسالة جديدة أثناء استخدام
                لوحة التحكم.
              </p>
            ) : (
              <p className="text-xs text-destructive">
                تم رفض إشعارات المتصفح. يمكنك تغيير ذلك من إعدادات الموقع في
                المتصفح.
              </p>
            )}
          </div>
        ) : null}
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          لا توجد رسائل تطابق الفلتر. جرّب تغيير الحالة أو نطاق التاريخ.
        </p>
      ) : null}

      {filteredItems.map((m) => (
        <Card
          key={m.id}
          className={
            m.read ? "border-border/60 opacity-90" : "border-primary/30 shadow-sm"
          }
        >
          <CardHeader className="space-y-1 pb-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold">
                  {m.name || "بدون اسم"}
                </CardTitle>
                <CardDescription className="break-all font-mono text-xs">
                  {m.email}
                </CardDescription>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {m.createdAt ? (
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={m.createdAt}
                  >
                    {new Date(m.createdAt).toLocaleString("ar-EG", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </time>
                ) : null}
                {!m.read ? (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                    جديد
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">مقروءة</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {m.message}
            </p>
            {!m.read ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busyId === m.id}
                onClick={() => void markRead(m.id)}
              >
                {busyId === m.id ? "…" : "تعليم كمقروءة"}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
