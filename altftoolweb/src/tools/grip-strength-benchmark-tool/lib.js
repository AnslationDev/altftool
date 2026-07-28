/**
 * Hand-grip dynamometry benchmarking.
 *
 * Two different things are compared:
 *  1. Published low-strength cut-offs used to screen for sarcopenia. These are
 *     exact published thresholds, not estimates.
 *  2. The typical range of mean grip strength for an age band and sex. These
 *     are deliberately expressed as RANGES, because published normative means
 *     differ between cohorts and instruments — treat them as a rough
 *     orientation, not a diagnostic boundary.
 *
 * Assessment always uses the best of the recorded attempts, which is the
 * convention in the sarcopenia literature.
 */

/**
 * Published low-strength cut-offs, in kilograms of maximum grip.
 *   EWGSOP2 (Cruz-Jentoft et al., Age & Ageing 2019): men 27, women 16
 *   AWGS 2019 (Chen et al., JAMDA 2020): men 28, women 18
 *   FNIH sarcopenia project (Studenski et al., 2014): men 26, women 16
 */
export const CUTOFFS = [
  { key: "ewgsop2", name: "EWGSOP2 (Europe, 2019)", male: 27, female: 16 },
  { key: "awgs", name: "AWGS (Asia, 2019)", male: 28, female: 18 },
  { key: "fnih", name: "FNIH (USA, 2014)", male: 26, female: 16 },
];

/**
 * Typical range of MEAN maximum grip strength by age band, in kilograms,
 * consistent with large pooled normative series such as Dodds et al. (2014).
 * Ranges, not point estimates, because cohorts and dynamometers differ.
 */
export const AGE_REFERENCE = {
  male: [
    { maxAge: 29, low: 45, high: 53 },
    { maxAge: 39, low: 46, high: 54 },
    { maxAge: 49, low: 44, high: 51 },
    { maxAge: 59, low: 40, high: 47 },
    { maxAge: 69, low: 35, high: 42 },
    { maxAge: 79, low: 28, high: 36 },
    { maxAge: Infinity, low: 22, high: 30 },
  ],
  female: [
    { maxAge: 29, low: 27, high: 33 },
    { maxAge: 39, low: 28, high: 34 },
    { maxAge: 49, low: 27, high: 32 },
    { maxAge: 59, low: 25, high: 30 },
    { maxAge: 69, low: 21, high: 27 },
    { maxAge: 79, low: 18, high: 23 },
    { maxAge: Infinity, low: 14, high: 19 },
  ],
};

/** The dominant hand is conventionally taken as about 10% stronger; more than this is worth noting. */
export const ASYMMETRY_THRESHOLD_PERCENT = 10;

/** Adult reference data only; paediatric norms are different curves entirely. */
export const MIN_AGE = 18;
export const MAX_AGE = 110;

/** No adult produces a genuine reading above this on a hand dynamometer. */
export const MAX_GRIP_KG = 150;

export const SEXES = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

/** 1 kilogram-force = 9.80665 newtons (standard gravity). */
export const NEWTONS_PER_KGF = 9.80665;
/** 1 kilogram = 2.2046226218 pounds. */
export const POUNDS_PER_KG = 2.2046226218;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function referenceRangeFor({ sex, age } = {}) {
  const table = AGE_REFERENCE[sex];
  if (!table || !isNum(age)) return null;
  return table.find((band) => age <= band.maxAge) ?? table[table.length - 1];
}

/**
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.age
 * @param {number} input.dominantKg     best reading on the dominant hand
 * @param {number} input.nonDominantKg  best reading on the other hand (0 = not measured)
 * @param {number} input.bmi            optional, for relative grip strength (0 = skip)
 */
export function benchmarkGrip({ sex, age, dominantKg, nonDominantKg = 0, bmi = 0 } = {}) {
  if (![age, dominantKg, nonDominantKg, bmi].every(isNum)) {
    return { error: "Enter a number in every field." };
  }
  if (!SEXES.some((entry) => entry.value === sex)) {
    return { error: "Choose male or female — the reference values differ." };
  }
  if (age < MIN_AGE || age > MAX_AGE) {
    return { error: `These adult references apply from age ${MIN_AGE} to ${MAX_AGE}.` };
  }
  if (dominantKg <= 0) {
    return { error: "Enter the dominant-hand reading in kilograms." };
  }
  if (nonDominantKg < 0 || bmi < 0) {
    return { error: "Values cannot be negative." };
  }
  if (dominantKg > MAX_GRIP_KG || nonDominantKg > MAX_GRIP_KG) {
    return { error: `A reading above ${MAX_GRIP_KG} kg is not a real dynamometer result — check the units.` };
  }

  const best = Math.max(dominantKg, nonDominantKg);
  const hasBothHands = nonDominantKg > 0;
  const asymmetryPercent = hasBothHands ? (Math.abs(dominantKg - nonDominantKg) / best) * 100 : 0;
  const asymmetryFlag = hasBothHands && asymmetryPercent > ASYMMETRY_THRESHOLD_PERCENT;

  const cutoffs = CUTOFFS.map((entry) => {
    const threshold = entry[sex];
    return {
      key: entry.key,
      name: entry.name,
      threshold,
      passes: best >= threshold,
      margin: best - threshold,
    };
  });

  const belowAnyCutoff = cutoffs.some((entry) => !entry.passes);
  const range = referenceRangeFor({ sex, age });
  const midpoint = (range.low + range.high) / 2;
  const percentOfTypical = (best / midpoint) * 100;

  let position;
  if (best < range.low) position = "below";
  else if (best > range.high) position = "above";
  else position = "within";

  let verdict;
  let verdictNote;
  if (belowAnyCutoff) {
    verdict = "Below a published low-strength cut-off";
    verdictNote =
      "At least one sarcopenia screening threshold is not met. This is a screening signal, not a diagnosis — take it to a clinician alongside gait speed and muscle mass.";
  } else if (position === "below") {
    verdict = "Below typical for your age";
    verdictNote =
      "Above the screening cut-offs but under the usual range for your age band. Progressive resistance training is the intervention with the best evidence.";
  } else if (position === "above") {
    verdict = "Above typical for your age";
    verdictNote = "Stronger than the usual mean range for your age band.";
  } else {
    verdict = "Within the typical range";
    verdictNote = "Your reading sits inside the usual range of mean grip strength for your age and sex.";
  }

  return {
    best,
    dominantKg,
    nonDominantKg,
    hasBothHands,
    asymmetryPercent,
    asymmetryFlag,
    asymmetryThreshold: ASYMMETRY_THRESHOLD_PERCENT,
    cutoffs,
    belowAnyCutoff,
    rangeLow: range.low,
    rangeHigh: range.high,
    midpoint,
    percentOfTypical,
    position,
    verdict,
    verdictNote,
    bestPounds: best * POUNDS_PER_KG,
    bestNewtons: best * NEWTONS_PER_KGF,
    relativeGrip: bmi > 0 ? best / bmi : 0,
    hasBmi: bmi > 0,
  };
}
