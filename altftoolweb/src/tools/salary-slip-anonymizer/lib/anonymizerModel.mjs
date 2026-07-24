const MIN_SIZE = 0.002;

export const SALARY_SLIP_PRESETS = Object.freeze({
  identity: Object.freeze({
    key: "identity",
    label: "Employee name & ID",
    x: 0.08,
    y: 0.1,
    width: 0.58,
    height: 0.1,
  }),
  address: Object.freeze({
    key: "address",
    label: "Address",
    x: 0.08,
    y: 0.2,
    width: 0.6,
    height: 0.13,
  }),
  accounts: Object.freeze({
    key: "accounts",
    label: "Bank, PAN & account details",
    x: 0.08,
    y: 0.68,
    width: 0.52,
    height: 0.15,
  }),
  salary: Object.freeze({
    key: "salary",
    label: "Salary amounts",
    x: 0.58,
    y: 0.43,
    width: 0.34,
    height: 0.36,
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
  const rawX = finite(rectangle.x);
  const rawY = finite(rectangle.y);
  const rawWidth = finite(rectangle.width);
  const rawHeight = finite(rectangle.height);
  const left = clampUnit(Math.min(rawX, rawX + rawWidth));
  const right = clampUnit(Math.max(rawX, rawX + rawWidth));
  const top = clampUnit(Math.min(rawY, rawY + rawHeight));
  const bottom = clampUnit(Math.max(rawY, rawY + rawHeight));

  return {
    id: rectangle.id == null ? undefined : String(rectangle.id),
    label: String(rectangle.label || "Custom mask"),
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
    label: "Custom mask",
    x: finite(start.x),
    y: finite(start.y),
    width: finite(end.x) - finite(start.x),
    height: finite(end.y) - finite(start.y),
  });
}

export function createPresetRectangle(presetKey, id) {
  const preset = SALARY_SLIP_PRESETS[presetKey];
  if (!preset) throw new TypeError(`Unknown salary-slip preset: ${presetKey}`);

  return normalizeRectangle({
    ...preset,
    id,
    presetKey,
  });
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
        : String(changes.label || "Custom mask"),
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

export function buildExportModel({
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
    pagesWithoutMasks: normalizedPages
      .filter((page) => page.rectangles.length === 0)
      .map((page) => page.pageNumber),
    shouldFlatten: true,
    retainsSourceText: false,
    retainsSourceObjects: false,
  };
}
