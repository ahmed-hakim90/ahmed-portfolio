"use client";

import { formatUploadErrorForDisplay } from "@/lib/google-drive-upload-errors";

export type AdminUploadKind =
  | "avatar"
  | "project"
  | "work-logo"
  | "education-logo"
  | "testimonial-avatar";

type UploadSuccess = {
  ok: true;
  url: string;
  originalBytes: number;
  uploadedBytes: number;
  optimized: boolean;
};
type UploadFailure = { ok: false; error: string };

const SERVER_MAX_BYTES = 5 * 1024 * 1024;
const TARGET_MAX_BYTES = Math.floor(4.5 * 1024 * 1024);
const MAX_DIMENSION_PX = 2000;

function shouldOptimizeImage(file: File): boolean {
  return (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp"
  );
}

function outputMimeTypeFor(file: File): string {
  if (file.type === "image/png") return "image/webp";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
}

async function loadImageFromFile(
  file: File,
): Promise<{ image: HTMLImageElement; objectUrl: string }> {
  const objectUrl = URL.createObjectURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image."));
    img.src = objectUrl;
  });
  return { image, objectUrl };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

async function optimizeImageBeforeUpload(file: File): Promise<File> {
  if (!shouldOptimizeImage(file)) return file;

  try {
    const { image, objectUrl } = await loadImageFromFile(file);
    try {
      const largestSide = Math.max(image.width, image.height);
      const scale =
        largestSide > MAX_DIMENSION_PX ? MAX_DIMENSION_PX / largestSide : 1;
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(image, 0, 0, width, height);

      const mimeType = outputMimeTypeFor(file);
      const qualitySteps = [0.9, 0.82, 0.74, 0.66, 0.58];
      let bestBlob: Blob | null = null;

      for (const quality of qualitySteps) {
        const blob = await canvasToBlob(canvas, mimeType, quality);
        if (!blob) continue;
        if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
        if (blob.size <= TARGET_MAX_BYTES) {
          bestBlob = blob;
          break;
        }
      }

      if (!bestBlob) return file;
      if (bestBlob.size >= file.size * 0.95 && file.size <= SERVER_MAX_BYTES) {
        // Skip replacement if savings are negligible and file already acceptable.
        return file;
      }

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const extension = mimeType === "image/webp" ? "webp" : "jpg";
      return new File([bestBlob], `${baseName}.${extension}`, {
        type: mimeType,
        lastModified: Date.now(),
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return file;
  }
}

export async function uploadAdminImage(
  file: File,
  kind: AdminUploadKind,
): Promise<UploadSuccess | UploadFailure> {
  const originalBytes = file.size;
  const prepared = await optimizeImageBeforeUpload(file);
  const uploadedBytes = prepared.size;
  const optimized = uploadedBytes < originalBytes;
  if (prepared.size > SERVER_MAX_BYTES) {
    return {
      ok: false,
      error:
        "Image is still larger than 5MB after optimization. Please choose a smaller image.",
    };
  }

  const formData = new FormData();
  formData.set("file", prepared);
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
      const raw =
        typeof data?.error === "string"
          ? data.error
          : "Upload failed. Try again.";
      const { title, detail } = formatUploadErrorForDisplay(raw);
      return {
        ok: false,
        error: detail ? `${title}\n\n${detail}` : title,
      };
    }
    if (typeof data?.url !== "string" || !data.url) {
      return { ok: false, error: "Upload finished but URL was not returned." };
    }
    return {
      ok: true,
      url: data.url,
      originalBytes,
      uploadedBytes,
      optimized,
    };
  } catch {
    return { ok: false, error: "Network error while uploading image." };
  }
}
