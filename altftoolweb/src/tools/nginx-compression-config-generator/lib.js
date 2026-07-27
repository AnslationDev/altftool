/**
 * Nginx gzip / brotli compression config generation.
 *
 * Directive names, defaults and ranges come from:
 *  - ngx_http_gzip_module docs (gzip, gzip_comp_level 1-9 default 1,
 *    gzip_min_length default 20, gzip_types default text/html, gzip_vary,
 *    gzip_proxied).
 *  - ngx_http_gzip_static_module docs (gzip_static off|on|always).
 *  - google/ngx_brotli README (brotli, brotli_comp_level 0-11 default 6,
 *    brotli_types, brotli_min_length default 20, brotli_static).
 */

/** ngx_http_gzip_module: gzip_comp_level accepts 1..9; nginx default is 1. */
export const GZIP_LEVEL_MIN = 1;
export const GZIP_LEVEL_MAX = 9;
export const GZIP_LEVEL_DEFAULT = 1;
/** Common tuning guidance: 5-6 is the sweet spot; above 6 CPU rises for ~1% smaller output. */
export const GZIP_LEVEL_RECOMMENDED = 6;

/** ngx_brotli: brotli_comp_level accepts 0..11; module default is 6. */
export const BROTLI_LEVEL_MIN = 0;
export const BROTLI_LEVEL_MAX = 11;
export const BROTLI_LEVEL_DEFAULT = 6;
/** ngx_brotli README suggests 4-6 for on-the-fly compression of dynamic responses. */
export const BROTLI_LEVEL_RECOMMENDED = 5;

/** nginx default gzip_min_length is 20 bytes (response Content-Length). */
export const MIN_LENGTH_NGINX_DEFAULT = 20;
/**
 * Recommended floor: responses under ~256 bytes fit in one TCP segment anyway
 * and can even grow when compressed, so compressing them wastes CPU.
 */
export const MIN_LENGTH_RECOMMENDED = 256;

/** Sanity ceiling for gzip_min_length input (1 MiB). */
export const MIN_LENGTH_MAX = 1048576;

/**
 * Compressible MIME type groups. text/html is deliberately absent: nginx always
 * compresses text/html and repeating it in gzip_types triggers the
 * "duplicate MIME type" warning. woff/woff2 are excluded because those formats
 * are already internally compressed.
 */
export const MIME_GROUPS = [
  {
    id: "text",
    label: "Text & CSS",
    types: ["text/plain", "text/css"],
  },
  {
    id: "js",
    label: "JavaScript",
    types: ["application/javascript", "text/javascript"],
  },
  {
    id: "json",
    label: "JSON & manifests",
    types: ["application/json", "application/manifest+json", "application/geo+json"],
  },
  {
    id: "xml",
    label: "XML & feeds",
    types: ["application/xml", "text/xml", "application/rss+xml", "application/atom+xml"],
  },
  {
    id: "svg",
    label: "SVG images",
    types: ["image/svg+xml"],
  },
  {
    id: "fonts",
    label: "Legacy fonts (ttf/otf/eot)",
    types: ["font/ttf", "font/otf", "application/vnd.ms-fontobject"],
  },
  {
    id: "wasm",
    label: "WebAssembly",
    types: ["application/wasm"],
  },
];

/** nginx always compresses text/html; listing it in *_types causes a duplicate warning. */
export const ALWAYS_COMPRESSED_TYPE = "text/html";

const intIn = (value, min, max) =>
  Number.isInteger(value) && value >= min && value <= max;

/**
 * Build the nginx compression snippet.
 *
 * @param {object} input
 * @param {boolean} input.gzipEnabled
 * @param {number}  input.gzipLevel        1-9
 * @param {boolean} input.gzipStatic       serve pre-compressed .gz files (ngx_http_gzip_static_module)
 * @param {boolean} input.brotliEnabled    requires the ngx_brotli module
 * @param {number}  input.brotliLevel      0-11
 * @param {boolean} input.brotliStatic     serve pre-compressed .br files
 * @param {number}  input.minLength        gzip_min_length / brotli_min_length in bytes
 * @param {string[]} input.groupIds        MIME_GROUPS ids to include
 * @param {boolean} input.vary             emit gzip_vary on (Vary: Accept-Encoding)
 * @param {boolean} input.proxied          emit gzip_proxied any (compress proxied requests)
 * @returns {{config: string, types: string[], notes: string[]} | {error: string}}
 */
export function buildCompressionConfig({
  gzipEnabled,
  gzipLevel,
  gzipStatic = false,
  brotliEnabled,
  brotliLevel,
  brotliStatic = false,
  minLength,
  groupIds,
  vary = true,
  proxied = true,
}) {
  if (!gzipEnabled && !brotliEnabled) {
    return { error: "Enable at least one of gzip or brotli." };
  }
  const level = Number(gzipLevel);
  if (gzipEnabled && !intIn(level, GZIP_LEVEL_MIN, GZIP_LEVEL_MAX)) {
    return { error: `gzip_comp_level must be a whole number from ${GZIP_LEVEL_MIN} to ${GZIP_LEVEL_MAX}.` };
  }
  const bLevel = Number(brotliLevel);
  if (brotliEnabled && !intIn(bLevel, BROTLI_LEVEL_MIN, BROTLI_LEVEL_MAX)) {
    return { error: `brotli_comp_level must be a whole number from ${BROTLI_LEVEL_MIN} to ${BROTLI_LEVEL_MAX}.` };
  }
  const minLen = Number(minLength);
  if (!Number.isInteger(minLen) || minLen < 0) {
    return { error: "Minimum length must be zero or a positive whole number of bytes." };
  }
  if (minLen > MIN_LENGTH_MAX) {
    return { error: "Minimum length above 1 MiB would disable compression for almost everything." };
  }
  if (!Array.isArray(groupIds)) {
    return { error: "Choose which MIME type groups to compress." };
  }

  const seen = new Set();
  const types = [];
  for (const group of MIME_GROUPS) {
    if (!groupIds.includes(group.id)) continue;
    for (const type of group.types) {
      if (type === ALWAYS_COMPRESSED_TYPE) continue; // never duplicate text/html
      if (!seen.has(type)) {
        seen.add(type);
        types.push(type);
      }
    }
  }

  const typeList = types.join("\n        ");
  const lines = [];
  const notes = [];

  if (gzipEnabled) {
    lines.push("# --- gzip (ngx_http_gzip_module) ---");
    lines.push("gzip            on;");
    lines.push(`gzip_comp_level ${level};`);
    lines.push(`gzip_min_length ${minLen};`);
    if (proxied) lines.push("gzip_proxied    any;");
    if (vary) lines.push("gzip_vary       on;");
    if (types.length > 0) {
      lines.push(`gzip_types      ${typeList};`);
    }
    if (gzipStatic) {
      lines.push("# Serve pre-compressed .gz files when present (ngx_http_gzip_static_module)");
      lines.push("gzip_static     on;");
    }
  }

  if (brotliEnabled) {
    if (gzipEnabled) lines.push("");
    lines.push("# --- brotli (requires the ngx_brotli module) ---");
    lines.push("brotli            on;");
    lines.push(`brotli_comp_level ${bLevel};`);
    lines.push(`brotli_min_length ${minLen};`);
    if (types.length > 0) {
      lines.push(`brotli_types      ${typeList.replace(/\n {8}/g, "\n          ")};`);
    }
    if (brotliStatic) {
      lines.push("# Serve pre-compressed .br files when present");
      lines.push("brotli_static     on;");
    }
    notes.push(
      "brotli directives need the ngx_brotli module (libnginx-mod-http-brotli on Debian/Ubuntu, or compiled in).",
    );
  }

  notes.push("text/html is always compressed by nginx and must not be listed in gzip_types/brotli_types.");
  if (gzipEnabled && level > GZIP_LEVEL_RECOMMENDED) {
    notes.push(`gzip level ${level} costs noticeably more CPU than ${GZIP_LEVEL_RECOMMENDED} for roughly 1% smaller output.`);
  }
  if (brotliEnabled && bLevel > 6) {
    notes.push(`brotli level ${bLevel} is best reserved for pre-compressed static files, not on-the-fly responses.`);
  }
  if (minLen < MIN_LENGTH_RECOMMENDED) {
    notes.push(`Responses under ~${MIN_LENGTH_RECOMMENDED} bytes often fit one TCP segment; compressing them can make them larger.`);
  }
  if (types.length === 0) {
    notes.push("No extra MIME types selected — only text/html will be compressed.");
  }

  return { config: lines.join("\n"), types, typeCount: types.length, notes };
}
