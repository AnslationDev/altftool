/**
 * CAT test day: the slot clock, the sectional lock, and what the centre will let
 * through the door.
 *
 * Rule sources (CAT is conducted by the IIMs; these are from the CAT website's
 * candidate instructions and the admit card):
 *
 *  - The test runs 120 minutes across three sections in a fixed order: Verbal Ability
 *    and Reading Comprehension, then Data Interpretation and Logical Reasoning, then
 *    Quantitative Ability. Each section carries a hard 40-minute sectional limit. The
 *    screen moves you on automatically and you cannot return to a section once its
 *    40 minutes are spent — this is the single most important difference between CAT
 *    and almost every other entrance test.
 *
 *  - Candidates with a benchmark disability who have been granted compensatory time
 *    get one third extra: 53 minutes 20 seconds per section, 160 minutes in total.
 *
 *  - The paper is held in three slots on one day, the forenoon slot starting at
 *    08:30, the afternoon at 12:30 and the evening at 16:30 in recent cycles. Your own
 *    reporting time and gate-closing time are printed on the admit card and differ
 *    from centre to centre, so both are inputs here rather than fixed numbers.
 *
 *  - Marking is +3 for a correct answer and -1 for an incorrect answer on multiple
 *    choice questions. Type-in-the-answer questions, where you key the response
 *    rather than pick an option, carry no negative marking. Nothing is deducted for a
 *    question left unattempted.
 *
 *  - The centre supplies the scribble pad and pen and an on-screen basic calculator.
 *    Candidates may not bring their own stationery, calculator or any watch, because
 *    the countdown timer lives on the test screen.
 *
 * Informational only. Slot timings, question counts and the permitted-items list are
 * republished for every cycle — your admit card and the current CAT instructions
 * override anything here.
 */

/** Sectional limit in seconds for a standard candidate. Published as 40 minutes per section. */
export const SECTION_SECONDS = 2400;

/**
 * Sectional limit in seconds where compensatory time has been granted: 53 minutes
 * 20 seconds, one third more than the standard 40 minutes.
 */
export const PWD_SECTION_SECONDS = 3200;

/** Marks added for a correct answer. */
export const MARKS_CORRECT = 3;

/** Marks deducted for an incorrect multiple-choice answer. */
export const MARKS_WRONG = -1;

/** Type-in-the-answer questions carry no penalty. */
export const MARKS_WRONG_TITA = 0;

const MINUTES_PER_DAY = 1440;
const SECONDS_PER_DAY = MINUTES_PER_DAY * 60;

/** Slot start times used in recent CAT cycles. */
export const SLOTS = [
  { id: "slot1", label: "Slot 1 — forenoon", start: "08:30" },
  { id: "slot2", label: "Slot 2 — afternoon", start: "12:30" },
  { id: "slot3", label: "Slot 3 — evening", start: "16:30" },
  { id: "custom", label: "Other start time on my admit card", start: "08:30" },
];

/** The three sections, in the fixed order the screen presents them. */
export const SECTIONS = [
  {
    id: "varc",
    label: "VARC — Verbal Ability and Reading Comprehension",
    defaultQuestions: 24,
    tip: "Reading comprehension carries most of the section. Pick passages by how readable they are, not by topic.",
  },
  {
    id: "dilr",
    label: "DILR — Data Interpretation and Logical Reasoning",
    defaultQuestions: 22,
    tip: "Sets are all or nothing. Spend the first five minutes choosing which sets to solve and then commit.",
  },
  {
    id: "qa",
    label: "QA — Quantitative Ability",
    defaultQuestions: 22,
    tip: "Take one clean pass, bank the questions you can finish, and come back only within this section's own 40 minutes.",
  },
];

/**
 * Convert a "HH:MM" 24-hour clock string to minutes past midnight, or null.
 *
 * @param {string} clock
 * @returns {number|null}
 */
export function parseClock(clock) {
  if (typeof clock !== "string") return null;
  const match = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(clock);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Format seconds past midnight as a 12-hour clock, wrapping across midnight.
 *
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatClockSeconds(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return "—";
  const wrapped = ((Math.round(totalSeconds) % SECONDS_PER_DAY) + SECONDS_PER_DAY) % SECONDS_PER_DAY;
  const hours24 = Math.floor(wrapped / 3600);
  const minutes = Math.floor((wrapped % 3600) / 60);
  const suffix = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/**
 * Format a span of seconds as "1 min 49 s" or "53 min 20 s".
 *
 * @param {number} seconds
 * @returns {string}
 */
export function formatSpan(seconds) {
  if (!Number.isFinite(seconds)) return "—";
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  if (minutes === 0) return `${rest} s`;
  if (rest === 0) return `${minutes} min`;
  return `${minutes} min ${rest} s`;
}

/**
 * Seconds available per question in a section.
 *
 * @param {number} questions
 * @param {number} seconds
 * @returns {number} 0 when the section has no questions.
 */
export function computeSectionPace(questions, seconds) {
  const count = Number(questions);
  const span = Number(seconds);
  if (!Number.isFinite(count) || !Number.isFinite(span) || count <= 0 || span <= 0) return 0;
  return span / count;
}

/**
 * Net CAT score under the published marking scheme.
 *
 * @param {object} input
 * @param {number} input.correct       Correct answers, of any question type.
 * @param {number} input.wrongMcq      Incorrect multiple-choice answers.
 * @param {number} input.wrongTita     Incorrect type-in-the-answer responses.
 * @param {number} input.totalQuestions Questions on the paper.
 * @returns {object} score breakdown, or { error }.
 */
export function computeCatScore({ correct = 0, wrongMcq = 0, wrongTita = 0, totalQuestions = 68 } = {}) {
  const values = [correct, wrongMcq, wrongTita, totalQuestions].map(Number);
  if (values.some((value) => !Number.isFinite(value))) {
    return { error: "Enter each count as a whole number." };
  }
  if (values.some((value) => value < 0)) {
    return { error: "Question counts cannot be negative." };
  }
  const [right, badMcq, badTita, total] = values.map((value) => Math.floor(value));
  if (total <= 0) return { error: "The paper must have at least one question." };
  const attempted = right + badMcq + badTita;
  if (attempted > total) {
    return { error: `You cannot attempt ${attempted} of ${total} questions. Reduce one of the counts.` };
  }
  const gained = right * MARKS_CORRECT;
  const lost = badMcq * MARKS_WRONG + badTita * MARKS_WRONG_TITA;
  const net = gained + lost;
  const maximum = total * MARKS_CORRECT;
  return {
    correct: right,
    wrongMcq: badMcq,
    wrongTita: badTita,
    attempted,
    unattempted: total - attempted,
    gained,
    lost,
    net,
    maximum,
    accuracy: attempted === 0 ? 0 : Math.round((right / attempted) * 1000) / 10,
  };
}

/**
 * Build the whole test-day clock: arrival, gate, and the three sectional windows.
 *
 * @param {object} input
 * @param {string} input.slotId
 * @param {string} [input.customStart]   "HH:MM", used when slotId is "custom".
 * @param {boolean} [input.extraTime]    Compensatory time granted.
 * @param {number} [input.reportingBefore] Minutes before the start, from the admit card.
 * @param {number} [input.gateCloseBefore] Minutes before the start, from the admit card.
 * @param {number} [input.travelMinutes]
 * @param {number} [input.getReadyMinutes]
 * @param {object} [input.questionCounts] { varc, dilr, qa }
 * @returns {object} plan, or { error }.
 */
export function buildCatDayPlan({
  slotId = "slot1",
  customStart = "08:30",
  extraTime = false,
  reportingBefore = 75,
  gateCloseBefore = 45,
  travelMinutes = 45,
  getReadyMinutes = 60,
  questionCounts = {},
} = {}) {
  const slot = SLOTS.find((entry) => entry.id === slotId);
  if (!slot) return { error: "Choose the slot printed on your admit card." };

  const startClock = slot.id === "custom" ? customStart : slot.start;
  const startMinutes = parseClock(startClock);
  if (startMinutes === null) {
    return { error: "Enter the test start time as a 24-hour clock value, for example 08:30." };
  }

  const reporting = Number(reportingBefore);
  const gate = Number(gateCloseBefore);
  const travel = Number(travelMinutes);
  const getReady = Number(getReadyMinutes);

  if (![reporting, gate, travel, getReady].every((value) => Number.isFinite(value))) {
    return { error: "Enter each timing as a number of minutes." };
  }
  if ([reporting, gate, travel, getReady].some((value) => value < 0)) {
    return { error: "Times cannot be negative. Enter each one as minutes." };
  }
  if (reporting > 300 || gate > 300) {
    return { error: "Reporting and gate-closing times are within a few hours of the test — check the admit card." };
  }
  if (travel > 480) {
    return { error: "A journey over 8 hours means travelling the day before and staying near the centre." };
  }
  if (gate > reporting) {
    return { error: "The gate closes after reporting opens, so the gate-closing gap must be the smaller number." };
  }

  const sectionSeconds = extraTime ? PWD_SECTION_SECONDS : SECTION_SECONDS;
  const startSeconds = startMinutes * 60;

  const counts = SECTIONS.map((section) => {
    const raw = questionCounts[section.id];
    const value = raw === undefined || raw === null || raw === "" ? section.defaultQuestions : Number(raw);
    return { section, value };
  });

  const badCount = counts.find(
    ({ value }) => !Number.isFinite(value) || value < 0 || value > 100 || Math.floor(value) !== value,
  );
  if (badCount) {
    return { error: `Question count for ${badCount.section.id.toUpperCase()} must be a whole number between 0 and 100.` };
  }

  let cursor = startSeconds;
  const sections = counts.map(({ section, value }) => {
    const from = cursor;
    const to = cursor + sectionSeconds;
    cursor = to;
    const pace = computeSectionPace(value, sectionSeconds);
    return {
      id: section.id,
      label: section.label,
      tip: section.tip,
      questions: value,
      seconds: sectionSeconds,
      startsAt: from,
      endsAt: to,
      startClock: formatClockSeconds(from),
      endClock: formatClockSeconds(to),
      secondsPerQuestion: pace,
      paceLabel: pace === 0 ? "—" : formatSpan(pace),
    };
  });

  const testEndSeconds = cursor;
  const totalQuestions = counts.reduce((sum, { value }) => sum + value, 0);
  const totalSeconds = sectionSeconds * SECTIONS.length;

  const reportingSeconds = startSeconds - reporting * 60;
  const gateSeconds = startSeconds - gate * 60;
  const leaveSeconds = reportingSeconds - travel * 60;
  const wakeSeconds = leaveSeconds - getReady * 60;

  const warnings = [];
  if (wakeSeconds < 0) {
    warnings.push(
      "On these numbers you would be getting ready before midnight. For a forenoon slot far from home, book a room near the centre the night before.",
    );
  }
  if (gate < 15) {
    warnings.push(
      "Under 15 minutes between the gate closing and the test starting is unusual. Re-read the gate-closing time on the admit card.",
    );
  }
  if (travel > 0 && travel < 20 && reporting < 45) {
    warnings.push(
      "A short journey plus a short reporting window leaves no room for a diversion. Biometric and frisking queues at a CAT centre routinely take 30 minutes.",
    );
  }

  const steps = [
    { id: "wake", label: "Start getting ready", at: wakeSeconds, detail: "Eat properly. A 120-minute test with no break is not the morning to skip a meal." },
    { id: "leave", label: "Leave for the centre", at: leaveSeconds, detail: `Allows ${Math.round(travel)} minutes of travel. Do a dry run to the address beforehand if you can.` },
    { id: "report", label: "Reporting time", at: reportingSeconds, detail: "Biometric capture, frisking and document check happen in this window and the queue is long." },
    { id: "gate", label: "Gate closes", at: gateSeconds, detail: "Nobody is admitted after this, and there is no second sitting." },
    { id: "start", label: "Test begins", at: startSeconds, detail: `${SECTIONS[0].label.split(" — ")[0]} first. The countdown lives on the screen.` },
    ...sections.map((section) => ({
      id: `end-${section.id}`,
      label: `${section.id.toUpperCase()} locks`,
      at: section.endsAt,
      detail:
        section.id === "qa"
          ? "The test ends and the responses are submitted automatically."
          : "The screen moves on by itself. You cannot come back to this section.",
    })),
  ].map((step) => ({
    ...step,
    clock: formatClockSeconds(step.at),
    previousDay: step.at < 0,
  }));

  return {
    slot,
    startClock: formatClockSeconds(startSeconds),
    sections,
    steps,
    warnings,
    extraTime,
    sectionSeconds,
    totalSeconds,
    totalQuestions,
    testEndClock: formatClockSeconds(testEndSeconds),
    reportingClock: formatClockSeconds(reportingSeconds),
    gateClock: formatClockSeconds(gateSeconds),
    leaveClock: formatClockSeconds(leaveSeconds),
    wakeClock: formatClockSeconds(wakeSeconds),
    wakeSeconds,
    overallPace: computeSectionPace(totalQuestions, totalSeconds),
  };
}

/**
 * What goes in the pocket, and what will be taken off you at the door.
 *
 * @param {object} [flags]
 * @returns {{ carry:Array, prohibited:Array, provided:Array }}
 */
export function buildCatKit(flags = {}) {
  const carry = [
    {
      id: "admitCard",
      label: "Admit card printed on A4 paper",
      detail:
        "Print it fresh in colour if you can, and read the instructions block on it — that is where your own reporting time, gate-closing time and any photograph requirement are stated.",
    },
    {
      id: "photoId",
      label: "Original photo identity document",
      detail:
        "Passport, PAN card, voter ID, driving licence, Aadhaar or a college photo ID. It has to be the original — a photocopy or a scan on the phone is refused.",
    },
    {
      id: "photograph",
      label: "A spare passport photograph, same one used in the application",
      detail:
        "Some cycles ask for a photograph affixed to the admit card. Carrying a matching spare costs nothing and settles the question at the desk.",
    },
  ];

  if (flags.pwd) {
    carry.push({
      id: "pwdCert",
      label: "Disability certificate in the prescribed format",
      detail:
        "Compensatory time and any scribe are sanctioned in advance on this certificate. The centre cannot grant either on the day.",
    });
  }
  if (flags.scribe) {
    carry.push({
      id: "scribeForm",
      label: "Scribe request form and the scribe's identity proof",
      detail:
        "The scribe's details have to match what was declared during registration, and the scribe carries their own original photo ID.",
    });
  }
  if (flags.outstation) {
    carry.push({
      id: "route",
      label: "Printed centre address, and a screenshot of the route",
      detail:
        "Test centres are often in outlying industrial areas with poor signal. A printed address lets an auto driver find it when your maps app cannot load.",
    });
  }

  const prohibited = [
    {
      id: "watch",
      label: "Any wristwatch, analogue or digital",
      detail:
        "CAT bars watches outright. The section timer is on the test screen, so you lose nothing by leaving it behind.",
    },
    {
      id: "calculator",
      label: "Calculator, log tables, slide rule",
      detail:
        "A basic on-screen calculator is provided inside the test window. Personal calculators are confiscated at the frisking point.",
    },
    {
      id: "stationery",
      label: "Your own pen, pencil, paper or scribble pad",
      detail:
        "The centre issues a scribble pad and pen and takes them back at the end. Carrying your own is treated as unfair means.",
    },
    {
      id: "electronics",
      label: "Mobile phone, earphones, smart band, Bluetooth device",
      detail:
        "Storage at the centre is limited and at your own risk. Leave the phone with whoever drops you, or in the vehicle.",
    },
    {
      id: "metal",
      label: "Metallic items, heavy jewellery, chunky footwear, bags",
      detail:
        "Frisking includes a metal detector. Plain clothes with light footwear and no jewellery gets you through in one pass.",
    },
  ];

  const provided = [
    {
      id: "padPen",
      label: "Scribble pad and pen",
      detail: "Issued at the desk. Raise your hand for a second pad rather than writing in the margins of the first.",
    },
    {
      id: "onscreenCalc",
      label: "On-screen basic calculator",
      detail:
        "Add, subtract, multiply, divide and square root. Practise with the mock test's calculator so the clicking does not cost you time on the day.",
    },
    {
      id: "mock",
      label: "The official mock test interface",
      detail:
        "Released on the CAT website before the exam. Sit at least one full mock in the real interface so nothing on screen is new.",
    },
  ];

  return { carry, prohibited, provided };
}

/**
 * Progress against the items you actually have to carry.
 *
 * @param {Array<{id:string}>} carry
 * @param {Array<string>} packedIds
 * @returns {{ packed:number, total:number, percent:number, missing:Array, ready:boolean }}
 */
export function computeCarryProgress(carry, packedIds) {
  const items = Array.isArray(carry) ? carry : [];
  const packed = Array.isArray(packedIds) ? packedIds : [];
  const missing = items.filter((item) => !packed.includes(item.id));
  const total = items.length;
  const held = total - missing.length;
  return {
    packed: held,
    total,
    percent: total === 0 ? 0 : Math.round((held / total) * 100),
    missing,
    ready: total > 0 && missing.length === 0,
  };
}

export default buildCatDayPlan;
