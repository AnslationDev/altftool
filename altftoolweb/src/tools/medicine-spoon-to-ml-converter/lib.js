/**
 * Spoon-to-millilitre conversion for liquid medicines.
 *
 * Dosing spoons are a known source of medication error: the word "teaspoon"
 * means 5 mL on a medicine label but 4.93 mL in a US recipe, and an actual
 * kitchen teaspoon holds anywhere from about 2.5 mL to 7 mL. Every figure below
 * is a defined capacity, not a measurement of a real spoon.
 */

/**
 * Defined spoon capacities in millilitres.
 * - The 5 mL teaspoon and 15 mL tablespoon are the metric dosing spoons used on
 *   medicine labels and by the USP, which now recommends millilitres only.
 * - The US customary teaspoon is exactly 4.92892159375 mL (1/6 of a US fluid
 *   ounce) and the US customary tablespoon is three of those.
 * - The Australian tablespoon is 20 mL, four teaspoons rather than three.
 * - The US fluid ounce is exactly 29.5735295625 mL.
 */
export const SPOONS = [
  {
    id: "tsp-5",
    label: "Medicine teaspoon (5 mL)",
    ml: 5,
    note: "The teaspoon meant on a medicine label and on a supplied dosing spoon or syringe.",
  },
  {
    id: "dessertspoon",
    label: "Dessertspoon (10 mL)",
    ml: 10,
    note: "Two medicine teaspoons. Still used on some older UK and Indian labels.",
  },
  {
    id: "tbsp-15",
    label: "Medicine tablespoon (15 mL)",
    ml: 15,
    note: "Three medicine teaspoons; the metric tablespoon used in most of the world.",
  },
  {
    id: "tbsp-au",
    label: "Australian tablespoon (20 mL)",
    ml: 20,
    note: "Australia defines the tablespoon as four teaspoons, so it is a third larger than elsewhere.",
  },
  {
    id: "tsp-us",
    label: "US customary teaspoon (4.929 mL)",
    ml: 4.92892159375,
    note: "The recipe teaspoon: one sixth of a US fluid ounce, slightly under the 5 mL medicine spoon.",
  },
  {
    id: "tbsp-us",
    label: "US customary tablespoon (14.787 mL)",
    ml: 14.78676478125,
    note: "Three US customary teaspoons, half a US fluid ounce.",
  },
  {
    id: "floz-us",
    label: "US fluid ounce (29.574 mL)",
    ml: 29.5735295625,
    note: "Exactly 29.5735295625 mL by definition; six US customary teaspoons.",
  },
];

/** The reference dosing spoon everything is also expressed in. */
export const MEDICINE_TEASPOON_ML = 5;
export const MEDICINE_TABLESPOON_ML = 15;

/**
 * Observed capacity range of ordinary kitchen teaspoons in published studies of
 * household dosing, in millilitres. Used only for the on-page caution.
 */
export const KITCHEN_TEASPOON_RANGE_ML = { min: 2.5, max: 7.3 };

export const DIRECTIONS = ["spoons-to-ml", "ml-to-spoons"];

/** Refuse absurd volumes: 2 litres of a liquid medicine in one dose is a typo. */
export const MAX_ML = 2000;

const toNumber = (raw) => {
  if (typeof raw === "number") return raw;
  if (raw === null || raw === undefined) return NaN;
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  return Number(text);
};

const isBlank = (raw) =>
  raw === null || raw === undefined || (typeof raw === "string" && raw.trim() === "");

export function getSpoon(id) {
  return SPOONS.find((entry) => entry.id === id) || null;
}

/** Round to the nearest 0.1 mL, the finest mark on a standard oral syringe. */
export function roundToSyringeMark(millilitres) {
  return Math.round(millilitres * 10) / 10;
}

/**
 * Convert between spoons and millilitres.
 *
 * @param {object} input
 * @param {number|string} input.amount Quantity entered.
 * @param {"spoons-to-ml"|"ml-to-spoons"} input.direction Which way to convert.
 * @param {string} input.spoonId Which spoon definition applies.
 * @param {number|string} [input.concentrationMgPer5Ml] Optional label strength per 5 mL.
 * @returns {object} volumes, spoon counts and an optional milligram dose, or { error }
 */
export function convertSpoonVolume({ amount, direction, spoonId, concentrationMgPer5Ml }) {
  if (!DIRECTIONS.includes(direction)) {
    return { error: "Choose whether you are converting spoons into millilitres or the other way." };
  }
  const spoon = getSpoon(spoonId);
  if (!spoon) return { error: "Choose which spoon the instruction refers to." };

  const value = toNumber(amount);
  if (!Number.isFinite(value)) {
    return { error: "Enter the quantity as a number, for example 1, 1.5 or 7.5." };
  }
  if (value < 0) return { error: "A dose quantity cannot be negative." };

  const millilitres = direction === "spoons-to-ml" ? value * spoon.ml : value;
  if (millilitres > MAX_ML) {
    return { error: `That comes to more than ${MAX_ML} mL in one dose, which is not a realistic medicine volume.` };
  }

  const spoonCount = millilitres / spoon.ml;

  let mgPer5Ml = null;
  let doseMg = null;
  if (!isBlank(concentrationMgPer5Ml)) {
    mgPer5Ml = toNumber(concentrationMgPer5Ml);
    if (!Number.isFinite(mgPer5Ml) || mgPer5Ml <= 0) {
      return { error: "The label strength per 5 mL must be a number greater than zero, or left blank." };
    }
    doseMg = (millilitres / MEDICINE_TEASPOON_ML) * mgPer5Ml;
  }

  return {
    spoon,
    direction,
    inputAmount: value,
    millilitres,
    millilitresRounded: roundToSyringeMark(millilitres),
    spoonCount,
    medicineTeaspoons: millilitres / MEDICINE_TEASPOON_ML,
    medicineTablespoons: millilitres / MEDICINE_TABLESPOON_ML,
    usFluidOunces: millilitres / 29.5735295625,
    mgPer5Ml,
    doseMg,
    /** How far the chosen spoon is from the 5 mL medicine teaspoon, as a percentage. */
    differenceFromMedicineTeaspoonPct: ((spoon.ml - MEDICINE_TEASPOON_ML) / MEDICINE_TEASPOON_ML) * 100,
  };
}

/** Rows for the on-page comparison table. */
export const COMPARISON_ROWS = SPOONS.map((spoon) => ({
  id: spoon.id,
  label: spoon.label,
  ml: spoon.ml,
  teaspoons: spoon.ml / MEDICINE_TEASPOON_ML,
}));
