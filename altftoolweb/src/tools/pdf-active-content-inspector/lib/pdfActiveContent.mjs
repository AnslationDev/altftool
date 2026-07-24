export const PDF_ACTIVE_CONTENT_LIMITS = Object.freeze({
  fileBytes: 20 * 1024 * 1024,
  tokens: 450_000,
  literalStringDepth: 64,
  groups: 9,
});

export const PDF_ACTIVE_CONTENT_LIMITATIONS = Object.freeze([
  "This is a bounded lexical structure-cue inspection, not a complete PDF parser, renderer, sandbox, antivirus scanner, or malware classifier.",
  "A result with no selected marker does not prove the PDF is safe, trustworthy, inactive, attachment-free, or malware-free.",
  "Recognizable stream bodies, comments, literal strings, and hex strings are skipped. Encrypted files, object streams, filters, malformed boundaries, incremental revisions, and ambiguous syntax can hide or mimic cues.",
  "Marker presence does not establish execution, intent, reachability, viewer support, or malicious behavior. Some names are legitimate or context-dependent.",
  "No scripts, actions, media, attachments, form logic, files, or URLs are decoded, displayed, followed, opened, or executed.",
]);

export const PDF_ACTIVE_GROUPS = Object.freeze([
  {
    id: "javascript",
    label: "JavaScript cues",
    description:
      "JavaScript action subtype or abbreviated JS-name markers outside skipped values and recognizable streams.",
    names: ["JavaScript", "JS"],
  },
  {
    id: "automaticActions",
    label: "Automatic action hooks",
    description:
      "Document-open or additional-action dictionary key markers that may associate events with actions.",
    names: ["OpenAction", "AA"],
  },
  {
    id: "launchActions",
    label: "Launch actions",
    description:
      "Launch action subtype markers; target values are neither decoded nor shown.",
    names: ["Launch"],
  },
  {
    id: "submissionActions",
    label: "Form submission/import actions",
    description:
      "SubmitForm and ImportData action subtype markers that may exchange form data.",
    names: ["SubmitForm", "ImportData"],
  },
  {
    id: "externalReferences",
    label: "External reference cues",
    description:
      "URI or remote-GoTo name markers; destinations are neither decoded nor followed.",
    names: ["URI", "GoToR"],
  },
  {
    id: "attachments",
    label: "Attachment and file-spec cues",
    description:
      "Embedded-file, associated-file, name-tree, or file-specification markers.",
    names: ["EmbeddedFile", "EmbeddedFiles", "Filespec", "AF"],
  },
  {
    id: "forms",
    label: "Interactive form cues",
    description: "AcroForm or XFA form markers.",
    names: ["AcroForm", "XFA"],
  },
  {
    id: "richMedia",
    label: "Rich media and 3D cues",
    description:
      "RichMedia, movie, sound, or 3D markers; embedded media is never decoded.",
    names: ["RichMedia", "RichMediaContent", "Movie", "Sound", "3D"],
  },
  {
    id: "namedCommands",
    label: "Named command cues",
    description:
      "Named action markers can request viewer-defined commands and require contextual review.",
    names: ["Named"],
  },
]);

const DELIMITERS = new Set([
  0x28, 0x29, 0x3c, 0x3e, 0x5b, 0x5d, 0x7b, 0x7d, 0x2f, 0x25,
]);
const INTERESTING_NAMES = new Set([
  ...PDF_ACTIVE_GROUPS.flatMap((group) => group.names),
  "Encrypt",
  "ObjStm",
]);

function isWhitespace(code) {
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
  return !Number.isFinite(code) || isWhitespace(code) || DELIMITERS.has(code);
}

function decodeName(value) {
  return String(value || "").replace(/#([a-f\d]{2})/giu, (_, hexadecimal) =>
    String.fromCharCode(Number.parseInt(hexadecimal, 16)),
  );
}

function extensionOf(name) {
  const normalized = String(name || "")
    .trim()
    .toLowerCase();
  const dot = normalized.lastIndexOf(".");
  return dot >= 0 ? normalized.slice(dot + 1) : "";
}

function skipLiteralString(source, start) {
  let index = start + 1;
  let depth = 1;
  let depthLimitHit = false;
  while (index < source.length && depth > 0) {
    const code = source.charCodeAt(index);
    if (code === 0x5c) {
      index += 1;
      if (
        source.charCodeAt(index) === 0x0d &&
        source.charCodeAt(index + 1) === 0x0a
      ) {
        index += 2;
      } else if (index < source.length) {
        index += 1;
      }
      continue;
    }
    if (code === 0x28) {
      depth += 1;
      if (depth > PDF_ACTIVE_CONTENT_LIMITS.literalStringDepth) {
        depthLimitHit = true;
      }
    } else if (code === 0x29) {
      depth -= 1;
    }
    index += 1;
  }
  return {
    index,
    closed: depth === 0,
    depthLimitHit,
  };
}

function isBoundary(source, offset) {
  return (
    offset < 0 ||
    offset >= source.length ||
    isDelimiterOrWhitespace(source.charCodeAt(offset))
  );
}

function findEndstream(source, start) {
  let cursor = start;
  while ((cursor = source.indexOf("endstream", cursor)) >= 0) {
    if (
      isBoundary(source, cursor - 1) &&
      isBoundary(source, cursor + "endstream".length)
    ) {
      return cursor;
    }
    cursor += "endstream".length;
  }
  return -1;
}

function lexInterestingNames(source) {
  const nameCounts = Object.fromEntries(
    [...INTERESTING_NAMES].map((name) => [name, 0]),
  );
  let index = 0;
  let tokens = 0;
  let commentsSkipped = 0;
  let literalStringsSkipped = 0;
  let hexStringsSkipped = 0;
  let streamsSkipped = 0;
  let unclosedLiteralStrings = 0;
  let literalDepthLimitHits = 0;
  let unterminatedStream = false;

  while (index < source.length && tokens < PDF_ACTIVE_CONTENT_LIMITS.tokens) {
    const code = source.charCodeAt(index);
    if (isWhitespace(code)) {
      index += 1;
      continue;
    }
    if (code === 0x25) {
      commentsSkipped += 1;
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
      const skipped = skipLiteralString(source, index);
      literalStringsSkipped += 1;
      if (!skipped.closed) unclosedLiteralStrings += 1;
      if (skipped.depthLimitHit) literalDepthLimitHits += 1;
      index = skipped.index;
      continue;
    }
    if (code === 0x3c && source.charCodeAt(index + 1) !== 0x3c) {
      hexStringsSkipped += 1;
      index += 1;
      while (index < source.length && source.charCodeAt(index) !== 0x3e) {
        index += 1;
      }
      if (index < source.length) index += 1;
      continue;
    }
    if (
      (code === 0x3c && source.charCodeAt(index + 1) === 0x3c) ||
      (code === 0x3e && source.charCodeAt(index + 1) === 0x3e)
    ) {
      tokens += 1;
      index += 2;
      continue;
    }
    if (code === 0x2f) {
      index += 1;
      const start = index;
      while (
        index < source.length &&
        !isDelimiterOrWhitespace(source.charCodeAt(index))
      ) {
        index += 1;
      }
      const name = decodeName(source.slice(start, index));
      if (INTERESTING_NAMES.has(name)) nameCounts[name] += 1;
      tokens += 1;
      continue;
    }
    if (DELIMITERS.has(code)) {
      tokens += 1;
      index += 1;
      continue;
    }

    const start = index;
    while (
      index < source.length &&
      !isDelimiterOrWhitespace(source.charCodeAt(index))
    ) {
      index += 1;
    }
    const keyword = source.slice(start, index);
    tokens += 1;
    if (keyword !== "stream") continue;

    let dataStart = index;
    while (
      source.charCodeAt(dataStart) === 0x20 ||
      source.charCodeAt(dataStart) === 0x09 ||
      source.charCodeAt(dataStart) === 0x0c
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
    const streamEnd = findEndstream(source, dataStart);
    if (streamEnd < 0) {
      unterminatedStream = true;
      break;
    }
    streamsSkipped += 1;
    index = streamEnd + "endstream".length;
  }

  return {
    nameCounts,
    tokens,
    truncated: tokens >= PDF_ACTIVE_CONTENT_LIMITS.tokens,
    commentsSkipped,
    literalStringsSkipped,
    hexStringsSkipped,
    streamsSkipped,
    unclosedLiteralStrings,
    literalDepthLimitHits,
    unterminatedStream,
  };
}

export function validatePdfActiveContentFile({ name, size } = {}) {
  if (extensionOf(name) !== "pdf") {
    return { ok: false, error: "Choose a PDF file." };
  }
  const bytes = Number(size);
  if (!Number.isSafeInteger(bytes) || bytes <= 0) {
    return { ok: false, error: "Choose a non-empty PDF file." };
  }
  if (bytes > PDF_ACTIVE_CONTENT_LIMITS.fileBytes) {
    return { ok: false, error: "Choose a PDF no larger than 20 MB." };
  }
  return { ok: true, bytes };
}

function hasPdfHeader(bytes) {
  const prefix = new TextDecoder("latin1").decode(
    bytes.subarray(0, Math.min(bytes.byteLength, 1_024)),
  );
  return prefix.indexOf("%PDF-") >= 0;
}

export function inspectPdfActiveContentBytes(bytesInput, options = {}) {
  const bytes =
    bytesInput instanceof Uint8Array
      ? bytesInput
      : new Uint8Array(bytesInput || new ArrayBuffer(0));
  const validation = validatePdfActiveContentFile({
    name: options.fileName,
    size: options.fileSize || bytes.byteLength,
  });
  if (!validation.ok) return validation;
  if (!hasPdfHeader(bytes)) {
    return {
      ok: false,
      error: "A PDF header was not found within the first 1,024 bytes.",
    };
  }

  const source = new TextDecoder("latin1").decode(bytes);
  const lexical = lexInterestingNames(source);
  const groups = PDF_ACTIVE_GROUPS.map((definition) => {
    const markers = definition.names.map((name) => ({
      name,
      count: lexical.nameCounts[name] || 0,
    }));
    return {
      id: definition.id,
      label: definition.label,
      description: definition.description,
      count: markers.reduce((sum, marker) => sum + marker.count, 0),
      markers,
    };
  });
  const selectedMarkerCount = groups.reduce(
    (sum, group) => sum + group.count,
    0,
  );
  const encryptedCues = lexical.nameCounts.Encrypt || 0;
  const objectStreamCues = lexical.nameCounts.ObjStm || 0;
  const warnings = [
    ...(encryptedCues
      ? [
          "An Encrypt marker was observed. Encrypted content can prevent meaningful lexical inspection.",
        ]
      : []),
    ...(objectStreamCues
      ? [
          "Object-stream markers were observed. Compressed objects are not decoded, so active-content cues may be missed.",
        ]
      : []),
    ...(lexical.truncated
      ? ["The lexical token limit was reached; counts are incomplete."]
      : []),
    ...(lexical.unterminatedStream
      ? [
          "A recognizable stream start had no bounded endstream marker; scanning stopped early.",
        ]
      : []),
    ...(lexical.unclosedLiteralStrings
      ? [
          "An unclosed literal string was observed; malformed syntax may affect subsequent cue visibility.",
        ]
      : []),
    ...(lexical.literalDepthLimitHits
      ? [
          "Literal-string nesting exceeded the review depth; malformed or adversarial syntax may affect results.",
        ]
      : []),
  ];

  return {
    ok: true,
    groups,
    findings: groups.filter((group) => group.count > 0),
    summary: {
      groupsWithCues: groups.filter((group) => group.count > 0).length,
      selectedMarkerCount,
      tokensInspected: lexical.tokens,
      streamsSkipped: lexical.streamsSkipped,
      commentsSkipped: lexical.commentsSkipped,
      literalStringsSkipped: lexical.literalStringsSkipped,
      hexStringsSkipped: lexical.hexStringsSkipped,
      encryptedCues,
      objectStreamCues,
    },
    warnings,
    limitations: PDF_ACTIVE_CONTENT_LIMITATIONS,
  };
}

export function buildPdfActiveContentCountsReport(
  result,
  generatedAt = new Date().toISOString(),
) {
  if (!result?.ok) return null;
  return {
    reportType: "pdf-active-content-cue-counts-only",
    generatedAt,
    summary: { ...result.summary },
    groups: result.groups.map((group) => ({
      id: group.id,
      count: group.count,
      markers: group.markers.map((marker) => ({
        name: marker.name,
        count: marker.count,
      })),
    })),
    warningCount: result.warnings.length,
    limitations: [...PDF_ACTIVE_CONTENT_LIMITATIONS],
  };
}
