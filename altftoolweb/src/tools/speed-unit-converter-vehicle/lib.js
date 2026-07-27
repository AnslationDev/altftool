/**
 * Vehicle speed unit conversion plus the stopping distance that speed implies.
 *
 * Conversion is exact: every unit is defined as a fixed number of metres, so each
 * speed is first reduced to metres per second and then expressed in the target unit.
 *
 * Stopping distance uses the two-part model used in road design manuals:
 *
 *   reaction distance = v * t           (vehicle keeps travelling while the driver reacts)
 *   braking distance  = v^2 / (2 * g * (mu + G))
 *   stopping distance = reaction + braking
 *
 * where v is speed in m/s, t is the perception-brake reaction time, mu is the
 * coefficient of friction between tyre and road and G is the grade as a decimal
 * (positive uphill, which shortens the stop; negative downhill, which lengthens it).
 */

/** International mile, exact by the 1959 international yard and pound agreement. */
export const METRES_PER_MILE = 1609.344;

/** International nautical mile, exact — adopted by the 1929 Hydrographic Conference. */
export const METRES_PER_NAUTICAL_MILE = 1852;

/** International foot, exact (0.3048 m by the same 1959 agreement). */
export const METRES_PER_FOOT = 0.3048;

/** Standard gravity g0 as fixed by the 3rd CGPM (1901), in m/s^2. */
export const STANDARD_GRAVITY = 9.80665;

/**
 * Speed of sound in dry air at ICAO International Standard Atmosphere sea level
 * (15 degC, 1013.25 hPa), in m/s. Mach number is speed divided by this.
 */
export const SPEED_OF_SOUND_ISA_SEA_LEVEL = 340.29;

const SECONDS_PER_HOUR = 3600;

/** Every supported unit, expressed as how many m/s one of it equals. */
export const SPEED_UNITS = [
  { id: "kmph", label: "Kilometres per hour", short: "km/h", toMps: 1000 / SECONDS_PER_HOUR, decimals: 2 },
  { id: "mph", label: "Miles per hour", short: "mph", toMps: METRES_PER_MILE / SECONDS_PER_HOUR, decimals: 2 },
  { id: "mps", label: "Metres per second", short: "m/s", toMps: 1, decimals: 3 },
  { id: "knot", label: "Knots", short: "kn", toMps: METRES_PER_NAUTICAL_MILE / SECONDS_PER_HOUR, decimals: 2 },
  { id: "fps", label: "Feet per second", short: "ft/s", toMps: METRES_PER_FOOT, decimals: 2 },
  { id: "mach", label: "Mach (ISA sea level)", short: "Mach", toMps: SPEED_OF_SOUND_ISA_SEA_LEVEL, decimals: 4 },
];

/**
 * Representative peak tyre-to-road friction coefficients used in highway design
 * and accident reconstruction. Real values vary with tyre, tread depth and
 * temperature, so these are mid-range figures for a passenger car.
 */
export const SURFACE_FRICTION = [
  { id: "dry-asphalt", label: "Dry asphalt / concrete", mu: 0.7 },
  { id: "wet-asphalt", label: "Wet asphalt", mu: 0.45 },
  { id: "gravel", label: "Loose gravel", mu: 0.35 },
  { id: "packed-snow", label: "Packed snow", mu: 0.2 },
  { id: "ice", label: "Ice", mu: 0.1 },
];

/**
 * AASHTO's Green Book uses a 2.5 second brake reaction time for stopping sight
 * distance design; an alert driver expecting the event is nearer 1.0-1.5 s.
 */
export const DESIGN_REACTION_SECONDS = 2.5;
export const ALERT_REACTION_SECONDS = 1;

/** Anything faster than this is not a vehicle on a road. */
const MAX_SPEED_MPS = 400000;

export function unitById(id) {
  return SPEED_UNITS.find((unit) => unit.id === id) || null;
}

/**
 * Convert one speed into every supported unit.
 * @returns {{error:string}|{mps:number, values:Record<string, number>}}
 */
export function convertSpeed({ value, from = "kmph" }) {
  const unit = unitById(from);
  if (!unit) return { error: "Choose a speed unit to convert from." };
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { error: "Enter a valid speed." };
  }
  if (value < 0) return { error: "Speed cannot be negative." };

  const mps = value * unit.toMps;
  if (mps > MAX_SPEED_MPS) {
    return { error: "That speed is beyond the range this converter handles." };
  }

  const values = {};
  for (const target of SPEED_UNITS) {
    values[target.id] = mps / target.toMps;
  }
  return { mps, values };
}

/**
 * Reaction, braking and total stopping distance for a speed in m/s.
 * @returns {{error:string}|object}
 */
export function stoppingDistance({
  speedMps,
  reactionSeconds = DESIGN_REACTION_SECONDS,
  friction = 0.7,
  gradePercent = 0,
}) {
  const numbers = [speedMps, reactionSeconds, friction, gradePercent];
  if (numbers.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter a valid number for speed, reaction time, friction and grade." };
  }
  if (speedMps < 0) return { error: "Speed cannot be negative." };
  if (reactionSeconds < 0 || reactionSeconds > 10) {
    return { error: "Reaction time should be between 0 and 10 seconds." };
  }
  if (friction <= 0 || friction > 1.5) {
    return { error: "Friction coefficient should be above 0 and at most 1.5." };
  }
  if (gradePercent < -30 || gradePercent > 30) {
    return { error: "Grade should be between -30% (downhill) and +30% (uphill)." };
  }

  const effectiveGrip = friction + gradePercent / 100;
  if (effectiveGrip <= 0) {
    return {
      error: "On this downgrade the tyres have less grip than gravity — the vehicle cannot be braked to a stop.",
    };
  }

  const reactionDistance = speedMps * reactionSeconds;
  const brakingDistance = (speedMps * speedMps) / (2 * STANDARD_GRAVITY * effectiveGrip);
  const decelerationMps2 = STANDARD_GRAVITY * effectiveGrip;

  return {
    reactionDistance,
    brakingDistance,
    totalDistance: reactionDistance + brakingDistance,
    decelerationMps2,
    decelerationG: effectiveGrip,
    brakingSeconds: decelerationMps2 > 0 ? speedMps / decelerationMps2 : 0,
    effectiveGrip,
  };
}
