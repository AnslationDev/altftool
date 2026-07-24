import assert from "node:assert/strict";
import test from "node:test";

import {
  MEDIA_LIMITS,
  buildMotionPreviewReport,
  normalizeCaptureTime,
  readGifDimensions,
  reviewMotionDelivery,
  validateDecodedMedia,
  validateMediaFile,
} from "./motionPreview.mjs";

test("accepts supported bounded media and rejects misleading types", () => {
  assert.deepEqual(validateMediaFile({ type: "image/gif", size: 120 }), {
    ok: true,
    kind: "gif",
    bytes: 120,
  });
  assert.equal(validateMediaFile({ type: "image/png", size: 120 }).ok, false);
  assert.equal(
    validateMediaFile({ type: "video/mp4", size: 0 }).error,
    "The selected file is empty.",
  );
  assert.equal(
    validateMediaFile({
      type: "video/webm",
      size: MEDIA_LIMITS.bytes + 1,
    }).ok,
    false,
  );
});

test("reads GIF87a and GIF89a canvas dimensions", () => {
  for (const signature of ["GIF87a", "GIF89a"]) {
    const bytes = new Uint8Array(10);
    bytes.set(Buffer.from(signature), 0);
    new DataView(bytes.buffer).setUint16(6, 320, true);
    new DataView(bytes.buffer).setUint16(8, 240, true);
    assert.deepEqual(readGifDimensions(bytes.buffer), {
      ok: true,
      width: 320,
      height: 240,
    });
  }
});

test("rejects malformed and zero-size GIF headers", () => {
  assert.equal(readGifDimensions(new ArrayBuffer(5)).ok, false);
  assert.equal(
    readGifDimensions(new TextEncoder().encode("NOTGIF0000").buffer).ok,
    false,
  );

  const bytes = new Uint8Array(10);
  bytes.set(Buffer.from("GIF89a"), 0);
  assert.equal(
    readGifDimensions(bytes.buffer).error,
    "The GIF reports an empty canvas.",
  );
});

test("bounds decoded dimensions and video duration", () => {
  assert.equal(
    validateDecodedMedia({
      kind: "video",
      width: 1920,
      height: 1080,
      duration: 60,
    }).ok,
    true,
  );
  assert.equal(
    validateDecodedMedia({
      kind: "gif",
      width: 8192,
      height: 8192,
    }).ok,
    false,
  );
  assert.equal(
    validateDecodedMedia({
      kind: "video",
      width: 100,
      height: 100,
      duration: MEDIA_LIMITS.durationSeconds + 0.1,
    }).ok,
    false,
  );
  assert.equal(
    validateDecodedMedia({
      kind: "video",
      width: Number.NaN,
      height: 100,
      duration: 10,
    }).ok,
    false,
  );
});

test("capture time is finite, bounded, and stable", () => {
  assert.equal(normalizeCaptureTime(-4, 10), 0);
  assert.equal(normalizeCaptureTime(3.4567, 10), 3.457);
  assert.equal(normalizeCaptureTime(12, 10), 10);
  assert.equal(normalizeCaptureTime(Number.NaN, 10), 0);
});

test("flags SC 2.2.2 only when every moving-content condition applies", () => {
  const baseline = {
    autoplay: true,
    lastsMoreThanFiveSeconds: true,
    runsInParallel: true,
    motionEssential: false,
    pauseControl: false,
    respectsPreference: true,
    meaningfulStill: true,
  };
  const result = reviewMotionDelivery({
    loops: true,
    ...baseline,
  });
  assert.equal(result.level, "action-needed");
  assert.equal(result.counts.high, 1);
  assert.ok(
    result.findings.some(({ code }) => code === "pause-stop-hide-control"),
  );

  for (const override of [
    { autoplay: false },
    { lastsMoreThanFiveSeconds: false },
    { runsInParallel: false },
    { motionEssential: true },
    { pauseControl: true },
  ]) {
    const calibrated = reviewMotionDelivery({ ...baseline, ...override });
    assert.equal(calibrated.counts.high, 0);
  }
});

test("keeps user-initiated looping outside the SC 2.2.2 high finding", () => {
  const result = reviewMotionDelivery({
    autoplay: false,
    loops: true,
    lastsMoreThanFiveSeconds: true,
    runsInParallel: true,
    pauseControl: false,
    respectsPreference: true,
    meaningfulStill: true,
  });
  assert.equal(result.counts.high, 0);
  assert.ok(
    result.findings.some(({ code }) => code === "user-initiated-loop-review"),
  );
});

test("uses calibrated review language when preference or context need work", () => {
  const result = reviewMotionDelivery({
    respectsPreference: false,
    meaningfulStill: false,
  });
  assert.equal(result.level, "review");
  assert.equal(result.counts.review, 2);
});

test("does not turn the checklist into a conformance verdict", () => {
  const result = reviewMotionDelivery({
    autoplay: false,
    loops: false,
    pauseControl: true,
    respectsPreference: true,
    meaningfulStill: true,
  });
  assert.equal(result.level, "no-obvious-risk");
  assert.ok(result.findings.some(({ code }) => code === "controlled-start"));
});

test("privacy-safe report omits file name and media content", () => {
  const review = reviewMotionDelivery({ respectsPreference: true });
  const report = buildMotionPreviewReport({
    media: {
      kind: "video",
      mimeType: "video/mp4",
      bytes: 1000,
      width: 640,
      height: 360,
      duration: 12.3456,
      name: "private-client-name.mp4",
    },
    captureTime: 4,
    review,
  });
  const serialized = JSON.stringify(report);
  assert.equal(report.media.durationSeconds, 12.346);
  assert.equal(
    report.schema,
    "altftool.motion-reduced-media-local-review-report.v1",
  );
  assert.equal(report.reportType, "motion-reduced-media-local-review-report");
  assert.equal(report.scope.mediaMetadataIncluded, true);
  assert.equal(report.scope.selectedSettingsIncluded, true);
  assert.equal(report.scope.reviewFindingsIncluded, true);
  assert.equal(report.scope.mediaIncluded, false);
  assert.equal(report.scope.wcagConformanceEstablished, false);
  assert.ok(!serialized.includes("private-client-name"));
});
