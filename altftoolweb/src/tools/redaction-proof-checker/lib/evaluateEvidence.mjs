const TEXT_PATTERNS = [
  {
    id: "aadhaar",
    label: "Aadhaar-like number",
    expression: /\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  },
  {
    id: "pan",
    label: "PAN-like identifier",
    expression: /\b[A-Z]{5}\d{4}[A-Z]\b/gi,
  },
  {
    id: "email",
    label: "Email address",
    expression: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  },
  {
    id: "phone",
    label: "Indian mobile-like number",
    expression: /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/g,
  },
  {
    id: "upi",
    label: "UPI ID-like handle",
    expression:
      /\b[A-Z0-9._-]{2,}@(upi|ybl|ibl|axl|apl|paytm|oksbi|okaxis|okhdfcbank|okicici|ptyes)\b/gi,
  },
  {
    id: "credentials",
    label: "Credential or secret label",
    expression: /\b(password|passcode|api[\s_-]?key|secret[\s_-]?key|private[\s_-]?key|otp)\b/gi,
  },
];

const METADATA_LABELS = {
  title: "Title",
  author: "Author",
  subject: "Subject",
  keywords: "Keywords",
  creator: "Creator",
  producer: "Producer",
};

const REDACTION_ANNOTATIONS = new Set(["redact"]);
const OVERLAY_ANNOTATIONS = new Set([
  "freetext",
  "highlight",
  "ink",
  "polygon",
  "polyline",
  "square",
  "stamp",
  "strikeout",
  "underline",
]);

function countMatches(text, expression) {
  expression.lastIndex = 0;
  let count = 0;
  while (expression.exec(text)) count += 1;
  expression.lastIndex = 0;
  return count;
}

function normalizeTextPages(textPages = []) {
  return textPages.map((entry, index) => ({
    page: Number.isFinite(entry?.page) ? entry.page : index + 1,
    text: typeof entry?.text === "string" ? entry.text : "",
  }));
}

export function detectSensitiveText(textPages = []) {
  const pages = normalizeTextPages(textPages);

  return TEXT_PATTERNS.map((pattern) => {
    const affectedPages = [];
    let count = 0;

    pages.forEach((entry) => {
      const pageCount = countMatches(entry.text, pattern.expression);
      if (pageCount > 0) affectedPages.push(entry.page);
      count += pageCount;
    });

    return {
      id: pattern.id,
      label: pattern.label,
      count,
      pages: affectedPages,
    };
  }).filter((entry) => entry.count > 0);
}

function populatedMetadata(metadata = {}) {
  return Object.entries(METADATA_LABELS)
    .filter(([key]) => {
      const value = metadata?.[key];
      return typeof value === "string" && value.trim().length > 0;
    })
    .map(([key, label]) => ({ key, label }));
}

function makeFinding(id, severity, title, detail, action) {
  return { id, severity, title, detail, action };
}

function verdictFromFindings(findings) {
  if (findings.some((finding) => finding.severity === "high")) {
    return {
      level: "high",
      label: "High-risk evidence found",
      summary: "Do not share this file until the high-risk findings are resolved and checked again.",
    };
  }

  if (findings.some((finding) => finding.severity === "review")) {
    return {
      level: "review",
      label: "Manual review required",
      summary: "No automatic checker can prove a document safe; review the listed limits before sharing.",
    };
  }

  return {
    level: "limited",
    label: "No obvious automated signal found",
    summary: "This is not proof of safe redaction. Complete the manual checks before sharing.",
  };
}

export function evaluatePdfEvidence(evidence = {}) {
  const textPages = normalizeTextPages(evidence.textPages);
  const sensitiveText = detectSensitiveText(textPages);
  const annotations = Array.isArray(evidence.annotations) ? evidence.annotations : [];
  const metadata = populatedMetadata(evidence.metadata);
  const pageCount = Math.max(0, Number(evidence.pageCount) || 0);
  const imageCount = Math.max(0, Number(evidence.imageCount) || 0);
  const attachmentsCount = Math.max(0, Number(evidence.attachmentsCount) || 0);
  const scriptCount = Math.max(0, Number(evidence.scriptCount) || 0);
  const extractionFailedPages = Array.isArray(evidence.extractionFailedPages)
    ? evidence.extractionFailedPages
    : [];
  const extractedCharacters = textPages.reduce((sum, entry) => sum + entry.text.length, 0);
  const redactionAnnotations = annotations.filter((entry) =>
    REDACTION_ANNOTATIONS.has(String(entry?.subtype || "").toLowerCase()),
  );
  const overlayAnnotations = annotations.filter((entry) =>
    OVERLAY_ANNOTATIONS.has(String(entry?.subtype || "").toLowerCase()),
  );
  const findings = [];

  if (sensitiveText.length > 0) {
    const matchCount = sensitiveText.reduce((sum, item) => sum + item.count, 0);
    findings.push(
      makeFinding(
        "extractable-sensitive-text",
        "high",
        "Sensitive-looking text is still extractable",
        `${matchCount} match${matchCount === 1 ? "" : "es"} across ${new Set(
          sensitiveText.flatMap((item) => item.pages),
        ).size} page${new Set(sensitiveText.flatMap((item) => item.pages)).size === 1 ? "" : "s"}. Match values are not stored in this report.`,
        "Remove the source text, apply redactions, export a new copy, then inspect it again.",
      ),
    );
  }

  if (redactionAnnotations.length > 0) {
    findings.push(
      makeFinding(
        "unapplied-redaction-annotations",
        "high",
        "Redaction annotations remain in the PDF",
        `${redactionAnnotations.length} redaction annotation${
          redactionAnnotations.length === 1 ? " was" : "s were"
        } detected. A mark can exist without permanently removing the content below it.`,
        "Apply or burn in the redactions in a trusted PDF editor and save a fresh flattened copy.",
      ),
    );
  }

  if (overlayAnnotations.length > 0) {
    findings.push(
      makeFinding(
        "overlay-annotations",
        "review",
        "Overlay-style annotations need review",
        `${overlayAnnotations.length} square, stamp, ink, highlight, or text annotation${
          overlayAnnotations.length === 1 ? " was" : "s were"
        } found. These can visually cover content without deleting it.`,
        "Confirm every concealment is an applied redaction, not a movable annotation.",
      ),
    );
  }

  if (metadata.length > 0) {
    findings.push(
      makeFinding(
        "document-metadata",
        "review",
        "Document metadata is present",
        `${metadata.map((entry) => entry.label).join(", ")} ${
          metadata.length === 1 ? "is" : "are"
        } populated and may identify the source or author.`,
        "Remove unnecessary metadata before sharing the final file.",
      ),
    );
  }

  if (attachmentsCount > 0) {
    findings.push(
      makeFinding(
        "embedded-attachments",
        "high",
        "Embedded attachments are present",
        `${attachmentsCount} embedded attachment${attachmentsCount === 1 ? "" : "s"} may contain unredacted source material.`,
        "Open and inspect every attachment, or remove attachments from the shared copy.",
      ),
    );
  }

  if (scriptCount > 0) {
    findings.push(
      makeFinding(
        "document-scripts",
        "high",
        "Document scripts are present",
        `${scriptCount} JavaScript action group${scriptCount === 1 ? "" : "s"} detected.`,
        "Remove document scripts and re-export from a trusted editor before distribution.",
      ),
    );
  }

  if (imageCount > 0) {
    findings.push(
      makeFinding(
        "embedded-images",
        "review",
        "Embedded images require visual review",
        `${imageCount} image paint operation${imageCount === 1 ? "" : "s"} detected. This checker does not OCR image pixels or recover overwritten pixels.`,
        "Zoom into every page and independently verify that no sensitive content is visible in images.",
      ),
    );
  }

  if (extractionFailedPages.length > 0) {
    findings.push(
      makeFinding(
        "partial-extraction",
        "review",
        "Some pages could not be fully inspected",
        `Text, annotation, or image inspection was incomplete on page${
          extractionFailedPages.length === 1 ? "" : "s"
        } ${extractionFailedPages.join(", ")}.`,
        "Open those pages in another trusted viewer and review them manually.",
      ),
    );
  }

  if (extractedCharacters === 0 && pageCount > 0) {
    findings.push(
      makeFinding(
        "no-text-layer",
        "review",
        "No extractable text layer was found",
        "The file may be scanned or flattened. That removes one leak path, but it also prevents this checker from reading visible text.",
        "Perform a careful visual review or use an approved offline OCR workflow.",
      ),
    );
  }

  const result = {
    kind: "pdf",
    verdict: verdictFromFindings(findings),
    findings,
    evidence: {
      pageCount,
      extractedCharacters,
      sensitiveText,
      annotationCount: annotations.length,
      imageCount,
      metadataFields: metadata,
      attachmentsCount,
      scriptCount,
      extractionFailedPages,
    },
    limitations: [
      "A clean result is not proof that a PDF is safely redacted.",
      "The checker does not OCR images, recover overwritten pixels, or inspect password-protected content.",
      "Visual review in a separate trusted viewer is still required.",
    ],
  };

  return result;
}

export function inspectRasterPixels(data, width, height) {
  const safeWidth = Math.max(0, Math.floor(Number(width) || 0));
  const safeHeight = Math.max(0, Math.floor(Number(height) || 0));
  const totalPixels = safeWidth * safeHeight;

  if (!data || totalPixels === 0 || data.length < totalPixels * 4) {
    return {
      inspectedWidth: safeWidth,
      inspectedHeight: safeHeight,
      totalPixels,
      transparentPixels: 0,
      nearBlackPixels: 0,
      darkBandRows: 0,
    };
  }

  let transparentPixels = 0;
  let nearBlackPixels = 0;
  let darkBandRows = 0;
  const minimumRun = Math.max(8, Math.floor(safeWidth * 0.2));

  for (let y = 0; y < safeHeight; y += 1) {
    let currentRun = 0;
    let longestRun = 0;

    for (let x = 0; x < safeWidth; x += 1) {
      const offset = (y * safeWidth + x) * 4;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      const alpha = data[offset + 3];
      const nearBlack = alpha > 245 && red < 18 && green < 18 && blue < 18;

      if (alpha < 255) transparentPixels += 1;
      if (nearBlack) {
        nearBlackPixels += 1;
        currentRun += 1;
        longestRun = Math.max(longestRun, currentRun);
      } else {
        currentRun = 0;
      }
    }

    if (longestRun >= minimumRun) darkBandRows += 1;
  }

  return {
    inspectedWidth: safeWidth,
    inspectedHeight: safeHeight,
    totalPixels,
    transparentPixels,
    nearBlackPixels,
    darkBandRows,
  };
}

export function scanImageMetadataMarkers(bytes) {
  if (!bytes || bytes.length === 0) return [];

  const sample = new TextDecoder("latin1").decode(bytes);
  const markers = [
    ["exif", /Exif/i, "EXIF"],
    ["xmp", /xmpmeta|adobe:ns:meta/i, "XMP"],
    ["gps", /GPSLatitude|GPSLongitude|GPSInfo/i, "GPS"],
    ["text-chunk", /(?:tEXt|iTXt|zTXt)/, "PNG text chunk"],
  ];

  return markers
    .filter(([, expression]) => expression.test(sample))
    .map(([id, , label]) => ({ id, label }));
}

export function evaluateImageEvidence(evidence = {}) {
  const width = Math.max(0, Number(evidence.width) || 0);
  const height = Math.max(0, Number(evidence.height) || 0);
  const totalPixels = Math.max(0, Number(evidence.totalPixels) || width * height);
  const inspectedWidth = Math.max(0, Number(evidence.inspectedWidth) || width);
  const inspectedHeight = Math.max(0, Number(evidence.inspectedHeight) || height);
  const transparentPixels = Math.max(0, Number(evidence.transparentPixels) || 0);
  const nearBlackPixels = Math.max(0, Number(evidence.nearBlackPixels) || 0);
  const darkBandRows = Math.max(0, Number(evidence.darkBandRows) || 0);
  const metadataMarkers = Array.isArray(evidence.metadataMarkers)
    ? evidence.metadataMarkers
    : [];
  const findings = [];
  const transparencyRatio = totalPixels > 0 ? transparentPixels / totalPixels : 0;
  const darkRatio = totalPixels > 0 ? nearBlackPixels / totalPixels : 0;

  if (metadataMarkers.length > 0) {
    findings.push(
      makeFinding(
        "image-metadata",
        metadataMarkers.some((entry) => entry.id === "gps") ? "high" : "review",
        "Image metadata markers are present",
        `${metadataMarkers.map((entry) => entry.label).join(", ")} data may remain in the file.`,
        "Strip image metadata and export a fresh copy before sharing.",
      ),
    );
  }

  if (transparencyRatio > 0.001) {
    findings.push(
      makeFinding(
        "transparent-pixels",
        "review",
        "Transparent or semi-transparent pixels were found",
        `${(transparencyRatio * 100).toFixed(2)}% of inspected pixels are not fully opaque. Background content can change how these pixels appear.`,
        "Flatten the image onto an opaque background and inspect the exported result.",
      ),
    );
  }

  if (darkBandRows > Math.max(2, inspectedHeight * 0.005)) {
    findings.push(
      makeFinding(
        "dark-bands",
        "review",
        "Large near-black pixel bands were detected",
        `${darkBandRows} inspected row${darkBandRows === 1 ? "" : "s"} contain a long near-black run. This may be intentional concealment, a border, or normal artwork.`,
        "Confirm the bands are baked into the final pixels and fully cover the intended content.",
      ),
    );
  }

  findings.push(
    makeFinding(
      "visual-content-limit",
      "review",
      "Visible text was not interpreted",
      "The raster check measures pixel and file signals; it does not use OCR or decide whether visible information is sensitive.",
      "Inspect the image at 100% zoom and ask a second reviewer to check it independently.",
    ),
  );

  return {
    kind: "image",
    verdict: verdictFromFindings(findings),
    findings,
    evidence: {
      width,
      height,
      inspectedWidth,
      inspectedHeight,
      totalPixels,
      transparentPixels,
      transparencyRatio,
      nearBlackPixels,
      darkRatio,
      darkBandRows,
      metadataMarkers,
    },
    limitations: [
      "A raster image normally has no editable text layer, but visible pixels and metadata can still disclose information.",
      "The checker does not OCR text, reverse blur, or recover overwritten pixels.",
      "A clean result is not mathematical or legal proof of safe redaction.",
    ],
  };
}

export function createDownloadReport(file, result) {
  return {
    tool: "Redaction Proof Checker",
    generatedAt: new Date().toISOString(),
    file: {
      name: file?.name || "unknown",
      type: file?.type || "unknown",
      size: Number(file?.size) || 0,
    },
    ...result,
  };
}
