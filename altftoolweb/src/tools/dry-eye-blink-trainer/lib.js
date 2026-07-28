/**
 * Dry Eye Blink Trainer — logic only. No React, no DOM, no clock reads.
 *
 * Sources for the fixed numbers below:
 *  - Spontaneous blink rate at rest in adults is commonly reported at about
 *    15-20 blinks per minute.
 *  - Tsubota & Nakamori (New England Journal of Medicine, 1993) measured blink
 *    rate falling to roughly a third of the resting rate during visual display
 *    terminal work; screen-work rates of about 5-7 blinks per minute are widely
 *    reported since.
 *  - Incomplete blinks (the lid not fully closing) are frequent during screen
 *    use and are associated with meibomian gland dysfunction and evaporative
 *    dry eye, which is why the drill below asks for a deliberate 2 second
 *    squeeze so the blink completes.
 *  - The 20-20-20 rule (a 20 second distance break every 20 minutes) is the
 *    standard optometric anchor used here for how often to run the drill.
 */

/** Lower end of the normal resting spontaneous blink rate (blinks/min). */
export const RESTING_RATE_LOW = 15;

/** Upper end of the normal resting spontaneous blink rate (blinks/min). */
export const RESTING_RATE_HIGH = 20;

/** Typical blink rate observed during concentrated screen work (blinks/min). */
export const SCREEN_RATE_TYPICAL = 6;

/** Minutes between drills, from the 20-20-20 rule. */
export const DRILL_INTERVAL_MINUTES = 20;

/** Deliberate complete blinks in one drill. */
export const DRILL_BLINKS = 20;

/** Seconds the lids are held shut on the closing blink of the drill. */
export const DRILL_HOLD_SECONDS = 2;

/** Seconds in a minute. */
export const SECONDS_PER_MINUTE = 60;

/** Default pacing for the metronome, in blinks per minute. */
export const DEFAULT_PACED_RATE = 15;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Classify a measured blink rate against the resting range.
 * Returns one of: "normal", "reduced", "severely-reduced", "above-normal".
 */
export function classifyBlinkRate(blinksPerMinute) {
  if (!isNum(blinksPerMinute) || blinksPerMinute < 0) return null;
  if (blinksPerMinute > RESTING_RATE_HIGH) return "above-normal";
  if (blinksPerMinute >= RESTING_RATE_LOW) return "normal";
  if (blinksPerMinute >= SCREEN_RATE_TYPICAL) return "reduced";
  return "severely-reduced";
}

export const BAND_LABELS = {
  normal: "Within the 15-20 resting range",
  reduced: "Reduced — typical of screen work",
  "severely-reduced": "Severely reduced",
  "above-normal": "Above the resting range",
};

export const BAND_ADVICE = {
  normal:
    "Your counted rate sits inside the usual resting range. Keep the drill as a maintenance habit on long screen days, since blink rate falls specifically while concentrating.",
  reduced:
    "This is the pattern seen during concentrated screen work: the rate drops to roughly a third of resting. Deliberate complete blinks and regular distance breaks are the standard first response.",
  "severely-reduced":
    "A rate this low leaves the tear film exposed for long stretches between blinks. Pair the drill with distance breaks, and mention persistent grittiness, burning or fluctuating vision to an optometrist.",
  "above-normal":
    "Blinking faster than the resting range can accompany irritation, glare or an uncorrected prescription rather than dryness. If it is new or forceful, have it checked.",
};

/**
 * Build a blink assessment and drill plan.
 *
 * @param {object} input
 * @param {number} input.blinksCounted    Blinks counted during the test.
 * @param {number} input.countSeconds     Length of the counting window in seconds.
 * @param {number} input.screenHoursPerDay Hours of screen work per day.
 * @param {number} input.drillIntervalMinutes How often the drill runs, in minutes.
 * @param {number} input.drillBlinks      Deliberate blinks per drill.
 * @param {number} input.pacedRate        Metronome pace, blinks per minute.
 * @param {number} input.pacedMinutes     Length of one paced session, in minutes.
 * @returns {object} plan, or { error } for input that cannot produce a real answer.
 */
export function computeBlinkPlan({
  blinksCounted,
  countSeconds,
  screenHoursPerDay,
  drillIntervalMinutes = DRILL_INTERVAL_MINUTES,
  drillBlinks = DRILL_BLINKS,
  pacedRate = DEFAULT_PACED_RATE,
  pacedMinutes = 1,
} = {}) {
  const values = {
    blinksCounted,
    countSeconds,
    screenHoursPerDay,
    drillIntervalMinutes,
    drillBlinks,
    pacedRate,
    pacedMinutes,
  };
  const bad = Object.keys(values).find((key) => !isNum(values[key]));
  if (bad) return { error: "Enter a number in every field." };

  if (countSeconds <= 0) return { error: "The counting window must be longer than zero seconds." };
  if (countSeconds > 600) return { error: "Keep the counting window to 10 minutes or less." };
  if (blinksCounted < 0) return { error: "Blink count cannot be negative." };
  if (blinksCounted > countSeconds * 5) {
    return { error: "That is more than 5 blinks a second — check the count and the window length." };
  }
  if (screenHoursPerDay < 0 || screenHoursPerDay > 24) {
    return { error: "Screen hours must be between 0 and 24." };
  }
  if (drillIntervalMinutes <= 0 || drillIntervalMinutes > 240) {
    return { error: "Run the drill somewhere between every 1 and every 240 minutes." };
  }
  if (drillBlinks <= 0 || drillBlinks > 200) {
    return { error: "Use between 1 and 200 deliberate blinks per drill." };
  }
  if (pacedRate <= 0 || pacedRate > 60) {
    return { error: "Set the pacing between 1 and 60 blinks per minute." };
  }
  if (pacedMinutes <= 0 || pacedMinutes > 60) {
    return { error: "A paced session should be between 1 and 60 minutes." };
  }

  const blinksPerMinute = round1((blinksCounted / countSeconds) * SECONDS_PER_MINUTE);
  const band = classifyBlinkRate(blinksPerMinute);

  // Deficit against the low end of the resting range.
  const deficitPerMinute = round1(Math.max(0, RESTING_RATE_LOW - blinksPerMinute));
  const percentOfResting = round1((blinksPerMinute / RESTING_RATE_LOW) * 100);

  const screenMinutes = Math.round(screenHoursPerDay * SECONDS_PER_MINUTE);
  const missedBlinksPerHour = Math.round(deficitPerMinute * SECONDS_PER_MINUTE);
  const missedBlinksPerDay = Math.round(deficitPerMinute * screenMinutes);

  // Average seconds the eye stays open between blinks — the interblink interval.
  const interblinkSeconds = blinksPerMinute > 0 ? round1(SECONDS_PER_MINUTE / blinksPerMinute) : null;

  const drillsPerDay = Math.floor(screenMinutes / drillIntervalMinutes);
  const drillBlinksPerDay = drillsPerDay * drillBlinks;
  const drillSeconds = Math.round(drillBlinks * (DRILL_HOLD_SECONDS + 1));
  const drillMinutesPerDay = round1((drillsPerDay * drillSeconds) / SECONDS_PER_MINUTE);

  // How much of the shortfall the drill actually replaces.
  const recoveredPercent =
    missedBlinksPerDay > 0
      ? round1(Math.min(100, (drillBlinksPerDay / missedBlinksPerDay) * 100))
      : 100;

  // Paced metronome session.
  const pacedIntervalSeconds = round1(SECONDS_PER_MINUTE / pacedRate);
  const pacedTotalBlinks = Math.round(pacedRate * pacedMinutes);

  return {
    blinksPerMinute,
    band,
    bandLabel: BAND_LABELS[band],
    bandAdvice: BAND_ADVICE[band],
    deficitPerMinute,
    percentOfResting,
    interblinkSeconds,
    restingRange: `${RESTING_RATE_LOW}-${RESTING_RATE_HIGH}`,
    screenMinutes,
    missedBlinksPerHour,
    missedBlinksPerDay,
    drillsPerDay,
    drillBlinks: Math.round(drillBlinks),
    drillBlinksPerDay,
    drillSeconds,
    drillMinutesPerDay,
    drillIntervalMinutes: Math.round(drillIntervalMinutes),
    recoveredPercent,
    pacedRate,
    pacedIntervalSeconds,
    pacedTotalBlinks,
    pacedMinutes,
  };
}

/** The drill itself, in the order it should be performed. */
export const DRILL_STEPS = [
  ["Close gently", "Let the lids fall shut without squeezing — this is the normal half of the blink."],
  ["Squeeze", `Hold the lids firmly shut for ${DRILL_HOLD_SECONDS} seconds so the gland openings are compressed.`],
  ["Open", "Open wide and relax the brow. That is one complete blink."],
  ["Repeat", `Run ${DRILL_BLINKS} of these, then look at least 6 metres away for 20 seconds.`],
];
