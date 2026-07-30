const seo = {
  intro:
    "The MD5 Hash Generator computes the 128-bit MD5 digest of any text you type, following the RFC 1321 algorithm and returning it as 32 hexadecimal characters. It updates as you type, encodes your input as UTF-8 first, and offers a lowercase or uppercase output format plus live character and byte counts. It is meant for checksum comparison and non-security identifiers — MD5 is broken for collision resistance and should not be used to hash passwords or sign anything.",
  useCases: [
    "A download page lists an MD5 checksum and you want to confirm the value in your notes matches character for character before flagging a mismatch to the vendor.",
    "You are debugging a cache key or de-duplication ID that another system generates with MD5, and you need to reproduce the exact digest for a known string to see where the two diverge.",
    "You are writing a migration script and want a short deterministic fingerprint of a record's text so you can spot which rows changed between two exports.",
  ],
  benefits: [
    ["Digest updates as you type", "There is no hash button — the 32-character output is recomputed on every keystroke and on the uppercase toggle."],
    ["UTF-8 is applied before hashing", "Accented and non-Latin characters are encoded to UTF-8 bytes first, so the digest matches what server-side MD5 implementations produce."],
    ["Shows what was actually hashed", "Live character count and byte size make it obvious when a stray space or a multi-byte character is why your digest does not match."],
  ],
  faqs: [
    [
      "How long is an MD5 hash?",
      "128 bits, which is written as 32 hexadecimal characters. That length is fixed no matter whether you hash one character or a whole paragraph.",
    ],
    [
      "Is MD5 secure enough for passwords?",
      "No. MD5's collision resistance was broken in 2004 and practical collisions can now be produced in seconds on ordinary hardware, so it is unsuitable for digital signatures, certificates or password storage. Use SHA-256 for integrity and a dedicated password hash such as bcrypt, scrypt or Argon2 for credentials.",
    ],
    [
      "Why is my hash different from another tool's?",
      "Almost always because the input bytes differ, not the algorithm — a trailing newline, leading space, or a different text encoding changes the digest completely. This tool encodes input as UTF-8 and normalises Windows CRLF line breaks to a single LF before hashing, so paste-in text with CRLF endings will match the LF version.",
    ],
    [
      "Does my text get uploaded anywhere?",
      "No. The MD5 routine is plain JavaScript running in your browser tab, so the text you type never leaves the page and there is no server request when the hash is computed.",
    ],
  ],
};

export default seo;
