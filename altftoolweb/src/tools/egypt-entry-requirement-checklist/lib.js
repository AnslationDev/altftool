/**
 * Egypt entry requirement checklist, visa cost comparison and stay test.
 *
 * Egypt runs several parallel entry routes and they are not interchangeable. The one
 * that catches people is the free Sinai permit: it is genuinely free and genuinely
 * enough for a Red Sea holiday, but it does not let you leave the South Sinai resort
 * strip, so a day trip to Cairo or Luxor on that stamp is not permitted.
 *
 * The rules modelled here:
 *
 *  - Visa on arrival. Sold as a sticker at bank kiosks before immigration at the main
 *    airports to nationals of a long list of countries. The published price of the
 *    single-entry tourist visa has been USD 25 and it permits a stay of up to 30 days.
 *
 *  - e-Visa. Applied for on the official Egyptian e-visa portal before travel, at
 *    USD 25 for single entry and USD 60 for multiple entry valid six months with up to
 *    30 days per visit. Egypt advises applying at least seven days before departure.
 *
 *  - Sinai permit. Visitors arriving at Sharm El Sheikh, Taba or St Catherine and
 *    staying inside the South Sinai resort area — Sharm El Sheikh, Dahab, Nuweiba,
 *    Taba and St Catherine — can be given a free entry permission for up to 15 days.
 *    It does not cover the rest of Egypt, and diving trips or excursions that leave
 *    the area need a full visa instead.
 *
 *  - Passport validity. Six months from the date of entry.
 *
 *  - Health. A yellow fever vaccination certificate is required from travellers
 *    arriving from a country with risk of transmission, and Egypt has required proof
 *    of polio vaccination from travellers arriving from countries affected by polio.
 *
 *  - Currency. Egyptian pounds may not be taken in or out above EGP 5,000, and foreign
 *    currency above the equivalent of USD 10,000 must be declared on arrival.
 *
 * Informational only. Fees, eligible nationalities and the Sinai arrangement are set by
 * Egyptian authorities and change — confirm on the official e-visa portal or with an
 * Egyptian consulate before travelling.
 */

/** Months of passport validity required, counted from entry. */
export const PASSPORT_VALIDITY_MONTHS = 6;

/** Days Egypt advises allowing for an e-visa application before departure. */
export const EVISA_LEAD_DAYS = 7;

/** Egyptian pound notes may not be carried across the border above this amount. */
export const EGP_EXPORT_LIMIT = 5000;

/** Foreign currency above this equivalent must be declared, in US dollars. */
export const CURRENCY_DECLARATION_USD = 10000;

/** Places the free Sinai permission covers. */
export const SINAI_PERMIT_AREA = [
  "Sharm El Sheikh",
  "Dahab",
  "Nuweiba",
  "Taba",
  "St Catherine",
];

export const ROUTES = [
  {
    id: "voa",
    label: "Visa on arrival (USD 25, 30 days)",
    maxStayDays: 30,
    feeUsd: 25,
    appliedInAdvance: false,
    sinaiOnly: false,
    multipleEntry: false,
    note: "Bought as a sticker at the bank kiosk before immigration at the main airports. Carry the fee in cash dollars, euros or sterling — card terminals are not something to count on.",
  },
  {
    id: "evisa-single",
    label: "e-Visa, single entry (USD 25, 30 days)",
    maxStayDays: 30,
    feeUsd: 25,
    appliedInAdvance: true,
    sinaiOnly: false,
    multipleEntry: false,
    note: `Applied for on the official portal. Egypt advises allowing at least ${EVISA_LEAD_DAYS} days, and only the government site should be used.`,
  },
  {
    id: "evisa-multi",
    label: "e-Visa, multiple entry (USD 60, six months)",
    maxStayDays: 30,
    feeUsd: 60,
    appliedInAdvance: true,
    sinaiOnly: false,
    multipleEntry: true,
    note: "Valid six months with a maximum of 30 days per visit — for repeat trips, not for one long stay.",
  },
  {
    id: "sinai-permit",
    label: "Free Sinai permission (15 days, South Sinai only)",
    maxStayDays: 15,
    feeUsd: 0,
    appliedInAdvance: false,
    sinaiOnly: true,
    multipleEntry: false,
    note: "Given on arrival at Sharm El Sheikh, Taba or St Catherine to visitors staying inside the resort area. It does not cover Cairo, Luxor or anywhere else in Egypt.",
  },
  {
    id: "visa-free",
    label: "Visa-free nationality",
    maxStayDays: 90,
    feeUsd: 0,
    appliedInAdvance: false,
    sinaiOnly: false,
    multipleEntry: true,
    note: "A short list of nationalities, including Gulf Cooperation Council citizens, enters without a visa. The period granted is decided on arrival.",
  },
  {
    id: "consulate",
    label: "Visa from an Egyptian consulate",
    maxStayDays: 30,
    feeUsd: 0,
    appliedInAdvance: true,
    sinaiOnly: false,
    multipleEntry: false,
    note: "Required for nationalities outside the visa-on-arrival and e-visa systems, and for categories those routes do not cover. Fees are set by the mission.",
  },
];

export const PURPOSES = [
  { id: "tourism", label: "Sightseeing, Nile cruise or Red Sea holiday" },
  { id: "diving", label: "Diving trip based in South Sinai" },
  { id: "business", label: "Business meetings or a conference" },
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
        context.route.id === "consulate"
          ? "Visa issued by an Egyptian consulate"
          : "Approved e-visa, printed and saved offline",
      detail:
        context.route.id === "consulate"
          ? "Allow weeks and follow the mission's own document list."
          : `Apply on the official government portal at least ${EVISA_LEAD_DAYS} days ahead. Lookalike sites charge several times the real fee.`,
      required: true,
    });
  } else if (context.route.id === "voa") {
    documents.push({
      id: "cashfee",
      label: "USD 25 in cash for the visa sticker",
      detail:
        "Bought at the bank kiosk in the arrivals hall before you reach immigration. Clean notes in dollars, euros or sterling are what the kiosks want.",
      required: true,
    });
  }

  documents.push({
    id: "passport",
    label: `Passport valid at least ${PASSPORT_VALIDITY_MONTHS} months beyond entry`,
    detail: "Counted from the day you arrive, with a blank page for the visa sticker.",
    required: true,
  });
  documents.push({
    id: "onward",
    label: "Confirmed return or onward ticket",
    detail: "Checked by the airline and on arrival.",
    required: true,
  });
  documents.push({
    id: "accommodation",
    label: "Hotel or cruise booking with the address",
    detail:
      "Asked for on the arrival card and by immigration, and required for the e-visa application.",
    required: true,
  });

  if (context.route.sinaiOnly) {
    documents.push({
      id: "sinai",
      label: "Itinerary that stays inside the South Sinai permitted area",
      detail: `The free permission covers ${SINAI_PERMIT_AREA.join(", ")}. A trip to Cairo, Luxor or the mainland Red Sea coast is not covered by it.`,
      required: true,
    });
  }

  if (context.yellowFeverRisk) {
    documents.push({
      id: "yellowfever",
      label: "Yellow fever vaccination certificate",
      detail:
        "Required from travellers arriving from a country with risk of yellow fever transmission.",
      required: true,
    });
  }

  if (context.polioCountry) {
    documents.push({
      id: "polio",
      label: "Polio vaccination certificate",
      detail:
        "Egypt has required proof of polio vaccination from travellers arriving from affected countries. Check the current list with a travel clinic.",
      required: true,
    });
  }

  if (context.purposeId === "diving") {
    documents.push({
      id: "divecert",
      label: "Certification card, logbook and dive insurance",
      detail:
        "Centres ask for certification and a recent logged dive, and a chamber-covering policy is worth having in the Red Sea.",
      required: true,
    });
  }

  if (context.purposeId === "business") {
    documents.push({
      id: "invitation",
      label: "Invitation from the Egyptian host company",
      detail: "On letterhead with the dates. A tourist visa does not permit paid work.",
      required: true,
    });
  }

  if (context.travellingWithChildren) {
    documents.push({
      id: "childdocs",
      label: "Each child's own passport and visa",
      detail: "Children are charged the same visa fee as adults on the paid routes.",
      required: true,
    });
  }

  if (context.carryingCash) {
    documents.push({
      id: "cash",
      label: "Customs currency declaration",
      detail: `Foreign currency above the equivalent of USD ${CURRENCY_DECLARATION_USD.toLocaleString("en-US")} must be declared, and Egyptian pounds above EGP ${EGP_EXPORT_LIMIT.toLocaleString("en-US")} may not be carried across the border at all.`,
      required: true,
    });
  }

  documents.push({
    id: "insurance",
    label: "Travel and medical insurance",
    detail:
      "Private clinics expect payment up front, and a diving or desert itinerary is exactly the kind of thing basic policies exclude.",
    required: false,
  });
  documents.push({
    id: "drone",
    label: "Leave drones at home",
    detail:
      "Drones may not be brought into Egypt without prior permission and are seized at customs. Photography near military and government sites is also restricted.",
    required: false,
  });

  return documents;
}

/**
 * Build the Egypt entry checklist and visa cost.
 *
 * @param {object} input
 * @param {string} input.routeId          One of ROUTES ids.
 * @param {string} input.purposeId        One of PURPOSES ids.
 * @param {string} input.arrivalDate      YYYY-MM-DD.
 * @param {string} input.passportExpiry   YYYY-MM-DD.
 * @param {number} input.stayDays         Days you intend to stay.
 * @param {number} input.travellers       People in the party.
 * @param {number} input.children         How many of them are children.
 * @param {boolean} [input.leavingSinaiArea] Travelling beyond South Sinai.
 * @param {boolean} [input.yellowFeverRisk]
 * @param {boolean} [input.polioCountry]
 * @param {boolean} [input.carryingCash]
 * @returns {object} result, or { error }.
 */
export function buildEgyptChecklist({
  routeId = "voa",
  purposeId = "tourism",
  arrivalDate = "",
  passportExpiry = "",
  stayDays = 10,
  travellers = 2,
  children = 0,
  leavingSinaiArea = false,
  yellowFeverRisk = false,
  polioCountry = false,
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
    return { error: "Enter 365 days or fewer; a longer stay needs a residence permission." };
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

  // Passport validity: six months from the date of entry.
  const passportMustReach = addMonths(arrival, PASSPORT_VALIDITY_MONTHS);
  const passportOk = expiry.getTime() >= passportMustReach.getTime();
  const passportShortfallDays = passportOk ? 0 : daysBetween(expiry, passportMustReach);

  // Stay test against the admission this route grants.
  const stayWithinLimit = wholeDays <= route.maxStayDays;
  const daysOverLimit = stayWithinLimit ? 0 : wholeDays - route.maxStayDays;

  // The Sinai permission is geographic as well as temporal.
  const sinaiConflict = route.sinaiOnly && Boolean(leavingSinaiArea);

  // Visa cost, charged per traveller including children on the paid routes.
  const visaFeeTotalUsd = round2(route.feeUsd * partySize);

  // When an application has to be started for the routes applied for in advance.
  const applyByDate = route.appliedInAdvance ? addDays(arrival, -EVISA_LEAD_DAYS) : null;

  const documents = buildDocuments({
    route,
    purposeId: purpose.id,
    yellowFeverRisk: Boolean(yellowFeverRisk),
    polioCountry: Boolean(polioCountry),
    travellingWithChildren: childCount > 0,
    carryingCash: Boolean(carryingCash),
  });
  const requiredDocuments = documents.filter((doc) => doc.required);
  const optionalDocuments = documents.filter((doc) => !doc.required);

  const warnings = [];
  if (!passportOk) {
    warnings.push(
      `Your passport expires ${passportShortfallDays} day(s) too early — Egypt wants it valid to ${toIso(passportMustReach)}.`,
    );
  }
  if (!stayWithinLimit) {
    warnings.push(
      `This route admits you for ${route.maxStayDays} days and you plan ${wholeDays} — ${daysOverLimit} day(s) too many. Extensions are applied for at a passport office inside Egypt, before the stamp expires.`,
    );
  }
  if (sinaiConflict) {
    warnings.push(
      `The free Sinai permission only covers ${SINAI_PERMIT_AREA.join(", ")}. Since you are leaving that area, buy the full visa instead — this is the mistake that strands people at a checkpoint on the way to Cairo.`,
    );
  }
  if (route.multipleEntry && wholeDays > route.maxStayDays) {
    warnings.push(
      "The multiple-entry visa allows repeated visits but no more than 30 days at a time; it does not buy one long stay.",
    );
  }
  if (applyByDate) {
    warnings.push(
      `Start the application by ${toIso(applyByDate)} to keep Egypt's ${EVISA_LEAD_DAYS}-day guidance, and use only the official government portal.`,
    );
  }
  if (route.id === "voa") {
    warnings.push(
      "The visa on arrival is paid in cash at the bank kiosk before immigration. Join that queue first, not the passport queue.",
    );
  }

  const verdict = passportOk
    ? stayWithinLimit && !sinaiConflict
      ? `Route works — visa cost USD ${visaFeeTotalUsd.toLocaleString("en-US")} for ${partySize} traveller(s).`
      : sinaiConflict
        ? "The Sinai permission does not cover your itinerary — you need a full visa."
        : "Planned stay is longer than this route allows."
    : "Passport validity fails the six-month rule — renew first.";

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
    stayWithinLimit,
    daysOverLimit,
    sinaiConflict,
    sinaiArea: SINAI_PERMIT_AREA,
    travellers: Math.round(partySize),
    children: Math.round(childCount),
    visaFeePerPersonUsd: route.feeUsd,
    visaFeeTotalUsd,
    applyByDate: applyByDate ? toIso(applyByDate) : null,
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

export default buildEgyptChecklist;
