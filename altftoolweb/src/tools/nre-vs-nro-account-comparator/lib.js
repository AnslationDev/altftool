/**
 * NRE vs NRO deposit comparison for non-resident Indians.
 *
 * Rules applied:
 *  - NRE (Non-Resident External) interest is EXEMPT under Section 10(4)(ii) of the
 *    Income-tax Act for a person who is a person resident outside India under FEMA,
 *    so no TDS is deducted and the deposit compounds gross.
 *  - NRO (Non-Resident Ordinary) interest is fully taxable in India. Tax is withheld
 *    under Section 195 at 30%, plus surcharge where the payment crosses the
 *    thresholds and 4% health and education cess, giving 31.2% in the ordinary case.
 *  - Where a Double Taxation Avoidance Agreement gives a lower rate on interest, that
 *    treaty rate applies in place of 30% and is inclusive — surcharge and cess are
 *    not added on top. Claiming it needs a Tax Residency Certificate, Form 10F and
 *    a no-permanent-establishment declaration.
 *  - Repatriation: NRE principal and interest are freely repatriable. Balances in an
 *    NRO account are repatriable up to USD 1 million per financial year under the
 *    FEMA remittance facility, with Forms 15CA and 15CB.
 *
 * Modelling note: TDS on an NRO deposit is withheld when interest is credited, so the
 * balance compounds NET of tax. The surcharge band for each credit is decided from
 * that credit annualised, which is how a bank sizes the withholding on a payment.
 */

/** Section 195 base withholding rate on NRO interest paid to a non-resident. */
export const NRO_BASE_TDS_RATE = 0.3;

/** Health and education cess loaded on tax and surcharge. */
export const CESS_RATE = 0.04;

/** Surcharge on tax withheld from a non-resident individual, by amount of income. */
export const SURCHARGE_BANDS = [
  { threshold: 5000000, rate: 0.1 },
  { threshold: 10000000, rate: 0.15 },
  { threshold: 20000000, rate: 0.25 },
];

/** FEMA repatriation ceiling for NRO balances, per financial year. */
export const NRO_REPATRIATION_LIMIT_USD = 1000000;

/** Compounding options a bank deposit normally offers. */
export const COMPOUNDING_OPTIONS = [
  { value: 4, label: "Quarterly (standard for bank FDs)" },
  { value: 2, label: "Half-yearly" },
  { value: 1, label: "Annually" },
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Surcharge rate that applies to an amount of income. */
export function surchargeRateFor(income) {
  if (!isFiniteNumber(income) || income <= 0) return 0;
  let rate = 0;
  for (const band of SURCHARGE_BANDS) {
    if (income > band.threshold) rate = band.rate;
  }
  return rate;
}

/**
 * All-in withholding rate on NRO interest.
 * @param {number} annualisedInterest Interest annualised, used only to pick the surcharge band.
 * @param {number|null} treatyRate     DTAA rate as a fraction, or null for the domestic rate.
 */
export function nroEffectiveTdsRate(annualisedInterest, treatyRate = null) {
  if (treatyRate !== null) {
    // A treaty rate is the maximum India may charge, so it is not grossed up.
    return treatyRate;
  }
  const surcharge = surchargeRateFor(annualisedInterest);
  return NRO_BASE_TDS_RATE * (1 + surcharge) * (1 + CESS_RATE);
}

/**
 * Compare an identical deposit held as NRE and as NRO.
 *
 * @param {object} input
 * @param {number} input.principal          Amount deposited, in rupees.
 * @param {number} input.annualRate         Nominal interest rate, percent per year.
 * @param {number} input.years              Tenure in years.
 * @param {number} [input.compoundingPerYear] 4, 2 or 1.
 * @param {number|null} [input.treatyRatePercent] DTAA rate on interest, percent, or null.
 * @param {number} [input.usdInrRate]       Rupees per US dollar, for the repatriation cap.
 */
export function compareNreNro({
  principal,
  annualRate,
  years,
  compoundingPerYear = 4,
  treatyRatePercent = null,
  usdInrRate = 85,
}) {
  const numbers = [principal, annualRate, years, compoundingPerYear, usdInrRate];
  if (!numbers.every(isFiniteNumber)) {
    return { error: "Enter valid numbers in every field." };
  }
  if (treatyRatePercent !== null && !isFiniteNumber(treatyRatePercent)) {
    return { error: "Enter a valid DTAA rate, or switch the treaty rate off." };
  }
  if (principal <= 0) {
    return { error: "Deposit amount must be greater than zero." };
  }
  if (annualRate < 0 || annualRate > 30) {
    return { error: "Interest rate should be between 0% and 30% a year." };
  }
  if (years <= 0 || years > 20) {
    return { error: "Tenure should be between 0.25 and 20 years." };
  }
  if (![1, 2, 4].includes(Math.round(compoundingPerYear))) {
    return { error: "Compounding must be annual, half-yearly or quarterly." };
  }
  if (usdInrRate <= 0 || usdInrRate > 500) {
    return { error: "Enter a realistic rupees-per-dollar rate." };
  }
  if (treatyRatePercent !== null && (treatyRatePercent < 0 || treatyRatePercent > 30)) {
    return { error: "A DTAA rate on interest should be between 0% and 30%." };
  }

  const n = Math.round(compoundingPerYear);
  const periods = Math.round(years * n);
  if (periods < 1) {
    return { error: "The tenure is shorter than one compounding period." };
  }
  const periodRate = annualRate / 100 / n;
  const treatyRate = treatyRatePercent === null ? null : treatyRatePercent / 100;

  // NRE: exempt under Section 10(4)(ii), so it compounds gross.
  const nreMaturity = principal * Math.pow(1 + periodRate, periods);
  const nreInterest = nreMaturity - principal;

  // NRO: tax withheld at each credit, so the balance compounds net of TDS.
  let balance = principal;
  let grossInterest = 0;
  let tdsTotal = 0;
  let lastRate = 0;
  for (let period = 0; period < periods; period += 1) {
    const interest = balance * periodRate;
    const annualised = interest * n;
    const rate = nroEffectiveTdsRate(annualised, treatyRate);
    const tds = interest * rate;
    lastRate = rate;
    grossInterest += interest;
    tdsTotal += tds;
    balance += interest - tds;
  }
  const nroMaturity = balance;
  const nroNetInterest = grossInterest - tdsTotal;

  const effectiveAnnualYield = (value) => (Math.pow(value / principal, 1 / years) - 1) * 100;

  const repatriationCapInr = NRO_REPATRIATION_LIMIT_USD * usdInrRate;

  return {
    principal,
    years,
    periods,
    compoundingPerYear: n,
    usdInrRate,
    treatyRatePercent,
    nre: {
      maturity: nreMaturity,
      interest: nreInterest,
      tds: 0,
      netInterest: nreInterest,
      postTaxYield: effectiveAnnualYield(nreMaturity),
      repatriable: nreMaturity,
      repatriationCapped: false,
    },
    nro: {
      maturity: nroMaturity,
      interest: grossInterest,
      tds: tdsTotal,
      netInterest: nroNetInterest,
      effectiveTdsRate: lastRate * 100,
      postTaxYield: effectiveAnnualYield(nroMaturity),
      repatriable: Math.min(nroMaturity, repatriationCapInr),
      repatriationCapped: nroMaturity > repatriationCapInr,
      repatriationCapInr,
    },
    advantageToNre: nreMaturity - nroMaturity,
    advantageSharePercent: nroMaturity > 0 ? ((nreMaturity - nroMaturity) / nroMaturity) * 100 : 0,
  };
}

/** Feature-by-feature comparison, independent of any amount. */
export const FEATURE_MATRIX = [
  {
    feature: "Tax on interest in India",
    nre: "Exempt under Section 10(4)(ii) while you are a non-resident",
    nro: "Fully taxable as income from other sources",
  },
  {
    feature: "TDS",
    nre: "None",
    nro: "30% plus surcharge and 4% cess under Section 195, or the lower DTAA rate",
  },
  {
    feature: "What can be credited",
    nre: "Only funds earned outside India",
    nro: "Indian income such as rent, dividends, pension and sale proceeds, plus foreign funds",
  },
  {
    feature: "Repatriation",
    nre: "Principal and interest freely repatriable",
    nro: "Up to USD 1 million per financial year, with Forms 15CA and 15CB",
  },
  {
    feature: "Joint holding",
    nre: "With another NRI, or with a resident relative on a former-or-survivor basis",
    nro: "With another NRI or with a resident relative",
  },
  {
    feature: "Currency risk",
    nre: "Rupee denominated, so the rupee's fall against your home currency hits you",
    nro: "Rupee denominated, same exposure",
  },
];
