const SIGNATURES = Object.freeze({
  localFile: 0x04034b50,
  centralFile: 0x02014b50,
  centralDigitalSignature: 0x05054b50,
  endOfCentralDirectory: 0x06054b50,
  zip64EndOfCentralDirectory: 0x06064b50,
  zip64Locator: 0x07064b50,
});

const MAXIMUM_EOCD_SEARCH_BYTES = 65_535 + 22;
const MAXIMUM_CENTRAL_DIRECTORY_BYTES = 8 * 1024 * 1024;

function bytesView(input) {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  return new Uint8Array();
}

function readU16(bytes, offset) {
  if (offset < 0 || offset > bytes.byteLength - 2) return null;
  return bytes[offset] + bytes[offset + 1] * 0x100;
}

function readU32(bytes, offset) {
  if (offset < 0 || offset > bytes.byteLength - 4) return null;
  return (
    bytes[offset] +
    bytes[offset + 1] * 0x100 +
    bytes[offset + 2] * 0x10000 +
    bytes[offset + 3] * 0x1000000
  );
}

function readU64Safe(bytes, offset) {
  const low = readU32(bytes, offset);
  const high = readU32(bytes, offset + 4);
  if (low === null || high === null) return null;
  if (high > Math.floor(Number.MAX_SAFE_INTEGER / 0x100000000)) return null;
  const value = high * 0x100000000 + low;
  return Number.isSafeInteger(value) ? value : null;
}

function findEndOfCentralDirectory(bytes) {
  const minimum = Math.max(0, bytes.byteLength - MAXIMUM_EOCD_SEARCH_BYTES);
  for (let offset = bytes.byteLength - 22; offset >= minimum; offset -= 1) {
    if (readU32(bytes, offset) !== SIGNATURES.endOfCentralDirectory) continue;
    const commentBytes = readU16(bytes, offset + 20);
    if (
      commentBytes !== null &&
      offset + 22 + commentBytes === bytes.byteLength
    ) {
      return offset;
    }
  }
  return -1;
}

function readZip64Directory(bytes, eocdOffset) {
  const locatorOffset = eocdOffset - 20;
  if (
    locatorOffset < 0 ||
    readU32(bytes, locatorOffset) !== SIGNATURES.zip64Locator
  ) {
    throw new Error("The ZIP64 central-directory locator is missing.");
  }
  const zip64Disk = readU32(bytes, locatorOffset + 4);
  const zip64Offset = readU64Safe(bytes, locatorOffset + 8);
  const diskCount = readU32(bytes, locatorOffset + 16);
  if (
    zip64Disk !== 0 ||
    diskCount !== 1 ||
    zip64Offset === null ||
    zip64Offset > bytes.byteLength - 56 ||
    readU32(bytes, zip64Offset) !== SIGNATURES.zip64EndOfCentralDirectory
  ) {
    throw new Error("The ZIP64 central-directory locator is invalid.");
  }

  const recordBytes = readU64Safe(bytes, zip64Offset + 4);
  const disk = readU32(bytes, zip64Offset + 16);
  const centralDisk = readU32(bytes, zip64Offset + 20);
  const diskEntries = readU64Safe(bytes, zip64Offset + 24);
  const totalEntries = readU64Safe(bytes, zip64Offset + 32);
  const centralBytes = readU64Safe(bytes, zip64Offset + 40);
  const centralOffset = readU64Safe(bytes, zip64Offset + 48);
  if (
    recordBytes === null ||
    recordBytes < 44 ||
    zip64Offset + 12 + recordBytes > locatorOffset ||
    disk !== 0 ||
    centralDisk !== 0 ||
    diskEntries === null ||
    totalEntries === null ||
    diskEntries !== totalEntries ||
    centralBytes === null ||
    centralOffset === null
  ) {
    throw new Error("The ZIP64 central-directory record is invalid.");
  }
  return { totalEntries, centralBytes, centralOffset };
}

function readDirectoryDescriptor(bytes, eocdOffset) {
  const disk = readU16(bytes, eocdOffset + 4);
  const centralDisk = readU16(bytes, eocdOffset + 6);
  const diskEntries = readU16(bytes, eocdOffset + 8);
  const totalEntries = readU16(bytes, eocdOffset + 10);
  const centralBytes = readU32(bytes, eocdOffset + 12);
  const centralOffset = readU32(bytes, eocdOffset + 16);
  if (
    disk === null ||
    centralDisk === null ||
    diskEntries === null ||
    totalEntries === null ||
    centralBytes === null ||
    centralOffset === null
  ) {
    throw new Error("The ZIP end record is truncated.");
  }
  if (disk !== 0 || centralDisk !== 0 || diskEntries !== totalEntries) {
    throw new Error("Multi-disk ZIP packages are unsupported.");
  }

  const usesZip64 =
    totalEntries === 0xffff ||
    centralBytes === 0xffffffff ||
    centralOffset === 0xffffffff;
  return usesZip64
    ? readZip64Directory(bytes, eocdOffset)
    : { totalEntries, centralBytes, centralOffset };
}

function countCentralEntries(bytes, centralOffset, centralEnd, maximumEntries) {
  let cursor = centralOffset;
  let entries = 0;
  while (cursor < centralEnd) {
    const signature = readU32(bytes, cursor);
    if (signature === SIGNATURES.centralDigitalSignature) {
      const signatureBytes = readU16(bytes, cursor + 4);
      if (
        signatureBytes === null ||
        cursor + 6 + signatureBytes !== centralEnd
      ) {
        throw new Error("The ZIP central-directory signature is malformed.");
      }
      cursor = centralEnd;
      break;
    }
    if (signature !== SIGNATURES.centralFile || cursor > centralEnd - 46) {
      throw new Error("The ZIP central directory is malformed.");
    }
    const nameBytes = readU16(bytes, cursor + 28);
    const extraBytes = readU16(bytes, cursor + 30);
    const commentBytes = readU16(bytes, cursor + 32);
    const startingDisk = readU16(bytes, cursor + 34);
    if (
      nameBytes === null ||
      extraBytes === null ||
      commentBytes === null ||
      startingDisk === null ||
      startingDisk !== 0
    ) {
      throw new Error("The ZIP central file record is invalid.");
    }
    const recordBytes = 46 + nameBytes + extraBytes + commentBytes;
    if (recordBytes > centralEnd - cursor) {
      throw new Error("A ZIP central file record exceeds its declared bounds.");
    }
    entries += 1;
    if (entries > maximumEntries) {
      throw new Error(
        `The ZIP package exceeds the ${maximumEntries.toLocaleString("en-US")}-entry safety limit.`,
      );
    }
    cursor += recordBytes;
  }
  if (cursor !== centralEnd) {
    throw new Error("The ZIP central directory has inconsistent bounds.");
  }
  return entries;
}

/**
 * Validate and count the raw ZIP central directory before JSZip constructs one
 * object per entry. This intentionally accepts only ordinary, single-disk ZIP
 * and ZIP64 packages suitable for OOXML documents.
 */
export function preflightZipStructure(input, { maximumEntries } = {}) {
  const bytes = bytesView(input);
  const entryLimit = Number(maximumEntries);
  if (
    bytes.byteLength < 22 ||
    readU32(bytes, 0) !== SIGNATURES.localFile ||
    !Number.isSafeInteger(entryLimit) ||
    entryLimit <= 0
  ) {
    throw new Error("The ZIP package header or safety limit is invalid.");
  }

  const eocdOffset = findEndOfCentralDirectory(bytes);
  if (eocdOffset < 0) {
    throw new Error("The ZIP central-directory end record is missing.");
  }
  const descriptor = readDirectoryDescriptor(bytes, eocdOffset);
  if (
    descriptor.totalEntries > entryLimit ||
    descriptor.centralBytes > MAXIMUM_CENTRAL_DIRECTORY_BYTES ||
    descriptor.centralOffset > eocdOffset ||
    descriptor.centralBytes > eocdOffset - descriptor.centralOffset
  ) {
    throw new Error("The ZIP central directory exceeds a safety bound.");
  }

  const centralEnd = descriptor.centralOffset + descriptor.centralBytes;
  const actualEntries = countCentralEntries(
    bytes,
    descriptor.centralOffset,
    centralEnd,
    entryLimit,
  );
  if (actualEntries !== descriptor.totalEntries) {
    throw new Error("The ZIP central-directory entry count is inconsistent.");
  }
  return {
    entries: actualEntries,
    centralDirectoryBytes: descriptor.centralBytes,
    zip64:
      readU16(bytes, eocdOffset + 10) === 0xffff ||
      readU32(bytes, eocdOffset + 12) === 0xffffffff ||
      readU32(bytes, eocdOffset + 16) === 0xffffffff,
  };
}
