/**
 * IDP requirement checker for the United States.
 *
 * An International Driving Permit is not a licence. It is the standard
 * multilingual translation of a national licence, issued under the 1949 Geneva
 * Convention or the 1968 Vienna Convention on Road Traffic, and it is only ever
 * valid when carried with the licence it translates.
 *
 * What decides the answer in the United States:
 *
 *  - There is no federal driving licence and no federal statute requiring an
 *    International Driving Permit. Driver licensing is state law, so the answer
 *    changes with the state you drive in.
 *  - The United States is a contracting party to the 1949 Geneva Convention on
 *    Road Traffic and is NOT a party to the 1968 Vienna Convention. Article 24
 *    of the Geneva Convention obliges the United States to recognise a valid
 *    domestic driving permit, or an International Driving Permit, issued by
 *    another contracting state to a visitor. A traveller from a country that
 *    belongs only to the 1968 Vienna Convention should therefore ask for the
 *    1949 Geneva booklet, which most licensing authorities can still issue.
 *  - Every state lets a genuine non-resident visitor drive on a valid foreign
 *    licence. Where the licence is not written in English, several states -
 *    Georgia and Michigan are the two that publish the requirement most plainly
 *    - expect an International Driving Permit alongside it, and essentially
 *    every rental company does.
 *  - Once you become a resident of a state you must obtain that state's licence
 *    within a deadline set by state law. California Vehicle Code section 12505
 *    gives 10 days; several states give 30 and several give 90.
 *  - An IDP must be issued in the country that issued your licence, before you
 *    travel. In the United States only AAA and AATA are authorised to issue
 *    them, and only to holders of a US state licence.
 *
 * Informational only, not legal advice. State deadlines and DMV practice
 * change - confirm with the state's motor vehicle agency before you rely on it.
 */

export const COUNTRY_NAME = "USA";
export const COUNTRY_LONG_NAME = "the United States";
export const DRIVES_ON = "right";

/** The only convention the United States has ratified. */
export const ACCEPTED_IDP_FORMATS = ["geneva-1949"];

/**
 * Lowest age at which any US state issues an unrestricted car licence. Most
 * states reach full unrestricted status between 16 and 18, and a visitor must
 * meet the minimum in the state they drive in.
 */
export const LOWEST_STATE_DRIVING_AGE = 16;
/** Commercial hire-desk practice, not law, in most states. */
export const RENTAL_MIN_AGE = 21;
export const RENTAL_SURCHARGE_UNDER_AGE = 25;
/** New York and Michigan require rental companies to serve drivers from 18. */
export const RENTAL_STATUTORY_MIN_STATES = "New York and Michigan";

export const MS_PER_DAY = 86400000;
const MAX_STAY_DAYS = 3650;

/** A 1949 Geneva permit runs one year from the date of issue. */
export const GENEVA_IDP_VALID_MONTHS = 12;

/**
 * States, with the deadline state law gives a new resident to obtain the local
 * licence, and whether the state publishes a requirement for an International
 * Driving Permit where the foreign licence is not in English.
 * `newResidentDays: 0` means the state expects you to apply immediately.
 */
export const STATES = [
  {
    id: "other",
    label: "Somewhere else, or several states",
    newResidentDays: null,
    idpRequiredForNonEnglish: false,
    note: "Most states give a new resident between 30 and 90 days to change over. Check the motor vehicle agency for the state you actually settle in.",
  },
  {
    id: "california",
    label: "California",
    newResidentDays: 10,
    idpRequiredForNonEnglish: false,
    note: "California Vehicle Code section 12505 gives a new resident 10 days to apply for a California licence - the shortest deadline in the country.",
  },
  {
    id: "florida",
    label: "Florida",
    newResidentDays: 30,
    idpRequiredForNonEnglish: false,
    note: "Florida gives a new resident 30 days. Visitors may use a valid foreign licence, and Florida guidance recommends carrying a translation where the licence is not in English.",
  },
  {
    id: "georgia",
    label: "Georgia",
    newResidentDays: 30,
    idpRequiredForNonEnglish: true,
    note: "Georgia is one of the states that publishes the requirement plainly: a visitor whose licence is not in English is expected to carry an International Driving Permit with it.",
  },
  {
    id: "illinois",
    label: "Illinois",
    newResidentDays: 90,
    idpRequiredForNonEnglish: false,
    note: "Illinois gives a new resident 90 days to obtain an Illinois licence.",
  },
  {
    id: "michigan",
    label: "Michigan",
    newResidentDays: 0,
    idpRequiredForNonEnglish: true,
    note: "Michigan expects a new resident to obtain a Michigan licence immediately, and its guidance requires an International Driving Permit where the foreign licence is not in English.",
  },
  {
    id: "new-york",
    label: "New York",
    newResidentDays: 30,
    idpRequiredForNonEnglish: false,
    note: "New York gives a new resident 30 days. State law also requires rental companies to rent to drivers aged 18 and over, which is unusual.",
  },
  {
    id: "texas",
    label: "Texas",
    newResidentDays: 90,
    idpRequiredForNonEnglish: false,
    note: "Texas gives a new resident 90 days to obtain a Texas licence.",
  },
  {
    id: "washington",
    label: "Washington",
    newResidentDays: 30,
    idpRequiredForNonEnglish: false,
    note: "Washington gives a new resident 30 days to obtain a Washington licence.",
  },
];

/**
 * The two things about a licence that actually matter in the United States:
 * the language it is printed in, and which road-traffic convention the issuing
 * state belongs to.
 *   language:   "english" | "latin" | "non-latin"
 *   convention: "domestic" | "geneva" | "vienna" | "both" | "none"
 */
export const LICENCE_ORIGINS = [
  {
    id: "us-state",
    label: "A US state or territory",
    language: "english",
    convention: "domestic",
    note: "A state licence needs nothing else. An International Driving Permit issued by AAA or AATA is only for driving abroad, and is not a US licence.",
  },
  {
    id: "uk-ireland",
    label: "United Kingdom or Ireland",
    language: "english",
    convention: "both",
    note: "An English-language licence, from states that belong to the road-traffic conventions. Nothing extra is required to drive in the United States as a visitor.",
  },
  {
    id: "canada",
    label: "Canada",
    language: "english",
    convention: "geneva",
    note: "Canadian provincial licences are recognised across the United States for visitors, and reciprocal exchange is available in many states for new residents.",
  },
  {
    id: "australia-nz",
    label: "Australia or New Zealand",
    language: "english",
    convention: "geneva",
    note: "English-language licences from 1949 Geneva parties. No permit is legally required, though a few hire desks still ask on autopilot.",
  },
  {
    id: "india-sa",
    label: "India, South Africa, Singapore or another English-language licence",
    language: "english",
    convention: "geneva",
    note: "Because the licence is already in English, the translation reason for an International Driving Permit falls away. Some rental branches still ask - carrying one removes the argument.",
  },
  {
    id: "eu-latin",
    label: "An EU or EEA state, licence in Latin script but not English",
    language: "latin",
    convention: "vienna",
    note: "Most EU states are 1968 Vienna parties. The United States never joined that convention, so ask your licensing authority for the 1949 Geneva format, which most can still issue.",
  },
  {
    id: "latin-geneva",
    label: "Other state in the 1949 Geneva Convention, licence in Latin script but not English",
    language: "latin",
    convention: "geneva",
    note: "Your permit is the format the United States actually recognises under Article 24 of the 1949 Geneva Convention.",
  },
  {
    id: "japan",
    label: "Japan",
    language: "non-latin",
    convention: "geneva",
    note: "A Japanese licence is in Japanese script, so nothing on it can be read at a US traffic stop. Prefectural police issue the 1949 Geneva permit, which is the format the United States recognises.",
  },
  {
    id: "non-latin-geneva",
    label: "Other 1949 Geneva state whose licence is not in Latin script",
    language: "non-latin",
    convention: "geneva",
    note: "A licence in Arabic, Cyrillic, Greek, Korean, Chinese or Thai script cannot be read by a US police officer or hire clerk without the permit alongside it.",
  },
  {
    id: "non-latin-vienna",
    label: "A 1968 Vienna state whose licence is not in Latin script",
    language: "non-latin",
    convention: "vienna",
    note: "The United States is not a 1968 Vienna party, so ask specifically for the 1949 Geneva booklet. Many authorities issue both formats from the same counter.",
  },
  {
    id: "no-convention",
    label: "A state in neither road-traffic convention",
    language: "non-latin",
    convention: "none",
    note: "No recognised International Driving Permit exists for such a licence, so a certified English translation is the practical substitute - and many rental companies will simply decline.",
  },
];

export const IDP_HELD_OPTIONS = [
  { id: "none", label: "No IDP" },
  { id: "geneva-1949", label: "1949 Geneva Convention IDP (valid 1 year)" },
  { id: "vienna-1968", label: "1968 Vienna Convention IDP only" },
  { id: "both", label: "Both formats" },
  { id: "certified-translation", label: "A certified English translation instead of an IDP" },
];

export const STAY_PURPOSES = [
  { id: "visit", label: "Visiting - holiday, business trip or study abroad" },
  { id: "residence", label: "Moving to a US state to live or work" },
];

export const VERDICTS = {
  "not-permitted": { label: "You may not drive", tone: "danger" },
  required: { label: "IDP required", tone: "danger" },
  "translation-required": { label: "Certified translation required", tone: "danger" },
  satisfied: { label: "IDP expected - and you have it", tone: "success" },
  "translation-satisfied": { label: "No IDP exists for this licence - your translation covers it", tone: "success" },
  recommended: { label: "IDP not required by law, but carry one", tone: "warning" },
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
 * Decide whether an International Driving Permit is expected in the USA.
 *
 * @param {object} input
 * @param {string} input.licenceOrigin   id from LICENCE_ORIGINS
 * @param {string} input.idpHeld         id from IDP_HELD_OPTIONS
 * @param {string} input.stateId         id from STATES
 * @param {string} input.arrivalDate     YYYY-MM-DD, date of entry
 * @param {string} [input.departureDate] YYYY-MM-DD, optional planned exit
 * @param {number} input.ageYears        driver's age in whole years
 * @param {string} input.stayPurpose     id from STAY_PURPOSES
 * @returns {object} verdict object, or { error }
 */
export function checkIdpRequirement({
  licenceOrigin,
  idpHeld,
  stateId,
  arrivalDate,
  departureDate,
  ageYears,
  stayPurpose,
} = {}) {
  const origin = LICENCE_ORIGINS.find((entry) => entry.id === licenceOrigin);
  if (!origin) return { error: "Choose the country that issued your driving licence." };

  const idp = IDP_HELD_OPTIONS.find((entry) => entry.id === idpHeld);
  if (!idp) return { error: "Choose which permit or translation you already hold." };

  const state = STATES.find((entry) => entry.id === stateId);
  if (!state) return { error: "Choose the state you will be driving in." };

  const purpose = STAY_PURPOSES.find((entry) => entry.id === stayPurpose);
  if (!purpose) return { error: "Choose whether you are visiting or moving to the United States." };

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

  const holdsTranslation = idpHeld === "certified-translation";
  const hasGeneva = holdsGeneva(idpHeld);
  const englishLicence = origin.language === "english";
  const stateRequiresIdp = state.idpRequiredForNonEnglish && !englishLicence;

  let verdict;
  let reason;

  if (age < LOWEST_STATE_DRIVING_AGE) {
    verdict = "not-permitted";
    reason = `No US state issues a car licence below ${LOWEST_STATE_DRIVING_AGE}, and a foreign licence issued earlier does not override the state's minimum. At ${age} you cannot drive in ${COUNTRY_LONG_NAME}.`;
  } else if (origin.convention === "domestic") {
    verdict = "not-required";
    reason =
      "You already hold a US state licence, so the question does not arise. An International Driving Permit from AAA or AATA is only for driving outside the United States.";
  } else if (englishLicence) {
    verdict = "not-required";
    reason =
      "Your licence is already in English, so the translation an International Driving Permit provides adds nothing. No state requires one from an English-language licence holder, and Article 24 of the 1949 Geneva Convention obliges the United States to recognise a valid foreign licence for a visitor. Carry the original licence and your passport.";
  } else if (origin.convention === "none") {
    const holdsIdpAnyway = hasGeneva || idpHeld === "vienna-1968";
    if (holdsTranslation) {
      verdict = "translation-satisfied";
      reason =
        "Your issuing state belongs to neither convention, so no International Driving Permit exists for your licence - the certified English translation you hold is the practical substitute. Expect some rental branches to decline anyway.";
    } else if (holdsIdpAnyway) {
      verdict = "translation-required";
      reason =
        "Your issuing state has joined neither road-traffic convention, so no authority there could have legitimately issued you a Geneva, Vienna or combined International Driving Permit - it does not apply to a licence from this state. Get a certified English translation instead, and expect many rental companies to decline the booking regardless.";
    } else {
      verdict = "translation-required";
      reason =
        "Your issuing state has joined neither road-traffic convention, so no valid International Driving Permit exists for your licence. Get a certified English translation, and expect many rental companies to decline the booking regardless.";
    }
  } else if (hasGeneva) {
    verdict = "satisfied";
    reason =
      "You hold the 1949 Geneva permit, which is the format the United States recognises under Article 24 of that convention. Carry it with the original licence - the permit is never valid on its own, and a police officer will ask for both.";
  } else if (idpHeld === "vienna-1968") {
    verdict = "required";
    reason =
      "The United States is a party to the 1949 Geneva Convention only and never joined the 1968 Vienna Convention, so your Vienna permit rests on no treaty here. Ask your licensing authority for the 1949 Geneva booklet - most issue both from the same counter - because rental companies check the format.";
  } else if (holdsTranslation) {
    verdict = "recommended";
    reason =
      "A certified English translation covers the practical problem, which is that nobody can read your licence. An International Driving Permit does the same job in a form hire desks recognise instantly, so it is worth getting one as well.";
  } else if (stateRequiresIdp) {
    verdict = "required";
    reason = `${state.label} publishes guidance requiring a visitor whose licence is not in English to carry an International Driving Permit with it. Get the 1949 Geneva format at home before you travel - no US body can issue one against a foreign licence.`;
  } else {
    verdict = "recommended";
    reason =
      "No federal law and no statute in this state requires an International Driving Permit, but your licence is not in English, so a traffic stop or a hire desk has nothing it can read. Rental companies almost universally ask for one in that situation, and it must be issued at home before you travel.";
  }

  const warnings = [];
  let windowLabel;
  let windowEndDate = null;

  const presumedResident = purpose.id === "residence" || (stayDays !== null && stayDays > 365);

  if (origin.convention === "domestic") {
    windowLabel = "No limit - you hold a US licence";
  } else if (presumedResident) {
    if (state.newResidentDays === null) {
      windowLabel = "Set by the state you settle in, commonly 30 to 90 days";
      warnings.push(
        "Every state sets its own deadline for a new resident to obtain the local licence, generally between 30 and 90 days. Look it up for the state you actually settle in before the clock runs out.",
      );
    } else if (state.newResidentDays === 0) {
      windowLabel = `${state.label} expects you to apply immediately`;
      windowEndDate = arrivalDate;
      warnings.push(
        `${state.label} gives a new resident no grace period at all: the local licence is expected as soon as you establish residency.`,
      );
    } else {
      windowEndDate = addDaysISO(arrivalDate, state.newResidentDays);
      windowLabel = `${state.newResidentDays} days from becoming a ${state.label} resident`;
      warnings.push(
        `${state.label} gives a new resident ${state.newResidentDays} days to obtain a state licence. The clock starts when you establish residency - taking a job, signing a lease or registering a car - not when you land.`,
      );
    }
    warnings.push(
      "Once you are a resident, the foreign licence and any International Driving Permit stop helping: you need the state's own licence, and most states make an applicant take at least the written knowledge test.",
    );
  } else {
    windowLabel = "Valid for the whole visit while you remain a non-resident";
    if (stayDays !== null && stayDays > 180) {
      warnings.push(
        `A ${stayDays}-day stay is long enough for a state to treat you as a resident, which switches on its licence deadline. Keep evidence of your home address abroad.`,
      );
    }
  }

  const daysRemaining = windowEndDate === null ? null : daysBetweenISO(arrivalDate, windowEndDate);

  if (origin.convention === "vienna" && !hasGeneva) {
    warnings.push(
      "Your country is a 1968 Vienna party. The United States only ratified the 1949 Geneva Convention, so ask specifically for the Geneva format - the two booklets look similar but hire desks check.",
    );
  }
  if (hasGeneva) {
    warnings.push(
      `A 1949 Geneva permit runs for ${GENEVA_IDP_VALID_MONTHS} months from the date of issue and cannot be renewed from abroad, so check the expiry covers the whole trip.`,
    );
  }
  if (idpHeld === "none" && !englishLicence) {
    warnings.push(
      "An International Driving Permit can only be issued by the authority that issued your licence, in your own country, before you travel. Sites selling permits online to anyone are selling worthless paper.",
    );
  }
  if (age < RENTAL_MIN_AGE) {
    warnings.push(
      `Most US rental companies will not release a car below ${RENTAL_MIN_AGE}, and a young-driver surcharge applies under ${RENTAL_SURCHARGE_UNDER_AGE}. ${RENTAL_STATUTORY_MIN_STATES} are the exceptions where state law requires companies to rent from 18.`,
    );
  } else if (age < RENTAL_SURCHARGE_UNDER_AGE) {
    warnings.push(
      `Expect a young-driver surcharge at the hire desk below age ${RENTAL_SURCHARGE_UNDER_AGE}, often $20 to $40 a day.`,
    );
  }
  warnings.push(
    "Liability limits included in a US rental are low by European standards, and medical costs after a crash are not. Check what your travel insurance or credit card actually covers before declining the counter product.",
  );

  const checklist = [
    "Your original national driving licence - a permit is never valid on its own",
    "Passport, and your I-94 or visa record if you have one",
    "Proof of insurance for the car, or the rental agreement",
    "The vehicle registration, which lives in the glovebox of a US car",
  ];
  if (
    verdict === "required" ||
    verdict === "satisfied" ||
    verdict === "recommended" ||
    verdict === "translation-satisfied"
  ) {
    checklist.unshift(
      holdsTranslation && !hasGeneva
        ? "The certified English translation of your licence"
        : "Your International Driving Permit in the 1949 Geneva format, issued at home",
    );
  }
  if (verdict === "translation-required") {
    checklist.unshift("A certified English translation of your licence");
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
    stateLabel: state.label,
    stateNote: state.note,
    stateRequiresIdp,
    idpLabel: idp.label,
    acceptedFormats: "1949 Geneva only",
    minimumAge: LOWEST_STATE_DRIVING_AGE,
    ageOk: age >= LOWEST_STATE_DRIVING_AGE,
    stayDays,
    windowLabel,
    windowEndDate,
    daysRemaining,
    presumedResident,
    warnings,
    checklist,
    legalBasis:
      "1949 Geneva Convention on Road Traffic Article 24; state vehicle codes, including California Vehicle Code section 12505",
  };
}
