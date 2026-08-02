/**
 * Event Planner — turn a guest list into floor space, tables, staff, catering
 * quantities and a budget.
 *
 * Everything here is arithmetic on published event-industry allowances rather
 * than guesswork, and every allowance is named so you can override it:
 *
 *   Space per guest (standard venue capacity allowances, square feet)
 *     banquet rounds (seated, served)  12
 *     theatre / auditorium rows         8
 *     classroom with tables            17
 *     standing reception                6
 *
 *   Table seating (round banquet tables)
 *     48 in (4 ft) round  ->  6 covers
 *     60 in (5 ft) round  ->  8 covers
 *     72 in (6 ft) round  -> 10 covers
 *
 *   Catering staff ratios
 *     plated service   1 server per 10 guests
 *     buffet service   1 server per 25 guests
 *     bar              1 bartender per 75 guests
 *
 *   Drinks rule of thumb
 *     1 drink per guest in the first hour, 1 per guest per hour after.
 *
 *   Canape / appetiser counts
 *     reception before a meal   6 pieces per guest
 *     reception is the meal    12 pieces per guest
 *
 * Attendance uses the two-stage shrink every planner applies:
 *   expected = invited x acceptRate x (1 - noShowRate)
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Square feet of floor area per guest, by room layout. */
export const LAYOUTS = {
  banquet: { label: "Banquet rounds (seated meal)", sqFtPerGuest: 12, seated: true },
  theatre: { label: "Theatre rows", sqFtPerGuest: 8, seated: true },
  classroom: { label: "Classroom with tables", sqFtPerGuest: 17, seated: true },
  reception: { label: "Standing reception", sqFtPerGuest: 6, seated: false },
};

/** Covers per round banquet table, by table diameter. */
export const TABLE_SIZES = {
  48: { label: '48" (4 ft) round', seats: 6 },
  60: { label: '60" (5 ft) round', seats: 8 },
  72: { label: '72" (6 ft) round', seats: 10 },
};

/** Guests per serving staff member, by service style. */
export const SERVICE_STYLES = {
  plated: { label: "Plated / served", guestsPerServer: 10, appetisersPerGuest: 6 },
  buffet: { label: "Buffet", guestsPerServer: 25, appetisersPerGuest: 6 },
  reception: { label: "Canapes only", guestsPerServer: 25, appetisersPerGuest: 12 },
};

/** One bartender covers this many guests. */
export const GUESTS_PER_BARTENDER = 75;

/** Drinks per guest in the opening hour, then per hour after. */
export const DRINKS_FIRST_HOUR = 1;
export const DRINKS_PER_LATER_HOUR = 1;

/** Standard planning contingency on top of quoted costs, as a percentage. */
export const DEFAULT_CONTINGENCY_PERCENT = 10;

/** Sanity limits. */
export const MAX_GUESTS = 100000;
export const MAX_HOURS = 24;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round = (v, p = 2) => {
  const f = 10 ** p;
  return Math.round((v + Number.EPSILON) * f) / f;
};

/**
 * Expected head count from an invite list.
 *
 * @param {{ invited: number, acceptPercent: number, noShowPercent: number }} input
 * @returns {{ expected: number, accepted: number, noShows: number } | { error: string }}
 */
export function expectedAttendance({ invited, acceptPercent, noShowPercent } = {}) {
  if (!isNum(invited)) return { error: "Enter how many people you are inviting." };
  if (invited <= 0) return { error: "The invite list must have at least one person on it." };
  if (invited > MAX_GUESTS) return { error: `This planner handles up to ${MAX_GUESTS} invitees.` };
  if (!isNum(acceptPercent) || acceptPercent < 0 || acceptPercent > 100) {
    return { error: "The acceptance rate must be between 0% and 100%." };
  }
  if (!isNum(noShowPercent) || noShowPercent < 0 || noShowPercent > 100) {
    return { error: "The no-show rate must be between 0% and 100%." };
  }
  const accepted = Math.round(invited * (acceptPercent / 100));
  const noShows = Math.round(accepted * (noShowPercent / 100));
  return {
    expected: accepted - noShows,
    accepted,
    noShows,
  };
}

/**
 * Floor space, tables and staff for a given head count.
 *
 * @param {object} input
 * @returns {object} logistics or { error }
 */
export function planLogistics({ guests, layout, tableSize, serviceStyle, hours, servingBar } = {}) {
  if (!isNum(guests) || guests <= 0) return { error: "Head count must be at least one guest." };
  if (guests > MAX_GUESTS) return { error: `This planner handles up to ${MAX_GUESTS} guests.` };
  const layoutMeta = LAYOUTS[layout];
  if (!layoutMeta) return { error: "Choose a room layout." };
  const tableMeta = TABLE_SIZES[tableSize];
  if (layoutMeta.seated && layout === "banquet" && !tableMeta) {
    return { error: "Choose a banquet table size." };
  }
  const serviceMeta = SERVICE_STYLES[serviceStyle];
  if (!serviceMeta) return { error: "Choose a service style." };
  if (!isNum(hours) || hours <= 0) return { error: "The event must run for more than zero hours." };
  if (hours > MAX_HOURS) return { error: `Keep the event under ${MAX_HOURS} hours.` };

  const floorSqFt = guests * layoutMeta.sqFtPerGuest;
  const tables = layout === "banquet" ? Math.ceil(guests / tableMeta.seats) : 0;
  const emptySeats = layout === "banquet" ? tables * tableMeta.seats - guests : 0;
  const servers = Math.ceil(guests / serviceMeta.guestsPerServer);
  const bartenders = servingBar ? Math.ceil(guests / GUESTS_PER_BARTENDER) : 0;
  const drinks = servingBar
    ? Math.ceil(guests * (DRINKS_FIRST_HOUR + Math.max(0, hours - 1) * DRINKS_PER_LATER_HOUR))
    : 0;
  const appetisers = Math.ceil(guests * serviceMeta.appetisersPerGuest);

  return {
    guests,
    layoutLabel: layoutMeta.label,
    sqFtPerGuest: layoutMeta.sqFtPerGuest,
    floorSqFt: round(floorSqFt, 0),
    floorSqM: round(floorSqFt * 0.09290304, 1), // 1 sq ft = 0.09290304 sq m (exact)
    tables,
    seatsPerTable: tableMeta ? tableMeta.seats : 0,
    emptySeats,
    servers,
    guestsPerServer: serviceMeta.guestsPerServer,
    bartenders,
    drinks,
    appetisers,
    hours,
  };
}

/**
 * Cost the event out and compare it with the budget.
 *
 * @param {object} input
 * @returns {object} budget or { error }
 */
export function planBudget({
  guests,
  perHeadCatering,
  venueCost,
  staffCount,
  staffRatePerHour,
  hours,
  otherCosts = 0,
  contingencyPercent = DEFAULT_CONTINGENCY_PERCENT,
  budget = 0,
} = {}) {
  if (!isNum(guests) || guests <= 0) return { error: "Head count must be at least one guest." };
  const numbers = { perHeadCatering, venueCost, staffCount, staffRatePerHour, hours, otherCosts, contingencyPercent };
  for (const [key, value] of Object.entries(numbers)) {
    if (!isNum(value)) return { error: `Enter ${key.replace(/([A-Z])/g, " $1").toLowerCase()} as a number.` };
    if (value < 0) return { error: "Costs, rates and hours cannot be negative." };
  }
  if (contingencyPercent > 100) return { error: "A contingency above 100% is not a plan." };
  if (hours > MAX_HOURS) return { error: `Keep the event under ${MAX_HOURS} hours.` };

  const catering = guests * perHeadCatering;
  const staff = staffCount * staffRatePerHour * hours;
  const subtotal = catering + venueCost + staff + otherCosts;
  const contingency = subtotal * (contingencyPercent / 100);
  const total = subtotal + contingency;

  return {
    catering: round(catering, 2),
    venue: round(venueCost, 2),
    staff: round(staff, 2),
    other: round(otherCosts, 2),
    subtotal: round(subtotal, 2),
    contingency: round(contingency, 2),
    total: round(total, 2),
    perHead: round(total / guests, 2),
    budget: round(budget, 2),
    variance: round(budget - total, 2),
    overBudget: budget > 0 && total > budget,
  };
}

/**
 * Whole plan in one call: attendance, logistics and budget.
 *
 * @param {object} input
 * @returns {object} full plan or { error }
 */
export function planEvent(input = {}) {
  const attendance = expectedAttendance(input);
  if (attendance.error) return { error: attendance.error };
  if (attendance.expected <= 0) {
    return { error: "No one is expected to turn up — raise the acceptance rate or the invite list." };
  }

  const logistics = planLogistics({ ...input, guests: attendance.expected });
  if (logistics.error) return { error: logistics.error };

  const budget = planBudget({
    ...input,
    guests: attendance.expected,
    staffCount: logistics.servers + logistics.bartenders,
  });
  if (budget.error) return { error: budget.error };

  const venueSqFt = isNum(input.venueSqFt) ? input.venueSqFt : 0;
  const fitsVenue = venueSqFt > 0 ? venueSqFt >= logistics.floorSqFt : null;
  const venueShortfall = venueSqFt > 0 ? round(Math.max(0, logistics.floorSqFt - venueSqFt), 0) : 0;
  const venueCapacity = venueSqFt > 0 ? Math.floor(venueSqFt / logistics.sqFtPerGuest) : 0;

  return { attendance, logistics, budget, fitsVenue, venueShortfall, venueCapacity };
}
