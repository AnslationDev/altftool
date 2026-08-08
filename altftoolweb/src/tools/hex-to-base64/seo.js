const seo = {
  title: "Hex to Base64 Converter — RFC 4648, URL-Safe Option",
  metaDescription:
    "Paste hex with spaces, colons or 0x prefixes and get standard or URL-safe Base64 — or decode Base64 back to hex. Bytes never leave the browser.",
  steps: [
    "Pick a direction — Hex → Base64 or Base64 → Hex — and paste into the box; spaces, colons and 0x prefixes in hex input are stripped before decoding.",
    "For Base64 output tick \"URL-safe alphabet (- and _)\" or \"Keep = padding\"; for hex output tick \"Uppercase hex\" or \"Space every byte\".",
    "Read the converted string with its byte count, the same data sized as hex and as Base64, how many characters Base64 saves, and the UTF-8 decoding, then press Copy result.",
  ],
  intro:
    "This converter rewrites the same bytes from hexadecimal into Base64 and back, using the alphabets defined in RFC 4648 — 4 bits per hex character, 6 bits per Base64 character. Paste a hex dump with spaces, colons or 0x prefixes and it strips the formatting, decodes to raw bytes, then re-encodes in standard or URL-safe Base64. It is aimed at developers moving keys, hashes, certificates and binary blobs between tools that disagree on encoding.",
  useCases: [
    "Turn a 64-character SHA-256 hex digest into the 44-character Base64 form an API expects.",
    "Convert a colon-separated certificate fingerprint into URL-safe Base64 for a query-free token field.",
    "Decode a Base64 string back to hex to compare it byte for byte against a hex value in a log.",
  ],
  benefits: [
    ["Handles messy input", "Spaces, colons, dashes and 0x prefixes are stripped before decoding, so hex dumps paste straight in."],
    ["Both alphabets", "Switch between standard (+ /) and URL-safe (- _) Base64, with padding on or off."],
    ["Runs offline", "Conversion happens in the browser, so keys and hashes never leave the device."],
  ],
  faqs: [
    [
      "How do you convert hex to Base64?",
      "Decode the hex to bytes — two hex digits per byte — then re-encode those bytes in groups of three as four Base64 characters. Hex 4d616e is the three bytes 77, 97, 110, which encode to TWFu.",
    ],
    [
      "Why is my Base64 shorter than the hex?",
      "Base64 carries 6 bits per character against hex's 4, so it needs about 33% more characters than raw bytes while hex needs 100% more. A 32-byte hash is 64 hex characters but only 44 Base64 characters including padding.",
    ],
    [
      "What do the = signs at the end of Base64 mean?",
      "They pad the output to a multiple of four characters. One leftover byte produces two characters plus '==', two leftover bytes produce three characters plus '='. Decoders accept the string without padding too, which is why the pad toggle exists.",
    ],
    [
      "What is URL-safe Base64?",
      "The RFC 4648 §5 alphabet, which replaces + with - and / with _ so the string survives being placed in a URL path or query without percent-encoding. The bytes are identical; only two characters differ.",
    ],
  ],
};

export default seo;
