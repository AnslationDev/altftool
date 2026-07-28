/**
 * Barbell plate loading.
 *
 * A loaded bar is symmetrical, so:
 *   weight per side = (target - bar - 2 x collar) / 2
 * and the plates are chosen largest-first from what is actually in the rack.
 *
 * Plate denominations and bar weights follow IWF / IPF competition specifications:
 * a men's bar is 20 kg, a women's bar 15 kg, and competition collars are 2.5 kg each.
 * Imperial gyms use 45 lb and 35 lb bars with 45/35/25/10/5/2.5 lb plates.
 */

/** Everything is computed in thousandths of a unit so 2.5 + 1.25 never drifts. */
const SCALE = 1000;
const toUnits = (value) => Math.round(value * SCALE);
const fromUnits = (units) => units / SCALE;

/** IWF / IPF competition disc denominations in kilograms, heaviest first. */
export const KG_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5, 0.25];
/** Common imperial plate denominations in pounds, heaviest first. */
export const LB_PLATES = [45, 35, 25, 10, 5, 2.5, 1.25];

/** Standard bars. 20 kg men's and 15 kg women's are the IWF/IPF competition bars. */
export const KG_BARS = [
  { id: "men-20", label: "Men's bar — 20 kg", weight: 20 },
  { id: "women-15", label: "Women's bar — 15 kg", weight: 15 },
  { id: "technique-10", label: "Technique bar — 10 kg", weight: 10 },
  { id: "training-7", label: "Training bar — 7 kg", weight: 7 },
];
export const LB_BARS = [
  { id: "men-45", label: "Men's bar — 45 lb", weight: 45 },
  { id: "women-35", label: "Women's bar — 35 lb", weight: 35 },
  { id: "training-15", label: "Training bar — 15 lb", weight: 15 },
];

/** IWF/IPF competition collars weigh 2.5 kg each (5 kg for the pair). */
export const COMPETITION_COLLAR_KG = 2.5;
/** Typical imperial spring/lock collar, per side. */
export const COMMON_COLLAR_LB = 2.5;

export const MAX_TARGET = 2000;
export const MAX_PAIRS_PER_PLATE = 20;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Default inventory: a generous number of pairs of every denomination. */
export function defaultInventory(unit = "kg") {
  const plates = unit === "lb" ? LB_PLATES : KG_PLATES;
  return plates.map((weight) => ({ weight, pairs: weight >= 20 ? 8 : 4 }));
}

/**
 * Choose plates for one side, largest first, respecting how many pairs exist.
 *
 * @param {{targetWeight:number, barWeight:number, collarWeight?:number,
 *          inventory?:Array<{weight:number,pairs:number}>}} input
 */
export function computePlateLoading({
  targetWeight,
  barWeight,
  collarWeight = 0,
  inventory,
} = {}) {
  if (!isNum(targetWeight)) return { error: "Enter a target weight." };
  if (!isNum(barWeight)) return { error: "Enter the weight of the bar." };
  if (!isNum(collarWeight) || collarWeight < 0) {
    return { error: "Collar weight cannot be negative." };
  }
  if (barWeight <= 0) return { error: "Bar weight must be greater than zero." };
  if (targetWeight <= 0) return { error: "Target weight must be greater than zero." };
  if (targetWeight > MAX_TARGET) return { error: `Target weight must be under ${MAX_TARGET}.` };

  const barAndCollars = barWeight + 2 * collarWeight;
  if (targetWeight < barAndCollars) {
    return {
      error: `The bar plus collars already weighs ${fromUnits(toUnits(barAndCollars))}. Pick a heavier target.`,
    };
  }

  const list = (Array.isArray(inventory) && inventory.length ? inventory : defaultInventory())
    .filter((plate) => isNum(plate?.weight) && plate.weight > 0)
    .map((plate) => ({
      weight: plate.weight,
      pairs: isNum(plate.pairs) && plate.pairs > 0 ? Math.floor(plate.pairs) : 0,
    }))
    .sort((a, b) => b.weight - a.weight);

  if (!list.length) return { error: "Add at least one plate denomination to the rack." };

  // Whatever cannot be split evenly across two sides stays in the shortfall.
  const diffUnits = toUnits(targetWeight) - toUnits(barAndCollars);
  const perSideUnits = Math.floor(diffUnits / 2);

  let remaining = perSideUnits;
  const loading = [];
  for (const plate of list) {
    const unitsEach = toUnits(plate.weight);
    if (unitsEach <= 0 || plate.pairs <= 0) continue;
    const count = Math.min(plate.pairs, Math.floor(remaining / unitsEach));
    if (count > 0) {
      loading.push({ weight: plate.weight, count });
      remaining -= count * unitsEach;
    }
  }

  const loadedPerSideUnits = perSideUnits - remaining;
  const achievedUnits = toUnits(barAndCollars) + 2 * loadedPerSideUnits;
  const smallestPlate = list[list.length - 1].weight;

  return {
    targetWeight,
    barWeight,
    collarWeight,
    barAndCollars,
    perSide: fromUnits(perSideUnits),
    loadedPerSide: fromUnits(loadedPerSideUnits),
    loading,
    plateCountPerSide: loading.reduce((sum, row) => sum + row.count, 0),
    totalPlates: loading.reduce((sum, row) => sum + row.count, 0) * 2,
    achievedWeight: fromUnits(achievedUnits),
    shortfall: fromUnits(toUnits(targetWeight) - achievedUnits),
    exact: toUnits(targetWeight) === achievedUnits,
    /** Smallest change you can make to the bar with the plates in the rack. */
    smallestIncrement: smallestPlate * 2,
  };
}

/**
 * Nearest weight that CAN be loaded at or below a target, given the rack.
 * Handy when the exact number is not reachable.
 */
export function nearestLoadableWeight(input) {
  const result = computePlateLoading(input);
  if (result.error) return result;
  return { weight: result.achievedWeight, exact: result.exact, loading: result.loading };
}

/**
 * A warm-up-free percentage ladder: what each percentage of a top set loads to,
 * rounded down to what the rack can actually make.
 */
export function loadingLadder({ topWeight, percentages, barWeight, collarWeight = 0, inventory } = {}) {
  if (!isNum(topWeight) || topWeight <= 0) return [];
  const list = Array.isArray(percentages) ? percentages : [];
  return list
    .filter((pct) => isNum(pct) && pct > 0)
    .map((pct) => {
      const target = (topWeight * pct) / 100;
      const result = computePlateLoading({ targetWeight: target, barWeight, collarWeight, inventory });
      return {
        percentage: pct,
        requested: target,
        loadable: result.error ? null : result.achievedWeight,
        loading: result.error ? null : result.loading,
        error: result.error ?? null,
      };
    });
}
