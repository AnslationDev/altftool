/**
 * Motion Blur Shutter Angle Calculator — pure calculation module.
 * No React, no DOM, no clock reads.
 *
 * A rotary shutter open for `angle` degrees of a 360-degree revolution exposes
 * the frame for angle/360 of the frame interval:
 *
 *   shutter seconds = angle / (360 x fps)
 *   angle           = 360 x fps x shutter seconds
 *
 * At 180 degrees the frame is exposed for half the interval — the "180-degree
 * rule" that gives motion blur most viewers read as natural.
 */

export const DEGREES_PER_REVOLUTION = 360;

/** The reference angle everything is compared against. */
export const NATURAL_ANGLE = 180;

/** A rotary shutter cannot open past a full revolution. */
export const MAX_ANGLE = 360;

/** Below this the exposure is a sliver and the tool stops being meaningful. */
export const MIN_ANGLE = 1;

export const MAX_FPS = 1000;

/** Mains frequencies. Lighting flickers at these rates, causing banding. */
export const MAINS_FREQUENCIES = [50, 60];

/** Shutter speed denominators engraved on camera dials, in 1/x seconds. */
export const STANDARD_DENOMINATORS = [
  24, 25, 30, 40, 48, 50, 60, 75, 80, 90, 96, 100, 120, 125, 160, 180, 200, 250,
  320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 4000, 8000,
];

export const COMMON_FPS = [23.976, 24, 25, 29.97, 30, 48, 50, 60, 120];

/** Two shutter speeds within this relative distance are treated as the same. */
export const FLICKER_TOLERANCE = 0.005;

const round = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** Plain-language description of what a given shutter angle looks like. */
export function blurCharacter(angle) {
  const a = Number(angle);
  if (!Number.isFinite(a)) return "";
  if (a <= 45) return "Staccato and very sharp — each frame nearly frozen, motion strobes badly on pans.";
  if (a <= 90) return "Crisp and slightly stuttery — used for impact in action sequences.";
  if (a < 170) return "A little sharper than natural; fine detail holds up on movement.";
  if (a <= 190) return "Natural cinematic blur — the 180-degree rule.";
  if (a <= 270) return "Softer and dreamier; movement smears noticeably.";
  return "Maximum blur — the shutter is open almost the whole frame and fast motion smears.";
}

/**
 * Convert a shutter angle to a shutter speed, or the other way round, and
 * report everything that follows from it.
 *
 * @param {object} input
 * @param {"angle"|"speed"} input.mode  which value is being supplied
 * @param {number} input.angle          shutter angle in degrees (mode "angle")
 * @param {number} input.denominator    shutter speed as 1/denominator seconds (mode "speed")
 * @param {number} input.fps            capture frame rate
 * @param {number} input.mainsHz        local mains frequency, 50 or 60
 */
export function computeShutter(input) {
  const { mode = "angle", angle, denominator, fps, mainsHz = 50 } = input || {};

  const rate = Number(fps);
  const mains = Number(mainsHz);

  if (!Number.isFinite(rate)) return { error: "Enter the frame rate as a number." };
  if (rate <= 0) return { error: "Frame rate must be greater than zero." };
  if (rate > MAX_FPS) return { error: `Frame rates above ${MAX_FPS} fps are outside this calculator.` };
  if (!Number.isFinite(mains) || mains <= 0) return { error: "Mains frequency must be greater than zero." };

  let angleDeg;
  let shutterSeconds;

  if (mode === "angle") {
    angleDeg = Number(angle);
    if (!Number.isFinite(angleDeg)) return { error: "Enter the shutter angle as a number." };
    if (angleDeg < MIN_ANGLE) return { error: `Shutter angle must be at least ${MIN_ANGLE} degree.` };
    if (angleDeg > MAX_ANGLE) return { error: `A rotary shutter cannot open past ${MAX_ANGLE} degrees.` };
    shutterSeconds = angleDeg / (DEGREES_PER_REVOLUTION * rate);
  } else if (mode === "speed") {
    const denom = Number(denominator);
    if (!Number.isFinite(denom)) return { error: "Enter the shutter speed denominator as a number." };
    if (denom <= 0) return { error: "Shutter speed denominator must be greater than zero." };
    shutterSeconds = 1 / denom;
    angleDeg = DEGREES_PER_REVOLUTION * rate * shutterSeconds;
    if (angleDeg > MAX_ANGLE) {
      return {
        error: `1/${round(denom, 2)} s is longer than one frame at ${round(rate, 3)} fps — the shutter would need ${round(angleDeg, 1)} degrees.`,
      };
    }
    if (angleDeg < MIN_ANGLE) {
      return { error: `1/${round(denom, 2)} s at ${round(rate, 3)} fps is under ${MIN_ANGLE} degree of shutter angle.` };
    }
  } else {
    return { error: "Choose whether you are entering an angle or a shutter speed." };
  }

  const frameIntervalMs = 1000 / rate;
  const exposureMs = shutterSeconds * 1000;
  const exposureFraction = angleDeg / DEGREES_PER_REVOLUTION;
  const shutterDenominator = 1 / shutterSeconds;

  // Exposure difference against the 180-degree reference, in photographic stops.
  const stopsFromNatural = Math.log2(angleDeg / NATURAL_ANGLE);

  // Nearest denominator actually available on a camera dial.
  let nearest = STANDARD_DENOMINATORS[0];
  STANDARD_DENOMINATORS.forEach((value) => {
    if (Math.abs(Math.log2(value / shutterDenominator)) < Math.abs(Math.log2(nearest / shutterDenominator))) {
      nearest = value;
    }
  });
  const nearestAngle = DEGREES_PER_REVOLUTION * rate * (1 / nearest);

  // Angles whose exposure is a whole number of mains cycles cause no banding.
  const flickerSafe = [];
  for (let cycles = 1; cycles <= 12; cycles += 1) {
    const safeSeconds = cycles / mains;
    const safeAngle = DEGREES_PER_REVOLUTION * rate * safeSeconds;
    if (safeAngle >= MIN_ANGLE && safeAngle <= MAX_ANGLE) {
      flickerSafe.push({
        cycles,
        angle: safeAngle,
        denominator: mains / cycles,
      });
    }
  }
  flickerSafe.sort((a, b) => b.angle - a.angle);

  const mainsCycles = shutterSeconds * mains;
  const isFlickerSafe =
    Math.abs(mainsCycles - Math.round(mainsCycles)) / Math.max(1, Math.round(mainsCycles)) < FLICKER_TOLERANCE &&
    Math.round(mainsCycles) >= 1;

  const warnings = [];
  if (!isFlickerSafe) {
    const closest = flickerSafe.reduce(
      (best, option) =>
        best === null || Math.abs(option.angle - angleDeg) < Math.abs(best.angle - angleDeg) ? option : best,
      null,
    );
    if (closest) {
      warnings.push(
        `Under ${mains} Hz mains this exposure is ${round(mainsCycles, 3)} lighting cycles, so LED and fluorescent sources can band. ${round(closest.angle, 1)}° (1/${round(closest.denominator, 2)} s) is a whole number of cycles.`,
      );
    }
  }
  if (angleDeg <= 90) {
    warnings.push("Below about 90° a pan will strobe — keep camera movement slow or the motion reads as stepped.");
  }
  if (angleDeg >= 350) {
    warnings.push("Near 360° there is almost no dark period between frames, so fast motion smears and edges soften.");
  }

  return {
    mode,
    fps: rate,
    mainsHz: mains,
    angleDeg,
    shutterSeconds,
    shutterDenominator,
    shutterLabel: `1/${round(shutterDenominator, 2)} s`,
    frameIntervalMs,
    exposureMs,
    exposureFraction,
    exposurePct: exposureFraction * 100,
    stopsFromNatural,
    naturalAngle: NATURAL_ANGLE,
    naturalDenominator: DEGREES_PER_REVOLUTION * rate / NATURAL_ANGLE,
    nearestStandardDenominator: nearest,
    nearestStandardAngle: nearestAngle,
    nearestStandardStops: Math.log2(nearestAngle / angleDeg),
    mainsCycles,
    isFlickerSafe,
    flickerSafe,
    character: blurCharacter(angleDeg),
    warnings,
  };
}

/**
 * Shutter angle needed to keep the same exposure time when the frame rate
 * changes — used when ramping into or out of a slow-motion shot.
 */
export function angleForSameExposure(currentAngle, currentFps, targetFps) {
  const a = Number(currentAngle);
  const from = Number(currentFps);
  const to = Number(targetFps);
  if (![a, from, to].every(Number.isFinite)) return null;
  if (a <= 0 || from <= 0 || to <= 0) return null;
  const angle = a * (to / from);
  if (angle > MAX_ANGLE) return { angle: null, impossible: true, needed: angle };
  return { angle, impossible: false, needed: angle };
}
