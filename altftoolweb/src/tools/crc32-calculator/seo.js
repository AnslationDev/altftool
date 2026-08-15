const seo = {
  title: "CRC32 Calculator: IEEE 802.3 Checksum in Hex & Decimal",
  metaDescription:
    "Computes the zip/gzip/PNG CRC-32 (polynomial 0xEDB88320, init and XOR 0xFFFFFFFF) of text, shown as eight hex digits and unsigned decimal with length.",
  intro:
    "This calculator computes the CRC-32 checksum of text using the standard IEEE 802.3 variant — reversed polynomial 0xEDB88320, initial value 0xFFFFFFFF, final XOR of 0xFFFFFFFF — the same algorithm used by zip, gzip and PNG. It returns the 32-bit result as eight hex digits, as an unsigned decimal, and reports the input length, so \"hello world\" gives 0x0d4a1185. It is for developers verifying a checksum by hand rather than trusting a value copied out of a log.",
  useCases: [
    "A file transfer or firmware tool reports a CRC32 that does not match the expected one, and you want to check a short header or record string yourself",
    "You are implementing CRC32 in another language and need a known-good reference value to test your table generation against",
    "A protocol spec gives a sample frame with its expected checksum, and you want to confirm your understanding of which bytes are covered before writing the parser",
  ],
  benefits: [
    ["The IEEE 802.3 variant, stated outright", "Polynomial 0xEDB88320 reflected, init and final XOR 0xFFFFFFFF — the one zip, gzip and PNG use, so values match those tools."],
    ["Hex and decimal together", "Some APIs report CRC32 as a signed or unsigned integer rather than hex; both forms are shown so you can compare either way."],
    ["Character count alongside the result", "A mismatch is often a stray trailing newline or space, and the length makes that visible immediately."],
  ],
  faqs: [
    [
      "Which CRC32 variant does this use?",
      "CRC-32/ISO-HDLC, commonly called CRC-32 or IEEE 802.3 — reflected polynomial 0xEDB88320 (equivalent to 0x04C11DB7 unreflected), initial value 0xFFFFFFFF, and a final XOR with 0xFFFFFFFF. Its standard check value for the string \"123456789\" is 0xCBF43926, which is what this tool returns.",
    ],
    [
      "Is CRC32 secure for verifying downloads or passwords?",
      "No. CRC32 is an error-detection code with only 32 bits, so collisions can be constructed deliberately in moments and are expected by chance after roughly 2^16 (about 65,000) random inputs. Use it to catch accidental corruption; use SHA-256 when the concern is tampering.",
    ],
    [
      "Why does my checksum differ from the one my server calculated?",
      "Usually the bytes differ, not the algorithm. The most common causes are a trailing newline, CRLF versus LF line endings, and non-ASCII characters — this tool hashes each character's code unit, so text outside ASCII will not match a CRC32 taken over UTF-8 bytes. Check the reported character count first.",
    ],
    [
      "What is the range of a CRC32 value?",
      "0 to 4,294,967,295 (2^32 - 1), always shown here as exactly eight hex digits with leading zeros preserved. Some languages print it as a signed 32-bit integer instead, which is why you may see a negative number for the same checksum elsewhere.",
    ],
  ],
};

export default seo;
