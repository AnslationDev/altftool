/**
 * IDP requirement checker for Italy.
 *
 * An International Driving Permit is not a licence. It is the standard
 * multilingual translation of a national licence, issued under the 1949 Geneva
 * Convention or the 1968 Vienna Convention on Road Traffic, and it is only ever
 * valid when shown with the national licence it translates. Italy is a
 * contracting party to both conventions, so either booklet is accepted.
 *
 * The Italian rules that decide the answer:
 *
 *  - Codice della Strada (D.Lgs. 285/1992) Article 135 lets the holder of a
 *    licence issued outside the EU and EEA drive in Italy provided the licence
 *    is accompanied by an International Driving Permit or by a sworn Italian
 *    translation (traduzione giurata) certified by the issuing state's
 *    diplomatic mission or produced through an Italian court.
 *  - Codice della Strada Article 136 makes a non-EU licence unusable in Italy
 *    once the holder has held residenza anagrafica - registered residence in an
 *    Italian comune - for more than one year. After that the licence has to be
 *    converted, where a reciprocity agreement exists, or the holder has to sit
 *    the Italian theory and practical exams.
 *  - EU and EEA licences are recognised in their own right and need no
 *    translation and no permit; a resident may keep using one until it expires
 *    and then convert it.
 *  - Category B, the ordinary car licence, starts at 18 in Italy.
 *  - Conversion is only available where Italy has a reciprocity agreement with
 *    the issuing state. There is no such agreement with the United States,
 *    Australia, China or India, so residents from those countries have to pass
 *    the Italian exams however long they have been driving.
 *
 * Informational only, not legal advice. Reciprocity lists and procedures
 * change - confirm your own case with the Motorizzazione Civile, your comune or
 * your embassy.
 */

export const COUNTRY_NAME = "Italy";
export const DRIVES_ON = "right";

/** Codice della Strada: ordinary category B minimum age. */
export const MINIMUM_CAR_AGE = 18;
/** Commercial hire-desk practice, not law. */
export const RENTAL_MIN_AGE = 21;
export const RENTAL_SURCHARGE_UNDER_AGE = 25;

/** Article 136: a non-EU licence dies one year after residenza anagrafica. */
export const RESIDENT_VALIDITY_MONTHS = 12;

/** Both conventions are in force for Italy. */
export const ACCEPTED_IDP_FORMATS = ["geneva-1949", "vienna-1968"];

export const MS_PER_DAY = 86400000;
const MAX_STAY_DAYS = 3650;

/** A stay longer than this is treated as settling rather than visiting. */
export const LONG_VISIT_DAYS = 90;

/** Winter-equipment obligation window on roads carrying the obbligo sign. */
export const WINTER_TYRE_WINDOW = "15 November to 15 April";

/**
 * How Italy treats each family of issuing country.
 *  "eu"          - recognised outright, no permit, no time limit while valid
 *  "recognised"  - accepted without an IDP by agreement, or because the licence
 *                  already carries Italian text
 *  "translation" - Article 135 requires an IDP or a sworn Italian translation
 *  "sworn-only"  - the issuing state is in neither convention, so no valid IDP
 *                  exists and only a sworn translation will do
 *
 * `convertible` records whether a resident can exchange the licence without
 * sitting the Italian exams.
 */
export const LICENCE_ORIGINS = [
  {
    id: "eu-eea",
    label: "EU or EEA state (includes Iceland, Liechtenstein, Norway)",
    rule: "eu",
    convertible: true,
    note: "An EU or EEA licence is recognised in Italy in its own right. No permit, no translation, and no time limit while the licence itself is valid.",
  },
  {
    id: "italian-text",
    label: "A state that prints the licence in Italian (San Marino, Vatican City)",
    rule: "recognised",
    convertible: true,
    note: "Article 135 asks for a translation because the authorities have to be able to read the licence. One already written in Italian satisfies that.",
  },
  {
    id: "switzerland",
    label: "Switzerland",
    rule: "recognised",
    convertible: true,
    note: "The Swiss credit-card licence carries Italian among its printed languages, and Italy and Switzerland have a licence-conversion agreement, so nothing extra is asked for.",
  },
  {
    id: "uk",
    label: "United Kingdom",
    rule: "recognised",
    convertible: true,
    note: "UK photocard licences are accepted in Italy for visits without an International Driving Permit, and since the December 2023 UK-Italy agreement a UK licence holder who becomes resident can exchange it without taking a test.",
  },
  {
    id: "usa",
    label: "United States",
    rule: "translation",
    convertible: false,
    note: "US state licences are in English only, so Article 135 requires an IDP or a sworn Italian translation. Italy has no conversion agreement with the United States, so a resident must pass the Italian theory and practical exams.",
  },
  {
    id: "canada",
    label: "Canada",
    rule: "translation",
    convertible: true,
    note: "A provincial licence needs an IDP or a sworn translation. Italy has conversion arrangements with several Canadian provinces, so check whether yours is covered before assuming an exam is unavoidable.",
  },
  {
    id: "australia",
    label: "Australia",
    rule: "translation",
    convertible: false,
    note: "Australia is a 1949 Geneva party and the state motoring clubs issue the permit. There is no Italy-Australia conversion agreement, so residents sit the Italian exams.",
  },
  {
    id: "new-zealand",
    label: "New Zealand",
    rule: "translation",
    convertible: false,
    note: "The New Zealand AA issues a 1949 Geneva permit. Without a conversion agreement, a resident has to take the Italian exams.",
  },
  {
    id: "japan",
    label: "Japan",
    rule: "translation",
    convertible: true,
    note: "A Japanese licence is printed in Japanese script, so the permit or translation is essential. Italy and Japan do have a conversion agreement for residents.",
  },
  {
    id: "south-korea",
    label: "South Korea",
    rule: "translation",
    convertible: true,
    note: "Korea is a 1949 Geneva party and Italy has a conversion agreement with it, so a resident can exchange rather than re-test.",
  },
  {
    id: "india",
    label: "India",
    rule: "translation",
    convertible: false,
    note: "Indian licences are printed in English, not Italian, so Article 135 still bites. Your RTO issues a 1949 Geneva permit under Form 4A. There is no India-Italy conversion agreement.",
  },
  {
    id: "other-latin",
    label: "Other non-EU state, licence in Latin script but not in Italian",
    rule: "translation",
    convertible: null,
    note: "Latin script is not the test. Article 135 asks for an IDP or a sworn Italian translation whenever the licence is not an EU or EEA one.",
  },
  {
    id: "non-latin",
    label: "Any state whose licence is not printed in Latin script",
    rule: "translation",
    convertible: null,
    note: "A licence in Arabic, Cyrillic, Chinese or Thai script cannot be read at a roadside check in Italy without the accompanying permit or translation.",
  },
  {
    id: "no-convention",
    label: "State that has joined neither road-traffic convention",
    rule: "sworn-only",
    convertible: null,
    note: "No recognised International Driving Permit exists for such a licence, so you need a sworn Italian translation legalised by the issuing state's consulate in Italy.",
  },
];

export const IDP_HELD_OPTIONS = [
  { id: "none", label: "No IDP" },
  { id: "geneva-1949", label: "1949 Geneva Convention IDP (valid 1 year)" },
  { id: "vienna-1968", label: "1968 Vienna Convention IDP (valid up to 3 years)" },
  { id: "both", label: "Both formats" },
  { id: "sworn-translation", label: "Sworn Italian translation instead of an IDP" },
];

export const STAY_PURPOSES = [
  { id: "visit", label: "Short visit - holiday or business trip" },
  { id: "residence", label: "Registering residenza anagrafica in an Italian comune" },
];

export const VERDICTS = {
  "not-permitted": { label: "You may not drive", tone: "danger" },
  required: { label: "IDP required", tone: "danger" },
  "translation-required": { label: "Sworn translation required", tone: "danger" },
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

function idpCovers(idpHeld) {
  if (idpHeld === "both") return true;
  return ACCEPTED_IDP_FORMATS.includes(idpHeld);
}

/**
 * Decide whether an IDP is expected in Italy for one traveller.
 *
 * @param {object} input
 * @param {string} input.licenceOrigin   id from LICENCE_ORIGINS
 * @param {string} input.idpHeld         id from IDP_HELD_OPTIONS
 * @param {string} input.arrivalDate     YYYY-MM-DD, date of entry into Italy
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
  const origin = LICENCE_ORIGINS.find((entry) => entry.id === licenceOrigin);
  if (!origin) return { error: "Choose the country that issued your driving licence." };

  const idp = IDP_HELD_OPTIONS.find((entry) => entry.id === idpHeld);
  if (!idp) return { error: "Choose which permit or translation you already hold." };

  const purpose = STAY_PURPOSES.find((entry) => entry.id === stayPurpose);
  if (!purpose) return { error: "Choose whether this is a short visit or a move to Italy." };

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
    reason = `Category B, the ordinary car licence, starts at ${MINIMUM_CAR_AGE} in Italy, and a foreign licence issued earlier does not lower that. At ${age} you cannot drive a car in ${COUNTRY_NAME} on any licence or permit.`;
  } else if (origin.rule === "eu") {
    verdict = "not-required";
    reason =
      "An EU or EEA licence is recognised in Italy in its own right. No International Driving Permit, no translation, and no time limit while the licence itself stays valid.";
  } else if (origin.rule === "recognised") {
    verdict = "recommended";
    reason =
      "Article 135 only bites where the licence cannot be read or is not covered by an arrangement, so no International Driving Permit is legally required in your case. Some hire desks still ask for one and it costs little to carry.";
  } else if (origin.rule === "sworn-only") {
    verdict = holdsSworn ? "satisfied" : "translation-required";
    reason = holdsSworn
      ? "Your issuing state belongs to neither convention, so no International Driving Permit exists for your licence - the sworn Italian translation you hold is exactly what Article 135 asks for."
      : "Your issuing state has joined neither convention, so no valid International Driving Permit exists for your licence. Article 135 still requires a sworn Italian translation, legalised through the issuing state's consulate in Italy.";
  } else if (holdsIdp) {
    verdict = "satisfied";
    reason =
      "Article 135 of the Codice della Strada requires a non-EU licence to be accompanied by an International Driving Permit or a sworn Italian translation, and Italy recognises both the 1949 Geneva and the 1968 Vienna formats. Carry the permit with the original licence - on its own it is worthless.";
  } else if (holdsSworn) {
    verdict = "satisfied";
    reason =
      "Article 135 accepts a sworn Italian translation in place of an International Driving Permit, so what you hold meets the requirement. Carry it with the original licence.";
  } else {
    verdict = "required";
    reason =
      "Your licence was issued outside the EU and EEA, so Article 135 of the Codice della Strada requires an International Driving Permit or a sworn Italian translation alongside it. The permit has to be issued in the country that issued your licence, before you travel.";
  }

  let windowLabel;
  let windowEndDate = null;
  const warnings = [];

  const presumedResident =
    purpose.id === "residence" || (stayDays !== null && stayDays > 365);

  if (origin.rule === "eu") {
    windowLabel = "No expiry while the EU or EEA licence stays valid";
  } else if (presumedResident) {
    windowEndDate = addMonthsISO(arrivalDate, RESIDENT_VALIDITY_MONTHS);
    windowLabel = `Foreign licence usable for ${RESIDENT_VALIDITY_MONTHS} months from registering residence`;
    warnings.push(
      `Article 136 stops a non-EU licence working in Italy once you have held residenza anagrafica for more than ${RESIDENT_VALIDITY_MONTHS} months. The clock runs from the date the comune registers you, not from the date you first arrived, so the date above is an estimate based on your arrival date.`,
    );
    if (origin.convertible === false) {
      warnings.push(
        "Italy has no licence-conversion agreement with your issuing state, so when that year runs out you cannot simply exchange the licence - you have to sit the Italian theory exam and the practical test, usually through a driving school (autoscuola).",
      );
    } else if (origin.convertible === true) {
      warnings.push(
        "Italy has a conversion arrangement covering your issuing state, so you can exchange the licence at the Motorizzazione Civile instead of re-testing. Apply inside the one-year window.",
      );
    } else {
      warnings.push(
        "Whether you can exchange the licence or must re-test depends on whether Italy has a reciprocity agreement with the issuing state. Check the current list with the Motorizzazione Civile before the year runs out.",
      );
    }
  } else {
    windowLabel = "Valid for the whole visit while you are not resident in Italy";
    if (stayDays !== null && stayDays > LONG_VISIT_DAYS) {
      warnings.push(
        `A ${stayDays}-day stay is long enough that the question of residenza anagrafica can be raised. The one-year limit only starts when you actually register with a comune, so keep evidence of your home address abroad.`,
      );
    }
  }

  const daysRemaining = windowEndDate === null ? null : daysBetweenISO(arrivalDate, windowEndDate);

  if (idpHeld === "geneva-1949") {
    warnings.push(
      "A 1949 Geneva permit runs for one year from the date of issue and cannot be renewed from abroad, so check the expiry covers the whole trip.",
    );
  }
  if (age < RENTAL_MIN_AGE) {
    warnings.push(
      `Italian hire desks will not normally release a car below ${RENTAL_MIN_AGE}, and a giovane conducente surcharge applies under ${RENTAL_SURCHARGE_UNDER_AGE}. That is company policy rather than law.`,
    );
  } else if (age < RENTAL_SURCHARGE_UNDER_AGE) {
    warnings.push(
      `Expect a giovane conducente young-driver surcharge at the hire desk below age ${RENTAL_SURCHARGE_UNDER_AGE}.`,
    );
  }
  warnings.push(
    "Almost every Italian historic centre is ringed by a camera-enforced ZTL (zona a traffico limitato). Each pass is a separate fine plus the rental company's admin fee, and tourists routinely collect several in one afternoon.",
  );

  const checklist = [
    "Your original national driving licence - a permit is never valid on its own",
    "Passport or national ID card",
    "Carta di circolazione (vehicle registration) and proof of insurance",
    "A warning triangle, and a reflective vest that must be worn, not just carried, before you step onto the carriageway outside a built-up area",
    `Snow chains or winter tyres from ${WINTER_TYRE_WINDOW} on any road carrying the obbligo catene sign`,
    "Dipped headlights on at all hours outside built-up areas and in every tunnel",
  ];
  if (verdict === "required" || verdict === "satisfied" || verdict === "recommended") {
    checklist.unshift(
      holdsSworn
        ? "The sworn Italian translation of your licence"
        : "Your International Driving Permit, issued in the country that issued your licence",
    );
  }
  if (verdict === "translation-required") {
    checklist.unshift("A sworn Italian translation legalised through your consulate in Italy");
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
    convertible: origin.convertible,
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
      "Codice della Strada (D.Lgs. 285/1992) Articles 135 and 136; 1949 Geneva and 1968 Vienna Conventions on Road Traffic",
  };
}
