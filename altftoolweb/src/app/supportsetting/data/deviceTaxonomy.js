import {
  Monitor,
  Laptop,
  Smartphone,
  Tablet,
  Watch,
  Tv,
  Gamepad2,
  Headphones,
  Speaker,
  Mouse,
  Keyboard,
  Webcam,
  Printer,
  Bot,
  Terminal,
  Mic,
  Cable,
  Cpu,
  Sparkles,
} from "lucide-react";

/**
 * The full device taxonomy this module is designed to scale to. Adding a
 * new device later is a 6-line object appended to DEVICES below — nothing
 * about the navigation, selector, search index, or layout needs to change.
 *
 * Two devices matter differently:
 *  - `status: "available"` + `hasGuides: true`  -> real, authored guides
 *    exist (see data/devices/*.js) and the device gets its own mini
 *    Support Settings experience, reusing the exact same SettingDetailPage
 *    used for Windows/macOS/Android/iOS.
 *  - `status: "coming-soon"`                    -> the device is fully
 *    wired into navigation, search, and the selector, but shows an honest
 *    "guides are on the way" state instead of a broken link or a page that
 *    doesn't exist. Nothing here is a dead end.
 *
 * Windows/macOS/Android/iOS (`isPrimaryOS: true`) are untouched — they
 * still drive `usePlatform()` and the full existing settings catalog
 * exactly as before. Every other device is purely additive.
 */
export const DEVICE_GROUPS = [
  { id: "computers", label: "Computers", icon: Monitor },
  { id: "phones", label: "Phones", icon: Smartphone },
  { id: "tablets", label: "Tablets", icon: Tablet },
  { id: "watches", label: "Smart Watches", icon: Watch },
  { id: "tvs", label: "Smart TVs", icon: Tv },
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
  { id: "accessories", label: "Accessories", icon: Headphones },
  { id: "ai-devices", label: "AI Devices", icon: Cpu },
  { id: "ai-tools", label: "AI Tools", icon: Bot },
];

export const DEVICES = [
  // ── Computers ────────────────────────────────────────────────────────
  { id: "windows", name: "Windows", shortName: "Windows", group: "computers", icon: Monitor, color: "#0078D4", status: "available", isPrimaryOS: true, officialDocsUrl: "https://support.microsoft.com/windows" },
  { id: "macos", name: "macOS", shortName: "macOS", group: "computers", icon: Laptop, color: "#555555", status: "available", isPrimaryOS: true, officialDocsUrl: "https://support.apple.com/macos" },
  { id: "linux", name: "Linux", shortName: "Linux", group: "computers", icon: Terminal, color: "#F0A500", status: "available", hasGuides: true, officialDocsUrl: "https://www.kernel.org/doc/html/latest/" },

  // ── Phones ───────────────────────────────────────────────────────────
  { id: "android", name: "Android", shortName: "Android", group: "phones", icon: Bot, color: "#3DDC84", status: "available", isPrimaryOS: true, officialDocsUrl: "https://support.google.com/android" },
  { id: "ios", name: "iPhone", shortName: "iPhone", group: "phones", icon: Smartphone, color: "#0A84FF", status: "available", isPrimaryOS: true, officialDocsUrl: "https://support.apple.com/iphone" },

  // ── Tablets ──────────────────────────────────────────────────────────
  { id: "ipad", name: "iPad", shortName: "iPad", group: "tablets", icon: Tablet, color: "#0A84FF", status: "available", hasGuides: true, officialDocsUrl: "https://support.apple.com/ipad" },
  { id: "android-tablet", name: "Android Tablet", shortName: "Android Tablet", group: "tablets", icon: Tablet, color: "#3DDC84", status: "available", hasGuides: true, officialDocsUrl: "https://support.google.com/android" },
  { id: "windows-tablet", name: "Windows Tablet", shortName: "Win Tablet", group: "tablets", icon: Tablet, color: "#0078D4", status: "available", hasGuides: true, officialDocsUrl: "https://support.microsoft.com/windows" },

  // ── Smart Watches ────────────────────────────────────────────────────
  { id: "apple-watch", name: "Apple Watch", shortName: "Apple Watch", group: "watches", icon: Watch, color: "#0A84FF", status: "available", hasGuides: true, officialDocsUrl: "https://support.apple.com/apple-watch" },
  { id: "galaxy-watch", name: "Galaxy Watch", shortName: "Galaxy Watch", group: "watches", icon: Watch, color: "#1428A0", status: "available", hasGuides: true, officialDocsUrl: "https://www.samsung.com/support/mobile-devices/" },
  { id: "wear-os", name: "Wear OS", shortName: "Wear OS", group: "watches", icon: Watch, color: "#3DDC84", status: "available", hasGuides: true, officialDocsUrl: "https://support.google.com/wearos" },

  // ── Smart TVs ────────────────────────────────────────────────────────
  { id: "android-tv", name: "Android TV", shortName: "Android TV", group: "tvs", icon: Tv, color: "#3DDC84", status: "available", hasGuides: true, officialDocsUrl: "https://support.google.com/androidtv" },
  { id: "google-tv", name: "Google TV", shortName: "Google TV", group: "tvs", icon: Tv, color: "#4285F4", status: "available", hasGuides: true, officialDocsUrl: "https://support.google.com/googletv" },
  { id: "apple-tv", name: "Apple TV", shortName: "Apple TV", group: "tvs", icon: Tv, color: "#555555", status: "available", hasGuides: true, officialDocsUrl: "https://support.apple.com/apple-tv" },
  { id: "samsung-tizen", name: "Samsung Tizen", shortName: "Tizen", group: "tvs", icon: Tv, color: "#1428A0", status: "available", hasGuides: true, officialDocsUrl: "https://www.samsung.com/support/tv-audio-video/" },
  { id: "lg-webos", name: "LG webOS", shortName: "webOS", group: "tvs", icon: Tv, color: "#A50034", status: "available", hasGuides: true, officialDocsUrl: "https://www.lg.com/support" },

  // ── Gaming ───────────────────────────────────────────────────────────
  { id: "playstation", name: "PlayStation", shortName: "PlayStation", group: "gaming", icon: Gamepad2, color: "#003791", status: "available", hasGuides: true, officialDocsUrl: "https://www.playstation.com/support/" },
  { id: "xbox", name: "Xbox", shortName: "Xbox", group: "gaming", icon: Gamepad2, color: "#107C10", status: "available", hasGuides: true, officialDocsUrl: "https://support.xbox.com" },
  { id: "nintendo-switch", name: "Nintendo Switch", shortName: "Switch", group: "gaming", icon: Gamepad2, color: "#E60012", status: "available", hasGuides: true, officialDocsUrl: "https://www.nintendo.com/en-gb/Support/" },
  { id: "steam-deck", name: "Steam Deck", shortName: "Steam Deck", group: "gaming", icon: Gamepad2, color: "#1B2838", status: "available", hasGuides: true, officialDocsUrl: "https://help.steampowered.com" },

  // ── Accessories ──────────────────────────────────────────────────────
  { id: "airpods", name: "AirPods", shortName: "AirPods", group: "accessories", icon: Headphones, color: "#555555", status: "available", hasGuides: true, officialDocsUrl: "https://support.apple.com/airpods" },
  { id: "galaxy-buds", name: "Galaxy Buds", shortName: "Galaxy Buds", group: "accessories", icon: Headphones, color: "#1428A0", status: "available", hasGuides: true, officialDocsUrl: "https://www.samsung.com/support/mobile-devices/" },
  { id: "bluetooth-speakers", name: "Bluetooth Speakers", shortName: "BT Speakers", group: "accessories", icon: Speaker, color: "#6B7280", status: "available", hasGuides: true, officialDocsUrl: "https://support.microsoft.com/windows" },
  { id: "mouse", name: "Mouse", shortName: "Mouse", group: "accessories", icon: Mouse, color: "#6B7280", status: "available", hasGuides: true, officialDocsUrl: "https://support.microsoft.com/windows" },
  { id: "keyboard", name: "Keyboard", shortName: "Keyboard", group: "accessories", icon: Keyboard, color: "#6B7280", status: "available", hasGuides: true, officialDocsUrl: "https://support.microsoft.com/windows" },
  { id: "webcam", name: "Webcam", shortName: "Webcam", group: "accessories", icon: Webcam, color: "#6B7280", status: "available", hasGuides: true, officialDocsUrl: "https://support.microsoft.com/windows" },
  { id: "printer", name: "Printer", shortName: "Printer", group: "accessories", icon: Printer, color: "#6B7280", status: "available", hasGuides: true, officialDocsUrl: "https://support.microsoft.com/windows" },
  { id: "microphone", name: "Microphone", shortName: "Microphone", group: "accessories", icon: Mic, color: "#6B7280", status: "available", hasGuides: true, officialDocsUrl: "https://support.microsoft.com/windows" },
  { id: "external-monitor", name: "External Monitor", shortName: "Monitor", group: "accessories", icon: Monitor, color: "#6B7280", status: "available", hasGuides: true, officialDocsUrl: "https://support.microsoft.com/windows" },
  { id: "docking-station", name: "Docking Station", shortName: "Dock", group: "accessories", icon: Cable, color: "#6B7280", status: "available", hasGuides: true, officialDocsUrl: "https://support.microsoft.com/windows" },

  // ── AI Devices (future-ready) ───────────────────────────────────────────
  { id: "rabbit-r1", name: "Rabbit R1", shortName: "Rabbit R1", group: "ai-devices", icon: Sparkles, color: "#FF4B26", status: "available", hasGuides: true, officialDocsUrl: "https://www.rabbit.tech/support" },
  { id: "humane-ai-pin", name: "Humane AI Pin", shortName: "AI Pin", group: "ai-devices", icon: Sparkles, color: "#6B7280", status: "available", hasGuides: true, officialDocsUrl: "https://humane.com/support" },
];

export const DEVICE_MAP = DEVICES.reduce((map, device) => {
  map[device.id] = device;
  return map;
}, {});

export const PRIMARY_OS_ORDER = DEVICES.filter((d) => d.isPrimaryOS).map((d) => d.id);

export function getDeviceById(id) {
  return DEVICE_MAP[id] || null;
}

export function getDevicesByGroup(groupId) {
  return DEVICES.filter((device) => device.group === groupId);
}

/** Devices eligible for the "More Devices" picker — everything except the
 * four primary OS platforms. Windows/macOS/Android/iOS already have their
 * own always-visible pills in PlatformSwitcher; repeating them inside the
 * picker would just be confusing duplication. This is the single place
 * that rule lives, so the picker, its search, and its category grouping
 * all stay in sync automatically as new devices are added. */
export function getPickerDevices() {
  return DEVICES.filter((device) => !device.isPrimaryOS);
}

export function getPickerDevicesByGroup(groupId) {
  return getPickerDevices().filter((device) => device.group === groupId);
}

/** Same idea as getGroupsWithDevices, scoped to picker-eligible devices —
 * a group with only primary-OS entries (e.g. Phones, before Android/iPhone
 * are filtered out) simply won't appear. */
export function getPickerGroups() {
  const present = new Set(getPickerDevices().map((device) => device.group));
  return DEVICE_GROUPS.filter((group) => present.has(group.id));
}

/** Groups with at least one device, in canonical DEVICE_GROUPS order — the
 * device picker never renders an empty category. Note: "ai-tools" (the
 * software list — ChatGPT, Claude, etc.) is a separate catalog from this
 * DEVICES array entirely (see data/aiTools.js) and never has a matching
 * `group`, so it's naturally excluded here rather than special-cased. */
export function getGroupsWithDevices() {
  const present = new Set(DEVICES.map((d) => d.group));
  return DEVICE_GROUPS.filter((group) => present.has(group.id));
}

// ── Honest, generic hero metadata ───────────────────────────────────────
// The legacy Windows/macOS/Android/iOS catalog (700+ hand-authored entries
// across four very large files) doesn't carry explicit difficulty/time-
// estimate/supported-version fields, and retrofitting hundreds of entries
// with real values isn't something that can be verified in bulk. Rather
// than fabricate per-setting specifics, these are computed from what the
// setting object already honestly contains, and every UI that reads them
// prefers an explicit field on the object itself first (used by the new
// example device guides below) before falling back to this estimate.
export function estimateDifficulty(setting) {
  if (setting?.difficulty) return setting.difficulty;
  const stepCount = setting?.afterImageContent?.steps?.length || 0;
  const issueCount = setting?.commonIssues?.length || 0;
  if (stepCount >= 6 || issueCount >= 3) return "Intermediate";
  if (stepCount >= 3) return "Easy";
  return "Beginner-friendly";
}

export function estimateReadingTime(setting) {
  if (setting?.estimatedTime) return setting.estimatedTime;
  const words =
    [
      setting?.description,
      setting?.whyItMatters,
      ...(setting?.details || []),
      ...(setting?.bestPractices || []),
      ...(setting?.afterImageContent?.paragraphs || []),
      ...(setting?.afterImageContent?.steps || []),
    ]
      .filter(Boolean)
      .join(" ")
      .split(/\s+/).length || 0;
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} min read`;
}

export const SUPPORTED_VERSIONS = {
  windows: "Windows 10 & 11",
  macos: "macOS Ventura and later",
  android: "Android 12 and later",
  ios: "iOS 16 and later",
};

export function estimateSupportedVersions(setting, platform) {
  return setting?.supportedVersions || SUPPORTED_VERSIONS[platform] || "Current release";
}
