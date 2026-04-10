"use client";

import { DriveUrlField } from "@/components/dashboard/drive-url-field";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_SITE_JSON,
  type CustomPortfolioSection,
  type ProjectLinkIconKey,
  type SiteJson,
  type SiteTestimonial,
  type SocialIconKey,
} from "@/data/site-defaults";
import { buildWaMeUrl, parseWaMeDigitsFromUrl } from "@/lib/whatsapp-wa-me";
import {
  collectProjectSlugConflicts,
  isValidProjectSlug,
  normalizeProjectSlug,
} from "@/lib/project-keys";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type PortfolioSectionKey = keyof typeof DEFAULT_SITE_JSON.publicControls.portfolioSections;

function mergedPortfolioSections(data: SiteJson) {
  return {
    ...DEFAULT_SITE_JSON.publicControls.portfolioSections,
    ...data.publicControls?.portfolioSections,
  };
}

function setPortfolioSectionVisibility(
  apply: (fn: (j: SiteJson) => void) => void,
  sectionKey: PortfolioSectionKey,
  v: boolean,
) {
  apply((j) => {
    j.publicControls = {
      ...DEFAULT_SITE_JSON.publicControls,
      ...j.publicControls,
      portfolioSections: {
        ...DEFAULT_SITE_JSON.publicControls.portfolioSections,
        ...j.publicControls?.portfolioSections,
        [sectionKey]: v,
      },
    };
  });
}

function SectionVisibilityToggle({
  sectionKey,
  label,
  data,
  apply,
}: {
  sectionKey: PortfolioSectionKey;
  label: string;
  data: SiteJson;
  apply: (fn: (j: SiteJson) => void) => void;
}) {
  const merged = mergedPortfolioSections(data);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background/80 px-3 py-2 sm:col-span-2">
      <span className="text-xs font-medium leading-snug text-muted-foreground">
        {label}
      </span>
      <Switch
        id={`pv-${sectionKey}`}
        checked={merged[sectionKey]}
        onCheckedChange={(v) =>
          setPortfolioSectionVisibility(apply, sectionKey, v)
        }
      />
    </div>
  );
}

function SectionHeaderWithVisibility({
  title,
  description,
  sectionKey,
  toggleLabel = "إظهار في الموقع",
  data,
  apply,
}: {
  title: string;
  description?: string;
  sectionKey: PortfolioSectionKey;
  toggleLabel?: string;
  data: SiteJson;
  apply: (fn: (j: SiteJson) => void) => void;
}) {
  const merged = mergedPortfolioSections(data);
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5">
        <span className="text-[11px] text-muted-foreground">{toggleLabel}</span>
        <Switch
          id={`pv-head-${sectionKey}`}
          checked={merged[sectionKey]}
          onCheckedChange={(v) =>
            setPortfolioSectionVisibility(apply, sectionKey, v)
          }
        />
      </label>
    </div>
  );
}

const ICON_OPTIONS: ProjectLinkIconKey[] = ["globe", "github"];
const SOCIAL_ICON_OPTIONS: SocialIconKey[] = [
  "github",
  "linkedin",
  "x",
  "youtube",
  "email",
  "whatsapp",
];
const EMPTY_WORK: SiteJson["work"][number] = { company: "", href: "", badges: [], location: "", title: "", logoUrl: "", start: "", end: "", description: "" };
const EMPTY_PROJECT: SiteJson["projects"][number] = {
  title: "",
  href: "",
  dates: "",
  active: true,
  description: "",
  technologies: [],
  links: [],
  image: "",
  video: "",
};
const EMPTY_LINK: SiteJson["projects"][number]["links"][number] = { type: "Website", href: "", icon: "globe" };
const EMPTY_EDUCATION: SiteJson["education"][number] = { school: "", href: "", degree: "", logoUrl: "", start: "", end: "" };
const EMPTY_TESTIMONIAL: SiteTestimonial = {
  name: "",
  role: "",
  company: "",
  text: "",
  avatar: "",
};

function fieldClass() {
  return "w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs";
}

function ProjectTechnologiesInput({
  technologies,
  onChange,
}: {
  technologies: string[];
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const commitTokens = (tokens: string[]) => {
    const next = [...technologies];
    for (const p of tokens) {
      if (!p) continue;
      if (!next.some((t) => t.toLowerCase() === p.toLowerCase())) next.push(p);
    }
    onChange(next);
  };
  const addFromInput = () => {
    const raw = input.trim();
    if (!raw) return;
    const parts = raw.split(/[,;،]/).map((s) => s.trim()).filter(Boolean);
    commitTokens(parts);
    setInput("");
  };
  return (
    <div className="space-y-2 sm:col-span-2">
      <label className="text-xs text-muted-foreground">Technologies</label>
      <p className="text-[10px] text-muted-foreground">اكتب تقنية ثم Enter أو فاصلة؛ يمكن لصق قائمة مفصولة بفواصل.</p>
      <input
        className={fieldClass()}
        value={input}
        placeholder="مثال: React"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addFromInput();
          }
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          if (/[,;،]/.test(text)) {
            e.preventDefault();
            const parts = text.split(/[,;،]/).map((s) => s.trim()).filter(Boolean);
            commitTokens(parts);
            setInput("");
          }
        }}
      />
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech, ti) => (
          <span
            key={`${tech}-${ti}`}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-xs"
          >
            {tech}
            <button
              type="button"
              className="text-muted-foreground hover:text-destructive"
              aria-label={`إزالة ${tech}`}
              onClick={() => onChange(technologies.filter((_, i) => i !== ti))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function newCustomSectionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `custom-${Date.now()}`;
}

function ProjectSlugHint({
  slug,
  projects,
  index,
}: {
  slug: string | undefined;
  projects: SiteJson["projects"];
  index: number;
}) {
  const raw = (slug ?? "").trim();
  const dupSet = useMemo(
    () => collectProjectSlugConflicts(projects),
    [projects],
  );
  if (!raw) {
    return (
      <p className="text-[10px] text-muted-foreground">
        Optional. Enables a page at …/project/your-slug (lowercase, hyphens).
      </p>
    );
  }
  if (!isValidProjectSlug(raw)) {
    return (
      <p className="text-[10px] text-destructive">
        Slug must be lowercase letters, digits, and hyphens only (no spaces).
      </p>
    );
  }
  const otherSame = projects.some(
    (p, i) => i !== index && p.slug?.trim() === raw,
  );
  if (dupSet.has(raw) || otherSame) {
    return (
      <p className="text-[10px] text-destructive">
        This slug is used by more than one project. Each slug must be unique.
      </p>
    );
  }
  return <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Slug is valid.</p>;
}

export type SiteEditorMode = "all" | "profile" | "career" | "hero" | "contact-skills" | "experience" | "projects-more";

type Props = {
  data: SiteJson;
  onChange: (next: SiteJson) => void;
  /** When not `all`, only the matching block is rendered (for tabbed site editor). */
  editorMode?: SiteEditorMode;
};

export function SiteWorkProjectsEditor({
  data,
  onChange,
  editorMode = "all",
}: Props) {
  const [skillInput, setSkillInput] = useState("");
  const apply = (fn: (j: SiteJson) => void) => {
    const next = structuredClone(data);
    fn(next);
    onChange(next);
  };
  const showHero = editorMode === "all" || editorMode === "profile" || editorMode === "hero";
  const showContactSkills = editorMode === "all" || editorMode === "profile" || editorMode === "contact-skills";
  const showExperience = editorMode === "all" || editorMode === "career" || editorMode === "experience";
  const showProjectsMore = editorMode === "all" || editorMode === "career" || editorMode === "projects-more";
  const addSkillFromInput = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (data.skills.some((s) => s.toLowerCase() === value.toLowerCase())) { setSkillInput(""); return; }
    apply((j) => { j.skills.push(value); });
    setSkillInput("");
  };

  return (
    <div className="space-y-6 rounded-lg border border-border bg-muted/30 p-4">
      {showHero ? (
      <>
      <div id="site-profile" className="scroll-mt-28 space-y-4">
        <SectionHeaderWithVisibility
          title="الملف والبطاقة"
          description="الهيرو: الاسم، المقدمة، الصورة، الترحيب، شارة التوفر."
          sectionKey="hero"
          toggleLabel="إظهار الهيرو"
          data={data}
          apply={apply}
        />
        <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1"><label className="text-xs text-muted-foreground">Name</label><input className={fieldClass()} value={data.name} onChange={(e) => apply((j) => { j.name = e.target.value; })} /></div>
        <div className="space-y-1"><label className="text-xs text-muted-foreground">Initials</label><input className={fieldClass()} value={data.initials} onChange={(e) => apply((j) => { j.initials = e.target.value; })} /></div>
        <div className="space-y-1 sm:col-span-2"><label className="text-xs text-muted-foreground">Headline</label><input className={fieldClass()} value={data.description} onChange={(e) => apply((j) => { j.description = e.target.value; })} /></div>
        <div className="space-y-1 sm:col-span-2 rounded-md border border-border/60 bg-background/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">سطر الترحيب (فوق العنوان الفرعي)</p>
          <p className="mb-2 text-[10px] text-muted-foreground">
            يُعرض كـ: <span className="font-mono">[الترحيب] الاسم الأول [إيموجي]</span> — اترك الإيموجي فارغاً لإخفائه.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Hero greeting (قبل الاسم)</label>
              <input
                className={fieldClass()}
                value={data.heroGreetingLead ?? ""}
                placeholder={"Hi, I'm"}
                onChange={(e) =>
                  apply((j) => {
                    j.heroGreetingLead = e.target.value;
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Emoji / نص بعد الاسم</label>
              <input
                className={fieldClass()}
                value={data.heroGreetingEmoji ?? ""}
                placeholder="👋"
                onChange={(e) =>
                  apply((j) => {
                    j.heroGreetingEmoji = e.target.value;
                  })
                }
              />
            </div>
          </div>
        </div>
        <div className="space-y-1 sm:col-span-2 rounded-md border border-border/60 bg-background/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">شارة التوفر (أعلى الهيرو)</p>
          <p className="mb-2 text-[10px] text-muted-foreground">
            تشغيل/إيقاف الشارة من{" "}
            <span className="font-medium">الإعدادات → الظهور والتبويبات</span>. هنا تكتب
            نص الحالة كما يظهر للزوار.
          </p>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="available-for-work-badge">
              نص الشارة
            </label>
            <input
              id="available-for-work-badge"
              className={fieldClass()}
              value={data.availableForWorkBadgeText ?? ""}
              placeholder="متاح لمشاريع فريلانس"
              onChange={(e) =>
                apply((j) => {
                  j.availableForWorkBadgeText = e.target.value;
                })
              }
            />
          </div>
        </div>
        {/* <div className="space-y-1"><label className="text-xs text-muted-foreground">Portfolio URL</label><input className={fieldClass()} value={data.url} onChange={(e) => apply((j) => { j.url = e.target.value; })} /></div> */}
        <DriveUrlField id="profile-avatar" label="Avatar URL" value={data.avatarUrl} onChange={(v) => apply((j) => { j.avatarUrl = v; })} uploadKind="avatar" />
        <div className="space-y-1"><label className="text-xs text-muted-foreground">Location</label><input className={fieldClass()} value={data.location} onChange={(e) => apply((j) => { j.location = e.target.value; })} /></div>
        <div className="space-y-1"><label className="text-xs text-muted-foreground">Location Link</label><input className={fieldClass()} value={data.locationLink} onChange={(e) => apply((j) => { j.locationLink = e.target.value; })} /></div>
        <SectionVisibilityToggle
          sectionKey="about"
          label="إظهار قسم About (النبذة) في الصفحة العامة"
          data={data}
          apply={apply}
        />
        <div className="space-y-1 sm:col-span-2"><label className="text-xs text-muted-foreground">Summary</label><textarea className={cn(fieldClass(), "min-h-[100px] resize-y")} value={data.summary} onChange={(e) => apply((j) => { j.summary = e.target.value; })} /></div>
        </div>
      </div>
      </>
      ) : null}

      {showContactSkills ? (
      <>
      <div id="site-skills" className={cn("scroll-mt-28 space-y-4 pt-4", showHero && "border-t border-border")}>
        <SectionHeaderWithVisibility
          title="المهارات"
          description="اكتب مهارة ثم اضغط Enter."
          sectionKey="skills"
          toggleLabel="إظهار القسم"
          data={data}
          apply={apply}
        />
        <div className="space-y-2">
          <input className={fieldClass()} value={skillInput} placeholder="Type skill and press Enter" onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkillFromInput(); } }} />
          <div className="flex flex-wrap gap-2">{data.skills.map((skill, i) => <span key={`${skill}-${i}`} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-xs">{skill}<button type="button" className="text-muted-foreground hover:text-destructive" onClick={() => apply((j) => { j.skills.splice(i, 1); })} aria-label={`Remove ${skill}`}>×</button></span>)}</div>
        </div>
      </div>

      <div id="site-contact" className="scroll-mt-28 border-t border-border pt-4"><h2 className="text-sm font-semibold tracking-tight">بيانات التواصل</h2></div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1"><label className="text-xs text-muted-foreground">Email</label><input className={fieldClass()} value={data.contact.email} onChange={(e) => apply((j) => { j.contact.email = e.target.value; })} /></div>
        <div className="space-y-1"><label className="text-xs text-muted-foreground">Phone</label><input className={fieldClass()} value={data.contact.tel} onChange={(e) => apply((j) => { j.contact.tel = e.target.value; })} /></div>
      </div>

      <div id="site-social" className="scroll-mt-28 border-t border-border pt-4">
        <h2 className="text-sm font-semibold tracking-tight">الشبكات الاجتماعية (الشريط السفلي)</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          عدّل الروابط هنا؛ <span className="font-medium">Show in dock</span> يحدد ظهور الأيقونة في الشريط السفلي.
          للإيميل استخدم رابط مثل{" "}
          <code className="rounded bg-muted px-1 text-[10px]">mailto:you@example.com</code>.
        </p>
      </div>
      <div className="space-y-3">
        {Object.entries(data.contact.social).map(([key, entry]) => (
          <div
            key={key}
            className="space-y-2 rounded-md border border-border bg-background p-3"
          >
            <p className="text-xs font-medium text-muted-foreground">{key}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">Label</label>
                <input
                  className={fieldClass()}
                  value={entry.name}
                  onChange={(e) =>
                    apply((j) => {
                      const s = j.contact.social[key];
                      if (s) s.name = e.target.value;
                    })
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">
                  {key === "WhatsApp" ? "رقم واتساب" : "URL"}
                </label>
                {key === "WhatsApp" ? (
                  <input
                    className={fieldClass()}
                    dir="ltr"
                    inputMode="tel"
                    autoComplete="tel"
                    value={parseWaMeDigitsFromUrl(entry.url)}
                    onChange={(e) =>
                      apply((j) => {
                        const s = j.contact.social[key];
                        if (s) s.url = buildWaMeUrl(e.target.value);
                      })
                    }
                  />
                ) : (
                  <input
                    className={fieldClass()}
                    value={entry.url}
                    onChange={(e) =>
                      apply((j) => {
                        const s = j.contact.social[key];
                        if (s) s.url = e.target.value;
                      })
                    }
                  />
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Icon</label>
                <select
                  className={fieldClass()}
                  value={entry.icon}
                  onChange={(e) =>
                    apply((j) => {
                      const s = j.contact.social[key];
                      if (s) s.icon = e.target.value as SocialIconKey;
                    })
                  }
                >
                  {SOCIAL_ICON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 self-end text-xs text-muted-foreground sm:col-span-2">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={entry.navbar}
                  onChange={(e) =>
                    apply((j) => {
                      const s = j.contact.social[key];
                      if (s) s.navbar = e.target.checked;
                    })
                  }
                />
                Show in dock
              </label>
            </div>
          </div>
        ))}
      </div>

      <div id="site-get-in-touch" className="scroll-mt-28 space-y-4 border-t border-border pt-4">
        <SectionHeaderWithVisibility
          title="قسم التواصل"
          description='اختياري. إذا تركت "Body" فارغة، يظهر النص الإنجليزي الافتراضي مع رابط LinkedIn حسب الإعدادات.'
          sectionKey="contact"
          toggleLabel="إظهار القسم"
          data={data}
          apply={apply}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Badge</label>
          <input
            className={fieldClass()}
            placeholder="Contact"
            value={data.contactSection?.badge ?? ""}
            onChange={(e) =>
              apply((j) => {
                const v = e.target.value.trim();
                j.contactSection = { ...j.contactSection, badge: v || undefined };
              })
            }
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Heading</label>
          <input
            className={fieldClass()}
            placeholder="Get in Touch"
            value={data.contactSection?.heading ?? ""}
            onChange={(e) =>
              apply((j) => {
                const v = e.target.value.trim();
                j.contactSection = { ...j.contactSection, heading: v || undefined };
              })
            }
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs text-muted-foreground">Body (Markdown)</label>
          <textarea
            className={cn(fieldClass(), "min-h-[120px] resize-y")}
            placeholder="مثال: تواصل معي عبر [لينكدإن](https://linkedin.com/in/…)"
            value={data.contactSection?.bodyMarkdown ?? ""}
            onChange={(e) =>
              apply((j) => {
                const v = e.target.value;
                j.contactSection = {
                  ...j.contactSection,
                  bodyMarkdown: v.trim() ? v : undefined,
                };
              })
            }
            spellCheck={false}
          />
        </div>
      </div>
      </>
      ) : null}

      {showProjectsMore ? (
      <>
      <div id="site-about-me" className={cn("scroll-mt-28 space-y-4 pt-4", showContactSkills && "border-t border-border")}>
        <SectionHeaderWithVisibility
          title="نبذة عني (مميزة)"
          description="قبل التواصل في الصفحة العامة. اترك الحقول فارغة لاستخدام النص الإنجليزي الافتراضي."
          sectionKey="aboutMe"
          toggleLabel="إظهار القسم"
          data={data}
          apply={apply}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Badge</label>
          <input
            className={fieldClass()}
            placeholder="About Me"
            value={data.aboutMeSection?.badge ?? ""}
            onChange={(e) =>
              apply((j) => {
                const v = e.target.value.trim();
                j.aboutMeSection = { ...j.aboutMeSection, badge: v || undefined };
              })
            }
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Heading</label>
          <input
            className={fieldClass()}
            placeholder="I like building things"
            value={data.aboutMeSection?.heading ?? ""}
            onChange={(e) =>
              apply((j) => {
                const v = e.target.value.trim();
                j.aboutMeSection = { ...j.aboutMeSection, heading: v || undefined };
              })
            }
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs text-muted-foreground">Body (Markdown)</label>
          <textarea
            className={cn(fieldClass(), "min-h-[120px] resize-y")}
            placeholder="فقرة عنك… يدعم **Markdown** والروابط."
            value={data.aboutMeSection?.bodyMarkdown ?? ""}
            onChange={(e) =>
              apply((j) => {
                const v = e.target.value;
                j.aboutMeSection = {
                  ...j.aboutMeSection,
                  bodyMarkdown: v.trim() ? v : undefined,
                };
              })
            }
            spellCheck={false}
          />
        </div>
      </div>

      <div id="site-custom-sections" className="scroll-mt-28 border-t border-border pt-4">
        <h2 className="text-sm font-semibold tracking-tight">أقسام إضافية</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          نفس تصميم About Me؛ تظهر بعد About Me وقبل Contact. احذف الصف لإزالة القسم.
        </p>
      </div>
      <div className="space-y-3">
        {(data.customSections ?? []).map((block, idx) => (
          <div
            key={block.id}
            className="space-y-2 rounded-md border border-border bg-background p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                قسم #{idx + 1}{" "}
                <code className="text-[10px] text-muted-foreground/80">#{block.id.slice(0, 8)}</code>
              </span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-7 text-xs"
                onClick={() =>
                  apply((j) => {
                    j.customSections = (j.customSections ?? []).filter(
                      (b) => b.id !== block.id,
                    );
                    if (j.customSections?.length === 0) j.customSections = undefined;
                  })
                }
              >
                حذف
              </Button>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={block.enabled !== false}
                onChange={(e) =>
                  apply((j) => {
                    const list = j.customSections ?? [];
                    const row = list.find((b) => b.id === block.id);
                    if (row) row.enabled = e.target.checked;
                  })
                }
              />
              مفعّل
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Badge</label>
                <input
                  className={fieldClass()}
                  value={block.badge ?? ""}
                  onChange={(e) =>
                    apply((j) => {
                      const list = j.customSections ?? [];
                      const row = list.find((b) => b.id === block.id);
                      if (row) {
                        const v = e.target.value.trim();
                        row.badge = v || undefined;
                      }
                    })
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">Heading</label>
                <input
                  className={fieldClass()}
                  value={block.heading}
                  onChange={(e) =>
                    apply((j) => {
                      const list = j.customSections ?? [];
                      const row = list.find((b) => b.id === block.id);
                      if (row) row.heading = e.target.value;
                    })
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">Body (Markdown)</label>
                <textarea
                  className={cn(fieldClass(), "min-h-[100px] resize-y")}
                  value={block.bodyMarkdown}
                  onChange={(e) =>
                    apply((j) => {
                      const list = j.customSections ?? [];
                      const row = list.find((b) => b.id === block.id);
                      if (row) row.bodyMarkdown = e.target.value;
                    })
                  }
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() =>
            apply((j) => {
              const next: CustomPortfolioSection = {
                id: newCustomSectionId(),
                heading: "عنوان القسم",
                bodyMarkdown: "محتوى بـ **Markdown**.",
                enabled: true,
              };
              j.customSections = [...(j.customSections ?? []), next];
            })
          }
        >
          إضافة قسم
        </Button>
      </div>
      </>
      ) : null}

      {showExperience ? (
      <>
      <div id="site-education" className={cn("scroll-mt-28 space-y-4 pt-4", showProjectsMore && "border-t border-border")}>
        <SectionHeaderWithVisibility
          title="التعليم"
          sectionKey="education"
          toggleLabel="إظهار القسم"
          data={data}
          apply={apply}
        />
      </div>
      <div className="space-y-4">{data.education.map((ed, i) => <div key={`edu-${i}`} className="space-y-2 rounded-md border border-border bg-background p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-medium text-muted-foreground">Education #{i + 1}</span><Button type="button" variant="destructive" size="sm" className="h-7 text-xs" onClick={() => apply((j) => { j.education.splice(i, 1); })}>Remove</Button></div><div className="grid gap-2 sm:grid-cols-2"><div className="space-y-1"><label className="text-xs text-muted-foreground">School</label><input className={fieldClass()} value={ed.school} onChange={(e) => apply((j) => { if (j.education[i]) j.education[i].school = e.target.value; })} /></div><div className="space-y-1"><label className="text-xs text-muted-foreground">Degree</label><input className={fieldClass()} value={ed.degree} onChange={(e) => apply((j) => { if (j.education[i]) j.education[i].degree = e.target.value; })} /></div><div className="space-y-1 sm:col-span-2"><label className="text-xs text-muted-foreground">School URL</label><input className={fieldClass()} value={ed.href} onChange={(e) => apply((j) => { if (j.education[i]) j.education[i].href = e.target.value; })} /></div><DriveUrlField id={`edu-logo-${i}`} label="Logo URL" value={ed.logoUrl} onChange={(v) => apply((j) => { if (j.education[i]) j.education[i].logoUrl = v; })} uploadKind="education-logo" className="sm:col-span-2" /><div className="space-y-1"><label className="text-xs text-muted-foreground">Start</label><input className={fieldClass()} value={ed.start} onChange={(e) => apply((j) => { if (j.education[i]) j.education[i].start = e.target.value; })} /></div><div className="space-y-1"><label className="text-xs text-muted-foreground">End</label><input className={fieldClass()} value={ed.end} onChange={(e) => apply((j) => { if (j.education[i]) j.education[i].end = e.target.value; })} /></div></div></div>)}<Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => apply((j) => { j.education.push({ ...EMPTY_EDUCATION }); })}>Add education</Button></div>

      <div id="site-work" className="scroll-mt-28 space-y-4 border-t border-border pt-4">
        <SectionHeaderWithVisibility
          title="الخبرة العملية"
          sectionKey="work"
          toggleLabel="إظهار القسم"
          data={data}
          apply={apply}
        />
      </div>
      <div className="space-y-4">{data.work.map((w, i) => <div key={`work-${i}`} className="space-y-2 rounded-md border border-border bg-background p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-medium text-muted-foreground">Job #{i + 1}</span><Button type="button" variant="destructive" size="sm" className="h-7 text-xs" onClick={() => apply((j) => { j.work.splice(i, 1); })}>Remove</Button></div><div className="grid gap-2 sm:grid-cols-2"><div className="space-y-1"><label className="text-xs text-muted-foreground">Company</label><input className={fieldClass()} value={w.company} onChange={(e) => apply((j) => { if (j.work[i]) j.work[i].company = e.target.value; })} /></div><div className="space-y-1"><label className="text-xs text-muted-foreground">Title</label><input className={fieldClass()} value={w.title} onChange={(e) => apply((j) => { if (j.work[i]) j.work[i].title = e.target.value; })} /></div><div className="space-y-1 sm:col-span-2"><label className="text-xs text-muted-foreground">Company URL</label><input className={fieldClass()} value={w.href} onChange={(e) => apply((j) => { if (j.work[i]) j.work[i].href = e.target.value; })} /></div><DriveUrlField id={`work-logo-${i}`} label="Logo URL" value={w.logoUrl} onChange={(v) => apply((j) => { if (j.work[i]) j.work[i].logoUrl = v; })} uploadKind="work-logo" className="sm:col-span-2" /><div className="space-y-1"><label className="text-xs text-muted-foreground">Start</label><input className={fieldClass()} value={w.start} onChange={(e) => apply((j) => { if (j.work[i]) j.work[i].start = e.target.value; })} /></div><div className="space-y-1"><label className="text-xs text-muted-foreground">End</label><input className={fieldClass()} value={w.end} onChange={(e) => apply((j) => { if (j.work[i]) j.work[i].end = e.target.value; })} /></div><div className="space-y-1"><label className="text-xs text-muted-foreground">Location</label><input className={fieldClass()} value={w.location} onChange={(e) => apply((j) => { if (j.work[i]) j.work[i].location = e.target.value; })} /></div><div className="space-y-1"><label className="text-xs text-muted-foreground">Badges (comma-separated)</label><input className={fieldClass()} value={w.badges.join(", ")} onChange={(e) => apply((j) => { if (!j.work[i]) return; j.work[i].badges = e.target.value.split(",").map((s) => s.trim()).filter(Boolean); })} /></div><div className="space-y-1 sm:col-span-2"><label className="text-xs text-muted-foreground">Description</label><textarea className={cn(fieldClass(), "min-h-[72px] resize-y")} value={w.description} onChange={(e) => apply((j) => { if (j.work[i]) j.work[i].description = e.target.value; })} /></div></div></div>)}<Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => apply((j) => { j.work.push({ ...EMPTY_WORK }); })}>Add work experience</Button></div>
      </>
      ) : null}

      {showProjectsMore ? (
      <>
      <div id="site-projects" className={cn("scroll-mt-28 space-y-4 pt-4", showExperience && "border-t border-border")}>
        <SectionHeaderWithVisibility
          title="المشاريع"
          sectionKey="projects"
          toggleLabel="إظهار القسم"
          data={data}
          apply={apply}
        />
      </div>
      <div className="space-y-4">
        {data.projects.map((p, pi) => (
          <div
            key={`proj-${pi}`}
            className="space-y-2 rounded-md border border-border bg-background p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Project #{pi + 1}
              </span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-7 text-xs"
                onClick={() =>
                  apply((j) => {
                    j.projects.splice(pi, 1);
                  })
                }
              >
                Remove
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Title</label>
                <input
                  className={fieldClass()}
                  value={p.title}
                  onChange={(e) =>
                    apply((j) => {
                      if (j.projects[pi]) j.projects[pi].title = e.target.value;
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Main URL</label>
                <input
                  className={fieldClass()}
                  value={p.href}
                  onChange={(e) =>
                    apply((j) => {
                      if (j.projects[pi]) j.projects[pi].href = e.target.value;
                    })
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">
                  Page slug (optional)
                </label>
                <input
                  className={fieldClass()}
                  placeholder="my-project"
                  value={p.slug ?? ""}
                  onChange={(e) =>
                    apply((j) => {
                      if (!j.projects[pi]) return;
                      const next = normalizeProjectSlug(e.target.value);
                      j.projects[pi].slug = next || undefined;
                    })
                  }
                />
                <ProjectSlugHint
                  slug={p.slug}
                  projects={data.projects}
                  index={pi}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Dates</label>
                <input
                  className={fieldClass()}
                  value={p.dates ?? ""}
                  onChange={(e) =>
                    apply((j) => {
                      if (j.projects[pi]) j.projects[pi].dates = e.target.value;
                    })
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={p.active}
                  onChange={(e) =>
                    apply((j) => {
                      if (j.projects[pi]) j.projects[pi].active = e.target.checked;
                    })
                  }
                />
                Active
              </label>
              <DriveUrlField
                id={`proj-img-${pi}`}
                label="Image URL"
                value={p.image}
                onChange={(v) =>
                  apply((j) => {
                    if (j.projects[pi]) j.projects[pi].image = v;
                  })
                }
                uploadKind="project"
                className="sm:col-span-2"
              />
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">Video URL</label>
                <input
                  className={fieldClass()}
                  value={p.video}
                  onChange={(e) =>
                    apply((j) => {
                      if (j.projects[pi]) j.projects[pi].video = e.target.value;
                    })
                  }
                />
              </div>
              <ProjectTechnologiesInput
                technologies={p.technologies}
                onChange={(next) =>
                  apply((j) => {
                    if (j.projects[pi]) j.projects[pi].technologies = next;
                  })
                }
              />
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">
                  Short description (card)
                </label>
                <textarea
                  className={cn(fieldClass(), "min-h-[80px] resize-y")}
                  value={p.description}
                  onChange={(e) =>
                    apply((j) => {
                      if (j.projects[pi])
                        j.projects[pi].description = e.target.value;
                    })
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">
                  Detail page (Markdown, optional)
                </label>
                <textarea
                  className={cn(fieldClass(), "min-h-[120px] resize-y font-mono")}
                  placeholder="Longer write-up shown only on the project page…"
                  value={p.bodyMarkdown ?? ""}
                  onChange={(e) =>
                    apply((j) => {
                      if (!j.projects[pi]) return;
                      const v = e.target.value.trim();
                      j.projects[pi].bodyMarkdown = v || undefined;
                    })
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">
                  Gallery image URLs (one per line)
                </label>
                <textarea
                  className={cn(fieldClass(), "min-h-[72px] resize-y font-mono")}
                  value={(p.gallery ?? []).join("\n")}
                  onChange={(e) =>
                    apply((j) => {
                      if (!j.projects[pi]) return;
                      const lines = e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      j.projects[pi].gallery = lines.length ? lines : undefined;
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2 border-t border-dashed border-border pt-2">
              <p className="text-xs font-medium text-muted-foreground">Links</p>
              {(p.links ?? []).map((link, li) => (
                <div
                  key={`${pi}-link-${li}`}
                  className="flex flex-wrap items-end gap-2"
                >
                  <div className="min-w-[100px] flex-1 space-y-1">
                    <label className="text-[10px] text-muted-foreground">
                      Label
                    </label>
                    <input
                      className={fieldClass()}
                      value={link.type}
                      onChange={(e) =>
                        apply((j) => {
                          const L = j.projects[pi]?.links?.[li];
                          if (L) L.type = e.target.value;
                        })
                      }
                    />
                  </div>
                  <div className="min-w-[140px] flex-[2] space-y-1">
                    <label className="text-[10px] text-muted-foreground">
                      URL
                    </label>
                    <input
                      className={fieldClass()}
                      value={link.href}
                      onChange={(e) =>
                        apply((j) => {
                          const L = j.projects[pi]?.links?.[li];
                          if (L) L.href = e.target.value;
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground">
                      Icon
                    </label>
                    <select
                      className={fieldClass()}
                      value={link.icon}
                      onChange={(e) =>
                        apply((j) => {
                          const L = j.projects[pi]?.links?.[li];
                          if (L)
                            L.icon = e.target.value as ProjectLinkIconKey;
                        })
                      }
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-destructive"
                    onClick={() =>
                      apply((j) => {
                        j.projects[pi]?.links?.splice(li, 1);
                      })
                    }
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() =>
                  apply((j) => {
                    if (!j.projects[pi]) return;
                    if (!j.projects[pi].links) j.projects[pi].links = [];
                    j.projects[pi].links.push({ ...EMPTY_LINK });
                  })
                }
              >
                Add link
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() =>
            apply((j) => {
              j.projects.push({ ...EMPTY_PROJECT, links: [{ ...EMPTY_LINK }] });
            })
          }
        >
          Add project
        </Button>
      </div>

      <div id="site-testimonials" className="scroll-mt-28 space-y-4 border-t border-border pt-4">
        <SectionHeaderWithVisibility
          title="آراء العملاء (Testimonials)"
          description="تظهر بعد المشاريع. يمكن إخفاء القسم من هنا أو من الإعدادات، أو بحذف كل الشهادات."
          sectionKey="testimonials"
          toggleLabel="إظهار القسم"
          data={data}
          apply={apply}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Badge القسم</label>
          <input
            className={fieldClass()}
            placeholder="Testimonials"
            value={data.testimonialsSection?.badge ?? ""}
            onChange={(e) =>
              apply((j) => {
                const v = e.target.value.trim();
                j.testimonialsSection = {
                  ...j.testimonialsSection,
                  badge: v || undefined,
                };
              })
            }
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">عنوان القسم</label>
          <input
            className={fieldClass()}
            placeholder="What clients say"
            value={data.testimonialsSection?.heading ?? ""}
            onChange={(e) =>
              apply((j) => {
                const v = e.target.value.trim();
                j.testimonialsSection = {
                  ...j.testimonialsSection,
                  heading: v || undefined,
                };
              })
            }
          />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {(data.testimonials ?? []).map((row, ti) => (
          <div
            key={`tm-${ti}-${row.name}`}
            className="space-y-2 rounded-md border border-border bg-background p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                شهادة #{ti + 1}
              </span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-7 text-xs"
                onClick={() =>
                  apply((j) => {
                    const list = [...(j.testimonials ?? [])];
                    list.splice(ti, 1);
                    j.testimonials = list.length ? list : undefined;
                  })
                }
              >
                حذف
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">الاسم</label>
                <input
                  className={fieldClass()}
                  value={row.name}
                  onChange={(e) =>
                    apply((j) => {
                      const list = j.testimonials ?? [];
                      if (list[ti]) list[ti].name = e.target.value;
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">الدور / المسمى</label>
                <input
                  className={fieldClass()}
                  value={row.role}
                  onChange={(e) =>
                    apply((j) => {
                      const list = j.testimonials ?? [];
                      if (list[ti]) list[ti].role = e.target.value;
                    })
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">الشركة / الجهة</label>
                <input
                  className={fieldClass()}
                  value={row.company}
                  onChange={(e) =>
                    apply((j) => {
                      const list = j.testimonials ?? [];
                      if (list[ti]) list[ti].company = e.target.value;
                    })
                  }
                />
              </div>
              <DriveUrlField
                id={`tm-avatar-${ti}`}
                label="رابط صورة الأفاتار"
                value={row.avatar}
                onChange={(v) =>
                  apply((j) => {
                    const list = j.testimonials ?? [];
                    if (list[ti]) list[ti].avatar = v;
                  })
                }
                uploadKind="testimonial-avatar"
                className="sm:col-span-2"
              />
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">نص الشهادة</label>
                <textarea
                  className={cn(fieldClass(), "min-h-[100px] resize-y")}
                  value={row.text}
                  onChange={(e) =>
                    apply((j) => {
                      const list = j.testimonials ?? [];
                      if (list[ti]) list[ti].text = e.target.value;
                    })
                  }
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() =>
            apply((j) => {
              j.testimonials = [...(j.testimonials ?? []), { ...EMPTY_TESTIMONIAL }];
            })
          }
        >
          إضافة شهادة
        </Button>
      </div>
      </>
      ) : null}
    </div>
  );
}

