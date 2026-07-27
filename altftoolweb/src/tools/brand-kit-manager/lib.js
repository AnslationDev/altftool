/**
 * Brand Kit Manager — pure logic.
 *
 * No React, no DOM, no clock. Every function here is deterministic: the same
 * kit object always produces the same validation result, summary text and
 * counters. The UI layer (./pages) owns state, storage and downloads.
 */

/**
 * Image MIME types a browser can reliably render inside an <img> tag from a
 * FileReader data URL. Kept in sync with the file-picker `accept` attribute.
 */
export const SUPPORTED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
];

/**
 * Per-logo upload ceiling, in bytes.
 * Kits persist to localStorage, whose de-facto per-origin quota is 5 MB
 * (the figure the HTML Storage spec suggests as a reasonable limit and that
 * Chrome/Firefox/Safari all implement). Base64 inflates binary by 4/3, so a
 * 2 MB file becomes ~2.7 MB of stored text — one logo already eats half the
 * budget, which is why the cap sits here rather than higher.
 */
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

/** Six-digit hex, the only form CSS `color` accepts without an alpha channel. */
const HEX_PATTERN = /^#[0-9A-F]{6}$/i;

/** Protocols that are safe to put behind a brand link in an <a href>. */
export const ALLOWED_LINK_PROTOCOLS = ["http:", "https:", "mailto:"];

/** True when `value` is a full six-digit hex colour such as `#14B8A6`. */
export function isHex(value) {
  return HEX_PATTERN.test(String(value ?? "").trim());
}

/** Upper-cases a hex colour and adds the missing `#`. `14b8a6` -> `#14B8A6`. */
export function normalizeHex(value) {
  const text = String(value ?? "").trim();
  return (text.startsWith("#") ? text : `#${text}`).toUpperCase();
}

/**
 * True when `value` is empty (links are optional) or is an absolute URL on an
 * allowed protocol. Relative paths and `javascript:` are rejected.
 */
export function isValidBrandUrl(value) {
  const text = String(value ?? "").trim();
  if (!text) return true;
  try {
    return ALLOWED_LINK_PROTOCOLS.includes(new URL(text).protocol);
  } catch {
    return false;
  }
}

/** Slugifies a brand name into a safe download filename stem. */
export function cleanFilename(value) {
  const slug = String(value ?? "")
    .trim()
    .replace(/[^a-z0-9-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return slug || "brand-kit";
}

/**
 * Roll-up counters across every saved kit.
 * `assets` counts only slots that actually hold an uploaded image; `fonts`
 * counts the heading and body face of each kit when they are filled in.
 */
export function summarizeKits(kits) {
  const list = Array.isArray(kits) ? kits : [];
  let assets = 0;
  let colors = 0;
  let fonts = 0;
  for (const kit of list) {
    if (!kit) continue;
    assets += (kit.assets || []).filter((asset) => asset && asset.dataUrl).length;
    colors += (kit.colors || []).length;
    const typography = kit.typography || {};
    fonts +=
      Number(Boolean(String(typography.heading ?? "").trim())) +
      Number(Boolean(String(typography.body ?? "").trim()));
  }
  return { kits: list.length, assets, colors, fonts };
}

/**
 * Field-level validation for one kit.
 * Returns `{ name, website, links }` where `links` maps link id -> message.
 * Empty strings mean "valid", so the UI can render the value directly.
 */
export function validateKit(kit) {
  if (!kit) return { name: "", website: "", links: {} };
  const links = {};
  for (const item of kit.links || []) {
    if (!isValidBrandUrl(item?.url)) {
      links[item.id] = "Use a valid http, https, or mailto link.";
    }
  }
  return {
    name: String(kit.name ?? "").trim() ? "" : "Brand name is required.",
    website: isValidBrandUrl(kit.website) ? "" : "Use a valid website URL.",
    links,
  };
}

/**
 * Plain-text one-pager for the kit — what the "Copy summary" button puts on
 * the clipboard and what the .txt fallback download contains.
 */
export function buildBrandSummary(kit) {
  if (!kit) return { error: "No brand kit selected." };
  const typography = kit.typography || {};
  const guidelines = kit.guidelines || {};
  return [
    `${String(kit.name ?? "").trim() || "Untitled"} Brand Kit`,
    kit.tagline ?? "",
    "",
    `Industry: ${kit.industry ?? ""}`,
    `Website: ${kit.website ?? ""}`,
    `Contact: ${kit.contact ?? ""}`,
    "",
    "Colors:",
    ...(kit.colors || []).map((color) => `- ${color.name}: ${color.value}`),
    "",
    `Heading font: ${typography.heading ?? ""}`,
    `Body font: ${typography.body ?? ""}`,
    "",
    "Guidelines:",
    guidelines.voice ?? "",
    guidelines.messaging ?? "",
    guidelines.designRules ?? "",
  ].join("\n");
}

/** Only the palette entries CSS can actually render. */
export function usableColors(kit) {
  return (kit?.colors || []).filter((color) => isHex(color?.value));
}
