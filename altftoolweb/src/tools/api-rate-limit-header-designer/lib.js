/**
 * API rate limit header designer.
 *
 * Standards encoded:
 *  - RFC 6585 §4 defines the 429 (Too Many Requests) status code and says the
 *    response MAY include a Retry-After header.
 *  - RFC 9110 §10.2.3 defines Retry-After as either an HTTP-date or a
 *    non-negative integer of seconds.
 *  - draft-ietf-httpapi-ratelimit-headers (IETF HTTPAPI WG; structured-field
 *    syntax from draft -08 onward) defines:
 *      RateLimit-Policy: "<name>";q=<quota>;w=<window-seconds>
 *      RateLimit:        "<name>";r=<remaining>;t=<seconds-until-reset>
 *  - The legacy de-facto convention (GitHub, Twitter/X, many gateways) uses
 *    X-RateLimit-Limit / X-RateLimit-Remaining / X-RateLimit-Reset. GitHub
 *    sends Reset as a Unix epoch timestamp; the delta-seconds form used here
 *    avoids clock coupling (noted in the output).
 *  - RFC 9457 (Problem Details for HTTP APIs) shapes the 429 JSON body with
 *    type/title/status/detail members and application/problem+json.
 */

export const HEADER_STYLES = [
  { id: "ietf", label: "IETF draft RateLimit headers (structured fields)" },
  { id: "legacy", label: "Legacy X-RateLimit-* headers" },
  { id: "both", label: "Both (emit IETF + legacy during migration)" },
];

/** RFC 6585: the status code for throttled requests. */
export const STATUS_TOO_MANY_REQUESTS = 429;

/** RFC 9457 recommended media type for the error body. */
export const PROBLEM_MEDIA_TYPE = "application/problem+json";

const MAX_WINDOW_SECONDS = 31_536_000; // one year — larger windows are configuration errors

function toPosInt(value, label) {
  const n = Number(value);
  if (!Number.isFinite(n)) return { error: `${label} must be a number.` };
  if (!Number.isInteger(n)) return { error: `${label} must be a whole number.` };
  if (n <= 0) return { error: `${label} must be greater than zero.` };
  return { value: n };
}

/**
 * Build the header sets and sample responses.
 *
 * @param {object} input
 * @param {"ietf"|"legacy"|"both"} input.style
 * @param {number} input.limit          Requests allowed per window (quota).
 * @param {number} input.windowSeconds  Window length in seconds.
 * @param {number} input.remaining      Remaining quota in the success example.
 * @param {number} [input.resetSeconds] Seconds until the window resets (default: windowSeconds).
 * @param {string} [input.policyName]   Quota policy name for the IETF headers.
 * @param {string} [input.docsUrl]      URL used as the RFC 9457 problem "type".
 * @returns {{successHeaders, limitedHeaders, problemBody, notes, requestsPerSecond} | {error}}
 */
export function buildRateLimitDesign({
  style,
  limit,
  windowSeconds,
  remaining,
  resetSeconds,
  policyName = "default",
  docsUrl = "",
}) {
  if (!HEADER_STYLES.some((s) => s.id === style)) {
    return { error: "Choose a header style." };
  }

  const lim = toPosInt(limit, "Limit (requests per window)");
  if (lim.error) return { error: lim.error };
  const win = toPosInt(windowSeconds, "Window length in seconds");
  if (win.error) return { error: win.error };
  if (win.value > MAX_WINDOW_SECONDS) {
    return { error: "Window length above one year is almost certainly a mistake." };
  }

  const rem = Number(remaining);
  if (!Number.isInteger(rem) || rem < 0) {
    return { error: "Remaining requests must be a whole number of 0 or more." };
  }
  if (rem > lim.value) {
    return { error: `Remaining (${rem}) cannot exceed the limit (${lim.value}).` };
  }

  const reset =
    resetSeconds === undefined || resetSeconds === null || resetSeconds === ""
      ? win.value
      : Number(resetSeconds);
  if (!Number.isInteger(reset) || reset < 0) {
    return { error: "Seconds until reset must be a whole number of 0 or more." };
  }
  if (reset > win.value) {
    return { error: `Seconds until reset (${reset}) cannot exceed the window length (${win.value}).` };
  }

  const name = String(policyName).trim() || "default";
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return { error: "Policy name may only contain letters, digits, dots, dashes and underscores." };
  }

  const url = String(docsUrl).trim();
  if (url && !/^https?:\/\/\S+$/.test(url)) {
    return { error: "The documentation URL must start with http:// or https://." };
  }

  const ietfPolicy = ["RateLimit-Policy", `"${name}";q=${lim.value};w=${win.value}`];
  const ietfState = (r, t) => ["RateLimit", `"${name}";r=${r};t=${t}`];
  const legacySet = (r, t) => [
    ["X-RateLimit-Limit", String(lim.value)],
    ["X-RateLimit-Remaining", String(r)],
    ["X-RateLimit-Reset", String(t)],
  ];

  const successHeaders = [];
  const limitedHeaders = [];

  if (style === "ietf" || style === "both") {
    successHeaders.push(ietfPolicy, ietfState(rem, reset));
    limitedHeaders.push(ietfPolicy, ietfState(0, reset));
  }
  if (style === "legacy" || style === "both") {
    successHeaders.push(...legacySet(rem, reset));
    limitedHeaders.push(...legacySet(0, reset));
  }
  // RFC 6585 + RFC 9110: Retry-After in delta-seconds on the 429.
  limitedHeaders.push(["Retry-After", String(Math.max(1, reset))]);

  const problemBody = {
    type: url || "about:blank",
    title: "Too Many Requests",
    status: STATUS_TOO_MANY_REQUESTS,
    detail: `Rate limit of ${lim.value} requests per ${win.value} seconds exceeded. Retry after ${Math.max(1, reset)} seconds.`,
  };

  const notes = [
    "Send the headers on every response, not only on 429s — clients can then pace themselves before being cut off.",
    "X-RateLimit-Reset is emitted as delta-seconds here; GitHub's variant sends a Unix epoch timestamp instead, so document which one you mean.",
  ];
  if (style === "both") {
    notes.push("Emitting both families doubles header bytes — plan a deprecation date for the X- headers.");
  }
  if (style === "ietf") {
    notes.push("The IETF RateLimit fields are still an Internet-Draft; pin the draft revision you implement in your API docs.");
  }

  return {
    successHeaders,
    limitedHeaders,
    problemBody,
    problemJson: JSON.stringify(problemBody, null, 2),
    requestsPerSecond: Math.round((lim.value / win.value) * 1000) / 1000,
    notes,
  };
}
