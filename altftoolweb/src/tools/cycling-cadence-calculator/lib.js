/**
 * Cycling cadence, gearing and speed.
 *
 * Everything here follows from one identity: one turn of the cranks moves the
 * bike forward by (chainring / cog) x wheel circumference. That distance is
 * called development or rollout, and speed is simply development x cadence.
 *
 *   development (m)  = (chainring / cog) * circumference (m)
 *   speed (km/h)     = cadence (rpm) * development (m) * 60 / 1000
 *   gear inches      = (chainring / cog) * wheel diameter (inches)
 *   gain ratio       = (wheel radius / crank length) * (chainring / cog)
 *
 * Gain ratio is Sheldon Brown's dimensionless measure: it accounts for crank
 * length, which gear inches ignores, so two bikes with the same gear inches but
 * different cranks are correctly reported as geared differently.
 */

export const MM_PER_INCH = 25.4;

/**
 * Measured wheel circumference in millimetres for common tyre sizes, from the
 * rollout tables published with cycle computers. Measure your own by marking
 * the tyre and rolling one full turn under your weight for the exact figure.
 */
export const WHEEL_SIZES = {
  "700x20c": 2086,
  "700x23c": 2096,
  "700x25c": 2105,
  "700x28c": 2136,
  "700x30c": 2146,
  "700x32c": 2155,
  "700x35c": 2168,
  "700x38c": 2180,
  "700x40c": 2200,
  "650b / 27.5x1.5": 2079,
  "27.5x2.1": 2148,
  "27.5x2.25": 2182,
  "26x1.5": 1985,
  "26x1.75": 2023,
  "26x1.95": 2050,
  "26x2.1": 2068,
  "29x2.1": 2288,
  "29x2.25": 2326,
  "20x1.75 (folding)": 1515,
};

/**
 * Descriptive cadence bands. Trained road cyclists self-select 80-100 rpm on
 * the flat; below 60 rpm the same power needs far higher pedal force, which
 * loads the knees.
 */
export const CADENCE_BANDS = [
  { max: 60, label: "Grinding", note: "High pedal force, hard on the knees" },
  { max: 75, label: "Low cadence", note: "Strength-endurance range, common on climbs" },
  { max: 95, label: "Endurance cadence", note: "Where most riders are most efficient" },
  { max: 110, label: "Fast cadence", note: "Racing and criterium range" },
  { max: Infinity, label: "Spinning", note: "Sprint or downhill spin-out territory" },
];

/** Cadences shown in the sweep table. */
export const CADENCE_SWEEP = [60, 70, 80, 90, 100, 110, 120];

const MIN_TEETH = 8;
const MAX_CHAINRING = 80;
const MAX_COG = 60;
const MIN_CIRCUMFERENCE_MM = 800;
const MAX_CIRCUMFERENCE_MM = 3000;
const MAX_CADENCE = 250;
const MIN_CRANK_MM = 100;
const MAX_CRANK_MM = 220;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Descriptive band for a cadence in rpm. */
export function cadenceBand(cadenceRpm) {
  const band = CADENCE_BANDS.find((entry) => cadenceRpm < entry.max);
  return band ?? CADENCE_BANDS[CADENCE_BANDS.length - 1];
}

/** Speed in km/h from cadence and development in metres. */
export function speedFromCadence(cadenceRpm, developmentM) {
  if (!isNum(cadenceRpm) || !isNum(developmentM)) return null;
  return (cadenceRpm * developmentM * 60) / 1000;
}

/** Cadence in rpm needed to hold a speed in km/h in a given gear. */
export function cadenceForSpeed(speedKmph, developmentM) {
  if (!isNum(speedKmph) || !(developmentM > 0)) return null;
  return (speedKmph * 1000) / 60 / developmentM;
}

export function computeGearing({
  chainringTeeth,
  cogTeeth,
  circumferenceMm,
  cadenceRpm = 90,
  crankLengthMm = 172.5,
  targetSpeedKmph,
} = {}) {
  if (!isNum(chainringTeeth) || !isNum(cogTeeth) || !isNum(circumferenceMm)) {
    return { error: "Enter chainring teeth, cog teeth and wheel circumference as numbers." };
  }
  if (chainringTeeth < MIN_TEETH || chainringTeeth > MAX_CHAINRING) {
    return { error: `Chainring must be between ${MIN_TEETH} and ${MAX_CHAINRING} teeth.` };
  }
  if (cogTeeth < MIN_TEETH || cogTeeth > MAX_COG) {
    return { error: `Rear cog must be between ${MIN_TEETH} and ${MAX_COG} teeth.` };
  }
  if (circumferenceMm < MIN_CIRCUMFERENCE_MM || circumferenceMm > MAX_CIRCUMFERENCE_MM) {
    return {
      error: `Wheel circumference must be between ${MIN_CIRCUMFERENCE_MM} and ${MAX_CIRCUMFERENCE_MM} mm.`,
    };
  }
  if (!isNum(cadenceRpm) || cadenceRpm < 0 || cadenceRpm > MAX_CADENCE) {
    return { error: `Cadence must be between 0 and ${MAX_CADENCE} rpm.` };
  }
  if (!isNum(crankLengthMm) || crankLengthMm < MIN_CRANK_MM || crankLengthMm > MAX_CRANK_MM) {
    return { error: `Crank length must be between ${MIN_CRANK_MM} and ${MAX_CRANK_MM} mm.` };
  }

  const ratio = chainringTeeth / cogTeeth;
  const circumferenceM = circumferenceMm / 1000;
  const developmentM = ratio * circumferenceM;
  const wheelDiameterMm = circumferenceMm / Math.PI;
  const wheelDiameterIn = wheelDiameterMm / MM_PER_INCH;
  const gearInches = ratio * wheelDiameterIn;
  const gainRatio = (wheelDiameterMm / 2 / crankLengthMm) * ratio;

  const speedKmph = speedFromCadence(cadenceRpm, developmentM);

  const sweep = CADENCE_SWEEP.map((rpm) => ({
    rpm,
    speedKmph: speedFromCadence(rpm, developmentM),
  }));

  const requiredCadence =
    isNum(targetSpeedKmph) && targetSpeedKmph > 0
      ? cadenceForSpeed(targetSpeedKmph, developmentM)
      : null;

  return {
    ratio,
    developmentM,
    gearInches,
    gainRatio,
    wheelDiameterMm,
    wheelDiameterIn,
    circumferenceMm,
    cadenceRpm,
    speedKmph,
    speedMs: (speedKmph * 1000) / 3600,
    band: cadenceBand(cadenceRpm),
    sweep,
    targetSpeedKmph: isNum(targetSpeedKmph) ? targetSpeedKmph : null,
    requiredCadence,
    requiredCadenceRealistic:
      requiredCadence === null ? null : requiredCadence > 0 && requiredCadence <= 130,
  };
}
