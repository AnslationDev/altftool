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
