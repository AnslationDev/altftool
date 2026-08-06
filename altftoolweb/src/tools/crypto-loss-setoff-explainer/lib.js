/**
 * Taxation of Virtual Digital Assets in India, and the loss set-off bar.
 *
 * Rule sources (Income-tax Act, 1961, as amended by the Finance Act 2022 with effect from
 * assessment year 2023-24):
 *  - Section 115BBH(1): income from the transfer of a virtual digital asset is taxed at 30%,
 *    plus applicable surcharge and health and education cess.
 *  - Section 115BBH(2)(a): no deduction of any expenditure or allowance is allowed in
 *    computing that income, other than the cost of acquisition. Exchange fees, gas fees,
 *    interest and infrastructure costs are therefore not deductible.
 *  - Section 115BBH(2)(b): a loss from the transfer of a virtual digital asset cannot be set
 *    off against income computed under any other provision of the Act, and cannot be carried
 *    forward to a later assessment year. The word "other" was dropped from the Finance Bill
 *    by an official amendment, so a loss on one coin cannot even be set off against a gain on
 *    another coin.
 *  - Section 194S: tax is deducted at source at 1% of the consideration for a transfer of a
 *    virtual digital asset, above a yearly threshold.
 *  - Section 56(2)(x): a virtual digital asset received as a gift is taxable in the hands of
 *    the recipient.
 */

/** Section 115BBH(1) flat rate on VDA income. */
export const VDA_TAX_RATE = 30;

/** Health and education cess on income tax plus surcharge. */
export const HEALTH_EDUCATION_CESS = 4;

/** Section 194S rate on the transfer consideration. */
export const TDS_194S_RATE = 1;

/**
 * Section 194S threshold for a "specified person" — broadly an individual or HUF with no
 * business or professional income, or with business turnover up to ₹1 crore or professional
 * receipts up to ₹50 lakh.
 */
export const TDS_194S_THRESHOLD_SPECIFIED = 50000;

/** Section 194S threshold for everyone else. */
export const TDS_194S_THRESHOLD_OTHERS = 10000;

/** Surcharge slabs an individual may fall into. Surcharge depends on total income, not VDA income alone. */
export const SURCHARGE_OPTIONS = [
  { rate: 0, label: "No surcharge (total income up to ₹50 lakh)" },
  { rate: 10, label: "10% (total income above ₹50 lakh)" },
  { rate: 15, label: "15% (total income above ₹1 crore)" },
  { rate: 25, label: "25% (total income above ₹2 crore)" },
  { rate: 37, label: "37% (total income above ₹5 crore, old regime only)" },
];

/** The set-off routes that Section 115BBH(2)(b) closes off. */
export const BLOCKED_SET_OFFS = [
  "Against a gain on a different virtual digital asset in the same year",
  "Against capital gains on shares, mutual funds or property",
  "Against salary, business income, rent or interest",
  "Carried forward to set off against a virtual digital asset gain next year",
];

const round2 = (value) => Math.round(value * 100) / 100;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Work out the tax on a year of virtual digital asset trades, and what the no-set-off rule
 * costs compared with a world where gains and losses could be netted.
 *
 * @param {object} input
 * @param {Array<{asset?: string, costOfAcquisition: number, saleConsideration: number, otherExpenses?: number}>} input.trades
 * @param {number} [input.surchargeRatePct] Surcharge applicable to the taxpayer.
 * @param {boolean} [input.isSpecifiedPerson] Governs which Section 194S threshold applies.
 * @returns {object} tax breakdown, or { error }
 */
export function computeVdaTax({
  trades = [],
  surchargeRatePct = 0,
  isSpecifiedPerson = true,
} = {}) {
  if (!Array.isArray(trades) || trades.length === 0) {
    return { error: "Add at least one trade to work out the tax." };
  }
  if (!isNum(surchargeRatePct) || surchargeRatePct < 0 || surchargeRatePct > 37) {
    return { error: "Choose a surcharge rate between 0% and 37%." };
  }

  const lines = [];
  let totalGains = 0;
  let totalLosses = 0;
  let totalConsideration = 0;
  let disallowedExpenses = 0;

  for (let index = 0; index < trades.length; index += 1) {
    const trade = trades[index];
    const label = trade.asset && String(trade.asset).trim() ? String(trade.asset).trim() : `Trade ${index + 1}`;

    const cost = isNum(trade.costOfAcquisition) ? trade.costOfAcquisition : NaN;
    const sale = isNum(trade.saleConsideration) ? trade.saleConsideration : NaN;
    const expenses = isNum(trade.otherExpenses) ? trade.otherExpenses : 0;

    if (!Number.isFinite(cost) || !Number.isFinite(sale)) {
      return { error: `Enter both the cost and the sale amount for ${label}.` };
    }
    if (cost < 0 || sale < 0 || expenses < 0) {
      return { error: `Amounts for ${label} cannot be negative.` };
    }

    // Only the cost of acquisition is deductible. Fees and gas are ignored by 115BBH(2)(a).
    const taxableResult = sale - cost;
    const economicResult = sale - cost - expenses;

    if (taxableResult > 0) totalGains += taxableResult;
    else totalLosses += Math.abs(taxableResult);

    totalConsideration += sale;
    disallowedExpenses += expenses;

    lines.push({
      label,
      cost: round2(cost),
      sale: round2(sale),
      expenses: round2(expenses),
      taxableResult: round2(taxableResult),
      economicResult: round2(economicResult),
      isGain: taxableResult > 0,
    });
  }

  // Section 115BBH(2)(b): losses fall away entirely, so only the gains are taxed.
  const taxableIncome = totalGains;
  const baseTax = (taxableIncome * VDA_TAX_RATE) / 100;
  const surcharge = (baseTax * surchargeRatePct) / 100;
  const cess = ((baseTax + surcharge) * HEALTH_EDUCATION_CESS) / 100;
  const totalTax = baseTax + surcharge + cess;

  // The counterfactual: what the tax would be if gains and losses could be netted.
  const nettedIncome = Math.max(0, totalGains - totalLosses);
  const nettedBaseTax = (nettedIncome * VDA_TAX_RATE) / 100;
  const nettedSurcharge = (nettedBaseTax * surchargeRatePct) / 100;
  const nettedCess = ((nettedBaseTax + nettedSurcharge) * HEALTH_EDUCATION_CESS) / 100;
  const nettedTotalTax = nettedBaseTax + nettedSurcharge + nettedCess;

  const netEconomicResult = lines.reduce((sum, line) => sum + line.economicResult, 0);
  const tdsThreshold = isSpecifiedPerson ? TDS_194S_THRESHOLD_SPECIFIED : TDS_194S_THRESHOLD_OTHERS;
  // Section 194S only obliges TDS once aggregate consideration crosses the threshold. Below
  // that, no tax was ever withheld, so the TDS figures must be zero, not just unmentioned.
  const tdsApplies = totalConsideration > tdsThreshold;
  const tds194s = tdsApplies ? (totalConsideration * TDS_194S_RATE) / 100 : 0;

  return {
    lines,
    totalGains: round2(totalGains),
    totalLosses: round2(totalLosses),
    disallowedExpenses: round2(disallowedExpenses),
    taxableIncome: round2(taxableIncome),
    baseTax: round2(baseTax),
    surchargeRatePct,
    surcharge: round2(surcharge),
    cess: round2(cess),
    totalTax: round2(totalTax),
    nettedIncome: round2(nettedIncome),
    nettedTotalTax: round2(nettedTotalTax),
    extraTaxFromNoSetOff: round2(totalTax - nettedTotalTax),
    netEconomicResult: round2(netEconomicResult),
    afterTaxResult: round2(netEconomicResult - totalTax),
    effectiveRateOnEconomicGain:
      netEconomicResult > 0 ? round2((totalTax / netEconomicResult) * 100) : null,
    totalConsideration: round2(totalConsideration),
    tds194s: round2(tds194s),
    tdsThreshold,
    tdsApplies,
    taxPayableAfterTds: round2(Math.max(0, totalTax - tds194s)),
    tdsRefundable: round2(Math.max(0, tds194s - totalTax)),
  };
}

/**
 * Plain-language explanation of what happens to a loss, for a given set of results.
 *
 * @param {object} result Output of computeVdaTax.
 * @returns {Array<string>} statements about the loss position
 */
export function explainLossTreatment(result) {
  if (!result || result.error) return [];
  const statements = [];

  if (result.totalLosses <= 0) {
    statements.push("No loss-making trade was entered, so the set-off bar does not bite this year.");
  } else {
    statements.push(
      `Losses of ₹${Math.round(result.totalLosses).toLocaleString("en-IN")} are ignored entirely. Section 115BBH(2)(b) allows no set off against any income and no carry forward.`,
    );
    if (result.totalGains > 0) {
      statements.push(
        `Tax is charged on the full ₹${Math.round(result.totalGains).toLocaleString("en-IN")} of gains even though the year's real result was ₹${Math.round(result.netEconomicResult).toLocaleString("en-IN")}.`,
      );
    } else {
      statements.push(
        "With no gains to tax there is no liability this year, but the loss also disappears — it cannot be carried into next year.",
      );
    }
  }

  if (result.disallowedExpenses > 0) {
    statements.push(
      `Exchange fees, gas and other costs of ₹${Math.round(result.disallowedExpenses).toLocaleString("en-IN")} are not deductible. Only the cost of acquisition comes off the sale price.`,
    );
  }

  if (result.tdsApplies) {
    statements.push(
      `Total consideration of ₹${Math.round(result.totalConsideration).toLocaleString("en-IN")} is above the ₹${result.tdsThreshold.toLocaleString("en-IN")} threshold, so 1% tax under Section 194S applies and can be claimed as credit in the return.`,
    );
  }

  return statements;
}
