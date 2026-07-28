/**
 * Fat-Free Mass Index (FFMI) maths.
 *
 * FFMI = fat-free mass (kg) / height (m)^2. Because the index still drifts with
 * stature, Kouri et al. (1995) published a height-normalised variant that adjusts
 * every result to a 1.8 m reference height.
 */

/** Pounds to kilograms, exact international avoirdupois pound. */
export const LB_TO_KG = 0.45359237;

/** Inches to centimetres, exact. */
export const IN_TO_CM = 2.54;

/**
 * Height-normalisation coefficient and reference height from Kouri EM et al.,
 * "Fat-free mass index in users and nonusers of anabolic-androgenic steroids",
 * Clinical Journal of Sport Medicine, 1995.
 */
export const FFMI_NORMALISATION_COEFFICIENT = 6.1;
export const REFERENCE_HEIGHT_M = 1.8;

/**
 * In the same paper, essentially no drug-free athlete exceeded a normalised FFMI of
 * about 25, which is why 25 is quoted as the practical natural ceiling for men.
 */
export const NATURAL_FFMI_CEILING_MALE = 25;

/** The equivalent commonly quoted ceiling for drug-free women. */
export const NATURAL_FFMI_CEILING_FEMALE = 22;

/**
 * Interpretation bands. `min` is inclusive, the band runs up to the next band's min.
 * Male bands follow the Kouri distribution; female bands are the widely used
 * equivalent scale shifted down for lower typical lean mass.
 */
export const FFMI_BANDS_MALE = [
  { min: -Infinity, label: "Below average", note: "Lower lean mass than most untrained men." },
  { min: 18, label: "Average", note: "Typical for an untrained adult man." },
  { min: 20, label: "Above average", note: "Consistent with a year or two of consistent training." },
  { min: 22, label: "Excellent", note: "Well-muscled; several years of structured lifting." },
  { min: 24, label: "Superior", note: "Approaching the drug-free ceiling reported by Kouri." },
  { min: 26, label: "Very rare naturally", note: "Above the 25 ceiling; usually means measurement error or pharmacological help." },
  { min: 28, label: "Outside the natural range", note: "Almost never seen in drug-free athletes in published data." },
];

export const FFMI_BANDS_FEMALE = [
  { min: -Infinity, label: "Below average", note: "Lower lean mass than most untrained women." },
  { min: 14, label: "Average", note: "Typical for an untrained adult woman." },
  { min: 16, label: "Above average", note: "Consistent with regular resistance training." },
  { min: 18, label: "Excellent", note: "Well-muscled; several years of structured lifting." },
  { min: 20, label: "Superior", note: "Approaching the drug-free ceiling for women." },
  { min: 22, label: "Very rare naturally", note: "Above the usual drug-free ceiling of about 22." },
];

/** Sanity limits so nonsense input returns an explanation instead of a nonsense index. */
export const LIMITS = {
  weightKg: [20, 300],
  heightCm: [100, 250],
  bodyFatPct: [3, 70],
};

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

export function poundsToKg(lb) {
  return isFiniteNumber(lb) ? lb * LB_TO_KG : NaN;
}

export function feetInchesToCm(feet, inches) {
  if (!isFiniteNumber(feet) || !isFiniteNumber(inches)) return NaN;
  return (feet * 12 + inches) * IN_TO_CM;
}

function bandFor(value, bands) {
  let match = bands[0];
  for (const band of bands) {
    if (value >= band.min) match = band;
  }
  return match;
}

/**
 * @param {object} input
 * @param {number} input.weightKg    total body mass in kilograms
 * @param {number} input.heightCm    standing height in centimetres
 * @param {number} input.bodyFatPct  body fat percentage, 3-70
 * @param {"male"|"female"} input.sex used only to choose the interpretation band
 */
export function computeFfmi({ weightKg, heightCm, bodyFatPct, sex = "male" }) {
  if (!isFiniteNumber(weightKg) || !isFiniteNumber(heightCm) || !isFiniteNumber(bodyFatPct)) {
    return { error: "Enter a number for weight, height and body fat." };
  }
  if (weightKg < LIMITS.weightKg[0] || weightKg > LIMITS.weightKg[1]) {
    return { error: `Weight should be between ${LIMITS.weightKg[0]} kg and ${LIMITS.weightKg[1]} kg.` };
  }
  if (heightCm < LIMITS.heightCm[0] || heightCm > LIMITS.heightCm[1]) {
    return { error: `Height should be between ${LIMITS.heightCm[0]} cm and ${LIMITS.heightCm[1]} cm.` };
  }
  if (bodyFatPct < LIMITS.bodyFatPct[0] || bodyFatPct > LIMITS.bodyFatPct[1]) {
    return {
      error: `Body fat should be between ${LIMITS.bodyFatPct[0]}% and ${LIMITS.bodyFatPct[1]}% — below that is less than essential fat.`,
    };
  }

  const heightM = heightCm / 100;
  const heightSquared = heightM * heightM;

  const fatMassKg = weightKg * (bodyFatPct / 100);
  const leanMassKg = weightKg - fatMassKg;

  const ffmi = leanMassKg / heightSquared;
  const normalisedFfmi = ffmi + FFMI_NORMALISATION_COEFFICIENT * (REFERENCE_HEIGHT_M - heightM);

  const isFemale = sex === "female";
  const bands = isFemale ? FFMI_BANDS_FEMALE : FFMI_BANDS_MALE;
  const ceiling = isFemale ? NATURAL_FFMI_CEILING_FEMALE : NATURAL_FFMI_CEILING_MALE;
  const band = bandFor(normalisedFfmi, bands);

  // Lean mass that would put this person exactly at the drug-free ceiling, and the
  // scale weight that lean mass implies if body fat stayed where it is now.
  const ceilingLeanMassKg =
    (ceiling - FFMI_NORMALISATION_COEFFICIENT * (REFERENCE_HEIGHT_M - heightM)) * heightSquared;
  const leanMassHeadroomKg = ceilingLeanMassKg - leanMassKg;
  const ceilingScaleWeightKg = ceilingLeanMassKg / (1 - bodyFatPct / 100);

  return {
    heightM,
    fatMassKg,
    leanMassKg,
    ffmi,
    normalisedFfmi,
    band: band.label,
    bandNote: band.note,
    ceiling,
    ceilingLeanMassKg,
    leanMassHeadroomKg,
    ceilingScaleWeightKg,
    aboveCeiling: normalisedFfmi > ceiling,
    bmi: weightKg / heightSquared,
  };
}
