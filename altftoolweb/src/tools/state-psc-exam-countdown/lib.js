/**
 * State PSC exam countdown.
 *
 * Every State Public Service Commission runs its combined civil services
 * examination in the same three stages the UPSC uses: a screening Preliminary
 * test, a written Main examination, and a Personality Test / Interview. This
 * module does the calendar arithmetic between "today" and those three dates —
 * days left, weeks left, the gap between stages, and how many study hours the
 * remaining days actually contain at a chosen daily study rate.
 *
 * All functions are pure: the current date is always passed in as an argument
 * so the same inputs always give the same output.
 */

/**
 * State Public Service Commissions and the combined examination each one runs.
 * Names and abbreviations only — no exam dates are hard-coded here, because
 * every commission announces its calendar afresh each cycle and a stale date
 * would be worse than no date. Take the dates from the commission's own
 * notification or annual calendar and type them in.
 */
export const STATE_COMMISSIONS = [
  { id: "uppsc", abbr: "UPPSC", name: "Uttar Pradesh Public Service Commission", state: "Uttar Pradesh", exam: "UP PCS (Combined State / Upper Subordinate Services)", site: "uppsc.up.nic.in" },
  { id: "bpsc", abbr: "BPSC", name: "Bihar Public Service Commission", state: "Bihar", exam: "Bihar Integrated Combined Competitive Examination", site: "bpsc.bihar.gov.in" },
  { id: "mppsc", abbr: "MPPSC", name: "Madhya Pradesh Public Service Commission", state: "Madhya Pradesh", exam: "MP State Service Examination", site: "mppsc.mp.gov.in" },
  { id: "rpsc", abbr: "RPSC", name: "Rajasthan Public Service Commission", state: "Rajasthan", exam: "RAS / RTS Combined Competitive Examination", site: "rpsc.rajasthan.gov.in" },
  { id: "mpsc", abbr: "MPSC", name: "Maharashtra Public Service Commission", state: "Maharashtra", exam: "Maharashtra Civil Services (Rajyaseva) Examination", site: "mpsc.gov.in" },
  { id: "tnpsc", abbr: "TNPSC", name: "Tamil Nadu Public Service Commission", state: "Tamil Nadu", exam: "Combined Civil Services Examination I (Group I)", site: "tnpsc.gov.in" },
  { id: "kpsc-ka", abbr: "KPSC", name: "Karnataka Public Service Commission", state: "Karnataka", exam: "Karnataka Gazetted Probationers (KAS) Examination", site: "kpsc.kar.nic.in" },
  { id: "kerala-psc", abbr: "Kerala PSC", name: "Kerala Public Service Commission", state: "Kerala", exam: "Kerala Administrative Service Examination", site: "keralapsc.gov.in" },
  { id: "wbpsc", abbr: "WBPSC", name: "West Bengal Public Service Commission", state: "West Bengal", exam: "WBCS (Executive) Examination", site: "wbpsc.gov.in" },
  { id: "appsc", abbr: "APPSC", name: "Andhra Pradesh Public Service Commission", state: "Andhra Pradesh", exam: "AP Group I Services Examination", site: "psc.ap.gov.in" },
  { id: "tgpsc", abbr: "TGPSC", name: "Telangana Public Service Commission", state: "Telangana", exam: "Telangana Group I Services Examination", site: "tspsc.gov.in" },
  { id: "gpsc", abbr: "GPSC", name: "Gujarat Public Service Commission", state: "Gujarat", exam: "Gujarat State Civil Services Class 1 and 2 Examination", site: "gpsc.gujarat.gov.in" },
  { id: "hpsc", abbr: "HPSC", name: "Haryana Public Service Commission", state: "Haryana", exam: "Haryana Civil Services (Executive Branch) Examination", site: "hpsc.gov.in" },
  { id: "ppsc", abbr: "PPSC", name: "Punjab Public Service Commission", state: "Punjab", exam: "Punjab Civil Services (Combined) Examination", site: "ppsc.gov.in" },
  { id: "opsc", abbr: "OPSC", name: "Odisha Public Service Commission", state: "Odisha", exam: "Odisha Civil Services Examination", site: "opsc.gov.in" },
  { id: "cgpsc", abbr: "CGPSC", name: "Chhattisgarh Public Service Commission", state: "Chhattisgarh", exam: "Chhattisgarh State Service Examination", site: "psc.cg.gov.in" },
  { id: "jpsc", abbr: "JPSC", name: "Jharkhand Public Service Commission", state: "Jharkhand", exam: "Jharkhand Combined Civil Services Examination", site: "jpsc.gov.in" },
  { id: "ukpsc", abbr: "UKPSC", name: "Uttarakhand Public Service Commission", state: "Uttarakhand", exam: "Uttarakhand Combined State Civil Services Examination", site: "psc.uk.gov.in" },
  { id: "hppsc", abbr: "HPPSC", name: "Himachal Pradesh Public Service Commission", state: "Himachal Pradesh", exam: "HP Administrative Services Combined Competitive Examination", site: "hppsc.hp.gov.in" },
  { id: "apsc", abbr: "APSC", name: "Assam Public Service Commission", state: "Assam", exam: "Combined Competitive Examination (Assam Civil Services)", site: "apsc.nic.in" },
  { id: "jkpsc", abbr: "JKPSC", name: "Jammu and Kashmir Public Service Commission", state: "Jammu and Kashmir", exam: "J&K Combined Competitive Examination", site: "jkpsc.nic.in" },
  { id: "other", abbr: "Other", name: "Another state commission", state: "", exam: "State combined competitive examination", site: "" },
];

/** Milliseconds in one day. Dates are compared at UTC midnight so daylight
 *  saving and local time zones cannot shift a count by a day. */
const MS_PER_DAY = 86400000;

/** Days in a week — used only to express a countdown in weeks. */
const DAYS_PER_WEEK = 7;

/** A day cannot hold more than 24 hours of study; the input is capped here. */
export const MAX_STUDY_HOURS_PER_DAY = 18;

/**
 * Planning split for the time left before an exam. This is a preparation
 * heuristic, not a rule from any commission: finish first reading, then
 * revise, then keep the last stretch for full-length mock tests and
 * previous-year papers. Adjust it to your own method.
 */
export const PREP_PHASES = [
  { key: "foundation", label: "First reading and note-making", share: 0.5 },
  { key: "revision", label: "Revision and answer writing", share: 0.3 },
  { key: "mocks", label: "Full-length mocks and previous papers", share: 0.2 },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse a YYYY-MM-DD string to UTC-midnight milliseconds, or NaN. */
function toUtcMs(iso) {
  if (typeof iso !== "string" || !ISO_DATE.test(iso)) return NaN;
  const [y, m, d] = iso.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d);
  const back = new Date(ms);
  // Rejects impossible dates such as 2026-02-31 that Date.UTC would roll over.
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) {
    return NaN;
  }
  return ms;
}

/** Format UTC-midnight milliseconds back to YYYY-MM-DD. */
function toIso(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Whole days from one calendar date to another. Positive when `toIso` is in
 * the future. Returns null when either date is unparseable.
 */
export function daysBetween(fromIso, toIsoDate) {
  const a = toUtcMs(fromIso);
  const b = toUtcMs(toIsoDate);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

/** Add a whole number of days to a YYYY-MM-DD date. */
export function addDays(iso, days) {
  const ms = toUtcMs(iso);
  if (Number.isNaN(ms) || !Number.isFinite(days)) return null;
  return toIso(ms + Math.round(days) * MS_PER_DAY);
}

function stageFrom(todayIso, label, dateIso, hoursPerDay) {
  if (!dateIso) return { label, dateIso: "", set: false };
  const days = daysBetween(todayIso, dateIso);
  if (days === null) return { label, dateIso, set: true, invalid: true };
  const status = days > 0 ? "upcoming" : days === 0 ? "today" : "past";
  return {
    label,
    dateIso,
    set: true,
    invalid: false,
    days,
    daysLeft: Math.max(0, days),
    weeksLeft: Math.max(0, days) / DAYS_PER_WEEK,
    status,
    studyHours: Math.max(0, days) * hoursPerDay,
  };
}

/**
 * Countdown to the three stages of a State PSC examination.
 *
 * @param {object} input
 * @param {string} input.todayIso        Reference date, YYYY-MM-DD.
 * @param {string} input.prelimsIso      Preliminary exam date, YYYY-MM-DD.
 * @param {string} [input.mainsIso]      Main exam date, optional.
 * @param {string} [input.interviewIso]  Interview / personality test date, optional.
 * @param {number} [input.studyHoursPerDay] Hours of study you can put in each day.
 * @returns {object} countdown, or { error }
 */
export function buildCountdown({
  todayIso,
  prelimsIso,
  mainsIso = "",
  interviewIso = "",
  studyHoursPerDay = 0,
}) {
  if (Number.isNaN(toUtcMs(todayIso))) {
    return { error: "Today's date is not a valid calendar date." };
  }
  if (!prelimsIso) {
    return { error: "Enter at least the preliminary exam date to start the countdown." };
  }
  if (Number.isNaN(toUtcMs(prelimsIso))) {
    return { error: "The preliminary exam date is not a valid calendar date." };
  }
  if (mainsIso && Number.isNaN(toUtcMs(mainsIso))) {
    return { error: "The main exam date is not a valid calendar date." };
  }
  if (interviewIso && Number.isNaN(toUtcMs(interviewIso))) {
    return { error: "The interview date is not a valid calendar date." };
  }

  const hours = Number(studyHoursPerDay);
  if (!Number.isFinite(hours) || hours < 0) {
    return { error: "Study hours per day must be zero or more." };
  }
  if (hours > MAX_STUDY_HOURS_PER_DAY) {
    return { error: `Study hours per day cannot be more than ${MAX_STUDY_HOURS_PER_DAY}.` };
  }

  const prelimsToMains = mainsIso ? daysBetween(prelimsIso, mainsIso) : null;
  if (prelimsToMains !== null && prelimsToMains < 0) {
    return { error: "The main exam date cannot fall before the preliminary exam date." };
  }
  const mainsToInterview = mainsIso && interviewIso ? daysBetween(mainsIso, interviewIso) : null;
  if (mainsToInterview !== null && mainsToInterview < 0) {
    return { error: "The interview date cannot fall before the main exam date." };
  }

  const stages = [
    stageFrom(todayIso, "Preliminary examination", prelimsIso, hours),
    stageFrom(todayIso, "Main examination", mainsIso, hours),
    stageFrom(todayIso, "Interview / personality test", interviewIso, hours),
  ].filter((stage) => stage.set);

  const next = stages.find((stage) => stage.days >= 0) || null;
  const last = stages[stages.length - 1];

  return {
    stages,
    next,
    prelimsToMains,
    mainsToInterview,
    totalDaysToLastStage: last ? last.days : null,
    studyHoursPerDay: hours,
  };
}

/**
 * Split the time between today and a target date into the three preparation
 * phases in PREP_PHASES. Returns the end date and the number of days and
 * study hours each phase gets.
 *
 * @returns {object} { totalDays, phases: [...] } or { error }
 */
export function buildStudyPlan({ todayIso, targetIso, studyHoursPerDay = 0 }) {
  const totalDays = daysBetween(todayIso, targetIso);
  if (totalDays === null) return { error: "Enter valid dates to build a study plan." };
  if (totalDays <= 0) {
    return { error: "The target date has already passed, so there is no time left to plan." };
  }
  const hours = Number(studyHoursPerDay);
  if (!Number.isFinite(hours) || hours < 0) {
    return { error: "Study hours per day must be zero or more." };
  }

  let consumed = 0;
  const phases = PREP_PHASES.map((phase, index) => {
    // The last phase absorbs the rounding remainder so the days always add up.
    const days =
      index === PREP_PHASES.length - 1
        ? totalDays - consumed
        : Math.max(1, Math.round(totalDays * phase.share));
    consumed += days;
    return {
      key: phase.key,
      label: phase.label,
      days: Math.max(0, days),
      hours: Math.max(0, days) * hours,
      endsOn: addDays(todayIso, Math.min(totalDays, consumed)),
    };
  });

  return { totalDays, totalHours: totalDays * hours, phases };
}

export function commissionById(id) {
  return STATE_COMMISSIONS.find((item) => item.id === id) || null;
}
