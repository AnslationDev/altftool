/**
 * Hot yoga hydration planning.
 *
 * Two routes to the same plan:
 *
 * 1. WEIGH-IN (accurate). The standard sweat-rate equation used in sports
 *    science and in the ACSM Position Stand "Exercise and Fluid Replacement"
 *    (Med Sci Sports Exerc, 2007):
 *
 *      sweat loss (L) = (pre-mass kg - post-mass kg) + fluid drunk (L)
 *      sweat rate (L/h) = sweat loss / hours
 *
 *    This works because 1 g of body-mass change during exercise is treated as
 *    1 mL of body water; substrate oxidation and respiratory losses are small
 *    enough over a single class to ignore.
 *
 * 2. ESTIMATE (planning only). A transparent model that scales a reference
 *    heated-room sweat rate by room temperature, humidity, class intensity and
 *    body size. It is a planning aid, not a measurement — the weigh-in route is
 *    always the better number.
 *
 * The plan itself follows the ACSM Position Stand:
 *   - before:   5-7 mL/kg about 4 h before; a further 3-5 mL/kg 2 h before if
 *               urine is dark or absent
 *   - during:   drink to keep body-mass loss under 2% of body mass
 *   - after:    replace 125-150% of the remaining deficit
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/* ---------------------------------------------------------------- constants */

/** ACSM pre-exercise prehydration: 5-7 mL per kg body mass ~4 h before. */
export const PRE_ML_PER_KG = 6;

/** ACSM top-up: a further 3-5 mL/kg ~2 h before if no urine is produced or it
 *  is dark. Midpoint used. */
export const PRE_TOPUP_ML_PER_KG = 4;

/** ACSM post-exercise: drink 1.25-1.5 L per kg of body mass lost. 1.5 is the
 *  figure for full restoration, because some of the drink is lost as urine. */
export const REHYDRATION_FACTOR = 1.5;

/** Performance and thermoregulation degrade once body-mass loss passes ~2%. */
export const DEHYDRATION_THRESHOLD_PCT = 2;

/** Mean sweat sodium concentration ~50 mmol/L (population range 20-80 mmol/L).
 *  50 mmol x 22.99 mg/mmol = 1150 mg of sodium per litre of sweat. */
export const SWEAT_SODIUM_MG_PER_L = 1150;

/** Sodium chloride / sodium molar-mass ratio: 58.44 / 22.99. Converts sodium
 *  milligrams into the equivalent weight of table salt. */
export const SODIUM_TO_SALT_RATIO = 58.44 / 22.99;

/** Practical ceiling on what most people can comfortably drink mid-practice.
 *  Gastric emptying tops out near 1.0-1.2 L/h; sipping in a hot room while
 *  inverted is well below that. */
export const MAX_INTAKE_L_PER_H = 0.8;

/** Sipping interval used to break the during-class volume into portions. */
export const SIP_INTERVAL_MIN = 15;

/* ------------------------------------------------------- estimate model ---- */

/** Reference: a 70 kg practitioner, 32 C room, 40% relative humidity,
 *  standard-paced heated vinyasa. Measured heated-class sweat losses cluster
 *  around 1.0-1.5 L for a 90-minute class, i.e. roughly 0.7-1.0 L/h. */
export const REFERENCE_MASS_KG = 70;
export const REFERENCE_ROOM_C = 32;
export const REFERENCE_HUMIDITY_PCT = 40;
export const BASE_SWEAT_RATE_L_PER_H = 0.75;

/** Sweat rate rises roughly 5% per degree C of ambient heat across the
 *  30-42 C band typical of heated studios. */
export const TEMP_SENSITIVITY_PER_C = 0.05;

/** Humid air blocks evaporation, so more sweat has to be secreted to shed the
 *  same heat. Modelled as +0.4% of the reference rate per point of relative
 *  humidity above 40%. */
export const HUMIDITY_SENSITIVITY_PER_PCT = 0.004;

/** Metabolic heat production, and therefore sweat rate, scales with body
 *  surface area rather than mass. BSA is proportional to mass^(2/3). */
export const MASS_SCALING_EXPONENT = 2 / 3;

/** Class styles and their relative metabolic cost against a standard heated
 *  vinyasa class. */
export const CLASS_STYLES = {
  gentle: { label: "Gentle / hot yin / restorative", factor: 0.7 },
  standard: { label: "Hot vinyasa / Bikram sequence", factor: 1 },
  power: { label: "Power / sculpt with weights", factor: 1.3 },
};

/** Physiological bounds. Nobody sweats less than 0.2 L/h in a heated room, and
 *  sustained rates above 2.5 L/h are elite-athlete territory. */
export const MIN_SWEAT_RATE_L_PER_H = 0.2;
export const MAX_SWEAT_RATE_L_PER_H = 2.5;

/* Input sanity limits. */
export const MIN_MASS_KG = 25;
export const MAX_MASS_KG = 300;
export const MIN_DURATION_MIN = 10;
export const MAX_DURATION_MIN = 180;
export const MIN_ROOM_C = 20;
export const MAX_ROOM_C = 50;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/**
 * Model a sweat rate from room conditions and class style.
 *
 * @param {object} input
 * @param {number} input.bodyMassKg
 * @param {number} input.roomTempC
 * @param {number} input.humidityPct relative humidity, 0-100
 * @param {"gentle"|"standard"|"power"} input.style
 * @returns {{ sweatRateLPerH: number, clamped: boolean } | { error: string }}
 */
export function estimateSweatRate({ bodyMassKg, roomTempC, humidityPct, style }) {
  if (!isNum(bodyMassKg) || bodyMassKg < MIN_MASS_KG || bodyMassKg > MAX_MASS_KG) {
    return { error: `Enter a body weight between ${MIN_MASS_KG} and ${MAX_MASS_KG} kg.` };
  }
  if (!isNum(roomTempC) || roomTempC < MIN_ROOM_C || roomTempC > MAX_ROOM_C) {
    return { error: `Room temperature should be between ${MIN_ROOM_C} and ${MAX_ROOM_C} C.` };
  }
  if (!isNum(humidityPct) || humidityPct < 0 || humidityPct > 100) {
    return { error: "Relative humidity should be between 0% and 100%." };
  }
  const styleMeta = CLASS_STYLES[style];
  if (!styleMeta) return { error: "Choose a class style." };

  const tempFactor = 1 + (roomTempC - REFERENCE_ROOM_C) * TEMP_SENSITIVITY_PER_C;
  const humidityFactor =
    1 + (humidityPct - REFERENCE_HUMIDITY_PCT) * HUMIDITY_SENSITIVITY_PER_PCT;
  const sizeFactor = Math.pow(bodyMassKg / REFERENCE_MASS_KG, MASS_SCALING_EXPONENT);

  const raw =
    BASE_SWEAT_RATE_L_PER_H *
    Math.max(0.3, tempFactor) *
    Math.max(0.8, humidityFactor) *
    sizeFactor *
    styleMeta.factor;

  const sweatRateLPerH = clamp(raw, MIN_SWEAT_RATE_L_PER_H, MAX_SWEAT_RATE_L_PER_H);
  return { sweatRateLPerH, clamped: sweatRateLPerH !== raw };
}

/**
 * Exact sweat rate from a weigh-in / weigh-out.
 *
 * @param {object} input
 * @param {number} input.preMassKg mass before class, after voiding
 * @param {number} input.postMassKg mass after class, towelled dry
 * @param {number} input.drankMl fluid drunk during class, in millilitres
 * @param {number} input.durationMin
 * @returns {{ sweatLossL: number, sweatRateLPerH: number, clamped: boolean } | { error: string }}
 */
export function sweatRateFromWeighIn({ preMassKg, postMassKg, drankMl, durationMin }) {
  if (!isNum(preMassKg) || preMassKg < MIN_MASS_KG || preMassKg > MAX_MASS_KG) {
    return { error: `Pre-class weight should be between ${MIN_MASS_KG} and ${MAX_MASS_KG} kg.` };
  }
  if (!isNum(postMassKg) || postMassKg < MIN_MASS_KG || postMassKg > MAX_MASS_KG) {
    return { error: `Post-class weight should be between ${MIN_MASS_KG} and ${MAX_MASS_KG} kg.` };
  }
  if (!isNum(drankMl) || drankMl < 0) return { error: "Fluid drunk cannot be negative." };
  if (!isNum(durationMin) || durationMin < MIN_DURATION_MIN || durationMin > MAX_DURATION_MIN) {
    return { error: `Class length should be between ${MIN_DURATION_MIN} and ${MAX_DURATION_MIN} minutes.` };
  }

  const sweatLossL = preMassKg - postMassKg + drankMl / 1000;
  if (sweatLossL <= 0) {
    return {
      error:
        "You finished heavier than you started once the drink is counted, so no sweat loss can be measured. Re-check the two weights.",
    };
  }
  // Even with both weights individually in range, a mistyped digit on either
  // one can still produce a loss that is not physiologically plausible for a
  // single class. Clamp the same way estimateSweatRate does rather than
  // feeding an absurd "measured" rate straight into the hydration plan.
  const raw = sweatLossL / (durationMin / 60);
  const sweatRateLPerH = clamp(raw, MIN_SWEAT_RATE_L_PER_H, MAX_SWEAT_RATE_L_PER_H);
  return { sweatLossL, sweatRateLPerH, clamped: sweatRateLPerH !== raw };
}

/**
 * Turn a sweat rate into a before / during / after drinking plan.
 *
 * @param {object} input
 * @param {number} input.bodyMassKg
 * @param {number} input.durationMin
 * @param {number} input.sweatRateLPerH
 * @param {boolean} [input.darkUrine] add the ACSM 2-hour top-up
 * @returns {object} plan, or { error }
 */
export function buildHydrationPlan({ bodyMassKg, durationMin, sweatRateLPerH, darkUrine = false }) {
  if (!isNum(bodyMassKg) || bodyMassKg < MIN_MASS_KG || bodyMassKg > MAX_MASS_KG) {
    return { error: `Enter a body weight between ${MIN_MASS_KG} and ${MAX_MASS_KG} kg.` };
  }
  if (!isNum(durationMin) || durationMin < MIN_DURATION_MIN || durationMin > MAX_DURATION_MIN) {
    return { error: `Class length should be between ${MIN_DURATION_MIN} and ${MAX_DURATION_MIN} minutes.` };
  }
  if (!isNum(sweatRateLPerH) || sweatRateLPerH <= 0) {
    return { error: "Sweat rate must be greater than zero." };
  }

  const hours = durationMin / 60;
  const sweatLossMl = sweatRateLPerH * hours * 1000;

  const preMl = bodyMassKg * PRE_ML_PER_KG;
  const topUpMl = darkUrine ? bodyMassKg * PRE_TOPUP_ML_PER_KG : 0;

  // Drink at the sweat rate, but no faster than is comfortable mid-class.
  const duringMl = Math.min(sweatLossMl, MAX_INTAKE_L_PER_H * hours * 1000);
  const deficitMl = Math.max(0, sweatLossMl - duringMl);
  const afterMl = deficitMl * REHYDRATION_FACTOR;

  // What the class costs in body mass if nothing at all is drunk during it.
  const unreplacedLossPct = (sweatLossMl / 1000 / bodyMassKg) * 100;
  // What it costs following this plan.
  const deficitPct = (deficitMl / 1000 / bodyMassKg) * 100;

  const sips = Math.max(1, Math.floor(durationMin / SIP_INTERVAL_MIN));
  const sodiumMg = (sweatLossMl / 1000) * SWEAT_SODIUM_MG_PER_L;

  return {
    sweatRateLPerH,
    sweatLossMl,
    sweatLossL: sweatLossMl / 1000,
    preMl,
    topUpMl,
    totalBeforeMl: preMl + topUpMl,
    duringMl,
    sipCount: sips,
    sipMl: duringMl / sips,
    deficitMl,
    afterMl,
    totalDayMl: preMl + topUpMl + duringMl + afterMl,
    unreplacedLossPct,
    deficitPct,
    exceedsThreshold: deficitPct > DEHYDRATION_THRESHOLD_PCT,
    sodiumMg,
    saltEquivalentMg: sodiumMg * SODIUM_TO_SALT_RATIO,
    saltEquivalentG: (sodiumMg * SODIUM_TO_SALT_RATIO) / 1000,
    /** Sweat losses above ~1.2 L in one class are where electrolytes, not just
     *  water, start to matter for the replacement drink. */
    needsElectrolytes: sweatLossMl >= 1200,
  };
}

/**
 * One-call orchestrator used by the UI.
 *
 * @param {object} input
 * @param {"estimate"|"weighin"} input.mode
 * @returns {object} plan (with `sweatSource`), or { error }
 */
export function computeHotYogaPlan(input) {
  const { mode, bodyMassKg, durationMin, darkUrine } = input;

  if (mode === "weighin") {
    const measured = sweatRateFromWeighIn({
      preMassKg: input.preMassKg,
      postMassKg: input.postMassKg,
      drankMl: input.drankMl,
      durationMin,
    });
    if (measured.error) return measured;
    const plan = buildHydrationPlan({
      bodyMassKg: input.preMassKg,
      durationMin,
      sweatRateLPerH: measured.sweatRateLPerH,
      darkUrine,
    });
    if (plan.error) return plan;
    return {
      ...plan,
      sweatSource: "measured",
      measuredLossL: measured.sweatLossL,
      clamped: measured.clamped,
    };
  }

  const modelled = estimateSweatRate({
    bodyMassKg,
    roomTempC: input.roomTempC,
    humidityPct: input.humidityPct,
    style: input.style,
  });
  if (modelled.error) return modelled;
  const plan = buildHydrationPlan({
    bodyMassKg,
    durationMin,
    sweatRateLPerH: modelled.sweatRateLPerH,
    darkUrine,
  });
  if (plan.error) return plan;
  return { ...plan, sweatSource: "estimated", clamped: modelled.clamped };
}
