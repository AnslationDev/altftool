/**
 * Business name checker: numerology figures plus the practical naming limits
 * that actually decide whether a name works online.
 *
 * Two independent things are computed and reported separately:
 *
 *  1. Numerology (cultural tradition, not evidence).
 *     - Chaldean: letters valued 1-8, 9 never assigned; the unreduced compound
 *       total carries a classical reading (Cheiro's 10-52 table); the root is
 *       reduced all the way to a single digit.
 *     - Pythagorean: letters valued by alphabet position cycled 1-9; the master
 *       numbers 11, 22 and 33 are not reduced.
 *
 *  2. Practical limits (hard, published facts).
 *     - A DNS label may be at most 63 octets — RFC 1035 §2.3.4 — and under the
 *       LDH rule it may contain only letters, digits and hyphens, and may not
 *       start or end with a hyphen (RFC 1123 §2.1).
 *     - An X (Twitter) username is at most 15 characters.
 *     - An Instagram username is at most 30 characters.
 */

/** Chaldean letter values. 9 is never assigned to a letter. */
export const CHALDEAN_VALUES = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

/** Pythagorean letter values: alphabet position cycled 1-9. */
export const PYTHAGOREAN_VALUES = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

/** Master numbers left unreduced in the Pythagorean system. */
export const MASTER_NUMBERS = [11, 22, 33];

/** Cheiro's compound-number readings, 10 to 52 — condensed to a business line. */
export const COMPOUND_READINGS = {
  10: "Rise and fall — plans carry through, for better or worse.",
  11: "Hidden trials; warns against relying on others' promises.",
  12: "Being used by other people's plans; watch contracts.",
  13: "Upheaval and change; power that has to be steered.",
  14: "Movement and combinations; risk from speculation.",
  15: "Persuasion and magnetism; strong for public-facing brands.",
  16: "Warns of accident and collapse of plans.",
  17: "A name that outlasts difficulties.",
  18: "Conflict between material and other aims; disputes.",
  19: "Success, honour and recognition.",
  20: "A call to a new purpose or direction.",
  21: "Advancement and honour after a period of struggle.",
  22: "Illusion; good judgement blinded by the folly of others.",
  23: "Help from those in authority; plans succeed.",
  24: "Association with rank; gain through partnership.",
  25: "Strength gained through experience rather than luck.",
  26: "Warns of ruin through bad partnerships and advice.",
  27: "Authority and command; a productive intellect.",
  28: "Loss through misplaced trust; opposition later on.",
  29: "Uncertainty and deception from others.",
  30: "Thoughtful and detached; neither fortunate nor unfortunate.",
  31: "Self-contained and isolated, like 30 but more so.",
  32: "Magnetic combination of people, if own judgement is held to.",
  33: "Same reading as 24.",
  34: "Same reading as 25.",
  35: "Same reading as 26.",
  36: "Same reading as 27.",
  37: "Fortunate partnerships and alliances.",
  38: "Same reading as 29.",
  39: "Same reading as 30.",
  40: "Same reading as 31.",
  41: "Same reading as 32.",
  42: "Same reading as 24.",
  43: "Upheaval and strife; failed plans.",
  44: "Same reading as 26.",
  45: "Same reading as 27.",
  46: "Same reading as 37.",
  47: "Same reading as 29.",
  48: "Same reading as 30.",
  49: "Same reading as 31.",
  50: "Same reading as 32.",
  51: "Sudden advancement, but it makes enemies.",
  52: "Same reading as 43.",
};

/** Highest compound number the classical table covers. */
export const MAX_COMPOUND_IN_TABLE = 52;

/** Maximum length of a single DNS label, in octets — RFC 1035 §2.3.4. */
export const DNS_LABEL_MAX_LENGTH = 63;

/** Maximum length of an X (Twitter) username. */
export const X_HANDLE_MAX_LENGTH = 15;

/** Maximum length of an Instagram username. */
export const INSTAGRAM_HANDLE_MAX_LENGTH = 30;

/** Vowels used by the syllable estimate; Y is included as a vowel here. */
const SYLLABLE_VOWELS = "AEIOUY";

function digitSum(n) {
  let total = 0;
  let rest = Math.abs(Math.trunc(n));
  while (rest > 0) {
    total += rest % 10;
    rest = Math.floor(rest / 10);
  }
  return total;
}

/** Reduce all the way to 1-9 (Chaldean convention). */
export function reduceFully(total) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  let current = Math.trunc(total);
  while (current > 9) current = digitSum(current);
  return current;
}

/** Reduce but stop on 11, 22 or 33 (Pythagorean convention). */
export function reduceKeepingMasters(total) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  let current = Math.trunc(total);
  while (current > 9 && !MASTER_NUMBERS.includes(current)) current = digitSum(current);
  return current;
}

/**
 * Turn a business name into the domain label it would most naturally become:
 * lower case, anything that is not a letter or digit becomes a hyphen, runs of
 * hyphens collapse, and leading/trailing hyphens are stripped (LDH rule).
 */
export function toDomainSlug(name) {
  return String(name ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Estimate syllables in one word: count runs of vowel letters, then drop one
 * for a silent trailing "e". A heuristic, accurate for most short brand names,
 * and never below 1 for a word that contains a letter.
 */
export function estimateSyllables(word) {
  const upper = String(word ?? "").toUpperCase().replace(/[^A-Z]/g, "");
  if (upper.length === 0) return 0;
  let groups = 0;
  let inVowel = false;
  for (const character of upper) {
    const isVowel = SYLLABLE_VOWELS.includes(character);
    if (isVowel && !inVowel) groups += 1;
    inVowel = isVowel;
  }
  if (upper.length > 2 && upper.endsWith("E") && !upper.endsWith("LE") && groups > 1) {
    groups -= 1;
  }
  return Math.max(1, groups);
}

/**
 * Full check on one candidate business name.
 * @param {string} name
 */
export function analyseBusinessName(name) {
  const raw = String(name ?? "").trim();
  const words = raw.toUpperCase().split(/[^A-Z]+/).filter(Boolean);
  const letters = words.join("").split("");

  if (letters.length === 0) {
    return { error: "Enter a name containing the letters A to Z." };
  }

  const chaldeanTotal = letters.reduce((sum, c) => sum + (CHALDEAN_VALUES[c] ?? 0), 0);
  const pythagoreanTotal = letters.reduce((sum, c) => sum + (PYTHAGOREAN_VALUES[c] ?? 0), 0);
  const chaldeanRoot = reduceFully(chaldeanTotal);
  const pythagoreanRoot = reduceKeepingMasters(pythagoreanTotal);

  const slug = toDomainSlug(raw);
  const slugLength = slug.length;
  const handle = slug.replace(/-/g, "");

  const syllables = words.reduce((sum, word) => sum + estimateSyllables(word), 0);
  const hasNonAscii = /[^\x20-\x7E]/.test(raw);
  const hasDigits = /[0-9]/.test(raw);
  const needsHyphen = slug.includes("-");

  const checks = [
    {
      key: "dns",
      label: `Domain label fits ${DNS_LABEL_MAX_LENGTH} characters`,
      pass: slugLength > 0 && slugLength <= DNS_LABEL_MAX_LENGTH,
      detail: `"${slug}" is ${slugLength} characters; the RFC 1035 limit for one label is ${DNS_LABEL_MAX_LENGTH}.`,
    },
    {
      key: "x",
      label: `Fits an X username (${X_HANDLE_MAX_LENGTH} characters)`,
      pass: handle.length > 0 && handle.length <= X_HANDLE_MAX_LENGTH,
      detail: `"${handle}" is ${handle.length} characters against a ${X_HANDLE_MAX_LENGTH}-character limit.`,
    },
    {
      key: "instagram",
      label: `Fits an Instagram username (${INSTAGRAM_HANDLE_MAX_LENGTH} characters)`,
      pass: handle.length > 0 && handle.length <= INSTAGRAM_HANDLE_MAX_LENGTH,
      detail: `"${handle}" is ${handle.length} characters against a ${INSTAGRAM_HANDLE_MAX_LENGTH}-character limit.`,
    },
    {
      key: "ascii",
      label: "Plain ASCII, no accents or scripts to transliterate",
      pass: !hasNonAscii,
      detail: hasNonAscii
        ? "Contains characters outside basic ASCII, which registrars handle as punycode."
        : "Every character is plain ASCII.",
    },
    {
      key: "hyphen",
      label: "No hyphen needed in the domain",
      pass: !needsHyphen,
      detail: needsHyphen
        ? "Spaces became hyphens; hyphenated domains are harder to say aloud."
        : "The name becomes a single unbroken label.",
    },
    {
      key: "digits",
      label: "No digits to confuse when spoken",
      pass: !hasDigits,
      detail: hasDigits
        ? "Digits force you to spell the name out on the phone (4 or four?)."
        : "No digits in the name.",
    },
  ];

  return {
    name: raw,
    letters: letters.map((character) => ({
      letter: character,
      chaldean: CHALDEAN_VALUES[character] ?? 0,
      pythagorean: PYTHAGOREAN_VALUES[character] ?? 0,
    })),
    letterCount: letters.length,
    wordCount: words.length,
    syllables,
    slug,
    slugLength,
    handle,
    chaldeanTotal,
    chaldeanRoot,
    pythagoreanTotal,
    pythagoreanRoot,
    pythagoreanIsMaster: MASTER_NUMBERS.includes(pythagoreanRoot),
    compoundReading:
      chaldeanTotal <= MAX_COMPOUND_IN_TABLE ? COMPOUND_READINGS[chaldeanTotal] ?? null : null,
    compoundInTable:
      chaldeanTotal <= MAX_COMPOUND_IN_TABLE && Boolean(COMPOUND_READINGS[chaldeanTotal]),
    checks,
    checksPassed: checks.filter((check) => check.pass).length,
    checksTotal: checks.length,
  };
}

/**
 * Run the check over a shortlist. Blank lines are ignored; entries with no
 * letters are counted as skipped rather than failing the whole call.
 */
export function compareBusinessNames(list) {
  const entries = (Array.isArray(list) ? list : [])
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  if (entries.length === 0) {
    return { error: "Add at least one candidate name, one per line." };
  }

  const rows = [];
  let skipped = 0;
  for (const entry of entries) {
    const result = analyseBusinessName(entry);
    if (result.error) skipped += 1;
    else rows.push(result);
  }

  if (rows.length === 0) {
    return { error: "None of those lines contain the letters A to Z." };
  }

  return { rows, skipped, count: rows.length };
}
