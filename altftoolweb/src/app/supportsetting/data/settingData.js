import { windowsSettings } from "./platforms/windows";
import { macosSettings } from "./platforms/macos";
import { androidSettings } from "./platforms/android";
import { iosSettings } from "./platforms/ios";
import { CATEGORIES } from "./categories";

// Backward-compatible flat export — anything that previously imported
// `settingsData` (e.g. an old bookmark, a search index) keeps working.
export const settingsData = [
  ...windowsSettings,
  ...macosSettings,
  ...androidSettings,
  ...iosSettings,
];

export const SETTINGS_BY_PLATFORM = {
  windows: windowsSettings,
  macos: macosSettings,
  android: androidSettings,
  ios: iosSettings,
};

const VALID_PLATFORMS = Object.keys(SETTINGS_BY_PLATFORM);

export function isValidPlatform(platform) {
  return VALID_PLATFORMS.includes(platform);
}

// Every OS-aware view in the app should go through this instead of reading
// settingsData directly, so unknown/undetected platforms fail safe to
// Windows (the platform this page originally supported) rather than
// showing nothing.
//
// Settings are also sorted so the most commonly used ones surface at the
// top of the flat sidebar list, with everything else following in the
// order it was authored (Array.prototype.sort is a stable sort, so ties
// never get reshuffled) — this is what keeps a 40+ item flat nav feeling
// like a real OS settings app instead of an alphabetical dump.
export function getSettingsForPlatform(platform) {
  const settings = SETTINGS_BY_PLATFORM[platform] || SETTINGS_BY_PLATFORM.windows;
  return [...settings].sort((a, b) => (b.frequentlyUsed ? 1 : 0) - (a.frequentlyUsed ? 1 : 0));
}

export function getSettingById(platform, id) {
  return getSettingsForPlatform(platform).find((setting) => setting.id === id) || null;
}

export function getFrequentlyUsed(platform) {
  return getSettingsForPlatform(platform).filter((setting) => setting.frequentlyUsed);
}

export function getRecommended(platform) {
  return getSettingsForPlatform(platform).filter((setting) => setting.recommended);
}

// Only returns categories that actually have >=1 setting for this platform,
// in the canonical CATEGORIES order — so a platform with lighter coverage
// never shows an empty section.
export function getCategoriesForPlatform(platform) {
  const settings = getSettingsForPlatform(platform);
  const presentIds = new Set(settings.map((setting) => setting.category));
  return CATEGORIES.filter((category) => presentIds.has(category.id));
}

export function getSettingsForCategory(platform, categoryId) {
  return getSettingsForPlatform(platform).filter(
    (setting) => setting.category === categoryId,
  );
}

// activeId scheme for a category hub page — "cat-{platform}-{categoryId}",
// e.g. "cat-windows-connectivity-network". The platform is embedded in the
// id itself (same convention device settings already use via `.platform`)
// rather than always trusting whatever platform happens to be active when
// the id is read, so a category hub page renders correctly even mid-
// platform-switch or on a fresh deep link, before platformState settles.
// A platform id never itself contains a "-" (windows/macos/android/ios),
// so splitting on the first "-" cleanly separates it from the category id,
// which does contain dashes (e.g. "accounts-sync-family").
export function parseCategoryActiveId(activeId) {
  if (typeof activeId !== "string" || !activeId.startsWith("cat-")) return null;
  const rest = activeId.slice("cat-".length);
  const dashIndex = rest.indexOf("-");
  if (dashIndex === -1) return null;
  const platform = rest.slice(0, dashIndex);
  const categoryId = rest.slice(dashIndex + 1);
  if (!isValidPlatform(platform) || !categoryId) return null;
  return { platform, categoryId };
}

export function categoryActiveId(platform, categoryId) {
  return `cat-${platform}-${categoryId}`;
}

export function searchSettings(platform, query) {
  const trimmed = (query || "").trim().toLowerCase();
  if (!trimmed) return [];

  return getSettingsForPlatform(platform).filter((setting) => {
    const haystack = [
      setting.title,
      setting.heading,
      setting.description,
      ...(setting.details || []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(trimmed);
  });
}
