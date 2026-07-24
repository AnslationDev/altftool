import assert from "node:assert/strict";
import test from "node:test";

import { buildAltTextCountsReport, reviewAltText } from "./reviewAltText.mjs";

test("decorative image with explicit empty alt clears configured cues", () => {
  const result = reviewAltText({
    purpose: "decorative",
    altState: "empty",
  });
  assert.equal(result.outcome, "no-configured-cue");
  assert.equal(result.findings.length, 0);
  assert.equal(result.suggestedDraft, "");
});

test("missing alt is distinct from explicitly empty alt", () => {
  const result = reviewAltText({
    purpose: "decorative",
    altState: "missing",
  });
  assert.equal(result.counts.errors, 1);
  assert.equal(result.findings[0].id, "missing-alt-attribute");
});

test("meaningful image cannot rely on an empty alt", () => {
  const result = reviewAltText({
    purpose: "informative",
    altState: "empty",
  });
  assert.equal(
    result.findings.some((item) => item.id === "empty-for-meaningful-image"),
    true,
  );
});

test("functional review uses entered action purpose without inventing text", () => {
  const result = reviewAltText({
    purpose: "functional",
    altState: "present",
    altText: "Search",
    actionPurpose: "Search the product catalog",
  });
  assert.equal(result.suggestedDraft, "Search the product catalog");
  assert.equal(result.altText, "Search");
});

test("complex image requires a longer equivalent", () => {
  const result = reviewAltText({
    purpose: "complex",
    altState: "present",
    altText: "Quarterly sales chart",
    essentialInformation: "Sales rose in every quarter",
    longerAlternativeAvailable: false,
  });
  assert.equal(
    result.findings.some((item) => item.id === "complex-alternative-missing"),
    true,
  );
});

test("flags generic values, filenames, and redundant prefixes", () => {
  assert.equal(
    reviewAltText({
      purpose: "informative",
      altState: "present",
      altText: "image",
    }).findings.some((item) => item.id === "generic-alt"),
    true,
  );
  assert.equal(
    reviewAltText({
      purpose: "informative",
      altState: "present",
      altText: "hero-banner.jpg",
    }).findings.some((item) => item.id === "filename-alt"),
    true,
  );
  assert.equal(
    reviewAltText({
      purpose: "informative",
      altState: "present",
      altText: "Photo of a red bicycle",
    }).findings.some((item) => item.id === "redundant-object-prefix"),
    true,
  );
});

test("nearby text duplication is review-only", () => {
  const result = reviewAltText({
    purpose: "informative",
    altState: "present",
    altText: "Revenue grew 20 percent",
    nearbyText: "Revenue grew 20 percent",
  });
  assert.equal(
    result.findings.some((item) => item.id === "duplicates-nearby-text"),
    true,
  );
  assert.equal(result.counts.errors, 0);
});

test("word coverage remains a calibrated human-review cue", () => {
  const result = reviewAltText({
    purpose: "informative",
    altState: "present",
    altText: "A chart",
    essentialInformation:
      "Revenue increased while operating expenses decreased",
  });
  assert.equal(
    result.findings.some(
      (item) => item.id === "essential-information-low-coverage",
    ),
    true,
  );
});

test("does not impose a false universal character limit", () => {
  const result = reviewAltText({
    purpose: "informative",
    altState: "present",
    altText: "Detailed context ".repeat(20),
  });
  const finding = result.findings.find((item) => item.id === "long-alt-review");
  assert.match(finding.message, /does not set a universal character limit/i);
  assert.equal(finding.severity, "review");
});

test("counts report excludes all entered text and draft content", () => {
  const result = reviewAltText({
    purpose: "functional",
    altState: "present",
    altText: "PRIVATE ALT",
    actionPurpose: "PRIVATE ACTION",
    nearbyText: "PRIVATE NEARBY",
  });
  const report = buildAltTextCountsReport(result);
  const serialized = JSON.stringify(report);
  assert.equal(serialized.includes("PRIVATE ALT"), false);
  assert.equal(serialized.includes("PRIVATE ACTION"), false);
  assert.equal(serialized.includes("PRIVATE NEARBY"), false);
  assert.equal(report.scope.conformanceEstablished, false);
});
