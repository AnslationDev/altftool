/**
 * Depreciation on creator equipment, three standard accounting methods.
 *
 *  Straight line
 *    annual = (cost - salvage) / usefulLifeYears
 *
 *  Declining balance (factor 2 is the common "double declining balance")
 *    rate   = factor / usefulLifeYears
 *    year n = opening book value x rate,  never taking book value below salvage
 *
 *  Sum of the years' digits
 *    SYD    = n(n + 1) / 2
 *    year k = (n - k + 1) / SYD x (cost - salvage)
 *
 * All three write off exactly (cost - salvage) over the life; they differ only in
 * how fast. Declining balance and sum-of-years front-load the charge, which
 * matches how fast camera bodies and computers actually lose resale value.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

export const DEPRECIATION_METHODS = [
  {
    key: "straight-line",
    label: "Straight line",
    blurb: "Same charge every year. Simplest and the usual default for budgeting.",
  },
  {
    key: "declining-balance",
    label: "Declining balance",
    blurb: "A fixed percentage of the remaining book value — front-loaded, like real resale prices.",
  },
  {
    key: "sum-of-years",
    label: "Sum of the years' digits",
    blurb: "Front-loaded too, but it always finishes exactly at the salvage value.",
  },
];

/** Factor 2 gives the widely used double-declining-balance rate. */
export const DEFAULT_DECLINING_FACTOR = 2;

export const MAX_LIFE_YEARS = 40;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @returns {{rows: Array, error?: string}} one row per year of the useful life.
 */
export function buildDepreciationSchedule({
  cost,
  salvageValue = 0,
  usefulLifeYears,
  method = "straight-line",
  decliningFactor = DEFAULT_DECLINING_FACTOR,
}) {
  if (!isNum(cost) || !isNum(salvageValue) || !isNum(usefulLifeYears) || !isNum(decliningFactor)) {
    return { error: "Enter numbers for cost, salvage value and useful life." };
  }
  if (cost <= 0) return { error: "Purchase price must be greater than zero." };
  if (salvageValue < 0) return { error: "Salvage value cannot be negative." };
  if (salvageValue >= cost) {
    return { error: "Salvage value must be lower than the purchase price." };
  }
  if (usefulLifeYears < 1 || usefulLifeYears > MAX_LIFE_YEARS) {
    return { error: `Useful life should be between 1 and ${MAX_LIFE_YEARS} years.` };
  }
  if (!DEPRECIATION_METHODS.some((item) => item.key === method)) {
    return { error: "Choose one of the three depreciation methods." };
  }
  if (method === "declining-balance" && (decliningFactor <= 0 || decliningFactor > 5)) {
    return { error: "Declining balance factor should be between 0 and 5." };
  }

  const life = Math.round(usefulLifeYears);
  const depreciable = cost - salvageValue;
  const syd = (life * (life + 1)) / 2;
  const decliningRate = decliningFactor / life;

  const rows = [];
  let opening = cost;
  let accumulated = 0;

  for (let year = 1; year <= life; year += 1) {
    let charge;
    if (method === "straight-line") {
      charge = depreciable / life;
    } else if (method === "sum-of-years") {
      charge = ((life - year + 1) / syd) * depreciable;
    } else {
      charge = opening * decliningRate;
    }

    // Book value can never fall below salvage under any method.
    const room = opening - salvageValue;
    if (charge > room) charge = room;
    if (charge < 0) charge = 0;

    const closing = opening - charge;
    accumulated += charge;
    rows.push({
      year,
      opening,
      depreciation: charge,
      accumulated,
      closing,
      lossPercentOfCost: (charge / cost) * 100,
    });
    opening = closing;
  }

  return {
    rows,
    cost,
    salvageValue,
    life,
    method,
    depreciable,
    decliningRate: method === "declining-balance" ? decliningRate : null,
    totalDepreciation: accumulated,
    endingBookValue: opening,
    averageAnnual: accumulated / life,
    firstYear: rows[0].depreciation,
  };
}

/**
 * What one year of ownership costs per shoot, once depreciation, maintenance
 * and insurance are all divided by the shoots you actually do.
 */
export function costPerShoot({
  annualDepreciation,
  annualMaintenance = 0,
  annualInsurance = 0,
  shootsPerYear,
}) {
  if (
    !isNum(annualDepreciation) ||
    !isNum(annualMaintenance) ||
    !isNum(annualInsurance) ||
    !isNum(shootsPerYear)
  ) {
    return { error: "Enter numbers for the annual costs and shoots per year." };
  }
  if (annualDepreciation < 0 || annualMaintenance < 0 || annualInsurance < 0) {
    return { error: "Annual costs cannot be negative." };
  }
  if (shootsPerYear < 1) {
    return { error: "Enter at least 1 shoot a year to spread the cost over." };
  }
  if (shootsPerYear > 3650) return { error: "Keep shoots per year under 3,650." };

  const annualTotal = annualDepreciation + annualMaintenance + annualInsurance;
  return {
    annualTotal,
    perShoot: annualTotal / shootsPerYear,
    depreciationPerShoot: annualDepreciation / shootsPerYear,
    runningPerShoot: (annualMaintenance + annualInsurance) / shootsPerYear,
    shootsPerYear: Math.round(shootsPerYear),
  };
}

/**
 * Book value after a whole number of years, read straight off the schedule.
 */
export function bookValueAfter(schedule, years) {
  if (!schedule || schedule.error || !Array.isArray(schedule.rows)) {
    return { error: "Build a valid schedule first." };
  }
  if (!isNum(years) || years < 0) return { error: "Years must be zero or more." };
  const whole = Math.floor(years);
  if (whole === 0) return { value: schedule.cost, years: 0, lostSoFar: 0 };
  const row = schedule.rows[Math.min(whole, schedule.rows.length) - 1];
  return {
    value: whole >= schedule.rows.length ? schedule.endingBookValue : row.closing,
    years: whole,
    lostSoFar: round2(schedule.cost - (whole >= schedule.rows.length ? schedule.endingBookValue : row.closing)),
  };
}
