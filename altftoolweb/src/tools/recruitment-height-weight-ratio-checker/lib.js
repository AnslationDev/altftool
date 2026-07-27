/**
 * Height / weight ratio checker for Indian uniformed-service recruitment.
 *
 * Recruitment boards almost never publish a single "correct weight" for a
 * height. What they publish is:
 *   1. a minimum height (and for men, a chest measurement with a minimum
 *      expansion), checked at the Physical Standard Test (PST); and
 *   2. a rule that weight must be "proportionate to height and age", which the
 *      recruitment medical board assesses through Body Mass Index.
 *
 * So this module computes the acceptable WEIGHT BAND from the BMI window the
 * scheme's medical standard uses, and separately checks the published height
 * and chest minimums.
 *
 * BMI is the standard Quetelet index:  BMI = weight(kg) / height(m)^2
 * (Quetelet 1832; adopted by WHO as the adult overweight/obesity indicator).
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** WHO adult healthy-BMI window: 18.5 to 24.9 kg/m^2 (WHO Technical Report
 * Series 894, "Obesity: preventing and managing the global epidemic").
 * Recruitment medical boards typically apply 18.5–25. */
export const WHO_BMI_MIN = 18.5;
export const WHO_BMI_MAX = 25;

/** Centimetres in one inch, and kilograms per pound — exact SI definitions. */
export const CM_PER_INCH = 2.54;
export const KG_PER_POUND = 0.45359237;

/** Devine (1974) ideal body weight formula, still the reference "proportionate
 * weight" figure quoted in service medical notes:
 *   men   : 50.0 kg + 2.3 kg for each inch of height above 5 ft
 *   women : 45.5 kg + 2.3 kg for each inch of height above 5 ft
 * Source: Devine BJ, "Gentamicin therapy", Drug Intell Clin Pharm, 1974. */
export const DEVINE_BASE_KG = { male: 50, female: 45.5 };
export const DEVINE_KG_PER_INCH = 2.3;
export const DEVINE_BASE_HEIGHT_CM = 5 * 12 * CM_PER_INCH; // 152.4 cm = 5 ft

/**
 * Published physical standards for common all-India schemes.
 *
 * Every figure below is the general (unreserved) standard from the scheme's own
 * notification. Height relaxations exist for ST candidates, North-Eastern
 * states, Gorkha / Garhwali / Kumaoni / Dogra communities and several state
 * cadres — use the "Custom standard" option and type the number printed in your
 * own notification when a relaxation applies to you.
 */
export const SCHEMES = {
  army_gd: {
    id: "army_gd",
    label: "Indian Army Agniveer / Soldier GD (male)",
    sex: "male",
    minHeightCm: 170,
    minWeightKg: 50, // lowest weight accepted in most Army recruiting zones
    chestUnexpandedCm: 77,
    chestExpansionCm: 5, // 77 cm relaxed, 82 cm on full expansion
    bmiMin: WHO_BMI_MIN,
    bmiMax: WHO_BMI_MAX,
    note: "Army standards vary by recruiting zone and trade; regional relaxations apply.",
  },
  ssc_gd_male: {
    id: "ssc_gd_male",
    label: "SSC GD Constable — male (UR/OBC/EWS)",
    sex: "male",
    minHeightCm: 170,
    minWeightKg: null, // no absolute minimum published; medical board uses BMI
    chestUnexpandedCm: 80,
    chestExpansionCm: 5, // 80 cm unexpanded, 85 cm expanded
    bmiMin: 18,
    bmiMax: 25,
    note: "CAPF medical guidelines screen on BMI 18–25; height relaxations apply to ST, NE and hill communities.",
  },
  ssc_gd_female: {
    id: "ssc_gd_female",
    label: "SSC GD Constable — female (UR/OBC/EWS)",
    sex: "female",
    minHeightCm: 157,
    minWeightKg: null,
    chestUnexpandedCm: null, // chest is not measured for female candidates
    chestExpansionCm: null,
    bmiMin: 18,
    bmiMax: 25,
    note: "Chest measurement does not apply to female candidates.",
  },
  custom: {
    id: "custom",
    label: "Custom standard (type the figures from your notification)",
    sex: "male",
    minHeightCm: null,
    minWeightKg: null,
    chestUnexpandedCm: null,
    chestExpansionCm: null,
    bmiMin: WHO_BMI_MIN,
    bmiMax: WHO_BMI_MAX,
    note: "Enter the minimum height and chest printed in your own recruitment notification.",
  },
};

/** Sanity limits so absurd input produces a message, not a nonsense answer. */
export const MIN_HEIGHT_CM = 100;
export const MAX_HEIGHT_CM = 260;
export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 300;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round1 = (v) => Math.round(v * 10) / 10;
const round2 = (v) => Math.round(v * 100) / 100;

/**
 * Body Mass Index.
 *
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {{ bmi: number } | { error: string }}
 */
export function bodyMassIndex(weightKg, heightCm) {
  if (!isNum(weightKg) || !isNum(heightCm)) return { error: "Enter height and weight as numbers." };
  if (heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) {
    return { error: `Enter a height between ${MIN_HEIGHT_CM} cm and ${MAX_HEIGHT_CM} cm.` };
  }
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Enter a weight between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  const metres = heightCm / 100;
  return { bmi: weightKg / (metres * metres) };
}

/**
 * Weight band that keeps a given height inside a BMI window.
 * Rearranging BMI = kg / m^2 gives kg = BMI * m^2.
 *
 * @param {number} heightCm
 * @param {number} bmiMin
 * @param {number} bmiMax
 * @returns {{ minKg: number, maxKg: number } | { error: string }}
 */
export function weightBandForHeight(heightCm, bmiMin = WHO_BMI_MIN, bmiMax = WHO_BMI_MAX) {
  if (!isNum(heightCm) || heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) {
    return { error: `Enter a height between ${MIN_HEIGHT_CM} cm and ${MAX_HEIGHT_CM} cm.` };
  }
  if (!isNum(bmiMin) || !isNum(bmiMax) || bmiMin <= 0 || bmiMax <= bmiMin) {
    return { error: "The BMI window is not valid." };
  }
  const squareMetres = (heightCm / 100) ** 2;
  return { minKg: bmiMin * squareMetres, maxKg: bmiMax * squareMetres };
}

/**
 * Devine ideal body weight for a height.
 *
 * @param {number} heightCm
 * @param {"male"|"female"} sex
 * @returns {{ idealKg: number } | { error: string }}
 */
export function devineIdealWeight(heightCm, sex) {
  const base = DEVINE_BASE_KG[sex];
  if (base === undefined) return { error: "Choose male or female for the ideal-weight reference." };
  if (!isNum(heightCm) || heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) {
    return { error: `Enter a height between ${MIN_HEIGHT_CM} cm and ${MAX_HEIGHT_CM} cm.` };
  }
  const inchesOverFiveFeet = (heightCm - DEVINE_BASE_HEIGHT_CM) / CM_PER_INCH;
  const idealKg = base + DEVINE_KG_PER_INCH * inchesOverFiveFeet;
  // Below 5 ft the formula extrapolates downwards; clamp at a floor so it can
  // never return a negative or absurdly small "ideal" weight.
  return { idealKg: Math.max(idealKg, MIN_WEIGHT_KG) };
}

/**
 * Full physical-standard check for one candidate against one scheme.
 *
 * @param {object} input
 * @param {string} input.schemeId key of SCHEMES
 * @param {number} input.heightCm measured height
 * @param {number} input.weightKg measured weight
 * @param {number} [input.chestUnexpandedCm] measured relaxed chest
 * @param {number} [input.chestExpandedCm] measured fully expanded chest
 * @param {number} [input.customMinHeightCm] overrides scheme minimum height
 * @param {number} [input.customChestCm] overrides scheme unexpanded chest
 * @param {number} [input.customExpansionCm] overrides required expansion
 * @returns {object} result, or { error }
 */
export function checkRecruitmentStandards({
  schemeId,
  heightCm,
  weightKg,
  chestUnexpandedCm,
  chestExpandedCm,
  customMinHeightCm,
  customChestCm,
  customExpansionCm,
}) {
  const scheme = SCHEMES[schemeId];
  if (!scheme) return { error: "Choose a recruitment scheme." };

  const bmiResult = bodyMassIndex(weightKg, heightCm);
  if (bmiResult.error) return { error: bmiResult.error };

  const band = weightBandForHeight(heightCm, scheme.bmiMin, scheme.bmiMax);
  if (band.error) return { error: band.error };

  const ideal = devineIdealWeight(heightCm, scheme.sex);
  if (ideal.error) return { error: ideal.error };

  const minHeight = isNum(customMinHeightCm) && customMinHeightCm > 0
    ? customMinHeightCm
    : scheme.minHeightCm;
  const requiredChest = isNum(customChestCm) && customChestCm > 0
    ? customChestCm
    : scheme.chestUnexpandedCm;
  const requiredExpansion = isNum(customExpansionCm) && customExpansionCm > 0
    ? customExpansionCm
    : scheme.chestExpansionCm;

  const checks = [];

  if (isNum(minHeight)) {
    const shortfall = round1(minHeight - heightCm);
    checks.push({
      id: "height",
      label: "Minimum height",
      requirement: `${round1(minHeight)} cm`,
      measured: `${round1(heightCm)} cm`,
      pass: heightCm + 1e-9 >= minHeight,
      detail:
        heightCm + 1e-9 >= minHeight
          ? `${round1(heightCm - minHeight)} cm above the minimum.`
          : `${shortfall} cm short — height cannot be trained up, so check whether a category relaxation applies.`,
    });
  }

  const bmi = bmiResult.bmi;
  const weightPass = weightKg + 1e-9 >= band.minKg && weightKg - 1e-9 <= band.maxKg;
  checks.push({
    id: "weight",
    label: "Weight for this height",
    requirement: `${round1(band.minKg)}–${round1(band.maxKg)} kg (BMI ${scheme.bmiMin}–${scheme.bmiMax})`,
    measured: `${round1(weightKg)} kg`,
    pass: weightPass,
    detail: weightPass
      ? "Inside the band the medical board works to."
      : weightKg < band.minKg
        ? `Underweight for this height by ${round1(band.minKg - weightKg)} kg.`
        : `Over the band by ${round1(weightKg - band.maxKg)} kg.`,
  });

  if (isNum(scheme.minWeightKg)) {
    checks.push({
      id: "min-weight",
      label: "Absolute minimum weight",
      requirement: `${scheme.minWeightKg} kg`,
      measured: `${round1(weightKg)} kg`,
      pass: weightKg + 1e-9 >= scheme.minWeightKg,
      detail:
        weightKg + 1e-9 >= scheme.minWeightKg
          ? "Meets the floor set by the recruiting zone."
          : `${round1(scheme.minWeightKg - weightKg)} kg below the floor.`,
    });
  }

  if (isNum(requiredChest) && isNum(chestUnexpandedCm) && chestUnexpandedCm > 0) {
    checks.push({
      id: "chest",
      label: "Chest, relaxed",
      requirement: `${round1(requiredChest)} cm`,
      measured: `${round1(chestUnexpandedCm)} cm`,
      pass: chestUnexpandedCm + 1e-9 >= requiredChest,
      detail:
        chestUnexpandedCm + 1e-9 >= requiredChest
          ? "Meets the unexpanded chest standard."
          : `${round1(requiredChest - chestUnexpandedCm)} cm short.`,
    });
  }

  if (
    isNum(requiredExpansion) &&
    isNum(chestUnexpandedCm) &&
    isNum(chestExpandedCm) &&
    chestUnexpandedCm > 0 &&
    chestExpandedCm > 0
  ) {
    const expansion = chestExpandedCm - chestUnexpandedCm;
    checks.push({
      id: "expansion",
      label: "Chest expansion",
      requirement: `at least ${round1(requiredExpansion)} cm`,
      measured: `${round1(expansion)} cm`,
      pass: expansion + 1e-9 >= requiredExpansion,
      detail:
        expansion + 1e-9 >= requiredExpansion
          ? "Expansion is sufficient."
          : `Short by ${round1(requiredExpansion - expansion)} cm — expansion responds well to breathing and chest training.`,
    });
  }

  const failed = checks.filter((c) => !c.pass);

  return {
    scheme,
    bmi: round2(bmi),
    bmiMin: scheme.bmiMin,
    bmiMax: scheme.bmiMax,
    minWeightKg: round1(band.minKg),
    maxWeightKg: round1(band.maxKg),
    idealWeightKg: round1(ideal.idealKg),
    /** How far the measured weight sits from the middle of the accepted band. */
    weightToLoseKg: weightKg > band.maxKg ? round1(weightKg - band.maxKg) : 0,
    weightToGainKg: weightKg < band.minKg ? round1(band.minKg - weightKg) : 0,
    checks,
    passedCount: checks.length - failed.length,
    totalCount: checks.length,
    allPass: failed.length === 0,
    failedLabels: failed.map((c) => c.label),
  };
}

/**
 * Height -> acceptable weight band table, for the printed chart candidates
 * usually want alongside their own result.
 *
 * @param {number} fromCm
 * @param {number} toCm
 * @param {number} stepCm
 * @param {number} bmiMin
 * @param {number} bmiMax
 * @returns {Array<{ heightCm: number, minKg: number, maxKg: number }>}
 */
export function buildHeightWeightChart(fromCm, toCm, stepCm, bmiMin, bmiMax) {
  if (!isNum(fromCm) || !isNum(toCm) || !isNum(stepCm) || stepCm <= 0 || toCm < fromCm) return [];
  const rows = [];
  for (let h = fromCm; h <= toCm + 1e-9 && rows.length < 60; h += stepCm) {
    const band = weightBandForHeight(h, bmiMin, bmiMax);
    if (band.error) continue;
    rows.push({ heightCm: round1(h), minKg: round1(band.minKg), maxKg: round1(band.maxKg) });
  }
  return rows;
}

/**
 * Convert feet + inches to centimetres, for candidates who know their height
 * only in imperial units.
 *
 * @param {number} feet
 * @param {number} inches
 * @returns {{ cm: number } | { error: string }}
 */
export function feetInchesToCm(feet, inches) {
  if (!isNum(feet) || !isNum(inches) || feet < 0 || inches < 0) {
    return { error: "Enter feet and inches as non-negative numbers." };
  }
  return { cm: round1((feet * 12 + inches) * CM_PER_INCH) };
}
