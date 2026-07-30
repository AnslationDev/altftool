// Embeddable-widget registry.
//
// Third-party sites can embed selected AltFTool utilities via
// /embed/widget/<widgetId> iframes; every embed carries a visible
// "Widget by AltFTool" attribution link back to the page the widget came from.
// Only self-contained widget-style tools qualify: they must work without any
// site context, and they must work inside a cross-origin iframe.
//
// ── Sources ──────────────────────────────────────────────────────────────────
// The registry is a union of independent SOURCES, each of which owns its own
// slug space, its own membership rule, and its own public path. A widget is
// addressed by a widget id (see embedSnippet.js for the grammar):
//
//   tool         bare slug           /tools/all/<slug>       (the launch family)
//   transform    transform/<slug>    /transform/<slug>       (format converters)
//   exam-photo   exam-photo/<slug>   /exam-photo/<slug>      (photo resizers)
//
// The bare form is deliberately reserved for `tool`: iframes pasted into
// third-party pages since launch point at /embed/widget/<toolSlug>, and those
// must keep resolving exactly as they did. Namespacing also keeps collisions
// honest — `xml-to-json` is BOTH a /tools/all tool and a /transform converter,
// and they are two different widgets.
//
// ── The `tool` membership rule ────────────────────────────────────────────────
// A tool qualifies if EITHER matches:
//   1. its canonical category is one of EMBEDDABLE_CATEGORIES, or
//   2. its slug is calculator/converter-shaped (`*-calculator` / `*-converter`).
// Rule 2 exists because the canonical taxonomy is coarse: the single most
// embeddable widgets we have — loan-emi-calculator ("Business"),
// bmi-calculator and the calorie set ("Health & Fitness"),
// currency-converter ("Business") — carry categories that say nothing about
// widget shape. AI-backed tools are excluded: a model call is slow, metered
// and rate-limited, which is not something to hand to an arbitrary third-party
// page. That exclusion is a cost/abuse boundary, NOT a claim that every other
// widget is offline-only — currency-converter, for one, fetches live rates
// from AltFTool, and 34 of the /transform converters run on our server. Never
// restate the embed programme as "nothing ever leaves the browser"; see
// ALTFTOOL_POSITION in src/app/alternatives/data/incumbents.js for the
// accurate, scoped wording.

import "server-only";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { PRODUCTION_SITE_URL } from "@/platform/seo/siteUrl";
import { getAllTools as getAllTransformTools, getToolBySlug as getTransformTool } from "@/app/transform/_lib/manifest";
import { EXAM_SPECS, getExamBySlug } from "@/app/exam-photo/data/examSpecs";
import {
  buildAttributionUrl,
  buildPublicUrl,
  buildSnippet,
  buildWidgetUrl,
  formatWidgetId,
  parseWidgetId,
} from "./embedSnippet";

// NOTE: "Generators" is a canonical taxonomy category but currently matches
// zero tools in toolMetaMap (generator tools carry other canonical
// categories), so it is intentionally not listed here.
export const EMBEDDABLE_CATEGORIES = [
  "Calculators",
  "Finance Calculators",
  "Health Calculators",
  "Converters",
];

const EMBEDDABLE_CATEGORY_SET = new Set(EMBEDDABLE_CATEGORIES);

/** Widget-shaped slugs: "…-calculator" / "…-converter" (or exactly that word). */
const WIDGET_SLUG_PATTERN = /(^|-)(calculator|converter)$/;

/** API-backed tools can't honour the "nothing leaves your browser" promise. */
const NON_CLIENT_SIDE_CATEGORY = "AI Tools";

/** Picker bucket for the whole /transform family. */
const TRANSFORM_CATEGORY = "Developer converters";
/** Picker bucket for the whole /exam-photo family. */
const EXAM_PHOTO_CATEGORY = "Exam photo & signature";

function toolCategories(tool = {}) {
  return (Array.isArray(tool.category) ? tool.category : [tool.category]).filter(Boolean);
}

function isEmbeddableToolSlug(slug) {
  const tool = toolMetaMap[slug];
  if (!tool) return false;

  const categories = toolCategories(tool);
  if (categories.includes(NON_CLIENT_SIDE_CATEGORY)) return false;

  return (
    categories.some((category) => EMBEDDABLE_CATEGORY_SET.has(category)) ||
    WIDGET_SLUG_PATTERN.test(slug)
  );
}

/** Picker bucket for a tool — falls back to slug shape for coarse categories. */
function toolEmbedCategory(slug, tool) {
  const named = toolCategories(tool).find((category) => EMBEDDABLE_CATEGORY_SET.has(category));
  if (named) return named;
  return slug.endsWith("converter") ? "Converters" : "Calculators";
}

/**
 * The source table. Each entry answers three questions for its slug space:
 * is this slug embeddable, what are all of them, and what is this one called.
 *
 * `groupLabel` / `groupBlurb` are what the /embed hub prints for the family;
 * `category` is the picker's filter bucket.
 */
const SOURCES = [
  {
    key: "tool",
    groupLabel: "Calculators & converters",
    groupBlurb:
      "Every AltFTool calculator and converter that stands on its own — finance, health, unit and format widgets.",
    has: isEmbeddableToolSlug,
    list: () =>
      Object.entries(toolMetaMap)
        .filter(([slug]) => isEmbeddableToolSlug(slug))
        .map(([slug, tool]) => ({
          slug,
          name: tool.name || slug.replace(/-/g, " "),
          category: toolEmbedCategory(slug, tool),
        })),
    nameOf: (slug) => toolMetaMap[slug]?.name || null,
  },
  {
    key: "transform",
    groupLabel: "Developer format converters",
    groupBlurb:
      "The /transform converters — JSON, GraphQL, TypeScript, SVG, YAML and friends. Built for a docs page or a tutorial that already explains the format.",
    has: (slug) => Boolean(getTransformTool(slug)),
    list: () =>
      getAllTransformTools().map((tool) => ({
        slug: tool.slug,
        name: `${tool.title} Converter`,
        category: TRANSFORM_CATEGORY,
      })),
    nameOf: (slug) => {
      const tool = getTransformTool(slug);
      return tool ? `${tool.title} Converter` : null;
    },
  },
  {
    key: "exam-photo",
    groupLabel: "Exam photo & signature resizers",
    groupBlurb:
      "The /exam-photo resizers. Each one targets the KB and pixel box printed in one exam's own notice, and resizes in the visitor's browser.",
    // An exam with no uploadable file has nothing to resize (SSC captures the
    // photograph live), so it only qualifies once it declares an asset.
    has: (slug) => (getExamBySlug(slug)?.assets || []).length > 0,
    list: () =>
      EXAM_SPECS.filter((exam) => (exam.assets || []).length > 0).map((exam) => ({
        slug: exam.slug,
        name: `${exam.name} photo & signature resizer`,
        category: EXAM_PHOTO_CATEGORY,
      })),
    nameOf: (slug) => {
      const exam = getExamBySlug(slug);
      return exam ? `${exam.name} photo & signature resizer` : null;
    },
  },
];

const SOURCE_BY_KEY = new Map(SOURCES.map((source) => [source.key, source]));

/**
 * Is this widget id one we serve?
 *
 * Takes a widget id: a bare tool slug (the launch form) or `<source>/<slug>`.
 * Anything that is not a well-formed id for a known source is false, which is
 * what makes this safe to use as the oEmbed endpoint's gate.
 */
export function isEmbeddable(id) {
  const parsed = parseWidgetId(id);
  if (!parsed) return false;
  const source = SOURCE_BY_KEY.get(parsed.source);
  return Boolean(source?.has(parsed.slug));
}

let cachedList = null;
let cachedGroups = null;

/**
 * Slim `{id, name, category, source}` list of every embeddable widget — kept
 * minimal because it is passed as props to the client-side hub picker.
 *
 * `id` is the widget id, so it is also the path under /embed/widget/ and the
 * argument every other function here takes.
 */
export function getEmbeddableTools() {
  if (!cachedList) {
    cachedList = SOURCES.flatMap((source) =>
      source.list().map((entry) => ({
        id: formatWidgetId({ source: source.key, slug: entry.slug }),
        name: entry.name,
        category: entry.category,
        source: source.key,
      })),
    ).sort((a, b) => a.name.localeCompare(b.name));
  }
  return cachedList;
}

/**
 * The same widgets, grouped by source, for the hub's family summary. Counts are
 * derived here so no page can print a stale literal.
 */
export function getEmbeddableGroups() {
  if (!cachedGroups) {
    const all = getEmbeddableTools();
    cachedGroups = SOURCES.map((source) => {
      const widgets = all.filter((entry) => entry.source === source.key);
      return {
        key: source.key,
        label: source.groupLabel,
        blurb: source.groupBlurb,
        count: widgets.length,
        // A few real examples per family, so the hub links somewhere concrete.
        examples: widgets.slice(0, 4).map(({ id, name }) => ({ id, name })),
      };
    }).filter((group) => group.count > 0);
  }
  return cachedGroups;
}

/** Every filter bucket the picker offers, in source order. */
export function getEmbedCategories() {
  const seen = new Set();
  const ordered = [];
  for (const category of [...EMBEDDABLE_CATEGORIES, TRANSFORM_CATEGORY, EXAM_PHOTO_CATEGORY]) {
    if (seen.has(category)) continue;
    seen.add(category);
    ordered.push(category);
  }
  return ordered;
}

/** Absolute production URL of the embed iframe for a widget. */
export function getEmbedUrl(id) {
  return buildWidgetUrl(PRODUCTION_SITE_URL, id);
}

/** Public page URL the attribution link points to, tagged. */
export function getEmbedAttributionUrl(id) {
  return buildAttributionUrl(PRODUCTION_SITE_URL, id);
}

/** Public page path (no origin, no tagging) — the widget's canonical. */
export function getEmbedCanonicalPath(id) {
  return buildPublicUrl("", id);
}

/** The copy-paste iframe snippet third-party sites use. */
export function buildEmbedSnippet(id, name = "") {
  return buildSnippet(PRODUCTION_SITE_URL, id, name || getEmbedToolName(id));
}

/** Display name for a widget, without leaking a raw id into markup. */
export function getEmbedToolName(id) {
  const parsed = parseWidgetId(id);
  const source = parsed && SOURCE_BY_KEY.get(parsed.source);
  return (source && source.nameOf(parsed.slug)) || "AltFTool widget";
}

// ---------------------------------------------------------------- oEmbed
//
// Hosts an oEmbed `url=` parameter may point at. An arbitrary URL must NEVER
// be echoed back into the `html` field — that is a stored-XSS vector on every
// site that consumes us. Everything the endpoint emits is rebuilt from a widget
// id that survived isEmbeddable(), so the request string never reaches the
// markup.

const CANONICAL_EMBED_HOSTS = new Set(["altftool.com", "www.altftool.com"]);

/**
 * Paths a `url=` parameter may point at. Each entry maps a matched path to a
 * widget id; the id is then re-validated by isEmbeddable() before anything is
 * emitted, so a pattern being loose here cannot widen what we serve.
 *
 * Both the widget document and its public page resolve, because publishers
 * paste either one.
 */
const RESOLVABLE_PATHS = [
  // `/embed/widget/<slug>` — a launch-family widget document.
  { pattern: /^\/embed\/widget\/([a-z0-9][a-z0-9-]*)\/?$/i, source: "tool" },
  // `/tools/<category>/<slug>` — the canonical tool page, `all` included.
  { pattern: /^\/tools\/[a-z0-9][a-z0-9-]*\/([a-z0-9][a-z0-9-]*)\/?$/i, source: "tool" },
  // `/embed/widget/transform/<slug>` and `/transform/<slug>`.
  { pattern: /^\/embed\/widget\/transform\/([a-z0-9][a-z0-9-]*)\/?$/i, source: "transform" },
  { pattern: /^\/transform\/([a-z0-9][a-z0-9-]*)\/?$/i, source: "transform" },
  // `/embed/widget/exam-photo/<slug>` and `/exam-photo/<slug>`.
  { pattern: /^\/embed\/widget\/exam-photo\/([a-z0-9][a-z0-9-]*)\/?$/i, source: "exam-photo" },
  { pattern: /^\/exam-photo\/([a-z0-9][a-z0-9-]*)\/?$/i, source: "exam-photo" },
];

/**
 * Resolve an incoming oEmbed `url=` to an embeddable widget id, or `null`.
 *
 * `null` means 404: a foreign host, a path that is not a widget or public page,
 * or a widget that is not in the embeddable set. `extraHosts` lets a preview or
 * local deployment resolve its own origin without widening production.
 */
export function resolveEmbeddableSlugFromUrl(value, { extraHosts = [] } = {}) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  const allowed =
    CANONICAL_EMBED_HOSTS.has(host) ||
    extraHosts.some((extra) => String(extra || "").toLowerCase() === host);
  if (!allowed) return null;

  // Match the raw pathname: slugs are ASCII, so an encoded path is a
  // mismatch rather than something to decode and re-check. The namespaced
  // patterns are listed after the bare ones but cannot be shadowed by them —
  // a bare `/embed/widget/<slug>` is one segment and `/embed/widget/transform/
  // <slug>` is two, so at most one pattern can match a given path.
  for (const { pattern, source } of RESOLVABLE_PATHS) {
    const match = pattern.exec(url.pathname);
    if (!match) continue;
    const id = formatWidgetId({ source, slug: (match[1] || "").toLowerCase() });
    return isEmbeddable(id) ? id : null;
  }

  return null;
}

/** Discovery href advertised by `<link rel="alternate" type="application/json+oembed">`. */
export function getOEmbedEndpointUrl(id) {
  return `${PRODUCTION_SITE_URL}/api/oembed?url=${encodeURIComponent(
    getEmbedUrl(id),
  )}&format=json`;
}
