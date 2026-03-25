import { timingSafeEqual } from "node:crypto";

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

/**
 * When SIGNUP_INVITE_SECRET is non-empty, signup must send the same value as `inviteCode`.
 * When unset or empty, public signup stays open (backward compatible).
 */
export function isSignupInviteValid(inviteCode: unknown): boolean {
  const secret = process.env.SIGNUP_INVITE_SECRET ?? "";
  if (secret.length === 0) return true;
  if (typeof inviteCode !== "string") return false;
  return safeCompareStrings(secret, inviteCode.trim());
}
