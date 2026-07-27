/**
 * URL percent-encoding, RFC 3986.
 *
 * Section 2.3 defines the unreserved set (ALPHA / DIGIT / "-" / "." / "_" / "~");
 * everything else must be percent-encoded when it appears as data. Section 2.2
 * lists the reserved delimiters. Form bodies follow the HTML
 * application/x-www-form-urlencoded rules instead, where a space becomes "+".
 */

/** RFC 3986 §2.3 — characters that never need escaping. */
export const UNRESERVED = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

/** RFC 3986 §2.2 — gen-delims and sub-delims. */
export const GEN_DELIMS = ":/?#[]@";
export const SUB_DELIMS = "!$&'()*+,;=";

/**
 * encodeURIComponent leaves these alone even though RFC 3986 does not call them
 * unreserved, so strict mode escapes them by hand (MDN, encodeURIComponent).
 */
export const LEGACY_UNESCAPED = "!'()*";

/** Guard so a pasted document cannot lock the tab up. */
export const MAX_INPUT_CHARS = 100000;

export const ENCODE_MODES = [
  {
    id: "component",
    label: "Component (encodeURIComponent)",
    hint: "For a single query value or path segment. Escapes / ? # & = and space.",
  },
  {
    id: "strict",
    label: "Strict RFC 3986",
    hint: "Component plus ! ' ( ) * — the safest choice for signatures and OAuth.",
  },
  {
    id: "full",
    label: "Whole URL (encodeURI)",
    hint: "Keeps : / ? # & = intact so an existing URL stays usable.",
  },
  {
    id: "form",
    label: "Form body (x-www-form-urlencoded)",
    hint: "Strict encoding with spaces written as + , as HTML forms send them.",
  },
];

const MODE_IDS = new Set(ENCODE_MODES.map((mode) => mode.id));

/** Percent-encode one character's UTF-8 bytes, uppercase hex as RFC 3986 §2.1 prefers. */
function percentEncodeChar(character) {
  return Array.from(new TextEncoder().encode(character))
    .map((byte) => `%${byte.toString(16).toUpperCase().padStart(2, "0")}`)
    .join("");
}

/** encodeURIComponent, plus the five characters it wrongly leaves unescaped. */
export function strictEncode(text) {
  return encodeURIComponent(text).replace(
    new RegExp(`[${LEGACY_UNESCAPED.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`, "g"),
    percentEncodeChar
  );
}

/**
 * Percent-encode text.
 * @param {{text:string, mode:string}} input
 * @returns {{output:string, escapedCount:number, inputLength:number,
 *            outputLength:number, growthPercent:number}|{error:string}}
 */
export function encodeUrl({ text = "", mode = "component" } = {}) {
  if (typeof text !== "string") return { error: "Input must be text." };
  if (text.length === 0) return { error: "Enter some text to encode." };
  if (text.length > MAX_INPUT_CHARS) {
    return {
      error: `Input is ${text.length.toLocaleString()} characters. The limit is ${MAX_INPUT_CHARS.toLocaleString()}.`,
    };
  }
  if (!MODE_IDS.has(mode)) return { error: `"${mode}" is not a supported encoding mode.` };

  let output;
  try {
    if (mode === "component") output = encodeURIComponent(text);
    else if (mode === "strict") output = strictEncode(text);
    else if (mode === "full") output = encodeURI(text);
    else output = strictEncode(text).replace(/%20/g, "+");
  } catch {
    // Thrown only for lone surrogates, which have no UTF-8 representation.
    return { error: "The text contains an unpaired surrogate character and cannot be encoded." };
  }

  const escapedCount = (output.match(/%[0-9A-Fa-f]{2}/g) || []).length;

  return {
    output,
    escapedCount,
    inputLength: text.length,
    outputLength: output.length,
    growthPercent: Number((((output.length - text.length) / text.length) * 100).toFixed(1)),
  };
}

/** Find the first "%" that is not followed by two hex digits. Returns -1 when clean. */
export function findBadEscape(value) {
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== "%") continue;
    if (!/^[0-9A-Fa-f]{2}$/.test(value.slice(index + 1, index + 3))) return index;
  }
  return -1;
}

/**
 * Decode percent-encoded text.
 * @param {{value:string, mode:string}} input
 * @returns {{output:string, decodedCount:number, looksDoubleEncoded:boolean,
 *            inputLength:number, outputLength:number}|{error:string}}
 */
export function decodeUrl({ value = "", mode = "component" } = {}) {
  if (typeof value !== "string") return { error: "Input must be text." };
  if (value.length === 0) return { error: "Enter an encoded string to decode." };
  if (value.length > MAX_INPUT_CHARS) {
    return {
      error: `Input is ${value.length.toLocaleString()} characters. The limit is ${MAX_INPUT_CHARS.toLocaleString()}.`,
    };
  }

  const badIndex = findBadEscape(value);
  if (badIndex !== -1) {
    return {
      error: `Broken escape at position ${badIndex + 1}: "%" must be followed by two hex digits (write a literal percent sign as %25).`,
    };
  }

  const decodedCount = (value.match(/%[0-9A-Fa-f]{2}/g) || []).length;
  // Only form bodies use "+" for space; in a path or fragment "+" is a literal plus.
  const prepared = mode === "form" ? value.replace(/\+/g, " ") : value;

  let output;
  try {
    output = decodeURIComponent(prepared);
  } catch {
    return {
      error: "Those percent escapes are not valid UTF-8 (for example %C3 with no continuation byte).",
    };
  }

  return {
    output,
    decodedCount,
    looksDoubleEncoded: /%25[0-9A-Fa-f]{2}/.test(value),
    inputLength: value.length,
    outputLength: output.length,
  };
}

/**
 * Split a URL into its parts and list the query parameters, decoded.
 * Pure string work — no network, no DOM.
 * @returns {{scheme:string, authority:string, path:string, params:Array,
 *            fragment:string}|{error:string}}
 */
export function inspectUrl(value = "") {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { error: "Enter a URL to inspect." };
  }

  // RFC 3986 Appendix B, the reference URI-splitting expression.
  const match = /^(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/.exec(
    value.trim()
  );
  if (!match) return { error: "That does not parse as a URI reference." };

  const [, scheme = "", authority = "", path = "", query = "", fragment = ""] = match;

  const params = [];
  if (query) {
    for (const pair of query.split("&")) {
      if (pair === "") continue;
      const separator = pair.indexOf("=");
      const rawKey = separator === -1 ? pair : pair.slice(0, separator);
      const rawValue = separator === -1 ? "" : pair.slice(separator + 1);
      // An empty key or value is legal ("?a=&b"), so skip decoding rather than error.
      const key = rawKey === "" ? { output: "" } : decodeUrl({ value: rawKey, mode: "form" });
      const decoded = rawValue === "" ? { output: "" } : decodeUrl({ value: rawValue, mode: "form" });
      params.push({
        raw: pair,
        key: key.error ? rawKey : key.output,
        value: decoded.error ? rawValue : decoded.output,
        problem: key.error || decoded.error || null,
      });
    }
  }

  return {
    scheme,
    authority,
    path,
    query,
    fragment,
    params,
  };
}
