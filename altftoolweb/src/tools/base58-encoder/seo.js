const seo = {
  intro:
    "The Base58 Encoder converts text to and from Base58 using the Bitcoin alphabet, treating the input as one big integer and repeatedly dividing it by 58 with BigInt so long values stay exact. The alphabet is the 58 characters 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz — the digit 0 and the letters O, I and l are removed because they are the pairs people misread. It is for developers working with Bitcoin-style addresses, IPFS-adjacent identifiers, or any short human-transcribable key, who need to check a value in both directions.",
  useCases: [
    "You are studying how a Bitcoin address is put together and want to see the byte string behind a Base58 value.",
    "A short ID from an API arrives Base58-encoded and you need to read what it actually contains before filing a bug.",
    "You are generating human-readable identifiers and want to confirm your implementation matches the standard Bitcoin alphabet rather than a variant.",
  ],
  benefits: [
    [
      "BigInt arithmetic, not floating point",
      "The base conversion runs on BigInt, so long inputs convert exactly instead of losing precision past 2^53.",
    ],
    [
      "Both directions in one field",
      "Flip the mode select to decode the same box you just encoded from, so you can round-trip a value and confirm it comes back unchanged.",
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
