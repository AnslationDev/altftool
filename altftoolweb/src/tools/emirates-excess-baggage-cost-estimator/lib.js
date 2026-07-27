/**
 * Emirates (EK) excess baggage cost estimator.
 *
 * Emirates applies two different baggage systems and the arithmetic is not the same:
 *
 *   WEIGHT CONCEPT — used on most of the network. The ticket carries a total checked allowance
 *   in kilograms set by the fare brand (Economy Special through First). Anything above it is
 *   excess and is billed per kilogram. Weight bought in advance on the website (prepaid excess
 *   baggage, sold up to a few hours before departure) is charged at a lower per-kilogram rate
 *   than the airport, and is sold in 5 kg steps, so the purchase rounds UP to the next step.
 *
 *   PIECE CONCEPT — used on routes to and from the Americas. The allowance is a number of
 *   pieces with a weight ceiling on each piece (23 kg in Economy and Premium Economy, 32 kg in
 *   Business and First). You pay a flat fee for each additional piece, and a separate flat fee
 *   for a piece that is over its weight ceiling. Kilograms alone are not charged.
 *
 * Both systems share one hard rule: no single piece over 32 kg is accepted at check-in, whatever
 * you pay, because it exceeds the manual-handling limit ground staff work to.
 *
 * All rates and fees are inputs. Emirates prices excess by route band and currency, so a stored
 * table would be wrong more often than right; the defaults are typical Gulf-to-South-Asia
 * figures and are meant to be replaced with the quote shown on your own booking.
 */

/** Hard per-piece ceiling at check-in, across the industry. */
export const MAX_SINGLE_PIECE_KG = 32;

/** Cabin baggage: Economy one bag up to 7 kg; premium cabins two bags totalling up to 12 kg. */
export const CABIN_ALLOWANCE_ECONOMY_KG = 7;
export const CABIN_ALLOWANCE_PREMIUM_KG = 12;

/** Checked allowance by fare brand on weight-concept routes. */
export const WEIGHT_FARE_BRANDS = [
  { value: "economy-special", label: "Economy Special (20 kg)", kg: 20 },
  { value: "economy-saver", label: "Economy Saver (25 kg)", kg: 25 },
  { value: "economy-flex", label: "Economy Flex (30 kg)", kg: 30 },
  { value: "economy-flex-plus", label: "Economy Flex Plus (35 kg)", kg: 35 },
  { value: "premium-economy", label: "Premium Economy (40 kg)", kg: 40 },
  { value: "business", label: "Business (40 kg)", kg: 40 },
  { value: "first", label: "First (50 kg)", kg: 50 },
  { value: "custom", label: "Custom — from my ticket", kg: null },
];

/** Piece allowance and per-piece weight ceiling on Americas routes. */
export const PIECE_FARE_BRANDS = [
  { value: "economy-piece", label: "Economy (2 pieces x 23 kg)", pieces: 2, pieceKg: 23 },
  { value: "economy-special-piece", label: "Economy Special (1 piece x 23 kg)", pieces: 1, pieceKg: 23 },
  { value: "premium-piece", label: "Premium Economy (2 pieces x 23 kg)", pieces: 2, pieceKg: 23 },
  { value: "business-piece", label: "Business (2 pieces x 32 kg)", pieces: 2, pieceKg: 32 },
  { value: "first-piece", label: "First (2 pieces x 32 kg)", pieces: 2, pieceKg: 32 },
];

/** Prepaid online excess weight is sold in 5 kg steps. */
export const PREPAID_STEP_KG = 5;
export const PREPAID_MAX_KG = 50;

/** Typical route-band reference figures. Editable — replace with your own quote. */
export const DEFAULT_AIRPORT_RATE_PER_KG = 55;
export const DEFAULT_ONLINE_RATE_PER_KG = 30;
export const DEFAULT_EXTRA_PIECE_FEE = 750;
export const DEFAULT_OVERWEIGHT_PIECE_FEE = 400;

export const CURRENCIES = [
  { code: "AED", label: "AED — UAE dirham", locale: "en-AE" },
  { code: "USD", label: "USD — US dollar", locale: "en-US" },
  { code: "INR", label: "INR — Indian rupee", locale: "en-IN" },
  { code: "GBP", label: "GBP — pound sterling", locale: "en-GB" },
  { code: "EUR", label: "EUR — euro", locale: "en-IE" },
];

const MAX_TOTAL_WEIGHT_KG = 500;
const MAX_PIECES = 20;
const MAX_MONEY = 1000000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Round `kg` up to the next sellable prepaid step, capped at the online ceiling. */
export function prepaidStepsFor(kg, stepKg = PREPAID_STEP_KG, maxKg = PREPAID_MAX_KG) {
  if (!isNum(kg) || kg <= 0 || !(stepKg > 0)) return 0;
  const rounded = Math.ceil(kg / stepKg) * stepKg;
  return Math.min(rounded, maxKg);
}

/**
 * Weight-concept routes: excess billed per kilogram, prepaid online sold in 5 kg steps.
 * @returns {{error:string}|object}
 */
export function estimateWeightConcept({
  totalCheckedKg,
  allowanceKg,
  passengers = 1,
  heaviestBagKg = 0,
  airportRatePerKg = DEFAULT_AIRPORT_RATE_PER_KG,
  onlineRatePerKg = DEFAULT_ONLINE_RATE_PER_KG,
  prepaidStepKg = PREPAID_STEP_KG,
  prepaidMaxKg = PREPAID_MAX_KG,
}) {
  const values = [
    totalCheckedKg,
    allowanceKg,
    passengers,
    heaviestBagKg,
    airportRatePerKg,
    onlineRatePerKg,
  ];
  if (!values.every(isNum)) return { error: "Enter a number in every field." };
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > 9) {
    return { error: "Passengers must be a whole number from 1 to 9." };
  }
  if (totalCheckedKg < 0 || heaviestBagKg < 0) return { error: "Baggage weight cannot be negative." };
  if (totalCheckedKg > MAX_TOTAL_WEIGHT_KG) {
    return { error: `Checked weight above ${MAX_TOTAL_WEIGHT_KG} kg is cargo, not baggage.` };
  }
  if (heaviestBagKg > totalCheckedKg) {
    return { error: "The heaviest single bag cannot weigh more than all the bags together." };
  }
  if (allowanceKg < 0 || allowanceKg > 150) {
    return { error: "Checked allowance should be between 0 kg and 150 kg per passenger." };
  }
  if (airportRatePerKg < 0 || onlineRatePerKg < 0) {
    return { error: "Per-kilogram rates cannot be negative." };
  }
  if (airportRatePerKg > MAX_MONEY || onlineRatePerKg > MAX_MONEY) {
    return { error: "Check the per-kilogram rates — those look far too high." };
  }

  const totalAllowanceKg = allowanceKg * passengers;
  const rawExcessKg = Math.max(0, totalCheckedKg - totalAllowanceKg);
  // Airport systems bill whole kilograms, rounding a part kilogram up.
  const chargeableExcessKg = Math.ceil(Number(rawExcessKg.toFixed(6)));
  const airportCost = chargeableExcessKg * airportRatePerKg;

  const perPassengerExcessKg = Math.ceil(chargeableExcessKg / passengers);
  const prepaidPerPassengerKg = prepaidStepsFor(perPassengerExcessKg, prepaidStepKg, prepaidMaxKg);
  const prepaidKgBought = prepaidPerPassengerKg * passengers;
  const prepaidCost = prepaidKgBought * onlineRatePerKg;
  const uncoveredKg = Math.max(0, chargeableExcessKg - prepaidKgBought);
  const airportTopUpCost = uncoveredKg * airportRatePerKg;
  const prepaidTotalCost = prepaidCost + airportTopUpCost;

  const saving = airportCost - prepaidTotalCost;
  const savingPct = airportCost > 0 ? (saving / airportCost) * 100 : 0;
  const cheapestOption = chargeableExcessKg === 0 ? "none" : saving > 0 ? "prepaid" : "airport";
  const cheapestCost = chargeableExcessKg === 0 ? 0 : Math.min(airportCost, prepaidTotalCost);

  const warnings = [];
  if (chargeableExcessKg === 0) {
    warnings.push(`Inside the ${totalAllowanceKg} kg allowance. Nothing to pay.`);
  }
  if (heaviestBagKg > MAX_SINGLE_PIECE_KG) {
    warnings.push(
      `A ${heaviestBagKg} kg piece is refused at check-in — ${MAX_SINGLE_PIECE_KG} kg is the ceiling for any one bag. Repack before you travel.`,
    );
  }
  if (uncoveredKg > 0) {
    warnings.push(
      `Prepaid online tops out at ${prepaidMaxKg} kg per passenger, leaving ${uncoveredKg} kg to pay for at the airport.`,
    );
  }
  if (saving < 0 && chargeableExcessKg > 0) {
    warnings.push(
      `Prepaid weight is sold in ${prepaidStepKg} kg steps, so covering ${perPassengerExcessKg} kg means buying ${prepaidPerPassengerKg} kg — dearer here than paying at the airport.`,
    );
  }

  return {
    mode: "weight",
    passengers,
    allowanceKg,
    totalAllowanceKg,
    totalCheckedKg,
    rawExcessKg,
    chargeableExcessKg,
    airportRatePerKg,
    airportCost,
    onlineRatePerKg,
    prepaidPerPassengerKg,
    prepaidKgBought,
    prepaidCost,
    uncoveredKg,
    airportTopUpCost,
    prepaidTotalCost,
    unusedPrepaidKg: Math.max(0, prepaidKgBought - chargeableExcessKg),
    saving,
    savingPct,
    cheapestOption,
    cheapestCost,
    effectivePerKg: chargeableExcessKg > 0 ? cheapestCost / chargeableExcessKg : 0,
    warnings,
  };
}

/**
 * Piece-concept routes: flat fee per additional piece plus a flat fee per overweight piece.
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
}) {
  const values = [
    checkedPieces,
    allowedPieces,
    pieceLimitKg,
    overweightPieces,
    heaviestBagKg,
    passengers,
    extraPieceFee,
    overweightPieceFee,
  ];
  if (!values.every(isNum)) return { error: "Enter a number in every field." };
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > 9) {
    return { error: "Passengers must be a whole number from 1 to 9." };
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
      `${overweightPieces} piece${overweightPieces > 1 ? "s" : ""} over the ${pieceLimitKg} kg per-bag ceiling attract a flat overweight fee each — moving a few kilos into another bag often removes it entirely.`,
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
