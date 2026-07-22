// Shared helper used by QuickActions/RecentlyUsed/RecommendedSettings/
// FaqShortcuts to jump to a specific setting card further down the page.
export function jumpToSetting(id) {
  if (typeof document === "undefined") return;
  const node = document.getElementById(`setting-${id}`);
  if (!node) return;

  node.scrollIntoView({ behavior: "smooth", block: "center" });
  node.classList.add("support-card-highlight");
  window.setTimeout(() => node.classList.remove("support-card-highlight"), 1600);
}
