const MAX_TRANSCRIPT_CHARACTERS = 100_000;
const MAX_LINES = 800;
const MAX_WORDS = 2_000;
const MAX_CHANGE_DETAILS = 200;
const MAX_DISPLAY_LINE_CHARACTERS = 500;

const DEFAULT_OPTIONS = Object.freeze({
  collapseWhitespace: true,
  ignoreBlankLines: true,
  ignoreCase: true,
  ignorePunctuation: false,
  trimLineEdges: true,
});

const LIMITATIONS = Object.freeze([
  "OCR recognition errors can appear as additions, removals, or replacements even when the screenshots show the same text.",
  "This text comparison does not detect layout, styling, color, cropping, pixel, icon, or other visual changes.",
  "Text that is hidden, obscured, too small, or omitted by the reviewed transcripts is outside this comparison.",
  "The result does not authenticate either screenshot and is not proof of originality, capture time, or tamper-free content.",
]);

function sliceCharacters(value, maximum) {
  return [...String(value ?? "")].slice(0, maximum).join("");
}

function characterCount(value) {
  return [...String(value ?? "")].length;
}

function normalizeOptions(value = {}) {
  return {
    collapseWhitespace:
      value.collapseWhitespace ?? DEFAULT_OPTIONS.collapseWhitespace,
    ignoreBlankLines: value.ignoreBlankLines ?? DEFAULT_OPTIONS.ignoreBlankLines,
    ignoreCase: value.ignoreCase ?? DEFAULT_OPTIONS.ignoreCase,
    ignorePunctuation:
      value.ignorePunctuation ?? DEFAULT_OPTIONS.ignorePunctuation,
    trimLineEdges: value.trimLineEdges ?? DEFAULT_OPTIONS.trimLineEdges,
  };
}

function normalizeComparable(value, options) {
  let normalized = String(value ?? "").normalize("NFC");
  if (options.trimLineEdges) normalized = normalized.trim();
  if (options.collapseWhitespace) {
    normalized = normalized.replace(/[^\S\r\n]+/gu, " ");
  }
  if (options.ignorePunctuation) {
    normalized = normalized.replace(/\p{P}+/gu, "");
    if (options.collapseWhitespace) {
      normalized = normalized.replace(/[^\S\r\n]+/gu, " ");
    }
  }
  if (options.ignoreCase) normalized = normalized.toLocaleLowerCase("en-US");
  return normalized;
}

function prepareText(value) {
  const normalizedNewlines = String(value ?? "")
    .normalize("NFC")
    .replace(/\r\n?/gu, "\n");
  const originalCharacters = characterCount(normalizedNewlines);
  return {
    text: sliceCharacters(normalizedNewlines, MAX_TRANSCRIPT_CHARACTERS),
    originalCharacters,
    charactersTruncated: originalCharacters > MAX_TRANSCRIPT_CHARACTERS,
  };
}

function displayLine(value) {
  const count = characterCount(value);
  if (count <= MAX_DISPLAY_LINE_CHARACTERS) return value;
  return `${sliceCharacters(value, MAX_DISPLAY_LINE_CHARACTERS)}…`;
}

function prepareLines(prepared, options) {
  const sourceLines = prepared.text.split("\n");
  const normalized = sourceLines
    .map((raw, index) => ({
      key: normalizeComparable(raw, options),
      lineNumber: index + 1,
      text: displayLine(raw),
    }))
    .filter((line) => !options.ignoreBlankLines || line.key.length > 0);
  return {
    items: normalized.slice(0, MAX_LINES),
    originalCount: normalized.length,
    truncated: normalized.length > MAX_LINES,
  };
}

function prepareWords(prepared, options) {
  const normalized = normalizeComparable(prepared.text.replace(/\n/gu, " "), {
    ...options,
    trimLineEdges: true,
  });
  const sourceWords = normalized ? normalized.split(/\s+/u).filter(Boolean) : [];
  return {
    items: sourceWords.slice(0, MAX_WORDS).map((word, index) => ({
      key: word,
      position: index + 1,
      text: word,
    })),
    originalCount: sourceWords.length,
    truncated: sourceWords.length > MAX_WORDS,
  };
}

function diffSequence(before, after) {
  const beforeCount = before.length;
  const afterCount = after.length;
  const table = Array.from(
    { length: beforeCount + 1 },
    () => new Uint16Array(afterCount + 1),
  );

  for (let beforeIndex = 1; beforeIndex <= beforeCount; beforeIndex += 1) {
    for (let afterIndex = 1; afterIndex <= afterCount; afterIndex += 1) {
      table[beforeIndex][afterIndex] =
        before[beforeIndex - 1].key === after[afterIndex - 1].key
          ? table[beforeIndex - 1][afterIndex - 1] + 1
          : Math.max(
              table[beforeIndex - 1][afterIndex],
              table[beforeIndex][afterIndex - 1],
            );
    }
  }

  const reversed = [];
  let beforeIndex = beforeCount;
  let afterIndex = afterCount;
  while (beforeIndex > 0 || afterIndex > 0) {
    if (
      beforeIndex > 0 &&
      afterIndex > 0 &&
      before[beforeIndex - 1].key === after[afterIndex - 1].key
    ) {
      reversed.push({
        kind: "equal",
        before: before[beforeIndex - 1],
        after: after[afterIndex - 1],
      });
      beforeIndex -= 1;
      afterIndex -= 1;
    } else if (
      beforeIndex > 0 &&
      (afterIndex === 0 ||
        table[beforeIndex - 1][afterIndex] >=
          table[beforeIndex][afterIndex - 1])
    ) {
      reversed.push({ kind: "remove", before: before[beforeIndex - 1] });
      beforeIndex -= 1;
    } else {
      reversed.push({ kind: "add", after: after[afterIndex - 1] });
      afterIndex -= 1;
    }
  }
  return reversed.reverse();
}

function summarizeOperations(operations, includeDetails = false) {
  const counts = {
    additions: 0,
    removals: 0,
    replacements: 0,
    unchanged: 0,
  };
  const details = [];
  let changeBlocks = 0;
  let index = 0;

  while (index < operations.length) {
    if (operations[index].kind === "equal") {
      counts.unchanged += 1;
      index += 1;
      continue;
    }

    changeBlocks += 1;
    const removed = [];
    const added = [];
    while (index < operations.length && operations[index].kind !== "equal") {
      const operation = operations[index];
      if (operation.kind === "remove") removed.push(operation.before);
      if (operation.kind === "add") added.push(operation.after);
      index += 1;
    }

    const replacements = Math.min(removed.length, added.length);
    counts.replacements += replacements;
    counts.removals += removed.length - replacements;
    counts.additions += added.length - replacements;

    if (!includeDetails) continue;
    for (let pair = 0; pair < replacements; pair += 1) {
      details.push({
        kind: "replacement",
        before: removed[pair],
        after: added[pair],
      });
    }
    removed.slice(replacements).forEach((before) => {
      details.push({ kind: "removal", before, after: null });
    });
    added.slice(replacements).forEach((after) => {
      details.push({ kind: "addition", before: null, after });
    });
  }

  return {
    counts,
    changeBlocks,
    details: details.slice(0, MAX_CHANGE_DETAILS),
    detailsTruncated: details.length > MAX_CHANGE_DETAILS,
    totalChanges: counts.additions + counts.removals + counts.replacements,
  };
}

function similarityPercent(unchanged, beforeCount, afterCount) {
  const denominator = Math.max(beforeCount, afterCount);
  if (!denominator) return 100;
  return Number(((unchanged / denominator) * 100).toFixed(1));
}

export function compareOcrTranscripts(beforeValue, afterValue, optionValue = {}) {
  const options = normalizeOptions(optionValue);
  const before = prepareText(beforeValue);
  const after = prepareText(afterValue);
  const beforeLines = prepareLines(before, options);
  const afterLines = prepareLines(after, options);
  const beforeWords = prepareWords(before, options);
  const afterWords = prepareWords(after, options);

  const lineSummary = summarizeOperations(
    diffSequence(beforeLines.items, afterLines.items),
    true,
  );
  const wordSummary = summarizeOperations(
    diffSequence(beforeWords.items, afterWords.items),
  );

  return {
    ok: true,
    assessment:
      lineSummary.totalChanges || wordSummary.totalChanges
        ? {
            level: "changed",
            label: "Reviewed transcript changes found",
            description:
              "The normalized transcript comparison contains one or more line or word changes.",
          }
        : {
            level: "same",
            label: "No normalized transcript change found",
            description:
              "The reviewed transcripts match under the selected options. This does not establish that the screenshots are visually identical.",
          },
    options,
    line: {
      ...lineSummary,
      beforeCount: beforeLines.items.length,
      afterCount: afterLines.items.length,
      similarityPercent: similarityPercent(
        lineSummary.counts.unchanged,
        beforeLines.items.length,
        afterLines.items.length,
      ),
    },
    word: {
      ...wordSummary,
      details: undefined,
      beforeCount: beforeWords.items.length,
      afterCount: afterWords.items.length,
      similarityPercent: similarityPercent(
        wordSummary.counts.unchanged,
        beforeWords.items.length,
        afterWords.items.length,
      ),
    },
    bounds: {
      beforeCharacters: before.originalCharacters,
      afterCharacters: after.originalCharacters,
      beforeCharactersTruncated: before.charactersTruncated,
      afterCharactersTruncated: after.charactersTruncated,
      beforeLinesTruncated: beforeLines.truncated,
      afterLinesTruncated: afterLines.truncated,
      beforeWordsTruncated: beforeWords.truncated,
      afterWordsTruncated: afterWords.truncated,
      detailsTruncated: lineSummary.detailsTruncated,
    },
    limitations: [...LIMITATIONS],
  };
}

export function buildCountsOnlyOcrReport(result) {
  if (!result?.ok) return null;
  return {
    comparisonOptions: { ...result.options },
    counts: {
      lines: {
        additions: result.line.counts.additions,
        after: result.line.afterCount,
        before: result.line.beforeCount,
        changeBlocks: result.line.changeBlocks,
        removals: result.line.counts.removals,
        replacements: result.line.counts.replacements,
        unchanged: result.line.counts.unchanged,
      },
      words: {
        additions: result.word.counts.additions,
        after: result.word.afterCount,
        before: result.word.beforeCount,
        changeBlocks: result.word.changeBlocks,
        removals: result.word.counts.removals,
        replacements: result.word.counts.replacements,
        unchanged: result.word.counts.unchanged,
      },
    },
    limitations: [...LIMITATIONS],
    processing: {
      filenamesIncluded: false,
      imagePixelsIncluded: false,
      localOnly: true,
      networkUsed: false,
      persisted: false,
      transcriptContentIncluded: false,
    },
    schema: "altftool.screenshot-ocr-change-counts.v1",
    truncation: { ...result.bounds },
  };
}

export function serializeCountsOnlyOcrReport(result) {
  const report = buildCountsOnlyOcrReport(result);
  return report ? `${JSON.stringify(report, null, 2)}\n` : "";
}

function rasterBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  return null;
}

function readUint16BigEndian(bytes, offset) {
  if (offset < 0 || offset + 2 > bytes.length) return null;
  return bytes[offset] * 256 + bytes[offset + 1];
}

function readUint24LittleEndian(bytes, offset) {
  if (offset < 0 || offset + 3 > bytes.length) return null;
  return bytes[offset] + bytes[offset + 1] * 256 + bytes[offset + 2] * 65_536;
}

function readUint32BigEndian(bytes, offset) {
  if (offset < 0 || offset + 4 > bytes.length) return null;
  return (
    bytes[offset] * 16_777_216 +
    bytes[offset + 1] * 65_536 +
    bytes[offset + 2] * 256 +
    bytes[offset + 3]
  );
}

function readUint32LittleEndian(bytes, offset) {
  if (offset < 0 || offset + 4 > bytes.length) return null;
  return (
    bytes[offset] +
    bytes[offset + 1] * 256 +
    bytes[offset + 2] * 65_536 +
    bytes[offset + 3] * 16_777_216
  );
}

function fourCharacterCode(bytes, offset) {
  if (offset < 0 || offset + 4 > bytes.length) return "";
  return String.fromCharCode(
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3],
  );
}

function rasterDimensions(width, height, mediaType) {
  return width > 0 && height > 0 ? { width, height, mediaType } : null;
}

function parsePngDimensions(bytes) {
  if (bytes.length < 24 || fourCharacterCode(bytes, 12) !== "IHDR") {
    return null;
  }
  return rasterDimensions(
    readUint32BigEndian(bytes, 16),
    readUint32BigEndian(bytes, 20),
    "image/png",
  );
}

const JPEG_START_OF_FRAME_MARKERS = new Set([
  0xc0,
  0xc1,
  0xc2,
  0xc3,
  0xc5,
  0xc6,
  0xc7,
  0xc9,
  0xca,
  0xcb,
  0xcd,
  0xce,
  0xcf,
]);

function parseJpegDimensions(bytes) {
  let offset = 2;
  while (offset + 1 < bytes.length) {
    while (offset < bytes.length && bytes[offset] !== 0xff) offset += 1;
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) return null;
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0x00) continue;
    if (
      marker === 0x01 ||
      marker === 0xd8 ||
      marker === 0xd9 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      continue;
    }
    if (marker === 0xda) return null;
    const segmentLength = readUint16BigEndian(bytes, offset);
    if (segmentLength === null || segmentLength < 2) return null;
    if (JPEG_START_OF_FRAME_MARKERS.has(marker)) {
      if (offset + 7 > bytes.length) return null;
      return rasterDimensions(
        readUint16BigEndian(bytes, offset + 5),
        readUint16BigEndian(bytes, offset + 3),
        "image/jpeg",
      );
    }
    if (offset + segmentLength > bytes.length) return null;
    offset += segmentLength;
  }
  return null;
}

function parseWebpDimensions(bytes) {
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const chunkType = fourCharacterCode(bytes, offset);
    const chunkLength = readUint32LittleEndian(bytes, offset + 4);
    if (chunkLength === null) return null;
    const payloadOffset = offset + 8;
    if (chunkType === "VP8X" && chunkLength >= 10) {
      const widthMinusOne = readUint24LittleEndian(bytes, payloadOffset + 4);
      const heightMinusOne = readUint24LittleEndian(bytes, payloadOffset + 7);
      if (widthMinusOne === null || heightMinusOne === null) return null;
      return rasterDimensions(
        widthMinusOne + 1,
        heightMinusOne + 1,
        "image/webp",
      );
    }
    if (chunkType === "VP8 " && chunkLength >= 10) {
      if (payloadOffset + 10 > bytes.length) return null;
      if (
        bytes[payloadOffset + 3] !== 0x9d ||
        bytes[payloadOffset + 4] !== 0x01 ||
        bytes[payloadOffset + 5] !== 0x2a
      ) {
        return null;
      }
      const rawWidth =
        bytes[payloadOffset + 6] + bytes[payloadOffset + 7] * 256;
      const rawHeight =
        bytes[payloadOffset + 8] + bytes[payloadOffset + 9] * 256;
      return rasterDimensions(
        rawWidth & 0x3fff,
        rawHeight & 0x3fff,
        "image/webp",
      );
    }
    if (chunkType === "VP8L" && chunkLength >= 5) {
      if (
        payloadOffset + 5 > bytes.length ||
        bytes[payloadOffset] !== 0x2f
      ) {
        return null;
      }
      const first = bytes[payloadOffset + 1];
      const second = bytes[payloadOffset + 2];
      const third = bytes[payloadOffset + 3];
      const fourth = bytes[payloadOffset + 4];
      return rasterDimensions(
        1 + first + ((second & 0x3f) << 8),
        1 + (second >> 6) + (third << 2) + ((fourth & 0x0f) << 10),
        "image/webp",
      );
    }
    const paddedLength = chunkLength + (chunkLength % 2);
    const nextOffset = payloadOffset + paddedLength;
    if (
      !Number.isSafeInteger(nextOffset) ||
      nextOffset <= offset ||
      nextOffset > bytes.length
    ) {
      return null;
    }
    offset = nextOffset;
  }
  return null;
}

export function detectRasterImageType(value) {
  const bytes = rasterBytes(value);
  if (!bytes) return null;
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function parseRasterImageDimensions(value) {
  const bytes = rasterBytes(value);
  if (!bytes) return null;
  const mediaType = detectRasterImageType(bytes);
  if (mediaType === "image/png") return parsePngDimensions(bytes);
  if (mediaType === "image/jpeg") return parseJpegDimensions(bytes);
  if (mediaType === "image/webp") return parseWebpDimensions(bytes);
  return null;
}

export function validateRasterImageDimensions(
  value,
  {
    maxEdge = 4_096,
    maxPixels = 12_000_000,
  } = {},
) {
  const width = Number(value?.width);
  const height = Number(value?.height);
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width < 1 ||
    height < 1
  ) {
    return { ok: false, code: "invalid-dimensions", pixelCount: null };
  }
  const pixelCount = width * height;
  if (!Number.isSafeInteger(pixelCount)) {
    return { ok: false, code: "invalid-dimensions", pixelCount: null };
  }
  if (width > maxEdge || height > maxEdge) {
    return { ok: false, code: "edge-limit", pixelCount };
  }
  if (pixelCount > maxPixels) {
    return { ok: false, code: "pixel-limit", pixelCount };
  }
  return { ok: true, code: "accepted", pixelCount };
}

export const ocrComparatorLimits = Object.freeze({
  maxChangeDetails: MAX_CHANGE_DETAILS,
  maxFileBytes: 20 * 1024 * 1024,
  maxHeaderBytes: 256 * 1024,
  maxImageEdge: 4_096,
  maxImagePixels: 12_000_000,
  maxLines: MAX_LINES,
  maxTranscriptCharacters: MAX_TRANSCRIPT_CHARACTERS,
  maxWords: MAX_WORDS,
});

export const ocrComparatorDefaultOptions = DEFAULT_OPTIONS;
