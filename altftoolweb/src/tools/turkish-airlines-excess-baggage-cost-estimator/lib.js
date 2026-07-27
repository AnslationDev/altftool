/**
 * Turkish Airlines (TK) excess baggage cost estimator.
 *
 * Three rules drive the arithmetic:
 *
 *   1. THE ROUTE PICKS THE SYSTEM, NOT THE CABIN. Journeys that touch the Americas are assessed
 *      under the IATA piece concept for the whole itinerary — a number of bags with a weight
 *      ceiling on each — even for the Istanbul-side legs. Everything else on the network runs on
 *      the weight concept, where a single kilogram allowance covers all your checked bags and
 *      anything above it is billed per kilogram.
 *
 *   2. ALLOWANCES ARE POOLED. Passengers on the same booking travelling together on the same
 *      flight are assessed on their combined allowance, so one heavy case is offset by a
 *      companion's spare kilos. That is the difference between a charge and no charge on most
 *      family bookings.
 *
 *   3. BUYING BEFORE YOU FLY IS CHEAPER. Extra baggage bought through manage-booking is sold at a
 *      discount to the airport rate. The discount is expressed here as a percentage off the
 *      airport per-kilogram rate, because that is how the saving is quoted.
 *
 * Hard limit on both systems: a single piece over 32 kg is refused at check-in on manual-handling
 * grounds. No amount of excess baggage bought creates an exemption.
 *
 * All money figures are inputs. Turkish Airlines prices excess by route band and by the currency
 * of sale, so a stored rate table would be wrong more often than right. Defaults are illustrative
 * and are meant to be replaced with the quote on your own booking.
 */

/** Industry manual-handling ceiling for one checked piece. */
export const MAX_SINGLE_PIECE_KG = 32;

/** TK cabin baggage: one piece up to 8 kg in Economy, two pieces of up to 8 kg in Business. */
export const CABIN_ALLOWANCE_ECONOMY_KG = 8;
export const CABIN_ALLOWANCE_BUSINESS_KG = 8;
export const CABIN_ALLOWANCE_BUSINESS_PIECES = 2;
export const CABIN_MAX_DIMENSIONS_CM = "55 x 40 x 23";

/**
 * Regions used only to decide which baggage system applies. Any itinerary with an endpoint in
 * the Americas is priced under the piece concept end to end.
 */
export const REGIONS = [
  { value: "turkey", label: "Turkey (domestic)", americas: false },
  { value: "europe", label: "Europe", americas: false },
  { value: "middle-east", label: "Middle East", americas: false },
  { value: "africa", label: "Africa", americas: false },
  { value: "asia", label: "Central and South Asia", americas: false },
  { value: "far-east", label: "Far East and Australia", americas: false },
  { value: "americas", label: "North, Central or South America", americas: true },
];

/**
 * Common weight-concept allowances. They are listed by the kilogram figure rather than by fare
 * name because Turkish Airlines varies the allowance by route band as well as by fare family —
 * the number printed on your own ticket is the one that counts.
 */
export const WEIGHT_ALLOWANCES = [
  { value: "20", label: "20 kg", kg: 20 },
  { value: "23", label: "23 kg", kg: 23 },
  { value: "25", label: "25 kg", kg: 25 },
  { value: "30", label: "30 kg", kg: 30 },
  { value: "32", label: "32 kg", kg: 32 },
  { value: "40", label: "40 kg", kg: 40 },
  { value: "custom", label: "Custom — read it off my ticket", kg: null },
];

/** Piece allowance and per-piece ceiling on itineraries touching the Americas. */
export const PIECE_ALLOWANCES = [
  { value: "eco-1", label: "Economy, 1 piece x 23 kg", pieces: 1, pieceKg: 23 },
  { value: "eco-2", label: "Economy, 2 pieces x 23 kg", pieces: 2, pieceKg: 23 },
  { value: "comfort-2", label: "Comfort / Premium, 2 pieces x 23 kg", pieces: 2, pieceKg: 23 },
  { value: "business-2", label: "Business, 2 pieces x 32 kg", pieces: 2, pieceKg: 32 },
];

/** Illustrative starting values in Turkish lira. Replace with the quote on your booking. */
export const DEFAULT_AIRPORT_RATE_PER_KG = 500;
export const DEFAULT_ONLINE_DISCOUNT_PCT = 20;
export const DEFAULT_EXTRA_PIECE_FEE = 6000;
export const DEFAULT_OVERWEIGHT_PIECE_FEE = 3000;

export const CURRENCIES = [
  { code: "TRY", label: "TRY — Turkish lira", locale: "tr-TR" },
  { code: "EUR", label: "EUR — euro", locale: "en-IE" },
  { code: "USD", label: "USD — US dollar", locale: "en-US" },
  { code: "GBP", label: "GBP — pound sterling", locale: "en-GB" },
  { code: "INR", label: "INR — Indian rupee", locale: "en-IN" },
  { code: "AED", label: "AED — UAE dirham", locale: "en-AE" },
];

/** Sanity ceilings so a typo produces a message instead of a nonsense number. */
const MAX_TOTAL_WEIGHT_KG = 500;
const MAX_ALLOWANCE_KG = 150;
const MAX_BONUS_KG = 60;
const MAX_PIECES = 20;
const MAX_PASSENGERS = 9;
const MAX_MONEY = 10000000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Which baggage system applies to an itinerary.
 * @returns {{system:"weight"|"piece", reason:string}}
 */
export function routeBaggageSystem({ originRegion, destinationRegion } = {}) {
  const origin = REGIONS.find((row) => row.value === originRegion);
  const destination = REGIONS.find((row) => row.value === destinationRegion);
  if (!origin || !destination) {
    return { system: "weight", reason: "Pick both ends of the journey to confirm the system." };
  }
  if (origin.americas || destination.americas) {
    return {
      system: "piece",
      reason:
        "An itinerary with one end in the Americas is priced under the IATA piece concept for the whole journey, including the legs on the Istanbul side.",
    };
  }
  return {
    system: "weight",
    reason:
      "Neither end of this journey is in the Americas, so the weight concept applies: one kilogram allowance covering all your checked bags.",
  };
}

/**
 * Discounted per-kilogram rate for excess bought before departure.
 * @returns {{error:string}|{onlineRatePerKg:number, discountPct:number, savingPerKg:number}}
 */
export function discountedOnlineRate(airportRatePerKg, discountPct = DEFAULT_ONLINE_DISCOUNT_PCT) {
  if (!isNum(airportRatePerKg) || !isNum(discountPct)) {
    return { error: "Enter a number for the airport rate and the discount." };
  }
  if (airportRatePerKg < 0) return { error: "The airport rate cannot be negative." };
  if (airportRatePerKg > MAX_MONEY) return { error: "That airport rate looks far too high." };
  if (discountPct < 0 || discountPct > 100) {
    return { error: "The advance-purchase discount must be between 0% and 100%." };
  }
  const onlineRatePerKg = round2((airportRatePerKg * (100 - discountPct)) / 100);
  return {
    onlineRatePerKg,
    discountPct,
    savingPerKg: round2(airportRatePerKg - onlineRatePerKg),
  };
}

/**
 * Weight-concept routes: pooled kilogram allowance, excess billed per kilogram, with a
 * discounted rate for weight bought before departure.
 * @returns {{error:string}|object}
 */
export function estimateWeightConcept({
  totalCheckedKg,
  allowanceKg,
  bonusAllowanceKg = 0,
  passengers = 1,
  heaviestBagKg = 0,
  airportRatePerKg = DEFAULT_AIRPORT_RATE_PER_KG,
  onlineDiscountPct = DEFAULT_ONLINE_DISCOUNT_PCT,
} = {}) {
  const numbers = [
    totalCheckedKg,
    allowanceKg,
    bonusAllowanceKg,
    passengers,
    heaviestBagKg,
    airportRatePerKg,
    onlineDiscountPct,
  ];
  if (!numbers.every(isNum)) return { error: "Enter a number in every field." };
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > MAX_PASSENGERS) {
    return { error: `Passengers must be a whole number from 1 to ${MAX_PASSENGERS}.` };
  }
  if (totalCheckedKg < 0 || heaviestBagKg < 0) return { error: "Baggage weight cannot be negative." };
  if (totalCheckedKg > MAX_TOTAL_WEIGHT_KG) {
    return { error: `Checked weight above ${MAX_TOTAL_WEIGHT_KG} kg is a cargo shipment, not baggage.` };
  }
  if (heaviestBagKg > totalCheckedKg) {
    return { error: "The heaviest single bag cannot weigh more than all the bags together." };
  }
  if (allowanceKg < 0 || allowanceKg > MAX_ALLOWANCE_KG) {
    return { error: `Checked allowance should be between 0 kg and ${MAX_ALLOWANCE_KG} kg per passenger.` };
  }
  if (bonusAllowanceKg < 0 || bonusAllowanceKg > MAX_BONUS_KG) {
    return { error: `Status bonus should be between 0 kg and ${MAX_BONUS_KG} kg.` };
  }

  const online = discountedOnlineRate(airportRatePerKg, onlineDiscountPct);
  if (online.error) return { error: online.error };

  const perPassengerAllowanceKg = allowanceKg + bonusAllowanceKg;
  const totalAllowanceKg = perPassengerAllowanceKg * passengers;
  const rawExcessKg = Math.max(0, round2(totalCheckedKg - totalAllowanceKg));
  // Check-in systems bill whole kilograms and round a part kilogram up.
  const chargeableExcessKg = rawExcessKg > 0 ? Math.ceil(rawExcessKg - 1e-9) : 0;

  const airportCost = round2(chargeableExcessKg * airportRatePerKg);
  const onlineCost = round2(chargeableExcessKg * online.onlineRatePerKg);
  const saving = round2(airportCost - onlineCost);
  const savingPct = airportCost > 0 ? round2((saving / airportCost) * 100) : 0;
  const cheapestOption = chargeableExcessKg === 0 ? "none" : saving > 0 ? "online" : "airport";
  const cheapestCost = chargeableExcessKg === 0 ? 0 : Math.min(airportCost, onlineCost);

  const warnings = [];
  if (chargeableExcessKg === 0) {
    warnings.push(`Inside the ${totalAllowanceKg} kg pooled allowance. Nothing to pay.`);
  }
  if (heaviestBagKg > MAX_SINGLE_PIECE_KG) {
    warnings.push(
      `A ${heaviestBagKg} kg piece is refused at check-in — ${MAX_SINGLE_PIECE_KG} kg is the ceiling for any one bag, and paying excess does not buy an exemption. Repack before you leave home.`,
    );
  }
  if (passengers > 1) {
    warnings.push(
      `Allowances pool across ${passengers} passengers on the same booking travelling on the same flight, giving the party ${totalAllowanceKg} kg between them.`,
    );
  }
  if (chargeableExcessKg > 0 && saving > 0) {
    warnings.push(
      `Buying the ${chargeableExcessKg} kg through manage-booking before departure saves ${saving} in the currency you entered — the discount disappears once you reach the desk.`,
    );
  }

  return {
    mode: "weight",
    passengers,
    allowanceKg,
    bonusAllowanceKg,
    perPassengerAllowanceKg,
    totalAllowanceKg,
    totalCheckedKg,
    rawExcessKg,
    chargeableExcessKg,
    airportRatePerKg,
    onlineRatePerKg: online.onlineRatePerKg,
    onlineDiscountPct: online.discountPct,
    savingPerKg: online.savingPerKg,
    airportCost,
    onlineCost,
    saving,
    savingPct,
    cheapestOption,
    cheapestCost,
    warnings,
  };
}

/**
 * Piece-concept itineraries: flat fee per extra piece plus a flat fee per overweight piece.
 * @returns {{error:string}|object}
 */
export function estimatePieceConcept({
  checkedPieces,
  allowedPieces,
  pieceLimitKg,
  overweightPieces = 0,
  heaviestBagKg = 0,
  passengers = 1,
  extraPieceFee = DEFAULT_EXTRA_PIECE_FEE,
  overweightPieceFee = DEFAULT_OVERWEIGHT_PIECE_FEE,
} = {}) {
  const numbers = [
    checkedPieces,
    allowedPieces,
    pieceLimitKg,
    overweightPieces,
    heaviestBagKg,
    passengers,
    extraPieceFee,
    overweightPieceFee,
  ];
  if (!numbers.every(isNum)) return { error: "Enter a number in every field." };
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > MAX_PASSENGERS) {
    return { error: `Passengers must be a whole number from 1 to ${MAX_PASSENGERS}.` };
  }
  if (!Number.isInteger(checkedPieces) || checkedPieces < 0 || checkedPieces > MAX_PIECES) {
    return { error: `Checked pieces must be a whole number from 0 to ${MAX_PIECES}.` };
  }
  if (!Number.isInteger(overweightPieces) || overweightPieces < 0) {
    return { error: "Overweight pieces must be a whole number." };
  }
  if (overweightPieces > checkedPieces) {
    return { error: "You cannot have more overweight pieces than checked pieces." };
  }
  if (allowedPieces < 0 || pieceLimitKg <= 0) {
    return { error: "The piece allowance on the ticket is not valid." };
  }
  if (heaviestBagKg < 0) return { error: "Baggage weight cannot be negative." };
  if (extraPieceFee < 0 || overweightPieceFee < 0) return { error: "Fees cannot be negative." };
  if (extraPieceFee > MAX_MONEY || overweightPieceFee > MAX_MONEY) {
    return { error: "Check the fees — those look far too high." };
  }

  const totalAllowedPieces = allowedPieces * passengers;
  const extraPieces = Math.max(0, checkedPieces - totalAllowedPieces);
  const extraPieceCost = extraPieces * extraPieceFee;
  const overweightCost = overweightPieces * overweightPieceFee;
  const totalCost = extraPieceCost + overweightCost;

  const warnings = [];
  if (extraPieces === 0 && overweightPieces === 0) {
    warnings.push(
      `Inside the ${totalAllowedPieces}-piece allowance with every bag under ${pieceLimitKg} kg. Nothing to pay.`,
    );
  }
  if (heaviestBagKg > MAX_SINGLE_PIECE_KG) {
    warnings.push(
      `A ${heaviestBagKg} kg piece is refused at check-in — ${MAX_SINGLE_PIECE_KG} kg is the absolute ceiling for one bag, and the overweight fee does not buy an exemption.`,
    );
  }
  if (overweightPieces > 0) {
    warnings.push(
      `${overweightPieces} piece${overweightPieces > 1 ? "s" : ""} above the ${pieceLimitKg} kg ceiling attract a flat fee each. Moving a few kilos into a bag that is still inside the allowance often removes the charge entirely.`,
    );
  }

  return {
    mode: "piece",
    passengers,
    allowedPieces,
    totalAllowedPieces,
    checkedPieces,
    pieceLimitKg,
    extraPieces,
    extraPieceFee,
    extraPieceCost,
    overweightPieces,
    overweightPieceFee,
    overweightCost,
    totalCost,
    warnings,
  };
}
