/**
 * NEET (UG) exam-day checklist, dress code and reporting planner.
 *
 * The rules encoded here are the ones the National Testing Agency prints in
 * the NEET (UG) Information Bulletin and on the admit card:
 *
 *  - The paper runs in a single afternoon session of 180 minutes, and entry to
 *    the centre closes 30 minutes before it begins.
 *  - Candidates carry a printed admit card with a passport photograph pasted
 *    on it, a self-declaration (undertaking) completed at the centre, one
 *    spare passport photograph for the attendance sheet, and an original
 *    valid photo identity document.
 *  - A dress code applies: light clothes with half sleeves, no large buttons,
 *    brooches, badges or flowers, and low-heeled slippers or sandals rather
 *    than shoes. Candidates in customary dress are asked to reach earlier —
 *    90 minutes before the paper — because frisking takes longer.
 *  - Jewellery, metallic items, watches, wallets, caps, handbags, mobile
 *    phones and food are barred. Diabetic candidates may carry sugar tablets
 *    or fruit and a transparent water bottle.
 *
 * Everything below is pure: times are arguments, nothing reads the clock.
 */

/** Duration of the NEET (UG) paper in minutes, current pattern. */
export const PAPER_DURATION_MINUTES = 180;

/** Questions in the paper under the current pattern. */
export const TOTAL_QUESTIONS = 180;

/** Marks for a correct answer. */
export const MARK_CORRECT = 4;

/** Marks deducted for a wrong answer. */
export const PENALTY_WRONG = 1;

/** Minutes before the paper starts when entry to the centre closes. */
export const GATE_CLOSE_LEAD_MINUTES = 30;

/** How early candidates in customary dress are asked to report, in minutes. */
export const CUSTOMARY_DRESS_REPORT_LEAD_MINUTES = 90;

/** Usual start of the afternoon session; always confirm on your admit card. */
export const DEFAULT_START = "14:00";

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
        label: "Admit card printed on A4 with a passport photograph pasted on it",
        required: true,
        note: "Use the same photograph you uploaded with the application form.",
      },
      {
        id: "declaration",
        label: "Self-declaration (undertaking) on the admit card, ready to complete at the centre",
        required: true,
        note: "It is filled in at the desk with your signature and left-hand thumb impression.",
      },
      {
        id: "spare-photo",
        label: "One spare passport photograph for the attendance sheet",
        required: true,
      },
      {
        id: "photo-id",
        label: "Original valid photo identity document",
        required: true,
        note: "Aadhaar, PAN, driving licence, passport, voter ID or a school photo ID card.",
      },
      {
        id: "pwbd",
        label: "PwBD certificate, if you are claiming a scribe or compensatory time",
        required: false,
      },
    ],
  },
  {
    id: "dress-code",
    title: "Dress code",
    items: [
      {
        id: "light-clothes",
        label: "Light clothes with half sleeves — no long sleeves",
        required: true,
      },
      {
        id: "no-ornamentation",
        label: "No large buttons, brooches, badges or flowers on the clothing",
        required: true,
      },
      {
        id: "footwear",
        label: "Slippers or sandals with low heels; shoes are not allowed",
        required: true,
      },
      {
        id: "no-jewellery",
        label: "No jewellery at all — earrings, nose pins, rings, chains, bangles",
        required: true,
        note: "Metal detectors are used at entry and metallic items are not permitted inside.",
      },
      {
        id: "customary-dress",
        label: "If you wear customary dress, plan to reach 90 minutes before the paper",
        required: false,
        note: "Frisking takes longer, so NTA asks these candidates to report earlier.",
      },
    ],
  },
  {
    id: "carry",
    title: "Carry with you",
    items: [
      { id: "water", label: "Transparent water bottle", required: false },
      {
        id: "diabetic-kit",
        label: "Sugar tablets or fruit, if you are a diabetic candidate",
        required: false,
        note: "Permitted as an exception to the no-food rule; packaged food is not allowed.",
      },
      { id: "spectacles", label: "Spectacles, if you use them (no sunglasses)", required: false },
      { id: "cash", label: "Small cash for transport, carried in a pocket", required: false },
    ],
  },
  {
    id: "before-leaving",
    title: "Before you leave home",
    items: [
      {
        id: "centre-address",
        label: "Centre address and reporting time read off the admit card",
        required: true,
        note: "The centre is allotted by NTA; the address on the admit card is the only correct one.",
      },
      { id: "route", label: "Route and travel time checked, allowing for exam-day traffic", required: false },
      { id: "guardian", label: "Someone identified to hold your phone and belongings outside", required: false },
      { id: "meal", label: "A light meal eaten before leaving — nothing is allowed inside", required: false },
    ],
  },
];

export const PROHIBITED_ITEMS = [
  "Mobile phones, bluetooth devices, earphones and any communication gadget",
  "Watches of every kind, including smart and digital watches",
  "Jewellery and metallic items: rings, chains, bangles, nose pins, earrings",
  "Wallets, handbags, belts, caps, goggles and sunglasses",
  "Calculators, log tables, notes, printed matter and stationery of your own",
  "Food and packaged snacks, except sugar tablets or fruit for diabetic candidates",
];

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
 * Reporting plan for NEET day.
 *
 *   entry closes = paper start − 30 minutes
 *   arrive by    = entry closing − your buffer, and never later than
 *                  90 minutes before the start if you wear customary dress
 *   leave home   = arrival − travel time
 *   get up at    = departure − time to get ready
 *
 * @returns {object} checkpoints, or { error }
 */
export function buildTimeline({
  examStart = DEFAULT_START,
  travelMinutes,
  bufferMinutes,
  getReadyMinutes,
  customaryDress = false,
  gateCloseLeadMinutes = GATE_CLOSE_LEAD_MINUTES,
}) {
  const start = toMinutes(examStart);
  if (Number.isNaN(start)) {
    return { error: "Enter the paper start time in 24-hour HH:MM form." };
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
  const plannedArrive = gateClose - Number(bufferMinutes);
  const customaryArrive = start - CUSTOMARY_DRESS_REPORT_LEAD_MINUTES;
  // Customary dress means longer frisking, so the earlier of the two wins.
  const arrive = customaryDress ? Math.min(plannedArrive, customaryArrive) : plannedArrive;
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
    customaryDressApplied: customaryDress && customaryArrive < plannedArrive,
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
 * Marks under the NEET scheme: +4 for a correct answer, −1 for a wrong one,
 * nothing for a question left blank.
 *
 * @returns {object} { correct, wrong, marks } or { error }
 */
export function expectedScore({ attempted, accuracyPercent }) {
  const tries = Number(attempted);
  const accuracy = Number(accuracyPercent);

  if (!Number.isFinite(tries) || tries < 0) {
    return { error: "Questions attempted must be zero or more." };
  }
  if (tries > TOTAL_QUESTIONS) {
    return { error: `The paper has only ${TOTAL_QUESTIONS} questions.` };
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
  };
}
