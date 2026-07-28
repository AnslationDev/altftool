/**
 * Mood Check Questionnaire — informational nine-item mood self-check
 *
 * Nine statements covering the symptom domains that clinicians ask about when
 * screening for low mood: interest, mood, sleep, energy, appetite, self-worth,
 * concentration, psychomotor change and thoughts of self-harm. Each is rated by
 * how many days in the last two weeks it applied, 0 to 3, giving a total of 0-27.
 * The five severity bands at 5, 10, 15 and 20 follow the cut-points used by the
 * standard nine-item depression screeners in primary care.
 *
 * This is informational self-reflection only. It is not a diagnostic instrument,
 * it cannot tell you whether you have depression, and it does not replace an
 * assessment by a doctor or mental health professional.
 */

export const MOOD_ITEM_COUNT = 9;
export const MOOD_MAX_PER_ITEM = 3;
export const MOOD_MAX = MOOD_ITEM_COUNT * MOOD_MAX_PER_ITEM; // 27

/** The recall window the questions ask about. */
export const RECALL_DAYS = 14;

/** How often each statement applied over the last two weeks. */
export const FREQUENCY_OPTIONS = [
  { value: 0, label: "Not at all", short: "Not at all" },
  { value: 1, label: "Several days", short: "Several days" },
  { value: 2, label: "More than half the days", short: "Over half" },
  { value: 3, label: "Nearly every day", short: "Nearly daily" },
];

/**
 * Index of the self-harm item. Any answer above 0 raises a safety flag,
 * regardless of the total, because the total can be low while this item is not.
 */
export const SAFETY_ITEM_INDEX = 8;

export const MOOD_ITEMS = [
  { id: "interest", statement: "Little interest or pleasure in things you normally enjoy" },
  { id: "low-mood", statement: "Feeling down, flat or hopeless" },
  { id: "sleep", statement: "Trouble falling asleep, staying asleep, or sleeping far too much" },
  { id: "energy", statement: "Feeling tired or having little energy" },
  { id: "appetite", statement: "Poor appetite, or eating noticeably more than usual" },
  { id: "self-worth", statement: "Feeling bad about yourself, or that you have let people down" },
  { id: "concentration", statement: "Trouble concentrating on reading, work or conversation" },
  { id: "psychomotor", statement: "Moving or speaking noticeably slowly, or being restless and fidgety" },
  { id: "self-harm", statement: "Thoughts that you would be better off dead, or of hurting yourself" },
];

/** Optional, unscored: how much the symptoms interfere with daily life. */
export const DIFFICULTY_OPTIONS = [
  { value: "none", label: "Not difficult at all" },
  { value: "somewhat", label: "Somewhat difficult" },
  { value: "very", label: "Very difficult" },
  { value: "extremely", label: "Extremely difficult" },
];

export const MOOD_BANDS = [
  {
    min: 0,
    max: 4,
    label: "Minimal",
    note: "Very few symptoms reported in the last two weeks.",
  },
  {
    min: 5,
    max: 9,
    label: "Mild",
    note: "Some symptoms present. Worth watching, and worth mentioning if they persist.",
  },
  {
    min: 10,
    max: 14,
    label: "Moderate",
    note: "A score of 10 or more is the usual point at which clinicians suggest a proper assessment.",
  },
  {
    min: 15,
    max: 19,
    label: "Moderately severe",
    note: "Symptoms are frequent across most areas. Speaking to a doctor is strongly advisable.",
  },
  {
    min: 20,
    max: MOOD_MAX,
    label: "Severe",
    note: "Symptoms reported almost every day across nearly all areas. Please arrange support soon.",
  },
];

/** The score at and above which further assessment is conventionally suggested. */
export const ASSESSMENT_THRESHOLD = 10;

export function bandForScore(total) {
  return MOOD_BANDS.find((b) => total >= b.min && total <= b.max) || null;
}

/**
 * Score a completed mood check.
 *
 * @param {object} input
 * @param {Array<number|null>} input.responses One value per item, each 0-3.
 * @param {string} [input.difficulty] One of the DIFFICULTY_OPTIONS values, unscored.
 * @returns {object} Result object, or { error } when it cannot be scored.
 */
export function computeMoodScore({ responses, difficulty = "none" } = {}) {
  if (!Array.isArray(responses) || responses.length !== MOOD_ITEM_COUNT) {
    return { error: `This check needs exactly ${MOOD_ITEM_COUNT} answers.` };
  }

  const missing = responses.reduce(
    (list, value, index) => (value === null || value === undefined ? [...list, index + 1] : list),
    [],
  );
  if (missing.length > 0) {
    return { error: `Answer every statement — ${missing.length} still unanswered (item ${missing.join(", ")}).` };
  }

  for (const value of responses) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n > MOOD_MAX_PER_ITEM) {
      return { error: "Each statement must be rated 0, 1, 2 or 3." };
    }
  }

  const breakdown = MOOD_ITEMS.map((item, index) => {
    const points = Number(responses[index]);
    const option = FREQUENCY_OPTIONS.find((o) => o.value === points);
    return {
      id: item.id,
      statement: item.statement,
      points,
      answer: option ? option.label : "",
    };
  });

  const total = breakdown.reduce((sum, row) => sum + row.points, 0);
  const band = bandForScore(total);
  const difficultyOption = DIFFICULTY_OPTIONS.find((o) => o.value === difficulty) || DIFFICULTY_OPTIONS[0];

  /** Items rated 2 or 3 — present more than half the days. */
  const frequentItems = breakdown.filter((row) => row.points >= 2);

  return {
    total,
    max: MOOD_MAX,
    breakdown,
    band: band ? band.label : "",
    bandNote: band ? band.note : "",
    aboveAssessmentThreshold: total >= ASSESSMENT_THRESHOLD,
    assessmentThreshold: ASSESSMENT_THRESHOLD,
    safetyFlag: Number(responses[SAFETY_ITEM_INDEX]) > 0,
    frequentItems,
    frequentItemCount: frequentItems.length,
    difficulty: difficultyOption.value,
    difficultyLabel: difficultyOption.label,
    recallDays: RECALL_DAYS,
  };
}
