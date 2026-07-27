/**
 * Electric scooter range from road-load physics, not a flat "Wh/km" guess.
 *
 * Steady cruise force (the standard road-load equation):
 *   theta   = atan(gradePercent / 100)
 *   Froll   = Crr x m x g x cos(theta)
 *   Faero   = 0.5 x rho x CdA x v^2
 *   Fgrade  = m x g x sin(theta)
 *   cruiseWhPerKm = max(0, Froll + Faero + Fgrade) x 1000 / (3600 x drivetrainEfficiency)
 *
 * Stop-and-go penalty. Every acceleration back to cruise speed costs the kinetic energy
 * 0.5 m v^2, of which regenerative braking returns only a fraction:
 *   accelWhPerKm = stopsPerKm x 0.5 x m x v^2 x (1 - regen) / (3600 x drivetrainEfficiency)
 *
 * Range = usable battery energy / (cruiseWhPerKm + accelWhPerKm), where usable energy is
 * the nameplate Wh scaled by state of health and by the reserve you never actually use.
 */

/** Standard gravity, m/s^2 (CGPM definition). */
export const GRAVITY = 9.80665;

/** Air density at sea level and 15 degrees C, kg/m^3 (ISA standard atmosphere). */
export const AIR_DENSITY = 1.225;

/** Joules in one watt-hour. */
export const JOULES_PER_WH = 3600;

/**
 * Vehicle presets. CdA is the drag area (drag coefficient x frontal area) of vehicle
 * plus rider; Crr is the tyre rolling-resistance coefficient on tarmac. A standing
 * kick scooter is draggier and rolls worse on its small hard wheels; a seated Indian-style
 * electric scooter is heavier but more slippery and rolls on proper pneumatic tyres.
 */
export const VEHICLE_TYPES = [
  {
    value: "moped",
    label: "Seated electric scooter (Ather / Ola style)",
    kerbKg: 110,
    cdA: 0.5,
    crr: 0.015,
    driveEfficiency: 0.85,
  },
  {
    value: "kick",
    label: "Standing kick e-scooter",
    kerbKg: 15,
    cdA: 0.65,
    crr: 0.02,
    driveEfficiency: 0.8,
  },
  {
    value: "ebike",
    label: "Electric moped / low-speed e-bike",
    kerbKg: 70,
    cdA: 0.55,
    crr: 0.016,
    driveEfficiency: 0.82,
  },
];

/** Stops and re-accelerations per kilometre, by how congested the route is. */
export const TRAFFIC_LEVELS = [
  { value: "open", label: "Open road, barely any stops", stopsPerKm: 0.1 },
  { value: "suburban", label: "Suburban roads, occasional signals", stopsPerKm: 1 },
  { value: "city", label: "City traffic, regular signals", stopsPerKm: 3 },
  { value: "dense", label: "Dense city, stop-start throughout", stopsPerKm: 5 },
];

/** Average route gradient presets, in percent. */
export const TERRAIN_LEVELS = [
  { value: "flat", label: "Flat", gradePct: 0 },
  { value: "rolling", label: "Gently rolling", gradePct: 1.5 },
  { value: "hilly", label: "Hilly", gradePct: 3 },
  { value: "steep", label: "Steep hill climb", gradePct: 6 },
];

/**
 * Share of braking kinetic energy that regenerative braking returns to the pack.
 * Light two-wheelers recover far less than cars because their motors are small and much
 * braking is mechanical; 10-25% is the realistic band, so 15% is the default.
 */
export const DEFAULT_REGEN_FRACTION = 0.15;

/** Fraction of nameplate capacity you actually use before recharging (BMS reserve plus range anxiety). */
export const DEFAULT_USABLE_FRACTION = 0.9;

const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const findOption = (options, value) => options.find((option) => option.value === value) || null;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

/**
 * @param {object} input
 * @param {number|string} input.batteryWh Nameplate battery energy, watt-hours.
 * @param {string} [input.vehicle] One of VEHICLE_TYPES values.
 * @param {number|string} [input.kerbKg] Override the preset kerb weight, kg.
 * @param {number|string} [input.riderKg] Rider weight, kg.
 * @param {number|string} [input.cargoKg] Pillion plus luggage, kg.
 * @param {number|string} [input.speedKmph] Average cruising speed, km/h.
 * @param {number|string} [input.gradePct] Average route gradient, percent.
 * @param {number|string} [input.stopsPerKm] Stops and re-accelerations per km.
 * @param {number|string} [input.regenPct] Braking energy recovered, percent.
 * @param {number|string} [input.healthPct] Battery state of health, percent.
 * @param {number|string} [input.usablePct] Percent of the pack you actually use.
 * @param {number|string} [input.tariff] Electricity tariff, INR per kWh, for the cost line.
 */
export function computeScooterRange({
  batteryWh,
  vehicle = "moped",
  kerbKg,
  riderKg = 75,
  cargoKg = 0,
  speedKmph = 45,
  gradePct = 0,
  stopsPerKm = 3,
  regenPct = DEFAULT_REGEN_FRACTION * 100,
  healthPct = 100,
  usablePct = DEFAULT_USABLE_FRACTION * 100,
  tariff = 8,
} = {}) {
  const preset = findOption(VEHICLE_TYPES, vehicle);
  if (!preset) return { error: "Choose a valid vehicle type." };

  const v = {
    wh: toNumber(batteryWh),
    kerb: kerbKg === undefined || kerbKg === "" ? preset.kerbKg : toNumber(kerbKg),
    rider: toNumber(riderKg),
    cargo: toNumber(cargoKg),
    speed: toNumber(speedKmph),
    grade: toNumber(gradePct),
    stops: toNumber(stopsPerKm),
    regen: toNumber(regenPct),
    health: toNumber(healthPct),
    usable: toNumber(usablePct),
    rate: toNumber(tariff),
  };

  if (Object.values(v).some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (!(v.wh > 0)) return { error: "Enter the battery size in watt-hours (kWh × 1000)." };
  if (v.wh > 20000) return { error: "Over 20 kWh is car territory — check the battery figure." };
  if (v.kerb < 0 || v.rider < 0 || v.cargo < 0) return { error: "Weights cannot be negative." };
  if (v.rider + v.cargo + v.kerb <= 0) return { error: "Total weight must be greater than zero." };
  if (v.rider + v.cargo > 400) return { error: "Rider plus load above 400 kg is not a scooter payload." };
  if (!(v.speed > 0)) return { error: "Enter an average speed greater than zero." };
  if (v.speed > 150) return { error: "Enter an average speed under 150 km/h." };
  if (v.grade < -20 || v.grade > 20) return { error: "Average gradient should be between -20% and 20%." };
  if (v.stops < 0 || v.stops > 30) return { error: "Stops per km should be between 0 and 30." };
  if (v.regen < 0 || v.regen > 90) return { error: "Regenerative recovery should be between 0% and 90%." };
  if (v.health <= 0 || v.health > 100) return { error: "Battery health must be between 1% and 100%." };
  if (v.usable <= 0 || v.usable > 100) return { error: "Usable share must be between 1% and 100%." };
  if (v.rate < 0) return { error: "Electricity tariff cannot be negative." };

  const massKg = v.kerb + v.rider + v.cargo;
  const speedMs = v.speed / 3.6;
  const theta = Math.atan(v.grade / 100);

  const rollingN = preset.crr * massKg * GRAVITY * Math.cos(theta);
  const aeroN = 0.5 * AIR_DENSITY * preset.cdA * speedMs * speedMs;
  const gradeN = massKg * GRAVITY * Math.sin(theta);
  const netRoadN = rollingN + aeroN + gradeN;

  const cruiseWhPerKm =
    Math.max(0, netRoadN) * 1000 / (JOULES_PER_WH * preset.driveEfficiency);

  const kineticJoulesPerStop = 0.5 * massKg * speedMs * speedMs;
  const accelWhPerKm =
    (v.stops * kineticJoulesPerStop * (1 - v.regen / 100)) /
    (JOULES_PER_WH * preset.driveEfficiency);

  const whPerKm = cruiseWhPerKm + accelWhPerKm;
  if (!(whPerKm > 0.1)) {
    return {
      error:
        "At this gradient the scooter would coast the whole way. Enter the average gradient of the route, which is near 0% for any round trip.",
    };
  }

  const usableWh = v.wh * (v.health / 100) * (v.usable / 100);
  const rangeKm = usableWh / whPerKm;

  const fullChargeCost = ((v.wh * (v.health / 100)) / 1000) * v.rate;
  const costPerKm = rangeKm > 0 ? fullChargeCost / rangeKm : 0;

  const notes = [];
  if (v.speed >= 60) {
    notes.push(
      "Aerodynamic drag grows with the square of speed, so a 20% higher cruising speed costs about 44% more energy to push through the air.",
    );
  }
  if (v.stops >= 3) {
    notes.push(
      `Stop-start traffic adds ${round(accelWhPerKm, 1)} Wh/km on top of cruising — that is ${round((accelWhPerKm / whPerKm) * 100)}% of the total.`,
    );
  }
  if (v.grade > 0) {
    notes.push(
      "A positive average gradient means a net climb. For a there-and-back commute set it to 0%, since the descent gives most of it back.",
    );
  }
  if (v.health < 85) {
    notes.push("Below about 85% state of health, most manufacturers consider a two-wheeler pack due for replacement.");
  }

  return {
    massKg: round(massKg, 1),
    kerbKg: round(v.kerb, 1),
    speedKmph: round(v.speed, 1),
    speedMs: round(speedMs, 2),
    gradePct: round(v.grade, 2),
    cdA: preset.cdA,
    crr: preset.crr,
    driveEfficiencyPct: round(preset.driveEfficiency * 100),
    rollingN: round(rollingN, 1),
    aeroN: round(aeroN, 1),
    gradeN: round(gradeN, 1),
    netRoadN: round(netRoadN, 1),
    cruiseWhPerKm: round(cruiseWhPerKm, 1),
    accelWhPerKm: round(accelWhPerKm, 1),
    whPerKm: round(whPerKm, 1),
    kwhPer100Km: round(whPerKm / 10, 2),
    nameplateWh: round(v.wh),
    usableWh: round(usableWh),
    rangeKm: round(rangeKm, 1),
    fullChargeCost: round(fullChargeCost, 2),
    costPerKm: round(costPerKm, 2),
    notes,
  };
}
