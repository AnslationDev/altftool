/**
 * Gap year affidavit generator — pure logic.
 *
 * A gap affidavit (often called a gap certificate) is a sworn declaration,
 * executed on non-judicial stamp paper and attested by a notary or oath
 * commissioner, in which a student states the period of, and reason for, a
 * break in formal education. This module assembles the standard clauses and
 * computes the gap period. It is a drafting aid, not legal advice.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Stamp duty on an affidavit is fixed by each state's Schedule to the Indian
 * Stamp Act (or the state's own Stamp Act), so there is no single national
 * figure. In practice colleges ask for non-judicial stamp paper somewhere in
 * this range; always confirm the value your institution and state require.
 */
export const TYPICAL_STAMP_PAPER_RANGE_INR = { min: 10, max: 100 };

/**
 * Many Indian universities scrutinise longer breaks more closely and ask for
 * documentary proof (medical records, employment letters) alongside the
 * affidavit once the gap passes roughly two academic years.
 */
export const EXTRA_PROOF_GAP_MONTHS = 24;

/** Relationship prefixes used in the standard opening line of an affidavit. */
export const RELATIONS = [
  { id: "son", label: "Son of", text: "S/o" },
  { id: "daughter", label: "Daughter of", text: "D/o" },
  { id: "ward", label: "Ward of", text: "W/o" },
];

/** Common, verifiable reasons for a break in studies. */
export const GAP_REASONS = [
  {
    id: "medical",
    label: "Illness or medical treatment",
    text: "I was undergoing medical treatment and was advised rest, which made it impossible for me to attend a regular course of study",
    proof: "Medical certificate, discharge summary or prescriptions covering the period",
  },
  {
    id: "family",
    label: "Family responsibility or bereavement",
    text: "I had to attend to pressing family responsibilities following a bereavement in the family",
    proof: "No document is usually needed, but keep any supporting record you have",
  },
  {
    id: "caregiving",
    label: "Caring for an unwell family member",
    text: "I was the primary caregiver for an unwell member of my family and could not attend a regular course of study",
    proof: "Medical records of the family member being cared for",
  },
  {
    id: "financial",
    label: "Financial constraints",
    text: "my family was not in a financial position to meet the cost of my education during that period",
    proof: "Income certificate, if your institution asks for one",
  },
  {
    id: "competitive",
    label: "Preparing for a competitive examination",
    text: "I was preparing full time for a competitive entrance examination and was not enrolled in any regular course",
    proof: "Coaching enrolment receipt or examination admit cards and result",
  },
  {
    id: "employment",
    label: "Working or family business",
    text: "I was in employment and supporting my family, and was therefore not enrolled in any regular course of study",
    proof: "Appointment letter, experience certificate or salary slips",
  },
  {
    id: "improvement",
    label: "Improvement or repeat attempt",
    text: "I was preparing to reappear in the examination in order to improve my result",
    proof: "Mark sheets of both attempts",
  },
  {
    id: "relocation",
    label: "Relocation or visa delay",
    text: "my family relocated and the resulting travel and documentation formalities prevented me from joining a course",
    proof: "Transfer letter, passport pages or visa correspondence",
  },
  {
    id: "other",
    label: "Other (write your own)",
    text: "",
    proof: "Any document that supports the reason you have given",
  },
];

/** Papers usually asked for alongside the affidavit at admission. */
export const SUPPORTING_DOCUMENTS = [
  "Original affidavit on non-judicial stamp paper, signed before a notary or oath commissioner",
  "Mark sheet and passing certificate of the last examination cleared",
  "School or college leaving certificate / transfer certificate",
  "Photo identity proof of the deponent",
  "Two passport-size photographs",
];

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);
const clean = (value) => (typeof value === "string" ? value.trim() : "");

/** Parse "YYYY-MM-DD" into a UTC Date, or null when it is not a real date. */
export function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(value));
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return date;
}

/** "12 August 2026". */
export function formatLongDate(value) {
  const date = value instanceof Date ? value : parseISODate(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Ordinal day used in the verification clause: "12th day of August, 2026". */
export function formatVerificationDate(value) {
  const date = parseISODate(value);
  if (!date) return "";
  const day = date.getUTCDate();
  const remainderTen = day % 10;
  const remainderHundred = day % 100;
  let suffix = "th";
  if (remainderTen === 1 && remainderHundred !== 11) suffix = "st";
  else if (remainderTen === 2 && remainderHundred !== 12) suffix = "nd";
  else if (remainderTen === 3 && remainderHundred !== 13) suffix = "rd";
  const month = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(date);
  return `${day}${suffix} day of ${month}, ${date.getUTCFullYear()}`;
}

/** Whole months and leftover days between two dates. */
export function gapBetween(start, end) {
  let months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
  if (end.getUTCDate() < start.getUTCDate()) months -= 1;
  if (months < 0) months = 0;
  const anniversary = new Date(
    Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth() + months,
      Math.min(
        start.getUTCDate(),
        new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + months + 1, 0)).getUTCDate(),
      ),
    ),
  );
  const days = Math.round((end.getTime() - anniversary.getTime()) / MS_PER_DAY);
  return { months, days: Math.max(0, days) };
}

/** "1 year 8 months" style description of the gap. */
export function formatGap(months, days) {
  const years = Math.floor(months / 12);
  const restMonths = months % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (restMonths > 0) parts.push(`${restMonths} month${restMonths === 1 ? "" : "s"}`);
  if (parts.length === 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  return parts.join(" ");
}

/**
 * Build a gap-year affidavit.
 *
 * @param {object} input
 * @param {string} input.deponentName    Student's full name.
 * @param {string} input.relation        One of the RELATIONS ids.
 * @param {string} input.parentName      Father's / mother's / guardian's name.
 * @param {number} input.age             Age in years.
 * @param {string} input.address         Full residential address.
 * @param {string} input.lastExam        Last examination passed, e.g. "Class XII".
 * @param {string} input.board           Board or university.
 * @param {string} input.passingSession  Month and year of passing, free text.
 * @param {string} input.rollNumber      Roll or enrolment number (optional).
 * @param {string} input.gapStart        Gap start date, "YYYY-MM-DD".
 * @param {string} input.gapEnd          Gap end date, "YYYY-MM-DD".
 * @param {string} input.reasonId        One of the GAP_REASONS ids.
 * @param {string} input.reasonDetail    Free-text reason, required when reasonId is "other".
 * @param {string} input.targetCourse    Course being applied for.
 * @param {string} input.targetInstitution Institution being applied to.
 * @param {string} input.place           Place of execution.
 * @param {string} input.affidavitDate   Date of execution, "YYYY-MM-DD".
 * @returns {object} affidavit, or { error } for invalid input.
 */
export function buildGapAffidavit(input) {
  const {
    deponentName,
    relation,
    parentName,
    age,
    address,
    lastExam,
    board,
    passingSession,
    rollNumber,
    gapStart,
    gapEnd,
    reasonId,
    reasonDetail,
    targetCourse,
    targetInstitution,
    place,
    affidavitDate,
  } = input || {};

  const name = clean(deponentName);
  if (!name) return { error: "Enter the student's full name — the affidavit is sworn in their name." };

  const guardian = clean(parentName);
  if (!guardian) return { error: "Enter the father's, mother's or guardian's name." };

  if (!isNumber(age)) return { error: "Enter the deponent's age as a number." };
  if (age < 10 || age > 100) return { error: "Enter an age between 10 and 100." };

  const home = clean(address);
  if (!home) return { error: "Enter the full residential address of the deponent." };

  const exam = clean(lastExam);
  if (!exam) return { error: "Enter the last examination passed, for example Class XII." };

  const start = parseISODate(gapStart);
  if (!start) return { error: "Enter the date the gap began as a real calendar date." };

  const end = parseISODate(gapEnd);
  if (!end) return { error: "Enter the date the gap ended as a real calendar date." };

  if (end.getTime() <= start.getTime()) {
    return { error: "The gap has to end after it began." };
  }

  const executed = parseISODate(affidavitDate);
  if (!executed) return { error: "Enter the date of the affidavit as a real calendar date." };

  const reason = GAP_REASONS.find((entry) => entry.id === reasonId) || GAP_REASONS[0];
  const customReason = clean(reasonDetail);
  if (reason.id === "other" && !customReason) {
    return { error: "You chose 'other', so write the reason for the gap in your own words." };
  }

  const relationEntry = RELATIONS.find((entry) => entry.id === relation) || RELATIONS[0];
  const { months, days } = gapBetween(start, end);
  const gapLabel = formatGap(months, days);
  const reasonSentence = reason.id === "other" ? customReason : reason.text;

  const course = clean(targetCourse) || "the course applied for";
  const institution = clean(targetInstitution) || "the institution concerned";
  const city = clean(place) || "____________";
  const boardName = clean(board) || "the examining board";
  const roll = clean(rollNumber);

  const warnings = [];
  if (months >= EXTRA_PROOF_GAP_MONTHS) {
    warnings.push(
      `A gap of ${gapLabel} is longer than two academic years. Most universities ask for documentary proof alongside the affidavit — for this reason, that means: ${reason.proof.toLowerCase()}.`,
    );
  }
  if (age < 18) {
    warnings.push(
      "The deponent is under 18. A minor generally cannot swear an affidavit in their own right, so it is usually executed by a parent or guardian on their behalf — check what your institution accepts.",
    );
  }
  if (executed.getTime() < end.getTime()) {
    warnings.push(
      `The affidavit is dated ${formatLongDate(executed)}, before the gap ends on ${formatLongDate(end)}. Notaries normally attest a gap that has already run its course.`,
    );
  }
  if (!clean(targetInstitution)) {
    warnings.push(
      "No institution is named. Many colleges reject a generic affidavit and want their own name in the purpose clause.",
    );
  }
  if (!roll) {
    warnings.push(
      "No roll or enrolment number is entered. Adding it ties the affidavit to your mark sheet and speeds up verification.",
    );
  }

  const clauses = [
    `That I am a resident of ${home} and am competent to swear this affidavit.`,
    `That I passed the ${exam} examination from ${boardName}${
      clean(passingSession) ? ` in ${clean(passingSession)}` : ""
    }${roll ? `, bearing roll number ${roll}` : ""}.`,
    `That after passing the said examination I remained out of regular studies from ${formatLongDate(start)} to ${formatLongDate(end)}, a period of ${gapLabel}.`,
    `That the reason for the said break in my studies is that ${reasonSentence}.`,
    "That during the said period I was not enrolled in, and did not take admission to, any school, college, university or other institution, in India or abroad.",
    "That during the said period I was not involved in any criminal or anti-social activity, and no criminal case is pending against me before any court.",
    `That I am now seeking admission to ${course} at ${institution}, and this affidavit is made for the purpose of that admission.`,
    "That the facts stated above are true to the best of my knowledge and belief, and nothing material has been concealed.",
  ];

  const opening = `I, ${name}, ${relationEntry.text} ${guardian}, aged about ${Math.round(age)} years, resident of ${home}, do hereby solemnly affirm and declare as under:`;

  const verification = `Verified at ${city} on this ${formatVerificationDate(affidavitDate)} that the contents of the above affidavit are true and correct to the best of my knowledge and belief, and that nothing material has been concealed therefrom.`;

  const affidavitText = [
    "AFFIDAVIT",
    "",
    opening,
    "",
    ...clauses.map((clause, index) => `${index + 1}. ${clause}`),
    "",
    "DEPONENT",
    "",
    "VERIFICATION",
    verification,
    "",
    "DEPONENT",
    "",
    `(${name})`,
  ].join("\n");

  const checklist = [
    ...SUPPORTING_DOCUMENTS,
    reason.proof,
  ];

  const keyFacts = [
    ["Deponent", name],
    ["Gap period", `${formatLongDate(start)} to ${formatLongDate(end)}`],
    ["Length of gap", gapLabel],
    ["Reason", reason.id === "other" ? "Stated in the affidavit" : reason.label],
    ["Last examination", `${exam}${boardName ? `, ${boardName}` : ""}`],
    ["Applying for", `${course} at ${institution}`],
    ["Executed at", city],
    ["Dated", formatLongDate(executed)],
  ];

  return {
    name,
    guardian,
    relation: relationEntry,
    age: Math.round(age),
    gapMonths: months,
    gapDays: days,
    gapLabel,
    gapStartLabel: formatLongDate(start),
    gapEndLabel: formatLongDate(end),
    reason,
    reasonSentence,
    clauses,
    opening,
    verification,
    affidavitText,
    wordCount: affidavitText.split(/\s+/).filter(Boolean).length,
    checklist,
    keyFacts,
    warnings,
    stampPaperRange: TYPICAL_STAMP_PAPER_RANGE_INR,
  };
}
