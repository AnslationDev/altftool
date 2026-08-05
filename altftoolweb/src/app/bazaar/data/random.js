/**
 * Deterministic pseudo-randomness for the Bazaar mock corpus.
 *
 * Every listing, seller and stat in Bazaar is generated, not stored. That is
 * only safe if generation is *stable*: `generateStaticParams` runs at build
 * time, the page renders at build time, and the client may re-render the same
 * data during hydration. A `Math.random()` anywhere in that chain produces a
 * different corpus per call, which shows up as hydration mismatches and as
 * sitemap entries pointing at slugs that no longer exist.
 *
 * So: no `Math.random()`, no `Date.now()` in this data layer. Everything is
 * derived from a string seed.
 */

/** FNV-1a — string to 32-bit seed. */
export function hashSeed(str) {
  let h = 2166136261;
  const value = String(str);
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, good enough for mock data. */
export function createRng(seed) {
  let a = typeof seed === "number" ? seed >>> 0 : hashSeed(seed);
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer in [min, max] inclusive. */
export function rngInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Uniform pick. Returns undefined for an empty list rather than throwing. */
export function rngPick(rng, list) {
  if (!Array.isArray(list) || list.length === 0) return undefined;
  return list[Math.floor(rng() * list.length)];
}

/** `count` distinct picks, or the whole list when it is shorter. */
export function rngSample(rng, list, count) {
  const pool = [...(list || [])];
  const out = [];
  while (pool.length > 0 && out.length < count) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return out;
}

/** True with probability `p`. */
export function rngChance(rng, p) {
  return rng() < p;
}

/**
 * Skewed integer in [min, max] — biased toward `min` when `power > 1`.
 * Prices and view counts are long-tailed in a real marketplace; a flat
 * distribution makes every listing look like the same listing.
 */
export function rngSkewed(rng, min, max, power = 2) {
  return Math.floor(min + (max - min) * Math.pow(rng(), power));
}

/** Round to a price that a human would actually type. */
export function roundPrice(value) {
  if (value >= 1000000) return Math.round(value / 50000) * 50000;
  if (value >= 100000) return Math.round(value / 5000) * 5000;
  if (value >= 10000) return Math.round(value / 500) * 500;
  if (value >= 1000) return Math.round(value / 100) * 100;
  if (value >= 100) return Math.round(value / 10) * 10;
  return Math.round(value);
}
