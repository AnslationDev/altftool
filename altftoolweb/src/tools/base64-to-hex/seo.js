const seo = {
  title: "Base64 to Hex Converter: Read the Raw Bytes",
  intro:
    "Base64 to Hex decodes a Base64 string into its raw bytes and prints those bytes as hexadecimal — two hex digits per byte, so on the default settings the output is exactly twice the decoded length. It reads the standard RFC 4648 §4 alphabet as well as URL-safe input using - and _, strips whitespace and a leading data: URL header, and can render the result in uppercase A-F, with a 0x prefix, and grouped into pairs, 4-character words or 8-character blocks. It is for engineers inspecting a binary blob that arrived as text.",
  useCases: [
    "Check the magic number of a Base64 attachment with Group hex pairs on — 89 50 4E 47 means PNG, 25 50 44 46 means PDF",
    "Paste a Base64-encoded key or certificate and read the DER byte structure instead of guessing at it",
    "Turn a Base64 test vector into a 0x-prefixed byte list — pairs grouping plus Add 0x prefix gives 0x89 0x50 0x4E … to paste into firmware source",
  ],
  benefits: [
    ["Exact byte view", "Every byte becomes two hex digits, so with grouping and prefixes off the character count under the output is exactly twice the decoded size."],
    ["Grouping to match the target", "Pick No grouping, Pairs (2 chars), Words (4 chars) or Blocks (8 chars), and layer uppercase hex and a 0x prefix on top."],
    ["Errors name the failed check", "A 4n+1 length reports “Incorrect length — this is not valid Base64.”; a character outside the alphabet reports “Invalid characters found in the Base64 string.”"],
  ],
  faqs: [
    [
      "How many hex characters does Base64 decode to?",
      "Exactly 2 per decoded byte. Base64 turns 4 characters into 3 bytes, so 100 Base64 characters become 75 bytes and 150 hex digits. A live character count sits under both panels, with Input Size and Output Size tiles below, so you can verify a payload length without a hex editor.",
    ],
    [
      "How do I tell what kind of file a Base64 string holds?",
      "Read the first bytes in hex. 89 50 4E 47 is PNG, FF D8 FF is JPEG, 25 50 44 46 is %PDF, 50 4B 03 04 is a ZIP (so also .docx or .xlsx), and 1F 8B is gzip. Tick Group hex pairs and those leading bytes are readable straight off the top of the Hex Output panel.",
    ],
    [
      "Does this handle URL-safe Base64?",
      "Yes, with no setting to change. URL-safe Base64 (RFC 4648 §5) swaps + for - and / for _, and usually drops the = padding. Both characters are mapped back before decoding and missing padding is re-added silently, so an unpadded URL-safe string converts as-is.",
    ],
    [
      "Why does my Base64 string fail to decode?",
      "The most common cause is truncation: a Base64 length of 4n+1 characters cannot exist, because 4 characters carry 3 bytes. The other frequent causes are a stray character copied from a wrapped email header, or `=` padding appearing somewhere other than the end — both reported as invalid characters. Line breaks are removed for you unless you untick Remove whitespace, which makes the tool refuse whitespace instead.",
    ],
  ],
};

export default seo;
