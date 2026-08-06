/*
 * Build gate for the AltF Lexicon corpus.
 *
 *   node scripts/verify-lexicon.mjs
 *
 * The corpus is 1,900-odd gzipped files that nothing imports statically: pages
 * read them by a path COMPUTED from a slug, a letter or a list key. That is
 * what keeps a word page down to one small file read, and it is also why a
 * missing shard cannot be caught by the bundler — it surfaces as a 500 on a
 * page nobody opened during review, at whatever hour a crawler finds it.
 *
 * So every path the site can compute is checked here instead, before the build
 * runs, and the first failure exits non-zero naming the exact file.
 *
 * It also pins the hardcoded corpus figures in answerEngineManifest.js to the
 * real manifest. Those cannot be imported (the manifest ships gzipped), so
 * without this check they would quietly become fiction the moment the corpus is
 * regenerated — and they are the numbers quoted to answer engines.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

import { LETTERS, bucketOf } from "../packages/core/src/lexicon/words.js";
import { bucketFor, getWord } from "../packages/core/src/lexicon/corpus.js";

/* corpus.js resolves its own data directory from process.cwd(), so this script
   only works from the repo root — which is where npm runs it. */
const RELATIVE_DATA_DIR = join("public", "data", "lexicon");
const DATA_DIR = join(process.cwd(), RELATIVE_DATA_DIR);

const SAMPLE_SIZE = 200;
const RHYME_SHARDS = 24; // rhymeShardOf() in corpus.js is mod 24.

let checkedFiles = 0;

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

/*
 * Every corpus file is written as `<name>.json.gz`. Callers here name files
 * both ways ("manifest.json" and "letters/a"), so the extension is normalised
 * in one place — otherwise `letters/a` silently resolves to `letters/a.gz`,
 * which never exists, and the gate fails on a corpus that is perfectly fine.
 */
const corpusFile = (relativePath) =>
  relativePath.endsWith(".json") ? `${relativePath}.gz` : `${relativePath}.json.gz`;

const corpusPath = (relativePath) => join(RELATIVE_DATA_DIR, corpusFile(relativePath));

/** Reads one gzipped corpus file, failing the build if it is missing or corrupt. */
function readCorpusJson(relativePath) {
  const file = join(DATA_DIR, corpusFile(relativePath));

  if (!existsSync(file)) {
    fail(`missing corpus file: ${corpusPath(relativePath)}`);
  }

  try {
    const parsed = JSON.parse(gunzipSync(readFileSync(file)).toString("utf8"));
    checkedFiles += 1;
    return parsed;
  } catch (error) {
    return fail(`unreadable corpus file: ${corpusPath(relativePath)} (${error.message})`);
  }
}

/** Existence only — used where the file is large and the reader is proven elsewhere. */
function requireCorpusFile(relativePath) {
  if (!existsSync(join(DATA_DIR, corpusFile(relativePath)))) {
    fail(`missing corpus file: ${corpusPath(relativePath)}`);
  }
  checkedFiles += 1;
}

if (!existsSync(join(DATA_DIR, "manifest.json.gz"))) {
  fail(`no corpus at ${RELATIVE_DATA_DIR}. Run "npm run generate:lexicon" first.`);
}

/* ------------------------------------------------------------------ *
 * 1. The files every page reads unconditionally
 * ------------------------------------------------------------------ */

const manifest = readCorpusJson("manifest.json");
readCorpusJson("facets.json");
readCorpusJson("wotd.json");
readCorpusJson("inflections.json");
readCorpusJson("forms.json");
readCorpusJson("pairs.json");

/* Every corpus path carries its .json extension before the .gz the writer
   appends — `rhymes/0` alone resolves to `rhymes/0.gz`, which never exists. */
for (let shard = 0; shard < RHYME_SHARDS; shard += 1) {
  requireCorpusFile(`rhymes/${shard}`);
}

console.log(`manifest: ${Number(manifest.total).toLocaleString()} entries`);

/* ------------------------------------------------------------------ *
 * 2. Letter indexes — the A–Z browse and the search path
 * ------------------------------------------------------------------ */

const letterKeys = Object.keys(manifest.letters || {});
if (letterKeys.length === 0) fail("manifest.letters is empty");

const allSlugs = [];
let letterSum = 0;

for (const letter of letterKeys) {
  const rows = readCorpusJson(`letters/${letter}`);
  if (!Array.isArray(rows)) fail(`${corpusPath(`letters/${letter}`)} is not an array of rows`);

  const declared = Number(manifest.letters[letter]);
  if (rows.length !== declared) {
    fail(
      `${corpusPath(`letters/${letter}`)} holds ${rows.length.toLocaleString()} rows but manifest.letters.${letter} says ${declared.toLocaleString()}`,
    );
  }

  letterSum += rows.length;
  for (const row of rows) allSlugs.push(row.s);
}

if (letterSum !== Number(manifest.total)) {
  fail(
    `manifest.total is ${Number(manifest.total).toLocaleString()} but the letter indexes sum to ${letterSum.toLocaleString()}`,
  );
}

/* Every a-z browse route needs its index, even if the generator dropped a
   letter for having no entries — the page would 500 rather than render empty. */
for (const letter of LETTERS) {
  if (!letterKeys.includes(letter)) fail(`manifest.letters has no "${letter}" — /lexicon/browse/${letter} would 500`);
}

console.log(`letters: ${letterKeys.length} indexes, ${letterSum.toLocaleString()} rows, sum matches manifest.total`);

/* ------------------------------------------------------------------ *
 * 3. Collections
 * ------------------------------------------------------------------ */

const collectionIndex = readCorpusJson("collections/index.json");

if (collectionIndex.length !== Number(manifest.collections)) {
  fail(
    `collections/index.json lists ${collectionIndex.length} collections but manifest.collections says ${manifest.collections}`,
  );
}

for (const collection of collectionIndex) {
  if (!collection?.slug) fail(`collections/index.json has an entry with no slug: ${JSON.stringify(collection).slice(0, 120)}`);
  requireCorpusFile(`collections/${collection.slug}`);
}

console.log(`collections: ${collectionIndex.length} indexed, every data file present`);

/* ------------------------------------------------------------------ *
 * 4. Generated word lists
 * ------------------------------------------------------------------ */

/* Each kind is [manifest key holding the list of keys, lists/ subdirectory].
   Missing any one of these is a 404 on a page the sitemap advertises. */
const LIST_KINDS = [
  [manifest.lengths || [], "length"],
  [Object.keys(manifest.listTotals?.starting || {}), "starting"],
  [manifest.suffixes || [], "ending"],
  [manifest.cross || [], "cross"],
  [manifest.containing || [], "containing"],
];

let listCount = 0;
for (const [keys, kind] of LIST_KINDS) {
  if (keys.length === 0) fail(`manifest describes no "${kind}" lists — the /lexicon/words pages would be empty`);
  for (const key of keys) {
    requireCorpusFile(`lists/${kind}/${String(key).toLowerCase()}`);
    listCount += 1;
  }
}

console.log(`word lists: ${listCount} list files present across ${LIST_KINDS.length} kinds`);

/* ------------------------------------------------------------------ *
 * 5. Every computed entry bucket exists, with no undeclared extras
 * ------------------------------------------------------------------ */

const splitPrefixes = new Set(manifest.splitPrefixes || []);
const expectedBuckets = new Set(allSlugs.map((slug) => bucketOf(slug, splitPrefixes)));
const entriesDir = join(DATA_DIR, "entries");
if (!existsSync(entriesDir)) fail(`missing corpus directory: ${join(RELATIVE_DATA_DIR, "entries")}`);

const actualBuckets = new Set(
  readdirSync(entriesDir)
    .filter((name) => name.endsWith(".json.gz"))
    .map((name) => name.slice(0, -".json.gz".length)),
);

for (const bucket of expectedBuckets) {
  if (!actualBuckets.has(bucket)) fail(`missing corpus file: ${corpusPath(`entries/${bucket}`)}`);
}
for (const bucket of actualBuckets) {
  if (!expectedBuckets.has(bucket)) fail(`unexpected entry bucket not reachable from any letter index: ${corpusPath(`entries/${bucket}`)}`);
}

checkedFiles += actualBuckets.size;
console.log(`entry buckets: ${actualBuckets.size.toLocaleString()} files exactly cover every indexed slug`);

/* ------------------------------------------------------------------ *
 * 6. Word pages resolve
 * ------------------------------------------------------------------ */

/*
 * A fixed-seed sample rather than Math.random(). The corpus is byte-
 * reproducible by design, and a gate that fails on one machine and passes on
 * the next teaches everyone to re-run it until it goes green.
 */
let seed = 20260729;
const nextRandom = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};

const sample = new Set();
while (sample.size < Math.min(SAMPLE_SIZE, allSlugs.length)) {
  sample.add(allSlugs[Math.floor(nextRandom() * allSlugs.length)]);
}

for (const slug of sample) {
  const entry = await getWord(slug);
  if (!entry) {
    const bucket = await bucketFor(slug);
    fail(
      `"${slug}" is in the letter index but getWord() cannot resolve it — expected it in ${corpusPath(`entries/${bucket}`)}`,
    );
  }
}

console.log(`word pages: ${sample.size} sampled slugs all resolve through getWord()`);

/* ------------------------------------------------------------------ *
 * 7. The figures quoted to answer engines
 * ------------------------------------------------------------------ */

const SEO_MANIFEST = join("src", "platform", "seo", "answerEngineManifest.js");
const seoSource = readFileSync(join(process.cwd(), SEO_MANIFEST), "utf8");

const figuresBlock = /export const LEXICON_FIGURES = Object\.freeze\(\{([\s\S]*?)\n\}\);/.exec(seoSource);
if (!figuresBlock) {
  fail(`${SEO_MANIFEST} no longer exports "LEXICON_FIGURES = Object.freeze({...})" — this check cannot run`);
}

const declaredFigures = new Map();
for (const [, key, value] of figuresBlock[1]
  .replace(/\/\/[^\n]*/g, "")
  .matchAll(/(\w+)\s*:\s*(\d+)/g)) {
  declaredFigures.set(key, Number(value));
}

const expectedFigures = {
  total: Number(manifest.total),
  indexable: Number(manifest.indexable),
  words: Number(manifest.words),
  phrases: Number(manifest.phrases),
  senses: Number(manifest.senses),
  withPronunciation: Number(manifest.withPronunciation),
  withExamples: Number(manifest.withExamples),
  rhymeGroups: Number(manifest.rhymeGroups),
  collections: Number(manifest.collections),
  inflections: Number(manifest.inflections),
  wordLists: listCount,
};

for (const [key, expected] of Object.entries(expectedFigures)) {
  if (!declaredFigures.has(key)) {
    fail(`${SEO_MANIFEST} LEXICON_FIGURES is missing "${key}" (the corpus says ${expected.toLocaleString()})`);
  }
  const declared = declaredFigures.get(key);
  if (declared !== expected) {
    fail(
      `${SEO_MANIFEST} LEXICON_FIGURES.${key} says ${declared.toLocaleString()} but the corpus says ${expected.toLocaleString()} — update it after "npm run generate:lexicon"`,
    );
  }
}

for (const key of declaredFigures.keys()) {
  if (!(key in expectedFigures)) {
    fail(`${SEO_MANIFEST} LEXICON_FIGURES.${key} is not verified against the corpus — add it to expectedFigures in ${join("scripts", "verify-lexicon.mjs")} or remove it`);
  }
}

console.log(`answer-engine figures: ${declaredFigures.size} values match the manifest`);

console.log(`\n✓ lexicon corpus verified — ${checkedFiles.toLocaleString()} files checked`);
