/**
 * Car-washing energy cost.
 *
 * Washing a car by hand is not one intensity: scrubbing bodywork is rated far higher
 * than standing with a hose. Each stage is therefore priced with its own published
 * MET value and summed.
 *
 * Method (the standard metabolic-equivalent approach):
 *   VO2 (mL/kg/min) = MET x 3.5
 *   kcal/min        = VO2 x kg / 1000 x 5 kcal per litre of oxygen
 *                   = MET x 3.5 x kg / 200
 *
 * MET values come from Ainsworth BE et al., "2011 Compendium of Physical Activities:
 * a second update of codes and MET values", Med Sci Sports Exerc 2011;43(8):1575-1581.
 * Washing and waxing a vehicle has its own compendium entry at 4.5 METs; the ancillary
 * stages borrow the closest published home-activity entry, which is named on each row.
 *
 * The per-vehicle minute presets are typical starting points for how long each stage
 * takes on that size of vehicle, not physiological constants — they are there to be
 * edited.
 */

/** Oxygen uptake of one metabolic equivalent, mL O2 per kg per minute. */
export const ML_O2_PER_MET = 3.5;
/** Caloric equivalent of oxygen used throughout the compendium, kcal per litre. */
export const KCAL_PER_LITRE_O2 = 5;
/** 1 pound = 0.45359237 kg exactly. */
export const KG_PER_LB = 0.45359237;
/** 12 months in a year, used for the yearly projection. */
export const MONTHS_PER_YEAR = 12;

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const STAGE_MAX_MIN = 240;
export const SESSION_MAX_MIN = 480;
export const WASHES_PER_MONTH_MAX = 31;

/** Car-wash stages and the compendium entry each MET value is taken from. */
export const WASH_STAGES = [
  {
    id: "rinse",
    label: "Hosing and rinsing down",
    met: 2.5,
    code: "05147",
    source: "Walking, light-effort household tasks — the closest published entry for hose work",
  },
  {
    id: "soap",
    label: "Soaping and scrubbing the bodywork",
    met: 4.5,
    code: "06180",
    source: "Washing and waxing the hull of a car, boat or aircraft",
  },
  {
    id: "wheels",
    label: "Scrubbing wheels and arches, crouching",
    met: 3.5,
    code: "05095",
    source: "Scrubbing floors on hands and knees, moderate effort",
  },
  {
    id: "dry",
    label: "Drying and buffing with a cloth",
    met: 3.5,
    code: "05120",
    source: "Standing, moderate-effort household task with occasional lifting",
  },
  {
    id: "wax",
    label: "Waxing and polishing by hand",
    met: 4.5,
    code: "06180",
    source: "Washing and waxing the hull of a car, boat or aircraft",
  },
  {
    id: "vacuum",
    label: "Vacuuming and cleaning the interior",
    met: 3.3,
    code: "05055",
    source: "Vacuuming, general, moderate effort",
  },
];

/**
 * Typical minutes per stage by vehicle size. These are time estimates offered as a
 * starting point, not measured values — edit them to match how you actually wash.
 */
export const VEHICLE_PRESETS = [
  {
    id: "hatchback",
    label: "Hatchback / small car",
    minutes: { rinse: 5, soap: 15, wheels: 6, dry: 8, wax: 0, vacuum: 6 },
  },
  {
    id: "sedan",
    label: "Sedan / saloon",
    minutes: { rinse: 6, soap: 20, wheels: 8, dry: 10, wax: 0, vacuum: 8 },
  },
  {
    id: "suv",
    label: "SUV / large estate",
    minutes: { rinse: 8, soap: 28, wheels: 10, dry: 14, wax: 0, vacuum: 10 },
  },
  {
    id: "van",
    label: "Van / pickup",
    minutes: { rinse: 10, soap: 35, wheels: 12, dry: 18, wax: 0, vacuum: 12 },
  },
  {
    id: "detail",
    label: "Full detail with wax",
    minutes: { rinse: 8, soap: 25, wheels: 12, dry: 15, wax: 30, vacuum: 15 },
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Look up a vehicle preset by id. */
export function findVehiclePreset(id) {
  return VEHICLE_PRESETS.find((preset) => preset.id === id) ?? null;
}

/** Convert a body weight in kg or lb to kilograms. */
export function toKilograms(weight, unit) {
  if (!isNum(weight)) return null;
  return unit === "lb" ? weight * KG_PER_LB : weight;
}

/** kcal per minute for a given MET value and body mass. */
export function kcalPerMinute(met, weightKg) {
  if (!isNum(met) || !isNum(weightKg)) return null;
  return ((met * ML_O2_PER_MET * weightKg) / 1000) * KCAL_PER_LITRE_O2;
}

/**
 * Energy cost of hand-washing a vehicle, projected across the month and the year.
 *
 * @param {object} input
 * @param {number} input.weight
 * @param {"kg"|"lb"} [input.weightUnit]
 * @param {Record<string, number>} input.minutes Minutes per stage id from WASH_STAGES.
 * @param {number} input.washesPerMonth          How often you wash the vehicle.
 * @returns {object} Energy figures, or { error }.
 */
export function computeCarWashCalories({
  weight,
  weightUnit = "kg",
  minutes = {},
  washesPerMonth,
}) {
  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  if (!isNum(washesPerMonth)) return { error: "Enter how many times a month you wash the vehicle." };
  if (washesPerMonth <= 0) return { error: "Enter at least one wash per month." };
  if (washesPerMonth > WASHES_PER_MONTH_MAX) {
    return { error: `More than ${WASHES_PER_MONTH_MAX} washes a month is outside this calculator's range.` };
  }

  const rows = [];
  let sessionMinutes = 0;
  let sessionKcal = 0;

  for (const stage of WASH_STAGES) {
    const raw = minutes[stage.id];
    const value = raw === undefined || raw === null || raw === "" ? 0 : raw;
    if (!isNum(value)) return { error: `Enter a number of minutes for "${stage.label}".` };
    if (value < 0) return { error: "Minutes cannot be negative." };
    if (value > STAGE_MAX_MIN) {
      return { error: `No single wash stage can be longer than ${STAGE_MAX_MIN} minutes.` };
    }
    if (value === 0) continue;

    const perMin = kcalPerMinute(stage.met, weightKg);
    const kcal = perMin * value;
    sessionMinutes += value;
    sessionKcal += kcal;
    rows.push({
      id: stage.id,
      label: stage.label,
      met: stage.met,
      code: stage.code,
      minutes: value,
      kcalPerMin: perMin,
      kcal,
    });
  }

  if (sessionMinutes <= 0) return { error: "Add some minutes to at least one wash stage." };
  if (sessionMinutes > SESSION_MAX_MIN) {
    return { error: `A single wash cannot exceed ${SESSION_MAX_MIN} minutes here.` };
  }

  const restingPerMin = kcalPerMinute(1, weightKg);
  const sessionRestingKcal = restingPerMin * sessionMinutes;
  const sessionNetKcal = Math.max(0, sessionKcal - sessionRestingKcal);
  const averageMet = sessionKcal / sessionRestingKcal;

  const monthKcal = sessionKcal * washesPerMonth;
  const monthNetKcal = sessionNetKcal * washesPerMonth;

  return {
    weightKg,
    washesPerMonth,
    sessionMinutes,
    sessionKcal,
    sessionNetKcal,
    sessionRestingKcal,
    averageMet,
    kcalPerMin: sessionKcal / sessionMinutes,
    monthMinutes: sessionMinutes * washesPerMonth,
    monthKcal,
    monthNetKcal,
    yearKcal: monthKcal * MONTHS_PER_YEAR,
    yearNetKcal: monthNetKcal * MONTHS_PER_YEAR,
    rows,
  };
}
