import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeBase64ToText,
  encodeTextToBase64,
  normalizeBase64,
} from "./decodeBase64.js";

test("decodes plain ASCII", () => {
  const r = decodeBase64ToText("SGVsbG8sIERldmVsb3BlciE=");
  assert.equal(r.ok, true);
  assert.equal(r.text, "Hello, Developer!");
});

test("decodes the built-in sample lines", () => {
  assert.equal(decodeBase64ToText("V2VsY29tZSB0byBCYXNlNjQg").text, "Welcome to Base64 ");
  assert.equal(decodeBase64ToText("VG8gQVNDSUkgQ29udmVydGVyIQ==").text, "To ASCII Converter!");
});

test("decodes multiple independent Base64 lines (each self-padded)", () => {
  // Concatenated these would be invalid (internal '='), so this exercises the
  // per-line fallback — exactly the built-in Sample Data shape.
  const sample =
    "SGVsbG8sIERldmVsb3BlciE=\nV2VsY29tZSB0byBCYXNlNjQg\nVG8gQVNDSUkgQ29udmVydGVyIQ==";
  const r = decodeBase64ToText(sample);
  assert.equal(r.ok, true);
  assert.equal(r.text, "Hello, Developer!\nWelcome to Base64 \nTo ASCII Converter!");
});

test("decodes MIME-style soft-wrapped single message (one blob across lines)", () => {
  const original = "The quick brown fox jumps over the lazy dog, repeatedly and thoroughly.";
  const b64 = encodeTextToBase64(original);
  const wrapped = b64.replace(/(.{20})/g, "$1\n"); // soft-wrap every 20 chars
  assert.equal(decodeBase64ToText(wrapped).text, original);
});

test("ignores whitespace and newlines inside the input", () => {
  const r = decodeBase64ToText("SGVsb\nG8s  IERl\tdmVsb3BlciE=");
  assert.equal(r.text, "Hello, Developer!");
});

test("decodes multi-byte UTF-8 correctly", () => {
  const original = "Café — π ≈ 3.14 😀";
  const r = decodeBase64ToText(encodeTextToBase64(original));
  assert.equal(r.ok, true);
  assert.equal(r.text, original);
});

test("accepts URL-safe base64", () => {
  // "??? >>>" style bytes that use - and _ in URL-safe form
  const std = encodeTextToBase64("subjects?_id=1");
  const urlSafe = std.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  assert.equal(decodeBase64ToText(urlSafe).text, "subjects?_id=1");
});

test("empty input is ok and flagged empty", () => {
  const r = decodeBase64ToText("   ");
  assert.equal(r.ok, true);
  assert.equal(r.empty, true);
  assert.equal(r.text, "");
});

test("rejects stray non-base64 characters", () => {
  const r = decodeBase64ToText("Hello, World!");
  assert.equal(r.ok, false);
  assert.match(r.error, /valid Base64/);
});

test("rejects an impossible length (mod 4 === 1)", () => {
  const r = decodeBase64ToText("SGVsbG8sIERldmVsb3BlciEx"); // 24 chars ok
  assert.equal(r.ok, true);
  const bad = decodeBase64ToText("SGVsbG8sIERldmVsb3BlciEQQ"); // 25 chars → mod 4 = 1
  assert.equal(bad.ok, false);
});

test("reports decoded byte count", () => {
  const r = decodeBase64ToText(encodeTextToBase64("abcdef"));
  assert.equal(r.bytes, 6);
});

test("normalizeBase64 strips whitespace and folds url-safe", () => {
  assert.equal(normalizeBase64("ab-_ cd\n"), "ab+/cd");
});
