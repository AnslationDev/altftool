import assert from "node:assert/strict";
import test from "node:test";

import {
  CONTINUITY_REPORT_SCHEMA,
  CONTINUITY_THRESHOLDS,
  VIDEO_LIMITS,
  assessThumbnailSafety,
  buildPrivacySafeContinuityReport,
  buildSampleTimes,
  calculateHistogramDistance,
  calculatePixelDifference,
  calculateWorkingDimensions,
  classifyContinuityChange,
  compareFramePixels,
  mergeContinuityCues,
  minimumFullCoverageInterval,
  summarizeFramePixels,
  validateVideoFile,
  validateVideoMetadata,
} from "./videoContinuity.mjs";

function solidFrame(red, green, blue, count = 4) {
  const output = new Uint8ClampedArray(count * 4);
  for (let offset = 0; offset < output.length; offset += 4) {
    output[offset] = red;
    output[offset + 1] = green;
    output[offset + 2] = blue;
    output[offset + 3] = 255;
  }
  return output;
}

test("video file preflight uses an exact MIME allowlist and byte limit", () => {
  assert.equal(validateVideoFile({ size: 1024, type: "video/mp4" }).ok, true);
  assert.equal(
    validateVideoFile({ size: 1024, type: "application/mp4" }).ok,
    false,
  );
  assert.equal(validateVideoFile({ size: 1024, type: "" }).ok, false);
  assert.equal(validateVideoFile({ size: 0, type: "video/mp4" }).ok, false);
  assert.equal(
    validateVideoFile({
      size: VIDEO_LIMITS.maxFileBytes + 1,
      type: "video/mp4",
    }).ok,
    false,
  );
});

test("decoded metadata rejects excessive duration, edges, and pixel area", () => {
  assert.deepEqual(
    validateVideoMetadata({
      duration: 30,
      videoWidth: 1920,
      videoHeight: 1080,
    }),
    {
      ok: true,
      durationSeconds: 30,
      width: 1920,
      height: 1080,
    },
  );
  assert.equal(
    validateVideoMetadata({
      duration: VIDEO_LIMITS.maxDurationSeconds + 0.1,
      videoWidth: 1920,
      videoHeight: 1080,
    }).ok,
    false,
  );
  assert.equal(
    validateVideoMetadata({
      duration: 30,
      videoWidth: 4097,
      videoHeight: 100,
    }).ok,
    false,
  );
  assert.equal(
    validateVideoMetadata({
      duration: 30,
      videoWidth: 4096,
      videoHeight: 2161,
    }).ok,
    false,
  );
  assert.equal(
    validateVideoMetadata({
      duration: Number.POSITIVE_INFINITY,
      videoWidth: 100,
      videoHeight: 100,
    }).ok,
    false,
  );
});

test("working dimensions preserve ratio while respecting edge and area caps", () => {
  assert.deepEqual(calculateWorkingDimensions(320, 180), {
    width: 320,
    height: 180,
    pixels: 57_600,
    scale: 1,
  });
  const portrait = calculateWorkingDimensions(1080, 1920);
  assert.equal(portrait.width, 180);
  assert.equal(portrait.height, 320);
  assert.ok(portrait.pixels <= VIDEO_LIMITS.maxWorkingPixels);
  const square = calculateWorkingDimensions(4096, 2160);
  assert.ok(square.pixels <= VIDEO_LIMITS.maxWorkingPixels);
  assert.ok(
    Math.max(square.width, square.height) <= VIDEO_LIMITS.maxWorkingEdge,
  );
});

test("sample plan includes the beginning and near-end without exceeding cap", () => {
  assert.deepEqual(buildSampleTimes(10, 2), [0, 2, 4, 6, 8, 9.95]);
  const recommended = minimumFullCoverageInterval(600);
  assert.equal(recommended, 10.25);
  const samples = buildSampleTimes(600, recommended);
  assert.ok(samples.length <= VIDEO_LIMITS.maxSampledFrames);
  assert.equal(samples[0], 0);
  assert.equal(samples.at(-1), 599.95);
  assert.throws(() => buildSampleTimes(600, 0.25), /exceed 60/u);
  assert.throws(() => buildSampleTimes(10, 0.1), /between 0.25 and 30/u);
});

test("thumbnail gate rejects oversized plans and working canvases", () => {
  assert.deepEqual(assessThumbnailSafety(24, 57_600), {
    safe: true,
    reason: "",
  });
  assert.equal(assessThumbnailSafety(25, 57_600).safe, false);
  assert.equal(assessThumbnailSafety(1, 57_601).safe, false);
});

test("frame summary and normalized differences are deterministic", () => {
  const black = solidFrame(0, 0, 0);
  const white = solidFrame(255, 255, 255);
  const blackSummary = summarizeFramePixels(black);
  assert.equal(blackSummary.meanLuminance, 0);
  assert.equal(blackSummary.luminanceHistogram[0], 1);
  assert.equal(calculatePixelDifference(black, black), 0);
  assert.equal(calculatePixelDifference(black, white), 1);
  assert.equal(
    calculateHistogramDistance(
      blackSummary.luminanceHistogram,
      summarizeFramePixels(white).luminanceHistogram,
    ),
    1,
  );
});

test("threshold boundaries distinguish near-duplicate, ordinary, and high change", () => {
  assert.equal(
    classifyContinuityChange({
      pixelDifference: CONTINUITY_THRESHOLDS.nearDuplicatePixelDifference,
      histogramDistance: CONTINUITY_THRESHOLDS.nearDuplicateHistogramDistance,
    }),
    "near-duplicate",
  );
  assert.equal(
    classifyContinuityChange({
      pixelDifference: 0.05,
      histogramDistance: 0.1,
    }),
    "ordinary-change",
  );
  assert.equal(
    classifyContinuityChange({
      pixelDifference: CONTINUITY_THRESHOLDS.highChangePixelDifference,
      histogramDistance: 0,
    }),
    "high-change",
  );
  assert.equal(
    classifyContinuityChange({
      pixelDifference: 0,
      histogramDistance: CONTINUITY_THRESHOLDS.highChangeHistogramDistance,
    }),
    "high-change",
  );
});

test("pair comparison reports ordered timing and expected cues", () => {
  const black = solidFrame(0, 0, 0);
  const white = solidFrame(255, 255, 255);
  assert.equal(
    compareFramePixels(black, black, { fromTime: 0, toTime: 1 }).cue,
    "near-duplicate",
  );
  assert.equal(
    compareFramePixels(black, white, { fromTime: 1, toTime: 2 }).cue,
    "high-change",
  );
  assert.throws(
    () => compareFramePixels(black, white, { fromTime: 2, toTime: 1 }),
    /ordered/u,
  );
});

test("adjacent cues of one type merge while different and ordinary cues split", () => {
  const ranges = mergeContinuityCues([
    {
      cue: "near-duplicate",
      fromTime: 0,
      toTime: 1,
      pixelDifference: 0.001,
      histogramDistance: 0,
    },
    {
      cue: "near-duplicate",
      fromTime: 1,
      toTime: 2,
      pixelDifference: 0.002,
      histogramDistance: 0.001,
    },
    {
      cue: "ordinary-change",
      fromTime: 2,
      toTime: 3,
      pixelDifference: 0.05,
      histogramDistance: 0.1,
    },
    {
      cue: "high-change",
      fromTime: 3,
      toTime: 4,
      pixelDifference: 0.5,
      histogramDistance: 0.4,
    },
  ]);
  assert.equal(ranges.length, 2);
  assert.deepEqual(ranges[0], {
    cue: "near-duplicate",
    startSeconds: 0,
    endSeconds: 2,
    pairCount: 2,
    peakPixelDifference: 0.002,
    peakHistogramDistance: 0.001,
  });
  assert.equal(ranges[1].cue, "high-change");
});

test("privacy report contains only counts, timing, cues, and fixed limitations", () => {
  const privateInput = {
    filename: "private-family-video.mp4",
    frames: ["data:image/jpeg;base64,secret"],
    pixels: [1, 2, 3],
    thumbnails: ["secret"],
  };
  const comparisons = [
    {
      cue: "near-duplicate",
      fromTime: 0,
      toTime: 1,
      pixelDifference: 0,
      histogramDistance: 0,
      ...privateInput,
    },
  ];
  const ranges = mergeContinuityCues(comparisons);
  const report = buildPrivacySafeContinuityReport({
    ...privateInput,
    durationSeconds: 2,
    intervalSeconds: 1,
    sampleTimes: [0, 1, 1.95],
    comparisons,
    ranges,
  });
  assert.equal(report.schema, CONTINUITY_REPORT_SCHEMA);
  assert.equal(report.counts.sampledFrames, 3);
  assert.equal(report.counts.nearDuplicatePairs, 1);
  assert.deepEqual(report.cueRanges[0], {
    cue: "near-duplicate",
    startSeconds: 0,
    endSeconds: 1,
    pairCount: 1,
  });
  const serialized = JSON.stringify(report);
  for (const forbidden of [
    "private-family-video",
    "data:image",
    "secret",
    "pixelDifference",
    "histogramDistance",
  ]) {
    assert.equal(serialized.includes(forbidden), false);
  }
  const reportKeys = [];
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      reportKeys.push(key.toLowerCase());
      visit(child);
    }
  };
  visit(report);
  for (const forbiddenKey of ["filename", "frames", "pixels", "thumbnails"]) {
    assert.equal(reportKeys.includes(forbiddenKey), false);
  }
});
