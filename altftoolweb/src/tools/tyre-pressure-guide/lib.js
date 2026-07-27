/**
 * Tyre pressure reference maths.
 *
 * Every pressure here is a COLD inflation pressure (tyre driven less than ~3 km
 * or parked at least 3 hours), which is how every vehicle placard and every
 * tyre standard (ETRTO / TRA / JATMA) states pressure.
 */

/** Standard atmospheric pressure at sea level, in psi (ISO 2533). */
export const ATMOSPHERIC_PSI = 14.696;

/** 1 bar = 14.5038 psi (exact conversion: 1 bar = 100 kPa, 1 psi = 6894.757 Pa). */
export const PSI_PER_BAR = 14.5037738;

/** 1 psi = 6.894757 kPa (NIST SP 811 conversion factor). */
export const KPA_PER_PSI = 6.894757;

/** Celsius -> Kelvin offset. */
export const KELVIN_OFFSET = 273.15;

/**
 * Typical extra pressure manufacturers ask for before sustained high-speed
 * running (most European owner's manuals quote +0.2 bar ~ +3 psi).
 */
export const HIGHWAY_ADD_PSI = 3;

/**
 * A tyre warmed by normal running reads roughly 4 psi above its cold value.
 * This is the industry figure behind the universal "never bleed a hot tyre"
 * instruction.
 */
export const HOT_TYRE_RISE_PSI = 4;

/** Temperature the reference/placard figures are assumed to be set at. */
export const REFERENCE_TEMP_C = 20;

/** Space-saver spare wheels are almost always placarded at 60 psi / 4.2 bar. */
export const SPACE_SAVER_SPARE_PSI = 60;

/**
 * Typical cold placard pressures by vehicle class. These are the ranges seen
 * across mainstream models; the number on YOUR door jamb, fuel-flap or swingarm
 * sticker always wins. Ranges are given so the guide never pretends to know a
 * specific car's placard.
 */
export const VEHICLE_TYPES = {
  hatchback: {
    label: "Hatchback / small car",
    klass: "car",
    front: 32,
    rear: 30,
    frontMin: 30,
    frontMax: 33,
    rearMin: 28,
    rearMax: 32,
  },
  sedan: {
    label: "Sedan",
    klass: "car",
    front: 32,
    rear: 32,
    frontMin: 30,
    frontMax: 34,
    rearMin: 30,
    rearMax: 34,
  },
  "compact-suv": {
    label: "Compact SUV / crossover",
    klass: "car",
    front: 33,
    rear: 33,
    frontMin: 31,
    frontMax: 35,
    rearMin: 31,
    rearMax: 35,
  },
  "large-suv": {
    label: "Full-size SUV / 4x4",
    klass: "car",
    front: 35,
    rear: 38,
    frontMin: 33,
    frontMax: 38,
    rearMin: 35,
    rearMax: 42,
  },
  mpv: {
    label: "MPV / 7-seater",
    klass: "car",
    front: 33,
    rear: 36,
    frontMin: 32,
    frontMax: 36,
    rearMin: 34,
    rearMax: 40,
  },
  pickup: {
    label: "Pickup / light commercial",
    klass: "car",
    front: 35,
    rear: 45,
    frontMin: 33,
    frontMax: 38,
    rearMin: 40,
    rearMax: 50,
  },
  motorcycle: {
    label: "Motorcycle (100-400cc)",
    klass: "two-wheeler",
    front: 29,
    rear: 33,
    frontMin: 25,
    frontMax: 32,
    rearMin: 28,
    rearMax: 36,
  },
  scooter: {
    label: "Scooter",
    klass: "two-wheeler",
    front: 26,
    rear: 32,
    frontMin: 24,
    frontMax: 28,
    rearMin: 28,
    rearMax: 36,
  },
};

/**
 * Load columns on a placard normally add ~0.2-0.3 bar (3-4 psi), and almost all
 * of it goes to the driven/loaded axle. These adders mirror that pattern.
 */
export const LOAD_LEVELS = {
  car: {
    light: { label: "1-2 people, no luggage", front: 0, rear: 0 },
    half: { label: "3-4 people, light luggage", front: 0, rear: 2 },
    full: { label: "Full seats + boot loaded", front: 1, rear: 4 },
    max: { label: "At GVW / roof box / towing", front: 2, rear: 6 },
  },
  "two-wheeler": {
    light: { label: "Rider only", front: 0, rear: 0 },
    half: { label: "Rider + pillion", front: 0, rear: 2 },
    full: { label: "Rider + pillion + luggage", front: 1, rear: 3 },
    max: { label: "At the bike's max load limit", front: 1, rear: 4 },
  },
};

const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/** psi -> bar. */
export function psiToBar(psi) {
  if (!Number.isFinite(psi)) return 0;
  return psi / PSI_PER_BAR;
}

/** psi -> kPa. */
export function psiToKpa(psi) {
  if (!Number.isFinite(psi)) return 0;
  return psi * KPA_PER_PSI;
}

/**
 * Gauge pressure a sealed tyre will read after a temperature change.
 * Gay-Lussac's law on ABSOLUTE pressure: (P + atm) / T is constant.
 */
export function gaugeAtTemperature(setPsi, setTempC, targetTempC) {
  if (!Number.isFinite(setPsi) || !Number.isFinite(setTempC) || !Number.isFinite(targetTempC)) {
    return NaN;
  }
  const setK = setTempC + KELVIN_OFFSET;
  const targetK = targetTempC + KELVIN_OFFSET;
  if (setK <= 0 || targetK <= 0) return NaN;
  return (setPsi + ATMOSPHERIC_PSI) * (targetK / setK) - ATMOSPHERIC_PSI;
}

/**
 * Recommend a cold inflation pressure for a vehicle class, load and season.
 *
 * @param {object} input
 * @param {string} input.vehicleType key of VEHICLE_TYPES
 * @param {string} input.loadLevel   key of LOAD_LEVELS[class]
 * @param {boolean} input.highway    sustained high-speed running expected
 * @param {number} input.fillTempC   ambient temperature when you inflate
 * @param {number} input.coldestTempC coldest ambient you expect before the next check
 * @param {number} [input.maxSidewallPsi] the "MAX PRESS" figure moulded on the sidewall
 * @param {number} [input.placardFrontPsi] your own placard front value (overrides the table)
 * @param {number} [input.placardRearPsi]  your own placard rear value (overrides the table)
 */
export function recommendTyrePressure({
  vehicleType,
  loadLevel,
  highway = false,
  fillTempC,
  coldestTempC,
  maxSidewallPsi,
  placardFrontPsi,
  placardRearPsi,
} = {}) {
  const vehicle = VEHICLE_TYPES[vehicleType];
  if (!vehicle) return { error: "Choose a vehicle type from the list." };

  const loads = LOAD_LEVELS[vehicle.klass];
  const load = loads[loadLevel];
  if (!load) return { error: "Choose how the vehicle is loaded." };

  if (!Number.isFinite(fillTempC) || !Number.isFinite(coldestTempC)) {
    return { error: "Enter both temperatures as numbers." };
  }
  if (fillTempC < -40 || fillTempC > 60 || coldestTempC < -40 || coldestTempC > 60) {
    return { error: "Temperatures must be between -40 °C and 60 °C." };
  }

  const usePlacard = Number.isFinite(placardFrontPsi) && Number.isFinite(placardRearPsi);
  if (
    (Number.isFinite(placardFrontPsi) || Number.isFinite(placardRearPsi)) &&
    !usePlacard
  ) {
    return { error: "Enter both placard values, or leave both blank to use the typical range." };
  }
  if (usePlacard && (placardFrontPsi <= 0 || placardRearPsi <= 0)) {
    return { error: "Placard pressures must be greater than zero." };
  }
  if (usePlacard && (placardFrontPsi > 90 || placardRearPsi > 90)) {
    return { error: "Placard pressures above 90 psi are outside passenger-tyre range." };
  }

  const hasMax = Number.isFinite(maxSidewallPsi) && maxSidewallPsi > 0;
  if (Number.isFinite(maxSidewallPsi) && maxSidewallPsi <= 0) {
    return { error: "Sidewall maximum pressure must be greater than zero." };
  }

  const baseFront = usePlacard ? placardFrontPsi : vehicle.front;
  const baseRear = usePlacard ? placardRearPsi : vehicle.rear;

  const highwayAdd = highway ? HIGHWAY_ADD_PSI : 0;
  let front = baseFront + load.front + highwayAdd;
  let rear = baseRear + load.rear + highwayAdd;

  const warnings = [];
  let cappedAtSidewall = false;
  if (hasMax) {
    if (front > maxSidewallPsi || rear > maxSidewallPsi) {
      cappedAtSidewall = true;
      warnings.push(
        `Load and speed adders push the target above the ${round1(maxSidewallPsi)} psi moulded on the sidewall, so it has been capped there. Never inflate a cold tyre past that figure.`,
      );
      front = Math.min(front, maxSidewallPsi);
      rear = Math.min(rear, maxSidewallPsi);
    }
    if (baseFront > maxSidewallPsi || baseRear > maxSidewallPsi) {
      warnings.push(
        usePlacard
          ? "The placard pressure you entered is already above the sidewall maximum — re-check both figures, the fitted tyre may be under-rated for this vehicle."
          : "Even the base pressure for this vehicle class sits above the sidewall maximum you entered — that tyre is likely under-rated for the job.",
      );
    }
  } else {
    warnings.push("Add the sidewall MAX PRESS figure so the tool can check the target against it.");
  }

  if (coldestTempC < fillTempC - 25) {
    warnings.push("A temperature swing this large will move the gauge by several psi — check pressures on the coldest morning, not after a warm afternoon drive.");
  }

  const frontAtColdest = gaugeAtTemperature(front, fillTempC, coldestTempC);
  const rearAtColdest = gaugeAtTemperature(rear, fillTempC, coldestTempC);
  const frontDrift = frontAtColdest - front;
  const rearDrift = rearAtColdest - rear;

  /** How far a 10 °C drop moves the gauge at this pressure, for the rule of thumb. */
  const driftPerTenC = gaugeAtTemperature(front, REFERENCE_TEMP_C, REFERENCE_TEMP_C - 10) - front;

  const underInflatedFront = front > 0 ? (-frontDrift / front) * 100 : 0;

  return {
    vehicleLabel: vehicle.label,
    loadLabel: load.label,
    klass: vehicle.klass,
    frontPsi: round1(front),
    rearPsi: round1(rear),
    frontBar: round2(psiToBar(front)),
    rearBar: round2(psiToBar(rear)),
    frontKpa: Math.round(psiToKpa(front)),
    rearKpa: Math.round(psiToKpa(rear)),
    frontRange: usePlacard ? null : [vehicle.frontMin, vehicle.frontMax],
    rearRange: usePlacard ? null : [vehicle.rearMin, vehicle.rearMax],
    usedPlacard: usePlacard,
    loadAddFront: load.front,
    loadAddRear: load.rear,
    highwayAdd,
    frontAtColdest: round1(frontAtColdest),
    rearAtColdest: round1(rearAtColdest),
    frontDrift: round1(frontDrift),
    rearDrift: round1(rearDrift),
    driftPerTenC: round1(driftPerTenC),
    frontHotReading: round1(front + HOT_TYRE_RISE_PSI),
    rearHotReading: round1(rear + HOT_TYRE_RISE_PSI),
    percentLowAtColdest: round1(underInflatedFront),
    cappedAtSidewall,
    spareSpaceSaverPsi: SPACE_SAVER_SPARE_PSI,
    warnings,
  };
}
