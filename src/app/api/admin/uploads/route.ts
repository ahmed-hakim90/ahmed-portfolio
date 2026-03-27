import { getAdminSession } from "@/lib/admin-request";
import { getFirebaseStorageBucket } from "@/lib/firebase-admin";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const UPLOAD_KIND_TO_FOLDER = {
  avatar: "avatar",
  project: "projects",
  "work-logo": "work-logos",
  "education-logo": "education-logos",
  "testimonial-avatar": "testimonial-avatars",
} as const;

type UploadKind = keyof typeof UPLOAD_KIND_TO_FOLDER;

function extensionForMimeType(contentType: string): string {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

function asUploadKind(value: unknown): UploadKind | null {
  if (typeof value !== "string") return null;
  if (value in UPLOAD_KIND_TO_FOLDER) return value as UploadKind;
  return null;
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bucket = getFirebaseStorageBucket();
  if (!bucket) {
    return NextResponse.json(
      { error: "Storage bucket is not configured" },
      { status: 500 },
    );
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const kind = asUploadKind(formData.get("kind"));
  if (!kind) {
    return NextResponse.json({ error: "Invalid upload kind" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size <= 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 5MB)" },
      { status: 400 },
    );
  }
  if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPG, PNG, WebP, GIF, or AVIF." },
      { status: 400 },
    );
  }

  const ext = extensionForMimeType(file.type);
  const folder = UPLOAD_KIND_TO_FOLDER[kind];
  const objectPath = `uploads/users/${session.sub}/${folder}/${Date.now()}-${randomUUID()}.${ext}`;
  const token = randomUUID();

  try {
    const payload = Buffer.from(await file.arrayBuffer());
    const target = bucket.file(objectPath);
    await target.save(payload, {
      resumable: false,
      metadata: {
        contentType: file.type,
        cacheControl: "public,max-age=31536000,immutable",
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    const encodedPath = encodeURIComponent(objectPath);
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;

    return NextResponse.json({ ok: true, kind, url, path: objectPath });
  } catch (e) {
    console.error("POST /api/admin/uploads:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
