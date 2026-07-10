// ALTF Engine — Content Automation: SEO lane prompt + proposal validation.
// Proposes FULL per-page entries (title, description, keywords, og, twitter,
// JSON-LD schema). Proposals NEVER touch seo/runtime directly — an admin
// approves them through the existing audited saveSeoConfig path.

import { renderTemplate, resolveTemplate } from "./promptTemplates";

const TITLE_MAX = 60;
const DESC_MIN = 110;
const DESC_MAX = 160;

const ALLOWED_SCHEMA_TYPES = new Set([
  "WebPage",
  "WebSite",
  "Article",
  "BlogPosting",
  "FAQPage",
  "SoftwareApplication",
  "WebApplication",
  "BreadcrumbList",
  "HowTo",
  "ItemList",
  "CollectionPage",
  "AboutPage",
  "ContactPage",
]);

export const SEO_JSON_SCHEMA = {
  name: "altftool_seo_entry",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "description", "keywords", "ogTitle", "ogDescription", "twitterCard", "schema", "rationale"],
    properties: {
      title: { type: "string", description: `Meta title <= ${TITLE_MAX} chars, includes primary keyword.` },
      description: { type: "string", description: `Meta description ${DESC_MIN}-${DESC_MAX} chars, action-oriented.` },
      keywords: { type: "array", minItems: 3, maxItems: 8, items: { type: "string" } },
      ogTitle: { type: "string", description: "Open Graph title (may differ slightly from meta title)." },
      ogDescription: { type: "string", description: "Open Graph description <= 200 chars." },
      twitterCard: { type: "string", enum: ["summary", "summary_large_image"] },
      schema: {
        type: "array",
        minItems: 1,
        maxItems: 2,
        description: "JSON-LD objects appropriate for the page type, as JSON strings.",
        items: { type: "string" },
      },
      rationale: { type: "string", description: "1-2 sentences: why these changes help this page." },
    },
  },
};

export function buildSeoSystemPrompt(settings = {}) {
  return renderTemplate(resolveTemplate(settings, "seoSystem"), { brand: "AltFTool" });
}

export function buildSeoUserPrompt({ entry, current = {}, gscQueries = [] }, settings = {}) {
  return renderTemplate(resolveTemplate(settings, "seoUser"), {
    path: entry.path,
    pageType: entry.pageType || "page",
    h1Line: entry.h1 ? `H1: ${entry.h1}` : "",
    renderedTitleLine: `Current rendered title: ${entry.title || "(missing)"}`,
    renderedDescriptionLine: `Current rendered description: ${entry.description || "(missing)"}`,
    overrideTitleLine: current.title ? `Current override title: ${current.title}` : "",
    overrideDescriptionLine: current.description ? `Current override description: ${current.description}` : "",
    gscBlock: gscQueries.length
      ? `Top Search Console queries for this page (query | clicks | impressions | position):\n${gscQueries
          .map((q) => `- ${q.query} | ${q.clicks} | ${q.impressions} | ${q.position?.toFixed?.(1) ?? q.position}`)
          .join("\n")}`
      : "No Search Console data available for this page.",
  });
}

function clamp(text, max) {
  const t = String(text || "").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-]+$/, "");
}

function parseSchemaItem(raw) {
  try {
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
    const type = Array.isArray(obj["@type"]) ? obj["@type"][0] : obj["@type"];
    if (!obj["@context"] || !type || !ALLOWED_SCHEMA_TYPES.has(String(type))) return null;
    return obj;
  } catch {
    return null;
  }
}

/**
 * Validate + shape the model output into a per-page entry proposal
 * (the same shape `compactPageEntry` / the Pages editor persists).
 * Respects settings.seo.fields toggles. Returns { proposed, rationale } or null.
 */
export function normalizeSeoProposal(raw, fields = {}) {
  if (!raw || typeof raw !== "object") return null;

  const proposed = {};
  if (fields.title !== false) {
    const title = clamp(raw.title, TITLE_MAX);
    if (title) proposed.title = title;
  }
  if (fields.description !== false) {
    const description = clamp(raw.description, DESC_MAX + 20);
    if (description && description.length >= 70) proposed.description = description;
  }
  if (fields.keywords !== false && Array.isArray(raw.keywords)) {
    const keywords = [...new Set(raw.keywords.map((k) => String(k).trim().toLowerCase()).filter(Boolean))].slice(0, 8);
    if (keywords.length) proposed.keywords = keywords;
  }
  if (fields.og !== false) {
    const og = {};
    const ogTitle = clamp(raw.ogTitle, 90);
    const ogDescription = clamp(raw.ogDescription, 200);
    if (ogTitle) og.title = ogTitle;
    if (ogDescription) og.description = ogDescription;
    if (Object.keys(og).length) proposed.og = og;
  }
  if (fields.twitter !== false && ["summary", "summary_large_image"].includes(raw.twitterCard)) {
    proposed.twitter = { card: raw.twitterCard };
  }
  if (fields.schema !== false && Array.isArray(raw.schema)) {
    const schema = raw.schema.map(parseSchemaItem).filter(Boolean).slice(0, 2);
    if (schema.length) proposed.schema = schema;
  }
  // NOTE: code.head / bodyStart / bodyEnd are intentionally NEVER proposed by
  // the AI lane, even when settings.seo.fields.codeHead is true — JSON-LD goes
  // through the typed `schema` field instead. (High-risk surface; master.md.)

  if (!Object.keys(proposed).length) return null;
  return { proposed, rationale: clamp(raw.rationale, 280) };
}
