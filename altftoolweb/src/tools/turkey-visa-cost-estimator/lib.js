/**
 * Turkey visa cost model.
 *
 * Turkey's e-Visa is cheap and instant, but for many nationalities — Indian
 * passport holders among them — it is a *conditional* e-Visa, issued only to
 * applicants who already hold a valid visa or residence permit from the
 * Schengen area, the United States, the United Kingdom or Ireland. Miss that
 * condition and the e-Visa is not an option at any price; the application has
 * to go to a consulate as a sticker visa.
 *
 * Two more limits decide whether an itinerary works at all:
 *
 *   - A conditional e-Visa is single entry and permits a stay of up to 30 days.
 *   - Whatever the visa, an ordinary passport holder's total stay in Turkey
 *     cannot exceed 90 days in any 180-day period.
 *
 * This module checks those rules before it adds up any money, so an itinerary
 * that cannot legally happen returns a reason rather than a total. Pure
 * functions only; the 180-day window is supplied as a number of days already
 * used, not read from the clock.
 */

/**
 * Maximum stay permitted on a conditional e-Visa, in days per entry.
 */
export const EVISA_MAX_STAY_DAYS = 30;

/** A conditional e-Visa is valid for 180 days from issue and allows one entry. */
export const EVISA_VALIDITY_DAYS = 180;
export const EVISA_ENTRIES = 1;

/**
 * The 90/180 rule: an ordinary passport holder may not spend more than 90 days
 * in Turkey within any rolling 180-day period, whatever the visa says.
 */
export const MAX_STAY_IN_WINDOW_DAYS = 90;
export const ROLLING_WINDOW_DAYS = 180;

/**
 * Typical published price of the conditional e-Visa for Indian passport
 * holders, in US dollars. The charge is a visa fee plus a service fee and it
 * differs by nationality, so it is an editable input with this as its default.
 */
export const DEFAULT_EVISA_FEE_USD = 43;

/** Default starting point for a consulate sticker visa fee, also editable. */
export const DEFAULT_STICKER_FEE_USD = 60;

export const APPLICATION_ROUTES = [
  {
    id: "e-visa",
    label: "Conditional e-Visa applied online",
    requiresSupportingVisa: true,
    maxStayDays: EVISA_MAX_STAY_DAYS,
    defaultFeeUsd: DEFAULT_EVISA_FEE_USD,
  },
  {
    id: "sticker",
    label: "Sticker visa at a Turkish consulate",
    requiresSupportingVisa: false,
    maxStayDays: MAX_STAY_IN_WINDOW_DAYS,
    defaultFeeUsd: DEFAULT_STICKER_FEE_USD,
  },
];

/** Documents that satisfy the conditional e-Visa prerequisite. */
export const QUALIFYING_DOCUMENTS = [
  "A valid Schengen visa or residence permit",
  "A valid United States visa or residence permit",
  "A valid United Kingdom visa or residence permit",
  "A valid Ireland visa or residence permit",
];

/** GST rate on banking and financial services in India (currently 18%). */
export const GST_ON_FINANCIAL_SERVICES_PCT = 18;

/** Sanity ceiling for an INR-per-USD rate, to catch a mistyped exchange rate. */
export const MAX_EXCHANGE_RATE = 1000;

/** Sanity ceiling on travellers in one estimate. */
export const MAX_TRAVELLERS = 50;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const isCount = (v) => isNum(v) && v >= 0 && Number.isInteger(v);

/**
 * Days still available inside the rolling 180-day window.
 *
 * @returns {object} { daysUsed, daysRemaining, plannedFits } or { error }.
 */
export function stayAllowance(daysAlreadyUsed, plannedStayDays) {
  if (!isCount(daysAlreadyUsed) || !isCount(plannedStayDays)) {
    return { error: "Days must be whole numbers of zero or more." };
  }
  if (daysAlreadyUsed > MAX_STAY_IN_WINDOW_DAYS) {
    return {
      error: `You cannot already have spent more than ${MAX_STAY_IN_WINDOW_DAYS} days in Turkey inside a ${ROLLING_WINDOW_DAYS}-day window.`,
    };
  }
  const daysRemaining = MAX_STAY_IN_WINDOW_DAYS - daysAlreadyUsed;
  return {
    daysUsed: daysAlreadyUsed,
    daysRemaining,
    plannedFits: plannedStayDays <= daysRemaining,
  };
}

/**
 * Total cost of a Turkish visa, in rupees, after the eligibility checks.
 *
 * @returns {object} breakdown, or { error } when the trip or an input fails.
 */
export function estimateTurkeyVisaCost({
  routeId = "e-visa",
  travellers = 1,
  plannedStayDays = 1,
  daysAlreadyUsedInWindow = 0,
  holdsQualifyingDocument = true,
  visaFeeUsdPerTraveller = 0,
  exchangeRate = 0,
  agentFeeInrPerTraveller = 0,
  photoFeeInrPerTraveller = 0,
  insuranceInrPerTraveller = 0,
  courierFeeInr = 0,
  otherFeeInr = 0,
  cardMarkupPct = 0,
}) {
  const route = APPLICATION_ROUTES.find((entry) => entry.id === routeId);
  if (!route) return { error: "Pick a valid application route." };

  if (!isCount(travellers)) return { error: "The number of travellers must be a whole number." };
  if (travellers < 1) return { error: "Add at least one traveller." };
  if (travellers > MAX_TRAVELLERS) {
    return { error: `Enter ${MAX_TRAVELLERS} travellers or fewer in one estimate.` };
  }
  if (!isCount(plannedStayDays)) return { error: "Length of stay must be a whole number of days." };
  if (plannedStayDays < 1) return { error: "Enter a stay of at least one day." };

  // Eligibility check 1 — the conditional e-Visa prerequisite.
  if (route.requiresSupportingVisa && !holdsQualifyingDocument) {
    return {
      error:
        "A conditional e-Visa needs a valid Schengen, US, UK or Ireland visa or residence permit. Without one, apply for a sticker visa at a Turkish consulate instead.",
    };
  }

  // Eligibility check 2 — the per-entry limit on this route.
  if (plannedStayDays > route.maxStayDays) {
    return {
      error: `${route.label} permits a stay of up to ${route.maxStayDays} days. Shorten the trip or use a different route.`,
    };
  }

  // Eligibility check 3 — the rolling 90-in-180 limit.
  const allowance = stayAllowance(daysAlreadyUsedInWindow, plannedStayDays);
  if (allowance.error) return { error: allowance.error };
  if (!allowance.plannedFits) {
    return {
      error: `You have ${allowance.daysRemaining} of the ${MAX_STAY_IN_WINDOW_DAYS} days left in this ${ROLLING_WINDOW_DAYS}-day window, so a ${plannedStayDays}-day stay is not permitted.`,
    };
  }

  const amounts = {
    "the visa fee": visaFeeUsdPerTraveller,
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
    return { error: "Enter the dollar exchange rate (rupees per USD 1)." };
  }
  if (exchangeRate > MAX_EXCHANGE_RATE) {
    return { error: `An exchange rate above ${MAX_EXCHANGE_RATE} rupees per dollar looks mistyped.` };
  }
  if (cardMarkupPct > 100) return { error: "A card markup above 100% is not possible." };

  const visaFeeUsd = round2(visaFeeUsdPerTraveller * travellers);
  const visaFeeInr = round2(visaFeeUsd * exchangeRate);

  const cardMarkupInr = round2((visaFeeInr * cardMarkupPct) / 100);
  const gstOnMarkupInr = round2((cardMarkupInr * GST_ON_FINANCIAL_SERVICES_PCT) / 100);

  const agentFeeInr = round2(agentFeeInrPerTraveller * travellers);
  const photosInr = round2(photoFeeInrPerTraveller * travellers);
  const insuranceInr = round2(insuranceInrPerTraveller * travellers);
  const courierInr = round2(courierFeeInr);
  const otherInr = round2(otherFeeInr);
  const indianChargesInr = round2(agentFeeInr + photosInr + insuranceInr + courierInr + otherInr);

  const totalInr = round2(visaFeeInr + cardMarkupInr + gstOnMarkupInr + indianChargesInr);
  const perTravellerInr = round2(totalInr / travellers);
  const perDayInr = round2(totalInr / plannedStayDays);
  const visaSharePct = totalInr > 0 ? round2((visaFeeInr / totalInr) * 100) : 0;
  const daysRemainingAfterTrip = allowance.daysRemaining - plannedStayDays;

  const lines = [
    {
      id: "visa",
      label: `Turkish visa fee x ${travellers}`,
      note: `USD ${visaFeeUsdPerTraveller} each — ${route.label.toLowerCase()}`,
      amountInr: visaFeeInr,
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
      note: "Optional — the official portal at evisa.gov.tr charges nothing extra",
      amountInr: agentFeeInr,
    },
    {
      id: "photos",
      label: `Photographs x ${travellers}`,
      note: "Needed for a sticker visa; an e-Visa uses no photograph",
      amountInr: photosInr,
    },
    {
      id: "insurance",
      label: `Travel insurance x ${travellers}`,
      note: "Not required for an e-Visa but commonly asked for at a consulate",
      amountInr: insuranceInr,
    },
    {
      id: "courier",
      label: "Courier and document handling",
      note: "Only relevant to a consulate application",
      amountInr: courierInr,
    },
    {
      id: "other",
      label: "Other charges",
      note: "Hotel and ticket confirmations, printing, notarisation",
      amountInr: otherInr,
    },
  ];

  return {
    travellers,
    plannedStayDays,
    routeId: route.id,
    routeLabel: route.label,
    routeMaxStayDays: route.maxStayDays,
    holdsQualifyingDocument,
    daysUsedInWindow: allowance.daysUsed,
    daysRemainingInWindow: allowance.daysRemaining,
    daysRemainingAfterTrip,
    visaFeePerTravellerUsd: visaFeeUsdPerTraveller,
    visaFeeUsd,
    visaFeeInr,
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
    visaSharePct,
    evisaValidityDays: EVISA_VALIDITY_DAYS,
    evisaEntries: EVISA_ENTRIES,
    lines,
  };
}
