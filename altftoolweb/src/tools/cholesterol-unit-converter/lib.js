/**
 * Cholesterol Unit Converter — pure conversion, derived values and band logic.
 *
 * Cholesterol and triglycerides use DIFFERENT conversion factors because they
 * are different molecules, which is the mistake this tool exists to prevent.
 */

/**
 * Cholesterol (C27H46O) has a molar mass of 386.65 g/mol, so 1 mmol/L equals
 * 38.665 mg/dL. Clinical tables round this to 38.67.
 * Check: 200 mg/dL / 38.67 = 5.17 mmol/L, the published "desirable" ceiling.
 */
export const CHOL_MG_DL_PER_MMOL_L = 38.67;

/**
 * Triglycerides are reported as triolein equivalents, molar mass 885.4 g/mol,
 * giving 1 mmol/L = 88.54 mg/dL. Clinical tables use 88.57.
 * Check: 150 mg/dL / 88.57 = 1.69 mmol/L, the published "normal" ceiling.
 */
export const TRIG_MG_DL_PER_MMOL_L = 88.57;

/**
 * Friedewald equation (Friedewald, Levy & Fredrickson, Clin Chem 1972):
 * LDL = Total - HDL - Triglycerides/5, in mg/dL. It is not valid once
 * triglycerides reach 400 mg/dL (about 4.5 mmol/L).
 */
export const FRIEDEWALD_TG_DIVISOR = 5;
export const FRIEDEWALD_TG_LIMIT_MGDL = 400;

export const UNITS = [
  { id: "mgdl", label: "mg/dL" },
  { id: "mmoll", label: "mmol/L" },
];

/**
 * NCEP ATP III reference bands, in mg/dL — still the most widely printed
 * cut-offs on lab reports. Modern guidelines set individual LDL targets by
 * cardiovascular risk instead, so treat these as orientation, not targets.
 */
export const BANDS = {
  total: [
    { max: 200, label: "Desirable", tone: "good" },
    { max: 240, label: "Borderline high", tone: "warn" },
    { max: Infinity, label: "High", tone: "bad" },
  ],
  ldl: [
    { max: 100, label: "Optimal", tone: "good" },
    { max: 130, label: "Near optimal", tone: "good" },
    { max: 160, label: "Borderline high", tone: "warn" },
    { max: 190, label: "High", tone: "bad" },
    { max: Infinity, label: "Very high", tone: "bad" },
  ],
  triglycerides: [
    { max: 150, label: "Normal", tone: "good" },
    { max: 200, label: "Borderline high", tone: "warn" },
    { max: 500, label: "High", tone: "bad" },
    { max: Infinity, label: "Very high", tone: "bad" },
  ],
  nonHdl: [
    { max: 130, label: "Desirable", tone: "good" },
    { max: 160, label: "Above desirable", tone: "warn" },
    { max: 190, label: "Borderline high", tone: "warn" },
    { max: 220, label: "High", tone: "bad" },
    { max: Infinity, label: "Very high", tone: "bad" },
  ],
};

/** HDL is judged against a sex-specific low threshold; 60 mg/dL and above counts as protective. */
export const HDL_LOW_MALE_MGDL = 40;
export const HDL_LOW_FEMALE_MGDL = 50;
export const HDL_PROTECTIVE_MGDL = 60;

export const SEXES = [
  { id: "male", label: "Male (low HDL below 40 mg/dL)" },
  { id: "female", label: "Female (low HDL below 50 mg/dL)" },
];

/** Plausible reporting ranges in mg/dL — anything outside means a unit mix-up. */
const LIMITS = {
  total: { min: 20, max: 1000 },
  hdl: { min: 5, max: 200 },
  triglycerides: { min: 10, max: 5000 },
  ldl: { min: 5, max: 800 },
};

const toFinite = (value) => {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const isBlank = (value) => String(value ?? "").trim() === "";

export function cholMgdlToMmoll(mgdl) {
  return Number.isFinite(mgdl) ? mgdl / CHOL_MG_DL_PER_MMOL_L : NaN;
}
export function cholMmollToMgdl(mmoll) {
  return Number.isFinite(mmoll) ? mmoll * CHOL_MG_DL_PER_MMOL_L : NaN;
}
export function trigMgdlToMmoll(mgdl) {
  return Number.isFinite(mgdl) ? mgdl / TRIG_MG_DL_PER_MMOL_L : NaN;
}
export function trigMmollToMgdl(mmoll) {
  return Number.isFinite(mmoll) ? mmoll * TRIG_MG_DL_PER_MMOL_L : NaN;
}

function bandFor(key, mgdl) {
  const list = BANDS[key];
  if (!list) return null;
  return list.find((band) => mgdl < band.max) ?? list[list.length - 1];
}

function hdlBand(mgdl, sex) {
  const lowCut = sex === "female" ? HDL_LOW_FEMALE_MGDL : HDL_LOW_MALE_MGDL;
  if (mgdl < lowCut) return { label: "Low (counts as a risk factor)", tone: "bad" };
  if (mgdl >= HDL_PROTECTIVE_MGDL) return { label: "High (protective)", tone: "good" };
  return { label: "Acceptable", tone: "warn" };
}

/**
 * Convert a whole lipid panel and derive non-HDL, the total-to-HDL ratio and,
 * when LDL is not measured, the Friedewald LDL estimate.
 *
 * @param {object} input
 * @param {string} input.unit  "mgdl" or "mmoll" — the unit of every value entered.
 * @param {string|number} input.total          Total cholesterol.
 * @param {string|number} input.hdl            HDL cholesterol.
 * @param {string|number} input.triglycerides  Triglycerides.
 * @param {string|number} [input.ldl]          Measured LDL; blank to estimate it.
 * @param {string} [input.sex]                 "male" | "female", for the HDL band only.
 */
export function convertLipidPanel({
  unit = "mgdl",
  total,
  hdl,
  triglycerides,
  ldl,
  sex = "male",
} = {}) {
  if (!UNITS.some((item) => item.id === unit)) return { error: "Choose mg/dL or mmol/L." };

  const rawTotal = toFinite(total);
  const rawHdl = toFinite(hdl);
  const rawTrig = toFinite(triglycerides);
  const ldlBlank = isBlank(ldl);
  const rawLdl = ldlBlank ? null : toFinite(ldl);

  if ([rawTotal, rawHdl, rawTrig].some((value) => Number.isNaN(value))) {
    return { error: "Enter total cholesterol, HDL and triglycerides as numbers." };
  }
  if (!ldlBlank && Number.isNaN(rawLdl)) {
    return { error: "LDL must be a number, or leave it blank to estimate it." };
  }
  if (rawTotal <= 0 || rawHdl <= 0 || rawTrig <= 0 || (!ldlBlank && rawLdl <= 0)) {
    return { error: "Lipid values must be greater than zero." };
  }

  const totalMgdl = unit === "mgdl" ? rawTotal : cholMmollToMgdl(rawTotal);
  const hdlMgdl = unit === "mgdl" ? rawHdl : cholMmollToMgdl(rawHdl);
  const trigMgdl = unit === "mgdl" ? rawTrig : trigMmollToMgdl(rawTrig);
  const ldlGiven = ldlBlank ? null : unit === "mgdl" ? rawLdl : cholMmollToMgdl(rawLdl);

  const outOfRange = [
    ["Total cholesterol", totalMgdl, LIMITS.total],
    ["HDL", hdlMgdl, LIMITS.hdl],
    ["Triglycerides", trigMgdl, LIMITS.triglycerides],
    ...(ldlGiven === null ? [] : [["LDL", ldlGiven, LIMITS.ldl]]),
  ].find(([, value, limit]) => value < limit.min || value > limit.max);

  if (outOfRange) {
    return {
      error: `${outOfRange[0]} works out to ${outOfRange[1].toFixed(0)} mg/dL, outside the range labs report — check which unit you selected.`,
    };
  }
  if (hdlMgdl >= totalMgdl) {
    return { error: "HDL cannot be equal to or higher than total cholesterol." };
  }

  const nonHdlMgdl = totalMgdl - hdlMgdl;

  let ldlMgdl = ldlGiven;
  let ldlEstimated = false;
  let ldlNote = "Measured LDL as entered.";
  if (ldlGiven === null) {
    if (trigMgdl >= FRIEDEWALD_TG_LIMIT_MGDL) {
      ldlMgdl = null;
      ldlNote = `Triglycerides are ${trigMgdl.toFixed(0)} mg/dL, at or above the ${FRIEDEWALD_TG_LIMIT_MGDL} mg/dL limit where the Friedewald equation stops being valid. LDL must be measured directly.`;
    } else {
      ldlMgdl = totalMgdl - hdlMgdl - trigMgdl / FRIEDEWALD_TG_DIVISOR;
      ldlEstimated = true;
      ldlNote = "Estimated with the Friedewald equation: LDL = total - HDL - triglycerides/5.";
      if (ldlMgdl <= 0) {
        ldlMgdl = null;
        ldlNote =
          "The Friedewald estimate comes out at zero or below with these numbers, so LDL cannot be estimated. Check the values or ask for a direct LDL measurement.";
      }
    }
  }

  const build = (mgdl, kind, bandKey) => {
    if (mgdl === null || !Number.isFinite(mgdl)) return null;
    const mmoll = kind === "trig" ? trigMgdlToMmoll(mgdl) : cholMgdlToMmoll(mgdl);
    return { mgdl, mmoll, band: bandKey ? bandFor(bandKey, mgdl) : null };
  };

  return {
    unit,
    total: build(totalMgdl, "chol", "total"),
    hdl: { ...build(hdlMgdl, "chol", null), band: hdlBand(hdlMgdl, sex) },
    triglycerides: build(trigMgdl, "trig", "triglycerides"),
    nonHdl: build(nonHdlMgdl, "chol", "nonHdl"),
    ldl: build(ldlMgdl, "chol", "ldl"),
    ldlEstimated,
    ldlNote,
    ratio: totalMgdl / hdlMgdl,
  };
}
