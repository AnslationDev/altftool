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

/**
 * Collect PDF text-content items into a single normalized string, stopping
 * once `maxChars` is reached rather than materializing an item's full
 * `str` (or visiting further items) unconditionally — a single pathological
 * page can otherwise hold an unbounded amount of text.
 *
 * `truncated` reports whether any item's real `str` content was cut short;
 * losing only the item-separator character we append (a space, or a
 * newline for `hasEOL` items) at the very end of the budget doesn't count,
 * since nothing of the extracted text itself was lost.
 */
export function collectBoundedPdfTextItems(items, maxChars) {
  let text = "";
  let truncated = false;
  for (const item of items) {
    const str = typeof item?.str === "string" ? item.str : "";
    const piece = `${str}${item?.hasEOL ? "\n" : " "}`;
    const remaining = maxChars - text.length;
    if (piece.length <= remaining) {
      text += piece;
      continue;
    }
    const kept = piece.slice(0, Math.max(0, remaining));
    text += kept;
    truncated = kept.length < str.length;
    break;
  }
  if (!truncated) {
    text = text.replace(/[ \t]+\n/gu, "\n").replace(/[ \t]{2,}/gu, " ").trim();
  }
  return { text, truncated };
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
  let fontList = new Set();
  let extractedPages = 0;
  let textTruncated = false;

  for (let p = 1; p <= eligiblePages; p++) {
    if (fullText.length >= MAX_SOURCE_CHARACTERS) {
      textTruncated = true;
      break;
    }
    const page = await pdfDoc.getPage(p);
    const content = await page.getTextContent();
    content.items.forEach((item) => {
      if (item.fontName) fontList.add(item.fontName);
    });
    const { text: pageText, truncated: pageTruncated } = collectBoundedPdfTextItems(
      content.items,
      MAX_SOURCE_CHARACTERS - fullText.length,
    );
    fullText += `--- Page ${p} ---\n` + pageText + "\n\n";
    extractedPages = p;
    page.cleanup();
    if (pageTruncated) {
      textTruncated = true;
      break;
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
      ...(pageCount > MAX_PDF_PAGES ? [`Reading limited to first ${MAX_PDF_PAGES} pages.`] : []),
      ...(textTruncated
        ? [`Extracted text truncated at ${MAX_SOURCE_CHARACTERS.toLocaleString("en-US")} characters.`]
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
