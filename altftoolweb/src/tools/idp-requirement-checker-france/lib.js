/**
 * IDP requirement checker for France.
 *
 * An International Driving Permit is not a licence in its own right. It is the
 * standard multilingual translation of a national licence, issued under the
 * 1949 Geneva Convention or the 1968 Vienna Convention on Road Traffic, and it
 * is only valid when shown together with the national licence it translates.
 * France is a contracting party to both conventions, so either format works.
 *
 * The French rules that decide the answer:
 *
 *  - Article R222-1 of the Code de la route recognises a driving licence issued
 *    by another EU or EEA state directly, for as long as it remains valid.
 *  - The Arrete du 12 janvier 2012, which governs licences issued by states
 *    outside the EU and EEA, lets a holder drive in France on the national
 *    licence provided it is valid, the holder is at least 18, and the licence
 *    is written in French or is accompanied by an official translation into
 *    French. An International Driving Permit is accepted in place of that
 *    translation. Where a translation is needed it must come from a traducteur
 *    agree - a translator on a French court's list of experts - or from the
 *    issuing country's consulate in France.
 *  - The same arrete limits a non-EU licence to one year once the holder has
 *    their normal residence in France, counted from the start of validity of
 *    the residence permit or long-stay visa. Exchange for a French licence is
 *    only possible where a reciprocity agreement exists with the issuing state,
 *    and the application must be filed inside that one-year period.
 *  - Normal residence follows the EU definition used in Article 12 of Directive
 *    2006/126/EC: living in the country at least 185 days in a calendar year
 *    because of personal ties.
 *  - Category B (car) starts at 18 in France.
 *
 * Informational only. Rules and reciprocity lists change; confirm your own case
 * with your prefecture, the ANTS licence service or your embassy.
 */

export const COUNTRY_NAME = "France";
export const DRIVES_ON = "right";

/** Category B minimum age in France. */
export const MINIMUM_CAR_AGE = 18;
/** Commercial rental practice, not law. */
export const RENTAL_MIN_AGE = 21;
export const RENTAL_SURCHARGE_UNDER_AGE = 25;

/** Arrete du 12 janvier 2012: one year of validity once normally resident. */
export const RESIDENT_VALIDITY_MONTHS = 12;
/** Directive 2006/126/EC Art. 12 normal-residence threshold. */
export const NORMAL_RESIDENCE_DAYS = 185;

export const ACCEPTED_IDP_FORMATS = ["geneva-1949", "vienna-1968"];

export const MS_PER_DAY = 86400000;
const MAX_STAY_DAYS = 3650;

/**
 * Treatment of each family of issuing country under French rules.
 *  "eu"          - recognised outright by Article R222-1, no time limit
 *  "recognised"  - accepted without a translation by arrangement or because
 *                  the licence is already written in French
 *  "translation" - the arrete requires a French translation; an IDP is the
 *                  accepted form of it
 *  "sworn-only"  - issuing state is in neither convention, so no valid IDP
 *                  exists and only a certified translation will do
 */
export const LICENCE_ORIGINS = [
  {
    id: "eu-eea",
    label: "EU or EEA state (includes Iceland, Liechtenstein, Norway)",
    rule: "eu",
    note: "Article R222-1 of the Code de la route recognises EU and EEA licences directly, with no translation and no time limit while the licence is valid.",
  },
  {
    id: "french-text",
    label: "A state that prints the licence in French (Quebec, Monaco, francophone Africa)",
    rule: "recognised",
    note: "The arrete only asks for a translation when the licence is not written in French, so a French-language licence satisfies it as it stands.",
  },
  {
    id: "uk",
    label: "United Kingdom",
    rule: "recognised",
    note: "UK photocard licences are accepted across the EU and EEA without an International Driving Permit, and UK government guidance confirms no IDP is needed for France.",
  },
  {
    id: "switzerland",
    label: "Switzerland",
    rule: "recognised",
    note: "The Swiss credit-card licence carries French text and Switzerland has a licence-recognition arrangement with France, so no separate translation is asked for.",
  },
  {
    id: "usa",
    label: "United States",
    rule: "translation",
    note: "US state licences are in English only, so the arrete requires a French translation; the AAA or AATA International Driving Permit is the usual way to supply it.",
  },
  {
    id: "canada",
    label: "Canada (outside Quebec)",
    rule: "translation",
    note: "An English-language provincial licence needs the French translation; a Quebec permis in French does not, so pick the French-language option instead if that is your case.",
  },
  {
    id: "australia",
    label: "Australia",
    rule: "translation",
    note: "Australia is a 1949 Geneva party and state motoring clubs issue the IDP, which covers the French translation requirement.",
  },
  {
    id: "new-zealand",
    label: "New Zealand",
    rule: "translation",
    note: "The New Zealand AA issues a 1949 Geneva IDP; the plastic NZ licence on its own is in English only.",
  },
  {
    id: "india",
    label: "India",
    rule: "translation",
    note: "Indian licences are printed in English, not French, so a translation is required; the RTO issues a 1949 Geneva IDP under Form 4A.",
  },
  {
    id: "japan",
    label: "Japan",
    rule: "translation",
    note: "A Japanese licence is in Japanese script, so the French translation is essential; prefectural police issue the 1949 Geneva IDP.",
  },
  {
    id: "other-latin",
    label: "Other non-EU state, licence in Latin script but not in French",
    rule: "translation",
    note: "Latin script is not the test - the arrete asks for the licence to be in French or translated, so an IDP is still expected.",
  },
  {
    id: "non-latin",
    label: "Any state whose licence is not printed in Latin script",
    rule: "translation",
    note: "A licence in Arabic, Cyrillic, Chinese or Thai script cannot be read at a French roadside check without the accompanying permit.",
  },
  {
    id: "no-convention",
    label: "State that has joined neither road-traffic convention",
    rule: "sworn-only",
    note: "No recognised IDP exists for such a licence, so you need a translation by a traducteur agree on a French court's expert list, or by your consulate in France.",
  },
];

export const IDP_HELD_OPTIONS = [
  { id: "none", label: "No IDP" },
  { id: "geneva-1949", label: "1949 Geneva Convention IDP (valid 1 year)" },
  { id: "vienna-1968", label: "1968 Vienna Convention IDP (valid up to 3 years)" },
  { id: "both", label: "Both formats" },
  { id: "sworn-translation", label: "Certified French translation instead of an IDP" },
];

export const STAY_PURPOSES = [
  { id: "visit", label: "Short visit - holiday or business trip" },
  { id: "residence", label: "Moving to France on a visa or residence permit" },
];

export const VERDICTS = {
  "not-permitted": { label: "You may not drive", tone: "danger" },
  required: { label: "IDP required", tone: "danger" },
  "translation-required": { label: "Certified translation required", tone: "danger" },
  satisfied: { label: "IDP required - and you have it", tone: "success" },
  recommended: { label: "IDP not required, but worth carrying", tone: "warning" },
  "not-required": { label: "No IDP needed", tone: "success" },
};

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse a YYYY-MM-DD string to a UTC timestamp, or null if it is not a real date. */
export function parseISODate(value) {
  const match = DATE_PATTERN.exec(String(value ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return stamp;
}

export function toISODate(stamp) {
  return new Date(stamp).toISOString().slice(0, 10);
}

/** Calendar-correct month arithmetic, clamped to the end of a short month. */
export function addMonthsISO(iso, months) {
  const stamp = parseISODate(iso);
  if (stamp === null) return null;
  const start = new Date(stamp);
  const target = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + months, 1));
  const lastDayOfTarget = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(start.getUTCDate(), lastDayOfTarget));
  return toISODate(target.getTime());
}

export function daysBetweenISO(fromISO, toISO) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  if (from === null || to === null) return null;
  return Math.round((to - from) / MS_PER_DAY);
}

function findOrigin(id) {
  return LICENCE_ORIGINS.find((entry) => entry.id === id) ?? null;
}

function idpCovers(idpHeld) {
  if (idpHeld === "both") return true;
  return ACCEPTED_IDP_FORMATS.includes(idpHeld);
}

/**
 * Decide whether an IDP is expected in France for one traveller.
 *
 * @param {object} input
 * @param {string} input.licenceOrigin   id from LICENCE_ORIGINS
 * @param {string} input.idpHeld         id from IDP_HELD_OPTIONS
 * @param {string} input.arrivalDate     YYYY-MM-DD, date of entry into France
 * @param {string} [input.departureDate] YYYY-MM-DD, optional planned exit
 * @param {number} input.ageYears        the driver's age in whole years
 * @param {string} input.stayPurpose     id from STAY_PURPOSES
 * @returns {object} verdict object, or { error } for unusable input
 */
export function checkIdpRequirement({
  licenceOrigin,
  idpHeld,
  arrivalDate,
  departureDate,
  ageYears,
  stayPurpose,
} = {}) {
  const origin = findOrigin(licenceOrigin);
  if (!origin) return { error: "Choose the country that issued your driving licence." };

  const idp = IDP_HELD_OPTIONS.find((entry) => entry.id === idpHeld);
  if (!idp) return { error: "Choose which permit or translation you already hold." };

  const purpose = STAY_PURPOSES.find((entry) => entry.id === stayPurpose);
  if (!purpose) return { error: "Choose whether this is a short visit or a long stay." };

  const arrival = parseISODate(arrivalDate);
  if (arrival === null) return { error: "Enter a valid arrival date as year, month and day." };

  let stayDays = null;
  if (departureDate) {
    const departure = parseISODate(departureDate);
    if (departure === null) return { error: "Enter a valid departure date, or leave it empty." };
    stayDays = Math.round((departure - arrival) / MS_PER_DAY);
    if (stayDays < 0) return { error: "The departure date cannot fall before the arrival date." };
    if (stayDays > MAX_STAY_DAYS) {
      return { error: "Enter a stay of ten years or less - beyond that you are simply resident." };
    }
  }

  const age = Number(ageYears);
  if (!Number.isFinite(age)) return { error: "Enter your age in whole years." };
  if (age < 14 || age > 110) return { error: "Enter an age between 14 and 110 years." };

  const holdsSworn = idpHeld === "sworn-translation";
  const holdsIdp = idpCovers(idpHeld);

  let verdict;
  let reason;

  if (age < MINIMUM_CAR_AGE) {
    verdict = "not-permitted";
    reason = `The arrete du 12 janvier 2012 lets a foreign licence be used in France only from age ${MINIMUM_CAR_AGE}, which is also the category B minimum here. At ${age} you cannot drive a car in ${COUNTRY_NAME} on any licence or permit, even if your home country issued you one earlier.`;
  } else if (origin.rule === "eu") {
    verdict = "not-required";
    reason =
      "Article R222-1 of the Code de la route recognises an EU or EEA licence directly. No translation, no International Driving Permit, and no time limit while the licence itself stays valid.";
  } else if (origin.rule === "recognised") {
    verdict = "recommended";
    reason =
      "A translation is only demanded when the licence is not written in French or is not covered by a recognition arrangement, so no International Driving Permit is legally required here. Some hire desks still ask for one, and it costs little to carry.";
  } else if (origin.rule === "sworn-only") {
    verdict = holdsSworn ? "satisfied" : "translation-required";
    reason = holdsSworn
      ? "Your issuing state is outside both conventions, so an IDP is not available to you - the certified French translation you hold is what the arrete asks for."
      : "Your issuing state has joined neither convention, so no valid IDP exists for your licence. You still need an official French translation, made by a traducteur agree on a French court's list of experts or by your consulate in France.";
  } else if (holdsIdp) {
    verdict = "satisfied";
    reason =
      "The arrete du 12 janvier 2012 requires your licence to be written in French or accompanied by an official translation, and an International Driving Permit is expressly accepted as that translation. France recognises both the 1949 Geneva and the 1968 Vienna format. Carry the permit with the original licence - it is worthless on its own.";
  } else if (holdsSworn) {
    verdict = "satisfied";
    reason =
      "The arrete requires an official French translation of your licence and a certified translation meets that requirement just as an IDP would. Carry it with the original licence.";
  } else {
    verdict = "required";
    reason =
      "Your licence is neither written in French nor covered by a recognition arrangement, so the arrete du 12 janvier 2012 requires an official French translation. An International Driving Permit is the accepted form and must be issued in the country that issued your licence, before you travel.";
  }

  let windowLabel;
  let windowEndDate = null;
  const warnings = [];

  const presumedResident =
    purpose.id === "residence" || (stayDays !== null && stayDays > NORMAL_RESIDENCE_DAYS);

  if (origin.rule === "eu") {
    windowLabel = "No expiry while the EU or EEA licence stays valid";
  } else if (presumedResident) {
    windowEndDate = addMonthsISO(arrivalDate, RESIDENT_VALIDITY_MONTHS);
    windowLabel = `Foreign licence usable for ${RESIDENT_VALIDITY_MONTHS} months from arrival`;
    warnings.push(
      `Once you are normally resident, a non-EU licence is valid in France for ${RESIDENT_VALIDITY_MONTHS} months counted from the start of your residence permit or long-stay visa. The exchange application has to be filed inside that year, and exchange is only possible where France has a reciprocity agreement with your issuing state.`,
    );
    if (purpose.id !== "residence") {
      warnings.push(
        `A stay of ${stayDays} days passes the ${NORMAL_RESIDENCE_DAYS}-day normal-residence threshold, so France will treat you as resident even though you planned this as a long visit.`,
      );
    }
  } else {
    windowLabel = "Valid for the whole visit while you are not normally resident";
    if (stayDays !== null && stayDays > 90) {
      warnings.push(
        `Your ${stayDays}-day stay is still under the ${NORMAL_RESIDENCE_DAYS}-day threshold, but keep evidence of your home address in case residence is questioned.`,
      );
    }
  }

  const daysRemaining = windowEndDate === null ? null : daysBetweenISO(arrivalDate, windowEndDate);

  if (idpHeld === "geneva-1949") {
    warnings.push(
      "A 1949 Geneva IDP runs for one year from the date of issue and cannot be renewed from abroad, so check the expiry covers the whole trip.",
    );
  }
  if (age < RENTAL_MIN_AGE) {
    warnings.push(
      `Most French rental desks will not release a car below ${RENTAL_MIN_AGE}, and a young-driver surcharge normally applies under ${RENTAL_SURCHARGE_UNDER_AGE}. That is company policy rather than law.`,
    );
  } else if (age < RENTAL_SURCHARGE_UNDER_AGE) {
    warnings.push(`Expect a young-driver surcharge at the hire desk below age ${RENTAL_SURCHARGE_UNDER_AGE}.`);
  }

  const checklist = [
    "Your original national driving licence - an IDP is never valid on its own",
    "Passport or national ID card",
    "Vehicle registration document (carte grise) and proof of insurance",
    "A reflective jacket inside the cabin and a warning triangle, both compulsory in the vehicle",
    "A Crit'Air sticker if you will enter a low-emission zone such as Paris, Lyon or Grenoble - foreign-registered cars need one too",
  ];
  if (verdict === "required" || verdict === "satisfied" || verdict === "recommended") {
    checklist.unshift(
      holdsSworn
        ? "The certified French translation of your licence"
        : "Your International Driving Permit, issued in the country that issued your licence",
    );
  }
  if (verdict === "translation-required") {
    checklist.unshift("An official French translation from a traducteur agree or your consulate");
  }

  return {
    verdict,
    verdictLabel: VERDICTS[verdict].label,
    tone: VERDICTS[verdict].tone,
    reason,
    country: COUNTRY_NAME,
    drivesOn: DRIVES_ON,
    originLabel: origin.label,
    originNote: origin.note,
    idpLabel: idp.label,
    acceptedFormats: "1949 Geneva and 1968 Vienna",
    minimumAge: MINIMUM_CAR_AGE,
    ageOk: age >= MINIMUM_CAR_AGE,
    stayDays,
    windowLabel,
    windowEndDate,
    daysRemaining,
    presumedResident,
    warnings,
    checklist,
    legalBasis:
      "Article R222-1 Code de la route; Arrete du 12 janvier 2012; 1949 Geneva and 1968 Vienna Conventions on Road Traffic",
  };
}
