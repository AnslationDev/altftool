/**
 * Car purchase planner: down payment, EMI comfort and total cost of ownership.
 *
 * 1. Price on the purchase date
 *        futurePrice = onRoadPriceToday * (1 + g)^yearsToBuy
 *
 * 2. Down payment and loan
 *        downPayment = futurePrice * downPct
 *        loan        = futurePrice - downPayment
 *        EMI         = loan * i * (1+i)^n / ((1+i)^n - 1)   with i = rate/12, n = tenure months
 *
 * 3. The 20/4/10 rule — the standard affordability test for a car purchase:
 *        - put down at least 20% of the price,
 *        - take a loan no longer than 4 years,
 *        - keep total car costs (EMI plus fuel, insurance and maintenance) under 10% of
 *          gross monthly income.
 *    Each leg is reported separately so you can see which one fails.
 *
 * 4. Total cost of ownership over the years you keep the car
 *        TCO = downPayment + EMI*n + (insurance + fuel + maintenance) * holdingYears - resale
 *        fuelPerYear = kmPerYear / mileage * fuelPrice
 *
 * 5. Resale value. Depreciation follows the schedule the India Motor Tariff (GR.8) uses to
 *    fix Insured Declared Value, which is the only published age-to-value table in Indian
 *    motor insurance:
 *        up to 6 months 5%, 6 months to 1 year 15%, 1-2 years 20%, 2-3 years 30%,
 *        3-4 years 40%, 4-5 years 50%.
 *    The tariff stops at five years — beyond that IDV is fixed by agreement — so for longer
 *    holdings this module continues the decline at 10% of the remaining value per year as a
 *    stated convention, not as a tariff figure. IDV is set on the ex-showroom price, so the
 *    schedule is applied to the ex-showroom share of the on-road price rather than to the
 *    full on-road figure, which includes road tax and registration that have no resale value.
 *
 * 6. Saving for the down payment: existing savings compound to the purchase date and the
 *    rest comes from an ordinary annuity, C = gap * i / ((1+i)^n - 1).
 */

/** India Motor Tariff GR.8 depreciation for IDV, by completed vehicle age in years. */
export const IDV_DEPRECIATION = [
  { maxAgeYears: 0.5, depreciationPct: 5 },
  { maxAgeYears: 1, depreciationPct: 15 },
  { maxAgeYears: 2, depreciationPct: 20 },
  { maxAgeYears: 3, depreciationPct: 30 },
  { maxAgeYears: 4, depreciationPct: 40 },
  { maxAgeYears: 5, depreciationPct: 50 },
];
/** No tariff figure exists past five years; this continued decline is a stated convention. */
export const POST_TARIFF_ANNUAL_DECLINE_PCT = 10;

/** The 20/4/10 rule of thumb for car affordability. */
export const RULE_MIN_DOWN_PCT = 20;
export const RULE_MAX_LOAN_YEARS = 4;
export const RULE_MAX_COST_OF_INCOME_PCT = 10;

export const MAX_YEARS_TO_BUY = 10;
export const MAX_LOAN_YEARS = 8;
export const MAX_HOLDING_YEARS = 20;
export const MAX_RATE_PCT = 30;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/** Share of the original value still left after `years` of ownership. */
export function residualValueFactor(years) {
  if (!(years > 0)) return 1;
  for (const band of IDV_DEPRECIATION) {
    if (years <= band.maxAgeYears) return 1 - band.depreciationPct / 100;
  }
  const lastPct = IDV_DEPRECIATION[IDV_DEPRECIATION.length - 1].depreciationPct;
  const extraYears = years - IDV_DEPRECIATION[IDV_DEPRECIATION.length - 1].maxAgeYears;
  return (1 - lastPct / 100) * Math.pow(1 - POST_TARIFF_ANNUAL_DECLINE_PCT / 100, extraYears);
}

/** Standard reducing-balance EMI. */
export function emiFor(principal, annualRatePct, months) {
  if (!(principal > 0) || !(months > 0)) return 0;
  const i = annualRatePct / 12 / 100;
  if (i <= 0) return principal / months;
  const growth = Math.pow(1 + i, months);
  return (principal * i * growth) / (growth - 1);
}

/**
 * @param {object} input
 * @param {number|string} input.onRoadPrice Today's on-road price of the car.
 * @param {number|string} [input.yearsToBuy] Years until you buy.
 * @param {number|string} [input.priceGrowth] Car price inflation, % per year.
 * @param {number|string} [input.downPaymentPct] Down payment as a % of the price.
 * @param {number|string} [input.loanRate] Car loan rate, % per year.
 * @param {number|string} [input.loanYears] Loan tenure in years.
 * @param {number|string} [input.grossMonthlyIncome] Gross monthly income, for the 20/4/10 test.
 * @param {number|string} [input.holdingYears] How long you expect to keep the car.
 * @param {number|string} [input.kmPerYear] Kilometres driven a year.
 * @param {number|string} [input.mileage] Fuel efficiency in km per litre (or km per kWh unit).
 * @param {number|string} [input.fuelPrice] Fuel price per litre (or per unit).
 * @param {number|string} [input.insurancePerYear] Insurance premium per year.
 * @param {number|string} [input.maintenancePerYear] Service and repairs per year.
 * @param {number|string} [input.exShowroomSharePct] Ex-showroom price as a % of on-road price.
 * @param {number|string} [input.existingSavings] Already saved towards the down payment.
 * @param {number|string} [input.savingsReturn] Return on those savings, % per year.
 */
export function planCarPurchase({
  onRoadPrice,
  yearsToBuy = 1,
  priceGrowth = 0,
  downPaymentPct = 20,
  loanRate = 9.5,
  loanYears = 5,
  grossMonthlyIncome = 0,
  holdingYears = 5,
  kmPerYear = 12000,
  mileage = 15,
  fuelPrice = 105,
  insurancePerYear = 25000,
  maintenancePerYear = 12000,
  exShowroomSharePct = 85,
  existingSavings = 0,
  savingsReturn = 0,
} = {}) {
  const price = toNumber(onRoadPrice);
  const buyYears = toNumber(yearsToBuy);
  const growth = toNumber(priceGrowth);
  const downPct = toNumber(downPaymentPct);
  const rate = toNumber(loanRate);
  const tenure = toNumber(loanYears);
  const income = toNumber(grossMonthlyIncome);
  const holding = toNumber(holdingYears);
  const km = toNumber(kmPerYear);
  const kmpl = toNumber(mileage);
  const fuel = toNumber(fuelPrice);
  const insurance = toNumber(insurancePerYear);
  const maintenance = toNumber(maintenancePerYear);
  const exShare = toNumber(exShowroomSharePct);
  const existing = toNumber(existingSavings);
  const returnPct = toNumber(savingsReturn);

  const numbers = [
    price, buyYears, growth, downPct, rate, tenure, income, holding, km, kmpl, fuel,
    insurance, maintenance, exShare, existing, returnPct,
  ];
  if (numbers.some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Prices, rates, distances and years cannot be negative." };
  }
  if (!(price > 0)) return { error: "Enter the on-road price of the car." };
  if (!(buyYears > 0) || buyYears > MAX_YEARS_TO_BUY) {
    return { error: `Years until purchase should be between 1 and ${MAX_YEARS_TO_BUY}.` };
  }
  if (downPct <= 0 || downPct > 100) {
    return { error: "Down payment should be between 1% and 100% of the price." };
  }
  if (!(tenure > 0) || tenure > MAX_LOAN_YEARS) {
    return { error: `Car loan tenure should be between 1 and ${MAX_LOAN_YEARS} years.` };
  }
  if (!(holding >= 1) || holding > MAX_HOLDING_YEARS) {
    return { error: `Holding period should be between 1 and ${MAX_HOLDING_YEARS} years.` };
  }
  if (!(kmpl > 0)) return { error: "Enter fuel efficiency greater than zero km per litre." };
  if (exShare <= 0 || exShare > 100) {
    return { error: "The ex-showroom share should be between 1% and 100% of the on-road price." };
  }
  if (rate > MAX_RATE_PCT || growth > MAX_RATE_PCT || returnPct > MAX_RATE_PCT) {
    return { error: `Rates should each be ${MAX_RATE_PCT}% a year or less.` };
  }

  const buyMonths = Math.round(buyYears * 12);
  const loanMonths = Math.round(tenure * 12);
  const futurePrice = price * Math.pow(1 + growth / 100, buyYears);
  const downPayment = (futurePrice * downPct) / 100;
  const loanAmount = futurePrice - downPayment;
  const emi = emiFor(loanAmount, rate, loanMonths);
  const totalRepaid = emi * loanMonths;
  const totalInterest = Math.max(0, totalRepaid - loanAmount);

  const fuelPerYear = (km / kmpl) * fuel;
  const runningPerYear = fuelPerYear + insurance + maintenance;
  const runningPerMonth = runningPerYear / 12;

  // The loan may end before or after you sell, so only the EMIs actually paid are counted.
  const emiMonthsInHolding = Math.min(loanMonths, Math.round(holding * 12));
  const emiPaidInHolding = emi * emiMonthsInHolding;

  const exShowroomFuture = (futurePrice * exShare) / 100;
  const resale = exShowroomFuture * residualValueFactor(holding);
  const runningTotal = runningPerYear * holding;
  const tco = downPayment + emiPaidInHolding + runningTotal - resale;
  const tcoPerMonth = tco / (holding * 12);
  const tcoPerKm = km > 0 ? tco / (km * holding) : null;

  const monthlyCarCost = emi + runningPerMonth;
  const emiSharePct = income > 0 ? (emi / income) * 100 : null;
  const costSharePct = income > 0 ? (monthlyCarCost / income) * 100 : null;

  const rule = {
    downOk: downPct >= RULE_MIN_DOWN_PCT,
    tenureOk: tenure <= RULE_MAX_LOAN_YEARS,
    costOk: costSharePct === null ? null : costSharePct <= RULE_MAX_COST_OF_INCOME_PCT,
  };
  const rulePasses = rule.downOk && rule.tenureOk && rule.costOk === true;

  const i = returnPct / 100 / 12;
  const growthFactor = Math.pow(1 + i, buyMonths);
  const existingFuture = existing * growthFactor;
  const gap = Math.max(0, downPayment - existingFuture);
  let monthlySaving = 0;
  if (gap > 0) {
    monthlySaving = i <= 0 ? gap / buyMonths : (gap * i) / (growthFactor - 1);
    if (!Number.isFinite(monthlySaving)) monthlySaving = 0;
  }

  return {
    buyMonths,
    loanMonths,
    holdingYears: round1(holding),
    futurePrice: round0(futurePrice),
    priceIncrease: round0(futurePrice - price),
    downPayment: round0(downPayment),
    downPaymentPct: round1(downPct),
    loanAmount: round0(loanAmount),
    emi: round0(emi),
    totalRepaid: round0(totalRepaid),
    totalInterest: round0(totalInterest),
    fuelPerYear: round0(fuelPerYear),
    insurancePerYear: round0(insurance),
    maintenancePerYear: round0(maintenance),
    runningPerYear: round0(runningPerYear),
    runningPerMonth: round0(runningPerMonth),
    monthlyCarCost: round0(monthlyCarCost),
    emiSharePct: emiSharePct === null ? null : round1(emiSharePct),
    costSharePct: costSharePct === null ? null : round1(costSharePct),
    rule,
    rulePasses,
    resale: round0(resale),
    residualPct: round1(residualValueFactor(holding) * 100),
    runningTotal: round0(runningTotal),
    emiPaidInHolding: round0(emiPaidInHolding),
    tco: round0(tco),
    tcoPerMonth: round0(tcoPerMonth),
    tcoPerKm: tcoPerKm === null ? null : round2(tcoPerKm),
    existingFuture: round0(existingFuture),
    downPaymentGap: round0(gap),
    monthlySaving: round0(monthlySaving),
    downPaymentFunded: gap <= 0,
  };
}
