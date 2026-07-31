/**
 * Malaysia entry cost model.
 *
 * The decisive rule is length of stay, not purpose. Malaysia has waived the
 * visa requirement for several nationalities, Indian passport holders among
 * them, for social or business visits of up to 30 days. Inside that window the
 * government charge is nothing and the only mandatory step is the Malaysia
 * Digital Arrival Card, which is free. Past that window the waiver stops
 * applying and a visa has to be paid for, so a trip of 31 days costs an order
 * of magnitude more than a trip of 29.
 *
 * This module checks the stay against the waiver limit first, then prices
 * whichever route survives, converting ringgit to rupees at the rate you give
 * it. Pure functions only; nothing reads the clock.
 */

/**
 * Longest social or business visit covered by Malaysia's visa waiver for
 * eligible nationalities. The waiver is a policy with an announced end date
 * rather than a permanent entitlement, so it is worth re-checking each year.
 */
export const VISA_EXEMPTION_MAX_STAY_DAYS = 30;

/**
 * The Malaysia Digital Arrival Card is free, mandatory for most foreign
 * travellers, and can be submitted from three days before arrival.
 */
export const MDAC_WINDOW_DAYS = 3;

/**
 * Starting values for the ringgit charges on each route. The eVISA portal
 * bills a visa fee plus a processing charge, and the amounts differ by
 * nationality, so all three are editable inputs rather than fixed constants.
 */
export const ENTRY_ROUTES = [
  {
    id: "exemption",
    label: "Visa-free entry (eligible nationality, short social or business visit)",
    requiresVisa: false,
    visaFeeRm: 0,
    processingFeeRm: 0,
    maxStayDays: VISA_EXEMPTION_MAX_STAY_DAYS,
  },
  {
    id: "evisa-single",
    label: "eVISA, single entry",
    requiresVisa: true,
    visaFeeRm: 20,
    processingFeeRm: 65,
    maxStayDays: 30,
  },
  {
    id: "evisa-multiple",
    label: "eVISA, multiple entry",
    requiresVisa: true,
    visaFeeRm: 100,
    processingFeeRm: 65,
    maxStayDays: 30,
  },
  {
    id: "sticker",
    label: "Sticker visa at a Malaysian mission",
    requiresVisa: true,
    visaFeeRm: 20,
    processingFeeRm: 0,
    maxStayDays: 30,
  },
];

/** GST rate on banking and financial services in India (currently 18%). */
export const GST_ON_FINANCIAL_SERVICES_PCT = 18;

/** Sanity ceiling for an INR-per-MYR rate, to catch a mistyped exchange rate. */
export const MAX_EXCHANGE_RATE = 500;

/** Sanity ceiling on travellers in one estimate. */
export const MAX_TRAVELLERS = 50;

/** Longest stay this estimator will price, in days. */
export const MAX_STAY_DAYS = 365;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const isCount = (v) => isNum(v) && v >= 0 && Number.isInteger(v);

/**
 * Default ringgit charges for a route, so the interface can prefill them.
 */
export function defaultFeesFor(routeId) {
  const route = ENTRY_ROUTES.find((entry) => entry.id === routeId);
  if (!route) return null;
  return { visaFeeRm: route.visaFeeRm, processingFeeRm: route.processingFeeRm };
}

/**
 * Total cost of entering Malaysia, in rupees.
 *
 * @returns {object} breakdown, or { error } when an input cannot be used.
 */
export function estimateMalaysiaVisaCost({
  routeId = "exemption",
  travellers = 1,
  stayDays = 1,
  visaFeeRm = 0,
  processingFeeRm = 0,
  serviceFeeRm = 0,
  exchangeRate = 0,
  agentFeeInrPerTraveller = 0,
  photoFeeInrPerTraveller = 0,
  insuranceInrPerTraveller = 0,
  courierFeeInr = 0,
  otherFeeInr = 0,
  cardMarkupPct = 0,
}) {
  const route = ENTRY_ROUTES.find((entry) => entry.id === routeId);
  if (!route) return { error: "Pick a valid entry route." };

  if (!isCount(travellers)) return { error: "The number of travellers must be a whole number." };
  if (travellers < 1) return { error: "Add at least one traveller." };
  if (travellers > MAX_TRAVELLERS) {
    return { error: `Enter ${MAX_TRAVELLERS} travellers or fewer in one estimate.` };
  }
  if (!isCount(stayDays)) return { error: "Length of stay must be a whole number of days." };
  if (stayDays < 1) return { error: "Enter a stay of at least one day." };
  if (stayDays > MAX_STAY_DAYS) {
    return { error: `Price a stay of ${MAX_STAY_DAYS} days or fewer.` };
  }

  // The waiver only covers stays inside its limit; past that it is not an option.
  if (!route.requiresVisa && stayDays > route.maxStayDays) {
    return {
      error: `Visa-free entry covers stays of up to ${route.maxStayDays} days. For ${stayDays} days you need a visa — switch the route above.`,
    };
  }

  const ringgit = {
    "the visa fee": visaFeeRm,
    "the processing fee": processingFeeRm,
    "the portal service charge": serviceFeeRm,
  };
  for (const [label, value] of Object.entries(ringgit)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${label}.` };
    if (value < 0) return { error: `${label[0].toUpperCase()}${label.slice(1)} cannot be negative.` };
  }

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
    return { error: "Enter the ringgit exchange rate (rupees per MYR 1)." };
  }
  if (exchangeRate > MAX_EXCHANGE_RATE) {
    return { error: `An exchange rate above ${MAX_EXCHANGE_RATE} rupees per ringgit looks mistyped.` };
  }
  if (cardMarkupPct > 100) return { error: "A card markup above 100% is not possible." };

  const perTravellerRm = route.requiresVisa
    ? round2(visaFeeRm + processingFeeRm + serviceFeeRm)
    : 0;
  const totalRm = round2(perTravellerRm * travellers);

  // Each Malaysian-charge line is rounded once in ringgit, then once after the
  // FX conversion — the same two-step rounding the line-by-line table uses.
  // The headline total is then the SUM of those already-rounded line amounts,
  // not an independently-rounded RM subtotal converted to INR, so the
  // "Total entry cost" headline always agrees with the line-by-line table to
  // the paisa (same fix pattern as student-mess-bill-splitter and
  // unit-test-weightage-calculator).
  const visaLineInr = route.requiresVisa ? round2(round2(visaFeeRm * travellers) * exchangeRate) : 0;
  const processingLineInr = route.requiresVisa ? round2(round2(processingFeeRm * travellers) * exchangeRate) : 0;
  const serviceLineInr = route.requiresVisa ? round2(round2(serviceFeeRm * travellers) * exchangeRate) : 0;
  const totalRmInr = round2(visaLineInr + processingLineInr + serviceLineInr);

  const cardMarkupInr = round2((totalRmInr * cardMarkupPct) / 100);
  const gstOnMarkupInr = round2((cardMarkupInr * GST_ON_FINANCIAL_SERVICES_PCT) / 100);

  const agentFeeInr = round2(agentFeeInrPerTraveller * travellers);
  const photosInr = round2(photoFeeInrPerTraveller * travellers);
  const insuranceInr = round2(insuranceInrPerTraveller * travellers);
  const courierInr = round2(courierFeeInr);
  const otherInr = round2(otherFeeInr);
  const indianChargesInr = round2(agentFeeInr + photosInr + insuranceInr + courierInr + otherInr);

  const totalInr = round2(totalRmInr + cardMarkupInr + gstOnMarkupInr + indianChargesInr);
  const perTravellerInr = round2(totalInr / travellers);
  const perDayInr = round2(totalInr / stayDays);
  const govSharePct = totalInr > 0 ? round2((totalRmInr / totalInr) * 100) : 0;
  const daysLeftInWaiver = route.requiresVisa
    ? null
    : Math.max(0, route.maxStayDays - stayDays);

  const lines = [
    {
      id: "visa",
      label: `Malaysian visa fee x ${travellers}`,
      note: route.requiresVisa
        ? `MYR ${visaFeeRm} each`
        : "No visa fee — the visit falls inside the waiver",
      amountInr: visaLineInr,
    },
    {
      id: "processing",
      label: `eVISA processing charge x ${travellers}`,
      note: route.requiresVisa ? `MYR ${processingFeeRm} each` : "Not applicable",
      amountInr: processingLineInr,
    },
    {
      id: "service",
      label: `Portal service charge x ${travellers}`,
      note: route.requiresVisa ? `MYR ${serviceFeeRm} each` : "Not applicable",
      amountInr: serviceLineInr,
    },
    {
      id: "mdac",
      label: "Malaysia Digital Arrival Card",
      note: `Free, submitted from ${MDAC_WINDOW_DAYS} days before arrival`,
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
      label: `Agent or handling charge x ${travellers}`,
      note: "Optional — the official portal can be used directly",
      amountInr: agentFeeInr,
    },
    {
      id: "photos",
      label: `Photographs x ${travellers}`,
      note: "35 x 50 mm, white background, for a visa application",
      amountInr: photosInr,
    },
    {
      id: "insurance",
      label: `Travel insurance x ${travellers}`,
      note: "Optional for a short visit",
      amountInr: insuranceInr,
    },
    {
      id: "courier",
      label: "Courier and document handling",
      note: "Only relevant to a sticker visa application",
      amountInr: courierInr,
    },
    {
      id: "other",
      label: "Other charges",
      note: "Confirmed return ticket booking, hotel confirmations, printing",
      amountInr: otherInr,
    },
  ];

  return {
    travellers,
    stayDays,
    routeId: route.id,
    routeLabel: route.label,
    requiresVisa: route.requiresVisa,
    waiverMaxStayDays: route.maxStayDays,
    daysLeftInWaiver,
    perTravellerRm,
    totalRm,
    totalRmInr,
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
    perDayInr,
    govSharePct,
    lines,
  };
}
