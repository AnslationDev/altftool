const seo = {
  intro:
    "This library collects copy-ready regular expressions for URLs and domains: full http(s) links with port, query and fragment parts, any-scheme URIs per RFC 3986, strict bare domains enforcing RFC 1035's 63-character label and 253-character name limits, protocol-optional website form fields, and range-checked IPv4 hosts. Each pattern has a live tester plus a frank list of what it accepts wrongly and rejects wrongly, so developers can choose the right trade-off instead of trusting a random Stack Overflow answer.",
  useCases: [
    "A form developer validating a 'your website' field that should accept example.com and https://www.example.com alike",
    "A security engineer grepping logs for any-scheme URIs like ftp:// or ws:// endpoints exfiltrated in requests",
    "A platform engineer validating that a config value is a range-checked IPv4 host with an optional port before deploying",
  ],
  benefits: [
    ["Five scoped patterns", "Web links, any-scheme URIs, strict domains, form input and IPv4 hosts — each tuned to one job instead of one bloated regex."],
    ["RFC-grounded limits", "Label lengths, hyphen rules and the 253-char domain cap come from RFC 1035; scheme syntax from RFC 3986."],
    ["Failure modes documented", "Every pattern lists false accepts (like :99999 ports) and false rejects (like localhost) before you copy it."],
  ],
  faqs: [
    [
      "What is a good regex to validate a URL?",
      "For web links, use ^https?:\\/\\/(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,63}(?::\\d{1,5})?(?:\\/[^\\s?#]*)?(?:\\?[^\\s#]*)?(?:#\\S*)?$ — it requires http or https, a dotted domain with an alphabetic TLD, and allows an optional port, path, query and fragment. In JavaScript, new URL(value) inside a try/catch is more correct than any regex because it implements the full WHATWG URL Standard.",
    ],
    [
      "How do I validate a domain name with regex?",
      "Enforce the DNS rules from RFC 1035: each label is 1–63 characters, cannot start or end with a hyphen, and the whole name is at most 253 characters — ^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,63}$ encodes all three. Remember it checks shape only; it cannot tell you whether the domain is registered.",
    ],
    [
      "How does the regex check that an IP octet is between 0 and 255?",
      "With the alternation (25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d): it matches 250–255, then 200–249, then 100–199, then 0–99 without a leading zero. Repeating that group four times with dots gives a dotted-quad IPv4 matcher that correctly rejects 256.1.1.1.",
    ],
    [
      "Why does my URL regex reject localhost?",
      "Because patterns that require a dotted domain with a TLD, like (?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,63}, never match a single-label host such as localhost. If you need development URLs to pass, add an explicit alternation for localhost or use the browser's URL parser, which accepts any hostname.",
    ],
  ],
};

export default seo;
