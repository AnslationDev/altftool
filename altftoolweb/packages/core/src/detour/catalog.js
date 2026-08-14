/**
 * AltF Detour — catalog assembly.
 *
 * Data lives in `data/*.js` as plain arrays so the files stay reviewable and
 * diffable. This module is the only place that knows they exist: it stitches
 * them together, normalises optional fields, and derives every index the pages
 * need so no page has to filter the full array itself.
 *
 * The whole catalog is a few hundred kilobytes of static data, so it is imported
 * directly rather than sharded and fetched. That keeps every page a static
 * render with no data layer, which is the entire reason the section is fast.
 */

import {
  CATEGORIES,
  CATEGORY_IDS,
  COLLECTIONS,
  FAMILIES,
  TIME_BANDS,
  VIBES,
} from "./taxonomy.js";
import { normaliseSite } from "./schema.js";

import { SITES as altfOriginals } from "./data/altf-originals.js";
import { SITES as playA } from "./data/play-a.js";
import { SITES as playB } from "./data/play-b.js";
import { SITES as playC } from "./data/play-c.js";
import { SITES as make } from "./data/make.js";
import { SITES as learnA } from "./data/learn-a.js";
import { SITES as learnB } from "./data/learn-b.js";
import { SITES as wander } from "./data/wander.js";
import { SITES as unwindLaugh } from "./data/unwind-laugh.js";
import { SITES as weird } from "./data/weird.js";
import { SITES as retro } from "./data/retro.js";

const RAW = [
  ...altfOriginals,
  ...playA,
  ...playB,
  ...playC,
  ...make,
  ...learnA,
  ...learnB,
  ...wander,
  ...unwindLaugh,
  ...weird,
  ...retro,
];

/**
 * Deduplicates by URL across data files.
 *
 * The files are authored independently, and plenty of sites have a legitimate
 * home in more than one category — a falling-sand game is both a sandbox sim
 * and a generative toy. Rather than force a single arbitrary owner at authoring
 * time, the collision is resolved here by a fixed rule so the outcome is
 * deterministic and reviewable:
 *
 *   1. Keep the copy in the category that has the fewest entries. A duplicate
 *      does more good propping up a thin landing page than padding a fat one.
 *   2. Tie-break on position in the concatenated array, which is fixed by the
 *      import order above — so the result never depends on iteration order.
 *
 * `DEDUPED` is surfaced in STATS rather than hidden, because a catalog that
 * quietly reports fewer sites than its source files contain is the kind of
 * discrepancy that costs somebody an afternoon later.
 */
/**
 * The key two entries must share to count as the same destination.
 *
 * Scheme, `www.` and trailing slashes are all stripped, because independent
 * authors reach the same site by different spellings of its address —
 * `https://www.cupcakeipsum.com/` and `https://cupcakeipsum.com/` are one
 * website, and a plain string comparison lists it twice.
 */
function urlKey(url) {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

function dedupeByUrl(sites) {
  const categorySize = new Map();
  sites.forEach((site) => {
    categorySize.set(site.category, (categorySize.get(site.category) ?? 0) + 1);
  });

  const best = new Map();
  sites.forEach((site, order) => {
    const key = urlKey(site.url);
    const current = best.get(key);
    if (!current) {
      best.set(key, { site, order });
      return;
    }

    const a = categorySize.get(site.category) ?? 0;
    const b = categorySize.get(current.site.category) ?? 0;

    // `order` is the array index, so it is unique and always breaks the tie.
    const wins = a !== b ? a < b : order < current.order;

    if (wins) best.set(key, { site, order });
  });

  const kept = new Set([...best.values()].map((entry) => entry.site));
  return sites.filter((site) => kept.has(site));
}

/**
 * Second dedupe pass, on display name.
 *
 * URL matching cannot catch a site reached through a genuinely different
 * domain — a Poki mirror of a game that also has its own site, a project that
 * moved from `search.marginalia.nu` to `marginalia-search.com`, or a `.com` and
 * `.net` serving the same thing. Independent authors found both and wrote both.
 *
 * Restricted to entries that share an `origin`. AltF builds its own versions of
 * some classics, and an original and its inspiration are two real destinations
 * that should both be listed — collapsing those would hide the external site
 * in favour of ours, which would be both wrong and self-serving.
 */
function dedupeByName(sites) {
  const categorySize = new Map();
  sites.forEach((site) => {
    categorySize.set(site.category, (categorySize.get(site.category) ?? 0) + 1);
  });

  const best = new Map();
  sites.forEach((site, order) => {
    const key = `${site.origin}::${site.name.trim().toLowerCase()}`;
    const current = best.get(key);
    if (!current) {
      best.set(key, { site, order });
      return;
    }

    const a = categorySize.get(site.category) ?? 0;
    const b = categorySize.get(current.site.category) ?? 0;
    if (a !== b ? a < b : order < current.order) {
      best.set(key, { site, order });
    }
  });

  const kept = new Set([...best.values()].map((entry) => entry.site));
  return sites.filter((site) => kept.has(site));
}

/**
 * Resolves slug collisions left over after the URL dedupe.
 *
 * Two genuinely different sites can land on the same slug — several "Solitaire"
 * and "Sandbox" pages exist at unrelated domains. A collision would make one of
 * the two detail pages unreachable, so the later entry is suffixed with its
 * category. Which entry keeps the bare slug is decided by data-file order,
 * which is fixed in this module, so it never changes between builds.
 */
function disambiguateSlugs(sites) {
  const seen = new Set();
  return sites.map((site) => {
    if (!seen.has(site.slug)) {
      seen.add(site.slug);
      return site;
    }

    let candidate = `${site.slug}-${site.category}`;
    let counter = 2;
    while (seen.has(candidate)) {
      candidate = `${site.slug}-${site.category}-${counter}`;
      counter += 1;
    }
    seen.add(candidate);
    return { ...site, slug: candidate };
  });
}

const DEDUPED_SITES = disambiguateSlugs(
  dedupeByName(dedupeByUrl(RAW.map(normaliseSite))),
);

/** How many entries the URL dedupe removed. Reported, never hidden. */
export const DEDUPED = RAW.length - DEDUPED_SITES.length;

/**
 * Sorted by name so the catalog order is stable across builds. Anything that
 * wants a different order (browse, category pages) sorts explicitly — relying
 * on file concatenation order would make diffs meaningless.
 */
export const ALL_SITES = Object.freeze(
  [...DEDUPED_SITES].sort((a, b) => a.name.localeCompare(b.name, "en")),
);

export const SITE_COUNT = ALL_SITES.length;

const BY_SLUG = new Map(ALL_SITES.map((site) => [site.slug, site]));

export function getSite(slug) {
  return BY_SLUG.get(slug) ?? null;
}

// --------------------------------------------------------------- indexes ---

function groupBy(sites, key) {
  const map = new Map();
  sites.forEach((site) => {
    const value = site[key];
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(site);
  });
  return map;
}

const BY_CATEGORY = groupBy(ALL_SITES, "category");
const BY_TIME = groupBy(ALL_SITES, "timeToJoy");

const BY_VIBE = new Map();
ALL_SITES.forEach((site) => {
  site.vibes.forEach((vibe) => {
    if (!BY_VIBE.has(vibe)) BY_VIBE.set(vibe, []);
    BY_VIBE.get(vibe).push(site);
  });
});

const BY_FAMILY = new Map();
ALL_SITES.forEach((site) => {
  const category = CATEGORIES.find((c) => c.id === site.category);
  if (!category) return;
  if (!BY_FAMILY.has(category.family)) BY_FAMILY.set(category.family, []);
  BY_FAMILY.get(category.family).push(site);
});

const BY_COLLECTION = new Map(
  COLLECTIONS.map((collection) => [
    collection.id,
    ALL_SITES.filter((site) => collection.rule(site)),
  ]),
);

export function getSitesByCategory(id) {
  return BY_CATEGORY.get(id) ?? [];
}

export function getSitesByFamily(id) {
  return BY_FAMILY.get(id) ?? [];
}

export function getSitesByVibe(id) {
  return BY_VIBE.get(id) ?? [];
}

export function getSitesByTimeBand(id) {
  return BY_TIME.get(id) ?? [];
}

export function getSitesByCollection(id) {
  return BY_COLLECTION.get(id) ?? [];
}

export const ALTF_ORIGINALS = Object.freeze(
  ALL_SITES.filter((site) => site.origin === "altf"),
);

export const ACCLAIMED = Object.freeze(
  ALL_SITES.filter((site) => site.acclaimed),
);

// ----------------------------------------------------------------- facets ---

/** Counts for every facet, computed once. Rendered on browse and in nav. */
export const FACETS = Object.freeze({
  category: Object.freeze(
    Object.fromEntries(CATEGORY_IDS.map((id) => [id, getSitesByCategory(id).length])),
  ),
  family: Object.freeze(
    Object.fromEntries(FAMILIES.map((f) => [f.id, getSitesByFamily(f.id).length])),
  ),
  vibe: Object.freeze(
    Object.fromEntries(VIBES.map((v) => [v.id, getSitesByVibe(v.id).length])),
  ),
  timeToJoy: Object.freeze(
    Object.fromEntries(TIME_BANDS.map((b) => [b.id, getSitesByTimeBand(b.id).length])),
  ),
  collection: Object.freeze(
    Object.fromEntries(
      COLLECTIONS.map((c) => [c.id, getSitesByCollection(c.id).length]),
    ),
  ),
});

export const STATS = Object.freeze({
  sites: SITE_COUNT,
  categories: CATEGORIES.length,
  families: FAMILIES.length,
  originals: ALTF_ORIGINALS.length,
  external: SITE_COUNT - ALTF_ORIGINALS.length,
  collections: COLLECTIONS.length,
  vibes: VIBES.length,
  dedupedFromSourceFiles: DEDUPED,
  // Quoted verbatim to answer engines via the manifest, so they are derived
  // here rather than counted again there and allowed to drift.
  free: ALL_SITES.filter((site) => site.free && !site.needsAccount).length,
  mobileFriendly: ALL_SITES.filter((site) => site.bestOn !== "desktop").length,
  safeForWork: ALL_SITES.filter((site) => site.sfw && !site.needsSound).length,
  acclaimed: ACCLAIMED.length,
});

// ------------------------------------------------------------ relateds ---

/**
 * Related sites for a detail page. Same category first, then same vibe, then
 * same time band — so the list degrades gracefully in a thin category rather
 * than rendering three cards and a lot of white space.
 */
export function getRelatedSites(site, limit = 8) {
  if (!site) return [];
  const seen = new Set([site.slug]);
  const out = [];

  const push = (candidates) => {
    for (const candidate of candidates) {
      if (out.length >= limit) return;
      if (seen.has(candidate.slug)) continue;
      seen.add(candidate.slug);
      out.push(candidate);
    }
  };

  push(getSitesByCategory(site.category));
  site.vibes.forEach((vibe) => push(getSitesByVibe(vibe)));
  push(getSitesByTimeBand(site.timeToJoy));

  return out;
}
