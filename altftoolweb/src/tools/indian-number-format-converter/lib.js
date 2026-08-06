/**
 * Indian (lakh / crore) <-> international (million / billion) number notation.
 *
 * The Indian numbering system groups digits 2-2-3 after the first three (1,50,00,000) and
 * names powers of ten as: thousand 10^3, lakh 10^5, crore 10^7, arab 10^9, kharab 10^11.
 * Business writing in India rarely goes past crore — larger sums are quoted as
 * "lakh crore" (10^12). The international (short-scale) system groups 3-3-3 and names
 * thousand 10^3, million 10^6, billion 10^9, trillion 10^12.
 *
 * Handy identities that follow directly from the powers of ten:
 *   1 lakh   = 100,000          = 0.1 million
 *   1 crore  = 10,000,000       = 10 million
 *   1 million = 10 lakh
 *   1 billion = 100 crore
 *   1 trillion = 1 lakh crore
 */

/** Unit multipliers — each is an exact power of ten. */
export const UNITS = [
  { id: "one", label: "Plain number", multiplier: 1, system: "both" },
  { id: "thousand", label: "Thousand", multiplier: 1e3, system: "both" },
  { id: "lakh", label: "Lakh", multiplier: 1e5, system: "indian" },
  { id: "million", label: "Million", multiplier: 1e6, system: "international" },
  { id: "crore", label: "Crore", multiplier: 1e7, system: "indian" },
  { id: "billion", label: "Billion", multiplier: 1e9, system: "international" },
  { id: "arab", label: "Arab", multiplier: 1e9, system: "indian" },
  { id: "kharab", label: "Kharab", multiplier: 1e11, system: "indian" },
  { id: "lakh-crore", label: "Lakh crore", multiplier: 1e12, system: "indian" },
  { id: "trillion", label: "Trillion", multiplier: 1e12, system: "international" },
];

export const UNIT_IDS = UNITS.map((unit) => unit.id);

/**
 * Ceiling beyond which double-precision floats can no longer represent every integer
 * (Number.MAX_SAFE_INTEGER is about 9.007e15); we stop at 1e15 to keep results exact.
 */
export const MAX_ABS_VALUE = 1e15;

/** Indian named steps, largest first, used to pick the natural spoken unit. */
const INDIAN_STEPS = [
  { name: "lakh crore", multiplier: 1e12 },
  { name: "crore", multiplier: 1e7 },
  { name: "lakh", multiplier: 1e5 },
  { name: "thousand", multiplier: 1e3 },
];

/** International short-scale steps, largest first. */
const INTERNATIONAL_STEPS = [
  { name: "trillion", multiplier: 1e12 },
  { name: "billion", multiplier: 1e9 },
  { name: "million", multiplier: 1e6 },
  { name: "thousand", multiplier: 1e3 },
];

/** Round to at most 4 decimal places without float noise. */
function round4(value) {
  return Math.round(value * 10000) / 10000;
}

/** Express an absolute value in the largest step it reaches, e.g. 15000000 -> "1.5 crore". */
function spokenForm(value, steps) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  for (const step of steps) {
    if (abs >= step.multiplier) {
      return `${sign}${round4(abs / step.multiplier).toLocaleString("en-US", { maximumFractionDigits: 4 })} ${step.name}`;
    }
  }
  return `${sign}${round4(abs).toLocaleString("en-US", { maximumFractionDigits: 4 })}`;
}

/** Every named form in one system, e.g. the value in lakh AND in crore. */
function allForms(value, steps) {
  return steps.map((step) => ({
    unit: step.name,
    amount: round4(value / step.multiplier),
  }));
}

/**
 * Convert a quantity given as `value` x `unit` into both notations.
 *
 * @param {object} input
 * @param {number|string} input.value  The number typed by the user.
 * @param {string} input.unit          One of UNIT_IDS.
 * @returns {object} conversion result or { error }.
 */
export function convertNumber({ value, unit = "one" }) {
  const meta = UNITS.find((item) => item.id === unit);
  if (!meta) return { error: "Choose the unit the number is written in." };

  const raw = typeof value === "string" ? value.replace(/,/g, "").trim() : value;
  if (raw === "" || raw === null || raw === undefined) {
    return { error: "Enter a number to convert." };
  }
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return { error: "Enter a valid number." };

  const absolute = numeric * meta.multiplier;
  if (!Number.isFinite(absolute) || Math.abs(absolute) > MAX_ABS_VALUE) {
    return {
      error: "That is beyond 1,000 lakh crore (1,000 trillion) — too large to convert exactly.",
    };
  }

  return {
    plainValue: absolute,
    indianGrouped: absolute.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
    internationalGrouped: absolute.toLocaleString("en-US", { maximumFractionDigits: 2 }),
    indianSpoken: spokenForm(absolute, INDIAN_STEPS),
    internationalSpoken: spokenForm(absolute, INTERNATIONAL_STEPS),
    indianForms: allForms(absolute, INDIAN_STEPS),
    internationalForms: allForms(absolute, INTERNATIONAL_STEPS),
  };
}
