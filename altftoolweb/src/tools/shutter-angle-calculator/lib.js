/**
 * Shutter angle <-> shutter speed conversion.
 *
 * A rotary shutter is a disc with an opening of `angle` degrees spinning once
 * per frame. The sensor or film is exposed for the fraction of the rotation the
 * opening covers, so:
 *
 *   exposure time (seconds) = angle / (360 x frame rate)
 *   shutter speed denominator = 360 / angle x frame rate
 *
 * The 180-degree rule — exposing for half of each frame interval — is the
 * convention for natural motion blur, and gives 1/48 s at 24 fps.
 */

/** A full rotation of the shutter disc. */
export const DEGREES_PER_ROTATION = 360;

/** The convention for natural-looking motion blur. */
export const NATURAL_MOTION_ANGLE = 180;

/** Largest angle a conventional rotary shutter can open to. */
export const MAX_ANGLE = 360;

export const MAX_FPS = 1000;

/** Angles marked on real cameras (ARRI, RED and Sony all expose this set). */
export const COMMON_ANGLES = [
  { angle: 11.25, note: "Extreme staccato, 4 stops under 180" },
  { angle: 22.5, note: "Very crisp action, 3 stops under 180" },
  { angle: 45, note: "Crisp, 2 stops under 180" },
  { angle: 90, note: "Sharp action, 1 stop under 180" },
  { angle: 144, note: "Slightly crisper than natural" },
  { angle: 172.8, note: "Gives exactly 1/50 s at 24 fps — the flicker-free 24p angle" },
  { angle: 180, note: "The standard: half the frame interval" },
  { angle: 270, note: "Dreamy extra blur, 0.58 stops over 180" },
  { angle: 360, note: "Maximum: exposed for the whole frame interval" },
];

/** Frame rates in normal use, including the 1000/1001 pulldown rates. */
export const COMMON_FPS = [23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60, 100, 120];

/** Mains frequency by region. Discharge lamps pulse at twice this figure. */
export const MAINS_OPTIONS = [
  { id: "50", name: "50 Hz (Europe, India, Australia, most of Asia and Africa)", hz: 50 },
  { id: "60", name: "60 Hz (North America, Japan east, parts of South America)", hz: 60 },
];

/** How close to a whole flicker cycle counts as safe, in cycles. */
const FLICKER_TOLERANCE_CYCLES = 0.01;

/**
 * Is this exposure time free of banding under mains-powered discharge lighting?
 * A gas-discharge or non-DC LED lamp on an AC supply peaks twice per mains
 * cycle, so the light pulses at 2 x mains frequency. Exposures that span a
 * whole number of those pulses collect equal light on every frame.
 */
export function isFlickerSafe(exposureSeconds, mainsHz) {
  const seconds = Number(exposureSeconds);
  const hz = Number(mainsHz);
  if (!Number.isFinite(seconds) || !Number.isFinite(hz) || seconds <= 0 || hz <= 0) {
    return false;
  }
  const cycles = seconds * hz * 2;
  if (cycles < 1 - FLICKER_TOLERANCE_CYCLES) return false;
  const distance = Math.abs(cycles - Math.round(cycles));
  return distance <= FLICKER_TOLERANCE_CYCLES;
}

/** Nearest flicker-free exposure time at or below the requested one. */
export function nearestFlickerSafeExposure(exposureSeconds, mainsHz) {
  const seconds = Number(exposureSeconds);
  const hz = Number(mainsHz);
  if (!Number.isFinite(seconds) || !Number.isFinite(hz) || seconds <= 0 || hz <= 0) return null;
  const pulse = 1 / (hz * 2);
  const cycles = Math.max(1, Math.round(seconds / pulse));
  return cycles * pulse;
}

/**
 * Shutter angle -> exposure time.
 *
 * @param {number} angle degrees of shutter opening
 * @param {number} fps   frames per second
 * @param {number} mainsHz mains frequency for the flicker check
 */
export function angleToShutter({ angle, fps, mainsHz = 50 } = {}) {
  const deg = Number(angle);
  const rate = Number(fps);
  const hz = Number(mainsHz);

  if (![deg, rate, hz].every((value) => Number.isFinite(value))) {
    return { error: "Enter a number for angle, frame rate and mains frequency." };
  }
  if (rate <= 0 || rate > MAX_FPS) {
    return { error: `Frame rate must be between 0 and ${MAX_FPS} fps.` };
  }
  if (deg <= 0 || deg > MAX_ANGLE) {
    return { error: `Shutter angle must be between 0 and ${MAX_ANGLE} degrees.` };
  }
  if (hz <= 0) return { error: "Mains frequency must be greater than zero." };

  const exposureSeconds = deg / (DEGREES_PER_ROTATION * rate);
  const denominator = (DEGREES_PER_ROTATION / deg) * rate;
  const safe = isFlickerSafe(exposureSeconds, hz);
  const safeExposure = nearestFlickerSafeExposure(exposureSeconds, hz);

  return {
    angle: deg,
    fps: rate,
    exposureSeconds,
    exposureMs: exposureSeconds * 1000,
    denominator,
    frameIntervalMs: 1000 / rate,
    /** Stops of exposure relative to the 180-degree reference. */
    stopsFromNatural: Math.log2(deg / NATURAL_MOTION_ANGLE),
    flickerSafe: safe,
    suggestedExposureSeconds: safe ? exposureSeconds : safeExposure,
    suggestedAngle:
      safe || !safeExposure ? deg : safeExposure * DEGREES_PER_ROTATION * rate,
    mainsHz: hz,
  };
}

/**
 * Exposure time -> shutter angle.
 *
 * @param {number} denominator shutter speed denominator, e.g. 48 for 1/48 s
 * @param {number} fps         frames per second
 */
export function shutterToAngle({ denominator, fps, mainsHz = 50 } = {}) {
  const denom = Number(denominator);
  const rate = Number(fps);

  if (![denom, rate].every((value) => Number.isFinite(value))) {
    return { error: "Enter a number for shutter speed and frame rate." };
  }
  if (rate <= 0 || rate > MAX_FPS) {
    return { error: `Frame rate must be between 0 and ${MAX_FPS} fps.` };
  }
  if (denom <= 0) return { error: "Shutter speed denominator must be greater than zero." };
  if (denom < rate) {
    return {
      error: `A shutter speed of 1/${denom} s is longer than one frame at ${rate} fps, so no shutter angle can reach it.`,
    };
  }

  const angle = (DEGREES_PER_ROTATION * rate) / denom;
  return angleToShutter({ angle, fps: rate, mainsHz });
}

/** The common-angle table evaluated at one frame rate. */
export function angleTable({ fps, mainsHz = 50 } = {}) {
  return COMMON_ANGLES.map((entry) => {
    const result = angleToShutter({ angle: entry.angle, fps, mainsHz });
    return {
      angle: entry.angle,
      note: entry.note,
      denominator: result.error ? null : result.denominator,
      exposureMs: result.error ? null : result.exposureMs,
      flickerSafe: result.error ? false : result.flickerSafe,
      error: result.error || null,
    };
  });
}

/** Format an exposure time as a photographic fraction. Never returns NaN. */
export function formatShutterSpeed(denominator) {
  const denom = Number(denominator);
  if (!Number.isFinite(denom) || denom <= 0) return "—";
  if (denom < 1) return `${(1 / denom).toFixed(2)} s`;
  if (denom < 10) return `1/${denom.toFixed(1)} s`;
  return `1/${Math.round(denom)} s`;
}
