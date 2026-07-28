/**
 * Urea and BUN Converter — pure conversion, reference intervals and ratio maths.
 *
 * "BUN" (blood urea nitrogen) counts only the nitrogen in the urea molecule.
 * "Urea" counts the whole molecule. They are the same substance reported on two
 * different bases, which is why one number is roughly 2.14 times the other.
 */

/** Urea, CH4N2O, molar mass 60.06 g/mol. */
export const UREA_MOLAR_MASS = 60.06;

/** The two nitrogen atoms in urea weigh 2 x 14.007 = 28.014 g/mol. */
export const UREA_NITROGEN_MASS = 28.014;

/**
 * Mass ratio between urea and its nitrogen: 60.06 / 28.014 = 2.1439.
 * Check: BUN 14 mg/dL x 2.1439 = 30.0 mg/dL urea, the familiar equivalence.
 */
export const UREA_PER_BUN = UREA_MOLAR_MASS / UREA_NITROGEN_MASS;

/**
 * 1 mmol/L of urea weighs 60.06 mg/L, which is 6.006 mg/dL.
 * Check: BUN 20 mg/dL -> urea 42.9 mg/dL -> 7.1 mmol/L, as published.
 */
export const UREA_MGDL_PER_MMOLL = UREA_MOLAR_MASS / 10;

export const UNITS = [
  { id: "bunMgdl", label: "BUN (mg/dL)", step: "1" },
  { id: "ureaMgdl", label: "Urea (mg/dL)", step: "1" },
  { id: "ureaMmoll", label: "Urea (mmol/L)", step: "0.1" },
];

/**
 * Typical adult reference interval for blood urea nitrogen, 7 to 20 mg/dL.
 * The urea equivalents below are derived from it with the same factors the
 * converter uses. Laboratories publish slightly different intervals.
 */
export const BUN_REFERENCE_MIN_MGDL = 7;
export const BUN_REFERENCE_MAX_MGDL = 20;

/** Beyond this the value is not a serum urea result. */
export const MAX_BUN_MGDL = 300;

/**
 * BUN to creatinine ratio, both in mg/dL. Widely used teaching bands:
 * above 20:1 suggests a prerenal cause such as dehydration or a GI bleed,
 * below 10:1 points towards intrinsic renal disease or low urea production.
 */
export const RATIO_HIGH = 20;
export const RATIO_LOW = 10;

const toFinite = (value) => {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const isBlank = (value) => String(value ?? "").trim() === "";

export function bunToUreaMgdl(bunMgdl) {
  return Number.isFinite(bunMgdl) ? bunMgdl * UREA_PER_BUN : NaN;
}
export function ureaMgdlToBun(ureaMgdl) {
  return Number.isFinite(ureaMgdl) ? ureaMgdl / UREA_PER_BUN : NaN;
}
export function ureaMgdlToMmoll(ureaMgdl) {
  return Number.isFinite(ureaMgdl) ? ureaMgdl / UREA_MGDL_PER_MMOLL : NaN;
}
export function ureaMmollToMgdl(ureaMmoll) {
  return Number.isFinite(ureaMmoll) ? ureaMmoll * UREA_MGDL_PER_MMOLL : NaN;
}

export function classifyBun(bunMgdl) {
  if (!Number.isFinite(bunMgdl)) return null;
  if (bunMgdl < BUN_REFERENCE_MIN_MGDL) {
    return {
      id: "low",
      label: "Below the usual adult interval",
      note: `Below ${BUN_REFERENCE_MIN_MGDL} mg/dL BUN (${ureaMgdlToMmoll(bunToUreaMgdl(BUN_REFERENCE_MIN_MGDL)).toFixed(1)} mmol/L urea). Low urea can follow a low-protein diet, pregnancy, overhydration or advanced liver disease.`,
    };
  }
  if (bunMgdl > BUN_REFERENCE_MAX_MGDL) {
    return {
      id: "high",
      label: "Above the usual adult interval",
      note: `Above ${BUN_REFERENCE_MAX_MGDL} mg/dL BUN (${ureaMgdlToMmoll(bunToUreaMgdl(BUN_REFERENCE_MAX_MGDL)).toFixed(1)} mmol/L urea). Raised urea can follow dehydration, a high protein intake, gastrointestinal bleeding or reduced kidney function.`,
    };
  }
  return {
    id: "normal",
    label: "Within the usual adult interval",
    note: `${BUN_REFERENCE_MIN_MGDL} to ${BUN_REFERENCE_MAX_MGDL} mg/dL BUN is the interval most laboratories quote for adults.`,
  };
}

export function classifyRatio(ratio) {
  if (!Number.isFinite(ratio)) return null;
  if (ratio > RATIO_HIGH) {
    return {
      id: "high",
      label: "Above 20:1",
      note: "A ratio above 20:1 is classically associated with prerenal causes such as dehydration, heart failure or a gastrointestinal bleed, or with an obstruction below the kidney.",
    };
  }
  if (ratio < RATIO_LOW) {
    return {
      id: "low",
      label: "Below 10:1",
      note: "A ratio below 10:1 is classically associated with intrinsic kidney disease, or with low urea production from a low-protein diet or liver disease.",
    };
  }
  return {
    id: "normal",
    label: "Between 10:1 and 20:1",
    note: "This is the range usually described as normal for the BUN to creatinine ratio.",
  };
}

/**
 * Convert a urea result into all three reporting formats.
 *
 * @param {object} input
 * @param {number|string} input.value  Result as entered.
 * @param {string} input.unit          One of UNITS ids.
 * @param {number|string} [input.creatinineMgdl] Serum creatinine in mg/dL for the ratio; blank skips it.
 */
export function convertUrea({ value, unit = "bunMgdl", creatinineMgdl } = {}) {
  if (!UNITS.some((item) => item.id === unit)) {
    return { error: "Choose BUN mg/dL, urea mg/dL or urea mmol/L." };
  }

  const raw = toFinite(value);
  if (Number.isNaN(raw)) return { error: "Enter the result as a number." };
  if (raw <= 0) return { error: "The result must be greater than zero." };

  let bunMgdl;
  if (unit === "bunMgdl") bunMgdl = raw;
  else if (unit === "ureaMgdl") bunMgdl = ureaMgdlToBun(raw);
  else bunMgdl = ureaMgdlToBun(ureaMmollToMgdl(raw));

  if (!Number.isFinite(bunMgdl) || bunMgdl > MAX_BUN_MGDL) {
    return {
      error: `That works out to ${bunMgdl.toFixed(0)} mg/dL BUN, above anything an assay reports — check which format you selected.`,
    };
  }

  const ureaMgdl = bunToUreaMgdl(bunMgdl);
  const ureaMmoll = ureaMgdlToMmoll(ureaMgdl);

  let ratio = null;
  let ratioBand = null;
  let ratioNote = "Add a serum creatinine in mg/dL to also get the BUN to creatinine ratio.";
  if (!isBlank(creatinineMgdl)) {
    const creatinine = toFinite(creatinineMgdl);
    if (Number.isNaN(creatinine)) {
      return { error: "Creatinine must be a number in mg/dL, or leave it blank." };
    }
    if (creatinine <= 0) return { error: "Creatinine must be greater than zero." };
    if (creatinine > 30) {
      return { error: "Creatinine above 30 mg/dL is outside the reported range — check the unit." };
    }
    ratio = bunMgdl / creatinine;
    ratioBand = classifyRatio(ratio);
    ratioNote = "Ratio uses BUN and creatinine both in mg/dL, the basis the 10:1 and 20:1 bands are defined on.";
  }

  return {
    unit,
    bunMgdl,
    ureaMgdl,
    ureaMmoll,
    band: classifyBun(bunMgdl),
    ratio,
    ratioBand,
    ratioNote,
    reference: {
      bunMinMgdl: BUN_REFERENCE_MIN_MGDL,
      bunMaxMgdl: BUN_REFERENCE_MAX_MGDL,
      ureaMinMgdl: bunToUreaMgdl(BUN_REFERENCE_MIN_MGDL),
      ureaMaxMgdl: bunToUreaMgdl(BUN_REFERENCE_MAX_MGDL),
      ureaMinMmoll: ureaMgdlToMmoll(bunToUreaMgdl(BUN_REFERENCE_MIN_MGDL)),
      ureaMaxMmoll: ureaMgdlToMmoll(bunToUreaMgdl(BUN_REFERENCE_MAX_MGDL)),
    },
  };
}
