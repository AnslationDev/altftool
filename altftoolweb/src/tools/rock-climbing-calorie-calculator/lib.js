/**
 * Rock climbing calorie maths.
 *
 * Climbing is the most intermittent sport in the gym: a two-hour session is
 * often thirty to fifty minutes on the wall and the rest spent belaying,
 * brushing holds and arguing about beta. This module prices wall time and rest
 * time separately.
 *
 * Energy model (ACSM):  kcal/min = MET x 3.5 x kg / 200
 *   1 MET = 3.5 mL O2 per kg per minute, 1 L O2 ~= 5 kcal.
 *
 * MET values come from the rock climbing codes of the Compendium of Physical
 * Activities (Ainsworth et al., 2011). Note the 2011 revision cut the old
 * "ascending rock" value from 11.0 to 7.5 MET after direct measurement.
 *
 * A second, independent figure is the pure lifting work: raising body mass
 * through a height h costs m x g x h joules of mechanical work, which at a
 * gross muscular efficiency of about 25% for large-muscle activity implies
 * four times that much metabolic energy.
 */

export const LB_TO_KG = 0.45359237;
export const M_PER_FOOT = 0.3048;
export const O2_ML_PER_KG_PER_MET = 3.5;
export const KCAL_PER_LITRE_O2 = 5;
export const RESTING_MET = 1;
export const KCAL_PER_KG_BODY_FAT = 7700;

/** Standard gravity, m/s^2 (CGPM definition). */
export const GRAVITY_M_S2 = 9.80665;

/** Thermochemical conversion: 1 kcal = 4184 joules. */
export const JOULES_PER_KCAL = 4184;

/** Gross mechanical efficiency of large-muscle work, commonly taken as ~25%. */
export const MUSCULAR_EFFICIENCY = 0.25;

/**
 * Belaying, resting between burns, brushing holds.
 * Compendium 2011: "standing, light effort" 2.0 MET.
 */
export const REST_MET = 2.0;

export const MIN_WEIGHT_KG = 25;
export const MAX_WEIGHT_KG = 400;
export const MAX_SESSION_MINUTES = 600;
export const MAX_CLIMBS = 200;
export const MIN_CLIMB_MINUTES = 0.25;
export const MAX_CLIMB_MINUTES = 60;
export const MAX_CLIMB_HEIGHT_M = 300;

export const CLIMBING_DISCIPLINES = [
  {
    id: "rappel",
    label: "Rappelling / lowering off",
    met: 5.0,
    basis: "Compendium value for rock climbing, rappelling (5.0 MET).",
  },
  {
    id: "toprope",
    label: "Top-rope, easy to moderate routes",
    met: 5.8,
    basis:
      "Compendium value for ascending or traversing rock at low-to-moderate difficulty (5.8 MET).",
  },
  {
    id: "boulder",
    label: "Bouldering, moderate problems",
    met: 7.0,
    basis: "Between low-to-moderate difficulty (5.8) and high-difficulty ascent (7.5 MET).",
  },
  {
    id: "lead",
    label: "Lead climbing, hard routes",
    met: 7.5,
    basis: "Compendium value for ascending rock at high difficulty (7.5 MET).",
  },
  {
    id: "limit",
    label: "Bouldering at your limit / campus work",
    met: 8.0,
    basis: "At the compendium value for rock or mountain climbing (8.0 MET).",
  },
];

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export function metToKcalPerMinute(met, weightKg) {
  if (!Number.isFinite(met) || !Number.isFinite(weightKg)) return 0;
  if (met <= 0 || weightKg <= 0) return 0;
  return (met * O2_ML_PER_KG_PER_MET * weightKg * KCAL_PER_LITRE_O2) / 1000;
}

export function getClimbingDiscipline(id) {
  return CLIMBING_DISCIPLINES.find((item) => item.id === id) || null;
}

/**
 * Metabolic cost of raising body mass through a vertical height, in kcal.
 * Mechanical work m x g x h, divided by gross muscular efficiency.
 */
export function verticalWorkKcal(weightKg, metresClimbed) {
  if (!Number.isFinite(weightKg) || !Number.isFinite(metresClimbed)) return null;
  if (weightKg <= 0 || metresClimbed <= 0) return null;
  const joules = weightKg * GRAVITY_M_S2 * metresClimbed;
  return {
    mechanicalKj: joules / 1000,
    mechanicalKcal: joules / JOULES_PER_KCAL,
    metabolicKcal: joules / JOULES_PER_KCAL / MUSCULAR_EFFICIENCY,
  };
}

/**
 * @param {object} input
 * @param {number} input.weight body weight in `weightUnit`
 * @param {"kg"|"lb"} input.weightUnit
 * @param {number} input.sessionMinutes total time at the crag or gym
 * @param {string} input.disciplineId one of CLIMBING_DISCIPLINES ids
 * @param {number} input.climbs number of routes or problems attempted
 * @param {number} input.minutesPerClimb average time on the wall per attempt
 * @param {number} [input.heightPerClimb] average height gained per attempt
 * @param {"m"|"ft"} [input.heightUnit]
 */
export function computeClimbingBurn({
  weight,
  weightUnit = "kg",
  sessionMinutes,
  disciplineId,
  climbs,
  minutesPerClimb,
  heightPerClimb = 0,
  heightUnit = "m",
}) {
  if (![weight, sessionMinutes, climbs, minutesPerClimb].every(Number.isFinite)) {
    return { error: "Enter a number in every field." };
  }
  const discipline = getClimbingDiscipline(disciplineId);
  if (!discipline) return { error: "Pick a climbing discipline." };

  const weightKg = weightUnit === "lb" ? weight * LB_TO_KG : weight;
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (sessionMinutes <= 0) return { error: "Session length must be more than zero minutes." };
  if (sessionMinutes > MAX_SESSION_MINUTES) {
    return { error: `Session length should be ${MAX_SESSION_MINUTES} minutes or less.` };
  }
  if (climbs <= 0) return { error: "Enter at least one route or problem." };
  if (climbs > MAX_CLIMBS) return { error: `Routes or problems should be ${MAX_CLIMBS} or fewer.` };
  if (minutesPerClimb < MIN_CLIMB_MINUTES || minutesPerClimb > MAX_CLIMB_MINUTES) {
    return {
      error: `Time per climb should be between ${MIN_CLIMB_MINUTES} and ${MAX_CLIMB_MINUTES} minutes.`,
    };
  }

  const wallMinutes = climbs * minutesPerClimb;
  if (wallMinutes > sessionMinutes) {
    return {
      error: "Wall time exceeds the session length — lower the climb count or time per climb.",
    };
  }

  const heightM = heightUnit === "ft" ? heightPerClimb * M_PER_FOOT : heightPerClimb;
  if (!Number.isFinite(heightM) || heightM < 0 || heightM > MAX_CLIMB_HEIGHT_M) {
    return { error: `Height per climb should be between 0 and ${MAX_CLIMB_HEIGHT_M} metres.` };
  }

  const restMinutes = sessionMinutes - wallMinutes;
  const wallKcalPerMin = metToKcalPerMinute(discipline.met, weightKg);
  const restKcalPerMin = metToKcalPerMinute(REST_MET, weightKg);
  const restingKcalPerMin = metToKcalPerMinute(RESTING_MET, weightKg);

  const wallKcal = wallKcalPerMin * wallMinutes;
  const restKcal = restKcalPerMin * restMinutes;
  const grossKcal = wallKcal + restKcal;
  const restingKcal = restingKcalPerMin * sessionMinutes;
  const netKcal = Math.max(0, grossKcal - restingKcal);

  const totalMetres = heightM * climbs;
  const vertical = verticalWorkKcal(weightKg, totalMetres);

  return {
    weightKg: round(weightKg, 1),
    met: discipline.met,
    disciplineLabel: discipline.label,
    basis: discipline.basis,
    wallMinutes: round(wallMinutes, 1),
    restMinutes: round(restMinutes, 1),
    wallSharePercent: round((wallMinutes / sessionMinutes) * 100),
    averageMet: round(
      (discipline.met * wallMinutes + REST_MET * restMinutes) / sessionMinutes,
      2,
    ),
    kcalPerMinute: round(wallKcalPerMin, 2),
    kcalPerHour: round(wallKcalPerMin * 60),
    kcalPerClimb: round(wallKcalPerMin * minutesPerClimb, 1),
    wallKcal: round(wallKcal),
    restKcal: round(restKcal),
    grossKcal: round(grossKcal),
    restingKcal: round(restingKcal),
    netKcal: round(netKcal),
    fatGramsEquivalent: round((netKcal / KCAL_PER_KG_BODY_FAT) * 1000, 1),
    totalMetres: round(totalMetres, 1),
    mechanicalKj: vertical ? round(vertical.mechanicalKj, 1) : null,
    liftingKcal: vertical ? round(vertical.metabolicKcal) : null,
    liftingSharePercent:
      vertical && grossKcal > 0 ? round((vertical.metabolicKcal / grossKcal) * 100) : null,
  };
}
