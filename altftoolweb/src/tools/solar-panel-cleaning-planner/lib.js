/**
 * Solar panel cleaning schedule from a soiling-rate model.
 *
 * Dust accumulates roughly linearly between washes, so output loss grows from
 * 0 immediately after a clean to r x T by the end of an interval of T days,
 * averaging r x T / 2 across the cycle.
 *
 * The economically optimal interval falls out of that. Over one cycle:
 *   lost value  = dailyValue x r x T^2 / 2
 *   cleaning    = costPerClean
 *   cost/day    = dailyValue x r x T / 2 + costPerClean / T
 * Differentiating and setting to zero gives
 *   T* = sqrt( 2 x costPerClean / (dailyValue x r) )
 * which is the classic square-root cleaning interval.
 */

/** Mean days per year in the Gregorian calendar. */
export const DAYS_PER_YEAR = 365.25;

/**
 * Base soiling rate as a fraction of output lost per dust-free day.
 * Field measurements of PV soiling across India span roughly 0.1%/day on wet
 * coastal sites to about 1%/day near deserts, quarries and cement works.
 */
export const DUST_LEVELS = {
  coastal: { id: "coastal", label: "Clean / coastal", hint: "High rainfall, sea air, little dust", ratePctPerDay: 0.1 },
  suburban: { id: "suburban", label: "Suburban residential", hint: "Paved streets, some tree litter", ratePctPerDay: 0.2 },
  urban: { id: "urban", label: "Dense city", hint: "Heavy traffic, diesel soot, construction nearby", ratePctPerDay: 0.35 },
  arid: { id: "arid", label: "Semi-arid plains", hint: "Dry months, occasional dust storms", ratePctPerDay: 0.5 },
  extreme: { id: "extreme", label: "Desert or industrial", hint: "Quarry, cement works, unpaved surroundings", ratePctPerDay: 0.8 },
};

/**
 * Nearby dust sources multiply the base rate. Values reflect how much faster
 * modules foul when a specific emitter sits upwind.
 */
export const NEARBY_SOURCES = {
  none: { id: "none", label: "Nothing particular nearby", factor: 1.0 },
  busyRoad: { id: "busyRoad", label: "Busy or unpaved road", factor: 1.25 },
  farmland: { id: "farmland", label: "Farmland (tilling, stubble burning)", factor: 1.35 },
  construction: { id: "construction", label: "Active construction site", factor: 1.6 },
  industrial: { id: "industrial", label: "Factory, kiln or quarry", factor: 1.7 },
};

/**
 * Tilt controls how much dust slides off. Below about 10 degrees a module
 * barely self-cleans even in rain; past 30 degrees gravity does real work.
 * Bands are ordered from shallowest to steepest.
 */
export const TILT_BANDS = [
  { maxTilt: 5, factor: 1.4, label: "Almost flat — dust just sits there" },
  { maxTilt: 10, factor: 1.25, label: "Very shallow — poor self-cleaning" },
  { maxTilt: 20, factor: 1.1, label: "Shallow — some run-off" },
  { maxTilt: 30, factor: 1.0, label: "Standard tilt — normal run-off" },
  { maxTilt: 90, factor: 0.9, label: "Steep — sheds dust well" },
];

/**
 * A dust layer saturates: beyond roughly a quarter of output lost, extra dust
 * mostly lands on dust rather than on glass, so cap the accumulated loss.
 */
export const MAX_SOILING_LOSS_FRACTION = 0.25;

/** Rain lighter than about 10 mm smears panels rather than washing them. */
export const CLEANING_RAIN_MM = 10;

export function tiltBandFor(tiltDeg) {
  return TILT_BANDS.find((band) => tiltDeg <= band.maxTilt) ?? TILT_BANDS[TILT_BANDS.length - 1];
}

/** Average fractional loss across a cycle of `days`, respecting the saturation cap. */
export function averageLossOverInterval(dailyRateFraction, days) {
  const peak = Math.min(MAX_SOILING_LOSS_FRACTION, dailyRateFraction * days);
  if (dailyRateFraction <= 0 || days <= 0) return 0;
  const daysToCap = MAX_SOILING_LOSS_FRACTION / dailyRateFraction;
  if (days <= daysToCap) return peak / 2;
  // Ramp up to the cap, then flat at the cap for the rest of the interval.
  const rampArea = (MAX_SOILING_LOSS_FRACTION * daysToCap) / 2;
  const flatArea = MAX_SOILING_LOSS_FRACTION * (days - daysToCap);
  return (rampArea + flatArea) / days;
}

/**
 * @param {object} input
 * @param {number} input.annualKwh       clean-panel annual generation, kWh
 * @param {number} input.tariff          value of a unit (tariff or feed-in rate)
 * @param {string} input.dustLevel       key of DUST_LEVELS
 * @param {string} input.nearbySource    key of NEARBY_SOURCES
 * @param {number} input.tiltDeg         array tilt from horizontal, degrees
 * @param {number} input.rainIntervalDays average days between rain of 10 mm or more
 * @param {number} input.costPerClean    what one wash costs you
 * @param {number} input.cleaningInterval your current plan, days between washes
 * @param {number} input.daysSinceClean  days since the array was last washed
 */
export function computeCleaningPlan({
  annualKwh,
  tariff,
  dustLevel = "suburban",
  nearbySource = "none",
  tiltDeg = 20,
  rainIntervalDays = 30,
  costPerClean = 0,
  cleaningInterval = 30,
  daysSinceClean = 0,
} = {}) {
  const numbers = { annualKwh, tariff, tiltDeg, rainIntervalDays, costPerClean, cleaningInterval, daysSinceClean };
  for (const [key, value] of Object.entries(numbers)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: `Enter a valid number for ${key}.` };
    }
  }

  const dust = DUST_LEVELS[dustLevel];
  if (!dust) return { error: "Choose how dusty your location is." };
  const source = NEARBY_SOURCES[nearbySource];
  if (!source) return { error: "Choose what sits near the array." };

  if (!(annualKwh > 0)) return { error: "Annual generation must be greater than zero." };
  if (tariff < 0 || costPerClean < 0) return { error: "Tariff and cleaning cost cannot be negative." };
  if (tiltDeg < 0 || tiltDeg > 90) return { error: "Tilt must be between 0° and 90°." };
  if (!(rainIntervalDays > 0)) return { error: "Days between washing rain must be greater than zero." };
  if (rainIntervalDays > 365) return { error: "Enter days between washing rain as 365 or fewer." };
  if (!(cleaningInterval > 0)) return { error: "Cleaning interval must be at least one day." };
  if (daysSinceClean < 0) return { error: "Days since the last clean cannot be negative." };

  const tiltBand = tiltBandFor(tiltDeg);
  const ratePctPerDay = dust.ratePctPerDay * source.factor * tiltBand.factor;
  const rateFraction = ratePctPerDay / 100;

  const dailyValue = (annualKwh * tariff) / DAYS_PER_YEAR;
  const dailyKwh = annualKwh / DAYS_PER_YEAR;

  // Rain washes for free, so an interval longer than the rain gap never happens.
  const effectiveInterval = Math.min(cleaningInterval, rainIntervalDays);
  const avgLossFraction = averageLossOverInterval(rateFraction, effectiveInterval);
  const annualKwhLost = annualKwh * avgLossFraction;
  const annualValueLost = annualKwhLost * tariff;

  const totalWashesPerYear = DAYS_PER_YEAR / effectiveInterval;
  const freeWashesPerYear = DAYS_PER_YEAR / rainIntervalDays;
  const paidWashesPerYear = Math.max(0, totalWashesPerYear - freeWashesPerYear);
  const annualCleaningCost = paidWashesPerYear * costPerClean;
  const annualTotalCost = annualValueLost + annualCleaningCost;

  // Where you are right now in the current cycle.
  const currentLossFraction = Math.min(MAX_SOILING_LOSS_FRACTION, rateFraction * daysSinceClean);
  const kwhLostToday = dailyKwh * currentLossFraction;
  const valueLostToday = kwhLostToday * tariff;
  const daysUntilDue = Math.max(0, Math.ceil(effectiveInterval - daysSinceClean));
  const overdue = daysSinceClean > effectiveInterval;

  // Square-root optimum, then capped by the free wash that rain provides.
  let optimalInterval = null;
  if (costPerClean > 0 && dailyValue > 0 && rateFraction > 0) {
    optimalInterval = Math.sqrt((2 * costPerClean) / (dailyValue * rateFraction));
  }
  const recommendedInterval = optimalInterval
    ? Math.min(rainIntervalDays, Math.max(1, optimalInterval))
    : rainIntervalDays;

  const recAvgLoss = averageLossOverInterval(rateFraction, recommendedInterval);
  const recValueLost = annualKwh * recAvgLoss * tariff;
  const recPaidWashes = Math.max(0, DAYS_PER_YEAR / recommendedInterval - freeWashesPerYear);
  const recCleaningCost = recPaidWashes * costPerClean;
  const recTotalCost = recValueLost + recCleaningCost;
  const savingVsCurrent = annualTotalCost - recTotalCost;

  // Doing nothing at all: rain is the only wash you get.
  const neverAvgLoss = averageLossOverInterval(rateFraction, rainIntervalDays);
  const neverTotalCost = annualKwh * neverAvgLoss * tariff;

  return {
    ratePctPerDay,
    dustLabel: dust.label,
    sourceLabel: source.label,
    tiltLabel: tiltBand.label,
    tiltFactor: tiltBand.factor,
    dailyKwh,
    dailyValue,
    effectiveInterval,
    rainCapsInterval: cleaningInterval > rainIntervalDays,
    avgLossPct: avgLossFraction * 100,
    annualKwhLost,
    annualValueLost,
    paidWashesPerYear,
    freeWashesPerYear,
    annualCleaningCost,
    annualTotalCost,
    currentLossPct: currentLossFraction * 100,
    kwhLostToday,
    valueLostToday,
    daysUntilDue,
    overdue,
    optimalInterval,
    recommendedInterval,
    recAvgLossPct: recAvgLoss * 100,
    recPaidWashes,
    recCleaningCost,
    recValueLost,
    recTotalCost,
    savingVsCurrent,
    neverAvgLossPct: neverAvgLoss * 100,
    neverTotalCost,
    saturated: rateFraction * effectiveInterval > MAX_SOILING_LOSS_FRACTION,
  };
}
