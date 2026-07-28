/**
 * Dog walking — energy for the human, plus informational energy and activity
 * context for the dog.
 *
 * HUMAN SIDE
 * The ACSM metabolic equivalent definition: 1 MET is a resting oxygen uptake of
 * 3.5 mL O2 per kg per minute and 1 L of O2 liberates ~5 kcal, so
 *   kcal/min = MET x 3.5 x bodyMassKg / 200
 * Walking MET values are published rows of the 2011 Compendium of Physical
 * Activities (Ainsworth et al., Med Sci Sports Exerc 43(8):1575-81). A dog walk
 * is not continuous, so time spent standing at sniff stops is scored at the
 * standing-quietly row (1.3 METs) rather than at walking intensity.
 *
 * DOG SIDE
 * Resting energy requirement uses the standard allometric equation used in
 * veterinary nutrition (NRC 2006; WSAVA Global Nutrition Committee):
 *   RER (kcal/day) = 70 x bodyWeightKg^0.75
 * Maintenance energy requirement is RER multiplied by a life-stage factor.
 * These are starting estimates for a healthy animal, not a feeding prescription.
 */

/** 1 MET expressed as oxygen uptake, mL O2 per kg per minute (ACSM definition). */
export const MET_ML_O2_PER_KG_MIN = 3.5;

/** Divisor converting mL O2/kg/min into kcal/min (1 L O2 ~ 5 kcal => 1000/5). */
export const KCAL_CONVERSION_DIVISOR = 200;

/** Resting baseline used to convert gross calories to net. */
export const RESTING_MET = 1;

/** Standing quietly, 2011 Compendium of Physical Activities. Used for sniff stops. */
export const STANDING_MET = 1.3;

/**
 * Walking MET values and matching speeds, 2011 Compendium of Physical Activities.
 * The "unsure" option is the Compendium's own "walking the dog" row (3.0 METs).
 */
export const WALK_PACES = [
  { id: "unsure", label: "Not sure — general dog walking", met: 3.0, speedKmh: 4.0 },
  { id: "slow", label: "Slow amble, 3.2 km/h (2.0 mph)", met: 2.8, speedKmh: 3.2 },
  { id: "easy", label: "Easy, 4.0 km/h (2.5 mph)", met: 3.0, speedKmh: 4.0 },
  { id: "moderate", label: "Moderate, 4.8 km/h (3.0 mph)", met: 3.5, speedKmh: 4.8 },
  { id: "brisk", label: "Brisk, 5.6 km/h (3.5 mph)", met: 4.3, speedKmh: 5.6 },
  { id: "very-brisk", label: "Very brisk, 6.4 km/h (4.0 mph)", met: 5.0, speedKmh: 6.4 },
];

/**
 * Maintenance energy factors applied to RER (NRC 2006 / WSAVA guidance).
 * The active/working range is 2.0-5.0; the low end is used here as a
 * conservative starting point.
 */
export const DOG_LIFE_STAGES = [
  { id: "neutered", label: "Neutered adult", factor: 1.6 },
  { id: "intact", label: "Intact adult", factor: 1.8 },
  { id: "inactive", label: "Inactive or prone to weight gain", factor: 1.2 },
  { id: "weight-loss", label: "On a vet-supervised weight-loss plan", factor: 1.0 },
  { id: "active", label: "Active or working dog", factor: 2.0 },
  { id: "puppy-young", label: "Puppy under 4 months", factor: 3.0 },
  { id: "puppy-older", label: "Puppy, 4 months to adult", factor: 2.0 },
];

/**
 * Commonly cited daily exercise guidance by energy level (UK Kennel Club and
 * PDSA style advice). Breed, age and health matter more than body size, so the
 * bands are expressed by temperament rather than weight.
 */
export const DOG_ENERGY_LEVELS = [
  { id: "low", label: "Low energy (toy, flat-faced, senior)", minMinutes: 20, targetMinutes: 30 },
  { id: "moderate", label: "Moderate energy (most companion breeds)", minMinutes: 45, targetMinutes: 60 },
  { id: "high", label: "High energy (working, herding, sporting)", minMinutes: 90, targetMinutes: 120 },
];

/** Exponent in the allometric resting energy equation (NRC 2006). */
export const RER_EXPONENT = 0.75;

/** Coefficient in the allometric resting energy equation, kcal/day (NRC 2006). */
export const RER_COEFFICIENT = 70;

export const LIMITS = {
  humanWeightKg: { min: 20, max: 300 },
  minutes: { min: 1, max: 600 },
  walksPerDay: { min: 1, max: 10 },
  stopPercent: { min: 0, max: 90 },
  dogWeightKg: { min: 0.5, max: 100 },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** kcal burned at a given MET for a given mass and duration in minutes. */
export function kcalFromMet(met, weightKg, minutes) {
  if (!isNum(met) || !isNum(weightKg) || !isNum(minutes)) return 0;
  if (met <= 0 || weightKg <= 0 || minutes <= 0) return 0;
  return (met * MET_ML_O2_PER_KG_MIN * weightKg * minutes) / KCAL_CONVERSION_DIVISOR;
}

/** Resting energy requirement for a dog, kcal/day. RER = 70 x kg^0.75 */
export function dogRestingEnergy(dogWeightKg) {
  if (!isNum(dogWeightKg) || dogWeightKg <= 0) return 0;
  return RER_COEFFICIENT * Math.pow(dogWeightKg, RER_EXPONENT);
}

/**
 * Compute a dog walk.
 * @returns {{error:string}|object} plain result object, never NaN or Infinity.
 */
export function computeDogWalk({
  humanWeightKg,
  minutes,
  pace = "moderate",
  stopPercent = 20,
  walksPerDay = 2,
  dogWeightKg,
  dogLifeStage = "neutered",
  dogEnergyLevel = "moderate",
} = {}) {
  const required = { humanWeightKg, minutes, stopPercent, walksPerDay, dogWeightKg };
  for (const key of Object.keys(required)) {
    if (!isNum(required[key])) return { error: "Enter a valid number in every field." };
  }

  if (
    humanWeightKg < LIMITS.humanWeightKg.min ||
    humanWeightKg > LIMITS.humanWeightKg.max
  ) {
    return {
      error: `Your body weight should be between ${LIMITS.humanWeightKg.min} and ${LIMITS.humanWeightKg.max} kg.`,
    };
  }
  if (minutes < LIMITS.minutes.min || minutes > LIMITS.minutes.max) {
    return {
      error: `Walk length should be between ${LIMITS.minutes.min} and ${LIMITS.minutes.max} minutes.`,
    };
  }
  if (stopPercent < LIMITS.stopPercent.min || stopPercent > LIMITS.stopPercent.max) {
    return {
      error: `Time spent standing still should be between ${LIMITS.stopPercent.min}% and ${LIMITS.stopPercent.max}%.`,
    };
  }
  if (walksPerDay < LIMITS.walksPerDay.min || walksPerDay > LIMITS.walksPerDay.max) {
    return {
      error: `Walks per day should be between ${LIMITS.walksPerDay.min} and ${LIMITS.walksPerDay.max}.`,
    };
  }
  if (dogWeightKg < LIMITS.dogWeightKg.min || dogWeightKg > LIMITS.dogWeightKg.max) {
    return {
      error: `Your dog's weight should be between ${LIMITS.dogWeightKg.min} and ${LIMITS.dogWeightKg.max} kg.`,
    };
  }

  const paceRow = WALK_PACES.find((item) => item.id === pace) || WALK_PACES[3];
  const stage = DOG_LIFE_STAGES.find((item) => item.id === dogLifeStage) || DOG_LIFE_STAGES[0];
  const energy =
    DOG_ENERGY_LEVELS.find((item) => item.id === dogEnergyLevel) || DOG_ENERGY_LEVELS[1];

  const stoppedMinutes = (minutes * stopPercent) / 100;
  const movingMinutes = minutes - stoppedMinutes;

  const movingKcal = kcalFromMet(paceRow.met, humanWeightKg, movingMinutes);
  const stoppedKcal = kcalFromMet(STANDING_MET, humanWeightKg, stoppedMinutes);
  const grossKcal = movingKcal + stoppedKcal;
  const restingKcal = kcalFromMet(RESTING_MET, humanWeightKg, minutes);
  const netKcal = Math.max(0, grossKcal - restingKcal);

  const distanceKm = (paceRow.speedKmh * movingMinutes) / 60;
  const kcalPerMinute = minutes > 0 ? grossKcal / minutes : 0;
  const kcalPerKm = distanceKm > 0 ? grossKcal / distanceKm : 0;
  const effectiveMet = minutes > 0 ? (grossKcal * KCAL_CONVERSION_DIVISOR) / (MET_ML_O2_PER_KG_MIN * humanWeightKg * minutes) : 0;

  const dailyKcal = grossKcal * walksPerDay;
  const weeklyKcal = dailyKcal * 7;
  const dailyWalkMinutes = minutes * walksPerDay;

  const rer = dogRestingEnergy(dogWeightKg);
  const mer = rer * stage.factor;

  const guidanceGap = dailyWalkMinutes - energy.targetMinutes;
  let guidanceStatus = "meets";
  if (dailyWalkMinutes < energy.minMinutes) guidanceStatus = "below";
  else if (dailyWalkMinutes >= energy.targetMinutes) guidanceStatus = "at-or-above";

  return {
    paceLabel: paceRow.label,
    met: paceRow.met,
    speedKmh: paceRow.speedKmh,
    movingMinutes,
    stoppedMinutes,
    movingKcal,
    stoppedKcal,
    grossKcal,
    restingKcal,
    netKcal,
    distanceKm,
    kcalPerMinute,
    kcalPerKm,
    effectiveMet,
    movingShare: minutes > 0 ? (movingMinutes / minutes) * 100 : 0,
    stoppedShare: minutes > 0 ? (stoppedMinutes / minutes) * 100 : 0,
    dailyKcal,
    weeklyKcal,
    dailyWalkMinutes,
    dogRer: rer,
    dogMer: mer,
    dogStageLabel: stage.label,
    dogStageFactor: stage.factor,
    dogEnergyLabel: energy.label,
    dogTargetMinutes: energy.targetMinutes,
    dogMinMinutes: energy.minMinutes,
    guidanceGap,
    guidanceStatus,
  };
}
