/**
 * Startup runway and burn rate model.
 *
 * Definitions used (standard venture finance):
 *   Gross burn = total operating cash going out in a month.
 *   Net burn   = gross burn - cash revenue collected in that month.
 *   Runway     = months until the cash balance reaches zero. With flat numbers
 *                this is simply cash / net burn; with growth it has to be walked
 *                month by month, which is what this model does.
 *   Break-even = the first month in which revenue covers expenses, so net burn
 *                turns negative and the company stops consuming cash.
 *   Burn multiple (David Sacks, 2020) = net cash burned over a window divided by
 *                the net new ARR added in that window. Under 1x is exceptional,
 *                1x-1.5x great, 1.5x-2x good, over 3x is a warning sign.
 *   Default alive / default dead (Paul Graham, 2015) = whether the current
 *                growth trajectory reaches break-even before the cash runs out.
 */

/** Window used for the burn multiple, in months. */
export const BURN_MULTIPLE_WINDOW_MONTHS = 12;

/** Longest projection the model will walk. */
export const MAX_HORIZON_MONTHS = 120;

/** Months of runway below which most boards start a fundraise. */
export const FUNDRAISE_TRIGGER_MONTHS = 6;

/** Runway a freshly closed round is normally sized to buy. */
export const HEALTHY_RUNWAY_MONTHS = 18;

/** Burn multiple bands from the original framework. */
export const BURN_MULTIPLE_BANDS = [
  { max: 1, label: "Amazing" },
  { max: 1.5, label: "Great" },
  { max: 2, label: "Good" },
  { max: 3, label: "Suspect" },
  { max: Infinity, label: "Bad" },
];

export function burnMultipleBand(value) {
  if (!Number.isFinite(value) || value <= 0) return "Not burning";
  return (BURN_MULTIPLE_BANDS.find((band) => value <= band.max) || BURN_MULTIPLE_BANDS[4]).label;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseIsoDate(iso) {
  if (typeof iso !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return NaN;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const ts = Date.UTC(year, month - 1, day);
  const back = new Date(ts);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return NaN;
  }
  return ts;
}

export function formatIsoDate(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Add whole months, clamping to the last valid day (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(ts, months) {
  const d = new Date(ts);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  const targetMonth = month + months;
  const lastDay = new Date(Date.UTC(year, targetMonth + 1, 0)).getUTCDate();
  return Date.UTC(year, targetMonth, Math.min(day, lastDay));
}

/**
 * Walk the cash balance month by month.
 *
 * @param {object} input
 * @param {number} input.cash                 Cash in the bank today, INR.
 * @param {number} input.monthlyRevenue       Cash revenue collected this month, INR.
 * @param {number} input.monthlyExpenses      Gross monthly cash outflow, INR.
 * @param {number} input.revenueGrowthPercent Month-on-month revenue growth, %.
 * @param {number} input.expenseGrowthPercent Month-on-month cost growth, %.
 * @param {number} input.horizonMonths        How far to project (1-120).
 * @param {string} [input.startIso]           YYYY-MM-DD of month 1, for a cash-out date.
 * @returns {object} projection or { error }
 */
export function projectRunway({
  cash,
  monthlyRevenue,
  monthlyExpenses,
  revenueGrowthPercent = 0,
  expenseGrowthPercent = 0,
  horizonMonths = 36,
  startIso = "",
}) {
  const nums = [
    cash,
    monthlyRevenue,
    monthlyExpenses,
    revenueGrowthPercent,
    expenseGrowthPercent,
    horizonMonths,
  ];
  if (nums.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (cash < 0) return { error: "Cash in the bank cannot be negative." };
  if (monthlyRevenue < 0) return { error: "Monthly revenue cannot be negative." };
  if (monthlyExpenses < 0) return { error: "Monthly expenses cannot be negative." };
  if (revenueGrowthPercent < -100 || revenueGrowthPercent > 200) {
    return { error: "Revenue growth should be between -100% and 200% a month." };
  }
  if (expenseGrowthPercent < -100 || expenseGrowthPercent > 200) {
    return { error: "Expense growth should be between -100% and 200% a month." };
  }
  const horizon = Math.round(horizonMonths);
  if (horizon < 1 || horizon > MAX_HORIZON_MONTHS) {
    return { error: `Project between 1 and ${MAX_HORIZON_MONTHS} months.` };
  }

  const g = revenueGrowthPercent / 100;
  const e = expenseGrowthPercent / 100;

  const rows = [];
  let balance = cash;
  let runwayMonths = null;
  let breakEvenMonth = null;
  let minCash = cash;
  let minCashMonth = 0;
  let cumulativeBurnWindow = 0;
  let revenueAtWindowEnd = monthlyRevenue;

  for (let month = 1; month <= horizon; month += 1) {
    const revenue = monthlyRevenue * Math.pow(1 + g, month - 1);
    const expenses = monthlyExpenses * Math.pow(1 + e, month - 1);
    const netBurn = expenses - revenue;
    const opening = balance;
    balance = opening - netBurn;

    if (breakEvenMonth === null && netBurn <= 0) breakEvenMonth = month;
    if (balance < minCash) {
      minCash = balance;
      minCashMonth = month;
    }
    if (month <= BURN_MULTIPLE_WINDOW_MONTHS) {
      cumulativeBurnWindow += netBurn;
      revenueAtWindowEnd = revenue;
    }
    if (runwayMonths === null && balance < 0) {
      // Fraction of this month the opening balance could still fund.
      runwayMonths = month - 1 + (netBurn > 0 ? opening / netBurn : 0);
    }

    rows.push({
      month,
      revenue,
      expenses,
      netBurn,
      grossBurn: expenses,
      closing: balance,
      profitable: netBurn <= 0,
    });
  }

  const simpleNetBurn = monthlyExpenses - monthlyRevenue;
  const simpleRunway = simpleNetBurn > 0 ? cash / simpleNetBurn : null;

  const arrAdded = (revenueAtWindowEnd - monthlyRevenue) * 12;
  const burnMultiple =
    cumulativeBurnWindow > 0 && arrAdded > 0 ? cumulativeBurnWindow / arrAdded : null;

  const survives = runwayMonths === null;
  const reachesBreakEven = breakEvenMonth !== null;
  const defaultAlive =
    simpleNetBurn <= 0 || (reachesBreakEven && (survives || breakEvenMonth <= runwayMonths));

  const fundingGap = minCash < 0 ? -minCash : 0;

  let cashOutDate = null;
  if (runwayMonths !== null && startIso) {
    const ts = parseIsoDate(startIso);
    if (Number.isNaN(ts)) {
      return { error: "Enter the start date as a real calendar date, or leave it blank." };
    }
    cashOutDate = formatIsoDate(addMonths(ts, Math.floor(runwayMonths)));
  }

  return {
    rows,
    horizon,
    grossBurn: monthlyExpenses,
    netBurn: simpleNetBurn,
    simpleRunway,
    runwayMonths,
    survives,
    breakEvenMonth,
    reachesBreakEven,
    defaultAlive,
    burnMultiple,
    burnMultipleBandLabel: burnMultipleBand(burnMultiple),
    arrAdded,
    cumulativeBurnWindow,
    minCash,
    minCashMonth,
    fundingGap,
    cashOutDate,
    endingCash: rows.length > 0 ? rows[rows.length - 1].closing : cash,
    needsFundraise: runwayMonths !== null && runwayMonths < FUNDRAISE_TRIGGER_MONTHS,
  };
}

/** Cash a round must add to buy a target number of months at the current net burn. */
export function raiseForRunway(netBurn, targetMonths, currentRunway) {
  if (![netBurn, targetMonths, currentRunway].every((n) => typeof n === "number" && Number.isFinite(n))) {
    return { error: "Enter valid numbers to size the round." };
  }
  if (netBurn <= 0) return { amount: 0, note: "You are cash-flow positive — no round is needed for runway." };
  if (targetMonths <= 0) return { error: "Target runway must be more than zero months." };
  const shortfall = Math.max(0, targetMonths - Math.max(0, currentRunway));
  return { amount: shortfall * netBurn, shortfallMonths: shortfall };
}

const DAYS_IN_MONTH = 30.4375; // 365.25 / 12, used only to describe part-months
export function monthsToLabel(months) {
  if (!Number.isFinite(months)) return "—";
  const whole = Math.floor(months);
  const days = Math.round((months - whole) * DAYS_IN_MONTH);
  if (days <= 0) return `${whole} month${whole === 1 ? "" : "s"}`;
  return `${whole} month${whole === 1 ? "" : "s"} ${days} day${days === 1 ? "" : "s"}`;
}
