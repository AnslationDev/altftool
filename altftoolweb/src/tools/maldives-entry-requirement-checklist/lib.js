/**
 * Maldives entry requirement checklist, funds test and Green Tax calculator.
 *
 * The Maldives has one of the simplest entry regimes in the world and one of the
 * least obvious cost structures. There is no visa to apply for, but there is a
 * compulsory online declaration, a funds rule that bites when you have not booked a
 * registered property, and a per-night environmental tax that is not always shown in
 * a room quote.
 *
 * The rules modelled here:
 *
 *  - Visa. A free 30-day visa is issued on arrival to every nationality, with no
 *    prior application. It is a tourist permission: paid work is not allowed on it.
 *
 *  - Passport validity. Maldives Immigration requires a passport valid for at least
 *    one month beyond the date of arrival — shorter than the six months most
 *    destinations demand. Airlines and transit countries often apply their own
 *    six-month rule anyway, so the checklist tests both.
 *
 *  - Traveller Declaration. Every arriving and departing traveller must submit the
 *    IMUGA Traveller Declaration online within 96 hours before arrival, and again
 *    within 96 hours before departure. It is free and takes minutes, but it is
 *    checked at the counter.
 *
 *  - Funds. Where there is no confirmed booking at a registered tourist facility,
 *    immigration applies a sufficient-funds test of USD 100 plus USD 50 for each day
 *    of the intended stay. A confirmed booking normally removes the question.
 *
 *  - Green Tax. Levied per tourist per night on the accommodation bill. From
 *    1 January 2025 the rates are USD 12 per person per night at resorts, integrated
 *    tourist resorts, tourist hotels and safari vessels, and USD 6 per person per
 *    night at guesthouses and hotels on inhabited islands. Children under two years
 *    old are exempt.
 *
 *  - Departure charges. Foreign passengers pay an Airport Development Fee and a
 *    Departure Tax, each set by travel class: USD 50 economy, USD 120 business,
 *    USD 240 first and USD 480 for private jets, at the rates in force from
 *    1 December 2024. They are normally collected inside the air ticket, so the total
 *    here is a check against the fare breakdown rather than a separate bill.
 *
 * Informational only. Tax rates and fees are set by Maldivian legislation and revised
 * — confirm with Maldives Immigration and the Maldives Inland Revenue Authority.
 */

/** Free visa on arrival, in days, granted to every nationality. */
export const VISA_ON_ARRIVAL_DAYS = 30;

/** Months of passport validity required by Maldives Immigration, from arrival. */
export const PASSPORT_VALIDITY_MONTHS = 1;

/** Months many airlines and transit countries apply regardless of the destination rule. */
export const AIRLINE_RULE_OF_THUMB_MONTHS = 6;

/** Hours before arrival and before departure within which IMUGA must be submitted. */
export const IMUGA_WINDOW_HOURS = 96;

/** Funds test applied when there is no confirmed booking: base plus per-day amount. */
export const FUNDS_BASE_USD = 100;
export const FUNDS_PER_DAY_USD = 50;

/** Age below which a child is exempt from Green Tax and departure charges. */
export const TAX_EXEMPT_UNDER_AGE = 2;

/** Green Tax per tourist per night, in force from 1 January 2025. */
export const ACCOMMODATION_TYPES = [
  {
    id: "resort",
    label: "Resort, integrated tourist resort, tourist hotel or safari vessel",
    greenTaxUsdPerNight: 12,
    note: "The USD 12 rate applies to resort islands, tourist hotels and liveaboard vessels.",
  },
  {
    id: "guesthouse",
    label: "Guesthouse or hotel on an inhabited local island",
    greenTaxUsdPerNight: 6,
    note: "Local-island guesthouses are taxed at half the resort rate. Local island etiquette and dress rules apply there.",
  },
];

/** Airport Development Fee and Departure Tax, each at these rates, from 1 Dec 2024. */
export const DEPARTURE_CLASSES = [
  { id: "economy", label: "Economy", perChargeUsd: 50 },
  { id: "business", label: "Business", perChargeUsd: 120 },
  { id: "first", label: "First class", perChargeUsd: 240 },
  { id: "jet", label: "Private jet", perChargeUsd: 480 },
];

/** Number of separate departure charges levied: the ADF and the Departure Tax. */
export const DEPARTURE_CHARGE_COUNT = 2;

const MS_PER_DAY = 86400000;

function parseDate(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function addMonths(date, months) {
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target;
}

function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

const round2 = (value) => Math.round(value * 100) / 100;

function buildDocuments(context) {
  const documents = [];

  documents.push({
    id: "imuga",
    label: `IMUGA Traveller Declaration submitted within ${IMUGA_WINDOW_HOURS} hours of arrival`,
    detail:
      "Free, online, and compulsory for every traveller including children. A second declaration is needed within 96 hours before you fly out.",
    required: true,
  });
  documents.push({
    id: "passport",
    label: `Passport valid at least ${PASSPORT_VALIDITY_MONTHS} month beyond arrival`,
    detail:
      "That is the Maldivian rule. Your airline or a transit country may still apply a six-month rule, so check the whole routing, not just the destination.",
    required: true,
  });
  documents.push({
    id: "onward",
    label: "Confirmed return or onward ticket",
    detail: "Checked at the counter. A one-way ticket without an onward booking is refused boarding.",
    required: true,
  });

  if (context.hasBooking) {
    documents.push({
      id: "booking",
      label: "Confirmation from a registered tourist facility",
      detail:
        "A booking at a registered resort, hotel, guesthouse or vessel is what replaces the funds test. Carry the confirmation, not just an email thread.",
      required: true,
    });
    documents.push({
      id: "transfer",
      label: "Seaplane, domestic flight or speedboat transfer confirmation",
      detail:
        "Most properties are an internal transfer away from Malé, and seaplanes fly in daylight only. A late international arrival can cost you a night near the airport.",
      required: true,
    });
  } else {
    documents.push({
      id: "funds",
      label: "Evidence of funds for the whole stay",
      detail: `Without a confirmed booking, immigration applies USD ${FUNDS_BASE_USD} plus USD ${FUNDS_PER_DAY_USD} for each day of the intended stay. Cash, a card statement or a bank balance can be shown.`,
      required: true,
    });
    documents.push({
      id: "address",
      label: "Where you will stay on the first night",
      detail:
        "Arriving with no accommodation at all is the most common reason a traveller is questioned on arrival in Malé.",
      required: true,
    });
  }

  if (context.hasInfants) {
    documents.push({
      id: "infant",
      label: "Each child's own passport and IMUGA declaration",
      detail: `Children under ${TAX_EXEMPT_UNDER_AGE} pay no Green Tax and no departure charges, but they need their own passport and declaration.`,
      required: true,
    });
  }

  if (context.diving) {
    documents.push({
      id: "diving",
      label: "Certification card, logbook and dive insurance",
      detail:
        "Centres ask for certification and a recent logged dive. The single recompression chamber network is small, so dive cover matters.",
      required: false,
    });
  }

  if (context.localIsland) {
    documents.push({
      id: "etiquette",
      label: "Modest clothing for inhabited islands",
      detail:
        "Bikinis are limited to designated tourist beaches on local islands, and alcohol is not sold there. Resort islands are exempt from both rules.",
      required: false,
    });
  }

  documents.push({
    id: "insurance",
    label: "Travel and medical insurance with evacuation cover",
    detail:
      "Serious cases are moved to Malé or abroad. Evacuation from a remote atoll is the expensive part.",
    required: false,
  });
  documents.push({
    id: "restricted",
    label: "Check what you are packing",
    detail:
      "Alcohol, pork products, pornography and religious materials for distribution are prohibited imports and are seized at Velana International Airport. Alcohol is sold and served at licensed resorts only.",
    required: false,
  });

  return documents;
}

/**
 * Build the Maldives entry checklist, the funds test and the tax estimate.
 *
 * @param {object} input
 * @param {string} input.arrivalDate       YYYY-MM-DD.
 * @param {string} input.passportExpiry    YYYY-MM-DD.
 * @param {number} input.nights            Nights of stay.
 * @param {number} input.adults            Travellers aged 2 and over.
 * @param {number} input.infantsUnder2     Travellers under 2.
 * @param {string} input.accommodationId   One of ACCOMMODATION_TYPES ids.
 * @param {boolean} input.hasBooking       Confirmed booking at a registered facility.
 * @param {number} [input.availableFundsUsd] Funds you can evidence, for the funds test.
 * @param {string} [input.departureClassId]  One of DEPARTURE_CLASSES ids.
 * @param {boolean} [input.diving]
 * @returns {object} result, or { error }.
 */
export function buildMaldivesChecklist({
  arrivalDate = "",
  passportExpiry = "",
  nights = 5,
  adults = 2,
  infantsUnder2 = 0,
  accommodationId = "resort",
  hasBooking = true,
  availableFundsUsd = 0,
  departureClassId = "economy",
  diving = false,
} = {}) {
  const accommodation = ACCOMMODATION_TYPES.find((entry) => entry.id === accommodationId);
  if (!accommodation) return { error: "Choose the kind of accommodation you are staying in." };

  const departureClass = DEPARTURE_CLASSES.find((entry) => entry.id === departureClassId);
  if (!departureClass) return { error: "Choose the class you will fly out in." };

  const arrival = parseDate(arrivalDate);
  if (!arrival) return { error: "Enter your arrival date as a real calendar date." };

  const expiry = parseDate(passportExpiry);
  if (!expiry) return { error: "Enter your passport expiry date as a real calendar date." };

  const nightCount = Number(nights);
  if (!Number.isFinite(nightCount) || nightCount < 1) {
    return { error: "Enter the number of nights you are staying, at least 1." };
  }
  if (nightCount > 365) {
    return { error: "Enter 365 nights or fewer — a longer stay needs an extension or another visa." };
  }

  const adultCount = Number(adults);
  const infantCount = Number(infantsUnder2);
  if (!Number.isFinite(adultCount) || !Number.isFinite(infantCount)) {
    return { error: "Enter the number of travellers as whole numbers." };
  }
  if (adultCount < 0 || infantCount < 0) {
    return { error: "The number of travellers cannot be negative." };
  }
  const partySize = adultCount + infantCount;
  if (partySize < 1) return { error: "Add at least one traveller." };
  if (partySize > 60) return { error: "This checklist covers a single party of up to 60 people." };

  const funds = Number(availableFundsUsd);
  if (!Number.isFinite(funds) || funds < 0) {
    return { error: "Available funds must be zero or a positive amount." };
  }

  // Visa on arrival is 30 days; a longer stay has to be extended from inside.
  const stayWithinVisa = nightCount <= VISA_ON_ARRIVAL_DAYS;
  const daysOverVisa = stayWithinVisa ? 0 : Math.round(nightCount - VISA_ON_ARRIVAL_DAYS);

  // Passport validity: one month from arrival is the Maldivian rule; six is the
  // rule of thumb airlines and transit countries apply.
  const passportMustReach = addMonths(arrival, PASSPORT_VALIDITY_MONTHS);
  const airlineRuleReach = addMonths(arrival, AIRLINE_RULE_OF_THUMB_MONTHS);
  const passportOk = expiry.getTime() >= passportMustReach.getTime();
  const meetsAirlineRuleOfThumb = expiry.getTime() >= airlineRuleReach.getTime();
  const passportShortfallDays = passportOk ? 0 : daysBetween(expiry, passportMustReach);

  // Funds test: only applied where there is no confirmed booking.
  const fundsRequiredUsd = hasBooking
    ? 0
    : round2(FUNDS_BASE_USD + FUNDS_PER_DAY_USD * Math.round(nightCount));
  const fundsOk = hasBooking || funds >= fundsRequiredUsd;
  const fundsShortfallUsd = fundsOk ? 0 : round2(fundsRequiredUsd - funds);

  // Green Tax: per taxable person per night. Under-twos are exempt.
  const greenTaxRate = accommodation.greenTaxUsdPerNight;
  const greenTaxTotalUsd = round2(greenTaxRate * adultCount * Math.round(nightCount));

  // Departure charges: the Airport Development Fee and the Departure Tax are each
  // charged at the class rate, so a departing passenger pays twice the class figure.
  const departurePerPersonUsd = round2(departureClass.perChargeUsd * DEPARTURE_CHARGE_COUNT);
  const departureTotalUsd = round2(departurePerPersonUsd * adultCount);

  const governmentChargesUsd = round2(greenTaxTotalUsd + departureTotalUsd);

  const documents = buildDocuments({
    hasBooking: Boolean(hasBooking),
    hasInfants: infantCount > 0,
    diving: Boolean(diving),
    localIsland: accommodation.id === "guesthouse",
  });
  const requiredDocuments = documents.filter((doc) => doc.required);
  const optionalDocuments = documents.filter((doc) => !doc.required);

  const warnings = [];
  if (!passportOk) {
    warnings.push(
      `Your passport expires ${passportShortfallDays} day(s) too early — Maldives Immigration needs it valid to ${toIso(passportMustReach)}.`,
    );
  } else if (!meetsAirlineRuleOfThumb) {
    warnings.push(
      `Your passport clears the Maldivian one-month rule but not the six-month rule airlines and transit countries commonly apply (they would want ${toIso(airlineRuleReach)}). Check every leg of the routing.`,
    );
  }
  if (!stayWithinVisa) {
    warnings.push(
      `The visa on arrival is ${VISA_ON_ARRIVAL_DAYS} days. Your stay is ${daysOverVisa} day(s) longer, so apply for an extension at Maldives Immigration in Malé before it runs out.`,
    );
  }
  if (!fundsOk) {
    warnings.push(
      `Without a confirmed booking the funds test is USD ${fundsRequiredUsd.toLocaleString("en-US")}. You are USD ${fundsShortfallUsd.toLocaleString("en-US")} short on the figure entered.`,
    );
  }
  if (!hasBooking) {
    warnings.push(
      "Booking a registered tourist facility is the simplest way to close the funds question — immigration asks where you are staying either way.",
    );
  }

  const verdict = passportOk
    ? fundsOk
      ? `Cleared on paper — budget about USD ${governmentChargesUsd.toLocaleString("en-US")} in Green Tax and departure charges for the party.`
      : "Funds test not met on the figures entered — book a registered property or raise the evidence."
    : "Passport validity fails the Maldivian rule — renew before you fly.";

  return {
    accommodation,
    departureClass,
    arrivalDate: toIso(arrival),
    passportExpiry: toIso(expiry),
    passportMustBeValidUntil: toIso(passportMustReach),
    airlineRuleOfThumbUntil: toIso(airlineRuleReach),
    passportOk,
    meetsAirlineRuleOfThumb,
    passportShortfallDays,
    nights: Math.round(nightCount),
    visaDays: VISA_ON_ARRIVAL_DAYS,
    stayWithinVisa,
    daysOverVisa,
    adults: Math.round(adultCount),
    infantsUnder2: Math.round(infantCount),
    partySize: Math.round(partySize),
    hasBooking: Boolean(hasBooking),
    fundsRequiredUsd,
    availableFundsUsd: round2(funds),
    fundsOk,
    fundsShortfallUsd,
    greenTaxRateUsd: greenTaxRate,
    greenTaxTotalUsd,
    departurePerPersonUsd,
    departureTotalUsd,
    governmentChargesUsd,
    documents,
    requiredDocuments,
    optionalDocuments,
    warnings,
    verdict,
  };
}

/**
 * Progress against the required documents only.
 *
 * @param {Array<{id:string,required:boolean}>} documents
 * @param {Array<string>} haveIds
 */
export function computeReadiness(documents, haveIds) {
  const list = Array.isArray(documents) ? documents : [];
  const have = Array.isArray(haveIds) ? haveIds : [];
  const requiredDocs = list.filter((doc) => doc.required);
  const missing = requiredDocs.filter((doc) => !have.includes(doc.id));
  const total = requiredDocs.length;
  const held = total - missing.length;
  return {
    have: held,
    total,
    percent: total === 0 ? 0 : Math.round((held / total) * 100),
    missing,
    ready: total > 0 && missing.length === 0,
  };
}

export default buildMaldivesChecklist;
