/**
 * Transfer certificate (TC) request letter builder.
 *
 * Statutory rules referenced (India):
 *  - Right of Children to Free and Compulsory Education Act, 2009 (RTE), s.3(1):
 *    every child of the age of six to fourteen years has the right to free and
 *    compulsory education in a neighbourhood school till completion of
 *    elementary education.
 *  - RTE Act, 2009, s.2(f): "elementary education" means education from the
 *    first class to the eighth class.
 *  - RTE Act, 2009, s.5(2): a child is entitled to seek transfer to any other
 *    school, for completing elementary education.
 *  - RTE Act, 2009, s.5(3): the head teacher or in-charge of the school where
 *    the child was last admitted shall immediately issue the transfer
 *    certificate. A delay in producing the TC shall not be a ground for
 *    delaying or denying admission in another school, and an official who
 *    delays issuing it is liable to disciplinary action under the service rules
 *    applicable to them.
 *  - RTE Act, 2009, s.13(1): no school or person shall, while admitting a child,
 *    collect any capitation fee or subject the child or parents to any
 *    screening procedure.
 *
 * Above class VIII, and for colleges, no central statute fixes a deadline; the
 * board, university or state education department rules apply instead, and a
 * migration certificate is usually needed alongside the TC for a board or
 * university change.
 */

/* ------------------------------------------------------------------ dates */

const MS_PER_DAY = 86_400_000;

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

const toISO = (date) => date.toISOString().slice(0, 10);

export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(days)) return null;
  return toISO(new Date(date.getTime() + Math.round(days) * MS_PER_DAY));
}

export function daysBetweenISO(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function formatLongDate(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Exact completed years, months and days between two dates. */
export function ageBreakdown(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to || to.getTime() < from.getTime()) return null;

  let years = to.getUTCFullYear() - from.getUTCFullYear();
  let months = to.getUTCMonth() - from.getUTCMonth();
  let days = to.getUTCDate() - from.getUTCDate();

  if (days < 0) {
    months -= 1;
    // Days in the month preceding the "to" date.
    const daysInPrevMonth = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 0)).getUTCDate();
    days += daysInPrevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days, totalDays: Math.round((to.getTime() - from.getTime()) / MS_PER_DAY) };
}

/* ------------------------------------------------------------ RTE limits */

/** RTE Act, 2009, s.3(1) — lower age of the right to free education. */
export const RTE_MIN_AGE_YEARS = 6;
/** RTE Act, 2009, s.3(1) — the right runs up to fourteen years of age. */
export const RTE_MAX_AGE_YEARS = 14;
/** RTE Act, 2009, s.2(f) — elementary education is class I to class VIII. */
export const RTE_ELEMENTARY_MIN_CLASS = 1;
export const RTE_ELEMENTARY_MAX_CLASS = 8;
/** Highest school class handled by this builder. */
export const MAX_SCHOOL_CLASS = 12;

/* ------------------------------------------------------------- reasons */

export const TRANSFER_REASONS = [
  {
    id: "relocation",
    label: "Family is relocating to another city",
    line: "our family is relocating to {place}, which makes it impossible for {pronounObject} to continue attending this school",
    needsPlace: true,
  },
  {
    id: "job-transfer",
    label: "Parent's job transfer",
    line: "I have been transferred to {place} by my employer and the family is moving with me",
    needsPlace: true,
  },
  {
    id: "distance",
    label: "School is too far from the new residence",
    line: "we have shifted residence to {place} and the daily commute has become unmanageable for {pronounObject}",
    needsPlace: true,
  },
  {
    id: "financial",
    label: "Financial reasons",
    line: "a change in our family's financial circumstances means we are unable to continue at this school",
    needsPlace: false,
  },
  {
    id: "medical",
    label: "Medical reasons",
    line: "on medical advice {pronounSubject} needs to study closer to home and to the treating hospital",
    needsPlace: false,
  },
  {
    id: "board-change",
    label: "Changing to a different board or stream",
    line: "{pronounSubject} is moving to a school offering a different board and stream better suited to {pronounPossessive} plans",
    needsPlace: false,
  },
  {
    id: "completed",
    label: "Completed the highest class offered here",
    line: "{pronounSubject} has completed the highest class offered at this school and must continue elsewhere",
    needsPlace: false,
  },
  {
    id: "higher-studies",
    label: "Joining a college or higher course",
    line: "{pronounSubject} has secured admission for further studies and needs the transfer certificate to complete the joining formalities",
    needsPlace: false,
  },
  {
    id: "other",
    label: "Other reason",
    line: "of the reason stated below",
    needsPlace: false,
  },
];

export function reasonById(id) {
  return TRANSFER_REASONS.find((item) => item.id === id) || TRANSFER_REASONS[TRANSFER_REASONS.length - 1];
}

export const PRONOUN_SETS = {
  son: { subject: "he", object: "him", possessive: "his", relation: "son" },
  daughter: { subject: "she", object: "her", possessive: "her", relation: "daughter" },
  ward: { subject: "they", object: "them", possessive: "their", relation: "ward" },
  self: { subject: "I", object: "me", possessive: "my", relation: "self" },
};

/* ---------------------------------------------------------- assessment */

/** Drafting convention: send a written reminder if there is no response in a week. */
export const RTE_FOLLOW_UP_DAYS = 7;

/**
 * Work out the child's age on the letter date, whether the RTE immediate-issue
 * rule applies, and how many days remain before the TC is needed.
 * Pure: every date is supplied by the caller.
 */
export function assessTransfer({ dobISO, letterDateISO, neededByISO, classNumber }) {
  if (!parseISODate(letterDateISO)) return { error: "Enter a valid date for the letter." };
  if (!parseISODate(dobISO)) return { error: "Enter a valid date of birth." };
  if (!parseISODate(neededByISO)) return { error: "Enter a valid date by which the TC is needed." };

  const age = ageBreakdown(dobISO, letterDateISO);
  if (!age) return { error: "The date of birth is after the date of the letter." };
  if (age.years > 120) return { error: "Check the date of birth — that age is not realistic." };

  const cls = Number(classNumber);
  if (!Number.isFinite(cls) || cls < RTE_ELEMENTARY_MIN_CLASS || cls > MAX_SCHOOL_CLASS) {
    return { error: `Class must be a number between ${RTE_ELEMENTARY_MIN_CLASS} and ${MAX_SCHOOL_CLASS}.` };
  }

  const daysUntilNeeded = daysBetweenISO(letterDateISO, neededByISO);
  if (daysUntilNeeded < 0) {
    return { error: "The date the TC is needed by is before the date of the letter." };
  }

  const inElementary = cls >= RTE_ELEMENTARY_MIN_CLASS && cls <= RTE_ELEMENTARY_MAX_CLASS;
  const inRteAge = age.years >= RTE_MIN_AGE_YEARS && age.years < RTE_MAX_AGE_YEARS;
  const rteApplies = inElementary && inRteAge;

  // RTE s.5(3) says "immediately", so there is no waiting period to compute for
  // a covered child. Outside RTE the school's own service norm applies.
  const escalation = rteApplies ? "Block Education Officer / District Education Officer" : "the board or university and the state education department";

  return {
    age,
    ageText: `${age.years} years, ${age.months} months`,
    classNumber: Math.round(cls),
    inElementary,
    inRteAge,
    rteApplies,
    daysUntilNeeded,
    escalation,
    // A reasonable follow-up point if nothing arrives; convention, not statute.
    followUpISO: addDaysISO(letterDateISO, RTE_FOLLOW_UP_DAYS),
  };
}

/* ---------------------------------------------------------------- letter */

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const or = (value, fallback) => clean(value) || fallback;

export function buildTcRequestLetter({
  studentName,
  admissionNumber,
  classNumber,
  section,
  academicYear,
  schoolName,
  schoolAddress,
  addressee,
  relationKey,
  reasonId,
  newPlace,
  newSchoolName,
  reasonDetail,
  lastAttendanceISO,
  letterDateISO,
  neededByISO,
  parentName,
  contactPhone,
  contactEmail,
  duesCleared,
  assessment,
}) {
  if (!assessment || assessment.error) {
    return { error: assessment?.error || "Fix the details before drafting the letter." };
  }

  const pron = PRONOUN_SETS[relationKey] || PRONOUN_SETS.ward;
  const isSelf = pron.relation === "self";
  const name = or(studentName, "[Student's full name]");
  const admission = or(admissionNumber, "[Admission number]");
  const section_ = clean(section);
  const school = or(schoolName, "[Name of the school]");
  const to = or(addressee, "The Principal");
  const year = or(academicYear, "[Academic year]");
  const reason = reasonById(reasonId);
  const place = or(newPlace, "[new city]");

  const reasonText = (reason.id === "other" && clean(reasonDetail)
    ? clean(reasonDetail)
    : reason.line
        .replace("{place}", place)
        .replace("{pronounSubject}", isSelf ? "I" : pron.subject)
        .replace("{pronounObject}", isSelf ? "me" : pron.object)
        .replace("{pronounPossessive}", isSelf ? "my" : pron.possessive));

  const opening = isSelf
    ? `I am ${name}, a student of Class ${assessment.classNumber}${section_ ? `-${section_}` : ""} of this institution, bearing Admission No. ${admission}, enrolled for the academic year ${year}.`
    : `I am the parent / guardian of ${name}, a student of Class ${assessment.classNumber}${section_ ? `-${section_}` : ""} of your school, bearing Admission No. ${admission}, enrolled for the academic year ${year}.`;

  const requestLine = isSelf
    ? `I therefore request you to issue my transfer certificate, along with my character certificate and mark statements, so that I can complete admission formalities at my new institution.`
    : `I therefore request you to issue ${pron.possessive} transfer certificate, along with the character certificate and the record of marks, so that ${pron.subject} can complete admission formalities at ${clean(newSchoolName) || "the new school"}.`;

  const rteLines = assessment.rteApplies
    ? [
        `${isSelf ? "I am" : `${name} is`} ${assessment.ageText} old and studying in Class ${assessment.classNumber}, which falls within elementary education as defined in section 2(f) of the Right of Children to Free and Compulsory Education Act, 2009.`,
        "Under section 5(2) of that Act a child is entitled to seek transfer to another school for completing elementary education, and section 5(3) requires the head teacher or in-charge of the school last attended to issue the transfer certificate immediately. The same provision states that a delay in producing the transfer certificate cannot be a ground for delaying or denying admission at the new school.",
      ]
    : [
        `${isSelf ? "I am" : `${name} is`} ${assessment.ageText} old and studying in Class ${assessment.classNumber}. I request that the certificate be issued in accordance with the school's own rules and the applicable board regulations.`,
      ];

  const duesLine = duesCleared
    ? "All fees and dues up to the current term have been paid, and library books, identity card and other school property have been returned. Copies of the fee receipts are enclosed."
    : "Please let me know the exact amount outstanding, if any, so that it can be cleared before the certificate is issued. I am ready to settle all dues and return any school property immediately.";

  const deadlineLine = `The new institution has asked for the certificate by ${formatLongDate(neededByISO)}, which is ${assessment.daysUntilNeeded} day(s) from the date of this letter.`;

  const subject = `Request for transfer certificate — ${name}, Class ${assessment.classNumber}${section_ ? `-${section_}` : ""} (Admission No. ${admission})`;

  const body = [
    formatLongDate(letterDateISO),
    "",
    "To,",
    `${to},`,
    school,
    clean(schoolAddress),
    "",
    `Subject: ${subject}`,
    "",
    "Respected Sir / Madam,",
    "",
    opening,
    "",
    `I am writing to inform you that ${reasonText}.`,
    clean(lastAttendanceISO) && parseISODate(lastAttendanceISO)
      ? `${isSelf ? "My" : `${name}'s`} last day of attendance ${daysBetweenISO(lastAttendanceISO, letterDateISO) >= 0 ? "was" : "will be"} ${formatLongDate(lastAttendanceISO)}.`
      : "",
    "",
    requestLine,
    "",
    ...rteLines,
    "",
    deadlineLine,
    "",
    duesLine,
    "",
    clean(reasonDetail) && reason.id !== "other" ? clean(reasonDetail) : "",
    "",
    `${isSelf ? "I" : "We"} are grateful to the school for the years ${isSelf ? "I have" : `${name} has`} spent here and for the care shown by the teachers.`,
    "",
    "Kindly let me know when I may collect the certificate, and whether any form has to be signed in person.",
    "",
    "Thanking you,",
    "",
    "Yours faithfully,",
    "",
    isSelf ? name : or(parentName, "[Parent / guardian name]"),
    isSelf ? `Class ${assessment.classNumber}${section_ ? `-${section_}` : ""} · Admission No. ${admission}` : `Parent / guardian of ${name}, Class ${assessment.classNumber}${section_ ? `-${section_}` : ""}`,
    clean(contactPhone) ? `Phone: ${clean(contactPhone)}` : "Phone: [your phone number]",
    clean(contactEmail) ? `Email: ${clean(contactEmail)}` : "Email: [your email address]",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    subject,
    body,
    wordCount: body.split(/\s+/).filter(Boolean).length,
    rteApplies: assessment.rteApplies,
  };
}
