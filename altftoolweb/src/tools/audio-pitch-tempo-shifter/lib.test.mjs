import assert from "node:assert/strict";
import test from "node:test";

import {
  atempoChain,
  planShift,
  shiftRatio,
  transposeNote,
} from "./lib.js";

test("uses twelve-tone equal temperament for pitch shifts", () => {
  assert.ok(Math.abs(shiftRatio(12).ratio - 2) < 1e-12);
  assert.equal(transposeNote("B", 1).note, "C");
});

test("splits extreme tempo factors into legal ffmpeg filters", () => {
  const chain = atempoChain(4).chain;
  assert.equal(chain.length, 2);
  assert.ok(chain.every((factor) => factor >= 0.5 && factor <= 2));
  assert.ok(Math.abs(chain.reduce((total, factor) => total * factor, 1) - 4) < 1e-12);
});

test("plans independent pitch and tempo changes deterministically", () => {
  const result = planShift({
    semitones: 12,
    tempoPercent: 50,
    durationSeconds: 120,
    sampleRate: 44100,
    bpm: 120,
    sourceKey: "C",
  });

  assert.equal(result.newSeconds, 240);
  assert.equal(result.resampleRate, 88200);
  assert.equal(result.newBpm, 60);
  assert.match(result.ffmpegResample, /^ffmpeg -i input\.wav/);
});
