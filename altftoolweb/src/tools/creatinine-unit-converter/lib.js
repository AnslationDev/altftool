/**
 * Creatinine Unit Converter — pure conversion, reference ranges and eGFR maths.
 */

/**
 * Creatinine (C4H7N3O) has a molar mass of 113.12 g/mol.
 * 1 mg/dL = 10 mg/L = 10 / 113.12 mmol/L = 88.40 micromol/L.
 * The universally quoted clinical factor is 88.4.
 * Check: 1.2 mg/dL x 88.4 = 106 micromol/L, as printed on conversion tables.
 */
export const UMOL_PER_MGDL = 88.4;

/** Outside this the value is not a serum creatinine result. */
export const MAX_MGDL = 30;

/**
 * Below this the value is not a plausible serum creatinine result — even
 * severe muscle wasting rarely reads below ~0.2-0.3 mg/dL, and anything
 * lower is almost always a misplaced decimal (e.g. "0.12" typed for "1.2").
 */
export const MIN_MGDL = 0.2;

export const UNITS = [
  { id: "mgdl", label: "mg/dL" },
  { id: "umoll", label: "micromol/L (µmol/L)" },
];

/**
 * Typical adult serum creatinine reference intervals (mg/dL). Ranges are
 * assay- and laboratory-specific — always read them off your own report.
 */
export const REFERENCE_RANGES = [
  { id: "male", label: "Adult male", minMgdl: 0.74, maxMgdl: 1.35 },
  { id: "female", label: "Adult female", minMgdl: 0.59, maxMgdl: 1.04 },
];

/**
 * CKD-EPI 2021 creatinine equation (Inker LA et al., N Engl J Med 2021), the
 * race-free replacement for the 2009 equation:
 *   eGFR = 142 x min(Scr/k, 1)^a x max(Scr/k, 1)^-1.200 x 0.9938^age x 1.012 (if female)
 * with k = 0.7 and a = -0.241 for females, k = 0.9 and a = -0.302 for males.
 * Scr is in mg/dL and the result is mL/min/1.73 m2.
 * Check: 50-year-old male, Scr 1.0 mg/dL -> 92 mL/min/1.73 m2.
 */
export const CKD_EPI_2021 = {
  base: 142,
  ageFactor: 0.9938,
  femaleFactor: 1.012,
  upperExponent: -1.2,
  female: { kappa: 0.7, alpha: -0.241 },
  male: { kappa: 0.9, alpha: -0.302 },
};

/** CKD-EPI is validated in adults only. */
export const EGFR_MIN_AGE = 18;
export const EGFR_MAX_AGE = 110;

/** KDIGO 2012 GFR categories, in mL/min/1.73 m2. */
export const GFR_STAGES = [
  { id: "G1", min: 90, label: "G1 — normal or high", note: "eGFR 90 or above. Kidney disease is only diagnosed here if other markers such as albuminuria are present." },
  { id: "G2", min: 60, label: "G2 — mildly reduced", note: "eGFR 60 to 89. Common with age and not classed as chronic kidney disease on its own." },
  { id: "G3a", min: 45, label: "G3a — mild to moderate reduction", note: "eGFR 45 to 59." },
  { id: "G3b", min: 30, label: "G3b — moderate to severe reduction", note: "eGFR 30 to 44." },
  { id: "G4", min: 15, label: "G4 — severely reduced", note: "eGFR 15 to 29." },
  { id: "G5", min: 0, label: "G5 — kidney failure", note: "eGFR below 15." },
];

const toFinite = (value) => {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const isBlank = (value) => String(value ?? "").trim() === "";

export function mgdlToUmoll(mgdl) {
  return Number.isFinite(mgdl) ? mgdl * UMOL_PER_MGDL : NaN;
}
export function umollToMgdl(umoll) {
  return Number.isFinite(umoll) ? umoll / UMOL_PER_MGDL : NaN;
}

/**
 * CKD-EPI 2021 eGFR from serum creatinine in mg/dL.
 * @returns {number} mL/min/1.73 m2, or NaN if the inputs are unusable.
 */
export function ckdEpi2021({ creatinineMgdl, ageYears, sex }) {
  if (!Number.isFinite(creatinineMgdl) || creatinineMgdl <= 0) return NaN;
  if (!Number.isFinite(ageYears) || ageYears <= 0) return NaN;
  const coefficients = sex === "female" ? CKD_EPI_2021.female : CKD_EPI_2021.male;
  const ratio = creatinineMgdl / coefficients.kappa;
  const lower = Math.pow(Math.min(ratio, 1), coefficients.alpha);
  const upper = Math.pow(Math.max(ratio, 1), CKD_EPI_2021.upperExponent);
  const age = Math.pow(CKD_EPI_2021.ageFactor, ageYears);
  const sexFactor = sex === "female" ? CKD_EPI_2021.femaleFactor : 1;
  const result = CKD_EPI_2021.base * lower * upper * age * sexFactor;
  return Number.isFinite(result) ? result : NaN;
}

export function stageForEgfr(egfr) {
  if (!Number.isFinite(egfr)) return null;
  return GFR_STAGES.find((stage) => egfr >= stage.min) ?? GFR_STAGES[GFR_STAGES.length - 1];
}

/**
 * Convert a creatinine result and, when age is supplied, add the CKD-EPI eGFR.
 *
 * @param {object} input
 * @param {number|string} input.value  Creatinine as entered.
 * @param {string} input.unit          "mgdl" or "umoll".
 * @param {string} input.sex           "male" | "female" — sets the reference range and eGFR coefficients.
 * @param {number|string} [input.age]  Age in years; blank skips the eGFR.
 */
export function convertCreatinine({ value, unit = "mgdl", sex = "male", age } = {}) {
  if (!UNITS.some((item) => item.id === unit)) return { error: "Choose mg/dL or micromol/L." };

  const raw = toFinite(value);
  if (Number.isNaN(raw)) return { error: "Enter the creatinine result as a number." };
  if (raw <= 0) return { error: "Serum creatinine must be greater than zero." };

  const mgdl = unit === "mgdl" ? raw : umollToMgdl(raw);
  if (!Number.isFinite(mgdl) || mgdl > MAX_MGDL || mgdl < MIN_MGDL) {
    const direction = mgdl > MAX_MGDL ? "above" : "below";
    return {
      error: `That works out to ${mgdl.toFixed(2)} mg/dL (${mgdlToUmoll(mgdl).toFixed(0)} µmol/L), ${direction} anything a serum creatinine assay reports — check the unit and value you entered.`,
    };
  }

  const umoll = mgdlToUmoll(mgdl);
  const range = REFERENCE_RANGES.find((item) => item.id === sex) ?? REFERENCE_RANGES[0];
  const position =
    mgdl < range.minMgdl ? "below" : mgdl > range.maxMgdl ? "above" : "within";

  let egfr = null;
  let stage = null;
  let egfrNote = "Add your age to also estimate GFR with the CKD-EPI 2021 equation.";
  if (!isBlank(age)) {
    const years = toFinite(age);
    if (Number.isNaN(years)) {
      return { error: "Age must be a number, or leave it blank to skip the eGFR." };
    }
    if (years < EGFR_MIN_AGE || years > EGFR_MAX_AGE) {
      return {
        error: `The CKD-EPI 2021 equation is validated for adults aged ${EGFR_MIN_AGE} to ${EGFR_MAX_AGE}. Clear the age field to convert the units only.`,
      };
    }
    const computed = ckdEpi2021({ creatinineMgdl: mgdl, ageYears: years, sex });
    if (Number.isFinite(computed)) {
      egfr = computed;
      stage = stageForEgfr(computed);
      egfrNote = "Estimated with the CKD-EPI 2021 creatinine equation, reported per 1.73 m² of body surface area.";
    }
  }

  return {
    mgdl,
    umoll,
    unit,
    range,
    position,
    egfr,
    stage,
    egfrNote,
  };
}
