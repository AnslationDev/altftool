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

const PDF_ITEM_WHITESPACE = /\s/u;

/**
 * Normalize one maximal run of whitespace with the page rules: drop spaces and
 * tabs that sit in front of a newline, then collapse remaining runs of two or
 * more spaces/tabs into a single space. Both rules only ever match whitespace,
 * so applying them to a maximal run in isolation gives the same result as
 * applying them to the whole page at once.
 *
 * @param {string} run
 * @returns {string}
 */
function normalizePdfWhitespaceRun(run) {
  return run.replace(/[ \t]+\n/gu, "\n").replace(/[ \t]{2,}/gu, " ");
}

/**
 * @typedef {object} PdfTextItem
 * @property {unknown} [str] Raw glyph run text as reported by pdf.js.
 * @property {unknown} [hasEOL] Whether the item ends the visual line.
 */

/**
 * @typedef {object} BoundedPdfText
 * @property {string} text Normalized page text, never longer than `maxChars`.
 * @property {boolean} truncated Whether content was dropped to stay in budget.
 */

/**
 * Join pdf.js text items into normalized page text without ever building a
 * string larger than `maxChars`.
 *
 * The items are consumed lazily and the walk stops the moment the budget is
 * spent, mid-item if necessary, so a page that blows the budget on its first
 * glyph run never pulls the rest of the page into memory. Trailing whitespace
 * is held back until real text follows it, so a page that ends in blank lines
 * is not reported as truncated when only that whitespace was dropped.
 *
 * @param {Iterable<PdfTextItem>} items
 * @param {number} maxChars
 * @returns {BoundedPdfText}
 */
export function collectBoundedPdfTextItems(items, maxChars) {
  const budget = Number.isFinite(maxChars) ? Math.max(0, Math.trunc(maxChars)) : 0;
  /** @type {string[]} */
  const parts = [];
  let length = 0;
  let pendingWhitespace = "";
  let started = false;
  let truncated = false;
  let stopped = false;

  /**
   * Commit a chunk of normalized text, clipping it to the remaining budget.
   * @param {string} chunk
   * @returns {boolean} False once the budget has run out.
   */
  const commit = (chunk) => {
    if (!chunk) return true;
    const room = budget - length;
    if (chunk.length <= room) {
      parts.push(chunk);
      length += chunk.length;
      return true;
    }
    if (room > 0) {
      parts.push(chunk.slice(0, room));
      length = budget;
    }
    truncated = true;
    return false;
  };

  for (const item of items || []) {
    const str = typeof item?.str === "string" ? item.str : "";
    const chunk = `${str}${item?.hasEOL ? "\n" : " "}`;
    let index = 0;

    while (index < chunk.length) {
      const isWhitespace = PDF_ITEM_WHITESPACE.test(chunk[index]);
      let end = index + 1;
      while (
        end < chunk.length &&
        PDF_ITEM_WHITESPACE.test(chunk[end]) === isWhitespace
      ) {
        end += 1;
      }
      const run = chunk.slice(index, end);
      index = end;

      if (isWhitespace) {
        pendingWhitespace += run;
        continue;
      }
      // Leading whitespace is dropped outright; interior whitespace is only
      // committed now that we know real text follows it.
      if (started && !commit(normalizePdfWhitespaceRun(pendingWhitespace))) {
        stopped = true;
        break;
      }
      pendingWhitespace = "";
      started = true;
      if (!commit(run)) {
        stopped = true;
        break;
      }
    }

    if (stopped) break;
  }

  return { text: parts.join(""), truncated };
}

// A PDF longer than this cannot be compared anyway: compareDocumentVersions
// rejects either side once it passes MAX_SOURCE_CHARACTERS. Budgeting the
// extraction at the same number keeps a 200 MB, 100-page file from building an
// unbounded string in the browser, and turns the hard "too long" comparison
// error into a warning about how much of the document was read.
const MAX_PDF_TEXT_CHARACTERS = MAX_SOURCE_CHARACTERS;

/**
 * Yield pdf.js text items lazily so `collectBoundedPdfTextItems` can stop
 * pulling them once its budget is spent, recording fonts along the way.
 *
 * `hasEOL` is deliberately reported as false. pdf.js sets it once per visual
 * line, and honouring it would turn a 100-page PDF into several thousand
 * lines, past the MAX_COMPARISON_LINES ceiling that alignLineChanges enforces —
 * documents that compare today would start failing outright. Pages therefore
 * stay one line each, exactly as they were before the budget was added.
 *
 * @param {Iterable<PdfTextItem & { fontName?: unknown }>} items
 * @param {Set<string>} fontList Mutated with every font name that is seen.
 * @returns {Generator<PdfTextItem>}
 */
function* pdfTextItemsWithFonts(items, fontList) {
  for (const item of items) {
    if (item?.fontName) fontList.add(item.fontName);
    yield { str: item?.str, hasEOL: false };
  }
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

  const textParts = [];
  const fontList = new Set();
  let remainingCharacters = MAX_PDF_TEXT_CHARACTERS;
  let textTruncated = false;
  let extractedPages = 0;

  for (let p = 1; p <= eligiblePages; p++) {
    const header = `--- Page ${p} ---\n`;
    // The header and the blank line that separates pages are part of the budget.
    const overhead = header.length + 2;
    if (remainingCharacters <= overhead) {
      textTruncated = true;
      break;
    }

    const page = await pdfDoc.getPage(p);
    const content = await page.getTextContent();
    const collected = collectBoundedPdfTextItems(
      pdfTextItemsWithFonts(content.items, fontList),
      remainingCharacters - overhead,
    );
    page.cleanup();

    textParts.push(header, collected.text, "\n\n");
    remainingCharacters -= overhead + collected.text.length;
    extractedPages = p;

    if (collected.truncated) {
      textTruncated = true;
      break;
    }
  }

  const fullText = textParts.join("");

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

  const warnings = [];
  if (pageCount > MAX_PDF_PAGES) {
    warnings.push(`Reading limited to first ${MAX_PDF_PAGES} pages.`);
  }
  if (textTruncated) {
    warnings.push(
      `Text extraction stopped at ${MAX_PDF_TEXT_CHARACTERS.toLocaleString("en-US")} characters, after ${extractedPages} of ${pageCount} pages. Every comparison below covers only the text that was read.`,
    );
  }

  return {
    text: fullText,
    sourceType: "PDF Document",
    pageCount,
    extractedPages,
    textTruncated,
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
    warnings,
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
