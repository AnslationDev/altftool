/**
 * Teething timeline tracker — pure logic.
 *
 * Eruption and shedding windows are the standard primary (deciduous) tooth
 * chart published by the American Dental Association and used by the American
 * Academy of Pediatric Dentistry. Each entry covers a symmetrical PAIR of
 * teeth (left and right), so ten entries describe all twenty baby teeth.
 *
 * Nothing here is dental advice — wide individual variation is normal.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Every primary tooth pair, with ADA eruption (months) and shedding (years) windows. */
export const PRIMARY_TEETH = [
  {
    id: "lower-central-incisor",
    name: "Lower central incisors",
    arch: "lower",
    count: 2,
    eruptMinMonths: 6,
    eruptMaxMonths: 10,
    shedMinYears: 6,
    shedMaxYears: 7,
  },
  {
    id: "upper-central-incisor",
    name: "Upper central incisors",
    arch: "upper",
    count: 2,
    eruptMinMonths: 8,
    eruptMaxMonths: 12,
    shedMinYears: 6,
    shedMaxYears: 7,
  },
  {
    id: "upper-lateral-incisor",
    name: "Upper lateral incisors",
    arch: "upper",
    count: 2,
    eruptMinMonths: 9,
    eruptMaxMonths: 13,
    shedMinYears: 7,
    shedMaxYears: 8,
  },
  {
    id: "lower-lateral-incisor",
    name: "Lower lateral incisors",
    arch: "lower",
    count: 2,
    eruptMinMonths: 10,
    eruptMaxMonths: 16,
    shedMinYears: 7,
    shedMaxYears: 8,
  },
  {
    id: "upper-first-molar",
    name: "Upper first molars",
    arch: "upper",
    count: 2,
    eruptMinMonths: 13,
    eruptMaxMonths: 19,
    shedMinYears: 9,
    shedMaxYears: 11,
  },
  {
    id: "lower-first-molar",
    name: "Lower first molars",
    arch: "lower",
    count: 2,
    eruptMinMonths: 14,
    eruptMaxMonths: 18,
    shedMinYears: 9,
    shedMaxYears: 11,
  },
  {
    id: "upper-canine",
    name: "Upper canines (cuspids)",
    arch: "upper",
    count: 2,
    eruptMinMonths: 16,
    eruptMaxMonths: 22,
    shedMinYears: 10,
    shedMaxYears: 12,
  },
  {
    id: "lower-canine",
    name: "Lower canines (cuspids)",
    arch: "lower",
    count: 2,
    eruptMinMonths: 17,
    eruptMaxMonths: 23,
    shedMinYears: 9,
    shedMaxYears: 12,
  },
  {
    id: "lower-second-molar",
    name: "Lower second molars",
    arch: "lower",
    count: 2,
    eruptMinMonths: 23,
    eruptMaxMonths: 31,
    shedMinYears: 10,
    shedMaxYears: 12,
  },
  {
    id: "upper-second-molar",
    name: "Upper second molars",
    arch: "upper",
    count: 2,
    eruptMinMonths: 25,
    eruptMaxMonths: 33,
    shedMinYears: 10,
    shedMaxYears: 12,
  },
];

export const TOTAL_PRIMARY_TEETH = PRIMARY_TEETH.reduce((sum, tooth) => sum + tooth.count, 0); // 20

/**
 * AAPD/ADA "age one dental visit": the first check-up should happen when the
 * first tooth appears, and no later than the first birthday.
 */
export const FIRST_VISIT_BY_MONTHS = 12;

/**
 * A tooth that has not appeared by this age is usually worth mentioning to a
 * dentist. The ADA chart ends at 33 months for the last primary tooth; delayed
 * eruption is commonly defined as no teeth at all by 18 months.
 */
export const NO_TEETH_REFERRAL_MONTHS = 18;

/** Parse "YYYY-MM-DD" into a UTC Date. Returns null when the date is not real. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Format a UTC Date back to "YYYY-MM-DD". */
export function toISODate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

/** Add whole months, clamping to the last valid day of the target month. */
export function addMonths(date, months) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(year, month + months, 1));
  const daysInTarget = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, daysInTarget)),
  );
}

/** Whole days from a to b (b - a). */
export function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

/** Completed months between two dates, plus the leftover days. */
export function ageInMonths(birth, on) {
  let months =
    (on.getUTCFullYear() - birth.getUTCFullYear()) * 12 + (on.getUTCMonth() - birth.getUTCMonth());
  if (on.getUTCDate() < birth.getUTCDate()) months -= 1;
  if (months < 0) months = 0;
  const anniversary = addMonths(birth, months);
  return { months, extraDays: daysBetween(anniversary, on) };
}

/** "1 year 4 months" style label. */
export function formatAge(months, extraDays) {
  const years = Math.floor(months / 12);
  const restMonths = months % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (restMonths > 0) parts.push(`${restMonths} month${restMonths === 1 ? "" : "s"}`);
  if (parts.length === 0) parts.push(`${Math.max(0, extraDays)} day${extraDays === 1 ? "" : "s"}`);
  return parts.join(" ");
}

/**
 * Build the full eruption timeline.
 *
 * @param {object} input
 * @param {string} input.birthDate  Child's date of birth, "YYYY-MM-DD".
 * @param {string} input.today      The date to evaluate against, "YYYY-MM-DD".
 * @param {string[]} [input.eruptedIds] Tooth-pair ids already through the gum.
 * @returns {object} timeline, or { error } for invalid input.
 */
export function buildTeethTimeline(input) {
  const { birthDate, today, eruptedIds } = input || {};

  const birth = parseISODate(birthDate);
  if (!birth) return { error: "Enter the date of birth as a real calendar date." };

  const now = parseISODate(today);
  if (!now) return { error: "Enter today's date as a real calendar date." };

  if (now.getTime() < birth.getTime()) {
    return { error: "The date of birth cannot be after today's date." };
  }

  const { months: ageMonths, extraDays } = ageInMonths(birth, now);
  if (ageMonths > 156) {
    return { error: "This chart covers the baby teeth, so it stops at 13 years of age." };
  }

  const erupted = new Set(Array.isArray(eruptedIds) ? eruptedIds : []);

  const teeth = PRIMARY_TEETH.map((tooth) => {
    const expectedFrom = addMonths(birth, tooth.eruptMinMonths);
    const expectedTo = addMonths(birth, tooth.eruptMaxMonths);
    const shedFrom = addMonths(birth, tooth.shedMinYears * 12);
    const shedTo = addMonths(birth, tooth.shedMaxYears * 12);
    const isErupted = erupted.has(tooth.id);

    let status;
    if (isErupted) status = "erupted";
    else if (now.getTime() < expectedFrom.getTime()) status = "upcoming";
    else if (now.getTime() <= expectedTo.getTime()) status = "due";
    else status = "late";

    return {
      ...tooth,
      expectedFrom: toISODate(expectedFrom),
      expectedTo: toISODate(expectedTo),
      shedFrom: toISODate(shedFrom),
      shedTo: toISODate(shedTo),
      status,
      daysToWindowStart: daysBetween(now, expectedFrom),
      daysToWindowEnd: daysBetween(now, expectedTo),
    };
  });

  const eruptedTeeth = teeth.filter((tooth) => tooth.status === "erupted");
  const eruptedCount = eruptedTeeth.reduce((sum, tooth) => sum + tooth.count, 0);
  const dueNow = teeth.filter((tooth) => tooth.status === "due");
  const late = teeth.filter((tooth) => tooth.status === "late");
  const upcoming = teeth.filter((tooth) => tooth.status === "upcoming");
  const nextTooth = dueNow[0] || upcoming[0] || null;

  const firstBirthday = addMonths(birth, FIRST_VISIT_BY_MONTHS);
  const firstToothWindowStart = addMonths(birth, PRIMARY_TEETH[0].eruptMinMonths);
  const sixMonthsAfterFirstTooth = addMonths(firstToothWindowStart, 6);
  const firstVisitBy =
    sixMonthsAfterFirstTooth.getTime() < firstBirthday.getTime()
      ? sixMonthsAfterFirstTooth
      : firstBirthday;

  const notes = [];
  if (nextTooth) {
    if (nextTooth.status === "due") {
      notes.push(
        `${nextTooth.name} are inside their usual window right now (${nextTooth.expectedFrom} to ${nextTooth.expectedTo}).`,
      );
    } else {
      notes.push(
        `${nextTooth.name} are expected next, from about ${nextTooth.expectedFrom} (${nextTooth.daysToWindowStart} days away).`,
      );
    }
  } else if (eruptedCount >= TOTAL_PRIMARY_TEETH) {
    notes.push("All 20 baby teeth are marked as erupted — the primary set is complete.");
  }
  if (late.length > 0) {
    notes.push(
      `${late.length} tooth pair${late.length === 1 ? " is" : "s are"} past the usual window. Timing varies a lot between children, but a dentist can confirm nothing is holding them back.`,
    );
  }
  if (ageMonths >= NO_TEETH_REFERRAL_MONTHS && eruptedCount === 0) {
    notes.push(
      `No teeth recorded at ${formatAge(ageMonths, extraDays)}. Most children have several teeth by 18 months, so this is worth raising with a dentist or paediatrician.`,
    );
  }
  notes.push(
    `First dental check-up: by ${toISODate(firstVisitBy)} — the ADA and AAPD advise a first visit when the first tooth appears and no later than the first birthday.`,
  );

  return {
    ageMonths,
    ageExtraDays: extraDays,
    ageLabel: formatAge(ageMonths, extraDays),
    teeth,
    eruptedCount,
    totalTeeth: TOTAL_PRIMARY_TEETH,
    remainingCount: TOTAL_PRIMARY_TEETH - eruptedCount,
    dueNowCount: dueNow.length,
    lateCount: late.length,
    nextTooth,
    firstVisitBy: toISODate(firstVisitBy),
    notes,
  };
}
