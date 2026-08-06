/*
 * AltF Lexicon corpus access (server only)
 *
 * The corpus is split by how it is READ, not by how it was written:
 *
 *   entries/<bucket>   full records, bucketed by slug prefix — a word page is
 *                      one small read, and the bucket is computed from the
 *                      slug, so there is no slug map to load first
 *   letters/<a-z>      compact rows for A–Z browsing
 *   lists/…            precomputed word grids for the pattern pages
 *   collections/…      curated and derived topic lists
 *   rhymes/<shard>     rhyme key -> slugs
 *
 * Every file is gzipped on disk. Uncompressed the corpus is ~106 MB and has to
 * share a 215 MiB deploy artifact with a 77 MB idea corpus; compressed it is
 * ~32 MB. Reads pay one gunzip per file per process. Nothing is ever
 * invalidated — corpus files are immutable per deploy — but the entry buckets
 * are evicted under an LRU, because there are 1,906 of them and holding them
 * all costs 199 MB. See the cache note below.
 */

import { gunzipSync } from "node:zlib";

import { readCorpusFile } from "./corpus-source.js";
import { bucketOf, editDistance, letterOf, slugifyWord } from "./words.js";

/*
 * Two caches, because the corpus has two very different shapes.
 *
 * The fixed set — manifest, facets, 27 letter indexes, 199 collections, the
 * word lists — is small, hot and read on nearly every request, so it is
 * memoised forever. It is bounded by construction.
 *
 * The entry buckets are not: there are 1,906 of them, and a crawler working
 * through 135,000 word pages touches every one. Measured, that reaches
 * 199 MB of resident heap and never comes back down, which is a real risk on a
 * memory-capped serverless runtime. They get an LRU instead.
 *
 * The cost of a miss is one file read and one gunzip — a few milliseconds
 * against a page that is already doing several. The cost of no ceiling is an
 * OOM at whatever hour a crawler decides to be thorough.
 */
const cache = new Map();
const bucketCache = new Map();

/* ~200 buckets ≈ 20 MB, and enough that a reader following links inside one
   region of the alphabet stays entirely in cache. */
const MAX_BUCKETS = 200;

function loadJson(relativePath, { optional = false, bounded = false } = {}) {
  const store = bounded ? bucketCache : cache;

  if (store.has(relativePath)) {
    const hit = store.get(relativePath);
    if (bounded) {
      // Re-insert to move it to the end: a Map iterates in insertion order, so
      // the first key is the least recently used.
      store.delete(relativePath);
      store.set(relativePath, hit);
    }
    return hit;
  }

  const promise = readCorpusFile(`${relativePath}.gz`)
    .then((buffer) => {
      // Static CDNs normally serve .gz files as application/gzip. Tolerating
      // an already-decoded response also keeps the loader correct if a proxy
      // applies Content-Encoding and Node transparently decompresses it.
      const bytes = Buffer.from(buffer);
      const json = bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes) : bytes;
      return JSON.parse(json.toString("utf8"));
    })
    .catch((error) => {
      store.delete(relativePath);
      if (optional && error.code === "ENOENT") return null;
      throw new Error(
        `AltF Lexicon corpus missing "${relativePath}". Run "npm run generate:lexicon" first. (${error.message})`,
      );
    });

  store.set(relativePath, promise);

  if (bounded && store.size > MAX_BUCKETS) {
    store.delete(store.keys().next().value);
  }

  return promise;
}

export const getManifest = () => loadJson("manifest.json");
export const getFacets = () => loadJson("facets.json");
export const getWotd = () => loadJson("wotd.json");
export const getInflections = () => loadJson("inflections.json");
export const getCollectionIndex = () => loadJson("collections/index.json");
export const getPairs = () => loadJson("pairs.json");

export const getLetterIndex = (letter) => loadJson(`letters/${letterOf(letter)}.json`);
export const getCollection = (slug) =>
  loadJson(`collections/${slugifyWord(slug)}.json`, { optional: true });

/** `kind` is one of length | starting | ending | cross | containing. */
export const getList = (kind, key) =>
  loadJson(`lists/${kind}/${String(key).toLowerCase()}.json`, { optional: true });

/* ------------------------------------------------------------------ *
 * Words
 * ------------------------------------------------------------------ */

let bucketSplitSet = null;

async function splitPrefixes() {
  if (!bucketSplitSet) {
    const manifest = await getManifest();
    bucketSplitSet = new Set(manifest.splitPrefixes || []);
  }
  return bucketSplitSet;
}

/** The bucket a slug lives in, computed rather than looked up. */
export async function bucketFor(slug) {
  return bucketOf(slug, await splitPrefixes());
}

/**
 * One word, by slug. Returns `null` rather than throwing so a page can call
 * notFound() — a missing slug is a 404, not a broken corpus.
 */
export async function getWord(slug) {
  const clean = slugifyWord(slug);
  if (!clean) return null;

  const bucket = await bucketFor(clean);
  const entries = await loadJson(`entries/${bucket}.json`, { optional: true, bounded: true });
  return entries?.find((entry) => entry.s === clean) ?? null;
}

/** Several words at once, deduped and read one bucket at a time. */
export async function getWords(slugs = []) {
  const wanted = [...new Set(slugs.map(slugifyWord).filter(Boolean))];
  if (wanted.length === 0) return [];

  const byBucket = new Map();
  for (const slug of wanted) {
    const bucket = await bucketFor(slug);
    if (!byBucket.has(bucket)) byBucket.set(bucket, []);
    byBucket.get(bucket).push(slug);
  }

  const found = new Map();
  await Promise.all(
    [...byBucket.entries()].map(async ([bucket, bucketSlugs]) => {
      const entries = await loadJson(`entries/${bucket}.json`, { optional: true, bounded: true });
      if (!entries) return;
      const lookup = new Set(bucketSlugs);
      for (const entry of entries) if (lookup.has(entry.s)) found.set(entry.s, entry);
    }),
  );

  // Preserve the caller's order — a related-words rail is ranked, not a set.
  return wanted.map((slug) => found.get(slug)).filter(Boolean);
}

/**
 * Resolve what a reader typed to a word that exists.
 *
 * Tries the literal slug, then the irregular-inflection table (ran → run,
 * mice → mouse), then the regular suffix rules. Returns `{ entry, via }` so
 * the page can say "showing results for run" instead of silently redirecting,
 * which is the behaviour that makes a reader distrust a dictionary.
 */
/*
 * `restoreE` marks the endings where a silent "e" was dropped before the
 * suffix was added. Candidate ORDER is load-bearing: "hoped" must resolve to
 * "hope", not to "hop", and both exist. Plurals do not get the same treatment
 * — "cats" must not resolve to the archaic "cate".
 */
const SUFFIX_RULES = [
  { pattern: /(.+)ies$/, base: "$1y" },
  { pattern: /(.+)ves$/, base: "$1f" },
  { pattern: /(.+[^aeiou])es$/, base: "$1" },
  { pattern: /(.+)s$/, base: "$1" },
  { pattern: /(.+)ied$/, base: "$1y" },
  { pattern: /(.+)ing$/, base: "$1", restoreE: true },
  { pattern: /(.+)ed$/, base: "$1", restoreE: true },
  { pattern: /(.+)ier$/, base: "$1y" },
  { pattern: /(.+)iest$/, base: "$1y" },
  { pattern: /(.+)er$/, base: "$1", restoreE: true },
  { pattern: /(.+)est$/, base: "$1", restoreE: true },
  { pattern: /(.+)ly$/, base: "$1" },
];

export async function resolveWord(query) {
  const clean = slugifyWord(query);
  if (!clean) return null;

  const direct = await getWord(clean);
  if (direct) return { entry: direct, via: null };

  const inflections = await getInflections();
  const irregular = inflections[clean];
  if (irregular) {
    const entry = await getWord(irregular[0]);
    if (entry) return { entry, via: { from: clean, kind: "irregular" } };
  }

  for (const rule of SUFFIX_RULES) {
    if (!rule.pattern.test(clean)) continue;
    const base = clean.replace(rule.pattern, rule.base);
    if (base === clean || base.length < 2) continue;

    const candidates = [];
    if (rule.restoreE) candidates.push(`${base}e`);
    // "running" → "runn" → "run": undo a doubled final consonant.
    if (/([bcdfglmnprstz])\1$/.test(base)) candidates.push(base.slice(0, -1));
    candidates.push(base);

    for (const candidate of candidates) {
      const entry = await getWord(candidate);
      if (entry) return { entry, via: { from: clean, kind: "inflected" } };
    }
  }

  return null;
}

/* ------------------------------------------------------------------ *
 * Search
 * ------------------------------------------------------------------ */

/**
 * Prefix search over one letter index.
 *
 * Deliberately not a fuzzy search: a dictionary reader typing "seren" wants
 * the words that start that way, in the order they would find them in print.
 * Exact matches first, then by commonness, then alphabetically — so "run"
 * outranks "runcinate" for the query "run" without any scoring machinery.
 */
export async function searchWords(query, { limit = 20, indexableOnly = true } = {}) {
  const clean = slugifyWord(query);
  if (clean.length < 1) return [];

  const rows = await getLetterIndex(clean[0]);
  if (!rows) return [];

  const matches = rows.filter(
    (row) => row.s.startsWith(clean) && (!indexableOnly || row.ix !== undefined),
  );

  matches.sort((a, b) => {
    if (a.s === clean) return -1;
    if (b.s === clean) return 1;
    return b.c - a.c || a.s.length - b.s.length || (a.s < b.s ? -1 : 1);
  });

  return matches.slice(0, limit);
}

/**
 * "Did you mean…" for a query that matched nothing.
 *
 * Alphabetical neighbours only help when the typo is in the tail of the word;
 * they will never get from "recieve" to "receive". This scans the letter index
 * for real edits instead.
 *
 * Scoped to the first letter and to lengths within two, because a misspelling
 * almost always keeps its first letter and its rough shape — and because that
 * scope is what keeps this to one memoised file read rather than twenty-seven.
 * The cost is that a wrong first letter is not corrected; that is the right
 * trade for a lookup that has to feel instant.
 */
export async function suggestSpellings(query, { limit = 6, maxDistance = 2 } = {}) {
  const clean = slugifyWord(query);
  if (clean.length < 3) return [];

  const rows = await getLetterIndex(clean[0]);
  if (!rows) return [];

  const scored = [];
  for (const row of rows) {
    if (row.ph || Math.abs(row.s.length - clean.length) > maxDistance) continue;
    const distance = editDistance(clean, row.s, maxDistance);
    if (distance > maxDistance) continue;
    scored.push({ row, distance });
  }

  // Closest first, then the word a reader is more likely to have meant.
  scored.sort((a, b) => a.distance - b.distance || b.row.c - a.row.c || (a.row.s < b.row.s ? -1 : 1));
  return scored.slice(0, limit).map((item) => ({ ...item.row, distance: item.distance }));
}

/** One page of a letter index, for the A–Z browse pages. */
export async function browseLetter(letter, { page = 1, perPage = 60, filter } = {}) {
  const rows = (await getLetterIndex(letter)) || [];
  const visible = filter ? rows.filter(filter) : rows;
  const start = (Math.max(1, page) - 1) * perPage;
  return {
    rows: visible.slice(start, start + perPage),
    total: visible.length,
    page: Math.max(1, page),
    perPage,
  };
}

/* ------------------------------------------------------------------ *
 * Inflected forms
 * ------------------------------------------------------------------ */

export const getForms = () => loadJson("forms.json");

/**
 * The recorded irregular forms of a base word: `[{ form, pos }]`.
 *
 * Read from `forms.json` rather than by inverting the search table, because the
 * search table deliberately omits forms that are headwords in their own right
 * — and "better", "best" and "bigger" all are. Inverting it silently drops the
 * most useful entries a forms list can have.
 */
export async function getRecordedForms(slug) {
  const table = await getForms();
  const recorded = table[slugifyWord(slug)] || [];
  return recorded.map(([form, pos]) => ({ form: form.replace(/-/g, " "), pos }));
}

/* ------------------------------------------------------------------ *
 * Rhymes
 * ------------------------------------------------------------------ */

/** Which shard holds a rhyme key. Mirrors the generator exactly. */
const rhymeShardOf = (key) => (key.charCodeAt(0) + key.length) % 24;

export async function getRhymes(entry) {
  if (!entry?.rk) return [];
  const shard = await loadJson(`rhymes/${rhymeShardOf(entry.rk)}.json`, { optional: true });
  const slugs = shard?.[entry.rk] || [];
  return slugs.filter((slug) => slug !== entry.s);
}
