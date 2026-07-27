/**
 * Rental yield maths for an Indian residential/commercial let-out property.
 *
 * Yield definitions follow standard property-investment practice:
 *   Gross yield        = contracted annual rent / purchase price
 *   Effective yield    = rent actually collected / total capital deployed
 *   Net yield          = net operating income / total capital deployed
 *
 * The tax layer follows the "Income from house property" head of the
 * Income-tax Act, 1961:
 *   Gross Annual Value (GAV)  = rent actually received/receivable
 *   less municipal taxes paid = Net Annual Value (NAV)   [Section 23]
 *   less 30% of NAV           = standard deduction        [Section 24(a)]
 *   less interest on borrowed capital                     [Section 24(b)]
 *   = Income (or loss) from house property
 * A resulting loss can be set off against other heads only up to
 * Rs 2,00,000 in a year [Section 71(3A), inserted by the Finance Act 2017];
 * the balance is carried forward for up to 8 assessment years [Section 71B].
 */

/** Section 24(a): flat 30% of Net Annual Value, allowed with no proof of spend. */
export const STANDARD_DEDUCTION_RATE = 0.3;

/** Section 71(3A): maximum house-property loss set off against other income in one year. */
export const HOUSE_PROPERTY_LOSS_SETOFF_CAP = 200000;

/** Section 71B: unabsorbed house-property loss carries forward this many assessment years. */
export const LOSS_CARRY_FORWARD_YEARS = 8;

/** Weeks used to pro-rate a vacancy period across a year. */
export const WEEKS_PER_YEAR = 52;

export const MONTHS_PER_YEAR = 12;

/** Slab rates a landlord can realistically sit in under the Income-tax Act. */
export const TAX_SLAB_OPTIONS = [0, 5, 10, 15, 20, 25, 30];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @returns {{error:string}|object} full yield + tax breakdown, all amounts per year in rupees.
 */
export function computeRentalYield({
  purchasePrice = 0,
  acquisitionCosts = 0,
  monthlyRent = 0,
  vacancyWeeks = 0,
  annualMaintenance = 0,
  annualPropertyTax = 0,
  annualInsurance = 0,
  managementFeePct = 0,
  annualLoanInterest = 0,
  taxSlabPct = 0,
  annualAppreciationPct = 0,
} = {}) {
  const values = {
    purchasePrice,
    acquisitionCosts,
    monthlyRent,
    vacancyWeeks,
    annualMaintenance,
    annualPropertyTax,
    annualInsurance,
    managementFeePct,
    annualLoanInterest,
    taxSlabPct,
    annualAppreciationPct,
  };

  for (const [key, value] of Object.entries(values)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${key}.` };
  }

  if (purchasePrice <= 0) return { error: "Property purchase price must be greater than zero." };
  if (
    acquisitionCosts < 0 ||
    monthlyRent < 0 ||
    annualMaintenance < 0 ||
    annualPropertyTax < 0 ||
    annualInsurance < 0 ||
    annualLoanInterest < 0
  ) {
    return { error: "Costs, rent and interest cannot be negative." };
  }
  if (vacancyWeeks < 0 || vacancyWeeks > WEEKS_PER_YEAR) {
    return { error: `Vacancy must be between 0 and ${WEEKS_PER_YEAR} weeks a year.` };
  }
  if (managementFeePct < 0 || managementFeePct > 100) {
    return { error: "Property management fee must be between 0% and 100% of rent." };
  }
  if (taxSlabPct < 0 || taxSlabPct > 50) {
    return { error: "Income tax slab rate must be between 0% and 50%." };
  }
  if (annualAppreciationPct < -50 || annualAppreciationPct > 100) {
    return { error: "Expected annual appreciation should be between -50% and 100%." };
  }

  const totalInvestment = purchasePrice + acquisitionCosts;

  // --- Rent -------------------------------------------------------------
  const contractedAnnualRent = monthlyRent * MONTHS_PER_YEAR;
  const occupancyFactor = 1 - vacancyWeeks / WEEKS_PER_YEAR;
  const vacancyLoss = contractedAnnualRent * (vacancyWeeks / WEEKS_PER_YEAR);
  const collectedRent = contractedAnnualRent * occupancyFactor;

  // --- Cash operating costs --------------------------------------------
  const managementFee = collectedRent * (managementFeePct / 100);
  const operatingExpenses =
    annualMaintenance + annualPropertyTax + annualInsurance + managementFee;
  const netOperatingIncome = collectedRent - operatingExpenses;

  // --- Income from house property (Sections 23, 24) ---------------------
  const grossAnnualValue = collectedRent;
  const netAnnualValue = Math.max(0, grossAnnualValue - annualPropertyTax);
  const standardDeduction = netAnnualValue * STANDARD_DEDUCTION_RATE;
  const housePropertyIncome = netAnnualValue - standardDeduction - annualLoanInterest;

  const slab = taxSlabPct / 100;
  let taxPayable = 0;
  let taxSaved = 0;
  let allowableLossThisYear = 0;
  let lossCarriedForward = 0;

  if (housePropertyIncome >= 0) {
    taxPayable = housePropertyIncome * slab;
  } else {
    const loss = -housePropertyIncome;
    allowableLossThisYear = Math.min(loss, HOUSE_PROPERTY_LOSS_SETOFF_CAP);
    lossCarriedForward = loss - allowableLossThisYear;
    taxSaved = allowableLossThisYear * slab;
  }

  const netIncomeAfterTax = netOperatingIncome - taxPayable + taxSaved;
  const cashFlowAfterInterest = netIncomeAfterTax - annualLoanInterest;

  // --- Yields -----------------------------------------------------------
  const grossYield = (contractedAnnualRent / purchasePrice) * 100;
  const effectiveGrossYield = (collectedRent / totalInvestment) * 100;
  const netYieldBeforeTax = (netOperatingIncome / totalInvestment) * 100;
  const netYieldAfterTax = (netIncomeAfterTax / totalInvestment) * 100;
  const totalReturnWithAppreciation = netYieldAfterTax + annualAppreciationPct;

  const expenseRatio = collectedRent > 0 ? (operatingExpenses / collectedRent) * 100 : 0;
  const paybackYears = netIncomeAfterTax > 0 ? totalInvestment / netIncomeAfterTax : null;
  const rentToPriceMonths = monthlyRent > 0 ? purchasePrice / monthlyRent : null;

  return {
    totalInvestment,
    contractedAnnualRent,
    vacancyLoss,
    collectedRent,
    occupancyPct: occupancyFactor * 100,
    managementFee,
    operatingExpenses,
    netOperatingIncome,
    grossAnnualValue,
    netAnnualValue,
    standardDeduction,
    annualLoanInterest,
    housePropertyIncome,
    allowableLossThisYear,
    lossCarriedForward,
    taxPayable,
    taxSaved,
    netIncomeAfterTax,
    monthlyNetIncomeAfterTax: netIncomeAfterTax / MONTHS_PER_YEAR,
    cashFlowAfterInterest,
    grossYield,
    effectiveGrossYield,
    netYieldBeforeTax,
    netYieldAfterTax,
    totalReturnWithAppreciation,
    expenseRatio,
    paybackYears,
    rentToPriceMonths,
  };
}
