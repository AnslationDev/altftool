/**
 * Period date shift planner.
 *
 * Projects future period start dates from the last known day 1 and an average
 * cycle length (start of one period to the start of the next), then measures
 * how those predicted bleeding windows overlap a planned event: a trip, an exam
 * block, a wedding, a race.
 *
 * Prediction rule (the same arithmetic every calendar-method tracker uses):
 *   period n starts on lastPeriodStart + n x averageCycleLength days
 *   period n bleeds from that day for periodLengthDays days, inclusive
 *
 * Overlap is measured in whole days on inclusive date ranges. Everything is
 * pure: dates arrive as YYYY-MM-DD strings and are parsed at UTC midnight so
 * daylight saving cannot move a day boundary. Nothing here reads the clock.
 *
 * Predictions are calendar arithmetic, not biology — cycles vary, and stress,
 * illness, travel and hormonal contraception all move dates. Deliberately
 * delaying a period needs prescribed medication and a conversation with a
 * clinician; this tool only shows the clash, never how to move it.
 */

/** Milliseconds in one day. */
export const MS_PER_DAY = 86400000;

/**
 * Typical cycle lengths. A regular adult cycle is usually described as 21 to 35
 * days; the wider window here simply avoids rejecting real outliers.
 */
export const LIMITS = {
  cycleLength: { min: 20, max: 45 },
  periodLength: { min: 1, max: 10 },
  cyclesAhead: { min: 1, max: 12 },
  eventLength: { min: 1, max: 90 },
  horizonDays: { min: 1, max: 540 },
};

/** Commonly quoted regular-cycle window, used only for the informational flag. */
export const REGULAR_CYCLE_RANGE = { min: 21, max: 35 };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parse a YYYY-MM-DD string into UTC-midnight milliseconds, or null. */
export function parseDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return ms;
}

/** Format a UTC-midnight timestamp back to YYYY-MM-DD. */
export function formatDate(ms) {
  if (!Number.isFinite(ms)) return "";
  return new Date(ms).toISOString().slice(0, 10);
}

/** Add whole days to a UTC-midnight timestamp. */
export function addDays(ms, days) {
  if (!Number.isFinite(ms) || !Number.isFinite(days)) return NaN;
  return ms + days * MS_PER_DAY;
}

/** Whole days from one UTC-midnight timestamp to another. */
export function daysBetween(startMs, endMs) {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return NaN;
  return Math.round((endMs - startMs) / MS_PER_DAY);
}

/**
 * Whole days of overlap between two inclusive date ranges.
 * Returns 0 when they do not touch.
 */
export function overlapDays(aStart, aEnd, bStart, bEnd) {
  if (![aStart, aEnd, bStart, bEnd].every(Number.isFinite)) return 0;
  const start = Math.max(aStart, bStart);
  const end = Math.min(aEnd, bEnd);
  if (end < start) return 0;
  return daysBetween(start, end) + 1;
}

/**
 * Plan a set of predicted periods against an event window.
 *
 * @param {object} input
 * @param {string} input.lastPeriodStart YYYY-MM-DD, day 1 of the most recent period.
 * @param {number} input.cycleLength     average days from one period start to the next.
 * @param {number} input.periodLength    days of bleeding, inclusive of day 1.
 * @param {string} input.eventStart      YYYY-MM-DD.
 * @param {string} input.eventEnd        YYYY-MM-DD, same as start for a single day.
 * @param {number} [input.cyclesAhead]   how many predicted cycles to list.
 * @returns {{error:string}|object} plain result object, never NaN or Infinity.
 */
export function planPeriodShift({
  lastPeriodStart,
  cycleLength,
  periodLength,
  eventStart,
  eventEnd,
  cyclesAhead = 6,
} = {}) {
  const last = parseDate(lastPeriodStart);
  if (last === null) return { error: "Enter a valid date for the first day of your last period." };

  const start = parseDate(eventStart);
  if (start === null) return { error: "Enter a valid event start date." };

  const end = parseDate(eventEnd);
  if (end === null) return { error: "Enter a valid event end date." };

  if (end < start) return { error: "The event cannot end before it starts." };

  if (!Number.isFinite(cycleLength) || !Number.isFinite(periodLength) || !Number.isFinite(cyclesAhead)) {
    return { error: "Enter a valid number for cycle length, period length and cycles ahead." };
  }
  if (cycleLength < LIMITS.cycleLength.min || cycleLength > LIMITS.cycleLength.max) {
    return {
      error: `Average cycle length should be between ${LIMITS.cycleLength.min} and ${LIMITS.cycleLength.max} days.`,
    };
  }
  if (periodLength < LIMITS.periodLength.min || periodLength > LIMITS.periodLength.max) {
    return {
      error: `Period length should be between ${LIMITS.periodLength.min} and ${LIMITS.periodLength.max} days.`,
    };
  }
  if (periodLength > cycleLength) {
    return { error: "Period length cannot be longer than the whole cycle." };
  }
  if (cyclesAhead < LIMITS.cyclesAhead.min || cyclesAhead > LIMITS.cyclesAhead.max) {
    return {
      error: `Cycles to project should be between ${LIMITS.cyclesAhead.min} and ${LIMITS.cyclesAhead.max}.`,
    };
  }

  const eventDays = daysBetween(start, end) + 1;
  if (eventDays > LIMITS.eventLength.max) {
    return { error: `Events longer than ${LIMITS.eventLength.max} days are outside this planner.` };
  }
  if (start < last) {
    return { error: "The event starts before your last period — enter a more recent period date." };
  }

  const horizon = daysBetween(last, end);
  if (horizon > LIMITS.horizonDays.max) {
    return {
      error: `That event is ${horizon} days after your last period, too far ahead for calendar prediction to mean anything.`,
    };
  }

  const cycles = Math.round(cyclesAhead);
  const periods = [];
  let totalOverlap = 0;
  let firstClash = null;

  for (let n = 1; n <= cycles; n += 1) {
    const periodStart = addDays(last, n * cycleLength);
    const periodEnd = addDays(periodStart, periodLength - 1);
    const overlap = overlapDays(periodStart, periodEnd, start, end);
    totalOverlap += overlap;

    const entry = {
      cycle: n,
      startDate: formatDate(periodStart),
      endDate: formatDate(periodEnd),
      overlapDays: overlap,
      clashes: overlap > 0,
      daysBeforeEvent: daysBetween(periodEnd, start),
      startMs: periodStart,
      endMs: periodEnd,
    };
    periods.push(entry);
    if (overlap > 0 && firstClash === null) firstClash = entry;
  }

  // Cycle day on the first day of the event.
  const daysSinceLast = daysBetween(last, start);
  const cycleDayAtEvent = (daysSinceLast % cycleLength) + 1;

  let shiftEarlierDays = 0;
  let shiftLaterDays = 0;
  if (firstClash) {
    // Move the period so it finishes the day before the event starts.
    const latestClearStart = addDays(start, -periodLength);
    shiftEarlierDays = Math.max(0, daysBetween(latestClearStart, firstClash.startMs));
    // Or move it so it begins the day after the event ends.
    const earliestClearStart = addDays(end, 1);
    shiftLaterDays = Math.max(0, daysBetween(firstClash.startMs, earliestClearStart));
  }

  const nextPeriod = periods.length > 0 ? periods[0] : null;

  return {
    eventDays,
    eventStart: formatDate(start),
    eventEnd: formatDate(end),
    lastPeriodStart: formatDate(last),
    periods,
    totalOverlap,
    clashCount: periods.filter((item) => item.clashes).length,
    firstClash,
    shiftEarlierDays,
    shiftLaterDays,
    cycleDayAtEvent,
    daysUntilEvent: daysSinceLast,
    nextPeriodDate: nextPeriod ? nextPeriod.startDate : "",
    fullyCovered: firstClash ? totalOverlap >= eventDays : false,
    regularCycle:
      cycleLength >= REGULAR_CYCLE_RANGE.min && cycleLength <= REGULAR_CYCLE_RANGE.max,
  };
}
