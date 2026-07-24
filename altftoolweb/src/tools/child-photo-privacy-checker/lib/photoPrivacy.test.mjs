import assert from "node:assert/strict";
import test from "node:test";
import {
  createDefaultRegion,
  formatFileSize,
  inspectImageMetadata,
  normaliseRegion,
  rectangleFromPoints,
  regionToPixels,
} from "./photoPrivacy.mjs";

function makeExifJpeg() {
  const bytes = new Uint8Array(58);
  bytes.set([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x36], 0);
  bytes.set([0x45, 0x78, 0x69, 0x66, 0x00, 0x00], 6);
  bytes.set([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00], 12);
  bytes.set([0x02, 0x00], 20);
  bytes.set([0x0f, 0x01, 0x02, 0x00, 0x06, 0x00, 0x00, 0x00, 0x26, 0x00, 0x00, 0x00], 22);
  bytes.set([0x25, 0x88, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], 34);
  bytes.set([0x50, 0x68, 0x6f, 0x6e, 0x65, 0x00], 50);
  return bytes.buffer;
}

test("normaliseRegion keeps privacy masks inside the image", () => {
  const result = normaliseRegion({
    id: "one",
    x: 95,
    y: -10,
    width: 40,
    height: 120,
    mode: "unknown",
    reviewArea: "unknown",
  });

  assert.deepEqual(result, {
    id: "one",
    x: 95,
    y: 0,
    width: 5,
    height: 100,
    mode: "solid",
    reviewArea: "background-detail",
  });
});

test("rectangleFromPoints supports reverse drags and rejects tiny masks", () => {
  assert.deepEqual(rectangleFromPoints({ x: 80, y: 70 }, { x: 20, y: 10 }), {
    x: 20,
    y: 10,
    width: 60,
    height: 60,
  });
  assert.equal(rectangleFromPoints({ x: 1, y: 1 }, { x: 1.4, y: 20 }), null);
});

test("region geometry converts to export pixels", () => {
  const region = createDefaultRegion({ id: "two", mode: "pixelate", reviewArea: "school-id" });
  assert.equal(region.mode, "pixelate");
  assert.deepEqual(regionToPixels(region, 2000, 1000), {
    x: 600,
    y: 350,
    width: 800,
    height: 200,
  });
});

test("JPEG EXIF inspection reports EXIF, GPS, and readable fields", () => {
  const result = inspectImageMetadata(makeExifJpeg());
  assert.equal(result.format, "jpeg");
  assert.equal(result.exifFound, true);
  assert.equal(result.gpsFound, true);
  assert.equal(result.markers.find((marker) => marker.id === "camera-make")?.value, "Phone");
});

test("unknown data and byte formatting are safe", () => {
  assert.deepEqual(inspectImageMetadata(new Uint8Array([1, 2, 3]).buffer), {
    format: "unknown",
    markers: [],
    exifFound: false,
    gpsFound: false,
  });
  assert.equal(formatFileSize(1536), "1.5 KB");
});
