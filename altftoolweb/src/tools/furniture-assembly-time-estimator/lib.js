/**
 * How long a flat-pack build takes.
 *
 * The estimate is a work-content model: every panel has to be found and
 * oriented, every fastener has to be driven, and each fixing type takes a
 * different amount of time.
 *
 *   per item = base + parts x 0.8 + screws x 0.4 + cam locks x 0.6 + dowels x 0.2   (minutes)
 *
 * That figure is then scaled by who is building it and with what:
 *
 *   adjusted = per item x experience factor x tool factor
 *
 * Building several identical items is faster per item than building one,
 * because you stop re-reading the manual. That is Wright's learning curve
 * (T. P. Wright, 1936): with a 90% learning rate, every doubling of the number
 * built cuts the unit time to 90% of what it was, so the time for unit i is
 * i^log2(0.9) times the first unit and the total is the sum of that series.
 *
 * Extra people help, but not proportionally - two people are worth about 1.6
 * builders once handing parts, holding panels and talking to each other is
 * counted, and the gain flattens off after three.
 */

/** Minutes of handling per flat panel or major component. */
export const MIN_PER_PART = 0.8;

/** Minutes to drive one ordinary screw. */
export const MIN_PER_FASTENER = 0.4;

/** Minutes for one cam lock: insert the bolt, drop the cam, turn and check. */
export const MIN_PER_CAM = 0.6;

/** Minutes to tap in one wooden dowel. */
export const MIN_PER_DOWEL = 0.2;

/** Opening the carton and sorting parts against the list. */
export const UNPACK_BASE_MIN = 6;
export const UNPACK_PER_PART_MIN = 0.15;

/** Reading the instructions through once, before starting. */
export const MANUAL_READ_MIN = 5;

/** Flattening cartons, sweeping and putting tools away. */
export const CLEANUP_BASE_MIN = 6;
export const CLEANUP_PER_PART_MIN = 0.1;

/** Wright learning curve rate: each doubling of quantity cuts unit time to 90%. */
export const LEARNING_RATE = 0.9;

/** The same rate expressed as a percentage, for display. */
export const LEARNING_RATE_PCT = 90;

/** A 10 minute break for every 90 minutes of work. */
export const WORK_BLOCK_MIN = 90;
export const BREAK_MIN = 10;

/** Typical flat-pack items, with the part and fastener counts they usually ship with. */
export const ITEM_PRESETS = [
  { id: "bookshelf", label: "Bookshelf, 5 shelves", base: 20, parts: 12, fasteners: 20, cams: 16, dowels: 20 },
  { id: "wardrobe", label: "Wardrobe, 2 doors", base: 45, parts: 22, fasteners: 60, cams: 40, dowels: 40 },
  { id: "drawers", label: "Chest of 4 drawers", base: 40, parts: 34, fasteners: 70, cams: 40, dowels: 40 },
  { id: "bed", label: "Bed frame, double or queen", base: 35, parts: 14, fasteners: 30, cams: 12, dowels: 12 },
  { id: "desk", label: "Desk or study table", base: 25, parts: 12, fasteners: 26, cams: 12, dowels: 12 },
  { id: "tvunit", label: "TV unit", base: 25, parts: 16, fasteners: 32, cams: 24, dowels: 24 },
  { id: "chair-office", label: "Office chair", base: 15, parts: 10, fasteners: 18, cams: 0, dowels: 0 },
  { id: "dining-table", label: "Dining table", base: 20, parts: 8, fasteners: 16, cams: 0, dowels: 8 },
  { id: "dining-chair", label: "Dining chair", base: 12, parts: 8, fasteners: 12, cams: 0, dowels: 4 },
  { id: "shoe-rack", label: "Shoe rack or small cabinet", base: 15, parts: 10, fasteners: 18, cams: 12, dowels: 12 },
  { id: "sofa", label: "Modular sofa section", base: 25, parts: 10, fasteners: 16, cams: 0, dowels: 0 },
  { id: "custom", label: "Something else — I will enter the counts", base: 20, parts: 12, fasteners: 24, cams: 12, dowels: 12 },
];

export const EXPERIENCE_LEVELS = [
  { id: "first", label: "First flat-pack I have built", factor: 1.4 },
  { id: "occasional", label: "Built a few before", factor: 1 },
  { id: "confident", label: "Confident — I do this often", factor: 0.75 },
  { id: "pro", label: "Professional assembler", factor: 0.6 },
];

export const TOOL_LEVELS = [
  { id: "supplied", label: "Only the Allen key in the box", factor: 1.35 },
  { id: "handtools", label: "Hand screwdriver and hammer", factor: 1.15 },
  { id: "cordless", label: "Cordless drill-driver", factor: 0.85 },
  { id: "clutch", label: "Drill-driver with clutch, plus bit set", factor: 0.75 },
];

/** Effective builders for a team of n — coordination overhead included. */
export const TEAM_EFFICIENCY = [1, 1.6, 2, 2.2];

export const MAX_QUANTITY = 50;

/** Sum of the Wright learning-curve factors for units 1..quantity. */
export function learningSum(quantity, rate = LEARNING_RATE) {
  const q = Math.round(Number(quantity));
  const r = Number(rate);
  if (!Number.isInteger(q) || q < 1) return NaN;
  if (!(r > 0) || r > 1) return NaN;
  const exponent = Math.log(r) / Math.log(2);
  let sum = 0;
  for (let i = 1; i <= q; i += 1) sum += Math.pow(i, exponent);
  return sum;
}

/** Add minutes to a "HH:MM" clock time. Pure — the clock time is an argument. */
export function addMinutesToClock(startHHMM, minutes) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(startHHMM).trim());
  const add = Number(minutes);
  if (!match || !Number.isFinite(add)) return null;
  const hours = Number(match[1]);
  const mins = Number(match[2]);
  if (hours < 0 || hours > 23 || mins < 0 || mins > 59) return null;
  const total = hours * 60 + mins + Math.round(add);
  const dayOffset = Math.floor(total / (24 * 60));
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const mm = String(wrapped % 60).padStart(2, "0");
  return { time: `${hh}:${mm}`, dayOffset };
}

/**
 * @param {object} input
 * @param {string} input.item        id from ITEM_PRESETS
 * @param {number} input.parts       flat panels and major components
 * @param {number} input.fasteners   ordinary screws
 * @param {number} input.cams        cam locks
 * @param {number} input.dowels      wooden dowels
 * @param {number} input.quantity    how many identical items
 * @param {string} input.experience  id from EXPERIENCE_LEVELS
 * @param {string} input.tools       id from TOOL_LEVELS
 * @param {number} input.people      builders, 1 to 4
 * @param {string} input.startTime   "HH:MM" clock time to finish from
 * @returns {object} the estimate, or { error }
 */
export function estimateAssembly({
  item = "bookshelf",
  parts,
  fasteners,
  cams,
  dowels,
  quantity = 1,
  experience = "occasional",
  tools = "handtools",
  people = 1,
  startTime = "10:00",
}) {
  const preset = ITEM_PRESETS.find((entry) => entry.id === item);
  const skill = EXPERIENCE_LEVELS.find((entry) => entry.id === experience);
  const kit = TOOL_LEVELS.find((entry) => entry.id === tools);
  if (!preset) return { error: "Choose an item type." };
  if (!skill) return { error: "Choose an experience level." };
  if (!kit) return { error: "Choose the tools you have." };

  const p = Number(parts);
  const f = Number(fasteners);
  const c = Number(cams);
  const d = Number(dowels);
  const q = Number(quantity);
  const team = Math.round(Number(people));

  if (![p, f, c, d, q].every((v) => Number.isFinite(v))) {
    return { error: "Enter valid numbers for parts, fasteners, cam locks, dowels and quantity." };
  }
  if (p < 1) return { error: "An item needs at least one part." };
  if (p > 500 || f > 2000 || c > 1000 || d > 1000) {
    return { error: "Those counts are far beyond a flat-pack item — check the numbers." };
  }
  if (f < 0 || c < 0 || d < 0) return { error: "Fastener counts cannot be negative." };
  if (!Number.isInteger(q) || q < 1 || q > MAX_QUANTITY) {
    return { error: `Quantity must be a whole number between 1 and ${MAX_QUANTITY}.` };
  }
  if (!Number.isInteger(team) || team < 1 || team > TEAM_EFFICIENCY.length) {
    return { error: `Number of people must be a whole number between 1 and ${TEAM_EFFICIENCY.length}.` };
  }

  const efficiency = TEAM_EFFICIENCY[team - 1];
  const modifier = skill.factor * kit.factor;

  const workContent =
    preset.base + p * MIN_PER_PART + f * MIN_PER_FASTENER + c * MIN_PER_CAM + d * MIN_PER_DOWEL;
  const perItemAdjusted = workContent * modifier;

  const curveSum = learningSum(q);
  const assemblyMinutes = perItemAdjusted * curveSum;
  const unpackMinutes = (UNPACK_BASE_MIN + p * UNPACK_PER_PART_MIN) * q * skill.factor;
  const cleanupMinutes = (CLEANUP_BASE_MIN + p * CLEANUP_PER_PART_MIN) * q;
  const manualMinutes = MANUAL_READ_MIN * skill.factor;

  const sharedWork = (assemblyMinutes + unpackMinutes + cleanupMinutes) / efficiency;
  const workingMinutes = sharedWork + manualMinutes;
  const breakMinutes = Math.floor(workingMinutes / WORK_BLOCK_MIN) * BREAK_MIN;
  const totalMinutes = workingMinutes + breakMinutes;

  const finish = addMinutesToClock(startTime, totalMinutes);

  return {
    itemLabel: preset.label,
    parts: p,
    fasteners: f,
    cams: c,
    dowels: d,
    quantity: q,
    people: team,
    teamEfficiency: efficiency,
    experienceFactor: skill.factor,
    toolFactor: kit.factor,
    combinedFactor: modifier,
    workContentMinutes: workContent,
    perItemAdjustedMinutes: perItemAdjusted,
    perItemAverageMinutes: assemblyMinutes / q,
    learningSum: curveSum,
    learningSavingMinutes: perItemAdjusted * q - assemblyMinutes,
    assemblyMinutes,
    unpackMinutes,
    cleanupMinutes,
    manualMinutes,
    breakMinutes,
    workingMinutes,
    totalMinutes,
    optimisticMinutes: totalMinutes * 0.8,
    pessimisticMinutes: totalMinutes * 1.35,
    finishTime: finish ? finish.time : null,
    finishDayOffset: finish ? finish.dayOffset : null,
    startTime,
  };
}

/** Turn minutes into "2 h 15 min". */
export function formatDuration(minutes) {
  const total = Math.round(Number(minutes));
  if (!Number.isFinite(total) || total < 0) return "—";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** Tools worth having on the floor before you start. */
export function toolChecklist({ cams = 0, dowels = 0, fasteners = 0, quantity = 1 }) {
  const list = [
    "The Allen keys and cam bolts that came in the box",
    "A cross-head (Phillips) screwdriver, PH2",
    "A soft cloth or offcut of cardboard to protect finished faces",
  ];
  if (Number(fasteners) > 20) list.push("A cordless drill-driver with the clutch set low");
  if (Number(dowels) > 0) list.push("A rubber or nylon mallet for the dowels");
  if (Number(cams) > 0) list.push("A flat-blade screwdriver for seating cam locks");
  if (Number(quantity) > 1) list.push("A clear floor area big enough to lay out more than one carton");
  list.push("A rubbish bag or box for packaging as you go");
  return list;
}
