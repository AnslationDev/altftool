/**
 * .env -> Kubernetes Secret manifest converter.
 *
 * Rules implemented, with sources:
 * - Secret shape: apiVersion v1, kind Secret, with `data` (base64-encoded) or
 *   `stringData` (plain text, write-only convenience) — Kubernetes docs
 *   "Secrets" (kubernetes.io/docs/concepts/configuration/secret/).
 * - metadata.name must be a valid DNS-1123 subdomain: at most 253 characters,
 *   lowercase alphanumerics, '-' or '.', starting and ending alphanumeric —
 *   Kubernetes docs "Object Names and IDs".
 * - Each key in data/stringData must consist of alphanumeric characters,
 *   '-', '_' or '.' (regex used by the API server: [-._a-zA-Z0-9]+), max 253
 *   chars — Secret/ConfigMap key validation in apimachinery.
 * - Secret values in `data` are standard RFC 4648 base64 of the UTF-8 bytes.
 * - Total Secret size is capped at 1 MiB by the API server (etcd limit).
 *
 * .env parsing follows the de-facto dotenv format (motdotla/dotenv):
 * "#" comments, optional "export ", quoted values, last duplicate wins.
 */

/** Kubernetes object name: RFC 1123 subdomain (Object Names and IDs docs). */
export const DNS1123_SUBDOMAIN_PATTERN =
  /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
export const DNS1123_MAX_LENGTH = 253;

/** Secret/ConfigMap data key rule enforced by the API server. */
export const SECRET_KEY_PATTERN = /^[-._a-zA-Z0-9]+$/;
export const SECRET_KEY_MAX_LENGTH = 253;

/** API server rejects Secrets larger than 1 MiB (kubernetes.io Secrets docs). */
export const MAX_SECRET_BYTES = 1024 * 1024;

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Encode a JS string to UTF-8 bytes (pure, no TextEncoder/Buffer needed). */
export function utf8Bytes(str) {
  const bytes = [];
  for (const ch of String(str)) {
    const cp = ch.codePointAt(0);
    if (cp <= 0x7f) {
      bytes.push(cp);
    } else if (cp <= 0x7ff) {
      bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp <= 0xffff) {
      bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      bytes.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
    }
  }
  return bytes;
}

/** RFC 4648 base64 with padding, over UTF-8 bytes of the input string. */
export function base64Encode(str) {
  const bytes = utf8Bytes(str);
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

/** Quote a string as a YAML double-quoted scalar (JSON strings are valid YAML). */
export function yamlQuote(value) {
  return JSON.stringify(String(value));
}

/** A YAML plain scalar is safe unquoted only in simple cases; otherwise quote. */
function yamlValue(value) {
  if (/^[A-Za-z0-9_][A-Za-z0-9_./@-]*$/.test(value) && !/^(true|false|null|yes|no|on|off|~)$/i.test(value) && !/^[-+]?[0-9]/.test(value)) {
    return value;
  }
  return yamlQuote(value);
}

function findClosingQuote(text, q) {
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== q) continue;
    let backslashes = 0;
    for (let j = i - 1; j >= 0 && text[j] === "\\"; j -= 1) backslashes += 1;
    if (backslashes % 2 === 0) return i;
  }
  return -1;
}

const DOUBLE_QUOTE_ESCAPES = [
  [/\\n/g, "\n"],
  [/\\r/g, "\r"],
  [/\\t/g, "\t"],
  [/\\"/g, '"'],
  [/\\\\/g, "\\"],
];

/** Parse .env text into an ordered key->value map (dotenv rules, last wins). */
export function parseEnv(text) {
  const map = new Map();
  const lines = String(text ?? "").split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^(?:export\s+)?([^=\s]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    const rest = match[2];
    let value;
    const q = rest[0];
    if (q === '"' || q === "'" || q === "`") {
      let buf = rest.slice(1);
      let idx = findClosingQuote(buf, q);
      while (idx === -1 && i + 1 < lines.length) {
        i += 1;
        buf += `\n${lines[i]}`;
        idx = findClosingQuote(buf, q);
      }
      value = idx === -1 ? buf : buf.slice(0, idx);
      if (q === '"') {
        for (const [pattern, replacement] of DOUBLE_QUOTE_ESCAPES) value = value.replace(pattern, replacement);
      }
    } else {
      const hashIdx = rest.indexOf("#");
      value = (hashIdx === -1 ? rest : rest.slice(0, hashIdx)).trim();
    }
    map.set(key, value);
  }
  return map;
}

/**
 * Convert .env text into a Kubernetes Secret manifest.
 *
 * @param {string} text .env contents.
 * @param {object} options
 * @param {string} options.name              metadata.name (DNS-1123 subdomain).
 * @param {string} [options.namespace]       Optional metadata.namespace.
 * @param {boolean} [options.useStringData]  Emit stringData (plain) instead of data (base64).
 * @param {boolean} [options.immutable]      Set immutable: true (k8s >= 1.21).
 * @returns {object} { manifest, count, keys, approxBytes } or { error }.
 */
export function convertEnvToSecret(text, { name, namespace = "", useStringData = false, immutable = false } = {}) {
  const secretName = String(name ?? "").trim();
  if (secretName === "") return { error: "Enter a Secret name." };
  if (secretName.length > DNS1123_MAX_LENGTH || !DNS1123_SUBDOMAIN_PATTERN.test(secretName)) {
    return {
      error:
        "Secret name must be a DNS-1123 subdomain: lowercase letters, digits, '-' and '.', starting and ending with a letter or digit, at most 253 characters.",
    };
  }
  const ns = String(namespace ?? "").trim();
  if (ns !== "" && (ns.length > 63 || !/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(ns))) {
    return {
      error:
        "Namespace must be a DNS-1123 label: lowercase letters, digits and '-', at most 63 characters.",
    };
  }

  const map = parseEnv(text);
  if (map.size === 0) return { error: "No KEY=VALUE variables found — paste a .env file to convert." };

  for (const key of map.keys()) {
    if (key.length > SECRET_KEY_MAX_LENGTH || !SECRET_KEY_PATTERN.test(key)) {
      return {
        error: `"${key}" is not a valid Secret data key — Kubernetes allows only letters, digits, '-', '_' and '.' (max 253 characters).`,
      };
    }
  }

  const lines = ["apiVersion: v1", "kind: Secret", "metadata:", `  name: ${secretName}`];
  if (ns !== "") lines.push(`  namespace: ${ns}`);
  lines.push("type: Opaque");
  if (immutable) lines.push("immutable: true");

  let approxBytes = 0;
  if (useStringData) {
    lines.push("stringData:");
    for (const [key, value] of map) {
      approxBytes += utf8Bytes(value).length;
      lines.push(`  ${key}: ${yamlValue(value)}`);
    }
  } else {
    lines.push("data:");
    for (const [key, value] of map) {
      approxBytes += utf8Bytes(value).length;
      lines.push(`  ${key}: ${base64Encode(value)}`);
    }
  }

  const manifest = `${lines.join("\n")}\n`;
  const result = {
    manifest,
    count: map.size,
    keys: [...map.keys()],
    approxBytes,
    overSizeLimit: approxBytes > MAX_SECRET_BYTES,
  };
  return result;
}
