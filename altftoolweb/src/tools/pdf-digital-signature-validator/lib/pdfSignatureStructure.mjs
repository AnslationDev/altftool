export const PDF_SIGNATURE_LIMITS = Object.freeze({
  fileBytes: 20 * 1024 * 1024,
  tokens: 450_000,
  signatures: 12,
  dictionarySpanBytes: 2 * 1024 * 1024,
  byteRangeValues: 32,
  contentsHexDigits: 256 * 1024,
  totalHashBytes: 64 * 1024 * 1024,
});

export const PDF_SIGNATURE_LIMITATIONS = Object.freeze([
  "This is a bounded lexical structure check, not a complete PDF, cross-reference, ASN.1, CMS, or PKI validator.",
  "A range-consistent result does not verify the CMS signature, signer identity, certificate chain, revocation status, timestamp authority, document meaning, or absence of tampering.",
  "Recognizable stream bodies are skipped, but malformed streams, encrypted files, object streams, unusual encodings, and deliberately ambiguous PDF syntax can cause missed or misleading markers.",
  "A SHA-256 signed-range digest fingerprints the exact bytes selected by ByteRange only; it is not the digest authenticated inside Contents.",
]);

const DELIMITER = new Set([
  0x28, 0x29, 0x3c, 0x3e, 0x5b, 0x5d, 0x7b, 0x7d, 0x2f, 0x25,
]);

function isWhitespaceCode(code) {
  return (
    code === 0 ||
    code === 0x09 ||
    code === 0x0a ||
    code === 0x0c ||
    code === 0x0d ||
    code === 0x20
  );
}

function isDelimiterOrWhitespace(code) {
  return (
    !Number.isFinite(code) || isWhitespaceCode(code) || DELIMITER.has(code)
  );
}

function extensionOf(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  const dot = normalized.lastIndexOf(".");
  return dot >= 0 ? normalized.slice(dot + 1) : "";
}

function finiteNumber(value, fallback = -1) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function validatePdfSignatureFile({ name, size } = {}) {
  if (extensionOf(name) !== "pdf") {
    return { ok: false, error: "Choose a PDF file." };
  }
  const bytes = finiteNumber(size);
  if (!Number.isSafeInteger(bytes) || bytes <= 0) {
    return {
      ok: false,
      error: "The selected PDF is empty or has an invalid size.",
    };
  }
  if (bytes > PDF_SIGNATURE_LIMITS.fileBytes) {
    return { ok: false, error: "Choose a PDF no larger than 20 MB." };
  }
  return { ok: true, bytes };
}

function decodePdfBytes(bytes) {
  return new TextDecoder("latin1").decode(bytes);
}

function token(type, start, end, owner, arrayDepth, value = "") {
  return { type, start, end, owner, arrayDepth, value };
}

function decodePdfName(value) {
  return String(value || "").replace(/#([a-f\d]{2})/giu, (_, hexadecimal) =>
    String.fromCharCode(Number.parseInt(hexadecimal, 16)),
  );
}

function lexPdf(source) {
  const tokens = [];
  const dictionaries = [];
  const dictionaryStack = [];
  let arrayDepth = 0;
  let index = 0;
  let skippedStreams = 0;
  let unterminatedStream = false;

  function add(type, start, end, value = "") {
    if (tokens.length >= PDF_SIGNATURE_LIMITS.tokens) return false;
    tokens.push(
      token(
        type,
        start,
        end,
        dictionaryStack.at(-1) ?? null,
        arrayDepth,
        value,
      ),
    );
    return true;
  }

  while (index < source.length && tokens.length < PDF_SIGNATURE_LIMITS.tokens) {
    const code = source.charCodeAt(index);
    if (isWhitespaceCode(code)) {
      index += 1;
      continue;
    }

    if (code === 0x25) {
      index += 1;
      while (
        index < source.length &&
        source.charCodeAt(index) !== 0x0a &&
        source.charCodeAt(index) !== 0x0d
      ) {
        index += 1;
      }
      continue;
    }

    if (code === 0x28) {
      const start = index;
      let depth = 1;
      index += 1;
      while (index < source.length && depth > 0) {
        const current = source.charCodeAt(index);
        if (current === 0x5c) {
          index += Math.min(2, source.length - index);
          continue;
        }
        if (current === 0x28) depth += 1;
        if (current === 0x29) depth -= 1;
        index += 1;
      }
      add("literal-string", start, index, depth === 0 ? "closed" : "open");
      continue;
    }

    if (code === 0x3c && source.charCodeAt(index + 1) === 0x3c) {
      const start = index;
      const owner = dictionaryStack.at(-1) ?? null;
      const tokenIndex = tokens.length;
      if (!add("dict-start", start, index + 2)) break;
      tokens[tokenIndex].owner = owner;
      dictionaryStack.push(tokenIndex);
      dictionaries.push(tokenIndex);
      index += 2;
      continue;
    }

    if (code === 0x3e && source.charCodeAt(index + 1) === 0x3e) {
      const start = index;
      const currentDictionary = dictionaryStack.at(-1) ?? null;
      if (!add("dict-end", start, index + 2)) break;
      if (currentDictionary !== null) {
        tokens[currentDictionary].match = tokens.length - 1;
        dictionaryStack.pop();
      }
      index += 2;
      continue;
    }

    if (code === 0x3c) {
      const start = index;
      index += 1;
      while (index < source.length && source.charCodeAt(index) !== 0x3e) {
        index += 1;
      }
      const closed = index < source.length;
      if (closed) index += 1;
      add("hex-string", start, index, closed ? "closed" : "open");
      continue;
    }

    if (code === 0x5b) {
      add("array-start", index, index + 1);
      arrayDepth += 1;
      index += 1;
      continue;
    }

    if (code === 0x5d) {
      arrayDepth = Math.max(0, arrayDepth - 1);
      add("array-end", index, index + 1);
      index += 1;
      continue;
    }

    if (code === 0x2f) {
      const start = index;
      index += 1;
      const valueStart = index;
      while (
        index < source.length &&
        !isDelimiterOrWhitespace(source.charCodeAt(index))
      ) {
        index += 1;
      }
      add("name", start, index, decodePdfName(source.slice(valueStart, index)));
      continue;
    }

    const start = index;
    while (
      index < source.length &&
      !isDelimiterOrWhitespace(source.charCodeAt(index))
    ) {
      index += 1;
    }
    if (index === start) {
      add("delimiter", index, index + 1, source[index]);
      index += 1;
      continue;
    }

    const value = source.slice(start, index);
    const numberType = /^[+-]?(?:\d+\.\d*|\.\d+|\d+)$/u.test(value);
    if (!add(numberType ? "number" : "keyword", start, index, value)) break;

    if (
      value === "stream" &&
      tokens.length >= 2 &&
      tokens[tokens.length - 2].type === "dict-end"
    ) {
      let dataStart = index;
      while (
        dataStart < source.length &&
        (source.charCodeAt(dataStart) === 0x20 ||
          source.charCodeAt(dataStart) === 0x09 ||
          source.charCodeAt(dataStart) === 0x0c)
      ) {
        dataStart += 1;
      }
      if (source.charCodeAt(dataStart) === 0x0d) {
        dataStart += source.charCodeAt(dataStart + 1) === 0x0a ? 2 : 1;
      } else if (source.charCodeAt(dataStart) === 0x0a) {
        dataStart += 1;
      } else {
        continue;
      }
      const endStream = source.indexOf("endstream", dataStart);
      if (endStream < 0) {
        unterminatedStream = true;
        break;
      }
      skippedStreams += 1;
      index = endStream + "endstream".length;
    }
  }

  return {
    tokens,
    dictionaries,
    skippedStreams,
    unterminatedStream,
    unclosedDictionaries: dictionaryStack.length,
    truncated: tokens.length >= PDF_SIGNATURE_LIMITS.tokens,
  };
}

function directEntryMap(tokens, dictionaryIndex) {
  const dictionary = tokens[dictionaryIndex];
  const endIndex = dictionary?.match;
  const entries = new Map();
  if (!Number.isSafeInteger(endIndex)) return entries;

  function skipValue(valueIndex) {
    const value = tokens[valueIndex];
    if (!value) return valueIndex + 1;
    if (value.type === "dict-start" && Number.isSafeInteger(value.match)) {
      return value.match + 1;
    }
    if (value.type === "array-start") {
      let depth = 1;
      let index = valueIndex + 1;
      while (index < endIndex && depth > 0) {
        if (tokens[index].type === "array-start") depth += 1;
        if (tokens[index].type === "array-end") depth -= 1;
        index += 1;
      }
      return index;
    }
    if (
      value.type === "number" &&
      tokens[valueIndex + 1]?.type === "number" &&
      tokens[valueIndex + 2]?.type === "keyword" &&
      tokens[valueIndex + 2]?.value === "R"
    ) {
      return valueIndex + 3;
    }
    return valueIndex + 1;
  }

  let index = dictionaryIndex + 1;
  while (index < endIndex) {
    const current = tokens[index];
    if (
      current.type !== "name" ||
      current.owner !== dictionaryIndex ||
      current.arrayDepth !== dictionary.arrayDepth
    ) {
      index += 1;
      continue;
    }
    const values = entries.get(current.value) || [];
    values.push(index);
    entries.set(current.value, values);
    index = skipValue(index + 1);
  }
  return entries;
}

function immediateValue(tokens, keyIndex) {
  return tokens[keyIndex + 1] || null;
}

function dictionaryIsCandidate(tokens, dictionaryIndex, entries) {
  const typeKeys = entries.get("Type") || [];
  const hasSignatureType = typeKeys.some((keyIndex) => {
    const value = immediateValue(tokens, keyIndex);
    return value?.type === "name" && value.value === "Sig";
  });
  return (
    hasSignatureType || (entries.has("ByteRange") && entries.has("Contents"))
  );
}

function parseByteRange(tokens, keyIndices, fileLength) {
  const errors = [];
  if (!keyIndices?.length) {
    return {
      ok: false,
      errors: ["ByteRange is missing."],
      values: [],
      ranges: [],
      gaps: [],
      revisionEnd: 0,
      signedBytes: 0,
    };
  }
  if (keyIndices.length !== 1) {
    return {
      ok: false,
      errors: ["ByteRange is duplicated in the signature dictionary."],
      values: [],
      ranges: [],
      gaps: [],
      revisionEnd: 0,
      signedBytes: 0,
    };
  }

  const arrayStartIndex = keyIndices[0] + 1;
  if (tokens[arrayStartIndex]?.type !== "array-start") {
    return {
      ok: false,
      errors: ["ByteRange must be a direct array."],
      values: [],
      ranges: [],
      gaps: [],
      revisionEnd: 0,
      signedBytes: 0,
    };
  }

  const values = [];
  let depth = 1;
  let index = arrayStartIndex + 1;
  let closed = false;
  for (; index < tokens.length; index += 1) {
    const current = tokens[index];
    if (current.type === "array-start") {
      depth += 1;
      errors.push("ByteRange must not contain nested arrays.");
      continue;
    }
    if (current.type === "array-end") {
      depth -= 1;
      if (depth === 0) {
        closed = true;
        break;
      }
      continue;
    }
    if (depth !== 1) continue;
    if (current.type !== "number") {
      errors.push("ByteRange must contain only integers.");
      continue;
    }
    if (!/^[+]?\d+$/u.test(current.value)) {
      errors.push("ByteRange values must be non-negative integers.");
      continue;
    }
    const value = Number(current.value);
    if (!Number.isSafeInteger(value)) {
      errors.push(
        "ByteRange contains an integer outside the safe supported range.",
      );
      continue;
    }
    values.push(value);
  }

  if (!closed) errors.push("ByteRange array is not closed.");
  if (
    values.length < 4 ||
    values.length % 2 !== 0 ||
    values.length > PDF_SIGNATURE_LIMITS.byteRangeValues
  ) {
    errors.push(
      `ByteRange must contain 4–${PDF_SIGNATURE_LIMITS.byteRangeValues} integers in offset-length pairs.`,
    );
  }

  const ranges = [];
  if (!errors.length) {
    for (let valueIndex = 0; valueIndex < values.length; valueIndex += 2) {
      const offset = values[valueIndex];
      const length = values[valueIndex + 1];
      const end = offset + length;
      if (length <= 0) {
        errors.push("Every ByteRange length must be greater than zero.");
      }
      if (!Number.isSafeInteger(end) || end > fileLength) {
        errors.push("A ByteRange pair extends beyond the PDF bytes.");
      }
      ranges.push({ offset, length, end });
    }
  }

  if (ranges.length) {
    if (ranges[0].offset !== 0) {
      errors.push("The first ByteRange offset must be zero.");
    }
    for (let rangeIndex = 1; rangeIndex < ranges.length; rangeIndex += 1) {
      if (ranges[rangeIndex].offset <= ranges[rangeIndex - 1].end) {
        errors.push(
          "ByteRange pairs must be ordered, non-overlapping, and separated.",
        );
      }
    }
  }

  const gaps = [];
  for (let rangeIndex = 1; rangeIndex < ranges.length; rangeIndex += 1) {
    gaps.push({
      start: ranges[rangeIndex - 1].end,
      end: ranges[rangeIndex].offset,
      bytes: ranges[rangeIndex].offset - ranges[rangeIndex - 1].end,
    });
  }
  return {
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    values,
    ranges,
    gaps,
    revisionEnd: ranges.at(-1)?.end ?? 0,
    signedBytes: ranges.reduce((total, range) => total + range.length, 0),
  };
}

function parseContents(source, tokens, keyIndices) {
  if (!keyIndices?.length) {
    return { ok: false, errors: ["Contents is missing."], bytes: 0 };
  }
  if (keyIndices.length !== 1) {
    return {
      ok: false,
      errors: ["Contents is duplicated in the signature dictionary."],
      bytes: 0,
    };
  }
  const value = immediateValue(tokens, keyIndices[0]);
  if (value?.type !== "hex-string") {
    return {
      ok: false,
      errors: ["Contents must be a direct hexadecimal string."],
      bytes: 0,
    };
  }
  const errors = [];
  if (value.value !== "closed")
    errors.push("Contents hexadecimal string is not closed.");

  let digits = 0;
  let invalidCharacters = 0;
  const contentEnd = value.value === "closed" ? value.end - 1 : value.end;
  for (let index = value.start + 1; index < contentEnd; index += 1) {
    const code = source.charCodeAt(index);
    if (isWhitespaceCode(code)) continue;
    if (
      (code >= 0x30 && code <= 0x39) ||
      (code >= 0x41 && code <= 0x46) ||
      (code >= 0x61 && code <= 0x66)
    ) {
      digits += 1;
    } else {
      invalidCharacters += 1;
    }
  }
  if (invalidCharacters) {
    errors.push("Contents contains non-hexadecimal characters.");
  }
  if (!digits) errors.push("Contents is empty.");
  if (digits % 2 !== 0) {
    errors.push("Contents contains an odd number of hexadecimal digits.");
  }
  if (digits > PDF_SIGNATURE_LIMITS.contentsHexDigits) {
    errors.push(
      `Contents exceeds the ${PDF_SIGNATURE_LIMITS.contentsHexDigits.toLocaleString("en-US")}-digit inspection limit.`,
    );
  }
  return {
    ok: errors.length === 0,
    errors,
    bytes: Math.floor(digits / 2),
    digits,
    start: value.start,
    end: value.end,
  };
}

function hasPdfRevisionBoundary(source, end) {
  if (!Number.isSafeInteger(end) || end <= 0 || end > source.length)
    return false;
  const start = Math.max(0, end - 4096);
  const tail = source.slice(start, end);
  const eofIndex = tail.lastIndexOf("%%EOF");
  if (eofIndex < 0) return false;
  return /^[\u0000\t\n\f\r ]*$/u.test(tail.slice(eofIndex + 5));
}

function metadataPresence(entries) {
  return {
    subFilter: (entries.get("SubFilter") || []).length > 0,
    name: (entries.get("Name") || []).length > 0,
    reason: (entries.get("Reason") || []).length > 0,
    location: (entries.get("Location") || []).length > 0,
    signingDate: (entries.get("M") || []).length > 0,
  };
}

function analyzeDictionary(
  source,
  tokens,
  dictionaryIndex,
  fileLength,
  ordinal,
) {
  const dictionary = tokens[dictionaryIndex];
  const entries = directEntryMap(tokens, dictionaryIndex);
  const issues = [];
  const warnings = [];
  const span = Number.isSafeInteger(dictionary.match)
    ? tokens[dictionary.match]?.end - dictionary.start
    : null;
  if (
    !Number.isSafeInteger(span) ||
    span > PDF_SIGNATURE_LIMITS.dictionarySpanBytes
  ) {
    issues.push(
      "The signature dictionary is unclosed or exceeds the inspection span.",
    );
  }

  const byteRange = parseByteRange(
    tokens,
    entries.get("ByteRange"),
    fileLength,
  );
  const contents = parseContents(source, tokens, entries.get("Contents"));
  issues.push(...byteRange.errors, ...contents.errors);

  const typeValues = entries.get("Type") || [];
  const signatureTypeCount = typeValues.filter((keyIndex) => {
    const value = immediateValue(tokens, keyIndex);
    return value?.type === "name" && value.value === "Sig";
  }).length;
  if (signatureTypeCount > 1) {
    issues.push("Type is duplicated as Sig in the signature dictionary.");
  } else if (signatureTypeCount === 0) {
    warnings.push("Type /Sig was not observed in this ByteRange dictionary.");
  }

  if (byteRange.ok) {
    if (byteRange.gaps.length !== 1) {
      issues.push(
        "ByteRange must leave exactly one gap for the Contents value.",
      );
    } else if (
      contents.start !== byteRange.gaps[0].start ||
      contents.end !== byteRange.gaps[0].end
    ) {
      issues.push(
        "The ByteRange gap does not exactly match the Contents string and delimiters.",
      );
    }
    if (!hasPdfRevisionBoundary(source, byteRange.revisionEnd)) {
      warnings.push(
        "The covered bytes do not end at a recognizable %%EOF revision boundary.",
      );
    }
  }

  const revisionEnd = byteRange.revisionEnd || 0;
  const trailingBytes =
    revisionEnd > 0 && revisionEnd <= fileLength
      ? fileLength - revisionEnd
      : null;
  const uniqueIssues = [...new Set(issues)];
  const uniqueWarnings = [...new Set(warnings)];
  return {
    ordinal,
    dictionaryOffset: dictionary.start,
    structureStatus: uniqueIssues.length
      ? "invalid"
      : uniqueWarnings.length
        ? "review"
        : "consistent",
    issues: uniqueIssues,
    warnings: uniqueWarnings,
    byteRange: {
      pairCount: byteRange.ranges.length,
      ranges: byteRange.ranges,
      signedBytes: byteRange.signedBytes || 0,
      revisionEnd,
      reachesCurrentFileEnd: revisionEnd === fileLength,
      trailingBytes,
      exactContentsGap:
        byteRange.gaps.length === 1 &&
        contents.start === byteRange.gaps[0].start &&
        contents.end === byteRange.gaps[0].end,
      endsAtRecognizableRevision: hasPdfRevisionBoundary(source, revisionEnd),
    },
    contentsBytes: contents.bytes || 0,
    metadataPresence: metadataPresence(entries),
    signedRangeSha256: null,
    verification: {
      cmsSignatureVerified: false,
      certificateIdentityVerified: false,
      certificateTrustVerified: false,
      revocationVerified: false,
      timestampAuthorityVerified: false,
      tamperFreeStatusEstablished: false,
    },
    _hashRanges: byteRange.ok ? byteRange.ranges : [],
  };
}

function toHex(bytes) {
  return [...new Uint8Array(bytes)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256SignedRanges(
  bytes,
  ranges,
  cryptoProvider = globalThis.crypto,
) {
  if (!cryptoProvider?.subtle?.digest) {
    throw new Error("Web Crypto SHA-256 is unavailable.");
  }
  const total = ranges.reduce((sum, range) => sum + range.length, 0);
  if (total <= 0 || total > PDF_SIGNATURE_LIMITS.fileBytes) {
    throw new Error("The signed byte total is outside the supported limit.");
  }
  const selected = new Uint8Array(total);
  let outputOffset = 0;
  for (const range of ranges) {
    if (
      !Number.isSafeInteger(range.offset) ||
      !Number.isSafeInteger(range.length) ||
      range.offset < 0 ||
      range.length <= 0 ||
      range.offset + range.length > bytes.byteLength
    ) {
      throw new Error("A signed byte range is invalid.");
    }
    selected.set(
      bytes.subarray(range.offset, range.offset + range.length),
      outputOffset,
    );
    outputOffset += range.length;
  }
  return toHex(await cryptoProvider.subtle.digest("SHA-256", selected));
}

function summarize(signatures) {
  const metadataPresenceCounts = {
    subFilter: 0,
    name: 0,
    reason: 0,
    location: 0,
    signingDate: 0,
  };
  for (const signature of signatures) {
    for (const key of Object.keys(metadataPresenceCounts)) {
      if (signature.metadataPresence[key]) metadataPresenceCounts[key] += 1;
    }
  }
  return {
    signatureDictionaries: signatures.length,
    structurallyConsistent: signatures.filter(
      ({ structureStatus }) => structureStatus === "consistent",
    ).length,
    needsReview: signatures.filter(
      ({ structureStatus }) => structureStatus === "review",
    ).length,
    structurallyInvalid: signatures.filter(
      ({ structureStatus }) => structureStatus === "invalid",
    ).length,
    fullFileCoverage: signatures.filter(
      ({ byteRange }) => byteRange.reachesCurrentFileEnd,
    ).length,
    priorRevisionCoverage: signatures.filter(
      ({ byteRange }) => Number(byteRange.trailingBytes) > 0,
    ).length,
    signedRangeDigestsComputed: signatures.filter(({ signedRangeSha256 }) =>
      Boolean(signedRangeSha256),
    ).length,
    contentsBytesObserved: signatures.reduce(
      (sum, signature) => sum + signature.contentsBytes,
      0,
    ),
    metadataPresenceCounts,
  };
}

export async function inspectPdfSignatureBytes(
  input,
  { fileSize, cryptoProvider = globalThis.crypto } = {},
) {
  const bytes =
    input instanceof Uint8Array
      ? input
      : input instanceof ArrayBuffer
        ? new Uint8Array(input)
        : null;
  if (!bytes) {
    return { ok: false, error: "PDF bytes are required." };
  }
  if (!bytes.byteLength || bytes.byteLength > PDF_SIGNATURE_LIMITS.fileBytes) {
    return {
      ok: false,
      error: "The PDF byte length is outside the supported limit.",
    };
  }
  if (
    fileSize !== undefined &&
    (!Number.isSafeInteger(fileSize) || fileSize !== bytes.byteLength)
  ) {
    return {
      ok: false,
      error:
        "The declared file size and the locally read byte length do not match.",
    };
  }

  const source = decodePdfBytes(bytes);
  const headerOffset = source.slice(0, 1024).indexOf("%PDF-");
  if (headerOffset < 0) {
    return {
      ok: false,
      error: "A PDF header was not found in the first 1,024 bytes.",
    };
  }

  const lexical = lexPdf(source);
  const potentialDictionaries = new Map();
  for (const current of lexical.tokens) {
    if (
      current.type === "name" &&
      current.owner !== null &&
      (current.value === "Type" ||
        current.value === "ByteRange" ||
        current.value === "Contents")
    ) {
      const markers = potentialDictionaries.get(current.owner) || new Set();
      markers.add(current.value);
      potentialDictionaries.set(current.owner, markers);
    }
  }
  const candidates = [];
  for (const [dictionaryIndex, markers] of potentialDictionaries) {
    const entries = directEntryMap(lexical.tokens, dictionaryIndex);
    if (
      dictionaryIsCandidate(lexical.tokens, dictionaryIndex, entries) ||
      (markers.has("ByteRange") && markers.has("Contents"))
    ) {
      candidates.push(dictionaryIndex);
      if (candidates.length > PDF_SIGNATURE_LIMITS.signatures) break;
    }
  }
  const candidateLimitReached =
    candidates.length > PDF_SIGNATURE_LIMITS.signatures;
  const inspectedCandidates = candidates.slice(
    0,
    PDF_SIGNATURE_LIMITS.signatures,
  );
  const signatures = inspectedCandidates.map((dictionaryIndex, index) =>
    analyzeDictionary(
      source,
      lexical.tokens,
      dictionaryIndex,
      bytes.byteLength,
      index + 1,
    ),
  );

  let hashBudgetUsed = 0;
  let hashUnavailable = false;
  for (const signature of signatures) {
    const signedBytes = signature.byteRange.signedBytes;
    if (!signature._hashRanges.length) continue;
    if (
      signedBytes <= 0 ||
      hashBudgetUsed + signedBytes > PDF_SIGNATURE_LIMITS.totalHashBytes
    ) {
      signature.warnings.push(
        "The signed-range digest was skipped because the total hashing budget was reached.",
      );
      if (signature.structureStatus === "consistent") {
        signature.structureStatus = "review";
      }
      continue;
    }
    try {
      signature.signedRangeSha256 = await sha256SignedRanges(
        bytes,
        signature._hashRanges,
        cryptoProvider,
      );
      hashBudgetUsed += signedBytes;
    } catch {
      hashUnavailable = true;
      signature.warnings.push(
        "The signed-range SHA-256 digest could not be computed in this browser.",
      );
      if (signature.structureStatus === "consistent") {
        signature.structureStatus = "review";
      }
    }
  }
  for (const signature of signatures) delete signature._hashRanges;

  const warnings = [];
  if (headerOffset > 0) {
    warnings.push("The PDF header was not located at byte zero.");
  }
  if (lexical.unterminatedStream) {
    warnings.push(
      "An unterminated recognizable stream stopped the bounded lexical scan.",
    );
  }
  if (lexical.unclosedDictionaries) {
    warnings.push(
      `${lexical.unclosedDictionaries.toLocaleString("en-US")} dictionary marker${lexical.unclosedDictionaries === 1 ? "" : "s"} remained unclosed at the scan boundary.`,
    );
  }
  if (lexical.truncated) {
    warnings.push("The token limit stopped the bounded lexical scan.");
  }
  if (candidateLimitReached) {
    warnings.push(
      `Only the first ${PDF_SIGNATURE_LIMITS.signatures} candidate signature dictionaries were inspected.`,
    );
  }
  if (!signatures.length) {
    warnings.push(
      "No inspectable signature dictionary with Type /Sig or direct ByteRange and Contents entries was observed.",
    );
  }
  if (hashUnavailable) {
    warnings.push(
      "Web Crypto hashing was unavailable for at least one signature.",
    );
  }

  return {
    ok: true,
    byteLength: bytes.byteLength,
    headerOffset,
    signatures,
    summary: summarize(signatures),
    scan: {
      complete:
        !lexical.unterminatedStream &&
        lexical.unclosedDictionaries === 0 &&
        !lexical.truncated &&
        !candidateLimitReached,
      skippedRecognizableStreams: lexical.skippedStreams,
      unclosedDictionaryCount: lexical.unclosedDictionaries,
      candidateDictionariesObserved: candidates.length,
      candidateLimitReached,
    },
    warnings,
    limitations: [...PDF_SIGNATURE_LIMITATIONS],
    verification: {
      byteRangeStructureInspected: true,
      cmsSignatureVerified: false,
      signerIdentityVerified: false,
      certificateTrustVerified: false,
      revocationVerified: false,
      timestampAuthorityVerified: false,
      tamperFreeStatusEstablished: false,
    },
  };
}

export function buildSignatureStructureReport(
  result,
  generatedAt = new Date().toISOString(),
) {
  if (!result?.ok) return null;
  return {
    schema: "altftool.pdf-signature-structure-report.v1",
    generatedAt,
    scope: {
      localStructuralInspection: true,
      filenameIncluded: false,
      documentBytesIncluded: false,
      rawContentsIncluded: false,
      metadataValuesIncluded: false,
      cmsSignatureVerified: false,
      signerIdentityVerified: false,
      certificateTrustVerified: false,
      revocationVerified: false,
      timestampAuthorityVerified: false,
      tamperFreeStatusEstablished: false,
    },
    document: {
      byteLength: result.byteLength,
      signatureDictionaryCount: result.summary.signatureDictionaries,
      scanComplete: result.scan.complete,
      skippedRecognizableStreamCount: result.scan.skippedRecognizableStreams,
      unclosedDictionaryCount: result.scan.unclosedDictionaryCount,
    },
    summary: result.summary,
    signatures: result.signatures.map((signature) => ({
      ordinal: signature.ordinal,
      structureStatus: signature.structureStatus,
      issueCount: signature.issues.length,
      warningCount: signature.warnings.length,
      byteRangePairCount: signature.byteRange.pairCount,
      signedBytes: signature.byteRange.signedBytes,
      revisionEnd: signature.byteRange.revisionEnd,
      reachesCurrentFileEnd: signature.byteRange.reachesCurrentFileEnd,
      trailingBytes: signature.byteRange.trailingBytes,
      exactContentsGap: signature.byteRange.exactContentsGap,
      endsAtRecognizableRevision:
        signature.byteRange.endsAtRecognizableRevision,
      contentsBytes: signature.contentsBytes,
      metadataPresence: signature.metadataPresence,
      signedRangeSha256: signature.signedRangeSha256,
    })),
    limitations: result.limitations,
  };
}
