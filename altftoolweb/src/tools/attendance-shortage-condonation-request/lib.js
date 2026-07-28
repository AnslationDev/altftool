/**
 * Attendance shortage condonation request builder.
 *
 * Pure module: computes the attendance percentage, the shortfall in classes,
 * how many more classes would be needed to clear the bar, and drafts the
 * condonation application. No React, no DOM, no clock reads.
 */

/**
 * 75% of working days or classes conducted is the standard eligibility bar in
 * Indian school boards and universities. CBSE Examination Bye-laws require 75%
 * attendance to be admitted to the Class 10 and Class 12 examinations, and most
 * university ordinances use the same figure for a semester.
 */
export const STANDARD_REQUIRED_PERCENT = 75;

/**
 * Where condonation is provided for, institutions commonly allow it down to a
 * second, lower floor - often 65% - and only on documented grounds. Below that
 * floor the request is normally refused outright, so the tool warns about it.
 */
export const COMMON_CONDONATION_FLOOR_PERCENT = 65;

/** Grounds institutions actually accept, each paired with the proof expected. */
export const GROUNDS = [
  {
    key: "illness",
    label: "Prolonged illness or hospitalisation",
    evidence: [
      "Doctor's certificate stating the diagnosis and the exact period of rest advised",
      "Hospital discharge summary or admission record",
      "Prescriptions, test reports and pharmacy bills for the same period",
    ],
  },
  {
    key: "surgery",
    label: "Surgery and post-operative recovery",
    evidence: [
      "Operation notes and discharge summary from the hospital",
      "Fitness-to-resume certificate from the treating surgeon",
    ],
  },
  {
    key: "bereavement",
    label: "Death or serious illness in the immediate family",
    evidence: [
      "Death certificate or hospital record of the family member",
      "Proof of relationship, such as a ration card or Aadhaar with the same address",
    ],
  },
  {
    key: "sport",
    label: "Representing the institution, state or country in sport or NCC/NSS",
    evidence: [
      "Selection or participation certificate from the recognised federation",
      "Letter from the sports or NCC/NSS officer of the institution confirming the dates",
    ],
  },
  {
    key: "competition",
    label: "Official academic or cultural representation approved by the institution",
    evidence: [
      "Approval letter or duty leave order issued before the event",
      "Certificate of participation with dates",
    ],
  },
  {
    key: "maternity",
    label: "Maternity or child-care leave",
    evidence: [
      "Medical certificate covering the pre- and post-natal period",
      "Birth certificate of the child, where available",
    ],
  },
  {
    key: "hardship",
    label: "Documented family emergency or financial hardship",
    evidence: [
      "Written explanation countersigned by the parent or guardian",
      "Any supporting document - FIR, employer letter, hospital bill or affidavit",
    ],
  },
];

/** Commitments that make a condonation request credible to a committee. */
export const CATCH_UP_ACTIONS = [
  "Attend every remaining class, tutorial and laboratory session without exception",
  "Complete all missed assignments and internal assessments by an agreed date",
  "Attend extra or remedial classes arranged by the department",
  "Submit a weekly attendance report countersigned by the class teacher or mentor",
  "Meet the faculty mentor fortnightly to review progress",
];

const clean = (value) => String(value ?? "").trim();
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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

/**
 * Attendance arithmetic.
 *
 * percentage      = attended / conducted x 100
 * shortfallClasses = ceil(required% x conducted) - attended, floored at 0
 * classesNeeded   = smallest x with (attended + x) / (conducted + x) >= p,
 *                   i.e. x >= (p x conducted - attended) / (1 - p)
 * canMiss         = whole classes you can still miss out of the remaining ones
 *                   and finish on or above the bar
 *
 * @returns {object|{error: string}}
 */
export function computeAttendance({
  conducted,
  attended,
  requiredPercent = STANDARD_REQUIRED_PERCENT,
  remainingClasses = 0,
  condonationFloorPercent = COMMON_CONDONATION_FLOOR_PERCENT,
} = {}) {
  const total = Number(String(conducted ?? "").trim());
  const present = Number(String(attended ?? "").trim());
  const required = Number(String(requiredPercent ?? "").trim());
  const remaining = Number(String(remainingClasses ?? 0).trim() || 0);
  const floor = Number(String(condonationFloorPercent ?? "").trim());

  if (!Number.isFinite(total) || !Number.isFinite(present)) {
    return { error: "Enter numbers for classes conducted and classes attended." };
  }
  if (total <= 0) return { error: "Classes conducted must be greater than zero." };
  if (present < 0) return { error: "Classes attended cannot be negative." };
  if (present > total) return { error: "Classes attended cannot exceed classes conducted." };
  if (!Number.isFinite(required) || required <= 0 || required > 100) {
    return { error: "The required attendance should be between 1% and 100%." };
  }
  if (!Number.isFinite(remaining) || remaining < 0 || remaining > 2000) {
    return { error: "Remaining classes should be between 0 and 2000." };
  }
  if (!Number.isFinite(floor) || floor <= 0 || floor > 100) {
    return { error: "The condonation floor should be between 1% and 100%." };
  }

  const p = required / 100;
  const percentage = round2((present / total) * 100);

  const minimumRequiredNow = Math.ceil(p * total);
  const shortfallClasses = Math.max(0, minimumRequiredNow - present);

  // Smallest whole number of additional attended classes that clears the bar.
  let classesNeeded;
  if (percentage >= required) {
    classesNeeded = 0;
  } else if (p >= 1) {
    classesNeeded = null; // 100% required and a class has already been missed
  } else {
    classesNeeded = Math.max(0, Math.ceil((p * total - present) / (1 - p)));
  }

  const finalAttended = present + remaining;
  const finalTotal = total + remaining;
  const achievablePercent = round2((finalAttended / finalTotal) * 100);
  const slack = finalAttended - p * finalTotal;
  const canMiss = slack >= 0 ? Math.floor(slack) : 0;

  const canReach =
    classesNeeded !== null && classesNeeded <= remaining && classesNeeded !== undefined;

  let status = "clear";
  if (percentage < floor) status = "critical";
  else if (percentage < required) status = "short";

  return {
    conducted: total,
    attended: present,
    requiredPercent: required,
    condonationFloorPercent: floor,
    remainingClasses: remaining,
    percentage,
    minimumRequiredNow,
    shortfallClasses,
    classesNeeded,
    achievablePercent,
    canReach,
    canMiss,
    status,
    message:
      status === "clear"
        ? `You are at ${percentage}%, already above the ${required}% bar. You could still miss up to ${canMiss} of the ${remaining} remaining classes and stay eligible.`
        : status === "short"
          ? classesNeeded === null
            ? `${required}% attendance cannot be recovered once a class has been missed.`
            : canReach
              ? `You are ${shortfallClasses} class${shortfallClasses === 1 ? "" : "es"} short. Attending the next ${classesNeeded} of the ${remaining} remaining classes takes you back to ${required}%.`
              : `You are ${shortfallClasses} class${shortfallClasses === 1 ? "" : "es"} short and only ${remaining} classes remain, so the best you can reach is ${achievablePercent}%. A condonation request is the realistic route.`
          : `At ${percentage}% you are below the ${floor}% floor most institutions apply to condonation itself. Attach strong documentary proof and expect the request to go to a committee or the head of the institution.`,
  };
}

/**
 * Build the condonation application.
 *
 * @returns {{letter: string, attendance: object, evidence: string[]}|{error: string}}
 */
export function buildCondonationRequest({
  studentName,
  rollNumber = "",
  programme = "",
  semesterOrClass = "",
  department = "",
  institutionName,
  addresseeTitle = "The Principal",
  address = "",
  phone = "",
  email = "",
  letterDate,
  absenceFrom = "",
  absenceTo = "",
  groundKey = "illness",
  groundDetail = "",
  conducted,
  attended,
  requiredPercent = STANDARD_REQUIRED_PERCENT,
  remainingClasses = 0,
  condonationFloorPercent = COMMON_CONDONATION_FLOOR_PERCENT,
  catchUpActions = CATCH_UP_ACTIONS.slice(0, 3),
  parentEndorsement = true,
} = {}) {
  const name = clean(studentName);
  const institution = clean(institutionName);
  if (!name) return { error: "Enter the student's full name." };
  if (!institution) return { error: "Enter the school, college or university name." };
  if (toUtcMs(letterDate) === null) {
    return { error: "Enter a valid application date in yyyy-mm-dd format." };
  }

  const ground = GROUNDS.find((item) => item.key === groundKey);
  if (!ground) return { error: "Pick the ground for the shortage." };

  if (absenceFrom && toUtcMs(absenceFrom) === null) {
    return { error: "Enter a valid absence start date in yyyy-mm-dd format." };
  }
  if (absenceTo && toUtcMs(absenceTo) === null) {
    return { error: "Enter a valid absence end date in yyyy-mm-dd format." };
  }
  if (absenceFrom && absenceTo && toUtcMs(absenceTo) < toUtcMs(absenceFrom)) {
    return { error: "The absence end date cannot be before the start date." };
  }

  const attendance = computeAttendance({
    conducted,
    attended,
    requiredPercent,
    remainingClasses,
    condonationFloorPercent,
  });
  if (attendance.error) return { error: attendance.error };

  if (attendance.status === "clear") {
    return {
      error: `Your attendance is ${attendance.percentage}%, already at or above the ${attendance.requiredPercent}% requirement — no condonation is needed.`,
    };
  }

  const actions = (Array.isArray(catchUpActions) ? catchUpActions : []).map(clean).filter(Boolean);
  const finalActions = actions.length > 0 ? actions : CATCH_UP_ACTIONS.slice(0, 3);

  const idBits = [
    rollNumber && `Roll / register no.: ${clean(rollNumber)}`,
    programme && `Programme: ${clean(programme)}`,
    semesterOrClass && `Semester / class: ${clean(semesterOrClass)}`,
    department && `Department: ${clean(department)}`,
  ].filter(Boolean);

  const period =
    absenceFrom && absenceTo
      ? `from ${formatLongDate(absenceFrom)} to ${formatLongDate(absenceTo)}`
      : absenceFrom
        ? `from ${formatLongDate(absenceFrom)}`
        : "during the period covered by the enclosed documents";

  const letter = [
    name,
    clean(address),
    [phone && `Phone: ${clean(phone)}`, email && `Email: ${clean(email)}`]
      .filter(Boolean)
      .join(" | "),
    "",
    `Date: ${formatLongDate(letterDate)}`,
    "",
    "To,",
    clean(addresseeTitle) || "The Principal",
    institution,
    "",
    `Subject: Request for condonation of attendance shortage — ${attendance.percentage}% against the required ${attendance.requiredPercent}%`,
    "",
    "Respected Sir / Madam,",
    "",
    "I write to request condonation of a shortage in my attendance. My particulars are:",
    ...(idBits.length ? idBits.map((line) => `  ${line}`) : ["  (particulars as per the institution register)"]),
    "",
    `Classes conducted: ${attendance.conducted}`,
    `Classes attended: ${attendance.attended}`,
    `Attendance: ${attendance.percentage}% against the required ${attendance.requiredPercent}%`,
    `Shortfall: ${attendance.shortfallClasses} class${attendance.shortfallClasses === 1 ? "" : "es"}`,
    "",
    `The shortage arose because of ${ground.label.toLowerCase()}, ${period}.${clean(groundDetail) ? ` ${clean(groundDetail)}` : ""} This was not a matter of choice, and I remained in contact with my teachers to keep up with the syllabus as far as I could.`,
    "",
    "In support I enclose:",
    ...ground.evidence.map((item, index) => `${index + 1}. ${item}`),
    "",
    attendance.canReach && attendance.remainingClasses > 0
      ? `${attendance.remainingClasses} classes remain in this term. If I attend the next ${attendance.classesNeeded} of them my attendance returns to ${attendance.requiredPercent}%, and I undertake to do so.`
      : attendance.remainingClasses > 0
        ? `Even attending every one of the ${attendance.remainingClasses} classes still to be held would bring me only to ${attendance.achievablePercent}%, which is why I am asking for condonation rather than relying on making the shortfall up.`
        : "No further classes remain in this term, which is why I am asking for condonation.",
    "",
    "I undertake to:",
    ...finalActions.map((item, index) => `${index + 1}. ${item}.`),
    "",
    `I request you to kindly condone the shortfall and permit me to appear in the forthcoming examination. Being declared ineligible would cost me an entire ${semesterOrClass ? "term" : "year"}, which is a heavy consequence for an absence I could not avoid.`,
    ...(parentEndorsement
      ? [
          "",
          "My parent / guardian is aware of this application and has countersigned it below.",
        ]
      : []),
    "",
    "Thanking you,",
    "",
    "Yours faithfully,",
    "",
    name,
    ...(rollNumber ? [`Roll / register no. ${clean(rollNumber)}`] : []),
    ...(parentEndorsement ? ["", "Countersigned:", "", "Parent / Guardian"] : []),
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");

  return { letter, attendance, evidence: ground.evidence, ground };
}
