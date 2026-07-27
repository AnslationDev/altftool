/**
 * Water, money and geyser energy lost through a dripping or trickling tap.
 *
 * DRIP VOLUME — the USGS drip calculator takes 15,140 drips to make one US
 * gallon (3.785411784 L), which is 0.25 mL per drip. That single constant is
 * what turns a drip count into litres:
 *     litres per day = drips per minute x 0.00025 L x 1440 minutes
 *                    = drips per minute x 0.36 L
 *
 * TRICKLE MODE — for a leak too fast to count, time how many seconds it takes
 * to fill a one-litre bottle. Flow in L/min is simply 60 / seconds.
 *
 * HOT TAP — if the leak is on the hot line, the water was already heated, so
 * the loss includes sensible heat Q = m x c x dT with c = 4.186 kJ/(kg K)
 * and 1 kWh = 3600 kJ, divided by the water heater's efficiency.
 */

/** Litres in one drip: 3.785411784 L per US gallon / 15,140 drips (USGS). */
export const LITRES_PER_DRIP = 0.00025;

/** Minutes in a day. */
export const MINUTES_PER_DAY = 1440;

/** Days used for the monthly and yearly roll-ups. */
export const DAYS_PER_MONTH = 30;
export const DAYS_PER_YEAR = 365;

/** Specific heat capacity of liquid water, kJ per kg per kelvin. */
export const SPECIFIC_HEAT_WATER_KJ = 4.186;

/** 1 kWh = 3600 kJ, by definition. */
export const KJ_PER_KWH = 3600;

/** 1 kilolitre = 1000 litres. */
export const LITRES_PER_KILOLITRE = 1000;

/** A standard Indian bathing bucket, for the "what does this look like" comparison. */
export const BUCKET_LITRES = 15;

/** Rough drip rates people describe, for quick selection. */
export const DRIP_PRESETS = [
  { id: "slow", label: "Occasional drip", dpm: 10 },
  { id: "steady", label: "Steady drip", dpm: 30 },
  { id: "fast", label: "Fast drip", dpm: 60 },
  { id: "trickle", label: "Almost a trickle", dpm: 120 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Litres per day from a drip count. */
export function litresPerDayFromDrips(dripsPerMinute) {
  if (!(dripsPerMinute > 0)) return 0;
  return dripsPerMinute * LITRES_PER_DRIP * MINUTES_PER_DAY;
}

/** Litres per day from a timed one-litre fill. */
export function litresPerDayFromSeconds(secondsPerLitre) {
  if (!(secondsPerLitre > 0)) return 0;
  return (60 / secondsPerLitre) * MINUTES_PER_DAY;
}

/**
 * @param {object} input
 * @param {"drips"|"timed"} input.mode
 * @param {number} input.dripsPerMinute    drips counted in a minute (drips mode)
 * @param {number} input.secondsPerLitre   seconds to fill 1 litre (timed mode)
 * @param {number} input.tapCount          how many taps leak like this
 * @param {number} input.waterRatePerKl    water cost per kilolitre
 * @param {boolean} input.isHotWater       true if the leak is on the hot line
 * @param {number} input.deltaT            temperature rise the geyser supplied
 * @param {number} input.heaterEfficiency  water heater efficiency, percent
 * @param {number} input.tariffPerKwh      electricity tariff per kWh
 */
export function computeTapLoss({
  mode = "drips",
  dripsPerMinute = 0,
  secondsPerLitre = 0,
  tapCount = 1,
  waterRatePerKl = 0,
  isHotWater = false,
  deltaT = 0,
  heaterEfficiency = 90,
  tariffPerKwh = 0,
}) {
  const values = [
    dripsPerMinute,
    secondsPerLitre,
    tapCount,
    waterRatePerKl,
    deltaT,
    heaterEfficiency,
    tariffPerKwh,
  ];
  if (!values.every(isNum)) return { error: "Enter a valid number in every field." };
  if (mode !== "drips" && mode !== "timed") return { error: "Choose either drip counting or a timed fill." };
  if (mode === "drips") {
    if (dripsPerMinute < 0) return { error: "Drips per minute cannot be negative." };
    if (dripsPerMinute > 10000) return { error: "Above 10,000 drips a minute, time a one-litre fill instead." };
  } else {
    if (secondsPerLitre <= 0) return { error: "Seconds to fill one litre must be greater than zero." };
    if (secondsPerLitre > 86400) return { error: "Enter a fill time of 86,400 seconds (one day) or less." };
  }
  if (tapCount < 1) return { error: "There must be at least one leaking tap." };
  if (tapCount > 1000) return { error: "Enter 1,000 taps or fewer." };
  if (waterRatePerKl < 0 || tariffPerKwh < 0) return { error: "Rates cannot be negative." };
  if (isHotWater) {
    if (deltaT < 0) return { error: "Temperature rise cannot be negative." };
    if (deltaT > 80) return { error: "A temperature rise above 80 °C is outside domestic water heating." };
    if (heaterEfficiency <= 0 || heaterEfficiency > 100) {
      return { error: "Heater efficiency must be between 1% and 100%." };
    }
  }

  const perTapLitresPerDay =
    mode === "drips" ? litresPerDayFromDrips(dripsPerMinute) : litresPerDayFromSeconds(secondsPerLitre);

  const litresPerDay = perTapLitresPerDay * tapCount;
  const litresPerMonth = litresPerDay * DAYS_PER_MONTH;
  const litresPerYear = litresPerDay * DAYS_PER_YEAR;

  const waterCostPerYear = (litresPerYear / LITRES_PER_KILOLITRE) * waterRatePerKl;
  const waterCostPerMonth = (litresPerMonth / LITRES_PER_KILOLITRE) * waterRatePerKl;

  const usefulKwhPerYear = isHotWater
    ? (litresPerYear * SPECIFIC_HEAT_WATER_KJ * deltaT) / KJ_PER_KWH
    : 0;
  const energyKwhPerYear = isHotWater ? usefulKwhPerYear / (heaterEfficiency / 100) : 0;
  const energyCostPerYear = energyKwhPerYear * tariffPerKwh;

  const totalCostPerYear = waterCostPerYear + energyCostPerYear;
  const totalCostPerMonth = totalCostPerYear / (DAYS_PER_YEAR / DAYS_PER_MONTH);

  const bucketsPerYear = litresPerYear / BUCKET_LITRES;
  const flowLpm = perTapLitresPerDay / MINUTES_PER_DAY;

  const notes = [];
  if (litresPerDay === 0) {
    notes.push("No measurable leak at these figures — nothing is being lost.");
  } else if (litresPerYear >= 20000) {
    notes.push(
      "This leak wastes more than four standard 5,000 litre tankers a year; a washer or cartridge change usually stops it.",
    );
  }
  if (isHotWater && deltaT === 0) {
    notes.push("Temperature rise is zero, so no heating energy is counted for the hot tap.");
  }

  return {
    mode,
    perTapLitresPerDay,
    flowLpm,
    litresPerDay,
    litresPerMonth,
    litresPerYear,
    waterCostPerMonth,
    waterCostPerYear,
    usefulKwhPerYear,
    energyKwhPerYear,
    energyCostPerYear,
    totalCostPerMonth,
    totalCostPerYear,
    bucketsPerYear,
    notes,
  };
}
