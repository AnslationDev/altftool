/**
 * IndiGo (6E) excess baggage cost estimator.
 *
 * Rule implemented — the standard low-cost-carrier weight concept:
 *   1. Every passenger gets a free checked allowance in kilograms (the "free baggage allowance"
 *      printed on the ticket). Anything above it is "excess baggage".
 *   2. Excess presented at the airport is billed per kilogram at the counter rate. Departure
 *      control systems round a part kilogram UP to the next whole kilogram before charging.
 *   3. Excess bought in advance ("prepaid" / "excess baggage add-on") is NOT sold per kilogram.
 *      It is sold in fixed kilogram slabs per passenger at a lower per-kilogram rate, so the
 *      prepaid purchase has to be rounded UP to the next slab — which is exactly why a small
 *      overweight is sometimes cheaper to pay at the counter than to prepay.
 *   4. Anything beyond the largest prepaid slab still has to be paid for at the counter rate.
 *
 * Both rates are inputs, not fixed prices, because airline excess rates change with the fare
 * sheet and differ by sector and currency. The defaults below are the published domestic
 * reference figures and should be re-checked against the booking page before you rely on them.
 */

/**
 * Airport handling limit. A single piece heavier than 32 kg is refused at check-in on safety
 * grounds (manual-handling limit applied across the industry) and must be split into two bags.
 */
export const MAX_SINGLE_PIECE_KG = 32;

/** Free cabin baggage: one bag up to 7 kg plus one small personal item up to 3 kg. */
export const FREE_HAND_BAGGAGE_KG = 7;
export const FREE_PERSONAL_ITEM_KG = 3;

/**
 * Free checked allowance by fare / sector. "Custom" exists so you can type the exact figure
 * from your own ticket, which always beats any stored table.
 */
export const ALLOWANCE_OPTIONS = [
  { value: "domestic-regular", label: "Domestic — regular fare (15 kg)", kg: 15 },
  { value: "domestic-lite", label: "Domestic — hand-baggage-only fare (0 kg)", kg: 0 },
  { value: "international-20", label: "International — 20 kg sector", kg: 20 },
  { value: "international-25", label: "International — 25 kg sector", kg: 25 },
  { value: "international-30", label: "International — 30 kg sector", kg: 30 },
  { value: "custom", label: "Custom — from my ticket", kg: null },
];

/** Prepaid excess baggage is sold per passenger in these kilogram blocks. */
export const PREPAID_SLABS_KG = [3, 5, 10, 15, 20, 30];

/** Reference domestic rates (INR per kg). Editable — verify on the booking page. */
export const DEFAULT_AIRPORT_RATE_PER_KG = 550;
export const DEFAULT_PREPAID_RATE_PER_KG = 425;

/** Sanity ceilings so a typo cannot produce a meaningless answer. */
const MAX_TOTAL_WEIGHT_KG = 500;
const MAX_PASSENGERS = 9;
const MAX_RATE_PER_KG = 100000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Smallest slab that covers `kg`; null when `kg` is beyond the largest slab. */
export function smallestSlabFor(kg, slabs = PREPAID_SLABS_KG) {
  if (!isNum(kg) || kg <= 0) return 0;
  const sorted = [...slabs].sort((a, b) => a - b);
  for (const slab of sorted) if (slab >= kg) return slab;
  return null;
}

/**
 * @returns {{error:string}|object} excess weight, counter cost, prepaid cost and the cheaper option
 */
export function estimateExcessBaggage({
  totalCheckedKg,
  passengers = 1,
  allowanceKgPerPassenger,
  poolAllowance = true,
  heaviestBagKg = 0,
  airportRatePerKg = DEFAULT_AIRPORT_RATE_PER_KG,
  prepaidRatePerKg = DEFAULT_PREPAID_RATE_PER_KG,
  prepaidSlabsKg = PREPAID_SLABS_KG,
}) {
  const values = [
    totalCheckedKg,
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
  if (totalCheckedKg < 0 || heaviestBagKg < 0) {
    return { error: "Baggage weight cannot be negative." };
  }
  if (totalCheckedKg > MAX_TOTAL_WEIGHT_KG) {
    return { error: `Total checked weight above ${MAX_TOTAL_WEIGHT_KG} kg is cargo, not baggage.` };
  }
  if (heaviestBagKg > totalCheckedKg) {
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

  const totalAllowanceKg = allowanceKgPerPassenger * passengers;

  // Pooled: the whole party's bags are weighed against the whole party's allowance (permitted
  // for passengers travelling together on one booking). Not pooled: each passenger is assessed
  // on their own share, so one light bag cannot subsidise another passenger's heavy one.
  const rawExcessKg = poolAllowance
    ? Math.max(0, totalCheckedKg - totalAllowanceKg)
    : passengers * Math.max(0, totalCheckedKg / passengers - allowanceKgPerPassenger);

  // Airport systems bill on whole kilograms, rounding a part kilogram up.
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
      `Within the free allowance — ${totalAllowanceKg} kg for ${passengers} passenger${passengers > 1 ? "s" : ""}. Nothing to pay.`,
    );
  }
  if (heaviestBagKg > MAX_SINGLE_PIECE_KG) {
    warnings.push(
      `A single bag of ${heaviestBagKg} kg will be refused: no one piece may exceed ${MAX_SINGLE_PIECE_KG} kg. Split it into two bags.`,
    );
  }
  if (uncoveredKg > 0) {
    warnings.push(
      `Prepaid tops out at ${largestSlab} kg per passenger, so ${uncoveredKg} kg still has to be paid at the counter.`,
    );
  }
  if (saving < 0 && chargeableExcessKg > 0) {
    warnings.push(
      `Prepaid is sold in ${slabs.join(", ")} kg blocks. Buying ${slabPerPassengerKg} kg to cover ${perPassengerExcessKg} kg costs more than simply paying at the counter.`,
    );
  }
  if (!poolAllowance && passengers > 1) {
    warnings.push("Assessed per passenger with the weight split evenly across the party.");
  }

  return {
    passengers,
    allowanceKgPerPassenger,
    totalAllowanceKg,
    totalCheckedKg,
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
    freeCabinKg: FREE_HAND_BAGGAGE_KG + FREE_PERSONAL_ITEM_KG,
    warnings,
  };
}

/** Price ladder for every prepaid slab, for the comparison table in the UI. */
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
