/**
 * School transfer certificate (TC) request builder for Indian schools.
 *
 * Pure module: totals the dues to be cleared, works out the expected issue and
 * follow-up dates, derives the academic session, and renders the request letter.
 * No React, no DOM, no clock reads.
 */

/**
 * Right of Children to Free and Compulsory Education Act, 2009, section 5(2):
 * where a child moves to another school, the head teacher of the school the
 * child is leaving shall IMMEDIATELY issue the transfer certificate.
 * Section 5(3) makes a head teacher who delays it liable to disciplinary action,
 * and says delay in producing the TC cannot be a ground for denying admission.
 */
export const RTE_SECTION_FOR_TC = "Section 5(2) and 5(3), RTE Act, 2009";

/** Working days most school offices quote for preparing a TC. Editable by the user. */
export const DEFAULT_PROCESSING_DAYS = 7;

/** Days to wait after the promised date before sending a reminder or escalating. */
export const DEFAULT_REMINDER_DAYS = 7;

/**
 * The Indian school academic session normally begins in April, so a date in
 * January to March still belongs to the session that started the previous April.
 */
export const SESSION_START_MONTH = 4;

export const TC_REASONS = [
  "Parent transferred to another city on the job",
  "Family relocating to a new address",
  "Shifting to a school closer to home",
  "Change of board (state board, CBSE, CISCE or international)",
  "Completed the highest class offered by this school",
  "Moving abroad with the family",
  "Medical reasons requiring a change of school",
  "Financial reasons",
];

export const DEFAULT_DUE_ITEMS = [
  "Tuition fee for the current term",
  "Transport or bus fee",
  "Library fine",
  "Laboratory or activity fee",
  "Cost of unreturned books or uniform items",
];

export const ENCLOSURES = [
  "Copy of the student's latest fee receipt",
  "Copy of the student's identity card",
  "Copy of the last report card",
  "Copy of the parent's transfer or posting order",
  "Admission letter or confirmation from the new school",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86400000;
const WEEKEND = new Set([0, 6]); // Sunday, Saturday

const clean = (value) => String(value ?? "").trim();
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
/** Ensure a sentence fragment ends with a full stop so joined text reads correctly. */
const endWithStop = (text) => (text && !/[.!?]$/.test(text) ? `${text}.` : text);

/** ISO yyyy-mm-dd -> UTC milliseconds, or null when the string is not a real date. */
export function toUtcMs(iso) {
  const text = clean(iso);
  if (!ISO_DATE.test(text)) return null;
  const [y, m, d] = text.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const ms = Date.UTC(y, m - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) {
    return null;
  }
  return ms;
}

const toIso = (ms) => new Date(ms).toISOString().slice(0, 10);

/** Add whole calendar days to an ISO date. */
export function addDays(iso, days) {
  const ms = toUtcMs(iso);
  if (ms === null || !Number.isFinite(Number(days))) return null;
  return toIso(ms + Math.round(Number(days)) * MS_PER_DAY);
}

/** Add working days (Monday to Saturday are school days; Sundays are skipped). */
export function addSchoolDays(iso, days) {
  const start = toUtcMs(iso);
  const count = Math.round(Number(days));
  if (start === null || !Number.isFinite(count) || count < 0 || count > 365) return null;
  let cursor = start;
  let counted = 0;
  while (counted < count) {
    cursor += MS_PER_DAY;
    if (new Date(cursor).getUTCDay() === 0) continue; // Sunday
    counted += 1;
  }
  return toIso(cursor);
}

/** yyyy-mm-dd -> "05 January 2026". */
export function formatLongDate(iso) {
  const ms = toUtcMs(iso);
  if (ms === null) return "";
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const d = new Date(ms);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Academic session label for a date, e.g. "2025-26" for 20 January 2026. */
export function academicSession(iso) {
  const ms = toUtcMs(iso);
  if (ms === null) return "";
  const d = new Date(ms);
  const startYear = d.getUTCMonth() + 1 >= SESSION_START_MONTH ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

const money = (value) =>
  `INR ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * Total the dues that must be cleared before the TC is released.
 *
 * @param {Array<{label?: string, amount: number|string}>} dues
 * @returns {{rows: Array, total: number}|{error: string}}
 */
export function summariseDues(dues = []) {
  if (!Array.isArray(dues)) return { error: "Dues must be a list." };
  const rows = [];
  for (const entry of dues) {
    const raw = String(entry?.amount ?? "").replace(/,/g, "").trim();
    if (raw === "") continue;
    const amount = Number(raw);
    if (!Number.isFinite(amount)) return { error: "Every due amount must be a number." };
    if (amount < 0) return { error: "Due amounts cannot be negative." };
    if (amount === 0) continue;
    rows.push({ label: clean(entry?.label) || "Pending amount", amount: round2(amount) });
  }
  return { rows, total: round2(rows.reduce((sum, row) => sum + row.amount, 0)) };
}

/**
 * Expected issue date and reminder date for the TC.
 *
 * @returns {object|{error: string}}
 */
export function computeTcTimeline({
  requestDate,
  processingDays = DEFAULT_PROCESSING_DAYS,
  reminderDays = DEFAULT_REMINDER_DAYS,
  lastAttendedDate = "",
} = {}) {
  if (toUtcMs(requestDate) === null) {
    return { error: "Enter a valid request date in yyyy-mm-dd format." };
  }

  const processing = Math.round(Number(processingDays));
  if (!Number.isFinite(processing) || processing < 0 || processing > 90) {
    return { error: "Processing time should be between 0 and 90 school days." };
  }

  const reminder = Math.round(Number(reminderDays));
  if (!Number.isFinite(reminder) || reminder < 0 || reminder > 90) {
    return { error: "Reminder gap should be between 0 and 90 days." };
  }

  const last = clean(lastAttendedDate);
  if (last && toUtcMs(last) === null) {
    return { error: "Enter a valid last-attended date in yyyy-mm-dd format." };
  }
  if (last && toUtcMs(last) > toUtcMs(requestDate)) {
    return { error: "The last attended date cannot be after the request date." };
  }

  const expectedIssueDate = addSchoolDays(requestDate, processing);
  const reminderDate = addDays(expectedIssueDate, reminder);

  return {
    requestDate: clean(requestDate),
    processingDays: processing,
    reminderDays: reminder,
    expectedIssueDate,
    reminderDate,
    session: academicSession(requestDate),
    lastAttendedDate: last,
  };
}

/**
 * Build the transfer certificate request letter.
 *
 * @returns {{letter: string, timeline: object, dues: object}|{error: string}}
 */
export function buildTcRequest({
  studentName,
  admissionNumber = "",
  className = "",
  section = "",
  rollNumber = "",
  parentName,
  address = "",
  phone = "",
  email = "",
  schoolName,
  principalTitle = "The Principal",
  requestDate,
  lastAttendedDate = "",
  processingDays = DEFAULT_PROCESSING_DAYS,
  reminderDays = DEFAULT_REMINDER_DAYS,
  reason = TC_REASONS[0],
  reasonDetail = "",
  newSchoolName = "",
  newCity = "",
  dues = [],
  enclosures = ENCLOSURES.slice(0, 3),
  requestConductCertificate = true,
  requestBonafide = false,
  citeRte = false,
} = {}) {
  const student = clean(studentName);
  const parent = clean(parentName);
  const school = clean(schoolName);

  if (!student) return { error: "Enter the student's full name." };
  if (!parent) return { error: "Enter the parent or guardian's name." };
  if (!school) return { error: "Enter the current school's name." };

  const timeline = computeTcTimeline({
    requestDate,
    processingDays,
    reminderDays,
    lastAttendedDate,
  });
  if (timeline.error) return { error: timeline.error };

  const duesResult = summariseDues(dues);
  if (duesResult.error) return { error: duesResult.error };

  const classBits = [
    className && `Class ${clean(className)}`,
    section && `Section ${clean(section)}`,
    rollNumber && `Roll no. ${clean(rollNumber)}`,
    admissionNumber && `Admission no. ${clean(admissionNumber)}`,
  ]
    .filter(Boolean)
    .join(", ");

  const destination = [clean(newSchoolName), clean(newCity)].filter(Boolean).join(", ");

  const duesLine =
    duesResult.total > 0
      ? `I understand that ${money(duesResult.total)} is outstanding against the student's account (${duesResult.rows
          .map((row) => `${row.label}: ${money(row.amount)}`)
          .join("; ")}). I am settling this amount along with this application and request a receipt.`
      : "All fees and library dues against the student have been cleared, and I enclose the latest receipt for your record.";

  const extraAsks = [
    requestConductCertificate && "a character or conduct certificate",
    requestBonafide && "a bonafide certificate for the current session",
  ].filter(Boolean);

  const encl = (Array.isArray(enclosures) ? enclosures : []).map(clean).filter(Boolean);

  const letter = [
    parent,
    clean(address),
    [phone && `Phone: ${clean(phone)}`, email && `Email: ${clean(email)}`]
      .filter(Boolean)
      .join(" | "),
    "",
    `Date: ${formatLongDate(timeline.requestDate)}`,
    "",
    "To,",
    clean(principalTitle) || "The Principal",
    school,
    "",
    `Subject: Request for transfer certificate for ${student}${classBits ? `, ${classBits}` : ""}`,
    "",
    "Respected Sir / Madam,",
    "",
    `I am the parent / guardian of ${student}${classBits ? `, ${classBits}` : ""}, studying in your school during the academic session ${timeline.session}.`,
    "",
    `${endWithStop(clean(reasonDetail) || clean(reason) || TC_REASONS[0])}${destination ? ` The student will be joining ${destination}.` : ""}${
      timeline.lastAttendedDate
        ? ` The last day the student attended school was ${formatLongDate(timeline.lastAttendedDate)}.`
        : ""
    }`,
    "",
    duesLine,
    "",
    `I therefore request you to kindly issue the transfer certificate${
      extraAsks.length ? ` along with ${extraAsks.join(" and ")}` : ""
    } at the earliest. The new school needs the certificate to complete admission formalities, and I would be grateful if it could be made available by ${formatLongDate(timeline.expectedIssueDate)}.`,
    "",
    `Please ensure the certificate carries the correct spelling of the student's name and date of birth exactly as recorded in the school register, along with the school and board details, as any mismatch causes problems at the time of board registration.`,
    ...(citeRte
      ? [
          "",
          `I would also point out that under ${RTE_SECTION_FOR_TC}, the head teacher of the school a child is leaving is required to issue the transfer certificate immediately, and delay in producing it cannot be a ground for denying the child admission elsewhere.`,
        ]
      : []),
    ...(encl.length ? ["", "Enclosures:", ...encl.map((item, index) => `${index + 1}. ${item}`)] : []),
    "",
    "Thanking you,",
    "",
    "Yours faithfully,",
    "",
    parent,
    `Parent / Guardian of ${student}`,
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");

  return { letter, timeline, dues: duesResult };
}
