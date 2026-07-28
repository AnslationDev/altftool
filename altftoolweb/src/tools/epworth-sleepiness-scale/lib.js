/**
 * Epworth Sleepiness Scale (ESS)
 *
 * Eight everyday sedentary situations, each rated 0-3 for the chance of dozing
 * off, giving a total of 0-24. The instrument was introduced by M. W. Johns,
 * "A new method for measuring daytime sleepiness: the Epworth sleepiness scale",
 * Sleep 1991;14(6):540-545. The situation descriptions below are paraphrased.
 *
 * Informational and educational only. The ESS measures average daytime
 * sleepiness over recent weeks; it does not diagnose sleep apnoea, narcolepsy
 * or any other sleep disorder, and only a clinician can do that.
 */

/** 8 items x a maximum of 3 points each. */
export const ESS_ITEM_COUNT = 8;
export const ESS_MAX_PER_ITEM = 3;
export const ESS_MAX = ESS_ITEM_COUNT * ESS_MAX_PER_ITEM; // 24

/** The four response levels used for every item. */
export const CHANCE_OPTIONS = [
  { value: 0, label: "Would never doze", short: "Never" },
  { value: 1, label: "Slight chance of dozing", short: "Slight" },
  { value: 2, label: "Moderate chance of dozing", short: "Moderate" },
  { value: 3, label: "High chance of dozing", short: "High" },
];

/** The eight situations, paraphrased. */
export const ESS_ITEMS = [
  { id: "reading", situation: "Sitting quietly and reading" },
  { id: "tv", situation: "Watching television" },
  { id: "public", situation: "Sitting still in a public place, such as a cinema or a meeting" },
  { id: "passenger", situation: "Riding as a passenger in a car for an hour with no break" },
  { id: "afternoon", situation: "Lying down to rest in the afternoon when the day allows it" },
  { id: "talking", situation: "Sitting and talking with someone" },
  { id: "after-lunch", situation: "Sitting quietly after lunch, having had no alcohol" },
  { id: "traffic", situation: "In a car, stopped for a few minutes in traffic" },
];

/**
 * Severity bands published by Johns for the total ESS score.
 * A total above 10 is the conventional threshold for excessive daytime sleepiness.
 */
export const ESS_THRESHOLD_EXCESSIVE = 10;

export const ESS_BANDS = [
  { min: 0, max: 5, label: "Lower normal daytime sleepiness", excessive: false },
  { min: 6, max: 10, label: "Higher normal daytime sleepiness", excessive: false },
  { min: 11, max: 12, label: "Mild excessive daytime sleepiness", excessive: true },
  { min: 13, max: 15, label: "Moderate excessive daytime sleepiness", excessive: true },
  { min: 16, max: ESS_MAX, label: "Severe excessive daytime sleepiness", excessive: true },
];

export function bandForScore(total) {
  return ESS_BANDS.find((b) => total >= b.min && total <= b.max) || null;
}

/**
 * Total an Epworth Sleepiness Scale questionnaire.
 *
 * @param {object} input
 * @param {Array<number|null>} input.responses One value per item, each 0-3.
 *   `null` marks an unanswered item and makes the questionnaire unscoreable.
 * @returns {object} Result object, or { error } when it cannot be scored.
 */
export function computeEpworth({ responses } = {}) {
  if (!Array.isArray(responses) || responses.length !== ESS_ITEM_COUNT) {
    return { error: `The Epworth scale needs exactly ${ESS_ITEM_COUNT} answers.` };
  }

  const unanswered = responses.reduce(
    (list, value, index) => (value === null || value === undefined ? [...list, index + 1] : list),
    [],
  );
  if (unanswered.length > 0) {
    return {
      error: `Answer all ${ESS_ITEM_COUNT} situations — still missing ${unanswered.length} (item ${unanswered.join(", ")}).`,
    };
  }

  for (const value of responses) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n > ESS_MAX_PER_ITEM) {
      return { error: "Each situation must be rated 0, 1, 2 or 3." };
    }
  }

  const breakdown = ESS_ITEMS.map((item, index) => {
    const points = Number(responses[index]);
    const option = CHANCE_OPTIONS.find((o) => o.value === points);
    return {
      id: item.id,
      situation: item.situation,
      points,
      answer: option ? option.label : "",
    };
  });

  const total = breakdown.reduce((sum, row) => sum + row.points, 0);
  const band = bandForScore(total);
  const highest = breakdown.reduce((a, b) => (b.points > a.points ? b : a), breakdown[0]);

  return {
    total,
    max: ESS_MAX,
    breakdown,
    band: band ? band.label : "",
    excessive: band ? band.excessive : total > ESS_THRESHOLD_EXCESSIVE,
    threshold: ESS_THRESHOLD_EXCESSIVE,
    /** Mean points per situation, a useful figure when comparing two sittings. */
    averagePerItem: total / ESS_ITEM_COUNT,
    highestSituation: highest,
  };
}
