/**
 * HbA1c to Average Glucose Converter — pure conversion maths.
 *
 * Handles all four ways an HbA1c result gets reported:
 *   DCCT/NGSP percent, IFCC mmol/mol, estimated average glucose in mg/dL,
 *   and estimated average glucose in mmol/L.
 */

/**
 * ADAG study — Nathan DM et al., "Translating the A1C assay into estimated
 * average glucose values", Diabetes Care 2008;31:1473-8.
 *   eAG (mg/dL)  = 28.7 x A1C - 46.7
 *   eAG (mmol/L) = 1.5944 x A1C - 2.5944
 * Check: A1C 7.0% -> 154.2 mg/dL and 8.57 mmol/L, matching the published table.
 */
export const EAG_MGDL_SLOPE = 28.7;
export const EAG_MGDL_INTERCEPT = -46.7;
export const EAG_MMOLL_SLOPE = 1.5944;
export const EAG_MMOLL_INTERCEPT = -2.5944;

/**
 * NGSP/IFCC master equation:
 *   IFCC (mmol/mol) = (DCCT% - 2.15) x 10.929
 * Check: 7.0% -> 53 mmol/mol, 6.5% -> 48 mmol/mol, as published by the NGSP.
 */
export const IFCC_OFFSET_PERCENT = 2.15;
export const IFCC_FACTOR = 10.929;

/** The ADAG regression was derived from A1C values of roughly 4% to 12%. */
export const ADAG_VALID_MIN_PERCENT = 4;
export const ADAG_VALID_MAX_PERCENT = 12;

/** Outside this the value is not a plausible HbA1c result at all. */
export const MIN_A1C_PERCENT = 3;
export const MAX_A1C_PERCENT = 20;

/**
 * ADA Standards of Care diagnostic bands for HbA1c, and the general glycaemic
 * target of below 7.0% (53 mmol/mol) for many non-pregnant adults with diabetes.
 */
export const A1C_PREDIABETES_PERCENT = 5.7;
export const A1C_DIABETES_PERCENT = 6.5;
export const A1C_COMMON_TARGET_PERCENT = 7.0;

export const INPUT_UNITS = [
  { id: "percent", label: "HbA1c — DCCT / NGSP (%)", step: "0.1" },
  { id: "ifcc", label: "HbA1c — IFCC (mmol/mol)", step: "1" },
  { id: "eagMgdl", label: "Average glucose (mg/dL)", step: "1" },
  { id: "eagMmoll", label: "Average glucose (mmol/L)", step: "0.1" },
];

export const BANDS = [
  {
    id: "normal",
    max: A1C_PREDIABETES_PERCENT,
    label: "Normal",
    note: "Below 5.7% (39 mmol/mol) is the normal range in the ADA Standards of Care.",
  },
  {
    id: "prediabetes",
    max: A1C_DIABETES_PERCENT,
    label: "Prediabetes range",
    note: "5.7% to 6.4% (39 to 47 mmol/mol) is the ADA prediabetes range.",
  },
  {
    id: "diabetes-at-target",
    max: A1C_COMMON_TARGET_PERCENT,
    label: "Diabetes range, within the common target",
    note: "6.5% (48 mmol/mol) and above meets the ADA diagnostic threshold for diabetes; this result is still under the general 7.0% target used for many adults.",
  },
  {
    id: "diabetes-above-target",
    max: Infinity,
    label: "Diabetes range, above the common target",
    note: "7.0% (53 mmol/mol) and above sits over the general adult target. Individual targets are set by your clinician and may be higher or lower.",
  },
];

const toFinite = (value) => {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

export function a1cToEagMgdl(percent) {
  return Number.isFinite(percent) ? EAG_MGDL_SLOPE * percent + EAG_MGDL_INTERCEPT : NaN;
}
export function a1cToEagMmoll(percent) {
  return Number.isFinite(percent) ? EAG_MMOLL_SLOPE * percent + EAG_MMOLL_INTERCEPT : NaN;
}
export function eagMgdlToA1c(mgdl) {
  return Number.isFinite(mgdl) ? (mgdl - EAG_MGDL_INTERCEPT) / EAG_MGDL_SLOPE : NaN;
}
export function eagMmollToA1c(mmoll) {
  return Number.isFinite(mmoll) ? (mmoll - EAG_MMOLL_INTERCEPT) / EAG_MMOLL_SLOPE : NaN;
}
export function a1cToIfcc(percent) {
  return Number.isFinite(percent) ? (percent - IFCC_OFFSET_PERCENT) * IFCC_FACTOR : NaN;
}
export function ifccToA1c(mmolPerMol) {
  return Number.isFinite(mmolPerMol) ? mmolPerMol / IFCC_FACTOR + IFCC_OFFSET_PERCENT : NaN;
}

export function classifyA1c(percent) {
  return BANDS.find((band) => percent < band.max) ?? BANDS[BANDS.length - 1];
}

/**
 * Convert a result entered in any one of the four units into all four.
 *
 * @param {object} input
 * @param {number|string} input.value Result as entered.
 * @param {string} input.unit         One of INPUT_UNITS ids.
 */
export function convertA1c({ value, unit = "percent" } = {}) {
  if (!INPUT_UNITS.some((item) => item.id === unit)) {
    return { error: "Choose one of the four result formats." };
  }
  const raw = toFinite(value);
  if (Number.isNaN(raw)) return { error: "Enter the result as a number." };
  if (raw <= 0) return { error: "The result must be greater than zero." };

  let derived;
  if (unit === "percent") derived = raw;
  else if (unit === "ifcc") derived = ifccToA1c(raw);
  else if (unit === "eagMgdl") derived = eagMgdlToA1c(raw);
  else derived = eagMmollToA1c(raw);

  if (!Number.isFinite(derived)) return { error: "That value could not be converted." };
  // HbA1c is reported to one decimal place; rounding here keeps the band, the
  // IFCC value and the eAG figures consistent with the percentage on screen.
  const percent = Math.round(derived * 100) / 100;
  if (percent < MIN_A1C_PERCENT || percent > MAX_A1C_PERCENT) {
    return {
      error: `That works out to an HbA1c of ${percent.toFixed(1)}%, outside the ${MIN_A1C_PERCENT}% to ${MAX_A1C_PERCENT}% range results fall in — check which format you selected.`,
    };
  }

  const eagMgdl = a1cToEagMgdl(percent);
  const eagMmoll = a1cToEagMmoll(percent);
  const ifcc = a1cToIfcc(percent);
  const band = classifyA1c(percent);
  const extrapolated = percent < ADAG_VALID_MIN_PERCENT || percent > ADAG_VALID_MAX_PERCENT;

  return {
    percent,
    ifcc,
    eagMgdl,
    eagMmoll,
    band,
    extrapolated,
    unit,
  };
}

/** Rows for a reference table, built from the same equations as the converter. */
export function referenceTable(percents = [5, 5.7, 6, 6.5, 7, 7.5, 8, 9, 10, 12]) {
  return percents.map((percent) => ({
    percent,
    ifcc: a1cToIfcc(percent),
    eagMgdl: a1cToEagMgdl(percent),
    eagMmoll: a1cToEagMmoll(percent),
  }));
}
