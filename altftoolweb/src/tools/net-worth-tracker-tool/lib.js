/**
 * Net worth statement.
 *
 *   net worth = everything you own (assets, at today's realisable value)
 *             - everything you owe (liabilities, at outstanding principal)
 *
 * Beyond the headline figure the module reports the three ratios a net worth statement
 * exists to expose:
 *
 *   debt-to-asset ratio = total liabilities / total assets
 *   liquidity          = assets convertible to cash in days, as months of expenses
 *   financial share    = financial assets / total assets (as opposed to property,
 *                        gold and vehicles, which cannot be sold in slices)
 *
 * The optional wealth benchmark is the Stanley and Danko rule from *The Millionaire Next
 * Door*: expected net worth = age x annual pre-tax income / 10. Someone at or above twice
 * that figure is called a prodigious accumulator of wealth, at or below half of it an
 * under-accumulator. It is a rough yardstick, not a target — it is unkind to the young
 * and to anyone who has just cleared a large debt.
 */

/**
 * Asset buckets. `liquid` means realisable in days without a penalty or a buyer being
 * found; retirement balances are excluded because EPF, PPF and NPS are locked or
 * restricted. `financial` separates paper assets from property, metal and vehicles.
 */
export const ASSET_CATEGORIES = [
  { value: "cash", label: "Cash, bank and sweep balances", liquid: true, financial: true },
  { value: "deposits", label: "Fixed and recurring deposits", liquid: true, financial: true },
  { value: "equity", label: "Stocks and mutual funds", liquid: true, financial: true },
  { value: "debtFunds", label: "Bonds and debt funds", liquid: true, financial: true },
  { value: "retirement", label: "EPF, PPF, NPS and pension", liquid: false, financial: true },
  { value: "insurance", label: "Endowment or ULIP surrender value", liquid: false, financial: true },
  { value: "realEstate", label: "Property and land", liquid: false, financial: false },
  { value: "gold", label: "Gold, silver and jewellery", liquid: false, financial: false },
  { value: "vehicle", label: "Vehicles", liquid: false, financial: false, depreciating: true },
  { value: "business", label: "Business or unlisted holdings", liquid: false, financial: false },
  { value: "receivable", label: "Money lent out and receivables", liquid: false, financial: true },
  { value: "otherAsset", label: "Other assets", liquid: false, financial: false },
];

/** Liability buckets. `unsecured` debt is the costly kind and is called out separately. */
export const LIABILITY_CATEGORIES = [
  { value: "homeLoan", label: "Home loan", unsecured: false },
  { value: "vehicleLoan", label: "Car or two-wheeler loan", unsecured: false },
  { value: "educationLoan", label: "Education loan", unsecured: false },
  { value: "goldLoan", label: "Gold or property-backed loan", unsecured: false },
  { value: "personalLoan", label: "Personal loan", unsecured: true },
  { value: "creditCard", label: "Credit card outstanding", unsecured: true },
  { value: "bnpl", label: "Buy-now-pay-later and consumer EMI", unsecured: true },
  { value: "otherLiability", label: "Other borrowings", unsecured: true },
];

/** Debt above this share of assets is the level planners commonly flag for review. */
export const DEBT_TO_ASSET_CAUTION_PCT = 50;
/** Debt above this share leaves very little cushion if asset values fall. */
export const DEBT_TO_ASSET_SEVERE_PCT = 80;
/** Standard contingency guidance: three to six months of expenses held liquid. */
export const LIQUIDITY_TARGET_MONTHS = 6;
/** Stanley and Danko: expected net worth = age x annual income / this divisor. */
export const WEALTH_FORMULA_DIVISOR = 10;
/** At or above this multiple of expected net worth: prodigious accumulator. */
export const PAW_MULTIPLE = 2;
/** At or below this multiple: under-accumulator. */
export const UAW_MULTIPLE = 0.5;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

// Math.round can return -0 for a tiny negative input (e.g. -0.25), which
// Intl.NumberFormat then renders as "-₹0" — a breakeven position reading as
// debt. Normalise -0 to 0 so the headline never looks negative when it isn't.
const round0 = (value) => Math.round(value) || 0;
// Same -0 hazard applies here: the wealth-benchmark ratio (netWorth / expected)
// can be a tiny negative fraction that rounds to -0, which Intl.NumberFormat
// then renders as "-0x" for a near-breakeven net worth. Normalise it away.
const round2 = (value) => Math.round(value * 100) / 100 || 0;

const findCategory = (list, value) => list.find((item) => item.value === value) || null;

function tally(entries, categories) {
  const rows = [];
  let total = 0;
  let bad = false;
  for (const entry of entries || []) {
    const amount = toNumber(entry && entry.amount);
    if (Number.isNaN(amount) || amount < 0) {
      bad = true;
      continue;
    }
    if (amount === 0) continue;
    const category = findCategory(categories, entry && entry.category);
    if (!category) {
      bad = true;
      continue;
    }
    total += amount;
    rows.push({
      label: (entry && entry.label && String(entry.label).trim()) || category.label,
      category,
      amount,
    });
  }
  return { rows, total, bad };
}

/**
 * @param {object} input
 * @param {Array<{label?:string, category:string, amount:number|string}>} input.assets
 * @param {Array<{label?:string, category:string, amount:number|string}>} input.liabilities
 * @param {number|string} [input.monthlyExpenses] Household outgo, for the liquidity ratio.
 * @param {number|string} [input.age] Your age, for the optional wealth benchmark.
 * @param {number|string} [input.annualIncome] Annual pre-tax income, for the benchmark.
 */
export function computeNetWorth({
  assets = [],
  liabilities = [],
  monthlyExpenses = 0,
  age = 0,
  annualIncome = 0,
} = {}) {
  const expenses = toNumber(monthlyExpenses);
  const ageValue = toNumber(age);
  const income = toNumber(annualIncome);

  if ([expenses, ageValue, income].some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers for expenses, age and income." };
  }
  if (expenses < 0 || ageValue < 0 || income < 0) {
    return { error: "Expenses, age and income cannot be negative." };
  }
  if (ageValue > 120) return { error: "Enter an age of 120 or less." };

  const assetSide = tally(assets, ASSET_CATEGORIES);
  const liabilitySide = tally(liabilities, LIABILITY_CATEGORIES);

  if (assetSide.bad || liabilitySide.bad) {
    return { error: "Every row needs a category and an amount of zero or more." };
  }
  if (assetSide.rows.length === 0 && liabilitySide.rows.length === 0) {
    return { error: "Add at least one asset or liability to build a net worth statement." };
  }

  // Round each row once, up front, then derive every total (headline figure
  // and every sub-total: liquid, financial, depreciating, unsecured) from
  // those same rounded rows. Otherwise the headline — rounded once from the
  // raw sum — can land a rupee away from what the itemised rows below it add
  // up to.
  const assetRows = assetSide.rows.map((row) => ({ ...row, roundedAmount: round0(row.amount) }));
  const liabilityRows = liabilitySide.rows.map((row) => ({ ...row, roundedAmount: round0(row.amount) }));

  const totalAssets = assetRows.reduce((sum, row) => sum + row.roundedAmount, 0);
  const totalLiabilities = liabilityRows.reduce((sum, row) => sum + row.roundedAmount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const liquidAssets = assetRows
    .filter((row) => row.category.liquid)
    .reduce((sum, row) => sum + row.roundedAmount, 0);
  const financialAssets = assetRows
    .filter((row) => row.category.financial)
    .reduce((sum, row) => sum + row.roundedAmount, 0);
  const depreciatingAssets = assetRows
    .filter((row) => row.category.depreciating)
    .reduce((sum, row) => sum + row.roundedAmount, 0);
  const unsecuredDebt = liabilityRows
    .filter((row) => row.category.unsecured)
    .reduce((sum, row) => sum + row.roundedAmount, 0);

  const share = (part) => (totalAssets > 0 ? round2((part / totalAssets) * 100) : 0);

  const composition = assetRows
    .map((row) => ({
      label: row.label,
      categoryLabel: row.category.label,
      amount: row.roundedAmount,
      sharePct: share(row.roundedAmount),
      liquid: Boolean(row.category.liquid),
    }))
    .sort((a, b) => b.amount - a.amount);

  const debts = liabilityRows
    .map((row) => ({
      label: row.label,
      categoryLabel: row.category.label,
      amount: row.roundedAmount,
      sharePct: totalLiabilities > 0 ? round2((row.roundedAmount / totalLiabilities) * 100) : 0,
      unsecured: Boolean(row.category.unsecured),
    }))
    .sort((a, b) => b.amount - a.amount);

  const debtToAssetPct = totalAssets > 0 ? round2((totalLiabilities / totalAssets) * 100) : null;
  // Build the verdict sentence from the exact same (round2) value the classification
  // below is compared against — and the same value the itemised "Debt-to-asset ratio"
  // row on the page displays — so the printed number can never sit on the opposite
  // side of a threshold from the branch that produced it.
  let debtVerdict;
  if (debtToAssetPct === null) {
    debtVerdict = "You have listed debt but no assets — the ratio cannot be computed.";
  } else if (debtToAssetPct >= DEBT_TO_ASSET_SEVERE_PCT) {
    debtVerdict = `Debt is ${debtToAssetPct}% of assets — very little cushion if values fall.`;
  } else if (debtToAssetPct >= DEBT_TO_ASSET_CAUTION_PCT) {
    debtVerdict = `Debt is ${debtToAssetPct}% of assets, above the ${DEBT_TO_ASSET_CAUTION_PCT}% level usually flagged for review.`;
  } else {
    debtVerdict = `Debt is ${debtToAssetPct}% of assets, within the usual comfort range.`;
  }

  const liquidityMonths = expenses > 0 ? round2(liquidAssets / expenses) : null;

  let benchmark = null;
  if (ageValue > 0 && income > 0) {
    const expected = (ageValue * income) / WEALTH_FORMULA_DIVISOR;
    const rawRatio = expected > 0 ? netWorth / expected : null;
    // Classify from the same rounded ratio that gets displayed (not the raw
    // one), so the printed multiple and the printed band can never disagree
    // about which side of PAW_MULTIPLE/UAW_MULTIPLE the user is on.
    const ratio = rawRatio === null ? null : round2(rawRatio);
    let band = "average accumulator of wealth";
    if (ratio !== null && ratio >= PAW_MULTIPLE) band = "prodigious accumulator of wealth";
    else if (ratio !== null && ratio <= UAW_MULTIPLE) band = "under-accumulator of wealth";
    benchmark = {
      expected: round0(expected),
      ratio,
      band,
    };
  }

  return {
    totalAssets: round0(totalAssets),
    totalLiabilities: round0(totalLiabilities),
    netWorth: round0(netWorth),
    positive: netWorth >= 0,
    liquidAssets: round0(liquidAssets),
    liquidSharePct: share(liquidAssets),
    financialAssets: round0(financialAssets),
    financialSharePct: share(financialAssets),
    physicalAssets: round0(totalAssets - financialAssets),
    physicalSharePct: share(totalAssets - financialAssets),
    depreciatingAssets: round0(depreciatingAssets),
    depreciatingSharePct: share(depreciatingAssets),
    unsecuredDebt: round0(unsecuredDebt),
    unsecuredSharePct:
      totalLiabilities > 0 ? round2((unsecuredDebt / totalLiabilities) * 100) : 0,
    debtToAssetPct,
    debtVerdict,
    liquidityMonths,
    liquidityTargetMonths: LIQUIDITY_TARGET_MONTHS,
    liquidityMet: liquidityMonths === null ? null : liquidityMonths >= LIQUIDITY_TARGET_MONTHS,
    benchmark,
    composition,
    debts,
  };
}
