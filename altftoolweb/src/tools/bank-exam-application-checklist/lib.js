/**
 * Bank exam application checklist — IBPS and SBI online forms.
 *
 * Rule sources (all from the recruitment notifications the two bodies publish):
 *
 *  - Age bands are stated in each notification as "minimum ... maximum ... years as on
 *    <cut-off date>": IBPS PO/MT 20-30, IBPS Clerk 20-28, IBPS SO 20-30, IBPS RRB
 *    Officer Scale I 18-30, IBPS RRB Office Assistant 18-28, SBI PO 21-30, SBI Clerk
 *    (Junior Associate) 20-28.
 *
 *  - Upper age relaxation follows the standard Government of India table reproduced in
 *    every IBPS and SBI notification: SC/ST 5 years, OBC non-creamy-layer 3 years,
 *    Persons with Benchmark Disability 10 years on top of the category relaxation
 *    (which is why the published figures read 10 / 13 / 15), ex-servicemen 5 years,
 *    persons domiciled in Jammu & Kashmir between 1 January 1980 and 31 December 1989
 *    5 years, and — in the clerical cadre — widows and divorced women who have not
 *    remarried 9 years. Relaxation moves the UPPER limit only; the minimum age never
 *    moves.
 *
 *  - The notifications express the resulting window as a date-of-birth range, e.g.
 *    "born not earlier than 02.08.1993 and not later than 01.08.2003". That is
 *    cut-off minus (max age) years plus one day, through cut-off minus (min age) years.
 *    This module reproduces that arithmetic rather than rounding ages.
 *
 *  - Upload specifications are the common IBPS/SBI scanned-document spec: photograph
 *    200x230 px at 20-50 kb, signature 140x60 px at 10-20 kb, left thumb impression
 *    240x240 px at 20-50 kb, handwritten declaration 800x400 px at 50-100 kb, all JPEG
 *    at 200 dpi. The declaration must be written in English in running handwriting,
 *    not in capital letters, and not by anyone other than the candidate.
 *
 * Fees, cut-off dates and vacancy rules change with every cycle. This is informational
 * only — the notification PDF for your cycle is the authority.
 */

/** Exams covered, with the age band each notification states. */
export const EXAMS = [
  {
    id: "ibps-po",
    label: "IBPS PO / Management Trainee",
    body: "IBPS",
    minAge: 20,
    maxAge: 30,
    qualification: "Graduate in any discipline, degree in hand on the day of registration",
    cadre: "officer",
  },
  {
    id: "ibps-clerk",
    label: "IBPS Clerk (CRP Clerical)",
    body: "IBPS",
    minAge: 20,
    maxAge: 28,
    qualification: "Graduate in any discipline; local-language proficiency is checked at joining",
    cadre: "clerical",
  },
  {
    id: "ibps-so",
    label: "IBPS Specialist Officer",
    body: "IBPS",
    minAge: 20,
    maxAge: 30,
    qualification: "Post-specific degree — IT, Agriculture, Law, HR, Marketing or Finance",
    cadre: "officer",
  },
  {
    id: "ibps-rrb-po",
    label: "IBPS RRB Officer Scale I",
    body: "IBPS",
    minAge: 18,
    maxAge: 30,
    qualification: "Graduate, with preference for Agriculture, Banking, Finance, Law or IT",
    cadre: "officer",
  },
  {
    id: "ibps-rrb-clerk",
    label: "IBPS RRB Office Assistant",
    body: "IBPS",
    minAge: 18,
    maxAge: 28,
    qualification: "Graduate; proficiency in the local language of the chosen state",
    cadre: "clerical",
  },
  {
    id: "sbi-po",
    label: "SBI Probationary Officer",
    body: "SBI",
    minAge: 21,
    maxAge: 30,
    qualification: "Graduate in any discipline; final-year students may apply provisionally",
    cadre: "officer",
  },
  {
    id: "sbi-clerk",
    label: "SBI Clerk (Junior Associate)",
    body: "SBI",
    minAge: 20,
    maxAge: 28,
    qualification: "Graduate; the specified local language must be read, write and speak level",
    cadre: "clerical",
  },
];

/** Category relaxation on the upper age limit, in years. */
export const CATEGORIES = [
  { id: "general", label: "General / EWS", years: 0 },
  { id: "obc", label: "OBC (non-creamy layer)", years: 3 },
  { id: "sc", label: "Scheduled Caste", years: 5 },
  { id: "st", label: "Scheduled Tribe", years: 5 },
];

/** Persons with Benchmark Disability, on top of the category relaxation. */
export const PWBD_RELAXATION_YEARS = 10;
/** Ex-servicemen, per the standard relaxation table. */
export const EX_SERVICEMEN_RELAXATION_YEARS = 5;
/** Domicile of Jammu & Kashmir between 1 Jan 1980 and 31 Dec 1989. */
export const JK_DOMICILE_RELAXATION_YEARS = 5;
/** Widows and divorced women not remarried — clerical cadre only. */
export const WIDOW_RELAXATION_YEARS = 9;

/** The common IBPS / SBI scanned upload specification. */
export const UPLOAD_SPECS = [
  {
    id: "photo",
    label: "Passport photograph",
    pixels: "200 x 230 px",
    sizeKb: "20 - 50 KB",
    detail:
      "Recent colour photograph against a light background, full face, both ears visible, no cap or dark glasses. Prescription spectacles are allowed.",
  },
  {
    id: "signature",
    label: "Signature",
    pixels: "140 x 60 px",
    sizeKb: "10 - 20 KB",
    detail:
      "Signed with a black ink pen on white paper by the candidate alone. A signature in capital letters is rejected.",
  },
  {
    id: "thumb",
    label: "Left thumb impression",
    pixels: "240 x 240 px",
    sizeKb: "20 - 50 KB",
    detail:
      "Blue or black ink on white paper. If the left thumb is missing, use any other finger and say which one.",
  },
  {
    id: "declaration",
    label: "Handwritten declaration",
    pixels: "800 x 400 px",
    sizeKb: "50 - 100 KB",
    detail:
      "Written by the candidate in English in running handwriting, not in capital letters and not by anyone else.",
  },
];

/** File format the scanned uploads must be in. */
export const UPLOAD_FORMAT = "JPEG / JPG, scanned at 200 dpi";

/** Text the handwritten declaration has to carry, as printed in the notifications. */
export const DECLARATION_TEXT =
  "I, _______ (name of the candidate), hereby declare that all the information submitted by me in the application form is correct, true and valid. I will present the supporting documents as and when required.";

/** Fields the online form asks for, in roughly the order they appear. */
export const FORM_FIELDS = [
  { id: "name", label: "Name exactly as printed on the Class 10 certificate", group: "Identity" },
  { id: "parents", label: "Father's and mother's name, same spelling as the certificates", group: "Identity" },
  { id: "dob", label: "Date of birth as on the Class 10 marksheet", group: "Identity" },
  { id: "email", label: "A working email address you will keep for a year", group: "Contact" },
  { id: "mobile", label: "Mobile number registered in your own name", group: "Contact" },
  { id: "address", label: "Correspondence address with PIN code", group: "Contact" },
  { id: "category", label: "Category, and the certificate number that supports it", group: "Reservation" },
  { id: "qualification", label: "Graduation percentage, passing year and university", group: "Academics" },
  { id: "centres", label: "Preferred exam centre and state, in order of preference", group: "Preferences" },
  { id: "banks", label: "Bank or post preferences where the form asks for them", group: "Preferences" },
  { id: "language", label: "Local language declaration for the chosen state", group: "Preferences" },
];

/** Documents to have scanned and ready before the form opens. */
export const BASE_DOCUMENTS = [
  { id: "class10", label: "Class 10 certificate — the date-of-birth proof", required: true },
  { id: "degree", label: "Degree certificate or provisional certificate", required: true },
  { id: "marksheets", label: "All graduation marksheets", required: true },
  { id: "idProof", label: "Photo ID — Aadhaar, PAN, passport or driving licence", required: true },
  { id: "fee", label: "Card, UPI or net banking for the application fee", required: true },
  { id: "resume", label: "Work experience letters, where the post counts experience", required: false },
];

const DAY_MS = 86400000;

function isLeap(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year, month) {
  const table = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month === 2 && isLeap(year) ? 29 : table[month - 1];
}

/**
 * Parse a strict YYYY-MM-DD string. Returns null for anything else, including
 * impossible dates such as 2023-02-30.
 */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (y < 1900 || y > 2200 || m < 1 || m > 12) return null;
  if (d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

function toISO({ y, m, d }) {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function toUTC({ y, m, d }) {
  return Date.UTC(y, m - 1, d);
}

function fromUTC(ms) {
  const date = new Date(ms);
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() };
}

function shiftDays(parts, days) {
  return fromUTC(toUTC(parts) + days * DAY_MS);
}

/** Same calendar day n years earlier; 29 February falls back to 28 February. */
function minusYears(parts, years) {
  const y = parts.y - years;
  const d = Math.min(parts.d, daysInMonth(y, parts.m));
  return { y, m: parts.m, d };
}

/**
 * Exact age in completed years, months and days on a given date.
 *
 * @param {string} dobISO  Date of birth, YYYY-MM-DD.
 * @param {string} onISO   The date the age is measured on, YYYY-MM-DD.
 * @returns {{years:number,months:number,days:number,totalDays:number}|{error:string}}
 */
export function ageOn(dobISO, onISO) {
  const dob = parseISODate(dobISO);
  const on = parseISODate(onISO);
  if (!dob) return { error: "Enter the date of birth as a real calendar date." };
  if (!on) return { error: "Enter the cut-off date as a real calendar date." };
  if (toUTC(dob) > toUTC(on)) {
    return { error: "The date of birth falls after the cut-off date." };
  }

  let years = on.y - dob.y;
  let months = on.m - dob.m;
  let days = on.d - dob.d;

  if (days < 0) {
    months -= 1;
    const prevMonth = on.m === 1 ? 12 : on.m - 1;
    const prevYear = on.m === 1 ? on.y - 1 : on.y;
    days += daysInMonth(prevYear, prevMonth);
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.round((toUTC(on) - toUTC(dob)) / DAY_MS);
  return { years, months, days, totalDays };
}

/**
 * Total upper-age relaxation in years for the boxes ticked.
 *
 * @returns {{years:number, parts:Array<{label:string,years:number}>}}
 */
export function relaxationYears({
  categoryId = "general",
  pwbd = false,
  exServiceman = false,
  jkDomicile = false,
  widowDivorced = false,
  cadre = "officer",
} = {}) {
  const parts = [];
  const category = CATEGORIES.find((entry) => entry.id === categoryId);
  if (category && category.years > 0) {
    parts.push({ label: category.label, years: category.years });
  }
  if (pwbd) {
    parts.push({ label: "Person with Benchmark Disability", years: PWBD_RELAXATION_YEARS });
  }
  if (exServiceman) {
    parts.push({ label: "Ex-serviceman", years: EX_SERVICEMEN_RELAXATION_YEARS });
  }
  if (jkDomicile) {
    parts.push({ label: "J&K domicile 1980-1989", years: JK_DOMICILE_RELAXATION_YEARS });
  }
  if (widowDivorced && cadre === "clerical") {
    parts.push({ label: "Widow / divorced woman, not remarried", years: WIDOW_RELAXATION_YEARS });
  }
  const years = parts.reduce((sum, part) => sum + part.years, 0);
  return { years, parts };
}

/**
 * Age eligibility for one exam on its stated cut-off date.
 *
 * @returns {object} verdict object, or { error } for unusable input.
 */
export function checkBankExamAge({
  examId = "ibps-po",
  dob = "",
  cutoffDate = "",
  categoryId = "general",
  pwbd = false,
  exServiceman = false,
  jkDomicile = false,
  widowDivorced = false,
} = {}) {
  const exam = EXAMS.find((entry) => entry.id === examId);
  if (!exam) return { error: "Pick one of the listed IBPS or SBI exams." };

  const age = ageOn(dob, cutoffDate);
  if (age.error) return { error: age.error };

  const cutoff = parseISODate(cutoffDate);
  const relax = relaxationYears({
    categoryId,
    pwbd,
    exServiceman,
    jkDomicile,
    widowDivorced,
    cadre: exam.cadre,
  });

  const effectiveMaxAge = exam.maxAge + relax.years;
  // The notification states the window as dates of birth, so build it the same way.
  const latestDob = toISO(minusYears(cutoff, exam.minAge));
  const earliestDob = toISO(shiftDays(minusYears(cutoff, effectiveMaxAge), 1));

  const tooYoung = age.years < exam.minAge;
  const tooOld =
    age.years > effectiveMaxAge ||
    (age.years === effectiveMaxAge && (age.months > 0 || age.days > 0));

  let verdict;
  if (tooYoung) {
    verdict = `Below the minimum of ${exam.minAge} years. Relaxation never moves the minimum age, only the upper limit.`;
  } else if (tooOld) {
    verdict = `Above the upper limit of ${effectiveMaxAge} years on ${cutoffDate}.`;
  } else {
    verdict = `Within the ${exam.minAge}-${effectiveMaxAge} year window on ${cutoffDate}.`;
  }

  return {
    exam,
    age,
    relaxation: relax,
    baseMaxAge: exam.maxAge,
    effectiveMaxAge,
    minAge: exam.minAge,
    earliestDob,
    latestDob,
    eligible: !tooYoung && !tooOld,
    tooYoung,
    tooOld,
    verdict,
  };
}

/**
 * Everything the applicant has to assemble for one exam.
 *
 * @returns {object} checklist result, or { error }.
 */
export function buildBankExamChecklist(input = {}) {
  const ageCheck = checkBankExamAge(input);
  if (ageCheck.error) return { error: ageCheck.error };

  const documents = BASE_DOCUMENTS.slice();
  const category = CATEGORIES.find((entry) => entry.id === (input.categoryId || "general"));

  if (category && category.id !== "general") {
    documents.push({
      id: "categoryCert",
      label: `${category.label} certificate in the format the notification prescribes`,
      required: true,
    });
  }
  if (input.categoryId === "general") {
    documents.push({
      id: "ewsCert",
      label: "EWS income and asset certificate, if you are claiming the EWS quota",
      required: false,
    });
  }
  if (input.pwbd) {
    documents.push({
      id: "pwbdCert",
      label: "Disability certificate showing 40% or more benchmark disability",
      required: true,
    });
    documents.push({
      id: "scribe",
      label: "Scribe request and the scribe's own ID, if you need one",
      required: false,
    });
  }
  if (input.exServiceman) {
    documents.push({
      id: "esmDischarge",
      label: "Discharge certificate and, where applicable, the serving certificate",
      required: true,
    });
  }
  if (input.widowDivorced && ageCheck.exam.cadre === "clerical") {
    documents.push({
      id: "maritalProof",
      label: "Decree of divorce or the death certificate, plus a declaration of not having remarried",
      required: true,
    });
  }

  const checklist = [
    ...FORM_FIELDS.map((field) => ({ ...field, kind: "field", required: true })),
    ...UPLOAD_SPECS.map((spec) => ({
      id: `upload-${spec.id}`,
      label: `${spec.label} — ${spec.pixels}, ${spec.sizeKb}`,
      group: "Uploads",
      kind: "upload",
      required: true,
    })),
    ...documents.map((doc) => ({ ...doc, group: "Documents", kind: "document" })),
  ];

  return {
    ...ageCheck,
    documents,
    checklist,
    uploads: UPLOAD_SPECS,
    fields: FORM_FIELDS,
    declarationText: DECLARATION_TEXT,
    uploadFormat: UPLOAD_FORMAT,
  };
}

/**
 * Progress against the required items only.
 *
 * @param {Array<{id:string,required:boolean}>} items
 * @param {Array<string>} doneIds
 * @returns {{done:number,total:number,percent:number,missing:Array,ready:boolean}}
 */
export function computeChecklistProgress(items, doneIds) {
  const list = Array.isArray(items) ? items : [];
  const done = Array.isArray(doneIds) ? doneIds : [];
  const required = list.filter((item) => item.required !== false);
  const missing = required.filter((item) => !done.includes(item.id));
  const total = required.length;
  const held = total - missing.length;
  return {
    done: held,
    total,
    percent: total === 0 ? 0 : Math.round((held / total) * 100),
    missing,
    ready: total > 0 && missing.length === 0,
  };
}

export default buildBankExamChecklist;
