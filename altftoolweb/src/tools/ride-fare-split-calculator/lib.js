/**
 * Fair split of one shared cab fare between passengers who get out at
 * different points along the route.
 *
 * The fare is treated as two parts:
 *
 *  1. A fixed part — base fare, booking fee, waiting charge, tolls and parking.
 *     Nobody's drop point changes it, so it is divided equally between everyone
 *     who took the ride.
 *
 *  2. A distance part — the rest of the fare, spread over the kilometres driven
 *     at a constant rate per km (distance rate = distance part / farthest drop).
 *     The route is cut at every drop point, and each segment's cost is shared
 *     only between the passengers still in the car for that segment.
 *
 * That segment method is what makes the split fair: the first person out pays
 * only a third of the first few kilometres, while the last person out carries
 * the final stretch alone. A plain "share of total distance" split overcharges
 * the early drops, and an equal split overcharges them badly; both are returned
 * so the difference is visible.
 */

/** Largest-remainder rounding so the rounded shares still add up to the fare. */
function roundSharesToWholeRupees(exactShares, targetTotal) {
  const floors = exactShares.map((value) => Math.floor(value));
  const sumFloors = floors.reduce((sum, value) => sum + value, 0);
  let remaining = Math.round(targetTotal) - sumFloors;

  const order = exactShares
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac);

  const rounded = floors.slice();
  let cursor = 0;
  while (remaining > 0 && order.length > 0) {
    rounded[order[cursor % order.length].index] += 1;
    cursor += 1;
    remaining -= 1;
  }
  while (remaining < 0 && order.length > 0) {
    const target = order[order.length - 1 - (cursor % order.length)].index;
    if (rounded[target] > 0) rounded[target] -= 1;
    cursor += 1;
    remaining += 1;
  }
  return rounded;
}

const MAX_PASSENGERS = 12;
const MAX_DISTANCE_KM = 5000;
const MAX_FARE = 1000000;

/**
 * @param {{totalFare:number, fixedComponent:number, passengers:{name:string, dropKm:number}[]}} input
 * @returns {{error:string}|object}
 */
export function splitRideFare({ totalFare, fixedComponent = 0, passengers = [] }) {
  if (typeof totalFare !== "number" || !Number.isFinite(totalFare)) {
    return { error: "Enter a valid total fare." };
  }
  if (typeof fixedComponent !== "number" || !Number.isFinite(fixedComponent)) {
    return { error: "Enter a valid fixed charge, or 0 if there is none." };
  }
  if (totalFare <= 0) return { error: "Total fare must be greater than zero." };
  if (totalFare > MAX_FARE) return { error: "Total fare is outside the supported range." };
  if (fixedComponent < 0) return { error: "Fixed charges cannot be negative." };
  if (fixedComponent > totalFare) {
    return { error: "Fixed charges cannot be more than the total fare." };
  }
  if (!Array.isArray(passengers) || passengers.length === 0) {
    return { error: "Add at least one passenger." };
  }
  if (passengers.length > MAX_PASSENGERS) {
    return { error: `This calculator handles up to ${MAX_PASSENGERS} passengers.` };
  }
  for (const passenger of passengers) {
    const km = passenger?.dropKm;
    if (typeof km !== "number" || !Number.isFinite(km)) {
      return { error: "Every passenger needs a valid drop distance in kilometres." };
    }
    if (km <= 0) return { error: "Each drop distance must be greater than zero kilometres." };
    if (km > MAX_DISTANCE_KM) return { error: "Drop distances must be under 5,000 km." };
  }

  const totalDistance = passengers.reduce((max, p) => Math.max(max, p.dropKm), 0);
  const distanceFare = totalFare - fixedComponent;
  const ratePerKm = distanceFare / totalDistance;
  const fixedShare = fixedComponent / passengers.length;

  // Cut the route at every distinct drop point, nearest first.
  const cutPoints = [...new Set(passengers.map((p) => p.dropKm))].sort((a, b) => a - b);

  const distanceShares = passengers.map(() => 0);
  const segments = [];
  let previous = 0;

  for (const cut of cutPoints) {
    const length = cut - previous;
    const onBoard = passengers
      .map((p, index) => (p.dropKm >= cut ? index : -1))
      .filter((index) => index >= 0);
    const segmentCost = length * ratePerKm;
    const perHead = onBoard.length > 0 ? segmentCost / onBoard.length : 0;
    for (const index of onBoard) distanceShares[index] += perHead;
    segments.push({
      fromKm: previous,
      toKm: cut,
      lengthKm: length,
      riders: onBoard.length,
      cost: segmentCost,
      perRider: perHead,
    });
    previous = cut;
  }

  const exact = distanceShares.map((value) => value + fixedShare);
  const rounded = roundSharesToWholeRupees(exact, totalFare);

  const sumDrops = passengers.reduce((sum, p) => sum + p.dropKm, 0);
  const equalShare = totalFare / passengers.length;

  const shares = passengers.map((passenger, index) => ({
    name: passenger.name || `Passenger ${index + 1}`,
    dropKm: passenger.dropKm,
    distanceShare: distanceShares[index],
    fixedShare,
    exact: exact[index],
    rounded: rounded[index],
    equalShare,
    proportionalShare: sumDrops > 0 ? (totalFare * passenger.dropKm) / sumDrops : 0,
    savingVsEqual: equalShare - exact[index],
  }));

  return {
    totalDistance,
    ratePerKm,
    fixedShare,
    distanceFare,
    segments,
    shares,
    roundedTotal: rounded.reduce((sum, value) => sum + value, 0),
    equalShare,
  };
}
