/**
 * IDP requirement checker for Australia.
 *
 * An International Driving Permit is not a licence. It is the standard
 * multilingual translation of a national licence, and it is only ever valid
 * when carried with the licence it translates.
 *
 * What decides the answer in Australia:
 *
 *  - Driver licensing is state and territory law, not federal.
 *  - Every state and territory allows an overseas visitor to drive on a valid
 *    overseas licence, but requires that licence to be in English. Where it is
 *    not, the driver must carry either an official English translation or an
 *    International Driving Permit. State rules ask for "an International
 *    Driving Permit" without naming a convention, so either booklet works as
 *    the translation - although at treaty level Australia is a party to the
 *    1949 Geneva Convention and not to the 1968 Vienna Convention.
 *  - A temporary visitor may generally keep using the overseas licence for as
 *    long as they remain a temporary visitor. The clock only starts once you
 *    become a permanent resident, and then the state sets the deadline:
 *    three months in New South Wales, Queensland, Western Australia, Tasmania,
 *    the ACT and the Northern Territory, 90 days in South Australia, and six
 *    months in Victoria.
 *  - Australia drives on the left, which is the change most visitors from
 *    Europe, North America and mainland Asia actually have to manage.
 *  - The general blood-alcohol limit is 0.05 across the country, and zero for
 *    learner and provisional licence holders.
 *
 * Informational only, not legal advice. State deadlines and translator
 * requirements change - confirm with the state road authority before you drive.
 */

export const COUNTRY_NAME = "Australia";
export const DRIVES_ON = "left";

/**
 * State rules ask for "an International Driving Permit" generically, so either
 * convention's booklet satisfies the translation requirement, even though
 * Australia has only ratified the 1949 Geneva Convention.
 */
export const ACCEPTED_IDP_FORMATS = ["geneva-1949", "vienna-1968"];

/** The general blood-alcohol limit for a full licence holder, Australia-wide. */
export const BAC_LIMIT_FULL_LICENCE = 0.05;

/**
 * Youngest age at which any Australian jurisdiction issues a car licence: a
 * learner permit at 16, and a provisional licence at 17 in most states.
 * A visitor must meet the minimum for the equivalent class where they drive.
 */
export const LOWEST_STATE_DRIVING_AGE = 16;
/** Commercial hire-desk practice, not law. */
export const RENTAL_MIN_AGE = 21;
export const RENTAL_SURCHARGE_UNDER_AGE = 25;

export const MS_PER_DAY = 86400000;
const MAX_STAY_DAYS = 3650;

/**
 * States and territories, with the window a permanent resident gets before the
 * local licence becomes compulsory, expressed in days.
 */
export const STATES = [
  {
    id: "nsw",
    label: "New South Wales",
    permanentResidentDays: 90,
    note: "A temporary visitor may keep driving on the overseas licence indefinitely. Once you become a permanent NSW resident you have three months to get a NSW licence.",
  },
  {
    id: "vic",
    label: "Victoria",
    permanentResidentDays: 180,
    note: "Victoria is the outlier: a permanent resident has six months from the date permanent residency began, rather than the three months most states allow.",
  },
  {
    id: "qld",
    label: "Queensland",
    permanentResidentDays: 90,
    note: "Queensland gives a new permanent resident three months to obtain a Queensland licence.",
  },
  {
    id: "wa",
    label: "Western Australia",
    permanentResidentDays: 90,
    note: "Western Australia gives three months from becoming a resident to transfer to a WA licence.",
  },
  {
    id: "sa",
    label: "South Australia",
    permanentResidentDays: 90,
    note: "South Australia gives 90 days from becoming a permanent resident to obtain a South Australian licence.",
  },
  {
    id: "tas",
    label: "Tasmania",
    permanentResidentDays: 90,
    note: "Tasmania gives a new permanent resident three months to convert.",
  },
  {
    id: "act",
    label: "Australian Capital Territory",
    permanentResidentDays: 90,
    note: "The ACT gives a new permanent resident three months to convert.",
  },
  {
    id: "nt",
    label: "Northern Territory",
    permanentResidentDays: 90,
    note: "The Northern Territory gives a new permanent resident three months to convert. It also has the longest unbroken distances between fuel stops in the country.",
  },
];

/**
 * Issuing countries, described by the two things that matter here: whether the
 * licence is printed in English, and which convention the issuer belongs to.
 *   language:   "english" | "latin" | "non-latin"
 *   convention: "domestic" | "geneva" | "vienna" | "both" | "none"
 */
export const LICENCE_ORIGINS = [
  {
    id: "australian",
    label: "An Australian state or territory",
    language: "english",
    convention: "domestic",
    note: "An Australian licence is valid nationwide. An International Driving Permit from a state motoring club is only for driving overseas.",
  },
  {
    id: "uk-ireland",
    label: "United Kingdom or Ireland",
    language: "english",
    convention: "both",
    note: "An English-language licence. Nothing extra is required, and a permanent resident can usually convert without a driving test under the recognised-country arrangements.",
  },
  {
    id: "usa-canada",
    label: "United States or Canada",
    language: "english",
    convention: "geneva",
    note: "English-language licences that need no translation. Most states will convert them for a new resident without a practical test.",
  },
  {
    id: "nz",
    label: "New Zealand",
    language: "english",
    convention: "geneva",
    note: "A New Zealand licence is in English and New Zealand drives on the left too, which removes the single biggest adjustment.",
  },
  {
    id: "india-english",
    label: "India, South Africa, Singapore or another English-language licence",
    language: "english",
    convention: "geneva",
    note: "The licence is already in English, so the translation requirement falls away. Whether it converts to a local licence without a test depends on the state's recognised-country list.",
  },
  {
    id: "eu-latin",
    label: "An EU or EEA state, licence in Latin script but not English",
    language: "latin",
    convention: "vienna",
    note: "Latin script is not the test - the state rules ask for the licence to be in English. A German, French, Spanish or Italian licence needs a permit or a translation alongside it.",
  },
  {
    id: "latin-geneva",
    label: "Other 1949 Geneva state, licence in Latin script but not English",
    language: "latin",
    convention: "geneva",
    note: "Your permit is the format Australia has actually ratified, so there is no argument to be had at a hire desk.",
  },
  {
    id: "japan",
    label: "Japan",
    language: "non-latin",
    convention: "geneva",
    note: "A Japanese licence is in Japanese script and cannot be read by an Australian officer. Prefectural police issue the 1949 Geneva permit before you leave Japan.",
  },
  {
    id: "china-korea",
    label: "China, South Korea, Taiwan or another East Asian licence",
    language: "non-latin",
    convention: "geneva",
    note: "China is not in either convention, so a Chinese licence needs an accredited English translation rather than a permit. Korean and Taiwanese holders should check which document their state road authority names.",
  },
  {
    id: "non-latin-geneva",
    label: "Other 1949 Geneva state whose licence is not in Latin script",
    language: "non-latin",
    convention: "geneva",
    note: "A licence in Arabic, Cyrillic, Greek or Thai script needs the permit or a translation alongside it for anyone in Australia to read.",
  },
  {
    id: "non-latin-vienna",
    label: "A 1968 Vienna state whose licence is not in Latin script",
    language: "non-latin",
    convention: "vienna",
    note: "State rules ask for an International Driving Permit without naming a convention, so a 1968 booklet does the job as a translation. Australia has only ratified the 1949 Geneva Convention, so carry the original licence too and expect the occasional argument.",
  },
  {
    id: "no-convention",
    label: "A state in neither road-traffic convention",
    language: "non-latin",
    convention: "none",
    note: "No recognised International Driving Permit exists for such a licence, so you need an English translation from a translator the state road authority accepts - in most states, one accredited by NAATI.",
  },
];

export const IDP_HELD_OPTIONS = [
  { id: "none", label: "No IDP or translation" },
  { id: "geneva-1949", label: "1949 Geneva Convention IDP (valid 1 year)" },
  { id: "vienna-1968", label: "1968 Vienna Convention IDP" },
  { id: "both", label: "Both formats" },
  { id: "accredited-translation", label: "An accredited English translation instead" },
];

export const STAY_PURPOSES = [
  { id: "visit", label: "Temporary visitor - holiday, working holiday or study" },
  { id: "residence", label: "Permanent resident, or becoming one" },
];

export const VERDICTS = {
  "not-permitted": { label: "You may not drive", tone: "danger" },
  required: { label: "IDP or translation required", tone: "danger" },
  "translation-required": { label: "Accredited translation required", tone: "danger" },
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

function holdsIdp(idpHeld) {
  return idpHeld === "both" || ACCEPTED_IDP_FORMATS.includes(idpHeld);
}

/**
 * Decide whether a permit or translation is expected in Australia.
 *
 * @param {object} input
 * @param {string} input.licenceOrigin   id from LICENCE_ORIGINS
 * @param {string} input.idpHeld         id from IDP_HELD_OPTIONS
 * @param {string} input.stateId         id from STATES
 * @param {string} input.arrivalDate     YYYY-MM-DD, date of arrival or of permanent residency
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
  if (!state) return { error: "Choose the state or territory you will be driving in." };

  const purpose = STAY_PURPOSES.find((entry) => entry.id === stayPurpose);
  if (!purpose) return { error: "Choose whether you are a temporary visitor or a permanent resident." };

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
  const hasTranslation = idpHeld === "accredited-translation";

  let verdict;
  let reason;

  if (age < LOWEST_STATE_DRIVING_AGE) {
    verdict = "not-permitted";
    reason = `No Australian jurisdiction issues any car licence below ${LOWEST_STATE_DRIVING_AGE}, and an overseas licence issued earlier does not override that. At ${age} you cannot drive in ${COUNTRY_NAME}.`;
  } else if (origin.convention === "domestic") {
    verdict = "not-required";
    reason =
      "An Australian licence is valid in every state and territory. An International Driving Permit issued by a state motoring club is only for driving overseas.";
  } else if (englishLicence) {
    verdict = "not-required";
    reason =
      "Your licence is already in English, which is exactly what every state and territory rule asks for. No International Driving Permit and no translation is required - carry the original licence and your passport, and remember Australia drives on the left.";
  } else if (origin.convention === "none") {
    verdict = hasTranslation ? "satisfied" : "translation-required";
    reason = hasTranslation
      ? "No International Driving Permit exists for a licence from a state outside both conventions, so the accredited English translation you hold is the document your state road authority asks for. Carry it with the original licence."
      : "Your issuing state has joined neither road-traffic convention, so no valid International Driving Permit exists for your licence. You need an English translation from a translator the state road authority accepts - in most states, one accredited by NAATI.";
  } else if (hasIdp || hasTranslation) {
    verdict = "satisfied";
    reason = hasTranslation
      ? "Your licence is not in English, and state rules accept an official English translation in place of an International Driving Permit. Carry it with the original licence - neither document is valid on its own."
      : "Your licence is not in English, and every state and territory rule accepts an International Driving Permit as the translation. Carry it with the original licence; the permit alone is not a licence and police will ask for both.";
  } else {
    verdict = "required";
    reason =
      "Your licence is not printed in English, so state and territory rules require you to carry an official English translation or an International Driving Permit alongside it. The permit must be issued in the country that issued your licence, before you travel.";
  }

  const warnings = [];
  let windowLabel;
  let windowEndDate = null;

  if (origin.convention === "domestic") {
    windowLabel = "No limit - you hold an Australian licence";
  } else if (purpose.id === "residence") {
    windowEndDate = addDaysISO(arrivalDate, state.permanentResidentDays);
    windowLabel = `${state.permanentResidentDays} days from becoming a permanent resident of ${state.label}`;
    warnings.push(
      `${state.label} gives a permanent resident ${state.permanentResidentDays} days to obtain a local licence. The clock runs from the date permanent residency starts, not from the date you first arrived in the country.`,
    );
    warnings.push(
      "Whether you can convert without a driving test depends on the state's recognised-country list. The UK, Ireland, most of the EU, the United States, Canada, New Zealand, Japan and South Korea appear on most lists; many other countries do not, which means the full learner-to-provisional path.",
    );
  } else {
    windowLabel = "Valid for as long as you remain a temporary visitor";
    warnings.push(
      "A temporary visitor may generally keep driving on the overseas licence with no time limit. That protection disappears the day permanent residency starts, and it disappears immediately - not at the end of the current trip.",
    );
    if (stayDays !== null && stayDays > 365) {
      warnings.push(
        `A ${stayDays}-day stay is long enough that your visa status is what matters, not the length of the trip. Check whether it makes you a permanent resident for licensing purposes.`,
      );
    }
  }

  const daysRemaining = windowEndDate === null ? null : daysBetweenISO(arrivalDate, windowEndDate);

  if (idpHeld === "geneva-1949") {
    warnings.push(
      "A 1949 Geneva permit runs for one year from the date of issue and cannot be renewed from abroad, so check the expiry covers the whole trip.",
    );
  }
  if (origin.convention !== "domestic") {
    warnings.push(
      `Australia drives on the left, with the steering wheel on the right. Roundabouts turn clockwise and you give way to the right, which is the reverse of what most visitors are used to.`,
    );
    warnings.push(
      `The blood-alcohol limit is ${BAC_LIMIT_FULL_LICENCE.toFixed(2)} for a full licence holder and zero for anyone on a learner or provisional licence. Random breath testing is routine and heavily used.`,
    );
  }
  if (age < RENTAL_MIN_AGE) {
    warnings.push(
      `Australian rental companies will not normally release a car below ${RENTAL_MIN_AGE}, and a young-driver surcharge applies under ${RENTAL_SURCHARGE_UNDER_AGE}. That is company policy rather than law.`,
    );
  } else if (age < RENTAL_SURCHARGE_UNDER_AGE) {
    warnings.push(
      `Expect a young-driver surcharge at the hire desk below age ${RENTAL_SURCHARGE_UNDER_AGE}.`,
    );
  }
  warnings.push(
    "Urban toll roads in Sydney, Melbourne and Brisbane are cashless with no booths. Arrange a pass or a rental toll product before you use one, or the fine follows the hire agreement.",
  );

  const checklist = [
    "Your original overseas driving licence - a permit or translation is never valid on its own",
    "Passport and, for a resident, evidence of when permanent residency started",
    "The rental agreement or proof of insurance",
    "A charged phone, water and a plan for fuel range on long inland drives",
  ];
  if (verdict === "required" || verdict === "satisfied") {
    checklist.unshift(
      hasTranslation && !hasIdp
        ? "Your accredited English translation of the licence"
        : "Your International Driving Permit, issued in the country that issued your licence",
    );
  }
  if (verdict === "translation-required") {
    checklist.unshift("An English translation from a translator your state road authority accepts");
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
    stateLabel: state.label,
    stateNote: state.note,
    idpLabel: idp.label,
    acceptedFormats: "Either format, as the English translation",
    minimumAge: LOWEST_STATE_DRIVING_AGE,
    ageOk: age >= LOWEST_STATE_DRIVING_AGE,
    bacLimit: BAC_LIMIT_FULL_LICENCE,
    stayDays,
    windowLabel,
    windowEndDate,
    daysRemaining,
    warnings,
    checklist,
    legalBasis:
      "State and territory driver licensing rules; 1949 Geneva Convention on Road Traffic, to which Australia is a contracting party",
  };
}
