/**
 * IDP requirement checker for the United Kingdom.
 *
 * The short answer for almost everyone is that no International Driving Permit
 * is needed to drive in the UK. The permit is a translation of a licence, and
 * British law does not ask for one from a visitor.
 *
 * The rules that decide the answer:
 *
 *  - A visitor may drive any category of small vehicle shown on their full,
 *    valid licence - from any country - for 12 months from the date they last
 *    entered Great Britain. The framework sits in the Road Traffic Act 1988 and
 *    the Motor Vehicles (International Circulation) Order 1975. Nothing in it
 *    requires an International Driving Permit.
 *  - The same 12-month window applies in Northern Ireland to licences issued
 *    outside the EU and EEA.
 *  - For a resident, what happens after 12 months depends on where the licence
 *    came from:
 *      - EU or EEA licence: you may keep driving on it until you are 70, or for
 *        three years after becoming resident if you were already over 67 when
 *        it was issued. It can be exchanged for a GB licence without a test.
 *      - A licence from a "designated country" - Australia, Barbados, the
 *        British Virgin Islands, Canada, the Cayman Islands, the Falkland
 *        Islands, the Faroe Islands, Gibraltar, Hong Kong, Japan, Monaco, New
 *        Zealand, North Macedonia, the Republic of Korea, Singapore, South
 *        Africa, Switzerland, Taiwan, Ukraine, Zimbabwe, Andorra - can be
 *        exchanged for a GB licence without a test, within five years of
 *        becoming resident.
 *      - Any other licence: to keep driving after the 12 months you must get a
 *        provisional GB licence and pass the theory and practical tests.
 *  - The car licence age in Great Britain is 17.
 *  - The alcohol limit differs inside the UK: 80 mg per 100 ml of blood (35
 *    microgrammes per 100 ml of breath) in England, Wales and Northern Ireland,
 *    and 50 mg per 100 ml of blood (22 microgrammes per 100 ml of breath) in
 *    Scotland, lowered in December 2014.
 *
 * Informational only, not legal advice. The designated-country list changes -
 * check the current version with the DVLA before relying on it.
 */

export const COUNTRY_NAME = "UK";
export const COUNTRY_LONG_NAME = "the United Kingdom";
export const DRIVES_ON = "left";

/** Visitor window, counted from the date you last entered Great Britain. */
export const VISITOR_WINDOW_MONTHS = 12;

/** Years a designated-country licence holder has to exchange after becoming resident. */
export const DESIGNATED_EXCHANGE_YEARS = 5;

/** EU and EEA licence holders may drive on it until this age. */
export const EU_LICENCE_VALID_TO_AGE = 70;

/** Category B minimum age in Great Britain. */
export const MINIMUM_CAR_AGE = 17;
/** Commercial hire-desk practice, not law. */
export const RENTAL_MIN_AGE = 21;
export const RENTAL_SURCHARGE_UNDER_AGE = 25;

/** Alcohol limits, in milligrammes per 100 ml of blood. */
export const BAC_LIMIT_ENGLAND_WALES_NI = 80;
export const BAC_LIMIT_SCOTLAND = 50;

export const MS_PER_DAY = 86400000;
const MAX_STAY_DAYS = 3650;

/**
 * How the UK treats each family of issuing country once you are resident.
 *  "gb"         - already a GB licence
 *  "eu-eea"     - drive on it until 70, exchange without a test
 *  "designated" - exchange without a test, within five years of residency
 *  "other"      - 12 months, then provisional licence plus theory and practical
 *
 * `latinScript` records whether a hire desk can read the licence at all.
 */
export const LICENCE_ORIGINS = [
  {
    id: "gb",
    label: "Great Britain or Northern Ireland",
    rule: "gb",
    latinScript: true,
    note: "A GB or NI licence needs nothing else. The permit the Post Office sells against it is for driving abroad.",
  },
  {
    id: "eu-eea",
    label: "An EU or EEA state (includes Iceland, Liechtenstein, Norway)",
    rule: "eu-eea",
    latinScript: true,
    note: "An EU or EEA licence can be used in Great Britain until you turn 70, and exchanged for a GB licence without a test.",
  },
  {
    id: "ireland",
    label: "Republic of Ireland",
    rule: "eu-eea",
    latinScript: true,
    note: "An Irish licence is an EU licence, and the common travel area makes the practical side simple. It can be exchanged for a GB licence without a test.",
  },
  {
    id: "designated-english",
    label:
      "Australia, Canada, New Zealand, South Africa, Singapore, Hong Kong or another English-language designated country",
    rule: "designated",
    latinScript: true,
    note: "Designated countries can exchange for a GB licence without a test, within five years of becoming resident. Australia, New Zealand, South Africa, Hong Kong and Singapore also drive on the left already.",
  },
  {
    id: "designated-other",
    label: "Japan, Republic of Korea, Switzerland, Taiwan, Ukraine, Monaco or another designated country",
    rule: "designated",
    latinScript: false,
    note: "Also on the designated list for exchange without a test. The licence itself may not be in Latin script, which matters at a hire desk rather than at a police stop.",
  },
  {
    id: "usa",
    label: "United States",
    rule: "other",
    latinScript: true,
    note: "A US state licence is fine for the 12-month visitor window, but the United States is not a designated country, so a resident who wants to keep driving must get a provisional licence and pass the theory and practical tests.",
  },
  {
    id: "india-latin",
    label: "India or another non-designated country, licence in Latin script",
    rule: "other",
    latinScript: true,
    note: "Perfectly usable for the 12-month window. After that a resident takes the provisional-licence route with both tests, however long they have been driving.",
  },
  {
    id: "non-latin",
    label: "A non-designated country whose licence is not in Latin script",
    rule: "other",
    latinScript: false,
    note: "British law does not require a translation, but a rental company that cannot read the licence may ask for a permit or a translation as a condition of the booking.",
  },
];

export const IDP_HELD_OPTIONS = [
  { id: "none", label: "No IDP" },
  { id: "geneva-1949", label: "1949 Geneva Convention IDP" },
  { id: "vienna-1968", label: "1968 Vienna Convention IDP" },
  { id: "both", label: "Both formats" },
  { id: "gb-licence", label: "A GB or NI driving licence" },
];

export const STAY_PURPOSES = [
  { id: "visit", label: "Visiting - holiday, business trip or study" },
  { id: "residence", label: "Living in the UK, or moving here" },
];

export const VERDICTS = {
  "not-permitted": { label: "You may not drive", tone: "danger" },
  "not-required": { label: "No IDP needed", tone: "success" },
  recommended: { label: "No IDP needed, but hire desks may ask", tone: "warning" },
  "test-required": { label: "GB licence and tests required", tone: "danger" },
  "eu-age-check": { label: "No IDP needed, but check your licence is still valid here", tone: "warning" },
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

/**
 * Decide whether an International Driving Permit is expected in the UK, and
 * date the window your foreign licence gives you.
 *
 * @param {object} input
 * @param {string} input.licenceOrigin   id from LICENCE_ORIGINS
 * @param {string} input.idpHeld         id from IDP_HELD_OPTIONS
 * @param {string} input.arrivalDate     YYYY-MM-DD, date you last entered
 * @param {string} [input.departureDate] YYYY-MM-DD, optional planned exit
 * @param {number} input.ageYears        driver's age in whole years
 * @param {string} input.stayPurpose     id from STAY_PURPOSES
 * @param {string} [input.referenceDate] YYYY-MM-DD, "today" for countdown
 *   purposes. Defaults to the current UTC date when omitted or invalid -
 *   callers that care about the visitor's local calendar day (e.g. the UI)
 *   should pass their own locally-computed today.
 * @returns {object} verdict object, or { error }
 */
export function checkIdpRequirement({
  licenceOrigin,
  idpHeld,
  arrivalDate,
  departureDate,
  ageYears,
  stayPurpose,
  referenceDate,
} = {}) {
  const origin = LICENCE_ORIGINS.find((entry) => entry.id === licenceOrigin);
  if (!origin) return { error: "Choose the country that issued your driving licence." };

  const idp = IDP_HELD_OPTIONS.find((entry) => entry.id === idpHeld);
  if (!idp) return { error: "Choose which permit you already hold." };

  const purpose = STAY_PURPOSES.find((entry) => entry.id === stayPurpose);
  if (!purpose) return { error: "Choose whether you are visiting or living in the UK." };

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

  const isResident = purpose.id === "residence";
  const holdsGbLicence = idpHeld === "gb-licence" || origin.rule === "gb";
  const today = parseISODate(referenceDate) !== null ? referenceDate : toISODate(Date.now());

  let verdict;
  let reason;

  if (age < MINIMUM_CAR_AGE) {
    verdict = "not-permitted";
    reason = `The car licence age in Great Britain is ${MINIMUM_CAR_AGE}, and a foreign licence issued earlier does not lower it. At ${age} you cannot drive a car in ${COUNTRY_LONG_NAME}.`;
  } else if (holdsGbLicence) {
    verdict = "not-required";
    reason =
      "You hold a GB or Northern Ireland licence, so nothing else is needed. The International Driving Permit sold at Post Office branches is for driving abroad, not here.";
  } else if (!origin.latinScript) {
    verdict = "recommended";
    reason =
      "British law does not require an International Driving Permit from any visitor, and a police officer will accept your licence. The practical problem is different: a rental company that cannot read the licence may refuse the booking or insist on a translation, so a permit is worth carrying even though nothing obliges you to.";
  } else if (isResident && origin.rule === "eu-eea") {
    // Residents on an EU/EEA licence are not bound by the 12-month visitor
    // window at all - they may drive until EU_LICENCE_VALID_TO_AGE (or three
    // years from residency if already over 67 when issued). Keep this in
    // step with the matching windowLabel/warning below so the two pieces of
    // copy never disagree on how long the licence actually works.
    if (age >= EU_LICENCE_VALID_TO_AGE) {
      verdict = "eu-age-check";
      reason = `As an EU or EEA licence holder living in the UK, you may normally keep driving on it until you turn ${EU_LICENCE_VALID_TO_AGE} - well past the ${VISITOR_WINDOW_MONTHS}-month window that applies to other licences. At ${age} you are already past that age, so check with the DVLA whether the three-year exception for licences issued after age 67 applies to you, and exchange it for a GB licence without a test as soon as you can.`;
    } else {
      verdict = "not-required";
      reason = `As an EU or EEA licence holder living in the UK, you are not limited to the ${VISITOR_WINDOW_MONTHS}-month visitor window - you may keep driving on it until you turn ${EU_LICENCE_VALID_TO_AGE}, and you can exchange it for a GB licence without a test at any time before then.`;
    }
  } else {
    verdict = "not-required";
    reason = `No International Driving Permit is needed to drive in the UK. A visitor may drive any small vehicle shown on a full, valid licence from any country for ${VISITOR_WINDOW_MONTHS} months from the date they last entered Great Britain, and the permit adds nothing to that.`;
  }

  const warnings = [];
  let windowLabel;
  let windowEndDate = null;
  let exchangeDeadline = null;

  if (holdsGbLicence) {
    windowLabel = "No limit while the GB licence is valid";
  } else if (!isResident) {
    windowEndDate = addMonthsISO(arrivalDate, VISITOR_WINDOW_MONTHS);
    windowLabel = `${VISITOR_WINDOW_MONTHS} months from the date you last entered Great Britain`;
    // Compare against the real, leap-year-aware window length rather than a
    // hardcoded 365 so a stay that lands exactly on the computed boundary
    // (e.g. a 366-day window spanning 29 February) is not falsely flagged.
    const windowLengthDays = daysBetweenISO(arrivalDate, windowEndDate);
    if (stayDays !== null && windowLengthDays !== null && stayDays > windowLengthDays) {
      warnings.push(
        `A ${stayDays}-day stay runs past the ${VISITOR_WINDOW_MONTHS}-month visitor window, so what happens next depends on where the licence was issued rather than on the trip.`,
      );
    }
  } else if (origin.rule === "eu-eea") {
    if (age >= EU_LICENCE_VALID_TO_AGE) {
      windowLabel = `Past the age-${EU_LICENCE_VALID_TO_AGE} cut-off - check the three-year exception`;
      warnings.push(
        `At ${age} you are past the age ${EU_LICENCE_VALID_TO_AGE} cut-off for driving on an EU or EEA licence, unless you were already over 67 when it was issued, which gives three years from becoming resident instead. Check your exact position with the DVLA, and exchange the licence for a GB one without a test as soon as you can.`,
      );
    } else {
      windowLabel = `Until you turn ${EU_LICENCE_VALID_TO_AGE}`;
      warnings.push(
        `An EU or EEA licence can be used in Great Britain until you turn ${EU_LICENCE_VALID_TO_AGE}. If you were already over 67 when it was issued, you get three years from becoming resident instead. Either way you can exchange it for a GB licence without a test.`,
      );
    }
  } else if (origin.rule === "designated") {
    windowEndDate = addMonthsISO(arrivalDate, VISITOR_WINDOW_MONTHS);
    exchangeDeadline = addMonthsISO(arrivalDate, DESIGNATED_EXCHANGE_YEARS * 12);
    windowLabel = `${VISITOR_WINDOW_MONTHS} months to keep driving, ${DESIGNATED_EXCHANGE_YEARS} years to exchange`;
    warnings.push(
      `Your licence is from a designated country, so you can exchange it for a GB licence without any test - but the application has to be made within ${DESIGNATED_EXCHANGE_YEARS} years of becoming resident. Driving on the foreign licence itself only lasts ${VISITOR_WINDOW_MONTHS} months.`,
    );
  } else {
    windowEndDate = addMonthsISO(arrivalDate, VISITOR_WINDOW_MONTHS);
    windowLabel = `${VISITOR_WINDOW_MONTHS} months from becoming resident`;
    // Never let the residency message override the under-age refusal above.
    if (verdict !== "not-permitted") {
      verdict = "test-required";
      reason =
        "You can drive on the foreign licence for 12 months from becoming resident, and no International Driving Permit is required for that. Your licence is not from a designated country, though, so to keep driving after those 12 months you must apply for a provisional GB licence and pass both the theory test and the practical test.";
    }
    warnings.push(
      "Apply for the provisional licence early. Theory and practical test slots are often booked weeks ahead, and the 12 months goes quickly once you are settling in.",
    );
  }

  // Counted from "today" (or the caller-supplied reference date), not from
  // arrivalDate - this is a live countdown to the window closing, not a
  // restatement of the window's fixed length. Can be negative if the window
  // has already closed.
  const daysRemaining = windowEndDate === null ? null : daysBetweenISO(today, windowEndDate);

  if (idpHeld !== "none" && idpHeld !== "gb-licence") {
    warnings.push(
      "The permit you already hold does no harm, but it does not extend the 12-month window or substitute for a GB licence. It is a translation, nothing more.",
    );
  }
  warnings.push(
    "The UK drives on the left, with the steering wheel on the right. Roundabouts turn clockwise, you give way to traffic already on the roundabout, and overtaking is on the right.",
  );
  warnings.push(
    `The alcohol limit is not the same across the UK: ${BAC_LIMIT_ENGLAND_WALES_NI} mg per 100 ml of blood in England, Wales and Northern Ireland, but ${BAC_LIMIT_SCOTLAND} mg in Scotland since December 2014. Crossing the border changes the limit under you.`,
  );
  warnings.push(
    "London's congestion charge and ULEZ, and the clean air zones in several other cities, apply to foreign-registered vehicles too. They are camera-enforced with no barriers, and the penalty arrives later.",
  );
  if (age < RENTAL_MIN_AGE) {
    warnings.push(
      `UK rental companies generally start at ${RENTAL_MIN_AGE}, often require the licence to have been held for a year, and charge a young-driver surcharge under ${RENTAL_SURCHARGE_UNDER_AGE}. That is company policy rather than law.`,
    );
  } else if (age < RENTAL_SURCHARGE_UNDER_AGE) {
    warnings.push(
      `Expect a young-driver surcharge at the hire desk below age ${RENTAL_SURCHARGE_UNDER_AGE}.`,
    );
  }

  const checklist = [
    "Your original driving licence - the paper counterpart too, if your country still issues one",
    "Passport, showing when you last entered the country",
    "Insurance certificate or the rental agreement",
    "The V5C registration document if the car is yours",
  ];
  if (verdict === "recommended") {
    checklist.unshift(
      "An International Driving Permit or translation, for the hire desk rather than the law",
    );
  }
  if (verdict === "eu-age-check") {
    checklist.unshift(
      "Confirmation from the DVLA that you still qualify to drive on the EU/EEA licence, or your GB exchange application",
    );
  }
  if (verdict === "test-required") {
    checklist.unshift("An application for a provisional GB licence, made well before month twelve");
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
    acceptedFormats: "None required",
    minimumAge: MINIMUM_CAR_AGE,
    ageOk: age >= MINIMUM_CAR_AGE,
    bacEnglandWalesNi: BAC_LIMIT_ENGLAND_WALES_NI,
    bacScotland: BAC_LIMIT_SCOTLAND,
    stayDays,
    windowLabel,
    windowEndDate,
    exchangeDeadline,
    daysRemaining,
    isResident,
    warnings,
    checklist,
    legalBasis:
      "Road Traffic Act 1988; Motor Vehicles (Driving Licences) Regulations 1999; Motor Vehicles (International Circulation) Order 1975",
  };
}
