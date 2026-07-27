/**
 * Riding gear budget allocation.
 *
 * THE RULE: gear is bought in protection priority order, not in price order.
 * The budget is walked down the priority list; each item is funded if what is
 * left covers it, and skipped if it does not. Items you already own cost
 * nothing but still count towards coverage.
 *
 * COVERAGE is the share of protection weight you end up wearing:
 *
 *      coverage % = sum(weight of funded or owned core items) / 100
 *
 * The weights below are an explicit editorial ordering, not a measured
 * statistic: head first, then hands, then torso and spine, then legs, then
 * feet. They exist so that the planner cannot tell you a kit with no helmet is
 * "80% done" because you bought expensive boots. Touring extras carry a weight
 * of zero — a rain suit and an intercom make a long day bearable, but they are
 * not protective equipment and are never allowed to inflate the score.
 *
 * STANDARDS quoted per item are the ones the label should actually carry:
 *   IS 4151      helmets sold in India — the ISI mark is a legal requirement
 *   EN 17092     protective garments, classes AAA, AA, A, B and C
 *   EN 1621-1    limb impact protectors, Level 1 and the higher Level 2
 *   EN 1621-2    back protectors, Level 1 and Level 2
 *   EN 13594     gloves, Level 1 and Level 2
 *   EN 13634     footwear
 *
 * PRICES are indicative Indian retail bands to start from, and every one of
 * them is overridable — the arithmetic uses whatever price you enter.
 */

export const TIERS = [
  { id: "entry", label: "Entry" },
  { id: "mid", label: "Mid-range" },
  { id: "premium", label: "Premium" },
];

/**
 * Core protective kit plus touring extras.
 * `protectionWeight` across the six core items sums to 100.
 */
export const GEAR_ITEMS = [
  {
    id: "helmet",
    name: "Full-face helmet",
    priority: 1,
    protectionWeight: 30,
    standard: "IS 4151 (ISI mark) — mandatory in India",
    touring: false,
    tiers: { entry: 2500, mid: 6000, premium: 18000 },
  },
  {
    id: "gloves",
    name: "Armoured gloves",
    priority: 2,
    protectionWeight: 12,
    standard: "EN 13594 Level 1 or 2",
    touring: false,
    tiers: { entry: 1200, mid: 3000, premium: 8000 },
  },
  {
    id: "jacket",
    name: "Riding jacket with armour",
    priority: 3,
    protectionWeight: 20,
    standard: "EN 17092 class A–AAA with EN 1621-1 armour",
    touring: false,
    tiers: { entry: 4000, mid: 9000, premium: 25000 },
  },
  {
    id: "boots",
    name: "Riding boots",
    priority: 4,
    protectionWeight: 13,
    standard: "EN 13634",
    touring: false,
    tiers: { entry: 3000, mid: 7000, premium: 18000 },
  },
  {
    id: "pants",
    name: "Riding trousers",
    priority: 5,
    protectionWeight: 15,
    standard: "EN 17092 with knee and hip armour",
    touring: false,
    tiers: { entry: 3500, mid: 8000, premium: 20000 },
  },
  {
    id: "back",
    name: "Back protector",
    priority: 6,
    protectionWeight: 10,
    standard: "EN 1621-2 Level 1 or 2",
    touring: false,
    tiers: { entry: 1500, mid: 3500, premium: 9000 },
  },
  {
    id: "rainsuit",
    name: "Rain suit",
    priority: 7,
    protectionWeight: 0,
    standard: "Comfort item — no protective standard",
    touring: true,
    tiers: { entry: 1000, mid: 2500, premium: 6000 },
  },
  {
    id: "earplugs",
    name: "Reusable earplugs",
    priority: 8,
    protectionWeight: 0,
    standard: "Hearing protection, rated by SNR/NRR",
    touring: true,
    tiers: { entry: 300, mid: 900, premium: 2500 },
  },
  {
    id: "thermal",
    name: "Thermal / mesh liner layer",
    priority: 9,
    protectionWeight: 0,
    standard: "Comfort item — no protective standard",
    touring: true,
    tiers: { entry: 1200, mid: 2800, premium: 6500 },
  },
  {
    id: "luggage",
    name: "Tail bag or saddle bags",
    priority: 10,
    protectionWeight: 0,
    standard: "Comfort item — no protective standard",
    touring: true,
    tiers: { entry: 2000, mid: 5000, premium: 14000 },
  },
  {
    id: "intercom",
    name: "Bluetooth intercom",
    priority: 11,
    protectionWeight: 0,
    standard: "Comfort item — no protective standard",
    touring: true,
    tiers: { entry: 2500, mid: 7000, premium: 20000 },
  },
];

/** Total protection weight of the core kit — the denominator for coverage. */
export const TOTAL_PROTECTION_WEIGHT = GEAR_ITEMS.filter((item) => !item.touring).reduce(
  (sum, item) => sum + item.protectionWeight,
  0,
);

const MAX_BUDGET = 10_000_000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {number} input.budget         money available right now
 * @param {number} input.monthlySaving  what you can set aside each month
 * @param {boolean} input.touring       include the touring extras
 * @param {Record<string, {include?:boolean, tier?:string, owned?:boolean, price?:number}>} input.selections
 */
export function computeGearBudget({ budget, monthlySaving = 0, touring = false, selections = {} }) {
  if (![budget, monthlySaving].every(isNum))
    return { error: "Enter a valid number for the budget and the monthly saving." };
  if (budget < 0) return { error: "Budget cannot be negative." };
  if (budget > MAX_BUDGET)
    return { error: `Enter a budget of ${MAX_BUDGET.toLocaleString("en-IN")} or less.` };
  if (monthlySaving < 0) return { error: "Monthly saving cannot be negative." };

  const wanted = GEAR_ITEMS.filter((item) => {
    if (item.touring && !touring) return false;
    const selection = selections[item.id];
    return selection?.include !== false;
  }).sort((a, b) => a.priority - b.priority);

  if (wanted.length === 0) return { error: "Select at least one item to plan a budget for." };

  const lines = [];
  let remaining = budget;
  let spend = 0;
  let ownedValue = 0;
  let outstanding = 0;

  for (const item of wanted) {
    const selection = selections[item.id] ?? {};
    const tierId = TIERS.some((tier) => tier.id === selection.tier) ? selection.tier : "mid";
    const override = selection.price;
    if (override !== undefined && (!isNum(override) || override < 0))
      return { error: `Check the price for "${item.name}" — it must be zero or more.` };
    const price = isNum(override) && override > 0 ? override : item.tiers[tierId];
    const owned = Boolean(selection.owned);

    let status;
    if (owned) {
      status = "owned";
      ownedValue += price;
    } else if (price <= remaining) {
      status = "funded";
      remaining -= price;
      spend += price;
    } else {
      status = "deferred";
      outstanding += price;
    }

    lines.push({
      ...item,
      tierId,
      price,
      owned,
      status,
      remainingAfter: remaining,
    });
  }

  const coreLines = lines.filter((line) => !line.touring);
  const coveredWeight = coreLines
    .filter((line) => line.status !== "deferred")
    .reduce((sum, line) => sum + line.protectionWeight, 0);
  const coveragePct = (coveredWeight / TOTAL_PROTECTION_WEIGHT) * 100;
  const missingCore = coreLines.filter((line) => line.status === "deferred");
  const topMissing = missingCore[0] ?? null;

  const totalKitCost = lines
    .filter((line) => !line.owned)
    .reduce((sum, line) => sum + line.price, 0);
  const unspent = remaining;

  const monthsToComplete =
    outstanding <= 0 ? 0 : monthlySaving > 0 ? Math.ceil(outstanding / monthlySaving) : null;

  // The cheapest complete kit, so a tight budget has a floor to aim at.
  const minimumCoreCost = GEAR_ITEMS.filter((item) => !item.touring).reduce(
    (sum, item) => sum + item.tiers.entry,
    0,
  );
  const budgetCoversMinimumCore = budget >= minimumCoreCost;

  const notes = [];
  if (topMissing) {
    notes.push(
      `"${topMissing.name}" is the highest-priority item this budget does not cover. Dropping a tier on something further down the list is usually a better trade than going without it.`,
    );
  }
  if (!budgetCoversMinimumCore && budget > 0) {
    notes.push(
      `An entry-tier version of all six core items comes to about ${minimumCoreCost.toLocaleString("en-IN")} rupees. Below that, buy in priority order over a few months rather than spreading the money thin.`,
    );
  }
  if (unspent > 0 && missingCore.length > 0) {
    notes.push(
      `${Math.round(unspent).toLocaleString("en-IN")} rupees is left unallocated because the next item on the list costs more than that. Save it towards "${topMissing?.name ?? "the next item"}" instead of spending it on an extra.`,
    );
  }
  if (touring) {
    notes.push(
      "Touring extras score zero for protection here on purpose — they earn their place in comfort and fatigue, not in a crash.",
    );
  }
  notes.push(
    "Check the label, not the description: an armoured jacket without an EN 17092 class or EN 1621-1 armour is a fashion item with pockets.",
  );

  return {
    lines,
    coreLines,
    coveragePct,
    coveredWeight,
    missingCore,
    topMissing,
    budget,
    spend,
    unspent,
    outstanding,
    ownedValue,
    totalKitCost,
    monthsToComplete,
    monthlySaving,
    minimumCoreCost,
    budgetCoversMinimumCore,
    notes,
  };
}
