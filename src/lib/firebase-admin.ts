import * as fs from "fs";
import * as path from "path";
import admin from "firebase-admin";
import { getAuth, type Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import type { Bucket } from "firebase-admin/storage";

function tryInit(): admin.app.App | null {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const jsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const jsonPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  try {
    if (jsonPath) {
      const resolved = path.isAbsolute(jsonPath)
        ? jsonPath
        : path.join(process.cwd(), jsonPath);
      if (fs.existsSync(resolved)) {
        const sa = JSON.parse(fs.readFileSync(resolved, "utf8"));
        const storageBucket =
          process.env.FIREBASE_STORAGE_BUCKET ??
          process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        return admin.initializeApp({
          credential: admin.credential.cert(sa as admin.ServiceAccount),
          ...(storageBucket ? { storageBucket } : {}),
        });
      }
      // Path set but file missing (typical on Vercel): fall through to FIREBASE_SERVICE_ACCOUNT_JSON.
    }
    if (jsonRaw) {
      const sa = JSON.parse(jsonRaw);
      const storageBucket =
        process.env.FIREBASE_STORAGE_BUCKET ??
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      return admin.initializeApp({
        credential: admin.credential.cert(sa as admin.ServiceAccount),
        ...(storageBucket ? { storageBucket } : {}),
      });
    }
  } catch (e) {
    console.error("Firebase admin init failed:", e);
    return null;
  }

  return null;
}

export function getFirebaseAdminApp(): admin.app.App | null {
  return tryInit();
}

export function getFirestoreDb(): Firestore | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return app.firestore();
}

export function getFirebaseAdminAuth(): Auth | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getAuth(app);
}

export function getFirebaseStorageBucket(): Bucket | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    return app.storage().bucket();
  } catch {
    return null;
  }
}

export async function isFirestoreBlogActive(): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return false;
  try {
    const snap = await db.collectionGroup("posts").limit(1).get();
    return !snap.empty;
  } catch {
    return false;
  }
}
