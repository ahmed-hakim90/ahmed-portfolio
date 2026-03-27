import { DEFAULT_SITE_JSON } from "@/data/site-defaults";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Blog";
  const siteName = searchParams.get("site") || DEFAULT_SITE_JSON.name.trim();

  const origin = request.nextUrl.origin;
  const avatarPath = DEFAULT_SITE_JSON.avatarUrl;
  const avatarUrl = avatarPath.startsWith("http")
    ? avatarPath
    : `${origin}${avatarPath.startsWith("/") ? "" : "/"}${avatarPath}`;

  const displayTitle =
    title.length > 180 ? `${title.slice(0, 177)}…` : title;
  const titleSize = displayTitle.length > 60 ? 40 : 52;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#ffffff",
          color: "#000000",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 64,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            flex: 1,
            minWidth: 0,
            paddingRight: 32,
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            {displayTitle}
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, opacity: 0.85 }}>
            {siteName}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse Satori */}
        <img
          src={avatarUrl}
          width={200}
          height={200}
          alt=""
          style={{
            borderRadius: 1000,
            objectFit: "cover",
            border: "4px solid #000000",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
