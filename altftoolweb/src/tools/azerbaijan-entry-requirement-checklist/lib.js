/**
 * Azerbaijan entry requirement checklist, e-visa cost and registration deadline.
 *
 * Two things catch visitors to Azerbaijan. The first is that the ASAN e-visa is a
 * single-entry document with a fixed 30-day stay, so a side trip to Georgia and back
 * needs a second visa. The second is registration: a stay of more than 15 days must be
 * registered with the State Migration Service, and the fine for missing it is levied
 * on the way out, when it is far too late to fix.
 *
 * The rules modelled here:
 *
 *  - ASAN e-visa. Applied for online, single entry, permitting a stay of up to 30 days
 *    and usable within 90 days of issue. The published fees have been USD 25 for the
 *    standard service, decided within three working days, and USD 60 for the urgent
 *    service, decided within three hours.
 *
 *  - Visa-free entry. Citizens of the CIS states, Turkey and a handful of others enter
 *    without a visa, commonly for up to 90 days within a 180-day period.
 *
 *  - Visa on arrival. Available at Heydar Aliyev International Airport to citizens of
 *    a short list of countries, for 30 days.
 *
 *  - Registration. A foreigner staying longer than 15 days must register their place
 *    of stay with the State Migration Service within 15 days of arrival. Hotels
 *    normally do it for their guests; private accommodation and rentals do not, and
 *    that is where the fine comes from.
 *
 *  - Passport validity. At least three months beyond the end of the intended stay.
 *
 *  - Nagorno-Karabakh. Entering the region without Azerbaijani authorisation leads to
 *    being declared persona non grata and refused entry to Azerbaijan. Having an
 *    Armenian stamp is not in itself a bar; entering the region from Armenia is.
 *
 *  - Customs. Cash and negotiable instruments above the equivalent of USD 10,000 must
 *    be declared on arrival.
 *
 * Informational only. Fees, visa-free lists and stay limits are set by the State
 * Migration Service and the Ministry of Foreign Affairs and change — confirm on the
 * official ASAN Visa portal before paying.
 */

/** Months of passport validity required beyond the end of the stay. */
export const PASSPORT_VALIDITY_MONTHS_BEYOND_STAY = 3;

/** A stay longer than this many days must be registered. */
export const REGISTRATION_THRESHOLD_DAYS = 15;

/** And the registration must be made within this many days of arrival. */
export const REGISTRATION_DEADLINE_DAYS = 15;

/** Days an approved e-visa remains usable for entry after it is issued. */
export const EVISA_VALIDITY_DAYS = 90;

/** Cash declaration threshold on arrival, in US dollars or the equivalent. */
export const CURRENCY_DECLARATION_USD = 10000;

export const ROUTES = [
  {
    id: "evisa-standard",
    label: "ASAN e-visa, standard service (USD 25)",
    maxStayDays: 30,
    feeUsd: 25,
    processingText: "Three working days",
    appliedInAdvance: true,
    singleEntry: true,
    note: "Single entry, 30 days of stay, usable within 90 days of issue. Apply on the official ASAN Visa portal, not through a reseller.",
  },
  {
    id: "evisa-urgent",
    label: "ASAN e-visa, urgent service (USD 60)",
    maxStayDays: 30,
    feeUsd: 60,
    processingText: "Three hours",
    appliedInAdvance: true,
    singleEntry: true,
    note: "The same visa decided in hours rather than days, for a higher fee. Useful only when you have left it late.",
  },
  {
    id: "visa-free",
    label: "Visa-free entry (CIS states, Turkey and others)",
    maxStayDays: 90,
    feeUsd: 0,
    processingText: "Nothing to apply for",
    appliedInAdvance: false,
    singleEntry: false,
    note: "Commonly up to 90 days within a rolling 180-day period. Registration still applies past 15 days.",
  },
  {
    id: "voa",
    label: "Visa on arrival at Heydar Aliyev airport",
    maxStayDays: 30,
    feeUsd: 25,
    processingText: "At the airport counter",
    appliedInAdvance: false,
    singleEntry: true,
    note: "Available to citizens of a short list of countries, at the airport only — not at land borders.",
  },
  {
    id: "embassy",
    label: "Visa from an Azerbaijani embassy or consulate",
    maxStayDays: 30,
    feeUsd: 0,
    processingText: "Weeks, not days",
    appliedInAdvance: true,
    singleEntry: true,
    note: "For nationalities outside the ASAN system, and for categories the e-visa does not cover. Fees are set by the mission.",
  },
];

export const PURPOSES = [
  { id: "tourism", label: "Tourism or visiting family" },
  { id: "business", label: "Business meetings or a conference" },
  { id: "transit", label: "Transit with an overnight stop" },
];

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

function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
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

  if (context.route.appliedInAdvance) {
    documents.push({
      id: "visa",
      label:
        context.route.id === "embassy"
          ? "Visa issued by an Azerbaijani mission"
          : "Approved ASAN e-visa, printed or saved offline",
      detail:
        context.route.id === "embassy"
          ? "Allow weeks. Missions set their own fees and document lists."
          : `Single entry, usable within ${EVISA_VALIDITY_DAYS} days of issue. Airlines check it before boarding, and mobile data at the border is not something to rely on.`,
      required: true,
    });
  }

  documents.push({
    id: "passport",
    label: `Passport valid at least ${PASSPORT_VALIDITY_MONTHS_BEYOND_STAY} months beyond the end of your stay`,
    detail:
      "Azerbaijan counts the three months from your departure date, not from arrival, so a long trip needs more validity than a short one.",
    required: true,
  });
  documents.push({
    id: "onward",
    label: "Confirmed onward or return ticket",
    detail: "Checked at the airline counter and on arrival.",
    required: true,
  });
  documents.push({
    id: "accommodation",
    label: "Accommodation booking or the address of your host",
    detail:
      "Needed for the arrival card and, more importantly, for registration if you are staying more than 15 days.",
    required: true,
  });

  if (context.needsRegistration) {
    documents.push({
      id: "registration",
      label: "Registration with the State Migration Service",
      detail: `Compulsory for stays longer than ${REGISTRATION_THRESHOLD_DAYS} days and due within ${REGISTRATION_DEADLINE_DAYS} days of arrival. Hotels usually do it for guests; a rented flat or a friend's home does not, so ask and confirm.`,
      required: true,
    });
  }

  if (context.purposeId === "business") {
    documents.push({
      id: "invitation",
      label: "Invitation from the Azerbaijani host organisation",
      detail: "Business e-visa categories ask for it, and it is worth carrying either way.",
      required: true,
    });
  }

  if (context.travellingWithChildren) {
    documents.push({
      id: "childdocs",
      label: "Each child's own passport and e-visa",
      detail: "Children are counted individually for the visa fee; there is no family application.",
      required: true,
    });
  }

  if (context.carryingCash) {
    documents.push({
      id: "cash",
      label: "Customs cash declaration",
      detail: `Cash and negotiable instruments above the equivalent of USD ${CURRENCY_DECLARATION_USD.toLocaleString("en-US")} must be declared.`,
      required: true,
    });
  }

  if (context.multipleEntries) {
    documents.push({
      id: "secondvisa",
      label: "A second visa for the return leg",
      detail:
        "The e-visa is single entry. Leaving for Georgia or Iran and coming back means applying again before you go.",
      required: true,
    });
  }

  documents.push({
    id: "insurance",
    label: "Travel and medical insurance",
    detail: "Not checked at the border for most routes, but treatment is paid for without it.",
    required: false,
  });
  documents.push({
    id: "karabakh",
    label: "Know the Nagorno-Karabakh rule",
    detail:
      "Entering the region without Azerbaijani authorisation leads to being declared persona non grata and refused entry. An Armenian stamp on its own is not a bar.",
    required: false,
  });

  return documents;
}

/**
 * Build the Azerbaijan entry checklist, cost and registration deadline.
 *
 * @param {object} input
 * @param {string} input.routeId        One of ROUTES ids.
 * @param {string} input.purposeId      One of PURPOSES ids.
 * @param {string} input.arrivalDate    YYYY-MM-DD.
 * @param {string} input.passportExpiry YYYY-MM-DD.
 * @param {number} input.stayDays       Days you intend to stay.
 * @param {number} input.travellers     People in the party.
 * @param {number} input.children       How many of them are children.
 * @param {boolean} [input.leavingAndReturning] Planning to exit and re-enter.
 * @param {boolean} [input.carryingCash]
 * @returns {object} result, or { error }.
 */
export function buildAzerbaijanChecklist({
  routeId = "evisa-standard",
  purposeId = "tourism",
  arrivalDate = "",
  passportExpiry = "",
  stayDays = 10,
  travellers = 2,
  children = 0,
  leavingAndReturning = false,
  carryingCash = false,
} = {}) {
  const route = ROUTES.find((entry) => entry.id === routeId);
  if (!route) return { error: "Choose the entry route that applies to you." };

  const purpose = PURPOSES.find((entry) => entry.id === purposeId);
  if (!purpose) return { error: "Choose the purpose of your visit." };

  const arrival = parseDate(arrivalDate);
  if (!arrival) return { error: "Enter your arrival date as a real calendar date." };

  const expiry = parseDate(passportExpiry);
  if (!expiry) return { error: "Enter your passport expiry date as a real calendar date." };

  const days = Number(stayDays);
  if (!Number.isFinite(days) || days < 1) {
    return { error: "Enter how many days you will stay, at least 1." };
  }
  if (days > 365) {
    return { error: "Enter 365 days or fewer; a longer stay needs a temporary residence permit." };
  }

  const partySize = Number(travellers);
  const childCount = Number(children);
  if (!Number.isFinite(partySize) || !Number.isFinite(childCount)) {
    return { error: "Enter the number of travellers as whole numbers." };
  }
  if (partySize < 1) return { error: "Add at least one traveller." };
  if (childCount < 0) return { error: "The number of children cannot be negative." };
  if (childCount > partySize) {
    return { error: "There cannot be more children than travellers in the party." };
  }
  if (partySize > 60) return { error: "This checklist covers a single party of up to 60 people." };

  const wholeDays = Math.round(days);

  // Departure day, and the passport rule counted three months beyond it.
  const departure = addDays(arrival, wholeDays);
  const passportMustReach = addMonths(departure, PASSPORT_VALIDITY_MONTHS_BEYOND_STAY);
  const passportOk = expiry.getTime() >= passportMustReach.getTime();
  const passportShortfallDays = passportOk ? 0 : daysBetween(expiry, passportMustReach);

  // Stay test against the admission this route grants.
  const stayWithinLimit = wholeDays <= route.maxStayDays;
  const daysOverLimit = stayWithinLimit ? 0 : wholeDays - route.maxStayDays;

  // Registration: needed past 15 days, and due 15 days after arrival.
  const needsRegistration = wholeDays > REGISTRATION_THRESHOLD_DAYS;
  const registrationDeadline = addDays(arrival, REGISTRATION_DEADLINE_DAYS);

  // Visa fee, per traveller including children.
  const visaFeeTotalUsd = round2(route.feeUsd * partySize);

  // A single-entry visa cannot cover a trip out and back.
  const needsSecondVisa = Boolean(leavingAndReturning) && route.singleEntry;

  const documents = buildDocuments({
    route,
    purposeId: purpose.id,
    needsRegistration,
    travellingWithChildren: childCount > 0,
    carryingCash: Boolean(carryingCash),
    multipleEntries: needsSecondVisa,
  });
  const requiredDocuments = documents.filter((doc) => doc.required);
  const optionalDocuments = documents.filter((doc) => !doc.required);

  const warnings = [];
  if (!passportOk) {
    warnings.push(
      `Your passport expires ${passportShortfallDays} day(s) too early — it must stay valid to ${toIso(passportMustReach)}, three months past your ${toIso(departure)} departure.`,
    );
  }
  if (!stayWithinLimit) {
    warnings.push(
      `This route admits you for ${route.maxStayDays} days and you plan ${wholeDays} — ${daysOverLimit} day(s) too many. Overstaying is fined on the way out.`,
    );
  }
  if (needsRegistration) {
    warnings.push(
      `Register with the State Migration Service by ${toIso(registrationDeadline)}. Hotels usually do it; a rented flat or a friend's home does not, and the fine is collected at the airport when you leave.`,
    );
  }
  if (needsSecondVisa) {
    warnings.push(
      "This visa is single entry. Crossing into Georgia or Iran and coming back needs a second visa applied for in advance.",
    );
  }
  if (route.id === "voa") {
    warnings.push(
      "Visa on arrival is available at Heydar Aliyev International Airport only, and only to a short list of nationalities. Land borders do not issue it.",
    );
  }

  const verdict = passportOk
    ? stayWithinLimit
      ? `Route works — visa cost USD ${visaFeeTotalUsd.toLocaleString("en-US")} for ${partySize} traveller(s).`
      : "Planned stay is longer than this route allows."
    : "Passport validity fails the three-month rule counted from departure.";

  return {
    route,
    purpose,
    arrivalDate: toIso(arrival),
    departureDate: toIso(departure),
    passportExpiry: toIso(expiry),
    passportMustBeValidUntil: toIso(passportMustReach),
    passportOk,
    passportShortfallDays,
    stayDays: wholeDays,
    maxStayDays: route.maxStayDays,
    stayWithinLimit,
    daysOverLimit,
    needsRegistration,
    registrationDeadline: toIso(registrationDeadline),
    travellers: Math.round(partySize),
    children: Math.round(childCount),
    visaFeePerPersonUsd: route.feeUsd,
    visaFeeTotalUsd,
    needsSecondVisa,
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

export default buildAzerbaijanChecklist;
