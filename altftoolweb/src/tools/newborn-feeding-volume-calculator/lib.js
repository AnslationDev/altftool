/**
 * Newborn feeding volume estimator (informational).
 *
 * Two well-established paediatric rules are combined here.
 *
 * 1. Daily fluid requirement in the first week ramps up day by day. The standard
 *    neonatal ramp for a healthy term baby is roughly:
 *      day 1  60 mL/kg/day
 *      day 2  80
 *      day 3  100
 *      day 4  120
 *      day 5  140
 *      day 6  150
 *      day 7  150-160
 *    After the first week a term infant under six months is usually fed about
 *    150 mL/kg/day, with a normal working range of about 120-180 mL/kg/day.
 *
 * 2. Per-feed volume is simply the daily volume divided by the number of feeds:
 *      per feed = (weight in kg x mL/kg/day) / feeds per day
 *
 * Two sanity checks are layered on top:
 *  - Newborn stomach capacity grows fast in the first month (about 5-7 mL on day 1,
 *    22-27 mL on day 3, 45-60 mL on day 7 and 80-150 mL by one month). A per-feed
 *    figure well above that band means the feeds are too few or too large.
 *  - The AAP notes that formula-fed infants under six months rarely need more than
 *    about 960 mL (32 fl oz) of formula in 24 hours, so the daily figure is capped
 *    at that and flagged.
 *
 * This is an estimate for planning and discussion. Preterm babies, babies with
 * reflux, cardiac or renal conditions, and any baby with poor weight gain are fed
 * to a plan set by a paediatrician or neonatal team — not by this formula.
 */

/** Standard neonatal fluid ramp, mL/kg/day, indexed by day of life 1-7. */
export const FIRST_WEEK_ML_PER_KG = [60, 80, 100, 120, 140, 150, 150];

/** Usual maintenance intake for a term infant under six months, mL/kg/day. */
export const MAINTENANCE_ML_PER_KG = 150;

/** Working range quoted for term infants past the first week, mL/kg/day. */
export const RANGE_LOW_ML_PER_KG = 120;
export const RANGE_HIGH_ML_PER_KG = 180;

/** Width of the band shown around the first-week ramp value, mL/kg/day. */
export const FIRST_WEEK_BAND_ML_PER_KG = 10;

/** AAP: formula-fed infants under six months rarely need more than 32 fl oz a day. */
export const MAX_DAILY_ML_UNDER_6M = 960;
export const SIX_MONTHS_IN_DAYS = 180;

/** 1 US fluid ounce in millilitres. */
export const ML_PER_FL_OZ = 29.5735;

/** Accepted input ranges. */
export const MIN_WEIGHT_KG = 1;
export const MAX_WEIGHT_KG = 12;
export const MIN_DAY_OF_LIFE = 1;
export const MAX_DAY_OF_LIFE = 365;
export const MIN_FEEDS_PER_DAY = 4;
export const MAX_FEEDS_PER_DAY = 14;

/** Reference stomach capacity anchors: [day of life, low mL, high mL]. */
export const STOMACH_CAPACITY_ANCHORS = [
  [1, 5, 7],
  [3, 22, 27],
  [7, 45, 60],
  [30, 80, 150],
];

/**
 * Interpolated stomach capacity band for a given day of life.
 * @param {number} day day of life, 1 = day of birth
 * @returns {{low: number, high: number}|null}
 */
export function stomachCapacityForDay(day) {
  if (!Number.isFinite(day) || day < 1) return null;
  const anchors = STOMACH_CAPACITY_ANCHORS;
  if (day <= anchors[0][0]) return { low: anchors[0][1], high: anchors[0][2] };
  const lastAnchor = anchors[anchors.length - 1];
  if (day >= lastAnchor[0]) return { low: lastAnchor[1], high: lastAnchor[2] };
  for (let i = 1; i < anchors.length; i += 1) {
    const [prevDay, prevLow, prevHigh] = anchors[i - 1];
    const [nextDay, nextLow, nextHigh] = anchors[i];
    if (day <= nextDay) {
      const t = (day - prevDay) / (nextDay - prevDay);
      return {
        low: prevLow + (nextLow - prevLow) * t,
        high: prevHigh + (nextHigh - prevHigh) * t,
      };
    }
  }
  return { low: lastAnchor[1], high: lastAnchor[2] };
}

/**
 * mL/kg/day appropriate for a day of life on the standard ramp.
 * @param {number} day day of life, 1 = day of birth
 */
export function mlPerKgForDay(day) {
  if (!Number.isFinite(day) || day < 1) return MAINTENANCE_ML_PER_KG;
  if (day <= FIRST_WEEK_ML_PER_KG.length) return FIRST_WEEK_ML_PER_KG[Math.floor(day) - 1];
  return MAINTENANCE_ML_PER_KG;
}

export function mlToOz(ml) {
  return Number.isFinite(ml) ? ml / ML_PER_FL_OZ : 0;
}

/**
 * @param {object} input
 * @param {number} input.weightKg     Current weight in kilograms.
 * @param {number} input.dayOfLife    Day of life, 1 = day of birth.
 * @param {number} input.feedsPerDay  Number of feeds in 24 hours.
 * @param {number|null} [input.mlPerKgOverride] Optional prescribed mL/kg/day.
 * @returns {object} estimate, or { error }
 */
export function estimateFeedVolume({
  weightKg,
  dayOfLife,
  feedsPerDay,
  mlPerKgOverride = null,
} = {}) {
  const nums = [weightKg, dayOfLife, feedsPerDay];
  if (nums.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter valid numbers for weight, day of life and feeds per day." };
  }
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Weight must be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (
    !Number.isFinite(dayOfLife) ||
    dayOfLife < MIN_DAY_OF_LIFE ||
    dayOfLife > MAX_DAY_OF_LIFE
  ) {
    return {
      error: `Day of life must be between ${MIN_DAY_OF_LIFE} and ${MAX_DAY_OF_LIFE} (1 = the day of birth).`,
    };
  }
  if (feedsPerDay < MIN_FEEDS_PER_DAY || feedsPerDay > MAX_FEEDS_PER_DAY) {
    return {
      error: `Feeds per day must be between ${MIN_FEEDS_PER_DAY} and ${MAX_FEEDS_PER_DAY}.`,
    };
  }
  if (mlPerKgOverride !== null && mlPerKgOverride !== undefined && mlPerKgOverride !== "") {
    if (!Number.isFinite(mlPerKgOverride) || mlPerKgOverride < 40 || mlPerKgOverride > 220) {
      return { error: "A prescribed intake must be between 40 and 220 mL/kg/day." };
    }
  }

  const day = Math.floor(dayOfLife);
  const usingOverride = Number.isFinite(mlPerKgOverride) && mlPerKgOverride > 0;
  const mlPerKg = usingOverride ? mlPerKgOverride : mlPerKgForDay(day);

  const firstWeek = day <= FIRST_WEEK_ML_PER_KG.length;
  const rampValue = mlPerKgForDay(day);
  const lowPerKg = usingOverride
    ? mlPerKg
    : firstWeek
      ? Math.max(0, rampValue - FIRST_WEEK_BAND_ML_PER_KG)
      : RANGE_LOW_ML_PER_KG;
  const highPerKg = usingOverride
    ? mlPerKg
    : firstWeek
      ? rampValue + FIRST_WEEK_BAND_ML_PER_KG
      : RANGE_HIGH_ML_PER_KG;

  const rawDailyMl = weightKg * mlPerKg;
  const capApplies = day < SIX_MONTHS_IN_DAYS && rawDailyMl > MAX_DAILY_ML_UNDER_6M;
  const dailyMl = capApplies ? MAX_DAILY_ML_UNDER_6M : rawDailyMl;

  const perFeedMl = dailyMl / feedsPerDay;
  const dailyLowMl = weightKg * lowPerKg;
  const dailyHighMl = weightKg * highPerKg;

  const capacity = stomachCapacityForDay(day);
  const aboveCapacity = capacity ? perFeedMl > capacity.high : false;
  const belowCapacity = capacity ? perFeedMl < capacity.low : false;

  return {
    weightKg,
    dayOfLife: day,
    feedsPerDay,
    mlPerKg,
    usingOverride,
    firstWeek,
    dailyMl,
    rawDailyMl,
    capApplies,
    dailyOz: mlToOz(dailyMl),
    perFeedMl,
    perFeedOz: mlToOz(perFeedMl),
    dailyLowMl,
    dailyHighMl,
    perFeedLowMl: dailyLowMl / feedsPerDay,
    perFeedHighMl: dailyHighMl / feedsPerDay,
    lowPerKg,
    highPerKg,
    hoursBetweenFeeds: 24 / feedsPerDay,
    capacityLowMl: capacity ? capacity.low : null,
    capacityHighMl: capacity ? capacity.high : null,
    aboveCapacity,
    belowCapacity,
  };
}
