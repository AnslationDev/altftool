import test from "node:test";
import assert from "node:assert/strict";

import {
  applyDocumentTone,
  computeHomography,
  defaultDocumentCorners,
  estimateOutputDimensions,
  isValidDocumentQuad,
  moveDocumentCorner,
  polygonArea,
  projectPoint,
  toPixelCorners,
} from "./documentGeometry.mjs";

test("default corners form a valid full-image quadrilateral", () => {
  const corners = defaultDocumentCorners();
  assert.equal(isValidDocumentQuad(corners), true);
  assert.equal(polygonArea(corners), 1);
  assert.deepEqual(toPixelCorners(corners, 1200, 800).at(-1), {
    id: "bottom-left",
    x: 0,
    y: 800,
  });
});

test("corner movement clamps coordinates and rejects crossed quadrilaterals", () => {
  const corners = defaultDocumentCorners();
  const moved = moveDocumentCorner(corners, "top-left", { x: -2, y: 0.2 });
  assert.deepEqual(moved[0], { id: "top-left", x: 0, y: 0.2 });

  const rejected = moveDocumentCorner(moved, "top-left", { x: 1, y: 1 });
  assert.equal(rejected, moved);
});

test("output dimensions preserve the measured document ratio and limits", () => {
  const corners = [
    { x: 0, y: 0 },
    { x: 4000, y: 0 },
    { x: 4000, y: 2000 },
    { x: 0, y: 2000 },
  ];
  const dimensions = estimateOutputDimensions(corners, {
    maxDimension: 2000,
    maxPixels: 3_000_000,
  });
  assert.equal(dimensions.width, 2000);
  assert.equal(dimensions.height, 1000);
  assert.equal(dimensions.scale, 0.5);
});

test("homography maps all rectangle corners to a skewed document quad", () => {
  const rectangle = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 200 },
    { x: 0, y: 200 },
  ];
  const quad = [
    { x: 12, y: 8 },
    { x: 110, y: 16 },
    { x: 96, y: 218 },
    { x: 3, y: 190 },
  ];
  const homography = computeHomography(rectangle, quad);

  rectangle.forEach((point, index) => {
    const projected = projectPoint(homography, point);
    assert.ok(Math.abs(projected.x - quad[index].x) < 1e-7);
    assert.ok(Math.abs(projected.y - quad[index].y) < 1e-7);
  });
});

test("tone adjustment supports color, grayscale, and threshold modes", () => {
  assert.deepEqual(
    applyDocumentTone(20, 100, 200, { mode: "color" }),
    [20, 100, 200],
  );
  const gray = applyDocumentTone(255, 0, 0, { mode: "grayscale" });
  assert.deepEqual(gray, [54, 54, 54]);
  assert.deepEqual(
    applyDocumentTone(210, 210, 210, {
      mode: "black-white",
      threshold: 180,
    }),
    [255, 255, 255],
  );
  assert.deepEqual(
    applyDocumentTone(70, 70, 70, {
      mode: "black-white",
      threshold: 180,
    }),
    [0, 0, 0],
  );
});

test("invalid homography inputs fail with a clear error", () => {
  assert.throws(
    () => computeHomography([{ x: 0, y: 0 }], [{ x: 0, y: 0 }]),
    /exactly four/,
  );
});
