/**
 * Referrer-Policy comparator.
 *
 * Implements the W3C Referrer Policy algorithm for the eight defined policy
 * values, so you can see the exact Referer header a given navigation would
 * send under each one. Pure functions; nothing is fetched.
 */

/**
 * The eight policy tokens defined by the Referrer Policy specification.
 * `isDefault` marks the value browsers apply when no policy is set, which has
 * been strict-origin-when-cross-origin in Chrome, Firefox and Safari since 2020-2021.
 */
export const POLICIES = [
  {
    id: "no-referrer",
    label: "no-referrer",
    isDefault: false,
    summary: "Never sends a Referer header at all, in any direction.",
    tradeoff:
      "Breaks referral attribution completely and can break sites that use the Referer header for CSRF checks or hotlink protection.",
  },
  {
    id: "no-referrer-when-downgrade",
    label: "no-referrer-when-downgrade",
    isDefault: false,
    summary:
      "Sends the full URL everywhere except when moving from a secure origin to an insecure one.",
    tradeoff:
      "Was the old browser default. It leaks the full path and query string to every third party you link to over HTTPS.",
  },
  {
    id: "origin",
    label: "origin",
    isDefault: false,
    summary: "Always sends only the scheme, host and port — never the path or query.",
    tradeoff:
      "Still sends the origin on an HTTPS to HTTP downgrade, which puts it on the wire in cleartext. Prefer strict-origin.",
  },
  {
    id: "origin-when-cross-origin",
    label: "origin-when-cross-origin",
    isDefault: false,
    summary: "Full URL within your own origin, origin only when leaving it.",
    tradeoff:
      "Does not protect downgrades: a cross-origin HTTPS to HTTP request still sends your origin in cleartext.",
  },
  {
    id: "same-origin",
    label: "same-origin",
    isDefault: false,
    summary: "Full URL for same-origin requests, nothing whatsoever cross-origin.",
    tradeoff:
      "The tightest option that still keeps internal referrers working. Third-party analytics and affiliate attribution stop entirely.",
  },
  {
    id: "strict-origin",
    label: "strict-origin",
    isDefault: false,
    summary: "Origin only, and nothing at all on a downgrade.",
    tradeoff: "Loses same-origin path information, which some internal analytics rely on.",
  },
  {
    id: "strict-origin-when-cross-origin",
    label: "strict-origin-when-cross-origin",
    isDefault: true,
    summary:
      "Full URL within your origin, origin only when leaving it, and nothing at all on a downgrade.",
    tradeoff:
      "The modern browser default and the right starting point for almost every site. Cross-origin partners lose the path, which occasionally breaks legacy attribution.",
  },
  {
    id: "unsafe-url",
    label: "unsafe-url",
    isDefault: false,
    summary: "Always sends the full URL, including on a downgrade to plain HTTP.",
    tradeoff:
      "Named unsafe for a reason: it puts your full path and query string, tokens included, on the wire in cleartext and hands them to every third party.",
  },
];

/** Where a policy can be declared, in decreasing order of scope. */
export const DECLARATION_SITES = [
  {
    id: "header",
    label: "Response header (whole document)",
    template: (policy) => `Referrer-Policy: ${policy}`,
    note: "Applies to every request the document makes. This is the one to set at the CDN or server level.",
  },
  {
    id: "meta",
    label: "Meta tag (whole document)",
    template: (policy) => `<meta name="referrer" content="${policy}">`,
    note: "Useful when you cannot change response headers. Must appear before any resource that would send a referrer.",
  },
  {
    id: "attribute",
    label: "Per element",
    template: (policy) => `<a href="https://example.com/" referrerpolicy="${policy}">link</a>`,
    note: "Overrides the document policy for one link, image, iframe, script or fetch call.",
  },
  {
    id: "rel",
    label: "Per link, shorthand",
    template: () => `<a href="https://example.com/" rel="noreferrer noopener">link</a>`,
    note: "rel=noreferrer is equivalent to no-referrer for that link and also implies noopener.",
  },
];

/** Referrer output kinds, used for the leak rating. */
export const REFERRER_KINDS = {
  none: { id: "none", label: "No header sent", leak: 0 },
  origin: { id: "origin", label: "Origin only", leak: 1 },
  full: { id: "full", label: "Full URL including path and query", leak: 2 },
};

/**
 * Schemes and hosts treated as potentially trustworthy by the Secure Contexts
 * specification, which is what "downgrade" is measured against.
 */
export const TRUSTWORTHY_SCHEMES = ["https:", "wss:", "file:"];
export const TRUSTWORTHY_HOSTS = ["localhost", "127.0.0.1", "[::1]", "::1"];

/** Parse a URL into the pieces the algorithm needs. Returns null when invalid. */
export function parseUrl(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  let url;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (!url.protocol || !url.host) return null;
  return {
    href: url.href,
    scheme: url.protocol,
    host: url.host,
    hostname: url.hostname,
    port: url.port,
    origin: `${url.protocol}//${url.host}`,
    path: url.pathname,
    query: url.search,
    fragment: url.hash,
    hasCredentials: Boolean(url.username || url.password),
    params: [...url.searchParams.keys()],
  };
}

/** True when the URL counts as a secure context source. */
export function isPotentiallyTrustworthy(parts) {
  if (!parts) return false;
  if (TRUSTWORTHY_SCHEMES.includes(parts.scheme)) return true;
  const host = parts.hostname.toLowerCase();
  return TRUSTWORTHY_HOSTS.includes(host) || host.endsWith(".localhost");
}

/** Same origin means identical scheme, host and port. */
export function isSameOrigin(a, b) {
  return Boolean(a && b) && a.origin === b.origin;
}

/** A downgrade is a trustworthy source navigating to a non-trustworthy destination. */
export function isDowngrade(source, destination) {
  return isPotentiallyTrustworthy(source) && !isPotentiallyTrustworthy(destination);
}

/**
 * The referrer URL the spec strips before sending: no fragment, no credentials.
 * Path and query survive.
 */
export function strippedReferrer(parts) {
  return `${parts.origin}${parts.path}${parts.query}`;
}

/** Origin-only referrer. Browsers serialise it with a trailing slash. */
export function originReferrer(parts) {
  return `${parts.origin}/`;
}

/**
 * Apply one policy. Returns the header value plus why the algorithm chose it.
 *
 * @returns {{kind:string,value:string,reason:string}}
 */
export function computeReferrer(policyId, source, destination) {
  const sameOrigin = isSameOrigin(source, destination);
  const downgrade = isDowngrade(source, destination);
  const full = strippedReferrer(source);
  const origin = originReferrer(source);

  const none = (reason) => ({ kind: "none", value: "", reason });
  const asOrigin = (reason) => ({ kind: "origin", value: origin, reason });
  const asFull = (reason) => ({ kind: "full", value: full, reason });

  switch (policyId) {
    case "no-referrer":
      return none("This policy never sends a Referer header.");
    case "no-referrer-when-downgrade":
      return downgrade
        ? none("Secure origin to insecure destination, so the header is dropped.")
        : asFull("Not a downgrade, so the full URL is sent — path and query included.");
    case "origin":
      return asOrigin(
        downgrade
          ? "Sends the origin even on a downgrade, so it travels in cleartext."
          : "Always trims to the origin, whatever the destination.",
      );
    case "origin-when-cross-origin":
      return sameOrigin
        ? asFull("Same origin, so the full URL is sent.")
        : asOrigin(
            downgrade
              ? "Cross-origin, so trimmed to the origin — but it is still sent over an insecure connection."
              : "Cross-origin, so trimmed to the origin.",
          );
    case "same-origin":
      return sameOrigin
        ? asFull("Same origin, so the full URL is sent.")
        : none("Cross-origin, so nothing is sent.");
    case "strict-origin":
      return downgrade
        ? none("Downgrade, so nothing is sent.")
        : asOrigin("Trimmed to the origin, and suppressed entirely on a downgrade.");
    case "strict-origin-when-cross-origin":
      if (downgrade) return none("Downgrade, so nothing is sent.");
      return sameOrigin
        ? asFull("Same origin, so the full URL is sent.")
        : asOrigin("Cross-origin, so trimmed to the origin.");
    case "unsafe-url":
      return asFull(
        downgrade
          ? "Sends the full URL even over plain HTTP — everything in the path and query is exposed on the wire."
          : "Always sends the full URL, path and query included.",
      );
    default:
      return none("Unknown policy token; browsers fall back to the default policy.");
  }
}

/**
 * Query keys that commonly carry something sensitive. Matched case-insensitively
 * as substrings, because real parameter names vary (auth_token, resetToken, ...).
 */
export const SENSITIVE_PARAM_HINTS = [
  "token",
  "auth",
  "session",
  "sid",
  "key",
  "secret",
  "password",
  "passwd",
  "pwd",
  "code",
  "otp",
  "email",
  "mail",
  "phone",
  "user",
  "account",
  "invite",
  "signature",
  "sig",
  "access",
  "id_token",
];

/** Which of this URL's query keys look sensitive. */
export function sensitiveParams(parts) {
  if (!parts) return [];
  return parts.params.filter((key) => {
    const lower = key.toLowerCase();
    return SENSITIVE_PARAM_HINTS.some((hint) => lower.includes(hint));
  });
}

/**
 * Compare every policy for one source-to-destination navigation.
 *
 * @param {{source:string,destination:string}} input
 */
export function compareReferrerPolicies(input = {}) {
  const source = parseUrl(input.source);
  if (!source) {
    return { error: "Enter the page URL with its scheme, for example https://app.example.com/reset?token=abc" };
  }
  const destination = parseUrl(input.destination);
  if (!destination) {
    return { error: "Enter the destination URL with its scheme, for example https://analytics.example.net/collect" };
  }
  if (!["http:", "https:"].includes(source.scheme)) {
    return { error: "The page URL must use http or https — other schemes do not send a Referer header." };
  }
  if (!["http:", "https:"].includes(destination.scheme)) {
    return { error: "The destination URL must use http or https." };
  }

  const sameOrigin = isSameOrigin(source, destination);
  const downgrade = isDowngrade(source, destination);
  const leakedParams = sensitiveParams(source);

  const rows = POLICIES.map((policy) => {
    const result = computeReferrer(policy.id, source, destination);
    const kind = REFERRER_KINDS[result.kind];
    return {
      ...policy,
      ...result,
      kindLabel: kind.label,
      leak: kind.leak,
      // Sensitive parameters only escape when the full URL is sent.
      exposesParams: result.kind === "full" ? leakedParams : [],
    };
  });

  const safest = rows.filter((row) => row.leak === Math.min(...rows.map((item) => item.leak)));
  const defaultRow = rows.find((row) => row.isDefault);

  return {
    source,
    destination,
    sameOrigin,
    downgrade,
    leakedParams,
    rows,
    defaultRow,
    safestCount: safest.length,
    fullLeakCount: rows.filter((row) => row.kind === "full").length,
    hasCredentials: source.hasCredentials,
  };
}

/** Plain-text comparison table. */
export function formatComparison(result) {
  if (!result || result.error) return "";
  const lines = [
    "Referrer-Policy comparison",
    `From: ${result.source.href}`,
    `To:   ${result.destination.href}`,
    `Same origin: ${result.sameOrigin ? "yes" : "no"} · Downgrade: ${result.downgrade ? "yes" : "no"}`,
    "",
    ...result.rows.map((row) => `${row.label}${row.isDefault ? " (browser default)" : ""}\n  ${row.value || "(no Referer header)"}`),
  ];
  if (result.leakedParams.length > 0) {
    lines.push("", `Query keys that look sensitive: ${result.leakedParams.join(", ")}`);
  }
  return lines.join("\n");
}
