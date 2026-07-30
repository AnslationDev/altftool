const seo = {
  intro:
    "URL Parser splits any URL into its component parts using the browser's built-in WHATWG URL constructor — the same parser the address bar uses — and prints protocol, host, hostname, port, path and hash on separate lines, followed by every query parameter as a decoded key = value pair. Because it uses the real parser rather than a regular expression, it applies the same normalisation and percent-decoding a browser would. Anything the constructor rejects comes back as 'Invalid URL', which is itself a useful answer.",
  useCases: [
    "A tracking link arrives with thirty query parameters glued together and you need to read utm_source and the click ID without scrolling a single line sideways.",
    "An API call is failing and you want to confirm whether the port is explicit or defaulted, and whether the path really is what you think after the browser normalises it.",
    "A redirect URL has a percent-encoded parameter nested inside it, and you need to see the decoded value to tell where it actually points.",
  ],
  benefits: [
    [
      "Real parser, not a regex",
      "It runs the WHATWG URL constructor, so the split matches what a browser would do — including normalisation, default-port handling and percent-decoding of query values.",
    ],
    [
      "Query strings become a readable list",
      "Every parameter is listed on its own indented line as key = value with the value already decoded, so %20 and %3A do not have to be read by eye.",
    ],
    [
      "Tells you when a URL is genuinely invalid",
      "A string the constructor refuses returns 'Invalid URL' rather than a partial guess, which cleanly identifies a missing scheme or a malformed host.",
    ],
  ],
  faqs: [
    [
      "What are the parts of a URL?",
      "Scheme, host, port, path, query and fragment. In https://example.com:8080/path/page?x=1#top the protocol is https:, the hostname example.com, the port 8080, the path /path/page, the query x=1 and the hash #top — the six fields this tool prints, plus host, which is hostname and port combined.",
    ],
    [
      "What is the difference between host and hostname?",
      "Hostname is the domain alone; host is the domain plus the port when one is present. For https://example.com:8080/ the host is example.com:8080 and the hostname is example.com.",
    ],
    [
      "Why does the port say '(default)'?",
      "Because the URL did not state one, so the scheme's default applies — 443 for https and 80 for http. The URL constructor leaves the port property empty when it matches the scheme default, and the tool shows that as (default) rather than a blank.",
    ],
    [
      "Does it decode percent-encoded query values?",
      "Yes. Query parameters are read through searchParams, which decodes percent-escapes and converts + to a space, so a value stored as hello%20world is displayed as hello world.",
    ],
  ],
};

export default seo;
