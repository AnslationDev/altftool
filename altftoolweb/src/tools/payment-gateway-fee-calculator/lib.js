/**
 * Payment gateway fee calculator — pure logic.
 *
 * Almost every card gateway charges the same shape of fee:
 *
 *   fee = amount x (percentage rate) + fixed fee per transaction
 *
 * with optional surcharges layered on the percentage — a cross-border or
 * international-card uplift, and a currency-conversion uplift when the payment
 * settles in a different currency. Tax (GST, VAT) is then charged on the fee
 * itself, not on the sale, in jurisdictions that treat gateway processing as a
 * taxable service.
 *
 *   totalCost = (amount x p + fixed) x (1 + taxRate)
 *   net       = amount - totalCost
 *
 * Reversing that to find the amount to charge for a target net gives:
 *
 *   amount = (targetNet + fixed x (1 + t)) / (1 - p x (1 + t))
 *
 * which is exact, not an iteration. It has no solution when p x (1 + t) >= 1,
 * because the percentage fee would then swallow the whole payment.
 *
 * Pure module: no React, no DOM, no clock reads, no network.
 */

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Percentage inputs above this are certainly typos. */
export const MAX_PERCENT = 100;
/** Largest transaction the calculator will price. */
export const MAX_AMOUNT = 1e12;

/**
 * Commonly published headline pricing, offered as a starting point only.
 * Provider pricing changes, varies by country, card type and volume, and is
 * often negotiated — always confirm against your own merchant agreement.
 */
export const GATEWAY_PRESETS = {
  custom: { id: "custom", label: "My own rates" },
  "stripe-us": {
    id: "stripe-us",
    label: "Stripe — US online cards (2.9% + 0.30)",
    percentFee: 2.9,
    fixedFee: 0.3,
    crossBorderPercent: 1.5,
    conversionPercent: 1,
    taxOnFeePercent: 0,
  },
  "paypal-us": {
    id: "paypal-us",
    label: "PayPal — US commercial transactions (3.49% + 0.49)",
    percentFee: 3.49,
    fixedFee: 0.49,
    crossBorderPercent: 1.5,
    conversionPercent: 3,
    taxOnFeePercent: 0,
  },
  "square-online": {
    id: "square-online",
    label: "Square — online payments (2.9% + 0.30)",
    percentFee: 2.9,
    fixedFee: 0.3,
    crossBorderPercent: 0,
    conversionPercent: 0,
    taxOnFeePercent: 0,
  },
  "india-domestic": {
    id: "india-domestic",
    label: "India domestic gateway (2% + 18% GST on the fee)",
    percentFee: 2,
    fixedFee: 0,
    crossBorderPercent: 1,
    conversionPercent: 0,
    taxOnFeePercent: 18,
  },
};

/**
 * Net settlement on a single transaction.
 *
 * @param {object} input
 * @param {number} input.amount the amount the customer is charged
 * @param {number} input.percentFee base percentage rate
 * @param {number} [input.fixedFee] per-transaction fixed fee
 * @param {number} [input.crossBorderPercent] uplift for international cards
 * @param {number} [input.conversionPercent] uplift for currency conversion
 * @param {number} [input.taxOnFeePercent] tax charged on the fee (e.g. 18% GST)
 * @param {boolean} [input.international] whether the cross-border uplift applies
 * @param {boolean} [input.converted] whether the conversion uplift applies
 * @returns {object} the fee breakdown, or { error }
 */
export function computeGatewayFee({
  amount,
  percentFee,
  fixedFee = 0,
  crossBorderPercent = 0,
  conversionPercent = 0,
  taxOnFeePercent = 0,
  international = false,
  converted = false,
}) {
  if (!isNum(amount) || amount <= 0) return { error: "The transaction amount must be greater than zero." };
  if (amount > MAX_AMOUNT) return { error: "That transaction amount is too large to price." };
  if (!isNum(percentFee) || percentFee < 0 || percentFee > MAX_PERCENT) {
    return { error: `The percentage fee must be between 0% and ${MAX_PERCENT}%.` };
  }
  if (!isNum(fixedFee) || fixedFee < 0) return { error: "The fixed fee cannot be negative." };
  if (!isNum(crossBorderPercent) || crossBorderPercent < 0 || crossBorderPercent > MAX_PERCENT) {
    return { error: "The cross-border uplift must be between 0% and 100%." };
  }
  if (!isNum(conversionPercent) || conversionPercent < 0 || conversionPercent > MAX_PERCENT) {
    return { error: "The conversion uplift must be between 0% and 100%." };
  }
  if (!isNum(taxOnFeePercent) || taxOnFeePercent < 0 || taxOnFeePercent > MAX_PERCENT) {
    return { error: "Tax on the fee must be between 0% and 100%." };
  }

  const crossBorder = international ? crossBorderPercent : 0;
  const conversion = converted ? conversionPercent : 0;
  const totalPercent = percentFee + crossBorder + conversion;
  if (totalPercent > MAX_PERCENT) {
    return { error: "The combined percentage fees exceed 100% of the payment." };
  }

  const percentPart = amount * (totalPercent / 100);
  const feeBeforeTax = percentPart + fixedFee;
  const taxOnFee = feeBeforeTax * (taxOnFeePercent / 100);
  const totalCost = feeBeforeTax + taxOnFee;
  const net = amount - totalCost;

  return {
    amount,
    totalPercent,
    percentPart,
    fixedFee,
    crossBorderPart: amount * (crossBorder / 100),
    conversionPart: amount * (conversion / 100),
    feeBeforeTax,
    taxOnFee,
    totalCost,
    net,
    /** What the whole charge works out to as a percentage of the sale. */
    effectivePercent: (totalCost / amount) * 100,
    /** True when the fee is bigger than the payment — real on micro-payments. */
    underwater: net < 0,
  };
}

/**
 * The amount to charge so that a target lands in your account.
 *
 * @param {object} input same fee parameters as computeGatewayFee
 * @param {number} input.targetNet the amount you want to receive
 * @returns {{ chargeAmount: number, fee: object } | { error: string }}
 */
export function grossUpForNet({
  targetNet,
  percentFee,
  fixedFee = 0,
  crossBorderPercent = 0,
  conversionPercent = 0,
  taxOnFeePercent = 0,
  international = false,
  converted = false,
}) {
  if (!isNum(targetNet) || targetNet <= 0) return { error: "The amount you want to receive must be greater than zero." };
  if (!isNum(percentFee) || percentFee < 0) return { error: "The percentage fee cannot be negative." };
  if (!isNum(fixedFee) || fixedFee < 0) return { error: "The fixed fee cannot be negative." };

  const crossBorder = international ? crossBorderPercent : 0;
  const conversion = converted ? conversionPercent : 0;
  const p = (percentFee + crossBorder + conversion) / 100;
  const t = taxOnFeePercent / 100;
  const denominator = 1 - p * (1 + t);

  if (!(denominator > 0)) {
    return { error: "At these rates the fee would take the entire payment — no charge can produce that net amount." };
  }

  const chargeAmount = (targetNet + fixedFee * (1 + t)) / denominator;
  if (!Number.isFinite(chargeAmount)) return { error: "That combination is too large to compute." };

  const fee = computeGatewayFee({
    amount: chargeAmount,
    percentFee,
    fixedFee,
    crossBorderPercent,
    conversionPercent,
    taxOnFeePercent,
    international,
    converted,
  });
  if (fee.error) return { error: fee.error };

  return { chargeAmount, fee, uplift: chargeAmount - targetNet, upliftPercent: ((chargeAmount - targetNet) / targetNet) * 100 };
}

/**
 * The same rates applied across a ladder of ticket sizes, which is how the
 * fixed fee's bite on small payments becomes obvious.
 *
 * @param {object} input fee parameters
 * @param {Array<number>} amounts ticket sizes to price
 * @returns {Array<object>}
 */
export function buildTicketLadder(input, amounts = [5, 25, 100, 500, 2000, 10000]) {
  const rows = [];
  for (const amount of amounts) {
    if (!isNum(amount) || amount <= 0) continue;
    const result = computeGatewayFee({ ...input, amount });
    if (result.error) continue;
    rows.push({
      amount,
      totalCost: result.totalCost,
      net: result.net,
      effectivePercent: result.effectivePercent,
      underwater: result.underwater,
    });
  }
  return rows;
}

/**
 * Monthly cost of processing, for comparing providers on real volume.
 *
 * @param {object} input fee parameters
 * @param {number} transactionsPerMonth
 * @param {number} averageTicket
 * @returns {object} monthly totals, or { error }
 */
export function monthlyCost(input, transactionsPerMonth, averageTicket) {
  if (!isNum(transactionsPerMonth) || transactionsPerMonth <= 0) {
    return { error: "Enter how many transactions you process a month." };
  }
  if (!isNum(averageTicket) || averageTicket <= 0) {
    return { error: "Enter your average transaction value." };
  }
  const per = computeGatewayFee({ ...input, amount: averageTicket });
  if (per.error) return { error: per.error };
  const count = Math.round(transactionsPerMonth);
  return {
    volume: averageTicket * count,
    cost: per.totalCost * count,
    net: per.net * count,
    effectivePercent: per.effectivePercent,
  };
}
