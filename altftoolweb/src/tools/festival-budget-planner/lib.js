/**
 * Festival and gifting budget.
 *
 * Gifts are the part that runs away, because the cost is a product of two numbers people
 * think about separately:
 *
 *     groupCost = recipients * amountPerRecipient
 *     giftsTotal = Σ groupCost
 *
 * Everything else is a flat category amount. A contingency percentage is applied on top,
 * and the result is compared against a budget cap and against monthly income:
 *
 *     subtotal   = giftsTotal + food + travel + decor + clothing + puja + misc
 *     total      = subtotal * (1 + contingencyPct/100)
 *
 * Two real thresholds are checked, both at ₹50,000:
 *
 *  - Section 56(2)(x) of the Income-tax Act: where the aggregate value of money or
 *    property received without consideration from persons who are not "relatives" as
 *    defined in the section exceeds ₹50,000 in a financial year, the whole aggregate — not
 *    just the excess — is taxable in the recipient's hands as income from other sources.
 *    Gifts from specified relatives, and gifts on the occasion of the recipient's marriage,
 *    are outside the charge. So a large gift to a friend or colleague can create a tax
 *    liability for them, not for you.
 *
 *  - Schedule I of the CGST Act: gifts by an employer to an employee not exceeding ₹50,000
 *    in value in a financial year are not treated as a supply, so no GST arises on them.
 *    Above that value the position changes.
 *
 * These are informational flags, not advice; the definitions of "relative" and the
 * treatment of specific gifts are detailed and worth checking with a professional.
 *
 * Finally the total is converted to a monthly saving over the months left before the
 * festival, using the ordinary-annuity payment C = gap * i / ((1+i)^n - 1).
 */

/** Section 56(2)(x) aggregate threshold for gifts from non-relatives, per financial year. */
export const GIFT_TAX_THRESHOLD = 50000;
/** Schedule I, CGST Act: employer-to-employee gift value not treated as a supply, per FY. */
export const EMPLOYEE_GIFT_GST_THRESHOLD = 50000;

export const RELATIONS = [
  { id: "relative", label: "Relative (as defined in section 56)", checkThreshold: false },
  { id: "non-relative", label: "Friend, colleague or other non-relative", checkThreshold: true },
  { id: "employee", label: "Employee", checkThreshold: true },
];

export const MAX_GIFT_GROUPS = 20;
export const MAX_RECIPIENTS = 500;
export const MAX_CONTINGENCY_PCT = 50;
export const MAX_MONTHS = 24;
export const MAX_RATE_PCT = 15;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {Array} input.giftGroups [{ id, name, recipients, perRecipient, relation }]
 * @param {number|string} [input.food] Sweets, catering and entertaining at home.
 * @param {number|string} [input.travel] Travel to family or a festival trip.
 * @param {number|string} [input.decor] Lights, rangoli, flowers and decorations.
 * @param {number|string} [input.clothing] New clothes for the household.
 * @param {number|string} [input.puja] Puja items, temple offerings and donations.
 * @param {number|string} [input.misc] Fireworks, outings and anything else.
 * @param {number|string} [input.contingencyPct] Buffer on the whole budget.
 * @param {number|string} [input.budgetCap] The amount you intend not to exceed.
 * @param {number|string} [input.monthlyIncome] Monthly take-home pay, for the share figure.
 * @param {number|string} [input.monthsToFestival] Months left to save.
 * @param {number|string} [input.existingSavings] Amount already set aside.
 * @param {number|string} [input.savingsReturn] Return on those savings, % per year.
 */
export function planFestivalBudget({
  giftGroups = [],
  food = 0,
  travel = 0,
  decor = 0,
  clothing = 0,
  puja = 0,
  misc = 0,
  contingencyPct = 10,
  budgetCap = 0,
  monthlyIncome = 0,
  monthsToFestival = 3,
  existingSavings = 0,
  savingsReturn = 0,
} = {}) {
  if (!Array.isArray(giftGroups)) return { error: "Gift list is missing." };
  if (giftGroups.length > MAX_GIFT_GROUPS) {
    return { error: `Plan up to ${MAX_GIFT_GROUPS} gift groups at a time.` };
  }

  const foodAmount = toNumber(food);
  const travelAmount = toNumber(travel);
  const decorAmount = toNumber(decor);
  const clothingAmount = toNumber(clothing);
  const pujaAmount = toNumber(puja);
  const miscAmount = toNumber(misc);
  const buffer = toNumber(contingencyPct);
  const cap = toNumber(budgetCap);
  const income = toNumber(monthlyIncome);
  const months = toNumber(monthsToFestival);
  const existing = toNumber(existingSavings);
  const returnPct = toNumber(savingsReturn);

  const scalars = [
    foodAmount, travelAmount, decorAmount, clothingAmount, pujaAmount, miscAmount,
    buffer, cap, income, months, existing, returnPct,
  ];
  if (scalars.some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every amount field." };
  }
  if (scalars.some((value) => value < 0)) {
    return { error: "Amounts, rates and months cannot be negative." };
  }
  if (buffer > MAX_CONTINGENCY_PCT) {
    return { error: `A contingency above ${MAX_CONTINGENCY_PCT}% is not a budget.` };
  }
  if (!(months >= 1) || months > MAX_MONTHS) {
    return { error: `Months until the festival should be between 1 and ${MAX_MONTHS}.` };
  }
  if (returnPct > MAX_RATE_PCT) {
    return { error: `An assumed return above ${MAX_RATE_PCT}% a year is not realistic for a short goal.` };
  }

  const giftRows = [];
  const flags = [];
  for (const group of giftGroups) {
    // Rounded once, up front, so the same whole-number "people" count is used
    // for both the cost multiplication and the displayed row — otherwise the
    // table can show People x Each that doesn't actually multiply out to Total.
    const recipients = Math.round(toNumber(group?.recipients));
    const perRecipient = toNumber(group?.perRecipient);
    const relation = RELATIONS.find((entry) => entry.id === group?.relation) ?? RELATIONS[0];

    if (Number.isNaN(recipients) || Number.isNaN(perRecipient)) {
      return { error: `Enter valid numbers for "${group?.name || "each gift group"}".` };
    }
    if (recipients < 0 || perRecipient < 0) return { error: "Gift counts and amounts cannot be negative." };
    if (recipients > MAX_RECIPIENTS) {
      return { error: `Recipients per group should be ${MAX_RECIPIENTS} or fewer.` };
    }

    const cost = recipients * perRecipient;
    giftRows.push({
      id: group?.id,
      name: group?.name?.trim() || "Gift group",
      recipients,
      perRecipient: round0(perRecipient),
      relation: relation.id,
      relationLabel: relation.label,
      cost,
    });

    if (relation.checkThreshold && perRecipient > GIFT_TAX_THRESHOLD) {
      flags.push(
        relation.id === "employee"
          ? `"${group?.name || "Employee gifts"}" exceeds ₹${GIFT_TAX_THRESHOLD.toLocaleString("en-IN")} per employee in the financial year, above which Schedule I of the CGST Act stops treating the gift as outside the scope of supply.`
          : `"${group?.name || "Gifts"}" exceeds ₹${GIFT_TAX_THRESHOLD.toLocaleString("en-IN")} per recipient. Under section 56(2)(x), where a non-relative's total gifts in the financial year cross that figure, the whole aggregate is taxable in their hands.`,
      );
    }
  }

  const giftsTotal = giftRows.reduce((sum, row) => sum + row.cost, 0);

  const categories = [
    { label: "Gifts", amount: giftsTotal },
    { label: "Food, sweets & entertaining", amount: foodAmount },
    { label: "Travel", amount: travelAmount },
    { label: "Decor & lights", amount: decorAmount },
    { label: "Clothing", amount: clothingAmount },
    { label: "Puja & donations", amount: pujaAmount },
    { label: "Outings & extras", amount: miscAmount },
  ];

  const subtotal = categories.reduce((sum, entry) => sum + entry.amount, 0);
  if (!(subtotal > 0)) {
    return { error: "Everything is zero — enter at least one part of the festival budget." };
  }

  const contingency = (subtotal * buffer) / 100;
  const total = subtotal + contingency;

  const overCap = cap > 0 ? total - cap : null;
  const capUsedPct = cap > 0 ? round1((total / cap) * 100) : null;
  const incomeSharePct = income > 0 ? round1((total / income) * 100) : null;

  const wholeMonths = Math.round(months);
  const i = returnPct / 100 / 12;
  const growthFactor = Math.pow(1 + i, wholeMonths);
  const existingFuture = existing * growthFactor;
  const gap = Math.max(0, total - existingFuture);
  let monthlySaving = 0;
  if (gap > 0) {
    monthlySaving = i <= 0 ? gap / wholeMonths : (gap * i) / (growthFactor - 1);
    if (!Number.isFinite(monthlySaving)) monthlySaving = 0;
  }

  return {
    giftRows: giftRows
      .map((row) => ({
        ...row,
        cost: round0(row.cost),
        sharePct: giftsTotal > 0 ? round2((row.cost / giftsTotal) * 100) : 0,
      }))
      .sort((a, b) => b.cost - a.cost),
    giftsTotal: round0(giftsTotal),
    giftRecipients: giftRows.reduce((sum, row) => sum + row.recipients, 0),
    categories: categories
      .filter((entry) => entry.amount > 0)
      .map((entry) => ({
        label: entry.label,
        amount: round0(entry.amount),
        sharePct: round2((entry.amount / subtotal) * 100),
      }))
      .sort((a, b) => b.amount - a.amount),
    subtotal: round0(subtotal),
    nonGiftTotal: round0(subtotal - giftsTotal),
    contingency: round0(contingency),
    total: round0(total),
    budgetCap: round0(cap),
    overCap: overCap === null ? null : round0(Math.max(0, overCap)),
    underCap: overCap === null ? null : round0(Math.max(0, -overCap)),
    withinCap: overCap === null ? null : overCap <= 0,
    capUsedPct,
    incomeSharePct,
    monthsToFestival: wholeMonths,
    existingFuture: round0(existingFuture),
    gap: round0(gap),
    monthlySaving: round0(monthlySaving),
    fullyFunded: gap <= 0,
    flags,
  };
}
