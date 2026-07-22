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
export const CATEGORIES = [
  {
    id: "system-updates",
    label: "System & Updates",
    icon: RefreshCw,
    description: "Keep your device current and configure core system behavior.",
  },
  {
    id: "privacy-permissions",
    label: "Privacy & Permissions",
    icon: ShieldCheck,
    description: "Control which apps can access your camera, microphone, and data.",
  },
  {
    id: "connectivity-network",
    label: "Connectivity & Network",
    icon: Wifi,
    description: "Wi-Fi, Bluetooth, and network connection settings.",
  },
  {
    id: "display-sound-notifications",
    label: "Display, Sound & Notifications",
    icon: Monitor,
    description: "Screen, audio, and alert preferences.",
  },
  {
    id: "storage-backup-data",
    label: "Storage, Backup & Data",
    icon: Database,
    description: "Manage space, back up your data, and stay protected against loss.",
  },
  {
    id: "accounts-sync-family",
    label: "Accounts, Sync & Family",
    icon: Users,
    description: "Account sign-in, sync, and family/parental controls.",
  },
  {
    id: "accessibility-language",
    label: "Accessibility & Language",
    icon: Accessibility,
    description: "Assistive features, input, and language & region settings.",
  },
  {
    id: "troubleshooting-diagnostics",
    label: "Troubleshooting & Diagnostics",
    icon: LifeBuoy,
    description: "Reset, restart, and diagnose common issues.",
  },
  {
    id: "personalization",
    label: "Personalization & Appearance",
    icon: Palette,
    description: "Themes, wallpaper, lock screen, and layout of your device.",
  },
  {
    id: "devices-peripherals",
    label: "Devices & Peripherals",
    icon: Mouse,
    description: "Mice, keyboards, trackpads, printers, and other connected hardware.",
  },
  {
    id: "apps-features",
    label: "Apps & Features",
    icon: AppWindow,
    description: "Installed apps, optional features, and what runs on startup.",
  },
  {
    id: "system-info",
    label: "System Information & Advanced",
    icon: Info,
    description: "Device details, advanced settings, and activation status.",
  },
];

export const CATEGORY_MAP = CATEGORIES.reduce((map, category) => {
  map[category.id] = category;
  return map;
}, {});

export function getCategoryById(id) {
  return CATEGORY_MAP[id] || null;
}
