/**
 * Per diem (daily allowance) for a business trip.
 *
 * The structure follows how travel policies and government schedules actually work:
 *
 *  - PART DAYS. The day you leave and the day you return are not full days away, so
 *    they are paid at a reduced rate. The US General Services Administration pays 75%
 *    of the meals-and-incidentals rate on the first and last day of travel, and most
 *    corporate policies copy that convention. A single-day trip is treated as one part
 *    day for the same reason.
 *  - LODGING BY NIGHT, MEALS BY DAY. A trip of n calendar days spans n-1 nights, so
 *    lodging is paid per night while meals are paid per day. Mixing the two is the most
 *    common error in a manual claim.
 *  - PROVIDED MEALS ARE DEDUCTED. When a meal is included in a conference fee or a
 *    hotel rate, the corresponding share of the daily rate is deducted. The shares used
 *    here default to 20% breakfast, 30% lunch and 50% dinner, which is a common policy
 *    split; your own policy percentages can be substituted.
 *
 * Tax treatment in India: Section 10(14)(i) of the Income-tax Act, 1961 read with
 * Rule 2BB(1)(b) exempts a daily allowance granted to meet the ordinary daily charges
 * incurred because of absence from the normal place of duty, to the extent the amount is
 * actually incurred for that purpose. So a per diem paid against a genuine tour is not
 * salary; an unspent surplus is. There is no statutory rate — employers set the bands.
 *
 * All dates are supplied by the caller, so the function stays pure and testable.
 */

/** US GSA convention: 75% of the meals rate on the first and last day of travel. */
export const PART_DAY_PERCENT = 75;

/** Common policy split of the daily meals rate between the three meals. */
export const MEAL_SHARES = { breakfast: 20, lunch: 30, dinner: 50 };

/** Longest trip the calculator will total. */
export const MAX_TRIP_DAYS = 366;

/**
 * Typical Indian corporate bands. These are policy figures, not statutory rates —
 * India prescribes no per diem amount. Replace them with your own policy numbers.
 */
export const CITY_TIERS = [
  { key: "metro", label: "Metro (Delhi, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad)", daily: 1200, lodging: 6000 },
  { key: "tier1", label: "Tier 1 (Pune, Ahmedabad, Jaipur, Kochi, Chandigarh)", daily: 1000, lodging: 4500 },
  { key: "tier2", label: "Tier 2 (Indore, Nagpur, Coimbatore, Bhubaneswar)", daily: 800, lodging: 3000 },
  { key: "tier3", label: "Tier 3 and other towns", daily: 600, lodging: 2000 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const DAY_MS = 86400000;

/** Parse an ISO yyyy-mm-dd string as a UTC midnight timestamp, or NaN. */
function parseIsoDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return NaN;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  // Rejects 2026-02-30 and similar, which Date.UTC would silently roll forward.
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return NaN;
  return stamp;
}

/**
 * Inclusive calendar days between two ISO dates, and the nights they span.
 *
 * @param {string} startDate yyyy-mm-dd
 * @param {string} endDate   yyyy-mm-dd
 * @returns {{days: number, nights: number}|{error: string}}
 */
export function tripLength(startDate, endDate) {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (Number.isNaN(start)) return { error: "Enter a valid departure date." };
  if (Number.isNaN(end)) return { error: "Enter a valid return date." };
  if (end < start) return { error: "The return date cannot be before the departure date." };
  const days = Math.round((end - start) / DAY_MS) + 1;
  if (days > MAX_TRIP_DAYS) return { error: `A single claim cannot span more than ${MAX_TRIP_DAYS} days.` };
  return { days, nights: days - 1 };
}

/**
 * Total a per diem claim.
 *
 * @param {object} input
 * @param {string} input.startDate        yyyy-mm-dd departure date.
 * @param {string} input.endDate          yyyy-mm-dd return date.
 * @param {number} input.dailyRate        Meals and incidentals per full day.
 * @param {number} [input.lodgingRate]    Lodging per night; 0 if the company books hotels directly.
 * @param {number} [input.partDayPercent] Percentage paid on the first and last day.
 * @param {{breakfast?: number, lunch?: number, dinner?: number}} [input.mealsProvided] Counts of meals already provided.
 * @param {{breakfast?: number, lunch?: number, dinner?: number}} [input.mealShares] Percent of the daily rate each meal represents.
 * @param {number} [input.incidentals]    One-off extras such as visa or airport fees.
 * @param {number} [input.advance]        Advance already paid to the traveller.
 * @returns {object} the claim, or { error }.
 */
export function computePerDiem({
  startDate,
  endDate,
  dailyRate,
  lodgingRate = 0,
  partDayPercent = PART_DAY_PERCENT,
  mealsProvided = {},
  mealShares = MEAL_SHARES,
  incidentals = 0,
  advance = 0,
} = {}) {
  const span = tripLength(startDate, endDate);
  if (span.error) return { error: span.error };

  if (!isNum(dailyRate) || dailyRate < 0) return { error: "Enter a daily rate of zero or more." };
  if (!isNum(lodgingRate) || lodgingRate < 0) return { error: "Enter a lodging rate of zero or more." };
  if (!isNum(partDayPercent) || partDayPercent < 0 || partDayPercent > 100) {
    return { error: "The part-day percentage must be between 0 and 100." };
  }
  if (!isNum(incidentals) || incidentals < 0) return { error: "Incidentals cannot be negative." };
  if (!isNum(advance) || advance < 0) return { error: "The advance paid cannot be negative." };

  const { days, nights } = span;
  const partDays = days === 1 ? 1 : 2;
  const fullDays = Math.max(0, days - partDays);

  const fullDayAmount = round2(fullDays * dailyRate);
  const partDayAmount = round2(partDays * dailyRate * (partDayPercent / 100));
  const mealsGross = round2(fullDayAmount + partDayAmount);

  const shares = { ...MEAL_SHARES, ...mealShares };
  const counts = {
    breakfast: Math.max(0, Math.floor(Number(mealsProvided.breakfast) || 0)),
    lunch: Math.max(0, Math.floor(Number(mealsProvided.lunch) || 0)),
    dinner: Math.max(0, Math.floor(Number(mealsProvided.dinner) || 0)),
  };
  for (const key of ["breakfast", "lunch", "dinner"]) {
    const share = shares[key];
    if (!isNum(share) || share < 0 || share > 100) {
      return { error: "Each meal share must be a percentage between 0 and 100." };
    }
    if (counts[key] > days) {
      return { error: `You cannot have more ${key}s provided than the ${days} days of the trip.` };
    }
  }

  const rawDeduction = round2(
    dailyRate *
      ((counts.breakfast * shares.breakfast +
        counts.lunch * shares.lunch +
        counts.dinner * shares.dinner) /
        100),
  );
  // A deduction can never exceed the meals allowance itself.
  const mealDeduction = Math.min(rawDeduction, mealsGross);
  const mealsNet = round2(mealsGross - mealDeduction);

  const lodgingAmount = round2(nights * lodgingRate);
  const total = round2(mealsNet + lodgingAmount + incidentals);
  const balance = round2(total - advance);

  return {
    days,
    nights,
    fullDays,
    partDays,
    partDayPercent,
    fullDayAmount,
    partDayAmount,
    mealsGross,
    mealDeduction,
    /** Set when provided meals would have wiped out more than the allowance itself. */
    deductionCapped: rawDeduction > mealsGross,
    mealsNet,
    lodgingAmount,
    incidentals: round2(incidentals),
    total,
    advance: round2(advance),
    balance,
    /** Positive = pay the traveller; negative = the traveller returns this much. */
    dueToTraveller: balance > 0 ? balance : 0,
    dueFromTraveller: balance < 0 ? round2(-balance) : 0,
    /** Blended payout per calendar day, everything included. */
    averagePerDay: days > 0 ? round2(total / days) : 0,
    mealsProvided: counts,
  };
}
