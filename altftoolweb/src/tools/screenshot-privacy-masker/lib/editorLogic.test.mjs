import assert from "node:assert/strict";
import test from "node:test";

import {
  boxBlurRgba,
  hitTestRectangles,
  normalizeRectangle,
  pixelateRgba,
  suggestTextLikeRegions,
  transformRectangle,
} from "./editorLogic.mjs";

test("normalizes a reverse drag and keeps the rectangle inside image bounds", () => {
  assert.deepEqual(
    normalizeRectangle({ x: 90, y: 70 }, { x: -10, y: 20 }, { width: 100, height: 80 }),
    { x: 0, y: 20, width: 90, height: 50 },
  );
});

test("moves, resizes, and hit-tests rectangles with clamping", () => {
  const rectangle = { id: "one", x: 20, y: 20, width: 30, height: 20 };
  const moved = transformRectangle(
    rectangle,
    { kind: "move", dx: 100, dy: -40 },
    { width: 100, height: 80 },
  );
  assert.deepEqual(moved, { id: "one", x: 70, y: 0, width: 30, height: 20 });

  const resized = transformRectangle(
    rectangle,
    { kind: "resize", handle: "nw", dx: 40, dy: 40 },
    { width: 100, height: 80 },
    8,
  );
  assert.deepEqual(resized, { id: "one", x: 42, y: 32, width: 8, height: 8 });
  assert.deepEqual(hitTestRectangles([rectangle], { x: 50, y: 40 }, 4), {
    id: "one",
    part: "resize",
    handle: "se",
  });
});

test("pixelation replaces each block with its average RGBA value", () => {
  const source = new Uint8ClampedArray([
    0, 10, 20, 255,
    100, 110, 120, 255,
  ]);
  assert.deepEqual(
    [...pixelateRgba(source, 2, 1, 2)],
    [
      50, 60, 70, 255,
      50, 60, 70, 255,
    ],
  );
});

test("box blur spreads a bright center pixel without mutating the source", () => {
  const source = new Uint8ClampedArray([
    0, 0, 0, 255,
    255, 255, 255, 255,
    0, 0, 0, 255,
  ]);
  const blurred = boxBlurRgba(source, 3, 1, 1);

  assert.deepEqual([...source.slice(4, 7)], [255, 255, 255]);
  assert.ok(blurred[0] > 0);
  assert.ok(blurred[4] < 255);
  assert.ok(blurred[8] > 0);
  assert.equal(blurred[3], 255);
});

test("local heuristic finds a high-contrast text-like band", () => {
  const width = 24;
  const height = 8;
  const source = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const value = y < 4 && x % 2 === 0 ? 255 : 0;
      source[offset] = value;
      source[offset + 1] = value;
      source[offset + 2] = value;
      source[offset + 3] = 255;
    }
  }

  const suggestions = suggestTextLikeRegions(source, width, height, {
    columns: 6,
    rows: 4,
    minimumScore: 20,
  });
  assert.ok(suggestions.length > 0);
  assert.ok(suggestions.some((region) => region.y < 4));
});
