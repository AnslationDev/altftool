/**
 * Hair length tracking and growth-rate maths.
 *
 * Reference figures used for the comparison bands:
 *  - Scalp hair grows roughly 6 inches (about 15 cm) a year, which is about
 *    0.5 inch or 1.27 cm a month (American Academy of Dermatology). Expressed
 *    per day this is about 0.35 mm.
 *  - Individual variation is wide; 1.0 to 1.5 cm a month covers most adults,
 *    and rate is influenced by genetics, age, hormones, nutrition and illness
 *    far more than by any topical product.
 *  - About 85-90% of scalp follicles are in the growing (anagen) phase at any
 *    time, and anagen lasts roughly 2-7 years. Maximum achievable length is set
 *    mainly by how long your anagen phase runs, which is why some people cannot
 *    grow past a certain length however long they wait.
 *
 * A measured length only reflects growth if trims are added back, so every
 * entry can record how much was cut off since the previous measurement.
 */

/** Mean length of a calendar month in days (365.25 / 12). */
export const DAYS_PER_MONTH = 30.4375;

/** AAD reference: about 15 cm of scalp growth per year. */
export const REFERENCE_CM_PER_YEAR = 15;

/** The same reference expressed per month. */
export const REFERENCE_CM_PER_MONTH = REFERENCE_CM_PER_YEAR / 12;

/** Band covering most adults, cm per month. */
export const TYPICAL_MIN_CM_PER_MONTH = 1.0;
export const TYPICAL_MAX_CM_PER_MONTH = 1.5;

/**
 * Shortest span over which a rate is worth quoting. Below this, a 2-3 mm
 * measurement error is a large fraction of the growth being measured.
 */
export const MIN_RELIABLE_DAYS = 30;

/** Sanity limits on a single measurement, in centimetres. */
export const MAX_LENGTH_CM = 300;

/** Milliseconds in a day. */
export const MS_PER_DAY = 86400000;

/** Parse "YYYY-MM-DD" into epoch milliseconds at local midnight, or null. */
export function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const [, y, mo, d] = match.map(Number);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date.getTime();
}

/** Format epoch milliseconds as "12 Aug 2026". */
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });
export function formatDate(ms) {
  if (!Number.isFinite(ms)) return "—";
  return DATE_FORMAT.format(new Date(ms));
}

/** Add whole days to an epoch-millisecond timestamp. */
export function addDays(ms, days) {
  if (!Number.isFinite(ms) || !Number.isFinite(days)) return NaN;
  return ms + Math.round(days) * MS_PER_DAY;
}

/** Descriptive band for a growth rate in cm per month. */
export function rateBand(cmPerMonth) {
  if (!Number.isFinite(cmPerMonth)) return { label: "Unknown", note: "" };
  if (cmPerMonth < 0) {
    return {
      label: "Length lost",
      note: "You are shorter than at the start. Check that every trim has been entered, and consider breakage rather than growth.",
    };
  }
  if (cmPerMonth < 0.8) {
    return {
      label: "Below typical",
      note: "Under 0.8 cm a month. Breakage at the ends often reads as slow growth — check the mid-lengths, not just the tips.",
    };
  }
  if (cmPerMonth < TYPICAL_MIN_CM_PER_MONTH) {
    return { label: "Slightly below typical", note: "Just under the 1.0-1.5 cm a month band most adults fall into." };
  }
  if (cmPerMonth <= TYPICAL_MAX_CM_PER_MONTH) {
    return { label: "Typical", note: "Within the 1.0-1.5 cm a month band, close to the 1.25 cm monthly reference." };
  }
  return { label: "Above typical", note: "Above 1.5 cm a month. Double-check the measuring method — measure dry, from the same start point every time." };
}

/**
 * Analyse a list of dated length measurements.
 *
 * @param {object} input
 * @param {Array<{date:string,lengthCm:number,trimmedCm:number}>} input.entries
 *        Measurements. `trimmedCm` is how much was cut off since the PREVIOUS
 *        entry (0 on the first entry).
 * @param {number} [input.targetCm] Optional target length for the projection.
 * @returns {object|{error:string}}
 */
export function analyseHairGrowth(input) {
  const { entries, targetCm } = input || {};

  if (!Array.isArray(entries) || entries.length < 2) {
    return { error: "Add at least two dated measurements to calculate a growth rate." };
  }

  const parsed = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index] || {};
    const ms = parseDate(entry.date);
    if (ms === null) return { error: `Measurement ${index + 1} needs a valid date.` };

    const lengthCm = Number(entry.lengthCm);
    if (!Number.isFinite(lengthCm)) return { error: `Measurement ${index + 1} needs a length in centimetres.` };
    if (lengthCm < 0) return { error: "Length cannot be negative." };
    if (lengthCm > MAX_LENGTH_CM) return { error: `Length must be ${MAX_LENGTH_CM} cm or less.` };

    const trimmedCm = index === 0 ? 0 : Number(entry.trimmedCm ?? 0);
    if (!Number.isFinite(trimmedCm)) return { error: `Trim amount for measurement ${index + 1} must be a number.` };
    if (trimmedCm < 0) return { error: "Trim amount cannot be negative." };
    if (trimmedCm > MAX_LENGTH_CM) return { error: `Trim amount must be ${MAX_LENGTH_CM} cm or less.` };

    parsed.push({ ms, lengthCm, trimmedCm });
  }

  const sorted = [...parsed].sort((a, b) => a.ms - b.ms);
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index].ms === sorted[index - 1].ms) {
      return { error: "Two measurements share the same date — use one entry per date." };
    }
  }

  const intervals = [];
  let totalTrimmed = 0;
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    const days = Math.round((current.ms - previous.ms) / MS_PER_DAY);
    const trimmed = current.trimmedCm;
    totalTrimmed += trimmed;
    // Growth has to add back whatever was cut off, or a trim reads as negative growth.
    const grownCm = current.lengthCm - previous.lengthCm + trimmed;
    const months = days / DAYS_PER_MONTH;
    intervals.push({
      fromMs: previous.ms,
      toMs: current.ms,
      days,
      trimmedCm: trimmed,
      grownCm,
      cmPerMonth: months > 0 ? grownCm / months : 0,
      reliable: days >= MIN_RELIABLE_DAYS,
    });
  }

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalDays = Math.round((last.ms - first.ms) / MS_PER_DAY);
  if (totalDays <= 0) return { error: "The last measurement must be on a later date than the first." };

  const totalMonths = totalDays / DAYS_PER_MONTH;
  const totalGrownCm = last.lengthCm - first.lengthCm + totalTrimmed;
  const cmPerMonth = totalGrownCm / totalMonths;
  const cmPerYear = cmPerMonth * 12;
  const mmPerDay = (totalGrownCm * 10) / totalDays;
  const band = rateBand(cmPerMonth);

  let projection = null;
  const target = Number(targetCm);
  if (Number.isFinite(target) && target > 0) {
    if (target <= last.lengthCm) {
      projection = { reached: true, message: `You are already at or past ${target} cm.` };
    } else if (cmPerMonth <= 0) {
      projection = {
        reached: false,
        message: "No net growth recorded yet, so a target date cannot be projected.",
      };
    } else {
      const remainingCm = target - last.lengthCm;
      const months = remainingCm / cmPerMonth;
      projection = {
        reached: false,
        remainingCm,
        months,
        onMs: addDays(last.ms, months * DAYS_PER_MONTH),
        message: null,
      };
    }
  }

  return {
    entryCount: sorted.length,
    firstDateMs: first.ms,
    lastDateMs: last.ms,
    firstLengthCm: first.lengthCm,
    lastLengthCm: last.lengthCm,
    totalDays,
    totalMonths,
    totalTrimmedCm: totalTrimmed,
    netChangeCm: last.lengthCm - first.lengthCm,
    totalGrownCm,
    cmPerMonth,
    cmPerYear,
    mmPerDay,
    band,
    reliable: totalDays >= MIN_RELIABLE_DAYS,
    referenceCmPerMonth: REFERENCE_CM_PER_MONTH,
    vsReferencePct: REFERENCE_CM_PER_MONTH > 0 ? (cmPerMonth / REFERENCE_CM_PER_MONTH) * 100 : 0,
    intervals,
    projection,
  };
}
