/*
 * AltF Atlas — catalog assembly and selectors
 *
 * Entries live in data/*.js, split by category group purely so no single file
 * becomes unreviewable. This module concatenates them, validates the shape at
 * import time, and exposes every read the pages need.
 *
 * ENTRY SHAPE
 * -----------
 *   slug        kebab-case, unique, permanent — it is the URL
 *   name        display name, as the site writes it
 *   url         canonical https URL (omit for retired entries with no host)
 *   domain      bare host, used for the favicon and the "who is this" line
 *   tagline     ONE job, <= 95 chars, no trailing full stop, no marketing
 *   what        2–4 sentences. What it does, who it suits, where it stops.
 *   category    a CATEGORY slug
 *   access      an ACCESS_LEVELS id
 *   runtime     a RUNTIMES id
 *   status      a STATUSES id
 *   tags        3–6 lowercase keywords
 *   useCases    USE_CASES slugs this entry answers (may be empty)
 *   collections COLLECTIONS slugs this entry belongs to (may be empty)
 *   bestFor     2–4 short phrases naming the person/situation it fits
 *   limits      ONE honest sentence about where the free version stops
 *   altf        { label, href } — the AltFTool tool that does the same job
 *   checked     ISO date the entry was last opened and verified (REQUIRED)
 *   successor   slug of a live entry (REQUIRED when status is "retired")
 *   legacy      true when the entry appeared on the classic 2008–2014 lists
 *
 * The `limits` field is load-bearing. A directory where every entry is
 * described as excellent carries no information; the sentence that says where
 * a tool stops is the only reason to trust the sentence that says what it does.
 */

import {
  ACCESS_IDS,
  CATEGORY_BY_SLUG,
  CATEGORY_SLUGS,
  COLLECTION_SLUGS,
  USE_CASE_SLUGS,
} from "./taxonomy.js";

import { ENTRIES as MAKE_AND_EDIT } from "./data/make-and-edit.js";
import { ENTRIES as BUILD_AND_ANALYSE } from "./data/build-and-analyse.js";
import { ENTRIES as WORK_AND_ORGANISE } from "./data/work-and-organise.js";
import { ENTRIES as LEARN_AND_LIVE } from "./data/learn-and-live.js";
import { ENTRIES as ARCHIVE } from "./data/archive.js";

const RAW_ENTRIES = [
  ...MAKE_AND_EDIT,
  ...BUILD_AND_ANALYSE,
  ...WORK_AND_ORGANISE,
  ...LEARN_AND_LIVE,
  ...ARCHIVE,
];

/*
 * Validation runs once at module load. These are authoring mistakes, not
 * runtime conditions — a bad category slug silently drops an entry off its
 * category page and nothing else complains, which is exactly the kind of bug
 * that survives to production. Failing the build is cheaper.
 */
function validate(entries) {
  const seen = new Set();
  const slugs = new Set(entries.map((entry) => entry.slug));
  const problems = [];

  for (const entry of entries) {
    const at = entry.slug || entry.name || "<unnamed>";

    if (!entry.slug) problems.push(`${at}: missing slug`);
    if (seen.has(entry.slug)) problems.push(`${at}: duplicate slug`);
    seen.add(entry.slug);

    if (!entry.name) problems.push(`${at}: missing name`);
    if (!entry.tagline) problems.push(`${at}: missing tagline`);
    if (entry.tagline && entry.tagline.length > 95) {
      problems.push(`${at}: tagline is ${entry.tagline.length} chars (max 95)`);
    }
    if (!CATEGORY_SLUGS.includes(entry.category)) {
      problems.push(`${at}: unknown category "${entry.category}"`);
    }
    if (!ACCESS_IDS.includes(entry.access)) {
      problems.push(`${at}: unknown access "${entry.access}"`);
    }
    for (const slug of entry.useCases || []) {
      if (!USE_CASE_SLUGS.includes(slug)) {
        problems.push(`${at}: unknown use case "${slug}"`);
      }
    }
    for (const slug of entry.collections || []) {
      if (!COLLECTION_SLUGS.includes(slug)) {
        problems.push(`${at}: unknown collection "${slug}"`);
      }
    }
    if (entry.status === "retired") {
      if (!entry.successor) {
        problems.push(`${at}: retired entry has no successor`);
      } else if (!slugs.has(entry.successor)) {
        problems.push(
          `${at}: successor "${entry.successor}" is not in the catalog`,
        );
      }
    }
    if (entry.status === "live" && !entry.url) {
      problems.push(`${at}: live entry has no url`);
    }
    // The whole pitch of this directory is that entries were opened rather
    // than scraped, so an undated entry is an unsupported claim.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.checked || "")) {
      problems.push(`${at}: missing or malformed checked date`);
    }
  }

  if (problems.length) {
    throw new Error(
      `AltF Atlas catalog is invalid:\n  - ${problems.join("\n  - ")}`,
    );
  }

  return entries;
}

/* Sorted by name so every listing has a stable, predictable order without a
   per-page sort. Deliberately not sorted by any quality score — the Atlas
   does not rank entries against each other, it filters them. */
export const ENTRIES = validate(RAW_ENTRIES).sort((a, b) =>
  a.name.localeCompare(b.name, "en"),
);

export const ENTRY_BY_SLUG = Object.fromEntries(
  ENTRIES.map((entry) => [entry.slug, entry]),
);

export const LIVE_ENTRIES = ENTRIES.filter((entry) => entry.status === "live");

export const RETIRED_ENTRIES = ENTRIES.filter(
  (entry) => entry.status === "retired",
);

/* ---------------------------- selectors ---------------------------- */

export function getEntry(slug) {
  return ENTRY_BY_SLUG[slug] || null;
}

export function entriesInCategory(slug, { includeRetired = false } = {}) {
  return (includeRetired ? ENTRIES : LIVE_ENTRIES).filter(
    (entry) => entry.category === slug,
  );
}

export function entriesForUseCase(slug) {
  return LIVE_ENTRIES.filter((entry) => (entry.useCases || []).includes(slug));
}

export function entriesInCollection(slug) {
  return LIVE_ENTRIES.filter((entry) =>
    (entry.collections || []).includes(slug),
  );
}

export function entriesWithTag(tag) {
  const needle = String(tag).toLowerCase();
  return LIVE_ENTRIES.filter((entry) =>
    (entry.tags || []).some((value) => value.toLowerCase() === needle),
  );
}

/*
 * Related entries for a detail page. Same category first, then anything
 * sharing a use case, so the block is never empty even for a lone entry in a
 * thin category. Ordered by overlap so the most relevant sit at the top.
 */
export function relatedEntries(entry, limit = 6) {
  if (!entry) return [];

  const scored = LIVE_ENTRIES.filter(
    (candidate) => candidate.slug !== entry.slug,
  )
    .map((candidate) => {
      let score = 0;
      if (candidate.category === entry.category) score += 4;
      score +=
        2 *
        (candidate.useCases || []).filter((slug) =>
          (entry.useCases || []).includes(slug),
        ).length;
      score += (candidate.tags || []).filter((tag) =>
        (entry.tags || []).includes(tag),
      ).length;
      if (candidate.access === entry.access) score += 1;
      return { candidate, score };
    })
    .filter((row) => row.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.candidate.name.localeCompare(b.candidate.name),
    );

  return scored.slice(0, limit).map((row) => row.candidate);
}

/*
 * Derived views are memoised.
 *
 * The catalog is frozen at import, so every one of these is a pure function of
 * data that cannot change — but they are called from generateStaticParams,
 * generateMetadata and the page body of every route, which is three or more
 * recomputations per render. Left uncached, the tag grouping alone is
 * O(tags x entries) and pushed a route past its compile budget.
 *
 * Callers receive the same object each time, so treat the results as
 * read-only; nothing in this module mutates them.
 */
function memo(compute) {
  let value;
  let computed = false;
  return () => {
    if (!computed) {
      value = compute();
      computed = true;
    }
    return value;
  };
}

/* Counts for every facet. Every filter chip in the UI shows a number, and a
   chip that leads to an empty page is a bug users blame themselves for. */
export const getFacetCounts = memo(() => {
  const category = {};
  const access = {};
  const runtime = {};
  const useCase = {};
  const collection = {};

  for (const entry of LIVE_ENTRIES) {
    category[entry.category] = (category[entry.category] || 0) + 1;
    access[entry.access] = (access[entry.access] || 0) + 1;
    runtime[entry.runtime] = (runtime[entry.runtime] || 0) + 1;
    for (const slug of entry.useCases || []) {
      useCase[slug] = (useCase[slug] || 0) + 1;
    }
    for (const slug of entry.collections || []) {
      collection[slug] = (collection[slug] || 0) + 1;
    }
  }

  return { category, access, runtime, useCase, collection };
});

export function getAtlasStats() {
  const facets = getFacetCounts();
  return {
    total: ENTRIES.length,
    live: LIVE_ENTRIES.length,
    retired: RETIRED_ENTRIES.length,
    categories: CATEGORY_SLUGS.filter((slug) => facets.category[slug] > 0)
      .length,
    open: facets.access.open || 0,
    onDevice: facets.runtime.local || 0,
    legacy: ENTRIES.filter((entry) => entry.legacy).length,
  };
}

/*
 * Search across the fields a person actually types. Scored rather than
 * boolean so an exact name match outranks a tag brush — a search for "figma"
 * should not open with six sites that merely tag themselves "design".
 */
export function searchEntries(query, { limit = 40 } = {}) {
  const needle = String(query || "")
    .trim()
    .toLowerCase();
  if (needle.length < 2) return [];

  return LIVE_ENTRIES.map((entry) => {
    const name = entry.name.toLowerCase();
    let score = 0;

    if (name === needle) score += 100;
    else if (name.startsWith(needle)) score += 60;
    else if (name.includes(needle)) score += 40;

    if ((entry.domain || "").toLowerCase().includes(needle)) score += 30;
    if (entry.tagline.toLowerCase().includes(needle)) score += 12;
    if ((entry.tags || []).some((tag) => tag.includes(needle))) score += 10;
    if ((entry.what || "").toLowerCase().includes(needle)) score += 4;

    const category = CATEGORY_BY_SLUG[entry.category];
    if (category && category.name.toLowerCase().includes(needle)) score += 6;

    return { entry, score };
  })
    .filter((row) => row.score > 0)
    .sort(
      (a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name),
    )
    .slice(0, limit)
    .map((row) => row.entry);
}

/* ------------------------------ tags ------------------------------ *
 * Tags become real routes, but only above a threshold. A tag page with two
 * entries is a thin page: it competes with its own category for the same
 * query and gives a reader less than the category would have. Below the
 * threshold the tag still filters in the UI, it just has no URL.
 */
export const TAG_PAGE_MIN_ENTRIES = 5;

/* Tags are authored as human phrases ("file transfer", "open source"), so the
   URL form has to be derived rather than used raw. */
export function tagSlug(tag) {
  return String(tag)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const getTagCounts = memo(() => {
  const counts = {};
  for (const entry of LIVE_ENTRIES) {
    for (const tag of entry.tags || []) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  return counts;
});

/* slug -> entries, built in ONE pass over the catalog. Grouping by re-scanning
   all entries per tag is O(tags x entries), which at 691 tags was slow enough
   to push a route past its compile budget. */
const getEntriesBySlug = memo(() => {
  const bySlug = new Map();
  for (const entry of LIVE_ENTRIES) {
    // A single entry can carry two spellings of the same tag; it must only be
    // counted once against the slug they share.
    const slugs = new Set((entry.tags || []).map(tagSlug).filter(Boolean));
    for (const slug of slugs) {
      const list = bySlug.get(slug) || [];
      list.push(entry);
      bySlug.set(slug, list);
    }
  }
  return bySlug;
});

/*
 * Tags are grouped BY SLUG, not by their authored string.
 *
 * "open source" and "open-source" were authored as separate tags by different
 * passes over the data and produced the same slug — which would have been two
 * generateStaticParams entries for one route, a hard build failure. Merging
 * here means a future inconsistency degrades to one correctly-counted page
 * instead. The label shown is the most common spelling.
 */
export const getIndexableTags = memo(() => {
  const bySlug = getEntriesBySlug();
  const labels = new Map();

  // Pick the display label per slug: the most-used spelling wins.
  for (const [tag, count] of Object.entries(getTagCounts())) {
    const slug = tagSlug(tag);
    if (!slug) continue;
    const current = labels.get(slug);
    if (!current || count > current.count) labels.set(slug, { tag, count });
  }

  return [...bySlug.entries()]
    .map(([slug, list]) => ({
      tag: labels.get(slug)?.tag || slug,
      slug,
      count: list.length,
    }))
    .filter((row) => row.count >= TAG_PAGE_MIN_ENTRIES)
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
});

const getIndexableTagBySlug = memo(
  () => new Map(getIndexableTags().map((row) => [row.slug, row])),
);

export function getTagBySlug(slug) {
  return getIndexableTagBySlug().get(slug) || null;
}

/* Matches on the slug, so "file-transfer" finds entries tagged
   "file transfer" without the caller needing to know the authored form. */
export function entriesWithTagSlug(slug) {
  return getEntriesBySlug().get(slug) || [];
}

/* --------------------------- freshness --------------------------- */

/** Most recent verification date across the catalog, as an ISO string. */
export function getLastCheckedDate() {
  return LIVE_ENTRIES.reduce(
    (latest, entry) => (entry.checked > latest ? entry.checked : latest),
    "0000-00-00",
  );
}

/* ---------------------------- compare ---------------------------- *
 * Resolve an arbitrary list of slugs for the compare surface. Unknown slugs
 * are dropped rather than throwing — the slugs arrive from a user-editable
 * query string, so a stale or hand-typed link must degrade to "show me what
 * I can find" instead of an error page.
 */
export const COMPARE_MAX = 4;

export function resolveComparison(slugs = []) {
  const seen = new Set();
  const resolved = [];
  for (const slug of slugs) {
    if (seen.has(slug) || resolved.length >= COMPARE_MAX) continue;
    const entry = getEntry(slug);
    if (entry) {
      resolved.push(entry);
      seen.add(slug);
    }
  }
  return resolved;
}

/* The categories that actually have entries, with counts attached — used by
   the home grid, the category index and the header menu. */
export function getPopulatedCategories() {
  const counts = getFacetCounts().category;
  return CATEGORY_SLUGS.map((slug) => ({
    ...CATEGORY_BY_SLUG[slug],
    count: counts[slug] || 0,
  })).filter((category) => category.count > 0);
}
