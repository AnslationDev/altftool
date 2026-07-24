const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function validBounds(bounds) {
  return (
    Number.isFinite(bounds?.width) &&
    Number.isFinite(bounds?.height) &&
    bounds.width > 0 &&
    bounds.height > 0
  );
}

export function normalizeRect(start, end, bounds, minSize = 8) {
  if (!validBounds(bounds) || !start || !end) return null;

  const startX = clamp(Number(start.x) || 0, 0, bounds.width);
  const startY = clamp(Number(start.y) || 0, 0, bounds.height);
  const endX = clamp(Number(end.x) || 0, 0, bounds.width);
  const endY = clamp(Number(end.y) || 0, 0, bounds.height);
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  if (width < minSize || height < minSize) return null;
  return { x, y, width, height };
}

export function clampRect(rect, bounds, minSize = 1) {
  if (!validBounds(bounds) || !rect) return null;

  const x = clamp(Number(rect.x) || 0, 0, Math.max(0, bounds.width - minSize));
  const y = clamp(Number(rect.y) || 0, 0, Math.max(0, bounds.height - minSize));
  const width = clamp(Number(rect.width) || minSize, minSize, bounds.width - x);
  const height = clamp(Number(rect.height) || minSize, minSize, bounds.height - y);

  return { x, y, width, height };
}

export function rectToPercent(rect, bounds) {
  const safe = clampRect(rect, bounds);
  if (!safe) return null;

  return {
    x: (safe.x / bounds.width) * 100,
    y: (safe.y / bounds.height) * 100,
    width: (safe.width / bounds.width) * 100,
    height: (safe.height / bounds.height) * 100,
  };
}

export function percentRectToPixels(rect, bounds) {
  if (!validBounds(bounds) || !rect) return null;

  const widthPercent = clamp(Number(rect.width) || 1, 1, 100);
  const heightPercent = clamp(Number(rect.height) || 1, 1, 100);
  const xPercent = clamp(Number(rect.x) || 0, 0, 100 - widthPercent);
  const yPercent = clamp(Number(rect.y) || 0, 0, 100 - heightPercent);

  return clampRect(
    {
      x: (xPercent / 100) * bounds.width,
      y: (yPercent / 100) * bounds.height,
      width: (widthPercent / 100) * bounds.width,
      height: (heightPercent / 100) * bounds.height,
    },
    bounds,
  );
}

export function createPresetRect(bounds, preset = "center") {
  if (!validBounds(bounds)) return null;

  const presets = {
    center: { x: 30, y: 35, width: 40, height: 30 },
    top: { x: 10, y: 5, width: 80, height: 22 },
    bottom: { x: 10, y: 73, width: 80, height: 22 },
  };

  return percentRectToPixels(presets[preset] || presets.center, bounds);
}

function luminance(red, green, blue) {
  return (red * 54 + green * 183 + blue * 19) / 256;
}

function inspectCell(data, width, height, x, y, cellWidth, cellHeight) {
  let minimum = 255;
  let maximum = 0;
  let darkPixels = 0;
  let lightPixels = 0;
  let sum = 0;
  let sumSquares = 0;
  let transitions = 0;
  let comparisons = 0;

  for (let row = y; row < Math.min(y + cellHeight, height); row += 1) {
    for (let column = x; column < Math.min(x + cellWidth, width); column += 1) {
      const index = (row * width + column) * 4;
      const current = luminance(data[index], data[index + 1], data[index + 2]);
      minimum = Math.min(minimum, current);
      maximum = Math.max(maximum, current);
      sum += current;
      sumSquares += current * current;
      if (current < 96) darkPixels += 1;
      if (current > 160) lightPixels += 1;

      if (column + 1 < Math.min(x + cellWidth, width)) {
        const rightIndex = index + 4;
        const right = luminance(data[rightIndex], data[rightIndex + 1], data[rightIndex + 2]);
        if (Math.abs(current - right) >= 56) transitions += 1;
        comparisons += 1;
      }

      if (row + 1 < Math.min(y + cellHeight, height)) {
        const belowIndex = index + width * 4;
        const below = luminance(data[belowIndex], data[belowIndex + 1], data[belowIndex + 2]);
        if (Math.abs(current - below) >= 56) transitions += 1;
        comparisons += 1;
      }
    }
  }

  const pixelCount = Math.max(1, cellWidth * cellHeight);
  const mean = sum / pixelCount;
  const variance = Math.max(0, sumSquares / pixelCount - mean * mean);
  const contrastRange = (maximum - minimum) / 255;
  const edgeDensity = comparisons ? transitions / comparisons : 0;
  const splitPixels = darkPixels + lightPixels;
  const lightDarkBalance = splitPixels
    ? 1 - Math.abs(darkPixels - lightPixels) / splitPixels
    : 0;
  const normalizedDeviation = Math.min(1, Math.sqrt(variance) / 127.5);
  const score =
    edgeDensity * 0.45 +
    contrastRange * 0.2 +
    lightDarkBalance * 0.2 +
    normalizedDeviation * 0.15;

  return { score, contrastRange, edgeDensity };
}

export function scanContrastRegions(
  imageData,
  { cellSize: requestedCellSize, threshold = 0.42, maxResults = 6 } = {},
) {
  const { data, width, height } = imageData || {};
  if (
    !data ||
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width <= 0 ||
    height <= 0 ||
    data.length < width * height * 4
  ) {
    return [];
  }

  const automaticCellSize = Math.max(24, Math.floor(Math.min(width, height) / 9));
  const cellSize = clamp(
    Math.floor(Number(requestedCellSize) || automaticCellSize),
    8,
    Math.max(8, Math.min(width, height)),
  );
  const candidates = [];

  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0; x < width; x += cellSize) {
      const cellWidth = Math.min(cellSize, width - x);
      const cellHeight = Math.min(cellSize, height - y);
      if (cellWidth < cellSize / 2 || cellHeight < cellSize / 2) continue;

      const metrics = inspectCell(data, width, height, x, y, cellWidth, cellHeight);
      if (
        metrics.score >= threshold &&
        metrics.contrastRange >= 0.45 &&
        metrics.edgeDensity >= 0.08
      ) {
        const padding = Math.floor(cellSize / 5);
        const rect = clampRect(
          {
            x: x - padding,
            y: y - padding,
            width: cellWidth + padding * 2,
            height: cellHeight + padding * 2,
          },
          { width, height },
        );
        candidates.push({ rect, score: metrics.score });
      }
    }
  }

  return candidates
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(0, Math.floor(maxResults)))
    .map((candidate, index) => ({
      id: `contrast-${index + 1}`,
      label: `Contrast pattern ${index + 1}`,
      confidence: Math.round(candidate.score * 100),
      rect: candidate.rect,
    }));
}
