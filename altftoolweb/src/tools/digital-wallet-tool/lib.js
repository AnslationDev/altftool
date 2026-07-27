/**
 * Digital Wallet Manager — holdings valuation and concentration analysis.
 *
 * The wallet is a list of holdings. Each holding has a quantity and a unit
 * price, so its value is simply quantity x unitPrice. From the value column we
 * derive three things:
 *
 *   1. Portfolio value           total = SUM(value_i)
 *   2. Allocation share          share_i = value_i / total * 100
 *   3. Concentration (HHI)       HHI = SUM(share_i^2)
 *
 * The Herfindahl-Hirschman Index is the standard concentration measure defined
 * in the US DOJ / FTC Horizontal Merger Guidelines (2010, s.5.3) as the sum of
 * squared percentage shares. It runs from 10000 (everything in one holding) down
 * towards 0. The reciprocal 10000 / HHI is the "effective number of holdings":
 * how many equally sized positions would give the same concentration.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Asset classes a holding can be tagged with. Purely a grouping key. */
export const ASSET_CLASSES = {
  cash: { label: "Cash & bank" },
  crypto: { label: "Crypto" },
  equity: { label: "Stocks & ETFs" },
  fund: { label: "Mutual funds" },
  metal: { label: "Gold & metals" },
  other: { label: "Other" },
};

export const DEFAULT_ASSET_CLASS = "other";

/**
 * HHI bands. Thresholds 1500 and 2500 are the DOJ/FTC Horizontal Merger
 * Guidelines (2010) cut-offs for unconcentrated / moderately concentrated /
 * highly concentrated markets, applied here to a wallet's allocation.
 */
export const HHI_BANDS = [
  { max: 1500, key: "spread", label: "Well spread", note: "No single holding dominates the wallet." },
  { max: 2500, key: "moderate", label: "Moderately concentrated", note: "A few holdings carry most of the value." },
  { max: 10000, key: "high", label: "Highly concentrated", note: "The wallet's fate rests on one or two holdings." },
];

/** A single position larger than this share of the wallet is flagged. */
export const SINGLE_HOLDING_ALERT_PERCENT = 40;

/** Largest wallet the tool will total, to keep formatting sane. */
export const MAX_WALLET_VALUE = 1e15;

/** Most holdings a single wallet may carry. */
export const MAX_HOLDINGS = 200;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Round to n decimal places without floating-point drift showing through. */
function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Value of one holding.
 *
 * @param {{ quantity: number, unitPrice: number }} holding
 * @returns {{ value: number } | { error: string }}
 */
export function holdingValue({ quantity, unitPrice }) {
  if (!isNum(quantity) || !isNum(unitPrice)) {
    return { error: "Every holding needs a numeric quantity and unit price." };
  }
  if (quantity < 0) return { error: "Quantity cannot be negative." };
  if (unitPrice < 0) return { error: "Unit price cannot be negative." };
  const value = quantity * unitPrice;
  if (!Number.isFinite(value) || value > MAX_WALLET_VALUE) {
    return { error: "That holding is too large to value — check the quantity and price." };
  }
  return { value };
}

/**
 * Look up the concentration band for an HHI score.
 *
 * @param {number} hhi
 * @returns {{ key: string, label: string, note: string }}
 */
export function hhiBand(hhi) {
  const band = HHI_BANDS.find((b) => hhi <= b.max) ?? HHI_BANDS[HHI_BANDS.length - 1];
  return { key: band.key, label: band.label, note: band.note };
}

/**
 * Value a whole wallet and describe how concentrated it is.
 *
 * @param {{ holdings: Array<{ id?: string, name?: string, assetClass?: string, quantity: number, unitPrice: number }> }} input
 * @returns {{ error: string } | {
 *   total: number,
 *   rows: Array<{ id: string, name: string, assetClass: string, classLabel: string, quantity: number, unitPrice: number, value: number, share: number }>,
 *   classes: Array<{ key: string, label: string, value: number, share: number, count: number }>,
 *   hhi: number,
 *   band: { key: string, label: string, note: string },
 *   effectiveHoldings: number,
 *   largest: { name: string, value: number, share: number } | null,
 *   smallest: { name: string, value: number, share: number } | null,
 *   overweight: string[],
 *   count: number,
 * }}
 */
export function analyseWallet({ holdings } = {}) {
  if (!Array.isArray(holdings) || holdings.length === 0) {
    return { error: "Add at least one holding to value the wallet." };
  }
  if (holdings.length > MAX_HOLDINGS) {
    return { error: `This wallet tracks up to ${MAX_HOLDINGS} holdings.` };
  }

  const rows = [];
  let total = 0;

  for (let i = 0; i < holdings.length; i += 1) {
    const raw = holdings[i] ?? {};
    const valued = holdingValue({ quantity: raw.quantity, unitPrice: raw.unitPrice });
    if (valued.error) return { error: valued.error };
    const classKey = ASSET_CLASSES[raw.assetClass] ? raw.assetClass : DEFAULT_ASSET_CLASS;
    total += valued.value;
    rows.push({
      id: String(raw.id ?? i),
      name: String(raw.name ?? "").trim() || `Holding ${i + 1}`,
      assetClass: classKey,
      classLabel: ASSET_CLASSES[classKey].label,
      quantity: raw.quantity,
      unitPrice: raw.unitPrice,
      value: valued.value,
      share: 0,
    });
  }

  if (total <= 0) {
    return { error: "The wallet is worth zero — enter a quantity and price above zero for at least one holding." };
  }
  if (total > MAX_WALLET_VALUE) {
    return { error: "That wallet total is too large to report — check the figures." };
  }

  let hhi = 0;
  for (const row of rows) {
    const share = (row.value / total) * 100;
    row.share = round(share, 2);
    hhi += share * share;
  }

  const byValue = [...rows].sort((a, b) => b.value - a.value);

  const classMap = new Map();
  for (const row of rows) {
    const bucket = classMap.get(row.assetClass) ?? { key: row.assetClass, label: row.classLabel, value: 0, count: 0 };
    bucket.value += row.value;
    bucket.count += 1;
    classMap.set(row.assetClass, bucket);
  }
  const classes = [...classMap.values()]
    .map((c) => ({ ...c, value: round(c.value, 2), share: round((c.value / total) * 100, 2) }))
    .sort((a, b) => b.value - a.value);

  const overweight = byValue
    .filter((r) => r.share > SINGLE_HOLDING_ALERT_PERCENT)
    .map((r) => r.name);

  return {
    total: round(total, 2),
    rows: rows.map((r) => ({ ...r, value: round(r.value, 2) })),
    classes,
    hhi: round(hhi, 0),
    band: hhiBand(hhi),
    effectiveHoldings: round(10000 / hhi, 2),
    largest: byValue[0] ? { name: byValue[0].name, value: round(byValue[0].value, 2), share: byValue[0].share } : null,
    smallest: byValue.length > 1
      ? {
          name: byValue[byValue.length - 1].name,
          value: round(byValue[byValue.length - 1].value, 2),
          share: byValue[byValue.length - 1].share,
        }
      : null,
    overweight,
    count: rows.length,
  };
}

/**
 * How much of one holding to sell so it sits at a target share of the wallet.
 * Solving (value - x) / (total - x) = target gives x = (value - target*total) / (1 - target).
 *
 * @param {{ value: number, total: number, targetPercent: number }} input
 * @returns {{ trimBy: number, alreadyUnder: boolean } | { error: string }}
 */
export function trimToTarget({ value, total, targetPercent } = {}) {
  if (!isNum(value) || !isNum(total) || !isNum(targetPercent)) {
    return { error: "Enter the holding value, wallet total and target share as numbers." };
  }
  if (total <= 0) return { error: "The wallet total must be above zero." };
  if (value < 0 || value > total) return { error: "The holding value must sit between zero and the wallet total." };
  if (targetPercent <= 0 || targetPercent >= 100) {
    return { error: "The target share must be between 0% and 100%." };
  }
  const target = targetPercent / 100;
  if (value / total <= target) return { trimBy: 0, alreadyUnder: true };
  const trimBy = (value - target * total) / (1 - target);
  return { trimBy: round(trimBy, 2), alreadyUnder: false };
}
