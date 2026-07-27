/**
 * IDP requirement checker for Canada.
 *
 * An International Driving Permit is not a licence. It is the standard
 * multilingual translation of a national licence, issued under the 1949 Geneva
 * Convention or the 1968 Vienna Convention on Road Traffic, and it is only ever
 * valid when carried with the licence it translates. Critically, an IDP does
 * not extend how long you may drive in Canada on a foreign licence - it only
 * makes that licence readable.
 *
 * What decides the answer in Canada:
 *
 *  - Driver licensing is provincial and territorial, not federal, so both the
 *    permit question and the deadline change with the province.
 *  - Canada is a contracting party to the 1949 Geneva Convention on Road
 *    Traffic and is NOT a party to the 1968 Vienna Convention. A visitor whose
 *    country belongs only to the Vienna Convention should ask for the 1949
 *    Geneva booklet, which most licensing authorities can still issue.
 *  - Canada's two official languages are English and French. A licence printed
 *    in either can be read at a roadside stop and needs nothing extra. A
 *    licence in any other language is expected to be accompanied by an
 *    International Driving Permit, or a certified English or French
 *    translation, in every province.
 *  - Each province caps how long a foreign licence may be used before the
 *    provincial licence becomes compulsory: Ontario allows 60 days, Alberta,
 *    Manitoba, Nova Scotia and Saskatchewan around 90, and British Columbia
 *    and Quebec around six months.
 *  - Provinces hold licence-exchange agreements with a long list of countries,
 *    so many new residents can swap without a road test. The lists differ by
 *    province and are revised.
 *
 * Informational only, not legal advice. Provincial deadlines and exchange
 * lists change - confirm with the provincial licensing body before you rely on
 * this.
 */

export const COUNTRY_NAME = "Canada";
export const DRIVES_ON = "right";

/** The only convention Canada has ratified. */
export const ACCEPTED_IDP_FORMATS = ["geneva-1949"];

/** Languages a Canadian officer or hire clerk can read without a translation. */
export const OFFICIAL_LANGUAGES = ["english", "french"];

/**
 * Lowest age at which any province issues a car licence (a learner permit in
 * the prairie provinces). A visitor has to meet the minimum where they drive.
 */
export const LOWEST_PROVINCE_DRIVING_AGE = 16;
/** Commercial hire-desk practice, not law. */
export const RENTAL_MIN_AGE = 21;
export const RENTAL_SURCHARGE_UNDER_AGE = 25;

/** A 1949 Geneva permit runs one year from the date of issue. */
export const GENEVA_IDP_VALID_MONTHS = 12;

export const MS_PER_DAY = 86400000;
const MAX_STAY_DAYS = 3650;

/**
 * Provinces, with the number of days a foreign licence may be used before the
 * provincial licence becomes compulsory, and any winter-equipment obligation.
 */
export const PROVINCES = [
  {
    id: "other",
    label: "Somewhere else in Canada",
    foreignLicenceDays: null,
    note: "Most provinces and territories allow between 60 and 180 days on a foreign licence. Check the licensing body where you will actually be driving.",
  },
  {
    id: "ontario",
    label: "Ontario",
    foreignLicenceDays: 60,
    note: "Ontario allows a valid licence from another province, state or country to be used for 60 days - the shortest window in the country, and the one visitors most often overshoot.",
  },
  {
    id: "quebec",
    label: "Quebec",
    foreignLicenceDays: 180,
    winterTyres: "1 December to 15 March",
    note: "Quebec allows about six months on a foreign licence. Section 440.1 of the Highway Safety Code also makes winter tyres compulsory on every passenger vehicle from 1 December to 15 March, including rentals.",
  },
  {
    id: "british-columbia",
    label: "British Columbia",
    foreignLicenceDays: 180,
    winterTyres: "1 October to 30 April on designated highways",
    note: "A visitor may use a foreign licence for about six months; a new resident has 90 days to obtain a BC licence. Winter or M+S tyres are required on designated highways from 1 October to 30 April.",
  },
  {
    id: "alberta",
    label: "Alberta",
    foreignLicenceDays: 90,
    note: "Alberta gives a new resident 90 days to obtain an Alberta licence.",
  },
  {
    id: "manitoba",
    label: "Manitoba",
    foreignLicenceDays: 90,
    note: "Manitoba gives a new resident about three months before the Manitoba licence becomes compulsory.",
  },
  {
    id: "saskatchewan",
    label: "Saskatchewan",
    foreignLicenceDays: 90,
    note: "Saskatchewan gives a new resident 90 days to obtain a Saskatchewan licence.",
  },
  {
    id: "nova-scotia",
    label: "Nova Scotia",
    foreignLicenceDays: 90,
    note: "Nova Scotia gives a new resident 90 days to obtain a Nova Scotia licence.",
  },
];

/**
 * Issuing countries, described by the two things that matter in Canada: the
 * language the licence is printed in and which convention the issuer belongs
 * to.
 *   language:   "english" | "french" | "latin" | "non-latin"
 *   convention: "domestic" | "geneva" | "vienna" | "both" | "none"
 */
export const LICENCE_ORIGINS = [
  {
    id: "canadian",
    label: "A Canadian province or territory",
    language: "english",
    convention: "domestic",
    note: "A provincial licence is valid across Canada. Nothing else is needed.",
  },
  {
    id: "usa",
    label: "United States",
    language: "english",
    convention: "geneva",
    note: "US state licences are recognised for visitors everywhere in Canada, and every province holds an exchange agreement with the states, so a new resident swaps without a road test.",
  },
  {
    id: "uk-ireland",
    label: "United Kingdom or Ireland",
    language: "english",
    convention: "both",
    note: "An English-language licence from a convention state. Nothing extra is needed to visit, and most provinces will exchange it for a full licence without a road test.",
  },
  {
    id: "australia-nz",
    label: "Australia or New Zealand",
    language: "english",
    convention: "geneva",
    note: "English-language licences from 1949 Geneva parties, and both countries appear on most provincial exchange lists.",
  },
  {
    id: "india-english",
    label: "India, South Africa, Singapore or another English-language licence",
    language: "english",
    convention: "geneva",
    note: "Because the licence is already in English, the translation reason for a permit falls away. Whether it can be exchanged for a provincial licence is a separate question and varies by province.",
  },
  {
    id: "france-belgium",
    label: "France, Belgium or another French-language licence",
    language: "french",
    convention: "vienna",
    note: "French is one of Canada's two official languages, so a French-language licence is readable as it stands. Quebec in particular has long-standing exchange agreements with France and Belgium.",
  },
  {
    id: "eu-latin",
    label: "An EU or EEA state, licence in Latin script but not English or French",
    language: "latin",
    convention: "vienna",
    note: "Latin script is not the test - the licence has to be readable in English or French. Ask for the 1949 Geneva permit format, since Canada never joined the 1968 Vienna Convention.",
  },
  {
    id: "latin-geneva",
    label: "Other 1949 Geneva state, licence in Latin script but not English or French",
    language: "latin",
    convention: "geneva",
    note: "Your permit is the format Canada actually recognises, and it removes any argument at a hire desk.",
  },
  {
    id: "japan",
    label: "Japan",
    language: "non-latin",
    convention: "geneva",
    note: "A Japanese licence is in Japanese script and cannot be read at a Canadian roadside stop. Prefectural police issue the 1949 Geneva permit, and several provinces will exchange a Japanese licence for a full one.",
  },
  {
    id: "korea",
    label: "South Korea",
    language: "non-latin",
    convention: "geneva",
    note: "Korea is a 1949 Geneva party and appears on most provincial exchange lists, but the licence itself is in Hangul, so the permit is what makes it usable on arrival.",
  },
  {
    id: "non-latin-geneva",
    label: "Other 1949 Geneva state whose licence is not in Latin script",
    language: "non-latin",
    convention: "geneva",
    note: "A licence in Arabic, Cyrillic, Greek, Chinese or Thai script needs the permit alongside it for anyone in Canada to read.",
  },
  {
    id: "non-latin-vienna",
    label: "A 1968 Vienna state whose licence is not in Latin script",
    language: "non-latin",
    convention: "vienna",
    note: "Canada is not a 1968 Vienna party, so ask specifically for the 1949 Geneva booklet. Many authorities issue both formats from the same counter.",
  },
  {
    id: "no-convention",
    label: "A state in neither road-traffic convention",
    language: "non-latin",
    convention: "none",
    note: "No recognised International Driving Permit exists for such a licence, so a certified English or French translation is the substitute, and some rental companies will still decline.",
  },
];

export const IDP_HELD_OPTIONS = [
  { id: "none", label: "No IDP" },
  { id: "geneva-1949", label: "1949 Geneva Convention IDP (valid 1 year)" },
  { id: "vienna-1968", label: "1968 Vienna Convention IDP only" },
  { id: "both", label: "Both formats" },
  { id: "certified-translation", label: "A certified English or French translation instead" },
];

export const STAY_PURPOSES = [
  { id: "visit", label: "Visiting - holiday, business trip or study" },
  { id: "residence", label: "Moving to Canada to live or work" },
];

export const VERDICTS = {
  "not-permitted": { label: "You may not drive", tone: "danger" },
  required: { label: "IDP required", tone: "danger" },
  "translation-required": { label: "Certified translation required", tone: "danger" },
  satisfied: { label: "IDP expected - and you have it", tone: "success" },
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

export function addDaysISO(iso, days) {
  const stamp = parseISODate(iso);
  if (stamp === null) return null;
  return toISODate(stamp + days * MS_PER_DAY);
}

export function daysBetweenISO(fromISO, toISO) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  if (from === null || to === null) return null;
  return Math.round((to - from) / MS_PER_DAY);
}

function holdsGeneva(idpHeld) {
  return idpHeld === "both" || ACCEPTED_IDP_FORMATS.includes(idpHeld);
}

/**
 * Decide whether an International Driving Permit is expected in Canada.
 *
 * @param {object} input
 * @param {string} input.licenceOrigin   id from LICENCE_ORIGINS
 * @param {string} input.idpHeld         id from IDP_HELD_OPTIONS
 * @param {string} input.provinceId      id from PROVINCES
 * @param {string} input.arrivalDate     YYYY-MM-DD, date of entry
 * @param {string} [input.departureDate] YYYY-MM-DD, optional planned exit
 * @param {number} input.ageYears        driver's age in whole years
 * @param {string} input.stayPurpose     id from STAY_PURPOSES
 * @returns {object} verdict object, or { error }
 */
export function checkIdpRequirement({
  licenceOrigin,
  idpHeld,
  provinceId,
  arrivalDate,
  departureDate,
  ageYears,
  stayPurpose,
} = {}) {
  const origin = LICENCE_ORIGINS.find((entry) => entry.id === licenceOrigin);
  if (!origin) return { error: "Choose the country that issued your driving licence." };

  const idp = IDP_HELD_OPTIONS.find((entry) => entry.id === idpHeld);
  if (!idp) return { error: "Choose which permit or translation you already hold." };

  const province = PROVINCES.find((entry) => entry.id === provinceId);
  if (!province) return { error: "Choose the province you will be driving in." };

  const purpose = STAY_PURPOSES.find((entry) => entry.id === stayPurpose);
  if (!purpose) return { error: "Choose whether you are visiting or moving to Canada." };

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

  const readable = OFFICIAL_LANGUAGES.includes(origin.language);
  const holdsTranslation = idpHeld === "certified-translation";
  const hasGeneva = holdsGeneva(idpHeld);

  let verdict;
  let reason;

  if (age < LOWEST_PROVINCE_DRIVING_AGE) {
    verdict = "not-permitted";
    reason = `No province issues a car licence below ${LOWEST_PROVINCE_DRIVING_AGE}, and a foreign licence issued earlier does not override the provincial minimum. At ${age} you cannot drive in ${COUNTRY_NAME}.`;
  } else if (origin.convention === "domestic") {
    verdict = "not-required";
    reason =
      "A Canadian provincial or territorial licence is valid across the country. An International Driving Permit is only for driving outside Canada.";
  } else if (readable) {
    verdict = "not-required";
    reason =
      "Your licence is printed in one of Canada's two official languages, so there is nothing for an International Driving Permit to translate. No province requires one from you as a visitor - carry the original licence and your passport.";
  } else if (origin.convention === "none") {
    verdict = holdsTranslation ? "satisfied" : "translation-required";
    reason = holdsTranslation
      ? "Your issuing state belongs to neither convention, so no International Driving Permit exists for your licence. The certified translation you hold is the substitute Canadian authorities and rental companies will look for."
      : "Your issuing state has joined neither road-traffic convention, so no valid International Driving Permit exists for your licence. Get a certified English or French translation, and expect some rental companies to decline anyway.";
  } else if (hasGeneva) {
    verdict = "satisfied";
    reason =
      "You hold the 1949 Geneva permit, which is the format Canada recognises. Carry it with the original licence - the permit is worthless on its own, and it does not extend how long you may drive on the foreign licence.";
  } else if (idpHeld === "vienna-1968") {
    verdict = "required";
    reason =
      "Canada ratified the 1949 Geneva Convention and never joined the 1968 Vienna Convention, so your Vienna permit rests on no treaty here. Ask your licensing authority for the Geneva format - most issue both from the same counter.";
  } else if (holdsTranslation) {
    verdict = "recommended";
    reason =
      "A certified English or French translation solves the practical problem. An International Driving Permit does the same job in a form every Canadian hire desk recognises instantly, so it is worth having as well.";
  } else {
    verdict = "required";
    reason =
      "Your licence is not printed in English or French, so nobody at a Canadian roadside stop or rental counter can read it. Carry a 1949 Geneva International Driving Permit, obtained at home before you travel - no Canadian body can issue one against a foreign licence.";
  }

  const warnings = [];
  let windowLabel;
  let windowEndDate = null;

  if (origin.convention === "domestic") {
    windowLabel = "No limit - you hold a Canadian licence";
  } else if (province.foreignLicenceDays === null) {
    windowLabel = "Set by the province, commonly 60 to 180 days";
    warnings.push(
      "Each province caps how long a foreign licence may be used, generally between 60 and 180 days. Look up the figure for the province you will actually be in before it expires.",
    );
  } else {
    windowEndDate = addDaysISO(arrivalDate, province.foreignLicenceDays);
    windowLabel = `${province.foreignLicenceDays} days in ${province.label}`;
    warnings.push(
      `${province.label} allows a foreign licence to be used for ${province.foreignLicenceDays} days. An International Driving Permit does not extend that window - it only makes the licence readable.`,
    );
    if (stayDays !== null && stayDays > province.foreignLicenceDays) {
      warnings.push(
        `Your ${stayDays}-day stay is longer than the ${province.foreignLicenceDays}-day window, so plan to apply for a ${province.label} licence during the trip.`,
      );
    }
  }

  const daysRemaining = windowEndDate === null ? null : daysBetweenISO(arrivalDate, windowEndDate);

  if (purpose.id === "residence") {
    warnings.push(
      `Provinces hold licence-exchange agreements with a long list of countries, so many new residents swap without a road test. ${province.label === "Somewhere else in Canada" ? "Check the list for your province" : `Check the ${province.label} list`} before booking a test you may not need.`,
    );
  }
  if (origin.convention === "vienna" && !hasGeneva && !readable) {
    warnings.push(
      "Your country is a 1968 Vienna party. Canada only ratified the 1949 Geneva Convention, so ask specifically for the Geneva booklet - the two look similar but hire desks check the cover.",
    );
  }
  if (hasGeneva) {
    warnings.push(
      `A 1949 Geneva permit runs for ${GENEVA_IDP_VALID_MONTHS} months from the date of issue and cannot be renewed from abroad, so check the expiry covers the whole trip.`,
    );
  }
  if (province.winterTyres) {
    warnings.push(
      `${province.label} requires winter tyres from ${province.winterTyres}. Confirm the rental car is fitted with them rather than assuming - the obligation follows the vehicle, not the driver.`,
    );
  }
  if (age < RENTAL_MIN_AGE) {
    warnings.push(
      `Canadian rental companies will not normally release a car below ${RENTAL_MIN_AGE}, and a young-driver surcharge applies under ${RENTAL_SURCHARGE_UNDER_AGE}. That is company policy rather than law.`,
    );
  } else if (age < RENTAL_SURCHARGE_UNDER_AGE) {
    warnings.push(
      `Expect a young-driver surcharge at the hire desk below age ${RENTAL_SURCHARGE_UNDER_AGE}.`,
    );
  }

  const checklist = [
    "Your original national driving licence - a permit is never valid on its own",
    "Passport, and your visitor record, study permit or work permit if you have one",
    "Proof of insurance, or the rental agreement",
    "The vehicle registration or ownership permit",
    "In winter, a scraper, a blanket and a charged phone - distances between services are long",
  ];
  if (verdict === "required" || verdict === "satisfied" || verdict === "recommended") {
    checklist.unshift(
      holdsTranslation && !hasGeneva
        ? "The certified English or French translation of your licence"
        : "Your International Driving Permit in the 1949 Geneva format, issued at home",
    );
  }
  if (verdict === "translation-required") {
    checklist.unshift("A certified English or French translation of your licence");
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
    provinceLabel: province.label,
    provinceNote: province.note,
    idpLabel: idp.label,
    acceptedFormats: "1949 Geneva only",
    minimumAge: LOWEST_PROVINCE_DRIVING_AGE,
    ageOk: age >= LOWEST_PROVINCE_DRIVING_AGE,
    stayDays,
    windowLabel,
    windowEndDate,
    daysRemaining,
    readableLicence: readable,
    warnings,
    checklist,
    legalBasis:
      "1949 Geneva Convention on Road Traffic; provincial highway traffic legislation, including Quebec's Highway Safety Code section 440.1 on winter tyres",
  };
}
