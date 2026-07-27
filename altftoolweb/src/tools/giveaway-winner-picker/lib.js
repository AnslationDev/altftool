/**
 * Giveaway Winner Picker — entry parsing, duplicate detection and a fair,
 * reproducible random draw.
 *
 * Fairness rests on three things, all implemented here rather than left to
 * chance:
 *
 *   1. A seeded PRNG (mulberry32, a 32-bit generator with a 2^32 period).
 *      The same seed always produces the same winners, so a draw can be
 *      re-run and audited by anyone who has the entry list and the seed.
 *   2. The Fisher-Yates shuffle, the standard unbiased shuffle: walking from
 *      the end of the list and swapping each item with a uniformly chosen
 *      index at or below it gives every permutation equal probability.
 *      (The naive "sort by random" shuffle does not.)
 *   3. Drawing without replacement, so nobody wins twice in one draw.
 *
 * Weighted entries use cumulative-weight selection: an entrant with weight 3
 * occupies three times the interval of an entrant with weight 1, which is the
 * same thing as putting three tickets in the drum for them.
 *
 * Odds: with equal weights, each entrant's chance of appearing among w winners
 * drawn without replacement from n entrants is exactly w / n.
 *
 * Pure module: no React, no DOM, no clock reads — the seed is an argument.
 */

/** Weight syntax accepted at the end of a line: "priya x3" or "priya, 3". */
export const WEIGHT_PATTERN = /(?:\s*[x*]\s*(\d{1,4})|,\s*(\d{1,4}))\s*$/i;

/** Hard limits so a paste of a whole spreadsheet cannot hang the page. */
export const MAX_ENTRIES = 50000;
export const MAX_WEIGHT = 1000;
export const MAX_WINNERS = 500;

/** Characters stripped from a handle before comparing entries. */
export const HANDLE_PREFIXES = ["@", "#"];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * mulberry32: a small, fast, well-distributed 32-bit PRNG.
 * Returns a function producing floats in [0, 1).
 */
export function makeRandom(seed) {
  let state = (isNum(seed) ? Math.floor(seed) : 1) >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normalise an entry for duplicate comparison. */
export function normaliseEntry(name, { caseSensitive = false, stripHandles = true } = {}) {
  let value = String(name ?? "").trim().replace(/\s+/g, " ");
  if (stripHandles) {
    while (value.length > 1 && HANDLE_PREFIXES.includes(value[0])) value = value.slice(1);
  }
  return caseSensitive ? value : value.toLowerCase();
}

/**
 * Parse a pasted entry list.
 *
 * @param {string} text One entry per line; a trailing "x3" or ", 3" sets weight.
 * @param {{ caseSensitive?: boolean, stripHandles?: boolean, mergeDuplicates?: boolean }} options
 *   mergeDuplicates true  -> a repeated name keeps one ticket (deduplicated draw)
 *   mergeDuplicates false -> each repeat is another ticket (more entries, better odds)
 * @returns {object} parsed entries or { error }
 */
export function parseEntries(text, { caseSensitive = false, stripHandles = true, mergeDuplicates = true } = {}) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste at least one entry, one name per line." };
  }
  const lines = text.split(/\r\n|\r|\n/);
  if (lines.length > MAX_ENTRIES) {
    return { error: `This picker handles up to ${MAX_ENTRIES.toLocaleString("en-IN")} lines at once.` };
  }

  const byKey = new Map();
  const order = [];
  let blankLines = 0;
  let duplicateLines = 0;
  let weightedLines = 0;

  lines.forEach((line, index) => {
    const raw = line.trim();
    if (raw === "") {
      blankLines += 1;
      return;
    }
    const match = raw.match(WEIGHT_PATTERN);
    let display = raw;
    let weight = 1;
    if (match) {
      const parsed = Number(match[1] ?? match[2]);
      if (Number.isFinite(parsed) && parsed >= 1) {
        weight = Math.min(MAX_WEIGHT, Math.floor(parsed));
        display = raw.slice(0, match.index).trim();
        weightedLines += 1;
      }
    }
    if (display === "") {
      blankLines += 1;
      return;
    }
    const key = normaliseEntry(display, { caseSensitive, stripHandles });
    if (key === "") {
      blankLines += 1;
      return;
    }
    const existing = byKey.get(key);
    if (existing) {
      duplicateLines += 1;
      existing.lines.push(index + 1);
      if (!mergeDuplicates) existing.weight += weight;
      return;
    }
    const entry = { key, name: display, weight, lines: [index + 1] };
    byKey.set(key, entry);
    order.push(entry);
  });

  if (order.length === 0) {
    return { error: "No usable names found — every line was blank." };
  }

  const totalWeight = order.reduce((sum, entry) => sum + entry.weight, 0);
  return {
    entries: order,
    uniqueCount: order.length,
    totalWeight,
    duplicateLines,
    blankLines,
    weightedLines,
    duplicates: order.filter((entry) => entry.lines.length > 1).map((entry) => ({ name: entry.name, times: entry.lines.length })),
  };
}

/** Fisher-Yates shuffle driven by a seeded PRNG. Returns a new array. */
export function shuffle(items, random) {
  const out = Array.isArray(items) ? items.slice() : [];
  const next = typeof random === "function" ? random : makeRandom(1);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    const swap = out[i];
    out[i] = out[j];
    out[j] = swap;
  }
  return out;
}

/**
 * Draw winners without replacement, honouring weights.
 *
 * @param {{ entries: Array, winners?: number, alternates?: number, seed?: number }} input
 * @returns {object} draw result or { error }
 */
export function drawWinners({ entries, winners = 1, alternates = 0, seed = 1 } = {}) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "There are no entries to draw from." };
  }
  if (!isNum(winners) || winners < 1) return { error: "Pick at least one winner." };
  if (!isNum(alternates) || alternates < 0) return { error: "The number of alternates cannot be negative." };
  const winnerCount = Math.floor(winners);
  const alternateCount = Math.floor(alternates);
  if (winnerCount > MAX_WINNERS) return { error: `Draw at most ${MAX_WINNERS} winners in one go.` };
  if (winnerCount > entries.length) {
    return { error: `You asked for ${winnerCount} winners but only ${entries.length} entries are in the draw.` };
  }
  if (winnerCount + alternateCount > entries.length) {
    return {
      error: `${winnerCount} winners plus ${alternateCount} alternates needs ${winnerCount + alternateCount} entries; there are ${entries.length}.`,
    };
  }

  const random = makeRandom(seed);
  const pool = entries.map((entry) => ({ ...entry }));
  const picked = [];
  let remainingWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);

  for (let round = 0; round < winnerCount + alternateCount; round += 1) {
    if (remainingWeight <= 0) break;
    const target = random() * remainingWeight;
    let running = 0;
    let chosenIndex = pool.length - 1;
    for (let i = 0; i < pool.length; i += 1) {
      running += pool[i].weight;
      if (target < running) {
        chosenIndex = i;
        break;
      }
    }
    const [chosen] = pool.splice(chosenIndex, 1);
    remainingWeight -= chosen.weight;
    picked.push(chosen);
  }

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  const equalWeights = entries.every((entry) => entry.weight === entries[0].weight);

  return {
    seed: Math.floor(seed),
    winners: picked.slice(0, winnerCount).map((entry, index) => ({
      position: index + 1,
      name: entry.name,
      weight: entry.weight,
      sharePercent: Math.round((entry.weight / totalWeight) * 10000) / 100,
    })),
    alternates: picked.slice(winnerCount).map((entry, index) => ({
      position: index + 1,
      name: entry.name,
      weight: entry.weight,
      sharePercent: Math.round((entry.weight / totalWeight) * 10000) / 100,
    })),
    entryCount: entries.length,
    totalWeight,
    equalWeights,
    oddsPercent: equalWeights ? Math.round((winnerCount / entries.length) * 10000) / 100 : null,
    oddsNote: equalWeights
      ? `Every entry had exactly ${winnerCount} in ${entries.length} odds.`
      : "Entries carry different weights, so each entrant's share of the total weight is shown beside their name.",
  };
}

/** Odds of one entry winning, as a percentage, for equal-weight draws. */
export function oddsPercent(entryCount, winnerCount) {
  if (!isNum(entryCount) || entryCount <= 0) return { error: "There must be at least one entry." };
  if (!isNum(winnerCount) || winnerCount <= 0) return { error: "There must be at least one winner." };
  if (winnerCount > entryCount) return { error: "There cannot be more winners than entries." };
  return Math.round((winnerCount / entryCount) * 10000) / 100;
}

/**
 * One call: parse, then draw.
 *
 * @param {{ text: string, winners?: number, alternates?: number, seed?: number,
 *           caseSensitive?: boolean, stripHandles?: boolean, mergeDuplicates?: boolean }} input
 */
export function runGiveaway({
  text,
  winners = 1,
  alternates = 0,
  seed = 1,
  caseSensitive = false,
  stripHandles = true,
  mergeDuplicates = true,
} = {}) {
  const parsed = parseEntries(text, { caseSensitive, stripHandles, mergeDuplicates });
  if (parsed.error) return { error: parsed.error };
  const draw = drawWinners({ entries: parsed.entries, winners, alternates, seed });
  if (draw.error) return { error: draw.error, parsed };
  return { parsed, draw };
}

/** A realistic starting list so the tool shows a real draw on first paint. */
export const SAMPLE_ENTRIES = [
  "@ananya_reads",
  "@rahulcooks x3",
  "@meera.designs",
  "@iamvikram",
  "@sanaphotography",
  "@rahulcooks",
  "@dev_with_tea",
  "@priya.travels, 2",
  "@nikhil.builds",
  "@thefoodiegirl",
].join("\n");
