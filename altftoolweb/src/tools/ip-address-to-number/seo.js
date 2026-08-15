const seo = {
  title: "IP Address to Number: IPv4 to 32-bit Integer, Both Ways",
  metaDescription:
    "Convert a dotted-quad IPv4 address to its 32-bit integer and back, with binary and 8-digit hex. Valid range 0 to 4,294,967,295; IPv4 only.",
  steps: [
    "In Conversion Fields, type a dotted quad into IP Address (it starts on 192.168.1.1) or paste a whole number into Decimal Number — editing one field clears the other.",
    "Conversion runs as you type: four octets of 0 to 255 become a x 16777216 + b x 65536 + c x 256 + d, and any integer from 0 to 4,294,967,295 becomes dotted-quad again.",
    "Read the IP Address, Decimal, Hexadecimal and Binary cards, then the Binary Representation panel's By Octets rows, Full Binary (32-bit) string and 0x-prefixed 8-digit Hexadecimal, and press Copy beside either field.",
  ],
  intro:
    "The IP Address to Number converter turns a dotted-quad IPv4 address into its single 32-bit integer form using a×16777216 + b×65536 + c×256 + d, and converts any integer from 0 to 4,294,967,295 back into dotted-quad notation. Type into either field and the other updates, with the 32-bit binary and 8-digit hexadecimal forms shown alongside. It is for developers and network engineers storing addresses in a database column, comparing ranges, or reading an address that a log or API returned as a plain number.",
  useCases: [
    "A log file or geolocation API hands you an integer instead of an address, and you need the dotted-quad form to work out which host it refers to.",
    "You are storing IPv4 addresses in an INT UNSIGNED column so that range queries become simple integer comparisons, and want to check a value converts as expected.",
    "You are building a subnet check and want the binary view of the address to see which of the 32 bits change across the range.",
  ],
  benefits: [
    [
      "Both directions in one screen",
      "Editing the address updates the number and editing the number updates the address, so you never need a second page for the reverse lookup.",
    ],
    [
      "Binary and hex alongside the decimal",
      "Shows the same address as a zero-padded 32-bit binary string and an 8-digit hex value, which is what you actually need when reasoning about masks and prefixes.",
    ],
    [
      "Strict octet validation",
      "Requires exactly four octets, each 0–255 with no leading-zero padding, so a malformed address returns nothing rather than a plausible-looking wrong number.",
    ],
  ],
  faqs: [
    [
      "How do you convert an IP address to a number?",
      "Multiply the octets by their place values and add: first × 16,777,216 + second × 65,536 + third × 256 + fourth. For example 10.0.0.1 becomes 10 × 16,777,216 + 1 = 167,772,161. This is the same as reading the four bytes as one 32-bit integer.",
    ],
    [
      "What is the largest number an IPv4 address can be?",
      "4,294,967,295, which is 255.255.255.255 — the maximum value of an unsigned 32-bit integer (2^32 − 1). The lowest is 0, which is 0.0.0.0, so the entire IPv4 space is 4,294,967,296 addresses.",
    ],
    [
      "How do I convert a number back to an IP address?",
      "Take the number modulo the place values: the first octet is the number divided by 16,777,216, then the remainder divided by 65,536, then by 256, then what is left. Enter the integer in the number field and the dotted-quad form appears immediately, provided the value is within 0 to 4,294,967,295.",
    ],
    [
      "Does this work for IPv6 addresses?",
      "No. IPv6 addresses are 128 bits and cannot be represented as a 32-bit integer, so this converter accepts IPv4 dotted-quad notation only. Use an IPv6-specific expander or converter for addresses containing colons.",
    ],
  ],
};

export default seo;
