/**
 * Malaysia Visa Cover Letter Builder — pure logic.
 *
 * Rules encoded here, from Malaysian Immigration Department (Jabatan Imigresen)
 * guidance on the eVISA and the Malaysia Digital Arrival Card:
 *  - Nationals who require a visa apply on the official eVISA portal. A
 *    single-entry eVISA is valid for three months from the date of issue and
 *    permits a social visit stay of up to 30 days per entry.
 *  - A multiple-entry visa, where the applicant's nationality qualifies, is
 *    issued for three or twelve months of validity, and each entry is still
 *    limited to a stay of up to 30 days.
 *  - The visa authorises travel to a Malaysian entry point. The social visit
 *    pass endorsed by the immigration officer at the counter sets the date you
 *    must leave by; this tool counts the 30 days with the day of entry as day
 *    one, but the endorsed date on the pass always governs.
 *  - The passport must be valid for at least six months from the date of entry.
 *  - Almost all foreign travellers must submit the Malaysia Digital Arrival Card
 *    (MDAC) online, free of charge, within three days before arrival counting
 *    the arrival day — so the window opens two days before the flight. Singapore
 *    citizens and certain pass and border-pass holders are exempt.
 *  - eVISA charges are made up of the visa fee for your nationality plus a
 *    processing charge, and both are shown on the portal before payment. They
 *    are not hard-coded here: enter the amount the portal quotes.
 *
 * Informational only — not immigration advice.
 */

/** Social visit stay permitted per entry, in days. */
export const SOCIAL_VISIT_STAY_DAYS = 30;
/** Single-entry eVISA validity, in months from the date of issue. */
export const SINGLE_ENTRY_VALIDITY_MONTHS = 3;
/** Malaysia Digital Arrival Card window, in days, counting the arrival day. */
export const MDAC_WINDOW_DAYS = 3;
/** Passport validity required from the date of entry, in months. */
export const PASSPORT_MONTHS_FROM_ENTRY = 6;

export const VISA_TYPES = [
  {
    id: "single",
    label: "eVISA — single entry (3 months validity)",
    noun: "single-entry eVISA",
    validityMonths: SINGLE_ENTRY_VALIDITY_MONTHS,
    multiple: false,
  },
  {
    id: "mev3",
    label: "Multiple-entry visa — 3 months validity",
    noun: "multiple-entry visa",
    validityMonths: 3,
    multiple: true,
  },
  {
    id: "mev12",
    label: "Multiple-entry visa — 12 months validity",
    noun: "multiple-entry visa",
    validityMonths: 12,
    multiple: true,
  },
];

export const PURPOSE_OPTIONS = [
  { id: "tourism", label: "Tourism and sightseeing", sentence: "tourism and sightseeing" },
  { id: "family", label: "Visiting family or friends", sentence: "visiting my family in Malaysia" },
  { id: "business", label: "Business meetings", sentence: "business meetings with our Malaysian partner" },
  { id: "conference", label: "Conference or exhibition", sentence: "attending a conference and related meetings" },
  { id: "medical", label: "Medical treatment", sentence: "planned medical treatment at a Malaysian hospital" },
  { id: "transit", label: "Transit and short stopover", sentence: "a short stopover before continuing onward" },
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

/** Days of stay counting the day of entry as day one. */
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

/** Format a UTC timestamp as "3 June 2027". */
export function formatLongDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Last day of a 30-day social visit pass, counting the entry day as day one. */
export function socialVisitPassEndsOn(arrivalMs, stayDays = SOCIAL_VISIT_STAY_DAYS) {
  return addDaysUTC(arrivalMs, Math.max(1, Math.floor(stayDays)) - 1);
}

/** Earliest day the Malaysia Digital Arrival Card may be submitted. */
export function mdacOpensOn(arrivalMs) {
  return addDaysUTC(arrivalMs, -(MDAC_WINDOW_DAYS - 1));
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
 * Build the Malaysia eVISA cover letter and its checks.
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
 * @param {string} input.applicationDate     yyyy-mm-dd the eVISA is applied for.
 * @param {string} [input.visaIssueDate]     yyyy-mm-dd the visa was or will be issued.
 * @param {string} input.arrivalDate         yyyy-mm-dd arrival in Malaysia.
 * @param {string} input.departureDate       yyyy-mm-dd departure from Malaysia.
 * @param {string} [input.entryPoint]        Airport or land checkpoint of entry.
 * @param {string} [input.itinerary]         One line per leg.
 * @param {string} [input.accommodation]     Hotel or host address.
 * @param {string} [input.hostName]          Malaysian host or business contact.
 * @param {number|string} input.budgetMyr    Funds available for the trip, in ringgit.
 * @param {number|string} [input.applicants] People applying together.
 * @param {number|string} [input.portalFeeMyr] Total eVISA charge quoted per applicant.
 * @param {string} [input.tiesStatement]     Ties to the home country.
 * @returns {object} letter plus checks, or { error }.
 */
export function buildMalaysiaCoverLetter(input = {}) {
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

  const budgetMyr = Number(String(input.budgetMyr ?? "").replace(/,/g, "").trim());
  if (!Number.isFinite(budgetMyr) || budgetMyr < 0) {
    return { error: "Enter the funds available for the trip as a number of ringgit (0 or more)." };
  }

  const applicantsRaw = String(input.applicants ?? "1").trim() || "1";
  const applicants = Number(applicantsRaw);
  if (!Number.isInteger(applicants) || applicants < 1 || applicants > 20) {
    return { error: "Number of applicants must be a whole number between 1 and 20." };
  }

  const portalFeeRaw = String(input.portalFeeMyr ?? "").trim();
  const portalFeeMyr = portalFeeRaw === "" ? null : Number(portalFeeRaw.replace(/,/g, ""));
  if (portalFeeMyr !== null && (!Number.isFinite(portalFeeMyr) || portalFeeMyr < 0)) {
    return { error: "The eVISA charge must be a number of ringgit, or left blank." };
  }

  const visaType = VISA_TYPES.find((item) => item.id === input.visaTypeId) ?? VISA_TYPES[0];
  const purpose = PURPOSE_OPTIONS.find((item) => item.id === input.purposeId) ?? PURPOSE_OPTIONS[0];

  const stayDays = daysOfStay(arrival, departure);
  const passEndsOn = socialVisitPassEndsOn(arrival);
  const withinPass = stayDays <= SOCIAL_VISIT_STAY_DAYS;
  const daysOverPass = Math.max(0, stayDays - SOCIAL_VISIT_STAY_DAYS);

  const passportRequiredUntil = addMonthsUTC(arrival, PASSPORT_MONTHS_FROM_ENTRY);
  const passportValidityOk = passportExpiry >= passportRequiredUntil;

  const issue = parseISODate(input.visaIssueDate);
  let visaUsableUntil = null;
  let entryWithinVisaValidity = null;
  if (issue !== null) {
    visaUsableUntil = addMonthsUTC(issue, visaType.validityMonths);
    entryWithinVisaValidity = arrival <= visaUsableUntil;
  }

  const mdacOpens = mdacOpensOn(arrival);
  const dailyBudgetMyr = stayDays > 0 ? budgetMyr / stayDays : 0;
  const perPersonPerDayMyr = dailyBudgetMyr / applicants;
  const totalPortalFeeMyr = portalFeeMyr === null ? null : portalFeeMyr * applicants;
  const leadDays = daysBetween(applied, arrival);

  const warnings = [];
  if (!withinPass) {
    warnings.push(
      `You have described ${plural(stayDays, "day")}, which is ${plural(daysOverPass, "day")} more than the 30-day social visit stay allowed per entry. Counting the day of entry, 30 days would end on ${formatLongDate(passEndsOn)} — shorten the trip or apply to the Immigration Department for an extension before the pass expires.`,
    );
  }
  if (!passportValidityOk) {
    warnings.push(
      `Your passport expires on ${formatLongDate(passportExpiry)}. Malaysia requires at least six months of validity from the date of entry — to ${formatLongDate(passportRequiredUntil)} in your case.`,
    );
  }
  if (entryWithinVisaValidity === false) {
    warnings.push(
      `${visaType.multiple ? "This multiple-entry visa" : "A single-entry eVISA"} is valid for ${plural(visaType.validityMonths, "month")} from issue. Issued on ${formatLongDate(issue)} it would lapse on ${formatLongDate(visaUsableUntil)}, before your arrival on ${formatLongDate(arrival)}.`,
    );
  }
  if (leadDays < 0) {
    warnings.push("Your arrival date falls before the application date — check the dates before you submit.");
  } else if (leadDays < 7) {
    warnings.push(
      `Only ${plural(leadDays, "day")} separate the eVISA application from your flight. The portal quotes a processing target, not a guarantee, and an unclear photograph or passport scan restarts the clock.`,
    );
  }
  if (!clean(input.entryPoint)) {
    warnings.push("Name the airport or checkpoint you will enter through — it is asked for on the application and helps the officer match your file to your ticket.");
  }
  if (budgetMyr > 0 && perPersonPerDayMyr < 150) {
    warnings.push(
      `Your funds work out to about RM ${perPersonPerDayMyr.toFixed(0)} per person per day. There is no published minimum, but immigration officers can ask visitors to show funds and a return ticket at the counter.`,
    );
  }

  const occupation = clean(input.occupation);
  const employer = clean(input.employer);
  const homeAddress = clean(input.homeAddress);
  const contact = clean(input.contact);
  const entryPoint = clean(input.entryPoint);
  const hostName = clean(input.hostName);
  const accommodation = clean(input.accommodation);
  const tiesStatement = clean(input.tiesStatement);
  const itineraryLines = splitLines(input.itinerary);

  const letterLines = [
    formatLongDate(applied),
    "",
    "The Visa Officer",
    "Immigration Department of Malaysia (eVISA)",
    "",
    `Subject: Application for ${indefiniteArticle(visaType.noun)} ${visaType.noun} — ${fullName}, passport ${passportNumber}`,
    "",
    "Dear Sir or Madam,",
    "",
    `I am applying through the official eVISA portal for ${indefiniteArticle(visaType.noun)} ${visaType.noun} for the purpose of ${purpose.sentence}. ${nationality ? `I am ${indefiniteArticle(nationality)} ${nationality} citizen holding` : "I hold"} passport ${passportNumber}, valid until ${formatLongDate(passportExpiry)}.${homeAddress ? ` I live at ${homeAddress}.` : ""}${contact ? ` I can be reached at ${contact}.` : ""}`,
    "",
    `I intend to arrive in Malaysia on ${formatLongDate(arrival)}${entryPoint ? ` through ${entryPoint}` : ""} and to depart on ${formatLongDate(departure)}, a stay of ${plural(stayDays, "day")}. I understand that the visa authorises travel to an entry point and that the immigration officer endorses the social visit pass, ordinarily for up to 30 days, and I will leave on or before the date endorsed on that pass.`,
  ];

  if (visaType.multiple) {
    letterLines.push(
      "",
      `As this is a multiple-entry visa, I understand that its ${plural(visaType.validityMonths, "month")} of validity govern when I may travel, while each individual entry is still limited to a social visit stay of up to 30 days.`,
    );
  }

  if (hostName) {
    letterLines.push("", `My host and point of contact in Malaysia is ${hostName}, whose letter and identification are enclosed.`);
  }

  if (itineraryLines.length) {
    letterLines.push("", "My planned itinerary is:", ...itineraryLines.map((line) => `  • ${line}`));
  }

  if (accommodation) {
    letterLines.push("", `Accommodation: ${accommodation}. Booking confirmations are enclosed.`);
  }

  letterLines.push(
    "",
    `I have approximately RM ${Math.round(budgetMyr).toLocaleString("en-MY")} available for the trip${applicants > 1 ? ` for ${plural(applicants, "traveller")}` : ""}, about RM ${perPersonPerDayMyr.toFixed(0)} per person per day, together with a confirmed return ticket. I will submit the Malaysia Digital Arrival Card online from ${formatLongDate(mdacOpens)}, within the three days before arrival.`,
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
    "I will not take up employment in Malaysia on this pass, and my home, family and financial commitments remain in my country of residence.",
  );
  letterLines.push("", tiesParts.join(" "));

  letterLines.push(
    "",
    "Uploaded with my application are a scan of my passport data page, a recent photograph meeting the portal's specification, my confirmed flight bookings, hotel reservations and bank statements. I am happy to provide anything further you require.",
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
    "eVISA application completed on the official Immigration Department portal",
    "Clear colour scan of the passport data page",
    "Recent passport-style photograph matching the portal's size and background rules",
    `Passport valid to at least ${formatLongDate(passportRequiredUntil)} with blank pages for stamps`,
    "Confirmed return or onward flight ticket",
    "Hotel bookings covering the whole stay, or the host's address and identification",
    "Bank statements for the last three months and proof of income",
    portalFeeMyr === null
      ? "eVISA charge — the visa fee for your nationality plus the processing charge, both shown on the portal before payment"
      : `eVISA charge of RM ${portalFeeMyr.toLocaleString("en-MY")} per applicant — RM ${totalPortalFeeMyr.toLocaleString("en-MY")} in total`,
    `Malaysia Digital Arrival Card, free, submitted from ${formatLongDate(mdacOpens)} onwards`,
    "Printed copy of the approved eVISA to show at check-in and at immigration",
    "This cover letter, signed and dated",
  ];

  return {
    letter: letterLines.join("\n"),
    stayDays,
    passEndsOn: formatLongDate(passEndsOn),
    withinPass,
    daysOverPass,
    passportRequiredUntil: formatLongDate(passportRequiredUntil),
    passportValidityOk,
    visaUsableUntil: visaUsableUntil === null ? null : formatLongDate(visaUsableUntil),
    entryWithinVisaValidity,
    mdacOpensOn: formatLongDate(mdacOpens),
    mdacClosesOn: formatLongDate(arrival),
    dailyBudgetMyr,
    perPersonPerDayMyr,
    budgetMyr,
    applicants,
    portalFeeMyr,
    totalPortalFeeMyr,
    leadDays,
    visaTypeLabel: visaType.label,
    socialVisitStayDays: SOCIAL_VISIT_STAY_DAYS,
    warnings,
    checklist,
  };
}
