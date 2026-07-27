/**
 * Shoe selection planner for trips.
 *
 * Choosing footwear for a trip is exactly the minimum set cover problem: you
 * have a set of conditions to satisfy (walking all day, a formal evening, wet
 * ground, a beach, a trail) and a catalogue of shoes, each of which covers a
 * subset of them. The goal is the smallest number of pairs that covers every
 * condition, and among equally small answers, the lightest.
 *
 * Set cover is NP-hard in general and usually attacked with a greedy
 * heuristic, but the instance here is tiny — nine conditions and a dozen
 * candidate shoes — so this module searches exhaustively by increasing subset
 * size and returns the true optimum rather than an approximation. Conditions
 * are held as a bitmask so a cover test is a single bitwise OR.
 *
 * Weights are typical adult figures for one pair; volumes are the space a pair
 * takes in a bag with one shoe nested against the other.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** The conditions a trip can demand of footwear. */
export const CONDITIONS = [
  { id: "walking", label: "Walking or sightseeing all day" },
  { id: "smartCasual", label: "Smart casual daytime" },
  { id: "formal", label: "Formal evening or dress code" },
  { id: "wet", label: "Rain or wet ground" },
  { id: "beach", label: "Beach, pool or shower block" },
  { id: "hiking", label: "Hiking or rough trail" },
  { id: "gym", label: "Gym or running" },
  { id: "cold", label: "Snow or sub-zero" },
  { id: "driving", label: "Long drives" },
];

/** Candidate shoes: what each covers, what it weighs, what it takes up. */
export const SHOES = [
  {
    id: "travel-sneakers",
    name: "Leather-look travel sneakers",
    covers: ["walking", "smartCasual", "driving"],
    grams: 650,
    litres: 4,
    note: "The single most useful pair for a city trip — passes as smart in most restaurants",
  },
  {
    id: "running-trainers",
    name: "Running trainers",
    covers: ["walking", "gym", "driving"],
    grams: 700,
    litres: 4.5,
  },
  {
    id: "trail-runners",
    name: "Trail runners",
    covers: ["walking", "hiking", "gym"],
    grams: 800,
    litres: 4.5,
    note: "Most trails that do not involve scree or snow are fine in these",
  },
  {
    id: "hiking-boots",
    name: "Waterproof hiking boots",
    covers: ["walking", "hiking", "wet", "cold"],
    grams: 1250,
    litres: 6.5,
    note: "The heaviest single item most people pack — wear them on the journey",
  },
  {
    id: "dress-shoes",
    name: "Formal dress shoes or heels",
    covers: ["formal"],
    grams: 700,
    litres: 4,
  },
  {
    id: "loafers",
    name: "Loafers or derbies",
    covers: ["formal", "smartCasual", "driving"],
    grams: 750,
    litres: 4,
    note: "Covers both the office day and the dinner, so it removes a whole pair",
  },
  {
    id: "ballet-flats",
    name: "Ballet flats or foldable dress flats",
    covers: ["formal", "smartCasual"],
    grams: 320,
    litres: 1.8,
    note: "Almost free in weight and space, which is why they win most formal slots",
  },
  {
    id: "sandals",
    name: "Sports sandals",
    covers: ["beach", "wet", "walking"],
    grams: 420,
    litres: 2.5,
    note: "Dry in minutes, unlike any closed shoe",
  },
  {
    id: "flip-flops",
    name: "Flip-flops",
    covers: ["beach"],
    grams: 200,
    litres: 1.2,
  },
  {
    id: "water-shoes",
    name: "Water shoes",
    covers: ["beach", "wet"],
    grams: 350,
    litres: 1.8,
  },
  {
    id: "rain-boots",
    name: "Rain boots",
    covers: ["wet", "cold"],
    grams: 1400,
    litres: 7,
  },
  {
    id: "snow-boots",
    name: "Insulated snow boots",
    covers: ["walking", "wet", "cold"],
    grams: 1600,
    litres: 8,
  },
];

/** More than this many pairs and footwear is dominating the bag. */
export const COMFORTABLE_PAIR_LIMIT = 3;

const CONDITION_INDEX = new Map(CONDITIONS.map((condition, index) => [condition.id, index]));

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;

function maskOf(ids) {
  let mask = 0;
  for (const id of ids) {
    const index = CONDITION_INDEX.get(id);
    if (index === undefined) return null;
    mask |= 1 << index;
  }
  return mask;
}

function labelsOfMask(mask) {
  return CONDITIONS.filter((_, index) => (mask & (1 << index)) !== 0).map(
    (condition) => condition.label,
  );
}

/**
 * Exact minimum set cover: fewest pairs first, then lightest.
 *
 * @param {string[]} conditionIds
 * @param {string[]} [allowedShoeIds] restrict the catalogue (e.g. what you own)
 * @returns {{ shoes:Array, pairs:number, totalGrams:number, uncovered:string[] } | { error:string }}
 */
export function chooseShoes(conditionIds, allowedShoeIds) {
  if (!Array.isArray(conditionIds)) return { error: "Select the conditions as a list." };
  const unique = [...new Set(conditionIds)];
  if (unique.length === 0) {
    return { error: "Pick at least one condition your shoes have to handle." };
  }
  const target = maskOf(unique);
  if (target === null) return { error: "One of those conditions is not in the list." };

  const catalogue = SHOES.filter(
    (shoe) => !Array.isArray(allowedShoeIds) || allowedShoeIds.includes(shoe.id),
  );
  if (catalogue.length === 0) return { error: "No shoes available to choose from." };

  const candidates = catalogue.map((shoe) => ({ ...shoe, mask: maskOf(shoe.covers) & target }));
  const reachable = candidates.reduce((mask, shoe) => mask | shoe.mask, 0);
  if ((reachable & target) !== target) {
    return {
      error: `No shoe in the list covers: ${labelsOfMask(target & ~reachable).join(", ")}.`,
    };
  }

  // Drop candidates that contribute nothing.
  const useful = candidates.filter((shoe) => shoe.mask !== 0);

  let best = null;
  for (let size = 1; size <= useful.length; size += 1) {
    const chosen = [];
    const search = (start, mask) => {
      if (chosen.length === size) {
        if (mask === target) {
          const grams = chosen.reduce((sum, shoe) => sum + shoe.grams, 0);
          if (!best || grams < best.grams) {
            best = { shoes: chosen.slice(), grams };
          }
        }
        return;
      }
      for (let index = start; index < useful.length; index += 1) {
        // Not enough shoes left to reach the required size.
        if (useful.length - index < size - chosen.length) break;
        chosen.push(useful[index]);
        search(index + 1, mask | useful[index].mask);
        chosen.pop();
      }
    };
    search(0, 0);
    if (best) break;
  }

  if (!best) return { error: "No combination of these shoes covers every condition." };

  return {
    shoes: best.shoes.map((shoe) => ({
      id: shoe.id,
      name: shoe.name,
      covers: shoe.covers.filter((id) => unique.includes(id)),
      grams: shoe.grams,
      litres: shoe.litres,
      note: shoe.note || "",
    })),
    pairs: best.shoes.length,
    totalGrams: best.grams,
    uncovered: [],
  };
}

/**
 * Full plan: the minimum set, plus what it costs you to carry.
 *
 * @param {object} input
 * @param {string[]} input.conditions
 * @param {string[]} [input.allowedShoes]
 * @param {boolean} input.wearHeaviest wear the heaviest pair on the journey
 * @param {number} input.bagCapacityL space you have for footwear
 * @returns {object | { error:string }}
 */
export function planTripShoes(input) {
  const {
    conditions,
    allowedShoes,
    wearHeaviest = true,
    bagCapacityL = 12,
  } = input || {};

  if (!isNum(bagCapacityL) || bagCapacityL <= 0 || bagCapacityL > 100) {
    return { error: "Enter the space you have for shoes, between 1 and 100 litres." };
  }

  const chosen = chooseShoes(conditions, allowedShoes);
  if (chosen.error) return { error: chosen.error };

  const sorted = chosen.shoes.slice().sort((a, b) => b.grams - a.grams);
  const wornPair = wearHeaviest ? sorted[0] : null;
  const packed = wornPair ? sorted.slice(1) : sorted;

  const packedGrams = packed.reduce((sum, shoe) => sum + shoe.grams, 0);
  const packedLitres = packed.reduce((sum, shoe) => sum + shoe.litres, 0);
  const totalLitres = chosen.shoes.reduce((sum, shoe) => sum + shoe.litres, 0);

  const coveredIds = new Set();
  for (const shoe of chosen.shoes) for (const id of shoe.covers) coveredIds.add(id);

  return {
    shoes: sorted,
    wornPair,
    packed,
    pairs: chosen.pairs,
    totalGrams: chosen.totalGrams,
    totalKg: round1(chosen.totalGrams / 1000),
    packedGrams,
    packedKg: round1(packedGrams / 1000),
    packedLitres: round1(packedLitres),
    totalLitres: round1(totalLitres),
    bagCapacityL,
    fitsBag: packedLitres <= bagCapacityL,
    spareLitres: round1(bagCapacityL - packedLitres),
    savedByWearingKg: wornPair ? round1(wornPair.grams / 1000) : 0,
    conditionsCovered: CONDITIONS.filter((condition) => coveredIds.has(condition.id)).map(
      (condition) => condition.label,
    ),
    overPairLimit: chosen.pairs > COMFORTABLE_PAIR_LIMIT,
  };
}
