"use client";

import { useAdminHeaderActions } from "@/components/dashboard/admin-dashboard-shell";
import { SiteVisibilityControls } from "@/components/dashboard/site-visibility-controls";
import type { SiteJson } from "@/data/site-defaults";
import { mergeSiteJsonForSave } from "@/lib/site-hydrate";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardSettingsPage() {
  const setHeaderActions = useAdminHeaderActions();
  const [siteData, setSiteData] = useState<SiteJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/site");
        if (!res.ok) {
          if (!cancelled) setMessage("تعذّر تحميل الإعدادات");
          return;
        }
        const data = await res.json();
        if (!cancelled) setSiteData(mergeSiteJsonForSave(data));
      } catch {
        if (!cancelled) setMessage("تعذّر تحميل الإعدادات");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(async () => {
    if (!siteData) return;
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "فشل الحفظ");
        return;
      }
      setMessage("تم الحفظ.");
    } catch {
      setMessage("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }, [siteData]);

  useEffect(() => {
    if (loading || !siteData) {
      setHeaderActions(null);
      return;
    }
    setHeaderActions(
      <div className="flex min-w-0 items-center gap-2">
        <Button type="button" size="sm" onClick={save} disabled={saving}>
          {saving ? "جاري الحفظ…" : "حفظ الإعدادات"}
        </Button>
        {message ? (
          <span className="hidden max-w-[min(100vw-12rem,200px)] truncate text-sm text-muted-foreground sm:inline">
            {message}
          </span>
        ) : null}
      </div>,
    );
    return () => setHeaderActions(null);
  }, [setHeaderActions, save, saving, message, loading, siteData]);

  const hashScrolled = useRef(false);
  useEffect(() => {
    if (loading || !siteData || hashScrolled.current) return;
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    hashScrolled.current = true;
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [loading, siteData]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">جاري التحميل…</p>;
  }
  if (!siteData) {
    return <p className="text-sm text-destructive">تعذّر تحميل الإعدادات.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">إعدادات الموقع العام</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          تحكّم في ظهور الأقسام والمدونة والشريط السفلي وثيم الموقع. عدّل النصوص والصور من{" "}
          <Link href="/dashboard/site" className="font-medium text-primary underline-offset-4 hover:underline">
            المحرر
          </Link>
          .
        </p>
      </div>
      <SiteVisibilityControls data={siteData} onChange={setSiteData} />
      <p className="text-xs text-muted-foreground">
        لإعادة معالج إعداد السيرة الموجّه، افتح{" "}
        <Link href="/dashboard/site" className="font-medium text-primary underline-offset-4 hover:underline">
          المحرّر
        </Link>{" "}
        واضغط «العودة إلى معالج إعداد السيرة».
      </p>
    </div>
  );
}
