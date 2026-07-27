/**
 * Schengen Visa Cover Letter Builder — pure logic.
 *
 * Rules encoded here come from EU law, not from guesswork:
 *  - Short-stay limit: 90 days in any 180-day period, counting the day of entry
 *    and the day of exit as days of presence.
 *    Schengen Borders Code, Regulation (EU) 2016/399, Article 6(1)(a) and 6(2).
 *  - Travel medical insurance: minimum cover EUR 30,000, valid for the whole
 *    territory and the whole stay, covering repatriation and emergency care.
 *    Visa Code, Regulation (EC) No 810/2009, Article 15.
 *  - Passport validity: valid for at least 3 months after the intended date of
 *    departure from the territory of the Member States, and issued within the
 *    previous 10 years. Visa Code, Article 12.
 *  - Lodging window: not more than 6 months before the start of the intended
 *    visit and, as a rule, not later than 15 calendar days before it.
 *    Visa Code, Article 9(1).
 *  - Decision time: 15 calendar days, extendable to 45 in individual cases.
 *    Visa Code, Article 23(1) and (3).
 *  - Visa fee: EUR 90 for applicants aged 12 and over, EUR 45 for children aged
 *    6 to 11, free under 6. Visa Code Article 16 as revised with effect from
 *    11 June 2024.
 *  - Competent consulate: the Member State of the main destination, or the
 *    Member State of first entry when no main destination can be determined.
 *    Visa Code, Article 5.
 *
 * Nothing here is legal advice; consulate practice varies.
 */

/** 90 days of presence allowed in any rolling 180-day reference period. */
export const MAX_STAY_DAYS = 90;
/** Length of the rolling reference period used by the 90/180 rule, in days. */
export const REFERENCE_PERIOD_DAYS = 180;
/** Minimum travel medical insurance cover, in euro (Visa Code Art. 15). */
export const MIN_INSURANCE_COVER_EUR = 30000;
/** Passport must stay valid this many months past the departure date. */
export const PASSPORT_MONTHS_AFTER_DEPARTURE = 3;
/** Passport must have been issued within this many years. */
export const PASSPORT_MAX_AGE_YEARS = 10;
/** Earliest lodging: this many months before the intended entry date. */
export const EARLIEST_LODGING_MONTHS = 6;
/** Latest ordinary lodging: this many calendar days before entry. */
export const LATEST_LODGING_DAYS = 15;
/** Standard decision period in calendar days, and the extended maximum. */
export const DECISION_DAYS_STANDARD = 15;
export const DECISION_DAYS_EXTENDED = 45;

/** Visa fee bands in euro, effective 11 June 2024. */
export const FEE_BANDS = [
  { id: "adult", label: "Applicant aged 12 or over", feeEur: 90 },
  { id: "child6to11", label: "Child aged 6 to 11", feeEur: 45 },
  { id: "childUnder6", label: "Child under 6", feeEur: 0 },
];

export const PURPOSE_OPTIONS = [
  { id: "tourism", label: "Tourism and sightseeing", sentence: "tourism and sightseeing" },
  { id: "family", label: "Visiting family or friends", sentence: "visiting my family and friends" },
  { id: "business", label: "Business meetings", sentence: "attending business meetings" },
  { id: "conference", label: "Conference or trade fair", sentence: "attending a conference / trade fair" },
  { id: "study", label: "Short course or training", sentence: "a short course of study and training" },
  { id: "medical", label: "Planned medical treatment", sentence: "planned medical treatment" },
];

export const FUNDING_OPTIONS = [
  { id: "self", label: "I am funding the trip myself" },
  { id: "sponsor", label: "A sponsor is funding the trip" },
  { id: "employer", label: "My employer is funding the trip" },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86400000;
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Parse a yyyy-mm-dd string into a UTC timestamp, rejecting impossible dates.
 * @returns {number|null} milliseconds since epoch, or null when invalid.
 */
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

/** Days of presence between two dates counting both endpoints (SBC Art. 6(2)). */
export function daysOfPresence(startMs, endMs) {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return 0;
  return Math.round((endMs - startMs) / DAY_MS) + 1;
}

/** Whole calendar days between two dates, endpoints not both counted. */
export function calendarDaysBetween(fromMs, toMs) {
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) return 0;
  return Math.round((toMs - fromMs) / DAY_MS);
}

/** Add months to a UTC timestamp, clamping to the last day of a short month. */
export function addMonthsUTC(stamp, months) {
  const date = new Date(stamp);
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, lastDay));
}

/** Format a UTC timestamp as "14 August 2026". */
export function formatLongDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

const MAX_TEXT = 400;
const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

/** "a" or "an" for a following word, so "an Indian citizen" reads correctly. */
export function indefiniteArticle(word) {
  return /^[aeiou]/i.test(String(word).trim()) ? "an" : "a";
}

/** Pluralise a unit noun without printing "day(s)". */
export function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function splitLines(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Build the Schengen cover letter and the compliance checks that go with it.
 *
 * @param {object} input
 * @param {string} input.fullName            Applicant name as printed in the passport.
 * @param {string} input.nationality         Citizenship shown in the passport.
 * @param {string} input.passportNumber      Passport document number.
 * @param {string} input.passportIssueDate   yyyy-mm-dd.
 * @param {string} input.passportExpiryDate  yyyy-mm-dd.
 * @param {string} input.occupation          Job title or "Student", "Retired".
 * @param {string} [input.employer]          Employer or institution.
 * @param {string} [input.homeAddress]       Residential address.
 * @param {string} [input.contact]           Email and phone.
 * @param {string} input.mainDestination     Member State of main destination.
 * @param {string} [input.consulateCity]     City of the consulate or VAC.
 * @param {string} input.purposeId           One of PURPOSE_OPTIONS ids.
 * @param {string} input.entryDate           yyyy-mm-dd first day in the Schengen area.
 * @param {string} input.exitDate            yyyy-mm-dd last day in the Schengen area.
 * @param {string} input.applicationDate     yyyy-mm-dd the application is lodged.
 * @param {string} [input.itinerary]         One "date — city — activity" line per row.
 * @param {string} [input.accommodation]     Hotel or host details.
 * @param {string} input.fundingId           One of FUNDING_OPTIONS ids.
 * @param {string} [input.sponsorName]       Sponsor or employer paying, when relevant.
 * @param {number|string} input.budgetEur    Total funds available for the trip, in euro.
 * @param {string} [input.insurerName]       Travel medical insurer.
 * @param {number|string} [input.insuranceCoverEur] Cover amount, in euro.
 * @param {number|string} [input.priorDaysUsed] Days already spent in the area in the
 *                                              180 days before the entry date.
 * @param {string} [input.feeBandId]         One of FEE_BANDS ids.
 * @param {string} [input.tiesStatement]     Free text on ties to the home country.
 * @returns {object} letter plus checks, or { error } when the input cannot be used.
 */
export function buildSchengenCoverLetter(input = {}) {
  const fullName = clean(input.fullName);
  const nationality = clean(input.nationality);
  const passportNumber = clean(input.passportNumber);
  const mainDestination = clean(input.mainDestination);
  const occupation = clean(input.occupation);

  if (!fullName) return { error: "Enter your full name exactly as it appears in your passport." };
  if (fullName.length > MAX_TEXT) return { error: "That name is too long — keep it under 400 characters." };
  if (!passportNumber) return { error: "Enter your passport number." };
  if (!mainDestination) return { error: "Enter the Schengen state where you will spend the most nights." };

  const entry = parseISODate(input.entryDate);
  const exit = parseISODate(input.exitDate);
  if (entry === null) return { error: "Enter a valid arrival date in yyyy-mm-dd form." };
  if (exit === null) return { error: "Enter a valid departure date in yyyy-mm-dd form." };
  if (exit < entry) return { error: "The departure date cannot fall before the arrival date." };

  const applied = parseISODate(input.applicationDate);
  if (applied === null) return { error: "Enter a valid application date in yyyy-mm-dd form." };

  const passportExpiry = parseISODate(input.passportExpiryDate);
  if (passportExpiry === null) return { error: "Enter a valid passport expiry date in yyyy-mm-dd form." };
  const passportIssue = parseISODate(input.passportIssueDate);
  if (passportIssue === null) return { error: "Enter a valid passport issue date in yyyy-mm-dd form." };
  if (passportIssue >= passportExpiry) {
    return { error: "The passport issue date must fall before its expiry date." };
  }

  const budgetEur = Number(String(input.budgetEur ?? "").replace(/,/g, "").trim());
  if (!Number.isFinite(budgetEur) || budgetEur < 0) {
    return { error: "Enter the funds available for the trip as a number of euro (0 or more)." };
  }

  const priorDaysRaw = String(input.priorDaysUsed ?? "0").trim() || "0";
  const priorDaysUsed = Number(priorDaysRaw);
  if (!Number.isInteger(priorDaysUsed) || priorDaysUsed < 0 || priorDaysUsed > REFERENCE_PERIOD_DAYS) {
    return {
      error: `Days already spent in the Schengen area must be a whole number between 0 and ${REFERENCE_PERIOD_DAYS}.`,
    };
  }

  const tripDays = daysOfPresence(entry, exit);
  if (tripDays > REFERENCE_PERIOD_DAYS) {
    return { error: "A short-stay visa cannot cover a trip longer than the 180-day reference period." };
  }

  const purpose = PURPOSE_OPTIONS.find((option) => option.id === input.purposeId) ?? PURPOSE_OPTIONS[0];
  const funding = FUNDING_OPTIONS.find((option) => option.id === input.fundingId) ?? FUNDING_OPTIONS[0];
  const feeBand = FEE_BANDS.find((band) => band.id === input.feeBandId) ?? FEE_BANDS[0];

  const daysUsedInWindow = priorDaysUsed + tripDays;
  const daysRemaining = MAX_STAY_DAYS - daysUsedInWindow;
  const dailyBudgetEur = tripDays > 0 ? budgetEur / tripDays : 0;

  const passportRequiredUntil = addMonthsUTC(exit, PASSPORT_MONTHS_AFTER_DEPARTURE);
  const passportValidityOk = passportExpiry >= passportRequiredUntil;
  const passportIssuedNoEarlierThan = addMonthsUTC(applied, -PASSPORT_MAX_AGE_YEARS * 12);
  const passportAgeOk = passportIssue >= passportIssuedNoEarlierThan;

  const leadDays = calendarDaysBetween(applied, entry);
  const earliestLodging = addMonthsUTC(entry, -EARLIEST_LODGING_MONTHS);
  const lodgingTooEarly = applied < earliestLodging;
  const lodgingTooLate = leadDays < LATEST_LODGING_DAYS;

  const coverRaw = String(input.insuranceCoverEur ?? "").trim();
  const insuranceCoverEur = coverRaw === "" ? null : Number(coverRaw.replace(/,/g, ""));
  if (insuranceCoverEur !== null && (!Number.isFinite(insuranceCoverEur) || insuranceCoverEur < 0)) {
    return { error: "Insurance cover must be a number of euro, or left blank." };
  }
  const insuranceOk = insuranceCoverEur !== null && insuranceCoverEur >= MIN_INSURANCE_COVER_EUR;

  const warnings = [];
  if (daysUsedInWindow > MAX_STAY_DAYS) {
    warnings.push(
      `This trip takes you to ${daysUsedInWindow} days of presence in the 180-day window; the limit is ${MAX_STAY_DAYS}. Shorten the stay or wait until earlier days roll out of the window.`,
    );
  }
  if (!passportValidityOk) {
    warnings.push(
      `Your passport expires on ${formatLongDate(passportExpiry)}. It must stay valid until at least ${formatLongDate(passportRequiredUntil)} — three months past your departure date.`,
    );
  }
  if (!passportAgeOk) {
    warnings.push(
      `Your passport was issued on ${formatLongDate(passportIssue)}, more than ten years before the application date. Consulates require a passport issued within the previous ten years.`,
    );
  }
  if (lodgingTooEarly) {
    warnings.push(
      `Applications are accepted at most six months before travel; the earliest lodging date for this trip is ${formatLongDate(earliestLodging)}.`,
    );
  }
  if (lodgingTooLate) {
    warnings.push(
      `You are lodging ${plural(leadDays, "day")} before departure. The rule of thumb is at least ${LATEST_LODGING_DAYS} calendar days, and consulates may need up to ${DECISION_DAYS_EXTENDED}.`,
    );
  }
  if (!insuranceOk) {
    warnings.push(
      `Travel medical insurance must cover at least EUR ${MIN_INSURANCE_COVER_EUR.toLocaleString("en-US")} across the whole Schengen area, including repatriation.`,
    );
  }
  if (budgetEur > 0 && dailyBudgetEur < 50) {
    warnings.push(
      `Your stated funds work out to about EUR ${dailyBudgetEur.toFixed(0)} per day. Most Schengen states publish a means-of-subsistence figure in the EUR 40–100 per day range, so add bank evidence or a sponsor letter.`,
    );
  }

  const itineraryLines = splitLines(input.itinerary);
  const accommodation = clean(input.accommodation);
  const contact = clean(input.contact);
  const homeAddress = clean(input.homeAddress);
  const employer = clean(input.employer);
  const sponsorName = clean(input.sponsorName);
  const consulateCity = clean(input.consulateCity);
  const insurerName = clean(input.insurerName);
  const tiesStatement = clean(input.tiesStatement);

  let fundingSentence;
  if (funding.id === "sponsor") {
    fundingSentence = `The trip is funded by ${sponsorName || "my sponsor"}, whose sponsorship letter, identity document and bank statements are enclosed.`;
  } else if (funding.id === "employer") {
    fundingSentence = `The trip is funded by my employer, ${sponsorName || employer || "my employer"}, and the enclosed company letter confirms that travel and accommodation costs are covered.`;
  } else {
    fundingSentence = "I am funding the trip myself from my own savings, evidenced by the enclosed bank statements.";
  }

  const employmentSentence = employer
    ? `I work as ${occupation || "an employee"} at ${employer}, and my employer has approved leave for the dates above.`
    : occupation
      ? `I am ${occupation}, and my supporting documents confirm my current status.`
      : "";

  const letterLines = [
    formatLongDate(applied),
    "",
    `The Visa Officer${consulateCity ? `\nConsulate of ${mainDestination}, ${consulateCity}` : `\nConsulate of ${mainDestination}`}`,
    "",
    `Subject: Application for a Schengen short-stay (Type C) visa — ${fullName}, passport ${passportNumber}`,
    "",
    "Dear Sir or Madam,",
    "",
    `I am writing in support of my application for a Schengen short-stay visa for the purpose of ${purpose.sentence}. ${nationality ? `I am ${indefiniteArticle(nationality)} ${nationality} citizen holding` : "I hold"} passport ${passportNumber}, valid until ${formatLongDate(passportExpiry)}.${homeAddress ? ` I live at ${homeAddress}.` : ""}${contact ? ` I can be reached at ${contact}.` : ""}`,
    "",
    `I intend to enter the Schengen area on ${formatLongDate(entry)} and to leave on ${formatLongDate(exit)}, a stay of ${plural(tripDays, "day")} counting the day of entry and the day of exit. ${mainDestination} is my main destination, as it is where I will spend the greatest number of nights, which is why I am applying at this consulate. This stay keeps me within the 90 days permitted in any 180-day period.`,
  ];

  if (itineraryLines.length) {
    letterLines.push("", "My planned itinerary is:", ...itineraryLines.map((line) => `  • ${line}`));
  }

  if (accommodation) {
    letterLines.push("", `Accommodation is arranged as follows: ${accommodation}. Confirmations are enclosed.`);
  }

  letterLines.push(
    "",
    `${fundingSentence} I have set aside approximately EUR ${Math.round(budgetEur).toLocaleString("en-US")} for the trip, about EUR ${dailyBudgetEur.toFixed(0)} per day, for accommodation, transport, meals and incidental costs.`,
  );

  letterLines.push(
    "",
    insurerName
      ? `I hold travel medical insurance with ${insurerName}${insuranceCoverEur ? ` for EUR ${Math.round(insuranceCoverEur).toLocaleString("en-US")}` : ""}, valid throughout the Schengen area for the whole period of the stay and covering emergency treatment and repatriation.`
      : `I will hold travel medical insurance valid throughout the Schengen area for the whole stay, with cover of at least EUR ${MIN_INSURANCE_COVER_EUR.toLocaleString("en-US")} for emergency treatment and repatriation.`,
  );

  if (employmentSentence || tiesStatement) {
    letterLines.push(
      "",
      [employmentSentence, tiesStatement].filter(Boolean).join(" ") +
        " I will return to my country of residence before my authorised stay ends and have no intention of remaining in the Schengen area beyond the dates stated.",
    );
  } else {
    letterLines.push(
      "",
      "I will return to my country of residence before my authorised stay ends and have no intention of remaining in the Schengen area beyond the dates stated.",
    );
  }

  letterLines.push(
    "",
    "I have enclosed the completed application form, photographs, passport and copies, travel and accommodation bookings, insurance certificate, financial evidence and proof of my ties at home. I am happy to supply anything further you need.",
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
    "Completed and signed harmonised application form",
    "One recent ICAO-compliant photograph",
    `Passport issued within the last ${PASSPORT_MAX_AGE_YEARS} years, valid to at least ${formatLongDate(passportRequiredUntil)}, with two blank pages`,
    `Travel medical insurance of at least EUR ${MIN_INSURANCE_COVER_EUR.toLocaleString("en-US")} valid across the Schengen area`,
    "Return or onward flight reservation and internal travel bookings",
    "Accommodation booking, or an official invitation / proof-of-sponsorship form",
    "Bank statements for the last three to six months and proof of income",
    funding.id === "self" ? "Payslips or tax return supporting your own funds" : "Sponsor's identity document, bank statements and signed sponsorship letter",
    "Proof of ties: employment or study letter, property papers, family documents",
    `Visa fee of EUR ${feeBand.feeEur} (${feeBand.label.toLowerCase()}), plus any service-provider charge`,
    "This cover letter, signed and dated",
  ];

  return {
    letter: letterLines.join("\n"),
    tripDays,
    priorDaysUsed,
    daysUsedInWindow,
    daysRemaining,
    withinNinetyRule: daysUsedInWindow <= MAX_STAY_DAYS,
    dailyBudgetEur,
    budgetEur,
    leadDays,
    earliestLodgingDate: formatLongDate(earliestLodging),
    decisionWindow: `${DECISION_DAYS_STANDARD}–${DECISION_DAYS_EXTENDED} calendar days`,
    feeEur: feeBand.feeEur,
    feeLabel: feeBand.label,
    passportRequiredUntil: formatLongDate(passportRequiredUntil),
    passportValidityOk,
    passportAgeOk,
    insuranceOk,
    warnings,
    checklist,
    wordCount: letterLines.join(" ").split(/\s+/).filter(Boolean).length,
  };
}
