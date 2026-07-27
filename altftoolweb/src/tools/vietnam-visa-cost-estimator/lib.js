/**
 * Vietnam visa cost model.
 *
 * Vietnamese visa fees are set in US dollars by validity band rather than by
 * purpose, which is why "how much is a Vietnam visa" has no single answer: a
 * 90-day single entry and a five-year multiple entry are the same document
 * priced very differently. Two structural rules matter:
 *
 *   - The fee depends on the number of entries and the length of validity, not
 *     on whether the trip is business or leisure.
 *   - Applicants under 14 pay a concessional flat fee regardless of the
 *     validity band, so a child on a long multiple-entry visa costs a fraction
 *     of an adult on the same visa.
 *
 * A visa on arrival adds a second, separate cost: the sponsoring travel
 * agency's pre-approval letter, which is a commercial charge and not a
 * government fee. The stamping fee is still paid in cash at the airport.
 * All functions are pure.
 */

/**
 * Immigration fee bands in US dollars, following the schedule in Circular
 * 25/2021/TT-BTC. E-visas are issued in the 90-day bands only.
 */
export const VISA_BANDS = [
  { id: "single-90", label: "Single entry, valid up to 90 days", feeUsd: 25, eVisaEligible: true },
  {
    id: "multiple-90",
    label: "Multiple entry, valid up to 90 days",
    feeUsd: 50,
    eVisaEligible: true,
  },
  {
    id: "multiple-180",
    label: "Multiple entry, over 90 days and up to 180 days",
    feeUsd: 95,
    eVisaEligible: false,
  },
  {
    id: "multiple-1y",
    label: "Multiple entry, over 180 days and up to 1 year",
    feeUsd: 135,
    eVisaEligible: false,
  },
  {
    id: "multiple-2y",
    label: "Multiple entry, over 1 year and up to 2 years",
    feeUsd: 145,
    eVisaEligible: false,
  },
  {
    id: "multiple-5y",
    label: "Multiple entry, over 2 years and up to 5 years",
    feeUsd: 155,
    eVisaEligible: false,
  },
  { id: "transit", label: "Transit visa", feeUsd: 5, eVisaEligible: false },
];

/**
 * Concessional fee for applicants under 14, applied whatever the validity
 * band. It is a concession, so it is never charged above the adult rate for
 * the same band — a transit visa stays at the lower transit fee.
 */
export const UNDER_14_FEE_USD = 25;
export const UNDER_14_AGE = 14;

export const APPLICATION_ROUTES = [
  {
    id: "e-visa",
    label: "E-visa applied online before travel",
    needsApprovalLetter: false,
    restrictedToEVisaBands: true,
  },
  {
    id: "voa",
    label: "Visa on arrival with a sponsoring agency's approval letter",
    needsApprovalLetter: true,
    restrictedToEVisaBands: false,
  },
  {
    id: "embassy",
    label: "Visa applied for at a Vietnamese embassy or consulate",
    needsApprovalLetter: false,
    restrictedToEVisaBands: false,
  },
];

/** Maximum validity of an e-visa, in days, since the 15 August 2023 expansion. */
export const EVISA_MAX_VALIDITY_DAYS = 90;

/** Normal e-visa processing time, in working days. */
export const EVISA_PROCESSING_WORKING_DAYS = 3;

/** GST rate on banking and financial services in India (currently 18%). */
export const GST_ON_FINANCIAL_SERVICES_PCT = 18;

/** Sanity ceiling for an INR-per-USD rate, to catch a mistyped exchange rate. */
export const MAX_EXCHANGE_RATE = 1000;

/** Sanity ceiling on applicants in one estimate. */
export const MAX_APPLICANTS = 50;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const isCount = (v) => isNum(v) && v >= 0 && Number.isInteger(v);

/**
 * Total cost of a Vietnam visa, in rupees.
 *
 * @returns {object} breakdown, or { error } when an input cannot be used.
 */
export function estimateVietnamVisaCost({
  bandId = "single-90",
  routeId = "e-visa",
  adults = 1,
  childrenUnder14 = 0,
  approvalLetterUsdPerApplicant = 0,
  exchangeRate = 0,
  photoFeeInrPerApplicant = 0,
  insuranceInrPerApplicant = 0,
  courierFeeInr = 0,
  otherFeeInr = 0,
  cardMarkupPct = 0,
}) {
  const band = VISA_BANDS.find((entry) => entry.id === bandId);
  if (!band) return { error: "Pick a valid visa validity band." };
  const route = APPLICATION_ROUTES.find((entry) => entry.id === routeId);
  if (!route) return { error: "Pick a valid application route." };

  if (route.restrictedToEVisaBands && !band.eVisaEligible) {
    return {
      error: `An e-visa is issued for up to ${EVISA_MAX_VALIDITY_DAYS} days only — choose a 90-day band, or apply through an embassy for a longer visa.`,
    };
  }

  if (!isCount(adults) || !isCount(childrenUnder14)) {
    return { error: "Applicant counts must be whole numbers of zero or more." };
  }
  const applicants = adults + childrenUnder14;
  if (applicants < 1) return { error: "Add at least one applicant." };
  if (applicants > MAX_APPLICANTS) {
    return { error: `Enter ${MAX_APPLICANTS} applicants or fewer in one estimate.` };
  }

  const amounts = {
    "the approval letter fee": approvalLetterUsdPerApplicant,
    "the exchange rate": exchangeRate,
    "the photo cost": photoFeeInrPerApplicant,
    "the insurance premium": insuranceInrPerApplicant,
    "the courier fee": courierFeeInr,
    "other charges": otherFeeInr,
    "the card markup": cardMarkupPct,
  };
  for (const [label, value] of Object.entries(amounts)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${label}.` };
    if (value < 0) return { error: `${label[0].toUpperCase()}${label.slice(1)} cannot be negative.` };
  }
  if (exchangeRate <= 0) {
    return { error: "Enter the dollar exchange rate (rupees per USD 1)." };
  }
  if (exchangeRate > MAX_EXCHANGE_RATE) {
    return { error: `An exchange rate above ${MAX_EXCHANGE_RATE} rupees per dollar looks mistyped.` };
  }
  if (cardMarkupPct > 100) return { error: "A card markup above 100% is not possible." };

  const adultFeeUsd = band.feeUsd;
  // The under-14 rate is a concession, so it never exceeds the adult rate.
  const childFeeUsd = Math.min(UNDER_14_FEE_USD, band.feeUsd);

  const adultsFeeUsd = round2(adultFeeUsd * adults);
  const childrenFeeUsd = round2(childFeeUsd * childrenUnder14);
  const visaFeeUsd = round2(adultsFeeUsd + childrenFeeUsd);

  const approvalLetterUsd = route.needsApprovalLetter
    ? round2(approvalLetterUsdPerApplicant * applicants)
    : 0;

  const totalUsd = round2(visaFeeUsd + approvalLetterUsd);
  const totalUsdInr = round2(totalUsd * exchangeRate);

  const cardMarkupInr = round2((totalUsdInr * cardMarkupPct) / 100);
  const gstOnMarkupInr = round2((cardMarkupInr * GST_ON_FINANCIAL_SERVICES_PCT) / 100);

  const photosInr = round2(photoFeeInrPerApplicant * applicants);
  const insuranceInr = round2(insuranceInrPerApplicant * applicants);
  const courierInr = round2(courierFeeInr);
  const otherInr = round2(otherFeeInr);
  const indianChargesInr = round2(photosInr + insuranceInr + courierInr + otherInr);

  const totalInr = round2(totalUsdInr + cardMarkupInr + gstOnMarkupInr + indianChargesInr);
  const perApplicantInr = round2(totalInr / applicants);
  const govSharePct = totalInr > 0 ? round2((round2(visaFeeUsd * exchangeRate) / totalInr) * 100) : 0;
  const childSavingUsd = round2((adultFeeUsd - childFeeUsd) * childrenUnder14);

  const lines = [
    {
      id: "adults",
      label: `Visa fee, applicants ${UNDER_14_AGE} and over x ${adults}`,
      note: `USD ${adultFeeUsd} each — ${band.label.toLowerCase()}`,
      amountInr: round2(adultsFeeUsd * exchangeRate),
    },
    {
      id: "children",
      label: `Visa fee, applicants under ${UNDER_14_AGE} x ${childrenUnder14}`,
      note: `USD ${childFeeUsd} each — concessional rate regardless of validity`,
      amountInr: round2(childrenFeeUsd * exchangeRate),
    },
    {
      id: "approval",
      label: `Agency pre-approval letter x ${applicants}`,
      note: route.needsApprovalLetter
        ? `USD ${approvalLetterUsdPerApplicant} each — a commercial charge, not a government fee`
        : "Not needed on this route",
      amountInr: round2(approvalLetterUsd * exchangeRate),
    },
    {
      id: "card",
      label: "Card markup and GST on it",
      note: cardMarkupPct > 0 ? `${cardMarkupPct}% plus 18% GST on the markup` : "Not applied",
      amountInr: round2(cardMarkupInr + gstOnMarkupInr),
    },
    {
      id: "photos",
      label: `Photographs x ${applicants}`,
      note: "4 x 6 cm, white background, no glasses",
      amountInr: photosInr,
    },
    {
      id: "insurance",
      label: `Travel insurance x ${applicants}`,
      note: "Optional for tourism",
      amountInr: insuranceInr,
    },
    {
      id: "courier",
      label: "Courier and document handling",
      note: "Only relevant to an embassy application",
      amountInr: courierInr,
    },
    {
      id: "other",
      label: "Other charges",
      note: "Printing, notarisation, invitation paperwork",
      amountInr: otherInr,
    },
  ];

  return {
    applicants,
    adults,
    childrenUnder14,
    bandId: band.id,
    bandLabel: band.label,
    routeId: route.id,
    routeLabel: route.label,
    adultFeeUsd,
    childFeeUsd,
    adultsFeeUsd,
    childrenFeeUsd,
    visaFeeUsd,
    approvalLetterUsd,
    adultsFeeInr: round2(adultsFeeUsd * exchangeRate),
    childrenFeeInr: round2(childrenFeeUsd * exchangeRate),
    approvalLetterInr: round2(approvalLetterUsd * exchangeRate),
    totalUsd,
    totalUsdInr,
    cardMarkupInr,
    gstOnMarkupInr,
    photosInr,
    insuranceInr,
    courierInr,
    otherInr,
    indianChargesInr,
    totalInr,
    perApplicantInr,
    govSharePct,
    childSavingUsd,
    eVisaProcessingWorkingDays: EVISA_PROCESSING_WORKING_DAYS,
    lines,
  };
}
