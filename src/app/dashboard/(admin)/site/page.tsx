"use client";

import { useAdminHeaderActions } from "@/components/dashboard/admin-dashboard-shell";
import { SitePreviewPanel } from "@/components/dashboard/site-preview-panel";
import { SiteShareCard } from "@/components/dashboard/site-share-card";
import { SiteWorkProjectsEditor } from "@/components/dashboard/site-work-projects-editor";
import { Button } from "@/components/ui/button";
import type { PortfolioTextDirection, SiteJson } from "@/data/site-defaults";
import { captureAndSharePortfolioImage } from "@/lib/site-share-image";
import { buildPublicPortfolioUrl, getEnvPublicSiteBase, resolvePublicSiteBase } from "@/lib/site-public-base";
import { hydrateSiteJson, mergeSiteJsonForSave } from "@/lib/site-hydrate";
import { cn } from "@/lib/utils";
import { ExternalLink, Printer, Share2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SlugAvailabilityDetail = "yours" | "available" | "taken" | "invalid";

export default function DashboardSitePage() {
  const setHeaderActions = useAdminHeaderActions();
  const [siteData, setSiteData] = useState<SiteJson | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSlug, setSavingSlug] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<{
    checking: boolean;
    normalized: string;
    detail: SlugAvailabilityDetail | null;
  }>({ checking: false, normalized: "", detail: null });
  const slugCheckSeq = useRef(0);
  const [origin, setOrigin] = useState("");
  const [blogPostCount, setBlogPostCount] = useState(0);
  const [shareBusy, setShareBusy] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [siteEditorTab, setSiteEditorTab] = useState<"general" | "profile" | "career">("general");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [siteRes, profileRes, postsRes] = await Promise.all([
          fetch("/api/admin/site", { cache: "no-store" }),
          fetch("/api/admin/profile", { cache: "no-store" }),
          fetch("/api/admin/posts", { cache: "no-store" }),
        ]);
        if (!siteRes.ok) {
          setMessage("تعذّر تحميل بيانات الموقع");
          return;
        }
        const data = await siteRes.json();
        if (!cancelled) {
          setSiteData(mergeSiteJsonForSave(data));
        }
        if (profileRes.ok) {
          const profile = await profileRes.json();
          const currentSlug =
            typeof profile.slug === "string" ? profile.slug : "";
          if (!cancelled) {
            setSlug(currentSlug);
            setPublicUrl(buildPublicPortfolioUrl(currentSlug));
          }
        }
        if (postsRes.ok) {
          const posts = (await postsRes.json()) as unknown;
          if (!cancelled && Array.isArray(posts)) {
            setBlogPostCount(posts.length);
          }
        }
      } catch {
        if (!cancelled) setMessage("تعذّر تحميل بيانات الموقع");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setOrigin(resolvePublicSiteBase());
  }, []);

  useEffect(() => {
    const seq = ++slugCheckSeq.current;
    setSlugAvailability((prev) => ({ ...prev, checking: true }));
    const ac = new AbortController();
    const t = window.setTimeout(() => {
      (async () => {
        try {
          const res = await fetch(
            `/api/admin/profile/slug-availability?slug=${encodeURIComponent(slug)}`,
            { signal: ac.signal },
          );
          if (seq !== slugCheckSeq.current) return;
          if (!res.ok) {
            setSlugAvailability({ checking: false, normalized: "", detail: null });
            return;
          }
          const data = (await res.json()) as {
            normalized: string;
            detail: SlugAvailabilityDetail;
          };
          if (seq !== slugCheckSeq.current) return;
          setSlugAvailability({
            checking: false,
            normalized: data.normalized,
            detail: data.detail,
          });
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return;
          if (seq !== slugCheckSeq.current) return;
          setSlugAvailability({ checking: false, normalized: "", detail: null });
        }
      })();
    }, 350);
    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, [slug]);

  const mergedShareData = useMemo(() => {
    if (!siteData) return null;
    return hydrateSiteJson(mergeSiteJsonForSave(siteData));
  }, [siteData]);

  const sharePortfolio = useCallback(async () => {
    if (!publicUrl.trim() || !siteData) return;
    setShareBusy(true);
    setMessage(null);
    try {
      await navigator.clipboard.writeText(publicUrl);
    } catch {
      setMessage("تعذر نسخ الرابط.");
      setShareBusy(false);
      return;
    }
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    const result = await captureAndSharePortfolioImage(shareCardRef.current, {
      slug: slug || "portfolio",
      publicUrl,
    });
    if (!result.ok) {
      setMessage(`${result.error} — تم نسخ الرابط.`);
    } else {
      setMessage("تم نسخ الرابط وتجهيز بطاقة المشاركة. إن ظهرت نافذة المشاركة فاختر «حفظ الصورة» أو شاركها؛ وإلا تُحمَّل الصورة تلقائياً.");
    }
    setShareBusy(false);
  }, [publicUrl, siteData, slug]);

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
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" onClick={save} disabled={saving}>
          {saving ? "جاري الحفظ…" : "حفظ"}
        </Button>
        {publicUrl.trim() ? (
          <Button variant="outline" size="sm" asChild>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="me-1 size-4 opacity-80" aria-hidden />
              زيارة موقعك
            </a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ExternalLink className="me-1 size-4 opacity-80" aria-hidden />
            زيارة موقعك
          </Button>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/cv-print">
            <Printer className="me-1 size-4 opacity-80" aria-hidden />
            طباعة السيرة
          </Link>
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={sharePortfolio}
          disabled={shareBusy || !publicUrl.trim()}
        >
          {shareBusy ? (
            "جاري التجهيز…"
          ) : (
            <>
              <Share2 className="me-1 size-4 opacity-80" aria-hidden />
              مشاركة
            </>
          )}
        </Button>
        {message ? (
          <span className="max-w-[min(100vw-12rem,280px)] truncate text-sm text-muted-foreground">
            {message}
          </span>
        ) : null}
      </div>,
    );
    return () => setHeaderActions(null);
  }, [
    setHeaderActions,
    save,
    saving,
    sharePortfolio,
    shareBusy,
    message,
    loading,
    siteData,
    publicUrl,
  ]);

  async function saveSlug() {
    setMessage(null);
    setSavingSlug(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "تعذّر تحديث المعرّف");
        return;
      }
      if (typeof data.slug === "string") {
        setSlug(data.slug);
        setPublicUrl(buildPublicPortfolioUrl(data.slug));
      }
      setMessage("تم تحديث الرابط العام.");
    } catch {
      setMessage("تعذّر تحديث المعرّف");
    } finally {
      setSavingSlug(false);
    }
  }

  async function copyPublicUrl() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setMessage("تم نسخ الرابط.");
    } catch {
      setMessage("تعذّر نسخ الرابط");
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">جاري التحميل…</p>;
  }
  if (!siteData) {
    return <p className="text-sm text-destructive">تعذّر تحميل بيانات الموقع.</p>;
  }

  return (
    <>
      {mergedShareData ? (
        <div
          className="pointer-events-none fixed -left-[9999px] top-0 z-[100]"
          aria-hidden
        >
          <SiteShareCard
            ref={shareCardRef}
            data={mergedShareData}
            publicUrl={publicUrl}
            blogPostCount={blogPostCount}
          />
        </div>
      ) : null}
    <div className="grid gap-8 xl:grid-cols-2 xl:items-start">
      <div className="min-w-0 space-y-4">
        <div id="site-public-link" className="scroll-mt-28">
          <h1 className="text-xl font-semibold tracking-tight">محتوى الموقع</h1>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            عدّل الرابط والمحتوى؛ الظهور للزوار والثيم من{" "}
            <Link href="/dashboard/settings" className="font-medium text-primary underline-offset-4 hover:underline">
              الإعدادات
            </Link>
            . المعاينة تتحدّث مع الحقول.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 border-b border-border pb-3">
            {(
              [
                ["general", "عام"],
                ["profile", "الملف والتواصل"],
                ["career", "السيرة والمشاريع"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSiteEditorTab(key)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  siteEditorTab === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {siteEditorTab === "general" ? (
          <>
          <div className="mt-4 rounded-lg border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              الرابط العام
            </p>
            <div className="mt-2 grid gap-x-2 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label
                htmlFor="profile-slug"
                className="text-xs text-muted-foreground sm:col-start-1 sm:row-start-1"
              >
                المعرّف في الرابط
              </label>
              <input
                id="profile-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 font-mono text-sm sm:col-start-1 sm:row-start-2"
                placeholder="your-name"
              />
              <div className="flex flex-wrap gap-2 sm:col-start-2 sm:row-start-2 sm:self-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={saveSlug}
                  disabled={
                    savingSlug ||
                    slugAvailability.checking ||
                    slugAvailability.detail === "taken" ||
                    slugAvailability.detail === "invalid"
                  }
                >
                  {savingSlug ? "جاري الحفظ…" : "حفظ المعرّف"}
                </Button>
                <Button type="button" variant="outline" onClick={copyPublicUrl} disabled={!publicUrl}>
                  نسخ الرابط
                </Button>
              </div>
              <div className="min-w-0 space-y-1 sm:col-span-1 sm:col-start-1 sm:row-start-3">
                {(getEnvPublicSiteBase() || origin) && slugAvailability.normalized ? (
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {`${getEnvPublicSiteBase() || origin}/${slugAvailability.normalized}`}
                  </p>
                ) : null}
                <p className="text-xs">
                  {slugAvailability.checking ? (
                    <span className="text-muted-foreground">جاري التحقق من التوفر…</span>
                  ) : slugAvailability.detail === "yours" ? (
                    <span className="text-muted-foreground">هذا هو رابطك العام الحالي.</span>
                  ) : slugAvailability.detail === "available" ? (
                    <span className="text-green-700 dark:text-green-400">
                      متاح — احفظ المعرّف لاستخدام هذا الرابط.
                    </span>
                  ) : slugAvailability.detail === "taken" ? (
                    <span className="text-destructive">المعرّف مستخدم من قبل شخص آخر.</span>
                  ) : slugAvailability.detail === "invalid" ? (
                    <span className="text-destructive">
                      من 3 إلى 48 حرفاً: أحرف إنجليزية صغيرة وأرقام وشرطات فقط
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              اتجاه ولغة المعاينة
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              نفس إعدادات المحفظة العامة؛ يُحفظ مع «حفظ». يفصل اتجاه المعاينة عن واجهة المحرر (عربي).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ["ltr", "إنجليزي ← المعاينة يسار لليمين"],
                  ["rtl", "عربي ← المعاينة يمين لليسار"],
                ] as const satisfies readonly [PortfolioTextDirection, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setSiteData((prev) => {
                      if (!prev) return prev;
                      const next: SiteJson = {
                        ...prev,
                        publicControls: {
                          ...prev.publicControls,
                          ui: {
                            ...prev.publicControls.ui,
                            portfolioDir: value,
                          },
                        },
                      };
                      return next;
                    })
                  }
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs transition-colors",
                    siteData.publicControls.ui.portfolioDir === value
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-border bg-background hover:bg-muted/50",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-1">
              <label
                htmlFor="editor-portfolio-lang"
                className="text-xs text-muted-foreground"
              >
                رمز اللغة للمعاينة (مثل en أو ar)
              </label>
              <input
                id="editor-portfolio-lang"
                className="w-full max-w-xs rounded-md border border-input bg-background px-2 py-1.5 font-mono text-sm"
                value={siteData.publicControls.ui.portfolioLang}
                placeholder="en"
                maxLength={12}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
                  setSiteData((prev) => {
                    if (!prev) return prev;
                    const next: SiteJson = {
                      ...prev,
                      publicControls: {
                        ...prev.publicControls,
                        ui: {
                          ...prev.publicControls.ui,
                          portfolioLang: v || "en",
                        },
                      },
                    };
                    return next;
                  });
                }}
              />
            </div>
          </div>
          <p className="mt-3 text-sm">
            <Link
              href="/dashboard/cv-print"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              معاينة وطباعة السيرة
            </Link>
          </p>
          <p className="mt-2 rounded-md border border-dashed border-border/80 bg-muted/15 p-3 text-xs leading-relaxed text-muted-foreground">
            مفاتيح الأيقونات الاجتماعية:{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
              github | linkedin | x | youtube | email
            </code>
            . روابط المشاريع:{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">globe | github</code>
            . شريط التنقل:{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Home | Notebook</code>{" "}
            (Lucide).
          </p>
          </>
          ) : null}
        </div>
        {siteEditorTab === "profile" ? (
          <SiteWorkProjectsEditor data={siteData} onChange={setSiteData} editorMode="profile" />
        ) : null}
        {siteEditorTab === "career" ? (
          <SiteWorkProjectsEditor data={siteData} onChange={setSiteData} editorMode="career" />
        ) : null}
      </div>
      <div id="site-preview" className="min-w-0 scroll-mt-28 xl:sticky xl:top-6">
        <SitePreviewPanel
          data={siteData}
          contactOwnerSlug={slug.trim() || undefined}
        />
      </div>
    </div>
    </>
  );
}
