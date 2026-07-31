/**
 * Kubernetes label selector semantics, implemented to match
 * k8s.io/apimachinery/pkg/labels and the documented behaviour at
 * kubernetes.io/docs/concepts/overview/working-with-objects/labels/:
 *
 *  - matchLabels is exact key=value equality; multiple entries AND together.
 *  - matchExpressions operators:
 *      In           — key EXISTS and its value is in `values` (values required)
 *      NotIn        — value not in `values`, AND ALSO matches objects that do
 *                     not have the key at all (documented: "the notin operator
 *                     ... selects resources which do not have that label key")
 *      Exists       — key present (values must be empty)
 *      DoesNotExist — key absent (values must be empty)
 *  - matchLabels and matchExpressions are ANDed; an EMPTY selector
 *    ({}) matches every object.
 *
 * Label name/value validation per apimachinery validation.go:
 *  - name segment: max 63 chars, alphanumeric with '-', '_', '.' inside,
 *    optional DNS-subdomain prefix "prefix/" (max 253 chars).
 *  - value: max 63 chars, may be empty, same character rules.
 */

export const OPERATORS = ["In", "NotIn", "Exists", "DoesNotExist"];

/** Label name segment / value pattern from apimachinery validation. */
export const LABEL_PART_REGEX = /^[A-Za-z0-9]([-A-Za-z0-9_.]*[A-Za-z0-9])?$/;
export const LABEL_PART_MAX = 63;
export const PREFIX_MAX = 253;

/** DNS-1123 subdomain pattern (lowercase labels joined by '.') used for the optional key prefix. */
export const DNS_SUBDOMAIN_REGEX = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

/** Validate a label key (optionally "prefix/name"). Returns null when OK. */
export function validateLabelKey(key) {
  if (typeof key !== "string" || key === "") return "Label key is empty.";
  const parts = key.split("/");
  if (parts.length > 2) return `Key "${key}" has more than one "/".`;
  if (parts.length === 2) {
    const [prefix, name] = parts;
    if (prefix === "" || prefix.length > PREFIX_MAX || !DNS_SUBDOMAIN_REGEX.test(prefix)) {
      return `Key prefix in "${key}" must be a DNS subdomain of at most ${PREFIX_MAX} chars.`;
    }
    if (name === "") return `Key "${key}" has an empty name after the "/".`;
    if (name.length > LABEL_PART_MAX || !LABEL_PART_REGEX.test(name)) {
      return `Key name "${name}" is invalid (alphanumeric with '-', '_', '.', max ${LABEL_PART_MAX} chars).`;
    }
    return null;
  }
  if (key.length > LABEL_PART_MAX || !LABEL_PART_REGEX.test(key)) {
    return `Key "${key}" is invalid (alphanumeric with '-', '_', '.', max ${LABEL_PART_MAX} chars).`;
  }
  return null;
}

/** Validate a label value. Returns null when OK. Empty values are legal. */
export function validateLabelValue(value) {
  if (typeof value !== "string") return "Label value must be a string.";
  if (value === "") return null;
  if (value.length > LABEL_PART_MAX || !LABEL_PART_REGEX.test(value)) {
    return `Value "${value}" is invalid (alphanumeric with '-', '_', '.', max ${LABEL_PART_MAX} chars).`;
  }
  return null;
}

/**
 * Parse "key=value" lines into a labels object.
 * @returns {{labels: object}|{error}}
 */
export function parseLabelLines(text) {
  const labels = {};
  if (typeof text !== "string" || text.trim() === "") return { labels };
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) return { error: `Line "${line}" is not key=value.` };
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    const keyProblem = validateLabelKey(key);
    if (keyProblem) return { error: keyProblem };
    const valueProblem = validateLabelValue(value);
    if (valueProblem) return { error: valueProblem };
    labels[key] = value;
  }
  return { labels };
}

/**
 * Evaluate one matchExpression clause against a label set.
 * Mirrors Requirement.Matches in apimachinery.
 *
 * @returns {{satisfied: boolean, reason: string}|{error}}
 */
export function evaluateExpression({ key, operator, values }, labels) {
  const keyProblem = validateLabelKey(key);
  if (keyProblem) return { error: keyProblem };
  if (!OPERATORS.includes(operator)) return { error: `Unknown operator "${operator}".` };

  const list = Array.isArray(values) ? values : [];
  const hasKey = Object.prototype.hasOwnProperty.call(labels, key);
  const actual = hasKey ? labels[key] : undefined;

  if ((operator === "In" || operator === "NotIn") && list.length === 0) {
    return { error: `${operator} requires at least one value (API validation rejects an empty values list).` };
  }
  if ((operator === "Exists" || operator === "DoesNotExist") && list.length > 0) {
    return { error: `${operator} must have an EMPTY values list (API validation).` };
  }
  for (const v of list) {
    const valueProblem = validateLabelValue(v);
    if (valueProblem) return { error: valueProblem };
  }

  switch (operator) {
    case "In": {
      const satisfied = hasKey && list.includes(actual);
      return {
        satisfied,
        reason: hasKey
          ? satisfied
            ? `${key}=${actual} is in {${list.join(", ")}}`
            : `${key}=${actual} is not in {${list.join(", ")}}`
          : `key "${key}" is absent — In never matches a missing key`,
      };
    }
    case "NotIn": {
      // Per the docs, NotIn ALSO selects objects without the key.
      const satisfied = !hasKey || !list.includes(actual);
      return {
        satisfied,
        reason: hasKey
          ? satisfied
            ? `${key}=${actual} is not in {${list.join(", ")}}`
            : `${key}=${actual} IS in {${list.join(", ")}}`
          : `key "${key}" is absent — NotIn matches missing keys too`,
      };
    }
    case "Exists":
      return {
        satisfied: hasKey,
        reason: hasKey ? `key "${key}" is present (=${actual})` : `key "${key}" is absent`,
      };
    case "DoesNotExist":
      return {
        satisfied: !hasKey,
        reason: hasKey ? `key "${key}" is present (=${actual})` : `key "${key}" is absent`,
      };
    default:
      return { error: `Unknown operator "${operator}".` };
  }
}

/**
 * Evaluate a full LabelSelector { matchLabels, matchExpressions } against pod labels.
 *
 * @param {object} input
 * @param {string} input.podLabelsText     key=value lines.
 * @param {string} input.matchLabelsText   key=value lines.
 * @param {Array}  input.expressions       [{key, operator, valuesText}]
 * @returns {{matched, clauses, empty}|{error}}
 */
export function evaluateSelector({ podLabelsText, matchLabelsText, expressions }) {
  const pod = parseLabelLines(podLabelsText);
  if (pod.error) return { error: `Pod labels: ${pod.error}` };
  const ml = parseLabelLines(matchLabelsText);
  if (ml.error) return { error: `matchLabels: ${ml.error}` };

  const clauses = [];

  for (const [key, value] of Object.entries(ml.labels)) {
    const hasKey = Object.prototype.hasOwnProperty.call(pod.labels, key);
    const satisfied = hasKey && pod.labels[key] === value;
    clauses.push({
      kind: "matchLabels",
      text: `${key} = ${value}`,
      satisfied,
      reason: hasKey
        ? satisfied
          ? "exact match"
          : `pod has ${key}=${pod.labels[key]}`
        : `pod has no "${key}" label`,
    });
  }

  const exprList = Array.isArray(expressions) ? expressions : [];
  for (const expr of exprList) {
    const key = String(expr.key ?? "").trim();
    if (key === "" && (expr.valuesText ?? "").trim() === "") continue; // blank row in the UI
    const values = String(expr.valuesText ?? "")
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== "");
    const outcome = evaluateExpression({ key, operator: expr.operator, values }, pod.labels);
    if (outcome.error) return { error: outcome.error };
    clauses.push({
      kind: "matchExpressions",
      text: `${key} ${expr.operator}${values.length > 0 ? ` (${values.join(", ")})` : ""}`,
      satisfied: outcome.satisfied,
      reason: outcome.reason,
    });
  }

  // An empty selector matches everything (documented behaviour).
  const matched = clauses.every((c) => c.satisfied);
  return { matched, clauses, empty: clauses.length === 0, podLabelCount: Object.keys(pod.labels).length };
}
