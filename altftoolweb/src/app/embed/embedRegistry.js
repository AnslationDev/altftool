// Embeddable-widget registry.
//
// Third-party sites can embed selected AltFTool utilities via
// /embed/[slug] iframes; every embed carries a visible "Powered by AltFTool"
// attribution link back to the canonical tool page. Only self-contained
// widget-style tools are allowlisted — categories whose tools work without
// site context (calculators, generators, converters).

import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { PRODUCTION_SITE_URL } from "@/platform/seo/siteUrl";

export const EMBEDDABLE_CATEGORIES = [
  "Calculators",
  "Finance Calculators",
  "Health Calculators",
  "Generators",
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

/**
 * The copy-paste iframe snippet third-party sites use.
 * NOTE: EmbedPicker.jsx (client) carries a parallel buildSnippet — it cannot
 * import this file (toolMetaMap must stay server-side). Keep both in sync.
 */
export function buildEmbedSnippet(slug, name = "") {
  const title = String(name || toolMetaMap[slug]?.name || "AltFTool widget").replace(/"/g, "'");
  return [
    `<iframe src="${getEmbedUrl(slug)}"`,
    `  title="${title} — free AltFTool widget"`,
    `  width="100%" height="640" style="border:0;border-radius:12px;overflow:hidden"`,
    `  loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    `<p style="font-size:12px;margin:4px 0 0">Widget by <a href="${getEmbedAttributionUrl(slug)}">AltFTool — free online tools</a></p>`,
  ].join("\n");
}
