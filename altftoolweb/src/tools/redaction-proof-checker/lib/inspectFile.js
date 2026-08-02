import {
  evaluateImageEvidence,
  evaluatePdfEvidence,
  inspectRasterPixels,
  scanImageMetadataMarkers,
} from "./evaluateEvidence.mjs";

const MAX_CANVAS_EDGE = 1600;

function countOwnKeys(value) {
  return value && typeof value === "object" ? Object.keys(value).length : 0;
}

function cleanMetadata(info = {}, metadata = null) {
  const raw = metadata?.getAll?.() || {};
  return {
    title: String(info.Title || raw["dc:title"] || ""),
    author: String(info.Author || raw["dc:creator"] || ""),
    subject: String(info.Subject || raw["dc:description"] || ""),
    keywords: String(info.Keywords || raw["pdf:keywords"] || ""),
    creator: String(info.Creator || raw["xmp:CreatorTool"] || ""),
    producer: String(info.Producer || raw["pdf:Producer"] || ""),
  };
}

function countImageOperators(operatorList, OPS) {
  const imageOperators = new Set(
    [
      OPS.paintImageXObject,
      OPS.paintImageXObjectRepeat,
      OPS.paintInlineImageXObject,
      OPS.paintInlineImageXObjectGroup,
      OPS.paintImageMaskXObject,
      OPS.paintImageMaskXObjectGroup,
      OPS.paintSolidColorImageMask,
    ].filter((value) => Number.isFinite(value)),
  );

  return operatorList.fnArray.reduce(
    (count, operation) => count + (imageOperators.has(operation) ? 1 : 0),
    0,
  );
}

function annotationSubtype(annotation, AnnotationType) {
  if (typeof annotation?.subtype === "string" && annotation.subtype) {
    return annotation.subtype;
  }

  const numericType = Number(annotation?.annotationType);
  const match = Object.entries(AnnotationType || {}).find(([, value]) => value === numericType);
  return match?.[0] || "Unknown";
}

export async function inspectPdf(file) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // The shared worker is version-locked with pdfjs-dist by the PDF asset
  // parity test, so the legacy API can reuse it without emitting another
  // worker copy into the production bundle.
  pdfjs.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";

  const bytes = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({
    data: bytes.slice(),
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const document = await loadingTask.promise;
  const textPages = [];
  const annotations = [];
  const extractionFailedPages = [];
  let imageCount = 0;

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      try {
        const page = await document.getPage(pageNumber);
        const [textContent, pageAnnotations, operatorList] = await Promise.all([
          page.getTextContent(),
          page.getAnnotations({ intent: "display" }),
          page.getOperatorList(),
        ]);
        textPages.push({
          page: pageNumber,
          text: textContent.items
            .map((item) => (typeof item?.str === "string" ? item.str : ""))
            .join(" "),
        });
        pageAnnotations.forEach((annotation) => {
          annotations.push({
            page: pageNumber,
            subtype: annotationSubtype(annotation, pdfjs.AnnotationType),
          });
        });
        imageCount += countImageOperators(operatorList, pdfjs.OPS);
        page.cleanup();
      } catch {
        extractionFailedPages.push(pageNumber);
      }
    }

    const [metadataResult, attachments, scripts] = await Promise.all([
      document.getMetadata().catch(() => ({ info: {}, metadata: null })),
      document.getAttachments().catch(() => null),
      document.getJSActions().catch(() => null),
    ]);

    return evaluatePdfEvidence({
      pageCount: document.numPages,
      textPages,
      annotations,
      imageCount,
      metadata: cleanMetadata(metadataResult.info, metadataResult.metadata),
      attachmentsCount: countOwnKeys(attachments),
      scriptCount: countOwnKeys(scripts),
      extractionFailedPages,
    });
  } finally {
    await document.destroy();
  }
}

async function decodeImage(file) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      release: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = objectUrl;
  await image.decode();

  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    release: () => URL.revokeObjectURL(objectUrl),
  };
}

export async function inspectImage(file) {
  const [decoded, bytes] = await Promise.all([
    decodeImage(file),
    file.arrayBuffer().then((buffer) => new Uint8Array(buffer)),
  ]);

  try {
    const scale = Math.min(1, MAX_CANVAS_EDGE / Math.max(decoded.width, decoded.height));
    const canvasWidth = Math.max(1, Math.round(decoded.width * scale));
    const canvasHeight = Math.max(1, Math.round(decoded.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      throw new Error("This browser could not create an image analysis canvas.");
    }

    context.drawImage(decoded.source, 0, 0, canvasWidth, canvasHeight);
    const pixels = context.getImageData(0, 0, canvasWidth, canvasHeight);
    const pixelEvidence = inspectRasterPixels(pixels.data, canvasWidth, canvasHeight);

    return evaluateImageEvidence({
      width: decoded.width,
      height: decoded.height,
      ...pixelEvidence,
      metadataMarkers: scanImageMetadataMarkers(bytes),
    });
  } finally {
    decoded.release();
  }
}

export async function inspectFile(file) {
  if (!file) throw new Error("Choose a PDF or image to inspect.");

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (isPdf) return inspectPdf(file);
  if (file.type.startsWith("image/")) return inspectImage(file);

  throw new Error("Unsupported format. Choose a PDF, PNG, JPEG, or WebP file.");
}
