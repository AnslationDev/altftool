import {
  READING_ORDER_LIMITS,
  collectBoundedTextItems,
  estimatePageReadingOrder,
  normalizePageMetadata,
  summarizeReadingOrderPages,
} from "./readingOrderEstimate.mjs";
import {
  PDF_OPERATION_TIMEOUTS,
  createPdfCleanup,
  createPdfOperationGuard,
} from "../../../platform/files/boundedPdfOperations.mjs";

function isPdfCandidate(file) {
  return (
    file?.type === "application/pdf" ||
    String(file?.name || "")
      .toLocaleLowerCase("en")
      .endsWith(".pdf")
  );
}

async function hasPdfHeader(file) {
  const headerBuffer = await file.slice(0, 8).arrayBuffer();
  const header = new TextDecoder("latin1").decode(headerBuffer);
  return header.startsWith("%PDF-");
}

export async function validateReadingOrderPdf(file) {
  if (!file) throw new Error("Choose a local PDF file.");
  if (!isPdfCandidate(file)) throw new Error("Choose a PDF file.");
  if (!Number.isFinite(file.size) || file.size <= 0) {
    throw new Error("Choose a non-empty PDF file.");
  }
  if (file.size > READING_ORDER_LIMITS.maxFileBytes) {
    throw new Error(
      `Choose a PDF no larger than ${READING_ORDER_LIMITS.maxFileBytes / (1024 * 1024)} MB.`,
    );
  }
  if (!(await hasPdfHeader(file))) {
    throw new Error("The selected file does not have a valid PDF header.");
  }
}

export function validatePdfPageCount(pageCount) {
  if (
    !Number.isSafeInteger(pageCount) ||
    pageCount < 1 ||
    pageCount > READING_ORDER_LIMITS.maxPages
  ) {
    throw new Error(
      `Choose a PDF with 1 to ${READING_ORDER_LIMITS.maxPages} pages.`,
    );
  }
  return pageCount;
}

function pageMetadata(page, pageNumber) {
  let viewport = null;
  try {
    viewport = page.getViewport({ scale: 1 });
  } catch {
    // normalizePageMetadata reports malformed dimensions below.
  }
  return normalizePageMetadata({
    pageNumber,
    width: viewport?.width,
    height: viewport?.height,
    rotation: viewport?.rotation ?? page?.rotate,
  });
}

function truncationWarning(collection) {
  if (!collection.truncated) return [];
  const message =
    collection.truncationReason === "item-limit"
      ? "Text-item extraction reached a per-page or document-wide item limit. Remaining text items were not read."
      : "Text extraction reached a per-page or document-wide character limit. Remaining text was not read.";
  return [{ code: collection.truncationReason, message, tone: "warning" }];
}

function guardedTextReader(reader, guard, pageNumber) {
  const cancel = createPdfCleanup(() => reader.cancel?.());
  return {
    read() {
      return guard.run(() => reader.read(), {
        label: `PDF page ${pageNumber} text streaming`,
        timeoutMilliseconds: PDF_OPERATION_TIMEOUTS.streamReadMilliseconds,
        cancellationMessage: "PDF inspection was cancelled.",
        onInterrupt: cancel,
      });
    },
    cancel() {
      return guard.settleCleanup(cancel);
    },
  };
}

export async function extractPdfReadingOrder(
  file,
  { shouldContinue = () => true } = {},
) {
  await validateReadingOrderPdf(file);

  const guard = createPdfOperationGuard({ shouldContinue });
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";
  const bytes = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({
    data: bytes,
    isEvalSupported: false,
    useWorkerFetch: false,
    disableAutoFetch: true,
  });
  const destroyLoadingTask = createPdfCleanup(() => loadingTask.destroy());
  let document = null;
  let destroyDocument = null;

  try {
    document = await guard.run(() => loadingTask.promise, {
      label: "PDF loading",
      timeoutMilliseconds: PDF_OPERATION_TIMEOUTS.loadingMilliseconds,
      cancellationMessage: "PDF inspection was cancelled.",
      onInterrupt: destroyLoadingTask,
      onLateResolve: (lateDocument) => lateDocument?.destroy?.(),
    });
    destroyDocument = createPdfCleanup(() => document.destroy());
    const pageCount = validatePdfPageCount(document.numPages);
    const totalBudget = {
      itemsRemaining: READING_ORDER_LIMITS.maxTotalItems,
      charactersRemaining: READING_ORDER_LIMITS.maxTotalCharacters,
    };
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      if (
        totalBudget.itemsRemaining <= 0 ||
        totalBudget.charactersRemaining <= 0
      ) {
        break;
      }

      const page = await guard.run(() => document.getPage(pageNumber), {
        label: `PDF page ${pageNumber} loading`,
        timeoutMilliseconds: PDF_OPERATION_TIMEOUTS.getPageMilliseconds,
        cancellationMessage: "PDF inspection was cancelled.",
        onInterrupt: destroyDocument,
        onLateResolve: (latePage) => latePage?.cleanup?.(),
      });
      try {
        if (typeof page.streamTextContent !== "function") {
          throw new Error(
            "This browser cannot provide bounded PDF text streaming.",
          );
        }
        const metadata = pageMetadata(page, pageNumber);
        const reader = guardedTextReader(
          page.streamTextContent().getReader(),
          guard,
          pageNumber,
        );
        const collection = await collectBoundedTextItems(reader, {
          maxItems: READING_ORDER_LIMITS.maxItemsPerPage,
          maxCharacters: READING_ORDER_LIMITS.maxCharactersPerPage,
          totalBudget,
        });
        const estimate = estimatePageReadingOrder(collection.items, metadata);
        const warnings = [
          ...estimate.warnings,
          ...truncationWarning(collection),
        ];

        pages.push({
          pageNumber,
          itemCount: collection.itemCount,
          characterCount: collection.characterCount,
          truncated: collection.truncated,
          truncationReason: collection.truncationReason,
          estimate,
          warnings,
        });
      } finally {
        try {
          page.cleanup();
        } catch {
          // Document destruction below remains the final cleanup boundary.
        }
      }
    }

    const summary = summarizeReadingOrderPages(pages, pageCount);
    return {
      fileName: file.name,
      fileBytes: file.size,
      pageCount,
      pages,
      summary,
      warnings: [
        ...(summary.imageOnly
          ? [
              {
                code: "no-text-layer",
                message:
                  "No usable text layer was found. This may be a scanned or image-only PDF; this tool does not perform OCR.",
                tone: "warning",
              },
            ]
          : []),
        ...(pages.length < pageCount
          ? [
              {
                code: "document-limit",
                message:
                  "Document-wide extraction limits were reached before every page could be processed.",
                tone: "warning",
              },
            ]
          : []),
      ],
    };
  } finally {
    await guard.settleCleanup(destroyDocument || destroyLoadingTask);
  }
}
