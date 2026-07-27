/**
 * Release train scheduling.
 *
 * The "release train" model — releases leave on a fixed calendar cadence and
 * features catch the next train rather than delaying it — is the practice used
 * by Chromium/Firefox (4-week trains), Kubernetes (three releases a year) and
 * SAFe's Agile Release Train. Each cycle has three milestones:
 *   code freeze → release candidate (RC) cut → general availability (GA).
 * All date maths here is pure UTC arithmetic on ISO "YYYY-MM-DD" strings.
 */

const MS_PER_DAY = 86400000;

/** Practical bounds. A 1-week train is the fastest common cadence; 26 weeks ≈ two trains a year. */
export const MIN_CADENCE_WEEKS = 1;
export const MAX_CADENCE_WEEKS = 26;
export const MIN_RELEASES = 1;
export const MAX_RELEASES = 24;
/** Lead-time bounds: freeze more than 90 days out stops being a "train" and becomes a waterfall. */
export const MAX_LEAD_DAYS = 90;

export const DAYS_PER_WEEK = 7;

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SATURDAY = 6;
const SUNDAY = 0;

export function parseIsoDate(iso) {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

export function toIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function weekdayName(ms) {
  return WEEKDAYS[new Date(ms).getUTCDay()];
}

/**
 * Shift a date backwards off the weekend: Saturday → Friday, Sunday → Friday.
 * Ship days are moved EARLIER, never later, so the cadence date is a deadline.
 */
export function shiftOffWeekend(ms) {
  const day = new Date(ms).getUTCDay();
  if (day === SATURDAY) return ms - 1 * MS_PER_DAY;
  if (day === SUNDAY) return ms - 2 * MS_PER_DAY;
  return ms;
}

/**
 * Build the full train schedule.
 *
 * @param {object} input
 * @param {string} input.firstGaDate        ISO date of the first GA.
 * @param {number} input.cadenceWeeks       Weeks between GA dates.
 * @param {number} input.releaseCount       How many releases to plan.
 * @param {number} input.codeFreezeLeadDays Days before GA that the branch freezes.
 * @param {number} input.rcLeadDays         Days before GA that the first RC is cut.
 * @param {boolean} input.avoidWeekends     Shift any weekend milestone back to Friday.
 * @param {string} [input.versionPrefix]    Optional version stem, e.g. "v2." → v2.0, v2.1…
 * @returns {{error:string}|{releases:Array, cadenceDays:number, stabilisationDays:number}}
 */
export function planReleaseTrain({
  firstGaDate,
  cadenceWeeks,
  releaseCount,
  codeFreezeLeadDays,
  rcLeadDays,
  avoidWeekends = true,
  versionPrefix = "",
}) {
  const firstGa = parseIsoDate(firstGaDate);
  if (firstGa === null) return { error: "Enter a valid first GA date in YYYY-MM-DD form." };

  const cadence = Number(cadenceWeeks);
  const count = Number(releaseCount);
  const freezeLead = Number(codeFreezeLeadDays);
  const rcLead = Number(rcLeadDays);

  if (!Number.isInteger(cadence) || cadence < MIN_CADENCE_WEEKS || cadence > MAX_CADENCE_WEEKS) {
    return { error: `Cadence must be a whole number of weeks between ${MIN_CADENCE_WEEKS} and ${MAX_CADENCE_WEEKS}.` };
  }
  if (!Number.isInteger(count) || count < MIN_RELEASES || count > MAX_RELEASES) {
    return { error: `Plan between ${MIN_RELEASES} and ${MAX_RELEASES} releases.` };
  }
  if (!Number.isInteger(freezeLead) || freezeLead < 0 || freezeLead > MAX_LEAD_DAYS) {
    return { error: `Code freeze lead must be between 0 and ${MAX_LEAD_DAYS} days before GA.` };
  }
  if (!Number.isInteger(rcLead) || rcLead < 0 || rcLead > MAX_LEAD_DAYS) {
    return { error: `RC lead must be between 0 and ${MAX_LEAD_DAYS} days before GA.` };
  }
  if (rcLead > freezeLead) {
    return { error: "The RC is cut from the frozen branch, so RC lead days cannot exceed code freeze lead days." };
  }
  if (freezeLead >= cadence * DAYS_PER_WEEK) {
    return {
      error: "Code freeze lead is as long as the whole cadence — each freeze would start before the previous GA. Shorten the lead or lengthen the cadence.",
    };
  }

  const releases = [];
  for (let index = 0; index < count; index += 1) {
    const nominalGa = firstGa + index * cadence * DAYS_PER_WEEK * MS_PER_DAY;
    const ga = avoidWeekends ? shiftOffWeekend(nominalGa) : nominalGa;
    // Leads are measured from the NOMINAL cadence date so trains stay evenly spaced.
    const nominalFreeze = nominalGa - freezeLead * MS_PER_DAY;
    const nominalRc = nominalGa - rcLead * MS_PER_DAY;
    const freeze = avoidWeekends ? shiftOffWeekend(nominalFreeze) : nominalFreeze;
    const rc = avoidWeekends ? shiftOffWeekend(nominalRc) : nominalRc;

    releases.push({
      index: index + 1,
      version: versionPrefix ? `${versionPrefix}${index}` : `Release ${index + 1}`,
      codeFreeze: toIsoDate(freeze),
      codeFreezeDay: weekdayName(freeze),
      rcCut: toIsoDate(rc),
      rcCutDay: weekdayName(rc),
      ga: toIsoDate(ga),
      gaDay: weekdayName(ga),
    });
  }

  return {
    releases,
    cadenceDays: cadence * DAYS_PER_WEEK,
    // Days between freeze and GA — the stabilisation/hardening window.
    stabilisationDays: freezeLead,
    rcToGaDays: rcLead,
  };
}
