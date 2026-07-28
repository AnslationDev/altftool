/**
 * English syllable estimation.
 *
 * Method: count vowel groups (a, e, i, o, u and non-initial y), then apply the
 * corrections used by classic readability counters (the Flesch-Kincaid family):
 * silent final "e", syllabic "-le", silent "-ed"/"-es" inflections, and a short
 * list of vowel pairs that are pronounced as two beats (hiatus, as in pi-a-no).
 * A lookup table covers frequent words the rules get wrong.
 *
 * The result is an estimate, not a dictionary lookup: English spelling is not
 * a reliable guide to pronunciation, so unusual words should be checked by ear.
 */

/** Words whose spelling defeats the rules below. Counts follow standard
 *  dictionary syllabification (Merriam-Webster / Oxford). */
export const SYLLABLE_EXCEPTIONS = {
  a: 1,
  i: 1,
  o: 1,
  the: 1,
  are: 1,
  were: 1,
  our: 1,
  hour: 1,
  hours: 2,
  fire: 1,
  fires: 1,
  hire: 1,
  tire: 1,
  wire: 1,
  pure: 1,
  sure: 1,
  people: 2,
  peoples: 2,
  quiet: 2,
  quietly: 3,
  quiets: 2,
  science: 2,
  sciences: 3,
  evening: 2,
  evenings: 2,
  every: 2,
  everyone: 3,
  everything: 3,
  everywhere: 3,
  business: 2,
  chocolate: 3,
  comfortable: 4,
  vegetable: 4,
  temperature: 4,
  interesting: 4,
  restaurant: 3,
  favourite: 3,
  favorite: 3,
  camera: 3,
  family: 3,
  memory: 3,
  memories: 3,
  create: 2,
  creates: 2,
  created: 3,
  creating: 3,
  idea: 3,
  ideas: 3,
  area: 3,
  areas: 3,
  real: 2,
  really: 3,
  leopard: 2,
  theatre: 2,
  theater: 2,
  wednesday: 2,
  choir: 1,
  poem: 2,
  poems: 2,
  poet: 2,
  poetry: 3,
  does: 1,
  goes: 1,
  shoes: 1,
  toes: 1,
  aisle: 1,
  once: 1,
  twice: 1,
  eye: 1,
  eyes: 1,
  ounce: 1,
  rhythm: 2,
  prism: 2,
  ocean: 2,
  oceans: 2,
  being: 2,
  seeing: 2,
  freeing: 2,
  agreeing: 3,
  cruel: 2,
  fuel: 2,
  duel: 2,
  towel: 2,
  jewel: 2,
  ruin: 2,
  giant: 2,
  giants: 2,
  diet: 2,
  riot: 2,
  poured: 1,
  breathe: 1,
  clothes: 1,
  through: 1,
  though: 1,
  thought: 1,
  laughed: 1,
};

/** Vowel pairs that are normally spoken as two syllables. Values are the
 *  extra beats a pair adds on top of the single vowel group it forms. */
export const HIATUS_PAIRS = ["ia", "io", "eo", "ua", "uo", "yi"];

/** "-es" is a separate beat only after a sibilant (roses, faces, pages). */
const SIBILANT_ES = /(?:s|x|z|ch|sh|g|c)es$/;

/** Consonants that swallow a following "io"/"ia" into one beat:
 *  na-tion, spe-cial, mis-sion, an-xious, re-gion, mil-lion. */
const HIATUS_BLOCKERS = /[tcsxg]$/;

function normalizeWord(raw) {
  return String(raw)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z]/g, "");
}

function hiatusExtra(group, word, start) {
  let extra = 0;
  for (let i = 0; i < group.length - 1; i += 1) {
    const pair = group.slice(i, i + 2);
    if (!HIATUS_PAIRS.includes(pair)) continue;
    const before = word.slice(0, start + i);
    if ((pair === "ia" || pair === "io") && HIATUS_BLOCKERS.test(before)) continue;
    if ((pair === "ia" || pair === "io") && before.endsWith("ll")) continue;
    if ((pair === "ua" || pair === "uo") && /[gq]$/.test(before)) continue;
    if (pair === "eo" && /[p]$/.test(before)) continue;
    extra += 1;
  }
  return extra;
}

/**
 * Estimated syllables in a single word. Returns 0 for tokens with no letters
 * (bare numbers, stray punctuation) so they never inflate a line count.
 */
export function countSyllablesInWord(raw) {
  const word = normalizeWord(raw);
  if (!word) return 0;
  if (Object.prototype.hasOwnProperty.call(SYLLABLE_EXCEPTIONS, word)) {
    return SYLLABLE_EXCEPTIONS[word];
  }

  // "u" after "q" is part of the consonant (queen, quick), not a vowel.
  let s = word.replace(/qu/g, "q");
  // A word-initial "y" is a consonant (yellow, yes).
  s = s.replace(/^y/, "");
  if (!s) return 1;

  const groups = s.match(/[aeiouy]+/g) || [];
  let count = groups.length;

  let cursor = 0;
  for (const group of groups) {
    const at = s.indexOf(group, cursor);
    cursor = at + group.length;
    count += hiatusExtra(group, s, at);
  }

  if (/[^aeiouy]les?$/.test(s)) {
    // Syllabic "-le" keeps its own beat: ta-ble, can-dles.
  } else if (/[^aeiouy]e$/.test(s)) {
    count -= 1; // silent final e: make, gone, whale
  } else if (/[^aeiouy]es$/.test(s) && !SIBILANT_ES.test(s)) {
    count -= 1; // makes, hopes
  } else if (/[^aeiouy]ed$/.test(s) && !/[td]ed$/.test(s)) {
    count -= 1; // walked, loved (but not wan-ted, nee-ded)
  }

  return Math.max(1, count);
}
