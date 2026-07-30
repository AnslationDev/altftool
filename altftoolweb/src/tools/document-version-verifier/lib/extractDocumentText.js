import { MAX_SOURCE_CHARACTERS } from "./compareVersions.mjs";
import { calculateDocumentHashes } from "./documentHasher.js";

export const MAX_DOCUMENT_FILE_BYTES = 200 * 1024 * 1024; // 200 MB limit per prompt specification
export const MAX_PDF_PAGES = 100;

const EXTENSION_FORMATS = {
  txt: "text",
  md: "markdown",
  markdown: "markdown",
  json: "json",
  csv: "csv",
  pdf: "text",
  docx: "text",
  doc: "text",
  rtf: "text",
  xml: "text",
  html: "text",
  htm: "text",
};

function extensionOf(filename) {
  return String(filename || "")
    .toLowerCase()
    .split(".")
    .pop();
}

function validateFile(file) {
  if (!file) throw new Error("Choose a local document.");
  const extension = extensionOf(file.name);
  const format = EXTENSION_FORMATS[extension] || "text";
  if (file.size > MAX_DOCUMENT_FILE_BYTES) {
    throw new Error(`File '${file.name}' exceeds maximum limit of 200 MB.`);
  }
  return { extension, format };
}

function createBoundedPdfTextCollector(maxCharacters) {
  const limit = Math.max(0, Number(maxCharacters) || 0);
  const parts = [];
  let buffer = "";
  let length = 0;
  let pendingWhitespace = "";
  let pendingWhitespaceOverflow = false;
  let horizontalRunLength = 0;
  let firstHorizontalCharacter = "";
  let hasContent = false;
  let truncated = false;
  let finished = false;

  const commit = (value) => {
    if (!value) return;
    buffer += value;
    length += value.length;
    if (buffer.length >= 8_192) {
      parts.push(buffer);
      buffer = "";
    }
  };

  const queueNormalizedCharacter = (character) => {
    if (/^\s$/u.test(character)) {
      if (!hasContent) return true;
      const pendingLimit = Math.max(0, limit - length + 1);
      const pendingRoom = pendingLimit - pendingWhitespace.length;
      if (pendingRoom > 0) {
        pendingWhitespace += character.slice(0, pendingRoom);
      }
      if (pendingRoom < character.length) {
        pendingWhitespaceOverflow = true;
      }
      return true;
    }

    hasContent = true;
    const remaining = Math.max(0, limit - length);
    const addition = `${pendingWhitespace}${character}`;
    if (pendingWhitespaceOverflow || addition.length > remaining) {
      commit(addition.slice(0, remaining));
      truncated = true;
      return false;
    }

    commit(addition);
    pendingWhitespace = "";
    pendingWhitespaceOverflow = false;
    return true;
  };

  const flushHorizontalRun = (beforeNewline) => {
    if (!horizontalRunLength) return true;
    const normalized = beforeNewline
      ? ""
      : horizontalRunLength === 1
        ? firstHorizontalCharacter
        : " ";
    horizontalRunLength = 0;
    firstHorizontalCharacter = "";
    return normalized ? queueNormalizedCharacter(normalized) : true;
  };

  const addRawCharacter = (character) => {
    if (character === " " || character === "\t") {
      if (!horizontalRunLength) firstHorizontalCharacter = character;
      horizontalRunLength += 1;
      return true;
    }
    if (!flushHorizontalRun(character === "\n")) return false;
    return queueNormalizedCharacter(character);
  };

  const addItems = (items = [], onItem) => {
    if (truncated || finished) return false;
    for (const item of items) {
      onItem?.(item);
      const text = typeof item?.str === "string" ? item.str : "";
      for (const character of text) {
        if (!addRawCharacter(character)) return false;
      }
      if (!addRawCharacter(item?.hasEOL ? "\n" : " ")) return false;
    }
    return true;
  };

  const result = () => {
    if (!finished) {
      finished = true;
      if (!truncated) flushHorizontalRun(false);
      if (buffer) parts.push(buffer);
    }
    return {
      text: parts.join(""),
      truncated,
    };
  };

  return { addItems, result };
}

export function collectBoundedPdfTextItems(
  items,
  maxCharacters = MAX_SOURCE_CHARACTERS,
) {
  const collector = createBoundedPdfTextCollector(maxCharacters);
  collector.addItems(items);
  return collector.result();
}

async function extractBoundedPdfPageText(page, maxCharacters, onItem) {
  const collector = createBoundedPdfTextCollector(maxCharacters);

  if (typeof page.streamTextContent === "function") {
    const reader = page.streamTextContent().getReader();
    let shouldCancel = false;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!collector.addItems(value?.items || [], onItem)) {
          shouldCancel = true;
          break;
        }
      }
    } finally {
      if (shouldCancel) {
        try {
          await reader.cancel();
        } catch {
          // The page is cleaned up by the caller even if the stream closed.
        }
      }
    }
    return collector.result();
  }

  const content = await page.getTextContent();
  collector.addItems(content.items, onItem);
  return collector.result();
}

// Bounded PDF text extraction using pdfjs-dist
async function extractPdfDocument(file) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(arrayBuffer),
    isEvalSupported: false,
    useWorkerFetch: false,
    disableAutoFetch: true,
  });

  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;
  const eligiblePages = Math.min(pageCount, MAX_PDF_PAGES);

  let fullText = "";
  const fontList = new Set();
  let extractedPages = 0;
  let textTruncated = false;

  for (let p = 1; p <= eligiblePages; p++) {
    const pageHeader = `--- Page ${p} ---\n`;
    const availableForPage =
      MAX_SOURCE_CHARACTERS - fullText.length - pageHeader.length - 2;
    if (availableForPage <= 0) {
      textTruncated = true;
      break;
    }

    const page = await pdfDoc.getPage(p);
    try {
      const pageText = await extractBoundedPdfPageText(
        page,
        availableForPage,
        (item) => {
          if (item?.fontName) fontList.add(item.fontName);
        },
      );
      extractedPages += 1;
      fullText += `${pageHeader}${pageText.text}\n\n`;
      if (pageText.truncated) {
        textTruncated = true;
        break;
      }
    } finally {
      page.cleanup();
    }
  }

  // Extract PDF Metadata if available
  let metaObj = {};
  try {
    const metadata = await pdfDoc.getMetadata();
    if (metadata?.info) {
      metaObj = {
        title: metadata.info.Title || "",
        author: metadata.info.Author || "",
        creator: metadata.info.Creator || "",
        producer: metadata.info.Producer || "",
        createdDate: metadata.info.CreationDate || "",
        modifiedDate: metadata.info.ModDate || "",
        pdfVersion: metadata.info.PDFFormatVersion || "1.7",
      };
    }
  } catch (err) {
    console.warn("Could not read PDF metadata:", err);
  }

  await pdfDoc.destroy();

  const words = fullText.split(/\s+/).filter(Boolean).length;
  const chars = fullText.length;
  const lines = fullText.split("\n").length;

  return {
    text: fullText,
    sourceType: "PDF Document",
    pageCount,
    extractedPages,
    metadata: {
      filename: file.name,
      extension: "pdf",
      fileSize: file.size,
      createdDate: metaObj.createdDate || new Date(file.lastModified).toISOString(),
      modifiedDate: metaObj.modifiedDate || new Date(file.lastModified).toISOString(),
      author: metaObj.author || "Unknown",
      creator: metaObj.creator || "PDF Engine",
      producer: metaObj.producer || "PDF Producer",
      pdfVersion: metaObj.pdfVersion || "1.7",
      wordCount: words,
      characterCount: chars,
      pageCount,
      paragraphCount: lines,
      imageCount: 0,
      tableCount: 0,
      fonts: Array.from(fontList).slice(0, 10),
    },
    warnings: [
      ...(pageCount > MAX_PDF_PAGES
        ? [`Reading limited to first ${MAX_PDF_PAGES} pages.`]
        : []),
      ...(textTruncated
        ? [
            `Extracted PDF text reached the ${MAX_SOURCE_CHARACTERS.toLocaleString("en-US")}-character comparison limit.`,
          ]
        : []),
    ],
  };
}

// DOCX parsing via Mammoth & JSZip
async function extractDocxDocument(file) {
  const arrayBuffer = await file.arrayBuffer();

  let text = "";
  let warnings = [];
  try {
    const mammoth = await import("mammoth");
    const res = await mammoth.extractRawText({ arrayBuffer });
    text = res.value || "";
    if (res.messages?.length) {
      warnings = res.messages.map((m) => m.message);
    }
  } catch (err) {
    text = await file.text();
  }

  // Inspect zip for metadata & images
  let imageCount = 0;
  let tableCount = 0;
  let creator = "Microsoft Word";
  let author = "Unknown";
  let createdDate = new Date(file.lastModified).toISOString();
  let modifiedDate = new Date(file.lastModified).toISOString();

  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Count images in word/media/
    imageCount = Object.keys(zip.files).filter((path) => path.startsWith("word/media/")).length;

    // Check core.xml for metadata
    const coreXmlFile = zip.file("docProps/core.xml");
    if (coreXmlFile) {
      const coreXml = await coreXmlFile.async("text");
      const creatorMatch = coreXml.match(/<dc:creator>([^<]+)<\/dc:creator>/);
      if (creatorMatch) author = creatorMatch[1];
      const appMatch = coreXml.match(/<cp:lastModifiedBy>([^<]+)<\/cp:lastModifiedBy>/);
      if (appMatch) creator = `Word (by ${appMatch[1]})`;
      const createdMatch = coreXml.match(/<dcterms:created[^>]*>([^<]+)<\/dcterms:created>/);
      if (createdMatch) createdDate = createdMatch[1];
      const modifiedMatch = coreXml.match(/<dcterms:modified[^>]*>([^<]+)<\/dcterms:modified>/);
      if (modifiedMatch) modifiedDate = modifiedMatch[1];
    }

    // Count tables in word/document.xml
    const docXmlFile = zip.file("word/document.xml");
    if (docXmlFile) {
      const docXml = await docXmlFile.async("text");
      const tables = docXml.match(/<w:tbl\b/g);
      if (tables) tableCount = tables.length;
    }
  } catch (e) {
    console.warn("Docx Zip inspection fallback:", e);
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const paragraphs = text.split(/\n\s*\n/).length;

  return {
    text,
    sourceType: "DOCX Document",
    metadata: {
      filename: file.name,
      extension: "docx",
      fileSize: file.size,
      createdDate,
      modifiedDate,
      author,
      creator,
      wordCount: words,
      characterCount: chars,
      paragraphCount: paragraphs,
      pageCount: Math.ceil(words / 400) || 1,
      imageCount,
      tableCount,
    },
    warnings,
  };
}

// General text file loader (TXT, MD, JSON, CSV, XML, HTML, RTF)
async function extractGenericTextDocument(file, format, extension) {
  let rawText = await file.text();

  if (extension === "html" || extension === "htm" || extension === "xml") {
    try {
      const DOMPurify = (await import("dompurify")).default;
      // Strip HTML tags for clean text view if HTML
      if (extension.startsWith("htm")) {
        const doc = new DOMParser().parseFromString(rawText, "text/html");
        rawText = doc.body?.textContent || rawText;
      }
    } catch (e) {
      console.warn("DOMPurify HTML strip notice:", e);
    }
  }

  const words = rawText.split(/\s+/).filter(Boolean).length;
  const chars = rawText.length;
  const paragraphs = rawText.split(/\n\s*\n/).length;
  const lineCount = rawText.split("\n").length;

  return {
    text: rawText,
    sourceType: extension.toUpperCase() + " File",
    format,
    metadata: {
      filename: file.name,
      extension,
      fileSize: file.size,
      createdDate: new Date(file.lastModified).toISOString(),
      modifiedDate: new Date(file.lastModified).toISOString(),
      author: "Local System",
      creator: extension.toUpperCase() + " Editor",
      wordCount: words,
      characterCount: chars,
      paragraphCount: paragraphs,
      lineCount,
      pageCount: Math.ceil(words / 400) || 1,
      imageCount: 0,
      tableCount: format === "csv" ? 1 : 0,
    },
    warnings: [],
  };
}

export async function extractLocalDocument(file) {
  const { extension, format } = validateFile(file);

  let docData;
  if (extension === "pdf") {
    docData = await extractPdfDocument(file);
  } else if (extension === "docx") {
    docData = await extractDocxDocument(file);
  } else {
    docData = await extractGenericTextDocument(file, format, extension);
  }

  // Calculate cryptographic hashes
  const arrayBuffer = await file.arrayBuffer();
  const hashes = await calculateDocumentHashes(arrayBuffer);

  return {
    ...docData,
    name: file.name,
    format,
    hashes,
    rawBuffer: arrayBuffer,
  };
}
