/**
 * URL shape for the Support Settings catch-all, with no catalogue behind it.
 *
 * WHY THIS EXISTS
 * `[...slug]/page.jsx` used to import resolveSlug/describeSlug from ./routes,
 * which statically imports settingData, which imports all four platform
 * catalogues — windows, macos, android and ios, about 2 MB of source. That put
 * the whole catalogue in the route's server bundle, making it 2.7 MB, the
 * largest of any route in the app, and pushing the Amplify artifact over its
 * ceiling.
 *
 * The proxy and [...slug] page validate paths against the lightweight exact
 * manifest in platform/navigation. Once a path is known, this module only has
 * to turn its segments into client state. The client is the side that actually
 * needs the data, and it already loads each platform through a dynamic import
 * (see ./clientData.js).
 *
 * ./routes.js is unchanged and still the catalogue-backed source of truth for
 * everything rendered on the client.
 */

import { getAiToolById } from "./aiTools";
import { getDeviceById } from "./deviceTaxonomy";

// Mirrors SETTINGS_BY_PLATFORM's keys in ./settingData without importing it.
const PLATFORMS = ["windows", "macos", "android", "ios"];

// Kept byte-identical to UTIL_TITLES in ./routes.js.
const UTIL_TITLES = {
  "util-troubleshooting": "Troubleshooting",
  "util-faq": "FAQ & Help",
  "util-device": "Device Info & Diagnostics",
  "util-contact": "Contact & Feedback",
};

/** Same result shape as resolveSlug in ./routes.js for a pre-validated URL. */
export function resolveSlugShape(slug) {
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

  if (PLATFORMS.includes(first)) {
    if (!second) return { activeId: null, platformOverride: first };
    if (second === "category") {
      return { activeId: third ? `cat-${first}-${third}` : null, platformOverride: first };
    }
    return { activeId: second, platformOverride: first };
  }

  const device = getDeviceById(first);
  if (device) {
    return { activeId: second || `device-${first}`, platformOverride: null };
  }

  return { activeId: null, platformOverride: null };
}

/** Title/description for generateMetadata, derived without the catalogue. */
export function describeSlugShape(slug) {
  const base = "Support Settings";
  const baseDescription =
    "Access AltFTool settings and support. Manage your preferences, permissions, system options, and find help or troubleshooting guides for tools and features.";

  const parts = Array.isArray(slug) ? slug.filter(Boolean) : [];
  const [first, second] = parts;

  if (first === "help" && second && UTIL_TITLES[`util-${second}`]) {
    return {
      title: `${UTIL_TITLES[`util-${second}`]} — ${base} | AltFTool`,
      description: baseDescription,
    };
  }

  const device = first ? getDeviceById(first) : null;
  if (device) {
    return {
      title: `${device.name} Support — ${base} | AltFTool`,
      description: `Browse support settings and guides for ${device.name}.`,
    };
  }

  return {
    title: `${base} – Manage Preferences | AltFTool`,
    description: baseDescription,
  };
}
