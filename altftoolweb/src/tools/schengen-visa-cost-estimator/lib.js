/**
 * Schengen short-stay (Type C) visa cost model.
 *
 * The government part of the bill is fixed by the EU Visa Code
 * (Regulation (EC) No 810/2009). The commercial part — the external service
 * provider's fee, courier, photographs, insurance — is not, but the Visa Code
 * does cap the service fee. This module adds the two together and flags a
 * service fee that breaches the cap.
 *
 * Everything here is a pure function of its arguments; nothing reads the clock
 * or the network, so the same inputs always produce the same total.
 */

/**
 * Visa Code Article 16(1), as amended by Regulation (EU) 2019/1155 and revised
 * by Commission Delegated Regulation (EU) 2024/1415: the standard short-stay
 * visa fee rose from EUR 80 to EUR 90 on 11 June 2024.
 */
export const STANDARD_FEE_EUR = 90;

/**
 * Visa Code Article 16(2): children aged six years and above but below twelve
 * pay a reduced fee, raised from EUR 40 to EUR 45 on 11 June 2024.
 */
export const CHILD_6_TO_11_FEE_EUR = 45;

/**
 * Visa Code Article 16(4)(a): children under six years of age are exempt from
 * the visa fee entirely.
 */
export const CHILD_UNDER_6_FEE_EUR = 0;

/**
 * Reduced fee payable by nationals of third countries that have a visa
 * facilitation agreement in force with the EU (for example Armenia,
 * Azerbaijan and Cape Verde). Raised from EUR 35 to EUR 45 for most
 * agreements is NOT automatic — the agreement text prevails, and the long
 * standing facilitated rate is EUR 35.
 */
export const FACILITATION_FEE_EUR = 35;

/**
 * Visa Code Article 17(4): where an external service provider (VFS Global,
 * TLScontact, BLS and so on) collects the application, "the service fee shall
 * not exceed half of the visa fee", whatever the applicant's fee band is.
 */
export const SERVICE_FEE_CAP_RATIO = 0.5;

/**
 * Visa Code Article 15(3): travel medical insurance must cover at least
 * EUR 30,000 of medical repatriation and emergency care for the whole stay.
 */
export const MIN_MEDICAL_COVER_EUR = 30000;

/**
 * Visa Information System retention period for fingerprints (Article 13(3) of
 * the Visa Code). Within this window a repeat applicant can normally reuse the
 * stored biometrics, so no new enrolment appointment is needed.
 */
export const BIOMETRIC_REUSE_MONTHS = 59;

/**
 * Biometric enrolment itself carries no separate government charge — it is
 * covered by the visa fee. Kept as a named constant so the breakdown can say so.
 */
export const BIOMETRIC_ENROLMENT_FEE_EUR = 0;

/** GST rate on banking and financial services in India (currently 18%). */
export const GST_ON_FINANCIAL_SERVICES_PCT = 18;

/** Sanity ceiling for an INR-per-EUR rate, to catch a mistyped exchange rate. */
export const MAX_EXCHANGE_RATE = 1000;

/** Sanity ceiling on the number of applicants in one family submission. */
export const MAX_APPLICANTS = 50;

export const FEE_BASIS = [
  {
    id: "standard",
    label: "Standard applicant (most nationalities, incl. India)",
    adultEur: STANDARD_FEE_EUR,
    childEur: CHILD_6_TO_11_FEE_EUR,
  },
  {
    id: "facilitation",
    label: "Visa facilitation agreement nationality",
    adultEur: FACILITATION_FEE_EUR,
    childEur: FACILITATION_FEE_EUR,
  },
  {
    id: "exempt",
    label: "Fee-exempt category (school trip, researcher, EU family member)",
    adultEur: 0,
    childEur: 0,
  },
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const isCount = (v) => isNum(v) && v >= 0 && Number.isInteger(v);

/**
 * Total cost of a Schengen short-stay application, in rupees.
 *
 * @returns {object} breakdown, or { error } when an input cannot be used.
 */
export function estimateSchengenVisaCost({
  feeBasisId = "standard",
  adults = 1,
  children6to11 = 0,
  childrenUnder6 = 0,
  exchangeRate = 0,
  serviceFeeInrPerApplicant = 0,
  courierFeeInr = 0,
  photoFeeInrPerApplicant = 0,
  insuranceInrPerApplicant = 0,
  otherFeeInr = 0,
  cardMarkupPct = 0,
}) {
  const basis = FEE_BASIS.find((entry) => entry.id === feeBasisId);
  if (!basis) return { error: "Pick a valid fee category." };

  if (!isCount(adults) || !isCount(children6to11) || !isCount(childrenUnder6)) {
    return { error: "Applicant counts must be whole numbers of zero or more." };
  }

  const applicants = adults + children6to11 + childrenUnder6;
  if (applicants < 1) return { error: "Add at least one applicant." };
  if (applicants > MAX_APPLICANTS) {
    return { error: `Enter ${MAX_APPLICANTS} applicants or fewer in one estimate.` };
  }

  const amounts = {
    "the exchange rate": exchangeRate,
    "the service fee": serviceFeeInrPerApplicant,
    "the courier fee": courierFeeInr,
    "the photo cost": photoFeeInrPerApplicant,
    "the insurance premium": insuranceInrPerApplicant,
    "other charges": otherFeeInr,
    "the card markup": cardMarkupPct,
  };
  for (const [label, value] of Object.entries(amounts)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${label}.` };
    if (value < 0) return { error: `${label[0].toUpperCase()}${label.slice(1)} cannot be negative.` };
  }

  if (exchangeRate <= 0) {
    return { error: "Enter the euro exchange rate the mission is charging (rupees per EUR 1)." };
  }
  if (exchangeRate > MAX_EXCHANGE_RATE) {
    return { error: `An exchange rate above ${MAX_EXCHANGE_RATE} rupees per euro looks mistyped.` };
  }
  if (cardMarkupPct > 100) {
    return { error: "A card markup above 100% is not possible." };
  }

  // Government fee, per Visa Code Article 16.
  const adultFeeEur = basis.adultEur;
  const childFeeEur = basis.childEur;
  const govFeeEur = round2(
    adults * adultFeeEur + children6to11 * childFeeEur + childrenUnder6 * CHILD_UNDER_6_FEE_EUR,
  );
  const govFeeInr = round2(govFeeEur * exchangeRate);

  // Article 17(4) cap: the service fee may not exceed half the visa fee.
  // Applicants whose visa fee is zero cannot legally be charged a service fee.
  const highestFeeEur = Math.max(
    adults > 0 ? adultFeeEur : 0,
    children6to11 > 0 ? childFeeEur : 0,
    childrenUnder6 > 0 ? CHILD_UNDER_6_FEE_EUR : 0,
  );
  const serviceCapEurPerApplicant = round2(highestFeeEur * SERVICE_FEE_CAP_RATIO);
  const serviceCapInrPerApplicant = round2(serviceCapEurPerApplicant * exchangeRate);
  const serviceFeeExceedsCap =
    serviceFeeInrPerApplicant > serviceCapInrPerApplicant + 0.5; // half-rupee tolerance

  const serviceFeeInr = round2(serviceFeeInrPerApplicant * applicants);
  const photosInr = round2(photoFeeInrPerApplicant * applicants);
  const insuranceInr = round2(insuranceInrPerApplicant * applicants);
  const courierInr = round2(courierFeeInr);
  const otherInr = round2(otherFeeInr);

  // Cross-currency markup applies only when the visa fee is paid on an Indian
  // card in euros; GST at 18% is charged on the markup, not on the fee itself.
  const cardMarkupInr = round2((govFeeInr * cardMarkupPct) / 100);
  const gstOnMarkupInr = round2((cardMarkupInr * GST_ON_FINANCIAL_SERVICES_PCT) / 100);

  const totalInr = round2(
    govFeeInr +
      serviceFeeInr +
      courierInr +
      photosInr +
      insuranceInr +
      otherInr +
      cardMarkupInr +
      gstOnMarkupInr,
  );
  const perApplicantInr = round2(totalInr / applicants);
  const govSharePct = totalInr > 0 ? round2((govFeeInr / totalInr) * 100) : 0;

  const lines = [
    {
      id: "visa-fee",
      label: `Schengen visa fee (${adults} adult${adults === 1 ? "" : "s"}${
        children6to11 > 0 ? `, ${children6to11} aged 6-11` : ""
      }${childrenUnder6 > 0 ? `, ${childrenUnder6} under 6` : ""})`,
      note: govFeeEur > 0 ? `EUR ${govFeeEur} at ${exchangeRate}/EUR` : "Fee-exempt category",
      amountInr: govFeeInr,
      refundableOnRefusal: false,
    },
    {
      id: "service-fee",
      label: `Visa centre service fee x ${applicants}`,
      note: `Legal cap: EUR ${serviceCapEurPerApplicant} per applicant`,
      amountInr: serviceFeeInr,
      refundableOnRefusal: false,
    },
    {
      id: "biometrics",
      label: "Biometric enrolment",
      note: `No separate charge; prints are reused for ${BIOMETRIC_REUSE_MONTHS} months`,
      amountInr: 0,
      refundableOnRefusal: false,
    },
    {
      id: "courier",
      label: "Passport return courier",
      note: "Optional",
      amountInr: courierInr,
      refundableOnRefusal: false,
    },
    {
      id: "photos",
      label: `Biometric photographs x ${applicants}`,
      note: "35 x 45 mm, ICAO standard",
      amountInr: photosInr,
      refundableOnRefusal: false,
    },
    {
      id: "insurance",
      label: `Travel medical insurance x ${applicants}`,
      note: `Minimum cover EUR ${MIN_MEDICAL_COVER_EUR.toLocaleString("en-US")}`,
      amountInr: insuranceInr,
      refundableOnRefusal: true,
    },
    {
      id: "card-markup",
      label: "Cross-currency card markup",
      note: cardMarkupPct > 0 ? `${cardMarkupPct}% of the euro fee` : "Not applied",
      amountInr: cardMarkupInr,
      refundableOnRefusal: false,
    },
    {
      id: "gst",
      label: "GST on the card markup",
      note: `${GST_ON_FINANCIAL_SERVICES_PCT}% of the markup`,
      amountInr: gstOnMarkupInr,
      refundableOnRefusal: false,
    },
    {
      id: "other",
      label: "Other charges (SMS, premium lounge, form filling)",
      note: "Optional add-ons",
      amountInr: otherInr,
      refundableOnRefusal: false,
    },
  ];

  // Nothing except an unused insurance policy comes back if the visa is refused.
  const sunkIfRefusedInr = round2(
    lines
      .filter((line) => !line.refundableOnRefusal)
      .reduce((sum, line) => sum + line.amountInr, 0),
  );

  return {
    applicants,
    adults,
    children6to11,
    childrenUnder6,
    feeBasisId: basis.id,
    feeBasisLabel: basis.label,
    adultFeeEur,
    childFeeEur,
    govFeeEur,
    govFeeInr,
    serviceFeeInr,
    serviceCapEurPerApplicant,
    serviceCapInrPerApplicant,
    serviceFeeExceedsCap,
    courierInr,
    photosInr,
    insuranceInr,
    otherInr,
    cardMarkupInr,
    gstOnMarkupInr,
    totalInr,
    perApplicantInr,
    govSharePct,
    sunkIfRefusedInr,
    lines,
  };
}
