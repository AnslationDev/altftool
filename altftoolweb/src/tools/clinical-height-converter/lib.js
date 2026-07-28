/**
 * Height and length conversion for clinical forms and growth charts.
 *
 * Height feeds BMI, body surface area, predicted lung function and drug dosing,
 * all of which are sensitive to a centimetre or two, so the inch is used at its
 * exact defined value rather than a rounded 2.5.
 */

/** The international inch is exactly 2.54 cm (1959 yard and pound agreement). */
export const CM_PER_INCH = 2.54;
/** One foot is exactly 12 inches, so 30.48 cm. */
export const INCHES_PER_FOOT = 12;
export const CM_PER_FOOT = CM_PER_INCH * INCHES_PER_FOOT;

/** How the height is entered. Modes with `secondaryLabel` take two fields. */
export const UNIT_MODES = [
  { id: "cm", label: "Centimetres", primaryLabel: "Centimetres", secondaryLabel: null },
  { id: "m", label: "Metres", primaryLabel: "Metres", secondaryLabel: null },
  { id: "in", label: "Inches (total)", primaryLabel: "Inches", secondaryLabel: null },
  { id: "ft-in", label: "Feet and inches", primaryLabel: "Feet", secondaryLabel: "Inches" },
];

/**
 * Recording precision. Growth charts and stadiometers read to 0.1 cm; many
 * adult records and self-reported forms use whole centimetres or half
 * centimetres, and rounding choice changes a derived BMI slightly.
 */
export const ROUNDING_PROFILES = [
  { id: "none", label: "No rounding — exact value", stepCm: 0 },
  { id: "tenth", label: "Stadiometer — nearest 0.1 cm", stepCm: 0.1 },
  { id: "half", label: "Nearest 0.5 cm", stepCm: 0.5 },
  { id: "whole", label: "Nearest whole centimetre", stepCm: 1 },
];

/**
 * Accepted range in centimetres. The lower bound sits below the crown-heel
 * length of an extremely preterm newborn and the upper bound above the tallest
 * verified adult height, so anything outside is a typo or the wrong unit.
 */
export const MIN_HEIGHT_CM = 20;
export const MAX_HEIGHT_CM = 275;

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

/** Round a centimetre value to the nearest step; step 0 means no rounding. */
export function roundCm(cm, stepCm) {
  if (!stepCm) return cm;
  return Math.round(cm / stepCm) * stepCm;
}

/**
 * Split a total inch value into whole feet and remaining inches, carrying when
 * the inches round up to a full foot.
 */
export function splitFeetInches(totalInches) {
  let feet = Math.floor(totalInches / INCHES_PER_FOOT);
  let inches = Math.round((totalInches - feet * INCHES_PER_FOOT) * 10) / 10;
  if (inches >= INCHES_PER_FOOT) {
    feet += 1;
    inches -= INCHES_PER_FOOT;
  }
  return { feet, inches };
}

/**
 * Convert a height into every clinical representation.
 *
 * @param {object} input
 * @param {number|string} input.primary Main figure entered.
 * @param {number|string} [input.secondary] Inches, when feet-and-inches is used.
 * @param {string} input.unitMode Entry format.
 * @param {string} input.roundingId Recording precision.
 * @returns {object} exact and rounded representations, or { error }
 */
export function convertClinicalHeight({ primary, secondary, unitMode, roundingId }) {
  const mode = getUnitMode(unitMode);
  if (!mode) return { error: "Choose the unit the height was recorded in." };
  const profile = getRoundingProfile(roundingId);
  if (!profile) return { error: "Choose a recording precision." };

  const primaryValue = toNumber(primary);
  const secondaryValue = mode.secondaryLabel ? toNumber(secondary) : 0;

  if (!Number.isFinite(primaryValue) || !Number.isFinite(secondaryValue)) {
    return { error: "Enter the height as a number, for example 170 or 5." };
  }
  if (primaryValue < 0 || secondaryValue < 0) {
    return { error: "A height cannot be negative." };
  }
  if (mode.id === "ft-in" && secondaryValue >= INCHES_PER_FOOT) {
    return { error: "Inches must be less than 12 — add the whole feet to the feet field." };
  }

  let exactCm;
  if (mode.id === "cm") exactCm = primaryValue;
  else if (mode.id === "m") exactCm = primaryValue * 100;
  else if (mode.id === "in") exactCm = primaryValue * CM_PER_INCH;
  else exactCm = primaryValue * CM_PER_FOOT + secondaryValue * CM_PER_INCH;

  if (exactCm <= 0) return { error: "Height must be greater than zero." };
  if (exactCm < MIN_HEIGHT_CM || exactCm > MAX_HEIGHT_CM) {
    return {
      error: `That works out to ${exactCm.toFixed(1)} cm, outside the ${MIN_HEIGHT_CM}-${MAX_HEIGHT_CM} cm range this converter accepts. Check the unit you selected.`,
    };
  }

  const cm = roundCm(exactCm, profile.stepCm);
  const metres = cm / 100;
  const totalInches = cm / CM_PER_INCH;

  return {
    mode,
    profile,
    exactCm,
    cm,
    metres,
    millimetres: cm * 10,
    totalInches,
    feetInches: splitFeetInches(totalInches),
    decimalFeet: totalInches / INCHES_PER_FOOT,
    /** Height squared in square metres — the denominator of the BMI formula. */
    heightSquaredM2: metres * metres,
    /** Difference introduced by the rounding step, in centimetres. */
    roundingShiftCm: cm - exactCm,
  };
}

/** Reference rows for the on-page table, in centimetres. */
export const REFERENCE_ROWS = [50, 75, 100, 120, 150, 160, 170, 180, 190];
