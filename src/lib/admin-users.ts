import bcrypt from "bcryptjs";
import { getFirestoreDb } from "@/lib/firebase-admin";
import { timingSafeEqual } from "node:crypto";

const COLLECTION = "admin_users";
const BCRYPT_ROUNDS = 12;

export type AdminUserPublic = {
  id: string;
  username: string;
  role: "owner" | "client";
  slug: string;
  disabled: boolean;
  createdAt: string;
};

type AdminUserDoc = {
  username: string;
  role?: "owner" | "client";
  slug?: string;
  passwordHash: string;
  disabled: boolean;
  createdAt: string;
};

function safeCompareStrings(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

const RESERVED_SLUGS = new Set([
  "",
  "api",
  "dashboard",
  "blog",
  "portfolio",
  "signup",
  "login",
  "admin",
  "u",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export function normalizeSlug(input: string): string {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
  return cleaned;
}

export function isSlugAllowed(slug: string): boolean {
  if (slug.length < 3 || slug.length > 48) return false;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;
  return !RESERVED_SLUGS.has(slug);
}

function defaultSlugFromUsername(username: string): string {
  const base = normalizeSlug(username);
  if (isSlugAllowed(base)) return base;
  return `user-${Math.random().toString(36).slice(2, 8)}`;
}

export async function countAdminUsers(): Promise<number> {
  const db = getFirestoreDb();
  if (!db) return -1;
  try {
    const snap = await db.collection(COLLECTION).get();
    return snap.size;
  } catch (e) {
    console.error("countAdminUsers Firestore error:", e);
    return -1;
  }
}

export async function getAdminUserByUsername(
  username: string,
): Promise<(AdminUserPublic & { passwordHash: string }) | null> {
  const db = getFirestoreDb();
  if (!db) return null;
  const u = normalizeUsername(username);
  const snap = await db
    .collection(COLLECTION)
    .where("username", "==", u)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const data = doc.data() as AdminUserDoc;
  const role = data.role === "client" ? "client" : "owner";
  const slug = normalizeSlug(data.slug ?? data.username ?? "");
  return {
    id: doc.id,
    username: data.username,
    role,
    slug: isSlugAllowed(slug) ? slug : defaultSlugFromUsername(data.username),
    disabled: !!data.disabled,
    createdAt: data.createdAt,
    passwordHash: data.passwordHash,
  };
}

export async function getAdminUserById(
  id: string,
): Promise<AdminUserPublic | null> {
  const db = getFirestoreDb();
  if (!db) return null;
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data() as AdminUserDoc;
  const role = data.role === "client" ? "client" : "owner";
  const slug = normalizeSlug(data.slug ?? data.username ?? "");
  return {
    id: doc.id,
    username: data.username,
    role,
    slug: isSlugAllowed(slug) ? slug : defaultSlugFromUsername(data.username),
    disabled: !!data.disabled,
    createdAt: data.createdAt,
  };
}

export async function listAdminUsers(): Promise<AdminUserPublic[]> {
  const db = getFirestoreDb();
  if (!db) return [];
  const snap = await db.collection(COLLECTION).get();
  const rows = snap.docs.map((doc): AdminUserPublic => {
    const data = doc.data() as AdminUserDoc;
    const role: "owner" | "client" =
      data.role === "client" ? "client" : "owner";
    const slug = normalizeSlug(data.slug ?? data.username ?? "");
    return {
      id: doc.id,
      username: data.username,
      role,
      slug: isSlugAllowed(slug) ? slug : defaultSlugFromUsername(data.username),
      disabled: !!data.disabled,
      createdAt: data.createdAt,
    };
  });
  rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return rows;
}

export async function createAdminUser(
  username: string,
  password: string,
  role: "owner" | "client" = "client",
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const db = getFirestoreDb();
  if (!db) return { ok: false, error: "Firestore is not configured" };
  const u = normalizeUsername(username);
  if (u.length < 2 || u.length > 64) {
    return { ok: false, error: "Username must be 2–64 characters" };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }
  const existing = await getAdminUserByUsername(u);
  if (existing) return { ok: false, error: "Username already exists" };
  const slug = await getUniqueSlugForUsername(u);
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const ref = db.collection(COLLECTION).doc();
  await ref.set({
    username: u,
    role,
    slug,
    passwordHash,
    disabled: false,
    createdAt: new Date().toISOString(),
  } satisfies AdminUserDoc);
  return { ok: true, id: ref.id };
}

export async function verifyAdminPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function setAdminUserDisabled(
  id: string,
  disabled: boolean,
): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return false;
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  await ref.update({ disabled });
  return true;
}

export async function updateAdminUserPassword(
  id: string,
  newPassword: string,
): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return false;
  if (newPassword.length < 8) return false;
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await ref.update({ passwordHash });
  return true;
}

/**
 * Removes the user and their Firestore `sites/{id}` document (including `posts` subcollection).
 */
export async function deleteAdminUser(id: string): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return false;
  const userRef = db.collection(COLLECTION).doc(id);
  const userSnap = await userRef.get();
  if (!userSnap.exists) return false;
  const siteRef = db.collection("sites").doc(id);
  const siteSnap = await siteRef.get();
  if (siteSnap.exists) {
    await db.recursiveDelete(siteRef);
  }
  await userRef.delete();
  return true;
}

export async function getAdminUserBySlug(slug: string): Promise<AdminUserPublic | null> {
  const db = getFirestoreDb();
  if (!db) return null;
  const s = normalizeSlug(slug);
  if (!isSlugAllowed(s)) return null;
  const snap = await db.collection(COLLECTION).where("slug", "==", s).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const data = doc.data() as AdminUserDoc;
  const role = data.role === "client" ? "client" : "owner";
  return {
    id: doc.id,
    username: data.username,
    role,
    slug: s,
    disabled: !!data.disabled,
    createdAt: data.createdAt,
  };
}

export async function isSlugTaken(slug: string, excludeUserId?: string): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return true;
  const s = normalizeSlug(slug);
  if (!isSlugAllowed(s)) return true;
  const snap = await db.collection(COLLECTION).where("slug", "==", s).limit(1).get();
  if (snap.empty) return false;
  if (!excludeUserId) return true;
  return snap.docs[0].id !== excludeUserId;
}

export async function updateAdminUserSlug(
  userId: string,
  slug: string,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const db = getFirestoreDb();
  if (!db) return { ok: false, error: "Firestore is not configured" };
  const ref = db.collection(COLLECTION).doc(userId);
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "User not found" };
  const normalized = normalizeSlug(slug);
  if (!isSlugAllowed(normalized)) {
    return { ok: false, error: "Slug must be 3-48 chars: lowercase letters, numbers, hyphens" };
  }
  const taken = await isSlugTaken(normalized, userId);
  if (taken) return { ok: false, error: "Slug is already taken" };
  await ref.update({ slug: normalized });
  return { ok: true, slug: normalized };
}

async function getUniqueSlugForUsername(username: string): Promise<string> {
  const db = getFirestoreDb();
  if (!db) return defaultSlugFromUsername(username);
  const base = defaultSlugFromUsername(username);
  if (!(await isSlugTaken(base))) return base;
  for (let i = 2; i <= 200; i += 1) {
    const candidate = `${base}-${i}`;
    if (candidate.length > 48) continue;
    if (!(await isSlugTaken(candidate))) return candidate;
  }
  return `user-${Date.now().toString(36)}`;
}

/** Bootstrap: compare provided credentials to env (timing-safe). */
export function bootstrapCredentialsMatch(
  bodyUsername: string,
  bodyPassword: string,
): boolean {
  const envUser = process.env.ADMIN_BOOTSTRAP_USERNAME ?? "";
  const envPass = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "";
  if (envUser.length < 2 || envPass.length < 8) return false;
  return (
    safeCompareStrings(bodyUsername, envUser) &&
    safeCompareStrings(bodyPassword, envPass)
  );
}
