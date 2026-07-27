/**
 * Classic ideal-body-measurement proportion systems.
 *
 * METHOD 1 — McCALLUM (John McCallum, "Keys to Progress", 1960s). Every target
 * is pinned to the wrist, because wrist girth is almost pure bone and barely
 * changes with training. Chest is 6.5 times the wrist, and every other target
 * is a fixed percentage of that chest measurement.
 *
 * METHOD 2 — REEVES (Steve Reeves' "classic physique" ratios). Each muscle is
 * sized against the joint nearest to it, so the targets scale with your own
 * skeleton rather than with a single wrist reading.
 *
 * Neither system is a medical standard. They are aesthetic targets from
 * mid-century physical culture and are reported here as such.
 */

/** 1 inch = 2.54 cm exactly. */
export const CM_PER_INCH = 2.54;

/** McCallum: chest = 6.5 x wrist circumference. */
export const MCCALLUM_CHEST_MULTIPLIER = 6.5;

/** McCallum: every other target as a fraction of the chest measurement. */
export const MCCALLUM_RATIOS = [
  { key: "chest", label: "Chest", ratio: 1, note: "6.5 × wrist" },
  { key: "hips", label: "Hips", ratio: 0.85, note: "85% of chest" },
  { key: "waist", label: "Waist", ratio: 0.7, note: "70% of chest" },
  { key: "thigh", label: "Thigh", ratio: 0.53, note: "53% of chest" },
  { key: "neck", label: "Neck", ratio: 0.37, note: "37% of chest" },
  { key: "arm", label: "Upper arm", ratio: 0.36, note: "36% of chest" },
  { key: "calf", label: "Calf", ratio: 0.34, note: "34% of chest" },
  { key: "forearm", label: "Forearm", ratio: 0.29, note: "29% of chest" },
];

/** Reeves: each target as a multiple of the nearest joint girth. */
export const REEVES_RATIOS = [
  { key: "arm", label: "Upper arm", from: "wrist", ratio: 2.52, note: "252% of wrist" },
  { key: "calf", label: "Calf", from: "ankle", ratio: 1.92, note: "192% of ankle" },
  { key: "neck", label: "Neck", from: "head", ratio: 0.79, note: "79% of head" },
  { key: "chest", label: "Chest", from: "pelvis", ratio: 1.48, note: "148% of pelvis" },
  { key: "waist", label: "Waist", from: "pelvis", ratio: 0.86, note: "86% of pelvis" },
  { key: "thigh", label: "Thigh", from: "knee", ratio: 1.75, note: "175% of knee" },
];

/** Golden ratio used for the shoulder-to-waist "Adonis index" check. */
export const GOLDEN_RATIO = 1.618;

/**
 * Waist-to-height ratio ceiling. UK NICE guidance on obesity assessment tells
 * adults to keep their waist to less than half their height.
 */
export const WAIST_HEIGHT_HEALTH_MAX = 0.5;

/** Plausible input ranges in centimetres, so the tool never scales nonsense. */
export const INPUT_RANGES_CM = {
  wrist: { min: 12, max: 25, label: "Wrist" },
  ankle: { min: 15, max: 35, label: "Ankle" },
  knee: { min: 25, max: 55, label: "Knee" },
  head: { min: 45, max: 70, label: "Head" },
  pelvis: { min: 60, max: 150, label: "Pelvis" },
  height: { min: 100, max: 250, label: "Height" },
};

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a length entry to centimetres. Returns NaN for unusable input. */
export function resolveLengthCm({ unit = "cm", value } = {}) {
  if (!isNumber(value)) return NaN;
  return unit === "in" ? value * CM_PER_INCH : value;
}

/** Centimetres to inches. */
export function cmToInches(cm) {
  return isNumber(cm) ? cm / CM_PER_INCH : NaN;
}

function rangeError(key, valueCm) {
  const range = INPUT_RANGES_CM[key];
  if (!isNumber(valueCm)) {
    return `Enter the ${range.label.toLowerCase()} measurement as a number.`;
  }
  if (valueCm < range.min || valueCm > range.max) {
    return `${range.label} girth must be between ${range.min} cm and ${range.max} cm (${(
      range.min / CM_PER_INCH
    ).toFixed(1)}–${(range.max / CM_PER_INCH).toFixed(1)} in).`;
  }
  return null;
}

function pack(key, label, note, cm) {
  return { key, label, note, cm, inches: cmToInches(cm) };
}

/**
 * @param {object} input
 * @param {"mccallum"|"reeves"} [input.method]
 * @param {number} input.wristCm
 * @param {number} [input.ankleCm] Reeves only
 * @param {number} [input.kneeCm] Reeves only
 * @param {number} [input.headCm] Reeves only
 * @param {number} [input.pelvisCm] Reeves only
 * @param {number} [input.heightCm] optional, enables the waist-to-height check
 * @returns {object} result or { error }
 */
export function computeIdealMeasurements({
  method = "mccallum",
  wristCm,
  ankleCm,
  kneeCm,
  headCm,
  pelvisCm,
  heightCm,
} = {}) {
  const wristError = rangeError("wrist", wristCm);
  if (wristError) return { error: wristError };

  let measurements = [];

  if (method === "reeves") {
    const sources = { wrist: wristCm, ankle: ankleCm, knee: kneeCm, head: headCm, pelvis: pelvisCm };
    for (const key of ["ankle", "knee", "head", "pelvis"]) {
      const err = rangeError(key, sources[key]);
      if (err) return { error: err };
    }
    measurements = REEVES_RATIOS.map((row) =>
      pack(row.key, row.label, row.note, sources[row.from] * row.ratio),
    );
  } else {
    const chestCm = wristCm * MCCALLUM_CHEST_MULTIPLIER;
    measurements = MCCALLUM_RATIOS.map((row) =>
      pack(row.key, row.label, row.note, chestCm * row.ratio),
    );
  }

  const waist = measurements.find((row) => row.key === "waist");
  const chest = measurements.find((row) => row.key === "chest");
  const shoulderCm = waist ? waist.cm * GOLDEN_RATIO : NaN;

  let waistHeightRatio = NaN;
  let waistHeightOk = null;
  let maxHealthyWaistCm = NaN;
  if (isNumber(heightCm) && !rangeError("height", heightCm) && waist) {
    waistHeightRatio = waist.cm / heightCm;
    maxHealthyWaistCm = heightCm * WAIST_HEIGHT_HEALTH_MAX;
    waistHeightOk = waistHeightRatio < WAIST_HEIGHT_HEALTH_MAX;
  }

  return {
    method,
    measurements,
    chestCm: chest ? chest.cm : NaN,
    chestInches: chest ? chest.inches : NaN,
    waistCm: waist ? waist.cm : NaN,
    shoulderCm,
    shoulderInches: cmToInches(shoulderCm),
    chestToWaist: chest && waist && waist.cm > 0 ? chest.cm / waist.cm : NaN,
    waistHeightRatio,
    waistHeightOk,
    maxHealthyWaistCm,
    maxHealthyWaistInches: cmToInches(maxHealthyWaistCm),
    wristCm,
    wristInches: cmToInches(wristCm),
  };
}
