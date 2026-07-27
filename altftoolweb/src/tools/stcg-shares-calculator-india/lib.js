/**
 * Short term capital gains on listed equity in India — Section 111A.
 *
 * Rule sources (Income-tax Act, 1961):
 *  - Section 2(42A): equity shares listed on a recognised stock exchange and units of an
 *    equity-oriented fund are short-term capital assets if held for not more than 12 months.
 *  - Section 111A(1): short-term gains on such assets, where securities transaction tax has
 *    been paid on the transfer, are taxed at a concessional rate. The Finance (No. 2) Act,
 *    2024 raised that rate from 15% to 20% for transfers made on or after 23 July 2024.
 *  - Proviso to Section 111A(1): a resident individual or HUF whose other income falls short
 *    of the basic exemption limit may set the unexhausted part against these gains.
 *  - Section 48: expenditure incurred wholly and exclusively in connection with the transfer
 *    is deductible, but the fifth proviso bars any deduction for securities transaction tax.
 *  - Section 74: a short-term capital loss may be set off against any capital gain, short or
 *    long, and carried forward for eight assessment years.
 *  - Surcharge on income chargeable under Section 111A is capped at 15%, and a 4% health and
 *    education cess applies on tax plus surcharge.
 */

/** Section 111A rate for transfers made on or after the Finance (No. 2) Act, 2024 cut-off. */
export const STCG_RATE_CURRENT = 20;

/** Section 111A rate for transfers made before that date. */
export const STCG_RATE_LEGACY = 15;

/** The date from which the 20% rate applies. */
export const STCG_RATE_CHANGE_DATE = "2024-07-23";

/** Holding period beyond which listed equity becomes a long-term capital asset. */
export const SHORT_TERM_HOLDING_MONTHS = 12;

/** Health and education cess on income tax plus surcharge. */
export const HEALTH_EDUCATION_CESS = 4;

/** Surcharge on Section 111A income cannot exceed this rate. */
export const SURCHARGE_CAP_111A = 15;

/** Securities transaction tax on a delivery-based equity trade, charged on both legs. */
export const STT_DELIVERY_RATE = 0.1;

/** Basic exemption under the new regime in Section 115BAC, as raised by the Finance Act 2025. */
export const BASIC_EXEMPTION_NEW_REGIME = 400000;

/** Basic exemption under the old regime, by age band. */
export const BASIC_EXEMPTION_OLD_REGIME = {
  general: 250000,
  senior: 300000,
  superSenior: 500000,
};

/** Age bands the old regime recognises. */
export const AGE_BANDS = [
  { id: "general", label: "Below 60" },
  { id: "senior", label: "60 to 79 (senior citizen)" },
  { id: "superSenior", label: "80 and above (super senior citizen)" },
];

/** Surcharge rates an individual may face. Section 111A income is capped at 15%. */
export const SURCHARGE_OPTIONS = [
  { rate: 0, label: "No surcharge (total income up to ₹50 lakh)" },
  { rate: 10, label: "10% (total income above ₹50 lakh)" },
  { rate: 15, label: "15% (total income above ₹1 crore)" },
  { rate: 25, label: "25% (total income above ₹2 crore)" },
  { rate: 37, label: "37% (total income above ₹5 crore, old regime only)" },
];

const MS_PER_DAY = 86400000;

const round2 = (value) => Math.round(value * 100) / 100;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Parse an ISO date string into a UTC timestamp, or null if it is not a real date. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const timestamp = Date.UTC(year, month - 1, day);
  const check = new Date(timestamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return timestamp;
}

/**
 * Classify the holding period of a listed equity holding.
 *
 * Short term means held for not more than 12 months, so a sale on the 12-month anniversary
 * of the purchase is still short term.
 *
 * @param {string} buyDate  ISO date of purchase.
 * @param {string} sellDate ISO date of sale.
 * @returns {{holdingDays: number, isShortTerm: boolean, anniversary: string}|{error: string}}
 */
export function classifyHoldingPeriod(buyDate, sellDate) {
  const buy = parseIsoDate(buyDate);
  const sell = parseIsoDate(sellDate);
  if (buy === null) return { error: "Enter a valid purchase date." };
  if (sell === null) return { error: "Enter a valid sale date." };
  if (sell < buy) return { error: "The sale date cannot fall before the purchase date." };

  const buyPoint = new Date(buy);
  const anniversary = Date.UTC(
    buyPoint.getUTCFullYear() + 1,
    buyPoint.getUTCMonth(),
    buyPoint.getUTCDate(),
  );

  return {
    holdingDays: Math.round((sell - buy) / MS_PER_DAY),
    isShortTerm: sell <= anniversary,
    anniversary: new Date(anniversary).toISOString().slice(0, 10),
  };
}

/** The Section 111A rate that applies to a transfer made on a given date. */
export function stcgRateForDate(sellDate) {
  const sell = parseIsoDate(sellDate);
  const cutoff = parseIsoDate(STCG_RATE_CHANGE_DATE);
  if (sell === null) return null;
  return sell >= cutoff ? STCG_RATE_CURRENT : STCG_RATE_LEGACY;
}

/**
 * Short term capital gains tax on a listed equity trade.
 *
 * @param {object} input
 * @param {number} input.buyPrice   Price per share paid.
 * @param {number} input.sellPrice  Price per share received.
 * @param {number} input.quantity   Number of shares.
 * @param {string} input.buyDate    ISO date of purchase.
 * @param {string} input.sellDate   ISO date of sale.
 * @param {number} [input.transferCharges] Brokerage, exchange fees, stamp duty and GST on them.
 * @param {number} [input.otherIncome]     Total income other than these gains.
 * @param {"new"|"old"} [input.regime]
 * @param {"general"|"senior"|"superSenior"} [input.ageBand] Used only under the old regime.
 * @param {number} [input.surchargeRatePct]
 * @param {boolean} [input.isResidentIndividual] Governs the basic exemption adjustment.
 * @returns {object} tax breakdown, or { error }
 */
export function computeStcgOnShares({
  buyPrice,
  sellPrice,
  quantity,
  buyDate,
  sellDate,
  transferCharges = 0,
  otherIncome = 0,
  regime = "new",
  ageBand = "general",
  surchargeRatePct = 0,
  isResidentIndividual = true,
} = {}) {
  if (!isNum(buyPrice) || buyPrice <= 0) return { error: "Enter the purchase price per share." };
  if (!isNum(sellPrice) || sellPrice < 0) return { error: "Enter the sale price per share." };
  if (!isNum(quantity) || quantity <= 0) return { error: "Enter the number of shares, above zero." };
  if (!isNum(transferCharges) || transferCharges < 0) {
    return { error: "Brokerage and charges cannot be negative." };
  }
  if (!isNum(otherIncome) || otherIncome < 0) {
    return { error: "Income other than these gains cannot be negative." };
  }
  if (!isNum(surchargeRatePct) || surchargeRatePct < 0 || surchargeRatePct > 37) {
    return { error: "Choose a surcharge rate between 0% and 37%." };
  }

  const holding = classifyHoldingPeriod(buyDate, sellDate);
  if (holding.error) return { error: holding.error };

  const rate = stcgRateForDate(sellDate);
  if (rate === null) return { error: "Enter a valid sale date." };

  const costOfAcquisition = buyPrice * quantity;
  const saleConsideration = sellPrice * quantity;

  // Section 48 allows transfer expenditure but not securities transaction tax.
  const grossGain = saleConsideration - costOfAcquisition - transferCharges;

  // STT is shown for context only; it never reduces the taxable gain.
  const sttOnBuy = (costOfAcquisition * STT_DELIVERY_RATE) / 100;
  const sttOnSell = (saleConsideration * STT_DELIVERY_RATE) / 100;

  const isLoss = grossGain < 0;

  const basicExemption =
    regime === "old" ? BASIC_EXEMPTION_OLD_REGIME[ageBand] ?? BASIC_EXEMPTION_OLD_REGIME.general : BASIC_EXEMPTION_NEW_REGIME;

  // Proviso to Section 111A(1): only a resident individual or HUF gets this adjustment.
  const unexhaustedExemption = isResidentIndividual
    ? Math.max(0, basicExemption - otherIncome)
    : 0;

  const positiveGain = Math.max(0, grossGain);
  const exemptionUsed = Math.min(unexhaustedExemption, positiveGain);
  const taxableGain = holding.isShortTerm ? Math.max(0, positiveGain - exemptionUsed) : 0;

  // Surcharge on Section 111A income is capped at 15%.
  const effectiveSurchargeRate = Math.min(surchargeRatePct, SURCHARGE_CAP_111A);
  const baseTax = (taxableGain * rate) / 100;
  const surcharge = (baseTax * effectiveSurchargeRate) / 100;
  const cess = ((baseTax + surcharge) * HEALTH_EDUCATION_CESS) / 100;
  const totalTax = baseTax + surcharge + cess;

  return {
    quantity,
    costOfAcquisition: round2(costOfAcquisition),
    saleConsideration: round2(saleConsideration),
    transferCharges: round2(transferCharges),
    grossGain: round2(grossGain),
    isLoss,
    lossAmount: isLoss ? round2(Math.abs(grossGain)) : 0,
    holdingDays: holding.holdingDays,
    isShortTerm: holding.isShortTerm,
    longTermFrom: holding.anniversary,
    rate,
    rateIsCurrent: rate === STCG_RATE_CURRENT,
    basicExemption,
    unexhaustedExemption: round2(unexhaustedExemption),
    exemptionUsed: round2(holding.isShortTerm ? exemptionUsed : 0),
    taxableGain: round2(taxableGain),
    baseTax: round2(baseTax),
    surchargeRatePct: effectiveSurchargeRate,
    surchargeCapped: surchargeRatePct > SURCHARGE_CAP_111A,
    surcharge: round2(surcharge),
    cess: round2(cess),
    totalTax: round2(totalTax),
    netProceeds: round2(saleConsideration - transferCharges - totalTax),
    netGainAfterTax: round2(grossGain - totalTax),
    returnPct: costOfAcquisition > 0 ? round2((grossGain / costOfAcquisition) * 100) : 0,
    sttOnBuy: round2(sttOnBuy),
    sttOnSell: round2(sttOnSell),
    sttTotal: round2(sttOnBuy + sttOnSell),
  };
}
