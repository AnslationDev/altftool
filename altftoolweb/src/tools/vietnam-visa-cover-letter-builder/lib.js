/**
 * Vietnam Visa Cover Letter Builder — pure logic.
 *
 * Rules encoded here, from Vietnam Immigration Department guidance on the
 * National Portal on Immigration (evisa.gov.vn):
 *  - Since 15 August 2023 the electronic visa is open to citizens of every
 *    country and territory, issued for a maximum stay of 90 days, single or
 *    multiple entry, with a stated valid-from and valid-to date.
 *  - The e-visa fee is US$25 for single entry and US$50 for multiple entry,
 *    charged per applicant and not refunded if the application is refused.
 *  - The published processing time is three working days from receipt of a
 *    complete application and the fee, so this tool counts forward in working
 *    days, skipping Saturdays and Sundays. Vietnamese public holidays can add
 *    further days.
 *  - The passport must be valid for at least six months from the date of entry
 *    and have at least two blank pages.
 *  - The e-visa is only accepted at designated international checkpoints, and
 *    the checkpoint of entry is stated on the application, so the letter should
 *    name the same port.
 *  - The visa is valid only from the requested valid-from date; arriving before
 *    it, or leaving after the valid-to date, is an immigration offence.
 *
 * Informational only — not immigration advice.
 */

/** Maximum stay an e-visa can be issued for, in days. */
export const EVISA_MAX_STAY_DAYS = 90;
/** E-visa fee per applicant, in US dollars. */
export const EVISA_FEE_SINGLE_USD = 25;
export const EVISA_FEE_MULTIPLE_USD = 50;
/** Published processing time, in working days. */
export const PROCESSING_WORKING_DAYS = 3;
/** Passport validity required from the date of entry, in months. */
export const PASSPORT_MONTHS_FROM_ENTRY = 6;
/** Blank passport pages required. */
export const MIN_BLANK_PAGES = 2;

export const VISA_TYPES = [
  { id: "single", label: "E-visa — single entry", noun: "single-entry electronic visa", feeUsd: EVISA_FEE_SINGLE_USD },
  { id: "multiple", label: "E-visa — multiple entry", noun: "multiple-entry electronic visa", feeUsd: EVISA_FEE_MULTIPLE_USD },
];

export const PURPOSE_OPTIONS = [
  { id: "tourism", label: "Tourism and sightseeing", sentence: "tourism and sightseeing" },
  { id: "family", label: "Visiting family or friends", sentence: "visiting my family in Vietnam" },
  { id: "business", label: "Business meetings", sentence: "business meetings with our Vietnamese supplier" },
  { id: "conference", label: "Conference or trade fair", sentence: "attending a trade fair and related meetings" },
  { id: "remote", label: "Extended leisure stay", sentence: "an extended leisure stay" },
  { id: "transit", label: "Transit and short stopover", sentence: "a short stopover before continuing onward" },
];

/** Common designated international checkpoints named on e-visa applications. */
export const ENTRY_PORTS = [
  "Noi Bai International Airport (Hanoi)",
  "Tan Son Nhat International Airport (Ho Chi Minh City)",
  "Da Nang International Airport",
  "Cam Ranh International Airport (Nha Trang)",
  "Phu Quoc International Airport",
  "Moc Bai landport (Tay Ninh)",
  "Huu Nghi landport (Lang Son)",
  "Lao Bai landport (Quang Tri)",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86400000;
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Parse yyyy-mm-dd into a UTC timestamp; null when impossible. */
export function parseISODate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
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

/** Whole days from one date to another. */
export function daysBetween(fromMs, toMs) {
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) return 0;
  return Math.round((toMs - fromMs) / DAY_MS);
}

/** Days in Vietnam counting the arrival and departure days. */
export function daysOfStay(startMs, endMs) {
  return daysBetween(startMs, endMs) + 1;
}

/** Add whole days to a UTC timestamp. */
export function addDaysUTC(stamp, days) {
  return stamp + days * DAY_MS;
}

/** Add months, clamping to the last day of a shorter target month. */
export function addMonthsUTC(stamp, months) {
  const date = new Date(stamp);
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, lastDay));
}

/**
 * Move forward a number of working days, skipping Saturdays and Sundays.
 * Vietnamese public holidays are not modelled and can add further days.
 * @param {number} stamp Starting UTC timestamp.
 * @param {number} workingDays Whole working days to add.
 */
export function addWorkingDaysUTC(stamp, workingDays) {
  if (!Number.isFinite(stamp)) return stamp;
  let remaining = Math.max(0, Math.floor(workingDays));
  let cursor = stamp;
  while (remaining > 0) {
    cursor = addDaysUTC(cursor, 1);
    const weekday = new Date(cursor).getUTCDay();
    if (weekday !== 0 && weekday !== 6) remaining -= 1;
  }
  return cursor;
}

/** Format a UTC timestamp as "4 March 2027". */
export function formatLongDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

const MAX_TEXT = 400;
const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

function splitLines(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** "a" or "an" for a following word. */
export function indefiniteArticle(word) {
  return /^[aeiou]/i.test(String(word).trim()) ? "an" : "a";
}

/** Pluralise a unit noun. */
export function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Build the Vietnam e-visa cover letter and its checks.
 *
 * @param {object} input
 * @param {string} input.fullName            Name as printed in the passport.
 * @param {string} [input.nationality]       Citizenship.
 * @param {string} input.passportNumber      Passport number.
 * @param {string} input.passportExpiryDate  yyyy-mm-dd.
 * @param {string} [input.occupation]        Job title or status.
 * @param {string} [input.employer]          Employer or institution.
 * @param {string} [input.homeAddress]       Residential address.
 * @param {string} [input.contact]           Email and phone.
 * @param {string} input.visaTypeId          One of VISA_TYPES ids.
 * @param {string} input.purposeId           One of PURPOSE_OPTIONS ids.
 * @param {string} input.applicationDate     yyyy-mm-dd the e-visa is applied for.
 * @param {string} input.arrivalDate         yyyy-mm-dd requested valid-from / arrival.
 * @param {string} input.departureDate       yyyy-mm-dd departure from Vietnam.
 * @param {number|string} [input.requestedValidityDays] Validity requested, up to 90.
 * @param {string} [input.entryPort]         Designated checkpoint of entry.
 * @param {string} [input.exitPort]          Checkpoint of exit.
 * @param {string} [input.itinerary]         One line per leg.
 * @param {string} [input.accommodation]     Hotel or host address.
 * @param {number|string} [input.travellers] People applying together.
 * @param {number|string} [input.blankPages] Blank pages left in the passport.
 * @param {string} [input.tiesStatement]     Ties to the home country.
 * @returns {object} letter plus checks, or { error }.
 */
export function buildVietnamCoverLetter(input = {}) {
  const fullName = clean(input.fullName);
  const passportNumber = clean(input.passportNumber);
  const nationality = clean(input.nationality);

  if (!fullName) return { error: "Enter your full name exactly as it appears in your passport." };
  if (fullName.length > MAX_TEXT) return { error: "That name is too long — keep it under 400 characters." };
  if (!passportNumber) return { error: "Enter your passport number." };

  const arrival = parseISODate(input.arrivalDate);
  const departure = parseISODate(input.departureDate);
  if (arrival === null) return { error: "Enter a valid arrival date in yyyy-mm-dd form." };
  if (departure === null) return { error: "Enter a valid departure date in yyyy-mm-dd form." };
  if (departure < arrival) return { error: "The departure date cannot fall before the arrival date." };

  const applied = parseISODate(input.applicationDate);
  if (applied === null) return { error: "Enter a valid application date in yyyy-mm-dd form." };

  const passportExpiry = parseISODate(input.passportExpiryDate);
  if (passportExpiry === null) return { error: "Enter a valid passport expiry date in yyyy-mm-dd form." };

  const travellersRaw = String(input.travellers ?? "1").trim() || "1";
  const travellers = Number(travellersRaw);
  if (!Number.isInteger(travellers) || travellers < 1 || travellers > 20) {
    return { error: "Number of applicants must be a whole number between 1 and 20." };
  }

  const blankPagesRaw = String(input.blankPages ?? "4").trim() || "0";
  const blankPages = Number(blankPagesRaw);
  if (!Number.isInteger(blankPages) || blankPages < 0 || blankPages > 60) {
    return { error: "Blank passport pages must be a whole number between 0 and 60." };
  }

  const validityRaw = String(input.requestedValidityDays ?? String(EVISA_MAX_STAY_DAYS)).trim();
  const requestedValidityDays = Number(validityRaw === "" ? EVISA_MAX_STAY_DAYS : validityRaw);
  if (
    !Number.isInteger(requestedValidityDays) ||
    requestedValidityDays < 1 ||
    requestedValidityDays > EVISA_MAX_STAY_DAYS
  ) {
    return { error: `Requested validity must be a whole number of days between 1 and ${EVISA_MAX_STAY_DAYS}.` };
  }

  const visaType = VISA_TYPES.find((item) => item.id === input.visaTypeId) ?? VISA_TYPES[0];
  const purpose = PURPOSE_OPTIONS.find((item) => item.id === input.purposeId) ?? PURPOSE_OPTIONS[0];

  const stayDays = daysOfStay(arrival, departure);
  // The validity period runs from the requested valid-from date and includes it.
  const validUntil = addDaysUTC(arrival, requestedValidityDays - 1);
  const daysBeyondValidity = Math.max(0, daysBetween(validUntil, departure));
  const withinValidity = daysBeyondValidity === 0;

  const passportRequiredUntil = addMonthsUTC(arrival, PASSPORT_MONTHS_FROM_ENTRY);
  const passportValidityOk = passportExpiry >= passportRequiredUntil;
  const blankPagesOk = blankPages >= MIN_BLANK_PAGES;

  const decisionBy = addWorkingDaysUTC(applied, PROCESSING_WORKING_DAYS);
  const decisionBeforeTravel = decisionBy <= arrival;
  const leadDays = daysBetween(applied, arrival);

  const feePerApplicantUsd = visaType.feeUsd;
  const totalFeeUsd = feePerApplicantUsd * travellers;

  const warnings = [];
  if (stayDays > EVISA_MAX_STAY_DAYS) {
    warnings.push(
      `You have described ${plural(stayDays, "day")} in Vietnam. An e-visa is issued for a maximum of ${EVISA_MAX_STAY_DAYS} days, so a longer stay needs a different visa category or a fresh application from outside the country.`,
    );
  } else if (!withinValidity) {
    warnings.push(
      `You asked for ${plural(requestedValidityDays, "day")} of validity from ${formatLongDate(arrival)}, which runs to ${formatLongDate(validUntil)}. Leaving on ${formatLongDate(departure)} would be ${plural(daysBeyondValidity, "day")} past the valid-to date — request the full period you need, up to ${EVISA_MAX_STAY_DAYS} days.`,
    );
  }
  if (!passportValidityOk) {
    warnings.push(
      `Your passport expires on ${formatLongDate(passportExpiry)}. Vietnam requires at least six months of validity from the date of entry — to ${formatLongDate(passportRequiredUntil)} in your case.`,
    );
  }
  if (!blankPagesOk) {
    warnings.push(
      `You listed ${plural(blankPages, "blank page")}. At least ${MIN_BLANK_PAGES} blank pages are required for entry and exit stamps.`,
    );
  }
  if (!decisionBeforeTravel) {
    warnings.push(
      `Processing takes three working days, so a decision on an application filed on ${formatLongDate(applied)} would not be expected before ${formatLongDate(decisionBy)} — after your arrival date. Apply earlier, and allow extra time around Vietnamese public holidays.`,
    );
  } else if (leadDays < 7) {
    warnings.push(
      `Only ${plural(leadDays, "day")} separate the application from your flight. Three working days is the published target, not a guarantee, so leave more room before non-refundable bookings.`,
    );
  }
  if (!clean(input.entryPort)) {
    warnings.push("Name the checkpoint you will enter through. E-visas are only accepted at designated international checkpoints, and the port you list on the application is the one printed on the visa.");
  }

  const occupation = clean(input.occupation);
  const employer = clean(input.employer);
  const homeAddress = clean(input.homeAddress);
  const contact = clean(input.contact);
  const entryPort = clean(input.entryPort);
  const exitPort = clean(input.exitPort);
  const accommodation = clean(input.accommodation);
  const tiesStatement = clean(input.tiesStatement);
  const itineraryLines = splitLines(input.itinerary);

  const letterLines = [
    formatLongDate(applied),
    "",
    "The Immigration Officer",
    "Vietnam Immigration Department — National Portal on Immigration",
    "",
    `Subject: Application for ${indefiniteArticle(visaType.noun)} ${visaType.noun} — ${fullName}, passport ${passportNumber}`,
    "",
    "Dear Sir or Madam,",
    "",
    `I am applying through the official e-visa portal for ${indefiniteArticle(visaType.noun)} ${visaType.noun} to Vietnam for the purpose of ${purpose.sentence}. ${nationality ? `I am ${indefiniteArticle(nationality)} ${nationality} citizen holding` : "I hold"} passport ${passportNumber}, valid until ${formatLongDate(passportExpiry)} and containing ${plural(blankPages, "blank page")}.${homeAddress ? ` I live at ${homeAddress}.` : ""}${contact ? ` I can be reached at ${contact}.` : ""}`,
    "",
    `I request validity from ${formatLongDate(arrival)} to ${formatLongDate(validUntil)}, a period of ${plural(requestedValidityDays, "day")} within the ninety-day maximum. I intend to arrive on ${formatLongDate(arrival)}${entryPort ? ` through ${entryPort}` : ""} and to leave on ${formatLongDate(departure)}${exitPort ? ` from ${exitPort}` : ""}, a stay of ${plural(stayDays, "day")}. I will not enter before the valid-from date and will leave on or before the valid-to date.`,
  ];

  if (itineraryLines.length) {
    letterLines.push("", "My planned itinerary is:", ...itineraryLines.map((line) => `  • ${line}`));
  }

  if (accommodation) {
    letterLines.push("", `Accommodation: ${accommodation}. Booking confirmations are enclosed.`);
  }

  letterLines.push(
    "",
    `I am paying the e-visa fee of US$${feePerApplicantUsd} per applicant${travellers > 1 ? `, US$${totalFeeUsd} for ${plural(travellers, "applicant")}` : ""}, and I understand the fee is not refunded if the application is unsuccessful. My uploaded photograph and passport data page meet the portal's requirements.`,
  );

  const tiesParts = [];
  if (occupation) {
    tiesParts.push(
      employer
        ? `I work as ${occupation} at ${employer}, my leave for these dates is approved, and I return to work immediately afterwards.`
        : `I am ${occupation}, and the enclosed documents confirm my circumstances at home.`,
    );
  }
  if (tiesStatement) tiesParts.push(tiesStatement);
  tiesParts.push(
    "I will not work or engage in paid activity in Vietnam on this visa, and my home, family and financial commitments remain in my country of residence.",
  );
  letterLines.push("", tiesParts.join(" "));

  letterLines.push(
    "",
    "Attached to my application are a scan of my passport data page, a recent portrait photograph on a plain white background without glasses, my flight bookings and my accommodation confirmations. I am happy to provide anything further you require.",
    "",
    "Thank you for considering my application.",
    "",
    "Yours faithfully,",
    "",
    "",
    fullName,
    `Passport ${passportNumber}${nationality ? ` (${nationality})` : ""}`,
  );

  const checklist = [
    "E-visa application submitted on the official portal, evisa.gov.vn",
    "Clear colour scan of the passport data page, all four corners visible",
    "Recent 4x6 cm portrait photograph, white background, face forward, no glasses",
    `Passport valid to at least ${formatLongDate(passportRequiredUntil)} with ${MIN_BLANK_PAGES} or more blank pages`,
    `E-visa fee of US$${feePerApplicantUsd} per applicant — US$${totalFeeUsd} in total, non-refundable`,
    entryPort ? `Entry through the designated checkpoint you declared: ${entryPort}` : "Choose a designated international checkpoint for entry and declare it on the form",
    "Confirmed return or onward flight ticket",
    "Hotel bookings, or the host's address for the whole stay",
    "Printed copy of the approved e-visa to show at check-in and at immigration",
    "This cover letter, signed and dated",
  ];

  return {
    letter: letterLines.join("\n"),
    stayDays,
    requestedValidityDays,
    validUntil: formatLongDate(validUntil),
    withinValidity,
    daysBeyondValidity,
    passportRequiredUntil: formatLongDate(passportRequiredUntil),
    passportValidityOk,
    blankPages,
    blankPagesOk,
    decisionBy: formatLongDate(decisionBy),
    decisionBeforeTravel,
    leadDays,
    feePerApplicantUsd,
    totalFeeUsd,
    travellers,
    visaTypeLabel: visaType.label,
    maxStayDays: EVISA_MAX_STAY_DAYS,
    warnings,
    checklist,
  };
}
