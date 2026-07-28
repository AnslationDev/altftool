/**
 * Sweeping and dusting calorie burn maths.
 *
 * Energy model: the ACSM metabolic equivalent (MET) equation behind the
 * Compendium of Physical Activities (Ainsworth et al., 2011):
 *
 *   kcal / minute = MET x 3.5 x body weight in kg / 200
 *
 * MET anchors, all from the Compendium's Home Activities section:
 *   cleaning, sweeping garage, sidewalk or outside of house            = 4.0 MET
 *   cleaning, sweeping carpet or floors, general                       = 3.3 MET
 *   cleaning, light effort (dusting, straightening up, changing linen) = 2.3 MET
 *
 * Sweeping outdoors is rated highest because rough surfaces, longer strokes and
 * heavier debris all raise the effort compared with a smooth indoor floor.
 */

export const ML_O2_PER_MET = 3.5;
export const KCAL_DIVISOR = 200;
export const LB_PER_KG = 2.20462262185;

export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 400;
export const MAX_TOTAL_MINUTES = 600;

export const SWEEPING_TASKS = [
  {
    id: "outdoor",
    label: "Sweeping outside — garage, driveway, yard",
    met: 4.0,
    source: "Compendium: cleaning, sweeping garage, sidewalk or outside of house",
  },
  {
    id: "indoor",
    label: "Sweeping indoors — floors or carpet",
    met: 3.3,
    source: "Compendium: cleaning, sweeping carpet or floors, general",
  },
  {
    id: "dusting",
    label: "Dusting and tidying up",
    met: 2.3,
    source: "Compendium: cleaning, light effort (dusting, straightening up, changing linen)",
  },
];

export function findTask(id) {
  return SWEEPING_TASKS.find((task) => task.id === id) || null;
}

export function toKilograms(value, unit) {
  const raw = Number(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(raw)) return NaN;
  return unit === "lb" ? raw / LB_PER_KG : raw;
}

export function kcalPerMinute(met, weightKg) {
  return (met * ML_O2_PER_MET * weightKg) / KCAL_DIVISOR;
}

/**
 * @param {object} input
 * @param {number} input.weightKg
 * @param {Record<string, number|string>} input.minutesByTask keyed by task id
 * @returns {{error:string}|object} plain object, never NaN or Infinity.
 */
export function computeSweepingCalories({ weightKg, minutesByTask }) {
  const weight = Number(weightKg);
  if (!Number.isFinite(weight)) return { error: "Enter a valid body weight." };
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }

  const source = minutesByTask || {};
  const rows = [];
  let totalMinutes = 0;
  let totalKcal = 0;

  for (const task of SWEEPING_TASKS) {
    const raw = source[task.id];
    const minutes = Number(raw === "" || raw === undefined || raw === null ? 0 : raw);
    if (!Number.isFinite(minutes)) {
      return { error: `Enter a valid number of minutes for "${task.label}".` };
    }
    if (minutes < 0) {
      return { error: "Minutes cannot be negative." };
    }
    const rate = kcalPerMinute(task.met, weight);
    const kcal = rate * minutes;
    totalMinutes += minutes;
    totalKcal += kcal;
    rows.push({ id: task.id, label: task.label, met: task.met, minutes, rate, kcal });
  }

  if (totalMinutes <= 0) {
    return { error: "Enter minutes for at least one task." };
  }
  if (totalMinutes > MAX_TOTAL_MINUTES) {
    return { error: `Keep the whole session under ${MAX_TOTAL_MINUTES} minutes (10 hours).` };
  }

  const netKcal = Math.max(0, totalKcal - kcalPerMinute(1, weight) * totalMinutes);
  const averageMet = (totalKcal * KCAL_DIVISOR) / (ML_O2_PER_MET * weight * totalMinutes);

  return {
    weightKg: weight,
    rows,
    totalMinutes,
    totalKcal,
    netKcal,
    averageMet,
    averageRate: totalKcal / totalMinutes,
    kcalPerHour: (totalKcal / totalMinutes) * 60,
  };
}
