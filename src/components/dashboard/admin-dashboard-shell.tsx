"use client";

import { LogoutButton } from "@/components/dashboard/logout-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ChevronDown,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Mail,
  Menu,
  Pencil,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react";
import { scrollToSiteEditorSection } from "@/lib/site-editor-scroll";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DashboardSidebarPost = {
  slug: string;
  title: string;
  publishedAt: string;
};

type SetHeaderActions = (node: ReactNode | null) => void;

const AdminHeaderActionsContext = createContext<SetHeaderActions | null>(null);

export function useAdminHeaderActions(): SetHeaderActions {
  const set = useContext(AdminHeaderActionsContext);
  if (!set) {
    throw new Error("useAdminHeaderActions must be used within AdminDashboardShell");
  }
  return set;
}

function navActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Flat jump list for the site editor (no accordion).
 * `page: "site"` → ids on `/dashboard/site` + `site-work-projects-editor`.
 * `page: "settings"` → id on `/dashboard/settings` (visibility block).
 */
const SITE_EDITOR_ANCHORS: {
  hash: string;
  label: string;
  page: "site" | "settings";
}[] = [
  // { hash: "site-public-link", label: "الرابط العام", page: "site" },
  // { hash: "site-visibility", label: "الظهور والتبويبات", page: "settings" },
  // { hash: "site-profile", label: "الملف والبطاقة", page: "site" },
  // { hash: "site-skills", label: "المهارات", page: "site" },
  // { hash: "site-contact", label: "بيانات التواصل", page: "site" },
  // { hash: "site-social", label: "الشبكات الاجتماعية", page: "site" },
  // { hash: "site-get-in-touch", label: "قسم التواصل", page: "site" },
  // { hash: "site-about-me", label: "نبذة عني", page: "site" },
  // { hash: "site-custom-sections", label: "أقسام إضافية", page: "site" },
  // { hash: "site-education", label: "التعليم", page: "site" },
  // { hash: "site-work", label: "الخبرة العملية", page: "site" },
  // { hash: "site-projects", label: "المشاريع", page: "site" },
];

function anchorLinkClass(active: boolean) {
  return cn(
    "flex min-h-10 items-center rounded-md px-3 py-2 text-xs transition-colors md:min-h-0 md:px-2 md:py-1.5",
    active
      ? "bg-muted font-medium text-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

function SidebarContent({
  isOwner,
  publicBlogUrl,
  blogPosts,
  pathname,
  onNavigate,
}: {
  isOwner: boolean;
  publicBlogUrl: string;
  blogPosts: DashboardSidebarPost[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const [routeHash, setRouteHash] = useState("");
  const [blogListOpen, setBlogListOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sync = () => setRouteHash(window.location.hash.replace(/^#/, ""));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  const linkClass = (href: string) =>
    cn(
      "flex min-h-11 touch-manipulation items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted md:min-h-0 md:px-2 md:py-1.5",
      navActive(pathname, href) && "bg-muted font-medium text-foreground",
    );

  const onSite = navActive(pathname, "/dashboard/site");

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          اللوحة
        </p>
        <nav className="flex flex-col gap-0.5">
          <div>
            <Link href="/dashboard/site" className={linkClass("/dashboard/site")} onClick={onNavigate}>
              <LayoutDashboard className="size-4 shrink-0 opacity-70" aria-hidden />
              المحرر
            </Link>
            {onSite ? (
              <div className="mt-2 max-h-[min(52dvh,420px)] space-y-0.5 overflow-y-auto overscroll-y-contain border-s border-border ps-2 ms-2 md:max-h-[min(60vh,480px)]">
                {SITE_EDITOR_ANCHORS.map(({ hash, label, page }) => {
                  const active =
                    routeHash === hash &&
                    (page === "settings"
                      ? pathname.startsWith("/dashboard/settings")
                      : pathname.startsWith("/dashboard/site"));
                  if (page === "settings") {
                    return (
                      <Link
                        key={hash}
                        href={`/dashboard/settings#${hash}`}
                        className={anchorLinkClass(active)}
                        onClick={() => {
                          setRouteHash(hash);
                          onNavigate?.();
                        }}
                      >
                        {label}
                      </Link>
                    );
                  }
                  return (
                    <Link
                      key={hash}
                      href={`/dashboard/site#${hash}`}
                      className={anchorLinkClass(active)}
                      onClick={(e) => {
                        e.preventDefault();
                        setRouteHash(hash);
                        onNavigate?.();
                        if (!pathname.startsWith("/dashboard/site")) {
                          router.push("/dashboard/site");
                          window.setTimeout(() => scrollToSiteEditorSection(hash), 200);
                          return;
                        }
                        window.requestAnimationFrame(() => {
                          scrollToSiteEditorSection(hash);
                        });
                      }}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
          <Link href="/dashboard/blog" className={linkClass("/dashboard/blog")} onClick={onNavigate}>
            <FileText className="size-4 shrink-0 opacity-70" aria-hidden />
            المدونة
          </Link>
          <Link
            href="/dashboard/messages"
            className={linkClass("/dashboard/messages")}
            onClick={onNavigate}
          >
            <Mail className="size-4 shrink-0 opacity-70" aria-hidden />
            الرسائل
          </Link>
          <Link href="/dashboard/settings" className={linkClass("/dashboard/settings")} onClick={onNavigate}>
            <Settings className="size-4 shrink-0 opacity-70" aria-hidden />
            الإعدادات
          </Link>
          {isOwner ? (
            <>
              <Link
                href="/dashboard/analytics"
                className={linkClass("/dashboard/analytics")}
                onClick={onNavigate}
              >
                <BarChart3 className="size-4 shrink-0 opacity-70" aria-hidden />
                التحليلات
              </Link>
              <Link href="/dashboard/users" className={linkClass("/dashboard/users")} onClick={onNavigate}>
                <Users className="size-4 shrink-0 opacity-70" aria-hidden />
                المستخدمون
              </Link>
            </>
          ) : null}
        </nav>
      </div>

      <Separator />

      <div className="min-h-0 flex-1 rounded-lg border border-border/60 bg-muted/10 p-3">
        <p className="mb-1.5 px-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          مدونتك
        </p>
        <p className="mb-3 px-0.5 text-[11px] leading-relaxed text-muted-foreground">
          يفتح الزوار المدونة من الرابط العام دون تسجيل إذا كان مسار المدونة مفعّلاً في إعدادات الموقع.
        </p>
        <div className="mb-3 flex flex-col gap-2">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2" asChild>
            <Link href="/dashboard/blog/new" onClick={onNavigate}>
              <Plus className="size-4" aria-hidden />
              مقال جديد
            </Link>
          </Button>
          <Button variant="secondary" size="sm" className="w-full justify-start gap-2" asChild>
            <Link href={publicBlogUrl} target="_blank" rel="noopener noreferrer" onClick={onNavigate}>
              <ExternalLink className="size-4" aria-hidden />
              فتح المدونة العامة
            </Link>
          </Button>
        </div>
        <p className="mb-2 truncate px-0.5 font-mono text-[11px] text-muted-foreground" title={publicBlogUrl}>
          {publicBlogUrl}
        </p>
        <button
          type="button"
          className="mb-2 flex w-full min-h-10 items-center justify-between gap-2 rounded-md border border-border/60 bg-background/80 px-2 py-2 text-start text-[11px] font-medium text-muted-foreground touch-manipulation hover:bg-muted/50 md:min-h-0 md:py-1.5"
          aria-expanded={blogListOpen}
          onClick={() => setBlogListOpen((o) => !o)}
        >
          <span>قائمة المقالات هنا ({blogPosts.length})</span>
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 opacity-70 transition-transform duration-200",
              blogListOpen && "rotate-180",
            )}
            aria-hidden
          />
        </button>
        {blogListOpen ? (
          <div className="max-h-[min(200px,32dvh)] overflow-y-auto overscroll-y-contain rounded-md border border-border bg-background/80 md:max-h-[min(240px,32vh)]">
            {blogPosts.length === 0 ? (
              <p className="p-3 text-xs text-muted-foreground">لا توجد مقالات بعد.</p>
            ) : (
              <ul className="divide-y divide-border">
                {blogPosts.map((p) => {
                  const publicPostUrl = `${publicBlogUrl}/${encodeURIComponent(p.slug)}`;
                  return (
                    <li key={p.slug} className="p-2">
                      <p className="truncate text-sm font-medium leading-snug" title={p.title || p.slug}>
                        {p.title || p.slug}
                      </p>
                      {p.publishedAt ? (
                        <p className="truncate text-[11px] text-muted-foreground">{p.publishedAt}</p>
                      ) : null}
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        <Link
                          href={`/dashboard/blog/${encodeURIComponent(p.slug)}`}
                          className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                          onClick={onNavigate}
                        >
                          <Pencil className="size-3" aria-hidden />
                          تحرير
                        </Link>
                        <Link
                          href={publicPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
                          onClick={onNavigate}
                        >
                          <ExternalLink className="size-3" aria-hidden />
                          عرض عام
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <p className="px-0.5 text-[10px] leading-relaxed text-muted-foreground">
            القائمة الكاملة في صفحة «المدونة». افتح القائمة هنا عند الحاجة.
          </p>
        )}
      </div>

      <Separator />

      <div className="flex flex-col gap-1">
        <Link
          href="/portfolio"
          className="flex min-h-11 touch-manipulation items-center rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground md:min-h-0 md:px-2 md:py-1.5"
          onClick={onNavigate}
        >
          عرض مثال
        </Link>
        {isOwner ? (
          <Link
            href="/"
            className="flex min-h-11 touch-manipulation items-center rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground md:min-h-0 md:px-2 md:py-1.5"
            onClick={onNavigate}
          >
            الصفحة الرئيسية
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function AdminDashboardShell({
  isOwner,
  publicBlogUrl,
  blogPosts,
  children,
}: {
  isOwner: boolean;
  publicBlogUrl: string;
  blogPosts: DashboardSidebarPost[];
  children: ReactNode;
}) {
  const [headerActions, setHeaderActions] = useState<ReactNode>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const setHeaderActionsStable = useCallback<SetHeaderActions>((node) => {
    setHeaderActions(node);
  }, []);

  const contextValue = useMemo(
    () => setHeaderActionsStable,
    [setHeaderActionsStable],
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((o) => !o), []);

  return (
    <AdminHeaderActionsContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background">
        {/* Mobile overlay */}
        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 touch-none bg-black/50 backdrop-blur-[2px] print:hidden md:hidden"
            aria-label="إغلاق القائمة"
            onClick={closeMobile}
          />
        ) : null}

        {/* Sidebar — desktop */}
        <aside className="fixed inset-y-0 start-0 z-50 hidden w-72 flex-col border-e border-border bg-muted/20 print:hidden md:flex">
          <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
            <span className="text-sm font-semibold tracking-tight">لوحة التحكم</span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <SidebarContent
                isOwner={isOwner}
                publicBlogUrl={publicBlogUrl}
                blogPosts={blogPosts}
                pathname={pathname}
              />
            </div>
            <div className="shrink-0 border-t border-border/60 p-4">
              <LogoutButton className="w-full justify-start" />
            </div>
          </div>
        </aside>

        {/* Drawer — mobile */}
        <aside
          id="dashboard-mobile-drawer"
          aria-hidden={!mobileOpen}
          aria-modal={mobileOpen}
          role="dialog"
          className={cn(
            "fixed inset-y-0 start-0 z-50 flex w-[min(22rem,calc(100vw-0.75rem))] max-w-[min(92vw,22rem)] flex-col border-e border-border bg-background shadow-2xl print:hidden transition-transform duration-200 ease-out motion-reduce:transition-none md:hidden md:shadow-none",
            mobileOpen
              ? "translate-x-0"
              : "pointer-events-none -translate-x-full rtl:translate-x-full",
          )}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3 pt-[env(safe-area-inset-top,0px)]">
            <span className="text-sm font-semibold">لوحة التحكم</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0 touch-manipulation"
              onClick={closeMobile}
              aria-label="إغلاق"
            >
              <X className="size-5" />
            </Button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4 pb-3">
              <SidebarContent
                isOwner={isOwner}
                publicBlogUrl={publicBlogUrl}
                blogPosts={blogPosts}
                pathname={pathname}
                onNavigate={closeMobile}
              />
            </div>
            <div className="shrink-0 border-t border-border/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
              <LogoutButton className="w-full justify-start" />
            </div>
          </div>
        </aside>

        <div className="md:ps-72 print:ps-0">
          <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background/95 px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top,0px))] backdrop-blur supports-[backdrop-filter]:bg-background/80 print:hidden sm:gap-3 sm:px-4 sm:py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0 touch-manipulation md:hidden"
                onClick={toggleMobile}
                aria-expanded={mobileOpen}
                aria-controls="dashboard-mobile-drawer"
                aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
              >
                <Menu className="size-5" />
              </Button>
              <span className="min-w-0 truncate text-sm font-medium text-muted-foreground md:hidden">
                لوحة التحكم
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">{headerActions}</div>
          </header>
          <main className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-7 md:px-6 md:py-10">{children}</main>
        </div>
      </div>
    </AdminHeaderActionsContext.Provider>
  );
}
