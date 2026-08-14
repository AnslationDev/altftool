const seo = {
  title: "Base64 to Hex Converter: Read the Raw Bytes",
  intro:
    "Base64 to Hex decodes a Base64 string into its raw bytes and prints those bytes as hexadecimal — two hex digits per byte, so the output is always exactly twice the decoded length. It reads the standard RFC 4648 §4 alphabet as well as URL-safe input using - and _, and can render the result spaced, continuous, as a C array or as a hexdump -C listing with 16 bytes per line and a printable-ASCII gutter. It is for engineers inspecting a binary blob that arrived as text.",
  useCases: [
    "Check the magic number of a Base64 attachment — 89 50 4E 47 means PNG, 25 50 44 46 means PDF",
    "Paste a Base64-encoded key or certificate and read the DER byte structure instead of guessing at it",
    "Turn a Base64 test vector into a 0x-prefixed, comma-separated hex list you can drop into a C array initializer",
  ],
  benefits: [
    ["Exact byte view", "Every byte becomes two hex digits, so the output length confirms the decoded size at a glance."],
    ["Real hexdump layout", "Offsets are 8 hex digits, 16 bytes per line in two groups of 8, matching hexdump -C output."],
    ["Precise error messages", "A stray character is reported with its position; a 4n+1 length is flagged as truncation."],
  ],
  faqs: [
    [
      "How many hex characters does Base64 decode to?",
      "Exactly 2 per decoded byte. Base64 turns 4 characters into 3 bytes, so 100 Base64 characters become 75 bytes and 150 hex digits. The tool reports both counts so you can verify a payload length without a hex editor.",
    ],
    [
      "How do I tell what kind of file a Base64 string holds?",
      "Read the first bytes in hex. 89 50 4E 47 is PNG, FF D8 FF is JPEG, 25 50 44 46 is %PDF, 50 4B 03 04 is a ZIP (so also .docx or .xlsx), and 1F 8B is gzip. The tool shows the first 8 bytes separately for exactly this check.",
    ],
    [
      "Does this handle URL-safe Base64?",
      "Yes. URL-safe Base64 (RFC 4648 §5) swaps + for - and / for _, and usually drops the = padding. Both alphabets decode here, and the tool notes when it accepted an unpadded string.",
    ],
    [
      "Why does my Base64 string fail to decode?",
      "The most common cause is truncation: a Base64 length of 4n+1 characters cannot exist, because 4 characters carry 3 bytes. The other frequent causes are a stray character copied from a wrapped email header, or `=` padding appearing somewhere other than the end.",
    ],
  ],
};

export default seo;
