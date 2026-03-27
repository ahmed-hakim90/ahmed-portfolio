import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { getFirestoreDb } from "@/lib/firebase-admin";

const SUMMARY_DOC = "summary";
const ANALYTICS_COLLECTION = "platform_analytics";
const DEVICES_COLLECTION = "platform_devices";
const ADMIN_USERS = "admin_users";

/** UUID v4 (case-insensitive). */
const DEVICE_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type AnalyticsSurface = "public" | "dashboard";

export type DailyActivityRow = {
  date: string;
  publicPings: number;
  dashboardPings: number;
  prints: number;
  pdfDownloads: number;
};

export type PlatformAnalyticsSnapshot = {
  firestoreConfigured: boolean;
  uniqueDevicesPublic: number;
  uniqueDevicesDashboard: number;
  totalPrintClicks: number;
  totalPdfDownloads: number;
  totalAccounts: number;
  clientAccounts: number;
  activeClientAccounts: number;
  sitesSavedFromEditor: number;
  dailyActivity: DailyActivityRow[];
};

function utcDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function isValidDeviceId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const t = id.trim();
  if (t.length < 32 || t.length > 128) return false;
  return DEVICE_ID_RE.test(t);
}

function summaryRef(db: Firestore) {
  return db.collection(ANALYTICS_COLLECTION).doc(SUMMARY_DOC);
}

function dayRef(db: Firestore, dateKey: string) {
  return summaryRef(db).collection("days").doc(dateKey);
}

export async function recordAnalyticsPing(
  deviceId: string,
  surface: AnalyticsSurface,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isValidDeviceId(deviceId)) {
    return { ok: false, error: "Invalid deviceId" };
  }
  const db = getFirestoreDb();
  if (!db) return { ok: false, error: "Firestore is not configured" };

  const dateKey = utcDateKey();
  const deviceRef = db.collection(DEVICES_COLLECTION).doc(deviceId);
  const sumRef = summaryRef(db);
  const dailyRef = dayRef(db, dateKey);
  const now = new Date().toISOString();

  try {
    await db.runTransaction(async (tx) => {
      const deviceSnap = await tx.get(deviceRef);
      const data = deviceSnap.exists ? deviceSnap.data() : null;

      const patch: Record<string, unknown> = {};
      let incPublicUnique = 0;
      let incDashUnique = 0;

      if (surface === "public") {
        if (!data?.firstSeenPublic) {
          patch.firstSeenPublic = now;
          incPublicUnique = 1;
        }
        patch.lastSeenPublic = now;
      } else {
        if (!data?.firstSeenDashboard) {
          patch.firstSeenDashboard = now;
          incDashUnique = 1;
        }
        patch.lastSeenDashboard = now;
      }

      tx.set(deviceRef, patch, { merge: true });

      const summaryUpdate: Record<string, unknown> = {};
      if (incPublicUnique) {
        summaryUpdate.uniqueDevicesPublic = FieldValue.increment(incPublicUnique);
      }
      if (incDashUnique) {
        summaryUpdate.uniqueDevicesDashboard = FieldValue.increment(incDashUnique);
      }
      if (Object.keys(summaryUpdate).length) {
        tx.set(sumRef, summaryUpdate, { merge: true });
      }

      const dayField =
        surface === "public" ? "publicPings" : "dashboardPings";
      tx.set(
        dailyRef,
        {
          [dayField]: FieldValue.increment(1),
          date: dateKey,
        },
        { merge: true },
      );
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ping failed";
    console.error("recordAnalyticsPing:", e);
    return { ok: false, error: msg };
  }
}

export async function recordPrintClick(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const db = getFirestoreDb();
  if (!db) return { ok: false, error: "Firestore is not configured" };

  const dateKey = utcDateKey();
  const sumRef = summaryRef(db);
  const dailyRef = dayRef(db, dateKey);

  try {
    await db.runTransaction(async (tx) => {
      tx.set(
        sumRef,
        { totalPrintClicks: FieldValue.increment(1) },
        { merge: true },
      );
      tx.set(
        dailyRef,
        {
          prints: FieldValue.increment(1),
          date: dateKey,
        },
        { merge: true },
      );
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Print analytics failed";
    console.error("recordPrintClick:", e);
    return { ok: false, error: msg };
  }
}

export async function recordPdfDownloadClick(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const db = getFirestoreDb();
  if (!db) return { ok: false, error: "Firestore is not configured" };

  const dateKey = utcDateKey();
  const sumRef = summaryRef(db);
  const dailyRef = dayRef(db, dateKey);

  try {
    await db.runTransaction(async (tx) => {
      tx.set(
        sumRef,
        { totalPdfDownloads: FieldValue.increment(1) },
        { merge: true },
      );
      tx.set(
        dailyRef,
        {
          pdfDownloads: FieldValue.increment(1),
          date: dateKey,
        },
        { merge: true },
      );
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF download analytics failed";
    console.error("recordPdfDownloadClick:", e);
    return { ok: false, error: msg };
  }
}

async function countSitesWithEditorSaves(): Promise<number> {
  const db = getFirestoreDb();
  if (!db) return -1;
  try {
    const snap = await db
      .collection("sites")
      .where("dashboardSaveCount", ">=", 1)
      .count()
      .get();
    return snap.data().count;
  } catch (e) {
    console.error("countSitesWithEditorSaves:", e);
    return -1;
  }
}

async function getAdminUserCounts(): Promise<{
  total: number;
  clients: number;
  activeClients: number;
}> {
  const db = getFirestoreDb();
  if (!db) {
    return { total: -1, clients: -1, activeClients: -1 };
  }
  try {
    const snap = await db.collection(ADMIN_USERS).get();
    let clients = 0;
    let activeClients = 0;
    for (const doc of snap.docs) {
      const d = doc.data() as { role?: string; disabled?: boolean };
      const isClient = d.role === "client";
      if (isClient) {
        clients++;
        if (!d.disabled) activeClients++;
      }
    }
    return { total: snap.size, clients, activeClients };
  } catch (e) {
    console.error("getAdminUserCounts:", e);
    return { total: -1, clients: -1, activeClients: -1 };
  }
}

function lastNDaysUtcKeys(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

async function loadDailyActivity(
  db: Firestore,
  days: number,
): Promise<DailyActivityRow[]> {
  const keys = lastNDaysUtcKeys(days);
  const refs = keys.map((k) => dayRef(db, k));
  const snaps = await db.getAll(...refs);
  const map = new Map<string, DailyActivityRow>();
  for (let i = 0; i < keys.length; i++) {
    const date = keys[i];
    const snap = snaps[i];
    const row: DailyActivityRow = {
      date,
      publicPings: 0,
      dashboardPings: 0,
      prints: 0,
      pdfDownloads: 0,
    };
    if (snap.exists) {
      const d = snap.data() as Record<string, unknown>;
      row.publicPings = typeof d.publicPings === "number" ? d.publicPings : 0;
      row.dashboardPings =
        typeof d.dashboardPings === "number" ? d.dashboardPings : 0;
      row.prints = typeof d.prints === "number" ? d.prints : 0;
      row.pdfDownloads =
        typeof d.pdfDownloads === "number" ? d.pdfDownloads : 0;
    }
    map.set(date, row);
  }
  return keys.map((k) => map.get(k)!);
}

export async function getPlatformAnalyticsSnapshot(): Promise<PlatformAnalyticsSnapshot> {
  const db = getFirestoreDb();
  if (!db) {
    return {
      firestoreConfigured: false,
      uniqueDevicesPublic: 0,
      uniqueDevicesDashboard: 0,
      totalPrintClicks: 0,
      totalPdfDownloads: 0,
      totalAccounts: 0,
      clientAccounts: 0,
      activeClientAccounts: 0,
      sitesSavedFromEditor: 0,
      dailyActivity: lastNDaysUtcKeys(14).map((date) => ({
        date,
        publicPings: 0,
        dashboardPings: 0,
        prints: 0,
        pdfDownloads: 0,
      })),
    };
  }

  try {
    const [summarySnap, userCounts, sitesCount, dailyActivity] =
      await Promise.all([
        summaryRef(db).get(),
        getAdminUserCounts(),
        countSitesWithEditorSaves(),
        loadDailyActivity(db, 14),
      ]);

    const s: Record<string, unknown> = summarySnap.exists
      ? (summarySnap.data() ?? {})
      : {};
    const num = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : 0);

    return {
      firestoreConfigured: true,
      uniqueDevicesPublic: num(s.uniqueDevicesPublic),
      uniqueDevicesDashboard: num(s.uniqueDevicesDashboard),
      totalPrintClicks: num(s.totalPrintClicks),
      totalPdfDownloads: num(s.totalPdfDownloads),
      totalAccounts: userCounts.total,
      clientAccounts: userCounts.clients,
      activeClientAccounts: userCounts.activeClients,
      sitesSavedFromEditor: sitesCount,
      dailyActivity,
    };
  } catch (e) {
    console.error("getPlatformAnalyticsSnapshot:", e);
    return {
      firestoreConfigured: true,
      uniqueDevicesPublic: 0,
      uniqueDevicesDashboard: 0,
      totalPrintClicks: 0,
      totalPdfDownloads: 0,
      totalAccounts: -1,
      clientAccounts: -1,
      activeClientAccounts: -1,
      sitesSavedFromEditor: -1,
      dailyActivity: lastNDaysUtcKeys(14).map((date) => ({
        date,
        publicPings: 0,
        dashboardPings: 0,
        prints: 0,
        pdfDownloads: 0,
      })),
    };
  }
}
