/**
 * Query string construction.
 *
 * Rule sources:
 *
 *  - RFC 3986 section 2.3 defines the unreserved set that never needs encoding:
 *    ALPHA / DIGIT / "-" / "." / "_" / "~". Section 2.2 lists the reserved
 *    characters; anything reserved that is meant as DATA rather than as a delimiter
 *    must be percent-encoded, which is why a "&" inside a value has to become %26.
 *
 *  - JavaScript's encodeURIComponent leaves five extra characters alone that are not
 *    in the unreserved set: ! ' ( ) *. They are sub-delims and legal in a query, but
 *    RFC 5849 section 3.6 (OAuth 1.0a) and several signature schemes require the
 *    strict unreserved set, so strict mode encodes them as %21 %27 %28 %29 %2A.
 *
 *  - The WHATWG URL Standard's application/x-www-form-urlencoded serialiser encodes
 *    a space as "+" and encodes "*" and "~" as well. RFC 3986 percent-encoding uses
 *    %20 for a space and leaves "~" alone. Both are widely accepted; a decoder that
 *    expects one and is given the other turns "a+b" into the literal string "a+b".
 *
 *  - Non-ASCII characters are encoded as the percent-encoded bytes of their UTF-8
 *    representation, per RFC 3986 section 2.5. "é" is two bytes, %C3%A9; most emoji
 *    are four, so a single emoji costs twelve characters in the URL.
 *
 *  - There is no limit on query length in the HTTP specification. The practical
 *    limits are implementation ones: Internet Explorer capped a URL at 2083
 *    characters, and nginx's default large_client_header_buffers gives 8 KB per
 *    request line. Cross either and the request fails before your code sees it.
 *
 * Array and object serialisation styles follow the conventions of the `qs` package
 * and OpenAPI 3 parameter styles. There is no standard here — the server decides.
 *
 * Everything in this module is pure.
 */

/** Documented maximum URL length in Internet Explorer. */
export const IE_URL_LIMIT = 2083;

/** nginx default large_client_header_buffers buffer size, 8 KB, for the request line. */
export const NGINX_REQUEST_LINE_LIMIT = 8192;

/** Guard against a pathologically nested object. */
export const MAX_DEPTH = 12;

/** Guard against an input that would produce an unusable number of pairs. */
export const MAX_PAIRS = 2000;

export const ARRAY_FORMATS = [
  { id: "repeat", label: "Repeat the key — a=1&a=2", note: "Rails, Go net/url, Express and most Java frameworks read this natively. PHP keeps only the last value." },
  { id: "brackets", label: "Empty brackets — a[]=1&a[]=2", note: "PHP and Rails build arrays from this. It is the qs library's arrayFormat: 'brackets'." },
  { id: "indices", label: "Numeric indices — a[0]=1&a[1]=2", note: "The qs library's default. Preserves order explicitly, but is the longest form." },
  { id: "comma", label: "Comma separated — a=1,2", note: "OpenAPI 3 form style with explode: false. Breaks as soon as a value contains a comma." },
  { id: "space", label: "Space separated — a=1 2", note: "OpenAPI 3 spaceDelimited style. The separator itself gets encoded, so it reads as a=1%202." },
  { id: "pipe", label: "Pipe separated — a=1|2", note: "OpenAPI 3 pipeDelimited style. Common in analytics query APIs." },
];

export const OBJECT_FORMATS = [
  { id: "brackets", label: "Brackets — user[name]=Ann", note: "Understood by PHP, Rails, the qs library and most form-encoded body parsers." },
  { id: "dots", label: "Dots — user.name=Ann", note: "Used by Spring, some .NET binders and many search APIs. Not understood by PHP." },
];

export const SPACE_FORMATS = [
  { id: "percent20", label: "%20 (RFC 3986 percent-encoding)" },
  { id: "plus", label: "+ (application/x-www-form-urlencoded)" },
];

/** The five characters encodeURIComponent leaves alone that are not unreserved. */
const NON_UNRESERVED_LEFT_BY_ENCODE_URI_COMPONENT = /[!'()*]/g;

/**
 * Percent-encode one key or value.
 *
 * @param {string} raw
 * @param {{ strict?:boolean, spaceFormat?:"percent20"|"plus" }} options
 * @returns {string}
 */
export function encodeComponent(raw, { strict = false, spaceFormat = "percent20" } = {}) {
  let encoded = encodeURIComponent(String(raw ?? ""));
  if (strict) {
    encoded = encoded.replace(NON_UNRESERVED_LEFT_BY_ENCODE_URI_COMPONENT, (char) =>
      `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
    );
  }
  if (spaceFormat === "plus") {
    encoded = encoded.replace(/%20/g, "+");
  }
  return encoded;
}

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const scalarToString = (value) => {
  if (value === null) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  return String(value);
};

const JOINERS = { comma: ",", space: " ", pipe: "|" };

/**
 * Flatten a JSON-shaped value into ordered parameter entries.
 *
 * Each entry is either { key, value } for a single value, or { key, items, joiner }
 * for an array that will be written as one delimiter-separated value.
 *
 * @param {object} input
 * @param {{ arrayFormat?:string, objectFormat?:string, skipNull?:boolean,
 *           skipEmpty?:boolean, sortKeys?:boolean }} options
 * @returns {{ pairs:Array<object> }|{ error:string }}
 */
export function flattenParams(input, options = {}) {
  const {
    arrayFormat = "repeat",
    objectFormat = "brackets",
    skipNull = true,
    skipEmpty = false,
    sortKeys = false,
  } = options;

  if (!isPlainObject(input)) {
    return { error: "The top level has to be a JSON object, for example {\"page\": 2}." };
  }
  if (!ARRAY_FORMATS.some((entry) => entry.id === arrayFormat)) {
    return { error: "Choose how arrays should be serialised." };
  }
  if (!OBJECT_FORMATS.some((entry) => entry.id === objectFormat)) {
    return { error: "Choose how nested objects should be serialised." };
  }

  const pairs = [];
  let failure = "";

  const childKey = (parent, key) => {
    if (!parent) return String(key);
    return objectFormat === "dots" ? `${parent}.${key}` : `${parent}[${key}]`;
  };

  const walk = (value, prefix, depth) => {
    if (failure) return;
    if (depth > MAX_DEPTH) {
      failure = `The structure nests deeper than ${MAX_DEPTH} levels — flatten it before building a query string.`;
      return;
    }
    if (pairs.length > MAX_PAIRS) {
      failure = `That produces more than ${MAX_PAIRS} parameters, which no server will accept.`;
      return;
    }

    if (value === undefined) return;

    if (Array.isArray(value)) {
      if (value.length === 0) return;

      if (arrayFormat in JOINERS) {
        const joiner = JOINERS[arrayFormat];
        const flat = value.every((item) => !isPlainObject(item) && !Array.isArray(item));
        if (!flat) {
          failure =
            "A comma, space or pipe separated array can only hold scalars. Use repeated keys or indices for arrays of objects.";
          return;
        }
        // Items are kept separate so each one can be encoded on its own and the
        // separator inserted afterwards. A comma is a sub-delim and stays literal;
        // a pipe and a space are not legal unencoded and must be escaped.
        pairs.push({ key: prefix, items: value.map(scalarToString), joiner });
        return;
      }

      value.forEach((item, index) => {
        const key =
          arrayFormat === "brackets"
            ? `${prefix}[]`
            : arrayFormat === "indices"
              ? `${prefix}[${index}]`
              : prefix;
        walk(item, key, depth + 1);
      });
      return;
    }

    if (isPlainObject(value)) {
      const keys = sortKeys ? Object.keys(value).sort() : Object.keys(value);
      keys.forEach((key) => walk(value[key], childKey(prefix, key), depth + 1));
      return;
    }

    if (value === null) {
      if (skipNull) return;
      pairs.push({ key: prefix, value: "" });
      return;
    }

    const text = scalarToString(value);
    if (skipEmpty && text === "") return;
    pairs.push({ key: prefix, value: text });
  };

  const topKeys = sortKeys ? Object.keys(input).sort() : Object.keys(input);
  topKeys.forEach((key) => walk(input[key], key, 1));

  if (failure) return { error: failure };
  return { pairs };
}

/**
 * Build the finished query string.
 *
 * @param {object} input the parameter object
 * @param {object} options see flattenParams, plus strict, spaceFormat, encodeBrackets, baseUrl
 * @returns {object} result, or { error }
 */
export function buildQuery(input, options = {}) {
  const flat = flattenParams(input, options);
  if (flat.error) return { error: flat.error };
  if (flat.pairs.length === 0) {
    return { error: "Nothing to encode — add at least one parameter with a value." };
  }

  const { strict = false, spaceFormat = "percent20", encodeBrackets = true } = options;

  const rows = flat.pairs.map((entry) => {
    let encodedKey = encodeComponent(entry.key, { strict, spaceFormat });
    if (!encodeBrackets) {
      // Brackets are sub-delims and legal unencoded in a query; leaving them raw is
      // easier to read and is accepted by PHP, Rails and the qs library.
      encodedKey = encodedKey.replace(/%5B/g, "[").replace(/%5D/g, "]");
    }

    let value;
    let encodedValue;
    if (entry.items) {
      value = entry.items.join(entry.joiner);
      // A comma is a sub-delim and stays literal so the server can split on it.
      // A pipe and a space are not legal unencoded and are escaped.
      const encodedJoiner =
        entry.joiner === "," ? "," : encodeComponent(entry.joiner, { strict, spaceFormat });
      encodedValue = entry.items
        .map((item) => encodeComponent(item, { strict, spaceFormat }))
        .join(encodedJoiner);
    } else {
      value = entry.value;
      encodedValue = encodeComponent(value, { strict, spaceFormat });
    }

    return {
      key: entry.key,
      value,
      encodedKey,
      encodedValue,
      pair: `${encodedKey}=${encodedValue}`,
      changed: encodedKey !== entry.key || encodedValue !== value,
    };
  });

  const query = rows.map((row) => row.pair).join("&");

  const base = String(options.baseUrl ?? "").trim();
  let fullUrl = "";
  let baseError = "";
  if (base) {
    try {
      const parsed = new URL(base);
      const separator = parsed.search ? "&" : "?";
      fullUrl = `${parsed.origin}${parsed.pathname}${parsed.search}${separator}${query}${parsed.hash}`;
    } catch {
      baseError = "That base URL is not absolute, so no full URL is shown. The query string below is still valid.";
    }
  }

  const length = (fullUrl || `?${query}`).length;

  const warnings = [];
  if (length > IE_URL_LIMIT) {
    warnings.push(
      `At ${length} characters this exceeds the ${IE_URL_LIMIT}-character URL limit that Internet Explorer enforced, and some proxies and CDNs still cap around there. Consider a POST body.`,
    );
  }
  if (length > NGINX_REQUEST_LINE_LIMIT) {
    warnings.push(
      `At ${length} characters this exceeds nginx's default ${NGINX_REQUEST_LINE_LIMIT}-byte request line buffer and will be rejected with 414 unless large_client_header_buffers is raised.`,
    );
  }
  if (spaceFormat === "plus") {
    warnings.push(
      "Spaces are written as \"+\". A decoder that uses RFC 3986 rules rather than form-urlencoded rules will read them as literal plus signs.",
    );
  }

  return {
    pairs: rows,
    query,
    fullUrl,
    baseError,
    length,
    count: rows.length,
    warnings,
  };
}

/**
 * Parse the JSON the user typed, with a readable message when it will not parse.
 * @param {string} text
 */
export function parseJsonInput(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return { error: "Paste a JSON object describing your parameters." };
  try {
    return { value: JSON.parse(trimmed) };
  } catch (cause) {
    return { error: `That is not valid JSON — ${String(cause.message)}.` };
  }
}

export default buildQuery;
