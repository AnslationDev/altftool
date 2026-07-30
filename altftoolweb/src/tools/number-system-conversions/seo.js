const seo = {
  intro:
    "Number System Conversions shows one whole number simultaneously in binary (base 2), octal (base 8), decimal (base 10), hexadecimal (base 16) and base-36, with the 0b, 0o and 0x prefixes applied where they belong. Every card also reports the bit width, the byte count rounded up to the next whole byte, and the Unicode character at that code point when the value falls within the valid range up to U+10FFFF. Conversion runs on JavaScript BigInt rather than Number, so values past 2^53 keep every digit instead of silently losing precision.",
  useCases: [
    "You are setting a Unix file mode and want to see 493 as octal 755 and as the binary 111101101 that maps to the rwx bits, without switching to a shell.",
    "A protocol spec gives a field as a decimal constant and you need the hex literal for the header plus the bit width, to confirm it still fits in two bytes.",
    "You are checking which character a code point lands on — enter 8364 and read the Unicode column to confirm it is the euro sign before hardcoding it.",
  ],
  benefits: [
    [
      "All five bases at once",
      "Base 2, 8, 10, 16 and 36 update together as you type, so you compare representations instead of converting one pair at a time.",
    ],
    [
      "Exact past 2^53",
      "BigInt arithmetic means a 30-digit value converts digit-for-digit, where a normal float-backed converter starts rounding.",
    ],
    [
      "Width and code point alongside",
      "Each card shows bit length, bytes rounded up, and the Unicode character for the value, which is usually what you actually needed next.",
    ],
  ],
  faqs: [
    [
      "How do I convert a decimal number to binary and hex?",
      "Enter the decimal value and read the binary and hexadecimal cards — both update as you type. Binary is shown with a 0b prefix and hex with 0x, matching the literal syntax used in C, Python, JavaScript and Rust.",
    ],
    [
      "What is base-36 used for?",
      "Base-36 uses the digits 0–9 followed by the letters A–Z, giving 36 symbols per position, which makes it the most compact encoding that stays alphanumeric and case-insensitive. It is common in short URL slugs, invoice IDs and session keys, where 1,000,000 in decimal compresses to just LFLS.",
    ],
    [
      "How many bits does my number need?",
      "The bit count shown on each card is the length of the number's binary representation, and the byte count is that figure divided by 8 and rounded up, with a floor of 1. So 255 is 8 bits and 1 byte, while 256 needs 9 bits and therefore 2 bytes.",
    ],
    [
      "Why does the binary output say Too large?",
      "Binary output is capped at 64 characters, so any value of 2^64 or more stops rendering as a bit string. The decimal, octal, hexadecimal and base-36 cards keep converting it exactly, because the underlying arithmetic is BigInt and has no fixed width.",
    ],
  ],
};

export default seo;
