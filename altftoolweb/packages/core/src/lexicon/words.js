/*
 * AltF Lexicon — pure word mechanics
 *
 * Everything here is a pure function of its input. The generator and the
 * running site both import this file, which is the only reason a word page can
 * be trusted: the syllable line rendered at request time is produced by the
 * same code that produced the stored one.
 *
 * No Date.now(), no Math.random() — the corpus must be byte-reproducible.
 */

/* ------------------------------------------------------------------ *
 * Parts of speech
 * ------------------------------------------------------------------ */

/*
 * WordNet ships four open classes. Adjective satellites (`s`) are adjectives
 * that only exist relative to a head adjective; they are folded into `a`
 * because "satellite adjective" is a lexicographer's distinction, not a
 * reader's.
 */
export const POS = Object.freeze([
  {
    key: "n",
    label: "noun",
    plural: "nouns",
    abbr: "n.",
    cssVar: "--afl-noun",
    className: "afl-pos--noun",
    blurb: "A person, place, thing, quality or idea.",
  },
  {
    key: "v",
    label: "verb",
    plural: "verbs",
    abbr: "v.",
    cssVar: "--afl-verb",
    className: "afl-pos--verb",
    blurb: "An action, occurrence or state of being.",
  },
  {
    key: "a",
    label: "adjective",
    plural: "adjectives",
    abbr: "adj.",
    cssVar: "--afl-adjective",
    className: "afl-pos--adjective",
    blurb: "A word that describes or qualifies a noun.",
  },
  {
    key: "r",
    label: "adverb",
    plural: "adverbs",
    abbr: "adv.",
    cssVar: "--afl-adverb",
    className: "afl-pos--adverb",
    blurb: "A word that modifies a verb, adjective or other adverb.",
  },
]);

export const POS_BY_KEY = Object.freeze(
  POS.reduce((acc, entry) => {
    acc[entry.key] = entry;
    return acc;
  }, {}),
);

/** WordNet's `s` (satellite adjective) is an adjective as far as a reader is concerned. */
export const normalizePos = (raw) => (raw === "s" ? "a" : raw);

export const posLabel = (key) => POS_BY_KEY[normalizePos(key)]?.label ?? "word";

/* ------------------------------------------------------------------ *
 * Slugs
 * ------------------------------------------------------------------ */

/*
 * WordNet lemmas use underscores for spaces and keep apostrophes, periods and
 * hyphens ("jack-in-the-pulpit", "st._john's", "o'clock"). URL slugs collapse
 * every separator to a single hyphen, which means distinct lemmas can collide
 * — the generator disambiguates rather than dropping, exactly as AltF Ideas
 * does with idea slugs.
 */
export function slugifyWord(word) {
  return String(word)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** WordNet stores "united_states"; readers expect "united states". */
export const displayWord = (lemma) => String(lemma).replace(/_/g, " ");

/* ------------------------------------------------------------------ *
 * Syllables
 * ------------------------------------------------------------------ */

const VOWELS = "aeiouy";

/*
 * Rule-based syllable splitting.
 *
 * This is the fallback path. Where a pronunciation dictionary covers the word
 * we take its syllable count as authoritative and only use these rules to
 * decide *where* the breaks fall, because a count that disagrees with the
 * printed hyphenation is the one error a reader will always notice.
 *
 * The rules, in order of how much they matter:
 *   1. A run of vowels is one nucleus (dipthongs: "beau", "quiet" -> qui-et is
 *      handled by the hiatus list below).
 *   2. Silent terminal "e" is not a nucleus ("make" is one syllable) unless
 *      the word would otherwise have none ("the") or it follows a consonant+l
 *      ("candle", "little" — the "le" carries a syllable).
 *   3. "-es" and "-ed" endings are usually silent after most consonants
 *      ("baked" is one syllable, "wanted" is two).
 */
const HIATUS = [
  "ia",
  "io",
  "ii",
  "ea",
  "eo",
  "ua",
  "uo",
  "ui",
  "eu",
  "iu",
  "oa",
  "ae",
  "oe",
];

function vowelGroups(word) {
  const groups = [];
  let current = null;

  for (let i = 0; i < word.length; i += 1) {
    const ch = word[i];
    const isVowel = VOWELS.includes(ch);
    if (!isVowel) {
      current = null;
      continue;
    }
    if (current && HIATUS.includes(word[i - 1] + ch)) {
      // Hiatus: two adjacent vowels that are pronounced separately, so the
      // run is cut here rather than continued ("cu-ri-ous", not "cu-rious").
      current = null;
    }
    if (current) {
      current.end = i;
    } else {
      current = { start: i, end: i };
      groups.push(current);
    }
  }

  return groups;
}

export function countSyllables(word) {
  const clean = String(word)
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  if (!clean) return 0;
  if (clean.length <= 3) return 1;

  let groups = vowelGroups(clean);

  // Silent terminal "e": "make", "grape". Kept when it is the only nucleus, or
  // when a consonant + "le" ending needs it ("candle", "purple").
  const endsWithSilentE =
    clean.endsWith("e") &&
    !clean.endsWith("le") &&
    !clean.endsWith("ee") &&
    !clean.endsWith("ye") &&
    groups.length > 1 &&
    groups[groups.length - 1].start === clean.length - 1;
  if (endsWithSilentE) groups = groups.slice(0, -1);

  // "-ed" is silent unless preceded by t or d ("wanted", "raided").
  if (clean.endsWith("ed") && clean.length > 3 && !/[td]ed$/.test(clean)) {
    const last = groups[groups.length - 1];
    if (last && last.start === clean.length - 2 && groups.length > 1) {
      groups = groups.slice(0, -1);
    }
  }

  // "-es" is silent unless it follows a sibilant ("boxes", "wishes").
  if (clean.endsWith("es") && clean.length > 3 && !/(s|x|z|ch|sh|ge|ce)es$/.test(clean)) {
    const last = groups[groups.length - 1];
    if (last && last.start === clean.length - 2 && groups.length > 1) {
      groups = groups.slice(0, -1);
    }
  }

  return Math.max(1, groups.length);
}

/* ------------------------------------------------------------------ *
 * Inflected forms
 * ------------------------------------------------------------------ */

const SIBILANT = /(s|x|z|ch|sh)$/;
const CONSONANT_Y = /[^aeiou]y$/;
const DOUBLING = /[^aeiou][aeiou][bdgklmnprt]$/;

/*
 * Nouns whose plural is the same as their singular.
 *
 * WordNet's exception lists only record forms that DIFFER, so an invariant
 * plural is invisible to them and the regular rule fires — producing "sheeps",
 * "deers" and "aircrafts". This is the shortest list that covers the ones a
 * reader is actually likely to look up.
 */
const INVARIANT_PLURALS = new Set([
  "aircraft", "bison", "cod", "deer", "elk", "fish", "grouse", "haddock",
  "halibut", "moose", "offspring", "pike", "salmon", "series", "sheep",
  "shrimp", "species", "swine", "trout", "tuna", "buffalo", "carp", "cattle",
  "corps", "means", "reindeer", "squid", "swiss", "headquarters", "crossroads",
  "barracks", "gallows", "innings", "news", "mathematics", "physics", "politics",
  "economics", "measles", "mumps", "billiards", "darts", "aerobics",
]);

/** "cat" -> "cats", "box" -> "boxes", "baby" -> "babies". */
function regularPlural(word) {
  if (SIBILANT.test(word)) return `${word}es`;
  if (CONSONANT_Y.test(word)) return `${word.slice(0, -1)}ies`;
  if (/[^f]fe$/.test(word)) return `${word.slice(0, -2)}ves`;
  // A consonant before a final "o" takes -es: goes, does, echoes, potatoes.
  if (/[^aeiou]o$/.test(word)) return `${word}es`;
  return `${word}s`;
}

function regularPast(word) {
  if (word.endsWith("e")) return `${word}d`;
  if (CONSONANT_Y.test(word)) return `${word.slice(0, -1)}ied`;
  if (DOUBLING.test(word)) return `${word}${word[word.length - 1]}ed`;
  return `${word}ed`;
}

function regularIng(word) {
  if (word.endsWith("ie")) return `${word.slice(0, -2)}ying`;
  if (word.endsWith("e") && !word.endsWith("ee")) return `${word.slice(0, -1)}ing`;
  if (DOUBLING.test(word)) return `${word}${word[word.length - 1]}ing`;
  return `${word}ing`;
}

function regularComparative(word, suffix) {
  if (word.endsWith("e")) return `${word}${suffix.slice(1)}`;
  if (CONSONANT_Y.test(word)) return `${word.slice(0, -1)}i${suffix}`;
  if (DOUBLING.test(word)) return `${word}${word[word.length - 1]}${suffix}`;
  return `${word}${suffix}`;
}

/**
 * The inflected forms of a word, labelled by how confident we are in each.
 *
 * `irregular` entries come from WordNet's own exception lists and are facts.
 * `regular` entries are produced by rule and are marked as such, because the
 * rules are right most of the time and wrong loudly: they will happily turn
 * "sheep" into "sheeps" if no irregular is recorded. A dictionary that cannot
 * tell the reader which of the two it is showing them is worse than one that
 * shows neither.
 *
 * `known` is the reverse of the corpus inflection table: `{ inflected: [base, pos] }`
 * inverted to `{ base: [{ form, pos }] }` by the caller.
 */
export function inflectedForms(entry, known = []) {
  if (!entry || entry.ph) return [];

  const word = entry.w.toLowerCase();
  if (!/^[a-z]+$/.test(word)) return [];

  const forms = [];
  const seen = new Set([word]);

  const add = (label, form, certainty) => {
    if (!form || seen.has(form)) return;
    seen.add(form);
    forms.push({ label, form, certainty });
  };

  // Anything WordNet records explicitly wins over anything we can derive.
  const irregularByPos = new Map();
  for (const item of known) {
    if (!irregularByPos.has(item.pos)) irregularByPos.set(item.pos, []);
    irregularByPos.get(item.pos).push(item.form);
  }

  if (entry.p.includes("n")) {
    const recorded = irregularByPos.get("n") || [];
    if (recorded.length > 0) {
      for (const form of recorded) add("plural", form, "irregular");
    } else if (INVARIANT_PLURALS.has(word)) {
      // The form equals the headword, so it cannot go through `add()` — that
      // would dedupe it away and the page would show no plural at all.
      forms.push({ label: "plural", form: word, certainty: "irregular", note: "unchanged" });
    } else {
      add("plural", regularPlural(word), "regular");
    }
  }

  if (entry.p.includes("v")) {
    const recorded = irregularByPos.get("v") || [];
    // The exception list does not say which form is which, so label by shape:
    // an -ing ending is a present participle and everything else is a past
    // form. Guessing past against past-participle is where this would go wrong.
    const recordedIng = recorded.filter((form) => form.endsWith("ing"));
    const recordedPast = recorded.filter((form) => !form.endsWith("ing"));

    if (recordedPast.length > 0) {
      for (const form of recordedPast) add("past tense or participle", form, "irregular");
    } else {
      add("past tense", regularPast(word), "regular");
    }

    if (recordedIng.length > 0) {
      for (const form of recordedIng) add("present participle", form, "irregular");
    } else {
      add("present participle", regularIng(word), "regular");
    }

    add("third person", regularPlural(word), "regular");
  }

  if (entry.p.includes("a")) {
    const recorded = irregularByPos.get("a") || [];
    if (recorded.length > 0) {
      for (const form of recorded) add("comparative or superlative", form, "irregular");
    } else if (entry.p[0] === "a" && entry.sy && entry.sy <= 2) {
      /*
       * Two guards, both earned. Longer adjectives take "more"/"most" rather
       * than a suffix, so "beautifuller" would be a plain error. And a word
       * that is only incidentally an adjective — "go", as in "all systems go" —
       * takes no comparative at all, which is why this only fires when the
       * adjective sense is the word's primary one.
       */
      add("comparative", regularComparative(word, "er"), "regular");
      add("superlative", regularComparative(word, "est"), "regular");
    }
  }

  return forms;
}

/* ------------------------------------------------------------------ *
 * Commonness
 * ------------------------------------------------------------------ */

export const COMMONNESS = Object.freeze([
  { band: 1, label: "Rare", blurb: "Specialist or archaic — most readers will not have met it." },
  { band: 2, label: "Uncommon", blurb: "Turns up in careful writing rather than conversation." },
  { band: 3, label: "Familiar", blurb: "Widely understood, used when the subject calls for it." },
  { band: 4, label: "Common", blurb: "Everyday vocabulary in speech and writing." },
  { band: 5, label: "Core", blurb: "Among the few thousand words that carry most English." },
]);

export const commonnessLabel = (band) =>
  COMMONNESS.find((entry) => entry.band === band)?.label ?? "Rare";

/**
 * Rank a word 1-5 for how often a reader will meet it.
 *
 * Frequency rank is the real signal where we have it. Where we do not, the
 * fallbacks are the two things WordNet does know: how many senses a word has
 * (polysemy tracks frequency closely — the commonest words are the ones that
 * have been stretched to mean the most things) and how often its senses were
 * tagged in the annotated corpora.
 */
export function commonnessBand({ frequencyRank, senseCount = 1, tagCount = 0, length = 0 }) {
  if (Number.isFinite(frequencyRank) && frequencyRank > 0) {
    if (frequencyRank <= 2000) return 5;
    if (frequencyRank <= 8000) return 4;
    if (frequencyRank <= 25000) return 3;
    if (frequencyRank <= 70000) return 2;
    return 1;
  }

  const score = senseCount * 2 + Math.min(tagCount, 40) / 4 - Math.max(0, length - 9) / 2;
  if (score >= 18) return 5;
  if (score >= 10) return 4;
  if (score >= 5) return 3;
  if (score >= 2) return 2;
  return 1;
}

/* ------------------------------------------------------------------ *
 * Glosses
 * ------------------------------------------------------------------ */

/**
 * Split a WordNet gloss into its definition and its usage examples.
 *
 * The raw form is `definition; "example one"; "example two"`. Examples are the
 * second-most-read thing on a word page, so they are separated at build time
 * rather than being left inline where a reader has to parse the punctuation.
 */
export function parseGloss(raw) {
  const text = String(raw || "").trim();
  if (!text) return { definition: "", examples: [] };

  const examples = [];
  let definition = text;

  const firstQuote = text.indexOf('; "');
  if (firstQuote !== -1) {
    definition = text.slice(0, firstQuote);
    const rest = text.slice(firstQuote + 1);
    for (const match of rest.matchAll(/"([^"]+)"/g)) {
      const example = match[1].trim().replace(/\s+/g, " ");
      if (example) examples.push(example);
    }
  }

  return {
    definition: definition.trim().replace(/\s+/g, " "),
    examples,
  };
}

/**
 * Trim a definition to a length that survives a search snippet intact.
 *
 * Cuts on a word boundary and never leaves a dangling comma or semicolon,
 * because a truncated gloss is the text most likely to be lifted verbatim by
 * a search engine or an answer engine.
 */
export function shortDefinition(definition, maxLength = 155) {
  const text = String(definition || "").trim();
  if (text.length <= maxLength) return text;

  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : maxLength).replace(/[,;:.\s]+$/, "")}…`;
}

/** "a" vs "an", derived rather than authored so it cannot drift out of sync. */
export function indefiniteArticle(word) {
  const first = String(word).trim().toLowerCase()[0];
  return "aeiou".includes(first) ? "an" : "a";
}

/* ------------------------------------------------------------------ *
 * Spelling distance
 * ------------------------------------------------------------------ */

/**
 * Damerau-Levenshtein distance, abandoned once it passes `max`.
 *
 * Transposition counts as one edit, not two, which is the whole reason to use
 * this over plain Levenshtein here: "recieve" is one slip of the fingers from
 * "receive", and a metric that scores it 2 ranks it below words nobody meant.
 *
 * The early exit matters — this runs against every row in a letter index, and
 * the full matrix for 10,000 candidates is the difference between a search
 * that feels instant and one that does not.
 */
export function editDistance(a, b, max = 2) {
  const x = String(a);
  const y = String(b);
  if (x === y) return 0;
  if (Math.abs(x.length - y.length) > max) return max + 1;

  let previousPrevious = [];
  let previous = Array.from({ length: y.length + 1 }, (unused, index) => index);
  let current = [];

  for (let i = 1; i <= x.length; i += 1) {
    current = new Array(y.length + 1);
    current[0] = i;
    let best = current[0];

    for (let j = 1; j <= y.length; j += 1) {
      const cost = x[i - 1] === y[j - 1] ? 0 : 1;
      let value = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);

      // Transposition: the two characters are swapped rather than wrong.
      if (i > 1 && j > 1 && x[i - 1] === y[j - 2] && x[i - 2] === y[j - 1]) {
        value = Math.min(value, previousPrevious[j - 2] + 1);
      }

      current[j] = value;
      if (value < best) best = value;
    }

    // Every remaining row can only add to the minimum, so once the best cell in
    // a row exceeds the budget the answer is already out of range.
    if (best > max) return max + 1;

    previousPrevious = previous;
    previous = current;
  }

  return previous[y.length];
}

/* ------------------------------------------------------------------ *
 * Letters
 * ------------------------------------------------------------------ */

export const LETTERS = Object.freeze("abcdefghijklmnopqrstuvwxyz".split(""));

/** Anything not starting with a-z lands in the numerals-and-symbols bucket. */
export function letterOf(slug) {
  const first = String(slug)[0]?.toLowerCase();
  return first && LETTERS.includes(first) ? first : "0";
}

/**
 * Which corpus bucket holds an entry.
 *
 * Two characters of the slug, escalating to three for prefixes dense enough to
 * make a bucket slow to read ("co", "un", "pre"). The split set is recorded in
 * the manifest so a reader can compute the bucket from the slug alone — there
 * is no slug map to load, which is what keeps a single word lookup down to one
 * small file read.
 */
export function bucketOf(slug, splitPrefixes) {
  const clean = String(slug).replace(/[^a-z0-9]/g, "");
  const two = clean.slice(0, 2).padEnd(2, "_");
  if (splitPrefixes && (splitPrefixes.has?.(two) ?? splitPrefixes.includes?.(two))) {
    return clean.slice(0, 3).padEnd(3, "_");
  }
  return two;
}
