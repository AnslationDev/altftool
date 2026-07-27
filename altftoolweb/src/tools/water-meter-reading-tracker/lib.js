/**
 * Water meter reading log: consumption per period, litres per person per day, trend and
 * leak signals.
 *
 * A domestic water meter is a cumulative counter. Consumption over a period is simply the
 * difference between two readings, and the useful figures come from dividing that by the
 * days elapsed and the number of people in the house:
 *
 *   litres per day        = (reading_now - reading_before) x litres per unit / days elapsed
 *   litres per capita/day = litres per day / people      (the "lpcd" utilities plan against)
 *
 * The leak test is the standard one plumbers use in arithmetic form: water use has a floor
 * that should not move much month to month, so a period that jumps well above the household's
 * own median, or a reading taken while nobody used water that still advanced, points at a leak
 * rather than at behaviour.
 *
 * All maths is pure — dates come in as YYYY-MM-DD strings and are parsed as calendar days.
 */

/** A kilolitre is a cubic metre, which is 1000 litres. Most domestic meters count in kL/m3. */
export const LITRES_PER_KILOLITRE = 1000;

export const METER_UNITS = [
  { value: "kl", label: "Kilolitres (m³) — the usual domestic dial", litres: LITRES_PER_KILOLITRE },
  { value: "l", label: "Litres", litres: 1 },
];

/**
 * Design figure from India's CPHEEO Manual on Water Supply and Treatment: 135 litres per
 * capita per day for towns with piped supply and full sewerage, and 70 lpcd where there is
 * piped supply without sewerage. Used here only as a yardstick, not a limit.
 */
export const CPHEEO_LPCD_WITH_SEWERAGE = 135;
export const CPHEEO_LPCD_WITHOUT_SEWERAGE = 70;

/** A period more than 30% above the household's own median flags as unusual. */
export const SPIKE_RATIO = 1.3;

/** A tap dripping about once a second loses roughly this much in a day. */
export const DRIPPING_TAP_LITRES_PER_DAY = 15;
/** A leaking toilet flapper is the big one — a continuously seeping cistern in this range. */
export const LEAKING_CISTERN_LITRES_PER_DAY = 200;

/** Days used to state a monthly projection. */
export const DAYS_PER_MONTH = 30;

const MS_PER_DAY = 86400000;

/**
 * Parse a YYYY-MM-DD calendar date to a UTC timestamp. Returns null when unparseable.
 * Pure: no reliance on the local clock or timezone.
 */
export function parseDay(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

/** Median of a numeric array. Returns 0 for an empty array. */
export function median(values) {
  const sorted = values.filter((v) => Number.isFinite(v)).slice().sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * @param {object} input
 * @param {{date:string,value:number}[]} input.readings meter log, oldest first
 * @returns {{error:string}|object}
 */
export function analyseWaterReadings({
  readings,
  householdSize = 1,
  unit = "kl",
  tariffPerUnit = 0,
  fixedMonthlyCharge = 0,
  benchmarkLpcd = CPHEEO_LPCD_WITH_SEWERAGE,
}) {
  if (!Array.isArray(readings) || readings.length < 2) {
    return { error: "Add at least two readings — consumption is the difference between them." };
  }
  if (readings.length > 60) {
    return { error: "Track up to 60 readings at a time." };
  }
  if (typeof householdSize !== "number" || !Number.isFinite(householdSize) || householdSize < 1) {
    return { error: "Household size must be at least 1 person." };
  }
  if (householdSize > 100) {
    return { error: "Household size must be 100 people or fewer." };
  }
  const unitDef = METER_UNITS.find((u) => u.value === unit) ?? METER_UNITS[0];
  if (
    typeof tariffPerUnit !== "number" ||
    !Number.isFinite(tariffPerUnit) ||
    tariffPerUnit < 0 ||
    typeof fixedMonthlyCharge !== "number" ||
    !Number.isFinite(fixedMonthlyCharge) ||
    fixedMonthlyCharge < 0
  ) {
    return { error: "Tariff and fixed charge must be zero or a positive number." };
  }
  if (
    typeof benchmarkLpcd !== "number" ||
    !Number.isFinite(benchmarkLpcd) ||
    benchmarkLpcd <= 0
  ) {
    return { error: "The litres-per-person benchmark must be greater than zero." };
  }

  const parsed = [];
  for (let i = 0; i < readings.length; i += 1) {
    const entry = readings[i] ?? {};
    const day = parseDay(entry.date);
    if (day === null) {
      return { error: `Reading ${i + 1} needs a valid date in YYYY-MM-DD form.` };
    }
    const value = typeof entry.value === "number" ? entry.value : NaN;
    if (!Number.isFinite(value) || value < 0) {
      return { error: `Reading ${i + 1} needs a meter value of zero or more.` };
    }
    parsed.push({ day, date: entry.date, value, note: entry.note ?? "" });
  }

  const periods = [];
  for (let i = 1; i < parsed.length; i += 1) {
    const prev = parsed[i - 1];
    const curr = parsed[i];
    const days = (curr.day - prev.day) / MS_PER_DAY;
    if (days <= 0) {
      return { error: `Reading ${i + 1} must be dated after reading ${i}.` };
    }
    if (curr.value < prev.value) {
      return {
        error: `Reading ${i + 1} is lower than reading ${i}. A meter only counts up — check for a typo or a replaced meter.`,
      };
    }
    const consumedUnits = curr.value - prev.value;
    const litres = consumedUnits * unitDef.litres;
    const litresPerDay = litres / days;
    const lpcd = litresPerDay / householdSize;
    periods.push({
      from: prev.date,
      to: curr.date,
      days,
      consumedUnits,
      litres,
      litresPerDay,
      lpcd,
      cost: consumedUnits * tariffPerUnit,
    });
  }

  const totalUnits = periods.reduce((sum, p) => sum + p.consumedUnits, 0);
  const totalLitres = totalUnits * unitDef.litres;
  const totalDays = periods.reduce((sum, p) => sum + p.days, 0);
  const avgLitresPerDay = totalLitres / totalDays;
  const avgLpcd = avgLitresPerDay / householdSize;

  const latest = periods[periods.length - 1];
  const earlier = periods.slice(0, -1);
  const baselineLpd = earlier.length > 0 ? median(earlier.map((p) => p.litresPerDay)) : 0;
  const changePct =
    earlier.length > 0 && baselineLpd > 0
      ? ((latest.litresPerDay - baselineLpd) / baselineLpd) * 100
      : null;

  let trend = "not enough history";
  if (changePct !== null) {
    if (changePct > 10) trend = "rising";
    else if (changePct < -10) trend = "falling";
    else trend = "steady";
  }

  const projectedMonthlyUnits = (avgLitresPerDay * DAYS_PER_MONTH) / unitDef.litres;
  const projectedMonthlyCost = projectedMonthlyUnits * tariffPerUnit + fixedMonthlyCharge;

  const leakSignals = [];
  if (changePct !== null && latest.litresPerDay > baselineLpd * SPIKE_RATIO) {
    const extraPerDay = latest.litresPerDay - baselineLpd;
    leakSignals.push(
      `The latest period runs ${extraPerDay.toFixed(0)} litres a day above this household's own median — about ${Math.round(extraPerDay / DRIPPING_TAP_LITRES_PER_DAY)} dripping taps' worth. Close every outlet, note the meter, wait an hour and read it again: any movement is a leak.`,
    );
  }
  if (avgLitresPerDay >= LEAKING_CISTERN_LITRES_PER_DAY && avgLpcd > benchmarkLpcd * 1.5) {
    leakSignals.push(
      `Average use of ${avgLpcd.toFixed(0)} lpcd is more than half again the ${benchmarkLpcd} lpcd planning figure. A continuously seeping toilet cistern alone accounts for roughly ${LEAKING_CISTERN_LITRES_PER_DAY} litres a day — add dye to the cistern and check whether it reaches the bowl unflushed.`,
    );
  }
  const zeroPeriods = periods.filter((p) => p.consumedUnits === 0).length;
  if (zeroPeriods > 0) {
    leakSignals.push(
      `${zeroPeriods} period${zeroPeriods === 1 ? "" : "s"} recorded no movement at all. Confirm the meter is not stuck before trusting the averages.`,
    );
  }

  return {
    unitLabel: unitDef.value === "kl" ? "kL" : "L",
    litresPerUnit: unitDef.litres,
    periods,
    totalUnits,
    totalLitres,
    totalDays,
    avgLitresPerDay,
    avgLpcd,
    benchmarkLpcd,
    benchmarkRatio: avgLpcd / benchmarkLpcd,
    latest,
    baselineLpd,
    changePct,
    trend,
    projectedMonthlyUnits,
    projectedMonthlyCost,
    totalCost: periods.reduce((sum, p) => sum + p.cost, 0),
    leakSignals,
  };
}
