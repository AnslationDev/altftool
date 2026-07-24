import { MAX_SOURCE_CHARACTERS } from "./compareVersions.mjs";

export const MAX_DOCUMENT_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_PDF_PAGES = 30;

const EXTENSION_FORMATS = {
  txt: "text",
  md: "markdown",
  markdown: "markdown",
  json: "json",
  csv: "csv",
  pdf: "text",
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
  const format = EXTENSION_FORMATS[extension];
  if (!format) {
    throw new Error("Choose a TXT, Markdown, JSON, CSV, or PDF file.");
  }
  if (file.size > MAX_DOCUMENT_FILE_BYTES) {
    throw new Error("Choose a document no larger than 8 MB.");
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
    const normalized =
      beforeNewline
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

  const addItems = (items = []) => {
    if (truncated || finished) return false;
    for (const item of items) {
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

async function extractBoundedPdfPageText(page, maxCharacters) {
  const collector = createBoundedPdfTextCollector(maxCharacters);

  if (typeof page.streamTextContent === "function") {
    const reader = page.streamTextContent().getReader();
    let shouldCancel = false;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!collector.addItems(value?.items || [])) {
          shouldCancel = true;
          break;
        }
      }
    } finally {
      if (shouldCancel) {
        try {
          await reader.cancel();
        } catch {
          // The page is cleaned up below even if the stream was already closed.
        }
      }
    }
    return collector.result();
  }

  const content = await page.getTextContent();
  collector.addItems(content.items);
  return collector.result();
}

async function extractPdfText(file) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    isEvalSupported: false,
    useWorkerFetch: false,
    disableAutoFetch: true,
  });
  const document = await loadingTask.promise;
  const pageCount = document.numPages;
  const eligiblePages = Math.min(pageCount, MAX_PDF_PAGES);
  let extractedPages = 0;
  let completeText = "";
  let textTruncated = false;

  try {
    for (let pageNumber = 1; pageNumber <= eligiblePages; pageNumber += 1) {
      const remainingCharacters = MAX_SOURCE_CHARACTERS - completeText.length;
      if (remainingCharacters <= 0) {
        textTruncated = true;
        break;
      }

      const page = await document.getPage(pageNumber);
      try {
        const pageText = await extractBoundedPdfPageText(
          page,
          remainingCharacters,
        );
        extractedPages += 1;
        if (pageText.text) {
          const addition = `${completeText ? "\n\n" : ""}${pageText.text}`;
          const available = MAX_SOURCE_CHARACTERS - completeText.length;
          completeText += addition.slice(0, available);
          if (addition.length > available) textTruncated = true;
        }
        if (pageText.truncated) textTruncated = true;
      } finally {
        page.cleanup();
      }
      if (textTruncated) break;
    }
  } finally {
    await document.destroy();
  }

  if (completeText.replace(/\s/gu, "").length < 1) {
    throw new Error(
      "No usable text layer was found. Image-only or scanned PDFs need local OCR before comparison.",
    );
  }

  return {
    text: completeText,
    warnings: [
      ...(pageCount > MAX_PDF_PAGES
        ? [`PDF page extraction is limited to the first ${MAX_PDF_PAGES} pages.`]
        : []),
      ...(textTruncated
        ? [
            `Extracted PDF text reached the ${MAX_SOURCE_CHARACTERS.toLocaleString("en-US")}-character limit after ${extractedPages.toLocaleString("en-US")} page${extractedPages === 1 ? "" : "s"}; remaining text and pages were not read.`,
          ]
        : []),
      "PDF comparison uses extracted text only; layout, images, annotations, signatures, and hidden objects are not compared.",
    ],
    pageCount,
    extractedPages,
  };
}

export async function extractLocalDocument(file) {
  const { extension, format } = validateFile(file);
  if (extension === "pdf") {
    const extracted = await extractPdfText(file);
    return { ...extracted, format, sourceType: "text-based PDF" };
  }

  const completeText = await file.text();
  if (completeText.length > MAX_SOURCE_CHARACTERS) {
    throw new Error(
      `Text extraction exceeds the ${MAX_SOURCE_CHARACTERS.toLocaleString("en-US")}-character limit.`,
    );
  }
  return {
    text: completeText,
    format,
    sourceType: extension.toUpperCase(),
    warnings: [],
    pageCount: null,
    extractedPages: null,
  };
}
