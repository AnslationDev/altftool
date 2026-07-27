/**
 * AI Companion Usage Reflection
 *
 * A self-reflection worksheet, not a clinical instrument. The scoring is a
 * plain, fully disclosed arithmetic scheme so the result is reproducible:
 *
 *   - Twelve statements, three in each of four dimensions.
 *   - Each statement is rated on a five-point frequency scale, 0 to 4
 *     (a standard Likert frequency anchor set: Never / Rarely / Sometimes /
 *     Often / Almost always).
 *   - Dimension score = sum of that dimension's ratings / maximum possible,
 *     expressed as a percentage.
 *   - Overall score = the mean of the four dimension percentages, so every
 *     dimension carries equal weight regardless of item count.
 *
 * Time context uses a stated assumption rather than a hidden one: adults are
 * assumed to be awake 16 hours a day, the complement of the 7-9 hours of sleep
 * commonly recommended for adults by public-health sleep guidance.
 */

/** Highest rating on the frequency scale; the lowest is 0. */
export const MAX_RESPONSE = 4;

/** Assumed waking minutes in a day (24h day minus 8h sleep). */
export const WAKING_MINUTES_PER_DAY = 16 * 60;

/** Minutes in a full day, used to bound the time input. */
export const MINUTES_PER_DAY = 24 * 60;

export const DAYS_PER_WEEK = 7;

export const RESPONSE_SCALE = [
  { value: 0, label: "Never" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Almost always" },
];

export const DIMENSIONS = [
  {
    id: "time",
    label: "Time and routine",
    blurb: "How much of your day the conversation occupies.",
  },
  {
    id: "emotional",
    label: "Emotional reliance",
    blurb: "Whether the chat is where feelings get processed first.",
  },
  {
    id: "social",
    label: "Social substitution",
    blurb: "Whether chat time is replacing time with people.",
  },
  {
    id: "boundaries",
    label: "Boundaries and control",
    blurb: "How easily you can stop, pause or step away.",
  },
];

export const REFLECTION_ITEMS = [
  { id: "t1", dimension: "time", text: "I open an AI chat within the first hour of waking up." },
  { id: "t2", dimension: "time", text: "A conversation runs longer than I intended it to." },
  { id: "t3", dimension: "time", text: "I chat during meals, commutes or in bed." },
  { id: "e1", dimension: "emotional", text: "I take a bad mood to the chat before anywhere else." },
  { id: "e2", dimension: "emotional", text: "I feel noticeably better or worse depending on how a reply lands." },
  { id: "e3", dimension: "emotional", text: "I look for reassurance rather than information." },
  { id: "s1", dimension: "social", text: "I choose the chat over messaging a friend or family member." },
  { id: "s2", dimension: "social", text: "I have skipped or shortened plans with people to keep chatting." },
  { id: "s3", dimension: "social", text: "I share things with the chat that I have not told anyone else." },
  { id: "b1", dimension: "boundaries", text: "I keep going after telling myself this is the last message." },
  { id: "b2", dimension: "boundaries", text: "I feel restless or flat on days I do not use it." },
  { id: "b3", dimension: "boundaries", text: "I would find it hard to take a full week off." },
];

/**
 * Bands are descriptive labels for the overall percentage, not diagnoses.
 * Cut points sit at the quartiles of the 0-100 scale.
 */
export const BANDS = [
  {
    min: 0,
    max: 24,
    label: "Occasional tool",
    guidance:
      "AI chat sits alongside your routines rather than inside them. Nothing here suggests a change is needed.",
  },
  {
    min: 25,
    max: 49,
    label: "Settled habit",
    guidance:
      "The habit is established but bounded. A light check every few months is usually enough.",
  },
  {
    min: 50,
    max: 74,
    label: "Central routine",
    guidance:
      "The chat is doing real work in your day. Worth naming which parts you would keep and which you would trade back.",
  },
  {
    min: 75,
    max: 100,
    label: "Dominant routine",
    guidance:
      "Most of your answers point one way. If this pattern bothers you or affects sleep, work or relationships, talk it through with someone you trust or a qualified professional.",
  },
];

function bandFor(percent) {
  return BANDS.find((band) => percent >= band.min && percent <= band.max) || BANDS[BANDS.length - 1];
}

/**
 * Score the worksheet.
 *
 * @param {object} input
 * @param {Record<string, number>} input.responses map of item id to 0-4 rating
 * @param {number} input.dailyMinutes typical minutes of AI chat per day
 * @returns {{overall:number,band:object,dimensions:Array,topDimension:object,
 *   answered:number,totalItems:number,weeklyMinutes:number,weeklyHours:number,
 *   shareOfWaking:number}|{error:string}}
 */
export function scoreCompanionReflection({ responses = {}, dailyMinutes = 0 } = {}) {
  if (!responses || typeof responses !== "object") {
    return { error: "Answer the statements before scoring the worksheet." };
  }

  const minutes = Number(dailyMinutes);
  if (!Number.isFinite(minutes)) {
    return { error: "Enter your typical daily chat time as a number of minutes." };
  }
  if (minutes < 0) {
    return { error: "Daily chat time cannot be negative." };
  }
  if (minutes > MINUTES_PER_DAY) {
    return { error: `There are only ${MINUTES_PER_DAY} minutes in a day.` };
  }

  let answered = 0;
  for (const item of REFLECTION_ITEMS) {
    const raw = responses[item.id];
    if (raw === undefined || raw === null || raw === "") continue;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 0 || value > MAX_RESPONSE) {
      return { error: `Each statement needs a rating from 0 to ${MAX_RESPONSE}.` };
    }
    answered += 1;
  }

  if (answered === 0) {
    return { error: "Rate at least one statement to see a score." };
  }

  const dimensions = DIMENSIONS.map((dimension) => {
    const items = REFLECTION_ITEMS.filter((item) => item.dimension === dimension.id);
    let sum = 0;
    let count = 0;
    for (const item of items) {
      const raw = responses[item.id];
      if (raw === undefined || raw === null || raw === "") continue;
      sum += Number(raw);
      count += 1;
    }
    const maxPossible = count * MAX_RESPONSE;
    const percent = maxPossible > 0 ? Math.round((sum / maxPossible) * 100) : 0;
    return { ...dimension, sum, count, maxPossible, percent, rated: count > 0 };
  });

  const rated = dimensions.filter((dimension) => dimension.rated);
  const overall = Math.round(
    rated.reduce((total, dimension) => total + dimension.percent, 0) / rated.length,
  );

  const topDimension = rated.reduce(
    (best, dimension) => (dimension.percent > best.percent ? dimension : best),
    rated[0],
  );

  const weeklyMinutes = minutes * DAYS_PER_WEEK;
  const shareOfWaking = Math.round((minutes / WAKING_MINUTES_PER_DAY) * 1000) / 10;

  return {
    overall,
    band: bandFor(overall),
    dimensions,
    topDimension,
    answered,
    totalItems: REFLECTION_ITEMS.length,
    weeklyMinutes,
    weeklyHours: Math.round((weeklyMinutes / 60) * 10) / 10,
    shareOfWaking,
  };
}
