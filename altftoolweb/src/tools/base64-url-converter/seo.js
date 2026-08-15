const seo = {
  title: "Base64 to URL-Safe Base64 Converter with Auto",
  metaDescription:
    "Convert between plain text, standard Base64 and URL-safe base64url (RFC 4648). Missing = padding is restored automatically, so JWT segments decode.",
  intro:
    "Base64 URL Converter moves a payload between plain UTF-8 text, standard Base64 and URL-safe base64url, the two alphabets defined in RFC 4648 §4 and §5. They differ in exactly two characters — standard uses `+` and `/` at positions 62 and 63, URL-safe uses `-` and `_` — and base64url normally omits the `=` padding, which is what makes JWT segments fail in ordinary decoders. It is for developers debugging tokens, signed URLs, webhook signatures and query-string payloads.",
  useCases: [
    "Turn the base64url header or payload of a JWT into readable JSON, padding included automatically",
    "Convert a standard Base64 signature into the URL-safe form a signed download link needs",
    "Check whether a value that fails on one service and works on another is an alphabet mismatch rather than a corrupt payload",
  ],
  benefits: [
    ["Both alphabets, both directions", "Text, standard Base64 and base64url convert in any combination, so you never chain two tools."],
    ["Padding handled for you", "Missing `=` characters are recalculated from the length, and can be stripped again on output."],
    ["Shows what it costs in a URL", "A side-by-side length comparison of base64url against percent-encoded standard Base64, where +, / and = each cost 3 characters."],
  ],
  faqs: [
    [
      "What is the difference between Base64 and base64url?",
      "Two characters. Standard Base64 (RFC 4648 §4) uses `+` for value 62 and `/` for 63; base64url (§5) uses `-` and `_` instead, because `+` means a space in a query string and `/` splits a path segment. The `=` padding is also usually dropped in base64url, since `=` is reserved in URLs. Everything else — the 4:3 ratio, the first 62 characters — is identical.",
    ],
    [
      "Why does my JWT fail to decode?",
      "Because JWT segments are base64url with the padding removed, as RFC 7515 §2 requires. A standard decoder sees `-` and `_` as illegal characters and a length that is not a multiple of 4, and refuses. Convert the alphabet and add back 1 or 2 `=` characters — this tool does both automatically.",
    ],
    [
      "How much shorter is base64url in a URL?",
      "It saves 2 characters for every `+` or `/` in the standard form, because each of those becomes a 3-character percent escape (`%2B`, `%2F`) but only a 1-character swap (`-`, `_`) in base64url. Roughly 1 in 32 Base64 characters is a `+` or `/`, so a 1,000-character token typically saves 60–70 characters from that alone. Padding is dropped entirely by default rather than swapped, so each `=` saves the full 3 characters its percent escape (`%3D`) would have cost — up to 6 more for the maximum of two padding characters.",
    ],
    [
      "Is base64url safe to put in a filename or a path segment?",
      "Yes for URLs and filenames on every mainstream filesystem — that is exactly what RFC 4648 §5 calls it: \"base64url\", the URL and filename safe alphabet. The remaining characters are A–Z, a–z, 0–9, `-` and `_`, none of which are reserved in a path segment or illegal on Windows, macOS or Linux.",
    ],
  ],
};

export default seo;
