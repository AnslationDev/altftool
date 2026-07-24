import JSZip from "jszip";

import { preflightZipCentralDirectory } from "../../archive-safety-inspector/lib/zipCentralDirectory.mjs";

export const OFFICE_MACRO_LIMITS = Object.freeze({
  fileBytes: 20 * 1024 * 1024,
  packageEntries: 1_500,
  centralDirectoryBytes: 5 * 1024 * 1024,
  totalDeclaredExpandedBytes: 80 * 1024 * 1024,
  singleDeclaredExpandedBytes: 24 * 1024 * 1024,
  selectedXmlPartBytes: 512 * 1024,
  selectedXmlTotalBytes: 3 * 1024 * 1024,
  selectedRelationshipParts: 96,
  legacyStringScanBytes: 8 * 1024 * 1024,
});

export const OFFICE_MACRO_LIMITATIONS = Object.freeze([
  "This is a bounded static package-cue inspection. It never opens Office, executes VBA, evaluates formulas, loads add-ins, follows relationships, or runs embedded objects.",
  "A result with no selected cue does not prove that a document is macro-free, safe, trustworthy, or malware-free.",
  "Encrypted, malformed, oversized, obfuscated, externally linked, unsupported, or unusual packages can hide cues or prevent complete inspection.",
  "Legacy OLE files receive only signature and bounded raw-string cue checks; streams, VBA source, p-code, signatures, and behavior are not parsed.",
  "Macro presence does not establish malicious intent, and extension-based capability does not establish that a VBA project exists.",
]);

const OOXML_EXTENSIONS = new Set([
  "docm",
  "docx",
  "dotm",
  "dotx",
  "ppam",
  "potm",
  "potx",
  "ppsm",
  "ppsx",
  "pptm",
  "pptx",
  "sldm",
  "sldx",
  "xlam",
  "xlsb",
  "xlsm",
  "xlsx",
  "xltm",
  "xltx",
]);
const MACRO_CAPABLE_EXTENSIONS = new Set([
  "docm",
  "dotm",
  "ppam",
  "potm",
  "ppsm",
  "pptm",
  "sldm",
  "xlam",
  "xlsb",
  "xlsm",
  "xltm",
]);
const LEGACY_EXTENSIONS = new Set(["doc", "dot", "ppt", "pps", "xls", "xla"]);
const OLE_SIGNATURE = new Uint8Array([
  0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
]);
const VBA_CONTENT_TYPE = "application/vnd.ms-office.vbaproject";
const VBA_RELATIONSHIP_TYPES = new Set(
  [
    "http://schemas.microsoft.com/office/2006/relationships/vbaProject",
    "http://purl.oclc.org/ooxml/officeDocument/relationships/vbaProject",
  ].map((value) => value.toLowerCase()),
);
const LEGACY_STRING_CUES = [
  "_VBA_PROJECT",
  "VBAProject",
  "Macros",
  "PROJECT",
  "Attribute VB_",
];

function extensionOf(name) {
  const normalized = String(name || "")
    .trim()
    .toLowerCase();
  const dot = normalized.lastIndexOf(".");
  return dot >= 0 ? normalized.slice(dot + 1) : "";
}

function hasPrefix(bytes, signature) {
  return (
    bytes.byteLength >= signature.byteLength &&
    signature.every((value, index) => bytes[index] === value)
  );
}

function isZipSignature(bytes) {
  return (
    bytes.byteLength >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    ((bytes[2] === 0x03 && bytes[3] === 0x04) ||
      (bytes[2] === 0x05 && bytes[3] === 0x06) ||
      (bytes[2] === 0x07 && bytes[3] === 0x08))
  );
}

function lowerPath(name) {
  return String(name || "")
    .replace(/\\/gu, "/")
    .replace(/^\/+/u, "")
    .toLowerCase();
}

function countOccurrences(source, needle) {
  if (!source || !needle) return 0;
  let count = 0;
  let offset = 0;
  while ((offset = source.indexOf(needle, offset)) >= 0) {
    count += 1;
    offset += needle.length;
  }
  return count;
}

function stringCueCounts(source, cues) {
  const prepared = source.toLowerCase();
  return cues.map((cue) => ({
    cue,
    count: countOccurrences(prepared, cue.toLowerCase()),
  }));
}

function xmlAttributeValues(xml, attribute) {
  const expression = new RegExp(
    `\\b${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    "giu",
  );
  const source = String(xml || "").replace(/<!--[\s\S]*?-->/gu, "");
  const values = [];
  let match;
  while ((match = expression.exec(source))) {
    values.push(match[1] ?? match[2] ?? "");
  }
  return values;
}

function xmlEncodingDeclaration(text) {
  const declaration = String(text || "")
    .slice(0, 512)
    .match(
      /^\uFEFF?\s*<\?xml\b[^>]*\bencoding\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*\?>/iu,
    );
  return String(declaration?.[1] ?? declaration?.[2] ?? "")
    .trim()
    .toLowerCase();
}

function decodeSelectedXml(bytes) {
  let encoding = "utf-8";
  let expectedDeclarations = new Set(["", "utf-8", "utf8"]);

  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    encoding = "utf-16le";
    expectedDeclarations = new Set([
      "",
      "utf-16",
      "utf-16le",
      "utf-16-le",
    ]);
  } else if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    encoding = "utf-16be";
    expectedDeclarations = new Set([
      "",
      "utf-16",
      "utf-16be",
      "utf-16-be",
    ]);
  } else if (
    bytes[0] === 0x3c &&
    bytes[1] === 0x00 &&
    bytes[2] === 0x3f &&
    bytes[3] === 0x00
  ) {
    encoding = "utf-16le";
    expectedDeclarations = new Set(["utf-16", "utf-16le", "utf-16-le"]);
  } else if (
    bytes[0] === 0x00 &&
    bytes[1] === 0x3c &&
    bytes[2] === 0x00 &&
    bytes[3] === 0x3f
  ) {
    encoding = "utf-16be";
    expectedDeclarations = new Set(["utf-16", "utf-16be", "utf-16-be"]);
  }

  let text;
  try {
    text = new TextDecoder(encoding, { fatal: true }).decode(bytes);
  } catch {
    throw new Error("A selected OOXML metadata part has invalid text encoding.");
  }
  const declaredEncoding = xmlEncodingDeclaration(text);
  if (!expectedDeclarations.has(declaredEncoding)) {
    throw new Error(
      "A selected OOXML metadata part has an unsupported or conflicting XML encoding declaration.",
    );
  }
  return text;
}

function inspectLegacy(bytes, extension) {
  const scan = bytes.subarray(
    0,
    Math.min(bytes.byteLength, OFFICE_MACRO_LIMITS.legacyStringScanBytes),
  );
  const latin = new TextDecoder("windows-1252").decode(scan);
  let utf16 = "";
  try {
    utf16 = new TextDecoder("utf-16le").decode(scan);
  } catch {
    utf16 = "";
  }
  const latinCounts = stringCueCounts(latin, LEGACY_STRING_CUES);
  const utf16Counts = stringCueCounts(utf16, LEGACY_STRING_CUES);
  const cueCounts = Object.fromEntries(
    LEGACY_STRING_CUES.map((cue, index) => [
      cue,
      latinCounts[index].count + utf16Counts[index].count,
    ]),
  );
  const observedStringCues = Object.values(cueCounts).reduce(
    (sum, value) => sum + value,
    0,
  );

  return {
    ok: true,
    format: "legacy-ole",
    extension,
    evidenceLevel: "legacy-signature-and-strings-only",
    summary: {
      packageEntries: 0,
      selectedXmlParts: 0,
      macroPartPaths: 0,
      vbaContentTypeCues: 0,
      vbaRelationshipCues: 0,
      macroEnabledContentTypeCues: 0,
      macroSheetParts: 0,
      activeXParts: 0,
      externalRelationships: 0,
      legacyStringCues: observedStringCues,
    },
    extensionMacroCapable:
      MACRO_CAPABLE_EXTENSIONS.has(extension) ||
      LEGACY_EXTENSIONS.has(extension),
    observations:
      observedStringCues > 0
        ? [
            "A legacy OLE signature and bounded VBA-related raw-string cues were observed. These strings are not proof of an executable macro.",
          ]
        : [
            "A legacy OLE signature was observed, but no selected raw-string cue appeared in the bounded scan.",
          ],
    warnings: [
      "Legacy OLE internals are not parsed by this tool; the result is intentionally incomplete.",
      ...(!LEGACY_EXTENSIONS.has(extension)
        ? [
            "The OLE signature conflicts with the filename extension expected for an OOXML ZIP package.",
          ]
        : []),
      ...(scan.byteLength < bytes.byteLength
        ? ["Only the first 8 MB was searched for legacy raw-string cues."]
        : []),
    ],
    legacyCueCounts: cueCounts,
    limitations: OFFICE_MACRO_LIMITATIONS,
  };
}

export function validateOfficeMacroFile({ name, size } = {}) {
  const extension = extensionOf(name);
  if (!OOXML_EXTENSIONS.has(extension) && !LEGACY_EXTENSIONS.has(extension)) {
    return {
      ok: false,
      error:
        "Choose a supported Word, Excel, or PowerPoint OOXML package or a legacy DOC, DOT, XLS, XLA, PPT, or PPS file.",
    };
  }
  const bytes = Number(size);
  if (!Number.isSafeInteger(bytes) || bytes <= 0) {
    return { ok: false, error: "Choose a non-empty Office file." };
  }
  if (bytes > OFFICE_MACRO_LIMITS.fileBytes) {
    return { ok: false, error: "Choose an Office file no larger than 20 MB." };
  }
  return {
    ok: true,
    extension,
    legacy: LEGACY_EXTENSIONS.has(extension),
  };
}

function readEntryTextBounded(entry, maxBytes) {
  return new Promise((resolve, reject) => {
    const stream = entry.internalStream("uint8array");
    const chunks = [];
    let total = 0;
    let settled = false;

    stream.on("data", (chunk) => {
      if (settled) return;
      total += chunk.byteLength;
      if (total > maxBytes) {
        settled = true;
        chunks.length = 0;
        stream.pause();
        reject(new Error("The expanded XML part exceeded its read bound."));
        return;
      }
      chunks.push(chunk);
    });
    stream.on("error", (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
    stream.on("end", () => {
      if (settled) return;
      settled = true;
      const bytes = new Uint8Array(total);
      let offset = 0;
      chunks.forEach((chunk) => {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      });
      try {
        resolve({
          text: decodeSelectedXml(bytes),
          byteLength: bytes.byteLength,
        });
      } catch (error) {
        reject(error);
      }
    });
    stream.resume();
  });
}

async function readSelectedXml(zip, entryMap, selectedNames) {
  const values = new Map();
  let totalReadBytes = 0;
  let skippedParts = 0;

  for (const name of selectedNames) {
    const metadata = entryMap.get(lowerPath(name));
    const entry = zip.file(name);
    const remainingTotal =
      OFFICE_MACRO_LIMITS.selectedXmlTotalBytes - totalReadBytes;
    const readLimit = Math.min(
      OFFICE_MACRO_LIMITS.selectedXmlPartBytes,
      remainingTotal,
    );
    if (
      !metadata ||
      !entry ||
      readLimit <= 0 ||
      metadata.uncompressedSize > OFFICE_MACRO_LIMITS.selectedXmlPartBytes ||
      metadata.uncompressedSize > remainingTotal
    ) {
      skippedParts += 1;
      continue;
    }
    let decoded;
    try {
      decoded = await readEntryTextBounded(entry, readLimit);
    } catch {
      skippedParts += 1;
      continue;
    }
    const measuredBytes = decoded.byteLength;
    if (
      measuredBytes > OFFICE_MACRO_LIMITS.selectedXmlPartBytes ||
      totalReadBytes + measuredBytes > OFFICE_MACRO_LIMITS.selectedXmlTotalBytes
    ) {
      skippedParts += 1;
      continue;
    }
    totalReadBytes += measuredBytes;
    values.set(lowerPath(name), decoded.text);
  }
  return { values, totalReadBytes, skippedParts };
}

export async function inspectOfficeMacroBytes(bytesInput, options = {}) {
  const bytes =
    bytesInput instanceof Uint8Array
      ? bytesInput
      : new Uint8Array(bytesInput || new ArrayBuffer(0));
  const validation = validateOfficeMacroFile({
    name: options.fileName,
    size: options.fileSize || bytes.byteLength,
  });
  if (!validation.ok) return validation;
  if (hasPrefix(bytes, OLE_SIGNATURE)) {
    return inspectLegacy(bytes, validation.extension);
  }
  if (!isZipSignature(bytes)) {
    return {
      ok: false,
      error:
        "The file does not begin with a supported OOXML ZIP or legacy OLE signature.",
    };
  }

  const preflight = preflightZipCentralDirectory(bytes, {
    maxFileBytes: OFFICE_MACRO_LIMITS.fileBytes,
    maxEntries: OFFICE_MACRO_LIMITS.packageEntries,
    maxCentralDirectoryBytes: OFFICE_MACRO_LIMITS.centralDirectoryBytes,
    maxTotalExpandedBytes: OFFICE_MACRO_LIMITS.totalDeclaredExpandedBytes,
    maxSingleExpandedBytes: OFFICE_MACRO_LIMITS.singleDeclaredExpandedBytes,
  });
  if (!preflight.ok) return preflight;
  if (
    preflight.counts.pathTraversal ||
    preflight.counts.absolutePaths ||
    preflight.counts.symlinks
  ) {
    return {
      ok: false,
      error:
        "The OOXML package was not expanded because its central directory contains an unsafe path or observable symlink cue.",
      preflightCounts: { ...preflight.counts },
    };
  }
  if (!preflight.expansionAllowed) {
    return {
      ok: false,
      error:
        "The OOXML package was not expanded because its metadata declares encryption, unsupported compression, or an expansion-bound violation.",
      preflightCounts: { ...preflight.counts },
    };
  }

  const lowerEntries = new Map(
    preflight.entries.map((entry) => [lowerPath(entry.name), entry]),
  );
  if (
    !lowerEntries.has("[content_types].xml") ||
    !lowerEntries.has("_rels/.rels")
  ) {
    return {
      ok: false,
      error:
        "The ZIP does not contain the required root OOXML content-types and relationships parts.",
    };
  }

  const relationshipNames = preflight.entries
    .map((entry) => entry.name)
    .filter((name) => lowerPath(name).endsWith(".rels"))
    .slice(0, OFFICE_MACRO_LIMITS.selectedRelationshipParts);
  const selectedNames = ["[Content_Types].xml", ...relationshipNames];
  let selected;
  try {
    const zip = await JSZip.loadAsync(bytes, {
      checkCRC32: false,
      createFolders: false,
    });
    selected = await readSelectedXml(zip, lowerEntries, selectedNames);
  } catch {
    return {
      ok: false,
      error:
        "The bounded OOXML metadata parts could not be opened. The package may be corrupt or unsupported.",
    };
  }

  const contentTypes = selected.values.get("[content_types].xml") || "";
  const relationships = relationshipNames
    .map((name) => selected.values.get(lowerPath(name)) || "")
    .join("\n");
  const fileNames = preflight.entries
    .filter((entry) => !entry.directory)
    .map((entry) => lowerPath(entry.name));
  const macroPartPaths = fileNames.filter((name) =>
    /(?:^|\/)vbaproject\.bin$/u.test(name),
  ).length;
  const macroSheetParts = fileNames.filter((name) =>
    /\/(?:xl4)?macrosheets?\//u.test(name),
  ).length;
  const activeXParts = fileNames.filter((name) =>
    /\/(?:activex|ctrlprops)\//u.test(name),
  ).length;
  const vbaDataParts = fileNames.filter((name) =>
    /(?:^|\/)vbadata\.xml$/u.test(name),
  ).length;
  const contentTypeValues = xmlAttributeValues(contentTypes, "ContentType").map(
    (value) => value.toLowerCase(),
  );
  const vbaContentTypeCues = contentTypeValues.filter(
    (value) => value === VBA_CONTENT_TYPE,
  ).length;
  const macroEnabledContentTypeCues = contentTypeValues.filter((value) =>
    value.includes("macroenabled"),
  ).length;
  const relationshipTypeValues = xmlAttributeValues(relationships, "Type").map(
    (value) => value.toLowerCase(),
  );
  const vbaRelationshipCues = relationshipTypeValues.filter((value) =>
    VBA_RELATIONSHIP_TYPES.has(value),
  ).length;
  const externalRelationships = xmlAttributeValues(
    relationships,
    "TargetMode",
  ).filter((value) => value.toLowerCase() === "external");
  const extensionMacroCapable = MACRO_CAPABLE_EXTENSIONS.has(
    validation.extension,
  );
  const directMacroCues =
    macroPartPaths + vbaContentTypeCues + vbaRelationshipCues + macroSheetParts;
  const evidenceLevel =
    directMacroCues > 0
      ? "macro-related-package-cues-observed"
      : extensionMacroCapable || macroEnabledContentTypeCues > 0
        ? "macro-capable-container-cues-only"
        : "no-selected-macro-cues-observed";
  const warnings = [];
  if (
    directMacroCues > 0 &&
    !extensionMacroCapable &&
    validation.extension !== "xlsb"
  ) {
    warnings.push(
      "Macro-related package cues conflict with the filename's macro-free extension.",
    );
  }
  const totalRelationshipParts = preflight.entries.filter((entry) =>
    lowerPath(entry.name).endsWith(".rels"),
  ).length;
  if (totalRelationshipParts > relationshipNames.length) {
    warnings.push(
      `${totalRelationshipParts - relationshipNames.length} excess relationship part(s) were not selected for bounded inspection.`,
    );
  }
  if (selected.skippedParts) {
    warnings.push(
      `${selected.skippedParts} selected XML metadata part(s) exceeded a read bound or could not be selected.`,
    );
  }

  return {
    ok: true,
    format: "ooxml-package",
    extension: validation.extension,
    evidenceLevel,
    extensionMacroCapable,
    summary: {
      packageEntries: preflight.summary.entryCount,
      selectedXmlParts: selected.values.size,
      macroPartPaths,
      vbaContentTypeCues,
      vbaRelationshipCues,
      macroEnabledContentTypeCues,
      macroSheetParts,
      vbaDataParts,
      activeXParts,
      externalRelationships: externalRelationships.length,
      legacyStringCues: 0,
    },
    observations: [
      ...(extensionMacroCapable
        ? [
            "The filename extension is macro-capable; this capability alone does not establish that a VBA project exists.",
          ]
        : []),
      ...(macroPartPaths
        ? [
            `${macroPartPaths} VBA project part path cue(s) were observed; binary contents were not opened.`,
          ]
        : []),
      ...(vbaContentTypeCues
        ? [
            `${vbaContentTypeCues} VBA project content-type cue(s) were observed.`,
          ]
        : []),
      ...(vbaRelationshipCues
        ? [
            `${vbaRelationshipCues} VBA project relationship cue(s) were observed.`,
          ]
        : []),
      ...(macroSheetParts
        ? [
            `${macroSheetParts} legacy macro-sheet package part cue(s) appeared.`,
          ]
        : []),
      ...(directMacroCues === 0
        ? [
            "No selected VBA project, relationship, content-type, or macro-sheet cue was observed within the applied bounds.",
          ]
        : []),
    ],
    warnings,
    limitations: OFFICE_MACRO_LIMITATIONS,
  };
}

export function buildOfficeMacroCountsReport(
  result,
  generatedAt = new Date().toISOString(),
) {
  if (!result?.ok) return null;
  return {
    reportType: "office-macro-cue-counts-only",
    generatedAt,
    format: result.format,
    extension: result.extension,
    evidenceLevel: result.evidenceLevel,
    extensionMacroCapable: result.extensionMacroCapable,
    summary: { ...result.summary },
    warningCount: result.warnings.length,
    limitations: [...OFFICE_MACRO_LIMITATIONS],
  };
}
