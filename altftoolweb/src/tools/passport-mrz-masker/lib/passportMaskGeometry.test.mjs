import assert from "node:assert/strict";
import test from "node:test";

import {
  createPresetMask,
  getExportSpec,
  hitTestMasks,
  maskToIntegerPixels,
  normalizeDrag,
  transformMask,
} from "./passportMaskGeometry.mjs";

test("passport presets scale to image dimensions", () => {
  assert.deepEqual(
    createPresetMask("mrz", { width: 1000, height: 600 }, "m1"),
    {
      id: "m1",
      preset: "mrz",
      label: "MRZ bottom zone",
      x: 40,
      y: 444,
      width: 920,
      height: 132,
    },
  );

  assert.deepEqual(
    createPresetMask("passportNumber", { width: 1000, height: 600 }, "m2"),
    {
      id: "m2",
      preset: "passportNumber",
      label: "Passport number",
      x: 550,
      y: 84,
      width: 380,
      height: 60,
    },
  );
});

test("reverse drags, moves, and resizes stay inside the image", () => {
  assert.deepEqual(
    normalizeDrag(
      { x: 95, y: 70 },
      { x: -5, y: 20 },
      { width: 100, height: 80 },
    ),
    { x: 0, y: 20, width: 95, height: 50 },
  );

  const mask = {
    id: "one",
    label: "Custom area",
    x: 20,
    y: 20,
    width: 30,
    height: 20,
  };
  assert.deepEqual(
    transformMask(
      mask,
      { kind: "move", dx: 100, dy: -50 },
      { width: 100, height: 80 },
    ),
    { ...mask, x: 70, y: 0 },
  );
  assert.deepEqual(
    transformMask(
      mask,
      { kind: "resize", handle: "nw", dx: 40, dy: 40 },
      { width: 100, height: 80 },
      12,
    ),
    { ...mask, x: 38, y: 28, width: 12, height: 12 },
  );
});

test("hit testing prioritizes handles and the topmost mask", () => {
  const masks = [
    { id: "bottom", x: 10, y: 10, width: 50, height: 30 },
    { id: "top", x: 20, y: 15, width: 20, height: 15 },
  ];

  assert.deepEqual(hitTestMasks(masks, { x: 40, y: 30 }, 2), {
    id: "top",
    part: "resize",
    handle: "se",
  });
  assert.deepEqual(hitTestMasks(masks, { x: 25, y: 20 }, 2), {
    id: "top",
    part: "move",
    handle: null,
  });
});

test("fractional masks become complete integer export rectangles", () => {
  assert.deepEqual(
    maskToIntegerPixels(
      { x: 9.8, y: 4.2, width: 20.3, height: 10.1 },
      { width: 100, height: 50 },
    ),
    { x: 9, y: 4, width: 22, height: 11 },
  );
});

test("export specs use the correct MIME type and privacy-safe filename", () => {
  assert.deepEqual(getExportSpec("jpeg", "My Passport Scan.PNG"), {
    format: "jpeg",
    mimeType: "image/jpeg",
    extension: "jpg",
    filename: "My-Passport-Scan-masked.jpg",
    quality: 0.92,
  });
  assert.deepEqual(getExportSpec("unexpected", "!!!.png"), {
    format: "png",
    mimeType: "image/png",
    extension: "png",
    filename: "passport-masked.png",
    quality: undefined,
  });
});
