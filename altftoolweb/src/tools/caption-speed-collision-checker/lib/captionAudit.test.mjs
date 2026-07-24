import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_THRESHOLDS,
  auditCaptions,
  buildCountsOnlyCaptionReport,
  parseCaptionText,
  validateThresholds,
} from "./captionAudit.mjs";

test("parses SRT cues and calculates structural metrics", () => {
  const result = auditCaptions(`1
00:00:01,000 --> 00:00:03,000
Hello world

2
00:00:03,000 --> 00:00:05,000
Second line`);

  assert.equal(result.ok, true);
  assert.equal(result.format, "srt");
  assert.equal(result.summary.cues, 2);
  assert.equal(result.summary.overlaps, 0);
  assert.equal(result.cues[0].metrics.durationMs, 2_000);
  assert.equal(result.cues[0].metrics.characters, 10);
  assert.equal(result.cues[0].metrics.words, 2);
  assert.equal(result.cues[0].metrics.cps, 5);
  assert.equal(result.cues[0].metrics.wpm, 60);
});

test("parses WebVTT identifiers, cue settings, and ignores metadata blocks", () => {
  const parsed = parseCaptionText(`WEBVTT
Kind: captions

NOTE generated locally
This is metadata

cue-a
00:01.000 --> 00:03.500 align:start position:20%
<v Speaker>Visible text</v>`);

  assert.equal(parsed.ok, true);
  assert.equal(parsed.format, "vtt");
  assert.equal(parsed.metadataBlocks, 1);
  assert.equal(parsed.cues.length, 1);
  assert.equal(parsed.cues[0].hasIdentifier, true);
  assert.equal(parsed.cues[0].startMs, 1_000);
  assert.equal(parsed.cues[0].endMs, 3_500);
});

test("reports invalid timestamps and nonpositive durations", () => {
  const result = auditCaptions(`1
00:00:XX,000 --> 00:00:02,000
Invalid timing

2
00:00:05,000 --> 00:00:05,000
Zero duration`);

  assert.equal(result.ok, true);
  assert.equal(result.summary.invalidBlocks, 1);
  assert.equal(result.findingCounts["invalid-timestamp"], 1);
  assert.equal(result.findingCounts["nonpositive-duration"], 1);
  assert.equal(result.summary.errors, 2);
});

test("detects overlaps, speed, duration, and line-limit findings", () => {
  const result = auditCaptions(
    `1
00:00:00,000 --> 00:00:02,000
First caption

2
00:00:01,500 --> 00:00:02,000
This line is deliberately long
second
third`,
    {
      maxCps: 10,
      maxWpm: 100,
      minDurationMs: 1_000,
      maxDurationMs: 4_000,
      maxLines: 2,
      maxCharsPerLine: 12,
    },
  );

  const rules = result.cues[1].findings.map((finding) => finding.rule);
  assert.deepEqual(
    new Set(rules),
    new Set([
      "overlap",
      "duration-too-short",
      "cps-too-high",
      "wpm-too-high",
      "too-many-lines",
      "line-too-long",
    ]),
  );
  assert.equal(result.cues[1].findings[0].evidence.overlapMs, 500);
});

test("values equal to configured maxima and minima do not fail", () => {
  const result = auditCaptions(
    `1
00:00:00,000 --> 00:00:01,000
12345678901234567890`,
    {
      ...DEFAULT_THRESHOLDS,
      maxCps: 20,
      minDurationMs: 1_000,
      maxDurationMs: 1_000,
      maxCharsPerLine: 20,
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.findingCounts["duration-too-short"], 0);
  assert.equal(result.findingCounts["duration-too-long"], 0);
  assert.equal(result.findingCounts["cps-too-high"], 0);
  assert.equal(result.findingCounts["line-too-long"], 0);
});

test("validates threshold relationships and integer line settings", () => {
  const validation = validateThresholds({
    ...DEFAULT_THRESHOLDS,
    minDurationMs: 3_000,
    maxDurationMs: 2_000,
    maxLines: 1.5,
  });

  assert.equal(validation.ok, false);
  assert.match(validation.errors.join(" "), /Maximum duration/u);
  assert.match(validation.errors.join(" "), /whole number/u);
});

test("counts-only report excludes cue content and identifying evidence", () => {
  const secret = "PRIVATE CAPTION 8675309";
  const result = auditCaptions(`private-cue-id
00:00:01,000 --> 00:00:03,000
${secret}`);
  const report = buildCountsOnlyCaptionReport(
    result,
    "2026-07-24T00:00:00.000Z",
  );
  const serialized = JSON.stringify(report);

  assert.equal(report.reportType, "caption-speed-collision-counts-only");
  assert.equal(serialized.includes(secret), false);
  assert.equal(serialized.includes("private-cue-id"), false);
  assert.equal(serialized.includes("00:00:01"), false);
  assert.equal("cues" in report, false);
});
