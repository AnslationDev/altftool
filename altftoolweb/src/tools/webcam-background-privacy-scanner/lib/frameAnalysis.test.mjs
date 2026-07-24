import assert from "node:assert/strict";
import test from "node:test";

import {
  clampRect,
  createPresetRect,
  normalizeRect,
  percentRectToPixels,
  rectToPercent,
  scanContrastRegions,
} from "./frameAnalysis.mjs";

function imageData(width, height, pixelAt) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const value = pixelAt(x, y);
      const index = (y * width + x) * 4;
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
      data[index + 3] = 255;
    }
  }
  return { data, width, height };
}

test("normalizeRect handles reverse drags and clips to the frame", () => {
  assert.deepEqual(
    normalizeRect({ x: 90, y: 80 }, { x: -10, y: 20 }, { width: 100, height: 100 }),
    { x: 0, y: 20, width: 90, height: 60 },
  );
  assert.equal(
    normalizeRect({ x: 5, y: 5 }, { x: 8, y: 9 }, { width: 100, height: 100 }),
    null,
  );
});

test("percentage editing round-trips within the frame", () => {
  const bounds = { width: 800, height: 600 };
  const pixels = percentRectToPixels(
    { x: 25, y: 10, width: 50, height: 30 },
    bounds,
  );
  assert.deepEqual(pixels, { x: 200, y: 60, width: 400, height: 180 });
  assert.deepEqual(rectToPercent(pixels, bounds), {
    x: 25,
    y: 10,
    width: 50,
    height: 30,
  });
});

test("preset and clamp helpers keep privacy zones in bounds", () => {
  const bounds = { width: 1000, height: 500 };
  assert.deepEqual(createPresetRect(bounds, "top"), {
    x: 100,
    y: 25,
    width: 800,
    height: 110,
  });
  assert.deepEqual(
    clampRect({ x: 950, y: 480, width: 200, height: 100 }, bounds),
    { x: 950, y: 480, width: 50, height: 20 },
  );
});

test("contrast scan ignores a flat frame", () => {
  const flat = imageData(32, 32, () => 120);
  assert.deepEqual(scanContrastRegions(flat, { cellSize: 16 }), []);
});

test("contrast scan suggests checkerboard-like regions without identity claims", () => {
  const checkerboard = imageData(32, 32, (x, y) =>
    (Math.floor(x / 2) + Math.floor(y / 2)) % 2 ? 255 : 0,
  );
  const results = scanContrastRegions(checkerboard, {
    cellSize: 16,
    threshold: 0.35,
    maxResults: 3,
  });

  assert.equal(results.length, 3);
  assert.match(results[0].label, /^Contrast pattern/);
  assert.ok(results.every((result) => result.confidence >= 35));
  assert.ok(results.every((result) => !/face|identity|person|qr code/i.test(result.label)));
});
