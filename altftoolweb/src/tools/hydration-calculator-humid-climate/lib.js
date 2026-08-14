/**
 * Humid climate hydration calculator.
 *
 * The problem humidity creates
 * ----------------------------
 * Sweat only cools you when it evaporates. As relative humidity rises the air
 * approaches saturation, evaporation slows, and sweat drips off instead of
 * carrying heat away. The body responds by sweating harder for less cooling, so
 * fluid losses in humid heat are larger than the air temperature alone suggests.
 * The published way to quantify that combination is the heat index.
 *
 * Heat index
 * ----------
 * The US National Weather Service Rothfusz regression, computed in degrees
 * Fahrenheit from air temperature and relative humidity, including the two
 * published corrections for very dry air and for high humidity at lower
 * temperatures. Below roughly 80 F the simpler Steadman-based form is used
 * instead, exactly as the NWS specifies.
 *
 * Baseline fluid
 * --------------
 * 35 mL per kg of body weight per day for adults, dropping to 30 mL/kg from age
 * 65 because renal concentrating ability and thirst sensation both decline. For
 * comparison the Institute of Medicine adequate intake for total water is 3.7 L
 * a day for men and 2.7 L for women, of which about 80% normally comes from
 * drinks and 20% from food.
 *
 * Sweat losses
 * ------------
 * The ACSM position stand on exercise and fluid replacement (Sawka MN et al.,
 * Med Sci Sports Exerc 2007;39:377-390) reports exercise sweat rates typically
 * between 0.5 and 2.0 L per hour. The base rates below sit inside that range.
 * Heat then scales them: the multiplier applied here is a PLANNING HEURISTIC,
 * not a measured constant, rising 3% per degree Celsius of heat index above
 * 25 C and capped at 1.6x. It is anchored to the heat index precisely because
 * that index already carries the humidity effect.
 *
 * Sodium
 * ------
 * Sweat sodium concentration ranges from about 20 to 80 mmol/L (ACSM), which is
 * roughly 460 to 1,840 mg of sodium per litre at 23 mg per mmol.
 *
 * Safety ceiling
 * --------------
 * Healthy kidneys excrete a maximum of roughly 0.8-1.0 L of water per hour.
 * Drinking beyond that, especially plain water during prolonged sweating, risks
 * exercise-associated hyponatraemia (Hew-Butler T et al., 3rd International
 * Exercise-Associated Hyponatremia Consensus, Clin J Sport Med 2015;25:303-320).
 *
 * Informational only. Not medical advice.
 */

/** Baseline fluid in mL per kg of body weight per day. */
export const BASELINE_ML_PER_KG = { adult: 35, older: 30 };

/** Age from which the lower baseline is used. */
export const OLDER_ADULT_AGE = 65;

/** Institute of Medicine adequate intake for total water, litres per day. */
export const IOM_TOTAL_WATER_L = { male: 3.7, female: 2.7 };

/** Share of total water that normally comes from drinks rather than food. */
export const DRINKS_SHARE_OF_TOTAL_WATER = 0.8;

/** Base exercise sweat rates in litres per hour, inside the ACSM 0.5-2.0 L/h range. */
export const EXERCISE_INTENSITY = {
  none: { label: "No training today", sweatLPerHour: 0 },
  light: { label: "Light (easy walk, gentle yoga)", sweatLPerHour: 0.5 },
  moderate: { label: "Moderate (jog, gym session, cycling)", sweatLPerHour: 0.9 },
  vigorous: { label: "Vigorous (intervals, match play, long run)", sweatLPerHour: 1.4 },
};

/** Passive sweat rate while simply being outdoors in the heat, litres per hour. */
export const PASSIVE_SWEAT_L_PER_HOUR = 0.15;

/**
 * Planning heuristic, not a measured constant: sweat output rises about 3% for
 * every degree Celsius of heat index above 25 C, capped at 1.6 times baseline.
 */
export const HEAT_SWEAT_PER_DEGREE = 0.03;
export const HEAT_SWEAT_BASE_C = 25;
export const HEAT_SWEAT_MAX_MULTIPLIER = 1.6;

/** Sweat sodium concentration, mg of sodium per litre of sweat (ACSM range). */
export const SWEAT_SODIUM = {
  light: { label: "Light sweater (little salt residue)", mgPerL: 500 },
  typical: { label: "Typical", mgPerL: 900 },
  salty: { label: "Salty sweater (white marks on clothing)", mgPerL: 1500 },
};

/** Sodium the ACSM suggests per litre of drink during prolonged sweating, mg. */
export const DRINK_SODIUM_MG_PER_L = { min: 460, max: 690 };

/** Maximum sustainable water excretion by healthy kidneys, litres per hour. */
export const MAX_SAFE_L_PER_HOUR = 1.0;

/** Total daily intake above which over-drinking becomes the bigger risk, litres. */
export const DAILY_CAUTION_L = 10;

/** Litres to replace per kilogram of body mass lost after a session (ACSM). */
export const REPLACEMENT_L_PER_KG_LOST = { min: 1.25, max: 1.5 };

export const LIMITS = {
  age: { min: 12, max: 100 },
  weightKg: { min: 30, max: 250 },
  tempC: { min: 15, max: 55 },
  humidityPct: { min: 40, max: 100 },
  exerciseHours: { min: 0, max: 8 },
  outdoorHours: { min: 0, max: 16 },
  wakingHours: { min: 8, max: 20 },
};

/** Celsius to Fahrenheit. */
export function toFahrenheit(celsius) {
  return celsius * 1.8 + 32;
}

/** Fahrenheit to Celsius. */
export function toCelsius(fahrenheit) {
  return (fahrenheit - 32) / 1.8;
}

/**
 * Upper edge of the NWS's officially published heat-index chart, degrees
 * Fahrenheit (about 43 C). The Rothfusz regression below is only fit and
 * published for roughly 80-110 F air temperature; this tool's own LIMITS
 * allow air temperatures up to 55 C (131 F), and even right at the chart's
 * own edge (110 F, 100% RH) the raw polynomial already overshoots badly.
 */
export const HEAT_INDEX_CHART_MAX_TEMP_F = 110;

/**
 * Hard ceiling applied to the returned heat index so extrapolating the
 * regression past its valid range (e.g. 55 C / 100% RH, both individually
 * inside LIMITS) can never produce a runaway, physically-meaningless number
 * such as ~515 F. Matches the ceiling the sibling hydration-planner-monsoon-india
 * tool treats as the practical top of the published chart.
 */
export const HEAT_INDEX_CHART_MAX_F = 137;

/**
 * Rothfusz regression, unclamped. Not exported: callers use heatIndexF
 * (clamped) plus isHeatIndexOutOfRange to know whether that clamp bit.
 */
function rawHeatIndexF(tempF, rh) {
  if (!Number.isFinite(tempF) || !Number.isFinite(rh)) return null;

  // Steadman-based simple form, used first as the NWS specifies.
  const simple = 0.5 * (tempF + 61.0 + (tempF - 68.0) * 1.2 + rh * 0.094);
  if ((simple + tempF) / 2 < 80) return simple;

  const t = tempF;
  const r = rh;
  let hi =
    -42.379 +
    2.04901523 * t +
    10.14333127 * r -
    0.22475541 * t * r -
    0.00683783 * t * t -
    0.05481717 * r * r +
    0.00122874 * t * t * r +
    0.00085282 * t * r * r -
    0.00000199 * t * t * r * r;

  // Published corrections.
  if (r < 13 && t >= 80 && t <= 112) {
    hi -= ((13 - r) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
  } else if (r > 85 && t >= 80 && t <= 87) {
    hi += ((r - 85) / 10) * ((87 - t) / 5);
  }
  return hi;
}

/**
 * US National Weather Service heat index in degrees Fahrenheit.
 * @param {number} tempF air temperature, degrees Fahrenheit
 * @param {number} rh    relative humidity, percent
 */
export function heatIndexF(tempF, rh) {
  const hi = rawHeatIndexF(tempF, rh);
  if (hi === null) return null;
  // Clamp: see HEAT_INDEX_CHART_MAX_F above. Never lowers a value that was
  // already below the ceiling, so normal in-range results are unaffected.
  return Math.min(hi, HEAT_INDEX_CHART_MAX_F);
}

/** Heat index expressed in degrees Celsius. */
export function heatIndexC(tempC, rh) {
  const f = heatIndexF(toFahrenheit(tempC), rh);
  return f === null ? null : toCelsius(f);
}

/**
 * True when this input combination is a genuine extrapolation past the
 * Rothfusz regression's documented valid range (roughly 80-110 F / 27-43 C),
 * either because the air temperature itself is above that band, or because
 * -- as happens at plausible-looking inputs like 42 C / 80% RH, still inside
 * the "valid" temperature band alone -- the humidity combination is still
 * enough to run the raw polynomial past the practical chart ceiling before
 * heatIndexF clamps it. Mirrors the "heatIndexOutOfRange" pattern used by
 * the sibling hydration-planner-monsoon-india tool.
 */
export function isHeatIndexOutOfRange(tempC, humidityPct) {
  const tempF = toFahrenheit(tempC);
  if (tempF > HEAT_INDEX_CHART_MAX_TEMP_F) return true;
  const raw = rawHeatIndexF(tempF, humidityPct);
  return raw !== null && raw > HEAT_INDEX_CHART_MAX_F;
}

/** Sweat multiplier for a given heat index, as a planning heuristic. */
export function heatSweatMultiplier(heatIdxC) {
  if (!Number.isFinite(heatIdxC)) return 1;
  const raw = 1 + Math.max(0, heatIdxC - HEAT_SWEAT_BASE_C) * HEAT_SWEAT_PER_DEGREE;
  return Math.min(HEAT_SWEAT_MAX_MULTIPLIER, raw);
}

/**
 * Daily fluid plan for a humid climate.
 *
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.age
 * @param {number} input.weightKg
 * @param {number} input.tempC           air temperature, degrees Celsius
 * @param {number} input.humidityPct     relative humidity, percent
 * @param {string} input.intensity       key of EXERCISE_INTENSITY
 * @param {number} input.exerciseHours   hours of training today
 * @param {number} input.outdoorHours    hours outdoors or without air conditioning
 * @param {string} input.sweatType       key of SWEAT_SODIUM
 * @param {number} input.wakingHours     hours awake, used to pace the intake
 * @returns {object} the plan, or { error }
 */
export function humidHydrationPlan({
  sex,
  age,
  weightKg,
  tempC = 33,
  humidityPct = 80,
  intensity = "moderate",
  exerciseHours = 1,
  outdoorHours = 3,
  sweatType = "typical",
  wakingHours = 16,
}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female so the reference water intake can be shown." };
  }
  const numeric = {
    age,
    weightKg,
    tempC,
    humidityPct,
    exerciseHours,
    outdoorHours,
    wakingHours,
  };
  for (const [key, value] of Object.entries(numeric)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: `Enter a valid number for ${key}.` };
    }
  }
  if (age < LIMITS.age.min || age > LIMITS.age.max) {
    return { error: `Age must be between ${LIMITS.age.min} and ${LIMITS.age.max} years.` };
  }
  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return { error: `Weight must be between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.` };
  }
  if (tempC < LIMITS.tempC.min || tempC > LIMITS.tempC.max) {
    return { error: `Temperature must be between ${LIMITS.tempC.min} and ${LIMITS.tempC.max} C.` };
  }
  if (humidityPct < LIMITS.humidityPct.min || humidityPct > LIMITS.humidityPct.max) {
    return {
      error: `This calculator is built for humid conditions, so humidity must be between ${LIMITS.humidityPct.min}% and 100%.`,
    };
  }
  if (exerciseHours < LIMITS.exerciseHours.min || exerciseHours > LIMITS.exerciseHours.max) {
    return { error: `Training hours must be between 0 and ${LIMITS.exerciseHours.max}.` };
  }
  if (outdoorHours < LIMITS.outdoorHours.min || outdoorHours > LIMITS.outdoorHours.max) {
    return { error: `Hours outdoors must be between 0 and ${LIMITS.outdoorHours.max}.` };
  }
  if (wakingHours < LIMITS.wakingHours.min || wakingHours > LIMITS.wakingHours.max) {
    return {
      error: `Waking hours must be between ${LIMITS.wakingHours.min} and ${LIMITS.wakingHours.max}.`,
    };
  }
  const intensityDef = EXERCISE_INTENSITY[intensity];
  if (!intensityDef) return { error: "Choose a training intensity." };
  const sweatDef = SWEAT_SODIUM[sweatType];
  if (!sweatDef) return { error: "Choose how salty your sweat runs." };
  // No outdoorHours-vs-exerciseHours cross-check here: they are independent
  // quantities (per the JSDoc above) -- e.g. a 1-hour air-conditioned gym
  // session with zero outdoor exposure is a perfectly valid combination.
  // passiveHours below already clamps at 0 for exactly this case.

  const heatIdxC = heatIndexC(tempC, humidityPct);
  const heatIdxF = heatIndexF(toFahrenheit(tempC), humidityPct);
  const heatIndexOutOfRange = isHeatIndexOutOfRange(tempC, humidityPct);
  const multiplier = heatSweatMultiplier(heatIdxC);
  const humidityPenaltyC = heatIdxC - tempC;

  const baselineMlPerKg =
    age >= OLDER_ADULT_AGE ? BASELINE_ML_PER_KG.older : BASELINE_ML_PER_KG.adult;
  const baselineL = (baselineMlPerKg * weightKg) / 1000;

  // Only training done outdoors/without AC receives the humid-heat multiplier.
  // Otherwise unrelated outdoor exposure would inflate an indoor gym session.
  const heatedExerciseHours = Math.min(exerciseHours, outdoorHours);
  const indoorExerciseHours = Math.max(0, exerciseHours - heatedExerciseHours);
  const exerciseSweatL =
    intensityDef.sweatLPerHour *
    (indoorExerciseHours + heatedExerciseHours * multiplier);
  const passiveHours = Math.max(0, outdoorHours - heatedExerciseHours);
  const passiveSweatL = PASSIVE_SWEAT_L_PER_HOUR * passiveHours * multiplier;
  const totalSweatL = exerciseSweatL + passiveSweatL;

  const totalL = baselineL + totalSweatL;
  const perHourL = totalL / wakingHours;
  const sodiumMg = totalSweatL * sweatDef.mgPerL;

  const iomTotalL = IOM_TOTAL_WATER_L[sex];
  const iomDrinksL = iomTotalL * DRINKS_SHARE_OF_TOTAL_WATER;

  return {
    heatIndexC: heatIdxC,
    heatIndexF: heatIdxF,
    heatIndexOutOfRange,
    tempC,
    humidityPct,
    humidityPenaltyC,
    sweatMultiplier: multiplier,
    baselineMlPerKg,
    baselineL,
    exerciseSweatL,
    heatedExerciseHours,
    indoorExerciseHours,
    passiveSweatL,
    passiveHours,
    totalSweatL,
    totalL,
    totalMl: totalL * 1000,
    perHourL,
    glassesOf250Ml: (totalL * 1000) / 250,
    sodiumMg,
    sweatSodiumMgPerL: sweatDef.mgPerL,
    sweatTypeLabel: sweatDef.label,
    drinkSodiumMgPerL: DRINK_SODIUM_MG_PER_L,
    intensityLabel: intensityDef.label,
    iomTotalL,
    iomDrinksL,
    aboveIomDrinks: totalL > iomDrinksL,
    exceedsHourlyCeiling: perHourL > MAX_SAFE_L_PER_HOUR,
    maxSafeLPerHour: MAX_SAFE_L_PER_HOUR,
    exceedsDailyCaution: totalL > DAILY_CAUTION_L,
    dailyCautionL: DAILY_CAUTION_L,
    needsElectrolytes: totalSweatL >= 1.5,
    replacementPerKgLost: REPLACEMENT_L_PER_KG_LOST,
  };
}
