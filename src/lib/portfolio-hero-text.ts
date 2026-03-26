const DEFAULT_LEAD = "Hi, I'm";
const DEFAULT_EMOJI = "👋";

/**
 * Hero headline: `{lead} {firstName} {emoji}` with sensible spacing when parts are empty.
 * Missing keys (undefined) use defaults; explicit empty string omits that part.
 */
export function buildHeroGreetingLine(
  fullName: string,
  lead?: string | null,
  emoji?: string | null,
): string {
  const firstName = fullName.trim().split(/\s+/).filter(Boolean)[0] ?? "";
  const l =
    lead === undefined || lead === null ? DEFAULT_LEAD : lead.trim();
  const e =
    emoji === undefined || emoji === null ? DEFAULT_EMOJI : emoji.trim();
  const core = [l, firstName].filter(Boolean).join(" ");
  return e ? `${core} ${e}`.trim() : core;
}
