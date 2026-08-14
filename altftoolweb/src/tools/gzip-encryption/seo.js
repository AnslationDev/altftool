const seo = {
  title: "Gzip Compress & Decompress Text to Base64 Online",
  metaDescription:
    "Gzip-compress text into a Base64 string or decode one back to plain text (RFC 1952), with live size stats. Compression, not encryption.",
  steps: [
    "Pick 'Compress' or 'Decompress' mode - the Sample button loads a matching example text or gzip Base64 payload.",
    "Paste your text (or a gzip Base64 string) into the input; the output updates live along with the Input Size, Output Size, Compression and Savings cards.",
    "Copy the Base64 result with 'Copy', or press 'Download' to save it as compressed.txt (decompressed.txt in Decompress mode).",
  ],
  intro:
    "This tool gzip-compresses text and returns the result as a Base64 string, and takes a gzip Base64 string back to the original text. Compression uses the DEFLATE algorithm inside the standard gzip container (RFC 1952), the same format as a .gz file or an HTTP Content-Encoding: gzip response, and the Base64 wrapper makes the binary output safe to paste into JSON, a config file or a chat message. It reports input and output sizes as you type, so you can see the ratio for your own payload.",
  useCases: [
    "You need to store a long JSON blob in a field with a length limit and want to see whether gzip plus Base64 gets it under the cap",
    "A log line or API response contains a gzip Base64 payload and you want to read what is actually inside it",
    "You are checking how much a repetitive text fixture shrinks before deciding whether compressing it in your app is worth the CPU",
  ],
  benefits: [
    [
      "Round trip in one place",
      "Compress and decompress with the same Base64 convention, so output from one mode pastes straight into the other.",
    ],
    [
      "Live size comparison",
      "Shows characters, lines and bytes for input and output together, so the real ratio is visible rather than guessed.",
    ],
    [
      "Readable failures",
      "Malformed input returns a clear message about invalid gzip Base64 instead of a raw decoder exception.",
    ],
  ],
  faqs: [
    [
      "Is gzip encryption?",
      "No. Gzip is compression, not encryption — there is no key, and anyone can decompress the output in seconds, which is exactly what the decompress mode here does. Never use it to protect passwords, tokens or personal data; use real encryption for that.",
    ],
    [
      "Why is my compressed output longer than the original?",
      "Because gzip adds a fixed header and trailer (18 bytes of container overhead) and Base64 then inflates every 3 bytes into 4 characters, roughly 33% growth. For short or already-random input there is nothing to squeeze out, so the overhead wins — gzip only pays off on longer, repetitive text.",
    ],
    [
      "What compression does gzip actually use?",
      "DEFLATE, defined in RFC 1951, which combines LZ77 back-references with Huffman coding, wrapped in the gzip container of RFC 1952 with a magic number and a CRC-32 check. That is why plain text with repeated words compresses well while a JPEG or ZIP barely moves.",
    ],
    [
      "Can I paste a .gz file here?",
      "Not the raw file — the input expects the gzip bytes encoded as Base64, not binary. Base64-encode the .gz contents first, then paste; the decompressor strips whitespace and newlines for you before decoding.",
    ],
  ],
};

export default seo;
