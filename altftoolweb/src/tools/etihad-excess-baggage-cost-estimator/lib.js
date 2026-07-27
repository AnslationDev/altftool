/**
 * Etihad Airways excess baggage cost estimator.
 *
 * Etihad is a weight-concept airline on most of its network: the free allowance is
 * one figure in kilograms covering every checked bag together, and anything above
 * it is excess. Two things then decide what that excess costs, and they interact:
 *
 *   1. Where you buy it. Extra weight added in advance through Manage My Booking
 *      is priced lower per kilogram than the same weight weighed at the airport
 *      desk, so the later you leave it the more each kilo costs.
 *   2. How it is sold. Advance weight comes in fixed blocks per passenger, not in
 *      single kilograms, so a 6 kg overweight forces you up to the next block and
 *      some of what you buy goes unused. The airport bills the actual kilos with a
 *      part kilogram rounded up to the next whole one.
 *
 * There is also a ceiling on advance purchases: weight beyond the largest block has
 * to be settled at the desk whichever route you take, at the airport rate.
 *
 * This module prices every block on the ladder plus the buy-nothing-in-advance
 * option and reports which is cheapest, so you can see why a block wins rather than
 * being told to trust it. Both per-kilogram rates are inputs — Etihad sets them by
 * route and revises them, and the defaults shipped here are round placeholders.
 */

/** Airline identity, so the UI never hard-codes a name. */
export const AIRLINE = { name: "Etihad Airways", code: "EY" };

/** A single piece over this weight is refused at check-in on manual-handling grounds. */
export const MAX_SINGLE_PIECE_KG = 32;

/** Free cabin baggage in Economy, for context alongside the checked figures. */
export const CABIN_BAG_LIMIT_KG = 7;

/**
 * Advance extra baggage is sold per passenger in fixed kilogram blocks. The exact
 * ladder varies by point of sale, so treat this as the common shape rather than a
 * guarantee, and check what your own booking offers.
 */
export const PREPAID_BLOCKS_KG = [5, 10, 15, 20, 30, 40, 50];

/** Free checked allowances you can pick instead of typing one in. */
export const ALLOWANCE_OPTIONS = [
  { value: "eco-23", label: "Economy — 23 kg", kg: 23 },
  { value: "eco-25", label: "Economy — 25 kg", kg: 25 },
  { value: "eco-30", label: "Economy — 30 kg", kg: 30 },
  { value: "eco-35", label: "Economy — 35 kg", kg: 35 },
  { value: "biz-40", label: "Business — 40 kg", kg: 40 },
  { value: "first-50", label: "First — 50 kg", kg: 50 },
  { value: "infant-10", label: "Infant without a seat — 10 kg", kg: 10 },
  { value: "custom", label: "Custom — the figure on my ticket", kg: null },
];

/**
 * Reference per-kilogram rates. These are round placeholders, not quoted prices:
 * Etihad sets excess rates by route and revises them, so replace both figures with
 * what your own booking shows before trusting the total.
 */
export const DEFAULT_PREPAID_RATE_PER_KG = 30;
export const DEFAULT_AIRPORT_RATE_PER_KG = 50;

/** Currencies the estimate can be shown in, with a locale for digit grouping. */
export const CURRENCIES = [
  { code: "AED", locale: "en-AE", label: "AED د.إ" },
  { code: "USD", locale: "en-US", label: "USD $" },
  { code: "EUR", locale: "en-IE", label: "EUR €" },
  { code: "GBP", locale: "en-GB", label: "GBP £" },
  { code: "INR", locale: "en-IN", label: "INR ₹" },
  { code: "AUD", locale: "en-AU", label: "AUD $" },
  { code: "PKR", locale: "en-PK", label: "PKR ₨" },
];

export const DEFAULT_CURRENCY = "AED";

/** Sanity ceilings so a typo cannot produce a meaningless "result". */
export const MAX_PASSENGERS = 9;
const MAX_TOTAL_WEIGHT_KG = 500;
const MAX_ALLOWANCE_KG = 100;
const MAX_RATE_PER_KG = 100000;

const r2 = (n) => Math.round(n * 100) / 100;

function toNum(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const text = String(value ?? "").replace(/,/g, "").trim();
  // An empty field is missing input, not zero.
  if (text === "") return NaN;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function getAllowanceOption(value) {
  return ALLOWANCE_OPTIONS.find((option) => option.value === value) || null;
}

export function getCurrency(code) {
  return CURRENCIES.find((entry) => entry.code === code) || CURRENCIES[0];
}

/** Smallest block that covers `kg`, or null when `kg` is beyond the largest block. */
export function smallestBlockFor(kg, blocks = PREPAID_BLOCKS_KG) {
  if (!Number.isFinite(kg) || kg <= 0) return 0;
  const sorted = [...blocks].sort((a, b) => a - b);
  for (const block of sorted) if (block >= kg) return block;
  return null;
}

/**
 * Price a checked-baggage overweight through every advance block and through the
 * airport desk, and report the cheapest.
 *
 * Pure: the same inputs always produce the same object. No clock, no network.
 * Invalid input returns { error } instead of a misleading figure.
 *
 * @returns {{error:string}|object}
 */
export function estimateExcessCost({
  totalCheckedKg,
  passengers = 1,
  allowanceKgPerPassenger,
  heaviestBagKg = 0,
  prepaidRatePerKg = DEFAULT_PREPAID_RATE_PER_KG,
  airportRatePerKg = DEFAULT_AIRPORT_RATE_PER_KG,
  prepaidBlocksKg = PREPAID_BLOCKS_KG,
} = {}) {
  const total = toNum(totalCheckedKg);
  const pax = toNum(passengers);
  const allowance = toNum(allowanceKgPerPassenger);
  const heaviest = toNum(heaviestBagKg);
  const prepaidRate = toNum(prepaidRatePerKg);
  const airportRate = toNum(airportRatePerKg);

  if ([total, pax, allowance, heaviest, prepaidRate, airportRate].some((value) => Number.isNaN(value))) {
    return { error: "Enter a number in every field." };
  }
  if (!Number.isInteger(pax) || pax < 1 || pax > MAX_PASSENGERS) {
    return { error: `Passengers must be a whole number from 1 to ${MAX_PASSENGERS}.` };
  }
  if (total < 0 || heaviest < 0) return { error: "Baggage weight cannot be negative." };
  if (total > MAX_TOTAL_WEIGHT_KG) {
    return { error: `Checked weight above ${MAX_TOTAL_WEIGHT_KG} kg is cargo, not baggage.` };
  }
  if (heaviest > total) {
    return { error: "The heaviest single bag cannot weigh more than all your bags together." };
  }
  if (allowance < 0 || allowance > MAX_ALLOWANCE_KG) {
    return { error: `Free allowance should be between 0 kg and ${MAX_ALLOWANCE_KG} kg per passenger.` };
  }
  if (prepaidRate < 0 || airportRate < 0) return { error: "Per-kilogram rates cannot be negative." };
  if (prepaidRate > MAX_RATE_PER_KG || airportRate > MAX_RATE_PER_KG) {
    return { error: "Check the per-kilogram rates — those look far too high." };
  }

  const blocks = [...prepaidBlocksKg]
    .filter((block) => Number.isFinite(block) && block > 0)
    .sort((a, b) => a - b);
  const largestBlock = blocks.length ? blocks[blocks.length - 1] : 0;

  /* --------------------------------------------------------- what is chargeable */
  const totalAllowanceKg = r2(allowance * pax);
  const rawExcessKg = r2(Math.max(0, total - totalAllowanceKg));
  // A part kilogram is billed as a whole one.
  const chargeableExcessKg = Math.ceil(Number(rawExcessKg.toFixed(6)));
  const perPassengerExcessKg = Math.ceil(chargeableExcessKg / pax);

  /* ---------------------------------------------- price every advance block */
  const airportOnlyCost = r2(chargeableExcessKg * airportRate);

  const options = blocks.map((blockKg) => {
    const kgBought = blockKg * pax;
    const coveredKg = Math.min(kgBought, chargeableExcessKg);
    const uncoveredKg = Math.max(0, chargeableExcessKg - kgBought);
    const blockCost = r2(kgBought * prepaidRate);
    const topUpCost = r2(uncoveredKg * airportRate);
    return {
      id: `block-${blockKg}`,
      label: `Buy ${blockKg} kg per passenger in advance`,
      blockKg,
      kgBought,
      coveredKg,
      uncoveredKg,
      unusedKg: Math.max(0, kgBought - chargeableExcessKg),
      blockCost,
      topUpCost,
      total: r2(blockCost + topUpCost),
    };
  });

  options.push({
    id: "airport",
    label: "Buy nothing in advance, pay at the airport",
    blockKg: 0,
    kgBought: 0,
    coveredKg: 0,
    uncoveredKg: chargeableExcessKg,
    unusedKg: 0,
    blockCost: 0,
    topUpCost: airportOnlyCost,
    total: airportOnlyCost,
  });

  const cheapest =
    chargeableExcessKg === 0
      ? null
      : options.reduce((best, item) => (item.total < best.total ? item : best), options[0]);
  const cheapestCost = cheapest ? cheapest.total : 0;
  const savingVsAirport = r2(airportOnlyCost - cheapestCost);
  const savingPct = airportOnlyCost > 0 ? r2((savingVsAirport / airportOnlyCost) * 100) : 0;
  const effectivePerKg = chargeableExcessKg > 0 ? r2(cheapestCost / chargeableExcessKg) : 0;

  /* -------------------------------- the block you would reach for by instinct */
  const naturalBlockKg = smallestBlockFor(perPassengerExcessKg, blocks);
  const naturalOption =
    chargeableExcessKg === 0
      ? null
      : naturalBlockKg === null
        ? options.find((option) => option.blockKg === largestBlock) || null
        : options.find((option) => option.blockKg === naturalBlockKg) || null;

  /* --------------------------------------------------------------------- notes */
  const warnings = [];
  if (chargeableExcessKg === 0) {
    warnings.push(
      `Inside the free allowance of ${totalAllowanceKg} kg for ${pax} passenger${pax === 1 ? "" : "s"}. Nothing to pay.`,
    );
  }
  if (heaviest > MAX_SINGLE_PIECE_KG) {
    warnings.push(
      `A ${r2(heaviest)} kg single bag will not be accepted: the per-piece ceiling is ${MAX_SINGLE_PIECE_KG} kg. Buying extra weight raises your total allowance, never the weight of one bag, so repack it into two.`,
    );
  }
  if (chargeableExcessKg > largestBlock * pax && largestBlock > 0) {
    warnings.push(
      `Advance blocks stop at ${largestBlock} kg per passenger, so at least ${chargeableExcessKg - largestBlock * pax} kg has to be settled at the airport rate whatever you buy.`,
    );
  }
  if (cheapest && cheapest.id === "airport" && chargeableExcessKg > 0) {
    warnings.push(
      `Blocks are sold in ${blocks.join(", ")} kg steps per passenger. The smallest one that covers ${perPassengerExcessKg} kg costs more than simply paying for ${chargeableExcessKg} kg at the desk.`,
    );
  }
  if (cheapest && cheapest.unusedKg > 0) {
    warnings.push(
      `The cheapest block covers ${cheapest.kgBought} kg for ${chargeableExcessKg} kg of excess, so ${cheapest.unusedKg} kg of what you buy goes unused.`,
    );
  }
  if (prepaidRate >= airportRate && chargeableExcessKg > 0) {
    warnings.push(
      "The advance rate you entered is not below the airport rate — check it, since buying ahead is normally the cheaper of the two.",
    );
  }

  return {
    airline: AIRLINE,
    passengers: pax,
    allowanceKgPerPassenger: r2(allowance),
    totalAllowanceKg,
    totalCheckedKg: r2(total),
    heaviestBagKg: r2(heaviest),
    rawExcessKg,
    chargeableExcessKg,
    perPassengerExcessKg,
    prepaidRatePerKg: r2(prepaidRate),
    airportRatePerKg: r2(airportRate),
    blocks,
    options,
    airportOnlyCost,
    cheapestId: cheapest ? cheapest.id : "none",
    cheapestLabel: cheapest ? cheapest.label : "No excess baggage to buy",
    cheapestCost,
    cheapestBlockKg: cheapest ? cheapest.blockKg : 0,
    naturalOptionId: naturalOption ? naturalOption.id : "none",
    savingVsAirport,
    savingPct,
    effectivePerKg,
    warnings,
  };
}
