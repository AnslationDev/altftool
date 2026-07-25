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
// widget shape. AI-backed tools are excluded from rule 2: they call an API,
// which would break the "computes in your browser, nothing is sent" promise
// the embed program is built on.

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
