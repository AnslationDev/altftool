import JSZip from "jszip";

import { preflightZipStructure } from "../../../platform/files/preflightZipStructure.mjs";
import { readBoundedZipText } from "../../../platform/files/readBoundedZipText.mjs";

export const DOCUMENT_LIMITS = {
  fileBytes: 20 * 1024 * 1024,
  packageEntries: 3_000,
  uncompressedBytes: 80 * 1024 * 1024,
  xmlPartBytes: 2 * 1024 * 1024,
  inspectedXmlBytes: 16 * 1024 * 1024,
  xmlParts: 1_500,
};

const FORMAT_BY_EXTENSION = {
  pdf: "pdf",
  docx: "word",
  xlsx: "spreadsheet",
  pptx: "presentation",
};

const FORMAT_LABELS = {
  pdf: "PDF",
  word: "Word OOXML",
  spreadsheet: "Excel OOXML",
  presentation: "PowerPoint OOXML",
};

function extensionOf(value) {
  const name = String(value || "")
    .trim()
    .toLowerCase();
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1) : "";
}

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function validateDocumentFile({ name, size } = {}) {
  const extension = extensionOf(name);
  const format = FORMAT_BY_EXTENSION[extension] || null;
  const bytes = finite(size, -1);
  if (!format) {
    return {
      ok: false,
      error: "Choose a PDF, DOCX, XLSX, or PPTX file.",
    };
  }
  if (bytes <= 0) {
    return { ok: false, error: "The selected document is empty." };
  }
  if (bytes > DOCUMENT_LIMITS.fileBytes) {
    return {
      ok: false,
      error: "Choose a document no larger than 20 MB.",
    };
  }
  return { ok: true, extension, format, bytes };
}

function countMatches(value, expression) {
  return [...String(value || "").matchAll(expression)].length;
}

function tagAttribute(tag, localName) {
  const expression = new RegExp(
    `(?:^|\\s)(?:[A-Za-z_][\\w.-]*:)?${localName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    "iu",
  );
  const match = String(tag || "").match(expression);
  return match ? (match[1] ?? match[2] ?? "") : null;
}

function populatedElement(xml, localName) {
  const expression = new RegExp(
    `<(?:[A-Za-z_][\\w.-]*:)?${localName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[A-Za-z_][\\w.-]*:)?${localName}\\s*>`,
    "iu",
  );
  const match = String(xml || "").match(expression);
  return Boolean(match?.[1]?.replace(/<[^>]*>/gu, "").trim());
}

function entryPairs(entries) {
  return entries instanceof Map
    ? [...entries.entries()]
    : Object.entries(entries || {});
}

function matchingXml(entries, expression) {
  return entryPairs(entries)
    .filter(([name]) => expression.test(String(name).toLowerCase()))
    .map(([, xml]) => String(xml || ""));
}

function combinedXml(entries, expression) {
  return matchingXml(entries, expression).join("\n");
}

function check(id, label, status, observed, detail) {
  return { id, label, status, observed, detail };
}

function titleCheck(entries) {
  const core =
    entryPairs(entries).find(
      ([name]) => String(name).toLowerCase() === "docprops/core.xml",
    )?.[1] || "";
  const present = populatedElement(core, "title");
  return check(
    "document-title",
    "Document title metadata",
    present ? "present" : "review",
    present ? 1 : 0,
    present
      ? "A populated core title field was observed."
      : "A populated core title field was not observed; verify the document properties manually.",
  );
}

function imageDescriptionMetrics(xml, family) {
  const blocks =
    family === "word"
      ? String(xml).match(/<(?:\w+:)?docPr\b[^>]*>/giu) || []
      : String(xml).match(/<(?:\w+:)?pic\b[\s\S]*?<\/(?:\w+:)?pic\s*>/giu) ||
        [];

  const tags =
    family === "word"
      ? blocks
      : blocks
          .map((block) => block.match(/<(?:\w+:)?cNvPr\b[^>]*>/iu)?.[0] || "")
          .filter(Boolean);
  const described = tags.filter((tag) => {
    const description = tagAttribute(tag, "descr");
    const title = tagAttribute(tag, "title");
    return Boolean(description?.trim() || title?.trim());
  }).length;
  return {
    objects: tags.length,
    described,
    missing: Math.max(0, tags.length - described),
  };
}

function inspectWord(entries) {
  const documentXml = combinedXml(
    entries,
    /^word\/(?:document|header\d+|footer\d+)\.xml$/u,
  );
  const stylesXml = combinedXml(entries, /^word\/styles\.xml$/u);
  const imageMetrics = imageDescriptionMetrics(documentXml, "word");
  const headingMarkers =
    countMatches(
      documentXml,
      /<(?:\w+:)?pStyle\b[^>]*(?:\w+:)?val\s*=\s*["']Heading[^"']*["'][^>]*>/giu,
    ) +
    countMatches(
      documentXml,
      /<(?:\w+:)?outlineLvl\b[^>]*(?:\w+:)?val\s*=\s*["']\d+["'][^>]*>/giu,
    );
  const languageMarkers = countMatches(
    `${stylesXml}\n${documentXml}`,
    /<(?:\w+:)?lang\b[^>]*(?:\w+:)?val\s*=\s*["'][^"']+["'][^>]*>/giu,
  );
  const tableCount = countMatches(
    documentXml,
    /<(?:\w+:)?tbl(?=[\s>])[^>]*>/giu,
  );
  const headerRows = countMatches(
    documentXml,
    /<(?:\w+:)?tblHeader(?=[\s/>])[^>]*>/giu,
  );

  return [
    titleCheck(entries),
    check(
      "default-language",
      "Default language marker",
      languageMarkers ? "present" : "review",
      languageMarkers,
      languageMarkers
        ? "Word language metadata was observed in inspected XML."
        : "No Word language marker was observed; verify proofing language and language changes manually.",
    ),
    check(
      "heading-structure",
      "Heading structure markers",
      headingMarkers ? "present" : "review",
      headingMarkers,
      headingMarkers
        ? "Heading-style or outline-level markers were observed."
        : "No heading-style or outline-level marker was observed; a short document may legitimately need none.",
    ),
    check(
      "image-descriptions",
      "Drawing description metadata",
      imageMetrics.missing ? "review" : "present",
      imageMetrics.missing,
      imageMetrics.objects
        ? `${imageMetrics.described} of ${imageMetrics.objects} drawing object(s) had non-empty title or description metadata; decorative intent still needs manual review.`
        : "No Word drawing metadata objects were observed in the inspected parts.",
    ),
    check(
      "table-headers",
      "Table header-row markers",
      tableCount > headerRows ? "review" : "present",
      Math.max(0, tableCount - headerRows),
      tableCount
        ? `${headerRows} header-row marker(s) were observed across ${tableCount} table(s); this count cannot verify individual table semantics.`
        : "No Word table markers were observed.",
    ),
    check(
      "reading-order",
      "Reading order and visual layout",
      "manual",
      0,
      "Columns, text boxes, floating objects, and final reading order require inspection in the authoring application and assistive technology.",
    ),
  ];
}

function slideHasTitle(xml) {
  return /<(?:\w+:)?ph\b[^>]*(?:\w+:)?type\s*=\s*["'](?:title|ctrTitle)["'][^>]*>/iu.test(
    String(xml || ""),
  );
}

function inspectPresentation(entries) {
  const slides = matchingXml(entries, /^ppt\/slides\/slide\d+\.xml$/u);
  const drawingXml = combinedXml(
    entries,
    /^(?:ppt\/slides\/slide\d+|ppt\/slideLayouts\/slideLayout\d+)\.xml$/u,
  );
  const imageMetrics = imageDescriptionMetrics(drawingXml, "presentation");
  const missingSlideTitles = slides.filter((xml) => !slideHasTitle(xml)).length;
  const languageMarkers = countMatches(
    combinedXml(
      entries,
      /^ppt\/(?:slides\/slide\d+|slideMasters\/slideMaster\d+|presentation)\.xml$/u,
    ),
    /\blang\s*=\s*["'][^"']+["']/giu,
  );
  const tableCount = countMatches(
    drawingXml,
    /<(?:\w+:)?tbl(?=[\s>])[^>]*>/giu,
  );

  return [
    titleCheck(entries),
    check(
      "default-language",
      "Language metadata",
      languageMarkers ? "present" : "review",
      languageMarkers,
      languageMarkers
        ? "Language attributes were observed in presentation text metadata."
        : "No language attribute was observed in the inspected presentation parts.",
    ),
    check(
      "slide-titles",
      "Slide title placeholders",
      missingSlideTitles ? "review" : "present",
      missingSlideTitles,
      slides.length
        ? `${slides.length - missingSlideTitles} of ${slides.length} slide(s) exposed a title placeholder marker.`
        : "No slide parts were available for this check.",
    ),
    check(
      "image-descriptions",
      "Picture description metadata",
      imageMetrics.missing ? "review" : "present",
      imageMetrics.missing,
      imageMetrics.objects
        ? `${imageMetrics.described} of ${imageMetrics.objects} picture object(s) had non-empty title or description metadata.`
        : "No picture metadata objects were observed in the inspected parts.",
    ),
    check(
      "table-structure",
      "Presentation tables",
      tableCount ? "manual" : "present",
      tableCount,
      tableCount
        ? "Presentation tables were observed; header identification and reading order require manual review."
        : "No presentation table markers were observed.",
    ),
    check(
      "reading-order",
      "Object reading order",
      "manual",
      slides.length,
      "XML package order is not a reliable assistive-technology reading-order verdict; inspect every slide in the authoring application.",
    ),
  ];
}

function inspectSpreadsheet(entries) {
  const workbook =
    entryPairs(entries).find(
      ([name]) => String(name).toLowerCase() === "xl/workbook.xml",
    )?.[1] || "";
  const drawings = combinedXml(entries, /^xl\/drawings\/drawing\d+\.xml$/u);
  const imageMetrics = imageDescriptionMetrics(drawings, "spreadsheet");
  const sheetTags = String(workbook).match(/<(?:\w+:)?sheet\b[^>]*>/giu) || [];
  const genericSheetNames = sheetTags.filter((tag) =>
    /^(?:sheet|worksheet)\s*\d*$/iu.test(
      String(tagAttribute(tag, "name") || "").trim(),
    ),
  ).length;
  const hiddenSheets = sheetTags.filter((tag) =>
    /^(?:hidden|veryHidden)$/u.test(tagAttribute(tag, "state") || ""),
  ).length;
  const tables = matchingXml(entries, /^xl\/tables\/table\d+\.xml$/u);
  const tablesWithoutHeaders = tables.filter((xml) =>
    /\bheaderRowCount\s*=\s*["']0["']/iu.test(xml),
  ).length;

  return [
    titleCheck(entries),
    check(
      "sheet-names",
      "Descriptive worksheet names",
      genericSheetNames ? "review" : "present",
      genericSheetNames,
      sheetTags.length
        ? `${genericSheetNames} of ${sheetTags.length} worksheet name(s) matched a generic Sheet/Worksheet pattern; meaning still requires manual review.`
        : "No worksheet declarations were observed.",
    ),
    check(
      "hidden-sheets",
      "Hidden worksheet context",
      hiddenSheets ? "manual" : "present",
      hiddenSheets,
      hiddenSheets
        ? "Hidden sheets were observed; verify that essential information is available and documented appropriately."
        : "No hidden worksheet state was observed.",
    ),
    check(
      "image-descriptions",
      "Picture description metadata",
      imageMetrics.missing ? "review" : "present",
      imageMetrics.missing,
      imageMetrics.objects
        ? `${imageMetrics.described} of ${imageMetrics.objects} picture object(s) had non-empty title or description metadata.`
        : "No spreadsheet picture metadata objects were observed.",
    ),
    check(
      "table-headers",
      "Structured-table header markers",
      tablesWithoutHeaders ? "review" : "present",
      tablesWithoutHeaders,
      tables.length
        ? `${tablesWithoutHeaders} of ${tables.length} structured table(s) explicitly disabled header rows. Ordinary cell ranges are not covered.`
        : "No structured table parts were observed; ordinary cell ranges require manual review.",
    ),
    check(
      "reading-order",
      "Cell order, merged cells, and instructions",
      "manual",
      sheetTags.length,
      "Logical navigation, merged cells, color-only meaning, formulas, charts, and instruction placement require manual review.",
    ),
  ];
}

export function inspectOoxmlEntries(entries, family, metadata = {}) {
  if (!["word", "spreadsheet", "presentation"].includes(family)) {
    return { ok: false, error: "The OOXML package family is unsupported." };
  }
  const checks =
    family === "word"
      ? inspectWord(entries)
      : family === "presentation"
        ? inspectPresentation(entries)
        : inspectSpreadsheet(entries);
  return buildResult({
    format: family,
    checks,
    inspectedParts: finite(metadata.inspectedParts, entryPairs(entries).length),
    skippedParts: finite(metadata.skippedParts, 0),
    warnings: metadata.warnings || [],
  });
}

function pdfMarkerCount(source, expression) {
  return countMatches(source, expression);
}

/**
 * Extract the body of the Info dictionary object referenced by the trailer's
 * `/Info N G R` indirect reference, so title metadata can be scoped to the
 * document's actual Info dictionary instead of matching any `/Title` key
 * anywhere in the raw byte stream (including inside unrelated bookmark or
 * outline item dictionaries).
 */
function extractInfoDict(source) {
  const ref = String(source || "").match(/\/Info\s+(\d+)\s+(\d+)\s+R/u);
  if (!ref) return "";
  const [, num, gen] = ref;
  const body = String(source || "").match(
    new RegExp(`\\b${num}\\s+${gen}\\s+obj([\\s\\S]*?)endobj`, "u"),
  );
  return body?.[1] || "";
}

export function inspectPdfMarkers(bytesInput) {
  const bytes =
    bytesInput instanceof Uint8Array
      ? bytesInput
      : new Uint8Array(bytesInput || new ArrayBuffer(0));
  if (bytes.byteLength < 5) {
    return { ok: false, error: "The PDF is empty or incomplete." };
  }
  const header = new TextDecoder("latin1").decode(bytes.slice(0, 8));
  if (!header.startsWith("%PDF-")) {
    return { ok: false, error: "The file does not have a PDF signature." };
  }
  const source = new TextDecoder("latin1").decode(bytes);
  const tagged = /\/StructTreeRoot\b/u.test(source);
  const marked = /\/Marked\s+true\b/u.test(source);
  const infoDict = extractInfoDict(source);
  const language = /\/Lang\s*(?:\(|<)/u.test(source);
  const title = /\/Title\s*(?:\(|<)/u.test(infoDict);
  const outlines = /\/Outlines\b/u.test(source);
  const imageObjects = pdfMarkerCount(source, /\/Subtype\s*\/Image\b/gu);
  const altEntries = pdfMarkerCount(source, /\/Alt\s*(?:\(|<)/gu);
  const encrypted = /\/Encrypt\b/u.test(source);

  const checks = [
    check(
      "tagged-structure",
      "Tagged structure markers",
      tagged && marked ? "present" : "review",
      Number(tagged) + Number(marked),
      tagged && marked
        ? "StructTreeRoot and Marked=true markers were observed."
        : "A complete tagged-structure marker pair was not observable in the raw PDF scan.",
    ),
    check(
      "default-language",
      "Default language marker",
      language ? "present" : "review",
      Number(language),
      language
        ? "A /Lang marker was observed somewhere in the file; its location as the document's default language was not verified."
        : "A /Lang marker was not observable in the raw PDF scan.",
    ),
    check(
      "document-title",
      "Document title marker",
      title ? "present" : "review",
      Number(title),
      title
        ? "A /Title marker was observed; descriptiveness is not assessed."
        : "A /Title marker was not observable in the raw PDF scan.",
    ),
    check(
      "image-alternatives",
      "Image and alternative-text markers",
      imageObjects && !altEntries ? "review" : "manual",
      Math.max(0, imageObjects - altEntries),
      `${imageObjects} image object marker(s) and ${altEntries} /Alt marker(s) were observed; compressed objects and tag relationships prevent one-to-one verification.`,
    ),
    check(
      "bookmarks",
      "Bookmark or outline marker",
      outlines ? "present" : "manual",
      Number(outlines),
      outlines
        ? "An /Outlines marker was observed."
        : "No /Outlines marker was observable; whether bookmarks are needed depends on document length and navigation needs.",
    ),
    check(
      "reading-order",
      "Reading order and semantics",
      "manual",
      0,
      "Raw marker scanning cannot validate reading order, heading hierarchy, tables, forms, artifacts, or actual assistive-technology output.",
    ),
  ];
  const warnings = [
    "PDF markers inside compressed object streams may be invisible to this bounded raw scan, so absence is not proof that a feature is missing.",
  ];
  if (encrypted) {
    warnings.push(
      "An encryption marker was observed; structural results may be incomplete.",
    );
  }
  return buildResult({
    format: "pdf",
    checks,
    inspectedParts: 1,
    skippedParts: 0,
    warnings,
  });
}

function buildResult({
  format,
  checks,
  inspectedParts,
  skippedParts,
  warnings,
}) {
  const statusCounts = {
    present: checks.filter(({ status }) => status === "present").length,
    review: checks.filter(({ status }) => status === "review").length,
    manual: checks.filter(({ status }) => status === "manual").length,
  };
  return {
    ok: true,
    format,
    formatLabel: FORMAT_LABELS[format],
    checks,
    statusCounts,
    inspectedParts,
    skippedParts,
    warnings: [...warnings],
    limitations: [
      "This static screen reports observable package or byte markers, not document accessibility or WCAG conformance.",
      "A present marker can be incorrect, irrelevant, or poorly written; an absent marker may be hidden in compressed or skipped content.",
      "Visual order, meaning, color use, typography, keyboard behavior, assistive-technology output, and content quality require human testing.",
      "Resaving, converting, flattening, encryption, corruption, and unsupported features can change what is observable.",
    ],
  };
}

function declaredUncompressedSize(entry) {
  const value = Number(entry?._data?.uncompressedSize);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function isRelevantXml(name, family) {
  const lower = String(name || "")
    .replace(/\\/gu, "/")
    .toLowerCase();
  if (lower === "docprops/core.xml") return true;
  if (family === "word") {
    return /^word\/(?:document|styles|header\d+|footer\d+)\.xml$/u.test(lower);
  }
  if (family === "presentation") {
    return /^ppt\/(?:presentation|slides\/slide\d+|slidemasters\/slidemaster\d+|slidelayouts\/slidelayout\d+)\.xml$/u.test(
      lower,
    );
  }
  return /^xl\/(?:workbook|drawings\/drawing\d+|tables\/table\d+)\.xml$/u.test(
    lower,
  );
}

export async function inspectDocumentBytes(bytesInput, options = {}) {
  const validation = validateDocumentFile({
    name: options.fileName,
    size: options.fileSize,
  });
  if (!validation.ok) return validation;
  const bytes =
    bytesInput instanceof Uint8Array
      ? bytesInput
      : new Uint8Array(bytesInput || new ArrayBuffer(0));
  if (
    !bytes.byteLength ||
    bytes.byteLength > DOCUMENT_LIMITS.fileBytes ||
    bytes.byteLength !== validation.bytes
  ) {
    return {
      ok: false,
      error: "The bytes do not match the validated document size.",
    };
  }
  if (validation.format === "pdf") return inspectPdfMarkers(bytes);

  try {
    preflightZipStructure(bytes, {
      maximumEntries: DOCUMENT_LIMITS.packageEntries,
    });
    const zip = await JSZip.loadAsync(bytes, {
      checkCRC32: false,
      createFolders: false,
    });
    const archiveEntries = Object.values(zip.files).filter(
      (entry) => !entry.dir,
    );
    if (archiveEntries.length > DOCUMENT_LIMITS.packageEntries) {
      return {
        ok: false,
        error: "The Office package exceeds the 3,000-entry safety limit.",
      };
    }

    let declaredTotal = 0;
    let unknownSizes = 0;
    for (const entry of archiveEntries) {
      const size = declaredUncompressedSize(entry);
      if (size === null) unknownSizes += 1;
      else declaredTotal += size;
    }
    if (declaredTotal > DOCUMENT_LIMITS.uncompressedBytes) {
      return {
        ok: false,
        error: "The Office package exceeds the 80 MB expanded-size limit.",
      };
    }

    const entries = {};
    let inspectedParts = 0;
    let skippedParts = 0;
    let actualXmlBytes = 0;
    let boundedFailures = 0;
    const relevantEntries = archiveEntries.filter((entry) =>
      isRelevantXml(entry.name, validation.format),
    );
    for (let index = 0; index < relevantEntries.length; index += 1) {
      const entry = relevantEntries[index];
      const declared = declaredUncompressedSize(entry);
      if (
        declared === null ||
        declared > DOCUMENT_LIMITS.xmlPartBytes ||
        inspectedParts >= DOCUMENT_LIMITS.xmlParts
      ) {
        skippedParts += 1;
        continue;
      }

      const remainingXmlBytes =
        DOCUMENT_LIMITS.inspectedXmlBytes - actualXmlBytes;
      if (remainingXmlBytes <= 0) {
        skippedParts += relevantEntries.length - index;
        break;
      }
      try {
        const extracted = await readBoundedZipText(entry, {
          maximumBytes: Math.min(
            DOCUMENT_LIMITS.xmlPartBytes,
            remainingXmlBytes,
          ),
          label: entry.name,
        });
        actualXmlBytes += extracted.inflatedBytes;
        entries[String(entry.name).replace(/\\/gu, "/")] = extracted.text;
        inspectedParts += 1;
      } catch {
        boundedFailures += 1;
        skippedParts += 1;
      }
    }

    const warnings = [];
    if (unknownSizes) {
      warnings.push(
        `${unknownSizes} package part(s) lacked a usable declared size; relevant unknown-size XML was skipped.`,
      );
    }
    if (skippedParts) {
      warnings.push(
        `${skippedParts} relevant XML part(s) exceeded a safety bound and were not inspected.`,
      );
    }
    if (boundedFailures) {
      warnings.push(
        `${boundedFailures} relevant XML part(s) exceeded an actual expanded-byte limit or could not be streamed safely.`,
      );
    }
    return inspectOoxmlEntries(entries, validation.format, {
      inspectedParts,
      skippedParts,
      warnings,
    });
  } catch {
    return {
      ok: false,
      error:
        "The Office file could not be opened as an unencrypted OOXML package.",
    };
  }
}

export function buildAccessibilityCountsReport(
  result,
  createdAt = new Date().toISOString(),
) {
  if (!result?.ok) return null;
  return {
    schema: "altftool.accessible-document-checker.v1",
    createdAt,
    createdAtMeaning: "Time this local counts-only summary was generated.",
    format: result.format,
    inspectedParts: result.inspectedParts,
    skippedParts: result.skippedParts,
    statusCounts: { ...result.statusCounts },
    checks: result.checks.map(({ id, status, observed }) => ({
      id,
      status,
      observed,
    })),
    warningCount: result.warnings.length,
    scope: {
      fileNameIncluded: false,
      documentTextIncluded: false,
      metadataValuesIncluded: false,
      wcagConformanceEstablished: false,
      assistiveTechnologyTested: false,
    },
  };
}
