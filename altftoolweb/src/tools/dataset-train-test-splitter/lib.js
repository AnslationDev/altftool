/**
 * Deterministic three-way JSONL dataset splitter.
 *
 * Reproducibility contract: the same input lines, percentages, seed and shuffle
 * flag always yield byte-identical train / validation / test files.
 *
 * Split sizes use the largest-remainder (Hamilton) apportionment method so the
 * three counts always sum exactly to the number of records and each split gets
 * the count closest to its requested share.
 */

/** Percentages must sum to exactly this. */
export const PCT_TOTAL = 100;

/** Cap on records processed in the browser, to keep the UI responsive. */
export const MAX_RECORDS = 200000;

/**
 * mulberry32 — a public-domain 32-bit seeded PRNG by Tommy Ettinger
 * (widely used reference implementation from bryc/code, "PRNGs in JavaScript").
 * Chosen because it is tiny, fast and deterministic across JS engines.
 *
 * @param {number} seed  32-bit integer seed.
 * @returns {() => number} function producing floats in [0, 1).
 */
export function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Durstenfeld variant of the Fisher-Yates shuffle (Knuth, TAOCP vol. 2,
 * Algorithm P). In-place, driven by the supplied PRNG for determinism.
 */
export function seededShuffle(array, rng) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
}

/**
 * Parse JSONL text into records (one non-empty line = one record).
 *
 * @param {string} text
 * @returns {{records: string[], invalid: Array<{line: number, reason: string}>}}
 */
export function parseJsonl(text) {
  const lines = String(text ?? "").split(/\r?\n/);
  const records = [];
  const invalid = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line === "") continue;
    try {
      JSON.parse(line);
      records.push(line);
    } catch {
      invalid.push({ line: i + 1, reason: "not valid JSON" });
    }
  }
  return { records, invalid };
}

/**
 * Apportion n records across percentages using the largest-remainder method:
 * each split gets floor(n * pct / 100), then the leftover records go to the
 * splits with the largest fractional remainders (ties broken by list order).
 *
 * @param {number} n
 * @param {number[]} percentages
 * @returns {number[]} counts summing exactly to n.
 */
export function apportionCounts(n, percentages) {
  const exact = percentages.map((pct) => (n * pct) / PCT_TOTAL);
  const counts = exact.map((value) => Math.floor(value));
  let leftover = n - counts.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);
  for (let k = 0; leftover > 0; k = (k + 1) % order.length) {
    counts[order[k].index] += 1;
    leftover -= 1;
  }
  return counts;
}

/**
 * Split a JSONL dataset into train / validation / test.
 *
 * @param {object} input
 * @param {string}  input.text        Raw JSONL text.
 * @param {number}  input.trainPct    Train share, 0-100.
 * @param {number}  input.valPct      Validation share, 0-100.
 * @param {number}  input.testPct     Test share, 0-100. The three must sum to 100.
 * @param {number}  input.seed        Integer seed for the shuffle.
 * @param {boolean} [input.shuffle]   Shuffle before splitting (default true).
 * @param {boolean} [input.skipInvalid] Drop non-JSON lines instead of erroring (default true).
 * @returns {object} split result, or { error } for unusable input.
 */
export function splitDataset({
  text,
  trainPct,
  valPct,
  testPct,
  seed,
  shuffle = true,
  skipInvalid = true,
}) {
  const pcts = [Number(trainPct), Number(valPct), Number(testPct)];
  if (pcts.some((pct) => !Number.isFinite(pct) || pct < 0 || pct > PCT_TOTAL)) {
    return { error: "Each split percentage must be a number between 0 and 100." };
  }
  // Tolerate float entry like 33.33+33.33+33.34.
  const sum = pcts[0] + pcts[1] + pcts[2];
  if (Math.abs(sum - PCT_TOTAL) > 1e-9) {
    return { error: `The three percentages must add up to 100 (currently ${sum}).` };
  }

  const seedNumber = Number(seed);
  if (!Number.isFinite(seedNumber) || !Number.isInteger(seedNumber)) {
    return { error: "The seed must be a whole number, e.g. 42." };
  }

  const { records, invalid } = parseJsonl(text);
  if (records.length === 0 && invalid.length === 0) {
    return { error: "Paste a JSONL dataset — one JSON object per line." };
  }
  if (!skipInvalid && invalid.length > 0) {
    return {
      error: `Line ${invalid[0].line} is not valid JSON (${invalid.length} invalid line${invalid.length === 1 ? "" : "s"} in total).`,
    };
  }
  if (records.length === 0) {
    return { error: "No line in the input parsed as JSON, so there is nothing to split." };
  }
  if (records.length > MAX_RECORDS) {
    return { error: `Too many records (${records.length}). The in-browser limit is ${MAX_RECORDS}.` };
  }

  const ordered = records.slice();
  if (shuffle) {
    seededShuffle(ordered, mulberry32(seedNumber));
  }

  const [trainCount, valCount, testCount] = apportionCounts(ordered.length, pcts);

  const train = ordered.slice(0, trainCount);
  const validation = ordered.slice(trainCount, trainCount + valCount);
  const test = ordered.slice(trainCount + valCount);

  const warnings = [];
  if (pcts[1] > 0 && valCount === 0) {
    warnings.push("The dataset is too small for the validation share to get even one record.");
  }
  if (pcts[2] > 0 && testCount === 0) {
    warnings.push("The dataset is too small for the test share to get even one record.");
  }
  if (invalid.length > 0) {
    warnings.push(
      `${invalid.length} line${invalid.length === 1 ? "" : "s"} skipped as invalid JSON (first at line ${invalid[0].line}).`,
    );
  }
  if (!shuffle) {
    warnings.push("Shuffle is off — the split follows input order, which can leak ordering bias.");
  }

  return {
    total: ordered.length,
    invalidCount: invalid.length,
    counts: { train: trainCount, validation: valCount, test: testCount },
    train,
    validation,
    test,
    warnings,
    seed: seedNumber,
    shuffled: shuffle,
  };
}
