/**
 * OKR Generator — pure objective/key-result construction and grading.
 *
 * Follows the OKR discipline set out by Andy Grove at Intel and popularised by John Doerr
 * in "Measure What Matters":
 *   - an Objective is qualitative, time-bound and significant;
 *   - a Key Result is numeric, with a start value and a target value;
 *   - 3 to 5 Key Results per Objective;
 *   - committed OKRs are expected to reach 1.0, aspirational OKRs are graded on a
 *     0.0-1.0 scale where 0.7 counts as success.
 *
 * Everything here is deterministic: the same inputs always produce the same OKR.
 */

/** Doerr's guidance: fewer than three is thin, more than five loses focus. */
export const MIN_KEY_RESULTS = 3;
export const MAX_KEY_RESULTS = 5;

/**
 * Ambition levels. The uplift is applied to the baseline to produce the target.
 * Committed OKRs are set to be achieved in full; stretch and moonshot use the Google
 * convention where a score of 0.7 on an aspirational target is a good outcome.
 */
export const AMBITION_LEVELS = [
  {
    key: "committed",
    label: "Committed",
    uplift: 0.1,
    expectedScore: 1.0,
    note: "Expected to land at 100%. Miss it and something went wrong.",
  },
  {
    key: "stretch",
    label: "Stretch",
    uplift: 0.25,
    expectedScore: 0.7,
    note: "Aspirational. Landing at 0.7 is the intended good outcome.",
  },
  {
    key: "moonshot",
    label: "Moonshot",
    uplift: 0.5,
    expectedScore: 0.6,
    note: "Deliberately uncomfortable. Anything above 0.6 is a strong quarter.",
  },
];

/**
 * Domain templates. Each metric states its unit and whether success means the number
 * goes up or down, which decides how the target is derived from the baseline.
 */
export const OKR_DOMAINS = [
  {
    key: "revenue",
    label: "Revenue and growth",
    objectives: [
      "Turn {focus} into a predictable revenue engine by the end of {period}",
      "Make {focus} the fastest-growing line of the business in {period}",
      "Prove that {focus} can grow without proportional spend during {period}",
    ],
    metrics: [
      { name: "Quarterly recurring revenue", unit: "INR", direction: "up", baseline: 4000000 },
      { name: "Qualified pipeline created", unit: "INR", direction: "up", baseline: 12000000 },
      { name: "Win rate on qualified deals", unit: "%", direction: "up", baseline: 22 },
      { name: "Average sales cycle", unit: "days", direction: "down", baseline: 48 },
      { name: "Net revenue retention", unit: "%", direction: "up", baseline: 104 },
    ],
    initiatives: [
      "Rebuild the discovery call script around the two objections that lose most deals",
      "Run a win/loss review on every deal above the median contract value",
      "Publish a pricing page that answers the three questions sales gets asked every week",
      "Set a single owner for pipeline hygiene and review it every Monday",
    ],
  },
  {
    key: "product",
    label: "Product and activation",
    objectives: [
      "Make the first session of {focus} obviously worth repeating in {period}",
      "Remove the friction that stops {focus} users from reaching value in {period}",
      "Ship the smallest version of {focus} that customers will pay for during {period}",
    ],
    metrics: [
      { name: "Day-7 activation rate", unit: "%", direction: "up", baseline: 28 },
      { name: "Time to first value", unit: "minutes", direction: "down", baseline: 22 },
      { name: "Weekly active users", unit: "users", direction: "up", baseline: 9000 },
      { name: "Feature adoption in 30 days", unit: "%", direction: "up", baseline: 15 },
      { name: "Support tickets per 100 sessions", unit: "tickets", direction: "down", baseline: 6 },
    ],
    initiatives: [
      "Watch ten unedited session recordings and fix the first place people hesitate",
      "Cut the onboarding form to the fields you actually use in week one",
      "Instrument the funnel end to end so the drop-off step is not a guess",
      "Ship an empty-state that does one useful thing without any setup",
    ],
  },
  {
    key: "marketing",
    label: "Marketing and demand",
    objectives: [
      "Make {focus} the channel that reliably brings qualified demand in {period}",
      "Earn organic distribution for {focus} instead of renting it in {period}",
      "Turn {focus} content into a compounding acquisition asset during {period}",
    ],
    metrics: [
      { name: "Organic sessions per month", unit: "sessions", direction: "up", baseline: 60000 },
      { name: "Marketing qualified leads", unit: "leads", direction: "up", baseline: 450 },
      { name: "Cost per qualified lead", unit: "INR", direction: "down", baseline: 1800 },
      { name: "Landing page conversion rate", unit: "%", direction: "up", baseline: 3.2 },
      { name: "Email list growth", unit: "subscribers", direction: "up", baseline: 8000 },
    ],
    initiatives: [
      "Rewrite the ten pages that already rank on page two of search results",
      "Replace one paid channel with a partnership that costs time instead of budget",
      "Run a single message test per week and keep only what beats the control",
      "Give every campaign one owner, one metric and one end date",
    ],
  },
  {
    key: "engineering",
    label: "Engineering and reliability",
    objectives: [
      "Make {focus} boring to operate by the end of {period}",
      "Ship {focus} faster without trading away reliability during {period}",
      "Pay down the {focus} debt that slows every other team in {period}",
    ],
    metrics: [
      { name: "Deployment frequency", unit: "deploys/week", direction: "up", baseline: 6 },
      { name: "Change failure rate", unit: "%", direction: "down", baseline: 18 },
      { name: "Mean time to restore", unit: "minutes", direction: "down", baseline: 90 },
      { name: "p95 API latency", unit: "ms", direction: "down", baseline: 780 },
      { name: "Automated test coverage", unit: "%", direction: "up", baseline: 54 },
    ],
    initiatives: [
      "Add a rollback path that any on-call engineer can run without asking permission",
      "Delete the three flakiest tests and replace them with one that actually asserts behaviour",
      "Put the slowest endpoint on a dashboard the whole team sees daily",
      "Write the runbook for the incident you had last quarter",
    ],
  },
  {
    key: "people",
    label: "People and culture",
    objectives: [
      "Make {focus} a team people join and stay on through {period}",
      "Turn {focus} hiring from reactive to planned during {period}",
      "Raise the bar on {focus} feedback and growth in {period}",
    ],
    metrics: [
      { name: "Voluntary attrition", unit: "%", direction: "down", baseline: 14 },
      { name: "Offer acceptance rate", unit: "%", direction: "up", baseline: 68 },
      { name: "Time to hire", unit: "days", direction: "down", baseline: 52 },
      { name: "Engagement survey participation", unit: "%", direction: "up", baseline: 72 },
      { name: "Employees with a written growth plan", unit: "%", direction: "up", baseline: 40 },
    ],
    initiatives: [
      "Run stay interviews with the ten people you would least like to lose",
      "Publish the levelling ladder so promotion stops being a private conversation",
      "Cut one interview round and add one work-sample exercise",
      "Give every manager a fixed 30 minutes of one-to-one time per report per week",
    ],
  },
  {
    key: "support",
    label: "Customer support and success",
    objectives: [
      "Make {focus} customers feel looked after without adding headcount in {period}",
      "Cut the reasons customers have to contact {focus} at all during {period}",
      "Turn {focus} support into a source of product truth in {period}",
    ],
    metrics: [
      { name: "First response time", unit: "minutes", direction: "down", baseline: 240 },
      { name: "Customer satisfaction score", unit: "%", direction: "up", baseline: 86 },
      { name: "Tickets resolved without escalation", unit: "%", direction: "up", baseline: 71 },
      { name: "Repeat contacts per customer", unit: "contacts", direction: "down", baseline: 2.4 },
      { name: "Help-centre deflection rate", unit: "%", direction: "up", baseline: 31 },
    ],
    initiatives: [
      "Write help articles for the five ticket reasons that make up most of the volume",
      "Tag every ticket with a product cause and send the top three to the roadmap review",
      "Set an explicit first-response target and staff the queue to meet it",
      "Give support engineers permission to fix small bugs directly",
    ],
  },
];

/** Grading bands used in most OKR reviews. */
export const GRADE_BANDS = [
  { key: "on-track", label: "On track", min: 0.7, note: "At or above the aspirational success line." },
  { key: "at-risk", label: "At risk", min: 0.4, note: "Real progress, but the target is in doubt." },
  { key: "off-track", label: "Off track", min: 0, note: "Below 0.4 — change the plan, not the target." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/** Looks up a domain template by key, defaulting to the first. */
export function getDomain(key) {
  return OKR_DOMAINS.find((domain) => domain.key === key) || OKR_DOMAINS[0];
}

/** Looks up an ambition level by key, defaulting to committed. */
export function getAmbition(key) {
  return AMBITION_LEVELS.find((level) => level.key === key) || AMBITION_LEVELS[0];
}

/**
 * Deterministic index from a string, so the same focus text always picks the same
 * objective phrasing. A simple FNV-style rolling hash — no randomness anywhere.
 */
export function stableIndex(seed, length) {
  if (!Number.isInteger(length) || length <= 0) return 0;
  const text = String(seed || "");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash % length;
}

/**
 * Derives the target value for one metric.
 * Up metrics: target = baseline x (1 + uplift).
 * Down metrics: target = baseline x (1 - uplift), floored at zero because a rate,
 * a duration or a ticket count cannot go negative.
 */
export function targetFor(baseline, direction, uplift) {
  if (!isNum(baseline) || !isNum(uplift)) return 0;
  const raw = direction === "down" ? baseline * (1 - uplift) : baseline * (1 + uplift);
  return Math.max(0, raw);
}

/**
 * Builds one objective with its key results and initiatives.
 *
 * @param {object} input
 * @param {string} input.domain      Key from OKR_DOMAINS.
 * @param {string} input.focus       What the objective is about, e.g. "self-serve onboarding".
 * @param {string} input.period      Quarter label, e.g. "Q3 FY27". Passed in, never read from the clock.
 * @param {string} input.ambition    Key from AMBITION_LEVELS.
 * @param {number} input.keyResultCount 3 to 5.
 * @param {string} [input.owner]     Objective owner.
 * @returns {object} the OKR, or { error } when the input cannot produce one.
 */
export function generateOKR({
  domain = "revenue",
  focus = "",
  period = "",
  ambition = "committed",
  keyResultCount = MIN_KEY_RESULTS,
  owner = "",
} = {}) {
  const cleanFocus = String(focus || "").trim();
  const cleanPeriod = String(period || "").trim();

  if (cleanFocus === "") {
    return { error: "Say what the objective is about — a team, product area or customer segment." };
  }
  if (cleanPeriod === "") {
    return { error: "Enter the period the objective covers, for example \"Q3 FY27\"." };
  }
  if (!isNum(keyResultCount) || keyResultCount < MIN_KEY_RESULTS || keyResultCount > MAX_KEY_RESULTS) {
    return {
      error: `An objective needs between ${MIN_KEY_RESULTS} and ${MAX_KEY_RESULTS} key results.`,
    };
  }

  const template = getDomain(domain);
  const level = getAmbition(ambition);
  const count = Math.round(keyResultCount);

  const objectiveIndex = stableIndex(`${cleanFocus}|${template.key}`, template.objectives.length);
  const objective = template.objectives[objectiveIndex]
    .replace("{focus}", cleanFocus)
    .replace("{period}", cleanPeriod);

  const start = stableIndex(`${cleanFocus}|kr`, template.metrics.length);
  const keyResults = [];
  for (let i = 0; i < count; i += 1) {
    const metric = template.metrics[(start + i) % template.metrics.length];
    // Round the target to the precision the unit is quoted in, so the stored number and
    // the written statement can never disagree.
    const target = Number(formatMetric(targetFor(metric.baseline, metric.direction, level.uplift), metric.unit));
    keyResults.push({
      id: `${template.key}-${metric.name}`,
      metric: metric.name,
      unit: metric.unit,
      direction: metric.direction,
      baseline: metric.baseline,
      target,
      changePercent: level.uplift * 100,
      statement:
        metric.direction === "down"
          ? `Reduce ${metric.name.toLowerCase()} from ${metric.baseline} to ${target} ${metric.unit} by the end of ${cleanPeriod}`
          : `Grow ${metric.name.toLowerCase()} from ${metric.baseline} to ${target} ${metric.unit} by the end of ${cleanPeriod}`,
    });
  }

  const initiativeStart = stableIndex(`${cleanFocus}|init`, template.initiatives.length);
  const initiatives = Array.from({ length: Math.min(3, template.initiatives.length) }, (_, i) =>
    template.initiatives[(initiativeStart + i) % template.initiatives.length],
  );

  return {
    objective,
    owner: String(owner || "").trim() || "Unassigned",
    period: cleanPeriod,
    domainLabel: template.label,
    ambition: level,
    keyResults,
    initiatives,
    checks: checkObjective(objective, keyResults, cleanPeriod),
  };
}

/** Rounds a metric sensibly for its unit: whole numbers for counts, one decimal for rates. */
export function formatMetric(value, unit) {
  if (!isNum(value)) return "0";
  if (unit === "%" || unit === "deploys/week" || unit === "contacts") {
    return String(Math.round(value * 10) / 10);
  }
  return String(Math.round(value));
}

/**
 * Quality checks straight out of the OKR literature: the objective should be
 * qualitative and time-bound, and every key result should carry a number.
 */
export function checkObjective(objective, keyResults, period = "") {
  const text = String(objective || "");
  // The period label legitimately contains digits ("Q3 FY27"), so take it out before
  // testing whether the objective itself has been written as a number.
  const withoutPeriod = period ? text.split(String(period)).join("") : text;
  const results = Array.isArray(keyResults) ? keyResults : [];
  return [
    {
      key: "qualitative-objective",
      label: "Objective is qualitative, not a metric",
      pass: !/\d/.test(withoutPeriod),
      why: "Numbers belong in the key results. An objective that is itself a number has nothing to measure against.",
    },
    {
      key: "time-bound",
      label: "Objective names a period",
      pass: text.length > 0 && /\b(Q[1-4]|FY|month|quarter|year|20\d\d)\b/i.test(text),
      why: "Without an end date there is no moment at which the objective is scored.",
    },
    {
      key: "kr-count",
      label: `Between ${MIN_KEY_RESULTS} and ${MAX_KEY_RESULTS} key results`,
      pass: results.length >= MIN_KEY_RESULTS && results.length <= MAX_KEY_RESULTS,
      why: "Fewer than three is thin cover; more than five stops being focus.",
    },
    {
      key: "kr-numeric",
      label: "Every key result has a start and a target number",
      pass: results.length > 0 && results.every((kr) => isNum(kr.baseline) && isNum(kr.target)),
      why: "A key result without a number is a task, not a result.",
    },
  ];
}

/**
 * Grades progress on one key result on the standard 0.0-1.0 OKR scale.
 * score = (current - baseline) / (target - baseline), clamped to [0, 1].
 * Works unchanged for "down" metrics because both differences flip sign.
 */
export function scoreKeyResult({ baseline, target, current } = {}) {
  if (!isNum(baseline) || !isNum(target) || !isNum(current)) {
    return { error: "Enter a start value, a target and where the number stands today." };
  }
  const span = target - baseline;
  if (span === 0) {
    return { error: "The target is the same as the starting value, so there is nothing to measure." };
  }
  return { score: clamp((current - baseline) / span, 0, 1) };
}

/**
 * Grades a whole objective as the unweighted mean of its key result scores,
 * then bands it against the 0.7 / 0.4 review thresholds.
 */
export function gradeOKR(keyResults) {
  if (!Array.isArray(keyResults) || keyResults.length === 0) {
    return { error: "Add at least one key result before grading." };
  }
  const scores = [];
  for (const kr of keyResults) {
    const scored = scoreKeyResult(kr);
    if (scored.error) return { error: scored.error };
    scores.push(scored.score);
  }
  const total = scores.reduce((sum, value) => sum + value, 0);
  // OKR scores are quoted to two decimals; rounding first stops binary floating point
  // turning a clean 0.70 into 0.6999999999999998 and dropping it into the wrong band.
  const score = Math.round((total / scores.length) * 100) / 100;
  const band = GRADE_BANDS.find((entry) => score >= entry.min) || GRADE_BANDS[GRADE_BANDS.length - 1];
  return { score, scores, band };
}

/** Renders a finished OKR as plain text for pasting into a doc or ticket. */
export function okrToText(result) {
  if (!result || result.error) return "";
  const lines = [
    `Objective (${result.period}): ${result.objective}`,
    `Owner: ${result.owner} · ${result.domainLabel} · ${result.ambition.label} ambition`,
    "",
    "Key results:",
  ];
  result.keyResults.forEach((kr, index) => {
    lines.push(`KR${index + 1}. ${kr.statement}`);
  });
  lines.push("", "Initiatives:");
  result.initiatives.forEach((initiative) => lines.push(`- ${initiative}`));
  return lines.join("\n");
}
