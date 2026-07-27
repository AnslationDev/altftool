/**
 * MSP realisation for a mandi sale.
 *
 * Minimum Support Price (MSP) is announced per quintal by the Cabinet Committee on
 * Economic Affairs on the recommendation of the Commission for Agricultural Costs and
 * Prices (CACP), separately for each Kharif (KMS) and Rabi (RMS) season. MSP is a
 * *gross* price at the procurement centre. What a farmer actually keeps after selling
 * in an APMC mandi is lower, because the sale carries statutory and customary
 * deductions:
 *
 *   net realisation per quintal
 *     = mandi price
 *       - market fee / cess          (ad valorem, levied by the State APMC Act)
 *       - arhtiya (commission agent) charge (ad valorem, capped by State rules)
 *       - hamali / weighing / loading (per quintal)
 *       - gunny bag or bardana cost   (per quintal)
 *       - (transport + other lump sums) / quantity
 *
 * The tool then compares that net figure with MSP, and optionally applies the Price
 * Deficiency Payment Scheme (PDPS) rule under the PM-AASHA umbrella, where the
 * difference between MSP and the market price is paid to a registered farmer and the
 * payment is limited to a share of MSP.
 *
 * MSP itself is NOT hardcoded here: it changes every season and per crop and grade, so
 * it is taken as an input. Look up the current notified MSP before using this tool.
 */

/**
 * PDPS (Price Deficiency Payment Scheme, PM-AASHA) pays MSP minus the market price to a
 * registered farmer, with the payment capped at this share of MSP.
 */
export const PDPS_CAP_PCT = 25;

/** A quintal is 100 kg — the unit MSP is always announced in. */
export const KG_PER_QUINTAL = 100;

/** Sanity ceilings so a typo cannot produce a nonsense answer. */
export const MAX_AD_VALOREM_PCT = 25;
export const MAX_QUINTALS = 100000;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {number|string} input.mspPerQuintal Notified MSP for the crop and grade, per quintal.
 * @param {number|string} input.mandiPricePerQuintal Price actually quoted in the mandi, per quintal.
 * @param {number|string} input.quantityQuintals Quantity sold, in quintals.
 * @param {number|string} [input.mandiFeePct] Market fee / cess as % of the mandi price.
 * @param {number|string} [input.commissionPct] Arhtiya commission as % of the mandi price.
 * @param {number|string} [input.labourPerQuintal] Hamali, weighing, loading per quintal.
 * @param {number|string} [input.gunnyPerQuintal] Gunny bag / bardana cost per quintal.
 * @param {number|string} [input.transportTotal] One-time transport cost for the whole lot.
 * @param {number|string} [input.otherTotal] Any other lump-sum cost for the whole lot.
 * @param {boolean} [input.applyPdps] Apply the PDPS deficiency payment on top.
 */
export function computeMspRealisation({
  mspPerQuintal,
  mandiPricePerQuintal,
  quantityQuintals,
  mandiFeePct = 0,
  commissionPct = 0,
  labourPerQuintal = 0,
  gunnyPerQuintal = 0,
  transportTotal = 0,
  otherTotal = 0,
  applyPdps = false,
} = {}) {
  const msp = toNumber(mspPerQuintal);
  const price = toNumber(mandiPricePerQuintal);
  const qty = toNumber(quantityQuintals);
  const feePct = toNumber(mandiFeePct);
  const commPct = toNumber(commissionPct);
  const labour = toNumber(labourPerQuintal);
  const gunny = toNumber(gunnyPerQuintal);
  const transport = toNumber(transportTotal);
  const other = toNumber(otherTotal);

  const all = [msp, price, qty, feePct, commPct, labour, gunny, transport, other];
  if (all.some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (all.some((value) => value < 0)) {
    return { error: "Prices, quantities and costs cannot be negative." };
  }
  if (!(msp > 0)) return { error: "Enter the notified MSP per quintal for your crop." };
  if (!(price > 0)) return { error: "Enter the mandi price you were offered, per quintal." };
  if (!(qty > 0)) return { error: "Enter the quantity sold in quintals." };
  if (qty > MAX_QUINTALS) {
    return { error: `Quantity looks too large — enter up to ${MAX_QUINTALS} quintals.` };
  }
  if (feePct > MAX_AD_VALOREM_PCT || commPct > MAX_AD_VALOREM_PCT) {
    return {
      error: `Market fee and commission are each well under ${MAX_AD_VALOREM_PCT}% of the sale value.`,
    };
  }

  const adValoremPct = feePct + commPct;
  const mandiFee = round2((price * feePct) / 100);
  const commission = round2((price * commPct) / 100);
  const lumpSumPerQuintal = round2((transport + other) / qty);

  const deductionsPerQuintal = round2(
    mandiFee + commission + labour + gunny + lumpSumPerQuintal,
  );
  const netPerQuintal = round2(price - deductionsPerQuintal);

  const grossTotal = round2(price * qty);
  const deductionsTotal = round2(deductionsPerQuintal * qty);
  const netTotal = round2(netPerQuintal * qty);

  const mspTotal = round2(msp * qty);
  const gapPerQuintal = round2(netPerQuintal - msp);
  const gapTotal = round2(gapPerQuintal * qty);
  const realisationPct = round2((netPerQuintal / msp) * 100);
  const deductionSharePct = round2((deductionsPerQuintal / price) * 100);

  // PDPS compares the *market* price with MSP, not the farmer's net price, and the
  // payout is limited to PDPS_CAP_PCT of MSP.
  const rawDeficit = Math.max(0, msp - price);
  const pdpsCap = round2((msp * PDPS_CAP_PCT) / 100);
  const pdpsPerQuintal = applyPdps ? round2(Math.min(rawDeficit, pdpsCap)) : 0;
  const pdpsTotal = round2(pdpsPerQuintal * qty);
  const pdpsCapped = applyPdps && rawDeficit > pdpsCap;

  const netWithSupportPerQuintal = round2(netPerQuintal + pdpsPerQuintal);
  const netWithSupportTotal = round2(netWithSupportPerQuintal * qty);

  // Mandi price at which the farmer's NET equals MSP:
  //   msp = P*(1 - adValorem) - perQuintalFixed  =>  P = (msp + fixed) / (1 - adValorem)
  const fixedPerQuintal = labour + gunny + lumpSumPerQuintal;
  const retention = 1 - adValoremPct / 100;
  const breakEvenPrice =
    retention > 0 ? round2((msp + fixedPerQuintal) / retention) : null;

  const breakdown = [
    { label: `Market fee / cess (${round2(feePct)}%)`, perQuintal: mandiFee },
    { label: `Commission agent (${round2(commPct)}%)`, perQuintal: commission },
    { label: "Hamali, weighing and loading", perQuintal: round2(labour) },
    { label: "Gunny bags / bardana", perQuintal: round2(gunny) },
    { label: "Transport and other lump sums", perQuintal: lumpSumPerQuintal },
  ]
    .filter((row) => row.perQuintal > 0)
    .map((row) => ({ ...row, total: round2(row.perQuintal * qty) }));

  let verdict;
  if (gapPerQuintal >= 0) {
    verdict = "Your net realisation is at or above MSP.";
  } else if (price >= msp) {
    verdict =
      "The quoted price beats MSP, but deductions pull your net below it — negotiate the commission or cut transport.";
  } else {
    verdict = "Both the quoted price and your net realisation are below MSP.";
  }

  return {
    quantityQuintals: round2(qty),
    quantityKg: round2(qty * KG_PER_QUINTAL),
    msp: round2(msp),
    mandiPrice: round2(price),
    deductionsPerQuintal,
    deductionSharePct,
    netPerQuintal,
    grossTotal,
    deductionsTotal,
    netTotal,
    mspTotal,
    gapPerQuintal,
    gapTotal,
    realisationPct,
    breakEvenPrice,
    breakdown,
    pdpsApplied: Boolean(applyPdps),
    pdpsPerQuintal,
    pdpsTotal,
    pdpsCap,
    pdpsCapped,
    netWithSupportPerQuintal,
    netWithSupportTotal,
    verdict,
  };
}
