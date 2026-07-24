import assert from "node:assert/strict";
import test from "node:test";

import {
  AUDIO_LIMITS,
  analyzeAudioBoundaries,
  buildAudioBoundaryReport,
  normalizeBoundarySettings,
  validateAudioFile,
  validateDecodedAudio,
} from "./audioBoundaries.mjs";

function channel(values) {
  return Float32Array.from(values);
}

test("validates encoded audio type and byte limits", () => {
  assert.deepEqual(validateAudioFile({ type: "audio/wav", size: 100 }), {
    ok: true,
    bytes: 100,
    mimeType: "audio/wav",
  });
  assert.equal(validateAudioFile({ type: "video/mp4", size: 100 }).ok, false);
  assert.equal(validateAudioFile({ type: "audio/wav", size: 0 }).ok, false);
  assert.equal(
    validateAudioFile({
      type: "audio/mpeg",
      size: AUDIO_LIMITS.fileBytes + 1,
    }).ok,
    false,
  );
});

test("bounds decoded duration, channels, rate, and total samples", () => {
  assert.equal(
    validateDecodedAudio({
      duration: 1,
      numberOfChannels: 2,
      sampleRate: 48_000,
      length: 48_000,
    }).ok,
    true,
  );
  assert.equal(
    validateDecodedAudio({
      duration: 1,
      numberOfChannels: 3,
      sampleRate: 48_000,
      length: 48_000,
    }).ok,
    false,
  );
  assert.equal(
    validateDecodedAudio({
      duration: AUDIO_LIMITS.durationSeconds + 1,
      numberOfChannels: 1,
      sampleRate: 48_000,
      length: 48_000,
    }).ok,
    false,
  );
});

test("normalizes finite settings into cautious bounds", () => {
  assert.deepEqual(
    normalizeBoundarySettings({
      scoreThreshold: -1,
      absoluteJump: 4,
      dcShift: Number.NaN,
      mergeMilliseconds: 5_000,
    }),
    {
      scoreThreshold: 3,
      absoluteJump: 1,
      dcShift: 0.025,
      mergeMilliseconds: 500,
    },
  );
});

test("quiet constant audio produces no boundary candidates", () => {
  const result = analyzeAudioBoundaries([new Float32Array(2_000)], 1_000);
  assert.equal(result.candidates.length, 0);
  assert.equal(result.waveform.length, 1_000);
});

test("detects an abrupt sample discontinuity as a review candidate", () => {
  const samples = new Float32Array(2_000);
  for (let index = 1_000; index < samples.length; index += 1) {
    samples[index] = 0.6;
  }
  const result = analyzeAudioBoundaries([samples], 1_000, {
    scoreThreshold: 3,
    absoluteJump: 0.05,
    dcShift: 0.02,
  });
  assert.ok(
    result.candidates.some(
      ({ timeSeconds, cue }) =>
        Math.abs(timeSeconds - 1) < 0.02 && cue.includes("sample-jump"),
    ),
  );
});

test("detects a DC shift even when jump threshold is intentionally high", () => {
  const samples = new Float32Array(2_000);
  for (let index = 1_000; index < samples.length; index += 1) {
    samples[index] = 0.04;
  }
  const result = analyzeAudioBoundaries([samples], 1_000, {
    absoluteJump: 1,
    dcShift: 0.015,
  });
  assert.ok(result.candidates.some(({ cue }) => cue === "dc-shift"));
});

test("nearby candidates are merged to the stronger cue", () => {
  const samples = new Float32Array(1_000);
  samples[400] = 0.9;
  samples[420] = -1;
  const result = analyzeAudioBoundaries([samples], 1_000, {
    scoreThreshold: 3,
    absoluteJump: 0.05,
    mergeMilliseconds: 50,
  });
  const nearby = result.candidates.filter(
    ({ timeSeconds }) => timeSeconds >= 0.39 && timeSeconds <= 0.45,
  );
  assert.equal(nearby.length, 1);
});

test("rejects mismatched channel arrays and excessive rates", () => {
  assert.throws(
    () => analyzeAudioBoundaries([channel([0, 1]), channel([0])], 48_000),
    /invalid/u,
  );
  assert.throws(
    () => analyzeAudioBoundaries([channel([0, 1])], 192_000),
    /invalid/u,
  );
});

test("counts-only report omits name, samples, and waveform", () => {
  const analysis = analyzeAudioBoundaries([channel([0, 0, 1, 1, 1, 1])], 100, {
    scoreThreshold: 3,
    absoluteJump: 0.05,
  });
  const report = buildAudioBoundaryReport(
    analysis,
    {
      mimeType: "audio/wav",
      bytes: 24,
      name: "private-interview.wav",
    },
    "2026-07-24T00:00:00.000Z",
  );
  const serialized = JSON.stringify(report);
  assert.equal(report.scope.audioSamplesIncluded, false);
  assert.equal(report.scope.editProven, false);
  assert.ok(!serialized.includes("private-interview"));
  assert.ok(!Object.hasOwn(report, "waveform"));
});
