/**
 * Office Leave Application Generator — letter composition, notice check,
 * leave-balance maths and the statutory earned-leave formula.
 *
 * Statutory references used here (India):
 *  - Factories Act 1948, section 79: a worker who has worked at least 240 days
 *    in a calendar year is entitled in the following year to earned leave of one
 *    day for every 20 days worked (adults) or one day for every 15 days worked
 *    (young persons, i.e. under 18). Fractions of half a day or more are rounded
 *    up to a full day; smaller fractions are ignored.
 *  - Maternity Benefit Act 1961 as amended in 2017, section 5: 26 weeks of paid
 *    maternity leave for the first two surviving children, 12 weeks thereafter.
 *
 * Casual and sick leave are not fixed by a single central statute — they come
 * from the state Shops and Establishments Act that applies to the workplace and
 * from the employer's own policy, so this module asks for the balance rather
 * than assuming one.
 *
 * Pure module: no React, no DOM, no Date.now(). Dates arrive as ISO strings.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Factories Act 1948, s.79 — qualifying days of work in the preceding year. */
export const EARNED_LEAVE_QUALIFYING_DAYS = 240;

/** Factories Act 1948, s.79 — one day of leave per this many days worked. */
export const EARNED_LEAVE_DIVISOR_ADULT = 20;
export const EARNED_LEAVE_DIVISOR_YOUNG = 15;

/** Maternity Benefit Act 1961 (2017 amendment), s.5 — weeks of paid leave. */
export const MATERNITY_WEEKS_FIRST_TWO = 26;
export const MATERNITY_WEEKS_LATER = 12;

/** Longest single application this generator will word. */
export const MAX_LEAVE_DAYS = 180;

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Leave kinds and the conventions that go with them.
 * `noticeDays` is the notice most workplace policies expect, not a legal rule.
 */
export const LEAVE_KINDS = [
  {
    id: "casual",
    label: "Casual leave (CL)",
    noticeDays: 2,
    retrospective: false,
    proof: "",
    reason: "I need to attend to a personal matter that cannot be rescheduled",
    note: "Casual leave is normally taken in short blocks and sanctioned in advance.",
  },
  {
    id: "earned",
    label: "Earned / privilege leave (EL/PL)",
    noticeDays: 15,
    retrospective: false,
    proof: "",
    reason: "I wish to avail earned leave from my accrued balance",
    note: "Earned leave accrues with days worked and usually needs the longest notice.",
  },
  {
    id: "sick",
    label: "Sick leave (SL)",
    noticeDays: 0,
    retrospective: true,
    proof: "A medical certificate is attached.",
    reason: "I am unwell and have been advised rest",
    note: "Sick leave can be applied for on the day, and regularised on return.",
  },
  {
    id: "emergency",
    label: "Emergency / urgent personal leave",
    noticeDays: 0,
    retrospective: true,
    proof: "",
    reason: "an urgent situation at home requires my immediate presence",
    note: "State the facts briefly; you are informing rather than requesting in advance.",
  },
  {
    id: "bereavement",
    label: "Bereavement leave",
    noticeDays: 0,
    retrospective: true,
    proof: "",
    reason: "of a bereavement in my immediate family",
    note: "Keep the letter short. Most employers do not ask for detail here.",
  },
  {
    id: "compoff",
    label: "Compensatory off",
    noticeDays: 2,
    retrospective: false,
    proof: "",
    reason: "I would like to avail compensatory off against the days I worked outside normal hours",
    note: "Name the dates you worked extra — comp-off is usually tracked against them.",
  },
  {
    id: "unpaid",
    label: "Leave without pay (LWP)",
    noticeDays: 15,
    retrospective: false,
    proof: "",
    reason: "I need extended time away and my paid leave balance is exhausted",
    note: "Say explicitly that you accept the salary deduction; it avoids a second round of email.",
  },
  {
    id: "maternity",
    label: "Maternity leave",
    noticeDays: 45,
    retrospective: false,
    proof: "The medical certificate showing the expected date is attached.",
    reason: "I wish to avail maternity leave under the Maternity Benefit Act",
    note: "Statutory entitlement is 26 weeks for the first two children and 12 weeks thereafter.",
  },
  {
    id: "paternity",
    label: "Paternity leave",
    noticeDays: 15,
    retrospective: false,
    proof: "",
    reason: "I wish to avail paternity leave as provided in company policy",
    note: "There is no central statutory paternity leave for private-sector employees; this comes from company policy.",
  },
];

/** How the application is being sent. */
export const CHANNELS = [
  { id: "letter", label: "Printed letter", opening: "Dear Sir/Madam", close: "Yours sincerely" },
  { id: "email", label: "Email", opening: "Dear", close: "Best regards" },
];

/** Leave label without the abbreviation in brackets. */
export function plainLabel(kind) {
  return kind && typeof kind.label === "string" ? kind.label.replace(/ \(.*\)$/, "") : "";
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

/** Format an ISO date as "3 August 2026". */
export function formatLongDate(iso) {
  const parts = parseIsoDate(iso);
  if (!parts) return "";
  return `${parts.day} ${MONTH_NAMES[parts.month - 1]} ${parts.year}`;
}

/** Inclusive day count, with a working-day breakdown. */
export function countLeaveDays({ from, to } = {}) {
  const start = parseIsoDate(from);
  const end = parseIsoDate(to);
  if (!start) return { error: "Enter a valid first day of leave." };
  if (!end) return { error: "Enter a valid last day of leave." };
  if (end.stamp < start.stamp) return { error: "The last day of leave cannot be before the first day." };

  const calendarDays = Math.round((end.stamp - start.stamp) / MS_PER_DAY) + 1;
  if (calendarDays > MAX_LEAVE_DAYS) {
    return { error: `This generator covers a single application of up to ${MAX_LEAVE_DAYS} days.` };
  }

  let workingDays = 0;
  for (let offset = 0; offset < calendarDays; offset += 1) {
    const day = new Date(start.stamp + offset * MS_PER_DAY).getUTCDay();
    if (day !== 0 && day !== 6) workingDays += 1;
  }

  return {
    calendarDays,
    workingDays,
    weekendDays: calendarDays - workingDays,
    singleDay: calendarDays === 1,
  };
}

/**
 * Earned leave earned under Factories Act 1948, s.79.
 * Returns { error } if the inputs are not usable, and eligible:false when the
 * 240-day qualifying threshold is not met.
 */
export function earnedLeaveEntitlement({ daysWorked = 0, youngPerson = false } = {}) {
  const worked = Number(daysWorked);
  if (!Number.isFinite(worked) || worked < 0) {
    return { error: "Days worked must be zero or more." };
  }
  if (worked > 366) {
    return { error: "A calendar year cannot contain more than 366 days of work." };
  }
  const divisor = youngPerson ? EARNED_LEAVE_DIVISOR_YOUNG : EARNED_LEAVE_DIVISOR_ADULT;
  if (worked < EARNED_LEAVE_QUALIFYING_DAYS) {
    return {
      eligible: false,
      daysWorked: worked,
      divisor,
      days: 0,
      note: `Section 79 requires at least ${EARNED_LEAVE_QUALIFYING_DAYS} days of work in the preceding calendar year before earned leave accrues.`,
    };
  }
  const raw = worked / divisor;
  const whole = Math.floor(raw);
  const fraction = raw - whole;
  // s.79: a fraction of half a day or more counts as a full day; less is ignored.
  const days = fraction >= 0.5 ? whole + 1 : whole;
  return {
    eligible: true,
    daysWorked: worked,
    divisor,
    raw,
    days,
    note: `One day of leave for every ${divisor} days worked, with a half day or more rounded up.`,
  };
}

/** Maternity leave weeks under the Maternity Benefit Act 1961 (2017 amendment). */
export function maternityLeaveWeeks({ survivingChildren = 0 } = {}) {
  const children = Number(survivingChildren);
  if (!Number.isInteger(children) || children < 0) {
    return { error: "Number of surviving children must be zero or more." };
  }
  const weeks = children < 2 ? MATERNITY_WEEKS_FIRST_TWO : MATERNITY_WEEKS_LATER;
  return {
    weeks,
    days: weeks * 7,
    note:
      children < 2
        ? `${MATERNITY_WEEKS_FIRST_TWO} weeks applies for the first two surviving children.`
        : `${MATERNITY_WEEKS_LATER} weeks applies from the third child onward.`,
  };
}

/** Compare the application date with the first day of leave. */
export function noticeCheck({ applicationDate, from, kindId } = {}) {
  const kind = LEAVE_KINDS.find((entry) => entry.id === kindId);
  if (!kind) return { error: "Choose a leave type." };
  const applied = parseIsoDate(applicationDate);
  const start = parseIsoDate(from);
  if (!applied || !start) return { error: "Enter valid dates to check the notice period." };

  const noticeDays = Math.round((start.stamp - applied.stamp) / MS_PER_DAY);
  if (noticeDays < 0) {
    return {
      noticeDays,
      status: kind.retrospective ? "retrospective" : "late",
      message: kind.retrospective
        ? `${plainLabel(kind)} can be regularised after the fact; say clearly that you are applying retrospectively.`
        : `The leave has already started. ${plainLabel(kind)} normally needs ${kind.noticeDays} days' notice, so expect to have it regularised as an exception.`,
    };
  }
  if (noticeDays >= kind.noticeDays) {
    return {
      noticeDays,
      status: "ok",
      message: `${noticeDays} day${noticeDays === 1 ? "" : "s"} of notice meets the ${kind.noticeDays}-day expectation for ${plainLabel(kind).toLowerCase()}.`,
    };
  }
  return {
    noticeDays,
    status: "short",
    message: `Only ${noticeDays} day${noticeDays === 1 ? "" : "s"} of notice — ${plainLabel(kind).toLowerCase()} usually expects ${kind.noticeDays}. Add a sentence explaining the short notice.`,
  };
}

/** Balance left after this application. */
export function leaveBalance({ opening = 0, applying = 0 } = {}) {
  const start = Number(opening);
  const use = Number(applying);
  if (!Number.isFinite(start) || start < 0) return { error: "Opening balance must be zero or more." };
  if (!Number.isFinite(use) || use < 0) return { error: "Days applied for must be zero or more." };
  const closing = start - use;
  return {
    opening: start,
    applying: use,
    closing,
    overdrawn: closing < 0,
    shortfall: closing < 0 ? Math.abs(closing) : 0,
  };
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/** Compose the office leave application. */
export function buildOfficeLeave({
  kindId = "casual",
  channelId = "email",
  employeeName = "",
  designation = "",
  employeeId = "",
  department = "",
  managerName = "",
  companyName = "",
  from = "",
  to = "",
  applicationDate = "",
  customReason = "",
  handover = "",
  contactNumber = "",
  attachProof = false,
  countWorkingDaysOnly = true,
  openingBalance = "",
} = {}) {
  const kind = LEAVE_KINDS.find((entry) => entry.id === kindId);
  if (!kind) return { error: "Choose a leave type." };

  const channel = CHANNELS.find((entry) => entry.id === channelId);
  if (!channel) return { error: "Choose whether this is a letter or an email." };

  const name = clean(employeeName);
  if (!name) return { error: "Enter your name." };

  const company = clean(companyName);
  if (!company) return { error: "Enter the employer's name." };

  const period = countLeaveDays({ from, to });
  if (period.error) return { error: period.error };

  const applied = clean(applicationDate) || from;
  const appliedLong = formatLongDate(applied);
  if (!appliedLong) return { error: "Enter a valid application date." };

  const fromLong = formatLongDate(from);
  const toLong = formatLongDate(to);
  const daysApplied = countWorkingDaysOnly ? period.workingDays : period.calendarDays;
  const periodPhrase = period.singleDay ? `on ${fromLong}` : `from ${fromLong} to ${toLong}`;

  const notice = noticeCheck({ applicationDate: applied, from, kindId });
  const balance =
    clean(String(openingBalance)) === ""
      ? null
      : leaveBalance({ opening: Number(openingBalance), applying: daysApplied });

  const manager = clean(managerName);
  const salutation = channel.id === "email" && manager ? `Dear ${manager},` : `${channel.opening},`;
  const reason = clean(customReason) || kind.reason;
  const dept = clean(department);
  const role = clean(designation);
  const empId = clean(employeeId);

  const subject = `${plainLabel(kind)} request ${periodPhrase}${
    empId ? ` — ${name} (${empId})` : ` — ${name}`
  }`;

  const identity = [role, dept ? `${dept} team` : "", empId ? `employee ID ${empId}` : ""]
    .filter(Boolean)
    .join(", ");

  const paragraphs = [];
  paragraphs.push(
    `I am writing to request ${plainLabel(kind).toLowerCase()} ${periodPhrase}, a total of ${daysApplied} ${
      countWorkingDaysOnly ? "working" : "calendar"
    } day${daysApplied === 1 ? "" : "s"}, as ${reason}.`,
  );

  if (notice.status === "short" || notice.status === "late" || notice.status === "retrospective") {
    paragraphs.push(
      notice.status === "retrospective" || notice.status === "late"
        ? "I was unable to apply in advance and am submitting this request for regularisation."
        : "I am aware this is shorter notice than usual and will do everything possible to limit the disruption.",
    );
  }

  const cover = clean(handover);
  if (cover) {
    paragraphs.push(
      `${cover} has agreed to cover my responsibilities during this period. I will complete a written handover of pending items before my last working day and share access to anything that needs it.`,
    );
  } else {
    paragraphs.push(
      "I will complete a written handover of pending items before my last working day so nothing is left blocked.",
    );
  }

  const phone = clean(contactNumber);
  if (phone) {
    paragraphs.push(`I can be reached on ${phone} if something genuinely urgent comes up.`);
  }

  if (attachProof && kind.proof) paragraphs.push(kind.proof);

  if (balance && !balance.error && !balance.overdrawn) {
    paragraphs.push(
      `This leaves ${balance.closing} day${balance.closing === 1 ? "" : "s"} in my ${plainLabel(kind).toLowerCase()} balance.`,
    );
  }

  paragraphs.push("I would be grateful for your approval. I will resume work on the next working day after the leave period.");

  const signature = [name];
  if (identity) signature.push(identity);
  signature.push(company);

  const body = [
    channel.id === "letter" ? `To,\nThe Manager,\n${company}` : null,
    channel.id === "letter" ? `Date: ${appliedLong}` : null,
    `Subject: ${subject}`,
    "",
    salutation,
    "",
    paragraphs.join("\n\n"),
    "",
    `${channel.close},`,
    signature.join("\n"),
  ]
    .filter((line) => line !== null)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n");

  const checklist = [
    { item: "Leave type named explicitly", done: true },
    { item: "Exact dates and total days", done: true },
    { item: "Reason in one sentence", done: Boolean(reason) },
    { item: "Handover named", done: Boolean(cover) },
    { item: "Contact number while away", done: Boolean(phone) },
    { item: "Employee ID for the HR record", done: Boolean(empId) },
    { item: "Supporting document mentioned", done: Boolean(attachProof && kind.proof) },
    { item: "Notice period met", done: notice.status === "ok" },
    { item: "Return-to-work date stated", done: true },
  ];

  return {
    letter: body,
    subject,
    kindNote: kind.note,
    period,
    daysApplied,
    notice,
    balance,
    checklist,
    completedItems: checklist.filter((entry) => entry.done).length,
    totalItems: checklist.length,
    wordCount: body.split(/\s+/).filter(Boolean).length,
  };
}
