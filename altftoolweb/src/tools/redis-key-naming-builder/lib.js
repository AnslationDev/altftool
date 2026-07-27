/**
 * Redis key naming convention builder.
 *
 * Grounding rules:
 *  - Redis keys are binary-safe strings up to 512 MB, but the official docs
 *    ("Redis keys" section of the data-types intro) advise against very long
 *    keys and recommend a schema such as "object-type:id" — e.g. user:1000.
 *  - The colon ":" separator is the convention used throughout the Redis
 *    documentation; dots and slashes also work but are less common.
 *  - Redis Cluster computes the hash slot from the substring between the first
 *    "{" and the next "}" (the "hash tag", Redis Cluster specification), so
 *    keys that must live on the same node share a {tagged} segment.
 *  - Keys are case-sensitive: User:1 and user:1 are different keys.
 */

/** Redis allows keys up to 512 MB (Redis docs, "Redis keys"). */
export const MAX_KEY_BYTES = 512 * 1024 * 1024;

/**
 * Practical ceiling. The Redis docs call very long keys "not a good idea"
 * (they cost memory and compare time on every lookup); 128 characters is a
 * widely used team guideline, not a server limit.
 */
export const RECOMMENDED_MAX_KEY_LENGTH = 128;

/** Separators seen in the wild; ":" is the documented Redis convention. */
export const SEPARATORS = [
  { id: ":", label: "Colon  :  (Redis convention)" },
  { id: ".", label: "Dot  ." },
  { id: "/", label: "Slash  /" },
];

const CONTROL_OR_SPACE = /[\s\u0000-\u001f\u007f]/;

/**
 * Validate one key segment. Returns null when fine, or a problem string.
 * Segments may not be empty, contain whitespace/control characters, the chosen
 * separator (it would shift every later segment), or hash-tag braces (reserved
 * for the cluster hash tag).
 */
export function validateSegment(name, value, separator) {
  if (typeof value !== "string" || value.trim() === "") return `${name} is empty.`;
  if (CONTROL_OR_SPACE.test(value)) {
    return `${name} contains whitespace or control characters — allowed by Redis but a constant source of shell-quoting bugs.`;
  }
  if (value.includes(separator)) {
    return `${name} contains the separator "${separator}", which would break the segment structure.`;
  }
  if (value.includes("{") || value.includes("}")) {
    return `${name} contains { or }, which Redis Cluster reserves for hash tags.`;
  }
  return null;
}

/**
 * Build the key template and a worked example.
 *
 * @param {object} input
 * @param {string} input.app             application namespace, e.g. "shop"
 * @param {boolean} input.includeEnv     add an environment segment
 * @param {string} input.env             e.g. "prod"
 * @param {boolean} input.includeTenant  add a tenant segment (multi-tenant apps)
 * @param {string} input.tenant          sample tenant id, e.g. "acme"
 * @param {boolean} input.includeVersion add a schema-version segment
 * @param {string} input.version         e.g. "v2"
 * @param {string} input.entity          object type, e.g. "user"
 * @param {string} input.sampleId        sample object id, e.g. "1000"
 * @param {string} input.attribute       optional trailing attribute, e.g. "followers"
 * @param {boolean} input.clusterHashTag wrap the tenant (or entity+id) in {} for Redis Cluster
 * @param {string} input.separator       one of SEPARATORS ids
 * @returns {{template:string, example:string, segments:Array<{label:string,value:string}>, warnings:string[], length:number}|{error:string}}
 */
export function buildRedisKeyConvention({
  app,
  includeEnv = true,
  env = "prod",
  includeTenant = false,
  tenant = "acme",
  includeVersion = false,
  version = "v1",
  entity,
  sampleId,
  attribute = "",
  clusterHashTag = false,
  separator = ":",
}) {
  if (!SEPARATORS.some((option) => option.id === separator)) {
    return { error: "Choose a separator." };
  }

  const checks = [
    ["App namespace", app],
    ...(includeEnv ? [["Environment", env]] : []),
    ...(includeTenant ? [["Tenant", tenant]] : []),
    ...(includeVersion ? [["Version", version]] : []),
    ["Entity", entity],
    ["Sample id", sampleId == null ? "" : String(sampleId)],
    ...(attribute && attribute.trim() !== "" ? [["Attribute", attribute]] : []),
  ];
  for (const [name, value] of checks) {
    const problem = validateSegment(name, value ?? "", separator);
    if (problem) return { error: problem };
  }

  const segments = [];
  const templateParts = [];
  const exampleParts = [];

  const push = (label, templatePart, examplePart) => {
    segments.push({ label, value: examplePart });
    templateParts.push(templatePart);
    exampleParts.push(examplePart);
  };

  push("App namespace", app.trim(), app.trim());
  if (includeEnv) push("Environment", "<env>", env.trim());
  if (includeTenant) {
    const value = tenant.trim();
    // Hash-tagging the tenant keeps every key of one tenant in the same
    // cluster slot, enabling multi-key ops (MGET, transactions) per tenant.
    push(
      "Tenant",
      clusterHashTag ? "{<tenant>}" : "<tenant>",
      clusterHashTag ? `{${value}}` : value,
    );
  }
  if (includeVersion) push("Schema version", version.trim(), version.trim());

  const entityValue = entity.trim();
  const idValue = String(sampleId).trim();
  if (clusterHashTag && !includeTenant) {
    // No tenant to tag: tag entity+id so related keys (e.g. user:1000 and
    // user:1000:followers) share a slot.
    push("Entity + id (hash-tagged)", `{<entity>${separator}<id>}`, `{${entityValue}${separator}${idValue}}`);
  } else {
    push("Entity", entityValue, entityValue);
    push("Object id", "<id>", idValue);
  }
  if (attribute && attribute.trim() !== "") {
    push("Attribute", attribute.trim(), attribute.trim());
  }

  const template = templateParts.join(separator);
  const example = exampleParts.join(separator);

  const warnings = [];
  if (/[A-Z]/.test(example)) {
    warnings.push(
      "Key contains upper-case letters. Redis keys are case-sensitive, so mixed case invites user:1 vs User:1 bugs — prefer all lower-case.",
    );
  }
  if (example.length > RECOMMENDED_MAX_KEY_LENGTH) {
    warnings.push(
      `Example key is ${example.length} characters — beyond the ${RECOMMENDED_MAX_KEY_LENGTH}-character guideline. Long keys cost memory and comparison time on every access.`,
    );
  }
  if (clusterHashTag) {
    warnings.push(
      includeTenant
        ? "Hash tag on the tenant: every key of one tenant maps to the same cluster slot. That enables per-tenant MGET/MULTI but can hot-spot a node if one tenant dominates traffic."
        : "Hash tag on entity+id: all keys for the same object share a cluster slot, enabling multi-key operations on that object.",
    );
  }

  return { template, example, segments, warnings, length: example.length };
}
