/**
 * Kafka Topic Naming Builder — pure logic. No React, no DOM.
 *
 * Hard rules enforced here come from Apache Kafka itself (org.apache.kafka.common.internals.Topic):
 *  - legal characters are ASCII alphanumerics, '.', '_' and '-'
 *  - a topic name may not be empty, "." or ".."
 *  - maximum length is 249 characters (the log directory is "<topic>-<partition>",
 *    and 255 is the usual filesystem limit)
 *  - names that differ only by '.' versus '_' collide in Kafka's metric namespace,
 *    so the broker refuses to create the second one
 *  - the "__" prefix is used by Kafka's own internal topics (__consumer_offsets,
 *    __transaction_state) and should not be used by applications
 *
 * The layout templates follow Confluent's published topic-naming guidance:
 * <message type>.<domain>.<entity>.<event type>.<version>, read left to right
 * from most stable to least stable.
 */

/** org.apache.kafka.common.internals.Topic.MAX_NAME_LENGTH */
export const MAX_TOPIC_NAME_LENGTH = 249;
/** org.apache.kafka.common.internals.Topic.LEGAL_CHARS = "[a-zA-Z0-9._-]" */
export const LEGAL_TOPIC_PATTERN = /^[a-zA-Z0-9._-]+$/;
/** Prefix reserved for Kafka's own internal topics. */
export const INTERNAL_TOPIC_PREFIX = "__";
/** Names Kafka rejects outright. */
export const RESERVED_NAMES = [".", ".."];

export const SEPARATORS = [
  { id: "dot", char: ".", label: "Dot  (orders.order.created.v1)" },
  { id: "hyphen", char: "-", label: "Hyphen  (orders-order-created-v1)" },
  { id: "underscore", char: "_", label: "Underscore  (orders_order_created_v1)" },
];

export const MESSAGE_TYPES = [
  { id: "evt", label: "evt — event / fact that already happened", retention: "Time-based, often 7 days" },
  { id: "cmd", label: "cmd — command asking for something to happen", retention: "Short, hours to a day" },
  { id: "cdc", label: "cdc — change data capture from a database", retention: "Compacted" },
  { id: "state", label: "state — latest value per key", retention: "Compacted" },
  { id: "queue", label: "queue — work items for a pool of consumers", retention: "Time-based, short" },
  { id: "audit", label: "audit — immutable record for compliance", retention: "Long, months to years" },
];

export const EVENT_TYPES = [
  "created",
  "updated",
  "deleted",
  "cancelled",
  "completed",
  "failed",
  "snapshot",
];

export const TEMPLATES = [
  {
    id: "full",
    label: "env . type . domain . entity . event . version",
    tokens: ["env", "messageType", "domain", "entity", "eventType", "version"],
    note: "Most explicit. Good when one cluster carries several environments or many teams.",
  },
  {
    id: "standard",
    label: "type . domain . entity . event . version",
    tokens: ["messageType", "domain", "entity", "eventType", "version"],
    note: "Confluent's recommended shape for a single-environment cluster.",
  },
  {
    id: "lean",
    label: "domain . entity . event . version",
    tokens: ["domain", "entity", "eventType", "version"],
    note: "Shortest form that still sorts by domain and carries a version.",
  },
];

export const CASE_STYLES = [
  { id: "lower", label: "lowercase" },
  { id: "preserve", label: "keep as typed" },
];

/** Strip anything illegal from one segment and apply the chosen case. */
export function normaliseSegment(raw, caseStyle = "lower", separatorChar = ".") {
  const text = String(raw ?? "").trim();
  if (!text) return "";
  // Spaces and slashes become the separator; anything else illegal is dropped.
  const collapsed = text.replace(/[\s/\\]+/g, separatorChar).replace(/[^a-zA-Z0-9._-]/g, "");
  return caseStyle === "lower" ? collapsed.toLowerCase() : collapsed;
}

/**
 * Kafka's own collision test: '.' and '_' are interchangeable in the metric
 * namespace, so two topics whose names match after that substitution collide.
 */
export function collisionKey(name) {
  return String(name).replace(/\./g, "_");
}

/** Validate a finished topic name against Kafka's broker-side rules. */
export function validateTopicName(name) {
  const issues = [];
  const value = String(name ?? "");

  if (value.length === 0) issues.push("Topic name is empty.");
  if (RESERVED_NAMES.includes(value)) issues.push('Kafka rejects "." and ".." as topic names.');
  if (value.length > MAX_TOPIC_NAME_LENGTH) {
    issues.push(`Name is ${value.length} characters; Kafka's limit is ${MAX_TOPIC_NAME_LENGTH}.`);
  }
  if (value.length > 0 && !LEGAL_TOPIC_PATTERN.test(value)) {
    issues.push("Only letters, digits, dot, underscore and hyphen are legal in a topic name.");
  }
  if (value.startsWith(INTERNAL_TOPIC_PREFIX)) {
    issues.push('The "__" prefix is reserved for Kafka internal topics such as __consumer_offsets.');
  }

  const mixesDotAndUnderscore = value.includes(".") && value.includes("_");
  if (mixesDotAndUnderscore) {
    issues.push(
      "Mixing '.' and '_' invites a metric-namespace collision — Kafka treats them as the same character when checking for duplicate topics.",
    );
  }

  return { valid: issues.length === 0, issues, mixesDotAndUnderscore };
}

/** Normalise a version token to the vN form. */
function normaliseVersion(raw, sep = ".") {
  const text = String(raw ?? "").trim().toLowerCase();
  if (!text) return "";
  const leadingDigits = text.match(/^\d+/);
  if (!leadingDigits) return normaliseSegment(text, "lower", sep);
  return `v${String(Number(leadingDigits[0]))}`;
}

/**
 * Build the topic name and its companion topics.
 *
 * @returns {object} names + validation, or { error } for input that cannot produce a name.
 */
export function buildTopicNames({
  templateId = "standard",
  separatorId = "dot",
  caseStyle = "lower",
  env = "",
  messageType = "evt",
  domain = "",
  entity = "",
  eventType = "created",
  version = "1",
  retryTiersMinutes = [5, 30],
  includeDlq = true,
} = {}) {
  const template = TEMPLATES.find((item) => item.id === templateId);
  if (!template) return { error: "Pick a naming template." };

  const separator = SEPARATORS.find((item) => item.id === separatorId);
  if (!separator) return { error: "Pick a separator." };

  const sep = separator.char;
  const values = {
    env: normaliseSegment(env, caseStyle, sep),
    messageType: normaliseSegment(messageType, caseStyle, sep),
    domain: normaliseSegment(domain, caseStyle, sep),
    entity: normaliseSegment(entity, caseStyle, sep),
    eventType: normaliseSegment(eventType, caseStyle, sep),
    version: normaliseVersion(version, sep),
  };

  if (!values.domain) return { error: "Enter a domain — the bounded context or owning team, such as orders or billing." };
  if (!values.entity) return { error: "Enter an entity — the noun the messages are about, such as order or invoice." };
  if (template.tokens.includes("env") && !values.env) {
    return { error: "This template includes an environment segment — enter one, or choose a template without it." };
  }
  if (template.tokens.includes("eventType") && !values.eventType) {
    return { error: "Enter an event type, such as created or updated." };
  }
  if (template.tokens.includes("version") && !values.version) {
    return { error: "Enter a schema version, such as 1." };
  }

  const segments = template.tokens.map((token) => values[token]).filter(Boolean);
  const topic = segments.join(sep);
  const validation = validateTopicName(topic);

  const tiers = (Array.isArray(retryTiersMinutes) ? retryTiersMinutes : [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  const companions = [];
  for (const minutes of tiers) {
    const suffix = minutes >= 60 && minutes % 60 === 0 ? `${minutes / 60}h` : `${minutes}m`;
    companions.push({
      role: `Retry after ${suffix}`,
      name: [topic, "retry", suffix].join(sep),
      why: "Consumers republish here after a transient failure and re-read once the delay has passed.",
    });
  }
  if (includeDlq) {
    companions.push({
      role: "Dead letter",
      name: [topic, "dlq"].join(sep),
      why: "Terminal failures land here so the main partition keeps moving. Alert on any produce to it.",
    });
  }

  const messageTypeInfo = MESSAGE_TYPES.find((item) => item.id === values.messageType) || null;

  const consumerGroup = [values.domain, values.entity, "consumer"].filter(Boolean).join("-");
  // Derive the ACL prefix from the template's own token order (through "domain") so it always
  // matches a real prefix of the generated topic name — templates that drop a leading segment
  // (e.g. "lean", which has no messageType) must not have that segment hardcoded back in.
  const domainIdx = template.tokens.indexOf("domain");
  const prefixTokens = template.tokens.slice(0, domainIdx + 1);
  const aclPrefix = prefixTokens.map((token) => values[token]).filter(Boolean).join(sep) + sep;

  const allNames = [topic, ...companions.map((item) => item.name)];
  const companionIssues = companions
    .map((item) => ({ name: item.name, ...validateTopicName(item.name) }))
    .filter((item) => !item.valid);

  return {
    topic,
    segments,
    separator,
    template,
    validation,
    companions,
    companionIssues,
    collisionKey: collisionKey(topic),
    length: topic.length,
    remaining: MAX_TOPIC_NAME_LENGTH - topic.length,
    messageTypeInfo,
    consumerGroup,
    aclPrefix,
    allNames,
  };
}
