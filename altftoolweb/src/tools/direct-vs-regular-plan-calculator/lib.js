/**
 * Direct plan vs regular plan cost maths.
 *
 * Rules behind this module:
 *  - SEBI circular CIR/IMD/DF/21/2012 required every mutual fund scheme to offer
 *    a DIRECT plan from 1 January 2013. A direct plan carries no distributor
 *    commission; a regular plan embeds it in the total expense ratio (TER).
 *  - Regulation 52(6A)(b) of the SEBI (Mutual Funds) Regulations, 1996 requires
 *    the direct plan TER to be lower than the regular plan TER, the gap being
 *    the distribution and commission expense.
 *  - TER is accrued daily and deducted from the NAV, so the return an investor
 *    actually receives is the gross portfolio return minus the TER. This module
 *    models the deduction monthly, which is close enough for a projection and
 *    keeps the arithmetic auditable.
 *
 * Nothing here reads the clock; the horizon is passed in as a number of years.
 */

/** Date from which every scheme has had a direct plan (SEBI, 1 January 2013). */
export const DIRECT_PLAN_START = "2013-01-01";

/**
 * Indicative TER ranges seen in practice. These are illustration presets for
 * the interface, not regulatory limits; the statutory maxima live in Regulation
 * 52(6) of the SEBI (Mutual Funds) Regulations, 1996.
 */
export const TER_PRESETS = [
  { label: "Active equity fund", direct: 0.6, regular: 1.75 },
  { label: "Flexi cap / large cap", direct: 0.8, regular: 1.9 },
  { label: "Index fund / ETF FoF", direct: 0.2, regular: 1.0 },
  { label: "Debt fund", direct: 0.25, regular: 1.1 },
  { label: "Hybrid fund", direct: 0.7, regular: 1.8 },
];

/** Statutory ceiling on an open-ended equity scheme's TER, Regulation 52(6). */
export const MAX_EQUITY_TER_PERCENT = 2.25;

/** Hard ceiling accepted by this calculator, above any statutory slab. */
export const MAX_TER_INPUT_PERCENT = 3;

/** Longest horizon accepted, in years. */
export const MAX_YEARS = 40;

/** Upper sanity bound on any rupee amount accepted. */
const MAX_AMOUNT = 1e10;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Run one plan month by month.
 *
 * @param {object} args
 * @param {"lumpsum"|"sip"} args.mode
 * @param {number} args.amount lumpsum principal, or the monthly SIP instalment
 * @param {number} args.months number of months
 * @param {number} args.netAnnualPercent return after TER, % a year
 * @param {number} args.terPercent the plan's own TER, % a year
 * @returns {{ balance: number, invested: number, expenses: number, yearly: Array }}
 */
function runPlan({ mode, amount, months, netAnnualPercent, terPercent }) {
  const monthlyRate = netAnnualPercent / 12 / 100;
  const monthlyTer = terPercent / 12 / 100;

  let balance = mode === "lumpsum" ? amount : 0;
  let invested = mode === "lumpsum" ? amount : 0;
  let expenses = 0;
  const yearly = [];

  for (let month = 1; month <= months; month += 1) {
    if (mode === "sip") {
      balance += amount;
      invested += amount;
    }
    // TER is charged on the assets under management before the month's growth.
    expenses += balance * monthlyTer;
    balance *= 1 + monthlyRate;

    if (month % 12 === 0 || month === months) {
      yearly.push({
        year: Math.ceil(month / 12),
        invested,
        expenses,
        balance,
      });
    }
  }

  return { balance, invested, expenses, yearly };
}

/**
 * Compare a direct plan with a regular plan of the same scheme.
 *
 * @param {object} input
 * @param {"lumpsum"|"sip"} [input.mode]
 * @param {number} input.amount lumpsum principal, or monthly SIP instalment
 * @param {number} input.years horizon in years
 * @param {number} input.grossReturnPercent portfolio return before any TER
 * @param {number} input.directTerPercent direct plan expense ratio
 * @param {number} input.regularTerPercent regular plan expense ratio
 * @returns {object} comparison, or { error } when the input is unusable
 */
export function compareDirectVsRegular({
  mode = "lumpsum",
  amount,
  years,
  grossReturnPercent,
  directTerPercent,
  regularTerPercent,
} = {}) {
  if (mode !== "lumpsum" && mode !== "sip") {
    return { error: "Choose either a lumpsum investment or a monthly SIP." };
  }
  const numbers = [amount, years, grossReturnPercent, directTerPercent, regularTerPercent];
  if (!numbers.every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }
  if (amount <= 0) {
    return { error: "Enter an investment amount greater than zero." };
  }
  if (amount > MAX_AMOUNT) {
    return { error: "Enter an investment amount below Rs 1,000 crore." };
  }
  if (years <= 0 || years > MAX_YEARS) {
    return { error: `Investment period should be between 1 year and ${MAX_YEARS} years.` };
  }
  if (grossReturnPercent < 0 || grossReturnPercent > 40) {
    return { error: "Expected gross return should be between 0% and 40% a year." };
  }
  if (
    directTerPercent < 0 ||
    regularTerPercent < 0 ||
    directTerPercent > MAX_TER_INPUT_PERCENT ||
    regularTerPercent > MAX_TER_INPUT_PERCENT
  ) {
    return { error: `Expense ratios should be between 0% and ${MAX_TER_INPUT_PERCENT}%.` };
  }
  if (directTerPercent > regularTerPercent) {
    return {
      error:
        "The direct plan expense ratio must be lower than the regular plan — SEBI does not allow the reverse.",
    };
  }
  if (grossReturnPercent - regularTerPercent < -100) {
    return { error: "The expense ratio cannot exceed the return by that much." };
  }

  const months = Math.round(years * 12);
  const netDirect = grossReturnPercent - directTerPercent;
  const netRegular = grossReturnPercent - regularTerPercent;

  const direct = runPlan({
    mode,
    amount,
    months,
    netAnnualPercent: netDirect,
    terPercent: directTerPercent,
  });
  const regular = runPlan({
    mode,
    amount,
    months,
    netAnnualPercent: netRegular,
    terPercent: regularTerPercent,
  });

  const drag = direct.balance - regular.balance;
  const commissionEmbedded = regular.expenses - direct.expenses;

  return {
    mode,
    months,
    years: months / 12,
    amount,
    invested: direct.invested,
    grossReturnPercent,
    directTerPercent,
    regularTerPercent,
    terGapPercent: regularTerPercent - directTerPercent,
    netDirectPercent: netDirect,
    netRegularPercent: netRegular,
    directCorpus: direct.balance,
    regularCorpus: regular.balance,
    directExpenses: direct.expenses,
    regularExpenses: regular.expenses,
    /** Extra rupees you end up with by holding the direct plan. */
    drag,
    /** Distributor commission embedded in the regular plan's TER. */
    commissionEmbedded,
    /** Compounding lost on the commission, i.e. drag beyond the commission itself. */
    compoundingLost: Math.max(0, drag - commissionEmbedded),
    dragPercentOfRegularCorpus: regular.balance > 0 ? (drag / regular.balance) * 100 : 0,
    dragPercentOfInvested: direct.invested > 0 ? (drag / direct.invested) * 100 : 0,
    averageDragPerYear: years > 0 ? drag / years : 0,
    directYearly: direct.yearly,
    regularYearly: regular.yearly,
    yearly: direct.yearly.map((row, index) => ({
      year: row.year,
      invested: row.invested,
      directBalance: row.balance,
      regularBalance: regular.yearly[index] ? regular.yearly[index].balance : 0,
      gap: row.balance - (regular.yearly[index] ? regular.yearly[index].balance : 0),
    })),
  };
}
