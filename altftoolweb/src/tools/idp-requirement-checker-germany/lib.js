/**
 * IDP requirement checker for Germany.
 *
 * An International Driving Permit (IDP) is not a licence. It is a standard
 * multilingual translation of a national driving licence, issued under the
 * 1949 Geneva Convention on Road Traffic or the 1968 Vienna Convention on Road
 * Traffic, and it is only valid when presented together with the national
 * licence it translates. Germany is a contracting party to both conventions,
 * so an IDP in either format is accepted here.
 *
 * The German rules that decide the answer:
 *
 *  - Section 29(1) Fahrerlaubnis-Verordnung (FeV): a holder of a foreign
 *    driving licence may drive in Germany within the scope of that licence for
 *    as long as they do not have their ordinary residence in Germany. Once
 *    ordinary residence is established, the foreign licence remains valid for
 *    six months (extendable on application to twelve months where the stay
 *    will not exceed a year).
 *  - Section 7 FeV / Article 12 of EU Directive 2006/126/EC define ordinary
 *    residence as living in the country for at least 185 days in a calendar
 *    year because of personal ties.
 *  - Section 29(2) FeV: a foreign national licence must be accompanied by a
 *    translation. No translation is required for a licence issued by an EU or
 *    EEA state, for an International Driving Permit, or for a national licence
 *    that conforms to Annex 6 of the 1968 Vienna Convention (the standardised
 *    layout the EU photocard licence also follows). Accepted translations are
 *    those made by a German consular office, a court-sworn translator, or an
 *    automobile club authorised for the purpose such as ADAC or AvD.
 *  - Section 29(3) No. 1 FeV: the foreign licence confers no entitlement in
 *    Germany if its holder did not meet the German minimum age at the time of
 *    issue. For category B (car) that minimum age is 18.
 *
 * Informational only. Traffic law and the annexes to the FeV change; confirm
 * your own case with a German driving licence authority (Fuehrerscheinstelle)
 * or the embassy that issued your licence before you travel.
 */

export const COUNTRY_NAME = "Germany";
export const DRIVES_ON = "right";

/** Category B minimum age in Germany (Section 29(3) No. 1 FeV). */
export const MINIMUM_CAR_AGE = 18;
/** Commercial rental-desk practice, not law: most German desks start at 21 and
 *  levy a young-driver surcharge below 25. */
export const RENTAL_MIN_AGE = 21;
export const RENTAL_SURCHARGE_UNDER_AGE = 25;

/** Section 29(1) FeV grace period after ordinary residence is established. */
export const RESIDENT_GRACE_MONTHS = 6;
/** Section 7 FeV / Directive 2006/126/EC Art. 12 ordinary-residence threshold. */
export const ORDINARY_RESIDENCE_DAYS = 185;

/** Both IDP formats are recognised in Germany. */
export const ACCEPTED_IDP_FORMATS = ["geneva-1949", "vienna-1968"];

export const MS_PER_DAY = 86400000;
const MAX_STAY_DAYS = 3650;

/**
 * How Section 29(2) FeV treats each family of issuing country.
 *  "exempt"      - no translation and no IDP needed
 *  "annex6"      - licence follows the Annex 6 layout, so legally exempt, but
 *                  an IDP still smooths a roadside check or a rental desk
 *  "translation" - a translation is required; an IDP is the usual way to meet it
 *  "sworn-only"  - the issuing state is party to neither convention, so it
 *                  cannot issue a valid IDP; only a sworn translation works
 */
export const LICENCE_ORIGINS = [
  {
    id: "eu-eea",
    label: "EU or EEA state (includes Iceland, Liechtenstein, Norway)",
    rule: "exempt",
    note: "Section 28 FeV recognises EU and EEA licences outright, with no time limit while the licence stays valid.",
  },
  {
    id: "switzerland",
    label: "Switzerland",
    rule: "annex6",
    note: "Switzerland is a 1949 Geneva party and the Swiss credit-card licence follows the standard layout, so no translation is asked for.",
  },
  {
    id: "uk",
    label: "United Kingdom",
    rule: "annex6",
    note: "The UK photocard keeps the EU model layout that matches Annex 6 of the 1968 Convention, so no translation is required after Brexit.",
  },
  {
    id: "usa",
    label: "United States",
    rule: "translation",
    note: "US state licences are not in an Annex 6 layout, so Section 29(2) FeV asks for a translation; an IDP issued by AAA or AATA is the simplest one.",
  },
  {
    id: "canada",
    label: "Canada",
    rule: "translation",
    note: "Canadian provincial licences sit outside the Annex 6 layout, so carry the CAA-issued IDP with the provincial card.",
  },
  {
    id: "australia",
    label: "Australia",
    rule: "translation",
    note: "Australia is a 1949 Geneva party; state licences need the accompanying translation, which the state automobile club issues as an IDP.",
  },
  {
    id: "new-zealand",
    label: "New Zealand",
    rule: "translation",
    note: "New Zealand issues 1949 Geneva IDPs through the AA; the plastic NZ licence alone is not an Annex 6 document.",
  },
  {
    id: "india",
    label: "India",
    rule: "translation",
    note: "Indian licences are printed in English but not in the Annex 6 layout, so a translation is expected; the RTO issues a 1949 Geneva IDP under Form 4A.",
  },
  {
    id: "japan",
    label: "Japan",
    rule: "translation",
    note: "The Japanese licence is in Japanese script, so a translation is required; the prefectural police issue a 1949 Geneva IDP.",
  },
  {
    id: "vienna-annex6",
    label: "Other 1968 Vienna Convention state, licence in the Annex 6 layout",
    rule: "annex6",
    note: "Section 29(2) FeV exempts a national licence that conforms to Annex 6, but police and rental desks are quicker if you also hold the IDP.",
  },
  {
    id: "geneva-other",
    label: "Other 1949 Geneva Convention state",
    rule: "translation",
    note: "The 1949 Convention does not standardise the national licence itself, so the German translation requirement still applies.",
  },
  {
    id: "non-latin",
    label: "Any state whose licence is not printed in Latin script",
    rule: "translation",
    note: "A licence in Arabic, Cyrillic, Chinese, Thai or similar script always needs the translation to be legible to a German officer.",
  },
  {
    id: "no-convention",
    label: "State that has joined neither road-traffic convention",
    rule: "sworn-only",
    note: "A state outside both conventions cannot issue a recognised IDP, so you need a sworn German translation from ADAC, AvD, a consulate or a court-sworn translator.",
  },
];

export const IDP_HELD_OPTIONS = [
  { id: "none", label: "No IDP" },
  { id: "geneva-1949", label: "1949 Geneva Convention IDP (valid 1 year)" },
  { id: "vienna-1968", label: "1968 Vienna Convention IDP (valid up to 3 years)" },
  { id: "both", label: "Both formats" },
  { id: "sworn-translation", label: "Sworn German translation instead of an IDP" },
];

export const STAY_PURPOSES = [
  { id: "visit", label: "Short visit - holiday or business trip" },
  { id: "residence", label: "Moving to Germany or staying long term" },
];

export const VERDICTS = {
  "not-permitted": {
    label: "You may not drive",
    tone: "danger",
  },
  required: {
    label: "IDP required",
    tone: "danger",
  },
  "translation-required": {
    label: "Sworn translation required",
    tone: "danger",
  },
  satisfied: {
    label: "IDP required - and you have it",
    tone: "success",
  },
  recommended: {
    label: "IDP not required, but worth carrying",
    tone: "warning",
  },
  "not-required": {
    label: "No IDP needed",
    tone: "success",
  },
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
 * Decide whether an IDP is expected in Germany for one traveller.
 *
 * @param {object} input
 * @param {string} input.licenceOrigin   id from LICENCE_ORIGINS
 * @param {string} input.idpHeld         id from IDP_HELD_OPTIONS
 * @param {string} input.arrivalDate     YYYY-MM-DD, date of entry into Germany
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
    reason =
      `Section 29(3) No. 1 FeV withdraws recognition from a foreign licence whose holder was below the German minimum age when it was issued. Category B here starts at ${MINIMUM_CAR_AGE}, so at ${age} you cannot drive a car in ${COUNTRY_NAME} on any licence or permit.`;
  } else if (origin.rule === "exempt") {
    verdict = "not-required";
    reason =
      "Section 28 FeV recognises an EU or EEA licence directly. No translation, no International Driving Permit, and no time limit while the licence itself stays valid.";
  } else if (origin.rule === "annex6") {
    verdict = "recommended";
    reason =
      "Section 29(2) FeV exempts a national licence that follows the Annex 6 layout from the translation requirement, so an IDP is not legally demanded. Many rental desks still ask for one, and it removes any argument at a roadside check.";
  } else if (origin.rule === "sworn-only") {
    verdict = holdsSworn ? "satisfied" : "translation-required";
    reason = holdsSworn
      ? "Your issuing state is outside both conventions, so an IDP is not available to you - the sworn German translation you hold is exactly what Section 29(2) FeV asks for."
      : "Your issuing state has joined neither convention, so no valid IDP exists for your licence. Section 29(2) FeV still requires a translation, which must come from ADAC, AvD, a German consular office or a court-sworn translator.";
  } else if (holdsIdp) {
    verdict = "satisfied";
    reason =
      "Section 29(2) FeV requires a translation for your licence, and an International Driving Permit is expressly accepted as that translation. Germany recognises both the 1949 Geneva and the 1968 Vienna format, so carry the permit together with the original licence.";
  } else if (holdsSworn) {
    verdict = "satisfied";
    reason =
      "Section 29(2) FeV requires a translation for your licence and accepts a sworn German translation in place of an IDP. Carry it with the original licence.";
  } else {
    verdict = "required";
    reason =
      "Section 29(2) FeV requires a foreign national licence of this type to be accompanied by a translation. An International Driving Permit is the accepted form, and it must be issued in the country that issued your licence, before you travel.";
  }

  // Residence and time limits.
  let windowLabel;
  let windowEndDate = null;
  const warnings = [];

  const presumedResident =
    purpose.id === "residence" || (stayDays !== null && stayDays > ORDINARY_RESIDENCE_DAYS);

  if (origin.rule === "exempt") {
    windowLabel = "No expiry while the EU or EEA licence stays valid";
  } else if (presumedResident) {
    windowEndDate = addMonthsISO(arrivalDate, RESIDENT_GRACE_MONTHS);
    windowLabel = `Foreign licence usable for ${RESIDENT_GRACE_MONTHS} months from arrival`;
    warnings.push(
      `Section 29(1) FeV gives you ${RESIDENT_GRACE_MONTHS} months from the day you take up ordinary residence. After that you need a German licence, which for many countries means only a theory and practical test rather than an automatic exchange.`,
    );
    if (purpose.id !== "residence") {
      warnings.push(
        `A stay of ${stayDays} days passes the ${ORDINARY_RESIDENCE_DAYS}-day ordinary-residence threshold in Section 7 FeV, so Germany will treat you as resident even on a visitor plan.`,
      );
    }
  } else {
    windowLabel = "Valid for the whole visit while you are not ordinarily resident";
    if (stayDays !== null && stayDays > 90) {
      warnings.push(
        `Your ${stayDays}-day stay is still under the ${ORDINARY_RESIDENCE_DAYS}-day ordinary-residence threshold, but keep proof of your home address in case it is questioned.`,
      );
    }
  }

  const daysRemaining =
    windowEndDate === null ? null : daysBetweenISO(arrivalDate, windowEndDate);

  if (idpHeld === "geneva-1949") {
    warnings.push(
      "A 1949 Geneva IDP is valid for one year from issue. Check the expiry date covers your whole trip, because it cannot be renewed or reissued from abroad.",
    );
  }
  if (age < RENTAL_MIN_AGE) {
    warnings.push(
      `Most German rental companies will not hand over a car below ${RENTAL_MIN_AGE}, and a young-driver surcharge usually applies under ${RENTAL_SURCHARGE_UNDER_AGE}. That is company policy, not the law.`,
    );
  } else if (age < RENTAL_SURCHARGE_UNDER_AGE) {
    warnings.push(
      `Expect a young-driver surcharge at the rental desk below age ${RENTAL_SURCHARGE_UNDER_AGE}.`,
    );
  }

  const checklist = [
    "Your original national driving licence - an IDP is never valid on its own",
    "Passport or national ID card",
    "Vehicle registration document and proof of insurance (green card or equivalent)",
    "A green Feinstaubplakette on the windscreen if you will enter an Umweltzone - foreign-registered cars need one too",
    "Warning triangle, first-aid kit and a high-visibility vest, all required in the vehicle",
  ];
  if (verdict === "required" || verdict === "satisfied" || verdict === "recommended") {
    checklist.unshift(
      holdsSworn
        ? "The sworn German translation of your licence"
        : "Your International Driving Permit, issued in the country that issued your licence",
    );
  }
  if (verdict === "translation-required") {
    checklist.unshift("A sworn German translation from ADAC, AvD, a consulate or a sworn translator");
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
      "Sections 7, 28 and 29 Fahrerlaubnis-Verordnung (FeV); 1949 Geneva and 1968 Vienna Conventions on Road Traffic",
  };
}
