/**
 * Wedding budget allocation for an Indian wedding.
 *
 *   contingency      = total budget x contingency share
 *   allocatable      = total budget - contingency
 *   allocation(c)    = allocatable x share(c)
 *   variance(c)      = quoted or committed cost(c) - allocation(c)
 *
 * Catering is the one head that is genuinely computed rather than allocated, because it is
 * driven by the guest list:
 *
 *   catering cost    = guests x per-plate rate x (1 + tax and service charge)
 *   affordable plate = catering allocation / (guests x (1 + tax))
 *
 * That inversion is the useful one: it converts "how many people can we invite" into a
 * per-plate ceiling you can hold a caterer to.
 *
 * The default shares below are conventional planning benchmarks, not rules — every family
 * spends differently, and each one is editable. What the module enforces is that the shares
 * add to 100%, so no rupee is silently double-counted or lost.
 */

/**
 * Conventional planning split for a full Indian wedding. Shares add to 100.
 * Treat them as a starting point to edit, not as guidance on what to spend.
 */
export const DEFAULT_CATEGORIES = [
  { key: "venue", label: "Venue, decor and lighting", sharePct: 25 },
  { key: "catering", label: "Catering and beverages", sharePct: 25 },
  { key: "jewellery", label: "Jewellery", sharePct: 15 },
  { key: "clothing", label: "Clothing and trousseau", sharePct: 10 },
  { key: "photography", label: "Photography and video", sharePct: 8 },
  { key: "travel", label: "Guest travel and stay", sharePct: 6 },
  { key: "music", label: "Music, DJ and entertainment", sharePct: 4 },
  { key: "rituals", label: "Priest, rituals and gifts", sharePct: 4 },
  { key: "beauty", label: "Makeup and mehendi", sharePct: 3 },
];

/**
 * Indirect tax on wedding catering and venue hire depends on how the service is supplied:
 * outdoor catering is taxed at 5% without input tax credit, while a banquet package from a
 * hotel whose declared room tariff crosses ₹7,500 a day is taxed at 18%. Confirm which one
 * your contract falls under — quotes often show the rate separately from the plate price.
 */
export const TAX_PRESETS = [
  { value: 0, label: "Tax already included in the quote" },
  { value: 5, label: "5% — outdoor catering, no input tax credit" },
  { value: 18, label: "18% — hotel banquet package" },
];

/** Holding back a contingency is standard event-planning practice; 10% is a common default. */
export const DEFAULT_CONTINGENCY_PCT = 10;
export const MAX_CONTINGENCY_PCT = 40;
export const MAX_GUESTS = 20000;
/** Shares must add to 100 within this tolerance. */
export const SHARE_TOLERANCE = 0.05;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round2 = (value) => Math.round(value * 100) / 100;

/** Rescale a set of shares so they add to exactly 100. */
export function normaliseShares(categories) {
  const list = Array.isArray(categories) ? categories : [];
  const total = list.reduce((sum, item) => {
    const share = toNumber(item && item.sharePct);
    return sum + (Number.isNaN(share) ? 0 : Math.max(0, share));
  }, 0);
  if (!(total > 0)) return list;
  return list.map((item) => {
    const share = toNumber(item && item.sharePct);
    const safe = Number.isNaN(share) ? 0 : Math.max(0, share);
    return { ...item, sharePct: round2((safe / total) * 100) };
  });
}

/**
 * @param {object} input
 * @param {number|string} input.totalBudget Everything you intend to spend.
 * @param {Array} input.categories Heads with a share of the budget and an optional quote.
 * @param {number|string} [input.contingencyPct] Share held back for overruns.
 * @param {number|string} [input.guests] Number of guests being catered for.
 * @param {number|string} [input.perPlate] Per-plate rate quoted, before tax.
 * @param {number|string} [input.taxPct] Tax and service charge on the plate rate.
 */
export function planWeddingBudget({
  totalBudget,
  categories = DEFAULT_CATEGORIES,
  contingencyPct = DEFAULT_CONTINGENCY_PCT,
  guests = 0,
  perPlate = 0,
  taxPct = 0,
} = {}) {
  const budget = toNumber(totalBudget);
  const contingency = toNumber(contingencyPct);
  const guestCount = toNumber(guests);
  const plate = toNumber(perPlate);
  const tax = toNumber(taxPct);

  const scalars = [budget, contingency, guestCount, plate, tax];
  if (scalars.some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (scalars.some((value) => value < 0)) {
    return { error: "Budget, guest count and rates cannot be negative." };
  }
  if (!(budget > 0)) return { error: "Enter the total wedding budget." };
  if (contingency > MAX_CONTINGENCY_PCT) {
    return { error: `Hold back ${MAX_CONTINGENCY_PCT}% or less as contingency.` };
  }
  if (guestCount > MAX_GUESTS) return { error: `Enter a guest count of ${MAX_GUESTS} or fewer.` };
  if (tax > 40) return { error: "Enter a tax and service charge of 40% or less." };
  if (!Array.isArray(categories) || categories.length === 0) {
    return { error: "Add at least one spending head." };
  }

  let shareTotal = 0;
  const parsed = [];
  for (const category of categories) {
    const label = (category && category.label && String(category.label).trim()) || "Head";
    const share = toNumber(category && category.sharePct);
    const quoted = toNumber(category && category.quoted);
    if (Number.isNaN(share) || Number.isNaN(quoted)) {
      return { error: `Enter valid numbers for ${label}.` };
    }
    if (share < 0 || quoted < 0) return { error: `Values for ${label} cannot be negative.` };
    shareTotal += share;
    parsed.push({ key: category.key || label, label, share, quoted });
  }

  if (Math.abs(shareTotal - 100) > SHARE_TOLERANCE) {
    return {
      error: `The shares add to ${round2(shareTotal)}% — adjust them to 100% or use the rebalance button.`,
    };
  }

  const contingencyAmount = (budget * contingency) / 100;
  const allocatable = budget - contingencyAmount;

  const rows = parsed.map((item) => {
    const allocation = (allocatable * item.share) / 100;
    const variance = item.quoted - allocation;
    return {
      key: item.key,
      label: item.label,
      sharePct: round2(item.share),
      allocation: round0(allocation),
      quoted: round0(item.quoted),
      variance: round0(variance),
      overBudget: variance > 0.5,
      perGuest: guestCount > 0 ? round0(allocation / guestCount) : null,
    };
  });

  const totalQuoted = rows.reduce((sum, row) => sum + row.quoted, 0);
  const totalAllocated = rows.reduce((sum, row) => sum + row.allocation, 0);
  const remaining = budget - totalQuoted;

  // Catering is driven by the guest list, so it is checked against its own allocation.
  const cateringRow = rows.find((row) => row.key === "catering") || null;
  const taxMultiplier = 1 + tax / 100;
  const cateringEstimate = guestCount * plate * taxMultiplier;
  const affordablePlate =
    cateringRow && guestCount > 0 && taxMultiplier > 0
      ? cateringRow.allocation / (guestCount * taxMultiplier)
      : null;
  const cateringGap = cateringRow ? cateringEstimate - cateringRow.allocation : null;

  let verdict;
  if (totalQuoted === 0) {
    verdict = "No quotes entered yet — the allocation below is your spending ceiling per head.";
  } else if (remaining < 0) {
    verdict = "Quotes already exceed the budget, including the contingency you held back.";
  } else if (remaining < contingencyAmount) {
    verdict = "Quotes are inside the budget but are eating into the contingency.";
  } else {
    verdict = "Quotes are within the allocatable budget with the contingency intact.";
  }

  return {
    totalBudget: round0(budget),
    contingencyPct: round2(contingency),
    contingencyAmount: round0(contingencyAmount),
    allocatable: round0(allocatable),
    totalAllocated: round0(totalAllocated),
    totalQuoted: round0(totalQuoted),
    remaining: round0(remaining),
    committedPct: budget > 0 ? round2((totalQuoted / budget) * 100) : 0,
    guests: round0(guestCount),
    costPerGuest: guestCount > 0 ? round0(budget / guestCount) : null,
    perPlate: round2(plate),
    taxPct: round2(tax),
    cateringEstimate: round0(cateringEstimate),
    cateringAllocation: cateringRow ? cateringRow.allocation : null,
    cateringGap: cateringGap === null ? null : round0(cateringGap),
    cateringOverBudget: cateringGap !== null && cateringGap > 0.5,
    affordablePlate: affordablePlate === null ? null : round0(affordablePlate),
    overBudget: remaining < 0,
    verdict,
    rows,
  };
}
