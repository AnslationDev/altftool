export const ZIP_INSPECTION_LIMITS = Object.freeze({
  fileBytes: 30 * 1024 * 1024,
  entries: 3_000,
  centralDirectoryBytes: 8 * 1024 * 1024,
  entryNameBytes: 4_096,
  totalDeclaredExpandedBytes: 160 * 1024 * 1024,
  singleDeclaredExpandedBytes: 64 * 1024 * 1024,
  displayedEntries: 80,
});

export const ZIP_INSPECTION_LIMITATIONS = Object.freeze([
  "This reads ZIP headers and central-directory metadata only. It never extracts, opens, executes, or malware-scans archived content.",
  "A result with no listed warning marker does not mean the archive or its contents are safe, trustworthy, complete, or malware-free.",
  "Encrypted or centrally encrypted metadata, split archives, prefixed/self-extracting variants, malformed records, unsupported compression, ZIP variants, and misleading filenames can hide or distort evidence.",
  "Declared sizes and compression ratios come from archive metadata and may be false. They are preflight signals, not measured extraction results.",
  "Symlink detection depends on portable external attributes being present and correctly authored.",
]);

const EOCD_SIGNATURE = 0x06054b50;
const ZIP64_EOCD_SIGNATURE = 0x06064b50;
const ZIP64_LOCATOR_SIGNATURE = 0x07064b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const UTF8_FLAG = 1 << 11;
const ENCRYPTED_FLAG = 1;
const STRONG_ENCRYPTION_FLAG = 1 << 6;
const MASKED_HEADER_FLAG = 1 << 13;
const SUPPORTED_EXPANSION_METHODS = new Set([0, 8]);
const SUSPICIOUS_EXTENSIONS = new Set([
  "app",
  "apk",
  "bat",
  "cmd",
  "com",
  "cpl",
  "dll",
  "dmg",
  "docm",
  "exe",
  "hta",
  "img",
  "iso",
  "jar",
  "js",
  "jse",
  "lnk",
  "msi",
  "msp",
  "pif",
  "potm",
  "ppam",
  "pptm",
  "ps1",
  "reg",
  "scr",
  "sh",
  "sldm",
  "vbe",
  "vbs",
  "wsf",
  "xlam",
  "xlsm",
]);
const DECOY_EXTENSIONS = new Set([
  "csv",
  "doc",
  "docx",
  "gif",
  "jpg",
  "jpeg",
  "pdf",
  "png",
  "ppt",
  "pptx",
  "rtf",
  "txt",
  "xls",
  "xlsx",
]);

function finiteInteger(value, fallback) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : fallback;
}

function readUint16(view, offset) {
  if (offset < 0 || offset + 2 > view.byteLength) return null;
  return view.getUint16(offset, true);
}

function readUint32(view, offset) {
  if (offset < 0 || offset + 4 > view.byteLength) return null;
  return view.getUint32(offset, true);
}

function readUint64(view, offset) {
  if (offset < 0 || offset + 8 > view.byteLength) return null;
  const value = view.getBigUint64(offset, true);
  return value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : null;
}

function findEocd(view) {
  const minimum = Math.max(0, view.byteLength - 65_557);
  for (let offset = view.byteLength - 22; offset >= minimum; offset -= 1) {
    if (readUint32(view, offset) !== EOCD_SIGNATURE) continue;
    const commentLength = readUint16(view, offset + 20);
    if (
      commentLength !== null &&
      offset + 22 + commentLength === view.byteLength
    ) {
      return offset;
    }
  }
  return -1;
}

function parseZip64Directory(view, eocdOffset) {
  const locatorOffset = eocdOffset - 20;
  if (readUint32(view, locatorOffset) !== ZIP64_LOCATOR_SIGNATURE) {
    return {
      ok: false,
      error:
        "ZIP64 sentinel values were present, but the ZIP64 locator was not found.",
    };
  }
  const locatorDisk = readUint32(view, locatorOffset + 4);
  const zip64Offset = readUint64(view, locatorOffset + 8);
  const totalDisks = readUint32(view, locatorOffset + 16);
  if (locatorDisk !== 0 || totalDisks !== 1) {
    return {
      ok: false,
      error: "Split or multi-disk ZIP archives are not supported.",
    };
  }
  if (
    zip64Offset === null ||
    readUint32(view, zip64Offset) !== ZIP64_EOCD_SIGNATURE
  ) {
    return {
      ok: false,
      error: "The ZIP64 end-of-central-directory record is invalid.",
    };
  }

  const disk = readUint32(view, zip64Offset + 16);
  const centralDisk = readUint32(view, zip64Offset + 20);
  const entriesOnDisk = readUint64(view, zip64Offset + 24);
  const entries = readUint64(view, zip64Offset + 32);
  const centralSize = readUint64(view, zip64Offset + 40);
  const centralOffset = readUint64(view, zip64Offset + 48);
  if (
    [entriesOnDisk, entries, centralSize, centralOffset].some(
      (value) => value === null,
    )
  ) {
    return {
      ok: false,
      error: "ZIP64 metadata exceeds safe JavaScript integer limits.",
    };
  }
  if (disk !== 0 || centralDisk !== 0 || entriesOnDisk !== entries) {
    return {
      ok: false,
      error: "Split or multi-disk ZIP archives are not supported.",
    };
  }
  return { ok: true, entries, centralSize, centralOffset, zip64: true };
}

function directoryMetadata(view, eocdOffset) {
  const disk = readUint16(view, eocdOffset + 4);
  const centralDisk = readUint16(view, eocdOffset + 6);
  const entriesOnDisk = readUint16(view, eocdOffset + 8);
  const entries = readUint16(view, eocdOffset + 10);
  const centralSize = readUint32(view, eocdOffset + 12);
  const centralOffset = readUint32(view, eocdOffset + 16);
  if (
    disk === 0xffff ||
    centralDisk === 0xffff ||
    entriesOnDisk === 0xffff ||
    entries === 0xffff ||
    centralSize === 0xffffffff ||
    centralOffset === 0xffffffff
  ) {
    return parseZip64Directory(view, eocdOffset);
  }
  if (disk !== 0 || centralDisk !== 0 || entriesOnDisk !== entries) {
    return {
      ok: false,
      error: "Split or multi-disk ZIP archives are not supported.",
    };
  }
  return { ok: true, entries, centralSize, centralOffset, zip64: false };
}

function zip64Sizes(view, offset, length, needs) {
  const end = offset + length;
  let cursor = offset;
  let uncompressedSize = needs.uncompressed ? null : needs.currentUncompressed;
  let compressedSize = needs.compressed ? null : needs.currentCompressed;
  let localOffset = needs.localOffset ? null : needs.currentLocalOffset;
  const requiresZip64 =
    needs.uncompressed || needs.compressed || needs.localOffset;

  while (cursor < end) {
    if (cursor + 4 > end) {
      return {
        ok: false,
        error: "A ZIP extra-field header is truncated.",
      };
    }
    const id = readUint16(view, cursor);
    const size = readUint16(view, cursor + 2);
    const fieldEnd =
      id === null || size === null ? Number.POSITIVE_INFINITY : cursor + 4 + size;
    if (id === null || size === null || fieldEnd > end) {
      return {
        ok: false,
        error: "A ZIP extra field exceeds its bounds.",
      };
    }
    if (id === 0x0001) {
      let valueOffset = cursor + 4;
      const requiredBytes =
        8 *
        [needs.uncompressed, needs.compressed, needs.localOffset].filter(
          Boolean,
        ).length;
      if (size < requiredBytes) {
        return {
          ok: false,
          error:
            "A ZIP64 extra field is shorter than its declared sentinel values require.",
        };
      }
      if (needs.uncompressed) {
        uncompressedSize = readUint64(view, valueOffset);
        valueOffset += 8;
      }
      if (needs.compressed) {
        compressedSize = readUint64(view, valueOffset);
        valueOffset += 8;
      }
      if (needs.localOffset) localOffset = readUint64(view, valueOffset);
      return {
        ok: true,
        uncompressedSize,
        compressedSize,
        localOffset,
      };
    }
    cursor = fieldEnd;
  }
  if (requiresZip64) {
    return {
      ok: false,
      error:
        "ZIP64 sentinel values were present without a matching ZIP64 extra field.",
    };
  }
  return {
    ok: true,
    uncompressedSize,
    compressedSize,
    localOffset,
  };
}

function decodeName(bytes, utf8) {
  try {
    return new TextDecoder(utf8 ? "utf-8" : "windows-1252", {
      fatal: utf8,
    }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const value of bytes) {
    crc ^= value;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function unicodePathFromExtra(
  view,
  bytes,
  offset,
  length,
  originalNameBytes,
  maximumNameBytes,
) {
  const end = offset + length;
  let cursor = offset;
  let unicodePath = null;
  while (cursor < end) {
    if (cursor + 4 > end) {
      return { ok: false, error: "A ZIP extra-field header is truncated." };
    }
    const id = readUint16(view, cursor);
    const size = readUint16(view, cursor + 2);
    if (id === null || size === null || cursor + 4 + size > end) {
      return { ok: false, error: "A ZIP extra field exceeds its bounds." };
    }
    if (id === 0x7075) {
      if (unicodePath !== null) {
        return {
          ok: false,
          error: "A ZIP entry contains duplicate Unicode path metadata.",
        };
      }
      if (size < 5 || bytes[cursor + 4] !== 1) {
        return {
          ok: false,
          error: "A ZIP Unicode path field has an unsupported structure.",
        };
      }
      const expectedCrc = readUint32(view, cursor + 5);
      const unicodeBytes = bytes.subarray(cursor + 9, cursor + 4 + size);
      if (
        expectedCrc === null ||
        expectedCrc !== crc32(originalNameBytes) ||
        unicodeBytes.byteLength > maximumNameBytes
      ) {
        return {
          ok: false,
          error: "A ZIP Unicode path field does not match its raw filename.",
        };
      }
      try {
        unicodePath = new TextDecoder("utf-8", { fatal: true }).decode(
          unicodeBytes,
        );
      } catch {
        return {
          ok: false,
          error: "A ZIP Unicode path field is not valid UTF-8.",
        };
      }
    }
    cursor += 4 + size;
  }
  return { ok: true, unicodePath };
}

function canonicalEntryName(name) {
  return String(name || "")
    .replace(/\\/gu, "/")
    .normalize("NFC")
    .toLowerCase();
}

function extensionOf(path) {
  const leaf = String(path || "")
    .replace(/\\/gu, "/")
    .split("/")
    .at(-1)
    ?.toLowerCase();
  const dot = leaf?.lastIndexOf(".") ?? -1;
  return dot > 0 ? leaf.slice(dot + 1) : "";
}

function hasDoubleExtension(path, finalExtension) {
  if (!SUSPICIOUS_EXTENSIONS.has(finalExtension)) return false;
  const leaf = String(path || "")
    .replace(/\\/gu, "/")
    .split("/")
    .at(-1)
    ?.toLowerCase();
  const pieces = leaf?.split(".") || [];
  return pieces.length >= 3 && DECOY_EXTENSIONS.has(pieces.at(-2));
}

function pathSignals(path) {
  const value = String(path || "");
  const normalized = value.replace(/\\/gu, "/");
  const segments = normalized.split("/");
  return {
    absolute:
      normalized.startsWith("/") ||
      /^[/]{2}/u.test(normalized) ||
      /^[a-z]:\//iu.test(normalized),
    traversal: segments.some((segment) => segment === ".."),
    controlCharacters:
      /[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/u.test(
        value,
      ),
  };
}

function compressionLabel(method) {
  if (method === 0) return "Stored";
  if (method === 8) return "Deflate";
  if (method === 9) return "Deflate64";
  if (method === 12) return "BZIP2";
  if (method === 14) return "LZMA";
  if (method === 93) return "Zstandard";
  if (method === 99) return "AES marker";
  return `Method ${method}`;
}

function emptyCounts() {
  return {
    pathTraversal: 0,
    absolutePaths: 0,
    controlCharacterNames: 0,
    symlinks: 0,
    suspiciousExtensions: 0,
    doubleExtensions: 0,
    encryptedEntries: 0,
    unsupportedCompression: 0,
    invalidLocalHeaders: 0,
    duplicateNames: 0,
    oversizedEntries: 0,
    highCompressionRatio: 0,
  };
}

export function validateArchiveFile({ name, size } = {}) {
  const bytes = Number(size);
  if (!Number.isSafeInteger(bytes) || bytes <= 0) {
    return { ok: false, error: "Choose a non-empty ZIP-compatible file." };
  }
  if (bytes > ZIP_INSPECTION_LIMITS.fileBytes) {
    return { ok: false, error: "Choose a file no larger than 30 MB." };
  }
  const extension = extensionOf(name);
  if (
    ![
      "apk",
      "docm",
      "docx",
      "epub",
      "jar",
      "odt",
      "ods",
      "odp",
      "pptm",
      "pptx",
      "whl",
      "xlam",
      "xlsm",
      "xlsx",
      "zip",
    ].includes(extension)
  ) {
    return {
      ok: false,
      error:
        "Choose a ZIP or a common ZIP-based package such as JAR, APK, EPUB, OOXML, or ODF.",
    };
  }
  return { ok: true, bytes, extension };
}

export function preflightZipCentralDirectory(bytesInput, options = {}) {
  const bytes =
    bytesInput instanceof Uint8Array
      ? bytesInput
      : new Uint8Array(bytesInput || new ArrayBuffer(0));
  const limits = {
    fileBytes: finiteInteger(
      options.maxFileBytes,
      ZIP_INSPECTION_LIMITS.fileBytes,
    ),
    entries: finiteInteger(options.maxEntries, ZIP_INSPECTION_LIMITS.entries),
    centralDirectoryBytes: finiteInteger(
      options.maxCentralDirectoryBytes,
      ZIP_INSPECTION_LIMITS.centralDirectoryBytes,
    ),
    entryNameBytes: finiteInteger(
      options.maxEntryNameBytes,
      ZIP_INSPECTION_LIMITS.entryNameBytes,
    ),
    totalDeclaredExpandedBytes: finiteInteger(
      options.maxTotalExpandedBytes,
      ZIP_INSPECTION_LIMITS.totalDeclaredExpandedBytes,
    ),
    singleDeclaredExpandedBytes: finiteInteger(
      options.maxSingleExpandedBytes,
      ZIP_INSPECTION_LIMITS.singleDeclaredExpandedBytes,
    ),
  };
  if (!bytes.byteLength) {
    return { ok: false, error: "The selected archive is empty." };
  }
  if (bytes.byteLength > limits.fileBytes) {
    return {
      ok: false,
      error: "The selected archive exceeds the bounded file-size limit.",
    };
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocdOffset = findEocd(view);
  if (eocdOffset < 0) {
    return {
      ok: false,
      error:
        "A complete ZIP end-of-central-directory record was not found. The file may be corrupt, split, centrally encrypted, or not ZIP.",
    };
  }
  const directory = directoryMetadata(view, eocdOffset);
  if (!directory.ok) return directory;
  if (directory.entries > limits.entries) {
    return {
      ok: false,
      error: `The archive declares more than ${limits.entries.toLocaleString("en-US")} entries.`,
    };
  }
  if (directory.centralSize > limits.centralDirectoryBytes) {
    return {
      ok: false,
      error: "The ZIP central directory exceeds the bounded metadata limit.",
    };
  }
  if (
    directory.centralOffset + directory.centralSize > eocdOffset ||
    directory.centralOffset < 0
  ) {
    return {
      ok: false,
      error: "The ZIP central-directory offset or length is inconsistent.",
    };
  }

  const entries = [];
  const counts = emptyCounts();
  let cursor = directory.centralOffset;
  let totalCompressedBytes = 0;
  let totalDeclaredExpandedBytes = 0;
  let largestCompressionRatio = 0;
  let declaredSizeOverflow = false;
  const effectiveNames = new Set();

  for (let index = 0; index < directory.entries; index += 1) {
    if (readUint32(view, cursor) !== CENTRAL_SIGNATURE) {
      return {
        ok: false,
        error: `Central-directory entry ${index + 1} is missing its expected signature.`,
      };
    }
    const madeBy = readUint16(view, cursor + 4);
    const flags = readUint16(view, cursor + 8);
    const method = readUint16(view, cursor + 10);
    const compressed32 = readUint32(view, cursor + 20);
    const uncompressed32 = readUint32(view, cursor + 24);
    const nameLength = readUint16(view, cursor + 28);
    const extraLength = readUint16(view, cursor + 30);
    const commentLength = readUint16(view, cursor + 32);
    const externalAttributes = readUint32(view, cursor + 38);
    const localOffset32 = readUint32(view, cursor + 42);
    if (
      [
        madeBy,
        flags,
        method,
        compressed32,
        uncompressed32,
        nameLength,
        extraLength,
        commentLength,
        externalAttributes,
        localOffset32,
      ].some((value) => value === null)
    ) {
      return {
        ok: false,
        error: "A ZIP central-directory record is truncated.",
      };
    }
    if (nameLength > limits.entryNameBytes) {
      return {
        ok: false,
        error: `Entry ${index + 1} exceeds the bounded filename length.`,
      };
    }
    const recordEnd = cursor + 46 + nameLength + extraLength + commentLength;
    if (
      recordEnd > directory.centralOffset + directory.centralSize ||
      recordEnd > view.byteLength
    ) {
      return {
        ok: false,
        error: "A ZIP central-directory entry is truncated.",
      };
    }

    const sizes = zip64Sizes(view, cursor + 46 + nameLength, extraLength, {
      uncompressed: uncompressed32 === 0xffffffff,
      compressed: compressed32 === 0xffffffff,
      localOffset: localOffset32 === 0xffffffff,
      currentUncompressed: uncompressed32,
      currentCompressed: compressed32,
      currentLocalOffset: localOffset32,
    });
    if (!sizes.ok) {
      return { ok: false, error: sizes.error };
    }
    if (
      sizes.uncompressedSize === null ||
      sizes.compressedSize === null ||
      sizes.localOffset === null
    ) {
      declaredSizeOverflow = true;
    }
    const uncompressedSize = sizes.uncompressedSize ?? 0;
    const compressedSize = sizes.compressedSize ?? 0;
    const nameBytes = bytes.subarray(cursor + 46, cursor + 46 + nameLength);
    const rawName = decodeName(nameBytes, Boolean(flags & UTF8_FLAG));
    const centralUnicode = unicodePathFromExtra(
      view,
      bytes,
      cursor + 46 + nameLength,
      extraLength,
      nameBytes,
      limits.entryNameBytes,
    );
    if (!centralUnicode.ok) {
      return { ok: false, error: centralUnicode.error };
    }
    const name = centralUnicode.unicodePath ?? rawName;
    const localOffset = sizes.localOffset;
    const localBaseValid =
      localOffset !== null &&
      localOffset + 30 <= directory.centralOffset &&
      readUint32(view, localOffset) === LOCAL_SIGNATURE;
    const localFlags = localBaseValid
      ? readUint16(view, localOffset + 6)
      : null;
    const localMethod = localBaseValid
      ? readUint16(view, localOffset + 8)
      : null;
    const localNameLength = localBaseValid
      ? readUint16(view, localOffset + 26)
      : null;
    const localExtraLength = localBaseValid
      ? readUint16(view, localOffset + 28)
      : null;
    const localHeaderEnd =
      localBaseValid && localNameLength !== null && localExtraLength !== null
        ? localOffset + 30 + localNameLength + localExtraLength
        : null;
    const localRecordValid =
      localHeaderEnd !== null &&
      localHeaderEnd <= directory.centralOffset &&
      localHeaderEnd + compressedSize <= directory.centralOffset;
    const localNameBytes =
      localRecordValid && localNameLength !== null
        ? bytes.subarray(
            localOffset + 30,
            localOffset + 30 + localNameLength,
          )
        : new Uint8Array();
    const rawLocalName = localRecordValid
      ? decodeName(localNameBytes, Boolean(localFlags & UTF8_FLAG))
      : "";
    const localUnicode = localRecordValid
      ? unicodePathFromExtra(
          view,
          bytes,
          localOffset + 30 + localNameLength,
          localExtraLength,
          localNameBytes,
          limits.entryNameBytes,
        )
      : { ok: true, unicodePath: null };
    if (!localUnicode.ok) {
      return { ok: false, error: localUnicode.error };
    }
    const localName = localUnicode.unicodePath ?? rawLocalName;
    const centralSignals = pathSignals(name);
    const rawCentralSignals = pathSignals(rawName);
    const localSignals = pathSignals(localName);
    const rawLocalSignals = pathSignals(rawLocalName);
    const signals = {
      absolute:
        centralSignals.absolute ||
        rawCentralSignals.absolute ||
        localSignals.absolute ||
        rawLocalSignals.absolute,
      traversal:
        centralSignals.traversal ||
        rawCentralSignals.traversal ||
        localSignals.traversal ||
        rawLocalSignals.traversal,
      controlCharacters:
        centralSignals.controlCharacters ||
        rawCentralSignals.controlCharacters ||
        localSignals.controlCharacters ||
        rawLocalSignals.controlCharacters,
    };
    const extension = extensionOf(name);
    const rawExtension = extensionOf(rawName);
    const localExtension = extensionOf(localName);
    const rawLocalExtension = extensionOf(rawLocalName);
    const normalized = name.replace(/\\/gu, "/");
    const hostSystem = madeBy >> 8;
    const unixMode = externalAttributes >>> 16;
    const symlink = hostSystem === 3 && (unixMode & 0xf000) === 0xa000;
    const directoryEntry =
      normalized.endsWith("/") ||
      (hostSystem === 3 && (unixMode & 0xf000) === 0x4000) ||
      Boolean(externalAttributes & 0x10);
    const encrypted = Boolean(
      (flags | (localFlags || 0)) &
      (ENCRYPTED_FLAG | STRONG_ENCRYPTION_FLAG | MASKED_HEADER_FLAG),
    );
    const supportedCompression =
      SUPPORTED_EXPANSION_METHODS.has(method) &&
      localMethod !== null &&
      SUPPORTED_EXPANSION_METHODS.has(localMethod);
    const ratio =
      uncompressedSize === 0
        ? 0
        : compressedSize === 0
          ? Number.POSITIVE_INFINITY
          : uncompressedSize / compressedSize;
    const suspiciousExtension =
      SUSPICIOUS_EXTENSIONS.has(extension) ||
      SUSPICIOUS_EXTENSIONS.has(rawExtension) ||
      SUSPICIOUS_EXTENSIONS.has(localExtension) ||
      SUSPICIOUS_EXTENSIONS.has(rawLocalExtension);
    const doubleExtension =
      hasDoubleExtension(name, extension) ||
      hasDoubleExtension(rawName, rawExtension) ||
      hasDoubleExtension(localName, localExtension) ||
      hasDoubleExtension(rawLocalName, rawLocalExtension);
    const oversized = uncompressedSize > limits.singleDeclaredExpandedBytes;
    const highRatio = ratio >= 200;
    const invalidLocalHeader =
      !localRecordValid ||
      localFlags !== flags ||
      localMethod !== method ||
      localName !== name;
    const canonicalName = canonicalEntryName(name);
    const duplicateName = effectiveNames.has(canonicalName);
    effectiveNames.add(canonicalName);

    if (signals.traversal) counts.pathTraversal += 1;
    if (signals.absolute) counts.absolutePaths += 1;
    if (signals.controlCharacters) counts.controlCharacterNames += 1;
    if (symlink) counts.symlinks += 1;
    if (suspiciousExtension) counts.suspiciousExtensions += 1;
    if (doubleExtension) counts.doubleExtensions += 1;
    if (encrypted) counts.encryptedEntries += 1;
    if (!supportedCompression) counts.unsupportedCompression += 1;
    if (invalidLocalHeader) counts.invalidLocalHeaders += 1;
    if (duplicateName) counts.duplicateNames += 1;
    if (oversized) counts.oversizedEntries += 1;
    if (highRatio) counts.highCompressionRatio += 1;
    totalCompressedBytes += compressedSize;
    totalDeclaredExpandedBytes += uncompressedSize;
    largestCompressionRatio = Math.max(largestCompressionRatio, ratio);
    entries.push({
      ordinal: index + 1,
      name,
      directory: directoryEntry,
      compressedSize,
      uncompressedSize,
      compressionMethod: method,
      compressionLabel: compressionLabel(method),
      ratio,
      encrypted,
      supportedCompression,
      symlink,
      suspiciousExtension,
      doubleExtension,
      pathTraversal: signals.traversal,
      absolutePath: signals.absolute,
      controlCharacterName: signals.controlCharacters,
      invalidLocalHeader,
      localNameMismatch: localRecordValid && localName !== name,
      unicodePath: centralUnicode.unicodePath !== null,
      duplicateName,
      oversized,
    });
    cursor = recordEnd;
  }

  const directoryEnd = directory.centralOffset + directory.centralSize;
  if (cursor !== directoryEnd) {
    return {
      ok: false,
      error:
        "The parsed entries do not consume the declared central-directory length.",
    };
  }
  const totalLimitExceeded =
    declaredSizeOverflow ||
    totalDeclaredExpandedBytes > limits.totalDeclaredExpandedBytes;
  const expansionAllowed =
    !totalLimitExceeded &&
    counts.pathTraversal === 0 &&
    counts.absolutePaths === 0 &&
    counts.symlinks === 0 &&
    counts.highCompressionRatio === 0 &&
    counts.oversizedEntries === 0 &&
    counts.encryptedEntries === 0 &&
    counts.unsupportedCompression === 0 &&
    counts.invalidLocalHeaders === 0 &&
    counts.duplicateNames === 0;
  const reviewMarkerCount = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0,
  );

  return {
    ok: true,
    zip64: directory.zip64,
    entries,
    counts,
    summary: {
      entryCount: entries.length,
      fileEntries: entries.filter((entry) => !entry.directory).length,
      directoryEntries: entries.filter((entry) => entry.directory).length,
      centralDirectoryBytes: directory.centralSize,
      totalCompressedBytes,
      totalDeclaredExpandedBytes,
      largestCompressionRatio,
      reviewMarkerCount,
    },
    limits: {
      maxEntries: limits.entries,
      maxTotalDeclaredExpandedBytes: limits.totalDeclaredExpandedBytes,
      maxSingleDeclaredExpandedBytes: limits.singleDeclaredExpandedBytes,
    },
    totalLimitExceeded,
    declaredSizeOverflow,
    expansionAllowed,
    warnings: [
      ...(totalLimitExceeded
        ? ["Declared expanded size exceeds the configured expansion boundary."]
        : []),
      ...(counts.encryptedEntries
        ? [
            "Encrypted or masked entries cannot be inspected from content and may use intentionally hidden metadata.",
          ]
        : []),
      ...(counts.unsupportedCompression
        ? [
            "One or more methods are unsupported for bounded follow-on expansion.",
          ]
        : []),
      ...(counts.duplicateNames
        ? [
            "Duplicate or case-normalized entry names make follow-on ZIP expansion ambiguous.",
          ]
        : []),
    ],
    limitations: ZIP_INSPECTION_LIMITATIONS,
  };
}

export function inspectArchiveBytes(bytesInput, options = {}) {
  const validation = validateArchiveFile({
    name: options.fileName,
    size: options.fileSize,
  });
  if (!validation.ok) return validation;
  const result = preflightZipCentralDirectory(bytesInput);
  if (!result.ok) return result;
  return { ...result, extension: validation.extension };
}

export function buildArchiveCountsReport(
  result,
  generatedAt = new Date().toISOString(),
) {
  if (!result?.ok) return null;
  return {
    reportType: "archive-central-directory-counts-only",
    generatedAt,
    archiveType: result.extension || "zip",
    zip64: result.zip64,
    summary: { ...result.summary },
    counts: { ...result.counts },
    totalLimitExceeded: result.totalLimitExceeded,
    expansionAllowed: result.expansionAllowed,
    limitations: [...ZIP_INSPECTION_LIMITATIONS],
  };
}
