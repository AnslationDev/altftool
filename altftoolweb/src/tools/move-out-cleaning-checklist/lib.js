/**
 * End-of-tenancy cleaning planner.
 *
 * The standard a tenant is normally held to is the condition recorded at
 * check-in, less fair wear and tear. So the list is built room by room from the
 * jobs that appear repeatedly in deposit deductions — the oven, limescale,
 * grout mould, carpet stains, wall marks, rubbish left behind — rather than
 * from a general tidying routine.
 *
 * Two numbers come out of it:
 *
 *   - Time. Each task carries a professional time allowance in minutes, per
 *     instance of the room. Multiply by the number of bedrooms and bathrooms
 *     and you get the real length of the job.
 *   - Money. The remaining minutes priced at a cleaner's hourly rate is a fair
 *     proxy for what a landlord's contractor would charge, which is the usual
 *     basis for a cleaning deduction.
 *
 * Tasks are weighted: critical = 3, high = 2, normal = 1. Any unticked critical
 * task caps the verdict, because those are the ones that get charged for.
 *
 * This is practical guidance, not legal advice — what can actually be deducted
 * depends on your agreement, the check-in record and local tenancy law.
 */

export const WEIGHTS = { critical: 3, high: 2, normal: 1 };

export const WEIGHT_LABELS = {
  critical: "Deduction magnet",
  high: "Usually inspected",
  normal: "Finishing touch",
};

/** Percent-of-work thresholds for the readiness verdict, once no critical task is open. */
export const READY_PERCENT = 95;
export const NEARLY_PERCENT = 75;

/**
 * Rooms and their tasks.
 * countable rooms multiply their minutes and weight by how many you have.
 */
export const ROOM_TYPES = [
  {
    id: "kitchen",
    name: "Kitchen",
    countable: false,
    optional: false,
    tasks: [
      { id: "oven", text: "Degrease the oven, racks, grill pan and door glass", minutes: 75, weight: "critical" },
      { id: "extractor", text: "Degrease the extractor hood and wash or replace the filter", minutes: 25, weight: "high" },
      { id: "hob", text: "Clean the hob, splashback and worktops, including under small appliances", minutes: 20, weight: "high" },
      { id: "fridge", text: "Empty, defrost and wipe the fridge and freezer inside, behind and underneath", minutes: 40, weight: "critical" },
      { id: "cupboards", text: "Empty and wipe every cupboard and drawer, inside and out", minutes: 45, weight: "high" },
      { id: "sink", text: "Descale the sink, taps and drain, and clear the trap", minutes: 15, weight: "high" },
      { id: "washer", text: "Clean the washing machine drawer, door seal and pump filter", minutes: 20, weight: "high" },
      { id: "kitchenFloor", text: "Sweep and mop the floor including edges and behind the appliances", minutes: 25, weight: "normal" },
      { id: "bin", text: "Wash and deodorise the bin and the bin cupboard", minutes: 10, weight: "normal" },
    ],
  },
  {
    id: "bathroom",
    name: "Bathroom",
    countable: true,
    optional: false,
    tasks: [
      { id: "limescale", text: "Remove limescale from taps, screen, tiles and shower head", minutes: 30, weight: "critical" },
      { id: "mould", text: "Treat mould in the grout, sealant and around the extractor", minutes: 25, weight: "critical" },
      { id: "toilet", text: "Clean the toilet inside, under the rim, at the base and behind the pan", minutes: 20, weight: "high" },
      { id: "mirror", text: "Clean the mirror, cabinet, shelves and surfaces", minutes: 10, weight: "normal" },
      { id: "fan", text: "Wash the extractor fan cover", minutes: 10, weight: "normal" },
      { id: "bathFloor", text: "Mop the floor and wipe the skirting", minutes: 15, weight: "normal" },
    ],
  },
  {
    id: "bedroom",
    name: "Bedroom",
    countable: true,
    optional: false,
    tasks: [
      { id: "wardrobes", text: "Empty and wipe wardrobes, drawers and shelves", minutes: 20, weight: "high" },
      { id: "windows", text: "Clean windows inside, plus sills and runner tracks", minutes: 20, weight: "high" },
      { id: "carpet", text: "Deep vacuum the carpet or mop the floor, and treat any stains", minutes: 25, weight: "high" },
      { id: "hooks", text: "Remove picture hooks and nails and fill the holes", minutes: 15, weight: "high" },
      { id: "skirting", text: "Wipe skirting, doors, handles and light switches", minutes: 15, weight: "normal" },
      { id: "fan", text: "Dust the ceiling fan, light fitting and vents", minutes: 10, weight: "normal" },
    ],
  },
  {
    id: "living",
    name: "Living / dining room",
    countable: true,
    optional: false,
    tasks: [
      { id: "floor", text: "Deep clean the carpet or floor and treat stains", minutes: 35, weight: "critical" },
      { id: "walls", text: "Remove scuffs and marks from the walls and fill any holes", minutes: 25, weight: "high" },
      { id: "windows", text: "Clean windows, sills, tracks, blinds and curtain rails", minutes: 25, weight: "high" },
      { id: "surfaces", text: "Wipe skirting, doors, switches and socket faces", minutes: 20, weight: "normal" },
      { id: "acFilter", text: "Wash the AC filter or clean the fireplace", minutes: 15, weight: "normal" },
    ],
  },
  {
    id: "general",
    name: "Whole property",
    countable: false,
    optional: false,
    tasks: [
      { id: "rubbish", text: "Remove every bag of rubbish and every unwanted item from the property", minutes: 40, weight: "critical" },
      { id: "evidence", text: "Photograph every room after cleaning, dated, against the check-in inventory", minutes: 30, weight: "critical" },
      { id: "keys", text: "Collect all keys, fobs, remotes, manuals and warranty cards for handover", minutes: 10, weight: "critical" },
      { id: "windowsAll", text: "Clean the remaining windows inside, including the hallway and stairs", minutes: 25, weight: "high" },
      { id: "bulbs", text: "Replace blown bulbs and clean light fittings and shades", minutes: 15, weight: "high" },
      { id: "storage", text: "Empty the loft, meter cupboard and any storage you were given", minutes: 15, weight: "high" },
      { id: "doors", text: "Wipe internal doors, frames and handles", minutes: 20, weight: "normal" },
      { id: "cobwebs", text: "Clear cobwebs from ceiling corners, vents and the entrance", minutes: 15, weight: "normal" },
    ],
  },
  {
    id: "outdoor",
    name: "Balcony, garden and parking",
    countable: false,
    optional: true,
    tasks: [
      { id: "balcony", text: "Sweep the balcony or patio and clear the drains", minutes: 25, weight: "high" },
      { id: "garden", text: "Mow and tidy the garden back to its check-in condition", minutes: 60, weight: "high" },
      { id: "bins", text: "Empty and wash the outside bins", minutes: 15, weight: "normal" },
      { id: "parking", text: "Sweep the parking space and treat oil stains", minutes: 20, weight: "normal" },
    ],
  },
];

const MINUTES_PER_HOUR = 60;

const isCount = (value) => Number.isFinite(value) && value >= 0;

/**
 * Build the cleaning plan.
 *
 * @param {object} input
 * @param {Record<string, number>} input.rooms  Room type id -> how many (countable rooms only).
 * @param {boolean} input.includeOutdoor        Include the outdoor section.
 * @param {string[]} input.done                 Ticked task keys, "<roomTypeId>:<taskId>".
 * @param {number} input.hourlyRate             Cleaner's hourly rate in your currency (0-10000).
 * @param {number} input.deposit                Deposit held, for the comparison (0-10,000,000).
 * @returns {object} plan and verdict, or { error }.
 */
export function buildCleaningPlan({
  rooms = {},
  includeOutdoor = false,
  done = [],
  hourlyRate = 0,
  deposit = 0,
} = {}) {
  const rate = Number(hourlyRate);
  const dep = Number(deposit);

  if (!isCount(rate)) return { error: "Enter an hourly cleaning rate of 0 or more." };
  if (rate > 10000) return { error: "Enter an hourly rate of up to 10,000." };
  if (!isCount(dep)) return { error: "Enter a deposit amount of 0 or more." };
  if (dep > 10000000) return { error: "Enter a deposit of up to 1,00,00,000." };

  const counts = {};
  for (const room of ROOM_TYPES) {
    if (!room.countable) {
      counts[room.id] = 1;
      continue;
    }
    const raw = Number(rooms[room.id] ?? 0);
    if (!isCount(raw)) return { error: `Enter 0 or more ${room.name.toLowerCase()}s.` };
    if (raw > 20) return { error: `Enter up to 20 ${room.name.toLowerCase()}s.` };
    counts[room.id] = Math.floor(raw);
  }

  const doneSet = new Set(Array.isArray(done) ? done.filter((id) => typeof id === "string") : []);

  const sections = ROOM_TYPES.filter((room) => {
    if (room.optional && !includeOutdoor) return false;
    return counts[room.id] > 0;
  }).map((room) => {
    const count = counts[room.id];
    const tasks = room.tasks.map((task) => {
      const key = `${room.id}:${task.id}`;
      const minutes = task.minutes * count;
      return {
        ...task,
        key,
        count,
        minutes,
        points: WEIGHTS[task.weight] * count,
        done: doneSet.has(key),
      };
    });
    return {
      id: room.id,
      name: room.name,
      count,
      countable: room.countable,
      tasks,
      minutes: tasks.reduce((sum, task) => sum + task.minutes, 0),
      remainingMinutes: tasks.reduce((sum, task) => sum + (task.done ? 0 : task.minutes), 0),
      doneCount: tasks.filter((task) => task.done).length,
    };
  });

  if (sections.length === 0) {
    return { error: "Add at least one room to build a cleaning plan." };
  }

  const allTasks = sections.flatMap((section) => section.tasks);
  const totalMinutes = allTasks.reduce((sum, task) => sum + task.minutes, 0);
  const remainingMinutes = allTasks.reduce((sum, task) => sum + (task.done ? 0 : task.minutes), 0);
  const totalPoints = allTasks.reduce((sum, task) => sum + task.points, 0);
  const donePoints = allTasks.reduce((sum, task) => sum + (task.done ? task.points : 0), 0);
  const openCritical = allTasks.filter((task) => !task.done && task.weight === "critical");

  // totalPoints is always positive: every section carries at least one task.
  const percentDone = Math.round((donePoints / totalPoints) * 100);

  const remainingHours = remainingMinutes / MINUTES_PER_HOUR;
  const estimatedCost = Math.round(remainingHours * rate);
  const depositShare = dep > 0 ? Math.min(100, Math.round((estimatedCost / dep) * 100)) : null;

  let level;
  let verdict;
  if (openCritical.length > 0) {
    level = "risk";
    verdict = `${openCritical.length} deduction-magnet job${openCritical.length === 1 ? "" : "s"} still open — these are the ones landlords charge for.`;
  } else if (percentDone >= READY_PERCENT) {
    level = "ready";
    verdict = "Ready for the checkout inspection — photograph everything before you hand the keys over.";
  } else if (percentDone >= NEARLY_PERCENT) {
    level = "nearly";
    verdict = "Nearly there — the high-risk jobs are done, finish the remaining detail work.";
  } else {
    level = "early";
    verdict = "Early: the deduction magnets are handled, but most of the clean is still ahead of you.";
  }

  return {
    sections,
    totalTasks: allTasks.length,
    doneCount: allTasks.filter((task) => task.done).length,
    totalMinutes,
    remainingMinutes,
    totalHours: Math.round((totalMinutes / MINUTES_PER_HOUR) * 10) / 10,
    remainingHours: Math.round(remainingHours * 10) / 10,
    percentDone,
    openCritical,
    level,
    verdict,
    estimatedCost,
    depositShare,
    deposit: dep,
    hourlyRate: rate,
  };
}
