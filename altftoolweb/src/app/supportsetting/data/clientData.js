import { CATEGORIES } from "./categories";

export const PLATFORM_LABEL = {
  windows: "Windows",
  macos: "macOS",
  android: "Android",
  ios: "iOS",
};

export const VALID_PLATFORMS = Object.keys(PLATFORM_LABEL);

const PLATFORM_LOADERS = {
  windows: () => import("./platforms/windows").then((module) => module.windowsSettings),
  macos: () => import("./platforms/macos").then((module) => module.macosSettings),
  android: () => import("./platforms/android").then((module) => module.androidSettings),
  ios: () => import("./platforms/ios").then((module) => module.iosSettings),
};

export function isValidPlatform(platform) {
  return VALID_PLATFORMS.includes(platform);
}

export function getSafePlatform(platform) {
  return isValidPlatform(platform) ? platform : "windows";
}

export function sortSettingsByFrequency(settings = []) {
  return [...settings].sort((a, b) => (b.frequentlyUsed ? 1 : 0) - (a.frequentlyUsed ? 1 : 0));
}

export async function loadSettingsForPlatform(platform) {
  const safePlatform = getSafePlatform(platform);
  const settings = await PLATFORM_LOADERS[safePlatform]();
  return sortSettingsByFrequency(settings);
}

export async function loadAllPlatformSettings() {
  const entries = await Promise.all(
    VALID_PLATFORMS.map(async (platform) => [platform, await loadSettingsForPlatform(platform)]),
  );
  return Object.fromEntries(entries);
}

export function getCategoriesForSettings(settings = []) {
  const presentIds = new Set(settings.map((setting) => setting.category));
  return CATEGORIES.filter((category) => presentIds.has(category.id));
}

export function getSettingsForCategoryFromSettings(settings = [], categoryId) {
  return settings.filter((setting) => setting.category === categoryId);
}

export function getFrequentlyUsedFromSettings(settings = []) {
  return settings.filter((setting) => setting.frequentlyUsed);
}

export function getRecommendedFromSettings(settings = []) {
  return settings.filter((setting) => setting.recommended);
}

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

export function activeIdToPathFromCatalog(activeId, { settings = [], deviceSettings = [] } = {}) {
  if (!activeId) return "/supportsetting";

  if (activeId.startsWith("util-")) return `/supportsetting/help/${activeId.slice("util-".length)}`;
  if (activeId.startsWith("ai-")) return `/supportsetting/ai-tools/${activeId.slice("ai-".length)}`;
  if (activeId.startsWith("device-")) return `/supportsetting/${activeId.slice("device-".length)}`;

  const category = parseCategoryActiveId(activeId);
  if (category) return `/supportsetting/${category.platform}/category/${category.categoryId}`;

  const setting = settings.find((item) => item.id === activeId) || deviceSettings.find((item) => item.id === activeId);
  if (setting?.platform) return `/supportsetting/${setting.platform}/${setting.id}`;

  const platformFromId = VALID_PLATFORMS.find((platform) => activeId.startsWith(`${platform}-`));
  if (platformFromId) return `/supportsetting/${platformFromId}/${activeId}`;

  return "/supportsetting";
}
