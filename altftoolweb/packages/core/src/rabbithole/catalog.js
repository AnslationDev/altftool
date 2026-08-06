/**
 * AltF Rabbithole — catalog assembly.
 *
 * The site entries are curated by hand across several source files. This module
 * concatenates them, validates every record against the taxonomy, and derives
 * the lookups the pages need.
 *
 * Validation THROWS. The catalog is static data compiled at build time, so a
 * malformed entry is always an authoring mistake and always fixable — failing
 * the build is far better than shipping a category page that silently lost
 * half its entries. Duplicates are the one recoverable case: the first entry
 * wins and the collision is recorded in CATALOG_NOTES for review.
 */

import {
  CATEGORY_IDS,
  COLLECTIONS,
  DEVICES,
  TIME_BAND_IDS,
  VIBE_IDS,
} from "./taxonomy.js";
import { hashString } from "./hash.js";
import { EXPERIENCE_CATALOG } from "../experienceCatalog.js";

import part1 from "./sites/part-1.js";
import part2 from "./sites/part-2.js";
import part3 from "./sites/part-3.js";
import part4 from "./sites/part-4.js";
import part5 from "./sites/part-5.js";

const SOURCES = [
  ["part-1", part1],
  ["part-2", part2],
  ["part-3", part3],
  ["part-4", part4],
  ["part-5", part5],
];

// Checked during validation so a typo cannot silently blank the "we built one
// too" panel while still counting toward STATS.altfBuilds.
const EXPERIENCE_SLUGS = new Set(EXPERIENCE_CATALOG.map((item) => item.slug));

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_BLURB = 90;

const notes = [];

function fail(file, index, slug, message) {
  throw new Error(
    `[rabbithole] ${file}[${index}]${slug ? ` (${slug})` : ""}: ${message}`,
  );
}

/**
 * Lowercased hostname plus the case-preserving path and sorted query for URL
 * identity. DNS hostnames are case-insensitive; paths, query keys, and query
 * values are not guaranteed to be.
 *
 * The query string is part of the identity because some entries live on a
 * shared host and are told apart only by a parameter. Ignoring it silently
 * deduped two genuinely different sites down to one, and the loser vanished
 * from the catalog with nothing but a line in CATALOG_NOTES to show for it.
 */
export function urlIdentity(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    const query = [...parsed.searchParams.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    return `${host}${path}${query ? `?${query}` : ""}`;
  } catch {
    return String(url).trim();
  }
}

function validate(entry, file, index) {
  const slug = entry?.slug;

  if (!entry || typeof entry !== "object") {
    fail(file, index, null, "entry is not an object");
  }
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
    fail(file, index, slug, `slug must be kebab-case, got ${JSON.stringify(slug)}`);
  }
  if (typeof entry.name !== "string" || !entry.name.trim()) {
    fail(file, index, slug, "name is required");
  }
  if (typeof entry.url !== "string" || !/^https?:\/\//i.test(entry.url)) {
    fail(file, index, slug, `url must be absolute http(s), got ${JSON.stringify(entry.url)}`);
  }
  if (!CATEGORY_IDS.includes(entry.category)) {
    fail(file, index, slug, `unknown category ${JSON.stringify(entry.category)}`);
  }
  if (typeof entry.blurb !== "string" || !entry.blurb.trim()) {
    fail(file, index, slug, "blurb is required");
  }
  if (entry.blurb.length > MAX_BLURB) {
    fail(file, index, slug, `blurb is ${entry.blurb.length} chars, max ${MAX_BLURB}`);
  }
  if (typeof entry.description !== "string" || entry.description.trim().length < 80) {
    fail(file, index, slug, "description must be at least 80 characters");
  }
  if (typeof entry.whyItsGood !== "string" || !entry.whyItsGood.trim()) {
    fail(file, index, slug, "whyItsGood is required");
  }
  if (!TIME_BAND_IDS.includes(entry.timeToJoy)) {
    fail(file, index, slug, `unknown timeToJoy ${JSON.stringify(entry.timeToJoy)}`);
  }
  if (!Array.isArray(entry.vibes) || entry.vibes.length < 1 || entry.vibes.length > 3) {
    fail(file, index, slug, "vibes must be an array of 1-3 ids");
  }
  for (const vibe of entry.vibes) {
    if (!VIBE_IDS.includes(vibe)) {
      fail(file, index, slug, `unknown vibe ${JSON.stringify(vibe)}`);
    }
  }
  if (!DEVICES.includes(entry.bestOn)) {
    fail(file, index, slug, `unknown bestOn ${JSON.stringify(entry.bestOn)}`);
  }
  if (typeof entry.needsAccount !== "boolean" || typeof entry.free !== "boolean") {
    fail(file, index, slug, "needsAccount and free must be booleans");
  }
  if (entry.year !== null && !Number.isInteger(entry.year)) {
    fail(file, index, slug, "year must be an integer or null");
  }
  if (entry.altfAlternative !== null && typeof entry.altfAlternative !== "string") {
    fail(file, index, slug, "altfAlternative must be a slug string or null");
  }
  if (entry.altfAlternative && !EXPERIENCE_SLUGS.has(entry.altfAlternative)) {
    fail(
      file,
      index,
      slug,
      `altfAlternative "${entry.altfAlternative}" is not a real experience`,
    );
  }
  if (new Set(entry.vibes).size !== entry.vibes.length) {
    fail(file, index, slug, "vibes contains a duplicate");
  }
}

function build() {
  const bySlug = new Map();
  const byUrl = new Map();
  const all = [];

  for (const [file, entries] of SOURCES) {
    if (!Array.isArray(entries)) {
      throw new Error(`[rabbithole] ${file} must default-export an array`);
    }

    entries.forEach((entry, index) => {
      validate(entry, file, index);

      if (bySlug.has(entry.slug)) {
        notes.push(
          `duplicate slug "${entry.slug}" in ${file} — kept the entry from ${bySlug.get(entry.slug).file}`,
        );
        return;
      }

      const identity = urlIdentity(entry.url);
      if (byUrl.has(identity)) {
        notes.push(
          `duplicate url ${identity} — "${entry.slug}" in ${file} collides with "${byUrl.get(identity)}"`,
        );
        return;
      }

      const record = Object.freeze({
        ...entry,
        file,
        host: (() => {
          try {
            return new URL(entry.url).hostname.replace(/^www\./, "");
          } catch {
            return "";
          }
        })(),
      });

      bySlug.set(entry.slug, record);
      byUrl.set(identity, entry.slug);
      all.push(record);
    });
  }

  // Alphabetical by name is the stable base order. Anything that wants a
  // different order sorts a copy — never this array.
  all.sort((a, b) => a.name.localeCompare(b.name, "en"));

  return all;
}

export const SITES = Object.freeze(build());

export const CATALOG_NOTES = Object.freeze(notes);

export const SITES_BY_SLUG = Object.freeze(
  Object.fromEntries(SITES.map((site) => [site.slug, site])),
);

export function getSite(slug) {
  return SITES_BY_SLUG[slug] || null;
}

export function getSitesByCategory(categoryId) {
  return SITES.filter((site) => site.category === categoryId);
}

export function getSitesByVibe(vibeId) {
  return SITES.filter((site) => site.vibes.includes(vibeId));
}

/** Entries where AltF ships its own version of the same idea. */
export const ALTF_MATCHES = Object.freeze(
  SITES.filter((site) => Boolean(site.altfAlternative)),
);

/**
 * The sites shown on a collection page — a capped, editorial slice.
 *
 * The cap is intentional: several rules match most of the catalog, and a
 * "collection" of 333 entries is a filter wearing a collection's clothes.
 * Anything reporting a SIZE must use countCollectionSites instead, or the page
 * ends up claiming the cap is the total.
 */
export function getCollectionSites(collectionId) {
  const collection = COLLECTIONS.find((item) => item.id === collectionId);
  if (!collection) return [];

  const matched = SITES.filter((site) => collection.rule(site));
  return collection.limit ? matched.slice(0, collection.limit) : matched;
}

/** How many sites the collection's rule actually matches, uncapped. */
export function countCollectionSites(collectionId) {
  const collection = COLLECTIONS.find((item) => item.id === collectionId);
  if (!collection) return 0;
  return SITES.reduce((total, site) => total + (collection.rule(site) ? 1 : 0), 0);
}

export { hashString };

/** Deterministic pick of `count` sites, varied by `seed`. */
export function pickRotating(pool, count, seed = "rabbithole") {
  const ranked = pool
    .map((site) => ({ site, key: hashString(`${seed}:${site.slug}`) }))
    .sort((a, b) => a.key - b.key);
  return ranked.slice(0, count).map((item) => item.site);
}

/**
 * Related sites for a detail page: same category first, ranked by how many
 * vibes they share, then filled out from anywhere with a strong vibe overlap
 * so a small category never produces an empty rail.
 */
export function getRelatedSites(site, count = 6) {
  if (!site) return [];

  const score = (candidate) => {
    const shared = candidate.vibes.filter((vibe) => site.vibes.includes(vibe)).length;
    const sameCategory = candidate.category === site.category ? 10 : 0;
    const sameTime = candidate.timeToJoy === site.timeToJoy ? 2 : 0;
    return sameCategory + shared * 3 + sameTime;
  };

  return SITES.filter((candidate) => candidate.slug !== site.slug)
    .map((candidate) => ({ candidate, value: score(candidate) }))
    // > 2 rather than > 0: a bare time-band match scores 2 and is not a
    // relationship worth showing, which is what the comment above promises.
    .filter((entry) => entry.value > 2)
    .sort(
      (a, b) =>
        b.value - a.value || a.candidate.name.localeCompare(b.candidate.name, "en"),
    )
    .slice(0, count)
    .map((entry) => entry.candidate);
}

export const STATS = Object.freeze({
  total: SITES.length,
  categories: CATEGORY_IDS.length,
  collections: COLLECTIONS.length,
  free: SITES.filter((site) => site.free && !site.needsAccount).length,
  mobileFriendly: SITES.filter(
    (site) => site.bestOn === "mobile" || site.bestOn === "both",
  ).length,
  altfBuilds: ALTF_MATCHES.length,
  oldest: SITES.reduce((min, site) => {
    if (typeof site.year !== "number") return min;
    return min === null || site.year < min ? site.year : min;
  }, null),
});

export function countByCategory() {
  const counts = Object.fromEntries(CATEGORY_IDS.map((id) => [id, 0]));
  for (const site of SITES) counts[site.category] += 1;
  return counts;
}

export function countByVibe() {
  const counts = Object.fromEntries(VIBE_IDS.map((id) => [id, 0]));
  for (const site of SITES) {
    for (const vibe of site.vibes) counts[vibe] += 1;
  }
  return counts;
}

export function countByTimeBand() {
  const counts = Object.fromEntries(TIME_BAND_IDS.map((id) => [id, 0]));
  for (const site of SITES) counts[site.timeToJoy] += 1;
  return counts;
}
