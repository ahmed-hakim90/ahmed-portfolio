import { SignJWT, importPKCS8 } from "jose";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_ENDPOINT =
  "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name";

type UploadKind =
  | "avatar"
  | "project"
  | "work-logo"
  | "education-logo"
  | "testimonial-avatar";

type AccessTokenCache = { token: string; expMs: number } | null;

let accessTokenCache: AccessTokenCache = null;
const folderCache = new Map<string, string>();

function normalizePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, "\n").trim();
}

function envOrThrow(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`${name} is not configured`);
  return v;
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (accessTokenCache && accessTokenCache.expMs > now + 30_000) {
    return accessTokenCache.token;
  }

  const serviceAccountEmail = envOrThrow("GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = normalizePrivateKey(envOrThrow("GOOGLE_DRIVE_PRIVATE_KEY"));
  const impersonate = process.env.GOOGLE_DRIVE_IMPERSONATE_USER?.trim();
  const alg = "RS256";
  const issuedAt = Math.floor(now / 1000);
  const exp = issuedAt + 3600;
  const key = await importPKCS8(privateKey, alg);
  const jwt = await new SignJWT({ scope: DRIVE_SCOPE })
    .setProtectedHeader({ alg, typ: "JWT" })
    .setIssuer(serviceAccountEmail)
    .setSubject(impersonate || serviceAccountEmail)
    .setAudience(TOKEN_ENDPOINT)
    .setIssuedAt(issuedAt)
    .setExpirationTime(exp)
    .sign(key);

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google token request failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!data.access_token) {
    throw new Error("Google token response missing access_token");
  }
  accessTokenCache = {
    token: data.access_token,
    expMs: now + Math.max(60, (data.expires_in ?? 3600) - 60) * 1000,
  };
  return data.access_token;
}

function qEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function driveRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${DRIVE_API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Drive API failed (${res.status}): ${text}`);
  }
  return (await res.json()) as T;
}

type DriveListResponse = { files?: Array<{ id?: string; name?: string }> };

async function findFolderByName(
  name: string,
  parentId: string,
): Promise<string | null> {
  const q = [
    `name='${qEscape(name)}'`,
    `'${qEscape(parentId)}' in parents`,
    "mimeType='application/vnd.google-apps.folder'",
    "trashed=false",
  ].join(" and ");
  const params = new URLSearchParams({
    q,
    fields: "files(id,name)",
    pageSize: "1",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  });
  const data = await driveRequest<DriveListResponse>(`/files?${params.toString()}`);
  const hit = data.files?.[0]?.id;
  return hit ?? null;
}

async function createFolder(name: string, parentId: string): Promise<string> {
  const data = await driveRequest<{ id?: string }>("/files?supportsAllDrives=true", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });
  if (!data.id) throw new Error(`Failed to create folder: ${name}`);
  return data.id;
}

async function ensureChildFolder(
  parentId: string,
  childName: string,
): Promise<string> {
  const key = `${parentId}/${childName}`;
  const cached = folderCache.get(key);
  if (cached) return cached;
  const existing = await findFolderByName(childName, parentId);
  const id = existing ?? (await createFolder(childName, parentId));
  folderCache.set(key, id);
  return id;
}

export async function ensureRootFolder(): Promise<string> {
  const rootId = envOrThrow("GOOGLE_DRIVE_ROOT_FOLDER_ID");
  if (rootId === "." || rootId === "/") {
    throw new Error(
      "GOOGLE_DRIVE_ROOT_FOLDER_ID is invalid. Set it to a real Drive folder ID.",
    );
  }
  return rootId;
}

export async function ensureUserFolder(userId: string): Promise<string> {
  const root = await ensureRootFolder();
  return ensureChildFolder(root, userId);
}

export async function ensureKindFolder(
  userId: string,
  kind: UploadKind,
): Promise<string> {
  const userFolder = await ensureUserFolder(userId);
  return ensureChildFolder(userFolder, kind);
}

function buildMultipartBody(
  metadata: { name: string; parents: string[]; mimeType: string },
  payload: Buffer,
  contentType: string,
): { body: Buffer; boundary: string } {
  const boundary = `drive-upload-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const preamble =
    `--${boundary}\r\n` +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${contentType}\r\n\r\n`;
  const closing = `\r\n--${boundary}--`;
  const body = Buffer.concat([
    Buffer.from(preamble, "utf8"),
    payload,
    Buffer.from(closing, "utf8"),
  ]);
  return { body, boundary };
}

async function uploadBinaryFile(args: {
  parentId: string;
  filename: string;
  mimeType: string;
  payload: Buffer;
}): Promise<{ id: string }> {
  const token = await getAccessToken();
  const metadata = {
    name: args.filename,
    parents: [args.parentId],
    mimeType: args.mimeType,
  };
  const { body, boundary } = buildMultipartBody(
    metadata,
    args.payload,
    args.mimeType,
  );
  const res = await fetch(
    `${DRIVE_UPLOAD_ENDPOINT}&supportsAllDrives=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Drive upload failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { id?: string };
  if (!data.id) throw new Error("Drive upload response missing file id");
  return { id: data.id };
}

export async function makeFilePublic(fileId: string): Promise<void> {
  await driveRequest(
    `/files/${encodeURIComponent(fileId)}/permissions?supportsAllDrives=true`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
      }),
    },
  );
}

export function toViewUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`;
}

export async function uploadImageToDrive(args: {
  userId: string;
  kind: UploadKind;
  payload: Buffer;
  mimeType: string;
  filename: string;
}): Promise<{ fileId: string; url: string }> {
  const folderId = await ensureKindFolder(args.userId, args.kind);
  const uploaded = await uploadBinaryFile({
    parentId: folderId,
    filename: args.filename,
    mimeType: args.mimeType,
    payload: args.payload,
  });
  await makeFilePublic(uploaded.id);
  return { fileId: uploaded.id, url: toViewUrl(uploaded.id) };
}
