import test from "node:test";
import assert from "node:assert/strict";

import {
  buildLocationExportName,
  haversineDistanceMeters,
  parseLocationHistory,
  parsePrivacyZones,
  sanitizeLocationHistory,
  serializeLocationHistory,
} from "./locationHistory.mjs";

test("parses Google E7 history and removes whole records inside a privacy zone", () => {
  const parsed = parseLocationHistory(
    JSON.stringify({
      locations: [
        {
          latitudeE7: 190760000,
          longitudeE7: 728777000,
          timestampMs: "1717245123456",
          source: "GPS",
        },
        {
          latitudeE7: 191234567,
          longitudeE7: 729876543,
          timestampMs: "1717248723456",
          source: "GPS",
        },
      ],
    }),
  );

  assert.equal(parsed.points.length, 2);
  assert.equal(parsed.points[0].latitude, 19.076);

  const result = sanitizeLocationHistory(parsed, {
    zones: [
      {
        id: "home",
        label: "Home",
        latitude: 19.076,
        longitude: 72.8777,
        radiusMeters: 100,
      },
    ],
    coordinateDecimals: 3,
    timestampBucketMinutes: 60,
  });

  assert.equal(result.removedPoints, 1);
  assert.equal(result.removedRecords, 1);
  assert.equal(result.source.locations.length, 1);
  assert.equal(result.source.locations[0].latitudeE7, 191230000);
  assert.equal(result.source.locations[0].longitudeE7, 729880000);
  assert.equal(Number(result.source.locations[0].timestampMs) % 3_600_000, 0);
});

test("sanitizes GeoJSON points while preserving properties and collection shape", () => {
  const parsed = parseLocationHistory(
    JSON.stringify({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "private" },
          geometry: { type: "Point", coordinates: [77.5946, 12.9716] },
        },
        {
          type: "Feature",
          properties: { name: "keep", custom: true },
          geometry: {
            type: "Point",
            coordinates: [77.6123456, 12.9123456],
          },
        },
      ],
    }),
  );
  assert.equal(parsed.format, "geojson");

  const result = sanitizeLocationHistory(parsed, {
    zones: [
      {
        id: "home",
        label: "Home",
        latitude: 12.9716,
        longitude: 77.5946,
        radiusMeters: 75,
      },
    ],
    coordinateDecimals: 3,
  });

  assert.equal(result.source.type, "FeatureCollection");
  assert.equal(result.source.features.length, 1);
  assert.equal(result.source.features[0].properties.custom, true);
  assert.deepEqual(result.source.features[0].geometry.coordinates, [
    77.612,
    12.912,
  ]);
  assert.match(serializeLocationHistory(result), /"FeatureCollection"/);
});

test("parses quoted CSV, removes matching rows and preserves unrelated columns", () => {
  const parsed = parseLocationHistory(
    [
      "timestamp,latitude,longitude,note",
      '2025-01-01T10:23:00Z,28.6139,77.209,"Home, exact"',
      "2025-01-01T11:28:00Z,28.70012,77.30012,Commute",
    ].join("\n"),
    "csv",
  );

  const result = sanitizeLocationHistory(parsed, {
    zones: [
      {
        label: "Home",
        latitude: 28.6139,
        longitude: 77.209,
        radiusMeters: 100,
      },
    ],
    coordinateDecimals: 2,
    timestampBucketMinutes: 60,
  });
  const output = serializeLocationHistory(result);

  assert.equal(result.retainedPoints, 1);
  assert.match(output, /28\.7,77\.3,Commute/);
  assert.doesNotMatch(output, /Home, exact/);
  assert.match(output, /2025-01-01T11:00:00\.000Z/);
});

test("finds nested Timeline coordinates and parses imported zones", () => {
  const parsed = parseLocationHistory(
    JSON.stringify({
      timelineObjects: [
        {
          placeVisit: {
            duration: { startTimestamp: "2025-02-03T04:05:06Z" },
            location: {
              latitudeE7: "515074000",
              longitudeE7: "-1278000",
            },
          },
        },
      ],
    }),
  );
  const zones = parsePrivacyZones("Work,51.5074,-0.1278,250");

  assert.equal(parsed.points[0].timestamp, "2025-02-03T04:05:06Z");
  assert.equal(zones[0].label, "Work");
  assert.equal(zones[0].radiusMeters, 250);
  assert.ok(
    haversineDistanceMeters(0, 0, 1, 0) > 111_000 &&
      haversineDistanceMeters(0, 0, 1, 0) < 112_000,
  );
  assert.equal(
    buildLocationExportName("Takeout Location History.json", "json"),
    "Takeout-Location-History.sanitized.json",
  );
});
