import test from "node:test";
import assert from "node:assert/strict";

import {
  FLASH_MOTION_LIMITS,
  FLASH_THRESHOLDS,
  analyzeSampledFrames,
  assessMappedArea,
  buildCountsTimingReport,
  buildSampleTimes,
  buildSamplingWarnings,
  calculateWorkingDimensions,
  detectVideoContainer,
  inspectPixelTransition,
  maxEventsInRollingWindow,
  relativeLuminance,
  validateEncodedVideo,
  validateSamplingSettings,
  validateVideoMetadata,
} from "./flashMotionAnalysis.mjs";

function solid(red, green, blue, pixelCount = 4) {
  const pixels = new Uint8ClampedArray(pixelCount * 4);
  for (let offset = 0; offset < pixels.length; offset += 4) {
    pixels[offset] = red;
    pixels[offset + 1] = green;
    pixels[offset + 2] = blue;
    pixels[offset + 3] = 255;
  }
  return pixels;
}

function oneChangedPixel(changed = [255, 255, 255], unchanged = [0, 0, 0]) {
  const pixels = solid(...unchanged, 4);
  pixels.set([...changed, 255], 0);
  return pixels;
}

const MP4_HEADER = new Uint8Array([
  0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d,
]);
const WEBM_HEADER = new Uint8Array([
  0x1a, 0x45, 0xdf, 0xa3, 0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d,
]);

test("relative luminance linearizes sRGB and honors alpha over black", () => {
  assert.equal(relativeLuminance(0, 0, 0), 0);
  assert.ok(Math.abs(relativeLuminance(255, 255, 255) - 1) < 0.00001);
  assert.ok(Math.abs(relativeLuminance(255, 0, 0) - 0.2126) < 0.00001);
  assert.ok(Math.abs(relativeLuminance(255, 255, 255, 0)) < 0.00001);
  assert.ok(relativeLuminance(128, 128, 128) < 0.25);
});

test("general transition requires 0.10 luminance change and darker state below 0.80", () => {
  const blackToWhite = inspectPixelTransition([0, 0, 0], [255, 255, 255]);
  assert.equal(blackToWhite.generalDirection, 1);
  assert.equal(blackToWhite.changedForMotion, true);

  const brightToWhite = inspectPixelTransition(
    [235, 235, 235],
    [255, 255, 255],
  );
  assert.equal(brightToWhite.generalDirection, 0);
});

test("saturated-red transition uses red ratio and CIE UCS distance", () => {
  const redToBlack = inspectPixelTransition([255, 0, 0], [0, 0, 0]);
  const grayToBlack = inspectPixelTransition([128, 128, 128], [0, 0, 0]);
  assert.equal(redToBlack.redQualifies, true);
  assert.ok(
    redToBlack.redChromaticityDifference >
      FLASH_THRESHOLDS.redChromaticityDifference,
  );
  assert.equal(grayToBlack.redQualifies, false);
});

test("opposing black-white-black transitions form one general flash pair", () => {
  const result = analyzeSampledFrames(
    [
      { timeMs: 0, rgba: solid(0, 0, 0) },
      { timeMs: 100, rgba: solid(255, 255, 255) },
      { timeMs: 200, rgba: solid(0, 0, 0) },
    ],
    { sampleRate: 10 },
  );
  assert.equal(result.generalFlashPairCount, 1);
  assert.equal(result.maximumGeneralAreaFraction, 1);
  assert.equal(result.maximumGeneralPairsInOneSecond, 1);
});

test("opposing black-red-black transitions form a red flash pair", () => {
  const result = analyzeSampledFrames(
    [
      { timeMs: 0, rgba: solid(0, 0, 0) },
      { timeMs: 100, rgba: solid(255, 0, 0) },
      { timeMs: 200, rgba: solid(0, 0, 0) },
    ],
    { sampleRate: 10 },
  );
  assert.equal(result.redFlashPairCount, 1);
  assert.equal(result.maximumRedAreaFraction, 1);
});

test("rolling one-second count includes events exactly on both boundaries", () => {
  assert.equal(maxEventsInRollingWindow([0, 200, 400, 1_000]), 4);
  assert.equal(maxEventsInRollingWindow([0, 1_001, 1_100]), 2);
});

test("eight alternating transitions form four non-overlapping flash pairs", () => {
  const colors = [0, 255, 0, 255, 0, 255, 0, 255, 0].map((value, index) => ({
    timeMs: index * 100,
    rgba: solid(value, value, value),
  }));
  const result = analyzeSampledFrames(colors, { sampleRate: 10 });
  assert.equal(result.generalFlashPairCount, 4);
  assert.equal(result.maximumGeneralPairsInOneSecond, 4);
  assert.equal(result.maximumGeneralTransitionEquivalentCountInOneSecond, 8);
  assert.equal(result.maximumGeneralFlashEquivalentInOneSecond, 4);
});

test("red transition vectors are also consumed in non-overlapping pairs", () => {
  const colors = [
    [0, 0, 0],
    [255, 0, 0],
    [0, 0, 0],
    [255, 0, 0],
    [0, 0, 0],
    [255, 0, 0],
    [0, 0, 0],
    [255, 0, 0],
    [0, 0, 0],
  ].map((color, index) => ({
    timeMs: index * 100,
    rgba: solid(...color),
  }));
  const result = analyzeSampledFrames(colors, { sampleRate: 10 });
  assert.equal(result.redFlashPairCount, 4);
  assert.equal(result.maximumRedPairsInOneSecond, 4);
  assert.equal(result.maximumRedFlashEquivalentInOneSecond, 4);
});

test("seven alternating transitions retain the G19 half-flash caution", () => {
  const colors = [0, 255, 0, 255, 0, 255, 0, 255].map((value, index) => ({
    timeMs: index * 100,
    rgba: solid(value, value, value),
  }));
  const result = analyzeSampledFrames(colors, { sampleRate: 10 });
  assert.equal(result.generalFlashPairCount, 3);
  assert.equal(result.maximumGeneralPairsInOneSecond, 3);
  assert.equal(result.maximumGeneralTransitionEquivalentCountInOneSecond, 7);
  assert.equal(result.maximumGeneralFlashEquivalentInOneSecond, 3.5);
});

test("same-direction luminance transitions do not accumulate as flashes", () => {
  const colors = [0, 100, 150, 190, 220, 250].map((value, index) => ({
    timeMs: index * 100,
    rgba: solid(value, value, value),
  }));
  const result = analyzeSampledFrames(colors, { sampleRate: 10 });
  assert.equal(result.generalFlashPairCount, 0);
  assert.equal(result.maximumGeneralFlashEquivalentInOneSecond, 0.5);
});

test("an unmatched transition expires before an opposite transition after one second", () => {
  const frames = [
    { timeMs: 0, rgba: solid(0, 0, 0) },
    { timeMs: 100, rgba: solid(255, 0, 0) },
  ];
  for (let timeMs = 200; timeMs <= 1_200; timeMs += 100) {
    frames.push({ timeMs, rgba: solid(255, 0, 0) });
  }
  frames.push({ timeMs: 1_300, rgba: solid(0, 0, 0) });
  const result = analyzeSampledFrames(frames, { sampleRate: 10 });
  assert.equal(result.generalFlashPairCount, 0);
  assert.equal(result.redFlashPairCount, 0);
  assert.equal(result.maximumGeneralFlashEquivalentInOneSecond, 0.5);
  assert.equal(result.maximumRedFlashEquivalentInOneSecond, 0.5);
});

test("a sampling gap resets opposing-transition pairing", () => {
  const result = analyzeSampledFrames(
    [
      { timeMs: 0, rgba: solid(0, 0, 0) },
      { timeMs: 100, rgba: solid(255, 255, 255) },
      { timeMs: 350, rgba: solid(0, 0, 0) },
      { timeMs: 450, rgba: solid(255, 255, 255) },
    ],
    { sampleRate: 10 },
  );
  assert.equal(result.samplingGapCount, 1);
  assert.equal(result.generalFlashPairCount, 0);
});

test("affected area fraction and exact G176 web boundary are retained as estimates", () => {
  const result = analyzeSampledFrames(
    [
      { timeMs: 0, rgba: solid(0, 0, 0) },
      {
        timeMs: 100,
        rgba: oneChangedPixel([255, 255, 255]),
      },
      { timeMs: 200, rgba: solid(0, 0, 0) },
    ],
    {
      displayHeight: 256,
      displayWidth: 341,
      sampleRate: 10,
    },
  );
  assert.equal(result.maximumGeneralAreaFraction, 0.25);
  assert.equal(result.generalEvents[0].estimatedCssPixels, 21_824);
  assert.equal(result.mappedBoundaryCueCount, 1);

  assert.deepEqual(assessMappedArea(0.25, 341, 256), {
    estimatedCssPixels: 21_824,
    atOrAboveSmallAreaBoundary: true,
  });
  assert.equal(
    assessMappedArea(0.249, 341, 256).atOrAboveSmallAreaBoundary,
    false,
  );
});

test("large frame-change cue is a separate non-normative metric", () => {
  const result = analyzeSampledFrames(
    [
      { timeMs: 0, rgba: solid(0, 0, 0) },
      {
        timeMs: 100,
        rgba: oneChangedPixel([255, 255, 255]),
      },
    ],
    { sampleRate: 10 },
  );
  assert.equal(result.motionCueCount, 1);
  assert.equal(result.maximumMotionAreaFraction, 0.25);
  assert.equal(result.maximumMeanLuminanceDifference, 0.25);
});

test("strict encoded checks require matching MP4 or WebM MIME and signature", () => {
  assert.equal(detectVideoContainer(MP4_HEADER), "video/mp4");
  assert.equal(detectVideoContainer(WEBM_HEADER), "video/webm");
  assert.equal(
    validateEncodedVideo({ size: 10_000, type: "video/mp4" }, MP4_HEADER).ok,
    true,
  );
  assert.equal(
    validateEncodedVideo({ size: 10_000, type: "video/webm" }, MP4_HEADER).ok,
    false,
  );
  assert.equal(
    validateEncodedVideo({ size: 10_000, type: "video/quicktime" }, MP4_HEADER)
      .ok,
    false,
  );
});

test("encoded bytes and decoded metadata have hard caps", () => {
  assert.equal(
    validateEncodedVideo(
      {
        size: FLASH_MOTION_LIMITS.maxEncodedBytes + 1,
        type: "video/mp4",
      },
      MP4_HEADER,
    ).ok,
    false,
  );
  assert.equal(
    validateVideoMetadata({
      duration: FLASH_MOTION_LIMITS.maxDurationSeconds + 0.1,
      videoHeight: 720,
      videoWidth: 1_280,
    }).ok,
    false,
  );
  assert.equal(
    validateVideoMetadata({
      duration: 10,
      videoHeight: 4_096,
      videoWidth: 4_096,
    }).ok,
    false,
  );
});

test("working dimensions and sample plans stay within memory and frame caps", () => {
  const working = calculateWorkingDimensions(3_840, 2_160);
  assert.ok(working.width <= FLASH_MOTION_LIMITS.maxWorkingEdge);
  assert.ok(working.pixels <= FLASH_MOTION_LIMITS.maxWorkingPixels);
  const times = buildSampleTimes(
    FLASH_MOTION_LIMITS.maxDurationSeconds,
    FLASH_MOTION_LIMITS.maxSampleRate,
  );
  assert.ok(times.length <= FLASH_MOTION_LIMITS.maxSampledFrames);
  assert.equal(times[0], 0);
  assert.ok(times.at(-1) < FLASH_MOTION_LIMITS.maxDurationSeconds);
});

test("sampling settings require bounded fps and paired display dimensions", () => {
  assert.equal(
    validateSamplingSettings({
      displayHeight: "",
      displayWidth: "800",
      sampleRate: 15,
    }).ok,
    false,
  );
  assert.equal(
    validateSamplingSettings({
      displayHeight: "450",
      displayWidth: "800",
      sampleRate: 15,
      sourceFps: 30,
    }).ok,
    true,
  );
  assert.match(
    buildSamplingWarnings({ sampleRate: 15, sourceFps: 30 })[0],
    /below the declared 30 fps/u,
  );
  assert.match(
    buildSamplingWarnings({ sampleRate: 15, sourceFps: "" })[0],
    /unknown/u,
  );
});

test("counts-and-timings report excludes names, frames, pixels, and thumbnails", () => {
  const analysis = analyzeSampledFrames(
    [
      { timeMs: 0, rgba: solid(0, 0, 0) },
      { timeMs: 100, rgba: solid(255, 255, 255) },
      { timeMs: 200, rgba: solid(0, 0, 0) },
    ],
    { sampleRate: 10 },
  );
  const report = buildCountsTimingReport({
    durationMs: 200,
    fileName: "private-video.mp4",
    result: {
      ...analysis,
      frames: ["secret"],
      pixels: [1, 2, 3],
      thumbnails: ["data:image/png;base64,secret"],
    },
    sampleRate: 10,
  });
  const serialized = JSON.stringify(report);
  assert.equal(report.reportKind, "counts-and-timings-only");
  assert.equal(report.generalFlashPairCueCount, 1);
  assert.doesNotMatch(
    serialized,
    /private-video|secret|data:image|"frames"|"pixels"|"thumbnails"/u,
  );
});
