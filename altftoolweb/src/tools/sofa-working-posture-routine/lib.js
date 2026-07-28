/**
 * Sofa Working Posture Routine — pure calculation module.
 *
 * A sofa is not a chair: the seat is deeper and usually lower than the seat of
 * a task chair, and it has no lumbar shape. This module turns that into two
 * measurable cushion sizes, a checklist score, and a timed reset routine.
 */

/**
 * Buttock-to-popliteal length (seat depth your body actually needs) as a
 * fraction of stature. Pheasant, "Bodyspace", 50th-percentile adult:
 * 500 mm at 1740 mm (male) and 480 mm at 1610 mm (female).
 */
export const BUTTOCK_POPLITEAL_RATIO = 0.29;

/** Popliteal (seat) height / stature. Pheasant, 50th-percentile adult. */
export const POPLITEAL_RATIO = 0.25;

/** Seat-depth or seat-height mismatch small enough to ignore, in cm. */
export const FIT_TOLERANCE_CM = 3;

/**
 * Seven set-up criteria, each worth one point. They are listed in the order
 * they should be fixed: the earlier items remove more load than the later ones.
 */
export const SOFA_CRITERIA = [
  {
    id: "screenAtEyeLevel",
    label: "Screen top is near eye level, not on my lap",
    fix: "Get the screen off your lap",
    detail:
      "A laptop on the thighs sits 40-50 cm below eye level, which forces a deep head tilt. Put it on a side table, an ironing board or a lap desk on a firm cushion.",
  },
  {
    id: "externalKeyboard",
    label: "I use a separate keyboard and mouse",
    fix: "Separate the keyboard from the screen",
    detail:
      "Once the screen is lifted, the built-in keyboard is too high. A cheap wireless keyboard and mouse are the difference between a fixable sofa set-up and an unfixable one.",
  },
  {
    id: "hipsBack",
    label: "My hips are pushed right back into the seat",
    fix: "Sit all the way back before you start",
    detail:
      "Perching on the front edge with your back unsupported is the classic sofa slump. Push your hips into the back of the seat first, then fill the gap with a cushion.",
  },
  {
    id: "lumbarSupport",
    label: "A firm cushion or rolled towel supports my low back",
    fix: "Add firm low-back support",
    detail:
      "A rolled towel about 10 cm thick placed at belt height keeps a small inward curve in your lower back. Soft scatter cushions collapse and do nothing.",
  },
  {
    id: "feetSupported",
    label: "Both feet are flat on the floor or a footstool",
    fix: "Support your feet",
    detail:
      "Dangling or crossed legs shift weight onto the tailbone. Use a footstool, a box or a stack of books so both feet take load.",
  },
  {
    id: "forearmsSupported",
    label: "My forearms rest on something firm while typing",
    fix: "Support your forearms",
    detail:
      "Unsupported arms are held up by your neck and shoulder muscles for the whole session. Rest the forearms on a lap desk, a firm cushion or the arm of the sofa.",
  },
  {
    id: "movesEvery30",
    label: "I stand up and move at least every 30 minutes",
    fix: "Break the session up",
    detail:
      "No sofa position is good for hours. Standing up resets the load on the discs and gets blood back into the legs.",
  },
];

/**
 * Score bands. The longest recommended unbroken stint falls as the set-up gets
 * worse: the less support you have, the sooner you need to change position.
 */
export const SCORE_BANDS = [
  { min: 6, label: "About as good as a sofa gets", maxStintMin: 45 },
  { min: 4, label: "Workable, with fixes", maxStintMin: 30 },
  { min: 2, label: "High strain", maxStintMin: 20 },
  { min: 0, label: "Move to a table if you can", maxStintMin: 15 },
];

/** The reset routine run at every break. Durations in seconds. */
export const RESET_ROUTINE = [
  { name: "Stand up and walk", seconds: 30, cue: "Leave the sofa completely — 20 steps and back." },
  { name: "Chin tucks", seconds: 30, cue: "Draw the chin straight back, hold 5 s, repeat 6 times." },
  {
    name: "Chest opener",
    seconds: 40,
    cue: "Hands behind head, elbows wide, gently open the chest and breathe.",
  },
  {
    name: "Hip flexor stretch",
    seconds: 60,
    cue: "Half-kneel or split stance, tuck the tailbone, 30 s each side.",
  },
  {
    name: "Thoracic extension",
    seconds: 30,
    cue: "Lean back over the sofa arm or a chair back and extend the upper spine.",
  },
  {
    name: "Wrist flexor and extensor stretch",
    seconds: 40,
    cue: "Arm straight, gently pull the fingers back then down, 20 s each side.",
  },
];

/** Total seconds of one reset routine. */
export const RESET_ROUTINE_SECONDS = RESET_ROUTINE.reduce((sum, step) => sum + step.seconds, 0);

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * @param {object} input
 * @param {number} input.heightCm         Body height, 120-220.
 * @param {number} input.seatDepthCm      Sofa seat depth, front edge to backrest, 30-90.
 * @param {number} input.seatHeightCm     Sofa seat height when compressed, 20-70.
 * @param {number} input.sessionMinutes   How long you will work there, 5-720.
 * @param {object} input.answers          { [criterionId]: boolean }
 * @returns {object} score, cushions, routine plan — or { error }.
 */
export function analyseSofaSetup({
  heightCm,
  seatDepthCm,
  seatHeightCm,
  sessionMinutes,
  answers = {},
}) {
  const height = Number(heightCm);
  const depth = Number(seatDepthCm);
  const seat = Number(seatHeightCm);
  const session = Number(sessionMinutes);

  if ([height, depth, seat, session].some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (height < 120 || height > 220) return { error: "Enter a body height between 120 cm and 220 cm." };
  if (depth < 30 || depth > 90) return { error: "Sofa seat depth is usually between 30 cm and 90 cm." };
  if (seat < 20 || seat > 70) return { error: "Sofa seat height is usually between 20 cm and 70 cm." };
  if (session < 5) return { error: "Enter a session of at least 5 minutes." };
  if (session > 720) return { error: "Keep the session to 12 hours or less." };

  const met = SOFA_CRITERIA.filter((criterion) => Boolean(answers[criterion.id]));
  const unmet = SOFA_CRITERIA.filter((criterion) => !answers[criterion.id]);
  const score = met.length;
  const scorePercent = Math.round((score / SOFA_CRITERIA.length) * 100);
  const band = SCORE_BANDS.find((entry) => score >= entry.min) || SCORE_BANDS[SCORE_BANDS.length - 1];

  const neededDepth = height * BUTTOCK_POPLITEAL_RATIO;
  const depthGap = depth - neededDepth; // positive = sofa is deeper than your thighs
  const backCushionCm = depthGap > FIT_TOLERANCE_CM ? round1(depthGap) : 0;

  const idealSeatHeight = height * POPLITEAL_RATIO;
  const seatGap = idealSeatHeight - seat; // positive = sofa sits too low
  const seatCushionCm = seatGap > FIT_TOLERANCE_CM ? round1(seatGap) : 0;
  const footrestCm = seatGap < -FIT_TOLERANCE_CM ? round1(-seatGap) : 0;

  const maxStintMin = band.maxStintMin;
  const stints = Math.max(1, Math.ceil(session / maxStintMin));
  const resets = stints - 1;
  const stintLengthMin = round1(session / stints);
  const resetSeconds = resets * RESET_ROUTINE_SECONDS;
  const totalWithResetsMin = round1(session + resetSeconds / 60);

  return {
    score,
    outOf: SOFA_CRITERIA.length,
    scorePercent,
    bandLabel: band.label,
    met: met.map((criterion) => criterion.id),
    unmet,
    neededDepthCm: round1(neededDepth),
    depthGapCm: round1(depthGap),
    backCushionCm,
    idealSeatHeightCm: round1(idealSeatHeight),
    seatGapCm: round1(seatGap),
    seatCushionCm,
    footrestCm,
    maxStintMin,
    stints,
    stintLengthMin,
    resets,
    resetSeconds,
    resetRoutineSeconds: RESET_ROUTINE_SECONDS,
    totalWithResetsMin,
  };
}

/** Seconds -> "4 min 5 s". Pure formatting helper. */
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
