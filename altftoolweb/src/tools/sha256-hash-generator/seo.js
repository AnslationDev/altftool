const seo = {
  title: "SHA-256 Hash Generator — 64-Hex Digest, Computed",
  metaDescription:
    "Paste text and get its SHA-256 digest as 64 hex characters, computed with the browser's native Web Crypto — matches sha256sum and OpenSSL output.",
  steps: [
    "Type or paste your text into the Input box — it is UTF-8 encoded before hashing, and 'Load sample' fills in the example 'hello world'.",
    "The Result box updates live as you edit, with no convert button: the digest comes from the browser's own crypto.subtle.digest('SHA-256') call.",
    "Press Copy next to Result to copy the 64-character lowercase hex hash, or Clear above the Input box to start over.",
  ],
  intro:
    "This tool computes the SHA-256 digest of any text you paste — a 256-bit value shown as 64 lowercase hexadecimal characters — using the browser's native Web Crypto engine. Your text is encoded as UTF-8 before hashing, so the result matches what sha256sum, OpenSSL, Python's hashlib or a Node crypto call would return for the same bytes. It is built for developers verifying a checksum, an API signature or a stored digest without pasting the value into someone else's server.",
  useCases: [
    "A download page publishes a SHA-256 checksum and you want to confirm the string or manifest you have matches before trusting it.",
    "Your HMAC or webhook signature check keeps failing and you need to see the digest of the exact request body your code produced, byte for byte.",
    "You are writing a test fixture and need a stable, reproducible 64-character hash for a known input to assert against.",
  ],
  benefits: [
    [
      "Native SubtleCrypto, not a JS port",
      "The digest comes from the browser's own audited crypto implementation, so it is both fast on large inputs and free of reimplementation bugs.",
    ],
    [
      "Sensitive input never leaves the tab",
      "Because the hashing is local, you can safely digest a token, a secret or an unreleased payload that must not touch a third-party endpoint.",
    ],
    [
      "Live recompute plus one-click copy",
      "The hash updates as you edit and copies whole, which is how you spot that a stray newline is what broke your comparison.",
    ],
  ],
  faqs: [
    [
      "What is the SHA-256 hash of 'hello world'?",
      "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9. SHA-256 output is always 256 bits — 64 hex characters — regardless of input size; the empty string hashes to e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.",
    ],
    [
      "Why does my checksum not match the one on the download page?",
      "Usually the bytes differ rather than the algorithm. A trailing newline, Windows CRLF line endings instead of LF, or a different text encoding changes every character of the digest. Also check you are comparing against SHA-256 and not SHA-1 or MD5 — the lengths give it away at 64, 40 and 32 hex characters respectively.",
    ],
    [
      "Is SHA-256 secure?",
      "Yes, for integrity and signatures: there is no known practical collision or preimage attack against it, which is why it underpins TLS certificates and Bitcoin. It is still the wrong choice for storing passwords, because it is designed to be fast — use bcrypt, scrypt or Argon2 with a per-user salt for that.",
    ],
    [
      "Can a SHA-256 hash be decrypted back to the text?",
      "No. It is a one-way digest, not encryption, and the original input is not recoverable from the 64 characters. Short, guessable inputs can still be identified by hashing candidates and comparing, so a hash alone is not a way to hide a value.",
    ],
  ],
};

export default seo;
