/**
 * CORS configuration linter.
 *
 * Parses real HTTP response header lines and evaluates them against the WHATWG
 * Fetch standard's CORS protocol: the `Access-Control-*` response headers, the
 * CORS-preflight fetch checks, and the wildcard/credentials incompatibility.
 *
 * Pure module: no network, no clock, no randomness. The same paste always
 * produces the same findings. It reasons about what a browser will do with the
 * headers you paste — it cannot and does not contact the server.
 */

export const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"];

/** Methods that never need a preflight (Fetch: CORS-safelisted method). */
export const SAFELISTED_METHODS = ["GET", "HEAD", "POST"];

/** Request headers a page may send cross-origin without a preflight. */
export const SAFELISTED_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "content-language",
  "content-type",
  "range",
];

/** Content-Type essences that keep a request "simple". */
export const SAFELISTED_CONTENT_TYPES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain",
];

/** Header names a script is forbidden from setting, so allow-listing them is pointless. */
export const FORBIDDEN_REQUEST_HEADERS = [
  "accept-charset",
  "accept-encoding",
  "access-control-request-headers",
  "access-control-request-method",
  "connection",
  "content-length",
  "cookie",
  "cookie2",
  "date",
  "dnt",
  "expect",
  "host",
  "keep-alive",
  "origin",
  "referer",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "via",
];

/** Response headers the CORS protocol defines. Anything else `Access-Control-*` is a typo. */
export const KNOWN_CORS_RESPONSE_HEADERS = [
  "access-control-allow-origin",
  "access-control-allow-credentials",
  "access-control-allow-methods",
  "access-control-allow-headers",
  "access-control-expose-headers",
  "access-control-max-age",
  "access-control-allow-private-network",
];

/** Headers that belong on the *request*, not the response. */
export const CORS_REQUEST_HEADERS = [
  "access-control-request-method",
  "access-control-request-headers",
  "access-control-request-private-network",
];

/** Documented upper bounds browsers apply to Access-Control-Max-Age, in seconds. */
export const MAX_AGE_CAPS = [
  { browser: "Chromium", cap: 7200 },
  { browser: "Firefox", cap: 86400 },
  { browser: "WebKit / Safari", cap: 600 },
];

/** Response headers exposed cross-origin without being named in Expose-Headers. */
export const CORS_SAFELISTED_RESPONSE_HEADERS = [
  "cache-control",
  "content-language",
  "content-length",
  "content-type",
  "expires",
  "last-modified",
  "pragma",
];

/* ------------------------------------------------------------------ */
/* Header parsing                                                      */
/* ------------------------------------------------------------------ */

/**
 * Parse a block of raw response headers.
 * Handles the status line, obs-fold continuation lines and repeated headers.
 */
export function parseHeaderBlock(text) {
  const source = String(text == null ? "" : text).replace(/\r\n/g, "\n");
  const lines = source.split("\n");
  const entries = [];
  const malformed = [];
  let status = null;

  lines.forEach((line, index) => {
    if (!line.trim()) return;

    const statusMatch = /^HTTP\/(\d(?:\.\d)?|\d)\s+(\d{3})(?:\s+(.*))?$/i.exec(line.trim());
    if (statusMatch && entries.length === 0) {
      status = { protocol: `HTTP/${statusMatch[1]}`, code: Number(statusMatch[2]), text: (statusMatch[3] || "").trim() };
      return;
    }

    if (/^[ \t]/.test(line) && entries.length) {
      entries[entries.length - 1].value += ` ${line.trim()}`;
      return;
    }

    const colon = line.indexOf(":");
    if (colon < 1) {
      malformed.push({ line: index + 1, text: line.trim() });
      return;
    }
    const name = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (!/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(name)) {
      malformed.push({ line: index + 1, text: line.trim() });
      return;
    }
    entries.push({ name, lower: name.toLowerCase(), value });
  });

  const byName = new Map();
  entries.forEach((entry) => {
    const list = byName.get(entry.lower) || [];
    list.push(entry.value);
    byName.set(entry.lower, list);
  });

  return { status, entries, malformed, byName };
}

/** First value of a header, or null. */
function firstValue(byName, name) {
  const list = byName.get(name);
  return list && list.length ? list[0] : null;
}

/** Split a comma-separated header value into trimmed, non-empty tokens. */
export function splitList(value) {
  if (value == null) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Origin values                                                       */
/* ------------------------------------------------------------------ */

/**
 * Classify an Access-Control-Allow-Origin value. Browsers compare it to the
 * request's Origin byte-for-byte, so anything that is not a bare serialized
 * origin can never match.
 */
export function classifyOriginValue(value) {
  if (value == null) return { kind: "missing" };
  const raw = String(value).trim();
  if (raw === "") return { kind: "invalid", reason: "the header is present but empty" };
  if (raw === "*") return { kind: "wildcard" };
  if (raw === "null") return { kind: "null" };
  if (raw.includes(",")) return { kind: "invalid", reason: "it lists more than one origin, which the header does not allow" };
  if (/\s/.test(raw)) return { kind: "invalid", reason: "it contains whitespace" };
  if (raw.includes("*")) return { kind: "invalid", reason: "wildcards inside an origin (such as https://*.example.com) are not supported" };

  const match = /^([A-Za-z][A-Za-z0-9+.\-]*):\/\/([^/?#]*)(.*)$/.exec(raw);
  if (!match) return { kind: "invalid", reason: "it is not in scheme://host[:port] form" };
  const [, scheme, authority, rest] = match;
  if (rest !== "") return { kind: "invalid", reason: `it carries a path or trailing slash ("${rest}"), and an origin has neither` };
  if (!authority) return { kind: "invalid", reason: "the host is empty" };
  if (authority.includes("@")) return { kind: "invalid", reason: "it contains userinfo, which an origin never has" };
  const portSplit = /^(.*?)(?::(\d*))?$/.exec(authority);
  const host = portSplit[1];
  const port = portSplit[2];
  if (port !== undefined && !/^\d+$/.test(port)) return { kind: "invalid", reason: "the port is not numeric" };
  if (raw !== raw.toLowerCase() && raw.toLowerCase().startsWith(`${scheme.toLowerCase()}://`)) {
    return { kind: "origin", scheme: scheme.toLowerCase(), host, port, mixedCase: true };
  }
  return { kind: "origin", scheme: scheme.toLowerCase(), host, port, mixedCase: false };
}

/* ------------------------------------------------------------------ */
/* Simple-request and preflight logic                                  */
/* ------------------------------------------------------------------ */

/** Strip parameters from a Content-Type and lowercase the essence. */
export function contentTypeEssence(value) {
  return String(value == null ? "" : value).split(";")[0].trim().toLowerCase();
}

/**
 * Decide whether a request needs a CORS preflight, per the Fetch standard.
 * Returns { required: boolean, reasons: string[] }.
 */
export function preflightRequired({ method, headers, contentType }) {
  const reasons = [];
  const upper = String(method || "").toUpperCase();
  if (!SAFELISTED_METHODS.includes(upper)) {
    reasons.push(`${upper || "(no method)"} is not a CORS-safelisted method (GET, HEAD, POST).`);
  }
  headers.forEach((header) => {
    const lower = header.toLowerCase();
    if (!SAFELISTED_REQUEST_HEADERS.includes(lower)) {
      reasons.push(`"${header}" is not a CORS-safelisted request header.`);
    }
  });
  const essence = contentTypeEssence(contentType);
  const sendsContentType = headers.some((header) => header.toLowerCase() === "content-type");
  if (sendsContentType && essence && !SAFELISTED_CONTENT_TYPES.includes(essence)) {
    reasons.push(`Content-Type "${essence}" is outside the safelisted set (${SAFELISTED_CONTENT_TYPES.join(", ")}).`);
  }
  return { required: reasons.length > 0, reasons };
}

/**
 * Run the Fetch standard's CORS checks for one concrete request against the
 * parsed response headers. Returns an ordered list of pass/fail checks.
 */
export function evaluateRequest({ cors, origin, method, headers, credentials }) {
  const checks = [];
  const upperMethod = String(method || "").toUpperCase();
  const originClass = classifyOriginValue(cors.allowOrigin);

  // 1. Origin check
  if (cors.allowOriginCount > 1) {
    checks.push({
      name: "Origin allowed",
      pass: false,
      detail: `Access-Control-Allow-Origin is present ${cors.allowOriginCount} times. A repeated Allow-Origin is a protocol failure and the browser blocks the response.`,
    });
  } else if (originClass.kind === "missing") {
    checks.push({ name: "Origin allowed", pass: false, detail: "No Access-Control-Allow-Origin header, so the browser blocks the response entirely." });
  } else if (originClass.kind === "invalid") {
    checks.push({ name: "Origin allowed", pass: false, detail: `Access-Control-Allow-Origin is malformed — ${originClass.reason}.` });
  } else if (originClass.kind === "wildcard") {
    if (credentials) {
      checks.push({ name: "Origin allowed", pass: false, detail: 'With credentials included, "*" is rejected: the header must name the exact origin.' });
    } else {
      checks.push({ name: "Origin allowed", pass: true, detail: '"*" matches any origin because credentials are not included.' });
    }
  } else if (cors.allowOrigin === origin) {
    checks.push({ name: "Origin allowed", pass: true, detail: `Allow-Origin matches the request Origin exactly (${origin}).` });
  } else {
    checks.push({
      name: "Origin allowed",
      pass: false,
      detail: `Allow-Origin is "${cors.allowOrigin}" but the request Origin is "${origin}". The comparison is byte-for-byte, so this fails.`,
    });
  }

  // 2. Credentials check
  if (credentials) {
    const ok = cors.allowCredentialsRaw !== null && cors.allowCredentialsRaw.trim() === "true";
    checks.push({
      name: "Credentials allowed",
      pass: ok,
      detail: ok
        ? "Access-Control-Allow-Credentials is exactly \"true\"."
        : cors.allowCredentialsRaw === null
          ? "The request sends credentials but there is no Access-Control-Allow-Credentials header."
          : `Access-Control-Allow-Credentials is "${cors.allowCredentialsRaw}". Only the lowercase string "true" counts; anything else means false.`,
    });
  }

  const needsPreflight = preflightRequired({ method: upperMethod, headers, contentType: cors.probeContentType });

  // 3. Method check (preflight only)
  if (needsPreflight.required) {
    if (SAFELISTED_METHODS.includes(upperMethod)) {
      checks.push({ name: "Method allowed", pass: true, detail: `${upperMethod} is CORS-safelisted, so it passes even if Allow-Methods omits it.` });
    } else if (cors.allowMethods.length === 0) {
      checks.push({ name: "Method allowed", pass: false, detail: "The preflight response carries no Access-Control-Allow-Methods header." });
    } else if (cors.allowMethods.includes("*")) {
      if (credentials) {
        checks.push({ name: "Method allowed", pass: false, detail: 'With credentials included, "*" in Allow-Methods is read as a literal method named "*", not a wildcard.' });
      } else {
        checks.push({ name: "Method allowed", pass: true, detail: '"*" in Allow-Methods matches any method because credentials are not included.' });
      }
    } else {
      const ok = cors.allowMethods.some((item) => item.toUpperCase() === upperMethod);
      checks.push({
        name: "Method allowed",
        pass: ok,
        detail: ok
          ? `${upperMethod} appears in Allow-Methods.`
          : `${upperMethod} is not in Allow-Methods (${cors.allowMethods.join(", ")}).`,
      });
    }

    // 4. Header check (preflight only)
    const unmatched = [];
    headers.forEach((header) => {
      const lower = header.toLowerCase();
      if (SAFELISTED_REQUEST_HEADERS.includes(lower)) return;
      const listed = cors.allowHeaders.some((item) => item.toLowerCase() === lower);
      if (listed) return;
      const wildcarded = cors.allowHeaders.includes("*") && !credentials && lower !== "authorization";
      if (wildcarded) return;
      unmatched.push(header);
    });
    checks.push({
      name: "Request headers allowed",
      pass: unmatched.length === 0,
      detail:
        unmatched.length === 0
          ? headers.length
            ? "Every request header is safelisted or named in Access-Control-Allow-Headers."
            : "The request sets no custom headers."
          : `Not permitted by Access-Control-Allow-Headers: ${unmatched.join(", ")}.`,
    });
  }

  return {
    checks,
    preflight: needsPreflight,
    allowed: checks.every((check) => check.pass),
  };
}

/* ------------------------------------------------------------------ */
/* Findings                                                            */
/* ------------------------------------------------------------------ */

function buildFindings({ cors, parsed, origin, credentials, evaluation }) {
  const findings = [];
  const add = (severity, title, detail, fix, header) => findings.push({ severity, title, detail, fix, header });
  const originClass = classifyOriginValue(cors.allowOrigin);
  const allowOriginCount = (parsed.byName.get("access-control-allow-origin") || []).length;
  const credentialsAllowed = cors.allowCredentialsRaw !== null && cors.allowCredentialsRaw.trim() === "true";
  const reflected = originClass.kind === "origin" && cors.allowOrigin === origin;

  if (allowOriginCount > 1) {
    add(
      "critical",
      "Access-Control-Allow-Origin is sent more than once",
      `The response carries ${allowOriginCount} Allow-Origin headers (${(parsed.byName.get("access-control-allow-origin") || []).join(" | ")}). Browsers treat a repeated Allow-Origin as a protocol failure and block the response, even if one of the values is correct.`,
      "Emit exactly one Access-Control-Allow-Origin. A duplicate usually means both your app and a reverse proxy are adding it.",
      "Access-Control-Allow-Origin",
    );
  }

  if (originClass.kind === "missing") {
    add(
      "critical",
      "No Access-Control-Allow-Origin header",
      "Without this header a browser will not let cross-origin JavaScript read the response at all. If the resource is meant to be public API surface, this is the header that is missing.",
      "Add Access-Control-Allow-Origin with either the exact calling origin or, for genuinely public data, *.",
      "Access-Control-Allow-Origin",
    );
  } else if (originClass.kind === "invalid") {
    add(
      "critical",
      "Access-Control-Allow-Origin is malformed",
      `The value "${cors.allowOrigin}" is not usable: ${originClass.reason}. The browser compares this header to the request's Origin byte-for-byte, so a malformed value never matches anything.`,
      "Send a bare serialized origin: scheme, ://, host, and an optional :port. No path, no trailing slash, no comma-separated list, no wildcard inside the host.",
      "Access-Control-Allow-Origin",
    );
  } else if (originClass.kind === "origin" && originClass.mixedCase) {
    add(
      "medium",
      "Allow-Origin is not lowercase",
      `"${cors.allowOrigin}" contains uppercase characters. Browsers serialize the Origin header in lowercase, and the match is byte-for-byte, so a mixed-case value will not match.`,
      "Lowercase the scheme and host.",
      "Access-Control-Allow-Origin",
    );
  }

  if (originClass.kind === "wildcard" && credentialsAllowed) {
    add(
      "critical",
      "Wildcard origin combined with credentials",
      'Access-Control-Allow-Origin is "*" while Access-Control-Allow-Credentials is "true". The Fetch standard forbids this pairing: a credentialed request against this response is blocked outright, so the endpoint is broken for its intended callers while still advertising an open policy.',
      "Echo one specific, allow-listed origin instead of *, and keep Allow-Credentials only if cookies or TLS client certs are genuinely required.",
      "Access-Control-Allow-Origin",
    );
  }

  if (originClass.kind === "wildcard" && !credentialsAllowed) {
    add(
      "info",
      "Origin is open to everyone",
      'Access-Control-Allow-Origin is "*", so any site can read this response with an uncredentialed request. That is correct for public, unauthenticated data and wrong for anything that varies per user, sits behind an IP allow-list, or lives on an internal network.',
      "If the data is not genuinely public, replace * with an allow-list check.",
      "Access-Control-Allow-Origin",
    );
  }

  if (originClass.kind === "null") {
    add(
      credentialsAllowed ? "critical" : "high",
      'Access-Control-Allow-Origin is "null"',
      `An Origin of null is sent by sandboxed iframes, data: and file: documents, and by some redirects — all of which an attacker can create on a page they control. Allow-listing it hands cross-origin read access to any such document.${credentialsAllowed ? " With Allow-Credentials true this becomes a direct route to authenticated data." : ""}`,
      "Never allow-list the literal string null. If a sandboxed frame legitimately needs access, give it a real origin with allow-same-origin.",
      "Access-Control-Allow-Origin",
    );
  }

  if (reflected) {
    add(
      credentialsAllowed ? "medium" : "info",
      "Confirm the origin allow-list is an equality check",
      `Allow-Origin came back as exactly the Origin you supplied (${origin}). That is what both a correct allow-list and a blind origin reflector look like, and headers alone cannot tell them apart.${credentialsAllowed ? ' Allow-Credentials is "true", so if this server does reflect, any website could read authenticated responses on behalf of a logged-in visitor — the single most damaging CORS bug there is.' : ""}`,
      "Re-capture with Origin: https://cors-probe.invalid, and again with a suffix lookalike such as https://yourdomain.com.attacker.test. If either comes back echoed in Allow-Origin, the check is matching on substring or regex rather than equality, and this is confirmed critical.",
      "Access-Control-Allow-Origin",
    );
  }

  if (originClass.kind === "origin" && !cors.varyValues.some((item) => item.toLowerCase() === "origin")) {
    add(
      "high",
      "Vary: Origin is missing",
      "The Allow-Origin value is origin-specific but the response does not vary on Origin. Any shared cache — a CDN, a reverse proxy, even the browser's own HTTP cache — can store the response for one origin and hand it to a request from another, which both breaks legitimate callers and can leak an Allow-Origin header meant for someone else.",
      "Add Vary: Origin to every response whose Allow-Origin depends on the request.",
      "Vary",
    );
  }

  if (cors.allowCredentialsRaw !== null && !credentialsAllowed) {
    add(
      "medium",
      "Allow-Credentials is set to something other than \"true\"",
      `The value is "${cors.allowCredentialsRaw}". The Fetch standard accepts only the exact lowercase byte sequence "true"; "True", "1", "yes" and "TRUE" are all read as false, so credentialed requests will fail even though the header looks configured.`,
      "Send Access-Control-Allow-Credentials: true, lowercase, or drop the header.",
      "Access-Control-Allow-Credentials",
    );
  }

  if (credentialsAllowed && originClass.kind === "missing") {
    add(
      "high",
      "Credentials allowed but no origin allowed",
      "Access-Control-Allow-Credentials is true while Access-Control-Allow-Origin is absent. Nothing can use this: the credentials header only has meaning alongside an origin the browser accepts.",
      "Either add a specific Allow-Origin or remove the credentials header.",
      "Access-Control-Allow-Credentials",
    );
  }

  if (cors.allowMethods.includes("*") && credentialsAllowed) {
    add(
      "high",
      'Allow-Methods uses "*" with credentials',
      'When credentials are included the wildcard loses its meaning: the browser looks for a method literally named "*" and finds none, so every non-safelisted method is refused.',
      "List the methods explicitly: Access-Control-Allow-Methods: GET, POST, PUT, DELETE.",
      "Access-Control-Allow-Methods",
    );
  }

  if (cors.allowHeaders.includes("*") && credentialsAllowed) {
    add(
      "high",
      'Allow-Headers uses "*" with credentials',
      'With credentials included the wildcard is treated as a literal header name, so every custom request header is rejected at preflight.',
      "Name the headers you accept explicitly.",
      "Access-Control-Allow-Headers",
    );
  }

  if (cors.allowHeaders.includes("*") && !cors.allowHeaders.some((item) => item.toLowerCase() === "authorization")) {
    add(
      "medium",
      'Authorization is not covered by "*"',
      'The Fetch standard singles out Authorization: it is the one request header a wildcard in Access-Control-Allow-Headers does not cover. A preflight for a request carrying an Authorization header will fail unless the header is named.',
      "Send Access-Control-Allow-Headers: Authorization, * — or list every header you accept.",
      "Access-Control-Allow-Headers",
    );
  }

  if (cors.exposeHeaders.includes("*") && credentialsAllowed) {
    add(
      "medium",
      'Expose-Headers uses "*" with credentials',
      'The wildcard is literal when credentials are included, so no response headers beyond the seven CORS-safelisted ones are readable by the calling script.',
      "List the response headers you intend to expose.",
      "Access-Control-Expose-Headers",
    );
  }

  cors.allowMethods.forEach((method) => {
    if (method !== "*" && method !== method.toUpperCase()) {
      add(
        "medium",
        `Allow-Methods lists "${method}" in lowercase`,
        "The browser normalizes standard methods to uppercase before comparing them to this list, so a lowercase token can fail the preflight check.",
        `Write it as ${method.toUpperCase()}.`,
        "Access-Control-Allow-Methods",
      );
    }
  });

  const stateChanging = cors.allowMethods.filter((method) => ["PUT", "DELETE", "PATCH"].includes(method.toUpperCase()));
  if (stateChanging.length && originClass.kind === "wildcard") {
    add(
      "medium",
      "State-changing methods are open to every origin",
      `Allow-Methods permits ${stateChanging.join(", ")} while Allow-Origin is "*". Any site can issue these requests; they will not carry cookies, but they will carry any credential passed in a URL, a bearer token the caller already holds, or the caller's network position if this host is internal.`,
      "Restrict the origin, or move the write endpoints behind an origin allow-list.",
      "Access-Control-Allow-Methods",
    );
  }

  if (cors.maxAgeRaw !== null) {
    if (cors.maxAge === null) {
      add(
        "low",
        "Access-Control-Max-Age is not a valid integer",
        `The value "${cors.maxAgeRaw}" cannot be parsed as a number of seconds, so browsers fall back to their default (5 seconds in Chromium) and preflight every request.`,
        "Send a plain integer count of seconds.",
        "Access-Control-Max-Age",
      );
    } else if (cors.maxAge < 0) {
      add(
        "low",
        "Access-Control-Max-Age is negative",
        `A negative max-age disables preflight caching, so every cross-origin call pays for an extra OPTIONS round trip.`,
        "Use a positive value such as 600.",
        "Access-Control-Max-Age",
      );
    } else if (cors.maxAge > 600) {
      add(
        "info",
        "Access-Control-Max-Age exceeds some browser caps",
        `${cors.maxAge} seconds is clamped by every engine: ${MAX_AGE_CAPS.map((item) => `${item.browser} caps at ${item.cap}s (effective ${Math.min(cors.maxAge, item.cap)}s)`).join("; ")}. A large value is harmless but does not do what it says.`,
        "Pick a value at or under 600 seconds if you want consistent behaviour across engines.",
        "Access-Control-Max-Age",
      );
    }
  }

  if (cors.allowPrivateNetworkRaw !== null && cors.allowPrivateNetworkRaw.trim() === "true") {
    add(
      originClass.kind === "wildcard" ? "critical" : "high",
      "Private Network Access is granted",
      `Access-Control-Allow-Private-Network: true lets a public website reach this host even though it sits on a private or loopback address.${originClass.kind === "wildcard" ? ' Combined with Allow-Origin "*", every site on the internet can reach this internal service through a visitor\'s browser.' : ""}`,
      "Only send this header for the specific origins that genuinely need to reach the device, never with a wildcard origin.",
      "Access-Control-Allow-Private-Network",
    );
  }

  if (cors.timingAllowOrigin === "*") {
    add(
      "info",
      "Timing-Allow-Origin is open",
      "Any origin can read this resource's detailed Resource Timing entries — DNS, connect and response timings. That is normally fine for a CDN asset and undesirable for an endpoint whose response time leaks whether a record exists.",
      "Drop the header on endpoints whose timing is sensitive.",
      "Timing-Allow-Origin",
    );
  }

  const exposedSensitive = cors.exposeHeaders.filter((item) => ["set-cookie", "set-cookie2", "authorization"].includes(item.toLowerCase()));
  if (exposedSensitive.length) {
    add(
      "medium",
      "Sensitive headers named in Expose-Headers",
      `${exposedSensitive.join(", ")} is listed for exposure. Set-Cookie is a forbidden response-header name and browsers refuse to expose it, so this line is at best dead configuration and at worst a sign the policy was copied without review.`,
      "Remove them.",
      "Access-Control-Expose-Headers",
    );
  }

  const pointless = cors.allowHeaders.filter((item) => FORBIDDEN_REQUEST_HEADERS.includes(item.toLowerCase()));
  if (pointless.length) {
    add(
      "info",
      "Allow-Headers lists headers a script cannot set",
      `${pointless.join(", ")} are forbidden request headers: the browser sets them itself and JavaScript cannot override them, so allow-listing them has no effect.`,
      "Remove them to keep the policy readable.",
      "Access-Control-Allow-Headers",
    );
  }

  parsed.entries.forEach((entry) => {
    if (!entry.lower.startsWith("access-control-")) return;
    if (KNOWN_CORS_RESPONSE_HEADERS.includes(entry.lower)) return;
    if (CORS_REQUEST_HEADERS.includes(entry.lower)) {
      add(
        "low",
        `${entry.name} belongs on the request`,
        "This is a preflight request header sent by the browser. Seeing it in a response paste usually means request and response headers were captured together.",
        "Ignore it, or re-capture the response on its own.",
        entry.name,
      );
      return;
    }
    add(
      "high",
      `Unrecognised header "${entry.name}"`,
      "No CORS header has this name, so browsers ignore it completely. The policy you think is in force is not. Common slips are a singular Access-Control-Allow-Header or Access-Control-Allow-Method.",
      `Did you mean one of: ${KNOWN_CORS_RESPONSE_HEADERS.join(", ")}?`,
      entry.name,
    );
  });

  if (parsed.status && parsed.status.code >= 400 && originClass.kind !== "missing") {
    add(
      "info",
      `Response status is ${parsed.status.code}`,
      "CORS headers on an error response only help if the error is the response the browser is inspecting. A preflight must answer with a 2xx status or the whole request fails, whatever the CORS headers say.",
      "Make sure OPTIONS preflights return 200 or 204.",
      "Status",
    );
  }

  if (evaluation && !evaluation.preflight.required && (cors.allowMethods.length || cors.allowHeaders.length || cors.maxAgeRaw !== null)) {
    add(
      "info",
      "Preflight-only headers on a request that needs no preflight",
      "Allow-Methods, Allow-Headers and Max-Age are only read from a preflight response. For the simple request described here they are inert — harmless, but they can mislead whoever reads the config next.",
      "Keep them on the OPTIONS handler.",
      "Access-Control-Allow-Methods",
    );
  }

  parsed.malformed.forEach((item) => {
    add(
      "low",
      `Line ${item.line} is not a header`,
      `"${item.text}" has no colon-separated field name, so it was skipped.`,
      "Remove it or fix the field name.",
      "—",
    );
  });

  return findings.sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

export const VERDICTS = {
  blocked: { key: "blocked", label: "Browser blocks this request", tone: "danger" },
  critical: { key: "critical", label: "Critical misconfiguration", tone: "danger" },
  high: { key: "high", label: "Unsafe configuration", tone: "danger" },
  medium: { key: "medium", label: "Needs attention", tone: "warning" },
  low: { key: "low", label: "Minor issues", tone: "warning" },
  info: { key: "info", label: "No unsafe combination found", tone: "success" },
};

/**
 * Lint a CORS configuration.
 *
 * @param {object} input
 * @param {string} input.headers        Raw response header lines.
 * @param {string} input.origin         The request's Origin header value.
 * @param {string} input.method         The request method.
 * @param {string} input.requestHeaders Comma-separated custom request headers.
 * @param {string} input.contentType    The request's Content-Type, if any.
 * @param {boolean} input.credentials   Whether the request includes credentials.
 */
export function lintCors(input) {
  const options = input || {};
  const headerText = String(options.headers == null ? "" : options.headers);
  if (!headerText.trim()) {
    return { error: "Paste the response headers you want to check." };
  }

  const parsed = parseHeaderBlock(headerText);
  if (parsed.entries.length === 0) {
    return { error: "No header lines found. Each line should look like \"Access-Control-Allow-Origin: https://app.example.com\"." };
  }

  const origin = String(options.origin == null ? "" : options.origin).trim();
  const originClass = origin ? classifyOriginValue(origin) : { kind: "missing" };
  if (origin && originClass.kind !== "origin" && originClass.kind !== "null") {
    return { error: `Request Origin "${origin}" is not a valid origin — ${originClass.reason || "use scheme://host[:port]"}.` };
  }

  const method = String(options.method || "GET").trim().toUpperCase();
  if (!/^[A-Za-z]+$/.test(method)) {
    return { error: `"${options.method}" is not a valid HTTP method token.` };
  }

  const requestHeaders = splitList(options.requestHeaders);
  const badHeader = requestHeaders.find((item) => !/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(item));
  if (badHeader) {
    return { error: `"${badHeader}" is not a valid HTTP header name.` };
  }

  const maxAgeRaw = firstValue(parsed.byName, "access-control-max-age");
  const maxAge = maxAgeRaw !== null && /^-?\d+$/.test(maxAgeRaw.trim()) ? Number(maxAgeRaw.trim()) : null;

  const cors = {
    allowOrigin: firstValue(parsed.byName, "access-control-allow-origin"),
    allowOriginCount: (parsed.byName.get("access-control-allow-origin") || []).length,
    allowCredentialsRaw: firstValue(parsed.byName, "access-control-allow-credentials"),
    allowMethods: splitList(firstValue(parsed.byName, "access-control-allow-methods")),
    allowHeaders: splitList(firstValue(parsed.byName, "access-control-allow-headers")),
    exposeHeaders: splitList(firstValue(parsed.byName, "access-control-expose-headers")),
    maxAgeRaw,
    maxAge,
    allowPrivateNetworkRaw: firstValue(parsed.byName, "access-control-allow-private-network"),
    varyValues: splitList(firstValue(parsed.byName, "vary")),
    timingAllowOrigin: firstValue(parsed.byName, "timing-allow-origin"),
    probeContentType: String(options.contentType || "").trim(),
  };

  const credentials = Boolean(options.credentials);
  const evaluation = origin
    ? evaluateRequest({ cors, origin, method, headers: requestHeaders, credentials })
    : null;

  const findings = buildFindings({ cors, parsed, origin, credentials, evaluation });

  const counts = SEVERITY_ORDER.reduce((acc, level) => {
    acc[level] = findings.filter((item) => item.severity === level).length;
    return acc;
  }, {});

  let verdict = VERDICTS.info;
  if (evaluation && !evaluation.allowed) {
    verdict = VERDICTS.blocked;
  } else {
    const worst = SEVERITY_ORDER.find((level) => counts[level] > 0);
    if (worst) verdict = VERDICTS[worst];
  }

  return {
    status: parsed.status,
    cors,
    origin,
    method,
    requestHeaders,
    credentials,
    headerRows: parsed.entries.map((entry) => ({
      name: entry.name,
      value: entry.value,
      cors: entry.lower.startsWith("access-control-") || entry.lower === "vary" || entry.lower === "timing-allow-origin",
      repeated: (parsed.byName.get(entry.lower) || []).length > 1,
    })),
    evaluation,
    findings,
    counts,
    verdict,
  };
}

/** Render a lint result as a plain-text report for a ticket or a PR comment. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [];
  lines.push("CORS configuration review");
  lines.push(`Verdict: ${result.verdict.label}`);
  if (result.origin) {
    lines.push(`Request: ${result.method} from ${result.origin}${result.credentials ? " with credentials" : " without credentials"}`);
  }
  if (result.evaluation) {
    lines.push(`Preflight required: ${result.evaluation.preflight.required ? "yes" : "no"}`);
    result.evaluation.checks.forEach((check) => {
      lines.push(`  [${check.pass ? "PASS" : "FAIL"}] ${check.name} — ${check.detail}`);
    });
  }
  lines.push("");
  lines.push(`Findings: ${result.findings.length}`);
  result.findings.forEach((finding, index) => {
    lines.push(`${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title} (${finding.header})`);
    lines.push(`   ${finding.detail}`);
    lines.push(`   Fix: ${finding.fix}`);
  });
  return lines.join("\n");
}
