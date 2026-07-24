import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeRoiPixels,
  buildVisibilityReport,
  calculateWatermarkWorkingDimensions,
  centeredCropBounds,
  compareRoiSignals,
  mapRoiIntoCrop,
  normalizeRoi,
  parseWatermarkRasterDimensions,
  roiToPixels,
  validateWatermarkRasterDimensions,
  watermarkRasterLimits,
} from "./watermarkMetrics.mjs";

function pngHeader(width, height) {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

function jpegHeader(width, height) {
  return Uint8Array.from([
    0xff,
    0xd8,
    0xff,
    0xe1,
    0x00,
    0x04,
    0x00,
    0x00,
    0xff,
    0xc2,
    0x00,
    0x11,
    0x08,
    (height >> 8) & 0xff,
    height & 0xff,
    (width >> 8) & 0xff,
    width & 0xff,
  ]);
}

function webpVp8xHeader(width, height) {
  const bytes = new Uint8Array(30);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0);
  bytes.set([0x57, 0x45, 0x42, 0x50], 8);
  bytes.set([0x56, 0x50, 0x38, 0x58], 12);
  new DataView(bytes.buffer).setUint32(16, 10, true);
  const widthMinusOne = width - 1;
  const heightMinusOne = height - 1;
  bytes.set(
    [
      widthMinusOne & 0xff,
      (widthMinusOne >> 8) & 0xff,
      (widthMinusOne >> 16) & 0xff,
    ],
    24,
  );
  bytes.set(
    [
      heightMinusOne & 0xff,
      (heightMinusOne >> 8) & 0xff,
      (heightMinusOne >> 16) & 0xff,
    ],
    27,
  );
  return bytes;
}

test("parses PNG, JPEG, and WebP dimensions before browser decode", () => {
  assert.deepEqual(parseWatermarkRasterDimensions(pngHeader(1_280, 720)), {
    width: 1_280,
    height: 720,
    mediaType: "image/png",
  });
  assert.deepEqual(parseWatermarkRasterDimensions(jpegHeader(1_920, 1_080)), {
    width: 1_920,
    height: 1_080,
    mediaType: "image/jpeg",
  });
  assert.deepEqual(parseWatermarkRasterDimensions(webpVp8xHeader(800, 600)), {
    width: 800,
    height: 600,
    mediaType: "image/webp",
  });
});

test("rejects excessive source dimensions before creating a decode URL", () => {
  assert.equal(
    validateWatermarkRasterDimensions({
      width: watermarkRasterLimits.maxSourceEdge + 1,
      height: 10,
    }).code,
    "edge-limit",
  );
  assert.equal(
    validateWatermarkRasterDimensions({ width: 5_000, height: 4_000 }).code,
    "pixel-limit",
  );
  assert.equal(
    validateWatermarkRasterDimensions({ width: 4_000, height: 4_000 }).ok,
    true,
  );
});

test("bounds the rendered working copy by edge and pixel limits", () => {
  assert.deepEqual(calculateWatermarkWorkingDimensions(6_000, 2_000), {
    width: 2_400,
    height: 800,
    scale: 0.4,
    downscaledForSafety: true,
  });
  const square = calculateWatermarkWorkingDimensions(3_000, 3_000);
  assert.equal(square.width, 2_000);
  assert.equal(square.height, 2_000);
  assert.equal(square.width * square.height <= watermarkRasterLimits.maxWorkingPixels, true);
});

test("normalizes a region to bounded percentages", () => {
  assert.deepEqual(normalizeRoi({ x: -5, y: 98, width: 80, height: 20 }), {
    x: 0,
    y: 98,
    width: 80,
    height: 2,
  });
});

test("maps percentage regions to non-empty pixel rectangles", () => {
  assert.deepEqual(
    roiToPixels({ x: 25, y: 20, width: 50, height: 40 }, 200, 100),
    { x: 50, y: 20, width: 100, height: 40 },
  );
});

test("analyzes luminance spread and edges inside the selected region", () => {
  const pixels = new Uint8ClampedArray([
    0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255,
  ]);
  const result = analyzeRoiPixels(
    { data: pixels, width: 2, height: 2 },
    { x: 0, y: 0, width: 100, height: 100 },
  );
  assert.equal(result.sampledPixels, 4);
  assert.equal(result.meanLuminance, 127.5);
  assert.equal(result.luminanceSpread, 127.5);
  assert.equal(result.edgeSignal, 127.5);
});

test("reports retained signal ratios without making readability judgments", () => {
  assert.deepEqual(
    compareRoiSignals(
      { luminanceSpread: 20, edgeSignal: 10 },
      { luminanceSpread: 10, edgeSignal: 2.5 },
    ),
    { spreadRetainedPercent: 50, edgeRetainedPercent: 25 },
  );
});

test("returns null ratios when the baseline has no measurable signal", () => {
  assert.deepEqual(
    compareRoiSignals(
      { luminanceSpread: 0, edgeSignal: 0 },
      { luminanceSpread: 10, edgeSignal: 10 },
    ),
    { spreadRetainedPercent: null, edgeRetainedPercent: null },
  );
});

test("builds centered crop bounds", () => {
  assert.deepEqual(centeredCropBounds(80), {
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
});

test("maps a partly clipped region into crop coordinates", () => {
  const mapped = mapRoiIntoCrop(
    { x: 0, y: 20, width: 20, height: 20 },
    centeredCropBounds(80),
  );
  assert.equal(mapped.retainedPercent, 50);
  assert.deepEqual(mapped.roi, {
    x: 0,
    y: 12.5,
    width: 12.5,
    height: 25,
  });
});

test("reports a fully removed region after crop", () => {
  const mapped = mapRoiIntoCrop(
    { x: 0, y: 0, width: 5, height: 5 },
    centeredCropBounds(80),
  );
  assert.deepEqual(mapped, { retainedPercent: 0, roi: null });
});

test("privacy-safe report excludes filenames, images, and ROI coordinates", () => {
  const report = buildVisibilityReport({
    variants: [
      {
        id: "jpeg",
        retainedAreaPercent: 100,
        signal: { spreadRetainedPercent: 70, edgeRetainedPercent: 50 },
      },
    ],
    assessments: { jpeg: "marginal" },
    settings: { jpegQuality: 45, resizePercent: 40, cropRetainedPercent: 80 },
  });
  assert.equal(report.assessmentCounts.marginal, 1);
  assert.equal(report.scope.readabilityAutomaticallyEstablished, false);
  assert.equal(report.scope.roiCoordinatesIncluded, false);
  assert.equal(JSON.stringify(report).includes("PRIVATE-FILENAME"), false);
});
