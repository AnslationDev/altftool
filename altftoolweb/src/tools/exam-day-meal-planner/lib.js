/**
 * Exam day meal planner — works BACKWARD from the reporting time printed on
 * the admit card to a meal-and-hydration timeline.
 *
 * Leads follow general sports/performance-nutrition guidance on gastric
 * emptying and pre-event eating (as summarised in ACSM/ISSN-style position
 * guidance): a full mixed meal takes roughly 3-4 hours to clear the stomach,
 * so the last MAIN meal ends >= 3 hours before reporting; a small
 * carbohydrate snack sits comfortably 1-1.5 hours out; and large fluid
 * intake stops ~45 minutes before so a washroom trip happens at home, not at
 * the exam gate. These are informational defaults, not medical advice.
 */

/** Finish the last full meal at least this long before reporting (gastric emptying ~3-4 h). */
export const MAIN_MEAL_LEAD_MIN = 180;

/** Light carbohydrate snack lead — 60-90 min out; 75 is the midpoint. */
export const SNACK_LEAD_MIN = 75;

/** Stop LARGE drinks this long before reporting; small sips remain fine. */
export const LAST_BIG_DRINK_LEAD_MIN = 45;

/** Freshen-up + unhurried breakfast time between waking and leaving home. */
export const WAKE_TO_LEAVE_MIN = 90;

/** Safety margin added on top of travel time for delays and gate queues. */
export const TRAVEL_SAFETY_MARGIN_MIN = 20;

/** Longest plausible one-way exam-centre journey the planner accepts. */
export const MAX_TRAVEL_MINUTES = 300;

/**
 * A wake-up at or after this clock time is an ordinary morning. Earlier than this is
 * treated as a genuine early-morning shift, independent of travel time. This must be
 * an absolute clock-time check rather than a comparison between two report-derived
 * offsets: `wake` (report - travel - 110) and `mainMeal` (report - 180) both move with
 * `report`, so comparing them directly cancels the reporting time out of the condition
 * algebraically and leaves it depending only on travel time.
 */
export const EARLY_WAKE_THRESHOLD_MIN = 5 * 60;

/** Steady-energy choices — familiar, lower-GI staples that avoid a sugar spike-crash. */
export const EAT_SUGGESTIONS = [
  "Oats / dalia porridge with milk",
  "Idli or plain dosa with sambar",
  "Poha or upma with peanuts",
  "Roti with dal and curd",
  "Banana, apple or a handful of nuts (snack)",
  "Curd rice or khichdi (light lunch before afternoon shifts)",
];

/** Common exam-day mistakes: heavy fats, untested foods and sugar bombs. */
export const AVOID_SUGGESTIONS = [
  "Fried or oily breakfast (puri, pakora, heavy paratha)",
  "Any food you have never eaten before exam day",
  "Sugary energy drinks or cola on an empty stomach",
  "Very spicy food that risks stomach upset",
  "Heavy dairy if you are lactose sensitive",
  "Skipping food entirely — low blood sugar hurts recall",
];

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Parse "HH:MM" (24 h) into minutes after midnight, or null when invalid. */
export function parseTime(value) {
  if (typeof value !== "string") return null;
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

const MINUTES_PER_DAY = 24 * 60;

/** Format minutes-after-midnight as "HH:MM", wrapping across midnight. */
export function formatTime(totalMinutes) {
  // Round to the nearest whole minute first: a non-integer input (e.g. a fractional
  // travel time flowing through unchanged) would otherwise leave a fractional
  // remainder in `wrapped % 60`, producing an invalid string like "08:2.75".
  const rounded = Math.round(Number(totalMinutes) || 0);
  const wrapped = ((rounded % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const minutes = String(wrapped % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Build the backward timeline.
 *
 * @param {object} input
 * @param {string} input.reportingTime  "HH:MM" from the admit card.
 * @param {number} input.travelMinutes  Door-to-gate travel time, minutes.
 * @returns {{events:Array, earlyStart:boolean}|{error:string}}
 */
export function planExamDayMeals({ reportingTime, travelMinutes }) {
  const report = parseTime(reportingTime);
  if (report === null) {
    return { error: "Enter the reporting time from your admit card as HH:MM (24-hour)." };
  }
  const travel = Number(travelMinutes);
  if (!Number.isFinite(travel) || travel < 0) {
    return { error: "Travel time cannot be negative." };
  }
  if (travel > MAX_TRAVEL_MINUTES) {
    return { error: `Travel time above ${MAX_TRAVEL_MINUTES} minutes needs an overnight stay plan, not a meal timeline.` };
  }

  const leaveHome = report - travel - TRAVEL_SAFETY_MARGIN_MIN;
  const idealMainMeal = report - MAIN_MEAL_LEAD_MIN;
  // The main meal has to finish before the candidate leaves home. A long journey can
  // force departure earlier than the ideal 3-hour-out slot, so cap the meal at
  // leaveHome instead of letting "Finish your main meal" sort after "Leave home".
  const mainMeal = Math.min(idealMainMeal, leaveHome);
  const mealPushedByTravel = mainMeal < idealMainMeal;
  // Wake up early enough both for the standard freshen-up-and-travel window before
  // leaving AND to already be up in time for the main meal -- otherwise a short
  // journey (which pushes the travel-only wake time later) can leave "Wake up"
  // sorting after "Finish your main meal", the same impossible-itinerary shape as the
  // travel case above.
  const wake = Math.min(leaveHome - WAKE_TO_LEAVE_MIN, mainMeal);
  const snack = report - SNACK_LEAD_MIN;
  // The last big drink must happen while still at home, so it is pulled
  // earlier whenever the journey (travel + margin) is longer than 45 min.
  const lastBigDrink = Math.min(report - LAST_BIG_DRINK_LEAD_MIN, leaveHome);

  // Early-morning shift: waking before a sensible hour to fit the standard
  // wake -> freshen up -> travel sequence means a full meal will not realistically
  // happen the same morning, so the previous night's dinner becomes the real fuel and
  // the morning meal stays light. This is checked against an absolute clock time
  // rather than against `mainMeal`: both `wake` and `mainMeal` are offsets from
  // `report`, so comparing them directly cancels `report` out of the condition and
  // leaves it depending only on travel time, firing for ordinary daytime exams too.
  const earlyStart = wake < EARLY_WAKE_THRESHOLD_MIN;

  const mkEvent = (minutes, label, detail) => ({
    time: formatTime(minutes),
    previousDay: minutes < 0,
    label,
    detail,
    sortKey: minutes,
  });

  const events = [
    mkEvent(
      wake,
      "Wake up",
      // leaveHome - wake is usually WAKE_TO_LEAVE_MIN, but the main meal's deadline
      // can pull wake earlier than that, so report the actual gap rather than the
      // constant. Rounded for the same reason formatTime rounds: a fractional travel
      // input would otherwise print a fractional minute count here.
      `Leaves ${Math.round(leaveHome - wake)} minutes to freshen up and eat without hurrying.`,
    ),
    earlyStart
      ? mkEvent(
          wake,
          "Light breakfast only",
          "Reporting is too close to wake-up for a full meal — keep it small (banana, poha, toast) and make the previous night's dinner the real fuel.",
        )
      : mkEvent(
          mainMeal,
          "Finish your main meal",
          mealPushedByTravel
            ? "Your travel time pushes departure earlier than the usual 3-hour-out slot, so finish eating by the time you leave home."
            : "A familiar, lower-GI plate finished 3 hours out clears the stomach before the paper starts.",
        ),
    mkEvent(
      snack,
      "Small carbohydrate snack",
      snack > leaveHome
        ? "60-90 minutes out — carry a banana or a few nuts, since you will already be travelling."
        : "A banana or a few nuts 60-90 minutes out tops up energy without heaviness.",
    ),
    mkEvent(
      lastBigDrink,
      "Last big glass of water",
      "Switch to small sips after this so the washroom trip happens at home.",
    ),
    mkEvent(
      leaveHome,
      "Leave home",
      `Travel ${Math.round(travel)} min plus a ${TRAVEL_SAFETY_MARGIN_MIN}-minute margin for delays and gate queues.`,
    ),
    mkEvent(report, "Reporting time", "The time printed on your admit card. Gates often close after it."),
  ];

  events.sort((a, b) => a.sortKey - b.sortKey);

  return {
    events: events.map(({ sortKey, ...rest }) => rest),
    earlyStart,
    eat: EAT_SUGGESTIONS,
    avoid: AVOID_SUGGESTIONS,
  };
}
