/**
 * JNTU (Hyderabad, Kakinada, Anantapur) CGPA <-> percentage conversion.
 *
 * Rule encoded: under the credit-based regulations of all three JNTUs, the
 * notified equivalence for converting CGPA to a percentage of marks is
 *
 *      percentage = (CGPA - 0.75) x 10
 *
 * so a CGPA of 8.5 reads as 77.5%. The class bands of the credit regulations
 * line up with the same rule:
 *
 *   - First Class with Distinction: CGPA 7.75 and above  (= 70%)
 *   - First Class:                  CGPA 6.75 to < 7.75  (= 60%)
 *   - Second Class:                 CGPA 5.75 to < 6.75  (= 50%)
 *   - Pass Class:                   CGPA 5.00 to < 5.75  (= 42.5%)
 *
 * Distinction is commonly conditioned on clearing everything within the
 * regular course period; the exact wording differs slightly by university and
 * regulation (R13/R16/R18/R22 at JNTUH, R13/R16/R19/R20 at JNTUK,
 * R15/R19/R20 at JNTUA), which is why the selector names the regulation
 * family. Older, marks-based regulations (R09 and earlier) printed the
 * percentage directly on the memo and need no conversion.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Offset and multiplier of the notified (CGPA - 0.75) x 10 equivalence. */
export const JNTU_OFFSET = 0.75;
export const JNTU_MULTIPLIER = 10;

export const MIN_CGPA = 0;
export const MAX_CGPA = 10;

/**
 * Per-university regulation families. All credit-based regulations of the
 * three JNTUs notify the same linear equivalence; the entries exist so the
 * result names the university and regulations it is valid for.
 */
export const RULES = [
  {
    id: "jntuh",
    label: "JNTU Hyderabad — R13 / R16 / R18 / R22 (credit system)",
    university: "JNTUH",
    regulations: "R13, R16, R18, R22",
  },
  {
    id: "jntuk",
    label: "JNTU Kakinada — R13 / R16 / R19 / R20 (credit system)",
    university: "JNTUK",
    regulations: "R13, R16, R19, R20",
  },
  {
    id: "jntua",
    label: "JNTU Anantapur — R15 / R19 / R20 (credit system)",
    university: "JNTUA",
    regulations: "R15, R19, R20",
  },
];

/** Class bands on CGPA per the credit regulations (see module note). */
export const CLASS_BANDS = [
  {
    id: "distinction",
    min: 7.75,
    label: "First Class with Distinction",
    note: "Commonly conditioned on clearing all subjects within the regular course period.",
  },
  { id: "first", min: 6.75, label: "First Class", note: "" },
  { id: "second", min: 5.75, label: "Second Class", note: "" },
  { id: "pass", min: 5.0, label: "Pass Class", note: "5.0 is the minimum CGPA for the award of the degree." },
];

const RULE_INDEX = new Map(RULES.map((rule) => [rule.id, rule]));
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round(v * 100) / 100;

/**
 * CGPA -> percentage under the (CGPA - 0.75) x 10 equivalence.
 *
 * @param {number|string} cgpa
 * @param {string} ruleId One of RULES ids (names the university on the result).
 * @returns {{ percent:number, clamped:boolean, rule:object } | { error:string }}
 */
export function cgpaToPercentage(cgpa, ruleId) {
  const rule = RULE_INDEX.get(ruleId);
  if (!rule) return { error: "Choose your university and regulation family." };
  const value = Number(cgpa);
  if (cgpa === "" || cgpa === null || cgpa === undefined || !isNum(value)) {
    return { error: "Enter your CGPA as a number." };
  }
  if (value < MIN_CGPA || value > MAX_CGPA) {
    return { error: `JNTU CGPA runs from ${MIN_CGPA} to ${MAX_CGPA}.` };
  }
  const raw = (value - JNTU_OFFSET) * JNTU_MULTIPLIER;
  const percent = Math.min(100, Math.max(0, raw));
  return { percent: round2(percent), clamped: raw !== percent, rule };
}

/**
 * Percentage -> CGPA, the inverse: CGPA = percentage / 10 + 0.75.
 *
 * @param {number|string} percent
 * @param {string} ruleId
 * @returns {{ cgpa:number, rule:object } | { error:string }}
 */
export function percentageToCgpa(percent, ruleId) {
  const rule = RULE_INDEX.get(ruleId);
  if (!rule) return { error: "Choose your university and regulation family." };
  const value = Number(percent);
  if (percent === "" || percent === null || percent === undefined || !isNum(value)) {
    return { error: "Enter the percentage as a number." };
  }
  if (value < 0 || value > 100) return { error: "A percentage must be between 0 and 100." };
  const raw = value / JNTU_MULTIPLIER + JNTU_OFFSET;
  if (raw > MAX_CGPA) {
    return { error: `That percentage exceeds the ${MAX_CGPA}-point CGPA scale under this rule.` };
  }
  return { cgpa: round2(raw), rule };
}

/**
 * Class band for a CGPA per the credit regulations.
 *
 * @param {number|string} cgpa
 * @returns {{ id:string, label:string, note:string } | { error:string }}
 */
export function classForCgpa(cgpa) {
  const value = Number(cgpa);
  if (!isNum(value) || value < MIN_CGPA || value > MAX_CGPA) {
    return { error: `Enter a CGPA between ${MIN_CGPA} and ${MAX_CGPA}.` };
  }
  for (const band of CLASS_BANDS) {
    if (value + 1e-9 >= band.min) return { ...band };
  }
  return { id: "below", label: "Below the minimum CGPA for the degree", note: "" };
}

/**
 * Credit-weighted CGPA from semester SGPAs:
 * CGPA = sum(credits_i x sgpa_i) / sum(credits_i).
 *
 * @param {Array<{credits:number, sgpa:number}>} semesters
 * @returns {{ cgpa:number, totalCredits:number } | { error:string }}
 */
export function cgpaFromSemesters(semesters) {
  if (!Array.isArray(semesters)) return { error: "Add at least one semester." };
  const rows = semesters.filter(
    (r) => r && isNum(Number(r.credits)) && isNum(Number(r.sgpa)) && Number(r.credits) > 0,
  );
  if (rows.length === 0) return { error: "Enter credits and an SGPA for at least one semester." };
  const bad = rows.find((r) => Number(r.sgpa) < MIN_CGPA || Number(r.sgpa) > MAX_CGPA);
  if (bad) return { error: `Every SGPA must be between ${MIN_CGPA} and ${MAX_CGPA}.` };

  const totalCredits = rows.reduce((s, r) => s + Number(r.credits), 0);
  const totalPoints = rows.reduce((s, r) => s + Number(r.credits) * Number(r.sgpa), 0);
  return { cgpa: round2(totalPoints / totalCredits), totalCredits: round2(totalCredits) };
}
