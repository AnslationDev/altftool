/**
 * Weight-based dosing arithmetic.
 *
 * A prescription written as "15 mg/kg every 6 hours" or "30 mg/kg/day in three
 * divided doses" has to be turned into a millligram amount for one specific
 * body weight, and then into a volume if the medicine is a liquid. This module
 * does that arithmetic only. It contains no drug database and applies no
 * clinical judgement.
 */

/** International avoirdupois pound: exactly 0.45359237 kg (1959 agreement). */
export const KG_PER_LB = 0.45359237;

/** Multipliers that bring a dose strength unit onto a milligram basis. */
export const STRENGTH_UNITS = [
  { id: "mcg", label: "mcg per kg", mgFactor: 0.001 },
  { id: "mg", label: "mg per kg", mgFactor: 1 },
  { id: "g", label: "g per kg", mgFactor: 1000 },
];

export const WEIGHT_UNITS = [
  { id: "kg", label: "Kilograms", kgFactor: 1 },
  { id: "lb", label: "Pounds", kgFactor: KG_PER_LB },
];

/** Whether the prescribed mg/kg figure is a whole-day total or one single dose. */
export const BASES = [
  { id: "per-day", label: "Per day, split into divided doses" },
  { id: "per-dose", label: "Per single dose" },
];

/**
 * Accepted body-weight window in kilograms. The lower bound covers extremely
 * preterm newborns (around 300 g) and the upper bound sits above the heaviest
 * recorded adult weights, so anything outside is a typo or the wrong unit.
 */
export const MIN_WEIGHT_KG = 0.3;
export const MAX_WEIGHT_KG = 400;

/** Doses per day cannot sensibly exceed hourly administration. */
export const MAX_DOSES_PER_DAY = 24;

const toNumber = (raw) => {
  if (typeof raw === "number") return raw;
  if (raw === null || raw === undefined) return NaN;
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  return Number(text);
};

const isBlank = (raw) =>
  raw === null || raw === undefined || (typeof raw === "string" && raw.trim() === "");

export function getStrengthUnit(id) {
  return STRENGTH_UNITS.find((entry) => entry.id === id) || null;
}

export function getWeightUnit(id) {
  return WEIGHT_UNITS.find((entry) => entry.id === id) || null;
}

/** Round a millilitre volume to the nearest 0.1 mL, the finest mark on an oral syringe. */
export function roundToSyringeMark(millilitres) {
  return Math.round(millilitres * 10) / 10;
}

/**
 * Convert a weight-based instruction into concrete amounts.
 *
 * @param {object} input
 * @param {number|string} input.weight Body weight.
 * @param {"kg"|"lb"} input.weightUnit
 * @param {number|string} input.dosePerKg Prescribed strength per kilogram.
 * @param {"mcg"|"mg"|"g"} input.strengthUnit
 * @param {"per-day"|"per-dose"} input.basis Whether dosePerKg is a daily or single dose.
 * @param {number|string} input.dosesPerDay How many times a day it is given.
 * @param {number|string} [input.concentrationMg] Liquid strength, mg per volume.
 * @param {number|string} [input.concentrationMl] Volume that strength is dissolved in, in mL.
 * @param {number|string} [input.maxSingleDoseMg] Optional single-dose ceiling in mg.
 * @param {number|string} [input.maxDailyDoseMg] Optional daily ceiling in mg.
 * @returns {object} dose amounts and flags, or { error }
 */
export function calculateWeightBasedDose({
  weight,
  weightUnit,
  dosePerKg,
  strengthUnit,
  basis,
  dosesPerDay,
  concentrationMg,
  concentrationMl,
  maxSingleDoseMg,
  maxDailyDoseMg,
}) {
  const strength = getStrengthUnit(strengthUnit);
  const weightDef = getWeightUnit(weightUnit);
  if (!strength) return { error: "Choose whether the prescription is in mcg, mg or g per kilogram." };
  if (!weightDef) return { error: "Choose whether the body weight is in kilograms or pounds." };
  if (!BASES.some((entry) => entry.id === basis)) {
    return { error: "Choose whether the per-kilogram figure is a daily total or a single dose." };
  }

  const weightValue = toNumber(weight);
  const doseValue = toNumber(dosePerKg);
  const frequency = toNumber(dosesPerDay);

  if (!Number.isFinite(weightValue) || !Number.isFinite(doseValue) || !Number.isFinite(frequency)) {
    return { error: "Enter body weight, dose per kilogram and doses per day as numbers." };
  }
  if (weightValue <= 0) return { error: "Body weight must be greater than zero." };
  if (doseValue < 0) return { error: "A dose per kilogram cannot be negative." };
  if (frequency <= 0) return { error: "There must be at least one dose per day." };
  if (frequency > MAX_DOSES_PER_DAY) {
    return { error: `More than ${MAX_DOSES_PER_DAY} doses a day is not a realistic schedule.` };
  }
  if (!Number.isInteger(frequency)) {
    return { error: "Doses per day must be a whole number, for example 2, 3 or 4." };
  }

  const weightKg = weightValue * weightDef.kgFactor;
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return {
      error: `Body weight works out to ${weightKg.toFixed(2)} kg, outside the ${MIN_WEIGHT_KG}-${MAX_WEIGHT_KG} kg range this tool accepts. Check the weight unit.`,
    };
  }

  const doseMgPerKg = doseValue * strength.mgFactor;
  const singleDoseMg = basis === "per-dose" ? doseMgPerKg * weightKg : (doseMgPerKg * weightKg) / frequency;
  const dailyDoseMg = basis === "per-dose" ? singleDoseMg * frequency : doseMgPerKg * weightKg;

  // Optional liquid concentration, expressed as "X mg in Y mL". A problem here
  // (only one field filled, or an invalid/zero value) must not blank the whole
  // result — the mg-dose figures above need no concentration data at all, so
  // they are still returned. Only the mL figures are affected, flagged via
  // `concentrationError` instead of the top-level `error`.
  let mgPerMl = null;
  let concentrationError = null;
  const concentrationMgBlank = isBlank(concentrationMg);
  const concentrationMlBlank = isBlank(concentrationMl);
  if (concentrationMgBlank && concentrationMlBlank) {
    // No liquid strength entered — nothing to convert, and not an error.
  } else if (concentrationMgBlank || concentrationMlBlank) {
    concentrationError = "Enter both the mg and mL parts of the liquid strength, for example 250 mg in 5 mL.";
  } else {
    const cMg = toNumber(concentrationMg);
    const cMl = toNumber(concentrationMl);
    if (!Number.isFinite(cMg) || !Number.isFinite(cMl)) {
      concentrationError = "Enter the liquid strength as two numbers, for example 250 mg in 5 mL.";
    } else if (cMg <= 0) {
      concentrationError = "The milligram part of the liquid strength must be greater than zero.";
    } else if (cMl <= 0) {
      concentrationError = "The millilitre part of the liquid strength must be greater than zero.";
    } else {
      mgPerMl = cMg / cMl;
    }
  }

  const singleDoseMl = mgPerMl ? singleDoseMg / mgPerMl : null;
  const dailyDoseMl = mgPerMl ? dailyDoseMg / mgPerMl : null;

  const singleCap = isBlank(maxSingleDoseMg) ? null : toNumber(maxSingleDoseMg);
  const dailyCap = isBlank(maxDailyDoseMg) ? null : toNumber(maxDailyDoseMg);
  if (singleCap !== null && (!Number.isFinite(singleCap) || singleCap <= 0)) {
    return { error: "A maximum single dose must be a number greater than zero, or left blank." };
  }
  if (dailyCap !== null && (!Number.isFinite(dailyCap) || dailyCap <= 0)) {
    return { error: "A maximum daily dose must be a number greater than zero, or left blank." };
  }

  const intervalHours = 24 / frequency;

  return {
    weightKg,
    weightLb: weightKg / KG_PER_LB,
    doseMgPerKg,
    basis,
    dosesPerDay: frequency,
    intervalHours,
    singleDoseMg,
    dailyDoseMg,
    singleDoseMcg: singleDoseMg * 1000,
    dailyDoseG: dailyDoseMg / 1000,
    mgPerMl,
    concentrationError,
    singleDoseMl,
    dailyDoseMl,
    singleDoseMlRounded: singleDoseMl === null ? null : roundToSyringeMark(singleDoseMl),
    maxSingleDoseMg: singleCap,
    maxDailyDoseMg: dailyCap,
    exceedsSingleCap: singleCap !== null && singleDoseMg > singleCap,
    exceedsDailyCap: dailyCap !== null && dailyDoseMg > dailyCap,
    percentOfSingleCap: singleCap !== null ? (singleDoseMg / singleCap) * 100 : null,
    percentOfDailyCap: dailyCap !== null ? (dailyDoseMg / dailyCap) * 100 : null,
  };
}

/** Common paediatric liquid strengths offered as one-tap presets. */
export const CONCENTRATION_PRESETS = [
  { label: "120 mg in 5 mL", mg: 120, ml: 5 },
  { label: "125 mg in 5 mL", mg: 125, ml: 5 },
  { label: "250 mg in 5 mL", mg: 250, ml: 5 },
  { label: "100 mg in 1 mL", mg: 100, ml: 1 },
];
