/*
 * The word engine behind the AltF Lexicon tools. Server only.
 *
 * Every letter tool — anagrams, unscrambling, rack scoring, pattern matching —
 * is the same question asked four ways: which of the 147,478 entries can be
 * made from, or matched against, what the reader typed. So they share one
 * index, built once per process and held for the life of it.
 *
 * The index covers the 77,636 entries whose slug is a single run of a–z. That
 * excludes phrases ("q fever"), hyphenated forms and anything carrying a digit,
 * because none of them can be played on a Scrabble rack or written into a
 * crossword grid. It is stated on every page that uses it.
 *
 * Shape, and why:
 *   words   string[]           the slugs, in A–Z order
 *   common  Uint8Array         commonness band 1–5, parallel to `words`
 *   byKey   Map<string,int[]>  sorted-letters key -> indexes into `words`
 *   ranges  { a: [start,end] } where each letter's block sits in `words`
 *
 * Parallel arrays rather than objects: 77,636 objects cost roughly 20 MB of
 * heap and this runs in the same process as two other corpora. Strings and a
 * typed array cost a fraction of that.
 */

import { LETTERS, letterOf } from "@altftool/core/lexicon";
import { getLetterIndex } from "@altftool/core/lexicon/corpus";

import { TILE_VALUES, scoreWord } from "./scrabble.js";

const SINGLE_WORD = /^[a-z]+$/;

/** Seven tiles is a Scrabble rack; fifteen is as many as the solver will read. */
export const MAX_TILES = 15;
/** A standard set has two blanks. More than that and the scan stops being useful. */
export const MAX_BLANKS = 2;
export const MIN_WORD_LENGTH = 2;
export const MAX_PATTERN_LENGTH = 28;
/**
 * The longest single-word entry in the corpus is
 * "dichlorodiphenyltrichloroethane" at 31 letters. A `*` pattern has to be
 * allowed to reach it — capping the scan at rack length would silently drop
 * the 944 entries longer than fifteen letters.
 */
export const MAX_WORD_LENGTH = 31;

export const PATTERN_VOWELS = "aeiou";
export const PATTERN_CONSONANTS = "bcdfghjklmnpqrstvwxyz";

let bankPromise = null;

const sortLetters = (word) => word.split("").sort().join("");

async function buildBank() {
  const indexes = await Promise.all(LETTERS.map((letter) => getLetterIndex(letter)));

  const words = [];
  const common = [];
  // The 83 entries whose display form differs from the slug — "abc's", "ch'i".
  // A map of the exceptions costs nothing; a second parallel array of 77,636
  // duplicated strings costs several megabytes.
  const display = new Map();
  const byKey = new Map();
  const ranges = {};
  const lengths = new Map();

  LETTERS.forEach((letter, position) => {
    const rows = indexes[position];
    const start = words.length;
    if (rows) {
      for (const row of rows) {
        if (row.ph || !SINGLE_WORD.test(row.s)) continue;
        const index = words.length;
        words.push(row.s);
        common.push(row.c || 1);
        if (row.w && row.w !== row.s) display.set(row.s, row.w);
        lengths.set(row.s.length, (lengths.get(row.s.length) || 0) + 1);

        const key = sortLetters(row.s);
        const bucket = byKey.get(key);
        if (bucket) bucket.push(index);
        else byKey.set(key, [index]);
      }
    }
    ranges[letter] = [start, words.length];
  });

  return { words, common: Uint8Array.from(common), display, byKey, ranges, lengths };
}

/** One build per process, shared by every concurrent reader. */
export function getWordBank() {
  if (!bankPromise) {
    bankPromise = buildBank().catch((error) => {
      // Never cache a failure: a transient read error must not poison the
      // engine for the rest of the process's life.
      bankPromise = null;
      throw error;
    });
  }
  return bankPromise;
}

/**
 * The numbers the tool pages quote about their own coverage.
 *
 * Read from the index rather than written down, so a regenerated corpus moves
 * the printed figures instead of quietly making them wrong.
 */
export async function getBankStats() {
  const bank = await getWordBank();
  const lengths = [...bank.lengths.keys()].sort((a, b) => a - b);
  return {
    words: bank.words.length,
    anagramKeys: bank.byKey.size,
    minLength: lengths[0] || 0,
    maxLength: lengths[lengths.length - 1] || 0,
  };
}

/**
 * Compact index rows for an arbitrary set of slugs.
 *
 * Used by the rhyme tool, whose answers land in every letter of the alphabet.
 * Reading the 26 letter indexes and filtering them is two orders of magnitude
 * cheaper than reading one entry bucket per rhyme, and the letter indexes are
 * already resident because the word bank built from them.
 */
export async function getCompactRows(slugs = []) {
  const wanted = new Set(slugs.filter(Boolean));
  if (wanted.size === 0) return new Map();

  const letters = [...new Set([...wanted].map((slug) => letterOf(slug)))];
  const indexes = await Promise.all(letters.map((letter) => getLetterIndex(letter)));

  const found = new Map();
  for (const rows of indexes) {
    if (!rows) continue;
    for (const row of rows) {
      if (wanted.has(row.s)) found.set(row.s, row);
    }
  }
  return found;
}

/* ------------------------------------------------------------------ *
 * Racks
 * ------------------------------------------------------------------ */

/**
 * Read what the player typed into tiles.
 *
 * Spaces, commas and hyphens are separators people use out of habit, so they
 * are dropped silently. `?`, `*` and `_` all mean "blank tile" because all
 * three are in common use and guessing wrong costs the reader a result.
 */
export function parseRack(raw) {
  const source = String(raw || "").toLowerCase();
  let letters = "";
  let blanks = 0;
  let truncated = false;
  let ignored = 0;

  for (const character of source) {
    if (character >= "a" && character <= "z") {
      if (letters.length < MAX_TILES) letters += character;
      else truncated = true;
    } else if (character === "?" || character === "*" || character === "_") {
      if (blanks < MAX_BLANKS) blanks += 1;
      else truncated = true;
    } else if (/[\s,.'’-]/.test(character)) {
      // Separator noise. Not an error, not a tile.
    } else {
      ignored += 1;
    }
  }

  return { letters: sortLetters(letters), blanks, truncated, ignored };
}

function letterCounts(letters) {
  const counts = new Int16Array(26);
  for (let index = 0; index < letters.length; index += 1) {
    counts[letters.charCodeAt(index) - 97] += 1;
  }
  return counts;
}

/**
 * Can `key` be spelled from `base`, spending at most `blanks` wildcards?
 *
 * Returns the letters a blank had to stand in for — the empty string when the
 * rack covered the word outright, `null` when it cannot be spelled at all.
 * Those letters are what makes the printed score honest: a blank tile is worth
 * nothing, so the J it covers must not be counted as eight.
 *
 * `scratch` is reused across the whole scan — allocating a 26-slot array for
 * each of 72,807 candidate keys is most of the cost of the naive version.
 */
function fits(key, base, scratch, blanks) {
  scratch.set(base);
  let covered = "";
  for (let index = 0; index < key.length; index += 1) {
    const slot = key.charCodeAt(index) - 97;
    if (scratch[slot] > 0) {
      scratch[slot] -= 1;
    } else {
      covered += key[index];
      if (covered.length > blanks) return null;
    }
  }
  return covered;
}

const blankPenalty = (covered) => {
  let total = 0;
  for (const letter of covered) total += TILE_VALUES[letter] || 0;
  return total;
};

/**
 * Words that can be made from a set of letters.
 *
 * `subset: false` is the anagram rule — every tile must be used, so every
 * answer is exactly as long as the rack. `subset: true` is the unscrambler
 * rule — any word that can be spelled from some or all of the tiles.
 *
 * `order: "length"` puts the longest answers first, then the commonest, then
 * alphabetical; `order: "score"` puts the highest-scoring first. The cap is
 * applied after the ordering, so a reader who asks for words from eight
 * letters keeps the eight-letter answers and loses the tail of the two-letter
 * list, which is the right thing to lose.
 */
export async function solveLetters(raw, { subset = false, limit = 400, order = "length" } = {}) {
  const rack = parseRack(raw);
  const tiles = rack.letters.length + rack.blanks;

  const empty = {
    letters: rack.letters,
    blanks: rack.blanks,
    tiles,
    truncated: rack.truncated,
    ignored: rack.ignored,
    order,
    total: 0,
    shown: 0,
    capped: false,
    groups: [],
  };

  if (tiles < MIN_WORD_LENGTH) return empty;

  const bank = await getWordBank();
  const base = letterCounts(rack.letters);
  const scratch = new Int16Array(26);
  const hits = [];

  if (!subset && rack.blanks === 0) {
    // The fast path, and the reason the index is keyed on sorted letters at
    // all: an exact anagram lookup is one Map hit, not a scan.
    const bucket = bank.byKey.get(rack.letters);
    if (bucket) for (const index of bucket) hits.push({ index, penalty: 0, blanks: "" });
  } else {
    for (const [key, bucket] of bank.byKey) {
      if (key.length < MIN_WORD_LENGTH) continue;
      if (subset ? key.length > tiles : key.length !== tiles) continue;
      const covered = fits(key, base, scratch, rack.blanks);
      if (covered === null) continue;
      const penalty = covered ? blankPenalty(covered) : 0;
      for (const index of bucket) hits.push({ index, penalty, blanks: covered });
    }
  }

  const rows = hits.map((hit) => {
    const slug = bank.words[hit.index];
    return {
      s: slug,
      w: bank.display.get(slug) || slug,
      c: bank.common[hit.index],
      l: slug.length,
      sc: Math.max(0, scoreWord(slug) - hit.penalty),
      b: hit.blanks || undefined,
    };
  });

  const alphabetical = (a, b) => (a.s < b.s ? -1 : a.s > b.s ? 1 : 0);
  rows.sort(
    order === "score"
      ? (a, b) => b.sc - a.sc || b.l - a.l || b.c - a.c || alphabetical(a, b)
      : (a, b) => b.l - a.l || b.c - a.c || alphabetical(a, b),
  );

  const total = rows.length;
  const capped = total > limit;
  const visible = capped ? rows.slice(0, limit) : rows;

  // Grouped on the same field the list is ordered by, so the headings always
  // run in order and never repeat.
  const groups = [];
  for (const row of visible) {
    const key = order === "score" ? row.sc : row.l;
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = {
        key,
        label:
          order === "score"
            ? `${key} ${key === 1 ? "point" : "points"}`
            : `${key}-letter ${key === 1 ? "word" : "words"}`,
        words: [],
      };
      groups.push(group);
    }
    group.words.push(row);
  }

  return { ...empty, total, shown: visible.length, capped, groups };
}

/* ------------------------------------------------------------------ *
 * Patterns
 * ------------------------------------------------------------------ */

/**
 * Compile a crossword pattern to a regular expression.
 *
 * `?` one letter · `*` any run including none · `@` a vowel · `#` a consonant.
 * Anything else in the input is dropped rather than escaped, so the compiled
 * source can only ever contain a–z and the four fixed character classes —
 * there is no path from reader input to a regex metacharacter.
 *
 * Runs of `*` collapse to one. `a**b` and `a*b` describe the same set, and the
 * uncollapsed form is the shape that makes a backtracking engine crawl.
 */
export function compilePattern(raw) {
  const cleaned = String(raw || "")
    .toLowerCase()
    .replace(/[^a-z?*@#]/g, "")
    .replace(/\*{2,}/g, "*")
    .slice(0, MAX_PATTERN_LENGTH);

  if (!cleaned) return null;

  let source = "^";
  let fixed = 0;
  let hasWildRun = false;
  let anchor = null;

  for (let index = 0; index < cleaned.length; index += 1) {
    const token = cleaned[index];
    if (token === "*") {
      source += "[a-z]*";
      hasWildRun = true;
      continue;
    }
    fixed += 1;
    if (token === "?") source += "[a-z]";
    else if (token === "@") source += `[${PATTERN_VOWELS}]`;
    else if (token === "#") source += `[${PATTERN_CONSONANTS}]`;
    else {
      source += token;
      if (index === 0) anchor = token;
    }
  }
  source += "$";

  return {
    pattern: cleaned,
    regex: new RegExp(source, "u"),
    source,
    anchor,
    literals: cleaned.replace(/[^a-z]/g, "").length,
    minLength: fixed,
    maxLength: hasWildRun ? MAX_WORD_LENGTH : fixed,
  };
}

/**
 * Every entry matching a crossword pattern.
 *
 * Ordered by commonness first, then by length, then alphabetically: a pattern
 * search is a "what fits here" question and the answer a solver wants is
 * almost never the rarest word that fits. When the result is capped, the count
 * of everything that matched is still reported, because "300 results" and
 * "300 of 4,112 results" are different facts.
 */
export async function searchPattern(raw, { limit = 300 } = {}) {
  const compiled = compilePattern(raw);
  const blank = {
    pattern: compiled?.pattern || "",
    scanned: 0,
    total: 0,
    shown: 0,
    capped: false,
    limit,
    words: [],
    minLength: compiled?.minLength || 0,
    maxLength: compiled?.maxLength || 0,
  };
  if (!compiled) return blank;

  const bank = await getWordBank();
  const { regex, anchor, minLength, maxLength } = compiled;

  let start = 0;
  let end = bank.words.length;
  // A pattern beginning with a literal letter can only match inside that
  // letter's block, which is between 4x and 250x less work than a full scan.
  if (anchor) {
    const range = bank.ranges[anchor];
    if (!range) return blank;
    [start, end] = range;
  }

  const rows = [];
  for (let index = start; index < end; index += 1) {
    const slug = bank.words[index];
    if (slug.length < minLength || slug.length > maxLength) continue;
    if (!regex.test(slug)) continue;
    rows.push({
      s: slug,
      w: bank.display.get(slug) || slug,
      c: bank.common[index],
      l: slug.length,
    });
  }

  rows.sort((a, b) => b.c - a.c || a.l - b.l || (a.s < b.s ? -1 : a.s > b.s ? 1 : 0));

  const total = rows.length;
  const capped = total > limit;

  return {
    ...blank,
    scanned: end - start,
    total,
    shown: capped ? limit : total,
    capped,
    words: capped ? rows.slice(0, limit) : rows,
  };
}
