/**
 * Annual cost of running a demat + trading account in India, for equity
 * DELIVERY trades, compared across competing plan structures.
 *
 * Cost components and their sources:
 *  - Annual Maintenance Charge (AMC): set by the depository participant. Basic
 *    Services Demat Accounts (BSDA), allowed by SEBI for a single small demat
 *    account, are free up to a holding value of ₹4,00,000 and charged at ₹100 a
 *    year between ₹4,00,000 and ₹10,00,000 (SEBI circular of 28 June 2019 as
 *    revised with effect from 1 September 2024).
 *  - DP transaction charge: levied on every DEBIT (sell) of a scrip from the
 *    demat account. Buys are free. The depository bills the DP a few rupees and
 *    the DP marks it up, so the amount differs by broker.
 *  - Brokerage: flat per executed order, or a percentage of turnover, often with
 *    a per-order ceiling. Discount brokers commonly charge nil on delivery.
 *  - Securities Transaction Tax (STT): 0.1% of turnover on BOTH the buy and the
 *    sell leg of a delivery trade (Finance (No. 2) Act, 2004, Schedule).
 *  - Stamp duty: 0.015% on the BUY leg only, at the uniform rates that took
 *    effect on 1 July 2020 under the amended Indian Stamp Act, 1899.
 *  - SEBI turnover fee: ₹10 per crore of turnover, i.e. 0.0001%.
 *  - Exchange transaction charge: NSE cash market 0.00297% of turnover, BSE
 *    0.00375% (equity group A/B). Confirm the current circular before relying on
 *    the figure, as exchanges revise it.
 *  - GST at 18% applies to brokerage, DP charges, AMC, exchange transaction
 *    charges and the SEBI fee. It does NOT apply to STT or stamp duty.
 */

/** Securities Transaction Tax on equity delivery, each leg (%). */
export const STT_DELIVERY_PERCENT = 0.1;

/** Stamp duty on the buy leg of a delivery trade (%). */
export const STAMP_DUTY_BUY_PERCENT = 0.015;

/** SEBI turnover fee: ₹10 per crore of turnover (%). */
export const SEBI_TURNOVER_FEE_PERCENT = 0.0001;

/** Exchange transaction charges on the cash segment (%). */
export const EXCHANGE_TXN_PERCENT = {
  NSE: 0.00297,
  BSE: 0.00375,
};

/** GST on brokerage and other broker/exchange services (%). */
export const GST_PERCENT = 18;

/** BSDA thresholds and charges (SEBI, revised with effect from 1 September 2024). */
export const BSDA_FREE_HOLDING_LIMIT = 400000;
export const BSDA_UPPER_HOLDING_LIMIT = 1000000;
export const BSDA_TIER_TWO_AMC = 100;

/** Brokerage models a plan can use. */
export const BROKERAGE_MODELS = ["zero", "flat", "percent"];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const nonNeg = (value) => isNum(value) && value >= 0;

/**
 * Brokerage charged on one executed order.
 *
 * @param {number} orderValue turnover of the single order in rupees
 * @param {object} plan
 * @returns {number} brokerage in rupees
 */
export function brokeragePerOrder(orderValue, plan = {}) {
  if (!nonNeg(orderValue) || orderValue === 0) return 0;
  const model = plan.brokerageModel;
  if (model === "zero") return 0;
  if (model === "flat") {
    const flat = nonNeg(plan.flatPerOrder) ? plan.flatPerOrder : 0;
    return Math.min(flat, orderValue);
  }
  const rate = nonNeg(plan.percentRate) ? plan.percentRate : 0;
  const raw = (orderValue * rate) / 100;
  const cap = nonNeg(plan.capPerOrder) && plan.capPerOrder > 0 ? plan.capPerOrder : Infinity;
  return Math.min(raw, cap, orderValue);
}

/**
 * AMC actually payable, taking the BSDA concession into account.
 *
 * @param {number} amcPerYear the plan's own AMC
 * @param {object} [options]
 * @param {boolean} [options.bsda] treat the account as a BSDA
 * @param {number} [options.holdingValue] average holding value in the year
 * @returns {{ amc: number, bsdaApplied: boolean, note: string }}
 */
export function effectiveAmc(amcPerYear, { bsda = false, holdingValue = 0 } = {}) {
  const base = nonNeg(amcPerYear) ? amcPerYear : 0;
  if (!bsda || !nonNeg(holdingValue)) return { amc: base, bsdaApplied: false, note: "" };
  if (holdingValue <= BSDA_FREE_HOLDING_LIMIT) {
    return { amc: 0, bsdaApplied: true, note: "BSDA: no AMC up to a ₹4,00,000 holding." };
  }
  if (holdingValue <= BSDA_UPPER_HOLDING_LIMIT) {
    return {
      amc: Math.min(base, BSDA_TIER_TWO_AMC),
      bsdaApplied: true,
      note: "BSDA: AMC capped at ₹100 a year between ₹4,00,000 and ₹10,00,000.",
    };
  }
  return {
    amc: base,
    bsdaApplied: false,
    note: "Holding is above ₹10,00,000, so BSDA no longer applies and the plan's own AMC is charged.",
  };
}

/**
 * Statutory and exchange levies for the year. These are identical for every
 * broker, so they explain the floor under any plan's cost.
 *
 * @param {object} input
 * @param {number} input.buyTurnover total value bought in the year
 * @param {number} input.sellTurnover total value sold in the year
 * @param {"NSE"|"BSE"} [input.exchange]
 */
export function statutoryCharges({ buyTurnover = 0, sellTurnover = 0, exchange = "NSE" } = {}) {
  const buy = nonNeg(buyTurnover) ? buyTurnover : 0;
  const sell = nonNeg(sellTurnover) ? sellTurnover : 0;
  const turnover = buy + sell;
  const exchangeRate = EXCHANGE_TXN_PERCENT[exchange] ?? EXCHANGE_TXN_PERCENT.NSE;
  return {
    turnover,
    stt: (turnover * STT_DELIVERY_PERCENT) / 100,
    stampDuty: (buy * STAMP_DUTY_BUY_PERCENT) / 100,
    exchangeCharge: (turnover * exchangeRate) / 100,
    sebiFee: (turnover * SEBI_TURNOVER_FEE_PERCENT) / 100,
    exchangeRate,
  };
}

/**
 * Compare the yearly cost of several demat/broking plans on the same trading
 * pattern.
 *
 * @param {object} input
 * @param {Array<object>} input.plans plan definitions
 * @param {number} input.buyOrdersPerMonth
 * @param {number} input.avgBuyValue average value of one buy order
 * @param {number} input.sellOrdersPerMonth
 * @param {number} input.avgSellValue average value of one sell order
 * @param {number} [input.scripsPerSell] scrips debited per selling day
 * @param {"NSE"|"BSE"} [input.exchange]
 * @param {boolean} [input.bsda]
 * @param {number} [input.holdingValue]
 * @param {boolean} [input.includeOpeningFee] count the one-time opening fee
 * @returns {object} comparison, or { error }
 */
export function compareDematPlans({
  plans = [],
  buyOrdersPerMonth = 0,
  avgBuyValue = 0,
  sellOrdersPerMonth = 0,
  avgSellValue = 0,
  scripsPerSell = 1,
  exchange = "NSE",
  bsda = false,
  holdingValue = 0,
  includeOpeningFee = false,
} = {}) {
  if (!Array.isArray(plans) || plans.length < 2) {
    return { error: "Add at least two plans to compare." };
  }
  const numbers = [buyOrdersPerMonth, avgBuyValue, sellOrdersPerMonth, avgSellValue, scripsPerSell];
  if (numbers.some((value) => !isNum(value))) {
    return { error: "Enter valid numbers for order counts and order sizes." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Order counts and order values cannot be negative." };
  }
  if (scripsPerSell < 1) {
    return { error: "At least one scrip is debited on every selling day." };
  }
  if (buyOrdersPerMonth > 3000 || sellOrdersPerMonth > 3000) {
    return { error: "Enter 3,000 or fewer orders a month — this tool models delivery investing." };
  }
  if (avgBuyValue > 1e10 || avgSellValue > 1e10) {
    return { error: "Enter an average order value below ₹1,000 crore." };
  }
  if (buyOrdersPerMonth === 0 && sellOrdersPerMonth === 0 && !plans.some((p) => p.amcPerYear > 0)) {
    return { error: "Enter at least one trade a month, or an AMC, so there is a cost to compare." };
  }

  const buyOrders = buyOrdersPerMonth * 12;
  const sellOrders = sellOrdersPerMonth * 12;
  const buyTurnover = buyOrders * avgBuyValue;
  const sellTurnover = sellOrders * avgSellValue;
  const levies = statutoryCharges({ buyTurnover, sellTurnover, exchange });
  const dpDebits = sellOrders * Math.round(scripsPerSell);

  const rows = plans.map((plan, index) => {
    const name = plan.name || `Plan ${index + 1}`;
    const buyBrokerage = buyOrders * brokeragePerOrder(avgBuyValue, plan);
    const sellBrokerage = sellOrders * brokeragePerOrder(avgSellValue, plan);
    const brokerage = buyBrokerage + sellBrokerage;
    const dpCharge = dpDebits * (nonNeg(plan.dpPerSell) ? plan.dpPerSell : 0);
    const { amc, bsdaApplied, note } = effectiveAmc(plan.amcPerYear, { bsda, holdingValue });
    const openingFee =
      includeOpeningFee && nonNeg(plan.openingFee) ? plan.openingFee : 0;

    // GST applies to broker and exchange services, not to STT or stamp duty.
    const gstable = brokerage + dpCharge + amc + openingFee + levies.exchangeCharge + levies.sebiFee;
    const gst = (gstable * GST_PERCENT) / 100;
    const brokerControlled = brokerage + dpCharge + amc + openingFee;
    const total = gstable + gst + levies.stt + levies.stampDuty;

    return {
      name,
      brokerage,
      buyBrokerage,
      sellBrokerage,
      dpCharge,
      dpDebits,
      amc,
      bsdaApplied,
      bsdaNote: note,
      openingFee,
      gst,
      stt: levies.stt,
      stampDuty: levies.stampDuty,
      exchangeCharge: levies.exchangeCharge,
      sebiFee: levies.sebiFee,
      brokerControlled,
      statutory: levies.stt + levies.stampDuty + levies.exchangeCharge + levies.sebiFee,
      total,
      costPercentOfTurnover: levies.turnover > 0 ? (total / levies.turnover) * 100 : 0,
      monthlyAverage: total / 12,
    };
  });

  const ranked = [...rows].sort((a, b) => a.total - b.total);
  const cheapest = ranked[0];
  const dearest = ranked[ranked.length - 1];

  return {
    rows: rows.map((row) => ({
      ...row,
      rank: ranked.findIndex((item) => item.name === row.name) + 1,
      extraOverCheapest: row.total - cheapest.total,
    })),
    ranked,
    cheapest,
    dearest,
    maxSaving: dearest.total - cheapest.total,
    buyOrders,
    sellOrders,
    buyTurnover,
    sellTurnover,
    turnover: levies.turnover,
    dpDebits,
    exchange,
    exchangeRate: levies.exchangeRate,
    statutoryFloor: levies.stt + levies.stampDuty + levies.exchangeCharge + levies.sebiFee,
  };
}
