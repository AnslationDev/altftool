/**
 * UPSC exam-day checklist and reporting-time planner.
 *
 * Rules follow the instructions the Union Public Service Commission prints on
 * the e-Admit Card and in its "Important Instructions to Candidates" notice
 * for the Civil Services (Preliminary) Examination:
 *
 *  - Two sessions on the same day: General Studies Paper I in the forenoon and
 *    Paper II (CSAT) in the afternoon, each of two hours.
 *  - Candidates are NOT allowed into the examination hall after the entry
 *    closing time, which is 10 minutes before the start of each session.
 *  - The e-Admit Card must be carried in printed form together with the photo
 *    identity card whose number is quoted on it.
 *  - Answers are marked with a black ball point pen only.
 *  - Mobile phones and every other communication or storage device are barred
 *    inside the premises, and the venue makes no arrangement to keep them.
 *
 * All functions are pure: times are passed in, nothing is read from the clock.
 */

/** Minutes before a session starts when the gate is closed (UPSC rule). */
export const GATE_CLOSE_LEAD_MINUTES = 10;

/** Length of each Civil Services Preliminary paper, in minutes. */
export const PAPER_DURATION_MINUTES = 120;

/** The two sessions on prelims day, with their published start times. */
export const EXAM_SESSIONS = [
  { id: "paper-1", label: "Paper I — General Studies (forenoon)", start: "09:30", end: "11:30" },
  { id: "paper-2", label: "Paper II — CSAT (afternoon)", start: "14:30", end: "16:30" },
];

/** Sensible planning defaults, all editable by the candidate. */
export const DEFAULTS = {
  travelMinutes: 45,
  bufferMinutes: 60,
  getReadyMinutes: 60,
};

/** Upper bound on any single planning interval, to keep the maths sane. */
const MAX_INTERVAL_MINUTES = 720;

const MINUTES_PER_DAY = 1440;
const HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * The checklist itself. `required` marks the items without which a candidate
 * can be refused entry.
 */
export const CHECKLIST_GROUPS = [
  {
    id: "documents",
    title: "Documents you cannot enter without",
    items: [
      {
        id: "admit-card",
        label: "Printed e-Admit Card for this session",
        required: true,
        note: "Print it on A4 in clear quality; a copy on a phone screen is not accepted.",
      },
      {
        id: "photo-id",
        label: "Original photo ID whose number is printed on the admit card",
        required: true,
        note: "It must be the same ID you quoted in the application — not a different one.",
      },
      {
        id: "photograph",
        label: "Identical passport photograph for each session",
        required: true,
        note: "Required if your e-Admit Card carries no photograph or an unclear one.",
      },
      {
        id: "id-photocopy",
        label: "Photocopy of the photo ID",
        required: false,
        note: "Not compulsory, but useful if the invigilator wants to retain a copy.",
      },
      {
        id: "pwbd-certificate",
        label: "Disability certificate and scribe papers, if you have been allowed a scribe",
        required: false,
      },
    ],
  },
  {
    id: "stationery",
    title: "Stationery",
    items: [
      {
        id: "black-pen",
        label: "Black ball point pens (carry two)",
        required: true,
        note: "The OMR sheet and the attendance list must be filled in black ball point pen.",
      },
      { id: "clipboard", label: "Nothing else — no pencil box, no geometry box", required: false },
    ],
  },
  {
    id: "before-leaving",
    title: "Before you leave home",
    items: [
      {
        id: "venue-check",
        label: "Centre address and gate number confirmed on a map",
        required: true,
        note: "UPSC allots the centre; the address on the admit card is the only correct one.",
      },
      {
        id: "dry-run",
        label: "Route and travel time checked, ideally a day earlier",
        required: false,
      },
      { id: "cash", label: "Small cash for transport, kept in a pocket rather than a bag", required: false },
      { id: "water", label: "Transparent water bottle", required: false },
      { id: "spectacles", label: "Spectacles, if you use them (no smart glasses)", required: false },
      { id: "medicines", label: "Essential medicines with prescription, if you need them", required: false },
    ],
  },
  {
    id: "at-centre",
    title: "At the centre",
    items: [
      {
        id: "reach-early",
        label: "Reach before the entry closing time, which is 10 minutes before the session starts",
        required: true,
        note: "No candidate is admitted after that moment, whatever the reason.",
      },
      { id: "frisking", label: "Allow frisking and document verification without argument", required: false },
      {
        id: "omr-details",
        label: "Fill roll number, test booklet series and set number on the OMR exactly as instructed",
        required: true,
        note: "A wrong or missing booklet series can invalidate the answer sheet.",
      },
      { id: "signature", label: "Sign the attendance sheet in the same signature as the application", required: false },
    ],
  },
];

/** Items barred inside the examination premises, per the UPSC instructions. */
export const PROHIBITED_ITEMS = [
  "Mobile phones, even switched off, and bluetooth or wireless earpieces",
  "Smart watches, digital watches and any watch with storage or communication ability",
  "Calculators, log tables, slide rules and mathematical or drawing instruments",
  "Pagers, cameras, pen drives and any other electronic or storage gadget",
  "Books, notes, printed or written material of any kind",
  "Bags, purses and valuables — venues make no arrangement for safekeeping",
];

export function sessionById(id) {
  return EXAM_SESSIONS.find((session) => session.id === id) || null;
}

/** "HH:MM" to minutes after midnight; NaN if the string is not a valid time. */
export function toMinutes(hhmm) {
  const match = typeof hhmm === "string" ? hhmm.match(HH_MM) : null;
  if (!match) return NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Minutes after midnight to a clock time plus a 12-hour label. */
export function fromMinutes(minutes) {
  const wrapped = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  const suffix = hours < 12 ? "am" : "pm";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return {
    minutes: wrapped,
    hhmm: `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`,
    label: `${hour12}:${String(mins).padStart(2, "0")} ${suffix}`,
    previousDay: minutes < 0,
  };
}

/**
 * Work backwards from the session start to the time you must wake up.
 *
 *   gate closes      = exam start − 10 minutes (UPSC rule)
 *   be at the centre = gate closing − your safety buffer
 *   leave home       = arrival time − travel time
 *   start getting up = departure − time to get ready
 *
 * @returns {object} the four checkpoints, or { error }
 */
export function buildTimeline({
  examStart,
  travelMinutes,
  bufferMinutes,
  getReadyMinutes,
  gateCloseLeadMinutes = GATE_CLOSE_LEAD_MINUTES,
}) {
  const start = toMinutes(examStart);
  if (Number.isNaN(start)) {
    return { error: "Enter the session start time in 24-hour HH:MM form." };
  }

  const intervals = { travelMinutes, bufferMinutes, getReadyMinutes, gateCloseLeadMinutes };
  for (const [name, raw] of Object.entries(intervals)) {
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      return { error: "Travel, buffer and getting-ready times must be zero or more minutes." };
    }
    if (value > MAX_INTERVAL_MINUTES) {
      return { error: `No single interval can be longer than ${MAX_INTERVAL_MINUTES} minutes.` };
    }
  }

  const gateClose = start - Number(gateCloseLeadMinutes);
  const arrive = gateClose - Number(bufferMinutes);
  const leaveHome = arrive - Number(travelMinutes);
  const wakeUp = leaveHome - Number(getReadyMinutes);

  return {
    examStart: fromMinutes(start),
    gateClose: fromMinutes(gateClose),
    arrive: fromMinutes(arrive),
    leaveHome: fromMinutes(leaveHome),
    wakeUp: fromMinutes(wakeUp),
    totalLeadMinutes: start - wakeUp,
    startsPreviousDay: wakeUp < 0,
  };
}

/**
 * How ready you are. An item marked `required` blocks entry, so the checklist
 * is only "ready" when every required item is ticked.
 *
 * @param {object} checked  { "documents:admit-card": true, ... }
 */
export function checklistReadiness(checked = {}) {
  const items = CHECKLIST_GROUPS.flatMap((group) =>
    group.items.map((item) => ({ ...item, key: itemKey(group.id, item.id) })),
  );
  if (items.length === 0) return { error: "The checklist has no items." };

  const done = items.filter((item) => checked[item.key]);
  const required = items.filter((item) => item.required);
  const requiredDone = required.filter((item) => checked[item.key]);
  const blocking = required.filter((item) => !checked[item.key]);

  return {
    totalItems: items.length,
    doneItems: done.length,
    requiredItems: required.length,
    requiredDone: requiredDone.length,
    percent: (done.length / items.length) * 100,
    requiredPercent: required.length > 0 ? (requiredDone.length / required.length) * 100 : 100,
    blocking: blocking.map((item) => item.label),
    ready: blocking.length === 0,
  };
}

export function itemKey(groupId, itemId) {
  return `${groupId}:${itemId}`;
}
