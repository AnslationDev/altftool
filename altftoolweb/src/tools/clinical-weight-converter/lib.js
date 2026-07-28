/**
 * Body-weight conversion for clinical forms and growth charts.
 *
 * Weight drives drug dosing, fluid volumes and growth charting, so the
 * conversion has to be exact and the recorded precision has to match the age
 * group. Birth weights are recorded to the gram, adult weights to 0.1 kg.
 */

/** International avoirdupois pound: exactly 0.45359237 kg (1959 agreement). */
export const KG_PER_LB = 0.45359237;
/** One avoirdupois ounce is exactly 1/16 lb. */
export const LB_PER_OZ = 1 / 16;
export const KG_PER_OZ = KG_PER_LB * LB_PER_OZ;
/** One stone is exactly 14 lb (UK imperial). */
export const LB_PER_STONE = 14;
export const KG_PER_STONE = KG_PER_LB * LB_PER_STONE;

/** How the weight is entered. Modes with `secondaryLabel` take two fields. */
export const UNIT_MODES = [
  { id: "kg", label: "Kilograms", primaryLabel: "Kilograms", secondaryLabel: null },
  { id: "g", label: "Grams", primaryLabel: "Grams", secondaryLabel: null },
  { id: "lb", label: "Pounds (decimal)", primaryLabel: "Pounds", secondaryLabel: null },
  { id: "lb-oz", label: "Pounds and ounces", primaryLabel: "Pounds", secondaryLabel: "Ounces" },
  { id: "st-lb", label: "Stones and pounds", primaryLabel: "Stones", secondaryLabel: "Pounds" },
];

/**
 * Recording precision by age group. Neonatal charts and drug calculations use
 * grams; the WHO and UK-WHO growth charts plot infants to the nearest 10 g;
 * older children and adults are recorded to the nearest 0.1 kg.
 */
export const ROUNDING_PROFILES = [
  { id: "none", label: "No rounding — exact value", stepKg: 0 },
  { id: "neonate", label: "Newborn — nearest 5 g", stepKg: 0.005 },
  { id: "infant", label: "Infant under 1 year — nearest 10 g", stepKg: 0.01 },
  { id: "standard", label: "Child or adult — nearest 0.1 kg", stepKg: 0.1 },
];

/**
 * Accepted range in kilograms: the lower bound sits under the smallest
 * surviving birth weights on record and the upper bound above the heaviest
 * recorded adult weight, so anything outside is a typo or the wrong unit.
 */
export const MIN_WEIGHT_KG = 0.2;
export const MAX_WEIGHT_KG = 650;

const toNumber = (raw) => {
  if (typeof raw === "number") return raw;
  if (raw === null || raw === undefined) return NaN;
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return 0;
  return Number(text);
};

export function getUnitMode(id) {
  return UNIT_MODES.find((entry) => entry.id === id) || null;
}

export function getRoundingProfile(id) {
  return ROUNDING_PROFILES.find((entry) => entry.id === id) || null;
}

/** Round a kilogram value to the nearest step; step 0 means no rounding. */
export function roundKg(kg, stepKg) {
  if (!stepKg) return kg;
  return Math.round(kg / stepKg) * stepKg;
}

/**
 * Split a decimal pound value into whole pounds and ounces, carrying when the
 * ounces round up to a full pound.
 */
export function splitPoundsOunces(totalPounds) {
  let pounds = Math.floor(totalPounds);
  let ounces = Math.round((totalPounds - pounds) * 16 * 10) / 10;
  if (ounces >= 16) {
    pounds += 1;
    ounces -= 16;
  }
  return { pounds, ounces };
}

/** Split a decimal pound value into whole stones and remaining pounds. */
export function splitStonesPounds(totalPounds) {
  let stones = Math.floor(totalPounds / LB_PER_STONE);
  let pounds = Math.round((totalPounds - stones * LB_PER_STONE) * 10) / 10;
  if (pounds >= LB_PER_STONE) {
    stones += 1;
    pounds -= LB_PER_STONE;
  }
  return { stones, pounds };
}

/**
 * Convert a body weight into every clinical representation.
 *
 * @param {object} input
 * @param {number|string} input.primary Main figure entered.
 * @param {number|string} [input.secondary] Second figure for lb+oz or st+lb.
 * @param {string} input.unitMode Which entry format is being used.
 * @param {string} input.roundingId Which recording precision to apply.
 * @returns {object} exact and rounded representations, or { error }
 */
export function convertClinicalWeight({ primary, secondary, unitMode, roundingId }) {
  const mode = getUnitMode(unitMode);
  if (!mode) return { error: "Choose the unit the weight was recorded in." };
  const profile = getRoundingProfile(roundingId);
  if (!profile) return { error: "Choose a recording precision." };

  const primaryValue = toNumber(primary);
  const secondaryValue = mode.secondaryLabel ? toNumber(secondary) : 0;

  if (!Number.isFinite(primaryValue) || !Number.isFinite(secondaryValue)) {
    return { error: "Enter the weight as a number, for example 3.4 or 7." };
  }
  if (primaryValue < 0 || secondaryValue < 0) {
    return { error: "A body weight cannot be negative." };
  }
  if (mode.id === "lb-oz" && secondaryValue >= 16) {
    return { error: "Ounces must be less than 16 — add the whole pounds to the pounds field." };
  }
  if (mode.id === "st-lb" && secondaryValue >= LB_PER_STONE) {
    return { error: `Pounds must be less than ${LB_PER_STONE} — add the whole stones to the stones field.` };
  }

  let exactKg;
  if (mode.id === "kg") exactKg = primaryValue;
  else if (mode.id === "g") exactKg = primaryValue / 1000;
  else if (mode.id === "lb") exactKg = primaryValue * KG_PER_LB;
  else if (mode.id === "lb-oz") exactKg = primaryValue * KG_PER_LB + secondaryValue * KG_PER_OZ;
  else exactKg = primaryValue * KG_PER_STONE + secondaryValue * KG_PER_LB;

  if (exactKg <= 0) return { error: "Body weight must be greater than zero." };
  if (exactKg < MIN_WEIGHT_KG || exactKg > MAX_WEIGHT_KG) {
    return {
      error: `That works out to ${exactKg.toFixed(3)} kg, outside the ${MIN_WEIGHT_KG}-${MAX_WEIGHT_KG} kg range this converter accepts. Check the unit you selected.`,
    };
  }

  const kg = roundKg(exactKg, profile.stepKg);
  const totalPounds = kg / KG_PER_LB;

  return {
    mode,
    profile,
    exactKg,
    kg,
    grams: kg * 1000,
    pounds: totalPounds,
    ounces: kg / KG_PER_OZ,
    stones: kg / KG_PER_STONE,
    poundsOunces: splitPoundsOunces(totalPounds),
    stonesPounds: splitStonesPounds(totalPounds),
    /** Difference introduced by the rounding step, in grams. */
    roundingShiftG: (kg - exactKg) * 1000,
  };
}

/** Reference rows for the on-page table, in kilograms. */
export const REFERENCE_ROWS = [1, 2.5, 3.5, 5, 10, 20, 50, 70, 100];
