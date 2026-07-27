/**
 * Countdown checklist for a house move.
 *
 * The schedule is anchored on moving day and works backwards in phases at
 * -56, -42, -28, -21, -14 and -7 days, then moving day itself and two
 * follow-up phases at +3 and +14 days. Eight weeks is the lead time removal
 * firms ask for on a peak-season booking; the later phases are ordered by hard
 * external deadlines rather than preference:
 *
 *   - a residential tenancy notice period is commonly one to two months, so
 *     the lease check sits in the first phase
 *   - utility transfer and disconnection requests generally need several
 *     working days' notice, so they sit at four weeks
 *   - a fridge must be defrosted and left to drain for at least 24 hours
 *     before it is moved, so it sits in the final week
 *   - meter readings and photographs must be taken on the day itself, because
 *     they are the only evidence of where one occupier's bill ends
 *
 * Conditional tasks are tagged with the option that switches them on, so a
 * cash buyer is not asked about a deposit and a DIY mover is not asked to
 * confirm a crew.
 *
 * Everything here is pure: pass both the moving date and today's date in.
 */

export const MS_PER_DAY = 86400000;

/** Options that switch conditional tasks on. */
export const OPTION_KEYS = ["renting", "hiringMovers", "hasPets", "hasKids", "international"];

export const OPTION_LABELS = {
  renting: "I am renting (now or at the new place)",
  hiringMovers: "I am hiring professional packers/movers",
  hasPets: "We have pets",
  hasKids: "We have school-age children",
  international: "This is an international or cross-border move",
};

/**
 * Phases. offsetDays is relative to moving day (negative = before).
 * A task with no `when` always applies; otherwise `when` names an option key,
 * and `unless` names an option key that removes it.
 */
export const PHASES = [
  {
    id: "w8",
    label: "8 weeks before",
    offsetDays: -56,
    tasks: [
      { id: "inventory", text: "Walk every room and list what moves, what is sold and what is thrown out" },
      { id: "declutter", text: "Start selling or donating — every item removed now is one you never pay to transport" },
      { id: "notice", text: "Check the notice period in your lease or agreement and serve notice in writing", when: "renting" },
      { id: "quotes", text: "Get three written quotes from movers, each based on the same inventory", when: "hiringMovers" },
      { id: "diyVan", text: "Check hire-van availability and licence requirements for your move date", unless: "hiringMovers" },
      { id: "folder", text: "Open one folder (paper or digital) for quotes, receipts, readings and photos" },
      { id: "leave", text: "Book time off work for moving day and the day after" },
      { id: "customs", text: "Check visa, customs and prohibited-item rules for the destination country", when: "international" },
    ],
  },
  {
    id: "w6",
    label: "6 weeks before",
    offsetDays: -42,
    tasks: [
      { id: "book", text: "Confirm the mover in writing — date, address, inventory, price and insurance cover", when: "hiringMovers" },
      { id: "bookVan", text: "Book the hire vehicle and line up the people who will help you load", unless: "hiringMovers" },
      { id: "lift", text: "Book the service lift and loading bay at both buildings, and get society permission" },
      { id: "materials", text: "Order cartons, tape, bubble wrap and markers" },
      { id: "school", text: "Request school transfer certificates and confirm admission at the new school", when: "hasKids" },
      { id: "vet", text: "Get vet records, microchip details and any travel certificate for pets", when: "hasPets" },
      { id: "shipping", text: "Book the international shipment and prepare the valued customs inventory", when: "international" },
    ],
  },
  {
    id: "w4",
    label: "4 weeks before",
    offsetDays: -28,
    tasks: [
      { id: "packNonEssential", text: "Start packing anything you will not need before the move — books, off-season clothes, decor" },
      { id: "utilities", text: "Book electricity, gas, water and broadband transfer or disconnection at the old address" },
      { id: "newUtilities", text: "Book connections at the new address so you arrive with power and internet" },
      { id: "redirect", text: "Set up mail redirection and update the delivery addresses saved in shopping apps" },
      { id: "bank", text: "Update your address with banks, insurers, employer and any subscription that ships goods" },
      { id: "insurance", text: "Confirm transit insurance — what it covers, the excess, and the deadline for claims" },
    ],
  },
  {
    id: "w3",
    label: "3 weeks before",
    offsetDays: -21,
    tasks: [
      { id: "pantry", text: "Stop bulk-buying and start eating down the freezer and pantry" },
      { id: "service", text: "Book appliance dismantling — AC units, geysers, wall-mounted TVs, modular furniture" },
      { id: "parking", text: "Arrange a parking permit or reserved space for the truck at both ends" },
      { id: "childcare", text: "Arrange childcare for moving day — packing is not safe around small children", when: "hasKids" },
      { id: "petday", text: "Arrange pet boarding or a quiet room for moving day", when: "hasPets" },
    ],
  },
  {
    id: "w2",
    label: "2 weeks before",
    offsetDays: -14,
    tasks: [
      { id: "confirm", text: "Reconfirm the booking in writing and get the crew's arrival window" },
      { id: "photos", text: "Photograph valuables and electronics from several angles, with serial numbers" },
      { id: "backup", text: "Back up every computer and phone, and keep the backup with you, not in the truck" },
      { id: "labels", text: "Label cartons by destination room and mark the fragile ones on all four sides" },
      { id: "valuables", text: "Set aside jewellery, documents and medicines to travel with you, never on the truck" },
      { id: "gas", text: "Book the LPG connection transfer or surrender and collect the subscription voucher" },
    ],
  },
  {
    id: "w1",
    label: "Final week",
    offsetDays: -7,
    tasks: [
      { id: "essentials", text: "Pack a first-night box: bedding, towels, chargers, toiletries, tools, tea and snacks" },
      { id: "defrost", text: "Empty and defrost the fridge and freezer at least 24 hours before the move, and let them drain" },
      { id: "cash", text: "Draw cash for handling charges, tips and anything the crew asks for on the day" },
      { id: "charge", text: "Charge phones, power banks and torches — the power may already be off at one end" },
      { id: "cleaning", text: "Book or schedule the move-out clean" },
      { id: "keys", text: "Count the keys, fobs and remotes you must hand back", when: "renting" },
    ],
  },
  {
    id: "day",
    label: "Moving day",
    offsetDays: 0,
    tasks: [
      { id: "readings", text: "Photograph the electricity, gas and water meters at the old address with the date visible" },
      { id: "inventoryCheck", text: "Tick every carton and item off the inventory sheet as it goes on the truck" },
      { id: "walk", text: "Walk every empty room, cupboard, balcony and loft before you lock up" },
      { id: "handover", text: "Hand over keys and get a signed receipt, or a checkout report if you rented", },
      { id: "arriveReadings", text: "Photograph the meters at the new address before you unload" },
      { id: "damage", text: "Note any damage on the delivery sheet before you sign it — signing clean makes a claim hard" },
    ],
  },
  {
    id: "d3",
    label: "First 3 days after",
    offsetDays: 3,
    tasks: [
      { id: "unpack", text: "Unpack the kitchen, bedrooms and bathroom first; leave decor for later" },
      { id: "alarms", text: "Test every smoke alarm and replace the batteries — you do not know their age" },
      { id: "meterFile", text: "Send the opening meter readings to each new supplier" },
      { id: "claim", text: "Report any transit damage in writing before the insurer's claim window closes" },
      { id: "locks", text: "Change or rekey the locks at the new place" },
    ],
  },
  {
    id: "d14",
    label: "Within 2 weeks after",
    offsetDays: 14,
    tasks: [
      { id: "idAddress", text: "Update the address on your ID, driving licence and vehicle registration" },
      { id: "localReg", text: "Register with a local doctor, and with the residents' association or local authority" },
      { id: "deposit", text: "Chase the deposit refund and the final bills from the old address", when: "renting" },
      { id: "recycle", text: "Return, resell or recycle the cartons and packing material" },
      { id: "finalBills", text: "Check the closing bill from each old supplier against your moving-day meter photos" },
    ],
  },
];

/** Parse a YYYY-MM-DD string to a UTC midnight timestamp. Returns NaN if invalid. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return NaN;
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  // Rejects impossible dates such as 2026-02-30, which Date.UTC rolls over.
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return NaN;
  }
  return ms;
}

/** Format a UTC timestamp back to YYYY-MM-DD. */
export function toIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Shift a YYYY-MM-DD date by a whole number of days. Returns "" if the input is not a date. */
export function shiftIsoDate(iso, days) {
  const ms = parseIsoDate(iso);
  if (Number.isNaN(ms) || !Number.isFinite(days)) return "";
  return toIsoDate(ms + Math.round(days) * MS_PER_DAY);
}

/** Longest lead time the schedule covers, in days. */
export const MAX_LEAD_DAYS = 730;

/** Default planning lead time: the full eight-week countdown. */
export const DEFAULT_LEAD_DAYS = 56;

/**
 * Build the dated checklist.
 *
 * @param {object} input
 * @param {string} input.moveDate  Moving day as YYYY-MM-DD.
 * @param {string} input.today     Reference date as YYYY-MM-DD (pass it in; the maths stays pure).
 * @param {object} input.options   Booleans keyed by OPTION_KEYS.
 * @param {string[]} input.done    Ids of tasks already ticked, as "<phaseId>:<taskId>".
 * @returns {object} phases with dates and status, or { error }.
 */
export function generateChecklist({ moveDate, today, options = {}, done = [] } = {}) {
  const moveMs = parseIsoDate(moveDate);
  if (Number.isNaN(moveMs)) return { error: "Enter a moving date as a real calendar date." };

  const todayMs = parseIsoDate(today);
  if (Number.isNaN(todayMs)) return { error: "Enter today's date as a real calendar date." };

  const daysUntilMove = Math.round((moveMs - todayMs) / MS_PER_DAY);
  if (daysUntilMove > MAX_LEAD_DAYS) {
    return { error: "That moving date is more than two years away — come back when it is firmer." };
  }
  if (daysUntilMove < -MAX_LEAD_DAYS) {
    return { error: "That moving date is more than two years in the past." };
  }

  const doneSet = new Set(Array.isArray(done) ? done.filter((id) => typeof id === "string") : []);

  const phases = PHASES.map((phase) => {
    const dueMs = moveMs + phase.offsetDays * MS_PER_DAY;
    const daysFromToday = Math.round((dueMs - todayMs) / MS_PER_DAY);

    let status;
    if (daysFromToday < 0) status = "overdue";
    else if (daysFromToday < 7) status = "active";
    else status = "upcoming";

    const tasks = phase.tasks
      .filter((task) => {
        if (task.when && !options[task.when]) return false;
        if (task.unless && options[task.unless]) return false;
        return true;
      })
      .map((task) => ({
        id: task.id,
        key: `${phase.id}:${task.id}`,
        text: task.text,
        done: doneSet.has(`${phase.id}:${task.id}`),
      }));

    return {
      id: phase.id,
      label: phase.label,
      offsetDays: phase.offsetDays,
      dueDate: toIsoDate(dueMs),
      daysFromToday,
      status,
      tasks,
      doneCount: tasks.filter((task) => task.done).length,
    };
  }).filter((phase) => phase.tasks.length > 0);

  const totalTasks = phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const doneCount = phases.reduce((sum, phase) => sum + phase.doneCount, 0);
  const overdueOpen = phases
    .filter((phase) => phase.status === "overdue")
    .reduce((sum, phase) => sum + (phase.tasks.length - phase.doneCount), 0);
  const activePhase = phases.find((phase) => phase.status === "active") ?? null;

  return {
    phases,
    totalTasks,
    doneCount,
    // totalTasks is always > 0 because the unconditional tasks can never all be filtered out.
    percentDone: Math.round((doneCount / totalTasks) * 100),
    overdueOpen,
    daysUntilMove,
    moveDate: toIsoDate(moveMs),
    activePhaseId: activePhase ? activePhase.id : null,
  };
}
