import JSZip from "jszip";

export const MAX_OFFICE_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_PACKAGE_ENTRIES = 5_000;
export const MAX_TOTAL_UNCOMPRESSED_BYTES = 80 * 1024 * 1024;
export const MAX_XML_PART_BYTES = 2 * 1024 * 1024;
export const MAX_XML_PARTS = 2_000;

const SUPPORTED_EXTENSIONS = new Set([
  "docx",
  "docm",
  "dotx",
  "dotm",
  "xlsx",
  "xlsm",
  "xltx",
  "xltm",
  "xlam",
  "pptx",
  "pptm",
  "potx",
  "potm",
  "ppsx",
  "ppsm",
  "zip",
]);

const MACRO_CAPABLE_EXTENSIONS = new Set([
  "docm",
  "dotm",
  "xlsm",
  "xltm",
  "xlam",
  "pptm",
  "potm",
  "ppsm",
]);

const EXTENSION_FAMILIES = {
  docx: "word",
  docm: "word",
  dotx: "word",
  dotm: "word",
  xlsx: "spreadsheet",
  xlsm: "spreadsheet",
  xltx: "spreadsheet",
  xltm: "spreadsheet",
  xlam: "spreadsheet",
  pptx: "presentation",
  pptm: "presentation",
  potx: "presentation",
  potm: "presentation",
  ppsx: "presentation",
  ppsm: "presentation",
};

const FAMILY_LABELS = {
  word: "Word OOXML",
  spreadsheet: "Excel OOXML",
  presentation: "PowerPoint OOXML",
  generic: "Generic OOXML package",
};

export const CHECK_DEFINITIONS = Object.freeze([
  {
    id: "trackedRevisionElements",
    category: "Revision history",
    label: "Tracked-revision elements",
    description:
      "Word insertion, deletion, move, or property-change elements observable in XML.",
  },
  {
    id: "trackRevisionsEnabled",
    category: "Revision history",
    label: "Track-revisions setting",
    description:
      "A Word package setting that requests future edits to be tracked.",
  },
  {
    id: "revisionParts",
    category: "Revision history",
    label: "Revision package parts",
    description:
      "Spreadsheet or other OOXML revision-log parts present in the archive.",
  },
  {
    id: "commentsAndNotes",
    category: "Comments and notes",
    label: "Comments or cell notes",
    description:
      "Comment or threaded-comment elements counted without reading their text.",
  },
  {
    id: "speakerNotesParts",
    category: "Comments and notes",
    label: "Speaker-notes parts",
    description:
      "PowerPoint notes-slide parts present in the package, regardless of visible content.",
  },
  {
    id: "populatedCoreProperties",
    category: "Metadata",
    label: "Populated core-property fields",
    description:
      "Non-empty standard metadata fields counted without exposing their values.",
  },
  {
    id: "authorProperties",
    category: "Metadata",
    label: "Author-related properties",
    description:
      "Creator or last-modified-by fields counted without exposing names.",
  },
  {
    id: "customProperties",
    category: "Metadata",
    label: "Custom properties",
    description:
      "Custom document property entries counted without exposing names or values.",
  },
  {
    id: "hiddenSheets",
    category: "Hidden structure",
    label: "Hidden sheets",
    description: "Workbook sheet declarations with state set to hidden.",
  },
  {
    id: "veryHiddenSheets",
    category: "Hidden structure",
    label: "Very-hidden sheets",
    description: "Workbook sheet declarations with state set to veryHidden.",
  },
  {
    id: "hiddenSlides",
    category: "Hidden structure",
    label: "Hidden slides",
    description:
      "Slide or slide-list declarations carrying a hidden/show-off marker.",
  },
  {
    id: "hiddenTextMarkers",
    category: "Hidden structure",
    label: "Hidden-text markers",
    description:
      "Word vanish or web-hidden formatting markers observable in XML.",
  },
  {
    id: "hiddenRows",
    category: "Hidden structure",
    label: "Hidden rows",
    description: "Worksheet row declarations carrying a hidden marker.",
  },
  {
    id: "hiddenColumns",
    category: "Hidden structure",
    label: "Hidden columns",
    description:
      "Columns covered by worksheet hidden column-range declarations.",
  },
  {
    id: "embeddedFiles",
    category: "Embedded and linked content",
    label: "Embedded-file parts",
    description:
      "Files stored under an OOXML embeddings folder; content is not opened.",
  },
  {
    id: "macroParts",
    category: "Embedded and linked content",
    label: "Macro-related parts",
    description:
      "VBA or legacy macro-sheet package parts; code is never executed.",
  },
  {
    id: "macroCapableContainer",
    category: "Embedded and linked content",
    label: "Macro-capable container marker",
    description:
      "A macro-enabled extension or content-type marker was observed.",
  },
  {
    id: "activeXParts",
    category: "Embedded and linked content",
    label: "ActiveX/control parts",
    description:
      "ActiveX or control-property package parts; content is not loaded.",
  },
  {
    id: "externalRelationships",
    category: "Embedded and linked content",
    label: "External relationships",
    description:
      "OOXML relationships marked External; destinations are counted but not displayed or opened.",
  },
]);

function extensionOf(fileName) {
  return String(fileName || "")
    .toLowerCase()
    .split(".")
    .pop();
}

function normalizeEntryName(value) {
  return String(value || "")
    .replace(/\\/gu, "/")
    .replace(/^\/+/u, "");
}

function isXmlPart(name) {
  const lower = name.toLowerCase();
  return (
    lower.endsWith(".xml") ||
    lower.endsWith(".rels") ||
    lower === "[content_types].xml"
  );
}

function startTags(xml, localName) {
  if (!xml) return [];
  const expression = new RegExp(
    `<(?:[A-Za-z_][\\w.-]*:)?${localName}(?=[\\s/>])[^>]*>`,
    "giu",
  );
  return String(xml).match(expression) || [];
}

function countTags(xml, localNames) {
  return localNames.reduce(
    (total, localName) => total + startTags(xml, localName).length,
    0,
  );
}

function attributeValue(tag, localName) {
  const expression = new RegExp(
    `(?:^|\\s)(?:[A-Za-z_][\\w.-]*:)?${localName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    "iu",
  );
  const match = String(tag || "").match(expression);
  return match ? (match[1] ?? match[2] ?? "") : null;
}

function isTrueAttribute(tag, name) {
  return /^(?:1|true|on)$/iu.test(attributeValue(tag, name) || "");
}

function isFalseAttribute(tag, name) {
  return /^(?:0|false|off)$/iu.test(attributeValue(tag, name) || "");
}

function enabledOnOffElement(tag) {
  const value = attributeValue(tag, "val");
  return value === null || /^(?:1|true|on)$/iu.test(value);
}

function countPopulatedElements(xml, localNames) {
  return localNames.reduce((total, localName) => {
    const expression = new RegExp(
      `<(?:[A-Za-z_][\\w.-]*:)?${localName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[A-Za-z_][\\w.-]*:)?${localName}\\s*>`,
      "giu",
    );
    let count = 0;
    let match;
    while ((match = expression.exec(String(xml || "")))) {
      const visible = match[1].replace(/<[^>]*>/gu, "").trim();
      if (visible) count += 1;
    }
    return total + count;
  }, 0);
}

function toEntryList(entries) {
  if (entries instanceof Map) return [...entries.entries()];
  return Object.entries(entries || {});
}

function packageFamilyFor(names) {
  const lowerNames = new Set(names.map((name) => name.toLowerCase()));
  if (lowerNames.has("word/document.xml")) return "word";
  if (lowerNames.has("xl/workbook.xml")) return "spreadsheet";
  if (lowerNames.has("ppt/presentation.xml")) return "presentation";
  return "generic";
}

function filePart(entries, path) {
  const target = path.toLowerCase();
  return entries.find(([name]) => name.toLowerCase() === target)?.[1] || "";
}

function matchingParts(entries, expression) {
  return entries.filter(([name]) => expression.test(name.toLowerCase()));
}

function countTrackedRevisions(entries) {
  const revisionTags = [
    "ins",
    "del",
    "moveFrom",
    "moveTo",
    "cellIns",
    "cellDel",
    "cellMerge",
    "tblPrChange",
    "trPrChange",
    "tcPrChange",
    "pPrChange",
    "rPrChange",
    "sectPrChange",
    "numberingChange",
  ];
  return matchingParts(entries, /^word\/.*\.xml$/u).reduce(
    (total, [, xml]) => total + countTags(xml, revisionTags),
    0,
  );
}

function countComments(entries) {
  let total = 0;
  entries.forEach(([name, xml]) => {
    const lower = name.toLowerCase();
    if (lower === "word/comments.xml") {
      total += countTags(xml, ["comment"]);
    } else if (/^xl\/comments[^/]*\.xml$/u.test(lower)) {
      total += countTags(xml, ["comment"]);
    } else if (/^xl\/threadedcomments\/.*\.xml$/u.test(lower)) {
      total += countTags(xml, ["threadedComment"]);
    } else if (/^ppt\/comments\/.*\.xml$/u.test(lower)) {
      total += countTags(xml, ["cm", "comment"]);
    }
  });
  return total;
}

function countExternalRelationships(entries) {
  return matchingParts(entries, /\.rels$/u).reduce((total, [, xml]) => {
    return (
      total +
      startTags(xml, "Relationship").filter(
        (tag) =>
          (attributeValue(tag, "TargetMode") || "").toLowerCase() ===
          "external",
      ).length
    );
  }, 0);
}

function hiddenSheetCounts(workbookXml) {
  let hidden = 0;
  let veryHidden = 0;
  startTags(workbookXml, "sheet").forEach((tag) => {
    const state = (attributeValue(tag, "state") || "").toLowerCase();
    if (state === "hidden") hidden += 1;
    if (state === "veryhidden") veryHidden += 1;
  });
  return { hidden, veryHidden };
}

function countHiddenRows(entries) {
  return matchingParts(entries, /^xl\/worksheets\/sheet[^/]*\.xml$/u).reduce(
    (total, [, xml]) =>
      total +
      startTags(xml, "row").filter((tag) => isTrueAttribute(tag, "hidden"))
        .length,
    0,
  );
}

function countHiddenColumns(entries) {
  return matchingParts(entries, /^xl\/worksheets\/sheet[^/]*\.xml$/u).reduce(
    (total, [, xml]) => {
      const ranges = [];
      let indeterminateRangeMarkers = 0;
      startTags(xml, "col")
        .filter((tag) => isTrueAttribute(tag, "hidden"))
        .forEach((tag) => {
          const minimum = Number(attributeValue(tag, "min"));
          const maximum = Number(attributeValue(tag, "max"));
          if (
            !Number.isInteger(minimum) ||
            !Number.isInteger(maximum) ||
            minimum < 1 ||
            minimum > 16_384 ||
            maximum < minimum
          ) {
            indeterminateRangeMarkers += 1;
            return;
          }
          ranges.push([minimum, Math.min(maximum, 16_384)]);
        });
      ranges.sort((left, right) => left[0] - right[0] || left[1] - right[1]);
      let coveredColumns = 0;
      let currentStart = null;
      let currentEnd = null;
      ranges.forEach(([start, end]) => {
        if (currentStart === null) {
          currentStart = start;
          currentEnd = end;
          return;
        }
        if (start <= currentEnd + 1) {
          currentEnd = Math.max(currentEnd, end);
          return;
        }
        coveredColumns += currentEnd - currentStart + 1;
        currentStart = start;
        currentEnd = end;
      });
      if (currentStart !== null) {
        coveredColumns += currentEnd - currentStart + 1;
      }
      return total + coveredColumns + indeterminateRangeMarkers;
    },
    0,
  );
}

function countHiddenSlides(entries) {
  const presentationXml = filePart(entries, "ppt/presentation.xml");
  const listMarkers = startTags(presentationXml, "sldId").filter(
    (tag) => isFalseAttribute(tag, "show") || isTrueAttribute(tag, "hidden"),
  ).length;
  const hiddenSlideParts = matchingParts(
    entries,
    /^ppt\/slides\/slide\d+\.xml$/u,
  ).filter(([, xml]) =>
    startTags(xml, "sld").some(
      (tag) => isFalseAttribute(tag, "show") || isTrueAttribute(tag, "hidden"),
    ),
  ).length;
  return Math.max(listMarkers, hiddenSlideParts);
}

function countHiddenTextMarkers(entries) {
  return matchingParts(entries, /^word\/.*\.xml$/u).reduce(
    (total, [, xml]) =>
      total +
      ["vanish", "webHidden"].reduce(
        (partTotal, localName) =>
          partTotal +
          startTags(xml, localName).filter(enabledOnOffElement).length,
        0,
      ),
    0,
  );
}

function countCoreProperties(coreXml) {
  return countPopulatedElements(coreXml, [
    "title",
    "subject",
    "creator",
    "keywords",
    "description",
    "lastModifiedBy",
    "revision",
    "created",
    "modified",
    "category",
    "contentStatus",
    "identifier",
    "language",
    "version",
    "lastPrinted",
  ]);
}

function countRevisionParts(names) {
  return names.filter((name) => {
    const lower = name.toLowerCase();
    return (
      /\/revisions?\//u.test(lower) ||
      /\/revision(?:headers?|log\d*)\.xml$/u.test(lower)
    );
  }).length;
}

function buildChecks(counts) {
  return CHECK_DEFINITIONS.map((definition) => ({
    ...definition,
    count: counts[definition.id] || 0,
  }));
}

function categoryTotalsFor(checks) {
  return Object.fromEntries(
    [...new Set(checks.map((check) => check.category))].map((category) => [
      category,
      checks
        .filter((check) => check.category === category)
        .reduce((total, check) => total + check.count, 0),
    ]),
  );
}

function validateExtension(fileName) {
  const extension = extensionOf(fileName);
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    return {
      ok: false,
      error:
        "Choose a DOCX, XLSX, PPTX, macro-enabled OOXML variant, template/slideshow variant, or OOXML ZIP package.",
    };
  }
  return { ok: true, extension };
}

export function inspectOoxmlEntries(entriesInput, metadata = {}) {
  const rawEntries = toEntryList(entriesInput);
  if (rawEntries.length > MAX_PACKAGE_ENTRIES) {
    return {
      ok: false,
      error: `The package exceeds the ${MAX_PACKAGE_ENTRIES.toLocaleString("en-US")}-entry safety limit.`,
    };
  }

  const entries = rawEntries.map(([name, value]) => [
    normalizeEntryName(name),
    typeof value === "string" ? value : "",
  ]);
  const names = entries.map(([name]) => name);
  const lowerNames = new Set(names.map((name) => name.toLowerCase()));
  if (
    !lowerNames.has("[content_types].xml") ||
    !lowerNames.has("_rels/.rels")
  ) {
    return {
      ok: false,
      error: "This ZIP is not recognized as a complete OOXML package.",
    };
  }

  const family = packageFamilyFor(names);
  const extension = metadata.extension || extensionOf(metadata.fileName);
  const expectedFamily = EXTENSION_FAMILIES[extension];
  const warnings = [...(metadata.warnings || [])];
  if (expectedFamily && family !== "generic" && expectedFamily !== family) {
    warnings.push(
      "The filename extension and the internal OOXML package family do not match.",
    );
  }
  if (family === "generic") {
    warnings.push(
      "No standard Word, Excel, or PowerPoint main part was found; only generic package checks were applied.",
    );
  }

  const contentTypesXml = filePart(entries, "[Content_Types].xml");
  const coreXml = filePart(entries, "docProps/core.xml");
  const customXml = filePart(entries, "docProps/custom.xml");
  const workbookXml = filePart(entries, "xl/workbook.xml");
  const hiddenSheets = hiddenSheetCounts(workbookXml);
  const macroParts = names.filter((name) => {
    const lower = name.toLowerCase();
    return (
      /(?:^|\/)vbaproject\.bin$/u.test(lower) ||
      /(?:^|\/)vbadata\.xml$/u.test(lower) ||
      /\/(?:xl4)?macrosheets?\//u.test(lower)
    );
  }).length;
  const macroCapable =
    MACRO_CAPABLE_EXTENSIONS.has(extension) ||
    /macroenabled|vbaproject/iu.test(contentTypesXml);

  const counts = {
    trackedRevisionElements: countTrackedRevisions(entries),
    trackRevisionsEnabled: startTags(
      filePart(entries, "word/settings.xml"),
      "trackRevisions",
    ).some(enabledOnOffElement)
      ? 1
      : 0,
    revisionParts: countRevisionParts(names),
    commentsAndNotes: countComments(entries),
    speakerNotesParts: names.filter((name) =>
      /^ppt\/notesslides\/notesslide\d+\.xml$/u.test(name.toLowerCase()),
    ).length,
    populatedCoreProperties: countCoreProperties(coreXml),
    authorProperties: countPopulatedElements(coreXml, [
      "creator",
      "lastModifiedBy",
    ]),
    customProperties: countTags(customXml, ["property"]),
    hiddenSheets: hiddenSheets.hidden,
    veryHiddenSheets: hiddenSheets.veryHidden,
    hiddenSlides: countHiddenSlides(entries),
    hiddenTextMarkers: countHiddenTextMarkers(entries),
    hiddenRows: countHiddenRows(entries),
    hiddenColumns: countHiddenColumns(entries),
    embeddedFiles: names.filter((name) =>
      /\/embeddings\/[^/]+$/u.test(name.toLowerCase()),
    ).length,
    macroParts,
    macroCapableContainer: macroCapable ? 1 : 0,
    activeXParts: names.filter((name) =>
      /\/(?:activex|ctrlprops)\//u.test(name.toLowerCase()),
    ).length,
    externalRelationships: countExternalRelationships(entries),
  };
  const checks = buildChecks(counts);
  const categoryTotals = categoryTotalsFor(checks);
  const skippedXmlParts = Number(metadata.skippedXmlParts) || 0;
  if (skippedXmlParts) {
    warnings.push(
      `${skippedXmlParts} oversized or excess XML part(s) were not inspected, so counts may be incomplete.`,
    );
  }

  return {
    ok: true,
    family,
    familyLabel: FAMILY_LABELS[family],
    extension: extension || "zip",
    packageEntries: Number(metadata.packageEntries) || entries.length,
    inspectedXmlParts:
      Number(metadata.inspectedXmlParts) ||
      entries.filter(([name, value]) => isXmlPart(name) && value).length,
    skippedXmlParts,
    checks,
    findings: checks.filter((check) => check.count > 0),
    categoryTotals,
    summary: {
      checksWithEvidence: checks.filter((check) => check.count > 0).length,
      evidenceMarkers: checks.reduce((total, check) => total + check.count, 0),
      packageEntries: Number(metadata.packageEntries) || entries.length,
      inspectedXmlParts:
        Number(metadata.inspectedXmlParts) ||
        entries.filter(([name, value]) => isXmlPart(name) && value).length,
      skippedXmlParts,
    },
    warnings,
    limitations: [
      "Counts describe static package markers only and do not establish who created them or what they mean.",
      "Absence of a marker is not proof of a clean or complete history.",
      "Resaving, accepting changes, flattening, copying, converting, or exporting a file can remove revision and metadata evidence.",
      "Encrypted, malformed, oversized, unsupported, or skipped parts may prevent complete inspection.",
    ],
  };
}

function claimedUncompressedSize(entry) {
  const size = Number(entry?._data?.uncompressedSize);
  return Number.isFinite(size) && size >= 0 ? size : null;
}

/**
 * Decompress a zip entry's text incrementally, aborting the moment the
 * actual decompressed byte count exceeds `maxBytes`.
 *
 * The zip header's declared uncompressedSize is attacker-controlled, and
 * JSZip does not enforce it as a decompression ceiling: entry.async("string")
 * fully decompresses and buffers the entire payload before any length check
 * runs, so a part that lies about its size (tiny declared size, a DEFLATE
 * stream that actually expands to hundreds of MB) would already have
 * exhausted memory by the time a post-hoc `text.length` check could catch
 * it. Reading via entry.internalStream and pausing on the first chunk that
 * pushes the running total past the cap means real memory use stays bounded
 * near maxBytes regardless of what the archive claims or how large the
 * stream would otherwise decompress to.
 */
function readCappedXmlText(entry, maxBytes) {
  return new Promise((resolve) => {
    let total = 0;
    let text = "";
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    let stream;
    try {
      stream = entry.internalStream("text");
    } catch {
      finish({ exceeded: true, text: "" });
      return;
    }

    stream
      .on("data", (chunk) => {
        if (settled) return;
        total += chunk.length;
        if (total > maxBytes) {
          stream.pause();
          finish({ exceeded: true, text: "" });
          return;
        }
        text += chunk;
      })
      .on("error", () => finish({ exceeded: true, text: "" }))
      .on("end", () => finish({ exceeded: false, text }))
      .resume();
  });
}

export async function inspectOoxmlArchive(bytesInput, options = {}) {
  const extensionValidation = validateExtension(
    options.fileName || "package.zip",
  );
  if (!extensionValidation.ok) return extensionValidation;

  const bytes =
    bytesInput instanceof Uint8Array
      ? bytesInput
      : new Uint8Array(bytesInput || new ArrayBuffer(0));
  const fileSize = Number(options.fileSize) || bytes.byteLength;
  if (!bytes.byteLength) {
    return { ok: false, error: "Choose a non-empty OOXML file." };
  }
  if (
    fileSize > MAX_OFFICE_FILE_BYTES ||
    bytes.byteLength > MAX_OFFICE_FILE_BYTES
  ) {
    return {
      ok: false,
      error: "Choose an OOXML file no larger than 20 MB.",
    };
  }

  try {
    const zip = await JSZip.loadAsync(bytes, {
      checkCRC32: false,
      createFolders: false,
    });
    const archiveEntries = Object.values(zip.files).filter(
      (entry) => !entry.dir,
    );
    if (archiveEntries.length > MAX_PACKAGE_ENTRIES) {
      return {
        ok: false,
        error: `The package exceeds the ${MAX_PACKAGE_ENTRIES.toLocaleString("en-US")}-entry safety limit.`,
      };
    }

    let claimedTotal = 0;
    let missingSizeCount = 0;
    archiveEntries.forEach((entry) => {
      const size = claimedUncompressedSize(entry);
      if (size === null) missingSizeCount += 1;
      else claimedTotal += size;
    });
    if (claimedTotal > MAX_TOTAL_UNCOMPRESSED_BYTES) {
      return {
        ok: false,
        error: "The package exceeds the 80 MB uncompressed-data safety limit.",
      };
    }

    const entries = {};
    let inspectedXmlParts = 0;
    let skippedXmlParts = 0;
    for (const entry of archiveEntries) {
      const name = normalizeEntryName(entry.name);
      entries[name] = "";
      if (!isXmlPart(name)) continue;

      const claimedSize = claimedUncompressedSize(entry);
      if (
        inspectedXmlParts >= MAX_XML_PARTS ||
        claimedSize === null ||
        claimedSize > MAX_XML_PART_BYTES
      ) {
        skippedXmlParts += 1;
        continue;
      }

      // The declared size above is only a fast pre-filter and cannot be
      // trusted as a security boundary — the zip header it comes from is
      // attacker-controlled. readCappedXmlText enforces the real cap while
      // decompressing, so a part that lies about its size still cannot
      // exhaust memory.
      const capped = await readCappedXmlText(entry, MAX_XML_PART_BYTES);
      if (capped.exceeded) {
        skippedXmlParts += 1;
        continue;
      }
      entries[name] = capped.text;
      inspectedXmlParts += 1;
    }

    const warnings = [];
    if (missingSizeCount) {
      warnings.push(
        `${missingSizeCount} package part(s) lacked a usable declared size; XML among them was skipped.`,
      );
    }
    return inspectOoxmlEntries(entries, {
      fileName: options.fileName,
      extension: extensionValidation.extension,
      packageEntries: archiveEntries.length,
      inspectedXmlParts,
      skippedXmlParts,
      warnings,
    });
  } catch {
    return {
      ok: false,
      error:
        "The file could not be opened as an unencrypted OOXML ZIP package. It may be corrupt, encrypted, legacy binary Office, or unsupported.",
    };
  }
}

export function buildCountsOnlyRevisionReport(
  result,
  generatedAt = new Date().toISOString(),
) {
  if (!result?.ok) return null;
  return {
    reportType: "hidden-revision-inspection-counts-only",
    generatedAt,
    packageFamily: result.family,
    extension: result.extension,
    packageEntries: result.packageEntries,
    inspectedXmlParts: result.inspectedXmlParts,
    skippedXmlParts: result.skippedXmlParts,
    checksWithEvidence: result.summary.checksWithEvidence,
    evidenceMarkers: result.summary.evidenceMarkers,
    categoryTotals: { ...result.categoryTotals },
    checkCounts: Object.fromEntries(
      result.checks.map((check) => [check.id, check.count]),
    ),
    incompleteInspection: result.skippedXmlParts > 0,
    privacy:
      "This report contains generic counts only. It excludes file names, document text, comments, notes, author values, property names and values, embedded content, macro code, and relationship targets.",
    interpretation:
      "Presence is package evidence, not proof of intent or harm. Absence is not proof of a clean or complete history, and resaving or exporting can remove evidence.",
  };
}
