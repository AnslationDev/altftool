import { SETTINGS_BY_PLATFORM } from "./settingData";
import { ALL_DEVICE_SETTINGS } from "./devices";
import { TROUBLESHOOTING_TIPS } from "./troubleshootingTips";

const PLATFORM_LABEL = { windows: "Windows", macos: "macOS", android: "Android", ios: "iOS" };
const ALL_PLATFORMS = Object.keys(SETTINGS_BY_PLATFORM);

function matchesSetting(setting, query) {
  const haystack = [setting.title, setting.heading, setting.description, ...(setting.details || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function matchesAiTool(tool, query) {
  const haystack = [tool.name, tool.tagline, tool.overview?.whatIsIt].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(query);
}

/**
 * Support Settings search, widened to the whole ecosystem (settings, AI
 * tools, device guides, troubleshooting) instead of just setting names —
 * but still platform-aware: results for the platform you're actually on
 * come back as `primary`, and everything else is bucketed separately so a
 * Windows visitor searching "Bluetooth" sees Windows results first, with
 * "Other Platforms" available rather than mixed in above the fold.
 */
export function searchEverything(query, { platform } = {}) {
  const trimmed = (query || "").trim().toLowerCase();
  if (!trimmed) return { primary: [], otherPlatforms: [], devices: [], aiTools: [], help: [] };

  const primary = (SETTINGS_BY_PLATFORM[platform] || []).filter((s) => matchesSetting(s, trimmed));

  const otherPlatforms = ALL_PLATFORMS.filter((p) => p !== platform)
    .map((p) => ({
      platform: p,
      label: PLATFORM_LABEL[p],
      results: SETTINGS_BY_PLATFORM[p].filter((s) => matchesSetting(s, trimmed)),
    }))
    .filter((group) => group.results.length > 0);

  const devices = ALL_DEVICE_SETTINGS.filter((s) => matchesSetting(s, trimmed));

  const help = Object.entries(TROUBLESHOOTING_TIPS).flatMap(([tipPlatform, tips]) =>
    tips
      .filter((tip) => `${tip.issue} ${tip.tip}`.toLowerCase().includes(trimmed))
      .map((tip) => ({ ...tip, platform: tipPlatform })),
  );

  return { primary, otherPlatforms, devices, help };
}

export function searchAiTools(query, aiTools) {
  const trimmed = (query || "").trim().toLowerCase();
  if (!trimmed) return [];
  return (aiTools || []).filter((tool) => matchesAiTool(tool, trimmed));
}
