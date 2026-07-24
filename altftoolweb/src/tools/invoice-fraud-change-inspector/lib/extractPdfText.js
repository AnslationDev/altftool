const MAX_PDF_BYTES = 8 * 1024 * 1024;
const MAX_PDF_PAGES = 20;
const MAX_TEXT_CHARACTERS = 250_000;

export async function extractTextBasedInvoicePdf(file) {
  if (
    !file ||
    (file.type !== "application/pdf" && !file.name?.toLowerCase().endsWith(".pdf"))
  ) {
    throw new Error("Choose a PDF file.");
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error("Choose a PDF smaller than 8 MB.");
  }

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    isEvalSupported: false,
    useWorkerFetch: false,
  });
  const document = await loadingTask.promise;
  const pageCount = document.numPages;
  const extractedPages = Math.min(pageCount, MAX_PDF_PAGES);
  const pageTexts = [];

  try {
    for (let pageNumber = 1; pageNumber <= extractedPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      try {
        const content = await page.getTextContent();
        pageTexts.push(
          content.items
            .map((item) => `${typeof item?.str === "string" ? item.str : ""}${item?.hasEOL ? "\n" : " "}`)
            .join("")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/[ \t]{2,}/g, " ")
            .trim(),
        );
      } finally {
        page.cleanup();
      }
    }
  } finally {
    await document.destroy();
  }

  const completeText = pageTexts.filter(Boolean).join("\n\n");
  const text = completeText.slice(0, MAX_TEXT_CHARACTERS);
  if (text.replace(/\s/g, "").length < 20) {
    throw new Error(
      "No usable text layer was found. Scanned or image-only PDFs need OCR before comparison.",
    );
  }

  return {
    extractedPages,
    pageCount,
    text,
    warnings: [
      ...(pageCount > MAX_PDF_PAGES
        ? [`Only the first ${MAX_PDF_PAGES} PDF pages were extracted.`]
        : []),
      ...(completeText.length > MAX_TEXT_CHARACTERS
        ? ["Extracted PDF text reached the safe character limit and may be partial."]
        : []),
    ],
  };
}
