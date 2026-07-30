const seo = {
  intro:
    "This generator computes the SHA-1 digest of any text you paste — a 160-bit value shown as 40 lowercase hexadecimal characters — using the browser's built-in Web Crypto implementation. The input is encoded as UTF-8 before hashing, which is what makes the output match what git, OpenSSL or a server-side library would produce for the same bytes. It is aimed at developers checking a checksum, a legacy signature or a stored digest rather than anyone choosing a hash for new security work.",
  useCases: [
    "A vendor's documentation lists a SHA-1 fingerprint for a config value and you need to confirm the string you are about to send produces the same digest.",
    "You are debugging why a legacy API rejects your request and want to see the exact SHA-1 of the payload your code is signing, character for character.",
    "You are reading a git object or an old manifest and want to reproduce a 40-character hash by hand to confirm you have the right content.",
  ],
  benefits: [
    [
      "Uses the platform's own crypto",
      "Digests come from the browser's native SubtleCrypto engine, not a bundled JavaScript reimplementation that could drift.",
    ],
    [
      "Recomputes as you type",
      "The digest updates live with the input, so you can watch a single trailing space or newline change all 40 characters.",
    ],
    [
      "Shows the input length alongside",
      "The character count sits next to the result, which is usually how you catch an accidental copied newline.",
    ],
  ],
  faqs: [
    [
      "What is the SHA-1 hash of 'hello world'?",
      "2aae6c35c94fcfb415dbe95f408b9ce91ee846ed. SHA-1 always produces 160 bits, printed here as 40 lowercase hex characters, no matter how long the input is — the empty string hashes to da39a3ee5e6b4b0d3255bfef95601890afd80709.",
    ],
    [
      "Is SHA-1 still safe to use?",
      "Not for anything security-critical. A practical collision was demonstrated in 2017 by the SHAttered research, which produced two different PDFs with the same SHA-1, and browsers and certificate authorities stopped trusting SHA-1 certificates before that. Use SHA-256 or better for signatures and integrity, and never use a bare hash of any kind for passwords — those need a purpose-built function such as bcrypt, scrypt or Argon2.",
    ],
    [
      "Why does my hash differ from another tool's?",
      "Almost always because the bytes differ, not the algorithm. A trailing newline, CRLF versus LF line endings, or non-ASCII characters encoded as something other than UTF-8 all change the digest completely. This tool encodes your text as UTF-8 with no added newline.",
    ],
    [
      "Can I get the original text back from a hash?",
      "No. SHA-1 is one-way, and there is no arithmetic that reverses a 40-character digest into the input. Short or common inputs can still be found by looking them up in a precomputed table, which is exactly why hashing alone never protects a password.",
    ],
  ],
};

export default seo;
