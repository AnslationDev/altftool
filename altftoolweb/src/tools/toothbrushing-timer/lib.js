/**
 * Toothbrushing timer logic.
 *
 * Pure module — no React, no DOM, no clock reads. Elapsed time and dates are
 * passed in as arguments so the same input always produces the same output.
 * Informational only: general oral-hygiene guidance, not personal dental advice.
 */

/* Brush for two minutes, twice a day — the standard recommendation from the
   major dental associations and national health services. */
export const RECOMMENDED_SECONDS = 120;
export const RECOMMENDED_SESSIONS_PER_DAY = 2;

export const MIN_SECONDS = 30;
export const MAX_SECONDS = 600;
export const MIN_SESSIONS_PER_DAY = 1;
export const MAX_SESSIONS_PER_DAY = 6;

/* Manual toothbrushes and powered brush heads are replaced every 3 to 4 months,
   or sooner once the bristles splay. This tool uses the 3-month end of the range. */
export const BRUSH_LIFE_DAYS = 90;

/**
 * How the mouth is divided. Four quadrants is the classic split (30 seconds each
 * over two minutes); six sextants and eight zones are the finer divisions used in
 * dental charting and by many powered brushes.
 */
export const ZONE_SETS = {
  4: [
    { name: "Upper right", detail: "Outer and inner surfaces of the top right teeth" },
    { name: "Upper left", detail: "Outer and inner surfaces of the top left teeth" },
    { name: "Lower left", detail: "Outer and inner surfaces of the bottom left teeth" },
    { name: "Lower right", detail: "Outer and inner surfaces of the bottom right teeth" },
  ],
  6: [
    { name: "Upper right", detail: "Back teeth, top right" },
    { name: "Upper front", detail: "Top front teeth, outside and behind" },
    { name: "Upper left", detail: "Back teeth, top left" },
    { name: "Lower left", detail: "Back teeth, bottom left" },
    { name: "Lower front", detail: "Bottom front teeth, outside and behind" },
    { name: "Lower right", detail: "Back teeth, bottom right" },
  ],
  8: [
    { name: "Upper right — outer", detail: "Cheek side of the top right teeth" },
    { name: "Upper right — inner", detail: "Tongue side of the top right teeth" },
    { name: "Upper left — outer", detail: "Cheek side of the top left teeth" },
    { name: "Upper left — inner", detail: "Tongue side of the top left teeth" },
    { name: "Lower left — outer", detail: "Cheek side of the bottom left teeth" },
    { name: "Lower left — inner", detail: "Tongue side of the bottom left teeth" },
    { name: "Lower right — outer", detail: "Cheek side of the bottom right teeth" },
    { name: "Lower right — inner", detail: "Tongue side of the bottom right teeth" },
  ],
};

export const ALLOWED_SEGMENTS = Object.keys(ZONE_SETS).map(Number);

/** Modified Bass technique cues, cycled across the segments. */
export const TECHNIQUE_CUES = [
  "Hold the bristles at 45° to the gum line, not flat against the tooth.",
  "Short strokes, two or three teeth at a time — no long sawing.",
  "Light pressure. If the bristles splay outwards you are pushing too hard.",
  "Angle the brush vertically to reach behind the front teeth.",
  "Do not forget the chewing surfaces — a few gentle scrubs each.",
  "Brush along the gum margin, where plaque actually collects.",
  "Keep the brush moving; do not park it on one tooth.",
  "Finish by brushing the tongue gently from back to front.",
];

/**
 * Fluoride toothpaste guidance by age, in parts per million (ppm) of fluoride.
 * These are the amounts published by national health services for general use;
 * higher-strength pastes (2800 or 5000 ppm) are prescribed by a dentist only.
 */
export const FLUORIDE_GUIDANCE = [
  {
    maxAge: 2,
    label: "Under 3 years",
    amount: "A smear, no bigger than a grain of rice",
    ppm: "at least 1000 ppm fluoride",
    note: "An adult should do the brushing. Spit out what you can; do not rinse.",
  },
  {
    maxAge: 6,
    label: "3 to 6 years",
    amount: "A pea-sized blob",
    ppm: "1350–1500 ppm fluoride",
    note: "Supervise brushing and discourage swallowing the paste.",
  },
  {
    maxAge: 120,
    label: "7 years and over",
    amount: "A pea-sized blob",
    ppm: "1350–1500 ppm fluoride",
    note: "Spit out, do not rinse — rinsing washes the fluoride straight off the enamel.",
  },
];

/* Enamel is temporarily softened by acidic food and drink, so brushing is
   delayed rather than done immediately afterwards. */
export const WAIT_AFTER_ACID_MINUTES = 30;

/** Fixed reminders shown alongside every plan. */
export const AFTER_BRUSHING = [
  "Spit out the excess paste — do not rinse with water or mouthwash straight afterwards.",
  "Clean between the teeth once a day with floss or interdental brushes; a toothbrush reaches only about three of the five tooth surfaces.",
  `Wait about ${WAIT_AFTER_ACID_MINUTES} minutes after acidic food or drink before brushing, because enamel is softened.`,
  "Do not share a toothbrush, and store it upright to air dry rather than in a sealed cap.",
];

const clean = (value) => (typeof value === "string" ? value.trim() : "");

export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(value));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day, ms: probe.getTime() };
}

/** Add whole days to an ISO date and return a new ISO date. */
export function addDaysIso(isoDate, days) {
  const date = parseIsoDate(isoDate);
  if (!date || !Number.isInteger(days)) return null;
  const next = new Date(date.ms + days * 86400000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

/** Format whole seconds as m:ss. */
export function formatClock(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/**
 * Split a total number of seconds into N whole-second segments. Any remainder is
 * spread one second at a time across the earliest segments, so the parts always
 * add back up to the total exactly.
 */
export function splitSeconds(totalSeconds, segments) {
  if (!Number.isInteger(totalSeconds) || !Number.isInteger(segments)) return null;
  if (totalSeconds <= 0 || segments <= 0 || segments > totalSeconds) return null;
  const base = Math.floor(totalSeconds / segments);
  const remainder = totalSeconds - base * segments;
  return Array.from({ length: segments }, (_, index) => base + (index < remainder ? 1 : 0));
}

/** Fluoride guidance row for an age in whole years. */
export function fluorideFor(ageYears) {
  if (!Number.isFinite(ageYears) || ageYears < 0) return null;
  return FLUORIDE_GUIDANCE.find((row) => ageYears <= row.maxAge) || FLUORIDE_GUIDANCE[FLUORIDE_GUIDANCE.length - 1];
}

/**
 * Build the brushing plan.
 * @returns {{error: string}|object}
 */
export function buildBrushingPlan(input = {}) {
  const totalSeconds = Number(input.totalSeconds);
  const segments = Number(input.segments);
  const ageYears = Number(input.ageYears);
  const sessionsPerDay = Number(input.sessionsPerDay);
  const brushStartDate = clean(input.brushStartDate);

  if (!Number.isFinite(totalSeconds) || !Number.isInteger(totalSeconds)) {
    return { error: "Brushing time must be a whole number of seconds." };
  }
  if (totalSeconds < MIN_SECONDS || totalSeconds > MAX_SECONDS) {
    return { error: `Brushing time must be between ${MIN_SECONDS} and ${MAX_SECONDS} seconds.` };
  }
  if (!ALLOWED_SEGMENTS.includes(segments)) {
    return { error: `Split the mouth into ${ALLOWED_SEGMENTS.join(", ")} zones.` };
  }
  if (!Number.isFinite(ageYears) || ageYears < 0 || ageYears > 120) {
    return { error: "Age must be between 0 and 120 years." };
  }
  if (!Number.isFinite(sessionsPerDay) || sessionsPerDay < MIN_SESSIONS_PER_DAY || sessionsPerDay > MAX_SESSIONS_PER_DAY) {
    return { error: `Sessions per day must be between ${MIN_SESSIONS_PER_DAY} and ${MAX_SESSIONS_PER_DAY}.` };
  }
  if (brushStartDate && !parseIsoDate(brushStartDate)) {
    return { error: "Brush start date must be a real date in YYYY-MM-DD form." };
  }

  const lengths = splitSeconds(totalSeconds, segments);
  if (!lengths) {
    return { error: "That many zones does not divide into that many seconds. Add time or use fewer zones." };
  }

  const zones = ZONE_SETS[segments];
  let cursor = 0;
  const schedule = lengths.map((seconds, index) => {
    const startSecond = cursor;
    cursor += seconds;
    return {
      index,
      zone: zones[index].name,
      detail: zones[index].detail,
      cue: TECHNIQUE_CUES[index % TECHNIQUE_CUES.length],
      seconds,
      startSecond,
      endSecond: cursor,
    };
  });

  const fluoride = fluorideFor(ageYears);
  const dailySeconds = totalSeconds * sessionsPerDay;
  const weeklyMinutes = (dailySeconds * 7) / 60;
  const replaceBy = brushStartDate ? addDaysIso(brushStartDate, BRUSH_LIFE_DAYS) : null;

  const warnings = [];
  if (totalSeconds < RECOMMENDED_SECONDS) {
    warnings.push(
      `${totalSeconds} seconds is under the recommended ${RECOMMENDED_SECONDS} seconds. Most people already overestimate how long they brush.`,
    );
  }
  if (sessionsPerDay < RECOMMENDED_SESSIONS_PER_DAY) {
    warnings.push(
      `Brushing ${sessionsPerDay} time a day is below the usual advice of ${RECOMMENDED_SESSIONS_PER_DAY} — once being last thing at night.`,
    );
  }
  if (sessionsPerDay > 3) {
    warnings.push("More than three brushings a day adds abrasion without much extra benefit. Cleaning between the teeth is the bigger win.");
  }
  if (ageYears <= 6) {
    warnings.push("Children up to about seven need an adult to brush for them or to go over it afterwards — their coordination is not there yet.");
  }
  if (!brushStartDate) {
    warnings.push("Add the date you started this brush head to get a replacement date.");
  }

  return {
    totalSeconds,
    segments,
    schedule,
    secondsPerZone: lengths,
    evenSplit: lengths.every((value) => value === lengths[0]),
    fluoride,
    ageYears,
    sessionsPerDay,
    dailySeconds,
    weeklyMinutes,
    brushStartDate: brushStartDate || null,
    replaceBy,
    brushLifeDays: BRUSH_LIFE_DAYS,
    afterBrushing: AFTER_BRUSHING,
    warnings,
  };
}

/**
 * Which segment is running at a given elapsed time.
 * @returns {object|null} the segment, or null once the session is over
 */
export function segmentAtSecond(schedule, elapsedSeconds) {
  if (!Array.isArray(schedule) || !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) return null;
  return schedule.find((segment) => elapsedSeconds >= segment.startSecond && elapsedSeconds < segment.endSecond) || null;
}
