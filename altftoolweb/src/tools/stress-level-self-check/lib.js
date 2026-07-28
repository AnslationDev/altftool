/**
 * Perceived stress self-check.
 *
 * Structure and scoring follow the well-documented 10-item perceived stress
 * questionnaire format introduced by Cohen, Kamarck & Mermelstein (Journal of
 * Health and Social Behavior, 1983):
 *   - 10 statements about the LAST MONTH, each rated 0 = never to 4 = very often.
 *   - Six negatively worded items score as rated (the "helplessness" factor).
 *   - Four positively worded items are reverse scored 4 - rating
 *     (the "self-efficacy" / perceived coping factor).
 *   - Total range 0-40. Commonly published interpretation bands are
 *     0-13 low, 14-26 moderate and 27-40 high perceived stress.
 * The item wording below is written for this page; it is not the copyrighted
 * research instrument and no diagnostic claim is made from the score.
 */

export const MIN_RATING = 0;
export const MAX_RATING = 4;

/** 0-4 frequency anchors used by every item. */
export const RESPONSE_OPTIONS = [
  { value: 0, label: "Never" },
  { value: 1, label: "Almost never" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Fairly often" },
  { value: 4, label: "Very often" },
];

/**
 * factor: "helplessness" items score as rated,
 *         "coping" items are reverse scored (4 - rating).
 */
export const STRESS_ITEMS = [
  { id: "q1", text: "Been upset because of something that happened without warning", factor: "helplessness" },
  { id: "q2", text: "Felt that you could not control the important things in your life", factor: "helplessness" },
  { id: "q3", text: "Felt nervous, tense or stressed", factor: "helplessness" },
  { id: "q4", text: "Felt confident about your ability to handle your personal problems", factor: "coping" },
  { id: "q5", text: "Felt that things were going the way you wanted them to", factor: "coping" },
  { id: "q6", text: "Been angry or frustrated about things that were outside your control", factor: "helplessness" },
  { id: "q7", text: "Been able to manage the small irritations of daily life", factor: "coping" },
  { id: "q8", text: "Felt that you were on top of what you had to do", factor: "coping" },
  { id: "q9", text: "Felt that problems were stacking up faster than you could deal with them", factor: "helplessness" },
  { id: "q10", text: "Found it hard to switch off from worries at the end of the day", factor: "helplessness" },
];

export const HELPLESSNESS_ITEM_COUNT = STRESS_ITEMS.filter((i) => i.factor === "helplessness").length; // 6
export const COPING_ITEM_COUNT = STRESS_ITEMS.filter((i) => i.factor === "coping").length; // 4
export const MAX_TOTAL = STRESS_ITEMS.length * MAX_RATING; // 40

/** Published interpretation bands for a 0-40 perceived stress total. */
export const SCORE_BANDS = [
  {
    key: "low",
    label: "Low perceived stress",
    min: 0,
    max: 13,
    summary:
      "Over the last month you have mostly felt in control of what matters to you, and setbacks have not usually felt overwhelming.",
    steps: [
      "Keep the routines that are working - regular sleep and movement are the two habits people lose first when stress rises.",
      "Note what your usual score looks like so you can spot a real change later.",
      "Stay alert to physical signs, such as disturbed sleep or jaw clenching, that can appear before the feeling does.",
    ],
  },
  {
    key: "moderate",
    label: "Moderate perceived stress",
    min: 14,
    max: 26,
    summary:
      "You are carrying a meaningful load. Most people score in this range at busy points, but it is worth acting rather than waiting for it to pass.",
    steps: [
      "Pick the single largest source of pressure and change one concrete thing about it this week.",
      "Protect sleep first: a consistent wake time does more for stress tolerance than any single relaxation technique.",
      "Build in short recovery gaps between demands instead of one long break at the weekend.",
      "Talk it through with someone you trust - naming the load reliably reduces how uncontrollable it feels.",
    ],
  },
  {
    key: "high",
    label: "High perceived stress",
    min: 27,
    max: 40,
    summary:
      "Demands have been outrunning your sense of control for much of the month. Scores in this range often come with poor sleep, irritability and difficulty concentrating.",
    steps: [
      "Speak to a doctor or a qualified mental health professional, especially if this has lasted more than a few weeks.",
      "Reduce total load before adding coping techniques - drop, delay or delegate at least one commitment.",
      "Cut evening caffeine and alcohol, both of which fragment the sleep you most need right now.",
      "If you ever feel unsafe or have thoughts of harming yourself, contact your local emergency number or a crisis helpline immediately.",
    ],
  },
];

const isRating = (value) =>
  typeof value === "number" && Number.isInteger(value) && value >= MIN_RATING && value <= MAX_RATING;

/** Points contributed by one item: reverse scored for the positively worded ones. */
export function itemScore(item, rating) {
  if (!item || !isRating(rating)) return null;
  return item.factor === "coping" ? MAX_RATING - rating : rating;
}

export function bandForTotal(total) {
  if (typeof total !== "number" || !Number.isFinite(total)) return null;
  return SCORE_BANDS.find((band) => total >= band.min && total <= band.max) || null;
}

/**
 * Score a completed self-check.
 *
 * @param {Record<string, number>} answers map of item id -> 0..4 rating
 * @returns {object} score breakdown, or { error } when the form is incomplete
 */
export function scoreStressCheck(answers) {
  if (!answers || typeof answers !== "object") {
    return { error: "Answer all ten questions to see a score." };
  }

  const missing = STRESS_ITEMS.filter((item) => !isRating(answers[item.id])).map((item) => item.id);
  if (missing.length > 0) {
    return {
      error: `Answer all ten questions - ${missing.length} still ${
        missing.length === 1 ? "needs" : "need"
      } a response.`,
      missing,
    };
  }

  let total = 0;
  let helplessness = 0;
  let coping = 0;
  const perItem = STRESS_ITEMS.map((item) => {
    const points = itemScore(item, answers[item.id]);
    total += points;
    if (item.factor === "helplessness") helplessness += points;
    else coping += points;
    return { id: item.id, text: item.text, factor: item.factor, rating: answers[item.id], points };
  });

  const band = bandForTotal(total);
  const helplessnessMax = HELPLESSNESS_ITEM_COUNT * MAX_RATING; // 24
  const copingMax = COPING_ITEM_COUNT * MAX_RATING; // 16

  // Highest scoring items are the ones actually driving the total.
  const topDrivers = perItem
    .filter((entry) => entry.points >= 3)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);

  return {
    total,
    maxTotal: MAX_TOTAL,
    percent: Math.round((total / MAX_TOTAL) * 100),
    bandKey: band.key,
    bandLabel: band.label,
    bandRange: `${band.min}-${band.max}`,
    summary: band.summary,
    steps: band.steps,
    helplessness,
    helplessnessMax,
    coping,
    copingMax,
    // Which of the two factors is further along its own scale.
    dominantFactor:
      helplessness / helplessnessMax >= coping / copingMax ? "helplessness" : "coping",
    perItem,
    topDrivers,
  };
}
