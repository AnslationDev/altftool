/**
 * Akasa Air (QP) excess baggage cost estimator.
 *
 * Rules implemented:
 *   1. Weight concept. Every passenger has a free checked allowance in kilograms; the weight
 *      above it is excess baggage.
 *   2. Extra baggage is sold through three channels, and the per-kilogram price rises the later
 *      you buy: cheapest when added at booking, dearer when added at web check-in, dearest when
 *      weighed at the airport counter. This module prices all three and picks the lowest.
 *   3. The two advance channels sell weight in fixed kilogram blocks per passenger, so the
 *      purchase is rounded UP to the next block. The counter bills per kilogram with a part
 *      kilogram rounded UP to the next whole kilogram.
 *   4. Weight beyond the largest block still has to be settled at the counter rate.
 *
 * Rates are inputs, not fixed prices — they change with the fare sheet and by sector. The
 * defaults are domestic reference figures; re-check them on the booking page.
 */

/** A single piece over 32 kg is refused at check-in (industry manual-handling limit). */
export const MAX_SINGLE_PIECE_KG = 32;

/** Free cabin baggage: one bag up to 7 kg plus one personal item up to 3 kg. */
export const CABIN_BAG_LIMIT_KG = 7;
export const PERSONAL_ITEM_LIMIT_KG = 3;

export const ALLOWANCE_OPTIONS = [
  { value: "domestic-15", label: "Domestic economy (15 kg)", kg: 15 },
  { value: "international-30", label: "International — 30 kg sector", kg: 30 },
  { value: "international-25", label: "International — 25 kg sector", kg: 25 },
  { value: "international-20", label: "International — 20 kg sector", kg: 20 },
  { value: "infant", label: "Infant without a seat (0 kg)", kg: 0 },
  { value: "custom", label: "Custom — from my ticket", kg: null },
];

/** Advance extra baggage is sold per passenger in these kilogram blocks. */
export const PREPAID_SLABS_KG = [3, 5, 10, 15, 20, 30];

/** Reference domestic rates (INR per kg). Editable — verify on the booking page. */
export const DEFAULT_BOOKING_RATE_PER_KG = 425;
export const DEFAULT_WEB_CHECKIN_RATE_PER_KG = 475;
export const DEFAULT_COUNTER_RATE_PER_KG = 550;

const MAX_TOTAL_WEIGHT_KG = 500;
const MAX_PASSENGERS = 9;
const MAX_RATE_PER_KG = 100000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Smallest block that covers `kg`; null when `kg` is beyond the largest block. */
export function smallestSlabFor(kg, slabs = PREPAID_SLABS_KG) {
  if (!isNum(kg) || kg <= 0) return 0;
  const sorted = [...slabs].sort((a, b) => a - b);
  for (const slab of sorted) if (slab >= kg) return slab;
  return null;
}

/**
 * @returns {{error:string}|object} the excess weight and its cost through each buying channel
 */
export function estimateExcessBaggage({
  totalCheckedKg,
  passengers = 1,
  allowanceKgPerPassenger,
  poolAllowance = true,
  heaviestBagKg = 0,
  bookingRatePerKg = DEFAULT_BOOKING_RATE_PER_KG,
  webCheckinRatePerKg = DEFAULT_WEB_CHECKIN_RATE_PER_KG,
  counterRatePerKg = DEFAULT_COUNTER_RATE_PER_KG,
  prepaidSlabsKg = PREPAID_SLABS_KG,
}) {
  const values = [
    totalCheckedKg,
    passengers,
    allowanceKgPerPassenger,
    heaviestBagKg,
    bookingRatePerKg,
    webCheckinRatePerKg,
    counterRatePerKg,
  ];
  if (!values.every(isNum)) return { error: "Enter a number in every field." };

  if (!Number.isInteger(passengers) || passengers < 1 || passengers > MAX_PASSENGERS) {
    return { error: `Passengers must be a whole number from 1 to ${MAX_PASSENGERS}.` };
  }
  if (totalCheckedKg < 0 || heaviestBagKg < 0) {
    return { error: "Baggage weight cannot be negative." };
  }
  if (totalCheckedKg > MAX_TOTAL_WEIGHT_KG) {
    return { error: `Checked weight above ${MAX_TOTAL_WEIGHT_KG} kg is cargo, not baggage.` };
  }
  if (heaviestBagKg > totalCheckedKg) {
    return { error: "The heaviest single bag cannot weigh more than all the bags together." };
  }
  if (allowanceKgPerPassenger < 0 || allowanceKgPerPassenger > 100) {
    return { error: "Free allowance should be between 0 kg and 100 kg per passenger." };
  }
  if ([bookingRatePerKg, webCheckinRatePerKg, counterRatePerKg].some((rate) => rate < 0)) {
    return { error: "Per-kilogram rates cannot be negative." };
  }
  if ([bookingRatePerKg, webCheckinRatePerKg, counterRatePerKg].some((r) => r > MAX_RATE_PER_KG)) {
    return { error: "Check the per-kilogram rates — those look far too high." };
  }

  const slabs = [...prepaidSlabsKg].filter((slab) => isNum(slab) && slab > 0).sort((a, b) => a - b);
  const largestSlab = slabs.length ? slabs[slabs.length - 1] : 0;

  const totalAllowanceKg = allowanceKgPerPassenger * passengers;
  const rawExcessKg = poolAllowance
    ? Math.max(0, totalCheckedKg - totalAllowanceKg)
    : passengers * Math.max(0, totalCheckedKg / passengers - allowanceKgPerPassenger);

  const chargeableExcessKg = Math.ceil(Number(rawExcessKg.toFixed(6)));

  const perPassengerExcessKg = Math.ceil(chargeableExcessKg / passengers);
  const slabPerPassengerKg =
    chargeableExcessKg === 0 ? 0 : (smallestSlabFor(perPassengerExcessKg, slabs) ?? largestSlab);
  const prepaidKgBought = slabPerPassengerKg * passengers;
  const uncoveredKg = Math.max(0, chargeableExcessKg - prepaidKgBought);
  const counterTopUpCost = uncoveredKg * counterRatePerKg;

  const advanceChannel = (id, label, ratePerKg) => {
    const blockCost = prepaidKgBought * ratePerKg;
    return {
      id,
      label,
      ratePerKg,
      soldInBlocks: true,
      kgBought: prepaidKgBought,
      blockCost,
      topUpKg: uncoveredKg,
      topUpCost: counterTopUpCost,
      total: blockCost + counterTopUpCost,
    };
  };

  const counterCost = chargeableExcessKg * counterRatePerKg;
  const channels = [
    advanceChannel("booking", "Added at booking", bookingRatePerKg),
    advanceChannel("web-checkin", "Added at web check-in", webCheckinRatePerKg),
    {
      id: "counter",
      label: "Weighed at the airport counter",
      ratePerKg: counterRatePerKg,
      soldInBlocks: false,
      kgBought: chargeableExcessKg,
      blockCost: counterCost,
      topUpKg: 0,
      topUpCost: 0,
      total: counterCost,
    },
  ];

  const cheapest =
    chargeableExcessKg === 0
      ? null
      : channels.reduce((best, item) => (item.total < best.total ? item : best), channels[0]);
  const cheapestCost = cheapest ? cheapest.total : 0;
  const savingVsCounter = counterCost - cheapestCost;
  const savingPct = counterCost > 0 ? (savingVsCounter / counterCost) * 100 : 0;

  const warnings = [];
  if (chargeableExcessKg === 0) {
    warnings.push(
      `Inside the free allowance of ${totalAllowanceKg} kg for ${passengers} passenger${passengers > 1 ? "s" : ""}. Nothing to pay.`,
    );
  }
  if (heaviestBagKg > MAX_SINGLE_PIECE_KG) {
    warnings.push(
      `A ${heaviestBagKg} kg single bag will not be accepted: the per-piece ceiling is ${MAX_SINGLE_PIECE_KG} kg. Repack into two bags.`,
    );
  }
  if (uncoveredKg > 0) {
    warnings.push(
      `Advance blocks stop at ${largestSlab} kg per passenger, so ${uncoveredKg} kg is settled at the counter whichever channel you use.`,
    );
  }
  if (cheapest && cheapest.id === "counter" && chargeableExcessKg > 0) {
    warnings.push(
      `Blocks are sold in ${slabs.join(", ")} kg steps. Buying ${slabPerPassengerKg} kg to cover ${perPassengerExcessKg} kg costs more than paying for ${chargeableExcessKg} kg at the counter.`,
    );
  }

  return {
    passengers,
    allowanceKgPerPassenger,
    totalAllowanceKg,
    totalCheckedKg,
    rawExcessKg,
    chargeableExcessKg,
    perPassengerExcessKg,
    slabPerPassengerKg,
    prepaidKgBought,
    uncoveredKg,
    channels,
    counterCost,
    cheapestId: cheapest ? cheapest.id : "none",
    cheapestLabel: cheapest ? cheapest.label : "No excess baggage",
    cheapestCost,
    savingVsCounter,
    savingPct,
    unusedBlockKg: Math.max(0, prepaidKgBought - chargeableExcessKg),
    effectivePerKg: chargeableExcessKg > 0 ? cheapestCost / chargeableExcessKg : 0,
    warnings,
  };
}
