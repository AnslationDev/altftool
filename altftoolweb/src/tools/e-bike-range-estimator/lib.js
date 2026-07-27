/**
 * Electric bicycle range estimator.
 *
 * Range is decided by how much energy the motor has to put into the road, not
 * by a headline number on the box. The chain of reasoning:
 *   1. Total power to hold a speed comes from the cycling power equation:
 *      P = v*(Crr*m*g*cos0 + m*g*sin0) + 0.5*rho*CdA*vAir^2*v
 *   2. A pedelec assist level is defined as a percentage of the RIDER's power,
 *      so at an assist ratio a the motor supplies a/(1+a) of the total.
 *   3. The motor is capped by the class limit, and assistance stops entirely
 *      above the class cut-off speed.
 *   4. Battery draw = motor output / system efficiency, and usable capacity is
 *      derated for the reserve the BMS keeps and for cold weather.
 */

export const G = 9.80665;
export const AIR_DENSITY_SEA_LEVEL = 1.225;

/**
 * Legal classes. EN 15194 (EU) and the Indian exemption notified under the
 * Motor Vehicles Act both use 250 W continuous rated power with assistance
 * cutting out at 25 km/h; below those limits an e-bicycle needs no
 * registration, licence or insurance in India. US classes 1 and 2 allow 750 W
 * to 20 mph (32 km/h) and class 3 to 28 mph (45 km/h).
 */
export const EBIKE_CLASSES = {
  eu: { label: "EU / India pedelec — 250 W, 25 km/h", maxMotorW: 250, cutoffKmph: 25 },
  usClass12: { label: "US Class 1 or 2 — 750 W, 32 km/h", maxMotorW: 750, cutoffKmph: 32 },
  usClass3: { label: "US Class 3 — 750 W, 45 km/h", maxMotorW: 750, cutoffKmph: 45 },
  offroad: { label: "Off-road / unrestricted", maxMotorW: 2000, cutoffKmph: Infinity },
};

/**
 * Assist levels as a percentage of rider power, matching the support levels
 * published for mid-drive systems such as the Bosch Performance Line.
 */
export const ASSIST_LEVELS = {
  eco: { label: "Eco", ratio: 0.6 },
  tour: { label: "Tour", ratio: 1.4 },
  sport: { label: "Sport / eMTB", ratio: 2.4 },
  turbo: { label: "Turbo", ratio: 3.4 },
};

/** Rolling resistance and effective frontal area by bike and surface. */
export const TERRAINS = {
  roadTarmac: { label: "Road e-bike, smooth tarmac", crr: 0.005, cda: 0.42 },
  cityUpright: { label: "City e-bike, upright, tarmac", crr: 0.008, cda: 0.55 },
  cargo: { label: "Cargo e-bike, upright, tarmac", crr: 0.009, cda: 0.7 },
  gravel: { label: "Gravel or broken road", crr: 0.011, cda: 0.5 },
  mtbTrail: { label: "E-MTB, knobby tyres, trail", crr: 0.016, cda: 0.52 },
};

/**
 * Battery-to-wheel efficiency of the whole drive: controller, motor and
 * drivetrain. Mid-drives measure around 0.75-0.80, geared hubs a little lower.
 */
export const DEFAULT_SYSTEM_EFFICIENCY = 0.75;

/** Share of nominal capacity you can actually use before the BMS cuts out. */
export const DEFAULT_USABLE_FRACTION = 0.9;

/**
 * Lithium-ion delivered capacity against ambient temperature in Celsius.
 * Interpolated linearly between these anchors; cells lose roughly a fifth of
 * their usable capacity at freezing point.
 */
export const TEMPERATURE_ANCHORS = [
  [-10, 0.7],
  [0, 0.82],
  [10, 0.92],
  [20, 1.0],
  [40, 1.0],
];

const MIN_VOLTAGE = 12;
const MAX_VOLTAGE = 120;
const MAX_AMP_HOURS = 60;
const MIN_SPEED_KMPH = 5;
const MAX_SPEED_KMPH = 60;
const MAX_GRADE_PCT = 25;
const MIN_TEMP_C = -30;
const MAX_TEMP_C = 55;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Usable-capacity multiplier for an ambient temperature in Celsius. */
export function temperatureFactor(celsius) {
  if (!isNum(celsius)) return 1;
  const anchors = TEMPERATURE_ANCHORS;
  if (celsius <= anchors[0][0]) return anchors[0][1];
  if (celsius >= anchors[anchors.length - 1][0]) return anchors[anchors.length - 1][1];
  for (let i = 1; i < anchors.length; i += 1) {
    const [t0, f0] = anchors[i - 1];
    const [t1, f1] = anchors[i];
    if (celsius <= t1) return f0 + ((celsius - t0) / (t1 - t0)) * (f1 - f0);
  }
  return 1;
}

/** Total power at the wheel needed to hold a steady speed, in watts. */
export function totalRoadPower({ massKg, speedKmph, gradePct, crr, cda, headwindKmph = 0 }) {
  if (!(massKg > 0) || !(speedKmph > 0)) return null;
  const v = speedKmph / 3.6;
  const vAir = Math.max(0, (speedKmph + headwindKmph) / 3.6);
  const theta = Math.atan(gradePct / 100);
  const rolling = crr * massKg * G * Math.cos(theta) * v;
  const gravity = massKg * G * Math.sin(theta) * v;
  const drag = 0.5 * AIR_DENSITY_SEA_LEVEL * cda * vAir * vAir * v;
  return { rolling, gravity, drag, total: rolling + gravity + drag };
}

/** Motor and rider split for one assist level, respecting the class cap. */
export function splitAssist({ totalW, assistRatio, maxMotorW, speedKmph, cutoffKmph }) {
  if (!isNum(totalW)) return null;
  const demand = Math.max(0, totalW);
  if (speedKmph > cutoffKmph) {
    return { motorW: 0, riderW: demand, capped: false, aboveCutoff: true };
  }
  const wanted = (demand * assistRatio) / (1 + assistRatio);
  const motorW = Math.min(wanted, maxMotorW);
  return {
    motorW,
    riderW: demand - motorW,
    capped: wanted > maxMotorW,
    aboveCutoff: false,
  };
}

export function estimateEbikeRange({
  batteryVolts = 36,
  batteryAmpHours = 14,
  riderWeightKg,
  bikeWeightKg = 25,
  cargoKg = 0,
  speedKmph = 25,
  terrain = "cityUpright",
  gradePct = 0,
  headwindKmph = 0,
  assist = "tour",
  ebikeClass = "eu",
  systemEfficiency = DEFAULT_SYSTEM_EFFICIENCY,
  usableFraction = DEFAULT_USABLE_FRACTION,
  temperatureC = 25,
  sustainableRiderW = 100,
} = {}) {
  if (!isNum(batteryVolts) || !isNum(batteryAmpHours) || !isNum(riderWeightKg)) {
    return { error: "Enter battery voltage, capacity and rider weight as numbers." };
  }
  if (batteryVolts < MIN_VOLTAGE || batteryVolts > MAX_VOLTAGE) {
    return { error: `Battery voltage must be between ${MIN_VOLTAGE} and ${MAX_VOLTAGE} V.` };
  }
  if (batteryAmpHours <= 0 || batteryAmpHours > MAX_AMP_HOURS) {
    return { error: `Battery capacity must be between 0 and ${MAX_AMP_HOURS} Ah.` };
  }
  if (riderWeightKg <= 0 || riderWeightKg > 250) {
    return { error: "Rider weight must be between 1 and 250 kg." };
  }
  if (!isNum(speedKmph) || speedKmph < MIN_SPEED_KMPH || speedKmph > MAX_SPEED_KMPH) {
    return { error: `Riding speed must be between ${MIN_SPEED_KMPH} and ${MAX_SPEED_KMPH} km/h.` };
  }
  const grade = isNum(gradePct) ? gradePct : 0;
  if (Math.abs(grade) > MAX_GRADE_PCT) {
    return { error: `Average gradient must be between -${MAX_GRADE_PCT}% and +${MAX_GRADE_PCT}%.` };
  }
  const temp = isNum(temperatureC) ? temperatureC : 25;
  if (temp < MIN_TEMP_C || temp > MAX_TEMP_C) {
    return { error: `Temperature must be between ${MIN_TEMP_C} and ${MAX_TEMP_C} degrees C.` };
  }
  const surface = TERRAINS[terrain];
  const level = ASSIST_LEVELS[assist];
  const klass = EBIKE_CLASSES[ebikeClass];
  if (!surface || !level || !klass) return { error: "Pick a terrain, assist level and e-bike class." };

  const eff =
    isNum(systemEfficiency) && systemEfficiency > 0.2 && systemEfficiency <= 1
      ? systemEfficiency
      : DEFAULT_SYSTEM_EFFICIENCY;
  const usable =
    isNum(usableFraction) && usableFraction > 0.3 && usableFraction <= 1
      ? usableFraction
      : DEFAULT_USABLE_FRACTION;

  const nominalWh = batteryVolts * batteryAmpHours;
  const tempFactor = temperatureFactor(temp);
  const usableWh = nominalWh * usable * tempFactor;

  const massKg = riderWeightKg + Math.max(0, bikeWeightKg || 0) + Math.max(0, cargoKg || 0);
  const power = totalRoadPower({
    massKg,
    speedKmph,
    gradePct: grade,
    crr: surface.crr,
    cda: surface.cda,
    headwindKmph: isNum(headwindKmph) ? headwindKmph : 0,
  });

  const rangeFor = (ratio) => {
    const split = splitAssist({
      totalW: power.total,
      assistRatio: ratio,
      maxMotorW: klass.maxMotorW,
      speedKmph,
      cutoffKmph: klass.cutoffKmph,
    });
    const whPerKmWheel = split.motorW / speedKmph;
    const whPerKm = whPerKmWheel / eff;
    return {
      ...split,
      whPerKm,
      rangeKm: whPerKm > 0 ? usableWh / whPerKm : null,
    };
  };

  const selected = rangeFor(level.ratio);
  const byLevel = Object.entries(ASSIST_LEVELS).map(([key, entry]) => ({
    key,
    label: entry.label,
    ratio: entry.ratio,
    ...rangeFor(entry.ratio),
  }));

  const riderShortfall =
    isNum(sustainableRiderW) && sustainableRiderW > 0 && selected.riderW > sustainableRiderW
      ? selected.riderW - sustainableRiderW
      : 0;

  return {
    nominalWh,
    usableWh,
    tempFactor,
    massKg,
    power,
    selected,
    byLevel,
    assistLabel: level.label,
    assistRatio: level.ratio,
    className: klass.label,
    maxMotorW: klass.maxMotorW,
    cutoffKmph: klass.cutoffKmph,
    systemEfficiency: eff,
    usableFraction: usable,
    rideHours: selected.rangeKm ? selected.rangeKm / speedKmph : null,
    riderShortfall,
    sustainableRiderW,
    elevationGainM: selected.rangeKm ? selected.rangeKm * 1000 * (grade / 100) : 0,
  };
}
