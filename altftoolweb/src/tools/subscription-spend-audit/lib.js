/**
 * Subscription spend audit.
 *
 * Recurring charges are quoted on different cadences, so they cannot be compared or added
 * up until every one is put on the same basis. This module normalises each subscription to
 * an annual cost and then divides by 12 for a monthly equivalent:
 *
 *     annualCost  = amount * seats * paymentsPerYear(cycle)
 *     monthlyCost = annualCost / 12
 *
 * paymentsPerYear for calendar cadences is exact (12 monthly, 4 quarterly, 2 half-yearly,
 * 1 yearly). For day-based cadences it is derived from the average year length of 365.25
 * days used by the Gregorian calendar, because a "weekly" plan bills every 7 days rather
 * than 52 times a year:
 *
 *     weekly      = 365.25 / 7  ≈ 52.18 charges a year
 *     fortnightly = 365.25 / 14 ≈ 26.09 charges a year
 *
 * That is why a weekly plan costs slightly more than 52 times the sticker price.
 *
 * The multi-year projection compounds the retained annual spend at an assumed annual price
 * increase g, as an ordinary geometric series with the first year charged at today's price:
 *
 *     horizonCost = Σ (k = 0 .. years-1) retainedAnnual * (1 + g)^k
 */

/** Average length of a Gregorian year in days (365.2425 rounded to the usual 365.25). */
export const DAYS_PER_YEAR = 365.25;

export const BILLING_CYCLES = [
  { id: "weekly", label: "Weekly", perYear: DAYS_PER_YEAR / 7 },
  { id: "fortnightly", label: "Every 2 weeks", perYear: DAYS_PER_YEAR / 14 },
  { id: "monthly", label: "Monthly", perYear: 12 },
  { id: "quarterly", label: "Quarterly", perYear: 4 },
  { id: "halfyearly", label: "Every 6 months", perYear: 2 },
  { id: "yearly", label: "Yearly", perYear: 1 },
];

export const CYCLE_BY_ID = BILLING_CYCLES.reduce((map, cycle) => {
  map[cycle.id] = cycle;
  return map;
}, {});

/** What you intend to do with each line. Only "cancel" counts as a saving. */
export const STATUSES = [
  { id: "keep", label: "Keep" },
  { id: "review", label: "Review" },
  { id: "cancel", label: "Cancel" },
];

/** Guard rails so a typo cannot produce a meaningless report. */
export const MAX_ITEMS = 60;
export const MAX_SEATS = 500;
export const MAX_PRICE_INCREASE_PCT = 50;
export const MAX_HORIZON_YEARS = 30;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {Array} input.items [{ id, name, amount, cycle, seats, status }]
 * @param {number|string} [input.monthlyIncome] Take-home pay per month, for the share figure.
 * @param {number|string} [input.annualPriceIncrease] Expected yearly price rise, % per year.
 * @param {number|string} [input.horizonYears] Years to project the retained spend over.
 */
export function auditSubscriptions({
  items = [],
  monthlyIncome = 0,
  annualPriceIncrease = 0,
  horizonYears = 5,
} = {}) {
  if (!Array.isArray(items)) return { error: "Subscription list is missing." };
  if (items.length === 0) return { error: "Add at least one subscription to audit." };
  if (items.length > MAX_ITEMS) return { error: `Audit up to ${MAX_ITEMS} subscriptions at a time.` };

  const income = toNumber(monthlyIncome);
  const growthPct = toNumber(annualPriceIncrease);
  const years = toNumber(horizonYears);

  if ([income, growthPct, years].some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers for income, price increase and horizon." };
  }
  if (income < 0) return { error: "Monthly income cannot be negative." };
  if (growthPct < 0 || growthPct > MAX_PRICE_INCREASE_PCT) {
    return { error: `Annual price increase should be between 0% and ${MAX_PRICE_INCREASE_PCT}%.` };
  }
  if (!(years >= 1) || years > MAX_HORIZON_YEARS) {
    return { error: `Projection horizon should be between 1 and ${MAX_HORIZON_YEARS} years.` };
  }

  const rows = [];
  for (const item of items) {
    const amount = toNumber(item?.amount);
    const seats = toNumber(item?.seats, 1);
    const cycle = CYCLE_BY_ID[item?.cycle];

    if (Number.isNaN(amount) || Number.isNaN(seats)) {
      return { error: `Enter a valid amount for "${item?.name || "each subscription"}".` };
    }
    if (amount < 0 || seats < 0) return { error: "Prices and seat counts cannot be negative." };
    if (seats > MAX_SEATS) return { error: `Seats per subscription should be ${MAX_SEATS} or fewer.` };
    if (!cycle) return { error: "Choose a billing cycle for every subscription." };

    const effectiveSeats = seats > 0 ? seats : 1;
    const annual = amount * effectiveSeats * cycle.perYear;
    rows.push({
      id: item?.id,
      name: item?.name?.trim() || "Untitled subscription",
      amount: round2(amount),
      seats: effectiveSeats,
      cycle: cycle.id,
      cycleLabel: cycle.label,
      status: STATUSES.some((entry) => entry.id === item?.status) ? item.status : "keep",
      annual: round0(annual),
      monthly: round0(annual / 12),
      annualExact: annual,
    });
  }

  const totalAnnual = rows.reduce((sum, row) => sum + row.annualExact, 0);
  if (!(totalAnnual > 0)) {
    return { error: "Every subscription is priced at zero — enter what you actually pay." };
  }

  const cancelAnnual = rows
    .filter((row) => row.status === "cancel")
    .reduce((sum, row) => sum + row.annualExact, 0);
  const reviewAnnual = rows
    .filter((row) => row.status === "review")
    .reduce((sum, row) => sum + row.annualExact, 0);
  const keepAnnual = totalAnnual - cancelAnnual;

  const withShare = rows
    .map((row) => ({ ...row, sharePct: round2((row.annualExact / totalAnnual) * 100) }))
    .sort((a, b) => b.annualExact - a.annualExact)
    .map(({ annualExact, ...rest }) => rest);

  const g = growthPct / 100;
  const wholeYears = Math.round(years);
  let horizonCost = 0;
  for (let k = 0; k < wholeYears; k += 1) horizonCost += keepAnnual * Math.pow(1 + g, k);

  const incomeSharePct = income > 0 ? round2((totalAnnual / 12 / income) * 100) : null;
  const biggest = withShare[0] ?? null;

  return {
    count: rows.length,
    totalAnnual: round0(totalAnnual),
    totalMonthly: round0(totalAnnual / 12),
    keepAnnual: round0(keepAnnual),
    keepMonthly: round0(keepAnnual / 12),
    cancelAnnual: round0(cancelAnnual),
    cancelMonthly: round0(cancelAnnual / 12),
    reviewAnnual: round0(reviewAnnual),
    incomeSharePct,
    horizonYears: wholeYears,
    horizonCost: round0(horizonCost),
    biggestName: biggest ? biggest.name : null,
    biggestAnnual: biggest ? biggest.annual : 0,
    rows: withShare,
  };
}
