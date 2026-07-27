/**
 * Speed limit unit conversion.
 *
 * Every unit is defined against metres per second, so a conversion is two exact
 * multiplications rather than a chain of rounded factors:
 *
 *   metresPerSecond = value * SPEED_UNITS[from].metresPerSecond
 *   result          = metresPerSecond / SPEED_UNITS[to].metresPerSecond
 *
 * All four factors below are exact definitions, not measurements, so km/h <-> mph
 * conversion here is exact to floating-point precision (1 mph = 1.609344 km/h).
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Seconds in an hour. */
export const SECONDS_PER_HOUR = 3600;

/** 1 international mile = 1609.344 m exactly. Fixed by the 1959 International
 * Yard and Pound Agreement (1 yd = 0.9144 m; 1 mile = 1760 yd). */
export const METRES_PER_INTERNATIONAL_MILE = 1609.344;

/** 1 international nautical mile = 1852 m exactly. Adopted at the First
 * International Extraordinary Hydrographic Conference, Monaco, 1929. */
export const METRES_PER_NAUTICAL_MILE = 1852;

/** 1 international foot = 0.3048 m exactly (same 1959 agreement). */
export const METRES_PER_FOOT = 0.3048;

/** 1 kilometre = 1000 m (SI prefix). */
export const METRES_PER_KILOMETRE = 1000;

/** Road authorities in both km/h and mph countries post limits in multiples of
 * 5 (Vienna Convention on Road Signs sign B14 practice, and the UK/US
 * equivalents), so an exact conversion is shown alongside the nearest value
 * that could actually appear on a sign. */
export const SIGN_INCREMENT = 5;

/** Brake reaction time used for stopping-sight-distance design in the AASHTO
 * "Green Book" (A Policy on Geometric Design of Highways and Streets): 2.5 s.
 * It is a design allowance covering most drivers, not an average reaction time. */
export const BRAKE_REACTION_SECONDS = 2.5;

/** Sanity ceiling on the entered number. Nothing posted on a road comes near
 * this; the limit only exists to keep the output readable. */
export const MAX_INPUT_SPEED = 1000000;

/** Unit table. `metresPerSecond` is how many m/s one of this unit equals. */
export const SPEED_UNITS = {
  kmh: {
    key: "kmh",
    label: "Kilometres per hour",
    short: "km/h",
    metresPerSecond: METRES_PER_KILOMETRE / SECONDS_PER_HOUR,
  },
  mph: {
    key: "mph",
    label: "Miles per hour",
    short: "mph",
    metresPerSecond: METRES_PER_INTERNATIONAL_MILE / SECONDS_PER_HOUR,
  },
  knot: {
    key: "knot",
    label: "Knots",
    short: "kn",
    metresPerSecond: METRES_PER_NAUTICAL_MILE / SECONDS_PER_HOUR,
  },
  ms: {
    key: "ms",
    label: "Metres per second",
    short: "m/s",
    metresPerSecond: 1,
  },
  fts: {
    key: "fts",
    label: "Feet per second",
    short: "ft/s",
    metresPerSecond: METRES_PER_FOOT,
  },
};

/** Display order for pickers and breakdown lists. */
export const UNIT_KEYS = ["kmh", "mph", "knot", "ms", "fts"];

/** Speed limits actually posted on km/h signs, from urban zones to motorways. */
export const COMMON_KMH_LIMITS = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];

/** Speed limits actually posted on mph signs (UK, US, and other mph countries). */
export const COMMON_MPH_LIMITS = [5, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Round a speed to the nearest value that could be posted on a sign.
 *
 * @param {number} value
 * @param {number} [increment]
 * @returns {number}
 */
export function roundToSignIncrement(value, increment = SIGN_INCREMENT) {
  if (!isNum(value) || !isNum(increment) || increment <= 0) return 0;
  return Math.round(value / increment) * increment;
}

/**
 * Convert a speed into metres per second.
 *
 * @param {number} value
 * @param {string} unit key of SPEED_UNITS
 * @returns {number|null} null when the unit is unknown or the value is not finite
 */
export function toMetresPerSecond(value, unit) {
  const meta = SPEED_UNITS[unit];
  if (!meta || !isNum(value)) return null;
  return value * meta.metresPerSecond;
}

/**
 * Convert metres per second into a target unit.
 *
 * @param {number} metresPerSecond
 * @param {string} unit key of SPEED_UNITS
 * @returns {number|null}
 */
export function fromMetresPerSecond(metresPerSecond, unit) {
  const meta = SPEED_UNITS[unit];
  if (!meta || !isNum(metresPerSecond)) return null;
  return metresPerSecond / meta.metresPerSecond;
}

/**
 * Convert a posted speed limit between units and describe what it means on the road.
 *
 * @param {{ value: number, from: string, to: string }} input
 * @returns {object} conversion result, or { error } for unusable input
 */
export function convertSpeed({ value, from, to }) {
  if (!SPEED_UNITS[from] || !SPEED_UNITS[to]) {
    return { error: "Choose a speed unit for both sides of the conversion." };
  }
  if (!isNum(value)) return { error: "Enter the speed limit as a number." };
  if (value <= 0) return { error: "Enter a speed greater than zero." };
  if (value > MAX_INPUT_SPEED) {
    return { error: `Enter a speed below ${MAX_INPUT_SPEED.toLocaleString("en-GB")}.` };
  }

  const metresPerSecond = toMetresPerSecond(value, from);
  const converted = fromMetresPerSecond(metresPerSecond, to);

  const all = {};
  for (const key of UNIT_KEYS) all[key] = fromMetresPerSecond(metresPerSecond, key);

  const secondsPerKilometre = METRES_PER_KILOMETRE / metresPerSecond;
  const secondsPerMile = METRES_PER_INTERNATIONAL_MILE / metresPerSecond;

  // Reading the sign's number in the wrong unit: how fast you would actually be
  // going, expressed back in the unit the sign is posted in.
  let misread = null;
  if (from !== to) {
    const misreadMetresPerSecond = toMetresPerSecond(value, to);
    const misreadInSourceUnit = fromMetresPerSecond(misreadMetresPerSecond, from);
    const difference = misreadInSourceUnit - value;
    const percent = (difference / value) * 100;
    misread = {
      actual: misreadInSourceUnit,
      difference,
      percent,
      gap: Math.abs(difference),
      gapPercent: Math.abs(percent),
      over: difference > 0,
    };
  }

  return {
    from,
    to,
    value,
    converted,
    signable: roundToSignIncrement(converted),
    metresPerSecond,
    all,
    secondsPerKilometre,
    secondsPerMile,
    minutesPerKilometre: secondsPerKilometre / 60,
    minutesPerMile: secondsPerMile / 60,
    reactionDistanceMetres: metresPerSecond * BRAKE_REACTION_SECONDS,
    misread,
  };
}

/**
 * Build the reference table of everyday posted limits converted into a target unit.
 *
 * @param {string} from unit the limits are posted in
 * @param {string} to unit to convert into
 * @returns {Array<{ source: number, exact: number, signable: number }>}
 */
export function buildLimitTable(from, to) {
  if (!SPEED_UNITS[from] || !SPEED_UNITS[to]) return [];
  const source = from === "mph" ? COMMON_MPH_LIMITS : COMMON_KMH_LIMITS;
  return source.map((limit) => {
    const exact = fromMetresPerSecond(toMetresPerSecond(limit, from), to);
    return { source: limit, exact, signable: roundToSignIncrement(exact) };
  });
}
