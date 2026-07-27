/**
 * Singapore Visa Cover Letter Builder — pure logic.
 *
 * Rules encoded here, from Immigration & Checkpoints Authority (ICA) guidance:
 *  - A Singapore entry visa is applied for on Form 14A, submitted electronically
 *    through an authorised visa agent, a local contact, or a Singapore Overseas
 *    Mission. Only nationals of Assessment Level I and II countries need one.
 *  - The processing fee is SGD 30 per applicant and is not refunded if the
 *    application is unsuccessful.
 *  - A visa is permission to travel to a Singapore checkpoint, not permission to
 *    stay. An ICA officer at the checkpoint decides the length of the Short-Term
 *    Visit Pass, commonly up to 30 days for social visits.
 *  - Single and double-journey visas are valid for entry within five weeks
 *    (35 days) of issue. Multiple-journey visas may be issued for up to
 *    24 months.
 *  - Passports must be valid for at least six months from the date of entry.
 *  - Every traveller must submit the SG Arrival Card, free of charge, within
 *    three days before arrival counting the day of arrival itself — so the
 *    window opens two days before the flight.
 *  - Visitors must show sufficient funds and a confirmed onward or return ticket.
 *  - An extension of a Short-Term Visit Pass is requested through the ICA
 *    e-Service before the pass expires; it is not automatic.
 *
 * Informational only — not immigration advice.
 */

/** Visa processing fee per applicant, in Singapore dollars. */
export const VISA_FEE_SGD = 30;
/** SG Arrival Card window, in days, counting the day of arrival. */
export const SGAC_WINDOW_DAYS = 3;
/** Passport validity required from the date of entry, in months. */
export const PASSPORT_MONTHS_FROM_ENTRY = 6;
/** Length of the Short-Term Visit Pass commonly granted to social visitors. */
export const TYPICAL_VISIT_PASS_DAYS = 30;

export const VISA_TYPES = [
  {
    id: "single",
    label: "Single-journey visa",
    noun: "single-journey entry visa",
    validityDays: 35,
    validityText: "five weeks from the date of issue",
  },
  {
    id: "double",
    label: "Double-journey visa",
    noun: "double-journey entry visa",
    validityDays: 35,
    validityText: "five weeks from the date of issue",
  },
  {
    id: "multiple",
    label: "Multiple-journey visa (up to 24 months)",
    noun: "multiple-journey entry visa",
    validityDays: 730,
    validityText: "up to twenty-four months from the date of issue",
  },
];

export const PURPOSE_OPTIONS = [
  { id: "tourism", label: "Tourism and sightseeing", sentence: "tourism and sightseeing" },
  { id: "family", label: "Visiting family or friends", sentence: "visiting my family in Singapore" },
  { id: "business", label: "Business meetings", sentence: "business meetings with our Singapore counterpart" },
  { id: "conference", label: "Conference or exhibition", sentence: "attending a conference and related meetings" },
  { id: "medical", label: "Medical consultation or treatment", sentence: "a medical consultation and follow-up treatment" },
  { id: "transit", label: "Transit and short stopover", sentence: "a short stopover before continuing to my onward destination" },
];

export const SPONSOR_OPTIONS = [
  { id: "agent", label: "An authorised visa agent is submitting Form 14A" },
  { id: "localContact", label: "A Singapore local contact is submitting Form 14A" },
  { id: "mission", label: "I am applying through a Singapore Overseas Mission" },
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

/** Days in Singapore counting the arrival and departure days. */
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

/** Format a UTC timestamp as "8 April 2027". */
export function formatLongDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Earliest day the SG Arrival Card may be submitted.
 * Three days counting the arrival day means the window opens two days earlier.
 */
export function sgArrivalCardOpens(arrivalMs) {
  return addDaysUTC(arrivalMs, -(SGAC_WINDOW_DAYS - 1));
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
 * Build the Singapore visit-visa cover letter and its checks.
 *
 * @param {object} input
 * @param {string} input.fullName             Name as printed in the passport.
 * @param {string} [input.nationality]        Citizenship.
 * @param {string} input.passportNumber       Passport number.
 * @param {string} input.passportExpiryDate   yyyy-mm-dd.
 * @param {string} [input.occupation]         Job title or status.
 * @param {string} [input.employer]           Employer or institution.
 * @param {string} [input.homeAddress]        Residential address.
 * @param {string} [input.contact]            Email and phone.
 * @param {string} input.visaTypeId           One of VISA_TYPES ids.
 * @param {string} input.purposeId            One of PURPOSE_OPTIONS ids.
 * @param {string} input.sponsorId            One of SPONSOR_OPTIONS ids.
 * @param {string} [input.localContactName]   Singapore local contact and their status.
 * @param {string} input.applicationDate      yyyy-mm-dd Form 14A is submitted.
 * @param {string} [input.visaIssueDate]      yyyy-mm-dd the visa was or will be issued.
 * @param {string} input.arrivalDate          yyyy-mm-dd arrival in Singapore.
 * @param {string} input.departureDate        yyyy-mm-dd departure from Singapore.
 * @param {string} [input.onwardDestination]  Where you go next.
 * @param {string} [input.itinerary]          One line per day or leg.
 * @param {string} [input.accommodation]      Hotel or host address.
 * @param {number|string} input.budgetSgd     Funds available for the trip, in SGD.
 * @param {number|string} [input.applicants]  People applying together.
 * @param {string} [input.tiesStatement]      Ties to the home country.
 * @returns {object} letter plus checks, or { error }.
 */
export function buildSingaporeCoverLetter(input = {}) {
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

  const budgetSgd = Number(String(input.budgetSgd ?? "").replace(/,/g, "").trim());
  if (!Number.isFinite(budgetSgd) || budgetSgd < 0) {
    return { error: "Enter the funds available for the trip as a number of Singapore dollars (0 or more)." };
  }

  const applicantsRaw = String(input.applicants ?? "1").trim() || "1";
  const applicants = Number(applicantsRaw);
  if (!Number.isInteger(applicants) || applicants < 1 || applicants > 20) {
    return { error: "Number of applicants must be a whole number between 1 and 20." };
  }

  const visaType = VISA_TYPES.find((item) => item.id === input.visaTypeId) ?? VISA_TYPES[0];
  const purpose = PURPOSE_OPTIONS.find((item) => item.id === input.purposeId) ?? PURPOSE_OPTIONS[0];
  const sponsor = SPONSOR_OPTIONS.find((item) => item.id === input.sponsorId) ?? SPONSOR_OPTIONS[0];

  const stayDays = daysOfStay(arrival, departure);
  const passportRequiredUntil = addMonthsUTC(arrival, PASSPORT_MONTHS_FROM_ENTRY);
  const passportValidityOk = passportExpiry >= passportRequiredUntil;

  const sgacOpens = sgArrivalCardOpens(arrival);
  const totalFeeSgd = VISA_FEE_SGD * applicants;
  const dailyBudgetSgd = stayDays > 0 ? budgetSgd / stayDays : 0;
  const perPersonPerDaySgd = dailyBudgetSgd / applicants;
  const leadDays = daysBetween(applied, arrival);

  const visaIssue = parseISODate(input.visaIssueDate);
  let visaValidUntil = null;
  let entryWithinVisaValidity = null;
  if (visaIssue !== null) {
    visaValidUntil = addDaysUTC(visaIssue, visaType.validityDays);
    entryWithinVisaValidity = arrival <= visaValidUntil;
  }

  const warnings = [];
  if (!passportValidityOk) {
    warnings.push(
      `Your passport expires on ${formatLongDate(passportExpiry)}. Singapore requires validity of at least six months from the date of entry — to ${formatLongDate(passportRequiredUntil)} in your case.`,
    );
  }
  if (stayDays > TYPICAL_VISIT_PASS_DAYS) {
    warnings.push(
      `You have described ${plural(stayDays, "day")} in Singapore. The Short-Term Visit Pass granted at the checkpoint is commonly ${TYPICAL_VISIT_PASS_DAYS} days, and an extension has to be requested through the ICA e-Service before the pass expires. Say in your letter why the longer stay is needed.`,
    );
  }
  if (entryWithinVisaValidity === false) {
    warnings.push(
      `A ${visaType.label.toLowerCase()} is valid for ${visaType.validityText}. Issued on ${formatLongDate(visaIssue)} it would lapse on ${formatLongDate(visaValidUntil)}, before your arrival on ${formatLongDate(arrival)}.`,
    );
  }
  if (sponsor.id === "localContact" && !clean(input.localContactName)) {
    warnings.push(
      "Name your Singapore local contact. Form 14A requires a Singapore citizen, permanent resident or eligible pass holder to submit on your behalf when you are not using an authorised agent.",
    );
  }
  if (leadDays < 0) {
    warnings.push("Your arrival date falls before the application date — check the dates before you submit.");
  } else if (leadDays < 7) {
    warnings.push(
      `Only ${plural(leadDays, "day")} separate submission from arrival. ICA advises applying at least a week ahead; visas are not issued at the checkpoint.`,
    );
  }
  if (!clean(input.onwardDestination)) {
    warnings.push("Add your onward or return destination — a confirmed onward ticket is one of the entry requirements checked at the checkpoint.");
  }
  if (budgetSgd > 0 && perPersonPerDaySgd < 80) {
    warnings.push(
      `Your funds work out to about SGD ${perPersonPerDaySgd.toFixed(0)} per person per day. ICA publishes no fixed minimum, but officers may ask for evidence you can support yourself — carry bank statements or card limits.`,
    );
  }

  const occupation = clean(input.occupation);
  const employer = clean(input.employer);
  const homeAddress = clean(input.homeAddress);
  const contact = clean(input.contact);
  const localContactName = clean(input.localContactName);
  const accommodation = clean(input.accommodation);
  const onwardDestination = clean(input.onwardDestination);
  const tiesStatement = clean(input.tiesStatement);
  const itineraryLines = splitLines(input.itinerary);

  const submissionSentence =
    sponsor.id === "agent"
      ? "My Form 14A is being submitted electronically by an authorised visa agent."
      : sponsor.id === "localContact"
        ? `My Form 14A is being submitted by ${localContactName || "my local contact in Singapore"}, who is acting as my local contact.`
        : "My Form 14A is being lodged through the Singapore Overseas Mission accredited to my country.";

  const letterLines = [
    formatLongDate(applied),
    "",
    "The Visa Officer",
    "Immigration & Checkpoints Authority, Singapore",
    "",
    `Subject: Application for ${indefiniteArticle(visaType.noun)} ${visaType.noun} — ${fullName}, passport ${passportNumber}`,
    "",
    "Dear Sir or Madam,",
    "",
    `I am applying for ${indefiniteArticle(visaType.noun)} ${visaType.noun} to Singapore for the purpose of ${purpose.sentence}. ${nationality ? `I am ${indefiniteArticle(nationality)} ${nationality} citizen holding` : "I hold"} passport ${passportNumber}, valid until ${formatLongDate(passportExpiry)}.${homeAddress ? ` I live at ${homeAddress}.` : ""}${contact ? ` I can be reached at ${contact}.` : ""} ${submissionSentence}`,
    "",
    `I plan to arrive on ${formatLongDate(arrival)} and to leave on ${formatLongDate(departure)}, a stay of ${plural(stayDays, "day")}${onwardDestination ? `, continuing to ${onwardDestination}` : ""}. I understand that the visa is permission to travel to a Singapore checkpoint and that the ICA officer there decides the length of my Short-Term Visit Pass. I will leave on or before the date endorsed on that pass.`,
  ];

  if (localContactName) {
    letterLines.push("", `My local contact in Singapore is ${localContactName}, whose particulars are included in the Form 14A submission.`);
  }

  if (itineraryLines.length) {
    letterLines.push("", "My planned itinerary is:", ...itineraryLines.map((line) => `  • ${line}`));
  }

  if (accommodation) {
    letterLines.push("", `Accommodation: ${accommodation}. Booking confirmations are enclosed.`);
  }

  letterLines.push(
    "",
    `I have approximately SGD ${Math.round(budgetSgd).toLocaleString("en-SG")} available for the trip${applicants > 1 ? ` for ${plural(applicants, "traveller")}` : ""}, about SGD ${perPersonPerDaySgd.toFixed(0)} per person per day, and a confirmed onward ticket${onwardDestination ? ` to ${onwardDestination}` : ""}. I will submit the SG Arrival Card online in the three days before arrival, as required.`,
  );

  const tiesParts = [];
  if (occupation) {
    tiesParts.push(
      employer
        ? `I work as ${occupation} at ${employer}, my leave for these dates is approved, and I return to work immediately afterwards.`
        : `I am ${occupation}, and my supporting documents confirm my circumstances at home.`,
    );
  }
  if (tiesStatement) tiesParts.push(tiesStatement);
  tiesParts.push(
    "My home, family and financial commitments are outside Singapore, I will not seek employment during this visit, and I will depart before my visit pass expires.",
  );
  letterLines.push("", tiesParts.join(" "));

  letterLines.push(
    "",
    "Enclosed are my passport bio-page, a recent photograph meeting ICA specifications, the completed Form 14A, my flight and hotel confirmations, and financial documents. I am happy to provide anything further you require.",
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
    "Completed Form 14A, submitted electronically",
    "Passport bio-page, valid at least six months from the date of entry",
    "Recent colour photograph taken within the last three months, matching ICA specifications",
    "Confirmed return or onward air ticket",
    "Hotel booking, or the local contact's address and identification",
    "Proof of funds: bank statements or credit card limits",
    sponsor.id === "localContact"
      ? "Local contact's NRIC or pass details and their letter of support"
      : "Employment or study letter confirming approved leave",
    `Visa processing fee of SGD ${VISA_FEE_SGD} per applicant — SGD ${totalFeeSgd} in total, not refunded if refused`,
    `SG Arrival Card, submitted free of charge from ${formatLongDate(sgacOpens)} onwards`,
    "This cover letter, signed and dated",
  ];

  return {
    letter: letterLines.join("\n"),
    stayDays,
    passportRequiredUntil: formatLongDate(passportRequiredUntil),
    passportValidityOk,
    sgacOpensOn: formatLongDate(sgacOpens),
    sgacClosesOn: formatLongDate(arrival),
    totalFeeSgd,
    feePerApplicantSgd: VISA_FEE_SGD,
    applicants,
    dailyBudgetSgd,
    perPersonPerDaySgd,
    leadDays,
    visaValidUntil: visaValidUntil === null ? null : formatLongDate(visaValidUntil),
    entryWithinVisaValidity,
    visaTypeLabel: visaType.label,
    typicalVisitPassDays: TYPICAL_VISIT_PASS_DAYS,
    warnings,
    checklist,
  };
}
