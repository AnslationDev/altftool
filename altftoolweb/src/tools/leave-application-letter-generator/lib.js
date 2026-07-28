/**
 * Leave Application Letter Generator — format rules, date maths and composition.
 *
 * The layout follows the conventional Indian formal application format taught in
 * schools and used in most offices: receiver's block, date, subject line,
 * salutation, body, complimentary close, signature block. The subject line is
 * mandatory in this format and is what a clerk files the letter under.
 *
 * Salutation and close pair by convention:
 *   - A student writing to a Principal uses "Respected Sir/Madam" and closes
 *     "Yours obediently" (or "Yours faithfully" in a college).
 *   - An employee writing to a named manager uses "Dear Sir/Madam" and closes
 *     "Yours sincerely" when the recipient is named, "Yours faithfully" when not.
 *
 * Pure module: no React, no DOM, no Date.now(). All dates arrive as ISO strings.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Longest leave span the generator will format in one letter. */
export const MAX_LEAVE_DAYS = 365;

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Where the letter is going, and the format conventions that follow from it. */
export const CONTEXTS = [
  {
    id: "school",
    label: "School",
    recipient: "The Principal",
    salutation: "Respected Sir/Madam",
    close: "Yours obediently",
    identityLabel: "Class and section",
    identityPlaceholder: "Class 9-B",
    note: "School applications are written by the student (or a parent for younger children) and name the class, section and roll number.",
  },
  {
    id: "college",
    label: "College or university",
    recipient: "The Head of Department",
    salutation: "Respected Sir/Madam",
    close: "Yours faithfully",
    identityLabel: "Course and year",
    identityPlaceholder: "B.Sc. Physics, 2nd year",
    note: "College applications name the course, year and enrolment number, and often mention attendance percentage where a minimum applies.",
  },
  {
    id: "office",
    label: "Office or workplace",
    recipient: "The Manager, Human Resources",
    salutation: "Dear Sir/Madam",
    close: "Yours sincerely",
    identityLabel: "Designation and employee ID",
    identityPlaceholder: "Analyst, EMP-2043",
    note: "Workplace applications state the leave type against your entitlement and name who will cover your work.",
  },
];

/** Leave types with the wording each one conventionally uses. */
export const LEAVE_TYPES = [
  { id: "sick", label: "Sick leave", contexts: ["school", "college", "office"], reason: "I am unwell and have been advised rest by the doctor", proof: "A medical certificate is attached." },
  { id: "casual", label: "Casual leave", contexts: ["office"], reason: "I need to attend to a personal matter that cannot be rescheduled", proof: "" },
  { id: "earned", label: "Earned / privilege leave", contexts: ["office"], reason: "I wish to avail earned leave from my accrued balance", proof: "" },
  { id: "family", label: "Family function or event", contexts: ["school", "college", "office"], reason: "a family function requires my presence out of station", proof: "" },
  { id: "emergency", label: "Family emergency", contexts: ["school", "college", "office"], reason: "an urgent family emergency requires my immediate presence", proof: "" },
  { id: "bereavement", label: "Bereavement", contexts: ["school", "college", "office"], reason: "of a bereavement in the family", proof: "" },
  { id: "exam", label: "Examination or academic work", contexts: ["college", "office"], reason: "I have to appear for a scheduled examination", proof: "The examination schedule is attached." },
  { id: "travel", label: "Out-of-station travel", contexts: ["school", "college", "office"], reason: "I have to travel out of station for a prior commitment", proof: "" },
  { id: "marriage", label: "Marriage in the family", contexts: ["school", "college", "office"], reason: "of a marriage in the family", proof: "" },
];

/** Format a YYYY-MM-DD string as "28 July 2026". Returns "" for bad input. */
export function formatLongDate(iso) {
  const parts = parseIsoDate(iso);
  if (!parts) return "";
  return `${parts.day} ${MONTH_NAMES[parts.month - 1]} ${parts.year}`;
}

function parseIsoDate(iso) {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day, stamp };
}

/**
 * Inclusive leave-day count between two ISO dates.
 * Both the first and the last day are counted, which is how leave is recorded:
 * 28 to 30 July is three days, not two.
 */
export function countLeaveDays({ from, to, excludeWeekends = false } = {}) {
  const start = parseIsoDate(from);
  const end = parseIsoDate(to);
  if (!start) return { error: "Enter a valid start date." };
  if (!end) return { error: "Enter a valid end date." };
  if (end.stamp < start.stamp) return { error: "The last day of leave cannot be before the first day." };

  const span = Math.round((end.stamp - start.stamp) / MS_PER_DAY) + 1;
  if (span > MAX_LEAVE_DAYS) {
    return { error: `This generator covers leave of up to ${MAX_LEAVE_DAYS} days.` };
  }

  let working = 0;
  let weekend = 0;
  for (let offset = 0; offset < span; offset += 1) {
    const day = new Date(start.stamp + offset * MS_PER_DAY).getUTCDay();
    if (day === 0 || day === 6) weekend += 1;
    else working += 1;
  }

  return {
    calendarDays: span,
    workingDays: working,
    weekendDays: weekend,
    countedDays: excludeWeekends ? working : span,
    singleDay: span === 1,
  };
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/**
 * Compose the letter.
 * Returns { error } when a required field is missing or the dates do not work.
 */
export function buildLeaveLetter({
  contextId = "school",
  leaveTypeId = "sick",
  applicantName = "",
  identity = "",
  rollNumber = "",
  institution = "",
  recipient = "",
  city = "",
  from = "",
  to = "",
  letterDate = "",
  excludeWeekends = false,
  customReason = "",
  handover = "",
  contactNumber = "",
  attachProof = false,
} = {}) {
  const context = CONTEXTS.find((entry) => entry.id === contextId);
  if (!context) return { error: "Choose school, college or office." };

  const leaveType = LEAVE_TYPES.find((entry) => entry.id === leaveTypeId);
  if (!leaveType) return { error: "Choose a leave type." };
  if (!leaveType.contexts.includes(context.id)) {
    return { error: `${leaveType.label} does not apply to a ${context.label.toLowerCase()} application.` };
  }

  const name = clean(applicantName);
  if (!name) return { error: "Enter the name of the person applying." };

  const org = clean(institution);
  if (!org) return { error: `Enter the name of the ${context.id === "office" ? "employer" : "institution"}.` };

  const days = countLeaveDays({ from, to, excludeWeekends });
  if (days.error) return { error: days.error };

  const dated = clean(letterDate) || from;
  const dateLine = formatLongDate(dated);
  if (!dateLine) return { error: "Enter a valid date for the letter." };

  const fromLong = formatLongDate(from);
  const toLong = formatLongDate(to);
  const period = days.singleDay ? `on ${fromLong}` : `from ${fromLong} to ${toLong}`;
  const dayPhrase = days.singleDay
    ? "one day"
    : `${days.countedDays} day${days.countedDays === 1 ? "" : "s"}`;

  const reason = clean(customReason) || leaveType.reason;
  const who = clean(recipient) || context.recipient;
  const place = clean(city);
  const identityLine = clean(identity);
  const roll = clean(rollNumber);

  const subject = `Application for ${leaveType.label.toLowerCase()} ${period}`;

  const header = [
    "To,",
    `${who},`,
    `${org},`,
    place ? `${place}` : null,
  ].filter(Boolean);

  const introBits = [`I, ${name},`];
  if (identityLine) introBits.push(`${identityLine},`);
  if (roll) introBits.push(`${context.id === "office" ? "employee number" : "roll number"} ${roll},`);
  const intro = `${introBits.join(" ")} respectfully submit that ${reason}. I am therefore unable to ${
    context.id === "office" ? "attend office" : "attend classes"
  } ${period}.`;

  const openingParagraph = [
    intro,
    `I request you to kindly grant me leave for ${dayPhrase} ${period}.`,
  ];
  const bodyLines = [];

  if (excludeWeekends && days.weekendDays > 0) {
    bodyLines.push(
      `The period includes ${days.weekendDays} non-working day${days.weekendDays === 1 ? "" : "s"}, so ${days.workingDays} working day${days.workingDays === 1 ? "" : "s"} of leave are being applied for.`,
    );
  }

  const cover = clean(handover);
  if (cover) {
    bodyLines.push(
      context.id === "office"
        ? `During my absence, ${cover} will handle my responsibilities, and I have briefed them on pending work.`
        : `I will complete the work covered during my absence with the help of ${cover}.`,
    );
  }

  const phone = clean(contactNumber);
  if (phone) bodyLines.push(`I can be reached on ${phone} if anything urgent comes up.`);

  if (attachProof && leaveType.proof) bodyLines.push(leaveType.proof);

  const closingParagraph =
    context.id === "office"
      ? "I shall resume duty immediately after the leave period. Thank you for considering this request."
      : "I shall make up for the lessons missed as soon as I return. Thank you for considering this request.";

  const paragraphs = [openingParagraph.join(" ")];
  if (bodyLines.length) paragraphs.push(bodyLines.join(" "));
  paragraphs.push(closingParagraph);

  const signatureBlock = [name];
  if (identityLine) signatureBlock.push(identityLine);
  if (roll) signatureBlock.push(`${context.id === "office" ? "Employee number" : "Roll number"}: ${roll}`);

  const letter = [
    header.join("\n"),
    "",
    `Date: ${dateLine}`,
    "",
    `Subject: ${subject}`,
    "",
    `${context.salutation},`,
    "",
    paragraphs.join("\n\n"),
    "",
    "Thanking you,",
    `${context.close},`,
    "",
    signatureBlock.join("\n"),
  ].join("\n");

  const words = letter.split(/\s+/).filter(Boolean).length;

  const checklist = [
    { item: "Receiver's designation and institution", done: Boolean(who && org) },
    { item: "Date of writing", done: Boolean(dateLine) },
    { item: "Subject line naming the leave and dates", done: true },
    { item: "Salutation matched to the recipient", done: true },
    { item: "Exact leave period with both dates", done: Boolean(fromLong && toLong) },
    { item: "Reason stated in one sentence", done: Boolean(reason) },
    { item: "Contact number while away", done: Boolean(phone) },
    { item: context.id === "office" ? "Handover named" : "Plan to cover missed work", done: Boolean(cover) },
    { item: "Complimentary close and signature block", done: true },
    { item: "Supporting document attached", done: Boolean(attachProof && leaveType.proof) },
  ];

  return {
    letter,
    subject,
    salutation: context.salutation,
    close: context.close,
    contextNote: context.note,
    days,
    wordCount: words,
    checklist,
    completedItems: checklist.filter((entry) => entry.done).length,
    totalItems: checklist.length,
  };
}
