import JSZip from "jszip";

import {
  PDF_OPERATION_TIMEOUTS,
  createPdfCleanup,
  createPdfOperationGuard,
} from "../../../platform/files/boundedPdfOperations.mjs";
import { preflightZipStructure } from "../../../platform/files/preflightZipStructure.mjs";
import { readBoundedZipText } from "../../../platform/files/readBoundedZipText.mjs";
import { PRIVATE_CHAT_LIMITS, extensionOf } from "./privateRetrieval.mjs";

const TEXT_EXTENSIONS = new Set(["txt", "md", "markdown", "csv", "json"]);
const DOCX_ENTRY_LIMIT = 2_000;
const DOCX_EXPANDED_LIMIT = 40 * 1024 * 1024;
const DOCX_XML_PART_LIMIT = 2 * 1024 * 1024;
const DOCX_XML_TOTAL_LIMIT = 8 * 1024 * 1024;
const DOCX_TEXT_PARTS_LIMIT = 64;

function boundedText(value, remainingCharacters) {
  const text = String(value || "")
    .replace(/\r\n?/gu, "\n")
    .trim();
  const maximum = Math.min(
    PRIVATE_CHAT_LIMITS.documentCharacters,
    Math.max(0, remainingCharacters),
  );
  if (text.length > maximum) {
    throw new Error(
      "Extracted text exceeds the remaining private index character limit.",
    );
  }
  return text;
}

function appendPdfItems(parts, items, remaining) {
  let length = parts.reduce((total, part) => total + part.length, 0);
  for (const item of items || []) {
    if (length >= remaining) return false;
    const raw = typeof item?.str === "string" ? item.str : "";
    const normalized = raw.replace(/\s+/gu, " ").trim();
    if (normalized) {
      const prefix = length ? " " : "";
      const addition = `${prefix}${normalized}`;
      const available = remaining - length;
      parts.push(addition.slice(0, available));
      length += Math.min(addition.length, available);
      if (addition.length > available) return false;
    }
    if (item?.hasEOL && length < remaining) {
      parts.push("\n");
      length += 1;
    }
  }
  return length < remaining;
}

function guardedPdfTextReader(reader, guard, pageNumber) {
  const cancel = createPdfCleanup(() => reader.cancel?.());
  return {
    read() {
      return guard.run(() => reader.read(), {
        label: `PDF page ${pageNumber} text streaming`,
        timeoutMilliseconds: PDF_OPERATION_TIMEOUTS.streamReadMilliseconds,
        cancellationMessage: "Indexing was cancelled.",
        onInterrupt: cancel,
      });
    },
    cancel() {
      return guard.settleCleanup(cancel);
    },
  };
}

async function extractPdf(file, remainingCharacters, shouldContinue) {
  const guard = createPdfOperationGuard({ shouldContinue });
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    isEvalSupported: false,
    useWorkerFetch: false,
    disableAutoFetch: true,
  });
  const destroyLoadingTask = createPdfCleanup(() => loadingTask.destroy());
  let pdf = null;
  let destroyPdf = null;

  try {
    pdf = await guard.run(() => loadingTask.promise, {
      label: "PDF loading",
      timeoutMilliseconds: PDF_OPERATION_TIMEOUTS.loadingMilliseconds,
      cancellationMessage: "Indexing was cancelled.",
      onInterrupt: destroyLoadingTask,
      onLateResolve: (latePdf) => latePdf?.destroy?.(),
    });
    destroyPdf = createPdfCleanup(() => pdf.destroy());
    const pageCount = pdf.numPages;
    const pageLimit = Math.min(pageCount, PRIVATE_CHAT_LIMITS.sections);
    const sections = [];
    let remaining = Math.min(
      PRIVATE_CHAT_LIMITS.documentCharacters,
      remainingCharacters,
    );
    let truncated = false;

    for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
      if (!shouldContinue()) throw new Error("Indexing was cancelled.");
      if (remaining <= 0) {
        truncated = true;
        break;
      }
      const page = await guard.run(() => pdf.getPage(pageNumber), {
        label: `PDF page ${pageNumber} loading`,
        timeoutMilliseconds: PDF_OPERATION_TIMEOUTS.getPageMilliseconds,
        cancellationMessage: "Indexing was cancelled.",
        onInterrupt: destroyPdf,
        onLateResolve: (latePage) => latePage?.cleanup?.(),
      });
      const parts = [];
      try {
        if (typeof page.streamTextContent === "function") {
          const reader = guardedPdfTextReader(
            page.streamTextContent().getReader(),
            guard,
            pageNumber,
          );
          let completed = false;
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) {
                completed = true;
                break;
              }
              if (!appendPdfItems(parts, value?.items, remaining)) {
                truncated = true;
                break;
              }
            }
          } finally {
            if (!completed) await reader.cancel();
          }
        } else {
          const content = await guard.run(() => page.getTextContent(), {
            label: `PDF page ${pageNumber} text extraction`,
            timeoutMilliseconds: PDF_OPERATION_TIMEOUTS.textContentMilliseconds,
            cancellationMessage: "Indexing was cancelled.",
            onInterrupt: destroyPdf,
          });
          if (!appendPdfItems(parts, content.items, remaining))
            truncated = true;
        }
      } finally {
        try {
          page.cleanup();
        } catch {
          // Document destruction below remains the final cleanup boundary.
        }
      }
      const text = parts.join("").trim();
      if (text) {
        sections.push({ label: `Page ${pageNumber}`, text });
        remaining -= text.length;
      }
      if (truncated) break;
    }

    if (!sections.length) {
      throw new Error(
        "No usable PDF text layer was found. Run local OCR first for scanned PDFs.",
      );
    }
    const warnings = [];
    if (pageCount > pageLimit) {
      warnings.push(
        `Only the first ${pageLimit} of ${pageCount} PDF pages were indexed.`,
      );
    }
    if (truncated) {
      warnings.push(
        "PDF extraction reached the local character limit; remaining text was not indexed.",
      );
    }
    return { sections, format: "PDF", warnings };
  } finally {
    await guard.settleCleanup(destroyPdf || destroyLoadingTask);
  }
}

async function openDocxArchive(arrayBuffer) {
  preflightZipStructure(arrayBuffer, {
    maximumEntries: DOCX_ENTRY_LIMIT,
  });
  const zip = await JSZip.loadAsync(arrayBuffer, {
    checkCRC32: false,
    createFolders: false,
  });
  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  if (entries.length > DOCX_ENTRY_LIMIT) {
    throw new Error("The DOCX package exceeds the 2,000-entry safety limit.");
  }
  let total = 0;
  for (const entry of entries) {
    const size = Number(entry?._data?.uncompressedSize);
    if (!Number.isFinite(size) || size < 0) {
      throw new Error(
        "The DOCX package contains an entry without a usable expanded size.",
      );
    }
    total += size;
    if (total > DOCX_EXPANDED_LIMIT) {
      throw new Error(
        "The DOCX package exceeds the 40 MB expanded-size limit.",
      );
    }
  }
  if (!zip.file("word/document.xml")) {
    throw new Error("The file is not a recognizable DOCX package.");
  }
  return {
    zip,
    entries,
    summary: { entries: entries.length, expandedBytes: total },
  };
}

export async function preflightDocxArchive(arrayBuffer) {
  const { summary } = await openDocxArchive(arrayBuffer);
  return summary;
}

function decodeXmlEntities(value) {
  return String(value || "")
    .replace(/&#x([0-9a-f]+);/giu, (match, hex) => {
      const codePoint = Number.parseInt(hex, 16);
      try {
        return Number.isSafeInteger(codePoint)
          ? String.fromCodePoint(codePoint)
          : match;
      } catch {
        return match;
      }
    })
    .replace(/&#(\d+);/gu, (match, decimal) => {
      const codePoint = Number.parseInt(decimal, 10);
      try {
        return Number.isSafeInteger(codePoint)
          ? String.fromCodePoint(codePoint)
          : match;
      } catch {
        return match;
      }
    })
    .replace(/&lt;/giu, "<")
    .replace(/&gt;/giu, ">")
    .replace(/&quot;/giu, '"')
    .replace(/&apos;/giu, "'")
    .replace(/&amp;/giu, "&");
}

function docxXmlToText(xml) {
  const separated = String(xml || "")
    .replace(/<w:instrText\b[^>]*>[\s\S]*?<\/w:instrText\s*>/giu, "")
    .replace(/<w:(?:br|cr)\b[^>]*\/>/giu, "\n")
    .replace(/<w:tab\b[^>]*\/>/giu, "\t")
    .replace(/<\/w:tc\s*>/giu, "\t")
    .replace(/<\/w:(?:p|tr)\s*>/giu, "\n")
    .replace(/<[^>]+>/gu, "");
  return decodeXmlEntities(separated)
    .replace(/\u00a0/gu, " ")
    .replace(/[ \t]+\n/gu, "\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

function isDocxTextPart(name) {
  return /^word\/(?:document|header\d+|footer\d+|footnotes|endnotes)\.xml$/iu.test(
    String(name || "").replace(/\\/gu, "/"),
  );
}

async function extractDocx(
  file,
  remainingCharacters,
  shouldContinue = () => true,
) {
  const arrayBuffer = await file.arrayBuffer();
  const archive = await openDocxArchive(arrayBuffer);
  const textEntries = archive.entries
    .filter((entry) => isDocxTextPart(entry.name))
    .sort((first, second) => {
      if (first.name === "word/document.xml") return -1;
      if (second.name === "word/document.xml") return 1;
      return first.name.localeCompare(second.name, "en");
    });
  if (textEntries.length > DOCX_TEXT_PARTS_LIMIT) {
    throw new Error(
      `The DOCX contains more than ${DOCX_TEXT_PARTS_LIMIT} text-bearing parts.`,
    );
  }

  const parts = [];
  let inflatedXmlBytes = 0;
  for (const entry of textEntries) {
    if (!shouldContinue()) throw new Error("Indexing was cancelled.");
    const remainingXmlBytes = DOCX_XML_TOTAL_LIMIT - inflatedXmlBytes;
    if (remainingXmlBytes <= 0) {
      throw new Error("The DOCX exceeds the 8 MB actual expanded-XML limit.");
    }
    const extracted = await readBoundedZipText(entry, {
      maximumBytes: Math.min(DOCX_XML_PART_LIMIT, remainingXmlBytes),
      shouldContinue,
      label: entry.name,
    });
    inflatedXmlBytes += extracted.inflatedBytes;
    const part = docxXmlToText(extracted.text);
    if (part) parts.push(part);
  }

  const text = boundedText(parts.join("\n\n"), remainingCharacters);
  if (!text) throw new Error("No usable DOCX text was found.");
  return {
    sections: [{ label: "Document text", text }],
    format: "DOCX",
    warnings: [],
  };
}

async function extractText(file, remainingCharacters, extension) {
  const text = boundedText(await file.text(), remainingCharacters);
  if (!text) throw new Error("No usable text was found.");
  return {
    sections: [{ label: "Document text", text }],
    format: extension.toUpperCase(),
    warnings: [],
  };
}

export async function extractPrivateDocument(
  file,
  { remainingCharacters, shouldContinue = () => true } = {},
) {
  if (!shouldContinue()) throw new Error("Indexing was cancelled.");
  const extension = extensionOf(file?.name);
  if (TEXT_EXTENSIONS.has(extension)) {
    return extractText(file, remainingCharacters, extension);
  }
  if (extension === "docx") {
    return extractDocx(file, remainingCharacters, shouldContinue);
  }
  if (extension === "pdf") {
    return extractPdf(file, remainingCharacters, shouldContinue);
  }
  throw new Error("This document type is unsupported.");
}
