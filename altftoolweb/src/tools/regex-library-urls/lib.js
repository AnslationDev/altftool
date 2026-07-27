/**
 * URL / domain regex library.
 *
 * Sources for the rules encoded here:
 *  - RFC 3986 §3 — generic URI syntax: scheme = ALPHA *( ALPHA / DIGIT / "+" /
 *    "-" / "." ), and the ? query / # fragment delimiters used below.
 *  - RFC 1035 §2.3.1 + RFC 1123 — DNS labels are 1–63 octets, cannot start or
 *    end with a hyphen, and a full name is at most 253 characters.
 *  - IANA TLD registry — every current TLD is 2–63 alphabetic characters in
 *    its ASCII (or punycode xn--) form; the {2,63} bound comes from this.
 *  - IPv4 dotted-quad — each octet is 0–255, encoded as the classic
 *    (25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d) alternation.
 */

/**
 * Guard against pathological inputs. Browsers cap URLs far higher, but 2000
 * characters is the long-standing practical limit (old IE) and keeps
 * worst-case backtracking trivial.
 */
export const MAX_TEST_INPUT = 2000;

export const PATTERNS = [
  {
    id: "https-url",
    name: "http(s) URL, full form",
    strictness: "Web links",
    source:
      /^https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,63}(?::\d{1,5})?(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#\S*)?$/
        .source,
    flags: "",
    description:
      "http:// or https:// links with a dotted domain, optional :port, path, ?query and #fragment — the pattern for 'is this a shareable web link'.",
    limitations: [
      "Rejects http://localhost and bare IP hosts — use the IP-host pattern for those.",
      "Domain labels may start or end with a hyphen here (RFC 1035 forbids it); use the strict domain pattern if that matters.",
      "The port accepts any 1–5 digit run, so :99999 passes (valid ports stop at 65535).",
    ],
    shouldMatch: [
      "https://example.com",
      "http://sub.example.co.uk:8080/path?q=1#frag",
      "https://example.com/path/to/page",
    ],
    shouldNotMatch: ["ftp://example.com", "https://example", "https://exa mple.com"],
  },
  {
    id: "any-scheme",
    name: "Any scheme URI (RFC 3986)",
    strictness: "Broadest",
    source: /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s/?#]+[^\s]*$/.source,
    flags: "",
    description:
      "Any URI with an RFC 3986-legal scheme and a // authority — catches ftp://, ws://, s3://, postgres:// and friends, not just the web.",
    limitations: [
      "Only //-authority URIs — mailto:user@example.com and tel:+123 have no // and fail.",
      "The authority part is barely validated; ws://???? passes as long as there is no whitespace.",
      "No percent-encoding validation — a stray literal space is the only thing that stops a match.",
    ],
    shouldMatch: ["ftp://files.example.com/pub", "ws://localhost:3000/socket", "https://example.com"],
    shouldNotMatch: ["//example.com", "http//example.com", "not a url"],
  },
  {
    id: "domain",
    name: "Domain name (strict, RFC 1035 limits)",
    strictness: "Strictest",
    source:
      /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/.source,
    flags: "",
    description:
      "A bare registrable domain: labels of 1–63 chars that never start or end with a hyphen, total length capped at 253, ending in an alphabetic TLD — hyphen rules and length caps straight from RFC 1035.",
    limitations: [
      "ASCII only — internationalised domains must be punycoded first, and punycode TLDs (xn--p1ai) fail the alphabetic-TLD requirement.",
      "Accepts domains whose TLD does not exist (example.zzz) — it checks shape, not the IANA registry.",
      "No underscore labels, so service records like _dmarc.example.com fail (correct for hostnames, surprising for DNS records).",
    ],
    shouldMatch: ["example.com", "sub.domain.example.co.uk", "a-b.example.org"],
    shouldNotMatch: ["-bad.example.com", "example", "exa_mple.com"],
  },
  {
    id: "optional-protocol",
    name: "Website field (protocol optional)",
    strictness: "Form input",
    source:
      /^(?:https?:\/\/)?(?:www\.)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,63}(?::\d{1,5})?(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#\S*)?$/
        .source,
    flags: "",
    description:
      "For 'your website' form fields: accepts example.com, www.example.com/path and full https:// URLs alike. Prepend https:// yourself before storing.",
    limitations: [
      "Accepting bare domains means any dotted word like index.html or v1.2 can pass — pair with a DNS or fetch check for high stakes.",
      "Same hyphen and port caveats as the full http(s) pattern.",
      "Rejects localhost and IP hosts.",
    ],
    shouldMatch: ["example.com", "www.example.com/path", "https://www.example.com?utm=1"],
    shouldNotMatch: ["http://", "just text", "example .com"],
  },
  {
    id: "ipv4-host",
    name: "IPv4 host (range-checked) with port",
    strictness: "Infrastructure",
    source:
      /^(?:https?:\/\/)?(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(?::\d{1,5})?(?:\/[^\s]*)?$/
        .source,
    flags: "",
    description:
      "Dotted-quad IPv4 hosts with every octet range-checked to 0–255, optional http(s)://, :port and path — for admin panels, health checks and internal tooling.",
    limitations: [
      "IPv4 only — IPv6 hosts like http://[::1]:8080 fail entirely.",
      "The port still accepts up to 99999; range-check to 65535 in code.",
      "Does not exclude reserved or non-routable ranges (0.0.0.0, 127.0.0.1, 169.254.x.x all pass).",
    ],
    shouldMatch: ["192.168.1.1", "http://10.0.0.255:8080/admin", "255.255.255.255"],
    shouldNotMatch: ["256.1.1.1", "192.168.1", "1.2.3.4.5"],
  },
];

/**
 * Compile a pattern source safely.
 * @returns {{regex: RegExp} | {error: string}}
 */
export function compileRegex(source, flags = "") {
  if (typeof source !== "string" || source.length === 0) {
    return { error: "Pattern source is empty." };
  }
  try {
    return { regex: new RegExp(source, flags) };
  } catch (cause) {
    return { error: `Invalid regular expression: ${cause.message}` };
  }
}

/**
 * Test one input string against a pattern.
 * @returns {{matched: boolean, input: string} | {error: string}}
 */
export function testInput({ source, flags = "", input }) {
  if (typeof input !== "string") {
    return { error: "Type a value to test." };
  }
  if (input.length > MAX_TEST_INPUT) {
    return { error: `Test input is limited to ${MAX_TEST_INPUT} characters.` };
  }
  const compiled = compileRegex(source, flags);
  if (compiled.error) return { error: compiled.error };
  return { matched: compiled.regex.test(input), input };
}

/**
 * Run a pattern against its own documented examples.
 * @returns {{passed: boolean, total: number, failures: string[]}}
 */
export function selfTest(pattern) {
  const failures = [];
  const compiled = compileRegex(pattern.source, pattern.flags);
  if (compiled.error) {
    return { passed: false, total: 0, failures: [compiled.error] };
  }
  for (const sample of pattern.shouldMatch) {
    if (!compiled.regex.test(sample)) failures.push(`expected match: ${sample}`);
  }
  for (const sample of pattern.shouldNotMatch) {
    if (compiled.regex.test(sample)) failures.push(`expected NO match: ${sample}`);
  }
  const total = pattern.shouldMatch.length + pattern.shouldNotMatch.length;
  return { passed: failures.length === 0, total, failures };
}
