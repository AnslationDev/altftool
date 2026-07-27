/**
 * Australian visa cost model.
 *
 * The Department of Home Affairs prices a visa as a Visa Application Charge
 * built from parts, not as a single number:
 *
 *   Base Application Charge (the primary applicant)
 *   + Additional Applicant Charge for each family member aged 18 and over
 *   + Additional Applicant Charge for each family member under 18
 *   + Subsequent Temporary Application Charge, where it applies
 *   + Non-Internet Application Charge, for a paper lodgement
 *   + a card surcharge levied on the whole of the above at payment
 *
 * Charges are set in Australian dollars and indexed on 1 July each year, so the
 * amounts are inputs to this module rather than fixed constants. What the
 * module guarantees is that the parts are combined the way Home Affairs
 * combines them, the surcharge lands only on the government charge, and the
 * conversion to rupees uses the rate you supply. Pure functions only.
 */

/**
 * Starting values for common subclasses, as published for the 2025-26 program
 * year. Every one of these is editable in the tool because the department
 * indexes charges on 1 July and can amend them by legislative instrument.
 */
export const VISA_SUBCLASSES = [
  {
    id: "600-tourist",
    label: "Subclass 600 Visitor, Tourist stream (applied outside Australia)",
    baseAud: 210,
    additionalAdultAud: 210,
    additionalChildAud: 55,
    healthCoverRelevant: false,
  },
  {
    id: "500-student",
    label: "Subclass 500 Student",
    baseAud: 2000,
    additionalAdultAud: 1495,
    additionalChildAud: 490,
    healthCoverRelevant: true,
  },
  {
    id: "485-graduate",
    label: "Subclass 485 Temporary Graduate",
    baseAud: 2235,
    additionalAdultAud: 1115,
    additionalChildAud: 560,
    healthCoverRelevant: true,
  },
  {
    id: "482-skills",
    label: "Subclass 482 Skills in Demand, Core Skills stream",
    baseAud: 3115,
    additionalAdultAud: 3115,
    additionalChildAud: 780,
    healthCoverRelevant: false,
  },
  {
    id: "189-190-skilled",
    label: "Subclass 189 or 190 Skilled (permanent)",
    baseAud: 4770,
    additionalAdultAud: 2385,
    additionalChildAud: 1195,
    healthCoverRelevant: false,
  },
  {
    id: "462-whm",
    label: "Subclass 462 Work and Holiday",
    baseAud: 690,
    additionalAdultAud: 0,
    additionalChildAud: 0,
    healthCoverRelevant: false,
  },
];

/**
 * Card surcharges published by the Department of Home Affairs for online visa
 * payments. The surcharge is applied to the visa application charge only.
 * Confirm the current percentages on the department's payment options page.
 */
export const PAYMENT_METHODS = [
  { id: "visa-mastercard", label: "Visa or Mastercard", surchargePct: 1.42 },
  { id: "amex-jcb", label: "American Express or JCB", surchargePct: 1.44 },
  { id: "diners", label: "Diners Club", surchargePct: 1.99 },
  { id: "unionpay", label: "UnionPay", surchargePct: 1.9 },
  { id: "paypal", label: "PayPal", surchargePct: 1.01 },
  { id: "none", label: "No card surcharge (BPAY or bank transfer)", surchargePct: 0 },
];

/**
 * Subsequent Temporary Application Charge, payable when a further temporary
 * visa is applied for from inside Australia on certain visitor visas.
 */
export const SUBSEQUENT_TEMPORARY_APPLICATION_CHARGE_AUD = 700;

/** Non-Internet Application Charge, added when a paper form is lodged. */
export const NON_INTERNET_APPLICATION_CHARGE_AUD = 80;

/** Adults for charging purposes are applicants aged 18 and over. */
export const ADULT_AGE = 18;

/** GST rate on banking and financial services in India (currently 18%). */
export const GST_ON_FINANCIAL_SERVICES_PCT = 18;

/** Sanity ceiling for an INR-per-AUD rate, to catch a mistyped exchange rate. */
export const MAX_EXCHANGE_RATE = 1000;

/** Sanity ceiling on any single Australian dollar charge in this estimate. */
export const MAX_CHARGE_AUD = 100000;

/** Sanity ceiling on applicants in one combined application. */
export const MAX_APPLICANTS = 20;

/** Longest health cover period this estimator will price, in months. */
export const MAX_HEALTH_COVER_MONTHS = 84;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const isCount = (v) => isNum(v) && v >= 0 && Number.isInteger(v);

/**
 * Total cost of an Australian visa application, in rupees.
 *
 * @returns {object} breakdown, or { error } when an input cannot be used.
 */
export function estimateAustraliaVisaCost({
  subclassId = "600-tourist",
  baseChargeAud = 0,
  additionalAdultChargeAud = 0,
  additionalChildChargeAud = 0,
  additionalAdults = 0,
  additionalChildren = 0,
  surchargePct = 0,
  paperLodgement = false,
  subsequentTemporaryApplication = false,
  exchangeRate = 0,
  serviceFeeInrPerApplicant = 0,
  healthExamInrPerApplicant = 0,
  healthCoverInrPerMonth = 0,
  healthCoverMonths = 0,
  photoFeeInrPerApplicant = 0,
  courierFeeInr = 0,
  otherFeeInr = 0,
}) {
  const subclass = VISA_SUBCLASSES.find((entry) => entry.id === subclassId);
  if (!subclass) return { error: "Pick a valid visa subclass." };

  if (!isCount(additionalAdults) || !isCount(additionalChildren)) {
    return { error: "Additional applicant counts must be whole numbers of zero or more." };
  }

  const applicants = 1 + additionalAdults + additionalChildren;
  if (applicants > MAX_APPLICANTS) {
    return { error: `Enter ${MAX_APPLICANTS} applicants or fewer in one combined application.` };
  }

  const charges = {
    "the base application charge": baseChargeAud,
    "the additional adult charge": additionalAdultChargeAud,
    "the additional child charge": additionalChildChargeAud,
  };
  for (const [label, value] of Object.entries(charges)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${label}.` };
    if (value < 0) return { error: `${label[0].toUpperCase()}${label.slice(1)} cannot be negative.` };
    if (value > MAX_CHARGE_AUD) {
      return { error: `A charge above AUD ${MAX_CHARGE_AUD} looks mistyped.` };
    }
  }

  const amounts = {
    "the exchange rate": exchangeRate,
    "the card surcharge": surchargePct,
    "the service fee": serviceFeeInrPerApplicant,
    "the health examination": healthExamInrPerApplicant,
    "the health cover premium": healthCoverInrPerMonth,
    "the health cover period": healthCoverMonths,
    "the photo cost": photoFeeInrPerApplicant,
    "the courier fee": courierFeeInr,
    "other charges": otherFeeInr,
  };
  for (const [label, value] of Object.entries(amounts)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${label}.` };
    if (value < 0) return { error: `${label[0].toUpperCase()}${label.slice(1)} cannot be negative.` };
  }
  if (exchangeRate <= 0) {
    return { error: "Enter the Australian dollar exchange rate (rupees per AUD 1)." };
  }
  if (exchangeRate > MAX_EXCHANGE_RATE) {
    return {
      error: `An exchange rate above ${MAX_EXCHANGE_RATE} rupees per Australian dollar looks mistyped.`,
    };
  }
  if (surchargePct > 10) return { error: "A card surcharge above 10% is not a published rate." };
  if (healthCoverMonths > MAX_HEALTH_COVER_MONTHS) {
    return { error: `Price health cover for ${MAX_HEALTH_COVER_MONTHS} months or fewer.` };
  }

  const baseAud = round2(baseChargeAud);
  const additionalAdultsAud = round2(additionalAdultChargeAud * additionalAdults);
  const additionalChildrenAud = round2(additionalChildChargeAud * additionalChildren);
  const paperAud = paperLodgement ? NON_INTERNET_APPLICATION_CHARGE_AUD : 0;
  const subsequentAud = subsequentTemporaryApplication
    ? round2(SUBSEQUENT_TEMPORARY_APPLICATION_CHARGE_AUD * applicants)
    : 0;

  const visaApplicationChargeAud = round2(
    baseAud + additionalAdultsAud + additionalChildrenAud + paperAud + subsequentAud,
  );
  // The surcharge is levied on the visa application charge, nothing else.
  const surchargeAud = round2((visaApplicationChargeAud * surchargePct) / 100);
  const totalAud = round2(visaApplicationChargeAud + surchargeAud);
  const totalAudInr = round2(totalAud * exchangeRate);

  const serviceFeeInr = round2(serviceFeeInrPerApplicant * applicants);
  const healthExamInr = round2(healthExamInrPerApplicant * applicants);
  const healthCoverInr = round2(healthCoverInrPerMonth * healthCoverMonths * applicants);
  const photosInr = round2(photoFeeInrPerApplicant * applicants);
  const courierInr = round2(courierFeeInr);
  const otherInr = round2(otherFeeInr);
  const indianChargesInr = round2(
    serviceFeeInr + healthExamInr + healthCoverInr + photosInr + courierInr + otherInr,
  );

  const totalInr = round2(totalAudInr + indianChargesInr);
  const perApplicantInr = round2(totalInr / applicants);
  const govSharePct = totalInr > 0 ? round2((totalAudInr / totalInr) * 100) : 0;

  const lines = [
    {
      id: "base",
      label: "Base Application Charge (primary applicant)",
      note: `AUD ${baseAud}`,
      amountInr: round2(baseAud * exchangeRate),
    },
    {
      id: "add-adults",
      label: `Additional applicants aged ${ADULT_AGE} and over x ${additionalAdults}`,
      note: `AUD ${additionalAdultChargeAud} each`,
      amountInr: round2(additionalAdultsAud * exchangeRate),
    },
    {
      id: "add-children",
      label: `Additional applicants under ${ADULT_AGE} x ${additionalChildren}`,
      note: `AUD ${additionalChildChargeAud} each`,
      amountInr: round2(additionalChildrenAud * exchangeRate),
    },
    {
      id: "subsequent",
      label: "Subsequent Temporary Application Charge",
      note: subsequentTemporaryApplication
        ? `AUD ${SUBSEQUENT_TEMPORARY_APPLICATION_CHARGE_AUD} for each applicant`
        : "Not applicable",
      amountInr: round2(subsequentAud * exchangeRate),
    },
    {
      id: "paper",
      label: "Non-Internet Application Charge",
      note: paperLodgement
        ? `AUD ${NON_INTERNET_APPLICATION_CHARGE_AUD} for a paper lodgement`
        : "Online lodgement, not charged",
      amountInr: round2(paperAud * exchangeRate),
    },
    {
      id: "surcharge",
      label: "Card surcharge on the visa application charge",
      note: surchargePct > 0 ? `${surchargePct}% at payment` : "No surcharge on this method",
      amountInr: round2(surchargeAud * exchangeRate),
    },
    {
      id: "service",
      label: `Biometrics and lodgement service fee x ${applicants}`,
      note: "Charged by the Australian Biometrics Collection Centre in India",
      amountInr: serviceFeeInr,
    },
    {
      id: "health-exam",
      label: `Panel physician health examination x ${applicants}`,
      note: "Required for student, work and longer-stay applications",
      amountInr: healthExamInr,
    },
    {
      id: "health-cover",
      label: `Health cover for ${healthCoverMonths} months x ${applicants}`,
      note: subclass.healthCoverRelevant
        ? "Overseas Student Health Cover must run for the whole visa period"
        : "Optional for this subclass",
      amountInr: healthCoverInr,
    },
    {
      id: "photos",
      label: `Photographs x ${applicants}`,
      note: "45 x 35 mm passport style",
      amountInr: photosInr,
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
      note: "Skills assessment, English test, translations, police checks",
      amountInr: otherInr,
    },
  ];

  return {
    applicants,
    additionalAdults,
    additionalChildren,
    subclassId: subclass.id,
    subclassLabel: subclass.label,
    healthCoverRelevant: subclass.healthCoverRelevant,
    baseAud,
    additionalAdultsAud,
    additionalChildrenAud,
    paperAud,
    subsequentAud,
    visaApplicationChargeAud,
    surchargeAud,
    totalAud,
    totalAudInr,
    serviceFeeInr,
    healthExamInr,
    healthCoverInr,
    photosInr,
    courierInr,
    otherInr,
    indianChargesInr,
    totalInr,
    perApplicantInr,
    govSharePct,
    lines,
  };
}

/**
 * Default charge values for a subclass, so the interface can prefill the three
 * editable Australian dollar fields when the user switches subclass.
 */
export function defaultChargesFor(subclassId) {
  const subclass = VISA_SUBCLASSES.find((entry) => entry.id === subclassId);
  if (!subclass) return null;
  return {
    baseAud: subclass.baseAud,
    additionalAdultAud: subclass.additionalAdultAud,
    additionalChildAud: subclass.additionalChildAud,
  };
}
