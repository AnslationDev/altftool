/**
 * Dealer exchange vs private sale — a like-for-like net-proceeds comparison.
 *
 * The headline numbers are never comparable as quoted. A dealer exchange pays
 * less but pays TODAY and absorbs every cost; a private sale fetches a higher
 * sticker but the seller carries reconditioning, listing, paperwork, the cost
 * of holding a car that is still depreciating, their own time, and the fact
 * that the money arrives weeks later. This module puts both routes on the same
 * footing by reducing each to a present value at the moment of the exchange.
 *
 * Exchange route (cash on day 0):
 *   netExchange = dealerOffer + exchangeBonus - loanOutstanding - foreclosureCharge
 *
 * Private route (cash on day t):
 *   realisedPrice = askingPrice x (1 - annualDepreciation)^(t/365)
 *       A car does not stop depreciating while it waits for a buyer; a price
 *       that is right today is optimistic six weeks out.
 *   netAtSale     = realisedPrice - reconditioning - listing - paperwork
 *                   - loanOutstanding - foreclosureCharge
 *   presentValue  = netAtSale / (1 + discountRate)^(t/365)
 *       Standard discounting. The discount rate is what the money would have
 *       earned (or what your loan costs) over the wait.
 *   netPrivate    = presentValue - holdingCost - timeCost
 *       Holding cost is insurance, parking and upkeep that keeps running while
 *       the car is unsold; time cost values the hours spent on calls, test
 *       drives and RTO paperwork.
 *
 * Break-even asking price — the sticker a private sale must actually close at
 * to match the exchange offer — falls out algebraically:
 *
 *   P* = [ (netExchange + holdingCost + timeCost) x (1 + d)^t + C ] / (1 - r)^t
 *
 * where C is the sum of the cash costs deducted at sale.
 *
 * Every function is pure and total; invalid input returns { error }.
 */

export const DAYS_PER_YEAR = 365;
export const AVG_DAYS_PER_MONTH = 365.25 / 12;

/** Typical seller-side transfer paperwork in India. Editable in the tool. */
export const PAPERWORK_ITEMS = [
  "RC transfer / Form 29 and 30 fees at the RTO",
  "NOC if the buyer is in another state",
  "Form 35 and bank NOC to remove hypothecation after a loan closes",
  "Fresh pollution-under-control certificate for the handover",
];

/** Defaults chosen to be visible and easy to overwrite, not to bias a result. */
export const DEFAULT_DISCOUNT_RATE = 7; // % a year — a bank FD is the usual alternative
export const DEFAULT_ANNUAL_DEPRECIATION = 15; // % a year on a car past its first year
export const DEFAULT_DAYS_TO_SELL = 45;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

const round = (v, dp = 0) => {
  if (!Number.isFinite(v)) return 0;
  const f = 10 ** dp;
  return Math.round((v + Number.EPSILON) * f) / f;
};

/**
 * @returns present value of `amount` received `days` from now at `annualRate` %.
 */
export function presentValue(amount, annualRate, days) {
  if (!isNum(amount) || !isNum(annualRate) || !isNum(days)) return NaN;
  const factor = (1 + annualRate / 100) ** (days / DAYS_PER_YEAR);
  if (!Number.isFinite(factor) || factor <= 0) return NaN;
  return amount / factor;
}

export function compareExchangeVsPrivate({
  dealerOffer,
  exchangeBonus = 0,
  privateAskingPrice,
  reconditioningCost = 0,
  listingCost = 0,
  paperworkCost = 0,
  loanOutstanding = 0,
  foreclosureCharge = 0,
  daysToSell = DEFAULT_DAYS_TO_SELL,
  monthlyHoldingCost = 0,
  hoursSpent = 0,
  hourlyValue = 0,
  discountRate = DEFAULT_DISCOUNT_RATE,
  annualDepreciation = DEFAULT_ANNUAL_DEPRECIATION,
}) {
  const numeric = {
    dealerOffer,
    exchangeBonus,
    privateAskingPrice,
    reconditioningCost,
    listingCost,
    paperworkCost,
    loanOutstanding,
    foreclosureCharge,
    daysToSell,
    monthlyHoldingCost,
    hoursSpent,
    hourlyValue,
    discountRate,
    annualDepreciation,
  };
  for (const [key, value] of Object.entries(numeric)) {
    if (!isNum(value)) return { error: `Enter a number for every field (${key} is not a number).` };
  }

  if (dealerOffer <= 0) return { error: "The dealer's exchange offer must be greater than zero." };
  if (privateAskingPrice <= 0) return { error: "Enter the price you realistically expect from a private buyer." };
  if (
    [exchangeBonus, reconditioningCost, listingCost, paperworkCost, loanOutstanding, foreclosureCharge, monthlyHoldingCost, hoursSpent, hourlyValue].some(
      (v) => v < 0,
    )
  ) {
    return { error: "Costs and bonuses cannot be negative." };
  }
  if (daysToSell < 0 || daysToSell > 730) {
    return { error: "Days to sell should be between 0 and 730." };
  }
  if (discountRate < 0 || discountRate > 60) {
    return { error: "The discount rate should be between 0% and 60% a year." };
  }
  if (annualDepreciation < 0 || annualDepreciation >= 100) {
    return { error: "Annual depreciation should be between 0% and 99%." };
  }

  const t = daysToSell / DAYS_PER_YEAR;

  // ---- Exchange route: everything settles on delivery day. ----
  const exchangeGross = dealerOffer + exchangeBonus;
  const exchangeDeductions = loanOutstanding + foreclosureCharge;
  const netExchange = exchangeGross - exchangeDeductions;

  // ---- Private route ----
  const depFactor = (1 - annualDepreciation / 100) ** t;
  const realisedPrice = privateAskingPrice * depFactor;
  const depreciationWhileWaiting = privateAskingPrice - realisedPrice;

  const cashCosts =
    reconditioningCost + listingCost + paperworkCost + loanOutstanding + foreclosureCharge;
  const netAtSale = realisedPrice - cashCosts;

  const discountFactor = (1 + discountRate / 100) ** t;
  const pvNetAtSale = netAtSale / discountFactor;
  const timeValueLost = netAtSale - pvNetAtSale;

  const holdingCost = (daysToSell / AVG_DAYS_PER_MONTH) * monthlyHoldingCost;
  const timeCost = hoursSpent * hourlyValue;
  const netPrivate = pvNetAtSale - holdingCost - timeCost;

  if (!Number.isFinite(netPrivate) || !Number.isFinite(netExchange)) {
    return { error: "Those numbers overflow the calculation — scale them down and try again." };
  }

  // ---- Break-even asking price for the private route ----
  const breakEvenPrice =
    depFactor > 0
      ? ((netExchange + holdingCost + timeCost) * discountFactor + cashCosts) / depFactor
      : null;

  const difference = netPrivate - netExchange;
  // Anything inside a rupee is a tie once both sides are rounded for display.
  const TIE_TOLERANCE = 1;
  const winner =
    difference > TIE_TOLERANCE ? "private" : difference < -TIE_TOLERANCE ? "exchange" : "tie";

  return {
    // exchange
    exchangeGross: round(exchangeGross),
    exchangeDeductions: round(exchangeDeductions),
    netExchange: round(netExchange),
    // private
    privateAskingPrice: round(privateAskingPrice),
    realisedPrice: round(realisedPrice),
    depreciationWhileWaiting: round(depreciationWhileWaiting),
    cashCosts: round(cashCosts),
    netAtSale: round(netAtSale),
    pvNetAtSale: round(pvNetAtSale),
    timeValueLost: round(timeValueLost),
    holdingCost: round(holdingCost),
    timeCost: round(timeCost),
    netPrivate: round(netPrivate),
    totalPrivateFriction: round(
      cashCosts - loanOutstanding - foreclosureCharge + depreciationWhileWaiting + timeValueLost + holdingCost + timeCost,
    ),
    // verdict
    difference: round(difference),
    absDifference: round(Math.abs(difference)),
    winner,
    breakEvenPrice: breakEvenPrice === null ? null : round(breakEvenPrice),
    premiumNeededOverDealer:
      breakEvenPrice === null ? null : round(breakEvenPrice - dealerOffer),
    premiumNeededPct:
      breakEvenPrice === null || dealerOffer <= 0
        ? null
        : round(((breakEvenPrice - dealerOffer) / dealerOffer) * 100, 1),
    daysToSell: round(daysToSell),
    effectivePerDayCostOfWaiting:
      daysToSell > 0
        ? round((depreciationWhileWaiting + timeValueLost + holdingCost) / daysToSell, 0)
        : 0,
  };
}
