/**
 * United States nonimmigrant visa cost model.
 *
 * A US visa bill has three separate government layers that people routinely
 * confuse with one another:
 *
 *   1. The MRV (machine-readable visa) application fee, set by the Schedule of
 *      Fees for Consular Services at 22 CFR 22.1 and payable before the
 *      interview is booked. Its amount depends only on the visa class.
 *   2. The SEVIS I-901 fee, payable to the Department of Homeland Security by
 *      students and exchange visitors only, and completely separate from the
 *      MRV fee.
 *   3. The visa issuance (reciprocity) fee, charged after approval, which
 *      depends on the applicant's nationality and not on the visa class.
 *
 * On top of those sit commercial costs paid in India — photographs, travel to
 * the consulate, document attestation. This module adds all of it and converts
 * to rupees at a rate you supply. Pure functions only; nothing reads the clock.
 */

/**
 * MRV application fees from the Department of State Schedule of Fees for
 * Consular Services, in force since 17 June 2023 (88 FR 18434).
 */
export const VISA_CLASSES = [
  {
    id: "b1b2",
    label: "B-1/B-2 visitor (business or tourism)",
    mrvFeeUsd: 185,
    sevisFeeUsd: 0,
    sevisLabel: null,
  },
  { id: "f", label: "F-1/F-2 student", mrvFeeUsd: 185, sevisFeeUsd: 350, sevisLabel: "I-901 (F)" },
  {
    id: "m",
    label: "M-1/M-2 vocational student",
    mrvFeeUsd: 185,
    sevisFeeUsd: 350,
    sevisLabel: "I-901 (M)",
  },
  {
    id: "j",
    label: "J-1/J-2 exchange visitor",
    mrvFeeUsd: 185,
    sevisFeeUsd: 220,
    sevisLabel: "I-901 (J)",
  },
  {
    id: "j-subsidised",
    label: "J-1 au pair, camp counselor or summer work travel",
    mrvFeeUsd: 185,
    sevisFeeUsd: 35,
    sevisLabel: "I-901 (J, reduced)",
  },
  {
    id: "c1d",
    label: "C-1/D transit and crew",
    mrvFeeUsd: 185,
    sevisFeeUsd: 0,
    sevisLabel: null,
  },
  {
    id: "i",
    label: "I journalist and media",
    mrvFeeUsd: 185,
    sevisFeeUsd: 0,
    sevisLabel: null,
  },
  {
    id: "petition",
    label: "H, L, O, P, Q or R petition-based worker",
    mrvFeeUsd: 205,
    sevisFeeUsd: 0,
    sevisLabel: null,
  },
  {
    id: "e",
    label: "E-1/E-2 treaty trader or investor, E-3",
    mrvFeeUsd: 315,
    sevisFeeUsd: 0,
    sevisLabel: null,
  },
  {
    id: "k",
    label: "K fiance(e) of a US citizen",
    mrvFeeUsd: 265,
    sevisFeeUsd: 0,
    sevisLabel: null,
  },
];

/**
 * Visa Integrity Fee created by section 100007 of Public Law 119-21 (enacted
 * 4 July 2025), payable by nonimmigrant visa applicants in addition to the MRV
 * fee and indexed for inflation from fiscal 2026. Collection depends on the
 * Department of State's implementing guidance, so this is an opt-in line
 * rather than an assumption.
 */
export const VISA_INTEGRITY_FEE_USD = 250;

/**
 * The MRV receipt stays valid for one year from the date of payment, within
 * which the interview must be scheduled. Used for the "book before" note.
 */
export const MRV_VALIDITY_MONTHS = 12;

/**
 * After a refusal under section 214(b), a paid SEVIS I-901 fee can be reused
 * for a new application for the same programme within 12 months.
 */
export const SEVIS_REUSE_MONTHS = 12;

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
 * Total cost of a US nonimmigrant visa application, in rupees.
 *
 * @returns {object} breakdown, or { error } when an input cannot be used.
 */
export function estimateUsaVisaCost({
  visaClassId = "b1b2",
  applicants = 1,
  exchangeRate = 0,
  reciprocityFeeUsdPerApplicant = 0,
  includeIntegrityFee = false,
  photoFeeInrPerApplicant = 0,
  courierFeeInr = 0,
  travelFeeInr = 0,
  otherFeeInr = 0,
  cardMarkupPct = 0,
}) {
  const visaClass = VISA_CLASSES.find((entry) => entry.id === visaClassId);
  if (!visaClass) return { error: "Pick a valid visa class." };

  if (!isCount(applicants)) {
    return { error: "The number of applicants must be a whole number." };
  }
  if (applicants < 1) return { error: "Add at least one applicant." };
  if (applicants > MAX_APPLICANTS) {
    return { error: `Enter ${MAX_APPLICANTS} applicants or fewer in one estimate.` };
  }

  const amounts = {
    "the exchange rate": exchangeRate,
    "the reciprocity fee": reciprocityFeeUsdPerApplicant,
    "the photo cost": photoFeeInrPerApplicant,
    "the courier fee": courierFeeInr,
    "travel and stay": travelFeeInr,
    "other charges": otherFeeInr,
    "the card markup": cardMarkupPct,
  };
  for (const [label, value] of Object.entries(amounts)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${label}.` };
    if (value < 0) return { error: `${label[0].toUpperCase()}${label.slice(1)} cannot be negative.` };
  }
  if (exchangeRate <= 0) {
    return { error: "Enter the dollar exchange rate you will be billed at (rupees per USD 1)." };
  }
  if (exchangeRate > MAX_EXCHANGE_RATE) {
    return { error: `An exchange rate above ${MAX_EXCHANGE_RATE} rupees per dollar looks mistyped.` };
  }
  if (cardMarkupPct > 100) return { error: "A card markup above 100% is not possible." };

  // Layer 1 — MRV application fee, per applicant, per 22 CFR 22.1.
  const mrvFeeUsd = round2(visaClass.mrvFeeUsd * applicants);

  // Layer 2 — SEVIS I-901, students and exchange visitors only.
  const sevisFeeUsd = round2(visaClass.sevisFeeUsd * applicants);

  // Layer 3 — issuance/reciprocity fee, nationality dependent, charged only if
  // the visa is approved.
  const reciprocityUsd = round2(reciprocityFeeUsdPerApplicant * applicants);

  const integrityFeeUsd = includeIntegrityFee
    ? round2(VISA_INTEGRITY_FEE_USD * applicants)
    : 0;

  const totalUsd = round2(mrvFeeUsd + sevisFeeUsd + reciprocityUsd + integrityFeeUsd);
  const totalUsdInr = round2(totalUsd * exchangeRate);

  const cardMarkupInr = round2((totalUsdInr * cardMarkupPct) / 100);
  const gstOnMarkupInr = round2((cardMarkupInr * GST_ON_FINANCIAL_SERVICES_PCT) / 100);

  const photosInr = round2(photoFeeInrPerApplicant * applicants);
  const courierInr = round2(courierFeeInr);
  const travelInr = round2(travelFeeInr);
  const otherInr = round2(otherFeeInr);

  const indianChargesInr = round2(photosInr + courierInr + travelInr + otherInr);
  const totalInr = round2(totalUsdInr + cardMarkupInr + gstOnMarkupInr + indianChargesInr);
  const perApplicantInr = round2(totalInr / applicants);
  const usFeeSharePct = totalInr > 0 ? round2((totalUsdInr / totalInr) * 100) : 0;

  // The reciprocity fee is only charged on approval, so it is not at risk in a
  // refusal; everything else already paid is gone.
  const reciprocityInr = round2(reciprocityUsd * exchangeRate);
  const reciprocityMarkupInr = round2((reciprocityInr * cardMarkupPct) / 100);
  const reciprocityAtRiskInr = round2(
    reciprocityInr +
      reciprocityMarkupInr +
      (reciprocityMarkupInr * GST_ON_FINANCIAL_SERVICES_PCT) / 100,
  );
  const sunkIfRefusedInr = round2(Math.max(0, totalInr - reciprocityAtRiskInr));

  const lines = [
    {
      id: "mrv",
      label: `MRV application fee x ${applicants}`,
      note: `USD ${visaClass.mrvFeeUsd} each — non-refundable, non-transferable`,
      amountInr: round2(mrvFeeUsd * exchangeRate),
    },
    {
      id: "sevis",
      label: visaClass.sevisLabel
        ? `SEVIS ${visaClass.sevisLabel} fee x ${applicants}`
        : "SEVIS I-901 fee",
      note: visaClass.sevisLabel
        ? `USD ${visaClass.sevisFeeUsd} each — paid to DHS before the interview`
        : "Not payable for this visa class",
      amountInr: round2(sevisFeeUsd * exchangeRate),
    },
    {
      id: "reciprocity",
      label: `Visa issuance (reciprocity) fee x ${applicants}`,
      note:
        reciprocityFeeUsdPerApplicant > 0
          ? `USD ${reciprocityFeeUsdPerApplicant} each — charged only on approval`
          : "Nil for most Indian passport holders",
      amountInr: round2(reciprocityUsd * exchangeRate),
    },
    {
      id: "integrity",
      label: `Visa Integrity Fee x ${applicants}`,
      note: includeIntegrityFee
        ? `USD ${VISA_INTEGRITY_FEE_USD} each under Public Law 119-21`
        : "Not included — switch on only if your post is collecting it",
      amountInr: round2(integrityFeeUsd * exchangeRate),
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
      note: "51 x 51 mm (2 x 2 inch), white background",
      amountInr: photosInr,
    },
    {
      id: "courier",
      label: "Passport pickup or courier",
      note: "Free at most Indian collection points; add a value if you pay",
      amountInr: courierInr,
    },
    {
      id: "travel",
      label: "Travel and stay for the OFC and consulate visits",
      note: "Two separate appointments in most Indian cities",
      amountInr: travelInr,
    },
    {
      id: "other",
      label: "Other charges",
      note: "Attestation, translations, document couriers",
      amountInr: otherInr,
    },
  ];

  return {
    applicants,
    visaClassId: visaClass.id,
    visaClassLabel: visaClass.label,
    mrvFeePerApplicantUsd: visaClass.mrvFeeUsd,
    sevisFeePerApplicantUsd: visaClass.sevisFeeUsd,
    mrvFeeUsd,
    sevisFeeUsd,
    reciprocityUsd,
    integrityFeeUsd,
    mrvFeeInr: round2(mrvFeeUsd * exchangeRate),
    sevisFeeInr: round2(sevisFeeUsd * exchangeRate),
    reciprocityInr,
    integrityFeeInr: round2(integrityFeeUsd * exchangeRate),
    totalUsd,
    totalUsdInr,
    cardMarkupInr,
    gstOnMarkupInr,
    photosInr,
    courierInr,
    travelInr,
    otherInr,
    indianChargesInr,
    totalInr,
    perApplicantInr,
    usFeeSharePct,
    sunkIfRefusedInr,
    mrvValidityMonths: MRV_VALIDITY_MONTHS,
    sevisReuseMonths: SEVIS_REUSE_MONTHS,
    lines,
  };
}
