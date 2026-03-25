import { getFirebaseAdminAuth, getFirestoreDb } from "@/lib/firebase-admin";
import { timingSafeEqual } from "node:crypto";

const COLLECTION = "admin_users";

export type AdminUserPublic = {
  id: string;
  email: string;
  username: string;
  role: "owner" | "client";
  slug: string;
  disabled: boolean;
  createdAt: string;
};

type AdminUserDoc = {
  email: string;
  username: string;
  role?: "owner" | "client";
  slug?: string;
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

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
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

function docToPublic(
  id: string,
  data: AdminUserDoc,
): AdminUserPublic {
  const role = data.role === "client" ? "client" : "owner";
  const slug = normalizeSlug(data.slug ?? data.username ?? "");
  return {
    id,
    email: normalizeEmail(data.email),
    username: data.username,
    role,
    slug: isSlugAllowed(slug) ? slug : defaultSlugFromUsername(data.username),
    disabled: !!data.disabled,
    createdAt: data.createdAt,
  };
}

export async function countAdminUsers(): Promise<number> {
  const db = getFirestoreDb();
  if (!db) return -1;
  try {
    const snap = await db.collection(COLLECTION).get();
    return snap.size;
  } catch {
    return -1;
  }
}

export async function getAdminUserById(
  id: string,
): Promise<AdminUserPublic | null> {
  const db = getFirestoreDb();
  if (!db) return null;
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data() as AdminUserDoc;
  return docToPublic(doc.id, data);
}

export async function listAdminUsers(): Promise<AdminUserPublic[]> {
  const db = getFirestoreDb();
  if (!db) return [];
  const snap = await db.collection(COLLECTION).get();
  const rows = snap.docs.map((doc) =>
    docToPublic(doc.id, doc.data() as AdminUserDoc),
  );
  rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return rows;
}

export async function isUsernameTaken(
  username: string,
  excludeUid?: string,
): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return true;
  const u = normalizeUsername(username);
  const snap = await db
    .collection(COLLECTION)
    .where("username", "==", u)
    .limit(1)
    .get();
  if (snap.empty) return false;
  if (!excludeUid) return true;
  return snap.docs[0].id !== excludeUid;
}

export function usernameFromEmail(email: string): string {
  const normalized = normalizeEmail(email);
  const local = normalized.split("@")[0] ?? "";
  const cleaned = normalizeUsername(
    local.replace(/[^a-z0-9._-]+/g, "").replace(/^\.+|\.+$/g, ""),
  );
  if (cleaned.length < 2) {
    return `user-${Math.random().toString(36).slice(2, 10)}`;
  }
  return cleaned.slice(0, 64);
}

async function ensureUniqueUsername(
  base: string,
  excludeUid?: string,
): Promise<string> {
  if (!(await isUsernameTaken(base, excludeUid))) return base;
  for (let i = 2; i <= 500; i += 1) {
    const candidate = `${base}-${i}`;
    if (candidate.length > 64) continue;
    if (!(await isUsernameTaken(candidate, excludeUid))) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
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

/**
 * Creates Firestore admin_users/{uid} after Firebase Auth user exists.
 * Document id must equal Firebase Auth uid.
 */
export async function createAdminUserDocument(
  uid: string,
  email: string,
  role: "owner" | "client" = "client",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getFirestoreDb();
  if (!db) return { ok: false, error: "Firestore is not configured" };
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail.includes("@")) {
    return { ok: false, error: "Valid email is required" };
  }
  const ref = db.collection(COLLECTION).doc(uid);
  const existing = await ref.get();
  if (existing.exists) {
    return { ok: false, error: "This account is already registered" };
  }
  const username = await ensureUniqueUsername(usernameFromEmail(normalizedEmail));
  const slug = await getUniqueSlugForUsername(username);
  await ref.set({
    email: normalizedEmail,
    username,
    role,
    slug,
    disabled: false,
    createdAt: new Date().toISOString(),
  } satisfies AdminUserDoc);
  return { ok: true };
}

/**
 * Owner-only: create Firebase Auth user + Firestore profile (same uid).
 */
export async function createAdminUserWithFirebaseAuth(
  email: string,
  password: string,
  role: "owner" | "client" = "client",
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const auth = getFirebaseAdminAuth();
  if (!auth) {
    return { ok: false, error: "Firebase Admin is not configured" };
  }
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail.includes("@")) {
    return { ok: false, error: "Valid email is required" };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }
  try {
    const userRecord = await auth.createUser({
      email: normalizedEmail,
      password,
      emailVerified: false,
    });
    const created = await createAdminUserDocument(
      userRecord.uid,
      normalizedEmail,
      role,
    );
    if (!created.ok) {
      await auth.deleteUser(userRecord.uid).catch(() => {});
      return created;
    }
    return { ok: true, id: userRecord.uid };
  } catch (e: unknown) {
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as { code: string }).code)
        : "";
    if (code === "auth/email-already-exists") {
      return { ok: false, error: "An account with this email already exists" };
    }
    return { ok: false, error: "Could not create user" };
  }
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
  const auth = getFirebaseAdminAuth();
  if (auth) {
    try {
      await auth.updateUser(id, { disabled });
    } catch {
      /* ignore auth sync errors */
    }
  }
  return true;
}

export async function updateAdminUserPassword(
  id: string,
  newPassword: string,
): Promise<boolean> {
  if (newPassword.length < 8) return false;
  const db = getFirestoreDb();
  if (!db) return false;
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  const auth = getFirebaseAdminAuth();
  if (!auth) return false;
  try {
    await auth.updateUser(id, { password: newPassword });
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes the user and their Firestore `sites/{id}` document (including `posts` subcollection).
 * Deletes Firebase Auth user when possible.
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
  const auth = getFirebaseAdminAuth();
  if (auth) {
    try {
      await auth.deleteUser(id);
    } catch {
      /* user may be missing in Auth */
    }
  }
  await userRef.delete();
  return true;
}

export async function getAdminUserBySlug(
  slug: string,
): Promise<AdminUserPublic | null> {
  const db = getFirestoreDb();
  if (!db) return null;
  const s = normalizeSlug(slug);
  if (!isSlugAllowed(s)) return null;
  const snap = await db
    .collection(COLLECTION)
    .where("slug", "==", s)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const data = doc.data() as AdminUserDoc;
  return docToPublic(doc.id, data);
}

export async function isSlugTaken(
  slug: string,
  excludeUserId?: string,
): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return true;
  const s = normalizeSlug(slug);
  if (!isSlugAllowed(s)) return true;
  const snap = await db
    .collection(COLLECTION)
    .where("slug", "==", s)
    .limit(1)
    .get();
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
    return {
      ok: false,
      error:
        "Slug must be 3-48 chars: lowercase letters, numbers, hyphens",
    };
  }
  const taken = await isSlugTaken(normalized, userId);
  if (taken) return { ok: false, error: "Slug is already taken" };
  await ref.update({ slug: normalized });
  return { ok: true, slug: normalized };
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

/**
 * Authorize bootstrap request body: prefer ADMIN_BOOTSTRAP_SECRET when set (min 16 chars).
 */
export function bootstrapRequestAuthorized(body: {
  bootstrapSecret?: string;
  bootstrapUsername?: string;
  bootstrapPassword?: string;
}): boolean {
  const secretEnv = process.env.ADMIN_BOOTSTRAP_SECRET ?? "";
  if (secretEnv.length >= 16) {
    const s = typeof body.bootstrapSecret === "string" ? body.bootstrapSecret : "";
    return safeCompareStrings(s, secretEnv);
  }
  const u =
    typeof body.bootstrapUsername === "string" ? body.bootstrapUsername : "";
  const p =
    typeof body.bootstrapPassword === "string" ? body.bootstrapPassword : "";
  return bootstrapCredentialsMatch(u, p);
}
