/**
 * Volume conversion between litres and the two different gallons, plus the
 * price of one unit derived from the price of another.
 *
 * The two gallons are not the same size, which is the whole point of the tool:
 *
 *   US liquid gallon = 231 cubic inches exactly. With the inch defined as
 *   25.4 mm, 231 in3 = 3.785411784 L exactly.
 *
 *   Imperial gallon = 4.54609 L exactly, fixed by the UK Weights and Measures
 *   Act 1985 (it was previously defined as the volume of 10 lb of water).
 *
 * So 1 US gallon = 0.8327 imperial gallons, and 1 imperial gallon = 1.2009 US
 * gallons — a 20% difference that quietly wrecks fuel-economy comparisons.
 */

/** US liquid gallon: 231 in3 x (0.0254 m)^3 = 3.785411784 L exactly. */
export const LITRES_PER_US_GALLON = 3.785411784;

/** Imperial gallon: defined as exactly 4.54609 L (UK Weights and Measures Act 1985). */
export const LITRES_PER_IMP_GALLON = 4.54609;

/** Every unit expressed as litres, so conversion is one multiply and one divide. */
export const UNITS = [
  { id: "l", label: "Litres (L)", short: "L", litres: 1 },
  { id: "ml", label: "Millilitres (mL)", short: "mL", litres: 0.001 },
  { id: "usgal", label: "US gallons", short: "US gal", litres: LITRES_PER_US_GALLON },
  { id: "impgal", label: "Imperial (UK) gallons", short: "imp gal", litres: LITRES_PER_IMP_GALLON },
  { id: "usqt", label: "US quarts", short: "US qt", litres: LITRES_PER_US_GALLON / 4 },
  { id: "impqt", label: "Imperial quarts", short: "imp qt", litres: LITRES_PER_IMP_GALLON / 4 },
  { id: "uspt", label: "US pints", short: "US pt", litres: LITRES_PER_US_GALLON / 8 },
  { id: "imppt", label: "Imperial pints", short: "imp pt", litres: LITRES_PER_IMP_GALLON / 8 },
  { id: "usoz", label: "US fluid ounces", short: "US fl oz", litres: LITRES_PER_US_GALLON / 128 },
  { id: "impoz", label: "Imperial fluid ounces", short: "imp fl oz", litres: LITRES_PER_IMP_GALLON / 160 },
  { id: "m3", label: "Cubic metres (m3)", short: "m3", litres: 1000 },
  { id: "cft", label: "Cubic feet (cft)", short: "cft", litres: 28.316846592 },
];

/** Largest quantity accepted, to keep the output readable. */
export const MAX_VOLUME_LITRES = 1e9;

export function unitById(id) {
  return UNITS.find((u) => u.id === id) ?? null;
}

/**
 * @param {object} input
 * @param {number} input.value        Quantity entered.
 * @param {string} input.fromUnit     Unit id the quantity is in.
 * @param {number} [input.pricePerUnit] Optional price of one "fromUnit".
 * @returns {object} { litres, byUnit, prices } or { error }.
 */
export function convertVolume({ value, fromUnit = "l", pricePerUnit = 0 }) {
  const qty = Number(value);
  const price = Number(pricePerUnit);
  const unit = unitById(fromUnit);

  if (!unit) return { error: "Choose a unit to convert from." };
  if (!Number.isFinite(qty)) return { error: "Enter a valid quantity." };
  if (!Number.isFinite(price) || price < 0) return { error: "Price cannot be negative." };
  if (qty < 0) return { error: "Volume cannot be negative." };

  const litres = qty * unit.litres;
  if (litres > MAX_VOLUME_LITRES) {
    return { error: "That is larger than this converter handles — try a smaller quantity." };
  }

  const byUnit = {};
  const prices = {};
  for (const u of UNITS) {
    byUnit[u.id] = litres / u.litres;
    // Price scales with the size of the unit: a bigger unit costs proportionally more.
    prices[u.id] = price > 0 ? (price / unit.litres) * u.litres : 0;
  }

  return {
    litres,
    byUnit,
    prices,
    pricePerLitre: price > 0 ? price / unit.litres : 0,
    totalCost: price > 0 ? price * qty : 0,
    usPerImp: LITRES_PER_IMP_GALLON / LITRES_PER_US_GALLON,
    impPerUs: LITRES_PER_US_GALLON / LITRES_PER_IMP_GALLON,
    fromUnit: unit,
  };
}
