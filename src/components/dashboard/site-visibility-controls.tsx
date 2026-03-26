"use client";

import {
  DEFAULT_SITE_JSON,
  type PortfolioTextDirection,
  type PortfolioThemePreset,
  type SiteJson,
} from "@/data/site-defaults";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Props = {
  data: SiteJson;
  onChange: (next: SiteJson) => void;
};

function mergePublicControlsDefaults(j: SiteJson) {
  j.publicControls = {
    ...DEFAULT_SITE_JSON.publicControls,
    ...(j.publicControls ?? {}),
    routes: {
      blog: {
        enabled:
          j.publicControls?.routes?.blog?.enabled ??
          DEFAULT_SITE_JSON.publicControls.routes.blog.enabled,
      },
    },
    ui: {
      dockMenu:
        j.publicControls?.ui?.dockMenu ??
        DEFAULT_SITE_JSON.publicControls.ui.dockMenu,
      themeToggle:
        j.publicControls?.ui?.themeToggle ??
        DEFAULT_SITE_JSON.publicControls.ui.themeToggle,
      themePreset:
        j.publicControls?.ui?.themePreset ??
        DEFAULT_SITE_JSON.publicControls.ui.themePreset,
      portfolioDir:
        j.publicControls?.ui?.portfolioDir ??
        DEFAULT_SITE_JSON.publicControls.ui.portfolioDir,
      portfolioLang:
        (j.publicControls?.ui?.portfolioLang ??
          DEFAULT_SITE_JSON.publicControls.ui.portfolioLang) as string,
    },
    portfolioSections: {
      hero:
        j.publicControls?.portfolioSections?.hero ??
        DEFAULT_SITE_JSON.publicControls.portfolioSections.hero,
      about:
        j.publicControls?.portfolioSections?.about ??
        DEFAULT_SITE_JSON.publicControls.portfolioSections.about,
      work:
        j.publicControls?.portfolioSections?.work ??
        DEFAULT_SITE_JSON.publicControls.portfolioSections.work,
      education:
        j.publicControls?.portfolioSections?.education ??
        DEFAULT_SITE_JSON.publicControls.portfolioSections.education,
      skills:
        j.publicControls?.portfolioSections?.skills ??
        DEFAULT_SITE_JSON.publicControls.portfolioSections.skills,
      projects:
        j.publicControls?.portfolioSections?.projects ??
        DEFAULT_SITE_JSON.publicControls.portfolioSections.projects,
      aboutMe:
        j.publicControls?.portfolioSections?.aboutMe ??
        DEFAULT_SITE_JSON.publicControls.portfolioSections.aboutMe,
      contact:
        j.publicControls?.portfolioSections?.contact ??
        DEFAULT_SITE_JSON.publicControls.portfolioSections.contact,
    },
    sections: {
      work: {
        linksEnabled:
          j.publicControls?.sections?.work?.linksEnabled ??
          DEFAULT_SITE_JSON.publicControls.sections.work.linksEnabled,
      },
      education: {
        linksEnabled:
          j.publicControls?.sections?.education?.linksEnabled ??
          DEFAULT_SITE_JSON.publicControls.sections.education.linksEnabled,
      },
      projects: {
        linksEnabled:
          j.publicControls?.sections?.projects?.linksEnabled ??
          DEFAULT_SITE_JSON.publicControls.sections.projects.linksEnabled,
      },
      contact: {
        linkedinCtaEnabled:
          j.publicControls?.sections?.contact?.linkedinCtaEnabled ??
          DEFAULT_SITE_JSON.publicControls.sections.contact.linkedinCtaEnabled,
      },
    },
  };
}

function ToggleRow({
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 rounded-md border border-border px-3 py-2 text-sm",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <span>{label}</span>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
      />
    </label>
  );
}

export function SiteVisibilityControls({ data, onChange }: Props) {
  const parsed: SiteJson = structuredClone(data);
  mergePublicControlsDefaults(parsed);
  const apply = (fn: (j: SiteJson) => void) => {
    const next = structuredClone(parsed);
    fn(next);
    onChange(next);
  };

  const pc = parsed.publicControls;

  return (
    <div
      id="site-visibility"
      className="scroll-mt-28 space-y-4 rounded-lg border border-border bg-muted/30 p-4"
    >
      <h2 className="text-sm font-semibold tracking-tight">الظهور والتبويبات</h2>
      <p className="text-xs text-muted-foreground">
        تحكّم في صفحة المدونة، الشريط السفلي، مفتاح السمة، وروابط الأقسام الظاهرة للزوار.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <ToggleRow
          id="route-blog"
          label="Blog page & /blog links"
          checked={pc.routes.blog.enabled}
          onChange={(v) =>
            apply((j) => {
              j.publicControls!.routes.blog.enabled = v;
            })
          }
        />
        <ToggleRow
          id="ui-dock"
          label="Show dock menu"
          checked={pc.ui.dockMenu}
          onChange={(v) => {
            apply((j) => {
              j.publicControls!.ui.dockMenu = v;
            });
          }}
        />
        <ToggleRow
          id="ui-theme"
          label="Theme toggle in dock"
          checked={pc.ui.themeToggle}
          onChange={(v) => {
            apply((j) => {
              j.publicControls!.ui.themeToggle = v;
            });
          }}
        />
        <div className="sm:col-span-2 space-y-2 rounded-md border border-border bg-background/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            ثيم المحفظة العامة
          </p>
          <p className="text-[11px] text-muted-foreground">
            ألوان مميّزة للصفحة العامة؛ الوضع الفاتح/الداكن يبقى من مفتاح السمة.
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["default", "افتراضي"],
                ["neutral", "محايد"],
                ["blue", "أزرق"],
                ["warm", "دافئ"],
                ["forest", "أخضر"],
              ] as const satisfies readonly [PortfolioThemePreset, string][]
            ).map(([value, label]) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                  pc.ui.themePreset === value
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <input
                  type="radio"
                  name="portfolio-theme-preset"
                  className="sr-only"
                  checked={pc.ui.themePreset === value}
                  onChange={() =>
                    apply((j) => {
                      j.publicControls!.ui.themePreset = value;
                    })
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2 space-y-2 rounded-md border border-border bg-background/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            اتجاه ولغة المحفظة العامة
          </p>
          <p className="text-[11px] text-muted-foreground">
            يطبّق على صفحة المحفظة والمدونة تحت رابطك ومعاينة المحرر وطباعة السيرة. لوحة التحكم تبقى عربية.
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["rtl", "يمين لليسار (عربي)"],
                ["ltr", "يسار لليمين (إنجليزي)"],
              ] as const satisfies readonly [PortfolioTextDirection, string][]
            ).map(([value, label]) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                  pc.ui.portfolioDir === value
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <input
                  type="radio"
                  name="portfolio-text-dir"
                  className="sr-only"
                  checked={pc.ui.portfolioDir === value}
                  onChange={() =>
                    apply((j) => {
                      j.publicControls!.ui.portfolioDir = value;
                    })
                  }
                />
                {label}
              </label>
            ))}
          </div>
          <div className="space-y-1">
            <label
              htmlFor="portfolio-lang"
              className="text-[11px] text-muted-foreground"
            >
              لغة المحتوى (رمز BCP 47، مثل ar أو en)
            </label>
            <input
              id="portfolio-lang"
              className="w-full max-w-xs rounded-md border border-input bg-background px-2 py-1.5 font-mono text-xs"
              value={pc.ui.portfolioLang}
              placeholder="en"
              maxLength={12}
              onChange={(e) => {
                const v = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
                apply((j) => {
                  j.publicControls!.ui.portfolioLang = v || "en";
                });
              }}
            />
          </div>
        </div>
        <ToggleRow
          id="sec-work"
          label="Work experience links"
          checked={pc.sections.work.linksEnabled}
          onChange={(v) =>
            apply((j) => {
              j.publicControls!.sections.work.linksEnabled = v;
            })
          }
        />
        <ToggleRow
          id="sec-edu"
          label="Education links"
          checked={pc.sections.education.linksEnabled}
          onChange={(v) =>
            apply((j) => {
              j.publicControls!.sections.education.linksEnabled = v;
            })
          }
        />
        <ToggleRow
          id="sec-proj"
          label="Project external links"
          checked={pc.sections.projects.linksEnabled}
          onChange={(v) =>
            apply((j) => {
              j.publicControls!.sections.projects.linksEnabled = v;
            })
          }
        />
        <ToggleRow
          id="sec-contact"
          label="LinkedIn CTA link (contact)"
          checked={pc.sections.contact.linkedinCtaEnabled}
          onChange={(v) =>
            apply((j) => {
              j.publicControls!.sections.contact.linkedinCtaEnabled = v;
            })
          }
        />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Portfolio page sections
        </p>
        <p className="text-xs text-muted-foreground">
          إظهار أو إخفاء أقسام الصفحة الرئيسية للمحفظة.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <ToggleRow
            id="pg-hero"
            label="Hero (intro)"
            checked={pc.portfolioSections.hero}
            onChange={(v) =>
              apply((j) => {
                j.publicControls!.portfolioSections.hero = v;
              })
            }
          />
          <ToggleRow
            id="pg-about"
            label="About (summary)"
            checked={pc.portfolioSections.about}
            onChange={(v) =>
              apply((j) => {
                j.publicControls!.portfolioSections.about = v;
              })
            }
          />
          <ToggleRow
            id="pg-work"
            label="Work experience"
            checked={pc.portfolioSections.work}
            onChange={(v) =>
              apply((j) => {
                j.publicControls!.portfolioSections.work = v;
              })
            }
          />
          <ToggleRow
            id="pg-edu"
            label="Education"
            checked={pc.portfolioSections.education}
            onChange={(v) =>
              apply((j) => {
                j.publicControls!.portfolioSections.education = v;
              })
            }
          />
          <ToggleRow
            id="pg-skills"
            label="Skills"
            checked={pc.portfolioSections.skills}
            onChange={(v) =>
              apply((j) => {
                j.publicControls!.portfolioSections.skills = v;
              })
            }
          />
          <ToggleRow
            id="pg-projects"
            label="Projects"
            checked={pc.portfolioSections.projects}
            onChange={(v) =>
              apply((j) => {
                j.publicControls!.portfolioSections.projects = v;
              })
            }
          />
          <ToggleRow
            id="pg-aboutme"
            label="About Me (spotlight)"
            checked={pc.portfolioSections.aboutMe}
            onChange={(v) =>
              apply((j) => {
                j.publicControls!.portfolioSections.aboutMe = v;
              })
            }
          />
          <ToggleRow
            id="pg-contact"
            label="Contact / Get in Touch"
            checked={pc.portfolioSections.contact}
            onChange={(v) =>
              apply((j) => {
                j.publicControls!.portfolioSections.contact = v;
              })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Navbar items</p>
        <div className="grid gap-2">
          {parsed.navbar.map((item, i) => (
            <ToggleRow
              key={`${item.href}-${i}`}
              id={`nav-${i}`}
              label={`${item.label} (${item.href})`}
              checked={item.enabled !== false}
              onChange={(v) =>
                apply((j) => {
                  if (!j.navbar[i]) return;
                  j.navbar[i].enabled = v;
                })
              }
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Social dock
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(parsed.contact.social).map(([key, entry]) => (
            <ToggleRow
              key={key}
              id={`social-${key}`}
              label={`${key}${entry.navbar ? "" : " (navbar off in JSON)"}`}
              checked={entry.enabled !== false}
              onChange={(v) =>
                apply((j) => {
                  const s = j.contact.social[key];
                  if (s) s.enabled = v;
                })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
