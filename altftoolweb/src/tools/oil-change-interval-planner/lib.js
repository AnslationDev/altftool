/**
 * Engine oil change interval planning.
 *
 * Base drain intervals below are the "normal service" figures printed in
 * passenger-car owner's manuals for each oil grade family. Manufacturers
 * publish BOTH a distance limit and a time limit and the change is due at
 * whichever arrives first, because oil additives (detergents, anti-oxidants)
 * deplete with time as well as with mileage.
 *
 * Severe-service conditions (short trips, dust, towing, heat, idling) are
 * listed in the same manuals as a reason to shorten the interval. The usual
 * guidance is to shorten it, but never below half the normal interval, so the
 * combined factor is clamped at 0.5.
 */

/** Normal-service base intervals per oil family. */
export const OIL_TYPES = [
  {
    id: "mineral",
    label: "Mineral (20W-40 / 20W-50)",
    km: 5000,
    months: 6,
    note: "Older engines and most carburetted two-valve motors.",
  },
  {
    id: "semi",
    label: "Semi-synthetic (10W-30 / 10W-40)",
    km: 7500,
    months: 9,
    note: "The default fill for most Indian petrol hatchbacks and sedans.",
  },
  {
    id: "full",
    label: "Fully synthetic (5W-30 / 0W-20)",
    km: 10000,
    months: 12,
    note: "Modern turbo-petrol and BS6 engines with tight tolerances.",
  },
  {
    id: "longlife",
    label: "Long-life synthetic (ACEA C3 / VW 504.00)",
    km: 15000,
    months: 12,
    note: "European long-drain specs; only use if the manual asks for it.",
  },
];

/**
 * Multipliers applied to the base interval.
 * Values below 1 shorten the interval (severe service); the highway factor is
 * the only one that lengthens it, because steady running keeps the oil at
 * operating temperature and boils off fuel and water contamination.
 */
export const DRIVING_CONDITIONS = [
  {
    id: "shortTrips",
    label: "Mostly short trips under 8 km",
    factor: 0.75,
    why: "The oil never reaches operating temperature, so fuel and water stay in the sump.",
  },
  {
    id: "idling",
    label: "Heavy stop-go traffic or long idling",
    factor: 0.85,
    why: "Engine hours pile up far faster than the odometer does.",
  },
  {
    id: "dusty",
    label: "Dusty, unpaved or construction roads",
    factor: 0.85,
    why: "Airborne grit that gets past the air filter turns the oil abrasive.",
  },
  {
    id: "towing",
    label: "Regular towing or full passenger load",
    factor: 0.85,
    why: "Sustained high load raises oil temperature and oxidation rate.",
  },
  {
    id: "extremeHeat",
    label: "Sustained ambient above 40 °C",
    factor: 0.9,
    why: "Every extra 10 °C of oil temperature roughly doubles the oxidation rate.",
  },
  {
    id: "highway",
    label: "Mostly steady highway running",
    factor: 1.1,
    why: "Long hot runs are the easiest life an engine oil can have.",
  },
];

/** Severe-service guidance: shorten the interval, but never below half. */
export const MIN_INTERVAL_FACTOR = 0.5;
/** Cap on the highway bonus so no one stretches a drain interval indefinitely. */
export const MAX_INTERVAL_FACTOR = 1.1;

/** Warn the driver once this share of the interval is used up. */
export const DUE_SOON_PERCENT = 90;

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function getOilType(id) {
  return OIL_TYPES.find((type) => type.id === id) || null;
}

/**
 * @param {object} input
 * @param {string} input.oilType        one of OIL_TYPES[].id
 * @param {number} input.kmSinceChange  kilometres run since the last oil change
 * @param {number} input.monthsSinceChange months elapsed since the last oil change
 * @param {number} input.monthlyKm      average kilometres driven per month
 * @param {string[]} [input.conditions] selected DRIVING_CONDITIONS[].id values
 * @returns {object} plan, or { error } when the input cannot produce a real answer
 */
export function planOilChange({
  oilType,
  kmSinceChange,
  monthsSinceChange,
  monthlyKm,
  conditions = [],
}) {
  const oil = getOilType(oilType);
  if (!oil) return { error: "Choose an engine oil type." };

  if (![kmSinceChange, monthsSinceChange, monthlyKm].every(isNum)) {
    return { error: "Enter valid numbers for kilometres, months and monthly running." };
  }
  if (kmSinceChange < 0 || monthsSinceChange < 0) {
    return { error: "Kilometres and months since the last change cannot be negative." };
  }
  if (monthlyKm <= 0) {
    return { error: "Average monthly running must be greater than zero." };
  }
  if (kmSinceChange > 500000 || monthsSinceChange > 240) {
    return { error: "That is beyond any sensible service history — check the figures." };
  }

  const selected = DRIVING_CONDITIONS.filter((condition) =>
    Array.isArray(conditions) ? conditions.includes(condition.id) : false,
  );
  const rawFactor = selected.reduce((acc, condition) => acc * condition.factor, 1);
  const factor = clamp(rawFactor, MIN_INTERVAL_FACTOR, MAX_INTERVAL_FACTOR);
  const factorClamped = rawFactor < MIN_INTERVAL_FACTOR || rawFactor > MAX_INTERVAL_FACTOR;

  // Round the distance limit to the nearest 100 km and the time limit to 0.1 month.
  const intervalKm = Math.max(100, Math.round((oil.km * factor) / 100) * 100);
  const intervalMonths = Math.max(1, Math.round(oil.months * factor * 10) / 10);

  const kmRemaining = intervalKm - kmSinceChange;
  const monthsRemainingByTime = intervalMonths - monthsSinceChange;
  const monthsRemainingByDistance = kmRemaining / monthlyKm;

  const limitedBy =
    monthsRemainingByDistance <= monthsRemainingByTime ? "distance" : "time";
  const monthsRemaining = Math.min(monthsRemainingByDistance, monthsRemainingByTime);

  const percentUsedByKm = (kmSinceChange / intervalKm) * 100;
  const percentUsedByTime = (monthsSinceChange / intervalMonths) * 100;
  const percentUsed = Math.max(percentUsedByKm, percentUsedByTime);

  let status = "ok";
  if (percentUsed >= 100 || monthsRemaining <= 0) status = "overdue";
  else if (percentUsed >= DUE_SOON_PERCENT) status = "due-soon";

  return {
    oilLabel: oil.label,
    baseKm: oil.km,
    baseMonths: oil.months,
    factor: Math.round(factor * 1000) / 1000,
    factorClamped,
    appliedConditions: selected.map((condition) => ({
      label: condition.label,
      factor: condition.factor,
      why: condition.why,
    })),
    intervalKm,
    intervalMonths,
    kmRemaining: Math.round(kmRemaining),
    monthsRemaining: Math.round(monthsRemaining * 10) / 10,
    monthsRemainingByDistance: Math.round(monthsRemainingByDistance * 10) / 10,
    monthsRemainingByTime: Math.round(monthsRemainingByTime * 10) / 10,
    limitedBy,
    percentUsed: Math.round(percentUsed * 10) / 10,
    percentUsedByKm: Math.round(percentUsedByKm * 10) / 10,
    percentUsedByTime: Math.round(percentUsedByTime * 10) / 10,
    status,
  };
}

/** Kilometres per year at the planned interval — useful for budgeting oil + filter. */
export function changesPerYear({ intervalKm, intervalMonths, monthlyKm }) {
  if (!isNum(intervalKm) || !isNum(intervalMonths) || !isNum(monthlyKm)) {
    return { error: "Provide the interval and the average monthly running." };
  }
  if (intervalKm <= 0 || intervalMonths <= 0 || monthlyKm <= 0) {
    return { error: "Interval and monthly running must be greater than zero." };
  }
  const byDistance = (monthlyKm * 12) / intervalKm;
  const byTime = 12 / intervalMonths;
  const perYear = Math.max(byDistance, byTime);
  return {
    perYear: Math.round(perYear * 100) / 100,
    byDistance: Math.round(byDistance * 100) / 100,
    byTime: Math.round(byTime * 100) / 100,
  };
}
