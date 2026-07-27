/**
 * PubSub vs Queue Decision Helper — pure logic. No React, no DOM.
 *
 * This is a transparent weighted rubric, not a black box. Every question below
 * carries an explicit score per pattern, and the fit percentage is the pattern's
 * score expressed against the best and worst score it could possibly reach on
 * this questionnaire:
 *
 *   fit% = (score - minPossible) / (maxPossible - minPossible) * 100
 *
 * Some answers are hard constraints rather than preferences — for example, a
 * plain work queue cannot replay messages that have already been acknowledged,
 * so choosing "replay from the beginning" disqualifies it outright instead of
 * merely lowering its score.
 */

export const PATTERNS = [
  {
    id: "queue",
    name: "Work queue (competing consumers)",
    shape: "One message, one worker. The broker hands each message to exactly one consumer and takes it back if the worker fails.",
    examples: "Amazon SQS, RabbitMQ classic queue, Google Cloud Tasks, Sidekiq/Celery on Redis",
  },
  {
    id: "pubsub",
    name: "Pub/sub topic (fan-out)",
    shape: "One message, every subscriber. Subscriptions are cheap and usually only see messages published after they were created.",
    examples: "Amazon SNS, Google Cloud Pub/Sub, MQTT brokers, Redis pub/sub",
  },
  {
    id: "log",
    name: "Partitioned log / stream",
    shape: "An append-only log with per-key ordering and offsets, so consumers can rewind and replay history.",
    examples: "Apache Kafka, Amazon Kinesis, Apache Pulsar, Redpanda",
  },
  {
    id: "bus",
    name: "Event bus with routing rules",
    shape: "Producers publish once; the bus matches content-based rules and delivers to whichever targets subscribed to that shape of event.",
    examples: "Amazon EventBridge, Azure Event Grid, NATS with subjects, Google Eventarc",
  },
];

const P = (queue, pubsub, log, bus) => ({ queue, pubsub, log, bus });

export const QUESTIONS = [
  {
    id: "consumers",
    label: "How many independent consumers need each message?",
    help: "Independent means separate business purposes, not extra replicas of the same worker.",
    options: [
      { id: "one", label: "Exactly one purpose", scores: P(3, -2, 0, -1) },
      { id: "few", label: "Two to five known consumers", scores: P(-2, 2, 2, 2) },
      { id: "many", label: "Many, and new ones get added without changing the producer", scores: P(-3, 3, 2, 4) },
    ],
  },
  {
    id: "replay",
    label: "Do consumers need to re-read messages they have already processed?",
    help: "Rebuilding a cache, backfilling a new service, or reprocessing after a bug.",
    options: [
      { id: "never", label: "No — once handled, it is gone", scores: P(2, 1, 0, 1) },
      { id: "recent", label: "Sometimes, within the last few days", scores: P(-3, -3, 3, -2) },
      {
        id: "full",
        label: "Yes, from the beginning — the log is the source of truth",
        scores: P(0, 0, 4, 0),
        disqualify: {
          queue: "A queue deletes a message once it is acknowledged; there is nothing left to replay.",
          pubsub: "A pub/sub subscription only receives messages published after it existed.",
          bus: "An event bus routes in flight and keeps no history of its own.",
        },
      },
    ],
  },
  {
    id: "ordering",
    label: "What ordering guarantee do you need?",
    help: "Ordering always costs throughput — ask for the least you can live with.",
    options: [
      { id: "none", label: "None — messages are independent", scores: P(2, 1, 0, 1) },
      { id: "perKey", label: "Per entity or key (all events for one order in order)", scores: P(1, -2, 3, -2) },
      { id: "global", label: "Strict global order across every message", scores: P(1, -3, 1, -3) },
    ],
  },
  {
    id: "retention",
    label: "How long must a message stay available?",
    options: [
      { id: "short", label: "Minutes to hours", scores: P(2, 2, 0, 2) },
      { id: "days", label: "A few days", scores: P(1, 0, 2, 0) },
      {
        id: "long",
        label: "Weeks or longer — it is a record, not a hand-off",
        scores: P(0, 0, 4, 0),
        disqualify: {
          pubsub: "Pub/sub subscriptions expire undelivered messages after a short retention window (7 days on Google Cloud Pub/Sub).",
          bus: "Event buses do not store events; anything not delivered is gone.",
        },
      },
    ],
  },
  {
    id: "throughput",
    label: "Sustained message rate at peak?",
    options: [
      { id: "low", label: "Under 100 per second", scores: P(2, 2, 0, 2) },
      { id: "medium", label: "100 to 10,000 per second", scores: P(1, 1, 2, 1) },
      { id: "high", label: "Above 10,000 per second", scores: P(-1, 0, 4, -1) },
    ],
  },
  {
    id: "processing",
    label: "How should the message be processed?",
    options: [
      { id: "once", label: "Exactly one worker does the job — this is task distribution", scores: P(4, -3, 1, -2) },
      { id: "broadcast", label: "Every interested service reacts in its own way", scores: P(-4, 3, 3, 3) },
    ],
  },
  {
    id: "routing",
    label: "Do consumers need different subsets of the traffic?",
    options: [
      { id: "all", label: "Everyone wants everything on the topic", scores: P(1, 1, 2, 0) },
      { id: "filter", label: "Each consumer filters on attributes or content", scores: P(-1, 1, -1, 4) },
    ],
  },
  {
    id: "latency",
    label: "How quickly must a consumer see the message?",
    options: [
      { id: "realtime", label: "Under 100 ms", scores: P(1, 2, 2, -2) },
      { id: "second", label: "Around a second", scores: P(2, 2, 2, 1) },
      { id: "relaxed", label: "Seconds to minutes is fine", scores: P(2, 1, 1, 2) },
    ],
  },
  {
    id: "perMessage",
    label: "Do you need per-message controls — delayed delivery, visibility timeout, individual retry, per-message DLQ?",
    options: [
      { id: "yes", label: "Yes, messages fail and retry independently", scores: P(4, 1, -2, 1) },
      { id: "no", label: "No, consumers advance through the stream together", scores: P(0, 0, 2, 0) },
    ],
  },
];

/** Every pattern id, for iteration. */
const PATTERN_IDS = PATTERNS.map((pattern) => pattern.id);

/** Best and worst total each pattern could score on this questionnaire. */
export function scoreBounds() {
  const bounds = {};
  for (const id of PATTERN_IDS) {
    let max = 0;
    let min = 0;
    for (const question of QUESTIONS) {
      const values = question.options.map((option) => option.scores[id]);
      max += Math.max(...values);
      min += Math.min(...values);
    }
    bounds[id] = { max, min };
  }
  return bounds;
}

/**
 * Score the answers.
 *
 * @param {Record<string,string>} answers map of question id -> option id
 * @returns {object} ranked patterns, or { error } if an answer is missing/unknown.
 */
export function decidePattern(answers = {}) {
  if (!answers || typeof answers !== "object") return { error: "No answers supplied." };

  const chosen = [];
  for (const question of QUESTIONS) {
    const optionId = answers[question.id];
    if (!optionId) return { error: `Answer "${question.label}" to see a recommendation.` };
    const option = question.options.find((item) => item.id === optionId);
    if (!option) return { error: `"${optionId}" is not one of the answers offered for "${question.label}".` };
    chosen.push({ question, option });
  }

  const totals = Object.fromEntries(PATTERN_IDS.map((id) => [id, 0]));
  const support = Object.fromEntries(PATTERN_IDS.map((id) => [id, []]));
  const against = Object.fromEntries(PATTERN_IDS.map((id) => [id, []]));
  const ruledOut = Object.fromEntries(PATTERN_IDS.map((id) => [id, null]));

  for (const { question, option } of chosen) {
    for (const id of PATTERN_IDS) {
      const value = option.scores[id];
      totals[id] += value;
      if (value >= 2) support[id].push(`${option.label} (${question.label.replace(/\?$/, "")})`);
      if (value <= -2) against[id].push(`${option.label} (${question.label.replace(/\?$/, "")})`);
    }
    if (option.disqualify) {
      for (const [id, reason] of Object.entries(option.disqualify)) {
        if (!ruledOut[id]) ruledOut[id] = reason;
      }
    }
  }

  const bounds = scoreBounds();
  const ranked = PATTERNS.map((pattern) => {
    const { max, min } = bounds[pattern.id];
    const span = max - min;
    const fit = span > 0 ? ((totals[pattern.id] - min) / span) * 100 : 50;
    return {
      ...pattern,
      score: totals[pattern.id],
      fit: Math.max(0, Math.min(100, fit)),
      support: support[pattern.id].slice(0, 3),
      against: against[pattern.id].slice(0, 2),
      ruledOut: ruledOut[pattern.id],
    };
  }).sort((a, b) => {
    if (Boolean(a.ruledOut) !== Boolean(b.ruledOut)) return a.ruledOut ? 1 : -1;
    return b.fit - a.fit;
  });

  const eligible = ranked.filter((pattern) => !pattern.ruledOut);
  if (eligible.length === 0) {
    return {
      error: "Every pattern is ruled out by your answers — you are describing a database, not a message broker.",
    };
  }

  const winner = eligible[0];
  const runnerUp = eligible[1] || null;
  const margin = runnerUp ? winner.fit - runnerUp.fit : winner.fit;

  let confidence = "clear";
  if (margin < 5) confidence = "too close to call";
  else if (margin < 15) confidence = "leaning";

  return {
    ranked,
    winner,
    runnerUp,
    margin,
    confidence,
    combineHint:
      winner.id === "log" && runnerUp && runnerUp.id === "queue"
        ? "A common hybrid: keep the log as the system of record and feed a per-consumer work queue from it for retry semantics."
        : winner.id === "bus" && runnerUp && runnerUp.id === "queue"
          ? "A common hybrid: route with the bus, then land each target's events in its own queue so retries and DLQs stay per consumer."
          : null,
  };
}

/** Default answers so the tool shows a real recommendation at first paint. */
export const DEFAULT_ANSWERS = {
  consumers: "few",
  replay: "recent",
  ordering: "perKey",
  retention: "days",
  throughput: "medium",
  processing: "broadcast",
  routing: "all",
  latency: "second",
  perMessage: "no",
};
