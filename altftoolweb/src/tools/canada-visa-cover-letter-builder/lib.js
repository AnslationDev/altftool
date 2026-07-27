/**
 * Canada Visa Cover Letter Builder — pure logic.
 *
 * What a Canadian visitor-visa "letter of explanation" has to do, and the rules
 * behind the numbers used here:
 *  - A temporary resident visa (TRV) is applied for on form IMM 5257, with the
 *    Family Information form IMM 5645 (or IMM 5707 where required).
 *  - Immigration and Refugee Protection Act s. 20(1)(b) and Regulation s. 179(b)
 *    require the applicant to satisfy the officer that they will leave Canada by
 *    the end of the period authorised for their stay. Dual intent is permitted
 *    (IRPA s. 22(2)), but temporary intent for this trip must still be shown.
 *  - Fees published by Immigration, Refugees and Citizenship Canada:
 *      Visitor visa, per person                       CAD 100
 *      Visitor visa, family of five or more, maximum  CAD 500
 *      Biometrics, per person                         CAD 85
 *      Biometrics, family of two or more, maximum     CAD 170
 *  - Biometrics stay on file for 10 years; if you gave them for an earlier
 *    application within that window you do not repeat them for a visitor visa.
 *  - A visitor is normally authorised to stay for six months from the day of
 *    entry unless a border services officer writes a different date. An
 *    extension is requested with a visitor record before that date passes.
 *  - Super visa (parents and grandparents): medical insurance from a Canadian
 *    insurer, or an approved non-Canadian insurer, with at least CAD 100,000 of
 *    emergency coverage valid for at least one year from the date of entry, and
 *    proof that the inviting child or grandchild meets the minimum necessary
 *    income (LICO) for the household size. The LICO table is republished each
 *    year, so check the current figure before you file.
 *
 * Informational only — not legal or immigration advice.
 */

/** Visitor-visa processing fee per person, in Canadian dollars. */
export const VISA_FEE_PER_PERSON_CAD = 100;
/** Family maximum for the visitor-visa fee, applied from five applicants. */
export const VISA_FEE_FAMILY_MAX_CAD = 500;
/** Family size at which the visitor-visa family maximum starts to apply. */
export const VISA_FEE_FAMILY_MIN_SIZE = 5;
/** Biometrics fee per person, in Canadian dollars. */
export const BIOMETRICS_FEE_PER_PERSON_CAD = 85;
/** Family maximum for biometrics, applied from two applicants. */
export const BIOMETRICS_FEE_FAMILY_MAX_CAD = 170;
/** Biometrics remain valid for this many years. */
export const BIOMETRICS_VALID_YEARS = 10;
/** Ordinary authorised visitor stay, in months. */
export const STANDARD_VISITOR_MONTHS = 6;
/** Minimum emergency medical cover required for a super visa, in CAD. */
export const SUPER_VISA_MIN_INSURANCE_CAD = 100000;
/** Super visa insurance must be valid for at least this many days from entry. */
export const SUPER_VISA_INSURANCE_DAYS = 365;

export const VISA_TYPES = [
  {
    id: "trv-single",
    label: "Visitor visa (TRV) — single entry",
    noun: "temporary resident (visitor) visa",
    superVisa: false,
  },
  {
    id: "trv-multiple",
    label: "Visitor visa (TRV) — multiple entry",
    noun: "multiple-entry temporary resident (visitor) visa",
    superVisa: false,
  },
  {
    id: "super",
    label: "Super visa — parent or grandparent",
    noun: "super visa as the parent or grandparent of a Canadian citizen or permanent resident",
    superVisa: true,
  },
];

export const PURPOSE_OPTIONS = [
  { id: "tourism", label: "Tourism and sightseeing", sentence: "tourism and sightseeing" },
  { id: "family", label: "Visiting family or friends", sentence: "visiting my family in Canada" },
  { id: "business", label: "Business meetings", sentence: "business meetings with our Canadian partner" },
  { id: "conference", label: "Conference or trade show", sentence: "attending a conference and related meetings" },
  { id: "convocation", label: "Graduation or convocation", sentence: "attending my child's convocation ceremony" },
  { id: "newborn", label: "Helping a family member", sentence: "helping my family during a period when extra support is needed" },
];

export const FUNDING_OPTIONS = [
  { id: "self", label: "I am funding the trip myself" },
  { id: "host", label: "My Canadian host is funding the trip" },
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

/** Whole days from one date to another. */
export function daysBetween(fromMs, toMs) {
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) return 0;
  return Math.round((toMs - fromMs) / DAY_MS);
}

/** Calendar days spent in Canada, counting arrival and departure days. */
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

/** Format a UTC timestamp as "9 May 2027". */
export function formatLongDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Government fees for a group applying together.
 * @param {number} applicants   People named on the application.
 * @param {boolean} needBiometrics Whether biometrics must be given again.
 * @returns {{visaFeeCad:number, biometricsFeeCad:number, totalFeeCad:number}}
 */
export function computeFees(applicants, needBiometrics) {
  const people = Math.max(0, Math.floor(applicants));
  const rawVisa = people * VISA_FEE_PER_PERSON_CAD;
  const visaFeeCad =
    people >= VISA_FEE_FAMILY_MIN_SIZE ? Math.min(rawVisa, VISA_FEE_FAMILY_MAX_CAD) : rawVisa;
  let biometricsFeeCad = 0;
  if (needBiometrics) {
    const rawBio = people * BIOMETRICS_FEE_PER_PERSON_CAD;
    biometricsFeeCad = people >= 2 ? Math.min(rawBio, BIOMETRICS_FEE_FAMILY_MAX_CAD) : rawBio;
  }
  return { visaFeeCad, biometricsFeeCad, totalFeeCad: visaFeeCad + biometricsFeeCad };
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
 * Build the Canadian letter of explanation and the accompanying checks.
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
 * @param {string} [input.uciNumber]          IRCC client identifier, if you have one.
 * @param {string} input.visaTypeId           One of VISA_TYPES ids.
 * @param {string} input.purposeId            One of PURPOSE_OPTIONS ids.
 * @param {string} input.applicationDate      yyyy-mm-dd the application is submitted.
 * @param {string} input.arrivalDate          yyyy-mm-dd first day in Canada.
 * @param {string} input.departureDate        yyyy-mm-dd last day in Canada.
 * @param {string} [input.itinerary]          One line per leg.
 * @param {string} [input.accommodation]      Hotel or host address.
 * @param {string} [input.hostName]           Canadian host and their status.
 * @param {string} input.fundingId            One of FUNDING_OPTIONS ids.
 * @param {number|string} input.budgetCad     Funds available for the trip, in CAD.
 * @param {number|string} [input.applicants]  People applying together.
 * @param {boolean} [input.needBiometrics]    Whether biometrics must be given.
 * @param {string} [input.biometricsGivenDate] yyyy-mm-dd of an earlier collection.
 * @param {number|string} [input.insuranceCad] Emergency medical cover, for a super visa.
 * @param {string} [input.tiesStatement]      Ties to the home country.
 * @returns {object} letter plus checks, or { error }.
 */
export function buildCanadaCoverLetter(input = {}) {
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
    return { error: "Your passport expires on or before you leave Canada — renew it before applying." };
  }

  const budgetCad = Number(String(input.budgetCad ?? "").replace(/,/g, "").trim());
  if (!Number.isFinite(budgetCad) || budgetCad < 0) {
    return { error: "Enter the funds available for the trip as a number of Canadian dollars (0 or more)." };
  }

  const applicantsRaw = String(input.applicants ?? "1").trim() || "1";
  const applicants = Number(applicantsRaw);
  if (!Number.isInteger(applicants) || applicants < 1 || applicants > 20) {
    return { error: "Number of applicants must be a whole number between 1 and 20." };
  }

  const visaType = VISA_TYPES.find((item) => item.id === input.visaTypeId) ?? VISA_TYPES[0];
  const purpose = PURPOSE_OPTIONS.find((item) => item.id === input.purposeId) ?? PURPOSE_OPTIONS[0];
  const funding = FUNDING_OPTIONS.find((item) => item.id === input.fundingId) ?? FUNDING_OPTIONS[0];

  const stayDays = daysOfStay(arrival, departure);
  const standardStayEnds = addMonthsUTC(arrival, STANDARD_VISITOR_MONTHS);
  const withinStandardStay = departure <= standardStayEnds;

  const dailyBudgetCad = stayDays > 0 ? budgetCad / stayDays : 0;
  const perPersonPerDayCad = dailyBudgetCad / applicants;

  const needBiometrics = input.needBiometrics !== false;
  const fees = computeFees(applicants, needBiometrics);

  const biometricsGiven = parseISODate(input.biometricsGivenDate);
  let biometricsValidUntil = null;
  let biometricsStillValid = null;
  if (biometricsGiven !== null) {
    biometricsValidUntil = addMonthsUTC(biometricsGiven, BIOMETRICS_VALID_YEARS * 12);
    biometricsStillValid = applied <= biometricsValidUntil;
  }

  const insuranceRaw = String(input.insuranceCad ?? "").trim();
  const insuranceCad = insuranceRaw === "" ? null : Number(insuranceRaw.replace(/,/g, ""));
  if (insuranceCad !== null && (!Number.isFinite(insuranceCad) || insuranceCad < 0)) {
    return { error: "Emergency medical cover must be a number of Canadian dollars, or left blank." };
  }
  const superInsuranceOk = visaType.superVisa
    ? insuranceCad !== null && insuranceCad >= SUPER_VISA_MIN_INSURANCE_CAD
    : null;

  const warnings = [];
  if (!withinStandardStay) {
    warnings.push(
      `You have described a stay of ${plural(stayDays, "day")}, past ${formatLongDate(standardStayEnds)} — the six months a visitor is normally authorised from the day of entry. Either shorten the trip or say in the letter that you will apply for a visitor record from inside Canada before that date.`,
    );
  }
  if (visaType.superVisa && superInsuranceOk === false) {
    warnings.push(
      `A super visa needs emergency medical insurance of at least CAD ${SUPER_VISA_MIN_INSURANCE_CAD.toLocaleString("en-CA")}, valid for at least one year from the day you enter Canada.`,
    );
  }
  if (visaType.superVisa && insuranceCad === null) {
    warnings.push(
      "Add your emergency medical cover amount — the super visa is refused without proof of at least CAD 100,000 of coverage from a Canadian or approved insurer.",
    );
  }
  if (visaType.superVisa && !clean(input.hostName)) {
    warnings.push(
      "Name the child or grandchild inviting you. Their invitation letter, proof of status and proof of income against the minimum necessary income (LICO) table are mandatory for a super visa.",
    );
  }
  if (biometricsStillValid === false) {
    warnings.push(
      `Your biometrics from ${formatLongDate(biometricsGiven)} expired on ${formatLongDate(biometricsValidUntil)}. They are valid for ${BIOMETRICS_VALID_YEARS} years, so you will be asked to give them again and pay the CAD ${BIOMETRICS_FEE_PER_PERSON_CAD} fee.`,
    );
  }
  if (daysBetween(applied, arrival) < 0) {
    warnings.push("Your arrival date falls before the application date. Check the dates before you submit.");
  } else if (daysBetween(applied, arrival) < 30) {
    warnings.push(
      `Only ${plural(daysBetween(applied, arrival), "day")} separate submission from your flight. Visitor-visa processing times move with volume and biometrics appointments — avoid non-refundable bookings.`,
    );
  }
  if (budgetCad > 0 && perPersonPerDayCad < 100 && funding.id === "self") {
    warnings.push(
      `The funds you listed come to about CAD ${perPersonPerDayCad.toFixed(0)} per person per day. IRCC sets no fixed minimum for visitors, but the officer must be satisfied you can support yourself — add bank statements, or a host's support letter if someone in Canada is paying.`,
    );
  }

  const occupation = clean(input.occupation);
  const employer = clean(input.employer);
  const homeAddress = clean(input.homeAddress);
  const contact = clean(input.contact);
  const uciNumber = clean(input.uciNumber);
  const hostName = clean(input.hostName);
  const accommodation = clean(input.accommodation);
  const tiesStatement = clean(input.tiesStatement);
  const itineraryLines = splitLines(input.itinerary);

  let fundingSentence;
  if (funding.id === "host") {
    fundingSentence = `${hostName ? `${hostName}, my host in Canada,` : "My host in Canada"} is covering my costs and has provided an invitation letter, proof of status and financial documents; I also hold my own funds.`;
  } else if (funding.id === "employer") {
    fundingSentence = `${employer || "My employer"} is paying for the trip, and the enclosed company letter confirms my position, salary, approved leave and that travel costs are met.`;
  } else {
    fundingSentence = "I am paying for the trip from my own savings, shown in the enclosed bank statements and income records.";
  }

  const letterLines = [
    formatLongDate(applied),
    "",
    "The Visa Officer",
    "Immigration, Refugees and Citizenship Canada",
    "",
    `Subject: Letter of explanation — application for ${indefiniteArticle(visaType.noun)} ${visaType.noun}${uciNumber ? ` (UCI ${uciNumber})` : ""} — ${fullName}, passport ${passportNumber}`,
    "",
    "Dear Visa Officer,",
    "",
    `This letter accompanies my IMM 5257 application for ${indefiniteArticle(visaType.noun)} ${visaType.noun}. The purpose of my visit is ${purpose.sentence}. ${nationality ? `I am ${indefiniteArticle(nationality)} ${nationality} citizen holding` : "I hold"} passport ${passportNumber}, valid until ${formatLongDate(passportExpiry)}.${homeAddress ? ` I live at ${homeAddress}.` : ""}${contact ? ` I can be reached at ${contact}.` : ""}`,
    "",
    `I intend to arrive in Canada on ${formatLongDate(arrival)} and to leave on ${formatLongDate(departure)}, a visit of ${plural(stayDays, "day")}. I understand that the visa allows me to seek entry and that a border services officer decides how long I may remain, normally six months from the day of entry, and I will leave on or before the date I am given.`,
  ];

  if (hostName) {
    letterLines.push("", `I will be hosted by ${hostName}, whose invitation letter and proof of status in Canada are enclosed.`);
  }

  if (itineraryLines.length) {
    letterLines.push("", "My planned itinerary is:", ...itineraryLines.map((line) => `  • ${line}`));
  }

  if (accommodation) {
    letterLines.push("", `Accommodation: ${accommodation}. Booking confirmations or the host's address proof are enclosed.`);
  }

  letterLines.push(
    "",
    `${fundingSentence} Approximately CAD ${Math.round(budgetCad).toLocaleString("en-CA")} is available for the trip${applicants > 1 ? ` for ${plural(applicants, "applicant")}` : ""}, about CAD ${perPersonPerDayCad.toFixed(0)} per person per day for accommodation, internal travel, meals and incidentals.`,
  );

  if (visaType.superVisa) {
    letterLines.push(
      "",
      insuranceCad !== null
        ? `As required for a super visa, I hold emergency medical insurance of CAD ${Math.round(insuranceCad).toLocaleString("en-CA")}, valid for at least one year from my date of entry, and the policy certificate is enclosed together with my host's proof of income against the minimum necessary income table.`
        : `As required for a super visa, I will hold emergency medical insurance of at least CAD ${SUPER_VISA_MIN_INSURANCE_CAD.toLocaleString("en-CA")}, valid for at least one year from my date of entry, and my host's proof of income against the minimum necessary income table is enclosed.`,
    );
  }

  const tiesParts = [];
  if (occupation) {
    tiesParts.push(
      employer
        ? `I work as ${occupation} at ${employer}, my leave for these dates is approved, and I am expected back at work immediately afterwards.`
        : `I am ${occupation}, and the enclosed documents confirm my situation at home.`,
    );
  }
  if (tiesStatement) tiesParts.push(tiesStatement);
  tiesParts.push(
    "My home, family and financial commitments are in my country of residence, and I will leave Canada by the end of the period authorised for my stay. My travel history is set out in full in my application.",
  );
  letterLines.push("", tiesParts.join(" "));

  letterLines.push(
    "",
    "Enclosed with this letter are the completed IMM 5257 and IMM 5645 forms, my passport bio-page, photographs, travel and accommodation details, financial documents, proof of employment and proof of my ties at home. I am happy to provide anything further you require.",
    "",
    "Thank you for considering my application.",
    "",
    "Yours sincerely,",
    "",
    "",
    fullName,
    `Passport ${passportNumber}${nationality ? ` (${nationality})` : ""}${uciNumber ? ` · UCI ${uciNumber}` : ""}`,
  );

  const checklist = [
    "IMM 5257 Application for Temporary Resident Visa, completed and validated",
    "IMM 5645 Family Information form",
    "Passport bio-page and pages showing previous visas or stamps",
    "Two recent photographs meeting IRCC photo specifications",
    "Proof of funds: bank statements, payslips, income-tax records",
    funding.id === "host"
      ? "Host's invitation letter, status document and proof of their income"
      : "Employment letter confirming position, salary and approved leave",
    "Travel itinerary and accommodation details",
    visaType.superVisa
      ? `Emergency medical insurance certificate of at least CAD ${SUPER_VISA_MIN_INSURANCE_CAD.toLocaleString("en-CA")} valid one year from entry`
      : "Proof of ties: property papers, family documents, business registration",
    visaType.superVisa
      ? "Host's proof of income against the minimum necessary income (LICO) table for their household size"
      : "Any previous travel history that supports your record of returning home",
    `Fees: CAD ${fees.visaFeeCad} visa${needBiometrics ? ` plus CAD ${fees.biometricsFeeCad} biometrics` : ""} — CAD ${fees.totalFeeCad} in total`,
    "This letter of explanation, signed and dated",
  ];

  return {
    letter: letterLines.join("\n"),
    stayDays,
    standardStayEnds: formatLongDate(standardStayEnds),
    withinStandardStay,
    dailyBudgetCad,
    perPersonPerDayCad,
    budgetCad,
    applicants,
    visaFeeCad: fees.visaFeeCad,
    biometricsFeeCad: fees.biometricsFeeCad,
    totalFeeCad: fees.totalFeeCad,
    biometricsValidUntil: biometricsValidUntil === null ? null : formatLongDate(biometricsValidUntil),
    biometricsStillValid,
    superInsuranceOk,
    visaTypeLabel: visaType.label,
    warnings,
    checklist,
  };
}
