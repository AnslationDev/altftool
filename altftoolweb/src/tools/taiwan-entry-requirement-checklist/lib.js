/**
 * Taiwan entry requirement checklist, stay test and Travel Authorization window.
 *
 * Taiwan's visa-exempt entry is easy to get and hard to extend: the stay granted on
 * arrival cannot normally be lengthened once you are in the country, so the trip has
 * to be planned around it rather than fixed later. The other thing that surprises
 * arrivals is customs — bringing meat products from an area affected by African swine
 * fever carries a fine measured in the hundreds of thousands of New Taiwan dollars,
 * and it is enforced with detector dogs at the airport.
 *
 * The rules modelled here:
 *
 *  - Visa exemption. Citizens of most of Europe, the United States, Canada, Australia,
 *    New Zealand, Japan and Korea are admitted for 90 days. Singaporean and Malaysian
 *    nationals are admitted for 30 days, and several South East Asian nationalities for
 *    14 days under a trial scheme that Taiwan has renewed repeatedly. A visa-exempt
 *    stay is not extendable in the ordinary way.
 *
 *  - Travel Authorization Certificate. A free online certificate for citizens of
 *    India, Indonesia, Vietnam, Cambodia, Laos, Myanmar and the Philippines who hold a
 *    valid — or recently expired — visa or permanent residence from the United States,
 *    Canada, Japan, the United Kingdom, a Schengen country, Australia, New Zealand or
 *    Korea. It permits multiple entries with a stay of up to 14 days each and is valid
 *    for 90 days from issue.
 *
 *  - Passport validity. Six months from the date of entry for most visitors. Citizens
 *    of a small group of countries, including the United States, Canada and Japan,
 *    need only validity covering the intended stay.
 *
 *  - Arrival card. Every visitor completes one. It can be filed free on the National
 *    Immigration Agency's online system before travel, which saves the paper form.
 *
 *  - Customs. Cash above NT$100,000, or foreign currency above the equivalent of
 *    USD 10,000, must be declared. Meat products from areas affected by African swine
 *    fever are prohibited and the fine for a first offence runs to NT$200,000.
 *
 * Informational only. Visa-exempt lists, permitted stays and fees are set by Taiwan's
 * Bureau of Consular Affairs and National Immigration Agency and change — confirm on
 * the official sites before travelling.
 */

/** Months of passport validity required from entry, for most nationalities. */
export const PASSPORT_VALIDITY_MONTHS = 6;

/** Days a Travel Authorization Certificate stays usable after it is issued. */
export const TAC_VALIDITY_DAYS = 90;

/** New Taiwan dollar cash declaration threshold. */
export const CURRENCY_DECLARATION_TWD = 100000;

/** Foreign currency declaration threshold, in US dollars or the equivalent. */
export const CURRENCY_DECLARATION_USD = 10000;

/** Fine for a first offence of bringing in prohibited meat products, in NT dollars. */
export const MEAT_IMPORT_FINE_TWD = 200000;

export const ROUTES = [
  {
    id: "exempt-90",
    label: "Visa exemption, 90 days",
    maxStayDays: 90,
    feeUsd: 0,
    extendable: false,
    appliedInAdvance: false,
    multipleEntry: true,
    note: "Covers most of Europe, the United States, Canada, Australia, New Zealand, Japan and Korea. Nothing to apply for, but the stay cannot normally be extended.",
  },
  {
    id: "exempt-30",
    label: "Visa exemption, 30 days",
    maxStayDays: 30,
    feeUsd: 0,
    extendable: false,
    appliedInAdvance: false,
    multipleEntry: true,
    note: "Applies to Singaporean and Malaysian nationals among others.",
  },
  {
    id: "exempt-14",
    label: "Visa exemption, 14 days (trial scheme)",
    maxStayDays: 14,
    feeUsd: 0,
    extendable: false,
    appliedInAdvance: false,
    multipleEntry: true,
    note: "A trial arrangement for several South East Asian nationalities that Taiwan has renewed repeatedly. Check it is still running for your dates.",
  },
  {
    id: "tac",
    label: "Travel Authorization Certificate (free, 14 days)",
    maxStayDays: 14,
    feeUsd: 0,
    extendable: false,
    appliedInAdvance: true,
    multipleEntry: true,
    note: "Free online certificate for citizens of India, Indonesia, Vietnam, Cambodia, Laos, Myanmar and the Philippines who hold a qualifying visa or residence from the US, Canada, Japan, the UK, Schengen, Australia, New Zealand or Korea.",
  },
  {
    id: "evisa",
    label: "eVisa, 30 days",
    maxStayDays: 30,
    feeUsd: 50,
    extendable: true,
    appliedInAdvance: true,
    multipleEntry: false,
    note: "Applied for online where your nationality is eligible. The fee is set by the Bureau of Consular Affairs and the standard single-entry visitor visa fee has been around USD 50.",
  },
  {
    id: "visa",
    label: "Visitor visa from a Taipei representative office",
    maxStayDays: 60,
    feeUsd: 50,
    extendable: true,
    appliedInAdvance: true,
    multipleEntry: false,
    note: "For longer visits and for nationalities outside the online systems. A 60-day visitor visa without the no-extension endorsement can usually be extended inside Taiwan.",
  },
];

export const PURPOSES = [
  { id: "tourism", label: "Tourism or visiting family" },
  { id: "business", label: "Business meetings or a conference" },
  { id: "study", label: "Short course or language study" },
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

  if (context.route.id === "tac") {
    documents.push({
      id: "tac",
      label: "Travel Authorization Certificate, printed",
      detail:
        "Free from the National Immigration Agency site. It is issued against a qualifying visa or residence from another country, and that document has to be carried too.",
      required: true,
    });
    documents.push({
      id: "qualifying",
      label: "The qualifying visa or residence card it was issued against",
      detail:
        "A US, Canadian, Japanese, UK, Schengen, Australian, New Zealand or Korean visa or permanent residence. Immigration checks the original, not just the certificate.",
      required: true,
    });
  } else if (context.route.appliedInAdvance) {
    documents.push({
      id: "visa",
      label: "Approved visa, printed or in the passport",
      detail: "Applied for before travel through the official system or a Taipei representative office.",
      required: true,
    });
  }

  documents.push({
    id: "passport",
    label: context.sixMonthRule
      ? `Passport valid at least ${PASSPORT_VALIDITY_MONTHS} months beyond entry`
      : "Passport valid for the whole of your intended stay",
    detail: context.sixMonthRule
      ? "The standard rule, counted from the day you arrive."
      : "Citizens of a small group of countries, including the United States, Canada and Japan, are held only to validity covering the stay.",
    required: true,
  });
  documents.push({
    id: "arrivalcard",
    label: "Arrival card, filed online before travel",
    detail:
      "Free on the National Immigration Agency system. Filing it in advance saves the paper form and the queue at the desk.",
    required: true,
  });
  documents.push({
    id: "onward",
    label: "Confirmed onward or return ticket",
    detail:
      "A condition of visa-exempt entry and checked by the airline. A ticket out within the permitted stay is what they are looking for.",
    required: true,
  });
  documents.push({
    id: "accommodation",
    label: "Accommodation booking or host's address",
    detail: "Needed for the arrival card and asked for at immigration.",
    required: true,
  });

  if (context.purposeId === "business") {
    documents.push({
      id: "invitation",
      label: "Invitation or meeting confirmation from the Taiwanese host",
      detail: "Visa-exempt entry covers meetings and conferences but not paid employment.",
      required: true,
    });
  }

  if (context.purposeId === "study") {
    documents.push({
      id: "enrolment",
      label: "Enrolment letter, and a check on which permission the course needs",
      detail:
        "Short courses can exceed what visa-exempt entry allows. A programme longer than the admission needs a visitor or resident visa arranged in advance.",
      required: true,
    });
  }

  if (context.needsExtensionPath) {
    documents.push({
      id: "extension",
      label: "A different permission for the length of your stay",
      detail:
        "Visa-exempt entry and the Travel Authorization Certificate are not extended in the ordinary way. Apply for a visitor visa before you travel instead of planning to sort it out on arrival.",
      required: true,
    });
  }

  if (context.travellingWithChildren) {
    documents.push({
      id: "childdocs",
      label: "Each child's own passport and arrival card",
      detail: "Registration and admission are per traveller regardless of age.",
      required: true,
    });
  }

  if (context.carryingCash) {
    documents.push({
      id: "cash",
      label: "Customs cash declaration",
      detail: `Above NT$${CURRENCY_DECLARATION_TWD.toLocaleString("en-US")}, or the equivalent of USD ${CURRENCY_DECLARATION_USD.toLocaleString("en-US")} in foreign currency, must be declared.`,
      required: true,
    });
  }

  documents.push({
    id: "meat",
    label: "No meat products in your luggage",
    detail: `Meat from areas affected by African swine fever is prohibited and a first offence carries a fine of up to NT$${MEAT_IMPORT_FINE_TWD.toLocaleString("en-US")}. Detector dogs work the arrivals hall, and an unfinished sandwich counts.`,
    required: false,
  });
  documents.push({
    id: "easycard",
    label: "Transport card and an offline map",
    detail:
      "An EasyCard or iPass covers metro, buses and convenience stores across the island and saves fumbling for change on rural bus routes.",
    required: false,
  });
  documents.push({
    id: "insurance",
    label: "Travel and medical insurance",
    detail:
      "Care is excellent and not free to visitors. Typhoon season between roughly July and October is worth checking your cancellation cover against.",
    required: false,
  });

  return documents;
}

/**
 * Build the Taiwan entry checklist and stay test.
 *
 * @param {object} input
 * @param {string} input.routeId         One of ROUTES ids.
 * @param {string} input.purposeId       One of PURPOSES ids.
 * @param {string} input.arrivalDate     YYYY-MM-DD.
 * @param {string} input.passportExpiry  YYYY-MM-DD.
 * @param {string} [input.tacIssueDate]  YYYY-MM-DD, when the certificate was issued.
 * @param {number} input.stayDays        Days you intend to stay.
 * @param {number} input.travellers      People in the party.
 * @param {number} input.children        How many of them are children.
 * @param {boolean} [input.shortPassportRuleNationality] Only needs validity for the stay.
 * @param {boolean} [input.carryingCash]
 * @returns {object} result, or { error }.
 */
export function buildTaiwanChecklist({
  routeId = "exempt-90",
  purposeId = "tourism",
  arrivalDate = "",
  passportExpiry = "",
  tacIssueDate = "",
  stayDays = 12,
  travellers = 2,
  children = 0,
  shortPassportRuleNationality = false,
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
    return { error: "Enter 365 days or fewer; a longer stay needs a resident visa." };
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

  const tacIssue = tacIssueDate ? parseDate(tacIssueDate) : null;
  if (tacIssueDate && !tacIssue) {
    return { error: "Enter the certificate issue date as a real calendar date, or leave it blank." };
  }

  const wholeDays = Math.round(days);
  const departure = addDays(arrival, wholeDays);

  // Passport validity: six months from entry, unless the traveller's nationality is
  // held only to validity covering the stay.
  const sixMonthRule = !shortPassportRuleNationality;
  const passportMustReach = sixMonthRule
    ? addMonths(arrival, PASSPORT_VALIDITY_MONTHS)
    : departure;
  const passportOk = expiry.getTime() >= passportMustReach.getTime();
  const passportShortfallDays = passportOk ? 0 : daysBetween(expiry, passportMustReach);

  // Stay test. Visa-exempt entry and the certificate are not extendable, so falling
  // outside the limit means changing route, not extending on arrival.
  const stayWithinLimit = wholeDays <= route.maxStayDays;
  const daysOverLimit = stayWithinLimit ? 0 : wholeDays - route.maxStayDays;
  const needsExtensionPath = !stayWithinLimit && !route.extendable;

  // Certificate window: usable for 90 days from issue.
  let tacLastEntryDate = null;
  let tacValidOnArrival = null;
  let tacDaysMargin = null;
  if (route.id === "tac" && tacIssue) {
    const lastEntry = addDays(tacIssue, TAC_VALIDITY_DAYS);
    tacLastEntryDate = toIso(lastEntry);
    tacValidOnArrival =
      arrival.getTime() >= tacIssue.getTime() && arrival.getTime() <= lastEntry.getTime();
    tacDaysMargin = daysBetween(arrival, lastEntry);
  }

  const visaFeeTotalUsd = round2(route.feeUsd * partySize);

  const documents = buildDocuments({
    route,
    purposeId: purpose.id,
    sixMonthRule,
    needsExtensionPath,
    travellingWithChildren: childCount > 0,
    carryingCash: Boolean(carryingCash),
  });
  const requiredDocuments = documents.filter((doc) => doc.required);
  const optionalDocuments = documents.filter((doc) => !doc.required);

  const warnings = [];
  if (!passportOk) {
    warnings.push(
      sixMonthRule
        ? `Your passport expires ${passportShortfallDays} day(s) too early — Taiwan wants it valid to ${toIso(passportMustReach)}, six months past arrival.`
        : `Your passport expires before the end of the trip — it must at least reach your ${toIso(departure)} departure.`,
    );
  }
  if (needsExtensionPath) {
    warnings.push(
      `This route admits you for ${route.maxStayDays} days and is not extendable, so ${wholeDays} days is ${daysOverLimit} day(s) too many. Apply for a visitor visa before you travel rather than planning to extend.`,
    );
  } else if (!stayWithinLimit) {
    warnings.push(
      `Your stay is ${daysOverLimit} day(s) longer than the ${route.maxStayDays}-day admission. Apply to extend inside Taiwan before it expires.`,
    );
  }
  if (tacValidOnArrival === false) {
    warnings.push(
      `A certificate issued on ${toIso(tacIssue)} can only be used up to ${tacLastEntryDate}, so it would not cover your arrival date. Apply closer to the trip.`,
    );
  }
  warnings.push(
    `Do not bring meat products. Taiwan prohibits them from areas affected by African swine fever and fines a first offence up to NT$${MEAT_IMPORT_FINE_TWD.toLocaleString("en-US")}.`,
  );

  const verdict = passportOk
    ? stayWithinLimit
      ? route.feeUsd > 0
        ? `Route works — visa cost USD ${visaFeeTotalUsd.toLocaleString("en-US")} for ${partySize} traveller(s).`
        : `Route works and costs nothing — file the arrival card online before you fly.`
      : "Planned stay is longer than this route allows."
    : "Passport validity fails the rule for your route — renew first.";

  return {
    route,
    purpose,
    arrivalDate: toIso(arrival),
    departureDate: toIso(departure),
    passportExpiry: toIso(expiry),
    passportMustBeValidUntil: toIso(passportMustReach),
    passportRule: sixMonthRule ? `${PASSPORT_VALIDITY_MONTHS} months from arrival` : "Covers the stay",
    passportOk,
    passportShortfallDays,
    stayDays: wholeDays,
    maxStayDays: route.maxStayDays,
    stayWithinLimit,
    daysOverLimit,
    extendable: route.extendable,
    needsExtensionPath,
    travellers: Math.round(partySize),
    children: Math.round(childCount),
    visaFeePerPersonUsd: route.feeUsd,
    visaFeeTotalUsd,
    tacIssueDate: tacIssue ? toIso(tacIssue) : null,
    tacLastEntryDate,
    tacValidOnArrival,
    tacDaysMargin,
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

export default buildTaiwanChecklist;
