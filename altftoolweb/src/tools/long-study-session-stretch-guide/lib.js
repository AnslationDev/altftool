/**
 * Desk stretch scheduling for long study days.
 *
 * Dosage rules encoded:
 *  - Static stretch hold: 10-30 seconds per stretch, 2-4 repetitions, per the
 *    American College of Sports Medicine (ACSM) flexibility guidelines.
 *    Holds below use 15-20 s at 2 reps — inside that range.
 *  - Break spacing: ergonomics guidance (UK HSE display screen equipment
 *    advice; Cornell Ergonomics Web) favours a movement pause roughly every
 *    50-60 minutes of seated work; default interval here is 50 minutes.
 *
 * All stretches are gentle, standing-or-seated desk stretches requiring no
 * equipment.
 */

/** ACSM flexibility guideline bounds, for reference and validation. */
export const HOLD_SECONDS_MIN = 10;
export const HOLD_SECONDS_MAX = 30;

/** Default movement-break spacing (ergonomics guidance, minutes). */
export const DEFAULT_INTERVAL_MIN = 50;

export const MIN_SESSION_MINUTES = 45;
export const MAX_SESSION_MINUTES = 720; // 12 h
export const MIN_INTERVAL_MINUTES = 20;
export const MAX_INTERVAL_MINUTES = 120;
export const STRETCHES_PER_BREAK = 3;

/**
 * Stretch bank. holdSeconds within ACSM's 10-30 s window; reps = 2 (or per
 * side for asymmetric stretches).
 */
export const STRETCHES = [
  {
    id: "chin-tuck",
    name: "Chin tuck",
    area: "Neck",
    holdSeconds: 15,
    reps: 2,
    how: "Sit tall, glide your chin straight back (make a double chin) without tilting. Hold, release.",
  },
  {
    id: "neck-side",
    name: "Side neck stretch",
    area: "Neck",
    holdSeconds: 15,
    reps: 2,
    how: "Tilt your right ear toward your right shoulder until you feel a gentle pull on the left; swap sides.",
  },
  {
    id: "shoulder-rolls",
    name: "Shoulder rolls",
    area: "Shoulders",
    holdSeconds: 20,
    reps: 2,
    how: "Roll both shoulders slowly backwards in big circles for the full count, then forwards.",
  },
  {
    id: "doorway-chest",
    name: "Chest opener",
    area: "Chest / shoulders",
    holdSeconds: 20,
    reps: 2,
    how: "Clasp hands behind your back (or hold the chair back), straighten arms and lift slightly while opening the chest.",
  },
  {
    id: "upper-back",
    name: "Upper-back reach",
    area: "Upper back",
    holdSeconds: 20,
    reps: 2,
    how: "Interlace fingers, push palms forward at shoulder height and round the upper back, chin gently down.",
  },
  {
    id: "seated-twist",
    name: "Seated spinal twist",
    area: "Mid back",
    holdSeconds: 15,
    reps: 2,
    how: "Sit tall, place your right hand on the chair back and rotate gently right; swap sides.",
  },
  {
    id: "wrist-flexor",
    name: "Wrist flexor stretch",
    area: "Wrists / forearms",
    holdSeconds: 15,
    reps: 2,
    how: "Arm straight, palm up; use the other hand to draw the fingers gently down and back. Swap hands.",
  },
  {
    id: "hip-flexor",
    name: "Standing hip-flexor stretch",
    area: "Hips",
    holdSeconds: 20,
    reps: 2,
    how: "Stand in a short lunge, back knee soft, tuck the pelvis until the front of the back hip stretches; swap legs.",
  },
  {
    id: "hamstring",
    name: "Chair hamstring stretch",
    area: "Hamstrings",
    holdSeconds: 20,
    reps: 2,
    how: "Heel on the floor ahead, leg straight, hinge forward from the hips with a flat back; swap legs.",
  },
];

/**
 * Build a rotating stretch plan for a session.
 *
 * Breaks fall every `intervalMinutes`; each break carries STRETCHES_PER_BREAK
 * stretches taken from the bank in rotation so a six-hour day cycles the whole
 * body instead of repeating the same three stretches.
 *
 * @param {object} input
 * @param {number} input.sessionMinutes    Study day length in minutes.
 * @param {number} [input.intervalMinutes] Break spacing (default 50).
 * @returns {{breaks, breakCount, perBreakSeconds:number[], totalStretchSeconds,
 *            areasCovered}|{error:string}}
 */
export function buildStretchPlan({ sessionMinutes, intervalMinutes = DEFAULT_INTERVAL_MIN }) {
  const session = Number(sessionMinutes);
  if (!Number.isFinite(session)) return { error: "Enter your study day length in minutes." };
  if (session < MIN_SESSION_MINUTES) {
    return { error: `Under ${MIN_SESSION_MINUTES} minutes, one stretch break at the end is enough — plan a longer day here.` };
  }
  if (session > MAX_SESSION_MINUTES) {
    return { error: "Keep one plan at 12 hours or less — and a 12-hour study day needs sleep more than stretches." };
  }

  const interval = Number(intervalMinutes);
  if (!Number.isFinite(interval) || interval < MIN_INTERVAL_MINUTES || interval > MAX_INTERVAL_MINUTES) {
    return { error: `Break spacing must be between ${MIN_INTERVAL_MINUTES} and ${MAX_INTERVAL_MINUTES} minutes.` };
  }

  const breaks = [];
  let breakIndex = 0;
  for (let minute = interval; minute <= session; minute += interval) {
    const stretches = [];
    for (let s = 0; s < STRETCHES_PER_BREAK; s += 1) {
      stretches.push(STRETCHES[(breakIndex * STRETCHES_PER_BREAK + s) % STRETCHES.length]);
    }
    const seconds = stretches.reduce(
      (sum, stretch) => sum + stretch.holdSeconds * stretch.reps,
      0,
    );
    breaks.push({ index: breakIndex + 1, minute, stretches, seconds });
    breakIndex += 1;
  }

  const areasCovered = [
    ...new Set(breaks.flatMap((b) => b.stretches.map((s) => s.area))),
  ];

  return {
    breaks,
    breakCount: breaks.length,
    totalStretchSeconds: breaks.reduce((sum, b) => sum + b.seconds, 0),
    areasCovered,
  };
}
