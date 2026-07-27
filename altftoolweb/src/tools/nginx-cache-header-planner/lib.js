/**
 * Nginx Cache-Control / expires planning.
 *
 * Rules encoded here:
 *  - Cache-Control response directives (public, private, no-cache, no-store,
 *    max-age, must-revalidate, immutable) per RFC 9111 and RFC 8246 (immutable).
 *  - nginx ngx_http_headers_module: the `expires` directive emits BOTH an
 *    Expires header and "Cache-Control: max-age=N". Combining `expires` with
 *    an add_header Cache-Control line produces duplicate Cache-Control
 *    headers, so this planner emits `expires` only for plain max-age policies
 *    and add_header for anything richer.
 *  - nginx time units: s, m, h, d, w, M (30 days), y (365 days).
 */

/** One year in seconds — nginx's "y" unit is 365 days (RFC 2616 also advised Expires <= 1 year). */
export const SECONDS_PER_YEAR = 31536000;
/** nginx "M" unit is 30 days. */
export const SECONDS_PER_MONTH = 2592000;
export const SECONDS_PER_WEEK = 604800;
export const SECONDS_PER_DAY = 86400;
export const SECONDS_PER_HOUR = 3600;
export const SECONDS_PER_MINUTE = 60;

/** Guard: max-age is a delta-seconds value; cap input at 10 years to catch unit mistakes. */
export const MAX_MAX_AGE_SECONDS = 10 * SECONDS_PER_YEAR;

/** Duration units offered by the UI, mapped to seconds. */
export const DURATION_UNITS = [
  { id: "minutes", label: "minutes", seconds: SECONDS_PER_MINUTE },
  { id: "hours", label: "hours", seconds: SECONDS_PER_HOUR },
  { id: "days", label: "days", seconds: SECONDS_PER_DAY },
  { id: "weeks", label: "weeks", seconds: SECONDS_PER_WEEK },
  { id: "years", label: "years", seconds: SECONDS_PER_YEAR },
];

export const CACHEABILITY_OPTIONS = [
  { id: "public", label: "public — any cache may store it" },
  { id: "private", label: "private — browser cache only" },
  { id: "no-cache", label: "no-cache — store but revalidate every use" },
  { id: "no-store", label: "no-store — never store" },
];

/**
 * Default plan, following the widely used static-asset strategy:
 * HTML revalidated every time; hashed CSS/JS immutable for 1 year (RFC 8246);
 * images 30 days; fonts 1 year immutable; API responses never stored.
 */
export const DEFAULT_ASSET_CLASSES = [
  {
    id: "html",
    label: "HTML pages",
    extensions: "html htm",
    enabled: true,
    cacheability: "no-cache",
    duration: 0,
    unit: "days",
    immutable: false,
    mustRevalidate: false,
  },
  {
    id: "hashed",
    label: "Hashed CSS / JS bundles",
    extensions: "css js mjs",
    enabled: true,
    cacheability: "public",
    duration: 1,
    unit: "years",
    immutable: true,
    mustRevalidate: false,
  },
  {
    id: "images",
    label: "Images",
    extensions: "jpg jpeg png gif webp avif svg ico",
    enabled: true,
    cacheability: "public",
    duration: 30,
    unit: "days",
    immutable: false,
    mustRevalidate: false,
  },
  {
    id: "fonts",
    label: "Fonts",
    extensions: "woff2 woff ttf otf",
    enabled: true,
    cacheability: "public",
    duration: 1,
    unit: "years",
    immutable: true,
    mustRevalidate: false,
  },
  {
    id: "media",
    label: "Audio / video",
    extensions: "mp4 webm mp3 ogg",
    enabled: false,
    cacheability: "public",
    duration: 30,
    unit: "days",
    immutable: false,
    mustRevalidate: false,
  },
];

/** Convert seconds to the largest exact nginx time unit (y, M, w, d, h, m, s). */
export function secondsToNginxTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  if (seconds === 0) return "0";
  const units = [
    [SECONDS_PER_YEAR, "y"],
    [SECONDS_PER_MONTH, "M"],
    [SECONDS_PER_WEEK, "w"],
    [SECONDS_PER_DAY, "d"],
    [SECONDS_PER_HOUR, "h"],
    [SECONDS_PER_MINUTE, "m"],
  ];
  for (const [size, suffix] of units) {
    if (seconds % size === 0) return `${seconds / size}${suffix}`;
  }
  return `${seconds}s`;
}

/** Build the Cache-Control header value for one asset class (RFC 9111 / 8246 directives). */
export function buildCacheControlValue({ cacheability, maxAgeSeconds, immutable, mustRevalidate }) {
  if (cacheability === "no-store") return "no-store";
  if (cacheability === "no-cache") return "no-cache";
  const parts = [cacheability, `max-age=${maxAgeSeconds}`];
  if (mustRevalidate) parts.push("must-revalidate");
  if (immutable) parts.push("immutable");
  return parts.join(", ");
}

const cleanExtensions = (raw) =>
  String(raw ?? "")
    .split(/[\s,.;|]+/)
    .map((ext) => ext.trim().toLowerCase().replace(/^\./, ""))
    .filter((ext) => /^[a-z0-9]{1,10}$/.test(ext));

/**
 * Build the nginx snippet plus a per-class plan table.
 *
 * @param {object} input
 * @param {Array} input.classes  Asset classes shaped like DEFAULT_ASSET_CLASSES entries.
 * @returns {{config: string, rows: Array, enabledCount: number} | {error: string}}
 */
export function buildCacheHeaderConfig({ classes }) {
  if (!Array.isArray(classes) || classes.length === 0) {
    return { error: "Add at least one asset class." };
  }
  const enabled = classes.filter((assetClass) => assetClass.enabled);
  if (enabled.length === 0) {
    return { error: "Enable at least one asset class to generate a snippet." };
  }

  const rows = [];
  const blocks = [];
  for (const assetClass of enabled) {
    const label =
      typeof assetClass.label === "string" && assetClass.label.trim() !== ""
        ? assetClass.label.trim()
        : "Asset class";
    const extensions = cleanExtensions(assetClass.extensions);
    if (extensions.length === 0) {
      return { error: `"${label}" needs at least one file extension (letters and digits only).` };
    }
    const cacheability = CACHEABILITY_OPTIONS.some((option) => option.id === assetClass.cacheability)
      ? assetClass.cacheability
      : "public";

    const needsAge = cacheability === "public" || cacheability === "private";
    const unit = DURATION_UNITS.find((option) => option.id === assetClass.unit) ?? DURATION_UNITS[2];
    const duration = Number(assetClass.duration);
    let maxAgeSeconds = 0;
    if (needsAge) {
      if (!Number.isFinite(duration) || duration < 0) {
        return { error: `Cache duration for "${label}" must be zero or a positive number.` };
      }
      maxAgeSeconds = Math.round(duration * unit.seconds);
      if (maxAgeSeconds > MAX_MAX_AGE_SECONDS) {
        return { error: `Cache duration for "${label}" exceeds 10 years — check the unit.` };
      }
    }

    const headerValue = buildCacheControlValue({
      cacheability,
      maxAgeSeconds,
      immutable: Boolean(assetClass.immutable) && needsAge,
      mustRevalidate: Boolean(assetClass.mustRevalidate) && needsAge,
    });

    // Plain "public, max-age=N" with no extra directives can use `expires`,
    // which also emits an Expires header for legacy clients. Anything richer
    // must use add_header to avoid duplicate Cache-Control headers.
    const isPlainPublicMaxAge = headerValue === `public, max-age=${maxAgeSeconds}`;
    const pattern = extensions.join("|");
    const lines = [`# ${label}`, `location ~* \\.(${pattern})$ {`];
    if (isPlainPublicMaxAge) {
      // `expires` alone emits Expires + "Cache-Control: max-age=N"; adding an
      // add_header Cache-Control here would duplicate the header.
      lines.push(`    expires ${secondsToNginxTime(maxAgeSeconds)};`);
    } else {
      lines.push(`    add_header Cache-Control "${headerValue}";`);
    }
    lines.push("}");
    blocks.push(lines.join("\n"));

    rows.push({
      id: assetClass.id,
      label,
      extensions,
      headerValue,
      maxAgeSeconds: needsAge ? maxAgeSeconds : 0,
      nginxTime: needsAge ? secondsToNginxTime(maxAgeSeconds) : null,
    });
  }

  return { config: blocks.join("\n\n"), rows, enabledCount: enabled.length };
}
