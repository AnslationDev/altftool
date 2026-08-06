/**
 * Student Monthly Budget Planner.
 *
 * Pure budgeting arithmetic: total expenses across student categories, surplus
 * or deficit against monthly money-in, each category's share, and a reference
 * split against the 50/30/20 rule (needs/wants/savings), the budgeting
 * heuristic popularised by Elizabeth Warren and Amelia Warren Tyagi in
 * "All Your Worth" (2005).
 */

/** Budget categories with their 50/30/20 bucket. */
export const CATEGORIES = [
  { id: "mess", label: "Mess / food", bucket: "needs" },
  { id: "rent", label: "Rent / hostel fee", bucket: "needs" },
  { id: "travel", label: "Travel / commute", bucket: "needs" },
  { id: "books", label: "Books / study material", bucket: "needs" },
  { id: "phone", label: "Phone / internet", bucket: "needs" },
  { id: "personal", label: "Personal / outings", bucket: "wants" },
  { id: "subscriptions", label: "Subscriptions / OTT", bucket: "wants" },
  { id: "other", label: "Other", bucket: "wants" },
];

/**
 * 50/30/20 rule shares of take-home income (Warren & Tyagi, "All Your Worth"):
 * at most 50% on needs, at most 30% on wants, at least 20% saved.
 */
export const RULE_NEEDS_SHARE = 0.5;
export const RULE_WANTS_SHARE = 0.3;
export const RULE_SAVINGS_SHARE = 0.2;

/**
 * @param {object} input
 * @param {number} input.income   Monthly money in (allowance + stipend + part-time), INR.
 * @param {Object<string, number>} input.expenses Map of category id -> monthly amount.
 * @returns {object} totals, surplus, per-category shares, 50/30/20 comparison, or { error }.
 */
export function planBudget({ income, expenses }) {
  const monthlyIncome = Number(income);
  if (!Number.isFinite(monthlyIncome) || monthlyIncome < 0) {
    return { error: "Monthly money-in must be zero or a positive number." };
  }
  if (!expenses || typeof expenses !== "object") {
    return { error: "Enter your monthly expenses (0 is fine for unused categories)." };
  }

  const items = [];
  let totalExpense = 0;
  let needsTotal = 0;
  let wantsTotal = 0;

  for (const category of CATEGORIES) {
    const raw = expenses[category.id];
    const amount = raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
    if (!Number.isFinite(amount)) {
      return { error: `${category.label}: enter a number (0 is fine).` };
    }
    if (amount < 0) {
      return { error: `${category.label}: an expense cannot be negative.` };
    }
    totalExpense += amount;
    if (category.bucket === "needs") needsTotal += amount;
    else wantsTotal += amount;
    items.push({ ...category, amount });
  }

  const surplus = monthlyIncome - totalExpense;

  // Percent share of total spend; null when the divisor is zero so the UI can show a dash.
  const withShares = items.map((item) => ({
    ...item,
    shareOfExpense: totalExpense > 0 ? (item.amount / totalExpense) * 100 : null,
  }));

  const rule = monthlyIncome > 0
    ? {
        needsCap: monthlyIncome * RULE_NEEDS_SHARE,
        wantsCap: monthlyIncome * RULE_WANTS_SHARE,
        savingsTarget: monthlyIncome * RULE_SAVINGS_SHARE,
        needsActual: needsTotal,
        wantsActual: wantsTotal,
        savingsActual: surplus,
        needsOk: needsTotal <= monthlyIncome * RULE_NEEDS_SHARE,
        wantsOk: wantsTotal <= monthlyIncome * RULE_WANTS_SHARE,
        savingsOk: surplus >= monthlyIncome * RULE_SAVINGS_SHARE,
      }
    : null;

  return {
    income: monthlyIncome,
    totalExpense,
    surplus,
    isDeficit: surplus < 0,
    items: withShares,
    needsTotal,
    wantsTotal,
    rule,
  };
}
