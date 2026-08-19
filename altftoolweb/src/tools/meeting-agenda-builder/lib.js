/**
 * Meeting Agenda Builder — pure scheduling and meeting-cost logic.
 *
 * The tool turns a list of agenda items (title, owner, minutes) into a timed
 * running order: every item gets a clock start and end derived from the meeting
 * start time, and the whole meeting gets a duration, an end time and a cost.
 *
 * Meeting cost uses the standard loaded-cost formula used in workforce planning:
 *   cost = attendees x hourly cost per attendee x (total minutes / 60)
 * There is no arithmetic in the UI layer; everything lives here.
 */

/** Minutes in an hour — used for every hours <-> minutes conversion. */
export const MINUTES_IN_HOUR = 60;

/** Minutes in a day, the hard ceiling for any clock arithmetic. */
export const MINUTES_IN_DAY = 24 * MINUTES_IN_HOUR;

/**
 * Hard cap on a single agenda: 480 minutes = one 8-hour working day.
 * Anything longer is a workshop schedule, not a meeting agenda.
 */
export const MAX_AGENDA_MINUTES = 480;

/**
 * Soft ceiling. Standard calendar systems (Outlook, Google Calendar) default to
 * 30-minute slots and most meeting-hygiene guidance caps a status meeting at
 * 60 minutes, so anything above this gets a warning rather than an error.
 */
export const RECOMMENDED_MAX_MINUTES = 60;

/** Shortest bookable slice — calendars snap to 5-minute increments. */
export const MIN_ITEM_MINUTES = 1;

/** Practical ceiling on agenda rows so the table stays usable. */
export const MAX_AGENDA_ITEMS = 50;

/**
 * Recommended slack at the end of a meeting: 10% of scheduled time, the usual
 * planning buffer so a meeting that runs a little long does not eat the next slot.
 */
export const BUFFER_RATIO = 0.1;

/** Agenda item purposes, each with the discipline that purpose implies. */
export const ITEM_TYPES = [
  { key: "inform", label: "Inform / update", guidance: "Share the update in writing first; keep the slot short." },
  { key: "discuss", label: "Discuss", guidance: "State the question up front so the discussion has a target." },
  { key: "decide", label: "Decide", guidance: "Name the decision owner before the meeting starts." },
  { key: "brainstorm", label: "Brainstorm", guidance: "Allow silent idea generation before open discussion." },
  { key: "review", label: "Review", guidance: "Circulate the material at least a day ahead." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Parses a 24-hour "HH:MM" clock string into minutes past midnight.
 * @returns {number|null} minutes past midnight, or null when unparseable.
 */
export function parseTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * MINUTES_IN_HOUR + minutes;
}

/**
 * Formats minutes past midnight as a 24-hour "HH:MM" clock string,
 * wrapping past midnight so a late meeting never prints "25:30".
 */
export function formatClock(minutesPastMidnight) {
  if (!isNum(minutesPastMidnight)) return "--:--";
  const wrapped = ((Math.round(minutesPastMidnight) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  const hours = Math.floor(wrapped / MINUTES_IN_HOUR);
  const minutes = wrapped % MINUTES_IN_HOUR;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Formats a duration in minutes as "1h 25m" / "45m". */
export function formatDuration(totalMinutes) {
  if (!isNum(totalMinutes) || totalMinutes < 0) return "—";
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / MINUTES_IN_HOUR);
  const minutes = rounded % MINUTES_IN_HOUR;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Cost of holding the meeting.
 * @param {number} attendees        Head count in the room.
 * @param {number} hourlyCost       Fully loaded cost per attendee per hour.
 * @param {number} totalMinutes     Scheduled length.
 * @returns {number} money value, never NaN or Infinity.
 */
export function meetingCost(attendees, hourlyCost, totalMinutes) {
  if (!isNum(attendees) || !isNum(hourlyCost) || !isNum(totalMinutes)) return 0;
  if (attendees <= 0 || hourlyCost <= 0 || totalMinutes <= 0) return 0;
  return attendees * hourlyCost * (totalMinutes / MINUTES_IN_HOUR);
}

/**
 * Builds the timed running order for a meeting.
 *
 * @param {object} input
 * @param {string} [input.title]        Meeting title.
 * @param {string} [input.dateISO]      Meeting date, "YYYY-MM-DD" (passed in, never read from the clock).
 * @param {string} input.startTime      "HH:MM" 24-hour start.
 * @param {Array<{title?:string, owner?:string, minutes:number, type?:string}>} input.items
 * @param {number} [input.attendees]    Head count.
 * @param {number} [input.hourlyCost]   Loaded cost per attendee per hour.
 * @returns {object} schedule, or { error } when the input cannot produce a real agenda.
 */
export function buildAgenda({
  title = "",
  dateISO = "",
  startTime = "10:00",
  items = [],
  attendees = 1,
  hourlyCost = 0,
} = {}) {
  const startMinutes = parseTimeToMinutes(startTime);
  if (startMinutes === null) {
    return { error: "Enter a start time in 24-hour HH:MM form, for example 09:30." };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one agenda item before the meeting can be scheduled." };
  }
  if (items.length > MAX_AGENDA_ITEMS) {
    return { error: `An agenda is limited to ${MAX_AGENDA_ITEMS} items. Split the meeting instead.` };
  }
  if (!isNum(attendees) || !Number.isInteger(attendees) || attendees < 1) {
    return { error: "Attendee count must be a whole number of at least 1." };
  }
  if (!isNum(hourlyCost) || hourlyCost < 0) {
    return { error: "Cost per attendee per hour cannot be negative." };
  }

  let cursor = startMinutes;
  const schedule = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index] || {};
    const minutes = Number(item.minutes);
    if (!isNum(minutes) || minutes < MIN_ITEM_MINUTES) {
      return {
        error: `Item ${index + 1} needs a length of at least ${MIN_ITEM_MINUTES} minute.`,
      };
    }
    if (minutes > MAX_AGENDA_MINUTES) {
      return {
        error: `Item ${index + 1} is longer than the ${MAX_AGENDA_MINUTES}-minute agenda cap.`,
      };
    }
    const rounded = Math.round(minutes);
    const type = ITEM_TYPES.find((entry) => entry.key === item.type) || ITEM_TYPES[0];
    schedule.push({
      index: index + 1,
      title: String(item.title || "").trim() || `Agenda item ${index + 1}`,
      owner: String(item.owner || "").trim() || "Unassigned",
      minutes: rounded,
      type: type.key,
      typeLabel: type.label,
      guidance: type.guidance,
      startClock: formatClock(cursor),
      endClock: formatClock(cursor + rounded),
      startOffset: cursor - startMinutes,
    });
    cursor += rounded;
  }

  const totalMinutes = cursor - startMinutes;
  if (totalMinutes > MAX_AGENDA_MINUTES) {
    return {
      error: `The agenda totals ${totalMinutes} minutes, above the ${MAX_AGENDA_MINUTES}-minute cap for one meeting.`,
    };
  }

  const cost = meetingCost(attendees, hourlyCost, totalMinutes);
  const bufferMinutes = Math.round(totalMinutes * BUFFER_RATIO);

  const warnings = [];
  if (totalMinutes > RECOMMENDED_MAX_MINUTES) {
    warnings.push(
      `The meeting runs ${totalMinutes} minutes. Past ${RECOMMENDED_MAX_MINUTES} minutes, split it or schedule a break.`,
    );
  }
  if (schedule.some((row) => row.owner === "Unassigned")) {
    warnings.push("At least one item has no owner. Every item should name the person who leads it.");
  }
  if (startMinutes + totalMinutes >= MINUTES_IN_DAY) {
    warnings.push("The meeting runs past midnight, so the end time is shown on the next day.");
  }

  const shareOfLongest = schedule.reduce((max, row) => Math.max(max, row.minutes), 0);

  return {
    title: String(title || "").trim() || "Untitled meeting",
    dateISO: String(dateISO || ""),
    startClock: formatClock(startMinutes),
    endClock: formatClock(cursor),
    totalMinutes,
    totalLabel: formatDuration(totalMinutes),
    bufferMinutes,
    endWithBufferClock: formatClock(cursor + bufferMinutes),
    itemCount: schedule.length,
    schedule: schedule.map((row) => ({
      ...row,
      sharePercent: totalMinutes > 0 ? (row.minutes / totalMinutes) * 100 : 0,
    })),
    attendees: Math.round(attendees),
    hourlyCost,
    cost,
    costPerMinute: totalMinutes > 0 ? cost / totalMinutes : 0,
    personMinutes: Math.round(attendees) * totalMinutes,
    longestItemMinutes: shareOfLongest,
    warnings,
  };
}

/** Renders a finished agenda as a plain-text / Markdown summary for sharing. */
export function agendaToMarkdown(result, currencyLabel = "INR") {
  if (!result || result.error) return "";
  const lines = [
    `# ${result.title}`,
    result.dateISO ? `Date: ${result.dateISO}` : "",
    `Time: ${result.startClock}–${result.endClock} (${result.totalLabel})`,
    `Attendees: ${result.attendees}`,
    `Estimated cost: ${currencyLabel} ${Math.round(result.cost)}`,
    "",
    "## Running order",
  ].filter(Boolean);

  for (const row of result.schedule) {
    lines.push(
      `${row.index}. ${row.startClock}–${row.endClock} (${row.minutes}m) — ${row.title} [${row.typeLabel}] — ${row.owner}`,
    );
  }

  if (result.warnings.length > 0) {
    lines.push("", "## Notes");
    for (const note of result.warnings) lines.push(`- ${note}`);
  }

  return lines.join("\n");
}
