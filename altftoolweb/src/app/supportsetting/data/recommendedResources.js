import { Download, Wrench, Activity, Radio, Cpu, GitBranch, Package, Container, Sparkles } from "lucide-react";
import { DEVICE_MAP } from "./deviceTaxonomy";

/**
 * Replaces the old ad-driven "Sponsored" rail. Every entry here is either
 * (a) a link to a real, well-known official tool/download at its stable
 * root URL, or (b) an internal link to another page already inside this
 * app (resolved through onSelectSetting/onSelectUtility, not a raw href).
 * Nothing is served from an ad network or targeted by category/keyword
 * matching against paid placements — it's a small, hand-curated map from
 * "what you're looking at" to "what's actually useful next," capped at 3
 * items so it can never compete with the main content for attention.
 */

// Exact-setting overrides — the highest-confidence, most specific match.
const BY_SETTING_ID = {
  "windows-update": [
    { title: "Windows Installation Assistant", description: "Official in-place upgrade tool from Microsoft.", href: "https://www.microsoft.com/software-download/windows11", external: true, icon: Download },
    { title: "Microsoft Update Catalog", description: "Browse and download individual update packages directly.", href: "https://catalog.update.microsoft.com/", external: true, icon: Package },
    { title: "PC Health Check", description: "Check Windows 11 eligibility and system readiness.", href: "https://www.microsoft.com/en-us/windows/windows-11-specifications", external: true, icon: Activity },
  ],
  "bluetooth-settings": [
    { title: "Bluetooth Driver Updates", description: "Get the latest Bluetooth driver from Windows Update.", href: "https://support.microsoft.com/windows", external: true, icon: Radio },
    { title: "Intel Driver & Support Assistant", description: "Auto-detects and updates Intel wireless/Bluetooth drivers.", href: "https://www.intel.com/content/www/us/en/support/detect.html", external: true, icon: Cpu },
  ],
  "macos-bluetooth": [
    { title: "Apple Bluetooth Support", description: "Official troubleshooting for Mac Bluetooth connections.", href: "https://support.apple.com/en-us/HT201171", external: true, icon: Radio },
  ],
  "android-bluetooth": [
    { title: "Android Bluetooth Help", description: "Official Google guidance for pairing and connection issues.", href: "https://support.google.com/android/answer/9075925", external: true, icon: Radio },
  ],
  "ios-bluetooth": [
    { title: "Apple Bluetooth Support", description: "Official troubleshooting for iPhone Bluetooth connections.", href: "https://support.apple.com/en-us/HT201171", external: true, icon: Radio },
  ],
};

// Category-level fallback, per platform — used whenever a setting doesn't
// have a specific override above. Kept intentionally short (this is a
// support-content sitemap, not an ad network) and only covers platforms
// with genuinely different official channels.
const BY_CATEGORY = {
  "windows:system-updates": [{ title: "Microsoft Update Catalog", description: "Browse individual update packages.", href: "https://catalog.update.microsoft.com/", external: true, icon: Package }],
  "macos:system-updates": [{ title: "Apple Software Update Support", description: "Official macOS update guidance.", href: "https://support.apple.com/en-us/HT201541", external: true, icon: Download }],
  "android:system-updates": [{ title: "Android System Updates", description: "Official Google update guidance.", href: "https://support.google.com/android/answer/7680439", external: true, icon: Download }],
  "ios:system-updates": [{ title: "Apple Software Update Support", description: "Official iOS update guidance.", href: "https://support.apple.com/en-us/HT204204", external: true, icon: Download }],
};

// AI tools cross-recommend each other by category — resolved dynamically
// against the live aiTools catalog so this never goes stale as tools are
// added or renamed.
export function getAiToolResources(activeTool, allTools) {
  if (!activeTool) return [];
  const others = (allTools || []).filter((tool) => tool.id !== activeTool.id);
  const sameCategory = others.filter((tool) => tool.category === activeTool.category);
  const pool = sameCategory.length > 0 ? sameCategory : others;
  return pool.slice(0, 3).map((tool) => ({
    title: tool.name,
    description: tool.tagline,
    internalId: tool.id,
    icon: tool.icon || Sparkles,
  }));
}

// A few high-value internal cross-links for specific AI tools, blended in
// ahead of the generic "other AI tools" list where they exist.
const AI_TOOL_EXTRA_RESOURCES = {
  "ai-vscode-extensions": [
    { title: "Git", description: "The version control system most AI coding extensions integrate with.", href: "https://git-scm.com", external: true, icon: GitBranch },
    { title: "Node.js", description: "JavaScript runtime required by many VS Code extensions and dev servers.", href: "https://nodejs.org", external: true, icon: Package },
    { title: "Docker", description: "Containerize projects for consistent dev environments alongside AI tooling.", href: "https://www.docker.com", external: true, icon: Container },
  ],
};

function byPlatformDocs(platform) {
  const device = DEVICE_MAP[platform];
  if (!device?.officialDocsUrl) return [];
  return [{ title: `Official ${device.name} Support`, description: `${device.name}'s own support documentation.`, href: device.officialDocsUrl, external: true, icon: Wrench }];
}

/**
 * Single entry point the Recommended Resources panel calls. Priority:
 * exact setting id -> category+platform -> AI tool cross-links -> generic
 * platform docs fallback -> nothing (panel simply doesn't render rather
 * than show something irrelevant).
 */
export function getRecommendedResources({ activeSetting, activeAiTool, allAiTools, platform }) {
  if (activeAiTool) {
    const extra = AI_TOOL_EXTRA_RESOURCES[activeAiTool.id] || [];
    const related = getAiToolResources(activeAiTool, allAiTools);
    return [...extra, ...related].slice(0, 3);
  }

  if (activeSetting) {
    const exact = BY_SETTING_ID[activeSetting.id];
    if (exact?.length) return exact.slice(0, 3);

    const byCategory = BY_CATEGORY[`${activeSetting.platform}:${activeSetting.category}`];
    if (byCategory?.length) return byCategory.slice(0, 3);

    const fallback = byPlatformDocs(activeSetting.platform);
    if (fallback.length) return fallback;
  }

  if (platform) return byPlatformDocs(platform);

  return [];
}
