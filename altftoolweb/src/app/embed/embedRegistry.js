// Embeddable-widget registry.
//
// Third-party sites can embed selected AltFTool utilities via
// /embed/widget/[slug] iframes; every embed carries a visible
// "Widget by AltFTool" attribution link back to the canonical tool page.
// Only self-contained widget-style tools qualify: they must work without any
// site context and compute in the visitor's browser.
//
// Two ways in — a tool qualifies if EITHER matches:
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
// from AltFTool. Never restate the embed programme as "nothing ever leaves the
// browser"; see ALTFTOOL_POSITION in src/app/alternatives/data/incumbents.js
// for the accurate, scoped wording.

import "server-only";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { PRODUCTION_SITE_URL } from "@/platform/seo/siteUrl";
import { buildSnippet } from "./embedSnippet";

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

function toolCategories(tool = {}) {
  return (Array.isArray(tool.category) ? tool.category : [tool.category]).filter(Boolean);
}

export function isEmbeddable(slug) {
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
function embedCategoryOf(slug, tool) {
  const named = toolCategories(tool).find((category) => EMBEDDABLE_CATEGORY_SET.has(category));
  if (named) return named;
  return slug.endsWith("converter") ? "Converters" : "Calculators";
}

let cachedList = null;

/**
 * Slim `{slug, name, category}` list of every embeddable tool — kept minimal
 * because it is passed as props to the client-side hub picker.
 */
export function getEmbeddableTools() {
  if (!cachedList) {
    cachedList = Object.entries(toolMetaMap)
      .filter(([slug]) => isEmbeddable(slug))
      .map(([slug, tool]) => ({
        slug,
        name: tool.name || slug.replace(/-/g, " "),
        category: embedCategoryOf(slug, tool),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  return cachedList;
}

/** Absolute production URL of the embed iframe for a tool. */
export function getEmbedUrl(slug) {
  return `${PRODUCTION_SITE_URL}/embed/widget/${slug}`;
}

/** Canonical tool URL the attribution link points to. */
export function getEmbedAttributionUrl(slug) {
  return `${PRODUCTION_SITE_URL}/tools/all/${slug}?utm_source=embed&utm_medium=widget`;
}

/** The copy-paste iframe snippet third-party sites use. */
export function buildEmbedSnippet(slug, name = "") {
  return buildSnippet(
    PRODUCTION_SITE_URL,
    slug,
    name || toolMetaMap[slug]?.name || "AltFTool widget",
  );
}

/** Display name for a widget, without leaking a raw slug into markup. */
export function getEmbedToolName(slug) {
  return toolMetaMap[slug]?.name || "AltFTool widget";
}

// ---------------------------------------------------------------- oEmbed
//
// Hosts an oEmbed `url=` parameter may point at. An arbitrary URL must NEVER
// be echoed back into the `html` field — that is a stored-XSS vector on every
// site that consumes us. Everything the endpoint emits is rebuilt from a slug
// that survived isEmbeddable(), so the request string never reaches the markup.

const CANONICAL_EMBED_HOSTS = new Set(["altftool.com", "www.altftool.com"]);

/** `/embed/widget/<slug>` — the iframe document itself. */
const WIDGET_URL_PATH = /^\/embed\/widget\/([a-z0-9][a-z0-9-]*)\/?$/i;
/** `/tools/<category>/<slug>` — the canonical tool page, `all` included. */
const TOOL_URL_PATH = /^\/tools\/[a-z0-9][a-z0-9-]*\/([a-z0-9][a-z0-9-]*)\/?$/i;

/**
 * Resolve an incoming oEmbed `url=` to an embeddable slug, or `null`.
 *
 * `null` means 404: a foreign host, a path that is not a widget or tool page,
 * or a tool that is not in the embeddable set. `extraHosts` lets a preview or
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
  // mismatch rather than something to decode and re-check.
  const match = WIDGET_URL_PATH.exec(url.pathname) || TOOL_URL_PATH.exec(url.pathname);
  const slug = (match?.[1] || "").toLowerCase();
  if (!slug || !isEmbeddable(slug)) return null;

  return slug;
}

/** Discovery href advertised by `<link rel="alternate" type="application/json+oembed">`. */
export function getOEmbedEndpointUrl(slug) {
  return `${PRODUCTION_SITE_URL}/api/oembed?url=${encodeURIComponent(
    getEmbedUrl(slug),
  )}&format=json`;
}
