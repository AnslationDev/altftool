/**
 * Breastfeeding (lactation) hydration target.
 *
 * Where the extra fluid comes from
 * --------------------------------
 * EFSA's 2010 Scientific Opinion on Dietary Reference Values for water adds
 * 700 mL/day of total water for lactating women on top of the 2.0 L/day
 * Adequate Intake for adult women. That 700 mL is not arbitrary: it is the water
 * secreted as milk. Average milk output in exclusive breastfeeding over the
 * first six months is about 800 mL/day (WHO/EFSA), and human milk is roughly
 * 87% water, so 800 x 0.87 = 696 mL - EFSA's figure, rounded.
 *
 * This module rebuilds that derivation instead of hard-coding 700 mL, which lets
 * the increment scale with how much milk you are actually producing: fewer feeds
 * a day, a baby on solids, or two babies nursing all change the answer.
 *
 * Milk output by stage (EFSA / WHO reference values):
 *   exclusive, 0-6 months     ~800 mL/day
 *   partial, 6-12 months      ~600 mL/day
 *   extended, past 12 months  ~400 mL/day
 *
 * Feed count scales that base against a typical number of feeds for the stage,
 * clamped so an unusual count cannot produce an impossible milk volume. If you
 * have pumped and measured your output, entering the measured figure is better
 * than any of this.
 *
 * Total water is converted to a drinks target by removing the ~20% of total
 * water that comes from food (EFSA: 20-30% in European diets).
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/* -------------------------------------------------------------- baseline -- */

/** EFSA 2010 Adequate Intake, total water, adult women. */
export const EFSA_ADULT_WOMAN_TOTAL_WATER_ML = 2000;

/** Clinical body-weight rule for adults: 30-35 mL/kg/day. */
export const ML_PER_KG_PER_DAY = 35;

export const BASELINE_METHODS = {
  efsa: { label: "EFSA adequate intake (2.0 L/day)" },
  weight: { label: "Body weight (35 ml per kg per day)" },
};

/* ------------------------------------------------------------------ milk -- */

/** Human milk is about 87% water by weight. */
export const MILK_WATER_FRACTION = 0.87;

/** EFSA's flat lactation increment, kept for comparison. */
export const EFSA_LACTATION_INCREMENT_ML = 700;

export const LACTATION_STAGES = {
  exclusive: {
    label: "Exclusive breastfeeding (0-6 months)",
    baseMilkMlPerDay: 800,
    typicalFeedsPerDay: 8,
  },
  partial: {
    label: "Breastfeeding plus solids (6-12 months)",
    baseMilkMlPerDay: 600,
    typicalFeedsPerDay: 5,
  },
  extended: {
    label: "Extended breastfeeding (past 12 months)",
    baseMilkMlPerDay: 400,
    typicalFeedsPerDay: 3,
  },
};

/** How far the feed count is allowed to move the stage's milk volume. Milk
 *  supply responds to demand but not proportionally - short comfort feeds move
 *  volume far less than the count suggests. */
export const FEED_SCALE_MIN = 0.4;
export const FEED_SCALE_MAX = 1.6;

/** Sanity ceiling on daily milk production, well above the ~2 L/day reported
 *  for mothers exclusively feeding triplets. */
export const MAX_MILK_ML_PER_DAY = 2500;

/* ----------------------------------------------------------- adjustments -- */

export const CLIMATES = {
  temperate: { label: "Temperate / air-conditioned", extraMl: 0 },
  warm: { label: "Warm (28-33 C)", extraMl: 300 },
  hot: { label: "Hot or humid (above 33 C)", extraMl: 600 },
};

/** Moderate activity at 0.6 L/h = 10 mL per active minute. */
export const SWEAT_ML_PER_ACTIVE_MINUTE = 10;

/** Share of total water that comes from food (EFSA: 20-30%). */
export const FOOD_WATER_SHARE = 0.2;

/** A comfortable single serving; also the "glass at every feed" unit. */
export const SERVING_ML = 250;

/* ----------------------------------------------------------------- caps --- */

export const DAILY_DRINK_CEILING_ML = 4500;
export const MIN_MASS_KG = 35;
export const MAX_MASS_KG = 200;
export const MIN_FEEDS_PER_DAY = 1;
export const MAX_FEEDS_PER_DAY = 20;
export const MAX_BABIES = 3;
export const MAX_ACTIVE_MINUTES = 300;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/**
 * Estimate daily milk volume from stage, feed count and number of babies.
 *
 * @param {object} input
 * @param {"exclusive"|"partial"|"extended"} input.stage
 * @param {number} input.feedsPerDay
 * @param {number} input.babies
 * @returns {{ milkMlPerDay: number, feedScale: number, mlPerFeed: number } | { error: string }}
 */
export function estimateMilkOutput({ stage, feedsPerDay, babies }) {
  const meta = LACTATION_STAGES[stage];
  if (!meta) return { error: "Choose a breastfeeding stage." };
  if (!isNum(feedsPerDay) || feedsPerDay < MIN_FEEDS_PER_DAY || feedsPerDay > MAX_FEEDS_PER_DAY) {
    return {
      error: `Feeds per day should be between ${MIN_FEEDS_PER_DAY} and ${MAX_FEEDS_PER_DAY}.`,
    };
  }
  if (!isNum(babies) || babies < 1 || babies > MAX_BABIES) {
    return { error: `Enter between 1 and ${MAX_BABIES} babies nursing.` };
  }

  const feedScale = clamp(feedsPerDay / meta.typicalFeedsPerDay, FEED_SCALE_MIN, FEED_SCALE_MAX);
  const milkMlPerDay = Math.min(
    MAX_MILK_ML_PER_DAY,
    meta.baseMilkMlPerDay * feedScale * babies,
  );

  return {
    milkMlPerDay,
    feedScale,
    mlPerFeed: milkMlPerDay / feedsPerDay,
    stageLabel: meta.label,
    typicalFeedsPerDay: meta.typicalFeedsPerDay,
  };
}

/**
 * Daily fluid target while breastfeeding.
 *
 * @param {object} input
 * @param {"efsa"|"weight"} input.baseline
 * @param {number} input.bodyMassKg
 * @param {"exclusive"|"partial"|"extended"} input.stage
 * @param {number} input.feedsPerDay
 * @param {number} input.babies
 * @param {"temperate"|"warm"|"hot"} input.climate
 * @param {number} input.activeMinutes
 * @param {number} [input.measuredMilkMlPerDay] pumped/measured output, overrides the estimate
 * @returns {object} plan, or { error }
 */
export function computeLactationHydration({
  baseline,
  bodyMassKg,
  stage,
  feedsPerDay,
  babies,
  climate,
  activeMinutes,
  measuredMilkMlPerDay,
}) {
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

  const estimate = estimateMilkOutput({ stage, feedsPerDay, babies });
  if (estimate.error) return estimate;

  let milkMlPerDay = estimate.milkMlPerDay;
  let milkSource = "estimated";
  if (isNum(measuredMilkMlPerDay) && measuredMilkMlPerDay > 0) {
    if (measuredMilkMlPerDay > MAX_MILK_ML_PER_DAY) {
      return {
        error: `A daily milk output above ${MAX_MILK_ML_PER_DAY} ml is outside the reported range — re-check the figure.`,
      };
    }
    milkMlPerDay = measuredMilkMlPerDay;
    milkSource = "measured";
  }

  const milkWaterMl = milkMlPerDay * MILK_WATER_FRACTION;
  const climateMl = climateMeta.extraMl;
  const activityMl = activeMinutes * SWEAT_ML_PER_ACTIVE_MINUTE;

  const totalWaterMl = baseTotalMl + milkWaterMl + climateMl + activityMl;
  const foodWaterMl = totalWaterMl * FOOD_WATER_SHARE;
  const drinksMl = totalWaterMl - foodWaterMl;

  const perFeedMl = drinksMl / feedsPerDay;
  const servingCount = Math.max(1, Math.ceil(drinksMl / SERVING_ML));

  return {
    baseTotalMl,
    milkMlPerDay,
    milkSource,
    milkWaterMl,
    mlPerFeed: milkMlPerDay / feedsPerDay,
    feedScale: estimate.feedScale,
    stageLabel: estimate.stageLabel,
    typicalFeedsPerDay: estimate.typicalFeedsPerDay,
    efsaFlatIncrementMl: EFSA_LACTATION_INCREMENT_ML,
    climateMl,
    activityMl,
    totalWaterMl,
    totalWaterL: totalWaterMl / 1000,
    foodWaterMl,
    drinksMl,
    drinksL: drinksMl / 1000,
    perFeedMl,
    servingCount,
    servingMl: drinksMl / servingCount,
    aboveCeiling: drinksMl > DAILY_DRINK_CEILING_ML,
    ceilingMl: DAILY_DRINK_CEILING_ML,
  };
}
