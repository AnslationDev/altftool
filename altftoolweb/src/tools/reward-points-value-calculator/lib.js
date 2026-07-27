/**
 * Credit card reward points: rupee value and effective return.
 *
 * A reward point has no fixed worth — it is worth whatever the redemption route pays.
 * The rupee value of a point is therefore derived, not assumed:
 *
 *     value per point = rupees received / points surrendered
 *
 * Cards award points in whole spend blocks (typically per ₹100 or per ₹150 spent), with
 * the remainder in a block earning nothing, and many cards cap the points earned in a
 * statement cycle. So:
 *
 *     points a month   = min(floor(spend / block) x points per block, monthly cap)
 *     gross value      = points a year x value per point
 *     effective rate   = gross value / annual spend
 *
 * The annual fee is a cost the reward has to cover, and a credit card fee is a supply of
 * services carrying GST at 18%, so the real cost is the fee grossed up by that:
 *
 *     net value = gross value + welcome benefit + milestone benefits - fee x 1.18
 *
 * The break-even spend is the annual spend at which the reward exactly repays the fee,
 * computed in whole spend blocks and reported as unreachable when the monthly cap makes
 * it impossible.
 */

/** GST on a credit card annual or joining fee — a supply of financial services at 18%. */
export const GST_ON_FEE_PCT = 18;

/** The spend block sizes Indian issuers commonly use to award points. */
export const SPEND_BLOCKS = [100, 150, 200];

/** A single point being worth more than this rupee figure is almost certainly a typo. */
export const MAX_POINT_VALUE = 1000;
export const MAX_MONTHLY_SPEND = 10000000;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round2 = (value) => Math.round(value * 100) / 100;
const round4 = (value) => Math.round(value * 10000) / 10000;

/**
 * Rupee value of one point, worked out from an actual redemption.
 * @param {object} input
 * @param {number|string} input.points Points surrendered.
 * @param {number|string} input.rupees Rupee value received for them.
 */
export function pointValueFromRedemption({ points, rupees } = {}) {
  const p = toNumber(points);
  const r = toNumber(rupees);
  if (Number.isNaN(p) || Number.isNaN(r)) return { error: "Enter valid numbers." };
  if (p <= 0) return { error: "Enter the number of points surrendered." };
  if (r < 0) return { error: "Redemption value cannot be negative." };
  return { valuePerPoint: round4(r / p) };
}

function evaluateCard(card, monthlySpend) {
  const name = (card && card.name && String(card.name).trim()) || "Card";
  const fee = toNumber(card && card.annualFee);
  const pointsPerBlock = toNumber(card && card.pointsPerBlock);
  const block = toNumber(card && card.spendBlock, 100);
  const pointValue = toNumber(card && card.pointValue);
  const monthlyCap = toNumber(card && card.monthlyCapPoints);
  const welcome = toNumber(card && card.welcomeValue);
  const milestone = toNumber(card && card.milestoneValue);

  const all = [fee, pointsPerBlock, block, pointValue, monthlyCap, welcome, milestone];
  if (all.some((value) => Number.isNaN(value))) return { error: `Enter valid numbers for ${name}.` };
  if (all.some((value) => value < 0)) return { error: `Values for ${name} cannot be negative.` };
  if (!(block > 0)) return { error: `Set the spend block for ${name} (usually ₹100 or ₹150).` };
  if (pointValue > MAX_POINT_VALUE) {
    return { error: `A point worth more than ₹${MAX_POINT_VALUE} is not realistic (${name}).` };
  }

  const blocksPerMonth = Math.floor(monthlySpend / block);
  const uncappedMonthlyPoints = blocksPerMonth * pointsPerBlock;
  const capped = monthlyCap > 0 && uncappedMonthlyPoints > monthlyCap;
  const monthlyPoints = capped ? monthlyCap : uncappedMonthlyPoints;

  const annualPoints = monthlyPoints * 12;
  const annualSpend = monthlySpend * 12;
  const grossValue = annualPoints * pointValue;
  const totalBenefit = grossValue + welcome + milestone;
  const feeWithGst = fee * (1 + GST_ON_FEE_PCT / 100);
  const netValue = totalBenefit - feeWithGst;

  const valuePerRupee = block > 0 ? (pointsPerBlock * pointValue) / block : 0;
  const effectiveRatePct = annualSpend > 0 ? (grossValue / annualSpend) * 100 : 0;
  const netRatePct = annualSpend > 0 ? (netValue / annualSpend) * 100 : 0;

  // Break-even: annual spend at which reward value exactly repays the GST-inclusive fee.
  // Solved on a monthly basis, because points are capped and blocks are floored monthly.
  const valueToRecover = Math.max(0, feeWithGst - welcome - milestone);
  const valuePerBlock = pointsPerBlock * pointValue;
  let breakEvenMonthlySpend = null;
  let breakEvenReachable = true;
  if (valueToRecover === 0) {
    breakEvenMonthlySpend = 0;
  } else if (valuePerBlock <= 0) {
    breakEvenReachable = false;
  } else {
    const blocksNeededPerMonth = Math.ceil(valueToRecover / 12 / valuePerBlock);
    const maxBlocksPerMonth =
      monthlyCap > 0 ? Math.floor(monthlyCap / pointsPerBlock) : Infinity;
    if (blocksNeededPerMonth > maxBlocksPerMonth) breakEvenReachable = false;
    else breakEvenMonthlySpend = blocksNeededPerMonth * block;
  }

  return {
    name,
    annualFee: round0(fee),
    feeWithGst: round0(feeWithGst),
    pointsPerBlock: round2(pointsPerBlock),
    spendBlock: round0(block),
    pointValue: round4(pointValue),
    monthlyPoints: round0(monthlyPoints),
    annualPoints: round0(annualPoints),
    capped,
    cappedAway: capped ? round0((uncappedMonthlyPoints - monthlyCap) * 12) : 0,
    grossValue: round0(grossValue),
    welcomeValue: round0(welcome),
    milestoneValue: round0(milestone),
    extraBenefits: round0(welcome + milestone),
    totalBenefit: round0(totalBenefit),
    netValue: round0(netValue),
    effectiveRatePct: round2(effectiveRatePct),
    netRatePct: round2(netRatePct),
    valuePerRupee: round4(valuePerRupee),
    breakEvenMonthlySpend:
      breakEvenMonthlySpend === null ? null : round0(breakEvenMonthlySpend),
    breakEvenAnnualSpend:
      breakEvenMonthlySpend === null ? null : round0(breakEvenMonthlySpend * 12),
    breakEvenReachable,
    worthKeeping: netValue > 0,
  };
}

/**
 * @param {object} input
 * @param {number|string} input.monthlySpend Spend routed through the card each month.
 * @param {Array} input.cards Cards to compare.
 */
export function compareRewardCards({ monthlySpend, cards = [] } = {}) {
  const spend = toNumber(monthlySpend);
  if (Number.isNaN(spend)) return { error: "Enter a valid monthly spend." };
  if (spend < 0) return { error: "Monthly spend cannot be negative." };
  if (spend > MAX_MONTHLY_SPEND) {
    return { error: "Enter a monthly spend of ₹1 crore or less." };
  }
  if (!Array.isArray(cards) || cards.length === 0) {
    return { error: "Add at least one card to compare." };
  }

  const evaluated = [];
  for (const card of cards) {
    const row = evaluateCard(card, spend);
    if (row.error) return { error: row.error };
    evaluated.push(row);
  }

  const ranked = [...evaluated].sort((a, b) => b.netValue - a.netValue);
  const best = ranked[0];
  const runnerUp = ranked.length > 1 ? ranked[1] : null;

  return {
    monthlySpend: round0(spend),
    annualSpend: round0(spend * 12),
    cards: evaluated,
    ranked,
    best,
    marginOverNext: runnerUp ? round0(best.netValue - runnerUp.netValue) : null,
    anyWorthKeeping: evaluated.some((row) => row.worthKeeping),
  };
}
