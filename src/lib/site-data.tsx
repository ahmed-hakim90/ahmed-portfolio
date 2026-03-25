import { DEFAULT_SITE_JSON, type SiteJson } from "@/data/site-defaults";
import {
  deepMergeSite,
  hydrateSiteJson,
  mergeSiteJsonForSave,
  type MergedSiteData,
} from "@/lib/site-hydrate";
import { getFirestoreDb } from "@/lib/firebase-admin";
import { cache } from "react";

export type { MergedSiteData };
export { hydrateSiteJson, mergeSiteJsonForSave, deepMergeSite } from "@/lib/site-hydrate";

/** Firestore rejects `undefined` anywhere in a document; strip it recursively. */
function stripUndefinedDeep<T>(value: T): T {
  if (value === undefined) return value;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as T;
  }
  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      out[k] = stripUndefinedDeep(v);
    }
  }
  return out as T;
}

export async function getSiteJsonFromFirestore(): Promise<SiteJson | null> {
  const db = getFirestoreDb();
  if (!db) return null;
  try {
    const snap = await db.collection("config").doc("site").get();
    if (!snap.exists) return null;
    const data = snap.data()?.json as SiteJson | undefined;
    return data ?? null;
  } catch {
    return null;
  }
}

export async function getUserSiteJsonFromFirestore(
  userId: string,
  options?: { seedFromGlobalIfMissing?: boolean },
): Promise<SiteJson | null> {
  const db = getFirestoreDb();
  if (!db) return null;
  try {
    const ref = db.collection("sites").doc(userId);
    const snap = await ref.get();
    if (snap.exists) {
      const data = snap.data()?.json as SiteJson | undefined;
      return data ?? null;
    }
    if (!options?.seedFromGlobalIfMissing) return null;
    const global = await getSiteJsonFromFirestore();
    const seeded = global ?? DEFAULT_SITE_JSON;
    await ref.set({
      json: seeded,
      updatedAt: new Date().toISOString(),
    });
    return seeded;
  } catch {
    return null;
  }
}

export async function saveUserSiteJson(userId: string, patch: Partial<SiteJson>) {
  const db = getFirestoreDb();
  if (!db) {
    return {
      ok: false as const,
      error:
        "Firestore is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH in .env.local and restart the dev server.",
    };
  }
  try {
    const merged = mergeSiteJsonForSave(patch);
    const json = stripUndefinedDeep(merged);
    await db.collection("sites").doc(userId).set({
      json,
      updatedAt: new Date().toISOString(),
    });
    return { ok: true as const };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Firestore write failed";
    console.error("saveUserSiteJson:", e);
    return { ok: false as const, error: msg };
  }
}

export async function getEffectiveSiteJsonForUser(userId: string): Promise<SiteJson> {
  const remote = await getUserSiteJsonFromFirestore(userId, {
    seedFromGlobalIfMissing: true,
  });
  if (!remote) return DEFAULT_SITE_JSON;
  return deepMergeSite(DEFAULT_SITE_JSON, remote);
}

export async function getMergedSiteDataForUser(userId: string): Promise<MergedSiteData> {
  const json = await getEffectiveSiteJsonForUser(userId);
  return hydrateSiteJson(json);
}

export const getEffectiveSiteJson = cache(async (): Promise<SiteJson> => {
  const remote = await getSiteJsonFromFirestore();
  if (!remote) return DEFAULT_SITE_JSON;
  return deepMergeSite(DEFAULT_SITE_JSON, remote);
});

export const getMergedSiteData = cache(async (): Promise<MergedSiteData> => {
  const json = await getEffectiveSiteJson();
  return hydrateSiteJson(json);
});
