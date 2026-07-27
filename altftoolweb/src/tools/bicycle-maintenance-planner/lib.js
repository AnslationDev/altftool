/**
 * Bicycle maintenance interval planner.
 *
 * The base intervals below are the distance-based service points that bicycle
 * service literature converges on (Park Tool's preventative-maintenance
 * schedule, Shimano dealer manuals for brake-pad and cable service, and the
 * long-standing "one cassette per three chains, one chainring set per three
 * cassettes" drivetrain rule). They are typical intervals for a well-kept
 * bike, not manufacturer warranty requirements — a component that fails an
 * inspection is replaced whenever that inspection happens.
 *
 * Contamination-driven jobs (lubricating, degreasing, brake pads, bearings,
 * chain and cassette life) come round far sooner on wet and gritty roads, so
 * those tasks are scaled by a riding-condition factor. Jobs driven by handling
 * or by simple ageing — torque checks, bar tape, gear indexing — are not.
 */

/** Days in a week; used to convert distance intervals into calendar time. */
export const DAYS_PER_WEEK = 7;

/** Weeks in a year, used for the annual service-load figures. */
export const WEEKS_PER_YEAR = 52;

/**
 * Riding-condition multipliers applied to contamination-sensitive intervals.
 * Grit and water are what actually wear a drivetrain, so a winter/gravel rider
 * reaches every service point in well under half the distance of a dry-road
 * commuter.
 */
export const CONDITIONS = [
  { id: "dry", label: "Dry paved roads", factor: 1.0 },
  { id: "mixed", label: "Mixed roads, occasional rain", factor: 0.7 },
  { id: "wet", label: "Wet, muddy or gravel", factor: 0.45 },
];

/** Distance-based jobs. baseKm is the dry-road interval in kilometres. */
export const DISTANCE_TASKS = [
  { id: "lube", task: "Wipe the chain down and re-lubricate", group: "Cleaning", baseKm: 250, sensitive: true },
  { id: "degrease", task: "Degrease chain, cassette and jockey wheels", group: "Cleaning", baseKm: 500, sensitive: true },
  { id: "wash", task: "Full bike wash and dry", group: "Cleaning", baseKm: 500, sensitive: true },
  { id: "brake-check", task: "Inspect brake pads, rotors and rim wear", group: "Inspection", baseKm: 1000, sensitive: true },
  { id: "torque", task: "Torque-check stem, seatpost and crank bolts", group: "Inspection", baseKm: 1000, sensitive: false },
  { id: "index", task: "Re-index gears and adjust cable tension", group: "Adjustment", baseKm: 1500, sensitive: false },
  { id: "chain-measure", task: "Measure chain elongation with a ruler or gauge", group: "Inspection", baseKm: 1000, sensitive: true },
  { id: "brake-pads", task: "Replace brake pads", group: "Replacement", baseKm: 2000, sensitive: true },
  { id: "chain", task: "Replace the chain", group: "Replacement", baseKm: 3000, sensitive: true },
  { id: "rear-tyre", task: "Replace the rear tyre", group: "Replacement", baseKm: 4000, sensitive: true },
  { id: "cables", task: "Replace gear and brake cables and housing", group: "Replacement", baseKm: 5000, sensitive: true },
  { id: "bar-tape", task: "Replace bar tape or grips", group: "Replacement", baseKm: 5000, sensitive: false },
  { id: "bearings", task: "Service hub, bottom bracket and headset bearings", group: "Overhaul", baseKm: 8000, sensitive: true },
  { id: "cassette", task: "Replace the cassette (about every third chain)", group: "Replacement", baseKm: 9000, sensitive: true },
  { id: "chainrings", task: "Replace chainrings (about every third cassette)", group: "Replacement", baseKm: 15000, sensitive: true },
];

/** Calendar-based jobs that come round regardless of distance ridden. */
export const TIME_TASKS = [
  { id: "pressure", task: "Check tyre pressure", days: 7, note: "Butyl tubes lose roughly 10% of their pressure a week; latex tubes lose more." },
  { id: "m-check", task: "Pre-ride M-check: wheels, brakes, bars, chain", days: 7, note: "Two minutes, and it catches loose quick-releases before they matter." },
  { id: "annual", task: "Full workshop service", days: 365, note: "Even a lightly used bike needs annual bearing and cable attention." },
];

/** Intervals are rounded to this many km so the plan reads as round numbers. */
const ROUNDING_KM = 10;

/** Above this weekly distance the numbers stop describing a normal rider. */
const MAX_WEEKLY_KM = 2000;

/** Odometers above this are almost certainly a typo. */
const MAX_ODOMETER_KM = 500000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function conditionFactor(conditionId) {
  const match = CONDITIONS.find((item) => item.id === conditionId);
  return match ? match.factor : 1;
}

/**
 * Build a full maintenance plan.
 *
 * @param {object} input
 * @param {number} input.weeklyKm  Kilometres ridden per week.
 * @param {string} input.condition One of CONDITIONS[].id
 * @param {number} input.odometer  Kilometres already on the bike.
 */
export function buildMaintenancePlan({ weeklyKm, condition = "dry", odometer = 0 }) {
  if (!isNum(weeklyKm) || !isNum(odometer)) {
    return { error: "Enter valid numbers for weekly distance and odometer." };
  }
  if (weeklyKm <= 0) {
    return { error: "Enter how many kilometres you ride in a typical week." };
  }
  if (weeklyKm > MAX_WEEKLY_KM) {
    return { error: `Weekly distance above ${MAX_WEEKLY_KM} km is beyond what this planner models.` };
  }
  if (odometer < 0) {
    return { error: "Odometer reading cannot be negative." };
  }
  if (odometer > MAX_ODOMETER_KM) {
    return { error: "Check the odometer reading — that is more than 500,000 km." };
  }

  const factor = conditionFactor(condition);
  const kmPerDay = weeklyKm / DAYS_PER_WEEK;
  const annualKm = weeklyKm * WEEKS_PER_YEAR;

  const schedule = DISTANCE_TASKS.map((item) => {
    const raw = item.sensitive ? item.baseKm * factor : item.baseKm;
    const intervalKm = Math.max(ROUNDING_KM, Math.round(raw / ROUNDING_KM) * ROUNDING_KM);
    // Distance still to run inside the current interval. A reading that lands
    // exactly on a boundary is treated as "just done", giving a full interval.
    const into = odometer % intervalKm;
    const kmUntilDue = into === 0 ? intervalKm : intervalKm - into;
    const dueAtKm = odometer + kmUntilDue;

    return {
      id: item.id,
      task: item.task,
      group: item.group,
      baseKm: item.baseKm,
      sensitive: item.sensitive,
      intervalKm,
      intervalWeeks: intervalKm / weeklyKm,
      kmUntilDue,
      dueAtKm,
      daysUntilDue: kmUntilDue / kmPerDay,
      timesPerYear: annualKm / intervalKm,
    };
  });

  const byDistance = [...schedule].sort(
    (a, b) => a.kmUntilDue - b.kmUntilDue || a.intervalKm - b.intervalKm,
  );
  const next = byDistance[0];

  const timeSchedule = TIME_TASKS.map((item) => ({
    id: item.id,
    task: item.task,
    days: item.days,
    note: item.note,
    timesPerYear: 365 / item.days,
  }));

  // How much work the next 500 km and the next year actually contain.
  const dueWithin500Km = schedule.filter((item) => item.kmUntilDue <= 500).length;
  const jobsPerYear = schedule.reduce((sum, item) => sum + item.timesPerYear, 0);

  return {
    factor,
    weeklyKm,
    odometer,
    annualKm,
    kmPerDay,
    schedule,
    byDistance,
    next,
    timeSchedule,
    dueWithin500Km,
    jobsPerYear,
  };
}
