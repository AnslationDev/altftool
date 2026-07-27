const seo = {
  intro:
    "Base64 URL Encoder converts text, standard Base64 or raw hex bytes into base64url, the URL and filename safe alphabet defined in RFC 4648 §5: `+` becomes `-`, `/` becomes `_`, and the trailing `=` padding is dropped. It also reports how long the result is against the limits that actually break things — roughly 2,000 characters for interoperable URLs, Apache's 8,190-character LimitRequestLine, and the 4,096-byte per-cookie size in RFC 6265 §6.1. It is for developers building tokens, signed links and query-string payloads.",
  useCases: [
    "Encode a small JSON claim set into a token segment that survives a query string without percent-escaping",
    "Turn a hex digest from an HMAC or a hash into the compact base64url form an API expects",
    "Check before shipping whether an encoded state parameter will still fit inside a 4 KB cookie",
  ],
  benefits: [
    ["Three input formats", "Plain UTF-8 text, standard Base64 and hex bytes all encode to the same URL-safe output."],
    ["Padding under your control", "Drop `=` for URLs and JWTs, or keep it when the receiving library insists on canonical Base64."],
    ["Size checked against real limits", "2,000-character URL guidance, Apache's 8,190-character request line and the 4,096-byte cookie ceiling."],
  ],
  faqs: [
    [
      "What is URL-safe Base64?",
      "It is the alphabet in RFC 4648 §5: identical to standard Base64 except that value 62 is written `-` instead of `+` and value 63 is written `_` instead of `/`. Those two substitutions plus dropping the `=` padding leave only characters that are legal, unescaped, in a URL query string, a path segment and a filename.",
    ],
    [
      "Should I remove the = padding?",
      "For URLs and JWTs, yes — RFC 7515 §2 requires JWT segments to have it removed, and `=` is a reserved character in URLs. Keep it when the decoder on the other side is strict about canonical Base64. Padding is never information: it can always be recalculated, since the length modulo 4 tells you whether 1 or 2 characters were removed.",
    ],
    [
      "How long will my encoded string be?",
      "Take the byte count, divide by 3, round up, and multiply by 4 for the padded length. Without padding it is ceil(bytes × 4 ÷ 3). So 100 bytes become 136 padded characters or 134 unpadded — a consistent 33% larger than the raw payload.",
    ],
    [
      "How long can a URL be before something breaks?",
      "Keep the whole URL under about 2,000 characters for reliable delivery — that is the practical floor set by old Internet Explorer (2,083) and repeated by many proxies and analytics tools. Apache rejects a request line over 8,190 characters with a 414 by default, and a single cookie is only guaranteed to hold 4,096 bytes. Above those, move the payload into the request body.",
    ],
  ],
};

export default seo;
