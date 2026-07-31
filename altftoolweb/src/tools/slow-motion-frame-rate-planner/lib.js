/**
 * Slow-motion capture planning.
 *
 * Slow motion is purely a ratio of frame rates. Shoot at a higher rate than the
 * timeline plays back at and the action stretches by exactly that ratio:
 *
 *     slowFactor   = captureFps / projectFps
 *     speedPercent = 100 / slowFactor          (what you type into an NLE)
 *     screenTime   = realTime * slowFactor
 *
 * Two physical consequences follow, and both bite on set:
 *
 * 1. Shutter. The 180-degree rule sets exposure time to half the frame interval:
 *    shutterSeconds = shutterAngle / (360 * captureFps). At 240 fps that is
 *    1/480 s, which is 3.32 stops darker than the 1/48 s of 24 fps at 180 degrees.
 *
 * 2. Flicker. Mains-powered lighting pulses at twice the supply frequency — 100 Hz
 *    on a 50 Hz supply, 120 Hz on 60 Hz. Exposure stays even either when the frame
 *    interval spans a whole number of those pulses, or when the shutter is open for
 *    a whole number of them. High capture rates usually satisfy neither, which is
 *    why high-speed work needs flicker-free DC or high-frequency ballast lighting.
 */

export const DEGREES_PER_ROTATION = 360;
/** 24 fps at a 180-degree shutter, the reference exposure the film world is built on. */
export const REFERENCE_SHUTTER_SECONDS = 1 / 48;
export const STANDARD_SHUTTER_ANGLE = 180;

export const MIN_FPS = 1;
export const MAX_FPS = 1_000_000;
export const MIN_SHUTTER_ANGLE = 1;
export const MAX_SHUTTER_ANGLE = 360;
export const MAX_DURATION_SECONDS = 86_400;

/** Timeline / playback frame rates a project is normally finished at. */
export const PROJECT_FPS_OPTIONS = Object.freeze([
  { id: "23.976", label: "23.976 fps", fps: 24000 / 1001 },
  { id: "24", label: "24 fps", fps: 24 },
  { id: "25", label: "25 fps", fps: 25 },
  { id: "29.97", label: "29.97 fps", fps: 30000 / 1001 },
  { id: "30", label: "30 fps", fps: 30 },
  { id: "50", label: "50 fps", fps: 50 },
  { id: "59.94", label: "59.94 fps", fps: 60000 / 1001 },
  { id: "60", label: "60 fps", fps: 60 },
]);

/** Capture rates cameras actually offer. */
export const COMMON_CAPTURE_RATES = Object.freeze([
  24, 25, 30, 48, 50, 60, 90, 96, 100, 120, 150, 180, 200, 240, 300, 400, 480, 500, 960, 1000,
]);

/** Mains supply frequency; lighting pulses at twice this. */
export const MAINS_OPTIONS = Object.freeze([
  { id: "50", label: "50 Hz (India, Europe, Australia)", hz: 50 },
  { id: "60", label: "60 Hz (North America, Japan east)", hz: 60 },
  { id: "none", label: "Flicker-free / daylight only", hz: 0 },
]);

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const nearlyInteger = (value, tolerance = 1e-6) =>
  Math.abs(value - Math.round(value)) < tolerance && Math.round(value) >= 1;

/** Format a shutter duration the way a camera menu shows it, e.g. "1/480 s". */
export function formatShutter(shutterSeconds) {
  if (!isFiniteNumber(shutterSeconds) || shutterSeconds <= 0) return "—";
  if (shutterSeconds >= 1) return `${shutterSeconds.toFixed(2)} s`;
  return `1/${Math.round(1 / shutterSeconds)} s`;
}

/**
 * Flicker assessment for a capture rate and shutter under mains lighting.
 * Even exposure needs either the frame interval or the open shutter to span a
 * whole number of light pulses.
 */
export function assessFlicker({ captureFps, shutterSeconds, mainsHz } = {}) {
  if (!isFiniteNumber(mainsHz) || mainsHz <= 0) {
    return {
      applicable: false,
      safe: true,
      flickerHz: 0,
      advice: "No mains lighting in shot, so there is nothing to synchronise to.",
    };
  }
  const flickerHz = mainsHz * 2;
  const pulsesPerFrame = flickerHz / captureFps;
  const pulsesPerShutter = shutterSeconds * flickerHz;
  const frameSynced = nearlyInteger(pulsesPerFrame);
  const shutterSynced = nearlyInteger(pulsesPerShutter);
  const safe = frameSynced || shutterSynced;

  let advice;
  if (frameSynced) {
    advice = `Each frame spans exactly ${Math.round(pulsesPerFrame)} light pulse${Math.round(pulsesPerFrame) === 1 ? "" : "s"}, so every frame receives identical light.`;
  } else if (shutterSynced) {
    advice = `The shutter is open for exactly ${Math.round(pulsesPerShutter)} light pulse${Math.round(pulsesPerShutter) === 1 ? "" : "s"}, which evens out the exposure.`;
  } else if (captureFps > flickerHz) {
    advice = `At ${captureFps} fps the camera is sampling faster than the ${flickerHz} Hz light pulse, so banding or brightness pulsing is unavoidable on mains lighting. Use flicker-free DC or high-frequency ballast fixtures, HMI on a flicker-free ballast, or daylight.`;
  } else {
    const safeRates = COMMON_CAPTURE_RATES.filter((rate) => nearlyInteger(flickerHz / rate));
    advice = `Neither the frame interval nor the shutter lines up with the ${flickerHz} Hz pulse. Nearby flicker-safe capture rates are ${safeRates.join(", ")} fps, or set the shutter to ${formatShutter(1 / flickerHz)}.`;
  }

  return { applicable: true, safe, flickerHz, pulsesPerFrame, pulsesPerShutter, frameSynced, shutterSynced, advice };
}

/**
 * Full slow-motion plan.
 *
 * @param {object} input
 * @param {number} input.projectFps       timeline / playback frame rate
 * @param {number} input.captureFps       camera frame rate
 * @param {number} [input.shutterAngle]   degrees, 180 by default
 * @param {number} [input.mainsHz]        0 for flicker-free lighting
 * @param {number} [input.realDurationSeconds] how long the camera actually rolls
 * @returns {object} plan, or { error }
 */
export function planSlowMotion({
  projectFps,
  captureFps,
  shutterAngle = STANDARD_SHUTTER_ANGLE,
  mainsHz = 50,
  realDurationSeconds = 0,
} = {}) {
  if (!isFiniteNumber(projectFps) || projectFps < MIN_FPS || projectFps > MAX_FPS) {
    return { error: "Enter a timeline frame rate greater than zero." };
  }
  if (!isFiniteNumber(captureFps) || captureFps < MIN_FPS || captureFps > MAX_FPS) {
    return { error: `Capture frame rate must be between ${MIN_FPS} and ${MAX_FPS} fps.` };
  }
  if (
    !isFiniteNumber(shutterAngle) ||
    shutterAngle < MIN_SHUTTER_ANGLE ||
    shutterAngle > MAX_SHUTTER_ANGLE
  ) {
    return { error: `Shutter angle must be between ${MIN_SHUTTER_ANGLE} and ${MAX_SHUTTER_ANGLE} degrees.` };
  }
  if (!isFiniteNumber(realDurationSeconds) || realDurationSeconds < 0) {
    return { error: "Recording time cannot be negative." };
  }
  if (realDurationSeconds > MAX_DURATION_SECONDS) {
    return { error: "Recording time must be under 24 hours." };
  }

  const slowFactor = captureFps / projectFps;
  const speedPercent = 100 / slowFactor;
  const shutterSeconds = shutterAngle / (DEGREES_PER_ROTATION * captureFps);
  const stopsLost = Math.log2(REFERENCE_SHUTTER_SECONDS / shutterSeconds);
  const screenDurationSeconds = realDurationSeconds * slowFactor;
  const framesRecorded = realDurationSeconds * captureFps;

  return {
    projectFps,
    captureFps,
    shutterAngle,
    slowFactor,
    speedPercent,
    isSlowMotion: slowFactor > 1,
    isSpeedUp: slowFactor < 1,
    shutterSeconds,
    shutterLabel: formatShutter(shutterSeconds),
    /** Longest exposure physically possible at this rate (a 360-degree shutter). */
    maxShutterSeconds: 1 / captureFps,
    stopsLost,
    screenDurationSeconds,
    realDurationSeconds,
    framesRecorded,
    /** Real seconds of action that fit in one second of finished screen time. */
    realSecondsPerScreenSecond: 1 / slowFactor,
    flicker: assessFlicker({ captureFps, shutterSeconds, mainsHz }),
  };
}
