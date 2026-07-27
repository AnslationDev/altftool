/**
 * Piped natural gas (PNG) meter log: consumption per period, the next bill estimated on a
 * telescopic slab tariff, and the LPG-cylinder equivalent of what you burn.
 *
 * A domestic PNG meter counts standard cubic metres (SCM). Consumption over a period is the
 * difference between two readings; dividing by the days elapsed gives SCM per day, which is
 * the only figure that compares fairly across billing cycles of different length.
 *
 * Indian city gas distributors bill domestic PNG on a telescopic slab structure — the first
 * block of SCM at one rate, the next block at a higher rate, and so on — plus a fixed charge
 * per cycle. Domestic PNG sits outside GST and attracts state VAT, which varies by state, so
 * the tax rate here is an input rather than a constant. Every rate is editable because tariff
 * cards differ by distributor and are revised regularly: take yours from your latest bill.
 */

/** Most Indian distributors bill domestic PNG every two months. */
export const DEFAULT_CYCLE_DAYS = 60;

/**
 * Approximate gross calorific values used for the LPG comparison. Natural gas is commonly
 * billed at around 9,300-9,500 kcal per standard cubic metre, and LPG carries roughly
 * 11,000 kcal per kilogram, which is why one 14.2 kg domestic cylinder is usually quoted as
 * a little under 17 SCM of PNG.
 */
export const PNG_KCAL_PER_SCM = 9350;
export const LPG_KCAL_PER_KG = 11000;
/** Standard Indian domestic LPG cylinder. */
export const LPG_CYLINDER_KG = 14.2;

/**
 * Starting-point slab structure per billing cycle. These are order-of-magnitude figures for
 * a domestic connection, NOT a published tariff — replace each rate with the one printed on
 * your own bill.
 */
export const DEFAULT_SLABS = [
  { upTo: 30, rate: 48 },
  { upTo: 60, rate: 52 },
  { upTo: null, rate: 56 },
];

/** A period more than 25% above the household's own median is worth a second look. */
export const SPIKE_RATIO = 1.25;

const MS_PER_DAY = 86400000;

/**
 * Parse a YYYY-MM-DD calendar date to a UTC timestamp, or null if invalid.
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

/** Median of a numeric array; 0 when empty. */
export function median(values) {
  const sorted = values.filter((v) => Number.isFinite(v)).slice().sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Telescopic slab charge: each block of consumption is billed at its own rate, so crossing a
 * slab boundary only reprices the units above it, not the whole bill.
 *
 * @param {number} units SCM consumed in the cycle
 * @param {{upTo:number|null,rate:number}[]} slabs ascending; the last entry must have upTo null
 * @returns {{error:string}|{rows:object[],total:number}}
 */
export function slabCharge(units, slabs) {
  if (typeof units !== "number" || !Number.isFinite(units) || units < 0) {
    return { error: "Consumption for the slab charge must be zero or more." };
  }
  if (!Array.isArray(slabs) || slabs.length === 0) {
    return { error: "Add at least one tariff slab." };
  }
  const rows = [];
  let lower = 0;
  let total = 0;
  for (let i = 0; i < slabs.length; i += 1) {
    const slab = slabs[i];
    const isLast = i === slabs.length - 1;
    const upper = slab.upTo === null || slab.upTo === undefined ? Infinity : slab.upTo;
    if (typeof slab.rate !== "number" || !Number.isFinite(slab.rate) || slab.rate < 0) {
      return { error: `Slab ${i + 1} needs a rate of zero or more.` };
    }
    if (!isLast && (!Number.isFinite(upper) || upper <= lower)) {
      return { error: `Slab ${i + 1} must end above ${lower} SCM.` };
    }
    const inSlab = Math.max(0, Math.min(units, upper) - lower);
    const amount = inSlab * slab.rate;
    rows.push({
      from: lower,
      to: Number.isFinite(upper) ? upper : null,
      units: inSlab,
      rate: slab.rate,
      amount,
    });
    total += amount;
    lower = upper;
    if (!Number.isFinite(upper)) break;
  }
  if (units > lower && Number.isFinite(lower)) {
    return { error: "The last slab must be open-ended so every unit is priced." };
  }
  return { rows, total };
}

/**
 * @param {object} input
 * @param {{date:string,value:number}[]} input.readings meter log in SCM, oldest first
 * @returns {{error:string}|object}
 */
export function analyseGasReadings({
  readings,
  slabs = DEFAULT_SLABS,
  fixedChargePerCycle = 0,
  taxPercent = 0,
  cycleDays = DEFAULT_CYCLE_DAYS,
  peopleInHome = 1,
}) {
  if (!Array.isArray(readings) || readings.length < 2) {
    return { error: "Add at least two readings — consumption is the difference between them." };
  }
  if (readings.length > 60) {
    return { error: "Track up to 60 readings at a time." };
  }
  if (
    typeof fixedChargePerCycle !== "number" ||
    !Number.isFinite(fixedChargePerCycle) ||
    fixedChargePerCycle < 0
  ) {
    return { error: "The fixed charge must be zero or a positive number." };
  }
  if (typeof taxPercent !== "number" || !Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
    return { error: "Tax must be between 0% and 100%." };
  }
  if (typeof cycleDays !== "number" || !Number.isFinite(cycleDays) || cycleDays < 1 || cycleDays > 366) {
    return { error: "The billing cycle must be between 1 and 366 days." };
  }
  if (typeof peopleInHome !== "number" || !Number.isFinite(peopleInHome) || peopleInHome < 1) {
    return { error: "Household size must be at least 1 person." };
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
    parsed.push({ day, date: entry.date, value });
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
        error: `Reading ${i + 1} is lower than reading ${i}. A gas meter only counts up — check for a typo or a meter change.`,
      };
    }
    const scm = curr.value - prev.value;
    periods.push({
      from: prev.date,
      to: curr.date,
      days,
      scm,
      scmPerDay: scm / days,
      scmPerPersonPerDay: scm / days / peopleInHome,
    });
  }

  const totalScm = periods.reduce((sum, p) => sum + p.scm, 0);
  const totalDays = periods.reduce((sum, p) => sum + p.days, 0);
  const avgScmPerDay = totalScm / totalDays;

  const latest = periods[periods.length - 1];
  const earlier = periods.slice(0, -1);
  const baselinePerDay = earlier.length > 0 ? median(earlier.map((p) => p.scmPerDay)) : 0;
  const changePct =
    earlier.length > 0 && baselinePerDay > 0
      ? ((latest.scmPerDay - baselinePerDay) / baselinePerDay) * 100
      : null;

  let trend = "not enough history";
  if (changePct !== null) {
    if (changePct > 10) trend = "rising";
    else if (changePct < -10) trend = "falling";
    else trend = "steady";
  }

  // The next bill is projected from the recent run rate, which tracks a change in habits
  // faster than the long-run average does.
  const projectedScm = latest.scmPerDay * cycleDays;
  const charge = slabCharge(projectedScm, slabs);
  if (charge.error) return { error: charge.error };

  const energyCharge = charge.total;
  const beforeTax = energyCharge + fixedChargePerCycle;
  const tax = beforeTax * (taxPercent / 100);
  const billTotal = beforeTax + tax;
  const costPerScm = projectedScm > 0 ? billTotal / projectedScm : 0;
  const costPerDay = billTotal / cycleDays;

  const lpgKgEquivalent = (projectedScm * PNG_KCAL_PER_SCM) / LPG_KCAL_PER_KG;
  const cylinderEquivalent = lpgKgEquivalent / LPG_CYLINDER_KG;

  const notes = [];
  if (changePct !== null && latest.scmPerDay > baselinePerDay * SPIKE_RATIO) {
    notes.push(
      `The latest period runs ${(((latest.scmPerDay - baselinePerDay) / baselinePerDay) * 100).toFixed(0)}% above your own median. Cooking habits, a geyser switched to gas, or a burner left on low all show up this way — a gas leak usually smells before it shows on the meter, but if you suspect one, close the meter valve and call the emergency number rather than investigating yourself.`,
    );
  }
  const zeroPeriods = periods.filter((p) => p.scm === 0).length;
  if (zeroPeriods > 0) {
    notes.push(
      `${zeroPeriods} period${zeroPeriods === 1 ? "" : "s"} show no movement. Check the meter is not stuck or the reading not simply repeated.`,
    );
  }
  if (earlier.length === 0) {
    notes.push(
      "With one period logged the projection is just that period's run rate. Add more readings for a trend.",
    );
  }
  const topSlab = charge.rows[charge.rows.length - 1];
  if (topSlab && topSlab.units > 0 && charge.rows.length > 1) {
    notes.push(
      `${topSlab.units.toFixed(1)} SCM of the projected cycle falls in the highest slab at the top rate. Only those units are repriced — slabs are telescopic, so crossing a boundary does not reprice the whole bill.`,
    );
  }

  return {
    periods,
    totalScm,
    totalDays,
    avgScmPerDay,
    latest,
    baselinePerDay,
    changePct,
    trend,
    cycleDays,
    projectedScm,
    slabRows: charge.rows,
    energyCharge,
    fixedChargePerCycle,
    tax,
    taxPercent,
    billTotal,
    costPerScm,
    costPerDay,
    lpgKgEquivalent,
    cylinderEquivalent,
    notes,
  };
}
