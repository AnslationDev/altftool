export const watermarkRasterLimits = Object.freeze({
  maxFileBytes: 20 * 1024 * 1024,
  maxHeaderBytes: 256 * 1024,
  maxSourceEdge: 6_000,
  maxSourcePixels: 16_000_000,
  maxWorkingEdge: 2_400,
  maxWorkingPixels: 4_000_000,
});

function rasterBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
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

function rasterDimensions(width, height, mediaType) {
  return width > 0 && height > 0 ? { width, height, mediaType } : null;
}

function detectWatermarkRasterType(bytes) {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    fourCharacterCode(bytes, 0) === "RIFF" &&
    fourCharacterCode(bytes, 8) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

function parsePngDimensions(bytes) {
  if (bytes.length < 24 || fourCharacterCode(bytes, 12) !== "IHDR") {
    return null;
  }
  return rasterDimensions(
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
      return rasterDimensions(
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
      return rasterDimensions(
        widthMinusOne + 1,
        heightMinusOne + 1,
        "image/webp",
      );
    }
    if (chunkType === "VP8 " && chunkLength >= 10) {
      if (
        payloadOffset + 10 > bytes.length ||
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
      return rasterDimensions(
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
      return rasterDimensions(
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

export function parseWatermarkRasterDimensions(value) {
  const bytes = rasterBytes(value);
  if (!bytes) return null;
  const mediaType = detectWatermarkRasterType(bytes);
  if (mediaType === "image/png") return parsePngDimensions(bytes);
  if (mediaType === "image/jpeg") return parseJpegDimensions(bytes);
  if (mediaType === "image/webp") return parseWebpDimensions(bytes);
  return null;
}

export function validateWatermarkRasterDimensions(
  value,
  {
    maxEdge = watermarkRasterLimits.maxSourceEdge,
    maxPixels = watermarkRasterLimits.maxSourcePixels,
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

export function calculateWatermarkWorkingDimensions(widthInput, heightInput) {
  const width = Number(widthInput);
  const height = Number(heightInput);
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width < 1 ||
    height < 1
  ) {
    return null;
  }
  const scale = Math.min(
    1,
    watermarkRasterLimits.maxWorkingEdge / Math.max(width, height),
    Math.sqrt(watermarkRasterLimits.maxWorkingPixels / (width * height)),
  );
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
    scale,
    downscaledForSafety: scale < 1,
  };
}

const MIN_ROI_PERCENT = 0.5;

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function normalizeRoi(input = {}) {
  const x = clamp(finiteNumber(input.x), 0, 100 - MIN_ROI_PERCENT);
  const y = clamp(finiteNumber(input.y), 0, 100 - MIN_ROI_PERCENT);
  const width = clamp(finiteNumber(input.width, 20), MIN_ROI_PERCENT, 100 - x);
  const height = clamp(
    finiteNumber(input.height, 12),
    MIN_ROI_PERCENT,
    100 - y,
  );
  return { x, y, width, height };
}

export function roiToPixels(roiInput, widthInput, heightInput) {
  const roi = normalizeRoi(roiInput);
  const width = Math.max(1, Math.floor(finiteNumber(widthInput, 1)));
  const height = Math.max(1, Math.floor(finiteNumber(heightInput, 1)));
  const x = clamp(Math.floor((roi.x / 100) * width), 0, width - 1);
  const y = clamp(Math.floor((roi.y / 100) * height), 0, height - 1);
  const right = clamp(
    Math.ceil(((roi.x + roi.width) / 100) * width),
    x + 1,
    width,
  );
  const bottom = clamp(
    Math.ceil(((roi.y + roi.height) / 100) * height),
    y + 1,
    height,
  );
  return { x, y, width: right - x, height: bottom - y };
}

function luminance(data, offset) {
  return (
    0.2126 * data[offset] +
    0.7152 * data[offset + 1] +
    0.0722 * data[offset + 2]
  );
}

export function analyzeRoiPixels(imageData, roiInput) {
  const width = Math.max(1, Math.floor(finiteNumber(imageData?.width, 1)));
  const height = Math.max(1, Math.floor(finiteNumber(imageData?.height, 1)));
  const data = imageData?.data;
  if (!data || data.length < width * height * 4) {
    throw new Error("Valid RGBA image data is required.");
  }

  const rect = roiToPixels(roiInput, width, height);
  let count = 0;
  let sum = 0;
  let sumSquares = 0;
  let edgeSum = 0;
  let edgeCount = 0;
  let minimum = 255;
  let maximum = 0;

  for (let y = rect.y; y < rect.y + rect.height; y += 1) {
    for (let x = rect.x; x < rect.x + rect.width; x += 1) {
      const offset = (y * width + x) * 4;
      const value = luminance(data, offset);
      count += 1;
      sum += value;
      sumSquares += value * value;
      minimum = Math.min(minimum, value);
      maximum = Math.max(maximum, value);

      if (x + 1 < rect.x + rect.width) {
        edgeSum += Math.abs(value - luminance(data, offset + 4));
        edgeCount += 1;
      }
      if (y + 1 < rect.y + rect.height) {
        edgeSum += Math.abs(value - luminance(data, offset + width * 4));
        edgeCount += 1;
      }
    }
  }

  const mean = count ? sum / count : 0;
  const variance = count ? Math.max(0, sumSquares / count - mean * mean) : 0;
  return {
    sampledPixels: count,
    meanLuminance: Number(mean.toFixed(2)),
    luminanceSpread: Number(Math.sqrt(variance).toFixed(2)),
    luminanceRange: Number((maximum - minimum).toFixed(2)),
    edgeSignal: Number((edgeCount ? edgeSum / edgeCount : 0).toFixed(2)),
  };
}

export function compareRoiSignals(baseline, candidate) {
  const ratio = (value, base) =>
    base > 0 ? Number(((value / base) * 100).toFixed(1)) : null;
  return {
    spreadRetainedPercent: ratio(
      candidate?.luminanceSpread || 0,
      baseline?.luminanceSpread || 0,
    ),
    edgeRetainedPercent: ratio(
      candidate?.edgeSignal || 0,
      baseline?.edgeSignal || 0,
    ),
  };
}

export function centeredCropBounds(retainedPercentInput) {
  const retainedPercent = clamp(
    finiteNumber(retainedPercentInput, 80),
    10,
    100,
  );
  const inset = (100 - retainedPercent) / 2;
  return {
    x: inset,
    y: inset,
    width: retainedPercent,
    height: retainedPercent,
  };
}

export function mapRoiIntoCrop(roiInput, cropInput) {
  const roi = normalizeRoi(roiInput);
  const crop = normalizeRoi(cropInput);
  const left = Math.max(roi.x, crop.x);
  const top = Math.max(roi.y, crop.y);
  const right = Math.min(roi.x + roi.width, crop.x + crop.width);
  const bottom = Math.min(roi.y + roi.height, crop.y + crop.height);
  const intersectionWidth = Math.max(0, right - left);
  const intersectionHeight = Math.max(0, bottom - top);
  const retainedArea = intersectionWidth * intersectionHeight;
  const originalArea = roi.width * roi.height;
  const retainedPercent = originalArea
    ? Number(((retainedArea / originalArea) * 100).toFixed(1))
    : 0;

  if (!retainedArea) return { retainedPercent: 0, roi: null };
  return {
    retainedPercent,
    roi: normalizeRoi({
      x: ((left - crop.x) / crop.width) * 100,
      y: ((top - crop.y) / crop.height) * 100,
      width: (intersectionWidth / crop.width) * 100,
      height: (intersectionHeight / crop.height) * 100,
    }),
  };
}

export function buildVisibilityReport({
  variants = [],
  assessments = {},
  settings = {},
} = {}) {
  const allowedAssessments = new Set(["readable", "marginal", "lost"]);
  const assessmentCounts = {
    readable: 0,
    marginal: 0,
    lost: 0,
    unreviewed: 0,
  };
  variants.forEach((variant) => {
    const assessment = assessments[variant.id];
    if (allowedAssessments.has(assessment)) {
      assessmentCounts[assessment] += 1;
    } else {
      assessmentCounts.unreviewed += 1;
    }
  });

  return {
    schema: "altftool.watermark-visibility-summary.v1",
    createdAt: new Date().toISOString(),
    variantCount: variants.length,
    assessmentCounts,
    settings: {
      jpegQuality: clamp(finiteNumber(settings.jpegQuality, 45), 10, 95),
      resizePercent: clamp(finiteNumber(settings.resizePercent, 40), 10, 100),
      cropRetainedPercent: clamp(
        finiteNumber(settings.cropRetainedPercent, 80),
        10,
        100,
      ),
    },
    variants: variants.map((variant) => ({
      id: String(variant.id || ""),
      retainedAreaPercent: finiteNumber(variant.retainedAreaPercent, 100),
      spreadRetainedPercent: variant.signal?.spreadRetainedPercent ?? null,
      edgeRetainedPercent: variant.signal?.edgeRetainedPercent ?? null,
      assessment: allowedAssessments.has(assessments[variant.id])
        ? assessments[variant.id]
        : "unreviewed",
    })),
    scope: {
      localOnly: true,
      imageIncluded: false,
      filenameIncluded: false,
      roiCoordinatesIncluded: false,
      ownershipEstablished: false,
      authenticityEstablished: false,
      readabilityAutomaticallyEstablished: false,
    },
  };
}
