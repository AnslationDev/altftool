/**
 * Agent observability planner.
 *
 * Signal names and span/metric attribute names follow the OpenTelemetry
 * "Semantic conventions for generative AI systems" (the gen_ai.* namespace),
 * which is the only vendor-neutral schema for LLM and agent telemetry.
 * Everything in this module is pure: same input -> same output, no clock, no DOM.
 */

/** Weight used when scoring readiness. Required gaps hurt three times as much as optional ones. */
export const TIER_WEIGHT = { required: 3, recommended: 2, optional: 1 };

export const TIER_LABEL = {
  required: "Required",
  recommended: "Recommended",
  optional: "Nice to have",
};

/** Traits of the agent being shipped. Each one escalates a subset of signals. */
export const AGENT_TRAITS = [
  { id: "pii", label: "Handles personal data", hint: "Names, emails, files or free-text from real users" },
  { id: "tools", label: "Calls tools or external APIs", hint: "Function calling, MCP servers, HTTP actions" },
  { id: "rag", label: "Retrieves from a knowledge base", hint: "Vector search, SQL lookup, document grounding" },
  { id: "autonomous", label: "Takes write actions without review", hint: "Sends mail, moves money, edits records" },
  { id: "multiTurn", label: "Long multi-turn sessions", hint: "Conversation state carried across many steps" },
  { id: "regulated", label: "Regulated domain", hint: "Health, finance, legal, children, employment" },
  { id: "highVolume", label: "High traffic", hint: "Roughly 100,000+ agent runs per day" },
];

export const PILLARS = [
  { id: "trace", label: "Traces", blurb: "One span tree per agent run so a bad answer can be replayed end to end." },
  { id: "metric", label: "Metrics", blurb: "Numbers you can alert on: latency, tokens, errors, cost, loop length." },
  { id: "log", label: "Logs & versions", blurb: "What exactly ran — prompt version, model id, tool schema, user feedback." },
  { id: "eval", label: "Evaluation", blurb: "Quality signal, because a 200 OK tells you nothing about correctness." },
  { id: "safety", label: "Privacy & safety", blurb: "Redaction, guardrail events, access control and retention." },
];

/**
 * The catalogue.
 * base        - tier when none of the escalating traits apply
 * escalate    - traits that push the item up to "required"
 * requires    - item is irrelevant (hidden) unless one of these traits is on
 * attribute   - OpenTelemetry gen_ai.* attribute or instrument name, where one exists
 */
export const SIGNALS = [
  {
    id: "root-span",
    pillar: "trace",
    label: "One root span per agent run",
    detail: "Every run gets a single parent span carrying a stable run id and conversation id, so nested model and tool calls hang off one tree.",
    attribute: "gen_ai.conversation.id",
    base: "required",
    escalate: [],
  },
  {
    id: "llm-span",
    pillar: "trace",
    label: "A child span for every model call",
    detail: "Record the operation name, requested model and the model that actually answered — they differ when a provider silently routes or falls back.",
    attribute: "gen_ai.operation.name, gen_ai.request.model, gen_ai.response.model",
    base: "required",
    escalate: [],
  },
  {
    id: "tool-span",
    pillar: "trace",
    label: "A child span for every tool call",
    detail: "Name, call id, argument size, latency and outcome. Most agent failures are tool failures wearing a model costume.",
    attribute: "gen_ai.tool.name, gen_ai.tool.call.id",
    base: "recommended",
    // Visible whenever either trait that escalates it is on -- an autonomous
    // (write-action) agent almost always calls a tool/API to take that
    // action, so it should surface this signal too, not only when "tools"
    // is explicitly ticked. Keep `requires` and `escalate` in sync: an id
    // listed in `escalate` but missing from `requires` can never actually
    // fire, since the item stays hidden before that trait would matter.
    escalate: ["tools", "autonomous"],
    requires: ["tools", "autonomous"],
  },
  {
    id: "retrieval-span",
    pillar: "trace",
    label: "Retrieval span with document ids",
    detail: "Log the query id, top-k, scores and the ids of retrieved chunks — not the chunk text. Ids are enough to reproduce and are far cheaper to store.",
    base: "recommended",
    escalate: ["rag"],
    requires: ["rag"],
  },
  {
    id: "context-propagation",
    pillar: "trace",
    label: "Trace context propagated across hops",
    detail: "Pass the W3C traceparent header through gateways, queues and sub-agents, otherwise one run shows up as several unrelated traces.",
    base: "required",
    escalate: [],
  },
  {
    id: "span-status",
    pillar: "trace",
    label: "Span status and exception events on failure",
    detail: "Set the span status to error and attach the exception event. A span that ends OK on a thrown error makes every dashboard lie.",
    base: "required",
    escalate: [],
  },
  {
    id: "token-usage",
    pillar: "metric",
    label: "Token usage split by input and output",
    detail: "A histogram keyed by model and by token type. Output tokens usually dominate cost and latency, so a single total hides the problem.",
    attribute: "gen_ai.client.token.usage",
    base: "required",
    escalate: [],
  },
  {
    id: "latency",
    pillar: "metric",
    label: "Operation duration as a histogram",
    detail: "Keep percentiles, not averages. Report p50, p95 and p99 per model and per tool; an average latency hides the tail users complain about.",
    attribute: "gen_ai.client.operation.duration",
    base: "required",
    escalate: [],
  },
  {
    id: "error-rate",
    pillar: "metric",
    label: "Error rate per model and per tool",
    detail: "Separate provider errors, rate limits, timeouts, schema-validation failures and tool 4xx/5xx. They need different fixes and different alerts.",
    base: "required",
    escalate: [],
  },
  {
    id: "step-count",
    pillar: "metric",
    label: "Steps per run with a hard ceiling",
    detail: "Count model turns and tool calls per run and alert on the tail. A runaway loop is the most expensive failure mode an agent has.",
    base: "recommended",
    escalate: ["autonomous", "multiTurn", "tools"],
  },
  {
    id: "cost",
    pillar: "metric",
    label: "Cost attributed per run, tenant and feature",
    detail: "Derive cost from the token histogram and a versioned price table, then group by customer and by feature so a spike has an owner.",
    base: "recommended",
    escalate: ["highVolume"],
  },
  {
    id: "cache-hit",
    pillar: "metric",
    label: "Prompt cache hit ratio",
    detail: "Cached input tokens are billed differently from fresh ones. Track the ratio or a prompt-prefix change will quietly multiply your bill.",
    base: "optional",
    escalate: ["highVolume"],
  },
  {
    id: "content-capture-flag",
    pillar: "log",
    label: "Prompt and completion capture behind an explicit flag",
    detail: "OpenTelemetry treats message content as opt-in for exactly this reason. Default it off in production and turn it on per environment or per sampled run.",
    base: "required",
    escalate: ["pii", "regulated"],
  },
  {
    id: "version-stamp",
    pillar: "log",
    label: "Prompt, model and tool-schema versions on every run",
    detail: "Stamp the prompt template id and version, the model id and a hash of the tool schema. Without it you cannot say which change caused a regression.",
    base: "required",
    escalate: [],
  },
  {
    id: "feedback",
    pillar: "log",
    label: "User feedback joined to the run id",
    detail: "Thumbs, edits, retries and abandonment are your cheapest quality labels — but only if they carry the same run id as the trace.",
    base: "recommended",
    escalate: [],
  },
  {
    id: "structured-logs",
    pillar: "log",
    label: "Structured JSON logs carrying the trace id",
    detail: "Every log line includes trace_id and span_id so you can pivot from an alert to the exact run instead of grepping free text.",
    base: "required",
    escalate: [],
  },
  {
    id: "online-eval",
    pillar: "eval",
    label: "Automated grading on sampled live traffic",
    detail: "Score a sample of real runs continuously for groundedness, task success and format validity. Offline-only evaluation misses production drift.",
    base: "recommended",
    escalate: ["regulated", "autonomous"],
  },
  {
    id: "regression-suite",
    pillar: "eval",
    label: "Golden set replayed before every prompt or model change",
    detail: "A fixed set of inputs with expected behaviour, run in CI. Treat a prompt edit exactly like a code deploy.",
    base: "required",
    escalate: [],
  },
  {
    id: "drift-monitor",
    pillar: "eval",
    label: "Drift monitors on output shape and refusal rate",
    detail: "Track mean output length, refusal rate, schema-validity rate and eval score over time. These move first when a provider updates a model.",
    base: "recommended",
    escalate: ["regulated", "highVolume"],
  },
  {
    id: "pii-redaction",
    pillar: "safety",
    label: "Redaction before telemetry leaves the process",
    detail: "Scrub in the exporter or a span processor, not in the dashboard. Once raw text reaches a vendor you no longer control the copy.",
    base: "recommended",
    escalate: ["pii", "regulated"],
  },
  {
    id: "guardrail-events",
    pillar: "safety",
    label: "Every block, filter or refusal logged with a reason code",
    detail: "Guardrails you cannot count are guardrails you cannot tune. Record which rule fired, on which side, and what the run did next.",
    base: "recommended",
    escalate: ["regulated", "autonomous"],
  },
  {
    id: "access-control",
    pillar: "safety",
    label: "Role-based access and an audit log on the trace UI",
    detail: "The observability tool holds the most sensitive copy of your user data. It needs the same access review as the production database.",
    base: "recommended",
    escalate: ["pii", "regulated"],
  },
  {
    id: "retention",
    pillar: "safety",
    label: "A written retention window per signal class",
    detail: "Metrics can live for years; raw prompts should not. Set a TTL per class and make deletion automatic rather than a ticket.",
    base: "recommended",
    escalate: ["pii", "regulated"],
  },
  {
    id: "kill-switch",
    pillar: "safety",
    label: "Feature-flag and kill-switch state recorded on the run",
    detail: "Record which flags were on and who last changed them, so an incident timeline does not depend on somebody's memory.",
    base: "optional",
    escalate: ["autonomous"],
  },
];

/**
 * Redaction strategies for common data classes.
 * retentionDays are conservative defaults, not legal advice — confirm them with
 * whoever owns privacy at your company.
 * "never" means the value should not reach telemetry in any form.
 */
export const DATA_CLASSES = [
  { id: "name", label: "Person's name", strategy: "Mask to initials", retentionDays: 30, note: "Keep only what a support agent needs to recognise the case." },
  { id: "email", label: "Email address", strategy: "Keyed hash (rotating salt)", retentionDays: 90, note: "A hash still joins sessions together without storing the address." },
  { id: "phone", label: "Phone number", strategy: "Keep last 2 digits, mask the rest", retentionDays: 30, note: "Enough to confirm identity in a support call, not enough to dial." },
  { id: "address", label: "Postal address", strategy: "Drop; keep country only", retentionDays: 30, note: "Country is usually all that routing and analytics need." },
  { id: "ip", label: "IP address", strategy: "Truncate the last octet", retentionDays: 30, note: "Widely used de-identification step that keeps coarse geography." },
  { id: "geo", label: "Latitude / longitude", strategy: "Round to 2 decimal places", retentionDays: 30, note: "0.01 degree of latitude is about 1.1 km, which blurs a home address." },
  { id: "card", label: "Payment card number", strategy: "Never log", retentionDays: 0, never: true, note: "Card rules require the full number to be unreadable wherever it is stored — keep it out of telemetry entirely." },
  { id: "govid", label: "Government ID number", strategy: "Never log", retentionDays: 0, never: true, note: "Aadhaar, SSN, passport and tax ids belong in a vault, never in a span attribute." },
  { id: "health", label: "Health information", strategy: "Never log raw; store a case reference", retentionDays: 0, never: true, note: "Log the fact a health topic was discussed, not what was said." },
  { id: "secret", label: "API key, token or password", strategy: "Never log; rotate on exposure", retentionDays: 0, never: true, note: "Tool arguments are the usual leak path — filter arguments by key name." },
  { id: "freetext", label: "Raw user message", strategy: "Capture only behind the content flag", retentionDays: 14, note: "Sample it rather than storing every message; short TTL." },
  { id: "file", label: "Uploaded file contents", strategy: "Store a pointer and a checksum", retentionDays: 7, note: "Keep the file in its own bucket with its own access policy." },
];

/** Minimum head sampling rate worth keeping — below this you cannot debug a rare bug. */
export const MIN_HEAD_SAMPLE_RATE = 0.001;
/** Average serialised size of one agent trace (about 6-10 spans with attributes). Measure yours and change it. */
export const AVG_TRACE_KB = 8;

const KB_PER_GB = 1024 * 1024;

const round = (value, dp = 2) => {
  const f = Math.pow(10, dp);
  return Math.round(value * f) / f;
};

const toFiniteNumber = (value) => {
  const n = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
};

/** Tier for one signal given the selected traits. */
export function tierFor(signal, traits) {
  const set = new Set(traits || []);
  const escalated = (signal.escalate || []).some((t) => set.has(t));
  return escalated ? "required" : signal.base;
}

/** Is this signal relevant at all for the selected traits? */
export function isRelevant(signal, traits) {
  if (!signal.requires || signal.requires.length === 0) return true;
  const set = new Set(traits || []);
  return signal.requires.some((t) => set.has(t));
}

export const READINESS_BANDS = [
  { min: 90, label: "Production ready", tone: "success" },
  { min: 70, label: "Nearly there", tone: "success" },
  { min: 45, label: "Meaningful gaps", tone: "warning" },
  { min: 0, label: "Effectively blind", tone: "danger" },
];

export function bandFor(score) {
  return READINESS_BANDS.find((b) => score >= b.min) || READINESS_BANDS[READINESS_BANDS.length - 1];
}

/**
 * Build the tailored checklist and the readiness score.
 * score = 100 * (weight of items already in place) / (weight of all relevant items)
 */
export function buildChecklist({ traits = [], done = [] } = {}) {
  const doneSet = new Set(done);
  const items = SIGNALS.filter((s) => isRelevant(s, traits)).map((s) => ({
    id: s.id,
    pillar: s.pillar,
    label: s.label,
    detail: s.detail,
    attribute: s.attribute || "",
    tier: tierFor(s, traits),
    escalated: tierFor(s, traits) !== s.base,
    done: doneSet.has(s.id),
  }));

  // Defensive guard, not currently reachable: most SIGNALS entries have no
  // `requires` gate, so at least one is always relevant regardless of which
  // traits (including none) are selected. Kept in case a future edit to
  // SIGNALS ever gates every entry behind a trait.
  if (items.length === 0) {
    return { error: "No signals matched that configuration. Turn at least one trait on." };
  }

  let totalWeight = 0;
  let doneWeight = 0;
  const counts = { required: 0, recommended: 0, optional: 0 };
  const doneCounts = { required: 0, recommended: 0, optional: 0 };

  items.forEach((item) => {
    const w = TIER_WEIGHT[item.tier] || 1;
    totalWeight += w;
    counts[item.tier] += 1;
    if (item.done) {
      doneWeight += w;
      doneCounts[item.tier] += 1;
    }
  });

  // Defensive guard, not currently reachable: every relevant item always
  // carries a positive TIER_WEIGHT. Kept for the same reason as the
  // items.length guard above.
  if (totalWeight <= 0) {
    return { error: "Checklist has no weighted items to score." };
  }

  const score = Math.round((doneWeight / totalWeight) * 100);
  const gaps = items
    .filter((item) => !item.done)
    .sort((a, b) => (TIER_WEIGHT[b.tier] || 0) - (TIER_WEIGHT[a.tier] || 0));

  const byPillar = PILLARS.map((p) => {
    const list = items.filter((i) => i.pillar === p.id);
    const pillarTotal = list.reduce((sum, i) => sum + (TIER_WEIGHT[i.tier] || 1), 0);
    const pillarDone = list
      .filter((i) => i.done)
      .reduce((sum, i) => sum + (TIER_WEIGHT[i.tier] || 1), 0);
    return {
      ...p,
      items: list,
      score: pillarTotal > 0 ? Math.round((pillarDone / pillarTotal) * 100) : 0,
    };
  }).filter((p) => p.items.length > 0);

  return {
    items,
    byPillar,
    counts,
    doneCounts,
    total: items.length,
    doneTotal: items.filter((i) => i.done).length,
    requiredGaps: gaps.filter((g) => g.tier === "required"),
    gaps,
    score,
    band: bandFor(score),
  };
}

/** Default share of daily runs expected to match tail rules (errors, slow-p95,
 * guardrail blocks, negative feedback). A matching run that was already kept
 * by head sampling is not counted twice. */
export const DEFAULT_TAIL_KEEP_RATE_PCT = 5;

/**
 * Head + tail sampling plan.
 * Head rate reserves room inside the daily trace budget for the expected tail
 * matches. Tail rules then keep matching runs only from the unsampled pool, so
 * one run is never counted twice and captured volume never exceeds traffic.
 */
export function computeSamplingPlan({
  requestsPerDay,
  targetTracesPerDay,
  retentionDays,
  avgTraceKb = AVG_TRACE_KB,
  tailKeepRatePct = DEFAULT_TAIL_KEEP_RATE_PCT,
} = {}) {
  const runs = toFiniteNumber(requestsPerDay);
  const target = toFiniteNumber(targetTracesPerDay);
  const days = toFiniteNumber(retentionDays);
  const kb = toFiniteNumber(avgTraceKb);
  const tailPct = toFiniteNumber(tailKeepRatePct);

  if ([runs, target, days, kb].some((n) => Number.isNaN(n))) {
    return { error: "Enter valid numbers for traffic, trace budget and retention." };
  }
  if (runs <= 0) return { error: "Agent runs per day must be greater than zero." };
  if (target <= 0) return { error: "Trace budget per day must be greater than zero." };
  if (days <= 0) return { error: "Retention must be at least one day." };
  if (kb <= 0) return { error: "Average trace size must be greater than zero." };
  if (Number.isNaN(tailPct) || tailPct < 0 || tailPct > 100) {
    return { error: "Tail-kept share must be between 0 and 100 percent." };
  }

  const targetRate = Math.min(1, target / runs);
  const tailRate = tailPct / 100;
  // capturedRate = headRate + (1 - headRate) * tailRate. Solve for
  // headRate so the combined expected volume, not just the head sample,
  // targets the user's daily budget.
  const rawHeadRate =
    tailRate >= 1
      ? targetRate >= 1
        ? 1
        : 0
      : (targetRate - tailRate) / (1 - tailRate);
  const headRate = Math.min(1, Math.max(MIN_HEAD_SAMPLE_RATE, rawHeadRate));
  const sampledPerDay = runs * headRate;
  const unsampledPerDay = Math.max(0, runs - sampledPerDay);
  const tailKeptPerDay = unsampledPerDay * tailRate;
  const capturedPerDay = Math.min(runs, sampledPerDay + tailKeptPerDay);
  const storedTraces = capturedPerDay * days;
  const storageGb = (storedTraces * kb) / KB_PER_GB;
  const overBudget = capturedPerDay > target + 0.5;

  return {
    headRate,
    headRatePct: round(headRate * 100, 3),
    capped: target / runs >= 1,
    floored: rawHeadRate < MIN_HEAD_SAMPLE_RATE,
    overBudget,
    sampledPerDay: Math.round(sampledPerDay),
    tailKeptPerDay: Math.round(tailKeptPerDay),
    capturedPerDay: Math.round(capturedPerDay),
    storedTraces: Math.round(storedTraces),
    storageGb: round(storageGb, 2),
    tailRules: [
      "Keep 100% of runs that ended in an error or a tool failure.",
      "Keep 100% of runs slower than your p95 latency target.",
      "Keep 100% of runs with negative user feedback or a guardrail block.",
      "Keep 100% of runs from a canary model or a new prompt version.",
    ],
  };
}

/** Redaction plan for the selected data classes. */
export function buildRedactionPlan(dataClassIds = []) {
  const set = new Set(dataClassIds);
  const rows = DATA_CLASSES.filter((c) => set.has(c.id));
  if (rows.length === 0) {
    return { rows: [], neverLog: [], strictestRetentionDays: null, empty: true };
  }
  const neverLog = rows.filter((r) => r.never);
  const withTtl = rows.filter((r) => !r.never);
  // null (not 0) when every selected class is "never log" -- there is no
  // retention window to report at all, which reads very differently from an
  // actually-computed 0-day TTL.
  const strictestRetentionDays = withTtl.length
    ? Math.min(...withTtl.map((r) => r.retentionDays))
    : null;
  return { rows, neverLog, strictestRetentionDays, empty: false };
}

/** Plain-text summary suitable for pasting into a design doc or a ticket. */
export function buildSummary({ traits = [], checklist, sampling, redaction } = {}) {
  if (!checklist || checklist.error) return "";
  const traitLabels = AGENT_TRAITS.filter((t) => traits.includes(t.id)).map((t) => t.label);
  const lines = [
    "Agent Observability Checklist",
    `Agent profile: ${traitLabels.length ? traitLabels.join(", ") : "baseline agent"}`,
    `Readiness: ${checklist.score}% (${checklist.band.label}) — ${checklist.doneTotal} of ${checklist.total} signals in place`,
    `Required signals still missing: ${checklist.requiredGaps.length}`,
    "",
    "Top gaps:",
    ...checklist.gaps.slice(0, 8).map((g) => `- [${TIER_LABEL[g.tier]}] ${g.label}`),
  ];
  if (sampling && !sampling.error) {
    lines.push(
      "",
      "Sampling plan:",
      `- Head sample ${sampling.headRatePct}% of runs (~${sampling.sampledPerDay.toLocaleString("en-US")}/day)`,
      `- Tail-kept additional volume after head-sample overlap: ~${sampling.tailKeptPerDay.toLocaleString("en-US")}/day (est.)`,
      `- Estimated stored trace volume: ${sampling.storageGb} GB (head + tail combined)`,
      ...sampling.tailRules.map((r) => `- ${r}`)
    );
  }
  if (redaction && !redaction.empty) {
    lines.push(
      "",
      "Redaction plan:",
      ...redaction.rows.map((r) => `- ${r.label}: ${r.strategy}${r.never ? "" : ` (retain ${r.retentionDays}d)`}`)
    );
  }
  return lines.join("\n");
}
