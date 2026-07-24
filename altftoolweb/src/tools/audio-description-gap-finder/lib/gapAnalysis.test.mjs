import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_SETTINGS,
  LIMITS,
  analyzePcmChannels,
  buildCountsTimingReport,
  computeRmsWindows,
  findQuietIntervals,
  mergeIntervals,
  parseDialogueCues,
  parseTimeToken,
  rankCandidateGaps,
  rmsToDbfs,
  subtractDialogueIntervals,
  validateDecodedAudio,
  validateMediaFile,
  validateSettings,
} from "./gapAnalysis.mjs";

test("validates media files before reading bytes", () => {
  assert.equal(
    validateMediaFile({ size: 10, type: "audio/wav", name: "private.wav" }).ok,
    true,
  );
  assert.equal(
    validateMediaFile({
      size: 10,
      type: "",
      name: "private.webm",
    }).ok,
    true,
  );
  assert.match(
    validateMediaFile({
      size: LIMITS.maxMediaBytes + 1,
      type: "video/mp4",
      name: "large.mp4",
    }).error,
    /30 MB/u,
  );
  assert.equal(
    validateMediaFile({ size: 10, type: "text/plain", name: "notes.txt" }).ok,
    false,
  );
});

test("enforces decoded duration, channel, sample-rate, and sample-value bounds", () => {
  const valid = validateDecodedAudio({
    duration: 10,
    sampleRate: 48_000,
    numberOfChannels: 2,
    length: 480_000,
  });
  assert.equal(valid.ok, true);

  const invalid = validateDecodedAudio({
    duration: LIMITS.maxDurationSeconds + 1,
    sampleRate: LIMITS.maxSampleRate + 1,
    numberOfChannels: LIMITS.maxChannels + 1,
    length: LIMITS.maxSampleValues,
  });
  assert.equal(invalid.ok, false);
  assert.match(invalid.errors.join(" "), /10-minute/u);
  assert.match(invalid.errors.join(" "), /1 or 2/u);
  assert.match(invalid.errors.join(" "), /96 kHz/u);
  assert.match(invalid.errors.join(" "), /sample-value/u);
});

test("computes deterministic multichannel windowed RMS and dBFS", () => {
  const left = new Float32Array(800).fill(0.5);
  const right = new Float32Array(800).fill(-0.5);
  const windows = computeRmsWindows([left, right], 8_000, 50);

  assert.equal(windows.length, 2);
  assert.equal(windows[0].startMs, 0);
  assert.equal(windows[0].endMs, 50);
  assert.equal(windows[0].rms, 0.5);
  assert.equal(windows[0].dbfs, -6);
  assert.equal(rmsToDbfs(0), -120);
  assert.equal(rmsToDbfs(1), 0);
});

test("honors the per-window sample bound with deterministic strides", () => {
  const samples = new Float32Array(8_000).fill(0.25);
  const windows = computeRmsWindows([samples], 8_000, 1_000, 100);
  assert.equal(windows.length, 1);
  assert.equal(windows[0].stride, 80);
  assert.equal(windows[0].sampledValues, 100);
  assert.equal(windows[0].rms, 0.25);
});

test("finds quiet runs and bridges only the configured short break", () => {
  const windows = [
    { startMs: 0, endMs: 250, meanSquare: 0, dbfs: -120 },
    { startMs: 250, endMs: 500, meanSquare: 0, dbfs: -120 },
    { startMs: 500, endMs: 750, meanSquare: 0.25, dbfs: -6 },
    { startMs: 750, endMs: 1_000, meanSquare: 0, dbfs: -120 },
  ];
  const separate = findQuietIntervals(windows, -40, 0);
  const bridged = findQuietIntervals(windows, -40, 250);

  assert.equal(separate.length, 2);
  assert.deepEqual(
    separate.map((interval) => [interval.startMs, interval.endMs]),
    [
      [0, 500],
      [750, 1_000],
    ],
  );
  assert.equal(bridged.length, 1);
  assert.equal(bridged[0].bridgedMs, 250);
});

test("parses SRT, WebVTT, and bounded manual cue timings without retaining text", () => {
  const privateText = "PRIVATE DIALOGUE 8675309";
  const parsed = parseDialogueCues(
    `WEBVTT

1
00:00:01.000 --> 00:00:03.000
${privateText}

2.5,4.5

bad --> timing
`,
    5_000,
  );
  assert.equal(parsed.ok, true);
  assert.equal(parsed.validTimings, 2);
  assert.equal(parsed.malformedTimings, 1);
  assert.equal(parsed.format, "mixed");
  assert.equal(JSON.stringify(parsed).includes(privateText), false);
  assert.equal(parseTimeToken("01:02:03,45"), 3_723_450);
  assert.equal(parseTimeToken("2.25"), 2_250);
  assert.equal(parseTimeToken("n/a"), null);
});

test("rejects caption character and timing counts above fixed bounds", () => {
  const tooLong = parseDialogueCues(
    "x".repeat(LIMITS.maxCaptionCharacters + 1),
  );
  assert.equal(tooLong.ok, false);
  assert.match(tooLong.error, /500,000-character/u);

  const tooManyTimings = parseDialogueCues(
    Array.from(
      { length: LIMITS.maxCueTimings + 1 },
      (_, index) => `${index + 1},${index + 1.5}`,
    ).join("\n"),
  );
  assert.equal(tooManyTimings.ok, false);
  assert.match(tooManyTimings.error, /5,000 cue-timing/u);
});

test("detects and merges overlapping dialogue intervals", () => {
  const parsed = parseDialogueCues(
    `00:01.000 --> 00:04.000
00:03.000 --> 00:05.000
00:05.000 --> 00:06.000`,
    10_000,
  );
  assert.equal(parsed.overlapPairs, 1);
  assert.deepEqual(parsed.merged, [
    { startMs: 1_000, endMs: 6_000, sourceIntervals: 3 },
  ]);
  assert.deepEqual(
    mergeIntervals([
      { startMs: 2_000, endMs: 3_000 },
      { startMs: 0, endMs: 1_000 },
      { startMs: 900, endMs: 2_100 },
    ]),
    [{ startMs: 0, endMs: 3_000, sourceIntervals: 3 }],
  );
});

test("subtracts dialogue, preserves boundary gaps, and drops short remnants", () => {
  const candidates = subtractDialogueIntervals(
    [
      {
        startMs: 0,
        endMs: 5_000,
        meanDbfs: -60,
        maximumDbfs: -55,
        bridgedMs: 0,
      },
      {
        startMs: 8_000,
        endMs: 10_000,
        meanDbfs: -50,
        maximumDbfs: -45,
        bridgedMs: 0,
      },
    ],
    [{ startMs: 1_500, endMs: 3_500 }],
    1_000,
    10_000,
    250,
  );

  assert.deepEqual(
    candidates.map((candidate) => [
      candidate.startMs,
      candidate.endMs,
      candidate.nearMediaBoundary,
    ]),
    [
      [0, 1_500, true],
      [3_500, 5_000, false],
      [8_000, 10_000, true],
    ],
  );
  assert.equal(candidates[0].dialogueTrimmed, true);
  assert.equal(candidates[1].nearDialogue, true);
});

test("ranks deterministically by numeric planning evidence, never semantics", () => {
  const ranked = rankCandidateGaps([
    {
      startMs: 5_000,
      endMs: 7_000,
      durationMs: 2_000,
      meanDbfs: -50,
      nearMediaBoundary: false,
      nearDialogue: false,
      dialogueTrimmed: false,
      bridgedMs: 0,
    },
    {
      startMs: 1_000,
      endMs: 5_000,
      durationMs: 4_000,
      meanDbfs: -60,
      nearMediaBoundary: false,
      nearDialogue: false,
      dialogueTrimmed: false,
      bridgedMs: 0,
    },
  ]);
  assert.equal(ranked[0].startMs, 1_000);
  assert.equal(ranked[0].rank, 1);
  assert.equal(ranked[1].rank, 2);
  assert.equal("suitable" in ranked[0], false);
});

test("validates analysis settings within the bounded duration", () => {
  assert.equal(validateSettings(DEFAULT_SETTINGS).ok, true);
  const invalid = validateSettings({
    ...DEFAULT_SETTINGS,
    windowMs: 50,
    quietThresholdDbfs: -100,
    minimumGapMs: 100,
  });
  assert.equal(invalid.ok, false);
  assert.match(invalid.errors.join(" "), /-90 and -6/u);
  assert.match(invalid.errors.join(" "), /250 and 60,000/u);
});

test("end-to-end analysis subtracts dialogue from local PCM candidates", () => {
  const sampleRate = 8_000;
  const samples = new Float32Array(sampleRate * 4);
  samples.fill(0, 0, sampleRate * 2);
  samples.fill(0.5, sampleRate * 2, sampleRate * 3);
  samples.fill(0, sampleRate * 3);

  const result = analyzePcmChannels({
    channels: [samples],
    sampleRate,
    settings: {
      ...DEFAULT_SETTINGS,
      minimumGapMs: 500,
      dialoguePaddingMs: 0,
    },
    dialogueSource: "0.5,1.5",
  });

  assert.equal(result.ok, true);
  assert.equal(result.metadata.durationMs, 4_000);
  assert.deepEqual(
    result.candidates.map((candidate) => [candidate.startMs, candidate.endMs]),
    [
      [3_000, 4_000],
      [1_500, 2_000],
      [0, 500],
    ],
  );
});

test("counts/timing-only report excludes media, cue text, and file names", () => {
  const secret = "PRIVATE TRANSCRIPT 24680";
  const fileName = "confidential-client-video.mp4";
  const samples = new Float32Array(8_000).fill(0);
  const result = analyzePcmChannels({
    channels: [samples],
    sampleRate: 8_000,
    settings: { ...DEFAULT_SETTINGS, minimumGapMs: 500 },
    dialogueSource: `00:00.100 --> 00:00.200\n${secret}`,
  });
  result.privateFileNameForTest = fileName;
  const report = buildCountsTimingReport(result, "2026-07-24T00:00:00.000Z");
  const serialized = JSON.stringify(report);

  assert.equal(report.reportType, "audio-description-gap-counts-timing-only");
  assert.equal(serialized.includes(secret), false);
  assert.equal(serialized.includes(fileName), false);
  assert.equal(
    report.settings.quietThresholdDbfs,
    DEFAULT_SETTINGS.quietThresholdDbfs,
  );
  assert.equal("sampleRate" in report.mediaTiming, false);
  assert.equal("meanDbfs" in report.candidateTimings[0], false);
});
