/**
 * USA Visa Cover Letter Builder — pure logic.
 *
 * Rules encoded here:
 *  - Section 214(b) of the Immigration and Nationality Act presumes every
 *    nonimmigrant applicant intends to immigrate; the applicant must overcome
 *    that presumption with evidence of ties abroad and a temporary purpose.
 *    The cover letter is where that case is stated in plain words.
 *  - Every applicant completes Form DS-160 online; the confirmation page
 *    carries a barcode number beginning "AA" followed by eight characters, and
 *    that number must be quoted at the interview.
 *  - The machine-readable visa (MRV) application fee for B-1/B-2 and other
 *    non-petition-based visa classes is US$185, set by the Department of State
 *    schedule of fees effective 17 June 2023.
 *  - An MRV fee receipt is valid for one year from the date of payment: the
 *    interview must be scheduled within that year.
 *  - Passports should be valid for at least six months beyond the intended
 *    period of stay, unless a country-specific agreement waives the extra six
 *    months (the "six-month club").
 *  - The visa itself only allows travel to a port of entry. A CBP officer
 *    decides the admission period and records it on Form I-94; B-2 visitors are
 *    normally admitted for up to six months (about 180 days).
 *
 * Informational only — not legal or immigration advice.
 */

/** MRV application fee for B-1/B-2 and other non-petition visas, in US dollars. */
export const MRV_FEE_USD = 185;
/** An MRV fee receipt stays usable for this many days from payment. */
export const MRV_RECEIPT_VALID_DAYS = 365;
/** Passport should stay valid this many months past the end of the stay. */
export const PASSPORT_MONTHS_BEYOND_STAY = 6;
/** Longest admission a B-2 visitor is normally granted at the port of entry. */
export const TYPICAL_B2_ADMISSION_DAYS = 180;
/** DS-160 confirmation barcode: "AA" plus eight alphanumeric characters. */
export const DS160_PATTERN = /^AA[0-9A-Z]{8}$/;

export const VISA_CLASSES = [
  { id: "b2", label: "B-2 — tourism, family visit, medical", noun: "B-2 visitor (tourism) visa" },
  { id: "b1", label: "B-1 — business meetings, conference", noun: "B-1 visitor (business) visa" },
  { id: "b1b2", label: "B-1/B-2 — combined business and tourism", noun: "B-1/B-2 visitor visa" },
  { id: "c1", label: "C-1 — transit through the United States", noun: "C-1 transit visa" },
];

export const PURPOSE_OPTIONS = [
  { id: "tourism", label: "Tourism and sightseeing", sentence: "tourism and sightseeing" },
  { id: "family", label: "Visiting family or friends", sentence: "visiting my family in the United States" },
  { id: "business", label: "Business meetings with a US partner", sentence: "meetings with our United States business partner" },
  { id: "conference", label: "Conference, trade show or training", sentence: "attending a conference and related professional meetings" },
  { id: "medical", label: "Medical treatment or consultation", sentence: "a planned medical consultation and treatment" },
  { id: "graduation", label: "Attending a graduation or wedding", sentence: "attending a family graduation ceremony" },
  { id: "transit", label: "Transit to a third country", sentence: "transit through the United States to a third country" },
];

export const FUNDING_OPTIONS = [
  { id: "self", label: "I am funding the trip myself" },
  { id: "relative", label: "A US-based relative is hosting and funding" },
  { id: "employer", label: "My employer is funding the trip" },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86400000;
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Parse yyyy-mm-dd into a UTC timestamp; null when the date is impossible. */
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

/** Whole days from one date to another (negative when the second is earlier). */
export function daysBetween(fromMs, toMs) {
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) return 0;
  return Math.round((toMs - fromMs) / DAY_MS);
}

/** Nights plus one: the number of calendar days spent in the country. */
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

/** Add whole days to a UTC timestamp. */
export function addDaysUTC(stamp, days) {
  return stamp + days * DAY_MS;
}

/** Format a UTC timestamp as "3 March 2027". */
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

/** "a" or "an" so "an Indian citizen" reads correctly. */
export function indefiniteArticle(word) {
  return /^[aeiou]/i.test(String(word).trim()) ? "an" : "a";
}

/** Pluralise a unit noun instead of printing "day(s)". */
export function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Build the US visitor-visa cover letter plus the interview-readiness checks.
 *
 * @param {object} input
 * @param {string} input.fullName           Name exactly as printed in the passport.
 * @param {string} [input.nationality]      Citizenship.
 * @param {string} input.passportNumber     Passport number.
 * @param {string} input.passportExpiryDate yyyy-mm-dd.
 * @param {string} [input.occupation]       Job title or status.
 * @param {string} [input.employer]         Employer or institution.
 * @param {string} [input.homeAddress]      Residential address abroad.
 * @param {string} [input.contact]          Email and phone.
 * @param {string} input.visaClassId        One of VISA_CLASSES ids.
 * @param {string} input.purposeId          One of PURPOSE_OPTIONS ids.
 * @param {string} [input.ds160Number]      DS-160 confirmation barcode.
 * @param {string} input.feePaidDate        yyyy-mm-dd the MRV fee was paid.
 * @param {string} input.interviewDate      yyyy-mm-dd of the consular interview.
 * @param {string} [input.consulateCity]    Embassy or consulate city.
 * @param {string} input.arrivalDate        yyyy-mm-dd first day in the United States.
 * @param {string} input.departureDate      yyyy-mm-dd last day in the United States.
 * @param {string} [input.itinerary]        One line per leg.
 * @param {string} [input.accommodation]    Hotel or host address.
 * @param {string} input.fundingId          One of FUNDING_OPTIONS ids.
 * @param {string} [input.hostName]         US host or sponsor.
 * @param {number|string} input.budgetUsd   Funds available for the trip, US dollars.
 * @param {string} [input.tiesStatement]    Ties to the home country, free text.
 * @param {number|string} [input.travellers] People covered by the stated budget.
 * @returns {object} letter plus checks, or { error }.
 */
export function buildUsaCoverLetter(input = {}) {
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

  const interview = parseISODate(input.interviewDate);
  if (interview === null) return { error: "Enter a valid interview date in yyyy-mm-dd form." };
  const feePaid = parseISODate(input.feePaidDate);
  if (feePaid === null) return { error: "Enter a valid MRV fee payment date in yyyy-mm-dd form." };
  if (interview < feePaid) return { error: "The interview cannot be scheduled before the MRV fee was paid." };

  const passportExpiry = parseISODate(input.passportExpiryDate);
  if (passportExpiry === null) return { error: "Enter a valid passport expiry date in yyyy-mm-dd form." };
  if (passportExpiry <= arrival) {
    return { error: "Your passport expires before you arrive — renew it before applying." };
  }

  const budgetUsd = Number(String(input.budgetUsd ?? "").replace(/,/g, "").trim());
  if (!Number.isFinite(budgetUsd) || budgetUsd < 0) {
    return { error: "Enter the funds available for the trip as a number of US dollars (0 or more)." };
  }

  const travellersRaw = String(input.travellers ?? "1").trim() || "1";
  const travellers = Number(travellersRaw);
  if (!Number.isInteger(travellers) || travellers < 1 || travellers > 20) {
    return { error: "Number of travellers must be a whole number between 1 and 20." };
  }

  const stayDays = daysOfStay(arrival, departure);
  if (stayDays > 3650) {
    return { error: "That stay is longer than ten years — check the arrival and departure dates." };
  }

  const visaClass = VISA_CLASSES.find((item) => item.id === input.visaClassId) ?? VISA_CLASSES[0];
  const purpose = PURPOSE_OPTIONS.find((item) => item.id === input.purposeId) ?? PURPOSE_OPTIONS[0];
  const funding = FUNDING_OPTIONS.find((item) => item.id === input.fundingId) ?? FUNDING_OPTIONS[0];

  const dailyBudgetUsd = stayDays > 0 ? budgetUsd / stayDays : 0;
  const perPersonPerDayUsd = dailyBudgetUsd / travellers;

  const passportRequiredUntil = addMonthsUTC(departure, PASSPORT_MONTHS_BEYOND_STAY);
  const passportBufferDays = daysBetween(departure, passportExpiry);
  const passportValidityOk = passportExpiry >= passportRequiredUntil;

  const mrvReceiptExpiry = addDaysUTC(feePaid, MRV_RECEIPT_VALID_DAYS);
  const mrvReceiptOk = interview <= mrvReceiptExpiry;
  const daysFromInterviewToTravel = daysBetween(interview, arrival);

  const ds160Number = clean(input.ds160Number).toUpperCase();
  const ds160Ok = ds160Number === "" ? null : DS160_PATTERN.test(ds160Number);

  const warnings = [];
  if (!passportValidityOk) {
    warnings.push(
      `Your passport expires on ${formatLongDate(passportExpiry)} — only ${plural(passportBufferDays, "day")} after you leave. The usual requirement is validity to at least ${formatLongDate(passportRequiredUntil)}, six months past the end of the stay, unless your country is covered by a six-month-club agreement.`,
    );
  }
  if (!mrvReceiptOk) {
    warnings.push(
      `Your MRV fee receipt lapses on ${formatLongDate(mrvReceiptExpiry)}, one year after payment, but the interview is set for ${formatLongDate(interview)}. Book inside the year or you pay the US$${MRV_FEE_USD} fee again.`,
    );
  }
  if (ds160Ok === false) {
    warnings.push(
      "A DS-160 confirmation number looks like AA00ABC123 — two letters AA followed by eight characters. Check the number on your confirmation page.",
    );
  }
  if (ds160Ok === null) {
    warnings.push("Add your DS-160 confirmation number; the consulate matches your file to the letter by that barcode.");
  }
  if (stayDays > TYPICAL_B2_ADMISSION_DAYS) {
    warnings.push(
      `You have described a stay of ${plural(stayDays, "day")}. Visitors are normally admitted for up to six months (about ${TYPICAL_B2_ADMISSION_DAYS} days), and a longer plan invites doubt about temporary intent. Explain it clearly or shorten the trip.`,
    );
  }
  if (daysFromInterviewToTravel < 0) {
    warnings.push("Your travel dates fall before the interview. Move the trip or bring the interview forward.");
  } else if (daysFromInterviewToTravel < 14) {
    warnings.push(
      `Only ${plural(daysFromInterviewToTravel, "day")} separate the interview from departure. Administrative processing and passport return can take longer, so avoid non-refundable bookings.`,
    );
  }
  if (budgetUsd > 0 && perPersonPerDayUsd < 75) {
    warnings.push(
      `Your funds work out to about US$${perPersonPerDayUsd.toFixed(0)} per person per day. There is no statutory minimum, but a figure this low is hard to square with US hotel and transport costs — attach stronger bank evidence or a host's support letter.`,
    );
  }
  if (funding.id === "relative" && !clean(input.hostName)) {
    warnings.push("You said a US relative is hosting you — name that person so the letter matches the invitation and Form I-134 if one is filed.");
  }

  const occupation = clean(input.occupation);
  const employer = clean(input.employer);
  const homeAddress = clean(input.homeAddress);
  const contact = clean(input.contact);
  const consulateCity = clean(input.consulateCity);
  const hostName = clean(input.hostName);
  const accommodation = clean(input.accommodation);
  const tiesStatement = clean(input.tiesStatement);
  const itineraryLines = splitLines(input.itinerary);

  let fundingSentence;
  if (funding.id === "relative") {
    fundingSentence = `My ${hostName ? `relative, ${hostName},` : "United States-based relative"} is hosting me and has provided an invitation letter, proof of status and bank statements; I also carry my own funds.`;
  } else if (funding.id === "employer") {
    fundingSentence = `My employer, ${employer || "my company"}, is paying for the trip; the enclosed company letter confirms my position, salary, approved leave and that travel costs are met by the company.`;
  } else {
    fundingSentence = "I am paying for the trip from my own savings, evidenced by the enclosed bank statements, payslips and tax returns.";
  }

  const letterLines = [
    formatLongDate(interview),
    "",
    `The Consular Officer${consulateCity ? `\nU.S. Embassy / Consulate General, ${consulateCity}` : "\nU.S. Embassy / Consulate General"}`,
    "",
    `Subject: ${visaClass.noun} application — ${fullName}, passport ${passportNumber}${ds160Number ? `, DS-160 ${ds160Number}` : ""}`,
    "",
    "Dear Consular Officer,",
    "",
    `I am applying for ${indefiniteArticle(visaClass.noun)} ${visaClass.noun} for the purpose of ${purpose.sentence}. ${nationality ? `I am ${indefiniteArticle(nationality)} ${nationality} citizen holding` : "I hold"} passport ${passportNumber}, valid until ${formatLongDate(passportExpiry)}.${homeAddress ? ` I live at ${homeAddress}.` : ""}${contact ? ` I can be reached at ${contact}.` : ""}`,
    "",
    `I plan to arrive in the United States on ${formatLongDate(arrival)} and to depart on ${formatLongDate(departure)}, a stay of ${plural(stayDays, "day")}. I understand that the visa permits me to travel to a port of entry and that the admission period is set by a Customs and Border Protection officer and recorded on Form I-94; I will leave on or before the date that officer grants.`,
  ];

  if (itineraryLines.length) {
    letterLines.push("", "My itinerary is:", ...itineraryLines.map((line) => `  • ${line}`));
  }

  if (accommodation) {
    letterLines.push("", `I will stay at ${accommodation}. Booking confirmations or the host's address proof are enclosed.`);
  }

  letterLines.push(
    "",
    `${fundingSentence} I have set aside approximately US$${Math.round(budgetUsd).toLocaleString("en-US")}${travellers > 1 ? ` for ${plural(travellers, "traveller")}` : ""}, about US$${perPersonPerDayUsd.toFixed(0)} per person per day, covering flights, accommodation, transport, meals and travel insurance.`,
  );

  const tiesParts = [];
  if (occupation) {
    tiesParts.push(
      employer
        ? `I work as ${occupation} at ${employer}, where my leave for these exact dates has been approved and I am expected back at my desk immediately afterwards.`
        : `I am ${occupation} and my status at home is documented in the enclosed papers.`,
    );
  }
  if (tiesStatement) tiesParts.push(tiesStatement);
  tiesParts.push(
    "My home, family, income and long-term commitments are all outside the United States, and I have every reason to return. I do not intend to work, study or remain in the United States, and I am not seeking to change my status.",
  );
  letterLines.push("", tiesParts.join(" "));

  letterLines.push(
    "",
    "Enclosed are my DS-160 confirmation page, MRV fee receipt, appointment confirmation, passport, photograph, travel and accommodation bookings, financial documents and proof of my ties at home. I am glad to answer any further questions at the interview.",
    "",
    "Thank you for your time and consideration.",
    "",
    "Sincerely,",
    "",
    "",
    fullName,
    `Passport ${passportNumber}${nationality ? ` (${nationality})` : ""}`,
  );

  const checklist = [
    `DS-160 confirmation page with barcode${ds160Number ? ` (${ds160Number})` : ""}`,
    `MRV fee receipt of US$${MRV_FEE_USD}, valid until ${formatLongDate(mrvReceiptExpiry)}`,
    "Interview appointment confirmation letter",
    `Passport valid to at least ${formatLongDate(passportRequiredUntil)}, plus any older passports with previous US visas`,
    "One 2x2 inch (51x51 mm) colour photograph on a white background",
    "Return flight itinerary and internal travel plan",
    accommodation ? "Hotel bookings or the host's address and status proof" : "Hotel bookings, or an invitation letter with the host's address",
    "Bank statements for six months, payslips and income-tax returns",
    funding.id === "relative"
      ? "Host's invitation letter, status document and Form I-134 if they are filing one"
      : "Proof that the stated funds are yours and available",
    "Employment or study letter showing approved leave and expected return",
    "Property papers, business registration or family documents supporting ties at home",
    "This cover letter, signed and dated",
  ];

  return {
    letter: letterLines.join("\n"),
    stayDays,
    dailyBudgetUsd,
    perPersonPerDayUsd,
    budgetUsd,
    travellers,
    visaClassLabel: visaClass.label,
    passportRequiredUntil: formatLongDate(passportRequiredUntil),
    passportBufferDays,
    passportValidityOk,
    mrvFeeUsd: MRV_FEE_USD,
    mrvReceiptExpiry: formatLongDate(mrvReceiptExpiry),
    mrvReceiptOk,
    daysFromInterviewToTravel,
    ds160Ok,
    typicalAdmissionDays: TYPICAL_B2_ADMISSION_DAYS,
    warnings,
    checklist,
  };
}
