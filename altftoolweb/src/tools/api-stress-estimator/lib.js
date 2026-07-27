/**
 * API load estimator built on the M/M/c queue.
 *
 * An API server pool is modelled as c identical workers serving one shared
 * FIFO queue, requests arriving as a Poisson process at λ per second and each
 * taking an exponentially distributed service time with mean 1/μ seconds.
 * That is the M/M/c queue, and it gives closed-form answers for exactly the
 * questions a capacity review asks.
 *
 * Formulas used (Gross & Harris, "Fundamentals of Queueing Theory"):
 *   offered load          a = λ / μ                      (erlangs)
 *   utilisation           ρ = a / c
 *   Erlang B recursion    B(0) = 1, B(n) = a·B(n−1) / (n + a·B(n−1))
 *   Erlang C              C = B(c) / (1 − ρ·(1 − B(c)))
 *   mean queue wait       Wq = C / (cμ − λ)
 *   mean response time    W  = Wq + 1/μ
 *   requests in system    L  = λ·W                       (Little's law)
 *
 * Tail latency uses the exact FCFS sojourn-time survival function: with
 * probability (1 − C) a request is served immediately and its response time is
 * Exp(μ); with probability C it waits Exp(θ), θ = cμ − λ, and is then served,
 * giving a hypoexponential sum.
 *
 * The Erlang B recursion is used instead of the factorial form because a^c/c!
 * overflows to Infinity for perfectly ordinary inputs (c = 200, a = 150).
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Utilisation an SRE team normally designs to, leaving headroom for bursts.
 * Above this the queueing term grows faster than the traffic that caused it. */
export const TARGET_UTILISATION = 0.7;

/** Utilisation past which the queue is treated as effectively saturated. */
export const SATURATION_UTILISATION = 1;

/** Search ceiling when sizing a pool. Beyond this the answer is "redesign". */
export const MAX_WORKERS = 4096;

/** Percentiles reported for response time. */
export const REPORTED_PERCENTILES = [50, 90, 95, 99];

/** Traffic multipliers applied to the baseline rate for the scenario table.
 * The values are the ones capacity reviews normally walk through: steady
 * state, a normal daily peak, a marketing spike and a 10x incident. */
export const TRAFFIC_SCENARIOS = [
  { id: "baseline", label: "Baseline", multiplier: 1 },
  { id: "daily-peak", label: "Daily peak", multiplier: 2 },
  { id: "campaign", label: "Campaign spike", multiplier: 5 },
  { id: "viral", label: "Viral / incident", multiplier: 10 },
];

/** Bisection settings for inverting the response-time distribution. */
const PERCENTILE_MAX_SECONDS = 3600; // one hour: past this, latency is academic
const PERCENTILE_ITERATIONS = 200; // 200 halvings resolves far below 1 µs

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Erlang B blocking probability, by the numerically stable recursion.
 *
 * @param {number} servers c
 * @param {number} offeredLoad a, in erlangs
 * @returns {number} probability in [0, 1]
 */
export function erlangB(servers, offeredLoad) {
  if (!isNum(servers) || !isNum(offeredLoad) || servers < 1 || offeredLoad < 0) return 1;
  let value = 1;
  for (let n = 1; n <= Math.floor(servers); n += 1) {
    value = (offeredLoad * value) / (n + offeredLoad * value);
  }
  return value;
}

/**
 * Erlang C — the probability an arriving request has to queue.
 *
 * @param {number} servers c
 * @param {number} offeredLoad a
 * @returns {number} probability in [0, 1]
 */
export function erlangC(servers, offeredLoad) {
  if (!isNum(servers) || !isNum(offeredLoad) || servers < 1 || offeredLoad < 0) return 1;
  const rho = offeredLoad / servers;
  if (rho >= 1) return 1;
  const b = erlangB(servers, offeredLoad);
  const denominator = 1 - rho * (1 - b);
  if (denominator <= 0) return 1;
  return Math.min(1, Math.max(0, b / denominator));
}

/**
 * P(response time > t) for M/M/c FCFS, t in seconds.
 *
 * @param {number} t seconds
 * @param {number} mu service rate per worker, per second
 * @param {number} theta cμ − λ, the queue drain rate
 * @param {number} c Erlang C probability of queueing
 */
function survival(t, mu, theta, probQueue) {
  if (t <= 0) return 1;
  const served = Math.exp(-mu * t);
  if (probQueue <= 0) return served;
  // Sum of Exp(theta) wait and Exp(mu) service. The theta === mu case is the
  // Erlang-2 limit and has to be taken separately or the formula divides by 0.
  const waited =
    Math.abs(theta - mu) < 1e-12
      ? (1 + mu * t) * Math.exp(-mu * t)
      : (theta * Math.exp(-mu * t) - mu * Math.exp(-theta * t)) / (theta - mu);
  return (1 - probQueue) * served + probQueue * Math.min(1, Math.max(0, waited));
}

/** Invert the survival function by bisection: the t where P(T > t) = 1 − p. */
function percentileSeconds(percentile, mu, theta, probQueue) {
  const target = 1 - percentile / 100;
  let low = 0;
  let high = PERCENTILE_MAX_SECONDS;
  if (survival(high, mu, theta, probQueue) > target) return high;
  for (let i = 0; i < PERCENTILE_ITERATIONS; i += 1) {
    const mid = (low + high) / 2;
    if (survival(mid, mu, theta, probQueue) > target) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

/**
 * Sustainable request rate for a pool, at a chosen utilisation.
 *
 * @param {{ serviceTimeMs:number, workers:number, utilisation?:number }} input
 * @returns {{ requestsPerSecond:number } | { error:string }}
 */
export function capacityAt({ serviceTimeMs, workers, utilisation = TARGET_UTILISATION } = {}) {
  if (!isNum(serviceTimeMs) || serviceTimeMs <= 0) {
    return { error: "Average response time must be greater than zero milliseconds." };
  }
  if (!isNum(workers) || workers < 1) {
    return { error: "There must be at least one worker." };
  }
  if (!isNum(utilisation) || utilisation <= 0 || utilisation >= 1) {
    return { error: "Target utilisation must be between 0% and 100%." };
  }
  const mu = 1000 / serviceTimeMs;
  return { requestsPerSecond: Math.floor(workers) * mu * utilisation };
}

/**
 * Full M/M/c analysis of one traffic level.
 *
 * @param {object} input
 * @param {number} input.requestsPerSecond arrival rate λ
 * @param {number} input.serviceTimeMs mean time one worker spends per request
 * @param {number} input.workers total concurrent request slots (instances × concurrency)
 * @returns {object} analysis, or { error: string }
 */
export function analyzeLoad({ requestsPerSecond, serviceTimeMs, workers } = {}) {
  if (!isNum(requestsPerSecond) || requestsPerSecond <= 0) {
    return { error: "Enter a request rate greater than zero per second." };
  }
  if (!isNum(serviceTimeMs) || serviceTimeMs <= 0) {
    return { error: "Average response time must be greater than zero milliseconds." };
  }
  if (!isNum(workers) || workers < 1) {
    return { error: "There must be at least one worker handling requests." };
  }
  if (workers > MAX_WORKERS) {
    return { error: `Model at most ${MAX_WORKERS} workers — past that, size by shard rather than by queue.` };
  }

  const c = Math.floor(workers);
  const mu = 1000 / serviceTimeMs; // requests per second per worker
  const lambda = requestsPerSecond;
  const offeredLoad = lambda / mu; // erlangs
  const utilisation = offeredLoad / c;
  const serviceCapacity = c * mu;

  if (utilisation >= SATURATION_UTILISATION) {
    const needed = Math.ceil(offeredLoad / TARGET_UTILISATION);
    const maxServiceMs = (c * TARGET_UTILISATION * 1000) / lambda;
    return {
      error:
        `${formatRps(lambda)} req/s needs ${offeredLoad.toFixed(1)} workers' worth of work but only ${c} ${c === 1 ? "is" : "are"} available — utilisation is ${(utilisation * 100).toFixed(0)}%, so the queue grows without bound. ` +
        `Run at least ${needed} workers, or cut average response time to ${maxServiceMs.toFixed(1)} ms.`,
    };
  }

  const probQueue = erlangC(c, offeredLoad);
  const theta = serviceCapacity - lambda; // queue drain rate, > 0 because ρ < 1
  const meanWaitSeconds = probQueue / theta;
  const meanResponseSeconds = meanWaitSeconds + 1 / mu;

  const percentiles = {};
  for (const p of REPORTED_PERCENTILES) {
    percentiles[p] = percentileSeconds(p, mu, theta, probQueue) * 1000;
  }

  const headroomRps = serviceCapacity * TARGET_UTILISATION - lambda;

  return {
    lambda,
    workers: c,
    serviceTimeMs,
    mu,
    offeredLoad,
    utilisation,
    serviceCapacityRps: serviceCapacity,
    safeCapacityRps: serviceCapacity * TARGET_UTILISATION,
    headroomRps,
    headroomPercent: (headroomRps / lambda) * 100,
    probQueue,
    meanWaitMs: meanWaitSeconds * 1000,
    meanResponseMs: meanResponseSeconds * 1000,
    queueLength: lambda * meanWaitSeconds, // Little's law on the queue alone
    requestsInSystem: lambda * meanResponseSeconds,
    percentiles,
    // Queueing delay as a share of the response a client actually sees.
    queueShareOfLatency: meanWaitSeconds / meanResponseSeconds,
    risk: classifyRisk(utilisation),
  };
}

/** Risk band for a utilisation figure. Thresholds follow the usual capacity
 * review convention: design to 70%, alert at 80%, page at 90%. */
export function classifyRisk(utilisation) {
  if (!isNum(utilisation)) return { level: "unknown", label: "Unknown" };
  if (utilisation < 0.5) return { level: "low", label: "Comfortable" };
  if (utilisation < TARGET_UTILISATION) return { level: "moderate", label: "Healthy" };
  if (utilisation < 0.8) return { level: "warning", label: "Watch closely" };
  if (utilisation < 0.9) return { level: "high", label: "Near capacity" };
  return { level: "critical", label: "Overloaded" };
}

/**
 * Smallest pool that keeps a chosen percentile under a latency budget.
 *
 * @param {object} input
 * @param {number} input.requestsPerSecond
 * @param {number} input.serviceTimeMs
 * @param {number} [input.percentile] defaults to 99
 * @param {number} input.budgetMs
 * @returns {{ workers:number, achievedMs:number } | { error:string }}
 */
export function workersForLatencyBudget({
  requestsPerSecond,
  serviceTimeMs,
  percentile = 99,
  budgetMs,
} = {}) {
  if (!isNum(budgetMs) || budgetMs <= 0) {
    return { error: "Set a latency budget greater than zero milliseconds." };
  }
  if (!isNum(serviceTimeMs) || serviceTimeMs <= 0) {
    return { error: "Average response time must be greater than zero milliseconds." };
  }
  // Even an idle worker cannot beat its own service time at a high percentile.
  const floorMs = -Math.log(1 - percentile / 100) * serviceTimeMs;
  if (budgetMs < floorMs) {
    return {
      error: `No pool size reaches a p${percentile} of ${budgetMs} ms when one request averages ${serviceTimeMs} ms — the service time alone puts p${percentile} at ${floorMs.toFixed(0)} ms. Make the request faster first.`,
    };
  }

  for (let workers = 1; workers <= MAX_WORKERS; workers += 1) {
    const result = analyzeLoad({ requestsPerSecond, serviceTimeMs, workers });
    if (result.error) continue;
    const achieved = result.percentiles[percentile];
    if (isNum(achieved) && achieved <= budgetMs) {
      return { workers, achievedMs: achieved };
    }
  }
  return {
    error: `Even ${MAX_WORKERS} workers cannot hold p${percentile} under ${budgetMs} ms at this rate.`,
  };
}

/**
 * The same pool measured against each traffic scenario.
 *
 * @param {{ requestsPerSecond:number, serviceTimeMs:number, workers:number }} input
 * @returns {Array<object>} one row per TRAFFIC_SCENARIOS entry
 */
export function buildScenarioTable({ requestsPerSecond, serviceTimeMs, workers } = {}) {
  return TRAFFIC_SCENARIOS.map((scenario) => {
    const rps = requestsPerSecond * scenario.multiplier;
    const result = analyzeLoad({ requestsPerSecond: rps, serviceTimeMs, workers });
    return {
      ...scenario,
      requestsPerSecond: rps,
      result,
      survives: !result.error,
    };
  });
}

function formatRps(value) {
  return Math.round(value * 100) / 100;
}
