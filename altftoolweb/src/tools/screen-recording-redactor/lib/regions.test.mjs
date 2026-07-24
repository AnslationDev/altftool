import assert from "node:assert/strict";
import test from "node:test";
import {
  activeRegionsAtTime,
  createDefaultRegion,
  formatTimestamp,
  normaliseRegion,
  regionToPixels,
  updateRegion,
} from "./regions.mjs";

test("normaliseRegion clamps time, position, size, and mode", () => {
  const result = normaliseRegion(
    {
      id: "one",
      start: -2,
      end: 20,
      x: 95,
      y: -8,
      width: 40,
      height: 120,
      mode: "unknown",
    },
    10,
  );

  assert.deepEqual(result, {
    id: "one",
    start: 0,
    end: 10,
    x: 95,
    y: 0,
    width: 5,
    height: 100,
    mode: "solid",
  });
});

test("createDefaultRegion creates a five-second region within the video", () => {
  assert.deepEqual(createDefaultRegion({ id: "two", time: 8, duration: 10 }), {
    id: "two",
    start: 8,
    end: 10,
    x: 30,
    y: 35,
    width: 40,
    height: 20,
    mode: "solid",
  });

  const atEnd = createDefaultRegion({ id: "three", time: 10, duration: 10 });
  assert.equal(atEnd.start, 5);
  assert.equal(atEnd.end, 10);
});

test("activeRegionsAtTime includes region boundaries", () => {
  const regions = [
    { id: "a", start: 1, end: 3 },
    { id: "b", start: 3.1, end: 5 },
  ];

  assert.deepEqual(
    activeRegionsAtTime(regions, 3).map((region) => region.id),
    ["a"],
  );
  assert.deepEqual(
    activeRegionsAtTime(regions, 4).map((region) => region.id),
    ["b"],
  );
});

test("updateRegion only changes the selected region and keeps it in bounds", () => {
  const regions = [
    {
      id: "a",
      start: 0,
      end: 2,
      x: 10,
      y: 10,
      width: 20,
      height: 20,
      mode: "blur",
    },
    {
      id: "b",
      start: 3,
      end: 4,
      x: 20,
      y: 20,
      width: 20,
      height: 20,
      mode: "solid",
    },
  ];

  const result = updateRegion(regions, "a", { x: 90, width: 40 }, 5);
  assert.equal(result[0].x, 90);
  assert.equal(result[0].width, 10);
  assert.equal(result[1], regions[1]);
});

test("regionToPixels and formatTimestamp return export-ready values", () => {
  assert.deepEqual(
    regionToPixels({ x: 10, y: 20, width: 30, height: 40 }, 1920, 1080),
    { x: 192, y: 216, width: 576, height: 432 },
  );
  assert.equal(formatTimestamp(65.29), "01:05.2");
});
