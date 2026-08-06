// Animal Hub data model — the canonical contract for every animal record,
// plus the projection and validation helpers that keep thousands of records
// consistent.
//
// ─── Why the shape looks like this ──────────────────────────────────────────
// Every animal record is designed to become ONE Firestore document with no
// transformation: `slug` is the document id, every value is JSON-serialisable
// (strings, numbers, booleans, null, arrays of those, arrays of flat objects),
// and there are no functions, class instances, Dates or nested arrays-of-
// arrays. Migrating means writing these objects straight into a collection.
//
// Reads are split into two shapes so listing pages never pay for editorial
// bodies. `toAnimalCard()` produces the small projection that grids, search
// results and related-animal rails consume; the full record is only read on a
// detail page. After the Firebase move the card projection is what a
// collection query returns (or what a denormalised `animals_index`
// collection stores), so the UI contract does not change.
//
// ─── Record contract ───────────────────────────────────────────────────────
//
// IDENTITY
//   slug              string   Globally unique across ALL categories. Lowercase
//                              kebab-case; it is the URL segment and the future
//                              Firestore document id.
//   category          string   Must match a slug in _data/categories.js.
//   name              string   Common name, as a reader would say it.
//   scientificName    string   Binomial name. Italicised by the UI, not here.
//   otherNames        string[] Alternative common names — also feeds search.
//
// LISTING PROJECTION (small, denormalised — read by cards and search)
//   summary           string   One or two sentences. Cards clamp it; write it
//                              to stand alone out of context.
//   heroImage         object   Image descriptor or null. See MEDIA below.
//
// CLASSIFICATION
//   taxonomy          object   { kingdom, phylum, class, order, family, genus,
//                              species } — all seven required so the taxonomy
//                              table never renders a hole.
//
// CONSERVATION
//   conservation      object   { status, assessmentYear, populationTrend,
//                              populationEstimate, note }
//                              `status` is an IUCN code from _data/conservation.js.
//                              `note` carries nuance a code cannot (subspecies
//                              splits, disputed assessments).
//
// EDITORIAL
//   headline          string   Detail-page hero line. Not the animal's name.
//   intro             string[] Opening paragraphs. Array so paragraphs stay
//                              structured rather than embedded markup.
//   sections          object[] { id, title, body[] } — the long-form body.
//                              `id` is a stable anchor/deep-link target and is
//                              unique within the record.
//
// FACTS
//   measurements      object[] { key, label, value, min, max, unit, note }
//                              Numeric/range facts. `value` is the display
//                              string (already formatted with units and
//                              qualifiers); `min`/`max`/`unit` are the machine
//                              copy that future sorting and the compare feature
//                              read. Omit min/max when a fact has no range.
//   traits            object[] { key, label, value, icon } — non-numeric
//                              characteristics (diet type, activity pattern,
//                              social structure).
//   highlights        string[] Keys from `measurements` or `traits` to surface
//                              in the hero fact strip. Selection, not new data —
//                              a fact is never written twice.
//
// DISTRIBUTION
//   distribution      object   { continents[], regions[], habitats[],
//                              elevation, note } — arrays are filter-ready
//                              (Firestore array-contains) and drive the future
//                              habitat map.
//
// MEDIA
//   heroImage         object   { src, alt, width, height, credit, creditUrl }
//                              or null. `src` is an absolute URL on an
//                              allowlisted remote host (next.config.mjs
//                              images.remotePatterns) — imagery is never
//                              committed to public/ (deploy artifact budget).
//                              null renders the neutral empty frame.
//   gallery           object[] Same descriptor shape. May be empty.
//
// RELATIONS & DISCOVERY
//   related           string[] Curated animal slugs, any category. Unknown
//                              slugs are skipped at read time, so reordering
//                              or removing a record never breaks a page.
//   tags              string[] Lowercase topical tags. Feeds tag chips, related
//                              scoring and future filtering.
//   searchTerms       string[] Extra query aliases that are not names or tags
//                              (misspellings, regional names, "big cat").
//
// FAQ
//   faqs              object[] { q, a } — rendered on the page AND emitted as
//                              FAQPage JSON-LD, so answers must be complete
//                              prose, not fragments.
//
// SEO
//   seo               object   { title, description, keywords[] }
//                              `title` excludes site branding — the module
//                              layout's title template appends it.
//
// PROVENANCE & LIFECYCLE
//   sources           object[] { label, publisher, url } — the record's
//                              references. A research-driven encyclopedia shows
//                              its work; this also backs E-E-A-T signals.
//   updatedAt         string   ISO date (YYYY-MM-DD). A plain string, not a
//                              Date, to stay serialisable; feeds sitemap
//                              lastModified and "reviewed on" lines.
//   featured          boolean  Optional. Eligible for homepage promotion.
// ───────────────────────────────────────────────────────────────────────────

import { getConservationStatus } from "../_data/conservation";
import { FACT_GROUPS, getFactDefinition } from "../_data/facts";

/** Fields every record must define for the UI to render without holes. */
const REQUIRED_FIELDS = [
  "slug",
  "category",
  "name",
  "scientificName",
  "summary",
  "headline",
  "intro",
  "taxonomy",
  "conservation",
  "sections",
  "seo",
  "updatedAt",
];

const TAXONOMY_RANKS = [
  "kingdom",
  "phylum",
  "class",
  "order",
  "family",
  "genus",
  "species",
];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * The small shape every listing surface consumes — cards, grids, search
 * results, related rails. Keep this in sync with what a post-Firebase
 * collection query would return; UI must never need a field that is not here.
 */
export function toAnimalCard(animal) {
  if (!animal) return null;
  const status = getConservationStatus(animal.conservation?.status);
  return {
    slug: animal.slug,
    category: animal.category,
    name: animal.name,
    scientificName: animal.scientificName,
    summary: animal.summary,
    heroImage: animal.heroImage ?? null,
    href: `/animalhub/${animal.category}/${animal.slug}`,
    // Denormalised so listing pages can filter without loading full records —
    // the same fields a Firestore listing document would carry.
    habitats: animal.distribution?.habitats ?? [],
    traits: animal.traits ?? [],
    // Display-ready conservation info travels with the card so UI components
    // never need the status lookup table — they render what they are given.
    conservation: status
      ? {
          code: status.code,
          label: status.label,
          tone: status.tone,
          severity: status.severity,
          threatened: status.threatened,
        }
      : null,
  };
}

/**
 * The even smaller shape a client-side search index ships to the browser.
 * Deliberately excludes summary and imagery so the payload stays tiny as the
 * catalogue grows into the thousands.
 */
export function toSearchEntry(animal) {
  if (!animal) return null;
  return {
    slug: animal.slug,
    category: animal.category,
    name: animal.name,
    scientificName: animal.scientificName,
    href: `/animalhub/${animal.category}/${animal.slug}`,
    terms: [
      animal.name,
      animal.scientificName,
      ...(animal.otherNames || []),
      ...(animal.tags || []),
      ...(animal.searchTerms || []),
    ]
      .filter(Boolean)
      .map((term) => term.toLowerCase()),
  };
}

/**
 * Looks up a fact by key across measurements and traits (for `highlights`).
 * Rejects a falsy key so an undefined highlight entry cannot match an
 * undefined-keyed fact by accident.
 */
export function findFact(animal, key) {
  if (!key) return null;
  return (
    (animal?.measurements || []).find((fact) => fact?.key === key) ||
    (animal?.traits || []).find((fact) => fact?.key === key) ||
    null
  );
}

/**
 * Every renderable fact on a record, bucketed into the catalog's display
 * groups and returned in catalog order. Facts the catalog marks `display:
 * "data"` are withheld — they stay on the record for comparison and sorting
 * but never reach the page. Uncatalogued keys fall into "Other" rather than
 * being dropped, so content is never blocked by a missing definition.
 */
export function groupFacts(animal) {
  const all = [...(animal?.measurements || []), ...(animal?.traits || [])];
  const buckets = new Map(FACT_GROUPS.map((group) => [group.id, []]));

  for (const fact of all) {
    if (!fact?.key) continue;
    const definition = getFactDefinition(fact.key);
    if (definition?.display === "data") continue;

    const groupId = definition?.group ?? "other";
    // Label falls back to the catalog's shared wording, so a record that
    // omits `label` still renders consistently with every other animal.
    const resolved = { ...fact, label: fact.label || definition?.label || fact.key };
    (buckets.get(groupId) ?? buckets.get("other")).push(resolved);
  }

  return FACT_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    facts: buckets.get(group.id) || [],
  })).filter((group) => group.facts.length > 0);
}

/** Resolves `highlights` keys into the fact objects the hero strip renders. */
export function getHighlightFacts(animal) {
  return (animal?.highlights || [])
    .map((key) => findFact(animal, key))
    .filter(Boolean);
}

/**
 * Returns an array of contract violations for one record (empty = valid).
 * Pure and side-effect free so it can back a test, a CI check, or a future
 * content-import script as well as the dev-time assertion below.
 */
export function validateAnimal(animal, { knownCategories, expectedCategory } = {}) {
  const errors = [];
  const id = animal?.slug || animal?.name || "<unnamed record>";

  for (const field of REQUIRED_FIELDS) {
    const value = animal?.[field];
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0);
    if (isEmpty) errors.push(`${id}: missing required field "${field}"`);
  }

  if (animal?.slug && !SLUG_PATTERN.test(animal.slug)) {
    errors.push(`${id}: slug must be lowercase kebab-case`);
  }

  if (knownCategories && animal?.category && !knownCategories.includes(animal.category)) {
    errors.push(
      `${id}: category "${animal.category}" is not defined in _data/categories.js`,
    );
  }

  // The record's own `category` and the registry folder it is imported into
  // are two independent facts. If they diverge the animal appears on one
  // category page while its URL claims another, so they are checked here
  // rather than trusted.
  if (expectedCategory && animal?.category && animal.category !== expectedCategory) {
    errors.push(
      `${id}: category "${animal.category}" but it is registered in the "${expectedCategory}" registry`,
    );
  }

  // A status the lookup table does not know silently disables the badge, the
  // risk filter and the threatened count, so an unknown code is an error.
  if (animal?.conservation && !getConservationStatus(animal.conservation.status)) {
    errors.push(
      `${id}: conservation.status "${animal.conservation?.status}" is not a known IUCN code`,
    );
  }

  // `highlights` and `findFact` resolve facts by key, so duplicate keys make
  // one fact permanently unreachable.
  const factKeys = new Set();
  for (const fact of [...(animal?.measurements || []), ...(animal?.traits || [])]) {
    if (!fact?.key) {
      errors.push(`${id}: every measurement and trait needs a key`);
      continue;
    }
    if (factKeys.has(fact.key)) errors.push(`${id}: duplicate fact key "${fact.key}"`);
    factKeys.add(fact.key);
  }

  for (const rank of TAXONOMY_RANKS) {
    if (!animal?.taxonomy?.[rank]) errors.push(`${id}: taxonomy.${rank} is missing`);
  }

  const sectionIds = new Set();
  for (const section of animal?.sections || []) {
    if (!section?.id || !section?.title || !Array.isArray(section?.body) || !section.body.length) {
      errors.push(`${id}: every section needs an id, a title and a non-empty body array`);
      continue;
    }
    if (sectionIds.has(section.id)) errors.push(`${id}: duplicate section id "${section.id}"`);
    sectionIds.add(section.id);
  }

  for (const key of animal?.highlights || []) {
    if (!findFact(animal, key)) {
      errors.push(`${id}: highlight "${key}" matches no measurement or trait key`);
    }
  }

  for (const faq of animal?.faqs || []) {
    if (!faq?.q || !faq?.a) errors.push(`${id}: every FAQ needs both q and a`);
  }

  if (animal?.updatedAt && !/^\d{4}-\d{2}-\d{2}$/.test(animal.updatedAt)) {
    errors.push(`${id}: updatedAt must be an ISO date string (YYYY-MM-DD)`);
  }

  return errors;
}

/**
 * Contract gate for the whole registry: validates every record against the
 * contract and catches duplicate slugs, which would otherwise silently shadow
 * a page. Throws with every problem at once so a content author fixes one
 * list rather than one error per reload.
 *
 * Takes the category→records map rather than a flat array so each record can
 * be checked against the registry it is actually registered in — flattening
 * first would destroy that association.
 *
 * This runs in production builds too, and deliberately so: the repo has no CI
 * job covering this module, so a build is the only place the check would
 * otherwise happen. It is a single linear pass over data already in memory,
 * and failing the build is far cheaper than shipping a catalogue with a
 * shadowed slug or a broken conservation code.
 */
export function assertAnimalRegistry(registries, { knownCategories } = {}) {
  const errors = [];
  const seen = new Set();

  for (const [expectedCategory, animals] of registries) {
    for (const animal of animals) {
      errors.push(...validateAnimal(animal, { knownCategories, expectedCategory }));
      if (animal?.slug) {
        if (seen.has(animal.slug)) {
          errors.push(
            `Duplicate slug "${animal.slug}" — animal slugs must be unique across all categories`,
          );
        }
        seen.add(animal.slug);
      }
    }
  }

  if (errors.length) {
    throw new Error(`[animalhub] Invalid animal data:\n  - ${errors.join("\n  - ")}`);
  }
}
