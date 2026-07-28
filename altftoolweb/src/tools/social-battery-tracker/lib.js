/**
 * Social battery tracker.
 *
 * IMPORTANT about the model: "social battery" is a self-management metaphor, not
 * a measured physiological quantity. The numbers here are an explicit, consistent
 * budgeting scheme so that two different weeks can be compared on the same scale -
 * they are not clinical measurements and no unit corresponds to anything in the body.
 *
 * What the scheme is built on:
 *   - A fixed weekly budget of 100 battery units, so a week can be read as a
 *     percentage that is comparable with any other week.
 *   - A drain rate per hour for each kind of social contact, ordered by how much
 *     self-monitoring it demands: one-to-one with someone close is the cheapest,
 *     public speaking and large unfamiliar groups the most expensive.
 *   - A disposition multiplier on the introversion-extraversion dimension, the one
 *     personality trait most consistently linked to how stimulating social contact
 *     feels. Level 4 is neutral and leaves costs unchanged.
 *   - An enjoyment multiplier, because an obligation costs more than the same
 *     hours with people you actually want to see.
 *   - Alone time and low-key contact restore units at their own hourly rate.
 *
 * Every rate below is a named constant so it can be argued with rather than hidden.
 */

/** One week's budget, in battery units. */
export const WEEKLY_CAPACITY = 100;
/** Even spread of the weekly budget across seven days. */
export const DAILY_SAFE_LOAD = WEEKLY_CAPACITY / 7;

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const MIN_HOURS = 0.25;
export const MAX_HOURS = 16;

/** Battery units per hour. Negative rates restore the battery. */
export const EVENT_TYPES = {
  oneToOne: { key: "oneToOne", label: "One-to-one with someone close", drainPerHour: 3, kind: "social" },
  smallGroup: { key: "smallGroup", label: "Small group of people you know (3-6)", drainPerHour: 6, kind: "social" },
  phoneCall: { key: "phoneCall", label: "Phone call", drainPerHour: 5, kind: "social" },
  videoCall: { key: "videoCall", label: "Video call", drainPerHour: 7, kind: "social" },
  family: { key: "family", label: "Family gathering", drainPerHour: 8, kind: "social" },
  workMeeting: { key: "workMeeting", label: "Work meeting or networking", drainPerHour: 9, kind: "social" },
  largeGroup: { key: "largeGroup", label: "Large group, party or unfamiliar crowd", drainPerHour: 10, kind: "social" },
  performance: { key: "performance", label: "Public speaking or performing", drainPerHour: 14, kind: "social" },
  aloneQuiet: { key: "aloneQuiet", label: "Alone and quiet (recovery)", drainPerHour: -8, kind: "recovery" },
  lowKey: { key: "lowKey", label: "Low-key time with one trusted person (recovery)", drainPerHour: -3, kind: "recovery" },
};

/** 1 = strongly introverted, 4 = neutral, 7 = strongly extraverted. */
export const DISPOSITION_STEP = 0.15;
export const DISPOSITION_NEUTRAL = 4;
export const DISPOSITION_LEVELS = [
  { value: 1, label: "Strongly introverted" },
  { value: 2, label: "Introverted" },
  { value: 3, label: "Leans introverted" },
  { value: 4, label: "Balanced" },
  { value: 5, label: "Leans extraverted" },
  { value: 6, label: "Extraverted" },
  { value: 7, label: "Strongly extraverted" },
];

/** 1 = pure obligation, 3 = neutral, 5 = genuinely looked forward to. */
export const ENJOYMENT_STEP = 0.2;
export const ENJOYMENT_NEUTRAL = 3;
export const ENJOYMENT_LEVELS = [
  { value: 1, label: "Obligation, dreading it" },
  { value: 2, label: "Would rather not" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Happy to go" },
  { value: 5, label: "Genuinely looking forward to it" },
];

/** How many battery units one hour of quiet alone time restores. */
export const RECOVERY_PER_HOUR = Math.abs(EVENT_TYPES.aloneQuiet.drainPerHour);

export const STATUS_BANDS = [
  { key: "full", label: "Plenty in reserve", min: 70, advice: "There is room for something extra this week if you want it." },
  { key: "steady", label: "Comfortable", min: 45, advice: "A sustainable week. Keep the recovery blocks you have planned." },
  { key: "stretched", label: "Stretched", min: 20, advice: "Protect the alone time you have and decline anything new." },
  { key: "depleted", label: "Running on empty", min: 1, advice: "Cancel or shorten one thing and add a real recovery block before the heaviest day." },
  { key: "overdrawn", label: "Overdrawn", min: 0, advice: "This week is booked past the budget. Something has to move, not just be endured." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/** Multiplier from disposition. Neutral (4) returns exactly 1. */
export function dispositionFactor(level) {
  if (!isNum(level)) return null;
  return round2(1 + (DISPOSITION_NEUTRAL - level) * DISPOSITION_STEP);
}

/** Multiplier from how much you want to be there. Neutral (3) returns exactly 1. */
export function enjoymentFactor(level) {
  if (!isNum(level)) return null;
  return round2(1 + (ENJOYMENT_NEUTRAL - level) * ENJOYMENT_STEP);
}

/**
 * Battery cost of one entry. Positive drains, negative restores.
 * Disposition and enjoyment only scale social contact; recovery restores at its
 * flat rate for everyone.
 */
export function eventCost(event, disposition = DISPOSITION_NEUTRAL) {
  if (!event || typeof event !== "object") return { error: "Each entry needs a type and a length." };
  const type = EVENT_TYPES[event.type];
  if (!type) return { error: "Choose one of the listed activity types." };
  if (!isNum(event.hours)) return { error: "Enter the length in hours as a number." };
  if (event.hours < MIN_HOURS || event.hours > MAX_HOURS) {
    return { error: `Length should be between ${MIN_HOURS} and ${MAX_HOURS} hours.` };
  }
  if (!DAYS.includes(event.day)) return { error: "Pick a day of the week." };

  if (type.kind === "recovery") {
    return { cost: round1(type.drainPerHour * event.hours), kind: "recovery", typeLabel: type.label };
  }

  const dFactor = dispositionFactor(disposition);
  const eFactor = enjoymentFactor(isNum(event.enjoyment) ? event.enjoyment : ENJOYMENT_NEUTRAL);
  if (dFactor === null || eFactor === null) return { error: "Disposition and enjoyment must be numbers." };

  return {
    cost: round1(type.drainPerHour * event.hours * dFactor * eFactor),
    kind: "social",
    typeLabel: type.label,
    dispositionFactor: dFactor,
    enjoymentFactor: eFactor,
  };
}

export function bandForBattery(remaining) {
  if (!isNum(remaining)) return null;
  return STATUS_BANDS.find((band) => remaining >= band.min) || STATUS_BANDS[STATUS_BANDS.length - 1];
}

/**
 * Roll a week of entries into a battery reading.
 *
 * @param {object} input
 * @param {Array} input.events      entries of { day, type, hours, enjoyment, label }
 * @param {number} input.disposition 1-7 introversion-extraversion level
 */
export function planWeek({ events = [], disposition = DISPOSITION_NEUTRAL } = {}) {
  if (!Array.isArray(events)) return { error: "Pass the week's entries as a list." };
  if (!isNum(disposition) || disposition < 1 || disposition > 7) {
    return { error: "Pick a disposition level between 1 and 7." };
  }

  const perDay = DAYS.map((day) => ({ day, drain: 0, recovery: 0, net: 0, entries: 0 }));
  const priced = [];
  let totalDrain = 0;
  let totalRecovery = 0;
  let recoveryHours = 0;
  let socialHours = 0;
  let firstError = null;

  events.forEach((event) => {
    const result = eventCost(event, disposition);
    if (result.error) {
      if (!firstError) firstError = result.error;
      return;
    }
    const bucket = perDay[DAYS.indexOf(event.day)];
    bucket.entries += 1;
    if (result.cost >= 0) {
      bucket.drain += result.cost;
      totalDrain += result.cost;
      socialHours += event.hours;
    } else {
      bucket.recovery += -result.cost;
      totalRecovery += -result.cost;
      recoveryHours += event.hours;
    }
    priced.push({ ...event, ...result });
  });

  if (firstError && priced.length === 0) return { error: firstError };

  perDay.forEach((bucket) => {
    bucket.drain = round1(bucket.drain);
    bucket.recovery = round1(bucket.recovery);
    bucket.net = round1(bucket.drain - bucket.recovery);
    bucket.overSafeLoad = bucket.net > DAILY_SAFE_LOAD;
  });

  totalDrain = round1(totalDrain);
  totalRecovery = round1(totalRecovery);
  const netLoad = round1(totalDrain - totalRecovery);
  const rawRemaining = WEEKLY_CAPACITY - netLoad;
  const remaining = round1(Math.min(WEEKLY_CAPACITY, Math.max(0, rawRemaining)));
  const band = bandForBattery(remaining);

  // Hours of quiet alone time that would offset everything logged as draining.
  const recoveryNeededHours = round1(totalDrain / RECOVERY_PER_HOUR);
  const recoveryDebtHours = round1(Math.max(0, recoveryNeededHours - recoveryHours));

  const heaviest = perDay.reduce((a, b) => (b.net > a.net ? b : a), perDay[0]);
  const heavyDays = perDay.filter((bucket) => bucket.overSafeLoad);
  const emptyDays = perDay.filter((bucket) => bucket.entries === 0).map((bucket) => bucket.day);

  return {
    perDay,
    priced,
    totalDrain,
    totalRecovery,
    netLoad,
    remaining,
    overdrawnBy: round1(Math.max(0, netLoad - WEEKLY_CAPACITY)),
    percentUsed: Math.max(0, Math.min(100, Math.round((netLoad / WEEKLY_CAPACITY) * 100))),
    capacity: WEEKLY_CAPACITY,
    bandKey: band.key,
    bandLabel: band.label,
    bandAdvice: band.advice,
    socialHours: round1(socialHours),
    recoveryHours: round1(recoveryHours),
    recoveryNeededHours,
    recoveryDebtHours,
    heaviestDay: heaviest.net > 0 ? heaviest.day : null,
    heaviestDayNet: heaviest.net,
    heavyDayCount: heavyDays.length,
    heavyDays: heavyDays.map((bucket) => bucket.day),
    emptyDays,
    dailySafeLoad: round1(DAILY_SAFE_LOAD),
    entryCount: priced.length,
    skippedCount: events.length - priced.length,
    skippedReason: firstError,
  };
}
