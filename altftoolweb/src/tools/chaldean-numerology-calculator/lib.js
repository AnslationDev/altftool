/**
 * Chaldean numerology arithmetic.
 *
 * The Chaldean system (popularised in English by Cheiro, "Book of Numbers")
 * differs from the Pythagorean system in two ways:
 *   1. Letters are valued 1 to 8 only. The number 9 is never assigned to a
 *      letter because it was held to be sacred.
 *   2. The unreduced total is the "compound" number and carries its own
 *      traditional reading; it is then digit-summed to a single "root" number.
 *
 * Everything below is a transcription of that published system. It is cultural
 * and entertainment material, not a prediction of anything.
 */

/** Chaldean letter values. 9 is deliberately absent from this table. */
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

/** The value groups, for showing the reference table in the UI. */
export const CHALDEAN_GROUPS = [
  { value: 1, letters: ["A", "I", "J", "Q", "Y"] },
  { value: 2, letters: ["B", "K", "R"] },
  { value: 3, letters: ["C", "G", "L", "S"] },
  { value: 4, letters: ["D", "M", "T"] },
  { value: 5, letters: ["E", "H", "N", "X"] },
  { value: 6, letters: ["U", "V", "W"] },
  { value: 7, letters: ["O", "Z"] },
  { value: 8, letters: ["F", "P"] },
];

/** Planetary rulership of the root numbers as given by Cheiro. */
export const ROOT_NUMBERS = {
  1: { planet: "Sun", keynote: "Initiative, individuality, leading rather than following" },
  2: { planet: "Moon", keynote: "Sensitivity, imagination, working through cooperation" },
  3: { planet: "Jupiter", keynote: "Expression, teaching, ambition and order" },
  4: { planet: "Rahu (Uranus)", keynote: "Unconventional outlook, sudden change, reform" },
  5: { planet: "Mercury", keynote: "Quickness, commerce, communication, restlessness" },
  6: { planet: "Venus", keynote: "Harmony, art, domestic and aesthetic concerns" },
  7: { planet: "Ketu (Neptune)", keynote: "Independence, research, philosophy, travel" },
  8: { planet: "Saturn", keynote: "Endurance, responsibility, slow but lasting results" },
  9: { planet: "Mars", keynote: "Energy, courage, conflict and drive" },
};

/**
 * Cheiro's compound-number readings, 10 to 52. Compound numbers above 52 have
 * no entry in the classical table; only the root number is read for those.
 */
export const COMPOUND_NUMBERS = {
  10: "The Wheel of Fortune — rise and fall, plans carried out for good or ill.",
  11: "A Clenched Hand — warns of hidden dangers and trials from others.",
  12: "The Sacrifice — anxiety of mind, being used by others' plans.",
  13: "Change and upheaval — power that must be used constructively, not an unlucky number in itself.",
  14: "Movement — combinations of people and things, risk from speculation.",
  15: "The Magician — persuasion, personal magnetism, gifts from others.",
  16: "The Shattered Citadel — warns of accident and defeat of plans.",
  17: "The Star of the Magi — spirituality, a name that outlives the person.",
  18: "Materialism striving against the spiritual — quarrels and conflict.",
  19: "The Prince of Heaven — success, honour and happiness.",
  20: "The Awakening — a call to action for a new purpose or plan.",
  21: "The Crown of the Magi — advancement, honour and elevation after struggle.",
  22: "Caution — a good person blinded by the folly of others; illusion.",
  23: "The Royal Star of the Lion — help from superiors, success in plans.",
  24: "Assistance and association with those of rank, gain through love.",
  25: "Strength gained through experience — success after trials.",
  26: "Grave warnings — ruin through bad partnerships and advice.",
  27: "The Sceptre — authority, command, a productive intellect.",
  28: "Contradictions — loss through misplaced trust, opposition late in life.",
  29: "Uncertainties and trials — treachery and deception from others.",
  30: "Thoughtful deduction — retrospection and mental superiority; neither fortunate nor unfortunate.",
  31: "Self-contained and isolated, like 30 but more so.",
  32: "Magical power — like 23 and 24, provided one's own judgement is held to.",
  33: "Same reading as 24.",
  34: "Same reading as 25.",
  35: "Same reading as 26.",
  36: "Same reading as 27.",
  37: "Good and fortunate friendships and partnerships, especially in love.",
  38: "Same reading as 29.",
  39: "Same reading as 30.",
  40: "Same reading as 31.",
  41: "Same reading as 32.",
  42: "Same reading as 24.",
  43: "Revolution and upheaval — an unfortunate number of strife and failed plans.",
  44: "Same reading as 26.",
  45: "Same reading as 27.",
  46: "Same reading as 37.",
  47: "Same reading as 29.",
  48: "Same reading as 30.",
  49: "Same reading as 31.",
  50: "Same reading as 32.",
  51: "The Warrior — sudden advancement, but it makes enemies.",
  52: "Same reading as 43.",
};

/** Highest compound number the classical table covers. */
export const MAX_COMPOUND_IN_TABLE = 52;

/** Digit-sum a positive integer once. */
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
 * Reduce to a single digit 1-9, returning every intermediate step.
 * Chaldean practice reduces all the way; there are no retained master numbers.
 */
export function reduceToRoot(total) {
  if (!Number.isFinite(total) || total <= 0) return { root: 0, steps: [] };
  const steps = [];
  let current = Math.trunc(total);
  while (current > 9) {
    const next = digitSum(current);
    steps.push({ from: current, to: next });
    current = next;
  }
  return { root: current, steps };
}

/** Value of a single character, or null if it is not a scored letter. */
export function chaldeanLetterValue(character) {
  const upper = String(character ?? "").toUpperCase();
  return Object.prototype.hasOwnProperty.call(CHALDEAN_VALUES, upper)
    ? CHALDEAN_VALUES[upper]
    : null;
}

/**
 * Chaldean number for a written name.
 * Non-letters (spaces, dots, hyphens, digits) are ignored, as in the classical
 * method which scores only the sounds written in the name.
 */
export function computeNameNumber(name) {
  const raw = String(name ?? "");
  const letters = [];
  let compound = 0;

  for (const character of raw) {
    const value = chaldeanLetterValue(character);
    if (value !== null) {
      letters.push({ letter: character.toUpperCase(), value });
      compound += value;
    }
  }

  if (letters.length === 0) {
    return { error: "Enter a name using the letters A to Z — digits and symbols are not scored." };
  }

  const { root, steps } = reduceToRoot(compound);
  return {
    name: raw.trim(),
    letters,
    letterCount: letters.length,
    compound,
    root,
    steps,
    compoundMeaning:
      compound <= MAX_COMPOUND_IN_TABLE ? COMPOUND_NUMBERS[compound] ?? null : null,
    compoundInTable: compound <= MAX_COMPOUND_IN_TABLE && Boolean(COMPOUND_NUMBERS[compound]),
    rootInfo: ROOT_NUMBERS[root] ?? null,
  };
}

/** Days in a month, using the Gregorian leap rule (÷4, not ÷100 unless ÷400). */
export function daysInMonth(month, year) {
  const lengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12) return 0;
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return lengths[month - 1];
}

/** Earliest year accepted, to keep input sane. */
export const MIN_YEAR = 1000;
/** Latest year accepted. */
export const MAX_YEAR = 2999;

/**
 * Psychic (moolank) and destiny (bhagyank) numbers from a date of birth.
 *  - Psychic  = day of month reduced to a single digit.
 *  - Destiny  = every digit of DD MM YYYY summed, then reduced.
 * Dates are passed in as parts so the function stays pure.
 */
export function computeDateNumbers({ day, month, year } = {}) {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);

  if (![d, m, y].every((value) => Number.isInteger(value))) {
    return { error: "Enter the day, month and year as whole numbers." };
  }
  if (y < MIN_YEAR || y > MAX_YEAR) {
    return { error: `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  if (m < 1 || m > 12) {
    return { error: "Month must be between 1 and 12." };
  }
  const maxDay = daysInMonth(m, y);
  if (d < 1 || d > maxDay) {
    return { error: `That month has ${maxDay} days, so the day must be between 1 and ${maxDay}.` };
  }

  const psychicTotal = d;
  const psychic = reduceToRoot(psychicTotal);

  const destinyTotal =
    digitSum(d) + digitSum(m) + digitSum(y);
  const destiny = reduceToRoot(destinyTotal);

  return {
    day: d,
    month: m,
    year: y,
    psychicTotal,
    psychic: psychic.root,
    psychicSteps: psychic.steps,
    psychicInfo: ROOT_NUMBERS[psychic.root] ?? null,
    destinyTotal,
    destiny: destiny.root,
    destinySteps: destiny.steps,
    destinyInfo: ROOT_NUMBERS[destiny.root] ?? null,
  };
}

/**
 * Plain, non-predictive comparison of a name root against the birth numbers:
 * the tradition simply looks for the name number to repeat the psychic or
 * destiny number. No score is invented here — matches are reported as facts.
 */
export function compareNameToBirth(nameResult, dateResult) {
  if (!nameResult || nameResult.error) return { error: "Enter a valid name first." };
  if (!dateResult || dateResult.error) return { error: "Enter a valid date of birth first." };

  const matchesPsychic = nameResult.root === dateResult.psychic;
  const matchesDestiny = nameResult.root === dateResult.destiny;
  const matched = [];
  if (matchesPsychic) matched.push("psychic number");
  if (matchesDestiny) matched.push("destiny number");

  return {
    nameRoot: nameResult.root,
    psychic: dateResult.psychic,
    destiny: dateResult.destiny,
    matchesPsychic,
    matchesDestiny,
    note:
      matched.length > 0
        ? `The name root ${nameResult.root} repeats the ${matched.join(" and the ")}.`
        : `The name root ${nameResult.root} differs from both the psychic number ${dateResult.psychic} and the destiny number ${dateResult.destiny}.`,
  };
}
