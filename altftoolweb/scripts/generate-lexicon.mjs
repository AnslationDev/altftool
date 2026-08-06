/*
 * AltF Lexicon corpus generator
 *
 *   node --max-old-space-size=4096 scripts/generate-lexicon.mjs [outDir]
 *
 * Reads Princeton WordNet 3.x (via the wordnet-db package) and the CMU
 * Pronouncing Dictionary, and writes the sharded JSON the site reads at
 * request time.
 *
 * Fully deterministic: no Date.now(), no Math.random(). Every ordering is
 * either alphabetical, by a stored count, or by a hash of the word itself, so
 * two runs of the same input produce byte-identical output and the corpus is
 * diffable in review.
 *
 * On-disk shape, split by how it is READ rather than how it was written:
 *
 *   entries/<bucket>.json   full records, bucketed by slug prefix — one small
 *                           read answers one word page, with no slug map
 *   letters/<a-z>.json      compact rows for A–Z browsing
 *   lists/…                 precomputed pSEO lists (length, suffix, prefix)
 *   collections/<slug>.json curated topic lists
 *   rhymes/<shard>.json     rhyme key -> slugs
 *   facets.json             counts only, no records
 *   manifest.json           totals + the bucket-split set the reader needs
 *   wotd.json               the year's Word of the Day rotation
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { dictionary as CMUDICT } from "cmu-pronouncing-dictionary";

import {
  LETTERS,
  POS,
  bucketOf,
  commonnessBand,
  displayWord,
  letterOf,
  parseGloss,
  shortDefinition,
  slugifyWord,
} from "../packages/core/src/lexicon/words.js";
import { buildPronunciation, toSyllables } from "../packages/core/src/lexicon/pronounce.js";
import { COLLECTIONS } from "../packages/core/src/lexicon/collections.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const DICT = join(root, "node_modules", "wordnet-db", "dict");
const outDir = process.argv[2] || join(root, "public", "data", "lexicon");

/* Buckets above this many entries are split one character deeper, so no single
   word lookup ever has to parse a multi-megabyte file. */
const BUCKET_SPLIT_AT = 900;
/* Hyponym lists run to hundreds of members for words like "plant"; past a
   dozen they stop being a reading aid and start being a wall. */
const MAX_NARROWER = 10;
const MAX_SYNONYMS = 14;
const WOTD_DAYS = 366;

const log = (message) => process.stdout.write(`${message}\n`);

/* ------------------------------------------------------------------ *
 * 1. Read WordNet
 * ------------------------------------------------------------------ */

const POS_FILES = [
  ["n", "noun"],
  ["v", "verb"],
  ["a", "adj"],
  ["r", "adv"],
];

/** Adjective markers ride on the lemma in data files: "cold(p)". */
const stripMarker = (word) => word.replace(/\([apip]+\)$/, "");

/**
 * Parse one data.<pos> line.
 *
 * Format: offset lex_filenum ss_type w_cnt (word lex_id)* p_cnt (ptr)*
 *         [f_cnt (frame)*]  | gloss
 *
 * w_cnt is hex and p_cnt is decimal, which is the kind of detail that silently
 * shifts every subsequent field if you get it wrong — so the pointer count is
 * read positionally rather than by scanning for symbols.
 */
function parseDataLine(line) {
  const barAt = line.indexOf(" | ");
  const head = barAt === -1 ? line : line.slice(0, barAt);
  const gloss = barAt === -1 ? "" : line.slice(barAt + 3);
  const fields = head.trim().split(/\s+/);

  const offset = fields[0];
  const lexFile = parseInt(fields[1], 10);
  const ssType = fields[2];
  const wordCount = parseInt(fields[3], 16);

  const words = [];
  let cursor = 4;
  for (let i = 0; i < wordCount; i += 1) {
    words.push(stripMarker(fields[cursor]));
    cursor += 2; // word, lex_id
  }

  const pointerCount = parseInt(fields[cursor], 10);
  cursor += 1;

  const pointers = [];
  for (let i = 0; i < pointerCount; i += 1) {
    pointers.push({
      symbol: fields[cursor],
      offset: fields[cursor + 1],
      pos: fields[cursor + 2],
      source: parseInt(fields[cursor + 3].slice(0, 2), 16),
      target: parseInt(fields[cursor + 3].slice(2), 16),
    });
    cursor += 4;
  }

  return { offset, lexFile, ssType, words, pointers, gloss };
}

/*
 * WordNet's 45 lexicographer files are a semantic taxonomy the corpus already
 * carries — every synset is filed under exactly one. Using them means our
 * topic collections are WordNet's own classification rather than a keyword
 * match we invented, so "animals" contains what a lexicographer called an
 * animal instead of everything whose gloss happens to say "animal".
 */
const LEX_DOMAINS = [
  "adj.all", "adj.pert", "adv.all", "noun.Tops", "noun.act", "noun.animal",
  "noun.artifact", "noun.attribute", "noun.body", "noun.cognition",
  "noun.communication", "noun.event", "noun.feeling", "noun.food",
  "noun.group", "noun.location", "noun.motive", "noun.object", "noun.person",
  "noun.phenomenon", "noun.plant", "noun.possession", "noun.process",
  "noun.quantity", "noun.relation", "noun.shape", "noun.state",
  "noun.substance", "noun.time", "verb.body", "verb.change", "verb.cognition",
  "verb.communication", "verb.competition", "verb.consumption",
  "verb.contact", "verb.creation", "verb.emotion", "verb.motion",
  "verb.perception", "verb.possession", "verb.social", "verb.stative",
  "verb.weather", "adj.ppl",
];

log("Reading WordNet…");

/** key `${pos}:${offset}` -> synset. Adjective satellites keep pos "a". */
const synsets = new Map();

for (const [posKey, file] of POS_FILES) {
  const text = readFileSync(join(DICT, `data.${file}`), "utf8");
  for (const line of text.split("\n")) {
    // The licence header is indented by two spaces; data lines never are.
    if (!line || line.startsWith("  ")) continue;
    const parsed = parseDataLine(line);
    synsets.set(`${posKey}:${parsed.offset}`, parsed);
  }
}

log(`  ${synsets.size.toLocaleString("en-US")} synsets`);

/** lemma -> { [pos]: { offsets: string[], tagsense: number } } */
const lemmaIndex = new Map();

for (const [posKey, file] of POS_FILES) {
  const text = readFileSync(join(DICT, `index.${file}`), "utf8");
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("  ")) continue;
    const fields = line.trim().split(/\s+/);
    const lemma = fields[0];
    const synsetCount = parseInt(fields[2], 10);
    const pointerCount = parseInt(fields[3], 10);
    // lemma pos synset_cnt p_cnt [ptr…] sense_cnt tagsense_cnt offset…
    const tagsenseAt = 4 + pointerCount + 1;
    const tagsense = parseInt(fields[tagsenseAt], 10) || 0;
    const offsets = fields.slice(tagsenseAt + 1, tagsenseAt + 1 + synsetCount);

    if (!lemmaIndex.has(lemma)) lemmaIndex.set(lemma, {});
    lemmaIndex.get(lemma)[posKey] = { offsets, tagsense };
  }
}

log(`  ${lemmaIndex.size.toLocaleString("en-US")} lemmas`);

/* index.sense carries how often each sense was seen in the hand-tagged
   corpora. It is the only usage evidence WordNet ships, so it does double duty
   as sense ordering and as a commonness input. */
const senseTags = new Map();
{
  const text = readFileSync(join(DICT, "index.sense"), "utf8");
  for (const line of text.split("\n")) {
    if (!line) continue;
    const [senseKey, offset, , tagCount] = line.split(" ");
    const lemma = senseKey.slice(0, senseKey.indexOf("%"));
    const key = `${lemma}:${offset}`;
    senseTags.set(key, (senseTags.get(key) || 0) + (parseInt(tagCount, 10) || 0));
  }
}

/* Frequency ranks: "word<TAB>rank", one per line, `#` comments.
   Vendored rather than downloaded so a build never needs the network. Without
   it, commonness falls back to polysemy plus corpus tag counts — which is a
   real signal but a blunt one, and it files "serendipity" as rare. */
const frequencyRank = new Map();
{
  const path = join(root, "scripts", "data", "word-frequency.txt");
  if (existsSync(path)) {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      if (!line || line.startsWith("#")) continue;
      const [word, rank] = line.split("\t");
      const parsed = Number.parseInt(rank, 10);
      if (!word || !Number.isFinite(parsed)) continue;
      const lower = word.toLowerCase();
      if (!frequencyRank.has(lower)) frequencyRank.set(lower, parsed);
    }
    log(`  ${frequencyRank.size.toLocaleString("en-US")} frequency ranks`);
  } else {
    log("  no frequency list vendored — commonness falls back to polysemy");
  }
}

/* ------------------------------------------------------------------ *
 * 2. Build entries
 * ------------------------------------------------------------------ */

const POS_ORDER = POS.map((p) => p.key);

/*
 * Multi-word lemmas are real dictionary content (idioms, compound nouns,
 * phrasal verbs), but WordNet's noun index also carries tens of thousands of
 * taxonomic rungs — "genus acer", "family ranidae". Those get pages so the
 * corpus stays complete and internally linkable, and are marked non-indexable
 * so we are not asking search engines to crawl a botanical index.
 */
const TAXONOMIC = /^(genus|family|order|class|phylum|division|subfamily|subgenus|suborder|superfamily|tribe|subclass|kingdom)_/;

const relationOf = {
  "!": "antonym",
  "@": "broader",
  "@i": "broader",
  "~": "narrower",
  "~i": "narrower",
  "&": "similar",
  "=": "attribute",
  "*": "entails",
  ">": "causes",
  "^": "seeAlso",
  "\\": "derivedFrom",
  "#m": "partOf",
  "#s": "madeOf",
  "#p": "partOf",
  "%m": "members",
  "%s": "substances",
  "%p": "parts",
};

/*
 * Domain pointers are how WordNet records the register a sense belongs to: the
 * field it is used in (`;c` — medicine, law, computing), the place it is used
 * (`;r` — India, Britain, Australia) and how it is used (`;u` — slang,
 * informal, archaic). They are the only editorial labelling in the database,
 * and they are what make a "words used in Indian English" page possible from
 * primary data rather than from a list somebody typed.
 */
const DOMAIN_SYMBOLS = { ";c": "topic", ";r": "region", ";u": "usage" };

/** First lemma of a synset, in display form — what we show for a relation. */
const headOf = (synset) => (synset ? displayWord(synset.words[0]) : null);

function sensesFor(lemma, posKey, entry) {
  const senses = [];

  for (const offset of entry.offsets) {
    const synset = synsets.get(`${posKey}:${offset}`);
    if (!synset) continue;

    const { definition, examples } = parseGloss(synset.gloss);
    if (!definition) continue;

    // WordNet stores lemma position 1-based; a lexical pointer with source 0
    // applies to the whole synset.
    const position = synset.words.findIndex((w) => w.toLowerCase() === lemma.toLowerCase()) + 1;

    const synonyms = synset.words
      .filter((w) => w.toLowerCase() !== lemma.toLowerCase())
      .map(displayWord)
      .slice(0, MAX_SYNONYMS);

    const grouped = {};
    const domains = {};
    for (const pointer of synset.pointers) {
      const domainKind = DOMAIN_SYMBOLS[pointer.symbol];
      if (domainKind) {
        const targetPos = pointer.pos === "s" ? "a" : pointer.pos;
        const label = headOf(synsets.get(`${targetPos}:${pointer.offset}`));
        if (label) (domains[domainKind] ||= []).push(label);
        continue;
      }

      const relation = relationOf[pointer.symbol];
      if (!relation) continue;
      // Lexical pointers only apply to the word they were recorded against.
      if (pointer.source !== 0 && pointer.source !== position) continue;

      const targetPos = pointer.pos === "s" ? "a" : pointer.pos;
      const target = synsets.get(`${targetPos}:${pointer.offset}`);
      if (!target) continue;

      const name =
        pointer.target !== 0 && target.words[pointer.target - 1]
          ? displayWord(stripMarker(target.words[pointer.target - 1]))
          : headOf(target);
      if (!name || name.toLowerCase() === lemma.toLowerCase()) continue;

      (grouped[relation] ||= []).push(name);
    }

    const unique = (list, cap) => (list ? [...new Set(list)].slice(0, cap) : undefined);

    senses.push({
      p: posKey,
      g: definition,
      d: LEX_DOMAINS[synset.lexFile],
      tp: unique(domains.topic, 3),
      rg: unique(domains.region, 3),
      us: unique(domains.usage, 3),
      ex: examples.length ? examples : undefined,
      sy: synonyms.length ? synonyms : undefined,
      an: unique(grouped.antonym, 6),
      br: unique(grouped.broader, 4),
      nr: unique(grouped.narrower, MAX_NARROWER),
      si: unique(grouped.similar, 8),
      pt: unique(grouped.partOf, 4),
      pr: unique(grouped.parts, 6),
      se: unique(grouped.seeAlso, 4),
      tc: senseTags.get(`${lemma}:${offset}`) || 0,
    });
  }

  return senses;
}

/*
 * CMUdict ships as a plain object, so a lemma that collides with something on
 * Object.prototype resolves to a function rather than a pronunciation.
 * WordNet has entries for "constructor" and "valueOf"; without this guard they
 * ship a syllable line derived from the source of a JavaScript builtin.
 */
const cmu = (lemma) => {
  const key = lemma.toLowerCase();
  return Object.prototype.hasOwnProperty.call(CMUDICT, key) ? CMUDICT[key] : undefined;
};

log("Building entries…");

const entries = [];
const slugsSeen = new Map();

for (const [lemma, byPos] of lemmaIndex) {
  const word = displayWord(lemma);
  const senses = [];

  // Sense order across parts of speech follows WordNet's own ordering within
  // each POS, with the POS that carries the most senses first — which is very
  // nearly "the meaning a reader expects at the top".
  const posKeys = POS_ORDER.filter((key) => byPos[key]).sort(
    (a, b) => (byPos[b].offsets.length || 0) - (byPos[a].offsets.length || 0),
  );

  for (const posKey of posKeys) {
    senses.push(...sensesFor(lemma, posKey, byPos[posKey]));
  }
  if (senses.length === 0) continue;

  let slug = slugifyWord(word);
  if (!slug) continue;
  // Slugs must always resolve. Distinct lemmas that collapse to the same slug
  // ("re-cover" and "recover") are disambiguated, never dropped.
  if (slugsSeen.has(slug)) {
    const taken = slugsSeen.get(slug) + 1;
    slugsSeen.set(slug, taken);
    slug = `${slug}-${taken}`;
  } else {
    slugsSeen.set(slug, 1);
  }

  const isPhrase = lemma.includes("_");
  // The syllable line is a single-word device. Running it over "a battery"
  // produces "a ·bat·te·ry", and no pronouncing dictionary covers phrases
  // anyway, so phrases carry definitions and relations but no phonetics.
  const pronunciation = isPhrase ? null : buildPronunciation(word, cmu(lemma), posKeys[0]);
  const tagTotal = senses.reduce((sum, sense) => sum + sense.tc, 0);

  const entry = {
    w: word,
    s: slug,
    p: posKeys,
    c: commonnessBand({
      frequencyRank: frequencyRank.get(word.toLowerCase()),
      senseCount: senses.length,
      tagCount: tagTotal,
      length: word.length,
    }),
    ns: senses.length,
    ph: isPhrase || undefined,
    /*
     * Indexable entries are the ones we ask search engines to crawl. A
     * taxonomic rung with one bare gloss is a real dictionary entry and a bad
     * search result, so it stays browsable and stays out of the sitemap.
     */
    ix: !TAXONOMIC.test(lemma) && (!isPhrase || senses.some((s) => s.g.length > 30)),
    sn: senses,
  };

  if (pronunciation) {
    entry.sy = pronunciation.count;
    // `parts` is null when the spelling cannot be divided as many ways as the
    // word is spoken ("abc", "acme"). Writing the fields anyway shipped a
    // one-part syllable line under a "3 syllables" heading, and a stress index
    // pointing past the end of the array.
    if (pronunciation.parts) {
      entry.pt = pronunciation.parts;
      entry.st = pronunciation.stress;
    }
    // Only a recorded pronunciation gets IPA and a respelling. A guessed
    // phonetic transcription would be worse than none, so derived entries show
    // the syllable line alone and say so.
    if (pronunciation.src === "cmu") {
      entry.ip = pronunciation.ipa;
      entry.rs = pronunciation.respell;
    } else {
      entry.pd = 1;
    }

    // Rhyme key: everything from the last stressed vowel onward. Two words
    // rhyme when their keys match, which is exactly the definition a reader
    // has in their head.
    // Through cmu(), not CMUDICT[...] — the raw object lookup resolves lemmas
    // like "constructor" and "valueOf" to functions off Object.prototype.
    const syllables = toSyllables(cmu(lemma));
    let stressAt = -1;
    for (let i = syllables.length - 1; i >= 0; i -= 1) {
      if (syllables[i].stress > 0) {
        stressAt = i;
        break;
      }
    }
    if (stressAt !== -1 && !isPhrase) {
      entry.rk = syllables
        .slice(stressAt)
        .flatMap((s) => s.phonemes)
        .map((p) => p.replace(/\d/g, ""))
        .join("");
    }
  }

  entries.push(entry);
}

entries.sort((a, b) => (a.s < b.s ? -1 : a.s > b.s ? 1 : 0));
log(`  ${entries.length.toLocaleString("en-US")} entries`);

/*
 * Canonicalise the slug-collision duplicates.
 *
 * Distinct WordNet lemmas can collapse to one slug: ".22-caliber" and
 * ".22 caliber" differ only by a hyphen the slug strips. The generator
 * disambiguates rather than dropping — a slug must always resolve — which
 * leaves a "<base>-2" entry carrying the same definition as "<base>".
 *
 * Where the first gloss is identical the two really are one word, so the
 * duplicate points its canonical at the base and stops being indexable. It
 * stays browsable and it still resolves; it just is not advertised to search
 * engines as a second document. Where the glosses DIFFER the collision is
 * coincidental ("20" and "20/20" are different words) and both are left alone.
 *
 * This has to run before the compact rows are built, because those carry the
 * `ix` flag the letter indexes, lists and sitemap all read.
 */
{
  const bySlugAll = new Map(entries.map((entry) => [entry.s, entry]));
  let canonicalised = 0;

  for (const entry of entries) {
    const match = entry.s.match(/^(.+)-(\d+)$/);
    if (!match) continue;
    const base = bySlugAll.get(match[1]);
    if (!base || base.sn[0].g !== entry.sn[0].g) continue;

    entry.ca = base.s;
    entry.ix = false;
    canonicalised += 1;
  }

  log(`  ${canonicalised} slug-collision duplicates canonicalised to their base`);
}

/* ------------------------------------------------------------------ *
 * 3. Write
 * ------------------------------------------------------------------ */

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

/*
 * Corpus files are written gzipped.
 *
 * Uncompressed this corpus is ~106 MB, and it has to share a 215 MiB deploy
 * artifact with a 77 MB idea corpus and the rest of the platform. Lexical JSON
 * compresses about 6:1, so gzip is the difference between shipping and not.
 * Reads pay one gunzip per file per process, which is a few milliseconds
 * against a memoised cache that never invalidates.
 *
 * Level 9 with no mtime header keeps the output byte-identical between runs,
 * so the corpus stays diffable in review.
 */
const write = (relativePath, data, pretty = false) => {
  const target = join(outDir, `${relativePath}.gz`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(
    target,
    gzipSync(Buffer.from(JSON.stringify(data, null, pretty ? 2 : 0), "utf8"), {
      level: 9,
      mtime: 0,
    }),
  );
};

/* -- entries, bucketed by slug prefix -- */

const twoCharCounts = new Map();
for (const entry of entries) {
  const key = entry.s.replace(/[^a-z0-9]/g, "").slice(0, 2).padEnd(2, "_");
  twoCharCounts.set(key, (twoCharCounts.get(key) || 0) + 1);
}
const splitPrefixes = [...twoCharCounts.entries()]
  .filter(([, count]) => count > BUCKET_SPLIT_AT)
  .map(([key]) => key)
  .sort();
const splitSet = new Set(splitPrefixes);

const buckets = new Map();
for (const entry of entries) {
  const key = bucketOf(entry.s, splitSet);
  if (!buckets.has(key)) buckets.set(key, []);
  buckets.get(key).push(entry);
}
/*
 * The buckets are written at the END of this script, not here.
 *
 * A word page's most valuable outbound links are the collections that contain
 * the word and the words it gets confused with, and both are only known after
 * the collection predicates and the pair search have run. Computing them at
 * request time would mean scanning 199 collection files to render one page, so
 * they are stamped onto the entry instead — which means the entry has to be
 * written last.
 */
log(`  ${buckets.size} entry buckets (${splitPrefixes.length} split three deep)`);

/* -- compact rows for browsing -- */

const compact = (entry) => ({
  s: entry.s,
  w: entry.w,
  p: entry.p.join(""),
  c: entry.c,
  n: entry.ns,
  g: shortDefinition(entry.sn[0].g, 110),
  y: entry.sy || undefined,
  l: entry.w.replace(/[^a-zA-Z]/g, "").length,
  ph: entry.ph,
  ix: entry.ix || undefined,
});

const byLetter = new Map();
for (const entry of entries) {
  const letter = letterOf(entry.s);
  if (!byLetter.has(letter)) byLetter.set(letter, []);
  byLetter.get(letter).push(compact(entry));
}
for (const [letter, rows] of byLetter) write(`letters/${letter}.json`, rows);

/* -- precomputed pSEO lists --
   These are the shapes people actually search for: "5 letter words starting
   with A", "words ending in -ology". Precomputed because deriving them at
   request time means reading all 26 letter files for one page. */

const indexable = entries.filter((entry) => entry.ix && !entry.ph);

/* Word-grid pages show the word, not the definition, so their rows drop the
   gloss. That single omission is the difference between a 23 MB list tier and
   a 6 MB one, and the pages read better for it — a wall of definitions is not
   how anyone scans for a five-letter word. */
const grid = (entry) => ({
  s: entry.s,
  w: entry.w,
  p: entry.p.join(""),
  c: entry.c,
  y: entry.sy || undefined,
  l: entry.w.replace(/[^a-zA-Z]/g, "").length,
});

/* Grids are capped. "Words containing A" has 50,000 members and nobody reads
   past the first few hundred, so each list stores its most common LIST_CAP and
   records the true total in the manifest — the page then says how many were
   left out rather than pretending the cap is the count. */
const LIST_CAP = 2000;
const byCommon = (a, b) => b.c - a.c || (a.s < b.s ? -1 : 1);
const capped = (rows) => [...rows].sort(byCommon).slice(0, LIST_CAP);
const listTotals = { length: {}, starting: {}, ending: {}, cross: {}, containing: {} };

const lengthBuckets = new Map();
for (const entry of indexable) {
  const length = entry.w.replace(/[^a-zA-Z]/g, "").length;
  if (length < 2 || length > 15) continue;
  if (!lengthBuckets.has(length)) lengthBuckets.set(length, []);
  lengthBuckets.get(length).push(grid(entry));
}
/* Starting-letter grids, and the length × letter cross that carries most of
   the "5 letter words starting with T" demand. */
const startingBuckets = new Map();
const crossBuckets = new Map();
for (const entry of indexable) {
  const letter = letterOf(entry.s);
  if (letter === "0") continue;
  const row = grid(entry);
  if (!startingBuckets.has(letter)) startingBuckets.set(letter, []);
  startingBuckets.get(letter).push(row);

  if (row.l >= 2 && row.l <= 12) {
    const key = `${row.l}-${letter}`;
    if (!crossBuckets.has(key)) crossBuckets.set(key, []);
    crossBuckets.get(key).push(row);
  }
}
for (const [length, rows] of lengthBuckets) {
  listTotals.length[length] = rows.length;
  write(`lists/length/${length}.json`, capped(rows));
}
for (const [letter, rows] of startingBuckets) {
  listTotals.starting[letter] = rows.length;
  write(`lists/starting/${letter}.json`, capped(rows));
}

const CROSS_MIN = 12;
const crossKeys = [];
for (const [key, rows] of crossBuckets) {
  if (rows.length < CROSS_MIN) continue;
  crossKeys.push(key);
  listTotals.cross[key] = rows.length;
  write(`lists/cross/${key}.json`, capped(rows));
}
crossKeys.sort();

/* "Words containing X" — single letters plus the letter pairs that carry real
   search demand. Capped at pairs that actually occur often enough to fill a
   page. */
const containsCounts = new Map();
for (const entry of indexable) {
  const value = entry.s.replace(/[^a-z]/g, "");
  const seen = new Set();
  for (let i = 0; i < value.length - 1; i += 1) {
    const pair = value.slice(i, i + 2);
    if (seen.has(pair)) continue;
    seen.add(pair);
    containsCounts.set(pair, (containsCounts.get(pair) || 0) + 1);
  }
}
const containsKeys = [
  ...LETTERS,
  ...[...containsCounts.entries()]
    .filter(([, count]) => count >= 900)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 120)
    .map(([pair]) => pair),
];
const containsTotals = new Map();
for (const key of containsKeys) {
  const rows = indexable.filter((entry) => entry.s.includes(key)).map(grid);
  containsTotals.set(key, rows.length);
  write(`lists/containing/${key}.json`, capped(rows));
}

const SUFFIX_MIN = 400;
const suffixCounts = new Map();
for (const entry of indexable) {
  const clean = entry.s;
  for (const size of [2, 3, 4, 5]) {
    if (clean.length <= size + 1) continue;
    const suffix = clean.slice(-size);
    if (!/^[a-z]+$/.test(suffix)) continue;
    suffixCounts.set(suffix, (suffixCounts.get(suffix) || 0) + 1);
  }
}
const suffixes = [...suffixCounts.entries()]
  .filter(([, count]) => count >= SUFFIX_MIN)
  .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
  .slice(0, 220)
  .map(([suffix]) => suffix);

for (const suffix of suffixes) {
  const rows = indexable
    .filter((entry) => entry.s.endsWith(suffix) && entry.s.length > suffix.length + 1)
    .map(grid);
  listTotals.ending[suffix] = rows.length;
  write(`lists/ending/${suffix}.json`, capped(rows));
}
for (const key of containsKeys) listTotals.containing[key] = containsTotals.get(key) || 0;
log(
  `  ${lengthBuckets.size} length · ${startingBuckets.size} starting · ${suffixes.length} ending · ` +
    `${crossKeys.length} cross · ${containsKeys.length} containing lists`,
);

/* -- collections --
   Hand-authored collections cover shape, sound and learning, where the rule is
   a judgement about readers. Subject collections are DERIVED from WordNet's own
   topic, region and register labels: scanning the corpus for every label with
   enough members produces a few hundred real categories, where typing them by
   hand would produce a few dozen and a lot of empty pages. */

const derived = new Map();
const noteLabel = (kind, label, slug) => {
  const key = `${kind}:${label}`;
  if (!derived.has(key)) derived.set(key, { kind, label, slugs: new Set() });
  derived.get(key).slugs.add(slug);
};

for (const entry of entries) {
  for (const sense of entry.sn) {
    for (const label of sense.tp || []) noteLabel("topic", label, entry.s);
    for (const label of sense.rg || []) noteLabel("region", label, entry.s);
    for (const label of sense.us || []) noteLabel("usage", label, entry.s);
  }
}

const DERIVED_MIN = 25;
const KIND_META = {
  topic: {
    group: "subject",
    name: (label) => `${label[0].toUpperCase()}${label.slice(1)} vocabulary`,
    title: (label) => `${label[0].toUpperCase()}${label.slice(1)} vocabulary`,
    describe: (label, count) =>
      `${count.toLocaleString("en-US")} entries with at least one sense that WordNet files under ${label}. Membership is the lexicographer's own subject label, not a keyword match on the definition.`,
  },
  region: {
    group: "register",
    name: (label) => `Words used in ${label}`,
    title: (label) => `English words used in ${label}`,
    describe: (label, count) =>
      `${count.toLocaleString("en-US")} entries carrying a sense WordNet marks as ${label} usage — vocabulary that is standard there and conspicuous elsewhere.`,
  },
  usage: {
    group: "register",
    name: (label) => `Words marked ${label}`,
    title: (label) => `Words marked ${label}`,
    describe: (label, count) =>
      `${count.toLocaleString("en-US")} entries with a sense WordNet labels ${label}. Register matters more than meaning when you are choosing between two words that mean the same thing.`,
  },
};

const authoredSlugs = new Set(COLLECTIONS.map((collection) => collection.slug));
const derivedCollections = [];

for (const { kind, label, slugs } of derived.values()) {
  if (slugs.size < DERIVED_MIN) continue;
  const meta = KIND_META[kind];
  const slug = slugifyWord(`${kind === "topic" ? "" : `${kind}-`}${label}`);
  if (!slug || authoredSlugs.has(slug)) continue;
  authoredSlugs.add(slug);
  derivedCollections.push({
    slug,
    name: meta.name(label),
    title: meta.title(label),
    group: meta.group,
    description: meta.describe(label, slugs.size),
    derivedFrom: { kind, label },
    slugs,
  });
}
derivedCollections.sort((a, b) => b.slugs.size - a.slugs.size || (a.slug < b.slug ? -1 : 1));

const bySlug = new Map(entries.map((entry) => [entry.s, entry]));
const catalog = [];

/* Ranking a collection by commonness puts the words a reader already half
   knows first, which is what makes a 600-word list feel learnable. */
const byCommonness = (a, b) => b.c - a.c || (a.s < b.s ? -1 : 1);

/*
 * Membership, captured while the predicates are already being evaluated.
 *
 * A word belongs to a handful of the 199 collections, and knowing which is what
 * turns 147,478 word pages from leaves into a connected graph. Deriving it at
 * request time would mean reading every collection file to render one page, so
 * it is recorded here and stamped onto the entry before the buckets are
 * written. Capped per word, ranked smallest-collection-first — "palindromes"
 * tells a reader far more about a word than "concrete nouns" does.
 */
const membership = new Map();
const MEMBERSHIP_CAP = 6;

const noteMember = (slug, collectionSlug) => {
  if (!membership.has(slug)) membership.set(slug, []);
  membership.get(slug).push(collectionSlug);
};

for (const collection of COLLECTIONS) {
  const matched = entries.filter((entry) => collection.match(entry));
  for (const entry of matched) noteMember(entry.s, collection.slug);

  const rows = matched.map(compact);
  rows.sort(byCommonness);
  write(`collections/${collection.slug}.json`, rows.slice(0, 600));
  catalog.push({
    slug: collection.slug,
    name: collection.name,
    title: collection.title,
    group: collection.group,
    description: collection.description,
    count: rows.length,
  });
}

for (const collection of derivedCollections) {
  for (const slug of collection.slugs) noteMember(slug, collection.slug);

  const rows = [...collection.slugs]
    .map((slug) => bySlug.get(slug))
    .filter(Boolean)
    .map(compact);
  rows.sort(byCommonness);
  write(`collections/${collection.slug}.json`, rows.slice(0, 600));
  catalog.push({
    slug: collection.slug,
    name: collection.name,
    title: collection.title,
    group: collection.group,
    description: collection.description,
    count: rows.length,
    derivedFrom: collection.derivedFrom,
  });
}

catalog.sort((a, b) => b.count - a.count || (a.slug < b.slug ? -1 : 1));
write("collections/index.json", catalog, true);
const collectionCounts = Object.fromEntries(catalog.map((c) => [c.slug, c.count]));
log(`  ${catalog.length} collections (${COLLECTIONS.length} authored, ${derivedCollections.length} derived)`);

/* -- rhymes -- */

const rhymeGroups = new Map();
for (const entry of entries) {
  if (!entry.rk) continue;
  if (!rhymeGroups.has(entry.rk)) rhymeGroups.set(entry.rk, []);
  rhymeGroups.get(entry.rk).push(entry.s);
}
const rhymeShards = new Map();
for (const [key, slugs] of rhymeGroups) {
  if (slugs.length < 2) continue;
  const shard = (key.charCodeAt(0) + key.length) % 24;
  if (!rhymeShards.has(shard)) rhymeShards.set(shard, {});
  rhymeShards.get(shard)[key] = slugs.slice(0, 200);
}
for (const [shard, group] of rhymeShards) write(`rhymes/${shard}.json`, group);
log(`  ${rhymeGroups.size.toLocaleString("en-US")} rhyme groups in ${rhymeShards.size} shards`);

/* -- inflections --
   WordNet's exception lists map irregular forms to their base: ran→run,
   mice→mouse, geese→goose. Without them a search for "ran" finds nothing,
   which is the single most common way a dictionary looks broken. Regular
   forms are handled by suffix rules at request time; only the irregulars need
   a table, and there are just under six thousand of them. */

const inflections = {};
const forms = {};
{
  const slugSet = new Set(entries.map((entry) => entry.s));
  let resolvable = 0;
  let recorded = 0;

  for (const [file, posKey] of [
    ["noun", "n"],
    ["verb", "v"],
    ["adj", "a"],
    ["adv", "r"],
  ]) {
    const path = join(root, "scripts", "data", "wordnet-exc", `${file}.exc`);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      if (!line.trim()) continue;
      const [inflected, ...bases] = line.trim().split(/\s+/);
      const target = bases.map(slugifyWord).find((slug) => slugSet.has(slug));
      if (!target) continue;
      const from = slugifyWord(inflected);
      if (!from || from === target) continue;

      /*
       * Two tables, because the two readers want opposite things.
       *
       * `inflections` answers "what did this reader mean?" and must NOT contain
       * forms that are headwords in their own right — searching "best" should
       * land on the entry for "best", not redirect to "good".
       *
       * `forms` answers "what are this word's other forms?" and must contain
       * exactly those, because "better" and "best" are the whole point of
       * showing the forms of "good". Filtering headwords out of both is the
       * bug this split exists to prevent.
       */
      if (!slugSet.has(from) && !inflections[from]) {
        // A form can belong to more than one base ("axes" → axis and axe); the
        // first wins and the page offers the alternative rather than guessing.
        inflections[from] = [target, posKey];
        resolvable += 1;
      }

      if (!forms[target]) forms[target] = [];
      if (!forms[target].some((item) => item[0] === from && item[1] === posKey)) {
        forms[target].push([from, posKey]);
        recorded += 1;
      }
    }
  }

  write("inflections.json", inflections);
  write("forms.json", forms);
  log(
    `  ${resolvable.toLocaleString("en-US")} irregular forms resolvable · ` +
      `${recorded.toLocaleString("en-US")} recorded against ${Object.keys(forms).length.toLocaleString("en-US")} words`,
  );
}

let storedPairs = [];

/* -- confusable pairs --
   The "X vs Y" page is one of the highest-intent shapes in the category and the
   most durable, but a hand-typed list of pairs would be short and arbitrary.
   Both kinds here are computed from the corpus itself:

     homophone   identical IPA, different spelling — their/there, to/too
     near-spelling  one edit apart — desert/dessert, affect/effect

   Both words must be common enough that somebody would actually confuse them;
   two rare words one letter apart is a curiosity, not a question. */

const pairs = [];
{
  const candidates = entries.filter(
    (entry) => entry.ix && !entry.ph && entry.c >= 3 && /^[a-z]+$/.test(entry.s) && entry.s.length >= 3,
  );

  const byIpa = new Map();
  for (const entry of candidates) {
    if (!entry.ip) continue;
    if (!byIpa.has(entry.ip)) byIpa.set(entry.ip, []);
    byIpa.get(entry.ip).push(entry);
  }
  for (const group of byIpa.values()) {
    if (group.length < 2 || group.length > 4) continue;
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        pairs.push({ a: group[i].s, b: group[j].s, kind: "homophone" });
      }
    }
  }

  /* One edit apart, checked only within buckets that share a length and a first
     or last letter — the full O(n²) comparison over 30,000 candidates is not
     worth the twenty seconds it costs. */
  const oneEditApart = (x, y) => {
    if (Math.abs(x.length - y.length) > 1) return false;
    const [shorter, longer] = x.length <= y.length ? [x, y] : [y, x];
    let i = 0;
    let j = 0;
    let edits = 0;
    while (i < shorter.length && j < longer.length) {
      if (shorter[i] === longer[j]) {
        i += 1;
        j += 1;
        continue;
      }
      edits += 1;
      if (edits > 1) return false;
      if (shorter.length === longer.length) i += 1;
      j += 1;
    }
    return edits + (longer.length - j) + (shorter.length - i) === 1;
  };

  /*
   * Edit distance alone is a bad proxy for "confusable". At five letters it
   * returns beach/reach, black/block and bunch/lunch — rhymes, not spelling
   * questions. Two constraints fix it: both words at least six letters, and the
   * single edit at least three characters in. That keeps principal/principle,
   * complement/compliment and stationary/stationery, and drops the rhymes,
   * because a word people confuse is one whose difference is buried, not one
   * whose difference is the first thing you read.
   */
  const NEAR_MIN_LENGTH = 6;
  const NEAR_MIN_EDIT_POSITION = 3;

  const editPosition = (x, y) => {
    for (let i = 0; i < Math.min(x.length, y.length); i += 1) {
      if (x[i] !== y[i]) return i;
    }
    return Math.min(x.length, y.length);
  };

  const buckets = new Map();
  for (const entry of candidates) {
    if (entry.s.length < NEAR_MIN_LENGTH) continue;
    const key = `${entry.s.length}:${entry.s[entry.s.length - 1]}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(entry);
  }

  const seenPair = new Set(pairs.map((pair) => `${pair.a}|${pair.b}`));
  for (const bucket of buckets.values()) {
    if (bucket.length > 900) continue;
    for (let i = 0; i < bucket.length; i += 1) {
      for (let j = i + 1; j < bucket.length; j += 1) {
        if (!oneEditApart(bucket[i].s, bucket[j].s)) continue;
        if (editPosition(bucket[i].s, bucket[j].s) < NEAR_MIN_EDIT_POSITION) continue;
        const key = `${bucket[i].s}|${bucket[j].s}`;
        if (seenPair.has(key)) continue;
        seenPair.add(key);
        pairs.push({ a: bucket[i].s, b: bucket[j].s, kind: "near-spelling" });
      }
    }
  }

  /*
   * The third tier, and the one with no guesswork in it at all: pairs that
   * WordNet records as synonyms of each other but that sit in different
   * commonness bands. "begin vs commence", "buy vs purchase" — the question
   * being asked is not what they mean, it is which one to use, and a
   * side-by-side of register and frequency answers it exactly.
   */
  const bySlug = new Map(candidates.map((entry) => [entry.s, entry]));
  for (const entry of candidates) {
    // Only the first few senses, and only the first synonym of each. WordNet
    // synsets get loose at the edges — sense 9 of "abuse" lists "step" — and a
    // comparison page is only worth writing for meanings a reader would
    // actually weigh against each other.
    for (const sense of entry.sn.slice(0, 3)) {
      for (const synonym of (sense.sy || []).slice(0, 2)) {
        const other = bySlug.get(slugifyWord(synonym));
        if (!other || other.s === entry.s) continue;
        if (Math.abs(other.c - entry.c) < 1) continue;
        const [a, b] = entry.s < other.s ? [entry.s, other.s] : [other.s, entry.s];
        const key = `${a}|${b}`;
        if (seenPair.has(key)) continue;
        seenPair.add(key);
        pairs.push({ a, b, kind: "synonym" });
      }
    }
  }

  // Rank by how likely the confusion is: both words common beats one common.
  const bandOf = new Map(candidates.map((entry) => [entry.s, entry.c]));
  pairs.sort((x, y) => {
    const weight = (pair) => (bandOf.get(pair.a) || 0) + (bandOf.get(pair.b) || 0);
    return weight(y) - weight(x) || (x.a < y.a ? -1 : 1);
  });

  /* Quota per kind rather than one global cut. Synonym pairs are the most
     numerous and would otherwise crowd out every homophone — and homophones
     are the highest-intent shape of the three. */
  const QUOTA = { homophone: 500, "near-spelling": 300, synonym: 700 };
  storedPairs = [];
  const stored = storedPairs;
  for (const kind of Object.keys(QUOTA)) {
    stored.push(...pairs.filter((pair) => pair.kind === kind).slice(0, QUOTA[kind]));
  }

  write("pairs.json", stored);
  log(
    `  ${stored.length.toLocaleString("en-US")} comparison pairs stored of ` +
      `${pairs.length.toLocaleString("en-US")} found ` +
      `(${stored.filter((p) => p.kind === "homophone").length} homophone, ` +
      `${stored.filter((p) => p.kind === "near-spelling").length} near-spelling, ` +
      `${stored.filter((p) => p.kind === "synonym").length} synonym)`,
  );
}

/* -- word of the day --
   A fixed rotation over words that are worth meeting: uncommon enough to be
   news, common enough to be usable, and carrying a usage example. Chosen by a
   hash of the word so the sequence is stable across regenerations. */

const hash32 = (value) => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const wotdPool = entries.filter(
  (entry) =>
    entry.ix &&
    !entry.ph &&
    entry.c >= 2 &&
    entry.c <= 4 &&
    entry.sy >= 2 &&
    entry.sn.some((sense) => sense.ex?.length) &&
    entry.w.length >= 5,
);
wotdPool.sort((a, b) => hash32(a.s) - hash32(b.s));
const wotd = wotdPool.slice(0, WOTD_DAYS).map((entry) => entry.s);
write("wotd.json", wotd);
log(`  ${wotd.length} words of the day from a pool of ${wotdPool.length.toLocaleString("en-US")}`);

/* -- stamp the link graph onto the entries, then write them --
   Deferred to here because a word's collections and its confusable partners
   are only known after the predicates and the pair search have run. */

{
  const collectionSize = new Map(catalog.map((item) => [item.slug, item.count]));
  const partners = new Map();
  for (const pair of storedPairs) {
    if (!partners.has(pair.a)) partners.set(pair.a, []);
    if (!partners.has(pair.b)) partners.set(pair.b, []);
    partners.get(pair.a).push([pair.b, pair.kind]);
    partners.get(pair.b).push([pair.a, pair.kind]);
  }

  let stamped = 0;
  for (const entry of entries) {
    const collections = membership.get(entry.s);
    if (collections?.length) {
      // Smallest collection first: "palindromes" says something about a word,
      // "concrete nouns" says almost nothing.
      entry.co = [...collections]
        .sort(
          (a, b) =>
            (collectionSize.get(a) ?? Infinity) - (collectionSize.get(b) ?? Infinity) ||
            (a < b ? -1 : 1),
        )
        .slice(0, MEMBERSHIP_CAP);
      stamped += 1;
    }

    const related = partners.get(entry.s);
    if (related?.length) entry.cf = related.slice(0, 6);
  }

  for (const [key, list] of buckets) write(`entries/${key}.json`, list);
  log(
    `  ${stamped.toLocaleString("en-US")} entries linked to their collections · ` +
      `${partners.size.toLocaleString("en-US")} to a confusable partner`,
  );
}

/* -- facets + manifest -- */

const facets = {
  pos: {},
  letter: {},
  commonness: {},
  syllables: {},
  length: {},
  collection: collectionCounts,
};
for (const entry of entries) {
  for (const key of entry.p) facets.pos[key] = (facets.pos[key] || 0) + 1;
  const letter = letterOf(entry.s);
  facets.letter[letter] = (facets.letter[letter] || 0) + 1;
  facets.commonness[entry.c] = (facets.commonness[entry.c] || 0) + 1;
  if (entry.sy) facets.syllables[entry.sy] = (facets.syllables[entry.sy] || 0) + 1;
  const length = entry.w.replace(/[^a-zA-Z]/g, "").length;
  if (length <= 15) facets.length[length] = (facets.length[length] || 0) + 1;
}
write("facets.json", facets, true);

const withPronunciation = entries.filter((entry) => entry.ip).length;
const manifest = {
  total: entries.length,
  indexable: entries.filter((entry) => entry.ix).length,
  words: entries.filter((entry) => !entry.ph).length,
  phrases: entries.filter((entry) => entry.ph).length,
  senses: entries.reduce((sum, entry) => sum + entry.ns, 0),
  withPronunciation,
  withSyllables: entries.filter((entry) => entry.sy).length,
  withExamples: entries.filter((entry) => entry.sn.some((s) => s.ex?.length)).length,
  withFrequency: entries.filter((entry) => frequencyRank.has(entry.w.toLowerCase())).length,
  rhymeGroups: rhymeGroups.size,
  collections: catalog.length,
  inflections: Object.keys(inflections).length,
  splitPrefixes,
  suffixes,
  containing: containsKeys,
  cross: crossKeys,
  listTotals,
  listCap: LIST_CAP,
  lengths: [...lengthBuckets.keys()].sort((a, b) => a - b),
  letters: Object.fromEntries(
    [...byLetter.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, v]) => [k, v.length]),
  ),
  source: {
    lexical: "Princeton University WordNet 3.x",
    pronunciation: "CMU Pronouncing Dictionary",
  },
};
write("manifest.json", manifest, true);

log(
  `\nDone → ${outDir}\n` +
    `  ${manifest.total.toLocaleString("en-US")} entries · ` +
    `${manifest.indexable.toLocaleString("en-US")} indexable · ` +
    `${manifest.senses.toLocaleString("en-US")} senses · ` +
    `${withPronunciation.toLocaleString("en-US")} with pronunciation`,
);
