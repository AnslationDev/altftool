const seo = {
  intro:
    "This tool maps a file extension to its correct MIME type — the Content-Type value a server should send — and, in reverse, lists every conventional extension for a given MIME type. Mappings follow the IANA Media Types registry with charset guidance from RFC 6838, so developers configuring servers, upload validators or CDNs get the exact header value plus a note on whether gzip or Brotli compression is worth applying.",
  useCases: [
    "A developer configuring nginx or S3 who needs the exact Content-Type header for .woff2, .avif or .m3u8 files",
    "A backend engineer writing an upload allowlist who wants every extension a MIME type like image/jpeg legitimately maps to",
    "An API author checking whether application/json needs a charset parameter before setting response headers",
  ],
  benefits: [
    ["Two-way lookup", "Search extension to MIME type or MIME type to extensions in one tool."],
    ["Charset guidance built in", "Each type says whether to append charset=utf-8, per RFC 6838 and the format's own spec."],
    ["Compression flag", "Shows whether wire compression helps or the format is already compressed, like JPEG, ZIP and WOFF2."],
  ],
  faqs: [
    [
      "What MIME type should I use for JavaScript files?",
      "Use text/javascript. RFC 9239 (2022) made text/javascript the sole standard MIME type for JavaScript and marked application/javascript obsolete, although browsers still accept the older value. ES modules (.mjs) use the same text/javascript type.",
    ],
    [
      "Does application/json need a charset parameter?",
      "No. RFC 8259 requires JSON exchanged between systems to be encoded in UTF-8, so a charset parameter on application/json has no effect. Sending plain application/json is correct; adding ; charset=utf-8 is harmless but redundant.",
    ],
    [
      "What Content-Type should a server send for an unknown file extension?",
      "application/octet-stream. It tells the browser the body is arbitrary binary data, so the file is downloaded rather than rendered or sniffed. Pair it with X-Content-Type-Options: nosniff to stop browsers second-guessing the type.",
    ],
    [
      "Should I gzip fonts, images and PDFs on the wire?",
      "Usually not. WOFF2 fonts are Brotli-compressed internally, WOFF uses zlib, and JPEG, PNG, WebP, AVIF, ZIP and PDF are already compressed, so re-compressing wastes CPU for near-zero savings. Text formats — HTML, CSS, JavaScript, JSON, SVG — and uncompressed binaries like TTF or TAR do benefit from gzip or Brotli.",
    ],
  ],
};

export default seo;
