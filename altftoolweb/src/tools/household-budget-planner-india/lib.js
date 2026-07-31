/**
 * Household budget planning maths for Indian monthly take-home income.
 *
 * Rules implemented:
 *  - 50/30/20 budget split (needs / wants / savings) popularised by Elizabeth Warren
 *    and Amelia Warren Tyagi in "All Your Worth" (2005).
 *  - FOIR / Fixed Obligation to Income Ratio: lenders in India typically cap total
 *    monthly loan obligations at 40-50% of net monthly income when underwriting a
 *    home loan, so 40% is used as the comfort line and 50% as the hard line.
 *  - Housing cost guideline: keep rent (or home-loan EMI) at or under 30% of net
 *    income, the long-standing affordability yardstick also used by HUD in the US
 *    and by most Indian financial planners.
 */

/** 50/30/20 rule: share of net income for essential needs. */
export const NEEDS_TARGET_SHARE = 50;
/** 50/30/20 rule: share of net income for lifestyle wants. */
export const WANTS_TARGET_SHARE = 30;
/** 50/30/20 rule: minimum share of net income to save or invest. */
export const SAVINGS_TARGET_SHARE = 20;

/** Comfortable ceiling for all EMIs as a share of net income (lender FOIR practice). */
export const FOIR_COMFORT_LIMIT = 40;
/** Hard ceiling most Indian lenders will not sanction beyond. */
export const FOIR_HARD_LIMIT = 50;
/** Housing (rent or home EMI) should stay at or under this share of net income. */
export const HOUSING_LIMIT_SHARE = 30;

/**
 * Budget lines. `bucket` maps each line to the 50/30/20 buckets:
 * "needs" = non-negotiable, "wants" = lifestyle, "savings" = pay-yourself-first.
 */
export const BUDGET_LINES = [
  { key: "rent", label: "Rent or home loan EMI", bucket: "needs", housing: true },
  { key: "otherEmi", label: "Other EMIs (car, personal, credit card)", bucket: "needs", emi: true },
  { key: "groceries", label: "Groceries and household supplies", bucket: "needs" },
  { key: "utilities", label: "Utilities (electricity, gas, water, internet)", bucket: "needs" },
  { key: "transport", label: "Transport and fuel", bucket: "needs" },
  { key: "education", label: "Children's school fees and tuition", bucket: "needs" },
  { key: "healthcare", label: "Healthcare and medicines", bucket: "needs" },
  { key: "insurance", label: "Insurance premiums (term and health)", bucket: "needs" },
  { key: "helpAndMaintenance", label: "Domestic help and maintenance", bucket: "needs" },
  { key: "diningOut", label: "Dining out and ordering in", bucket: "wants" },
  { key: "shopping", label: "Shopping, gadgets and personal care", bucket: "wants" },
  { key: "entertainment", label: "Subscriptions and entertainment", bucket: "wants" },
  { key: "travel", label: "Travel and holidays", bucket: "wants" },
  { key: "giftsAndFestivals", label: "Gifts, festivals and donations", bucket: "wants" },
  { key: "savings", label: "SIP, PPF, EPF top-up and other investing", bucket: "savings" },
  { key: "emergencyFund", label: "Emergency fund contribution", bucket: "savings" },
];

const toAmount = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};

const share = (part, whole) => (whole > 0 ? (part / whole) * 100 : 0);

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Build the full monthly budget picture.
 *
 * @param {object} input
 * @param {number|string} input.netMonthlyIncome Primary take-home pay after tax and PF.
 * @param {number|string} [input.otherMonthlyIncome] Rent received, freelance, spouse income.
 * @param {Record<string, number|string>} [input.lines] Amount per BUDGET_LINES key.
 * @param {boolean} [input.rentIsHomeLoanEmi] Whether the "Rent or home loan EMI" line is
 *   actually a home-loan EMI rather than plain rent. Only an EMI is a loan
 *   obligation, so this gates whether that line counts inside FOIR — pure
 *   rent (no loan) must not be treated as a loan obligation.
 * @returns {object} Either { error } or the computed budget.
 */
export function computeHouseholdBudget({
  netMonthlyIncome,
  otherMonthlyIncome = 0,
  lines = {},
  rentIsHomeLoanEmi = false,
} = {}) {
  const primary = toAmount(netMonthlyIncome);
  const other = toAmount(otherMonthlyIncome);

  if (Number.isNaN(primary) || Number.isNaN(other)) {
    return { error: "Enter valid numbers for income." };
  }
  if (primary < 0 || other < 0) {
    return { error: "Income cannot be negative." };
  }

  const totalIncome = primary + other;
  if (!(totalIncome > 0)) {
    return { error: "Enter a net monthly income greater than zero to build a budget." };
  }

  const amounts = {};
  for (const line of BUDGET_LINES) {
    const value = toAmount(lines[line.key]);
    if (Number.isNaN(value)) {
      return { error: `Enter a valid number for "${line.label}".` };
    }
    if (value < 0) {
      return { error: `"${line.label}" cannot be negative.` };
    }
    amounts[line.key] = value;
  }

  const buckets = { needs: 0, wants: 0, savings: 0 };
  let housing = 0;
  let emiTotal = 0;

  for (const line of BUDGET_LINES) {
    const value = amounts[line.key];
    buckets[line.bucket] += value;
    if (line.housing) {
      housing += value;
      // Only counts inside FOIR when the line is actually a home-loan EMI —
      // plain rent is not a loan obligation and must not inflate FOIR.
      if (rentIsHomeLoanEmi) emiTotal += value;
    }
    if (line.emi) emiTotal += value;
  }

  const totalSpending = buckets.needs + buckets.wants;
  const totalAllocated = totalSpending + buckets.savings;
  const unallocated = totalIncome - totalAllocated;

  const detail = BUDGET_LINES.filter((line) => amounts[line.key] > 0).map((line) => ({
    key: line.key,
    label: line.label,
    bucket: line.bucket,
    amount: round2(amounts[line.key]),
    shareOfIncome: round2(share(amounts[line.key], totalIncome)),
  }));

  const needsShare = round2(share(buckets.needs, totalIncome));
  const wantsShare = round2(share(buckets.wants, totalIncome));
  const savingsShare = round2(share(buckets.savings, totalIncome));
  const housingShare = round2(share(housing, totalIncome));
  const foir = round2(share(emiTotal, totalIncome));

  const ratios = [
    {
      key: "needs",
      label: "Needs share of income",
      value: needsShare,
      target: `at or under ${NEEDS_TARGET_SHARE}%`,
      status: needsShare <= NEEDS_TARGET_SHARE ? "good" : needsShare <= 60 ? "watch" : "over",
    },
    {
      key: "wants",
      label: "Wants share of income",
      value: wantsShare,
      target: `at or under ${WANTS_TARGET_SHARE}%`,
      status: wantsShare <= WANTS_TARGET_SHARE ? "good" : wantsShare <= 40 ? "watch" : "over",
    },
    {
      key: "savings",
      label: "Savings and investing rate",
      value: savingsShare,
      target: `at least ${SAVINGS_TARGET_SHARE}%`,
      status: savingsShare >= SAVINGS_TARGET_SHARE ? "good" : savingsShare >= 10 ? "watch" : "over",
    },
    {
      key: "housing",
      label: "Housing cost (rent or home EMI)",
      value: housingShare,
      target: `at or under ${HOUSING_LIMIT_SHARE}%`,
      status: housingShare <= HOUSING_LIMIT_SHARE ? "good" : housingShare <= 40 ? "watch" : "over",
    },
    {
      key: "foir",
      label: "All EMIs (FOIR)",
      value: foir,
      target: `at or under ${FOIR_COMFORT_LIMIT}%`,
      status: foir <= FOIR_COMFORT_LIMIT ? "good" : foir <= FOIR_HARD_LIMIT ? "watch" : "over",
    },
  ];

  const targets = {
    needs: round2((totalIncome * NEEDS_TARGET_SHARE) / 100),
    wants: round2((totalIncome * WANTS_TARGET_SHARE) / 100),
    savings: round2((totalIncome * SAVINGS_TARGET_SHARE) / 100),
  };

  return {
    totalIncome: round2(totalIncome),
    primaryIncome: round2(primary),
    otherIncome: round2(other),
    needs: round2(buckets.needs),
    wants: round2(buckets.wants),
    savings: round2(buckets.savings),
    totalSpending: round2(totalSpending),
    totalAllocated: round2(totalAllocated),
    unallocated: round2(unallocated),
    surplus: round2(totalIncome - totalSpending),
    housing: round2(housing),
    emiTotal: round2(emiTotal),
    needsShare,
    wantsShare,
    savingsShare,
    housingShare,
    foir,
    targets,
    detail,
    ratios,
    overspending: unallocated < 0,
  };
}

/**
 * Suggested 50/30/20 allocation for an income, useful as a starting point.
 * @param {number|string} totalIncome
 */
export function suggestBudget(totalIncome) {
  const income = toAmount(totalIncome);
  if (Number.isNaN(income) || !(income > 0)) {
    return { error: "Enter a net monthly income greater than zero." };
  }
  return {
    needs: round2((income * NEEDS_TARGET_SHARE) / 100),
    wants: round2((income * WANTS_TARGET_SHARE) / 100),
    savings: round2((income * SAVINGS_TARGET_SHARE) / 100),
  };
}
