import assert from "node:assert/strict";
import test from "node:test";

import {
  ALIGNMENT_LIMITS,
  analyzeAudioTranscriptCoverage,
  buildTranscriptAlignmentReport,
  compareTimedTranscripts,
  normalizeAlignmentSettings,
  parseTimedTranscript,
  tokenSimilarity,
  validateAlignmentAudioBuffer,
  validateAlignmentAudioFile,
} from "./transcriptAlignment.mjs";

test("validates encoded and decoded audio bounds", () => {
  assert.equal(
    validateAlignmentAudioFile({ type: "audio/wav", size: 100 }).ok,
    true,
  );
  assert.equal(
    validateAlignmentAudioFile({ type: "video/mp4", size: 100 }).ok,
    false,
  );
  assert.equal(
    validateAlignmentAudioFile({
      type: "audio/wav",
      size: ALIGNMENT_LIMITS.audioBytes + 1,
    }).ok,
    false,
  );
  assert.equal(
    validateAlignmentAudioBuffer({
      duration: 5,
      numberOfChannels: 1,
      sampleRate: 48_000,
      length: 240_000,
    }).ok,
    true,
  );
  assert.equal(
    validateAlignmentAudioBuffer({
      duration: 5,
      numberOfChannels: 3,
      sampleRate: 48_000,
      length: 240_000,
    }).ok,
    false,
  );
});

test("parses SRT and WebVTT cues without executing markup", () => {
  const srt = parseTimedTranscript(`1
00:00:00,000 --> 00:00:01,000
Hello <b>world</b>

2
00:00:01,200 --> 00:00:02,000
Door &amp; bell`);
  assert.equal(srt.ok, true);
  assert.equal(srt.cues.length, 2);
  assert.equal(srt.cues[0].text, "Hello world");
  assert.equal(srt.cues[1].text, "Door & bell");

  const vtt = parseTimedTranscript(`WEBVTT

NOTE local note

00:00.000 --> 00:01.000 align:start
Hi`);
  assert.equal(vtt.ok, true);
  assert.equal(vtt.cues[0].startMs, 0);
});

test("reports malformed, overlapping, and out-of-order transcript blocks", () => {
  const parsed = parseTimedTranscript(`1
00:00:02,000 --> 00:00:03,000
Second

bad block

2
00:00:01,000 --> 00:00:02,500
First`);
  assert.equal(parsed.ok, true);
  assert.ok(parsed.issues.some(({ code }) => code === "missing-timing"));
  assert.ok(parsed.issues.some(({ code }) => code === "out-of-order"));
  assert.ok(parsed.issues.some(({ code }) => code === "overlap"));
});

test("rejects empty, oversized, and cue-less transcript input", () => {
  assert.equal(parseTimedTranscript("").ok, false);
  assert.equal(
    parseTimedTranscript("x".repeat(ALIGNMENT_LIMITS.transcriptCharacters + 1))
      .ok,
    false,
  );
  assert.equal(parseTimedTranscript("no timing here").ok, false);
});

test("token similarity is normalized and duplicate-aware", () => {
  assert.equal(tokenSimilarity("Hello, WORLD!", "hello world"), 1);
  assert.equal(tokenSimilarity("go go now", "go now"), 0.8);
  assert.equal(tokenSimilarity("", ""), 1);
  assert.equal(tokenSimilarity("hello", ""), 0);
});

test("reference comparison separates missing, extra, text, and timing cues", () => {
  const reference = [
    { number: 1, startMs: 0, endMs: 1_000, text: "Hello world" },
    { number: 2, startMs: 2_000, endMs: 3_000, text: "Goodbye" },
  ];
  const candidate = [
    { number: 1, startMs: 600, endMs: 1_600, text: "Hello there" },
    { number: 2, startMs: 4_000, endMs: 5_000, text: "Extra cue" },
  ];
  const result = compareTimedTranscripts(candidate, reference, {
    timingToleranceMilliseconds: 500,
    textSimilarityThreshold: 0.85,
  });
  assert.equal(result.counts.textDifference, 1);
  assert.equal(result.counts.timingShift, 1);
  assert.equal(result.counts.unmatchedReference, 1);
  assert.equal(result.counts.extraCandidate, 1);
});

test("aligned identical transcript has no reference findings", () => {
  const cues = [{ number: 1, startMs: 0, endMs: 1_000, text: "Same phrase" }];
  const result = compareTimedTranscripts(cues, cues);
  assert.deepEqual(result.counts, {
    unmatchedReference: 0,
    extraCandidate: 0,
    textDifference: 0,
    timingShift: 0,
  });
});

test("audio coverage finds sustained activity outside cues", () => {
  const samples = new Float32Array(2_000);
  for (let index = 0; index < 1_000; index += 1) samples[index] = 0.5;
  const coverage = analyzeAudioTranscriptCoverage(
    [samples],
    1_000,
    [{ number: 1, startMs: 0, endMs: 500, text: "covered" }],
    {
      activityThresholdDb: -30,
      windowMilliseconds: 50,
      minimumUncoveredMilliseconds: 200,
    },
  );
  assert.equal(coverage.activeCoveragePercent, 50);
  assert.ok(
    coverage.uncoveredActivity.some(
      ({ startMs, endMs }) => startMs === 500 && endMs === 1_000,
    ),
  );
});

test("audio coverage flags quiet and out-of-range timed cues", () => {
  const coverage = analyzeAudioTranscriptCoverage(
    [new Float32Array(1_000)],
    1_000,
    [
      { number: 1, startMs: 100, endMs: 500, text: "quiet" },
      { number: 2, startMs: 1_200, endMs: 1_400, text: "outside" },
    ],
    { activityThresholdDb: -40 },
  );
  assert.equal(coverage.quietCues[0].cueNumber, 1);
  assert.equal(coverage.outOfRangeCues[0].cueNumber, 2);
});

test("coverage rejects mismatched or excessive sample arrays", () => {
  assert.throws(
    () =>
      analyzeAudioTranscriptCoverage(
        [Float32Array.from([0, 1]), Float32Array.from([0])],
        1_000,
        [],
      ),
    /invalid/u,
  );
  assert.throws(
    () =>
      analyzeAudioTranscriptCoverage([Float32Array.from([0, 1])], 192_000, []),
    /invalid/u,
  );
});

test("normalizes settings into bounded finite values", () => {
  const settings = normalizeAlignmentSettings({
    activityThresholdDb: -200,
    windowMilliseconds: 1,
    minimumUncoveredMilliseconds: 99_999,
    timingToleranceMilliseconds: Number.NaN,
    textSimilarityThreshold: 4,
  });
  assert.deepEqual(settings, {
    activityThresholdDb: -80,
    windowMilliseconds: 20,
    minimumUncoveredMilliseconds: 5_000,
    timingToleranceMilliseconds: 500,
    textSimilarityThreshold: 1,
  });
});

test("privacy-safe report ignores empty initial state", () => {
  assert.equal(buildTranscriptAlignmentReport(null), null);
  assert.equal(buildTranscriptAlignmentReport(), null);
});

test("privacy-safe report omits transcript text, audio, and file name", () => {
  const candidateParse = parseTimedTranscript(`1
00:00:00,000 --> 00:00:01,000
Private Project Falcon`);
  const samples = new Float32Array(1_000);
  samples.fill(0.2);
  const coverage = analyzeAudioTranscriptCoverage(
    [samples],
    1_000,
    candidateParse.cues,
  );
  const comparison = compareTimedTranscripts(
    candidateParse.cues,
    candidateParse.cues,
  );
  const report = buildTranscriptAlignmentReport(
    {
      media: {
        mimeType: "audio/wav",
        bytes: 4_000,
        channels: 1,
        sampleRate: 1_000,
        name: "client-name.wav",
      },
      candidateParse,
      referenceParse: candidateParse,
      coverage,
      comparison,
    },
    "2026-07-24T00:00:00.000Z",
  );
  const serialized = JSON.stringify(report);
  assert.equal(report.scope.transcriptTextIncluded, false);
  assert.equal(report.scope.semanticAccuracyEstablished, false);
  assert.ok(!serialized.includes("Falcon"));
  assert.ok(!serialized.includes("client-name"));
});
