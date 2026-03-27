"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string | null;
};

export function ContactMessagesClient() {
  const [items, setItems] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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
      {items.map((m) => (
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
