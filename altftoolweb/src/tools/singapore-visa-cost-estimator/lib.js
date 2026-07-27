/**
 * Singapore visa and pass cost model.
 *
 * Singapore splits its government charges into two stages, and the split is
 * the thing most estimates get wrong:
 *
 *   - A processing fee, charged when the application is submitted. It is
 *     non-refundable whether the application is approved or rejected.
 *   - An issuance fee, charged only once the application is approved and the
 *     pass or visa is actually granted.
 *
 * So the money genuinely at risk in a rejection is the processing fee plus
 * whatever you paid locally, not the headline total. This module keeps the two
 * stages apart, multiplies them out across applicants, and converts to rupees
 * at the rate you supply. Pure functions only.
 */

/**
 * Immigration and Checkpoints Authority and Ministry of Manpower fees, in
 * Singapore dollars. The short-stay entry visa has carried a SGD 30 processing
 * fee with no issuance fee for many years; work pass fees are set by MOM.
 */
export const PASS_TYPES = [
  {
    id: "entry-visa",
    label: "Entry visa (single or multiple journey, short visit)",
    processingFeeSgd: 30,
    issuanceFeeSgd: 0,
    biometricsInIndia: false,
  },
  {
    id: "student-pass",
    label: "Student's Pass",
    processingFeeSgd: 30,
    issuanceFeeSgd: 60,
    biometricsInIndia: false,
  },
  {
    id: "employment-pass",
    label: "Employment Pass",
    processingFeeSgd: 105,
    issuanceFeeSgd: 225,
    biometricsInIndia: false,
  },
  {
    id: "s-pass",
    label: "S Pass",
    processingFeeSgd: 105,
    issuanceFeeSgd: 100,
    biometricsInIndia: false,
  },
  {
    id: "work-permit",
    label: "Work Permit",
    processingFeeSgd: 35,
    issuanceFeeSgd: 35,
    biometricsInIndia: false,
  },
  {
    id: "dependant-pass",
    label: "Dependant's Pass or Long Term Visit Pass",
    processingFeeSgd: 105,
    issuanceFeeSgd: 225,
    biometricsInIndia: false,
  },
];

/**
 * The SG Arrival Card, which every traveller must submit within three days
 * before arrival, is free of charge. Named here so the breakdown can say so
 * and no one pays a third party for it unnecessarily.
 */
export const SG_ARRIVAL_CARD_FEE_SGD = 0;

/** Days before arrival within which the SG Arrival Card must be submitted. */
export const SG_ARRIVAL_CARD_WINDOW_DAYS = 3;

/**
 * Typical maximum validity of a multiple-journey entry visa granted to Indian
 * passport holders. The length of each stay is decided separately by the
 * officer at the checkpoint, normally up to 30 days.
 */
export const MULTIPLE_JOURNEY_VISA_MAX_YEARS = 2;

/** GST rate on banking and financial services in India (currently 18%). */
export const GST_ON_FINANCIAL_SERVICES_PCT = 18;

/** Sanity ceiling for an INR-per-SGD rate, to catch a mistyped exchange rate. */
export const MAX_EXCHANGE_RATE = 1000;

/** Sanity ceiling on applicants in one estimate. */
export const MAX_APPLICANTS = 50;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const isCount = (v) => isNum(v) && v >= 0 && Number.isInteger(v);

/**
 * Total cost of a Singapore visa or pass application, in rupees.
 *
 * @returns {object} breakdown, or { error } when an input cannot be used.
 */
export function estimateSingaporeVisaCost({
  passTypeId = "entry-visa",
  applicants = 1,
  exchangeRate = 0,
  agentFeeInrPerApplicant = 0,
  photoFeeInrPerApplicant = 0,
  courierFeeInr = 0,
  insuranceInrPerApplicant = 0,
  otherFeeInr = 0,
  cardMarkupPct = 0,
}) {
  const passType = PASS_TYPES.find((entry) => entry.id === passTypeId);
  if (!passType) return { error: "Pick a valid visa or pass type." };

  if (!isCount(applicants)) return { error: "The number of applicants must be a whole number." };
  if (applicants < 1) return { error: "Add at least one applicant." };
  if (applicants > MAX_APPLICANTS) {
    return { error: `Enter ${MAX_APPLICANTS} applicants or fewer in one estimate.` };
  }

  const amounts = {
    "the exchange rate": exchangeRate,
    "the agent fee": agentFeeInrPerApplicant,
    "the photo cost": photoFeeInrPerApplicant,
    "the courier fee": courierFeeInr,
    "the insurance premium": insuranceInrPerApplicant,
    "other charges": otherFeeInr,
    "the card markup": cardMarkupPct,
  };
  for (const [label, value] of Object.entries(amounts)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${label}.` };
    if (value < 0) return { error: `${label[0].toUpperCase()}${label.slice(1)} cannot be negative.` };
  }
  if (exchangeRate <= 0) {
    return { error: "Enter the Singapore dollar exchange rate (rupees per SGD 1)." };
  }
  if (exchangeRate > MAX_EXCHANGE_RATE) {
    return {
      error: `An exchange rate above ${MAX_EXCHANGE_RATE} rupees per Singapore dollar looks mistyped.`,
    };
  }
  if (cardMarkupPct > 100) return { error: "A card markup above 100% is not possible." };

  // Stage 1 — payable on submission, kept whatever the outcome.
  const processingFeeSgd = round2(passType.processingFeeSgd * applicants);
  // Stage 2 — payable only if the application succeeds.
  const issuanceFeeSgd = round2(passType.issuanceFeeSgd * applicants);
  const totalSgd = round2(processingFeeSgd + issuanceFeeSgd);

  const processingFeeInr = round2(processingFeeSgd * exchangeRate);
  const issuanceFeeInr = round2(issuanceFeeSgd * exchangeRate);
  const totalSgdInr = round2(processingFeeInr + issuanceFeeInr);

  const cardMarkupInr = round2((totalSgdInr * cardMarkupPct) / 100);
  const gstOnMarkupInr = round2((cardMarkupInr * GST_ON_FINANCIAL_SERVICES_PCT) / 100);

  const agentFeeInr = round2(agentFeeInrPerApplicant * applicants);
  const photosInr = round2(photoFeeInrPerApplicant * applicants);
  const insuranceInr = round2(insuranceInrPerApplicant * applicants);
  const courierInr = round2(courierFeeInr);
  const otherInr = round2(otherFeeInr);
  const indianChargesInr = round2(agentFeeInr + photosInr + insuranceInr + courierInr + otherInr);

  const totalInr = round2(totalSgdInr + cardMarkupInr + gstOnMarkupInr + indianChargesInr);
  const perApplicantInr = round2(totalInr / applicants);

  // If the application is rejected, the issuance fee is never charged. Local
  // charges are already spent; a refundable insurance premium is not counted.
  const processingMarkupInr = round2((processingFeeInr * cardMarkupPct) / 100);
  const atRiskIfRejectedInr = round2(
    processingFeeInr +
      processingMarkupInr +
      (processingMarkupInr * GST_ON_FINANCIAL_SERVICES_PCT) / 100 +
      agentFeeInr +
      photosInr +
      courierInr +
      otherInr,
  );
  const govSharePct = totalInr > 0 ? round2((totalSgdInr / totalInr) * 100) : 0;

  const lines = [
    {
      id: "processing",
      label: `Processing fee x ${applicants}`,
      note: `SGD ${passType.processingFeeSgd} each — non-refundable even if rejected`,
      amountInr: processingFeeInr,
    },
    {
      id: "issuance",
      label: `Issuance fee x ${applicants}`,
      note:
        passType.issuanceFeeSgd > 0
          ? `SGD ${passType.issuanceFeeSgd} each — charged only on approval`
          : "No issuance fee for this type",
      amountInr: issuanceFeeInr,
    },
    {
      id: "arrival-card",
      label: "SG Arrival Card",
      note: `Free, submitted within ${SG_ARRIVAL_CARD_WINDOW_DAYS} days before arrival`,
      amountInr: 0,
    },
    {
      id: "card",
      label: "Card markup and GST on it",
      note: cardMarkupPct > 0 ? `${cardMarkupPct}% plus 18% GST on the markup` : "Not applied",
      amountInr: round2(cardMarkupInr + gstOnMarkupInr),
    },
    {
      id: "agent",
      label: `Authorised visa agent charge x ${applicants}`,
      note: "Indian applicants submit through an authorised agent or a Singapore mission",
      amountInr: agentFeeInr,
    },
    {
      id: "photos",
      label: `Photographs x ${applicants}`,
      note: "35 x 45 mm, white background, taken within three months",
      amountInr: photosInr,
    },
    {
      id: "insurance",
      label: `Travel insurance x ${applicants}`,
      note: "Optional for a short visit but usually refundable if the visa is refused",
      amountInr: insuranceInr,
    },
    {
      id: "courier",
      label: "Courier and document handling",
      note: "Optional",
      amountInr: courierInr,
    },
    {
      id: "other",
      label: "Other charges",
      note: "Form V39A support letter, printing, notarisation",
      amountInr: otherInr,
    },
  ];

  return {
    applicants,
    passTypeId: passType.id,
    passTypeLabel: passType.label,
    processingFeePerApplicantSgd: passType.processingFeeSgd,
    issuanceFeePerApplicantSgd: passType.issuanceFeeSgd,
    processingFeeSgd,
    issuanceFeeSgd,
    totalSgd,
    processingFeeInr,
    issuanceFeeInr,
    totalSgdInr,
    cardMarkupInr,
    gstOnMarkupInr,
    agentFeeInr,
    photosInr,
    insuranceInr,
    courierInr,
    otherInr,
    indianChargesInr,
    totalInr,
    perApplicantInr,
    atRiskIfRejectedInr,
    govSharePct,
    lines,
  };
}
