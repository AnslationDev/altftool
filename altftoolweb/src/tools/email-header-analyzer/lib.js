/**
 * Email header analyzer.
 *
 * Parses a pasted RFC 5322 header block and reports:
 *  - the unfolded header fields, in order, with duplicate detection
 *  - the Received chain (RFC 5321 trace fields), chronologically, with real
 *    per-hop delays computed from the timestamps in the headers themselves
 *  - Authentication-Results (RFC 8601), Received-SPF (RFC 7208) and
 *    DKIM-Signature (RFC 6376) tag values
 *  - DMARC identifier alignment (RFC 7489 section 3.1) recomputed locally from
 *    the From domain against the SPF MAIL FROM domain and the DKIM d= domain
 *  - address-level spoofing signals (display-name spoof, Reply-To and
 *    Return-Path divergence, Message-ID domain mismatch)
 *
 * Everything is derived from the pasted text. There is no network lookup, so
 * this cannot fetch the published SPF/DMARC records, cannot resolve DNS and
 * cannot verify a DKIM signature cryptographically. Where a verdict depends on
 * something only a receiving MTA can know, the finding says so.
 *
 * Pure functions: no React, no DOM, no clock reads, no randomness.
 */

/* ------------------------------------------------------------------ */
/* Domains                                                             */
/* ------------------------------------------------------------------ */

/**
 * Two-label public suffixes common in mail. Used only to approximate the
 * organizational domain for DMARC relaxed alignment; it is not the full
 * Public Suffix List.
 */
export const MULTI_LABEL_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "gov.uk", "me.uk", "net.uk", "sch.uk",
  "co.in", "net.in", "org.in", "gen.in", "firm.in", "ind.in", "gov.in", "ac.in",
  "com.au", "net.au", "org.au", "edu.au", "gov.au",
  "co.nz", "net.nz", "org.nz",
  "co.jp", "or.jp", "ne.jp", "ac.jp", "go.jp",
  "com.br", "com.mx", "com.ar", "com.co",
  "co.za", "org.za",
  "com.sg", "com.hk", "com.cn", "net.cn", "org.cn", "gov.cn",
  "co.kr", "or.kr", "com.tr", "com.tw", "com.my", "com.ph", "com.vn",
  "co.il", "co.id", "co.th", "com.pk", "com.eg", "com.sa", "com.ua",
]);

/** Lower-case, strip a trailing dot, strip a leading "@". */
export function normalizeDomain(value) {
  return String(value == null ? "" : value)
    .trim()
    .replace(/^@/, "")
    .replace(/\.$/, "")
    .toLowerCase();
}

/**
 * Approximate the organizational domain: the registrable name plus its public
 * suffix. "mail.corp.example.co.uk" -> "example.co.uk".
 */
export function organizationalDomain(domain) {
  const clean = normalizeDomain(domain);
  if (!clean || clean.indexOf(".") === -1) return clean;
  const parts = clean.split(".").filter(Boolean);
  if (parts.length <= 2) return parts.join(".");
  const lastTwo = parts.slice(-2).join(".");
  if (MULTI_LABEL_SUFFIXES.has(lastTwo)) return parts.slice(-3).join(".");
  return lastTwo;
}

/**
 * DMARC identifier alignment (RFC 7489 3.1). "strict" requires an exact domain
 * match; "relaxed" — the default — requires the organizational domains to match.
 */
export function alignmentOf(fromDomain, authDomain) {
  const a = normalizeDomain(fromDomain);
  const b = normalizeDomain(authDomain);
  if (!a || !b) return "unknown";
  if (a === b) return "strict";
  if (organizationalDomain(a) && organizationalDomain(a) === organizationalDomain(b)) {
    return "relaxed";
  }
  return "none";
}

/* ------------------------------------------------------------------ */
/* RFC 2047 encoded words                                              */
/* ------------------------------------------------------------------ */

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64ToBytes(input) {
  const bytes = [];
  let buffer = 0;
  let bits = 0;
  const text = String(input);
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "=") break;
    const value = BASE64_ALPHABET.indexOf(ch);
    if (value < 0) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytes;
}

function utf8FromBytes(bytes) {
  let out = "";
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    if (b < 0x80) {
      out += String.fromCharCode(b);
      i += 1;
    } else if (b >= 0xc2 && b <= 0xdf && i + 1 < bytes.length) {
      out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else if (b >= 0xe0 && b <= 0xef && i + 2 < bytes.length) {
      out += String.fromCharCode(
        ((b & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f),
      );
      i += 3;
    } else if (b >= 0xf0 && b <= 0xf4 && i + 3 < bytes.length) {
      const cp =
        ((b & 0x07) << 18) |
        ((bytes[i + 1] & 0x3f) << 12) |
        ((bytes[i + 2] & 0x3f) << 6) |
        (bytes[i + 3] & 0x3f);
      out += String.fromCodePoint(cp);
      i += 4;
    } else {
      out += "�";
      i += 1;
    }
  }
  return out;
}

function latin1FromBytes(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) out += String.fromCharCode(bytes[i]);
  return out;
}

function quotedPrintableToBytes(input) {
  const bytes = [];
  const text = String(input);
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "_") {
      bytes.push(0x20);
    } else if (ch === "=" && /^[0-9A-Fa-f]{2}$/.test(text.slice(i + 1, i + 3))) {
      bytes.push(parseInt(text.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(ch.charCodeAt(0) & 0xff);
    }
  }
  return bytes;
}

const ENCODED_WORD_RE = /=\?([A-Za-z0-9_.:+-]+)\?([BbQq])\?([^?]*)\?=/g;

/**
 * Decode RFC 2047 encoded words ("=?utf-8?B?...?=") inside a header value.
 * Only UTF-8 and single-byte Latin-1 style charsets are handled; anything else
 * falls back to a byte-for-byte reading, which is still more readable than raw.
 */
export function decodeEncodedWords(value) {
  const text = String(value == null ? "" : value);
  ENCODED_WORD_RE.lastIndex = 0;
  return text.replace(ENCODED_WORD_RE, (whole, charset, encoding, data) => {
    const bytes = encoding.toLowerCase() === "b"
      ? base64ToBytes(data)
      : quotedPrintableToBytes(data);
    if (!bytes.length) return "";
    const cs = String(charset).toLowerCase();
    return cs === "utf-8" || cs === "utf8" ? utf8FromBytes(bytes) : latin1FromBytes(bytes);
  });
}

/** Codepoints that render as nothing but change how the rest of a line reads. */
export const INVISIBLE_RE = /[­᠎​-‏‪-‮⁠-⁤⁦-⁩﻿]/;

/* ------------------------------------------------------------------ */
/* Header block                                                        */
/* ------------------------------------------------------------------ */

/**
 * Unfold and split a header block (RFC 5322 section 2.2.3). Folding is undone
 * by joining continuation lines — those starting with a space or tab — onto the
 * field before them. Parsing stops at the first empty line, which separates the
 * headers from the body.
 */
export function parseHeaderBlock(raw) {
  const text = String(raw == null ? "" : raw).replace(/\r\n?/g, "\n");
  const lines = text.split("\n");
  const headers = [];
  let current = null;
  let started = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim() === "") {
      if (!started) continue;
      break;
    }
    if (/^[ \t]/.test(line)) {
      if (current) {
        current.value = `${current.value} ${line.trim()}`.trim();
        current.foldedLines += 1;
      }
      continue;
    }
    const match = line.match(/^([\x21-\x39\x3b-\x7e]+)[ \t]*:[ \t]?([\s\S]*)$/);
    if (!match) {
      // Not a field and not a continuation — e.g. an mbox "From " separator.
      if (current) current.value = `${current.value} ${line.trim()}`.trim();
      continue;
    }
    started = true;
    current = {
      name: match[1],
      key: match[1].toLowerCase(),
      value: match[2].trim(),
      index: headers.length,
      foldedLines: 0,
    };
    headers.push(current);
  }
  return headers;
}

function firstHeader(headers, key) {
  return headers.find((header) => header.key === key) || null;
}

function allHeaders(headers, key) {
  return headers.filter((header) => header.key === key);
}

/* ------------------------------------------------------------------ */
/* Addresses                                                           */
/* ------------------------------------------------------------------ */

/**
 * Locate the angle-addr, ignoring any "<" or ">" that sits inside a quoted
 * display name. A phish writes From: "Support <help@bank.example>" <x@evil.net>
 * precisely so a naive first-match parser reads the wrong address.
 */
function findAngleAddr(raw) {
  let quoted = false;
  let start = -1;
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch === "\\" && quoted) {
      i += 1;
      continue;
    }
    if (ch === '"') {
      quoted = !quoted;
      continue;
    }
    if (quoted) continue;
    if (ch === "<") start = i;
    else if (ch === ">" && start >= 0) return { start, end: i, inner: raw.slice(start + 1, i) };
  }
  return null;
}

/**
 * Pull the first mailbox out of an address header. Returns the display name as
 * written, the addr-spec and its domain.
 */
export function parseAddress(value) {
  const raw = String(value == null ? "" : value).trim();
  if (!raw) {
    return { raw: "", display: "", displayDecoded: "", address: "", domain: "", local: "" };
  }

  const angle = findAngleAddr(raw);
  const address = angle
    ? angle.inner.trim()
    : (raw.match(/[^\s<>,;:"]+@[^\s<>,;:"]+/) || [""])[0];

  let display = angle ? raw.slice(0, angle.start).trim() : raw.replace(address, "").trim();
  display = display.replace(/^"(.*)"$/s, "$1").trim();
  if (display.endsWith(",")) display = display.slice(0, -1).trim();

  const at = address.lastIndexOf("@");
  return {
    raw,
    display,
    displayDecoded: decodeEncodedWords(display),
    address,
    local: at >= 0 ? address.slice(0, at) : address,
    domain: at >= 0 ? normalizeDomain(address.slice(at + 1)) : "",
  };
}

/* ------------------------------------------------------------------ */
/* Small parsing helpers                                               */
/* ------------------------------------------------------------------ */

/** Split on a separator, ignoring separators inside CFWS parentheses. */
export function splitOutsideComments(value, separator) {
  const text = String(value == null ? "" : value);
  const out = [];
  let depth = 0;
  let buffer = "";
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === separator && depth === 0) {
      out.push(buffer);
      buffer = "";
      continue;
    }
    buffer += ch;
  }
  out.push(buffer);
  return out;
}

/** Remove balanced ( ... ) comments from a header value. */
export function stripComments(value) {
  const text = String(value == null ? "" : value);
  let depth = 0;
  let out = "";
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "(") {
      depth += 1;
      continue;
    }
    if (ch === ")") {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0) out += ch;
  }
  return out.replace(/\s+/g, " ").trim();
}

const IPV4_RE = /\b((?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})\b/;
const IPV6_RE = /\b(?:IPv6:)?((?:[0-9A-Fa-f]{0,4}:){2,7}[0-9A-Fa-f]{0,4}(?:%[0-9A-Za-z]+)?)\b/;

/** Classify an IPv4 literal as public, private, loopback or link-local. */
export function classifyIpv4(ip) {
  const parts = String(ip == null ? "" : ip).split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return "invalid";
  }
  const [a, b] = parts;
  if (a === 127) return "loopback";
  if (a === 10) return "private";
  if (a === 172 && b >= 16 && b <= 31) return "private";
  if (a === 192 && b === 168) return "private";
  if (a === 169 && b === 254) return "link-local";
  if (a === 100 && b >= 64 && b <= 127) return "carrier-nat";
  if (a === 0) return "reserved";
  return "public";
}

/** Format a signed millisecond duration the way a trace log reads. */
export function formatDuration(ms) {
  if (ms == null || !Number.isFinite(ms)) return "—";
  const sign = ms < 0 ? "-" : "";
  const total = Math.abs(Math.round(ms / 1000));
  if (total < 60) return `${sign}${total}s`;
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes < 60) return `${sign}${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${sign}${hours}h ${minutes % 60}m`;
}

/** Date.parse over a header date string; null when it is not a usable date. */
function parseHeaderDate(value) {
  if (!value) return null;
  const cleaned = stripComments(String(value)).trim();
  if (!cleaned) return null;
  const ms = Date.parse(cleaned);
  return Number.isFinite(ms) ? ms : null;
}

function isoOf(ms) {
  if (ms == null || !Number.isFinite(ms)) return "";
  return new Date(ms).toISOString().replace(".000Z", "Z");
}

/* ------------------------------------------------------------------ */
/* Received (RFC 5321 section 4.4)                                     */
/* ------------------------------------------------------------------ */

/**
 * Parse one Received field into its trace clauses. The date is whatever follows
 * the final semicolon that sits outside a comment.
 */
export function parseReceived(value) {
  const raw = String(value == null ? "" : value).trim();
  const segments = splitOutsideComments(raw, ";");
  const dateText = segments.length > 1 ? segments[segments.length - 1].trim() : "";
  const body = segments.length > 1 ? segments.slice(0, -1).join(";") : raw;
  const bare = stripComments(body);

  const fromMatch = bare.match(/\bfrom\s+([^\s;]+)/i);
  const byMatch = bare.match(/\bby\s+([^\s;]+)/i);
  const withMatch = bare.match(/\bwith\s+([A-Za-z0-9_.\-/]+)/i);
  const idMatch = bare.match(/\bid\s+([^\s;]+)/i);
  const forMatch = bare.match(/\bfor\s+<?([^\s<>;]+)>?/i);

  const ipv4 = body.match(IPV4_RE);
  const ipv6 = ipv4 ? null : body.match(IPV6_RE);

  // The reverse-DNS name a receiving MTA writes in the parenthesised comment,
  // e.g. "from mail.example.com (relay.isp.net [203.0.113.9])".
  const commentMatch = body.match(/\bfrom\s+[^\s(]+\s*\(([^)]*)\)/i);
  let reverseDns = "";
  if (commentMatch) {
    const inner = commentMatch[1].trim();
    const host = inner.match(/^([A-Za-z0-9._-]+)/);
    if (host && host[1].indexOf(".") !== -1 && !IPV4_RE.test(host[1])) reverseDns = host[1].toLowerCase();
    if (/\bunknown\b|\bno\s+reverse\b|helo=/i.test(inner) && !reverseDns) reverseDns = "";
  }

  const dateMs = parseHeaderDate(dateText);

  return {
    raw,
    from: fromMatch ? fromMatch[1].replace(/[.;,]$/, "").toLowerCase() : "",
    by: byMatch ? byMatch[1].replace(/[.;,]$/, "").toLowerCase() : "",
    with: withMatch ? withMatch[1].toUpperCase() : "",
    id: idMatch ? idMatch[1].replace(/[;,]$/, "") : "",
    for: forMatch ? forMatch[1].replace(/[;,]$/, "") : "",
    ip: ipv4 ? ipv4[1] : ipv6 ? ipv6[1] : "",
    ipVersion: ipv4 ? 4 : ipv6 ? 6 : 0,
    ipScope: ipv4 ? classifyIpv4(ipv4[1]) : ipv6 ? "public" : "",
    reverseDns,
    dateText,
    dateMs,
    dateIso: isoOf(dateMs),
  };
}

/**
 * Received fields are prepended by each MTA, so the first one in the block is
 * the last hop. This returns them oldest-first, numbered from the origin, with
 * the delay each hop added.
 */
export function buildHopChain(headers) {
  const received = allHeaders(headers, "received").map((header) => parseReceived(header.value));
  const chain = received.slice().reverse();
  let previousMs = null;
  return chain.map((hop, index) => {
    const delayMs = hop.dateMs != null && previousMs != null ? hop.dateMs - previousMs : null;
    if (hop.dateMs != null) previousMs = hop.dateMs;
    return { ...hop, hop: index + 1, delayMs };
  });
}

/* ------------------------------------------------------------------ */
/* Authentication-Results (RFC 8601)                                   */
/* ------------------------------------------------------------------ */

const AUTH_METHODS = ["spf", "dkim", "dmarc", "arc", "iprev", "auth", "bimi", "dkim-adsp", "sender-id"];

/**
 * Parse one Authentication-Results field: the authserv-id followed by
 * semicolon-separated "method=result" clauses each carrying ptype.property
 * pairs such as smtp.mailfrom= or header.d=.
 */
export function parseAuthenticationResults(value) {
  const parts = splitOutsideComments(String(value == null ? "" : value), ";")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return { authservId: "", methods: [] };

  const first = stripComments(parts[0]);
  const looksLikeMethod = AUTH_METHODS.some((method) =>
    new RegExp(`^${method}\\s*=`, "i").test(first),
  );
  const authservId = looksLikeMethod ? "" : first.split(/\s+/)[0] || "";
  const clauses = looksLikeMethod ? parts : parts.slice(1);

  const methods = [];
  for (const clause of clauses) {
    const bare = stripComments(clause);
    const head = bare.match(/^([A-Za-z][A-Za-z0-9-]*)\s*=\s*([A-Za-z]+)/);
    if (!head) continue;
    const method = head[1].toLowerCase();
    if (!AUTH_METHODS.includes(method)) continue;
    const properties = {};
    const propRe = /([A-Za-z]+)\.([A-Za-z0-9_-]+)\s*=\s*("[^"]*"|[^\s;]+)/g;
    let match = propRe.exec(bare);
    while (match) {
      properties[`${match[1].toLowerCase()}.${match[2].toLowerCase()}`] = match[3].replace(/^"|"$/g, "");
      match = propRe.exec(bare);
    }
    const commentMatch = clause.match(/\(([^)]*)\)/);
    methods.push({
      method,
      result: head[2].toLowerCase(),
      properties,
      comment: commentMatch ? commentMatch[1].trim() : "",
      raw: clause.trim(),
    });
  }
  return { authservId, methods };
}

/** Received-SPF (RFC 7208 section 9.1): "Pass (comment) key=value; key=value". */
export function parseReceivedSpf(value) {
  const raw = String(value == null ? "" : value).trim();
  const resultMatch = stripComments(raw).match(/^([A-Za-z]+)/);
  const properties = {};
  const propRe = /([A-Za-z-]+)\s*=\s*("[^"]*"|[^\s;]+)/g;
  const bare = stripComments(raw);
  let match = propRe.exec(bare);
  while (match) {
    properties[match[1].toLowerCase()] = match[2].replace(/^"|"$/g, "");
    match = propRe.exec(bare);
  }
  const comment = (raw.match(/\(([^)]*)\)/) || ["", ""])[1].trim();
  return {
    raw,
    result: resultMatch ? resultMatch[1].toLowerCase() : "",
    clientIp: properties["client-ip"] || "",
    helo: properties.helo || "",
    envelopeFrom: normalizeDomain((properties["envelope-from"] || "").replace(/^.*@/, "")),
    comment,
    properties,
  };
}

/* ------------------------------------------------------------------ */
/* DKIM-Signature (RFC 6376 section 3.5)                               */
/* ------------------------------------------------------------------ */

/** Parse the tag=value list of a DKIM-Signature or ARC-Message-Signature. */
export function parseDkimSignature(value) {
  const tags = {};
  const text = String(value == null ? "" : value);
  for (const part of text.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim().toLowerCase();
    if (!/^[a-z][a-z0-9_]*$/.test(key)) continue;
    tags[key] = part.slice(eq + 1).replace(/\s+/g, "").trim();
  }

  const signedHeaders = (tags.h || "")
    .split(":")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const canon = (tags.c || "simple/simple").toLowerCase();
  const signedAt = tags.t && /^\d+$/.test(tags.t) ? Number(tags.t) * 1000 : null;
  const expiresAt = tags.x && /^\d+$/.test(tags.x) ? Number(tags.x) * 1000 : null;

  return {
    version: tags.v || "",
    algorithm: (tags.a || "").toLowerCase(),
    canonicalization: canon,
    headerCanon: canon.split("/")[0] || "simple",
    bodyCanon: canon.split("/")[1] || "simple",
    domain: normalizeDomain(tags.d || ""),
    selector: tags.s || "",
    identity: tags.i || "",
    signedHeaders,
    bodyHash: tags.bh || "",
    signature: tags.b || "",
    bodyLength: tags.l && /^\d+$/.test(tags.l) ? Number(tags.l) : null,
    signedAt,
    signedAtIso: isoOf(signedAt),
    expiresAt,
    expiresAtIso: isoOf(expiresAt),
    queryMethod: tags.q || "dns/txt",
    dnsRecordName: tags.s && tags.d ? `${tags.s}._domainkey.${normalizeDomain(tags.d)}` : "",
    tags,
  };
}

/* ------------------------------------------------------------------ */
/* Analysis                                                            */
/* ------------------------------------------------------------------ */

/** Fields RFC 5322 allows at most once in a message. */
const SINGLETON_FIELDS = ["from", "date", "subject", "message-id", "sender", "reply-to", "return-path"];

function finding(level, title, detail, evidence) {
  return { level, title, detail, evidence: evidence || "" };
}

/**
 * Analyze a pasted header block.
 *
 * @param {string} raw the header text
 * @returns {object} either { error } or the full report
 */
export function analyzeEmailHeaders(raw) {
  const text = String(raw == null ? "" : raw);
  if (!text.trim()) return { error: "Paste an email header block to analyse." };

  const headers = parseHeaderBlock(text);
  if (!headers.length) {
    return {
      error:
        "No header fields found. Headers look like \"Name: value\" one per line — use your mail client's \"show original\" or \"view source\" view.",
    };
  }

  const fromHeader = firstHeader(headers, "from");
  const from = parseAddress(fromHeader ? fromHeader.value : "");
  const replyToHeader = firstHeader(headers, "reply-to");
  const replyTo = parseAddress(replyToHeader ? replyToHeader.value : "");
  const returnPathHeader = firstHeader(headers, "return-path");
  const returnPath = parseAddress(returnPathHeader ? returnPathHeader.value : "");
  const senderHeader = firstHeader(headers, "sender");
  const sender = parseAddress(senderHeader ? senderHeader.value : "");
  const toHeader = firstHeader(headers, "to");
  const to = parseAddress(toHeader ? toHeader.value : "");
  const subjectHeader = firstHeader(headers, "subject");
  const subjectRaw = subjectHeader ? subjectHeader.value : "";
  const subject = decodeEncodedWords(subjectRaw);
  const messageIdHeader = firstHeader(headers, "message-id");
  const messageId = messageIdHeader ? messageIdHeader.value.trim() : "";
  const messageIdDomain = normalizeDomain((messageId.match(/@([^>\s]+)>?/) || ["", ""])[1]);
  const dateHeader = firstHeader(headers, "date");
  const dateMs = parseHeaderDate(dateHeader ? dateHeader.value : "");

  const hops = buildHopChain(headers);
  const originHop = hops.length ? hops[0] : null;
  const lastHop = hops.length ? hops[hops.length - 1] : null;
  const transitMs =
    originHop && lastHop && originHop.dateMs != null && lastHop.dateMs != null
      ? lastHop.dateMs - originHop.dateMs
      : null;

  const authResultsHeaders = allHeaders(headers, "authentication-results").map((header) => ({
    header: header.value,
    ...parseAuthenticationResults(header.value),
  }));
  const arcAuthResults = allHeaders(headers, "arc-authentication-results").map((header) => ({
    header: header.value,
    ...parseAuthenticationResults(header.value),
  }));
  const receivedSpf = allHeaders(headers, "received-spf").map((header) => parseReceivedSpf(header.value));
  const dkimSignatures = allHeaders(headers, "dkim-signature").map((header) =>
    parseDkimSignature(header.value),
  );
  const arcSeals = allHeaders(headers, "arc-seal").map((header) => parseDkimSignature(header.value));

  const allMethods = authResultsHeaders.flatMap((entry) => entry.methods);
  const methodResult = (name) => {
    const hit = allMethods.filter((item) => item.method === name);
    return hit.length ? hit[0] : null;
  };
  const spfMethod = methodResult("spf");
  const dkimMethods = allMethods.filter((item) => item.method === "dkim");
  const dmarcMethod = methodResult("dmarc");

  const spfResult = (spfMethod && spfMethod.result) || (receivedSpf[0] && receivedSpf[0].result) || "";
  const spfDomain = normalizeDomain(
    (spfMethod &&
      (spfMethod.properties["smtp.mailfrom"] || spfMethod.properties["smtp.helo"] || "").replace(
        /^.*@/,
        "",
      )) ||
      (receivedSpf[0] && receivedSpf[0].envelopeFrom) ||
      returnPath.domain ||
      "",
  );

  // DMARC alignment, recomputed here from the From domain rather than trusted
  // from the Authentication-Results line.
  const spfAlignment = alignmentOf(from.domain, spfDomain);
  const dkimAlignments = dkimSignatures.map((sig) => ({
    domain: sig.domain,
    selector: sig.selector,
    alignment: alignmentOf(from.domain, sig.domain),
  }));
  const reportedDkimAlignments = dkimMethods.map((item) => {
    const domain = normalizeDomain(
      (item.properties["header.d"] || item.properties["header.i"] || "").replace(/^.*@/, ""),
    );
    return { domain, result: item.result, alignment: alignmentOf(from.domain, domain) };
  });

  const spfAlignedPass = spfResult === "pass" && (spfAlignment === "strict" || spfAlignment === "relaxed");
  const dkimAlignedPass = reportedDkimAlignments.some(
    (item) => item.result === "pass" && (item.alignment === "strict" || item.alignment === "relaxed"),
  );
  const dmarcLocal = !from.domain
    ? "unknown"
    : spfAlignedPass || dkimAlignedPass
      ? "pass"
      : allMethods.length
        ? "fail"
        : "unknown";

  /* ---------------------------- findings ---------------------------- */

  const findings = [];

  if (!fromHeader) {
    findings.push(
      finding("fail", "No From header", "RFC 5322 requires exactly one From field. Its absence means this is not a complete header block, or the field was stripped."),
    );
  } else if (!from.domain) {
    findings.push(
      finding("warn", "From header has no parsable address", "No addr-spec of the form local@domain was found, so no authentication domain can be aligned against it.", from.raw),
    );
  }

  const duplicates = SINGLETON_FIELDS.map((key) => ({
    key,
    count: allHeaders(headers, key).length,
  })).filter((item) => item.count > 1);
  for (const dup of duplicates) {
    findings.push(
      finding(
        "fail",
        `${dup.count} ${dup.key} headers`,
        "RFC 5322 allows this field at most once. Duplicates are a classic header-injection artefact: many clients display the first, while filters read the last.",
      ),
    );
  }

  // SPF
  if (!spfResult) {
    findings.push(
      finding("warn", "No SPF result recorded", "Neither an Authentication-Results spf= clause nor a Received-SPF field is present, so the receiving side either did not check SPF or the field was removed."),
    );
  } else if (spfResult === "pass") {
    findings.push(
      finding(
        spfAlignedPass ? "pass" : "warn",
        `SPF pass for ${spfDomain || "an unrecorded domain"}`,
        spfAlignedPass
          ? `The envelope sender aligns with the From domain (${spfAlignment} alignment), so SPF alone can satisfy DMARC.`
          : `SPF passed, but for ${spfDomain || "an unrecorded domain"}, which does not align with the From domain ${from.domain || "(none)"}. A pass on an unrelated bounce domain is exactly what a forwarded or spoofed message looks like.`,
        spfMethod ? spfMethod.raw : receivedSpf[0] && receivedSpf[0].raw,
      ),
    );
  } else if (spfResult === "fail" || spfResult === "softfail") {
    findings.push(
      finding("fail", `SPF ${spfResult}`, "The sending IP is not authorised by the envelope domain's SPF record. Softfail means the domain asked for the message to be accepted but marked.", spfMethod ? spfMethod.raw : receivedSpf[0] && receivedSpf[0].raw),
    );
  } else {
    findings.push(
      finding("warn", `SPF ${spfResult}`, "Anything other than pass or fail — none, neutral, permerror, temperror — means SPF gave no usable answer here.", spfMethod ? spfMethod.raw : ""),
    );
  }

  // DKIM
  if (!dkimSignatures.length && !dkimMethods.length) {
    findings.push(
      finding("warn", "No DKIM signature", "There is no DKIM-Signature field and no dkim= result, so nothing in the message body or headers is cryptographically bound to a domain."),
    );
  }
  for (const item of reportedDkimAlignments) {
    if (item.result === "none" || !item.domain) {
      findings.push(
        finding(
          "warn",
          `DKIM ${item.result || "not evaluated"}`,
          "The receiver recorded a DKIM clause but no signing domain, which means the message carried no signature it could check.",
        ),
      );
      continue;
    }
    const aligned = item.alignment === "strict" || item.alignment === "relaxed";
    findings.push(
      finding(
        item.result === "pass" ? (aligned ? "pass" : "warn") : "fail",
        `DKIM ${item.result} for d=${item.domain}`,
        aligned
          ? item.result === "pass"
            ? `Signature verified and the signing domain aligns (${item.alignment}).`
            : "The receiving server could not verify this signature."
          : `The signing domain does not share an organizational domain with the From domain ${from.domain || "(none)"}, so this signature cannot satisfy DMARC even if it verified.`,
      ),
    );
  }
  for (const sig of dkimSignatures) {
    if (sig.signedHeaders.length && !sig.signedHeaders.includes("from")) {
      findings.push(
        finding("fail", `DKIM signature by ${sig.domain} does not cover From`, "RFC 6376 requires the From field to be signed. A signature over everything except From lets the visible sender be rewritten without breaking it.", `h=${sig.signedHeaders.join(":")}`),
      );
    }
    if (sig.bodyLength != null) {
      findings.push(
        finding("warn", `DKIM l=${sig.bodyLength} body length limit`, "Only the first bytes of the body are covered. Anything appended after that byte count is unsigned and can be added in transit without invalidating the signature.", `l=${sig.bodyLength}`),
      );
    }
    if (sig.algorithm === "rsa-sha1") {
      findings.push(
        finding("fail", "DKIM uses rsa-sha1", "RFC 8301 deprecated SHA-1 in DKIM in 2018; signers must use rsa-sha256 or ed25519-sha256.", `a=${sig.algorithm}`),
      );
    }
    if (sig.expiresAt != null && sig.signedAt != null && sig.expiresAt <= sig.signedAt) {
      findings.push(
        finding("warn", "DKIM x= is not after t=", "The signature expiry is at or before its own signing time, which makes the signature invalid on arrival by its own terms.", `t=${sig.tags.t} x=${sig.tags.x}`),
      );
    }
    if (sig.expiresAt != null && dateMs != null && sig.expiresAt < dateMs) {
      findings.push(
        finding("warn", "DKIM signature expired before the Date header", `The signature expired at ${sig.expiresAtIso}, earlier than the message Date of ${isoOf(dateMs)}.`),
      );
    }
  }

  // DMARC
  if (dmarcMethod) {
    const agrees = dmarcMethod.result === dmarcLocal;
    findings.push(
      finding(
        dmarcMethod.result === "pass" ? "pass" : "fail",
        `DMARC ${dmarcMethod.result} reported by ${authResultsHeaders[0] ? authResultsHeaders[0].authservId || "the receiver" : "the receiver"}`,
        agrees
          ? "Recomputing alignment locally from the From domain gives the same answer."
          : `Recomputing alignment locally from the From domain gives "${dmarcLocal}" instead. A disagreement usually means the Authentication-Results line was added by a host that is not the final receiver, or was forged.`,
        dmarcMethod.raw,
      ),
    );
  } else if (from.domain) {
    findings.push(
      finding(
        dmarcLocal === "pass" ? "pass" : "warn",
        `No DMARC result recorded — locally computed: ${dmarcLocal}`,
        dmarcLocal === "pass"
          ? "At least one aligned mechanism passed, so DMARC would evaluate to pass for any published policy."
          : "Neither SPF nor DKIM both passed and aligned with the From domain, so DMARC would fail. What the domain asks a receiver to do about that is in its published policy, which this page cannot read.",
      ),
    );
  }

  // Address-level spoofing signals
  if (from.display && /[^\s<>]+@[^\s<>]+/.test(from.display)) {
    const displayAddress = parseAddress(from.display);
    if (displayAddress.domain && displayAddress.domain !== from.domain) {
      findings.push(
        finding("fail", "Display name contains a different address", `The From display name reads as ${displayAddress.address} but the actual address is ${from.address}. Mobile clients usually show only the display name.`, from.raw),
      );
    }
  }
  if (from.displayDecoded && INVISIBLE_RE.test(from.displayDecoded)) {
    findings.push(
      finding("fail", "From display name contains invisible characters", "Zero-width or bidirectional control codepoints in the display name change what a reader sees without changing the bytes a filter matches."),
    );
  }
  if (INVISIBLE_RE.test(subject)) {
    findings.push(
      finding("warn", "Subject contains invisible characters", "The decoded Subject contains zero-width or bidirectional control codepoints, commonly used to break up filtered keywords."),
    );
  }
  if (replyTo.domain && from.domain && replyTo.domain !== from.domain) {
    findings.push(
      finding(
        alignmentOf(from.domain, replyTo.domain) === "relaxed" ? "warn" : "fail",
        "Reply-To points at a different domain",
        `Replies go to ${replyTo.address} (${replyTo.domain}), not to the From domain ${from.domain}. Legitimate for ticketing and mailing lists; it is also the standard way a reply-chain fraud lands.`,
        replyToHeader.value,
      ),
    );
  }
  if (returnPath.domain && from.domain && alignmentOf(from.domain, returnPath.domain) === "none") {
    findings.push(
      finding("warn", "Return-Path domain differs from From", `Bounces go to ${returnPath.domain} while the message claims to be from ${from.domain}. Normal for bulk senders using their own bounce domain, and also what a spoof looks like — pair it with the SPF alignment result above.`, returnPathHeader.value),
    );
  }
  if (messageId && messageIdDomain && from.domain && alignmentOf(from.domain, messageIdDomain) === "none") {
    findings.push(
      finding("warn", "Message-ID domain differs from From", `The Message-ID was minted by ${messageIdDomain}. Most senders mint it on their own domain, so a mismatch points at the system that actually created the message.`, messageId),
    );
  }
  if (!messageId) {
    findings.push(
      finding("warn", "No Message-ID", "Every conforming MUA sets one. Its absence usually means the message was injected by a script straight into an SMTP session."),
    );
  }

  // Routing signals
  if (!hops.length) {
    findings.push(
      finding("warn", "No Received headers", "There is no trace chain, so the route cannot be examined. Either the block was truncated or the paste is only the visible headers."),
    );
  }
  hops.forEach((hop, index) => {
    if (hop.ip && (hop.ipScope === "private" || hop.ipScope === "loopback") && index === 0 && hops.length > 1) {
      findings.push(
        finding("info", `Origin hop is on a ${hop.ipScope} address`, `Hop 1 came from ${hop.ip}, which is inside the sender's own network. Normal when the first hop is a corporate relay, and also what you see when a message was injected on the receiving infrastructure itself.`),
      );
    }
    if (hop.delayMs != null && hop.delayMs < 0) {
      findings.push(
        finding("warn", `Hop ${hop.hop} is stamped before the hop that fed it`, `Clock skew of ${formatDuration(hop.delayMs)} between ${hop.from || "the previous hop"} and ${hop.by || "this hop"}. Timestamps here cannot all be trusted.`),
      );
    } else if (hop.delayMs != null && hop.delayMs > 15 * 60 * 1000) {
      findings.push(
        finding("info", `Hop ${hop.hop} held the message for ${formatDuration(hop.delayMs)}`, "A long dwell usually means greylisting, a queue backlog or a retry — not by itself a security signal."),
      );
    }
    if (hop.from && hop.reverseDns) {
      const claimed = normalizeDomain(hop.from);
      if (claimed !== hop.reverseDns && alignmentOf(claimed, hop.reverseDns) === "none") {
        findings.push(
          finding("info", `Hop ${hop.hop} HELO name does not match its reverse DNS`, `The connecting host announced itself as ${claimed} but resolves to ${hop.reverseDns}. Common with shared hosting; also the cheapest thing for a sender to lie about.`),
        );
      }
    }
  });

  for (let i = 1; i < hops.length; i += 1) {
    const previousBy = normalizeDomain(hops[i - 1].by);
    const currentFrom = normalizeDomain(hops[i].from);
    if (previousBy && currentFrom && previousBy !== currentFrom && alignmentOf(previousBy, currentFrom) === "none") {
      findings.push(
        finding("info", `Chain gap between hop ${i} and hop ${i + 1}`, `Hop ${i} was received by ${previousBy}, but hop ${i + 1} says it came from ${currentFrom}. A genuine handover normally names the same host on both sides; a gap means a hop was not recorded, or a Received line was forged.`),
      );
    }
  }

  if (dateMs != null && originHop && originHop.dateMs != null) {
    const drift = originHop.dateMs - dateMs;
    if (Math.abs(drift) > 60 * 60 * 1000) {
      findings.push(
        finding("warn", "Date header disagrees with the first Received stamp", `The Date field says ${isoOf(dateMs)} while the earliest hop was stamped ${originHop.dateIso} — a gap of ${formatDuration(drift)}. The Date field is written by the sender and is not verified by anything.`),
      );
    }
  }

  const counts = findings.reduce(
    (acc, item) => ({ ...acc, [item.level]: (acc[item.level] || 0) + 1 }),
    { pass: 0, warn: 0, fail: 0, info: 0 },
  );

  const verdict = counts.fail > 0 ? "fail" : counts.warn > 0 ? "warn" : "pass";

  return {
    error: "",
    headerCount: headers.length,
    headers: headers.map((header) => ({ name: header.name, key: header.key, value: header.value })),
    identity: {
      from,
      replyTo,
      returnPath,
      sender,
      to,
      subject,
      subjectRaw,
      subjectWasEncoded: subject !== subjectRaw,
      messageId,
      messageIdDomain,
      dateText: dateHeader ? dateHeader.value : "",
      dateIso: isoOf(dateMs),
    },
    hops,
    transitMs,
    transitLabel: formatDuration(transitMs),
    auth: {
      authservIds: authResultsHeaders.map((entry) => entry.authservId).filter(Boolean),
      methods: allMethods,
      spf: { result: spfResult, domain: spfDomain, alignment: spfAlignment, alignedPass: spfAlignedPass },
      dkim: { reported: reportedDkimAlignments, signatures: dkimSignatures, alignments: dkimAlignments, alignedPass: dkimAlignedPass },
      dmarc: { reported: dmarcMethod ? dmarcMethod.result : "", computed: dmarcLocal },
      receivedSpf,
      arc: { seals: arcSeals, results: arcAuthResults, chainStatus: arcSeals.length ? (arcSeals[0].tags.cv || "").toLowerCase() : "" },
    },
    findings,
    counts,
    verdict,
    limits: [
      "SPF, DKIM and DMARC verdicts are read from the Authentication-Results the receiving server wrote — this page cannot re-verify them, because that needs DNS and the message body.",
      "Identifier alignment is recomputed here from the From domain, so a forged Authentication-Results line that claims a pass on a non-aligned domain is still caught.",
      "Organizational domains use a built-in suffix list, not the full Public Suffix List, so an unusual ccTLD structure may be read one label short.",
    ],
  };
}

/** Human-readable labels for the four finding levels. */
export const LEVEL_LABELS = {
  fail: "Fail",
  warn: "Warning",
  pass: "Pass",
  info: "Note",
};

/** Render an analysis as plain text, for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [];
  lines.push("EMAIL HEADER ANALYSIS");
  lines.push("");
  lines.push(`From:        ${result.identity.from.address || "(none)"}`);
  if (result.identity.from.displayDecoded) {
    lines.push(`Display:     ${result.identity.from.displayDecoded}`);
  }
  lines.push(`Subject:     ${result.identity.subject || "(none)"}`);
  lines.push(`Reply-To:    ${result.identity.replyTo.address || "(none)"}`);
  lines.push(`Return-Path: ${result.identity.returnPath.address || "(none)"}`);
  lines.push(`Message-ID:  ${result.identity.messageId || "(none)"}`);
  lines.push("");
  lines.push(
    `SPF   ${result.auth.spf.result || "not recorded"} · domain ${result.auth.spf.domain || "-"} · alignment ${result.auth.spf.alignment}`,
  );
  for (const item of result.auth.dkim.reported) {
    lines.push(`DKIM  ${item.result} · d=${item.domain || "-"} · alignment ${item.alignment}`);
  }
  lines.push(
    `DMARC reported ${result.auth.dmarc.reported || "not recorded"} · recomputed here ${result.auth.dmarc.computed}`,
  );
  lines.push("");
  lines.push(`ROUTE (${result.hops.length} hop${result.hops.length === 1 ? "" : "s"}, total ${result.transitLabel})`);
  for (const hop of result.hops) {
    lines.push(
      `  ${hop.hop}. ${hop.from || "(unstated)"} -> ${hop.by || "(unstated)"}  ${hop.ip || "no IP"} [${hop.ipScope || "unknown"}]  ${hop.dateIso || "no timestamp"}${hop.delayMs != null ? `  +${formatDuration(hop.delayMs)}` : ""}`,
    );
  }
  lines.push("");
  lines.push("FINDINGS");
  for (const item of result.findings) {
    lines.push(`  [${LEVEL_LABELS[item.level] || item.level}] ${item.title}`);
    lines.push(`      ${item.detail}`);
  }
  lines.push("");
  lines.push("LIMITS");
  for (const note of result.limits) lines.push(`  - ${note}`);
  return lines.join("\n");
}

/** A real Gmail-style header block, used so the page shows a result at load. */
export const SAMPLE_HEADERS = `Delivered-To: priya@example.in
Received: by 2002:a05:6512:3b0a:b0:519:e0c2:1f2 with SMTP id f10csp2210419lfv;
        Tue, 14 Jul 2026 03:22:41 -0700 (PDT)
Received: from mx.example.in (mx.example.in [203.0.113.24])
        by mail-relay.example.in with ESMTPS id 3n5k9d2r
        for <priya@example.in>; Tue, 14 Jul 2026 03:22:39 -0700 (PDT)
Received: from smtp-out-7.billing-notice.net (smtp-out-7.billing-notice.net [198.51.100.77])
        by mx.example.in with ESMTPS id 8fq2t1
        for <priya@example.in>; Tue, 14 Jul 2026 03:21:02 -0700 (PDT)
Received-SPF: pass (mx.example.in: domain of bounce@billing-notice.net designates 198.51.100.77 as permitted sender) client-ip=198.51.100.77; envelope-from=bounce@billing-notice.net; helo=smtp-out-7.billing-notice.net;
Authentication-Results: mx.example.in;
       spf=pass (mx.example.in: domain of bounce@billing-notice.net designates 198.51.100.77 as permitted sender) smtp.mailfrom=bounce@billing-notice.net;
       dkim=pass header.d=billing-notice.net header.s=s1 header.b=Kq81nZ4a;
       dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=billing-notice.net
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=billing-notice.net;
        s=s1; t=1784024462; h=to:subject:date:message-id:mime-version;
        bh=47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=;
        b=Kq81nZ4aTn3xkL9pQwYd0mZ7cRfVb2hJ8sXaE1oU
Return-Path: <bounce@billing-notice.net>
From: "Your Bank Support <support@yourbank.example>" <alerts@billing-notice.net>
Reply-To: recovery-desk@secure-billing-support.net
To: priya@example.in
Subject: =?utf-8?B?QWN0aW9uIHJlcXVpcmVkOiB2ZXJpZnkgeW91ciBhY2NvdW50?=
Message-ID: <20260714102102.4471@smtp-out-7.billing-notice.net>
Date: Tue, 14 Jul 2026 10:21:02 +0000
MIME-Version: 1.0
Content-Type: text/html; charset="utf-8"`;
