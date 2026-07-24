import assert from "node:assert/strict";
import test from "node:test";

import {
  detectSensitiveText,
  evaluateImageEvidence,
  evaluatePdfEvidence,
  inspectRasterPixels,
} from "./evaluateEvidence.mjs";

test("detectSensitiveText reports categories and pages without returning matched values", () => {
  const findings = detectSensitiveText([
    { page: 1, text: "Contact hidden@example.com or 9876543210." },
    { page: 2, text: "PAN: ABCDE1234F" },
  ]);

  assert.deepEqual(
    findings.map(({ id, count, pages }) => ({ id, count, pages })),
    [
      { id: "pan", count: 1, pages: [2] },
      { id: "email", count: 1, pages: [1] },
      { id: "phone", count: 1, pages: [1] },
    ],
  );
  assert.equal(JSON.stringify(findings).includes("hidden@example.com"), false);
});

test("PDF evaluator treats extractable identifiers and unapplied redactions as high risk", () => {
  const result = evaluatePdfEvidence({
    pageCount: 2,
    textPages: [{ page: 1, text: "ABCDE1234F" }],
    annotations: [{ page: 1, subtype: "Redact" }],
    imageCount: 0,
    metadata: {},
  });

  assert.equal(result.verdict.level, "high");
  assert.ok(result.findings.some((finding) => finding.id === "extractable-sensitive-text"));
  assert.ok(result.findings.some((finding) => finding.id === "unapplied-redaction-annotations"));
});

test("PDF evaluator never calls a clean scan proof", () => {
  const result = evaluatePdfEvidence({
    pageCount: 1,
    textPages: [{ page: 1, text: "Public brochure" }],
    annotations: [],
    imageCount: 0,
    metadata: {},
  });

  assert.equal(result.verdict.level, "limited");
  assert.match(result.verdict.summary, /not proof/i);
});

test("pixel inspection detects transparency and long near-black runs", () => {
  const width = 10;
  const height = 4;
  const pixels = new Uint8ClampedArray(width * height * 4).fill(255);

  for (let x = 1; x < 9; x += 1) {
    const offset = (width + x) * 4;
    pixels[offset] = 0;
    pixels[offset + 1] = 0;
    pixels[offset + 2] = 0;
  }
  pixels[3] = 100;

  const evidence = inspectRasterPixels(pixels, width, height);
  assert.equal(evidence.transparentPixels, 1);
  assert.equal(evidence.nearBlackPixels, 8);
  assert.equal(evidence.darkBandRows, 1);
});

test("image evaluator requires manual visual review even without metadata signals", () => {
  const result = evaluateImageEvidence({
    width: 100,
    height: 100,
    totalPixels: 10000,
    transparentPixels: 0,
    nearBlackPixels: 0,
    darkBandRows: 0,
    metadataMarkers: [],
  });

  assert.equal(result.verdict.level, "review");
  assert.ok(result.findings.some((finding) => finding.id === "visual-content-limit"));
  assert.match(result.limitations.join(" "), /not mathematical/i);
});
