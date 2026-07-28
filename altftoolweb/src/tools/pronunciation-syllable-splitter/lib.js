/**
 * English syllable splitting and word-stress marking.
 *
 * Syllabification follows the phonics rules taught for reading instruction:
 *   1. Every syllable has one vowel nucleus. Consecutive vowel letters form one
 *      nucleus unless they are a known hiatus pair (ia, io, iu, eo, ua, uo, ao),
 *      which splits into two.
 *   2. A silent final e is attached to the syllable before it.
 *   3. V-CV splits before the consonant (o-pen), VC-CV splits between the two
 *      consonants (bas-ket) unless they form a digraph or an onset blend that
 *      English never breaks (th, ch, sh, ph, wh, gh, ck, ng, qu, bl, br, ...).
 *   4. A final consonant + le is its own syllable (ta-ble, puz-zle).
 *
 * Stress uses the suffix rules taught in every English pronunciation course.
 * A word whose ending matches a stress-fixing suffix gets a confident answer;
 * anything else falls back to the statistical default (antepenultimate for
 * three or more syllables, part-of-speech dependent for two) and is labelled an
 * estimate, because English stress is lexical and cannot be derived from
 * spelling alone. Check a dictionary for words marked as estimates.
 */

export const PARTS_OF_SPEECH = ["unknown", "noun", "verb", "adjective"];
export const MAX_WORD_LENGTH = 40;
export const MAX_WORDS = 60;

const SIMPLE_VOWELS = "aeiou";

/** Digraphs that can open a syllable, so the whole pair moves to the next one. */
export const ONSET_DIGRAPHS = ["ch", "ph", "sh", "th", "wh", "qu"];

/** Digraphs that can only close a syllable, so the whole pair stays behind. */
export const CODA_DIGRAPHS = ["ck", "ng", "gh", "dg"];

/** Clusters English allows at the start of a syllable, so they are not split. */
export const ONSET_BLENDS = [
  "bl", "br", "cl", "cr", "dr", "dw", "fl", "fr", "gl", "gr", "pl", "pr",
  "sc", "sk", "sl", "sm", "sn", "sp", "st", "sw", "tr", "tw", "thr", "str",
  "spr", "scr", "shr", "spl", "squ", "sph",
];

/** Vowel pairs that are pronounced as two syllables. */
export const HIATUS_PAIRS = ["ia", "io", "iu", "eo", "ua", "uo", "ao", "oe"];

/**
 * Endings where -io-/-ia- is one syllable and must not be split, including the
 * forms that carry a further suffix (national, professionals, cautiously).
 */
const PROTECTED_ENDINGS =
  /(?:tion|sion|cion|xion|cial|tial|cious|tious|gious|geous|cian|tian|sian|gion)(?:al|als|ally|ly|s|es|ist|ists|ism|isms)?$/;

/** A bare -ion ending is only protected on longer words, so lion stays li-on. */
const BARE_ION_ENDING = /ion(?:al|als|ally|s|es|ist|ists|ism|isms)?$/;
const BARE_ION_MIN_LENGTH = 5;

/** Suffixes that take the stress themselves. */
export const FINAL_STRESS_SUFFIXES = ["esque", "ette", "eer", "ese", "aire", "oon", "ique", "ee"];

/** Suffixes that put the stress on the syllable immediately before them. */
export const PENULT_SUFFIXES = ["tion", "sion", "cian", "tian", "sian", "ion", "ious", "eous", "ial", "ic"];

/** Suffixes that pull the stress onto the third syllable from the end. */
export const ANTEPENULT_SUFFIXES = [
  "ical", "ional", "inal", "itive", "ular", "uous", "ity", "ety", "ify", "ate",
  "logy", "graphy", "metry", "cracy", "nomy", "pathy", "tomy", "meter", "itude",
];

function isVowelAt(word, index) {
  const ch = word[index];
  // The u in qu is part of the consonant sound, not a nucleus (queen, unique).
  if (ch === "u" && index > 0 && word[index - 1] === "q") return false;
  if (SIMPLE_VOWELS.includes(ch)) return true;
  return ch === "y" && index > 0;
}

/** Vowel nuclei as [start, end] index pairs, with hiatus pairs split. */
function nuclei(word) {
  let protectedEnding = PROTECTED_ENDINGS.exec(word);
  if (!protectedEnding && word.length >= BARE_ION_MIN_LENGTH) {
    protectedEnding = BARE_ION_ENDING.exec(word);
  }
  const protectedFrom = protectedEnding ? protectedEnding.index : word.length;

  const runs = [];
  let start = -1;
  for (let index = 0; index < word.length; index += 1) {
    if (isVowelAt(word, index)) {
      if (start === -1) start = index;
    } else if (start !== -1) {
      runs.push([start, index - 1]);
      start = -1;
    }
  }
  if (start !== -1) runs.push([start, word.length - 1]);

  const split = [];
  for (const [from, to] of runs) {
    let cursor = from;
    for (let index = from; index < to; index += 1) {
      const pair = word.slice(index, index + 2);
      if (index >= protectedFrom) continue;
      if (HIATUS_PAIRS.includes(pair)) {
        split.push([cursor, index]);
        cursor = index + 1;
      }
    }
    split.push([cursor, to]);
  }
  return split;
}

function isOnsetCluster(cluster) {
  return ONSET_DIGRAPHS.includes(cluster) || ONSET_BLENDS.includes(cluster);
}

/**
 * Split one lowercase alphabetic word into syllables.
 * @returns {string[]} at least one piece; the whole word if it has no vowels.
 */
export function syllabify(word) {
  if (!word) return [];
  if (word.length <= 2) return [word];

  let groups = nuclei(word);
  if (groups.length === 0) return [word];

  // Silent final e: "e" at the end, preceded by a consonant, with another
  // nucleus already present.
  const last = groups[groups.length - 1];
  const endsInSilentE =
    groups.length > 1 &&
    last[0] === last[1] &&
    last[0] === word.length - 1 &&
    word[word.length - 1] === "e" &&
    !isVowelAt(word, word.length - 2);
  if (endsInSilentE) groups = groups.slice(0, -1);
  if (groups.length === 0) return [word];

  const cuts = new Set();
  for (let index = 0; index < groups.length - 1; index += 1) {
    const endOfA = groups[index][1];
    const startOfB = groups[index + 1][0];
    const gap = startOfB - endOfA - 1;
    const cluster = word.slice(endOfA + 1, startOfB);

    if (gap === 0) cuts.add(startOfB);
    else if (gap === 1) cuts.add(startOfB - 1);
    else if (gap === 2) {
      if (isOnsetCluster(cluster)) cuts.add(endOfA + 1);
      else if (CODA_DIGRAPHS.includes(cluster)) cuts.add(startOfB);
      else cuts.add(endOfA + 2);
    } else if (gap === 3) cuts.add(isOnsetCluster(cluster.slice(1)) ? endOfA + 2 : endOfA + 3);
    else cuts.add(endOfA + 2);
  }

  // Consonant + le at the end is always its own syllable.
  if (
    word.length >= 4 &&
    word.endsWith("le") &&
    !isVowelAt(word, word.length - 3) &&
    word[word.length - 3] !== "l"
  ) {
    cuts.add(word.length - 3);
  }

  // The adverb ending -ly is its own syllable after a consonant (cau-tious-ly).
  if (word.length >= 5 && word.endsWith("ly") && !isVowelAt(word, word.length - 3)) {
    cuts.add(word.length - 2);
  }

  const boundaries = [...cuts].filter((value) => value > 0 && value < word.length).sort((a, b) => a - b);
  const pieces = [];
  let cursor = 0;
  for (const boundary of boundaries) {
    pieces.push(word.slice(cursor, boundary));
    cursor = boundary;
  }
  pieces.push(word.slice(cursor));

  // Safety net: a piece with no vowel letter is not a syllable, so fold it
  // into its neighbour.
  const merged = [];
  for (const piece of pieces.filter(Boolean)) {
    const hasVowel = [...piece].some((_, index) => "aeiouy".includes(piece[index]));
    if (!hasVowel && merged.length > 0) merged[merged.length - 1] += piece;
    else merged.push(piece);
  }
  while (merged.length > 1 && ![...merged[0]].some((ch) => "aeiouy".includes(ch))) {
    merged[1] = merged[0] + merged[1];
    merged.shift();
  }
  return merged;
}

/* ------------------------------------------------------------------ */
/* Stress                                                              */
/* ------------------------------------------------------------------ */

function stressFromSuffix(word, count) {
  for (const suffix of FINAL_STRESS_SUFFIXES) {
    if (word.endsWith(suffix) && word.length > suffix.length + 1) {
      return { index: count - 1, rule: `-${suffix} carries the stress itself`, confidence: "rule" };
    }
  }
  for (const suffix of ANTEPENULT_SUFFIXES) {
    if (word.endsWith(suffix) && count >= 3 && word.length > suffix.length + 2) {
      return {
        index: count - 3,
        rule: `-${suffix} pulls the stress onto the third syllable from the end`,
        confidence: "rule",
      };
    }
  }
  for (const suffix of PENULT_SUFFIXES) {
    if (word.endsWith(suffix) && count >= 2 && word.length > suffix.length + 1) {
      return {
        index: count - 2,
        rule: `-${suffix} puts the stress on the syllable before it`,
        confidence: "rule",
      };
    }
  }
  return null;
}

function defaultStress(count, partOfSpeech) {
  if (count <= 1) return { index: 0, rule: "A one-syllable word carries its own stress", confidence: "rule" };
  if (count === 2) {
    if (partOfSpeech === "verb") {
      return {
        index: 1,
        rule: "Two-syllable verbs usually stress the second syllable (to re-CORD)",
        confidence: "estimate",
      };
    }
    return {
      index: 0,
      rule: "Two-syllable nouns and adjectives usually stress the first syllable (a REC-ord)",
      confidence: "estimate",
    };
  }
  return {
    index: count - 3,
    rule: "With no stress-fixing suffix, English most often stresses the third syllable from the end",
    confidence: "estimate",
  };
}

/**
 * Split a word and mark its stressed syllable.
 * @param {string} raw
 * @param {"unknown"|"noun"|"verb"|"adjective"} [partOfSpeech]
 * @returns {object|{error:string}}
 */
export function analyseWord(raw, partOfSpeech = "unknown") {
  if (typeof raw !== "string") return { error: "Enter a word to split." };
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Enter a word to split." };
  if (trimmed.length > MAX_WORD_LENGTH) {
    return { error: `"${trimmed.slice(0, 20)}…" is longer than ${MAX_WORD_LENGTH} letters.` };
  }
  if (!/^[A-Za-z][A-Za-z'-]*$/.test(trimmed)) {
    return { error: `"${trimmed}" is not a plain English word — letters, hyphens and apostrophes only.` };
  }

  const letters = trimmed.toLowerCase().replace(/[^a-z]/g, "");
  if (!letters) return { error: "Enter a word with at least one letter." };

  const syllables = syllabify(letters);
  const count = syllables.length;
  const stress = stressFromSuffix(letters, count) || defaultStress(count, partOfSpeech);
  const index = Math.min(Math.max(stress.index, 0), count - 1);

  const hyphenated = syllables.join("-");
  const marked = syllables.map((piece, position) => (position === index ? piece.toUpperCase() : piece)).join("-");
  const ipaStyle = syllables
    .map((piece, position) => (position === index ? `ˈ${piece}` : piece))
    .join("·");

  return {
    word: trimmed,
    syllables,
    count,
    stressIndex: index,
    stressedSyllable: syllables[index],
    hyphenated,
    marked,
    ipaStyle,
    rule: stress.rule,
    confidence: stress.confidence,
  };
}

/**
 * Split every word in a line or paragraph.
 * @returns {{items:object[],totalSyllables:number,wordCount:number}|{error:string}}
 */
export function analyseList(text, partOfSpeech = "unknown") {
  if (typeof text !== "string") return { error: "Enter one or more words." };
  const words = text.split(/[^A-Za-z'-]+/).filter(Boolean);
  if (words.length === 0) return { error: "Enter one or more English words, separated by spaces or commas." };
  if (words.length > MAX_WORDS) {
    return { error: `Split up to ${MAX_WORDS} words at a time — you entered ${words.length}.` };
  }

  const items = words.map((word) => {
    const result = analyseWord(word, partOfSpeech);
    return result.error ? { word, error: result.error } : result;
  });

  const good = items.filter((item) => !item.error);
  return {
    items,
    wordCount: items.length,
    totalSyllables: good.reduce((sum, item) => sum + item.count, 0),
    averageSyllables: good.length ? Math.round((good.reduce((sum, item) => sum + item.count, 0) / good.length) * 10) / 10 : 0,
  };
}
