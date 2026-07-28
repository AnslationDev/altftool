/**
 * Mopping calorie burn maths.
 *
 * Energy model: the ACSM metabolic equivalent (MET) equation behind the
 * Compendium of Physical Activities (Ainsworth et al., 2011):
 *
 *   kcal / minute = MET x 3.5 x body weight in kg / 200
 *
 * Household MET anchors used here (2011 Compendium, Home Activities):
 *   mopping, standing, moderate effort                                  = 3.5 MET
 *   cleaning, light effort (dusting, tidying, changing linen)           = 2.3 MET
 *   multiple household tasks all at once, vigorous effort               = 4.3 MET
 * The light and vigorous rows are the Compendium's light- and vigorous-cleaning
 * anchors either side of the mopping entry, used for a quick wipe-over and for
 * heavy scrubbing on hands and knees respectively.
 *
 * Area-to-time conversion uses cleaning-industry production rates (ISSA-style
 * damp-mopping benchmarks): roughly 4,000 sq ft per hour in open floor space and
 * about 2,000 sq ft per hour in furnished, congested rooms. Those are planning
 * figures for a person working steadily, not a measurement of your own pace.
 */

export const ML_O2_PER_MET = 3.5;
export const KCAL_DIVISOR = 200;
export const LB_PER_KG = 2.20462262185;
/** 1 square metre in square feet. */
export const SQFT_PER_M2 = 10.7639104167;

export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 400;
export const MAX_MINUTES = 600;
export const MAX_AREA_M2 = 5000;

export const MOPPING_EFFORTS = [
  {
    id: "light",
    label: "Light — quick wipe over a small area",
    met: 2.3,
    source: "Compendium: cleaning, light effort (dusting, tidying, changing linen)",
  },
  {
    id: "moderate",
    label: "Moderate — standard mopping, standing",
    met: 3.5,
    source: "Compendium: mopping, standing, moderate effort",
  },
  {
    id: "vigorous",
    label: "Vigorous — scrubbing, wringing by hand, on your knees",
    met: 4.3,
    source: "Compendium: multiple household tasks all at once, vigorous effort",
  },
];

export const MOPPING_LAYOUTS = [
  {
    id: "open",
    label: "Open floor, very little furniture",
    sqftPerHour: 4000,
  },
  {
    id: "congested",
    label: "Furnished rooms with obstacles",
    sqftPerHour: 2000,
  },
].map((layout) => ({
  ...layout,
  m2PerHour: layout.sqftPerHour / SQFT_PER_M2,
  m2PerMinute: layout.sqftPerHour / SQFT_PER_M2 / 60,
}));

export function findEffort(id) {
  return MOPPING_EFFORTS.find((effort) => effort.id === id) || null;
}

export function findLayout(id) {
  return MOPPING_LAYOUTS.find((layout) => layout.id === id) || null;
}

export function toKilograms(value, unit) {
  const raw = Number(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(raw)) return NaN;
  return unit === "lb" ? raw / LB_PER_KG : raw;
}

/** Convert an area in m2 or sq ft to square metres. Returns NaN for unusable input. */
export function toSquareMetres(value, unit) {
  const raw = Number(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(raw)) return NaN;
  return unit === "sqft" ? raw / SQFT_PER_M2 : raw;
}

export function kcalPerMinute(met, weightKg) {
  return (met * ML_O2_PER_MET * weightKg) / KCAL_DIVISOR;
}

/** Minutes needed to mop a given area at a layout's production rate. */
export function minutesForArea(areaM2, layout) {
  if (!layout || !(layout.m2PerMinute > 0) || !(areaM2 > 0)) return NaN;
  return areaM2 / layout.m2PerMinute;
}

/**
 * @param {object} input
 * @param {"time"|"area"} input.mode  whether minutes are given or derived from area
 * @returns {{error:string}|object} plain object, never NaN or Infinity.
 */
export function computeMoppingCalories({ weightKg, mode, minutes, areaM2, layoutId, effortId }) {
  const weight = Number(weightKg);
  if (!Number.isFinite(weight)) return { error: "Enter a valid body weight." };
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }

  const effort = findEffort(effortId);
  if (!effort) return { error: "Choose how hard you were mopping." };

  let workMinutes;
  let layout = null;
  let area = null;

  if (mode === "area") {
    area = Number(areaM2);
    layout = findLayout(layoutId);
    if (!layout) return { error: "Choose whether the floor is open or furnished." };
    if (!Number.isFinite(area)) return { error: "Enter a valid floor area." };
    if (area <= 0) return { error: "Floor area must be more than zero." };
    if (area > MAX_AREA_M2) {
      return { error: `Areas over ${MAX_AREA_M2} m² are outside this calculator's range.` };
    }
    workMinutes = minutesForArea(area, layout);
  } else {
    workMinutes = Number(minutes);
    if (!Number.isFinite(workMinutes)) return { error: "Enter a valid number of minutes." };
    if (workMinutes <= 0) return { error: "Time spent mopping must be more than zero minutes." };
  }

  if (!Number.isFinite(workMinutes) || workMinutes <= 0) {
    return { error: "That combination does not give a usable mopping time." };
  }
  if (workMinutes > MAX_MINUTES) {
    return { error: `That works out to over ${MAX_MINUTES} minutes of mopping — split it into sessions.` };
  }

  const rate = kcalPerMinute(effort.met, weight);
  const totalKcal = rate * workMinutes;
  const netKcal = Math.max(0, totalKcal - kcalPerMinute(1, weight) * workMinutes);

  return {
    effortLabel: effort.label,
    met: effort.met,
    source: effort.source,
    weightKg: weight,
    minutes: workMinutes,
    areaM2: area,
    layoutLabel: layout ? layout.label : null,
    rate,
    totalKcal,
    netKcal,
    kcalPerHour: rate * 60,
    kcalPerM2: area && area > 0 ? totalKcal / area : null,
  };
}
