/**
 * 25-hydroxyvitamin D — 25(OH)D — unit conversion and status banding.
 *
 * Serum 25(OH)D is the storage form measured by labs. Conventional (US) labs
 * report ng/mL; SI labs report nmol/L. The conversion is a pure molar-mass
 * conversion, so it is exact for a given assumed molar mass.
 */

/**
 * Molar mass of 25-hydroxyvitamin D3 (calcifediol), C27H44O2 = 400.64 g/mol.
 * Source: IUPAC atomic masses applied to the calcifediol formula; this is the
 * value used by the standard clinical conversion factor of 2.496.
 */
export const MOLAR_MASS_25OHD3_G_PER_MOL = 400.64;

/**
 * 1 ng/mL is identical to 1 ug/L. Dividing 1e-6 g/L by 400.64 g/mol gives
 * 2.496e-9 mol/L, i.e. 2.496 nmol/L. Many labs print the rounded factor 2.5.
 */
export const NMOL_PER_L_PER_NG_PER_ML = 1000 / MOLAR_MASS_25OHD3_G_PER_MOL;

/** The rounded factor printed on most lab reports and guideline tables. */
export const ROUNDED_FACTOR = 2.5;

export const UNITS = ["ng/mL", "nmol/L"];

/**
 * Highest value the converter will accept. Published case reports of vitamin D
 * intoxication top out in the hundreds of ng/mL; 1000 ng/mL (about 2496 nmol/L)
 * is far beyond any plausible assay result and signals a unit mix-up instead.
 */
export const MAX_NG_PER_ML = 1000;

/**
 * Status bands in ng/mL, following the Endocrine Society Clinical Practice
 * Guideline (2011) thresholds: deficiency below 20 ng/mL (50 nmol/L),
 * insufficiency 21-29 ng/mL (52.5-72.5 nmol/L), sufficiency 30 ng/mL
 * (75 nmol/L) and above. Levels above 150 ng/mL (375 nmol/L) are the range
 * associated with vitamin D intoxication and hypercalcaemia.
 * `max` is the exclusive upper edge of the band, in ng/mL.
 */
export const STATUS_BANDS = [
  {
    key: "severe",
    label: "Severe deficiency",
    tone: "danger",
    max: 10,
    note: "Below 10 ng/mL (25 nmol/L) is the range linked with rickets and osteomalacia.",
  },
  {
    key: "deficient",
    label: "Deficiency",
    tone: "danger",
    max: 20,
    note: "Below 20 ng/mL (50 nmol/L) is classed as deficiency by the Endocrine Society.",
  },
  {
    key: "insufficient",
    label: "Insufficiency",
    tone: "warning",
    max: 30,
    note: "20-29 ng/mL (50-74 nmol/L) is insufficient by Endocrine Society targets, though the Institute of Medicine treats 20 ng/mL as adequate for bone health in most people.",
  },
  {
    key: "sufficient",
    label: "Sufficient",
    tone: "success",
    max: 100,
    note: "30-100 ng/mL (75-250 nmol/L) is the usual sufficiency range for adults.",
  },
  {
    key: "high",
    label: "Above the usual range",
    tone: "warning",
    max: 150,
    note: "100-150 ng/mL (250-375 nmol/L) is higher than any target range and is usually seen with high-dose supplementation.",
  },
  {
    key: "excess",
    label: "Potential toxicity range",
    tone: "danger",
    max: Infinity,
    note: "Above 150 ng/mL (375 nmol/L) is the range associated with vitamin D intoxication and raised blood calcium.",
  },
];

/**
 * Institute of Medicine / National Academy of Medicine (2011) cut-points,
 * expressed in ng/mL: risk of deficiency below 12, potentially inadequate
 * 12-19, adequate for practically all people at 20 and above.
 */
export const IOM_DEFICIENCY_NG = 12;
export const IOM_ADEQUATE_NG = 20;

/** Endocrine Society sufficiency target, in ng/mL. */
export const ENDOCRINE_TARGET_NG = 30;

/** Exact ng/mL -> nmol/L. */
export function ngPerMlToNmolPerL(ngPerMl) {
  return ngPerMl * NMOL_PER_L_PER_NG_PER_ML;
}

/** Exact nmol/L -> ng/mL. */
export function nmolPerLToNgPerMl(nmolPerL) {
  return nmolPerL / NMOL_PER_L_PER_NG_PER_ML;
}

/** Band lookup for a level already expressed in ng/mL. */
export function bandForNgPerMl(ngPerMl) {
  return STATUS_BANDS.find((band) => ngPerMl < band.max) || STATUS_BANDS[STATUS_BANDS.length - 1];
}

/**
 * Convert a 25(OH)D reading and describe where it sits.
 *
 * @param {{ value: number|string, unit: "ng/mL"|"nmol/L" }} input
 * @returns {object} converted values plus banding, or { error }
 */
export function convertVitaminD({ value, unit }) {
  if (!UNITS.includes(unit)) {
    return { error: "Choose either ng/mL or nmol/L as the unit of the reading." };
  }

  const raw = typeof value === "string" ? value.replace(/,/g, "").trim() : value;
  if (raw === "" || raw === null || raw === undefined) {
    return { error: "Enter the 25(OH)D value printed on the lab report." };
  }

  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) {
    return { error: "Enter the reading as a number, for example 24 or 62.5." };
  }
  if (numeric < 0) {
    return { error: "A 25(OH)D level cannot be negative." };
  }

  const ngPerMl = unit === "ng/mL" ? numeric : nmolPerLToNgPerMl(numeric);
  const nmolPerL = unit === "ng/mL" ? ngPerMlToNmolPerL(numeric) : numeric;

  if (ngPerMl > MAX_NG_PER_ML) {
    return {
      error: `That is above ${MAX_NG_PER_ML} ng/mL (${Math.round(
        ngPerMlToNmolPerL(MAX_NG_PER_ML),
      )} nmol/L), which no assay reports. Check whether the units on the report are the other way round.`,
    };
  }

  const band = bandForNgPerMl(ngPerMl);
  const roundedNmol = numeric * ROUNDED_FACTOR;

  return {
    ngPerMl,
    nmolPerL,
    unit,
    inputValue: numeric,
    band: { key: band.key, label: band.label, tone: band.tone, note: band.note },
    iomAdequate: ngPerMl >= IOM_ADEQUATE_NG,
    iomDeficient: ngPerMl < IOM_DEFICIENCY_NG,
    meetsEndocrineTarget: ngPerMl >= ENDOCRINE_TARGET_NG,
    gapToTargetNg: Math.max(0, ENDOCRINE_TARGET_NG - ngPerMl),
    gapToTargetNmol: Math.max(0, ngPerMlToNmolPerL(ENDOCRINE_TARGET_NG - ngPerMl)),
    // Difference between the exact factor and the 2.5 shorthand printed on
    // many reports, so users can see why two calculators disagree slightly.
    roundedFactorResult: unit === "ng/mL" ? roundedNmol : numeric / ROUNDED_FACTOR,
    percentOfEndocrineTarget: (ngPerMl / ENDOCRINE_TARGET_NG) * 100,
  };
}

/** Reference rows for the on-page threshold table, in ng/mL. */
export const REFERENCE_ROWS = [
  { ng: 10, label: "Severe deficiency threshold" },
  { ng: 12, label: "IOM risk-of-deficiency cut-point" },
  { ng: 20, label: "Deficiency / IOM adequacy cut-point" },
  { ng: 30, label: "Endocrine Society sufficiency target" },
  { ng: 50, label: "Mid sufficiency range" },
  { ng: 100, label: "Upper end of the sufficiency range" },
  { ng: 150, label: "Intoxication threshold" },
];
