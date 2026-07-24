const EPSILON = 1e-9;

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function clampUnit(value) {
  return Math.min(1, Math.max(0, finiteNumber(value)));
}

export function defaultDocumentCorners() {
  return [
    { id: "top-left", x: 0, y: 0 },
    { id: "top-right", x: 1, y: 0 },
    { id: "bottom-right", x: 1, y: 1 },
    { id: "bottom-left", x: 0, y: 1 },
  ];
}

export function polygonArea(points = []) {
  if (!Array.isArray(points) || points.length < 3) return 0;

  return (
    points.reduce((total, point, index) => {
      const next = points[(index + 1) % points.length];
      return (
        total +
        finiteNumber(point?.x) * finiteNumber(next?.y) -
        finiteNumber(next?.x) * finiteNumber(point?.y)
      );
    }, 0) / 2
  );
}

function crossProduct(a, b, c) {
  return (
    (finiteNumber(b?.x) - finiteNumber(a?.x)) *
      (finiteNumber(c?.y) - finiteNumber(b?.y)) -
    (finiteNumber(b?.y) - finiteNumber(a?.y)) *
      (finiteNumber(c?.x) - finiteNumber(b?.x))
  );
}

export function isValidDocumentQuad(points = [], minimumArea = 0.01) {
  if (!Array.isArray(points) || points.length !== 4) return false;
  if (
    points.some(
      (point) =>
        !Number.isFinite(Number(point?.x)) ||
        !Number.isFinite(Number(point?.y)) ||
        Number(point.x) < 0 ||
        Number(point.x) > 1 ||
        Number(point.y) < 0 ||
        Number(point.y) > 1,
    )
  ) {
    return false;
  }

  if (Math.abs(polygonArea(points)) < Math.max(0, finiteNumber(minimumArea, 0.01))) {
    return false;
  }

  const turns = points.map((point, index) =>
    crossProduct(point, points[(index + 1) % 4], points[(index + 2) % 4]),
  );
  const positive = turns.every((turn) => turn > EPSILON);
  const negative = turns.every((turn) => turn < -EPSILON);
  return positive || negative;
}

export function moveDocumentCorner(points = [], id, nextPosition = {}) {
  if (!Array.isArray(points) || points.length !== 4) return points;
  const next = points.map((point) =>
    point.id === id
      ? {
          ...point,
          x: clampUnit(nextPosition.x),
          y: clampUnit(nextPosition.y),
        }
      : { ...point },
  );

  return isValidDocumentQuad(next) ? next : points;
}

export function toPixelCorners(points = [], width, height) {
  const safeWidth = Math.max(1, finiteNumber(width, 1));
  const safeHeight = Math.max(1, finiteNumber(height, 1));
  return points.map((point) => ({
    id: point.id,
    x: clampUnit(point.x) * safeWidth,
    y: clampUnit(point.y) * safeHeight,
  }));
}

function distance(a, b) {
  return Math.hypot(
    finiteNumber(b?.x) - finiteNumber(a?.x),
    finiteNumber(b?.y) - finiteNumber(a?.y),
  );
}

export function estimateOutputDimensions(
  pixelCorners = [],
  { maxDimension = 3000, maxPixels = 6_000_000 } = {},
) {
  if (!Array.isArray(pixelCorners) || pixelCorners.length !== 4) {
    return { width: 1, height: 1, scale: 1 };
  }

  const rawWidth = Math.max(
    1,
    (distance(pixelCorners[0], pixelCorners[1]) +
      distance(pixelCorners[3], pixelCorners[2])) /
      2,
  );
  const rawHeight = Math.max(
    1,
    (distance(pixelCorners[0], pixelCorners[3]) +
      distance(pixelCorners[1], pixelCorners[2])) /
      2,
  );
  const dimensionLimit = Math.max(1, finiteNumber(maxDimension, 3000));
  const pixelLimit = Math.max(1, finiteNumber(maxPixels, 6_000_000));
  const scale = Math.min(
    1,
    dimensionLimit / Math.max(rawWidth, rawHeight),
    Math.sqrt(pixelLimit / (rawWidth * rawHeight)),
  );

  return {
    width: Math.max(2, Math.round(rawWidth * scale)),
    height: Math.max(2, Math.round(rawHeight * scale)),
    scale,
  };
}

function solveLinearSystem(matrix, values) {
  const size = values.length;
  const rows = matrix.map((row, index) => [...row, values[index]]);

  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) pivot = row;
    }
    if (Math.abs(rows[pivot][column]) < EPSILON) {
      throw new RangeError("The selected document corners cannot form a perspective crop.");
    }
    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];

    const divisor = rows[column][column];
    for (let entry = column; entry <= size; entry += 1) {
      rows[column][entry] /= divisor;
    }

    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = rows[row][column];
      for (let entry = column; entry <= size; entry += 1) {
        rows[row][entry] -= factor * rows[column][entry];
      }
    }
  }

  return rows.map((row) => row[size]);
}

export function computeHomography(fromPoints = [], toPoints = []) {
  if (fromPoints.length !== 4 || toPoints.length !== 4) {
    throw new TypeError("A homography requires exactly four source and four destination points.");
  }

  const matrix = [];
  const values = [];
  fromPoints.forEach((fromPoint, index) => {
    const x = finiteNumber(fromPoint?.x);
    const y = finiteNumber(fromPoint?.y);
    const u = finiteNumber(toPoints[index]?.x);
    const v = finiteNumber(toPoints[index]?.y);
    matrix.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    values.push(u);
    matrix.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    values.push(v);
  });

  const solved = solveLinearSystem(matrix, values);
  return [...solved, 1];
}

export function projectPoint(homography, point = {}) {
  if (!Array.isArray(homography) || homography.length !== 9) {
    throw new TypeError("A homography must contain nine values.");
  }
  const x = finiteNumber(point.x);
  const y = finiteNumber(point.y);
  const denominator = homography[6] * x + homography[7] * y + homography[8];
  if (Math.abs(denominator) < EPSILON) {
    throw new RangeError("The perspective projection is undefined at this point.");
  }
  return {
    x: (homography[0] * x + homography[1] * y + homography[2]) / denominator,
    y: (homography[3] * x + homography[4] * y + homography[5]) / denominator,
  };
}

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(finiteNumber(value))));
}

export function applyDocumentTone(
  red,
  green,
  blue,
  {
    mode = "color",
    brightness = 100,
    contrast = 100,
    threshold = 150,
  } = {},
) {
  const brightnessFactor = Math.max(0, finiteNumber(brightness, 100)) / 100;
  const contrastFactor = Math.max(0, finiteNumber(contrast, 100)) / 100;
  const adjust = (channel) =>
    (finiteNumber(channel) * brightnessFactor - 128) * contrastFactor + 128;

  let channels = [adjust(red), adjust(green), adjust(blue)];
  if (mode === "grayscale" || mode === "black-white") {
    const luminance =
      channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    const value =
      mode === "black-white"
        ? luminance >= finiteNumber(threshold, 150)
          ? 255
          : 0
        : luminance;
    channels = [value, value, value];
  }

  return channels.map(clampChannel);
}
