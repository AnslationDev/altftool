/**
 * Thai Airways International (TG) excess baggage cost estimator.
 *
 * Thai Airways runs the two baggage systems the industry uses, and the arithmetic differs:
 *
 *   WEIGHT CONCEPT — used across most of the network (Europe, Asia, Australia). The ticket
 *   carries a total checked allowance in kilograms set by the cabin and fare family. Anything
 *   above it is excess and is billed per kilogram. Passengers on the same booking travelling
 *   together on the same flight may pool their allowances, so one heavy bag can be offset by a
 *   companion's unused kilos.
 *
 *   PIECE CONCEPT — used on routes touching the Americas, where IATA piece rules apply. The
 *   allowance is a number of pieces with a weight ceiling on each piece (23 kg in Economy and
 *   Premium Economy, 32 kg in Royal Silk and Royal First). You pay a flat fee for each extra
 *   piece and a separate flat fee for a piece over its ceiling; loose kilograms are not billed.
 *
 * Shared hard rule: no single piece over 32 kg is accepted at check-in on either system. That is
 * the manual-handling ceiling ground staff work to, and no amount of excess baggage buys around
 * it — the bag must be repacked or shipped as cargo.
 *
 * All money rates are inputs, never stored. Thai Airways prices excess by route band and by the
 * currency of sale, so a hard-coded table would be wrong more often than right. The defaults are
 * illustrative Bangkok-region figures meant to be replaced by the quote on your own booking.
 */

/** Industry-wide ceiling for a single checked piece at a normal check-in desk. */
export const MAX_SINGLE_PIECE_KG = 32;

/** TG cabin baggage: one piece up to 7 kg, 56 x 45 x 25 cm, in every cabin. */
export const CABIN_ALLOWANCE_KG = 7;
export const CABIN_MAX_DIMENSIONS_CM = "56 x 45 x 25";

/**
 * Checked allowance by cabin on weight-concept routes, from the Thai Airways published
 * baggage table. Confirm the figure printed on your own ticket — promotional and codeshare
 * fares can carry less.
 */
export const WEIGHT_FARE_BRANDS = [
  { value: "economy-saver", label: "Economy Saver (20 kg)", kg: 20 },
  { value: "economy-standard", label: "Economy Standard (30 kg)", kg: 30 },
  { value: "economy-flexible", label: "Economy Flexible (30 kg)", kg: 30 },
  { value: "premium-economy", label: "Premium Economy (40 kg)", kg: 40 },
  { value: "royal-silk", label: "Royal Silk / Business (40 kg)", kg: 40 },
  { value: "royal-first", label: "Royal First (50 kg)", kg: 50 },
  { value: "custom", label: "Custom — read it off my ticket", kg: null },
];

/** Piece allowance and per-piece ceiling on Americas routes under IATA piece rules. */
export const PIECE_FARE_BRANDS = [
  { value: "economy-piece", label: "Economy (2 pieces x 23 kg)", pieces: 2, pieceKg: 23 },
  { value: "economy-saver-piece", label: "Economy Saver (1 piece x 23 kg)", pieces: 1, pieceKg: 23 },
  { value: "premium-piece", label: "Premium Economy (2 pieces x 23 kg)", pieces: 2, pieceKg: 23 },
  { value: "royal-silk-piece", label: "Royal Silk / Business (2 pieces x 32 kg)", pieces: 2, pieceKg: 32 },
  { value: "royal-first-piece", label: "Royal First (2 pieces x 32 kg)", pieces: 2, pieceKg: 32 },
];

/**
 * Prepaid excess weight is sold in fixed blocks rather than by the exact kilo, so a purchase
 * always rounds UP to the next block. Five kilograms is the common block size; it stays an
 * argument because the block sold varies by point of sale.
 */
export const DEFAULT_PREPAID_BLOCK_KG = 5;
export const DEFAULT_PREPAID_MAX_KG = 45;

/**
 * IATA Resolution 302 standard excess baggage charge: 1.5% of the highest applicable one-way
 * normal (published) fare, per kilogram. Most carriers including TG now publish flat route-band
 * rates instead, so this is offered only as a sanity cross-check on a quote that looks wrong.
 */
export const IATA_EXCESS_PCT_OF_ONE_WAY_FARE = 1.5;

/** Illustrative Bangkok-region reference figures, in Thai baht. Replace with your own quote. */
export const DEFAULT_AIRPORT_RATE_PER_KG = 600;
export const DEFAULT_PREPAID_RATE_PER_KG = 400;
export const DEFAULT_EXTRA_PIECE_FEE = 6500;
export const DEFAULT_OVERWEIGHT_PIECE_FEE = 3500;

export const CURRENCIES = [
  { code: "THB", label: "THB — Thai baht", locale: "th-TH" },
  { code: "USD", label: "USD — US dollar", locale: "en-US" },
  { code: "EUR", label: "EUR — euro", locale: "en-IE" },
  { code: "GBP", label: "GBP — pound sterling", locale: "en-GB" },
  { code: "INR", label: "INR — Indian rupee", locale: "en-IN" },
  { code: "AUD", label: "AUD — Australian dollar", locale: "en-AU" },
];

/** Sanity ceilings so an obvious typo produces an error instead of a nonsense number. */
const MAX_TOTAL_WEIGHT_KG = 500;
const MAX_ALLOWANCE_KG = 150;
const MAX_BONUS_KG = 60;
const MAX_PIECES = 20;
const MAX_PASSENGERS = 9;
const MAX_MONEY = 10000000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Round `kg` up to the next sellable prepaid block, capped at the online ceiling.
 * Returns 0 for nothing to buy or for a nonsensical block size.
 */
export function prepaidBlocksFor(kg, blockKg = DEFAULT_PREPAID_BLOCK_KG, maxKg = DEFAULT_PREPAID_MAX_KG) {
  if (!isNum(kg) || kg <= 0) return 0;
  if (!isNum(blockKg) || blockKg <= 0) return 0;
  if (!isNum(maxKg) || maxKg <= 0) return 0;
  const rounded = Math.ceil(kg / blockKg) * blockKg;
  return Math.min(rounded, maxKg);
}

/**
 * IATA-style per-kilogram excess rate derived from a published one-way fare.
 * @returns {{error:string}|{ratePerKg:number, percent:number}}
 */
export function fareBasedRatePerKg(oneWayFare, percent = IATA_EXCESS_PCT_OF_ONE_WAY_FARE) {
  if (!isNum(oneWayFare)) return { error: "Enter the published one-way fare as a number." };
  if (oneWayFare < 0) return { error: "A fare cannot be negative." };
  if (oneWayFare > MAX_MONEY) return { error: "That fare looks far too high — check the figure." };
  if (!isNum(percent) || percent <= 0 || percent > 100) {
    return { error: "The excess percentage must be between 0 and 100." };
  }
  return { ratePerKg: round2((oneWayFare * percent) / 100), percent };
}

/**
 * Weight-concept routes: excess billed per kilogram, prepaid weight sold in blocks.
 * Pure — every rate and weight is an argument.
 * @returns {{error:string}|object}
 */
export function estimateWeightConcept({
  totalCheckedKg,
  allowanceKg,
  bonusAllowanceKg = 0,
  passengers = 1,
  heaviestBagKg = 0,
  airportRatePerKg = DEFAULT_AIRPORT_RATE_PER_KG,
  prepaidRatePerKg = DEFAULT_PREPAID_RATE_PER_KG,
  prepaidBlockKg = DEFAULT_PREPAID_BLOCK_KG,
  prepaidMaxKg = DEFAULT_PREPAID_MAX_KG,
} = {}) {
  const numbers = [
    totalCheckedKg,
    allowanceKg,
    bonusAllowanceKg,
    passengers,
    heaviestBagKg,
    airportRatePerKg,
    prepaidRatePerKg,
    prepaidBlockKg,
    prepaidMaxKg,
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
    return { error: `Status or card bonus should be between 0 kg and ${MAX_BONUS_KG} kg.` };
  }
  if (airportRatePerKg < 0 || prepaidRatePerKg < 0) return { error: "Per-kilogram rates cannot be negative." };
  if (airportRatePerKg > MAX_MONEY || prepaidRatePerKg > MAX_MONEY) {
    return { error: "Check the per-kilogram rates — those look far too high." };
  }
  if (prepaidBlockKg <= 0) return { error: "The prepaid block size must be greater than zero." };
  if (prepaidMaxKg <= 0) return { error: "The prepaid ceiling must be greater than zero." };

  const perPassengerAllowanceKg = allowanceKg + bonusAllowanceKg;
  // Pooling: passengers on the same booking travelling together on the same flight are assessed
  // on their combined allowance, so one heavy bag is offset by a companion's unused kilos.
  const totalAllowanceKg = perPassengerAllowanceKg * passengers;
  const rawExcessKg = Math.max(0, round2(totalCheckedKg - totalAllowanceKg));
  // Check-in systems bill whole kilograms and round a part kilogram up.
  const chargeableExcessKg = Math.ceil(rawExcessKg - 1e-9) > 0 ? Math.ceil(rawExcessKg - 1e-9) : 0;

  const airportCost = chargeableExcessKg * airportRatePerKg;

  const perPassengerExcessKg = Math.ceil(chargeableExcessKg / passengers);
  const prepaidPerPassengerKg = prepaidBlocksFor(perPassengerExcessKg, prepaidBlockKg, prepaidMaxKg);
  const prepaidKgBought = prepaidPerPassengerKg * passengers;
  const prepaidCost = prepaidKgBought * prepaidRatePerKg;
  const uncoveredKg = Math.max(0, chargeableExcessKg - prepaidKgBought);
  const airportTopUpCost = uncoveredKg * airportRatePerKg;
  const prepaidTotalCost = prepaidCost + airportTopUpCost;

  const saving = airportCost - prepaidTotalCost;
  const savingPct = airportCost > 0 ? (saving / airportCost) * 100 : 0;
  const cheapestOption = chargeableExcessKg === 0 ? "none" : saving > 0 ? "prepaid" : "airport";
  const cheapestCost = chargeableExcessKg === 0 ? 0 : Math.min(airportCost, prepaidTotalCost);

  const warnings = [];
  if (chargeableExcessKg === 0) {
    warnings.push(`Inside the ${totalAllowanceKg} kg allowance for the party. Nothing to pay.`);
  }
  if (heaviestBagKg > MAX_SINGLE_PIECE_KG) {
    warnings.push(
      `A ${heaviestBagKg} kg piece is refused at check-in — ${MAX_SINGLE_PIECE_KG} kg is the ceiling for any one bag on Thai Airways, and paying excess does not buy an exemption. Split the load before you leave home.`,
    );
  }
  if (uncoveredKg > 0) {
    warnings.push(
      `Prepaid excess tops out at ${prepaidMaxKg} kg per passenger here, leaving ${uncoveredKg} kg to settle at the airport counter.`,
    );
  }
  if (saving < 0 && chargeableExcessKg > 0) {
    warnings.push(
      `Prepaid weight is sold in ${prepaidBlockKg} kg blocks, so covering ${perPassengerExcessKg} kg means buying ${prepaidPerPassengerKg} kg — dearer here than simply paying at the desk.`,
    );
  }
  if (passengers > 1) {
    warnings.push(
      `Allowances are pooled across ${passengers} passengers on the same booking travelling on the same flight, giving the party ${totalAllowanceKg} kg between them.`,
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
    airportCost,
    prepaidRatePerKg,
    prepaidBlockKg,
    prepaidPerPassengerKg,
    prepaidKgBought,
    prepaidCost,
    uncoveredKg,
    airportTopUpCost,
    prepaidTotalCost,
    unusedPrepaidKg: Math.max(0, prepaidKgBought - chargeableExcessKg),
    saving,
    savingPct: round2(savingPct),
    cheapestOption,
    cheapestCost,
    effectivePerKg: chargeableExcessKg > 0 ? round2(cheapestCost / chargeableExcessKg) : 0,
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
      `${overweightPieces} piece${overweightPieces > 1 ? "s" : ""} above the ${pieceLimitKg} kg per-bag ceiling attract a flat fee each. Shifting a few kilos into another bag inside the allowance often removes the charge entirely.`,
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
