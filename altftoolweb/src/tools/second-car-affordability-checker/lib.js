/**
 * Second-vehicle affordability tests.
 *
 * Five independent checks are applied, each with a published or lender-standard
 * benchmark. Nothing here is advice - it is arithmetic against well-known rules.
 */

/**
 * The 20/4/10 rule of thumb for buying a vehicle:
 *  - put at least 20% down,
 *  - borrow for no more than 4 years,
 *  - keep ALL transport costs (every vehicle's EMI, fuel, insurance,
 *    maintenance and parking) under 10% of gross income.
 */
export const RULE_MIN_DOWN_PAYMENT_PCT = 20;
export const RULE_MAX_LOAN_YEARS = 4;
export const RULE_MAX_TRANSPORT_PCT = 10;
/** Above this the transport burden is generally considered unsustainable. */
export const TRANSPORT_STRETCHED_PCT = 15;

/**
 * FOIR / debt-to-income: Indian lenders normally cap total EMI at around 50% of
 * gross income, and 40% is the conservative level most planners suggest.
 */
export const FOIR_COMFORTABLE_PCT = 40;
export const FOIR_LENDER_LIMIT_PCT = 50;

/** Emergency fund benchmarks, in months of household expenses. */
export const EMERGENCY_FUND_TARGET_MONTHS = 6;
export const EMERGENCY_FUND_MINIMUM_MONTHS = 3;

const round = (value, dp) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/**
 * Standard reducing-balance EMI. Handles the 0% and cash-purchase cases.
 * EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 */
export function computeEmi({ principal, annualRatePct, months }) {
  if (!(principal > 0)) return 0;
  if (!(months > 0)) return null;
  const r = annualRatePct / 12 / 100;
  if (r <= 0) return principal / months;
  const growth = (1 + r) ** months;
  return (principal * r * growth) / (growth - 1);
}

const statusRank = { pass: 0, warn: 1, fail: 2 };

/**
 * @param {object} input all amounts in the same currency, per month unless noted
 * @param {number} input.grossMonthlyIncome
 * @param {number} input.otherLoanEmi              home loan, personal loan, etc.
 * @param {number} input.existingVehicleEmi
 * @param {number} input.existingVehicleRunningCost fuel + insurance + service + parking
 * @param {number} input.onRoadPrice               of the second vehicle
 * @param {number} input.downPayment
 * @param {number} input.annualRatePct
 * @param {number} input.loanYears
 * @param {number} input.newVehicleRunningCost     monthly, for the second vehicle
 * @param {number} input.savings                   liquid savings before the down payment
 * @param {number} input.monthlyHouseholdExpenses
 * @param {number} input.parkingSlotsOwned
 * @param {number} input.vehiclesAfterPurchase
 */
export function checkAffordability({
  grossMonthlyIncome,
  otherLoanEmi = 0,
  existingVehicleEmi = 0,
  existingVehicleRunningCost = 0,
  onRoadPrice,
  downPayment,
  annualRatePct,
  loanYears,
  newVehicleRunningCost = 0,
  savings = 0,
  monthlyHouseholdExpenses = 0,
  parkingSlotsOwned = 1,
  vehiclesAfterPurchase = 2,
}) {
  const income = Number(grossMonthlyIncome);
  const otherEmi = Number(otherLoanEmi);
  const oldEmi = Number(existingVehicleEmi);
  const oldRunning = Number(existingVehicleRunningCost);
  const price = Number(onRoadPrice);
  const down = Number(downPayment);
  const rate = Number(annualRatePct);
  const years = Number(loanYears);
  const newRunning = Number(newVehicleRunningCost);
  const liquid = Number(savings);
  const expenses = Number(monthlyHouseholdExpenses);
  const slots = Number(parkingSlotsOwned);
  const vehicles = Number(vehiclesAfterPurchase);

  const numbers = [income, otherEmi, oldEmi, oldRunning, price, down, rate, years, newRunning, liquid, expenses, slots, vehicles];
  if (!numbers.every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (income <= 0) return { error: "Gross monthly income must be greater than zero." };
  if (price <= 0) return { error: "On-road price must be greater than zero." };
  if (down < 0) return { error: "Down payment cannot be negative." };
  if (down > price) return { error: "Down payment cannot exceed the on-road price." };
  if (rate < 0 || rate > 60) return { error: "Interest rate should be between 0% and 60% a year." };
  if (years <= 0 || years > 10) return { error: "Loan tenure should be between 1 and 10 years." };
  if ([otherEmi, oldEmi, oldRunning, newRunning, liquid, expenses].some((value) => value < 0)) {
    return { error: "Amounts cannot be negative." };
  }
  if (!Number.isInteger(slots) || slots < 0 || slots > 20) {
    return { error: "Parking slots owned must be a whole number between 0 and 20." };
  }
  if (!Number.isInteger(vehicles) || vehicles < 1 || vehicles > 20) {
    return { error: "Vehicles after purchase must be a whole number between 1 and 20." };
  }

  const loanAmount = price - down;
  const months = Math.round(years * 12);
  const newEmi = computeEmi({ principal: loanAmount, annualRatePct: rate, months });
  if (newEmi === null) return { error: "Loan tenure produced no monthly instalments." };

  const totalEmi = otherEmi + oldEmi + newEmi;
  const totalTransport = oldEmi + oldRunning + newEmi + newRunning;
  const transportPct = (totalTransport / income) * 100;
  const foirPct = (totalEmi / income) * 100;
  const downPct = (down / price) * 100;

  const savingsAfter = liquid - down;
  const emergencyMonths = expenses > 0 ? savingsAfter / expenses : null;

  const checks = [];

  // Every check below compares and displays the SAME rounded figure, so the
  // status shown can never disagree with the number printed next to it (see
  // wave-28 audit finding 1: comparing raw values against a rounded display
  // could show e.g. "20% — FAIL" when the raw value was 19.96%).
  const downPctRounded = round(downPct, 1);
  checks.push({
    id: "down-payment",
    label: "Down payment",
    value: `${downPctRounded}% of the on-road price`,
    benchmark: `at least ${RULE_MIN_DOWN_PAYMENT_PCT}%`,
    status: downPctRounded >= RULE_MIN_DOWN_PAYMENT_PCT ? "pass" : "fail",
    detail:
      downPctRounded >= RULE_MIN_DOWN_PAYMENT_PCT
        ? "A fifth down keeps you ahead of the vehicle's depreciation curve."
        : `Put in ${round((price * RULE_MIN_DOWN_PAYMENT_PCT) / 100 - down, 0)} more to reach the 20% mark.`,
  });

  const yearsRounded = round(years, 1);
  checks.push({
    id: "loan-term",
    label: "Loan tenure",
    value: `${yearsRounded} years`,
    benchmark: `${RULE_MAX_LOAN_YEARS} years or less`,
    status: yearsRounded <= RULE_MAX_LOAN_YEARS ? "pass" : "fail",
    detail:
      yearsRounded <= RULE_MAX_LOAN_YEARS
        ? "Short enough that the loan is repaid before the big-ticket repairs start."
        : "A longer tenure lowers the EMI but keeps you in negative equity for most of the loan.",
  });

  const transportPctRounded = round(transportPct, 1);
  const transportStatus =
    transportPctRounded <= RULE_MAX_TRANSPORT_PCT
      ? "pass"
      : transportPctRounded <= TRANSPORT_STRETCHED_PCT
        ? "warn"
        : "fail";
  checks.push({
    id: "transport-share",
    label: "All transport costs",
    value: `${transportPctRounded}% of gross income`,
    benchmark: `${RULE_MAX_TRANSPORT_PCT}% or less`,
    status: transportStatus,
    detail:
      transportStatus === "pass"
        ? "Every vehicle's EMI, fuel, insurance, service and parking together stay inside the rule."
        : `Both vehicles together cost ${round(totalTransport, 0)} a month, against a ${RULE_MAX_TRANSPORT_PCT}% budget of ${round((income * RULE_MAX_TRANSPORT_PCT) / 100, 0)}.`,
  });

  const foirPctRounded = round(foirPct, 1);
  const foirStatus =
    foirPctRounded <= FOIR_COMFORTABLE_PCT ? "pass" : foirPctRounded <= FOIR_LENDER_LIMIT_PCT ? "warn" : "fail";
  checks.push({
    id: "foir",
    label: "Total EMI to income",
    value: `${foirPctRounded}% of gross income`,
    benchmark: `under ${FOIR_COMFORTABLE_PCT}%, lender cap around ${FOIR_LENDER_LIMIT_PCT}%`,
    status: foirStatus,
    detail:
      foirStatus === "fail"
        ? "Above the level most lenders will sanction, so the loan itself may be declined."
        : `All loan instalments together come to ${round(totalEmi, 0)} a month.`,
  });

  let emergencyStatus = "warn";
  let emergencyValue = "No expense figure entered";
  let emergencyDetail = "Enter your monthly household expenses to test the emergency fund.";
  if (emergencyMonths !== null) {
    const emergencyMonthsRounded = round(emergencyMonths, 1);
    emergencyValue = `${emergencyMonthsRounded} months of expenses left`;
    emergencyStatus =
      emergencyMonthsRounded >= EMERGENCY_FUND_TARGET_MONTHS
        ? "pass"
        : emergencyMonthsRounded >= EMERGENCY_FUND_MINIMUM_MONTHS
          ? "warn"
          : "fail";
    emergencyDetail =
      savingsAfter < 0
        ? "The down payment is larger than your liquid savings."
        : `Savings fall from ${round(liquid, 0)} to ${round(savingsAfter, 0)} after the down payment.`;
  }
  checks.push({
    id: "emergency-fund",
    label: "Emergency fund after the down payment",
    value: emergencyValue,
    benchmark: `${EMERGENCY_FUND_TARGET_MONTHS} months of expenses`,
    status: emergencyStatus,
    detail: emergencyDetail,
  });

  // slots and vehicles are both validated as whole numbers above, so this
  // subtraction can't produce a floating-point artifact (wave-28 audit
  // finding 2) and the pluralization checks below always match what's shown.
  const parkingShortfall = vehicles - slots;
  checks.push({
    id: "parking",
    label: "Parking",
    value: `${slots} slot${slots === 1 ? "" : "s"} for ${vehicles} vehicle${vehicles === 1 ? "" : "s"}`,
    benchmark: "one slot per vehicle",
    status: parkingShortfall <= 0 ? "pass" : "fail",
    detail:
      parkingShortfall <= 0
        ? "Every vehicle has somewhere legal to stand."
        : `You are short ${parkingShortfall} slot${parkingShortfall === 1 ? "" : "s"}. Rented parking has to be in the running cost above, and many societies do not allow a second slot at all.`,
  });

  const worst = checks.reduce(
    (acc, check) => (statusRank[check.status] > statusRank[acc] ? check.status : acc),
    "pass",
  );
  const failCount = checks.filter((check) => check.status === "fail").length;
  const warnCount = checks.filter((check) => check.status === "warn").length;

  const verdict =
    worst === "pass" ? "affordable" : failCount === 0 ? "tight" : failCount <= 2 ? "stretched" : "not-affordable";

  return {
    loanAmount: round(loanAmount, 0),
    months,
    newEmi: round(newEmi, 0),
    newVehicleRunningCost: round(newRunning, 0),
    newVehicleMonthlyTotal: round(newEmi + newRunning, 0),
    totalEmi: round(totalEmi, 0),
    totalTransport: round(totalTransport, 0),
    transportPct: round(transportPct, 1),
    foirPct: round(foirPct, 1),
    downPct: round(downPct, 1),
    transportBudget: round((income * RULE_MAX_TRANSPORT_PCT) / 100, 0),
    savingsAfter: round(savingsAfter, 0),
    emergencyMonths: emergencyMonths === null ? null : round(emergencyMonths, 1),
    checks,
    failCount,
    warnCount,
    verdict,
  };
}
