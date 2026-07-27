const seo = {
  intro:
    "Base64 to Text converts a Base64 string back into the characters it encodes, using the standard alphabet from RFC 4648 §4 and the URL-safe variant from §5. It repairs missing `=` padding, ignores the line breaks that MIME Base64 inserts every 76 characters, honours a UTF-8 or UTF-16 byte-order mark, and tells you when the bytes are not valid text at all. It is for developers reading a JWT payload, a webhook body, an HTTP Basic header or a config value that arrived encoded.",
  useCases: [
    "Read the claims inside the middle segment of a JWT, which is URL-safe Base64 with the padding stripped",
    "Decode an `Authorization: Basic` header to confirm which username a failing integration is actually sending",
    "Check what a Base64 value in a Kubernetes Secret or a CI environment variable really contains before rotating it",
  ],
  benefits: [
    ["Padding fixed automatically", "JWT and URL-safe payloads drop the `=` characters; this tool restores them instead of failing."],
    ["Honest about invalid input", "Bytes that are not valid UTF-8, or that are actually a binary file, are flagged rather than shown as gibberish."],
    ["Nothing is transmitted", "Tokens and secrets are decoded locally with the browser's own `atob`, so they never reach a server or a log."],
  ],
  faqs: [
    [
      "How do I decode a Base64 string to text?",
      "Paste it into the box and the plain text appears instantly — no upload and no sign-in. Decoding is reversible and takes no key: Base64 is an encoding, so anyone holding the string can read it, which is why it must never be used to protect a password.",
    ],
    [
      "Why does my JWT fail in other Base64 decoders?",
      "Because JWTs use base64url (RFC 4648 §5): `+` becomes `-`, `/` becomes `_`, and the trailing `=` padding is removed entirely, as required by RFC 7515 §2. A decoder expecting standard Base64 rejects that. This tool converts the alphabet and re-adds the 1 or 2 padding characters before decoding.",
    ],
    [
      "Is Base64 the same as encryption?",
      "No. Base64 provides zero confidentiality — it is a reversible mapping of 3 bytes onto 4 printable characters, designed in RFC 4648 so binary data can survive text-only channels like email headers. Anyone can decode it in a second. Use AES or an equivalent cipher when the data actually needs protecting.",
    ],
    [
      "How many bytes does a Base64 string decode to?",
      "Take the character count, divide by 4, multiply by 3, then subtract the number of `=` padding characters. A 24-character string ending in `==` decodes to 24 ÷ 4 × 3 − 2 = 16 bytes. That 4:3 ratio is why Base64 always costs about 33% more space than the raw data.",
    ],
  ],
};

export default seo;
