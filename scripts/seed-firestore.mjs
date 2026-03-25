import admin from "firebase-admin";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function normalizePrivateKey(raw) {
  let k = (raw ?? "").trim();
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1);
  }
  return k.replace(/\\n/g, "\n");
}

function initAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim() ?? "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim() ?? "";
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY ?? "");

  const missing = [];
  if (!projectId) missing.push("FIREBASE_PROJECT_ID");
  if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
  if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Missing env: ${missing.join(", ")} (same as server; load .env.local before running this script).`,
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

async function main() {
  initAdmin();
  const db = admin.firestore();

  const sitePath = path.join(root, "src", "data", "site-defaults.json");
  const siteJson = JSON.parse(fs.readFileSync(sitePath, "utf8"));
  await db
    .collection("config")
    .doc("site")
    .set({
      json: siteJson,
      updatedAt: new Date().toISOString(),
    });
  console.log("Seeded config/site");

  const contentDir = path.join(root, "content");
  if (!fs.existsSync(contentDir)) {
    console.log("No content/ directory; skipping posts.");
    return;
  }

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));
  for (const file of files) {
    const slug = path.basename(file, ".mdx");
    const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
    const { data, content } = matter(raw);
    await db
      .collection("posts")
      .doc(slug)
      .set({
        title: data.title ?? "",
        publishedAt: data.publishedAt ?? "",
        summary: data.summary ?? "",
        ...(data.image ? { image: data.image } : {}),
        mdx: content.trim(),
        updatedAt: new Date().toISOString(),
      });
    console.log("Seeded post:", slug);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
