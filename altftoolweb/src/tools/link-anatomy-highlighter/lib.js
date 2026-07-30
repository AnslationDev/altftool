/**
 * Link Anatomy Highlighter — pure URL dissection and phishing heuristics.
 *
 * The parser follows the generic URI syntax of RFC 3986 section 3:
 *   scheme "://" [ userinfo "@" ] host [ ":" port ] path [ "?" query ] [ "#" fragment ]
 * It deliberately does NOT use the WHATWG URL class, because that normalises
 * away the exact tricks this tool is meant to expose (raw userinfo, trailing
 * dots, percent-encoded hosts) and hides the character offsets needed to
 * colour the original string.
 */

/** Ports a browser treats as the scheme default, so they are never shown. */
export const DEFAULT_PORTS = { http: 80, https: 443, ftp: 21, ws: 80, wss: 443 };

/**
 * Schemes that run code or read local data instead of fetching a web page.
 * javascript: and data: are the two most common in pasted-link attacks; both
 * are blocked when typed into the address bar by modern browsers but still
 * work from inside a page or a document.
 */
export const EXECUTABLE_SCHEMES = ["javascript", "data", "vbscript", "file", "blob"];

/**
 * Abbreviated public-suffix list: second-level suffixes where the registrable
 * domain is the THIRD label from the right (example.co.in, not co.in).
 * The authoritative full list lives at publicsuffix.org — this covers the
 * suffixes seen most often in Indian and English-language links.
 */
export const MULTI_LABEL_SUFFIXES = [
  "co.in", "net.in", "org.in", "gen.in", "firm.in", "ind.in",
  "gov.in", "nic.in", "ac.in", "edu.in", "res.in", "mil.in",
  "co.uk", "org.uk", "ac.uk", "gov.uk", "me.uk", "net.uk",
  "com.au", "net.au", "org.au", "edu.au", "gov.au",
  "co.nz", "co.za", "com.br", "com.sg", "com.my", "com.cn",
  "co.jp", "or.jp", "ne.jp", "com.mx", "com.tr", "com.ph",
];

/**
 * Brand tokens impersonated most often in phishing links aimed at Indian and
 * global users. Presence of the token OUTSIDE the registered domain is the
 * signal — anyone can create sbi.login.attacker.com, nobody else can register
 * sbi.co.in.
 */
export const IMPERSONATED_BRANDS = [
  "paypal", "sbi", "onlinesbi", "hdfc", "icici", "axisbank", "kotak", "pnb",
  "netflix", "amazon", "flipkart", "apple", "icloud", "microsoft", "office365",
  "google", "gmail", "whatsapp", "instagram", "facebook", "linkedin",
  "irctc", "incometax", "epfindia", "uidai", "aadhaar", "cowin", "npci", "upi",
  "dhl", "fedex", "bluedart", "indiapost", "coinbase", "binance", "phonepe", "paytm",
];

/** Link shorteners hide the real destination until the redirect happens. */
export const URL_SHORTENERS = [
  "bit.ly", "t.co", "tinyurl.com", "goo.gl", "ow.ly", "is.gd", "buff.ly",
  "rebrand.ly", "cutt.ly", "shorturl.at", "rb.gy", "tiny.cc", "t.ly",
  "bl.ink", "lnkd.in", "s.id", "shrtco.de", "v.gd",
];

/**
 * TLDs that either duplicate a file extension (.zip and .mov, delegated by
 * Google in 2023) or belong to the free registrars repeatedly named in abuse
 * reports. Not proof of anything — just a reason to look twice.
 */
export const HIGH_ABUSE_TLDS = ["zip", "mov", "tk", "ml", "ga", "cf", "gq"];

/** File types that execute or install once downloaded. */
export const EXECUTABLE_PATH_EXTENSIONS = [
  "exe", "scr", "msi", "bat", "cmd", "com", "pif", "apk", "jar", "vbs",
  "js", "ps1", "hta", "lnk", "iso", "img", "dmg", "deb", "rpm",
];

/** Query keys that should never travel in a URL — URLs are logged everywhere. */
export const SECRET_QUERY_KEYS = [
  "password", "passwd", "pwd", "pass", "otp", "pin", "cvv", "token",
  "access_token", "id_token", "api_key", "apikey", "secret", "auth",
  "session", "sessionid", "aadhaar", "aadhar", "pan", "card", "cardno",
];

/** Weight each finding adds to the 0-100 attention score. */
export const RISK_WEIGHTS = { danger: 30, warn: 15, info: 5 };

/** Human labels for every segment kind the parser can emit. */
export const KIND_LABELS = {
  scheme: "Scheme",
  delim: "Separator",
  userinfo: "User info",
  subdomain: "Subdomain",
  domain: "Registered domain",
  port: "Port",
  path: "Path",
  query: "Query string",
  fragment: "Fragment",
  opaque: "Scheme data",
};

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** True when any character is outside the 7-bit ASCII range used by plain domains. */
export function hasNonAscii(text) {
  const s = String(text == null ? "" : text);
  for (let i = 0; i < s.length; i += 1) {
    if (s.charCodeAt(i) > 127) return true;
  }
  return false;
}

/**
 * Unicode bidirectional control characters (U+202A..U+202E and U+2066..U+2069).
 * A right-to-left override reverses how the rest of the string is drawn.
 */
export function hasBidiOverride(text) {
  const s = String(text == null ? "" : text);
  for (let i = 0; i < s.length; i += 1) {
    const code = s.charCodeAt(i);
    if ((code >= 0x202a && code <= 0x202e) || (code >= 0x2066 && code <= 0x2069)) return true;
  }
  return false;
}

/** True when the host is a bare IP literal rather than a domain name. */
export function isIpHost(host) {
  if (typeof host !== "string" || host === "") return false;
  if (host.startsWith("[") && host.endsWith("]")) return true;
  const m = IPV4.exec(host);
  if (!m) return false;
  return m.slice(1).every((octet) => Number(octet) >= 0 && Number(octet) <= 255);
}

/**
 * Split a host into the part anyone can invent (subdomain) and the part
 * somebody had to register and pay for (registrable domain).
 */
export function splitHost(host) {
  const clean = String(host || "").toLowerCase().replace(/\.$/, "");
  if (clean === "" || isIpHost(clean)) {
    return { subdomain: "", domain: clean, tld: "" };
  }
  const labels = clean.split(".");
  if (labels.length < 2) return { subdomain: "", domain: clean, tld: "" };
  const lastTwo = labels.slice(-2).join(".");
  const take = MULTI_LABEL_SUFFIXES.includes(lastTwo) && labels.length >= 3 ? 3 : 2;
  return {
    subdomain: labels.slice(0, labels.length - take).join("."),
    domain: labels.slice(-take).join("."),
    tld: labels[labels.length - 1],
  };
}

/** Split a query string into key/value pairs without decoding surprises. */
export function parseQueryPairs(query) {
  if (typeof query !== "string" || query.trim() === "") return [];
  return query
    .split("&")
    .filter((chunk) => chunk !== "")
    .map((chunk) => {
      const eq = chunk.indexOf("=");
      const key = eq === -1 ? chunk : chunk.slice(0, eq);
      const value = eq === -1 ? "" : chunk.slice(eq + 1);
      let decoded = value;
      try {
        decoded = decodeURIComponent(value.replace(/\+/g, " "));
      } catch {
        decoded = value;
      }
      return { key, value, decoded };
    });
}

function pushSegment(segments, cursor, kind, value) {
  if (value === "") return cursor;
  segments.push({ kind, value, start: cursor, end: cursor + value.length });
  return cursor + value.length;
}

/**
 * Break a URL string into ordered, offset-tagged segments. Concatenating
 * every segment value reproduces the trimmed input exactly.
 */
export function splitUrl(raw) {
  const url = String(raw == null ? "" : raw).trim();
  const segments = [];
  const meta = {
    scheme: "",
    userinfo: "",
    host: "",
    subdomain: "",
    domain: "",
    port: "",
    path: "",
    query: "",
    fragment: "",
    schemeMissing: false,
    opaque: "",
  };
  let cursor = 0;
  let rest = url;

  const schemeMatch = /^([A-Za-z][A-Za-z0-9+.-]*):/.exec(rest);
  if (schemeMatch) {
    meta.scheme = schemeMatch[1].toLowerCase();
    cursor = pushSegment(segments, cursor, "scheme", schemeMatch[1]);
    cursor = pushSegment(segments, cursor, "delim", ":");
    rest = rest.slice(schemeMatch[0].length);
  } else {
    meta.schemeMissing = true;
  }

  let hasAuthority = false;
  if (rest.startsWith("//")) {
    cursor = pushSegment(segments, cursor, "delim", "//");
    rest = rest.slice(2);
    hasAuthority = true;
  } else if (meta.scheme === "" && rest !== "" && !rest.startsWith("/")) {
    // Bare "example.com/path" — the form people paste most often.
    hasAuthority = true;
  }

  if (!hasAuthority) {
    // Opaque scheme such as javascript:, data: or mailto: — no host at all.
    meta.opaque = rest;
    cursor = pushSegment(segments, cursor, "opaque", rest);
    return { segments, meta };
  }

  const authorityEnd = (() => {
    const idx = rest.search(/[/?#]/);
    return idx === -1 ? rest.length : idx;
  })();
  const authority = rest.slice(0, authorityEnd);
  rest = rest.slice(authorityEnd);

  let hostPort = authority;
  const atIndex = authority.lastIndexOf("@");
  if (atIndex >= 0) {
    meta.userinfo = authority.slice(0, atIndex);
    cursor = pushSegment(segments, cursor, "userinfo", meta.userinfo);
    cursor = pushSegment(segments, cursor, "delim", "@");
    hostPort = authority.slice(atIndex + 1);
  }

  let host = hostPort;
  let port = "";
  if (hostPort.startsWith("[")) {
    const close = hostPort.indexOf("]");
    if (close !== -1) {
      host = hostPort.slice(0, close + 1);
      const tail = hostPort.slice(close + 1);
      if (tail.startsWith(":")) port = tail.slice(1);
    }
  } else {
    const colon = hostPort.lastIndexOf(":");
    if (colon !== -1 && /^\d*$/.test(hostPort.slice(colon + 1))) {
      host = hostPort.slice(0, colon);
      port = hostPort.slice(colon + 1);
    }
  }
  meta.host = host;
  meta.port = port;

  const { subdomain, domain } = splitHost(host);
  if (subdomain !== "" && host.toLowerCase().startsWith(`${subdomain}.`)) {
    cursor = pushSegment(segments, cursor, "subdomain", host.slice(0, subdomain.length));
    cursor = pushSegment(segments, cursor, "delim", ".");
    cursor = pushSegment(segments, cursor, "domain", host.slice(subdomain.length + 1));
  } else {
    cursor = pushSegment(segments, cursor, "domain", host);
  }
  meta.subdomain = subdomain;
  meta.domain = domain;

  if (port !== "") {
    cursor = pushSegment(segments, cursor, "delim", ":");
    cursor = pushSegment(segments, cursor, "port", port);
  }

  const pathEnd = (() => {
    const idx = rest.search(/[?#]/);
    return idx === -1 ? rest.length : idx;
  })();
  meta.path = rest.slice(0, pathEnd);
  cursor = pushSegment(segments, cursor, "path", meta.path);
  rest = rest.slice(pathEnd);

  if (rest.startsWith("?")) {
    cursor = pushSegment(segments, cursor, "delim", "?");
    rest = rest.slice(1);
    const hashIdx = rest.indexOf("#");
    meta.query = hashIdx === -1 ? rest : rest.slice(0, hashIdx);
    cursor = pushSegment(segments, cursor, "query", meta.query);
    rest = hashIdx === -1 ? "" : rest.slice(hashIdx);
  }

  if (rest.startsWith("#")) {
    cursor = pushSegment(segments, cursor, "delim", "#");
    meta.fragment = rest.slice(1);
    cursor = pushSegment(segments, cursor, "fragment", meta.fragment);
  }

  return { segments, meta };
}

function collectRisks(meta, url) {
  const risks = [];
  const add = (id, level, title, detail) => risks.push({ id, level, title, detail });
  const host = meta.host.toLowerCase();
  const hostAndPath = `${host}${meta.path}`.toLowerCase();
  const { subdomain, domain, tld } = splitHost(host);

  if (EXECUTABLE_SCHEMES.includes(meta.scheme)) {
    add(
      "executable-scheme",
      "danger",
      `${meta.scheme}: is not a web address`,
      "This scheme runs code or opens local data instead of loading a page. Legitimate links you are sent by email or chat use http or https."
    );
  } else if (meta.scheme === "http") {
    add(
      "plain-http",
      "warn",
      "Unencrypted http",
      "Traffic on plain http can be read and modified on the network. A padlock alone never proves the site is genuine, but its absence is a reason to stop."
    );
  } else if (meta.schemeMissing) {
    add(
      "no-scheme",
      "info",
      "No scheme given",
      "Without http:// or https:// the browser guesses, and mail clients often assume http. Judge the link on its host, not its display text."
    );
  }

  if (meta.userinfo !== "") {
    add(
      "userinfo",
      "danger",
      "Text before an @ sign is ignored",
      `The browser connects to "${meta.host || "the host after the @"}", not to "${meta.userinfo}". RFC 3986 calls this the userinfo field and it is the oldest link disguise there is.`
    );
  }

  if (host !== "" && isIpHost(host)) {
    add(
      "ip-host",
      "warn",
      "Address points at a raw IP",
      "Real services publish a domain name and a certificate for it. A bare IP means there is no name to check and usually no valid TLS certificate."
    );
  }

  if (/(^|\.)xn--/.test(host)) {
    add(
      "punycode",
      "danger",
      "Punycode host (xn--)",
      "The host contains an internationalised label. Decoded, it can look identical to a Latin brand name — the classic homograph attack. Read the xn-- form, not the pretty one."
    );
  } else if (hasNonAscii(meta.host)) {
    add(
      "non-ascii-host",
      "warn",
      "Non-ASCII characters in the host",
      "Cyrillic and Greek letters render like Latin ones. Copy the host into a punycode converter to see what was actually registered."
    );
  }

  if (host.includes("%")) {
    add(
      "encoded-host",
      "danger",
      "Percent-encoding inside the host",
      "Host names never need percent-encoding. It is used to hide the real destination from people and from naive filters."
    );
  }

  if (meta.port !== "") {
    const expected = DEFAULT_PORTS[meta.scheme];
    if (expected === undefined || Number(meta.port) !== expected) {
      add(
        "nonstandard-port",
        "warn",
        `Non-standard port ${meta.port}`,
        `Public sites answer on ${DEFAULT_PORTS.https} for https and ${DEFAULT_PORTS.http} for http. A different port usually means a test box, a proxy or a home router.`
      );
    }
  }

  const labelCount = host === "" || isIpHost(host) ? 0 : host.split(".").length;
  if (labelCount >= 5) {
    add(
      "deep-subdomain",
      "warn",
      `${labelCount} labels in the host`,
      "Long chains of subdomains push the registered domain off the right edge of a phone address bar. Read the two labels immediately before the first single slash."
    );
  }

  for (const brand of IMPERSONATED_BRANDS) {
    if (!host.includes(brand)) continue;
    const domainFirstLabel = domain.split(".")[0];
    if (domainFirstLabel === brand) break;
    if (subdomain.includes(brand)) {
      add(
        "brand-in-subdomain",
        "danger",
        `"${brand}" appears in the subdomain`,
        `The domain that was actually registered is ${domain || host}. Anyone can create ${brand}.anything.com — only the owner of ${brand} controls the registered domain.`
      );
    } else {
      add(
        "lookalike-domain",
        "warn",
        `"${brand}" is buried in a longer domain`,
        `The registered domain is ${domain || host}, not the brand itself. Names like ${brand}-secure-login are registered fresh for each campaign.`
      );
    }
    break;
  }

  if (URL_SHORTENERS.includes(domain)) {
    add(
      "shortener",
      "info",
      "Shortened link",
      `${domain} hides the destination until you follow it. Expand it first — most shorteners show the target if you add a + or use an expander service.`
    );
  }

  if (HIGH_ABUSE_TLDS.includes(tld)) {
    add(
      "abuse-tld",
      "info",
      `.${tld} top-level domain`,
      tld === "zip" || tld === "mov"
        ? "This TLD duplicates a file extension, so a sentence mentioning a file name can turn into a clickable link."
        : "Free registrars behind this TLD appear repeatedly in abuse reporting. It is a reason to check, not proof of anything."
    );
  }

  const pathExt = /\.([A-Za-z0-9]{1,5})(?:$|[?#])/.exec(meta.path);
  if (pathExt && EXECUTABLE_PATH_EXTENSIONS.includes(pathExt[1].toLowerCase())) {
    add(
      "executable-download",
      "danger",
      `Link ends in .${pathExt[1].toLowerCase()}`,
      "The path points straight at an installer or a script. Downloading it is the whole attack — nothing else has to go wrong."
    );
  }

  const pairs = parseQueryPairs(meta.query);
  const secret = pairs.find((pair) => SECRET_QUERY_KEYS.includes(pair.key.toLowerCase()));
  if (secret) {
    add(
      "secret-in-query",
      "warn",
      `Sensitive parameter "${secret.key}" in the query string`,
      "Query strings are stored in browser history, server logs, proxies and the Referer header. Nothing secret belongs there."
    );
  }

  const redirect = pairs.find((pair) => /https?(:|%3a)\/\/|%2f%2f/i.test(pair.value));
  if (redirect) {
    add(
      "open-redirect",
      "danger",
      `Parameter "${redirect.key}" carries another URL`,
      "A redirect parameter lets a trusted host bounce you to any site the sender chooses, so the visible domain proves nothing about where you land."
    );
  }

  if (/(^|[/?#&=])%2e%2e|\.\.\//i.test(url)) {
    add(
      "traversal",
      "warn",
      "Path traversal sequence",
      "The link contains ../ or its encoded form, used to climb out of a directory on a badly configured server."
    );
  }

  if (url.length > 200) {
    add(
      "very-long",
      "info",
      `${url.length} characters long`,
      "Long links are hard to read on a phone, which is exactly why campaigns pad them. Widen the address bar or paste it here before clicking."
    );
  }

  if (hasBidiOverride(url)) {
    add(
      "bidi-override",
      "danger",
      "Invisible text-direction character",
      "A right-to-left override reverses how the rest of the link is drawn, so the text on screen can differ completely from what is fetched."
    );
  }

  return risks;
}

/**
 * Full analysis of a single URL string.
 * Returns { error } for input that cannot be treated as a link at all.
 */
export function analyseUrl(raw) {
  const url = String(raw == null ? "" : raw).trim();
  if (url === "") return { error: "Paste a link to take it apart." };
  if (/\s/.test(url)) {
    return { error: "A URL cannot contain spaces — paste one link at a time." };
  }
  if (url.length > 4000) {
    return { error: "That is longer than 4000 characters. Trim it to the part you want to inspect." };
  }

  const { segments, meta } = splitUrl(url);
  const isOpaque = segments.some((segment) => segment.kind === "opaque");

  if (!isOpaque && meta.host === "") {
    return { error: "No host found. A web link needs something like example.com after the scheme." };
  }
  // Reject characters that can never appear in a host name. Non-ASCII is
  // allowed through so the IDN homograph finding can report on it.
  if (!isOpaque && !hasNonAscii(meta.host) && /[<>"\\^`{|}]/.test(meta.host)) {
    return { error: "The host contains characters that are not allowed in a domain name." };
  }
  if (meta.port !== "" && (!/^\d+$/.test(meta.port) || Number(meta.port) > 65535)) {
    return { error: "Port must be a whole number between 0 and 65535." };
  }

  const risks = collectRisks(meta, url);
  const rawScore = risks.reduce((sum, risk) => sum + (RISK_WEIGHTS[risk.level] || 0), 0);
  const score = Math.min(100, rawScore);

  let verdict = "No red flags in the structure";
  if (score >= 55) verdict = "Treat as hostile until proven otherwise";
  else if (score >= 25) verdict = "Several parts need checking";
  else if (score > 0) verdict = "Minor things worth noticing";

  const counts = {
    danger: risks.filter((risk) => risk.level === "danger").length,
    warn: risks.filter((risk) => risk.level === "warn").length,
    info: risks.filter((risk) => risk.level === "info").length,
  };

  return {
    url,
    segments,
    ...meta,
    isOpaque,
    queryPairs: parseQueryPairs(meta.query),
    labelCount: meta.host === "" || isIpHost(meta.host) ? 0 : meta.host.split(".").length,
    isIp: isIpHost(meta.host),
    effectivePort:
      meta.port !== "" ? Number(meta.port) : DEFAULT_PORTS[meta.scheme] ?? null,
    risks,
    score,
    verdict,
    counts,
  };
}
