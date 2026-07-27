/**
 * Landlord PAN / rent-receipt / rent-TDS requirement rules for Indian house rent.
 *
 * Sources for every constant below:
 *  - CBDT Circular No. 8/2013 dated 10 October 2013 (carried forward in the annual
 *    salary-TDS circulars): rent receipts need not be insisted upon where rent is
 *    ₹3,000 or less per month, and the PAN of the landlord must be reported by the
 *    employee where the annual rent paid exceeds ₹1,00,000. Where the landlord has
 *    no PAN, a declaration from the landlord plus name and address must be filed.
 *  - Section 194-IB, Income-tax Act 1961: an individual/HUF not covered by the tax
 *    audit provisions who pays rent to a resident exceeding ₹50,000 for a month or
 *    part of a month must deduct tax once, in the last month of the previous year
 *    or the last month of tenancy, on the whole rent for that period.
 *  - Finance (No. 2) Act 2024: the 194-IB rate was cut from 5% to 2% with effect
 *    from 1 October 2024.
 *  - Section 206AA: where the payee does not furnish a PAN, tax is deducted at 20%.
 *    The proviso to section 194-IB(4) caps the deduction at the last month's rent.
 *  - Section 195: rent paid to a non-resident landlord is liable to TDS from the
 *    first rupee, at 30% plus the 4% health and education cess for an individual
 *    (surcharge extra at higher incomes, or a lower DTAA rate with a certificate).
 */

/** Rent receipts can be waived at or below this monthly rent (Circular 8/2013). */
export const RENT_RECEIPT_MONTHLY_LIMIT = 3000;

/** Landlord PAN must be reported once annual rent paid EXCEEDS this (Circular 8/2013). */
export const LANDLORD_PAN_ANNUAL_THRESHOLD = 100000;

/** Section 194-IB bites when monthly rent EXCEEDS this amount. */
export const SECTION_194IB_MONTHLY_THRESHOLD = 50000;

/** Section 194-IB rate from 1 October 2024 (Finance (No. 2) Act 2024). */
export const SECTION_194IB_RATE_PERCENT = 2;

/** Section 194-IB rate up to 30 September 2024. */
export const SECTION_194IB_RATE_PERCENT_LEGACY = 5;

/** Section 206AA rate where the landlord gives no PAN. */
export const NO_PAN_TDS_RATE_PERCENT = 20;

/** Section 195 base rate on rent to a non-resident individual landlord. */
export const SECTION_195_BASE_RATE_PERCENT = 30;

/** Health and education cess loaded on section 195 TDS. */
export const HEALTH_EDUCATION_CESS_PERCENT = 4;

/** Effective section 195 rate = 30% grossed up by the 4% cess = 31.2%. */
export const SECTION_195_EFFECTIVE_RATE_PERCENT =
  SECTION_195_BASE_RATE_PERCENT * (1 + HEALTH_EDUCATION_CESS_PERCENT / 100);

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {number} input.monthlyRent        Total rent for the whole house, per month, in INR.
 * @param {number} [input.months=12]        Months of rent paid in the financial year (1-12).
 * @param {number} [input.sharePercent=100] Share of that rent you personally pay (co-tenants).
 * @param {boolean} [input.landlordHasPan=true]
 * @param {boolean} [input.landlordIsNonResident=false]
 * @param {number} [input.tdsRatePercent]   Override the 194-IB rate (use 5 for pre-Oct-2024).
 * @returns {object} plain result object, or { error } for invalid input
 */
export function checkLandlordPanRequirement({
  monthlyRent,
  months = 12,
  sharePercent = 100,
  landlordHasPan = true,
  landlordIsNonResident = false,
  tdsRatePercent = SECTION_194IB_RATE_PERCENT,
} = {}) {
  const rent = Number(monthlyRent);
  const monthCount = Number(months);
  const share = Number(sharePercent);
  const rate = Number(tdsRatePercent);

  if (![rent, monthCount, share, rate].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for rent, months, share and TDS rate." };
  }
  if (rent < 0) return { error: "Monthly rent cannot be negative." };
  if (rent === 0) return { error: "Enter the monthly rent you actually pay." };
  if (monthCount <= 0 || monthCount > 12) {
    return { error: "Months of rent paid in a financial year must be between 1 and 12." };
  }
  if (share <= 0 || share > 100) {
    return { error: "Your share of the rent must be between 1% and 100%." };
  }
  if (rate < 0 || rate > 40) {
    return { error: "TDS rate should be between 0% and 40%." };
  }

  const monthsPaid = Math.round(monthCount);
  const monthlyShare = round2((rent * share) / 100);
  const annualRent = round2(monthlyShare * monthsPaid);

  const rentReceiptsRequired = monthlyShare > RENT_RECEIPT_MONTHLY_LIMIT;
  const panRequiredByRent = annualRent > LANDLORD_PAN_ANNUAL_THRESHOLD;
  const section194ibApplies =
    !landlordIsNonResident && monthlyShare > SECTION_194IB_MONTHLY_THRESHOLD;
  const section195Applies = landlordIsNonResident;

  // PAN is needed once the ₹1 lakh reporting threshold is crossed, and it is needed
  // for any TDS deduction so the credit reaches the landlord's 26AS.
  const landlordPanRequired = panRequiredByRent || section194ibApplies || section195Applies;

  const headroom = round2(LANDLORD_PAN_ANNUAL_THRESHOLD - annualRent);
  const monthlyRentAtThreshold = round2(LANDLORD_PAN_ANNUAL_THRESHOLD / monthsPaid);

  let tds = null;
  if (section195Applies) {
    const effectiveRate = SECTION_195_EFFECTIVE_RATE_PERCENT;
    tds = {
      section: "195",
      ratePercent: round2(effectiveRate),
      amount: round2((annualRent * effectiveRate) / 100),
      cappedByLastMonthRent: false,
      lastMonthRent: monthlyShare,
      timing: "Deduct on every rent payment, and file Form 15CA (with 15CB where required).",
      needsTan: true,
    };
  } else if (section194ibApplies) {
    const appliedRate = landlordHasPan ? rate : NO_PAN_TDS_RATE_PERCENT;
    const gross = round2((annualRent * appliedRate) / 100);
    const capped = !landlordHasPan && gross > monthlyShare;
    tds = {
      section: "194-IB",
      ratePercent: appliedRate,
      amount: capped ? monthlyShare : gross,
      uncappedAmount: gross,
      cappedByLastMonthRent: capped,
      lastMonthRent: monthlyShare,
      timing:
        "Deduct once, in the last month of the financial year or of the tenancy, then pay it with Form 26QC within 30 days and give the landlord Form 16C.",
      needsTan: false,
    };
  }

  const requirements = [
    {
      id: "receipts",
      title: "Rent receipts",
      required: rentReceiptsRequired,
      detail: rentReceiptsRequired
        ? `Your share is ${monthlyShare} a month, above the ₹${RENT_RECEIPT_MONTHLY_LIMIT} relaxation, so keep signed receipts for every month.`
        : `At ₹${RENT_RECEIPT_MONTHLY_LIMIT} a month or less an employer may accept the HRA claim without receipts, but keep them anyway as proof.`,
    },
    {
      id: "pan",
      title: "Landlord's PAN",
      required: landlordPanRequired,
      detail: panRequiredByRent
        ? `Annual rent of ${annualRent} exceeds ₹${LANDLORD_PAN_ANNUAL_THRESHOLD}, so the landlord's PAN must be reported to your employer with Form 12BB.`
        : section194ibApplies || section195Applies
          ? "TDS applies on this rent, so you need the landlord's PAN to credit the tax correctly."
          : `Annual rent of ${annualRent} is within the ₹${LANDLORD_PAN_ANNUAL_THRESHOLD} limit, so PAN disclosure is not mandatory.`,
    },
    {
      id: "declaration",
      title: "Landlord declaration if there is no PAN",
      required: landlordPanRequired && !landlordHasPan,
      detail:
        landlordPanRequired && !landlordHasPan
          ? "Obtain a written declaration from the landlord that they hold no PAN, along with their name and address, and submit it in place of the PAN."
          : "Not needed on these inputs.",
    },
    {
      id: "tds",
      title: section195Applies ? "TDS under section 195 (NRI landlord)" : "TDS under section 194-IB",
      required: Boolean(tds),
      detail: tds
        ? `${tds.ratePercent}% applies. ${tds.timing}`
        : `Monthly rent of ${monthlyShare} is within the ₹${SECTION_194IB_MONTHLY_THRESHOLD} limit, so no rent TDS is due from you.`,
    },
  ];

  let headline;
  if (section195Applies) {
    headline = "PAN required — NRI landlord, TDS from the first rupee";
  } else if (panRequiredByRent) {
    headline = "Landlord PAN is mandatory";
  } else if (section194ibApplies) {
    headline = "Landlord PAN is mandatory for the TDS credit";
  } else {
    headline = "Landlord PAN is not mandatory";
  }

  return {
    monthlyRent: rent,
    sharePercent: share,
    monthsPaid,
    monthlyShare,
    annualRent,
    rentReceiptsRequired,
    panRequiredByRent,
    landlordPanRequired,
    section194ibApplies,
    section195Applies,
    landlordHasPan: Boolean(landlordHasPan),
    headroomToPanThreshold: headroom,
    monthlyRentAtPanThreshold: monthlyRentAtThreshold,
    tds,
    requirements,
    headline,
  };
}

export default checkLandlordPanRequirement;
