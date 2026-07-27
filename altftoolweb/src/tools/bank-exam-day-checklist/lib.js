/**
 * Bank exam (IBPS / SBI / RBI-pattern CBT) exam-day checklist and reporting
 * planner.
 *
 * The rules encoded here are the ones IBPS and SBI print in their call
 * letters and information handouts:
 *
 *  - Candidates carry the CALL LETTER printed from the portal, a currently
 *    valid photo identity proof in ORIGINAL **and a photocopy of it** — the
 *    photocopy is submitted at the desk stapled to the call letter — and
 *    passport photographs identical to the one uploaded (one affixed to the
 *    call letter where the form asks for it).
 *  - Name on the ID must match the name on the call letter; married
 *    candidates whose name changed carry the marriage certificate/gazette.
 *  - Biometric capture (thumb impression and photograph) happens at the
 *    centre; the reporting time printed on the call letter is a hard
 *    deadline — candidates arriving after it are not admitted.
 *  - Prelims pattern (IBPS/SBI PO and Clerk): 100 questions, 100 marks,
 *    60 minutes in three separately-timed 20-minute sections — English 30,
 *    Quantitative Aptitude 35, Reasoning 35.
 *  - Negative marking: ONE-FOURTH of the marks assigned to a question is
 *    deducted for each wrong answer.
 *
 * Pure functions only: times come in as arguments, nothing reads the clock.
 */

/** IBPS/SBI deduct one-fourth of a question's marks for a wrong answer. */
export const PENALTY_FRACTION = 0.25;

/** Prelims: 100 questions, 100 marks, 60 minutes (3 × 20-minute sections). */
export const PRELIMS_QUESTIONS = 100;
export const PRELIMS_MARKS = 100;
export const PRELIMS_DURATION_MINUTES = 60;

/** Prelims sections with their separately timed 20-minute slots. */
export const PRELIMS_SECTIONS = [
  { id: "english", label: "English Language", questions: 30, minutes: 20 },
  { id: "quant", label: "Quantitative Aptitude", questions: 35, minutes: 20 },
  { id: "reasoning", label: "Reasoning Ability", questions: 35, minutes: 20 },
];

export const DEFAULTS = {
  reportingTime: "08:30",
  examStart: "09:30",
  travelMinutes: 45,
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
        label: "Call letter printed from the exam portal",
        required: true,
        note: "Print two copies; the desk keeps one at many centres, and mains and interview stages ask for prelims call letters again in some recruitments.",
      },
      {
        id: "photo-id-original",
        label: "Original valid photo identity proof",
        required: true,
        note: "Aadhaar/e-Aadhaar print, PAN, passport, driving licence, voter ID or a bank passbook with photograph — the name must match the call letter exactly.",
      },
      {
        id: "photo-id-copy",
        label: "Photocopy of the same photo ID",
        required: true,
        note: "Submitted at the desk along with the call letter — this is the item bank candidates most often forget.",
      },
      {
        id: "photos",
        label: "Passport photographs identical to the uploaded one",
        required: true,
        note: "Affix one on the call letter where indicated and carry spares.",
      },
      {
        id: "name-change",
        label: "Marriage certificate / gazette notification, if your name changed",
        required: false,
      },
      {
        id: "pwbd",
        label: "PwBD certificate and scribe declaration, if applicable",
        required: false,
      },
    ],
  },
  {
    id: "at-centre",
    title: "At the centre",
    items: [
      {
        id: "biometric",
        label: "Clean right thumb for biometric capture",
        required: true,
        note: "Thumb impression and photograph are captured at the centre; ink smudges or mehndi can force a re-verification.",
      },
      {
        id: "signature",
        label: "Practise your running-hand signature",
        required: true,
        note: "You sign the attendance sheet in the same style as the application; block letters are rejected.",
      },
      {
        id: "ballpoint",
        label: "A blue or black ballpoint pen",
        required: true,
        note: "For the attendance sheet and rough work on the sheets provided at the desk.",
      },
      { id: "water", label: "Transparent water bottle, if the centre allows one", required: false },
      { id: "spectacles", label: "Spectacles, if you use them", required: false },
    ],
  },
  {
    id: "before-leaving",
    title: "Before you leave home",
    items: [
      {
        id: "centre-check",
        label: "Centre address and reporting time read off the call letter",
        required: true,
        note: "The reporting time is a hard deadline — candidates reporting after it are not admitted.",
      },
      {
        id: "roll-details",
        label: "Registration number and password noted for the login screen",
        required: true,
      },
      { id: "route", label: "Route checked with morning-traffic timing", required: false },
      { id: "phone-plan", label: "Plan for leaving your phone outside the hall", required: false },
      { id: "dress", label: "Simple clothes, no metallic accessories, thin-soled footwear", required: false },
    ],
  },
];

export const PROHIBITED_ITEMS = [
  "Mobile phones, bluetooth devices, earphones, pagers and smart watches",
  "Calculators of any kind — on-screen calculators are not provided either",
  "Books, notes, printed or written material and loose paper",
  "Watches, bracelets, metallic ornaments and caps",
  "Bags and pouches — most centres have no safe-keeping facility",
  "Any electronic gadget, pen drive, camera or recording device",
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
 * Reporting plan worked backwards from the call-letter reporting time.
 *
 *   arrive by   = reporting time (hard deadline on the call letter)
 *   leave home  = arrival − buffer − travel time
 *   get up at   = departure − time to get ready
 *
 * The exam start is taken separately so the shift end can be shown.
 *
 * @returns {object} timeline or { error }
 */
export function buildTimeline({
  reportingTime,
  examStart,
  travelMinutes,
  bufferMinutes,
  getReadyMinutes,
  examDurationMinutes = PRELIMS_DURATION_MINUTES,
}) {
  const reporting = toMinutes(reportingTime);
  if (Number.isNaN(reporting)) {
    return { error: "Enter the reporting time from the call letter in 24-hour HH:MM form." };
  }
  const start = toMinutes(examStart);
  if (Number.isNaN(start)) {
    return { error: "Enter the exam start time in 24-hour HH:MM form." };
  }
  if (start < reporting) {
    return { error: "The exam cannot start before the reporting time on the call letter." };
  }

  const intervals = { travelMinutes, bufferMinutes, getReadyMinutes, examDurationMinutes };
  for (const raw of Object.values(intervals)) {
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      return { error: "Travel, buffer, getting-ready and duration values must be zero or more minutes." };
    }
    if (value > MAX_INTERVAL_MINUTES) {
      return { error: `No single interval can be longer than ${MAX_INTERVAL_MINUTES} minutes.` };
    }
  }

  const arrive = reporting;
  const leaveHome = arrive - Number(bufferMinutes) - Number(travelMinutes);
  const wakeUp = leaveHome - Number(getReadyMinutes);

  return {
    reporting: fromMinutes(reporting),
    examStartAt: fromMinutes(start),
    examEnd: fromMinutes(start + Number(examDurationMinutes)),
    arrive: fromMinutes(arrive),
    leaveHome: fromMinutes(leaveHome),
    wakeUp: fromMinutes(wakeUp),
    waitAtCentreMinutes: start - reporting,
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
 * Marks under the bank-exam scheme: one-fourth of a question's marks lost
 * per wrong answer.
 *
 * @returns {object} { correct, wrong, marks, maxMarks, breakEvenAccuracy } or { error }
 */
export function expectedScore({
  attempted,
  accuracyPercent,
  totalQuestions = PRELIMS_QUESTIONS,
  totalMarks = PRELIMS_MARKS,
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
    return { error: `This paper has only ${questions} questions.` };
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
    /** Break-even: p·m = (1−p)·m/4 → p = 1/5 = 20%. */
    breakEvenAccuracy: (PENALTY_FRACTION / (1 + PENALTY_FRACTION)) * 100,
  };
}
