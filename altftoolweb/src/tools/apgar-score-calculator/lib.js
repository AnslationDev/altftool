/**
 * Apgar score
 *
 * Five newborn signs, each scored 0, 1 or 2, giving a total out of 10, from
 * Virginia Apgar, "A proposal for a new method of evaluation of the newborn
 * infant", Curr Res Anesth Analg 1953;32:260-267. The five signs are usually
 * remembered by the backronym APGAR: Appearance, Pulse, Grimace, Activity,
 * Respiration.
 *
 * Scoring is done at 1 and 5 minutes after birth. The joint AAP/ACOG guidance
 * is that if the 5-minute score is below 7, scoring continues every 5 minutes
 * up to 20 minutes.
 *
 * Educational and informational only. The Apgar score is a record of the
 * newborn's condition; it is expressly not used to decide whether to start
 * resuscitation, and it does not on its own predict long-term outcome.
 */

export const APGAR_MAX_PER_SIGN = 2;
export const APGAR_SIGN_COUNT = 5;
export const APGAR_MAX = APGAR_SIGN_COUNT * APGAR_MAX_PER_SIGN; // 10

/** Standard assessment times in minutes after birth. */
export const TIME_POINTS = [1, 5, 10];

/** The 5-minute score below which repeat scoring every 5 minutes is advised. */
export const REPEAT_SCORING_THRESHOLD = 7;

export const APGAR_SIGNS = [
  {
    id: "appearance",
    letter: "A",
    name: "Appearance",
    detail: "Skin colour",
    options: [
      { value: 0, label: "Blue or pale all over" },
      { value: 1, label: "Body pink, hands and feet blue" },
      { value: 2, label: "Pink all over" },
    ],
  },
  {
    id: "pulse",
    letter: "P",
    name: "Pulse",
    detail: "Heart rate",
    options: [
      { value: 0, label: "Absent" },
      { value: 1, label: "Under 100 beats per minute" },
      { value: 2, label: "100 beats per minute or more" },
    ],
  },
  {
    id: "grimace",
    letter: "G",
    name: "Grimace",
    detail: "Reflex response to stimulation",
    options: [
      { value: 0, label: "No response" },
      { value: 1, label: "Grimace or feeble cry" },
      { value: 2, label: "Cry, cough or sneeze, pulls away" },
    ],
  },
  {
    id: "activity",
    letter: "A",
    name: "Activity",
    detail: "Muscle tone",
    options: [
      { value: 0, label: "Limp, no movement" },
      { value: 1, label: "Some flexion of arms and legs" },
      { value: 2, label: "Active movement, flexed limbs resisting extension" },
    ],
  },
  {
    id: "respiration",
    letter: "R",
    name: "Respiration",
    detail: "Breathing effort",
    options: [
      { value: 0, label: "Absent" },
      { value: 1, label: "Slow or irregular, weak cry" },
      { value: 2, label: "Good breathing, strong cry" },
    ],
  },
];

/** Conventional descriptive bands for the total. */
export const APGAR_BANDS = [
  { min: 0, max: 3, label: "Low", note: "A very low score. In practice this prompts immediate assessment and support." },
  { min: 4, max: 6, label: "Moderately abnormal", note: "Some signs depressed; the baby is usually observed closely and reassessed." },
  { min: 7, max: APGAR_MAX, label: "Reassuring", note: "Within the range considered normal at this time point." },
];

export function bandForScore(total) {
  return APGAR_BANDS.find((b) => total >= b.min && total <= b.max) || null;
}

/**
 * Score one Apgar assessment.
 *
 * @param {object} input
 * @param {Array<number>} input.scores Five values in APGAR_SIGNS order, each 0-2.
 * @param {number} [input.minute]      The time point in minutes, recorded for display.
 * @returns {object} Result object, or { error } when it cannot be scored.
 */
export function computeApgar({ scores, minute = null } = {}) {
  if (!Array.isArray(scores) || scores.length !== APGAR_SIGN_COUNT) {
    return { error: `An Apgar score needs all ${APGAR_SIGN_COUNT} signs.` };
  }

  for (const value of scores) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n > APGAR_MAX_PER_SIGN) {
      return { error: "Each of the five signs must be scored 0, 1 or 2." };
    }
  }

  const breakdown = APGAR_SIGNS.map((sign, index) => {
    const points = Number(scores[index]);
    const option = sign.options.find((o) => o.value === points);
    return {
      id: sign.id,
      letter: sign.letter,
      name: sign.name,
      detail: sign.detail,
      points,
      answer: option ? option.label : "",
    };
  });

  const total = breakdown.reduce((sum, row) => sum + row.points, 0);
  const band = bandForScore(total);
  const lowSigns = breakdown.filter((row) => row.points < APGAR_MAX_PER_SIGN);

  return {
    minute,
    total,
    max: APGAR_MAX,
    breakdown,
    band: band ? band.label : "",
    bandNote: band ? band.note : "",
    lowSigns,
    lowSignCount: lowSigns.length,
    isFullMarks: total === APGAR_MAX,
  };
}

/**
 * Score the 1, 5 and optional 10 minute assessments together.
 *
 * @param {object} input
 * @param {Array<number>} input.oneMinute  Five values, each 0-2.
 * @param {Array<number>} input.fiveMinute Five values, each 0-2.
 * @param {Array<number>|null} [input.tenMinute] Five values, or null when not assessed.
 * @returns {object} Result object, or { error } when any assessment is invalid.
 */
export function computeApgarSeries({ oneMinute, fiveMinute, tenMinute = null } = {}) {
  const one = computeApgar({ scores: oneMinute, minute: 1 });
  if (one.error) return { error: `1-minute score: ${one.error}` };

  const five = computeApgar({ scores: fiveMinute, minute: 5 });
  if (five.error) return { error: `5-minute score: ${five.error}` };

  let ten = null;
  if (tenMinute !== null && tenMinute !== undefined) {
    ten = computeApgar({ scores: tenMinute, minute: 10 });
    if (ten.error) return { error: `10-minute score: ${ten.error}` };
  }

  const changeOneToFive = five.total - one.total;

  return {
    one,
    five,
    ten,
    assessments: ten ? [one, five, ten] : [one, five],
    changeOneToFive,
    trend: changeOneToFive > 0 ? "improving" : changeOneToFive < 0 ? "falling" : "unchanged",
    /** AAP/ACOG: a 5-minute score below 7 means carry on scoring every 5 minutes. */
    repeatScoringAdvised: five.total < REPEAT_SCORING_THRESHOLD,
    repeatScoringThreshold: REPEAT_SCORING_THRESHOLD,
  };
}
