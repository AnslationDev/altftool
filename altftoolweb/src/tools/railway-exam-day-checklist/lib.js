/**
 * Railway (RRB) computer-based test exam-day checklist and reporting planner.
 *
 * The rules encoded here are the ones the Railway Recruitment Boards print
 * in the Centrally Employment Notice and on the e-call letter:
 *
 *  - Candidates carry the e-call letter printed from the RRB website and an
 *    ORIGINAL valid photo ID — and it must be the SAME ID whose number was
 *    entered in the online application. A photocopy does not admit you.
 *  - Recent passport-size photographs matching the uploaded photo are
 *    required as the call letter directs (one is pasted/handed over at the
 *    centre in most RRB exams).
 *  - Aadhaar-linked biometric verification and photo capture happen at the
 *    centre, so carrying Aadhaar (or its print) smooths verification.
 *  - The e-call letter prints a GATE CLOSING time; entry after it is not
 *    permitted, whatever the reason.
 *  - RRB NTPC CBT-1 pattern: 100 questions, 100 marks, 90 minutes —
 *    General Awareness 40, Mathematics 30, General Intelligence &
 *    Reasoning 30. PwBD candidates writing with eligibility for a scribe
 *    get 120 minutes.
 *  - Negative marking: ONE-THIRD of the marks assigned to a question is
 *    deducted for each wrong answer.
 *  - SC/ST candidates are issued free second-class railway travel authority
 *    with the call letter; carrying the caste certificate makes it valid.
 *
 * Pure functions only: times come in as arguments, nothing reads the clock.
 */

/** RRBs deduct one-third of a question's marks for a wrong answer. */
export const PENALTY_FRACTION = 1 / 3;

/** RRB NTPC CBT-1: 100 questions, 100 marks, 90 minutes. */
export const CBT_QUESTIONS = 100;
export const CBT_MARKS = 100;
export const CBT_DURATION_MINUTES = 90;

/** PwBD candidates eligible for a scribe get 120 minutes for the same CBT. */
export const CBT_DURATION_PWBD_MINUTES = 120;

/** CBT-1 section split. */
export const CBT_SECTIONS = [
  { id: "ga", label: "General Awareness", questions: 40 },
  { id: "maths", label: "Mathematics", questions: 30 },
  { id: "gir", label: "General Intelligence & Reasoning", questions: 30 },
];

export const DEFAULTS = {
  gateClose: "08:45",
  examStart: "09:00",
  travelMinutes: 60,
  bufferMinutes: 30,
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
        id: "call-letter",
        label: "e-Call letter printed from the RRB website",
        required: true,
        note: "Print it fresh — the barcode/QR must scan cleanly at the gate.",
      },
      {
        id: "photo-id",
        label: "Original photo ID — the SAME one entered in the application",
        required: true,
        note: "RRBs verify the ID number against the application; a different ID or a photocopy is rejected.",
      },
      {
        id: "photos",
        label: "Recent passport photographs matching the uploaded photo",
        required: true,
        note: "As directed on the call letter — usually one to paste or hand over at the centre.",
      },
      {
        id: "aadhaar",
        label: "Aadhaar card or e-Aadhaar print for biometric verification",
        required: false,
        note: "Centres run Aadhaar-linked biometric checks; having it speeds up verification.",
      },
      {
        id: "travel-authority",
        label: "Free travel authority + caste certificate (SC/ST candidates)",
        required: false,
        note: "The second-class railway pass issued with the call letter is valid only with the original caste certificate.",
      },
      {
        id: "scribe",
        label: "PwBD certificate and scribe documents, if applicable",
        required: false,
      },
    ],
  },
  {
    id: "travel",
    title: "Travel — centres are often in another city",
    items: [
      {
        id: "centre-city",
        label: "Centre city checked the day the call letter arrives",
        required: true,
        note: "RRB centres are frequently 100+ km away; decide immediately whether you travel the previous day.",
      },
      {
        id: "stay-plan",
        label: "Overnight stay booked if the reporting time is unreachable from home",
        required: false,
      },
      {
        id: "route",
        label: "Route to the centre mapped, with the exact gate located",
        required: true,
      },
      { id: "return", label: "Return journey planned — shifts can end after dark", required: false },
    ],
  },
  {
    id: "at-centre",
    title: "At the centre",
    items: [
      {
        id: "rough-sheets",
        label: "Rough sheets and pen are provided — return them before leaving",
        required: true,
      },
      {
        id: "login",
        label: "Roll number and date of birth ready for the CBT login",
        required: true,
      },
      { id: "water", label: "Transparent water bottle, if the centre allows one", required: false },
      { id: "spectacles", label: "Spectacles, if you use them", required: false },
    ],
  },
];

export const PROHIBITED_ITEMS = [
  "Mobile phones, bluetooth devices, earphones and any communication device",
  "Calculators, watches of every kind and electronic gadgets",
  "Books, notes, printed or written material and loose paper",
  "Bags, wallets, belts, caps, jewellery and metallic items",
  "Pens and pencils of your own — writing material is issued at the desk in RRB CBTs",
  "Food items, unless permitted for a documented medical condition",
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
 * Reporting plan worked backwards from the gate-closing time on the
 * e-call letter.
 *
 *   arrive by   = gate closing − your buffer
 *   leave home  = arrival − travel time
 *   get up at   = departure − time to get ready
 *
 * @returns {object} timeline or { error }
 */
export function buildTimeline({
  gateClose,
  examStart,
  travelMinutes,
  bufferMinutes,
  getReadyMinutes,
  isPwbd = false,
}) {
  const gate = toMinutes(gateClose);
  if (Number.isNaN(gate)) {
    return { error: "Enter the gate-closing time from the e-call letter in 24-hour HH:MM form." };
  }
  const start = toMinutes(examStart);
  if (Number.isNaN(start)) {
    return { error: "Enter the exam start time in 24-hour HH:MM form." };
  }
  if (start < gate) {
    return { error: "The exam cannot start before the gate closes — check both times on the call letter." };
  }

  const intervals = { travelMinutes, bufferMinutes, getReadyMinutes };
  for (const raw of Object.values(intervals)) {
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      return { error: "Travel, buffer and getting-ready times must be zero or more minutes." };
    }
    if (value > MAX_INTERVAL_MINUTES) {
      return { error: `No single interval can be longer than ${MAX_INTERVAL_MINUTES} minutes.` };
    }
  }

  const duration = isPwbd ? CBT_DURATION_PWBD_MINUTES : CBT_DURATION_MINUTES;
  const arrive = gate - Number(bufferMinutes);
  const leaveHome = arrive - Number(travelMinutes);
  const wakeUp = leaveHome - Number(getReadyMinutes);

  return {
    gateClose: fromMinutes(gate),
    examStartAt: fromMinutes(start),
    examEnd: fromMinutes(start + duration),
    durationMinutes: duration,
    arrive: fromMinutes(arrive),
    leaveHome: fromMinutes(leaveHome),
    wakeUp: fromMinutes(wakeUp),
    minutesBeforeGate: gate - arrive,
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
 * Marks under the RRB scheme: one-third of a question's marks lost per
 * wrong answer.
 *
 * @returns {object} { correct, wrong, marks, maxMarks, breakEvenAccuracy } or { error }
 */
export function expectedScore({
  attempted,
  accuracyPercent,
  totalQuestions = CBT_QUESTIONS,
  totalMarks = CBT_MARKS,
}) {
  const tries = Number(attempted);
  const accuracy = Number(accuracyPercent);
  const questions = Number(totalQuestions);
  const marks = Number(totalMarks);

  if (!Number.isFinite(questions) || questions <= 0 || !Number.isFinite(marks) || marks <= 0) {
    return { error: "The paper must have questions and marks greater than zero." };
  }
  if (!Number.isFinite(tries) || tries < 0) {
    return { error: "Questions attempted must be zero or more." };
  }
  if (tries > questions) {
    return { error: `This CBT has only ${questions} questions.` };
  }
  if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
    return { error: "Accuracy must be between 0% and 100%." };
  }

  const marksPerQuestion = marks / questions;
  const penaltyPerWrong = marksPerQuestion * PENALTY_FRACTION;
  const correct = (tries * accuracy) / 100;
  const wrong = tries - correct;

  return {
    marksPerQuestion,
    penaltyPerWrong,
    correct,
    wrong,
    marks: correct * marksPerQuestion - wrong * penaltyPerWrong,
    maxMarks: marks,
    /** Break-even: p·m = (1−p)·m/3 → p = 1/4 = 25%. */
    breakEvenAccuracy: (PENALTY_FRACTION / (1 + PENALTY_FRACTION)) * 100,
  };
}
