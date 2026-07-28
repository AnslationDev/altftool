/**
 * Single-elimination tournament bracket generation.
 *
 * Rules implemented (standard knockout practice used by ITF/NCAA-style draws):
 *  - The draw size is the next power of two at or above the number of entrants,
 *    so every round halves the field exactly.
 *  - Empty slots in the draw are byes, and byes are always given to the highest
 *    seeds first, because the standard seeding order pairs seed 1 with the
 *    lowest slot in the draw.
 *  - Standard ("snake") seeding is built recursively: a bracket of size n is
 *    produced from the bracket of size n/2 by replacing each seed s with the
 *    pair (s, n + 1 - s). For 8 entrants this gives 1v8, 4v5, 2v7, 3v6, which
 *    keeps seeds 1 and 2 apart until the final.
 *  - A single-elimination event needs exactly (entrants - 1) matches, because
 *    every match eliminates exactly one entrant and all but the champion must
 *    be eliminated. A third-place play-off adds one more.
 */

/** A knockout draw needs at least two entrants. */
export const MIN_ENTRANTS = 2;

/** Practical cap: a 64-draw is 6 rounds and is the largest common club draw. */
export const MAX_ENTRANTS = 64;

/** Placeholder used for an empty slot in the draw. */
export const BYE = "Bye";

/** Seeding methods offered. */
export const SEEDING_METHODS = {
  standard: "Standard seeding (1 v lowest)",
  random: "Random draw",
  ordered: "As typed (1 v 2, 3 v 4…)",
};

/** Round names by the number of entrants still playing in that round. */
const ROUND_NAMES = {
  2: "Final",
  4: "Semi-final",
  8: "Quarter-final",
};

/**
 * Deterministic PRNG (mulberry32). Given the same seed it always produces the
 * same sequence, which keeps bracket generation a pure function.
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smallest power of two greater than or equal to n. */
export function nextPowerOfTwo(n) {
  let size = 1;
  while (size < n) size *= 2;
  return size;
}

/**
 * Standard seeding order for a draw of `size` (a power of two).
 * Returns the seed numbers in slot order: [1, 8, 4, 5, 2, 7, 3, 6] for size 8.
 */
export function standardSeedOrder(size) {
  let order = [1];
  while (order.length < size) {
    const next = [];
    const roundSize = order.length * 2;
    for (const seed of order) {
      next.push(seed);
      next.push(roundSize + 1 - seed);
    }
    order = next;
  }
  return order;
}

/** Fisher-Yates shuffle driven by a seeded PRNG, so it stays deterministic. */
export function shuffle(items, rng) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Split a textarea blob into clean entrant names (blank lines dropped). */
export function parseEntrants(raw) {
  return String(raw ?? "")
    .split(/\r?\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function roundName(playersInRound) {
  return ROUND_NAMES[playersInRound] || `Round of ${playersInRound}`;
}

/**
 * Build the bracket.
 *
 * @param {object} input
 * @param {string[]|string} input.entrants  names, or a newline/comma blob
 * @param {"standard"|"random"|"ordered"} [input.seeding]
 * @param {number} [input.randomSeed]  seed for the random draw (pure)
 * @param {boolean} [input.thirdPlace] include a third-place play-off
 * @returns {object} bracket, or { error } when the input cannot make a draw.
 */
export function buildBracket({
  entrants,
  seeding = "standard",
  randomSeed = 1,
  thirdPlace = false,
}) {
  const names = Array.isArray(entrants) ? entrants.map((n) => String(n).trim()).filter(Boolean) : parseEntrants(entrants);

  if (names.length < MIN_ENTRANTS) {
    return { error: `Add at least ${MIN_ENTRANTS} entrants — a bracket needs two sides.` };
  }
  if (names.length > MAX_ENTRANTS) {
    return { error: `This tool handles up to ${MAX_ENTRANTS} entrants; you entered ${names.length}.` };
  }
  if (!SEEDING_METHODS[seeding]) {
    return { error: "Pick a seeding method from the list." };
  }

  const seedNumber = Number.isFinite(Number(randomSeed)) ? Math.abs(Math.trunc(Number(randomSeed))) : 1;

  // Order the entrants: this list is indexed by seed number - 1.
  let seeded;
  if (seeding === "random") {
    seeded = shuffle(names, mulberry32(seedNumber));
  } else {
    seeded = names.slice();
  }

  const drawSize = nextPowerOfTwo(names.length);
  const byes = drawSize - names.length;

  // Place entrants into draw slots.
  const slots = new Array(drawSize).fill(null);
  if (seeding === "ordered") {
    for (let i = 0; i < seeded.length; i += 1) {
      slots[i] = { seed: i + 1, name: seeded[i] };
    }
  } else {
    const order = standardSeedOrder(drawSize);
    for (let slot = 0; slot < drawSize; slot += 1) {
      const seed = order[slot];
      slots[slot] = seed <= seeded.length ? { seed, name: seeded[seed - 1] } : null;
    }
  }

  // Round 1 from the slot list, later rounds as empty fixtures.
  const rounds = [];
  let matchNumber = 1;
  const firstRound = [];
  for (let i = 0; i < drawSize; i += 2) {
    const a = slots[i];
    const b = slots[i + 1];
    firstRound.push({
      matchNumber: matchNumber++,
      slotA: a ? a.name : BYE,
      slotB: b ? b.name : BYE,
      seedA: a ? a.seed : null,
      seedB: b ? b.seed : null,
      isBye: !a || !b,
      autoWinner: !a && b ? b.name : a && !b ? a.name : null,
    });
  }
  rounds.push({ name: roundName(drawSize), matches: firstRound });

  let playersLeft = drawSize / 2;
  while (playersLeft >= 2) {
    const matches = [];
    for (let i = 0; i < playersLeft / 2; i += 1) {
      matches.push({
        matchNumber: matchNumber++,
        slotA: "Winner",
        slotB: "Winner",
        seedA: null,
        seedB: null,
        isBye: false,
        autoWinner: null,
      });
    }
    rounds.push({ name: roundName(playersLeft), matches });
    playersLeft /= 2;
  }

  const byeMatches = firstRound.filter((m) => m.isBye).length;
  const playableMatches = names.length - 1 + (thirdPlace && names.length >= 4 ? 1 : 0);

  return {
    entrantCount: names.length,
    drawSize,
    byes,
    byeSeeds: slots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot, index }) => slot && (index % 2 === 0 ? !slots[index + 1] : !slots[index - 1]))
      .map(({ slot }) => slot.seed)
      .sort((a, b) => a - b),
    roundCount: rounds.length,
    rounds,
    byeMatches,
    playableMatches,
    thirdPlace: Boolean(thirdPlace) && names.length >= 4,
    seeding,
    order: seeded,
  };
}
