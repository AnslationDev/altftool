// @altftool/core/seo/schemas
//
// Dependency-free validation + normalization for the central SEO config doc.
//
// We intentionally avoid adding a runtime validation dependency (e.g. Zod) in
// Phase 1 so the engine ships without a new install step and stays trivially
// portable across the web (SSR) and admin (API) apps. The validators below are
// small, explicit, and return a normalized value plus a list of human-readable
// errors. They can be swapped for Zod later behind the same function surface.
//
// Validation runs at the ADMIN write boundary. The web read path is defensive
// and never throws — it coerces/falls back instead (see seoConfigSource.js).

export const SEO_RUNTIME_DOC_PATH = ["projects", "altftool", "seo", "runtime"];
export const SEO_RUNTIME_COLLECTION = "seo";
export const SEO_RUNTIME_DOC_ID = "runtime";

export const PAGE_TYPES = Object.freeze([
  "global",
  "tools",
  "blogs",
  "news",
  "policies",
  "landing",
  "brandrating",
  "buysmart",
  "exclusivedeals",
  "wattpad",
  "top",
  "homeserv",
  "altflovepdf",
  "altfloveimg",
]);

export const CHANGE_FREQS = Object.freeze([
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
]);

/** Canonical empty config — produces fully inert (pre-engine) output. */
export function emptySeoConfig() {
  return {
    enabled: false,
    version: 0,
    global: {},
    brands: {},
    types: {},
    rules: [],
    pages: {},
    redirects: [],
    crawl: { disallow: [], allow: [], extraSitemaps: [] },
  };
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value, max = 600) {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  return s.length > max ? s.slice(0, max) : s;
}

function asStringArray(value, maxItems = 50) {
  if (!Array.isArray(value)) return undefined;
  const arr = value.map((v) => String(v).trim()).filter(Boolean).slice(0, maxItems);
  return arr.length ? arr : undefined;
}

function asBool(value) {
  return typeof value === "boolean" ? value : undefined;
}

function asPriority(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.min(1, n));
}

function asChangeFreq(value) {
  const s = asString(value);
  return s && CHANGE_FREQS.includes(s) ? s : undefined;
}

function dropUndefined(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}

function normalizeRobots(robots) {
  if (!isPlainObject(robots)) return undefined;
  const out = dropUndefined({ index: asBool(robots.index), follow: asBool(robots.follow) });
  return Object.keys(out).length ? out : undefined;
}

function normalizeSitemap(sitemap) {
  if (!isPlainObject(sitemap)) return undefined;
  const out = dropUndefined({
    include: asBool(sitemap.include),
    priority: asPriority(sitemap.priority),
    changeFreq: asChangeFreq(sitemap.changeFreq),
  });
  return Object.keys(out).length ? out : undefined;
}

/** Allowed Twitter card types. */
export const TWITTER_CARD_TYPES = Object.freeze([
  "summary",
  "summary_large_image",
  "app",
  "player",
]);

function asTwitterCard(value) {
  const s = asString(value, 40);
  return s && TWITTER_CARD_TYPES.includes(s) ? s : undefined;
}

function asUrlOrPath(value, max = 600) {
  const s = asString(value, max);
  if (!s) return undefined;
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return undefined;
}

/** Normalize an Open Graph override block (per-page or global default). */
export function normalizeOg(og) {
  if (!isPlainObject(og)) return undefined;
  const out = dropUndefined({
    type: asString(og.type, 40),
    siteName: asString(og.siteName, 120),
    title: asString(og.title, 200),
    description: asString(og.description, 320),
    image: asString(og.image, 500),
    locale: asString(og.locale, 20),
  });
  return Object.keys(out).length ? out : undefined;
}

/** Normalize a Twitter card override block (per-page or global default). */
export function normalizeTwitter(twitter) {
  if (!isPlainObject(twitter)) return undefined;
  const out = dropUndefined({
    card: asTwitterCard(twitter.card),
    site: asString(twitter.site, 60),
    creator: asString(twitter.creator, 60),
    title: asString(twitter.title, 200),
    description: asString(twitter.description, 320),
    image: asString(twitter.image, 500),
  });
  return Object.keys(out).length ? out : undefined;
}

/** Normalize site-verification tokens (Google, Bing, Yandex, Pinterest, Facebook). */
export function normalizeVerification(v) {
  if (!isPlainObject(v)) return undefined;
  const out = dropUndefined({
    google: asString(v.google, 200),
    bing: asString(v.bing || v.msvalidate, 200),
    yandex: asString(v.yandex, 200),
    pinterest: asString(v.pinterest, 200),
    facebook: asString(v.facebook || v.facebookDomain, 200),
  });
  return Object.keys(out).length ? out : undefined;
}

/** Normalize hreflang alternates: [{ lang, href }] (href = path or absolute URL). */
export function normalizeHreflang(value) {
  if (!Array.isArray(value)) return undefined;
  const out = value
    .map((item) => {
      if (!isPlainObject(item)) return null;
      const lang = asString(item.lang || item.hreflang || item.locale, 20);
      const href = asUrlOrPath(item.href || item.url, 600);
      if (!lang || !href) return null;
      // Accept ISO-ish codes (en, en-US) or x-default.
      if (!/^(x-default|[a-z]{2}(-[a-zA-Z]{2})?)$/.test(lang)) return null;
      return { lang, href };
    })
    .filter(Boolean)
    .slice(0, 60);
  return out.length ? out : undefined;
}

/**
 * Normalize a per-page structured-data (JSON-LD) list. Accepts a single object
 * or an array of objects. Each entry is stored as-is after a size guard so the
 * admin can author arbitrary schema.org types. Strings are parsed as JSON.
 */
export function normalizeSchemaList(value) {
  let arr = value;
  if (typeof arr === "string") {
    const s = arr.trim();
    if (!s) return undefined;
    try {
      arr = JSON.parse(s);
    } catch {
      return undefined;
    }
  }
  if (isPlainObject(arr)) arr = [arr];
  if (!Array.isArray(arr)) return undefined;
  const out = [];
  for (const entry of arr) {
    if (!isPlainObject(entry)) continue;
    let serialized;
    try {
      serialized = JSON.stringify(entry);
    } catch {
      continue;
    }
    if (!serialized || serialized.length > 20000) continue;
    out.push(entry);
    if (out.length >= 20) break;
  }
  return out.length ? out : undefined;
}

/** Normalize a per-page content override (H1, intro, benefits, FAQs, body). */
export function normalizeContent(content) {
  if (!isPlainObject(content)) return undefined;
  const benefits = Array.isArray(content.benefits)
    ? content.benefits
        .map((b) => {
          if (Array.isArray(b)) return { title: asString(b[0], 120), body: asString(b[1], 600) };
          if (isPlainObject(b)) return { title: asString(b.title, 120), body: asString(b.body, 600) };
          return null;
        })
        .filter((b) => b && (b.title || b.body))
        .slice(0, 12)
    : undefined;
  const faqs = Array.isArray(content.faqs)
    ? content.faqs
        .map((f) => {
          if (Array.isArray(f)) return { q: asString(f[0], 300), a: asString(f[1], 1200) };
          if (isPlainObject(f)) return { q: asString(f.q || f.question, 300), a: asString(f.a || f.answer, 1200) };
          return null;
        })
        .filter((f) => f && f.q && f.a)
        .slice(0, 20)
    : undefined;
  const out = dropUndefined({
    h1: asString(content.h1, 200),
    intro: asString(content.intro, 2000),
    body: asString(content.body, 20000),
    useCases: asStringArray(content.useCases, 12),
    benefits: benefits && benefits.length ? benefits : undefined,
    faqs: faqs && faqs.length ? faqs : undefined,
  });
  return Object.keys(out).length ? out : undefined;
}

/** Normalize a per-page / per-type / brand override into the canonical shape. */
export function normalizeSeoEntry(entry) {
  if (!isPlainObject(entry)) return {};
  return dropUndefined({
    title: asString(entry.title, 200),
    description: asString(entry.description, 320),
    keywords: asStringArray(entry.keywords),
    image: asString(entry.image, 500),
    canonical: asString(entry.canonical, 500),
    type: asString(entry.type, 40),
    slug: asString(entry.slug, 200),
    noindex: asBool(entry.noindex),
    follow: asBool(entry.follow),
    robots: normalizeRobots(entry.robots),
    sitemap: normalizeSitemap(entry.sitemap),
    content: normalizeContent(entry.content),
    og: normalizeOg(entry.og),
    twitter: normalizeTwitter(entry.twitter),
    hreflang: normalizeHreflang(entry.hreflang),
    schema: normalizeSchemaList(entry.schema ?? entry.jsonLd ?? entry.structuredData),
  });
}

function normalizeBrand(brand) {
  if (!isPlainObject(brand)) return {};
  return dropUndefined({
    name: asString(brand.name, 120),
    shortName: asString(brand.shortName, 60),
    url: asString(brand.url, 300),
    titleTemplate: asString(brand.titleTemplate, 120),
    image: asString(brand.image || brand.ogImage, 500),
    twitterHandle: asString(brand.twitterHandle, 60),
    locale: asString(brand.locale, 20),
  });
}

function normalizeRule(rule, index) {
  if (!isPlainObject(rule) || !asString(rule.pathGlob)) return null;
  return dropUndefined({
    id: asString(rule.id) || `rule-${index}`,
    pathGlob: asString(rule.pathGlob, 300),
    order: Number.isFinite(Number(rule.order)) ? Number(rule.order) : index,
    enabled: asBool(rule.enabled) ?? true,
    note: asString(rule.note, 300),
    set: dropUndefined({
      noindex: asBool(rule?.set?.noindex),
      follow: asBool(rule?.set?.follow),
      image: asString(rule?.set?.image, 500),
      keywords: asStringArray(rule?.set?.keywords),
      priority: asPriority(rule?.set?.priority),
      changeFreq: asChangeFreq(rule?.set?.changeFreq),
      includeInSitemap: asBool(rule?.set?.includeInSitemap),
    }),
  });
}

function normalizeRedirect(redirect, index) {
  if (!isPlainObject(redirect)) return null;
  const source = asString(redirect.source, 500);
  const destination = asString(redirect.destination, 1000);
  if (!source || !destination) return null;
  if (!source.startsWith("/")) return null; // source must be an internal path
  const internalDest = destination.startsWith("/");
  const externalDest = /^https?:\/\//i.test(destination);
  if (!internalDest && !externalDest) return null;
  const type = Number(redirect.type) === 302 ? 302 : 301;
  return dropUndefined({
    id: asString(redirect.id) || `redirect-${index}`,
    source,
    destination,
    type,
    enabled: asBool(redirect.enabled) ?? true,
    note: asString(redirect.note, 300),
  });
}

/**
 * Validate + normalize a full runtime config document.
 * @param {any} input
 * @returns {{ ok: boolean, value: object, errors: string[] }}
 */
export function validateSeoConfig(input) {
  const errors = [];
  const base = emptySeoConfig();
  if (!isPlainObject(input)) {
    return { ok: false, value: base, errors: ["Config must be an object."] };
  }

  const value = emptySeoConfig();
  value.enabled = asBool(input.enabled) ?? false;
  value.version = Number.isFinite(Number(input.version)) ? Number(input.version) : 0;

  value.global = dropUndefined({
    siteName: asString(input?.global?.siteName, 120),
    siteTitle: asString(input?.global?.siteTitle, 120),
    defaultBrandId: asString(input?.global?.defaultBrandId, 60),
    titleTemplate: asString(input?.global?.titleTemplate, 120),
    title: asString(input?.global?.title || input?.global?.defaultTitle, 200),
    description: asString(input?.global?.description || input?.global?.defaultDescription, 320),
    keywords: asStringArray(input?.global?.keywords || input?.global?.defaultKeywords),
    image: asString(input?.global?.image || input?.global?.defaultOgImage || input?.global?.socialImage, 500),
    favicon: asUrlOrPath(input?.global?.favicon, 500),
    baseUrl: asUrlOrPath(input?.global?.baseUrl || input?.global?.canonicalBase || input?.global?.siteUrl, 300),
    robots: normalizeRobots(input?.global?.robots || input?.global?.defaultRobots),
    og: normalizeOg(input?.global?.og),
    twitter: normalizeTwitter(input?.global?.twitter),
    verification: normalizeVerification(input?.global?.verification),
  });

  if (isPlainObject(input.brands)) {
    for (const [id, brand] of Object.entries(input.brands)) {
      const norm = normalizeBrand(brand);
      if (Object.keys(norm).length) value.brands[id] = norm;
    }
  }

  if (isPlainObject(input.types)) {
    for (const [type, entry] of Object.entries(input.types)) {
      const norm = normalizeSeoEntry(entry);
      // type entries also carry sitemap default fields
      const sitemapDefaults = dropUndefined({
        defaultPriority: asPriority(entry?.defaultPriority ?? entry?.priority),
        defaultChangeFreq: asChangeFreq(entry?.defaultChangeFreq ?? entry?.changeFreq),
        includeInSitemap: asBool(entry?.includeInSitemap),
        titlePattern: asString(entry?.titlePattern, 120),
        descriptionPattern: asString(entry?.descriptionPattern, 320),
      });
      const merged = { ...norm, ...sitemapDefaults };
      if (Object.keys(merged).length) value.types[type] = merged;
    }
  }

  if (Array.isArray(input.rules)) {
    value.rules = input.rules.map(normalizeRule).filter(Boolean);
  }

  if (Array.isArray(input.redirects)) {
    value.redirects = input.redirects.map(normalizeRedirect).filter(Boolean);
    const seenSources = new Set();
    const destBySource = new Map(value.redirects.map((r) => [r.source, r.destination]));
    for (const r of value.redirects) {
      if (r.source === r.destination) errors.push(`Redirect "${r.source}" points to itself.`);
      if (seenSources.has(r.source)) errors.push(`Duplicate redirect source "${r.source}".`);
      seenSources.add(r.source);
      if (destBySource.get(r.destination) === r.source) {
        errors.push(`Redirect loop between "${r.source}" and "${r.destination}".`);
      }
    }
  }

  if (isPlainObject(input.pages)) {
    for (const [rawPath, entry] of Object.entries(input.pages)) {
      // Be forgiving: if an admin pastes a full URL, store its path instead.
      let path = rawPath;
      if (/^https?:\/\//i.test(path)) {
        try {
          path = new URL(path).pathname || "/";
        } catch {
          /* fall through to the validation below */
        }
      }
      if (!path.startsWith("/")) {
        errors.push(`Page override key "${rawPath}" must start with "/" (e.g. "/blogs/your-slug").`);
        continue;
      }
      const norm = normalizeSeoEntry(entry);
      if (Object.keys(norm).length) value.pages[path] = norm;
    }
  }

  // Crawl settings (Phase 2): robots.txt disallow/allow + extra sitemaps.
  if (isPlainObject(input.crawl)) {
    const disallow = (asStringArray(input.crawl.disallow, 200) || []).filter((p) => p.startsWith("/"));
    const allow = (asStringArray(input.crawl.allow, 200) || []).filter((p) => p.startsWith("/"));
    const extraSitemaps = (asStringArray(input.crawl.extraSitemaps, 50) || []).filter((u) =>
      /^https?:\/\//i.test(u),
    );
    value.crawl = { disallow, allow, extraSitemaps };
  }

  // Guardrail: a site-wide noindex is almost always a mistake.
  if (value.global?.robots?.index === false) {
    errors.push("Guardrail: global robots.index=false would noindex the entire site. Set per-page/per-type instead, or confirm explicitly.");
  }

  return { ok: errors.length === 0, value, errors };
}

export const __testing = { isPlainObject, asString, asStringArray, asPriority, asChangeFreq, normalizeRule };
