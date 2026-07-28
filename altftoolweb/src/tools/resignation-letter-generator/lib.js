/**
 * Resignation Letter Generator — notice-period maths and letter composition.
 *
 * Notice period rules:
 *  - The notice period itself comes from your employment contract or appointment
 *    letter, not from a single statute. 30, 60 and 90 calendar days are the
 *    common contractual lengths in India; some contracts count working days
 *    instead, which changes the arithmetic, so both are offered.
 *  - The notice period is counted from the day the resignation is submitted and
 *    accepted. Day 1 is the day after submission, so a 30-day notice given on
 *    1 August ends on 31 August.
 *  - Where a contract allows buying out the shortfall, the deduction is usually
 *    calculated as (the salary component named in the contract ÷ 30) × the number
 *    of days short. Which component — basic, gross or CTC — is contractual, so
 *    the divisor and the component are both left to the user.
 *
 * Pure module: no React, no DOM, no Date.now(). Dates arrive as ISO strings.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Contractual notice lengths seen most often. */
export const NOTICE_PRESETS = [
  { id: "15", days: 15, label: "15 days" },
  { id: "30", days: 30, label: "30 days (1 month)" },
  { id: "60", days: 60, label: "60 days (2 months)" },
  { id: "90", days: 90, label: "90 days (3 months)" },
];

/** Days used to convert a monthly salary into a daily rate for buyout maths. */
export const DEFAULT_BUYOUT_DIVISOR = 30;

/** Longest notice period this generator will lay out. */
export const MAX_NOTICE_DAYS = 365;

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

/** Tone of the letter. */
export const TONES = [
  {
    id: "standard",
    label: "Standard and neutral",
    opening: "I am writing to formally resign from my position as",
    thanks: "I am grateful for the opportunities I have had here and for the support of the team.",
  },
  {
    id: "grateful",
    label: "Warm and appreciative",
    opening: "After careful thought, I am writing to resign from my position as",
    thanks:
      "I have learned a great deal in this role and genuinely valued working with this team. Thank you for the trust and the opportunities.",
  },
  {
    id: "brief",
    label: "Short and formal",
    opening: "Please accept this letter as formal notice of my resignation from the position of",
    thanks: "Thank you for the opportunity to work here.",
  },
  {
    id: "immediate",
    label: "Requesting early release",
    opening: "I am writing to resign from my position as",
    thanks: "I am grateful for the opportunities I have had here.",
  },
];

/** Optional one-line reasons. Naming a reason is never required. */
export const REASONS = [
  { id: "none", label: "No reason given", sentence: "" },
  { id: "opportunity", label: "New opportunity", sentence: "I have accepted an offer that takes my career in a direction I want to pursue." },
  { id: "study", label: "Further study", sentence: "I am leaving to take up a course of full-time study." },
  { id: "relocation", label: "Relocation", sentence: "I am relocating and will not be able to continue in this role." },
  { id: "personal", label: "Personal reasons", sentence: "I am stepping away for personal reasons." },
  { id: "health", label: "Health reasons", sentence: "I am stepping away on health grounds." },
  { id: "family", label: "Family responsibilities", sentence: "Family responsibilities require my full attention for the foreseeable future." },
];

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
  return { year, month, day, stamp, weekday: check.getUTCDay() };
}

function toIso(stamp) {
  const date = new Date(stamp);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

/** Format an ISO date as "31 August 2026", optionally with the weekday. */
export function formatLongDate(iso, { withWeekday = false } = {}) {
  const parts = parseIsoDate(iso);
  if (!parts) return "";
  const base = `${parts.day} ${MONTH_NAMES[parts.month - 1]} ${parts.year}`;
  return withWeekday ? `${WEEKDAY_NAMES[parts.weekday]}, ${base}` : base;
}

/**
 * Last working day implied by a notice period.
 * Day 1 of notice is the day after the resignation is submitted, so 30 days'
 * notice given on 1 August ends on 31 August.
 * `countWorkingDays` counts only Monday-Friday towards the notice.
 */
export function lastWorkingDay({ resignationDate, noticeDays, countWorkingDays = false } = {}) {
  const start = parseIsoDate(resignationDate);
  if (!start) return { error: "Enter a valid resignation date." };
  const notice = Number(noticeDays);
  if (!Number.isFinite(notice) || notice < 0) return { error: "Notice period must be zero or more days." };
  if (notice > MAX_NOTICE_DAYS) return { error: `This generator handles notice periods up to ${MAX_NOTICE_DAYS} days.` };
  if (notice === 0) {
    return { iso: toIso(start.stamp), long: formatLongDate(toIso(start.stamp), { withWeekday: true }), calendarDays: 0, isWeekend: start.weekday === 0 || start.weekday === 6 };
  }

  let stamp = start.stamp;
  let counted = 0;
  let elapsed = 0;
  // Guard the loop so an unusable input can never spin: 365 days of notice can
  // take at most 365 * 7/5 + 7 calendar days to satisfy in working-day mode.
  const maxSteps = MAX_NOTICE_DAYS * 2 + 14;
  while (counted < notice && elapsed < maxSteps) {
    stamp += MS_PER_DAY;
    elapsed += 1;
    const weekday = new Date(stamp).getUTCDay();
    if (!countWorkingDays || (weekday !== 0 && weekday !== 6)) counted += 1;
  }
  if (counted < notice) return { error: "That notice period is too long to lay out." };

  const iso = toIso(stamp);
  const weekday = new Date(stamp).getUTCDay();
  return {
    iso,
    long: formatLongDate(iso, { withWeekday: true }),
    calendarDays: elapsed,
    noticeDays: notice,
    isWeekend: weekday === 0 || weekday === 6,
  };
}

/** Compare the last day you want with the last day your notice requires. */
export function noticeShortfall({ requiredIso, proposedIso } = {}) {
  const required = parseIsoDate(requiredIso);
  const proposed = parseIsoDate(proposedIso);
  if (!required) return { error: "The required last working day could not be worked out." };
  if (!proposed) return { error: "Enter a valid proposed last working day." };
  const difference = Math.round((required.stamp - proposed.stamp) / MS_PER_DAY);
  if (difference <= 0) {
    return {
      shortfallDays: 0,
      status: difference === 0 ? "exact" : "extra",
      extraDays: Math.abs(difference),
      message:
        difference === 0
          ? "Your proposed last day serves the full notice period."
          : `You are offering ${Math.abs(difference)} day${Math.abs(difference) === 1 ? "" : "s"} more than the notice requires.`,
    };
  }
  return {
    shortfallDays: difference,
    status: "short",
    extraDays: 0,
    message: `Your proposed last day is ${difference} day${difference === 1 ? "" : "s"} short of the notice period. Ask for a waiver or expect a buyout deduction.`,
  };
}

/**
 * Notice buyout amount for a shortfall.
 * Amount = (monthly salary component ÷ divisor) × shortfall days.
 */
export function noticeBuyout({ monthlySalary = 0, shortfallDays = 0, divisor = DEFAULT_BUYOUT_DIVISOR } = {}) {
  const salary = Number(monthlySalary);
  const days = Number(shortfallDays);
  const perMonth = Number(divisor);
  if (!Number.isFinite(salary) || salary < 0) return { error: "Salary must be zero or more." };
  if (!Number.isFinite(days) || days < 0) return { error: "Shortfall days must be zero or more." };
  if (!Number.isFinite(perMonth) || perMonth <= 0) return { error: "The days-per-month divisor must be greater than zero." };
  const dailyRate = salary / perMonth;
  return {
    dailyRate,
    shortfallDays: days,
    amount: dailyRate * days,
    divisor: perMonth,
  };
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/** Compose the resignation letter. */
export function buildResignationLetter({
  employeeName = "",
  designation = "",
  employeeId = "",
  department = "",
  companyName = "",
  managerName = "",
  resignationDate = "",
  noticeDays = 30,
  countWorkingDays = false,
  proposedLastDay = "",
  toneId = "standard",
  reasonId = "none",
  customReason = "",
  handoverTo = "",
  handoverNotes = "",
  requestExperienceLetter = true,
  offerFlexibility = true,
} = {}) {
  const tone = TONES.find((entry) => entry.id === toneId);
  if (!tone) return { error: "Choose a tone for the letter." };

  const reason = REASONS.find((entry) => entry.id === reasonId);
  if (!reason) return { error: "Choose a reason option, or 'No reason given'." };

  const name = clean(employeeName);
  if (!name) return { error: "Enter your name." };

  const role = clean(designation);
  if (!role) return { error: "Enter your designation." };

  const company = clean(companyName);
  if (!company) return { error: "Enter the employer's name." };

  const required = lastWorkingDay({ resignationDate, noticeDays, countWorkingDays });
  if (required.error) return { error: required.error };

  const resignLong = formatLongDate(resignationDate);
  if (!resignLong) return { error: "Enter a valid resignation date." };

  const proposed = clean(proposedLastDay);
  const shortfall = proposed
    ? noticeShortfall({ requiredIso: required.iso, proposedIso: proposed })
    : { shortfallDays: 0, status: "exact", extraDays: 0, message: "Serving the full notice period." };
  if (shortfall.error) return { error: shortfall.error };

  const finalIso = proposed || required.iso;
  const finalLong = formatLongDate(finalIso, { withWeekday: true });
  if (!finalLong) return { error: "Enter a valid proposed last working day." };

  const manager = clean(managerName);
  const dept = clean(department);
  const empId = clean(employeeId);
  const cover = clean(handoverTo);
  const notes = clean(handoverNotes);
  const reasonLine = clean(customReason) || reason.sentence;

  const subject = `Resignation — ${name}${role ? `, ${role}` : ""}${empId ? ` (${empId})` : ""}`;

  const paragraphs = [];
  paragraphs.push(
    `${tone.opening} ${role}${dept ? ` in the ${dept} team` : ""} at ${company}. In line with my notice period of ${
      required.noticeDays ?? Number(noticeDays)
    } ${countWorkingDays ? "working" : "calendar"} days, my last working day will be ${finalLong}.`,
  );

  if (reasonLine) paragraphs.push(reasonLine);

  if (shortfall.status === "short") {
    paragraphs.push(
      `This is ${shortfall.shortfallDays} day${shortfall.shortfallDays === 1 ? "" : "s"} short of the full notice period. I would be grateful if the balance could be waived; if not, I am willing to have it settled as per the terms of my appointment letter.`,
    );
  }

  if (cover && notes) {
    paragraphs.push(`I will hand over my responsibilities to ${cover} and will document ${notes} before I leave.`);
  } else if (cover) {
    paragraphs.push(`I will hand over my responsibilities to ${cover} and will prepare written documentation of everything in progress.`);
  } else {
    paragraphs.push("I will prepare written handover documentation for everything in progress and am happy to train whoever takes over.");
  }

  if (offerFlexibility) {
    paragraphs.push("Please let me know how you would like the transition handled — I want to leave things in good order.");
  }

  paragraphs.push(tone.thanks);

  if (requestExperienceLetter) {
    paragraphs.push(
      "I would be grateful if the relieving letter, experience certificate and full and final settlement could be processed after my last working day.",
    );
  }

  const letter = [
    `Date: ${resignLong}`,
    "",
    "To,",
    manager ? `${manager},` : "The Manager,",
    `${company}`,
    "",
    `Subject: ${subject}`,
    "",
    manager ? `Dear ${manager},` : "Dear Sir/Madam,",
    "",
    paragraphs.join("\n\n"),
    "",
    "Yours sincerely,",
    "",
    name,
    [role, dept ? `${dept} team` : "", empId ? `Employee ID: ${empId}` : ""].filter(Boolean).join("\n"),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  const checklist = [
    { item: "Resignation stated in the first sentence", done: true },
    { item: "Designation and employer named", done: true },
    { item: "Last working day given as a date", done: Boolean(finalLong) },
    { item: "Notice period referenced", done: true },
    { item: "Handover named", done: Boolean(cover) },
    { item: "Employee ID for the HR file", done: Boolean(empId) },
    { item: "Relieving letter and settlement requested", done: Boolean(requestExperienceLetter) },
    { item: "Full notice served", done: shortfall.status !== "short" },
    { item: "No criticism of colleagues or employer", done: true },
  ];

  return {
    letter,
    subject,
    requiredLastDay: required,
    finalLastDay: { iso: finalIso, long: finalLong },
    shortfall,
    wordCount: letter.split(/\s+/).filter(Boolean).length,
    checklist,
    completedItems: checklist.filter((entry) => entry.done).length,
    totalItems: checklist.length,
  };
}
