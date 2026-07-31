/**
 * Tyre rotation schedule planner.
 *
 * Two independent rules decide when a rotation is due, and the earlier one wins:
 *  1. Distance — most car makers and the Tire Industry Association publish a
 *     rotation interval of roughly 8,000-10,000 km (5,000-6,000 miles).
 *  2. Time — tyres also wear unevenly when a car sits, so the same guidance
 *     caps the gap at about 6 months even for very low-mileage cars.
 *
 * The crossing pattern depends on the drivetrain and on whether the tyres are
 * directional or a staggered (different front/rear size) fitment.
 */

/** Typical published rotation interval, mid-point of the 8,000-10,000 km range. */
export const ROTATION_INTERVAL_KM_DEFAULT = 9000;
/** Below this a rotation interval is not a real service plan, it is a typo. */
export const ROTATION_INTERVAL_KM_MIN = 1000;
/** Above ~20,000 km no mainstream handbook still calls it a rotation interval. */
export const ROTATION_INTERVAL_KM_MAX = 20000;
/** Time cap used alongside the distance interval (industry guidance: ~6 months). */
export const ROTATION_INTERVAL_MONTHS_MAX = 6;
/** Mean length of a Gregorian calendar month in days (365.2425 / 12). */
export const DAYS_PER_MONTH = 30.436875;
/** Planning further than 12 rotations ahead is guesswork, not a schedule. */
export const MAX_ROTATIONS = 12;

export const WHEEL_POSITIONS = {
  LF: "Left front",
  RF: "Right front",
  LR: "Left rear",
  RR: "Right rear",
  S: "Spare",
};

export const DRIVE_TYPES = [
  { value: "fwd", label: "Front wheel drive (FWD)" },
  { value: "rwd", label: "Rear wheel drive (RWD)" },
  { value: "awd", label: "All wheel drive / 4x4 (AWD)" },
];

export const TYRE_TYPES = [
  { value: "standard", label: "Standard (non-directional)" },
  { value: "directional", label: "Directional tread" },
];

/**
 * Rotation patterns.
 * Forward cross (FWD): fronts go straight back, rears cross to the front.
 * Rearward cross (RWD/4x4): rears go straight forward, fronts cross to the rear.
 * X-pattern: every tyre moves diagonally; accepted for AWD and for light trucks.
 * Directional tyres must keep their rolling direction, so they only swap front
 * to rear on the same side.
 * Staggered (different sizes front and rear) tyres can only swap left to right
 * on the same axle, and if they are also directional they cannot be rotated at
 * all without dismounting them from the wheels.
 */
export const ROTATION_PATTERNS = {
  forwardCross: {
    key: "forwardCross",
    name: "Forward cross",
    summary: "Fronts move straight back; rears cross over to the front.",
    moves: [
      ["LF", "LR"],
      ["RF", "RR"],
      ["LR", "RF"],
      ["RR", "LF"],
    ],
  },
  rearwardCross: {
    key: "rearwardCross",
    name: "Rearward cross",
    summary: "Rears move straight forward; fronts cross over to the rear.",
    moves: [
      ["LR", "LF"],
      ["RR", "RF"],
      ["LF", "RR"],
      ["RF", "LR"],
    ],
  },
  xPattern: {
    key: "xPattern",
    name: "X-pattern",
    summary: "Every tyre moves diagonally to the opposite corner.",
    moves: [
      ["LF", "RR"],
      ["RF", "LR"],
      ["LR", "RF"],
      ["RR", "LF"],
    ],
  },
  sameSide: {
    key: "sameSide",
    name: "Front to rear, same side",
    summary: "Directional tyres stay on their own side so the tread keeps its rolling direction.",
    moves: [
      ["LF", "LR"],
      ["LR", "LF"],
      ["RF", "RR"],
      ["RR", "RF"],
    ],
  },
  sideToSide: {
    key: "sideToSide",
    name: "Side to side, same axle",
    summary: "Staggered fitments keep each size on its own axle and only swap left with right.",
    moves: [
      ["LF", "RF"],
      ["RF", "LF"],
      ["LR", "RR"],
      ["RR", "LR"],
    ],
  },
  forwardCrossSpare: {
    key: "forwardCrossSpare",
    name: "Forward cross with full-size spare",
    summary:
      "Forward cross, but the spare enters at the right rear and the right front becomes the new spare.",
    moves: [
      ["LF", "LR"],
      ["LR", "RF"],
      ["RF", "S"],
      ["S", "RR"],
      ["RR", "LF"],
    ],
  },
  rearwardCrossSpare: {
    key: "rearwardCrossSpare",
    name: "Rearward cross with full-size spare",
    summary:
      "Rearward cross, but the spare enters at the right rear and the left front becomes the new spare.",
    moves: [
      ["LR", "LF"],
      ["RR", "RF"],
      ["RF", "LR"],
      ["LF", "S"],
      ["S", "RR"],
    ],
  },
  notPossible: {
    key: "notPossible",
    name: "Rotation not possible",
    summary:
      "Directional tyres in a staggered fitment cannot change corner without being dismounted and remounted on the opposite wheel.",
    moves: [],
  },
};

/**
 * Pick the correct pattern for a car.
 * @returns {object} one of ROTATION_PATTERNS
 */
export function selectRotationPattern({
  driveType = "fwd",
  tyreType = "standard",
  staggered = false,
  includeSpare = false,
} = {}) {
  const directional = tyreType === "directional";

  if (staggered && directional) return ROTATION_PATTERNS.notPossible;
  if (staggered) return ROTATION_PATTERNS.sideToSide;
  if (directional) return ROTATION_PATTERNS.sameSide;

  if (includeSpare) {
    return driveType === "fwd"
      ? ROTATION_PATTERNS.forwardCrossSpare
      : ROTATION_PATTERNS.rearwardCrossSpare;
  }

  if (driveType === "fwd") return ROTATION_PATTERNS.forwardCross;
  if (driveType === "rwd") return ROTATION_PATTERNS.rearwardCross;
  return ROTATION_PATTERNS.xPattern;
}

/** Parse a YYYY-MM-DD string into a UTC timestamp. Returns NaN if unusable. */
export function parseISODate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return NaN;
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return NaN;
  }
  return ms;
}

/** Add whole days to a YYYY-MM-DD string and return a YYYY-MM-DD string. */
export function addDaysISO(value, days) {
  const ms = parseISODate(value);
  if (!Number.isFinite(ms) || !Number.isFinite(days)) return "";
  return new Date(ms + Math.round(days) * 86400000).toISOString().slice(0, 10);
}

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Build the rotation schedule.
 * All inputs are plain numbers/strings; the start date is passed in so the
 * function stays pure and testable.
 */
export function planRotationSchedule({
  currentOdometerKm = 0,
  intervalKm = ROTATION_INTERVAL_KM_DEFAULT,
  monthlyKm = 1000,
  startDate = "2026-01-01",
  rotations = 4,
  costPerRotation = 0,
  driveType = "fwd",
  tyreType = "standard",
  staggered = false,
  includeSpare = false,
} = {}) {
  if (![currentOdometerKm, intervalKm, monthlyKm, rotations, costPerRotation].every(isNum)) {
    return { error: "Enter valid numbers in every field." };
  }
  if (currentOdometerKm < 0) return { error: "Odometer reading cannot be negative." };
  if (currentOdometerKm > 2000000) return { error: "Odometer reading looks too high to be real." };
  if (intervalKm < ROTATION_INTERVAL_KM_MIN || intervalKm > ROTATION_INTERVAL_KM_MAX) {
    return {
      error: `Rotation interval should be between ${ROTATION_INTERVAL_KM_MIN} and ${ROTATION_INTERVAL_KM_MAX} km.`,
    };
  }
  if (monthlyKm <= 0) return { error: "Monthly running must be greater than zero km." };
  if (monthlyKm > 20000) return { error: "Monthly running above 20,000 km is out of range." };
  if (costPerRotation < 0) return { error: "Cost per rotation cannot be negative." };

  const count = Math.round(rotations);
  if (count < 1 || count > MAX_ROTATIONS) {
    return { error: `Plan between 1 and ${MAX_ROTATIONS} rotations ahead.` };
  }
  if (!Number.isFinite(parseISODate(startDate))) {
    return { error: "Enter a valid start date." };
  }

  const pattern = selectRotationPattern({ driveType, tyreType, staggered, includeSpare });
  const kmPerDay = monthlyKm / DAYS_PER_MONTH;
  const daysForInterval = intervalKm / kmPerDay;
  const timeCapDays = ROTATION_INTERVAL_MONTHS_MAX * DAYS_PER_MONTH;
  const stepDays = Math.min(daysForInterval, timeCapDays);
  const limitedBy = stepDays < daysForInterval - 1e-9 ? "time" : "distance";

  const events = [];
  let cumulativeDays = 0;
  let odometer = currentOdometerKm;

  for (let index = 1; index <= count; index += 1) {
    cumulativeDays += stepDays;
    odometer += kmPerDay * stepDays;
    events.push({
      index,
      odometerKm: Math.round(odometer),
      date: addDaysISO(startDate, cumulativeDays),
      daysFromStart: Math.round(cumulativeDays),
      monthsFromStart: Math.round((cumulativeDays / DAYS_PER_MONTH) * 10) / 10,
      limitedBy,
    });
  }

  return {
    pattern,
    events,
    limitedBy,
    intervalDays: Math.round(stepDays),
    intervalMonths: Math.round((stepDays / DAYS_PER_MONTH) * 10) / 10,
    effectiveIntervalKm: Math.round(kmPerDay * stepDays),
    next: events[0],
    horizonKm: Math.round(odometer - currentOdometerKm),
    horizonMonths: Math.round((cumulativeDays / DAYS_PER_MONTH) * 10) / 10,
    totalCost: Math.round(costPerRotation * count),
    rotationsPlanned: count,
  };
}
