/**
 * Body frame size from wrist circumference and height.
 *
 * Two independent published methods are implemented:
 *
 * 1. WRIST + HEIGHT BANDS — the table used by MedlinePlus / the US National
 *    Library of Medicine "Body frame size" entry. Wrist girth is measured in
 *    inches at the narrowest point, just distal to the wrist bone, and read
 *    against a height band.
 *
 * 2. HEIGHT-TO-WRIST RATIO (r = height / wrist circumference, same unit) — the
 *    ratio table long used in clinical nutrition texts. It needs no height
 *    bands, so it degrades gracefully outside the tabulated heights.
 *
 * Frame-adjusted ideal body weight uses the Hamwi (1964) formula with the
 * conventional +/- 10% small/large frame adjustment.
 */

/** 1 inch = 2.54 cm exactly (international inch). */
export const CM_PER_INCH = 2.54;
/** 1 kg = 2.2046226218 lb (international pound). */
export const LB_PER_KG = 2.2046226218;

/** Sanity limits so the tool never reports a frame for impossible input. */
export const HEIGHT_CM_MIN = 100;
export const HEIGHT_CM_MAX = 250;
export const WRIST_CM_MIN = 10;
export const WRIST_CM_MAX = 25;

/**
 * MedlinePlus wrist-circumference bands, in inches.
 * `maxHeightIn` is the exclusive upper edge of the height band (Infinity = open).
 * `small` is the exclusive upper edge of the small-frame wrist band and
 * `medium` the inclusive upper edge of the medium-frame wrist band.
 */
export const WRIST_BANDS_IN = {
  female: [
    // Under 5 ft 2 in (157.48 cm)
    { maxHeightIn: 62, label: "under 5 ft 2 in", small: 5.5, medium: 5.75 },
    // 5 ft 2 in to 5 ft 5 in
    { maxHeightIn: 65, label: "5 ft 2 in to 5 ft 5 in", small: 6.0, medium: 6.25 },
    // Over 5 ft 5 in (165.1 cm)
    { maxHeightIn: Infinity, label: "over 5 ft 5 in", small: 6.25, medium: 6.5 },
  ],
  male: [
    // MedlinePlus tabulates men over 5 ft 5 in only; the same band is applied
    // below that height and flagged in the result as an extrapolation.
    { maxHeightIn: Infinity, label: "over 5 ft 5 in", small: 6.5, medium: 7.5 },
  ],
};

/** Height below which the male wrist band is an extrapolation (5 ft 5 in). */
export const MALE_TABLE_MIN_HEIGHT_IN = 65;

/**
 * Height-to-wrist ratio thresholds (r = height / wrist circumference).
 * `smallAbove` = r greater than this is a small frame.
 * `largeBelow` = r less than this is a large frame; between the two is medium.
 */
export const RATIO_THRESHOLDS = {
  male: { smallAbove: 10.4, largeBelow: 9.6 },
  female: { smallAbove: 11.0, largeBelow: 10.1 },
};

/**
 * Hamwi (1964) ideal body weight.
 * Men: 48.0 kg at 5 ft, +2.7 kg for each inch above 5 ft.
 * Women: 45.5 kg at 5 ft, +2.2 kg for each inch above 5 ft.
 */
export const HAMWI = {
  male: { baseKg: 48.0, perInchKg: 2.7 },
  female: { baseKg: 45.5, perInchKg: 2.2 },
};
/** Conventional Hamwi frame adjustment: small -10%, large +10%. */
export const FRAME_WEIGHT_ADJUSTMENT = { small: -0.1, medium: 0, large: 0.1 };
/** 5 ft expressed in inches — the Hamwi base height. */
export const HAMWI_BASE_HEIGHT_IN = 60;

export const FRAME_LABEL = {
  small: "Small frame",
  medium: "Medium frame",
  large: "Large frame",
};

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a height entry to centimetres. Returns NaN for unusable input. */
export function resolveHeightCm({ unit = "cm", cm, feet, inches } = {}) {
  if (unit === "ftin") {
    const ft = isNumber(feet) ? feet : 0;
    const inch = isNumber(inches) ? inches : 0;
    if (!isNumber(feet) && !isNumber(inches)) return NaN;
    return (ft * 12 + inch) * CM_PER_INCH;
  }
  return isNumber(cm) ? cm : NaN;
}

/** Convert a wrist entry to centimetres. Returns NaN for unusable input. */
export function resolveWristCm({ unit = "cm", value } = {}) {
  if (!isNumber(value)) return NaN;
  return unit === "in" ? value * CM_PER_INCH : value;
}

/** Format centimetres as a feet-and-inches string, e.g. 178 -> "5 ft 10.1 in". */
export function formatFeetInches(cm) {
  if (!isNumber(cm) || cm <= 0) return "—";
  const totalInches = cm / CM_PER_INCH;
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches - feet * 12;
  return `${feet} ft ${inches.toFixed(1)} in`;
}

function bandForHeight(sex, heightIn) {
  const bands = WRIST_BANDS_IN[sex];
  return bands.find((band) => heightIn < band.maxHeightIn) || bands[bands.length - 1];
}

function frameFromBand(band, wristIn) {
  if (wristIn < band.small) return "small";
  if (wristIn <= band.medium) return "medium";
  return "large";
}

function frameFromRatio(sex, ratio) {
  const t = RATIO_THRESHOLDS[sex];
  if (ratio > t.smallAbove) return "small";
  if (ratio < t.largeBelow) return "large";
  return "medium";
}

/**
 * Frame-adjusted Hamwi ideal weight in kilograms.
 * Heights below 5 ft subtract at the same per-inch rate.
 */
export function hamwiIdealWeightKg(sex, heightCm, frame) {
  const rule = HAMWI[sex];
  if (!rule || !isNumber(heightCm) || heightCm <= 0) return NaN;
  const heightIn = heightCm / CM_PER_INCH;
  const medium = rule.baseKg + (heightIn - HAMWI_BASE_HEIGHT_IN) * rule.perInchKg;
  if (!(medium > 0)) return NaN;
  return medium * (1 + (FRAME_WEIGHT_ADJUSTMENT[frame] ?? 0));
}

/**
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.heightCm
 * @param {number} input.wristCm
 * @param {"wrist"|"ratio"} [input.method] which method decides the headline frame
 * @returns {object} result or { error }
 */
export function computeBodyFrame({ sex, heightCm, wristCm, method = "wrist" } = {}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose the reference table to use: male or female." };
  }
  if (!isNumber(heightCm) || !isNumber(wristCm)) {
    return { error: "Enter a height and a wrist circumference as numbers." };
  }
  if (heightCm < HEIGHT_CM_MIN || heightCm > HEIGHT_CM_MAX) {
    return {
      error: `Height must be between ${HEIGHT_CM_MIN} cm and ${HEIGHT_CM_MAX} cm.`,
    };
  }
  if (wristCm < WRIST_CM_MIN || wristCm > WRIST_CM_MAX) {
    return {
      error: `Wrist circumference must be between ${WRIST_CM_MIN} cm and ${WRIST_CM_MAX} cm — measure just above the wrist bone, snug but not tight.`,
    };
  }

  const heightIn = heightCm / CM_PER_INCH;
  const wristIn = wristCm / CM_PER_INCH;
  const band = bandForHeight(sex, heightIn);
  const wristFrame = frameFromBand(band, wristIn);

  const ratio = heightCm / wristCm;
  const ratioFrame = frameFromRatio(sex, ratio);

  const frame = method === "ratio" ? ratioFrame : wristFrame;
  const thresholds = RATIO_THRESHOLDS[sex];

  const idealWeightKg = hamwiIdealWeightKg(sex, heightCm, frame);
  const mediumWeightKg = hamwiIdealWeightKg(sex, heightCm, "medium");

  return {
    frame,
    frameLabel: FRAME_LABEL[frame],
    method,
    wristFrame,
    ratioFrame,
    methodsAgree: wristFrame === ratioFrame,
    heightCm,
    heightIn,
    wristCm,
    wristIn,
    ratio,
    bandLabel: band.label,
    bandSmallBelowIn: band.small,
    bandMediumMaxIn: band.medium,
    ratioSmallAbove: thresholds.smallAbove,
    ratioLargeBelow: thresholds.largeBelow,
    extrapolated: sex === "male" && heightIn < MALE_TABLE_MIN_HEIGHT_IN,
    idealWeightKg,
    idealWeightLb: idealWeightKg * LB_PER_KG,
    mediumWeightKg,
    frameAdjustmentPct: (FRAME_WEIGHT_ADJUSTMENT[frame] ?? 0) * 100,
  };
}
