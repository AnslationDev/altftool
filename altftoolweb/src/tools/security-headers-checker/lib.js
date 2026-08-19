/**
 * Security Headers Checker — pure logic.
 *
 * Parses a pasted HTTP response header block and grades it against the
 * defensive response headers a browser actually acts on. No network access,
 * no randomness, no clock: the same paste always produces the same report.
 *
 * Scoring is a fixed published rubric (see SCORE_RUBRIC). Checks that do not
 * apply to a response (cookie flags when no Set-Cookie was sent) contribute
 * nothing to the denominator, so the percentage is always earned / applicable.
 */

const ONE_YEAR = 31536000;

export const SCORE_RUBRIC = [
  ["Content-Security-Policy", 20],
  ["Strict-Transport-Security", 15],
  ["X-Content-Type-Options", 10],
  ["Framing protection", 10],
  ["Referrer-Policy", 10],
  ["Permissions-Policy", 5],
  ["Cross-Origin-Opener-Policy", 5],
  ["Cross-Origin-Resource-Policy", 5],
  ["No version disclosure", 5],
  ["No obsolete security headers", 5],
  ["Cookie flags (only when Set-Cookie is present)", 10],
];

export const GRADE_BANDS = [
  [95, "A+"],
  [90, "A"],
  [80, "B"],
  [70, "C"],
  [60, "D"],
  [0, "F"],
];

const DISCLOSURE_HEADERS = [
  ["server", "Server"],
  ["x-powered-by", "X-Powered-By"],
  ["x-aspnet-version", "X-AspNet-Version"],
  ["x-aspnetmvc-version", "X-AspNetMvc-Version"],
  ["x-runtime", "X-Runtime"],
  ["x-generator", "X-Generator"],
  ["x-drupal-cache", "X-Drupal-Cache"],
  ["liferay-portal", "Liferay-Portal"],
];

const OBSOLETE_HEADERS = [
  ["public-key-pins", "Public-Key-Pins", "HPKP was removed from every major browser; a bad pin set can lock users out of the site."],
  ["public-key-pins-report-only", "Public-Key-Pins-Report-Only", "HPKP reporting was removed alongside enforcement and is ignored."],
  ["expect-ct", "Expect-CT", "Expect-CT was retired in June 2021; Certificate Transparency is enforced by default now."],
  ["p3p", "P3P", "P3P policies are ignored by every current browser and were historically abused to loosen cookie handling in IE."],
  ["x-webkit-csp", "X-WebKit-CSP", "A pre-standard CSP header no browser reads; use Content-Security-Policy."],
  ["x-content-security-policy", "X-Content-Security-Policy", "A pre-standard CSP header no browser reads; use Content-Security-Policy."],
];

const STRICT_REFERRER = [
  "no-referrer",
  "same-origin",
  "strict-origin",
  "strict-origin-when-cross-origin",
];

const WEAK_REFERRER = [
  "no-referrer-when-downgrade",
  "origin",
  "origin-when-cross-origin",
];

const FETCH_DIRECTIVES = new Set([
  "default-src",
  "script-src",
  "script-src-elem",
  "script-src-attr",
  "style-src",
  "style-src-elem",
  "style-src-attr",
  "img-src",
  "font-src",
  "connect-src",
  "media-src",
  "object-src",
  "frame-src",
  "child-src",
  "worker-src",
  "manifest-src",
  "prefetch-src",
]);

const KNOWN_DIRECTIVES = new Set([
  ...FETCH_DIRECTIVES,
  "base-uri",
  "form-action",
  "frame-ancestors",
  "sandbox",
  "report-uri",
  "report-to",
  "upgrade-insecure-requests",
  "block-all-mixed-content",
  "require-trusted-types-for",
  "trusted-types",
]);

const SOURCE_LABELS = {
  "'none'": "nothing at all",
  "'self'": "the page's own origin",
  "'unsafe-inline'": "inline code in the markup",
  "'unsafe-eval'": "eval() and friends",
  "'unsafe-hashes'": "inline event handlers matching a listed hash",
  "'strict-dynamic'": "anything loaded by an already-trusted script",
  "'wasm-unsafe-eval'": "WebAssembly compilation",
  "'report-sample'": "(reporting option, not a source)",
  "*": "ANY host over any scheme",
  "data:": "data: URIs",
  "blob:": "blob: URIs",
  "filesystem:": "filesystem: URIs",
  "https:": "ANY host over https",
  "http:": "ANY host over http, including plaintext",
  "ws:": "ANY plaintext WebSocket host",
  "wss:": "ANY secure WebSocket host",
};

const isNonce = (token) => /^'nonce-[A-Za-z0-9+/_=-]+'$/i.test(token);
const isHash = (token) => /^'sha(256|384|512)-[A-Za-z0-9+/_=-]+'$/i.test(token);

/** Human sentence for one CSP source expression. */
export function describeSource(token) {
  const lower = token.toLowerCase();
  if (SOURCE_LABELS[lower]) return SOURCE_LABELS[lower];
  if (isNonce(token)) return "scripts carrying the matching nonce";
  if (isHash(token)) return "inline code matching the listed hash";
  if (lower.startsWith("'")) return `the keyword ${token}`;
  return `${token}`;
}

/** Human sentence for a whole directive. */
export function describeDirective(name, values) {
  if (name === "upgrade-insecure-requests") return "rewrites http:// subresource requests to https:// before they are sent.";
  if (name === "block-all-mixed-content") return "blocks plaintext subresources (superseded by upgrade-insecure-requests).";
  if (name === "sandbox") {
    return values.length
      ? `applies an iframe-style sandbox to the document, re-enabling: ${values.join(", ")}.`
      : "applies a full iframe-style sandbox to the document.";
  }
  if (name === "report-uri" || name === "report-to") {
    return `sends violation reports to ${values.join(", ") || "(nothing — the value is empty)"}.`;
  }
  if (!values.length) return "has an empty value, which blocks every source for this directive.";
  const listed = values.map(describeSource);
  const verb = name === "frame-ancestors" ? "allows framing by" : name === "form-action" ? "allows form submissions to" : "allows";
  return `${verb} ${listed.join(", ")}.`;
}

/**
 * Split a raw header block into entries.
 * Handles curl -v "< " prefixes, HTTP status lines and obs-fold continuations.
 */
export function parseHeaderBlock(text) {
  if (typeof text !== "string" || !text.trim()) {
    return { error: "Paste an HTTP response header block first." };
  }
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const headers = [];
  const malformed = [];
  let statusLine = null;
  let previous = null;

  for (const raw of lines) {
    let line = raw;
    let folded = /^[ \t]/.test(line);
    const prefix = line.match(/^[ \t]*[<>][ \t]?/);
    if (prefix) {
      line = line.slice(prefix[0].length);
      folded = /^[ \t]/.test(line);
    }
    if (!line.trim()) {
      previous = null;
      continue;
    }
    const trimmed = line.trim();
    if (/^HTTP\/[0-9.]+\s+\d{3}/i.test(trimmed)) {
      if (!statusLine) statusLine = trimmed;
      previous = null;
      continue;
    }
    if (folded && previous) {
      previous.value = `${previous.value} ${trimmed}`.trim();
      continue;
    }
    const colon = line.indexOf(":");
    const name = colon > 0 ? line.slice(0, colon).trim() : "";
    if (!name || !/^[A-Za-z0-9!#$%&'*+.^_`|~-]+$/.test(name)) {
      malformed.push(trimmed);
      previous = null;
      continue;
    }
    const entry = { name, key: name.toLowerCase(), value: line.slice(colon + 1).trim() };
    headers.push(entry);
    previous = entry;
  }

  if (!headers.length) {
    return {
      error:
        "No usable header lines found. Each line needs to look like `Name: value` — paste the output of curl -I, or copy the response headers from the browser network panel.",
    };
  }
  return { statusLine, headers, malformed };
}

const valuesOf = (headers, key) => headers.filter((h) => h.key === key).map((h) => h.value);
const firstOf = (headers, key) => {
  const list = valuesOf(headers, key);
  return list.length ? list[0] : null;
};

/** Parse Strict-Transport-Security into its three fields. */
export function parseHsts(value) {
  const result = { maxAge: null, includeSubDomains: false, preload: false, invalid: [] };
  for (const part of String(value).split(";")) {
    const token = part.trim();
    if (!token) continue;
    const eq = token.indexOf("=");
    const name = (eq >= 0 ? token.slice(0, eq) : token).trim().toLowerCase();
    const raw = eq >= 0 ? token.slice(eq + 1).trim().replace(/^"|"$/g, "") : "";
    if (name === "max-age") {
      if (/^\d+$/.test(raw)) result.maxAge = Number(raw);
      else result.invalid.push(`max-age=${raw || "(empty)"} is not a whole number of seconds, so the whole header is ignored`);
    } else if (name === "includesubdomains") {
      result.includeSubDomains = true;
    } else if (name === "preload") {
      result.preload = true;
    } else {
      result.invalid.push(`unrecognised directive "${token}"`);
    }
  }
  return result;
}

/** Parse a Content-Security-Policy value into ordered directives. */
export function parseCsp(value) {
  const directives = [];
  const duplicates = [];
  const seen = new Set();
  for (const chunk of String(value).split(";")) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    const tokens = trimmed.split(/\s+/);
    const name = tokens[0].toLowerCase();
    if (seen.has(name)) {
      duplicates.push(name);
      continue;
    }
    seen.add(name);
    directives.push({
      name,
      values: tokens.slice(1),
      known: KNOWN_DIRECTIVES.has(name),
      description: describeDirective(name, tokens.slice(1)),
    });
  }
  return { directives, duplicates };
}

/** Parse one Set-Cookie value into its name and security-relevant attributes. */
export function parseSetCookie(value) {
  const parts = String(value).split(";");
  const first = parts[0] || "";
  const eq = first.indexOf("=");
  const name = (eq >= 0 ? first.slice(0, eq) : first).trim();
  const cookie = {
    name: name || "(unnamed)",
    secure: false,
    httpOnly: false,
    sameSite: null,
    path: null,
    domain: null,
    issues: [],
  };
  for (let i = 1; i < parts.length; i += 1) {
    const attr = parts[i].trim();
    if (!attr) continue;
    const aeq = attr.indexOf("=");
    const key = (aeq >= 0 ? attr.slice(0, aeq) : attr).trim().toLowerCase();
    const val = aeq >= 0 ? attr.slice(aeq + 1).trim() : "";
    if (key === "secure") cookie.secure = true;
    else if (key === "httponly") cookie.httpOnly = true;
    else if (key === "samesite") cookie.sameSite = val;
    else if (key === "path") cookie.path = val;
    else if (key === "domain") cookie.domain = val;
  }
  if (!cookie.secure) cookie.issues.push("no Secure — it will be sent over plaintext http");
  if (!cookie.httpOnly) cookie.issues.push("no HttpOnly — script on the page can read it");
  if (!cookie.sameSite) {
    cookie.issues.push("no SameSite — browsers default to Lax, so state it explicitly");
  } else if (cookie.sameSite.toLowerCase() === "none" && !cookie.secure) {
    cookie.issues.push("SameSite=None without Secure is rejected outright");
  }
  if (cookie.name.startsWith("__Host-")) {
    if (!cookie.secure) cookie.issues.push("__Host- prefix requires Secure");
    if (cookie.path !== "/") cookie.issues.push("__Host- prefix requires Path=/");
    if (cookie.domain) cookie.issues.push("__Host- prefix forbids a Domain attribute");
  }
  if (cookie.name.startsWith("__Secure-") && !cookie.secure) {
    cookie.issues.push("__Secure- prefix requires Secure");
  }
  return cookie;
}

function makeCheck(id, header, status, earned, max, summary, notes) {
  return { id, header, status, earned, max, summary, notes: notes || [] };
}

function checkHsts(headers) {
  const all = valuesOf(headers, "strict-transport-security");
  if (!all.length) {
    return makeCheck(
      "hsts",
      "Strict-Transport-Security",
      "fail",
      0,
      15,
      "Missing. Browsers will happily try http:// for this host on the next visit.",
      ["Suggested: Strict-Transport-Security: max-age=31536000; includeSubDomains"],
    );
  }
  const parsed = parseHsts(all[0]);
  const notes = [...parsed.invalid];
  if (all.length > 1) notes.push(`Sent ${all.length} times — only the first value is described here.`);
  if (parsed.maxAge === null) {
    return makeCheck("hsts", "Strict-Transport-Security", "fail", 0, 15, "Present but max-age is missing or malformed, so the browser discards the whole header.", notes);
  }
  if (parsed.maxAge === 0) {
    return makeCheck("hsts", "Strict-Transport-Security", "fail", 0, 15, "max-age=0 actively tells the browser to forget the HSTS entry for this host.", notes);
  }
  let earned = parsed.maxAge >= ONE_YEAR ? 12 : 6;
  if (parsed.includeSubDomains) earned += 2;
  if (parsed.preload) earned += 1;
  const days = Math.floor(parsed.maxAge / 86400);
  notes.push(`max-age=${parsed.maxAge} is ${days} day${days === 1 ? "" : "s"} of forced https for this host.`);
  notes.push(parsed.includeSubDomains ? "includeSubDomains covers every subdomain too." : "No includeSubDomains — subdomains can still be reached over http.");
  if (parsed.preload && (!parsed.includeSubDomains || parsed.maxAge < ONE_YEAR)) {
    notes.push("preload is listed, but the HSTS preload list requires max-age of at least 31536000 plus includeSubDomains, so submission would be rejected.");
  }
  const status = earned >= 14 ? "pass" : "partial";
  return makeCheck("hsts", "Strict-Transport-Security", status, earned, 15, parsed.maxAge >= ONE_YEAR ? "Enforced for a year or more." : "Enforced, but for less than the recommended one year.", notes);
}

function effectiveSources(map, name, fallback) {
  if (map.has(name)) return { values: map.get(name), from: name };
  if (fallback && map.has(fallback)) return { values: map.get(fallback), from: fallback };
  return { values: null, from: null };
}

function checkCsp(headers) {
  const enforced = valuesOf(headers, "content-security-policy");
  const reportOnly = valuesOf(headers, "content-security-policy-report-only");
  if (!enforced.length && !reportOnly.length) {
    return {
      check: makeCheck("csp", "Content-Security-Policy", "fail", 0, 20, "Missing. Nothing constrains where scripts, styles, frames or form posts may come from.", [
        "A starting point: Content-Security-Policy: default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
      ]),
      directives: [],
      duplicates: [],
      reportOnly: false,
    };
  }
  const usingReportOnly = !enforced.length;
  const raw = usingReportOnly ? reportOnly[0] : enforced[0];
  const { directives, duplicates } = parseCsp(raw);
  const map = new Map(directives.map((d) => [d.name, d.values]));
  const notes = [];
  let earned = usingReportOnly ? 4 : 8;

  if (usingReportOnly) {
    notes.push("Only Content-Security-Policy-Report-Only was sent — violations are reported but nothing is blocked.");
  }
  if (enforced.length > 1) {
    notes.push(`Content-Security-Policy appears ${enforced.length} times. Browsers enforce every policy, so the effective rule is the intersection — the strictest of them wins.`);
  }
  if (duplicates.length) {
    notes.push(`Repeated directive(s) inside one policy: ${duplicates.join(", ")}. Only the first occurrence of each is used.`);
  }

  const script = effectiveSources(map, "script-src", "default-src");
  if (!script.values) {
    notes.push("Neither script-src nor default-src is set, so script loading is unrestricted.");
  } else {
    const tokens = script.values.map((v) => v.toLowerCase());
    const hasNonceOrHash = script.values.some((v) => isNonce(v) || isHash(v));
    const inlineAllowed = tokens.includes("'unsafe-inline'") && !hasNonceOrHash;
    const wideOpen = tokens.includes("*") || tokens.includes("https:") || tokens.includes("http:") || tokens.includes("data:");
    if (!inlineAllowed && !wideOpen) earned += 4;
    if (inlineAllowed) notes.push(`${script.from} allows 'unsafe-inline' with no nonce or hash beside it, so any injected <script> in the markup executes.`);
    if (tokens.includes("'unsafe-inline'") && hasNonceOrHash) {
      notes.push(`${script.from} lists 'unsafe-inline' next to a nonce or hash — CSP level 3 browsers ignore 'unsafe-inline' in that case, so it only affects very old browsers.`);
    }
    if (wideOpen) notes.push(`${script.from} includes a blanket source (*, https:, http: or data:), which defeats most of the point of the allowlist.`);
    if (!tokens.includes("'unsafe-eval'")) earned += 3;
    else notes.push(`${script.from} allows 'unsafe-eval', so eval(), new Function() and string setTimeout keep working.`);
  }

  const object = effectiveSources(map, "object-src", "default-src");
  if (object.values && object.values.map((v) => v.toLowerCase()).includes("'none'")) earned += 2;
  else notes.push("object-src is not 'none' — plugin content (<object>, <embed>) is a classic XSS bypass and should be blocked outright.");

  if (map.has("base-uri")) earned += 2;
  else notes.push("No base-uri, so an injected <base> tag can re-point every relative script URL on the page.");

  if (map.has("frame-ancestors")) earned += 1;
  else notes.push("No frame-ancestors, so CSP is not contributing any clickjacking protection.");

  if (!map.has("form-action")) notes.push("No form-action — an injected form can post your fields to any origin.");

  const status = earned >= 18 ? "pass" : earned >= 10 ? "partial" : "fail";
  const summary = usingReportOnly
    ? "Report-only: violations are collected, nothing is enforced."
    : `${directives.length} directive${directives.length === 1 ? "" : "s"} enforced.`;
  return {
    check: makeCheck("csp", usingReportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy", status, earned, 20, summary, notes),
    directives,
    duplicates,
    reportOnly: usingReportOnly,
  };
}

function checkNosniff(headers) {
  const value = firstOf(headers, "x-content-type-options");
  if (value === null) {
    return makeCheck("nosniff", "X-Content-Type-Options", "fail", 0, 10, "Missing. Browsers may sniff a response body and run it as a type you never declared.", [
      "Suggested: X-Content-Type-Options: nosniff",
    ]);
  }
  if (value.trim().toLowerCase() === "nosniff") {
    return makeCheck("nosniff", "X-Content-Type-Options", "pass", 10, 10, "nosniff — the declared Content-Type is the only one the browser will use.", []);
  }
  return makeCheck("nosniff", "X-Content-Type-Options", "fail", 0, 10, `Value "${value}" is not recognised; the only valid value is nosniff.`, []);
}

function checkFraming(headers, cspDirectives) {
  const xfo = firstOf(headers, "x-frame-options");
  const ancestors = cspDirectives.find((d) => d.name === "frame-ancestors");
  const notes = [];
  if (ancestors) {
    const tokens = ancestors.values.map((v) => v.toLowerCase());
    const tight = tokens.includes("'none'") || tokens.includes("'self'");
    if (xfo) notes.push(`X-Frame-Options: ${xfo} is also present. Where both are sent, browsers obey CSP frame-ancestors and ignore X-Frame-Options.`);
    if (tokens.includes("*")) {
      return makeCheck("framing", "CSP frame-ancestors", "fail", 0, 10, "frame-ancestors * allows any site to frame this page.", notes);
    }
    notes.push(`frame-ancestors ${ancestors.values.join(" ")}`);
    return makeCheck("framing", "CSP frame-ancestors", tight ? "pass" : "partial", tight ? 10 : 7, 10, tight ? "Framing is restricted by CSP." : "Framing is limited to a named allowlist.", notes);
  }
  if (!xfo) {
    return makeCheck("framing", "X-Frame-Options / frame-ancestors", "fail", 0, 10, "Neither CSP frame-ancestors nor X-Frame-Options is set, so this page can be framed by anyone.", [
      "Suggested: Content-Security-Policy: frame-ancestors 'none' (plus X-Frame-Options: DENY for older browsers)",
    ]);
  }
  const normalised = xfo.trim().toUpperCase();
  if (normalised === "DENY" || normalised === "SAMEORIGIN") {
    notes.push("X-Frame-Options is obsolete but still honoured; add CSP frame-ancestors as the modern equivalent.");
    return makeCheck("framing", "X-Frame-Options", "partial", 8, 10, `${normalised} blocks framing, via the legacy header only.`, notes);
  }
  if (normalised.startsWith("ALLOW-FROM")) {
    return makeCheck("framing", "X-Frame-Options", "fail", 0, 10, "ALLOW-FROM was never supported by Chrome or Safari and is ignored — the page is effectively framable.", [
      "Use Content-Security-Policy: frame-ancestors https://example.com instead.",
    ]);
  }
  return makeCheck("framing", "X-Frame-Options", "fail", 0, 10, `Value "${xfo}" is not a valid X-Frame-Options token (DENY or SAMEORIGIN).`, notes);
}

function checkReferrer(headers) {
  const value = firstOf(headers, "referrer-policy");
  if (value === null) {
    return makeCheck("referrer", "Referrer-Policy", "fail", 0, 10, "Missing. Chrome and Firefox default to strict-origin-when-cross-origin, but older browsers leak the full URL.", [
      "Suggested: Referrer-Policy: strict-origin-when-cross-origin",
    ]);
  }
  const tokens = value.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  let last = null;
  for (let i = tokens.length - 1; i >= 0; i -= 1) {
    if (tokens[i] === "unsafe-url" || STRICT_REFERRER.includes(tokens[i]) || WEAK_REFERRER.includes(tokens[i])) {
      last = tokens[i];
      break;
    }
  }
  const notes = tokens.length > 1 && last !== null ? [`Several policies listed; the browser uses the last one it understands, here "${last}".`] : [];
  if (last !== null) {
    if (last === "unsafe-url") {
      return makeCheck("referrer", "Referrer-Policy", "fail", 0, 10, "unsafe-url sends the full path and query to every destination, including plaintext ones.", notes);
    }
    if (STRICT_REFERRER.includes(last)) {
      return makeCheck("referrer", "Referrer-Policy", "pass", 10, 10, `${last} — cross-origin requests never carry the path or query.`, notes);
    }
    if (WEAK_REFERRER.includes(last)) {
      notes.push("This value still sends the origin (or more) cross-origin; strict-origin-when-cross-origin is the usual choice.");
      return makeCheck("referrer", "Referrer-Policy", "partial", 5, 10, `${last} — a valid but loose policy.`, notes);
    }
  }
  return makeCheck("referrer", "Referrer-Policy", "fail", 0, 10, `"${value}" is not a Referrer-Policy token, so the browser falls back to its default.`, notes);
}

function checkPermissions(headers) {
  const value = firstOf(headers, "permissions-policy");
  const legacy = firstOf(headers, "feature-policy");
  if (value === null && legacy === null) {
    return makeCheck("permissions", "Permissions-Policy", "fail", 0, 5, "Missing. Every powerful feature (camera, microphone, geolocation, payment) stays available to this document and its iframes.", [
      "Suggested: Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()",
    ]);
  }
  if (value === null) {
    return makeCheck("permissions", "Feature-Policy", "partial", 2, 5, "Only the superseded Feature-Policy header is present; current browsers read Permissions-Policy.", []);
  }
  const features = value.split(",").map((t) => t.trim()).filter(Boolean);
  const disabled = features.filter((f) => /=\s*\(\s*\)\s*$/.test(f)).map((f) => f.split("=")[0].trim());
  const openGrant = features.filter((f) => {
    const eq = f.indexOf("=");
    const allow = eq >= 0 ? f.slice(eq + 1).trim() : "";
    return allow === "*" || /\(\s*\*\s*\)/.test(allow) || /=\s*\*/.test(f);
  });
  if (!features.length) {
    return makeCheck("permissions", "Permissions-Policy", "fail", 0, 5, "Present but empty — no features are listed, so nothing is actually constrained.", []);
  }
  const notes = [`${features.length} feature${features.length === 1 ? "" : "s"} listed.`];
  if (disabled.length) notes.push(`Fully disabled: ${disabled.join(", ")}.`);
  if (openGrant.length) {
    notes.push(`Opened to * (any origin): ${openGrant.map((f) => f.split("=")[0].trim()).join(", ")}.`);
    return makeCheck("permissions", "Permissions-Policy", "partial", 2, 5, "Present, but at least one feature is granted to * (any origin), which is close to not constraining it at all.", notes);
  }
  return makeCheck("permissions", "Permissions-Policy", "pass", 5, 5, "Present — listed features are constrained for this document and its frames.", notes);
}

function checkCoop(headers) {
  const value = firstOf(headers, "cross-origin-opener-policy");
  if (value === null) {
    return makeCheck("coop", "Cross-Origin-Opener-Policy", "fail", 0, 5, "Missing. A window this page opens (or that opened it) keeps a cross-origin handle to it.", [
      "Suggested: Cross-Origin-Opener-Policy: same-origin",
    ]);
  }
  const token = value.trim().toLowerCase().split(/[;\s]/)[0];
  if (token === "same-origin") return makeCheck("coop", "Cross-Origin-Opener-Policy", "pass", 5, 5, "same-origin — the browsing context group is isolated from cross-origin openers.", []);
  if (token === "same-origin-allow-popups") return makeCheck("coop", "Cross-Origin-Opener-Policy", "partial", 3, 5, "same-origin-allow-popups keeps references to windows this page opens itself.", []);
  if (token === "noopener-allow-popups") return makeCheck("coop", "Cross-Origin-Opener-Policy", "partial", 4, 5, "noopener-allow-popups severs the opener link while still permitting popups.", []);
  if (token === "unsafe-none") return makeCheck("coop", "Cross-Origin-Opener-Policy", "fail", 0, 5, "unsafe-none is the default and provides no isolation at all.", []);
  return makeCheck("coop", "Cross-Origin-Opener-Policy", "fail", 0, 5, `"${value}" is not a COOP token, so the browser falls back to unsafe-none.`, []);
}

function checkCorp(headers) {
  const value = firstOf(headers, "cross-origin-resource-policy");
  if (value === null) {
    return makeCheck("corp", "Cross-Origin-Resource-Policy", "fail", 0, 5, "Missing. Other origins may embed this response as a subresource, which is the ingredient Spectre-style attacks need.", [
      "Suggested: Cross-Origin-Resource-Policy: same-origin (or same-site for shared assets)",
    ]);
  }
  const token = value.trim().toLowerCase();
  if (token === "same-origin") return makeCheck("corp", "Cross-Origin-Resource-Policy", "pass", 5, 5, "same-origin — no other origin can load this response as a subresource.", []);
  if (token === "same-site") return makeCheck("corp", "Cross-Origin-Resource-Policy", "pass", 5, 5, "same-site — only your own site can embed this response.", []);
  if (token === "cross-origin") return makeCheck("corp", "Cross-Origin-Resource-Policy", "partial", 2, 5, "cross-origin deliberately opts out. Correct for a public CDN asset, wrong for a document or API response.", []);
  return makeCheck("corp", "Cross-Origin-Resource-Policy", "fail", 0, 5, `"${value}" is not a CORP token.`, []);
}

function checkCoep(headers) {
  const value = firstOf(headers, "cross-origin-embedder-policy");
  if (value === null) {
    return makeCheck("coep", "Cross-Origin-Embedder-Policy", "info", 0, 0, "Not set. Only needed if you want cross-origin isolation for SharedArrayBuffer or precise timers.", []);
  }
  const token = value.trim().toLowerCase().split(/[;\s]/)[0];
  if (token === "require-corp" || token === "credentialless") {
    return makeCheck("coep", "Cross-Origin-Embedder-Policy", "info", 0, 0, `${token} — combined with COOP: same-origin this document is cross-origin isolated.`, []);
  }
  return makeCheck("coep", "Cross-Origin-Embedder-Policy", "info", 0, 0, `${value} — unsafe-none is the default and grants no isolation.`, []);
}

function checkDisclosure(headers) {
  const found = [];
  for (const [key, label] of DISCLOSURE_HEADERS) {
    for (const value of valuesOf(headers, key)) {
      const versioned = key === "x-runtime" ? false : /\d/.test(value);
      found.push({ label, value, versioned });
    }
  }
  if (!found.length) {
    return makeCheck("disclosure", "Version disclosure", "pass", 5, 5, "No banner headers naming your server software or its version.", []);
  }
  const versioned = found.filter((f) => f.versioned);
  const notes = found.map((f) => `${f.label}: ${f.value}${f.versioned ? "  ← includes a version number" : ""}`);
  if (!versioned.length) {
    return makeCheck("disclosure", "Version disclosure", "partial", 3, 5, "Software is named but no version number is exposed.", notes);
  }
  return makeCheck("disclosure", "Version disclosure", "warn", 0, 5, "A version number is advertised, which lets a scanner match known CVEs without probing.", notes);
}

function checkObsolete(headers) {
  const notes = [];
  for (const [key, label, why] of OBSOLETE_HEADERS) {
    if (valuesOf(headers, key).length) notes.push(`${label} — ${why}`);
  }
  const xss = firstOf(headers, "x-xss-protection");
  if (xss !== null && xss.trim() !== "0") {
    notes.push(`X-XSS-Protection: ${xss} — the legacy XSS auditor was removed from Chrome and Edge, and the "1; mode=block" form introduced its own information-leak bugs. Send 0 or drop the header.`);
  }
  if (!notes.length) {
    return makeCheck("obsolete", "Obsolete headers", "pass", 5, 5, "No retired or pre-standard security headers present.", []);
  }
  return makeCheck("obsolete", "Obsolete headers", "warn", 0, 5, `${notes.length} retired header${notes.length === 1 ? "" : "s"} still being sent.`, notes);
}

function checkCookies(headers) {
  const raw = valuesOf(headers, "set-cookie");
  if (!raw.length) {
    return { check: makeCheck("cookies", "Set-Cookie flags", "info", 0, 0, "No Set-Cookie in this response, so cookie flags are not scored.", []), cookies: [] };
  }
  const cookies = raw.map(parseSetCookie);
  const allSecure = cookies.every((c) => c.secure);
  const allHttpOnly = cookies.every((c) => c.httpOnly);
  const allSameSite = cookies.every((c) => c.sameSite);
  const earned = (allSecure ? 4 : 0) + (allHttpOnly ? 3 : 0) + (allSameSite ? 3 : 0);
  const notes = cookies.map((c) => (c.issues.length ? `${c.name}: ${c.issues.join("; ")}` : `${c.name}: Secure, HttpOnly, SameSite=${c.sameSite}`));
  const status = earned === 10 ? "pass" : earned === 0 ? "fail" : "partial";
  return {
    check: makeCheck("cookies", "Set-Cookie flags", status, earned, 10, `${cookies.length} cookie${cookies.length === 1 ? "" : "s"} set in this response.`, notes),
    cookies,
  };
}

function checkCors(headers) {
  const origin = firstOf(headers, "access-control-allow-origin");
  const credentials = firstOf(headers, "access-control-allow-credentials");
  if (origin === null && credentials === null) return null;
  const notes = [];
  if (origin !== null) notes.push(`Access-Control-Allow-Origin: ${origin}`);
  if (credentials !== null) notes.push(`Access-Control-Allow-Credentials: ${credentials}`);
  const wildcard = origin !== null && origin.trim() === "*";
  const creds = credentials !== null && credentials.trim().toLowerCase() === "true";
  if (wildcard && creds) {
    notes.push("A wildcard origin with credentials is rejected by browsers outright — and if the wildcard is really a reflected Origin header, any site can read authenticated responses.");
    return makeCheck("cors", "CORS exposure", "fail", 0, 0, "Access-Control-Allow-Origin: * together with Allow-Credentials: true is an invalid and dangerous combination.", notes);
  }
  if (wildcard) {
    return makeCheck("cors", "CORS exposure", "warn", 0, 0, "Any origin may read this response. Fine for public data, wrong for anything user-specific.", notes);
  }
  if (creds) {
    notes.push("Check that the allowed origin is chosen from a fixed allowlist rather than reflected from the request's Origin header.");
    return makeCheck("cors", "CORS exposure", "warn", 0, 0, "Credentialed cross-origin reads are permitted for the named origin.", notes);
  }
  return makeCheck("cors", "CORS exposure", "info", 0, 0, "CORS headers present and restricted to a named origin.", notes);
}

export function gradeFor(percent) {
  for (const [floor, letter] of GRADE_BANDS) {
    if (percent >= floor) return letter;
  }
  return "F";
}

/** Main entry point. */
export function analyzeHeaders(text) {
  const parsed = parseHeaderBlock(text);
  if (parsed.error) return { error: parsed.error };

  const { headers, statusLine, malformed } = parsed;
  const cspResult = checkCsp(headers);
  const cookieResult = checkCookies(headers);

  const checks = [
    cspResult.check,
    checkHsts(headers),
    checkNosniff(headers),
    checkFraming(headers, cspResult.directives),
    checkReferrer(headers),
    checkPermissions(headers),
    checkCoop(headers),
    checkCorp(headers),
    checkCoep(headers),
    checkDisclosure(headers),
    checkObsolete(headers),
    cookieResult.check,
  ];
  const cors = checkCors(headers);
  if (cors) checks.push(cors);

  const earned = checks.reduce((sum, c) => sum + c.earned, 0);
  const applicable = checks.reduce((sum, c) => sum + c.max, 0);
  const percent = applicable > 0 ? Math.round((earned / applicable) * 100) : 0;
  const grade = gradeFor(percent);

  const counts = { pass: 0, partial: 0, fail: 0, warn: 0, info: 0 };
  for (const c of checks) counts[c.status] += 1;

  const duplicateHeaders = [];
  const seen = new Map();
  for (const h of headers) seen.set(h.key, (seen.get(h.key) || 0) + 1);
  for (const [key, count] of seen) {
    if (count > 1 && key !== "set-cookie") duplicateHeaders.push({ name: key, count });
  }

  return {
    statusLine,
    headerCount: headers.length,
    headers,
    malformed,
    duplicateHeaders,
    checks,
    cspDirectives: cspResult.directives,
    cspReportOnly: cspResult.reportOnly,
    cookies: cookieResult.cookies,
    earned,
    applicable,
    percent,
    grade,
    counts,
  };
}

const STATUS_MARK = { pass: "OK  ", partial: "~   ", fail: "FAIL", warn: "WARN", info: "info" };

/** Plain-text report for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [];
  lines.push("SECURITY HEADERS REPORT");
  if (result.statusLine) lines.push(result.statusLine);
  lines.push(`${result.headerCount} header lines parsed`);
  lines.push(`Score ${result.earned}/${result.applicable} (${result.percent}%) — grade ${result.grade}`);
  lines.push("");
  for (const check of result.checks) {
    lines.push(`[${STATUS_MARK[check.status] || "    "}] ${check.header} — ${check.earned}/${check.max}`);
    lines.push(`         ${check.summary}`);
    for (const note of check.notes) lines.push(`         · ${note}`);
  }
  if (result.cspDirectives.length) {
    lines.push("");
    lines.push(`CSP DIRECTIVES${result.cspReportOnly ? " (report-only)" : ""}`);
    for (const d of result.cspDirectives) {
      lines.push(`  ${d.name} ${d.values.join(" ")}`.trimEnd());
      lines.push(`      ${d.description}`);
    }
  }
  lines.push("");
  lines.push("Parsed locally in the browser. No request was made to any host, so this reflects only the text you pasted.");
  return lines.join("\n");
}

export const SAMPLE_HEADERS = `HTTP/2 200
date: Mon, 20 Jul 2026 09:14:02 GMT
content-type: text/html; charset=utf-8
server: nginx/1.24.0
x-powered-by: Express
strict-transport-security: max-age=15552000
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.example.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
referrer-policy: no-referrer-when-downgrade
x-xss-protection: 1; mode=block
set-cookie: sid=8f2c1a; Path=/; HttpOnly; SameSite=Lax
set-cookie: theme=dark; Path=/
access-control-allow-origin: *
cache-control: no-store`;
