/**
 * US visa appointment day checklist for applicants in India.
 *
 * A US non-immigrant visa application in India normally involves two separate
 * visits booked through the official appointment system:
 *
 *   1. OFC / VAC  — the Offsite Facilitation Centre, where fingerprints and the
 *                   photograph are captured. No supporting documents are read here.
 *   2. Interview  — at the US Embassy in New Delhi or a Consulate General in
 *                   Mumbai, Chennai, Kolkata, Hyderabad or Bengaluru.
 *
 * Applicants who qualify for the Interview Waiver programme drop their passport
 * at a designated drop-off location instead of attending an interview.
 *
 * The three visits have genuinely different rules, and the security policy at a
 * US diplomatic post is stricter than at an outsourced centre: there is no
 * storage facility for prohibited items, so anything refused at the gate has to
 * leave with someone else.
 *
 * Pure module: no React, no DOM, no clock reads. Dates are passed in as
 * "YYYY-MM-DD" strings and handled in UTC so no timezone can shift a day.
 */

/** The US Mission instruction is a ceiling, not a floor: do not arrive at the
 * Embassy or Consulate more than 15 minutes before your appointment time.
 * Arriving earlier means waiting on the street outside the perimeter. */
export const MAX_EARLY_ARRIVAL_MINUTES = 15;

/** Editable allowance for traffic, parking and reaching the gate. Not a rule. */
export const DEFAULT_CONTINGENCY_MINUTES = 30;

/** Fingerprints are collected from US visa applicants aged 14 through 79
 * inclusive. Below 14 and above 79 no fingerprints are taken. */
export const FINGERPRINT_MIN_AGE = 14;
export const FINGERPRINT_MAX_AGE = 79;

/** Age of majority for the accompanying-adult rule. */
export const ADULT_AGE = 18;

/** F and M student visas may be issued up to 365 days before the programme
 * start date shown on the Form I-20 (US Department of State guidance). */
export const STUDENT_VISA_ISSUANCE_LEAD_DAYS = 365;

/** F, M and J holders may not be admitted to the United States more than 30
 * days before the programme start date (8 CFR 214.2(f)(5)(i) for F students,
 * with the equivalent limit applied to M and J categories). */
export const STUDENT_ENTRY_LEAD_DAYS = 30;

/** US visa photograph: 2 x 2 inches, i.e. 51 x 51 mm square. */
export const PHOTO_SPEC = "2 × 2 inches (51 × 51 mm) square, white or off-white background, taken within the last 6 months";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MINUTES_PER_DAY = 24 * 60;

/** Appointment types, each with its own document set. */
export const APPOINTMENT_TYPES = {
  ofc: {
    key: "ofc",
    label: "OFC / VAC biometrics appointment",
    location: "Offsite Facilitation Centre",
    interview: false,
    biometrics: true,
  },
  interview: {
    key: "interview",
    label: "Consular interview at the Embassy or Consulate",
    location: "US Embassy or Consulate General",
    interview: true,
    biometrics: false,
  },
  dropbox: {
    key: "dropbox",
    label: "Interview Waiver document drop-off (dropbox)",
    location: "Designated drop-off location",
    interview: false,
    biometrics: false,
  },
};

export const APPOINTMENT_TYPE_KEYS = ["ofc", "interview", "dropbox"];

/** Visa categories and the category-specific paperwork they turn on. */
export const VISA_CLASSES = {
  student: {
    key: "student",
    label: "F or M — student",
    principalDoc: "Form I-20 signed by you and by the school's designated school official",
    sevis: true,
    entryWindow: true,
    issuanceWindow: true,
  },
  exchange: {
    key: "exchange",
    label: "J — exchange visitor",
    principalDoc: "Form DS-2019 signed by you and by the programme sponsor",
    sevis: true,
    entryWindow: true,
    issuanceWindow: false,
  },
  petition: {
    key: "petition",
    label: "H, L, O or another petition-based work visa",
    principalDoc: "Form I-797 approval notice, with the petition receipt number",
    sevis: false,
    entryWindow: false,
    issuanceWindow: false,
  },
  visitor: {
    key: "visitor",
    label: "B-1 / B-2 — business or tourism",
    principalDoc: "Evidence of the purpose of travel — invitation, conference registration or itinerary",
    sevis: false,
    entryWindow: false,
    issuanceWindow: false,
  },
  other: {
    key: "other",
    label: "Another visa category",
    principalDoc: "Whatever category-specific form or approval notice your category requires",
    sevis: false,
    entryWindow: false,
    issuanceWindow: false,
  },
};

export const VISA_CLASS_KEYS = ["student", "exchange", "petition", "visitor", "other"];

/** Posts in India where the consular interview takes place. */
export const CONSULAR_POSTS = [
  "US Embassy, New Delhi",
  "US Consulate General, Mumbai",
  "US Consulate General, Chennai",
  "US Consulate General, Kolkata",
  "US Consulate General, Hyderabad",
  "US Consulate General, Bengaluru",
];

/**
 * Checklist catalogue.
 * group    — "carry" | "wear" | "leave"
 * critical — true when getting this wrong normally ends the visit
 * when     — pure predicate over the derived context; absent means "always"
 */
const ITEMS = [
  // ---------------------------------------------------------------- carry
  {
    id: "appointment-letter",
    group: "carry",
    critical: true,
    label: (context) => `Printed ${APPOINTMENT_TYPES[context.appointmentType].label.toLowerCase()} confirmation`,
    detail:
      "Guards check the printed confirmation before you reach the gate, and your phone will not be with you inside. Print it, do not rely on a screenshot.",
  },
  {
    id: "ds160",
    group: "carry",
    critical: true,
    label: "DS-160 confirmation page with the barcode",
    detail:
      "The barcode number is how your file is found. It must be the same DS-160 the appointment was booked against — a re-submitted form generates a new number and breaks the link.",
  },
  {
    id: "passport-current",
    group: "carry",
    critical: true,
    label: "Current passport, signed",
    detail:
      "The standard requirement is validity of at least six months beyond your intended stay unless a bilateral agreement shortens it. An unsigned passport is refused.",
  },
  {
    id: "passport-old",
    group: "carry",
    critical: true,
    label: "Every old passport you hold, especially any with a previous US visa",
    detail:
      "Prior US visas and entry stamps are checked against your record. Missing old passports are a common cause of an application being placed on hold.",
    when: (context) => context.appointmentType !== "ofc",
  },
  {
    id: "photo",
    group: "carry",
    critical: false,
    label: `One printed photograph — ${PHOTO_SPEC}`,
    detail:
      "Carry a spare even though the photo is captured at the OFC. If the uploaded digital photo is rejected, a compliant print is the only thing that saves the appointment.",
  },
  {
    id: "fee-receipt",
    group: "carry",
    critical: true,
    label: "Visa fee (MRV) payment receipt showing the receipt number",
    detail:
      "The receipt number links the payment to the appointment. Fee receipts are valid for one year from the date of payment.",
  },
  {
    id: "principal-doc",
    group: "carry",
    critical: true,
    label: (context) => VISA_CLASSES[context.visaClass].principalDoc,
    detail:
      "This is the document your category stands on. Bring the original, not a scan on a phone that you will not be carrying.",
    when: (context) => context.appointmentType !== "ofc",
  },
  {
    id: "sevis-receipt",
    group: "carry",
    critical: true,
    label: "SEVIS I-901 fee payment receipt",
    detail:
      "The SEVIS fee is separate from the visa fee and must be paid before the interview. Print the receipt showing the SEVIS ID that matches your I-20 or DS-2019.",
    when: (context) => VISA_CLASSES[context.visaClass].sevis && context.appointmentType !== "ofc",
  },
  {
    id: "financials",
    group: "carry",
    critical: false,
    label: "Financial evidence — funding letters, bank statements, sponsor documents",
    detail:
      "Consular officers may not ask for any of it, but arriving without it and being asked is far worse than carrying it unopened.",
    when: (context) => context.appointmentType === "interview",
  },
  {
    id: "ties-evidence",
    group: "carry",
    critical: false,
    label: "Evidence of your ties to India — employment, study, family, property",
    detail:
      "For temporary visa categories the officer is assessing intent to return. Employment letters and enrolment proofs are the usual evidence.",
    when: (context) => context.appointmentType === "interview",
  },
  {
    id: "dropbox-eligibility",
    group: "carry",
    critical: true,
    label: "Printed Interview Waiver eligibility confirmation from the appointment system",
    detail:
      "Drop-off locations only accept applicants the system has confirmed as eligible. Turning up without the confirmation means the passport is not taken.",
    when: (context) => context.appointmentType === "dropbox",
  },
  {
    id: "guardian",
    group: "carry",
    critical: true,
    label: "The accompanying parent or legal guardian, in person",
    detail:
      "A minor applicant cannot attend alone. One adult may accompany a minor, an elderly applicant or an applicant who needs assistance.",
    when: (context) => context.age < ADULT_AGE,
  },
  {
    id: "pen",
    group: "carry",
    critical: false,
    label: "A pen, and a clear plastic folder for the documents",
    detail:
      "A transparent folder is the one document carrier that reliably passes security, because its contents are visible.",
  },

  // ----------------------------------------------------------------- wear
  {
    id: "no-glasses-photo",
    group: "wear",
    critical: true,
    label: "No glasses in the photograph, and expect to remove them at capture",
    detail:
      "Eyeglasses have been prohibited in US visa photographs since November 2016. A photo with glasses is rejected outright.",
    when: (context) => context.biometricsCaptured,
  },
  {
    id: "avoid-white",
    group: "wear",
    critical: false,
    label: "Wear a dark or mid-tone top, not white",
    detail:
      "The photo background is white or off-white, and a white shirt disappears into it.",
    when: (context) => context.biometricsCaptured,
  },
  {
    id: "head-covering",
    group: "wear",
    critical: false,
    label: "Head coverings only for religious or medical reasons, worn clear of the face",
    detail:
      "The full face must be visible from the bottom of the chin to the top of the forehead. No hats, no uniforms.",
    when: (context) => context.biometricsCaptured,
  },
  {
    id: "fingertips",
    group: "wear",
    critical: true,
    label: "Fingertips clean, dry and unmarked — let fresh mehndi fade first",
    detail:
      "Ten-print scanners read the ridge pattern. Henna, dye, cuts and peeling skin cause failed captures and a second OFC appointment.",
    when: (context) => context.fingerprints,
  },
  {
    id: "no-lotion",
    group: "wear",
    critical: false,
    label: "No hand cream or sanitiser in the hour before your slot",
    detail: "A film of lotion blurs the ridges; moisturise the night before instead.",
    when: (context) => context.fingerprints,
  },
  {
    id: "interview-dress",
    group: "wear",
    critical: false,
    label: "Dress as you would for a professional meeting",
    detail:
      "The interview is a short face-to-face conversation at a window. Neat business-casual is the norm; there is no dress code, but you are being assessed as a person.",
    when: (context) => APPOINTMENT_TYPES[context.appointmentType].interview,
  },
  {
    id: "queue-outdoors",
    group: "wear",
    critical: false,
    label: "Dress for queuing outdoors",
    detail:
      "The queue at a US post forms on the pavement outside the perimeter, in whatever weather the city is having.",
  },

  // ---------------------------------------------------------------- leave
  {
    id: "no-electronics",
    group: "leave",
    critical: true,
    label: "Every electronic item — phone, laptop, tablet, smart watch, fitness band, earbuds, camera, USB drive, power bank",
    detail:
      "US diplomatic posts prohibit electronic devices and provide no storage. Anything you bring has to leave with someone who stays outside.",
  },
  {
    id: "no-key-fob",
    group: "leave",
    critical: true,
    label: "Electronic car keys and remote key fobs",
    detail:
      "A remote key counts as an electronic device. Carry a plain mechanical key, or leave the keys with whoever drove you.",
  },
  {
    id: "no-bags",
    group: "leave",
    critical: true,
    label: "Backpacks, handbags, briefcases, travel bags and luggage",
    detail:
      "Bags are refused at the gate. Bring documents in a clear plastic folder and nothing else.",
  },
  {
    id: "no-storage",
    group: "leave",
    critical: true,
    label: "Anything you would need somewhere to store",
    detail:
      "There is no cloakroom at a US Embassy or Consulate. Paid lockers exist near some posts but are private businesses, used at your own risk and often full by mid-morning.",
  },
  {
    id: "no-sealed",
    group: "leave",
    critical: false,
    label: "Sealed envelopes and wrapped packages",
    detail: "Everything has to be visible at the security check, so bring documents loose.",
  },
  {
    id: "no-food",
    group: "leave",
    critical: false,
    label: "Food, water bottles, flasks and cigarettes",
    detail: "Eat and drink before you join the queue; none of it goes through the gate.",
  },
  {
    id: "no-sharp",
    group: "leave",
    critical: false,
    label: "Scissors, nail cutters, penknives, lighters and matches",
    detail: "Confiscated at the perimeter and not returned.",
  },
  {
    id: "no-cosmetics",
    group: "leave",
    critical: false,
    label: "Perfume, aerosols and liquid cosmetics",
    detail: "Liquids and pressurised containers are on the prohibited list.",
  },
  {
    id: "no-companions",
    group: "leave",
    critical: true,
    label: "Anyone who is not an applicant",
    detail:
      "Only applicants are admitted. The exception is one adult accompanying a minor, an elderly applicant or someone who needs assistance — and that adult is who your phone and keys should be left with.",
    when: (context) => context.age >= ADULT_AGE,
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** "YYYY-MM-DD" -> UTC milliseconds at midnight, or null when unparseable. */
export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  // Rejects impossible dates such as 2026-02-30, which Date.UTC would roll over.
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

/** UTC milliseconds -> "YYYY-MM-DD". */
export function formatIsoDate(ms) {
  if (!isNum(ms)) return "";
  const date = new Date(ms);
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Whole days between two UTC midnights. */
export function daysBetween(fromMs, toMs) {
  if (!isNum(fromMs) || !isNum(toMs)) return null;
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}

/**
 * Whether fingerprints will be captured, given the age brackets.
 *
 * @param {number} age
 * @param {string} appointmentType
 * @returns {{ fingerprints: boolean, reason: string }}
 */
export function fingerprintStatus(age, appointmentType) {
  const meta = APPOINTMENT_TYPES[appointmentType];
  if (!meta || !isNum(age)) return { fingerprints: false, reason: "" };
  if (!meta.biometrics) {
    return {
      fingerprints: false,
      reason: "No biometrics are captured at this visit — they are taken at the OFC appointment.",
    };
  }
  if (age < FINGERPRINT_MIN_AGE) {
    return {
      fingerprints: false,
      reason: `Under ${FINGERPRINT_MIN_AGE}, so fingerprints are not collected. A photograph is still taken.`,
    };
  }
  if (age > FINGERPRINT_MAX_AGE) {
    return {
      fingerprints: false,
      reason: `Over ${FINGERPRINT_MAX_AGE}, so fingerprints are not collected. A photograph is still taken.`,
    };
  }
  return { fingerprints: true, reason: "Ten fingerprints will be scanned, so fingertip condition matters." };
}

/**
 * Age-based Interview Waiver indication. Age is only one of several criteria —
 * the official appointment system is what actually decides eligibility.
 *
 * @param {number} age
 */
export function interviewWaiverAgeHint(age) {
  if (!isNum(age)) return { ageEligible: false, note: "" };
  if (age < FINGERPRINT_MIN_AGE) {
    return {
      ageEligible: true,
      note: `Applicants under ${FINGERPRINT_MIN_AGE} are often processed without an in-person interview, but the appointment system decides — never skip a scheduled interview.`,
    };
  }
  if (age > FINGERPRINT_MAX_AGE) {
    return {
      ageEligible: true,
      note: `Applicants over ${FINGERPRINT_MAX_AGE} are often processed without an in-person interview, but the appointment system decides — never skip a scheduled interview.`,
    };
  }
  return { ageEligible: false, note: "" };
}

/**
 * Build the checklist for one visit.
 *
 * @param {{ appointmentType:string, visaClass:string, age:number }} input
 * @returns {object} grouped checklist, or { error }
 */
export function buildChecklist(input) {
  const appointmentType = input?.appointmentType;
  if (!APPOINTMENT_TYPES[appointmentType]) {
    return { error: "Choose which appointment you are attending." };
  }
  const visaClass = input?.visaClass;
  if (!VISA_CLASSES[visaClass]) return { error: "Choose your visa category." };

  const age = Number(input?.age);
  if (!isNum(age)) return { error: "Enter the applicant's age in whole years." };
  if (age < 0) return { error: "Age cannot be negative." };
  if (age > 120) return { error: "Enter an age of 120 or under." };

  const prints = fingerprintStatus(age, appointmentType);
  const context = {
    appointmentType,
    visaClass,
    age,
    fingerprints: prints.fingerprints,
    biometricsCaptured: APPOINTMENT_TYPES[appointmentType].biometrics,
  };

  const groups = { carry: [], wear: [], leave: [] };
  for (const item of ITEMS) {
    if (typeof item.when === "function" && !item.when(context)) continue;
    groups[item.group].push({
      id: item.id,
      group: item.group,
      critical: item.critical,
      label: typeof item.label === "function" ? item.label(context) : item.label,
      detail: item.detail,
    });
  }

  const all = [...groups.carry, ...groups.wear, ...groups.leave];

  return {
    appointmentType,
    appointmentLabel: APPOINTMENT_TYPES[appointmentType].label,
    location: APPOINTMENT_TYPES[appointmentType].location,
    visaClass,
    visaClassLabel: VISA_CLASSES[visaClass].label,
    age,
    isMinor: age < ADULT_AGE,
    fingerprints: prints,
    waiverHint: interviewWaiverAgeHint(age),
    groups,
    all,
    total: all.length,
    criticalTotal: all.filter((item) => item.critical).length,
  };
}

/**
 * Readiness score over the ticked items.
 *
 * @param {Array<{id:string, critical:boolean}>} items
 * @param {Set<string>|Array<string>} checked
 */
export function computeReadiness(items, checked) {
  const list = Array.isArray(items) ? items : [];
  const ticked = checked instanceof Set ? checked : new Set(checked || []);
  const total = list.length;
  const done = list.filter((item) => ticked.has(item.id)).length;
  const criticals = list.filter((item) => item.critical);
  const criticalDone = criticals.filter((item) => ticked.has(item.id)).length;
  return {
    total,
    done,
    percent: total > 0 ? (done / total) * 100 : 0,
    criticalTotal: criticals.length,
    criticalDone,
    criticalMissing: criticals.length - criticalDone,
    ready: total > 0 && criticalDone === criticals.length,
  };
}

/** "HH:MM" -> minutes after midnight, or null. */
export function parseClock(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Minutes after midnight -> "HH:MM". */
export function formatClock(totalMinutes) {
  if (!isNum(totalMinutes)) return "";
  const wrapped = ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

/**
 * Arrival window and leave-home time.
 *
 * The US rule is a ceiling: you may not arrive more than 15 minutes early, so
 * the usable window is [appointment - 15, appointment].
 *
 * @param {{ appointmentTime:string, travelMinutes:number, contingencyMinutes?:number }} input
 */
export function computeArrivalWindow({ appointmentTime, travelMinutes, contingencyMinutes }) {
  const appointment = parseClock(appointmentTime);
  if (appointment === null) return { error: "Enter the appointment time as HH:MM, e.g. 08:30." };

  const travel = Number(travelMinutes);
  if (!isNum(travel)) return { error: "Enter your travel time in minutes." };
  if (travel < 0) return { error: "Travel time cannot be negative." };
  if (travel > MINUTES_PER_DAY) return { error: "Enter a travel time under 24 hours." };

  const contingency =
    contingencyMinutes === undefined || contingencyMinutes === null
      ? DEFAULT_CONTINGENCY_MINUTES
      : Number(contingencyMinutes);
  if (!isNum(contingency) || contingency < 0) {
    return { error: "Contingency buffer must be zero or more minutes." };
  }

  const windowOpensMinutes = appointment - MAX_EARLY_ARRIVAL_MINUTES;
  const leaveHomeMinutes = windowOpensMinutes - travel - contingency;

  return {
    appointment: formatClock(appointment),
    windowOpens: formatClock(windowOpensMinutes),
    windowCloses: formatClock(appointment),
    leaveHomeBy: formatClock(leaveHomeMinutes),
    previousDay: leaveHomeMinutes < 0,
    windowMinutes: MAX_EARLY_ARRIVAL_MINUTES,
    totalLeadMinutes: MAX_EARLY_ARRIVAL_MINUTES + travel + contingency,
  };
}

/**
 * Student and exchange-visitor date windows.
 *
 * earliestIssuance = programme start - 365 days   (F and M only)
 * earliestEntry    = programme start - 30 days    (F, M and J)
 *
 * @param {{ visaClass:string, programStartDate:string, appointmentDate:string }} input
 * @returns {object} window dates, { applicable:false } for other categories, or { error }
 */
export function computeStudentWindows({ visaClass, programStartDate, appointmentDate }) {
  const meta = VISA_CLASSES[visaClass];
  if (!meta) return { error: "Choose your visa category." };
  if (!meta.entryWindow) return { applicable: false };

  const startMs = parseIsoDate(programStartDate);
  if (startMs === null) {
    return { error: "Enter the programme start date from your I-20 or DS-2019 as YYYY-MM-DD." };
  }
  const appointmentMs = parseIsoDate(appointmentDate);
  if (appointmentMs === null) return { error: "Enter your appointment date as YYYY-MM-DD." };

  const earliestEntryMs = startMs - STUDENT_ENTRY_LEAD_DAYS * MS_PER_DAY;
  const earliestIssuanceMs = meta.issuanceWindow
    ? startMs - STUDENT_VISA_ISSUANCE_LEAD_DAYS * MS_PER_DAY
    : null;

  const daysToStart = daysBetween(appointmentMs, startMs);

  return {
    applicable: true,
    programStart: formatIsoDate(startMs),
    appointmentDate: formatIsoDate(appointmentMs),
    earliestEntry: formatIsoDate(earliestEntryMs),
    earliestIssuance: earliestIssuanceMs === null ? null : formatIsoDate(earliestIssuanceMs),
    daysToStart,
    // True when the appointment falls before visas for this programme can be issued.
    tooEarlyForIssuance: earliestIssuanceMs !== null && appointmentMs < earliestIssuanceMs,
    // True when the appointment is on or after the programme start date.
    afterStart: appointmentMs >= startMs,
    entryLeadDays: STUDENT_ENTRY_LEAD_DAYS,
    issuanceLeadDays: meta.issuanceWindow ? STUDENT_VISA_ISSUANCE_LEAD_DAYS : null,
  };
}
