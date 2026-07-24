import assert from "node:assert/strict";
import test from "node:test";

import {
  CVD_MATRICES,
  analyzePalette,
  buildPrivacySafeCountsReport,
  contrastRatio,
  normalizeHex,
  oklabScreeningDistance,
  simulateColor,
  validatePaletteRows,
} from "./paletteAnalysis.mjs";

test("normalizes only exact opaque six-digit hex colors", () => {
  assert.equal(normalizeHex("#a1b2c3"), "#A1B2C3");
  assert.equal(normalizeHex(" #ABCDEF "), "#ABCDEF");
  assert.equal(normalizeHex("#fff"), null);
  assert.equal(normalizeHex("#11223344"), null);
  assert.equal(normalizeHex("#GG0000"), null);
  assert.equal(normalizeHex("112233"), null);
});

test("rejects alpha values and reports their row", () => {
  const result = validatePaletteRows([
    { hex: "#11223344" },
    { hex: "#FFFFFF" },
  ]);
  assert.equal(result.valid, false);
  assert.equal(result.issues[0].rowIndex, 0);
  assert.match(result.issues[0].message, /without alpha/iu);
});

test("computes exact black and white contrast boundaries", () => {
  assert.equal(contrastRatio("#000000", "#FFFFFF"), 21);
  assert.equal(contrastRatio("#FFFFFF", "#FFFFFF"), 1);
});

test("fixed matrices preserve black and white endpoints", () => {
  assert.deepEqual(Object.keys(CVD_MATRICES), [
    "protanopia",
    "deuteranopia",
    "tritanopia",
  ]);
  for (const mode of Object.keys(CVD_MATRICES)) {
    assert.equal(simulateColor("#000000", mode), "#000000");
    assert.equal(simulateColor("#FFFFFF", mode), "#FFFFFF");
  }
});

test("simulation is deterministic and rejects unsupported modes", () => {
  assert.equal(simulateColor("#FF0000", "protanopia"), "#6D5F00");
  assert.equal(
    simulateColor("#E63946", "deuteranopia"),
    simulateColor("#E63946", "deuteranopia"),
  );
  assert.throws(
    () => simulateColor("#E63946", "unknown"),
    /Unsupported simulation mode/iu,
  );
});

test("duplicate colors remain a zero-distance screening cue", () => {
  const result = analyzePalette([
    { id: "a", hex: "#1D4ED8", label: "First", role: "accent" },
    { id: "b", hex: "#1d4ed8", label: "Second", role: "data" },
  ]);
  assert.equal(result.counts.duplicates, 1);
  assert.equal(result.pairs[0].minimumDistance, 0);
  assert.equal(result.pairs[0].cue, "very-close");
  assert.equal(oklabScreeningDistance("#ABCDEF", "#ABCDEF"), 0);
});

test("creates contrast checks only for text and background roles", () => {
  const result = analyzePalette([
    { id: "text", hex: "#000000", role: "text" },
    { id: "background", hex: "#FFFFFF", role: "background" },
    { id: "status", hex: "#D97706", role: "status" },
  ]);
  assert.equal(result.contrastPairs.length, 1);
  assert.equal(result.contrastPairs[0].ratio, 21);
  assert.equal(result.contrastPairs[0].normalTextMeets45, true);
});

test("does not invent contrast checks without both relevant roles", () => {
  const result = analyzePalette([
    { hex: "#2563EB", role: "accent" },
    { hex: "#7C3AED", role: "data" },
  ]);
  assert.equal(result.contrastPairs.length, 0);
});

test("bounded alternative search is deterministic", () => {
  const palette = [
    { id: "first", hex: "#2F6FED", role: "accent" },
    { id: "second", hex: "#2F6FED", role: "data" },
    { id: "canvas", hex: "#FFFFFF", role: "background" },
  ];
  const firstRun = analyzePalette(palette).suggestions;
  const secondRun = analyzePalette(palette).suggestions;
  assert.deepEqual(firstRun, secondRun);
  assert.ok(firstRun.length >= 1);
  assert.ok(
    firstRun.every(
      (suggestion) =>
        suggestion.afterDistance > suggestion.beforeDistance &&
        suggestion.contrastPreserved,
    ),
  );
});

test("text suggestions never reduce any applicable authored contrast pair", () => {
  const result = analyzePalette([
    { id: "text", hex: "#767676", role: "text" },
    { id: "duplicate", hex: "#767676", role: "accent" },
    { id: "paper", hex: "#FFFFFF", role: "background" },
  ]);
  const suggestion = result.suggestions.find((item) => item.id === "text");
  assert.ok(suggestion);
  assert.equal(suggestion.relevantContrastPairs, 1);
  assert.ok(
    suggestion.minimumContrastAfter >= suggestion.minimumContrastBefore,
  );
});

test("maximum palette size and too-few valid rows are bounded", () => {
  const tooMany = Array.from({ length: 13 }, (_, index) => ({
    hex: `#${index.toString(16).padStart(6, "0")}`,
  }));
  assert.equal(validatePaletteRows(tooMany).valid, false);
  assert.match(validatePaletteRows(tooMany).issues[0].message, /at most 12/iu);
  assert.throws(() => analyzePalette([{ hex: "#000000" }]), /at least two/iu);
});

test("privacy-safe export excludes entered values and identities", () => {
  const analysis = analyzePalette([
    {
      id: "private-name",
      label: "Confidential launch state",
      hex: "#FF0000",
      role: "status",
    },
    {
      id: "other",
      label: "Secret comparison",
      hex: "#00FF00",
      role: "data",
    },
  ]);
  const serialized = JSON.stringify(buildPrivacySafeCountsReport(analysis));
  assert.doesNotMatch(serialized, /Confidential|Secret|#FF0000|private-name/iu);
  assert.match(serialized, /Counts only/iu);
});
