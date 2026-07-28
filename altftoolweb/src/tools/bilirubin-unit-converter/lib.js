/**
 * Bilirubin Unit Converter — pure conversion, derived fractions and banding.
 */

/**
 * Bilirubin (C33H36N4O6) has a molar mass of 584.66 g/mol.
 * 1 mg/dL = 10 mg/L = 10 / 584.66 mmol/L = 0.017104 mmol/L = 17.104 micromol/L.
 * The clinical factor printed on conversion tables is 17.1.
 * Check: 1.2 mg/dL x 17.1 = 20.5 micromol/L, the usual adult upper limit.
 */
export const UMOL_PER_MGDL = 17.1;

/** Above this the value is not a serum bilirubin result. */
export const MAX_MGDL = 60;

export const UNITS = [
  { id: "mgdl", label: "mg/dL", step: "0.1" },
  { id: "umoll", label: "micromol/L (µmol/L)", step: "1" },
];

/**
 * Typical adult reference intervals, in mg/dL. Laboratories differ slightly,
 * so always read the interval printed on your own report.
 */
export const REFERENCE = {
  totalMax: 1.2, // 20.5 micromol/L
  directMax: 0.3, // 5.1 micromol/L
  indirectMax: 0.9, // total max minus direct max
};

/**
 * Scleral icterus — yellowing visible in the whites of the eyes — generally
 * appears once total bilirubin reaches roughly 2.5 to 3 mg/dL (43-51 µmol/L).
 */
export const VISIBLE_JAUNDICE_MGDL = 2.5;

/**
 * Standard teaching on the direct (conjugated) fraction: above about 50% of
 * total points to conjugated hyperbilirubinaemia; below about 20% points to an
 * unconjugated cause such as haemolysis or Gilbert syndrome.
 */
export const CONJUGATED_FRACTION_HIGH = 0.5;
export const CONJUGATED_FRACTION_LOW = 0.2;

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

/** Band the total bilirubin against the adult reference interval. */
export function classifyTotal(totalMgdl) {
  if (!Number.isFinite(totalMgdl)) return null;
  if (totalMgdl <= REFERENCE.totalMax) {
    return {
      id: "normal",
      label: "Within the usual adult range",
      note: `Up to ${REFERENCE.totalMax} mg/dL (${mgdlToUmoll(REFERENCE.totalMax).toFixed(1)} µmol/L) is the usual adult total bilirubin interval.`,
    };
  }
  if (totalMgdl < VISIBLE_JAUNDICE_MGDL) {
    return {
      id: "mild",
      label: "Mildly raised",
      note: `Above the usual ceiling but below about ${VISIBLE_JAUNDICE_MGDL} mg/dL (${mgdlToUmoll(VISIBLE_JAUNDICE_MGDL).toFixed(0)} µmol/L), where yellowing of the eyes normally becomes visible.`,
    };
  }
  return {
    id: "jaundice",
    label: "In the range where jaundice is usually visible",
    note: `Total bilirubin at or above about ${VISIBLE_JAUNDICE_MGDL} mg/dL (${mgdlToUmoll(VISIBLE_JAUNDICE_MGDL).toFixed(0)} µmol/L) is typically visible as scleral icterus. This needs clinical assessment.`,
  };
}

/** Describe the split between conjugated and unconjugated bilirubin. */
export function classifyFraction(fraction) {
  if (!Number.isFinite(fraction)) return null;
  if (fraction >= CONJUGATED_FRACTION_HIGH) {
    return {
      id: "conjugated",
      label: "Predominantly conjugated (direct)",
      note: "A direct fraction of 50% or more points towards a conjugated pattern, seen with bile duct obstruction or hepatocellular disease.",
    };
  }
  if (fraction <= CONJUGATED_FRACTION_LOW) {
    return {
      id: "unconjugated",
      label: "Predominantly unconjugated (indirect)",
      note: "A direct fraction of about 20% or less points towards an unconjugated pattern, seen with haemolysis or Gilbert syndrome.",
    };
  }
  return {
    id: "mixed",
    label: "Mixed pattern",
    note: "A direct fraction between roughly 20% and 50% does not separate the two patterns on its own and is read alongside liver enzymes.",
  };
}

/**
 * Convert a bilirubin result and derive the indirect value and direct fraction.
 *
 * @param {object} input
 * @param {string} input.unit   "mgdl" or "umoll" — applies to both values entered.
 * @param {number|string} input.total   Total bilirubin.
 * @param {number|string} [input.direct] Direct (conjugated) bilirubin; blank skips the split.
 */
export function convertBilirubin({ unit = "mgdl", total, direct } = {}) {
  if (!UNITS.some((item) => item.id === unit)) return { error: "Choose mg/dL or micromol/L." };

  const rawTotal = toFinite(total);
  if (Number.isNaN(rawTotal)) return { error: "Enter total bilirubin as a number." };
  if (rawTotal <= 0) return { error: "Total bilirubin must be greater than zero." };

  const totalMgdl = unit === "mgdl" ? rawTotal : umollToMgdl(rawTotal);
  if (!Number.isFinite(totalMgdl) || totalMgdl > MAX_MGDL) {
    return {
      error: `That works out to ${totalMgdl.toFixed(1)} mg/dL (${mgdlToUmoll(totalMgdl).toFixed(0)} µmol/L), above anything a serum bilirubin assay reports — check the unit you selected.`,
    };
  }

  let directMgdl = null;
  if (!isBlank(direct)) {
    const rawDirect = toFinite(direct);
    if (Number.isNaN(rawDirect)) {
      return { error: "Direct bilirubin must be a number, or leave it blank." };
    }
    if (rawDirect < 0) return { error: "Direct bilirubin cannot be negative." };
    directMgdl = unit === "mgdl" ? rawDirect : umollToMgdl(rawDirect);
    if (directMgdl > totalMgdl) {
      return { error: "Direct bilirubin cannot be higher than total bilirubin." };
    }
  }

  const indirectMgdl = directMgdl === null ? null : totalMgdl - directMgdl;
  const fraction = directMgdl === null ? null : directMgdl / totalMgdl;

  const build = (mgdl) =>
    mgdl === null || !Number.isFinite(mgdl) ? null : { mgdl, umoll: mgdlToUmoll(mgdl) };

  return {
    unit,
    total: build(totalMgdl),
    direct: build(directMgdl),
    indirect: build(indirectMgdl),
    fraction,
    totalBand: classifyTotal(totalMgdl),
    fractionBand: fraction === null ? null : classifyFraction(fraction),
    reference: {
      totalMax: REFERENCE.totalMax,
      directMax: REFERENCE.directMax,
      totalMaxUmol: mgdlToUmoll(REFERENCE.totalMax),
      directMaxUmol: mgdlToUmoll(REFERENCE.directMax),
    },
  };
}
