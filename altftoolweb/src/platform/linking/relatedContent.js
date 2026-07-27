// Relevance scoring over the internal-linking content graph.
//
// Pure, deterministic functions: token overlap between a source page's
// metadata and every graph item, with slot-based mixing so each page type
// controls how many links it shows from which sections. Server-side only
// (pulls the full content graph).

import { getContentGraph, DUPLICATE_HREFS, SECTION_LABELS } from "./contentGraph";

const STOP_WORDS = new Set([
  "about", "after", "all", "also", "and", "any", "are", "best", "blog", "can",
  "for", "free", "from", "get", "guide", "how", "into", "list", "more", "new",
  "off", "one", "online", "our", "out", "read", "than", "that", "the", "this",
  "tool", "tools", "top", "use", "with", "you", "your", "altftool",
]);

function tokenize(value = "") {
  return String(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function normalizeTag(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const itemIndex = new WeakMap();

function indexItem(item) {
  let indexed = itemIndex.get(item);
  if (!indexed) {
    indexed = {
      titleTokens: new Set(tokenize(item.title)),
      tagTokens: new Set(item.tags.flatMap(tokenize)),
      descriptionTokens: new Set(tokenize(item.description)),
      exactTags: new Set(item.tags.map(normalizeTag).filter(Boolean)),
    };
    itemIndex.set(item, indexed);
  }
  return indexed;
}

function buildSourceIndex(source = {}) {
  const tags = Array.isArray(source.tags) ? source.tags : [source.tags];
  const cleanTags = tags.filter(Boolean);
  return {
    tokens: new Set([
      ...tokenize(source.title),
      ...cleanTags.flatMap(tokenize),
      ...tokenize(source.description),
    ]),
    exactTags: new Set(cleanTags.map(normalizeTag).filter(Boolean)),
    href: source.href ? String(source.href).replace(/\/+$/, "") || "/" : null,
  };
}

function scoreItem(item, sourceIndex) {
  const indexed = indexItem(item);
  let score = 0;

  sourceIndex.tokens.forEach((token) => {
    if (indexed.tagTokens.has(token)) score += 4;
    if (indexed.titleTokens.has(token)) score += 3;
    if (indexed.descriptionTokens.has(token)) score += 1;
  });

  let exactMatches = 0;
  sourceIndex.exactTags.forEach((tag) => {
    if (indexed.exactTags.has(tag)) exactMatches += 1;
  });
  score += Math.min(exactMatches, 2) * 10;

  return score;
}

function decorate(item, score = 0) {
  return {
    href: item.href,
    title: item.title,
    description: item.description,
    section: item.section,
    sectionLabel: SECTION_LABELS[item.section] || "Explore",
    score,
  };
}

/**
 * Compute related internal links for a page.
 *
 * @param {object} options
 * @param {object} options.source
 *   `{ href, title, description, tags, section }` describing the current page.
 *   `href` (self) is always excluded from results.
 * @param {Array}  options.slots
 *   Ordered slot definitions: `{ sections: ["tools", ...], limit, minScore }`.
 *   Each slot picks its top-scoring items from the named sections; items
 *   already chosen by earlier slots are skipped. A slot that comes up short
 *   is topped up from the "hubs" section so bands never render half-empty.
 * @param {string[]} options.excludeHrefs  Additional hrefs to skip.
 * @returns {Array<{href, title, description, section, sectionLabel, score}>}
 */
export function getRelatedContent({ source = {}, slots = [], excludeHrefs = [] } = {}) {
  const graph = getContentGraph();
  const sourceIndex = buildSourceIndex(source);
  const taken = new Set(
    [
      sourceIndex.href,
      // A page must never recommend its own duplicate-route twin.
      sourceIndex.href ? DUPLICATE_HREFS[sourceIndex.href] : null,
      ...excludeHrefs.map((href) => String(href).replace(/\/+$/, "") || "/"),
    ].filter(Boolean),
  );
  const picked = [];

  const scored = new Map();
  const getScore = (item) => {
    if (!scored.has(item.href)) scored.set(item.href, scoreItem(item, sourceIndex));
    return scored.get(item.href);
  };

  slots.forEach((slot) => {
    const sections = new Set(slot.sections || []);
    const minScore = slot.minScore ?? 2;
    const limit = slot.limit ?? 3;

    const candidates = graph
      .filter((item) => sections.has(item.section) && !taken.has(item.href))
      .map((item) => ({ item, score: getScore(item) }))
      .filter(({ score }) => score >= minScore)
      .sort((a, b) => b.score - a.score || a.item.href.localeCompare(b.item.href))
      .slice(0, limit);

    candidates.forEach(({ item, score }) => {
      taken.add(item.href);
      picked.push(decorate(item, score));
    });

    const shortfall = limit - candidates.length;
    if (shortfall > 0 && !sections.has("hubs")) {
      graph
        .filter((item) => item.section === "hubs" && !taken.has(item.href))
        .slice(0, shortfall)
        .forEach((item) => {
          taken.add(item.href);
          picked.push(decorate(item, 0));
        });
    }
  });

  return picked;
}

/**
 * Convenience presets so page templates stay consistent. Each returns the
 * flat item list for `RelatedContentSection`.
 */
export const RELATED_PRESETS = {
  // Interactive tool/calculator/game pages: guides + adjacent utilities.
  //
  // `alternatives` gets its own slot rather than sharing the guides slot.
  // Comparison items carry the mapped tool slugs as tags, so they score very
  // highly on a matching tool page and would otherwise take both guide slots.
  // The slot includes "hubs" purely to suppress the shortfall top-up: when no
  // comparison clears minScore the band simply renders one item shorter,
  // instead of padding itself with an unrelated hub link.
  utility: [
    { sections: ["blogs", "top9", "top11"], limit: 2 },
    { sections: ["tools", "calculators", "pdfTools", "imageTools"], limit: 3 },
    { sections: ["alternatives", "hubs"], limit: 1, minScore: 8 },
    { sections: ["experiences", "games", "products", "hubs"], limit: 1, minScore: 0 },
  ],
  // Editorial pages (listicles, news, facts): tools + more reading.
  editorial: [
    { sections: ["tools", "calculators", "deals"], limit: 3 },
    { sections: ["blogs", "top9", "top11", "news"], limit: 2 },
    { sections: ["alternatives", "hubs"], limit: 1, minScore: 8 },
    { sections: ["hubs"], limit: 1, minScore: 0 },
  ],
  // Landing/SEO pages (locations, landers, signals): broad discovery.
  discovery: [
    { sections: ["tools", "toolCategories"], limit: 2 },
    { sections: ["blogs", "top9", "deals"], limit: 2 },
    { sections: ["experiences", "products", "hubs"], limit: 2, minScore: 0 },
  ],
};

export function getRelatedContentForPreset(source, presetName, options = {}) {
  const slots = RELATED_PRESETS[presetName] || RELATED_PRESETS.discovery;
  return getRelatedContent({ source, slots, ...options });
}
