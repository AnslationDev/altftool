/**
 * Driver Seat Posture Routine — pure calculation module.
 *
 * Two things decide whether a long drive hurts: how the seat is set up before
 * you pull away, and how often you get out of it. This module produces both —
 * measurable seat targets, and a break schedule built on published driving-hours
 * rules rather than a rule of thumb.
 */

/**
 * UK Highway Code Rule 91: on a long journey take at least a 15-minute break
 * every two hours.
 */
export const PRIVATE_DRIVE_LIMIT_MIN = 120;
export const PRIVATE_BREAK_MIN = 15;

/**
 * EU Regulation (EC) No 561/2006 for professional drivers: a break of at least
 * 45 minutes after no more than 4.5 hours of driving (it may be split into
 * 15 minutes followed by 30 minutes), with a daily driving limit of 9 hours,
 * extendable to 10 hours twice in any week.
 */
export const PROFESSIONAL_DRIVE_LIMIT_MIN = 270;
export const PROFESSIONAL_BREAK_MIN = 45;
export const PROFESSIONAL_BREAK_SPLIT = [15, 30];
export const PROFESSIONAL_DAILY_LIMIT_MIN = 540;
export const PROFESSIONAL_DAILY_EXTENDED_MIN = 600;

/**
 * NHTSA air-bag guidance: keep at least 10 inches (25 cm) between the centre of
 * the steering-wheel air-bag cover and your breastbone.
 */
export const STERNUM_TO_AIRBAG_MIN_CM = 25;

/**
 * IIHS head-restraint geometry: a "good" rating needs the top of the restraint
 * close to the top of the head and a backset (gap behind the head) that is small.
 * 7 cm is the practical target used here.
 */
export const HEAD_RESTRAINT_BACKSET_MAX_CM = 7;

/** Sitting height, vertex above the seat / stature. Pheasant, Bodyspace, 50th pct. */
export const SITTING_HEIGHT_RATIO = 0.52;

/** Recommended seat-back angle range, in degrees from vertical-upright. */
export const SEAT_BACK_ANGLE_DEG = [100, 110];

/** Knee angle range with the pedal fully depressed, in degrees. */
export const KNEE_ANGLE_DEG = [120, 135];

/** Clearance from the top of the head to the roof lining. */
export const ROOF_CLEARANCE_CM = 10;

/** Eye height above the top of the steering-wheel rim, common driving guidance. */
export const EYE_ABOVE_WHEEL_MIN_CM = 8;

/** Stretch sequence to run at every break. Durations in seconds. */
export const BREAK_ROUTINE = [
  { name: "Walk away from the car", seconds: 180, cue: "Three minutes of easy walking, no phone." },
  {
    name: "Standing back extension",
    seconds: 40,
    cue: "Hands on hips, lean gently backwards, 10 slow reps.",
  },
  {
    name: "Hip flexor stretch",
    seconds: 60,
    cue: "Split stance, tuck the tailbone under, 30 s each side.",
  },
  {
    name: "Neck rotations and chin tucks",
    seconds: 40,
    cue: "Look slowly left and right, then draw the chin straight back 6 times.",
  },
  {
    name: "Shoulder blade squeezes",
    seconds: 30,
    cue: "Pull the shoulder blades together, hold 3 s, 10 reps.",
  },
  {
    name: "Calf raises and ankle circles",
    seconds: 40,
    cue: "15 calf raises, then 10 ankle circles each way to get the blood moving.",
  },
];

/** Total seconds in one break routine. */
export const BREAK_ROUTINE_SECONDS = BREAK_ROUTINE.reduce((sum, step) => sum + step.seconds, 0);

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * @param {object} input
 * @param {number} input.driveHours    Total time behind the wheel, 0.25-18.
 * @param {number} input.heightCm      Body height, 120-220.
 * @param {boolean} input.professional Apply EU 561/2006 instead of Highway Code Rule 91.
 * @returns {object} schedule and seat targets, or { error }.
 */
export function planDrivingDay({ driveHours, heightCm, professional = false }) {
  const hours = Number(driveHours);
  const height = Number(heightCm);

  if (!Number.isFinite(hours) || !Number.isFinite(height)) {
    return { error: "Enter a number in every field." };
  }
  if (hours <= 0) return { error: "Driving time must be greater than zero." };
  if (hours > 18) return { error: "Keep the driving time to 18 hours or less." };
  if (height < 120 || height > 220) {
    return { error: "Enter a body height between 120 cm and 220 cm." };
  }

  const driveLimit = professional ? PROFESSIONAL_DRIVE_LIMIT_MIN : PRIVATE_DRIVE_LIMIT_MIN;
  const breakLength = professional ? PROFESSIONAL_BREAK_MIN : PRIVATE_BREAK_MIN;
  const totalDriveMin = Math.round(hours * 60);

  const blocks = [];
  let remaining = totalDriveMin;
  let elapsed = 0;
  let breakCount = 0;

  while (remaining > 0) {
    const length = Math.min(driveLimit, remaining);
    blocks.push({
      index: blocks.length + 1,
      kind: "drive",
      startMin: elapsed,
      endMin: elapsed + length,
      lengthMin: length,
    });
    elapsed += length;
    remaining -= length;
    if (remaining > 0) {
      breakCount += 1;
      blocks.push({
        index: blocks.length + 1,
        kind: "break",
        startMin: elapsed,
        endMin: elapsed + breakLength,
        lengthMin: breakLength,
      });
      elapsed += breakLength;
    }
  }

  const totalBreakMin = breakCount * breakLength;
  const totalTripMin = totalDriveMin + totalBreakMin;

  const overDailyLimit = professional && totalDriveMin > PROFESSIONAL_DAILY_LIMIT_MIN;
  const overExtendedLimit = professional && totalDriveMin > PROFESSIONAL_DAILY_EXTENDED_MIN;

  const headRestraintTopCm = height * SITTING_HEIGHT_RATIO;

  return {
    professional,
    ruleLabel: professional
      ? "EU Regulation (EC) No 561/2006"
      : "UK Highway Code Rule 91",
    driveLimitMin: driveLimit,
    breakLengthMin: breakLength,
    totalDriveMin,
    totalBreakMin,
    totalTripMin,
    breakCount,
    blocks,
    overDailyLimit,
    overExtendedLimit,
    dailyLimitMin: PROFESSIONAL_DAILY_LIMIT_MIN,
    routineSeconds: BREAK_ROUTINE_SECONDS,
    totalRoutineSeconds: breakCount * BREAK_ROUTINE_SECONDS,
    seat: {
      headRestraintTopCm: round1(headRestraintTopCm),
      backsetMaxCm: HEAD_RESTRAINT_BACKSET_MAX_CM,
      sternumToAirbagMinCm: STERNUM_TO_AIRBAG_MIN_CM,
      seatBackAngleDeg: SEAT_BACK_ANGLE_DEG,
      kneeAngleDeg: KNEE_ANGLE_DEG,
      roofClearanceCm: ROOF_CLEARANCE_CM,
      eyeAboveWheelMinCm: EYE_ABOVE_WHEEL_MIN_CM,
    },
  };
}

/** Minutes -> "4 h 30 m". Pure formatting helper. */
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

/** Seconds -> "6 min 30 s". Pure formatting helper. */
export function formatSeconds(totalSeconds) {
  const value = Number(totalSeconds);
  if (!Number.isFinite(value) || value < 0) return "—";
  const seconds = Math.round(value);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} s`;
  if (s === 0) return `${m} min`;
  return `${m} min ${s} s`;
}

/** Offset minutes from a given start clock -> "13:45". Pure: the clock is an argument. */
export function clockAt(startHour, startMinute, offsetMin) {
  const base = Number(startHour) * 60 + Number(startMinute) + Number(offsetMin);
  if (!Number.isFinite(base)) return "—";
  const wrapped = ((Math.round(base) % 1440) + 1440) % 1440;
  const h = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const m = String(wrapped % 60).padStart(2, "0");
  return `${h}:${m}`;
}
