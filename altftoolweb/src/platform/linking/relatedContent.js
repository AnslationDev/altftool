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

// An exact-tag hit is worth 10 — more than any token match — so the tag has to
// actually mean something. Most graph sections build `tags` from
// `slug.split("-")`, which drops bare fragments ("top", "up", "number", "9")
// into the tag set, and those collide across unrelated catalogues: the
// /top9/top-9-dog-breeds source tags contain "top", so
// /tools/all/sip-top-up-percentage-calculator scored 10 and shipped as a
// "related" link on a page about dog breeds. Keeping only tags that survive
// tokenize() (>2 chars, not a stop word) removes that whole class of match
// while leaving real short tags — "seo", "pdf", "utm", "ai tools" — intact.
function meaningfulTags(values = []) {
  return values
    .map(normalizeTag)
    .filter((tag) => tag && tokenize(tag).length > 0);
}

const itemIndex = new WeakMap();

function indexItem(item) {
  let indexed = itemIndex.get(item);
  if (!indexed) {
    indexed = {
      titleTokens: new Set(tokenize(item.title)),
      tagTokens: new Set(item.tags.flatMap(tokenize)),
      descriptionTokens: new Set(tokenize(item.description)),
      exactTags: new Set(meaningfulTags(item.tags)),
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
    exactTags: new Set(meaningfulTags(cleanTags)),
    href: source.href ? String(source.href).replace(/\/+$/, "") || "/" : null,
  };
}

function scoreItem(item, sourceIndex) {
  const indexed = indexItem(item);
  let score = 0;
  // How many DISTINCT source words the item answers to, across all fields.
  // The score alone cannot tell "one incidental word, matched three ways"
  // apart from "three different words agree", and the two are not equally
  // related — see the corroboration rule in getRelatedContent().
  let breadth = 0;

  sourceIndex.tokens.forEach((token) => {
    let matched = false;
    if (indexed.tagTokens.has(token)) {
      score += 4;
      matched = true;
    }
    if (indexed.titleTokens.has(token)) {
      score += 3;
      matched = true;
    }
    if (indexed.descriptionTokens.has(token)) {
      score += 1;
      matched = true;
    }
    if (matched) breadth += 1;
  });

  let exactMatches = 0;
  sourceIndex.exactTags.forEach((tag) => {
    if (indexed.exactTags.has(tag)) exactMatches += 1;
  });
  score += Math.min(exactMatches, 2) * 10;

  return { score, breadth, exactMatches };
}

/** Extra strongly-matched tool links a single slot may keep past its `limit`. */
const EXTRA_TOOL_LINKS = 2;

// Relevance floor for those extra links, in two parts that have to hold
// together. Neither works alone, measured against the real source objects:
//
//   score >= 12 puts the agreement in the candidate's tags or title rather
//   than buried in its description — three description-only hits score 3.
//
//   breadth >= 3 makes three DIFFERENT page words agree, not one word counted
//   three ways. This is what separates a pool from a coincidence: every
//   spurious match on /top9/best-call-of-duty-games scored 17-18 on breadth 1
//   (one whole shared tag — "duty" from `slug.split("-")` — worth 10, which is
//   why a shared tag is not on its own proof of anything), while the genuine
//   pools run 3-6 wide (/altflovepdf/merge-pdf → 13/6, 13/4, 13/3;
//   /altfcalculators/loan-emi-calculator → 32/6, 30/4, 29/3).
//
// Together they also exclude both of the pages that had no real pool at all:
// the dog-breeds listicle tops out at 9, the Minneapolis ICE-raid story at 8.
const STRONG_MATCH = 12;
const STRONG_BREADTH = 3;

// CORROBORATION. One shared word is a coincidence, not a relationship. A tag
// hit alone clears the default minScore of 2 (it is worth 4), so a single
// incidental token used to be enough to publish a link: an ICE-raid news story
// listed /tools/all/fire-number-calculator and
// /tools/all/home-fire-safety-checklist because both answer to "fire". Ask for
// a second, independent signal — two different source words, or one whole
// meaningful tag — before a link is allowed out.
//
// Slots that pass `minScore: 0` are deliberate "always fill" slots (hubs,
// experiences) whose job is to keep a band from rendering half-empty, so they
// are exempt.
function qualifies(match, minScore) {
  if (minScore <= 0) return true;
  return match.exactMatches > 0 || match.breadth >= 2;
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
 *   Slots that ask for a real relevance bar (`minScore > 0`) also require
 *   corroboration, and may run past `limit` to keep tied tool matches — see
 *   CORROBORATION and TIE EXTENSION below.
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

    const ranked = graph
      .filter((item) => sections.has(item.section) && !taken.has(item.href))
      .map((item) => ({ item, match: getScore(item) }))
      .filter(({ match }) => match.score >= minScore && qualifies(match, minScore))
      .sort(
        (a, b) => b.match.score - a.match.score || a.item.href.localeCompare(b.item.href),
      );

    // STRONG-MATCH EXTENSION. A slot's `limit` is a layout budget, not a
    // statement about how many related tools exist. On a page with a deep
    // topical pool the cut is arbitrary: /altflovepdf/merge-pdf has 47
    // qualifying tools and shipped 2. Let such a slot keep a couple more, but
    // only from the tool catalogue — /tools/all/* is the family with no other
    // way in, since a tool page is neither prerendered nor linked from a
    // listing, so a band slot is often its only crawlable inbound anchor.
    //
    // The extra links clear a HIGHER bar than the ones they follow, not the
    // same one — see STRONG_MATCH/STRONG_BREADTH. Admitting anything merely
    // tied with the last pick just gives a page more of its own noise: that
    // rule grew /top9/top-9-dog-breeds from two pet tools to five by adding
    // three kids-screen-time planners. A page with no real pool extends by
    // nothing, which is the right answer — no tool is related to a news story
    // about a raid.
    const candidates = ranked.slice(0, limit);
    if (candidates.length === limit) {
      ranked
        .slice(limit)
        .filter(
          ({ item, match }) =>
            item.section === "tools" &&
            match.score >= STRONG_MATCH &&
            match.breadth >= STRONG_BREADTH,
        )
        .slice(0, EXTRA_TOOL_LINKS)
        .forEach((entry) => candidates.push(entry));
    }

    candidates.forEach(({ item, match }) => {
      taken.add(item.href);
      picked.push(decorate(item, match.score));
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
  utility: [
    { sections: ["blogs", "top9", "top11"], limit: 2 },
    { sections: ["tools", "calculators", "pdfTools", "imageTools"], limit: 3 },
    { sections: ["experiences", "games", "products", "hubs"], limit: 1, minScore: 0 },
  ],
  // Editorial pages (listicles, news, facts): tools + more reading.
  editorial: [
    { sections: ["tools", "calculators", "deals"], limit: 3 },
    { sections: ["blogs", "top9", "top11", "news"], limit: 2 },
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
