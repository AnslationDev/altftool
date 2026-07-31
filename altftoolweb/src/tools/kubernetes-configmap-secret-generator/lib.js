/**
 * ConfigMap / Secret manifest generation, per the Kubernetes API:
 *
 *  - Data keys must match [-._a-zA-Z0-9]+ and be at most 253 characters
 *    (apimachinery IsConfigMapKey validation; same rule for Secret keys).
 *  - Object names must be RFC 1123 subdomain-compatible; we enforce the
 *    common DNS-label form (lowercase alnum + '-', max 253 chars).
 *  - Secret `data` values are base64-encoded (standard alphabet, padded,
 *    RFC 4648 §4); `stringData` is the write-only plaintext convenience
 *    field the API server merges into data on write.
 *  - Both objects cap at 1 MiB total (etcd object size limit documented
 *    for ConfigMap and Secret).
 *
 * Pure functions only. base64 is implemented here so the module runs
 * identically in browser and Node without Buffer/btoa.
 */

/** apimachinery IsConfigMapKey: [-._a-zA-Z0-9]+, max 253 chars. */
export const DATA_KEY_REGEX = /^[-._a-zA-Z0-9]+$/;
export const DATA_KEY_MAX_LENGTH = 253;

/** RFC 1123 subdomain for metadata.name (max 253 chars). */
export const NAME_REGEX = /^[a-z0-9]([-a-z0-9.]*[a-z0-9])?$/;
export const NAME_MAX_LENGTH = 253;

/** ConfigMap and Secret payloads are limited to 1 MiB. */
export const MAX_OBJECT_BYTES = 1024 * 1024;

/** Common built-in Secret types (core/v1). */
export const SECRET_TYPES = [
  { id: "Opaque", label: "Opaque (arbitrary user data — the default)" },
  { id: "kubernetes.io/dockerconfigjson", label: "kubernetes.io/dockerconfigjson (registry credentials)" },
  { id: "kubernetes.io/tls", label: "kubernetes.io/tls (tls.crt + tls.key)" },
  { id: "kubernetes.io/basic-auth", label: "kubernetes.io/basic-auth (username + password)" },
];

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** UTF-8 encode a JS string into an array of bytes (no TextEncoder needed). */
function utf8Bytes(str) {
  const bytes = [];
  for (const ch of str) {
    const code = ch.codePointAt(0);
    if (code <= 0x7f) bytes.push(code);
    else if (code <= 0x7ff) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code <= 0xffff) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return bytes;
}

/** RFC 4648 §4 standard base64 with padding, from a UTF-8 string. */
export function encodeBase64Utf8(str) {
  const bytes = utf8Bytes(String(str));
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += BASE64_ALPHABET[b0 >> 2];
    out += BASE64_ALPHABET[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    out += b1 === undefined ? "=" : BASE64_ALPHABET[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)];
    out += b2 === undefined ? "=" : BASE64_ALPHABET[b2 & 0x3f];
  }
  return out;
}

/**
 * Parse .env-style text: KEY=VALUE per line, # comments and blanks skipped,
 * optional `export ` prefix tolerated, single/double quotes stripped.
 *
 * @returns {{entries: [{key, value}], warnings}|{error}}
 */
export function parseEnvText(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste at least one KEY=VALUE line." };
  }
  const entries = [];
  const warnings = [];
  const seen = new Map();

  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i].trim();
    if (line === "" || line.startsWith("#")) continue;
    if (line.startsWith("export ")) line = line.slice(7).trim();

    const eq = line.indexOf("=");
    if (eq === -1) return { error: `Line ${i + 1} ("${line.slice(0, 40)}") has no "=".` };
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if (key === "") return { error: `Line ${i + 1} has an empty key.` };
    if (key.length > DATA_KEY_MAX_LENGTH) {
      return { error: `Key "${key.slice(0, 30)}..." exceeds the ${DATA_KEY_MAX_LENGTH}-character limit.` };
    }
    if (!DATA_KEY_REGEX.test(key)) {
      return {
        error: `Key "${key}" is invalid — ConfigMap/Secret keys may only contain letters, digits, '-', '_' and '.'.`,
      };
    }

    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }

    if (seen.has(key)) {
      warnings.push(`Duplicate key "${key}" — the later value wins.`);
      entries.splice(entries.indexOf(seen.get(key)), 1);
    }
    const entry = { key, value };
    seen.set(key, entry);
    entries.push(entry);
  }

  if (entries.length === 0) return { error: "No KEY=VALUE pairs found (only comments or blank lines)." };
  return { entries, warnings };
}

function validateName(name, what) {
  if (typeof name !== "string" || name.trim() === "") return `${what} name is required.`;
  const n = name.trim();
  if (n.length > NAME_MAX_LENGTH) return `${what} name exceeds ${NAME_MAX_LENGTH} characters.`;
  if (!NAME_REGEX.test(n)) {
    return `${what} name must be lowercase letters, digits, '-' and '.', starting and ending alphanumeric.`;
  }
  return null;
}

/** YAML-safe scalar: quote via JSON (valid YAML) so ':', '#', quotes survive. */
function yamlValue(value) {
  return JSON.stringify(value);
}

/**
 * Build both manifests from parsed entries.
 *
 * @param {object} input
 * @param {string} input.name
 * @param {string} [input.namespace]
 * @param {string} input.envText
 * @param {string} [input.secretType]
 * @returns {{configMapYaml, secretYaml, entries, warnings, totalBytes}|{error}}
 */
export function buildManifests({ name, namespace = "", envText, secretType = "Opaque" }) {
  const nameProblem = validateName(name, "Object");
  if (nameProblem) return { error: nameProblem };
  if (namespace.trim() !== "") {
    const nsProblem = validateName(namespace, "Namespace");
    if (nsProblem) return { error: nsProblem };
  }
  if (!SECRET_TYPES.some((t) => t.id === secretType)) return { error: "Choose a Secret type." };

  const parsed = parseEnvText(envText);
  if (parsed.error) return { error: parsed.error };

  const warnings = [...parsed.warnings];

  let totalBytes = 0;
  let secretBytes = 0;
  for (const { key, value } of parsed.entries) {
    const keyBytes = utf8Bytes(key).length;
    const valueBytes = utf8Bytes(value).length;
    totalBytes += keyBytes + valueBytes;
    // Secret `data` values are base64-encoded (RFC 4648 §4, padded): the encoded
    // length of an n-byte value is always ceil(n / 3) * 4, matching encodeBase64Utf8.
    secretBytes += keyBytes + Math.ceil(valueBytes / 3) * 4;
  }
  if (totalBytes > MAX_OBJECT_BYTES) {
    return {
      error: `Data is ${totalBytes.toLocaleString()} bytes — ConfigMaps and Secrets are capped at 1 MiB (${MAX_OBJECT_BYTES.toLocaleString()} bytes).`,
    };
  }
  if (secretBytes > MAX_OBJECT_BYTES) {
    return {
      error: `Base64-encoded data is ${secretBytes.toLocaleString()} bytes — Secrets are capped at 1 MiB (${MAX_OBJECT_BYTES.toLocaleString()} bytes) once values are base64-encoded.`,
    };
  }

  const meta = (kind) => {
    const lines = [`apiVersion: v1`, `kind: ${kind}`, `metadata:`, `  name: ${name.trim()}`];
    if (namespace.trim() !== "") lines.push(`  namespace: ${namespace.trim()}`);
    return lines;
  };

  const cmLines = meta("ConfigMap");
  cmLines.push("data:");
  for (const { key, value } of parsed.entries) {
    cmLines.push(`  ${key}: ${yamlValue(value)}`);
  }

  const secretLines = meta("Secret");
  secretLines.push(`type: ${secretType}`);
  secretLines.push("data:");
  const encoded = parsed.entries.map(({ key, value }) => ({ key, b64: encodeBase64Utf8(value) }));
  for (const { key, b64 } of encoded) {
    secretLines.push(`  ${key}: ${yamlValue(b64)}`);
  }

  if (secretType === "kubernetes.io/tls") {
    const keys = new Set(parsed.entries.map((e) => e.key));
    if (!keys.has("tls.crt") || !keys.has("tls.key")) {
      warnings.push("A kubernetes.io/tls Secret must contain the keys tls.crt and tls.key.");
    }
  }
  if (secretType === "kubernetes.io/basic-auth") {
    const keys = new Set(parsed.entries.map((e) => e.key));
    if (!keys.has("username") || !keys.has("password")) {
      warnings.push("A kubernetes.io/basic-auth Secret should contain the keys username and password.");
    }
  }
  warnings.push("base64 is encoding, not encryption — anyone who can read the Secret can decode it.");

  return {
    configMapYaml: cmLines.join("\n"),
    secretYaml: secretLines.join("\n"),
    entries: encoded,
    warnings,
    totalBytes,
  };
}
