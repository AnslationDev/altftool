/**
 * British Airways excess baggage cost estimator.
 *
 * British Airways charges by the *piece*, not by the kilogram, and that changes
 * the arithmetic completely. Three separate things attract a charge and each is
 * billed per bag:
 *
 *   1. Extra bag   — a checked piece beyond the number your fare includes.
 *   2. Heavy bag   — a piece over its weight ceiling: 23 kg in economy cabins,
 *                    32 kg in Club and First. Nothing over 32 kg is accepted at
 *                    all, whatever you pay, because it is a manual-handling limit.
 *   3. Oversize bag — a piece outside 90 × 75 × 43 cm, measured with wheels and
 *                    handles included.
 *
 * Every one of those is cheaper when bought in Manage My Booking before you reach
 * the airport than when paid for at the check-in desk, so this module prices both
 * channels on the same bags and reports the saving.
 *
 * Because the charge is per bag rather than per kilo, redistributing weight can be
 * free money: two bags of 26 kg and 18 kg on a 23 kg ceiling incur one heavy-bag
 * charge, while 22 kg and 22 kg incurs none. The estimator detects that case and
 * says so.
 *
 * All fee amounts are inputs. British Airways prices extra and heavy bags by route
 * band and revises the table, so nothing is treated as a fixed price — the numbers
 * shipped as defaults are round reference figures to be replaced with the amounts
 * your own booking quotes.
 */

/** Airline identity, so the UI never hard-codes a name. */
export const AIRLINE = { name: "British Airways", code: "BA" };

/** Absolute manual-handling ceiling for a single checked piece. */
export const MAX_SINGLE_PIECE_KG = 32;

/** Checked piece size, measured including wheels and handles. */
export const MAX_PIECE_DIMS_CM = [90, 75, 43];

/** Cabin and fare rows: how many checked pieces are included, and each one's ceiling. */
export const CABIN_OPTIONS = [
  { key: "wt-1x23", label: "Euro Traveller / World Traveller — 1 × 23 kg", pieces: 1, perPieceKg: 23 },
  { key: "basic-0", label: "Basic hand baggage only — 0 checked bags", pieces: 0, perPieceKg: 23 },
  { key: "wtp-2x23", label: "World Traveller Plus — 2 × 23 kg", pieces: 2, perPieceKg: 23 },
  { key: "club-2x32", label: "Club Europe / Club World — 2 × 32 kg", pieces: 2, perPieceKg: 32 },
  { key: "first-3x32", label: "First — 3 × 32 kg", pieces: 3, perPieceKg: 32 },
];

/** The two ways to pay, cheapest first. */
export const CHANNELS = [
  { id: "online", label: "Prepaid in Manage My Booking" },
  { id: "airport", label: "Paid at the airport desk" },
];

/**
 * Reference fee defaults, in the selected currency. These are round placeholder
 * figures, not quoted prices: BA sets them by route band and changes the table,
 * so replace them with the amounts shown on your own booking.
 */
export const DEFAULT_FEES = {
  extraBagOnline: 65,
  extraBagAirport: 100,
  heavyBagOnline: 65,
  heavyBagAirport: 100,
  oversizeOnline: 65,
  oversizeAirport: 100,
};

/** Currencies the estimate can be shown in, with a locale for digit grouping. */
export const CURRENCIES = [
  { code: "GBP", locale: "en-GB", label: "GBP £" },
  { code: "EUR", locale: "en-IE", label: "EUR €" },
  { code: "USD", locale: "en-US", label: "USD $" },
  { code: "INR", locale: "en-IN", label: "INR ₹" },
  { code: "AED", locale: "en-AE", label: "AED د.إ" },
  { code: "AUD", locale: "en-AU", label: "AUD $" },
  { code: "ZAR", locale: "en-ZA", label: "ZAR R" },
];

export const DEFAULT_CURRENCY = "GBP";

/** Sanity ceilings so a typo cannot produce a meaningless "result". */
export const MAX_PASSENGERS = 9;
export const MAX_BAGS = 12;
const MAX_REASONABLE_BAG_KG = 150;
const MAX_REASONABLE_FEE = 100000;

const r2 = (n) => Math.round(n * 100) / 100;

function toNum(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const text = String(value ?? "").replace(/,/g, "").trim();
  // An empty field is missing input, not zero.
  if (text === "") return NaN;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function getCabin(key) {
  return CABIN_OPTIONS.find((option) => option.key === key) || null;
}

export function getCurrency(code) {
  return CURRENCIES.find((entry) => entry.code === code) || CURRENCIES[0];
}

/**
 * Estimate what a set of checked bags will cost on a British Airways booking.
 *
 * Pure: the same inputs always produce the same object. No clock, no network.
 * Invalid input returns { error } instead of a misleading figure.
 *
 * @param {object} input
 * @param {string} input.cabinKey        row from CABIN_OPTIONS
 * @param {number} input.passengers      travellers on the same booking, allowances pooled
 * @param {Array}  input.bagWeightsKg    weight of each checked bag
 * @param {number} input.oversizeBags    how many of those bags exceed 90 × 75 × 43 cm
 * @param {object} input.fees            per-bag charges for each channel
 * @returns {{error:string}|object}
 */
export function estimateBaggageCost({
  cabinKey = CABIN_OPTIONS[0].key,
  passengers = 1,
  bagWeightsKg = [],
  oversizeBags = 0,
  fees = DEFAULT_FEES,
} = {}) {
  const cabin = getCabin(cabinKey);
  if (!cabin) return { error: "Choose the cabin or fare printed on your ticket." };

  const pax = toNum(passengers);
  if (Number.isNaN(pax)) return { error: "Enter how many passengers are on the booking." };
  if (!Number.isInteger(pax) || pax < 1 || pax > MAX_PASSENGERS) {
    return { error: `Passengers must be a whole number from 1 to ${MAX_PASSENGERS}.` };
  }

  if (!Array.isArray(bagWeightsKg)) return { error: "Checked bags must be a list of weights." };
  if (bagWeightsKg.length > MAX_BAGS) return { error: `Price up to ${MAX_BAGS} checked bags at a time.` };

  const weights = [];
  for (let index = 0; index < bagWeightsKg.length; index += 1) {
    const kg = toNum(bagWeightsKg[index]);
    if (Number.isNaN(kg)) return { error: `Weight of bag ${index + 1} must be a number in kilograms.` };
    if (kg < 0) return { error: `Weight of bag ${index + 1} cannot be negative.` };
    if (kg > MAX_REASONABLE_BAG_KG) {
      return { error: `Weight of bag ${index + 1} looks wrong — enter kilograms, not grams.` };
    }
    weights.push(r2(kg));
  }

  const oversize = toNum(oversizeBags);
  if (Number.isNaN(oversize)) return { error: "Enter how many bags are outside the size limit (0 if none)." };
  if (!Number.isInteger(oversize) || oversize < 0) {
    return { error: "Oversize bags must be a whole number, zero or more." };
  }
  if (oversize > weights.length) {
    return { error: "You cannot have more oversize bags than bags." };
  }

  const feeEntries = [
    ["extraBagOnline", "prepaid extra bag"],
    ["extraBagAirport", "airport extra bag"],
    ["heavyBagOnline", "prepaid heavy bag"],
    ["heavyBagAirport", "airport heavy bag"],
    ["oversizeOnline", "prepaid oversize bag"],
    ["oversizeAirport", "airport oversize bag"],
  ];
  const fee = {};
  for (const [key, label] of feeEntries) {
    const value = toNum(fees ? fees[key] : NaN);
    if (Number.isNaN(value)) return { error: `Enter the ${label} charge, or 0 if it does not apply.` };
    if (value < 0) return { error: `The ${label} charge cannot be negative.` };
    if (value > MAX_REASONABLE_FEE) return { error: `The ${label} charge looks far too high — check the figure.` };
    fee[key] = r2(value);
  }

  /* -------------------------------------------------------- what is chargeable */
  const bagCount = weights.length;
  const includedPieces = cabin.pieces * pax;
  const extraBags = Math.max(0, bagCount - includedPieces);

  const refusedBags = weights.filter((kg) => kg > MAX_SINGLE_PIECE_KG).length;
  // A heavy bag is over the fare's ceiling but still inside the 32 kg limit; a bag
  // beyond 32 kg is not a chargeable heavy bag, it is simply not accepted.
  const heavyBags = weights.filter((kg) => kg > cabin.perPieceKg && kg <= MAX_SINGLE_PIECE_KG).length;

  const totalKg = r2(weights.reduce((sum, kg) => sum + kg, 0));
  const capacityKg = r2(bagCount * cabin.perPieceKg);

  /* ------------------------------------------- can repacking remove heavy fees? */
  // If the bags hold less in total than their combined ceilings, and none is over
  // the hard 32 kg limit, evening out the weight removes every heavy-bag charge.
  const canRepackAway = heavyBags > 0 && refusedBags === 0 && totalKg <= capacityKg;
  const heavyBagsAfterRepack = canRepackAway ? 0 : heavyBags;

  /* --------------------------------------------------------------- the channels */
  const priceChannel = (id, label, extraFee, heavyFee, oversizeFee, heavyCount) => {
    const extraBagCost = r2(extraBags * extraFee);
    const heavyBagCost = r2(heavyCount * heavyFee);
    const oversizeCost = r2(oversize * oversizeFee);
    return {
      id,
      label,
      extraBags,
      heavyBags: heavyCount,
      oversizeBags: oversize,
      extraBagFee: extraFee,
      heavyBagFee: heavyFee,
      oversizeFee,
      extraBagCost,
      heavyBagCost,
      oversizeCost,
      total: r2(extraBagCost + heavyBagCost + oversizeCost),
    };
  };

  const channels = [
    priceChannel("online", CHANNELS[0].label, fee.extraBagOnline, fee.heavyBagOnline, fee.oversizeOnline, heavyBags),
    priceChannel(
      "airport",
      CHANNELS[1].label,
      fee.extraBagAirport,
      fee.heavyBagAirport,
      fee.oversizeAirport,
      heavyBags,
    ),
  ];

  const chargeableItems = extraBags + heavyBags + oversize;
  const cheapest = channels.reduce((best, item) => (item.total < best.total ? item : best), channels[0]);
  const airport = channels.find((item) => item.id === "airport");
  const savingVsAirport = r2(airport.total - cheapest.total);
  const savingPct = airport.total > 0 ? r2((savingVsAirport / airport.total) * 100) : 0;

  /* --------------------------------- what the same bags cost once evened out */
  const repackedOnline = priceChannel(
    "online",
    CHANNELS[0].label,
    fee.extraBagOnline,
    fee.heavyBagOnline,
    fee.oversizeOnline,
    heavyBagsAfterRepack,
  );
  const repackSaving = r2(channels[0].total - repackedOnline.total);

  /* -------------------------------------------------------------------- notes */
  const warnings = [];
  if (chargeableItems === 0) {
    warnings.push(
      `All ${bagCount} bag${bagCount === 1 ? "" : "s"} are inside the ${includedPieces}-piece allowance for ${pax} passenger${pax === 1 ? "" : "s"}. Nothing to pay.`,
    );
  }
  if (refusedBags > 0) {
    warnings.push(
      `${refusedBags} bag${refusedBags === 1 ? " is" : "s are"} over ${MAX_SINGLE_PIECE_KG} kg and will not be accepted at any price — repack before you travel.`,
    );
  }
  if (canRepackAway) {
    warnings.push(
      `Your ${bagCount} bags weigh ${totalKg} kg against a combined ceiling of ${capacityKg} kg, so evening out the weight removes ${heavyBags} heavy-bag charge${heavyBags === 1 ? "" : "s"}.`,
    );
  }
  if (extraBags > 0 && cabin.pieces === 0) {
    warnings.push("This fare includes no checked baggage, so every bag is charged as an extra piece.");
  }
  if (oversize > 0) {
    warnings.push(
      `Bags outside ${MAX_PIECE_DIMS_CM.join(" × ")} cm are charged separately and some sizes must be booked in advance as outsize baggage.`,
    );
  }
  if (savingVsAirport <= 0 && chargeableItems > 0) {
    warnings.push("The two channels are priced the same here — check the prepaid amounts, which are usually lower.");
  }

  return {
    airline: AIRLINE,
    cabin: { key: cabin.key, label: cabin.label, pieces: cabin.pieces, perPieceKg: cabin.perPieceKg },
    passengers: pax,
    includedPieces,
    bagCount,
    weights,
    totalKg,
    capacityKg,
    extraBags,
    heavyBags,
    refusedBags,
    oversizeBags: oversize,
    chargeableItems,
    channels,
    cheapestId: cheapest.id,
    cheapestLabel: cheapest.label,
    cheapestCost: cheapest.total,
    airportCost: airport.total,
    savingVsAirport,
    savingPct,
    canRepackAway,
    repackSaving,
    repackedCost: repackedOnline.total,
    warnings,
  };
}
