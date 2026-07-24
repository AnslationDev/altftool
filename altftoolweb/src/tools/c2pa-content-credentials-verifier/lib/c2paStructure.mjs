export const C2PA_STRUCTURE_LIMITS = Object.freeze({
  fileBytes: 24 * 1024 * 1024,
  manifestBytes: 8 * 1024 * 1024,
  boxes: 4096,
  depth: 16,
  issues: 48,
  jpegSegments: 512,
  pngChunks: 2048,
  labelBytes: 512,
  purposeBytes: 32,
});

export const C2PA_STRUCTURE_LIMITATIONS = Object.freeze([
  "This is a bounded container and JUMBF structure inspection, not a C2PA validator.",
  "It does not decode CBOR claims or assertions, decompress brob content, verify COSE signatures, calculate hard bindings, consult trust lists, or retrieve remote or sidecar manifests.",
  "A readable C2PA-shaped structure does not establish authenticity, integrity, signer identity, edit history, source, truthfulness, safety, or whether AI was used.",
  "No observed embedded store does not mean a file is fake. Credentials may never have existed, may have been removed, may be external, or may use an unsupported or malformed embedding.",
  "PNG chunk CRC values and ordinary media payloads are not validated. Unknown JUMBF types are skipped.",
]);

const MEGABYTE = 1024 * 1024;
const JPEG_MIMES = new Set(["image/jpeg", "image/jpg"]);
const PNG_MIMES = new Set(["image/png"]);
const BMFF_MIMES = new Set([
  "video/mp4",
  "application/mp4",
  "audio/mp4",
  "video/quicktime",
  "image/avif",
  "image/heic",
  "image/heif",
]);
const JUMBF_MIMES = new Set([
  "application/c2pa",
  "application/x-c2pa-manifest-store",
]);
const EXTENSION_GROUP = Object.freeze({
  jpg: "jpeg",
  jpeg: "jpeg",
  png: "png",
  mp4: "bmff",
  m4a: "bmff",
  mov: "bmff",
  avif: "bmff",
  heic: "bmff",
  heif: "bmff",
  c2pa: "jumbf",
});
const MIME_GROUPS = Object.freeze({
  jpeg: JPEG_MIMES,
  png: PNG_MIMES,
  bmff: BMFF_MIMES,
  jumbf: JUMBF_MIMES,
});

const UUIDS = Object.freeze({
  store: "6332706100110010800000aa00389b71",
  standardManifest: "63326d6100110010800000aa00389b71",
  legacyStandardManifest: "63326d6400110010800000aa00389b71",
  updateManifest: "6332756d00110010800000aa00389b71",
  assertionStore: "6332617300110010800000aa00389b71",
  claim: "6332636c00110010800000aa00389b71",
  signature: "6332637300110010800000aa00389b71",
});

const C2PA_BMFF_UUID = "d8fec3d61b0e483c92975828877ec481";
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function extensionOf(name) {
  const normalized = String(name || "")
    .trim()
    .toLowerCase();
  const dot = normalized.lastIndexOf(".");
  return dot >= 0 ? normalized.slice(dot + 1) : "";
}

function finiteInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : -1;
}

export function validateC2paStructureFile({ name, size, type } = {}) {
  const extension = extensionOf(name);
  const group = EXTENSION_GROUP[extension];
  if (!group) {
    return {
      ok: false,
      error:
        "Choose a JPEG, PNG, MP4, M4A, MOV, AVIF, HEIC, HEIF, or .c2pa file.",
    };
  }

  const bytes = finiteInteger(size);
  if (bytes <= 0) {
    return {
      ok: false,
      error: "The selected file is empty or has an invalid size.",
    };
  }
  if (bytes > C2PA_STRUCTURE_LIMITS.fileBytes) {
    return {
      ok: false,
      error: `Choose a file no larger than ${C2PA_STRUCTURE_LIMITS.fileBytes / MEGABYTE} MB.`,
    };
  }

  const mediaType = String(type || "")
    .trim()
    .toLowerCase()
    .split(";")[0];
  if (mediaType && !MIME_GROUPS[group].has(mediaType)) {
    return {
      ok: false,
      error:
        "The file extension and browser-reported media type do not match a supported format.",
    };
  }

  return { ok: true, bytes, expectedGroup: group };
}

function readU16(bytes, offset) {
  if (offset < 0 || offset > bytes.byteLength - 2) return null;
  return bytes[offset] * 0x100 + bytes[offset + 1];
}

function readU32(bytes, offset) {
  if (offset < 0 || offset > bytes.byteLength - 4) return null;
  return (
    bytes[offset] * 0x1000000 +
    bytes[offset + 1] * 0x10000 +
    bytes[offset + 2] * 0x100 +
    bytes[offset + 3]
  );
}

function readU64Safe(bytes, offset) {
  const high = readU32(bytes, offset);
  const low = readU32(bytes, offset + 4);
  if (high === null || low === null) return null;
  if (high > Math.floor(Number.MAX_SAFE_INTEGER / 0x100000000)) return null;
  const value = high * 0x100000000 + low;
  return Number.isSafeInteger(value) ? value : null;
}

function ascii(bytes, start, length) {
  if (start < 0 || length < 0 || start > bytes.byteLength - length) return "";
  let value = "";
  for (let index = start; index < start + length; index += 1) {
    const code = bytes[index];
    if (code < 0x20 || code > 0x7e) return "";
    value += String.fromCharCode(code);
  }
  return value;
}

function hex(bytes, start, length) {
  if (start < 0 || length < 0 || start > bytes.byteLength - length) return "";
  let value = "";
  for (let index = start; index < start + length; index += 1) {
    value += bytes[index].toString(16).padStart(2, "0");
  }
  return value;
}

function bytesEqual(bytes, start, expected) {
  if (start < 0 || start > bytes.byteLength - expected.length) return false;
  return expected.every((value, index) => bytes[start + index] === value);
}

function isZeroPadding(bytes, start, end) {
  if (start < 0 || end < start || end > bytes.byteLength) return false;
  for (let index = start; index < end; index += 1) {
    if (bytes[index] !== 0) return false;
  }
  return true;
}

function decodeJumbfLabel(bytes, start, end) {
  try {
    const value = new TextDecoder("utf-8", { fatal: true }).decode(
      bytes.subarray(start, end),
    );
    for (const character of value) {
      const code = character.codePointAt(0);
      if (
        code <= 0x1f ||
        (code >= 0x7f && code <= 0x9f) ||
        code === 0xfeff ||
        code === 0xffff ||
        character === "/" ||
        character === ";" ||
        character === "?" ||
        character === "#"
      ) {
        return null;
      }
    }
    return value;
  } catch {
    return null;
  }
}

function readBoxHeader(bytes, start, limit) {
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(limit) ||
    start < 0 ||
    limit > bytes.byteLength ||
    start > limit - 8
  ) {
    return { ok: false, error: "truncated-header" };
  }

  const size32 = readU32(bytes, start);
  const type = ascii(bytes, start + 4, 4);
  if (size32 === null || !type) {
    return { ok: false, error: "invalid-header" };
  }

  let headerBytes = 8;
  let size = size32;
  if (size32 === 1) {
    size = readU64Safe(bytes, start + 8);
    headerBytes = 16;
    if (size === null) return { ok: false, error: "unsafe-extended-size" };
  } else if (size32 === 0) {
    size = limit - start;
  }

  if (size < headerBytes) return { ok: false, error: "short-box" };
  const remaining = limit - start;
  if (size > remaining) return { ok: false, error: "box-out-of-bounds" };

  return {
    ok: true,
    start,
    end: start + size,
    size,
    type,
    headerBytes,
    contentStart: start + headerBytes,
    extendsToEnd: size32 === 0,
  };
}

function readFragmentBoxHeader(bytes, start, limit) {
  if (start < 0 || limit > bytes.byteLength || start > limit - 8) {
    return { ok: false };
  }
  const size32 = readU32(bytes, start);
  const type = ascii(bytes, start + 4, 4);
  if (size32 === null || !type || size32 === 0) return { ok: false };
  if (size32 === 1) {
    const size = readU64Safe(bytes, start + 8);
    if (size === null || size < 16 || start > limit - 16) return { ok: false };
    return { ok: true, size, type, headerBytes: 16 };
  }
  if (size32 < 8) return { ok: false };
  return { ok: true, size: size32, type, headerBytes: 8 };
}

function addIssue(state, message) {
  state.issueCount += 1;
  if (
    state.issues.length < C2PA_STRUCTURE_LIMITS.issues &&
    !state.issues.includes(message)
  ) {
    state.issues.push(message);
  }
}

function newStoreState(source) {
  return {
    source,
    issueCount: 0,
    issues: [],
    complete: true,
    boxesInspected: 0,
    maximumDepth: 0,
    standardManifests: 0,
    legacyStandardManifests: 0,
    updateManifests: 0,
    assertionStores: 0,
    claimBoxes: 0,
    signatureBoxes: 0,
    cborContentBoxes: 0,
    compressedContentBoxes: 0,
  };
}

function readJumbfDescription(bytes, box, state) {
  const contentBytes = box.end - box.contentStart;
  if (contentBytes < 17) {
    addIssue(state, "A JUMBF description box is truncated.");
    return null;
  }

  const uuid = hex(bytes, box.contentStart, 16);
  const toggles = bytes[box.contentStart + 16];
  if ((toggles & 0x03) !== 0x03) {
    addIssue(
      state,
      "A C2PA JUMBF description is missing required label or requestable toggles.",
    );
  }
  let label = "";
  if ((toggles & 0x02) !== 0) {
    const labelStart = box.contentStart + 17;
    const labelLimit = Math.min(
      box.end,
      labelStart + C2PA_STRUCTURE_LIMITS.labelBytes + 1,
    );
    let terminator = -1;
    for (let index = labelStart; index < labelLimit; index += 1) {
      if (bytes[index] === 0) {
        terminator = index;
        break;
      }
    }
    if (terminator < 0) {
      addIssue(
        state,
        "A required bounded JUMBF label is missing its terminator.",
      );
      return { uuid, toggles, label: "", labelReadable: false };
    }
    label = decodeJumbfLabel(bytes, labelStart, terminator);
    if (label === null) {
      addIssue(
        state,
        "A JUMBF label is invalid UTF-8 or uses forbidden characters.",
      );
      return { uuid, toggles, label: "", labelReadable: false };
    }
  }

  return {
    uuid,
    toggles,
    label,
    labelReadable: true,
  };
}

function expectedLabelMatches(uuid, label) {
  if (uuid === UUIDS.store) return label === "c2pa";
  if (
    uuid === UUIDS.standardManifest ||
    uuid === UUIDS.legacyStandardManifest ||
    uuid === UUIDS.updateManifest
  ) {
    return label.includes("urn:");
  }
  if (uuid === UUIDS.assertionStore) return label === "c2pa.assertions";
  if (uuid === UUIDS.claim) {
    return label === "c2pa.claim" || label === "c2pa.claim.v2";
  }
  if (uuid === UUIDS.signature) return label === "c2pa.signature";
  return true;
}

function observeKnownDescription(description, state) {
  if (!description) return;
  const { label, uuid } = description;
  if (uuid === UUIDS.standardManifest) state.standardManifests += 1;
  if (uuid === UUIDS.legacyStandardManifest) {
    state.legacyStandardManifests += 1;
  }
  if (uuid === UUIDS.updateManifest) state.updateManifests += 1;
  if (uuid === UUIDS.assertionStore) state.assertionStores += 1;
  if (uuid === UUIDS.claim) state.claimBoxes += 1;
  if (uuid === UUIDS.signature) state.signatureBoxes += 1;

  if (!expectedLabelMatches(uuid, label)) {
    addIssue(
      state,
      "A recognized C2PA JUMBF type does not carry its expected label shape.",
    );
  }
}

function inspectJumbfSuperbox(bytes, superbox, state, depth) {
  state.maximumDepth = Math.max(state.maximumDepth, depth);
  if (depth > C2PA_STRUCTURE_LIMITS.depth) {
    state.complete = false;
    addIssue(state, "The nested JUMBF depth exceeds the inspection limit.");
    return;
  }

  let cursor = superbox.contentStart;
  let childIndex = 0;
  let description = null;
  while (cursor < superbox.end) {
    if (state.boxesInspected >= C2PA_STRUCTURE_LIMITS.boxes) {
      state.complete = false;
      addIssue(state, "The JUMBF box count exceeds the inspection limit.");
      return;
    }

    if (isZeroPadding(bytes, cursor, superbox.end)) break;
    const child = readBoxHeader(bytes, cursor, superbox.end);
    if (!child.ok) {
      state.complete = false;
      addIssue(state, "A nested JUMBF box has invalid or truncated bounds.");
      return;
    }
    state.boxesInspected += 1;

    if (childIndex === 0) {
      if (child.type !== "jumd") {
        state.complete = false;
        addIssue(
          state,
          "A JUMBF superbox does not begin with a description box.",
        );
      } else {
        description = readJumbfDescription(bytes, child, state);
        observeKnownDescription(description, state);
      }
    } else if (child.type === "jumb") {
      inspectJumbfSuperbox(bytes, child, state, depth + 1);
    } else if (child.type === "cbor") {
      state.cborContentBoxes += 1;
    } else if (child.type === "brob") {
      state.compressedContentBoxes += 1;
    }

    childIndex += 1;
    cursor = child.end;
    if (child.extendsToEnd) break;
  }

  if (childIndex === 0 || !description) {
    state.complete = false;
    addIssue(state, "A JUMBF superbox has no readable description.");
  }
}

function inspectJumbfStore(bytes, source) {
  const state = newStoreState(source);
  if (bytes.byteLength > C2PA_STRUCTURE_LIMITS.manifestBytes) {
    state.complete = false;
    addIssue(
      state,
      "The candidate manifest store exceeds the inspection limit.",
    );
    return { recognized: false, ...state };
  }

  const root = readBoxHeader(bytes, 0, bytes.byteLength);
  if (!root.ok || root.type !== "jumb") {
    return { recognized: false, ...state };
  }
  state.boxesInspected += 1;

  const firstChild = readBoxHeader(bytes, root.contentStart, root.end);
  if (!firstChild.ok || firstChild.type !== "jumd") {
    return { recognized: false, ...state };
  }
  const rootDescription = readJumbfDescription(bytes, firstChild, state);
  if (
    !rootDescription ||
    rootDescription.uuid !== UUIDS.store ||
    rootDescription.label !== "c2pa"
  ) {
    return { recognized: false, ...state };
  }

  inspectJumbfSuperbox(bytes, root, state, 0);
  if (
    root.end < bytes.byteLength &&
    !isZeroPadding(bytes, root.end, bytes.byteLength)
  ) {
    state.complete = false;
    addIssue(
      state,
      "Non-padding bytes follow the declared C2PA Manifest Store box.",
    );
  }

  const manifestBoxes =
    state.standardManifests +
    state.legacyStandardManifests +
    state.updateManifests;
  const expectedComponentsObserved =
    manifestBoxes > 0 &&
    state.assertionStores > 0 &&
    state.claimBoxes > 0 &&
    state.signatureBoxes > 0;

  return {
    recognized: true,
    source,
    byteLength: root.size,
    complete: state.complete,
    structurallyReadable: state.complete && state.issueCount === 0,
    expectedComponentsObserved,
    issueCount: state.issueCount,
    issues: state.issues,
    boxesInspected: state.boxesInspected,
    maximumDepth: state.maximumDepth,
    standardManifests: state.standardManifests,
    legacyStandardManifests: state.legacyStandardManifests,
    updateManifests: state.updateManifests,
    assertionStores: state.assertionStores,
    claimBoxes: state.claimBoxes,
    signatureBoxes: state.signatureBoxes,
    cborContentBoxes: state.cborContentBoxes,
    compressedContentBoxes: state.compressedContentBoxes,
  };
}

function appendRecognizedStore(stores, bytes, source, state) {
  if (bytes.byteLength > C2PA_STRUCTURE_LIMITS.manifestBytes) {
    state.oversizedCandidates += 1;
    addIssue(state, "A candidate manifest store exceeds the inspection limit.");
    return;
  }
  const inspected = inspectJumbfStore(bytes, source);
  if (inspected.recognized) stores.push(inspected);
}

function makeContainerState() {
  return {
    issueCount: 0,
    issues: [],
    oversizedCandidates: 0,
  };
}

function concatParts(parts, totalBytes) {
  const output = new Uint8Array(totalBytes);
  let cursor = 0;
  for (const part of parts) {
    output.set(part, cursor);
    cursor += part.byteLength;
  }
  return output;
}

function inspectJpeg(bytes) {
  const state = makeContainerState();
  const stores = [];
  let markerSegments = 0;
  let app11JumbfSegments = 0;
  let scanReachedImageData = false;
  let current = null;
  let cursor = 2;

  function finalizeCurrent() {
    if (!current) return;
    if (current.totalBytes !== current.declaredBytes) {
      addIssue(
        state,
        "A JPEG APP11 JUMBF fragment sequence is incomplete or oversized.",
      );
    } else {
      const candidate = concatParts(current.parts, current.totalBytes);
      appendRecognizedStore(stores, candidate, "JPEG APP11", state);
    }
    current = null;
  }

  while (cursor < bytes.byteLength) {
    if (markerSegments >= C2PA_STRUCTURE_LIMITS.jpegSegments) {
      addIssue(state, "The JPEG marker count exceeds the inspection limit.");
      break;
    }
    if (bytes[cursor] !== 0xff) {
      addIssue(state, "Unexpected bytes occur in the JPEG marker sequence.");
      break;
    }
    while (cursor < bytes.byteLength && bytes[cursor] === 0xff) cursor += 1;
    if (cursor >= bytes.byteLength) {
      addIssue(state, "The JPEG ends inside a marker prefix.");
      break;
    }

    const marker = bytes[cursor];
    cursor += 1;
    if (marker === 0xd9) {
      finalizeCurrent();
      break;
    }
    if (marker === 0xda) {
      finalizeCurrent();
      scanReachedImageData = true;
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      finalizeCurrent();
      markerSegments += 1;
      continue;
    }

    const segmentLength = readU16(bytes, cursor);
    if (
      segmentLength === null ||
      segmentLength < 2 ||
      cursor > bytes.byteLength - segmentLength
    ) {
      finalizeCurrent();
      addIssue(state, "A JPEG marker segment has invalid or truncated bounds.");
      break;
    }
    const bodyStart = cursor + 2;
    const bodyEnd = cursor + segmentLength;
    markerSegments += 1;

    const isJumbfApp11 =
      marker === 0xeb &&
      bodyEnd - bodyStart >= 16 &&
      bytes[bodyStart] === 0x4a &&
      bytes[bodyStart + 1] === 0x50;

    if (!isJumbfApp11) {
      finalizeCurrent();
      cursor = bodyEnd;
      continue;
    }

    app11JumbfSegments += 1;
    const instance = readU16(bytes, bodyStart + 2);
    const sequence = readU32(bytes, bodyStart + 4);
    const fragmentHeader = readFragmentBoxHeader(bytes, bodyStart + 8, bodyEnd);
    if (
      instance === null ||
      sequence === null ||
      !fragmentHeader.ok ||
      fragmentHeader.size > C2PA_STRUCTURE_LIMITS.manifestBytes
    ) {
      finalizeCurrent();
      if (
        fragmentHeader.ok &&
        fragmentHeader.size > C2PA_STRUCTURE_LIMITS.manifestBytes
      ) {
        state.oversizedCandidates += 1;
      }
      addIssue(
        state,
        "A JPEG APP11 JUMBF fragment header is invalid or exceeds limits.",
      );
      cursor = bodyEnd;
      continue;
    }

    const key = `${instance}:${fragmentHeader.size}:${fragmentHeader.type}:${fragmentHeader.headerBytes}`;
    if (sequence === 1) {
      finalizeCurrent();
      const firstPart = bytes.subarray(bodyStart + 8, bodyEnd);
      current = {
        key,
        nextSequence: 2,
        declaredBytes: fragmentHeader.size,
        headerBytes: fragmentHeader.headerBytes,
        parts: [firstPart],
        totalBytes: firstPart.byteLength,
      };
    } else if (
      current &&
      current.key === key &&
      sequence === current.nextSequence
    ) {
      const contentStart = bodyStart + 8 + current.headerBytes;
      const part = bytes.subarray(contentStart, bodyEnd);
      current.parts.push(part);
      current.totalBytes += part.byteLength;
      current.nextSequence += 1;
    } else {
      finalizeCurrent();
      addIssue(
        state,
        "A JPEG APP11 JUMBF fragment is out of order or orphaned.",
      );
    }

    if (current && current.totalBytes >= current.declaredBytes) {
      finalizeCurrent();
    }
    cursor = bodyEnd;
  }
  finalizeCurrent();

  return {
    format: "JPEG",
    expectedGroup: "jpeg",
    stores,
    container: {
      markerSegments,
      app11JumbfSegments,
      scanReachedImageData,
      oversizedCandidates: state.oversizedCandidates,
      issueCount: state.issueCount,
    },
    containerIssues: state.issues,
    containerIssueCount: state.issueCount,
  };
}

function inspectPng(bytes) {
  const state = makeContainerState();
  const stores = [];
  let chunks = 0;
  let caBxChunks = 0;
  let sawIhdr = false;
  let sawIend = false;
  let cursor = 8;

  while (cursor < bytes.byteLength) {
    if (chunks >= C2PA_STRUCTURE_LIMITS.pngChunks) {
      addIssue(state, "The PNG chunk count exceeds the inspection limit.");
      break;
    }
    if (cursor > bytes.byteLength - 12) {
      addIssue(state, "The PNG ends inside a chunk header.");
      break;
    }
    const length = readU32(bytes, cursor);
    const type = ascii(bytes, cursor + 4, 4);
    if (length === null || !type || length > bytes.byteLength - cursor - 12) {
      addIssue(state, "A PNG chunk has invalid or truncated bounds.");
      break;
    }
    const dataStart = cursor + 8;
    const dataEnd = dataStart + length;
    chunks += 1;

    if (chunks === 1 && type !== "IHDR") {
      addIssue(state, "The PNG does not begin with an IHDR chunk.");
    }
    if (type === "IHDR") sawIhdr = true;
    if (type === "caBX") {
      caBxChunks += 1;
      appendRecognizedStore(
        stores,
        bytes.subarray(dataStart, dataEnd),
        "PNG caBX",
        state,
      );
    }
    cursor = dataEnd + 4;
    if (type === "IEND") {
      sawIend = true;
      if (cursor < bytes.byteLength) {
        addIssue(state, "Bytes follow the PNG IEND chunk.");
      }
      break;
    }
  }

  if (!sawIhdr) addIssue(state, "No PNG IHDR chunk was observed.");
  if (!sawIend) addIssue(state, "No complete PNG IEND chunk was observed.");

  return {
    format: "PNG",
    expectedGroup: "png",
    stores,
    container: {
      chunks,
      caBxChunks,
      sawIhdr,
      sawIend,
      crcValidated: false,
      oversizedCandidates: state.oversizedCandidates,
      issueCount: state.issueCount,
    },
    containerIssues: state.issues,
    containerIssueCount: state.issueCount,
  };
}

function readNullTerminatedAscii(bytes, start, end, maximumBytes) {
  const limit = Math.min(end, start + maximumBytes + 1);
  for (let index = start; index < limit; index += 1) {
    if (bytes[index] === 0) {
      return {
        ok: true,
        value: ascii(bytes, start, index - start),
        next: index + 1,
      };
    }
  }
  return { ok: false };
}

function startsWithJumbBox(bytes, start, end) {
  if (start < 0 || end > bytes.byteLength || start > end - 8) return false;
  return ascii(bytes, start + 4, 4) === "jumb";
}

function inspectBmff(bytes) {
  const state = makeContainerState();
  const stores = [];
  let boxes = 0;
  let ftypBoxes = 0;
  let c2paUuidBoxes = 0;
  let manifestPurposeBoxes = 0;
  let originalPurposeBoxes = 0;
  let updatePurposeBoxes = 0;
  let merklePurposeBoxes = 0;
  let firstFtypEnd = -1;
  let firstMediaOrMovieOffset = Number.POSITIVE_INFINITY;
  let cursor = 0;

  while (cursor < bytes.byteLength) {
    if (boxes >= C2PA_STRUCTURE_LIMITS.boxes) {
      addIssue(
        state,
        "The BMFF top-level box count exceeds the inspection limit.",
      );
      break;
    }
    const box = readBoxHeader(bytes, cursor, bytes.byteLength);
    if (!box.ok) {
      addIssue(state, "A BMFF top-level box has invalid or truncated bounds.");
      break;
    }
    boxes += 1;
    if (box.type === "ftyp") {
      ftypBoxes += 1;
      if (firstFtypEnd < 0) firstFtypEnd = box.end;
    }
    if (box.type === "mdat" || box.type === "moov") {
      firstMediaOrMovieOffset = Math.min(firstMediaOrMovieOffset, box.start);
    }

    if (
      box.type === "uuid" &&
      box.end - box.contentStart >= 21 &&
      hex(bytes, box.contentStart, 16) === C2PA_BMFF_UUID
    ) {
      c2paUuidBoxes += 1;
      const fullBoxOffset = box.contentStart + 16;
      if (
        bytes[fullBoxOffset] !== 0 ||
        bytes[fullBoxOffset + 1] !== 0 ||
        bytes[fullBoxOffset + 2] !== 0 ||
        bytes[fullBoxOffset + 3] !== 0
      ) {
        addIssue(state, "A C2PA BMFF uuid box has non-zero version or flags.");
      }
      const purpose = readNullTerminatedAscii(
        bytes,
        fullBoxOffset + 4,
        box.end,
        C2PA_STRUCTURE_LIMITS.purposeBytes,
      );
      if (!purpose.ok || !purpose.value) {
        addIssue(
          state,
          "A C2PA BMFF uuid box has no bounded readable purpose.",
        );
      } else {
        const dataStart = purpose.next;
        if (purpose.value === "manifest") manifestPurposeBoxes += 1;
        if (purpose.value === "original") originalPurposeBoxes += 1;
        if (purpose.value === "update") updatePurposeBoxes += 1;
        if (purpose.value === "merkle") merklePurposeBoxes += 1;

        if (purpose.value === "manifest" || purpose.value === "original") {
          if (
            firstFtypEnd < 0 ||
            box.start < firstFtypEnd ||
            box.start > firstMediaOrMovieOffset
          ) {
            addIssue(
              state,
              "A manifest/original C2PA BMFF box is outside the expected top-level order.",
            );
          }
          if (
            dataStart <= box.end - 8 &&
            startsWithJumbBox(bytes, dataStart + 8, box.end)
          ) {
            appendRecognizedStore(
              stores,
              bytes.subarray(dataStart + 8, box.end),
              "BMFF C2PA uuid",
              state,
            );
          } else {
            addIssue(
              state,
              "A manifest/original C2PA BMFF box has no readable bounded JUMBF store at the expected offset.",
            );
          }
        } else if (purpose.value === "update") {
          if (box.end !== bytes.byteLength) {
            addIssue(
              state,
              "A C2PA update uuid box is not the final top-level BMFF box.",
            );
          }
          const directStart = dataStart;
          const offsetStart = dataStart + 8;
          if (startsWithJumbBox(bytes, directStart, box.end)) {
            appendRecognizedStore(
              stores,
              bytes.subarray(directStart, box.end),
              "BMFF C2PA update uuid",
              state,
            );
          } else if (
            dataStart <= box.end - 8 &&
            startsWithJumbBox(bytes, offsetStart, box.end)
          ) {
            appendRecognizedStore(
              stores,
              bytes.subarray(offsetStart, box.end),
              "BMFF C2PA update uuid",
              state,
            );
          } else {
            addIssue(
              state,
              "A C2PA update uuid box has no readable bounded JUMBF store.",
            );
          }
        }
      }
    }

    cursor = box.end;
    if (box.extendsToEnd) break;
  }

  if (ftypBoxes === 0)
    addIssue(state, "No top-level BMFF ftyp box was observed.");

  return {
    format: "BMFF",
    expectedGroup: "bmff",
    stores,
    container: {
      boxes,
      ftypBoxes,
      c2paUuidBoxes,
      manifestPurposeBoxes,
      originalPurposeBoxes,
      updatePurposeBoxes,
      merklePurposeBoxes,
      oversizedCandidates: state.oversizedCandidates,
      issueCount: state.issueCount,
    },
    containerIssues: state.issues,
    containerIssueCount: state.issueCount,
  };
}

function inspectStandaloneJumbf(bytes) {
  const state = makeContainerState();
  const stores = [];
  appendRecognizedStore(stores, bytes, "Standalone JUMBF", state);
  if (!stores.length && state.oversizedCandidates === 0) {
    addIssue(
      state,
      "The standalone file is not a readable C2PA Manifest Store superbox.",
    );
  }
  return {
    format: "Standalone JUMBF",
    expectedGroup: "jumbf",
    stores,
    container: {
      candidateFiles: 1,
      oversizedCandidates: state.oversizedCandidates,
      issueCount: state.issueCount,
    },
    containerIssues: state.issues,
    containerIssueCount: state.issueCount,
  };
}

function sniffFormat(bytes) {
  if (
    bytes.byteLength >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "jpeg";
  }
  if (bytesEqual(bytes, 0, PNG_SIGNATURE)) return "png";
  if (bytes.byteLength >= 8 && ascii(bytes, 4, 4) === "jumb") {
    return "jumbf";
  }

  let cursor = 0;
  let boxes = 0;
  while (cursor < bytes.byteLength && boxes < 8 && cursor < 1024 * 1024) {
    const box = readBoxHeader(bytes, cursor, bytes.byteLength);
    if (!box.ok) break;
    if (box.type === "ftyp") return "bmff";
    cursor = box.end;
    boxes += 1;
    if (box.extendsToEnd) break;
  }
  return "unknown";
}

function sumStores(stores, key) {
  return stores.reduce((total, store) => total + Number(store[key] || 0), 0);
}

export function inspectC2paStructureBytes(bytesInput, options = {}) {
  const bytes =
    bytesInput instanceof Uint8Array
      ? bytesInput
      : new Uint8Array(bytesInput || 0);
  const declaredSize =
    options.fileSize === undefined
      ? bytes.byteLength
      : finiteInteger(options.fileSize);
  if (
    bytes.byteLength <= 0 ||
    declaredSize !== bytes.byteLength ||
    bytes.byteLength > C2PA_STRUCTURE_LIMITS.fileBytes
  ) {
    return {
      ok: false,
      error:
        "The local bytes are empty, oversized, or do not match the declared file size.",
    };
  }

  const expectedGroup = String(options.expectedGroup || "");
  const detectedGroup = sniffFormat(bytes);
  if (detectedGroup === "unknown") {
    return {
      ok: false,
      error:
        "The file signature is not a supported JPEG, PNG, BMFF, or standalone JUMBF structure.",
    };
  }
  if (expectedGroup && expectedGroup !== detectedGroup) {
    return {
      ok: false,
      error:
        "The selected extension or media type does not match the file signature.",
    };
  }

  const inspected =
    detectedGroup === "jpeg"
      ? inspectJpeg(bytes)
      : detectedGroup === "png"
        ? inspectPng(bytes)
        : detectedGroup === "bmff"
          ? inspectBmff(bytes)
          : inspectStandaloneJumbf(bytes);

  const storeIssueCount = sumStores(inspected.stores, "issueCount");
  const manifestBoxes =
    sumStores(inspected.stores, "standardManifests") +
    sumStores(inspected.stores, "legacyStandardManifests") +
    sumStores(inspected.stores, "updateManifests");
  const summary = {
    manifestStoreCandidates: inspected.stores.length,
    structurallyReadableStores: inspected.stores.filter(
      (store) => store.structurallyReadable,
    ).length,
    expectedComponentSets: inspected.stores.filter(
      (store) => store.expectedComponentsObserved,
    ).length,
    manifestBoxes,
    assertionStores: sumStores(inspected.stores, "assertionStores"),
    claimBoxes: sumStores(inspected.stores, "claimBoxes"),
    signatureBoxes: sumStores(inspected.stores, "signatureBoxes"),
    compressedContentBoxes: sumStores(
      inspected.stores,
      "compressedContentBoxes",
    ),
    structuralIssues: inspected.containerIssueCount + storeIssueCount,
  };

  return {
    ok: true,
    format: inspected.format,
    byteLength: bytes.byteLength,
    container: inspected.container,
    containerIssues: inspected.containerIssues,
    stores: inspected.stores,
    summary,
    verification: {
      cryptographicSignatureVerified: false,
      assetBindingVerified: false,
      trustListEvaluated: false,
      signerIdentityEstablished: false,
      editHistoryAuthenticated: false,
      aiUseDetermined: false,
    },
    limitations: C2PA_STRUCTURE_LIMITATIONS,
  };
}

export function buildC2paStructureReport(result) {
  if (!result?.ok) return null;
  return {
    schema: "altftool.c2pa-structure-counts.v1",
    scope: {
      filenameIncluded: false,
      mediaBytesIncluded: false,
      rawManifestIncluded: false,
      claimOrAssertionValuesIncluded: false,
      arbitraryLabelsIncluded: false,
      cryptographicVerificationPerformed: false,
      assetBindingVerificationPerformed: false,
      trustListEvaluationPerformed: false,
    },
    inputCounts: {
      fileBytes: result.byteLength,
      containerFormat: result.format,
    },
    summaryCounts: { ...result.summary },
    containerCounts: { ...result.container },
    storeCounts: result.stores.map((store) => ({
      storeBytes: store.byteLength,
      boxesInspected: store.boxesInspected,
      maximumDepth: store.maximumDepth,
      issueCount: store.issueCount,
      standardManifests: store.standardManifests,
      legacyStandardManifests: store.legacyStandardManifests,
      updateManifests: store.updateManifests,
      assertionStores: store.assertionStores,
      claimBoxes: store.claimBoxes,
      signatureBoxes: store.signatureBoxes,
      cborContentBoxes: store.cborContentBoxes,
      compressedContentBoxes: store.compressedContentBoxes,
    })),
  };
}
