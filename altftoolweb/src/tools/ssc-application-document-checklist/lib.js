/**
 * SSC application readiness: the documents and details an applicant must have in
 * hand before opening a Staff Selection Commission form, the fee rules, and the
 * age-eligibility arithmetic used in every SSC notice.
 *
 * Sources for the rules encoded here:
 *
 *  - One-Time Registration (OTR) on ssc.gov.in asks for Aadhaar or an alternative
 *    photo ID, matriculation (Class 10) board, roll number and year, parents'
 *    names and date of birth exactly as in the matric certificate, and a mobile
 *    number and email ID that are each verified by OTP.
 *  - SSC examination notices (CGL, CHSL, MTS) fix the application fee at Rs 100
 *    and exempt women and candidates belonging to SC, ST, PwBD and eligible
 *    ex-servicemen from paying it.
 *  - The correction window allows two re-submissions, charged Rs 200 for the
 *    first correction and Rs 500 for the second.
 *  - The scanned signature must be a JPEG between 10 KB and 20 KB; the
 *    photograph is now taken as a live capture during registration.
 *  - Age limits are tested on the cutoff date printed in the notice, phrased as
 *    "born not before <date> and not later than <date>". Permissible relaxation
 *    beyond the upper limit for Group C posts: OBC 3 years, SC/ST 5 years,
 *    PwBD (unreserved) 10, PwBD (OBC) 13, PwBD (SC/ST) 15 years.
 *
 * Pure functions only — dates always arrive as arguments.
 */

/** Application fee in rupees, per SSC CGL/CHSL/MTS notices. */
export const APPLICATION_FEE = 100;

/** Correction-window charges: two re-submissions are allowed. */
export const CORRECTION_FEE_FIRST = 200;
export const CORRECTION_FEE_SECOND = 500;

/** Scanned signature file rules from the notice annexure. */
export const SIGNATURE_FORMAT = "JPEG";
export const SIGNATURE_MIN_KB = 10;
export const SIGNATURE_MAX_KB = 20;

/**
 * Permissible relaxation in upper age limit for Group C posts, as tabled in SSC
 * notices. The years add to the notice's upper age limit.
 */
export const AGE_RELAXATIONS = [
  { id: "ur", label: "Unreserved / EWS", years: 0 },
  { id: "obc", label: "OBC", years: 3 },
  { id: "sc-st", label: "SC / ST", years: 5 },
  { id: "pwbd-ur", label: "PwBD (unreserved)", years: 10 },
  { id: "pwbd-obc", label: "PwBD (OBC)", years: 13 },
  { id: "pwbd-sc-st", label: "PwBD (SC / ST)", years: 15 },
];

/**
 * Common SSC age bands. The band for a specific post is printed in the notice —
 * CGL alone spans several bands by post — so the numbers stay editable.
 */
export const AGE_BAND_PRESETS = [
  { id: "18-27", label: "18 to 27 (CHSL, many CGL posts)", minAge: 18, maxAge: 27 },
  { id: "18-25", label: "18 to 25 (MTS, some constable posts)", minAge: 18, maxAge: 25 },
  { id: "18-30", label: "18 to 30 (some CGL posts)", minAge: 18, maxAge: 30 },
  { id: "20-30", label: "20 to 30 (some CGL posts)", minAge: 20, maxAge: 30 },
  { id: "18-32", label: "18 to 32 (a few CGL posts)", minAge: 18, maxAge: 32 },
];

/** Categories exempt from the application fee, per every SSC notice. */
export const FEE_EXEMPT_NOTE =
  "Women candidates and candidates belonging to SC, ST, PwBD and eligible ex-servicemen are exempt from the fee.";

/** Sanity bounds for the eligibility inputs. */
const MIN_REASONABLE_AGE = 14;
const MAX_REASONABLE_AGE = 60;
const MAX_RELAXATION_YEARS = 20;

const MS_PER_DAY = 86400000;

export const CHECKLIST_GROUPS = [
  {
    id: "otr",
    title: "One-Time Registration details",
    items: [
      {
        id: "aadhaar",
        label: "Aadhaar number, or an alternative photo ID number",
        required: true,
        note: "Voter ID, PAN, passport, driving licence or a school/college ID work where Aadhaar is not given.",
      },
      {
        id: "matric",
        label: "Class 10 board name, roll number and year of passing",
        required: true,
        note: "Copied from the matriculation certificate — OTR asks for them exactly.",
      },
      {
        id: "names-dob",
        label: "Your name, father's name, mother's name and date of birth as in the matric certificate",
        required: true,
        note: "A spelling that differs from the certificate causes document-verification trouble later.",
      },
      {
        id: "mobile",
        label: "A working mobile number you can receive an OTP on now",
        required: true,
      },
      {
        id: "email",
        label: "A personal email ID you can open now, also OTP-verified",
        required: true,
        note: "Use your own address — every admit card and result alert lands here for years.",
      },
    ],
  },
  {
    id: "uploads",
    title: "Photo and signature",
    items: [
      {
        id: "live-photo",
        label: "Ready for the live photo capture: plain background, no cap or dark glasses",
        required: true,
        note: "The portal takes the photograph by webcam during registration instead of an upload.",
      },
      {
        id: "signature",
        label: `Scanned signature: ${SIGNATURE_FORMAT}, ${SIGNATURE_MIN_KB}-${SIGNATURE_MAX_KB} KB`,
        required: true,
        note: "Signed in black or blue ink on white paper, scanned to the dimensions given in the notice.",
      },
    ],
  },
  {
    id: "certificates",
    title: "Certificates to keep at hand",
    items: [
      {
        id: "category",
        label: "SC / ST / OBC-NCL certificate in the Government of India format, if you claim one",
        required: false,
        note: "The OBC certificate must show the candidate is outside the creamy layer.",
      },
      {
        id: "ews",
        label: "EWS income and asset certificate for the relevant financial year, if you claim EWS",
        required: false,
      },
      {
        id: "pwbd",
        label: "PwBD certificate from the competent authority, if applicable",
        required: false,
      },
      {
        id: "esm",
        label: "Ex-servicemen discharge book or serving-personnel undertaking, if applicable",
        required: false,
      },
      {
        id: "higher-quals",
        label: "Certificates for qualifications beyond Class 10 named in the form",
        required: false,
        note: "Degree or Class 12 details are typed into the form; the certificates are checked at verification.",
      },
    ],
  },
  {
    id: "submit",
    title: "Before you pay and submit",
    items: [
      {
        id: "fee-ready",
        label: `Fee ready (Rs ${APPLICATION_FEE} by UPI, net banking or card) or exemption confirmed`,
        required: true,
        note: FEE_EXEMPT_NOTE,
      },
      {
        id: "centres",
        label: "Exam centre preferences picked — three centres within the same SSC region",
        required: true,
      },
      {
        id: "preview",
        label: "Every field re-read on the preview page before final submission",
        required: true,
        note: `Corrections after submission cost Rs ${CORRECTION_FEE_FIRST} the first time and Rs ${CORRECTION_FEE_SECOND} the second — only two are allowed.`,
      },
      {
        id: "save-pdf",
        label: "Final application saved as a PDF and printed once",
        required: false,
      },
    ],
  },
];

export function itemKey(groupId, itemId) {
  return `${groupId}:${itemId}`;
}

/** Parse a YYYY-MM-DD string to a UTC timestamp, or null when invalid. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const probe = new Date(stamp);
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return stamp;
}

/** Format a UTC timestamp back to YYYY-MM-DD. */
export function formatISODate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  const date = new Date(stamp);
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Shift a UTC timestamp by whole years (29 Feb rolls to 1 Mar off leap years). */
export function addYears(stamp, years) {
  const date = new Date(stamp);
  return Date.UTC(date.getUTCFullYear() + years, date.getUTCMonth(), date.getUTCDate());
}

/** Completed years of age on a given date — the "attained X years" test. */
export function completedYears(dobStamp, onStamp) {
  const dob = new Date(dobStamp);
  const on = new Date(onStamp);
  let years = on.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday =
    on.getUTCMonth() < dob.getUTCMonth() ||
    (on.getUTCMonth() === dob.getUTCMonth() && on.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) years -= 1;
  return years;
}

/**
 * Age eligibility exactly as an SSC notice states it: on the cutoff date the
 * candidate must have attained minAge and must not have exceeded
 * maxAge + relaxation. The result includes the DOB window in the notice's own
 * "born not before / not later than" phrasing.
 *
 * @param {object} input
 * @param {string} input.dobISO           Date of birth, YYYY-MM-DD (as in the matric certificate).
 * @param {string} input.cutoffISO        Age-reckoning cutoff date from the notice.
 * @param {number} input.minAge           Lower age limit in the notice.
 * @param {number} input.maxAge           Upper age limit in the notice, before relaxation.
 * @param {number} input.relaxationYears  Permissible relaxation for the category.
 * @returns {object} verdict, or { error }.
 */
export function checkAgeEligibility({ dobISO, cutoffISO, minAge, maxAge, relaxationYears = 0 }) {
  const dob = parseISODate(dobISO);
  const cutoff = parseISODate(cutoffISO);
  if (dob === null) return { error: "Enter the date of birth as a valid calendar date." };
  if (cutoff === null) return { error: "Enter the cutoff date from the notice as a valid calendar date." };
  if (dob >= cutoff) return { error: "The date of birth must fall before the cutoff date." };

  const min = Number(minAge);
  const max = Number(maxAge);
  const relax = Number(relaxationYears);
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { error: "Enter the lower and upper age limits as numbers." };
  }
  if (min < MIN_REASONABLE_AGE || max > MAX_REASONABLE_AGE || min > max) {
    return {
      error: `Age limits must run from ${MIN_REASONABLE_AGE} to ${MAX_REASONABLE_AGE}, lower limit first.`,
    };
  }
  if (!Number.isFinite(relax) || relax < 0 || relax > MAX_RELAXATION_YEARS) {
    return { error: `Relaxation must be between 0 and ${MAX_RELAXATION_YEARS} years.` };
  }

  const ageOnCutoff = completedYears(dob, cutoff);
  const maxWithRelax = max + relax;
  const tooYoung = ageOnCutoff < min;
  const tooOld = ageOnCutoff > maxWithRelax;

  // "Born not later than": the latest DOB that has attained minAge on the cutoff.
  const latestDob = addYears(cutoff, -min);
  // "Born not before": one day after the DOB that turns (maxWithRelax + 1) on the cutoff.
  const earliestDob = addYears(cutoff, -(maxWithRelax + 1)) + MS_PER_DAY;

  return {
    ageOnCutoff,
    minAge: min,
    maxAge: max,
    relaxationYears: relax,
    maxWithRelax,
    eligible: !tooYoung && !tooOld,
    tooYoung,
    tooOld,
    earliestDobISO: formatISODate(earliestDob),
    latestDobISO: formatISODate(latestDob),
    marginYears: tooYoung ? min - ageOnCutoff : tooOld ? ageOnCutoff - maxWithRelax : 0,
  };
}

/**
 * Application fee under the SSC exemption rule: women and SC, ST, PwBD and
 * eligible ex-servicemen candidates pay nothing; everyone else pays Rs 100.
 */
export function applicationFee({ isWoman = false, categoryId = "ur", isPwbd = false, isEsm = false } = {}) {
  const exemptByCategory = categoryId === "sc-st" || categoryId === "pwbd-sc-st";
  const exempt = Boolean(isWoman) || Boolean(isPwbd) || Boolean(isEsm) || exemptByCategory;
  return {
    fee: exempt ? 0 : APPLICATION_FEE,
    exempt,
    reason: exempt
      ? "Exempt from the fee under the SSC notice (women, SC, ST, PwBD and eligible ex-servicemen pay nothing)."
      : `The standard fee of Rs ${APPLICATION_FEE} applies, payable online by UPI, net banking or card.`,
  };
}

/** Tick progress across the checklist, with required items treated as blocking. */
export function checklistReadiness(checked = {}) {
  const items = CHECKLIST_GROUPS.flatMap((group) =>
    group.items.map((item) => ({ ...item, key: itemKey(group.id, item.id) })),
  );
  if (items.length === 0) return { error: "The checklist has no items." };

  const done = items.filter((item) => checked[item.key]);
  const required = items.filter((item) => item.required);
  const blocking = required.filter((item) => !checked[item.key]);

  return {
    totalItems: items.length,
    doneItems: done.length,
    requiredItems: required.length,
    requiredDone: required.length - blocking.length,
    percent: (done.length / items.length) * 100,
    blocking: blocking.map((item) => item.label),
    ready: blocking.length === 0,
  };
}
