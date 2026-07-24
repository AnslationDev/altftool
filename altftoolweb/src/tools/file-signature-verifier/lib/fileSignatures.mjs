export const SIGNATURE_READ_BYTES = 64;
const GENERIC_MIME_TYPES = new Set([
  "application/octet-stream",
  "binary/octet-stream",
]);
const AMBIGUOUS_EXTENSION_HINTS = new Set(["bin", "bundle", "db", "o"]);

function startsWith(bytes, signature, offset = 0) {
  if (bytes.byteLength < offset + signature.length) return false;
  return signature.every((value, index) => bytes[offset + index] === value);
}

function asciiAt(bytes, offset, value) {
  return startsWith(
    bytes,
    [...value].map((character) => character.charCodeAt(0)),
    offset,
  );
}

const SIGNATURES = Object.freeze([
  {
    id: "png",
    name: "PNG image",
    extensions: ["png"],
    mimes: ["image/png"],
    test: (bytes) =>
      startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  {
    id: "jpeg",
    name: "JPEG image",
    extensions: ["jpg", "jpeg", "jpe"],
    mimes: ["image/jpeg"],
    test: (bytes) => startsWith(bytes, [0xff, 0xd8, 0xff]),
  },
  {
    id: "gif",
    name: "GIF image",
    extensions: ["gif"],
    mimes: ["image/gif"],
    test: (bytes) => asciiAt(bytes, 0, "GIF87a") || asciiAt(bytes, 0, "GIF89a"),
  },
  {
    id: "webp",
    name: "WebP image",
    extensions: ["webp"],
    mimes: ["image/webp"],
    test: (bytes) => asciiAt(bytes, 0, "RIFF") && asciiAt(bytes, 8, "WEBP"),
  },
  {
    id: "pdf",
    name: "PDF document",
    extensions: ["pdf"],
    mimes: ["application/pdf"],
    test: (bytes) => asciiAt(bytes, 0, "%PDF-"),
  },
  {
    id: "zip",
    name: "ZIP container",
    extensions: ["zip", "docx", "xlsx", "pptx", "jar", "apk", "epub"],
    mimes: [
      "application/zip",
      "application/x-zip-compressed",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/java-archive",
      "application/vnd.android.package-archive",
      "application/epub+zip",
    ],
    test: (bytes) =>
      startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) ||
      startsWith(bytes, [0x50, 0x4b, 0x05, 0x06]) ||
      startsWith(bytes, [0x50, 0x4b, 0x07, 0x08]),
  },
  {
    id: "gzip",
    name: "GZIP archive",
    extensions: ["gz", "tgz"],
    mimes: ["application/gzip", "application/x-gzip"],
    test: (bytes) => startsWith(bytes, [0x1f, 0x8b, 0x08]),
  },
  {
    id: "seven-zip",
    name: "7-Zip archive",
    extensions: ["7z"],
    mimes: ["application/x-7z-compressed"],
    test: (bytes) => startsWith(bytes, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]),
  },
  {
    id: "rar",
    name: "RAR archive",
    extensions: ["rar"],
    mimes: ["application/vnd.rar", "application/x-rar-compressed"],
    test: (bytes) =>
      startsWith(bytes, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00]) ||
      startsWith(bytes, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01, 0x00]),
  },
  {
    id: "ole",
    name: "OLE Compound File",
    extensions: ["doc", "xls", "ppt", "msi"],
    mimes: [
      "application/x-ole-storage",
      "application/msword",
      "application/vnd.ms-excel",
      "application/vnd.ms-powerpoint",
    ],
    test: (bytes) =>
      startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
  },
  {
    id: "elf",
    name: "ELF executable",
    extensions: ["elf", "so", "o"],
    mimes: ["application/x-elf", "application/x-sharedlib"],
    test: (bytes) => startsWith(bytes, [0x7f, 0x45, 0x4c, 0x46]),
  },
  {
    id: "pe",
    name: "DOS/Windows executable container",
    extensions: ["exe", "dll", "sys", "scr"],
    mimes: [
      "application/vnd.microsoft.portable-executable",
      "application/x-msdownload",
    ],
    test: (bytes) => startsWith(bytes, [0x4d, 0x5a]),
  },
  {
    id: "mach-o",
    name: "Mach-O executable",
    extensions: ["dylib", "bundle", "bin"],
    mimes: ["application/x-mach-binary"],
    test: (bytes) =>
      [
        [0xfe, 0xed, 0xfa, 0xce],
        [0xce, 0xfa, 0xed, 0xfe],
        [0xfe, 0xed, 0xfa, 0xcf],
        [0xcf, 0xfa, 0xed, 0xfe],
      ].some((signature) => startsWith(bytes, signature)),
  },
  {
    id: "cafebabe-container",
    name: "Java class or Mach-O universal binary",
    extensions: ["class", "bin"],
    mimes: ["application/java-vm", "application/x-mach-binary"],
    test: (bytes) => startsWith(bytes, [0xca, 0xfe, 0xba, 0xbe]),
  },
  {
    id: "sqlite",
    name: "SQLite database",
    extensions: ["sqlite", "sqlite3", "db"],
    mimes: ["application/vnd.sqlite3", "application/x-sqlite3"],
    test: (bytes) => asciiAt(bytes, 0, "SQLite format 3\u0000"),
  },
  {
    id: "wasm",
    name: "WebAssembly binary",
    extensions: ["wasm"],
    mimes: ["application/wasm"],
    test: (bytes) => startsWith(bytes, [0x00, 0x61, 0x73, 0x6d]),
  },
  {
    id: "flac",
    name: "FLAC audio",
    extensions: ["flac"],
    mimes: ["audio/flac"],
    test: (bytes) => asciiAt(bytes, 0, "fLaC"),
  },
  {
    id: "ogg",
    name: "Ogg container",
    extensions: ["ogg", "oga", "ogv", "opus"],
    mimes: ["application/ogg", "audio/ogg", "video/ogg"],
    test: (bytes) => asciiAt(bytes, 0, "OggS"),
  },
  {
    id: "wav",
    name: "WAV audio",
    extensions: ["wav"],
    mimes: ["audio/wav", "audio/x-wav", "audio/wave"],
    test: (bytes) => asciiAt(bytes, 0, "RIFF") && asciiAt(bytes, 8, "WAVE"),
  },
  {
    id: "mp3",
    name: "MP3 audio",
    extensions: ["mp3"],
    mimes: ["audio/mpeg"],
    test: (bytes) =>
      asciiAt(bytes, 0, "ID3") ||
      (bytes.byteLength >= 2 &&
        bytes[0] === 0xff &&
        (bytes[1] & 0xe0) === 0xe0),
  },
  {
    id: "webm",
    name: "Matroska/WebM container",
    extensions: ["webm", "mkv"],
    mimes: ["video/webm", "audio/webm", "video/x-matroska"],
    test: (bytes) => startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3]),
  },
  {
    id: "iso-bmff",
    name: "ISO Base Media container",
    extensions: ["mp4", "m4v", "m4a", "mov", "heic", "heif", "avif"],
    mimes: [
      "video/mp4",
      "audio/mp4",
      "video/quicktime",
      "image/heic",
      "image/heif",
      "image/avif",
    ],
    test: (bytes) => bytes.byteLength >= 12 && asciiAt(bytes, 4, "ftyp"),
  },
]);

function toBytes(input) {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  return new Uint8Array();
}

function extensionOf(fileName) {
  const name = String(fileName ?? "")
    .trim()
    .toLowerCase();
  const index = name.lastIndexOf(".");
  return index >= 0 && index < name.length - 1 ? name.slice(index + 1) : "";
}

export function formatSignatureBytes(input, length = 16) {
  return [...toBytes(input).slice(0, length)]
    .map((value) => value.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");
}

export function inspectFileSignature(
  input,
  { fileName = "", browserType = "" } = {},
) {
  const bytes = toBytes(input);
  const extension = extensionOf(fileName);
  const normalizedMime = String(browserType ?? "")
    .trim()
    .toLowerCase();
  const comparableMime = GENERIC_MIME_TYPES.has(normalizedMime)
    ? ""
    : normalizedMime;
  const detected =
    SIGNATURES.find((signature) => signature.test(bytes)) ?? null;
  const extensionKnown = SIGNATURES.some((signature) =>
    signature.extensions.includes(extension),
  );
  const mimeKnown = SIGNATURES.some((signature) =>
    signature.mimes.includes(comparableMime),
  );
  const extensionMatch =
    detected && extension
      ? detected.extensions.includes(extension)
      : !detected && extensionKnown && !AMBIGUOUS_EXTENSION_HINTS.has(extension)
        ? false
        : null;
  const mimeMatch =
    detected && comparableMime
      ? detected.mimes.includes(comparableMime)
      : !detected && mimeKnown
        ? false
        : null;

  let verdict = "unknown";
  if (extensionMatch === false || mimeMatch === false) verdict = "mismatch";
  else if (detected && (extensionMatch === true || mimeMatch === true))
    verdict = "consistent";
  else if (detected) verdict = "detected";

  return {
    detected: detected
      ? {
          id: detected.id,
          name: detected.name,
          extensions: [...detected.extensions],
          mimes: [...detected.mimes],
        }
      : null,
    fileName: String(fileName ?? ""),
    extension,
    browserType: normalizedMime,
    extensionKnown,
    mimeKnown,
    extensionMatch,
    mimeMatch,
    verdict,
    bytesRead: bytes.byteLength,
    signatureHex: formatSignatureBytes(bytes),
  };
}
