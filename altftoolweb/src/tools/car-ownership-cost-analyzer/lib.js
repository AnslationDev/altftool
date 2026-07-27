/**
 * Car Ownership Cost Analyzer — pure logic.
 *
 * Answers "what does this car actually cost me?" rather than "what is the
 * sticker price?". Four cost blocks are added together:
 *
 *   1. Financing — a standard reducing-balance EMI on the loan amount.
 *   2. Running   — fuel, insurance, maintenance, parking and tolls.
 *   3. One-off   — registration/road tax and accessories, charged in year 1.
 *   4. Depreciation — purchase price minus what the car is worth when sold.
 *
 * Every function here is pure: pass the same car object and you get the same
 * numbers back. No Date, no DOM, no formatting.
 */

/** Months in a year — used for every monthly/annual conversion. */
const MONTHS_PER_YEAR = 12;

/** Days per month used to turn a monthly cost into a daily one. */
const DAYS_PER_MONTH = 30;

/** Horizons the tool reports, in years. */
export const COST_HORIZONS = [1, 3, 5, 10];

/**
 * Budget bands as a share of monthly take-home pay.
 * The widely quoted "20/4/10" car-buying rule caps all car costs — EMI,
 * fuel, insurance, maintenance — at 10% of gross income; these bands sit
 * slightly higher because the input here is monthly income and the figure
 * includes fuel and tolls, which the 10% rule often omits.
 */
export const BUDGET_COMFORTABLE_MAX = 15;
export const BUDGET_MANAGEABLE_MAX = 25;

/** A worked example so the tool shows a real answer on first paint. */
export const DEFAULT_CAR = {
  name: "",
  price: "1000000",
  downPayment: "200000",
  loanAmount: "800000",
  interestRate: "9",
  loanTenure: 5,
  fuelType: "petrol",
  mileage: "16",
  monthlyKM: "1200",
  fuelPrice: "105",
  insurance: "25000",
  maintenance: "12000",
  parking: "1000",
  toll: "500",
  registration: "100000",
  accessories: "30000",
  serviceFrequency: 6,
  ownershipYears: 5,
  resaleValue: "40",
  annualKMGrowth: "",
  fuelInflation: "5",
  unexpectedRepairs: "",
  tyreCost: "",
  monthlyIncome: "120000",
  taxiFarePerKM: "18",
  dailyTaxiFare: "",
  taxiCalcMode: "km",
};

/** Parse a form value into a finite number, falling back to `fallback`. */
function num(value, fallback = 0) {
  const parsed = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Equated monthly instalment on a reducing-balance loan.
 *   EMI = P · r · (1+r)^n / ((1+r)^n − 1),  r = annual rate / 12 / 100
 * A zero-interest loan is simply the principal spread over the tenure.
 *
 * @returns {{ error: string } | { emi: number, totalInterest: number, totalPayable: number }}
 */
export function calculateEmi({ principal, annualRatePercent, years }) {
  const p = num(principal);
  const rate = num(annualRatePercent);
  const tenure = num(years);

  if (p < 0) return { error: "Loan amount cannot be negative." };
  if (rate < 0) return { error: "Interest rate cannot be negative." };
  if (tenure <= 0) return { error: "Loan tenure must be at least one month." };

  const months = tenure * MONTHS_PER_YEAR;
  if (p === 0) return { emi: 0, totalInterest: 0, totalPayable: 0 };
  if (rate === 0) return { emi: p / months, totalInterest: 0, totalPayable: p };

  const monthlyRate = rate / 100 / MONTHS_PER_YEAR;
  const growth = Math.pow(1 + monthlyRate, months);
  const emi = (p * monthlyRate * growth) / (growth - 1);
  return { emi, totalInterest: emi * months - p, totalPayable: emi * months };
}

/**
 * Fuel spend for each of the first `years` years, with pump prices rising by
 * `inflationPercent` a year. Year 1 pays today's price.
 *   litres per year = monthlyKM × 12 / kmPerLitre
 */
export function yearlyFuelCosts({ monthlyKM, kmPerLitre, fuelPrice, inflationPercent, years = 10 }) {
  const km = num(monthlyKM);
  const mileage = num(kmPerLitre);
  const price = num(fuelPrice);
  const inflation = num(inflationPercent);

  if (mileage <= 0) return { error: "Mileage must be greater than zero km per litre." };
  if (km < 0 || price < 0) return { error: "Distance and fuel price cannot be negative." };

  const litresPerYear = (km * MONTHS_PER_YEAR) / mileage;
  return {
    costs: Array.from({ length: years }, (_, index) =>
      litresPerYear * price * Math.pow(1 + inflation / 100, index),
    ),
  };
}

/**
 * Full ownership analysis for one car.
 *
 * @param {object} car — the form state; every field is a string or number.
 * @returns {{ error: string } | object} the cost breakdown.
 */
export function analyzeCarCost(car = {}) {
  const price = num(car.price);
  const loanAmount = num(car.loanAmount);
  const monthlyKM = num(car.monthlyKM);
  const mileage = num(car.mileage);
  const fuelPrice = num(car.fuelPrice);
  const insurance = num(car.insurance);
  const maintenance = num(car.maintenance);
  const parking = num(car.parking);
  const toll = num(car.toll);
  const registration = num(car.registration);
  const accessories = num(car.accessories);
  const ownershipYears = num(car.ownershipYears, 5);
  const resalePercent = num(car.resaleValue);
  const monthlyIncome = num(car.monthlyIncome);
  const taxiFare = num(car.taxiFarePerKM);
  const dailyTaxiFare = num(car.dailyTaxiFare);
  const taxiCalcMode = car.taxiCalcMode === "daily" ? "daily" : "km";

  if (price < 0) return { error: "Car price cannot be negative." };
  if (loanAmount > price && price > 0) {
    return { error: "The loan cannot be larger than the car price." };
  }
  if (mileage <= 0) return { error: "Enter mileage in km per litre — it must be above zero." };
  if (resalePercent < 0 || resalePercent > 100) {
    return { error: "Resale value must be between 0% and 100% of the purchase price." };
  }
  if (ownershipYears <= 0) return { error: "Ownership period must be at least one year." };

  const loan = calculateEmi({
    principal: loanAmount,
    annualRatePercent: car.interestRate,
    years: car.loanTenure,
  });
  if (loan.error) return loan;

  const fuel = yearlyFuelCosts({
    monthlyKM,
    kmPerLitre: mileage,
    fuelPrice,
    inflationPercent: car.fuelInflation,
    years: 10,
  });
  if (fuel.error) return fuel;

  const monthlyFuel = fuel.costs[0] / MONTHS_PER_YEAR;
  const monthlyFixed = parking + toll + maintenance / MONTHS_PER_YEAR + insurance / MONTHS_PER_YEAR;
  const monthlyCost = loan.emi + monthlyFuel + monthlyFixed;

  // Running cost for `yrs` years: fixed costs every month plus that year's
  // inflated fuel bill, with the one-off charges added in year 1.
  const runningCostFor = (yrs) => {
    let total = registration + accessories;
    for (let year = 0; year < yrs; year += 1) {
      total += monthlyFixed * MONTHS_PER_YEAR;
      total += loan.emi * MONTHS_PER_YEAR;
      total += fuel.costs[Math.min(year, fuel.costs.length - 1)];
    }
    return total;
  };

  // Depreciation is only realised when the car is sold, so it is charged in
  // full at the end of the ownership period and pro-rated before that.
  const resaleAmount = (price * resalePercent) / 100;
  const totalDepreciation = price - resaleAmount;
  const depreciationFor = (yrs) =>
    totalDepreciation * Math.min(1, yrs / ownershipYears);

  const taxiCostFor = (yrs) =>
    taxiCalcMode === "daily"
      ? dailyTaxiFare * DAYS_PER_MONTH * MONTHS_PER_YEAR * yrs
      : monthlyKM * taxiFare * MONTHS_PER_YEAR * yrs;

  const horizons = {};
  for (const yrs of COST_HORIZONS) {
    horizons[`totalCost${yrs}Y`] = runningCostFor(yrs);
    horizons[`ownershipCost${yrs}Y`] = runningCostFor(yrs) + depreciationFor(yrs);
    horizons[`taxi${yrs}Y`] = taxiCostFor(yrs);
  }

  // Cost per km is undefined when the car is never driven — report null so the
  // UI can print a dash instead of Infinity.
  const costPerKM =
    monthlyKM > 0 ? Math.round((monthlyCost / monthlyKM) * 100) / 100 : null;

  const budgetPercent = monthlyIncome > 0 ? (monthlyCost / monthlyIncome) * 100 : 0;

  return {
    emi: Math.round(loan.emi),
    totalInterest: Math.round(loan.totalInterest),
    monthlyFuel: Math.round(monthlyFuel),
    monthlyCost: Math.round(monthlyCost),
    dailyCost: Math.round(monthlyCost / DAYS_PER_MONTH),
    costPerKM,
    resaleAmount: Math.round(resaleAmount),
    totalDepreciation: Math.round(totalDepreciation),
    ownershipYears,
    ...horizons,
    budgetPercent,
    yearlyFuelCosts: fuel.costs,
  };
}

/**
 * First horizon at which owning is cheaper than the taxi alternative.
 * Returns 0 when the taxi wins at every horizon tested.
 */
export function breakevenYear(result) {
  if (!result || result.error) return 0;
  for (const yrs of COST_HORIZONS) {
    if (result[`ownershipCost${yrs}Y`] < result[`taxi${yrs}Y`]) return yrs;
  }
  return 0;
}
