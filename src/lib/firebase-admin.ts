import * as fs from "fs";
import * as path from "path";
import admin from "firebase-admin";
import type { Firestore } from "firebase-admin/firestore";

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
      if (!fs.existsSync(resolved)) {
        return null;
      }
      const sa = JSON.parse(fs.readFileSync(resolved, "utf8"));
      return admin.initializeApp({
        credential: admin.credential.cert(sa as admin.ServiceAccount),
      });
    }
    if (jsonRaw) {
      const sa = JSON.parse(jsonRaw);
      return admin.initializeApp({
        credential: admin.credential.cert(sa as admin.ServiceAccount),
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
