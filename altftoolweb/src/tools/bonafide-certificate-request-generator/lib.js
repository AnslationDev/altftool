/**
 * Bonafide certificate request builder for Indian schools and colleges.
 *
 * A bonafide certificate is a signed statement from an institution confirming
 * that a named person is currently enrolled there. Different authorities want
 * different facts printed on it, and most want a recently issued copy — this
 * module encodes both, plus the fee and date arithmetic.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/**
 * Most authorities accept a bonafide certificate issued within the last three
 * months. Visa posts and banks commonly ask for one no older than 90 days.
 */
export const DEFAULT_FRESHNESS_DAYS = 90;

/** School and college offices typically quote two to five working days. */
export const DEFAULT_PROCESSING_DAYS = 3;

/**
 * Purposes a bonafide certificate is asked for, with the facts the issuing
 * institution has to print for that authority to accept it.
 */
export const PURPOSES = [
  {
    key: "passport",
    label: "Passport application",
    freshnessDays: 90,
    mustState: [
      "Full name of the student exactly as in the birth certificate",
      "Father's and mother's name",
      "Date of birth in words and figures",
      "Current class or course and the residential address on record",
    ],
    note: "The passport office matches every field against the application form, so a single spelling difference means a fresh certificate.",
  },
  {
    key: "visa",
    label: "Student or dependant visa application",
    freshnessDays: 90,
    mustState: [
      "Course name, duration and current year or semester",
      "Date of admission and expected date of completion",
      "Medium of instruction",
      "Confirmation that the student is in regular, full-time attendance",
    ],
    note: "Ask for the certificate on institution letterhead in English, signed with the seal, and keep the signatory's designation legible.",
  },
  {
    key: "loan",
    label: "Education loan from a bank",
    freshnessDays: 90,
    mustState: [
      "Course name, duration and year of study",
      "Total course fee and the fee structure year by year",
      "Confirmation of admission with the admission or roll number",
      "Hostel or accommodation details, if the loan covers them",
    ],
    note: "Banks usually want the fee structure on the same letterhead or as an annexure signed by the same authority.",
  },
  {
    key: "scholarship",
    label: "Scholarship or fee reimbursement",
    freshnessDays: 180,
    mustState: [
      "Course, year of study and category of admission",
      "Fees paid for the current academic year with receipt numbers",
      "Attendance percentage for the current session",
      "Confirmation that the student is not receiving another scholarship, if asked",
    ],
    note: "National and state scholarship portals ask for the institute's DISE, AISHE or NSP institution code — request it on the certificate.",
  },
  {
    key: "concession",
    label: "Bus or rail travel concession",
    freshnessDays: 180,
    mustState: [
      "Class or course and the academic session",
      "Residential address and the distance from the institution",
      "Confirmation that the student travels daily between the two points",
    ],
    note: "Transport undertakings issue passes against the certificate plus a photograph, so carry spare passport photos.",
  },
  {
    key: "address",
    label: "Address or identity proof",
    freshnessDays: 90,
    mustState: [
      "Residential address as recorded in the institution's register",
      "Period for which the student has been enrolled",
      "Photograph of the student attested by the issuing authority",
    ],
    note: "A certificate carrying an attested photograph is accepted far more widely than a plain text one.",
  },
  {
    key: "internship",
    label: "Internship, training or project work",
    freshnessDays: 90,
    mustState: [
      "Course, branch and current semester",
      "Confirmation that the internship forms part of the curriculum",
      "Name and contact of the faculty mentor",
    ],
    note: "Many companies also want the college to confirm the internship dates, so include the intended start and end dates in your request.",
  },
  {
    key: "employment",
    label: "Employment or enrolment verification",
    freshnessDays: 90,
    mustState: [
      "Dates of enrolment and the expected completion date",
      "Current status - regular, part-time or distance mode",
      "Roll or enrolment number for verification",
    ],
    note: "Background verification agencies verify by calling the institution, so ask for an official phone number and email on the certificate.",
  },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86400000;

const clean = (value) => String(value ?? "").trim();
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

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
  const n = Number(days);
  if (ms === null || !Number.isFinite(n)) return null;
  return toIso(ms + Math.round(n) * MS_PER_DAY);
}

/** Whole calendar days from one ISO date to another (negative when earlier). */
export function daysBetween(fromIso, toIsoDate) {
  const a = toUtcMs(fromIso);
  const b = toUtcMs(toIsoDate);
  if (a === null || b === null) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

/** Add working days, skipping Saturdays and Sundays. */
export function addWorkingDays(iso, days) {
  const start = toUtcMs(iso);
  const count = Math.round(Number(days));
  if (start === null || !Number.isFinite(count) || count < 0 || count > 365) return null;
  let cursor = start;
  let counted = 0;
  while (counted < count) {
    cursor += MS_PER_DAY;
    const day = new Date(cursor).getUTCDay();
    if (day === 0 || day === 6) continue;
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

const money = (value) =>
  `INR ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * Fee, issue date and freshness planning for the certificate.
 *
 * @returns {object|{error: string}}
 */
export function planBonafideRequest({
  purposeKey = "passport",
  requestDate,
  processingDays = DEFAULT_PROCESSING_DAYS,
  copies = 1,
  feePerCopy = 0,
  submitByDate = "",
  freshnessDays = null,
} = {}) {
  const purpose = PURPOSES.find((item) => item.key === purposeKey);
  if (!purpose) return { error: "Pick what the certificate is needed for." };

  if (toUtcMs(requestDate) === null) {
    return { error: "Enter a valid request date in yyyy-mm-dd format." };
  }

  const processing = Math.round(Number(processingDays));
  if (!Number.isFinite(processing) || processing < 0 || processing > 60) {
    return { error: "Processing time should be between 0 and 60 working days." };
  }

  const copyCount = Math.round(Number(copies));
  if (!Number.isFinite(copyCount) || copyCount < 1 || copyCount > 50) {
    return { error: "Ask for between 1 and 50 copies." };
  }

  const perCopy = Number(String(feePerCopy ?? 0).replace(/,/g, "").trim() || 0);
  if (!Number.isFinite(perCopy) || perCopy < 0) {
    return { error: "Fee per copy must be zero or a positive amount." };
  }

  const freshness = Math.round(
    Number(freshnessDays === null || freshnessDays === "" ? purpose.freshnessDays : freshnessDays),
  );
  if (!Number.isFinite(freshness) || freshness < 1 || freshness > 1825) {
    return { error: "Freshness window should be between 1 and 1825 days." };
  }

  const expectedIssueDate = addWorkingDays(requestDate, processing);
  const validUntil = addDays(expectedIssueDate, freshness);

  const submitBy = clean(submitByDate);
  let freshnessCheck = null;
  if (submitBy) {
    if (toUtcMs(submitBy) === null) {
      return { error: "Enter a valid submission deadline in yyyy-mm-dd format." };
    }
    const earliestIssueDate = addDays(submitBy, -freshness);
    const bufferDays = daysBetween(expectedIssueDate, submitBy);
    const tooOld = daysBetween(earliestIssueDate, expectedIssueDate) < 0;
    freshnessCheck = {
      submitBy,
      earliestIssueDate,
      bufferDays,
      status: bufferDays < 0 ? "late" : tooOld ? "stale" : "ok",
      message:
        bufferDays < 0
          ? `The certificate would only be ready ${Math.abs(bufferDays)} day${Math.abs(bufferDays) === 1 ? "" : "s"} after your deadline. Apply earlier or ask the office to expedite it.`
          : tooOld
            ? `Issued on ${formatLongDate(expectedIssueDate)} it would be older than ${freshness} days by the submission date. Apply again no earlier than ${formatLongDate(earliestIssueDate)}.`
            : `Ready ${bufferDays} day${bufferDays === 1 ? "" : "s"} before the deadline and still inside the ${freshness}-day freshness window.`,
    };
  }

  return {
    purpose,
    requestDate: clean(requestDate),
    processingDays: processing,
    expectedIssueDate,
    freshnessDays: freshness,
    validUntil,
    copies: copyCount,
    feePerCopy: round2(perCopy),
    totalFee: round2(perCopy * copyCount),
    freshnessCheck,
  };
}

/**
 * Build the bonafide certificate request letter.
 *
 * @returns {{letter: string, plan: object}|{error: string}}
 */
export function buildBonafideRequest({
  studentName,
  parentName = "",
  courseOrClass = "",
  section = "",
  rollNumber = "",
  admissionNumber = "",
  academicYear = "",
  institutionName,
  addresseeTitle = "The Principal",
  address = "",
  phone = "",
  email = "",
  purposeKey = "passport",
  purposeDetail = "",
  submittingTo = "",
  requestDate,
  processingDays = DEFAULT_PROCESSING_DAYS,
  copies = 1,
  feePerCopy = 0,
  submitByDate = "",
  freshnessDays = null,
  wantLetterhead = true,
  wantPhotoAttested = false,
} = {}) {
  const student = clean(studentName);
  const institution = clean(institutionName);
  if (!student) return { error: "Enter the student's full name." };
  if (!institution) return { error: "Enter the school or college name." };

  const plan = planBonafideRequest({
    purposeKey,
    requestDate,
    processingDays,
    copies,
    feePerCopy,
    submitByDate,
    freshnessDays,
  });
  if (plan.error) return { error: plan.error };

  const idBits = [
    courseOrClass && `Class / course: ${clean(courseOrClass)}`,
    section && `Section: ${clean(section)}`,
    rollNumber && `Roll no.: ${clean(rollNumber)}`,
    admissionNumber && `Admission no.: ${clean(admissionNumber)}`,
    academicYear && `Academic year: ${clean(academicYear)}`,
  ].filter(Boolean);

  const formatAsks = [
    wantLetterhead && "printed on institution letterhead with the official seal and signature",
    wantPhotoAttested && "carrying my attested photograph",
  ].filter(Boolean);

  const letter = [
    student,
    clean(address),
    [phone && `Phone: ${clean(phone)}`, email && `Email: ${clean(email)}`]
      .filter(Boolean)
      .join(" | "),
    "",
    `Date: ${formatLongDate(plan.requestDate)}`,
    "",
    "To,",
    clean(addresseeTitle) || "The Principal",
    institution,
    "",
    `Subject: Request for a bonafide certificate for ${plan.purpose.label.toLowerCase()}`,
    "",
    "Respected Sir / Madam,",
    "",
    `I am a bonafide student of this institution. My particulars are as follows:`,
    ...(idBits.length ? idBits.map((line) => `  ${line}`) : ["  (particulars as per the institution register)"]),
    ...(parentName ? [`  Father's / Mother's name: ${clean(parentName)}`] : []),
    "",
    `I require a bonafide certificate for ${plan.purpose.label.toLowerCase()}${
      submittingTo ? `, to be submitted to ${clean(submittingTo)}` : ""
    }.${clean(purposeDetail) ? ` ${clean(purposeDetail)}` : ""}`,
    "",
    "For the certificate to be accepted, I request that it state:",
    ...plan.purpose.mustState.map((item, index) => `${index + 1}. ${item}`),
    "",
    formatAsks.length
      ? `Kindly issue the certificate ${formatAsks.join(" and ")}.`
      : "Kindly issue the certificate in the institution's standard format.",
    `I need ${plan.copies} cop${plan.copies === 1 ? "y" : "ies"}${
      plan.totalFee > 0 ? `, and I am paying the prescribed fee of ${money(plan.totalFee)} (${money(plan.feePerCopy)} per copy)` : ""
    }.`,
    ...(plan.freshnessCheck
      ? [
          "",
          `The certificate has to be submitted by ${formatLongDate(plan.freshnessCheck.submitBy)}, and the receiving authority accepts a certificate issued within the last ${plan.freshnessDays} days, so I would be grateful to receive it by ${formatLongDate(plan.expectedIssueDate)}.`,
        ]
      : [
          "",
          `I would be grateful to receive it by ${formatLongDate(plan.expectedIssueDate)}.`,
        ]),
    "",
    "Thanking you,",
    "",
    "Yours faithfully,",
    "",
    student,
    ...(clean(courseOrClass) ? [clean(courseOrClass)] : []),
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");

  return { letter, plan };
}
