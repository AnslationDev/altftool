/**
 * Test pyramid ratio planner.
 *
 * The "test pyramid" (Mike Cohn, Succeeding with Agile, 2009; popularised by
 * Martin Fowler's TestPyramid article) says a suite should have many fast
 * unit tests, fewer integration/service tests and very few end-to-end tests.
 * There is no single blessed ratio — the classic illustration is roughly
 * 70/20/10 — so the presets here are commonly cited shapes, not standards.
 *
 * Given a total test count, a ratio split, per-layer average runtimes and
 * per-layer flake rates, this module computes:
 *
 *   count(layer)          = largest-remainder apportionment of total x ratio
 *   serial seconds(layer) = count x avgSeconds
 *   wall-clock seconds    = serial seconds / parallel workers (ideal scaling)
 *   cost per CI run       = wall-clock minutes x runner $/minute
 *   monthly cost          = cost per run x runs per day x 30
 *   P(>=1 flaky failure)  = 1 - prod over layers of (1 - p)^count
 *                           (independent-Bernoulli model of flakes)
 *   expected flakes / run = sum of count x p
 */

/** Commonly cited suite shapes — illustrations from the literature, not rules. */
export const RATIO_PRESETS = [
  { id: "pyramid", label: "Classic pyramid — 70 / 20 / 10 (Cohn)", unit: 70, integration: 20, e2e: 10 },
  { id: "trophy", label: "Integration-heavy trophy — 30 / 60 / 10", unit: 30, integration: 60, e2e: 10 },
  { id: "balanced", label: "Balanced — 60 / 30 / 10", unit: 60, integration: 30, e2e: 10 },
  { id: "cone", label: "Ice-cream cone (anti-pattern) — 20 / 30 / 50", unit: 20, integration: 30, e2e: 50 },
];

export const LAYERS = [
  { id: "unit", label: "Unit" },
  { id: "integration", label: "Integration" },
  { id: "e2e", label: "End-to-end" },
];

/** Ratio fields must sum to exactly 100% within this tolerance. */
export const RATIO_SUM_TOLERANCE = 0.01;

/** Upper bounds that keep the model describing a real project. */
export const MAX_TOTAL_TESTS = 1_000_000;
export const MAX_AVG_SECONDS = 3600; // a single test averaging over an hour is not a test suite
export const MAX_PARALLEL_WORKERS = 512;

export const SECONDS_PER_MINUTE = 60;
export const DAYS_PER_MONTH = 30; // convention for CI budgeting, not a calendar claim

function toNumber(value) {
  if (typeof value === "string" && value.trim() === "") return NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

/**
 * Largest-remainder apportionment so layer counts are whole and sum to total.
 * @param {number} total
 * @param {number[]} percents  same length as LAYERS, sums to ~100
 * @returns {number[]}
 */
export function apportionCounts(total, percents) {
  const exact = percents.map((pct) => (total * pct) / 100);
  const floors = exact.map(Math.floor);
  let remainder = total - floors.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac);
  const counts = [...floors];
  // Percents are only required to sum to 100 within RATIO_SUM_TOLERANCE, so
  // for a large total the rounding remainder can exceed the number of
  // layers (or go negative). Cycle through the layers, ordered by largest
  // fractional part, until the full remainder is distributed (or clawed
  // back) so counts always sum to exactly `total`.
  let cursor = 0;
  while (remainder > 0) {
    counts[order[cursor % order.length].index] += 1;
    remainder -= 1;
    cursor += 1;
  }
  while (remainder < 0) {
    const idx = order[cursor % order.length].index;
    if (counts[idx] > 0) {
      counts[idx] -= 1;
      remainder += 1;
    }
    cursor += 1;
  }
  return counts;
}

/**
 * Plan the suite.
 *
 * @param {object} input
 * @param {number} input.totalTests
 * @param {{unit:number,integration:number,e2e:number}} input.ratios       percents, sum 100
 * @param {{unit:number,integration:number,e2e:number}} input.avgSeconds   mean runtime per test
 * @param {{unit:number,integration:number,e2e:number}} input.flakePercents  per-test flake probability, %
 * @param {number} input.parallelWorkers   CI shards/workers (ideal linear scaling assumed)
 * @param {number} input.costPerMinute     runner price, currency per wall-clock minute
 * @param {number} input.runsPerDay        CI runs per day
 * @returns {object|{error:string}}
 */
export function planPyramid({
  totalTests,
  ratios = {},
  avgSeconds = {},
  flakePercents = {},
  parallelWorkers = 1,
  costPerMinute = 0,
  runsPerDay = 0,
} = {}) {
  const total = toNumber(totalTests);
  if (!Number.isInteger(total) || total < 1) {
    return { error: "Total tests must be a whole number of at least 1." };
  }
  if (total > MAX_TOTAL_TESTS) {
    return { error: `Total tests above ${MAX_TOTAL_TESTS.toLocaleString("en-US")} is outside this model.` };
  }

  const pcts = LAYERS.map((layer) => toNumber(ratios[layer.id]));
  if (pcts.some((value) => Number.isNaN(value) || value < 0 || value > 100)) {
    return { error: "Each ratio must be a percentage between 0 and 100." };
  }
  const sum = pcts.reduce((acc, value) => acc + value, 0);
  // Round away IEEE-754 representation dust (e.g. 33.33 * 3 is ~1e-14 off
  // 100 in double precision, not just display-rounded to 99.99) before
  // comparing to the tolerance, so an input sitting exactly on the tool's
  // declared tolerance boundary isn't rejected by sub-boundary float noise.
  const diff = Math.round(Math.abs(sum - 100) * 1e9) / 1e9;
  if (diff > RATIO_SUM_TOLERANCE) {
    const displaySum = Math.round(sum * 100) / 100;
    return { error: `Ratios must add up to 100% — they currently add up to ${displaySum}%.` };
  }

  const seconds = LAYERS.map((layer) => toNumber(avgSeconds[layer.id]));
  if (seconds.some((value) => Number.isNaN(value) || value < 0)) {
    return { error: "Average runtime per test cannot be negative or empty." };
  }
  if (seconds.some((value) => value > MAX_AVG_SECONDS)) {
    return { error: `Average runtime per test above ${MAX_AVG_SECONDS} seconds is outside this model.` };
  }

  const flakes = LAYERS.map((layer) => toNumber(flakePercents[layer.id]));
  if (flakes.some((value) => Number.isNaN(value) || value < 0 || value > 100)) {
    return { error: "Flake rates must be percentages between 0 and 100." };
  }

  const workers = toNumber(parallelWorkers);
  if (!Number.isInteger(workers) || workers < 1 || workers > MAX_PARALLEL_WORKERS) {
    return { error: `Parallel workers must be a whole number from 1 to ${MAX_PARALLEL_WORKERS}.` };
  }

  const price = toNumber(costPerMinute);
  if (Number.isNaN(price) || price < 0) return { error: "Cost per CI minute cannot be negative." };
  const runs = toNumber(runsPerDay);
  if (Number.isNaN(runs) || runs < 0) return { error: "Runs per day cannot be negative." };

  const counts = apportionCounts(total, pcts);

  const layerRows = LAYERS.map((layer, index) => {
    const count = counts[index];
    const serialSeconds = count * seconds[index];
    const flakeRate = flakes[index] / 100;
    return {
      id: layer.id,
      label: layer.label,
      percent: pcts[index],
      count,
      avgSeconds: seconds[index],
      serialSeconds,
      expectedFlakes: count * flakeRate,
      // (1 - p)^n — probability every test in this layer avoids a flake
      cleanProbability: (1 - flakeRate) ** count,
    };
  });

  const serialSecondsTotal = layerRows.reduce((acc, row) => acc + row.serialSeconds, 0);
  // Ideal linear scaling across workers; real sharding is a little worse.
  const wallClockSeconds = serialSecondsTotal / workers;
  const wallClockMinutes = wallClockSeconds / SECONDS_PER_MINUTE;

  // Note: CI billing usually charges per worker-minute, so parallelism speeds
  // the run up but does NOT cut the bill — billed minutes stay serial.
  const billedMinutes = serialSecondsTotal / SECONDS_PER_MINUTE;
  const costPerRun = billedMinutes * price;
  const monthlyCost = costPerRun * runs * DAYS_PER_MONTH;

  const cleanRunProbability = layerRows.reduce((acc, row) => acc * row.cleanProbability, 1);
  const flakyRunProbability = (1 - cleanRunProbability) * 100;
  const expectedFlakesPerRun = layerRows.reduce((acc, row) => acc + row.expectedFlakes, 0);

  const runtimeShareE2E =
    serialSecondsTotal > 0 ? (layerRows[2].serialSeconds / serialSecondsTotal) * 100 : 0;

  let shape = "Pyramid";
  let shapeNote = "Fast layers dominate — feedback stays quick as the suite grows.";
  if (pcts[2] > pcts[0]) {
    shape = "Ice-cream cone";
    shapeNote =
      "End-to-end tests outnumber unit tests — the classic anti-pattern: slow feedback, high flake exposure, hard debugging.";
  } else if (pcts[1] > pcts[0]) {
    shape = "Trophy";
    shapeNote = "Integration-heavy — reasonable when units are thin wrappers, but watch total runtime.";
  } else if (runtimeShareE2E > 60) {
    shape = "Pyramid by count, cone by runtime";
    shapeNote =
      "E2E tests are few but consume most of the wall-clock — runtime, not count, is what your CI feels.";
  }

  return {
    total,
    layers: layerRows,
    serialSecondsTotal,
    wallClockSeconds,
    wallClockMinutes,
    billedMinutes,
    costPerRun,
    monthlyCost,
    flakyRunProbability,
    expectedFlakesPerRun,
    runtimeShareE2E,
    shape,
    shapeNote,
  };
}
