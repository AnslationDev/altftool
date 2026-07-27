/**
 * Two-income household expense split.
 *
 * Three well-defined ways to divide a pot of shared household costs between
 * two earners. Each is a closed-form rule, not a rule of thumb:
 *
 *   EQUAL          cA = cB = S / 2
 *                  Simple, but the lower earner surrenders a larger fraction of
 *                  their income and is left with less discretionary money.
 *
 *   PROPORTIONAL   cA = S x availA / (availA + availB)
 *                  Each partner contributes the same PERCENTAGE of available
 *                  income, so the burden is equal in relative terms. This is the
 *                  income-ratio method used by most couples-finance guidance.
 *
 *   EQUAL_LEFTOVER cA = (S + availA - availB) / 2
 *                  Solves availA - cA = availB - cB subject to cA + cB = S, so
 *                  both partners end the month with the same ABSOLUTE spending
 *                  money. Derivation: substitute cB = S - cA into the equality
 *                  and rearrange. When the income gap is wider than the whole
 *                  expense pot the solution falls outside [0, S] and is clamped,
 *                  because no split of S can close the gap.
 *
 * "Available" income is take-home pay minus each partner's own non-shared
 * obligations (an education loan, support sent to parents, a personal EMI).
 * Setting those to zero reduces the methods to plain take-home ratios.
 *
 * All figures are per month and every function is pure.
 */

/** Number of partners in the split. The formulas above assume exactly two. */
export const PARTNERS = 2;

export const METHODS = [
  {
    id: "equal",
    label: "Equal split",
    blurb: "Both pay half of every shared bill, regardless of what they earn.",
  },
  {
    id: "proportional",
    label: "Proportional to income",
    blurb: "Each pays the same percentage of their available income.",
  },
  {
    id: "equal-leftover",
    label: "Equal leftover",
    blurb: "Contributions are set so both end the month with the same spending money.",
  },
];

/** Common shared household lines, used as the starting expense list. */
export const EXPENSE_PRESETS = [
  "Rent or home loan EMI",
  "Groceries",
  "Electricity and water",
  "Internet and mobile",
  "Househelp and maintenance",
  "Transport and fuel",
  "Childcare and school fees",
  "Insurance premiums",
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Split shared household expenses between two earners, three ways.
 *
 * @returns {object} every method costed out, or { error } for invalid input.
 */
export function splitHousehold({
  nameA = "Partner A",
  nameB = "Partner B",
  incomeA,
  incomeB,
  obligationsA = 0,
  obligationsB = 0,
  expenses = [],
}) {
  const numeric = { incomeA, incomeB, obligationsA, obligationsB };
  for (const [key, value] of Object.entries(numeric)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${key}.` };
  }
  if (incomeA < 0 || incomeB < 0) return { error: "Monthly income cannot be negative." };
  if (obligationsA < 0 || obligationsB < 0) {
    return { error: "Personal obligations cannot be negative." };
  }
  if (obligationsA > incomeA) {
    return { error: `${nameA}'s personal obligations are larger than their take-home pay.` };
  }
  if (obligationsB > incomeB) {
    return { error: `${nameB}'s personal obligations are larger than their take-home pay.` };
  }
  if (!Array.isArray(expenses)) return { error: "Shared expenses must be a list." };

  const lines = [];
  for (const item of expenses) {
    const value = item?.amount;
    if (!isNum(value)) return { error: "Every shared expense needs a numeric amount." };
    if (value < 0) return { error: "A shared expense cannot be negative." };
    lines.push({ id: item.id, label: item.label || "Shared expense", amount: round2(value) });
  }

  const shared = round2(lines.reduce((sum, line) => sum + line.amount, 0));
  if (shared <= 0) return { error: "Add at least one shared expense greater than zero." };

  const availA = round2(incomeA - obligationsA);
  const availB = round2(incomeB - obligationsB);
  const availTotal = round2(availA + availB);

  if (availTotal <= 0) {
    return { error: "After personal obligations there is no income left to share expenses from." };
  }
  if (shared > availTotal) {
    return {
      error: `Shared expenses of ${round2(shared)} exceed the combined available income of ${availTotal}. One of the figures needs revisiting.`,
    };
  }

  const build = (id, rawA) => {
    const contribA = round2(clamp(rawA, 0, shared));
    const contribB = round2(shared - contribA);
    const clamped = Math.abs(contribA - rawA) > 0.01;
    return {
      id,
      contribA,
      contribB,
      shareA: round2((contribA / shared) * 100),
      shareB: round2((contribB / shared) * 100),
      leftoverA: round2(availA - contribA),
      leftoverB: round2(availB - contribB),
      burdenA: availA > 0 ? round2((contribA / availA) * 100) : null,
      burdenB: availB > 0 ? round2((contribB / availB) * 100) : null,
      leftoverGap: round2(Math.abs(availA - contribA - (availB - contribB))),
      clamped,
    };
  };

  const results = {
    equal: build("equal", shared / PARTNERS),
    proportional: build("proportional", (shared * availA) / availTotal),
    "equal-leftover": build("equal-leftover", (shared + availA - availB) / PARTNERS),
  };

  // Per-line contributions under the proportional rule, the split couples
  // usually settle on for standing instructions.
  const ratioA = availA / availTotal;
  const lineSplit = lines.map((line) => ({
    ...line,
    aPays: round2(line.amount * ratioA),
    bPays: round2(line.amount - round2(line.amount * ratioA)),
  }));

  return {
    nameA,
    nameB,
    shared,
    availA,
    availB,
    availTotal,
    incomeShareA: round2(ratioA * 100),
    incomeShareB: round2((1 - ratioA) * 100),
    lines: lineSplit,
    results,
  };
}

/**
 * Which method leaves the two partners closest to the same spending money,
 * with the equal-leftover rule winning ties by construction.
 */
export function fairestMethod(split) {
  if (!split || split.error) return null;
  const entries = Object.values(split.results);
  return entries.reduce((best, current) =>
    current.leftoverGap < best.leftoverGap ? current : best,
  ).id;
}
