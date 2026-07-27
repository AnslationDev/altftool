/**
 * Parent progress summary.
 *
 * Overall percentage uses the weighted definition (total obtained / total
 * maximum × 100). Grades follow the 10-point absolute bands commonly printed
 * on Indian school report cards (the CBSE scholastic pattern): A1 91-100,
 * A2 81-90, B1 71-80, B2 61-70, C1 51-60, C2 41-50, D 33-40 (pass), E below
 * 33 (needs improvement) — 33% being the usual school pass mark.
 * The attendance flag uses the widely applied 75% minimum attendance
 * requirement for exam eligibility (CBSE examination bye-laws and UGC rules
 * both use 75%).
 */

/** CBSE-pattern scholastic grade bands (lower bound inclusive). */
export const GRADE_BANDS = [
  { min: 91, grade: "A1", remark: "Outstanding" },
  { min: 81, grade: "A2", remark: "Excellent" },
  { min: 71, grade: "B1", remark: "Very good" },
  { min: 61, grade: "B2", remark: "Good" },
  { min: 51, grade: "C1", remark: "Fair" },
  { min: 41, grade: "C2", remark: "Average" },
  { min: 33, grade: "D", remark: "Pass — needs steady support" },
  { min: 0, grade: "E", remark: "Needs improvement — below pass mark" },
];

/** 75% attendance is the common minimum for exam eligibility (CBSE/UGC). */
export const ATTENDANCE_MINIMUM_PERCENT = 75;

/** Subjects at or above this percentage are listed as strengths. */
export const STRENGTH_THRESHOLD_PERCENT = 75;

/** Subjects below this percentage are listed as focus areas. */
export const FOCUS_THRESHOLD_PERCENT = 60;

const round1 = (v) => Math.round(v * 10) / 10;

/** Grade for a 0-100 percentage. */
export function gradeFor(percent) {
  return GRADE_BANDS.find((band) => percent >= band.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1];
}

/**
 * Build the progress summary.
 *
 * @param {object} input
 * @param {string} input.studentName
 * @param {string} input.termLabel
 * @param {Array<{name:string, obtained:number|string, max:number|string}>} input.subjects
 * @param {number|string} input.attendancePercent
 * @returns {object} summary data, or { error }.
 */
export function buildProgressSummary({ studentName, termLabel, subjects, attendancePercent }) {
  const name = String(studentName ?? "").trim() || "The student";
  const term = String(termLabel ?? "").trim() || "this term";

  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one subject." };
  }

  const rows = [];
  let totalObtained = 0;
  let totalMax = 0;
  for (let i = 0; i < subjects.length; i += 1) {
    const subjectName = String(subjects[i].name ?? "").trim() || `Subject ${i + 1}`;
    const obtained = Number(subjects[i].obtained);
    const max = Number(subjects[i].max);
    if (!Number.isFinite(obtained) || !Number.isFinite(max)) {
      return { error: `Enter numeric marks for ${subjectName}.` };
    }
    if (max <= 0) return { error: `Maximum marks for ${subjectName} must be greater than zero.` };
    if (obtained < 0) return { error: `Marks for ${subjectName} cannot be negative.` };
    if (obtained > max) {
      return { error: `Marks for ${subjectName} cannot exceed the maximum (${max}).` };
    }
    const percent = round1((obtained / max) * 100);
    rows.push({ name: subjectName, obtained, max, percent, grade: gradeFor(percent).grade });
    totalObtained += obtained;
    totalMax += max;
  }

  const attendance = Number(attendancePercent);
  if (!Number.isFinite(attendance) || attendance < 0 || attendance > 100) {
    return { error: "Attendance must be a percentage between 0 and 100." };
  }

  const overallPercent = round1((totalObtained / totalMax) * 100);
  const overall = gradeFor(overallPercent);
  const attendanceOk = attendance >= ATTENDANCE_MINIMUM_PERCENT;

  const strengths = rows
    .filter((r) => r.percent >= STRENGTH_THRESHOLD_PERCENT)
    .sort((a, b) => b.percent - a.percent)
    .map((r) => r.name);
  const focusAreas = rows
    .filter((r) => r.percent < FOCUS_THRESHOLD_PERCENT)
    .sort((a, b) => a.percent - b.percent)
    .map((r) => r.name);

  const lines = [
    `Progress summary — ${name}, ${term}`,
    "",
    `Overall: ${totalObtained}/${totalMax} marks (${overallPercent}%), grade ${overall.grade} — ${overall.remark}.`,
    `Attendance: ${round1(attendance)}%${
      attendanceOk
        ? " — meets the 75% requirement."
        : ` — BELOW the ${ATTENDANCE_MINIMUM_PERCENT}% minimum usually required for exam eligibility.`
    }`,
    "",
    "Subject-wise:",
    ...rows.map((r) => `  ${r.name}: ${r.obtained}/${r.max} (${r.percent}%) — grade ${r.grade}`),
    "",
    strengths.length > 0
      ? `Strengths: ${strengths.join(", ")}.`
      : "Strengths: none of the subjects reached 75% this term.",
    focusAreas.length > 0
      ? `Focus areas: ${focusAreas.join(", ")} (below 60%).`
      : "Focus areas: none — every subject is at or above 60%.",
  ];

  return {
    rows,
    totalObtained,
    totalMax,
    overallPercent,
    overallGrade: overall.grade,
    overallRemark: overall.remark,
    attendance: round1(attendance),
    attendanceOk,
    strengths,
    focusAreas,
    summaryText: lines.join("\n"),
  };
}
