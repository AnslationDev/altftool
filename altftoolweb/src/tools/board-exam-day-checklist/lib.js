/**
 * Board exam day planner: the clock and the kit.
 *
 * Rule sources (all published by the boards themselves in their exam-day
 * instructions and on the admit card):
 *
 *  - CBSE Class X / XII theory papers: the standard sitting runs 10:30 to 13:30.
 *    The centre gate closes at 10:00, i.e. 30 minutes before the start. The answer
 *    book is handed out at 10:15 and the question paper at 10:15 as well, giving a
 *    15-minute reading period from 10:15 to 10:30 during which nothing may be
 *    written on the answer book. The admit card carries the same instruction, plus
 *    the school identity card requirement for regular candidates.
 *
 *  - CISCE (ICSE / ISC): papers carry a separate reading time printed at the head of
 *    the paper — 15 minutes on most ICSE papers and ISC papers of two hours or less,
 *    and longer on some ISC papers. Candidates are required to be in their seats
 *    before the reading time begins.
 *
 *  - State boards broadly follow the same shape: gate closed 30 minutes before the
 *    start, a 10 to 15 minute reading period, no entry after the gate closes. The
 *    figures below are the common defaults and every one of them is adjustable,
 *    because the admit card for your own centre is the authority.
 *
 *  - Prohibited items are consistent across boards: no mobile phone, no smart watch
 *    or digital watch with storage, no calculator in general theory papers, no
 *    printed or written material, no bag inside the hall. CBSE permits a calculator
 *    only for candidates granted that exemption under its scheme for children with
 *    special needs.
 *
 * Informational only. The instructions printed on your own admit card and the
 * circulars issued by your board override anything here.
 */

/** Minutes in a day, used to wrap a departure time that falls before midnight. */
const MINUTES_PER_DAY = 1440;

/** Longest sitting this planner will accept, in minutes (a 4-hour paper plus slack). */
const MAX_PAPER_MINUTES = 300;

/** Longest one-way journey this planner will accept, in minutes. */
const MAX_TRAVEL_MINUTES = 480;

/**
 * Board profiles. gateCloseBeforeStart and readingMinutes are the published
 * exam-day figures; paperHandoutBeforeStart is when the question paper reaches the
 * desk, which is the moment reading time begins.
 */
export const BOARDS = [
  {
    id: "cbse",
    label: "CBSE (Class 10 / 12)",
    gateCloseBeforeStart: 30,
    paperHandoutBeforeStart: 15,
    readingMinutes: 15,
    defaultStart: "10:30",
    defaultDuration: 180,
    note: "Standard CBSE sitting is 10:30 to 13:30. Gate closes 10:00, question paper at 10:15, reading time 10:15 to 10:30.",
  },
  {
    id: "cisce",
    label: "CISCE (ICSE / ISC)",
    gateCloseBeforeStart: 20,
    paperHandoutBeforeStart: 15,
    readingMinutes: 15,
    defaultStart: "11:00",
    defaultDuration: 120,
    note: "Reading time is printed at the head of each CISCE paper — 15 minutes on most, longer on some ISC papers. Check the timetable.",
  },
  {
    id: "state",
    label: "State board",
    gateCloseBeforeStart: 30,
    paperHandoutBeforeStart: 10,
    readingMinutes: 10,
    defaultStart: "10:00",
    defaultDuration: 180,
    note: "Most state boards close the gate 30 minutes before the start and allow a 10 to 15 minute reading period. Confirm on your hall ticket.",
  },
  {
    id: "custom",
    label: "Other board — I will set the timings",
    gateCloseBeforeStart: 30,
    paperHandoutBeforeStart: 15,
    readingMinutes: 15,
    defaultStart: "10:30",
    defaultDuration: 180,
    note: "Enter the gate-closing and reading times exactly as printed on your admit card.",
  },
];

/** Paper types that change what you are allowed to carry to the desk. */
export const PAPER_TYPES = [
  { id: "general", label: "General theory paper" },
  { id: "maths", label: "Mathematics / Applied Mathematics" },
  { id: "science", label: "Physics, Chemistry or Biology" },
  { id: "commerce", label: "Accountancy, Economics or Business Studies" },
  { id: "mapwork", label: "Geography or History with map work" },
  { id: "drawing", label: "Drawing, Painting or Engineering Graphics" },
  { id: "language", label: "Language paper" },
];

/**
 * Convert a "HH:MM" 24-hour clock string to minutes past midnight.
 * Returns null when the string is not a valid time.
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
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Format minutes past midnight as a 12-hour clock string, wrapping across midnight.
 *
 * @param {number} totalMinutes
 * @returns {string}
 */
export function formatClock(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "—";
  const wrapped = ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours24 = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  const suffix = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/**
 * Format a span of minutes as "2 h 15 min".
 *
 * @param {number} minutes
 * @returns {string}
 */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

/**
 * Build the exam-day clock, working backwards from the paper start time.
 *
 * All inputs are plain numbers and strings so the function stays pure — it never
 * reads the system clock.
 *
 * @param {object} input
 * @param {string} input.examStart          "HH:MM" start of writing time.
 * @param {number} input.durationMinutes    Length of the writing session.
 * @param {string} input.boardId            One of BOARDS ids.
 * @param {number} input.travelMinutes      One-way journey to the centre.
 * @param {number} input.getReadyMinutes    Bath, breakfast, final bag check.
 * @param {number} input.arriveEarlyMinutes How far ahead of gate close you want to be.
 * @param {number} [input.gateCloseBefore]  Override the board default.
 * @param {number} [input.readingMinutes]   Override the board default.
 * @returns {object} timeline, or { error } when the input cannot produce a timeline.
 */
export function buildExamDayTimeline({
  examStart = "10:30",
  durationMinutes = 180,
  boardId = "cbse",
  travelMinutes = 30,
  getReadyMinutes = 60,
  arriveEarlyMinutes = 30,
  gateCloseBefore,
  readingMinutes,
} = {}) {
  const board = BOARDS.find((entry) => entry.id === boardId);
  if (!board) return { error: "Choose the board that is conducting your paper." };

  const start = parseClock(examStart);
  if (start === null) {
    return { error: "Enter the paper start time as a 24-hour clock value, for example 10:30." };
  }

  const duration = Number(durationMinutes);
  if (!Number.isFinite(duration) || duration <= 0) {
    return { error: "Enter how long the paper runs, in minutes." };
  }
  if (duration > MAX_PAPER_MINUTES) {
    return { error: `A board paper longer than ${MAX_PAPER_MINUTES} minutes is outside this planner.` };
  }

  const travel = Number(travelMinutes);
  if (!Number.isFinite(travel) || travel < 0) {
    return { error: "Travel time cannot be negative. Enter the one-way journey in minutes." };
  }
  if (travel > MAX_TRAVEL_MINUTES) {
    return { error: `A journey over ${MAX_TRAVEL_MINUTES} minutes means staying near the centre the night before.` };
  }

  const getReady = Number(getReadyMinutes);
  if (!Number.isFinite(getReady) || getReady < 0) {
    return { error: "Getting-ready time cannot be negative." };
  }

  const arriveEarly = Number(arriveEarlyMinutes);
  if (!Number.isFinite(arriveEarly) || arriveEarly < 0) {
    return { error: "Arrive-early buffer cannot be negative." };
  }

  const gateGap = gateCloseBefore === undefined || gateCloseBefore === null || gateCloseBefore === ""
    ? board.gateCloseBeforeStart
    : Number(gateCloseBefore);
  if (!Number.isFinite(gateGap) || gateGap < 0 || gateGap > 180) {
    return { error: "Gate-closing time must be between 0 and 180 minutes before the paper starts." };
  }

  const reading = readingMinutes === undefined || readingMinutes === null || readingMinutes === ""
    ? board.readingMinutes
    : Number(readingMinutes);
  if (!Number.isFinite(reading) || reading < 0 || reading > 60) {
    return { error: "Reading time must be between 0 and 60 minutes." };
  }

  const gateClose = start - gateGap;
  const readingStart = start - reading;
  const paperHandout = start - Math.max(reading, board.paperHandoutBeforeStart);
  const targetArrival = gateClose - arriveEarly;
  const leaveHome = targetArrival - travel;
  const wakeUp = leaveHome - getReady;
  const examEnd = start + duration;

  // Negative minutes mean the step falls on the previous calendar day.
  const dayBefore = (value) => value < 0;

  const warnings = [];
  if (wakeUp < 0) {
    warnings.push(
      "On these numbers you would have to start getting ready before midnight. Trim the journey by staying closer to the centre, or cut the buffer.",
    );
  }
  if (arriveEarly < 15) {
    warnings.push(
      "Under 15 minutes of slack at the gate leaves nothing for a wrong turn or a queue at the entry check. Thirty minutes is the usual advice.",
    );
  }
  if (reading > 0 && reading < 10) {
    warnings.push(
      "Most boards give 10 to 15 minutes of reading time. Check the figure printed on your admit card before relying on this one.",
    );
  }

  const seated = Math.min(gateClose + 5, paperHandout);

  const rawSteps = [
    { id: "wake", label: "Start getting ready", at: wakeUp, detail: "Bath, breakfast, uniform, final bag check against the list below." },
    { id: "leave", label: "Leave home", at: leaveHome, detail: `Allows ${formatDuration(travel)} for the journey.` },
    { id: "arrive", label: "Reach the centre", at: targetArrival, detail: `${formatDuration(arriveEarly)} before the gate closes — time to find your room and seat number on the board.` },
    { id: "gate", label: "Gate closes", at: gateClose, detail: "No candidate is admitted after this moment, whatever the reason." },
    { id: "seated", label: "In your seat", at: seated, detail: "Roll number verified, admit card and school ID on the desk corner." },
    { id: "handout", label: "Question paper handed out", at: paperHandout, detail: "Fill the roll number and paper code on the answer book cover. Nothing else is written yet." },
    { id: "reading", label: "Reading time begins", at: readingStart, detail: `${formatDuration(reading)} to read the paper, mark the questions you will attempt and plan the order. No writing on the answer book.` },
    { id: "write", label: "Writing time begins", at: start, detail: `${formatDuration(duration)} of writing.` },
    { id: "end", label: "Paper ends", at: examEnd, detail: "Hand the answer book to the invigilator before leaving the seat." },
  ];

  // On CBSE timings the paper reaches the desk exactly when reading time starts, so
  // the two rows collapse into one instead of printing the same clock twice.
  const merged = reading > 0 && paperHandout === readingStart;

  const steps = rawSteps
    .filter((step) => !(step.id === "reading" && reading === 0))
    .filter((step) => !(step.id === "reading" && merged))
    .map((step) =>
      step.id === "handout" && merged
        ? {
            ...step,
            label: "Question paper handed out, reading time begins",
            detail: `Fill the roll number and paper code on the answer book cover, then use the ${formatDuration(reading)} to read the paper and plan the order of attempt. Nothing is written on the answer book itself yet.`,
          }
        : step,
    )
    .sort((a, b) => a.at - b.at)
    .map((step) => ({ ...step, clock: formatClock(step.at), previousDay: dayBefore(step.at) }));

  return {
    board,
    steps,
    wakeUp,
    leaveHome,
    targetArrival,
    gateClose,
    paperHandout,
    readingStart,
    writingStart: start,
    examEnd,
    readingMinutes: reading,
    gateCloseBefore: gateGap,
    totalDayMinutes: examEnd - wakeUp,
    slackAtGate: arriveEarly,
    warnings,
  };
}

/**
 * The kit list, split into what you must carry, what helps, and what will get you
 * thrown out of the hall.
 *
 * @param {object} input
 * @param {string} input.boardId
 * @param {string} input.paperType   One of PAPER_TYPES ids.
 * @param {object} [input.flags]
 * @returns {object} { documents, stationery, comfort, prohibited } or { error }
 */
export function buildExamDayKit({ boardId = "cbse", paperType = "general", flags = {} } = {}) {
  const board = BOARDS.find((entry) => entry.id === boardId);
  if (!board) return { error: "Choose the board that is conducting your paper." };

  const paper = PAPER_TYPES.find((entry) => entry.id === paperType);
  if (!paper) return { error: "Choose the kind of paper you are sitting." };

  const documents = [
    {
      id: "admitCard",
      label: "Admit card / hall ticket, printed on plain white paper",
      detail:
        "Print a fresh copy rather than reusing a creased one, and keep a spare print in the bag. A photograph on a phone screen is not accepted.",
    },
    {
      id: "schoolId",
      label: "School identity card",
      detail:
        "Regular candidates carry the school ID alongside the admit card. Private and repeat candidates carry a government photo ID instead.",
    },
  ];

  if (flags.privateCandidate) {
    documents.push({
      id: "photoId",
      label: "Government photo identity — Aadhaar, passport or voter ID",
      detail: "Private, compartment and repeat candidates are verified against a government ID because there is no school card.",
    });
  }
  if (flags.needsScribe) {
    documents.push({
      id: "scribeApproval",
      label: "Written approval for the scribe, and the scribe's own identity proof",
      detail:
        "Scribe and compensatory time are granted in advance by the board on the disability certificate. Carry the sanction letter — the centre cannot approve one on the day.",
    });
  }

  const stationery = [
    {
      id: "pens",
      label: "Three blue or black ballpoint pens of the same ink",
      detail: "Two working plus one spare. Do not mix ink colours inside one answer book.",
    },
    {
      id: "pouch",
      label: "Transparent pouch or clear plastic folder",
      detail: "Opaque pencil cases are usually turned away at the frisking point. A see-through pouch clears the check without argument.",
    },
    {
      id: "pencil",
      label: "Two sharpened HB pencils, eraser and sharpener",
      detail: "Needed even on a language paper for underlining and rough work.",
    },
    {
      id: "scale",
      label: "15 cm transparent ruler",
      detail: "For ruling margins, tables and the line under a completed answer.",
    },
    {
      id: "clipboard",
      label: "Plain clipboard or exam pad, with no writing on it",
      detail: "Many centres provide only a bare desk. A pad with printed formulae or stickers will be confiscated.",
    },
  ];

  if (paper.id === "maths" || paper.id === "drawing") {
    stationery.push({
      id: "geometry",
      label: "Geometry box — compass, divider, protractor, set squares",
      detail: "Check the compass holds a pencil stub and tightens properly. A loose compass ruins a construction question.",
    });
  }
  if (paper.id === "mapwork") {
    stationery.push({
      id: "mapkit",
      label: "Sharp pencil and a fine-tip pen for the map item",
      detail:
        "Map features are marked in pencil and labelled clearly. The map sheet is attached to the question paper and must be tied back into the answer book at the end.",
    });
  }
  if (paper.id === "drawing") {
    stationery.push({
      id: "drawingKit",
      label: "Drawing materials as listed on the timetable for the paper",
      detail:
        "Drawing, Painting and Engineering Graphics papers expect you to bring your own colours, brushes or drafting instruments. The centre supplies only the sheet.",
    });
  }
  if (paper.id === "science" || paper.id === "commerce" || paper.id === "maths") {
    stationery.push({
      id: "roughPlan",
      label: "Nothing else — the working goes on the answer book itself",
      detail:
        "Rough work is done on the last pages of the answer book, headed 'Rough Work' and struck through at the end. Loose sheets are not permitted.",
    });
  }

  const comfort = [
    {
      id: "bottle",
      label: "Transparent water bottle",
      detail: "Plain, unlabelled and see-through. Coloured or foil-wrapped bottles are commonly refused.",
    },
    {
      id: "analogWatch",
      label: "Simple analogue wrist watch",
      detail:
        "Useful because the hall clock may be behind you. It must be an ordinary watch — smart watches and digital watches with memory are banned.",
    },
    {
      id: "handkerchief",
      label: "Plain handkerchief and a mask if you are unwell",
      detail: "No printed cloth. Anything with writing on it is treated as material.",
    },
    {
      id: "medicine",
      label: "Any regular medicine, with the prescription",
      detail: "Inhalers, insulin and similar are allowed on production of the prescription. Tell the invigilator before the paper begins.",
    },
  ];

  const prohibited = [
    {
      id: "phone",
      label: "Mobile phone, earbuds, smart watch or any Bluetooth device",
      detail:
        "Carrying one into the hall is treated as unfair means even if it is switched off. Leave it at home or with the person who drops you.",
    },
    {
      id: "calculator",
      label: "Calculator or log tables",
      detail:
        "Not permitted in general theory papers. CBSE allows a calculator only where the board has granted that exemption in advance under its scheme for children with special needs.",
    },
    {
      id: "material",
      label: "Printed or handwritten paper, chits, marked stationery",
      detail: "This includes formula stickers on the geometry box or the clipboard.",
    },
    {
      id: "bag",
      label: "Bag, wallet, jewellery, printed cloth",
      detail: "Most centres keep bags outside the hall at your own risk. Carry as little as possible.",
    },
  ];

  return { board, paper, documents, stationery, comfort, prohibited };
}

/**
 * Readiness against the items that are genuinely mandatory: documents and stationery.
 *
 * @param {object} kit    The object returned by buildExamDayKit.
 * @param {Array<string>} packedIds
 * @returns {{ packed:number, total:number, percent:number, missing:Array, ready:boolean }}
 */
export function computePackedProgress(kit, packedIds) {
  const packed = Array.isArray(packedIds) ? packedIds : [];
  const mandatory = [
    ...(kit && Array.isArray(kit.documents) ? kit.documents : []),
    ...(kit && Array.isArray(kit.stationery) ? kit.stationery : []),
  ];
  const missing = mandatory.filter((item) => !packed.includes(item.id));
  const total = mandatory.length;
  const held = total - missing.length;
  return {
    packed: held,
    total,
    percent: total === 0 ? 0 : Math.round((held / total) * 100),
    missing,
    ready: total > 0 && missing.length === 0,
  };
}

export default buildExamDayTimeline;
