/**
 * Lucky Name Alphabet Analyzer.
 *
 * IMPORTANT: there is no traditional or scientific "lucky score" for a name.
 * What this module computes is a fully transparent novelty index defined right
 * here: five measurable properties of the spelling, each worth 20 points, added
 * to a 0-100 total. Every weight, target and threshold is a named constant so
 * the number can be reproduced by hand. It is entertainment, not prediction.
 *
 * The only external data used is the standard English letter-frequency table
 * (Robert Lewand, "Cryptological Mathematics", percentages of letters in
 * ordinary English text), which is real published data.
 */

/** Relative frequency of each letter in English text, in percent. */
export const ENGLISH_LETTER_FREQUENCY = {
  E: 12.702, T: 9.056, A: 8.167, O: 7.507, I: 6.966, N: 6.749,
  S: 6.327, H: 6.094, R: 5.987, D: 4.253, L: 4.025, C: 2.782,
  U: 2.758, M: 2.406, W: 2.36, F: 2.228, G: 2.015, Y: 1.974,
  P: 1.929, B: 1.492, V: 0.978, K: 0.772, J: 0.153, X: 0.15,
  Q: 0.095, Z: 0.074,
};

/** 100% spread over 26 letters — the frequency of a perfectly average letter. */
export const AVERAGE_LETTER_FREQUENCY = 100 / 26;

/** Chaldean letter values (1-8; 9 is never assigned to a letter). */
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

/** Letters counted as vowels for the balance measure. Y is not included. */
export const VOWELS = "AEIOU";

/** Each of the five components is worth this many points. */
export const POINTS_PER_COMPONENT = 20;

/** Number of scored components. 5 x 20 = a 0-100 scale. */
export const COMPONENT_COUNT = 5;

/** Maximum possible score. */
export const MAX_SCORE = POINTS_PER_COMPONENT * COMPONENT_COUNT;

/** Vowel share this index treats as the balance point. */
export const TARGET_VOWEL_SHARE = 0.4;

/**
 * Consonant runs up to this length are unpenalised; each extra consonant
 * costs CONSONANT_RUN_PENALTY points.
 */
export const FREE_CONSONANT_RUN = 2;

/** Points lost per consonant beyond FREE_CONSONANT_RUN in the longest run. */
export const CONSONANT_RUN_PENALTY = 5;

/**
 * Full marks for the everyday-letters component are reached when the name's
 * mean letter frequency is at least this multiple of an average letter.
 */
export const FREQUENCY_FULL_MARK_MULTIPLE = 2;

/** Score bands, checked from the top down. */
export const SCORE_BANDS = [
  { min: 80, label: "Very smooth", note: "Balanced vowels, varied letters and everyday spellings." },
  { min: 60, label: "Smooth", note: "Reads and spells easily with only minor rough edges." },
  { min: 40, label: "Mixed", note: "Some components pull the total down — see the breakdown." },
  { min: 0, label: "Unusual", note: "Distinctive spelling: rare letters, heavy clusters or lopsided vowels." },
];

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

const round1 = (value) => Math.round(value * 10) / 10;

function digitSum(n) {
  let total = 0;
  let rest = Math.abs(Math.trunc(n));
  while (rest > 0) {
    total += rest % 10;
    rest = Math.floor(rest / 10);
  }
  return total;
}

/** Reduce a positive total to a single digit 1-9; 0 stays 0. */
export function reduceToDigit(total) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  let current = Math.trunc(total);
  while (current > 9) current = digitSum(current);
  return current;
}

/** Longest run of consecutive consonants inside any one word of the name. */
export function longestConsonantRun(words) {
  let longest = 0;
  for (const word of words) {
    let run = 0;
    for (const character of word) {
      if (VOWELS.includes(character)) {
        run = 0;
      } else {
        run += 1;
        if (run > longest) longest = run;
      }
    }
  }
  return longest;
}

/**
 * Analyse a name and return the five component scores plus the total.
 * @param {string} name
 */
export function analyseName(name) {
  const words = String(name ?? "")
    .toUpperCase()
    .split(/[^A-Z]+/)
    .filter(Boolean);

  const letters = words.join("").split("");
  if (letters.length === 0) {
    return { error: "Enter a name using the letters A to Z — digits and symbols are not scored." };
  }

  const total = letters.length;
  const vowelCount = letters.filter((character) => VOWELS.includes(character)).length;
  const vowelShare = vowelCount / total;
  const distinctCount = new Set(letters).size;
  const run = longestConsonantRun(words);

  const frequencySum = letters.reduce(
    (sum, character) => sum + (ENGLISH_LETTER_FREQUENCY[character] ?? 0),
    0,
  );
  const meanFrequency = frequencySum / total;

  const chaldeanTotal = letters.reduce((sum, c) => sum + (CHALDEAN_VALUES[c] ?? 0), 0);
  const pythagoreanTotal = letters.reduce((sum, c) => sum + (PYTHAGOREAN_VALUES[c] ?? 0), 0);
  const chaldeanRoot = reduceToDigit(chaldeanTotal);
  const pythagoreanRoot = reduceToDigit(pythagoreanTotal);

  // 1. Vowel balance: full marks at TARGET_VOWEL_SHARE, zero at 0% or 80%.
  const balancePoints =
    POINTS_PER_COMPONENT *
    clamp(1 - Math.abs(vowelShare - TARGET_VOWEL_SHARE) / TARGET_VOWEL_SHARE, 0, 1);

  // 2. Letter variety: share of the spelling made of distinct letters.
  const varietyPoints = POINTS_PER_COMPONENT * (distinctCount / total);

  // 3. Pronounceability: penalty for long consonant clusters.
  const clusterPoints = clamp(
    POINTS_PER_COMPONENT - CONSONANT_RUN_PENALTY * Math.max(0, run - FREE_CONSONANT_RUN),
    0,
    POINTS_PER_COMPONENT,
  );

  // 4. Everyday letters: mean English frequency against twice the average letter.
  const frequencyPoints =
    POINTS_PER_COMPONENT *
    clamp(meanFrequency / (AVERAGE_LETTER_FREQUENCY * FREQUENCY_FULL_MARK_MULTIPLE), 0, 1);

  // 5. Numerology agreement: how close the two systems' root numbers land.
  const rootGap = Math.abs(chaldeanRoot - pythagoreanRoot);
  const agreementPoints = POINTS_PER_COMPONENT * clamp(1 - rootGap / 8, 0, 1);

  const components = [
    {
      key: "balance",
      label: "Vowel balance",
      points: round1(balancePoints),
      detail: `${vowelCount} of ${total} letters are vowels (${Math.round(vowelShare * 100)}%); this index scores against a ${Math.round(TARGET_VOWEL_SHARE * 100)}% balance point.`,
    },
    {
      key: "variety",
      label: "Letter variety",
      points: round1(varietyPoints),
      detail: `${distinctCount} distinct letters out of ${total}.`,
    },
    {
      key: "clusters",
      label: "Pronounceability",
      points: round1(clusterPoints),
      detail:
        run > FREE_CONSONANT_RUN
          ? `Longest consonant run is ${run} letters, ${run - FREE_CONSONANT_RUN} beyond the free run of ${FREE_CONSONANT_RUN}.`
          : `Longest consonant run is ${run} letter${run === 1 ? "" : "s"} — no penalty.`,
    },
    {
      key: "frequency",
      label: "Everyday letters",
      points: round1(frequencyPoints),
      detail: `Mean English letter frequency ${round1(meanFrequency)}%, against ${round1(AVERAGE_LETTER_FREQUENCY * FREQUENCY_FULL_MARK_MULTIPLE)}% for full marks.`,
    },
    {
      key: "agreement",
      label: "Numerology agreement",
      points: round1(agreementPoints),
      detail: `Chaldean root ${chaldeanRoot} vs Pythagorean root ${pythagoreanRoot} — gap of ${rootGap}.`,
    },
  ];

  const rawTotal = components.reduce((sum, component) => sum + component.points, 0);
  const score = clamp(Math.round(rawTotal), 0, MAX_SCORE);
  const band = SCORE_BANDS.find((entry) => score >= entry.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];

  return {
    name: String(name).trim(),
    letters: letters.map((character) => ({
      letter: character,
      chaldean: CHALDEAN_VALUES[character] ?? 0,
      pythagorean: PYTHAGOREAN_VALUES[character] ?? 0,
      frequency: ENGLISH_LETTER_FREQUENCY[character] ?? 0,
      vowel: VOWELS.includes(character),
    })),
    letterCount: total,
    vowelCount,
    consonantCount: total - vowelCount,
    vowelShare,
    distinctCount,
    longestRun: run,
    meanFrequency,
    chaldeanTotal,
    chaldeanRoot,
    pythagoreanTotal,
    pythagoreanRoot,
    components,
    score,
    band,
  };
}

/** Score several names at once and return them sorted highest first. */
export function rankNames(list) {
  const names = (Array.isArray(list) ? list : [])
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
  if (names.length === 0) {
    return { error: "Add at least one name to compare." };
  }
  const results = names.map((entry) => ({ input: entry, result: analyseName(entry) }));
  const scored = results.filter((row) => !row.result.error);
  if (scored.length === 0) {
    return { error: "None of those entries contain letters A to Z." };
  }
  scored.sort((a, b) => b.result.score - a.result.score);
  return { rows: scored, skipped: results.length - scored.length };
}
