#!/usr/bin/env node
/**
 * Appends a push entry to CHANGELOG_PUSHES.md (for CI) or prints when DRY_RUN=1.
 * Intended to run on every push via .github/workflows/changelog-log.yml
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outFile = path.join(root, "CHANGELOG_PUSHES.md");

const dry =
  process.env.DRY_RUN === "1" ||
  process.env.DRY_RUN === "true" ||
  process.argv.includes("--dry");

function git(args) {
  try {
    return execSync(args, {
      encoding: "utf8",
      cwd: root,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

const shaFull = process.env.GITHUB_SHA || git("git rev-parse HEAD");
const sha = (shaFull || "local").slice(0, 7);
const ref =
  process.env.GITHUB_REF_NAME ||
  process.env.GITHUB_REF?.replace(/^refs\/heads\//, "") ||
  git("git rev-parse --abbrev-ref HEAD") ||
  "unknown";

const subject = git('git log -1 --pretty=format:%s') || "(no subject)";
const body = git('git log -1 --pretty=format:%b') || "";
const author = git('git log -1 --pretty=format:%an <%ae>') || "";

let files = [];
try {
  files = git("git diff-tree --no-commit-id --name-only -r HEAD")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
} catch {
  files = [];
}

const iso = new Date().toISOString();

let block = `### ${iso} · \`${ref}\` · [\`${sha}\`](https://github.com/${process.env.GITHUB_REPOSITORY || "repo"}/commit/${shaFull || sha})\n`;
block += `- **${subject.replace(/\n/g, " ")}**\n`;
if (author) {
  block += `- ${author}\n`;
}
if (body && body.trim()) {
  block += `\n\`\`\`\n${body.trim()}\n\`\`\`\n`;
}
if (files.length) {
  block += "\n**ملفات:**\n\n";
  for (const f of files.slice(0, 80)) {
    block += `- \`${f}\`\n`;
  }
  if (files.length > 80) {
    block += `\n_… و${files.length - 80} ملفاً آخر_\n`;
  }
}
block += "\n---\n\n";

if (dry) {
  process.stdout.write(block);
  process.exit(0);
}

const header = `# سجل الدفعات (تلقائي)

يُحدَّث هذا الملف تلقائياً عند كل push إلى الفرع المفعّل في GitHub Actions.
للملخص البشري والإصدارات راجع [CHANGELOG.md](./CHANGELOG.md).

`;

if (!fs.existsSync(outFile)) {
  fs.writeFileSync(outFile, header, "utf8");
}

const existing = fs.readFileSync(outFile, "utf8");
if (existing.includes(`· [\`${sha}\`](`)) {
  process.stderr.write(
    `append-push-changelog: entry for ${sha} already present; skipping.\n`,
  );
  process.exit(0);
}

fs.appendFileSync(outFile, block, "utf8");
process.stdout.write(`Appended push log for ${sha} to CHANGELOG_PUSHES.md\n`);
