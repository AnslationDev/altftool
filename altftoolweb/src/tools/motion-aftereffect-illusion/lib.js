/**
 * Motion Aftereffect Illusion — pure stimulus and adaptation model.
 *
 * The motion aftereffect (MAE, the "waterfall illusion", first described by Robert Addams
 * at the Falls of Foyers in 1834) appears when direction-selective neurons in visual areas
 * V1 and MT adapt to sustained motion. When the motion stops, the now-unbalanced population
 * response makes a stationary pattern appear to drift the opposite way.
 *
 * This module holds the stimulus presets, the CSS animation timing derived from a requested
 * drift speed, and a published-parameter estimate of how long the aftereffect should last.
 * No React, no DOM, no clock reads — durations are always passed in.
 */

/** Stimulus patterns. Each states the direction the aftereffect runs in. */
export const MAE_PATTERNS = [
  {
    key: "spiral",
    label: "Rotating spiral",
    adaptDescription: "An inward-turning spiral rotates steadily.",
    aftereffect: "A still face or photo appears to expand outwards.",
    /** Rotation is the natural motion, so the animation is a full 360deg turn. */
    motion: "rotate",
    turns: 9,
  },
  {
    key: "waterfall",
    label: "Waterfall (downward stripes)",
    adaptDescription: "Horizontal stripes slide steadily downwards.",
    aftereffect: "Stationary stripes and nearby text appear to creep upwards.",
    motion: "translate",
    turns: 0,
  },
  {
    key: "radial",
    label: "Expanding rings",
    adaptDescription: "Concentric rings expand out from the centre.",
    aftereffect: "A still pattern appears to shrink towards the centre.",
    motion: "scale",
    turns: 0,
  },
  {
    key: "wheel",
    label: "Rotating wheel",
    adaptDescription: "A spoked wheel turns clockwise.",
    aftereffect: "The stopped wheel appears to rotate anticlockwise.",
    motion: "rotate",
    turns: 18,
  },
];

/**
 * Shortest adaptation that reliably produces a visible aftereffect in normal observers.
 * Below roughly 10 seconds the effect is usually too weak to report.
 */
export const MIN_ADAPTATION_SECONDS = 10;

/** Standard laboratory adaptation period used in most MAE demonstrations. */
export const RECOMMENDED_ADAPTATION_SECONDS = 30;

/**
 * Upper limit offered here. MAE duration grows very slowly beyond about a minute of
 * adaptation, and longer staring is uncomfortable, so 120 seconds is the ceiling.
 */
export const MAX_ADAPTATION_SECONDS = 120;

/**
 * Time constant of the logarithmic growth in the classic adaptation-duration functions
 * (Wohlgemuth 1911; Taylor 1963; Hershenson 1989), expressed in seconds.
 */
export const ADAPTATION_TIME_CONSTANT = 10;

/**
 * Scale factor chosen so that the standard 30-second adaptation at optimal speed and full
 * contrast predicts roughly 8 seconds of aftereffect, the value typically reported for
 * a rotating spiral in the laboratory.
 */
export const AFTEREFFECT_SCALE_SECONDS = 5.77;

/** MAE strength is band-pass in speed, peaking in the 2-8 deg/s range; 4 deg/s is the centre. */
export const OPTIMAL_SPEED_DEG_PER_SEC = 4;

/** Half-width of that speed tuning curve, in octaves (log2 units). */
export const SPEED_TUNING_OCTAVES = 1.6;

/** Speeds this tool will animate, in degrees of visual angle per second. */
export const MIN_SPEED_DEG_PER_SEC = 0.5;
export const MAX_SPEED_DEG_PER_SEC = 32;

/**
 * Contrast half-saturation constant of the Naka-Rushton response function used for
 * motion-sensitive cells: response = c / (c + C50). C50 near 0.15 is typical for V1/MT.
 */
export const CONTRAST_HALF_SATURATION = 0.15;

/** Angular size of one full rotation, used to turn deg/s into a CSS animation duration. */
export const DEGREES_PER_TURN = 360;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/** Looks up a pattern preset by key, falling back to the spiral. */
export function getPattern(key) {
  return MAE_PATTERNS.find((pattern) => pattern.key === key) || MAE_PATTERNS[0];
}

/**
 * Band-pass speed tuning: a Gaussian in log2 speed centred on the optimum.
 * @returns {number} multiplier in (0, 1].
 */
export function speedFactor(speedDegPerSec) {
  if (!isNum(speedDegPerSec) || speedDegPerSec <= 0) return 0;
  const octaves = Math.log2(speedDegPerSec / OPTIMAL_SPEED_DEG_PER_SEC);
  return Math.exp(-0.5 * (octaves / SPEED_TUNING_OCTAVES) ** 2);
}

/**
 * Naka-Rushton contrast response, normalised so full contrast (1.0) returns 1.
 * @param {number} contrast 0 to 1.
 * @returns {number} multiplier in [0, 1].
 */
export function contrastFactor(contrast) {
  if (!isNum(contrast) || contrast <= 0) return 0;
  const c = clamp(contrast, 0, 1);
  const raw = c / (c + CONTRAST_HALF_SATURATION);
  const atFullContrast = 1 / (1 + CONTRAST_HALF_SATURATION);
  return raw / atFullContrast;
}

/**
 * Estimates how long the aftereffect should last after a given adaptation period.
 *
 * duration = SCALE x ln(1 + t / TAU) x speedFactor(v) x contrastFactor(c)
 *
 * The logarithmic term reproduces the classic finding that MAE duration rises steeply over
 * the first half-minute of adaptation and then flattens. The two multipliers apply the
 * known speed band-pass and contrast saturation of motion-sensitive neurons.
 *
 * @param {object} input
 * @param {number} input.adaptationSeconds How long the moving pattern is watched.
 * @param {number} input.speedDegPerSec    Drift speed of the pattern.
 * @param {number} input.contrast          Pattern contrast, 0 to 1.
 * @returns {{seconds:number, speedFactor:number, contrastFactor:number, growthTerm:number, strengthPercent:number}|{error:string}}
 */
export function estimateAftereffect({ adaptationSeconds, speedDegPerSec, contrast } = {}) {
  if (!isNum(adaptationSeconds) || !isNum(speedDegPerSec) || !isNum(contrast)) {
    return { error: "Enter a numeric adaptation time, speed and contrast." };
  }
  if (adaptationSeconds < MIN_ADAPTATION_SECONDS) {
    return {
      error: `Watch the pattern for at least ${MIN_ADAPTATION_SECONDS} seconds — shorter adaptation rarely produces a visible aftereffect.`,
    };
  }
  if (adaptationSeconds > MAX_ADAPTATION_SECONDS) {
    return {
      error: `Adaptation is capped at ${MAX_ADAPTATION_SECONDS} seconds. Longer staring adds very little and tires the eyes.`,
    };
  }
  if (speedDegPerSec < MIN_SPEED_DEG_PER_SEC || speedDegPerSec > MAX_SPEED_DEG_PER_SEC) {
    return {
      error: `Speed must be between ${MIN_SPEED_DEG_PER_SEC} and ${MAX_SPEED_DEG_PER_SEC} degrees per second.`,
    };
  }
  if (contrast <= 0 || contrast > 1) {
    return { error: "Contrast must be greater than 0 and no more than 1." };
  }

  const growthTerm = Math.log(1 + adaptationSeconds / ADAPTATION_TIME_CONSTANT);
  const sFactor = speedFactor(speedDegPerSec);
  const cFactor = contrastFactor(contrast);
  const seconds = AFTEREFFECT_SCALE_SECONDS * growthTerm * sFactor * cFactor;

  const bestPossible =
    AFTEREFFECT_SCALE_SECONDS * Math.log(1 + MAX_ADAPTATION_SECONDS / ADAPTATION_TIME_CONSTANT);

  return {
    seconds,
    growthTerm,
    speedFactor: sFactor,
    contrastFactor: cFactor,
    strengthPercent: bestPossible > 0 ? (seconds / bestPossible) * 100 : 0,
  };
}

/**
 * One stripe-and-gap period of the sliding and expanding patterns, in degrees of visual
 * angle at a normal viewing distance. Used only to convert speed into a cycle time.
 */
export const PATTERN_PERIOD_DEGREES = 20;

/**
 * The animated disc subtends roughly 10 degrees of visual angle at a normal 50 cm viewing
 * distance, so the mid-radius of the pattern sits about 5 degrees from the centre. This is
 * what converts a retinal drift speed into a rotation rate.
 */
export const MEAN_PATTERN_RADIUS_DEG = 5;

/** Radians to degrees. */
export const RAD_TO_DEG = 180 / Math.PI;

/**
 * Turns a retinal drift speed into the CSS animation duration for one cycle of the pattern.
 *
 * Rotating patterns: tangential speed v at mid-radius R gives an angular rate of
 *   omega = (v / R) radians per second = (v / R) x 180/pi degrees per second,
 * so one full turn takes 360 / omega seconds.
 * Sliding and expanding patterns: one cycle is one stripe period, so
 *   cycle seconds = PATTERN_PERIOD_DEGREES / v.
 *
 * @returns {{cycleSeconds:number, cyclesPerMinute:number, rotationDegPerSec:number}}
 */
export function animationTiming(patternKey, speedDegPerSec) {
  const pattern = getPattern(patternKey);
  const speed = isNum(speedDegPerSec)
    ? clamp(speedDegPerSec, MIN_SPEED_DEG_PER_SEC, MAX_SPEED_DEG_PER_SEC)
    : OPTIMAL_SPEED_DEG_PER_SEC;

  const rotationDegPerSec = (speed / MEAN_PATTERN_RADIUS_DEG) * RAD_TO_DEG;
  const cycleSeconds =
    pattern.motion === "rotate"
      ? DEGREES_PER_TURN / rotationDegPerSec
      : PATTERN_PERIOD_DEGREES / speed;

  return {
    cycleSeconds,
    cyclesPerMinute: cycleSeconds > 0 ? 60 / cycleSeconds : 0,
    rotationDegPerSec,
  };
}

/** Formats seconds for display, e.g. "8.2 s" or "1m 04s". */
export function formatSeconds(seconds) {
  if (!isNum(seconds) || seconds < 0) return "—";
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds - minutes * 60);
  return `${minutes}m ${String(rest).padStart(2, "0")}s`;
}

/** Builds the adaptation-duration curve for the chosen speed and contrast. */
export function buildDurationCurve(speedDegPerSec, contrast, steps = [10, 20, 30, 45, 60, 90, 120]) {
  return steps
    .map((adaptationSeconds) => {
      const result = estimateAftereffect({ adaptationSeconds, speedDegPerSec, contrast });
      return result.error ? null : { adaptationSeconds, seconds: result.seconds };
    })
    .filter(Boolean);
}
