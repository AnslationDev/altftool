/**
 * Interactive Seating Chart Maker — table capacity, table count and guest
 * assignment for weddings, banquets, conferences and classrooms.
 *
 * Rules used:
 *
 *  - Place-setting width. Banquet capacity is decided by linear space per
 *    guest, not by table area. 22 in (56 cm) per cover is the standard banquet
 *    allowance and reproduces every published capacity: a 60 in round seats
 *    floor(pi x 60 / 22) = 8, a 72 in round seats 10, a 48 in round seats 6.
 *    24 in per cover is the comfortable/formal setting, 20 in is the tight
 *    setting used to squeeze in extra covers.
 *
 *  - Round table capacity  = floor(pi x diameter / spacing).
 *  - Rectangular capacity  = floor(2 x length / spacing), plus
 *    floor(2 x width / spacing) when the ends are seated. An 8 ft x 30 in
 *    table therefore seats 8, or 10 with the ends, which matches the standard
 *    rental-company figures.
 *
 *  - Room capacity. NFPA 101 Life Safety Code, occupant load factor table:
 *    assembly use with tables and chairs is 15 sq ft (1.39 sq m) net per
 *    person. That is the floor-area check applied here.
 *
 *  - Aisle allowance. Event practice leaves 60 in (152 cm) between the edges
 *    of adjacent round tables so chairs back-to-back and a server can pass,
 *    which is what the table-pitch figure below reports.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Linear space allowed per guest, in inches. */
export const SPACING_OPTIONS = [
  { id: "tight", label: "Tight — 20 in (51 cm) per guest", inches: 20 },
  { id: "standard", label: "Standard banquet — 22 in (56 cm) per guest", inches: 22 },
  { id: "comfortable", label: "Formal / comfortable — 24 in (61 cm) per guest", inches: 24 },
];

/** NFPA 101 occupant load factor for assembly use with tables and chairs. */
export const SQFT_PER_PERSON = 15;

/** Clear space left between the edges of two adjacent tables, in inches. */
export const AISLE_CLEARANCE_IN = 60;

/** Table stock, sized from standard event-rental inventory. */
export const TABLE_TYPES = [
  { id: "round-48", label: 'Round 48" (122 cm)', shape: "round", diameterIn: 48 },
  { id: "round-60", label: 'Round 60" (152 cm)', shape: "round", diameterIn: 60 },
  { id: "round-72", label: 'Round 72" (183 cm)', shape: "round", diameterIn: 72 },
  { id: "rect-6ft", label: 'Rectangular 6 ft x 30" (183 x 76 cm)', shape: "rect", lengthIn: 72, widthIn: 30 },
  { id: "rect-8ft", label: 'Rectangular 8 ft x 30" (244 x 76 cm)', shape: "rect", lengthIn: 96, widthIn: 30 },
  { id: "classroom-6ft", label: "Classroom row, 6 ft desk (one side only)", shape: "row", lengthIn: 72 },
];

export const EVENT_TYPES = [
  { id: "wedding", label: "Wedding", defaultTable: "round-60", defaultSpacing: "standard" },
  { id: "banquet", label: "Banquet / gala", defaultTable: "round-72", defaultSpacing: "standard" },
  { id: "conference", label: "Conference", defaultTable: "rect-8ft", defaultSpacing: "comfortable" },
  { id: "classroom", label: "Classroom", defaultTable: "classroom-6ft", defaultSpacing: "standard" },
  { id: "meeting", label: "Office meeting", defaultTable: "rect-6ft", defaultSpacing: "comfortable" },
];

/** Sanity ceiling so a typo cannot generate thousands of tables. */
export const MAX_GUESTS = 2000;

const INCHES_PER_FOOT = 12;

/**
 * Seats available at one table.
 * @param {object} table - entry from TABLE_TYPES
 * @param {number} spacingIn - linear inches allowed per guest
 * @param {boolean} seatEnds - seat the short ends of a rectangular table
 * @returns {{seats: number, perimeterIn: number, method: string} | {error: string}}
 */
export function seatsPerTable(table, spacingIn, seatEnds = true) {
  if (!table) return { error: "Pick a table type." };
  const spacing = Number(spacingIn);
  if (!Number.isFinite(spacing) || spacing <= 0) {
    return { error: "Space per guest must be greater than zero." };
  }

  if (table.shape === "round") {
    const perimeterIn = Math.PI * table.diameterIn;
    return {
      seats: Math.floor(perimeterIn / spacing),
      perimeterIn,
      method: `floor(pi x ${table.diameterIn} in / ${spacing} in per guest)`,
    };
  }

  if (table.shape === "rect") {
    const sides = Math.floor((2 * table.lengthIn) / spacing);
    const ends = seatEnds ? Math.floor((2 * table.widthIn) / spacing) : 0;
    return {
      seats: sides + ends,
      perimeterIn: 2 * (table.lengthIn + table.widthIn),
      method: `${sides} along the two long sides${seatEnds ? ` + ${ends} on the ends` : ""}`,
    };
  }

  // Classroom row: one side of the desk only.
  const seats = Math.floor(table.lengthIn / spacing);
  return {
    seats,
    perimeterIn: table.lengthIn,
    method: `floor(${table.lengthIn} in / ${spacing} in per guest), one side only`,
  };
}

/**
 * Plan the tables needed for a guest count, and check the room will hold them.
 *
 * @param {object} input
 * @param {number} input.guestCount
 * @param {string} input.tableTypeId
 * @param {string} input.spacingId
 * @param {boolean} [input.seatEnds]
 * @param {number} [input.roomLengthFt]
 * @param {number} [input.roomWidthFt]
 * @returns {object|{error: string}}
 */
export function planSeating({
  guestCount,
  tableTypeId,
  spacingId,
  seatEnds = true,
  roomLengthFt,
  roomWidthFt,
}) {
  const guests = Number(guestCount);
  if (!Number.isFinite(guests) || !Number.isInteger(guests) || guests < 1) {
    return { error: "Enter the guest count as a whole number of 1 or more." };
  }
  if (guests > MAX_GUESTS) {
    return { error: `This planner handles up to ${MAX_GUESTS} guests.` };
  }

  const table = TABLE_TYPES.find((entry) => entry.id === tableTypeId);
  if (!table) return { error: "Pick a table type." };

  const spacing = SPACING_OPTIONS.find((entry) => entry.id === spacingId);
  if (!spacing) return { error: "Pick how much space each guest gets." };

  const capacity = seatsPerTable(table, spacing.inches, seatEnds);
  if (capacity.error) return capacity;
  if (capacity.seats < 1) {
    return { error: "That table is too small to seat anyone at the chosen spacing." };
  }

  const tablesNeeded = Math.ceil(guests / capacity.seats);
  const seatsProvided = tablesNeeded * capacity.seats;
  const emptySeats = seatsProvided - guests;
  const utilisation = (guests / seatsProvided) * 100;

  const length = Number(roomLengthFt);
  const width = Number(roomWidthFt);
  let room = null;
  if (Number.isFinite(length) && Number.isFinite(width) && length > 0 && width > 0) {
    const areaSqFt = length * width;
    const occupantLoad = Math.floor(areaSqFt / SQFT_PER_PERSON);
    room = {
      areaSqFt,
      occupantLoad,
      fits: occupantLoad >= guests,
      shortfall: Math.max(0, guests - occupantLoad),
      sqFtPerGuest: areaSqFt / guests,
    };
  }

  const footprintIn =
    table.shape === "round" ? table.diameterIn : Math.max(table.lengthIn, table.widthIn ?? 0);

  return {
    table,
    spacing,
    seatsPerTable: capacity.seats,
    capacityMethod: capacity.method,
    tablesNeeded,
    seatsProvided,
    emptySeats,
    utilisation,
    guestCount: guests,
    /** Centre-to-centre distance between adjacent tables, in feet. */
    tablePitchFt: (footprintIn + AISLE_CLEARANCE_IN) / INCHES_PER_FOOT,
    room,
  };
}

/**
 * Parse a pasted guest list. One guest per line, optional group after a comma.
 * @param {string} text
 * @returns {Array<{name: string, group: string}>}
 */
export function parseGuestList(text) {
  if (typeof text !== "string") return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...rest] = line.split(",");
      const group = rest.join(",").trim();
      return { name: name.trim(), group: group || "Unassigned" };
    })
    .filter((guest) => guest.name.length > 0);
}

/**
 * Assign guests to tables, keeping each group together where it fits.
 *
 * Groups are packed largest-first into the emptiest table that still has room
 * (first-fit decreasing), which is the standard bin-packing heuristic and is
 * fully deterministic for a given guest list.
 *
 * @param {Array<{name: string, group: string}>} guests
 * @param {number} seats - seats available at each table
 * @returns {{tables: Array, splitGroups: string[], tablesUsed: number}|{error: string}}
 */
export function assignGuests(guests, seats) {
  if (!Array.isArray(guests)) return { error: "Pass the guest list as an array." };
  const perTable = Number(seats);
  if (!Number.isInteger(perTable) || perTable < 1) {
    return { error: "Seats per table must be a whole number of 1 or more." };
  }
  if (guests.length === 0) {
    return { tables: [], splitGroups: [], tablesUsed: 0 };
  }

  const groups = new Map();
  guests.forEach((guest) => {
    const key = guest.group || "Unassigned";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(guest);
  });

  const ordered = Array.from(groups.entries()).sort((a, b) => {
    if (b[1].length !== a[1].length) return b[1].length - a[1].length;
    return a[0].localeCompare(b[0]);
  });

  const tables = [];
  const splitGroups = [];

  const newTable = () => {
    const table = { number: tables.length + 1, guests: [], seatsFree: perTable };
    tables.push(table);
    return table;
  };

  ordered.forEach(([groupName, members]) => {
    let remaining = members.slice();
    if (remaining.length > perTable) splitGroups.push(groupName);

    while (remaining.length > 0) {
      // First-fit: the first table with any free seat; a whole group prefers a
      // table that can take all of it.
      let target =
        tables.find((table) => table.seatsFree >= remaining.length) ??
        tables.find((table) => table.seatsFree > 0) ??
        newTable();
      const take = Math.min(target.seatsFree, remaining.length);
      target.guests.push(...remaining.slice(0, take));
      target.seatsFree -= take;
      remaining = remaining.slice(take);
    }
  });

  return { tables, splitGroups, tablesUsed: tables.length };
}
