/**
 * Thailand entry cost model.
 *
 * Three Thai rules do most of the work here:
 *
 *   1. Visa exemption. Since 26 July 2024 passport holders of a long list of
 *      countries, India included, may enter for tourism or short business
 *      without a visa. When exemption applies the government visa fee is zero,
 *      and only the local costs remain.
 *   2. Extension of stay. An immigration office can extend a permitted stay,
 *      and the extension carries a fixed fee of 1,900 baht per person per
 *      application, whatever the visa category.
 *   3. Overstay fine. Overstaying is fined 500 baht for each day, capped at
 *      20,000 baht however long the overstay runs. The cap is a real ceiling,
 *      not a rounding, so it is applied explicitly here.
 *
 * The Thailand Digital Arrival Card, mandatory since 1 May 2025, is free.
 * All functions are pure; nothing reads the clock.
 */

/**
 * Royal Thai Ministry of Foreign Affairs visa fee schedule, in baht. These are
 * the consular fees; an embassy may collect them in local currency at its own
 * rate, and the e-Visa platform may add a payment charge.
 */
export const ENTRY_OPTIONS = [
  {
    id: "exemption",
    label: "Visa exemption (no visa needed for a short tourist visit)",
    visaFeeThb: 0,
    defaultStayDays: 60,
  },
  {
    id: "tourist-single",
    label: "Tourist visa, single entry (TR)",
    visaFeeThb: 1000,
    defaultStayDays: 60,
  },
  {
    id: "tourist-multiple",
    label: "Tourist visa, multiple entry (METV)",
    visaFeeThb: 5000,
    defaultStayDays: 60,
  },
  {
    id: "transit",
    label: "Transit visa",
    visaFeeThb: 800,
    defaultStayDays: 30,
  },
  {
    id: "non-immigrant-single",
    label: "Non-Immigrant visa, single entry",
    visaFeeThb: 2000,
    defaultStayDays: 90,
  },
  {
    id: "non-immigrant-multiple",
    label: "Non-Immigrant visa, multiple entry",
    visaFeeThb: 5000,
    defaultStayDays: 90,
  },
];

/** Immigration Bureau fee for an extension of stay, per person per application. */
export const EXTENSION_OF_STAY_FEE_THB = 1900;

/** Re-entry permit fees, which preserve an existing permission to stay. */
export const REENTRY_PERMIT_SINGLE_THB = 1000;
export const REENTRY_PERMIT_MULTIPLE_THB = 3800;

/** Overstay fine per day under the Immigration Act. */
export const OVERSTAY_FINE_PER_DAY_THB = 500;

/** Statutory ceiling on the overstay fine, however long the overstay lasts. */
export const OVERSTAY_FINE_CAP_THB = 20000;

/** The Thailand Digital Arrival Card is free and mandatory before arrival. */
export const TDAC_FEE_THB = 0;

/** Days before arrival within which the digital arrival card must be filed. */
export const TDAC_WINDOW_DAYS = 3;

/** GST rate on banking and financial services in India (currently 18%). */
export const GST_ON_FINANCIAL_SERVICES_PCT = 18;

/** Sanity ceiling for an INR-per-THB rate, to catch a mistyped exchange rate. */
export const MAX_EXCHANGE_RATE = 100;

/** Sanity ceiling on travellers in one estimate. */
export const MAX_TRAVELLERS = 50;

/** Sanity ceiling on overstay days this estimator will price. */
export const MAX_OVERSTAY_DAYS = 3650;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const isCount = (v) => isNum(v) && v >= 0 && Number.isInteger(v);

/**
 * Overstay fine for one person: 500 baht a day, capped at 20,000 baht.
 *
 * @returns {object} { days, uncappedThb, fineThb, capReached } or { error }.
 */
export function overstayFine(days) {
  if (!isCount(days)) return { error: "Overstay days must be a whole number of zero or more." };
  if (days > MAX_OVERSTAY_DAYS) {
    return { error: `Price an overstay of ${MAX_OVERSTAY_DAYS} days or fewer.` };
  }
  const uncappedThb = days * OVERSTAY_FINE_PER_DAY_THB;
  const fineThb = Math.min(uncappedThb, OVERSTAY_FINE_CAP_THB);
  return {
    days,
    uncappedThb,
    fineThb,
    capReached: uncappedThb > OVERSTAY_FINE_CAP_THB,
  };
}

/**
 * Total cost of entering Thailand, in rupees.
 *
 * @returns {object} breakdown, or { error } when an input cannot be used.
 */
export function estimateThailandVisaCost({
  entryOptionId = "exemption",
  travellers = 1,
  extensionsPerTraveller = 0,
  reentryPermit = "none",
  overstayDays = 0,
  exchangeRate = 0,
  agentFeeInrPerTraveller = 0,
  photoFeeInrPerTraveller = 0,
  insuranceInrPerTraveller = 0,
  courierFeeInr = 0,
  otherFeeInr = 0,
  cardMarkupPct = 0,
}) {
  const option = ENTRY_OPTIONS.find((entry) => entry.id === entryOptionId);
  if (!option) return { error: "Pick a valid entry option." };

  if (!isCount(travellers)) return { error: "The number of travellers must be a whole number." };
  if (travellers < 1) return { error: "Add at least one traveller." };
  if (travellers > MAX_TRAVELLERS) {
    return { error: `Enter ${MAX_TRAVELLERS} travellers or fewer in one estimate.` };
  }
  if (!isCount(extensionsPerTraveller)) {
    return { error: "Extensions must be a whole number of zero or more." };
  }
  if (extensionsPerTraveller > 12) {
    return { error: "Price twelve extensions or fewer in one estimate." };
  }
  if (!["none", "single", "multiple"].includes(reentryPermit)) {
    return { error: "Pick a valid re-entry permit option." };
  }

  const fine = overstayFine(overstayDays);
  if (fine.error) return { error: fine.error };

  const amounts = {
    "the exchange rate": exchangeRate,
    "the agent fee": agentFeeInrPerTraveller,
    "the photo cost": photoFeeInrPerTraveller,
    "the insurance premium": insuranceInrPerTraveller,
    "the courier fee": courierFeeInr,
    "other charges": otherFeeInr,
    "the card markup": cardMarkupPct,
  };
  for (const [label, value] of Object.entries(amounts)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${label}.` };
    if (value < 0) return { error: `${label[0].toUpperCase()}${label.slice(1)} cannot be negative.` };
  }
  if (exchangeRate <= 0) {
    return { error: "Enter the baht exchange rate (rupees per THB 1)." };
  }
  if (exchangeRate > MAX_EXCHANGE_RATE) {
    return { error: `An exchange rate above ${MAX_EXCHANGE_RATE} rupees per baht looks mistyped.` };
  }
  if (cardMarkupPct > 100) return { error: "A card markup above 100% is not possible." };

  const visaFeeThb = round2(option.visaFeeThb * travellers);
  const extensionFeeThb = round2(
    EXTENSION_OF_STAY_FEE_THB * extensionsPerTraveller * travellers,
  );
  const reentryUnitThb =
    reentryPermit === "single"
      ? REENTRY_PERMIT_SINGLE_THB
      : reentryPermit === "multiple"
        ? REENTRY_PERMIT_MULTIPLE_THB
        : 0;
  const reentryFeeThb = round2(reentryUnitThb * travellers);
  const overstayFineThb = round2(fine.fineThb * travellers);

  const totalThb = round2(visaFeeThb + extensionFeeThb + reentryFeeThb + overstayFineThb);
  const totalThbInr = round2(totalThb * exchangeRate);

  const cardMarkupInr = round2((totalThbInr * cardMarkupPct) / 100);
  const gstOnMarkupInr = round2((cardMarkupInr * GST_ON_FINANCIAL_SERVICES_PCT) / 100);

  const agentFeeInr = round2(agentFeeInrPerTraveller * travellers);
  const photosInr = round2(photoFeeInrPerTraveller * travellers);
  const insuranceInr = round2(insuranceInrPerTraveller * travellers);
  const courierInr = round2(courierFeeInr);
  const otherInr = round2(otherFeeInr);
  const indianChargesInr = round2(agentFeeInr + photosInr + insuranceInr + courierInr + otherInr);

  const totalInr = round2(totalThbInr + cardMarkupInr + gstOnMarkupInr + indianChargesInr);
  const perTravellerInr = round2(totalInr / travellers);
  const thaiSharePct = totalInr > 0 ? round2((totalThbInr / totalInr) * 100) : 0;

  const lines = [
    {
      id: "visa",
      label: `Thai visa fee x ${travellers}`,
      note:
        option.visaFeeThb > 0
          ? `THB ${option.visaFeeThb} each`
          : "No visa fee — visa exemption applies",
      amountInr: round2(visaFeeThb * exchangeRate),
    },
    {
      id: "tdac",
      label: "Thailand Digital Arrival Card",
      note: `Free, filed within ${TDAC_WINDOW_DAYS} days before arrival`,
      amountInr: 0,
    },
    {
      id: "extension",
      label: `Extension of stay x ${extensionsPerTraveller} per traveller`,
      note: `THB ${EXTENSION_OF_STAY_FEE_THB} per application at an immigration office`,
      amountInr: round2(extensionFeeThb * exchangeRate),
    },
    {
      id: "reentry",
      label: `Re-entry permit x ${travellers}`,
      note:
        reentryUnitThb > 0
          ? `THB ${reentryUnitThb} each — keeps an existing permission to stay alive`
          : "Not required",
      amountInr: round2(reentryFeeThb * exchangeRate),
    },
    {
      id: "overstay",
      label: `Overstay fine for ${fine.days} days x ${travellers}`,
      note: fine.capReached
        ? `Capped at THB ${OVERSTAY_FINE_CAP_THB} per person`
        : `THB ${OVERSTAY_FINE_PER_DAY_THB} per day per person`,
      amountInr: round2(overstayFineThb * exchangeRate),
    },
    {
      id: "card",
      label: "Card markup and GST on it",
      note: cardMarkupPct > 0 ? `${cardMarkupPct}% plus 18% GST on the markup` : "Not applied",
      amountInr: round2(cardMarkupInr + gstOnMarkupInr),
    },
    {
      id: "agent",
      label: `Agent or e-Visa handling charge x ${travellers}`,
      note: "Optional — the official e-Visa portal can be used directly",
      amountInr: agentFeeInr,
    },
    {
      id: "photos",
      label: `Photographs x ${travellers}`,
      note: "35 x 45 mm, white background",
      amountInr: photosInr,
    },
    {
      id: "insurance",
      label: `Travel insurance x ${travellers}`,
      note: "Optional for a tourist visit, required for some long-stay categories",
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
      note: "Proof of funds letters, printing, notarisation",
      amountInr: otherInr,
    },
  ];

  return {
    travellers,
    entryOptionId: option.id,
    entryOptionLabel: option.label,
    visaFeePerTravellerThb: option.visaFeeThb,
    defaultStayDays: option.defaultStayDays,
    visaExempt: option.visaFeeThb === 0,
    visaFeeThb,
    extensionFeeThb,
    reentryFeeThb,
    overstayDays: fine.days,
    overstayUncappedThb: fine.uncappedThb,
    overstayFinePerPersonThb: fine.fineThb,
    overstayCapReached: fine.capReached,
    overstayFineThb,
    totalThb,
    totalThbInr,
    cardMarkupInr,
    gstOnMarkupInr,
    agentFeeInr,
    photosInr,
    insuranceInr,
    courierInr,
    otherInr,
    indianChargesInr,
    totalInr,
    perTravellerInr,
    thaiSharePct,
    lines,
  };
}
