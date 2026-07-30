const seo = {
  title: "Base64 URL Encoder — Free URL-Safe base64url",
  h1: "Base64 URL Encoder — URL-Safe base64url",
  metaDescription:
    "Encode text, a URL, standard Base64 or hex bytes to URL-safe base64url in your browser — padding toggle, plus URL and cookie size checks. Free.",
  intro:
    "Base64 URL Encoder converts plain text, standard Base64 or raw hex bytes into base64url — the URL and filename safe alphabet defined in RFC 4648 §5. Text is read as UTF-8 through the browser's own TextEncoder, the bytes are encoded with the native btoa in 32,768-byte chunks, then value 62 is rewritten from `+` to `-` and value 63 from `/` to `_`, with the trailing `=` padding dropped unless you choose to keep it. Each result is measured against the limits that actually break requests — roughly 2,000 characters for interoperable URLs, Apache's 8,190-character LimitRequestLine, and the 4,096-byte per-cookie size in RFC 6265 §6.1. The whole conversion runs on your device; nothing is uploaded.",
  useCases: [
    "Encode a small JSON claim set into a token segment that survives a query string without percent-escaping",
    "Convert a hex HMAC or hash digest into the compact base64url form an API or webhook signature header expects",
    "Check before shipping whether an encoded state or session parameter still fits inside a 4 KB cookie",
  ],
  benefits: [
    [
      "Three input formats",
      "Plain UTF-8 text, standard Base64 (either alphabet) and hex bytes — with spaces, colons and 0x prefixes tolerated — all encode to the same base64url output.",
    ],
    [
      "Padding under your control",
      "Drop the trailing = for URLs and JWT segments, or tick one box to keep it when the decoder on the other side insists on canonical Base64.",
    ],
    [
      "Sized against limits that actually break",
      "Every result is checked against the 2,000-character interoperable URL length, Apache's 8,190-character LimitRequestLine and the 4,096-byte per-cookie ceiling, with a Fits/Over verdict for each.",
    ],
    [
      "Nothing leaves your browser",
      "Encoding uses the browser's built-in TextEncoder and btoa — no upload, no API call and no account, so tokens and secrets stay on your machine.",
    ],
  ],
  faqs: [
    [
      "What is a Base64 URL encoder?",
      "It is a converter that produces base64url instead of standard Base64 — the alphabet in RFC 4648 §5, where value 62 is written `-` instead of `+` and value 63 is written `_` instead of `/`. Those two substitutions, plus dropping the `=` padding, leave only characters that are legal unescaped in a query string, a path segment and a filename. This tool takes plain text, standard Base64 or hex bytes as input and returns that form.",
    ],
    [
      "What is the difference between Base64 and URL-safe Base64?",
      "Exactly two characters, plus padding. Standard Base64 uses `+` and `/` for values 62 and 63; base64url uses `-` and `_` instead, and normally omits the trailing `=`. The 64-character payload alphabet is otherwise identical, so both encode the same bytes to the same length — you can convert between them with a search-and-replace, which is what this tool does after decoding your input to raw bytes.",
    ],
    [
      "Is base64url the same as URL-encoding a Base64 string?",
      "No, and base64url is shorter. Percent-encoding turns each `+`, `/` and `=` into a three-character escape (`%2B`, `%2F`, `%3D`), costing two extra characters every time. base64url swaps those characters for URL-legal ones at no cost. The tool shows both lengths side by side, plus how many characters you save.",
    ],
    [
      "Should I remove the = padding?",
      "For URLs and JWTs, yes — RFC 7515 §2 requires JWT segments to have the padding removed, and `=` is a reserved character in URLs. Keep it only when the decoder on the receiving side is strict about canonical Base64. Padding carries no information: length modulo 4 always tells a decoder whether one or two characters were trimmed.",
    ],
    [
      "How long will my base64url string be?",
      "Divide the byte count by 3, round up, and multiply by 4 for the padded length; unpadded it is ceil(bytes × 4 ÷ 3). A 53-byte JSON payload, for example, becomes 72 padded characters or 71 unpadded. Base64 always costs about a third more than the raw bytes, and the tool reports the exact overhead percentage for your input.",
    ],
    [
      "How long can a URL be before something breaks?",
      "Keep the whole URL under about 2,000 characters for reliable delivery — that is the practical floor set by old Internet Explorer's 2,083 limit and echoed by many proxies and analytics tools. Apache returns 414 for a request line over 8,190 characters by default, and a single cookie is only guaranteed to hold 4,096 bytes. Past those, move the payload into the request body or a header.",
    ],
    [
      "Can this tool decode base64url back to text?",
      "Not to plain text — it is an encoder. It can, however, normalise in the other direction: set \"Interpret input as\" to Standard Base64 and paste a base64url string, and it folds `-` back to `+`, `_` back to `/` and restores the `=` padding, so \"Copy standard Base64\" gives you the canonical form. For turning that back into readable text, use a Base64 decoder.",
    ],
    [
      "How do I Base64-encode a URL itself?",
      "Leave \"Interpret input as\" on Plain text (UTF-8) and paste the whole address — https://example.com/path?a=1 and all. The URL is just text, so it is read as UTF-8 bytes and encoded like any other string, and because the output is base64url it can then be dropped into a query parameter, a path segment or a filename without any percent-escaping. That is the difference from URL-encoding: percent-encoding escapes the characters a URL cannot carry, while this replaces the whole string with an alphabet a URL can carry as-is.",
    ],
    [
      "Is the Base64 URL Encoder free, and is my input uploaded anywhere?",
      "It is completely free with no signup, and nothing is uploaded. The conversion runs entirely in your browser using TextEncoder and btoa — there is no server round-trip and no storage — so encoding an API key or token is safe. Input is capped at 2,000,000 characters, enough for a certificate or a long token.",
    ],
  ],
  steps: [
    "Paste your value into the input box, then set \"Interpret input as\" to Plain text (UTF-8), Standard Base64 or Hex bytes so the tool reads the right bytes — hex accepts spaces, colons and 0x prefixes.",
    "Choose your output options: leave the `=` padding off for URLs and JWT segments, tick \"Keep = padding\" when the receiving decoder demands canonical Base64, and tick \"Wrap at 76 characters\" for MIME-style line breaks.",
    "Read the panel — payload bytes, base64url length, encoding overhead and a Fits/Over verdict against the 2,000-character URL, 8,190-character Apache and 4,096-byte cookie limits — then click Copy result, or Copy standard Base64 for the `+`/`/` form.",
  ],
};

export default seo;
