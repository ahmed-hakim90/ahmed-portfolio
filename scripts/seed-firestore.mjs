import admin from "firebase-admin";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function initAdmin() {
  const jsonPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const jsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (jsonPath) {
    const resolved = path.isAbsolute(jsonPath)
      ? jsonPath
      : path.join(root, jsonPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Service account file not found: ${resolved}`);
    }
    const sa = JSON.parse(fs.readFileSync(resolved, "utf8"));
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return;
  }
  if (jsonRaw) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(jsonRaw)),
    });
    return;
  }
  throw new Error(
    "Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON",
  );
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
