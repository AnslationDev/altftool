import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTimelineCountsReport,
  correlateTimeline,
  extractMediaTimestamps,
  mediaTimelineInputLimits,
  normalizeTimestamp,
  selectMediaInputBatch,
} from "./mediaTimeline.mjs";

function pngWithTime(year, month, day, hour, minute, second) {
  const bytes = new Uint8Array(8 + 12 + 7);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const view = new DataView(bytes.buffer);
  view.setUint32(8, 7, false);
  bytes.set([0x74, 0x49, 0x4d, 0x45], 12);
  view.setUint16(16, year, false);
  bytes.set([month, day, hour, minute, second], 18);
  return bytes.buffer;
}

function mp4WithMovieHeader(iso) {
  const quickTimeSeconds =
    Math.floor(new Date(iso).getTime() / 1000) + 2_082_844_800;
  const ftypSize = 12;
  const movieHeaderSize = 28;
  const movieSize = 8 + movieHeaderSize;
  const bytes = new Uint8Array(ftypSize + movieSize);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, ftypSize, false);
  bytes.set([0x66, 0x74, 0x79, 0x70], 4);
  bytes.set([0x69, 0x73, 0x6f, 0x6d], 8);
  view.setUint32(ftypSize, movieSize, false);
  bytes.set([0x6d, 0x6f, 0x6f, 0x76], ftypSize + 4);
  view.setUint32(ftypSize + 8, movieHeaderSize, false);
  bytes.set([0x6d, 0x76, 0x68, 0x64], ftypSize + 12);
  view.setUint8(ftypSize + 16, 0);
  view.setUint32(ftypSize + 20, quickTimeSeconds, false);
  return bytes.buffer;
}

test("normalizes a wall clock only when an offset is known", () => {
  const unresolved = normalizeTimestamp("2026:07:24 10:30:00");
  assert.equal(unresolved.status, "unresolved");
  const zoned = normalizeTimestamp("2026:07:24 10:30:00", "+05:30");
  assert.equal(zoned.status, "zoned");
  assert.equal(zoned.iso, "2026-07-24T05:00:00.000Z");
  assert.equal(zoned.usedFallbackOffset, true);
});

test("rejects impossible calendar values and offsets", () => {
  assert.equal(
    normalizeTimestamp("2026:02:30 10:00:00", "Z").status,
    "invalid",
  );
  assert.equal(
    normalizeTimestamp("2026:02:20 10:00:00", "+25:00").status,
    "invalid",
  );
});

test("extracts format-defined UTC time from PNG tIME", () => {
  const result = extractMediaTimestamps(pngWithTime(2026, 7, 24, 12, 30, 5));
  assert.equal(result.format, "png");
  assert.equal(result.events[0].timestamp, "2026-07-24T12:30:05Z");
  assert.equal(result.events[0].timezoneBasis, "format-defined-utc");
});

test("extracts MP4 movie-header creation time", () => {
  const result = extractMediaTimestamps(
    mp4WithMovieHeader("2024-01-02T03:04:05.000Z"),
  );
  assert.equal(result.events[0].kind, "mp4-movie-created");
  assert.equal(result.events[0].timestamp, "2024-01-02T03:04:05.000Z");
});

test("returns an explicit warning for unsupported bytes", () => {
  const result = extractMediaTimestamps(new Uint8Array([1, 2, 3]).buffer);
  assert.equal(result.format, "unknown");
  assert.equal(result.events.length, 0);
  assert.match(result.warning, /No supported/);
});

test("correlates zoned events and keeps timezone-free fields separate", () => {
  const result = correlateTimeline(
    [
      {
        id: "a",
        fileName: "PRIVATE-A.JPG",
        lastModified: Date.parse("2026-07-24T10:00:00Z"),
        embeddedEvents: [
          {
            kind: "exif-original",
            label: "EXIF",
            timestamp: "2026:07:24 09:58:00",
            timezoneBasis: "unknown",
          },
        ],
      },
      {
        id: "b",
        fileName: "PRIVATE-B.PNG",
        embeddedEvents: [
          {
            kind: "png-modified",
            label: "PNG",
            timestamp: "2026-07-24T10:03:00Z",
            offset: "Z",
            timezoneBasis: "format-defined-utc",
          },
        ],
      },
    ],
    { clusterMinutes: 5 },
  );
  assert.equal(result.counts.zonedEvents, 2);
  assert.equal(result.counts.unresolvedEvents, 1);
  assert.equal(result.counts.proximityClusters, 1);
});

test("applies an explicit fallback offset without hiding that assumption", () => {
  const result = correlateTimeline(
    [
      {
        id: "a",
        embeddedEvents: [
          {
            timestamp: "2026:07:24 10:00:00",
            timezoneBasis: "unknown",
          },
        ],
      },
    ],
    { fallbackOffset: "+05:30" },
  );
  assert.equal(result.counts.fallbackOffsetEvents, 1);
  assert.equal(result.unresolved.length, 0);
});

test("does not label an embedded offset as the user fallback", () => {
  const result = correlateTimeline(
    [
      {
        id: "a",
        embeddedEvents: [
          {
            timestamp: "2026:07:24 10:00:00",
            offset: "+05:30",
            timezoneBasis: "embedded-offset",
          },
        ],
      },
    ],
    { fallbackOffset: "+01:00" },
  );
  assert.equal(result.counts.fallbackOffsetEvents, 0);
  assert.equal(result.known[0].normalized.offset, "+05:30");
});

test("flags only a review cue when embedded time is later than file metadata", () => {
  const result = correlateTimeline([
    {
      id: "a",
      lastModified: Date.parse("2026-07-24T10:00:00Z"),
      embeddedEvents: [
        {
          timestamp: "2026-07-24T11:00:00Z",
          offset: "Z",
          timezoneBasis: "embedded-offset",
        },
      ],
    },
  ]);
  assert.equal(result.counts.embeddedAfterFilesystem, 1);
});

test("counts-only report excludes filenames and raw timestamps", () => {
  const result = correlateTimeline([
    {
      id: "a",
      fileName: "PRIVATE-FILENAME.JPG",
      format: "jpeg",
      embeddedEvents: [
        {
          timestamp: "1999-03-04T11:00:00Z",
          offset: "Z",
        },
      ],
    },
  ]);
  const report = buildTimelineCountsReport(result);
  const serialized = JSON.stringify(report);
  assert.equal(serialized.includes("PRIVATE-FILENAME"), false);
  assert.equal(serialized.includes("1999-03-04"), false);
  assert.equal(report.scope.authenticityEstablished, false);
  assert.equal(report.scope.sourceMediaTimestampsIncluded, false);
  assert.equal(report.scope.reportGenerationTimestampIncluded, true);
  assert.match(report.createdAtMeaning, /report-generation time/iu);
  assert.match(report.createdAtMeaning, /not a media, capture, or source timestamp/iu);
});

test("selects a batch against the latest file-count reservation", () => {
  const existing = Array.from(
    { length: mediaTimelineInputLimits.maxFiles - 1 },
    (_, index) => ({ id: index, size: 1 }),
  );
  const selected = selectMediaInputBatch(existing, [
    { name: "accepted.png", size: 10 },
    { name: "ignored.png", size: 10 },
  ]);

  assert.equal(selected.ok, true);
  assert.equal(selected.candidates.length, 1);
  assert.equal(selected.candidates[0].name, "accepted.png");
  assert.equal(selected.ignoredFileCount, 1);
});

test("rejects a batch when latest records already reserve the byte limit", () => {
  const almostFull = [
    {
      id: "existing",
      size: mediaTimelineInputLimits.maxBatchBytes - 10,
    },
  ];
  const selected = selectMediaInputBatch(almostFull, [
    { name: "next.jpg", size: 11 },
  ]);

  assert.equal(selected.ok, false);
  assert.match(selected.error, /128 MB/iu);
});

test("rejects oversized and unsupported media before async reading", () => {
  assert.equal(
    selectMediaInputBatch([], [
      {
        name: "too-large.jpg",
        size: mediaTimelineInputLimits.maxFileBytes + 1,
      },
    ]).ok,
    false,
  );
  assert.equal(
    selectMediaInputBatch([], [{ name: "notes.txt", size: 10 }]).ok,
    false,
  );
});
