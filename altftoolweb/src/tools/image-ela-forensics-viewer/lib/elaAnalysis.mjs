export const ELA_SUMMARY_SCHEMA = "altftool.image-ela-summary.v1";

export const ELA_LIMITS = Object.freeze({
  maxFileBytes: 20 * 1024 * 1024,
  maxHeaderBytes: 256 * 1024,
  maxSourceEdge: 6_000,
  maxSourcePixels: 16_000_000,
  maxImageEdge: 2_400,
  maxProcessingPixels: 4_000_000,
  minJpegQuality: 30,
  maxJpegQuality: 95,
  minDisplayGain: 1,
  maxDisplayGain: 30,
  maxGridAxis: 8,
  maxGridCells: 64,
});

export const SUPPORTED_MIME_TYPES = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const ELA_LIMITATIONS = Object.freeze([
  "ELA is a visualization of differences created by another JPEG encoding pass; it is not a tamper detector and provides no authentic-or-manipulated verdict.",
  "Benign recompression, ordinary edits, resizing or scaling, camera and phone processing pipelines, synthetic-image generation, and multiple saves can all change residual patterns.",
  "Uniform residuals can occur in edited images, while uneven residuals can occur in unedited images, so both false positives and false negatives are possible.",
  "ELA is generally most interpretable on JPEG sources. PNG and WebP inputs measure a cross-format conversion into JPEG and require still more caution.",
  "Browser JPEG encoders can differ, and the original save quality is usually unknown; results from different browsers or settings are not directly equivalent.",
  "These measurements do not establish evidentiary truth, provenance, authorship, capture time, or legal admissibility.",
]);

function assertRgbaPixels(value, label) {
  if (
    !value ||
    typeof value.length !== "number" ||
    value.length % 4 !== 0
  ) {
    throw new TypeError(`${label} must be an RGBA pixel array.`);
  }
  const pixelCount = value.length / 4;
  if (!pixelCount || pixelCount > ELA_LIMITS.maxProcessingPixels) {
    throw new RangeError(
      `${label} must contain between 1 and ${ELA_LIMITS.maxProcessingPixels.toLocaleString("en-US")} pixels.`,
    );
  }
  return pixelCount;
}

function assertMagnitudes(value) {
  if (!value || typeof value.length !== "number" || !value.length) {
    throw new TypeError("Residual magnitudes are required.");
  }
  if (value.length > ELA_LIMITS.maxProcessingPixels) {
    throw new RangeError("Residual magnitudes exceed the processing limit.");
  }
}

function roundMetric(value, digits = 3) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function percentileFromHistogram(histogram, pixelCount, percentile) {
  const target = Math.max(1, Math.ceil(pixelCount * percentile));
  let cumulative = 0;
  for (let value = 0; value < histogram.length; value += 1) {
    cumulative += histogram[value];
    if (cumulative >= target) return value;
  }
  return 255;
}

function histogramForMagnitudes(magnitudes) {
  const histogram = new Uint32Array(256);
  for (const value of magnitudes) {
    histogram[Math.max(0, Math.min(255, Math.round(Number(value) || 0)))] += 1;
  }
  return histogram;
}

function bytesFrom(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  return null;
}

function readUint16BigEndian(bytes, offset) {
  if (offset < 0 || offset + 2 > bytes.length) return null;
  return bytes[offset] * 256 + bytes[offset + 1];
}

function readUint24LittleEndian(bytes, offset) {
  if (offset < 0 || offset + 3 > bytes.length) return null;
  return bytes[offset] + bytes[offset + 1] * 256 + bytes[offset + 2] * 65_536;
}

function readUint32BigEndian(bytes, offset) {
  if (offset < 0 || offset + 4 > bytes.length) return null;
  return (
    bytes[offset] * 16_777_216 +
    bytes[offset + 1] * 65_536 +
    bytes[offset + 2] * 256 +
    bytes[offset + 3]
  );
}

function readUint32LittleEndian(bytes, offset) {
  if (offset < 0 || offset + 4 > bytes.length) return null;
  return (
    bytes[offset] +
    bytes[offset + 1] * 256 +
    bytes[offset + 2] * 65_536 +
    bytes[offset + 3] * 16_777_216
  );
}

function fourCharacterCode(bytes, offset) {
  if (offset < 0 || offset + 4 > bytes.length) return "";
  return String.fromCharCode(
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3],
  );
}

function dimensions(width, height, mimeType) {
  return width > 0 && height > 0 ? { width, height, mimeType } : null;
}

function parsePngDimensions(bytes) {
  if (
    bytes.length < 24 ||
    fourCharacterCode(bytes, 12) !== "IHDR"
  ) {
    return null;
  }
  return dimensions(
    readUint32BigEndian(bytes, 16),
    readUint32BigEndian(bytes, 20),
    "image/png",
  );
}

const JPEG_START_OF_FRAME_MARKERS = new Set([
  0xc0,
  0xc1,
  0xc2,
  0xc3,
  0xc5,
  0xc6,
  0xc7,
  0xc9,
  0xca,
  0xcb,
  0xcd,
  0xce,
  0xcf,
]);

function parseJpegDimensions(bytes) {
  let offset = 2;
  while (offset + 1 < bytes.length) {
    while (offset < bytes.length && bytes[offset] !== 0xff) offset += 1;
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) return null;
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0x00) continue;
    if (
      marker === 0x01 ||
      marker === 0xd8 ||
      marker === 0xd9 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      continue;
    }
    if (marker === 0xda) return null;
    const segmentLength = readUint16BigEndian(bytes, offset);
    if (segmentLength === null || segmentLength < 2) return null;
    if (JPEG_START_OF_FRAME_MARKERS.has(marker)) {
      if (offset + 7 > bytes.length) return null;
      return dimensions(
        readUint16BigEndian(bytes, offset + 5),
        readUint16BigEndian(bytes, offset + 3),
        "image/jpeg",
      );
    }
    if (offset + segmentLength > bytes.length) return null;
    offset += segmentLength;
  }
  return null;
}

function parseWebpDimensions(bytes) {
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const chunkType = fourCharacterCode(bytes, offset);
    const chunkLength = readUint32LittleEndian(bytes, offset + 4);
    if (chunkLength === null) return null;
    const payloadOffset = offset + 8;

    if (chunkType === "VP8X" && chunkLength >= 10) {
      const widthMinusOne = readUint24LittleEndian(bytes, payloadOffset + 4);
      const heightMinusOne = readUint24LittleEndian(bytes, payloadOffset + 7);
      if (widthMinusOne === null || heightMinusOne === null) return null;
      return dimensions(
        widthMinusOne + 1,
        heightMinusOne + 1,
        "image/webp",
      );
    }
    if (chunkType === "VP8 " && chunkLength >= 10) {
      if (payloadOffset + 10 > bytes.length) return null;
      if (
        bytes[payloadOffset + 3] !== 0x9d ||
        bytes[payloadOffset + 4] !== 0x01 ||
        bytes[payloadOffset + 5] !== 0x2a
      ) {
        return null;
      }
      const rawWidth =
        bytes[payloadOffset + 6] + bytes[payloadOffset + 7] * 256;
      const rawHeight =
        bytes[payloadOffset + 8] + bytes[payloadOffset + 9] * 256;
      return dimensions(
        rawWidth & 0x3fff,
        rawHeight & 0x3fff,
        "image/webp",
      );
    }
    if (chunkType === "VP8L" && chunkLength >= 5) {
      if (
        payloadOffset + 5 > bytes.length ||
        bytes[payloadOffset] !== 0x2f
      ) {
        return null;
      }
      const first = bytes[payloadOffset + 1];
      const second = bytes[payloadOffset + 2];
      const third = bytes[payloadOffset + 3];
      const fourth = bytes[payloadOffset + 4];
      return dimensions(
        1 + first + ((second & 0x3f) << 8),
        1 + (second >> 6) + (third << 2) + ((fourth & 0x0f) << 10),
        "image/webp",
      );
    }

    const paddedLength = chunkLength + (chunkLength % 2);
    const nextOffset = payloadOffset + paddedLength;
    if (
      !Number.isSafeInteger(nextOffset) ||
      nextOffset <= offset ||
      nextOffset > bytes.length
    ) {
      return null;
    }
    offset = nextOffset;
  }
  return null;
}

export function detectRasterMime(bytes) {
  const data = bytesFrom(bytes) || new Uint8Array();
  if (
    data.length >= 3 &&
    data[0] === 0xff &&
    data[1] === 0xd8 &&
    data[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    data.length >= 8 &&
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47 &&
    data[4] === 0x0d &&
    data[5] === 0x0a &&
    data[6] === 0x1a &&
    data[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    data.length >= 12 &&
    data[0] === 0x52 &&
    data[1] === 0x49 &&
    data[2] === 0x46 &&
    data[3] === 0x46 &&
    data[8] === 0x57 &&
    data[9] === 0x45 &&
    data[10] === 0x42 &&
    data[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export function parseRasterDimensions(value) {
  const bytes = bytesFrom(value);
  if (!bytes) return null;
  const mimeType = detectRasterMime(bytes);
  if (mimeType === "image/png") return parsePngDimensions(bytes);
  if (mimeType === "image/jpeg") return parseJpegDimensions(bytes);
  if (mimeType === "image/webp") return parseWebpDimensions(bytes);
  return null;
}

export function validateRasterDimensions(
  value,
  {
    maxEdge = ELA_LIMITS.maxSourceEdge,
    maxPixels = ELA_LIMITS.maxSourcePixels,
  } = {},
) {
  const width = Number(value?.width);
  const height = Number(value?.height);
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width < 1 ||
    height < 1
  ) {
    return { ok: false, code: "invalid-dimensions", pixelCount: null };
  }
  const pixelCount = width * height;
  if (!Number.isSafeInteger(pixelCount)) {
    return { ok: false, code: "invalid-dimensions", pixelCount: null };
  }
  if (width > maxEdge || height > maxEdge) {
    return { ok: false, code: "edge-limit", pixelCount };
  }
  if (pixelCount > maxPixels) {
    return { ok: false, code: "pixel-limit", pixelCount };
  }
  return { ok: true, code: "accepted", pixelCount };
}

export function calculateWorkingDimensions(width, height) {
  const sourceWidth = Number(width);
  const sourceHeight = Number(height);
  if (
    !Number.isSafeInteger(sourceWidth) ||
    !Number.isSafeInteger(sourceHeight) ||
    sourceWidth < 1 ||
    sourceHeight < 1
  ) {
    throw new TypeError("Image dimensions must be positive integers.");
  }

  const edgeScale = Math.min(
    1,
    ELA_LIMITS.maxImageEdge / Math.max(sourceWidth, sourceHeight),
  );
  const pixelScale = Math.min(
    1,
    Math.sqrt(
      ELA_LIMITS.maxProcessingPixels / (sourceWidth * sourceHeight),
    ),
  );
  const scale = Math.min(edgeScale, pixelScale);
  const processedWidth = Math.max(1, Math.floor(sourceWidth * scale));
  const processedHeight = Math.max(1, Math.floor(sourceHeight * scale));

  return {
    sourceWidth,
    sourceHeight,
    processedWidth,
    processedHeight,
    scale: roundMetric(scale, 6),
    downscaled:
      processedWidth !== sourceWidth || processedHeight !== sourceHeight,
  };
}

export function computeAbsoluteResidualMagnitudes(original, recompressed) {
  const pixelCount = assertRgbaPixels(original, "Original pixels");
  const comparisonPixelCount = assertRgbaPixels(
    recompressed,
    "Recompressed pixels",
  );
  if (
    pixelCount !== comparisonPixelCount ||
    original.length !== recompressed.length
  ) {
    throw new RangeError("Pixel arrays must have identical dimensions.");
  }

  const magnitudes = new Uint8Array(pixelCount);
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const offset = pixel * 4;
    const redDifference = Math.abs(
      Number(original[offset]) - Number(recompressed[offset]),
    );
    const greenDifference = Math.abs(
      Number(original[offset + 1]) - Number(recompressed[offset + 1]),
    );
    const blueDifference = Math.abs(
      Number(original[offset + 2]) - Number(recompressed[offset + 2]),
    );
    magnitudes[pixel] = Math.round(
      (redDifference + greenDifference + blueDifference) / 3,
    );
  }
  return magnitudes;
}

export function summarizeResidualMagnitudes(magnitudes) {
  assertMagnitudes(magnitudes);
  const histogram = histogramForMagnitudes(magnitudes);
  let sum = 0;
  let squaredSum = 0;
  let nonZeroPixels = 0;
  let maximum = 0;

  for (let value = 0; value < histogram.length; value += 1) {
    const count = histogram[value];
    if (!count) continue;
    sum += value * count;
    squaredSum += value * value * count;
    if (value > 0) nonZeroPixels += count;
    maximum = value;
  }

  const pixelCount = magnitudes.length;
  return {
    pixelCount,
    mean: roundMetric(sum / pixelCount),
    rootMeanSquare: roundMetric(Math.sqrt(squaredSum / pixelCount)),
    median: percentileFromHistogram(histogram, pixelCount, 0.5),
    p95: percentileFromHistogram(histogram, pixelCount, 0.95),
    p99: percentileFromHistogram(histogram, pixelCount, 0.99),
    maximum,
    nonZeroPixels,
    nonZeroPercent: roundMetric((nonZeroPixels / pixelCount) * 100),
  };
}

export function createResidualHeatmapPixels(magnitudes, displayGain) {
  assertMagnitudes(magnitudes);
  const gain = Number(displayGain);
  if (
    !Number.isFinite(gain) ||
    gain < ELA_LIMITS.minDisplayGain ||
    gain > ELA_LIMITS.maxDisplayGain
  ) {
    throw new RangeError(
      `Display gain must be between ${ELA_LIMITS.minDisplayGain} and ${ELA_LIMITS.maxDisplayGain}.`,
    );
  }

  const heatmap = new Uint8ClampedArray(magnitudes.length * 4);
  for (let pixel = 0; pixel < magnitudes.length; pixel += 1) {
    const boosted = Math.min(255, Math.round(magnitudes[pixel] * gain));
    const offset = pixel * 4;
    heatmap[offset] = boosted;
    heatmap[offset + 1] = boosted;
    heatmap[offset + 2] = boosted;
    heatmap[offset + 3] = 255;
  }
  return heatmap;
}

export function buildResidualRegionGrid(
  magnitudes,
  width,
  height,
  columns = 4,
  rows = 4,
) {
  assertMagnitudes(magnitudes);
  const imageWidth = Number(width);
  const imageHeight = Number(height);
  const gridColumns = Number(columns);
  const gridRows = Number(rows);
  if (
    !Number.isSafeInteger(imageWidth) ||
    !Number.isSafeInteger(imageHeight) ||
    imageWidth < 1 ||
    imageHeight < 1 ||
    imageWidth * imageHeight !== magnitudes.length
  ) {
    throw new RangeError("Dimensions must match the residual pixel count.");
  }
  if (
    !Number.isSafeInteger(gridColumns) ||
    !Number.isSafeInteger(gridRows) ||
    gridColumns < 1 ||
    gridRows < 1 ||
    gridColumns > ELA_LIMITS.maxGridAxis ||
    gridRows > ELA_LIMITS.maxGridAxis ||
    gridColumns * gridRows > ELA_LIMITS.maxGridCells
  ) {
    throw new RangeError("The requested residual grid is outside the limits.");
  }

  const effectiveColumns = Math.min(gridColumns, imageWidth);
  const effectiveRows = Math.min(gridRows, imageHeight);
  const regions = [];
  for (let row = 0; row < effectiveRows; row += 1) {
    const yStart = Math.floor((row * imageHeight) / effectiveRows);
    const yEnd = Math.floor(((row + 1) * imageHeight) / effectiveRows);
    for (let column = 0; column < effectiveColumns; column += 1) {
      const xStart = Math.floor((column * imageWidth) / effectiveColumns);
      const xEnd = Math.floor(((column + 1) * imageWidth) / effectiveColumns);
      const regionValues = [];
      for (let y = yStart; y < yEnd; y += 1) {
        for (let x = xStart; x < xEnd; x += 1) {
          regionValues.push(magnitudes[y * imageWidth + x]);
        }
      }
      const summary = summarizeResidualMagnitudes(regionValues);
      regions.push({
        row: row + 1,
        column: column + 1,
        xStart,
        yStart,
        width: xEnd - xStart,
        height: yEnd - yStart,
        ...summary,
      });
    }
  }

  return {
    columns: effectiveColumns,
    rows: effectiveRows,
    regionCount: regions.length,
    regions,
  };
}

export function analyzeResidualPixels({
  original,
  recompressed,
  width,
  height,
  gridColumns = 4,
  gridRows = 4,
}) {
  const magnitudes = computeAbsoluteResidualMagnitudes(
    original,
    recompressed,
  );
  if (Number(width) * Number(height) !== magnitudes.length) {
    throw new RangeError("Dimensions must match the residual pixel count.");
  }
  return {
    magnitudes,
    summary: summarizeResidualMagnitudes(magnitudes),
    regionGrid: buildResidualRegionGrid(
      magnitudes,
      width,
      height,
      gridColumns,
      gridRows,
    ),
  };
}

export function buildPrivacySafeElaSummary({
  sourceMimeType,
  dimensions,
  jpegQuality,
  displayGain,
  residualSummary,
  regionGrid,
}) {
  const sourceFormat =
    sourceMimeType === "image/jpeg"
      ? "JPEG"
      : sourceMimeType === "image/png"
        ? "PNG"
        : sourceMimeType === "image/webp"
          ? "WebP"
          : "Unknown";
  const quality = Number(jpegQuality);
  const gain = Number(displayGain);
  if (
    !dimensions ||
    !residualSummary ||
    !regionGrid ||
    !Number.isFinite(quality) ||
    !Number.isFinite(gain)
  ) {
    throw new TypeError("Completed ELA measurements are required.");
  }

  return {
    schema: ELA_SUMMARY_SCHEMA,
    method: {
      name: "JPEG re-encoding absolute RGB residual",
      sourceFormat,
      jpegQuality: quality,
      displayGain: gain,
      displayGainAffectsMeasurements: false,
      gridColumns: regionGrid.columns,
      gridRows: regionGrid.rows,
    },
    dimensions: {
      sourceWidth: dimensions.sourceWidth,
      sourceHeight: dimensions.sourceHeight,
      processedWidth: dimensions.processedWidth,
      processedHeight: dimensions.processedHeight,
      downscaledForSafety: Boolean(dimensions.downscaled),
    },
    residualSummary: {
      pixelCount: residualSummary.pixelCount,
      mean: residualSummary.mean,
      rootMeanSquare: residualSummary.rootMeanSquare,
      median: residualSummary.median,
      p95: residualSummary.p95,
      p99: residualSummary.p99,
      maximum: residualSummary.maximum,
      nonZeroPixels: residualSummary.nonZeroPixels,
      nonZeroPercent: residualSummary.nonZeroPercent,
    },
    regionGrid: regionGrid.regions.map((region) => ({
      row: region.row,
      column: region.column,
      pixelCount: region.pixelCount,
      mean: region.mean,
      rootMeanSquare: region.rootMeanSquare,
      median: region.median,
      p95: region.p95,
      p99: region.p99,
      maximum: region.maximum,
      nonZeroPixels: region.nonZeroPixels,
      nonZeroPercent: region.nonZeroPercent,
    })),
    privacy: {
      localOnly: true,
      includesFilename: false,
      includesImagePixels: false,
      includesImagePreview: false,
      includesFileBytes: false,
      persistentStorageUsed: false,
    },
    interpretation: {
      verdictProvided: false,
      tamperDetectionClaimed: false,
      authenticityClaimed: false,
      evidentiaryTruthClaimed: false,
    },
    limitations: [...ELA_LIMITATIONS],
  };
}
