/**
 * Spaced drinking schedule for older adults.
 *
 * Why a schedule rather than "drink when thirsty"
 * ----------------------------------------------
 * Thirst sensation and renal concentrating ability both decline with age, so an
 * older adult can be measurably dehydrated before feeling thirsty. Geriatric
 * guidance therefore favours small, prompted, routine-linked drinks over
 * thirst-driven intake.
 *
 * Daily target
 * ------------
 * The ESPEN guideline on clinical nutrition and hydration in geriatrics (2019)
 * adopts the EFSA Adequate Intake for water from BEVERAGES as the minimum daily
 * drink intake for older people:
 *
 *     women  1.6 L/day        men  2.0 L/day
 *
 * (These are the beverage figures. EFSA's better-known 2.0 L and 2.5 L are
 * TOTAL water, which includes roughly 20-30% coming from food.)
 *
 * An alternative used in clinical practice is 30 mL per kg of body mass per day,
 * with a floor of 1.5 L/day for small, frail adults.
 *
 * Schedule rules
 * --------------
 *   - Small servings. Large volumes at once are more likely to be voided than
 *     absorbed, and are harder to manage with reduced mobility.
 *   - Stop a couple of hours before bed to limit night waking and fall risk.
 *   - Anchor drinks to meals and medication rounds, which already happen.
 *
 * A prescribed fluid restriction always overrides this calculation.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/* --------------------------------------------------------------- targets -- */

/** EFSA Adequate Intake for water from beverages, adopted by ESPEN (2019) as
 *  the minimum daily drink intake for older adults. */
export const ESPEN_MIN_DRINKS_ML = {
  female: 1600,
  male: 2000,
};

export const SEXES = {
  female: { label: "Woman" },
  male: { label: "Man" },
};

/** Body-weight rule used in clinical nutrition for older adults. */
export const ML_PER_KG_PER_DAY = 30;

/** Floor for the weight-based method, so a very light or frail adult is not
 *  given an implausibly small target. */
export const WEIGHT_METHOD_FLOOR_ML = 1500;

export const BASELINE_METHODS = {
  espen: { label: "ESPEN / EFSA minimum for older adults" },
  weight: { label: "Body weight (30 ml per kg per day)" },
};

/** Ambient heat raises obligatory losses. Practical daily additions. */
export const CLIMATES = {
  temperate: { label: "Temperate or indoors with cooling", extraMl: 0 },
  warm: { label: "Warm spell (28-33 C)", extraMl: 300 },
  hot: { label: "Heatwave (above 33 C)", extraMl: 600 },
};

/* -------------------------------------------------------------- schedule -- */

/** Default and maximum size of one prompted drink. */
export const DEFAULT_SERVING_ML = 200;
export const MIN_SERVING_ML = 80;
export const MAX_SERVING_ML = 300;

/** Stop drinking this many hours before bed to reduce nocturia and night falls. */
export const BEDTIME_CUTOFF_HOURS = 2;

/** A serving is tagged with a meal if it falls within this many minutes of it. */
export const MEAL_MATCH_WINDOW_MIN = 45;

/* ----------------------------------------------------------------- caps --- */

export const MIN_MASS_KG = 30;
export const MAX_MASS_KG = 200;
export const MIN_WAKING_HOURS = 8;
export const MAX_WAKING_HOURS = 20;
export const DAILY_DRINK_CEILING_ML = 3500;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const pad = (value) => String(value).padStart(2, "0");

/**
 * Format a minute-of-day as a 24-hour clock string.
 *
 * @param {number} minuteOfDay
 * @returns {string}
 */
export function formatClock(minuteOfDay) {
  if (!isNum(minuteOfDay)) return "--:--";
  const wrapped = ((Math.round(minuteOfDay) % 1440) + 1440) % 1440;
  return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
}

/**
 * Parse an "HH:MM" clock string into a minute-of-day.
 *
 * @param {string} value
 * @returns {number} minute of day, or NaN
 */
export function parseClock(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
  if (!match) return NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return NaN;
  return hours * 60 + minutes;
}

/**
 * Minutes from wake to bed, wrapping past midnight.
 *
 * @param {number} wakeMinute
 * @param {number} bedMinute
 * @returns {number} minutes awake
 */
export function wakingMinutes(wakeMinute, bedMinute) {
  if (!isNum(wakeMinute) || !isNum(bedMinute)) return NaN;
  const span = bedMinute - wakeMinute;
  return span > 0 ? span : span + 1440;
}

/** Signed distance in minutes between two times of day, shortest way round. */
function clockGap(a, b) {
  const raw = Math.abs(a - b) % 1440;
  return Math.min(raw, 1440 - raw);
}

/**
 * Build the prompted drinking schedule.
 *
 * @param {object} input
 * @param {number} input.drinksMl daily drinks target
 * @param {number} input.wakeMinute
 * @param {number} input.bedMinute
 * @param {number} input.servingMl preferred serving size
 * @param {Array<{ label: string, minute: number }>} [input.meals]
 * @returns {object} schedule, or { error }
 */
export function buildSeniorSchedule({ drinksMl, wakeMinute, bedMinute, servingMl, meals = [] }) {
  if (!isNum(drinksMl) || drinksMl <= 0) return { error: "Nothing to schedule." };
  if (!isNum(wakeMinute) || !isNum(bedMinute)) {
    return { error: "Enter wake-up and bedtime as valid times." };
  }
  if (!isNum(servingMl) || servingMl < MIN_SERVING_ML || servingMl > MAX_SERVING_ML) {
    return { error: `Serving size should be between ${MIN_SERVING_ML} and ${MAX_SERVING_ML} ml.` };
  }

  const awake = wakingMinutes(wakeMinute, bedMinute);
  const awakeHours = awake / 60;
  if (awakeHours < MIN_WAKING_HOURS || awakeHours > MAX_WAKING_HOURS) {
    return {
      error: `Wake-up and bedtime should be ${MIN_WAKING_HOURS} to ${MAX_WAKING_HOURS} hours apart.`,
    };
  }

  const cutoffMinute = bedMinute - BEDTIME_CUTOFF_HOURS * 60;
  const windowMin = Math.max(60, awake - BEDTIME_CUTOFF_HOURS * 60);

  const count = Math.max(1, Math.ceil(drinksMl / servingMl));
  const perServing = drinksMl / count;
  const intervalMin = count > 1 ? windowMin / (count - 1) : 0;

  const servings = [];
  for (let i = 0; i < count; i += 1) {
    const minute = wakeMinute + intervalMin * i;
    let anchor = "";
    let best = MEAL_MATCH_WINDOW_MIN + 1;
    for (const meal of meals) {
      if (!isNum(meal.minute)) continue;
      const gap = clockGap(minute, meal.minute);
      if (gap <= MEAL_MATCH_WINDOW_MIN && gap < best) {
        best = gap;
        anchor = meal.label;
      }
    }
    servings.push({ time: formatClock(minute), ml: perServing, anchor });
  }

  return {
    servings,
    count,
    perServing,
    intervalMin,
    awakeHours,
    cutoffTime: formatClock(cutoffMinute),
  };
}

/**
 * Daily drinks target and schedule for an older adult.
 *
 * @param {object} input
 * @param {"espen"|"weight"} input.baseline
 * @param {"female"|"male"} input.sex
 * @param {number} input.bodyMassKg
 * @param {"temperate"|"warm"|"hot"} input.climate
 * @param {number} [input.prescribedLimitMl] a clinician-set daily fluid restriction
 * @param {number} input.wakeMinute
 * @param {number} input.bedMinute
 * @param {number} input.servingMl
 * @param {Array<{ label: string, minute: number }>} [input.meals]
 * @returns {object} plan, or { error }
 */
export function computeSeniorHydrationPlan({
  baseline,
  sex,
  bodyMassKg,
  climate,
  prescribedLimitMl,
  wakeMinute,
  bedMinute,
  servingMl,
  meals,
}) {
  const climateMeta = CLIMATES[climate];
  if (!climateMeta) return { error: "Choose the current conditions." };

  let baseDrinksMl;
  if (baseline === "weight") {
    if (!isNum(bodyMassKg) || bodyMassKg < MIN_MASS_KG || bodyMassKg > MAX_MASS_KG) {
      return { error: `Enter a weight between ${MIN_MASS_KG} and ${MAX_MASS_KG} kg.` };
    }
    baseDrinksMl = Math.max(WEIGHT_METHOD_FLOOR_ML, bodyMassKg * ML_PER_KG_PER_DAY);
  } else if (baseline === "espen") {
    const minimum = ESPEN_MIN_DRINKS_ML[sex];
    if (!minimum) return { error: "Choose whether the target is for a woman or a man." };
    baseDrinksMl = minimum;
  } else {
    return { error: "Choose a baseline method." };
  }

  const guidanceMl = baseDrinksMl + climateMeta.extraMl;

  let targetMl = guidanceMl;
  let restricted = false;
  if (isNum(prescribedLimitMl) && prescribedLimitMl > 0) {
    if (prescribedLimitMl < 500) {
      return { error: "A prescribed limit below 500 ml a day should come with direct medical supervision — do not plan it here." };
    }
    restricted = true;
    targetMl = Math.min(guidanceMl, prescribedLimitMl);
  }

  const schedule = buildSeniorSchedule({
    drinksMl: targetMl,
    wakeMinute,
    bedMinute,
    servingMl,
    meals,
  });
  if (schedule.error) return schedule;

  return {
    baseDrinksMl,
    climateMl: climateMeta.extraMl,
    guidanceMl,
    targetMl,
    targetL: targetMl / 1000,
    restricted,
    prescribedLimitMl: restricted ? prescribedLimitMl : null,
    /** True when the restriction is the binding constraint, not the guideline. */
    restrictionBinding: restricted && prescribedLimitMl < guidanceMl,
    servings: schedule.servings,
    servingCount: schedule.count,
    servingMl: schedule.perServing,
    intervalMin: schedule.intervalMin,
    awakeHours: schedule.awakeHours,
    cutoffTime: schedule.cutoffTime,
    aboveCeiling: targetMl > DAILY_DRINK_CEILING_ML,
    ceilingMl: DAILY_DRINK_CEILING_ML,
  };
}
