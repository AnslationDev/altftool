/**
 * MIME type ↔ file extension lookup.
 *
 * Mappings follow the IANA Media Types registry, plus de-facto registrations
 * documented on MDN and in common server config (nginx mime.types, Apache
 * mime.types). Charset guidance follows RFC 6838 §4.2.1 (text types), the
 * HTML Standard (UTF-8 for text/html) and RFC 8259 (JSON is always UTF-8 —
 * a charset parameter on application/json has no effect).
 */

/**
 * Each entry: { mime, extensions[], kind, charset, compressible, note }
 * - charset: "utf-8-recommended" | "utf-8-implicit" | "binary"
 *   utf-8-recommended: text type — declare `; charset=utf-8` explicitly.
 *   utf-8-implicit: spec fixes the encoding (JSON per RFC 8259); charset param is redundant.
 *   binary: charset parameter is meaningless.
 * - compressible: whether gzip/br on the wire typically helps (already-compressed
 *   formats like JPEG, ZIP and WOFF2 should not be re-compressed).
 */
export const MIME_TABLE = [
  // Text
  { mime: "text/plain", extensions: ["txt", "log", "text"], kind: "Text", charset: "utf-8-recommended", compressible: true, note: "Default fallback for unknown text. RFC 2046 default charset is US-ASCII, so declare utf-8 explicitly." },
  { mime: "text/html", extensions: ["html", "htm"], kind: "Text", charset: "utf-8-recommended", compressible: true, note: "The HTML Standard requires UTF-8 for new content; send `text/html; charset=utf-8`." },
  { mime: "text/css", extensions: ["css"], kind: "Text", charset: "utf-8-recommended", compressible: true, note: "Browsers refuse cross-origin stylesheets served with a non-CSS type when nosniff is set." },
  { mime: "text/javascript", extensions: ["js", "mjs"], kind: "Text", charset: "utf-8-recommended", compressible: true, note: "RFC 9239 made text/javascript the sole standard type; application/javascript is obsolete." },
  { mime: "text/csv", extensions: ["csv"], kind: "Text", charset: "utf-8-recommended", compressible: true, note: "RFC 4180. Excel expects a BOM to detect UTF-8 reliably." },
  { mime: "text/markdown", extensions: ["md", "markdown"], kind: "Text", charset: "utf-8-recommended", compressible: true, note: "RFC 7763." },
  { mime: "text/xml", extensions: [], kind: "Text", charset: "utf-8-recommended", compressible: true, note: "Alias of application/xml; RFC 7303 treats them as equivalent, application/xml is conventional for machine-read XML." },
  { mime: "text/calendar", extensions: ["ics"], kind: "Text", charset: "utf-8-recommended", compressible: true, note: "iCalendar, RFC 5545." },
  { mime: "text/vtt", extensions: ["vtt"], kind: "Text", charset: "utf-8-implicit", compressible: true, note: "WebVTT subtitles; the spec requires UTF-8." },

  // Application — structured data
  { mime: "application/json", extensions: ["json", "map"], kind: "Data", charset: "utf-8-implicit", compressible: true, note: "RFC 8259 mandates UTF-8; a charset parameter is allowed but has no effect." },
  { mime: "application/ld+json", extensions: ["jsonld"], kind: "Data", charset: "utf-8-implicit", compressible: true, note: "JSON-LD for structured data / SEO." },
  { mime: "application/xml", extensions: ["xml", "xsl", "xsd"], kind: "Data", charset: "utf-8-recommended", compressible: true, note: "XML declares its own encoding in the prolog; header charset wins on conflict (RFC 7303)." },
  { mime: "application/x-www-form-urlencoded", extensions: [], kind: "Data", charset: "utf-8-implicit", compressible: true, note: "Default HTML form POST body; percent-encoded key=value pairs." },
  { mime: "application/x-ndjson", extensions: ["ndjson", "jsonl"], kind: "Data", charset: "utf-8-implicit", compressible: true, note: "Newline-delimited JSON for streaming and log pipelines (de-facto)." },
  { mime: "application/yaml", extensions: ["yaml", "yml"], kind: "Data", charset: "utf-8-recommended", compressible: true, note: "Registered by RFC 9512 (2024); older servers used text/yaml or application/x-yaml." },
  { mime: "application/wasm", extensions: ["wasm"], kind: "Data", charset: "binary", compressible: true, note: "Required exact type for WebAssembly.instantiateStreaming." },
  { mime: "application/pdf", extensions: ["pdf"], kind: "Document", charset: "binary", compressible: false, note: "PDF streams are internally compressed; wire compression gains little." },
  { mime: "application/zip", extensions: ["zip"], kind: "Archive", charset: "binary", compressible: false, note: "Already deflate-compressed." },
  { mime: "application/gzip", extensions: ["gz", "tgz"], kind: "Archive", charset: "binary", compressible: false, note: "RFC 6713. Do not also set Content-Encoding: gzip for a .gz download — that makes browsers decompress it." },
  { mime: "application/x-tar", extensions: ["tar"], kind: "Archive", charset: "binary", compressible: true, note: "Uncompressed archive; wire compression helps." },
  { mime: "application/x-7z-compressed", extensions: ["7z"], kind: "Archive", charset: "binary", compressible: false, note: "De-facto type." },
  { mime: "application/vnd.rar", extensions: ["rar"], kind: "Archive", charset: "binary", compressible: false, note: "IANA-registered vendor type." },
  { mime: "application/octet-stream", extensions: ["bin", "exe", "dmg", "iso"], kind: "Binary", charset: "binary", compressible: false, note: "Arbitrary bytes — browsers download rather than render. The safe fallback for unknown binary files." },

  // Office documents
  { mime: "application/msword", extensions: ["doc"], kind: "Document", charset: "binary", compressible: true, note: "Legacy Word 97-2003." },
  { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extensions: ["docx"], kind: "Document", charset: "binary", compressible: false, note: "OOXML Word; ZIP container, already compressed." },
  { mime: "application/vnd.ms-excel", extensions: ["xls"], kind: "Document", charset: "binary", compressible: true, note: "Legacy Excel 97-2003." },
  { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extensions: ["xlsx"], kind: "Document", charset: "binary", compressible: false, note: "OOXML Excel; ZIP container." },
  { mime: "application/vnd.ms-powerpoint", extensions: ["ppt"], kind: "Document", charset: "binary", compressible: true, note: "Legacy PowerPoint." },
  { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", extensions: ["pptx"], kind: "Document", charset: "binary", compressible: false, note: "OOXML PowerPoint; ZIP container." },
  { mime: "application/vnd.oasis.opendocument.text", extensions: ["odt"], kind: "Document", charset: "binary", compressible: false, note: "OpenDocument text." },
  { mime: "application/epub+zip", extensions: ["epub"], kind: "Document", charset: "binary", compressible: false, note: "EPUB e-book; ZIP container." },

  // Images
  { mime: "image/jpeg", extensions: ["jpg", "jpeg", "jfif"], kind: "Image", charset: "binary", compressible: false, note: "Lossy; never re-compress on the wire." },
  { mime: "image/png", extensions: ["png"], kind: "Image", charset: "binary", compressible: false, note: "Lossless, internally deflate-compressed." },
  { mime: "image/gif", extensions: ["gif"], kind: "Image", charset: "binary", compressible: false, note: "LZW-compressed; prefer video formats for animation." },
  { mime: "image/webp", extensions: ["webp"], kind: "Image", charset: "binary", compressible: false, note: "Lossy and lossless modes; universal browser support since 2020." },
  { mime: "image/avif", extensions: ["avif"], kind: "Image", charset: "binary", compressible: false, note: "AV1-based; best compression of the widely supported formats." },
  { mime: "image/svg+xml", extensions: ["svg", "svgz"], kind: "Image", charset: "utf-8-recommended", compressible: true, note: "Text-based — compresses well. Can contain script: sanitise user uploads or serve with CSP." },
  { mime: "image/x-icon", extensions: ["ico", "cur"], kind: "Image", charset: "binary", compressible: true, note: "Favicons; image/vnd.microsoft.icon is the IANA-registered alias." },
  { mime: "image/tiff", extensions: ["tif", "tiff"], kind: "Image", charset: "binary", compressible: true, note: "Print/scan workflows; not renderable in most browsers." },
  { mime: "image/heic", extensions: ["heic", "heif"], kind: "Image", charset: "binary", compressible: false, note: "Apple camera default; no Chrome/Firefox rendering — convert for the web." },

  // Audio
  { mime: "audio/mpeg", extensions: ["mp3"], kind: "Audio", charset: "binary", compressible: false, note: "MP3." },
  { mime: "audio/mp4", extensions: ["m4a"], kind: "Audio", charset: "binary", compressible: false, note: "AAC in an MP4 container." },
  { mime: "audio/ogg", extensions: ["ogg", "oga", "opus"], kind: "Audio", charset: "binary", compressible: false, note: "Vorbis or Opus in Ogg. .opus files use audio/ogg with the Opus codec." },
  { mime: "audio/wav", extensions: ["wav"], kind: "Audio", charset: "binary", compressible: true, note: "Usually uncompressed PCM, so wire compression can help — but files are huge; prefer a lossy codec." },
  { mime: "audio/webm", extensions: ["weba"], kind: "Audio", charset: "binary", compressible: false, note: "Audio-only WebM." },
  { mime: "audio/aac", extensions: ["aac"], kind: "Audio", charset: "binary", compressible: false, note: "Raw ADTS AAC stream." },
  { mime: "audio/flac", extensions: ["flac"], kind: "Audio", charset: "binary", compressible: false, note: "Lossless but already compressed." },

  // Video
  { mime: "video/mp4", extensions: ["mp4", "m4v"], kind: "Video", charset: "binary", compressible: false, note: "H.264/H.265/AV1 in MP4 — the safest web default." },
  { mime: "video/webm", extensions: ["webm"], kind: "Video", charset: "binary", compressible: false, note: "VP8/VP9/AV1 in WebM." },
  { mime: "video/ogg", extensions: ["ogv"], kind: "Video", charset: "binary", compressible: false, note: "Theora in Ogg; largely historical." },
  { mime: "video/quicktime", extensions: ["mov"], kind: "Video", charset: "binary", compressible: false, note: "QuickTime container; browser support varies with codec." },
  { mime: "video/x-matroska", extensions: ["mkv"], kind: "Video", charset: "binary", compressible: false, note: "De-facto type; browsers generally will not play MKV inline." },
  { mime: "video/mp2t", extensions: ["ts"], kind: "Video", charset: "binary", compressible: false, note: "MPEG transport stream — HLS segments. Note .ts also means TypeScript source in dev tooling." },
  { mime: "application/vnd.apple.mpegurl", extensions: ["m3u8"], kind: "Video", charset: "utf-8-recommended", compressible: true, note: "HLS playlist (text); audio/mpegurl is a legacy alias." },
  { mime: "application/dash+xml", extensions: ["mpd"], kind: "Video", charset: "utf-8-recommended", compressible: true, note: "MPEG-DASH manifest." },

  // Fonts — RFC 8081 created the font/* tree
  { mime: "font/woff2", extensions: ["woff2"], kind: "Font", charset: "binary", compressible: false, note: "Brotli-compressed internally — never re-compress. The only format modern sites need." },
  { mime: "font/woff", extensions: ["woff"], kind: "Font", charset: "binary", compressible: false, note: "zlib-compressed internally." },
  { mime: "font/ttf", extensions: ["ttf"], kind: "Font", charset: "binary", compressible: true, note: "Uncompressed TrueType; compresses well on the wire." },
  { mime: "font/otf", extensions: ["otf"], kind: "Font", charset: "binary", compressible: true, note: "Uncompressed OpenType." },
  { mime: "application/vnd.ms-fontobject", extensions: ["eot"], kind: "Font", charset: "binary", compressible: true, note: "Legacy IE-only format." },
];

/** Normalise a user-typed extension: trim, lowercase, strip leading dots and names. */
export function normalizeExtension(raw) {
  const s = String(raw ?? "").trim().toLowerCase();
  if (s === "") return "";
  // Accept ".png", "png", "photo.PNG" — keep the final extension segment.
  const noQuery = s.split(/[?#]/)[0];
  const last = noQuery.split(".").pop();
  return last.replace(/[^a-z0-9]/g, "");
}

/**
 * Look up by extension. Returns { entries } (possibly several — e.g. "ts")
 * or { error } when the input is empty/unknown.
 */
export function lookupByExtension(raw) {
  const ext = normalizeExtension(raw);
  if (ext === "") return { error: "Type a file extension, e.g. png or .json." };
  const entries = MIME_TABLE.filter((e) => e.extensions.includes(ext));
  if (entries.length === 0) {
    return {
      error: `No registered MIME type for ".${ext}" in this reference — application/octet-stream is the safe fallback for unknown binary files.`,
    };
  }
  return { ext, entries };
}

/**
 * Look up by MIME type (exact, case-insensitive; parameters like charset are ignored).
 * Falls back to substring match so "json" finds application/json etc.
 */
export function lookupByMime(raw) {
  const q = String(raw ?? "").trim().toLowerCase().split(";")[0].trim();
  if (q === "") return { error: "Type a MIME type, e.g. application/json." };
  const exact = MIME_TABLE.filter((e) => e.mime === q);
  if (exact.length > 0) return { query: q, entries: exact, exact: true };
  const partial = MIME_TABLE.filter((e) => e.mime.includes(q));
  if (partial.length === 0) {
    return { error: `No MIME type matching "${q}" in this reference.` };
  }
  return { query: q, entries: partial, exact: false };
}

/** Human wording for the charset guidance codes. */
export const CHARSET_GUIDANCE = {
  "utf-8-recommended":
    "Text type — declare the charset explicitly, e.g. `; charset=utf-8` (RFC 6838 §4.2.1).",
  "utf-8-implicit":
    "Encoding is fixed by the format's own spec (UTF-8); a charset parameter is redundant.",
  binary: "Binary type — a charset parameter is meaningless; never append one.",
};

/** Plain-text summary of one entry, for the copy button. */
export function formatEntry(entry) {
  if (!entry || typeof entry.mime !== "string") return "";
  const headerValue =
    entry.charset === "utf-8-recommended" ? `${entry.mime}; charset=utf-8` : entry.mime;
  return [
    `Content-Type: ${headerValue}`,
    `Extensions: ${entry.extensions.length ? entry.extensions.map((e) => "." + e).join(", ") : "(none conventional)"}`,
    `Kind: ${entry.kind} · Wire compression ${entry.compressible ? "helps" : "not useful (already compressed)"}`,
    `Note: ${entry.note}`,
  ].join("\n");
}
