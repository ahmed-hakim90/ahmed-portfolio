import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE = "admin_session";

export type AdminJwtPayload = {
  sub: string;
  username: string;
  role: "owner" | "client";
  /** false = onboarding wizard not yet completed; true (or absent in old tokens) = done */
  onboardingCompleted: boolean;
};

function getSecretBytes(): Uint8Array | null {
  const s = process.env.ADMIN_DASHBOARD_SECRET;
  if (!s || s.length < 16) return null;
  return new TextEncoder().encode(s);
}

export async function signAdminSessionToken(
  claims: AdminJwtPayload,
): Promise<string> {
  const key = getSecretBytes();
  if (!key) {
    throw new Error("ADMIN_DASHBOARD_SECRET must be set (min 16 characters)");
  }
  return new SignJWT({
    sub: claims.sub,
    username: claims.username,
    role: claims.role,
    onboardingCompleted: claims.onboardingCompleted,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyAdminSessionToken(
  token: string,
): Promise<AdminJwtPayload | null> {
  const key = getSecretBytes();
  if (!key) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    const sub = payload.sub;
    const username = payload.username;
    const role = payload.role;
    if (
      typeof sub !== "string" ||
      typeof username !== "string" ||
      (role !== "owner" && role !== "client")
    ) {
      return null;
    }
    // Legacy tokens without onboardingCompleted are treated as completed
    // (users who existed before the wizard was introduced).
    const onboardingCompleted =
      payload.onboardingCompleted === false ? false : true;
    return { sub, username, role, onboardingCompleted };
  } catch {
    return null;
  }
}
