/**
 * Canada temporary residence application cost model.
 *
 * Canadian government fees are set out in the Immigration and Refugee
 * Protection Regulations and published by IRCC. Two of them are capped, which
 * is what makes a family application cheaper per head than an individual one:
 *
 *   - The visitor visa fee is CAD 100 a person, but CAD 500 for a family of
 *     five or more people who apply at the same time and place.
 *   - The biometrics fee is CAD 85 a person, but CAD 170 for two or more
 *     family members who apply together.
 *
 * Biometrics themselves are only required from applicants aged 14 to 79, so
 * young children and applicants aged 80 and over are counted out of that fee
 * entirely. This module applies both caps and the age rule, then converts to
 * rupees at a rate you supply. Pure functions only.
 */

/** IRCC fee schedule for temporary residence applications, in Canadian dollars. */
export const APPLICATION_TYPES = [
  {
    id: "visitor",
    label: "Visitor visa (TRV) or super visa",
    perPersonCad: 100,
    familyCapCad: 500,
    familyCapMinPeople: 5,
    needsBiometrics: true,
  },
  {
    id: "study",
    label: "Study permit (including extensions)",
    perPersonCad: 150,
    familyCapCad: null,
    familyCapMinPeople: null,
    needsBiometrics: true,
  },
  {
    id: "work",
    label: "Work permit",
    perPersonCad: 155,
    familyCapCad: null,
    familyCapMinPeople: null,
    needsBiometrics: true,
  },
  {
    id: "eta",
    label: "eTA (air travel, for eligible visa-exempt and expanded-eTA travellers)",
    perPersonCad: 7,
    familyCapCad: null,
    familyCapMinPeople: null,
    needsBiometrics: false,
  },
];

/** Biometrics collection fee per person, IRCC fee schedule. */
export const BIOMETRIC_FEE_PER_PERSON_CAD = 85;

/** Maximum biometrics fee for a family of two or more applying together. */
export const BIOMETRIC_FAMILY_CAP_CAD = 170;

/** Minimum number of family members before the biometrics cap can apply. */
export const BIOMETRIC_FAMILY_CAP_MIN_PEOPLE = 2;

/** Biometrics are required only from applicants aged 14 to 79 inclusive. */
export const BIOMETRIC_MIN_AGE = 14;
export const BIOMETRIC_MAX_AGE = 79;

/** Fingerprints and photo stay valid for ten years, so repeat applicants re-use them. */
export const BIOMETRIC_VALIDITY_YEARS = 10;

/**
 * Open work permit holder fee, payable in addition to the work permit fee by
 * applicants for an open work permit.
 */
export const OPEN_WORK_PERMIT_HOLDER_FEE_CAD = 100;

/** GST rate on banking and financial services in India (currently 18%). */
export const GST_ON_FINANCIAL_SERVICES_PCT = 18;

/** Sanity ceiling for an INR-per-CAD rate, to catch a mistyped exchange rate. */
export const MAX_EXCHANGE_RATE = 1000;

/** Sanity ceiling on applicants in one estimate. */
export const MAX_APPLICANTS = 50;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const isCount = (v) => isNum(v) && v >= 0 && Number.isInteger(v);

/**
 * Total cost of a Canadian temporary residence application, in rupees.
 *
 * @returns {object} breakdown, or { error } when an input cannot be used.
 */
export function estimateCanadaVisaCost({
  applicationTypeId = "visitor",
  adults14to79 = 1,
  childrenUnder14 = 0,
  seniors80Plus = 0,
  applyingTogether = true,
  biometricsAlreadyValid = false,
  includeOpenWorkPermitHolderFee = false,
  exchangeRate = 0,
  serviceFeeInrPerApplicant = 0,
  medicalExamInrPerApplicant = 0,
  photoFeeInrPerApplicant = 0,
  courierFeeInr = 0,
  otherFeeInr = 0,
  cardMarkupPct = 0,
}) {
  const type = APPLICATION_TYPES.find((entry) => entry.id === applicationTypeId);
  if (!type) return { error: "Pick a valid application type." };

  if (!isCount(adults14to79) || !isCount(childrenUnder14) || !isCount(seniors80Plus)) {
    return { error: "Applicant counts must be whole numbers of zero or more." };
  }

  const applicants = adults14to79 + childrenUnder14 + seniors80Plus;
  if (applicants < 1) return { error: "Add at least one applicant." };
  if (applicants > MAX_APPLICANTS) {
    return { error: `Enter ${MAX_APPLICANTS} applicants or fewer in one estimate.` };
  }

  const amounts = {
    "the exchange rate": exchangeRate,
    "the service fee": serviceFeeInrPerApplicant,
    "the medical exam": medicalExamInrPerApplicant,
    "the photo cost": photoFeeInrPerApplicant,
    "the courier fee": courierFeeInr,
    "other charges": otherFeeInr,
    "the card markup": cardMarkupPct,
  };
  for (const [label, value] of Object.entries(amounts)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${label}.` };
    if (value < 0) return { error: `${label[0].toUpperCase()}${label.slice(1)} cannot be negative.` };
  }
  if (exchangeRate <= 0) {
    return { error: "Enter the Canadian dollar exchange rate (rupees per CAD 1)." };
  }
  if (exchangeRate > MAX_EXCHANGE_RATE) {
    return {
      error: `An exchange rate above ${MAX_EXCHANGE_RATE} rupees per Canadian dollar looks mistyped.`,
    };
  }
  if (cardMarkupPct > 100) return { error: "A card markup above 100% is not possible." };

  // Application fee — everyone pays, regardless of age. The family maximum only
  // bites when enough people apply at the same time and place.
  const applicationFeeUncappedCad = round2(type.perPersonCad * applicants);
  const familyCapApplies =
    applyingTogether &&
    type.familyCapCad !== null &&
    applicants >= type.familyCapMinPeople &&
    applicationFeeUncappedCad > type.familyCapCad;
  const applicationFeeCad = familyCapApplies ? type.familyCapCad : applicationFeeUncappedCad;
  const applicationCapSavingCad = round2(applicationFeeUncappedCad - applicationFeeCad);

  // Biometrics — only ages 14 to 79, and only if a valid enrolment is not on file.
  const biometricCandidates = type.needsBiometrics && !biometricsAlreadyValid ? adults14to79 : 0;
  const biometricFeeUncappedCad = round2(BIOMETRIC_FEE_PER_PERSON_CAD * biometricCandidates);
  const biometricCapApplies =
    applyingTogether &&
    biometricCandidates >= BIOMETRIC_FAMILY_CAP_MIN_PEOPLE &&
    biometricFeeUncappedCad > BIOMETRIC_FAMILY_CAP_CAD;
  const biometricFeeCad = biometricCapApplies
    ? BIOMETRIC_FAMILY_CAP_CAD
    : biometricFeeUncappedCad;
  const biometricCapSavingCad = round2(biometricFeeUncappedCad - biometricFeeCad);

  const openWorkPermitFeeCad =
    includeOpenWorkPermitHolderFee && type.id === "work"
      ? round2(OPEN_WORK_PERMIT_HOLDER_FEE_CAD * applicants)
      : 0;

  const totalCad = round2(applicationFeeCad + biometricFeeCad + openWorkPermitFeeCad);
  const totalCadInr = round2(totalCad * exchangeRate);

  const cardMarkupInr = round2((totalCadInr * cardMarkupPct) / 100);
  const gstOnMarkupInr = round2((cardMarkupInr * GST_ON_FINANCIAL_SERVICES_PCT) / 100);

  const serviceFeeInr = round2(serviceFeeInrPerApplicant * applicants);
  const medicalInr = round2(medicalExamInrPerApplicant * applicants);
  const photosInr = round2(photoFeeInrPerApplicant * applicants);
  const courierInr = round2(courierFeeInr);
  const otherInr = round2(otherFeeInr);
  const indianChargesInr = round2(serviceFeeInr + medicalInr + photosInr + courierInr + otherInr);

  const totalInr = round2(totalCadInr + cardMarkupInr + gstOnMarkupInr + indianChargesInr);
  const perApplicantInr = round2(totalInr / applicants);
  const capSavingInr = round2((applicationCapSavingCad + biometricCapSavingCad) * exchangeRate);
  const govSharePct = totalInr > 0 ? round2((totalCadInr / totalInr) * 100) : 0;

  const lines = [
    {
      id: "application",
      label: `${type.label} fee x ${applicants}`,
      note: familyCapApplies
        ? `Family maximum of CAD ${type.familyCapCad} applied`
        : `CAD ${type.perPersonCad} each`,
      amountInr: round2(applicationFeeCad * exchangeRate),
    },
    {
      id: "biometrics",
      label: `Biometrics x ${biometricCandidates}`,
      note: !type.needsBiometrics
        ? "Not required for this application type"
        : biometricsAlreadyValid
          ? `Existing enrolment still valid (${BIOMETRIC_VALIDITY_YEARS} years)`
          : biometricCapApplies
            ? `Family maximum of CAD ${BIOMETRIC_FAMILY_CAP_CAD} applied`
            : `CAD ${BIOMETRIC_FEE_PER_PERSON_CAD} each, ages ${BIOMETRIC_MIN_AGE} to ${BIOMETRIC_MAX_AGE} only`,
      amountInr: round2(biometricFeeCad * exchangeRate),
    },
    {
      id: "owp",
      label: "Open work permit holder fee",
      note:
        openWorkPermitFeeCad > 0
          ? `CAD ${OPEN_WORK_PERMIT_HOLDER_FEE_CAD} each`
          : "Not included",
      amountInr: round2(openWorkPermitFeeCad * exchangeRate),
    },
    {
      id: "card",
      label: "Card markup and GST on it",
      note: cardMarkupPct > 0 ? `${cardMarkupPct}% plus 18% GST on the markup` : "Not applied",
      amountInr: round2(cardMarkupInr + gstOnMarkupInr),
    },
    {
      id: "service",
      label: `Visa centre service fee x ${applicants}`,
      note: "VFS Global charge for accepting the application and biometrics",
      amountInr: serviceFeeInr,
    },
    {
      id: "medical",
      label: `Panel physician medical exam x ${applicants}`,
      note: "Required for stays over six months and certain occupations",
      amountInr: medicalInr,
    },
    {
      id: "photos",
      label: `Photographs x ${applicants}`,
      note: "35 x 45 mm, IRCC specification",
      amountInr: photosInr,
    },
    {
      id: "courier",
      label: "Passport return courier",
      note: "Optional",
      amountInr: courierInr,
    },
    {
      id: "other",
      label: "Other charges",
      note: "Attestation, translations, IELTS or proof of funds paperwork",
      amountInr: otherInr,
    },
  ];

  return {
    applicants,
    adults14to79,
    childrenUnder14,
    seniors80Plus,
    applicationTypeId: type.id,
    applicationTypeLabel: type.label,
    perPersonCad: type.perPersonCad,
    applicationFeeUncappedCad,
    applicationFeeCad,
    applicationCapSavingCad,
    familyCapApplies,
    biometricCandidates,
    biometricFeeUncappedCad,
    biometricFeeCad,
    biometricCapSavingCad,
    biometricCapApplies,
    openWorkPermitFeeCad,
    totalCad,
    totalCadInr,
    cardMarkupInr,
    gstOnMarkupInr,
    serviceFeeInr,
    medicalInr,
    photosInr,
    courierInr,
    otherInr,
    indianChargesInr,
    totalInr,
    perApplicantInr,
    capSavingInr,
    govSharePct,
    lines,
  };
}
