/**
 * Standing Desk Posture Routine — pure calculation module.
 *
 * Anthropometric ratios below are 50th-percentile British adult figures from
 * Pheasant, "Bodyspace: Anthropometry, Ergonomics and the Design of Work",
 * expressed as a fraction of stature. Male and female 50th-percentile values
 * agree to within about 0.002 for each of these dimensions, so a single ratio
 * is used for both.
 */

/** Standing elbow height / stature. Pheasant: 1090 mm at 1740 mm stature. */
export const STANDING_ELBOW_RATIO = 0.625;

/** Standing eye height / stature. Pheasant: 1630 mm at 1740 mm stature. */
export const STANDING_EYE_RATIO = 0.936;

/** Popliteal (seat) height / stature. Pheasant: 440 mm at 1740 mm stature. */
export const POPLITEAL_RATIO = 0.25;

/** Sitting elbow height above the seat / stature. Pheasant: 230 mm at 1740 mm. */
export const SITTING_ELBOW_RATIO = 0.133;

/**
 * ANSI/HFES 100 and the OSHA computer-workstation guidance both place the top
 * of the viewable screen at, or slightly below, eye height. 5 cm below is the
 * middle of the usual "at or slightly below" range.
 */
export const MONITOR_TOP_BELOW_EYE_CM = 5;

/**
 * Daily standing targets. Buckley et al., "The sedentary office: an expert
 * statement", British Journal of Sports Medicine 2015, recommends accumulating
 * at least 2 hours per day of standing and light walking during working hours,
 * progressing towards 4 hours.
 */
export const STANDING_LEVELS = {
  starting: { label: "Starting out", targetMin: 120 },
  building: { label: "Building up", targetMin: 180 },
  established: { label: "Established", targetMin: 240 },
};

/**
 * Continuous standing beyond roughly an hour is where lower-limb and low-back
 * discomfort is commonly reported in standing-work studies, so the planner
 * caps a single standing block at 60 minutes regardless of what is entered.
 */
export const MAX_CONTINUOUS_STAND_MIN = 60;

/** Micro-movement prompt cadence while standing, in minutes. */
export const MICRO_MOVEMENT_INTERVAL_MIN = 30;

/** Rotating cues so consecutive prompts are not identical. */
export const MICRO_MOVEMENTS = [
  "Shift your weight fully onto one leg for 20 seconds, then the other.",
  "10 slow calf raises, heels all the way down between reps.",
  "Rest one foot on a low rail or box for 30 seconds, then swap.",
  "Roll your shoulders back 8 times and let your arms hang heavy.",
  "Squeeze your glutes for 5 seconds, release, repeat 6 times.",
  "Walk 20 steps away from the desk and back.",
];

const clampNumber = (value) => (Number.isFinite(value) ? value : NaN);

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Build an alternating sit/stand plan across a working day.
 *
 * @param {object} input
 * @param {number} input.workdayHours  Hours at the desk (0.5-16).
 * @param {number} input.standBlockMin Minutes you can stand comfortably in one go.
 * @param {number} input.sitBlockMin   Minutes you sit between standing blocks.
 * @param {number} input.heightCm      Body height in centimetres (120-220).
 * @param {string} input.level         Key of STANDING_LEVELS.
 * @returns {object} plan, or { error } when the input cannot produce a real answer.
 */
export function buildStandingRoutine({
  workdayHours,
  standBlockMin,
  sitBlockMin,
  heightCm,
  level = "starting",
}) {
  const hours = clampNumber(Number(workdayHours));
  const stand = clampNumber(Number(standBlockMin));
  const sit = clampNumber(Number(sitBlockMin));
  const height = clampNumber(Number(heightCm));

  if ([hours, stand, sit, height].some((value) => Number.isNaN(value))) {
    return { error: "Enter a number in every field." };
  }
  if (hours <= 0) return { error: "Working hours must be greater than zero." };
  if (hours > 16) return { error: "Keep the working day to 16 hours or less." };
  if (stand < 5) return { error: "A standing block needs to be at least 5 minutes." };
  if (sit < 5) return { error: "A sitting block needs to be at least 5 minutes." };
  if (stand > 240 || sit > 240) {
    return { error: "Blocks longer than 240 minutes are not a rotation — shorten one of them." };
  }
  if (height < 120 || height > 220) {
    return { error: "Enter a body height between 120 cm and 220 cm." };
  }

  const levelKey = STANDING_LEVELS[level] ? level : "starting";
  const target = STANDING_LEVELS[levelKey];

  const standBlock = Math.min(Math.round(stand), MAX_CONTINUOUS_STAND_MIN);
  const sitBlock = Math.round(sit);
  const totalMinutes = Math.round(hours * 60);

  const blocks = [];
  let elapsed = 0;
  let totalStandMin = 0;
  let totalSitMin = 0;
  let standingBlockIndex = 0;
  // Start seated: it matches how almost every working day actually begins.
  let seated = true;

  while (elapsed < totalMinutes) {
    const wanted = seated ? sitBlock : standBlock;
    const length = Math.min(wanted, totalMinutes - elapsed);
    const cues = [];
    if (!seated) {
      standingBlockIndex += 1;
      const promptCount = Math.floor(length / MICRO_MOVEMENT_INTERVAL_MIN);
      for (let i = 0; i < promptCount; i += 1) {
        const at = (i + 1) * MICRO_MOVEMENT_INTERVAL_MIN;
        if (at >= length) break;
        cues.push({
          atMin: elapsed + at,
          cue: MICRO_MOVEMENTS[(cues.length + standingBlockIndex) % MICRO_MOVEMENTS.length],
        });
      }
    }
    blocks.push({
      index: blocks.length + 1,
      mode: seated ? "sit" : "stand",
      startMin: elapsed,
      endMin: elapsed + length,
      lengthMin: length,
      cues,
    });
    if (seated) totalSitMin += length;
    else totalStandMin += length;
    elapsed += length;
    seated = !seated;
  }

  const transitions = Math.max(0, blocks.length - 1);
  const microBreaks = blocks.reduce((sum, block) => sum + block.cues.length, 0);
  const standShare = totalMinutes > 0 ? (totalStandMin / totalMinutes) * 100 : 0;
  const shortfallMin = Math.max(0, target.targetMin - totalStandMin);

  const standingDeskCm = height * STANDING_ELBOW_RATIO;
  const sittingDeskCm = height * (POPLITEAL_RATIO + SITTING_ELBOW_RATIO);
  const seatHeightCm = height * POPLITEAL_RATIO;
  const eyeHeightCm = height * STANDING_EYE_RATIO;
  const monitorTopCm = eyeHeightCm - MONITOR_TOP_BELOW_EYE_CM;

  return {
    levelKey,
    levelLabel: target.label,
    targetMin: target.targetMin,
    totalMinutes,
    totalStandMin,
    totalSitMin,
    standShare: round1(standShare),
    meetsTarget: totalStandMin >= target.targetMin,
    shortfallMin,
    transitions,
    microBreaks,
    standBlock,
    sitBlock,
    standBlockCapped: Math.round(stand) > MAX_CONTINUOUS_STAND_MIN,
    blocks,
    heights: {
      standingDeskCm: round1(standingDeskCm),
      standingDeskLowCm: round1(standingDeskCm - 5),
      sittingDeskCm: round1(sittingDeskCm),
      seatHeightCm: round1(seatHeightCm),
      standingEyeHeightCm: round1(eyeHeightCm),
      monitorTopStandingCm: round1(monitorTopCm),
    },
  };
}

/** Minutes -> "1 h 20 m" style label. Pure formatting helper. */
export function formatMinutes(totalMin) {
  const value = Number(totalMin);
  if (!Number.isFinite(value) || value < 0) return "—";
  const mins = Math.round(value);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} m`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} m`;
}

/** Minutes from a start-of-day clock time -> "09:45". Pure: the clock is an argument. */
export function clockAt(startHour, startMinute, offsetMin) {
  const base = Number(startHour) * 60 + Number(startMinute) + Number(offsetMin);
  if (!Number.isFinite(base)) return "—";
  const wrapped = ((Math.round(base) % 1440) + 1440) % 1440;
  const h = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const m = String(wrapped % 60).padStart(2, "0");
  return `${h}:${m}`;
}
