import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreDb } from "@/lib/firebase-admin";

const USER_ANALYTICS = "user_analytics";

function utcDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export type UserAnalyticsData = {
  totalPortfolioViews: number;
  totalCvDownloads: number;
  lastViewedAt: string | null;
};

/** Records a portfolio page view for a specific user (non-blocking safe to void). */
export async function recordPortfolioView(userId: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  const today = utcDateKey();
  try {
    await db
      .collection(USER_ANALYTICS)
      .doc(userId)
      .set(
        {
          totalPortfolioViews: FieldValue.increment(1),
          lastViewedAt: new Date().toISOString(),
          [`dailyViews.${today}`]: FieldValue.increment(1),
        },
        { merge: true },
      );
  } catch (e) {
    console.error("recordPortfolioView:", e);
  }
}

/** Records a CV PDF download for a specific user (non-blocking safe to void). */
export async function recordCvDownload(userId: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  try {
    await db
      .collection(USER_ANALYTICS)
      .doc(userId)
      .set(
        { totalCvDownloads: FieldValue.increment(1) },
        { merge: true },
      );
  } catch (e) {
    console.error("recordCvDownload:", e);
  }
}

/** Reads analytics for a specific user. Returns zeros if no data yet. */
export async function getUserAnalytics(
  userId: string,
): Promise<UserAnalyticsData> {
  const db = getFirestoreDb();
  if (!db) {
    return { totalPortfolioViews: 0, totalCvDownloads: 0, lastViewedAt: null };
  }
  try {
    const doc = await db.collection(USER_ANALYTICS).doc(userId).get();
    if (!doc.exists) {
      return {
        totalPortfolioViews: 0,
        totalCvDownloads: 0,
        lastViewedAt: null,
      };
    }
    const d = doc.data() as Record<string, unknown>;
    const num = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v) ? v : 0;
    return {
      totalPortfolioViews: num(d.totalPortfolioViews),
      totalCvDownloads: num(d.totalCvDownloads),
      lastViewedAt:
        typeof d.lastViewedAt === "string" ? d.lastViewedAt : null,
    };
  } catch (e) {
    console.error("getUserAnalytics:", e);
    return { totalPortfolioViews: 0, totalCvDownloads: 0, lastViewedAt: null };
  }
}
