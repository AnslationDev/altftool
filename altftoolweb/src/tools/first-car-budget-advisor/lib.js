/**
 * First-car budget from the 20/4/10 rule.
 *
 * The 20/4/10 rule is a long-standing personal-finance guideline for car buying:
 *   20 — put at least 20% of the on-road price down in cash;
 *    4 — finance the rest over no more than 4 years (48 months);
 *   10 — keep TOTAL monthly transport cost (EMI plus fuel, insurance, maintenance and
 *        parking) at or below 10% of gross monthly income.
 *
 * The maths works backwards from the 10% ceiling: subtract the running costs to get the
 * EMI you can carry, convert that EMI into a loan principal with the standard reducing-
 * balance annuity formula, then add the cash you can actually put down, while respecting
 * the 20% minimum down payment.
 *
 * Nothing here is investment or credit advice — it is one widely used rule of thumb, and
 * a lender's own eligibility check will use its own income-multiple and FOIR limits.
 */

/** 20/4/10: minimum share of the on-road price paid in cash. */
export const DEFAULT_DOWN_PAYMENT_FRACTION = 0.2;
/** 20/4/10: maximum loan tenure, in months. */
export const DEFAULT_MAX_LOAN_MONTHS = 48;
/** 20/4/10: maximum share of gross monthly income spent on the car, all-in. */
export const DEFAULT_INCOME_SHARE = 0.1;

/** Months in a year, used to spread annual insurance and service costs. */
export const MONTHS_PER_YEAR = 12;

/** Sanity ceiling so a typo cannot produce a meaningless answer. */
export const MAX_TENURE_MONTHS = 96;

/**
 * Present value of an ordinary annuity: P = EMI x (1 - (1 + r)^-n) / r.
 * With r = 0 the loan is interest-free and the principal is simply EMI x n.
 *
 * @param {number} emi monthly instalment
 * @param {number} monthlyRate rate per month as a decimal (9% p.a. => 0.0075)
 * @param {number} months number of instalments
 * @returns {number} principal that instalment can service
 */
export function loanPrincipalFromEmi(emi, monthlyRate, months) {
  if (!(emi > 0) || !(months > 0)) return 0;
  if (monthlyRate === 0) return emi * months;
  return (emi * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate;
}

/**
 * Instalment for a given principal: EMI = P x r x (1 + r)^n / ((1 + r)^n - 1).
 */
export function emiFromPrincipal(principal, monthlyRate, months) {
  if (!(principal > 0) || !(months > 0)) return 0;
  if (monthlyRate === 0) return principal / months;
  const growth = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * growth) / (growth - 1);
}

/**
 * @returns {{error:string}|object} the affordable on-road price and its breakdown
 */
export function adviseFirstCarBudget({
  grossMonthlyIncome,
  savings,
  emergencyFund = 0,
  kmPerMonth,
  mileageKmpl,
  fuelPricePerLitre,
  annualInsurance = 0,
  annualMaintenance = 0,
  monthlyParking = 0,
  annualRate,
  tenureMonths = DEFAULT_MAX_LOAN_MONTHS,
  downPaymentFraction = DEFAULT_DOWN_PAYMENT_FRACTION,
  incomeShare = DEFAULT_INCOME_SHARE,
}) {
  const numbers = [
    grossMonthlyIncome,
    savings,
    emergencyFund,
    kmPerMonth,
    mileageKmpl,
    fuelPricePerLitre,
    annualInsurance,
    annualMaintenance,
    monthlyParking,
    annualRate,
    tenureMonths,
    downPaymentFraction,
    incomeShare,
  ];
  if (numbers.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }
  if (grossMonthlyIncome <= 0) {
    return { error: "Gross monthly income must be greater than zero." };
  }
  if (savings < 0 || emergencyFund < 0) {
    return { error: "Savings and emergency fund cannot be negative." };
  }
  if (kmPerMonth < 0) return { error: "Monthly driving distance cannot be negative." };
  if (mileageKmpl <= 0) {
    return { error: "Expected mileage must be greater than zero km per litre." };
  }
  if (fuelPricePerLitre < 0) return { error: "Fuel price cannot be negative." };
  if (annualInsurance < 0 || annualMaintenance < 0 || monthlyParking < 0) {
    return { error: "Running costs cannot be negative." };
  }
  if (annualRate < 0 || annualRate > 60) {
    return { error: "Interest rate must be between 0% and 60% per year." };
  }
  if (!(tenureMonths > 0) || tenureMonths > MAX_TENURE_MONTHS) {
    return { error: `Loan tenure must be between 1 and ${MAX_TENURE_MONTHS} months.` };
  }
  if (!(downPaymentFraction > 0) || downPaymentFraction > 1) {
    return { error: "Down payment share must be above 0% and at most 100%." };
  }
  if (!(incomeShare > 0) || incomeShare > 1) {
    return { error: "Income share must be above 0% and at most 100%." };
  }

  const transportBudget = grossMonthlyIncome * incomeShare;

  const litresPerMonth = kmPerMonth / mileageKmpl;
  const monthlyFuel = litresPerMonth * fuelPricePerLitre;
  const monthlyInsurance = annualInsurance / MONTHS_PER_YEAR;
  const monthlyMaintenance = annualMaintenance / MONTHS_PER_YEAR;
  const monthlyRunning = monthlyFuel + monthlyInsurance + monthlyMaintenance + monthlyParking;

  const availableForDown = Math.max(0, savings - emergencyFund);

  if (monthlyRunning >= transportBudget) {
    return {
      error:
        "Running costs alone already use up the whole transport budget, so there is nothing left for an EMI. Cut the monthly distance, raise the income share, or plan to buy outright.",
    };
  }

  const maxEmi = transportBudget - monthlyRunning;
  const monthlyRate = annualRate / 100 / MONTHS_PER_YEAR;
  const maxLoan = loanPrincipalFromEmi(maxEmi, monthlyRate, tenureMonths);

  // Ceiling on price: the loan plus the cash you can spare, but never so much loan that the
  // cash falls below the minimum down-payment share.
  const priceFromCashFloor = availableForDown / downPaymentFraction;
  const maxPrice = Math.min(maxLoan + availableForDown, priceFromCashFloor);

  const downPayment = Math.min(availableForDown, maxPrice);
  const loanAmount = Math.max(0, maxPrice - downPayment);
  const emi = emiFromPrincipal(loanAmount, monthlyRate, tenureMonths);
  const totalRepaid = emi * tenureMonths;
  const totalInterest = Math.max(0, totalRepaid - loanAmount);
  const monthlyAllIn = emi + monthlyRunning;
  const actualIncomeShare = monthlyAllIn / grossMonthlyIncome;
  const downPaymentShare = maxPrice > 0 ? downPayment / maxPrice : 0;
  const costPerKm = kmPerMonth > 0 ? monthlyAllIn / kmPerMonth : 0;

  const limitedBy =
    priceFromCashFloor < maxLoan + availableForDown ? "down payment" : "monthly budget";

  const notes = [];
  if (maxPrice <= 0) {
    notes.push(
      "With no spare cash for a down payment the 20% rule leaves a budget of zero. Build the down payment first — that is what the rule is protecting you from skipping.",
    );
  }
  if (limitedBy === "down payment" && maxPrice > 0) {
    notes.push(
      `Your budget is capped by cash, not by income: every extra rupee saved raises the ceiling by about ${(1 / downPaymentFraction).toFixed(0)}x.`,
    );
  } else if (maxPrice > 0) {
    notes.push(
      "Your budget is capped by the monthly ceiling. A longer tenure would raise the price you can reach, but the 4-year limit exists so the loan clears before big repair bills start.",
    );
  }
  if (tenureMonths > DEFAULT_MAX_LOAN_MONTHS) {
    notes.push(
      `A ${tenureMonths}-month loan breaks the "4" in 20/4/10. Past 48 months you spend longer owing more than the car is worth.`,
    );
  }
  if (downPaymentShare > 0.5 && maxPrice > 0) {
    notes.push(
      "You would be putting down more than half the price. That is well inside the rule, but keep the emergency fund intact — a first car brings unplanned bills.",
    );
  }
  if (emergencyFund === 0) {
    notes.push(
      "No emergency fund was set aside. Hold back at least three months of expenses before the down payment.",
    );
  }

  return {
    transportBudget,
    monthlyFuel,
    monthlyInsurance,
    monthlyMaintenance,
    monthlyParking,
    monthlyRunning,
    litresPerMonth,
    maxEmi,
    maxLoan,
    availableForDown,
    maxPrice,
    downPayment,
    downPaymentShare,
    loanAmount,
    emi,
    totalRepaid,
    totalInterest,
    monthlyAllIn,
    actualIncomeShare,
    costPerKm,
    limitedBy,
    notes,
  };
}
