// ALTF Engine — Meta SEO Management client-side model helpers.
// Pure functions to read/merge slices of the central seo/runtime config and to
// import/export page overrides as CSV. No I/O here.

export const DEFAULT_BASE_URL = "https://altftool.com";

// Page-type taxonomy offered in the per-page editor / filters. Mirrors the
// core PAGE_TYPES but excludes the "global" pseudo-type.
export const PAGE_TYPE_OPTIONS = [
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
];

export const CHANGE_FREQ_OPTIONS = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
];

export const TWITTER_CARD_OPTIONS = ["summary", "summary_large_image", "app", "player"];

export function getBaseUrl(config) {
  return (config?.global?.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

export function buildAbsoluteUrl(config, pathOrUrl) {
  const value = String(pathOrUrl || "/");
  if (/^https?:\/\//i.test(value)) return value;
  return `${getBaseUrl(config)}${value.startsWith("/") ? value : `/${value}`}`;
}

/** A blank per-page override entry (used by the workspace editor). */
export function emptyPageEntry() {
  return {
    title: "",
    description: "",
    keywords: [],
    canonical: "",
    slug: "",
    noindex: false,
    follow: true,
    sitemap: { include: undefined, priority: undefined, changeFreq: undefined },
    og: { title: "", description: "", image: "", type: "" },
    twitter: { card: "", title: "", description: "", image: "" },
    hreflang: [],
    schema: [],
  };
}

/** Merge a stored page entry over the blank template so the form is controlled. */
export function readPageEntry(config, path) {
  const stored = config?.pages?.[path] || {};
  const base = emptyPageEntry();
  return {
    ...base,
    ...stored,
    keywords: Array.isArray(stored.keywords) ? stored.keywords : [],
    sitemap: { ...base.sitemap, ...(stored.sitemap || {}) },
    og: { ...base.og, ...(stored.og || {}) },
    twitter: { ...base.twitter, ...(stored.twitter || {}) },
    hreflang: Array.isArray(stored.hreflang) ? stored.hreflang : [],
    schema: Array.isArray(stored.schema) ? stored.schema : [],
    // robots stored either flat (noindex/follow) or nested; flatten for the form
    noindex: typeof stored.noindex === "boolean" ? stored.noindex : stored?.robots?.index === false,
    follow: typeof stored.follow === "boolean" ? stored.follow : stored?.robots?.follow !== false,
  };
}

/** Strip empty values so we don't persist noise into the config doc. */
export function compactPageEntry(form) {
  const out = {};
  const put = (k, v) => {
    if (v === undefined || v === null) return;
    if (typeof v === "string" && !v.trim()) return;
    if (Array.isArray(v) && !v.length) return;
    out[k] = v;
  };
  put("title", form.title?.trim());
  put("description", form.description?.trim());
  put("keywords", (form.keywords || []).map((k) => k.trim()).filter(Boolean));
  put("canonical", form.canonical?.trim());
  put("slug", form.slug?.trim());
  if (form.noindex === true) out.noindex = true;
  if (form.follow === false) out.follow = false;

  const sm = {};
  if (typeof form.sitemap?.include === "boolean") sm.include = form.sitemap.include;
  if (form.sitemap?.priority !== undefined && form.sitemap?.priority !== "")
    sm.priority = Number(form.sitemap.priority);
  if (form.sitemap?.changeFreq) sm.changeFreq = form.sitemap.changeFreq;
  if (Object.keys(sm).length) out.sitemap = sm;

  const og = compactPlain(form.og);
  if (og) out.og = og;
  const tw = compactPlain(form.twitter);
  if (tw) out.twitter = tw;

  const hreflang = (form.hreflang || [])
    .map((h) => ({ lang: (h.lang || "").trim(), href: (h.href || "").trim() }))
    .filter((h) => h.lang && h.href);
  if (hreflang.length) out.hreflang = hreflang;

  if (Array.isArray(form.schema) && form.schema.length) out.schema = form.schema;
  return out;
}

function compactPlain(obj) {
  if (!obj || typeof obj !== "object") return undefined;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string" && v.trim()) out[k] = v.trim();
    else if (typeof v === "number" || typeof v === "boolean") out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

/** Effective values used for the live previews (entry over global defaults). */
export function effectivePreview(config, path, form) {
  const g = config?.global || {};
  const title = form.title || form.og?.title || g.title || g.siteName || "";
  const description = form.description || form.og?.description || g.description || "";
  const image = form.og?.image || form.image || g.image || "";
  return {
    url: buildAbsoluteUrl(config, form.canonical || path),
    title,
    description,
    image: image ? buildAbsoluteUrl(config, image) : "",
    siteName: g.og?.siteName || g.siteName || "AltFTool",
    twitterCard: form.twitter?.card || g.twitter?.card || "summary_large_image",
  };
}

// ---------------------------------------------------------------------------
// CSV import / export for bulk page overrides
// ---------------------------------------------------------------------------

export const CSV_COLUMNS = [
  "path",
  "title",
  "description",
  "keywords",
  "canonical",
  "slug",
  "noindex",
  "follow",
  "ogTitle",
  "ogDescription",
  "ogImage",
  "twitterCard",
  "priority",
  "changeFreq",
];

function csvEscape(value) {
  const s = value === undefined || value === null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Serialize page overrides (optionally a subset of paths) to a CSV string. */
export function pagesToCsv(pages = {}, paths) {
  const keys = paths && paths.length ? paths : Object.keys(pages);
  const rows = [CSV_COLUMNS.join(",")];
  for (const path of keys) {
    const p = pages[path] || {};
    const noindex = p.noindex === true || p?.robots?.index === false;
    const follow = p.follow === false || p?.robots?.follow === false ? false : true;
    const cells = [
      path,
      p.title || "",
      p.description || "",
      (p.keywords || []).join("|"),
      p.canonical || "",
      p.slug || "",
      noindex ? "true" : "false",
      follow ? "true" : "false",
      p.og?.title || "",
      p.og?.description || "",
      p.og?.image || "",
      p.twitter?.card || "",
      p.sitemap?.priority ?? "",
      p.sitemap?.changeFreq || "",
    ];
    rows.push(cells.map(csvEscape).join(","));
  }
  return rows.join("\n");
}

/** Minimal RFC-4180-ish CSV parser (handles quotes, commas, newlines). */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const src = String(text || "").replace(/\r\n?/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length && r.some((c) => c.trim() !== ""));
}

/**
 * Parse CSV text into a partial { pages } object + a list of human errors.
 * Only the `path` column is required; all others are optional.
 */
export function csvToPages(text) {
  const rows = parseCsv(text);
  const errors = [];
  const pages = {};
  if (!rows.length) return { pages, errors: ["CSV is empty."] };

  const header = rows[0].map((h) => h.trim());
  const idx = (name) => header.indexOf(name);
  if (idx("path") === -1) return { pages, errors: ['CSV must include a "path" column.'] };

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const get = (name) => {
      const i = idx(name);
      return i === -1 ? "" : (cells[i] ?? "").trim();
    };
    const path = get("path");
    if (!path) {
      errors.push(`Row ${r + 1}: missing path — skipped.`);
      continue;
    }
    if (!path.startsWith("/")) {
      errors.push(`Row ${r + 1}: path "${path}" must start with "/" — skipped.`);
      continue;
    }
    const entry = {};
    const title = get("title");
    if (title) entry.title = title;
    const description = get("description");
    if (description) entry.description = description;
    const keywords = get("keywords");
    if (keywords)
      entry.keywords = keywords
        .split(/[|,]/)
        .map((k) => k.trim())
        .filter(Boolean);
    const canonical = get("canonical");
    if (canonical) entry.canonical = canonical;
    const slug = get("slug");
    if (slug) entry.slug = slug;
    if (/^(true|1|yes)$/i.test(get("noindex"))) entry.noindex = true;
    if (/^(false|0|no)$/i.test(get("follow"))) entry.follow = false;
    const og = {};
    if (get("ogTitle")) og.title = get("ogTitle");
    if (get("ogDescription")) og.description = get("ogDescription");
    if (get("ogImage")) og.image = get("ogImage");
    if (Object.keys(og).length) entry.og = og;
    const card = get("twitterCard");
    if (card) entry.twitter = { card };
    const sitemap = {};
    const priority = get("priority");
    if (priority !== "") {
      const n = Number(priority);
      if (Number.isFinite(n)) sitemap.priority = Math.max(0, Math.min(1, n));
    }
    const changeFreq = get("changeFreq");
    if (changeFreq && CHANGE_FREQ_OPTIONS.includes(changeFreq)) sitemap.changeFreq = changeFreq;
    if (Object.keys(sitemap).length) entry.sitemap = sitemap;

    pages[path] = entry;
  }
  return { pages, errors };
}

/** Trigger a client-side file download. */
export function downloadFile(filename, content, mime = "text/csv;charset=utf-8") {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
