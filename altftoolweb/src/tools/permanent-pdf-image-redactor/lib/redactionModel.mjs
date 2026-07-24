const MIN_NORMALIZED_SIZE = 0.002;

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function clampUnit(value) {
  return Math.min(1, Math.max(0, finiteNumber(value)));
}

export function normalizeRectangle(rectangle = {}) {
  const rawX = finiteNumber(rectangle.x);
  const rawY = finiteNumber(rectangle.y);
  const rawWidth = finiteNumber(rectangle.width);
  const rawHeight = finiteNumber(rectangle.height);

  const startX = clampUnit(Math.min(rawX, rawX + rawWidth));
  const endX = clampUnit(Math.max(rawX, rawX + rawWidth));
  const startY = clampUnit(Math.min(rawY, rawY + rawHeight));
  const endY = clampUnit(Math.max(rawY, rawY + rawHeight));

  return {
    id: rectangle.id == null ? undefined : String(rectangle.id),
    x: startX,
    y: startY,
    width: Math.max(0, endX - startX),
    height: Math.max(0, endY - startY),
  };
}

export function rectangleFromPoints(start = {}, end = {}, id) {
  return normalizeRectangle({
    id,
    x: finiteNumber(start.x),
    y: finiteNumber(start.y),
    width: finiteNumber(end.x) - finiteNumber(start.x),
    height: finiteNumber(end.y) - finiteNumber(start.y),
  });
}

export function isUsableRectangle(rectangle, minimumSize = MIN_NORMALIZED_SIZE) {
  const normalized = normalizeRectangle(rectangle);
  return normalized.width >= minimumSize && normalized.height >= minimumSize;
}

export function moveRectangle(rectangle, deltaX = 0, deltaY = 0) {
  const normalized = normalizeRectangle(rectangle);
  const x = Math.min(
    1 - normalized.width,
    Math.max(0, normalized.x + finiteNumber(deltaX)),
  );
  const y = Math.min(
    1 - normalized.height,
    Math.max(0, normalized.y + finiteNumber(deltaY)),
  );

  return {
    ...normalized,
    x,
    y,
  };
}

export function updateRectangleBounds(rectangle, changes = {}) {
  const current = normalizeRectangle(rectangle);
  const width = Math.max(
    MIN_NORMALIZED_SIZE,
    clampUnit(
      changes.width == null ? current.width : finiteNumber(changes.width),
    ),
  );
  const height = Math.max(
    MIN_NORMALIZED_SIZE,
    clampUnit(
      changes.height == null ? current.height : finiteNumber(changes.height),
    ),
  );
  const x = Math.min(
    1 - width,
    clampUnit(changes.x == null ? current.x : finiteNumber(changes.x)),
  );
  const y = Math.min(
    1 - height,
    clampUnit(changes.y == null ? current.y : finiteNumber(changes.y)),
  );

  return {
    id: current.id,
    x,
    y,
    width,
    height,
  };
}

export function projectRectangle(rectangle, canvasWidth, canvasHeight) {
  const normalized = normalizeRectangle(rectangle);
  const width = Math.max(1, Math.round(finiteNumber(canvasWidth, 1)));
  const height = Math.max(1, Math.round(finiteNumber(canvasHeight, 1)));
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
    throw new TypeError("sourceType must be either pdf or image");
  }

  const normalizedPages = pages.map((page, index) => ({
    pageNumber: finiteNumber(page.pageNumber, index + 1),
    rectangles: (Array.isArray(page.rectangles) ? page.rectangles : [])
      .map(normalizeRectangle)
      .filter((rectangle) => isUsableRectangle(rectangle)),
  }));

  return {
    sourceType,
    outputType: sourceType === "pdf" ? "application/pdf" : "image/png",
    rasterDpi: Math.min(216, Math.max(96, finiteNumber(rasterDpi, 144))),
    shouldFlatten: true,
    retainsSourceObjects: false,
    totalPages: normalizedPages.length,
    totalRedactions: normalizedPages.reduce(
      (total, page) => total + page.rectangles.length,
      0,
    ),
    pages: normalizedPages,
  };
}
