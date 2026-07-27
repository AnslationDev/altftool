/**
 * Saddle height and setback from cycling inseam.
 *
 * Two independent published methods are computed and cross-checked:
 *   LeMond   saddle top is 0.883 x inseam above the bottom-bracket centre,
 *            measured along the seat tube.
 *   Hamley   Hamley and Thomas (1967) found peak efficiency with saddle top at
 *            109% of inseam measured from the pedal spindle at its lowest
 *            point, which converts to 1.09 x inseam - crank length above the
 *            bottom bracket.
 * They normally land within a few millimetres of each other, which is why both
 * survived. Setback ranges come from standard fit practice for each riding
 * position and are checked on the bike with a plumb line (the KOPS method).
 */

/** LeMond multiplier: bottom-bracket centre to saddle top. */
export const LEMOND_FACTOR = 0.883;

/** Hamley and Thomas (1967): 109% of inseam from pedal spindle to saddle top. */
export const HAMLEY_FACTOR = 1.09;

/**
 * Practical working window that fitters use around the LeMond figure. Below
 * 0.875 the hip drops too little and the quadriceps overload; above 0.892 the
 * hips start rocking and the hamstrings and Achilles are overstretched.
 */
export const WORKING_RANGE = [0.875, 0.892];

/**
 * Holmes knee-angle method: with the pedal at bottom dead centre the knee
 * should show 25-35 degrees of flexion, measured with a goniometer.
 */
export const KNEE_FLEXION_RANGE_DEG = [25, 35];

/** Crank length is conventionally 20-21% of cycling inseam. */
export const CRANK_INSEAM_RANGE = [0.2, 0.21];

/** Crank lengths actually sold, in millimetres. */
export const STANDARD_CRANKS_MM = [160, 165, 167.5, 170, 172.5, 175, 177.5, 180];

/**
 * Horizontal distance from a vertical line through the bottom bracket back to
 * the saddle nose, in centimetres, by riding position. Time-trial positions run
 * the saddle forward, sometimes ahead of the bottom bracket, hence the negative
 * lower bound.
 */
export const SETBACK_RANGES_CM = {
  roadEndurance: { label: "Road, endurance position", range: [5, 9] },
  roadRace: { label: "Road, race position", range: [4, 7] },
  tt: { label: "Time trial or triathlon", range: [-3, 3] },
  mtb: { label: "Mountain bike", range: [3, 7] },
  city: { label: "Upright city or hybrid", range: [6, 10] },
};

/** Safe increment when moving a saddle: change, ride, then reassess. */
export const ADJUSTMENT_STEP_MM = 3;

const MIN_INSEAM_CM = 50;
const MAX_INSEAM_CM = 110;
const MIN_CRANK_MM = 100;
const MAX_CRANK_MM = 220;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Closest commercially available crank length to a target in millimetres. */
export function nearestStandardCrank(targetMm) {
  if (!isNum(targetMm)) return null;
  return STANDARD_CRANKS_MM.reduce((best, size) =>
    Math.abs(size - targetMm) < Math.abs(best - targetMm) ? size : best,
  );
}

export function computeSaddleHeight({
  inseamCm,
  crankLengthMm = 172.5,
  style = "roadEndurance",
  currentSaddleHeightMm,
} = {}) {
  if (!isNum(inseamCm)) return { error: "Enter your cycling inseam in centimetres." };
  if (inseamCm < MIN_INSEAM_CM || inseamCm > MAX_INSEAM_CM) {
    return { error: `Inseam must be between ${MIN_INSEAM_CM} and ${MAX_INSEAM_CM} cm.` };
  }
  if (!isNum(crankLengthMm) || crankLengthMm < MIN_CRANK_MM || crankLengthMm > MAX_CRANK_MM) {
    return { error: `Crank length must be between ${MIN_CRANK_MM} and ${MAX_CRANK_MM} mm.` };
  }
  const setback = SETBACK_RANGES_CM[style];
  if (!setback) return { error: "Pick a riding position." };

  const inseamMm = inseamCm * 10;
  const lemondMm = inseamMm * LEMOND_FACTOR;
  const hamleyMm = inseamMm * HAMLEY_FACTOR - crankLengthMm;
  const rangeMm = [inseamMm * WORKING_RANGE[0], inseamMm * WORKING_RANGE[1]];
  const recommendedMm = (lemondMm + hamleyMm) / 2;

  const crankTargetMm = [inseamMm * CRANK_INSEAM_RANGE[0], inseamMm * CRANK_INSEAM_RANGE[1]];
  const crankMidMm = (crankTargetMm[0] + crankTargetMm[1]) / 2;

  let currentCheck = null;
  if (isNum(currentSaddleHeightMm) && currentSaddleHeightMm > 0) {
    const deltaMm = recommendedMm - currentSaddleHeightMm;
    const inRange = currentSaddleHeightMm >= rangeMm[0] && currentSaddleHeightMm <= rangeMm[1];
    // Anything under a millimetre is below what a seatpost clamp can be set to.
    const settled = Math.abs(deltaMm) < 1;
    currentCheck = {
      currentMm: currentSaddleHeightMm,
      deltaMm,
      inRange,
      direction: settled ? "keep" : deltaMm > 0 ? "raise" : "lower",
      steps: settled ? 0 : Math.ceil(Math.abs(deltaMm) / ADJUSTMENT_STEP_MM),
    };
  }

  return {
    inseamCm,
    crankLengthMm,
    styleLabel: setback.label,
    lemondMm,
    hamleyMm,
    recommendedMm,
    rangeMm,
    methodSpreadMm: Math.abs(lemondMm - hamleyMm),
    toPedalAtBdcMm: recommendedMm - crankLengthMm,
    crankTargetMm,
    crankSuggestionMm: nearestStandardCrank(crankMidMm),
    setbackRangeCm: setback.range,
    kneeFlexionRangeDeg: KNEE_FLEXION_RANGE_DEG,
    currentCheck,
  };
}
