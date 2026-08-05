/**
 * AltF Bazaar — free-text search: matching, ranking, correction, suggestions.
 *
 * Search is the primary way into a classifieds site, and the naive version of
 * it (`haystack.includes(needle)`) fails in three ways that matter:
 *
 *   "ipone"      → 0 results, because one missing letter is a total miss
 *   "2 bhk pune" → 0 results, because a substring test needs the words adjacent
 *   "red honda"  → every Honda, if you loosen it to OR across words
 *
 * So this module does three separate jobs, in this order:
 *
 *   1. NORMALISE both the query and the corpus through the same pipeline, so a
 *      spelling that differs only in punctuation, plurality or Indian-English
 *      vocabulary compares equal.
 *   2. MATCH with AND across tokens and OR across fields — every word the
 *      visitor typed has to land somewhere, but not all in the same field.
 *   3. CORRECT, but only a token the corpus has never heard of, and only
 *      against a bounded index of real corpus terms.
 *
 * --------------------------------------------------------------------------
 * Layering
 * --------------------------------------------------------------------------
 * This module imports the taxonomy, the city registry and the item-name pools.
 * It deliberately does NOT import `listings.js` — `listings.js` imports THIS,
 * so the dependency has to point one way. That also keeps the module cheap to
 * pull into a client component: the term index is built from ~1,500 declared
 * vocabulary words, not from the 720-ad corpus.
 *
 * --------------------------------------------------------------------------
 * Determinism
 * --------------------------------------------------------------------------
 * No `Math.random`, no `Date.now`, no locale-dependent comparison in any
 * ordering decision (ties break on the term string with `<`). The term index
 * is built once at module load and never mutated, so the same query returns
 * the same ranked list in the prerender, on the server and in the browser.
 */

import { CATEGORIES, getCategory } from "./categories";
import { CITIES } from "./cities";
import { ITEM_NAMES, TITLE_SUFFIXES } from "./itemNames";

/* ==================================================================
 * 1. Normalisation
 * ================================================================ */

/**
 * Lowercase, drop apostrophes, expand `&`, reduce everything else that is not
 * a letter or a digit to a single space.
 *
 * Digits survive on purpose: "iphone 15", "2 bhk" and "1.5 ton" all carry
 * their meaning in the number.
 *
 * The last two rules split a digit run from an adjacent letter run when the
 * letter run is at least two characters, so "2bhk" and "iphone15" tokenise the
 * same way as "2 bhk" and "iPhone 15". The two-character floor is what keeps
 * "4K", "M2" and "S23" intact — splitting those would produce a stray
 * one-letter token for no gain. As with every rule here, it runs over the
 * corpus and the query alike, so it cannot make the two sides disagree.
 */
export function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[’'`´]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/(\d)([a-z]{2,})/g, "$1 $2")
    .replace(/([a-z]{2,})(\d)/g, "$1 $2")
    .trim();
}

/**
 * Multi-word phrases rewritten before tokenising.
 *
 * Kept tiny and one-directional: each left side is a phrase a visitor types
 * that the corpus only ever spells the short way. Applied to the query AND to
 * corpus text, so it can never hide a listing — only make two spellings of the
 * same thing compare equal.
 */
const PHRASES = [
  [/\bair conditioner\b/g, "ac"],
  [/\bair conditioning\b/g, "ac"],
  [/\b(?:two|2)\s+wheeler\b/g, "bike"],
  [/\b(?:four|4)\s+wheeler\b/g, "car"],
  [/\bpaying guest\b/g, "pg"],
  [/\bwashing machine\b/g, "washing machine"],
];

function applyPhrases(text) {
  let out = text;
  for (const [pattern, replacement] of PHRASES) out = out.replace(pattern, replacement);
  return out;
}

/**
 * Words dropped from the query and from the indexed corpus text alike.
 *
 * These are search *intent* words, not inventory words: nothing in the corpus
 * is titled "used" or "second hand", so leaving them in would make
 * "used cars in pune" an AND over three tokens two of which can never match.
 *
 * "new", "sale" and "rent" are deliberately NOT here — they are real corpus
 * vocabulary ("New Town" is a Kolkata locality, and a property title says
 * either "for Sale" or "for Rent", which is the difference between two very
 * different pages).
 */
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "for", "in", "on", "at", "to", "with",
  "from", "by", "is", "are", "am", "my", "me", "i", "it", "this", "that",
  "near", "nearby", "around", "buy", "sell", "selling", "want", "wanted",
  "need", "needed", "looking", "used", "second", "hand", "old", "any", "some",
  "please", "urgent", "only", "best", "cheap", "cheapest", "low", "price",
]);

/**
 * Indian-English and marketplace vocabulary variants.
 *
 * Both sides of every comparison run through this map, so an entry can only
 * ever *merge* two spellings of one thing. That is why this is a short hand-
 * written list rather than a stemmer: a stemmer that mangles one word breaks
 * the corpus side and the query side in different ways, and the failure is
 * invisible. Keys are already plural-folded (see `foldPlural`).
 *
 * Each entry earns its place because the corpus and a real visitor spell the
 * same object differently:
 *
 *   corpus says              visitors type
 *   -----------------------  -----------------------------------------
 *   "Mobiles", "Phone"       mobile, phone, smartphone, handset, cellphone
 *   "ACs", "Split AC"        ac, acs, aircon
 *   "Houses & Apartments"    flat, apartment, house, home
 *   "Bikes", "Motorcycles"   bike, motorcycle, motorbike
 *   "Scooters"               scooty (the standard Indian-English word)
 *   "Cycle", "Bicycle"       cycle, bicycle
 *   "Fridges"                fridge, refrigerator
 *   "TVs", "Television"      tv, tvs, television
 *   "Almirah", "Wardrobe"    almari, almirah, cupboard, wardrobe
 *   "Juicer Mixer"           mixie (Indian-English for a mixer-grinder)
 *   "Jobs"                   job, vacancy, hiring, recruitment
 *   "Lands & Plots"          plot, land
 *   "on Rent", "Rental"      rent, rental
 */
const VARIANTS = new Map(
  Object.entries({
    // Phones
    phone: "mobile",
    smartphone: "mobile",
    handset: "mobile",
    cellphone: "mobile",
    mobiles: "mobile",
    // Air conditioning
    acs: "ac",
    aircon: "ac",
    airconditioner: "ac",
    // Homes
    apartment: "flat",
    appartment: "flat",
    home: "house",
    // Two-wheelers
    motorcycle: "bike",
    motorbike: "bike",
    scooty: "scooter",
    scootie: "scooter",
    cycle: "bicycle",
    // Appliances
    refrigerator: "fridge",
    tvs: "tv",
    television: "tv",
    telly: "tv",
    lappy: "laptop",
    mixie: "mixer",
    almari: "wardrobe",
    almirah: "wardrobe",
    cupboard: "wardrobe",
    couch: "sofa",
    settee: "sofa",
    // Audio / wearables
    earphone: "headphone",
    earbud: "headphone",
    headset: "headphone",
    smartwatch: "watch",
    // Jobs
    vacancy: "job",
    hiring: "job",
    recruitment: "job",
    // Land
    land: "plot",
    // Renting
    rental: "rent",
    // City names that were renamed. The registry stores the current name, but
    // the older one is still what a lot of people type — and in several cases
    // it is what our own URL says (`/bazaar/in/bangalore` → "Bengaluru").
    bangalore: "bengaluru",
    bombay: "mumbai",
    calcutta: "kolkata",
    madras: "chennai",
    mysore: "mysuru",
    gurgaon: "gurugram",
    poona: "pune",
    baroda: "vadodara",
    vizag: "visakhapatnam",
    trivandrum: "thiruvananthapuram",
    allahabad: "prayagraj",
    mangalore: "mangaluru",
  }),
);

/**
 * Minimal, symmetric plural fold.
 *
 * NOT a stemmer — the only rules are `-ies → -y` and a trailing `-s` strip,
 * both gated on length so three-letter words survive. It is applied to the
 * query and to the corpus, which is what makes it safe: an odd stem
 * ("series" → "sery") is harmless as long as both sides produce it, whereas an
 * asymmetric rule silently loses listings.
 */
function foldPlural(token) {
  if (token.length < 4) return token;
  if (/(?:ss|us|is|as|os)$/.test(token)) return token;
  if (token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (token.endsWith("s")) return token.slice(0, -1);
  return token;
}

/** normalise → plural-fold → variant-fold. The one canonical form of a word. */
export function canonicalToken(word) {
  const folded = foldPlural(word);
  return VARIANTS.get(folded) || folded;
}

/**
 * Split text into canonical tokens. `keepStopwords` exists only so the
 * fallback path (a query made entirely of stopwords) can search literally
 * instead of returning the whole corpus.
 */
export function tokenize(text, { keepStopwords = false } = {}) {
  const normalized = applyPhrases(normalizeText(text));
  if (!normalized) return [];
  const out = [];
  for (const word of normalized.split(" ")) {
    const canonical = canonicalToken(word);
    if (!canonical) continue;
    if (!keepStopwords && STOPWORDS.has(canonical)) continue;
    out.push(canonical);
  }
  return out;
}

/* ==================================================================
 * 2. The term index
 * ================================================================ */

/**
 * Vocabulary the corpus can actually be searched by, with a weight used for
 * suggestion ordering and for breaking fuzzy ties.
 *
 * This is the ONLY thing typo correction runs against. Fuzzy-matching a query
 * token against every word of every one of the 720 titles would be both
 * slower and worse: at distance 2 an eight-letter word has thousands of
 * neighbours, and most of the ones present in free text are noise. A bounded,
 * declared vocabulary means a correction is always to a word the corpus
 * demonstrably uses.
 */
const TERM_KINDS = {
  CATEGORY: "category",
  SUBCATEGORY: "subcategory",
  BRAND: "brand",
  MODEL: "model",
  CITY: "city",
  STATE: "state",
  LOCALITY: "locality",
  DESCRIPTOR: "descriptor",
};

const TERM_WEIGHT = {
  [TERM_KINDS.CATEGORY]: 6,
  [TERM_KINDS.BRAND]: 5,
  [TERM_KINDS.SUBCATEGORY]: 5,
  [TERM_KINDS.CITY]: 4,
  [TERM_KINDS.MODEL]: 3,
  [TERM_KINDS.STATE]: 2,
  [TERM_KINDS.LOCALITY]: 2,
  [TERM_KINDS.DESCRIPTOR]: 1,
};

/**
 * Property titles are assembled from BHK + noun + locality rather than from a
 * name pool (`ITEM_NAMES.properties` is empty by design), so their title
 * vocabulary has to be declared here or "flet" would never correct to "flat".
 */
const PROPERTY_TITLE_WORDS = [
  "BHK", "RK", "Flat", "Plot", "Residential", "Commercial", "Space",
  "PG", "Accommodation", "Rent", "Sale", "Villa", "Farmhouse", "Godown",
];

/** canonical → { canonical, display, kind, weight } */
const TERM_INDEX = new Map();

function addTerm(word, kind) {
  const normalized = normalizeText(word);
  // Normalisation can split one source word into two ("HD9200" → "hd 9200").
  // Index each part separately, or the "term" would contain a space and never
  // equal a query token.
  if (normalized.includes(" ")) {
    for (const part of normalized.split(" ")) addTerm(part, kind);
    return;
  }

  const canonical = canonicalToken(normalized);
  // Two-letter words and bare numbers are useless as correction targets: at
  // distance 1 "ac" neighbours half the alphabet, and "15" neighbours "16".
  if (canonical.length < 3 || /^\d+$/.test(canonical)) return;
  if (STOPWORDS.has(canonical)) return;

  const weight = TERM_WEIGHT[kind] || 1;
  const existing = TERM_INDEX.get(canonical);

  if (!existing) {
    TERM_INDEX.set(canonical, { canonical, display: word, kind, weight });
    return;
  }

  // Prefer the display spelling that survives normalisation unchanged, so
  // "iPhone" wins over "iPhones" and the correction notice reads naturally.
  const betterDisplay =
    normalizeText(word) === canonical && normalizeText(existing.display) !== canonical;
  if (betterDisplay) existing.display = word;
  if (weight > existing.weight) {
    existing.weight = weight;
    existing.kind = kind;
  }
}

function addPhrase(phrase, kind) {
  for (const word of String(phrase ?? "").split(/[^A-Za-z0-9]+/)) {
    if (word) addTerm(word, kind);
  }
}

for (const category of CATEGORIES) {
  addPhrase(category.name, TERM_KINDS.CATEGORY);
  for (const sub of category.subcategories) addPhrase(sub.name, TERM_KINDS.SUBCATEGORY);
  const brand = category.attributes.find((attr) => attr.key === "brand");
  for (const option of brand?.options || []) addPhrase(option, TERM_KINDS.BRAND);
}

for (const names of Object.values(ITEM_NAMES)) {
  for (const name of names) addPhrase(name, TERM_KINDS.MODEL);
}

for (const city of CITIES) {
  addPhrase(city.name, TERM_KINDS.CITY);
  if (city.stateName) addPhrase(city.stateName, TERM_KINDS.STATE);
  for (const locality of city.localities) addPhrase(locality, TERM_KINDS.LOCALITY);
}

for (const word of PROPERTY_TITLE_WORDS) addTerm(word, TERM_KINDS.SUBCATEGORY);
for (const suffix of TITLE_SUFFIXES) addPhrase(suffix, TERM_KINDS.DESCRIPTOR);

/**
 * Surfaces typo correction compares against.
 *
 * Mostly the canonical terms, plus every VARIANTS key as an extra *surface*
 * that resolves to its canonical form. Without those, variant folding would
 * hide the long spellings from the fuzzy index entirely — "Refrigerator" folds
 * to "fridge" at index time, so "refrigirator" (one letter out) had nothing
 * within distance 2 and returned nothing at all.
 */
const FUZZY_SURFACES = [];
for (const entry of TERM_INDEX.values()) {
  FUZZY_SURFACES.push({
    surface: entry.canonical,
    canonical: entry.canonical,
    display: entry.display,
    kind: entry.kind,
    weight: entry.weight,
  });
}
for (const [alias, canonical] of VARIANTS) {
  const target = TERM_INDEX.get(canonical);
  if (!target || alias.length < 4) continue;
  FUZZY_SURFACES.push({
    surface: alias,
    canonical,
    display: target.display,
    kind: target.kind,
    // A hair below the canonical form, so an equal-distance tie prefers the
    // spelling the corpus actually uses.
    weight: target.weight - 0.5,
  });
}

/** Length buckets, so a bounded-distance scan only sees plausible candidates. */
const TERMS_BY_LENGTH = new Map();
for (const entry of FUZZY_SURFACES) {
  const bucket = TERMS_BY_LENGTH.get(entry.surface.length);
  if (bucket) bucket.push(entry);
  else TERMS_BY_LENGTH.set(entry.surface.length, [entry]);
}
for (const bucket of TERMS_BY_LENGTH.values()) {
  bucket.sort((a, b) => (a.surface < b.surface ? -1 : a.surface > b.surface ? 1 : 0));
}

/** Every 3+ character prefix of every term — an O(1) "is this a real stem?". */
const TERM_PREFIXES = new Set();
for (const canonical of TERM_INDEX.keys()) {
  for (let length = 3; length <= canonical.length; length += 1) {
    TERM_PREFIXES.add(canonical.slice(0, length));
  }
}

/** How many distinct vocabulary terms typo correction runs against. */
export const SEARCH_TERM_COUNT = TERM_INDEX.size;

/* ==================================================================
 * 3. Bounded Levenshtein
 * ================================================================ */

/**
 * Edit distance, abandoned as soon as it provably exceeds `max`.
 *
 * Returns `max + 1` for "further than you care about", which is all any caller
 * needs and lets the row scan bail early on long words.
 */
export function boundedDistance(a, b, max) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previous = new Array(b.length + 1);
  let current = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) previous[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    let rowMin = current[0];
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= b.length; j += 1) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      current[j] = value;
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1;
    const swap = previous;
    previous = current;
    current = swap;
  }

  return previous[b.length] > max ? max + 1 : previous[b.length];
}

/**
 * The typo budget.
 *
 * Below 4 characters there is no budget at all: at distance 1 "car" reaches
 * "cat", "bar", "cars" and "care", and a marketplace that answers "car" with
 * cats has a worse problem than a missing typo tolerance.
 */
export function typoBudget(token) {
  if (token.length < 4) return 0;
  if (token.length <= 5) return 1;
  return 2;
}

/**
 * Best correction for a token the vocabulary does not contain.
 *
 * Ordered by distance, then by term weight (a category beats a locality), then
 * alphabetically — a total order, so the correction never depends on Map
 * iteration order.
 */
function bestCorrection(token) {
  const max = typoBudget(token);
  if (max === 0) return null;

  let best = null;
  for (let length = token.length - max; length <= token.length + max; length += 1) {
    for (const entry of TERMS_BY_LENGTH.get(length) || []) {
      const distance = boundedDistance(token, entry.surface, max);
      if (distance > max) continue;
      if (
        !best ||
        distance < best.distance ||
        (distance === best.distance &&
          (entry.weight > best.entry.weight ||
            (entry.weight === best.entry.weight && entry.surface < best.entry.surface)))
      ) {
        best = { entry, distance };
      }
    }
  }

  if (!best) return null;
  return {
    canonical: best.entry.canonical,
    display: best.entry.display,
    kind: best.entry.kind,
    distance: best.distance,
  };
}

/* ==================================================================
 * 4. parseQuery
 * ================================================================ */

/**
 * Turn a raw query string into everything the matcher and the UI need.
 *
 * @param {string} q
 * @returns {{
 *   raw: string,
 *   normalized: string,
 *   phrase: string,
 *   tokens: Array<{ raw: string, canonical: string, variants: string[], correction: object|null }>,
 *   corrections: Array<{ from: string, to: string, canonical: string, distance: number }>,
 *   correctedQuery: string,
 *   isEmpty: boolean,
 * }}
 *
 * Correction happens HERE, once, and only for a token that is neither a known
 * vocabulary term nor the prefix of one. That distinction is what keeps
 * mid-typing queries honest: "hond" is a prefix of "honda", so it is matched
 * by prefix and reported as no correction, while "ipone" is a prefix of
 * nothing and is corrected to "iPhone" — and said out loud.
 */
export function parseQuery(q) {
  const raw = String(q ?? "");
  const normalized = applyPhrases(normalizeText(raw));
  const words = normalized ? normalized.split(" ") : [];

  let kept = words.filter((word) => !STOPWORDS.has(canonicalToken(word)));
  // A query of nothing but stopwords ("for the") should search literally
  // rather than silently become "show me everything".
  if (kept.length === 0) kept = words;

  const tokens = [];
  const corrections = [];

  for (const word of kept) {
    const canonical = canonicalToken(word);
    if (!canonical) continue;

    const known = TERM_INDEX.has(canonical) || TERM_PREFIXES.has(canonical);
    let correction = null;
    if (!known && !/^\d+$/.test(canonical)) correction = bestCorrection(canonical);

    if (correction) {
      corrections.push({
        from: word,
        to: correction.display,
        canonical: correction.canonical,
        distance: correction.distance,
      });
    }

    tokens.push({
      raw: word,
      canonical,
      // The original spelling stays in play: a token can be absent from the
      // declared vocabulary and still appear in a generated title.
      variants: correction ? [canonical, correction.canonical] : [canonical],
      correction,
    });
  }

  // The string shown in "Showing results for …". Corrected words use the
  // corpus spelling; the rest are looked up in the index too, so a query that
  // needed one fix does not read "royal Enfield".
  const correctedQuery = tokens
    .map(
      (token) =>
        token.correction?.display || TERM_INDEX.get(token.canonical)?.display || token.raw,
    )
    .join(" ");

  return {
    raw,
    normalized,
    phrase: tokens.map((token) => token.canonical).join(" "),
    tokens,
    corrections,
    correctedQuery,
    isEmpty: tokens.length === 0,
  };
}

/**
 * The correction to show above a result set, or null when the query was
 * spelled the way the corpus spells it.
 *
 * Showing iPhones for "ipone" without saying so is worse than showing
 * nothing: the visitor cannot tell whether the corpus has no iPhones or
 * whether they mistyped.
 */
export function didYouMean(q) {
  const parsed = parseQuery(q);
  if (parsed.corrections.length === 0) return null;
  return {
    query: parsed.correctedQuery,
    corrections: parsed.corrections,
  };
}

/* ==================================================================
 * 5. Matching + scoring
 * ================================================================ */

/**
 * Which listing fields are searched, and what a hit in each is worth.
 *
 * OR across fields (a token may land anywhere) but AND across tokens (every
 * token must land somewhere). That combination is the whole reason
 * "2 bhk pune" works — "2" and "bhk" come from the title, "pune" from the
 * city — while "red honda" stays empty instead of returning every Honda.
 *
 * Title outweighs category by design: an ad *called* "Honda City ZX" is a
 * better answer to "honda city" than any ad merely filed under Cars.
 */
const SEARCH_FIELDS = [
  { key: "title", weight: 10 },
  { key: "brand", weight: 6, from: (listing) => listing.attributes?.brand },
  { key: "subcategoryName", weight: 5 },
  { key: "categoryName", weight: 3 },
  { key: "locality", weight: 2 },
  { key: "cityName", weight: 2 },
  { key: "stateName", weight: 1 },
];

const EXACT_FACTOR = 1;
const PREFIX_FACTOR = 0.55;
/**
 * Shortest token allowed to match by prefix.
 *
 * Three characters is too few, and the failure is not subtle: "used cars in
 * pune" matched a rowing machine because "car" is a prefix of "Cardio". Four
 * still gives typeahead what it needs — "hond" finds Honda, "sams" finds
 * Samsung — while a complete three-letter word ("car", "tv", "ac") is matched
 * exactly instead, which is what it deserves.
 */
const PREFIX_MIN_LENGTH = 4;
/** A fuzzy hit is worth less than a prefix hit, and less again at distance 2. */
const FUZZY_FACTOR = [0, 0.4, 0.3];
/** Bonus when the whole multi-word query appears contiguously in the title. */
const PHRASE_BONUS = 14;

/**
 * Per-listing token sets, memoised on the listing object.
 *
 * The corpus objects are module-level singletons in `listings.js`, so a
 * WeakMap keyed on them is a stable cache for the process lifetime and costs
 * nothing when a listing is garbage-collected (as the ones a client component
 * builds by hand would be).
 */
const DOC_CACHE = new WeakMap();

function buildDoc(listing) {
  const fields = [];
  for (const field of SEARCH_FIELDS) {
    const value = field.from ? field.from(listing) : listing[field.key];
    if (!value) continue;
    const tokens = tokenize(value);
    if (tokens.length === 0) continue;
    fields.push({ weight: field.weight, tokens: new Set(tokens), list: tokens });
  }
  return { fields, titlePhrase: tokenize(listing.title).join(" ") };
}

function docFor(listing) {
  let doc = DOC_CACHE.get(listing);
  if (!doc) {
    doc = buildDoc(listing);
    DOC_CACHE.set(listing, doc);
  }
  return doc;
}

/**
 * Score one listing against a parsed query.
 *
 * @returns {number} 0 when the listing does not match at all; otherwise a
 *   positive relevance score. Higher is better, and the scale is stable across
 *   listings for one query (it is a sum of per-token field weights), which is
 *   what makes sorting by it meaningful.
 */
export function matchListing(listing, parsed) {
  if (!listing) return 0;
  // No text constraint: every listing matches, all equally.
  if (!parsed || parsed.isEmpty) return 1;

  const doc = docFor(listing);
  let total = 0;

  for (const token of parsed.tokens) {
    let best = 0;

    for (const field of doc.fields) {
      if (best >= field.weight) continue; // cannot beat what we already have

      if (field.tokens.has(token.canonical)) {
        best = Math.max(best, field.weight * EXACT_FACTOR);
        continue;
      }

      // The corrected spelling, matched exactly.
      if (token.correction && field.tokens.has(token.correction.canonical)) {
        best = Math.max(
          best,
          field.weight * (FUZZY_FACTOR[token.correction.distance] || 0.25),
        );
        continue;
      }

      // Prefix, so a half-typed word still finds things.
      if (token.canonical.length >= PREFIX_MIN_LENGTH) {
        for (const candidate of field.list) {
          if (candidate.length > token.canonical.length && candidate.startsWith(token.canonical)) {
            best = Math.max(best, field.weight * PREFIX_FACTOR);
            break;
          }
        }
      }
    }

    // AND across tokens: one unmatched word means this is not the ad.
    if (best === 0) return 0;
    total += best;
  }

  if (parsed.tokens.length > 1 && doc.titlePhrase.includes(parsed.phrase)) {
    total += PHRASE_BONUS;
  }

  return total;
}

/* ==================================================================
 * 6. Suggestions
 * ================================================================ */

/**
 * Suggestion destinations, most specific first.
 *
 * A suggestion should land on a real page, not on a search URL, wherever one
 * exists: `/bazaar/c/mobiles` and `/bazaar/in/pune` are indexable directory
 * surfaces with their own counts, localities and price medians, whereas
 * `/bazaar/search?q=mobiles` is `noindex` by design. Sending a visitor (and
 * the crawler that follows them) to the search page when a category page holds
 * the same inventory throws the better page away.
 *
 * Brands have no page of their own, so they resolve to the category page with
 * the brand filter pre-applied — which is a real, linkable, filtered view.
 */
export const SUGGESTION_KINDS = {
  CATEGORY: "category",
  SUBCATEGORY: "subcategory",
  CITY: "city",
  BRAND: "brand",
  QUERY: "query",
};

const SUGGESTION_GROUPS = [
  { id: "categories", label: "Categories" },
  { id: "cities", label: "Cities" },
  { id: "brands", label: "Brands" },
  { id: "queries", label: null },
];

/** Brand → the categories that declare it, computed once. */
const BRAND_ENTRIES = [];
for (const category of CATEGORIES) {
  const brand = category.attributes.find((attr) => attr.key === "brand");
  for (const option of brand?.options || []) {
    BRAND_ENTRIES.push({
      brand: option,
      canonical: tokenize(option),
      categorySlug: category.slug,
      categoryName: category.name,
    });
  }
}

/**
 * How well a suggestion label matches what has been typed so far.
 *
 * Deliberately different from listing scoring: a dropdown is judged on whether
 * the first row is what the visitor was about to type, so a label that STARTS
 * with the query beats one that merely contains it, and a shorter label beats a
 * longer one at equal quality.
 */
function labelScore(labelTokens, labelText, queryTokens, queryText, { requireAll = true } = {}) {
  if (queryTokens.length === 0) return 0;

  let score = 0;
  if (labelText === queryText) score += 100;
  else if (labelText.startsWith(queryText)) score += 60;
  else if (labelText.includes(queryText)) score += 30;

  let matchedAny = false;
  for (const token of queryTokens) {
    let tokenScore = 0;
    for (const labelToken of labelTokens) {
      if (labelToken === token) {
        tokenScore = Math.max(tokenScore, 12);
      } else if (labelToken.startsWith(token) && token.length >= 2) {
        tokenScore = Math.max(tokenScore, 8);
      } else if (token.length >= 4) {
        const budget = typoBudget(token);
        if (budget > 0 && boundedDistance(token, labelToken, budget) <= budget) {
          tokenScore = Math.max(tokenScore, 4);
        }
      }
    }
    // In the dropdown every typed word has to be accounted for, or "honda ci"
    // offers "Cities". On the zero-result recovery panel the opposite is true:
    // the query already matched nothing, so the best remaining signal is
    // whichever single word does resemble a real category name.
    if (tokenScore === 0 && requireAll) return 0;
    if (tokenScore > 0) matchedAny = true;
    score += tokenScore;
  }

  if (!matchedAny) return 0;
  return score + Math.max(0, 12 - labelText.length) / 12;
}

function pickTop(candidates, limit) {
  return candidates
    .sort(
      (a, b) =>
        b.score - a.score || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0),
    )
    .slice(0, limit);
}

/**
 * Grouped suggestions for a partially typed query.
 *
 * @param {string} q
 * @param {{ perGroup?: number }} [options]
 * @returns {{
 *   groups: Array<{ id: string, label: string|null, options: object[] }>,
 *   options: Array<{ id: string, index: number, kind: string, label: string,
 *                   sublabel: string|null, href: string, group: string,
 *                   searchTerm: string|null }>,
 * }}
 *
 * `options` is the same objects in render order with an `index` on each, so the
 * keyboard handler and the rendered list can never disagree about what row 3
 * is.
 */
export function suggest(q, { perGroup = 4 } = {}) {
  const queryText = applyPhrases(normalizeText(q));
  const queryTokens = tokenize(q);
  const trimmed = String(q ?? "").trim();

  const buckets = { categories: [], cities: [], brands: [], queries: [] };

  if (queryTokens.length > 0) {
    for (const category of CATEGORIES) {
      const score = labelScore(
        tokenize(category.name),
        normalizeText(category.name),
        queryTokens,
        queryText,
      );
      if (score > 0) {
        buckets.categories.push({
          kind: SUGGESTION_KINDS.CATEGORY,
          label: category.name,
          sublabel: category.tagline,
          href: `/bazaar/c/${category.slug}`,
          score: score + 6,
          searchTerm: null,
        });
      }

      for (const sub of category.subcategories) {
        const subScore = labelScore(
          tokenize(sub.name),
          normalizeText(sub.name),
          queryTokens,
          queryText,
        );
        if (subScore > 0) {
          buckets.categories.push({
            kind: SUGGESTION_KINDS.SUBCATEGORY,
            label: sub.name,
            sublabel: `in ${category.name}`,
            href: `/bazaar/c/${category.slug}/${sub.slug}`,
            score: subScore,
            searchTerm: null,
          });
        }
      }
    }

    for (const city of CITIES) {
      const score = labelScore(
        tokenize(city.name),
        normalizeText(city.name),
        queryTokens,
        queryText,
      );
      if (score > 0) {
        buckets.cities.push({
          kind: SUGGESTION_KINDS.CITY,
          label: city.name,
          sublabel: city.stateName || "India",
          href: `/bazaar/in/${city.slug}`,
          // Demand orders equally-good city matches, so "Mumbai" outranks
          // "Mysuru" for "mu" rather than the alphabet deciding.
          score: score + city.demand / 10,
          searchTerm: null,
        });
      }
    }

    for (const entry of BRAND_ENTRIES) {
      const score = labelScore(
        entry.canonical,
        normalizeText(entry.brand),
        queryTokens,
        queryText,
      );
      if (score > 0) {
        buckets.brands.push({
          kind: SUGGESTION_KINDS.BRAND,
          label: entry.brand,
          sublabel: `in ${entry.categoryName}`,
          href: `/bazaar/c/${entry.categorySlug}?brand=${encodeURIComponent(entry.brand)}`,
          score,
          searchTerm: null,
        });
      }
    }
  }

  if (trimmed) {
    buckets.queries.push({
      kind: SUGGESTION_KINDS.QUERY,
      label: trimmed,
      sublabel: null,
      href: `/bazaar/search?q=${encodeURIComponent(trimmed)}`,
      score: 0,
      searchTerm: trimmed,
    });
  }

  const groups = [];
  const options = [];

  for (const group of SUGGESTION_GROUPS) {
    const picked =
      group.id === "queries"
        ? buckets.queries
        : pickTop(buckets[group.id], perGroup);
    if (picked.length === 0) continue;

    const withIds = picked.map((option, position) => {
      const entry = {
        ...option,
        id: `${group.id}-${position}`,
        group: group.id,
        index: options.length + position,
      };
      return entry;
    });

    options.push(...withIds);
    groups.push({ id: group.id, label: group.label, options: withIds });
  }

  return { groups, options };
}

/**
 * The categories offered before anything has been typed.
 *
 * "Popular" is the declared order of `CATEGORIES`, which already runs from the
 * highest-volume category (Cars) downwards. Deriving it from live listing
 * counts would mean importing the corpus into this module, and therefore into
 * the client bundle, for a shelf that never changes.
 */
export function popularCategorySuggestions(limit = 6) {
  return CATEGORIES.slice(0, limit).map((category) => ({
    kind: SUGGESTION_KINDS.CATEGORY,
    label: category.name,
    sublabel: null,
    href: `/bazaar/c/${category.slug}`,
    slug: category.slug,
    icon: category.icon,
  }));
}

/**
 * Categories whose own name best matches the query, for the zero-result
 * recovery panel.
 *
 * When a search returns nothing there is by definition no inventory signal to
 * rank by, so the only honest signal left is how close the words are to a real
 * category name. The caller pairs each one with a real count.
 */
export function closestCategories(q, limit = 4) {
  const queryText = applyPhrases(normalizeText(q));
  const queryTokens = tokenize(q);
  if (queryTokens.length === 0) return [];

  const loose = { requireAll: false };
  const scored = [];
  for (const category of CATEGORIES) {
    let score = labelScore(
      tokenize(category.name),
      normalizeText(category.name),
      queryTokens,
      queryText,
      loose,
    );
    let via = null;

    for (const sub of category.subcategories) {
      const subScore = labelScore(
        tokenize(sub.name),
        normalizeText(sub.name),
        queryTokens,
        queryText,
        loose,
      );
      if (subScore > score) {
        score = subScore;
        via = sub;
      }
    }

    if (score > 0) scored.push({ category, subcategory: via, score });
  }

  return scored
    .sort(
      (a, b) =>
        b.score - a.score ||
        (a.category.name < b.category.name ? -1 : a.category.name > b.category.name ? 1 : 0),
    )
    .slice(0, limit)
    .map(({ category, subcategory }) => ({
      slug: category.slug,
      name: category.name,
      subcategorySlug: subcategory?.slug || null,
      subcategoryName: subcategory?.name || null,
      href: subcategory
        ? `/bazaar/c/${category.slug}/${subcategory.slug}`
        : `/bazaar/c/${category.slug}`,
    }));
}

/**
 * The same query with one word removed, once per word.
 *
 * This is the single most useful thing to offer after a zero result, because a
 * zero result on a multi-word query almost always comes from one word too many:
 * "2 bhk pune" is empty because Pune's three flats are 1 BHK and 3 BHK, and
 * "bhk pune" finds all three. The caller counts each variant for real rather
 * than guessing which word was the problem.
 *
 * Dropped: single-word queries (nothing to relax) and variants that would leave
 * only a bare number, which matches almost everything and helps nobody.
 */
export function dropOneWordQueries(q) {
  const parsed = parseQuery(q);
  if (parsed.tokens.length < 2) return [];

  const words = parsed.tokens.map((token) => token.raw);
  const out = [];
  const seen = new Set();

  for (let index = 0; index < words.length; index += 1) {
    const remaining = words.filter((_, position) => position !== index);
    if (remaining.every((word) => /^\d+$/.test(word) || word.length < 3)) continue;
    const query = remaining.join(" ");
    if (seen.has(query)) continue;
    seen.add(query);
    out.push({ query, dropped: words[index] });
  }

  return out;
}

/** Resolve a suggestion's category, for callers that need its metadata. */
export function suggestionCategory(slug) {
  return getCategory(slug);
}
