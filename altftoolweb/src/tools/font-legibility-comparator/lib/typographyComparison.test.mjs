import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_TYPOGRAPHY,
  FONT_PRESETS,
  applyTextSpacingStress,
  buildPreviewStyle,
  buildTypographyReport,
  normalizeTypographySettings,
  summarizeText,
} from "./typographyComparison.mjs";

test("normalizes settings into bounded safe presets", () => {
  const result = normalizeTypographySettings({
    preset: "remote-font",
    fontSize: 500,
    lineHeight: 0,
    letterSpacing: 10,
    wordSpacing: -2,
    measure: 2,
    weight: 999,
  });
  assert.equal(result.preset, DEFAULT_TYPOGRAPHY.preset);
  assert.equal(result.fontSize, 48);
  assert.equal(result.lineHeight, 1);
  assert.equal(result.letterSpacing, 0.3);
  assert.equal(result.wordSpacing, 0);
  assert.equal(result.measure, 28);
  assert.equal(result.weight, 400);
});

test("preview styles only use whitelisted local fallback stacks", () => {
  const style = buildPreviewStyle({ preset: "serif", fontSize: 20 });
  assert.equal(style.fontFamily, FONT_PRESETS.serif.stack);
  assert.equal(style.fontSize, "20px");
  assert.equal(style.maxWidth, "65ch");
});

test("spacing stress applies the WCAG test override values as minimums", () => {
  const stressed = applyTextSpacingStress({
    lineHeight: 1.2,
    letterSpacing: 0,
    wordSpacing: 0,
    paragraphSpacing: 0,
  });
  assert.equal(stressed.lineHeight, 1.5);
  assert.equal(stressed.letterSpacing, 0.12);
  assert.equal(stressed.wordSpacing, 0.16);
  assert.equal(stressed.paragraphSpacing, 2);
});

test("spacing stress preserves already larger user values", () => {
  const stressed = applyTextSpacingStress({
    lineHeight: 2,
    letterSpacing: 0.2,
    wordSpacing: 0.3,
    paragraphSpacing: 2.5,
  });
  assert.equal(stressed.lineHeight, 2);
  assert.equal(stressed.letterSpacing, 0.2);
  assert.equal(stressed.wordSpacing, 0.3);
  assert.equal(stressed.paragraphSpacing, 2.5);
});

test("summarizes multilingual text without retaining it", () => {
  const result = summarizeText("Hello world\n\nनमस्ते दुनिया");
  assert.equal(result.paragraphs, 2);
  assert.equal(result.scripts.latin, true);
  assert.equal(result.scripts.devanagari, true);
  assert.equal(result.scriptCount, 2);
});

test("bounds unusually long comparison text", () => {
  const result = summarizeText("a".repeat(25_000));
  assert.equal(result.characters, 20_000);
  assert.equal(result.truncated, true);
});

test("privacy-safe report excludes sample text and declares no winner", () => {
  const report = buildTypographyReport({
    text: "PRIVATE READING SAMPLE",
    left: { preset: "system" },
    right: { preset: "serif" },
  });
  assert.equal(
    JSON.stringify(report).includes("PRIVATE READING SAMPLE"),
    false,
  );
  assert.equal(report.scope.readabilityWinnerDeclared, false);
  assert.equal(report.scope.externalFontsLoaded, false);
});
