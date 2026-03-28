import { getAdminSession } from "@/lib/admin-request";
import { uploadImageToDrive } from "@/lib/google-drive-admin";
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

  try {
    const payload = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadImageToDrive({
      userId: session.sub,
      kind,
      payload,
      mimeType: file.type,
      filename: objectPath.split("/").pop() ?? `upload-${Date.now()}.${ext}`,
    });

    return NextResponse.json({
      ok: true,
      kind,
      url: uploaded.url,
      path: objectPath,
      driveFileId: uploaded.fileId,
    });
  } catch (e) {
    console.error("POST /api/admin/uploads:", e);
    const message =
      e instanceof Error && e.message.trim() ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
