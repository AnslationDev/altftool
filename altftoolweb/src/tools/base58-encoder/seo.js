const seo = {
  title: "Base58 Encoder & Decoder (Bitcoin Alphabet)",
  metaDescription:
    "Convert UTF-8 text to and from raw Base58 with the Bitcoin alphabet, using BigInt so long values stay exact. Raw Base58 only — not Base58Check or WIF.",
  intro:
    "The Base58 Encoder converts ordinary UTF-8 text to and from raw Base58 using the Bitcoin alphabet. It treats the UTF-8 bytes as one big integer and repeatedly divides with BigInt so long values stay exact. The alphabet is 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz; 0, O, I and l are omitted to reduce visual ambiguity. This is raw Base58, not Base58Check, WIF, encryption, or a wallet-key recovery tool.",
  useCases: [
    "Round-trip a short UTF-8 identifier through the Bitcoin Base58 alphabet while testing an application.",
    "Compare a raw Base58 implementation against known ASCII and Unicode test vectors.",
    "Check whether a Base58 string decodes to valid UTF-8 text without treating it as a Bitcoin address or wallet key.",
  ],
  benefits: [
    [
      "BigInt arithmetic, not floating point",
      "The base conversion runs on BigInt, so long inputs convert exactly instead of losing precision past 2^53.",
    ],
    [
      "Both directions in one field",
      "Flip the mode select to decode the same box you just encoded from. Invalid alphabet characters and byte sequences that are not valid UTF-8 are rejected instead of silently altered.",
    ],
    [
      "Leading zero bytes are preserved",
      "Each leading zero byte in the input becomes a leading 1 in the output and is restored on decode, which is the rule that keeps Base58 addresses stable.",
    ],
  ],
  faqs: [
    [
      "What characters does the Base58 alphabet leave out?",
      "Four: the digit 0, the capital letter O, the capital letter I, and the lowercase letter l. Removing them leaves 58 symbols that cannot be confused with each other when a value is read aloud or copied by hand.",
    ],
    [
      "How is Base58 different from Base64?",
      "Base58 drops the four ambiguous characters and both non-alphanumeric symbols (+ and /), and uses no padding, so a value can be double-clicked, typed, or written down safely. The trade-off is size: Base58 output is longer than Base64 for the same data.",
    ],
    [
      "Why does a leading 1 appear in my encoded output?",
      "Because the input began with a zero byte. Base58 encodes the value as a number, which would otherwise lose those leading zeros, so each one is written back as a literal 1 character at the front.",
    ],
    [
      "Is this the same Base58 used by Bitcoin addresses?",
      "It uses the same alphabet, but a Bitcoin address is Base58Check — a version byte plus a 4-byte double-SHA-256 checksum appended before encoding. This tool does the raw Base58 conversion only, so it will not validate or generate a checksummed address.",
    ],
  ],
};

export default seo;
