/**
 * Probation extension letter builder and probation-period arithmetic.
 *
 * Reference points encoded below (informational, not legal advice):
 *  - Industrial Employment (Standing Orders) Act, 1946, Schedule I of the Model Standing Orders,
 *    clause 2: a "probationer" is a workman provisionally employed to fill a permanent vacancy who
 *    has not completed three months of service in that post. Three months is therefore the classic
 *    statutory reference point for probation in a covered industrial establishment.
 *  - State Shops and Commercial Establishments Acts set the notice period owed to an employee once
 *    a threshold of continuous service is crossed — commonly one month after six months of service
 *    (for example section 39 of the Karnataka Shops and Commercial Establishments Act, 1961).
 *    A long probation therefore does not remove notice obligations that have already accrued.
 *  - Confirmation by conduct: where an employer lets the probation period lapse without extending
 *    or confirming in writing, employees frequently argue they were deemed confirmed. The letter
 *    must therefore be issued on or before the original probation end date.
 *
 * All date maths here is pure — the caller supplies every date as a yyyy-mm-dd string.
 */

/** Service threshold after which most state Shops Acts require notice before termination. */
export const NOTICE_THRESHOLD_MONTHS = 6;

/** Total probation beyond this is unusual and normally needs a contractual clause to support it. */
export const LONG_PROBATION_MONTHS = 12;

/** Default gap between the review meeting and the end of the extended probation. */
export const DEFAULT_REVIEW_LEAD_DAYS = 14;

export const EXTENSION_PRESETS = [1, 2, 3, 6];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MS_PER_DAY = 86400000;

function parseIso(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
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

function toIso(stamp) {
  const date = new Date(stamp);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function formatLongDate(iso) {
  const parsed = parseIso(iso);
  if (!parsed) return "";
  return `${parsed.day} ${MONTHS[parsed.month - 1]} ${parsed.year}`;
}

/** Adds whole months, clamping to the last day of the target month (31 Jan + 1 month = 28 Feb). */
export function addMonths(iso, months) {
  const parsed = parseIso(iso);
  if (!parsed || !Number.isFinite(months)) return null;
  const targetMonthIndex = parsed.month - 1 + Math.trunc(months);
  const year = parsed.year + Math.floor(targetMonthIndex / 12);
  const month = ((targetMonthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(parsed.day, lastDay);
  return toIso(Date.UTC(year, month, day));
}

export function addDays(iso, days) {
  const parsed = parseIso(iso);
  if (!parsed || !Number.isFinite(days)) return null;
  return toIso(parsed.stamp + Math.trunc(days) * MS_PER_DAY);
}

/** Calendar days between two ISO dates; negative when the second date is earlier. */
export function daysBetween(fromIso, toIsoValue) {
  const a = parseIso(fromIso);
  const b = parseIso(toIsoValue);
  if (!a || !b) return null;
  return Math.round((b.stamp - a.stamp) / MS_PER_DAY);
}

/**
 * Works out the revised probation end date, the review date and the total probation served.
 * Returns { error } for any input that cannot produce a sensible schedule.
 */
export function computeProbationExtension(input = {}) {
  const joining = String(input.joiningDate || "").trim();
  const originalEnd = String(input.originalEndDate || "").trim();
  const letterDate = String(input.letterDate || "").trim();
  const months = Number(input.extensionMonths);
  const reviewLead = Number(input.reviewLeadDays ?? DEFAULT_REVIEW_LEAD_DAYS);

  if (!parseIso(joining)) return { error: "Enter a valid joining date in yyyy-mm-dd form." };
  if (!parseIso(originalEnd)) return { error: "Enter a valid original probation end date." };
  if (!parseIso(letterDate)) return { error: "Enter a valid letter date." };
  if (!Number.isFinite(months) || months <= 0) {
    return { error: "The extension must be at least one month long." };
  }
  if (months > 12) return { error: "An extension longer than 12 months is not a probation extension — review the contract." };
  if (!Number.isFinite(reviewLead) || reviewLead < 0 || reviewLead > 90) {
    return { error: "The review lead time must be between 0 and 90 days." };
  }

  const originalSpanDays = daysBetween(joining, originalEnd);
  if (originalSpanDays === null || originalSpanDays <= 0) {
    return { error: "The original probation end date must fall after the joining date." };
  }

  const newEndDate = addMonths(originalEnd, months);
  const reviewDate = addDays(newEndDate, -Math.trunc(reviewLead));
  const totalDays = daysBetween(joining, newEndDate);
  const totalMonths = totalDays / 30.4375; // mean calendar month length (365.25 / 12)
  const daysAfterOriginalEnd = daysBetween(originalEnd, letterDate);
  const reviewGapFromLetter = daysBetween(letterDate, reviewDate);

  if (reviewGapFromLetter !== null && reviewGapFromLetter <= 0) {
    return {
      error: `With this extension length and review lead time, the review meeting would fall on ${formatLongDate(reviewDate)}, on or before the letter date of ${formatLongDate(letterDate)}. Shorten the review lead time or lengthen the extension so the review happens after this letter is issued.`,
    };
  }

  const warnings = [];
  if (daysAfterOriginalEnd > 0) {
    warnings.push(
      `The letter is dated ${daysAfterOriginalEnd} day(s) after probation already ended. An extension served late is commonly challenged as confirmation by conduct — issue it on or before the original end date.`,
    );
  }
  if (totalMonths > LONG_PROBATION_MONTHS) {
    warnings.push(
      `Total probation would reach about ${totalMonths.toFixed(1)} months. Anything past 12 months needs an express contractual clause and a clear business reason.`,
    );
  }
  if (totalMonths > NOTICE_THRESHOLD_MONTHS) {
    warnings.push(
      `The employee will have crossed ${NOTICE_THRESHOLD_MONTHS} months of continuous service. Most state Shops and Establishments Acts require notice or wages in lieu once that threshold is passed, whether or not the person is still on probation.`,
    );
  }
  if (reviewGapFromLetter !== null && reviewGapFromLetter < 7) {
    warnings.push("The review date falls within a week of the letter — leave the employee real time to improve.");
  }

  return {
    newEndDate,
    reviewDate,
    originalSpanDays,
    totalDays,
    totalMonths,
    extensionMonths: Math.trunc(months),
    warnings,
  };
}

function bullets(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

/**
 * Builds the probation extension letter text.
 * Returns { error } when the schedule cannot be computed or a required party is missing.
 */
export function buildProbationExtensionLetter(input = {}) {
  const schedule = computeProbationExtension(input);
  if (schedule.error) return schedule;

  const company = String(input.company || "").trim();
  const companyAddress = String(input.companyAddress || "").trim();
  const employeeName = String(input.employeeName || "").trim();
  const employeeId = String(input.employeeId || "").trim();
  const designation = String(input.designation || "").trim();
  const department = String(input.department || "").trim();
  const managerName = String(input.managerName || "").trim();
  const managerTitle = String(input.managerTitle || "").trim() || "Head of Human Resources";
  const reasons = bullets(input.reasons);
  const supportSteps = bullets(input.supportSteps);
  const tone = input.tone === "formal" ? "formal" : "supportive";

  if (!company) return { error: "Enter the employer name that appears on the letterhead." };
  if (!employeeName) return { error: "Enter the employee's name." };
  if (reasons.length === 0) {
    return { error: "Give at least one reason for the extension — an unexplained extension is hard to defend later." };
  }

  const letterDateText = formatLongDate(input.letterDate);
  const joiningText = formatLongDate(input.joiningDate);
  const originalEndText = formatLongDate(input.originalEndDate);
  const newEndText = formatLongDate(schedule.newEndDate);
  const reviewText = formatLongDate(schedule.reviewDate);

  const roleLine = [designation, department].filter(Boolean).join(", ");

  const opening =
    tone === "formal"
      ? `This letter records the extension of your probationary period with ${company}.`
      : `We are writing to let you know that your probationary period with ${company} is being extended, and to set out exactly what we will be looking for in that time.`;

  const lines = [];
  lines.push(company);
  if (companyAddress) lines.push(companyAddress);
  lines.push("");
  lines.push(`Date: ${letterDateText}`);
  lines.push("");
  lines.push(`To: ${employeeName}`);
  if (employeeId) lines.push(`Employee ID: ${employeeId}`);
  if (roleLine) lines.push(`Role: ${roleLine}`);
  lines.push("");
  lines.push(`Subject: Extension of probationary period to ${newEndText}`);
  lines.push("");
  lines.push(`Dear ${employeeName.split(" ")[0] || employeeName},`);
  lines.push("");
  lines.push(opening);
  lines.push("");
  lines.push(
    `You joined ${company} on ${joiningText} and your probation was due to end on ${originalEndText}. After reviewing your performance in the role, we are extending your probation by ${schedule.extensionMonths} month${schedule.extensionMonths === 1 ? "" : "s"}, to ${newEndText}.`,
  );
  lines.push("");
  lines.push("Reasons for the extension");
  reasons.forEach((reason) => lines.push(`  - ${reason}`));
  lines.push("");
  if (supportSteps.length > 0) {
    lines.push("Support and expectations during the extension");
    supportSteps.forEach((step) => lines.push(`  - ${step}`));
    lines.push("");
  }
  lines.push(
    `A formal review meeting will be held on or around ${reviewText}, before the extended probation ends. At that meeting we will either confirm you in the role, or discuss the position if the standards set out above have not been met.`,
  );
  lines.push("");
  lines.push(
    "All other terms of your appointment letter, including your salary, working hours and leave entitlement, remain unchanged during this period.",
  );
  lines.push("");
  lines.push(
    "Please sign and return the acknowledgement below to confirm you have received this letter. If anything here is unclear, speak to your manager or to HR.",
  );
  lines.push("");
  lines.push("Yours sincerely,");
  lines.push("");
  lines.push("");
  lines.push(managerName || "____________________");
  lines.push(managerTitle);
  lines.push(company);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("Acknowledgement");
  lines.push(
    `I, ${employeeName}, confirm that I have received and read this letter extending my probationary period to ${newEndText}.`,
  );
  lines.push("");
  lines.push("Signature: ____________________        Date: ____________");

  const summary = [
    ["Original probation end", originalEndText],
    ["Extension length", `${schedule.extensionMonths} month${schedule.extensionMonths === 1 ? "" : "s"}`],
    ["Revised probation end", newEndText],
    ["Review meeting on or before", reviewText],
    ["Total probation served", `${schedule.totalDays} days (about ${schedule.totalMonths.toFixed(1)} months)`],
  ];

  return {
    letter: lines.join("\n"),
    summary,
    ...schedule,
  };
}
