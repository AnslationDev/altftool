import { settingsData, isValidPlatform, getSettingById, parseCategoryActiveId, categoryActiveId } from "./settingData";
import { getDeviceById } from "./deviceTaxonomy";
import { ALL_DEVICE_SETTINGS, getDeviceSettingById } from "./devices";
import { getAiToolById } from "./aiTools";
import { getCategoryById } from "./categories";

/**
 * Single source of truth for the Support Settings URL scheme, used by both
 * the [...slug] route (server side, to turn a URL into the activeId
 * SupportClient should open) and SupportClient itself (client side, to turn
 * activeId back into a URL whenever the visitor navigates inside the app).
 * Keeping both directions in one file means there is exactly one place that
 * defines "what a Support Settings URL looks like" — nothing elsewhere
 * needs to know or guess the shape.
 *
 * The scheme, all rooted at /supportsetting:
 *   /supportsetting                              -> home
 *   /supportsetting/{platform}                    -> home, previewing that OS
 *   /supportsetting/{platform}/category/{categoryId} -> that OS's category hub page (all
 *                                                        settings in that category, grouped —
 *                                                        the native-Settings-app-style view)
 *   /supportsetting/{platform}/{settingId}         -> one Windows/macOS/Android/iOS setting
 *   /supportsetting/{deviceId}                     -> a device's landing page (e.g. /ipad)
 *   /supportsetting/{deviceId}/{settingId}         -> one device-specific setting guide
 *   /supportsetting/help/{topic}                   -> a Help & Tools utility page
 *   /supportsetting/ai-tools/{tool}                -> an AI Tools detail page
 *
 * The OS/device name always leads the path (the "top" segment) because
 * every setting object — OS or device — already carries a `.platform`
 * field holding exactly that: an OS key ("windows") for the four primary
 * platforms, or a device id ("ipad", "xbox", ...) for everything else. That
 * field is the only thing this module needs to build a correct link for
 * any setting, and it's also what makes the mapping trivially total: no id
 * needs a hand-maintained URL entry anywhere.
 */

const UTIL_TITLES = {
  "util-troubleshooting": "Troubleshooting",
  "util-faq": "FAQ & Help",
  "util-device": "Device Info & Diagnostics",
  "util-contact": "Contact & Feedback",
};

function findOsSetting(id) {
  return settingsData.find((setting) => setting.id === id) || null;
}

function findDeviceSetting(id) {
  return ALL_DEVICE_SETTINGS.find((setting) => setting.id === id) || null;
}

/** activeId -> URL path segments (excluding the /supportsetting base). */
export function activeIdToSegments(activeId) {
  if (!activeId) return [];

  if (activeId.startsWith("util-")) return ["help", activeId.slice("util-".length)];
  if (activeId.startsWith("ai-")) return ["ai-tools", activeId.slice("ai-".length)];
  if (activeId.startsWith("device-")) return [activeId.slice("device-".length)];

  const category = parseCategoryActiveId(activeId);
  if (category) return [category.platform, "category", category.categoryId];

  const osSetting = findOsSetting(activeId);
  if (osSetting) return [osSetting.platform, osSetting.id];

  const deviceSetting = findDeviceSetting(activeId);
  if (deviceSetting) return [deviceSetting.platform, deviceSetting.id];

  // Unrecognized id — fail safe to home rather than link to a page that
  // doesn't exist.
  return [];
}

export function segmentsToPath(segments) {
  return segments.length ? `/supportsetting/${segments.join("/")}` : "/supportsetting";
}

/** activeId -> full path, e.g. "windows-update" -> "/supportsetting/windows/windows-update". */
export function activeIdToPath(activeId) {
  return segmentsToPath(activeIdToSegments(activeId));
}

/**
 * URL slug array (from the [...slug] catch-all) -> what SupportClient needs
 * to open the right thing: the activeId to show, and — only for a primary
 * OS setting, since SettingsContent resolves OS settings against whatever
 * platform is currently active — the platform that must be previewed for
 * that activeId to actually resolve instead of silently falling back home.
 *
 * Every branch fails safe: an unrecognized platform/device/setting/topic
 * never throws or 404s, it just resolves to the closest sensible page
 * (that device's landing page, or home), consistent with the rest of this
 * app never showing a dead end.
 */
export function resolveSlug(slug) {
  const parts = Array.isArray(slug) ? slug.filter(Boolean) : [];
  if (parts.length === 0) return { activeId: null, platformOverride: null };

  const [first, second, third] = parts;

  if (first === "help") {
    const id = second ? `util-${second}` : null;
    return { activeId: id && UTIL_TITLES[id] ? id : null, platformOverride: null };
  }

  if (first === "ai-tools") {
    const tool = second ? getAiToolById(`ai-${second}`) : null;
    return { activeId: tool ? tool.id : null, platformOverride: null };
  }

  if (isValidPlatform(first)) {
    if (!second) return { activeId: null, platformOverride: first };
    if (second === "category") {
      const category = third ? getCategoryById(third) : null;
      return { activeId: category ? categoryActiveId(first, third) : null, platformOverride: first };
    }
    const setting = getSettingById(first, second);
    return { activeId: setting ? setting.id : null, platformOverride: first };
  }

  const device = getDeviceById(first);
  if (device) {
    if (!second) return { activeId: `device-${first}`, platformOverride: null };
    const setting = getDeviceSettingById(first, second);
    return { activeId: setting ? setting.id : `device-${first}`, platformOverride: null };
  }

  return { activeId: null, platformOverride: null };
}

/** Best-effort title/description for generateMetadata on the slug route. */
export function describeSlug(slug) {
  const { activeId } = resolveSlug(slug);
  const base = "Support Settings";
  const baseDescription =
    "Access AltFTool settings and support. Manage your preferences, permissions, system options, and find help or troubleshooting guides for tools and features.";

  if (!activeId) {
    const parts = Array.isArray(slug) ? slug.filter(Boolean) : [];
    const device = parts[0] ? getDeviceById(parts[0]) : null;
    if (device) {
      return {
        title: `${device.name} Support — ${base} | AltFTool`,
        description: `Browse support settings and guides for ${device.name}.`,
      };
    }
    return { title: `${base} – Manage Preferences | AltFTool`, description: baseDescription };
  }

  if (activeId.startsWith("util-")) {
    const title = UTIL_TITLES[activeId] || "Help & Tools";
    return { title: `${title} — ${base} | AltFTool`, description: baseDescription };
  }

  if (activeId.startsWith("ai-")) {
    const tool = getAiToolById(activeId);
    return {
      title: `${tool?.name || "AI Tool"} — ${base} | AltFTool`,
      description: tool?.tagline || baseDescription,
    };
  }

  const categoryRef = parseCategoryActiveId(activeId);
  if (categoryRef) {
    const category = getCategoryById(categoryRef.categoryId);
    return {
      title: `${category?.label || "Settings"} — ${base} | AltFTool`,
      description: category?.description || baseDescription,
    };
  }

  const osSetting = findOsSetting(activeId);
  if (osSetting) {
    return {
      title: `${osSetting.title} — ${base} | AltFTool`,
      description: osSetting.description || baseDescription,
    };
  }

  const deviceSetting = findDeviceSetting(activeId);
  if (deviceSetting) {
    const device = getDeviceById(deviceSetting.platform);
    return {
      title: `${deviceSetting.title} — ${device?.name || ""} ${base} | AltFTool`,
      description: deviceSetting.description || baseDescription,
    };
  }

  return { title: `${base} – Manage Preferences | AltFTool`, description: baseDescription };
}
