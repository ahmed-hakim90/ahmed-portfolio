"use client";

export type AdminUploadKind =
  | "avatar"
  | "project"
  | "work-logo"
  | "education-logo"
  | "testimonial-avatar";

type UploadSuccess = { ok: true; url: string };
type UploadFailure = { ok: false; error: string };

export async function uploadAdminImage(
  file: File,
  kind: AdminUploadKind,
): Promise<UploadSuccess | UploadFailure> {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("kind", kind);

  try {
    const res = await fetch("/api/admin/uploads", {
      method: "POST",
      body: formData,
    });
    const data = (await res.json().catch(() => ({}))) as
      | { url?: unknown; error?: unknown }
      | undefined;
    if (!res.ok) {
      return {
        ok: false,
        error:
          typeof data?.error === "string" ? data.error : "Upload failed. Try again.",
      };
    }
    if (typeof data?.url !== "string" || !data.url) {
      return { ok: false, error: "Upload finished but URL was not returned." };
    }
    return { ok: true, url: data.url };
  } catch {
    return { ok: false, error: "Network error while uploading image." };
  }
}
