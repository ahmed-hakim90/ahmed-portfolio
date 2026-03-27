import { getAdminUserBySlug } from "@/lib/admin-users";
import {
  isPortfolioPublishedForViewer,
  isPublicPortfolioUrlAccessible,
} from "@/lib/public-portfolio-access";
import { getEffectiveSiteJsonForUser } from "@/lib/site-data";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: { slug: string };
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export default async function Image({ params }: Props) {
  const user = await getAdminUserBySlug(params.slug);
  if (
    !user ||
    user.disabled ||
    !isPublicPortfolioUrlAccessible(user) ||
    !(await isPortfolioPublishedForViewer(user))
  ) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111827",
            color: "#f9fafb",
            fontSize: 42,
            fontWeight: 700,
          }}
        >
          Portfolio
        </div>
      ),
      size,
    );
  }

  const site = await getEffectiveSiteJsonForUser(user.id);
  const name = truncate(site.name || user.username, 56);
  const description = truncate(site.description || "Personal portfolio", 110);
  const summary = truncate(site.summary || "", 220);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0f172a 0%, #111827 45%, #1d4ed8 100%)",
          color: "#f8fafc",
          padding: "52px",
          fontFamily: "ui-sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 28,
              opacity: 0.92,
            }}
          >
            {site.location || "Available worldwide"}
          </div>
          <div
            style={{
              fontSize: 24,
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: 9999,
              padding: "8px 18px",
              opacity: 0.95,
            }}
          >
            /{user.slug}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 74, fontWeight: 800, lineHeight: 1.02 }}>{name}</div>
          <div style={{ fontSize: 34, opacity: 0.95 }}>{description}</div>
          <div style={{ fontSize: 24, opacity: 0.8, maxWidth: 980 }}>{summary}</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            opacity: 0.88,
          }}
        >
          <div>{site.skills.slice(0, 4).join(" • ")}</div>
          <div>Open profile</div>
        </div>
      </div>
    ),
    size,
  );
}
