/**
 * Pythagorean (modern Western) name numerology.
 *
 * Rules implemented, as published in standard numerology references:
 *   - Letter values cycle 1-9 through the alphabet: A=1 … I=9, J=1 … R=9,
 *     S=1 … Z=8.
 *   - Expression / Destiny number = every letter of the name, reduced.
 *   - Soul Urge / Heart's Desire   = the vowels only, reduced.
 *   - Personality number           = the consonants only, reduced.
 *   - Master numbers 11, 22 and 33 are NOT reduced further.
 *   - Totals of 13, 14, 16 or 19 before reduction are flagged as the classical
 *     "karmic debt" numbers.
 *
 * This is a cultural and entertainment tradition, not a science.
 */

/** Pythagorean letter values: position in the alphabet, cycled 1-9. */
export const PYTHAGOREAN_VALUES = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

/** The nine value columns, for the reference table in the UI. */
export const PYTHAGOREAN_GROUPS = [
  { value: 1, letters: ["A", "J", "S"] },
  { value: 2, letters: ["B", "K", "T"] },
  { value: 3, letters: ["C", "L", "U"] },
  { value: 4, letters: ["D", "M", "V"] },
  { value: 5, letters: ["E", "N", "W"] },
  { value: 6, letters: ["F", "O", "X"] },
  { value: 7, letters: ["G", "P", "Y"] },
  { value: 8, letters: ["H", "Q", "Z"] },
  { value: 9, letters: ["I", "R"] },
];

/** The five letters always counted as vowels. Y is handled separately. */
export const HARD_VOWELS = "AEIOU";

/** Master numbers that are never reduced to a single digit. */
export const MASTER_NUMBERS = [11, 22, 33];

/** Totals traditionally read as karmic debt numbers before reduction. */
export const KARMIC_DEBT_NUMBERS = [13, 14, 16, 19];

/** How the letter Y should be treated. */
export const Y_MODES = {
  auto: "auto",
  vowel: "vowel",
  consonant: "consonant",
};

/** Short keynotes for each result number. */
export const NUMBER_KEYNOTES = {
  1: "Independence, initiative, leading from the front",
  2: "Partnership, diplomacy, sensitivity to others",
  3: "Expression, creativity, sociability",
  4: "Structure, discipline, patient building",
  5: "Freedom, variety, change and movement",
  6: "Responsibility, care, home and community",
  7: "Analysis, study, inward reflection",
  8: "Authority, organisation, material goals",
  9: "Idealism, service, breadth of outlook",
  11: "Master number — heightened intuition and inspiration",
  22: "Master number — the builder, large practical plans",
  33: "Master number — the teacher, care expressed at scale",
};

const isLetter = (character) =>
  Object.prototype.hasOwnProperty.call(PYTHAGOREAN_VALUES, character);

/** Value of one character, or null if it is not an A-Z letter. */
export function letterValue(character) {
  const upper = String(character ?? "").toUpperCase();
  return isLetter(upper) ? PYTHAGOREAN_VALUES[upper] : null;
}

/**
 * Decide whether the Y at `index` inside an upper-case, letters-only word is
 * acting as a vowel.
 *
 * Documented heuristic: Y carries the vowel sound when neither the letter
 * before it nor the letter after it (within the same word) is a hard vowel.
 * So Lynn and Yvonne take Y as a vowel, while Yash and Maya do not.
 */
export function isYVowel(word, index) {
  const previous = index > 0 ? word[index - 1] : "";
  const next = index < word.length - 1 ? word[index + 1] : "";
  const prevIsVowel = previous !== "" && HARD_VOWELS.includes(previous);
  const nextIsVowel = next !== "" && HARD_VOWELS.includes(next);
  return !prevIsVowel && !nextIsVowel;
}

function digitSum(n) {
  let total = 0;
  let rest = Math.abs(Math.trunc(n));
  while (rest > 0) {
    total += rest % 10;
    rest = Math.floor(rest / 10);
  }
  return total;
}

/**
 * Reduce a total to a single digit, stopping on a master number.
 * Returns { value, steps, isMaster }. A total of 0 (no letters in the group)
 * returns value 0 with no steps.
 */
export function reduceNumber(total) {
  if (!Number.isFinite(total) || total <= 0) {
    return { value: 0, steps: [], isMaster: false };
  }
  const steps = [];
  let current = Math.trunc(total);
  while (current > 9 && !MASTER_NUMBERS.includes(current)) {
    const next = digitSum(current);
    steps.push({ from: current, to: next });
    current = next;
  }
  return { value: current, steps, isMaster: MASTER_NUMBERS.includes(current) };
}

/**
 * Split a written name into scored letters, tagging each as vowel or consonant.
 * @param {string} name
 * @param {string} yMode one of Y_MODES
 */
export function analyseLetters(name, yMode = Y_MODES.auto) {
  const words = String(name ?? "")
    .toUpperCase()
    .split(/[^A-Z]+/)
    .filter(Boolean);

  const letters = [];
  for (const word of words) {
    for (let i = 0; i < word.length; i += 1) {
      const character = word[i];
      let vowel = HARD_VOWELS.includes(character);
      if (character === "Y") {
        if (yMode === Y_MODES.vowel) vowel = true;
        else if (yMode === Y_MODES.consonant) vowel = false;
        else vowel = isYVowel(word, i);
      }
      letters.push({ letter: character, value: PYTHAGOREAN_VALUES[character], vowel, word });
    }
  }
  return letters;
}

/** Was this total one of the karmic debt numbers before reduction? */
export function karmicDebtFor(total) {
  return KARMIC_DEBT_NUMBERS.includes(total) ? total : null;
}

/**
 * Full Pythagorean reading of a name.
 * @param {string} name
 * @param {{yMode?: string}} options
 */
export function computeNameNumerology(name, { yMode = Y_MODES.auto } = {}) {
  const letters = analyseLetters(name, yMode);
  if (letters.length === 0) {
    return { error: "Enter a name using the letters A to Z — digits and symbols are not scored." };
  }

  const vowels = letters.filter((item) => item.vowel);
  const consonants = letters.filter((item) => !item.vowel);

  const sum = (list) => list.reduce((total, item) => total + item.value, 0);

  const expressionTotal = sum(letters);
  const soulTotal = sum(vowels);
  const personalityTotal = sum(consonants);

  const expression = reduceNumber(expressionTotal);
  const soulUrge = reduceNumber(soulTotal);
  const personality = reduceNumber(personalityTotal);

  return {
    name: String(name).trim(),
    yMode,
    letters,
    vowels,
    consonants,
    expression: {
      total: expressionTotal,
      ...expression,
      karmicDebt: karmicDebtFor(expressionTotal),
      keynote: NUMBER_KEYNOTES[expression.value] ?? null,
    },
    soulUrge: {
      total: soulTotal,
      ...soulUrge,
      karmicDebt: karmicDebtFor(soulTotal),
      keynote: NUMBER_KEYNOTES[soulUrge.value] ?? null,
      empty: vowels.length === 0,
    },
    personality: {
      total: personalityTotal,
      ...personality,
      karmicDebt: karmicDebtFor(personalityTotal),
      keynote: NUMBER_KEYNOTES[personality.value] ?? null,
      empty: consonants.length === 0,
    },
  };
}

/**
 * Compare two spellings of a name and report which of the three numbers differ.
 * Useful when deciding between, say, "Aditya" and "Adithya".
 */
export function compareSpellings(first, second, { yMode = Y_MODES.auto } = {}) {
  const a = computeNameNumerology(first, { yMode });
  const b = computeNameNumerology(second, { yMode });
  if (a.error) return { error: `First spelling: ${a.error}` };
  if (b.error) return { error: `Second spelling: ${b.error}` };

  const rows = [
    { label: "Expression", a: a.expression.value, b: b.expression.value },
    { label: "Soul urge", a: a.soulUrge.value, b: b.soulUrge.value },
    { label: "Personality", a: a.personality.value, b: b.personality.value },
  ].map((row) => ({ ...row, same: row.a === row.b }));

  return { first: a, second: b, rows, differences: rows.filter((row) => !row.same).length };
}
