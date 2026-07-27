/**
 * Sri Lanka entry requirement checklist.
 *
 * Sri Lanka admits short-stay visitors on an Electronic Travel Authorisation (ETA)
 * issued by the Department of Immigration and Emigration before travel. The ETA is not
 * a visa in itself: it is an approval notice that is converted into a visa at the port
 * of entry, which is why the passport, ticket and funds checks still happen at the
 * counter even when the ETA has been granted.
 *
 * The rules modelled here:
 *
 *  - Passport validity. Sri Lanka requires a passport valid for at least six months
 *    from the date of arrival. This is counted from arrival, not from departure, and
 *    airlines apply it at check-in.
 *
 *  - Permitted stay. A tourist ETA admits the holder for 30 days from the date of
 *    arrival with double entry. It can be extended at the Department of Immigration
 *    and Emigration in Colombo, in stages, well beyond that period on payment of the
 *    extension fee — so a stay longer than 30 days is a matter of extending inside the
 *    country, not of a longer ETA. A transit ETA admits the holder for two days.
 *
 *  - Fees. The published tourist ETA fee for most nationalities has been USD 50, with
 *    a concessionary SAARC rate of USD 20, and no fee for children under 12. Since
 *    October 2024 Sri Lanka has run a fee-waiver scheme covering roughly forty
 *    nationalities: those travellers still need an approved ETA, but pay nothing for
 *    it. The waiver list is revised by cabinet decision, so it is treated here as a
 *    route you select rather than a fixed list, and the fee is editable.
 *
 *  - Yellow fever. Under the International Health Regulations, Sri Lanka requires a
 *    yellow fever vaccination certificate from travellers aged nine months and over
 *    who are arriving from, or who have transited for more than twelve hours through,
 *    a country with risk of yellow fever transmission.
 *
 *  - Currency. Foreign currency brought in above the equivalent of USD 15,000 must be
 *    declared to Sri Lanka Customs on arrival.
 *
 * Informational only. Fees, waiver lists and permitted stays are set by the Department
 * of Immigration and Emigration and change without much notice — confirm on the
 * official portal before you pay for anything, and speak to the Sri Lankan mission in
 * your country for work, study or residence.
 */

/** Months of passport validity Sri Lanka requires, counted from the date of arrival. */
export const PASSPORT_VALIDITY_MONTHS = 6;

/** Amount of foreign currency above which a customs declaration is compulsory (USD). */
export const CURRENCY_DECLARATION_THRESHOLD_USD = 15000;

/** Age below which the ETA is issued free of charge. */
export const CHILD_FREE_ETA_AGE = 12;

/** Minimum age at which a yellow fever certificate can be demanded (IHR standard). */
export const YELLOW_FEVER_MIN_AGE_MONTHS = 9;

/**
 * Entry routes. `feeUsd` is the published adult fee for that route; every figure is
 * editable in the interface because these are administrative prices.
 */
export const ROUTES = [
  {
    id: "eta-standard",
    label: "ETA at the standard rate (most nationalities)",
    feeUsd: 50,
    needsEta: true,
    note: "Apply online before you fly. The approval notice is converted into a visa at immigration on arrival.",
  },
  {
    id: "eta-waived",
    label: "ETA with the fee waived (nationalities in the free-visa scheme)",
    feeUsd: 0,
    needsEta: true,
    note: "The waiver removes the fee, not the application — an approved ETA is still needed before boarding.",
  },
  {
    id: "eta-saarc",
    label: "ETA at the SAARC concessionary rate",
    feeUsd: 20,
    needsEta: true,
    note: "Applies to SAARC nationals where the fee waiver does not already cover them.",
  },
  {
    id: "visa-free",
    label: "Entry without a prior ETA (Maldives, Singapore and Seychelles nationals)",
    feeUsd: 0,
    needsEta: false,
    note: "A small number of nationalities are admitted without applying in advance. Everything else on the list still applies at the counter.",
  },
  {
    id: "mission-visa",
    label: "Visa from a Sri Lankan diplomatic mission (nationalities outside the online system)",
    feeUsd: 0,
    needsEta: false,
    note: "Some nationalities cannot use the online system and must apply to a Sri Lankan High Commission or Embassy. Allow several weeks.",
  },
];

/** Purposes of travel and the stay each is normally granted on arrival. */
export const PURPOSES = [
  {
    id: "tourist",
    label: "Tourism or visiting family",
    maxStayDays: 30,
    extendable: true,
    note: "Double entry within the validity period, extendable in Colombo.",
  },
  {
    id: "business",
    label: "Business meetings or a conference",
    maxStayDays: 30,
    extendable: true,
    note: "A business ETA covers meetings and conferences. It does not permit paid employment in Sri Lanka.",
  },
  {
    id: "transit",
    label: "Transit only, leaving within two days",
    maxStayDays: 2,
    extendable: false,
    note: "The transit ETA is issued free of charge and admits you for two days.",
  },
  {
    id: "long",
    label: "Staying longer than 30 days",
    maxStayDays: 30,
    extendable: true,
    note: "Enter on a tourist ETA and extend at the Department of Immigration and Emigration in Colombo before day 30. Do not overstay and pay at the airport.",
  },
];

const MS_PER_DAY = 86400000;

/** Parse a YYYY-MM-DD string into a UTC date, or null if it is not a real date. */
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

/** Add whole months, clamping to the last day of the target month (31 Aug + 6 => 28/29 Feb). */
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

  if (context.route.needsEta) {
    documents.push({
      id: "eta",
      label: "Approved ETA printed or saved offline",
      detail:
        "Apply on the official Department of Immigration and Emigration portal, not through a reseller. Airlines check the approval before boarding.",
      required: true,
    });
  } else if (context.route.id === "mission-visa") {
    documents.push({
      id: "visa",
      label: "Visa issued by a Sri Lankan High Commission or Embassy",
      detail: "Apply well in advance — mission visas are not decided in days.",
      required: true,
    });
  }

  documents.push({
    id: "passport",
    label: `Passport valid at least ${PASSPORT_VALIDITY_MONTHS} months beyond your arrival date`,
    detail:
      "Counted from arrival, not departure. Also carry at least two blank pages for stamps.",
    required: true,
  });
  documents.push({
    id: "onward",
    label: "Confirmed return or onward ticket",
    detail:
      "Immigration and the airline can both ask for it. A one-way ticket without an onward booking is the single most common boarding refusal.",
    required: true,
  });
  documents.push({
    id: "accommodation",
    label: "Address of your first night's accommodation",
    detail:
      "The arrival formalities ask where you are staying. A hotel confirmation or a host's address and phone number is enough.",
    required: true,
  });
  documents.push({
    id: "funds",
    label: "Evidence that you can pay for the trip",
    detail:
      "A card with available balance, recent statement or cash. Officers ask when the stay is long or the ticket is one-way.",
    required: true,
  });

  if (context.yellowFeverRisk) {
    documents.push({
      id: "yellowfever",
      label: "Yellow fever vaccination certificate",
      detail: `Required from travellers aged ${YELLOW_FEVER_MIN_AGE_MONTHS} months and over arriving from, or transiting more than 12 hours through, a country with risk of yellow fever transmission.`,
      required: true,
    });
  }

  if (context.travellingWithChildren) {
    documents.push({
      id: "childdocs",
      label: "Each child's own passport and ETA",
      detail: `Children need an ETA of their own; it is issued free of charge under ${CHILD_FREE_ETA_AGE} years of age.`,
      required: true,
    });
    documents.push({
      id: "consent",
      label: "Birth certificate, and a consent letter if one parent is absent",
      detail:
        "Carried to show the relationship where the child's surname differs or only one parent is travelling.",
      required: false,
    });
  }

  if (context.purpose.id === "business") {
    documents.push({
      id: "invitation",
      label: "Invitation or meeting confirmation from the Sri Lankan host",
      detail: "On the host company's letterhead, naming the dates and the purpose.",
      required: true,
    });
  }

  if (context.purpose.id === "long") {
    documents.push({
      id: "extension",
      label: "Plan for extending in Colombo before day 30",
      detail:
        "Extensions are granted at the Department of Immigration and Emigration on Suhurupaya, Battaramulla. Go before the 30 days run out, not after.",
      required: true,
    });
  }

  documents.push({
    id: "insurance",
    label: "Travel and medical insurance",
    detail:
      "Not demanded at the border for tourists, but private hospital treatment and any evacuation is paid up front without it.",
    required: false,
  });

  if (context.declareCurrency) {
    documents.push({
      id: "currency",
      label: "Customs currency declaration",
      detail: `Compulsory when you bring in more than the equivalent of USD ${CURRENCY_DECLARATION_THRESHOLD_USD.toLocaleString("en-US")}. Declaring it also lets you take it out again.`,
      required: true,
    });
  }

  documents.push({
    id: "prescriptions",
    label: "Prescriptions for any medication you carry",
    detail:
      "Keep medicines in the original labelled packaging with the prescription; some common painkillers and sedatives are controlled.",
    required: false,
  });

  return documents;
}

/**
 * Build the Sri Lanka entry checklist for one trip.
 *
 * @param {object} input
 * @param {string} input.routeId          One of ROUTES ids.
 * @param {string} input.purposeId        One of PURPOSES ids.
 * @param {string} input.arrivalDate      YYYY-MM-DD, the day you land.
 * @param {string} input.passportExpiry   YYYY-MM-DD from the passport.
 * @param {number} input.stayDays         Nights you intend to stay.
 * @param {number} input.adults           Travellers aged 12 and over.
 * @param {number} input.children         Travellers under 12.
 * @param {number} [input.feeUsd]         Override the published fee per adult.
 * @param {boolean} [input.yellowFeverRisk]
 * @param {boolean} [input.carryingOver15k]
 * @returns {object} result, or { error } for input that cannot be used.
 */
export function buildSriLankaChecklist({
  routeId = "eta-standard",
  purposeId = "tourist",
  arrivalDate = "",
  passportExpiry = "",
  stayDays = 14,
  adults = 1,
  children = 0,
  feeUsd,
  yellowFeverRisk = false,
  carryingOver15k = false,
} = {}) {
  const route = ROUTES.find((entry) => entry.id === routeId);
  if (!route) return { error: "Choose how you are entering Sri Lanka." };

  const purpose = PURPOSES.find((entry) => entry.id === purposeId);
  if (!purpose) return { error: "Choose the purpose of your trip." };

  const arrival = parseDate(arrivalDate);
  if (!arrival) return { error: "Enter your arrival date as a real calendar date." };

  const expiry = parseDate(passportExpiry);
  if (!expiry) return { error: "Enter your passport expiry date as a real calendar date." };

  const adultCount = Number(adults);
  const childCount = Number(children);
  if (!Number.isFinite(adultCount) || !Number.isFinite(childCount)) {
    return { error: "Enter the number of travellers as whole numbers." };
  }
  if (adultCount < 0 || childCount < 0) {
    return { error: "The number of travellers cannot be negative." };
  }
  if (adultCount + childCount < 1) {
    return { error: "Add at least one traveller." };
  }
  if (adultCount + childCount > 50) {
    return { error: "This checklist covers a single party — use a group application above 50 people." };
  }

  const nights = Number(stayDays);
  if (!Number.isFinite(nights) || nights < 1) {
    return { error: "Enter how many days you plan to stay, as a number of at least 1." };
  }
  if (nights > 730) {
    return { error: "Enter a stay of two years or less; longer stays need a residence visa." };
  }

  const fee =
    feeUsd === undefined || feeUsd === null || feeUsd === ""
      ? route.feeUsd
      : Number(feeUsd);
  if (!Number.isFinite(fee) || fee < 0) {
    return { error: "The visa fee must be zero or a positive amount." };
  }

  // Passport validity test: six clear months from the date of arrival.
  const passportMustReach = addMonths(arrival, PASSPORT_VALIDITY_MONTHS);
  const passportOk = expiry.getTime() >= passportMustReach.getTime();
  const passportShortfallDays = passportOk ? 0 : daysBetween(expiry, passportMustReach);

  // Stay test against the permitted admission for the chosen purpose.
  const stayWithinLimit = nights <= purpose.maxStayDays;
  const daysOverLimit = stayWithinLimit ? 0 : Math.round(nights - purpose.maxStayDays);

  // Transit ETAs are issued free of charge whatever the nationality route.
  const chargeableFee = purpose.id === "transit" ? 0 : fee;
  const totalFeeUsd = Math.round(chargeableFee * adultCount * 100) / 100;

  const documents = buildDocuments({
    route,
    purpose,
    yellowFeverRisk: Boolean(yellowFeverRisk),
    travellingWithChildren: childCount > 0,
    declareCurrency: Boolean(carryingOver15k),
  });

  const requiredDocuments = documents.filter((doc) => doc.required);
  const optionalDocuments = documents.filter((doc) => !doc.required);

  const warnings = [];
  if (!passportOk) {
    warnings.push(
      `Your passport expires ${passportShortfallDays} day(s) too early — Sri Lanka needs it valid until ${toIso(passportMustReach)}. Renew before you book.`,
    );
  }
  if (!stayWithinLimit && purpose.extendable) {
    warnings.push(
      `A ${purpose.maxStayDays}-day admission does not cover ${Math.round(nights)} days. Plan to extend at the Department of Immigration and Emigration in Colombo ${daysOverLimit} day(s) before the stamp runs out.`,
    );
  }
  if (!stayWithinLimit && !purpose.extendable) {
    warnings.push(
      `Transit admission is ${purpose.maxStayDays} days and is not extended. Apply for a tourist ETA instead.`,
    );
  }
  if (route.id === "mission-visa") {
    warnings.push(
      "Nationalities outside the online system should start the application weeks ahead — a mission visa is not a same-week document.",
    );
  }

  const verdict = passportOk
    ? stayWithinLimit
      ? `Cleared on paper — assemble the ${requiredDocuments.length} required items.`
      : `Entry route is fine, but the ${purpose.maxStayDays}-day admission is shorter than your trip.`
    : "Passport validity fails the six-month rule — fix that first.";

  return {
    route,
    purpose,
    arrivalDate: toIso(arrival),
    passportExpiry: toIso(expiry),
    passportMustBeValidUntil: toIso(passportMustReach),
    passportOk,
    passportShortfallDays,
    stayDays: Math.round(nights),
    maxStayDays: purpose.maxStayDays,
    stayWithinLimit,
    daysOverLimit,
    adults: Math.round(adultCount),
    children: Math.round(childCount),
    feePerAdultUsd: chargeableFee,
    totalFeeUsd,
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

export default buildSriLankaChecklist;
