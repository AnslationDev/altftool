/**
 * Mundan (chudakarana) ceremony invitation wording builder.
 *
 * What is actually computed here — nothing is guessed:
 *  1. The child's exact age on the ceremony day (years / months / days and the
 *     total day count), by calendar arithmetic from the date of birth.
 *  2. The full ritual programme, worked backwards from the muhurat. The family
 *     is normally given one moment by the priest — the moment the first lock of
 *     hair is cut. Every step before it has a duration, so the arrival time is
 *     muhurat minus the sum of those durations, and every step after it is laid
 *     out forward from there.
 *  3. The weekday of the ceremony, the days left until it, and the RSVP-by date.
 *  4. Invitation text in four styles, assembled from those values.
 *
 * Customs referenced (they are customs, not rules, and the tool says so):
 *  - Chudakarana / mundan is one of the sixteen samskaras of the Hindu life
 *    cycle, the first ritual cutting of the hair a child was born with.
 *  - Manusmriti 2.35 places chudakarma in the first or the third year, "according
 *    to the custom of the family"; from that comes the widespread preference for
 *    odd years of age — the 1st, 3rd, 5th or 7th year.
 *  - Many families avoid the child's birth month (janma maas) and fix the date
 *    with the family priest against the panchang. This tool does not compute a
 *    muhurat and does not read a panchang; you type in the muhurat you were given.
 *
 * Pure module: no React, no DOM, no network, no clock reads, no randomness.
 */

/* ------------------------------------------------------------------ dates */

const MS_PER_DAY = 86_400_000;

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

const toISO = (date) => date.toISOString().slice(0, 10);

export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(days)) return null;
  return toISO(new Date(date.getTime() + Math.round(days) * MS_PER_DAY));
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
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function weekdayName(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: "UTC" }).format(date);
}

export function formatLongDateHindi(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function weekdayNameHindi(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("hi-IN", { weekday: "long", timeZone: "UTC" }).format(date);
}

export function monthName(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", { month: "long", timeZone: "UTC" }).format(date);
}

/* ------------------------------------------------------------------ times */

/** "09:30" -> 570 minutes past midnight. Returns null for anything else. */
export function parseTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** 570 -> "9:30 AM". Minutes outside a single day are rejected. */
export function formatMinutes(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0 || minutes >= 1440) return "";
  const total = Math.round(minutes);
  const hours24 = Math.floor(total / 60);
  const mins = total % 60;
  const suffix = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${suffix}`;
}

/** 570 -> "प्रातः 9:30". Uses the Hindi day-part words an invitation card uses. */
export function formatMinutesHindi(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0 || minutes >= 1440) return "";
  const total = Math.round(minutes);
  const hours24 = Math.floor(total / 60);
  const mins = total % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  let part = "रात्रि";
  if (hours24 >= 4 && hours24 < 12) part = "प्रातः";
  else if (hours24 >= 12 && hours24 < 16) part = "दोपहर";
  else if (hours24 >= 16 && hours24 < 20) part = "सायं";
  return `${part} ${hours12}:${String(mins).padStart(2, "0")}`;
}

export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours && mins) return `${hours} hr ${mins} min`;
  if (hours) return `${hours} hr`;
  return `${mins} min`;
}

/* -------------------------------------------------------------------- age */

const daysInMonth = (year, monthIndex) => new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

/** Sanity bound: mundan wording is for a child, not an adult. */
export const MAX_CHILD_AGE_YEARS = 18;
/** Manusmriti 2.35 — chudakarma in the first or the third year. */
export const CLASSICAL_YEARS = [1, 3];
/** The odd years families most often choose. */
export const TRADITIONAL_ODD_YEARS = [1, 3, 5, 7];

/**
 * Exact age on a given day, by calendar arithmetic (borrowing days from the
 * month that precedes the ceremony month, then months from the year).
 */
export function ageOnDate(dobISO, onISO) {
  const dob = parseISODate(dobISO);
  const on = parseISODate(onISO);
  if (!dob) return { error: "Enter a valid date of birth for the child." };
  if (!on) return { error: "Enter a valid ceremony date." };

  const totalDays = Math.round((on.getTime() - dob.getTime()) / MS_PER_DAY);
  if (totalDays < 0) return { error: "The ceremony date is before the child's date of birth." };

  let years = on.getUTCFullYear() - dob.getUTCFullYear();
  let months = on.getUTCMonth() - dob.getUTCMonth();
  let days = on.getUTCDate() - dob.getUTCDate();

  if (days < 0) {
    months -= 1;
    days += daysInMonth(on.getUTCFullYear(), on.getUTCMonth() - 1);
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > MAX_CHILD_AGE_YEARS) {
    return { error: `That works out to ${years} years old — check the date of birth.` };
  }

  return { years, months, days, totalDays };
}

/** "2 years 11 months 14 days", dropping the parts that are zero. */
export function describeAge(age) {
  if (!age || age.error) return "";
  const parts = [];
  if (age.years) parts.push(`${age.years} year${age.years === 1 ? "" : "s"}`);
  if (age.months) parts.push(`${age.months} month${age.months === 1 ? "" : "s"}`);
  if (age.days) parts.push(`${age.days} day${age.days === 1 ? "" : "s"}`);
  if (!parts.length) return "0 days — the ceremony falls on the child's birthday";
  return parts.join(" ");
}

/** The same age, phrased for a Devanagari card: "2 वर्ष 11 माह". */
export function ageForInvitationHindi(age) {
  if (!age || age.error) return "";
  if (age.years >= 1) {
    return `${age.years} वर्ष${age.months ? ` ${age.months} माह` : ""}`;
  }
  const months = age.years * 12 + age.months;
  if (months >= 1) return `${months} माह`;
  return `${age.days} दिन`;
}

/** Age phrased the way an invitation does: "our two-year-old", "our 11-month-old". */
export function ageForInvitation(age) {
  if (!age || age.error) return "";
  if (age.years >= 1) {
    const rounded = age.years;
    return `${rounded} year${rounded === 1 ? "" : "s"}${age.months ? ` ${age.months} month${age.months === 1 ? "" : "s"}` : ""} old`;
  }
  const months = age.years * 12 + age.months;
  if (months >= 1) return `${months} month${months === 1 ? "" : "s"} old`;
  return `${age.days} day${age.days === 1 ? "" : "s"} old`;
}

/**
 * Custom notes about when the ceremony falls. These are observations about
 * family custom, never presented as a rule and never a computed "score".
 */
export function customNotes(dobISO, ceremonyISO, age) {
  if (!age || age.error) return [];
  const notes = [];
  const runningYear = age.years + 1; // a child aged 2 is in the third year of life

  if (CLASSICAL_YEARS.includes(runningYear)) {
    notes.push(
      `The child is in the ${ordinal(runningYear)} year of life on the ceremony day — the window Manusmriti 2.35 names for chudakarma, "in the first or the third year, according to family custom".`,
    );
  } else if (TRADITIONAL_ODD_YEARS.includes(runningYear)) {
    notes.push(
      `The child is in the ${ordinal(runningYear)} year of life — an odd running year, which is the preference most families follow.`,
    );
  } else {
    notes.push(
      `The child is in the ${ordinal(runningYear)} year of life, an even running year. Many families prefer an odd running year (1st, 3rd, 5th or 7th); plenty do not. Ask your family priest.`,
    );
  }

  if (age.years === 0 && age.totalDays < 366) {
    notes.push(
      "The child is under one year old on the ceremony day. Some communities do mundan in the first year and some wait for the first birthday — this is purely family practice.",
    );
  }

  const dob = parseISODate(dobISO);
  const ceremony = parseISODate(ceremonyISO);
  if (dob && ceremony && dob.getUTCMonth() === ceremony.getUTCMonth()) {
    notes.push(
      `The ceremony falls in ${monthName(ceremonyISO)}, the same calendar month as the child's birth. Several families avoid the birth month (janma maas) for mundan — confirm with your priest.`,
    );
  }

  return notes;
}

export function ordinal(n) {
  const num = Math.round(Number(n) || 0);
  const tens = num % 100;
  if (tens >= 11 && tens <= 13) return `${num}th`;
  const ones = num % 10;
  if (ones === 1) return `${num}st`;
  if (ones === 2) return `${num}nd`;
  if (ones === 3) return `${num}rd`;
  return `${num}th`;
}

/* --------------------------------------------------------------- programme */

/**
 * The default running order. `anchor: true` marks the step that has to land on
 * the muhurat — the first lock of hair. Everything above it is scheduled
 * backwards from the muhurat, everything below it forwards.
 */
export const RITUAL_STEPS = [
  { id: "welcome", label: "Guests arrive, tilak and welcome", hindi: "अतिथि आगमन एवं स्वागत", minutes: 30 },
  { id: "ganesh", label: "Ganesh puja and sankalp", hindi: "गणेश पूजन एवं संकल्प", minutes: 20 },
  { id: "kalash", label: "Kalash sthapana and navagraha puja", hindi: "कलश स्थापना एवं नवग्रह पूजन", minutes: 15 },
  { id: "havan", label: "Havan", hindi: "हवन", minutes: 30 },
  { id: "mundan", label: "Mundan — first lock cut by the mama", hindi: "मुंडन संस्कार — प्रथम केश कर्तन", minutes: 30, anchor: true },
  { id: "snan", label: "Snan and change into new clothes", hindi: "स्नान एवं नवीन वस्त्र धारण", minutes: 20 },
  { id: "aarti", label: "Aarti and prasad", hindi: "आरती एवं प्रसाद", minutes: 15 },
  { id: "ashirwad", label: "Ashirwad and photographs", hindi: "आशीर्वाद एवं छायाचित्र", minutes: 30 },
  { id: "bhoj", label: "Bhoj (meal)", hindi: "भोज", minutes: 60 },
];

export const MAX_STEP_MINUTES = 480;

/**
 * Lay the programme out around the muhurat.
 * Returns { rows, arrivalMinutes, endMinutes, totalMinutes } or { error }.
 */
export function buildProgramme({ muhuratTime, durations = {} }) {
  const muhurat = parseTimeToMinutes(muhuratTime);
  if (muhurat === null) return { error: "Enter the muhurat time as HH:MM, for example 10:45." };

  const steps = RITUAL_STEPS.map((step) => {
    const raw = durations[step.id];
    const value = raw === undefined || raw === "" ? step.minutes : Number(raw);
    return { ...step, minutes: value };
  });

  for (const step of steps) {
    if (!Number.isFinite(step.minutes) || step.minutes < 0 || step.minutes > MAX_STEP_MINUTES) {
      return { error: `"${step.label}" needs a length between 0 and ${MAX_STEP_MINUTES} minutes.` };
    }
  }

  const anchorIndex = steps.findIndex((step) => step.anchor);
  const beforeAnchor = steps.slice(0, anchorIndex).reduce((sum, step) => sum + Math.round(step.minutes), 0);
  const arrivalMinutes = muhurat - beforeAnchor;

  if (arrivalMinutes < 0) {
    return {
      error: `The steps before the mundan add up to ${formatDuration(beforeAnchor)}, which puts the arrival time before midnight. Shorten them or pick a later muhurat.`,
    };
  }

  const rows = [];
  let cursor = arrivalMinutes;
  for (const step of steps) {
    const minutes = Math.round(step.minutes);
    const start = cursor;
    const end = cursor + minutes;
    if (end > 1439) {
      return {
        error: `The programme runs past midnight at "${step.label}". Shorten a step or move the muhurat earlier.`,
      };
    }
    rows.push({
      id: step.id,
      label: step.label,
      hindi: step.hindi,
      anchor: Boolean(step.anchor),
      minutes,
      startMinutes: start,
      endMinutes: end,
      start: formatMinutes(start),
      end: formatMinutes(end),
    });
    cursor = end;
  }

  return {
    rows,
    arrivalMinutes,
    endMinutes: cursor,
    totalMinutes: cursor - arrivalMinutes,
    muhuratMinutes: muhurat,
  };
}

/* -------------------------------------------------------------- assessment */

export const MAX_LEAD_DAYS = 730;

/** Everything numeric the invitation needs, in one deterministic object. */
export function assessCeremony({ dobISO, ceremonyISO, inviteDateISO, muhuratTime, rsvpLeadDays, durations }) {
  const age = ageOnDate(dobISO, ceremonyISO);
  if (age.error) return { error: age.error };

  const programme = buildProgramme({ muhuratTime, durations });
  if (programme.error) return { error: programme.error };

  let daysUntil = null;
  let rsvpByISO = null;
  if (parseISODate(inviteDateISO)) {
    daysUntil = daysBetweenISO(inviteDateISO, ceremonyISO);
    if (daysUntil > MAX_LEAD_DAYS) {
      return { error: "The ceremony is more than two years after the invitation date — check the dates." };
    }
    const lead = Math.round(Number(rsvpLeadDays));
    if (!Number.isFinite(lead) || lead < 0 || lead > 90) {
      return { error: "RSVP lead time must be between 0 and 90 days." };
    }
    rsvpByISO = addDaysISO(ceremonyISO, -lead);
    if (daysUntil >= 0 && lead > daysUntil) {
      rsvpByISO = inviteDateISO;
    }
  }

  return {
    age,
    ageText: describeAge(age),
    ageInvitationText: ageForInvitation(age),
    ageInvitationTextHindi: ageForInvitationHindi(age),
    programme,
    weekday: weekdayName(ceremonyISO),
    ceremonyLong: formatLongDate(ceremonyISO),
    daysUntil,
    rsvpByISO,
    notes: customNotes(dobISO, ceremonyISO, age),
  };
}

/* ------------------------------------------------------------- invitations */

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const or = (value, fallback) => clean(value) || fallback;

export const INVITE_STYLES = [
  { id: "english-formal", label: "English — formal card" },
  { id: "english-warm", label: "English — warm and personal" },
  { id: "hindi", label: "Hindi (Devanagari)" },
  { id: "whatsapp", label: "Short WhatsApp / SMS message" },
];

function venueBlock(venueName, venueAddress) {
  return [or(venueName, "[Venue name]"), clean(venueAddress)].filter(Boolean);
}

function programmeLines(programme, useHindi) {
  return programme.rows.map((row) =>
    useHindi
      ? `${formatMinutesHindi(row.startMinutes)} — ${row.hindi}`
      : `${row.start} — ${row.label}`,
  );
}

/**
 * Build the invitation text. Every date, time and age in the output comes from
 * `assessment`; nothing here recomputes or rounds anything.
 */
export function buildInvitation({
  style,
  childName,
  parentNames,
  grandparentNames,
  venueName,
  venueAddress,
  ceremonyISO,
  rsvpName,
  rsvpPhone,
  assessment,
}) {
  if (!assessment || assessment.error) {
    return { error: assessment?.error || "Fix the dates and the muhurat before drafting the invitation." };
  }

  const child = or(childName, "[Child's name]");
  const parents = or(parentNames, "[Parents' names]");
  const grandparents = clean(grandparentNames);
  const venue = venueBlock(venueName, venueAddress);
  const rsvp = clean(rsvpName) || clean(rsvpPhone)
    ? `RSVP: ${[clean(rsvpName), clean(rsvpPhone)].filter(Boolean).join(" — ")}`
    : "RSVP: [name and phone number]";
  const rsvpBy = assessment.rsvpByISO ? `Kindly confirm by ${formatLongDate(assessment.rsvpByISO)}.` : "";
  const dateLine = `${assessment.weekday}, ${assessment.ceremonyLong}`;
  const muhurat = formatMinutes(assessment.programme.muhuratMinutes);
  const arrival = formatMinutes(assessment.programme.arrivalMinutes);
  const closing = formatMinutes(assessment.programme.endMinutes);
  const ageLine = assessment.ageInvitationText;

  let lines = [];
  const chosen = INVITE_STYLES.some((item) => item.id === style) ? style : INVITE_STYLES[0].id;

  if (chosen === "english-formal") {
    lines = [
      "|| Shree Ganeshaya Namah ||",
      "",
      `${parents}`,
      grandparents ? `together with ${grandparents}` : "",
      "request the pleasure of your company at the",
      "MUNDAN SANSKAR (Chudakarana)",
      `of their beloved child ${child}`,
      `who will be ${ageLine} on the day of the ceremony,`,
      "",
      `on ${dateLine}`,
      `Mundan muhurat: ${muhurat}`,
      `Please be seated by ${arrival}`,
      "",
      "Venue:",
      ...venue,
      "",
      "Programme:",
      ...programmeLines(assessment.programme, false),
      "",
      `The gathering closes at about ${closing}.`,
      "",
      "Your blessings on this occasion will mean the world to us.",
      "",
      rsvp,
      rsvpBy,
    ];
  } else if (chosen === "english-warm") {
    lines = [
      `Our little ${child} will be ${ageLine} this ${assessment.weekday}, and it is time for the first haircut.`,
      "",
      `We are holding ${child}'s mundan sanskar on ${dateLine}. The priest has given us ${muhurat} for the first lock, so do try to be with us by ${arrival} — the puja starts before that and we would love you there for all of it.`,
      "",
      "Where:",
      ...venue,
      "",
      "How the morning will run:",
      ...programmeLines(assessment.programme, false).map((line) => `  ${line}`),
      "",
      `We should be done around ${closing}, after the bhoj.`,
      "",
      grandparents ? `${grandparents} will be there, and they are looking forward to seeing everyone.` : "",
      "No gifts please — just come and bless the child.",
      "",
      `With love,`,
      parents,
      "",
      rsvp,
      rsvpBy,
    ];
  } else if (chosen === "hindi") {
    lines = [
      "॥ श्री गणेशाय नमः ॥",
      "",
      "सादर निमंत्रण",
      "",
      `${parents}`,
      grandparents ? `एवं ${grandparents}` : "",
      `की ओर से — हमारे प्रिय ${child} के मुंडन संस्कार (चूड़ाकर्म) के शुभ अवसर पर आपकी उपस्थिति सादर प्रार्थनीय है।`,
      "",
      `दिनांक: ${formatLongDateHindi(ceremonyISO)} (${weekdayNameHindi(ceremonyISO)})`,
      `मुंडन मुहूर्त: ${formatMinutesHindi(assessment.programme.muhuratMinutes)}`,
      `कृपया ${formatMinutesHindi(assessment.programme.arrivalMinutes)} तक पधारें।`,
      `संस्कार के दिन बालक/बालिका की आयु: ${ageForInvitationHindi(assessment.age)}`,
      "",
      "स्थान:",
      ...venue,
      "",
      "कार्यक्रम:",
      ...programmeLines(assessment.programme, true),
      "",
      `कार्यक्रम लगभग ${formatMinutesHindi(assessment.programme.endMinutes)} तक चलेगा।`,
      "",
      "आपके आशीर्वाद की प्रतीक्षा में।",
      "",
      rsvp,
      assessment.rsvpByISO ? `कृपया ${formatLongDateHindi(assessment.rsvpByISO)} तक सूचित करें।` : "",
    ];
  } else {
    lines = [
      `Mundan sanskar of ${child} (${ageLine} on the day)`,
      `${dateLine}`,
      `Muhurat ${muhurat} · please arrive by ${arrival}`,
      venue.join(", "),
      `Programme: ${assessment.programme.rows[0].start} arrival, ${muhurat} mundan, ${assessment.programme.rows[assessment.programme.rows.length - 1].start} bhoj.`,
      `${parents} would be so happy to have you there.`,
      rsvp,
      rsvpBy,
    ];
  }

  const body = lines
    .filter((line) => line !== null && line !== undefined)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    style: chosen,
    body,
    lineCount: body.split("\n").length,
    wordCount: body.split(/\s+/).filter(Boolean).length,
    characterCount: body.length,
  };
}
