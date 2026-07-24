import assert from "node:assert/strict";
import test from "node:test";

import {
  buildExportModel,
  createPresetRectangle,
  moveRectangle,
  projectRectangle,
  rectangleFromPoints,
  updateRectangleBounds,
} from "./anonymizerModel.mjs";

test("creates labeled salary-slip preset rectangles", () => {
  const identity = createPresetRectangle("identity", "mask-1");
  const account = createPresetRectangle("accounts", "mask-2");

  assert.equal(identity.label, "Employee name & ID");
  assert.equal(identity.presetKey, "identity");
  assert.equal(account.label, "Bank, PAN & account details");
  assert.equal(account.id, "mask-2");
});

test("rejects an unknown preset instead of pretending it was detected", () => {
  assert.throws(
    () => createPresetRectangle("automatic-pan-detection", "mask-1"),
    /Unknown salary-slip preset/,
  );
});

test("normalizes reverse-drawn rectangles and keeps edits inside the page", () => {
  const drawn = rectangleFromPoints(
    { x: 0.9, y: 0.7 },
    { x: 0.2, y: -0.1 },
    "custom-1",
  );
  assert.equal(drawn.id, "custom-1");
  assert.equal(drawn.label, "Custom mask");
  assert.equal(drawn.presetKey, null);
  assert.ok(Math.abs(drawn.x - 0.2) < Number.EPSILON);
  assert.equal(drawn.y, 0);
  assert.equal(drawn.width, 0.7);
  assert.equal(drawn.height, 0.7);

  const moved = moveRectangle(drawn, 0.5, 0.8);
  assert.equal(moved.x, 0.30000000000000004);
  assert.equal(moved.y, 0.30000000000000004);

  const resized = updateRectangleBounds(moved, {
    width: 0.4,
    height: 0.2,
  });
  assert.equal(resized.x, 0.30000000000000004);
  assert.equal(resized.y, 0.30000000000000004);
});

test("projects masks outward to avoid sub-pixel gaps", () => {
  assert.deepEqual(
    projectRectangle(
      { x: 0.1, y: 0.2, width: 0.3, height: 0.1 },
      1001,
      501,
    ),
    { x: 100, y: 100, width: 301, height: 51 },
  );
});

test("builds a flattened multi-page export audit", () => {
  const model = buildExportModel({
    sourceType: "pdf",
    rasterDpi: 500,
    pages: [
      {
        pageNumber: 1,
        rectangles: [createPresetRectangle("salary", "salary-1")],
      },
      { pageNumber: 2, rectangles: [] },
    ],
  });

  assert.equal(model.outputType, "application/pdf");
  assert.equal(model.rasterDpi, 216);
  assert.equal(model.totalPages, 2);
  assert.equal(model.totalRedactions, 1);
  assert.deepEqual(model.pagesWithoutMasks, [2]);
  assert.equal(model.shouldFlatten, true);
  assert.equal(model.retainsSourceText, false);
  assert.equal(model.retainsSourceObjects, false);
});

test("rejects unsupported source types", () => {
  assert.throws(
    () => buildExportModel({ sourceType: "docx" }),
    /sourceType/,
  );
});
