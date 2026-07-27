/**
 * Philippines entry requirement checklist, stay test and eTravel window.
 *
 * Two details decide most Philippine arrivals. The first is that the passport rule is
 * measured beyond the period of stay, not beyond arrival — so the longer you plan to
 * stay, the more validity you need. The second is eTravel: a free online registration
 * that must be filed in the 72 hours before arrival, which airlines check at the gate
 * and which people who booked months earlier routinely forget.
 *
 * The rules modelled here:
 *
 *  - Visa waiver. Under Executive Order 408 the Philippines admits nationals of around
 *    a hundred and fifty countries without a visa for 30 days, on condition that the
 *    passport is valid for at least six months beyond the period of stay and that the
 *    traveller holds a confirmed onward or return ticket. Shorter and longer waivers
 *    exist: Brazilian and Israeli nationals are admitted for 59 days, Hong Kong and
 *    Macau SAR passport holders and several other nationalities for 14 days, and some
 *    for 7 days.
 *
 *  - Extension. A visa-waiver stay is extended at a Bureau of Immigration office
 *    inside the country, the first extension normally adding 29 days. Extensions are
 *    applied for before the current stay expires, not afterwards.
 *
 *  - Balikbayan privilege. Former Filipino citizens, and the spouse and children
 *    travelling with a Filipino citizen, can be admitted for up to one year.
 *
 *  - eTravel. Free registration on the official eTravel system, submitted within
 *    72 hours before arrival, and again before departure. It is separate from any visa.
 *
 *  - Health. A yellow fever vaccination certificate is required from travellers
 *    arriving from a country with risk of transmission.
 *
 *  - Travel tax. The Philippine travel tax is collected on departure, but foreign
 *    tourists who have stayed less than a year are exempt from it, so it usually
 *    matters only to citizens and residents.
 *
 * Informational only. Waiver lists, permitted stays and Bureau of Immigration fees
 * change — confirm with the Bureau of Immigration and the Department of Foreign
 * Affairs before travelling.
 */

/** Months of passport validity required beyond the end of the stay. */
export const PASSPORT_VALIDITY_MONTHS_BEYOND_STAY = 6;

/** Hours before arrival within which the eTravel registration must be submitted. */
export const ETRAVEL_WINDOW_HOURS = 72;

/** Days the first Bureau of Immigration extension normally adds. */
export const FIRST_EXTENSION_DAYS = 29;

export const ROUTES = [
  {
    id: "eo408",
    label: "Visa waiver, 30 days (most nationalities)",
    maxStayDays: 30,
    extendable: true,
    note: "Executive Order 408 covers around a hundred and fifty nationalities, conditional on a return ticket and six months of passport validity beyond the stay.",
  },
  {
    id: "waiver-59",
    label: "Visa waiver, 59 days (Brazilian and Israeli nationals)",
    maxStayDays: 59,
    extendable: true,
    note: "A longer waiver applies to a small number of nationalities under bilateral arrangements.",
  },
  {
    id: "waiver-14",
    label: "Visa waiver, 14 days",
    maxStayDays: 14,
    extendable: true,
    note: "Applies to Hong Kong and Macau SAR passport holders and to several nationalities admitted on shorter conditional waivers.",
  },
  {
    id: "waiver-7",
    label: "Visa waiver, 7 days",
    maxStayDays: 7,
    extendable: true,
    note: "The shortest waiver band. Worth checking against your itinerary before booking anything internal.",
  },
  {
    id: "balikbayan",
    label: "Balikbayan privilege, up to one year",
    maxStayDays: 365,
    extendable: false,
    note: "For former Filipino citizens, and for the spouse and children travelling together with a Filipino citizen. Proof of the relationship and of former citizenship is what makes it work at the counter.",
  },
  {
    id: "visa",
    label: "Visa from a Philippine embassy or consulate",
    maxStayDays: 59,
    extendable: true,
    note: "For nationalities outside the waiver, and for purposes the waiver does not cover. Fees and conditions are set by the post.",
  },
];

export const PURPOSES = [
  { id: "tourism", label: "Tourism, island hopping or visiting family" },
  { id: "business", label: "Business meetings or a conference" },
  { id: "diving", label: "Diving trip" },
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

function buildDocuments(context) {
  const documents = [];

  documents.push({
    id: "etravel",
    label: `eTravel registration filed within ${ETRAVEL_WINDOW_HOURS} hours of arrival`,
    detail:
      "Free, online and compulsory for every traveller including children. A second registration is needed before you fly out.",
    required: true,
  });
  documents.push({
    id: "passport",
    label: `Passport valid ${PASSPORT_VALIDITY_MONTHS_BEYOND_STAY} months beyond the end of your stay`,
    detail:
      "Measured from your departure date, not your arrival date, so a longer trip needs more remaining validity.",
    required: true,
  });
  documents.push({
    id: "onward",
    label: "Confirmed onward or return ticket",
    detail:
      "A stated condition of the visa waiver, and the item airlines refuse boarding over. A ticket out to a third country counts.",
    required: true,
  });
  documents.push({
    id: "accommodation",
    label: "Accommodation booking or your host's address",
    detail: "Asked for on eTravel and by immigration on arrival.",
    required: true,
  });

  if (context.route.id === "visa") {
    documents.push({
      id: "visa",
      label: "Visa issued by a Philippine embassy or consulate",
      detail: "Applied for before travel, with the post's own document list and fees.",
      required: true,
    });
  }

  if (context.route.id === "balikbayan") {
    documents.push({
      id: "balikbayan",
      label: "Proof of former Filipino citizenship or of the family relationship",
      detail:
        "An old Philippine passport, a birth or marriage certificate, or the Filipino relative's passport. The privilege depends on travelling together with the Filipino citizen.",
      required: true,
    });
  }

  if (context.needsExtension) {
    documents.push({
      id: "extension",
      label: "Plan to extend at a Bureau of Immigration office",
      detail: `The first extension normally adds ${FIRST_EXTENSION_DAYS} days and must be applied for before the current stay expires. Main offices and larger city sub-offices handle it; small islands do not.`,
      required: true,
    });
  }

  if (context.yellowFeverRisk) {
    documents.push({
      id: "yellowfever",
      label: "Yellow fever vaccination certificate",
      detail: "Required from travellers arriving from a country with risk of transmission.",
      required: true,
    });
  }

  if (context.purposeId === "business") {
    documents.push({
      id: "invitation",
      label: "Invitation from the Philippine host company",
      detail:
        "On letterhead, with dates and purpose. The visa waiver does not permit paid employment, and a Special Work Permit is a separate application.",
      required: true,
    });
  }

  if (context.purposeId === "diving") {
    documents.push({
      id: "divecert",
      label: "Certification card, logbook and dive insurance",
      detail:
        "Operators ask for certification and a recent logged dive. Chambers are concentrated in a few places, so evacuation cover matters.",
      required: false,
    });
  }

  if (context.travellingWithChildren) {
    documents.push({
      id: "childdocs",
      label: "Each child's own passport and eTravel registration",
      detail: "Registration is per traveller regardless of age.",
      required: true,
    });
    documents.push({
      id: "waiver",
      label: "Check the minor travelling arrangements",
      detail:
        "A Filipino minor travelling without a parent needs clearance from the Department of Social Welfare and Development. Foreign minors should carry a birth certificate and a consent letter where a parent is absent.",
      required: false,
    });
  }

  documents.push({
    id: "traveltax",
    label: "Travel tax exemption if anyone asks on departure",
    detail:
      "Foreign tourists who have stayed less than a year are exempt from the Philippine travel tax, which is aimed at citizens and residents.",
    required: false,
  });
  documents.push({
    id: "insurance",
    label: "Travel and medical insurance",
    detail:
      "Island itineraries mean ferries, small aircraft and long transfers to a hospital. Evacuation cover is the part that matters.",
    required: false,
  });

  return documents;
}

/**
 * Build the Philippines entry checklist and stay test.
 *
 * @param {object} input
 * @param {string} input.routeId        One of ROUTES ids.
 * @param {string} input.purposeId      One of PURPOSES ids.
 * @param {string} input.arrivalDate    YYYY-MM-DD.
 * @param {string} input.passportExpiry YYYY-MM-DD.
 * @param {number} input.stayDays       Days you intend to stay.
 * @param {number} input.travellers     People in the party.
 * @param {number} input.children       How many of them are children.
 * @param {boolean} [input.yellowFeverRisk]
 * @returns {object} result, or { error }.
 */
export function buildPhilippinesChecklist({
  routeId = "eo408",
  purposeId = "tourism",
  arrivalDate = "",
  passportExpiry = "",
  stayDays = 21,
  travellers = 2,
  children = 0,
  yellowFeverRisk = false,
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
    return { error: "Enter 365 days or fewer; a longer stay needs a resident or special visa." };
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

  // Departure day, and the passport rule counted six months beyond it.
  const departure = addDays(arrival, wholeDays);
  const passportMustReach = addMonths(departure, PASSPORT_VALIDITY_MONTHS_BEYOND_STAY);
  const passportOk = expiry.getTime() >= passportMustReach.getTime();
  const passportShortfallDays = passportOk ? 0 : daysBetween(expiry, passportMustReach);

  // Stay test: against the waiver, then against the waiver plus a first extension.
  const withExtensionDays = route.extendable
    ? route.maxStayDays + FIRST_EXTENSION_DAYS
    : route.maxStayDays;
  const stayWithinWaiver = wholeDays <= route.maxStayDays;
  const stayWithinExtension = wholeDays <= withExtensionDays;
  const needsExtension = !stayWithinWaiver && stayWithinExtension;
  const daysBeyondExtension = stayWithinExtension ? 0 : wholeDays - withExtensionDays;

  // The date the current admission would run out, which is when to extend by.
  const admissionExpiryDate = addDays(arrival, route.maxStayDays);

  // eTravel opens 72 hours before arrival.
  const etravelOpensDate = addDays(arrival, -Math.ceil(ETRAVEL_WINDOW_HOURS / 24));

  const documents = buildDocuments({
    route,
    purposeId: purpose.id,
    needsExtension,
    yellowFeverRisk: Boolean(yellowFeverRisk),
    travellingWithChildren: childCount > 0,
  });
  const requiredDocuments = documents.filter((doc) => doc.required);
  const optionalDocuments = documents.filter((doc) => !doc.required);

  const warnings = [];
  if (!passportOk) {
    warnings.push(
      `Your passport expires ${passportShortfallDays} day(s) too early — it must stay valid to ${toIso(passportMustReach)}, six months past your ${toIso(departure)} departure.`,
    );
  }
  if (needsExtension) {
    warnings.push(
      `Your ${wholeDays}-day trip is longer than the ${route.maxStayDays}-day admission. Extend at a Bureau of Immigration office before ${toIso(admissionExpiryDate)} — the first extension normally adds ${FIRST_EXTENSION_DAYS} days.`,
    );
  }
  if (!stayWithinExtension) {
    warnings.push(
      `${wholeDays} days is ${daysBeyondExtension} day(s) beyond even the first extension. You will need repeated extensions or a different visa, arranged in advance.`,
    );
  }
  if (!route.extendable && !stayWithinWaiver) {
    warnings.push(
      "This route is not extended in the ordinary way — check the conditions with the Bureau of Immigration before booking.",
    );
  }
  warnings.push(
    `eTravel can only be submitted from ${toIso(etravelOpensDate)}, inside the ${ETRAVEL_WINDOW_HOURS} hours before arrival. Set a reminder — it cannot be done months ahead.`,
  );

  const verdict = passportOk
    ? stayWithinWaiver
      ? `Cleared on paper — ${requiredDocuments.length} required items, no extension needed.`
      : stayWithinExtension
        ? "Works, but you will have to extend inside the Philippines before the first stay expires."
        : "Planned stay is longer than the waiver and a first extension together allow."
    : "Passport validity fails the six-month-beyond-stay rule — renew first.";

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
    maxStayWithExtensionDays: withExtensionDays,
    stayWithinWaiver,
    stayWithinExtension,
    needsExtension,
    daysBeyondExtension,
    admissionExpiryDate: toIso(admissionExpiryDate),
    etravelOpensDate: toIso(etravelOpensDate),
    travellers: Math.round(partySize),
    children: Math.round(childCount),
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

export default buildPhilippinesChecklist;
