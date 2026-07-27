/**
 * Silver investment return, from invoice to post-tax proceeds.
 *
 * Silver is quoted per kilogram, and the headline price move is never the return, because
 * the metal is bought above the quote and sold below it:
 *
 *   investment  = metal value + making or premium + GST + other buying costs
 *   proceeds    = sale value x (1 - buyback deduction) - selling costs
 *   gain        = proceeds - investment
 *   net         = proceeds - tax on the gain
 *   CAGR        = (net / investment)^(1 / years) - 1
 *
 * GST on a supply of silver is 3% (1.5% CGST plus 1.5% SGST), the same rate as gold, and on
 * an article supplied as a composite supply it applies to the metal and the making charge
 * together. That 3% plus a making charge and a buyback discount is why a 37% rise in the
 * silver price can leave a much smaller return in hand.
 *
 * The break-even sale price is the quote at which you get your money back:
 *
 *   break-even per kg = (investment + selling costs) / (kg x (1 - buyback deduction))
 *
 * The tax rate is an input, not a hardcoded assumption: capital gains rules and holding
 * periods for precious metals have been revised more than once recently, so enter the rate
 * that applies to your holding and confirm it before relying on the net figure.
 *
 * Dates are passed in — nothing here reads the system clock.
 */

/** GST on a supply of silver in India: 1.5% CGST plus 1.5% SGST. */
export const GST_ON_SILVER_PCT = 3;
/** Silver is quoted per kilogram. */
export const GRAMS_PER_KG = 1000;
/** Average days in a year including leap years, used to annualise a holding period. */
export const DAYS_PER_YEAR = 365.25;

export const MAX_KG = 10000;
export const MAX_TAX_PCT = 50;
const MS_PER_DAY = 86400000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

/** Math.round(-0.2) is -0, which formats as "-₹0"; collapse it to a plain zero. */
const noNegativeZero = (value) => (Object.is(value, -0) ? 0 : value);
const round0 = (value) => noNegativeZero(Math.round(value));
const round2 = (value) => noNegativeZero(Math.round(value * 100) / 100);

/** Parse a yyyy-mm-dd string into a UTC timestamp. Returns null if unusable. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value.trim())) return null;
  const [y, m, d] = value.trim().split("-").map(Number);
  const stamp = Date.UTC(y, m - 1, d);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
    return null;
  }
  return stamp;
}

/**
 * @param {object} input
 * @param {number|string} input.buyPricePerKg Silver quote per kg on the buying date.
 * @param {number|string} input.sellPricePerKg Silver quote per kg on the selling date.
 * @param {number|string} input.quantityKg Quantity in kilograms.
 * @param {string} input.buyDate yyyy-mm-dd of purchase.
 * @param {string} input.sellDate yyyy-mm-dd of sale.
 * @param {number|string} [input.makingChargePct] Making charge or premium, % of metal value.
 * @param {number|string} [input.gstPct] GST on the purchase.
 * @param {number|string} [input.otherBuyCosts] Delivery, insurance, assay and similar.
 * @param {number|string} [input.buybackDeductionPct] Discount to quote taken by the buyer.
 * @param {number|string} [input.sellCosts] Costs incurred to sell.
 * @param {number|string} [input.taxPct] Tax on the gain — enter your own applicable rate.
 */
export function computeSilverReturn({
  buyPricePerKg,
  sellPricePerKg,
  quantityKg,
  buyDate,
  sellDate,
  makingChargePct = 0,
  gstPct = GST_ON_SILVER_PCT,
  otherBuyCosts = 0,
  buybackDeductionPct = 0,
  sellCosts = 0,
  taxPct = 0,
} = {}) {
  const buyPrice = toNumber(buyPricePerKg);
  const sellPrice = toNumber(sellPricePerKg);
  const kg = toNumber(quantityKg);
  const making = toNumber(makingChargePct);
  const gstRate = toNumber(gstPct);
  const buyCosts = toNumber(otherBuyCosts);
  const deduction = toNumber(buybackDeductionPct);
  const sellingCosts = toNumber(sellCosts);
  const tax = toNumber(taxPct);

  const all = [buyPrice, sellPrice, kg, making, gstRate, buyCosts, deduction, sellingCosts, tax];
  if (all.some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (all.some((value) => value < 0)) {
    return { error: "Prices, quantities and charges cannot be negative." };
  }
  if (!(buyPrice > 0)) return { error: "Enter the silver price per kg on the day you bought." };
  if (!(sellPrice > 0)) return { error: "Enter the silver price per kg on the day you sold." };
  if (!(kg > 0)) return { error: "Enter the quantity of silver in kilograms." };
  if (kg > MAX_KG) return { error: `Enter ${MAX_KG} kg or less.` };
  if (making > 100 || gstRate > 100) {
    return { error: "Making charge and GST must each be 100% or less." };
  }
  if (deduction >= 100) {
    return { error: "A buyback deduction of 100% would leave nothing — check the figure." };
  }
  if (tax > MAX_TAX_PCT) return { error: `Enter a tax rate of ${MAX_TAX_PCT}% or less.` };

  const bought = parseIsoDate(buyDate);
  const sold = parseIsoDate(sellDate);
  if (bought === null) return { error: "Enter a valid purchase date in yyyy-mm-dd form." };
  if (sold === null) return { error: "Enter a valid sale date in yyyy-mm-dd form." };
  if (sold < bought) return { error: "The sale date cannot be before the purchase date." };

  const days = Math.round((sold - bought) / MS_PER_DAY);
  const years = days / DAYS_PER_YEAR;

  const metalValue = buyPrice * kg;
  const makingCharge = (metalValue * making) / 100;
  const gst = ((metalValue + makingCharge) * gstRate) / 100;
  const investment = metalValue + makingCharge + gst + buyCosts;

  const saleValue = sellPrice * kg;
  const buybackDeduction = (saleValue * deduction) / 100;
  const proceeds = saleValue - buybackDeduction - sellingCosts;

  const gain = proceeds - investment;
  const taxPayable = gain > 0 ? (gain * tax) / 100 : 0;
  const net = proceeds - taxPayable;
  const netProfit = net - investment;

  const absoluteReturnPct = investment > 0 ? (netProfit / investment) * 100 : 0;
  const priceChangePct = ((sellPrice - buyPrice) / buyPrice) * 100;

  let cagrPct = null;
  if (years > 0 && investment > 0 && net > 0) {
    cagrPct = (Math.pow(net / investment, 1 / years) - 1) * 100;
  }

  const retained = 1 - deduction / 100;
  const breakEvenSellPerKg =
    retained > 0 && kg > 0 ? (investment + sellingCosts) / (kg * retained) : null;

  const totalCosts = makingCharge + gst + buyCosts + buybackDeduction + sellingCosts;
  const effectiveBuyPerKg = investment / kg;
  const effectiveSellPerKg = proceeds / kg;

  return {
    days,
    years: round2(years),
    quantityKg: round2(kg),
    quantityGrams: round0(kg * GRAMS_PER_KG),
    buyPricePerKg: round2(buyPrice),
    sellPricePerKg: round2(sellPrice),
    metalValue: round0(metalValue),
    makingCharge: round0(makingCharge),
    gst: round0(gst),
    otherBuyCosts: round0(buyCosts),
    investment: round0(investment),
    effectiveBuyPerKg: round2(effectiveBuyPerKg),
    effectiveBuyPerGram: round2(effectiveBuyPerKg / GRAMS_PER_KG),
    saleValue: round0(saleValue),
    buybackDeduction: round0(buybackDeduction),
    sellCosts: round0(sellingCosts),
    exitCosts: round0(buybackDeduction + sellingCosts),
    proceeds: round0(proceeds),
    effectiveSellPerKg: round2(effectiveSellPerKg),
    gain: round0(gain),
    taxPayable: round0(taxPayable),
    net: round0(net),
    netProfit: round0(netProfit),
    absoluteReturnPct: round2(absoluteReturnPct),
    priceChangePct: round2(priceChangePct),
    frictionGapPct: round2(priceChangePct - absoluteReturnPct),
    cagrPct: cagrPct === null ? null : round2(cagrPct),
    totalCosts: round0(totalCosts),
    costsSharePct: metalValue > 0 ? round2((totalCosts / metalValue) * 100) : 0,
    breakEvenSellPerKg: breakEvenSellPerKg === null ? null : round2(breakEvenSellPerKg),
    breakEvenReached: breakEvenSellPerKg !== null && sellPrice >= breakEvenSellPerKg,
    profitable: netProfit > 0,
  };
}
