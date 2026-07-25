// Embeddable-widget registry.
//
// Third-party sites can embed selected AltFTool utilities via
// /embed/[slug] iframes; every embed carries a visible "Powered by AltFTool"
// attribution link back to the canonical tool page. Only self-contained
// widget-style tools are allowlisted — categories whose tools work without
// site context (calculators, generators, converters).

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

function toolCategories(tool = {}) {
  return (Array.isArray(tool.category) ? tool.category : [tool.category]).filter(Boolean);
}

export function isEmbeddable(slug) {
  const tool = toolMetaMap[slug];
  if (!tool) return false;
  return toolCategories(tool).some((category) => EMBEDDABLE_CATEGORY_SET.has(category));
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
        category:
          toolCategories(tool).find((category) => EMBEDDABLE_CATEGORY_SET.has(category)) ||
          "Calculators",
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
