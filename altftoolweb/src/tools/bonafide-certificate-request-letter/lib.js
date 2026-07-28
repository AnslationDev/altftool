/**
 * Bonafide certificate request letter builder.
 *
 * A bonafide certificate is a signed statement from the head of a recognised
 * educational institution confirming that a named person is currently enrolled
 * there, with the course, class/year and period of study. There is no central
 * statute that prescribes its wording; the format is set by each board,
 * university or institution, and the certificate is issued by the Principal,
 * Head of Department or Registrar on institutional letterhead.
 *
 * Where a purpose below cites an external requirement, the source is named in a
 * comment next to the entry. Everything else is drafting convention, not law.
 */

/* ------------------------------------------------------------------ dates */

const MS_PER_DAY = 86_400_000;

/** Parse a strict YYYY-MM-DD string into a UTC Date, or null. */
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

/**
 * Add whole working days (Monday-Friday) to a date. Day 0 is the date itself;
 * the count advances only on Mon-Fri. Public holidays are not modelled because
 * they differ by state and institution.
 */
export function addWorkingDaysISO(isoDate, workingDays) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(workingDays) || workingDays < 0) return null;
  const target = Math.round(workingDays);
  let cursor = date.getTime();
  let added = 0;
  // Guard: never loop past ten years of calendar days.
  let guard = 0;
  while (added < target && guard < 3660) {
    cursor += MS_PER_DAY;
    const weekday = new Date(cursor).getUTCDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
    guard += 1;
  }
  return toISO(new Date(cursor));
}

/** Count Mon-Fri days strictly after `fromISO` up to and including `toISODate`. */
export function workingDaysBetweenISO(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to) return null;
  if (to.getTime() <= from.getTime()) return 0;
  let count = 0;
  let cursor = from.getTime();
  while (cursor < to.getTime()) {
    cursor += MS_PER_DAY;
    const weekday = new Date(cursor).getUTCDay();
    if (weekday !== 0 && weekday !== 6) count += 1;
  }
  return count;
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

/* --------------------------------------------------------------- purposes */

/**
 * Typical office turnaround for a counter-signed certificate. This is an
 * institutional service norm, not a statutory deadline — most colleges publish
 * 2 to 7 working days in their student handbook.
 */
export const DEFAULT_PROCESSING_WORKING_DAYS = 3;
export const MIN_PROCESSING_WORKING_DAYS = 0;
export const MAX_PROCESSING_WORKING_DAYS = 60;

/** A certificate older than this is usually rejected as stale by verifiers. */
export const TYPICAL_VALIDITY_DAYS = 180;

export const BONAFIDE_PURPOSES = [
  {
    id: "passport",
    label: "Passport application",
    line: "for submission to the Regional Passport Office along with my passport application",
    // Passport Seva's document advisor lists a bona fide certificate from a
    // recognised educational institution among the documents a student may
    // submit; confirm the current list on the Passport Seva portal.
    note: "Ask for the certificate to carry your date of birth and residential address exactly as in the application.",
  },
  {
    id: "bank",
    label: "Opening a student bank account",
    line: "for opening a student savings account with my bank",
    note: "Banks accept it as a supporting document under their KYC officer's discretion, alongside an officially valid document.",
  },
  {
    id: "scholarship",
    label: "Scholarship application",
    line: "for my scholarship application, which requires proof of current enrolment",
    // National Scholarship Portal and most state portals require the
    // institution to verify enrolment before an application moves forward.
    note: "Most scholarship portals also need the institute verification done online, so mention your application ID.",
  },
  {
    id: "visa",
    label: "Student or visitor visa",
    line: "for submission to the consulate with my visa application",
    note: "Consulates usually want the certificate to state the course, current year and expected completion date.",
  },
  {
    id: "bus-pass",
    label: "Bus or rail concession pass",
    line: "for obtaining a student concession pass from the transport authority",
    note: "Concession forms normally have to be countersigned and stamped by the institution as well.",
  },
  {
    id: "hostel",
    label: "Hostel or rental accommodation",
    line: "for submission to the hostel administration / prospective landlord as proof of my student status",
    note: "Ask for the certificate to include the course duration so it covers the whole tenancy.",
  },
  {
    id: "competition",
    label: "Sports, cultural or competitive event",
    line: "for participating in an inter-institution event where proof of enrolment is required at registration",
    note: "Event organisers usually want the certificate dated within the current academic year.",
  },
  {
    id: "income-tax",
    label: "Income tax / education loan",
    line: "for submission to my bank in support of an education loan application",
    note: "Lenders normally ask for the fee structure and admission letter with it.",
  },
  {
    id: "internship",
    label: "Internship or industrial training",
    line: "for submission to the organisation offering me an internship",
    note: "Some employers want the certificate to name the department head as a point of contact.",
  },
  {
    id: "other",
    label: "Other purpose",
    line: "for the purpose stated below",
    note: "State the purpose plainly — offices reject vague requests.",
  },
];

export function purposeById(id) {
  return BONAFIDE_PURPOSES.find((item) => item.id === id) || BONAFIDE_PURPOSES[BONAFIDE_PURPOSES.length - 1];
}

/* ------------------------------------------------------------- lead time */

export const URGENCY = {
  LATE: "late",
  TIGHT: "tight",
  COMFORTABLE: "comfortable",
};

/** Buffer at or below this many calendar days is called "tight". */
export const TIGHT_BUFFER_DAYS = 3;

/**
 * Work out when the certificate can realistically be collected and whether the
 * deadline can be met. Pure: all dates come in as arguments.
 */
export function assessLeadTime({ requestDateISO, neededByISO, processingWorkingDays }) {
  if (!parseISODate(requestDateISO)) return { error: "Enter a valid date for the letter." };
  if (!parseISODate(neededByISO)) return { error: "Enter a valid date by which you need the certificate." };
  const days = Number(processingWorkingDays);
  if (!Number.isFinite(days) || days < MIN_PROCESSING_WORKING_DAYS || days > MAX_PROCESSING_WORKING_DAYS) {
    return {
      error: `Processing time must be between ${MIN_PROCESSING_WORKING_DAYS} and ${MAX_PROCESSING_WORKING_DAYS} working days.`,
    };
  }

  const calendarDays = daysBetweenISO(requestDateISO, neededByISO);
  if (calendarDays < 0) {
    return { error: "The date you need the certificate by is before the date of the letter." };
  }

  const readyByISO = addWorkingDaysISO(requestDateISO, Math.round(days));
  const bufferDays = daysBetweenISO(readyByISO, neededByISO);
  const workingDaysAvailable = workingDaysBetweenISO(requestDateISO, neededByISO);

  let urgency = URGENCY.COMFORTABLE;
  if (bufferDays < 0) urgency = URGENCY.LATE;
  else if (bufferDays <= TIGHT_BUFFER_DAYS) urgency = URGENCY.TIGHT;

  return {
    readyByISO,
    calendarDays,
    workingDaysAvailable,
    bufferDays,
    processingWorkingDays: Math.round(days),
    urgency,
    // Most verifiers treat a certificate older than six months as stale.
    staleAfterISO: addDaysISO(readyByISO, TYPICAL_VALIDITY_DAYS),
  };
}

/* ---------------------------------------------------------------- letter */

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const or = (value, fallback) => clean(value) || fallback;

export const MAX_COPIES = 20;

/**
 * Compose the request letter. `lead` is the object returned by assessLeadTime.
 * Returns { error } when the lead-time check failed.
 */
export function buildBonafideLetter({
  studentName,
  rollNumber,
  courseOrClass,
  section,
  academicYear,
  institutionName,
  institutionAddress,
  addressee,
  purposeId,
  purposeDetail,
  copies,
  requestDateISO,
  neededByISO,
  parentName,
  contactPhone,
  contactEmail,
  lead,
}) {
  if (!lead || lead.error) {
    return { error: lead?.error || "Fix the dates before drafting the letter." };
  }
  const copyCount = Number(copies);
  if (!Number.isFinite(copyCount) || copyCount < 1 || copyCount > MAX_COPIES) {
    return { error: `Number of copies must be a whole number between 1 and ${MAX_COPIES}.` };
  }

  const purpose = purposeById(purposeId);
  const name = or(studentName, "[Your full name]");
  const roll = or(rollNumber, "[Roll / registration number]");
  const course = or(courseOrClass, "[Class / course and year]");
  const sec = clean(section);
  const year = or(academicYear, "[Academic year]");
  const institution = or(institutionName, "[Name of the institution]");
  const to = or(addressee, "The Principal");
  const detail = clean(purposeDetail);

  const purposeSentence =
    purpose.id === "other" && detail
      ? `I require the certificate ${detail}.`
      : `I require the certificate ${purpose.line}${detail ? ` — ${detail}` : ""}.`;

  const copyLine =
    Math.round(copyCount) === 1
      ? "I would be grateful if one signed and sealed copy could be issued."
      : `I would be grateful if ${Math.round(copyCount)} signed and sealed copies could be issued.`;

  const deadlineLine =
    lead.urgency === URGENCY.LATE
      ? `I need the certificate by ${formatLongDate(neededByISO)}. I understand the office normally takes ${lead.processingWorkingDays} working days, which would fall on ${formatLongDate(lead.readyByISO)}, so I request that this be treated as urgent.`
      : lead.urgency === URGENCY.TIGHT
        ? `I need the certificate by ${formatLongDate(neededByISO)}, which leaves only ${lead.bufferDays} day(s) after the usual ${lead.processingWorkingDays}-working-day turnaround. I would be grateful for your help in meeting the date.`
        : `I need the certificate by ${formatLongDate(neededByISO)} and am submitting this request ${lead.calendarDays} days in advance so that it can be processed in the usual course.`;

  const subject = `Request for a bonafide certificate — ${name}, ${course}${sec ? `, Section ${sec}` : ""} (Roll No. ${roll})`;

  const body = [
    formatLongDate(requestDateISO),
    "",
    "To,",
    `${to},`,
    institution,
    clean(institutionAddress),
    "",
    `Subject: ${subject}`,
    "",
    "Respected Sir / Madam,",
    "",
    `I am ${name}, a student of ${course}${sec ? `, Section ${sec}` : ""}, bearing Roll No. ${roll}, currently enrolled at ${institution} for the academic year ${year}.`,
    "",
    purposeSentence,
    "",
    deadlineLine,
    "",
    copyLine +
      " Kindly ensure the certificate carries my full name, roll number, course and the period of study, and is issued on the institution's letterhead with the office seal.",
    "",
    clean(parentName) ? `My parent / guardian, ${clean(parentName)}, is aware of this request and can be contacted if any confirmation is needed.` : "",
    "",
    "I have enclosed a copy of my identity card and the fee receipt for the current term. Please let me know if any further document or fee is required.",
    "",
    "Thank you for your time and consideration.",
    "",
    "Yours obediently,",
    "",
    name,
    `${course}${sec ? `, Section ${sec}` : ""} · Roll No. ${roll}`,
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
    purposeNote: purpose.note,
    copies: Math.round(copyCount),
  };
}
