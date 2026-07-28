/**
 * Sinclair coefficient (Roy Sinclair, adopted by the IWF).
 *
 *   coefficient = 10 ^ ( A x (log10(bodyweight / b))² )   when bodyweight < b
 *   coefficient = 1.0                                      when bodyweight >= b
 *
 *   Sinclair total = actual total (kg) x coefficient
 *
 * A and b are refitted by the IWF for every Olympic cycle from world-record data,
 * where b is the bodyweight of the world-record holder in the heaviest category.
 * Both published parameter sets below are included so older results can be rescored
 * with the constants that were in force at the time.
 */

/**
 * Published IWF Sinclair parameters.
 * 2021-2024 values are the IWF's coefficients for the Paris cycle.
 * 2017-2020 values are the coefficients for the Tokyo cycle.
 * The IWF republishes A and b each Olympic cycle - check the current table
 * before quoting a Sinclair total in an official context.
 */
export const SINCLAIR_CYCLES = [
  {
    id: "2021-2024",
    label: "2021–2024 (Paris cycle)",
    male: { a: 0.722762521, b: 193.609 },
    female: { a: 0.787004341, b: 153.757 },
  },
  {
    id: "2017-2020",
    label: "2017–2020 (Tokyo cycle)",
    male: { a: 0.75194503, b: 175.508 },
    female: { a: 0.783497476, b: 153.655 },
  },
];

export const DEFAULT_CYCLE_ID = "2021-2024";

/** Exact pound (1959 international yard and pound agreement). */
export const KG_PER_LB = 0.45359237;

/** Input guards - a lifter outside these numbers is a typo, not a competitor. */
export const MIN_BODYWEIGHT_KG = 20;
export const MAX_BODYWEIGHT_KG = 250;
/** The men's heavyweight world-record total sits near 490 kg, so 700 is generous. */
export const MAX_TOTAL_KG = 700;

/**
 * Informal reference points for a Sinclair total. Only the last band is official:
 * the IWF awards the Sinclair trophy to the best Sinclair total at a World
 * Championships, and winning totals sit above roughly 470 for men.
 */
export const SINCLAIR_BANDS = [
  { min: 0, label: "Developing", note: "Building the lifts and the total." },
  { min: 200, label: "Club", note: "Comfortable competing at club level." },
  { min: 275, label: "Regional", note: "Competitive in a regional field." },
  { min: 350, label: "National", note: "National-championship territory." },
  { min: 425, label: "International", note: "Continental and world-level totals." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export const lbToKg = (lb) => (isNum(lb) ? lb * KG_PER_LB : null);
export const kgToLb = (kg) => (isNum(kg) ? kg / KG_PER_LB : null);

/** Look up a parameter set, falling back to the default cycle. */
export function getCycle(cycleId) {
  return SINCLAIR_CYCLES.find((cycle) => cycle.id === cycleId) ?? SINCLAIR_CYCLES[0];
}

/**
 * Sinclair coefficient for a bodyweight.
 * @param {{bodyweightKg:number, sex?:"male"|"female", cycleId?:string}} input
 */
export function sinclairCoefficient({ bodyweightKg, sex = "male", cycleId = DEFAULT_CYCLE_ID } = {}) {
  if (!isNum(bodyweightKg)) return { error: "Enter a bodyweight." };
  if (bodyweightKg < MIN_BODYWEIGHT_KG || bodyweightKg > MAX_BODYWEIGHT_KG) {
    return { error: `Bodyweight must be between ${MIN_BODYWEIGHT_KG} and ${MAX_BODYWEIGHT_KG} kg.` };
  }

  const cycle = getCycle(cycleId);
  const params = sex === "female" ? cycle.female : cycle.male;

  // At or above the reference bodyweight b the coefficient is defined as exactly 1.
  if (bodyweightKg >= params.b) {
    return { coefficient: 1, a: params.a, b: params.b, cycle, atOrAboveReference: true };
  }

  const exponent = params.a * Math.log10(bodyweightKg / params.b) ** 2;
  const coefficient = 10 ** exponent;
  if (!isNum(coefficient) || coefficient <= 0) {
    return { error: "The Sinclair formula does not produce a usable value at that bodyweight." };
  }

  return { coefficient, a: params.a, b: params.b, cycle, atOrAboveReference: false };
}

/** Band label for a Sinclair total. */
export function classifySinclair(total) {
  if (!isNum(total) || total < 0) return SINCLAIR_BANDS[0];
  let match = SINCLAIR_BANDS[0];
  for (const band of SINCLAIR_BANDS) {
    if (total >= band.min) match = band;
  }
  return match;
}

/**
 * Full Sinclair report from a bodyweight and either a total or the two lifts.
 * @param {{bodyweightKg:number, sex?:"male"|"female", cycleId?:string,
 *          totalKg?:number, snatchKg?:number, cleanJerkKg?:number}} input
 */
export function computeSinclair({
  bodyweightKg,
  sex = "male",
  cycleId = DEFAULT_CYCLE_ID,
  totalKg,
  snatchKg,
  cleanJerkKg,
} = {}) {
  const coeff = sinclairCoefficient({ bodyweightKg, sex, cycleId });
  if (coeff.error) return { error: coeff.error };

  const lifts = [snatchKg, cleanJerkKg];
  const anyLift = lifts.some((value) => isNum(value));
  let total = totalKg;
  if (!isNum(total) && anyLift) {
    if (lifts.some((value) => !isNum(value))) {
      return { error: "Enter both the snatch and the clean & jerk, or enter a total instead." };
    }
    total = snatchKg + cleanJerkKg;
  }

  if (!isNum(total)) return { error: "Enter a total, or the snatch and clean & jerk separately." };
  if (lifts.some((value) => isNum(value) && value < 0)) {
    return { error: "Individual lifts cannot be negative." };
  }
  if (total <= 0) return { error: "Total must be greater than zero." };
  if (total > MAX_TOTAL_KG) return { error: `Total must be under ${MAX_TOTAL_KG} kg.` };

  const sinclairTotal = total * coeff.coefficient;

  return {
    sinclairTotal,
    coefficient: coeff.coefficient,
    a: coeff.a,
    b: coeff.b,
    cycle: coeff.cycle,
    atOrAboveReference: coeff.atOrAboveReference,
    totalKg: total,
    totalLb: kgToLb(total),
    bodyweightKg,
    bodyweightLb: kgToLb(bodyweightKg),
    sex,
    band: classifySinclair(sinclairTotal),
    totalToBodyweightRatio: total / bodyweightKg,
    /** Share of the total from each lift; ~44% snatch / ~56% clean & jerk is typical. */
    liftShare: lifts.every((value) => isNum(value))
      ? { snatch: (snatchKg / total) * 100, cleanJerk: (cleanJerkKg / total) * 100 }
      : null,
  };
}

/** Actual total needed to reach a target Sinclair total at a given bodyweight. */
export function totalForSinclair({
  bodyweightKg,
  sex = "male",
  cycleId = DEFAULT_CYCLE_ID,
  targetSinclair,
} = {}) {
  const coeff = sinclairCoefficient({ bodyweightKg, sex, cycleId });
  if (coeff.error) return { error: coeff.error };
  if (!isNum(targetSinclair) || targetSinclair <= 0) {
    return { error: "Target Sinclair total must be greater than zero." };
  }
  return { totalKg: targetSinclair / coeff.coefficient, coefficient: coeff.coefficient };
}
