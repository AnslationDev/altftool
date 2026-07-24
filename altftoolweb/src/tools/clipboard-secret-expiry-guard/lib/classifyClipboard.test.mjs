import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyClipboardText,
  formatCountdown,
  normalizeExpirySeconds,
} from "./classifyClipboard.mjs";

test("classifies secrets without returning matched values", () => {
  const source = "OTP 482991, email test@example.com, token: abcdefghijk";
  const result = classifyClipboardText(source);
  assert.ok(result.signalCount >= 3);
  assert.equal(JSON.stringify(result).includes("482991"), false);
  assert.equal(JSON.stringify(result).includes("test@example.com"), false);
});

test("returns an empty calibrated result for ordinary text", () => {
  const result = classifyClipboardText("Meet near the station after lunch.");
  assert.equal(result.signalCount, 0);
  assert.deepEqual(result.signals, []);
});

test("bounds expiry between ten seconds and one hour", () => {
  assert.equal(normalizeExpirySeconds(2), 10);
  assert.equal(normalizeExpirySeconds(90), 90);
  assert.equal(normalizeExpirySeconds(9999), 3600);
});

test("formats a countdown consistently", () => {
  assert.equal(formatCountdown(0), "00:00");
  assert.equal(formatCountdown(125), "02:05");
});
