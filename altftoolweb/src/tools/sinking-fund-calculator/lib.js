/**
 * Sinking funds for known, irregular expenses.
 *
 * A sinking fund converts a lumpy bill you can see coming — an annual insurance premium,
 * a two-yearly service, a festival, a holiday — into a level monthly reserve. Two distinct
 * figures matter, and confusing them is the usual mistake:
 *
 *   1. CATCH-UP, until the next occurrence. You have n months and whatever is already set
 *      aside, so the monthly deposit is the sinking-fund (ordinary annuity) payment
 *
 *          payment = shortfall x i / ((1 + i)^n - 1)      when the reserve earns i a month
 *          payment = shortfall / n                        when it earns nothing
 *
 *      where shortfall = amount due - existing reserve grown for n months.
 *
 *   2. STEADY STATE, from then on. Once the fund is empty again you have the full cycle
 *      length P to rebuild it, so the ongoing monthly reserve uses P in place of n.
 *
 * The catch-up figure is usually the higher of the two, and it is the one your budget has
 * to survive this year. The steady-state figure is what the expense really costs a month.
 */

/** How often an expense repeats, in months. A one-off has no repeat cycle. */
export const FREQUENCIES = [
  { value: "oneOff", label: "One-off", months: 0 },
  { value: "monthly", label: "Every month", months: 1 },
  { value: "quarterly", label: "Every 3 months", months: 3 },
  { value: "halfYearly", label: "Every 6 months", months: 6 },
  { value: "annual", label: "Every year", months: 12 },
  { value: "twoYearly", label: "Every 2 years", months: 24 },
  { value: "fiveYearly", label: "Every 5 years", months: 60 },
];

/** Sinking funds hold near-term money, so the assumed return is deliberately capped low. */
export const MAX_ANNUAL_RATE_PCT = 12;
export const MAX_MONTHS_UNTIL_DUE = 240;
/** Above this share of income, irregular expenses are crowding out everything else. */
export const INCOME_SHARE_WARNING_PCT = 25;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round2 = (value) => Math.round(value * 100) / 100;

const frequencyMonths = (value) => {
  const found = FREQUENCIES.find((item) => item.value === value);
  return found ? found.months : null;
};

/** Level payment that grows to `target` over `months` at monthly rate `rate`. */
function sinkingPayment(target, months, rate) {
  if (!(target > 0)) return 0;
  if (!(months > 0)) return null;
  if (rate <= 0) return target / months;
  return (target * rate) / (Math.pow(1 + rate, months) - 1);
}

/**
 * @param {object} input
 * @param {Array} input.items Expenses to reserve for.
 * @param {number|string} [input.annualRate] Return on the reserve, % per year.
 * @param {number|string} [input.monthlyIncome] Take-home income, to size the burden.
 */
export function computeSinkingFunds({ items = [], annualRate = 0, monthlyIncome = 0 } = {}) {
  const rate = toNumber(annualRate);
  const income = toNumber(monthlyIncome);

  if (Number.isNaN(rate) || Number.isNaN(income)) {
    return { error: "Enter a valid interest rate and monthly income." };
  }
  if (rate < 0 || income < 0) return { error: "Rate and income cannot be negative." };
  if (rate > MAX_ANNUAL_RATE_PCT) {
    return {
      error: `Money you will spend within months should not be assumed to earn more than ${MAX_ANNUAL_RATE_PCT}% a year.`,
    };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one expense to reserve for." };
  }

  const monthlyRate = rate / 12 / 100;
  const rows = [];
  let totalCatchUp = 0;
  let totalSteady = 0;
  let totalAnnualised = 0;
  let totalOneOff = 0;
  let totalReserved = 0;
  let totalTarget = 0;

  for (const item of items) {
    const name = (item && item.name && String(item.name).trim()) || "Expense";
    const amount = toNumber(item && item.amount);
    const months = toNumber(item && item.monthsUntilDue);
    const saved = toNumber(item && item.alreadySaved);
    const cycle = frequencyMonths(item && item.frequency);

    if ([amount, months, saved].some((value) => Number.isNaN(value))) {
      return { error: `Enter valid numbers for ${name}.` };
    }
    if (amount < 0 || months < 0 || saved < 0) {
      return { error: `Values for ${name} cannot be negative.` };
    }
    if (cycle === null) return { error: `Choose how often ${name} repeats.` };
    if (months > MAX_MONTHS_UNTIL_DUE) {
      return { error: `${name} is more than ${MAX_MONTHS_UNTIL_DUE} months away — plan it separately.` };
    }
    if (amount === 0) continue;

    const grownReserve = saved * Math.pow(1 + monthlyRate, months);
    const shortfall = Math.max(0, amount - grownReserve);
    const surplus = Math.max(0, grownReserve - amount);

    if (shortfall > 0.005 && months === 0) {
      return {
        error: `${name} is due now and the reserve does not cover it — there is no time left to save for it.`,
      };
    }

    const catchUp = shortfall > 0.005 ? sinkingPayment(shortfall, months, monthlyRate) : 0;
    const steady = cycle > 0 ? sinkingPayment(amount, cycle, monthlyRate) : 0;
    const annualised = cycle > 0 ? (amount * 12) / cycle : 0;

    totalCatchUp += catchUp || 0;
    totalSteady += steady || 0;
    totalAnnualised += annualised;
    if (cycle === 0) totalOneOff += amount;
    totalReserved += saved;
    totalTarget += amount;

    rows.push({
      name,
      amount: round0(amount),
      monthsUntilDue: round0(months),
      cycleMonths: cycle,
      alreadySaved: round0(saved),
      grownReserve: round0(grownReserve),
      shortfall: round0(shortfall),
      surplus: round0(surplus),
      fundedPct: amount > 0 ? round2(Math.min(100, (grownReserve / amount) * 100)) : 0,
      catchUpMonthly: catchUp === null ? null : round2(catchUp),
      steadyMonthly: steady === null ? null : round2(steady),
      annualisedCost: round0(annualised),
    });
  }

  if (rows.length === 0) {
    return { error: "Every expense has an amount of zero — add a real amount to reserve for." };
  }

  const sorted = [...rows].sort((a, b) => a.monthsUntilDue - b.monthsUntilDue);
  const incomeSharePct = income > 0 ? round2((totalCatchUp / income) * 100) : null;

  return {
    monthlyCatchUp: round2(totalCatchUp),
    monthlySteady: round2(totalSteady),
    annualisedRecurring: round0(totalAnnualised),
    oneOffTotal: round0(totalOneOff),
    totalTarget: round0(totalTarget),
    totalReserved: round0(totalReserved),
    totalShortfall: round0(Math.max(0, totalTarget - totalReserved)),
    fundedPct: totalTarget > 0 ? round2(Math.min(100, (totalReserved / totalTarget) * 100)) : 0,
    incomeSharePct,
    incomeStretched:
      incomeSharePct === null ? null : incomeSharePct > INCOME_SHARE_WARNING_PCT,
    nextDue: sorted[0],
    items: sorted,
  };
}
