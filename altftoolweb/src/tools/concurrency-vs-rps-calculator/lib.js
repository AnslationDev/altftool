/**
 * Concurrency <-> RPS <-> response time conversion.
 *
 * The relationship is Little's Law (J.D.C. Little, 1961), which holds for any
 * stable queueing system regardless of arrival distribution:
 *
 *   L = lambda x W
 *
 *   L      = average number of requests in the system (concurrency)
 *   lambda = average arrival/throughput rate (requests per second)
 *   W      = average time one request spends in the system (seconds)
 *
 * Load-testing tools model a "virtual user" as a loop of request + think time,
 * so for user counts W becomes (response time + think time). Two views follow:
 *
 *   in-flight concurrency = RPS x response time            (requests being served)
 *   virtual users needed  = RPS x (response time + think)  (loops to sustain the rate)
 *
 * With think time = 0 the two are identical.
 */

export const SOLVE_MODES = [
  { id: "concurrency", label: "Concurrent users (from RPS and response time)" },
  { id: "rps", label: "Requests per second (from users and response time)" },
  { id: "responseTime", label: "Response time (from users and RPS)" },
];

export const MS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;

/** Sanity ceilings so the model keeps describing a real system. */
export const MAX_RPS = 10_000_000;
export const MAX_CONCURRENCY = 10_000_000;
export const MAX_RESPONSE_TIME_MS = 3_600_000; // one hour
export const MAX_THINK_TIME_MS = 3_600_000;

function toNumber(value) {
  if (typeof value === "string" && value.trim() === "") return NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

/**
 * Solve Little's Law for the chosen unknown.
 *
 * @param {object} input
 * @param {"concurrency"|"rps"|"responseTime"} input.solveFor
 * @param {number} [input.concurrency]      virtual users (given unless solving for it)
 * @param {number} [input.rps]              requests per second (given unless solving for it)
 * @param {number} [input.responseTimeMs]   avg response time, ms (given unless solving for it)
 * @param {number} [input.thinkTimeMs=0]    pause between a user's requests, ms
 * @returns {object|{error:string}} consistent set of all four values plus derived figures
 */
export function solveLittlesLaw({
  solveFor,
  concurrency,
  rps,
  responseTimeMs,
  thinkTimeMs = 0,
} = {}) {
  if (!SOLVE_MODES.some((mode) => mode.id === solveFor)) {
    return { error: "Choose which quantity to solve for." };
  }

  const think = toNumber(thinkTimeMs);
  if (Number.isNaN(think) || think < 0) return { error: "Think time cannot be negative or empty." };
  if (think > MAX_THINK_TIME_MS) {
    return { error: "Think time above one hour is outside this model." };
  }

  let users = toNumber(concurrency);
  let rate = toNumber(rps);
  let response = toNumber(responseTimeMs);

  const check = (value, name, max, unit) => {
    if (Number.isNaN(value)) return `Enter a number for ${name}.`;
    if (value <= 0) return `${name} must be greater than zero.`;
    if (value > max) return `${name} above ${max.toLocaleString("en-US")} ${unit} is outside this model.`;
    return null;
  };

  if (solveFor === "concurrency") {
    const problem =
      check(rate, "Requests per second", MAX_RPS, "req/s") ||
      check(response, "Response time", MAX_RESPONSE_TIME_MS, "ms");
    if (problem) return { error: problem };
    // L = lambda x W, with W = response + think for a virtual-user loop
    users = rate * ((response + think) / MS_PER_SECOND);
  } else if (solveFor === "rps") {
    const problem =
      check(users, "Concurrent users", MAX_CONCURRENCY, "users") ||
      check(response, "Response time", MAX_RESPONSE_TIME_MS, "ms");
    if (problem) return { error: problem };
    // lambda = L / W
    rate = users / ((response + think) / MS_PER_SECOND);
  } else {
    const problem =
      check(users, "Concurrent users", MAX_CONCURRENCY, "users") ||
      check(rate, "Requests per second", MAX_RPS, "req/s");
    if (problem) return { error: problem };
    // W = L / lambda, then subtract think time to isolate the response part
    const totalMs = (users / rate) * MS_PER_SECOND;
    response = totalMs - think;
    if (response <= 0) {
      return {
        error:
          "These numbers leave no room for a response time — the think time alone already accounts for the whole cycle. Lower the think time or the RPS.",
      };
    }
  }

  const cycleSeconds = (response + think) / MS_PER_SECOND;
  const inFlight = rate * (response / MS_PER_SECOND);

  return {
    concurrency: users,
    rps: rate,
    responseTimeMs: response,
    thinkTimeMs: think,
    cycleSeconds,
    inFlight,
    thinkingUsers: Math.max(0, users - inFlight),
    requestsPerMinute: rate * SECONDS_PER_MINUTE,
    requestsPerUserPerSecond: cycleSeconds > 0 ? 1 / cycleSeconds : 0,
    solveFor,
  };
}
