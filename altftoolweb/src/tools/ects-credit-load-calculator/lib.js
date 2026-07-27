/**
 * ECTS credit load planner.
 *
 * Rules from the ECTS Users' Guide (European Commission, 2015 edition):
 * - 60 ECTS credits represent one full-time academic year of learning.
 * - A full-time semester is therefore 30 ECTS.
 * - One ECTS credit corresponds to 25-30 hours of total student workload
 *   (contact hours + self-study + assessment).
 * Degree sizes under the Bologna framework: bachelor 180-240 ECTS,
 * master 60-120 ECTS.
 */

/** ECTS Users' Guide: one full-time academic year. */
export const ECTS_PER_YEAR = 60;

/** ECTS Users' Guide: one full-time semester (60 / 2). */
export const ECTS_PER_SEMESTER = 30;

/** ECTS Users' Guide: workload hours represented by one credit (range). */
export const HOURS_PER_ECTS_MIN = 25;
export const HOURS_PER_ECTS_MAX = 30;

/** Common Bologna degree totals, for the presets shown in the UI. */
export const DEGREE_PRESETS = [
  { id: "bachelor-180", label: "Bachelor — 180 ECTS (3 years)", total: 180 },
  { id: "bachelor-240", label: "Bachelor — 240 ECTS (4 years)", total: 240 },
  { id: "master-60", label: "Master — 60 ECTS (1 year)", total: 60 },
  { id: "master-90", label: "Master — 90 ECTS (1.5 years)", total: 90 },
  { id: "master-120", label: "Master — 120 ECTS (2 years)", total: 120 },
];

/** Semesters usually contain 15-20 teaching+exam weeks; 20 covers exams. */
export const DEFAULT_WEEKS_PER_SEMESTER = 20;

/** Overload threshold: anything above the standard 30 ECTS semester. */
export const OVERLOAD_THRESHOLD = ECTS_PER_SEMESTER;

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Plan the per-semester ECTS load needed to finish on time.
 *
 * @param {object} input
 * @param {number} input.totalRequired      ECTS the degree requires.
 * @param {number} input.earned             ECTS already earned.
 * @param {number} input.semestersRemaining Semesters left before intended graduation.
 * @param {number} input.hoursPerCredit     Workload hours per ECTS (25-30).
 * @param {number} input.weeksPerSemester   Weeks of study per semester.
 */
export function computeEctsLoad({
  totalRequired,
  earned,
  semestersRemaining,
  hoursPerCredit,
  weeksPerSemester,
}) {
  const total = Number(totalRequired);
  const done = Number(earned);
  const semesters = Number(semestersRemaining);
  const hpc = Number(hoursPerCredit);
  const weeks = Number(weeksPerSemester);

  if (!Number.isFinite(total) || total <= 0) {
    return { error: "Enter the total ECTS your degree requires." };
  }
  if (total > 600) return { error: "No Bologna degree requires more than 600 ECTS." };
  if (!Number.isFinite(done) || done < 0) {
    return { error: "Earned ECTS cannot be negative." };
  }
  if (done > total) {
    return { error: "Earned ECTS cannot exceed the degree total." };
  }
  if (!Number.isFinite(semesters) || semesters < 1 || !Number.isInteger(semesters)) {
    return { error: "Semesters remaining must be a whole number of at least 1." };
  }
  if (!Number.isFinite(hpc) || hpc < HOURS_PER_ECTS_MIN || hpc > HOURS_PER_ECTS_MAX) {
    return {
      error: `Hours per credit must be between ${HOURS_PER_ECTS_MIN} and ${HOURS_PER_ECTS_MAX} (ECTS Users' Guide).`,
    };
  }
  if (!Number.isFinite(weeks) || weeks < 10 || weeks > 30) {
    return { error: "Weeks per semester should be between 10 and 30." };
  }

  const remaining = total - done;

  if (remaining === 0) {
    return {
      remaining: 0,
      perSemester: 0,
      workloadHoursPerSemester: 0,
      hoursPerWeek: 0,
      overload: false,
      loadRatio: 0,
      status: "All credits earned — nothing left to plan.",
    };
  }

  const perSemester = remaining / semesters;
  const workloadHoursPerSemester = perSemester * hpc;
  const hoursPerWeek = workloadHoursPerSemester / weeks;
  const overload = perSemester > OVERLOAD_THRESHOLD;
  const loadRatio = perSemester / ECTS_PER_SEMESTER;

  let status;
  if (overload) {
    status = `Above the standard full-time load of ${ECTS_PER_SEMESTER} ECTS per semester — expect to need an extra semester or approval for an overload.`;
  } else if (loadRatio >= 0.9) {
    status = "A standard full-time load. On track to finish in the remaining semesters.";
  } else if (loadRatio >= 0.5) {
    status = "A moderate load — below full time, with room for a thesis, job or exchange.";
  } else {
    status = "A light load — you could finish earlier or spread courses more evenly.";
  }

  return {
    remaining: round1(remaining),
    perSemester: round1(perSemester),
    workloadHoursPerSemester: Math.round(workloadHoursPerSemester),
    hoursPerWeek: round1(hoursPerWeek),
    overload,
    loadRatio: round1(loadRatio * 100) / 100,
    status,
  };
}
