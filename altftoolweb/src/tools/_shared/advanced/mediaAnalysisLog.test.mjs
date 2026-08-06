import assert from "node:assert/strict";
import test from "node:test";

import {
  MEDIA_ANALYSIS_LOG_LIMITS,
  captureMediaAnalysisLine,
  createMediaAnalysisLog,
  formatMediaAnalysisLog,
} from "./mediaAnalysisLog.js";

test("analysis capture stays bounded while retaining early and late cue lines", () => {
  const capture = createMediaAnalysisLog();
  captureMediaAnalysisLine(capture, "silence_start: 0.25");
  for (let index = 0; index < 10_000; index += 1) {
    captureMediaAnalysisLine(capture, `Parsed_astats_${index}: RMS level dB: -${index}`);
  }
  captureMediaAnalysisLine(capture, "silence_end: 42.5");

  assert.equal(capture.priorityHead.length, MEDIA_ANALYSIS_LOG_LIMITS.priorityHead);
  assert.equal(capture.priorityTail.length, MEDIA_ANALYSIS_LOG_LIMITS.priorityTail);
  assert.equal(capture.recent.length, MEDIA_ANALYSIS_LOG_LIMITS.recent);
  const report = formatMediaAnalysisLog(capture);
  assert.match(report, /silence_start: 0\.25/iu);
  assert.match(report, /silence_end: 42\.5/iu);
  assert.match(report, /analysis cue line\(s\) omitted/iu);
  assert.ok(report.length < 2_000_000);
});

test("capture truncates a pathological single line", () => {
  const capture = createMediaAnalysisLog();
  captureMediaAnalysisLine(capture, `showinfo ${"x".repeat(20_000)}`);
  const report = formatMediaAnalysisLog(capture);
  assert.match(report, /line truncated/iu);
  assert.ok(report.length < 10_000);
});
