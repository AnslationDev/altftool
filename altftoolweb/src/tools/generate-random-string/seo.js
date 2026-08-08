const seo = {
  title: "Random String Generator with Entropy Bits and QR",
  metaDescription:
    "crypto.getRandomValues with rejection sampling, 1-256 characters, up to 100 de-duplicated strings a batch, live Shannon entropy, TXT and CSV export.",
  steps: [
    "In the Settings Panel set String length (1-256) and Batch count (1-100), toggle Uppercase, Lowercase, Numbers and Symbols, or paste a Custom character set.",
    "Optionally give the Pattern Builder a mask like AAA-999, where A is an uppercase letter and 9 or # a digit, then press Generate.",
    "Check the bit count in the Entropy Panel, scan the QR of the first string, then Copy all or export random-strings.txt or random-strings.csv.",
  ],
  intro:
    "Generate Random String produces cryptographically random strings using the browser's crypto.getRandomValues with rejection sampling, so no character is more likely than another. You can set a length from 1 to 256, generate up to 100 de-duplicated strings at once, mix uppercase, lowercase, digits and 26 symbols or supply your own character set, and it reports live Shannon entropy in bits — the default 16 characters over the full 88-character pool works out at about 103 bits. Results export as TXT or CSV, the first string renders as a QR code, and the last 12 batches are kept in local history.",
  useCases: [
    "Seeding a staging database with 100 unique account tokens in one click and exporting them straight to CSV for the import script.",
    "Producing an API key or secret for a config file and needing to prove it clears 128 bits of entropy before it goes into version control.",
    "Creating a device-pairing code in a fixed shape such as AAA-999-aaa, where the letters and digits must land in exactly those positions.",
  ],
  benefits: [
    ["Real cryptographic randomness", "It uses crypto.getRandomValues with a rejection loop that discards out-of-range values, so there is no modulo bias skewing the character distribution."],
    ["Entropy shown as you configure", "The bit count and its Weak/Medium/Strong/Very Strong grade update with every charset and length change, before you generate anything."],
    ["Patterns and batches together", "A pattern like AAA-999 fixes the layout while batch mode returns up to 100 strings, de-duplicated so no two values in a batch repeat."],
  ],
  faqs: [
    [
      "How many bits of entropy do I need?",
      "The tool grades 45 bits and above as Medium, 80 and above as Strong, and 128 and above as Very Strong. For long-lived secrets aim for the 128-bit band, which the full 88-character pool reaches at 20 characters.",
    ],
    [
      "What do the pattern characters mean?",
      "A inserts an uppercase letter, a a lowercase letter, 9 or # a digit, * a symbol, and X, x or ? a character from your selected pool. Any other character in the pattern — hyphens, slashes, fixed prefixes — is copied through unchanged.",
    ],
    [
      "What is the maximum length and batch size?",
      "256 characters per string and 100 strings per batch. Batches are collected in a Set so duplicates are dropped, with generation retried up to twenty times the requested count before it gives up.",
    ],
    [
      "Are the strings sent anywhere or logged?",
      "No. Generation happens in your browser, and the only persistence is the last 12 batches saved to your own browser's local storage for the history panel — clearing site data removes them.",
    ],
  ],
};

export default seo;
