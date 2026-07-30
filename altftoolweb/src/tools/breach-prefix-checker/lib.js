/**
 * Breach Prefix Checker — k-anonymity range lookup preparation.
 *
 * Pure JavaScript. No DOM, no network, no clock. Same input, same output.
 *
 * The k-anonymity model used by the Pwned Passwords range API works like this:
 *   1. SHA-1 the candidate password (UTF-8 bytes), uppercase hex -> 40 characters.
 *   2. Send only the first 5 hex characters (the "prefix") to the API.
 *   3. The API returns every stored suffix that shares that prefix, as
 *      "<35-hex-suffix>:<count>" lines.
 *   4. Search that list locally for your own 35-character suffix.
 * The server therefore never sees the password, and never sees enough of the
 * digest to identify it: 5 hex characters is 20 bits of a 160-bit digest.
 *
 * This module implements steps 1, 2 and 4. Step 3 is the one network call, and
 * this tool deliberately does not make it — paste the response instead.
 */

/* ------------------------------------------------------------------ */
/* UTF-8 encoding                                                      */
/* ------------------------------------------------------------------ */

/**
 * Encode a JavaScript string to an array of UTF-8 byte values.
 * Lone surrogates are encoded as U+FFFD so the output is always valid UTF-8.
 */
export function utf8Bytes(text) {
  const out = [];
  for (let i = 0; i < text.length; i += 1) {
    let code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        i += 1;
      } else {
        code = 0xfffd;
      }
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      code = 0xfffd;
    }

    if (code < 0x80) {
      out.push(code);
    } else if (code < 0x800) {
      out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* SHA-1 (FIPS 180-4)                                                  */
/* ------------------------------------------------------------------ */

const rotl = (value, shift) => ((value << shift) | (value >>> (32 - shift))) >>> 0;

/**
 * SHA-1 over an array of byte values. Returns 40 lowercase hex characters.
 */
export function sha1Bytes(bytes) {
  const message = bytes.slice();
  const bitLength = message.length * 8;

  message.push(0x80);
  while (message.length % 64 !== 56) message.push(0);

  // 64-bit big-endian length. Password inputs never approach 2^32 bits, but the
  // high word is written correctly anyway rather than assumed zero.
  const high = Math.floor(bitLength / 4294967296);
  const low = bitLength >>> 0;
  message.push(
    (high >>> 24) & 0xff,
    (high >>> 16) & 0xff,
    (high >>> 8) & 0xff,
    high & 0xff,
    (low >>> 24) & 0xff,
    (low >>> 16) & 0xff,
    (low >>> 8) & 0xff,
    low & 0xff,
  );

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const w = new Array(80);

  for (let offset = 0; offset < message.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      w[i] =
        ((message[offset + i * 4] << 24) |
          (message[offset + i * 4 + 1] << 16) |
          (message[offset + i * 4 + 2] << 8) |
          message[offset + i * 4 + 3]) >>>
        0;
    }
    for (let i = 16; i < 80; i += 1) {
      w[i] = rotl(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let i = 0; i < 80; i += 1) {
      let f;
      let k;
      if (i < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const temp = (rotl(a, 5) + (f >>> 0) + e + k + w[i]) >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  return [h0, h1, h2, h3, h4].map((word) => word.toString(16).padStart(8, "0")).join("");
}

/** SHA-1 of a string's UTF-8 bytes, as 40 lowercase hex characters. */
export function sha1Hex(text) {
  return sha1Bytes(utf8Bytes(text));
}

/* ------------------------------------------------------------------ */
/* Range endpoints                                                     */
/* ------------------------------------------------------------------ */

export const RANGE_ENDPOINTS = [
  {
    key: "pwnedpasswords",
    label: "Pwned Passwords range API",
    base: "https://api.pwnedpasswords.com/range/",
    note: "Returns SUFFIX:COUNT lines for every stored SHA-1 sharing your 5-character prefix.",
  },
  {
    key: "pwnedpasswords-padded",
    label: "Pwned Passwords range API (padded)",
    base: "https://api.pwnedpasswords.com/range/",
    header: "Add-Padding: true",
    note: "Same response plus filler entries with a count of 0, so response size leaks nothing about the bucket.",
  },
];

export const PREFIX_LENGTH = 5;
export const SUFFIX_LENGTH = 35;
export const DIGEST_HEX_LENGTH = 40;

/* ------------------------------------------------------------------ */
/* Step 1 and 2 — build the lookup                                     */
/* ------------------------------------------------------------------ */

/**
 * Turn a candidate password into everything needed for a k-anonymity lookup.
 *
 * @param {string} password raw candidate, used exactly as typed
 * @param {{ padded?: boolean }} [options]
 * @returns {{error: string}|object}
 */
export function buildPrefixLookup(password, options = {}) {
  if (typeof password !== "string") {
    return { error: "Enter a password as text." };
  }
  if (password.length === 0) {
    return { error: "Enter a password to hash. An empty string has nothing to look up." };
  }

  const padded = options.padded === true;
  const hash = sha1Hex(password).toUpperCase();
  const prefix = hash.slice(0, PREFIX_LENGTH);
  const suffix = hash.slice(PREFIX_LENGTH);
  const endpoint = padded ? RANGE_ENDPOINTS[1] : RANGE_ENDPOINTS[0];
  const url = `${endpoint.base}${prefix}`;

  const byteLength = utf8Bytes(password).length;

  return {
    password,
    characterCount: password.length,
    byteLength,
    hash,
    prefix,
    suffix,
    url,
    endpointKey: endpoint.key,
    endpointLabel: endpoint.label,
    padded,
    curl: padded
      ? `curl -s -H 'Add-Padding: true' '${url}'`
      : `curl -s '${url}'`,
    // Exact, not estimated: 5 hex characters is 5 x 4 bits.
    bitsDisclosed: PREFIX_LENGTH * 4,
    bitsWithheld: DIGEST_HEX_LENGTH * 4 - PREFIX_LENGTH * 4,
    possiblePrefixes: 16 ** PREFIX_LENGTH,
    grepCommand: `${padded ? `curl -s -H 'Add-Padding: true' '${url}'` : `curl -s '${url}'`} | grep -i '^${suffix}:'`,
  };
}

/**
 * Build lookups for several candidates at once — one per non-empty line.
 * Duplicate lines are kept, because a duplicate is a real finding in a list.
 *
 * @param {string} text newline-separated candidates
 * @param {{ padded?: boolean }} [options]
 */
export function buildPrefixBatch(text, options = {}) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { error: "Enter at least one password, one per line." };
  }
  const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) {
    return { error: "Enter at least one password, one per line." };
  }

  const rows = lines.map((line) => buildPrefixLookup(line, options));
  const usable = rows.filter((row) => !row.error);
  if (usable.length === 0) {
    return { error: "None of those lines contained a password to hash." };
  }

  const prefixes = [];
  for (const row of usable) {
    if (!prefixes.includes(row.prefix)) prefixes.push(row.prefix);
  }

  return {
    rows: usable,
    total: usable.length,
    skipped: rows.length - usable.length,
    distinctPrefixes: prefixes.length,
    // Distinct requests you would make; candidates sharing a prefix ride along
    // in the same response for free.
    requestsRequired: prefixes.length,
  };
}

/* ------------------------------------------------------------------ */
/* Step 4 — resolve the response locally                               */
/* ------------------------------------------------------------------ */

const HEX_35 = /^[0-9A-F]{35}$/;

/**
 * Parse a range API response body and find the given suffix in it.
 *
 * The body is a list of "SUFFIX:COUNT" lines. Padded responses include filler
 * rows with a count of 0, which are counted separately and never reported as a
 * match.
 *
 * @param {string} responseText raw body pasted by the user
 * @param {string} suffix the 35-character suffix to look for
 */
export function analyzeRangeResponse(responseText, suffix) {
  if (typeof suffix !== "string" || !HEX_35.test(suffix.trim().toUpperCase())) {
    return { error: "Hash a password first — the suffix must be 35 hexadecimal characters." };
  }
  if (typeof responseText !== "string" || responseText.trim().length === 0) {
    return { error: "Paste the response body from the range request." };
  }

  const target = suffix.trim().toUpperCase();
  const lines = responseText.split(/\r?\n/);

  let parsed = 0;
  let malformed = 0;
  let padding = 0;
  let match = null;
  const seen = new Set();
  let duplicates = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (line.length === 0) continue;
    const colon = line.indexOf(":");
    if (colon === -1) {
      malformed += 1;
      continue;
    }
    const candidate = line.slice(0, colon).trim().toUpperCase();
    const countText = line.slice(colon + 1).trim().replace(/,/g, "");
    if (!HEX_35.test(candidate) || !/^\d+$/.test(countText)) {
      malformed += 1;
      continue;
    }
    const count = Number.parseInt(countText, 10);
    if (!Number.isFinite(count)) {
      malformed += 1;
      continue;
    }
    parsed += 1;
    if (seen.has(candidate)) duplicates += 1;
    seen.add(candidate);
    if (count === 0) padding += 1;
    if (candidate === target && count > 0) {
      match = { suffix: candidate, count };
    }
  }

  if (parsed === 0) {
    return {
      error:
        "No SUFFIX:COUNT lines found. The body should be lines of 35 hex characters, a colon, then a number.",
    };
  }

  return {
    parsedLines: parsed,
    malformedLines: malformed,
    paddingLines: padding,
    realLines: parsed - padding,
    duplicateLines: duplicates,
    found: match !== null,
    count: match ? match.count : 0,
    suffix: target,
  };
}

/**
 * Read the prefix back out of a pasted response, if the user also pasted the
 * request URL above it. Returns null when no URL is present — this never
 * guesses, because the response body itself does not contain the prefix.
 */
export function extractPrefixFromRequest(text) {
  if (typeof text !== "string") return null;
  const match = text.match(/range\/([0-9A-Fa-f]{5})\b/);
  return match ? match[1].toUpperCase() : null;
}
