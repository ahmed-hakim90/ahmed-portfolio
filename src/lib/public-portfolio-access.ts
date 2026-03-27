import type { SiteJson } from "@/data/site-defaults";
import type { AdminUserPublic } from "@/lib/admin-users";
import { meetsMinimumPortfolioRemote } from "@/lib/portfolio-minimum-profile";
import { getUserSiteJsonFromFirestore } from "@/lib/site-data";

/** Admin time-limited or disabled public `/slug` (not the same as Firebase Auth disabled). */
export function isPublicPortfolioUrlAccessible(user: AdminUserPublic): boolean {
  if (!user.publicPortfolioAccessEnabled) return false;
  const exp = user.publicPortfolioExpiresAt;
  if (typeof exp === "string" && exp.length > 0) {
    const t = Date.parse(exp);
    if (Number.isFinite(t) && t < Date.now()) return false;
  }
  return true;
}

/**
 * Whether the owner's public `/slug` portfolio should be shown to visitors.
 * Legacy users (never completed the new wizard) stay published when onboardingCompleted.
 * New wizard users need completion and minimum saved profile data (enforced again
 * in markOnboardingComplete). Step index is not required here so older completed
 * accounts are not blocked if their step was never persisted as 6.
 */
export function isPublicPortfolioPublished(
  user: AdminUserPublic,
  remoteSiteJson: SiteJson | null,
): boolean {
  if (!user.onboardingCompleted) return false;
  if (!user.onboardingEverCompletedOnce) return true;
  return meetsMinimumPortfolioRemote(remoteSiteJson);
}

/** Loads `sites/{uid}` and applies the same rules as {@link isPublicPortfolioPublished}. */
export async function isPortfolioPublishedForViewer(
  user: AdminUserPublic,
): Promise<boolean> {
  const remote = await getUserSiteJsonFromFirestore(user.id);
  return isPublicPortfolioPublished(user, remote);
}
