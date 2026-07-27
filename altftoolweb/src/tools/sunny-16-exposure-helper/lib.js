/**
 * Sunny 16 / exposure value maths.
 *
 * The exposure value of a setting is defined (APEX, ISO 2721) as
 *
 *   EV = log2(N^2 / t)
 *
 * where N is the f-number and t the shutter time in seconds. EV numbers are
 * quoted at ISO 100, so at any other sensitivity
 *
 *   EV_at_ISO = EV100 + log2(ISO / 100)
 *
 * Rearranging gives the two things a photographer actually wants:
 *
 *   t = N^2 / 2^EV          (shutter for a chosen aperture)
 *   N = sqrt(t * 2^EV)      (aperture for a chosen shutter)
 *
 * The Sunny 16 rule is the special case EV100 = 15: in direct sun, f/16 with
 * a shutter of about 1/ISO second is a correct exposure. Each named lighting
 * condition below is simply one stop down from the one above it.
 *
 * Pure module: no React, no DOM, no clock.
 */

/** EV numbers are always referenced to ISO 100. */
export const REFERENCE_ISO = 100;

/** Sunny 16 sits at EV 15 for ISO 100. */
export const SUNNY_16_EV100 = 15;

export const MIN_EV100 = -6;
export const MAX_EV100 = 20;
export const MIN_ISO = 6;
export const MAX_ISO = 409600;

/**
 * The classic Sunny 16 ladder. Each step down is one stop less light, which is
 * why the suggested aperture opens one full stop per row while the shutter
 * stays at roughly 1/ISO.
 */
export const LIGHTING_CONDITIONS = [
  {
    id: "snow",
    label: "Snow or bright sand",
    ev100: 16,
    aperture: 22,
    hint: "Glaring light bouncing off a white surface.",
  },
  {
    id: "sunny",
    label: "Bright sun — hard-edged shadows",
    ev100: 15,
    aperture: 16,
    hint: "The Sunny 16 baseline: shadows are sharp and dark.",
  },
  {
    id: "slight",
    label: "Slight overcast — soft-edged shadows",
    ev100: 14,
    aperture: 11,
    hint: "Thin cloud or haze; shadows have blurred edges.",
  },
  {
    id: "overcast",
    label: "Overcast — barely visible shadows",
    ev100: 13,
    aperture: 8,
    hint: "Even white sky; you can only just find a shadow.",
  },
  {
    id: "heavy",
    label: "Heavy overcast — no shadows",
    ev100: 12,
    aperture: 5.6,
    hint: "Flat grey sky, completely shadowless light.",
  },
  {
    id: "shade",
    label: "Open shade or sunset",
    ev100: 11,
    aperture: 4,
    hint: "Subject in shade under an open sky, or the sun on the horizon.",
  },
];

/** Full-stop f-numbers (the classic aperture scale, each a factor of sqrt(2)). */
export const STANDARD_APERTURES = [1, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32];

/** Full-stop shutter speeds in seconds. */
export const STANDARD_SHUTTERS = [
  1 / 8000,
  1 / 4000,
  1 / 2000,
  1 / 1000,
  1 / 500,
  1 / 250,
  1 / 125,
  1 / 60,
  1 / 30,
  1 / 15,
  1 / 8,
  1 / 4,
  1 / 2,
  1,
  2,
  4,
  8,
  15,
  30,
];

/** Common ISO settings on digital and film bodies. */
export const ISO_PRESETS = [50, 100, 200, 400, 800, 1600, 3200, 6400];

const isFiniteNumber = (value) => Number.isFinite(value);

/** Shift an ISO 100 exposure value to the sensitivity actually in use. */
export function evAtIso(ev100, iso) {
  return ev100 + Math.log2(iso / REFERENCE_ISO);
}

/** Shutter time in seconds for an exposure value and f-number. */
export function shutterForAperture(ev, fNumber) {
  return (fNumber * fNumber) / Math.pow(2, ev);
}

/** f-number for an exposure value and shutter time. */
export function apertureForShutter(ev, seconds) {
  return Math.sqrt(seconds * Math.pow(2, ev));
}

/** Closest value in a list on a logarithmic (stop) scale. */
function nearestByStops(list, target) {
  let best = list[0];
  let bestDiff = Infinity;
  for (const candidate of list) {
    const diff = Math.abs(Math.log2(candidate) - Math.log2(target));
    if (diff < bestDiff) {
      bestDiff = diff;
      best = candidate;
    }
  }
  return { value: best, stopsOff: Math.log2(target) - Math.log2(best) };
}

export function nearestAperture(fNumber) {
  return nearestByStops(STANDARD_APERTURES, fNumber);
}

/** Shutter is halved per stop, so the stop offset is doubled relative to f-numbers. */
export function nearestShutter(seconds) {
  return nearestByStops(STANDARD_SHUTTERS, seconds);
}

/** Seconds -> "1/125 s" or "2.0 s". */
export function formatShutter(seconds) {
  if (!isFiniteNumber(seconds) || seconds <= 0) return "—";
  if (seconds >= 1) return `${seconds >= 10 ? seconds.toFixed(0) : seconds.toFixed(1)} s`;
  return `1/${Math.round(1 / seconds)} s`;
}

/** f-numbers print without a trailing zero: f/5.6 but f/8. */
export function formatAperture(fNumber) {
  if (!isFiniteNumber(fNumber) || fNumber <= 0) return "—";
  return `f/${fNumber >= 10 ? fNumber.toFixed(0) : fNumber.toFixed(1).replace(/\.0$/, "")}`;
}

/**
 * Work out the missing half of a manual exposure.
 *
 * mode "aperture": you set the f-number, the shutter is returned.
 * mode "shutter":  you set the shutter, the f-number is returned.
 *
 * @returns {object} either { error } or the full exposure.
 */
export function computeExposure({
  ev100,
  iso,
  mode = "aperture",
  aperture,
  shutterSeconds,
  compensationStops = 0,
}) {
  const baseEv = Number(ev100);
  const sensitivity = Number(iso);
  const comp = Number(compensationStops);

  if (![baseEv, sensitivity, comp].every(isFiniteNumber)) {
    return { error: "Enter a number in every field." };
  }
  if (baseEv < MIN_EV100 || baseEv > MAX_EV100) {
    return { error: `Exposure value must be between EV ${MIN_EV100} and EV ${MAX_EV100}.` };
  }
  if (sensitivity <= 0) return { error: "ISO must be greater than zero." };
  if (sensitivity < MIN_ISO || sensitivity > MAX_ISO) {
    return { error: `ISO must be between ${MIN_ISO} and ${MAX_ISO}.` };
  }
  if (Math.abs(comp) > 6) return { error: "Keep exposure compensation within ±6 stops." };

  // Positive compensation means "let in more light", i.e. expose at a lower EV.
  const ev = evAtIso(baseEv, sensitivity) - comp;
  const power = Math.pow(2, ev);

  let exactAperture;
  let exactShutter;

  if (mode === "shutter") {
    const t = Number(shutterSeconds);
    if (!isFiniteNumber(t) || t <= 0) return { error: "Shutter time must be greater than zero." };
    if (t > 3600) return { error: "Shutter times above one hour are out of range." };
    exactShutter = t;
    exactAperture = apertureForShutter(ev, t);
    if (exactAperture < 0.5 || exactAperture > 128) {
      return {
        error: "No usable f-number for that combination — change the shutter speed or the ISO.",
      };
    }
  } else {
    const n = Number(aperture);
    if (!isFiniteNumber(n) || n <= 0) return { error: "The f-number must be greater than zero." };
    if (n > 128) return { error: "f-numbers above f/128 are out of range." };
    exactAperture = n;
    exactShutter = shutterForAperture(ev, n);
    if (exactShutter > 3600) {
      return { error: "That needs an exposure longer than an hour — open up or raise the ISO." };
    }
  }

  const snappedAperture = nearestAperture(exactAperture);
  const snappedShutter = nearestShutter(exactShutter);

  // Equivalent exposures: every full-stop aperture with its matching shutter.
  const equivalents = STANDARD_APERTURES.map((f) => {
    const t = shutterForAperture(ev, f);
    return {
      aperture: f,
      shutterSeconds: t,
      nearestStandard: nearestShutter(t).value,
      handHoldable: t <= 1 / 60,
    };
  }).filter((row) => row.shutterSeconds <= 3600);

  return {
    ev100: baseEv,
    iso: sensitivity,
    evAtIso: ev,
    compensationStops: comp,
    mode,
    exactAperture,
    exactShutter,
    snappedAperture: snappedAperture.value,
    apertureStopsOff: snappedAperture.stopsOff,
    snappedShutter: snappedShutter.value,
    shutterStopsOff: snappedShutter.stopsOff,
    /** The classic "1/ISO" shutter the rule is remembered by. */
    reciprocalIsoShutter: 1 / sensitivity,
    equivalents,
  };
}
