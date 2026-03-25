/**
 * Converts a Google Drive file share URL to a direct-ish view URL suitable
 * for <img> / next/image when the file is shared as "Anyone with the link".
 */
export function googleDriveShareUrlToViewUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const filePath = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (filePath?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${filePath[1]}`;
  }

  const openId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openId?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${openId[1]}`;
  }

  return null;
}
