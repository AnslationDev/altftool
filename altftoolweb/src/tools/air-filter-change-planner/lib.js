/**
 * Engine air filter and cabin (AC) filter replacement planning.
 *
 * Base intervals are the typical "normal service" figures printed in passenger
 * car manuals: an engine air element around 20,000 km or 24 months, and a
 * cabin/pollen filter around 15,000 km or 12 months, whichever comes first.
 *
 * Both are volume filters, so what wears them out is the quantity of dirty air
 * pulled through — which is why dust exposure, not distance alone, dominates.
 * Manuals list dusty operation as a severe-service condition requiring far more
 * frequent inspection, and the multipliers below reflect that.
 */

export const FILTERS = [
  {
    id: "engine",
    label: "Engine air filter",
    km: 20000,
    months: 24,
    role: "Keeps abrasive grit out of the cylinders and off the mass-airflow sensor.",
  },
  {
    id: "cabin",
    label: "Cabin / AC filter",
    km: 15000,
    months: 12,
    role: "Keeps dust and pollen out of the cabin and stops the evaporator clogging.",
  },
];

/** Dust exposure applies to both filters. */
export const DUST_LEVELS = [
  {
    id: "severe",
    label: "Severe — unpaved, construction or desert dust daily",
    factor: 0.4,
    why: "A visibly dusty road can load an element in a fifth of its rated distance.",
  },
  {
    id: "high",
    label: "High — dense city traffic and dusty arterial roads",
    factor: 0.6,
    why: "Brake and road dust in slow traffic loads the element far faster than open running.",
  },
  {
    id: "moderate",
    label: "Moderate — mixed paved city and highway",
    factor: 1,
    why: "The condition the manual's normal-service interval assumes.",
  },
  {
    id: "low",
    label: "Low — mostly clean highway, car garaged",
    factor: 1.25,
    why: "Clean, fast air carries less particulate per kilometre.",
  },
];

/** Extra conditions. `scope` says which filter each one shortens. */
export const EXTRA_CONDITIONS = [
  {
    id: "heavyTraffic",
    label: "Long idling in stop-go traffic",
    factor: 0.9,
    scope: "both",
    why: "The engine keeps drawing air and the blower keeps running while the odometer stands still.",
  },
  {
    id: "unpavedApproach",
    label: "Unpaved lane or dusty parking at either end of the trip",
    factor: 0.8,
    scope: "engine",
    why: "Short bursts of heavy dust load an element out of proportion to their distance.",
  },
  {
    id: "acHeavyUse",
    label: "AC running almost all year",
    factor: 0.85,
    scope: "cabin",
    why: "More air through the cabin filter, and damp evaporator conditions encourage odour.",
  },
  {
    id: "pollenRoute",
    label: "Tree-lined or high-pollen route",
    factor: 0.8,
    scope: "cabin",
    why: "Pollen and leaf debris blind a cabin filter quickly during flowering season.",
  },
];

/** Combined factor bounds — no interval below 30% or above 150% of the base. */
export const MIN_FILTER_FACTOR = 0.3;
export const MAX_FILTER_FACTOR = 1.5;

/**
 * A paper element can be blown out with low-pressure air a limited number of
 * times before the media is damaged; this is the inspection point, not a
 * replacement substitute.
 */
export const CLEANINGS_PER_ELEMENT = 3;

/** Warn once this share of the interval is consumed. */
export const DUE_SOON_PERCENT = 90;

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;

export function getDustLevel(id) {
  return DUST_LEVELS.find((level) => level.id === id) || null;
}

function computeFilter(filter, factor, kmSince, monthsSince, monthlyKm) {
  // Distance limit rounded to the nearest 500 km, time limit to 0.1 month.
  const intervalKm = Math.max(500, Math.round((filter.km * factor) / 500) * 500);
  const intervalMonths = Math.max(1, Math.round(filter.months * factor * 10) / 10);

  const kmRemaining = intervalKm - kmSince;
  const monthsByDistance = kmRemaining / monthlyKm;
  const monthsByTime = intervalMonths - monthsSince;
  const monthsRemaining = Math.min(monthsByDistance, monthsByTime);
  const limitedBy = monthsByDistance <= monthsByTime ? "distance" : "time";

  const percentUsed = Math.max((kmSince / intervalKm) * 100, (monthsSince / intervalMonths) * 100);

  let status = "ok";
  if (percentUsed >= 100 || monthsRemaining <= 0) status = "overdue";
  else if (percentUsed >= DUE_SOON_PERCENT) status = "due-soon";

  return {
    id: filter.id,
    label: filter.label,
    role: filter.role,
    baseKm: filter.km,
    baseMonths: filter.months,
    factor: Math.round(factor * 1000) / 1000,
    intervalKm,
    intervalMonths,
    kmRemaining: Math.round(kmRemaining),
    monthsRemaining: round1(monthsRemaining),
    monthsByDistance: round1(monthsByDistance),
    monthsByTime: round1(monthsByTime),
    limitedBy,
    percentUsed: round1(percentUsed),
    status,
    inspectEveryKm: Math.max(500, Math.round(intervalKm / CLEANINGS_PER_ELEMENT / 500) * 500),
  };
}

/**
 * @param {object} input
 * @param {string} input.dustLevel        DUST_LEVELS[].id
 * @param {string[]} [input.extras]       EXTRA_CONDITIONS[].id values
 * @param {number} input.engineKmSince    km since the engine air filter was changed
 * @param {number} input.engineMonthsSince months since the engine air filter was changed
 * @param {number} input.cabinKmSince     km since the cabin filter was changed
 * @param {number} input.cabinMonthsSince months since the cabin filter was changed
 * @param {number} input.monthlyKm        average km driven per month
 */
export function planFilterChanges({
  dustLevel,
  extras = [],
  engineKmSince,
  engineMonthsSince,
  cabinKmSince,
  cabinMonthsSince,
  monthlyKm,
}) {
  const dust = getDustLevel(dustLevel);
  if (!dust) return { error: "Choose the dust exposure that matches your usual roads." };

  const numbers = [engineKmSince, engineMonthsSince, cabinKmSince, cabinMonthsSince, monthlyKm];
  if (!numbers.every(isNum)) {
    return { error: "Enter valid numbers for every distance and month field." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Distances and months cannot be negative." };
  }
  if (monthlyKm <= 0) return { error: "Average monthly running must be greater than zero." };
  if (engineKmSince > 500000 || cabinKmSince > 500000) {
    return { error: "That is beyond any plausible service history — check the distances." };
  }
  if (engineMonthsSince > 240 || cabinMonthsSince > 240) {
    return { error: "Months since the last change is beyond a plausible service history." };
  }

  const chosen = Array.isArray(extras) ? extras : [];
  const applied = EXTRA_CONDITIONS.filter((condition) => chosen.includes(condition.id));

  const factorFor = (scope) =>
    clamp(
      applied
        .filter((condition) => condition.scope === scope || condition.scope === "both")
        .reduce((acc, condition) => acc * condition.factor, dust.factor),
      MIN_FILTER_FACTOR,
      MAX_FILTER_FACTOR,
    );

  const engineFactor = factorFor("engine");
  const cabinFactor = factorFor("cabin");

  const engine = computeFilter(FILTERS[0], engineFactor, engineKmSince, engineMonthsSince, monthlyKm);
  const cabin = computeFilter(FILTERS[1], cabinFactor, cabinKmSince, cabinMonthsSince, monthlyKm);

  const soonest = engine.monthsRemaining <= cabin.monthsRemaining ? engine : cabin;

  return {
    dustLabel: dust.label,
    dustFactor: dust.factor,
    appliedExtras: applied.map((condition) => ({
      label: condition.label,
      factor: condition.factor,
      scope: condition.scope,
      why: condition.why,
    })),
    engine,
    cabin,
    soonestFilterId: soonest.id,
    soonestFilterLabel: soonest.label,
    soonestMonths: soonest.monthsRemaining,
    soonestKm: soonest.kmRemaining,
  };
}
