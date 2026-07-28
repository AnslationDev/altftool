const seo = {
  title: "UUID Generator — Free Bulk UUID v4 & v1 Online",
  h1: "UUID Generator — Create v4 and v1 UUIDs in Your Browser",
  metaDescription:
    "Free UUID generator — up to 100 UUID v4 or v1 IDs at once, copy or download as .txt. Runs in your browser on the Web Crypto API; nothing is uploaded.",
  intro:
    "UUID Generator produces 36-character, lowercase 8-4-4-4-12 identifiers entirely in the browser using the Web Crypto API. The v4 option calls crypto.randomUUID() where the browser supports it, and otherwise falls back to crypto.getRandomValues() over 16 bytes, forcing the version nibble to 4 and the RFC 4122 variant bits to 10xx before formatting the hex string. The v1 option is timestamp-prefixed: the leading 12 hex digits are the current Date.now() millisecond value, and the remaining fields come from 10 cryptographically random bytes. Generation, copying and the .txt download all happen client-side — the page makes no network request and stores nothing.",
  useCases: [
    "Seed a database or fixture file with primary keys before a backend exists — generate 100 v4 UUIDs and paste them straight into a SQL insert or JSON seed.",
    "Grab a single identifier for an idempotency key, correlation ID, API request header or test record without opening a terminal.",
    "Download a plain-text list of UUIDs, one per line, to feed a load-test script, CSV import or spreadsheet column.",
  ],
  benefits: [
    [
      "Cryptographic randomness, not Math.random()",
      "v4 values come from the Web Crypto API — crypto.randomUUID() when available, crypto.getRandomValues() otherwise — so all 122 random bits are drawn from the platform's cryptographic RNG.",
    ],
    [
      "Up to 100 per batch",
      "The quantity field is clamped to 1–100. One click fills the list, Copy All puts every value on the clipboard newline-separated, and Download saves them as a .txt file.",
    ],
    [
      "Nothing leaves the page",
      "The tool is a client-side React component with no fetch calls and no storage — generated UUIDs exist only in the page and disappear on reload.",
    ],
    [
      "Paste-ready output format",
      "Standard lowercase 36-character hex with hyphens, accepted as-is by Postgres uuid columns, MySQL CHAR(36), MongoDB and JSON payloads.",
    ],
  ],
  faqs: [
    [
      "Is this UUID generator free?",
      "Yes — free, with no signup and no cap on how many times you generate. Each batch is limited to 100 UUIDs, but you can run as many batches as you like.",
    ],
    [
      "How many UUIDs can I generate at once?",
      "Up to 100 in a single batch. The quantity input is clamped between 1 and 100, so typing a larger number snaps it back to 100, and the whole batch is generated in one click.",
    ],
    [
      "What is the difference between UUID v1 and UUID v4?",
      "v4 is 122 bits of random data with no embedded information; v1 is timestamp-based, so values sort roughly in creation order. In this tool, v4 uses the Web Crypto API and is fully RFC 4122-conformant. The v1 option is timestamp-prefixed rather than strict RFC 4122 v1 — its first two fields are the current Date.now() value in hex and the rest is crypto-random, so it sorts by generation time but carries no MAC address or 100-nanosecond Gregorian counter. Use v4 unless you specifically want time-ordered strings.",
    ],
    [
      "Are UUID v4 values actually unique?",
      "Uniqueness is probabilistic, not guaranteed. A v4 UUID holds 122 random bits, about 5.3 × 10^36 possible values, so a collision between independently generated UUIDs is vanishingly unlikely as long as the randomness is cryptographic — which it is here, since the bits come from the browser's Web Crypto RNG rather than Math.random().",
    ],
    [
      "Are the generated UUIDs sent to a server or logged anywhere?",
      "No. Every UUID is created in your browser by JavaScript on the page. The tool makes no network request, writes nothing to local storage or a database, and the list is gone as soon as you reload or navigate away.",
    ],
    [
      "Is a UUID the same as a GUID?",
      "Yes — GUID is Microsoft's name for the same 128-bit identifier, and the values this tool produces work anywhere a GUID is expected. The only common difference is casing: .NET often displays uppercase, while this tool outputs lowercase, which is the RFC 4122 canonical form.",
    ],
    [
      "Can I use these UUIDs as database primary keys?",
      "Yes. The output is the canonical 36-character form that Postgres uuid, MySQL CHAR(36)/BINARY(16) and MongoDB all accept. Bear in mind that random v4 keys insert in no particular order, so on very large tables they fragment B-tree indexes more than sequential integer keys do.",
    ],
    [
      "How do I download or copy all the UUIDs at once?",
      "Click Copy All to put every value on the clipboard, one per line, or click Download to save a plain-text file named altftool-v4-uuids.txt (or altftool-v1-uuids.txt) with one UUID per line. Each row also has its own copy button for single values.",
    ],
  ],
  steps: [
    "Choose UUID v4 (random) or UUID v1 (timestamp) and set the quantity, from 1 to 100.",
    "Click Generate UUIDs — the list is created instantly in your browser by the Web Crypto API.",
    "Copy a single value with its row button, use Copy All for the whole newline-separated list, or Download to save it as a .txt file.",
  ],
};

export default seo;
