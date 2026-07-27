/**
 * Sprint capacity planning.
 *
 * Capacity = (headcount × working days − holidays − leaves) × hours/day,
 * minus a percentage for ceremonies, support and interruptions. This is the
 * standard capacity-based sprint planning method (see Scrum.org's capacity
 * planning guidance and SAFe's "capacity allocation" practice).
 */

/** Standard full-time working day. */
export const DEFAULT_HOURS_PER_DAY = 8;

/**
 * Default overhead percentage. The Scrum Guide's event timeboxes for a two-week
 * sprint add up to roughly 10 hours per person (planning ≤4 h, 10 daily scrums
 * ×15 min = 2.5 h, review ≤2 h, retrospective ≤1.5 h) ≈ 12.5% of an 80-hour
 * fortnight; 15% adds a small allowance for ad-hoc support and interruptions.
 */
export const DEFAULT_OVERHEAD_PCT = 15;

/** Practical input bounds so absurd values fail loudly. */
export const MAX_TEAM_SIZE = 500;
export const MAX_SPRINT_DAYS = 30; // a one-month sprint is the Scrum Guide's maximum
export const MIN_HOURS_PER_DAY = 1;
export const MAX_HOURS_PER_DAY = 12;
export const MAX_OVERHEAD_PCT = 90;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Compute sprint capacity.
 *
 * @param {object} input
 * @param {number} input.teamSize          People contributing to sprint work.
 * @param {number} input.sprintWorkingDays Working days in the sprint (10 for two weeks).
 * @param {number} input.hoursPerDay       Working hours per person per day.
 * @param {number} input.publicHolidays    Holiday days inside the sprint (apply to everyone).
 * @param {number} input.leavePersonDays   Total planned leave across the team, in person-days.
 * @param {number} input.overheadPercent   Ceremonies + support + interruptions, % of gross hours.
 * @returns {{error:string}|object}
 */
export function computeSprintCapacity({
  teamSize,
  sprintWorkingDays,
  hoursPerDay,
  publicHolidays,
  leavePersonDays,
  overheadPercent,
}) {
  const values = { teamSize, sprintWorkingDays, hoursPerDay, publicHolidays, leavePersonDays, overheadPercent };
  if (Object.values(values).some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (!Number.isInteger(teamSize) || teamSize < 1 || teamSize > MAX_TEAM_SIZE) {
    return { error: `Team size must be a whole number between 1 and ${MAX_TEAM_SIZE}.` };
  }
  if (sprintWorkingDays < 1 || sprintWorkingDays > MAX_SPRINT_DAYS) {
    return { error: `Sprint working days must be between 1 and ${MAX_SPRINT_DAYS}.` };
  }
  if (hoursPerDay < MIN_HOURS_PER_DAY || hoursPerDay > MAX_HOURS_PER_DAY) {
    return { error: `Hours per day must be between ${MIN_HOURS_PER_DAY} and ${MAX_HOURS_PER_DAY}.` };
  }
  if (publicHolidays < 0 || publicHolidays > sprintWorkingDays) {
    return { error: "Public holidays cannot be negative or exceed the sprint's working days." };
  }
  if (overheadPercent < 0 || overheadPercent > MAX_OVERHEAD_PCT) {
    return { error: `Overhead must be between 0% and ${MAX_OVERHEAD_PCT}%.` };
  }

  const grossPersonDays = teamSize * sprintWorkingDays;
  const holidayPersonDays = publicHolidays * teamSize;

  if (leavePersonDays < 0) {
    return { error: "Leave person-days cannot be negative." };
  }
  if (leavePersonDays > grossPersonDays - holidayPersonDays) {
    return {
      error: "Leave exceeds the person-days left after holidays — the team has no capacity at all.",
    };
  }

  const availablePersonDays = grossPersonDays - holidayPersonDays - leavePersonDays;
  const grossHours = availablePersonDays * hoursPerDay;
  const overheadHours = grossHours * (overheadPercent / 100);
  const netCapacityHours = grossHours - overheadHours;

  return {
    grossPersonDays: round1(grossPersonDays),
    holidayPersonDays: round1(holidayPersonDays),
    leavePersonDays: round1(leavePersonDays),
    availablePersonDays: round1(availablePersonDays),
    grossHours: round1(grossHours),
    overheadHours: round1(overheadHours),
    netCapacityHours: round1(netCapacityHours),
    netCapacityPersonDays: round1(netCapacityHours / hoursPerDay),
    perPersonHours: round1(netCapacityHours / teamSize),
    // Share of the theoretical maximum that survives holidays, leave and overhead.
    utilisationPercent: grossPersonDays > 0
      ? round1((netCapacityHours / (grossPersonDays * hoursPerDay)) * 100)
      : 0,
  };
}
