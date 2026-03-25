/**
 * Semver + short git SHA, baked in at `next build` / dev start via `next.config.mjs`.
 * On Vercel, `VERCEL_GIT_COMMIT_SHA` updates on every deploy.
 */
export function getPublicBuildLabel(): string {
  const version = process.env.NEXT_PUBLIC_APP_VERSION?.trim() ?? "";
  const sha = process.env.NEXT_PUBLIC_BUILD_SHA?.trim() ?? "";
  const parts: string[] = [];
  if (version) parts.push(`v${version}`);
  if (sha) parts.push(sha);
  return parts.join(" · ");
}
