"use client";

/**
 * Sends a Firebase ID token to the server and sets the httpOnly admin session cookie.
 */
export async function exchangeIdTokenForAdminSession(
  idToken: string,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return {
      ok: false,
      error: data.error ?? "Login failed",
      status: res.status,
    };
  }
  return { ok: true };
}
