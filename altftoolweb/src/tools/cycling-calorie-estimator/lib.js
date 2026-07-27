/**
 * Cycling calorie estimator.
 *
 * Primary method is the standard cycling power equation, which is what a power
 * meter measures:
 *   P = v * (Crr * m * g * cos(theta) + m * g * sin(theta))
 *       + 0.5 * rho * CdA * vAir^2 * v
 * Mechanical work is then converted to food energy by dividing by the cyclist's
 * gross efficiency. At 24% gross efficiency 1 kJ of mechanical work costs almost
 * exactly 1 kcal, which is why riders read kilojoules off a head unit and treat
 * them as calories.
 *
 * A second figure comes from the 2011 Compendium of Physical Activities MET
 * values for bicycling, using kcal/min = MET * 3.5 * kg / 200. The two rarely
 * agree, because the Compendium values were measured over mixed real-world
 * riding rather than a steady effort on flat tarmac.
 */

/** Standard gravity, m/s^2. */
export const G = 9.80665;

/** Air density at sea level, 15 degrees C, dry (ISA). */
export const AIR_DENSITY_SEA_LEVEL = 1.225;

/**
 * Gross mechanical efficiency of cycling: total energy expended divided by
 * mechanical work at the pedals. Laboratory values cluster at 20-25%; 24% is
 * used here because it makes 1 kJ of work equal 1 kcal to within 0.5%.
 */
export const GROSS_EFFICIENCY = 0.24;

/** 1 kilocalorie = 4184 joules (thermochemical calorie). */
export const JOULES_PER_KCAL = 4184;

/**
 * Rolling resistance coefficient and effective frontal area (CdA, m^2) for
 * common bike/surface/position combinations. Values are the ranges usually
 * quoted in cycling aerodynamics literature and field testing.
 */
export const TERRAINS = {
  roadDrops: { label: "Road bike, tarmac, in the drops", crr: 0.004, cda: 0.32 },
  roadHoods: { label: "Road bike, tarmac, on the hoods", crr: 0.004, cda: 0.4 },
  hybrid: { label: "Hybrid or city bike, upright, tarmac", crr: 0.008, cda: 0.55 },
  gravel: { label: "Gravel or hardpack track", crr: 0.01, cda: 0.45 },
  mtbTrail: { label: "Mountain bike, knobby tyres, trail", crr: 0.015, cda: 0.5 },
  softSand: { label: "Soft sand or deep mud", crr: 0.03, cda: 0.5 },
};

/**
 * 2011 Compendium of Physical Activities MET values for bicycling, keyed by
 * average speed band in km/h.
 */
export const MET_BANDS = [
  { maxKmph: 16, met: 4.0, label: "Under 16 km/h, leisure" },
  { maxKmph: 19.3, met: 6.8, label: "16-19.2 km/h, light effort" },
  { maxKmph: 22.5, met: 8.0, label: "19.3-22.4 km/h, moderate effort" },
  { maxKmph: 25.7, met: 10.0, label: "22.5-25.6 km/h, vigorous effort" },
  { maxKmph: 30.6, met: 12.0, label: "25.7-30.6 km/h, very fast" },
  { maxKmph: Infinity, met: 15.8, label: "Above 30.6 km/h, racing" },
];

/** MET for off-road riding, which the Compendium lists separately. */
export const MTB_MET = 8.5;
export const MTB_UPHILL_MET = 14.0;

/** Energy in one gram of fat, kcal. Used only for the "fat equivalent" line. */
export const KCAL_PER_GRAM_FAT = 9;

const MIN_DISTANCE_KM = 0.1;
const MAX_DISTANCE_KM = 1000;
const MIN_SPEED_KMPH = 1;
const MAX_SPEED_KMPH = 100;
const MIN_WEIGHT_KG = 20;
const MAX_WEIGHT_KG = 250;
const MAX_BIKE_KG = 60;
const MAX_GRADE_PCT = 30;
const MAX_WIND_KMPH = 100;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Compendium MET value for a given average speed in km/h. */
export function metForSpeed(speedKmph) {
  const band = MET_BANDS.find((entry) => speedKmph < entry.maxKmph);
  return band ?? MET_BANDS[MET_BANDS.length - 1];
}

/**
 * Mechanical power at the wheels, in watts, for a steady effort.
 * Returns 0 when the road is steep enough downhill that gravity alone would
 * carry the rider faster than the requested speed — you cannot pedal negative.
 */
export function cyclingPower({ massKg, speedKmph, gradePct, crr, cda, headwindKmph = 0, airDensity = AIR_DENSITY_SEA_LEVEL }) {
  if (!(massKg > 0) || !(speedKmph > 0)) return null;
  const v = speedKmph / 3.6;
  const vAir = Math.max(0, (speedKmph + headwindKmph) / 3.6);
  const theta = Math.atan(gradePct / 100);
  const rolling = crr * massKg * G * Math.cos(theta) * v;
  const gravity = massKg * G * Math.sin(theta) * v;
  const drag = 0.5 * airDensity * cda * vAir * vAir * v;
  const total = rolling + gravity + drag;
  return {
    rolling,
    gravity,
    drag,
    total,
    pedalled: Math.max(0, total),
    coasting: total <= 0,
  };
}

export function estimateCyclingCalories({
  distanceKm,
  speedKmph,
  riderWeightKg,
  bikeWeightKg = 10,
  terrain = "roadHoods",
  gradePct = 0,
  headwindKmph = 0,
} = {}) {
  if (!isNum(distanceKm) || !isNum(speedKmph) || !isNum(riderWeightKg)) {
    return { error: "Enter distance, average speed and your body weight as numbers." };
  }
  if (distanceKm < MIN_DISTANCE_KM || distanceKm > MAX_DISTANCE_KM) {
    return { error: `Distance must be between ${MIN_DISTANCE_KM} and ${MAX_DISTANCE_KM} km.` };
  }
  if (speedKmph < MIN_SPEED_KMPH || speedKmph > MAX_SPEED_KMPH) {
    return { error: `Average speed must be between ${MIN_SPEED_KMPH} and ${MAX_SPEED_KMPH} km/h.` };
  }
  if (riderWeightKg < MIN_WEIGHT_KG || riderWeightKg > MAX_WEIGHT_KG) {
    return { error: `Body weight must be between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.` };
  }
  const bike = isNum(bikeWeightKg) && bikeWeightKg >= 0 ? bikeWeightKg : 0;
  if (bike > MAX_BIKE_KG) return { error: `Bike and kit weight must be under ${MAX_BIKE_KG} kg.` };
  const grade = isNum(gradePct) ? gradePct : 0;
  if (Math.abs(grade) > MAX_GRADE_PCT) {
    return { error: `Average gradient must be between -${MAX_GRADE_PCT}% and +${MAX_GRADE_PCT}%.` };
  }
  const wind = isNum(headwindKmph) ? headwindKmph : 0;
  if (Math.abs(wind) > MAX_WIND_KMPH) {
    return { error: `Headwind must be between -${MAX_WIND_KMPH} and +${MAX_WIND_KMPH} km/h.` };
  }
  const surface = TERRAINS[terrain] ?? TERRAINS.roadHoods;

  const massKg = riderWeightKg + bike;
  const hours = distanceKm / speedKmph;
  const seconds = hours * 3600;
  const minutes = hours * 60;

  const power = cyclingPower({
    massKg,
    speedKmph,
    gradePct: grade,
    crr: surface.crr,
    cda: surface.cda,
    headwindKmph: wind,
  });

  const workJoules = power.pedalled * seconds;
  const kcal = workJoules / GROSS_EFFICIENCY / JOULES_PER_KCAL;

  const metBand = metForSpeed(speedKmph);
  const metKcal = ((metBand.met * 3.5 * riderWeightKg) / 200) * minutes;
  // 1 MET is resting metabolism. On a long coast the physics term goes to zero
  // but the body keeps burning at rest, so that is the floor.
  const restingKcal = ((1 * 3.5 * riderWeightKg) / 200) * minutes;
  const totalKcal = Math.max(kcal, restingKcal);

  const elevationGainM = distanceKm * 1000 * (grade / 100);

  // Share of pedalling power spent on each resistance, for display.
  const parts = [
    { key: "rolling", label: "Rolling resistance", watts: Math.max(0, power.rolling) },
    { key: "drag", label: "Air drag", watts: Math.max(0, power.drag) },
    { key: "gravity", label: "Climbing", watts: Math.max(0, power.gravity) },
  ];
  const partsTotal = parts.reduce((sum, part) => sum + part.watts, 0);
  const powerSplit = parts.map((part) => ({
    ...part,
    share: partsTotal > 0 ? (part.watts / partsTotal) * 100 : 0,
  }));

  return {
    massKg,
    hours,
    minutes,
    power,
    powerSplit,
    avgPowerW: power.pedalled,
    workKj: workJoules / 1000,
    kcal: totalKcal,
    workKcal: kcal,
    restingKcal,
    kcalPerHour: hours > 0 ? totalKcal / hours : 0,
    kcalPerKm: distanceKm > 0 ? totalKcal / distanceKm : 0,
    metBand,
    metKcal,
    fatGrams: totalKcal / KCAL_PER_GRAM_FAT,
    elevationGainM,
    surface,
    gradePct: grade,
    headwindKmph: wind,
  };
}
