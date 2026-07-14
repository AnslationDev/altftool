// Deterministic, seeded pseudo-random number generation utilities.
// Used so that a given seed always produces the same avatar, which makes
// "Randomize" reproducible and lets the AI-style generator vary predictably.

// mulberry32: tiny, fast, well-distributed 32-bit PRNG.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash an arbitrary string into a 32-bit integer (FNV-1a-ish).
export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Create a seeded RNG object with convenience helpers.
export function createRng(seed) {
  const next = typeof seed === "string" ? mulberry32(hashString(seed)) : mulberry32(seed >>> 0);
  return {
    next,
    // float in [min, max)
    float: (min, max) => min + next() * (max - min),
    // int in [min, max] inclusive
    int: (min, max) => Math.floor(min + next() * (max - min + 1)),
    // pick a random element
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    // true with probability p
    chance: (p) => next() < p,
  };
}
