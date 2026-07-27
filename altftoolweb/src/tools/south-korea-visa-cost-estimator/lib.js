/**
 * South Korea visa cost model.
 *
 * Korean consular fees are set in US dollars and depend on two things only:
 * how many entries the visa allows, and whether the intended stay is over
 * 90 days. Purpose of travel does not change the fee. The published schedule
 * runs USD 40 for a short single entry, USD 60 for a long single entry,
 * USD 70 for a double entry and USD 90 for a multiple entry, with certain
 * categories exempt under fee-waiver arrangements.
 *
 * Because a multiple-entry visa costs a little over twice a single entry but
 * covers an unlimited number of trips in its validity, the interesting
 * question is not "what does the visa cost" but "how many trips before the
 * multiple entry pays for itself". This module answers both, and every
 * function is pure.
 */

/**
 * Ministry of Foreign Affairs consular fee schedule, in US dollars. Missions
 * collect the equivalent in local currency at a rate they publish.
 */
export const VISA_TYPES = [
  {
    id: "single-90",
    label: "Single entry, intended stay of 90 days or less",
    feeUsd: 40,
    entries: 1,
  },
  {
    id: "single-over-90",
    label: "Single entry, intended stay over 90 days",
    feeUsd: 60,
    entries: 1,
  },
  { id: "double", label: "Double entry", feeUsd: 70, entries: 2 },
  { id: "multiple", label: "Multiple entry", feeUsd: 90, entries: null },
  {
    id: "exempt",
    label: "Fee-exempt category (waiver agreement or exempt purpose)",
    feeUsd: 0,
    entries: 1,
  },
];

/** The short single-entry fee, used as the baseline for repeat-trip comparison. */
export const SINGLE_ENTRY_BASELINE_USD = 40;

/** Intended stay, in days, that separates the two single-entry fee bands. */
export const LONG_STAY_THRESHOLD_DAYS = 90;

/**
 * K-ETA, the electronic travel authorisation, applies to travellers from
 * visa-exempt countries and costs KRW 10,000 plus a small payment charge.
 * Indian passport holders need a visa rather than a K-ETA, so it is recorded
 * here for reference and not added to the total.
 */
export const KETA_FEE_KRW = 10000;

/** GST rate on banking and financial services in India (currently 18%). */
export const GST_ON_FINANCIAL_SERVICES_PCT = 18;

/** Sanity ceiling for an INR-per-USD rate, to catch a mistyped exchange rate. */
export const MAX_EXCHANGE_RATE = 1000;

/** Sanity ceiling on applicants in one estimate. */
export const MAX_APPLICANTS = 50;

/** Sanity ceiling on trips used for the multiple-entry comparison. */
export const MAX_TRIPS = 100;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const isCount = (v) => isNum(v) && v >= 0 && Number.isInteger(v);

/**
 * Total cost of a South Korean visa application, in rupees, plus the
 * break-even comparison against repeated single-entry applications.
 *
 * @returns {object} breakdown, or { error } when an input cannot be used.
 */
export function estimateSouthKoreaVisaCost({
  visaTypeId = "single-90",
  applicants = 1,
  plannedTrips = 1,
  exchangeRate = 0,
  serviceFeeInrPerApplicant = 0,
  photoFeeInrPerApplicant = 0,
  documentFeeInrPerApplicant = 0,
  courierFeeInr = 0,
  otherFeeInr = 0,
  cardMarkupPct = 0,
}) {
  const visaType = VISA_TYPES.find((entry) => entry.id === visaTypeId);
  if (!visaType) return { error: "Pick a valid visa type." };

  if (!isCount(applicants)) return { error: "The number of applicants must be a whole number." };
  if (applicants < 1) return { error: "Add at least one applicant." };
  if (applicants > MAX_APPLICANTS) {
    return { error: `Enter ${MAX_APPLICANTS} applicants or fewer in one estimate.` };
  }
  if (!isCount(plannedTrips)) return { error: "Planned trips must be a whole number." };
  if (plannedTrips < 1) return { error: "Plan at least one trip." };
  if (plannedTrips > MAX_TRIPS) {
    return { error: `Compare ${MAX_TRIPS} trips or fewer in one estimate.` };
  }

  const amounts = {
    "the exchange rate": exchangeRate,
    "the service fee": serviceFeeInrPerApplicant,
    "the photo cost": photoFeeInrPerApplicant,
    "the document cost": documentFeeInrPerApplicant,
    "the courier fee": courierFeeInr,
    "other charges": otherFeeInr,
    "the card markup": cardMarkupPct,
  };
  for (const [label, value] of Object.entries(amounts)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${label}.` };
    if (value < 0) return { error: `${label[0].toUpperCase()}${label.slice(1)} cannot be negative.` };
  }
  if (exchangeRate <= 0) {
    return { error: "Enter the dollar exchange rate the mission is using (rupees per USD 1)." };
  }
  if (exchangeRate > MAX_EXCHANGE_RATE) {
    return { error: `An exchange rate above ${MAX_EXCHANGE_RATE} rupees per dollar looks mistyped.` };
  }
  if (cardMarkupPct > 100) return { error: "A card markup above 100% is not possible." };

  const consularFeeUsd = round2(visaType.feeUsd * applicants);
  const consularFeeInr = round2(consularFeeUsd * exchangeRate);

  const cardMarkupInr = round2((consularFeeInr * cardMarkupPct) / 100);
  const gstOnMarkupInr = round2((cardMarkupInr * GST_ON_FINANCIAL_SERVICES_PCT) / 100);

  const serviceFeeInr = round2(serviceFeeInrPerApplicant * applicants);
  const photosInr = round2(photoFeeInrPerApplicant * applicants);
  const documentsInr = round2(documentFeeInrPerApplicant * applicants);
  const courierInr = round2(courierFeeInr);
  const otherInr = round2(otherFeeInr);
  const indianChargesInr = round2(
    serviceFeeInr + photosInr + documentsInr + courierInr + otherInr,
  );

  const totalInr = round2(consularFeeInr + cardMarkupInr + gstOnMarkupInr + indianChargesInr);
  const perApplicantInr = round2(totalInr / applicants);
  const consularSharePct = totalInr > 0 ? round2((consularFeeInr / totalInr) * 100) : 0;

  // How many entries this visa can actually be used for across the plan.
  const usableEntries =
    visaType.entries === null ? plannedTrips : Math.min(visaType.entries, plannedTrips);
  const costPerEntryInr = usableEntries > 0 ? round2(totalInr / usableEntries) : null;

  // Baseline: applying afresh for a short single-entry visa before every trip.
  // Each application repeats the consular fee and every per-application charge.
  const oneSingleApplicationInr = round2(
    round2(SINGLE_ENTRY_BASELINE_USD * applicants * exchangeRate) *
      (1 + (cardMarkupPct / 100) * (1 + GST_ON_FINANCIAL_SERVICES_PCT / 100)) +
      indianChargesInr,
  );
  const repeatSingleEntryInr = round2(oneSingleApplicationInr * plannedTrips);
  const savingVsRepeatInr = round2(repeatSingleEntryInr - totalInr);

  const lines = [
    {
      id: "consular",
      label: `Consular visa fee x ${applicants}`,
      note:
        visaType.feeUsd > 0
          ? `USD ${visaType.feeUsd} each — ${visaType.label.toLowerCase()}`
          : "No consular fee for this category",
      amountInr: consularFeeInr,
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
      note: "Charged by the application centre for accepting the file",
      amountInr: serviceFeeInr,
    },
    {
      id: "photos",
      label: `Photographs x ${applicants}`,
      note: "35 x 45 mm, white background, taken within six months",
      amountInr: photosInr,
    },
    {
      id: "documents",
      label: `Supporting documents x ${applicants}`,
      note: "Bank statements, income tax returns, employment letters, notarisation",
      amountInr: documentsInr,
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
      note: "Travel to the centre, translations, insurance",
      amountInr: otherInr,
    },
  ];

  return {
    applicants,
    plannedTrips,
    visaTypeId: visaType.id,
    visaTypeLabel: visaType.label,
    feePerApplicantUsd: visaType.feeUsd,
    entriesAllowed: visaType.entries,
    consularFeeUsd,
    consularFeeInr,
    cardMarkupInr,
    gstOnMarkupInr,
    serviceFeeInr,
    photosInr,
    documentsInr,
    courierInr,
    otherInr,
    indianChargesInr,
    totalInr,
    perApplicantInr,
    consularSharePct,
    usableEntries,
    costPerEntryInr,
    oneSingleApplicationInr,
    repeatSingleEntryInr,
    savingVsRepeatInr,
    extraCostVsRepeatInr: round2(Math.max(0, -savingVsRepeatInr)),
    multipleEntryWorthIt: savingVsRepeatInr > 0,
    lines,
  };
}
