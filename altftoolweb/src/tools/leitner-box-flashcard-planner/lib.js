/**
 * Leitner box planner.
 *
 * The Leitner system (Sebastian Leitner, "So lernt man lernen", 1972) files
 * paper flashcards in numbered boxes. A card answered correctly moves one box
 * up; a card answered wrongly goes back to box 1. Each box is reviewed on its
 * own fixed interval, so the further a card travels the less often you see it.
 *
 * Box n is due on study day d (1-indexed) when
 *     (d - 1 - offset(n)) is a non-negative multiple of interval(n)
 * where offset(n) is 0 when every box starts together, or n - 1 when the boxes
 * are staggered so that they do not all fall due on day one.
 *
 * The long-run daily load is the sum over boxes of cards(n) / interval(n).
 * Everything below is pure: dates come in as ISO strings and are advanced in
 * UTC so daylight-saving shifts cannot move a day.
 */

/** Named interval schedules, in days per box. */
export const PRESETS = {
  doubling: {
    label: "Doubling (1, 2, 4, 8, 16)",
    intervals: [1, 2, 4, 8, 16, 32, 64],
    note: "Classic Leitner spacing: each box waits twice as long as the one below it.",
  },
  expanding: {
    label: "Expanding (1, 3, 7, 14, 30)",
    intervals: [1, 3, 7, 14, 30, 60, 120],
    note: "Slower early, longer tail. Popular for exam vocabulary lists.",
  },
  gentle: {
    label: "Gentle (1, 2, 3, 5, 8, 13)",
    intervals: [1, 2, 3, 5, 8, 13, 21],
    note: "Fibonacci spacing. Smaller jumps, so fewer cards fall back to box one.",
  },
};

export const PRESET_KEYS = Object.keys(PRESETS);

export const MIN_BOXES = 2;
export const MAX_BOXES = 7;
export const MIN_DAYS = 7;
export const MAX_DAYS = 365;
/** A card you have already seen a few times takes a few seconds to check. */
export const MAX_CARDS_PER_BOX = 2000;

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse "YYYY-MM-DD" into a UTC timestamp, or NaN. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return NaN;
  const [year, month, day] = value.split("-").map(Number);
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return NaN;
  }
  return stamp;
}

/** Add whole days to a UTC timestamp and return an ISO date string. */
export function addDays(stamp, days) {
  return new Date(stamp + days * 86400000).toISOString().slice(0, 10);
}

/** Weekday name for a UTC timestamp offset by `days`. */
export function weekdayName(stamp, days) {
  return WEEKDAYS[new Date(stamp + days * 86400000).getUTCDay()];
}

/** Take the first `boxes` intervals of a preset. */
export function intervalsForPreset(preset, boxes) {
  const table = PRESETS[preset] ? PRESETS[preset].intervals : PRESETS.doubling.intervals;
  return table.slice(0, boxes);
}

/**
 * Build the full plan.
 *
 * @param {object} input
 * @param {string} input.startDate     ISO "YYYY-MM-DD"
 * @param {number} input.days          horizon length, MIN_DAYS..MAX_DAYS
 * @param {string} input.preset        key of PRESETS
 * @param {number[]} input.cardsPerBox one entry per box
 * @param {boolean} [input.stagger]    start box n on day n instead of day 1
 * @param {number} [input.cardsPerMinute] review speed, used for the time estimate
 * @returns {object} plan, or { error }
 */
export function buildPlan({
  startDate,
  days,
  preset = "doubling",
  cardsPerBox,
  stagger = true,
  cardsPerMinute = 6,
} = {}) {
  const stamp = parseIsoDate(startDate);
  if (Number.isNaN(stamp)) return { error: "Pick a valid start date." };

  if (!PRESETS[preset]) return { error: "Choose one of the listed box schedules." };

  const horizon = Math.trunc(Number(days));
  if (!Number.isFinite(horizon) || horizon < MIN_DAYS || horizon > MAX_DAYS) {
    return { error: `Plan between ${MIN_DAYS} and ${MAX_DAYS} days.` };
  }

  if (!Array.isArray(cardsPerBox) || cardsPerBox.length < MIN_BOXES || cardsPerBox.length > MAX_BOXES) {
    return { error: `Use between ${MIN_BOXES} and ${MAX_BOXES} boxes.` };
  }

  const counts = cardsPerBox.map((value) => Math.trunc(Number(value)));
  if (counts.some((value) => !Number.isFinite(value) || value < 0)) {
    return { error: "Card counts must be zero or a positive whole number." };
  }
  if (counts.some((value) => value > MAX_CARDS_PER_BOX)) {
    return { error: `Keep each box under ${MAX_CARDS_PER_BOX} cards — split the deck instead.` };
  }
  if (counts.reduce((sum, value) => sum + value, 0) === 0) {
    return { error: "Put at least one card in one of the boxes." };
  }

  const speed = Number(cardsPerMinute);
  if (!Number.isFinite(speed) || speed <= 0 || speed > 120) {
    return { error: "Review speed must be between 1 and 120 cards per minute." };
  }

  const boxes = counts.length;
  const intervals = intervalsForPreset(preset, boxes);
  const offsets = counts.map((_, index) => (stagger ? index : 0));

  const calendar = [];
  let totalReviews = 0;
  let peak = { day: 1, cards: -1 };

  for (let day = 1; day <= horizon; day += 1) {
    const due = [];
    let cards = 0;
    for (let box = 0; box < boxes; box += 1) {
      const since = day - 1 - offsets[box];
      if (since >= 0 && since % intervals[box] === 0) {
        due.push(box + 1);
        cards += counts[box];
      }
    }
    totalReviews += cards;
    if (cards > peak.cards) peak = { day, cards };
    calendar.push({
      day,
      date: addDays(stamp, day - 1),
      weekday: weekdayName(stamp, day - 1),
      boxesDue: due,
      cards,
      minutes: Math.round((cards / speed) * 10) / 10,
    });
  }

  const steadyStatePerDay = counts.reduce((sum, value, index) => sum + value / intervals[index], 0);
  const averagePerDay = totalReviews / horizon;
  const restDays = calendar.filter((row) => row.cards === 0).length;

  return {
    intervals,
    boxes,
    counts,
    calendar,
    totalCards: counts.reduce((sum, value) => sum + value, 0),
    totalReviews,
    averagePerDay: Math.round(averagePerDay * 10) / 10,
    averageMinutes: Math.round((averagePerDay / speed) * 10) / 10,
    peakDay: peak.day,
    peakCards: peak.cards,
    peakMinutes: Math.round((peak.cards / speed) * 10) / 10,
    steadyStatePerDay: Math.round(steadyStatePerDay * 10) / 10,
    restDays,
    presetNote: PRESETS[preset].note,
  };
}

/**
 * How often each box comes round, as a sentence per box.
 * @returns {Array<{box:number,interval:number,cards:number,share:number}>}
 */
export function boxBreakdown(plan) {
  if (!plan || plan.error) return [];
  return plan.counts.map((cards, index) => ({
    box: index + 1,
    interval: plan.intervals[index],
    cards,
    reviewsPerDay: Math.round((cards / plan.intervals[index]) * 100) / 100,
    share: plan.totalCards > 0 ? Math.round((cards / plan.totalCards) * 1000) / 10 : 0,
  }));
}
