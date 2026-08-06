/*
 * Deterministic randomness for the word games.
 *
 * Every round on every game page is built on the server and shipped as props.
 * That only works if the build is reproducible: a page rendered at deploy time
 * and the same page regenerated 24 hours later by ISR must contain the same
 * puzzles, or a reader who bookmarked round 12 finds a different word there.
 *
 * So there is no Math.random() anywhere in this directory. Every shuffle, every
 * distractor and every scramble is a pure function of a slug — the same rule
 * the corpus generator itself follows.
 *
 * Pure functions with no imports, so a client component can use them too (the
 * restart control reshuffles the order in the browser).
 */

/**
 * FNV-1a, 32 bits.
 *
 * Chosen over anything cleverer because it avalanches well on short ASCII
 * strings: "cat" and "cot" land far apart, which is what stops a hash-ordered
 * selection from quietly turning back into alphabetical order.
 */
export function hashString(value) {
  const text = String(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32. One multiply-shift round per draw — uniform enough for a shuffle. */
export function seededRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates against a seeded stream. Returns a new array; never mutates. */
export function seededShuffle(items, seed) {
  const out = [...items];
  const next = seededRandom(seed);
  for (let index = out.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(next() * (index + 1));
    const held = out[index];
    out[index] = out[swap];
    out[swap] = held;
  }
  return out;
}

/**
 * Order a pool by the hash of each item's key.
 *
 * This is how every game picks its rounds. Sorting by hash rather than slicing
 * the top of a commonness-ranked list matters: the collections are ordered by
 * band then alphabetically, so the first thirty rows of any of them are all
 * band 5 and all start with A or B. Hash order spreads the draw across the
 * whole file while staying completely reproducible.
 */
export function byHash(items, key, salt = "") {
  return [...items].sort(
    (a, b) => hashString(`${salt}${key(a)}`) - hashString(`${salt}${key(b)}`),
  );
}

/** Deterministically pick one item, keyed on a string. */
export function pickOne(items, key) {
  if (items.length === 0) return null;
  return items[hashString(key) % items.length];
}
