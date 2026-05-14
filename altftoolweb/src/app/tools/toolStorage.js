"use client";

export const FAVORITES_STORAGE_KEY = "ALTFT_TOOL_FAVORITES_V1";
export const RECENT_TOOLS_STORAGE_KEY = "ALTFT_RECENT_TOOLS_V1";
export const TOOL_STORAGE_EVENT = "altftool-tools-storage";
export const RECENT_LIMIT = 12;

export function readStoredSlugs(key) {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function writeStoredSlugs(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(TOOL_STORAGE_EVENT));
}

export function rememberRecentTool(slug, meta = {}) {
  if (!slug || !meta[slug]) return;

  const current = readStoredSlugs(RECENT_TOOLS_STORAGE_KEY);
  const next = [slug, ...current.filter((item) => item !== slug)]
    .filter((item) => meta[item])
    .slice(0, RECENT_LIMIT);

  writeStoredSlugs(RECENT_TOOLS_STORAGE_KEY, next);
}
