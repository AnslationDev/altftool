/**
 * House down payment savings plan.
 *
 * Three things drive the number, and the first two are what people usually leave out:
 *
 * 1. The house costs more on the day you buy it than it does today.
 *        futurePrice = todayPrice * (1 + g)^years
 *
 * 2. Stamp duty, registration and the incidental charges are NOT financed by the lender.
 *    They are paid in cash on top of the down payment, and they are levied on the property
 *    value, so they inflate with the price:
 *        charges = futurePrice * chargesPct
 *        cashNeeded = futurePrice * downPct + charges
 *
 * 3. Money already earmarked keeps compounding until the purchase date, so only the
 *    shortfall has to come from new monthly saving. With monthly rate i = r/12 over
 *    n = years * 12 months, the contribution that closes the gap is the ordinary-annuity
 *    payment:
 *        C = (cashNeeded - existing*(1+i)^n) * i / ((1+i)^n - 1)      (i > 0)
 *        C = (cashNeeded - existing) / n                              (i = 0)
 *
 * The plan is also checked against the RBI loan-to-value ceiling for individual housing
 * loans, which fixes the *minimum* down payment a bank can accept. Per the RBI circular on
 * rationalisation of risk weights and LTV ratios for individual housing loans, the LTV
 * ceiling is 90% for loans up to ₹30 lakh, 80% above ₹30 lakh and up to ₹75 lakh, and 75%
 * above ₹75 lakh — measured against the property value, and excluding stamp duty and
 * registration, which under the RBI rule may be added to the property cost only for loans
 * up to ₹10 lakh. Individual lenders often ask for more than the regulatory minimum.
 *
 * The EMI preview uses the standard reducing-balance formula
 *        EMI = P*i*(1+i)^n / ((1+i)^n - 1)
 */

/** RBI LTV ceilings for individual housing loans, keyed by loan-size slab (₹). */
export const LTV_SLABS = [
  { upTo: 3000000, maxLtvPct: 90, label: "Loan up to ₹30 lakh" },
  { upTo: 7500000, maxLtvPct: 80, label: "Loan above ₹30 lakh up to ₹75 lakh" },
  { upTo: Infinity, maxLtvPct: 75, label: "Loan above ₹75 lakh" },
];

export const MAX_YEARS = 20;
export const MAX_RATE_PCT = 25;
export const MAX_CHARGES_PCT = 20;
export const MAX_DOWN_PCT = 100;
/** Longest housing-loan tenure Indian lenders normally sanction. */
export const MAX_LOAN_YEARS = 30;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * The RBI ceiling depends on the loan amount, and the loan amount depends on the ceiling,
 * so the slab is found by testing each one and keeping the first that is self-consistent.
 */
export function maxLoanUnderLtvCap(propertyValue) {
  if (!(propertyValue > 0)) return { maxLoan: 0, maxLtvPct: 0, slabLabel: "" };
  for (const slab of LTV_SLABS) {
    const candidate = (propertyValue * slab.maxLtvPct) / 100;
    if (candidate <= slab.upTo) {
      return { maxLoan: candidate, maxLtvPct: slab.maxLtvPct, slabLabel: slab.label };
    }
  }
  const last = LTV_SLABS[LTV_SLABS.length - 1];
  return {
    maxLoan: (propertyValue * last.maxLtvPct) / 100,
    maxLtvPct: last.maxLtvPct,
    slabLabel: last.label,
  };
}

/** Standard reducing-balance EMI. Returns 0 when there is nothing to repay. */
export function emiFor(principal, annualRatePct, months) {
  if (!(principal > 0) || !(months > 0)) return 0;
  const i = annualRatePct / 12 / 100;
  if (i <= 0) return principal / months;
  const growth = Math.pow(1 + i, months);
  return (principal * i * growth) / (growth - 1);
}

/**
 * @param {object} input
 * @param {number|string} input.propertyPrice Today's price of the property.
 * @param {number|string} input.yearsToBuy Years until you plan to buy.
 * @param {number|string} [input.priceGrowth] Property price growth, % per year.
 * @param {number|string} [input.downPaymentPct] Down payment you intend to make, % of price.
 * @param {number|string} [input.chargesPct] Stamp duty, registration and incidentals, % of price.
 * @param {number|string} [input.existingSavings] Amount already set aside for the purchase.
 * @param {number|string} [input.expectedReturn] Return on those savings, % per year.
 * @param {number|string} [input.loanRate] Home loan interest rate, % per year, for the EMI preview.
 * @param {number|string} [input.loanYears] Home loan tenure in years, for the EMI preview.
 */
export function planDownPayment({
  propertyPrice,
  yearsToBuy,
  priceGrowth = 0,
  downPaymentPct = 20,
  chargesPct = 7,
  existingSavings = 0,
  expectedReturn = 0,
  loanRate = 8.5,
  loanYears = 20,
} = {}) {
  const price = toNumber(propertyPrice);
  const years = toNumber(yearsToBuy);
  const growth = toNumber(priceGrowth);
  const downPct = toNumber(downPaymentPct);
  const charges = toNumber(chargesPct);
  const existing = toNumber(existingSavings);
  const returnPct = toNumber(expectedReturn);
  const loanRatePct = toNumber(loanRate);
  const tenure = toNumber(loanYears);

  const numbers = [price, years, growth, downPct, charges, existing, returnPct, loanRatePct, tenure];
  if (numbers.some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Prices, rates and years cannot be negative." };
  }
  if (!(price > 0)) return { error: "Enter today's price of the property." };
  if (!(years > 0) || years > MAX_YEARS) {
    return { error: `Years until purchase should be between 1 and ${MAX_YEARS}.` };
  }
  if (downPct <= 0 || downPct > MAX_DOWN_PCT) {
    return { error: "Down payment should be between 1% and 100% of the price." };
  }
  if (charges > MAX_CHARGES_PCT) {
    return { error: `Stamp duty and charges above ${MAX_CHARGES_PCT}% are not realistic.` };
  }
  if (growth > MAX_RATE_PCT || returnPct > MAX_RATE_PCT || loanRatePct > MAX_RATE_PCT) {
    return { error: `Growth, return and loan rates should each be ${MAX_RATE_PCT}% a year or less.` };
  }
  if (!(tenure > 0) || tenure > MAX_LOAN_YEARS) {
    return { error: `Loan tenure should be between 1 and ${MAX_LOAN_YEARS} years.` };
  }

  const months = Math.round(years * 12);
  const futurePrice = price * Math.pow(1 + growth / 100, years);
  const downPayment = (futurePrice * downPct) / 100;
  const chargesAmount = (futurePrice * charges) / 100;
  const cashNeeded = downPayment + chargesAmount;
  const loanAmount = futurePrice - downPayment;

  const i = returnPct / 100 / 12;
  const growthFactor = Math.pow(1 + i, months);
  const existingFuture = existing * growthFactor;
  const gap = Math.max(0, cashNeeded - existingFuture);

  let monthlySaving = 0;
  if (gap > 0) {
    monthlySaving = i <= 0 ? gap / months : (gap * i) / (growthFactor - 1);
    if (!Number.isFinite(monthlySaving)) monthlySaving = 0;
  }

  const totalContributed = monthlySaving * months;
  const growthEarned = Math.max(0, gap - totalContributed);

  const { maxLoan, maxLtvPct, slabLabel } = maxLoanUnderLtvCap(futurePrice);
  const minDownPayment = futurePrice - maxLoan;
  const meetsLtvCap = loanAmount <= maxLoan + 0.5;
  const shortfallVsCap = Math.max(0, minDownPayment - downPayment);

  const emi = emiFor(loanAmount, loanRatePct, Math.round(tenure * 12));

  return {
    months,
    futurePrice: round0(futurePrice),
    priceIncrease: round0(futurePrice - price),
    downPayment: round0(downPayment),
    downPaymentPct: round1(downPct),
    chargesAmount: round0(chargesAmount),
    cashNeeded: round0(cashNeeded),
    loanAmount: round0(loanAmount),
    existingFuture: round0(existingFuture),
    gap: round0(gap),
    monthlySaving: round0(monthlySaving),
    totalContributed: round0(totalContributed),
    growthEarned: round0(growthEarned),
    maxLoan: round0(maxLoan),
    maxLtvPct,
    ltvSlabLabel: slabLabel,
    minDownPayment: round0(minDownPayment),
    minDownPaymentPct: round2((minDownPayment / futurePrice) * 100),
    meetsLtvCap,
    shortfallVsCap: round0(shortfallVsCap),
    emi: round0(emi),
    loanMonths: Math.round(tenure * 12),
    fullyFunded: gap <= 0,
  };
}
