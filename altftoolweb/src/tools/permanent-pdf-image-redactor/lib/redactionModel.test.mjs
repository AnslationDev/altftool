import assert from "node:assert/strict";
import test from "node:test";

import {
  buildExportModel,
  moveRectangle,
  normalizeRectangle,
  projectRectangle,
  rectangleFromPoints,
  updateRectangleBounds,
} from "./redactionModel.mjs";

test("normalizes reverse drag coordinates and clamps them to the page", () => {
  assert.deepEqual(
    rectangleFromPoints({ x: 1.2, y: 0.8 }, { x: 0.25, y: -0.2 }, "mask-1"),
    {
      id: "mask-1",
      x: 0.25,
      y: 0,
      width: 0.75,
      height: 0.8,
    },
  );
});

test("moves a rectangle without allowing it outside the page", () => {
  assert.deepEqual(
    moveRectangle({ id: "a", x: 0.75, y: 0.1, width: 0.2, height: 0.3 }, 0.2, -0.5),
    {
      id: "a",
      x: 0.8,
      y: 0,
      width: 0.19999999999999996,
      height: 0.30000000000000004,
    },
  );
});

test("keeps edited bounds inside the page and projects outward to pixels", () => {
  const updated = updateRectangleBounds(
    { id: "a", x: 0.8, y: 0.8, width: 0.1, height: 0.1 },
    { width: 0.4, height: 0.3 },
  );

  assert.deepEqual(updated, {
    id: "a",
    x: 0.6,
    y: 0.7,
    width: 0.4,
    height: 0.3,
  });
  assert.deepEqual(projectRectangle(updated, 1001, 501), {
    x: 600,
    y: 350,
    width: 401,
    height: 151,
  });
});

test("builds a flattened export model without retaining source objects", () => {
  const model = buildExportModel({
    sourceType: "pdf",
    rasterDpi: 999,
    pages: [
      {
        pageNumber: 1,
        rectangles: [
          { id: "one", x: 0.1, y: 0.2, width: 0.3, height: 0.1 },
          { id: "tiny", x: 0, y: 0, width: 0.0001, height: 0.0001 },
        ],
      },
      { pageNumber: 2, rectangles: [] },
    ],
  });

  assert.equal(model.outputType, "application/pdf");
  assert.equal(model.rasterDpi, 216);
  assert.equal(model.shouldFlatten, true);
  assert.equal(model.retainsSourceObjects, false);
  assert.equal(model.totalPages, 2);
  assert.equal(model.totalRedactions, 1);
  assert.equal(model.pages[0].rectangles[0].id, "one");
});

test("keeps multiple valid masks when building an export model", () => {
  const model = buildExportModel({
    sourceType: "image",
    pages: [
      {
        pageNumber: 1,
        rectangles: [
          { id: "one", x: 0, y: 0, width: 0.1, height: 0.1 },
          { id: "two", x: 0.3, y: 0.3, width: 0.1, height: 0.1 },
        ],
      },
    ],
  });

  assert.equal(model.totalRedactions, 2);
  assert.deepEqual(
    model.pages[0].rectangles.map((rectangle) => rectangle.id),
    ["one", "two"],
  );
});

test("rejects an unknown source type", () => {
  assert.throws(
    () => buildExportModel({ sourceType: "document", pages: [] }),
    /sourceType/,
  );
});

test("normalization tolerates incomplete numeric input", () => {
  assert.deepEqual(normalizeRectangle({ x: "0.2", y: null, width: "0.5" }), {
    id: undefined,
    x: 0.2,
    y: 0,
    width: 0.49999999999999994,
    height: 0,
  });
});
