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

    const cardBg = "#ffffff";
    const muted = "#f5f5f5";
    const text = "#111111";
    const sub = "#666666";
    const border = "#e8e8e8";

    return (
      <div
        ref={ref}
        dir="rtl"
        style={{
          width: 390,
          boxSizing: "border-box",
          background: cardBg,
          borderRadius: 20,
          border: `1px solid ${border}`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
          overflow: "hidden",
          fontFamily:
            '"Segoe UI", "Tahoma", "Arial", "Noto Sans Arabic", "Helvetica Neue", sans-serif',
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: muted,
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

        <div style={{ padding: "18px 18px 22px" }}>
          {/* Top bar: decorative toggles + brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: muted,
                  border: `1px solid ${border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                ☾
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#111",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                ✦
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 18,
                fontWeight: 700,
                color: text,
              }}
            >
              <span>✦</span>
              <span>{data.name}</span>
            </div>
          </div>

          {/* Profile card */}
          <div
            style={{
              background: muted,
              borderRadius: 16,
              padding: 16,
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
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
                    fontSize: 28,
                    fontWeight: 700,
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
                  fontSize: 22,
                  fontWeight: 800,
                  color: text,
                  lineHeight: 1.25,
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
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: cardBg,
                      border: `1px solid ${border}`,
                      color: text,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Projects */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: text,
                marginBottom: 12,
              }}
            >
              المشاريع
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
                      height: 92,
                      background: "#ebebeb",
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
                      <span style={{ fontSize: 28, opacity: 0.25 }}>◧</span>
                    )}
                  </div>
                  <div style={{ padding: "10px 10px 12px" }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: text,
                        lineHeight: 1.3,
                        marginBottom: 4,
                      }}
                    >
                      {p?.title ?? "—"}
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
                        : "\u00a0"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { value: arNum(projectCount), label: "مشروع" },
              { value: arNum(blogPostCount), label: "مقالات" },
              { value: "٥★", label: "تقييم" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  background: muted,
                  borderRadius: 12,
                  padding: "12px 8px",
                  textAlign: "center",
                  border: `1px solid ${border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: text,
                    marginBottom: 4,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: sub, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);
