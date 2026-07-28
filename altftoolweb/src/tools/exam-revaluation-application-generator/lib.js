/**
 * Exam rechecking / re-evaluation application builder.
 *
 * Pure module: totals marks, projects the corrected percentage, totals the
 * prescribed fee, checks the application window, and renders the application.
 * No React, no DOM, no clock reads.
 */

/**
 * Boards that follow the CBSE model run the post-result process in a fixed
 * ORDER: a candidate may apply for a photocopy of the answer book only after
 * verification of marks, and for re-evaluation only after obtaining the
 * photocopy. Applying out of order gets the request rejected outright.
 */
export const STAGES = [
  {
    key: "verification",
    order: 1,
    label: "Verification of marks",
    unitLabel: "subject",
    description:
      "The board re-adds the marks, checks that every answer was evaluated and that marks were carried over correctly to the award list. Answers are not re-assessed and marks are not changed on merit.",
    prerequisite: "",
  },
  {
    key: "photocopy",
    order: 2,
    label: "Photocopy of the evaluated answer book",
    unitLabel: "answer book",
    description:
      "A scanned or photocopied image of the evaluated answer book is supplied so the candidate can see how each question was marked.",
    prerequisite: "Verification of marks must already have been applied for and completed.",
  },
  {
    key: "reevaluation",
    order: 3,
    label: "Re-evaluation of specific questions",
    unitLabel: "question",
    description:
      "Named questions are re-assessed by an examiner. The revised marks are final and can go up, stay the same, or in some boards come down.",
    prerequisite: "The photocopy of the answer book must already have been obtained.",
  },
];

/**
 * Post-result windows are short and are not extended. Boards commonly allow
 * three to seven days from the declaration of the result for the first stage,
 * so five is used as a starting point — replace it with the exact figure from
 * your board's circular for that year.
 */
export const DEFAULT_WINDOW_DAYS = 5;

/**
 * Fees are revised by each board every year and differ between Class 10 and
 * Class 12, so they are entered by the user rather than hard-coded. These are
 * only starting values for the input boxes.
 */
export const DEFAULT_FEE_PER_UNIT = {
  verification: 500,
  photocopy: 700,
  reevaluation: 100,
};

/** Grounds a candidate can cite in the application. */
export const GROUNDS = [
  "The marks awarded are far below my performance in the school pre-board and practice examinations",
  "The total on the marksheet does not appear to match the marks awarded question by question",
  "One or more answers appear to have been left unevaluated",
  "Marks for an internal or practical component do not appear to have been added",
  "My marks are sharply out of line with those of the rest of the class in the same subject",
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

/** Whole calendar days between two ISO dates (negative when the second is earlier). */
export function daysBetween(fromIso, toIsoDate) {
  const a = toUtcMs(fromIso);
  const b = toUtcMs(toIsoDate);
  if (a === null || b === null) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

/** yyyy-mm-dd -> "13 May 2026". */
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
 * Total the marksheet and project the result if the disputed subjects are
 * corrected to the expected marks.
 *
 * @param {Array<{name?: string, maxMarks: number|string, obtained: number|string, expected?: number|string, disputed?: boolean}>} subjects
 * @returns {object|{error: string}}
 */
export function summariseMarks(subjects = []) {
  if (!Array.isArray(subjects)) return { error: "Subjects must be a list." };

  const rows = [];
  for (const entry of subjects) {
    const name = clean(entry?.name);
    const maxRaw = String(entry?.maxMarks ?? "").trim();
    const gotRaw = String(entry?.obtained ?? "").trim();
    if (name === "" && maxRaw === "" && gotRaw === "") continue;

    const max = Number(maxRaw);
    const obtained = Number(gotRaw);
    if (!Number.isFinite(max) || !Number.isFinite(obtained)) {
      return { error: "Enter numbers for maximum and obtained marks in every subject." };
    }
    if (max <= 0) return { error: "Maximum marks must be greater than zero." };
    if (obtained < 0) return { error: "Obtained marks cannot be negative." };
    if (obtained > max) return { error: `Obtained marks cannot exceed the maximum of ${max}.` };

    const disputed = Boolean(entry?.disputed);
    const expRaw = String(entry?.expected ?? "").trim();
    let expected = obtained;
    if (disputed && expRaw !== "") {
      expected = Number(expRaw);
      if (!Number.isFinite(expected)) return { error: "Expected marks must be a number." };
      if (expected < 0 || expected > max) {
        return { error: `Expected marks must be between 0 and ${max}.` };
      }
    }

    rows.push({
      name: name || "Subject",
      max,
      obtained,
      disputed,
      expected,
      gain: round2(expected - obtained),
    });
  }

  if (rows.length === 0) return { error: "Add at least one subject with marks." };

  const totalMax = rows.reduce((sum, row) => sum + row.max, 0);
  const totalObtained = rows.reduce((sum, row) => sum + row.obtained, 0);
  const projectedTotal = rows.reduce((sum, row) => sum + row.expected, 0);

  const percentage = round2((totalObtained / totalMax) * 100);
  const projectedPercentage = round2((projectedTotal / totalMax) * 100);

  return {
    rows,
    totalMax,
    totalObtained,
    projectedTotal,
    percentage,
    projectedPercentage,
    gainMarks: round2(projectedTotal - totalObtained),
    gainPercentagePoints: round2(projectedPercentage - percentage),
    disputedCount: rows.filter((row) => row.disputed).length,
  };
}

/**
 * Fee total and window check for the chosen stage.
 *
 * @returns {object|{error: string}}
 */
export function computeApplicationPlan({
  stageKey = "verification",
  units = 1,
  feePerUnit = null,
  resultDate,
  applyDate,
  windowDays = DEFAULT_WINDOW_DAYS,
} = {}) {
  const stage = STAGES.find((item) => item.key === stageKey);
  if (!stage) return { error: "Pick which post-result stage you are applying for." };

  const count = Math.round(Number(units));
  if (!Number.isFinite(count) || count < 1 || count > 50) {
    return { error: `Enter between 1 and 50 ${stage.unitLabel}s.` };
  }

  const fee = Number(
    String(feePerUnit === null || feePerUnit === "" ? DEFAULT_FEE_PER_UNIT[stage.key] : feePerUnit)
      .replace(/,/g, "")
      .trim(),
  );
  if (!Number.isFinite(fee) || fee < 0) {
    return { error: "Fee per unit must be zero or a positive amount." };
  }

  if (toUtcMs(resultDate) === null) {
    return { error: "Enter the result declaration date in yyyy-mm-dd format." };
  }
  if (toUtcMs(applyDate) === null) {
    return { error: "Enter the date you are applying in yyyy-mm-dd format." };
  }

  const window = Math.round(Number(windowDays));
  if (!Number.isFinite(window) || window < 1 || window > 120) {
    return { error: "The application window should be between 1 and 120 days." };
  }

  const lastDate = addDays(resultDate, window);
  const daysLeft = daysBetween(applyDate, lastDate);
  const sinceResult = daysBetween(resultDate, applyDate);

  let status = "open";
  if (sinceResult < 0) status = "early";
  else if (daysLeft < 0) status = "closed";
  else if (daysLeft <= 1) status = "urgent";

  return {
    stage,
    units: count,
    feePerUnit: round2(fee),
    totalFee: round2(fee * count),
    resultDate: clean(resultDate),
    applyDate: clean(applyDate),
    windowDays: window,
    lastDate,
    daysLeft,
    status,
    message:
      status === "early"
        ? "The application date is before the result was declared — check the dates."
        : status === "closed"
          ? `The window closed on ${formatLongDate(lastDate)}, ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} ago. Boards rarely extend it; write to the regional office explaining the delay.`
          : status === "urgent"
            ? `Only ${daysLeft} day${daysLeft === 1 ? "" : "s"} left — apply on the board portal today and pay the fee online.`
            : `${daysLeft} days left before the window closes on ${formatLongDate(lastDate)}.`,
  };
}

/**
 * Build the application letter.
 *
 * @returns {{letter: string, plan: object, marks: object}|{error: string}}
 */
export function buildRevaluationApplication({
  candidateName,
  rollNumber = "",
  className = "",
  schoolName = "",
  boardName,
  address = "",
  phone = "",
  email = "",
  stageKey = "verification",
  subjects = [],
  questionNumbers = "",
  feePerUnit = null,
  resultDate,
  applyDate,
  windowDays = DEFAULT_WINDOW_DAYS,
  grounds = GROUNDS.slice(0, 2),
  paymentReference = "",
} = {}) {
  const name = clean(candidateName);
  const board = clean(boardName);
  if (!name) return { error: "Enter the candidate's full name." };
  if (!board) return { error: "Enter the board or university name." };

  const marks = summariseMarks(subjects);
  if (marks.error) return { error: marks.error };

  const disputed = marks.rows.filter((row) => row.disputed);
  if (disputed.length === 0) {
    return { error: "Tick at least one subject as disputed — that is what you are applying about." };
  }

  const stage = STAGES.find((item) => item.key === stageKey);
  if (!stage) return { error: "Pick which post-result stage you are applying for." };

  const units = stage.key === "reevaluation"
    ? Math.max(
        1,
        clean(questionNumbers)
          .split(/[,\s]+/)
          .filter(Boolean).length,
      )
    : disputed.length;

  const plan = computeApplicationPlan({
    stageKey,
    units,
    feePerUnit,
    resultDate,
    applyDate,
    windowDays,
  });
  if (plan.error) return { error: plan.error };

  const groundList = (Array.isArray(grounds) ? grounds : []).map(clean).filter(Boolean);
  const finalGrounds = groundList.length > 0 ? groundList : GROUNDS.slice(0, 2);

  const idBits = [
    rollNumber && `Roll no.: ${clean(rollNumber)}`,
    className && `Class / course: ${clean(className)}`,
    schoolName && `School / college: ${clean(schoolName)}`,
  ].filter(Boolean);

  const letter = [
    name,
    clean(address),
    [phone && `Phone: ${clean(phone)}`, email && `Email: ${clean(email)}`]
      .filter(Boolean)
      .join(" | "),
    "",
    `Date: ${formatLongDate(plan.applyDate)}`,
    "",
    "To,",
    "The Controller of Examinations",
    board,
    "",
    `Subject: Application for ${stage.label.toLowerCase()} — ${disputed.map((row) => row.name).join(", ")}`,
    "",
    "Sir / Madam,",
    "",
    `I appeared in the examination conducted by your board and my result was declared on ${formatLongDate(plan.resultDate)}. My particulars are:`,
    ...(idBits.length ? idBits.map((line) => `  ${line}`) : ["  (particulars as per the admit card)"]),
    "",
    "The marks awarded in the subject(s) I am applying about are:",
    ...disputed.map(
      (row, index) =>
        `${index + 1}. ${row.name} — ${row.obtained} out of ${row.max}${
          row.expected !== row.obtained ? ` (expected around ${row.expected})` : ""
        }`,
    ),
    ...(stage.key === "reevaluation" && clean(questionNumbers)
      ? ["", `Question numbers for which re-evaluation is sought: ${clean(questionNumbers)}.`]
      : []),
    "",
    "I am applying on the following grounds:",
    ...finalGrounds.map((item, index) => `${index + 1}. ${item}.`),
    "",
    `My aggregate at present is ${marks.totalObtained} out of ${marks.totalMax} (${marks.percentage}%). If the marks in the disputed subject(s) are corrected as expected, the aggregate would be ${marks.projectedTotal} out of ${marks.totalMax} (${marks.projectedPercentage}%), a difference of ${marks.gainMarks} marks. This materially affects my admission prospects, which is why I am applying rather than letting the result stand.`,
    "",
    `I am applying for ${plan.units} ${stage.unitLabel}${plan.units === 1 ? "" : "s"} and have paid the prescribed fee of ${money(plan.totalFee)} at ${money(plan.feePerUnit)} per ${stage.unitLabel}${paymentReference ? `, transaction reference ${clean(paymentReference)}` : ""}.`,
    ...(stage.prerequisite ? ["", `I confirm that ${stage.prerequisite.charAt(0).toLowerCase()}${stage.prerequisite.slice(1)}`] : []),
    "",
    `The application is being submitted within the window notified by the board, which closes on ${formatLongDate(plan.lastDate)}. I request that the outcome be communicated to me in writing along with the corrected marksheet, if any change results.`,
    "",
    "Thanking you,",
    "",
    "Yours faithfully,",
    "",
    name,
    ...(rollNumber ? [`Roll no. ${clean(rollNumber)}`] : []),
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");

  return { letter, plan, marks };
}
