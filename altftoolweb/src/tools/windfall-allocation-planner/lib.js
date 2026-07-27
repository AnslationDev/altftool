/**
 * Windfall allocation planner.
 *
 * A windfall (annual bonus, inheritance, ESOP sale, property sale, arrears)
 * is allocated by a priority waterfall rather than a single percentage split,
 * because rupees at the front of the queue do more work than rupees at the back:
 *
 *   1. Tax set-aside      — a bonus or arrears is salary income and is taxed at
 *                           your marginal slab rate; keep it back before you
 *                           plan anything else.
 *   2. Emergency fund     — top up to (monthly essential expenses x months of
 *                           cover). Cash held here earns little, but it is what
 *                           stops the next shock from becoming new debt.
 *   3. High-interest debt — cleared highest rate first (the "avalanche" order),
 *                           which minimises total interest paid, unlike the
 *                           "snowball" order which clears smallest balance first.
 *   4. The remainder      — split across investing, a named goal, and
 *                           guilt-free spending in whatever ratio you choose.
 *
 * Every step is a pure function of its inputs. Nothing here reads the clock.
 */

/**
 * 3 to 6 months of essential expenses is the emergency-fund range recommended
 * by RBI's financial-education material and by most personal-finance planners;
 * 6 is used as the default because a single-income household with a notice
 * period takes longer to replace income.
 */
export const DEFAULT_EMERGENCY_MONTHS = 6;
export const MAX_EMERGENCY_MONTHS = 24;

/**
 * Debts at or above this annual rate are cleared before any money is invested.
 * Paying down a loan is a risk-free, tax-free return equal to its interest
 * rate, so the cut-off is set near the long-run pre-tax return an equity index
 * fund would have to beat for investing instead to be worthwhile. Editable —
 * a credit card revolve (36-48% a year) is always above it, a home loan
 * (8-9% a year) is normally below it.
 */
export const DEFAULT_HIGH_INTEREST_THRESHOLD_PCT = 10;

/** Highest slab rate under the Income-tax Act before surcharge and cess. */
export const MAX_TAX_RATE_PCT = 60;

/** Sanity ceiling for a quoted annual interest rate on a consumer loan. */
export const MAX_DEBT_RATE_PCT = 100;

/** Percentage splits must add to this, within SPLIT_TOLERANCE_PCT. */
export const SPLIT_TOTAL_PCT = 100;
export const SPLIT_TOLERANCE_PCT = 0.01;

export const DEBT_PRESETS = [
  { id: "credit-card", label: "Credit card revolving balance", ratePct: 42 },
  { id: "personal-loan", label: "Personal loan", ratePct: 15 },
  { id: "consumer-durable", label: "Consumer durable / BNPL", ratePct: 18 },
  { id: "gold-loan", label: "Gold loan", ratePct: 12 },
  { id: "car-loan", label: "Car loan", ratePct: 9.5 },
  { id: "education-loan", label: "Education loan", ratePct: 9 },
  { id: "home-loan", label: "Home loan", ratePct: 8.5 },
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Round to paise so repeated additions cannot drift. */
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

/**
 * Allocate a windfall down the waterfall.
 *
 * @returns {object} allocation breakdown, or { error } for invalid input.
 */
export function planWindfall({
  amount,
  taxRatePct = 0,
  monthlyExpenses = 0,
  currentEmergencyFund = 0,
  emergencyMonths = DEFAULT_EMERGENCY_MONTHS,
  debts = [],
  highInterestThresholdPct = DEFAULT_HIGH_INTEREST_THRESHOLD_PCT,
  investPct = 0,
  goalPct = 0,
  spendPct = 0,
}) {
  const numeric = {
    amount,
    taxRatePct,
    monthlyExpenses,
    currentEmergencyFund,
    emergencyMonths,
    highInterestThresholdPct,
    investPct,
    goalPct,
    spendPct,
  };
  for (const [key, value] of Object.entries(numeric)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${key}.` };
  }

  if (amount <= 0) return { error: "Enter a windfall amount greater than zero." };
  if (taxRatePct < 0 || taxRatePct > MAX_TAX_RATE_PCT) {
    return { error: `Tax rate must be between 0% and ${MAX_TAX_RATE_PCT}%.` };
  }
  if (monthlyExpenses < 0) return { error: "Monthly expenses cannot be negative." };
  if (currentEmergencyFund < 0) return { error: "Existing emergency fund cannot be negative." };
  if (emergencyMonths < 0 || emergencyMonths > MAX_EMERGENCY_MONTHS) {
    return { error: `Months of cover must be between 0 and ${MAX_EMERGENCY_MONTHS}.` };
  }
  if (highInterestThresholdPct < 0 || highInterestThresholdPct > MAX_DEBT_RATE_PCT) {
    return { error: `Debt priority cut-off must be between 0% and ${MAX_DEBT_RATE_PCT}%.` };
  }
  if (!Array.isArray(debts)) return { error: "Debts must be a list." };

  for (const debt of debts) {
    if (!isNum(debt?.balance) || !isNum(debt?.ratePct)) {
      return { error: "Every debt needs a numeric balance and interest rate." };
    }
    if (debt.balance < 0) return { error: "A debt balance cannot be negative." };
    if (debt.ratePct < 0 || debt.ratePct > MAX_DEBT_RATE_PCT) {
      return { error: `Debt interest rates must be between 0% and ${MAX_DEBT_RATE_PCT}%.` };
    }
  }

  if (investPct < 0 || goalPct < 0 || spendPct < 0) {
    return { error: "Split percentages cannot be negative." };
  }
  const splitSum = investPct + goalPct + spendPct;
  if (Math.abs(splitSum - SPLIT_TOTAL_PCT) > SPLIT_TOLERANCE_PCT) {
    return {
      error: `Invest, goal and spend must add up to 100% — they currently add up to ${round2(splitSum)}%.`,
    };
  }

  // Step 1 — tax set-aside on the gross windfall.
  const taxSetAside = round2((amount * taxRatePct) / 100);
  const netAmount = round2(amount - taxSetAside);
  let remaining = netAmount;

  // Step 2 — emergency fund top-up.
  const emergencyTarget = round2(monthlyExpenses * emergencyMonths);
  const emergencyGap = round2(Math.max(0, emergencyTarget - currentEmergencyFund));
  const emergencyTopUp = round2(Math.min(remaining, emergencyGap));
  remaining = round2(remaining - emergencyTopUp);
  const newEmergencyFund = round2(currentEmergencyFund + emergencyTopUp);
  const monthsCovered =
    monthlyExpenses > 0 ? round2(newEmergencyFund / monthlyExpenses) : null;

  // Step 3 — avalanche payoff of debts at or above the cut-off.
  const ordered = debts
    .map((debt, index) => ({
      id: debt.id ?? `debt-${index}`,
      label: debt.label || `Debt ${index + 1}`,
      balance: round2(debt.balance),
      ratePct: debt.ratePct,
    }))
    .sort((a, b) => b.ratePct - a.ratePct || b.balance - a.balance);

  const debtPlan = [];
  let debtPaid = 0;
  let annualInterestSaved = 0;

  for (const debt of ordered) {
    const eligible = debt.ratePct >= highInterestThresholdPct && debt.balance > 0;
    const payment = eligible ? round2(Math.min(remaining, debt.balance)) : 0;
    remaining = round2(remaining - payment);
    debtPaid = round2(debtPaid + payment);
    annualInterestSaved = round2(annualInterestSaved + (payment * debt.ratePct) / 100);
    debtPlan.push({
      ...debt,
      eligible,
      payment,
      remainingBalance: round2(debt.balance - payment),
      clearedFully: payment > 0 && payment >= debt.balance,
    });
  }

  const totalDebtBefore = round2(ordered.reduce((sum, d) => sum + d.balance, 0));
  const totalDebtAfter = round2(totalDebtBefore - debtPaid);

  // Step 4 — split whatever survives the waterfall.
  const leftover = remaining;
  const invest = round2((leftover * investPct) / 100);
  const goal = round2((leftover * goalPct) / 100);
  // Spend absorbs the rounding residue so the four parts always re-add to net.
  const spend = round2(leftover - invest - goal);

  const shareOf = (value) => (netAmount > 0 ? round2((value / netAmount) * 100) : 0);

  return {
    grossAmount: round2(amount),
    taxSetAside,
    netAmount,
    emergencyTarget,
    emergencyGap,
    emergencyTopUp,
    newEmergencyFund,
    monthsCovered,
    emergencyFullyFunded: emergencyTopUp >= emergencyGap,
    debtPlan,
    debtPaid,
    totalDebtBefore,
    totalDebtAfter,
    annualInterestSaved,
    leftover,
    invest,
    goal,
    spend,
    shares: {
      tax: amount > 0 ? round2((taxSetAside / amount) * 100) : 0,
      emergency: shareOf(emergencyTopUp),
      debt: shareOf(debtPaid),
      invest: shareOf(invest),
      goal: shareOf(goal),
      spend: shareOf(spend),
    },
  };
}

/**
 * Plain-language next action, derived from a completed plan.
 * Returns null if the plan carries an error.
 */
export function nextAction(plan) {
  if (!plan || plan.error) return null;
  if (!plan.emergencyFullyFunded) {
    return "The whole windfall goes to the emergency fund and it is still short. Park it in a sweep-in deposit or a liquid fund before anything else.";
  }
  const stillOwed = plan.debtPlan.find((d) => d.eligible && d.remainingBalance > 0);
  if (stillOwed) {
    return `High-interest debt survives this windfall: ${stillOwed.label} still owes money at ${stillOwed.ratePct}% a year. Direct future surplus there next.`;
  }
  if (plan.leftover <= 0) {
    return "Every rupee was absorbed by tax, the emergency fund and debt. That is a good outcome — the balance sheet improved even though nothing was invested.";
  }
  return "Tax, emergency cover and high-interest debt are handled. The remainder is genuinely free money to invest, allocate to a goal, or spend.";
}
