/**
 * Dr. A.P.J. Abdul Kalam Technical University (AKTU, formerly UPTU), Lucknow —
 * CGPA <-> percentage conversion.
 *
 * Rule encoded: AKTU's own conversion notice states the equivalent percentage
 * of marks as
 *
 *      percentage = (CGPA - 0.75) x 10
 *
 * so a CGPA of 8.0 is 72.5%. The same linear rule applies to SGPA when a
 * single semester's figure has to be reported as a percentage.
 *
 * Division bands, as commonly stated in AKTU ordinances for B.Tech and allied
 * programmes (confirm against your own programme ordinance):
 *   - First Division with Honours: CGPA 7.5 and above (all papers cleared in
 *     the first attempt)
 *   - First Division: CGPA 6.5 and above
 *   - Second Division: CGPA 5.0 to below 6.5 (5.0 is also the minimum CGPA
 *     for the award of the degree)
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Offset and multiplier from AKTU's CGPA-to-percentage conversion notice. */
export const AKTU_OFFSET = 0.75;
export const AKTU_MULTIPLIER = 10;

export const MIN_CGPA = 0;
export const MAX_CGPA = 10;

/** Division bands on CGPA, per AKTU ordinances (see module note). */
export const DIVISIONS = [
  {
    id: "honours",
    min: 7.5,
    label: "First Division with Honours",
    note: "Requires all papers cleared in the first attempt.",
  },
  { id: "first", min: 6.5, label: "First Division", note: "" },
  { id: "second", min: 5.0, label: "Second Division", note: "5.0 is also the minimum CGPA for the degree." },
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round(v * 100) / 100;

/**
 * CGPA -> percentage under AKTU's (CGPA - 0.75) x 10 rule.
 *
 * @param {number|string} cgpa
 * @returns {{ percent:number, clamped:boolean } | { error:string }}
 */
export function cgpaToPercentage(cgpa) {
  const value = Number(cgpa);
  if (cgpa === "" || cgpa === null || cgpa === undefined || !isNum(value)) {
    return { error: "Enter your CGPA as a number." };
  }
  if (value < MIN_CGPA || value > MAX_CGPA) {
    return { error: `AKTU CGPA runs from ${MIN_CGPA} to ${MAX_CGPA}.` };
  }
  const raw = (value - AKTU_OFFSET) * AKTU_MULTIPLIER;
  const percent = Math.min(100, Math.max(0, raw));
  return { percent: round2(percent), clamped: raw !== percent };
}

/**
 * Percentage -> CGPA, the inverse of the same rule:
 * CGPA = percentage / 10 + 0.75.
 *
 * @param {number|string} percent
 * @returns {{ cgpa:number } | { error:string }}
 */
export function percentageToCgpa(percent) {
  const value = Number(percent);
  if (percent === "" || percent === null || percent === undefined || !isNum(value)) {
    return { error: "Enter the percentage as a number." };
  }
  if (value < 0 || value > 100) return { error: "A percentage must be between 0 and 100." };
  const raw = value / AKTU_MULTIPLIER + AKTU_OFFSET;
  if (raw > MAX_CGPA) {
    return { error: `That percentage exceeds the ${MAX_CGPA}-point CGPA scale under AKTU's rule.` };
  }
  return { cgpa: round2(raw) };
}

/**
 * Division for a CGPA per the ordinance bands.
 *
 * @param {number|string} cgpa
 * @param {boolean} [firstAttempt=true] All papers cleared in the first attempt.
 * @returns {{ id:string, label:string, note:string } | { error:string }}
 */
export function divisionForCgpa(cgpa, firstAttempt = true) {
  const value = Number(cgpa);
  if (!isNum(value) || value < MIN_CGPA || value > MAX_CGPA) {
    return { error: `Enter a CGPA between ${MIN_CGPA} and ${MAX_CGPA}.` };
  }
  for (const band of DIVISIONS) {
    if (value + 1e-9 >= band.min) {
      if (band.id === "honours" && !firstAttempt) {
        // Honours needs a first-attempt clear record; fall to First Division.
        const first = DIVISIONS.find((d) => d.id === "first");
        return { ...first };
      }
      return { ...band };
    }
  }
  return { id: "below", label: "Below the minimum CGPA for the degree", note: "" };
}

/**
 * Credit-weighted CGPA from semester SGPAs:
 * CGPA = sum(credits_i x sgpa_i) / sum(credits_i).
 *
 * @param {Array<{credits:number, sgpa:number}>} semesters
 * @returns {{ cgpa:number, totalCredits:number, percent:number } | { error:string }}
 */
export function cgpaFromSemesters(semesters) {
  if (!Array.isArray(semesters)) return { error: "Add at least one semester." };
  const rows = semesters.filter((r) => r && isNum(Number(r.credits)) && isNum(Number(r.sgpa)) && Number(r.credits) > 0);
  if (rows.length === 0) return { error: "Enter credits and an SGPA for at least one semester." };
  const bad = rows.find((r) => Number(r.sgpa) < MIN_CGPA || Number(r.sgpa) > MAX_CGPA);
  if (bad) return { error: `Every SGPA must be between ${MIN_CGPA} and ${MAX_CGPA}.` };

  const totalCredits = rows.reduce((s, r) => s + Number(r.credits), 0);
  const totalPoints = rows.reduce((s, r) => s + Number(r.credits) * Number(r.sgpa), 0);
  const cgpa = round2(totalPoints / totalCredits);
  const conv = cgpaToPercentage(cgpa);
  return {
    cgpa,
    totalCredits: round2(totalCredits),
    percent: conv.error ? 0 : conv.percent,
  };
}
