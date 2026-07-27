/**
 * Thailand Visa Cover Letter Builder — pure logic.
 *
 * Rules encoded here, from Thai Ministry of Foreign Affairs and Immigration
 * Bureau guidance:
 *  - A single-entry Tourist Visa (TR) permits a stay of 60 days. The immigration
 *    stamp shows a "permitted to stay until" date 60 days after the date of
 *    entry, so the arrival day itself is not deducted from the 60.
 *  - That stay may be extended once, for 30 further days, at an Immigration
 *    office, for a fee of THB 1,900.
 *  - A multiple-entry Tourist Visa (METV) is valid for six months from issue,
 *    with each separate entry permitted a stay of up to 60 days.
 *  - Tourist visa applicants are asked to evidence funds of at least
 *    THB 20,000 per person, or THB 40,000 per family travelling together.
 *  - Passports must be valid for at least six months on the date of entry.
 *  - Applications are made through the official Thai e-Visa portal
 *    (thaievisa.go.th); paper applications at embassies were phased out when the
 *    system went worldwide on 1 January 2025.
 *  - Every foreign national arriving must submit the Thailand Digital Arrival
 *    Card (TDAC) online, free of charge, within three days before arrival
 *    counting the arrival day — so the window opens two days before the flight.
 *  - Overstaying is fined at THB 500 for each day, capped at THB 20,000, and
 *    longer overstays carry re-entry bans.
 *
 * Informational only — not immigration advice.
 */

/** Stay granted on a single-entry Tourist Visa, in days from the entry date. */
export const TOURIST_VISA_STAY_DAYS = 60;
/** Further days available from one in-country extension. */
export const EXTENSION_DAYS = 30;
/** Fee for that extension, in Thai baht. */
export const EXTENSION_FEE_THB = 1900;
/** Multiple-entry Tourist Visa validity, in months from issue. */
export const METV_VALIDITY_MONTHS = 6;
/** Funds evidence expected of a single tourist applicant, in baht. */
export const FUNDS_PER_PERSON_THB = 20000;
/** Funds evidence expected of a family travelling together, in baht. */
export const FUNDS_PER_FAMILY_THB = 40000;
/** Passport validity required on the date of entry, in months. */
export const PASSPORT_MONTHS_FROM_ENTRY = 6;
/** Thailand Digital Arrival Card window, in days, counting the arrival day. */
export const TDAC_WINDOW_DAYS = 3;
/** Overstay fine per day, and the maximum fine, in baht. */
export const OVERSTAY_FINE_PER_DAY_THB = 500;
export const OVERSTAY_FINE_CAP_THB = 20000;

export const VISA_TYPES = [
  {
    id: "tr-single",
    label: "Tourist Visa (TR) — single entry, 60-day stay",
    noun: "single-entry Tourist Visa (TR)",
    stayDays: TOURIST_VISA_STAY_DAYS,
    multiple: false,
  },
  {
    id: "metv",
    label: "Multiple-entry Tourist Visa (METV) — 6 months validity",
    noun: "multiple-entry Tourist Visa (METV)",
    stayDays: TOURIST_VISA_STAY_DAYS,
    multiple: true,
  },
  {
    id: "transit",
    label: "Transit Visa (TS) — 30-day stay",
    noun: "Transit Visa (TS)",
    stayDays: 30,
    multiple: false,
  },
];

export const PURPOSE_OPTIONS = [
  { id: "tourism", label: "Tourism and sightseeing", sentence: "tourism and sightseeing" },
  { id: "family", label: "Visiting family or friends", sentence: "visiting my family and friends in Thailand" },
  { id: "wellness", label: "Wellness or retreat stay", sentence: "a wellness and yoga retreat" },
  { id: "medical", label: "Medical treatment", sentence: "planned medical treatment at a Thai hospital" },
  { id: "conference", label: "Conference or exhibition", sentence: "attending a conference and related meetings" },
  { id: "transit", label: "Transit to a third country", sentence: "transit to my onward destination" },
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

/** Days in Thailand counting the arrival and departure days. */
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

/** Format a UTC timestamp as "11 December 2026". */
export function formatLongDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Overstay fine in baht: THB 500 per day, capped at THB 20,000.
 * @param {number} overstayDays Whole days past the permitted-to-stay date.
 */
export function overstayFineThb(overstayDays) {
  if (!Number.isFinite(overstayDays) || overstayDays <= 0) return 0;
  return Math.min(overstayDays * OVERSTAY_FINE_PER_DAY_THB, OVERSTAY_FINE_CAP_THB);
}

/** Funds evidence expected for a group, in baht. */
export function requiredFundsThb(travellers) {
  const people = Math.max(1, Math.floor(travellers));
  return people >= 2 ? FUNDS_PER_FAMILY_THB : FUNDS_PER_PERSON_THB;
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
 * Build the Thai tourist-visa cover letter and its checks.
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
 * @param {string} input.applicationDate     yyyy-mm-dd the e-Visa is applied for.
 * @param {string} input.arrivalDate         yyyy-mm-dd arrival in Thailand.
 * @param {string} input.departureDate       yyyy-mm-dd departure from Thailand.
 * @param {boolean} [input.planExtension]    Whether a 30-day extension is planned.
 * @param {string} [input.itinerary]         One line per leg.
 * @param {string} [input.accommodation]     Hotel or host address.
 * @param {string} [input.onwardDestination] Where you go next.
 * @param {number|string} input.fundsThb     Funds evidenced, in baht.
 * @param {number|string} [input.travellers] People travelling together.
 * @param {string} [input.tiesStatement]     Ties to the home country.
 * @returns {object} letter plus checks, or { error }.
 */
export function buildThailandCoverLetter(input = {}) {
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

  const fundsThb = Number(String(input.fundsThb ?? "").replace(/,/g, "").trim());
  if (!Number.isFinite(fundsThb) || fundsThb < 0) {
    return { error: "Enter the funds you can evidence as a number of Thai baht (0 or more)." };
  }

  const travellersRaw = String(input.travellers ?? "1").trim() || "1";
  const travellers = Number(travellersRaw);
  if (!Number.isInteger(travellers) || travellers < 1 || travellers > 20) {
    return { error: "Number of travellers must be a whole number between 1 and 20." };
  }

  const visaType = VISA_TYPES.find((item) => item.id === input.visaTypeId) ?? VISA_TYPES[0];
  const purpose = PURPOSE_OPTIONS.find((item) => item.id === input.purposeId) ?? PURPOSE_OPTIONS[0];
  const planExtension = input.planExtension === true;

  const stayDays = daysOfStay(arrival, departure);
  const permittedUntil = addDaysUTC(arrival, visaType.stayDays);
  const extendedUntil = addDaysUTC(permittedUntil, EXTENSION_DAYS);
  const effectiveLimit = planExtension ? extendedUntil : permittedUntil;
  const overstayDays = Math.max(0, daysBetween(effectiveLimit, departure));
  const fineThb = overstayFineThb(overstayDays);

  const passportRequiredUntil = addMonthsUTC(arrival, PASSPORT_MONTHS_FROM_ENTRY);
  const passportValidityOk = passportExpiry >= passportRequiredUntil;

  const tdacOpens = addDaysUTC(arrival, -(TDAC_WINDOW_DAYS - 1));
  const requiredFunds = requiredFundsThb(travellers);
  const fundsOk = fundsThb >= requiredFunds;
  const leadDays = daysBetween(applied, arrival);

  const metvValidUntil = visaType.multiple ? addMonthsUTC(applied, METV_VALIDITY_MONTHS) : null;

  const warnings = [];
  if (overstayDays > 0) {
    warnings.push(
      `Your ${visaType.noun} permits a stay until ${formatLongDate(permittedUntil)}${planExtension ? `, or ${formatLongDate(extendedUntil)} with the 30-day extension` : ""}. Leaving on ${formatLongDate(departure)} would be ${plural(overstayDays, "day")} over, which attracts a fine of THB ${fineThb.toLocaleString("en-US")} at THB ${OVERSTAY_FINE_PER_DAY_THB} per day.`,
    );
  }
  if (!passportValidityOk) {
    warnings.push(
      `Your passport expires on ${formatLongDate(passportExpiry)}. Thailand requires at least six months of validity on the date of entry — to ${formatLongDate(passportRequiredUntil)} in your case.`,
    );
  }
  if (!fundsOk) {
    warnings.push(
      `Tourist visa applicants are asked to evidence at least THB ${requiredFunds.toLocaleString("en-US")} ${travellers >= 2 ? "for a family travelling together" : "per person"}; you have entered THB ${Math.round(fundsThb).toLocaleString("en-US")}. Add bank statements showing the balance held for the last three to six months.`,
    );
  }
  if (leadDays < 0) {
    warnings.push("Your arrival date falls before the application date — check the dates before you submit.");
  } else if (leadDays < 15) {
    warnings.push(
      `Only ${plural(leadDays, "day")} separate the e-Visa application from your flight. The official portal advises applying well in advance, and applications are not processed at the airport.`,
    );
  }
  if (!clean(input.onwardDestination)) {
    warnings.push("Add your onward or return flight. Proof of onward travel is checked both by the airline and at immigration.");
  }
  if (planExtension && stayDays <= visaType.stayDays) {
    warnings.push(
      `You have flagged an extension, but a stay of ${plural(stayDays, "day")} already fits inside the ${visaType.stayDays}-day stamp. You only need to visit Immigration and pay the THB ${EXTENSION_FEE_THB.toLocaleString("en-US")} fee if you stay past ${formatLongDate(permittedUntil)}.`,
    );
  }

  const occupation = clean(input.occupation);
  const employer = clean(input.employer);
  const homeAddress = clean(input.homeAddress);
  const contact = clean(input.contact);
  const accommodation = clean(input.accommodation);
  const onwardDestination = clean(input.onwardDestination);
  const tiesStatement = clean(input.tiesStatement);
  const itineraryLines = splitLines(input.itinerary);

  const letterLines = [
    formatLongDate(applied),
    "",
    "The Visa Officer",
    "Royal Thai Embassy / Consulate-General (Thai e-Visa system)",
    "",
    `Subject: Application for ${indefiniteArticle(visaType.noun)} ${visaType.noun} — ${fullName}, passport ${passportNumber}`,
    "",
    "Dear Sir or Madam,",
    "",
    `I am applying through the official Thai e-Visa portal for ${indefiniteArticle(visaType.noun)} ${visaType.noun} for the purpose of ${purpose.sentence}. ${nationality ? `I am ${indefiniteArticle(nationality)} ${nationality} citizen holding` : "I hold"} passport ${passportNumber}, valid until ${formatLongDate(passportExpiry)}.${homeAddress ? ` I live at ${homeAddress}.` : ""}${contact ? ` I can be reached at ${contact}.` : ""}`,
    "",
    `I plan to arrive in Thailand on ${formatLongDate(arrival)} and to leave on ${formatLongDate(departure)}, a stay of ${plural(stayDays, "day")}${onwardDestination ? `, travelling onward to ${onwardDestination}` : ""}. I understand that immigration will stamp a permitted-to-stay date of ${formatLongDate(permittedUntil)}, ${visaType.stayDays} days from the date of entry, and I will leave on or before that date${planExtension ? `, or before ${formatLongDate(extendedUntil)} if I extend once at an Immigration office and pay the THB ${EXTENSION_FEE_THB.toLocaleString("en-US")} fee` : ""}.`,
  ];

  if (visaType.multiple) {
    letterLines.push(
      "",
      `As a multiple-entry Tourist Visa is valid for six months from issue${metvValidUntil ? `, in my case to about ${formatLongDate(metvValidUntil)}` : ""}, I understand that each separate entry is stamped for up to ${visaType.stayDays} days and that the visa validity does not extend any single stay.`,
    );
  }

  if (itineraryLines.length) {
    letterLines.push("", "My planned itinerary is:", ...itineraryLines.map((line) => `  • ${line}`));
  }

  if (accommodation) {
    letterLines.push("", `Accommodation: ${accommodation}. Booking confirmations are enclosed.`);
  }

  letterLines.push(
    "",
    `I can evidence funds of THB ${Math.round(fundsThb).toLocaleString("en-US")}${travellers > 1 ? ` for ${plural(travellers, "traveller")}` : ""}, against the THB ${requiredFunds.toLocaleString("en-US")} expected ${travellers >= 2 ? "of a family travelling together" : "of a single applicant"}, supported by the enclosed bank statements. I will submit the Thailand Digital Arrival Card online from ${formatLongDate(tdacOpens)}, within the three days before arrival.`,
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
    "I will not work or conduct business in Thailand on this visa, and my home, family and financial commitments remain in my country of residence.",
  );
  letterLines.push("", tiesParts.join(" "));

  letterLines.push(
    "",
    "Enclosed are my passport bio-page, a recent photograph, confirmed flight bookings, hotel reservations, bank statements and proof of employment. I am happy to provide anything further you require.",
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
    "Thai e-Visa application submitted through the official portal, thaievisa.go.th",
    `Passport bio-page valid to at least ${formatLongDate(passportRequiredUntil)}`,
    "Recent colour photograph on a white background, taken within the last six months",
    "Confirmed return or onward flight ticket",
    "Hotel bookings covering the whole stay, or the host's address and identification",
    `Bank statements showing at least THB ${requiredFunds.toLocaleString("en-US")} held for three to six months`,
    "Employment or study letter showing approved leave",
    `Thailand Digital Arrival Card, free, submitted from ${formatLongDate(tdacOpens)} onwards`,
    planExtension
      ? `Budget THB ${EXTENSION_FEE_THB.toLocaleString("en-US")} for the one-time 30-day extension at an Immigration office`
      : "Travel insurance covering medical treatment for the whole stay",
    "This cover letter, signed and dated",
  ];

  return {
    letter: letterLines.join("\n"),
    stayDays,
    permittedUntil: formatLongDate(permittedUntil),
    extendedUntil: formatLongDate(extendedUntil),
    effectiveLimit: formatLongDate(effectiveLimit),
    overstayDays,
    fineThb,
    passportRequiredUntil: formatLongDate(passportRequiredUntil),
    passportValidityOk,
    tdacOpensOn: formatLongDate(tdacOpens),
    tdacClosesOn: formatLongDate(arrival),
    requiredFundsThb: requiredFunds,
    fundsThb,
    fundsOk,
    travellers,
    leadDays,
    metvValidUntil: metvValidUntil === null ? null : formatLongDate(metvValidUntil),
    visaTypeLabel: visaType.label,
    extensionFeeThb: EXTENSION_FEE_THB,
    warnings,
    checklist,
  };
}
