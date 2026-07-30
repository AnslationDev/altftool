const seo = {
  title: "Encode & Decode Text — Base64, URL, Hex, JWT",
  h1: "Encode & Decode Text",
  metaDescription:
    "Encode or decode Base64, URL, hex, binary, HTML entities, JWT and JSON — plus MD5 and SHA-256 hashes. Runs as you type, entirely in your browser.",
  intro:
    "Encode & Decode handles twelve conversions in one box — Base64, URL (percent) encoding, hexadecimal, binary and HTML entities in both directions, plus a JWT decoder and a JSON formatter. Each one is built on a native browser primitive rather than a server call: btoa and atob for Base64 (wrapped in encodeURIComponent so UTF-8 text survives the round trip), encodeURIComponent and decodeURIComponent for URLs, charCodeAt for hex and binary, and a detached DOM element for HTML entity escaping. Output recalculates on every keystroke, and the same page runs a live Format Inspector (character count, Blob byte size, hex and binary previews) plus a hash panel that computes SHA-1 and SHA-256 through the Web Crypto API alongside MD5.",
  useCases: [
    "Decoding a Base64 blob or a JWT payload from an API response to see what is actually inside it",
    "URL-encoding a value before dropping it into a query string, or decoding a percent-encoded link someone sent you",
    "Escaping HTML entities before pasting user text into a template, or pretty-printing a minified JSON response to find the syntax error",
  ],
  benefits: [
    [
      "Twelve conversions in one box",
      "Base64, URL, hex, binary and HTML entities each work in both directions, alongside a JWT decoder and a JSON formatter that validates while it pretty-prints at two-space indent. Switching format re-runs the conversion on the text you already pasted.",
    ],
    [
      "Runs entirely in your browser",
      "Every conversion uses a built-in browser API — btoa/atob, encodeURIComponent, the DOM and Web Crypto. Nothing you paste is sent to a server or stored, so it is safe for tokens and internal payloads.",
    ],
    [
      "Live Format Inspector",
      "As soon as you type, a panel reports character count, exact byte size (measured with Blob), whether the input is alphanumeric or contains special characters, and a running hexadecimal and binary preview of the raw text.",
    ],
    [
      "Built-in hash panel",
      "A separate field generates MD5, SHA-1 and SHA-256 for any string, each with its own copy button — useful for checking a checksum without leaving the page.",
    ],
  ],
  faqs: [
    [
      "What does encoded and decoded mean?",
      "Encoding rewrites text into a different representation so it can travel safely through a system that would otherwise mangle it — Base64 turns bytes into 64 printable characters, URL encoding replaces reserved characters like spaces and ampersands with percent codes, HTML entity encoding turns < into &lt;. Decoding runs the same rule backwards to recover the original text. Neither is secret: anyone can decode it, which is why encoding is not encryption.",
    ],
    [
      "How do I decode a Base64 string?",
      "Paste the string, pick Base64 Decode, and the plain text appears below immediately. The tool runs atob and then decodeURIComponent(escape(...)), so UTF-8 content such as accented characters and emoji decodes correctly rather than turning into mojibake. If the input is not valid Base64 you get a \"Failed to decode: Invalid Base64 string\" message instead of a garbled result.",
    ],
    [
      "Is my text uploaded to a server when I encode or decode it?",
      "No. All twelve conversions run in your own browser using native JavaScript APIs — there is no network request in the conversion path, and nothing you paste is logged or stored. The hashes are computed the same way, via window.crypto.subtle.digest on your device.",
    ],
    [
      "Can I decode a JWT here, and does it check the signature?",
      "It decodes the token but does not verify the signature. The JWT Decode option splits the token on its two dots, converts the base64url header and payload back to standard Base64 (swapping - and _ and re-adding padding), then parses and pretty-prints both as JSON. The signature is left untouched, so treat the decoded claims as unverified until your backend validates them.",
    ],
    [
      "What is the difference between encoding and encryption?",
      "Encoding is reversible by anyone; encryption requires a key. Base64, hex and URL encoding exist to make data transport-safe, not private — a Base64 string can be decoded by this tool or any other in one click. Never use Base64 to hide passwords, keys or personal data.",
    ],
    [
      "Which formats does this encoder and decoder support?",
      "Twelve operations: Base64 encode and decode, URL encode and decode, hex encode and decode, binary encode and decode, HTML entity encode and decode, JWT decode, and a JSON formatter that validates and re-indents. Hex output is two digits per character; binary output is eight bits per character, space-separated.",
    ],
    [
      "Does it handle emoji and accented characters?",
      "Base64 and URL encoding do — both wrap the native calls in encodeURIComponent, so UTF-8 text round-trips exactly. Hex and binary map each character's code unit directly, so they reproduce ASCII and Latin-1 text (up to U+00FF) perfectly but are not reliable for emoji or CJK characters; use Base64 for those.",
    ],
    [
      "Can I decode an MD5 or SHA-256 hash back to text?",
      "No — hashes are one-way, and no tool can reverse them. The hash panel here generates MD5, SHA-1 and SHA-256 from text you enter so you can compare a checksum, but there is no decode direction. If you need something you can reverse, use Base64 or hex instead.",
    ],
  ],
  steps: [
    "Paste or type your text into the input box, or press the paste button to pull it straight from your clipboard.",
    "Pick an operation from the row of buttons: Base64, URL, Hex, Binary or HTML Entity encode/decode, JWT Decode, or JSON Formatter.",
    "Read the converted result below — it updates on every keystroke — then copy it to your clipboard or download it as a .txt file.",
  ],
};

export default seo;
