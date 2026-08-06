// @altftool/core/seo/resolver
//
// Pure, dependency-free SEO config resolution for the ALTF Engine.
//
// This module performs the deterministic, server-side precedence merge that
// turns a central SEO config document into a small set of "fill" (defaults that
// apply only where the page did not specify a value) and "force" (explicit
// per-URL overrides that win over page code) field maps.
//
// It has NO I/O and NO external dependencies so it is trivially unit-testable
// and safe to run in any environment (web SSR, admin preview, Node tests).
//
// Precedence, lowest -> highest:
//   1. global defaults
//   2. brand profile (brandId)
//   3. page-type defaults (pageType)
//   4. ordered pattern rules (pathGlob)
//   5. per-page explicit override (pages[path])      -> emitted as `force`
//
// The web layer applies `fill` UNDER the page's own createPageMetadata args and
// `force` OVER them, yielding the effective precedence:
//   page `force` (admin per-URL) > page code args > rules > type > brand > global
//
// When the config is empty/disabled the resolver returns empty maps, so the
// final metadata output is byte-identical to the pre-engine behavior (inert).

/** Fields the engine can centrally manage and that map into createPageMetadata. */
const MANAGED_FIELDS = Object.freeze([
  "title",
  "description",
  "keywords",
  "image",
  "canonical",
  "type",
  "noindex",
  "follow",
]);

/** @returns {boolean} whether `value` is a plain (non-null, non-array) object. */
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Convert a simple glob (supporting `*` and `**`) into an anchored RegExp.
 * `*`  matches within a path segment, `**` matches across segments.
 * Falls back to a literal match on malformed input.
 * @param {string} glob
 * @returns {RegExp|null}
 */
export function globToRegExp(glob) {
  if (typeof glob !== "string" || !glob) return null;
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  // Order matters: handle `**` before `*`.
  const pattern = escaped
    .replace(/\*\*/g, "\0") // placeholder for cross-segment wildcard
    .replace(/\*/g, "[^/]*")
    .replace(/\0/g, ".*");
  try {
    return new RegExp(`^${pattern}$`);
  } catch {
    return null;
  }
}

/**
 * Pick only the managed, defined fields from an arbitrary source object,
 * mapping a few alias/shape differences into the canonical managed shape.
 * @param {Record<string, any>} [source]
 * @returns {Record<string, any>}
 */
function pickManaged(source) {
  if (!isPlainObject(source)) return {};
  const out = {};

  for (const field of MANAGED_FIELDS) {
    if (source[field] !== undefined && source[field] !== null && source[field] !== "") {
      out[field] = source[field];
    }
  }

  // Normalize a nested robots object into the flat noindex/follow the page uses.
  if (isPlainObject(source.robots)) {
    if (typeof source.robots.index === "boolean") out.noindex = !source.robots.index;
    if (typeof source.robots.follow === "boolean") out.follow = source.robots.follow;
  }
  if (typeof source.noindex === "boolean") out.noindex = source.noindex;
  if (typeof source.follow === "boolean") out.follow = source.follow;

  // Keep keyword arrays clean.
  if (Array.isArray(out.keywords)) {
    out.keywords = out.keywords.map((k) => String(k).trim()).filter(Boolean);
    if (!out.keywords.length) delete out.keywords;
  }

  return out;
}

/**
 * Layer source objects left-to-right; later non-empty managed fields win.
 * @param {...Record<string, any>} layers
 * @returns {Record<string, any>}
 */
function layer(...layers) {
  const out = {};
  for (const src of layers) {
    const managed = pickManaged(src);
    for (const key of Object.keys(managed)) out[key] = managed[key];
  }
  return out;
}

/**
 * Resolve the central SEO config for a given page context into fill/force maps.
 *
 * @param {object} config           Decoded `seo/runtime` document (or null).
 * @param {object} ctx
 * @param {string} ctx.path         Request path, e.g. "/tools/all/json-formatter".
 * @param {string} [ctx.pageType]   Page type key, e.g. "tools" | "blogs" | "policies".
 * @param {string} [ctx.brandId]    Brand profile key, e.g. "altftool" | "quotenest".
 * @returns {{ fill: Record<string, any>, force: Record<string, any>,
 *            sitemap: Record<string, any>, matched: string[] }}
 */
export function resolveSeo(config, ctx = {}) {
  const empty = { fill: {}, force: {}, sitemap: {}, matched: [] };
  if (!isPlainObject(config) || config.enabled === false) return empty;

  const path = typeof ctx.path === "string" ? ctx.path : "/";
  const pageType = ctx.pageType;
  const brandId = ctx.brandId || config?.global?.defaultBrandId;
  const matched = [];

  const global = isPlainObject(config.global) ? config.global : {};
  const brand = brandId && isPlainObject(config.brands) ? config.brands[brandId] : undefined;
  const type = pageType && isPlainObject(config.types) ? config.types[pageType] : undefined;

  if (Object.keys(pickManaged(global)).length) matched.push("global");
  if (brand) matched.push(`brand:${brandId}`);
  if (type) matched.push(`type:${pageType}`);

  // Ordered pattern rules.
  const ruleLayers = [];
  const sitemap = {};
  if (Array.isArray(config.rules)) {
    const rules = config.rules
      .filter((r) => isPlainObject(r) && r.enabled !== false && typeof r.pathGlob === "string")
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const rule of rules) {
      const re = globToRegExp(rule.pathGlob);
      if (re && re.test(path)) {
        matched.push(`rule:${rule.pathGlob}`);
        ruleLayers.push(rule.set || rule);
        if (isPlainObject(rule.set)) {
          if (rule.set.priority !== undefined) sitemap.priority = rule.set.priority;
          if (rule.set.changeFreq !== undefined) sitemap.changeFreq = rule.set.changeFreq;
          if (typeof rule.set.includeInSitemap === "boolean") sitemap.include = rule.set.includeInSitemap;
        }
      }
    }
  }

  // Page-type sitemap defaults (lower precedence than rules above).
  if (isPlainObject(type)) {
    if (sitemap.priority === undefined && type.defaultPriority !== undefined) sitemap.priority = type.defaultPriority;
    if (sitemap.changeFreq === undefined && type.defaultChangeFreq !== undefined) sitemap.changeFreq = type.defaultChangeFreq;
    if (sitemap.include === undefined && typeof type.includeInSitemap === "boolean") sitemap.include = type.includeInSitemap;
  }

  const fill = layer(global, brand, type, ...ruleLayers);

  // Per-page explicit override -> force (wins over page code).
  const pageOverride =
    isPlainObject(config.pages) && (config.pages[path] || config.pages[stripTrailingSlash(path)]);
  const force = {};
  if (isPlainObject(pageOverride)) {
    matched.push(`page:${path}`);
    Object.assign(force, pickManaged(pageOverride));
    if (isPlainObject(pageOverride.sitemap)) {
      if (pageOverride.sitemap.include !== undefined) sitemap.include = pageOverride.sitemap.include;
      if (pageOverride.sitemap.priority !== undefined) sitemap.priority = pageOverride.sitemap.priority;
      if (pageOverride.sitemap.changeFreq !== undefined) sitemap.changeFreq = pageOverride.sitemap.changeFreq;
    }
  }

  return { fill, force, sitemap, matched };
}

/** @param {string} path */
function stripTrailingSlash(path) {
  if (typeof path !== "string" || path === "/") return path;
  return path.replace(/\/+$/, "") || "/";
}

/**
 * Apply resolved fill/force maps onto a page's createPageMetadata args.
 * `fill` only sets keys the caller left undefined; `force` always wins.
 * Returns a NEW args object; never mutates the input.
 *
 * @param {Record<string, any>} args   Original createPageMetadata args.
 * @param {{ fill?: Record<string, any>, force?: Record<string, any> }} resolved
 * @returns {Record<string, any>}
 */
export function applyResolvedSeo(args = {}, resolved = {}) {
  const out = { ...args };
  const fill = resolved.fill || {};
  const force = resolved.force || {};

  for (const key of Object.keys(fill)) {
    if (out[key] === undefined) out[key] = fill[key];
  }
  for (const key of Object.keys(force)) {
    out[key] = force[key];
  }
  return out;
}

/**
 * Resolve a per-page content override (H1/intro/benefits/FAQs/body) for a path.
 * Returns {} when none / engine disabled — so callers stay inert.
 * @param {object} config
 * @param {string} path
 * @returns {object}
 */
export function resolveContent(config, path) {
  if (!isPlainObject(config) || config.enabled === false) return {};
  const pages = isPlainObject(config.pages) ? config.pages : {};
  const entry = pages[path] || pages[stripTrailingSlash(path)];
  return entry && isPlainObject(entry.content) ? entry.content : {};
}

/**
 * Resolve the EXTENDED metadata (beyond the core managed fields) for a path:
 * Open Graph overrides, Twitter card overrides, site verification tokens,
 * favicon, canonical base URL, hreflang alternates and per-page JSON-LD.
 *
 * Global defaults fill, per-page entries win. Returns empty fields when the
 * config is empty/disabled so the web emit path stays inert/backward-compatible.
 *
 * @param {object} config
 * @param {{ path: string, pageType?: string, brandId?: string }} ctx
 * @returns {{ og: object, twitter: object, verification: object,
 *            favicon: string|null, baseUrl: string|null,
 *            hreflang: Array<{lang:string,href:string}>, jsonLd: object[] }}
 */
export function resolveExtendedMeta(config, ctx = {}) {
  const empty = {
    og: {},
    twitter: {},
    verification: {},
    favicon: null,
    baseUrl: null,
    hreflang: [],
    jsonLd: [],
  };
  if (!isPlainObject(config) || config.enabled === false) return empty;

  const path = typeof ctx.path === "string" ? ctx.path : "/";
  const global = isPlainObject(config.global) ? config.global : {};
  const pages = isPlainObject(config.pages) ? config.pages : {};
  const page = pages[path] || pages[stripTrailingSlash(path)] || {};
  const brandId = ctx.brandId || global.defaultBrandId;
  const brand = brandId && isPlainObject(config.brands) ? config.brands[brandId] : undefined;

  const og = {
    ...(isPlainObject(global.og) ? global.og : {}),
    ...(isPlainObject(page.og) ? page.og : {}),
  };
  const twitter = {
    ...(isPlainObject(global.twitter) ? global.twitter : {}),
    ...(brand && brand.twitterHandle ? { site: brand.twitterHandle } : {}),
    ...(isPlainObject(page.twitter) ? page.twitter : {}),
  };

  return {
    og,
    twitter,
    verification: isPlainObject(global.verification) ? global.verification : {},
    favicon: typeof global.favicon === "string" ? global.favicon : null,
    baseUrl: typeof global.baseUrl === "string" ? global.baseUrl : null,
    hreflang: Array.isArray(page.hreflang) ? page.hreflang : [],
    jsonLd: Array.isArray(page.schema) ? page.schema : [],
  };
}

/**
 * Resolve admin-authored custom code (raw HTML/scripts) to inject into the
 * document head, start of body, and end of body. Returns the GLOBAL (site-wide)
 * block and the PAGE (per-URL) block separately so the caller can render global
 * server-side (once) and per-page wherever it has the path.
 *
 * Returns empty blocks when the config is empty/disabled (fully inert).
 *
 * @param {object} config
 * @param {string} [path]
 * @returns {{ global: {head?:string,bodyStart?:string,bodyEnd?:string},
 *            page: {head?:string,bodyStart?:string,bodyEnd?:string} }}
 */
export function resolveInjectedCode(config, path) {
  const empty = { global: {}, page: {} };
  if (!isPlainObject(config) || config.enabled === false) return empty;
  const global = isPlainObject(config?.global?.code) ? config.global.code : {};
  let page = {};
  if (typeof path === "string") {
    const pages = isPlainObject(config.pages) ? config.pages : {};
    const entry = pages[path] || pages[stripTrailingSlash(path)];
    if (entry && isPlainObject(entry.code)) page = entry.code;
  }
  const pick = (o) =>
    dropCodeUndefined({
      head: sanitizeInjectedMarkup(o.head),
      bodyStart: sanitizeInjectedMarkup(o.bodyStart),
      bodyEnd: sanitizeInjectedMarkup(o.bodyEnd),
    });
  return { global: pick(global), page: pick(page) };
}

// Admin-authored custom code is intended for analytics, verification, and
// similar integrations. It must not be able to redirect or replace the page a
// visitor asked for. Keep the guard in this dependency-free resolver rather
// than in one HTTP route: the root layout consumes the global block directly,
// while /api/seo/page-code serves the per-page block. One resolver therefore
// protects both paths and keeps the engine fully inert when it is disabled.
const INJECTED_CODE_VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function decodeInjectedCodePoint(raw, radix, fallback) {
  const codePoint = Number.parseInt(raw, radix);
  return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
    ? String.fromCodePoint(codePoint)
    : fallback;
}

function injectedCodeInspectionText(value) {
  return value
    // Character references are decoded by the HTML parser inside attributes.
    .replace(/&#x([0-9a-f]+);?/gi, (entity, hex) =>
      decodeInjectedCodePoint(hex, 16, entity),
    )
    .replace(/&#([0-9]+);?/g, (entity, decimal) =>
      decodeInjectedCodePoint(decimal, 10, entity),
    )
    .replace(/&(colon|period|tab|newline|quot|apos);/gi, (entity) => {
      const decoded = {
        "&colon;": ":",
        "&period;": ".",
        "&tab;": "\t",
        "&newline;": "\n",
        "&quot;": '"',
        "&apos;": "'",
      };
      return decoded[entity.toLowerCase()] || entity;
    })
    // JavaScript accepts escaped identifier characters such as
    // `loc\\u0061tion`; inspect their decoded ASCII form as well.
    .replace(/\\u\{([0-9a-f]{1,6})\}/gi, (escape, hex) =>
      decodeInjectedCodePoint(hex, 16, escape),
    )
    .replace(/\\u([0-9a-f]{4})/gi, (escape, hex) =>
      decodeInjectedCodePoint(hex, 16, escape),
    )
    .replace(/\\x([0-9a-f]{2})/gi, (escape, hex) =>
      decodeInjectedCodePoint(hex, 16, escape),
    )
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    // Optional chaining does not make a navigation primitive harmless. Treat
    // it like ordinary member access for inspection so `location?.assign()`
    // cannot bypass the direct-call rules below.
    .replace(/\?\s*\./g, ".")
    // Collapse simple computed-property string concatenation. This is a
    // common no-eval spelling of `window.location` / `window.open`, e.g.
    // `window["loca" + "tion"]`, and executes in every supported browser.
    .replace(
      /\[\s*((?:["'][a-z]+["']\s*\+\s*)+["'][a-z]+["'])\s*\]/gi,
      (expression, source) => {
        const pieces = [...source.matchAll(/["']([a-z]+)["']/gi)];
        const residue = source
          .replace(/["'][a-z]+["']/gi, "")
          .replace(/\+/g, "")
          .trim();
        return !residue && pieces.length > 1
          ? `.${pieces.map((piece) => piece[1]).join("")}`
          : expression;
      },
    )
    // Normalize simple computed-property notation before applying the rules.
    .replace(/\[\s*(["'])([a-z]+)\1\s*\]/gi, ".$2");
}

const INJECTED_NAVIGATION_PATTERNS = [
  // Direct location assignment, including location.href and nested browsing
  // contexts such as `frames[0].location`. Matching from the `location`
  // property itself is intentional: any such assignment can navigate the
  // current page, an ancestor, or an embedded page.
  /\blocation(?:\s*\.\s*(?:href|host|hostname|protocol|pathname|search|port))?\s*(?:=|\+=|\|\|=|&&=|\?\?=)(?!=|>)/i,
  // Navigation methods remain dangerous when invoked through call/apply/bind
  // or retained for later invocation, so detect the capability reference and
  // not only the simplest `method(...)` spelling.
  /\blocation\s*\.\s*(?:assign|replace|reload)\b/i,
  /\bnavigation\s*\.\s*navigate\b/i,
  // History methods can silently replace the URL or move the visitor away.
  /\bhistory\s*\.\s*(?:go|back|forward|pushState|replaceState)\b/i,
  // Exclude method calls such as xhr.open(...) by rejecting a preceding dot.
  /(?:^|[^\w$.-])(?:(?:window|self|top|parent|globalThis)\s*\.\s*)?open\s*(?:\.\s*(?:call|apply|bind)\s*)?\(/i,
  // Direct document replacement primitives are a straightforward cloaking
  // vector even when the URL itself does not change.
  /\bdocument\s*\.\s*(?:open|write|writeln)\b/i,
  /\bdocument\s*\.\s*(?:body|documentElement)\s*\.\s*(?:innerHTML|outerHTML|textContent)\s*(?:=|\+=|\|\|=|&&=|\?\?=)(?!=|>)/i,
  /\bdocument\s*\.\s*(?:body|documentElement)\s*\.\s*(?:replaceChildren|remove)\b/i,
  // HTML-level navigation and URL-changing document metadata.
  /<\s*meta\b[^>]*\bhttp-equiv\s*=\s*["']?\s*refresh\b/i,
  /<\s*base\b[^>]*\bhref\s*=/i,
  /<\s*link\b[^>]*\brel\s*=\s*["'][^"']*\bcanonical\b/i,
  /<\s*(?:a|area)\b[^>]*\bhref\s*=/i,
  /<\s*(?:form|button|input)\b[^>]*\b(?:action|formaction)\s*=/i,
  /\bjavascript\s*:/i,
];

function hasInjectedNavigation(value) {
  if (typeof value !== "string" || !value) return false;
  const inspection = injectedCodeInspectionText(value);
  return INJECTED_NAVIGATION_PATTERNS.some((pattern) => pattern.test(inspection));
}

/**
 * Split an HTML-ish custom-code blob into top-level elements and text runs.
 * Script/style contents are kept with their element, so a navigating script
 * can be dropped without discarding adjacent analytics or verification tags.
 */
function segmentInjectedMarkup(html) {
  const segments = [];
  const openingTag = /<([a-zA-Z][\w:-]*)\b[^>]*?(\/?)>/g;
  let cursor = 0;
  let match;

  while ((match = openingTag.exec(html))) {
    if (match.index > cursor) segments.push(html.slice(cursor, match.index));

    const name = match[1].toLowerCase();
    let end = openingTag.lastIndex;
    if (!match[2] && !INJECTED_CODE_VOID_ELEMENTS.has(name)) {
      const safeName = name.replace(/[^\w:-]/g, "");
      const closingTag = new RegExp(`</${safeName}\\s*>`, "i");
      const closing = closingTag.exec(html.slice(end));
      end = closing ? end + closing.index + closing[0].length : html.length;
    }

    segments.push(html.slice(match.index, end));
    cursor = end;
    openingTag.lastIndex = end;
  }

  if (cursor < html.length) segments.push(html.slice(cursor));
  return segments;
}

/**
 * Remove navigation-capable segments while preserving safe snippets verbatim.
 * Deliberately emits no log containing the rejected source: custom code can
 * contain secrets, identifiers, or user data that must not reach build logs.
 */
export function sanitizeInjectedMarkup(html) {
  if (typeof html !== "string" || !html.trim() || !hasInjectedNavigation(html)) {
    return html;
  }

  return segmentInjectedMarkup(html)
    .filter((segment) => !hasInjectedNavigation(segment))
    .join("");
}

function dropCodeUndefined(o) {
  const out = {};
  for (const k of ["head", "bodyStart", "bodyEnd"]) {
    if (typeof o[k] === "string" && o[k].trim()) out[k] = o[k];
  }
  return out;
}

/**
 * Resolve robots.txt crawl directives from the central config.
 * Returns empty arrays when the config is empty/disabled (inert).
 * @param {object} config
 * @returns {{ disallow: string[], allow: string[], extraSitemaps: string[] }}
 */
export function resolveCrawl(config) {
  const empty = { disallow: [], allow: [], extraSitemaps: [] };
  if (!isPlainObject(config) || config.enabled === false) return empty;
  const crawl = isPlainObject(config.crawl) ? config.crawl : {};
  return {
    disallow: Array.isArray(crawl.disallow) ? crawl.disallow.filter(Boolean) : [],
    allow: Array.isArray(crawl.allow) ? crawl.allow.filter(Boolean) : [],
    extraSitemaps: Array.isArray(crawl.extraSitemaps) ? crawl.extraSitemaps.filter(Boolean) : [],
  };
}

/**
 * Resolve a runtime redirect for a request path from the central redirect list.
 * Exact-match (trailing-slash insensitive). Returns null when nothing matches —
 * so an empty list is fully inert. Skips disabled/self/empty redirects.
 *
 * @param {Array} redirects   Array of { source, destination, type, enabled }.
 * @param {string} pathname   Request path, e.g. "/old-page".
 * @returns {{ destination: string, statusCode: 301|302 }|null}
 */
export function resolveRedirect(redirects, pathname) {
  if (!Array.isArray(redirects) || typeof pathname !== "string") return null;
  const normPath = stripTrailingSlash(pathname);
  for (const r of redirects) {
    if (!isPlainObject(r) || r.enabled === false) continue;
    const source = typeof r.source === "string" ? r.source : "";
    if (!source) continue;
    if (source === pathname || stripTrailingSlash(source) === normPath) {
      const destination = typeof r.destination === "string" ? r.destination : "";
      if (!destination || destination === source) continue;
      return { destination, statusCode: Number(r.type) === 302 ? 302 : 301 };
    }
  }
  return null;
}

/**
 * Resolve only the sitemap directives for a path (thin wrapper over resolveSeo).
 * @param {object} config
 * @param {{ path: string, pageType?: string, brandId?: string }} ctx
 * @returns {{ include?: boolean, priority?: number, changeFreq?: string }}
 */
export function resolveSitemap(config, ctx = {}) {
  return resolveSeo(config, ctx).sitemap || {};
}

export const __testing = { pickManaged, layer, isPlainObject, stripTrailingSlash };
