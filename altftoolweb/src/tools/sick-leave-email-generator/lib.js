/**
 * Sick Leave Email Generator — composition, return-date maths and a brevity check.
 *
 * A sick leave email has one job: tell your manager you are not working today,
 * for how long, and what happens to your work. Everything else is noise. The
 * three things a reader actually needs are (1) the dates, (2) the expected
 * return, (3) who is covering — so those are the fields the generator insists on
 * and the checklist scores against.
 *
 * Detail about symptoms is deliberately never generated. In most workplaces you
 * are not obliged to describe a medical condition to your line manager, and a
 * short factual note is both easier to write and harder to misread.
 *
 * Pure module: no React, no DOM, no Date.now(). Dates arrive as ISO strings.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** A sick note longer than this starts over-explaining. */
export const IDEAL_WORD_MIN = 45;
export const IDEAL_WORD_MAX = 110;

/** Longest absence this generator will word in a single email. */
export const MAX_SICK_DAYS = 30;

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

/** How the writer wants to sound. */
export const TONES = [
  {
    id: "plain",
    label: "Plain and factual",
    opener: "I am unwell and will not be able to work",
    closer: "I will let you know if anything changes.",
  },
  {
    id: "brief",
    label: "As short as possible",
    opener: "I am unwell and am taking sick leave",
    closer: "Thanks for understanding.",
  },
  {
    id: "warm",
    label: "Warm but professional",
    opener: "I am sorry to say I am unwell and will not be able to work",
    closer: "Thank you for your understanding — I will keep you posted.",
  },
  {
    id: "formal",
    label: "Formal",
    opener: "I regret to inform you that I am unwell and am unable to attend work",
    closer: "I shall keep you informed of any change in my condition.",
  },
];

/** How reachable the writer will be. */
export const AVAILABILITY = [
  { id: "offline", label: "Completely offline", sentence: "I will be offline and not checking messages." },
  { id: "urgent", label: "Reachable for genuine emergencies", sentence: "I will be offline, but you can reach me on my phone if something genuinely cannot wait." },
  { id: "email", label: "Checking email occasionally", sentence: "I will check email once or twice a day but will not be working otherwise." },
  { id: "partial", label: "Working reduced hours from home", sentence: "I will work reduced hours from home and will be on email for part of the day." },
];

/** Subject line styles. */
export const SUBJECT_STYLES = [
  { id: "standard", label: "Sick leave — dates" },
  { id: "outtoday", label: "Out sick today" },
  { id: "formal", label: "Application for sick leave" },
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

/** Format an ISO date as "Monday, 3 August 2026". */
export function formatLongDate(iso, { withWeekday = true } = {}) {
  const parts = parseIsoDate(iso);
  if (!parts) return "";
  const base = `${parts.day} ${MONTH_NAMES[parts.month - 1]} ${parts.year}`;
  return withWeekday ? `${WEEKDAY_NAMES[parts.weekday]}, ${base}` : base;
}

/**
 * First working day strictly after the given date, skipping Saturday and Sunday.
 * Returns { error } for an unusable date.
 */
export function nextWorkingDay(iso) {
  const parts = parseIsoDate(iso);
  if (!parts) return { error: "Enter a valid date." };
  let stamp = parts.stamp + MS_PER_DAY;
  // At most two skips are ever needed to clear a weekend.
  for (let guard = 0; guard < 7; guard += 1) {
    const weekday = new Date(stamp).getUTCDay();
    if (weekday !== 0 && weekday !== 6) break;
    stamp += MS_PER_DAY;
  }
  const next = new Date(stamp);
  const iso2 = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
  return { iso: iso2, weekday: WEEKDAY_NAMES[next.getUTCDay()], long: formatLongDate(iso2) };
}

/** Inclusive day count for the absence. */
export function countSickDays({ from, to } = {}) {
  const start = parseIsoDate(from);
  const end = parseIsoDate(to);
  if (!start) return { error: "Enter a valid first day of absence." };
  if (!end) return { error: "Enter a valid last day of absence." };
  if (end.stamp < start.stamp) return { error: "The last day cannot be before the first day." };
  const calendarDays = Math.round((end.stamp - start.stamp) / MS_PER_DAY) + 1;
  if (calendarDays > MAX_SICK_DAYS) {
    return { error: `An absence longer than ${MAX_SICK_DAYS} days needs a formal application, not a short email.` };
  }
  let workingDays = 0;
  for (let offset = 0; offset < calendarDays; offset += 1) {
    const weekday = new Date(start.stamp + offset * MS_PER_DAY).getUTCDay();
    if (weekday !== 0 && weekday !== 6) workingDays += 1;
  }
  return { calendarDays, workingDays, singleDay: calendarDays === 1 };
}

/** Score the note against the length a sick email should be. */
export function assessBrevity(wordCount) {
  const words = Number(wordCount);
  if (!Number.isFinite(words) || words < 0) {
    return { error: "Word count must be zero or more." };
  }
  if (words < IDEAL_WORD_MIN) {
    return {
      words,
      band: "Very short",
      message: `Under ${IDEAL_WORD_MIN} words. Fine if you have already spoken to your manager, but check the dates and cover are actually in there.`,
    };
  }
  if (words <= IDEAL_WORD_MAX) {
    return {
      words,
      band: "Well judged",
      message: `Between ${IDEAL_WORD_MIN} and ${IDEAL_WORD_MAX} words — long enough to answer the obvious questions and short enough to read on a phone.`,
    };
  }
  return {
    words,
    band: "Over-explaining",
    message: `Over ${IDEAL_WORD_MAX} words. Sick notes get longer when they start justifying; cut the reasons, keep the dates and the handover.`,
  };
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/** Compose the sick leave email. */
export function buildSickEmail({
  senderName = "",
  managerName = "",
  toneId = "plain",
  availabilityId = "urgent",
  subjectStyleId = "standard",
  from = "",
  to = "",
  returnDate = "",
  handover = "",
  urgentItems = "",
  contactNumber = "",
  attachCertificate = false,
  mentionDoctor = false,
} = {}) {
  const tone = TONES.find((entry) => entry.id === toneId);
  if (!tone) return { error: "Choose a tone for the email." };

  const availability = AVAILABILITY.find((entry) => entry.id === availabilityId);
  if (!availability) return { error: "Choose how reachable you will be." };

  const subjectStyle = SUBJECT_STYLES.find((entry) => entry.id === subjectStyleId);
  if (!subjectStyle) return { error: "Choose a subject line style." };

  const name = clean(senderName);
  if (!name) return { error: "Enter your name so the email can be signed." };

  const period = countSickDays({ from, to });
  if (period.error) return { error: period.error };

  const fromLong = formatLongDate(from);
  const toLong = formatLongDate(to);
  const fromShort = formatLongDate(from, { withWeekday: false });
  const toShort = formatLongDate(to, { withWeekday: false });

  const computedReturn = nextWorkingDay(to);
  const returnInfo = clean(returnDate)
    ? { iso: clean(returnDate), long: formatLongDate(clean(returnDate)) }
    : computedReturn;
  if (returnInfo.error || !returnInfo.long) {
    return { error: "Enter a valid expected return date, or leave it blank to use the next working day." };
  }

  const manager = clean(managerName);
  const greeting = manager ? `Hi ${manager},` : "Hi,";

  const subject =
    subjectStyle.id === "outtoday" && period.singleDay
      ? `Out sick today — ${name}`
      : subjectStyle.id === "formal"
        ? `Application for sick leave: ${fromShort}${period.singleDay ? "" : ` to ${toShort}`} — ${name}`
        : `Sick leave: ${fromShort}${period.singleDay ? "" : ` to ${toShort}`} — ${name}`;

  const periodPhrase = period.singleDay ? `today, ${fromLong}` : `from ${fromLong} to ${toLong}`;

  const lines = [];
  lines.push(
    `${tone.opener} ${periodPhrase}${
      mentionDoctor ? ", having been advised rest by a doctor" : ""
    }. I expect to be back at work on ${returnInfo.long}.`,
  );

  const cover = clean(handover);
  const urgent = clean(urgentItems);
  if (cover && urgent) {
    lines.push(`${cover} has agreed to cover for me. The only things that cannot wait are ${urgent}, and ${cover} has what they need for those.`);
  } else if (cover) {
    lines.push(`${cover} has agreed to cover anything urgent while I am away.`);
  } else if (urgent) {
    lines.push(`The items that cannot wait are ${urgent} — please let me know who should pick those up.`);
  } else {
    lines.push("Nothing on my plate is time-critical over this period, but let me know if you would like anything reassigned.");
  }

  const phone = clean(contactNumber);
  lines.push(availability.sentence + (phone && availabilityId !== "offline" ? ` My number is ${phone}.` : ""));

  if (attachCertificate) lines.push("A medical certificate is attached.");

  lines.push(tone.closer);

  const body = [greeting, "", lines.join("\n\n"), "", "Best regards,", name].join("\n");
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const brevity = assessBrevity(wordCount);

  const checklist = [
    { item: "Dates of absence stated", done: true },
    { item: "Expected return date", done: Boolean(returnInfo.long) },
    { item: "Cover arrangement named", done: Boolean(cover) },
    { item: "Urgent items flagged", done: Boolean(urgent) },
    { item: "How reachable you will be", done: true },
    { item: "Contact number given", done: Boolean(phone) },
    { item: "Certificate mentioned only if attached", done: true },
    { item: "No symptom detail", done: true },
    { item: "Under the readable length", done: brevity.band !== "Over-explaining" },
  ];

  return {
    subject,
    body,
    email: `Subject: ${subject}\n\n${body}`,
    period,
    returnDate: returnInfo,
    autoReturn: !clean(returnDate),
    wordCount,
    brevity,
    checklist,
    completedItems: checklist.filter((entry) => entry.done).length,
    totalItems: checklist.length,
  };
}
