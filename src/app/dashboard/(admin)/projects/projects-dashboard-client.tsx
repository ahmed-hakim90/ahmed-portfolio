"use client";

import { Button } from "@/components/ui/button";
import type { SiteJson } from "@/data/site-defaults";
import { useCallback, useEffect, useState } from "react";

const EMPTY_LINK: SiteJson["projects"][number]["links"][number] = {
  type: "Website",
  href: "",
  icon: "globe",
};

const EMPTY_PROJECT: SiteJson["projects"][number] = {
  title: "",
  href: "",
  dates: "",
  active: true,
  description: "",
  technologies: [],
  links: [{ ...EMPTY_LINK }],
  image: "",
  video: "",
};

function fieldClass() {
  return "w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs";
}

export function ProjectsDashboardClient() {
  const [site, setSite] = useState<SiteJson | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setMessage(null);
    try {
      const res = await fetch("/api/admin/site", { cache: "no-store" });
      if (!res.ok) {
        setMessage("تعذر تحميل الموقع");
        return;
      }
      const data = (await res.json()) as SiteJson;
      setSite(data);
    } catch {
      setMessage("تعذر تحميل الموقع");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!site) return;
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage((data as { error?: string }).error ?? "فشل الحفظ");
        return;
      }
      setMessage("تم الحفظ.");
    } catch {
      setMessage("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  function move(index: number, dir: -1 | 1) {
    if (!site) return;
    const next = [...site.projects];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setSite({ ...site, projects: next });
  }

  if (loading || !site) {
    return (
      <p className="text-sm text-muted-foreground">
        {loading ? "جاري التحميل…" : "لا توجد بيانات"}
      </p>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">المشاريع</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تعديل بطاقات المشاريع الظاهرة في الموقع العامة. احفظ التغييرات في
            النهاية.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setSite({
                ...site,
                projects: [...site.projects, { ...EMPTY_PROJECT }],
              })
            }
          >
            + مشروع
          </Button>
          <Button type="button" size="sm" onClick={() => void save()} disabled={saving}>
            {saving ? "جاري الحفظ…" : "حفظ"}
          </Button>
        </div>
      </div>

      {message ? (
        <p
          className={
            message.startsWith("تم")
              ? "text-sm text-emerald-600 dark:text-emerald-400"
              : "text-sm text-destructive"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}

      <div className="space-y-6">
        {site.projects.map((project, i) => (
          <div
            key={i}
            className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                مشروع {i + 1}
              </span>
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={i === site.projects.length - 1}
                  onClick={() => move(i, 1)}
                >
                  ↓
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setSite({
                      ...site,
                      projects: site.projects.filter((_, j) => j !== i),
                    })
                  }
                >
                  حذف
                </Button>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs text-muted-foreground">
                العنوان
                <input
                  className={fieldClass()}
                  value={project.title}
                  onChange={(e) => {
                    const projects = [...site.projects];
                    projects[i] = { ...projects[i], title: e.target.value };
                    setSite({ ...site, projects });
                  }}
                />
              </label>
              <label className="text-xs text-muted-foreground">
                الرابط
                <input
                  className={fieldClass()}
                  value={project.href}
                  onChange={(e) => {
                    const projects = [...site.projects];
                    projects[i] = { ...projects[i], href: e.target.value };
                    setSite({ ...site, projects });
                  }}
                />
              </label>
              <label className="text-xs text-muted-foreground">
                التواريخ
                <input
                  className={fieldClass()}
                  value={project.dates ?? ""}
                  onChange={(e) => {
                    const projects = [...site.projects];
                    projects[i] = { ...projects[i], dates: e.target.value };
                    setSite({ ...site, projects });
                  }}
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={project.active}
                  onChange={(e) => {
                    const projects = [...site.projects];
                    projects[i] = { ...projects[i], active: e.target.checked };
                    setSite({ ...site, projects });
                  }}
                />
                نشط
              </label>
              <label className="sm:col-span-2 text-xs text-muted-foreground">
                الوصف
                <textarea
                  className={`${fieldClass()} min-h-[72px]`}
                  value={project.description}
                  onChange={(e) => {
                    const projects = [...site.projects];
                    projects[i] = { ...projects[i], description: e.target.value };
                    setSite({ ...site, projects });
                  }}
                />
              </label>
              <label className="text-xs text-muted-foreground">
                التقنيات (مفصولة بفاصلة)
                <input
                  className={fieldClass()}
                  value={project.technologies.join(", ")}
                  onChange={(e) => {
                    const technologies = e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    const projects = [...site.projects];
                    projects[i] = { ...projects[i], technologies };
                    setSite({ ...site, projects });
                  }}
                />
              </label>
              <label className="text-xs text-muted-foreground">
                صورة (مسار)
                <input
                  className={fieldClass()}
                  value={project.image}
                  onChange={(e) => {
                    const projects = [...site.projects];
                    projects[i] = { ...projects[i], image: e.target.value };
                    setSite({ ...site, projects });
                  }}
                />
              </label>
              <label className="text-xs text-muted-foreground">
                فيديو (اختياري)
                <input
                  className={fieldClass()}
                  value={project.video}
                  onChange={(e) => {
                    const projects = [...site.projects];
                    projects[i] = { ...projects[i], video: e.target.value };
                    setSite({ ...site, projects });
                  }}
                />
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">روابط</p>
              {project.links.map((link, li) => (
                <div
                  key={li}
                  className="grid gap-2 border-t border-border pt-2 sm:grid-cols-3"
                >
                  <input
                    className={fieldClass()}
                    placeholder="النوع"
                    value={link.type}
                    onChange={(e) => {
                      const projects = [...site.projects];
                      const links = [...projects[i].links];
                      links[li] = { ...links[li], type: e.target.value };
                      projects[i] = { ...projects[i], links };
                      setSite({ ...site, projects });
                    }}
                  />
                  <input
                    className={fieldClass()}
                    placeholder="URL"
                    value={link.href}
                    onChange={(e) => {
                      const projects = [...site.projects];
                      const links = [...projects[i].links];
                      links[li] = { ...links[li], href: e.target.value };
                      projects[i] = { ...projects[i], links };
                      setSite({ ...site, projects });
                    }}
                  />
                  <div className="flex gap-1">
                    <select
                      className={fieldClass()}
                      value={link.icon}
                      onChange={(e) => {
                        const projects = [...site.projects];
                        const links = [...projects[i].links];
                        links[li] = {
                          ...links[li],
                          icon: e.target.value as "globe" | "github",
                        };
                        projects[i] = { ...projects[i], links };
                        setSite({ ...site, projects });
                      }}
                    >
                      <option value="globe">globe</option>
                      <option value="github">github</option>
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const projects = [...site.projects];
                        const links = projects[i].links.filter((_, j) => j !== li);
                        projects[i] = { ...projects[i], links };
                        setSite({ ...site, projects });
                      }}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const projects = [...site.projects];
                  projects[i] = {
                    ...projects[i],
                    links: [...projects[i].links, { ...EMPTY_LINK }],
                  };
                  setSite({ ...site, projects });
                }}
              >
                + رابط
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" onClick={() => void save()} disabled={saving}>
        {saving ? "جاري الحفظ…" : "حفظ كل المشاريع"}
      </Button>
    </div>
  );
}
