import assert from "node:assert/strict";
import test from "node:test";

import { parseSrt, srtToTranscript } from "./lib.js";

test("parser does not swallow the next cue when a blank separator is missing", () => {
  const raw = [
    "1",
    "00:00:00,000 --> 00:00:01,000",
    "Hello",
    "2",
    "00:00:02,000 --> 00:00:03,000",
    "World",
  ].join("\n");

  const parsed = parseSrt(raw);
  assert.equal(parsed.cues.length, 2);
  assert.deepEqual(parsed.cues.map((cue) => cue.lines), [["Hello"], ["World"]]);
  assert.equal(srtToTranscript(raw).transcript, "Hello World\n");
});

test("filtered sound cues do not bridge a long paragraph gap", () => {
  const raw = [
    "1",
    "00:00:00,000 --> 00:00:01,000",
    "Hello",
    "",
    "2",
    "00:00:01,000 --> 00:01:40,000",
    "[MUSIC]",
    "",
    "3",
    "00:01:40,000 --> 00:01:41,000",
    "World",
  ].join("\n");

  const result = srtToTranscript(raw, { paragraphGapMs: 1500 });
  assert.equal(result.paragraphCount, 2);
  assert.equal(result.transcript, "Hello\n\nWorld\n");
  assert.equal(result.soundCuesRemoved, 1);
});

test("speaking-rate span ignores filtered leading and trailing sound cues", () => {
  const raw = [
    "1",
    "00:00:00,000 --> 00:00:10,000",
    "[MUSIC]",
    "",
    "2",
    "00:00:10,000 --> 00:00:20,000",
    "hello world",
    "",
    "3",
    "00:00:20,000 --> 00:01:40,000",
    "[MUSIC]",
  ].join("\n");

  const result = srtToTranscript(raw);
  assert.equal(result.durationMs, 10_000);
  assert.equal(result.speakingRateWpm, 12);
});
