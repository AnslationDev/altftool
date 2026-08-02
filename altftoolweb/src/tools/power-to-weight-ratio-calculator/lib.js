/**
 * Power-to-weight ratio and acceleration potential.
 *
 * Ratios are simple division. The 0-to-V estimate is a work-energy model:
 *   kinetic energy needed  E = 1/2 * m * v^2
 *   time at average power  t = E / (k * P_peak)
 * where k is the fraction of peak power actually delivered across the run
 * (gearshifts, clutch slip, and the part of the run spent below peak-power rpm).
 * The result is floored by the traction/wheelie limit t = v / (a_max * g),
 * because no amount of power beats the point where the front wheel lifts or the
 * tyre breaks away.
 */

/** 1 PS = 735.49875 W (DIN 66036); 1 bhp = 745.699872 W. */
export const POWER_UNITS = {
  ps: { label: "PS (metric hp)", watts: 735.49875 },
  kw: { label: "kW", watts: 1000 },
  bhp: { label: "bhp (imperial hp)", watts: 745.699872 },
};

/** Standard gravity, m/s^2 (CGPM 1901). */
export const G = 9.80665;

/**
 * Fraction of peak power realised across a standing-start run. Calibrated
 * against published 0-100 km/h times: k = 0.55 reproduces a KTM 390 Duke at
 * ~5.3 s and a Royal Enfield Classic 350 at ~12.8 s; k = 0.6 puts a 150 PS,
 * 1,475 kg petrol car at ~8.6 s. EVs sit higher because they hold near-peak
 * power from a standstill with no gearshifts.
 */
export const AVG_POWER_FRACTION = {
  motorcycle: 0.55,
  scooter: 0.5,
  car: 0.6,
  ev: 0.65,
};

/**
 * Peak usable longitudinal acceleration in g before the front wheel lifts (bike)
 * or the driven tyres spin (car). ~1.1 g is the practical wheelie limit for a
 * sportbike; a 2WD car on a good road is traction-limited near 1.0 g.
 */
export const MAX_ACCEL_G = {
  motorcycle: 1.1,
  scooter: 0.8,
  car: 1.0,
  ev: 1.1,
};

export const VEHICLE_LABELS = {
  motorcycle: "Motorcycle",
  scooter: "Scooter / step-through",
  car: "Car (petrol/diesel)",
  ev: "Electric vehicle",
};

/** Typical PS-per-tonne figures for context. Kerb weight only, no occupants. */
export const BENCHMARKS = [
  { label: "110 cc scooter", psPerTonne: 73 },
  { label: "125 cc commuter motorcycle", psPerTonne: 93 },
  { label: "Family hatchback", psPerTonne: 70 },
  { label: "350 cc classic motorcycle", psPerTonne: 104 },
  { label: "200 cc streetfighter", psPerTonne: 155 },
  { label: "Hot hatch", psPerTonne: 150 },
  { label: "400 cc naked motorcycle", psPerTonne: 260 },
  { label: "650 cc parallel twin", psPerTonne: 347 },
  { label: "Litre-class superbike", psPerTonne: 985 },
];

const MAX_POWER_W = 3_000_000;
const MAX_MASS_KG = 50_000;
const MAX_SPEED_KMPH = 500;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a power reading in any supported unit to watts. */
export function toWatts(value, unit) {
  const entry = POWER_UNITS[unit] ?? POWER_UNITS.ps;
  if (!isNum(value)) return NaN;
  return value * entry.watts;
}

/** Convert watts back to a named unit. */
export function fromWatts(watts, unit) {
  const entry = POWER_UNITS[unit] ?? POWER_UNITS.ps;
  if (!isNum(watts)) return NaN;
  return watts / entry.watts;
}

/**
 * Time from rest to `targetKmph`, in seconds, plus which limit binds.
 * Ignores aerodynamic drag, which is small below about 120 km/h but grows with
 * the cube of speed above it.
 */
export function accelerationTime({ powerWatts, massKg, targetKmph, powerFraction, maxAccelG }) {
  if (!(powerWatts > 0) || !(massKg > 0) || !(targetKmph > 0)) return null;
  const v = targetKmph / 3.6;
  const energy = 0.5 * massKg * v * v;
  const powerLimited = energy / (powerFraction * powerWatts);
  const tractionLimited = v / (maxAccelG * G);
  const seconds = Math.max(powerLimited, tractionLimited);
  return {
    seconds,
    powerLimited,
    tractionLimited,
    limitedBy: tractionLimited > powerLimited ? "traction" : "power",
  };
}

/** Full power-to-weight report. */
export function computePowerToWeight({
  power,
  powerUnit = "ps",
  kerbWeightKg,
  addedLoadKg = 0,
  vehicleType = "motorcycle",
  targetKmph = 100,
} = {}) {
  if (!isNum(power) || !isNum(kerbWeightKg)) {
    return { error: "Enter both power and kerb weight as numbers." };
  }
  if (power <= 0) return { error: "Power must be greater than zero." };
  if (kerbWeightKg <= 0) return { error: "Kerb weight must be greater than zero." };
  if (isNum(addedLoadKg) && addedLoadKg < 0) {
    return { error: "Added load cannot be negative." };
  }
  const load = isNum(addedLoadKg) ? addedLoadKg : 0;
  if (kerbWeightKg + load > MAX_MASS_KG) {
    return { error: `Total mass above ${MAX_MASS_KG.toLocaleString("en-IN")} kg is outside this calculator's range.` };
  }
  const watts = toWatts(power, powerUnit);
  if (!isNum(watts) || watts <= 0) return { error: "Power could not be read as a number." };
  if (watts > MAX_POWER_W) return { error: "Power above 3,000 kW is outside this calculator's range." };
  if (!isNum(targetKmph) || targetKmph <= 0 || targetKmph > MAX_SPEED_KMPH) {
    return { error: `Target speed must be between 1 and ${MAX_SPEED_KMPH} km/h.` };
  }

  const totalMass = kerbWeightKg + load;
  const ps = fromWatts(watts, "ps");
  const kw = watts / 1000;
  const bhp = fromWatts(watts, "bhp");

  const kerbTonnes = kerbWeightKg / 1000;
  const totalTonnes = totalMass / 1000;

  const fraction = AVG_POWER_FRACTION[vehicleType] ?? AVG_POWER_FRACTION.motorcycle;
  const accelG = MAX_ACCEL_G[vehicleType] ?? MAX_ACCEL_G.motorcycle;

  const accel = accelerationTime({
    powerWatts: watts,
    massKg: totalMass,
    targetKmph,
    powerFraction: fraction,
    maxAccelG: accelG,
  });

  return {
    powerPs: ps,
    powerKw: kw,
    powerBhp: bhp,
    kerbWeightKg,
    addedLoadKg: load,
    totalMassKg: totalMass,
    psPerTonneKerb: ps / kerbTonnes,
    psPerTonneLaden: ps / totalTonnes,
    kwPerTonneLaden: kw / totalTonnes,
    bhpPerTonneLaden: bhp / totalTonnes,
    wattsPerKgLaden: watts / totalMass,
    kgPerPsLaden: totalMass / ps,
    targetKmph,
    accel,
    powerFraction: fraction,
    maxAccelG: accelG,
    vehicleType,
  };
}

/** Nearest benchmark to a given PS/tonne figure, for context in the UI. */
export function nearestBenchmark(psPerTonne) {
  if (!isNum(psPerTonne)) return null;
  return BENCHMARKS.reduce((best, entry) =>
    Math.abs(entry.psPerTonne - psPerTonne) < Math.abs(best.psPerTonne - psPerTonne) ? entry : best,
  );
}
