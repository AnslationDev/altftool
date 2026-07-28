/**
 * Blood Glucose Unit Converter — pure conversion and reference-band logic.
 *
 * mg/dL is the conventional unit in the US, India and parts of Asia; mmol/L is
 * the SI unit used in the UK, Europe, Canada and Australia.
 */

/**
 * Glucose (C6H12O6) has a molar mass of 180.156 g/mol, so 1 mmol/L equals
 * 180.156 / 10 = 18.0156 mg/dL. The value universally quoted in clinical
 * chemistry and used by the ADA/IFCC conversion tables is 18.0182.
 * Check: 7.0 mmol/L x 18.0182 = 126.1 mg/dL, the published diabetes cut-off.
 */
export const MG_DL_PER_MMOL_L = 18.0182;

/** Above this the reading is outside anything a meter or lab will report. */
export const MAX_MG_DL = 2000;

export const UNITS = [
  { id: "mgdl", label: "mg/dL", short: "mg/dL" },
  { id: "mmoll", label: "mmol/L", short: "mmol/L" },
];

/**
 * ADA Standards of Care diagnostic and hypoglycaemia thresholds, in mg/dL.
 * Level 1 hypoglycaemia: below 70 mg/dL. Level 2 (clinically significant): below 54 mg/dL.
 * Fasting: normal below 100, prediabetes 100-125, diabetes 126 and above.
 * 2-hour OGTT / post-meal: normal below 140, prediabetes 140-199, diabetes 200 and above.
 */
export const HYPO_LEVEL_1_MGDL = 70;
export const HYPO_LEVEL_2_MGDL = 54;

export const CONTEXTS = [
  {
    id: "fasting",
    label: "Fasting (no food for 8 hours)",
    bands: [
      { id: "low-2", max: HYPO_LEVEL_2_MGDL, label: "Level 2 low", note: "Below 54 mg/dL (3.0 mmol/L) — clinically significant hypoglycaemia. Treat immediately and seek help." },
      { id: "low-1", max: HYPO_LEVEL_1_MGDL, label: "Low", note: "Below 70 mg/dL (3.9 mmol/L) — the ADA alert value for hypoglycaemia." },
      { id: "normal", max: 100, label: "Normal fasting", note: "70 to 99 mg/dL (3.9 to 5.5 mmol/L) is the normal fasting range." },
      { id: "pre", max: 126, label: "Prediabetes range", note: "100 to 125 mg/dL (5.6 to 6.9 mmol/L) is impaired fasting glucose." },
      { id: "diabetes", max: Infinity, label: "Diabetes range", note: "126 mg/dL (7.0 mmol/L) or above on two separate tests meets the ADA diagnostic threshold." },
    ],
  },
  {
    id: "postmeal",
    label: "2 hours after food or an OGTT",
    bands: [
      { id: "low-2", max: HYPO_LEVEL_2_MGDL, label: "Level 2 low", note: "Below 54 mg/dL (3.0 mmol/L) — clinically significant hypoglycaemia. Treat immediately and seek help." },
      { id: "low-1", max: HYPO_LEVEL_1_MGDL, label: "Low", note: "Below 70 mg/dL (3.9 mmol/L) — the ADA alert value for hypoglycaemia." },
      { id: "normal", max: 140, label: "Normal", note: "Under 140 mg/dL (7.8 mmol/L) two hours after glucose is the normal result." },
      { id: "pre", max: 200, label: "Prediabetes range", note: "140 to 199 mg/dL (7.8 to 11.0 mmol/L) is impaired glucose tolerance." },
      { id: "diabetes", max: Infinity, label: "Diabetes range", note: "200 mg/dL (11.1 mmol/L) or above at two hours meets the ADA diagnostic threshold." },
    ],
  },
  {
    id: "random",
    label: "Random / any time of day",
    bands: [
      { id: "low-2", max: HYPO_LEVEL_2_MGDL, label: "Level 2 low", note: "Below 54 mg/dL (3.0 mmol/L) — clinically significant hypoglycaemia. Treat immediately and seek help." },
      { id: "low-1", max: HYPO_LEVEL_1_MGDL, label: "Low", note: "Below 70 mg/dL (3.9 mmol/L) — the ADA alert value for hypoglycaemia." },
      { id: "normal", max: 200, label: "Not diagnostic on its own", note: "A random reading under 200 mg/dL (11.1 mmol/L) cannot confirm or rule out diabetes by itself." },
      { id: "diabetes", max: Infinity, label: "Diabetes range with symptoms", note: "200 mg/dL (11.1 mmol/L) or above with thirst, frequent urination or unexplained weight loss meets the ADA diagnostic threshold." },
    ],
  },
];

/** Handy equivalences for a reference table. */
export const REFERENCE_POINTS = [
  { mgdl: 54, meaning: "Level 2 hypoglycaemia" },
  { mgdl: 70, meaning: "Hypoglycaemia alert value" },
  { mgdl: 100, meaning: "Upper end of normal fasting" },
  { mgdl: 126, meaning: "Fasting diabetes threshold" },
  { mgdl: 140, meaning: "Upper end of normal at 2 hours" },
  { mgdl: 180, meaning: "Common post-meal target ceiling" },
  { mgdl: 200, meaning: "2-hour / random diabetes threshold" },
];

const toFinite = (value) => {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

export function mgdlToMmoll(mgdl) {
  if (!Number.isFinite(mgdl)) return NaN;
  return mgdl / MG_DL_PER_MMOL_L;
}

export function mmollToMgdl(mmoll) {
  if (!Number.isFinite(mmoll)) return NaN;
  return mmoll * MG_DL_PER_MMOL_L;
}

/** Pick the band whose upper bound the reading falls under. */
export function classifyGlucose(mgdl, contextId) {
  const context = CONTEXTS.find((item) => item.id === contextId) ?? CONTEXTS[0];
  const band = context.bands.find((item) => mgdl < item.max) ?? context.bands[context.bands.length - 1];
  return { contextLabel: context.label, ...band };
}

/**
 * Convert a reading and place it against the reference bands.
 *
 * @param {object} input
 * @param {number|string} input.value  The reading as entered.
 * @param {string} input.unit          "mgdl" or "mmoll" — the unit of `value`.
 * @param {string} input.context       "fasting" | "postmeal" | "random".
 */
export function convertGlucose({ value, unit = "mgdl", context = "fasting" } = {}) {
  const raw = toFinite(value);
  if (Number.isNaN(raw)) return { error: "Enter the reading as a number." };
  if (raw <= 0) return { error: "A blood glucose reading must be greater than zero." };
  if (!UNITS.some((item) => item.id === unit)) return { error: "Choose mg/dL or mmol/L." };

  const mgdl = unit === "mgdl" ? raw : mmollToMgdl(raw);
  if (!Number.isFinite(mgdl) || mgdl > MAX_MG_DL) {
    return {
      error: `That is above ${MAX_MG_DL} mg/dL (${(MAX_MG_DL / MG_DL_PER_MMOL_L).toFixed(1)} mmol/L) — check the unit you selected.`,
    };
  }

  const mmoll = mgdlToMmoll(mgdl);
  const band = classifyGlucose(mgdl, context);

  return {
    mgdl,
    mmoll,
    unit,
    band,
    isLow: mgdl < HYPO_LEVEL_1_MGDL,
    isSevereLow: mgdl < HYPO_LEVEL_2_MGDL,
  };
}
