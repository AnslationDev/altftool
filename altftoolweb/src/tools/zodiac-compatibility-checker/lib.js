/**
 * Zodiac (sun sign) compatibility, using traditional Western astrology.
 *
 * Two rules do all the work, and both are standard astrological doctrine
 * rather than anything invented here:
 *
 * 1. ASPECT — count how many signs apart the two sun signs are around the
 *    360° wheel. Each sign spans 30°, so the separation in signs maps to a
 *    classical aspect: 0 conjunction, 1 semi-sextile (30°), 2 sextile (60°),
 *    3 square (90°), 4 trine (120°), 5 quincunx (150°), 6 opposition (180°).
 *    The harmony ranking of those aspects — trine and sextile easy, square
 *    and quincunx difficult — is the oldest and most agreed-on part of the
 *    tradition, and it is what the score weights.
 *
 * 2. RULERSHIP — signs that share a traditional ruling planet (Aries and
 *    Scorpio share Mars, Taurus and Libra share Venus, Gemini and Virgo share
 *    Mercury, Sagittarius and Pisces share Jupiter, Capricorn and Aquarius
 *    share Saturn) are said to speak the same language, which adds a small
 *    bonus.
 *
 * Element (fire/earth/air/water), modality (cardinal/fixed/mutable) and
 * polarity all follow arithmetically from the separation, so they are reported
 * rather than scored again.
 *
 * The score is a transparent weighting of that tradition for entertainment,
 * not a measurement of real relationships. Everything here is pure: dates come
 * in as arguments and the same input always gives the same output.
 */

/** Degrees of the zodiac wheel covered by each of the 12 signs. */
export const DEGREES_PER_SIGN = 30;

/**
 * The twelve tropical sun signs in wheel order, with the date ranges used by
 * newspapers, almanacs and astrology sites. Boundary dates can shift by about
 * a day depending on birth year and time, which is why cusp births are flagged.
 * `ruler` is the classical (pre-telescope) ruling planet; `modernRuler` is the
 * outer planet assigned after Uranus, Neptune and Pluto were discovered.
 */
export const SIGNS = [
  { key: "aries", name: "Aries", symbol: "♈", element: "Fire", modality: "Cardinal", ruler: "Mars", modernRuler: "Mars", start: [3, 21], end: [4, 19] },
  { key: "taurus", name: "Taurus", symbol: "♉", element: "Earth", modality: "Fixed", ruler: "Venus", modernRuler: "Venus", start: [4, 20], end: [5, 20] },
  { key: "gemini", name: "Gemini", symbol: "♊", element: "Air", modality: "Mutable", ruler: "Mercury", modernRuler: "Mercury", start: [5, 21], end: [6, 20] },
  { key: "cancer", name: "Cancer", symbol: "♋", element: "Water", modality: "Cardinal", ruler: "Moon", modernRuler: "Moon", start: [6, 21], end: [7, 22] },
  { key: "leo", name: "Leo", symbol: "♌", element: "Fire", modality: "Fixed", ruler: "Sun", modernRuler: "Sun", start: [7, 23], end: [8, 22] },
  { key: "virgo", name: "Virgo", symbol: "♍", element: "Earth", modality: "Mutable", ruler: "Mercury", modernRuler: "Mercury", start: [8, 23], end: [9, 22] },
  { key: "libra", name: "Libra", symbol: "♎", element: "Air", modality: "Cardinal", ruler: "Venus", modernRuler: "Venus", start: [9, 23], end: [10, 22] },
  { key: "scorpio", name: "Scorpio", symbol: "♏", element: "Water", modality: "Fixed", ruler: "Mars", modernRuler: "Pluto", start: [10, 23], end: [11, 21] },
  { key: "sagittarius", name: "Sagittarius", symbol: "♐", element: "Fire", modality: "Mutable", ruler: "Jupiter", modernRuler: "Jupiter", start: [11, 22], end: [12, 21] },
  { key: "capricorn", name: "Capricorn", symbol: "♑", element: "Earth", modality: "Cardinal", ruler: "Saturn", modernRuler: "Saturn", start: [12, 22], end: [1, 19] },
  { key: "aquarius", name: "Aquarius", symbol: "♒", element: "Air", modality: "Fixed", ruler: "Saturn", modernRuler: "Uranus", start: [1, 20], end: [2, 18] },
  { key: "pisces", name: "Pisces", symbol: "♓", element: "Water", modality: "Mutable", ruler: "Jupiter", modernRuler: "Neptune", start: [2, 19], end: [3, 20] },
];

/**
 * Classical aspects by separation in signs, with the harmony score this tool
 * assigns each one. The ordering (trine > sextile > opposition > conjunction >
 * semi-sextile > quincunx > square) follows standard aspect doctrine; the exact
 * numbers are this tool's published weighting so results stay comparable.
 */
export const ASPECTS = [
  {
    distance: 0,
    name: "Conjunction",
    angle: 0,
    quality: "Same sign",
    score: 68,
    summary: "Same element, same pace, same blind spots — instant recognition, little contrast.",
  },
  {
    distance: 1,
    name: "Semi-sextile",
    angle: 30,
    quality: "Neighbouring",
    score: 55,
    summary: "Next-door signs share a border but nothing else: different element, different mode.",
  },
  {
    distance: 2,
    name: "Sextile",
    angle: 60,
    quality: "Easy",
    score: 84,
    summary: "Complementary elements — fire with air, earth with water. Cooperative and low-friction.",
  },
  {
    distance: 3,
    name: "Square",
    angle: 90,
    quality: "Tense",
    score: 42,
    summary: "Same modality pulling in clashing elements: the classic growth-through-friction pairing.",
  },
  {
    distance: 4,
    name: "Trine",
    angle: 120,
    quality: "Harmonious",
    score: 92,
    summary: "Same element, different mode — the most effortless pairing in traditional astrology.",
  },
  {
    distance: 5,
    name: "Quincunx",
    angle: 150,
    quality: "Awkward",
    score: 48,
    summary: "Nothing in common in element, mode or polarity; rapport has to be built deliberately.",
  },
  {
    distance: 6,
    name: "Opposition",
    angle: 180,
    quality: "Polar",
    score: 74,
    summary: "Opposite seats on the wheel: strong attraction across a real difference in outlook.",
  },
];

/** Bonus for two signs that share a classical ruling planet. */
export const SHARED_RULER_BONUS = 4;

/** Score bands used for the verdict label. */
export const SCORE_BANDS = [
  { min: 85, label: "Excellent match" },
  { min: 70, label: "Strong match" },
  { min: 55, label: "Workable match" },
  { min: 40, label: "Needs effort" },
  { min: 0, label: "Challenging" },
];

/** Fire and air are the traditional positive/yang signs; earth and water negative/yin. */
const POSITIVE_ELEMENTS = ["Fire", "Air"];

/** Element pairs that traditionally support each other. */
const COMPLEMENTARY_ELEMENTS = {
  Fire: "Air",
  Air: "Fire",
  Earth: "Water",
  Water: "Earth",
};

const ELEMENT_NOTE = {
  same: "You run on the same element, so you read each other's motives without translating.",
  complementary: "Your elements feed each other: air lifts fire, water shapes earth.",
  challenging: "Your elements work differently, so the same situation can feel urgent to one of you and trivial to the other.",
};

const MODALITY_NOTE = {
  Cardinal: "Both of you start things, so decide early who leads which parts of life.",
  Fixed: "Both of you dig in, so a disagreement lasts until someone chooses to move.",
  Mutable: "Both of you adapt, which keeps things easy but can leave plans undecided.",
};

const DIFFERENT_MODALITY_NOTE =
  "You approach change differently — one of you starts, holds or bends where the other does the opposite, which shares the load.";

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(year) {
  // Gregorian rule: divisible by 4, except centuries that are not divisible by 400.
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year, month) {
  return month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1];
}

/** Day-of-year style ordinal that ignores leap days, for sign range comparison. */
function ordinal(month, day) {
  return month * 100 + day;
}

/**
 * Look up a sign by key or name.
 *
 * @param {string} value
 * @returns {object|null}
 */
export function findSign(value) {
  const needle = String(value ?? "").trim().toLowerCase();
  if (!needle) return null;
  return SIGNS.find((sign) => sign.key === needle || sign.name.toLowerCase() === needle) ?? null;
}

/**
 * Sun sign for a calendar date.
 *
 * @param {string} isoDate  a "YYYY-MM-DD" date string
 * @returns {object} the sign object plus { onCusp }, or { error }.
 */
export function sunSignFromDate(isoDate) {
  const match = String(isoDate ?? "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return { error: "Enter the birth date as YYYY-MM-DD." };
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return { error: "That month does not exist." };
  if (day < 1 || day > daysInMonth(year, month)) {
    return { error: `${match[1]}-${match[2]} has only ${daysInMonth(year, month)} days.` };
  }

  const stamp = ordinal(month, day);
  const sign =
    SIGNS.find((candidate) => {
      const from = ordinal(candidate.start[0], candidate.start[1]);
      const to = ordinal(candidate.end[0], candidate.end[1]);
      // Capricorn wraps across new year, so its range is two intervals.
      return from <= to ? stamp >= from && stamp <= to : stamp >= from || stamp <= to;
    }) ?? null;
  if (!sign) return { error: "That date does not fall in any sign range." };

  const onCusp =
    stamp === ordinal(sign.start[0], sign.start[1]) || stamp === ordinal(sign.end[0], sign.end[1]);
  return { ...sign, onCusp };
}

function elementRelation(elementA, elementB) {
  if (elementA === elementB) return "same";
  if (COMPLEMENTARY_ELEMENTS[elementA] === elementB) return "complementary";
  return "challenging";
}

function bandLabel(score) {
  return SCORE_BANDS.find((band) => score >= band.min)?.label ?? SCORE_BANDS[SCORE_BANDS.length - 1].label;
}

/**
 * Compatibility between two sun signs.
 *
 * @param {object} input
 * @param {string} input.signA  sign key or name
 * @param {string} input.signB  sign key or name
 * @returns {object} the compatibility read-out, or { error }.
 */
export function zodiacCompatibility({ signA, signB } = {}) {
  const first = findSign(signA);
  const second = findSign(signB);
  if (!first) return { error: `"${String(signA ?? "").trim() || "(blank)"}" is not one of the 12 zodiac signs.` };
  if (!second) return { error: `"${String(signB ?? "").trim() || "(blank)"}" is not one of the 12 zodiac signs.` };

  const indexA = SIGNS.indexOf(first);
  const indexB = SIGNS.indexOf(second);
  const separation = Math.abs(indexA - indexB);
  const distance = Math.min(separation, SIGNS.length - separation);
  const aspect = ASPECTS[distance];

  // Two different signs sharing a classical ruler is the rapport the bonus is
  // for; a sign paired with itself already scores as a conjunction, so it does
  // not collect the bonus as well.
  const sharedRuler = distance > 0 && first.ruler === second.ruler ? first.ruler : null;
  const rawScore = aspect.score + (sharedRuler ? SHARED_RULER_BONUS : 0);
  const score = Math.max(0, Math.min(100, rawScore));

  const elements = elementRelation(first.element, second.element);
  const sameModality = first.modality === second.modality;
  const polarityA = POSITIVE_ELEMENTS.includes(first.element) ? "Positive" : "Negative";
  const polarityB = POSITIVE_ELEMENTS.includes(second.element) ? "Positive" : "Negative";

  const strengths = [];
  const frictions = [];

  if (elements === "same" || elements === "complementary") strengths.push(ELEMENT_NOTE[elements]);
  else frictions.push(ELEMENT_NOTE.challenging);

  if (sameModality) {
    (distance === 0 ? strengths : frictions).push(MODALITY_NOTE[first.modality]);
  } else {
    strengths.push(DIFFERENT_MODALITY_NOTE);
  }

  if (sharedRuler) {
    strengths.push(`Both signs answer to ${sharedRuler}, so your instincts about what matters line up.`);
  }
  if (polarityA !== polarityB) {
    frictions.push("One of you leans outward and expressive, the other inward and receptive — pace differences show up first.");
  }

  if (distance === 6) {
    strengths.push("Opposite signs cover each other's gaps: what one over-does, the other under-does.");
  }
  if (distance === 3 || distance === 5) {
    frictions.push(aspect.summary);
  }

  return {
    signA: { key: first.key, name: first.name, symbol: first.symbol, element: first.element, modality: first.modality, ruler: first.ruler, polarity: polarityA },
    signB: { key: second.key, name: second.name, symbol: second.symbol, element: second.element, modality: second.modality, ruler: second.ruler, polarity: polarityB },
    score,
    verdict: bandLabel(score),
    aspect: {
      name: aspect.name,
      angle: aspect.angle,
      quality: aspect.quality,
      distance,
      summary: aspect.summary,
    },
    elementRelation: elements,
    sameModality,
    samePolarity: polarityA === polarityB,
    sharedRuler,
    separationDegrees: distance * DEGREES_PER_SIGN,
    strengths,
    frictions,
  };
}

/**
 * One entry point for both input modes.
 *
 * @param {object} input
 * @param {"signs"|"dates"} [input.mode]
 * @param {string} [input.signA] sign key, used when mode is "signs"
 * @param {string} [input.signB]
 * @param {string} [input.dateA] "YYYY-MM-DD", used when mode is "dates"
 * @param {string} [input.dateB]
 * @param {string} [input.nameA] optional label for the first person
 * @param {string} [input.nameB]
 * @returns {object} compatibility result, or { error }.
 */
export function checkZodiacCompatibility({
  mode = "signs",
  signA,
  signB,
  dateA,
  dateB,
  nameA = "",
  nameB = "",
} = {}) {
  let keyA = signA;
  let keyB = signB;
  let cuspA = false;
  let cuspB = false;

  if (mode === "dates") {
    const resolvedA = sunSignFromDate(dateA);
    if (resolvedA.error) return { error: `First birth date: ${resolvedA.error}` };
    const resolvedB = sunSignFromDate(dateB);
    if (resolvedB.error) return { error: `Second birth date: ${resolvedB.error}` };
    keyA = resolvedA.key;
    keyB = resolvedB.key;
    cuspA = resolvedA.onCusp;
    cuspB = resolvedB.onCusp;
  }

  const result = zodiacCompatibility({ signA: keyA, signB: keyB });
  if (result.error) return result;

  const notes = [];
  if (cuspA || cuspB) {
    notes.push(
      "A birth date on the first or last day of a sign is a cusp date: the exact sign can shift by a day depending on birth year and time of day.",
    );
  }

  return {
    ...result,
    nameA: String(nameA ?? "").trim(),
    nameB: String(nameB ?? "").trim(),
    onCusp: cuspA || cuspB,
    notes,
  };
}
