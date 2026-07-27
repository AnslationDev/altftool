/**
 * Liquid volume conversion for travel: toiletries, medicines and drinks.
 *
 * Every factor below is exact rather than rounded, because each unit is defined in
 * terms of the litre or the inch:
 *   - US gallon = 231 cubic inches with 1 inch = 2.54 cm exactly, so 3.785411784 L,
 *     and a US fluid ounce is 1/128 of that = 29.5735295625 ml.
 *   - Imperial gallon = 4.54609 L exactly (UK Weights and Measures Act 1985), and an
 *     imperial fluid ounce is 1/160 of that = 28.4130625 ml.
 *   - The US "legal" cup used on nutrition labels is defined as exactly 240 ml, while
 *     the customary cup used in recipes is 8 US fl oz = 236.5882365 ml.
 *   - The metric cup used in Australia and New Zealand is exactly 250 ml.
 *
 * CABIN LIQUIDS: ICAO's guidance, and the rules in the EU, UK, India and most other
 * jurisdictions, cap each container at 100 ml, all of them carried in a single
 * transparent resealable bag of no more than 1 litre. The US TSA states the same rule
 * as "3.4 ounces (100 millilitres)" in a quart-sized bag — note that 3.4 US fl oz is
 * actually 100.55 ml, so a bottle labelled 3.4 oz is marginally over a strict 100 ml
 * limit even though it is the accepted figure in the US.
 */

/** US fluid ounce: 1/128 of a 3.785411784 L gallon. */
export const ML_PER_US_FLOZ = 29.5735295625;
/** Imperial fluid ounce: 1/160 of a 4.54609 L gallon. */
export const ML_PER_IMPERIAL_FLOZ = 28.4130625;
/** US customary cup: 8 US fluid ounces. */
export const ML_PER_US_CUP = 8 * ML_PER_US_FLOZ; // 236.5882365
/** US "legal" cup used on nutrition labels, defined as exactly 240 ml. */
export const ML_PER_US_LEGAL_CUP = 240;
/** Metric cup (Australia, New Zealand), exactly 250 ml. */
export const ML_PER_METRIC_CUP = 250;
/** Imperial cup: 10 imperial fluid ounces. */
export const ML_PER_IMPERIAL_CUP = 10 * ML_PER_IMPERIAL_FLOZ; // 284.130625
/** US teaspoon: 1/6 US fluid ounce. */
export const ML_PER_US_TEASPOON = ML_PER_US_FLOZ / 6; // 4.92892159375
/** US tablespoon: 1/2 US fluid ounce. */
export const ML_PER_US_TABLESPOON = ML_PER_US_FLOZ / 2; // 14.78676478125
/** Metric spoons used in most cookbooks outside the US. */
export const ML_PER_METRIC_TEASPOON = 5;
export const ML_PER_METRIC_TABLESPOON = 15;
/** US liquid pint: 16 US fluid ounces. */
export const ML_PER_US_PINT = 16 * ML_PER_US_FLOZ;
/** Imperial pint: 20 imperial fluid ounces. */
export const ML_PER_IMPERIAL_PINT = 20 * ML_PER_IMPERIAL_FLOZ; // 568.26125

export const VOLUME_UNITS = [
  { key: "ml", label: "Millilitres (ml)", ml: 1 },
  { key: "l", label: "Litres (l)", ml: 1000 },
  { key: "usFlOz", label: "US fluid ounces", ml: ML_PER_US_FLOZ },
  { key: "impFlOz", label: "Imperial fluid ounces", ml: ML_PER_IMPERIAL_FLOZ },
  { key: "usCup", label: "US cups (recipe, 8 fl oz)", ml: ML_PER_US_CUP },
  { key: "usLegalCup", label: "US cups (nutrition label, 240 ml)", ml: ML_PER_US_LEGAL_CUP },
  { key: "metricCup", label: "Metric cups (250 ml)", ml: ML_PER_METRIC_CUP },
  { key: "impCup", label: "Imperial cups (10 imp fl oz)", ml: ML_PER_IMPERIAL_CUP },
  { key: "usTbsp", label: "US tablespoons", ml: ML_PER_US_TABLESPOON },
  { key: "usTsp", label: "US teaspoons", ml: ML_PER_US_TEASPOON },
  { key: "metricTbsp", label: "Metric tablespoons (15 ml)", ml: ML_PER_METRIC_TABLESPOON },
  { key: "metricTsp", label: "Metric teaspoons (5 ml)", ml: ML_PER_METRIC_TEASPOON },
  { key: "usPint", label: "US pints", ml: ML_PER_US_PINT },
  { key: "impPint", label: "Imperial pints", ml: ML_PER_IMPERIAL_PINT },
];

/** Cabin liquids: maximum container size, in millilitres. */
export const CABIN_CONTAINER_LIMIT_ML = 100;
/** Cabin liquids: maximum total capacity of the transparent bag, in millilitres. */
export const CABIN_BAG_LIMIT_ML = 1000;
/** The TSA's stated figure, which is marginally more than 100 ml. */
export const TSA_STATED_FLOZ = 3.4;

/** Above 20 litres this is not a travel container. */
export const MAX_VOLUME_ML = 20000;

export function unitByKey(key) {
  return VOLUME_UNITS.find((entry) => entry.key === key) ?? null;
}

/**
 * Convert one volume into every listed unit.
 *
 * @param {object} input
 * @param {number} input.value
 * @param {string} input.unit one of VOLUME_UNITS keys
 * @returns {{error:string}|{ml:number,values:object,unit:string}}
 */
export function convertVolume({ value, unit = "ml" }) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return { error: "Enter the volume as a number." };
  if (amount <= 0) return { error: "Volume must be greater than zero." };

  const from = unitByKey(unit);
  if (!from) return { error: "Pick a unit to convert from." };

  const ml = amount * from.ml;
  if (ml > MAX_VOLUME_ML) {
    return { error: `Over ${MAX_VOLUME_ML / 1000} litres is not a travel container — check the number and the unit.` };
  }

  const values = {};
  for (const entry of VOLUME_UNITS) {
    values[entry.key] = ml / entry.ml;
  }

  return { unit, ml, litres: ml / 1000, values };
}

/**
 * Cabin-liquid verdict for one container size, and for a set of them in the bag.
 *
 * @param {object} input
 * @param {number} input.containerMl size of a single container, in ml
 * @param {number} input.containerCount how many identical containers you are carrying
 * @returns {{error:string}|object}
 */
export function cabinLiquidCheck({ containerMl, containerCount = 1 }) {
  const size = Number(containerMl);
  const count = Number(containerCount);
  if (!Number.isFinite(size) || size <= 0) return { error: "Container size must be greater than zero." };
  if (!Number.isFinite(count) || count < 1) return { error: "You need at least one container." };
  if (count > 100) return { error: "More than 100 containers is not a hand-baggage question." };

  const whole = Math.floor(count);
  const totalMl = size * whole;
  const containerOk = size <= CABIN_CONTAINER_LIMIT_ML;
  const bagOk = totalMl <= CABIN_BAG_LIMIT_ML;

  return {
    containerMl: size,
    containerCount: whole,
    totalMl,
    containerOk,
    bagOk,
    containerHeadroomMl: CABIN_CONTAINER_LIMIT_ML - size,
    bagHeadroomMl: CABIN_BAG_LIMIT_ML - totalMl,
    /** How many 100 ml containers the 1 litre bag can hold at that size. */
    maxContainersInBag: size > 0 ? Math.floor(CABIN_BAG_LIMIT_ML / size) : 0,
    verdict: containerOk
      ? bagOk
        ? "Fits the cabin liquids rule"
        : "Each bottle is fine, but the total exceeds a 1 litre bag"
      : "Over the 100 ml per-container limit",
  };
}
