/**
 * Kenya entry requirement checklist, eTA cost and pre-arrival deadlines.
 *
 * Kenya abolished visas on 1 January 2024 and replaced them with an Electronic Travel
 * Authorisation. The change is often misread as "Kenya is visa free" — it is not. Most
 * visitors still need an approved authorisation before boarding, and they still need
 * to file a passenger declaration with the Kenya Revenue Authority before arrival.
 *
 * The rules modelled here:
 *
 *  - Electronic Travel Authorisation. Required from almost every visitor, applied for
 *    online before travel. It is single entry, permits a stay of up to 90 days, and
 *    the approval itself is valid for 90 days from issue — so applying too early is as
 *    much of a problem as applying too late. The published fee has been USD 30 plus a
 *    small processing charge.
 *
 *  - Exemptions. Citizens of East African Community partner states enter under the EAC
 *    Common Market Protocol rather than the eTA and are admitted for up to six months.
 *    Kenya has also exempted nationals of most African Union member states from the
 *    eTA, and has announced that the authorisation is issued free of charge to
 *    children under 16. Passengers transiting without passing through immigration do
 *    not need one.
 *
 *  - Passport validity. Six months from the date of arrival, with blank pages for
 *    stamps.
 *
 *  - Yellow fever. Kenya is a country with risk of yellow fever transmission. A
 *    vaccination certificate is required from travellers aged one year and over
 *    arriving from a country with risk of transmission, and many countries will ask
 *    for proof after a visit to Kenya, so the certificate matters on the way out too.
 *
 *  - Passenger declaration. Travellers are required to complete the Kenya Revenue
 *    Authority passenger declaration online before arrival.
 *
 *  - Plastic bags. Kenya bans single-use plastic carrier bags, and the ban is enforced
 *    at the airport. Bags are taken off arriving passengers, and the penalties in law
 *    are severe.
 *
 * Informational only. eTA fees, exemption lists and permitted stays are set by Kenyan
 * authorities and change — apply on the official eTA site and confirm the current
 * position there rather than through a reseller.
 */

/** Months of passport validity required, counted from arrival. */
export const PASSPORT_VALIDITY_MONTHS = 6;

/** Published eTA fee per applicant, in US dollars, before the processing charge. */
export const ETA_FEE_USD = 30;

/** Typical online processing charge added at checkout, in US dollars. */
export const ETA_PROCESSING_USD = 1.5;

/** Age below which Kenya has announced the eTA is issued free of charge. */
export const ETA_FREE_UNDER_AGE = 16;

/** Days the approved eTA remains usable for entry. */
export const ETA_VALIDITY_DAYS = 90;

/** Working days it is sensible to allow before travel. */
export const ETA_RECOMMENDED_LEAD_DAYS = 3;

/** Minimum age at which a yellow fever certificate can be required. */
export const YELLOW_FEVER_MIN_AGE_YEARS = 1;

/** Cash declaration threshold on arrival, in US dollars or the equivalent. */
export const CURRENCY_DECLARATION_USD = 10000;

export const ROUTES = [
  {
    id: "eta",
    label: "Electronic Travel Authorisation (most visitors)",
    maxStayDays: 90,
    needsEta: true,
    feeUsd: ETA_FEE_USD,
    note: "Single entry, up to 90 days of stay, and the approval must be used within 90 days of issue.",
  },
  {
    id: "africa-exempt",
    label: "Exempt African Union nationality (no eTA)",
    maxStayDays: 60,
    needsEta: false,
    feeUsd: 0,
    note: "Kenya has exempted nationals of most African Union member states from the eTA, with the stay decided on arrival — commonly up to 60 days. Check whether your nationality is on the current exemption list.",
  },
  {
    id: "eac",
    label: "East African Community citizen",
    maxStayDays: 180,
    needsEta: false,
    feeUsd: 0,
    note: "Citizens of EAC partner states enter under the Common Market Protocol, normally for up to six months, on a passport or an approved national identity document.",
  },
  {
    id: "transit-airside",
    label: "Transit without passing immigration",
    maxStayDays: 1,
    needsEta: false,
    feeUsd: 0,
    note: "No authorisation is needed if you stay inside the international transit area. Leaving it, even briefly, changes the answer.",
  },
];

export const PURPOSES = [
  { id: "tourism", label: "Safari, beach or visiting family" },
  { id: "business", label: "Business meetings or a conference" },
  { id: "volunteer", label: "Volunteering, research or study" },
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

  if (context.route.needsEta) {
    documents.push({
      id: "eta",
      label: "Approved eTA, printed or saved offline",
      detail: `Apply on the official Kenyan eTA site at least ${ETA_RECOMMENDED_LEAD_DAYS} days ahead. It is single entry, so a side trip to Tanzania and back needs a second one.`,
      required: true,
    });
  }

  if (context.route.id === "eac") {
    documents.push({
      id: "eacid",
      label: "Passport or approved EAC national identity document",
      detail:
        "The Common Market Protocol lets citizens of partner states travel on an approved identity document as well as a passport.",
      required: true,
    });
  } else {
    documents.push({
      id: "passport",
      label: `Passport valid at least ${PASSPORT_VALIDITY_MONTHS} months beyond arrival`,
      detail: "Counted from the day you land, with blank pages for entry and exit stamps.",
      required: true,
    });
  }

  documents.push({
    id: "declaration",
    label: "Kenya Revenue Authority passenger declaration filed online",
    detail:
      "Completed before arrival. It is separate from the eTA and catches people who assume the authorisation covers everything.",
    required: true,
  });
  documents.push({
    id: "onward",
    label: "Confirmed return or onward ticket",
    detail: "Asked for by the airline and on arrival, and part of the eTA application.",
    required: true,
  });
  documents.push({
    id: "accommodation",
    label: "Accommodation booking or your host's address",
    detail:
      "The eTA application asks for it and immigration can too. Safari itineraries usually cover this in one document.",
    required: true,
  });

  if (context.yellowFeverRisk) {
    documents.push({
      id: "yellowfever",
      label: "Yellow fever vaccination certificate",
      detail: `Required from travellers aged ${YELLOW_FEVER_MIN_AGE_YEARS} year and over arriving from a country with risk of transmission. Keep it after the trip — countries you travel to next may ask because you have been in Kenya.`,
      required: true,
    });
  } else {
    documents.push({
      id: "yellowfever-onward",
      label: "Yellow fever certificate for onward travel",
      detail:
        "Kenya is a risk country, so the country you fly to afterwards may require proof of vaccination even though Kenya did not ask on the way in.",
      required: false,
    });
  }

  if (context.travellingWithChildren) {
    documents.push({
      id: "childdocs",
      label: "Each child's own passport and eTA",
      detail: `Children need their own authorisation. Kenya has announced that it is issued free of charge under ${ETA_FREE_UNDER_AGE} years of age.`,
      required: true,
    });
    documents.push({
      id: "consent",
      label: "Birth certificate, and a consent letter if a parent is absent",
      detail: "Carried to show the relationship where surnames differ or one parent is not travelling.",
      required: false,
    });
  }

  if (context.purposeId === "business") {
    documents.push({
      id: "invitation",
      label: "Invitation from the Kenyan host organisation",
      detail: "On letterhead, with dates and purpose. The eTA does not permit paid employment.",
      required: true,
    });
  }

  if (context.purposeId === "volunteer") {
    documents.push({
      id: "permit",
      label: "Check whether a permit or pass is needed rather than an eTA",
      detail:
        "Volunteering, research and study can require a special pass or permit from the Directorate of Immigration Services. Arriving on a visitor authorisation and sorting it out later rarely works.",
      required: true,
    });
  }

  if (context.carryingCash) {
    documents.push({
      id: "cash",
      label: "Customs cash declaration",
      detail: `Amounts above the equivalent of USD ${CURRENCY_DECLARATION_USD.toLocaleString("en-US")} must be declared on arrival.`,
      required: true,
    });
  }

  documents.push({
    id: "plastic",
    label: "No single-use plastic carrier bags",
    detail:
      "Kenya's ban is enforced at the airport and bags are confiscated on arrival. Repack duty free into paper or fabric before you fly.",
    required: false,
  });
  documents.push({
    id: "insurance",
    label: "Travel insurance with medical evacuation cover",
    detail:
      "Worth having for safari areas, where the nearest hospital can be an air ambulance away rather than a drive.",
    required: false,
  });
  documents.push({
    id: "malaria",
    label: "Malaria prophylaxis discussed with a travel clinic",
    detail:
      "Risk varies sharply by region and season — coastal and lakeside areas differ from Nairobi and the highlands. Ask a clinician, not a forum.",
    required: false,
  });

  return documents;
}

/**
 * Build the Kenya entry checklist and eTA cost.
 *
 * @param {object} input
 * @param {string} input.routeId          One of ROUTES ids.
 * @param {string} input.purposeId        One of PURPOSES ids.
 * @param {string} input.arrivalDate      YYYY-MM-DD.
 * @param {string} input.passportExpiry   YYYY-MM-DD.
 * @param {string} [input.etaApprovalDate] YYYY-MM-DD, when the eTA was or will be approved.
 * @param {number} input.stayDays         Days you intend to stay.
 * @param {number} input.adults           Applicants aged 16 and over.
 * @param {number} input.childrenUnder16  Applicants under 16.
 * @param {number} [input.childFeeUsd]    Fee charged per child, if any.
 * @param {boolean} [input.yellowFeverRisk] Arriving from a yellow fever risk country.
 * @param {boolean} [input.carryingCash]
 * @returns {object} result, or { error }.
 */
export function buildKenyaChecklist({
  routeId = "eta",
  purposeId = "tourism",
  arrivalDate = "",
  passportExpiry = "",
  etaApprovalDate = "",
  stayDays = 12,
  adults = 2,
  childrenUnder16 = 0,
  childFeeUsd = 0,
  yellowFeverRisk = false,
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
    return { error: "Enter 365 days or fewer; a longer stay needs a permit or pass, not an eTA." };
  }

  const adultCount = Number(adults);
  const childCount = Number(childrenUnder16);
  if (!Number.isFinite(adultCount) || !Number.isFinite(childCount)) {
    return { error: "Enter the number of travellers as whole numbers." };
  }
  if (adultCount < 0 || childCount < 0) {
    return { error: "The number of travellers cannot be negative." };
  }
  const partySize = adultCount + childCount;
  if (partySize < 1) return { error: "Add at least one traveller." };
  if (partySize > 60) return { error: "This checklist covers a single party of up to 60 people." };

  const childFee = Number(childFeeUsd);
  if (!Number.isFinite(childFee) || childFee < 0) {
    return { error: "The child fee must be zero or a positive amount." };
  }

  const approval = etaApprovalDate ? parseDate(etaApprovalDate) : null;
  if (etaApprovalDate && !approval) {
    return { error: "Enter the eTA approval date as a real calendar date, or leave it blank." };
  }

  const wholeDays = Math.round(days);

  // Passport validity: six months from the date of arrival.
  const passportMustReach = addMonths(arrival, PASSPORT_VALIDITY_MONTHS);
  const passportOk = expiry.getTime() >= passportMustReach.getTime();
  const passportShortfallDays = passportOk ? 0 : daysBetween(expiry, passportMustReach);

  // Stay test against the admission this route grants.
  const stayWithinLimit = wholeDays <= route.maxStayDays;
  const daysOverLimit = stayWithinLimit ? 0 : wholeDays - route.maxStayDays;

  // eTA cost: the fee plus the processing charge for each adult applicant, and the
  // child fee, which Kenya has announced as nil under 16.
  const perAdultUsd = route.needsEta ? round2(route.feeUsd + ETA_PROCESSING_USD) : 0;
  const perChildUsd = route.needsEta ? round2(childFee) : 0;
  const etaTotalUsd = round2(perAdultUsd * adultCount + perChildUsd * childCount);

  // eTA approval window: the authorisation must be used within 90 days of issue.
  let etaLastEntryDate = null;
  let etaStillValidOnArrival = null;
  let etaDaysMargin = null;
  if (route.needsEta && approval) {
    const lastEntry = addDays(approval, ETA_VALIDITY_DAYS);
    etaLastEntryDate = toIso(lastEntry);
    etaStillValidOnArrival =
      arrival.getTime() >= approval.getTime() && arrival.getTime() <= lastEntry.getTime();
    etaDaysMargin = daysBetween(arrival, lastEntry);
  }

  const documents = buildDocuments({
    route,
    purposeId: purpose.id,
    yellowFeverRisk: Boolean(yellowFeverRisk),
    travellingWithChildren: childCount > 0 && route.needsEta,
    carryingCash: Boolean(carryingCash),
  });
  const requiredDocuments = documents.filter((doc) => doc.required);
  const optionalDocuments = documents.filter((doc) => !doc.required);

  const warnings = [];
  if (!passportOk) {
    warnings.push(
      `Your passport expires ${passportShortfallDays} day(s) too early — Kenya wants it valid to ${toIso(passportMustReach)}.`,
    );
  }
  if (!stayWithinLimit) {
    warnings.push(
      `This route admits you for ${route.maxStayDays} days and you plan ${wholeDays} — ${daysOverLimit} day(s) too many. Apply to extend inside Kenya rather than overstaying.`,
    );
  }
  if (etaStillValidOnArrival === false) {
    warnings.push(
      `An eTA approved on ${toIso(approval)} can only be used up to ${etaLastEntryDate}. On your arrival date it would not be usable, so time the application rather than applying as early as possible.`,
    );
  }
  if (route.needsEta) {
    warnings.push(
      "The eTA is single entry. A short hop to Tanzania or Uganda and back means a second authorisation, unless you use the East Africa Tourist Visa arrangement instead.",
    );
  }
  if (!yellowFeverRisk) {
    warnings.push(
      "Kenya is a yellow fever risk country. Even if nobody asks on arrival, the next country you fly to may want the certificate because you have been here.",
    );
  }
  if (purpose.id === "volunteer") {
    warnings.push(
      "Volunteering, research and study can need a special pass rather than a visitor authorisation. Check with the Directorate of Immigration Services before you fly.",
    );
  }

  const verdict = passportOk
    ? stayWithinLimit
      ? route.needsEta
        ? `eTA cost USD ${etaTotalUsd.toLocaleString("en-US")} for ${partySize} traveller(s) — apply at least ${ETA_RECOMMENDED_LEAD_DAYS} days out.`
        : "No authorisation needed on this route — the rest of the checklist still applies."
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
    adults: Math.round(adultCount),
    childrenUnder16: Math.round(childCount),
    partySize: Math.round(partySize),
    needsEta: route.needsEta,
    etaPerAdultUsd: perAdultUsd,
    etaPerChildUsd: perChildUsd,
    etaTotalUsd,
    etaApprovalDate: approval ? toIso(approval) : null,
    etaLastEntryDate,
    etaStillValidOnArrival,
    etaDaysMargin,
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

export default buildKenyaChecklist;
