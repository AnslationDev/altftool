/**
 * Patch test timing and reaction logging.
 *
 * Two different procedures share the name "patch test", and this module models
 * both with their own published timings:
 *
 * 1. CLINICAL patch testing for allergic contact dermatitis. The International
 *    Contact Dermatitis Research Group (ICDRG) standard is: apply the chambers
 *    on day 0, remove and take the first reading at 48 hours, take a second
 *    reading at 72-96 hours, and take an optional late reading at day 7 for
 *    allergens known for delayed positives such as metals, neomycin and
 *    corticosteroids. A reaction read only at 48 hours misses a meaningful
 *    share of true positives, which is why the second reading is mandatory.
 *
 * 2. HOME cosmetic / hair-dye allergy alert testing. EU cosmetic labelling for
 *    oxidative hair colourants carrying p-phenylenediamine (PPD) and related
 *    dyes instructs an allergy alert test 48 hours before EACH colouration:
 *    apply a small amount behind the ear or to the inner elbow, leave it
 *    uncovered and undisturbed, and check it over the full 48 hours.
 *
 * All timings below are hours from application. Nothing here reads the system
 * clock: the application time is always supplied by the caller.
 */

/** Milliseconds in one hour. */
export const MS_PER_HOUR = 3600000;

/** ICDRG clinical reading schedule, in hours after application. */
export const CLINICAL_MILESTONES = Object.freeze([
  {
    key: "apply",
    hours: 0,
    title: "Patches applied",
    detail: "Chambers go on the upper back. Keep the area dry, avoid sweating and do not sunbathe.",
  },
  {
    key: "removal",
    hours: 48,
    title: "Remove patches — first reading",
    detail:
      "Patches come off and the first ICDRG reading is taken. Mark the chamber positions before removing so the sites can be identified later.",
  },
  {
    key: "second",
    hours: 96,
    title: "Second reading (72-96 h)",
    detail:
      "The decisive reading. Reactions that were faint at 48 hours often crescendo by now, and irritant reactions usually fade.",
  },
  {
    key: "late",
    hours: 168,
    title: "Late reading (day 7)",
    detail:
      "Optional but advised for metals, neomycin and corticosteroids, which can turn positive only in the second week.",
    optional: true,
  },
]);

/** Home cosmetic / hair dye allergy alert test schedule, in hours. */
export const HOME_MILESTONES = Object.freeze([
  {
    key: "apply",
    hours: 0,
    title: "Apply the test patch",
    detail:
      "A small amount behind the ear or on the inner elbow. Leave it uncovered, unwashed and undisturbed.",
  },
  {
    key: "early",
    hours: 1,
    title: "Early check (1 hour)",
    detail:
      "Look for immediate stinging, hives or swelling. Wash the area off at once and stop the test if any appear.",
  },
  {
    key: "day1",
    hours: 24,
    title: "24 hour check",
    detail: "Check for redness, itching, small bumps or a burning feeling at the site.",
  },
  {
    key: "day2",
    hours: 48,
    title: "48 hour reading — decision point",
    detail:
      "The reading the product instructions are built around. A clear site here is the condition for going ahead.",
  },
  {
    key: "delayed",
    hours: 72,
    title: "Delayed watch (72 hours)",
    detail: "Not part of the label instructions, but late reactions do happen — keep an eye on the site.",
    optional: true,
  },
]);

/** EU hair-colourant instruction: test at least 48 hours before each colouration. */
export const HAIR_DYE_LEAD_HOURS = 48;

/** ICDRG reaction grading scale. */
export const ICDRG_GRADES = Object.freeze([
  { code: "NT", label: "Not read yet", meaning: "No reading recorded for this time point.", positive: false, rank: -1 },
  { code: "-", label: "Negative", meaning: "No visible change at the site.", positive: false, rank: 0 },
  { code: "?+", label: "Doubtful", meaning: "Faint redness only, no raised skin.", positive: false, rank: 1 },
  { code: "IR", label: "Irritant", meaning: "Sharply bordered, glazed or scalded look; usually fades after patch removal.", positive: false, rank: 2 },
  { code: "+", label: "Weak positive", meaning: "Redness with palpable thickening, sometimes scattered papules.", positive: true, rank: 3 },
  { code: "++", label: "Strong positive", meaning: "Redness, thickening, papules and vesicles.", positive: true, rank: 4 },
  { code: "+++", label: "Extreme positive", meaning: "Intense redness with merging vesicles or blistering.", positive: true, rank: 5 },
]);

/** Latest application time this planner accepts, as hours before the last milestone. */
export const MAX_SCHEDULE_HOURS = 168;

export function gradeByCode(code) {
  return ICDRG_GRADES.find((grade) => grade.code === code) || null;
}

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Format an epoch-millisecond value for display. */
export function formatDateTime(ms) {
  if (!Number.isFinite(ms)) return "—";
  return DATE_TIME_FORMAT.format(new Date(ms));
}

/**
 * Format an hour offset. Readings up to and including 96 hours are named in
 * hours, matching how the ICDRG schedule is written; anything later is easier
 * to read as a day number.
 */
export const HOURS_NAMED_IN_HOURS = 96;

export function formatOffset(hours) {
  if (!Number.isFinite(hours)) return "—";
  if (hours === 0) return "start";
  if (hours > HOURS_NAMED_IN_HOURS && hours % 24 === 0) return `day ${hours / 24}`;
  return `${hours} h`;
}

/**
 * Parse a datetime-local string ("YYYY-MM-DDTHH:MM") into epoch milliseconds.
 * Returns null when the string is not a valid local datetime.
 */
export function parseLocalDateTime(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null;
  const date = new Date(y, mo - 1, d, h, mi, 0, 0);
  if (Number.isNaN(date.getTime())) return null;
  // Reject impossible calendar dates such as 2026-02-30, which Date rolls over.
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date.getTime();
}

/**
 * Build a patch test schedule.
 *
 * @param {object} input
 * @param {string} input.appliedAt         Local datetime "YYYY-MM-DDTHH:MM".
 * @param {string} input.mode              "clinical" | "home".
 * @param {boolean} input.includeOptional  Include the optional late reading.
 * @param {Object<string,string>} input.readings Milestone key -> ICDRG code.
 * @returns {object|{error:string}}
 */
export function buildPatchTestPlan(input) {
  const { appliedAt, mode, includeOptional, readings } = input || {};

  const startMs = parseLocalDateTime(appliedAt);
  if (startMs === null) return { error: "Enter the date and time you applied the patch." };
  if (mode !== "clinical" && mode !== "home") {
    return { error: "Choose a test type: clinical patch testing or a home cosmetic test." };
  }

  const source = mode === "clinical" ? CLINICAL_MILESTONES : HOME_MILESTONES;
  const chosen = source.filter((milestone) => includeOptional || !milestone.optional);

  const recorded = readings && typeof readings === "object" ? readings : {};
  const milestones = chosen.map((milestone) => {
    const code = Object.prototype.hasOwnProperty.call(recorded, milestone.key) ? recorded[milestone.key] : "NT";
    const grade = gradeByCode(code) || gradeByCode("NT");
    return {
      ...milestone,
      at: startMs + milestone.hours * MS_PER_HOUR,
      offsetLabel: formatOffset(milestone.hours),
      grade,
    };
  });

  const scored = milestones.filter((milestone) => milestone.key !== "apply" && milestone.grade.rank >= 0);
  const worst = scored.reduce(
    (best, milestone) => (best === null || milestone.grade.rank > best.grade.rank ? milestone : best),
    null,
  );

  let verdict;
  if (scored.length === 0) {
    verdict = {
      tone: "neutral",
      headline: "No readings recorded yet",
      detail: "Log each reading as you take it so a late positive is not missed.",
    };
  } else if (worst && worst.grade.positive) {
    verdict = {
      tone: "danger",
      headline: `Positive reaction recorded (${worst.grade.code})`,
      detail:
        mode === "home"
          ? "Do not use the product. A positive at any reading counts, and reactions tend to be stronger on next exposure."
          : "A positive at any reading counts. Your clinician will decide whether it is relevant to your dermatitis.",
    };
  } else if (worst && worst.grade.code === "IR") {
    verdict = {
      tone: "warn",
      headline: "Irritant pattern recorded",
      detail:
        "Irritant reactions are sharply bordered and fade quickly after the patch comes off — they are not an allergy, but the site still reacted. Have it assessed rather than assuming it is safe.",
    };
  } else if (worst && worst.grade.code === "?+") {
    verdict = {
      tone: "warn",
      headline: "Doubtful reaction recorded",
      detail: "Faint redness alone is inconclusive. Repeat the test or have it read by a clinician before proceeding.",
    };
  } else {
    const complete = scored.length === milestones.length - 1;
    verdict = {
      tone: complete ? "success" : "neutral",
      headline: complete ? "All scheduled readings negative" : "Negative so far",
      detail: complete
        ? mode === "home"
          ? "A clear result today does not carry over — hair colourant instructions require a fresh test 48 hours before each colouration."
          : "A fully negative series makes contact allergy to the tested substances unlikely, but does not rule out every cause."
        : "Keep going — the later reading is the one that catches slow-building reactions.",
    };
  }

  const readyAtMs = mode === "home" ? startMs + HAIR_DYE_LEAD_HOURS * MS_PER_HOUR : null;

  return {
    mode,
    startMs,
    milestones,
    readingsRecorded: scored.length,
    readingsExpected: milestones.length - 1,
    worstGrade: worst ? worst.grade : null,
    worstAt: worst ? worst.title : null,
    verdict,
    readyAtMs,
    totalHours: milestones[milestones.length - 1].hours,
  };
}
