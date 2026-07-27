/**
 * Subresource Integrity (SRI) metadata generation and verification.
 *
 * SRI is defined by the W3C Subresource Integrity specification. The rules this
 * module implements come straight from it:
 *
 *  - The `integrity` attribute holds one or more "hash expressions", each written as
 *    `<algorithm>-<base64 digest>`, separated by whitespace. An expression may carry
 *    an option string after a `?`, which current browsers ignore.
 *  - Exactly three algorithms are valid: sha256, sha384 and sha512. Anything else
 *    (md5, sha1, sha-256 with a hyphen) is an unrecognised expression and is skipped.
 *  - The digest is taken over the raw bytes of the response body as delivered, then
 *    base64-encoded with the standard alphabet and `=` padding.
 *  - When several expressions are present the browser applies "strongest metadata
 *    wins": it keeps only the expressions using the strongest algorithm listed, and
 *    the resource loads if the body matches ANY one of them. That is what makes it
 *    possible to publish two hashes during a planned file change.
 *  - A cross-origin subresource must be fetched with CORS for the check to run at all,
 *    which in HTML means adding `crossorigin="anonymous"`. Without it the response is
 *    opaque, integrity cannot be checked, and the browser blocks the resource.
 *
 * Everything here is byte-level and local: no network call, no upload. The digest
 * itself uses the Web Crypto SubtleCrypto API, which is present in browsers and in
 * Node 18 and later.
 */

/** Algorithms the SRI specification permits, weakest first. Nothing else is valid metadata. */
export const SRI_ALGORITHMS = [
  {
    id: "sha256",
    label: "SHA-256",
    subtle: "SHA-256",
    bits: 256,
    /** base64 length for a 256-bit digest: ceil(32/3)*4 = 44 characters. */
    base64Length: 44,
    note: "Shortest attribute. Adequate today and the minimum the specification allows.",
  },
  {
    id: "sha384",
    label: "SHA-384",
    subtle: "SHA-384",
    bits: 384,
    base64Length: 64,
    note: "The value used in most CDN copy-paste snippets and a sensible default.",
  },
  {
    id: "sha512",
    label: "SHA-512",
    subtle: "SHA-512",
    bits: 512,
    base64Length: 88,
    note: "Longest attribute, strongest margin. Costs about 44 extra bytes of HTML.",
  },
];

/** Default when the page first loads — matches what CDNs publish. */
export const DEFAULT_ALGORITHM = "sha384";

/** Refuse to hash anything larger than this; a subresource this big is a bundling problem. */
export const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

const ALGO_BY_ID = new Map(SRI_ALGORITHMS.map((algorithm) => [algorithm.id, algorithm]));
const STRENGTH = new Map(SRI_ALGORITHMS.map((algorithm, index) => [algorithm.id, index]));

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Standard base64 with padding, implemented directly so the result never depends on a host helper. */
export function bytesToBase64(bytes) {
  if (!(bytes instanceof Uint8Array)) return "";
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += BASE64_ALPHABET[b0 >> 2];
    out += BASE64_ALPHABET[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    out += i + 1 < bytes.length ? BASE64_ALPHABET[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)] : "=";
    out += i + 2 < bytes.length ? BASE64_ALPHABET[b2 & 0x3f] : "=";
  }
  return out;
}

/** UTF-8 encode pasted text, because the digest is over bytes and not over characters. */
export function textToBytes(text) {
  return new TextEncoder().encode(typeof text === "string" ? text : "");
}

function subtle() {
  const cryptoApi = globalThis.crypto;
  return cryptoApi && cryptoApi.subtle ? cryptoApi.subtle : null;
}

/**
 * Hash one byte array with every requested SRI algorithm.
 *
 * @param {Uint8Array} bytes
 * @param {string[]} [algorithms] subset of SRI_ALGORITHMS ids
 * @returns {Promise<object>} { digests: [{ id, label, base64, expression }], bytes } or { error }
 */
export async function computeIntegrity(bytes, algorithms = [DEFAULT_ALGORITHM]) {
  if (!(bytes instanceof Uint8Array)) {
    return { error: "Nothing to hash yet — paste the file contents or choose a file." };
  }
  if (bytes.length > MAX_BYTES) {
    return { error: "That file is larger than 25 MB. Hash the built bundle you actually ship instead." };
  }
  const wanted = (algorithms || []).filter((id) => ALGO_BY_ID.has(id));
  if (wanted.length === 0) {
    return { error: "Select at least one of SHA-256, SHA-384 or SHA-512." };
  }
  const api = subtle();
  if (!api) {
    return { error: "This browser does not expose the Web Crypto digest API, so hashing cannot run locally." };
  }

  const digests = [];
  for (const id of wanted) {
    const algorithm = ALGO_BY_ID.get(id);
    // Copy into a fresh buffer so a shared ArrayBuffer view cannot leak neighbouring bytes.
    const view = bytes.slice();
    const buffer = await api.digest(algorithm.subtle, view);
    const base64 = bytesToBase64(new Uint8Array(buffer));
    digests.push({
      id: algorithm.id,
      label: algorithm.label,
      base64,
      expression: `${algorithm.id}-${base64}`,
    });
  }

  digests.sort((a, b) => STRENGTH.get(a.id) - STRENGTH.get(b.id));
  return { digests, byteLength: bytes.length };
}

const TAG_TYPES = new Set(["script", "stylesheet", "module", "preload-script", "preload-style"]);

/** Attribute-value escaping for the generated HTML: only `&` and `"` can break a quoted attribute. */
function escapeAttribute(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * Build the HTML tag that carries the integrity metadata.
 *
 * @param {object} input
 * @param {string} input.url            src or href for the subresource
 * @param {string[]} input.expressions  one or more `algo-base64` hash expressions
 * @param {string} [input.tagType]      script | stylesheet | module | preload-script | preload-style
 * @param {boolean} [input.crossOrigin] add crossorigin="anonymous" (required cross-origin)
 * @param {boolean} [input.defer]       add defer to a classic script
 * @param {string} [input.referrerPolicy]
 * @returns {{ html: string, integrity: string, warnings: string[] }|{ error: string }}
 */
export function buildSriTag({
  url,
  expressions = [],
  tagType = "script",
  crossOrigin = true,
  defer = false,
  referrerPolicy = "",
} = {}) {
  const href = String(url ?? "").trim();
  if (!href) return { error: "Enter the URL the browser will actually request." };
  if (/\s/.test(href)) return { error: "The URL contains a space; percent-encode it before using it in HTML." };
  if (!TAG_TYPES.has(tagType)) return { error: "Choose a valid tag type." };

  const list = (expressions || []).map((value) => String(value).trim()).filter(Boolean);
  if (list.length === 0) return { error: "No hash yet — hash the file before building the tag." };

  const integrity = list.join(" ");
  const warnings = [];

  const isAbsolute = /^https?:\/\//i.test(href) || href.startsWith("//");
  if (isAbsolute && !crossOrigin) {
    warnings.push(
      "This URL is cross-origin. Without crossorigin=\"anonymous\" the response is opaque, integrity cannot be checked, and the browser blocks the resource.",
    );
  }
  if (!isAbsolute && crossOrigin) {
    warnings.push(
      "Same-origin subresources do not need crossorigin; the attribute is harmless but adds nothing.",
    );
  }
  if (href.startsWith("http://")) {
    warnings.push(
      "Plain http cannot protect the request itself. SRI detects a tampered body but an active attacker can still strip the tag from the page — serve over https.",
    );
  }

  const attrs = [];
  if (tagType === "script" || tagType === "module") {
    attrs.push(`src="${escapeAttribute(href)}"`);
    if (tagType === "module") attrs.push('type="module"');
    else if (defer) attrs.push("defer");
  } else if (tagType === "stylesheet") {
    attrs.push('rel="stylesheet"', `href="${escapeAttribute(href)}"`);
  } else if (tagType === "preload-script") {
    attrs.push('rel="preload"', 'as="script"', `href="${escapeAttribute(href)}"`);
  } else {
    attrs.push('rel="preload"', 'as="style"', `href="${escapeAttribute(href)}"`);
  }

  attrs.push(`integrity="${escapeAttribute(integrity)}"`);
  if (crossOrigin) attrs.push('crossorigin="anonymous"');
  if (referrerPolicy) attrs.push(`referrerpolicy="${escapeAttribute(referrerPolicy)}"`);

  const html =
    tagType === "script" || tagType === "module"
      ? `<script ${attrs.join(" ")}></script>`
      : `<link ${attrs.join(" ")}>`;

  return { html, integrity, warnings, crossOriginRequired: isAbsolute };
}

/**
 * Parse an existing integrity attribute the way a browser does, including
 * the "strongest metadata wins" rule.
 *
 * @param {string} value raw attribute value
 * @returns {object} { valid, entries, strongest, effective, ignored } or { error }
 */
export function parseIntegrityAttribute(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return { error: "Paste an integrity attribute value to check it." };

  const tokens = raw.split(/\s+/).filter(Boolean);
  const entries = tokens.map((token) => {
    // An option string after `?` is allowed by the spec and ignored by browsers.
    const [expression] = token.split("?");
    const dash = expression.indexOf("-");
    const algorithm = dash > 0 ? expression.slice(0, dash).toLowerCase() : "";
    const digest = dash > 0 ? expression.slice(dash + 1) : "";
    const known = ALGO_BY_ID.get(algorithm);
    let problem = null;
    if (!known) problem = `"${algorithm || token}" is not one of sha256, sha384 or sha512, so browsers ignore this expression.`;
    else if (!/^[A-Za-z0-9+/]+={0,2}$/.test(digest)) problem = "The digest is not valid base64.";
    else if (digest.length !== known.base64Length) {
      problem = `A ${known.label} digest is ${known.base64Length} base64 characters; this one is ${digest.length}.`;
    }
    return { token, algorithm, digest, valid: !problem, problem };
  });

  const valid = entries.filter((entry) => entry.valid);
  if (valid.length === 0) {
    return { valid: false, entries, strongest: null, effective: [], ignored: entries.map((e) => e.token) };
  }

  const strongest = valid.reduce((best, entry) =>
    STRENGTH.get(entry.algorithm) > STRENGTH.get(best.algorithm) ? entry : best,
  );
  const effective = valid.filter((entry) => entry.algorithm === strongest.algorithm);
  const ignored = entries.filter((entry) => !effective.includes(entry)).map((entry) => entry.token);

  return {
    valid: true,
    entries,
    strongest: strongest.algorithm,
    effective: effective.map((entry) => entry.token),
    ignored,
  };
}

/**
 * Check bytes against an integrity attribute using the browser's own rule:
 * only the strongest algorithm's expressions count, and any one match passes.
 *
 * @param {Uint8Array} bytes
 * @param {string} integrityValue
 * @returns {Promise<object>} { match, strongest, actual, expected } or { error }
 */
export async function verifyIntegrity(bytes, integrityValue) {
  const parsed = parseIntegrityAttribute(integrityValue);
  if (parsed.error) return { error: parsed.error };
  if (!parsed.valid) return { error: "No recognised sha256, sha384 or sha512 expression in that attribute." };

  const computed = await computeIntegrity(bytes, [parsed.strongest]);
  if (computed.error) return { error: computed.error };

  const actual = computed.digests[0].expression;
  const expected = parsed.effective.map((token) => token.split("?")[0]);
  return {
    match: expected.includes(actual),
    strongest: parsed.strongest,
    actual,
    expected,
  };
}
