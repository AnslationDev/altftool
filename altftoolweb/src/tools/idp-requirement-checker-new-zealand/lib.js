/**
 * IDP requirement checker for New Zealand.
 *
 * An International Driving Permit is not a licence. It is the standard
 * multilingual translation of a national licence, issued under the 1949 Geneva
 * Convention or the 1968 Vienna Convention on Road Traffic, and it is only
 * valid when carried with the licence it translates.
 *
 * What decides the answer in New Zealand:
 *
 *  - The Land Transport (Driver Licensing) Rule 1999 lets a visitor drive on a
 *    valid overseas licence, or an International Driving Permit, for up to 12
 *    months from the date of arrival in New Zealand. The period starts again
 *    each time you arrive in the country, so a trip out and back resets it.
 *  - The overseas licence must be in English. Where it is not, the driver must
 *    carry an accurate English translation - from a translation service the NZ
 *    Transport Agency approves, from the diplomatic mission of the issuing
 *    country, or from the authority that issued the licence - or an
 *    International Driving Permit in place of it.
 *  - You may only drive the classes of vehicle your overseas licence covers.
 *  - After 12 months you must convert to a New Zealand licence. Holders from
 *    countries on the Transport Agency's exempt list convert without sitting
 *    the theory or practical test; everyone else sits both.
 *  - New Zealand drives on the left. The alcohol limit is 250 micrograms per
 *    litre of breath, or 50 milligrams per 100 millilitres of blood, for
 *    drivers aged 20 and over, and zero for anyone under 20.
 *  - The licence must be carried in the vehicle whenever you drive.
 *
 * Informational only, not legal advice. The exempt-country list and translator
 * approvals change - confirm with the NZ Transport Agency before you rely on
 * this.
 */

export const COUNTRY_NAME = "New Zealand";
export const DRIVES_ON = "left";

/** Land Transport (Driver Licensing) Rule 1999: the visitor window. */
export const VISITOR_WINDOW_MONTHS = 12;

/**
 * The rule accepts "an International Driving Permit" without naming a
 * convention, so either booklet works as the translation. At treaty level New
 * Zealand is a party to the 1949 Geneva Convention.
 */
export const ACCEPTED_IDP_FORMATS = ["geneva-1949", "vienna-1968"];

/** Minimum age to drive in New Zealand at all. */
export const MINIMUM_DRIVING_AGE = 16;
/** Commercial hire-desk practice, not law. */
export const RENTAL_MIN_AGE = 21;
export const RENTAL_SURCHARGE_UNDER_AGE = 25;

/** Alcohol limits, Land Transport Act 1998 as amended in 2014. */
export const BREATH_LIMIT_MCG_PER_L = 250;
export const BLOOD_LIMIT_MG_PER_100ML = 50;
export const ZERO_ALCOHOL_UNDER_AGE = 20;

export const MS_PER_DAY = 86400000;
const MAX_STAY_DAYS = 3650;

/**
 * Issuing countries, by the two things New Zealand actually tests: the
 * language of the licence, and whether the country is on the Transport
 * Agency's exempt list for conversion without a test.
 *   language: "english" | "latin" | "non-latin"
 *   exempt:   true | false | null (varies, check the list)
 */
export const LICENCE_ORIGINS = [
  {
    id: "nz",
    label: "New Zealand",
    language: "english",
    convention: "domestic",
    exempt: true,
    note: "A New Zealand licence needs nothing else. An International Driving Permit from the NZ Automobile Association is only for driving overseas.",
  },
  {
    id: "australia",
    label: "Australia",
    language: "english",
    convention: "geneva",
    exempt: true,
    note: "An English-language licence from a country that also drives on the left, and on the exempt list, so conversion after 12 months needs no test.",
  },
  {
    id: "uk-ireland",
    label: "United Kingdom or Ireland",
    language: "english",
    convention: "both",
    exempt: true,
    note: "English-language licences from exempt countries. Nothing extra is needed to drive, and conversion is straightforward.",
  },
  {
    id: "usa-canada",
    label: "United States or Canada",
    language: "english",
    convention: "geneva",
    exempt: true,
    note: "English-language licences on the exempt list. The bigger adjustment is that New Zealand drives on the left.",
  },
  {
    id: "south-africa",
    label: "South Africa or Singapore",
    language: "english",
    convention: "geneva",
    exempt: true,
    note: "English-language licences from countries on the exempt list, and both drive on the left already.",
  },
  {
    id: "india-english",
    label: "India or another English-language licence not on the exempt list",
    language: "english",
    convention: "geneva",
    exempt: false,
    note: "The licence is in English, so no permit or translation is needed to drive. Converting after 12 months, though, means sitting both the theory and the practical test.",
  },
  {
    id: "eu-latin",
    label: "An EU or EEA state, licence in Latin script but not English",
    language: "latin",
    convention: "vienna",
    exempt: true,
    note: "Latin script does not make a licence English. A German, French, Spanish or Italian licence needs an approved English translation or an International Driving Permit alongside it, though most EU states are on the exempt list for conversion.",
  },
  {
    id: "japan",
    label: "Japan",
    language: "non-latin",
    convention: "geneva",
    exempt: true,
    note: "A Japanese licence is in Japanese script, so the permit or a translation is essential. Japan is on the exempt list, so conversion after 12 months needs no test.",
  },
  {
    id: "korea",
    label: "South Korea",
    language: "non-latin",
    convention: "geneva",
    exempt: true,
    note: "Korean licences are in Hangul, so carry the permit or an approved translation. Korea is on the exempt list.",
  },
  {
    id: "china",
    label: "China",
    language: "non-latin",
    convention: "none",
    exempt: false,
    note: "China belongs to neither road-traffic convention, so no valid International Driving Permit exists for a Chinese licence. You need an approved English translation, and conversion means sitting the New Zealand tests.",
  },
  {
    id: "non-latin-geneva",
    label: "Other 1949 Geneva state whose licence is not in Latin script",
    language: "non-latin",
    convention: "geneva",
    exempt: null,
    note: "A licence in Arabic, Cyrillic, Greek or Thai script needs the permit or an approved translation for anyone here to read it.",
  },
  {
    id: "non-latin-vienna",
    label: "A 1968 Vienna state whose licence is not in Latin script",
    language: "non-latin",
    convention: "vienna",
    exempt: null,
    note: "The rule asks for an International Driving Permit without naming a convention, so a 1968 booklet serves as the translation. Carry the original licence with it.",
  },
  {
    id: "no-convention",
    label: "Another state in neither road-traffic convention",
    language: "non-latin",
    convention: "none",
    exempt: false,
    note: "No recognised International Driving Permit exists for such a licence, so an English translation from an approved translator or your country's diplomatic mission is the only route.",
  },
];

export const IDP_HELD_OPTIONS = [
  { id: "none", label: "No IDP or translation" },
  { id: "geneva-1949", label: "1949 Geneva Convention IDP (valid 1 year)" },
  { id: "vienna-1968", label: "1968 Vienna Convention IDP" },
  { id: "both", label: "Both formats" },
  { id: "approved-translation", label: "An approved English translation instead" },
];

export const STAY_PURPOSES = [
  { id: "visit", label: "Visiting - holiday, working holiday or study" },
  { id: "residence", label: "Moving to New Zealand to live or work" },
];

export const VERDICTS = {
  "not-permitted": { label: "You may not drive", tone: "danger" },
  required: { label: "IDP or translation required", tone: "danger" },
  "translation-required": { label: "Approved translation required", tone: "danger" },
  satisfied: { label: "Translation required - and you have it", tone: "success" },
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

function holdsIdp(idpHeld) {
  return idpHeld === "both" || ACCEPTED_IDP_FORMATS.includes(idpHeld);
}

/**
 * Decide whether a permit or translation is expected in New Zealand, and date
 * the 12-month visitor window.
 *
 * @param {object} input
 * @param {string} input.licenceOrigin   id from LICENCE_ORIGINS
 * @param {string} input.idpHeld         id from IDP_HELD_OPTIONS
 * @param {string} input.arrivalDate     YYYY-MM-DD, most recent arrival in NZ
 * @param {string} [input.departureDate] YYYY-MM-DD, optional planned exit
 * @param {number} input.ageYears        driver's age in whole years
 * @param {string} input.stayPurpose     id from STAY_PURPOSES
 * @returns {object} verdict object, or { error }
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
  if (!purpose) return { error: "Choose whether you are visiting or moving to New Zealand." };

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

  const englishLicence = origin.language === "english";
  const hasIdp = holdsIdp(idpHeld);
  const hasTranslation = idpHeld === "approved-translation";

  let verdict;
  let reason;

  if (age < MINIMUM_DRIVING_AGE) {
    verdict = "not-permitted";
    reason = `The minimum age to drive in New Zealand is ${MINIMUM_DRIVING_AGE}, and an overseas licence issued earlier does not lower it. At ${age} you cannot drive in ${COUNTRY_NAME}.`;
  } else if (origin.convention === "domestic") {
    verdict = "not-required";
    reason =
      "A New Zealand licence needs nothing else. An International Driving Permit from the NZ Automobile Association is only for driving overseas.";
  } else if (englishLicence) {
    verdict = "not-required";
    reason =
      "Your licence is already in English, which is what the Land Transport (Driver Licensing) Rule asks for. No permit and no translation is required. Carry the licence itself in the vehicle at all times - that part is compulsory here.";
  } else if (origin.convention === "none") {
    verdict = hasTranslation ? "satisfied" : "translation-required";
    reason = hasTranslation
      ? "No International Driving Permit exists for a licence from a state outside both conventions, so the approved English translation you hold is the document the rule asks for. Carry it with the original licence."
      : "Your issuing state has joined neither road-traffic convention, so no valid International Driving Permit exists for your licence. You need an accurate English translation from a translation service the NZ Transport Agency approves, from your country's diplomatic mission here, or from the authority that issued the licence.";
  } else if (hasIdp || hasTranslation) {
    verdict = "satisfied";
    reason = hasTranslation
      ? "Your licence is not in English, and the rule accepts an approved English translation in place of an International Driving Permit. Carry it with the original licence - neither is valid alone."
      : "Your licence is not in English, and the Land Transport (Driver Licensing) Rule accepts an International Driving Permit as the translation. Carry it with the original licence; the permit alone is not a licence and you must have both in the vehicle.";
  } else {
    verdict = "required";
    reason =
      "Your licence is not in English, so you must carry either an accurate English translation - from an NZ Transport Agency approved translator, your country's diplomatic mission, or the issuing authority - or an International Driving Permit alongside the licence. The permit has to be issued at home before you travel.";
  }

  const warnings = [];
  let windowLabel;
  let windowEndDate = null;

  if (origin.convention === "domestic") {
    windowLabel = "No limit - you hold a New Zealand licence";
  } else {
    windowEndDate = addMonthsISO(arrivalDate, VISITOR_WINDOW_MONTHS);
    windowLabel = `${VISITOR_WINDOW_MONTHS} months from the date you last arrived`;
    warnings.push(
      `The ${VISITOR_WINDOW_MONTHS}-month window runs from the date you last arrived in New Zealand, and it starts again each time you arrive - so a trip to Australia and back resets it. What it does not do is stack: you cannot bank unused months.`,
    );
    if (stayDays !== null && stayDays > 365) {
      warnings.push(
        `A ${stayDays}-day continuous stay runs past the ${VISITOR_WINDOW_MONTHS}-month window, so plan to convert to a New Zealand licence during the trip.`,
      );
    }
  }

  const daysRemaining = windowEndDate === null ? null : daysBetweenISO(arrivalDate, windowEndDate);

  if (purpose.id === "residence" && origin.convention !== "domestic") {
    if (origin.exempt === true) {
      warnings.push(
        "Your country is on the Transport Agency's exempt list, so converting to a New Zealand licence needs an application, an eyesight check and the fee - no theory test and no practical test.",
      );
    } else if (origin.exempt === false) {
      warnings.push(
        "Your country is not on the Transport Agency's exempt list, so converting means sitting both the theory test and a practical driving test, however long you have held the overseas licence. Book early - practical test slots are often weeks out.",
      );
    } else {
      warnings.push(
        "Whether you convert without a test depends on the Transport Agency's exempt-country list. Check it before assuming either way, because the difference is two tests.",
      );
    }
  }

  if (idpHeld === "geneva-1949") {
    warnings.push(
      "A 1949 Geneva permit runs for one year from the date of issue and cannot be renewed from abroad, so make sure the expiry outlasts your trip.",
    );
  }
  if (origin.convention !== "domestic") {
    warnings.push(
      "New Zealand drives on the left, with the steering wheel on the right. Rural roads are narrow, winding and mostly single carriageway, and the driving times on maps are optimistic - budget more than the distance suggests.",
    );
    warnings.push(
      `The alcohol limit is ${BREATH_LIMIT_MCG_PER_L} micrograms per litre of breath, or ${BLOOD_LIMIT_MG_PER_100ML} milligrams per 100 millilitres of blood, for drivers aged ${ZERO_ALCOHOL_UNDER_AGE} and over. Under ${ZERO_ALCOHOL_UNDER_AGE} the limit is zero.`,
    );
    warnings.push(
      "You may only drive the classes of vehicle your overseas licence actually covers. A car licence does not let you hire a campervan above its weight class.",
    );
  }
  if (age < RENTAL_MIN_AGE) {
    warnings.push(
      `New Zealand rental companies will not normally release a car below ${RENTAL_MIN_AGE}, and a young-driver surcharge applies under ${RENTAL_SURCHARGE_UNDER_AGE}. That is company policy rather than law.`,
    );
  } else if (age < RENTAL_SURCHARGE_UNDER_AGE) {
    warnings.push(
      `Expect a young-driver surcharge at the hire desk below age ${RENTAL_SURCHARGE_UNDER_AGE}.`,
    );
  }

  const checklist = [
    "Your original overseas driving licence - it must be in the vehicle whenever you drive",
    "Passport, with the arrival stamp or electronic record that dates your 12-month window",
    "The rental agreement or proof of insurance",
    "A plan for fuel and phone coverage on rural roads, where both run out sooner than you expect",
  ];
  if (verdict === "required" || verdict === "satisfied") {
    checklist.unshift(
      hasTranslation && !hasIdp
        ? "Your approved English translation of the licence"
        : "Your International Driving Permit, issued in the country that issued your licence",
    );
  }
  if (verdict === "translation-required") {
    checklist.unshift("An English translation from an NZ Transport Agency approved translator");
  }

  return {
    verdict,
    verdictLabel: VERDICTS[verdict].label,
    tone: verdict === "not-required" || verdict === "satisfied" ? "success" : "danger",
    reason,
    country: COUNTRY_NAME,
    drivesOn: DRIVES_ON,
    originLabel: origin.label,
    originNote: origin.note,
    exempt: origin.exempt,
    idpLabel: idp.label,
    acceptedFormats: "Either format, as the English translation",
    minimumAge: MINIMUM_DRIVING_AGE,
    ageOk: age >= MINIMUM_DRIVING_AGE,
    breathLimit: BREATH_LIMIT_MCG_PER_L,
    bloodLimit: BLOOD_LIMIT_MG_PER_100ML,
    stayDays,
    windowLabel,
    windowEndDate,
    daysRemaining,
    warnings,
    checklist,
    legalBasis:
      "Land Transport (Driver Licensing) Rule 1999; Land Transport Act 1998; 1949 Geneva Convention on Road Traffic",
  };
}
