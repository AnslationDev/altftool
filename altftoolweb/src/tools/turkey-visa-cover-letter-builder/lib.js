/**
 * Turkey (Türkiye) Visa Cover Letter Builder — pure logic.
 *
 * Rules encoded here, from Republic of Türkiye Ministry of Foreign Affairs
 * guidance and the official e-Visa portal:
 *  - Eligible nationalities apply on the official e-Visa system; everyone else
 *    applies for a sticker visa at a Turkish consulate. The e-Visa is normally
 *    issued with 180 days of validity, within which the holder may enter and
 *    stay for the period the visa states — commonly 30 or 90 days, single or
 *    multiple entry depending on nationality.
 *  - The stay allowance is subject to the 90-days-in-any-180-days rule that
 *    applies to visitors: total presence in Türkiye must not exceed 90 days in
 *    any 180-day period.
 *  - Passport rule: the travel document must remain valid for at least 60 days
 *    beyond the duration of stay granted by the visa, visa exemption or
 *    residence permit. For a 90-day stay that means 150 days of validity from
 *    entry, which is why so many travellers are turned away at check-in.
 *  - Visa fees vary by nationality and the portal shows the visa fee plus a
 *    service charge before payment, so no fee is hard-coded here.
 *  - The e-Visa is electronic; you print it or carry it on a device, and the
 *    passport used to apply must be the one presented at the border.
 *
 * Informational only — not immigration advice.
 */

/** Ordinary e-Visa validity, in days from the date of issue. */
export const EVISA_VALIDITY_DAYS = 180;
/** Maximum presence allowed in any rolling reference period. */
export const MAX_STAY_DAYS_PER_180 = 90;
/** Length of that rolling reference period, in days. */
export const REFERENCE_PERIOD_DAYS = 180;
/** Passport must remain valid this many days beyond the duration of stay. */
export const PASSPORT_DAYS_BEYOND_STAY = 60;

export const VISA_TYPES = [
  {
    id: "evisa-30-single",
    label: "e-Visa — single entry, 30-day stay",
    noun: "single-entry electronic visa with a 30-day stay",
    stayDays: 30,
    validityDays: EVISA_VALIDITY_DAYS,
  },
  {
    id: "evisa-30-multiple",
    label: "e-Visa — multiple entry, 30-day stay",
    noun: "multiple-entry electronic visa with a 30-day stay",
    stayDays: 30,
    validityDays: EVISA_VALIDITY_DAYS,
  },
  {
    id: "evisa-90-multiple",
    label: "e-Visa — multiple entry, 90-day stay",
    noun: "multiple-entry electronic visa with a 90-day stay",
    stayDays: 90,
    validityDays: EVISA_VALIDITY_DAYS,
  },
  {
    id: "sticker-90",
    label: "Consulate sticker visa — 90-day stay",
    noun: "tourist visa issued by a Turkish consulate with a 90-day stay",
    stayDays: 90,
    validityDays: EVISA_VALIDITY_DAYS,
  },
];

export const PURPOSE_OPTIONS = [
  { id: "tourism", label: "Tourism and sightseeing", sentence: "tourism and sightseeing" },
  { id: "family", label: "Visiting family or friends", sentence: "visiting my family in Türkiye" },
  { id: "business", label: "Business meetings", sentence: "business meetings with our Turkish supplier" },
  { id: "conference", label: "Conference or trade fair", sentence: "attending a trade fair and related meetings" },
  { id: "medical", label: "Medical or dental treatment", sentence: "planned medical treatment at a Turkish clinic" },
  { id: "transit", label: "Transit and short stopover", sentence: "a stopover before continuing to my onward destination" },
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

/** Days of presence counting the day of entry and the day of exit. */
export function daysOfPresence(startMs, endMs) {
  return daysBetween(startMs, endMs) + 1;
}

/** Add whole days to a UTC timestamp. */
export function addDaysUTC(stamp, days) {
  return stamp + days * DAY_MS;
}

/** Format a UTC timestamp as "7 August 2027". */
export function formatLongDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Last day of a stay allowance beginning on the date of entry. */
export function stayAllowanceEndsOn(arrivalMs, stayDays) {
  return addDaysUTC(arrivalMs, Math.max(1, Math.floor(stayDays)) - 1);
}

/**
 * Date the passport must remain valid to: 60 days beyond the duration of stay.
 * @param {number} arrivalMs Date of entry.
 * @param {number} stayDays  Duration of stay granted by the visa.
 */
export function passportValidRequiredUntil(arrivalMs, stayDays) {
  return addDaysUTC(stayAllowanceEndsOn(arrivalMs, stayDays), PASSPORT_DAYS_BEYOND_STAY);
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
 * Build the Türkiye visa cover letter and its checks.
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
 * @param {string} input.applicationDate     yyyy-mm-dd the application is made.
 * @param {string} [input.visaIssueDate]     yyyy-mm-dd the visa was or will be issued.
 * @param {string} input.arrivalDate         yyyy-mm-dd arrival in Türkiye.
 * @param {string} input.departureDate       yyyy-mm-dd departure from Türkiye.
 * @param {string} [input.entryPoint]        Airport or land border of entry.
 * @param {string} [input.itinerary]         One line per leg.
 * @param {string} [input.accommodation]     Hotel or host address.
 * @param {string} [input.hostName]          Turkish host or business contact.
 * @param {number|string} input.budgetEur    Funds available for the trip, in euro.
 * @param {number|string} [input.travellers] People travelling together.
 * @param {number|string} [input.priorDaysUsed] Days already spent in Türkiye in
 *                                              the 180 days before arrival.
 * @param {string} [input.tiesStatement]     Ties to the home country.
 * @returns {object} letter plus checks, or { error }.
 */
export function buildTurkeyCoverLetter(input = {}) {
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

  const budgetEur = Number(String(input.budgetEur ?? "").replace(/,/g, "").trim());
  if (!Number.isFinite(budgetEur) || budgetEur < 0) {
    return { error: "Enter the funds available for the trip as a number of euro (0 or more)." };
  }

  const travellersRaw = String(input.travellers ?? "1").trim() || "1";
  const travellers = Number(travellersRaw);
  if (!Number.isInteger(travellers) || travellers < 1 || travellers > 20) {
    return { error: "Number of travellers must be a whole number between 1 and 20." };
  }

  const priorRaw = String(input.priorDaysUsed ?? "0").trim() || "0";
  const priorDaysUsed = Number(priorRaw);
  if (!Number.isInteger(priorDaysUsed) || priorDaysUsed < 0 || priorDaysUsed > REFERENCE_PERIOD_DAYS) {
    return {
      error: `Days already spent in Türkiye must be a whole number between 0 and ${REFERENCE_PERIOD_DAYS}.`,
    };
  }

  const visaType = VISA_TYPES.find((item) => item.id === input.visaTypeId) ?? VISA_TYPES[0];
  const purpose = PURPOSE_OPTIONS.find((item) => item.id === input.purposeId) ?? PURPOSE_OPTIONS[0];

  const tripDays = daysOfPresence(arrival, departure);
  const stayEndsOn = stayAllowanceEndsOn(arrival, visaType.stayDays);
  const withinStayAllowance = tripDays <= visaType.stayDays;
  const daysOverAllowance = Math.max(0, tripDays - visaType.stayDays);

  const daysUsedInWindow = priorDaysUsed + tripDays;
  const withinNinetyRule = daysUsedInWindow <= MAX_STAY_DAYS_PER_180;
  const daysRemaining = MAX_STAY_DAYS_PER_180 - daysUsedInWindow;

  const passportRequiredUntil = passportValidRequiredUntil(arrival, visaType.stayDays);
  const passportValidityOk = passportExpiry >= passportRequiredUntil;
  const passportBufferDays = daysBetween(stayEndsOn, passportExpiry);

  const issue = parseISODate(input.visaIssueDate);
  let visaValidUntil = null;
  let entryWithinVisaValidity = null;
  if (issue !== null) {
    visaValidUntil = addDaysUTC(issue, visaType.validityDays);
    entryWithinVisaValidity = arrival <= visaValidUntil;
  }

  const dailyBudgetEur = tripDays > 0 ? budgetEur / tripDays : 0;
  const perPersonPerDayEur = dailyBudgetEur / travellers;
  const leadDays = daysBetween(applied, arrival);

  const warnings = [];
  if (!withinStayAllowance) {
    warnings.push(
      `Your ${visaType.label.toLowerCase()} allows ${plural(visaType.stayDays, "day")} of stay, ending ${formatLongDate(stayEndsOn)}, but you have described ${plural(tripDays, "day")} — ${plural(daysOverAllowance, "day")} too many. Shorten the trip or apply for a residence permit before the stay expires.`,
    );
  }
  if (!withinNinetyRule) {
    warnings.push(
      `Counting ${plural(priorDaysUsed, "day")} already spent in Türkiye, this trip would take you to ${daysUsedInWindow} days inside a 180-day period. Visitors are limited to ${MAX_STAY_DAYS_PER_180} days in any 180 days regardless of how many separate visas are used.`,
    );
  }
  if (!passportValidityOk) {
    warnings.push(
      `Your passport expires on ${formatLongDate(passportExpiry)}, ${plural(passportBufferDays, "day")} after your stay allowance ends. Türkiye requires validity for at least ${PASSPORT_DAYS_BEYOND_STAY} days beyond the duration of stay — to ${formatLongDate(passportRequiredUntil)} in your case. Airlines enforce this at check-in.`,
    );
  }
  if (entryWithinVisaValidity === false) {
    warnings.push(
      `An e-Visa is valid for ${EVISA_VALIDITY_DAYS} days from issue. Issued on ${formatLongDate(issue)} it would lapse on ${formatLongDate(visaValidUntil)}, before your arrival on ${formatLongDate(arrival)}.`,
    );
  }
  if (leadDays < 0) {
    warnings.push("Your arrival date falls before the application date — check the dates before you apply.");
  } else if (leadDays < 3) {
    warnings.push(
      `Only ${plural(leadDays, "day")} separate the application from your flight. The official portal usually issues within minutes, but payment failures and name mismatches do happen, so leave a margin.`,
    );
  }
  if (budgetEur > 0 && perPersonPerDayEur < 50) {
    warnings.push(
      `Your funds work out to about EUR ${perPersonPerDayEur.toFixed(0)} per person per day. Border officers may ask visitors to show funds, an onward ticket and accommodation, so carry statements or card evidence.`,
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
    "Republic of Türkiye — Consular Section / e-Visa system",
    "",
    `Subject: Application for ${indefiniteArticle(visaType.noun)} ${visaType.noun} — ${fullName}, passport ${passportNumber}`,
    "",
    "Dear Sir or Madam,",
    "",
    `I am applying for ${indefiniteArticle(visaType.noun)} ${visaType.noun} to Türkiye for the purpose of ${purpose.sentence}. ${nationality ? `I am ${indefiniteArticle(nationality)} ${nationality} citizen holding` : "I hold"} passport ${passportNumber}, valid until ${formatLongDate(passportExpiry)}.${homeAddress ? ` I live at ${homeAddress}.` : ""}${contact ? ` I can be reached at ${contact}.` : ""} The passport quoted here is the one I will present at the border.`,
    "",
    `I plan to arrive on ${formatLongDate(arrival)}${entryPoint ? ` at ${entryPoint}` : ""} and to depart on ${formatLongDate(departure)}, ${plural(tripDays, "day")} of presence counting the day of entry and the day of exit. My visa allows a stay of ${plural(visaType.stayDays, "day")}, which would run to ${formatLongDate(stayEndsOn)}, and I am aware that visitors may not exceed ninety days of presence in any one-hundred-and-eighty-day period.`,
  ];

  if (priorDaysUsed > 0) {
    letterLines.push(
      "",
      `In the one hundred and eighty days before this trip I have spent ${plural(priorDaysUsed, "day")} in Türkiye. Including this visit that comes to ${daysUsedInWindow} days, within the ninety permitted.`,
    );
  }

  if (hostName) {
    letterLines.push("", `My host and point of contact in Türkiye is ${hostName}, whose letter and identification are enclosed.`);
  }

  if (itineraryLines.length) {
    letterLines.push("", "My planned itinerary is:", ...itineraryLines.map((line) => `  • ${line}`));
  }

  if (accommodation) {
    letterLines.push("", `Accommodation: ${accommodation}. Booking confirmations are enclosed.`);
  }

  letterLines.push(
    "",
    `I have approximately EUR ${Math.round(budgetEur).toLocaleString("en-IE")} available for the trip${travellers > 1 ? ` for ${plural(travellers, "traveller")}` : ""}, about EUR ${perPersonPerDayEur.toFixed(0)} per person per day, together with a confirmed return ticket and travel insurance for the whole stay. My passport remains valid to ${formatLongDate(passportExpiry)}, ${passportValidityOk ? "which satisfies" : "against"} the requirement of validity for at least sixty days beyond the duration of stay.`,
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
    "I will not work or seek employment in Türkiye on this visa, and my home, family and financial commitments remain in my country of residence.",
  );
  letterLines.push("", tiesParts.join(" "));

  letterLines.push(
    "",
    "Enclosed are my passport bio-page, a recent photograph, confirmed flight bookings, hotel reservations, travel insurance and financial documents. I am happy to provide anything further you require.",
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
    "Application made on the official Türkiye e-Visa portal, or at a Turkish consulate for a sticker visa",
    `Passport valid to at least ${formatLongDate(passportRequiredUntil)} — sixty days beyond the duration of stay`,
    "The exact passport used for the application, carried at the border",
    "Confirmed return or onward ticket",
    "Hotel bookings covering the stay, or the host's address and identification",
    "Proof of funds: bank statements or card evidence",
    "Travel insurance covering medical treatment for the whole stay",
    hostName ? "Invitation letter from your host, with a copy of their identification" : "Employment or study letter confirming approved leave",
    "Visa fee plus service charge as quoted on the portal before payment — the amount depends on your nationality",
    "Printed or downloaded copy of the approved e-Visa",
    "This cover letter, signed and dated",
  ];

  return {
    letter: letterLines.join("\n"),
    tripDays,
    stayAllowanceDays: visaType.stayDays,
    stayEndsOn: formatLongDate(stayEndsOn),
    withinStayAllowance,
    daysOverAllowance,
    priorDaysUsed,
    daysUsedInWindow,
    withinNinetyRule,
    daysRemaining,
    passportRequiredUntil: formatLongDate(passportRequiredUntil),
    passportValidityOk,
    passportBufferDays,
    visaValidUntil: visaValidUntil === null ? null : formatLongDate(visaValidUntil),
    entryWithinVisaValidity,
    dailyBudgetEur,
    perPersonPerDayEur,
    budgetEur,
    travellers,
    leadDays,
    visaTypeLabel: visaType.label,
    warnings,
    checklist,
  };
}
