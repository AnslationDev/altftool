/**
 * Splitting flat rent between flatmates.
 *
 * There is no statute for this, so the method is stated openly rather than hidden.
 *
 *  1. Rent is divided into a COMMON pool and a PRIVATE pool. The common pool pays for the kitchen,
 *     living room, hallway and shared bathroom, and is charged equally per person, because those
 *     spaces are used per head and not per bedroom.
 *  2. The private pool is allocated across bedrooms in proportion to a weight:
 *         weight = floor area x (1 + sum of amenity adjustments)
 *     A bigger room with an attached bathroom therefore carries a larger share than a small
 *     interior room, which is what most disputes are actually about.
 *  3. A room shared by two people has its private cost divided between them, so double occupancy
 *     is cheaper per head, matching how flatshares are normally priced.
 *  4. Shared bills are split equally per person and added on top.
 *  5. Final shares are rounded to whole rupees by the largest-remainder method, so the individual
 *     amounts add up to the total exactly rather than leaving a rupee unaccounted for.
 *
 * The amenity percentages below are conventions, not law. They are exported so the interface can
 * show them and so anyone can argue about the numbers with the numbers in front of them.
 */

/** Share of rent treated as common space by default. */
export const DEFAULT_COMMON_SHARE_PERCENT = 25;

/** Weight adjustments applied to a room's floor area. */
export const AMENITY_ADJUSTMENTS = {
  attachedBathroom: { label: "Attached bathroom", adjustment: 0.12, percent: 12 },
  balcony: { label: "Private balcony", adjustment: 0.06, percent: 6 },
  airConditioning: { label: "Air conditioning", adjustment: 0.1, percent: 10 },
  poorLightOrNoise: { label: "No window, or faces noise", adjustment: -0.08, percent: -8 },
};

/** A room's multiplier never falls below this, so a room can never come out free. */
export const MIN_ROOM_MULTIPLIER = 0.5;

export const MAX_ROOMS = 8;
export const MAX_OCCUPANTS_PER_ROOM = 6;

function isNum(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Round a list of exact shares to whole units so that the total is preserved.
 * Uses the largest-remainder (Hare) method: everyone gets the floor of their share, then the
 * leftover units go to the largest fractional parts first.
 */
export function largestRemainderRound(values, target) {
  const floors = values.map((value) => Math.floor(value));
  const floorSum = floors.reduce((sum, value) => sum + value, 0);
  let leftover = Math.round(target - floorSum);
  if (leftover < 0) leftover = 0;
  if (leftover > values.length) leftover = values.length;

  const order = values
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  const result = floors.slice();
  for (let i = 0; i < leftover; i += 1) {
    result[order[i].index] += 1;
  }
  return result;
}

/** Weight multiplier for a room from its amenity flags. */
export function amenityMultiplier(amenities = {}) {
  let multiplier = 1;
  for (const [key, entry] of Object.entries(AMENITY_ADJUSTMENTS)) {
    if (amenities[key]) multiplier += entry.adjustment;
  }
  return Math.max(MIN_ROOM_MULTIPLIER, multiplier);
}

/**
 * Split rent and shared bills between flatmates.
 *
 * @param {object} input
 * @param {number} input.totalRent
 * @param {number} input.sharedBills          Utilities, internet, help — split equally per person.
 * @param {number} input.commonSharePercent   Share of rent attributed to common areas.
 * @param {Array} input.rooms                 [{ name, areaSqft, occupants, amenities }]
 */
export function splitSharedRent({
  totalRent,
  sharedBills = 0,
  commonSharePercent = DEFAULT_COMMON_SHARE_PERCENT,
  rooms = [],
}) {
  if (!isNum(totalRent) || totalRent <= 0) {
    return { error: "Total rent must be greater than zero." };
  }
  if (!isNum(sharedBills) || sharedBills < 0) {
    return { error: "Shared bills cannot be negative." };
  }
  if (!isNum(commonSharePercent) || commonSharePercent < 0 || commonSharePercent > 100) {
    return { error: "The common-area share must be between 0% and 100%." };
  }
  if (!Array.isArray(rooms) || rooms.length === 0) {
    return { error: "Add at least one room." };
  }
  if (rooms.length > MAX_ROOMS) {
    return { error: `This splits up to ${MAX_ROOMS} rooms.` };
  }

  for (const room of rooms) {
    if (!isNum(room?.areaSqft) || room.areaSqft <= 0) {
      return { error: "Every room needs a floor area greater than zero." };
    }
    if (
      !isNum(room?.occupants) ||
      !Number.isInteger(room.occupants) ||
      room.occupants < 1 ||
      room.occupants > MAX_OCCUPANTS_PER_ROOM
    ) {
      return {
        error: `Every room needs between 1 and ${MAX_OCCUPANTS_PER_ROOM} occupants.`,
      };
    }
  }

  const totalPeople = rooms.reduce((sum, room) => sum + room.occupants, 0);
  const commonPool = (totalRent * commonSharePercent) / 100;
  const privatePool = totalRent - commonPool;

  const weighted = rooms.map((room) => {
    const multiplier = amenityMultiplier(room.amenities);
    return { room, multiplier, weight: room.areaSqft * multiplier };
  });

  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  if (!(totalWeight > 0)) {
    return { error: "Room areas add up to zero, so there is nothing to allocate." };
  }

  const commonPerPerson = commonPool / totalPeople;
  const billsPerPerson = sharedBills / totalPeople;
  const grandTotal = totalRent + sharedBills;
  const equalSplit = grandTotal / totalPeople;

  // Exact share for every individual, in the order rooms were given.
  const exactPeople = [];
  const roomDetail = weighted.map((entry) => {
    const privateShare = (privatePool * entry.weight) / totalWeight;
    const perOccupantExact = privateShare / entry.room.occupants + commonPerPerson + billsPerPerson;
    for (let i = 0; i < entry.room.occupants; i += 1) exactPeople.push(perOccupantExact);
    return {
      name: entry.room.name || "Room",
      areaSqft: entry.room.areaSqft,
      occupants: entry.room.occupants,
      multiplier: entry.multiplier,
      weight: entry.weight,
      weightShare: (entry.weight / totalWeight) * 100,
      privateShare,
      perOccupantExact,
    };
  });

  const roundedPeople = largestRemainderRound(exactPeople, Math.round(grandTotal));

  // Fold the rounded per-person amounts back into their rooms.
  let cursor = 0;
  const roomsOut = roomDetail.map((detail) => {
    const shares = roundedPeople.slice(cursor, cursor + detail.occupants);
    cursor += detail.occupants;
    const roomTotal = shares.reduce((sum, value) => sum + value, 0);
    return {
      ...detail,
      perOccupant: shares[0],
      occupantShares: shares,
      sharesAreEqual: shares.every((share) => share === shares[0]),
      roomTotal,
      differenceFromEqual: shares[0] - equalSplit,
      differenceFromEqualAbs: Math.abs(shares[0] - equalSplit),
    };
  });

  const allShares = roundedPeople;
  const highest = Math.max(...allShares);
  const lowest = Math.min(...allShares);

  return {
    rooms: roomsOut,
    totalRent,
    sharedBills,
    grandTotal,
    allocated: allShares.reduce((sum, value) => sum + value, 0),
    totalPeople,
    commonPool,
    privatePool,
    commonPerPerson,
    billsPerPerson,
    equalSplit,
    highestShare: highest,
    lowestShare: lowest,
    spread: highest - lowest,
    commonSharePercent,
  };
}
