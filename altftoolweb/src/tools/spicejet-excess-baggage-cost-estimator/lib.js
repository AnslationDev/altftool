/**
 * SpiceJet (SG) excess baggage cost estimator.
 *
 * Rules implemented:
 *   1. Weight concept. Each passenger has a free checked allowance in kilograms; everything
 *      above it is excess baggage.
 *   2. Cabin baggage is capped at 7 kg for one bag plus a small personal item. A cabin bag over
 *      the cap is not waved through — the gate makes you check it in, so the overweight portion
 *      lands on the checked scale and is charged there. This module folds that overage into the
 *      checked weight before pricing it.
 *   3. Excess weighed at the counter is billed per kilogram, with a part kilogram rounded UP to
 *      the next whole kilogram.
 *   4. Pre-booked (prepaid) baggage is sold per passenger in fixed kilogram blocks at a lower
 *      per-kilogram rate, so the purchase is rounded UP to the next block. Weight beyond the
 *      largest block still has to be paid for at the counter rate.
 *
 * Rates are inputs, not fixed prices: airline excess rates change with the fare sheet and differ
 * by sector. The defaults are the published domestic reference figures — re-check them on the
 * booking page.
 */

/** A single piece over 32 kg is refused at check-in (industry manual-handling limit). */
export const MAX_SINGLE_PIECE_KG = 32;

/** Free cabin baggage: one bag up to 7 kg plus one personal item up to 3 kg. */
export const CABIN_BAG_LIMIT_KG = 7;
export const PERSONAL_ITEM_LIMIT_KG = 3;

export const ALLOWANCE_OPTIONS = [
  { value: "domestic-15", label: "Domestic economy (15 kg)", kg: 15 },
  { value: "domestic-spicemax", label: "Domestic SpiceMax (20 kg)", kg: 20 },
  { value: "international-20", label: "International — 20 kg sector", kg: 20 },
  { value: "international-30", label: "International — 30 kg sector", kg: 30 },
  { value: "hand-only", label: "Hand-baggage-only fare (0 kg)", kg: 0 },
  { value: "custom", label: "Custom — from my ticket", kg: null },
];

/** Pre-booked baggage is sold per passenger in these kilogram blocks. */
export const PREPAID_SLABS_KG = [3, 5, 10, 15, 20, 30];

/** Reference domestic rates (INR per kg). Editable — verify on the booking page. */
export const DEFAULT_AIRPORT_RATE_PER_KG = 500;
export const DEFAULT_PREPAID_RATE_PER_KG = 400;

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
 * @returns {{error:string}|object} chargeable excess, counter cost, pre-booked cost, cheaper option
 */
export function estimateExcessBaggage({
  checkedKg,
  cabinBagKg = 0,
  passengers = 1,
  allowanceKgPerPassenger,
  poolAllowance = true,
  heaviestBagKg = 0,
  airportRatePerKg = DEFAULT_AIRPORT_RATE_PER_KG,
  prepaidRatePerKg = DEFAULT_PREPAID_RATE_PER_KG,
  prepaidSlabsKg = PREPAID_SLABS_KG,
}) {
  const values = [
    checkedKg,
    cabinBagKg,
    passengers,
    allowanceKgPerPassenger,
    heaviestBagKg,
    airportRatePerKg,
    prepaidRatePerKg,
  ];
  if (!values.every(isNum)) return { error: "Enter a number in every field." };

  if (!Number.isInteger(passengers) || passengers < 1 || passengers > MAX_PASSENGERS) {
    return { error: `Passengers must be a whole number from 1 to ${MAX_PASSENGERS}.` };
  }
  if (checkedKg < 0 || cabinBagKg < 0 || heaviestBagKg < 0) {
    return { error: "Baggage weight cannot be negative." };
  }
  if (checkedKg > MAX_TOTAL_WEIGHT_KG) {
    return { error: `Checked weight above ${MAX_TOTAL_WEIGHT_KG} kg is cargo, not baggage.` };
  }
  if (cabinBagKg > 50) {
    return { error: "A cabin bag over 50 kg is not a cabin bag — enter it as checked baggage." };
  }
  if (heaviestBagKg > checkedKg) {
    return { error: "The heaviest single bag cannot weigh more than all the bags together." };
  }
  if (allowanceKgPerPassenger < 0 || allowanceKgPerPassenger > 100) {
    return { error: "Free allowance should be between 0 kg and 100 kg per passenger." };
  }
  if (airportRatePerKg < 0 || prepaidRatePerKg < 0) {
    return { error: "Per-kilogram rates cannot be negative." };
  }
  if (airportRatePerKg > MAX_RATE_PER_KG || prepaidRatePerKg > MAX_RATE_PER_KG) {
    return { error: "Check the per-kilogram rates — those look far too high." };
  }

  const slabs = [...prepaidSlabsKg].filter((slab) => isNum(slab) && slab > 0).sort((a, b) => a - b);
  const largestSlab = slabs.length ? slabs[slabs.length - 1] : 0;

  // Cabin overage per passenger gets moved to the hold and charged as checked weight.
  const cabinOverageKgPerPassenger = Math.max(0, cabinBagKg - CABIN_BAG_LIMIT_KG);
  const cabinOverageKg = cabinOverageKgPerPassenger * passengers;
  const assessedCheckedKg = checkedKg + cabinOverageKg;

  const totalAllowanceKg = allowanceKgPerPassenger * passengers;
  const rawExcessKg = poolAllowance
    ? Math.max(0, assessedCheckedKg - totalAllowanceKg)
    : passengers * Math.max(0, assessedCheckedKg / passengers - allowanceKgPerPassenger);

  const chargeableExcessKg = Math.ceil(Number(rawExcessKg.toFixed(6)));
  const airportCost = chargeableExcessKg * airportRatePerKg;

  const perPassengerExcessKg = Math.ceil(chargeableExcessKg / passengers);
  const slabPerPassengerKg =
    chargeableExcessKg === 0 ? 0 : (smallestSlabFor(perPassengerExcessKg, slabs) ?? largestSlab);
  const prepaidKgBought = slabPerPassengerKg * passengers;
  const prepaidSlabCost = prepaidKgBought * prepaidRatePerKg;

  const uncoveredKg = Math.max(0, chargeableExcessKg - prepaidKgBought);
  const counterTopUpCost = uncoveredKg * airportRatePerKg;
  const prepaidTotalCost = prepaidSlabCost + counterTopUpCost;

  const saving = airportCost - prepaidTotalCost;
  const savingPct = airportCost > 0 ? (saving / airportCost) * 100 : 0;
  const cheapestOption = chargeableExcessKg === 0 ? "none" : saving > 0 ? "prepaid" : "airport";
  const cheapestCost = chargeableExcessKg === 0 ? 0 : Math.min(airportCost, prepaidTotalCost);

  const warnings = [];
  if (chargeableExcessKg === 0) {
    warnings.push(
      `Inside the free allowance of ${totalAllowanceKg} kg for ${passengers} passenger${passengers > 1 ? "s" : ""}. Nothing to pay.`,
    );
  }
  if (cabinOverageKgPerPassenger > 0) {
    warnings.push(
      `Cabin bag is ${cabinOverageKgPerPassenger} kg over the ${CABIN_BAG_LIMIT_KG} kg limit, so ${cabinOverageKg} kg has been added to the checked weight — that is what happens at the gate.`,
    );
  }
  if (heaviestBagKg > MAX_SINGLE_PIECE_KG) {
    warnings.push(
      `A ${heaviestBagKg} kg single bag will not be accepted: the per-piece ceiling is ${MAX_SINGLE_PIECE_KG} kg. Repack into two bags.`,
    );
  }
  if (uncoveredKg > 0) {
    warnings.push(
      `Pre-booked baggage stops at ${largestSlab} kg per passenger, leaving ${uncoveredKg} kg to settle at the counter.`,
    );
  }
  if (saving < 0 && chargeableExcessKg > 0) {
    warnings.push(
      `Blocks are sold in ${slabs.join(", ")} kg steps. Buying ${slabPerPassengerKg} kg to cover ${perPassengerExcessKg} kg works out dearer than paying at the counter.`,
    );
  }

  return {
    passengers,
    allowanceKgPerPassenger,
    totalAllowanceKg,
    checkedKg,
    cabinBagKg,
    cabinOverageKg,
    assessedCheckedKg,
    rawExcessKg,
    chargeableExcessKg,
    airportRatePerKg,
    airportCost,
    perPassengerExcessKg,
    slabPerPassengerKg,
    prepaidKgBought,
    prepaidRatePerKg,
    prepaidSlabCost,
    uncoveredKg,
    counterTopUpCost,
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

/** Price ladder for every pre-booked block, for the comparison table in the UI. */
export function buildSlabLadder({
  airportRatePerKg = DEFAULT_AIRPORT_RATE_PER_KG,
  prepaidRatePerKg = DEFAULT_PREPAID_RATE_PER_KG,
  prepaidSlabsKg = PREPAID_SLABS_KG,
} = {}) {
  if (!isNum(airportRatePerKg) || !isNum(prepaidRatePerKg)) return [];
  return [...prepaidSlabsKg]
    .filter((slab) => isNum(slab) && slab > 0)
    .sort((a, b) => a - b)
    .map((slab) => ({
      slabKg: slab,
      prepaidCost: slab * prepaidRatePerKg,
      airportCost: slab * airportRatePerKg,
      saving: slab * (airportRatePerKg - prepaidRatePerKg),
    }));
}
