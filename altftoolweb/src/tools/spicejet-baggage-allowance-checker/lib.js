/**
 * SpiceJet baggage allowance checker.
 *
 * Two allowances behave differently, and that difference is the whole point of
 * the tool:
 *
 *  - HAND BAGGAGE is per passenger and does NOT pool. Each traveller may carry
 *    one bag within the weight and size limit, plus one small personal article.
 *    Two people cannot combine their 7 kg into one 14 kg cabin bag.
 *  - CHECK-IN BAGGAGE on a domestic SpiceJet booking DOES pool across
 *    passengers travelling together on the same PNR, so the group is assessed on
 *    the total weight against the summed free allowance.
 *
 * Published figures used as defaults:
 *  - Hand baggage: 7 kg, one piece, maximum 55 x 35 x 25 cm. This is the
 *    dimension standard set out in BCAS/DGCA cabin baggage guidance and carried
 *    by every Indian scheduled carrier.
 *  - One additional personal article (small handbag or laptop bag) up to 3 kg.
 *  - Free check-in baggage on a standard domestic fare: 15 kg per passenger.
 *    Higher fare families and SpiceMax carry more, so it is an input.
 *  - No single check-in piece may exceed 32 kg — a manual-handling limit applied
 *    across the industry; heavier bags must be split or sent as cargo.
 *  - A check-in piece should not exceed 158 cm in total dimensions
 *    (length + width + height), the standard linear limit for hold baggage.
 *
 * Excess baggage is charged per kilogram at the rate quoted at the airport on
 * the day, which changes with route and season, so the rate is an input rather
 * than a hardcoded figure. Excess weight is rounded up to the next whole
 * kilogram, which is how airport scales are billed.
 */

/** Hand baggage: one piece per passenger, in kilograms. */
export const CABIN_WEIGHT_KG = 7;

/** Hand baggage maximum dimensions in centimetres (length, width, height). */
export const CABIN_DIMS_CM = [55, 35, 25];

/** One additional personal article per passenger, in kilograms. */
export const PERSONAL_ITEM_KG = 3;

/** Free check-in baggage per passenger on a standard domestic fare, kilograms. */
export const DEFAULT_FREE_CHECKIN_KG = 15;

/** No single hold piece may exceed this weight; split it or send it as cargo. */
export const MAX_PIECE_KG = 32;

/** Standard linear limit for one hold piece: length + width + height. */
export const MAX_LINEAR_CM = 158;

/** Fare families and the free check-in allowance each typically carries. */
export const FARE_PRESETS = [
  { id: "saver", label: "SpiceSaver / standard domestic fare", kg: 15 },
  { id: "flexi", label: "SpiceFlex", kg: 20 },
  { id: "max", label: "SpiceMax", kg: 20 },
  { id: "student", label: "Student fare (extra allowance)", kg: 25 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Does a bag fit inside a limit box? Both are compared largest side to largest
 * side, because a bag can always be turned around.
 *
 * @param {number[]} dims  the bag's three dimensions in cm
 * @param {number[]} limit the allowed box in cm
 * @returns {boolean|null} null when a dimension is missing or invalid
 */
export function fitsWithin(dims, limit) {
  if (!Array.isArray(dims) || dims.length !== 3) return null;
  if (dims.some((value) => !isNum(value) || value <= 0)) return null;
  const bag = [...dims].sort((a, b) => b - a);
  const box = [...limit].sort((a, b) => b - a);
  return bag.every((value, index) => value <= box[index]);
}

/** Total of the three sides, the figure airlines call the linear dimension. */
export function linearDimension(dims) {
  if (!Array.isArray(dims) || dims.length !== 3) return null;
  if (dims.some((value) => !isNum(value) || value <= 0)) return null;
  return round2(dims.reduce((sum, value) => sum + value, 0));
}

/**
 * Excess weight rounded the way an airport desk bills it: up to the next kilo.
 */
export function chargeableExcessKg(totalKg, freeKg) {
  if (!isNum(totalKg) || !isNum(freeKg)) return 0;
  const excess = totalKg - freeKg;
  return excess > 0 ? Math.ceil(round2(excess)) : 0;
}

/**
 * Assess a list of bags against the allowance.
 *
 * @param {object} input
 * @param {number} input.passengers            travellers on the same booking
 * @param {Array}  input.bags                  [{ id, kind:"cabin"|"checkin", weightKg, l, w, h }]
 * @param {number} [input.freeCheckinKgPerPax] free hold allowance per passenger
 * @param {number} [input.excessRatePerKg]     the per-kg rate quoted at the airport
 * @param {number} [input.cabinAllowanceKg]    hand baggage limit per passenger
 * @returns {object} { error } or the full assessment
 */
export function checkSpiceJetBaggage({
  passengers = 1,
  bags = [],
  freeCheckinKgPerPax = DEFAULT_FREE_CHECKIN_KG,
  excessRatePerKg = 0,
  cabinAllowanceKg = CABIN_WEIGHT_KG,
} = {}) {
  if (!isNum(passengers) || !Number.isInteger(passengers) || passengers < 1 || passengers > 9) {
    return { error: "Enter a whole number of passengers between 1 and 9 on one booking." };
  }
  if (!isNum(freeCheckinKgPerPax) || freeCheckinKgPerPax < 0 || freeCheckinKgPerPax > 100) {
    return { error: "Free check-in allowance must be between 0 and 100 kg per passenger." };
  }
  if (!isNum(excessRatePerKg) || excessRatePerKg < 0 || excessRatePerKg > 10000) {
    return { error: "The excess baggage rate must be between 0 and 10,000 per kg." };
  }
  if (!isNum(cabinAllowanceKg) || cabinAllowanceKg <= 0 || cabinAllowanceKg > 50) {
    return { error: "Hand baggage allowance must be between 0 and 50 kg per passenger." };
  }
  if (!Array.isArray(bags) || bags.length === 0) {
    return { error: "Add at least one bag to check." };
  }
  if (bags.length > 30) {
    return { error: "Check up to 30 bags at a time." };
  }

  const assessed = bags.map((bag, index) => {
    const kind = bag.kind === "cabin" ? "cabin" : "checkin";
    const weight = Number(bag.weightKg);
    const dims = [Number(bag.l), Number(bag.w), Number(bag.h)];
    const hasDims = dims.every((value) => isNum(value) && value > 0);

    const problems = [];
    let weightOk = true;

    if (!isNum(weight) || weight < 0) {
      problems.push("weight is missing or negative");
      weightOk = false;
    } else if (kind === "cabin" && weight > cabinAllowanceKg) {
      problems.push(`${round2(weight)} kg is over the ${cabinAllowanceKg} kg hand baggage limit`);
      weightOk = false;
    } else if (kind === "checkin" && weight > MAX_PIECE_KG) {
      problems.push(`${round2(weight)} kg is over the ${MAX_PIECE_KG} kg limit for a single piece`);
      weightOk = false;
    }

    const box = kind === "cabin" ? CABIN_DIMS_CM : null;
    const fits = hasDims && box ? fitsWithin(dims, box) : null;
    const linear = hasDims ? linearDimension(dims) : null;

    let sizeOk = true;
    if (kind === "cabin" && hasDims && fits === false) {
      problems.push(
        `${dims.map((value) => round2(value)).join(" × ")} cm will not go in the ${CABIN_DIMS_CM.join(" × ")} cm gauge`,
      );
      sizeOk = false;
    }
    if (kind === "checkin" && hasDims && linear > MAX_LINEAR_CM) {
      problems.push(`${linear} cm total is over the ${MAX_LINEAR_CM} cm linear limit`);
      sizeOk = false;
    }

    return {
      id: bag.id ?? `bag-${index}`,
      kind,
      weightKg: isNum(weight) && weight >= 0 ? round2(weight) : null,
      dims: hasDims ? dims.map((value) => round2(value)) : null,
      linearCm: linear,
      fitsCabinGauge: fits,
      weightOk,
      sizeOk,
      ok: weightOk && sizeOk,
      problems,
    };
  });

  const cabinBags = assessed.filter((bag) => bag.kind === "cabin");
  const checkinBags = assessed.filter((bag) => bag.kind === "checkin");

  const cabinTotalKg = round2(
    cabinBags.reduce((sum, bag) => sum + (bag.weightKg || 0), 0),
  );
  const checkinTotalKg = round2(
    checkinBags.reduce((sum, bag) => sum + (bag.weightKg || 0), 0),
  );

  // Hand baggage is one piece per passenger and never pools.
  const cabinPiecesAllowed = passengers;
  const cabinPiecesOver = Math.max(0, cabinBags.length - cabinPiecesAllowed);

  // Check-in weight pools across everyone on the same PNR.
  const freeCheckinKg = round2(freeCheckinKgPerPax * passengers);
  const excessKg = chargeableExcessKg(checkinTotalKg, freeCheckinKg);
  const excessCost = round2(excessKg * excessRatePerKg);
  const spareKg = round2(Math.max(0, freeCheckinKg - checkinTotalKg));

  const failing = assessed.filter((bag) => !bag.ok);

  const notes = [];
  if (cabinPiecesOver > 0) {
    notes.push(
      `You have ${cabinBags.length} cabin bags for ${passengers} passenger(s). Hand baggage is one piece each and does not pool, so ${cabinPiecesOver} of them will have to go in the hold.`,
    );
  }
  if (excessKg > 0) {
    notes.push(
      `Check-in baggage is ${round2(checkinTotalKg - freeCheckinKg)} kg over the pooled ${freeCheckinKg} kg allowance, billed as ${excessKg} chargeable kg.`,
    );
  }
  if (checkinBags.some((bag) => (bag.weightKg || 0) > MAX_PIECE_KG)) {
    notes.push(
      `A piece over ${MAX_PIECE_KG} kg is refused at the counter whatever you have paid — repack it into two bags.`,
    );
  }
  if (checkinBags.length === 0) {
    notes.push("Travelling with hand baggage only — get to the gate early, because cabin bins fill up and late bags are tagged into the hold.");
  }

  return {
    passengers,
    cabinAllowanceKg,
    personalItemKg: PERSONAL_ITEM_KG,
    cabinDims: CABIN_DIMS_CM,
    bags: assessed,
    cabinBags,
    checkinBags,
    cabinCount: cabinBags.length,
    checkinCount: checkinBags.length,
    cabinPiecesAllowed,
    cabinPiecesOver,
    cabinTotalKg,
    checkinTotalKg,
    totalKg: round2(cabinTotalKg + checkinTotalKg),
    freeCheckinKgPerPax: round2(freeCheckinKgPerPax),
    freeCheckinKg,
    excessKg,
    excessRatePerKg: round2(excessRatePerKg),
    excessCost,
    spareKg,
    allClear: failing.length === 0 && cabinPiecesOver === 0 && excessKg === 0,
    failingCount: failing.length,
    notes,
  };
}
