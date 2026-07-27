/**
 * Ryanair excess baggage cost estimator.
 *
 * Ryanair does not work like a legacy carrier and the arithmetic reflects that:
 *
 *   NOTHING IS POOLED. Every allowance is attached to one passenger. Two people on one booking
 *   with a 20 kg bag each have two 20 kg bags, not one 40 kg pot, so an over-packed suitcase
 *   cannot be offset by a companion's spare kilos.
 *
 *   EVERY CHARGE IS PER PASSENGER PER ONE-WAY FLIGHT. A return trip is two flights, so every
 *   bag fee, priority fee and gate fee is paid twice. This is the single biggest reason people
 *   under-estimate the cost.
 *
 *   THE FREE ALLOWANCE IS ONE SMALL PERSONAL BAG that must fit under the seat in front. Anything
 *   larger has to be bought: either Priority & 2 Cabin Bags, which adds a 10 kg wheelie bag in the
 *   overhead locker, or a hold bag.
 *
 *   HOLD BAGS ARE SOLD IN TWO SIZES, 10 kg and 20 kg, up to three per passenger. Weight above the
 *   purchased allowance is billed per kilogram at the airport, which is why buying a second bag is
 *   often cheaper than paying for the overweight.
 *
 * Hard limit: no single piece over 32 kg is accepted at check-in. That is the manual-handling
 * ceiling ground staff work to, and no amount of excess weight paid buys around it.
 *
 * Every price is an input. Ryanair prices bags dynamically by route, season and how far ahead you
 * book, and airport prices are higher than online prices, so a stored table would be wrong far
 * more often than right. The defaults are the airline's long-standing published headline figures
 * and are meant to be replaced with the prices shown in your own booking.
 */

/** Free personal bag: must fit under the seat in front. Dimensions in centimetres. */
export const FREE_PERSONAL_BAG_CM = "40 x 20 x 25";

/** Priority & 2 Cabin Bags adds one overhead-locker bag of this size and weight. */
export const PRIORITY_CABIN_BAG_CM = "55 x 40 x 20";
export const PRIORITY_CABIN_BAG_KG = 10;

/** The two hold-bag products Ryanair sells. */
export const CHECKED_BAG_SIZES = [
  { value: 10, label: "10 kg check-in bag", maxCm: "55 x 40 x 20" },
  { value: 20, label: "20 kg check-in bag", maxCm: "81 x 119 x 119" },
];
export const CHECKED_10KG_ALLOWANCE_KG = 10;
export const CHECKED_20KG_ALLOWANCE_KG = 20;

/** Up to three hold bags may be bought per passenger. */
export const MAX_CHECKED_BAGS_PER_PASSENGER = 3;

/** Industry manual-handling ceiling for one checked piece. */
export const MAX_SINGLE_PIECE_KG = 32;

/**
 * Long-standing published headline figures, used only as editable starting values.
 * Confirm the price your own booking quotes — all of these vary by market and route.
 */
export const DEFAULT_EXCESS_RATE_PER_KG = 11;
export const DEFAULT_GATE_BAG_FEE = 70;
export const DEFAULT_AIRPORT_CHECKIN_FEE = 55;
export const DEFAULT_PRIORITY_PRICE = 8;
export const DEFAULT_BAG_10KG_PRICE = 15;
export const DEFAULT_BAG_20KG_PRICE = 30;

export const CURRENCIES = [
  { code: "EUR", label: "EUR — euro", locale: "en-IE" },
  { code: "GBP", label: "GBP — pound sterling", locale: "en-GB" },
  { code: "PLN", label: "PLN — Polish zloty", locale: "pl-PL" },
  { code: "SEK", label: "SEK — Swedish krona", locale: "sv-SE" },
  { code: "DKK", label: "DKK — Danish krone", locale: "da-DK" },
  { code: "CZK", label: "CZK — Czech koruna", locale: "cs-CZ" },
  { code: "RON", label: "RON — Romanian leu", locale: "ro-RO" },
];

/** Sanity ceilings so a typo produces a message instead of a nonsense number. */
const MAX_PASSENGERS = 9;
const MAX_FLIGHTS = 12;
const MAX_WEIGHT_KG = 200;
const MAX_MONEY = 100000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Kilograms are billed whole, rounding a part kilogram up. */
const chargeableKg = (value) => {
  if (!isNum(value) || value <= 0) return 0;
  const rounded = Math.ceil(value - 1e-9);
  return rounded > 0 ? rounded : 0;
};

/**
 * Cost of one passenger's hold baggage for one flight under a given bag plan.
 * @returns {number} price of the bags plus any per-kilogram excess weight
 */
function planCost({ bags10, bags20, checkedWeightKg, bag10Price, bag20Price, excessRatePerKg }) {
  const allowanceKg = bags10 * CHECKED_10KG_ALLOWANCE_KG + bags20 * CHECKED_20KG_ALLOWANCE_KG;
  const excessKg = chargeableKg(checkedWeightKg - allowanceKg);
  return bags10 * bag10Price + bags20 * bag20Price + excessKg * excessRatePerKg;
}

/**
 * Enumerate every legal hold-bag combination for one passenger and return the cheapest.
 *
 * A combination is legal when it uses at most three bags and when the bags can physically hold
 * the weight — no single piece may exceed 32 kg, so `n` bags cap out at 32n kilograms.
 *
 * @returns {{error:string}|{plans:Array, best:object}}
 */
export function cheapestBagPlan({
  checkedWeightKg,
  bag10Price = DEFAULT_BAG_10KG_PRICE,
  bag20Price = DEFAULT_BAG_20KG_PRICE,
  excessRatePerKg = DEFAULT_EXCESS_RATE_PER_KG,
  maxBags = MAX_CHECKED_BAGS_PER_PASSENGER,
} = {}) {
  if (![checkedWeightKg, bag10Price, bag20Price, excessRatePerKg, maxBags].every(isNum)) {
    return { error: "Enter a number for the weight and for each bag price." };
  }
  if (checkedWeightKg < 0) return { error: "Baggage weight cannot be negative." };
  if (checkedWeightKg > MAX_WEIGHT_KG) {
    return { error: `Ryanair sells at most ${MAX_CHECKED_BAGS_PER_PASSENGER} hold bags per passenger, so ${MAX_WEIGHT_KG} kg is the sensible ceiling here.` };
  }
  if (bag10Price < 0 || bag20Price < 0 || excessRatePerKg < 0) {
    return { error: "Prices cannot be negative." };
  }
  if (bag10Price > MAX_MONEY || bag20Price > MAX_MONEY || excessRatePerKg > MAX_MONEY) {
    return { error: "Check those prices — they look far too high." };
  }
  if (!Number.isInteger(maxBags) || maxBags < 1 || maxBags > MAX_CHECKED_BAGS_PER_PASSENGER) {
    return { error: `Hold bags per passenger must be a whole number from 1 to ${MAX_CHECKED_BAGS_PER_PASSENGER}.` };
  }

  const plans = [];
  for (let bags10 = 0; bags10 <= maxBags; bags10 += 1) {
    for (let bags20 = 0; bags20 + bags10 <= maxBags; bags20 += 1) {
      const bags = bags10 + bags20;
      if (bags === 0) {
        if (checkedWeightKg > 0) continue;
      } else if (bags * MAX_SINGLE_PIECE_KG < checkedWeightKg) {
        // Not physically possible: the weight cannot be split under the 32 kg per-piece ceiling.
        continue;
      }
      const allowanceKg = bags10 * CHECKED_10KG_ALLOWANCE_KG + bags20 * CHECKED_20KG_ALLOWANCE_KG;
      const excessKg = chargeableKg(checkedWeightKg - allowanceKg);
      plans.push({
        bags10,
        bags20,
        bags,
        allowanceKg,
        excessKg,
        bagCost: bags10 * bag10Price + bags20 * bag20Price,
        excessCost: excessKg * excessRatePerKg,
        cost: planCost({ bags10, bags20, checkedWeightKg, bag10Price, bag20Price, excessRatePerKg }),
      });
    }
  }

  if (plans.length === 0) {
    return { error: `${checkedWeightKg} kg cannot be carried in ${maxBags} bags without breaking the ${MAX_SINGLE_PIECE_KG} kg per-piece limit.` };
  }

  plans.sort((a, b) => a.cost - b.cost || a.bags - b.bags || a.excessKg - b.excessKg);
  return { plans, best: plans[0] };
}

/**
 * Full Ryanair baggage bill for a party across every one-way flight on the trip.
 * Pure — every price, weight and count is an argument.
 * @returns {{error:string}|object}
 */
export function estimateRyanairBaggage({
  passengers = 1,
  flights = 2,
  priority = false,
  bags10 = 0,
  bags20 = 1,
  checkedWeightKg = 0,
  heaviestBagKg = 0,
  cabinBagKg = 0,
  gateBags = 0,
  airportCheckIn = false,
  priorityPrice = DEFAULT_PRIORITY_PRICE,
  bag10Price = DEFAULT_BAG_10KG_PRICE,
  bag20Price = DEFAULT_BAG_20KG_PRICE,
  excessRatePerKg = DEFAULT_EXCESS_RATE_PER_KG,
  gateBagFee = DEFAULT_GATE_BAG_FEE,
  airportCheckInFee = DEFAULT_AIRPORT_CHECKIN_FEE,
} = {}) {
  const numbers = [
    passengers,
    flights,
    bags10,
    bags20,
    checkedWeightKg,
    heaviestBagKg,
    cabinBagKg,
    gateBags,
    priorityPrice,
    bag10Price,
    bag20Price,
    excessRatePerKg,
    gateBagFee,
    airportCheckInFee,
  ];
  if (!numbers.every(isNum)) return { error: "Enter a number in every field." };
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > MAX_PASSENGERS) {
    return { error: `Passengers must be a whole number from 1 to ${MAX_PASSENGERS}.` };
  }
  if (!Number.isInteger(flights) || flights < 1 || flights > MAX_FLIGHTS) {
    return { error: `One-way flights must be a whole number from 1 to ${MAX_FLIGHTS} — a return trip is 2.` };
  }
  if (!Number.isInteger(bags10) || !Number.isInteger(bags20) || bags10 < 0 || bags20 < 0) {
    return { error: "The number of hold bags must be a whole number of zero or more." };
  }
  if (bags10 + bags20 > MAX_CHECKED_BAGS_PER_PASSENGER) {
    return { error: `Ryanair sells at most ${MAX_CHECKED_BAGS_PER_PASSENGER} hold bags per passenger.` };
  }
  if (!Number.isInteger(gateBags) || gateBags < 0 || gateBags > 4) {
    return { error: "Bags expected to be taken at the gate must be a whole number from 0 to 4." };
  }
  if (checkedWeightKg < 0 || heaviestBagKg < 0 || cabinBagKg < 0) {
    return { error: "Baggage weight cannot be negative." };
  }
  if (checkedWeightKg > MAX_WEIGHT_KG) {
    return { error: `Checked weight above ${MAX_WEIGHT_KG} kg per passenger is a freight shipment, not baggage.` };
  }
  if (heaviestBagKg > checkedWeightKg && checkedWeightKg > 0) {
    return { error: "The heaviest single bag cannot weigh more than all your hold bags together." };
  }
  if (checkedWeightKg > 0 && bags10 + bags20 === 0) {
    return { error: "You have hold weight but no hold bag bought — add at least one 10 kg or 20 kg bag." };
  }
  const prices = [priorityPrice, bag10Price, bag20Price, excessRatePerKg, gateBagFee, airportCheckInFee];
  if (prices.some((price) => price < 0)) return { error: "Prices and fees cannot be negative." };
  if (prices.some((price) => price > MAX_MONEY)) return { error: "Check the prices — those look far too high." };

  const holdBags = bags10 + bags20;
  const holdAllowanceKg = bags10 * CHECKED_10KG_ALLOWANCE_KG + bags20 * CHECKED_20KG_ALLOWANCE_KG;
  const rawExcessKg = Math.max(0, checkedWeightKg - holdAllowanceKg);
  const excessKg = chargeableKg(rawExcessKg);

  // Per passenger, per one-way flight.
  const priorityPerFlight = priority ? priorityPrice : 0;
  const bagsPerFlight = bags10 * bag10Price + bags20 * bag20Price;
  const excessPerFlight = excessKg * excessRatePerKg;
  const gatePerFlight = gateBags * gateBagFee;
  const checkInPerFlight = airportCheckIn ? airportCheckInFee : 0;
  const perPassengerPerFlight =
    priorityPerFlight + bagsPerFlight + excessPerFlight + gatePerFlight + checkInPerFlight;

  const legs = passengers * flights;
  const priorityTotal = priorityPerFlight * legs;
  const bagsTotal = bagsPerFlight * legs;
  const excessTotal = excessPerFlight * legs;
  const gateTotal = gatePerFlight * legs;
  const checkInTotal = checkInPerFlight * legs;
  const total = perPassengerPerFlight * legs;

  const cabinAllowanceKg = priority ? PRIORITY_CABIN_BAG_KG : 0;

  const warnings = [];
  if (heaviestBagKg > MAX_SINGLE_PIECE_KG) {
    warnings.push(
      `A ${heaviestBagKg} kg piece is refused at the bag drop — ${MAX_SINGLE_PIECE_KG} kg is the ceiling for any one bag, and paying the excess rate does not buy an exemption.`,
    );
  }
  if (holdBags > 0 && heaviestBagKg > 0 && heaviestBagKg > holdAllowanceKg) {
    warnings.push(
      `Your heaviest bag alone (${heaviestBagKg} kg) is over the ${holdAllowanceKg} kg you have bought, so the excess is charged at the desk even if the party average looks fine.`,
    );
  }
  if (excessKg > 0) {
    warnings.push(
      `${excessKg} kg of excess weight is billed per kilo at the airport on every one-way flight — ${flights} time${flights > 1 ? "s" : ""} on this trip.`,
    );
  }
  if (!priority && cabinBagKg > 0) {
    warnings.push(
      `Without Priority & 2 Cabin Bags the only free item is one small bag of ${FREE_PERSONAL_BAG_CM} cm that fits under the seat. A larger cabin bag is taken at the gate for a fee.`,
    );
  }
  if (priority && cabinBagKg > PRIORITY_CABIN_BAG_KG) {
    warnings.push(
      `The priority cabin bag is capped at ${PRIORITY_CABIN_BAG_KG} kg; ${cabinBagKg} kg is over it.`,
    );
  }
  if (passengers > 1) {
    warnings.push(
      "Ryanair does not pool allowances. Each passenger's bags are assessed on their own, so a companion's spare kilos cannot cover an over-packed case.",
    );
  }
  if (flights > 1) {
    warnings.push(
      `Every fee below is charged per passenger per one-way flight, so this ${flights}-flight trip pays each of them ${flights} times.`,
    );
  }

  return {
    passengers,
    flights,
    legs,
    priority,
    bags10,
    bags20,
    holdBags,
    holdAllowanceKg,
    cabinAllowanceKg,
    checkedWeightKg,
    rawExcessKg,
    excessKg,
    excessRatePerKg,
    perPassengerPerFlight,
    priorityPerFlight,
    bagsPerFlight,
    excessPerFlight,
    gatePerFlight,
    checkInPerFlight,
    priorityTotal,
    bagsTotal,
    excessTotal,
    gateTotal,
    checkInTotal,
    total,
    warnings,
  };
}
