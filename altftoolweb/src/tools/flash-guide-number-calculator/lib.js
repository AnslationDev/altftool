/**
 * Flash guide number maths.
 *
 * A guide number describes how much light a flash puts out:
 *
 *   GN = f-number x distance
 *
 * so f-number = GN / distance and distance = GN / f-number. The GN is only
 * meaningful together with the ISO it was measured at (almost always ISO 100),
 * the distance unit (metres or feet) and the zoom head position.
 *
 * Two adjustments follow from the inverse-square law and the definition of a
 * stop:
 *
 *   ISO:   GN scales with sqrt(ISO / 100)      (4x the ISO = 2x the GN)
 *   power: GN scales with sqrt(power fraction) (1/4 power = half the GN)
 *
 * Both are square roots because light falls off with the square of distance,
 * and the f-number is itself a square-root scale.
 *
 * Pure module: no React, no DOM, no clock.
 */

/** Guide numbers are quoted at ISO 100 unless stated otherwise. */
export const REFERENCE_ISO = 100;

/** Exact by definition: 1 international foot = 0.3048 m. */
export const FEET_PER_METRE = 1 / 0.3048;

export const MIN_ISO = 6;
export const MAX_ISO = 409600;
export const MIN_APERTURE = 0.5;
export const MAX_APERTURE = 128;

/** Manual flash power fractions found on speedlights and studio heads. */
export const POWER_FRACTIONS = [
  { label: "Full (1/1)", value: 1 },
  { label: "1/2", value: 1 / 2 },
  { label: "1/4", value: 1 / 4 },
  { label: "1/8", value: 1 / 8 },
  { label: "1/16", value: 1 / 16 },
  { label: "1/32", value: 1 / 32 },
  { label: "1/64", value: 1 / 64 },
  { label: "1/128", value: 1 / 128 },
];

/** Full-stop f-numbers. */
export const STANDARD_APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32];

export const ISO_PRESETS = [100, 200, 400, 800, 1600, 3200];

const isFiniteNumber = (value) => Number.isFinite(value);

/** Metres -> feet. */
export function metresToFeet(metres) {
  return metres * FEET_PER_METRE;
}

/** Feet -> metres. */
export function feetToMetres(feet) {
  return feet / FEET_PER_METRE;
}

/**
 * The guide number that actually applies once ISO and power are taken into
 * account.
 */
export function effectiveGuideNumber({ guideNumber, iso = REFERENCE_ISO, powerFraction = 1 }) {
  return guideNumber * Math.sqrt(iso / REFERENCE_ISO) * Math.sqrt(powerFraction);
}

/** Guide number implied by a flash exposure that worked: GN = N x d. */
export function guideNumberFrom({ aperture, distance }) {
  const n = Number(aperture);
  const d = Number(distance);
  if (![n, d].every(isFiniteNumber)) return { error: "Enter a number in every field." };
  if (n <= 0) return { error: "The f-number must be greater than zero." };
  if (d <= 0) return { error: "Distance must be greater than zero." };
  return { guideNumber: n * d };
}

/**
 * Solve the missing side of GN = f-number x distance.
 *
 * mode "aperture": you give the distance, you get the f-number.
 * mode "distance": you give the f-number, you get the distance.
 *
 * @returns {object} either { error } or the full result.
 */
export function computeFlashExposure({
  guideNumber,
  iso = REFERENCE_ISO,
  powerFraction = 1,
  mode = "aperture",
  distance,
  aperture,
  unit = "m",
}) {
  const gn = Number(guideNumber);
  const sensitivity = Number(iso);
  const power = Number(powerFraction);

  if (![gn, sensitivity, power].every(isFiniteNumber)) {
    return { error: "Enter a number in every field." };
  }
  if (gn <= 0) return { error: "The guide number must be greater than zero." };
  if (gn > 1000) return { error: "Guide numbers above 1000 are out of range." };
  if (sensitivity < MIN_ISO || sensitivity > MAX_ISO) {
    return { error: `ISO must be between ${MIN_ISO} and ${MAX_ISO}.` };
  }
  if (power <= 0 || power > 1) return { error: "Power fraction must be between 1/128 and full." };

  const effective = effectiveGuideNumber({ guideNumber: gn, iso: sensitivity, powerFraction: power });

  let solvedAperture;
  let solvedDistance;

  if (mode === "distance") {
    const n = Number(aperture);
    if (!isFiniteNumber(n) || n <= 0) return { error: "The f-number must be greater than zero." };
    if (n > MAX_APERTURE) return { error: `f-numbers above f/${MAX_APERTURE} are out of range.` };
    solvedAperture = n;
    solvedDistance = effective / n;
  } else {
    const d = Number(distance);
    if (!isFiniteNumber(d) || d <= 0) return { error: "Distance must be greater than zero." };
    if (d > 1000) return { error: "Distances above 1000 are out of range." };
    solvedDistance = d;
    solvedAperture = effective / d;
    if (solvedAperture < MIN_APERTURE) {
      return {
        error: "The subject is too far for this flash — move closer, raise the ISO or add power.",
      };
    }
    if (solvedAperture > MAX_APERTURE) {
      return {
        error: "The subject is far too close — cut the flash power or move back.",
      };
    }
  }

  const distanceMetres = unit === "ft" ? feetToMetres(solvedDistance) : solvedDistance;

  return {
    guideNumber: gn,
    effectiveGuideNumber: effective,
    iso: sensitivity,
    powerFraction: power,
    unit,
    aperture: solvedAperture,
    distance: solvedDistance,
    distanceMetres,
    distanceFeet: metresToFeet(distanceMetres),
    /** How much the ISO alone changes the reach, in stops. */
    isoStops: Math.log2(sensitivity / REFERENCE_ISO),
    /** How much the power setting costs, in stops (negative below full). */
    powerStops: Math.log2(power),
    guideNumberOtherUnit: unit === "ft" ? feetToMetres(gn) : metresToFeet(gn),
  };
}

/**
 * Working distance for every full-stop aperture at the current effective GN —
 * the table you tape to the back of the flash.
 */
export function buildDistanceTable({ guideNumber, iso = REFERENCE_ISO, powerFraction = 1 }) {
  const gn = Number(guideNumber);
  if (!isFiniteNumber(gn) || gn <= 0) return [];
  const effective = effectiveGuideNumber({ guideNumber: gn, iso, powerFraction });
  if (!isFiniteNumber(effective) || effective <= 0) return [];
  return STANDARD_APERTURES.map((f) => ({
    aperture: f,
    distance: effective / f,
  }));
}
