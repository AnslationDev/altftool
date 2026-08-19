/**
 * Australia Visa Cover Letter Builder — pure logic.
 *
 * Written for the Visitor visa (subclass 600). The rules encoded here:
 *  - Genuine visitor criterion: clause 600.211 of Schedule 2 to the Migration
 *    Regulations 1994 requires the applicant to intend a genuine temporary stay
 *    for the purpose claimed. The statement is where that intention is set out.
 *  - Public Interest Criterion 4020 (Schedule 4): a bogus document or false or
 *    misleading information leads to refusal and normally a three-year bar on
 *    further visas — ten years where identity is the issue. Everything in the
 *    letter must be true and match the supporting documents.
 *  - A subclass 600 visa is normally granted with a stay period of 3, 6 or 12
 *    months from the date of each entry, decided by the case officer.
 *  - Condition 8558: the holder must not stay in Australia as a non-resident for
 *    more than 12 months in any period of 18 months. This tool adds days already
 *    spent in Australia in the preceding 18 months to the planned trip.
 *  - Study or training on a visitor visa is limited to three months.
 *  - Work is not permitted on a Visitor visa.
 *  - Condition 8503 ("no further stay") may be attached, preventing most further
 *    visa applications while the holder is in Australia.
 *  - Condition 8501 may require adequate health insurance for the whole stay.
 *  - The visa application charge is set by the Department of Home Affairs and
 *    indexed on 1 July each year. This tool does not hard-code it: enter the
 *    current charge from the Home Affairs pricing tool and it is multiplied out.
 *
 * Informational only — not migration advice. Only a registered migration agent
 * or an Australian legal practitioner may advise on your own application.
 */

/** Stay periods a subclass 600 visa is normally granted for, in months. */
export const STAY_BANDS_MONTHS = [3, 6, 12];
/** Condition 8558: maximum days as a non-resident inside the rolling window. */
export const CONDITION_8558_MAX_DAYS = 365;
/** Length of the condition 8558 rolling window, in months. */
export const CONDITION_8558_WINDOW_MONTHS = 18;
/** Study or training permitted on a Visitor visa, in days (three months). */
export const STUDY_LIMIT_DAYS = 90;
/** Standard PIC 4020 exclusion period after a false document, in years. */
export const PIC_4020_EXCLUSION_YEARS = 3;

export const STREAM_OPTIONS = [
  { id: "tourist", label: "Tourist stream (applied outside Australia)", noun: "Visitor visa (subclass 600), Tourist stream" },
  { id: "business", label: "Business Visitor stream", noun: "Visitor visa (subclass 600), Business Visitor stream" },
  { id: "sponsored", label: "Sponsored Family stream", noun: "Visitor visa (subclass 600), Sponsored Family stream" },
];

export const PURPOSE_OPTIONS = [
  { id: "tourism", label: "Tourism and sightseeing", sentence: "tourism and sightseeing", isStudy: false },
  { id: "family", label: "Visiting family or friends", sentence: "visiting my family in Australia", isStudy: false },
  { id: "business", label: "Business meetings or negotiations", sentence: "business meetings and negotiations with our Australian partner", isStudy: false },
  { id: "conference", label: "Conference or trade show", sentence: "attending a conference and related professional meetings", isStudy: false },
  { id: "graduation", label: "Graduation ceremony", sentence: "attending my child's graduation ceremony", isStudy: false },
  { id: "training", label: "Short training or course (under 3 months)", sentence: "a short course of training", isStudy: true },
];

export const FUNDING_OPTIONS = [
  { id: "self", label: "I am funding the trip myself" },
  { id: "host", label: "My Australian host is funding the trip" },
  { id: "employer", label: "My employer is funding the trip" },
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

/** Days in Australia counting the arrival and departure days. */
export function daysOfStay(startMs, endMs) {
  return daysBetween(startMs, endMs) + 1;
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

/** Format a UTC timestamp as "2 February 2027". */
export function formatLongDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Smallest standard grant length that still covers the planned stay.
 * @param {number} arrivalMs  Arrival date.
 * @param {number} departureMs Departure date.
 * @returns {{months:number|null, endsOn:number|null}}
 */
export function smallestGrantBand(arrivalMs, departureMs) {
  for (const months of STAY_BANDS_MONTHS) {
    const endsOn = addMonthsUTC(arrivalMs, months);
    if (departureMs <= endsOn) return { months, endsOn };
  }
  return { months: null, endsOn: null };
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
 * Build the subclass 600 statement of purpose and the accompanying checks.
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
 * @param {string} input.streamId            One of STREAM_OPTIONS ids.
 * @param {string} input.purposeId           One of PURPOSE_OPTIONS ids.
 * @param {string} input.applicationDate     yyyy-mm-dd the application is lodged.
 * @param {string} input.arrivalDate         yyyy-mm-dd first day in Australia.
 * @param {string} input.departureDate       yyyy-mm-dd last day in Australia.
 * @param {string} [input.itinerary]         One line per leg.
 * @param {string} [input.accommodation]     Hotel or host address.
 * @param {string} [input.hostName]          Australian host and their status.
 * @param {string} input.fundingId           One of FUNDING_OPTIONS ids.
 * @param {number|string} input.budgetAud    Funds available for the trip, in AUD.
 * @param {number|string} [input.applicants] People applying together.
 * @param {number|string} [input.chargeAud]  Current visa application charge per applicant.
 * @param {number|string} [input.priorDaysIn18Months] Days already spent in Australia.
 * @param {string} [input.tiesStatement]     Ties to the home country.
 * @returns {object} letter plus checks, or { error }.
 */
export function buildAustraliaCoverLetter(input = {}) {
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
  if (passportExpiry <= departure) {
    return { error: "Your passport expires on or before you leave Australia — renew it before applying." };
  }

  const budgetAud = Number(String(input.budgetAud ?? "").replace(/,/g, "").trim());
  if (!Number.isFinite(budgetAud) || budgetAud <= 0) {
    return { error: "Enter the funds available for the trip as a number of Australian dollars greater than 0." };
  }

  const applicantsRaw = String(input.applicants ?? "1").trim() || "1";
  const applicants = Number(applicantsRaw);
  if (!Number.isInteger(applicants) || applicants < 1 || applicants > 20) {
    return { error: "Number of applicants must be a whole number between 1 and 20." };
  }

  const priorRaw = String(input.priorDaysIn18Months ?? "0").trim() || "0";
  const priorDays = Number(priorRaw);
  if (!Number.isInteger(priorDays) || priorDays < 0 || priorDays > 548) {
    return { error: "Days already spent in Australia must be a whole number between 0 and 548." };
  }

  const chargeRaw = String(input.chargeAud ?? "").trim();
  const chargeAud = chargeRaw === "" ? null : Number(chargeRaw.replace(/,/g, ""));
  if (chargeAud !== null && (!Number.isFinite(chargeAud) || chargeAud < 0)) {
    return { error: "The visa application charge must be a number of Australian dollars, or left blank." };
  }

  const stream = STREAM_OPTIONS.find((item) => item.id === input.streamId) ?? STREAM_OPTIONS[0];
  const purpose = PURPOSE_OPTIONS.find((item) => item.id === input.purposeId) ?? PURPOSE_OPTIONS[0];
  const funding = FUNDING_OPTIONS.find((item) => item.id === input.fundingId) ?? FUNDING_OPTIONS[0];

  const stayDays = daysOfStay(arrival, departure);
  const grant = smallestGrantBand(arrival, departure);
  const daysIn18MonthWindow = priorDays + stayDays;
  const condition8558Ok = daysIn18MonthWindow <= CONDITION_8558_MAX_DAYS;
  const windowEnds = addMonthsUTC(arrival, CONDITION_8558_WINDOW_MONTHS);

  const dailyBudgetAud = stayDays > 0 ? budgetAud / stayDays : 0;
  const perPersonPerDayAud = dailyBudgetAud / applicants;
  const totalChargeAud = chargeAud === null ? null : chargeAud * applicants;
  const leadDays = daysBetween(applied, arrival);

  const warnings = [];
  if (grant.months === null) {
    warnings.push(
      `A stay of ${plural(stayDays, "day")} is longer than the 12-month maximum a Visitor visa is normally granted for. Shorten the trip or apply for a visa that matches your plans.`,
    );
  }
  if (!condition8558Ok) {
    warnings.push(
      `Counting ${plural(priorDays, "day")} already spent in Australia, this trip would put you at ${daysIn18MonthWindow} days inside an 18-month window. Condition 8558 limits a non-resident to 12 months (${CONDITION_8558_MAX_DAYS} days) in any 18 months.`,
    );
  }
  if (purpose.isStudy && stayDays > STUDY_LIMIT_DAYS) {
    warnings.push(
      `Study or training on a Visitor visa is capped at three months (${STUDY_LIMIT_DAYS} days) and you have described ${plural(stayDays, "day")}. A student visa is the right pathway for anything longer.`,
    );
  }
  if (leadDays < 0) {
    warnings.push("Your arrival date falls before the application date — check the dates before you lodge.");
  } else if (leadDays < 30) {
    warnings.push(
      `Only ${plural(leadDays, "day")} separate lodgement from your flight. Subclass 600 processing times move with demand and health checks can add weeks, so avoid non-refundable bookings.`,
    );
  }
  if (budgetAud > 0 && perPersonPerDayAud < 100 && funding.id === "self") {
    warnings.push(
      `Your funds come to about AUD ${perPersonPerDayAud.toFixed(0)} per person per day. There is no published minimum, but the case officer must be satisfied you can support yourself — add bank statements covering the last three to six months.`,
    );
  }
  if (stream.id === "sponsored" && !clean(input.hostName)) {
    warnings.push("Name your sponsor. The Sponsored Family stream requires an approved sponsor, and a security bond may be requested.");
  }

  const occupation = clean(input.occupation);
  const employer = clean(input.employer);
  const homeAddress = clean(input.homeAddress);
  const contact = clean(input.contact);
  const hostName = clean(input.hostName);
  const accommodation = clean(input.accommodation);
  const tiesStatement = clean(input.tiesStatement);
  const itineraryLines = splitLines(input.itinerary);

  let fundingSentence;
  if (funding.id === "host") {
    fundingSentence = `${hostName ? `${hostName}, my host in Australia,` : "My host in Australia"} is meeting my costs and has provided a letter of invitation, proof of status and financial documents; I also hold funds of my own.`;
  } else if (funding.id === "employer") {
    fundingSentence = `${employer || "My employer"} is meeting the cost of the trip, and the enclosed company letter confirms my position, salary, approved leave and the business purpose.`;
  } else {
    fundingSentence = "I am meeting the cost of the trip from my own savings, shown in the enclosed bank statements and income records.";
  }

  const letterLines = [
    formatLongDate(applied),
    "",
    "The Case Officer",
    "Department of Home Affairs",
    "",
    `Subject: Statement in support of my ${stream.noun} application — ${fullName}, passport ${passportNumber}`,
    "",
    "Dear Case Officer,",
    "",
    `I am applying for a ${stream.noun} for the purpose of ${purpose.sentence}. ${nationality ? `I am ${indefiniteArticle(nationality)} ${nationality} citizen holding` : "I hold"} passport ${passportNumber}, valid until ${formatLongDate(passportExpiry)}.${homeAddress ? ` I live at ${homeAddress}.` : ""}${contact ? ` I can be reached at ${contact}.` : ""}`,
    "",
    `I intend to arrive in Australia on ${formatLongDate(arrival)} and to depart on ${formatLongDate(departure)}, a stay of ${plural(stayDays, "day")}${grant.months ? `, which sits inside a ${grant.months}-month stay period ending ${formatLongDate(grant.endsOn)}` : ""}. My visit is genuinely temporary and for the purpose stated. I will not work in Australia, and I understand that any study or training on this visa is limited to three months.`,
  ];

  if (hostName) {
    letterLines.push("", `I will be hosted by ${hostName}, whose invitation letter and proof of status in Australia are enclosed.`);
  }

  if (itineraryLines.length) {
    letterLines.push("", "My planned itinerary is:", ...itineraryLines.map((line) => `  • ${line}`));
  }

  if (accommodation) {
    letterLines.push("", `Accommodation: ${accommodation}. Booking confirmations or the host's address details are enclosed.`);
  }

  letterLines.push(
    "",
    `${fundingSentence} Approximately AUD ${Math.round(budgetAud).toLocaleString("en-AU")} is available for the trip${applicants > 1 ? ` for ${plural(applicants, "applicant")}` : ""}, about AUD ${perPersonPerDayAud.toFixed(0)} per person per day for accommodation, domestic travel, meals and other costs. I will hold health insurance covering the whole of my stay.`,
  );

  if (priorDays > 0) {
    letterLines.push(
      "",
      `In the eighteen months before this trip I have spent ${plural(priorDays, "day")} in Australia. Including this visit that comes to ${daysIn18MonthWindow} days, and I am aware of the twelve-months-in-eighteen limit that applies to visitors under condition 8558.`,
    );
  }

  const tiesParts = [];
  if (occupation) {
    tiesParts.push(
      employer
        ? `I work as ${occupation} at ${employer}; my leave for these dates is approved and I am expected back at work immediately afterwards.`
        : `I am ${occupation}, and the enclosed documents confirm my circumstances at home.`,
    );
  }
  if (tiesStatement) tiesParts.push(tiesStatement);
  tiesParts.push(
    "My home, family, income and long-term commitments are outside Australia and I will leave before my authorised stay ends. Everything stated in this letter and in my application is true and complete, and I understand the consequences under Public Interest Criterion 4020 of providing false or misleading information.",
  );
  letterLines.push("", tiesParts.join(" "));

  letterLines.push(
    "",
    "Enclosed are my passport bio-page, photograph, travel and accommodation bookings, financial documents, proof of employment and proof of my ties at home. I am happy to supply anything further you require.",
    "",
    "Thank you for considering my application.",
    "",
    "Yours sincerely,",
    "",
    "",
    fullName,
    `Passport ${passportNumber}${nationality ? ` (${nationality})` : ""}`,
  );

  const checklist = [
    "Passport bio-page, and pages showing earlier visas and travel",
    "Recent passport-style photograph",
    "Return or onward flight booking and the domestic travel plan",
    "Accommodation bookings, or the host's invitation letter and address",
    "Bank statements for the last three to six months plus proof of income",
    funding.id === "host"
      ? "Host's invitation letter, proof of status and evidence they can support you"
      : "Employment or study letter confirming approved leave and your expected return",
    "Evidence of ties at home: property, business, family, ongoing commitments",
    "Health insurance covering the whole stay (condition 8501 may be imposed)",
    stream.id === "sponsored"
      ? "Approved sponsorship documents, and funds for a security bond if one is requested"
      : "Proof of previous compliant travel, where you have it",
    chargeAud === null
      ? "Visa application charge — check the current amount with the Home Affairs pricing estimator"
      : `Visa application charge of AUD ${chargeAud.toLocaleString("en-AU")} per applicant, AUD ${totalChargeAud.toLocaleString("en-AU")} in total`,
    "This statement, signed and dated",
  ];

  return {
    letter: letterLines.join("\n"),
    stayDays,
    grantMonths: grant.months,
    grantEndsOn: grant.endsOn === null ? null : formatLongDate(grant.endsOn),
    daysIn18MonthWindow,
    condition8558Ok,
    condition8558WindowEnds: formatLongDate(windowEnds),
    daysLeftUnder8558: CONDITION_8558_MAX_DAYS - daysIn18MonthWindow,
    dailyBudgetAud,
    perPersonPerDayAud,
    budgetAud,
    applicants,
    leadDays,
    chargeAud,
    totalChargeAud,
    streamLabel: stream.label,
    warnings,
    checklist,
  };
}
