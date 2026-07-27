const MIN_SIZE = 0.002;

export const BANK_STATEMENT_PRESETS = Object.freeze({
  name: Object.freeze({
    key: "name",
    label: "Account holder name",
    x: 0.08,
    y: 0.08,
    width: 0.44,
    height: 0.055,
  }),
  address: Object.freeze({
    key: "address",
    label: "Postal address",
    x: 0.08,
    y: 0.145,
    width: 0.54,
    height: 0.095,
  }),
  account: Object.freeze({
    key: "account",
    label: "Account number",
    x: 0.6,
    y: 0.08,
    width: 0.32,
    height: 0.05,
  }),
  ifsc: Object.freeze({
    key: "ifsc",
    label: "IFSC / routing code",
    x: 0.6,
    y: 0.14,
    width: 0.32,
    height: 0.045,
  }),
  iban: Object.freeze({
    key: "iban",
    label: "IBAN / SWIFT",
    x: 0.6,
    y: 0.195,
    width: 0.32,
    height: 0.045,
  }),
  cards: Object.freeze({
    key: "cards",
    label: "Card references",
    x: 0.08,
    y: 0.82,
    width: 0.4,
    height: 0.06,
  }),
  balances: Object.freeze({
    key: "balances",
    label: "Balance amounts",
    x: 0.68,
    y: 0.3,
    width: 0.24,
    height: 0.52,
  }),
  transactions: Object.freeze({
    key: "transactions",
    label: "Transaction rows",
    x: 0.08,
    y: 0.3,
    width: 0.84,
    height: 0.52,
  }),
});

export const REDACTION_MODES = Object.freeze({
  black: { key: "black", label: "Permanent Black Box", description: "Opaque solid black mask" },
  white: { key: "white", label: "White Out Box", description: "Opaque solid white mask" },
  blur: { key: "blur", label: "Gaussian Blur", description: "Heavy optical blur effect" },
  pixelate: { key: "pixelate", label: "Pixelation Block", description: "Mosaic pixelation mask" },
  mask_x: { key: "mask_x", label: "Mask with XXXXXX", description: "Replaces text visually with X's" },
  redacted_text: { key: "redacted_text", label: "[REDACTED] Label", description: "Replaces with [REDACTED] badge" },
  custom: { key: "custom", label: "Custom Placeholder", description: "Replaces with custom text string" },
});

export const SENSITIVE_PATTERNS = Object.freeze([
  {
    category: "Account & Banking",
    key: "account_no",
    label: "Account Number",
    regex: /\b(?:A\/C|ACC|ACCOUNT)?\s*#?\s*:?\s*(\d{9,18})\b/gi,
    severity: "high",
    confidence: 0.94,
  },
  {
    category: "Account & Banking",
    key: "iban",
    label: "IBAN Code",
    regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g,
    severity: "high",
    confidence: 0.98,
  },
  {
    category: "Account & Banking",
    key: "ifsc",
    label: "IFSC Code",
    regex: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
    severity: "high",
    confidence: 0.97,
  },
  {
    category: "Account & Banking",
    key: "swift",
    label: "SWIFT / BIC",
    regex: /\b[A-Z]{6}[A-Z0-9]{2,5}\b/g,
    severity: "high",
    confidence: 0.92,
  },
  {
    category: "Cards & Payments",
    key: "card_no",
    label: "Debit/Credit Card",
    regex: /\b(?:\d[ -]*?){13,19}\b/g,
    severity: "high",
    confidence: 0.95,
  },
  {
    category: "Cards & Payments",
    key: "upi_id",
    label: "UPI Identifier",
    regex: /\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b/g,
    severity: "medium",
    confidence: 0.93,
  },
  {
    category: "Transactions",
    key: "utr_rrn",
    label: "UTR / Transaction Ref",
    regex: /\b(?:UTR|RRN|NEFT|RTGS|IMPS|TXN|REF)[ -]?[:.]?[ -]?([A-Z0-9]{8,22})\b/gi,
    severity: "medium",
    confidence: 0.91,
  },
  {
    category: "Personal Identifiers",
    key: "pan_card",
    label: "PAN Card Number",
    regex: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
    severity: "high",
    confidence: 0.99,
  },
  {
    category: "Personal Identifiers",
    key: "aadhaar",
    label: "Aadhaar Card Number",
    regex: /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
    severity: "high",
    confidence: 0.96,
  },
  {
    category: "Contact Info",
    key: "email",
    label: "Email Address",
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    severity: "low",
    confidence: 0.95,
  },
  {
    category: "Contact Info",
    key: "phone",
    label: "Phone Number",
    regex: /\b(?:\+?\d{1,3}[ -]?)?\(?\d{3,5}\)?[ -]?\d{3,5}[ -]?\d{3,5}\b/g,
    severity: "medium",
    confidence: 0.88,
  },
  {
    category: "Personal Identifiers",
    key: "dob",
    label: "Date of Birth",
    regex: /\b(?:DOB|Date of Birth)[\s:]*([0-3]?\d[\/\.-][0-1]?\d[\/\.-](?:19|20)?\d{2})\b/gi,
    severity: "medium",
    confidence: 0.90,
  },
  {
    category: "Balances & Amounts",
    key: "currency_amount",
    label: "Financial Amount",
    regex: /\b(?:RS\.?|INR|\$|€|£)\s*[\d,]+(?:\.\d{2})?\b/gi,
    severity: "medium",
    confidence: 0.86,
  },
]);

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function clampUnit(value) {
  return Math.min(1, Math.max(0, finite(value)));
}

export function normalizeRectangle(rectangle = {}) {
  const x = finite(rectangle.x);
  const y = finite(rectangle.y);
  const width = finite(rectangle.width);
  const height = finite(rectangle.height);
  const left = clampUnit(Math.min(x, x + width));
  const right = clampUnit(Math.max(x, x + width));
  const top = clampUnit(Math.min(y, y + height));
  const bottom = clampUnit(Math.max(y, y + height));

  return {
    id: rectangle.id == null ? undefined : String(rectangle.id),
    label: String(rectangle.label || "Custom redaction"),
    presetKey: rectangle.presetKey ? String(rectangle.presetKey) : null,
    mode: rectangle.mode && REDACTION_MODES[rectangle.mode] ? rectangle.mode : "black",
    customText: rectangle.customText != null ? String(rectangle.customText) : "",
    severity: rectangle.severity || "medium",
    category: rectangle.category || "General",
    x: left,
    y: top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

export function rectangleFromPoints(start = {}, end = {}, id, mode = "black") {
  return normalizeRectangle({
    id,
    label: "Custom redaction",
    mode,
    x: finite(start.x),
    y: finite(start.y),
    width: finite(end.x) - finite(start.x),
    height: finite(end.y) - finite(start.y),
  });
}

export function createPresetRectangle(presetKey, id, mode = "black") {
  const preset = BANK_STATEMENT_PRESETS[presetKey];
  if (!preset) {
    throw new TypeError(`Unknown bank-statement preset: ${presetKey}`);
  }
  return normalizeRectangle({ ...preset, id, presetKey, mode });
}

export function isUsableRectangle(rectangle, minimumSize = MIN_SIZE) {
  const normalized = normalizeRectangle(rectangle);
  return normalized.width >= minimumSize && normalized.height >= minimumSize;
}

export function moveRectangle(rectangle, deltaX = 0, deltaY = 0) {
  const normalized = normalizeRectangle(rectangle);
  return {
    ...normalized,
    x: Math.min(
      1 - normalized.width,
      Math.max(0, normalized.x + finite(deltaX)),
    ),
    y: Math.min(
      1 - normalized.height,
      Math.max(0, normalized.y + finite(deltaY)),
    ),
  };
}

export function updateRectangleBounds(rectangle, changes = {}) {
  const current = normalizeRectangle(rectangle);
  const width = Math.max(
    MIN_SIZE,
    clampUnit(changes.width == null ? current.width : changes.width),
  );
  const height = Math.max(
    MIN_SIZE,
    clampUnit(changes.height == null ? current.height : changes.height),
  );

  return {
    ...current,
    label:
      changes.label == null
        ? current.label
        : String(changes.label || "Custom redaction"),
    mode: changes.mode && REDACTION_MODES[changes.mode] ? changes.mode : current.mode,
    customText: changes.customText == null ? current.customText : String(changes.customText),
    severity: changes.severity || current.severity,
    category: changes.category || current.category,
    x: Math.min(
      1 - width,
      clampUnit(changes.x == null ? current.x : changes.x),
    ),
    y: Math.min(
      1 - height,
      clampUnit(changes.y == null ? current.y : changes.y),
    ),
    width,
    height,
  };
}

export function projectRectangle(rectangle, canvasWidth, canvasHeight) {
  const normalized = normalizeRectangle(rectangle);
  const width = Math.max(1, Math.round(finite(canvasWidth, 1)));
  const height = Math.max(1, Math.round(finite(canvasHeight, 1)));
  const left = Math.floor(normalized.x * width);
  const top = Math.floor(normalized.y * height);
  const right = Math.ceil((normalized.x + normalized.width) * width);
  const bottom = Math.ceil((normalized.y + normalized.height) * height);

  return {
    x: left,
    y: top,
    width: Math.max(0, Math.min(width, right) - left),
    height: Math.max(0, Math.min(height, bottom) - top),
  };
}

export function getRasterScale({
  width,
  height,
  rasterDpi = 144,
  maxEdge = 6000,
} = {}) {
  const safeWidth = Math.max(1, finite(width, 1));
  const safeHeight = Math.max(1, finite(height, 1));
  const safeDpi = Math.min(216, Math.max(96, finite(rasterDpi, 144)));
  return Math.min(safeDpi / 72, Math.max(1, finite(maxEdge, 6000)) /
    Math.max(safeWidth, safeHeight));
}

export function applyCanvasRedactionMask(context, projected, rectangle) {
  const { x, y, width, height } = projected;
  if (width <= 0 || height <= 0) return;

  context.save();
  context.globalAlpha = 1;
  const mode = rectangle.mode || "black";

  const surfaceFill =
    (typeof document !== "undefined" &&
      getComputedStyle(document.documentElement)
        .getPropertyValue("--surface")
        .trim()) || "#ffffff";
  const foregroundFill =
    (typeof document !== "undefined" &&
      getComputedStyle(document.documentElement)
        .getPropertyValue("--foreground")
        .trim()) || "#000000";
  const borderFill =
    (typeof document !== "undefined" &&
      getComputedStyle(document.documentElement)
        .getPropertyValue("--border")
        .trim()) || "#cbd5e1";
  const primaryFill =
    (typeof document !== "undefined" &&
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim()) || "#2563eb";
  const dangerFill =
    (typeof document !== "undefined" &&
      getComputedStyle(document.documentElement)
        .getPropertyValue("--danger")
        .trim()) || "#ef4444";

  if (mode === "white") {
    context.fillStyle = surfaceFill;
    context.fillRect(x, y, width, height);
    context.strokeStyle = borderFill;
    context.lineWidth = 1;
    context.strokeRect(x, y, width, height);
  } else if (mode === "blur") {
    try {
      context.filter = "blur(12px)";
      context.drawImage(context.canvas, x, y, width, height, x, y, width, height);
      context.filter = "none";
    } catch {
      context.fillStyle = foregroundFill;
      context.fillRect(x, y, width, height);
    }
  } else if (mode === "pixelate") {
    const size = Math.max(4, Math.min(16, Math.floor(width / 10)));
    const smallCanvas = document.createElement("canvas");
    const smallW = Math.max(1, Math.floor(width / size));
    const smallH = Math.max(1, Math.floor(height / size));
    smallCanvas.width = smallW;
    smallCanvas.height = smallH;
    const smallCtx = smallCanvas.getContext("2d");
    if (smallCtx) {
      smallCtx.imageSmoothingEnabled = false;
      smallCtx.drawImage(context.canvas, x, y, width, height, 0, 0, smallW, smallH);
      context.imageSmoothingEnabled = false;
      context.drawImage(smallCanvas, 0, 0, smallW, smallH, x, y, width, height);
      context.imageSmoothingEnabled = true;
    } else {
      context.fillStyle = foregroundFill;
      context.fillRect(x, y, width, height);
    }
  } else if (mode === "mask_x") {
    context.fillStyle = foregroundFill;
    context.fillRect(x, y, width, height);
    context.fillStyle = surfaceFill;
    context.font = `bold ${Math.max(10, Math.min(18, Math.floor(height * 0.6)))}px monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("X".repeat(Math.max(4, Math.floor(width / 12))), x + width / 2, y + height / 2);
  } else if (mode === "redacted_text") {
    context.fillStyle = foregroundFill;
    context.fillRect(x, y, width, height);
    context.fillStyle = dangerFill;
    context.font = `bold ${Math.max(10, Math.min(16, Math.floor(height * 0.55)))}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("[REDACTED]", x + width / 2, y + height / 2);
  } else if (mode === "custom") {
    context.fillStyle = foregroundFill;
    context.fillRect(x, y, width, height);
    context.fillStyle = primaryFill;
    context.font = `bold ${Math.max(10, Math.min(16, Math.floor(height * 0.55)))}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(rectangle.customText || "[CONFIDENTIAL]", x + width / 2, y + height / 2);
  } else {
    // Default: permanent solid foreground box
    context.fillStyle = foregroundFill;
    context.fillRect(x, y, width, height);
  }

  context.restore();
}

export function buildExportPlan({
  sourceType,
  pages = [],
  rasterDpi = 144,
} = {}) {
  if (sourceType !== "pdf" && sourceType !== "image") {
    throw new TypeError("sourceType must be pdf or image");
  }

  const normalizedPages = pages.map((page, index) => ({
    pageNumber: finite(page.pageNumber, index + 1),
    rectangles: (Array.isArray(page.rectangles) ? page.rectangles : [])
      .map(normalizeRectangle)
      .filter((rectangle) => isUsableRectangle(rectangle)),
  }));
  const totalRedactions = normalizedPages.reduce(
    (total, page) => total + page.rectangles.length,
    0,
  );

  return {
    sourceType,
    outputType: sourceType === "pdf" ? "application/pdf" : "image/png",
    rasterDpi: Math.min(216, Math.max(96, finite(rasterDpi, 144))),
    pages: normalizedPages,
    totalPages: normalizedPages.length,
    totalRedactions,
    pagesWithoutRedactions: normalizedPages
      .filter((page) => page.rectangles.length === 0)
      .map((page) => page.pageNumber),
    shouldFlatten: true,
    retainsSourceText: false,
    retainsSourceObjects: false,
  };
}

export function buildOutputName(filename = "bank-statement", sourceType = "pdf") {
  const base =
    String(filename)
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "bank-statement";
  return `${base}-redacted.${sourceType === "pdf" ? "pdf" : "png"}`;
}

export function calculatePrivacyScore(detectedItems = [], appliedRedactions = []) {
  const totalDetected = detectedItems.length;
  if (totalDetected === 0) {
    return {
      score: 100,
      riskLevel: "Low",
      highRiskCount: 0,
      medRiskCount: 0,
      lowRiskCount: 0,
      totalDetected: 0,
      totalRedacted: appliedRedactions.length,
      unhandledHighRisk: 0,
      advice: ["No sensitive items detected. Your statement appears clean, but verify manually."],
    };
  }

  const unhandledItems = detectedItems.filter(
    (item) => item.status !== "redacted" && item.status !== "ignored",
  );
  const unhandledHigh = unhandledItems.filter((i) => i.severity === "high").length;
  const unhandledMed = unhandledItems.filter((i) => i.severity === "medium").length;
  const unhandledLow = unhandledItems.filter((i) => i.severity === "low").length;

  const penalty = unhandledHigh * 25 + unhandledMed * 12 + unhandledLow * 5;
  const score = Math.max(0, Math.min(100, 100 - penalty));

  let riskLevel = "Low";
  if (score < 50 || unhandledHigh > 0) riskLevel = "High";
  else if (score < 80 || unhandledMed > 0) riskLevel = "Medium";

  const advice = [];
  if (unhandledHigh > 0) {
    advice.push(`⚠️ ${unhandledHigh} high-risk item(s) (Account/Cards/PAN/Aadhaar) are still exposed.`);
  }
  if (unhandledMed > 0) {
    advice.push(`⚡ ${unhandledMed} medium-risk item(s) (Balances/UPI/Phone) remain unmasked.`);
  }
  if (score === 100) {
    advice.push(`🛡️ 100% Privacy Score achieved! All detected sensitive fields are covered.`);
  }

  return {
    score,
    riskLevel,
    highRiskCount: unhandledHigh,
    totalDetected,
    totalRedacted: appliedRedactions.length,
    unhandledCount: unhandledItems.length,
    advice,
  };
}

export function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}
