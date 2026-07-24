import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeResidualPixels,
  buildPrivacySafeElaSummary,
  buildResidualRegionGrid,
  calculateWorkingDimensions,
  computeAbsoluteResidualMagnitudes,
  createResidualHeatmapPixels,
  detectRasterMime,
  ELA_LIMITATIONS,
  ELA_LIMITS,
  parseRasterDimensions,
  summarizeResidualMagnitudes,
  validateRasterDimensions,
} from "./elaAnalysis.mjs";

function pngHeader(width, height) {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  new DataView(bytes.buffer).setUint32(16, width);
  new DataView(bytes.buffer).setUint32(20, height);
  return bytes;
}

function jpegHeader(width, height) {
  return Uint8Array.from([
    0xff,
    0xd8,
    0xff,
    0xe0,
    0x00,
    0x04,
    0x00,
    0x00,
    0xff,
    0xc0,
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

test("computes deterministic absolute mean-RGB residual magnitudes", () => {
  const original = new Uint8ClampedArray([
    10, 20, 30, 255,
    100, 100, 100, 255,
  ]);
  const recompressed = new Uint8ClampedArray([
    13, 14, 35, 255,
    90, 110, 100, 255,
  ]);

  assert.deepEqual(
    [...computeAbsoluteResidualMagnitudes(original, recompressed)],
    [5, 7],
  );
});

test("summarizes residuals without display-gain amplification", () => {
  const summary = summarizeResidualMagnitudes(
    new Uint8Array([0, 5, 5, 10, 20]),
  );
  assert.deepEqual(summary, {
    pixelCount: 5,
    mean: 8,
    rootMeanSquare: 10.488,
    median: 5,
    p95: 20,
    p99: 20,
    maximum: 20,
    nonZeroPixels: 4,
    nonZeroPercent: 80,
  });
});

test("renders a bounded gain-adjusted grayscale heatmap", () => {
  const heatmap = createResidualHeatmapPixels(
    new Uint8Array([0, 10, 100, 200]),
    2,
  );
  assert.deepEqual([...heatmap], [
    0, 0, 0, 255,
    20, 20, 20, 255,
    200, 200, 200, 255,
    255, 255, 255, 255,
  ]);
  assert.throws(
    () =>
      createResidualHeatmapPixels(
        new Uint8Array([1]),
        ELA_LIMITS.maxDisplayGain + 1,
      ),
    /Display gain/u,
  );
});

test("builds deterministic row-major bounded region summaries", () => {
  const grid = buildResidualRegionGrid(
    new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
    4,
    2,
    2,
    2,
  );
  assert.equal(grid.regionCount, 4);
  assert.deepEqual(
    grid.regions.map((region) => [
      region.row,
      region.column,
      region.pixelCount,
      region.mean,
      region.maximum,
    ]),
    [
      [1, 1, 2, 1.5, 2],
      [1, 2, 2, 3.5, 4],
      [2, 1, 2, 5.5, 6],
      [2, 2, 2, 7.5, 8],
    ],
  );

  const tinyGrid = buildResidualRegionGrid(
    new Uint8Array([4]),
    1,
    1,
    8,
    8,
  );
  assert.equal(tinyGrid.columns, 1);
  assert.equal(tinyGrid.rows, 1);
  assert.equal(tinyGrid.regionCount, 1);
});

test("analyzes pixels and rejects mismatched pixel dimensions", () => {
  const original = new Uint8ClampedArray([
    0, 0, 0, 255,
    10, 10, 10, 255,
    20, 20, 20, 255,
    30, 30, 30, 255,
  ]);
  const recompressed = new Uint8ClampedArray([
    1, 1, 1, 255,
    12, 12, 12, 255,
    23, 23, 23, 255,
    34, 34, 34, 255,
  ]);
  const result = analyzeResidualPixels({
    original,
    recompressed,
    width: 2,
    height: 2,
    gridColumns: 2,
    gridRows: 2,
  });
  assert.deepEqual([...result.magnitudes], [1, 2, 3, 4]);
  assert.equal(result.summary.mean, 2.5);
  assert.throws(
    () =>
      analyzeResidualPixels({
        original,
        recompressed,
        width: 3,
        height: 2,
      }),
    /Dimensions/u,
  );
});

test("bounds working dimensions by edge and total pixel count", () => {
  const dimensions = calculateWorkingDimensions(8_000, 6_000);
  assert.equal(dimensions.downscaled, true);
  assert.ok(dimensions.processedWidth <= ELA_LIMITS.maxImageEdge);
  assert.ok(dimensions.processedHeight <= ELA_LIMITS.maxImageEdge);
  assert.ok(
    dimensions.processedWidth * dimensions.processedHeight <=
      ELA_LIMITS.maxProcessingPixels,
  );

  assert.deepEqual(calculateWorkingDimensions(800, 600), {
    sourceWidth: 800,
    sourceHeight: 600,
    processedWidth: 800,
    processedHeight: 600,
    scale: 1,
    downscaled: false,
  });
});

test("detects JPEG, PNG, and WebP signatures while excluding SVG text", () => {
  assert.equal(
    detectRasterMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])),
    "image/jpeg",
  );
  assert.equal(
    detectRasterMime(
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ),
    "image/png",
  );
  assert.equal(
    detectRasterMime(
      new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
      ]),
    ),
    "image/webp",
  );
  assert.equal(
    detectRasterMime(new TextEncoder().encode("<svg xmlns=")),
    null,
  );
});

test("parses JPEG, PNG, and WebP dimensions before browser decode", () => {
  assert.deepEqual(parseRasterDimensions(jpegHeader(1_920, 1_080)), {
    width: 1_920,
    height: 1_080,
    mimeType: "image/jpeg",
  });
  assert.deepEqual(parseRasterDimensions(pngHeader(1_200, 800)), {
    width: 1_200,
    height: 800,
    mimeType: "image/png",
  });
  assert.deepEqual(parseRasterDimensions(webpVp8xHeader(640, 480)), {
    width: 640,
    height: 480,
    mimeType: "image/webp",
  });
  assert.equal(parseRasterDimensions(new Uint8Array([1, 2, 3])), null);
});

test("rejects excessive source edges and pixel counts before decode", () => {
  assert.deepEqual(validateRasterDimensions({ width: 2_000, height: 2_000 }), {
    ok: true,
    code: "accepted",
    pixelCount: 4_000_000,
  });
  assert.equal(
    validateRasterDimensions({
      width: ELA_LIMITS.maxSourceEdge + 1,
      height: 1,
    }).code,
    "edge-limit",
  );
  assert.equal(
    validateRasterDimensions({
      width: 5_000,
      height: 4_000,
    }).code,
    "pixel-limit",
  );
  assert.equal(
    validateRasterDimensions({ width: 0, height: 10 }).code,
    "invalid-dimensions",
  );
});

test("privacy summary excludes filenames, pixels, previews, and verdict claims", () => {
  const dimensions = calculateWorkingDimensions(2, 2);
  const residualSummary = {
    ...summarizeResidualMagnitudes(new Uint8Array([1, 2, 3, 4])),
    pixels: "PRIVATE-PIXELS",
    filename: "PRIVATE-NESTED-FILENAME.jpg",
  };
  const regionGrid = buildResidualRegionGrid(
    new Uint8Array([1, 2, 3, 4]),
    2,
    2,
    2,
    2,
  );
  const summary = buildPrivacySafeElaSummary({
    sourceMimeType: "image/jpeg",
    dimensions,
    jpegQuality: 85,
    displayGain: 12,
    residualSummary,
    regionGrid,
    filename: "PRIVATE-FILENAME.jpg",
    pixels: "PRIVATE-PIXELS",
  });
  const serialized = JSON.stringify(summary);

  assert.equal(serialized.includes("PRIVATE-FILENAME"), false);
  assert.equal(serialized.includes("PRIVATE-NESTED-FILENAME"), false);
  assert.equal(serialized.includes("PRIVATE-PIXELS"), false);
  assert.equal(summary.privacy.includesFilename, false);
  assert.equal(summary.privacy.includesImagePixels, false);
  assert.equal(summary.interpretation.verdictProvided, false);
  assert.equal(summary.interpretation.tamperDetectionClaimed, false);
});

test("limitations cover benign causes and evidentiary boundaries", () => {
  const text = ELA_LIMITATIONS.join(" ");
  assert.match(text, /not a tamper detector/iu);
  assert.match(text, /recompression/iu);
  assert.match(text, /resizing or scaling/iu);
  assert.match(text, /camera and phone processing pipelines/iu);
  assert.match(text, /synthetic-image generation/iu);
  assert.match(text, /multiple saves/iu);
  assert.match(text, /false positives and false negatives/iu);
  assert.match(text, /evidentiary truth/iu);
});
