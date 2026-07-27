/**
 * How long an LPG cylinder lasts, from burner ratings and daily cooking time.
 *
 * The physics is exact rather than a rule of thumb. A gas burner's rating in
 * kilowatts is its heat *input*, so the mass of gas it burns follows directly
 * from the fuel's calorific value:
 *
 *   energy input per day (kJ) = sum(burner kW x hours) x 3600
 *   gas burned per day (kg)   = energy input / calorific value (kJ per kg)
 *   days per cylinder         = cylinder net weight / gas burned per day
 *
 * Burner efficiency does not change how fast the cylinder empties — it only
 * changes how much of that heat reaches the food, which is reported separately.
 */

/**
 * Net (lower) calorific value of commercial propane-butane LPG, in MJ/kg.
 * Commonly quoted as 46.1 MJ/kg, equivalent to about 12.8 kWh per kg.
 */
export const LPG_CALORIFIC_VALUE_MJ_PER_KG = 46.1;

/** Kilojoules per megajoule. */
const KJ_PER_MJ = 1000;

/** Seconds in an hour, converting kW-hours of input into kilojoules. */
const SECONDS_PER_HOUR = 3600;

/** Megajoules in a kilowatt-hour. */
const MJ_PER_KWH = 3.6;

/** Days per year, and the average month derived from it. */
export const DAYS_PER_YEAR = 365;
export const DAYS_PER_MONTH = DAYS_PER_YEAR / 12;

/**
 * Minimum thermal efficiency required of a domestic LPG stove by IS 4246,
 * the Indian standard for domestic gas stoves: 68%.
 */
export const BIS_MIN_STOVE_EFFICIENCY_PCT = 68;

/** Net LPG content of the cylinders sold in India, in kg. */
export const CYLINDER_SIZES = [
  { id: "5", kg: 5, label: "5 kg (small domestic / FTL)" },
  { id: "14.2", kg: 14.2, label: "14.2 kg (standard domestic)" },
  { id: "19", kg: 19, label: "19 kg (commercial)" },
  { id: "47.5", kg: 47.5, label: "47.5 kg (bulk commercial)" },
];

/**
 * Typical burner heat-input ratings on an Indian domestic hob. These are
 * nameplate input ratings, printed in the stove manual; override them if your
 * stove states different figures.
 */
export const BURNER_TYPES = [
  { id: "small", label: "Small / simmer burner", kw: 1.0, minutesPerDay: 20 },
  { id: "medium", label: "Medium burner", kw: 1.75, minutesPerDay: 60 },
  { id: "large", label: "Large / wok burner", kw: 3.0, minutesPerDay: 30 },
];

const MINUTES_PER_DAY = 1440;
const MAX_BURNER_KW = 20;
const MAX_BURNER_COUNT = 20;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Gas burned, in kg per hour, by a burner of the given heat input. */
export function kgPerHourForBurner(kw) {
  if (!isNum(kw) || kw < 0) return null;
  return (kw * SECONDS_PER_HOUR) / (LPG_CALORIFIC_VALUE_MJ_PER_KG * KJ_PER_MJ);
}

/** Parse a YYYY-MM-DD string into a UTC timestamp, or null. */
function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

/** Add whole days to a UTC timestamp and format back to YYYY-MM-DD. */
function addDaysIso(ms, days) {
  const result = new Date(ms + days * 86400000);
  const year = String(result.getUTCFullYear()).padStart(4, "0");
  const month = String(result.getUTCMonth() + 1).padStart(2, "0");
  const day = String(result.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * @param {object} input
 * @param {Array}  input.burners        [{ id, label, kw, count, minutesPerDay }]
 * @param {number} input.cylinderKg     Net LPG weight of the cylinder.
 * @param {number} [input.cylinderPrice] Refill price of one cylinder.
 * @param {number} [input.efficiencyPct] Stove thermal efficiency, %.
 * @param {string} [input.startDateIso] Date the cylinder was connected, YYYY-MM-DD.
 * @param {number} [input.bookingLeadDays] Days before empty you want to book.
 */
export function estimateCylinderLife({
  burners,
  cylinderKg,
  cylinderPrice = 0,
  efficiencyPct = BIS_MIN_STOVE_EFFICIENCY_PCT,
  startDateIso = "",
  bookingLeadDays = 3,
}) {
  if (!Array.isArray(burners) || burners.length === 0) {
    return { error: "Add at least one burner." };
  }
  if (!isNum(cylinderKg) || !isNum(cylinderPrice) || !isNum(efficiencyPct) || !isNum(bookingLeadDays)) {
    return { error: "Enter valid numbers for cylinder size, price, efficiency and lead time." };
  }
  if (cylinderKg <= 0) {
    return { error: "Cylinder weight must be greater than zero." };
  }
  if (cylinderPrice < 0) {
    return { error: "Cylinder price cannot be negative." };
  }
  if (efficiencyPct <= 0 || efficiencyPct > 100) {
    return { error: "Stove efficiency must be between 1% and 100%." };
  }
  if (bookingLeadDays < 0 || bookingLeadDays > 60) {
    return { error: "Booking lead time should be between 0 and 60 days." };
  }

  const rows = [];
  let dailyKwhInput = 0;

  for (const burner of burners) {
    const kw = Number(burner.kw);
    const count = Number(burner.count);
    const minutes = Number(burner.minutesPerDay);

    if (![kw, count, minutes].every(isNum)) {
      return { error: `Check the numbers entered for the ${burner.label}.` };
    }
    if (kw < 0 || count < 0 || minutes < 0) {
      return { error: `Values for the ${burner.label} cannot be negative.` };
    }
    if (kw > MAX_BURNER_KW) {
      return { error: `${MAX_BURNER_KW} kW is beyond a cooking burner — check the ${burner.label}.` };
    }
    if (count > MAX_BURNER_COUNT) {
      return { error: `More than ${MAX_BURNER_COUNT} of one burner type is not supported.` };
    }
    if (minutes > MINUTES_PER_DAY) {
      return { error: `The ${burner.label} cannot run for more than 24 hours a day.` };
    }

    const hours = minutes / 60;
    const kwhInput = kw * count * hours;
    const kgPerDay = (kwhInput * MJ_PER_KWH) / LPG_CALORIFIC_VALUE_MJ_PER_KG;
    dailyKwhInput += kwhInput;

    rows.push({
      id: burner.id,
      label: burner.label,
      kw,
      count,
      minutesPerDay: minutes,
      kwhInputPerDay: kwhInput,
      kgPerDay,
      kgPerHourEach: kgPerHourForBurner(kw),
      gramsPerHourEach: kgPerHourForBurner(kw) * 1000,
    });
  }

  const kgPerDay = (dailyKwhInput * MJ_PER_KWH) / LPG_CALORIFIC_VALUE_MJ_PER_KG;

  if (kgPerDay <= 0) {
    return { error: "Enter how many minutes a day at least one burner actually runs." };
  }

  const daysPerCylinder = cylinderKg / kgPerDay;
  const refillsPerYear = DAYS_PER_YEAR / daysPerCylinder;
  const pricePerKg = cylinderPrice / cylinderKg;

  const startMs = parseIsoDate(startDateIso);
  const wholeDays = Math.floor(daysPerCylinder);
  const emptyDateIso = startMs === null ? null : addDaysIso(startMs, wholeDays);
  const bookByDateIso =
    startMs === null ? null : addDaysIso(startMs, Math.max(0, wholeDays - Math.round(bookingLeadDays)));

  const efficiency = efficiencyPct / 100;

  return {
    rows,
    cylinderKg,
    cylinderPrice,
    kgPerDay,
    kgPerMonth: kgPerDay * DAYS_PER_MONTH,
    kgPerYear: kgPerDay * DAYS_PER_YEAR,
    daysPerCylinder,
    wholeDays,
    refillsPerYear,
    pricePerKg,
    costPerDay: kgPerDay * pricePerKg,
    costPerMonth: kgPerDay * DAYS_PER_MONTH * pricePerKg,
    costPerYear: refillsPerYear * cylinderPrice,
    dailyKwhInput,
    dailyKwhUseful: dailyKwhInput * efficiency,
    dailyKwhWasted: dailyKwhInput * (1 - efficiency),
    efficiencyPct,
    totalBurnerMinutes: rows.reduce((sum, row) => sum + row.minutesPerDay * row.count, 0),
    emptyDateIso,
    bookByDateIso,
    bookingLeadDays: Math.round(bookingLeadDays),
  };
}
