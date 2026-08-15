const seo = {
  title: "Base64 to Text Decoder with URL-Safe and Padding",
  metaDescription:
    "Decode Base64 to UTF-8 in the browser with atob: missing = padding restored, base64url - and _ handled, MIME line breaks and data: headers stripped.",
  intro:
    "Base64 to Text converts a Base64 string back into the characters it encodes, using the standard alphabet from RFC 4648 §4 and — once URL-safe Base64 support is ticked — the URL-safe variant from §5. It repairs missing `=` padding, strips the line breaks that MIME Base64 inserts every 76 characters, unwraps a leading data: URL header, decodes the bytes as UTF-8, and names the check that failed when a string is rejected. It is for developers reading a JWT payload, a webhook body, an HTTP Basic header or a config value that arrived encoded.",
  useCases: [
    "Read the claims inside the middle segment of a JWT — tick URL-safe Base64 support first, because that segment uses - and _ with the padding stripped",
    "Decode an `Authorization: Basic` header to confirm which username a failing integration is actually sending",
    "Check what a Base64 value in a Kubernetes Secret or a CI environment variable really contains before rotating it",
  ],
  benefits: [
    ["Padding fixed automatically", "JWT and URL-safe payloads drop the `=` characters; this tool restores them instead of failing."],
    ["Says why the input failed", "Detect invalid Base64 catches a 4n+1 length, characters outside the alphabet, and URL-safe - or _ while that option is off, printing the reason under the input box."],
    ["Nothing is transmitted", "Tokens and secrets are decoded locally with the browser's own `atob`, so they never reach a server or a log."],
  ],
  faqs: [
    [
      "How do I decode a Base64 string to text?",
      "Paste it into the box and the plain text appears instantly — no upload and no sign-in. Decoding is reversible and takes no key: Base64 is an encoding, so anyone holding the string can read it, which is why it must never be used to protect a password.",
    ],
    [
      "Why does my JWT fail in other Base64 decoders?",
      "Because JWTs use base64url (RFC 4648 §5): `+` becomes `-`, `/` becomes `_`, and the trailing `=` padding is removed entirely, as required by RFC 7515 §2. A decoder expecting standard Base64 rejects that. This tool always re-adds the 1 or 2 padding characters, and converts the alphabet once URL-safe Base64 support is on — leave it off and it stops with “URL-safe characters (- _) detected”.",
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
