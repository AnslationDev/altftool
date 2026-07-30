/**
 * Content Security Policy auditor.
 *
 * Parses a real CSP header value into directives, resolves the CSP Level 3
 * fallback chain (script-src-elem → script-src → default-src, and so on),
 * describes what each effective directive actually permits, and reports the
 * weaknesses that make a policy fail to stop XSS.
 *
 * Pure module: no network, no clock, no randomness. Identical input always
 * produces identical output.
 */

export const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"];

/**
 * Every directive CSP Level 3 defines, plus the ones browsers still accept.
 * `fallback` names the directive consulted when this one is absent.
 * `metaIgnored` marks directives a <meta http-equiv> policy cannot deliver.
 */
export const DIRECTIVES = {
  "default-src": { category: "fetch", fallback: null, subject: "Any resource type that has no directive of its own" },
  "script-src": { category: "fetch", fallback: "default-src", subject: "Scripts" },
  "script-src-elem": { category: "fetch", fallback: "script-src", subject: "<script> elements" },
  "script-src-attr": { category: "fetch", fallback: "script-src", subject: "Inline event handlers (onclick and friends)" },
  "style-src": { category: "fetch", fallback: "default-src", subject: "Stylesheets" },
  "style-src-elem": { category: "fetch", fallback: "style-src", subject: "<style> and <link rel=stylesheet>" },
  "style-src-attr": { category: "fetch", fallback: "style-src", subject: "style= attributes" },
  "img-src": { category: "fetch", fallback: "default-src", subject: "Images" },
  "font-src": { category: "fetch", fallback: "default-src", subject: "Fonts" },
  "connect-src": { category: "fetch", fallback: "default-src", subject: "fetch, XHR, WebSocket, EventSource and beacon targets" },
  "media-src": { category: "fetch", fallback: "default-src", subject: "Audio and video" },
  "object-src": { category: "fetch", fallback: "default-src", subject: "Plugin content (<object>, <embed>)" },
  "manifest-src": { category: "fetch", fallback: "default-src", subject: "Web app manifests" },
  "child-src": { category: "fetch", fallback: "default-src", subject: "Workers and nested browsing contexts" },
  "frame-src": { category: "fetch", fallback: "child-src", subject: "Nested browsing contexts (<iframe>)" },
  "worker-src": { category: "fetch", fallback: "child-src", subject: "Worker, SharedWorker and ServiceWorker scripts" },
  "prefetch-src": { category: "fetch", fallback: "default-src", subject: "Prefetch and prerender targets", deprecated: true },
  "base-uri": { category: "document", fallback: null, subject: "URLs usable in <base href>" },
  "sandbox": { category: "document", fallback: null, subject: "Sandbox flags applied to the document", metaIgnored: true, tokenised: true },
  "form-action": { category: "navigation", fallback: null, subject: "Form submission targets" },
  "frame-ancestors": { category: "navigation", fallback: null, subject: "Documents allowed to frame this page", metaIgnored: true },
  "navigate-to": { category: "navigation", fallback: null, subject: "Navigation targets", deprecated: true },
  "report-uri": { category: "reporting", fallback: null, subject: "Violation report endpoint", metaIgnored: true, deprecated: true, tokenised: true },
  "report-to": { category: "reporting", fallback: null, subject: "Reporting API endpoint group", tokenised: true },
  "upgrade-insecure-requests": { category: "other", fallback: null, subject: "Rewrites http:// subresource URLs to https://", emptyValue: true },
  "block-all-mixed-content": { category: "other", fallback: null, subject: "Blocks mixed content", emptyValue: true, deprecated: true },
  "require-trusted-types-for": { category: "other", fallback: null, subject: "Trusted Types enforcement for DOM sinks", tokenised: true },
  "trusted-types": { category: "other", fallback: null, subject: "Allowed Trusted Types policy names", tokenised: true },
  "plugin-types": { category: "other", fallback: null, subject: "Permitted plugin MIME types", deprecated: true, tokenised: true },
  "referrer": { category: "other", fallback: null, subject: "Referrer policy", deprecated: true, tokenised: true },
  "require-sri-for": { category: "other", fallback: null, subject: "Subresource Integrity enforcement", deprecated: true, tokenised: true },
};

/** Source-list keywords, written with single quotes in a real policy. */
export const KEYWORDS = [
  "none",
  "self",
  "unsafe-inline",
  "unsafe-eval",
  "wasm-unsafe-eval",
  "strict-dynamic",
  "unsafe-hashes",
  "report-sample",
  "unsafe-allow-redirects",
  "inline-speculation-rules",
];

/** Sandbox tokens defined by HTML. */
export const SANDBOX_TOKENS = [
  "allow-downloads",
  "allow-forms",
  "allow-modals",
  "allow-orientation-lock",
  "allow-pointer-lock",
  "allow-popups",
  "allow-popups-to-escape-sandbox",
  "allow-presentation",
  "allow-same-origin",
  "allow-scripts",
  "allow-storage-access-by-user-activation",
  "allow-top-navigation",
  "allow-top-navigation-by-user-activation",
  "allow-top-navigation-to-custom-protocols",
];

/** Schemes that widen a script source list dramatically. */
export const RISKY_SCRIPT_SCHEMES = {
  "data:": "a data: URI is attacker-authored content, so this is equivalent to allowing arbitrary script",
  "blob:": "any script that can call URL.createObjectURL can mint a new executable source",
  "filesystem:": "legacy scheme with the same problem as blob:",
  "http:": "any host on the internet, over a channel a network attacker can rewrite",
  "https:": "any host on the internet",
  "*": "every host and scheme",
};

/**
 * Hosts widely documented as carrying JSONP endpoints or a copy of AngularJS.
 * Allow-listing one of them lets an attacker turn an injection into script
 * execution without ever bypassing CSP itself.
 */
export const BYPASSABLE_HOSTS = [
  { host: "ajax.googleapis.com", why: "serves AngularJS and other libraries whose templating engines execute expressions" },
  { host: "www.googleapis.com", why: "exposes JSONP callbacks" },
  { host: "googleapis.com", why: "exposes JSONP callbacks" },
  { host: "accounts.google.com", why: "exposes JSONP callbacks" },
  { host: "apis.google.com", why: "exposes JSONP callbacks" },
  { host: "www.google.com", why: "exposes JSONP callbacks" },
  { host: "google.com", why: "exposes JSONP callbacks" },
  { host: "gstatic.com", why: "serves library bundles including AngularJS" },
  { host: "www.gstatic.com", why: "serves library bundles including AngularJS" },
  { host: "cdnjs.cloudflare.com", why: "hosts every version of AngularJS and similar template engines" },
  { host: "cdn.jsdelivr.net", why: "serves arbitrary npm and GitHub content, including AngularJS" },
  { host: "unpkg.com", why: "serves arbitrary npm packages, including AngularJS" },
  { host: "ajax.aspnetcdn.com", why: "hosts AngularJS" },
  { host: "stackpath.bootstrapcdn.com", why: "hosts third-party library bundles" },
  { host: "maxcdn.bootstrapcdn.com", why: "hosts third-party library bundles" },
  { host: "rawgit.com", why: "serves arbitrary GitHub content" },
  { host: "cdn.rawgit.com", why: "serves arbitrary GitHub content" },
];

/** Base64 length, with padding, of each hash algorithm's digest. */
const HASH_LENGTHS = { "sha256": 44, "sha384": 64, "sha512": 88 };

/** A nonce needs at least 128 bits of entropy; base64 of 16 bytes is 22 characters. */
export const MIN_NONCE_CHARS = 22;

/* ------------------------------------------------------------------ */
/* Parsing                                                             */
/* ------------------------------------------------------------------ */

/**
 * Parse a serialized CSP into directives.
 * Directive names are ASCII case-insensitive; a repeated directive is ignored
 * by the browser after its first appearance.
 */
export function parsePolicy(text) {
  const source = String(text == null ? "" : text).trim();
  if (!source) return { error: "Paste a Content-Security-Policy value to audit." };

  const stripped = source.replace(/^\s*content-security-policy(-report-only)?\s*:\s*/i, "");
  const seen = new Set();
  const directives = [];
  const notes = [];

  stripped
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const tokens = part.split(/\s+/).filter(Boolean);
      const name = tokens[0];
      const lower = name.toLowerCase();
      const values = tokens.slice(1);
      const known = Object.prototype.hasOwnProperty.call(DIRECTIVES, lower);
      const duplicate = seen.has(lower);
      if (!duplicate) seen.add(lower);
      directives.push({ name, lower, values, known, duplicate, raw: part });
    });

  if (directives.length === 0) {
    return { error: "No directives found. A policy looks like \"default-src 'self'; script-src 'nonce-abc123'\"." };
  }

  return { directives, notes, reportOnlyHeader: /^\s*content-security-policy-report-only\s*:/i.test(source) };
}

/* ------------------------------------------------------------------ */
/* Source-list analysis                                                */
/* ------------------------------------------------------------------ */

/** Break a source list into keywords, nonces, hashes, schemes and hosts. */
export function analyseSourceList(values) {
  const analysis = {
    keywords: [],
    nonces: [],
    hashes: [],
    schemes: [],
    hosts: [],
    wildcardHosts: [],
    unquotedKeywords: [],
    malformed: [],
    hasWildcard: false,
  };

  values.forEach((value) => {
    const quoted = /^'(.*)'$/.exec(value);
    if (quoted) {
      const inner = quoted[1];
      const nonce = /^nonce-(.*)$/i.exec(inner);
      if (nonce) {
        analysis.nonces.push({ raw: value, value: nonce[1] });
        return;
      }
      const hash = /^(sha256|sha384|sha512)-(.*)$/i.exec(inner);
      if (hash) {
        analysis.hashes.push({ raw: value, algorithm: hash[1].toLowerCase(), digest: hash[2] });
        return;
      }
      if (KEYWORDS.includes(inner.toLowerCase())) {
        analysis.keywords.push(inner.toLowerCase());
        return;
      }
      analysis.malformed.push({ raw: value, reason: `'${inner}' is not a CSP keyword, nonce or hash` });
      return;
    }

    if (value === "*") {
      analysis.hasWildcard = true;
      return;
    }
    if (/^[a-z][a-z0-9+.-]*:$/i.test(value)) {
      analysis.schemes.push(value.toLowerCase());
      return;
    }
    if (KEYWORDS.includes(value.toLowerCase())) {
      analysis.unquotedKeywords.push(value);
      return;
    }
    if (/^(nonce-|sha(256|384|512)-)/i.test(value)) {
      analysis.unquotedKeywords.push(value);
      return;
    }
    if (value.startsWith("*.")) {
      analysis.wildcardHosts.push(value);
      analysis.hosts.push(value);
      return;
    }
    analysis.hosts.push(value);
  });

  const has = (keyword) => analysis.keywords.includes(keyword);
  analysis.hasNone = has("none");
  analysis.hasSelf = has("self");
  analysis.hasUnsafeInline = has("unsafe-inline");
  analysis.hasUnsafeEval = has("unsafe-eval");
  analysis.hasStrictDynamic = has("strict-dynamic");
  analysis.hasUnsafeHashes = has("unsafe-hashes");
  analysis.hasNonceOrHash = analysis.nonces.length > 0 || analysis.hashes.length > 0;
  return analysis;
}

/** Strip a leading "*." and any scheme/path so a host can be compared. */
function normaliseHost(value) {
  return value
    .replace(/^\*\./, "")
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
    .split("/")[0]
    .split(":")[0]
    .toLowerCase();
}

/** Bypassable hosts present in a source list. */
export function findBypassableHosts(hosts) {
  const matches = [];
  hosts.forEach((host) => {
    const normalised = normaliseHost(host);
    const hit = BYPASSABLE_HOSTS.find((entry) => normalised === entry.host || normalised.endsWith(`.${entry.host}`));
    if (hit) matches.push({ source: host, ...hit });
  });
  return matches;
}

/* ------------------------------------------------------------------ */
/* Effective policy                                                    */
/* ------------------------------------------------------------------ */

/**
 * Resolve which source list actually governs a directive, walking the
 * fallback chain. Returns { origin: "explicit" | "fallback" | "absent" }.
 */
export function resolveDirective(name, byName) {
  let current = name;
  const chain = [];
  while (current) {
    chain.push(current);
    if (byName.has(current)) {
      return {
        origin: current === name ? "explicit" : "fallback",
        from: current,
        values: byName.get(current),
        chain,
      };
    }
    current = DIRECTIVES[current] ? DIRECTIVES[current].fallback : null;
  }
  return { origin: "absent", from: null, values: [], chain };
}

/** Plain-English list of what a resolved source list permits. */
export function describePermissions(name, analysis, resolution) {
  const meta = DIRECTIVES[name];
  const subject = meta ? meta.subject : name;
  if (resolution.origin === "absent") {
    return [`${subject}: unrestricted — no directive and no fallback applies, so the policy places no limit at all.`];
  }
  if (analysis.hasNone) {
    return [`${subject}: blocked entirely by 'none'.`];
  }

  const lines = [];
  if (analysis.hasWildcard) lines.push(`${subject} from any host over http: or https:.`);
  if (analysis.hasSelf) lines.push(`${subject} from the document's own origin.`);
  analysis.schemes.forEach((scheme) => lines.push(`${subject} from any ${scheme} URL.`));
  analysis.hosts.forEach((host) => lines.push(`${subject} from ${host}.`));
  if (analysis.nonces.length) {
    lines.push(
      `Inline content carrying a matching nonce attribute (${analysis.nonces.map((item) => item.value).join(", ")}).`,
    );
  }
  if (analysis.hashes.length) {
    lines.push(`Inline content whose ${analysis.hashes.map((item) => item.algorithm).join("/")} digest matches one of ${analysis.hashes.length} listed hashes.`);
  }
  if (analysis.hasUnsafeInline) {
    lines.push(
      analysis.hasNonceOrHash
        ? "'unsafe-inline' is present but a nonce or hash is too, so CSP Level 3 browsers ignore it. Only browsers that predate nonce support honour it."
        : "Any inline content, including a <script> tag an attacker injects.",
    );
  }
  if (analysis.hasUnsafeEval) lines.push("eval(), new Function(), and string arguments to setTimeout/setInterval.");
  if (analysis.keywords.includes("wasm-unsafe-eval")) lines.push("WebAssembly compilation and instantiation.");
  if (analysis.hasStrictDynamic) {
    lines.push("'strict-dynamic': any script already trusted by a nonce or hash may load further scripts, and the host allow-list above is ignored by CSP Level 3 browsers.");
  }
  if (analysis.hasUnsafeHashes) lines.push("'unsafe-hashes': inline event handler attributes whose contents match a listed hash.");
  if (!lines.length) lines.push(`${subject}: nothing — the source list is empty, which behaves like 'none'.`);
  return lines;
}

/* ------------------------------------------------------------------ */
/* Audit                                                               */
/* ------------------------------------------------------------------ */

/** Directives worth resolving and displaying in the effective-policy table. */
const REPORTED_DIRECTIVES = [
  "default-src",
  "script-src",
  "script-src-elem",
  "script-src-attr",
  "style-src",
  "connect-src",
  "img-src",
  "font-src",
  "media-src",
  "object-src",
  "frame-src",
  "worker-src",
  "manifest-src",
  "base-uri",
  "form-action",
  "frame-ancestors",
];

function auditScriptSources(name, resolution, analysis, add) {
  const label = name;

  if (resolution.origin === "absent") {
    add("critical", `${label} is not restricted`, `Neither ${label} nor any fallback (${resolution.chain.join(" → ")}) is present, so the policy places no limit on script execution whatsoever. Everything else in the policy is decoration until this is fixed.`, `Add script-src with a nonce, or at minimum default-src 'self'.`, label);
    return;
  }
  if (analysis.hasNone) return;

  // 'strict-dynamic' makes the browser ignore every host-source and
  // scheme-source expression, plus 'self'. Flagging them would be wrong.
  if (!analysis.hasStrictDynamic) {
    if (analysis.hasWildcard) {
      add("critical", `${label} allows every host`, `A bare * permits scripts from any origin. An attacker who can inject a <script src> tag simply points it at their own server.`, "Replace * with a nonce-based allow-list.", label);
    }

    analysis.schemes.forEach((scheme) => {
      const why = RISKY_SCRIPT_SCHEMES[scheme];
      if (!why) return;
      const severity = scheme === "data:" || scheme === "blob:" || scheme === "filesystem:" ? "critical" : "high";
      add(severity, `${label} allows the ${scheme} scheme`, `Listing ${scheme} in a script source list means ${why}.`, `Remove ${scheme} and name the specific origins you load scripts from.`, label);
    });
  }

  if (analysis.hasUnsafeInline && !analysis.hasNonceOrHash) {
    add("critical", `${label} allows 'unsafe-inline'`, `With 'unsafe-inline' and no nonce or hash, any inline <script> the attacker injects into the page executes. This is the single condition that reduces a CSP to no XSS protection at all.`, "Move inline scripts into files, or mark the legitimate ones with a per-response nonce.", label);
  } else if (analysis.hasUnsafeInline && analysis.hasNonceOrHash) {
    add("info", `${label} keeps 'unsafe-inline' as a legacy fallback`, "Because a nonce or hash is also present, CSP Level 3 browsers ignore 'unsafe-inline'. It only takes effect in browsers old enough to lack nonce support, which is the intended backwards-compatibility behaviour.", "Safe to leave. Remove it once you no longer support pre-2016 browsers.", label);
  }

  if (analysis.hasUnsafeEval) {
    add("high", `${label} allows 'unsafe-eval'`, "eval(), new Function() and string-valued setTimeout are permitted. Any gadget that reaches one of those sinks with attacker-controlled data becomes script execution, which is how most CSP bypasses in template libraries work.", "Remove 'unsafe-eval' and replace runtime template compilation with a precompiled build.", label);
  }

  if (analysis.hasUnsafeHashes) {
    add("medium", `${label} allows 'unsafe-hashes'`, "'unsafe-hashes' re-enables inline event handler attributes whose content matches a listed hash. The hashes are fixed, but the mechanism keeps DOM-injected handler attributes viable in a way a nonce would not.", "Move the handlers to addEventListener and drop the keyword.", label);
  }

  if (analysis.hasStrictDynamic && !analysis.hasNonceOrHash) {
    add("high", `${label} uses 'strict-dynamic' with no nonce or hash`, "'strict-dynamic' turns off the host allow-list and trusts only scripts loaded by an already-trusted script. With no nonce or hash there is no trusted root, so in a CSP Level 3 browser no script runs at all — including your own.", "Add a per-response 'nonce-…' value.", label);
  }

  if (analysis.hasStrictDynamic && (analysis.hosts.length || analysis.hasSelf || analysis.schemes.length || analysis.hasWildcard)) {
    const ignored = [
      analysis.hasSelf ? "'self'" : null,
      analysis.hasWildcard ? "*" : null,
      analysis.schemes.length ? `${analysis.schemes.length} scheme source(s)` : null,
      analysis.hosts.length ? `${analysis.hosts.length} host source(s)` : null,
    ].filter(Boolean);
    add("info", `${label} allow-list is inert`, `'strict-dynamic' is present, so CSP Level 3 browsers ignore ${ignored.join(", ")} in this directive. They remain only as a fallback for browsers that do not support 'strict-dynamic'.`, "Nothing to fix — this is the recommended strict-CSP shape.", label);
  }

  if (!analysis.hasStrictDynamic) {
    const bypassable = findBypassableHosts(analysis.hosts);
    bypassable.forEach((entry) => {
      add("high", `${label} allow-lists ${entry.source}`, `This host ${entry.why}. Allow-listing it hands an attacker a way to execute code from an origin your policy already trusts, without breaking CSP at all.`, "Remove the host, or add 'strict-dynamic' so the allow-list stops being load-bearing.", label);
    });

    analysis.wildcardHosts.forEach((host) => {
      add("medium", `${label} allows the subdomain wildcard ${host}`, `Every current and future subdomain is trusted. One forgotten staging host, one user-content subdomain, or one subdomain takeover is enough to defeat the policy.`, "Name the specific hosts you serve scripts from.", label);
    });
  }

  analysis.nonces.forEach((nonce) => {
    if (nonce.value.length < MIN_NONCE_CHARS) {
      add("high", `${label} nonce is too short`, `"${nonce.value}" is ${nonce.value.length} characters. The specification calls for at least 128 bits of entropy, which is 22 base64 characters. A guessable nonce is no better than 'unsafe-inline'.`, "Generate 16 random bytes per response and base64-encode them.", label);
    }
    if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(nonce.value)) {
      add("medium", `${label} nonce is not base64`, `"${nonce.value}" contains characters outside the base64 alphabet, which suggests a placeholder that was never substituted at render time.`, "Check the template actually injects a fresh value.", label);
    }
  });

  analysis.hashes.forEach((hash) => {
    const expected = HASH_LENGTHS[hash.algorithm];
    if (expected && hash.digest.length !== expected) {
      add("medium", `${label} has a malformed ${hash.algorithm} hash`, `A ${hash.algorithm} digest is ${expected} base64 characters; this one is ${hash.digest.length}. A hash that does not match anything silently blocks the script it was meant to allow.`, "Recompute the digest from the exact script bytes.", label);
    }
  });
}

/**
 * Audit a Content Security Policy.
 *
 * @param {object} input
 * @param {string} input.policy    The header value (with or without the header name).
 * @param {boolean} input.reportOnly  Delivered as Content-Security-Policy-Report-Only.
 * @param {string} input.delivery  "header" or "meta".
 */
export function auditCsp(input) {
  const options = input || {};
  const parsed = parsePolicy(options.policy);
  if (parsed.error) return { error: parsed.error };

  const delivery = options.delivery === "meta" ? "meta" : "header";
  const reportOnly = Boolean(options.reportOnly) || Boolean(parsed.reportOnlyHeader);

  const byName = new Map();
  parsed.directives.forEach((directive) => {
    if (directive.duplicate || !directive.known) return;
    byName.set(directive.lower, directive.values);
  });

  const findings = [];
  const add = (severity, title, detail, fix, directive) => findings.push({ severity, title, detail, fix, directive });

  if (reportOnly) {
    add("critical", "Policy is report-only", "Content-Security-Policy-Report-Only reports violations and blocks nothing. Whatever the directives say, this policy is not enforcing anything on the page.", "Once the report stream is clean, ship the same value under Content-Security-Policy.", "—");
  }

  parsed.directives.forEach((directive) => {
    if (!directive.known) {
      add("high", `Unknown directive "${directive.name}"`, "CSP requires browsers to ignore directives they do not recognise, silently. A typo therefore removes the protection you believe is in place without producing any error. Common slips are a singular frame-ancestor, script-source, or a missing hyphen.", "Correct the spelling against the CSP Level 3 directive list.", directive.name);
      return;
    }
    if (directive.duplicate) {
      add("medium", `Directive "${directive.lower}" appears more than once`, "Only the first occurrence of a directive is honoured; every later copy is ignored. If the second copy is the one carrying your nonce or your tightened source list, it is doing nothing.", "Merge them into a single directive.", directive.lower);
    }
    const meta = DIRECTIVES[directive.lower];
    if (meta.deprecated) {
      add("low", `"${directive.lower}" is deprecated`, "This directive has been removed from or deprecated in the specification and is ignored by current browsers.", "Remove it, or replace it with its modern equivalent.", directive.lower);
    }
    if (delivery === "meta" && meta.metaIgnored) {
      add("high", `"${directive.lower}" does nothing in a <meta> tag`, "frame-ancestors, report-uri and sandbox are ignored when the policy is delivered through <meta http-equiv>. They are only honoured on a real HTTP response header.", "Move the policy — or at least this directive — into the HTTP response header.", directive.lower);
    }
    if (meta.emptyValue && directive.values.length) {
      add("low", `"${directive.lower}" should carry no value`, `This directive is a flag; "${directive.values.join(" ")}" after it is not part of its grammar and is ignored.`, "Write it on its own.", directive.lower);
    }
    if (directive.lower === "sandbox") {
      directive.values.forEach((token) => {
        if (!SANDBOX_TOKENS.includes(token.toLowerCase())) {
          add("medium", `Unknown sandbox token "${token}"`, "The token is not part of the HTML sandbox attribute vocabulary, so it grants nothing.", "Check it against the sandbox token list.", "sandbox");
        }
      });
    }
    if (directive.lower === "require-trusted-types-for" && !directive.values.includes("'script'")) {
      add("medium", "require-trusted-types-for is missing 'script'", "The only value this directive currently accepts is 'script'. Without it the directive enforces nothing.", "Write require-trusted-types-for 'script'.", "require-trusted-types-for");
    }
  });

  // Unquoted keywords are the classic silent failure: they parse as host names.
  parsed.directives.forEach((directive) => {
    if (!directive.known) return;
    const meta = DIRECTIVES[directive.lower];
    if (meta.tokenised || meta.emptyValue) return;
    const analysis = analyseSourceList(directive.values);
    analysis.unquotedKeywords.forEach((token) => {
      add("critical", `"${token}" is missing its quotes in ${directive.lower}`, `CSP keywords, nonces and hashes must be single-quoted. Written bare, "${token}" is parsed as a host name — a host that does not exist — so the permission you intended is not granted and the directive may end up blocking everything it was meant to allow.`, `Write '${token}' with single quotes.`, directive.lower);
    });
    analysis.malformed.forEach((item) => {
      add("medium", `Unrecognised quoted value ${item.raw} in ${directive.lower}`, `${item.reason}. Quoted values must be a keyword, 'nonce-…' or 'sha256-…'; anything else is ignored.`, "Remove it or correct the keyword.", directive.lower);
    });
  });

  // Effective policy for the directives worth reporting on.
  const effective = REPORTED_DIRECTIVES.map((name) => {
    const resolution = resolveDirective(name, byName);
    const analysis = analyseSourceList(resolution.values);
    return {
      name,
      category: DIRECTIVES[name].category,
      subject: DIRECTIVES[name].subject,
      origin: resolution.origin,
      from: resolution.from,
      chain: resolution.chain,
      values: resolution.values,
      analysis,
      permits: describePermissions(name, analysis, resolution),
    };
  });

  const lookup = (name) => effective.find((item) => item.name === name);

  ["script-src", "script-src-elem", "script-src-attr"].forEach((name) => {
    const entry = lookup(name);
    // Only audit the -elem / -attr variants when they are set explicitly;
    // otherwise they resolve to script-src and would duplicate its findings.
    if (name !== "script-src" && entry.origin !== "explicit") return;
    auditScriptSources(name, { origin: entry.origin, chain: entry.chain }, entry.analysis, add);
  });

  const objectSrc = lookup("object-src");
  if (objectSrc.origin === "absent") {
    add("high", "object-src is unrestricted", "Neither object-src nor default-src is set, so <object>, <embed> and <applet> can load plugin content from anywhere. Plugin documents have historically been a reliable route to script execution in the page's origin.", "Add object-src 'none'.", "object-src");
  } else if (!objectSrc.analysis.hasNone) {
    add("medium", "object-src is not 'none'", `Plugin content is still permitted (${objectSrc.values.join(" ") || "via " + objectSrc.from}). Almost no site needs it, and 'none' removes a whole bypass class for free.`, "Set object-src 'none'.", "object-src");
  }

  const baseUri = lookup("base-uri");
  if (baseUri.origin === "absent") {
    add("high", "base-uri is not set", "base-uri has no fallback to default-src. Without it, an attacker who can inject a single <base href=\"https://evil.example\"> tag re-points every relative script URL on the page at their own server — defeating a host allow-list without breaking CSP.", "Add base-uri 'none' or base-uri 'self'.", "base-uri");
  } else if (!baseUri.analysis.hasNone && !baseUri.analysis.hasSelf) {
    add("medium", "base-uri is permissive", `base-uri allows ${baseUri.values.join(" ")}. It should almost always be 'none' or 'self'.`, "Tighten it to 'none'.", "base-uri");
  }

  const frameAncestors = lookup("frame-ancestors");
  if (frameAncestors.origin === "absent") {
    add("high", "frame-ancestors is not set", "frame-ancestors has no fallback either. Without it — and without X-Frame-Options — any site can frame this page, which is the precondition for clickjacking.", "Add frame-ancestors 'none' or list the origins allowed to embed you.", "frame-ancestors");
  } else if (frameAncestors.analysis.hasWildcard) {
    add("medium", "frame-ancestors allows any site", "A wildcard here is the same as having no framing protection.", "Replace * with 'none' or an explicit list.", "frame-ancestors");
  }

  const formAction = lookup("form-action");
  if (formAction.origin === "absent") {
    add("medium", "form-action is not set", "form-action does not fall back to default-src. Without it, an injected or rewritten <form action> can post the contents of a form — including anything the user has typed — to an attacker's server.", "Add form-action 'self'.", "form-action");
  }

  const styleSrc = lookup("style-src");
  if (styleSrc.origin !== "absent" && styleSrc.analysis.hasUnsafeInline && !styleSrc.analysis.hasNonceOrHash) {
    add("low", "style-src allows 'unsafe-inline'", "Inline CSS is permitted. This is far less severe than the script equivalent, but injected CSS can still exfiltrate data through attribute selectors and background-image URLs, and can redress the UI for a clickjacking-style attack.", "Use a nonce on your <style> blocks if practical.", "style-src");
  }

  const hasReporting = byName.has("report-to") || byName.has("report-uri");
  if (!hasReporting) {
    add("info", "No violation reporting configured", "Neither report-to nor report-uri is set, so you will never learn what this policy blocks in the field — including the breakages that make teams weaken a policy rather than fix it.", "Add report-to with a Reporting-Endpoints header.", "report-to");
  } else if (byName.has("report-to")) {
    add("info", "report-to needs a companion header", "report-to names a reporting endpoint group. It only works if the response also carries a Reporting-Endpoints (or legacy Report-To) header defining that group.", "Confirm the endpoint header is present on the same response.", "report-to");
  }

  if (!byName.has("require-trusted-types-for")) {
    add("info", "Trusted Types not enforced", "require-trusted-types-for 'script' makes the browser refuse unsafe assignments to innerHTML and similar DOM sinks, which closes off DOM XSS rather than only injected-tag XSS. It is the strongest addition available to a modern policy.", "Add require-trusted-types-for 'script' and a trusted-types policy list.", "require-trusted-types-for");
  }

  const scriptEntry = lookup("script-src");
  let strength;
  if (scriptEntry.origin === "absent") {
    strength = { key: "none", label: "No script restriction", detail: "The policy does not constrain script execution." };
  } else if (scriptEntry.analysis.hasNone) {
    strength = { key: "blocked", label: "All scripts blocked", detail: "script-src 'none' — nothing executes, including your own code." };
  } else if (scriptEntry.analysis.hasUnsafeInline && !scriptEntry.analysis.hasNonceOrHash) {
    strength = { key: "none", label: "No XSS protection", detail: "'unsafe-inline' with no nonce or hash means an injected <script> tag runs." };
  } else if (scriptEntry.analysis.hasNonceOrHash && scriptEntry.analysis.hasStrictDynamic) {
    strength = { key: "strict", label: "Strict, nonce-based", detail: "Nonce or hash plus 'strict-dynamic' — the shape recommended for a CSP that actually stops XSS." };
  } else if (scriptEntry.analysis.hasNonceOrHash) {
    strength = { key: "nonce", label: "Nonce-based with a host allow-list", detail: "Sound, but the host allow-list still has to hold. Adding 'strict-dynamic' would make it irrelevant." };
  } else if (scriptEntry.analysis.hasWildcard || scriptEntry.analysis.schemes.some((scheme) => scheme === "https:" || scheme === "http:")) {
    strength = { key: "none", label: "Effectively unrestricted", detail: "A wildcard or bare https: source permits scripts from anywhere." };
  } else if (
    scriptEntry.analysis.hosts.length === 0 &&
    scriptEntry.analysis.schemes.length === 0 &&
    !scriptEntry.analysis.hasSelf
  ) {
    strength = {
      key: "malformed",
      label: "Malformed source list",
      detail: "script-src is set but names no source a browser can use — usually because a keyword lost its quotes and was parsed as a host name.",
    };
  } else {
    strength = { key: "allowlist", label: "Host allow-list only", detail: "Protection depends entirely on every allow-listed host staying trustworthy, and on none of them serving JSONP or AngularJS." };
  }

  findings.sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));

  const counts = SEVERITY_ORDER.reduce((acc, level) => {
    acc[level] = findings.filter((item) => item.severity === level).length;
    return acc;
  }, {});

  const worst = SEVERITY_ORDER.find((level) => counts[level] > 0) || "info";

  return {
    delivery,
    reportOnly,
    directives: parsed.directives,
    effective,
    findings,
    counts,
    strength,
    verdict: {
      key: worst,
      label:
        worst === "critical"
          ? "Critical weaknesses"
          : worst === "high"
            ? "Significant weaknesses"
            : worst === "medium"
              ? "Needs tightening"
              : worst === "low"
                ? "Minor issues"
                : "No weaknesses found",
      tone: worst === "critical" || worst === "high" ? "danger" : worst === "medium" || worst === "low" ? "warning" : "success",
    },
  };
}

/** Render an audit as plain text for a ticket or a PR comment. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [];
  lines.push("Content Security Policy audit");
  lines.push(`Delivery: ${result.delivery === "meta" ? "<meta http-equiv>" : "HTTP header"}${result.reportOnly ? " (report-only)" : ""}`);
  lines.push(`Script protection: ${result.strength.label} — ${result.strength.detail}`);
  lines.push(`Verdict: ${result.verdict.label}`);
  lines.push("");
  lines.push("Effective policy");
  result.effective.forEach((entry) => {
    const origin =
      entry.origin === "explicit" ? "set" : entry.origin === "fallback" ? `inherited from ${entry.from}` : "ABSENT";
    lines.push(`  ${entry.name} (${origin}): ${entry.values.join(" ") || "—"}`);
  });
  lines.push("");
  lines.push(`Findings: ${result.findings.length}`);
  result.findings.forEach((finding, index) => {
    lines.push(`${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title} (${finding.directive})`);
    lines.push(`   ${finding.detail}`);
    lines.push(`   Fix: ${finding.fix}`);
  });
  return lines.join("\n");
}
