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
    x: left,
    y: top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

export function rectangleFromPoints(start = {}, end = {}, id) {
  return normalizeRectangle({
    id,
    label: "Custom redaction",
    x: finite(start.x),
    y: finite(start.y),
    width: finite(end.x) - finite(start.x),
    height: finite(end.y) - finite(start.y),
  });
}

export function createPresetRectangle(presetKey, id) {
  const preset = BANK_STATEMENT_PRESETS[presetKey];
  if (!preset) {
    throw new TypeError(`Unknown bank-statement preset: ${presetKey}`);
  }
  return normalizeRectangle({ ...preset, id, presetKey });
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
