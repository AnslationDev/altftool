/**
 * Barbell plate loading.
 *
 * A loaded bar is symmetrical, so:
 *   weight per side = (target - bar - 2 x collar) / 2
 * and the plates are chosen to hit the closest achievable per-side weight
 * from what is actually in the rack. The selected plates are returned in
 * descending denomination order for sleeve loading.
 *
 * Plate denominations and bar weights follow IWF / IPF competition specifications:
 * a men's bar is 20 kg, a women's bar 15 kg, and competition collars are 2.5 kg each.
 * Imperial gyms use 45 lb and 35 lb bars with 45/35/25/10/5/2.5/1.25 lb plates.
 */

/** Everything is computed in thousandths of a unit so 2.5 + 1.25 never drifts. */
const SCALE = 1000;
const toUnits = (value) => Math.round(value * SCALE);
const fromUnits = (units) => units / SCALE;

function greatestCommonDivisor(a, b) {
  let left = Math.abs(a);
  let right = Math.abs(b);
  while (right) {
    const next = left % right;
    left = right;
    right = next;
  }
  return left || 1;
}

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
 * Choose the best achievable per-side plate loading, respecting how many
 * pairs of each denomination exist.
 *
 * @param {{targetWeight:number, barWeight:number, collarWeight?:number,
 *          inventory?:Array<{weight:number,pairs:number}>, unit?:string}} input
 *          `unit` (e.g. "kg"/"lb") is optional and only used to label error text.
 */
export function computePlateLoading({
  targetWeight,
  barWeight,
  collarWeight = 0,
  inventory,
  unit = "",
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
    const unitSuffix = unit ? ` ${unit}` : "";
    return {
      error: `The bar plus collars already weighs ${fromUnits(toUnits(barAndCollars))}${unitSuffix}. Pick a heavier target.`,
    };
  }

  const list = (Array.isArray(inventory) && inventory.length ? inventory : defaultInventory())
    .filter((plate) => isNum(plate?.weight) && plate.weight > 0)
    .map((plate) => ({
      weight: plate.weight,
      // A rack only physically holds so many plates of one denomination —
      // clamp to MAX_PAIRS_PER_PLATE so neither the search below nor the
      // rendered "per side" plate list has to deal with an unbounded count.
      pairs:
        isNum(plate.pairs) && plate.pairs > 0
          ? Math.min(MAX_PAIRS_PER_PLATE, Math.floor(plate.pairs))
          : 0,
    }))
    .sort((a, b) => b.weight - a.weight);

  if (!list.length) return { error: "Add at least one plate denomination to the rack." };

  // Whatever cannot be split evenly across two sides stays in the shortfall.
  const diffUnits = toUnits(targetWeight) - toUnits(barAndCollars);
  const perSideUnits = Math.floor(diffUnits / 2);

  const { loadedUnits, counts } = bestPerSideLoading(list, perSideUnits);
  const loading = list
    .map((plate, index) => ({ weight: plate.weight, count: counts[index] }))
    .filter((row) => row.count > 0);

  const loadedPerSideUnits = loadedUnits;
  const achievedUnits = toUnits(barAndCollars) + 2 * loadedPerSideUnits;
  // Only count denominations the rack actually has a whole pair of — a
  // denomination that floors to 0 pairs can never be loaded, so it must not
  // be reported as the "smallest jump" the rack allows.
  const usablePlates = list.filter((plate) => plate.pairs > 0);
  const smallestUsableWeight = usablePlates.length
    ? usablePlates[usablePlates.length - 1].weight
    : 0;

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
    /** Smallest change you can make to the bar with plates you actually own a pair of. */
    smallestIncrement: smallestUsableWeight * 2,
  };
}

/**
 * Find the heaviest per-side weight achievable at or below `capacityUnits`,
 * respecting the limited number of pairs owned for each denomination.
 *
 * This is a bounded subset-sum problem: a naive largest-first greedy is
 * provably suboptimal once quantities are limited — e.g. owning one 20 kg
 * pair and two 15 kg pairs can hit 30 kg exactly, but greedy takes the 20 kg
 * pair first and gets stuck 10 kg short even though 15+15 reaches the target.
 * We solve it exactly with a bounded knapsack: each denomination's pair count
 * is split into power-of-two "chunks" (a standard bounded-knapsack trick), and
 * a subset-sum DP is run over those chunks, so each denomination still only
 * contributes O(log2(MAX_PAIRS_PER_PLATE)) items to the search regardless of
 * how many pairs are owned.
 */
function bestPerSideLoading(list, capacityUnits) {
  const counts = list.map(() => 0);
  if (!(capacityUnits > 0)) return { loadedUnits: 0, counts };

  const totalAvailableUnits = list.reduce(
    (sum, plate) => sum + toUnits(plate.weight) * plate.pairs,
    0,
  );
  const capacity = Math.min(capacityUnits, totalAvailableUnits);
  if (capacity <= 0) return { loadedUnits: 0, counts };

  // Every achievable total is a multiple of the denominations' GCD. Running
  // the DP in that smaller unit keeps normal kg/lb inventories in the low
  // thousands of states instead of scanning up to two million thousandths.
  const unitDivisor = list
    .filter((plate) => plate.pairs > 0)
    .map((plate) => toUnits(plate.weight))
    .reduce((gcd, units) => greatestCommonDivisor(gcd, units), 0) || 1;
  const scaledCapacity = Math.floor(capacity / unitDivisor);

  const chunkItems = [];
  list.forEach((plate, denomIndex) => {
    const unitsEach = toUnits(plate.weight);
    let remainingPairs = plate.pairs;
    let chunk = 1;
    while (remainingPairs > 0 && unitsEach > 0) {
      const take = Math.min(chunk, remainingPairs);
      chunkItems.push({
        denomIndex,
        plateCount: take,
        unitWeight: (unitsEach / unitDivisor) * take,
      });
      remainingPairs -= take;
      chunk *= 2;
    }
  });

  // reachable[s] = true once some subset of chunk items sums to exactly s.
  const reachable = new Uint8Array(scaledCapacity + 1);
  reachable[0] = 1;
  const parent = new Int32Array(scaledCapacity + 1).fill(-1);
  for (let ci = 0; ci < chunkItems.length; ci++) {
    const { unitWeight } = chunkItems[ci];
    if (unitWeight <= 0 || unitWeight > scaledCapacity) continue;
    for (let s = scaledCapacity; s >= unitWeight; s--) {
      if (!reachable[s] && reachable[s - unitWeight]) {
        reachable[s] = 1;
        parent[s] = ci;
      }
    }
  }

  let best = scaledCapacity;
  while (best > 0 && !reachable[best]) best -= 1;

  let cursor = best;
  while (cursor > 0) {
    const ci = parent[cursor];
    if (ci < 0) break;
    const item = chunkItems[ci];
    counts[item.denomIndex] += item.plateCount;
    cursor -= item.unitWeight;
  }

  return { loadedUnits: best * unitDivisor, counts };
}

/**
 * Nearest weight that can be loaded at or below a target, given the rack.
 * Kept as a public compatibility helper for existing consumers.
 */
export function nearestLoadableWeight(input) {
  const result = computePlateLoading(input);
  if (result.error) return result;
  return {
    weight: result.achievedWeight,
    exact: result.exact,
    loading: result.loading,
  };
}

/**
 * Build a percentage ladder, rounding each target down to what the supplied
 * rack can actually load. Kept backward-compatible with the original API.
 */
export function loadingLadder({
  topWeight,
  percentages,
  barWeight,
  collarWeight = 0,
  inventory,
  unit = "",
} = {}) {
  if (!isNum(topWeight) || topWeight <= 0) return [];
  const list = Array.isArray(percentages) ? percentages : [];

  return list
    .filter((pct) => isNum(pct) && pct > 0)
    .map((pct) => {
      const target = (topWeight * pct) / 100;
      const result = computePlateLoading({
        targetWeight: target,
        barWeight,
        collarWeight,
        inventory,
        unit,
      });
      return {
        percentage: pct,
        requested: target,
        loadable: result.error ? null : result.achievedWeight,
        loading: result.error ? null : result.loading,
        error: result.error ?? null,
      };
    });
}
