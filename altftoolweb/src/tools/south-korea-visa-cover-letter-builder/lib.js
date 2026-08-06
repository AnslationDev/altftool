/**
 * South Korea Visa Cover Letter Builder — pure logic.
 *
 * Rules encoded here, from Korean Ministry of Foreign Affairs and Ministry of
 * Justice (HiKorea / Korea Visa Portal) guidance:
 *  - The short-term visit visa is the C-3 series; C-3-9 covers general tourism
 *    and C-3-1 short-term business. The period of sojourn granted is up to
 *    90 days, counted with the day of entry as day one.
 *  - A single-entry short-term visa must be used within three months of the
 *    date of issue; after that it lapses whether or not it was used. Double-entry
 *    is commonly 6 months. Multiple-entry validity is not a single fixed period —
 *    it is commonly 1, 3 or 5 years depending on the mission and nationality — so
 *    it is treated as approximate rather than a definite lapse date below.
 *  - Standard consular fees for short-term visas of up to 90 days are US$40 for
 *    single entry, US$70 for double entry and US$90 for multiple entry. Some
 *    nationalities are exempt or pay a reduced fee under bilateral agreements,
 *    and the local mission may add a service charge.
 *  - Passports must be valid for at least six months from the date of entry.
 *  - K-ETA is the travel authorisation for visa-exempt travellers only. If you
 *    hold a visa you do not apply for K-ETA as well.
 *  - Staying beyond the sojourn period stamped on entry requires an extension
 *    applied for through HiKorea before the period expires; it is not automatic.
 *  - Applications are lodged at the Korean embassy or consulate with
 *    jurisdiction over your place of residence, or through the Korea Visa
 *    Portal where that is available.
 *
 * Informational only — not immigration advice.
 */

/** Maximum period of sojourn on a short-term visit visa, in days. */
export const SHORT_TERM_MAX_STAY_DAYS = 90;
/** A single-entry visa must be used within this many months of issue. */
export const SINGLE_ENTRY_VALIDITY_MONTHS = 3;
/** Passport validity required from the date of entry, in months. */
export const PASSPORT_MONTHS_FROM_ENTRY = 6;

export const VISA_TYPES = [
  {
    id: "c39-single",
    label: "C-3-9 general tourism — single entry",
    noun: "C-3-9 short-term visit (tourism) visa, single entry",
    feeUsd: 40,
    validityMonths: SINGLE_ENTRY_VALIDITY_MONTHS,
  },
  {
    id: "c39-double",
    label: "C-3-9 general tourism — double entry",
    noun: "C-3-9 short-term visit (tourism) visa, double entry",
    feeUsd: 70,
    validityMonths: 6,
  },
  {
    id: "c39-multiple",
    label: "C-3-9 general tourism — multiple entry",
    noun: "C-3-9 short-term visit (tourism) visa, multiple entry",
    feeUsd: 90,
    // Multiple-entry visas are commonly issued valid for 1, 3 or 5 years depending on the
    // mission and nationality — unlike the single/double-entry rows above, this isn't a
    // single fixed period, so 12 (the conservative low end) is a display default only and
    // must not be used to assert a confident "this visa has lapsed" claim. See
    // validityIsApproximate below.
    validityMonths: 12,
    validityIsApproximate: true,
  },
  {
    id: "c31-single",
    label: "C-3-1 short-term business — single entry",
    noun: "C-3-1 short-term business visa, single entry",
    feeUsd: 40,
    validityMonths: SINGLE_ENTRY_VALIDITY_MONTHS,
  },
  {
    id: "c34-single",
    label: "C-3-4 general short-term visit — single entry",
    noun: "C-3-4 general short-term visit visa, single entry",
    feeUsd: 40,
    validityMonths: SINGLE_ENTRY_VALIDITY_MONTHS,
  },
];

export const PURPOSE_OPTIONS = [
  { id: "tourism", label: "Tourism and sightseeing", sentence: "tourism and sightseeing" },
  { id: "family", label: "Visiting family or friends", sentence: "visiting my family in Korea" },
  { id: "business", label: "Short-term business meetings", sentence: "short-term business meetings with our Korean counterpart" },
  { id: "conference", label: "Conference or exhibition", sentence: "attending a conference and related meetings" },
  { id: "concert", label: "Concert, festival or event", sentence: "attending a scheduled concert and related events" },
  { id: "medical", label: "Medical consultation or treatment", sentence: "a medical consultation and follow-up treatment" },
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

/** Days of sojourn counting the day of entry as day one. */
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

/** Format a UTC timestamp as "21 May 2027". */
export function formatLongDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Last day of a 90-day sojourn beginning on the date of entry.
 * The day of entry counts as day one, so 90 days ends 89 days later.
 */
export function sojournEndsOn(arrivalMs, sojournDays = SHORT_TERM_MAX_STAY_DAYS) {
  return addDaysUTC(arrivalMs, Math.max(1, Math.floor(sojournDays)) - 1);
}

const MAX_TEXT = 400;
const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

function splitLines(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

// Words that start with a vowel LETTER but a consonant SOUND ("y"/"w") take "a", not "an" —
// e.g. "a Ukrainian citizen", "a European citizen", "a Uruguayan citizen", "a united front".
// Not exhaustive (English demonym pronunciation isn't derivable from spelling alone), but
// covers the common nationality/demonym cases this free-text field actually sees.
const CONSONANT_SOUND_VOWEL_WORDS = [
  /^ukrain/i,
  /^uruguay/i,
  /^europ/i,
  /^eu(ro|genic|phemi|calyp|nuch)/i,
  /^uni(on|fied|form|que|corn|versal|ted|ty|cycle)/i,
  /^us(a|ual|er|age)\b/i,
  /^one(\b|s\b)/i,
  /^once\b/i,
];

/** "a" or "an" for a following word. */
export function indefiniteArticle(word) {
  const trimmed = String(word ?? "").trim();
  if (!trimmed) return "a";
  if (CONSONANT_SOUND_VOWEL_WORDS.some((pattern) => pattern.test(trimmed))) return "a";
  return /^[aeiou]/i.test(trimmed) ? "an" : "a";
}

/** Pluralise a unit noun. */
export function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Build the Korean short-term visit cover letter and its checks.
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
 * @param {string} input.applicationDate     yyyy-mm-dd the application is lodged.
 * @param {string} [input.visaIssueDate]     yyyy-mm-dd the visa is expected to issue.
 * @param {string} [input.consulateCity]     Embassy or consulate city.
 * @param {string} input.arrivalDate         yyyy-mm-dd arrival in Korea.
 * @param {string} input.departureDate       yyyy-mm-dd departure from Korea.
 * @param {string} [input.itinerary]         One line per leg.
 * @param {string} [input.accommodation]     Hotel or host address.
 * @param {string} [input.inviterName]       Korean host, inviter or business contact.
 * @param {number|string} input.budgetUsd    Funds available for the trip, in US dollars.
 * @param {number|string} [input.applicants] People applying together.
 * @param {string} [input.tiesStatement]     Ties to the home country.
 * @returns {object} letter plus checks, or { error }.
 */
export function buildKoreaCoverLetter(input = {}) {
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

  const budgetUsd = Number(String(input.budgetUsd ?? "").replace(/,/g, "").trim());
  if (!Number.isFinite(budgetUsd) || budgetUsd < 0) {
    return { error: "Enter the funds available for the trip as a number of US dollars (0 or more)." };
  }

  const applicantsRaw = String(input.applicants ?? "1").trim() || "1";
  const applicants = Number(applicantsRaw);
  if (!Number.isInteger(applicants) || applicants < 1 || applicants > 20) {
    return { error: "Number of applicants must be a whole number between 1 and 20." };
  }

  const visaType = VISA_TYPES.find((item) => item.id === input.visaTypeId) ?? VISA_TYPES[0];
  const purpose = PURPOSE_OPTIONS.find((item) => item.id === input.purposeId) ?? PURPOSE_OPTIONS[0];

  const stayDays = daysOfStay(arrival, departure);
  const sojournLimit = sojournEndsOn(arrival, SHORT_TERM_MAX_STAY_DAYS);
  const withinSojourn = stayDays <= SHORT_TERM_MAX_STAY_DAYS;
  const sojournDaysLeft = SHORT_TERM_MAX_STAY_DAYS - stayDays;

  const passportRequiredUntil = addMonthsUTC(arrival, PASSPORT_MONTHS_FROM_ENTRY);
  const passportValidityOk = passportExpiry >= passportRequiredUntil;

  const issue = parseISODate(input.visaIssueDate);
  let visaUsableUntil = null;
  let entryWithinVisaValidity = null;
  if (issue !== null) {
    visaUsableUntil = addMonthsUTC(issue, visaType.validityMonths);
    entryWithinVisaValidity = arrival <= visaUsableUntil;
  }

  const feePerApplicantUsd = visaType.feeUsd;
  const totalFeeUsd = feePerApplicantUsd * applicants;
  const dailyBudgetUsd = stayDays > 0 ? budgetUsd / stayDays : 0;
  const perPersonPerDayUsd = dailyBudgetUsd / applicants;
  const leadDays = daysBetween(applied, arrival);

  const warnings = [];
  if (!withinSojourn) {
    warnings.push(
      `You have described ${plural(stayDays, "day")}. A short-term visit visa permits a sojourn of up to ${SHORT_TERM_MAX_STAY_DAYS} days counting the day of entry, so this trip would end after ${formatLongDate(sojournLimit)}. Shorten the stay or apply through HiKorea for an extension before the period expires.`,
    );
  }
  if (!passportValidityOk) {
    warnings.push(
      `Your passport expires on ${formatLongDate(passportExpiry)}. Korea requires at least six months of validity from the date of entry — to ${formatLongDate(passportRequiredUntil)} in your case.`,
    );
  }
  if (entryWithinVisaValidity === false && visaType.validityIsApproximate) {
    warnings.push(
      `Multiple-entry visas are commonly valid for 1, 3 or 5 years depending on the mission and nationality, not a fixed period — check the expiry date printed on your visa sticker or grant notice rather than assuming it lapses ${plural(visaType.validityMonths, "month")} after the issue date of ${formatLongDate(issue)} shown here.`,
    );
  } else if (entryWithinVisaValidity === false) {
    warnings.push(
      `This visa must be used within ${plural(visaType.validityMonths, "month")} of issue. Issued on ${formatLongDate(issue)} it would lapse on ${formatLongDate(visaUsableUntil)}, before your arrival on ${formatLongDate(arrival)}.`,
    );
  }
  if (leadDays < 0) {
    warnings.push("Your arrival date falls before the application date — check the dates before you lodge.");
  } else if (leadDays < 14) {
    warnings.push(
      `Only ${plural(leadDays, "day")} separate the application from your flight. Korean missions commonly take one to two weeks and some require an interview, so avoid non-refundable bookings.`,
    );
  }
  if (perPersonPerDayUsd < 60) {
    warnings.push(
      `Your funds work out to about US$${perPersonPerDayUsd.toFixed(0)} per person per day. There is no published minimum, but consular officers ask for bank statements to see that the trip is affordable, so attach three to six months of them.`,
    );
  }
  if (!clean(input.accommodation)) {
    warnings.push("Add your accommodation. A confirmed hotel booking or the inviter's address is part of the standard C-3 document set.");
  }

  const occupation = clean(input.occupation);
  const employer = clean(input.employer);
  const homeAddress = clean(input.homeAddress);
  const contact = clean(input.contact);
  const consulateCity = clean(input.consulateCity);
  const inviterName = clean(input.inviterName);
  const accommodation = clean(input.accommodation);
  const tiesStatement = clean(input.tiesStatement);
  const itineraryLines = splitLines(input.itinerary);

  // withinSojourn distinguishes a normal trip from one whose stated dates already exceed
  // the 90-day limit. The two must not share one unconditional "I will leave well before
  // that date" sentence — that claim is only true in the first case, and stating it
  // alongside a departure date that is in fact after the limit would be a direct,
  // self-contradicting false statement in a document meant for a consular officer.
  const sojournSentence = withinSojourn
    ? `I plan to arrive in the Republic of Korea on ${formatLongDate(arrival)} and to depart on ${formatLongDate(departure)}, a sojourn of ${plural(stayDays, "day")} counting the day of entry. I understand that a short-term visit visa permits a stay of up to ninety days, which in my case would end on ${formatLongDate(sojournLimit)}, and I will leave well before that date.`
    : `I plan to arrive in the Republic of Korea on ${formatLongDate(arrival)} and to depart on ${formatLongDate(departure)}, a sojourn of ${plural(stayDays, "day")} counting the day of entry. I understand that a short-term visit visa permits a stay of only up to ninety days, which in my case would end on ${formatLongDate(sojournLimit)} — ${plural(Math.max(0, stayDays - SHORT_TERM_MAX_STAY_DAYS), "day")} short of the dates above. I will either shorten this visit to fit within the permitted sojourn or apply for an extension through HiKorea before the ninety-day period expires, and will not remain in Korea beyond what is authorised.`;

  const letterLines = [
    formatLongDate(applied),
    "",
    `The Consular Officer${consulateCity ? `\nEmbassy / Consulate General of the Republic of Korea, ${consulateCity}` : "\nEmbassy / Consulate General of the Republic of Korea"}`,
    "",
    `Subject: Application for ${indefiniteArticle(visaType.noun)} ${visaType.noun} — ${fullName}, passport ${passportNumber}`,
    "",
    "Dear Sir or Madam,",
    "",
    `I am applying for ${indefiniteArticle(visaType.noun)} ${visaType.noun} for the purpose of ${purpose.sentence}. ${nationality ? `I am ${indefiniteArticle(nationality)} ${nationality} citizen holding` : "I hold"} passport ${passportNumber}, valid until ${formatLongDate(passportExpiry)}.${homeAddress ? ` I live at ${homeAddress}.` : ""}${contact ? ` I can be reached at ${contact}.` : ""}`,
    "",
    sojournSentence,
  ];

  if (inviterName) {
    letterLines.push("", `My host and point of contact in Korea is ${inviterName}, whose invitation letter and identification are enclosed.`);
  }

  if (itineraryLines.length) {
    letterLines.push("", "My planned itinerary is:", ...itineraryLines.map((line) => `  • ${line}`));
  }

  if (accommodation) {
    letterLines.push("", `Accommodation: ${accommodation}. Booking confirmations are enclosed.`);
  }

  letterLines.push(
    "",
    `I have approximately US$${Math.round(budgetUsd).toLocaleString("en-US")} available for the trip${applicants > 1 ? ` for ${plural(applicants, "applicant")}` : ""}, about US$${perPersonPerDayUsd.toFixed(0)} per person per day, evidenced by the enclosed bank statements, and a confirmed return ticket. I am paying the consular fee of US$${feePerApplicantUsd} per applicant${applicants > 1 ? `, US$${totalFeeUsd} in total` : ""}.`,
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
    "I will not seek employment in Korea on this visa, my home, family and financial commitments remain in my country of residence, and I will depart before my period of sojourn expires.",
  );
  letterLines.push("", tiesParts.join(" "));

  letterLines.push(
    "",
    "Enclosed are the completed visa application form, a recent photograph, my passport and a copy of the data page, flight and hotel confirmations, bank statements, proof of employment and, where relevant, the invitation from my host. I am happy to supply anything further you require.",
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
    "Completed visa application form, signed",
    "One recent colour photograph, 3.5 x 4.5 cm, taken within the last six months",
    `Passport valid to at least ${formatLongDate(passportRequiredUntil)}, plus a copy of the data page`,
    "Confirmed round-trip flight reservation",
    "Hotel bookings for the whole stay, or the inviter's address and identification",
    "Bank statements for the last three to six months and proof of income",
    "Employment certificate or business registration showing approved leave and expected return",
    inviterName
      ? "Invitation letter from your Korean host, with a copy of their ID or business registration"
      : "Proof of ties at home: property, family or study documents",
    `Consular fee of US$${feePerApplicantUsd} per applicant — US$${totalFeeUsd} in total, plus any local service charge`,
    "K-ETA is for visa-exempt travellers only — do not apply for it as well if you hold this visa",
    "This cover letter, signed and dated",
  ];

  return {
    letter: letterLines.join("\n"),
    stayDays,
    sojournLimit: formatLongDate(sojournLimit),
    withinSojourn,
    sojournDaysLeft,
    passportRequiredUntil: formatLongDate(passportRequiredUntil),
    passportValidityOk,
    visaUsableUntil: visaUsableUntil === null ? null : formatLongDate(visaUsableUntil),
    entryWithinVisaValidity,
    feePerApplicantUsd,
    totalFeeUsd,
    applicants,
    dailyBudgetUsd,
    perPersonPerDayUsd,
    budgetUsd,
    leadDays,
    visaTypeLabel: visaType.label,
    maxStayDays: SHORT_TERM_MAX_STAY_DAYS,
    warnings,
    checklist,
  };
}
