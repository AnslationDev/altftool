/**
 * Oman entry requirement checklist, stay test and visa cost comparison.
 *
 * Oman runs two parallel systems: a visa waiver for a long list of nationalities that
 * covers short trips only, and a paid e-visa from the Royal Oman Police for anything
 * longer. Choosing the wrong one is the usual mistake — the waiver is generous but it
 * stops at 14 days and carries conditions that the e-visa does not.
 *
 * The rules modelled here:
 *
 *  - Visa waiver. Since 2021 Oman has admitted citizens of just over a hundred
 *    countries without a visa for a stay of up to 14 days. The waiver is conditional:
 *    a return or onward ticket, a confirmed hotel booking, health insurance covering
 *    the period of stay, and sufficient funds — commonly stated as the equivalent of
 *    OMR 500. It is not extendable; a longer trip means an e-visa instead.
 *
 *  - e-Visa. Applied for through the Royal Oman Police portal before travel. The
 *    published tourist options have been a 10-day single-entry visa at OMR 5, a 30-day
 *    single-entry visa at OMR 20 that can be extended once for a further 30 days, and
 *    a one-year multiple-entry visa at OMR 50 that permits up to 30 days per visit.
 *
 *  - Health insurance. Cover for the period of the visit is a condition of the visa
 *    waiver and is asked for with e-visa applications.
 *
 *  - Passport validity. Six months from the date of entry.
 *
 *  - Customs. Cash and negotiable instruments above OMR 6,000 must be declared on
 *    arrival. Alcohol is sold and served in licensed venues only, and a small personal
 *    allowance applies to non-Muslim adult visitors.
 *
 * Informational only. Visa categories, fees and the waiver list are set by the Royal
 * Oman Police and change — confirm on the official e-visa portal before paying.
 */

/** Months of passport validity expected on entry. */
export const PASSPORT_VALIDITY_MONTHS = 6;

/** Funds commonly required to be evidenced on the visa-free route, in Omani rials. */
export const VISA_FREE_FUNDS_OMR = 500;

/** Cash declaration threshold on arrival, in Omani rials. */
export const CURRENCY_DECLARATION_OMR = 6000;

export const ROUTES = [
  {
    id: "visa-free",
    label: "Visa-free entry, up to 14 days",
    maxStayDays: 14,
    extensionDays: 0,
    feeOmr: 0,
    appliedInAdvance: false,
    requiresFundsEvidence: true,
    requiresHotelBooking: true,
    note: "Open to citizens of just over a hundred countries. Conditional on a return ticket, a confirmed hotel booking, health insurance and evidence of funds. Not extendable.",
  },
  {
    id: "evisa-10",
    label: "e-Visa, 10 days single entry (OMR 5)",
    maxStayDays: 10,
    extensionDays: 0,
    feeOmr: 5,
    appliedInAdvance: true,
    requiresFundsEvidence: false,
    requiresHotelBooking: true,
    note: "The cheapest paid option, single entry and not extendable. Useful when the waiver does not cover your nationality.",
  },
  {
    id: "evisa-30",
    label: "e-Visa, 30 days single entry (OMR 20)",
    maxStayDays: 30,
    extensionDays: 30,
    feeOmr: 20,
    appliedInAdvance: true,
    requiresFundsEvidence: false,
    requiresHotelBooking: true,
    note: "Single entry, extendable once inside Oman for a further 30 days on payment of the extension fee.",
  },
  {
    id: "evisa-year",
    label: "e-Visa, one year multiple entry (OMR 50)",
    maxStayDays: 30,
    extensionDays: 0,
    feeOmr: 50,
    appliedInAdvance: true,
    requiresFundsEvidence: false,
    requiresHotelBooking: false,
    note: "Multiple entries over a year with a maximum of 30 days per visit — for repeat trips, not for one long stay.",
  },
  {
    id: "gcc-resident",
    label: "GCC resident visa route",
    maxStayDays: 30,
    extensionDays: 0,
    feeOmr: 5,
    appliedInAdvance: true,
    requiresFundsEvidence: false,
    requiresHotelBooking: true,
    note: "Residents of Gulf Cooperation Council states in eligible professions have their own route, tied to a residence permit that must remain valid.",
  },
  {
    id: "gcc-citizen",
    label: "GCC citizen, national identity card",
    maxStayDays: 365,
    extensionDays: 0,
    feeOmr: 0,
    appliedInAdvance: false,
    requiresFundsEvidence: false,
    requiresHotelBooking: false,
    note: "Citizens of Gulf Cooperation Council states travel on a national identity card and need no visa.",
  },
];

export const PURPOSES = [
  { id: "tourism", label: "Tourism, road trip or visiting family" },
  { id: "business", label: "Business meetings or a conference" },
  { id: "cruise", label: "Arriving by cruise ship or by road from the UAE" },
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
      id: "evisa",
      label: "Approved e-visa from the Royal Oman Police portal",
      detail:
        "Apply on the official portal rather than through a reseller, and carry the approval. Entry is refused without it where the waiver does not apply.",
      required: true,
    });
  }

  if (context.route.id === "gcc-citizen") {
    documents.push({
      id: "gccid",
      label: "National identity card of your GCC state",
      detail: "Accepted in place of a passport for Gulf Cooperation Council citizens.",
      required: true,
    });
  } else {
    documents.push({
      id: "passport",
      label: `Passport valid at least ${PASSPORT_VALIDITY_MONTHS} months beyond entry`,
      detail: "Counted from the day you arrive. Keep blank pages for the stamps.",
      required: true,
    });
  }

  documents.push({
    id: "onward",
    label: "Confirmed return or onward ticket",
    detail:
      "A condition of the visa waiver and checked at the counter. Road arrivals from the UAE are asked for an exit plan too.",
    required: true,
  });
  documents.push({
    id: "insurance",
    label: "Health insurance covering the whole visit",
    detail:
      "A stated condition of the visa waiver and asked for with e-visa applications. Private treatment is otherwise paid up front.",
    required: true,
  });

  if (context.route.requiresHotelBooking) {
    documents.push({
      id: "hotel",
      label: "Confirmed hotel booking",
      detail:
        "The waiver names it as a condition. Where you are staying with family, carry the host's address and contact details instead.",
      required: true,
    });
  }

  if (context.route.requiresFundsEvidence) {
    documents.push({
      id: "funds",
      label: `Evidence of funds, commonly the equivalent of OMR ${VISA_FREE_FUNDS_OMR}`,
      detail:
        "A card with available balance, a recent statement or cash. It is asked for on the visa-free route rather than the paid ones.",
      required: true,
    });
  }

  if (context.route.id === "gcc-resident") {
    documents.push({
      id: "residence",
      label: "GCC residence permit valid beyond the visit",
      detail: "The route depends on the permit and, for some categories, on the profession on it.",
      required: true,
    });
  }

  if (context.purposeId === "business") {
    documents.push({
      id: "invitation",
      label: "Invitation letter from the Omani host company",
      detail:
        "On letterhead with the dates and purpose. A tourist visa does not permit paid work in Oman.",
      required: true,
    });
  }

  if (context.purposeId === "cruise") {
    documents.push({
      id: "roadentry",
      label: "Entry point checked in advance",
      detail:
        "Land crossings from the UAE and cruise arrivals have their own procedures, and vehicle insurance valid in Oman is required if you drive in.",
      required: true,
    });
  }

  if (context.travellingWithChildren) {
    documents.push({
      id: "childdocs",
      label: "Each child's passport and their own visa or waiver record",
      detail: "Children are counted individually for the e-visa fee and the insurance requirement.",
      required: true,
    });
  }

  if (context.carryingCash) {
    documents.push({
      id: "cash",
      label: "Customs cash declaration",
      detail: `Cash and negotiable instruments above OMR ${CURRENCY_DECLARATION_OMR.toLocaleString("en-US")} must be declared on arrival.`,
      required: true,
    });
  }

  documents.push({
    id: "driving",
    label: "International driving permit for a hire car",
    detail:
      "Oman is a driving country and the interior is remote. Off-road routes need a proper vehicle, fuel planning and a second car for company.",
    required: false,
  });
  documents.push({
    id: "conduct",
    label: "Know the local rules",
    detail:
      "Alcohol is served in licensed venues only, drones need permission, and modest dress is expected away from hotel resorts.",
    required: false,
  });

  return documents;
}

/**
 * Build the Oman entry checklist and cost.
 *
 * @param {object} input
 * @param {string} input.routeId        One of ROUTES ids.
 * @param {string} input.purposeId      One of PURPOSES ids.
 * @param {string} input.arrivalDate    YYYY-MM-DD.
 * @param {string} input.passportExpiry YYYY-MM-DD.
 * @param {number} input.stayDays       Days you intend to stay.
 * @param {number} input.travellers     People in the party.
 * @param {number} input.children       How many of them are children.
 * @param {number} [input.fundsOmr]     Funds you can evidence, in rials.
 * @param {boolean} [input.carryingCash]
 * @returns {object} result, or { error }.
 */
export function buildOmanChecklist({
  routeId = "visa-free",
  purposeId = "tourism",
  arrivalDate = "",
  passportExpiry = "",
  stayDays = 10,
  travellers = 2,
  children = 0,
  fundsOmr = VISA_FREE_FUNDS_OMR,
  carryingCash = false,
} = {}) {
  const route = ROUTES.find((entry) => entry.id === routeId);
  if (!route) return { error: "Choose the entry route that applies to you." };

  const purpose = PURPOSES.find((entry) => entry.id === purposeId);
  if (!purpose) return { error: "Choose the purpose of your visit." };

  const arrival = parseDate(arrivalDate);
  if (!arrival) return { error: "Enter your arrival date as a real calendar date." };

  const expiry = parseDate(passportExpiry);
  if (!expiry) return { error: "Enter your passport or ID expiry date as a real calendar date." };

  const days = Number(stayDays);
  if (!Number.isFinite(days) || days < 1) {
    return { error: "Enter how many days you will stay, at least 1." };
  }
  if (days > 365) {
    return { error: "Enter 365 days or fewer; a longer stay needs a residence permit." };
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

  const funds = Number(fundsOmr);
  if (!Number.isFinite(funds) || funds < 0) {
    return { error: "Funds must be zero or a positive amount in rials." };
  }

  // Passport validity: six months from the date of entry.
  const passportMustReach = addMonths(arrival, PASSPORT_VALIDITY_MONTHS);
  const passportOk = expiry.getTime() >= passportMustReach.getTime();
  const passportShortfallDays = passportOk ? 0 : daysBetween(expiry, passportMustReach);

  // Stay test, first against the admission and then against admission plus extension.
  const wholeDays = Math.round(days);
  const withExtensionDays = route.maxStayDays + route.extensionDays;
  const withinInitialStay = wholeDays <= route.maxStayDays;
  const withinExtendedStay = wholeDays <= withExtensionDays;
  const needsExtension = !withinInitialStay && withinExtendedStay;
  const daysOverLimit = withinExtendedStay ? 0 : wholeDays - withExtensionDays;

  // Funds test only applies on the visa-free route.
  const fundsRequiredOmr = route.requiresFundsEvidence ? VISA_FREE_FUNDS_OMR : 0;
  const fundsOk = !route.requiresFundsEvidence || funds >= fundsRequiredOmr;
  const fundsShortfallOmr = fundsOk ? 0 : round2(fundsRequiredOmr - funds);

  // Visa fee: per traveller, children included.
  const visaFeeTotalOmr = round2(route.feeOmr * partySize);

  // What the cheapest route would be for this length of trip, ignoring nationality.
  const cheaperOption = ROUTES.filter(
    (option) =>
      option.id !== route.id &&
      option.id !== "gcc-citizen" &&
      option.id !== "gcc-resident" &&
      wholeDays <= option.maxStayDays + option.extensionDays &&
      option.feeOmr * partySize < visaFeeTotalOmr,
  ).sort((a, b) => a.feeOmr - b.feeOmr)[0];

  const documents = buildDocuments({
    route,
    purposeId: purpose.id,
    travellingWithChildren: childCount > 0,
    carryingCash: Boolean(carryingCash),
  });
  const requiredDocuments = documents.filter((doc) => doc.required);
  const optionalDocuments = documents.filter((doc) => !doc.required);

  const warnings = [];
  if (!passportOk) {
    warnings.push(
      `Your travel document expires ${passportShortfallDays} day(s) too early — Oman wants it valid to ${toIso(passportMustReach)}.`,
    );
  }
  if (needsExtension) {
    warnings.push(
      `Your ${wholeDays}-day stay is longer than the ${route.maxStayDays}-day admission. Apply for the ${route.extensionDays}-day extension inside Oman before the first period ends.`,
    );
  }
  if (!withinExtendedStay) {
    warnings.push(
      `${wholeDays} days is ${daysOverLimit} day(s) beyond what this route allows (${withExtensionDays} days at most). Choose the 30-day e-visa or a longer permission.`,
    );
  }
  if (route.id === "visa-free" && wholeDays > route.maxStayDays) {
    warnings.push(
      "The visa waiver is not extendable. Anything past 14 days has to start as an e-visa applied for before you fly.",
    );
  }
  if (!fundsOk) {
    warnings.push(
      `The visa-free route asks for evidence of about OMR ${fundsRequiredOmr}. You are OMR ${fundsShortfallOmr} short on the figure entered.`,
    );
  }
  if (route.id === "evisa-year") {
    warnings.push(
      "The one-year visa allows multiple entries but no more than 30 days per visit — it does not buy one long stay.",
    );
  }

  const verdict = passportOk
    ? withinExtendedStay && fundsOk
      ? `Route works — visa cost OMR ${visaFeeTotalOmr.toLocaleString("en-US")} for ${partySize} traveller(s), plus insurance.`
      : "Conditions not met on the figures entered — see the warnings before booking."
    : "Travel document validity fails the six-month rule — renew first.";

  return {
    route,
    purpose,
    arrivalDate: toIso(arrival),
    passportExpiry: toIso(expiry),
    passportMustBeValidUntil: toIso(passportMustReach),
    passportOk,
    passportShortfallDays,
    stayDays: wholeDays,
    maxStayDays: route.maxStayDays,
    extensionDays: route.extensionDays,
    maxStayWithExtensionDays: withExtensionDays,
    withinInitialStay,
    withinExtendedStay,
    needsExtension,
    daysOverLimit,
    travellers: Math.round(partySize),
    children: Math.round(childCount),
    fundsRequiredOmr,
    fundsOmr: round2(funds),
    fundsOk,
    fundsShortfallOmr,
    visaFeePerPersonOmr: route.feeOmr,
    visaFeeTotalOmr,
    cheaperOption: cheaperOption || null,
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

export default buildOmanChecklist;
