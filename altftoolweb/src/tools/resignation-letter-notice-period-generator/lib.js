/**
 * Resignation notice-period maths and letter builder.
 *
 * Rules and conventions used:
 *  - Notice length is contractual. Indian state Shops and Establishments Acts
 *    commonly require about one month's notice from an employee who has
 *    completed a qualifying period of service, but the exact figure comes from
 *    your appointment letter — the tool takes it as an input.
 *  - Convention followed here: the notice period runs from the day AFTER the
 *    resignation is submitted, so a one-month notice submitted on 5 August ends
 *    on 5 September, which is the last working day.
 *  - Month arithmetic is calendar-based and clamps to the end of a short month:
 *    31 January + 1 month = 28 February (29 in a leap year).
 *  - Leave adjusted against notice and days bought out both shorten the served
 *    period; they do not change the contractual notice end date.
 */

/** Calendar months are added, not multiplied by an assumed day count. */
export const NOTICE_UNITS = [
  { id: "months", label: "Months", max: 12 },
  { id: "days", label: "Days", max: 365 },
];

/** Working-week patterns offered. 0 = Sunday .. 6 = Saturday. */
export const WEEK_PATTERNS = [
  { id: "5", label: "Monday to Friday", offDays: [0, 6] },
  { id: "5.5", label: "Monday to Friday + alternate Saturdays", offDays: [0] },
  { id: "6", label: "Monday to Saturday", offDays: [0] },
  { id: "7", label: "All seven days", offDays: [] },
];

/** Handover phases as a share of the served notice period. The split is a
 *  planning convention, not a legal rule: document first, transfer knowledge in
 *  the middle, keep the last fifth for sign-offs and asset return. */
export const HANDOVER_SPLIT = [
  { key: "documentation", share: 0.4, title: "Document what you own", detail: "Write down every recurring task, credential owner, runbook and open commitment." },
  { key: "transfer", share: 0.4, title: "Walk the successor through it", detail: "Shadow sessions, joint ownership of live work, introductions to counterparts and vendors." },
  { key: "closure", share: 0.2, title: "Close out", detail: "Final sign-offs, asset and access return, exit interview, relieving and experience letter requests." },
];

/** Alternate-Saturday weeks average 5.5 working days; used only for the
 *  estimated working-day count on that pattern. */
const ALTERNATE_SATURDAY_FACTOR = 0.5;

const MS_PER_DAY = 86400000;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(Number(match[1]), month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

const toISO = (date) => date.toISOString().slice(0, 10);

export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !isNum(days)) return null;
  return toISO(new Date(date.getTime() + Math.round(days) * MS_PER_DAY));
}

/** Add calendar months, clamping to the last day of the target month. */
export function addMonthsISO(isoDate, months) {
  const date = parseISODate(isoDate);
  if (!date || !isNum(months)) return null;
  const wholeMonths = Math.trunc(months);
  const fractionDays = Math.round((months - wholeMonths) * 30);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const lastDayOfTarget = new Date(Date.UTC(year, month + wholeMonths + 1, 0)).getUTCDate();
  const shifted = new Date(Date.UTC(year, month + wholeMonths, Math.min(day, lastDayOfTarget)));
  return fractionDays ? toISO(new Date(shifted.getTime() + fractionDays * MS_PER_DAY)) : toISO(shifted);
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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatShortDate(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Count working days in [fromISO, toISO] inclusive for a week pattern. */
export function countWorkingDays(fromISO, toISODate, patternId) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to || to.getTime() < from.getTime()) return 0;
  const pattern = WEEK_PATTERNS.find((item) => item.id === patternId) || WEEK_PATTERNS[0];
  let count = 0;
  let saturdays = 0;
  for (let time = from.getTime(); time <= to.getTime(); time += MS_PER_DAY) {
    const weekday = new Date(time).getUTCDay();
    if (pattern.offDays.includes(weekday)) continue;
    if (patternId === "5.5" && weekday === 6) {
      saturdays += 1;
      continue;
    }
    count += 1;
  }
  return patternId === "5.5" ? count + Math.round(saturdays * ALTERNATE_SATURDAY_FACTOR) : count;
}

/**
 * Turn a resignation date and a notice period into the dates that matter.
 * Returns { error } for input that cannot produce a sensible schedule.
 */
export function computeNoticeSchedule({
  resignationDateISO,
  noticeValue,
  noticeUnit = "months",
  leaveAdjustDays = 0,
  buyoutDays = 0,
  weekPattern = "5",
}) {
  if (!parseISODate(resignationDateISO)) {
    return { error: "Enter a valid resignation date in YYYY-MM-DD form." };
  }
  if (!isNum(noticeValue) || noticeValue <= 0) {
    return { error: "Notice period must be greater than zero." };
  }
  if (!isNum(leaveAdjustDays) || leaveAdjustDays < 0 || !isNum(buyoutDays) || buyoutDays < 0) {
    return { error: "Leave adjustment and buyout days cannot be negative." };
  }
  const unit = NOTICE_UNITS.find((item) => item.id === noticeUnit) || NOTICE_UNITS[0];
  if (noticeValue > unit.max) {
    return { error: `A notice period longer than ${unit.max} ${unit.id} is almost certainly a typo.` };
  }

  const contractualEndISO =
    unit.id === "months"
      ? addMonthsISO(resignationDateISO, noticeValue)
      : addDaysISO(resignationDateISO, noticeValue);
  if (!contractualEndISO) return { error: "Could not work out the notice end date from those inputs." };

  const contractualDays = daysBetweenISO(resignationDateISO, contractualEndISO);
  const reductionDays = Math.round(leaveAdjustDays + buyoutDays);

  if (reductionDays >= contractualDays) {
    return {
      error: `Leave adjustment and buyout add up to ${reductionDays} days, which is not less than the ${contractualDays}-day notice period. Reduce them or agree a full waiver with HR.`,
    };
  }

  const lastWorkingDayISO = addDaysISO(contractualEndISO, -reductionDays);
  const noticeStartISO = addDaysISO(resignationDateISO, 1);
  const servedDays = daysBetweenISO(resignationDateISO, lastWorkingDayISO);
  const workingDaysServed = countWorkingDays(noticeStartISO, lastWorkingDayISO, weekPattern);

  const milestones = [];
  let cursorISO = noticeStartISO;
  let consumed = 0;
  HANDOVER_SPLIT.forEach((phase, index) => {
    const isLast = index === HANDOVER_SPLIT.length - 1;
    const phaseDays = isLast ? servedDays - consumed : Math.max(1, Math.round(servedDays * phase.share));
    consumed += phaseDays;
    const endISO = isLast ? lastWorkingDayISO : addDaysISO(cursorISO, Math.max(0, phaseDays - 1));
    milestones.push({
      key: phase.key,
      title: phase.title,
      detail: phase.detail,
      startISO: cursorISO,
      endISO,
      days: Math.max(1, phaseDays),
    });
    cursorISO = addDaysISO(endISO, 1);
  });

  return {
    noticeStartISO,
    contractualEndISO,
    lastWorkingDayISO,
    contractualDays,
    servedDays,
    reductionDays,
    leaveAdjustDays: Math.round(leaveAdjustDays),
    buyoutDays: Math.round(buyoutDays),
    workingDaysServed,
    milestones,
    shortened: reductionDays > 0,
  };
}

const clean = (value) => (typeof value === "string" ? value.trim() : "");

/** Compose the resignation letter itself. */
export function buildResignationLetter({
  employeeName,
  employeeId,
  designation,
  department,
  managerName,
  companyName,
  companyAddress,
  resignationDateISO,
  schedule,
  reasonTone = "neutral",
  handoverTo,
  personalEmail,
  personalPhone,
  gratitudeNote,
}) {
  if (!schedule || schedule.error) {
    return { error: schedule?.error || "Fix the notice period inputs before drafting the letter." };
  }
  const name = clean(employeeName) || "[Your name]";
  const role = clean(designation) || "[Your designation]";
  const dept = clean(department) || "[Department]";
  const manager = clean(managerName) || "[Manager's name]";
  const company = clean(companyName) || "[Company name]";
  const address = clean(companyAddress) || "[Company address]";
  const empId = clean(employeeId) || "[Employee ID]";
  const successor = clean(handoverTo);

  const reasonLines = {
    neutral: "I have accepted an opportunity that takes my career in a direction I want to pursue.",
    growth: "I have decided to take up a role that offers the next step in my professional growth.",
    relocation: "I am relocating, which makes it impractical for me to continue in this role.",
    personal: "I am stepping away for personal reasons that I would rather keep private.",
    study: "I am returning to full-time study and will not be able to continue in this role.",
    none: "",
  };

  const resignDateLong = formatLongDate(resignationDateISO);
  const lastDayLong = formatLongDate(schedule.lastWorkingDayISO);
  const contractualLong = formatLongDate(schedule.contractualEndISO);

  const subject = `Resignation — ${name} (${empId}), last working day ${formatShortDate(schedule.lastWorkingDayISO)}`;

  const body = [
    resignDateLong,
    "",
    "To,",
    manager,
    `${company},`,
    address,
    "",
    `Subject: ${subject}`,
    "",
    `Dear ${manager},`,
    "",
    `I am writing to formally resign from my position as ${role} in the ${dept} team at ${company}, with effect from today, ${resignDateLong}.`,
    "",
    reasonLines[reasonTone] || reasonLines.neutral,
    "",
    schedule.shortened
      ? `As per my appointment letter my notice period runs to ${contractualLong}. Taking into account ${schedule.leaveAdjustDays} day(s) of accrued leave adjusted against notice and ${schedule.buyoutDays} day(s) that I am requesting to be bought out or waived, I propose ${lastDayLong} as my last working day. I will of course serve the full period if that suits the team better.`
      : `I will serve my full notice period. My last working day will therefore be ${lastDayLong}.`,
    "",
    `That leaves ${schedule.servedDays} calendar days, about ${schedule.workingDaysServed} working days, for a proper handover. My plan is:`,
    ...schedule.milestones.map(
      (phase) => `- ${formatShortDate(phase.startISO)} to ${formatShortDate(phase.endISO)}: ${phase.title.toLowerCase()} — ${phase.detail.toLowerCase()}`,
    ),
    "",
    successor
      ? `I will hand over my responsibilities to ${successor}, and I am happy to remain available for clarifications by email for a reasonable period after my last day.`
      : "I am happy to hand over to whoever you nominate, and to remain available for clarifications by email for a reasonable period after my last day.",
    "",
    clean(gratitudeNote) ||
      `I am grateful for the opportunities I have had at ${company} and for the support of this team. I have learnt a great deal here and I leave on good terms.`,
    "",
    "I would request that the full and final settlement, relieving letter and experience certificate be processed on or after my last working day. Please let me know if you need anything from me to start that process.",
    "",
    "Yours sincerely,",
    "",
    name,
    `${role}, ${dept}`,
    `Employee ID: ${empId}`,
    clean(personalEmail) ? `Personal email: ${clean(personalEmail)}` : "Personal email: [your personal email]",
    clean(personalPhone) ? `Phone: ${clean(personalPhone)}` : "Phone: [your phone number]",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  return { subject, body, wordCount: body.split(/\s+/).filter(Boolean).length };
}
