/**
 * Myopia Progression Log — logic only. No React, no DOM, no clock reads.
 * Dates are always passed in; nothing here reads the system clock.
 *
 * Rules and where they come from:
 *  - Progression rate is the change in spherical power divided by the elapsed
 *    time in years: rate (D/year) = (sphere_late - sphere_early) / years.
 *    Myopic powers are negative, so a more negative number means progression.
 *  - Severity bands follow the International Myopia Institute (IMI) definitions:
 *    myopia is a spherical equivalent of -0.50 D or more negative, and high
 *    myopia is -6.00 D or more negative.
 *  - A progression rate of about -0.50 D a year or faster is the figure widely
 *    used in myopia management to describe a progressing child; -0.75 D a year
 *    or faster is commonly described as rapid progression.
 *  - Axial-length equivalent: roughly 1 mm of axial elongation corresponds to
 *    about 2.5 to 3.0 D of myopia in an adult-sized eye. This tool uses 2.7 D
 *    per mm as the mid-point. It is an approximation, not a substitute for
 *    biometry.
 *  - Spherical equivalent = sphere + cylinder / 2, the standard conversion.
 */

/** Days in an average year, including the leap-year quarter. */
export const DAYS_PER_YEAR = 365.25;

export const MS_PER_DAY = 86400000;

/** IMI threshold for myopia, in dioptres (spherical equivalent). */
export const MYOPIA_THRESHOLD_D = -0.5;

/** IMI threshold for moderate myopia, in dioptres. */
export const MODERATE_MYOPIA_D = -3;

/** IMI threshold for high myopia, in dioptres. */
export const HIGH_MYOPIA_D = -6;

/** Progression at or beyond this rate (D/year, negative) counts as progressing. */
export const PROGRESSING_RATE = -0.5;

/** Progression at or beyond this rate (D/year, negative) counts as rapid. */
export const RAPID_RATE = -0.75;

/** Approximate dioptres of myopia per millimetre of axial length. */
export const DIOPTRES_PER_MM = 2.7;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;
const round1 = (value) => Math.round(value * 10) / 10;

/** Parse a YYYY-MM-DD string to a UTC timestamp, or NaN. */
export function parseIsoDay(iso) {
  if (typeof iso !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return NaN;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const ms = Date.UTC(year, month - 1, day);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return NaN;
  }
  return ms;
}

/** Spherical equivalent: sphere plus half the cylinder. */
export function sphericalEquivalent(sphere, cylinder) {
  if (!isNum(sphere)) return null;
  const cyl = isNum(cylinder) ? cylinder : 0;
  return sphere + cyl / 2;
}

/** IMI severity band for a spherical equivalent in dioptres. */
export function severityBand(se) {
  if (!isNum(se)) return null;
  if (se > MYOPIA_THRESHOLD_D) return { id: "none", label: "Not myopic (above -0.50 D)" };
  if (se > MODERATE_MYOPIA_D) return { id: "low", label: "Low myopia (-0.50 to -3.00 D)" };
  if (se > HIGH_MYOPIA_D) return { id: "moderate", label: "Moderate myopia (-3.00 to -6.00 D)" };
  return { id: "high", label: "High myopia (-6.00 D or beyond)" };
}

/** Descriptive band for a progression rate in dioptres per year. */
export function progressionBand(ratePerYear) {
  if (!isNum(ratePerYear)) return null;
  if (ratePerYear <= RAPID_RATE) return { id: "rapid", label: "Rapid progression (-0.75 D/year or faster)" };
  if (ratePerYear <= PROGRESSING_RATE) return { id: "progressing", label: "Progressing (-0.50 to -0.75 D/year)" };
  if (ratePerYear < -0.125) return { id: "slow", label: "Slow progression (under -0.50 D/year)" };
  if (ratePerYear <= 0.125) return { id: "stable", label: "Stable (within ±0.125 D/year)" };
  return { id: "reducing", label: "Power reducing over time" };
}

/**
 * Analyse a set of prescription readings for one eye.
 *
 * @param {object} input
 * @param {Array<{date: string, sphere: number, cylinder?: number}>} input.entries
 * @param {number} [input.projectYears]  Years ahead to project the trend line.
 * @returns {object} analysis, or { error }.
 */
export function analyseProgression({ entries, projectYears = 3 } = {}) {
  if (!Array.isArray(entries)) return { error: "Add at least two readings to see a trend." };
  if (!isNum(projectYears) || projectYears < 0 || projectYears > 20) {
    return { error: "Project between 0 and 20 years ahead." };
  }

  const parsed = [];
  for (const entry of entries) {
    if (!entry) continue;
    const ms = parseIsoDay(entry.date);
    if (Number.isNaN(ms)) return { error: "Every reading needs a valid date as YYYY-MM-DD." };
    if (!isNum(entry.sphere)) return { error: "Every reading needs a sphere value in dioptres." };
    if (entry.sphere < -30 || entry.sphere > 30) {
      return { error: "Sphere values should be between -30.00 and +30.00 D." };
    }
    const cylinder = isNum(entry.cylinder) ? entry.cylinder : 0;
    if (cylinder < -12 || cylinder > 12) {
      return { error: "Cylinder values should be between -12.00 and +12.00 D." };
    }
    parsed.push({ ms, date: entry.date.trim(), sphere: entry.sphere, cylinder, se: sphericalEquivalent(entry.sphere, cylinder) });
  }

  if (parsed.length < 2) return { error: "Add at least two readings to work out a progression rate." };

  parsed.sort((a, b) => a.ms - b.ms);

  const first = parsed[0];
  const last = parsed[parsed.length - 1];
  const totalYears = (last.ms - first.ms) / MS_PER_DAY / DAYS_PER_YEAR;
  if (totalYears <= 0) {
    return { error: "All the readings share the same date, so no rate can be worked out." };
  }

  const totalChange = last.se - first.se;
  const overallRate = totalChange / totalYears;

  // Per-interval rates between consecutive readings.
  const intervals = [];
  for (let index = 1; index < parsed.length; index += 1) {
    const previous = parsed[index - 1];
    const current = parsed[index];
    const years = (current.ms - previous.ms) / MS_PER_DAY / DAYS_PER_YEAR;
    if (years <= 0) {
      return { error: "Two readings share the same date. Remove or re-date the duplicate." };
    }
    const change = current.se - previous.se;
    const intervalRate = round2(change / years);
    intervals.push({
      from: previous.date,
      to: current.date,
      years: round2(years),
      change: round2(change),
      ratePerYear: intervalRate,
      // Band the displayed (rounded) rate so the label always agrees with the number.
      band: progressionBand(intervalRate),
    });
  }

  // Least-squares slope of spherical equivalent against years from the first reading.
  const points = parsed.map((entry) => ({
    x: (entry.ms - first.ms) / MS_PER_DAY / DAYS_PER_YEAR,
    y: entry.se,
  }));
  const n = points.length;
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / n;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / n;
  let numerator = 0;
  let denominator = 0;
  for (const point of points) {
    numerator += (point.x - meanX) * (point.y - meanY);
    denominator += (point.x - meanX) ** 2;
  }
  const slope = denominator > 0 ? numerator / denominator : overallRate;
  const intercept = meanY - slope * meanX;

  const projectedSe = last.se + slope * projectYears;
  const projectedDateIso = new Date(last.ms + projectYears * DAYS_PER_YEAR * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);

  const axialEquivalentMm = totalChange / -DIOPTRES_PER_MM;
  const axialRateMmPerYear = overallRate / -DIOPTRES_PER_MM;

  const notes = [];
  // Band the displayed (rounded) rate so the label always agrees with the number.
  const band = progressionBand(round2(overallRate));
  if (band && (band.id === "rapid" || band.id === "progressing")) {
    notes.push(
      "A rate at or beyond -0.50 D a year is the figure eye care professionals use to describe a progressing myope. Myopia management options exist — discuss them at the next appointment.",
    );
  }
  if (severityBand(last.se)?.id === "high") {
    notes.push(
      "High myopia (-6.00 D or beyond) carries a raised lifetime risk of retinal detachment, myopic maculopathy and glaucoma, which is why regular dilated examinations matter regardless of how good the corrected vision is.",
    );
  }
  if (totalYears < 1) {
    notes.push(
      `The readings only span ${round2(totalYears)} years. Annualised rates from short intervals swing wildly — treat this as provisional until you have two years of data.`,
    );
  }
  if (parsed.length === 2) {
    notes.push("With only two readings the trend line is just the straight line between them. A third reading makes it meaningful.");
  }

  return {
    readings: parsed.map((entry) => ({
      date: entry.date,
      sphere: round2(entry.sphere),
      cylinder: round2(entry.cylinder),
      se: round2(entry.se),
      band: severityBand(entry.se),
    })),
    firstDate: first.date,
    lastDate: last.date,
    firstSe: round2(first.se),
    lastSe: round2(last.se),
    totalYears: round2(totalYears),
    totalChange: round2(totalChange),
    overallRate: round2(overallRate),
    band,
    currentSeverity: severityBand(last.se),
    slope: round2(slope),
    intercept: round2(intercept),
    projectYears,
    projectedSe: round2(projectedSe),
    projectedDateIso,
    projectedSeverity: severityBand(projectedSe),
    axialEquivalentMm: round2(axialEquivalentMm),
    axialRateMmPerYear: round2(axialRateMmPerYear),
    dioptresPerMm: DIOPTRES_PER_MM,
    intervals,
    notes,
  };
}
