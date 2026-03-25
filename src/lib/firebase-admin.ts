import admin from "firebase-admin";
import type { Firestore } from "firebase-admin/firestore";

let loggedMissingConfig = false;
let loggedInitFailure = false;

function normalizePrivateKey(raw: string): string {
  let k = raw.trim();
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1);
  }
  return k.replace(/\\n/g, "\n");
}

function tryInit(): admin.app.App | null {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim() ?? "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim() ?? "";
  const privateKey = normalizePrivateKey(
    process.env.FIREBASE_PRIVATE_KEY ?? "",
  );

  const missing: string[] = [];
  if (!projectId) missing.push("FIREBASE_PROJECT_ID");
  if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
  if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");

  if (missing.length > 0) {
    if (!loggedMissingConfig) {
      loggedMissingConfig = true;
      console.error(
        "[firebase-admin] Missing environment variables:",
        missing.join(", "),
      );
    }
    return null;
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (e) {
    if (!loggedInitFailure) {
      loggedInitFailure = true;
      console.error(
        "[firebase-admin] initializeApp failed:",
        e instanceof Error ? e.message : e,
        e instanceof Error ? e.stack : "",
      );
    }
    return null;
  }
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
