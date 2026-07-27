/**
 * Souvenir price fairness.
 *
 * There is no statutory "correct" price for a handicraft, so this tool does not
 * invent one. It works only from prices YOU recorded for the same item at other
 * stalls, shops or markets, and compares a quoted price against that sample.
 *
 * The reference figure is the MEDIAN of the recorded prices, not the mean: with a
 * handful of observations one inflated tourist quote drags a mean upwards, while the
 * median (the middle value of the sorted sample) is unaffected by a single outlier.
 * That is the standard robust measure of centre for small, skewed price samples.
 *
 *     markup over local median (%) = (quoted / median - 1) x 100
 *
 * The negotiation figures use the classic market-haggling anchors, stated openly as
 * a heuristic rather than a rule: open at the cheapest price you actually saw, aim to
 * settle at the median, and walk away above the most expensive price you saw plus a
 * small tolerance for genuine quality differences.
 */

/**
 * Fairness bands, expressed as the ratio of the quoted price to the local median.
 * Each entry is the UPPER edge of its band. The 1.15 edge reflects the point where a
 * quote stops being explainable by ordinary stall-to-stall variation in a small
 * sample; 2.0 is the point where the quote is double the local middle price.
 */
export const FAIRNESS_BANDS = [
  {
    maxRatio: 0.85,
    key: "bargain",
    label: "Below the local range",
    advice: "Cheaper than anything you recorded. Check quality, materials and whether it is the same item before assuming it is a win.",
  },
  {
    maxRatio: 1.15,
    key: "fair",
    label: "Fair price",
    advice: "Within ordinary stall-to-stall variation of what you recorded. Little room to bargain and little reason to.",
  },
  {
    maxRatio: 1.5,
    key: "premium",
    label: "Slight premium",
    advice: "A modest markup. Worth one polite counter-offer, especially if you are buying more than one.",
  },
  {
    maxRatio: 2.0,
    key: "tourist",
    label: "Tourist markup",
    advice: "Clearly above the local middle price. Counter low and be ready to walk; the same item is nearby for less.",
  },
  {
    maxRatio: Infinity,
    key: "inflated",
    label: "Heavily inflated",
    advice: "More than double the local median. Treat the first number as an opening bid, not a price.",
  },
];

/** Tolerance added to the highest recorded price before calling a quote a walk-away. */
export const WALK_AWAY_TOLERANCE = 0.1; // +10% for genuine quality or size differences

/** Sanity ceiling on quantity so a typo cannot produce a meaningless total. */
export const MAX_QUANTITY = 1000;

/** Currencies commonly quoted to travellers, with the locale used to format them. */
export const CURRENCIES = [
  { code: "INR", locale: "en-IN", label: "Indian rupee" },
  { code: "USD", locale: "en-US", label: "US dollar" },
  { code: "EUR", locale: "de-DE", label: "Euro" },
  { code: "GBP", locale: "en-GB", label: "Pound sterling" },
  { code: "THB", locale: "th-TH", label: "Thai baht" },
  { code: "VND", locale: "vi-VN", label: "Vietnamese dong" },
  { code: "IDR", locale: "id-ID", label: "Indonesian rupiah" },
  { code: "AED", locale: "en-AE", label: "UAE dirham" },
  { code: "TRY", locale: "tr-TR", label: "Turkish lira" },
  { code: "MAD", locale: "fr-MA", label: "Moroccan dirham" },
  { code: "JPY", locale: "ja-JP", label: "Japanese yen" },
  { code: "LKR", locale: "en-LK", label: "Sri Lankan rupee" },
];

/**
 * Turn a free-text list of recorded prices into numbers.
 * Accepts commas, spaces or newlines as separators and ignores thousands commas
 * only when they are not being used as separators (i.e. "1200 1500" style input).
 *
 * @returns {{error:string}|{values:number[]}}
 */
export function parsePriceList(raw) {
  const text = String(raw ?? "").trim();
  if (!text) return { error: "Add at least one local price you saw for this item." };

  const tokens = text
    .split(/[,\n;]+|\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const values = [];
  for (const token of tokens) {
    const cleaned = token.replace(/[^0-9.]/g, "");
    if (!cleaned) return { error: `"${token}" is not a price. Use numbers separated by commas.` };
    const value = Number(cleaned);
    if (!Number.isFinite(value)) return { error: `"${token}" is not a price. Use numbers separated by commas.` };
    if (value <= 0) return { error: "Recorded prices must be greater than zero." };
    values.push(value);
  }

  if (values.length === 0) return { error: "Add at least one local price you saw for this item." };
  return { values };
}

/** Median of a numeric array. Average of the two middle values for an even count. */
export function median(values) {
  if (!Array.isArray(values) || values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** Band whose upper edge first covers the quoted-to-median ratio. */
export function bandForRatio(ratio) {
  if (!Number.isFinite(ratio)) return FAIRNESS_BANDS[FAIRNESS_BANDS.length - 1];
  return FAIRNESS_BANDS.find((band) => ratio <= band.maxRatio) ?? FAIRNESS_BANDS[FAIRNESS_BANDS.length - 1];
}

/**
 * Compare one quoted price against the prices recorded elsewhere.
 *
 * @param {object} input
 * @param {number} input.quotedPrice   price the seller just asked for, per unit
 * @param {string|number[]} input.observedPrices  prices seen elsewhere for the same item
 * @param {number} input.quantity      how many units you intend to buy
 * @returns {{error:string}|object}
 */
export function assessSouvenirPrice({ quotedPrice, observedPrices, quantity = 1 }) {
  const quoted = Number(quotedPrice);
  if (!Number.isFinite(quoted)) return { error: "Enter the quoted price as a number." };
  if (quoted <= 0) return { error: "The quoted price must be greater than zero." };

  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) return { error: "Quantity must be at least 1." };
  if (qty > MAX_QUANTITY) return { error: `Quantity above ${MAX_QUANTITY} is probably a typo.` };
  const units = Math.floor(qty);

  const parsed = Array.isArray(observedPrices)
    ? { values: observedPrices.filter((value) => Number.isFinite(value) && value > 0) }
    : parsePriceList(observedPrices);
  if (parsed.error) return { error: parsed.error };
  if (parsed.values.length === 0) return { error: "Add at least one local price you saw for this item." };

  const values = parsed.values;
  const low = Math.min(...values);
  const high = Math.max(...values);
  const mid = median(values);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

  const ratio = quoted / mid;
  const band = bandForRatio(ratio);

  const markupOverMedian = (ratio - 1) * 100;
  const markupOverLow = (quoted / low - 1) * 100;
  const overpayPerUnit = quoted - mid;
  const walkAwayAbove = high * (1 + WALK_AWAY_TOLERANCE);

  return {
    quoted,
    units,
    sampleSize: values.length,
    low,
    high,
    median: mid,
    mean,
    ratio,
    bandKey: band.key,
    verdict: band.label,
    advice: band.advice,
    markupOverMedian,
    markupOverLow,
    overpayPerUnit,
    overpayTotal: overpayPerUnit * units,
    quotedTotal: quoted * units,
    fairTotal: mid * units,
    openingCounter: low,
    targetPrice: mid,
    walkAwayAbove,
    isOverpaying: quoted > mid,
    /** True when the sample is too thin for the median to mean much. */
    thinSample: values.length < 3,
  };
}
