// Animal Hub service layer — the ONLY module allowed to import from _data.
//
// Pages, metadata builders and components consume these functions and never
// touch the registries directly. Every function is async even though v1 reads
// local data files: migrating the backing store (Firestore, or the planned
// Node + PostgreSQL REST API) must change THIS FILE ONLY — signatures, and
// therefore every consumer, stay identical.
//
// Two read shapes, deliberately:
//   • Card/search projections (toAnimalCard, toSearchEntry) for listings —
//     small, cheap, and exactly what a future collection query returns.
//   • Full records (getAnimal) only on a detail page.
// Listing functions never leak full records, so no page accidentally depends
// on editorial fields that a post-Firebase listing query would not include.
//
// Pagination is offset-based here. Firestore paginates by cursor, so when the
// store changes these signatures gain an optional `cursor` and the offset path
// stays for local use — the callers' shape ({ items, total, hasMore }) does
// not change either way.

import { CATEGORIES, getCategoryDef } from "../_data/categories";
import { CONSERVATION_STATUSES, getConservationStatus } from "../_data/conservation";
import {
  ANIMALS,
  countAnimalsForCategory,
  getAnimalRecord,
  getAnimalsForCategory,
} from "../_data/animals";
import { getHighlightFacts, toAnimalCard, toSearchEntry } from "./animalModel";

/* ─────────────────────────── Categories ─────────────────────────── */

/** All categories in display order, each with its current animal count. */
export async function listCategories() {
  return CATEGORIES.map((category) => ({
    ...category,
    animalCount: countAnimalsForCategory(category.slug),
  }));
}

/** One category (with animal count), or null if the slug is unknown. */
export async function getCategory(slug) {
  const category = getCategoryDef(slug);
  if (!category) return null;
  return { ...category, animalCount: countAnimalsForCategory(slug) };
}

/* ─────────────────────────── Animals ─────────────────────────── */

/**
 * One full animal record by its globally unique slug, or null.
 * The only function that returns the complete record — detail pages only.
 */
export async function getAnimal(slug) {
  return getAnimalRecord(slug);
}

/**
 * Paginated animal cards for one category.
 * Returns { items, total, hasMore } so a listing can render a count and a
 * "load more" control without a second call.
 */
export async function getAnimalsByCategory(categorySlug, { limit, offset = 0 } = {}) {
  const all = getAnimalsForCategory(categorySlug);
  const slice = typeof limit === "number" ? all.slice(offset, offset + limit) : all.slice(offset);
  return {
    items: slice.map(toAnimalCard),
    total: all.length,
    hasMore: offset + slice.length < all.length,
  };
}

/** Paginated animal cards across every category, in registry order. */
export async function listAnimals({ limit, offset = 0 } = {}) {
  const slice =
    typeof limit === "number" ? ANIMALS.slice(offset, offset + limit) : ANIMALS.slice(offset);
  return {
    items: slice.map(toAnimalCard),
    total: ANIMALS.length,
    hasMore: offset + slice.length < ANIMALS.length,
  };
}

/**
 * Cards for the homepage, drawn from records flagged `featured`. Falls back
 * to registry order if too few are flagged, so the homepage is never short.
 */
export async function getFeaturedAnimals({ limit = 6 } = {}) {
  const featured = ANIMALS.filter((animal) => animal.featured);
  const picked = featured.length >= limit ? featured : [...featured, ...ANIMALS.filter((a) => !a.featured)];
  return picked.slice(0, limit).map(toAnimalCard);
}

/**
 * Related animal cards for a detail page: the record's curated `related`
 * slugs first, topped up with same-category animals to reach `limit`.
 * Unknown related slugs are skipped, so removing a record never breaks a page.
 */
export async function getRelatedAnimals(slug, { limit = 4 } = {}) {
  const animal = getAnimalRecord(slug);
  if (!animal) return [];

  const picked = [];
  const seen = new Set([animal.slug]);

  for (const relatedSlug of animal.related || []) {
    const related = getAnimalRecord(relatedSlug);
    if (related && !seen.has(related.slug)) {
      picked.push(related);
      seen.add(related.slug);
    }
    if (picked.length >= limit) return picked.map(toAnimalCard);
  }

  for (const candidate of getAnimalsForCategory(animal.category)) {
    if (!seen.has(candidate.slug)) {
      picked.push(candidate);
      seen.add(candidate.slug);
    }
    if (picked.length >= limit) break;
  }

  return picked.map(toAnimalCard);
}

/**
 * Cards ordered by how central each animal is to the catalogue, measured by
 * how many other records cross-reference it in their `related` lists, with
 * the editorial `featured` flag as a secondary signal.
 *
 * This is a derived signal rather than a stored popularity score: it needs no
 * extra field on the records, it stays honest as content grows, and once real
 * traffic data exists it is replaced here without touching any caller.
 */
export async function getPopularAnimals({ limit = 5 } = {}) {
  const inbound = new Map();
  for (const animal of ANIMALS) {
    for (const slug of animal.related || []) {
      inbound.set(slug, (inbound.get(slug) || 0) + 1);
    }
  }

  return [...ANIMALS]
    .map((animal, index) => ({
      animal,
      score: (inbound.get(animal.slug) || 0) * 2 + (animal.featured ? 1 : 0),
      index,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((entry) => toAnimalCard(entry.animal));
}

/**
 * Every habitat named across the catalogue with the number of animals in it,
 * most common first. Aggregated from `distribution.habitats` so the list can
 * never drift out of sync with the records themselves.
 */
export async function listHabitats({ limit } = {}) {
  const counts = new Map();
  for (const animal of ANIMALS) {
    for (const habitat of animal.distribution?.habitats || []) {
      const existing = counts.get(habitat);
      if (existing) existing.count += 1;
      else counts.set(habitat, { name: habitat, count: 1 });
    }
  }

  const sorted = [...counts.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

/**
 * A short set of notable facts for the homepage, each drawn from a different
 * category so the selection stays varied. Takes the first highlighted
 * measurement on each record — the fact its own data file marks as most
 * distinctive — so nothing here is written twice or invented.
 */
export async function getQuickFacts({ limit = 4 } = {}) {
  const facts = [];
  const usedCategories = new Set();

  const ordered = [
    ...ANIMALS.filter((animal) => animal.featured),
    ...ANIMALS.filter((animal) => !animal.featured),
  ];

  for (const animal of ordered) {
    if (usedCategories.has(animal.category)) continue;

    const fact = getHighlightFacts(animal).find((entry) => entry.value);
    if (!fact) continue;

    usedCategories.add(animal.category);
    facts.push({
      label: fact.label,
      value: fact.value,
      note: fact.note ?? null,
      animalName: animal.name,
      animalHref: `/animalhub/${animal.category}/${animal.slug}`,
      category: animal.category,
    });

    if (facts.length >= limit) break;
  }

  return facts;
}

/* ─────────────────────────── Search ─────────────────────────── */

/**
 * Scored search across names, scientific names, tags and aliases.
 * Exact name matches rank first, then prefix matches, then partial matches;
 * ties break on registry order. Returns cards.
 *
 * The scoring is intentionally simple and synchronous — at Firestore scale it
 * is replaced by a real index (or a search service) behind this same
 * signature, and callers do not change.
 */
export async function searchAnimals(query, { limit = 20, category } = {}) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];

  const pool = category ? getAnimalsForCategory(category) : ANIMALS;
  const scored = [];

  for (const animal of pool) {
    const entry = toSearchEntry(animal);
    let score = 0;

    for (const term of entry.terms) {
      if (term === q) score = Math.max(score, 100);
      else if (term.startsWith(q)) score = Math.max(score, 60);
      else if (term.includes(q)) score = Math.max(score, 30);
    }

    if (!score && animal.summary?.toLowerCase().includes(q)) score = 10;
    if (score) scored.push({ animal, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((hit) => toAnimalCard(hit.animal));
}

/**
 * The slim index a client-side search box ships to the browser: slug, name,
 * scientific name, href and match terms — no summaries, no imagery. Kept
 * separate from searchAnimals so the payload stays small at scale.
 */
export async function getSearchIndex() {
  return ANIMALS.map(toSearchEntry);
}

/* ─────────────────────────── Filters & reference ─────────────────────────── */

/**
 * Cards filtered by an IUCN status code (e.g. "EN"), or by every threatened
 * code at once with { threatenedOnly: true }.
 */
export async function getAnimalsByConservationStatus(code, { threatenedOnly = false } = {}) {
  const threatened = new Set(
    CONSERVATION_STATUSES.filter((status) => status.threatened).map((status) => status.code),
  );
  const matches = ANIMALS.filter((animal) => {
    const status = animal.conservation?.status;
    return threatenedOnly ? threatened.has(status) : status === code;
  });
  return matches.map(toAnimalCard);
}

/** Cards carrying a given tag (case-insensitive). */
export async function getAnimalsByTag(tag) {
  const needle = String(tag || "").trim().toLowerCase();
  if (!needle) return [];
  return ANIMALS.filter((animal) =>
    (animal.tags || []).some((value) => value.toLowerCase() === needle),
  ).map(toAnimalCard);
}

/** Resolves an IUCN code into its label, description, badge tone and severity. */
export async function getConservationMeta(code) {
  return getConservationStatus(code);
}

/* ─────────────────────────── Comparison ─────────────────────────── */

/**
 * The picker's option list: small enough to ship to the browser whole.
 *
 * Deliberately NOT the full records. Comparing needs every measurement and
 * trait, but choosing does not, and sending 125 complete profiles to render a
 * dropdown would be the largest payload on the site by a wide margin.
 */
export async function getCompareIndex() {
  return ANIMALS.map((animal) => ({
    slug: animal.slug,
    name: animal.name,
    scientificName: animal.scientificName,
    category: animal.category,
  }));
}

/**
 * Full records for the animals being compared, in the order requested.
 *
 * Unknown slugs are dropped rather than throwing: the selection arrives from a
 * user-editable query string, and a stale or hand-typed link should compare
 * what it can rather than fail the page.
 */
export async function getAnimalsForCompare(slugs = []) {
  return slugs
    .map((slug) => getAnimalRecord(slug))
    .filter(Boolean)
    .slice(0, 4);
}

/* ─────────────────────────── Route & sitemap support ─────────────────────────── */

/**
 * Every animal route as { category, animal } — feeds generateStaticParams and
 * the sitemap. Returns params only, never records, so route generation stays
 * cheap regardless of catalogue size.
 */
export async function getAnimalRouteParams() {
  return ANIMALS.map((animal) => ({ category: animal.category, animal: animal.slug }));
}

/** Every category route as { category } — feeds generateStaticParams. */
export async function getCategoryRouteParams() {
  return CATEGORIES.map((category) => ({ category: category.slug }));
}

/**
 * Sitemap rows: path plus the record's own updatedAt, so lastModified
 * reflects real content revisions rather than build time.
 */
export async function getSitemapEntries() {
  return [
    { path: "/animalhub", lastModified: null },
    ...CATEGORIES.map((category) => ({
      path: `/animalhub/${category.slug}`,
      lastModified: null,
    })),
    ...ANIMALS.map((animal) => ({
      path: `/animalhub/${animal.category}/${animal.slug}`,
      lastModified: animal.updatedAt || null,
    })),
  ];
}

/** Catalogue totals for the hub page and internal reporting. */
export async function getCatalogueStats() {
  return {
    animals: ANIMALS.length,
    categories: CATEGORIES.length,
    threatened: ANIMALS.filter((animal) => getConservationStatus(animal.conservation?.status)?.threatened)
      .length,
  };
}
