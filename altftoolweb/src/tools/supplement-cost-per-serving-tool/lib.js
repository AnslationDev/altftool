/**
 * Supplement cost-per-serving comparison — pure logic.
 *
 * The point of the tool: a label "serving" is set by the manufacturer and often
 * contains less active ingredient than the dose that research actually uses. So
 * two figures are computed side by side.
 *
 *   label servings per container = container amount / serving amount
 *   total active in container    = label servings x active per serving
 *   effective servings           = total active / your target dose
 *   cost per effective serving   = total cost / effective servings
 *
 * Cost per effective serving is the only number that compares two products
 * fairly when their serving sizes or ingredient concentrations differ.
 */

/** Average calendar month length, 365.25 / 12. */
export const DAYS_PER_MONTH = 30.44;
export const DAYS_PER_YEAR = 365;

export const CONTAINER_UNITS = [
  { id: "g", label: "grams of powder", activeUnit: "mg" },
  { id: "capsule", label: "capsules", activeUnit: "mg" },
  { id: "tablet", label: "tablets", activeUnit: "mg" },
  { id: "ml", label: "millilitres of liquid", activeUnit: "mg" },
];

/**
 * Reference doses used in the research literature, for the "target dose"
 * prompt. Each is the amount of the active compound, not of the product.
 */
export const REFERENCE_DOSES = [
  { id: "creatine", label: "Creatine monohydrate (maintenance)", mg: 5000, source: "ISSN position stand: 3-5 g/day maintenance." },
  { id: "beta-alanine", label: "Beta-alanine (daily)", mg: 4000, source: "ISSN position stand: 4-6 g/day, split into doses." },
  { id: "citrulline", label: "L-citrulline malate (pre-exercise)", mg: 8000, source: "Commonly studied at 6-8 g before exercise." },
  { id: "caffeine", label: "Caffeine (per 70 kg, 4 mg/kg)", mg: 280, source: "ISSN: 3-6 mg/kg bodyweight before exercise." },
  { id: "vitamin-d", label: "Vitamin D3 (1000 IU)", mg: 0.025, source: "1000 IU of vitamin D3 equals 25 micrograms." },
  { id: "omega-3", label: "Combined EPA + DHA", mg: 1000, source: "Commonly used cardiovascular dose is 1 g EPA+DHA per day." },
  { id: "magnesium", label: "Elemental magnesium", mg: 350, source: "US tolerable upper intake for supplemental magnesium in adults." },
  { id: "custom", label: "Custom dose", mg: null, source: "Enter the dose you actually take." },
];

const round2 = (value) => Math.round(value * 100) / 100;
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Score one product.
 *
 * @param {object} product
 * @param {string} product.name
 * @param {number} product.price - what you pay for the container
 * @param {number} product.shipping - added to the price
 * @param {number} product.containerAmount - g, capsules, tablets or ml
 * @param {number} product.servingAmount - the same unit, per label serving
 * @param {number} product.activePerServingMg - active ingredient per label serving
 * @param {number} targetDoseMg - the dose you actually want per serving
 * @returns {object} row, with `error` set when the product cannot be scored
 */
export function scoreProduct(product, targetDoseMg) {
  const name = String(product.name || "").trim() || "Unnamed product";
  const price = Number(product.price);
  const shipping = Number(product.shipping ?? 0);
  const container = Number(product.containerAmount);
  const serving = Number(product.servingAmount);
  const active = Number(product.activePerServingMg);

  const base = { id: product.id, name };

  if (!Number.isFinite(price) || price < 0) {
    return { ...base, error: "Price must be zero or more." };
  }
  if (!Number.isFinite(shipping) || shipping < 0) {
    return { ...base, error: "Shipping must be zero or more." };
  }
  if (!Number.isFinite(container) || container <= 0) {
    return { ...base, error: "Container size must be greater than zero." };
  }
  if (!Number.isFinite(serving) || serving <= 0) {
    return { ...base, error: "Serving size must be greater than zero." };
  }
  if (serving > container) {
    return { ...base, error: "A serving cannot be larger than the container." };
  }
  if (!Number.isFinite(active) || active <= 0) {
    return { ...base, error: "Active ingredient per serving must be greater than zero." };
  }
  if (!Number.isFinite(targetDoseMg) || targetDoseMg <= 0) {
    return { ...base, error: "Target dose must be greater than zero." };
  }

  const totalCost = price + shipping;
  const labelServings = container / serving;
  const totalActiveMg = labelServings * active;
  const effectiveServings = totalActiveMg / targetDoseMg;

  return {
    ...base,
    totalCost: round2(totalCost),
    labelServings: round1(labelServings),
    totalActiveMg: Math.round(totalActiveMg),
    effectiveServings: round1(effectiveServings),
    activePerServingMg: active,
    servingsPerDose: round2(targetDoseMg / active),
    costPerLabelServing: round2(totalCost / labelServings),
    costPerEffectiveServing: round2(totalCost / effectiveServings),
    costPerGramActive: round2(totalCost / (totalActiveMg / 1000)),
    activeShareOfServingPct:
      product.unit === "g" && serving > 0 ? round1((active / (serving * 1000)) * 100) : null,
  };
}

/**
 * Compare a list of products at one target dose.
 *
 * @param {object} input
 * @param {Array} input.products
 * @param {number} input.targetDoseMg
 * @param {number} [input.servingsPerDay]
 * @returns {object|{error: string}}
 */
export function compareSupplements({ products, targetDoseMg, servingsPerDay = 1 }) {
  if (!Array.isArray(products) || products.length === 0) {
    return { error: "Add at least one product to compare." };
  }

  const target = Number(targetDoseMg);
  if (!Number.isFinite(target) || target <= 0) {
    return { error: "Enter the dose you actually take, in milligrams." };
  }
  if (target > 1000000) {
    return { error: "Target dose should be 1000000 mg (1 kg) or less." };
  }

  const perDay = Number(servingsPerDay);
  if (!Number.isFinite(perDay) || perDay <= 0 || perDay > 20) {
    return { error: "Effective servings per day should be between 0 and 20." };
  }

  const rows = products.map((product) => scoreProduct(product, target));
  const valid = rows.filter((row) => !row.error);

  if (valid.length === 0) {
    return {
      error: "None of the products have enough valid numbers to compare yet.",
      rows,
      targetDoseMg: target,
    };
  }

  const best = valid.reduce(
    (lowest, row) => (row.costPerEffectiveServing < lowest.costPerEffectiveServing ? row : lowest),
    valid[0],
  );
  const worst = valid.reduce(
    (highest, row) => (row.costPerEffectiveServing > highest.costPerEffectiveServing ? row : highest),
    valid[0],
  );

  const ranked = rows.map((row) => {
    if (row.error) return row;
    const premiumPct =
      best.costPerEffectiveServing > 0
        ? Math.round(
            ((row.costPerEffectiveServing - best.costPerEffectiveServing) /
              best.costPerEffectiveServing) *
              100,
          )
        : 0;
    return {
      ...row,
      isBest: row.id === best.id,
      premiumPct,
      daysPerContainer: Math.floor(row.effectiveServings / perDay),
      costPerDay: round2(row.costPerEffectiveServing * perDay),
      costPerMonth: round2(row.costPerEffectiveServing * perDay * DAYS_PER_MONTH),
      costPerYear: round2(row.costPerEffectiveServing * perDay * DAYS_PER_YEAR),
    };
  });

  const sorted = ranked
    .filter((row) => !row.error)
    .slice()
    .sort((a, b) => a.costPerEffectiveServing - b.costPerEffectiveServing);

  const annualSaving = round2(
    (worst.costPerEffectiveServing - best.costPerEffectiveServing) * perDay * DAYS_PER_YEAR,
  );

  return {
    targetDoseMg: target,
    servingsPerDay: perDay,
    rows: ranked,
    sorted,
    bestId: best.id,
    bestName: best.name,
    bestCostPerEffectiveServing: best.costPerEffectiveServing,
    worstName: worst.name,
    worstCostPerEffectiveServing: worst.costPerEffectiveServing,
    annualSaving,
    comparedCount: valid.length,
    invalidCount: rows.length - valid.length,
  };
}
