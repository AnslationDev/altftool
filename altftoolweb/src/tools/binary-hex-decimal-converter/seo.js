const seo = {
  title: "Binary, Hex & Decimal Converter (BigInt-Exact)",
  metaDescription:
    "Type a number in any base and see decimal, binary, 0x hex, the Unicode character and bit length at once — BigInt-exact beyond 64 bits.",
  intro:
    "The Binary / Hex / Decimal Converter takes one number typed in any of those three bases and shows all of them at once, plus the matching Unicode character and the bit length. It parses with JavaScript BigInt, so values far beyond the 32-bit or 64-bit range convert exactly instead of drifting into floating-point rounding. It is built for developers reading register dumps, byte values, colour codes and protocol fields who want a single copy-ready answer rather than three separate lookups.",
  useCases: [
    "You are reading a hardware datasheet that gives a status register as 0xB4 and you need the bit pattern to see which flags are set — paste it in hex mode and read the binary 10110100 and the 8-bit length.",
    "A CSV export contains raw code points like 8364 and you want to know which characters they are before writing a parser — decimal mode shows the Unicode character alongside the hex 0x20AC.",
    "You are writing a bitmask constant and want to confirm that 1111 1111 1111 in binary really is 4095 and 0xFFF, so the mask width in your header file matches the field width in the spec.",
  ],
  benefits: [
    ["Arbitrary precision, not 53-bit", "BigInt parsing means a 128-bit hash or a huge decimal converts digit-for-digit, where a normal calculator would round it."],
    ["Every representation in one pass", "Decimal, binary, uppercase hex with the 0x prefix, the Unicode character and the bit length all update from a single input."],
    ["Tells you why input is rejected", "Stray characters produce a specific message — binary limited to 0 and 1, hex to 0-9 and A-F, decimal to whole numbers — instead of a silent NaN."],
  ],
  faqs: [
    [
      "How do I convert hex to binary?",
      "Switch the input format to hex, paste the value, and read the binary output row. A leading 0x is stripped automatically, and each hex digit maps to exactly 4 binary digits, so 0xB4 becomes 10110100.",
    ],
    [
      "Can it handle numbers bigger than 64 bits?",
      "Yes. Parsing uses BigInt, which has no fixed width, so a 128-bit or 256-bit value converts exactly. Standard JavaScript numbers lose precision above 2^53 - 1 (9,007,199,254,740,991); this tool does not.",
    ],
    [
      "What does the Unicode character row show?",
      "It shows the character whose code point equals your number, for any value from 0 up to 0x10FFFF (1,114,111) — the highest code point Unicode defines. Anything above that, or a negative number, is reported as outside the Unicode range.",
    ],
    [
      "Why does a negative number not produce binary or hex?",
      "Negative binary and hex depend on a chosen width and encoding — two's complement in 8, 16, 32 or 64 bits gives four different answers for the same value. Rather than guess a width, the converter returns the decimal and marks binary and hex as unsupported for negatives.",
    ],
  ],
};

export default seo;
