/**
 * Email validation regex library.
 *
 * Sources for the rules encoded here:
 *  - WHATWG HTML Standard §4.10.5.1.5 — the exact regex browsers use for
 *    <input type="email"> (the "html5" pattern below is copied from the spec).
 *  - RFC 5321 §4.5.3.1 — length limits: local part max 64 octets, domain max
 *    255 octets (no regex here enforces them; see limitations).
 *  - RFC 5322 §3.4.1 — addr-spec grammar (dot-atom or quoted-string local
 *    part), which the "rfc5322" pattern approximates.
 *  - RFC 1035 §2.3.1 — DNS labels are max 63 octets and cannot start or end
 *    with a hyphen (the {0,61} in the domain groups comes from this).
 */

/**
 * Guard against pathological inputs. A single address is never longer than
 * 254 chars in practice (RFC 5321 forward-path limit); 1000 gives headroom
 * while keeping worst-case backtracking trivial.
 */
export const MAX_TEST_INPUT = 1000;

export const PATTERNS = [
  {
    id: "minimal",
    name: "Minimal sanity check",
    strictness: "Loosest",
    source: /^[^\s@]+@[^\s@]+$/.source,
    flags: "",
    description:
      "Exactly one @ with non-whitespace on both sides. The right choice when a confirmation email is the real validator.",
    limitations: [
      "Accepts a@b — no dot or TLD required in the domain.",
      "Accepts trailing dots and other malformed domains.",
      "No length limits (RFC 5321 caps the local part at 64 and the domain at 255 octets).",
    ],
    shouldMatch: ["user@example.com", "a@b", "user.name+tag@sub.example.co.uk"],
    shouldNotMatch: ["plainaddress", "two@@example.com", "user @example.com"],
  },
  {
    id: "pragmatic",
    name: "Pragmatic (dot required)",
    strictness: "Loose",
    source: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.source,
    flags: "",
    description:
      "The minimal check plus at least one dot in the domain. Popular default for signup forms on the public internet.",
    limitations: [
      "Rejects valid intranet addresses like user@localhost.",
      "Still accepts a trailing dot (user@example.com. matches, because '.' is a legal character in the last chunk).",
      "Accepts consecutive dots in the local part (a..b@example.com).",
    ],
    shouldMatch: ["user@example.com", "first.last@sub.domain.org"],
    shouldNotMatch: ["user@localhost", "user@.com", "no-at.example.com"],
  },
  {
    id: "html5",
    name: "WHATWG HTML5 (browser standard)",
    strictness: "Moderate",
    // Copied verbatim from the WHATWG HTML Standard's "valid email address" regex.
    source:
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        .source,
    flags: "",
    description:
      "The exact regex the HTML Standard defines for <input type=\"email\">. Matching it means the browser's own validation agrees with yours.",
    limitations: [
      "Deliberately allows dotless domains (user@localhost passes) — the spec calls this a 'willful violation' of RFC 5322.",
      "Does not enforce the 64/255-octet length limits from RFC 5321.",
      "ASCII only — internationalised addresses (用户@example.中国) fail unless punycoded.",
    ],
    shouldMatch: ["user@example.com", "user@localhost", "o'brien+tag@example.com"],
    shouldNotMatch: ["user@-example.com", "user name@example.com", "user@exa_mple.com"],
  },
  {
    id: "strict-tld",
    name: "HTML5 + required alphabetic TLD",
    strictness: "Strict",
    source:
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,63}$/
        .source,
    flags: "",
    description:
      "The HTML5 pattern hardened to require a final alphabetic label of 2–63 chars (RFC 1035 label limit), so only public-internet-looking domains pass.",
    limitations: [
      "Rejects user@localhost and other intranet hosts — wrong choice for internal tools.",
      "Rejects punycoded internationalised TLDs like xn--p1ai because of digits and hyphens.",
      "Does not verify the TLD actually exists — user@example.zzz still passes.",
    ],
    shouldMatch: ["user@example.com", "user@mail.example.co.uk"],
    shouldNotMatch: ["user@localhost", "user@example.c", "user@example.123"],
  },
  {
    id: "rfc5322",
    name: "RFC 5322-flavoured (quoted local part + IP literal)",
    strictness: "Most complete",
    source:
      /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[^"\\\r\n]|\\.)*")@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+|\[(?:\d{1,3}\.){3}\d{1,3}\])$/
        .source,
    flags: "",
    description:
      "Approximates RFC 5322 addr-spec: dot-atom local parts (no leading, trailing or double dots), quoted local parts like \"john doe\"@x.com, and [IPv4] domain literals.",
    limitations: [
      "The IPv4 literal is format-only — [999.999.999.999] passes; range-check octets separately.",
      "No IPv6 domain literals ([IPv6:...]) and no RFC 5322 comments or folding whitespace.",
      "Still no length enforcement; combine with a 254-char overall cap in code.",
    ],
    shouldMatch: ['user@example.com', '"john doe"@example.com', 'user@[192.168.1.1]'],
    shouldNotMatch: ["a..b@example.com", ".user@example.com", "user@example"],
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
