/**
 * Event Planning Prompt Builder — pure logic.
 *
 * Builds a clock-accurate run of show from segment durations, sizes the room
 * and the crew from the headcount using published planner ratios, and composes
 * a logistics prompt from those numbers.
 *
 * No React, no DOM, no Date.now() — the start time is passed in as a string.
 */

/** OpenAI's published English rule of thumb: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

export const MINUTES_PER_DAY = 24 * 60;
/** Exact conversion: 1 square metre = 10.7639104 square feet. */
export const SQFT_PER_SQM = 10.7639104;

export const MIN_ATTENDEES = 1;
export const MAX_ATTENDEES = 100000;
export const MAX_SEGMENT_MINUTES = 600;
export const MAX_SEGMENTS = 40;

/**
 * Floor area per person by seating layout. These are the long-standing event
 * planning allowances (theatre ~8 sq ft, banquet rounds ~13 sq ft, classroom
 * ~18 sq ft, standing reception ~7 sq ft per person) converted to square metres.
 * They cover seats only — stage, buffet, aisles and back of house are added
 * separately through the circulation allowance below.
 */
export const SEATING_STYLES = [
  { id: "theatre", label: "Theatre (rows of chairs)", sqmPerPerson: 0.74, sqftPerPerson: 8 },
  { id: "classroom", label: "Classroom (tables and chairs)", sqmPerPerson: 1.67, sqftPerPerson: 18 },
  { id: "banquet", label: "Banquet rounds", sqmPerPerson: 1.21, sqftPerPerson: 13 },
  { id: "cabaret", label: "Cabaret (half rounds)", sqmPerPerson: 1.49, sqftPerPerson: 16 },
  { id: "reception", label: "Standing reception", sqmPerPerson: 0.65, sqftPerPerson: 7 },
  { id: "boardroom", label: "Boardroom / U-shape", sqmPerPerson: 2.32, sqftPerPerson: 25 },
];

/** Planner allowance for stage, aisles, buffet, registration and back of house. */
export const CIRCULATION_ALLOWANCE = 0.25;

/** Staffing rules of thumb used across event operations. */
export const ATTENDEES_PER_CHECKIN_STATION = 100;
export const ATTENDEES_PER_CREW_MEMBER = 50;
export const GUESTS_PER_SERVER_PLATED = 20;
export const GUESTS_PER_SERVER_BUFFET = 35;
export const GUESTS_PER_BUFFET_LINE = 100;
/** A single buffet line serves roughly 100 guests an hour when double sided. */
export const GUESTS_PER_LINE_PER_HOUR = 100;

export const CATERING_STYLES = [
  { id: "none", label: "No catering", perServer: 0, buffet: false },
  { id: "plated", label: "Plated / served meal", perServer: GUESTS_PER_SERVER_PLATED, buffet: false },
  { id: "buffet", label: "Buffet", perServer: GUESTS_PER_SERVER_BUFFET, buffet: true },
  { id: "canapes", label: "Canapes / passed bites", perServer: GUESTS_PER_SERVER_BUFFET, buffet: false },
];

export const EVENT_TYPES = [
  "Conference",
  "Product launch",
  "Team offsite",
  "Training workshop",
  "Awards night",
  "Community meetup",
  "Trade stall / expo",
  "Webinar with live audience",
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

const pad = (value) => String(value).padStart(2, "0");

/** "HH:MM" (24-hour) -> minutes past midnight. NaN when malformed. */
export function parseClock(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || "").trim());
  if (!match) return NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return NaN;
  return hours * 60 + minutes;
}

/** Minutes past midnight -> "HH:MM", wrapping past midnight. */
export function formatClock(totalMinutes) {
  if (!isFiniteNumber(totalMinutes)) return "";
  const wrapped = ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
}

export function formatDuration(minutes) {
  if (!isFiniteNumber(minutes) || minutes < 0) return "";
  const whole = Math.round(minutes);
  const hours = Math.floor(whole / 60);
  const rest = whole % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

/** Parse "Name | 30" lines (also accepts "Name - 30" and "Name, 30"). */
export function parseSegments(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_SEGMENTS)
    .map((line) => {
      const match = /^(.*?)[|,\-–]\s*(\d+(?:\.\d+)?)\s*(?:m|min|mins|minutes)?$/i.exec(line);
      if (!match) return { name: line, minutes: NaN, raw: line };
      return { name: match[1].trim(), minutes: Number(match[2]), raw: line };
    });
}

/** Lay segments on a clock. Returns { error } for bad input. */
export function buildRunOfShow(startTimeText, segments) {
  const start = parseClock(startTimeText);
  if (Number.isNaN(start)) return { error: "Start time must be in 24-hour HH:MM form, for example 18:30." };

  const list = Array.isArray(segments) ? segments : [];
  if (list.length === 0) return { error: "Add at least one agenda line, in the form: Segment name | 30" };

  const bad = list.find(
    (item) => !isFiniteNumber(item.minutes) || item.minutes <= 0 || item.minutes > MAX_SEGMENT_MINUTES
  );
  if (bad) {
    return {
      error: `"${bad.raw}" has no usable duration. Use "Name | minutes" with a number between 1 and ${MAX_SEGMENT_MINUTES}.`,
    };
  }

  let cursor = start;
  const rows = list.map((item) => {
    const from = cursor;
    cursor += item.minutes;
    return {
      name: item.name || "Untitled segment",
      minutes: item.minutes,
      startsAt: formatClock(from),
      endsAt: formatClock(cursor),
      offsetMinutes: from - start,
    };
  });

  const totalMinutes = cursor - start;
  if (totalMinutes > MINUTES_PER_DAY) {
    return { error: "The agenda adds up to more than 24 hours — split it into separate days." };
  }

  return {
    rows,
    totalMinutes,
    startClock: formatClock(start),
    endClock: formatClock(cursor),
    crossesMidnight: start + totalMinutes >= MINUTES_PER_DAY,
  };
}

/** Room area, crew and catering counts from the headcount. */
export function computeLogistics(attendees, seatingId, cateringId) {
  if (!isFiniteNumber(attendees) || attendees <= 0) return null;
  const seating = SEATING_STYLES.find((item) => item.id === seatingId) || SEATING_STYLES[0];
  const catering = CATERING_STYLES.find((item) => item.id === cateringId) || CATERING_STYLES[0];

  const seatedSqm = attendees * seating.sqmPerPerson;
  const totalSqm = seatedSqm * (1 + CIRCULATION_ALLOWANCE);
  const buffetLines = catering.buffet ? Math.ceil(attendees / GUESTS_PER_BUFFET_LINE) : 0;
  const buffetMinutes = buffetLines > 0
    ? Math.ceil((attendees / (buffetLines * GUESTS_PER_LINE_PER_HOUR)) * 60)
    : 0;

  return {
    seating,
    catering,
    seatedSqm,
    totalSqm,
    totalSqft: totalSqm * SQFT_PER_SQM,
    checkInStations: Math.ceil(attendees / ATTENDEES_PER_CHECKIN_STATION),
    crew: Math.ceil(attendees / ATTENDEES_PER_CREW_MEMBER),
    servers: catering.perServer > 0 ? Math.ceil(attendees / catering.perServer) : 0,
    buffetLines,
    buffetMinutes,
  };
}

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export function buildEventPrompt(input) {
  const {
    eventName = "",
    eventType = "Conference",
    attendees,
    seating = "theatre",
    catering = "buffet",
    startTime = "09:30",
    agendaText = "",
    venue = "",
    risks = "",
  } = input || {};

  const headcount = Number(attendees);
  if (!isFiniteNumber(headcount) || !Number.isInteger(headcount)) {
    return { error: "Expected attendance must be a whole number." };
  }
  if (headcount < MIN_ATTENDEES || headcount > MAX_ATTENDEES) {
    return { error: `Expected attendance should be between ${MIN_ATTENDEES} and ${MAX_ATTENDEES}.` };
  }

  const segments = parseSegments(agendaText);
  const show = buildRunOfShow(startTime, segments);
  if (show.error) return { error: show.error };

  const logistics = computeLogistics(headcount, seating, catering);

  const showLines = show.rows.map(
    (row) => `- ${row.startsAt}-${row.endsAt} (${formatDuration(row.minutes)}): ${row.name}`
  );

  const logisticsLines = [
    `Headcount: ${headcount}`,
    `Layout: ${logistics.seating.label} — about ${Math.round(logistics.totalSqm)} sq m (${Math.round(logistics.totalSqft)} sq ft) including a ${Math.round(CIRCULATION_ALLOWANCE * 100)}% allowance for stage, aisles and back of house`,
    `Check-in: ${logistics.checkInStations} station${logistics.checkInStations === 1 ? "" : "s"} at one per ${ATTENDEES_PER_CHECKIN_STATION} attendees`,
    `Crew: ${logistics.crew} on-site staff at one per ${ATTENDEES_PER_CREW_MEMBER} attendees`,
    logistics.catering.id === "none"
      ? "Catering: none planned"
      : `Catering: ${logistics.catering.label.toLowerCase()}, about ${logistics.servers} service staff`,
    logistics.buffetLines > 0
      ? `Buffet: ${logistics.buffetLines} line${logistics.buffetLines === 1 ? "" : "s"}, roughly ${logistics.buffetMinutes} minutes to serve everyone`
      : null,
    `Runtime: ${formatDuration(show.totalMinutes)}, ${show.startClock} to ${show.endClock}${show.crossesMidnight ? " (next day)" : ""}`,
    venue.trim() ? `Venue: ${venue.trim()}` : null,
  ].filter(Boolean);

  const constraints = [
    "Do not change the segment durations unless you say clearly what you are cutting and why.",
    "Every handover between segments needs a named owner and a cue — say who says what.",
    "Assume nothing about AV. List the exact AV items each segment needs and who tests them.",
    risks.trim() ? `Known risks I already worry about: ${risks.trim()}.` : null,
    "Give timings as clock times, not as relative offsets.",
    "Do not invent venue capacities or vendor prices. Where a number depends on the venue, say which question to ask.",
  ].filter(Boolean);

  const outputSpec = [
    "1. A run-of-show table: clock time, segment, owner, cue in, cue out, AV needed.",
    "2. A set-up schedule working backwards from doors open, including the load-in window.",
    "3. A crew brief: how many people, where each one stands, and what they do in the first ten minutes.",
    "4. The five things most likely to run late here, each with the decision that keeps the show on time.",
    "5. A one-page day-of checklist that fits on a phone screen.",
  ];

  const prompt = [
    "You are an event producer who has run this format many times and thinks in clock time.",
    "",
    `Turn the plan below into a production-ready run of show and logistics brief for ${eventName.trim() || `a ${eventType.toLowerCase()}`}.`,
    "",
    "EVENT FACTS",
    ...logisticsLines.map((line) => `- ${line}`),
    "",
    "AGENDA AS IT STANDS",
    ...showLines,
    "",
    "CONSTRAINTS",
    ...constraints.map((line) => `- ${line}`),
    "",
    "OUTPUT FORMAT",
    ...outputSpec,
    "",
    "Be blunt about anything in my agenda that will not work at this headcount, and say what to do instead.",
  ].join("\n");

  const charCount = prompt.length;

  return {
    prompt,
    rows: show.rows,
    totalMinutes: show.totalMinutes,
    startClock: show.startClock,
    endClock: show.endClock,
    crossesMidnight: show.crossesMidnight,
    attendees: headcount,
    ...logistics,
    wordCount: countWords(prompt),
    charCount,
    tokenEstimate: Math.ceil(charCount / CHARS_PER_TOKEN),
  };
}
