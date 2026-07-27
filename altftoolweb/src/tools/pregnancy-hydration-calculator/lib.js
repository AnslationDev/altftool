/**
 * Pregnancy hydration target and drinking schedule.
 *
 * Baseline
 * --------
 * EFSA's 2010 Scientific Opinion on Dietary Reference Values for water sets an
 * Adequate Intake of TOTAL water (food plus drinks) of 2.0 L/day for adult
 * women, and adds 300 mL/day for pregnancy. An alternative baseline used in
 * clinical nutrition is 30-35 mL per kg of body mass per day.
 *
 * Trimester adjustment
 * --------------------
 * EFSA's +300 mL is a flat figure for the whole of pregnancy, but water needs
 * track energy needs, and energy needs do not. This module derives the trimester
 * increment from the additional energy requirement of pregnancy -
 * approximately +70 kcal/day in the first trimester, +260 in the second and
 * +500 in the third (Institute of Medicine, Dietary Reference Intakes for
 * Energy, 2005) - converted at the IOM's water-to-energy ratio of about
 * 1 mL of water per kcal.
 *
 * The three increments average (70 + 260 + 500) / 3 = 277 mL/day, which lands on
 * EFSA's flat +300 mL, so the ramp is consistent with the published figure while
 * being more useful week to week.
 *
 * Total water -> drinks
 * ---------------------
 * EFSA notes roughly 20-30% of total water intake comes from food in European
 * diets. This module uses the conservative 20%, so the drinks target is 80% of
 * the total-water target.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/* ------------------------------------------------------------- baselines -- */

/** EFSA 2010 Adequate Intake, total water, adult women. */
export const EFSA_ADULT_WOMAN_TOTAL_WATER_ML = 2000;

/** Clinical body-weight rule for adults: 30-35 mL/kg/day. Midpoint-high used. */
export const ML_PER_KG_PER_DAY = 35;

export const BASELINE_METHODS = {
  efsa: { label: "EFSA adequate intake (2.0 L/day)", key: "efsa" },
  weight: { label: "Body weight (35 ml per kg per day)", key: "weight" },
};

/* ------------------------------------------------------------ trimesters -- */

/** Extra daily energy requirement of pregnancy (IOM 2005), converted to water
 *  at the IOM ratio of ~1 mL per kcal. */
export const TRIMESTERS = {
  first: { label: "First trimester (weeks 1-13)", extraKcal: 70, extraMl: 70 },
  second: { label: "Second trimester (weeks 14-27)", extraKcal: 260, extraMl: 260 },
  third: { label: "Third trimester (weeks 28-birth)", extraKcal: 500, extraMl: 500 },
};

/** EFSA's flat pregnancy increment, shown for comparison. */
export const EFSA_PREGNANCY_INCREMENT_ML = 300;

/* ----------------------------------------------------------- adjustments -- */

/** Ambient heat raises obligatory water loss through sweat and breathing.
 *  EFSA notes intakes must rise in hot climates; these are practical daily
 *  additions rather than a measured sweat rate. */
export const CLIMATES = {
  temperate: { label: "Temperate / air-conditioned", extraMl: 0 },
  warm: { label: "Warm (28-33 C)", extraMl: 300 },
  hot: { label: "Hot or humid (above 33 C)", extraMl: 600 },
};

/** Moderate activity sweat rate used to price exercise minutes: 0.6 L/h,
 *  i.e. 10 mL per minute. Vigorous exertion is not appropriate to model here. */
export const SWEAT_ML_PER_ACTIVE_MINUTE = 10;

/** Share of total water that comes from food (EFSA: roughly 20-30%). */
export const FOOD_WATER_SHARE = 0.2;

/* -------------------------------------------------------------- schedule -- */

/** A comfortable single serving. Larger volumes at once are more likely to be
 *  passed straight through rather than absorbed. */
export const SERVING_ML = 250;

/** Stop the schedule this many hours before bed to reduce night waking, which
 *  is already frequent in later pregnancy. */
export const BEDTIME_CUTOFF_HOURS = 2;

/* ----------------------------------------------------------------- caps --- */

/** Healthy kidneys clear roughly 0.8-1.0 L of free water per hour; sustained
 *  intakes far above daily need risk diluting blood sodium. 4 L/day of drinks
 *  is the point at which this tool stops and tells you to ask a clinician. */
export const DAILY_DRINK_CEILING_ML = 4000;

export const MIN_MASS_KG = 35;
export const MAX_MASS_KG = 200;
export const MAX_ACTIVE_MINUTES = 300;
export const MIN_WAKING_HOURS = 8;
export const MAX_WAKING_HOURS = 20;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const pad = (value) => String(value).padStart(2, "0");

/**
 * Format a minute-of-day as a 24-hour clock string.
 *
 * @param {number} minuteOfDay
 * @returns {string} e.g. "07:30"
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
 * @returns {number} minute of day, or NaN if the string is not a valid time
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
 * Spread a daily drinks volume into evenly spaced servings between waking and a
 * cut-off before bed.
 *
 * @param {object} input
 * @param {number} input.drinksMl total drinks for the day
 * @param {number} input.wakeMinuteOfDay e.g. 7 * 60 for 07:00
 * @param {number} input.wakingHours hours awake
 * @returns {{ servings: Array<{ time: string, ml: number }>, intervalMin: number } | { error: string }}
 */
export function buildDrinkSchedule({ drinksMl, wakeMinuteOfDay, wakingHours }) {
  if (!isNum(drinksMl) || drinksMl <= 0) return { error: "Nothing to schedule." };
  if (!isNum(wakeMinuteOfDay) || wakeMinuteOfDay < 0 || wakeMinuteOfDay >= 1440) {
    return { error: "Enter a wake-up time between 00:00 and 23:59." };
  }
  if (!isNum(wakingHours) || wakingHours < MIN_WAKING_HOURS || wakingHours > MAX_WAKING_HOURS) {
    return { error: `Waking hours should be between ${MIN_WAKING_HOURS} and ${MAX_WAKING_HOURS}.` };
  }

  const count = Math.max(1, Math.ceil(drinksMl / SERVING_ML));
  const perServing = drinksMl / count;
  const windowMin = Math.max(60, (wakingHours - BEDTIME_CUTOFF_HOURS) * 60);
  const intervalMin = count > 1 ? windowMin / (count - 1) : 0;

  const servings = [];
  for (let i = 0; i < count; i += 1) {
    servings.push({
      time: formatClock(wakeMinuteOfDay + intervalMin * i),
      ml: perServing,
    });
  }
  return { servings, intervalMin, count, perServing };
}

/**
 * Daily fluid target for pregnancy, plus a serving schedule.
 *
 * @param {object} input
 * @param {"efsa"|"weight"} input.baseline
 * @param {number} input.bodyMassKg pre-pregnancy or current weight, kg
 * @param {"first"|"second"|"third"} input.trimester
 * @param {"temperate"|"warm"|"hot"} input.climate
 * @param {number} input.activeMinutes minutes of moderate activity per day
 * @param {number} input.wakeMinuteOfDay
 * @param {number} input.wakingHours
 * @returns {object} plan, or { error }
 */
export function computePregnancyHydration({
  baseline,
  bodyMassKg,
  trimester,
  climate,
  activeMinutes,
  wakeMinuteOfDay,
  wakingHours,
}) {
  const trimesterMeta = TRIMESTERS[trimester];
  if (!trimesterMeta) return { error: "Choose a trimester." };
  const climateMeta = CLIMATES[climate];
  if (!climateMeta) return { error: "Choose the climate you are living in." };
  if (!isNum(activeMinutes) || activeMinutes < 0 || activeMinutes > MAX_ACTIVE_MINUTES) {
    return { error: `Active minutes should be between 0 and ${MAX_ACTIVE_MINUTES} per day.` };
  }

  let baseTotalMl;
  if (baseline === "weight") {
    if (!isNum(bodyMassKg) || bodyMassKg < MIN_MASS_KG || bodyMassKg > MAX_MASS_KG) {
      return { error: `Enter a weight between ${MIN_MASS_KG} and ${MAX_MASS_KG} kg.` };
    }
    baseTotalMl = bodyMassKg * ML_PER_KG_PER_DAY;
  } else if (baseline === "efsa") {
    baseTotalMl = EFSA_ADULT_WOMAN_TOTAL_WATER_ML;
  } else {
    return { error: "Choose a baseline method." };
  }

  const trimesterMl = trimesterMeta.extraMl;
  const climateMl = climateMeta.extraMl;
  const activityMl = activeMinutes * SWEAT_ML_PER_ACTIVE_MINUTE;

  const totalWaterMl = baseTotalMl + trimesterMl + climateMl + activityMl;
  const foodWaterMl = totalWaterMl * FOOD_WATER_SHARE;
  const drinksMl = totalWaterMl - foodWaterMl;

  const schedule = buildDrinkSchedule({ drinksMl, wakeMinuteOfDay, wakingHours });
  if (schedule.error) return schedule;

  return {
    baseTotalMl,
    trimesterMl,
    trimesterKcal: trimesterMeta.extraKcal,
    trimesterLabel: trimesterMeta.label,
    efsaFlatIncrementMl: EFSA_PREGNANCY_INCREMENT_ML,
    climateMl,
    activityMl,
    totalWaterMl,
    totalWaterL: totalWaterMl / 1000,
    foodWaterMl,
    drinksMl,
    drinksL: drinksMl / 1000,
    servingMl: schedule.perServing,
    servingCount: schedule.count,
    intervalMin: schedule.intervalMin,
    servings: schedule.servings,
    /** Beyond this, extra fluid is not a hydration question but a medical one. */
    aboveCeiling: drinksMl > DAILY_DRINK_CEILING_ML,
    ceilingMl: DAILY_DRINK_CEILING_ML,
  };
}
