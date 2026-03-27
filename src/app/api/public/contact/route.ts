import { getAdminUserBySlug } from "@/lib/admin-users";
import { getFirestoreDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_MESSAGES_PER_SESSION = 2;
const MIN_INTERVAL_MS = 5 * 60 * 1000;

function rateCookieName(ownerSlug: string): string {
  const h = createHash("sha256").update(ownerSlug).digest("hex").slice(0, 24);
  return `cmsg_${h}`;
}

function parseRateCookie(raw: string | null): { n: number; t: number } | null {
  if (!raw) return null;
  const parts = raw.split("|");
  if (parts.length !== 2) return null;
  const n = Number.parseInt(parts[0]!, 10);
  const t = Number.parseInt(parts[1]!, 10);
  if (!Number.isFinite(n) || !Number.isFinite(t) || n < 0 || t < 0) {
    return null;
  }
  return { n, t };
}

function getCookieFromHeader(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k !== name) continue;
    return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

function appendRateCookie(
  res: NextResponse,
  ownerSlug: string,
  sentCount: number,
  lastAt: number,
) {
  const name = rateCookieName(ownerSlug);
  const value = `${sentCount}|${lastAt}`;
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (isProd) parts.push("Secure");
  res.headers.append("Set-Cookie", parts.join("; "));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const ownerSlug =
    typeof body?.ownerSlug === "string" ? body.ownerSlug.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!ownerSlug) {
    return NextResponse.json(
      { error: "ownerSlug is required" },
      { status: 400 },
    );
  }
  const owner = await getAdminUserBySlug(ownerSlug);
  if (!owner || owner.disabled) {
    return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
  }

  if (name.length < 2) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (message.length < 1 || message.length > 500) {
    return NextResponse.json(
      { error: "Message must be 1–500 characters" },
      { status: 400 },
    );
  }

  const cookieHeader = request.headers.get("cookie");
  const rateRaw = getCookieFromHeader(cookieHeader, rateCookieName(ownerSlug));
  const rate = parseRateCookie(rateRaw);
  if (rate && rate.n >= MAX_MESSAGES_PER_SESSION) {
    return NextResponse.json(
      {
        error:
          "يمكنك إرسال رسالتين فقط.  تواصل عبر واتساب إن وُجد.",
      },
      { status: 429 },
    );
  }
  if (rate && rate.n >= 1 && Date.now() - rate.t < MIN_INTERVAL_MS) {
    return NextResponse.json(
      {
        error:
          "يرجى الانتظار 5 دقائق بين كل رسالة والأخرى..",
      },
      { status: 429 },
    );
  }

  const db = getFirestoreDb();
  if (!db) {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }

  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  try {
    await db
      .collection("sites")
      .doc(owner.id)
      .collection("contacts")
      .doc(id)
      .set({
        name,
        email,
        message,
        timestamp: FieldValue.serverTimestamp(),
        read: false,
      });
    const nextCount = (rate?.n ?? 0) + 1;
    const res = NextResponse.json({ ok: true, id });
    appendRateCookie(res, ownerSlug, nextCount, Date.now());
    return res;
  } catch (e) {
    console.error("contact save:", e);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
