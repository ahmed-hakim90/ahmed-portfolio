"use client";

import { LogoutButton } from "@/components/dashboard/logout-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ExternalLink,
  Eye,
  FileText,
  LayoutDashboard,
  Menu,
  Pencil,
  Plus,
  Users,
  X,
} from "lucide-react";
import { scrollToSiteEditorSection } from "@/lib/site-editor-scroll";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

/** Anchor targets on `/dashboard/site` — keep in sync with section `id`s on that page. */
const SITE_EDITOR_GROUPS: {
  title: string;
  items: { hash: string; label: string }[];
}[] = [
  {
    title: "الرابط والإعدادات",
    items: [
      { hash: "site-public-link", label: "الرابط العام" },
      { hash: "site-visibility", label: "الظهور والتبويبات" },
    ],
  },
  {
    title: "البطاقة والتواصل",
    items: [
      { hash: "site-profile", label: "الملف والبطاقة" },
      { hash: "site-skills", label: "المهارات" },
      { hash: "site-contact", label: "بيانات التواصل" },
      { hash: "site-social", label: "الشبكات الاجتماعية" },
      { hash: "site-get-in-touch", label: "قسم التواصل" },
    ],
  },
  {
    title: "السيرة والمشاريع",
    items: [
      { hash: "site-about-me", label: "نبذة عني" },
      { hash: "site-custom-sections", label: "أقسام إضافية" },
      { hash: "site-education", label: "التعليم" },
      { hash: "site-work", label: "الخبرة العملية" },
      { hash: "site-projects", label: "المشاريع" },
    ],
  },
];

const SITE_PREVIEW_ANCHOR = { hash: "site-preview", label: "المعاينة" } as const;

function anchorLinkClass(active: boolean) {
  return cn(
    "flex rounded-md px-2 py-1.5 text-xs transition-colors",
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

  useEffect(() => {
    const sync = () => setRouteHash(window.location.hash.replace(/^#/, ""));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
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
              <div className="mt-2 space-y-1 border-s border-border ps-2 ms-2">
                {SITE_EDITOR_GROUPS.map((group) => (
                  <details
                    key={group.title}
                    className="group rounded-md border border-border/60 bg-muted/25"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-2 py-1.5 text-[11px] font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
                      <span>{group.title}</span>
                      <ChevronDown
                        className="size-3.5 shrink-0 opacity-70 transition-transform duration-200 group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <ul className="flex flex-col gap-px pb-2 pe-1 ps-1">
                      {group.items.map(({ hash, label }) => {
                        const active = routeHash === hash;
                        return (
                          <li key={hash}>
                            <Link
                              href={`/dashboard/site#${hash}`}
                              className={anchorLinkClass(active)}
                              onClick={(e) => {
                                e.preventDefault();
                                setRouteHash(hash);
                                onNavigate?.();
                                window.requestAnimationFrame(() => {
                                  scrollToSiteEditorSection(hash);
                                });
                              }}
                            >
                              {label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                ))}
                <Link
                  href={`/dashboard/site#${SITE_PREVIEW_ANCHOR.hash}`}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                    routeHash === SITE_PREVIEW_ANCHOR.hash
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    setRouteHash(SITE_PREVIEW_ANCHOR.hash);
                    onNavigate?.();
                    window.requestAnimationFrame(() => {
                      scrollToSiteEditorSection(SITE_PREVIEW_ANCHOR.hash);
                    });
                  }}
                >
                  <Eye className="size-3.5 shrink-0 opacity-70" aria-hidden />
                  {SITE_PREVIEW_ANCHOR.label}
                </Link>
              </div>
            ) : null}
          </div>
          <Link href="/dashboard/blog" className={linkClass("/dashboard/blog")} onClick={onNavigate}>
            <FileText className="size-4 shrink-0 opacity-70" aria-hidden />
            المدونة
          </Link>
          {isOwner ? (
            <Link href="/dashboard/users" className={linkClass("/dashboard/users")} onClick={onNavigate}>
              <Users className="size-4 shrink-0 opacity-70" aria-hidden />
              المستخدمون
            </Link>
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
        <div className="max-h-[min(280px,38vh)] overflow-y-auto rounded-md border border-border bg-background/80">
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
      </div>

      <Separator />

      <div className="flex flex-col gap-1">
        <Link
          href="/portfolio"
          className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onNavigate}
        >
          عرض المحفظة
        </Link>
        {isOwner ? (
          <Link
            href="/"
            className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
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

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <AdminHeaderActionsContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background">
        {/* Mobile overlay */}
        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 print:hidden md:hidden"
            aria-label="إغلاق القائمة"
            onClick={closeMobile}
          />
        ) : null}

        {/* Sidebar — desktop */}
        <aside className="fixed inset-y-0 start-0 z-50 hidden w-72 flex-col border-e border-border bg-muted/20 print:hidden md:flex">
          <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
            <span className="text-sm font-semibold tracking-tight">لوحة التحكم</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <SidebarContent
              isOwner={isOwner}
              publicBlogUrl={publicBlogUrl}
              blogPosts={blogPosts}
              pathname={pathname}
            />
          </div>
        </aside>

        {/* Drawer — mobile */}
        <aside
          aria-hidden={!mobileOpen}
          className={cn(
            "fixed inset-y-0 start-0 z-50 flex w-[min(100%,20rem)] max-w-[85vw] flex-col border-e border-border bg-background print:hidden transition-transform duration-200 md:hidden",
            mobileOpen
              ? "translate-x-0"
              : "pointer-events-none ltr:-translate-x-full rtl:translate-x-full",
          )}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3">
            <span className="text-sm font-semibold">لوحة التحكم</span>
            <Button type="button" variant="ghost" size="icon" onClick={closeMobile} aria-label="إغلاق">
              <X className="size-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <SidebarContent
              isOwner={isOwner}
              publicBlogUrl={publicBlogUrl}
              blogPosts={blogPosts}
              pathname={pathname}
              onNavigate={closeMobile}
            />
          </div>
        </aside>

        <div className="md:ps-72 print:ps-0">
          <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 print:hidden">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="فتح القائمة"
              >
                <Menu className="size-5" />
              </Button>
              <span className="truncate text-sm text-muted-foreground md:hidden">لوحة التحكم</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {headerActions}
              <LogoutButton />
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">{children}</main>
        </div>
      </div>
    </AdminHeaderActionsContext.Provider>
  );
}
