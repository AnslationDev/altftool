/**
 * Singapore Airlines (SQ) excess baggage cost estimator.
 *
 * Rules implemented:
 *   1. Weight concept. The checked allowance is a total number of kilograms set by the fare
 *      brand — Economy Lite through Suites — rather than a number of bags, so how you split the
 *      weight between suitcases does not change the excess charge.
 *   2. Frequent-flyer tier allowance is ADDITIVE. A qualifying KrisFlyer or PPS Club member's
 *      bonus kilograms are added to the fare brand allowance before excess is worked out.
 *   3. Excess presented at the airport is billed per kilogram, with a part kilogram rounded UP
 *      to the next whole kilogram.
 *   4. Weight bought in advance through manage-booking is sold in fixed blocks per passenger at
 *      a lower per-kilogram rate, so the purchase is rounded UP to the next block; anything
 *      beyond the largest block is settled at the airport rate.
 *
 * Rates are inputs. Excess is priced by route band and by the currency of sale, so a stored
 * table would be misleading; the defaults are order-of-magnitude starting points to be replaced
 * with the quote on your own booking.
 */

/** Hard per-piece ceiling at check-in, across the industry. */
export const MAX_SINGLE_PIECE_KG = 32;

/** Cabin baggage: 7 kg in Economy and Premium Economy, 2 bags totalling 14 kg in Business/First. */
export const CABIN_ALLOWANCE_ECONOMY_KG = 7;
export const CABIN_ALLOWANCE_PREMIUM_KG = 14;

/** Checked allowance by fare brand (weight concept, applied across the network). */
export const FARE_BRANDS = [
  { value: "economy-lite", label: "Economy Lite (25 kg)", kg: 25 },
  { value: "economy-value", label: "Economy Value (30 kg)", kg: 30 },
  { value: "economy-standard", label: "Economy Standard (30 kg)", kg: 30 },
  { value: "economy-flexi", label: "Economy Flexi (35 kg)", kg: 35 },
  { value: "premium-economy", label: "Premium Economy (35 kg)", kg: 35 },
  { value: "business", label: "Business (40 kg)", kg: 40 },
  { value: "first", label: "First Class / Suites (50 kg)", kg: 50 },
  { value: "custom", label: "Custom — from my ticket", kg: null },
];

/**
 * Additional checked kilograms by loyalty tier. These are added to the fare brand allowance.
 * Elite Gold and PPS Club membership carry the well-known 20 kg bonus; enter your own figure if
 * your tier or partner status differs.
 */
export const TIER_BONUS_OPTIONS = [
  { value: "none", label: "No KrisFlyer tier benefit (+0 kg)", kg: 0 },
  { value: "elite-silver", label: "KrisFlyer Elite Silver (+10 kg)", kg: 10 },
  { value: "elite-gold", label: "KrisFlyer Elite Gold (+20 kg)", kg: 20 },
  { value: "pps", label: "PPS Club / Solitaire PPS (+20 kg)", kg: 20 },
];

/** Advance excess weight is sold per passenger in these blocks. */
export const PREPAID_BLOCKS_KG = [5, 10, 15, 20, 25, 30, 40];

/** Reference rates. Editable — replace with the quote shown on your booking. */
export const DEFAULT_AIRPORT_RATE_PER_KG = 30;
export const DEFAULT_ONLINE_RATE_PER_KG = 18;

export const CURRENCIES = [
  { code: "SGD", label: "SGD — Singapore dollar", locale: "en-SG" },
  { code: "USD", label: "USD — US dollar", locale: "en-US" },
  { code: "INR", label: "INR — Indian rupee", locale: "en-IN" },
  { code: "AUD", label: "AUD — Australian dollar", locale: "en-AU" },
  { code: "GBP", label: "GBP — pound sterling", locale: "en-GB" },
  { code: "EUR", label: "EUR — euro", locale: "en-IE" },
];

const MAX_TOTAL_WEIGHT_KG = 500;
const MAX_PASSENGERS = 9;
const MAX_RATE = 1000000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Smallest advance block that covers `kg`; null when `kg` is beyond the largest block. */
export function smallestBlockFor(kg, blocks = PREPAID_BLOCKS_KG) {
  if (!isNum(kg) || kg <= 0) return 0;
  const sorted = [...blocks].sort((a, b) => a - b);
  for (const block of sorted) if (block >= kg) return block;
  return null;
}

/**
 * @returns {{error:string}|object} allowance build-up, excess weight and the two purchase routes
 */
export function estimateExcessBaggage({
  totalCheckedKg,
  fareBrandKg,
  tierBonusKg = 0,
  passengers = 1,
  heaviestBagKg = 0,
  airportRatePerKg = DEFAULT_AIRPORT_RATE_PER_KG,
  onlineRatePerKg = DEFAULT_ONLINE_RATE_PER_KG,
  prepaidBlocksKg = PREPAID_BLOCKS_KG,
}) {
  const values = [
    totalCheckedKg,
    fareBrandKg,
    tierBonusKg,
    passengers,
    heaviestBagKg,
    airportRatePerKg,
    onlineRatePerKg,
  ];
  if (!values.every(isNum)) return { error: "Enter a number in every field." };

  if (!Number.isInteger(passengers) || passengers < 1 || passengers > MAX_PASSENGERS) {
    return { error: `Passengers must be a whole number from 1 to ${MAX_PASSENGERS}.` };
  }
  if (totalCheckedKg < 0 || heaviestBagKg < 0) return { error: "Baggage weight cannot be negative." };
  if (totalCheckedKg > MAX_TOTAL_WEIGHT_KG) {
    return { error: `Checked weight above ${MAX_TOTAL_WEIGHT_KG} kg is cargo, not baggage.` };
  }
  if (heaviestBagKg > totalCheckedKg) {
    return { error: "The heaviest single bag cannot weigh more than all the bags together." };
  }
  if (fareBrandKg < 0 || fareBrandKg > 150) {
    return { error: "The fare brand allowance should be between 0 kg and 150 kg." };
  }
  if (tierBonusKg < 0 || tierBonusKg > 60) {
    return { error: "A tier bonus should be between 0 kg and 60 kg." };
  }
  if (airportRatePerKg < 0 || onlineRatePerKg < 0) {
    return { error: "Per-kilogram rates cannot be negative." };
  }
  if (airportRatePerKg > MAX_RATE || onlineRatePerKg > MAX_RATE) {
    return { error: "Check the per-kilogram rates — those look far too high." };
  }

  const blocks = [...prepaidBlocksKg].filter((b) => isNum(b) && b > 0).sort((a, b) => a - b);
  const largestBlock = blocks.length ? blocks[blocks.length - 1] : 0;

  const allowancePerPassengerKg = fareBrandKg + tierBonusKg;
  const totalAllowanceKg = allowancePerPassengerKg * passengers;

  const rawExcessKg = Math.max(0, totalCheckedKg - totalAllowanceKg);
  const chargeableExcessKg = Math.ceil(Number(rawExcessKg.toFixed(6)));
  const airportCost = chargeableExcessKg * airportRatePerKg;

  const perPassengerExcessKg = Math.ceil(chargeableExcessKg / passengers);
  const blockPerPassengerKg =
    chargeableExcessKg === 0 ? 0 : (smallestBlockFor(perPassengerExcessKg, blocks) ?? largestBlock);
  const onlineKgBought = blockPerPassengerKg * passengers;
  const onlineBlockCost = onlineKgBought * onlineRatePerKg;
  const uncoveredKg = Math.max(0, chargeableExcessKg - onlineKgBought);
  const airportTopUpCost = uncoveredKg * airportRatePerKg;
  const onlineTotalCost = onlineBlockCost + airportTopUpCost;

  const saving = airportCost - onlineTotalCost;
  const savingPct = airportCost > 0 ? (saving / airportCost) * 100 : 0;
  const cheapestOption = chargeableExcessKg === 0 ? "none" : saving > 0 ? "online" : "airport";
  const cheapestCost = chargeableExcessKg === 0 ? 0 : Math.min(airportCost, onlineTotalCost);

  const warnings = [];
  if (chargeableExcessKg === 0) {
    warnings.push(
      `Inside the ${totalAllowanceKg} kg allowance${tierBonusKg > 0 ? ` (including the ${tierBonusKg} kg tier bonus)` : ""}. Nothing to pay.`,
    );
  }
  if (tierBonusKg > 0 && chargeableExcessKg > 0) {
    warnings.push(
      `The ${tierBonusKg} kg tier bonus per passenger has already been added — without it the excess would be ${chargeableExcessKg + tierBonusKg * passengers} kg.`,
    );
  }
  if (heaviestBagKg > MAX_SINGLE_PIECE_KG) {
    warnings.push(
      `A ${heaviestBagKg} kg piece is refused at check-in — ${MAX_SINGLE_PIECE_KG} kg is the ceiling for any one bag, no matter how much excess you buy.`,
    );
  }
  if (uncoveredKg > 0) {
    warnings.push(
      `Advance blocks stop at ${largestBlock} kg per passenger, so ${uncoveredKg} kg is settled at the airport.`,
    );
  }
  if (saving < 0 && chargeableExcessKg > 0) {
    warnings.push(
      `Advance weight is sold in ${blocks.join(", ")} kg blocks. Buying ${blockPerPassengerKg} kg to cover ${perPassengerExcessKg} kg costs more than paying at the airport.`,
    );
  }

  return {
    passengers,
    fareBrandKg,
    tierBonusKg,
    allowancePerPassengerKg,
    totalAllowanceKg,
    totalCheckedKg,
    rawExcessKg,
    chargeableExcessKg,
    airportRatePerKg,
    airportCost,
    onlineRatePerKg,
    blockPerPassengerKg,
    onlineKgBought,
    onlineBlockCost,
    uncoveredKg,
    airportTopUpCost,
    onlineTotalCost,
    unusedBlockKg: Math.max(0, onlineKgBought - chargeableExcessKg),
    saving,
    savingPct,
    cheapestOption,
    cheapestCost,
    effectivePerKg: chargeableExcessKg > 0 ? cheapestCost / chargeableExcessKg : 0,
    warnings,
  };
}

/** Price ladder for every advance block, for the comparison table in the UI. */
export function buildBlockLadder({
  airportRatePerKg = DEFAULT_AIRPORT_RATE_PER_KG,
  onlineRatePerKg = DEFAULT_ONLINE_RATE_PER_KG,
  prepaidBlocksKg = PREPAID_BLOCKS_KG,
} = {}) {
  if (!isNum(airportRatePerKg) || !isNum(onlineRatePerKg)) return [];
  return [...prepaidBlocksKg]
    .filter((b) => isNum(b) && b > 0)
    .sort((a, b) => a - b)
    .map((block) => ({
      blockKg: block,
      onlineCost: block * onlineRatePerKg,
      airportCost: block * airportRatePerKg,
      saving: block * (airportRatePerKg - onlineRatePerKg),
    }));
}
