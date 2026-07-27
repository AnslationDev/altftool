/**
 * Qatar entry requirement checklist, stay test and visitor health insurance cost.
 *
 * Qatar's entry rules are generous but conditional. Most visitors need no visa at all,
 * yet everyone needs health insurance bought from a Qatar-registered company, and the
 * permitted stay differs sharply between the two bands of the visa-waiver scheme.
 *
 * The rules modelled here:
 *
 *  - Visa waiver. Qatar operates a visa-waiver scheme covering roughly a hundred
 *    nationalities in two bands. The wider band, which includes most European
 *    countries, is admitted for up to 90 days within any 180-day period, with multiple
 *    entries. The second band is admitted for 30 days, extendable once for a further
 *    30 days. The waiver is granted at the counter, not applied for in advance.
 *
 *  - Health insurance. Since 1 February 2023, under the Health Services Law, every
 *    visitor to Qatar must hold a health insurance policy covering emergency and basic
 *    healthcare for the whole period of stay, bought from an insurance company
 *    registered with the Ministry of Public Health. The standard visitor policy has
 *    been sold at around QAR 50 for a 30-day period, so a longer stay needs
 *    proportionally more cover. The policy number is checked against the entry record.
 *
 *  - Transit. Passengers transiting Doha with a layover between 5 and 96 hours can
 *    apply for a free transit visa valid for up to 96 hours, which is what makes a
 *    Doha stopover possible on one ticket.
 *
 *  - GCC residents. Residents of Gulf Cooperation Council states in eligible
 *    professions can obtain a visa on arrival, normally valid 30 days and extendable
 *    once for a further 30, against a fee.
 *
 *  - Passport validity. Six months from the date of entry, with blank pages for
 *    stamps.
 *
 *  - Customs. Cash and negotiable instruments above QAR 50,000 must be declared on
 *    arrival. Alcohol may not be imported by visitors, and is served only in licensed
 *    hotel venues; electronic cigarettes and vaping devices are prohibited imports.
 *
 * Informational only. Waiver lists, insurance pricing and permitted stays are set by
 * the Ministry of Interior and the Ministry of Public Health and change — confirm on
 * the official Qatari portals before you travel.
 */

/** Months of passport validity expected on entry. */
export const PASSPORT_VALIDITY_MONTHS = 6;

/** Days of cover a single standard visitor health insurance policy runs for. */
export const INSURANCE_POLICY_DAYS = 30;

/** Typical price of one 30-day visitor health insurance policy, in Qatari riyals. */
export const INSURANCE_POLICY_QAR = 50;

/** Cash declaration threshold on arrival, in Qatari riyals. */
export const CURRENCY_DECLARATION_QAR = 50000;

/** Transit visa window: a layover must be at least this long to qualify. */
export const TRANSIT_MIN_LAYOVER_HOURS = 5;

/** And no longer than this, which is also the stay it grants. */
export const TRANSIT_MAX_HOURS = 96;

export const ROUTES = [
  {
    id: "waiver-90",
    label: "Visa waiver, wider band (90 days in any 180)",
    maxStayDays: 90,
    windowDays: 180,
    extensionDays: 0,
    visaFeeQar: 0,
    appliedInAdvance: false,
    note: "Granted at the counter for the band of nationalities admitted for up to 90 days in a rolling 180-day window, with multiple entries.",
  },
  {
    id: "waiver-30",
    label: "Visa waiver, 30 days extendable by 30",
    maxStayDays: 30,
    windowDays: 180,
    extensionDays: 30,
    visaFeeQar: 0,
    appliedInAdvance: false,
    note: "Granted at the counter, with one extension of a further 30 days applied for inside Qatar through the Ministry of Interior.",
  },
  {
    id: "gcc-resident",
    label: "GCC resident visa on arrival",
    maxStayDays: 30,
    windowDays: 180,
    extensionDays: 30,
    visaFeeQar: 100,
    appliedInAdvance: false,
    note: "For residents of Gulf Cooperation Council states in eligible professions. The residence permit must be valid well beyond the visit.",
  },
  {
    id: "evisa",
    label: "Visa applied for online before travel",
    maxStayDays: 30,
    windowDays: 180,
    extensionDays: 30,
    visaFeeQar: 100,
    appliedInAdvance: true,
    note: "For nationalities outside the waiver scheme, applied through the Ministry of Interior portal or the Hayya platform, usually with a hotel booking or a Qatari host.",
  },
  {
    id: "transit",
    label: "Free transit visa for a Doha stopover",
    maxStayDays: 4,
    windowDays: 0,
    extensionDays: 0,
    visaFeeQar: 0,
    appliedInAdvance: true,
    note: `Free, for layovers between ${TRANSIT_MIN_LAYOVER_HOURS} and ${TRANSIT_MAX_HOURS} hours. Applied for through the airline or the Hayya platform before travel.`,
  },
];

export const PURPOSES = [
  { id: "tourism", label: "Tourism or visiting family" },
  { id: "business", label: "Business meetings or a conference" },
  { id: "event", label: "A sporting or cultural event" },
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
      id: "visa",
      label:
        context.route.id === "transit"
          ? "Approved transit visa from the airline or the Hayya platform"
          : "Approved visa from the Ministry of Interior portal or Hayya",
      detail:
        context.route.id === "transit"
          ? `Free, and only for layovers between ${TRANSIT_MIN_LAYOVER_HOURS} and ${TRANSIT_MAX_HOURS} hours. Apply before you fly, not on the day.`
          : "Apply well before departure and carry the approval; airlines check it at the gate.",
      required: true,
    });
  }

  documents.push({
    id: "passport",
    label: `Passport valid at least ${PASSPORT_VALIDITY_MONTHS} months beyond entry`,
    detail: "Counted from the day you arrive, with blank pages for stamps.",
    required: true,
  });
  documents.push({
    id: "insurance",
    label: "Health insurance policy from a Qatar-registered company",
    detail:
      "Compulsory for every visitor since 1 February 2023 and checked against the entry record. Cover from your home insurer does not satisfy it unless the company is registered in Qatar.",
    required: true,
  });
  documents.push({
    id: "onward",
    label: "Confirmed return or onward ticket",
    detail: "Asked for at check-in and on arrival, and required for the transit visa route.",
    required: true,
  });
  documents.push({
    id: "accommodation",
    label: "Hotel booking or the address of your host in Qatar",
    detail:
      "Immigration asks where you are staying. A visa applied for in advance normally needs the booking attached to the application.",
    required: true,
  });

  if (context.route.id === "gcc-resident") {
    documents.push({
      id: "residence",
      label: "GCC residence permit valid well beyond the visit",
      detail:
        "The visa on arrival depends on the residence permit and, for some routes, on the profession recorded on it.",
      required: true,
    });
  }

  if (context.purposeId === "business") {
    documents.push({
      id: "invitation",
      label: "Invitation letter from the Qatari company",
      detail: "On letterhead, naming the dates and the purpose of the visit.",
      required: true,
    });
  }

  if (context.purposeId === "event") {
    documents.push({
      id: "ticket",
      label: "Event ticket and any Hayya entry permit tied to it",
      detail:
        "Qatar has run event-linked entry permits through the Hayya platform, which can carry their own entry and stay conditions.",
      required: true,
    });
  }

  if (context.travellingWithChildren) {
    documents.push({
      id: "childdocs",
      label: "Each child's passport and their own insurance policy",
      detail:
        "The insurance requirement applies to visitors of any age, so children need cover of their own.",
      required: true,
    });
  }

  if (context.carryingCash) {
    documents.push({
      id: "cash",
      label: "Customs cash declaration",
      detail: `Cash and negotiable instruments above QAR ${CURRENCY_DECLARATION_QAR.toLocaleString("en-US")} must be declared on arrival.`,
      required: true,
    });
  }

  if (context.carryingMedication) {
    documents.push({
      id: "medication",
      label: "Prescription and a doctor's letter for the medicines you carry",
      detail:
        "Qatar controls a wide list of medicines, including some sold over the counter elsewhere. Carry them in labelled packaging with the prescription.",
      required: true,
    });
  }

  documents.push({
    id: "driving",
    label: "International driving permit if you plan to drive",
    detail: "Rental firms want it alongside your home licence, and the traffic penalties are steep.",
    required: false,
  });
  documents.push({
    id: "prohibited",
    label: "Check what you are packing",
    detail:
      "Visitors may not import alcohol; it is served only in licensed hotel venues. Electronic cigarettes and vaping devices are prohibited, along with pork products and narcotics.",
    required: false,
  });

  return documents;
}

/**
 * Build the Qatar entry checklist, test the stay and price the insurance.
 *
 * @param {object} input
 * @param {string} input.routeId          One of ROUTES ids.
 * @param {string} input.purposeId        One of PURPOSES ids.
 * @param {string} input.arrivalDate      YYYY-MM-DD.
 * @param {string} input.passportExpiry   YYYY-MM-DD.
 * @param {number} input.stayDays         Days you intend to stay.
 * @param {number} input.travellers       People in the party, all ages.
 * @param {number} input.children         How many of them are children.
 * @param {number} [input.insurancePolicyQar] Price of one 30-day policy.
 * @param {boolean} [input.carryingCash]
 * @param {boolean} [input.carryingMedication]
 * @returns {object} result, or { error }.
 */
export function buildQatarChecklist({
  routeId = "waiver-30",
  purposeId = "tourism",
  arrivalDate = "",
  passportExpiry = "",
  stayDays = 7,
  travellers = 2,
  children = 0,
  insurancePolicyQar = INSURANCE_POLICY_QAR,
  carryingCash = false,
  carryingMedication = false,
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
    return { error: "Enter 365 days or fewer; a longer stay needs a residence permit, not a visit visa." };
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

  const policyPrice = Number(insurancePolicyQar);
  if (!Number.isFinite(policyPrice) || policyPrice < 0) {
    return { error: "The insurance policy price must be zero or a positive amount." };
  }

  // Passport validity: six months from the date of entry.
  const passportMustReach = addMonths(arrival, PASSPORT_VALIDITY_MONTHS);
  const passportOk = expiry.getTime() >= passportMustReach.getTime();
  const passportShortfallDays = passportOk ? 0 : daysBetween(expiry, passportMustReach);

  // Stay test: against the initial admission, then against admission plus extension.
  const wholeDays = Math.round(days);
  const withExtensionDays = route.maxStayDays + route.extensionDays;
  const withinInitialStay = wholeDays <= route.maxStayDays;
  const withinExtendedStay = wholeDays <= withExtensionDays;
  const needsExtension = !withinInitialStay && withinExtendedStay;
  const daysOverLimit = withinExtendedStay ? 0 : wholeDays - withExtensionDays;

  // Insurance: cover must run for the whole stay, and the standard policy is sold in
  // 30-day blocks, so round the number of policies up.
  const policiesPerPerson = Math.ceil(wholeDays / INSURANCE_POLICY_DAYS);
  const insurancePerPersonQar = round2(policiesPerPerson * policyPrice);
  const insuranceTotalQar = round2(insurancePerPersonQar * partySize);

  const visaFeeTotalQar = round2(route.visaFeeQar * partySize);
  const governmentCostQar = round2(insuranceTotalQar + visaFeeTotalQar);

  const documents = buildDocuments({
    route,
    purposeId: purpose.id,
    travellingWithChildren: childCount > 0,
    carryingCash: Boolean(carryingCash),
    carryingMedication: Boolean(carryingMedication),
  });
  const requiredDocuments = documents.filter((doc) => doc.required);
  const optionalDocuments = documents.filter((doc) => !doc.required);

  const warnings = [];
  if (!passportOk) {
    warnings.push(
      `Your passport expires ${passportShortfallDays} day(s) too early — Qatar wants it valid to ${toIso(passportMustReach)}.`,
    );
  }
  if (needsExtension) {
    warnings.push(
      `Your ${wholeDays}-day stay exceeds the ${route.maxStayDays}-day admission. Apply to the Ministry of Interior for the ${route.extensionDays}-day extension before the first period runs out.`,
    );
  }
  if (!withinExtendedStay) {
    warnings.push(
      `${wholeDays} days is ${daysOverLimit} day(s) beyond what this route allows even with an extension (${withExtensionDays} days). You need a different permission.`,
    );
  }
  if (route.windowDays > 0 && route.maxStayDays === 90) {
    warnings.push(
      "The 90 days are counted inside a rolling 180-day window, so earlier visits in the same window come off your allowance.",
    );
  }
  if (route.id === "transit") {
    warnings.push(
      `The transit visa needs a layover of at least ${TRANSIT_MIN_LAYOVER_HOURS} hours and covers no more than ${TRANSIT_MAX_HOURS} hours in the country.`,
    );
  }
  if (policiesPerPerson > 1) {
    warnings.push(
      `A ${wholeDays}-day stay needs ${policiesPerPerson} policy periods of ${INSURANCE_POLICY_DAYS} days each — cover has to run to the last day of the visit.`,
    );
  }

  const verdict = passportOk
    ? withinExtendedStay
      ? `Route works — budget about QAR ${governmentCostQar.toLocaleString("en-US")} in insurance and visa fees for ${partySize} traveller(s).`
      : "The planned stay is longer than this route permits."
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
    extensionDays: route.extensionDays,
    maxStayWithExtensionDays: withExtensionDays,
    withinInitialStay,
    withinExtendedStay,
    needsExtension,
    daysOverLimit,
    travellers: Math.round(partySize),
    children: Math.round(childCount),
    policiesPerPerson,
    insurancePolicyQar: round2(policyPrice),
    insurancePerPersonQar,
    insuranceTotalQar,
    visaFeeTotalQar,
    governmentCostQar,
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

export default buildQatarChecklist;
