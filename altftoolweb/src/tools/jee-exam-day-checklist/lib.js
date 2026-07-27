/**
 * JEE Main exam-day checklist and reporting planner.
 *
 * The rules encoded here are the ones the National Testing Agency prints in
 * the JEE (Main) Information Bulletin and on the admit card:
 *
 *  - Paper 1 (BE/BTech) runs in two shifts of three hours, the first from
 *    9:00 am and the second from 3:00 pm. Reporting time is printed on the
 *    admit card, usually about 90 minutes before the shift, and the gate
 *    closes 30 minutes before the paper starts.
 *  - Candidates carry a printed admit card together with the self-declaration
 *    (undertaking), one passport photograph for the attendance sheet, and an
 *    original valid photo identity document.
 *  - The paper has 75 questions — 25 each in Physics, Chemistry and
 *    Mathematics — for 300 marks, with 4 marks for a correct answer and 1
 *    mark deducted for a wrong one in both the multiple-choice and the
 *    numerical-value sections.
 *  - Rough sheets are handed out at the desk and must be returned; a
 *    transparent water bottle is allowed, electronics are not.
 *
 * Pure functions only: times come in as arguments, nothing reads the clock.
 */

/** Length of the JEE Main paper in minutes. */
export const PAPER_DURATION_MINUTES = 180;

/** Questions in Paper 1: 25 each in Physics, Chemistry and Mathematics. */
export const TOTAL_QUESTIONS = 75;

/** Marks for a correct answer. */
export const MARK_CORRECT = 4;

/** Marks deducted for a wrong answer, in both MCQ and numerical sections. */
export const PENALTY_WRONG = 1;

/** Minutes before the shift starts when the centre gate closes. */
export const GATE_CLOSE_LEAD_MINUTES = 30;

/** Reporting lead usually printed on the admit card, in minutes. */
export const TYPICAL_REPORTING_LEAD_MINUTES = 90;

/** The two shifts, with their usual start times. Confirm on your admit card. */
export const EXAM_SHIFTS = [
  { id: "shift-1", label: "Shift 1 (morning)", start: "09:00" },
  { id: "shift-2", label: "Shift 2 (afternoon)", start: "15:00" },
];

export const DEFAULTS = {
  travelMinutes: 45,
  bufferMinutes: 60,
  getReadyMinutes: 60,
};

const MAX_INTERVAL_MINUTES = 720;
const MINUTES_PER_DAY = 1440;
const HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const CHECKLIST_GROUPS = [
  {
    id: "documents",
    title: "Documents you cannot enter without",
    items: [
      {
        id: "admit-card",
        label: "Admit card printed on A4, downloaded from the NTA portal",
        required: true,
        note: "Keep a spare copy at home — the admit card is needed again at JoSAA counselling.",
      },
      {
        id: "declaration",
        label: "Self-declaration (undertaking) printed with the admit card",
        required: true,
        note: "Complete it as instructed with your signature and thumb impression at the centre.",
      },
      {
        id: "photo",
        label: "One passport photograph for the attendance sheet",
        required: true,
        note: "Same photograph as the one uploaded with the application.",
      },
      {
        id: "photo-id",
        label: "Original valid photo identity document",
        required: true,
        note: "Aadhaar, PAN, driving licence, passport, voter ID or a school photo ID card.",
      },
      {
        id: "pwbd",
        label: "PwBD certificate and scribe approval, if applicable",
        required: false,
      },
    ],
  },
  {
    id: "dress",
    title: "What to wear",
    items: [
      { id: "light-clothes", label: "Simple light clothes; nothing that needs a belt or a cap", required: true },
      {
        id: "footwear",
        label: "Thin-soled slippers or sandals rather than thick-soled shoes",
        required: true,
        note: "Footwear is checked at frisking; thick soles and high heels invite a longer search.",
      },
      {
        id: "no-metal",
        label: "No jewellery, metallic accessories or ornaments",
        required: true,
      },
      { id: "layers", label: "A light layer for a cold examination hall, if you feel the air conditioning", required: false },
    ],
  },
  {
    id: "carry",
    title: "Carry with you",
    items: [
      {
        id: "pen",
        label: "A simple transparent ball point pen",
        required: false,
        note: "Rough sheets are given at the desk and must be handed back before you leave.",
      },
      { id: "water", label: "Transparent water bottle", required: false },
      { id: "sanitizer", label: "Small personal hand sanitizer, if you want one", required: false },
      { id: "spectacles", label: "Spectacles, if you use them", required: false },
      { id: "cash", label: "Small cash for transport, carried in a pocket", required: false },
    ],
  },
  {
    id: "before-leaving",
    title: "Before you leave home",
    items: [
      {
        id: "centre-address",
        label: "Centre address, city and reporting time read off the admit card",
        required: true,
        note: "Centres are often on the outskirts; check the exact gate on a map the previous evening.",
      },
      {
        id: "login-details",
        label: "Application number and password noted down for the login screen",
        required: true,
        note: "The computer-based test opens with your application number, which is on the admit card.",
      },
      { id: "route", label: "Route and travel time checked, allowing for morning traffic", required: false },
      { id: "phone-plan", label: "Someone identified to hold your phone outside the centre", required: false },
    ],
  },
];

export const PROHIBITED_ITEMS = [
  "Mobile phones, bluetooth devices, earphones and any communication gadget",
  "Calculators, log tables, slide rules and any electronic aid",
  "Watches of every kind, including smart and digital watches",
  "Books, notes, printed matter and loose paper",
  "Bags, wallets, caps, goggles and metallic ornaments",
  "Any food or packaged snack, unless allowed for a documented medical reason",
];

export function shiftById(id) {
  return EXAM_SHIFTS.find((shift) => shift.id === id) || null;
}

export function itemKey(groupId, itemId) {
  return `${groupId}:${itemId}`;
}

/** "HH:MM" to minutes after midnight; NaN when the string is not a time. */
export function toMinutes(hhmm) {
  const match = typeof hhmm === "string" ? hhmm.match(HH_MM) : null;
  if (!match) return NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Minutes after midnight to a 24-hour string and a 12-hour label. */
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
 * Reporting plan worked backwards from the shift start.
 *
 *   gate closes = start − 30 minutes
 *   arrive by   = gate closing − your buffer
 *   leave home  = arrival − travel time
 *   get up at   = departure − time to get ready
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
    return { error: "Enter the shift start time in 24-hour HH:MM form." };
  }

  const intervals = { travelMinutes, bufferMinutes, getReadyMinutes, gateCloseLeadMinutes };
  for (const raw of Object.values(intervals)) {
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
    examEnd: fromMinutes(start + PAPER_DURATION_MINUTES),
    gateClose: fromMinutes(gateClose),
    arrive: fromMinutes(arrive),
    leaveHome: fromMinutes(leaveHome),
    wakeUp: fromMinutes(wakeUp),
    minutesBeforeStartAtCentre: start - arrive,
    startsPreviousDay: wakeUp < 0,
  };
}

/** Tick progress, with required items treated as entry-critical. */
export function checklistReadiness(checked = {}) {
  const items = CHECKLIST_GROUPS.flatMap((group) =>
    group.items.map((item) => ({ ...item, key: itemKey(group.id, item.id) })),
  );
  if (items.length === 0) return { error: "The checklist has no items." };

  const done = items.filter((item) => checked[item.key]);
  const required = items.filter((item) => item.required);
  const blocking = required.filter((item) => !checked[item.key]);

  return {
    totalItems: items.length,
    doneItems: done.length,
    requiredItems: required.length,
    requiredDone: required.length - blocking.length,
    percent: (done.length / items.length) * 100,
    blocking: blocking.map((item) => item.label),
    ready: blocking.length === 0,
  };
}

/**
 * Minutes available per question if you use the whole paper.
 * @returns {number} minutes per question
 */
export function minutesPerQuestion() {
  return PAPER_DURATION_MINUTES / TOTAL_QUESTIONS;
}

/**
 * Marks under the JEE Main scheme: +4 correct, −1 wrong, 0 for a blank.
 * @returns {object} { correct, wrong, marks, maxMarks } or { error }
 */
export function expectedScore({ attempted, accuracyPercent }) {
  const tries = Number(attempted);
  const accuracy = Number(accuracyPercent);

  if (!Number.isFinite(tries) || tries < 0) {
    return { error: "Questions attempted must be zero or more." };
  }
  if (tries > TOTAL_QUESTIONS) {
    return { error: `Paper 1 has only ${TOTAL_QUESTIONS} questions.` };
  }
  if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
    return { error: "Accuracy must be between 0% and 100%." };
  }

  const correct = (tries * accuracy) / 100;
  const wrong = tries - correct;
  return {
    correct,
    wrong,
    marks: correct * MARK_CORRECT - wrong * PENALTY_WRONG,
    maxMarks: TOTAL_QUESTIONS * MARK_CORRECT,
    /** Accuracy at which one more guess breaks even: 1 / (4 + 1). */
    breakEvenAccuracy: (PENALTY_WRONG / (MARK_CORRECT + PENALTY_WRONG)) * 100,
  };
}
