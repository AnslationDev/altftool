import {
  RefreshCw,
  ShieldCheck,
  Wifi,
  Monitor,
  Database,
  Users,
  Accessibility,
  LifeBuoy,
  Palette,
  Mouse,
  AppWindow,
  Info,
} from "lucide-react";

/**
 * The category taxonomy used across every platform's Support Settings.
 * A category is only rendered on a given platform if at least one setting
 * for that platform belongs to it — see getCategoriesForPlatform() in
 * settingData.js. This keeps the page honest: no empty category sections.
 */
// `label` is deliberately short — one or two words, matching how a native
// Settings app names its own sidebar items (Windows: "System", "Apps",
// "Accessibility" ...) even though each of ours groups several related
// settings, not just one. This is purely a display string: `id` (used for
// routing/activeId/breadcrumb matching everywhere else) is unchanged, so
// shortening `label` here is safe and applies to every platform and
// device automatically since this taxonomy is shared across all of them.
// `color` is a per-category accent used only for icon badges in content-area
// lists (Recommended, Popular Settings, category hub rows, Related
// Settings) — matching how native Settings apps give each category area
// its own distinct icon color instead of one repeated brand color. It is
// NOT used in the left nav sidebar, which stays monochrome to match native
// sidebar conventions (Windows/macOS/Android/iOS sidebars don't color-code
// their nav icons either). See `--category-accent` in supportsetting.css.
export const CATEGORIES = [
  {
    id: "system-updates",
    label: "System",
    icon: RefreshCw,
    description: "Keep your device current and configure core system behavior.",
    color: "#2563EB",
  },
  {
    id: "privacy-permissions",
    label: "Privacy & Security",
    icon: ShieldCheck,
    description: "Control which apps can access your camera, microphone, and data.",
    color: "#16A34A",
  },
  {
    id: "connectivity-network",
    label: "Network & Internet",
    icon: Wifi,
    description: "Wi-Fi, Bluetooth, and network connection settings.",
    color: "#0284C7",
  },
  {
    id: "display-sound-notifications",
    label: "Display & Sound",
    icon: Monitor,
    description: "Screen, audio, and alert preferences.",
    color: "#7C3AED",
  },
  {
    id: "storage-backup-data",
    label: "Storage & Backup",
    icon: Database,
    description: "Manage space, back up your data, and stay protected against loss.",
    color: "#EA580C",
  },
  {
    id: "accounts-sync-family",
    label: "Accounts & Family",
    icon: Users,
    description: "Account sign-in, sync, and family/parental controls.",
    color: "#C026D3",
  },
  {
    id: "accessibility-language",
    label: "Accessibility",
    icon: Accessibility,
    description: "Assistive features, input, and language & region settings.",
    color: "#0891B2",
  },
  {
    id: "troubleshooting-diagnostics",
    label: "Troubleshooting",
    icon: LifeBuoy,
    description: "Reset, restart, and diagnose common issues.",
    color: "#DC2626",
  },
  {
    id: "personalization",
    label: "Personalization",
    icon: Palette,
    description: "Themes, wallpaper, lock screen, and layout of your device.",
    color: "#DB2777",
  },
  {
    id: "devices-peripherals",
    label: "Devices",
    icon: Mouse,
    description: "Mice, keyboards, trackpads, printers, and other connected hardware.",
    color: "#059669",
  },
  {
    id: "apps-features",
    label: "Apps",
    icon: AppWindow,
    description: "Installed apps, optional features, and what runs on startup.",
    color: "#CA8A04",
  },
  {
    id: "system-info",
    label: "System Info",
    icon: Info,
    description: "Device details, advanced settings, and activation status.",
    color: "#64748B",
  },
];

export const CATEGORY_MAP = CATEGORIES.reduce((map, category) => {
  map[category.id] = category;
  return map;
}, {});

export function getCategoryById(id) {
  return CATEGORY_MAP[id] || null;
}
