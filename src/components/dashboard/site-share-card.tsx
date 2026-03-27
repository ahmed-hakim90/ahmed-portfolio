"use client";

import type { MergedSiteData } from "@/lib/site-hydrate";
import { getEnvPublicSiteBase } from "@/lib/site-public-base";
import { forwardRef } from "react";

export type SiteShareCardProps = {
  data: MergedSiteData;
  /** Full public URL, e.g. https://example.com/john */
  publicUrl: string;
  blogPostCount: number;
};

function hostPathLabel(fullUrl: string): { host: string; path: string } {
  try {
    const u = new URL(
      fullUrl.startsWith("http://") || fullUrl.startsWith("https://")
        ? fullUrl
        : `https://${fullUrl.replace(/^\/+/, "")}`,
    );
    const path = u.pathname.replace(/^\//, "") || "/";
    const localHost =
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname.endsWith(".local");
    const envBase = getEnvPublicSiteBase();
    if (localHost && envBase) {
      const baseUrl = envBase.startsWith("http://") || envBase.startsWith("https://")
        ? envBase
        : `https://${envBase}`;
      const bu = new URL(baseUrl);
      const envIsLocal =
        bu.hostname === "localhost" ||
        bu.hostname === "127.0.0.1" ||
        bu.hostname.endsWith(".local");
      if (!envIsLocal) {
        return { host: bu.host, path };
      }
    }
    return { host: u.host, path };
  } catch {
    return { host: "portfolio", path: "" };
  }
}

function arNum(n: number): string {
  return n.toLocaleString("ar-EG");
}

type BadgeTone = "success" | "brand" | "neutral";

function resolveDynamicBadge(data: MergedSiteData, blogPostCount: number): {
  label: string;
  tone: BadgeTone;
} {
  if (data.availableForWork) {
    return {
      label: data.availableForWorkBadgeText?.trim() || "متاح للعمل",
      tone: "success",
    };
  }
  if (data.publicControls.routes.blog.enabled && blogPostCount > 0) {
    return { label: `كاتب محتوى · ${arNum(blogPostCount)} مقالات`, tone: "brand" };
  }
  const activeProjects = data.projects.filter((p) => p.active).length;
  if (activeProjects >= 4) {
    return { label: `منجز ${arNum(activeProjects)} مشاريع`, tone: "brand" };
  }
  if (data.skills.length >= 3) {
    return { label: `متخصص ${data.skills[0]}`, tone: "neutral" };
  }
  return { label: "الملف جاهز للمشاركة", tone: "neutral" };
}

export const SiteShareCard = forwardRef<HTMLDivElement, SiteShareCardProps>(
  function SiteShareCard({ data, publicUrl, blogPostCount }, ref) {
    const { host, path } = hostPathLabel(publicUrl);
    const activeProjects = data.projects.filter((p) => p.active);
    const projectCount = activeProjects.length;
    const slots: [typeof activeProjects[0] | null, typeof activeProjects[0] | null] = [
      activeProjects[0] ?? null,
      activeProjects[1] ?? null,
    ];
    const skills = data.skills.slice(0, 3);
    const headline =
      [data.description.trim(), data.location.trim()].filter(Boolean).join(" · ") ||
      data.name;
    const badge = resolveDynamicBadge(data, blogPostCount);

    const cardBg = "#f8f7f4";
    const panelBg = "#ffffff";
    const muted = "#f1efe9";
    const text = "#171717";
    const sub = "#66605a";
    const border = "#e5dfd3";
    const accent = "#111111";
    const toneStyles: Record<BadgeTone, { bg: string; fg: string; ring: string }> = {
      success: { bg: "#e9f8ef", fg: "#15623f", ring: "#b6e4c6" },
      brand: { bg: "#efeefe", fg: "#4338ca", ring: "#cbc7ff" },
      neutral: { bg: "#f3f4f6", fg: "#374151", ring: "#e5e7eb" },
    };

    return (
      <div
        ref={ref}
        dir="rtl"
        style={{
          width: 420,
          boxSizing: "border-box",
          background: cardBg,
          borderRadius: 28,
          border: `1px solid ${border}`,
          boxShadow: "0 18px 56px rgba(10,10,10,0.16)",
          overflow: "hidden",
          fontFamily:
            '"Segoe UI", "Tahoma", "Arial", "Noto Sans Arabic", "Helvetica Neue", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            background: panelBg,
            borderBottom: `1px solid ${border}`,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#34c759" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 12,
              color: sub,
              fontWeight: 500,
              direction: "ltr",
              unicodeBidi: "embed",
            }}
          >
            <span style={{ opacity: 0.85 }}>{host}</span>
            {path ? (
              <>
                <span style={{ opacity: 0.45 }}> / </span>
                <span style={{ color: text }}>{path}</span>
              </>
            ) : null}
          </div>
          <div style={{ width: 52 }} aria-hidden />
        </div>

        <div style={{ padding: 16 }}>
          <div
            style={{
              background: panelBg,
              border: `1px solid ${border}`,
              borderRadius: 22,
              padding: 18,
              marginBottom: 12,
            }}
          >
            <div
              style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 999,
                  padding: "6px 10px",
                  background: "#111111",
                  color: "#ffffff",
                  letterSpacing: "0.02em",
                }}
              >
                SHARE CARD
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 999,
                  padding: "6px 10px",
                  background: toneStyles[badge.tone].bg,
                  color: toneStyles[badge.tone].fg,
                  border: `1px solid ${toneStyles[badge.tone].ring}`,
                }}
              >
                {badge.label}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 82,
                  height: 82,
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                  border: `2px solid ${cardBg}`,
                  background: "#e0e0e0",
                }}
              >
                {data.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.avatarUrl}
                    alt=""
                    crossOrigin="anonymous"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 26,
                      fontWeight: 800,
                      color: sub,
                    }}
                  >
                    {data.initials}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: text,
                    lineHeight: 1.2,
                    marginBottom: 6,
                  }}
                >
                  {data.name}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: sub,
                    lineHeight: 1.45,
                    marginBottom: 10,
                  }}
                >
                  {headline}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: muted,
                        border: `1px solid ${border}`,
                        color: accent,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                borderRadius: 14,
                border: `1px solid ${border}`,
                background: muted,
                padding: "10px 12px",
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 11, color: sub, marginBottom: 4 }}>رابط البورتفليو</div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: accent,
                  direction: "ltr",
                  unicodeBidi: "embed",
                  textAlign: "right",
                }}
              >
                {host}
                {path ? `/${path}` : ""}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {[
                { value: arNum(projectCount), label: "مشروع" },
                { value: arNum(blogPostCount), label: "مقالات" },
                { value: arNum(data.skills.length), label: "مهارة" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    flex: 1,
                    background: panelBg,
                    borderRadius: 12,
                    padding: "10px 8px",
                    textAlign: "center",
                    border: `1px solid ${border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: text,
                      marginBottom: 3,
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: sub, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: panelBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: 14,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: text,
                marginBottom: 10,
              }}
            >
              مشاريع مختارة
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {slots.map((p, i) => (
                <div
                  key={p ? p.title + String(i) : `empty-${i}`}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: muted,
                    borderRadius: 14,
                    overflow: "hidden",
                    border: `1px solid ${border}`,
                  }}
                >
                  <div
                    style={{
                      height: 90,
                      background: "#e9e6df",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {p?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt=""
                        crossOrigin="anonymous"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 26, opacity: 0.25 }}>◧</span>
                    )}
                  </div>
                  <div style={{ padding: "10px 10px 11px" }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: text,
                        lineHeight: 1.3,
                        marginBottom: 4,
                      }}
                    >
                      {p?.title ?? "مشروع جديد"}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: sub,
                        direction: "ltr",
                        textAlign: "right",
                        unicodeBidi: "plaintext",
                      }}
                    >
                      {p?.technologies?.length
                        ? p.technologies.slice(0, 3).join(" · ")
                        : "No stack yet"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              marginTop: 12,
              fontSize: 11,
              fontWeight: 600,
              color: sub,
            }}
          >
            <span>Generated from your live portfolio</span>
            <span style={{ color: accent, fontWeight: 800 }}>✦ {data.name}</span>
          </div>
        </div>
      </div>
    );
  },
);
