/**
 * Cost of holding a bank safe deposit locker in India, and the protection gap
 * created by the RBI cap on a bank's liability.
 *
 * Rule sources:
 *
 *  - RBI circular DOR.LEG.REC/40/09.07.005/2021-22 dated 18 August 2021, "Safe
 *    Deposit Locker / Safe Custody Article Facility provided by the banks", in force
 *    from 1 January 2022:
 *      • the bank may take a Term Deposit at the time of allotment covering three
 *        years' rent plus the charges of breaking open the locker, but must not
 *        insist on one from an existing locker holder or a customer with a
 *        satisfactory operative account;
 *      • where loss is caused by fire, theft, burglary, robbery, dacoity, building
 *        collapse or fraud by bank employees, the bank's liability "shall not exceed
 *        one hundred times the prevailing annual rent" of the locker;
 *      • the bank is NOT liable for loss from natural calamities or Acts of God such
 *        as earthquake, flood, thunderstorm or lightning, nor for loss caused by the
 *        customer's own negligence;
 *      • rent is collected in advance, with a proportionate refund on surrender;
 *      • banks may not offer insurance of locker contents, so contents cover has to
 *        be bought separately by the customer.
 *
 *  - GST: renting of a safe deposit locker is a taxable service and attracts GST at
 *    18%.
 *
 * The locker rent itself is set by each bank's schedule of charges and is not
 * regulated, so it is an input here. The indicative table below is only a starting
 * point for that input — no result in this module depends on it once the user enters
 * their own rent.
 */

/** RBI cap on a bank's liability, as a multiple of the prevailing annual rent. */
export const BANK_LIABILITY_RENT_MULTIPLE = 100;

/** Years of rent a bank may cover through the security term deposit. */
export const SECURITY_DEPOSIT_YEARS_OF_RENT = 3;

/** GST on locker rent. */
export const GST_PERCENT = 18;

/** Bank fixed deposits compound interest quarterly. */
export const FD_COMPOUNDS_PER_YEAR = 4;

/** Losses the RBI circular expressly places on the bank, up to the liability cap. */
export const BANK_LIABLE_EVENTS = [
  "Fire",
  "Theft, burglary, robbery or dacoity",
  "Building collapse",
  "Fraud by bank employees",
];

/** Losses the RBI circular expressly excludes from the bank's liability. */
export const BANK_NOT_LIABLE_EVENTS = [
  "Earthquake, flood, lightning or thunderstorm",
  "Any other Act of God",
  "Loss caused by the customer's own negligence",
];

/**
 * Indicative annual rent (before GST) by locker size and centre, used only to
 * pre-fill the rent box. Rents are set bank by bank and are not regulated — always
 * replace these with the figure in your own bank's schedule of charges.
 */
export const INDICATIVE_ANNUAL_RENT = {
  small: { metro: 2000, urban: 1500, semiUrban: 1200, rural: 1000 },
  medium: { metro: 4000, urban: 3000, semiUrban: 2500, rural: 2000 },
  large: { metro: 8000, urban: 6000, semiUrban: 4500, rural: 4000 },
  extraLarge: { metro: 12000, urban: 9000, semiUrban: 8000, rural: 7000 },
};

export const LOCKER_SIZES = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
  { id: "extraLarge", label: "Extra large" },
];

export const CENTRE_TYPES = [
  { id: "metro", label: "Metro" },
  { id: "urban", label: "Urban" },
  { id: "semiUrban", label: "Semi-urban" },
  { id: "rural", label: "Rural" },
];

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Look up the indicative starting rent for a size and centre.
 * @returns {number} annual rent before GST, or 0 when the combination is unknown.
 */
export function indicativeRent(size, centre) {
  const row = INDICATIVE_ANNUAL_RENT[size];
  if (!row) return 0;
  const value = row[centre];
  return Number.isFinite(value) ? value : 0;
}

/**
 * Maturity value of a bank fixed deposit compounded quarterly.
 *
 * @param {number} principal   Amount placed on deposit.
 * @param {number} annualRate  Nominal annual rate in percent.
 * @param {number} years       Term in years.
 * @returns {number} maturity value, equal to the principal when the rate or term is zero.
 */
export function fixedDepositMaturity(principal, annualRate, years) {
  if (!(principal > 0)) return 0;
  if (!(annualRate > 0) || !(years > 0)) return round2(principal);
  const periodRate = annualRate / 100 / FD_COMPOUNDS_PER_YEAR;
  const periods = FD_COMPOUNDS_PER_YEAR * years;
  return round2(principal * Math.pow(1 + periodRate, periods));
}

/**
 * Full cost and protection picture for a locker held for a number of years.
 *
 * @returns {object} result object, or { error } when an input is not usable.
 */
export function estimateLockerCost({
  annualRent = 4000,
  years = 3,
  gstPercent = GST_PERCENT,
  requireTermDeposit = true,
  fdRatePercent = 6.5,
  contentsValue = 1500000,
  insuranceRatePercent = 1,
} = {}) {
  const rent = Number(annualRent);
  const term = Number(years);
  const gstRate = Number(gstPercent);
  const fdRate = Number(fdRatePercent);
  const contents = Number(contentsValue);
  const insRate = Number(insuranceRatePercent);

  const all = [rent, term, gstRate, fdRate, contents, insRate];
  if (!all.every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (all.some((value) => value < 0)) {
    return { error: "Rent, rates and values cannot be negative." };
  }
  if (rent <= 0) {
    return { error: "Enter the annual locker rent your bank charges." };
  }
  if (term <= 0 || term > 50) {
    return { error: "Enter a holding period between 1 and 50 years." };
  }
  if (gstRate > 100 || insRate > 100 || fdRate > 100) {
    return { error: "Percentages must be between 0 and 100." };
  }
  if (rent > 1e7 || contents > 1e12) {
    return { error: "That rent or contents value is outside the range of this estimator." };
  }

  const gstOnRent = round2((rent * gstRate) / 100);
  const annualRentWithGst = round2(rent + gstOnRent);
  const rentOverTerm = round2(annualRentWithGst * term);

  // RBI: security term deposit covers three years' rent plus break-open charges.
  const securityDeposit = requireTermDeposit
    ? round2(rent * SECURITY_DEPOSIT_YEARS_OF_RENT)
    : 0;
  const depositMaturity = requireTermDeposit
    ? fixedDepositMaturity(securityDeposit, fdRate, term)
    : 0;
  const depositInterest = round2(Math.max(0, depositMaturity - securityDeposit));

  // RBI: liability capped at 100x the prevailing annual rent, computed on the rent
  // itself rather than the GST-inclusive amount.
  const bankMaxLiability = round2(rent * BANK_LIABILITY_RENT_MULTIPLE);
  const uninsuredGap = round2(Math.max(0, contents - bankMaxLiability));
  const coveredShare = contents > 0 ? round2(Math.min(100, (bankMaxLiability / contents) * 100)) : 100;

  const annualInsurancePremium = round2((contents * insRate) / 100);
  const insuranceOverTerm = round2(annualInsurancePremium * term);

  const totalCost = round2(rentOverTerm + insuranceOverTerm);
  const costPerYear = round2(totalCost / term);
  const costPerMonth = round2(costPerYear / 12);
  const netCostAfterDepositInterest = round2(totalCost - depositInterest);

  let verdict;
  if (uninsuredGap <= 0) {
    verdict = "The bank's capped liability already exceeds what you plan to keep inside.";
  } else if (coveredShare < 10) {
    verdict = `The bank would cover under ${coveredShare}% of your contents even in a covered event — separate cover matters here.`;
  } else {
    verdict = `The bank would cover about ${coveredShare}% of your contents in a covered event.`;
  }

  return {
    annualRent: round2(rent),
    gstOnRent,
    gstPercent: gstRate,
    annualRentWithGst,
    years: term,
    rentOverTerm,
    requireTermDeposit: Boolean(requireTermDeposit),
    securityDeposit,
    depositMaturity,
    depositInterest,
    bankMaxLiability,
    contentsValue: round2(contents),
    uninsuredGap,
    coveredShare,
    annualInsurancePremium,
    insuranceOverTerm,
    totalCost,
    costPerYear,
    costPerMonth,
    netCostAfterDepositInterest,
    verdict,
  };
}

export default estimateLockerCost;
