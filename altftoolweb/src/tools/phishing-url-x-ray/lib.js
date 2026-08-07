/**
 * Phishing URL X-Ray — pure logic.
 *
 * Takes one URL as text and pulls it apart without ever loading it: real RFC 3492
 * punycode decoding, per-label script detection, a confusable skeleton compared against
 * a brand list, registrable-domain extraction, alternate IP-literal notations, and
 * redirect parameters unwrapped through percent- and base64-encoding.
 *
 * No network, no DOM, no Date, no randomness. The same URL always gives the same findings.
 */

/* --------------------------------------------------------- RFC 3492 punycode */

const PUNY_BASE = 36;
const PUNY_TMIN = 1;
const PUNY_TMAX = 26;
const PUNY_SKEW = 38;
const PUNY_DAMP = 700;
const PUNY_INITIAL_BIAS = 72;
const PUNY_INITIAL_N = 128;
const MAX_INT = 0x7fffffff;

function punyAdapt(delta, numPoints, firstTime) {
  let value = firstTime ? Math.floor(delta / PUNY_DAMP) : delta >> 1;
  value += Math.floor(value / numPoints);
  let k = 0;
  while (value > ((PUNY_BASE - PUNY_TMIN) * PUNY_TMAX) >> 1) {
    value = Math.floor(value / (PUNY_BASE - PUNY_TMIN));
    k += PUNY_BASE;
  }
  return k + Math.floor(((PUNY_BASE - PUNY_TMIN + 1) * value) / (value + PUNY_SKEW));
}

function punyDigit(code) {
  if (code >= 0x30 && code <= 0x39) return code - 0x30 + 26; // 0-9 -> 26..35
  if (code >= 0x41 && code <= 0x5a) return code - 0x41; // A-Z -> 0..25
  if (code >= 0x61 && code <= 0x7a) return code - 0x61; // a-z -> 0..25
  return PUNY_BASE;
}

/**
 * Decode one punycode label body (the part after "xn--").
 * @returns {string|null} the Unicode label, or null when the encoding is invalid.
 */
export function punycodeDecode(encoded) {
  if (typeof encoded !== "string" || !encoded) return null;
  const output = [];
  const lastDelimiter = encoded.lastIndexOf("-");
  const basicEnd = lastDelimiter > 0 ? lastDelimiter : 0;

  for (let index = 0; index < basicEnd; index += 1) {
    const code = encoded.charCodeAt(index);
    if (code >= 0x80) return null;
    output.push(code);
  }

  let index = basicEnd > 0 ? basicEnd + 1 : 0;
  let n = PUNY_INITIAL_N;
  let bias = PUNY_INITIAL_BIAS;
  let i = 0;

  while (index < encoded.length) {
    const oldi = i;
    let w = 1;
    for (let k = PUNY_BASE; ; k += PUNY_BASE) {
      if (index >= encoded.length) return null;
      const digit = punyDigit(encoded.charCodeAt(index));
      index += 1;
      if (digit >= PUNY_BASE) return null;
      if (digit > Math.floor((MAX_INT - i) / w)) return null;
      i += digit * w;
      const t = k <= bias ? PUNY_TMIN : k >= bias + PUNY_TMAX ? PUNY_TMAX : k - bias;
      if (digit < t) break;
      if (w > Math.floor(MAX_INT / (PUNY_BASE - t))) return null;
      w *= PUNY_BASE - t;
    }
    const outLength = output.length + 1;
    bias = punyAdapt(i - oldi, outLength, oldi === 0);
    if (Math.floor(i / outLength) > MAX_INT - n) return null;
    n += Math.floor(i / outLength);
    i %= outLength;
    if (n > 0x10ffff) return null;
    output.splice(i, 0, n);
    i += 1;
  }

  try {
    return String.fromCodePoint(...output);
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------ script ranges */

const SCRIPT_RANGES = [
  ["Latin", 0x0041, 0x005a],
  ["Latin", 0x0061, 0x007a],
  ["Latin", 0x00c0, 0x024f],
  ["Latin", 0x1e00, 0x1eff],
  ["Greek", 0x0370, 0x03ff],
  ["Greek", 0x1f00, 0x1fff],
  ["Cyrillic", 0x0400, 0x052f],
  ["Cyrillic", 0x2de0, 0x2dff],
  ["Cyrillic", 0xa640, 0xa69f],
  ["Armenian", 0x0530, 0x058f],
  ["Hebrew", 0x0590, 0x05ff],
  ["Arabic", 0x0600, 0x06ff],
  ["Arabic", 0x0750, 0x077f],
  ["Devanagari", 0x0900, 0x097f],
  ["Bengali", 0x0980, 0x09ff],
  ["Tamil", 0x0b80, 0x0bff],
  ["Thai", 0x0e00, 0x0e7f],
  ["Hangul", 0x1100, 0x11ff],
  ["Hangul", 0xac00, 0xd7af],
  ["Hiragana", 0x3040, 0x309f],
  ["Katakana", 0x30a0, 0x30ff],
  ["Han", 0x3400, 0x4dbf],
  ["Han", 0x4e00, 0x9fff],
];

/**
 * Digits, punctuation and combining marks belong to no single script. This includes every
 * ASCII character that is not a Latin letter — RFC3986 reg-names legally contain far more
 * than "[a-z0-9.-]" (underscore, tilde, and the sub-delims ! $ & ' ( ) * + , ; =), and none
 * of that ASCII punctuation is a script-mixing signal on its own.
 */
function scriptOf(codePoint) {
  const isAsciiLetter = (codePoint >= 0x41 && codePoint <= 0x5a) || (codePoint >= 0x61 && codePoint <= 0x7a);
  if (codePoint < 0x80 && !isAsciiLetter) return "Common";
  if (codePoint >= 0x0300 && codePoint <= 0x036f) return "Common";
  for (const [name, start, end] of SCRIPT_RANGES) {
    if (codePoint >= start && codePoint <= end) return name;
  }
  return "Other";
}

export function scriptsIn(text) {
  const found = [];
  for (const char of text) {
    const script = scriptOf(char.codePointAt(0));
    if (!found.includes(script)) found.push(script);
  }
  return found;
}

/* -------------------------------------------------------------- confusables */

const CONFUSABLES = {
  // Cyrillic
  "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y",
  "х": "x", "і": "i", "ј": "j", "ѕ": "s", "һ": "h", "ԁ": "d",
  "ԛ": "q", "ѵ": "v", "м": "m", "н": "h", "т": "t", "ӏ": "l",
  "к": "k", "в": "b", "г": "r", "Ү": "y", "ү": "y", "ɡ": "g",
  // Greek
  "ο": "o", "α": "a", "ν": "v", "ρ": "p", "κ": "k", "τ": "t",
  "ι": "i", "ε": "e", "υ": "u", "χ": "x", "η": "n", "β": "b",
  // Armenian
  "ո": "n", "ս": "u", "օ": "o", "ց": "g", "ք": "f", "հ": "h",
  // Latin lookalikes that survive NFKD
  "ı": "i", "ł": "l", "ø": "o", "đ": "d", "ħ": "h", "ŧ": "t",
  // Fullwidth
  "ａ": "a", "ｅ": "e", "ｏ": "o",
};

const DIGIT_FOLD = { 0: "o", 1: "l", 3: "e", 5: "s" };

/**
 * UTS #39-style skeleton: strip diacritics, fold confusable characters to Latin,
 * fold the digits that are used as letters, then collapse the classic multi-character
 * substitutions "rn" for "m" and "vv" for "w".
 */
export function skeleton(label) {
  const stripped = label.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  let out = "";
  for (const char of stripped) {
    out += CONFUSABLES[char] || DIGIT_FOLD[char] || char;
  }
  return out.replace(/rn/g, "m").replace(/vv/g, "w");
}

const BRANDS = [
  "paypal", "google", "apple", "icloud", "microsoft", "outlook", "office", "onedrive", "sharepoint",
  "amazon", "facebook", "instagram", "whatsapp", "netflix", "linkedin", "dropbox", "adobe", "docusign",
  "coinbase", "binance", "metamask", "ledger", "trezor", "revolut", "wise", "stripe",
  "chase", "hsbc", "barclays", "natwest", "lloyds", "santander", "citibank", "wellsfargo",
  "dhl", "fedex", "ups", "usps", "royalmail", "evri", "dpd",
  "steam", "roblox", "discord", "telegram", "twitter", "reddit", "github", "gitlab", "slack", "zoom",
  "hmrc", "irs", "gov", "uidai", "aadhaar", "incometax", "epfindia",
  "sbi", "hdfcbank", "icicibank", "axisbank", "paytm", "phonepe", "flipkart", "myntra", "swiggy", "zomato",
];

const BRAND_SKELETONS = BRANDS.map((brand) => ({ brand, skeleton: skeleton(brand) }));

export function levenshtein(a, b) {
  if (a === b) return 0;
  const rows = a.length + 1;
  const cols = b.length + 1;
  let previous = Array.from({ length: cols }, (unused, index) => index);
  for (let i = 1; i < rows; i += 1) {
    const current = [i];
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
    }
    previous = current;
  }
  return previous[cols - 1];
}

/* ------------------------------------------------------------ public suffix */

const MULTI_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "gov.uk", "me.uk", "net.uk", "sch.uk",
  "com.au", "net.au", "org.au", "edu.au", "gov.au",
  "co.in", "net.in", "org.in", "gov.in", "ac.in", "res.in", "firm.in", "gen.in", "ind.in",
  "co.jp", "or.jp", "ne.jp", "ac.jp", "go.jp",
  "com.br", "net.br", "org.br", "gov.br",
  "co.za", "org.za", "net.za", "gov.za",
  "com.cn", "net.cn", "org.cn", "gov.cn",
  "com.mx", "com.ar", "com.tr", "com.sg", "com.hk", "com.tw", "com.my", "com.ph", "com.vn",
  "co.nz", "co.kr", "co.il", "co.th", "com.pk", "com.bd", "com.ng", "com.eg", "com.sa", "com.ua",
  "github.io", "gitlab.io", "pages.dev", "workers.dev", "vercel.app", "netlify.app", "web.app",
  "firebaseapp.com", "herokuapp.com", "azurewebsites.net", "onrender.com", "glitch.me",
  "s3.amazonaws.com", "blob.core.windows.net", "r2.dev", "repl.co", "ngrok.io", "trycloudflare.com",
]);

/** TLDs and hosting suffixes where free or near-free registration keeps abuse rates high. */
const CHEAP_SUFFIXES = new Set([
  "tk", "ml", "ga", "cf", "gq", "xyz", "top", "buzz", "click", "link", "rest", "cyou", "sbs", "icu",
]);

const FILE_LIKE_TLDS = new Set(["zip", "mov"]);

/** Every distinct label-count that appears among MULTI_SUFFIXES, smallest first. */
const MULTI_SUFFIX_LENGTHS = Array.from(new Set(Array.from(MULTI_SUFFIXES, (suffix) => suffix.split(".").length))).sort(
  (a, b) => a - b,
);

export function splitDomain(host) {
  const labels = host.split(".");
  if (labels.length < 2) return { publicSuffix: "", registrable: host, subdomain: "" };
  let suffixLabels = 1;
  for (const n of MULTI_SUFFIX_LENGTHS) {
    if (labels.length < n) continue;
    if (MULTI_SUFFIXES.has(labels.slice(-n).join("."))) suffixLabels = n;
  }
  const registrableCount = suffixLabels + 1;
  if (labels.length < registrableCount) {
    return { publicSuffix: labels.join("."), registrable: labels.join("."), subdomain: "" };
  }
  return {
    publicSuffix: labels.slice(-suffixLabels).join("."),
    registrable: labels.slice(-registrableCount).join("."),
    subdomain: labels.slice(0, labels.length - registrableCount).join("."),
  };
}

/* ------------------------------------------------------------- IP literals */

function toDottedQuad(value) {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff].join(".");
}

/** One IPv4 part, using the same octal / hexadecimal / decimal rules browsers apply. */
function parseIpv4Part(part) {
  if (/^0[xX][0-9a-fA-F]+$/.test(part)) return { value: Number.parseInt(part.slice(2), 16), radix: 16 };
  if (/^0[0-7]+$/.test(part)) return { value: Number.parseInt(part, 8), radix: 8 };
  if (/^(0|[1-9]\d*)$/.test(part)) return { value: Number(part), radix: 10 };
  return null;
}

/**
 * Recognises the alternate integer / hexadecimal / octal notations browsers still accept
 * for an IPv4 host, and reports the dotted-quad they resolve to.
 */
export function decodeHostNumber(host) {
  if (/^\[[0-9a-f:.]+\]$/i.test(host)) return { kind: "ipv6", dotted: host };

  const parts = host.split(".");
  if (parts.length === 0 || parts.length > 4 || parts.some((part) => part === "")) return null;

  const parsed = parts.map(parseIpv4Part);
  if (parsed.some((part) => part === null || !Number.isSafeInteger(part.value) || part.value < 0)) return null;

  for (let index = 0; index < parsed.length - 1; index += 1) {
    if (parsed[index].value > 255) return null;
  }
  const last = parsed[parsed.length - 1].value;
  if (last >= 256 ** (5 - parts.length)) return null;

  let value = last;
  for (let index = 0; index < parsed.length - 1; index += 1) {
    value += parsed[index].value * 256 ** (3 - index);
  }

  const dotted = toDottedQuad(value);
  const canonical = parts.length === 4 && parsed.every((part) => part.radix === 10) && host === dotted;
  if (canonical) return { kind: "ipv4", dotted };
  if (parsed.some((part) => part.radix === 16)) return { kind: "ipv4-hex", dotted };
  if (parsed.some((part) => part.radix === 8)) return { kind: "ipv4-octal", dotted };
  if (parts.length === 1) return { kind: "ipv4-integer", dotted };
  return { kind: "ipv4-short", dotted };
}

/* ------------------------------------------------------------ URL splitting */

const REDIRECT_KEYS = [
  "url", "u", "r", "redirect", "redirect_uri", "redirect_url", "redirecturl", "redir", "next",
  "return", "returnurl", "return_url", "returnto", "continue", "dest", "destination", "target",
  "goto", "go", "link", "out", "to", "forward", "callback", "relaystate", "image_url", "q",
];

const DANGEROUS_EXTENSIONS = [
  "exe", "scr", "hta", "msi", "bat", "cmd", "com", "pif", "vbs", "js", "jar", "apk", "dmg",
  "iso", "img", "lnk", "reg", "ps1", "docm", "xlsm", "pptm",
];

function safeDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function decodeBase64Text(text) {
  const cleaned = text.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  if (cleaned.length < 12 || cleaned.length % 4 === 1) return null;
  if (!/^[A-Za-z0-9+/]+$/.test(cleaned)) return null;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let buffer = 0;
  let bits = 0;
  let out = "";
  for (const char of cleaned) {
    buffer = (buffer << 6) | alphabet.indexOf(char);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      const byte = (buffer >> bits) & 0xff;
      if (byte < 0x20 || byte > 0x7e) return null;
      out += String.fromCharCode(byte);
    }
  }
  return out;
}

function parseQuery(query) {
  const params = [];
  if (!query) return params;
  for (const pair of query.split(/[&;]/)) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    const key = eq === -1 ? pair : pair.slice(0, eq);
    const value = eq === -1 ? "" : pair.slice(eq + 1);
    params.push({ key: safeDecode(key), value: safeDecode(value.replace(/\+/g, " ")) });
  }
  return params;
}

function hostOf(url) {
  const schemeMatch = url.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//);
  if (!schemeMatch) return "";
  const afterScheme = url.slice(schemeMatch[0].length);
  const authorityEnd = afterScheme.search(/[/?#]/);
  const authority = authorityEnd === -1 ? afterScheme : afterScheme.slice(0, authorityEnd);
  // Userinfo can itself contain "@" (e.g. "a@b@evil.com"); the host starts after the LAST "@",
  // matching the main parser's authority.lastIndexOf('@') logic above.
  const at = authority.lastIndexOf("@");
  const hostPart = at === -1 ? authority : authority.slice(at + 1);
  const host = hostPart.split(":")[0];
  return host.toLowerCase();
}

/* ------------------------------------------------------------------ analyse */

export const SEVERITIES = ["high", "medium", "low", "info"];

/**
 * @param {string} input a single URL
 * @returns {{error:string}|object}
 */
export function analyseUrl(input) {
  if (typeof input !== "string" || !input.trim()) {
    return { error: "Paste a URL to take apart. Nothing is loaded — the address is read as text." };
  }

  const raw = input.trim().split(/\s+/)[0];
  const findings = [];
  const add = (severity, title, detail) => findings.push({ severity, title, detail });

  const invisible = raw.match(/[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g);
  if (invisible) {
    add(
      "high",
      `${invisible.length} invisible control character${invisible.length === 1 ? "" : "s"} in the URL`,
      "Zero-width and bidirectional-override characters do not render, but they reorder or hide parts of the address as you read it. There is no legitimate reason for one to appear in a link someone sent you.",
    );
  }

  const schemeMatch = raw.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  const scheme = schemeMatch ? schemeMatch[1].toLowerCase() : "";

  if (scheme && !["http", "https"].includes(scheme)) {
    if (["javascript", "data", "vbscript", "file", "blob"].includes(scheme)) {
      add(
        "high",
        `The scheme is ${scheme}:, not a web address`,
        `A ${scheme}: URL does not go to a website — it runs or loads content in the context of whatever page you are on. Anything that arrives by message or email using this scheme should not be opened.`,
      );
      return {
        raw,
        scheme,
        parsed: false,
        findings,
        counts: countBy(findings),
      };
    }
    add("info", `Non-web scheme: ${scheme}:`, "This is not an http or https address, so the host and path checks below do not apply.");
    return { raw, scheme, parsed: false, findings, counts: countBy(findings) };
  }

  const withoutScheme = scheme ? raw.slice(scheme.length + 1).replace(/^\/\//, "") : raw.replace(/^\/\//, "");
  const authorityEnd = withoutScheme.search(/[/?#]/);
  const authority = authorityEnd === -1 ? withoutScheme : withoutScheme.slice(0, authorityEnd);
  const rest = authorityEnd === -1 ? "" : withoutScheme.slice(authorityEnd);

  if (!authority) {
    return { error: "No host could be read out of that. A URL looks like https://example.com/path." };
  }

  const at = authority.lastIndexOf("@");
  const userinfo = at === -1 ? "" : authority.slice(0, at);
  let hostPort = at === -1 ? authority : authority.slice(at + 1);

  let port = "";
  if (hostPort.startsWith("[")) {
    const close = hostPort.indexOf("]");
    if (close !== -1 && hostPort[close + 1] === ":") {
      port = hostPort.slice(close + 2);
      hostPort = hostPort.slice(0, close + 1);
    }
  } else {
    const colon = hostPort.lastIndexOf(":");
    if (colon !== -1) {
      port = hostPort.slice(colon + 1);
      hostPort = hostPort.slice(0, colon);
    }
  }

  const hostRaw = hostPort;
  const hostPercentDecoded = safeDecode(hostRaw);
  const host = hostPercentDecoded.toLowerCase().replace(/\.$/, "");

  if (!host) {
    return { error: "The address has no host between the scheme and the path." };
  }

  const hasEmptyLabel = host.split(".").some((label) => label === "");
  if (hasEmptyLabel) {
    add(
      "low",
      "The host has an empty label",
      `"${host}" has two dots in a row (or a leading dot), leaving a blank part of the name. No real domain parses this way — browsers and the registrable-domain breakdown below cannot resolve it to anything meaningful.`,
    );
  }

  const queryStart = rest.indexOf("?");
  const hashStart = rest.indexOf("#");
  const pathEnd = queryStart === -1 ? (hashStart === -1 ? rest.length : hashStart) : queryStart;
  const path = rest.slice(0, pathEnd);
  const query = queryStart === -1 ? "" : rest.slice(queryStart + 1, hashStart === -1 ? rest.length : hashStart);
  const fragment = hashStart === -1 ? "" : rest.slice(hashStart + 1);
  const params = parseQuery(query);

  /* ---- scheme ---- */
  if (!scheme) {
    add("low", "No scheme in the address", "Without http:// or https:// you cannot tell from the text alone whether the link will be encrypted. Whoever sent it decides.");
  } else if (scheme === "http") {
    add("medium", "Plain HTTP", "Nothing you type on the page is encrypted, and the page itself can be altered in transit. A real sign-in page has not been served over plain HTTP for years.");
  }

  /* ---- userinfo ---- */
  if (userinfo) {
    add(
      "high",
      "Credentials in front of the host hide the real destination",
      `Everything before the "@" is a username, not an address. This link goes to "${host}", not to "${userinfo.split(":")[0]}" — the part most people read. This is one of the oldest link-disguising tricks there is.`,
    );
  }

  /* ---- host shape ---- */
  const numeric = decodeHostNumber(host);
  let labels = [];
  let domain = { publicSuffix: "", registrable: host, subdomain: "" };

  if (numeric) {
    if (numeric.kind === "ipv4") {
      add("medium", `The host is a bare IP address (${host})`, "Legitimate services put a domain name in front of their servers. A raw address in a link sent to you usually means there is no domain to show, or the sender does not want one recorded.");
    } else if (numeric.kind === "ipv6") {
      add("medium", `The host is a bare IPv6 address (${host})`, "As with IPv4, a numeric host in a link sent to a person is unusual outside internal networks.");
    } else {
      add(
        "high",
        `The host is an IP address written in an unusual notation (${host} = ${numeric.dotted})`,
        `Browsers still accept decimal, hexadecimal and octal forms of an IPv4 address. They exist in phishing links for exactly one reason: to stop the destination being recognisable. This resolves to ${numeric.dotted}.`,
      );
    }
  } else {
    // A host is only genuinely "non-ASCII" if it contains actual unicode characters — RFC3986
    // reg-names legally carry plenty of ASCII punctuation beyond [a-z0-9.-] (underscore, tilde,
    // sub-delims), and none of that should disable per-label punycode decoding below.
    const isAsciiHost = /^[\x00-\x7f]*$/.test(host);
    domain = splitDomain(host);
    labels = host.split(".").map((label) => {
      const isPuny = label.startsWith("xn--");
      const unicode = isPuny ? punycodeDecode(label.slice(4)) : null;
      const display = unicode || label;
      return {
        raw: label,
        punycode: isPuny,
        decoded: unicode,
        display,
        scripts: scriptsIn(display),
        skeleton: skeleton(display),
      };
    });
    if (!isAsciiHost) {
      add("high", "The host contains characters outside the ASCII set browsers show", "A hostname that is not plain ASCII is normally converted to punycode before it is sent. Seeing raw non-ASCII in a pasted link means the display form is being relied on, and the display form is what an attacker controls.");
    }
  }

  if (hostPercentDecoded !== hostRaw) {
    add("high", `The host was percent-encoded (${hostRaw})`, `Encoding characters inside the hostname has no functional purpose; it exists to stop the domain being read at a glance. Decoded, the host is "${host}".`);
  }

  /* ---- punycode and script mixing ---- */
  for (const label of labels) {
    if (label.punycode) {
      if (label.decoded) {
        add(
          "high",
          `Punycode label "${label.raw}" really reads "${label.decoded}"`,
          `Everything starting xn-- is an internationalised domain name. Browsers may show it as "${label.decoded}", which can be visually identical to a name you trust while being an entirely different domain. Scripts used: ${label.scripts.join(", ")}.`,
        );
      } else {
        add("medium", `Punycode label "${label.raw}" does not decode`, "It carries the xn-- prefix but the encoding is invalid, so no browser will render it as a name. Malformed on purpose or by accident, it is not a normal hostname.");
      }
    }
    const realScripts = label.scripts.filter((script) => script !== "Common");
    if (realScripts.length > 1) {
      add(
        "high",
        `Label "${label.display}" mixes ${realScripts.join(" and ")} characters`,
        "Mixing writing systems inside one domain label is the mechanism behind homograph attacks — a single Cyrillic letter in an otherwise Latin word produces a different domain that looks identical. Unicode's own restriction-level guidance treats a mixed-script label as suspect by default.",
      );
    }
  }

  /* ---- lookalike brand match ---- */
  const registrableLabel = domain.registrable ? domain.registrable.split(".")[0] : "";
  const suffixLabelCount = domain.publicSuffix ? domain.publicSuffix.split(".").length : 0;
  const registrableIndex = labels.length - suffixLabelCount - 1;
  const registrableDisplay =
    registrableIndex >= 0 && labels[registrableIndex] ? labels[registrableIndex].display : registrableLabel;
  const registrableSkeleton = skeleton(registrableDisplay || registrableLabel);
  const registrableWords = registrableSkeleton.split(/[^a-z]+/).filter(Boolean);
  const literalLabel = (registrableDisplay || registrableLabel).toLowerCase();

  for (const entry of BRAND_SKELETONS) {
    // The domain really is the brand — nothing to report.
    if (!registrableSkeleton || literalLabel === entry.brand) continue;

    if (registrableSkeleton === entry.skeleton) {
      add(
        "high",
        `The domain renders like "${entry.brand}" but is not it`,
        `Folding the confusable characters in "${registrableDisplay}" gives "${registrableSkeleton}", which is exactly how "${entry.brand}" folds. The two are meant to be indistinguishable on screen.`,
      );
      break;
    }
    if (entry.brand.length >= 5 && registrableWords.length > 1 && registrableWords.includes(entry.brand)) {
      add(
        "medium",
        `"${entry.brand}" is part of the domain name, but the domain is "${domain.registrable}"`,
        `A brand name glued to other words — ${registrableWords.join("-")} — is registered by whoever wanted it, not by the brand. The only part that identifies the owner is the whole label "${registrableDisplay}".`,
      );
      break;
    }
    if (entry.brand.length >= 5 && levenshtein(registrableSkeleton, entry.skeleton) === 1) {
      add(
        "medium",
        `The domain is one character away from "${entry.brand}"`,
        `"${registrableDisplay}" differs from "${entry.brand}" by a single character. That is the shape of a typosquat — registered to catch people who mistype, or who skim a link without reading it.`,
      );
      break;
    }
  }

  /* ---- deceptive subdomain ---- */
  if (domain.subdomain) {
    const subLabels = domain.subdomain.split(".");
    for (const label of subLabels) {
      const folded = skeleton(label);
      const brandHit = BRANDS.find((brand) => folded === brand || folded.replace(/-/g, "") === brand);
      if (brandHit && registrableSkeleton !== brandHit) {
        add(
          "high",
          `"${brandHit}" appears in the subdomain, but the real domain is "${domain.registrable}"`,
          `Only the part immediately before the public suffix decides where a link goes. Anyone can put "${brandHit}" in front of a domain they own — "${host}" belongs to whoever registered "${domain.registrable}".`,
        );
        break;
      }
    }
    if (subLabels.length >= 4) {
      add(
        "medium",
        `${subLabels.length} subdomain levels in front of "${domain.registrable}"`,
        "Long subdomain chains push the real domain off the right-hand edge of a phone's address bar, so the visible part of the URL is the part the sender chose.",
      );
    }
  }

  if (host.length > 40) {
    add("low", `The hostname is ${host.length} characters long`, "Mobile address bars truncate. A long host means the end of it — the part that decides the destination — may never be visible.");
  }

  const hyphenLabels = labels.filter(
    (label) => !label.punycode && (label.raw.match(/-/g) || []).length >= 2,
  );
  if (hyphenLabels.length) {
    add(
      "low",
      `Hyphen-heavy label: "${hyphenLabels[0].raw}"`,
      "Strings such as secure-account-verify read like a sentence rather than a brand. They are cheap to register and common in campaign domains, though plenty of legitimate sites use hyphens too.",
    );
  }

  /* ---- suffix reputation ---- */
  if (domain.publicSuffix) {
    const tld = domain.publicSuffix.split(".").slice(-1)[0];
    if (CHEAP_SUFFIXES.has(tld)) {
      add("medium", `The .${tld} suffix is free or near-free to register`, "Abuse rates on these suffixes are high because a domain costs nothing to burn. It is a reason to look harder, not proof of anything — legitimate sites use them too.");
    }
    if (FILE_LIKE_TLDS.has(tld)) {
      add("medium", `.${tld} is both a real domain suffix and a file extension`, `Text such as "invoice.${tld}" is auto-linked by many messaging apps, so what looks like a file name becomes a clickable domain that someone can register.`);
    }
  }

  /* ---- port ---- */
  if (port && !["80", "443", ""].includes(port)) {
    add("medium", `Non-standard port :${port}`, "Public web services answer on 443. A high port number in a link usually points at something run outside normal hosting.");
  }

  /* ---- path ---- */
  const decodedPath = safeDecode(path);
  if (decodedPath !== path) {
    add("low", "The path is percent-encoded", `Decoded it reads "${decodedPath}". Encoding is normal for spaces and non-ASCII, but heavy encoding also hides keywords from casual reading and from filters.`);
  }
  const extensionMatch = decodedPath.match(/\.([a-z0-9]{2,5})(?:$|[?#])/i);
  if (extensionMatch && DANGEROUS_EXTENSIONS.includes(extensionMatch[1].toLowerCase())) {
    add("high", `The link ends in .${extensionMatch[1].toLowerCase()}`, "This is a downloadable executable or script, not a web page. Following it starts a file transfer rather than opening a site.");
  }
  if (/%25/.test(path) || /%25/.test(query)) {
    add("medium", "Double percent-encoding", "%25 is an encoded percent sign, so the address is encoded twice. Filters and the browser can end up reading different destinations from the same string.");
  }

  /* ---- redirect parameters ---- */
  const redirects = [];
  for (const param of params) {
    const key = param.key.toLowerCase();
    if (!REDIRECT_KEYS.includes(key)) continue;
    const value = param.value;
    let target = "";
    let encoding = "plain";
    if (/^https?:\/\//i.test(value)) {
      target = value;
    } else if (value.startsWith("//")) {
      target = `https:${value}`;
      encoding = "protocol-relative";
    } else {
      const decoded = decodeBase64Text(value);
      if (decoded && /^https?:\/\//i.test(decoded)) {
        target = decoded;
        encoding = "base64";
      }
    }
    if (!target) continue;
    const targetHost = hostOf(target);
    redirects.push({ param: param.key, value, target, targetHost, encoding });
  }

  for (const redirect of redirects) {
    if (redirect.encoding === "base64") {
      add(
        "high",
        `The "${redirect.param}" parameter carries a base64-encoded address`,
        `It decodes to ${redirect.target}. Encoding the destination keeps it out of the visible URL and past anything that only reads the plain text.`,
      );
    }
    if (redirect.targetHost && redirect.targetHost !== host) {
      add(
        "high",
        `This link forwards to a different site: ${redirect.targetHost}`,
        `The "${redirect.param}" parameter points at ${redirect.target}. You would land on ${redirect.targetHost} while the address you clicked said ${host} — that is an open redirect being used to borrow a trusted domain's reputation.`,
      );
    } else if (redirect.encoding === "protocol-relative") {
      add("medium", `The "${redirect.param}" parameter uses a protocol-relative address`, `A value starting "//" inherits the current scheme and still changes host. It resolves to ${redirect.target}.`);
    }
  }

  /* ---- fragment ---- */
  if (fragment && /^https?:\/\//i.test(fragment)) {
    add("medium", "A full URL sits in the fragment", `Everything after "#" never reaches the server, so a destination hidden there is handled entirely by script on the page — and it does not show up in server-side link scanning. It reads ${fragment}.`);
  }
  if (fragment && /@/.test(fragment)) {
    add("low", "The fragment contains an email address", "Prefilled address fragments are used to personalise a phishing page and to confirm to the sender that the link was opened by the intended person.");
  }

  /* ---- credential-ish params ---- */
  const sensitive = params.filter((param) => /^(pass|password|pwd|token|api_?key|secret|otp|session|sid)$/i.test(param.key));
  if (sensitive.length) {
    add("medium", `Credential-shaped parameter in the query: ${sensitive.map((param) => param.key).join(", ")}`, "Query strings are written to browser history, proxy logs and server logs, and are sent in the Referer header. Nothing secret belongs there whoever built the link.");
  }

  if (!findings.length) {
    add("info", "No structural deception signal found", "The address parses cleanly: one script per label, no punycode, no credentials before the host, no redirect parameter, no numeric host. That is not the same as safe — a brand-new domain with an ordinary name looks exactly like this. Verify the destination independently before signing in.");
  }

  const order = { high: 0, medium: 1, low: 2, info: 3 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    raw,
    parsed: true,
    scheme: scheme || "(none)",
    userinfo,
    host,
    hostRaw,
    port,
    path: path || "/",
    query: params,
    fragment,
    labels,
    domain,
    numeric,
    redirects,
    findings,
    counts: countBy(findings),
  };
}

function countBy(findings) {
  const counts = { high: 0, medium: 0, low: 0, info: 0 };
  for (const finding of findings) counts[finding.severity] += 1;
  return counts;
}

export function formatUrlReport(result) {
  if (!result || result.error) return "";
  const lines = ["Phishing URL X-Ray", "", `URL: ${result.raw}`];
  if (result.parsed) {
    lines.push(`Scheme: ${result.scheme}`);
    lines.push(`Host: ${result.host}`);
    if (result.domain && result.domain.registrable) {
      lines.push(`Registrable domain: ${result.domain.registrable}`);
      if (result.domain.subdomain) lines.push(`Subdomain: ${result.domain.subdomain}`);
    }
    if (result.userinfo) lines.push(`Credentials before the host: ${result.userinfo}`);
    for (const label of result.labels || []) {
      if (label.punycode) lines.push(`Punycode: ${label.raw} -> ${label.decoded || "(invalid)"}`);
    }
    for (const redirect of result.redirects || []) {
      lines.push(`Redirect parameter ${redirect.param} -> ${redirect.target}`);
    }
  }
  lines.push("");
  lines.push(`Findings: ${result.counts.high} high, ${result.counts.medium} medium, ${result.counts.low} low`);
  for (const finding of result.findings) {
    lines.push(`  [${finding.severity.toUpperCase()}] ${finding.title}`);
    lines.push(`    ${finding.detail}`);
  }
  lines.push("");
  lines.push("The address was read as text. It was not opened, resolved or looked up anywhere.");
  return lines.join("\n");
}
