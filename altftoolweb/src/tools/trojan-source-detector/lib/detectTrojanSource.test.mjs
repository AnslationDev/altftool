import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTrojanSourceReport,
  detectTrojanSource,
  makeControlsVisible,
  MAX_SOURCE_CHARACTERS,
} from "./detectTrojanSource.mjs";

test("detects bidi controls with location and escaped evidence", () => {
  const result = detectTrojanSource("const safe = true;\n// \u202E } danger");
  assert.equal(result.ok, true);
  assert.equal(result.findings[0].id, "bidi-control");
  assert.equal(result.findings[0].line, 2);
  assert.equal(result.findings[0].codePoint, "U+202E");
  assert.match(result.visibleSource, /\\u\{202E\}/);
});

test("detects Latin and Cyrillic confusable identifiers", () => {
  const result = detectTrojanSource("const pаypal = 1;");
  const finding = result.findings.find(
    (item) => item.id === "mixed-script-identifier",
  );
  assert.ok(finding);
  assert.equal(finding.severity, "high");
  assert.deepEqual(finding.scripts, ["Latin", "Cyrillic"]);
  assert.equal(finding.skeleton, "paypal");
});

test("does not flag ordinary multilingual strings as identifiers unless scripts mix", () => {
  const result = detectTrojanSource('const greeting = "नमस्ते";');
  assert.equal(result.findings.length, 0);
});

test("makes controls visible and rejects oversized input", () => {
  assert.equal(makeControlsVisible(`a\u200Bb`), "a\\u{200B}b");
  assert.equal(
    detectTrojanSource("a".repeat(MAX_SOURCE_CHARACTERS + 1)).ok,
    false,
  );
});

test("builds a report without raw source", () => {
  const result = detectTrojanSource("const pаypal = 1;");
  const report = buildTrojanSourceReport(result);
  assert.match(report, /Mixed-script identifier/);
  assert.equal(report.includes("const pаypal"), false);
});

test("caps adversarial control input without scanning quadratically", () => {
  const source = "\u202E".repeat(MAX_SOURCE_CHARACTERS);
  const started = performance.now();
  const result = detectTrojanSource(source);
  const elapsed = performance.now() - started;
  assert.equal(result.findings.length, 300);
  assert.equal(result.counts.high, MAX_SOURCE_CHARACTERS);
  assert.equal(result.truncated, true);
  assert.ok(elapsed < 1_500, `scan took ${elapsed.toFixed(0)} ms`);
});

test("retains a later high-severity cue after the display cap is reached", () => {
  const result = detectTrojanSource(
    `${"\u200B".repeat(400)}\nconst pаypal = 1;`,
  );
  assert.equal(result.counts.medium, 400);
  assert.equal(result.counts.high, 1);
  assert.equal(result.findings.length, 300);
  assert.equal(
    result.findings.some((finding) => finding.id === "mixed-script-identifier"),
    true,
  );
  assert.equal(result.level, "high");
  assert.equal(result.truncated, true);
});
