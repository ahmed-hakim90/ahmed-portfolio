/**
 * Smooth-scroll to a section on `/dashboard/site` and sync the URL hash.
 */
export function scrollToSiteEditorSection(hash: string): void {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!id) return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  window.history.replaceState(null, "", `/dashboard/site#${id}`);
}
