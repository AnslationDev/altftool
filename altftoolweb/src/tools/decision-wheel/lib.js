/**
 * Decision wheel — pure logic.
 *
 * The wheel is a weighted random picker. Each entry occupies a slice of the
 * circle proportional to its weight, so the probability of landing on entry i
 * is exactly  w_i / sum(w).
 *
 * Randomness is supplied by the caller as a numeric seed and expanded with
 * mulberry32, a small well-tested 32-bit PRNG. That keeps every function here
 * pure and reproducible: the same seed always produces the same winner, which
 * is what makes a giveaway draw auditable.
 */

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** A wheel needs at least two slices to be a choice at all. */
export const MIN_ENTRIES = 2;

/** Above this the slices are too thin to read on a phone. */
export const MAX_ENTRIES = 60;

/** Weight bounds. A weight of 0 would give a slice of zero width. */
export const MIN_WEIGHT = 1;
export const MAX_WEIGHT = 100;

/** Full turns added before the wheel settles, so the spin looks like a spin. */
export const MIN_SPIN_TURNS = 3;
export const MAX_SPIN_TURNS = 8;

/** Degrees in a circle — named so the geometry reads as geometry. */
export const FULL_CIRCLE = 360;

/**
 * Fraction of a slice kept clear of its edges when picking the landing angle,
 * so the pointer never sits ambiguously on a boundary line.
 */
export const EDGE_MARGIN = 0.15;

/** Design-system colour tokens cycled across the slices. */
export const SEGMENT_TOKENS = [
  "--primary",
  "--secondary",
  "--accent",
  "--info",
  "--success",
  "--warning",
];

/** Weight suffix syntax accepted in the entry list: "Pizza x3" or "Pizza:3". */
const WEIGHT_RE = /^(.*?)\s*(?:[x*:]\s*(\d+))\s*$/i;

/* ------------------------------------------------------------------ */
/* Entry parsing                                                       */
/* ------------------------------------------------------------------ */

/**
 * Parse a newline-separated list into weighted entries.
 * "Alice", "Bob x3" and "Team C:2" are all accepted.
 */
export function parseEntries(text) {
  const lines = String(text == null ? "" : text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return { error: "Add some entries — one per line." };
  if (lines.length > MAX_ENTRIES) {
    return { error: `That is ${lines.length} entries; the wheel holds up to ${MAX_ENTRIES}.` };
  }

  const entries = [];
  for (const line of lines) {
    const match = WEIGHT_RE.exec(line);
    let label = line;
    let weight = 1;
    if (match && match[1].trim()) {
      label = match[1].trim();
      weight = Number(match[2]);
    }
    if (!Number.isFinite(weight) || weight < MIN_WEIGHT || weight > MAX_WEIGHT) {
      return { error: `Weight for "${label}" must be a whole number from ${MIN_WEIGHT} to ${MAX_WEIGHT}.` };
    }
    entries.push({ label, weight });
  }

  if (entries.length < MIN_ENTRIES) {
    return { error: `A wheel needs at least ${MIN_ENTRIES} entries.` };
  }
  return { entries };
}

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

/**
 * Lay the entries out around the circle, clockwise from 12 o'clock.
 * Returns each slice's start, end and mid angle in degrees, plus its share.
 */
export function buildSegments(entries) {
  if (!Array.isArray(entries) || entries.length < MIN_ENTRIES) {
    return { error: `A wheel needs at least ${MIN_ENTRIES} entries.` };
  }
  const totalWeight = entries.reduce((sum, entry) => sum + Number(entry.weight || 0), 0);
  if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
    return { error: "Total weight must be greater than zero." };
  }

  let cursor = 0;
  const segments = entries.map((entry, index) => {
    const share = Number(entry.weight) / totalWeight;
    const sweep = share * FULL_CIRCLE;
    const start = cursor;
    cursor += sweep;
    return {
      index,
      label: entry.label,
      weight: Number(entry.weight),
      share,
      sharePercent: Math.round(share * 1000) / 10,
      startAngle: start,
      endAngle: cursor,
      midAngle: start + sweep / 2,
      sweep,
      token: SEGMENT_TOKENS[index % SEGMENT_TOKENS.length],
    };
  });

  return { segments, totalWeight };
}

/* ------------------------------------------------------------------ */
/* Pseudo-random number generator                                      */
/* ------------------------------------------------------------------ */

/**
 * mulberry32 — a 32-bit PRNG. Given the same seed it always produces the same
 * sequence, which makes a draw reproducible and checkable afterwards.
 */
export function mulberry32(seed) {
  let state = Math.trunc(Number(seed)) >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Spinning                                                            */
/* ------------------------------------------------------------------ */

/**
 * Spin the wheel.
 *
 * @param {Array<{label:string,weight:number}>} entries
 * @param {number} seed        any integer; the same seed gives the same result
 * @param {Array<number>} excludeIndexes indexes already won, for no-repeat draws
 * @returns {{winnerIndex:number, winner:object, rotationDeg:number, turns:number}}
 */
export function spinWheel(entries, seed, excludeIndexes = []) {
  const built = buildSegments(entries);
  if (built.error) return built;

  const excluded = new Set(excludeIndexes);
  const eligible = built.segments.filter((segment) => !excluded.has(segment.index));
  if (eligible.length === 0) {
    return { error: "Every entry has already been drawn — reset the wheel to draw again." };
  }

  const random = mulberry32(seed);
  const eligibleWeight = eligible.reduce((sum, segment) => sum + segment.weight, 0);
  if (eligibleWeight <= 0) return { error: "Remaining entries have no weight left to draw from." };

  // Weighted pick: walk the cumulative weights until the target is passed.
  let target = random() * eligibleWeight;
  let winner = eligible[eligible.length - 1];
  for (const segment of eligible) {
    target -= segment.weight;
    if (target <= 0) {
      winner = segment;
      break;
    }
  }

  // Land somewhere inside the winning slice, clear of both boundaries.
  const usable = winner.sweep * (1 - 2 * EDGE_MARGIN);
  const landing = winner.startAngle + winner.sweep * EDGE_MARGIN + random() * usable;

  const turns = MIN_SPIN_TURNS + Math.floor(random() * (MAX_SPIN_TURNS - MIN_SPIN_TURNS + 1));
  // The pointer sits at 0 degrees (12 o'clock). Rotating the wheel by
  // (360 - landing) brings that angle under the pointer.
  const rotationDeg = turns * FULL_CIRCLE + ((FULL_CIRCLE - landing) % FULL_CIRCLE);

  return {
    winnerIndex: winner.index,
    winner: { label: winner.label, weight: winner.weight, sharePercent: winner.sharePercent },
    landingAngle: Math.round(landing * 100) / 100,
    rotationDeg: Math.round(rotationDeg * 100) / 100,
    turns,
    segments: built.segments,
    eligibleCount: eligible.length,
  };
}

/**
 * Absolute rotation for the next spin, so the wheel always turns forwards and
 * still lands with the winning slice under the pointer.
 *
 * Rounding the previous rotation up to a whole number of turns keeps the
 * alignment exact, because a whole number of turns is 0 degrees modulo 360.
 */
export function nextRotation(previousDeg, rotationDeg) {
  const previous = Number(previousDeg) || 0;
  const spin = Number(rotationDeg) || 0;
  const base = Math.ceil(previous / FULL_CIRCLE) * FULL_CIRCLE;
  return base + spin;
}

/* ------------------------------------------------------------------ */
/* Statistics                                                          */
/* ------------------------------------------------------------------ */

/**
 * Compare how often each entry has actually won against how often it should.
 *
 * @param {Array} segments  from buildSegments
 * @param {Array<string>} history winner labels, most recent first or last
 */
export function spinStatistics(segments, history) {
  if (!Array.isArray(segments) || segments.length === 0) {
    return { error: "Build the wheel before reading its statistics." };
  }
  const spins = Array.isArray(history) ? history.length : 0;
  const counts = new Map();
  for (const label of history || []) counts.set(label, (counts.get(label) || 0) + 1);

  const rows = segments.map((segment) => {
    const wins = counts.get(segment.label) || 0;
    // Guard: with no spins yet the observed share is 0, not a division by zero.
    const observedShare = spins > 0 ? wins / spins : 0;
    return {
      label: segment.label,
      wins,
      expectedPercent: segment.sharePercent,
      observedPercent: Math.round(observedShare * 1000) / 10,
      deviation: Math.round((observedShare * 100 - segment.sharePercent) * 10) / 10,
      expectedWins: Math.round(segment.share * spins * 10) / 10,
    };
  });

  return {
    spins,
    rows,
    mostDrawn: spins === 0 ? null : rows.reduce((best, row) => (row.wins > best.wins ? row : best), rows[0]).label,
    neverDrawn: rows.filter((row) => row.wins === 0).map((row) => row.label),
  };
}
